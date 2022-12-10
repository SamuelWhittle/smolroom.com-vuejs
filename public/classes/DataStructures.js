let data_structures;
(() => {
  const __exports = {}

  const getKey = (x, y) => x + '.' + y;

  __exports.getKey = getKey;

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
        neighbors: [...edges],
        potentialEdges: [...edges],
        metadata: meta
      };
    }
  }

  __exports.Graph = Graph;

  class DisjointSet {
    constructor(nodes) {
      this.nodes = nodes;
      this.roots = {};
    }

    initUniqueSets() {
      for (const key in this.nodes) {
        this.roots[key] = key;
      }
    }

    // Get representative of the set that key is in, the representative is also the root of the tree
    findRoot(key) {
      if (this.roots[key] == key)
        return key;
      else
        return this.findRoot(this.roots[key]);
    }

    union(key1, key2) {
      let rootKey1 = this.findRoot(key1);
      let rootKey2 = this.findRoot(key2);

      if (rootKey1 !== rootKey2) {
        this.nodes[key1].edges.push(key2);
        this.nodes[key2].edges.push(key1);
        this.roots[key2] = key1;
        this.roots[rootKey2] = key1;
      }
    }

    isConnected(key1, key2) {
      return (this.findRoot(key1) == this.findRoot(key2));
    }
  }

  __exports.DisjointSet = DisjointSet;

  class PriorityQueue {
    constructor(comparisonFunction) {
      this.items = [];
      this.comparisonFunction = comparisonFunction;
    }

    enqueue(item) {
      this.items.push(item);
      this.items.sort(this.comparisonFunction);
    }

    dequeue() {
      return this.items.shift();
    }
  }

  __exports.PriorityQueue = PriorityQueue;

  data_structures = Object.assign(__exports);

})();
