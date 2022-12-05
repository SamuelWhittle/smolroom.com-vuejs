const { DisjointSet } = data_structures;

let maze_gen;

(() => {
  const __exports = {};

  class Maze {
    constructor(nodes) {
      this.nodes = nodes;
      this.start = null;
      this.end = null;
      this.style = null; // rect or hex
      this.startColor = '#88ff88';
      this.endColor = '#ff8888';
      this.pathColor = '#16161d';
      this.wallColor = '#888888';
      this.userPathColor = '#8888ff';
      this.highlightColor = '#FF9955';
    }

    setStart(start) {
      this.start = start;

      this.clearStart();

      this.nodes[start].metadata.isStart = true;
    }

    setEnd(end) {
      this.end = end;

      this.clearEnd();

      this.nodes[end].metadata.isEnd = true;
    }

    clearStart() {
      Object.entries(this.nodes).forEach(([_, node]) => {
        node.metadata.isStart = false;
      });
    }

    clearEnd() {
      Object.entries(this.nodes).forEach(([_, node]) => {
        node.metadata.isEnd = false;
      });
    }

    initRectNodes() {
      const neighbors = [[0, -1], [0, 1], [-1, 0], [1, 0]];

      Object.entries(this.nodes).forEach(([key, node]) => {
          const x = node.metadata.position[0];
          const y = node.metadata.position[1];

          neighbors.forEach(neighbor => {
            const neighborKey = getKey(node.metadata.position[0] + neighbor[0], node.metadata.position[1] + neighbor[1]);

            if (neighborKey in this.nodes) {
              node.neighbors.push(neighborKey);
              node.potentialEdges.push(neighborKey);
            }
          });
      });
    }

    sprinkle(chance) {
      for (const key in this.nodes) {
        const node = this.nodes[key];

        if (Math.random() < chance && node.neighbors.length == 4 && node.edges.length == 2) {
          const potentialNewEdges = node.neighbors.filter(edge => node.edges.indexOf(edge) == -1);

          const newEdge = potentialNewEdges[Math.floor(Math.random() * potentialNewEdges.length)];

          node.edges.push(newEdge);
          this.nodes[newEdge].edges.push(key);
        }
      }
    }

    getPotentialWalls() {
      const nodesCopy = JSON.parse(JSON.stringify(this.nodes));

      return Object.entries(nodesCopy).reduce((acc, [key, node]) => {
        node.potentialEdges.forEach(neighborKey => {
          acc.push([key, neighborKey]);
          nodesCopy[neighborKey].potentialEdges.splice(nodesCopy[neighborKey].potentialEdges.indexOf(key), 1);
        });

        return acc;
      }, []);
    }

    // generate the edges that make up the maze paths, nodeKey is the starting Node
    generateBacktracker(nodeKey) {
      // reset the visited cells list
      const visited = {};
      const genStack = [];

      // Mark the initial cell as visited
      visited[nodeKey] = true;

      // push the initial cell to the stack
      genStack.push(nodeKey);

      // while the stack is not empty
      while (genStack.length > 0) {
        // pop a cell from the stack and make it the current cell
        const currentKey = genStack.pop();
        const currentNode = this.nodes[currentKey];

        // get a list of all unvisited neighbors of the current cell
        const unvisited = [];
        currentNode.neighbors.forEach(edgeKey => {
          if (!(edgeKey in visited)) {
            unvisited.push(edgeKey);
          }
        });

        // if the current cell has any neighbors which have not been visited
        if (unvisited.length > 0) {
          // push the current cell to the stack
          genStack.push(currentKey);

          // choose one of the unvisited neighbors
          const neighborKey = unvisited[Math.floor(Math.random() * unvisited.length)];

          // add a path from the current cell to the chosen cell
          currentNode.edges.push(neighborKey);
          this.nodes[neighborKey].edges.push(currentKey);

          // mark the chosen cell as visited
          visited[neighborKey] = true;

          // push the chosen cell to the stack
          genStack.push(neighborKey);
        }
      }
    }

    generateKruskal() {
      // disjoint set
      const disjointSet = new DisjointSet(this.nodes);

      // put each cell in it's own set
      disjointSet.initUniqueSets();

      // get a list of all walls
      const walls = this.getPotentialWalls();
      const numWalls = walls.length;

      // for every wall in a random order
      for (let i = 0; i < numWalls; i ++) {
        const selectedWallIndex = Math.floor(Math.random() * walls.length);
        const wall = walls[selectedWallIndex];

        const firstNodeIndex = Math.floor(Math.random() * 2);

        disjointSet.union(wall[firstNodeIndex], wall[1 - firstNodeIndex]);
        
        walls.splice(selectedWallIndex, 1);
      }
    }

    renderRect(ctx, xTiles, yTiles, cDiv, wallThickness) {
      ctx.fillStyle =this.wallColor;
      ctx.fillRect(0, 0, xTiles * cDiv + (wallThickness / 2), yTiles * cDiv + (wallThickness / 2));

      ctx.fillStyle = this.pathColor;
      ctx.strokeStyle = this.pathColor;
      ctx.lineWidth = cDiv - wallThickness;

      let fillPath = new Path2D();
      let strokePath = new Path2D();

      for (const key in this.nodes) {
        const node = this.nodes[key];

        fillPath.rect(node.metadata.position[0] * cDiv + (wallThickness / 2), node.metadata.position[1] * cDiv + (wallThickness / 2), 
          cDiv - wallThickness, cDiv - wallThickness);

        node.edges.forEach((key) => {
          strokePath.moveTo(node.metadata.position[0] * cDiv + (cDiv / 2), node.metadata.position[1] * cDiv + (cDiv / 2));
          strokePath.lineTo(this.nodes[key].metadata.position[0] * cDiv + (cDiv / 2), this.nodes[key].metadata.position[1] * cDiv + (cDiv / 2));
        });
      }

      ctx.fill(fillPath);
      ctx.stroke(strokePath);

      ctx.fillStyle = this.startColor;
      ctx.fillRect(this.nodes[this.start].metadata.position[0] * cDiv + (wallThickness / 2), this.nodes[this.start].metadata.position[1] * cDiv + (wallThickness / 2),
        cDiv - wallThickness, cDiv - wallThickness);
      ctx.fillStyle = this.endColor;
      ctx.fillRect(this.nodes[this.end].metadata.position[0] * cDiv + (wallThickness / 2), this.nodes[this.end].metadata.position[1] * cDiv + (wallThickness / 2),
        cDiv - wallThickness, cDiv - wallThickness);
    }
  }

  __exports.Maze = Maze;

  maze_gen = Object.assign(__exports);
})();
