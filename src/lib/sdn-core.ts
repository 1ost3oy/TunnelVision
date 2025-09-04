export interface SDNNode {
  id: string;
  name: string;
  ip: string;
  role: 'controller' | 'switch' | 'host';
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];
}

export interface SDNFlow {
  id: string;
  priority: number;
  match: FlowMatch;
  actions: FlowAction[];
  tableId?: number;
}

export interface FlowMatch {
  inPort?: number;
  ethSrc?: string;
  ethDst?: string;
  ipSrc?: string;
  ipDst?: string;
  tcpSrc?: number;
  tcpDst?: number;
}

export interface FlowAction {
  type: 'output' | 'drop' | 'forward' | 'modify';
  port?: number;
  value?: string;
}

export class SDNController {
  private nodes: Map<string, SDNNode> = new Map();
  private flows: Map<string, SDNFlow> = new Map();
  private topology: Map<string, string[]> = new Map();

  addNode(node: SDNNode): void {
    this.nodes.set(node.id, node);
    this.topology.set(node.id, []);
  }

  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    this.topology.delete(nodeId);
    this.topology.forEach(neighbors => {
      const index = neighbors.indexOf(nodeId);
      if (index > -1) neighbors.splice(index, 1);
    });
  }

  addFlow(flow: SDNFlow): void {
    this.flows.set(flow.id, flow);
  }

  removeFlow(flowId: string): void {
    this.flows.delete(flowId);
  }

  getShortestPath(srcId: string, dstId: string): string[] {
    const visited = new Set<string>();
    const queue: { nodeId: string; path: string[] }[] = [{ nodeId: srcId, path: [srcId] }];

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      
      if (nodeId === dstId) return path;
      if (visited.has(nodeId)) continue;
      
      visited.add(nodeId);
      const neighbors = this.topology.get(nodeId) || [];
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({ nodeId: neighbor, path: [...path, neighbor] });
        }
      }
    }
    
    return [];
  }

  installPath(srcId: string, dstId: string): SDNFlow[] {
    const path = this.getShortestPath(srcId, dstId);
    const flows: SDNFlow[] = [];

    for (let i = 0; i < path.length - 1; i++) {
      const currentNode = path[i];
      const nextNode = path[i + 1];
      
      const flow: SDNFlow = {
        id: `flow-${currentNode}-${nextNode}-${Date.now()}`,
        priority: 100,
        match: { ipDst: this.nodes.get(dstId)?.ip },
        actions: [{ type: 'output', port: this.getPortToNeighbor(currentNode, nextNode) }]
      };
      
      flows.push(flow);
      this.addFlow(flow);
    }

    return flows;
  }

  private getPortToNeighbor(nodeId: string, neighborId: string): number {
    const neighbors = this.topology.get(nodeId) || [];
    return neighbors.indexOf(neighborId) + 1;
  }

  getNetworkTopology() {
    return {
      nodes: Array.from(this.nodes.values()),
      links: Array.from(this.topology.entries()).flatMap(([nodeId, neighbors]) =>
        neighbors.map(neighbor => ({ source: nodeId, target: neighbor }))
      )
    };
  }
}