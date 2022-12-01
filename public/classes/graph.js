class Graph {
  constructor() {
    this.nodes = {};
  }

  get Nodes() {
    return this.nodes;
  }

  AddNode(k, e, m) {
    this.nodes[k] = {
      edges: [...e],
      potentialEdges: [...e],
      metadata: m
    };
  }
}
