const { DisjointSet } = data_structures;

let maze_gen;

(() => {
  const __exports = {};

  class Maze {
    constructor(nodes) {
      this.nodes = nodes;
      this.solvedPath = [];
      this.renderSolved = false;

      this.start = null;
      this.end = null;
      this.style = null; // rect or hex
      this.wallThickness = 4;

      this.startColor = '#88ff88';
      this.endColor = '#ff8888';
      this.pathColor = '#16161d';
      this.wallColor = '#888888';
      this.userPathColor = '#8888ff';
      this.computerPathColor = '#b080b0';
      this.highlightColor = '#FF9955';
    }

    setStart(start) {
      this.start = start;

      this.clearStart();

      this.nodes[start].metadata.render.isStart = true;
    }

    setEnd(end) {
      this.end = end;

      this.clearEnd();

      this.nodes[end].metadata.render.isEnd = true;
    }

    clearStart() {
      Object.entries(this.nodes).forEach(([_, node]) => {
        node.metadata.render.isStart = false;
      });
    }

    clearEnd() {
      Object.entries(this.nodes).forEach(([_, node]) => {
        node.metadata.render.isEnd = false;
      });
    }

    showSolved() {
      this.renderSolved = true;
    }

    hideSolved() {
      this.renderSolved = false;
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

    renderRect(ctx, xTiles, yTiles, cDiv) {
      ctx.fillStyle =this.wallColor;
      ctx.fillRect(0, 0, xTiles * cDiv + (this.wallThickness / 2), yTiles * cDiv + (this.wallThickness / 2));

      ctx.fillStyle = this.pathColor;

      ctx.strokeStyle = this.pathColor;
      ctx.lineWidth = cDiv - this.wallThickness;

      let fillPath = new Path2D();
      let strokePath = new Path2D();

      for (const key in this.nodes) {
        const node = this.nodes[key];

        fillPath.rect(node.metadata.position[0] * cDiv + (this.wallThickness / 2), node.metadata.position[1] * cDiv + (this.wallThickness / 2), 
          cDiv - this.wallThickness, cDiv - this.wallThickness);

        node.edges.forEach((key) => {
          strokePath.moveTo(node.metadata.position[0] * cDiv + (cDiv / 2), node.metadata.position[1] * cDiv + (cDiv / 2));
          strokePath.lineTo(this.nodes[key].metadata.position[0] * cDiv + (cDiv / 2), this.nodes[key].metadata.position[1] * cDiv + (cDiv / 2));
        });
      }

      ctx.fill(fillPath);
      ctx.stroke(strokePath);

      ctx.fillStyle = this.startColor;
      ctx.fillRect(this.nodes[this.start].metadata.position[0] * cDiv + (this.wallThickness / 2), this.nodes[this.start].metadata.position[1] * cDiv + (this.wallThickness / 2),
        cDiv - this.wallThickness, cDiv - this.wallThickness);
      ctx.fillStyle = this.endColor;
      ctx.fillRect(this.nodes[this.end].metadata.position[0] * cDiv + (this.wallThickness / 2), this.nodes[this.end].metadata.position[1] * cDiv + (this.wallThickness / 2),
        cDiv - this.wallThickness, cDiv - this.wallThickness);
    }

    resetRenderMetadata() {
      for (const nodeKey in this.nodes) {
        const node = this.nodes[nodeKey];

        for (const renderKey in node.metadata.render) {
          node.metadata.render[renderKey] = false;
        }
      }
    }
    
    getNodeColor(key) {
      const render = this.nodes[key].metadata.render;

      if (render.highlighted) {
        return this.highlightColor;
      } else if (render.userPath) {
        return this.userPathColor;
      } else if (render.computerPath && this.renderSolved) {
        return this.computerPathColor;
      } else if (render.isStart) {
        return this.startColor;
      } else if (render.isEnd) {
        return this.endColor;
      } else {
        return this.pathColor;
      }
    }

    renderNodeRect(key, ctx, cDiv) {
      ctx.fillStyle = this.getNodeColor(key);

      const node = this.nodes[key];

      ctx.fillRect(node.metadata.position[0] * cDiv + this.wallThickness, node.metadata.position[1] * cDiv + this.wallThickness, 
        cDiv - (this.wallThickness * 2), cDiv - (this.wallThickness * 2));
    }

    // ########## PATHFINDING ##########

    // Returns the distance between two nodes
    _distance(node1, node2) {
      const [x1, y1] = node1.metadata.position;
      const [x2, y2] = node2.metadata.position;
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    // Returns the node with the smallest fScore in the openList
    _getLowestScoreNode(openList, fScores) {
      let lowestScore = Infinity;
      let lowestNode = null;

      for (const node of openList) {
        const fScore = fScores.get(node);
        if (fScore < lowestScore) {
          lowestScore = fScore;
          lowestNode = node;
        }
      }

      return lowestNode;
    }

    // Returns the solved set of nodes using the A* algorithm
    aStarSolve(startNodeKey, endNodeKey) {
      const startNode = this.nodes[startNodeKey];
      const endNode = this.nodes[endNodeKey];

      endNode.metadata.render.computerPath = true;

      // Return an empty array if the start or end node is not found
      if (!startNode || !endNode) return [];

      const openList = new Set([startNode]);
      const closedList = new Set();
      const cameFrom = new Map();

      const gScores = new Map();
      gScores.set(startNode, 0);

      const fScores = new Map();
      fScores.set(startNode, this._distance(startNode, endNode));

      while (openList.size > 0) {
        const currentNode = this._getLowestScoreNode(openList, fScores);

        // Stop when we reach the end node
        if (currentNode === endNode) {
          break;
        }

        openList.delete(currentNode);
        closedList.add(currentNode);

        for (const neighborKey of currentNode.edges) {
          const neighbor = this.nodes[neighborKey];
          if (closedList.has(neighbor)) continue;

          const tentativeGScore = gScores.get(currentNode) + this._distance(currentNode, neighbor);

          if (!openList.has(neighbor)) {
            openList.add(neighbor);
          } else if (tentativeGScore >= gScores.get(neighbor)) {
            continue;
          }

          cameFrom.set(neighbor, currentNode);
          gScores.set(neighbor, tentativeGScore);
          fScores.set(
            neighbor,
            tentativeGScore + this._distance(neighbor, endNode)
          );
        }
      }

      // Reconstruct the path by following the cameFrom map
      const path = [endNode.metadata.key];
      let currentNode = endNode;
      while (currentNode !== startNode) {
        currentNode = cameFrom.get(currentNode);
        currentNode.metadata.render.computerPath = true;
        path.unshift(currentNode.metadata.key);
      }

      /*path.forEach(key => {
        this.nodes[key].metadata.render.computerPath = true;
      });*/

      this.solvedPath = path;
    }

    renderSolvedPathRect(ctx, cDiv) {
      this.solvedPath.forEach(key => {
        this.renderNodeRect(key, ctx, cDiv);
      });
    }
  }

  __exports.Maze = Maze;

  maze_gen = Object.assign(__exports);
})();
