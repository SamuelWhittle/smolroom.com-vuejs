//importScripts('../classes/DataStructures.js');

//const { PriorityQueue } = data_structures;

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

    *getAStarSolveIter(startKey, endKey) {
      // Set up the closed and open sets, which keep track of the nodes
      // that have been visited and those that are still being considered.
      const closedSet = new Set();
      const openSet = new Set([startKey]);

      // Set up a map that will store the paths that have been found so far.
      // Each key in the map is a node, and the value is the path that was
      // found to reach that node.
      const cameFrom = new Map();

      // Set up a map that will store the distances from the start node
      // to each node that has been visited.
      const gScore = new Map();
      gScore.set(startKey, 0);

      // Set up a map that will store the estimated distances from each
      // node to the end node. These distances are calculated using a
      // heuristic function (in this case, the Euclidean distance).
      const fScore = new Map();
      fScore.set(startKey, this.calculateDistance(this.nodes[startKey], this.nodes[endKey]));

      // Use a priority queue to keep track of the nodes that are still
      // being considered, with the lowest fScore at the front of the queue.
      const openSetQueue = new PriorityQueue((a, b) => fScore.get(a) - fScore.get(b));
      openSetQueue.enqueue(startKey);

      // While there are still nodes in the open set...
      while (openSet.size > 0) {
        // Get the node with the lowest fScore.
        const currentKey = openSetQueue.dequeue();

        // If the current node is the end node, we've found a path!
        if (currentKey === endKey) {
          // Return the path that was found.
          return { solvedPath: this.constructPath(cameFrom, endKey), done: true};
        }

        // Move the current node from the open set to the closed set.
        openSet.delete(currentKey);
        closedSet.add(currentKey);

        // Get the current node's neighbors.
        const neighbors = this.nodes[currentKey].edges;

        // For each neighbor...
        for (const neighborKey of neighbors) {
          // Skip this neighbor if it's already in the closed set.
          if (closedSet.has(neighborKey)) {
            continue;
          }

          // Calculate the distance from the start node to the neighbor.
          const tentativeGScore = gScore.get(currentKey) + this.calculateDistance(this.nodes[currentKey], this.nodes[neighborKey]);

          if (!openSet.has(neighborKey)) {
            openSet.add(neighborKey);
            gScore.set(neighborKey, tentativeGScore);
            fScore.set(neighborKey, tentativeGScore + this.calculateDistance(this.nodes[neighborKey], this.nodes[endKey]));
            openSetQueue.enqueue(neighborKey);
            cameFrom.set(neighborKey, currentKey);

            // Yield the current state of the algorithm to allow the user to
            // step through the process.
            yield {
              currentKey,
              closedSet,
              openSet,
              cameFrom,
              gScore,
              fScore,
                done: false
            };
          }
        }
      }

      // If the algorithm completes without finding a path, return null.
      return null;
    }
        
    // Calculate the Euclidean distance between two nodes.
    calculateDistance(node1, node2) {
      const [x1, y1] = node1.metadata.position;
      const [x2, y2] = node2.metadata.position;

      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    // Construct the path that was found by the algorithm by starting
    // at the end node and following the cameFrom map back to the start node.
    constructPath(cameFrom, currentKey) {
      const path = [currentKey];

      while (currentKey) {
        currentKey = cameFrom.get(currentKey);
        if (currentKey) {
          path.unshift(currentKey);
        }
      }

      return path;
    }
  }

  __exports.Pathfinder = Pathfinder;

  path_finder = Object.assign(__exports);
})();
