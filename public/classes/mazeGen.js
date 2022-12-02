let maze_gen;

(() => {
  const __exports = {};

  function RouletteSelect(src) {
    const roll = Math.random() * src.length;

    let sum = 0;
    for (let i = 0; i < src.length; i++) {
      sum += 1.0;
      if (roll < sum) {
        const res = src[i];
        src = src.splice(i, 1);
        return res;
      }
    }
  }

  const _key = (x, y) => x + '.' + y;

  __exports.getKey = _key;

  class Maze {
    constructor(nodes) {
      this.nodes = nodes;
      this.start = null;
      this.end = null;
      this.style = null; // rect or hex
      this.visited = {};
    }

    setStart(start) {
      this.start = start;
    }

    setEnd(end) {
      this.end = end;
    }

    generate(nodeKey) {
      this.visited[nodeKey] = true;

      const node = this.nodes[nodeKey];

      node.metadata.render.visited = true;
      node.metadata.render.active = true;

      const neighbors = [...node.potentialEdges];
      while (neighbors.length > 0) {
        const ki = RouletteSelect(neighbors);

        if (!(ki in this.visited)) {
          node.metadata.render.active = true;

          const adjNode = this.nodes[ki];

          node.edges.push(ki);
          adjNode.edges.push(nodeKey);
          node.metadata.render.active = false;
          this.generate(ki);
          node.metadata.render.active = true;
        }
      }

      node.metadata.render.active = false;
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
