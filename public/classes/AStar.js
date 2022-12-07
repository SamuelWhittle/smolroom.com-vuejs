let a_star;
(() => {
  const __exports = {};

  class AStar {
    constructor(nodes) {
      this.nodes = nodes;
      this.solvedPath = [];
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
    solve(startNodeKey, endNodeKey) {
      const startNode = this.nodes[startNodeKey];
      const endNode = this.nodes[endNodeKey];

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
          //if (closedList.has(neighbor)) return;

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
      const path = [endNode];
      let currentNode = endNode;
      while (currentNode !== startNode) {
        currentNode = cameFrom.get(currentNode);
        path.unshift(currentNode);
      }

      /*path.forEach(node => {
        this.nodes[`${node.metadata.position[0]}.${node.metadata.position[1]}`].metadata.render.computerPath = true;
      });*/

      this.solvedPath = path;
    }

    renderRect(ctx, xTiles, yTiles, cDiv, wallThickness, color) {
      ctx.fillStyle = color;

      let fillPath = new Path2D();

      this.solvedPath.forEach(node => {
        fillPath.rect(node.metadata.position[0] * cDiv + wallThickness, node.metadata.position[1] * cDiv + wallThickness, 
          cDiv - (wallThickness * 2), cDiv - (wallThickness * 2));
      });

      ctx.fill(fillPath);
    }
  }

  __exports.AStar = AStar;

  a_star = Object.assign(__exports);
})();

/* Class provided by chatGPT after asking it for an A* class that utilizes my Graph class

class Pathfinder {
  constructor(graph) {
    this.graph = graph;
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
  solve(startNodeKey, endNodeKey) {
    const startNode = this.graph.nodes[startNodeKey];
    const endNode = this.graph.nodes[endNodeKey];

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

      for (const neighbor of currentNode.neighbors) {
        if (closedList.has(neighbor)) continue;

        const tentativeGScore =
          gScores.get(currentNode) + this._distance(currentNode, neighbor);

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
    const path = [endNode];
    let currentNode = endNode;
    while (currentNode !== startNode) {
      currentNode = cameFrom.get(currentNode);
      path.unshift(currentNode);
    }

    return path;

*/

/*

  ChatGPT version:

// A* pathfinding algorithm.
function aStar(start, end, grid) {
  // Create a list of open nodes (nodes to be explored).
  const openList = [start];

  // Create a list of closed nodes (nodes that have been explored).
  const closedList = [];

  // Create an object to store the path.
  const path = {};

  // Loop until the open list is empty (all nodes have been explored).
  while (openList.length > 0) {
    // Get the node with the lowest fScore and remove it from the open list.
    let currentNode = openList.reduce((lowest, node) => node.fScore < lowest.fScore ? node : lowest);
    const currentIndex = openList.indexOf(currentNode);
    openList.splice(currentIndex, 1);

    // Add the current node to the closed list.
    closedList.push(currentNode);

    // If we have reached the end, construct the path and return it.
    if (currentNode === end) {
      let node = currentNode;
      while (node !== start) {
        path[node.x + '-' + node.y] = node;
        node = node.parent;
      }
      return path;
    }

    // Get the neighbors of the current node.
    const neighbors = getNeighbors(currentNode, grid);

    // Loop through each neighbor.
    for (const neighbor of neighbors) {
      // If the neighbor is in the closed list, skip it.
      if (closedList.includes(neighbor)) {
        continue;
      }

      // Calculate the distance from the start to the neighbor.
      const gScore = currentNode.gScore + 1;

      // If the neighbor is not in the open list, add it.
      if (!openList.includes(neighbor)) {
        openList.push(neighbor);
      }
      // Otherwise, check if this path to the neighbor is better than the
      // previous one (if the gScore is lower).
      else if (gScore >= neighbor.gScore) {
        continue;
      }

      // Save the gScore and the parent of the neighbor.
      neighbor.gScore = gScore;
      neighbor.hScore = heuristic(neighbor, end);
      neighbor.fScore = neighbor.gScore + neighbor.hScore;
      neighbor.parent = currentNode;
    }
  }

  // If we reach here, there is no path to the end.
  return null;
}

// Get the neighbors of a given node.
function getNeighbors(node, grid) {
  const neighbors = [];
  const { x, y } = node;
  if (grid[x - 1] && grid[x - 1][y]) neighbors.push(grid[x - 1][y]);
  if (grid[x + 1] && grid[x + 1][y]) neighbors.push(grid[x + 1][y]);
  if (grid[x] && grid[x][y - 1]) neighbors.push(grid[x][y - 1]);
  if (grid[x] && grid[x][y + 1]) neighbors.push(grid[x][y + 1]);
  return neighbors;
}

    // Calculate the heuristic (estimated cost from a node to the end) using
// the Manhattan distance.
function heuristic(node, end) {
  const d1 = Math.abs(node.x - end.x);
  const d2 = Math.abs(node.y - end.y);
  return d1 + d2;
}

// Example usage of the A* algorithm.

// Create a grid of nodes.
const grid = [  [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
  [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
];

// Set the start and end nodes.
const start = grid[0][0];
const end = grid[2][2];

// Calculate the path from the start to the end.
const path = aStar(start, end, grid);

// Print the path, if it exists.
if (path) {
  for (const node of Object.values(path)) {
    console.log(node);
  }
} else {
  console.log('No path found.');
}
*/
