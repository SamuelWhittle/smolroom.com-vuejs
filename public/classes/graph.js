let _graph;
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
        potentialEdges: [...edges],
        metadata: meta
      };
    }

    initMazeNodes(xTiles, yTiles) {
      for (let x = 0; x < xTiles; x++) {
        for (let y = 0; y < yTiles; y++) {
          const key = getKey(x, y);
          this.AddNode(key, [], {
            position: [x, y],
            weight: 0,
            render: {
              visited: false
            }
          });
        }
      }


      for (let x = 0; x < xTiles; x++) {
        for (let y = 0; y < yTiles; y++) {
          const key = getKey(x, y);

          for (let xi = -1; xi <= 1; xi++) {
            for (let yi = -1; yi <= 1; yi++) {
              if (xi == 0 && yi == 0 || (Math.abs(xi) + Math.abs(yi) != 1)) {
                continue;
              }

              const ki = getKey(x + xi, y + yi);

              if (ki in this.nodes) {
                this.nodes[key].potentialEdges.push(ki)
              }
            }
          }
        }
      }
    }
  }

  __exports.Graph = Graph;

  _graph = Object.assign(__exports);

})();
