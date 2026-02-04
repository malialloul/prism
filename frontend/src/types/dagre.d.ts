declare module 'dagre' {
  export interface GraphLabel {
    rankdir?: 'TB' | 'BT' | 'LR' | 'RL';
    align?: 'UL' | 'UR' | 'DL' | 'DR';
    nodesep?: number;
    edgesep?: number;
    ranksep?: number;
    marginx?: number;
    marginy?: number;
    acyclicer?: 'greedy' | undefined;
    ranker?: 'network-simplex' | 'tight-tree' | 'longest-path';
  }

  export interface NodeConfig {
    width?: number;
    height?: number;
  }

  export interface EdgeConfig {
    minlen?: number;
    weight?: number;
    width?: number;
    height?: number;
    labelpos?: 'l' | 'c' | 'r';
    labeloffset?: number;
  }

  export interface Node {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export interface Edge {
    points: Array<{ x: number; y: number }>;
    x?: number;
    y?: number;
  }

  export namespace graphlib {
    class Graph {
      constructor(opts?: { directed?: boolean; compound?: boolean; multigraph?: boolean });
      setDefaultEdgeLabel(callback: () => Record<string, unknown>): void;
      setGraph(label: GraphLabel): void;
      setNode(name: string, config: NodeConfig): void;
      setEdge(source: string, target: string, config?: EdgeConfig): void;
      node(name: string): Node | undefined;
      edge(source: string, target: string): Edge | undefined;
      nodes(): string[];
      edges(): Array<{ v: string; w: string }>;
    }
  }

  export function layout(graph: graphlib.Graph): void;
}
