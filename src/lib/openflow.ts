export enum OpenFlowVersion {
  OF_10 = 0x01,
  OF_13 = 0x04,
  OF_14 = 0x05
}

export enum MessageType {
  HELLO = 0,
  ERROR = 1,
  ECHO_REQUEST = 2,
  ECHO_REPLY = 3,
  FEATURES_REQUEST = 5,
  FEATURES_REPLY = 6,
  FLOW_MOD = 14,
  PACKET_IN = 10,
  PACKET_OUT = 13
}

export interface OpenFlowMessage {
  version: OpenFlowVersion;
  type: MessageType;
  length: number;
  xid: number;
  data?: any;
}

export interface FlowModMessage {
  cookie: bigint;
  command: FlowModCommand;
  idleTimeout: number;
  hardTimeout: number;
  priority: number;
  bufferId: number;
  outPort: number;
  flags: number;
  match: OpenFlowMatch;
  actions: OpenFlowAction[];
}

export enum FlowModCommand {
  ADD = 0,
  MODIFY = 1,
  DELETE = 2,
  DELETE_STRICT = 3
}

export interface OpenFlowMatch {
  wildcards: number;
  inPort: number;
  dlSrc: Buffer;
  dlDst: Buffer;
  dlVlan: number;
  dlType: number;
  nwSrc: number;
  nwDst: number;
  tpSrc: number;
  tpDst: number;
}

export interface OpenFlowAction {
  type: ActionType;
  length: number;
  port?: number;
  maxLen?: number;
}

export enum ActionType {
  OUTPUT = 0,
  SET_VLAN_VID = 1,
  SET_VLAN_PCP = 2,
  STRIP_VLAN = 3,
  SET_DL_SRC = 4,
  SET_DL_DST = 5,
  SET_NW_SRC = 6,
  SET_NW_DST = 7,
  SET_TP_SRC = 8,
  SET_TP_DST = 9
}

export class OpenFlowProtocol {
  static createHelloMessage(version: OpenFlowVersion = OpenFlowVersion.OF_13): OpenFlowMessage {
    return {
      version,
      type: MessageType.HELLO,
      length: 8,
      xid: Math.floor(Math.random() * 0xFFFFFFFF)
    };
  }

  static createFlowMod(flowMod: FlowModMessage): OpenFlowMessage {
    return {
      version: OpenFlowVersion.OF_13,
      type: MessageType.FLOW_MOD,
      length: 56 + (flowMod.actions.length * 8),
      xid: Math.floor(Math.random() * 0xFFFFFFFF),
      data: flowMod
    };
  }

  static createPacketOut(bufferId: number, inPort: number, actions: OpenFlowAction[], data?: Buffer): OpenFlowMessage {
    return {
      version: OpenFlowVersion.OF_13,
      type: MessageType.PACKET_OUT,
      length: 24 + (actions.length * 8) + (data?.length || 0),
      xid: Math.floor(Math.random() * 0xFFFFFFFF),
      data: { bufferId, inPort, actions, data }
    };
  }

  static parseMessage(buffer: Buffer): OpenFlowMessage {
    const version = buffer.readUInt8(0);
    const type = buffer.readUInt8(1);
    const length = buffer.readUInt16BE(2);
    const xid = buffer.readUInt32BE(4);

    return { version, type, length, xid };
  }

  static serializeMessage(message: OpenFlowMessage): Buffer {
    const buffer = Buffer.alloc(message.length);
    buffer.writeUInt8(message.version, 0);
    buffer.writeUInt8(message.type, 1);
    buffer.writeUInt16BE(message.length, 2);
    buffer.writeUInt32BE(message.xid, 4);
    return buffer;
  }
}