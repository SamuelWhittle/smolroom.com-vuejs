let maze_gen;

(() => {
  const __exports = {};

  class Maze {
    constructor(nodes) {
      this.nodes = nodes;
      this.start = null;
      this.end = null;
      this.style = null; // rect or hex
      this.visited = {};
      this.genStack = [];
    }

    setStart(start) {
      this.start = start;
    }

    setEnd(end) {
      this.end = end;
    }

    sprinkle(chance) {
      for (const key in this.nodes) {
        const node = this.nodes[key];
        if (Math.random() < chance && node.potentialEdges.length == 4 && node.edges.length == 2) {
          const potentialNewEdges = node.potentialEdges.filter(edge => node.edges.indexOf(edge) == -1);

          node.edges.push(potentialNewEdges[Math.floor(Math.random() * potentialNewEdges.length)]);
        }
      }
    }

    // generate the edges that make up the maze paths, nodeKey is the starting Node
    generateBacktracker(nodeKey) {
      // Mark the initial cell as visited
      this.visited[nodeKey] = true;

      // push the initial cell to the stack
      this.genStack.push(nodeKey);

      // while the stack is not empty
      while (this.genStack.length > 0) {
        // pop a cell from the stack and make it the current cell
        const currentKey = this.genStack.pop();
        const currentNode = this.nodes[currentKey];

        // get a list of all unvisited neighbors of the current cell
        const unvisited = [];
        currentNode.potentialEdges.forEach(edgeKey => {
          if (!(edgeKey in this.visited)) {
            unvisited.push(edgeKey);
          }
        });

        // if the current cell has any neighbors which have not been visited
        if (unvisited.length > 0) {
          // push the current cell to the stack
          this.genStack.push(currentKey);

          // choose one of the unvisited neighbors
          const neighborKey = unvisited[Math.floor(Math.random() * unvisited.length)];

          // add a path from the current cell to the chosen cell
          currentNode.edges.push(neighborKey);

          // mark the chosen cell as visited
          this.visited[neighborKey] = true;

          // push the chosen cell to the stack
          this.genStack.push(neighborKey);
        }
      }
    }

    generateKruskal() {

    }

    render(args) {
      switch (args.gridType) {
        case 'hex':
          console.log("hexagonal maze rendering has not been implemented yet.");
          break;
        case 'rect':
        default:
          this.renderRect(args.ctx, args.xTiles, args.yTiles, args.cDiv);
      }
    }

    renderRect(ctx, xTiles, yTiles, cDiv) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, xTiles * cDiv + 1, yTiles * cDiv + 1);

      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = cDiv - 2;

      let fillPath = new Path2D();
      let strokePath = new Path2D();

      for (const key in this.nodes) {
        const node = this.nodes[key];

        fillPath.rect(node.metadata.position[0] * cDiv + 1, node.metadata.position[1] * cDiv + 1, cDiv - 2, cDiv - 2);

        node.edges.forEach((key) => {
          strokePath.moveTo(node.metadata.position[0] * cDiv + (cDiv / 2), node.metadata.position[1] * cDiv + (cDiv / 2));
          strokePath.lineTo(this.nodes[key].metadata.position[0] * cDiv + (cDiv / 2), this.nodes[key].metadata.position[1] * cDiv + (cDiv / 2));
        });
      }

      ctx.fill(fillPath);
      ctx.stroke(strokePath);

      ctx.fillStyle = '#AAFFAA';
      ctx.fillRect(this.nodes[this.start].metadata.position[0] * cDiv + 1, this.nodes[this.start].metadata.position[1] * cDiv + 1, cDiv - 2, cDiv - 2);
      ctx.fillStyle = '#FFAAAA';
      ctx.fillRect(this.nodes[this.end].metadata.position[0] * cDiv + 1, this.nodes[this.end].metadata.position[1] * cDiv + 1, cDiv - 2, cDiv - 2);
    }
  }

  __exports.Maze = Maze;

  maze_gen = Object.assign(__exports);
})();
