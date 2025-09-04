import { EventEmitter } from 'events';
import { SDNNode, SDNController } from './sdn-core';
import { SDNSwitch } from './sdn-switch';

export interface Link {
  id: string;
  srcNode: string;
  srcPort: number;
  dstNode: string;
  dstPort: number;
  bandwidth: number;
  latency: number;
  status: 'up' | 'down';
}

export interface NetworkPath {
  nodes: string[];
  links: Link[];
  totalLatency: number;
  minBandwidth: number;
  cost: number;
}

export class TopologyManager extends EventEmitter {
  private nodes: Map<string, SDNNode> = new Map();
  private switches: Map<string, SDNSwitch> = new Map();
  private links: Map<string, Link> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map();

  addNode(node: SDNNode): void {
    this.nodes.set(node.id, node);
    this.adjacencyList.set(node.id, new Set());
    this.emit('nodeAdded', node);
  }

  removeNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Remove all links connected to this node
    const connectedLinks = Array.from(this.links.values())
      .filter(link => link.srcNode === nodeId || link.dstNode === nodeId);
    
    connectedLinks.forEach(link => this.removeLink(link.id));
    
    this.nodes.delete(nodeId);
    this.switches.delete(nodeId);
    this.adjacencyList.delete(nodeId);
    
    // Remove from other nodes' adjacency lists
    this.adjacencyList.forEach(neighbors => neighbors.delete(nodeId));
    
