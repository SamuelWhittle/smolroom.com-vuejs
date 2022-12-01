class Graph {
  constructor() {
    this.nodes = {};
  }

  get Nodes() {
    return this.nodes;
  }

  AddNode(key, edges, meta) {
    this.nodes[key] = {
      edges: [...edges],
      potentialEdges: [...edges],
      metadata: meta
    };
  }
}
