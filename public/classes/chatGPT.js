class AStar {
  constructor(graph) {
    this.graph = graph;
  }

  *findPath(startKey, endKey) {
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
  fScore.set(startKey, this.calculateDistance(this.graph.nodes[startKey], this.graph.nodes[endKey]));

  // Use a priority queue to keep track of the nodes that are still
  // being considered, with the lowest fScore at the front of the queue.
  const openSetQueue = new PriorityQueue((a, b) => fScore.get(a) < fScore.get(b));
  openSetQueue.enqueue(startKey);

  // While there are still nodes in the open set...
  while (openSet.size > 0) {
    // Get the node with the lowest fScore.
    const currentKey = openSetQueue.dequeue();

    // If the current node is the end node, we've found a path!
    if (currentKey === endKey) {
      // Return the path that was found.
      return this.constructPath(cameFrom, endKey);
    }

    // Move the current node from the open set to the closed set.
    openSet.delete(currentKey);
    closedSet.add(currentKey);

    // Get the current node's neighbors.
    const neighbors = this.graph.nodes[currentKey].neighbors;

    // For each neighbor...
    for (const neighborKey of neighbors) {
      // Skip this neighbor if it's already in the closed set.
      if (closedSet.has(neighborKey)) {
        continue;
      }

      // Calculate the distance from the start node to the neighbor.
      const tentativeGScore = gScore.get(currentKey) + this.calculateDistance(this.graph.nodes[currentKey], this.graph.nodes[neighborKey]);

      if (!openSet.has(neighborKey)) {
        openSet.add(neighborKey);
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(neighborKey, tentativeGScore + this.calculateDistance(this.graph.nodes[neighborKey], this.graph.nodes[endKey]));
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
              fScore
          };
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

