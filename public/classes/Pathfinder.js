let path_finder;

(() => {
  const __exports = {};
  
  class Pathfinder {
    constructor(nodes) {
      this.nodes = nodes;
      this.solvedPath = [];

      //this.start = null;
      //this.end = null;
    }

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

      this.solvedPath = path;
    }
  }

  __exports.Pathfinder = Pathfinder;

  path_finder = Object.assign(__exports);
})();