    this.emit('nodeRemoved', node);
  }

  addSwitch(dpid: string, node: SDNNode): SDNSwitch {
    const sdnSwitch = new SDNSwitch(dpid);
    this.switches.set(dpid, sdnSwitch);
    this.addNode({ ...node, id: dpid, role: 'switch' });
    
    sdnSwitch.on('packetIn', (data) => {
      this.emit('packetIn', { ...data, switch: sdnSwitch });
    });
    
    return sdnSwitch;
  }

  addLink(link: Link): void {
    this.links.set(link.id, link);
    
    // Update adjacency list
    this.adjacencyList.get(link.srcNode)?.add(link.dstNode);
    this.adjacencyList.get(link.dstNode)?.add(link.srcNode);
    
    this.emit('linkAdded', link);
  }

  removeLink(linkId: string): void {
    const link = this.links.get(linkId);
    if (!link) return;

    this.links.delete(linkId);
    
    // Update adjacency list
    this.adjacencyList.get(link.srcNode)?.delete(link.dstNode);
    this.adjacencyList.get(link.dstNode)?.delete(link.srcNode);
    
    this.emit('linkRemoved', link);
  }

  findShortestPath(srcId: string, dstId: string): NetworkPath | null {
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set(this.nodes.keys());

    // Initialize distances
    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, nodeId === srcId ? 0 : Infinity);
      previous.set(nodeId, null);
    }

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let current: string | null = null;
      let minDistance = Infinity;
      
      for (const nodeId of unvisited) {
        const distance = distances.get(nodeId)!;
        if (distance < minDistance) {
          minDistance = distance;
          current = nodeId;
        }
      }

      if (!current || minDistance === Infinity) break;
      
      unvisited.delete(current);
      
      if (current === dstId) break;

      // Update distances to neighbors
      const neighbors = this.adjacencyList.get(current) || new Set();
      for (const neighbor of neighbors) {
        if (!unvisited.has(neighbor)) continue;

        const link = this.getLinkBetween(current, neighbor);
        if (!link || link.status !== 'up') continue;

        const alt = distances.get(current)! + this.calculateLinkCost(link);
        if (alt < distances.get(neighbor)!) {
          distances.set(neighbor, alt);
          previous.set(neighbor, current);
        }
      }
    }

    // Reconstruct path
    const path: string[] = [];
    let current: string | null = dstId;
    
    while (current !== null) {
      path.unshift(current);
      current = previous.get(current) || null;
    }

    if (path[0] !== srcId) return null;

    return this.buildNetworkPath(path);
  }

  findAllPaths(srcId: string, dstId: string, maxPaths: number = 3): NetworkPath[] {
    const paths: NetworkPath[] = [];
    const visited = new Set<string>();

    const dfs = (current: string, target: string, currentPath: string[]): void => {
      if (paths.length >= maxPaths) return;
      
      if (current === target) {
        const path = this.buildNetworkPath([...currentPath, current]);
        if (path) paths.push(path);
        return;
      }

      visited.add(current);
      const neighbors = this.adjacencyList.get(current) || new Set();
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const link = this.getLinkBetween(current, neighbor);
          if (link && link.status === 'up') {
            dfs(neighbor, target, [...currentPath, current]);
          }
        }
      }
      
      visited.delete(current);
    };

    dfs(srcId, dstId, []);
    
    // Sort by cost
    return paths.sort((a, b) => a.cost - b.cost);
  }

  private getLinkBetween(node1: string, node2: string): Link | null {
    for (const link of this.links.values()) {
      if ((link.srcNode === node1 && link.dstNode === node2) ||
          (link.srcNode === node2 && link.dstNode === node1)) {
        return link;
      }
    }
    return null;
  }

  private calculateLinkCost(link: Link): number {
    // Cost based on latency and inverse of bandwidth
    return link.latency + (1000 / link.bandwidth);
  }

  private buildNetworkPath(nodeIds: string[]): NetworkPath | null {
    if (nodeIds.length < 2) return null;

    const links: Link[] = [];
    let totalLatency = 0;
    let minBandwidth = Infinity;
    let cost = 0;

    for (let i = 0; i < nodeIds.length - 1; i++) {
      const link = this.getLinkBetween(nodeIds[i], nodeIds[i + 1]);
      if (!link) return null;

      links.push(link);
      totalLatency += link.latency;
      minBandwidth = Math.min(minBandwidth, link.bandwidth);
      cost += this.calculateLinkCost(link);
    }

    return {
      nodes: nodeIds,
      links,
      totalLatency,
      minBandwidth: minBandwidth === Infinity ? 0 : minBandwidth,
      cost
    };
  }

  detectFailures(): Link[] {
    const failedLinks: Link[] = [];
    
    for (const link of this.links.values()) {
      // Simulate link failure detection
      if (Math.random() < 0.01) { // 1% chance of failure
        link.status = 'down';
        failedLinks.push(link);
        this.emit('linkFailure', link);
      }
    }
    
    return failedLinks;
  }

  recoverLink(linkId: string): boolean {
    const link = this.links.get(linkId);
    if (!link) return false;

    link.status = 'up';
    this.emit('linkRecovered', link);
    return true;
  }

  getNetworkStats() {
    const totalNodes = this.nodes.size;
    const totalLinks = this.links.size;
    const activeLinks = Array.from(this.links.values())
      .filter(link => link.status === 'up').length;
    
    const avgLatency = Array.from(this.links.values())
      .reduce((sum, link) => sum + link.latency, 0) / totalLinks;
    
    const totalBandwidth = Array.from(this.links.values())
      .reduce((sum, link) => sum + link.bandwidth, 0);

    return {
      totalNodes,
      totalLinks,
      activeLinks,
      avgLatency: avgLatency || 0,
      totalBandwidth,
      networkUtilization: activeLinks / totalLinks
    };
  }

  exportTopology() {
    return {
      nodes: Array.from(this.nodes.values()),
      links: Array.from(this.links.values()),
      timestamp: new Date().toISOString()
    };
  }

  importTopology(topology: any): void {
    this.nodes.clear();
    this.links.clear();
    this.switches.clear();
    this.adjacencyList.clear();

    topology.nodes.forEach((node: SDNNode) => this.addNode(node));
    topology.links.forEach((link: Link) => this.addLink(link));
  }
}