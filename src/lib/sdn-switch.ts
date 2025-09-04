import { EventEmitter } from 'events';
import { SDNFlow, FlowMatch, FlowAction } from './sdn-core';
import { OpenFlowMessage, MessageType, FlowModMessage, FlowModCommand } from './openflow';

export interface SwitchPort {
  portNo: number;
  hwAddr: string;
  name: string;
  config: number;
  state: number;
  curr: number;
  advertised: number;
  supported: number;
  peer: number;
}

export interface FlowTable {
  tableId: number;
  flows: Map<string, SDNFlow>;
  missAction: 'drop' | 'controller' | 'continue';
}

export class SDNSwitch extends EventEmitter {
  private dpid: string;
  private ports: Map<number, SwitchPort> = new Map();
  private flowTables: Map<number, FlowTable> = new Map();
  private connected: boolean = false;
  private controllerSocket?: any;

  constructor(dpid: string) {
    super();
    this.dpid = dpid;
    this.initializeFlowTables();
  }

  private initializeFlowTables(): void {
    // Table 0: L2 Learning
    this.flowTables.set(0, {
      tableId: 0,
      flows: new Map(),
      missAction: 'controller'
    });

    // Table 1: L3 Routing
    this.flowTables.set(1, {
      tableId: 1,
      flows: new Map(),
      missAction: 'drop'
    });
  }

  addPort(port: SwitchPort): void {
    this.ports.set(port.portNo, port);
    this.emit('portAdded', port);
  }

  removePort(portNo: number): void {
    const port = this.ports.get(portNo);
    if (port) {
      this.ports.delete(portNo);
      this.emit('portRemoved', port);
    }
  }

  installFlow(flow: SDNFlow): boolean {
    const tableId = flow.tableId || 0;
    const table = this.flowTables.get(tableId);
    
    if (!table) return false;

    table.flows.set(flow.id, flow);
    this.emit('flowInstalled', flow);
    return true;
  }

  removeFlow(flowId: string, tableId: number = 0): boolean {
    const table = this.flowTables.get(tableId);
    if (!table) return false;

    const removed = table.flows.delete(flowId);
    if (removed) {
      this.emit('flowRemoved', flowId);
    }
    return removed;
  }

  processPacket(packet: any, inPort: number): void {
    // Start from table 0
    const matchedFlow = this.matchPacket(packet, 0);
    
    if (matchedFlow) {
      this.executeActions(packet, matchedFlow.actions, inPort);
    } else {
      // Table miss - send to controller
      this.sendPacketIn(packet, inPort);
    }
  }

  private matchPacket(packet: any, tableId: number): SDNFlow | null {
    const table = this.flowTables.get(tableId);
    if (!table) return null;

    // Sort flows by priority (highest first)
    const flows = Array.from(table.flows.values())
      .sort((a, b) => b.priority - a.priority);

    for (const flow of flows) {
      if (this.matchesFlow(packet, flow.match)) {
        return flow;
      }
    }

    return null;
  }

  private matchesFlow(packet: any, match: FlowMatch): boolean {
    if (match.ethSrc && packet.ethSrc !== match.ethSrc) return false;
    if (match.ethDst && packet.ethDst !== match.ethDst) return false;
    if (match.ipSrc && packet.ipSrc !== match.ipSrc) return false;
    if (match.ipDst && packet.ipDst !== match.ipDst) return false;
    if (match.tcpSrc && packet.tcpSrc !== match.tcpSrc) return false;
    if (match.tcpDst && packet.tcpDst !== match.tcpDst) return false;
    
    return true;
  }

  private executeActions(packet: any, actions: FlowAction[], inPort: number): void {
    for (const action of actions) {
      switch (action.type) {
        case 'output':
          if (action.port) {
            this.outputPacket(packet, action.port);
          }
          break;
        case 'drop':
          // Packet is dropped
          break;
        case 'forward':
          this.forwardPacket(packet, inPort);
          break;
        case 'modify':
          this.modifyPacket(packet, action.value);
          break;
      }
    }
  }

  private outputPacket(packet: any, port: number): void {
    const switchPort = this.ports.get(port);
    if (switchPort) {
      this.emit('packetOut', { packet, port: switchPort });
    }
  }

  private forwardPacket(packet: any, inPort: number): void {
    // Flood to all ports except input port
    for (const [portNo, port] of this.ports) {
      if (portNo !== inPort) {
        this.outputPacket(packet, portNo);
      }
    }
  }

  private modifyPacket(packet: any, modification?: string): void {
    if (modification) {
      // Apply packet modifications
      Object.assign(packet, JSON.parse(modification));
    }
  }

  private sendPacketIn(packet: any, inPort: number): void {
    this.emit('packetIn', { packet, inPort, dpid: this.dpid });
  }

  handleOpenFlowMessage(message: OpenFlowMessage): void {
    switch (message.type) {
      case MessageType.FLOW_MOD:
        this.handleFlowMod(message.data as FlowModMessage);
        break;
      case MessageType.PACKET_OUT:
        this.handlePacketOut(message.data);
        break;
      case MessageType.ECHO_REQUEST:
        this.sendEchoReply(message.xid);
        break;
    }
  }

  private handleFlowMod(flowMod: FlowModMessage): void {
    const flow: SDNFlow = {
      id: `flow-${Date.now()}`,
      priority: flowMod.priority,
      match: this.convertOpenFlowMatch(flowMod.match),
      actions: this.convertOpenFlowActions(flowMod.actions)
    };

    switch (flowMod.command) {
      case FlowModCommand.ADD:
        this.installFlow(flow);
        break;
      case FlowModCommand.DELETE:
        this.removeFlow(flow.id);
        break;
    }
  }

  private handlePacketOut(data: any): void {
    this.executeActions(data.data, data.actions, data.inPort);
  }

  private sendEchoReply(xid: number): void {
    this.emit('sendMessage', {
      version: 0x04,
      type: MessageType.ECHO_REPLY,
      length: 8,
      xid
    });
  }

  private convertOpenFlowMatch(ofMatch: any): FlowMatch {
    return {
      inPort: ofMatch.inPort,
      ethSrc: ofMatch.dlSrc?.toString('hex'),
      ethDst: ofMatch.dlDst?.toString('hex'),
      ipSrc: this.intToIp(ofMatch.nwSrc),
      ipDst: this.intToIp(ofMatch.nwDst),
      tcpSrc: ofMatch.tpSrc,
      tcpDst: ofMatch.tpDst
    };
  }

  private convertOpenFlowActions(ofActions: any[]): FlowAction[] {
    return ofActions.map(action => ({
      type: this.mapActionType(action.type),
      port: action.port
    }));
  }

  private mapActionType(ofType: number): 'output' | 'drop' | 'forward' | 'modify' {
    switch (ofType) {
      case 0: return 'output';
      default: return 'drop';
    }
  }

  private intToIp(int: number): string {
    return [
      (int >>> 24) & 0xFF,
      (int >>> 16) & 0xFF,
      (int >>> 8) & 0xFF,
      int & 0xFF
    ].join('.');
  }

  getStats() {
    return {
      dpid: this.dpid,
      ports: Array.from(this.ports.values()),
      flowCount: Array.from(this.flowTables.values())
        .reduce((sum, table) => sum + table.flows.size, 0),
      connected: this.connected
    };
  }
}