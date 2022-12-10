let maze_renderer;

(() => {
  const __exports = {};

  class MazeRenderer {
    constructor(maze) {
      this.maze = maze;

      this.style = null; // rect or hex
      this.wallThickness = 4;
      this.cDiv = null;
      this.nodeWidth = null;
      this.pathWidth = null;
      this.renderSolved = false;

      // Generic maze and user colors
      this.startColor = '#88ff88';
      this.endColor = '#ff8888';
      this.pathColor = '#16161d';
      this.wallColor = '#888888';
      this.userPathColor = '#8888ff';
      this.highlightColor = '#FF9955';

      // computer yield colors
      this.compCurrentColor = '#f0f';
      this.compClosedColor = '#A000A0';
      this.compOpenColor = '#0f0';
      this.compPathColor = '#b080b0';

    }

    setSizes(cDiv, wallThickness) {
      this.wallThickness = wallThickness;
      this.cDiv = cDiv;
      this.nodeWidth = this.cDiv - this.wallThickness;
      this.pathWidth = this.cDiv - (this.wallThickness * 2);
    }

    showSolved() {
      this.renderSolved = true;
    }

    hideSolved() {
      this.renderSolved = false;
    }

    resetRenderMetadata() {
      for (const nodeKey in this.maze.nodes) {
        const node = this.maze.nodes[nodeKey];

        for (const renderKey in node.metadata.render) {
          if (renderKey === "isStart" || renderKey === "isEnd") continue;
          node.metadata.render[renderKey] = false;
        }
      }
    }

    renderMaze(ctx) {
      switch(this.maze.gridType) {
        case 'rect':
        default:
          ctx.fillStyle =this.wallColor;
          ctx.fillRect(0, 0, this.maze.xTiles * this.cDiv + (this.wallThickness / 2), this.maze.yTiles * this.cDiv + (this.wallThickness / 2));

          ctx.fillStyle = this.pathColor;

          ctx.strokeStyle = this.pathColor;
          ctx.lineWidth = this.nodeWidth;

          let fillPath = new Path2D();
          let strokePath = new Path2D();

          for (const nodeKey in this.maze.nodes) {
            const node = this.maze.nodes[nodeKey];

            fillPath.rect(node.metadata.position[0] * this.cDiv + (this.wallThickness / 2), node.metadata.position[1] * this.cDiv + (this.wallThickness / 2), 
              this.nodeWidth, this.nodeWidth);

            node.edges.forEach((edgeKey) => {
              strokePath.moveTo(node.metadata.position[0] * this.cDiv + (this.cDiv / 2), node.metadata.position[1] * this.cDiv + (this.cDiv / 2));
              strokePath.lineTo(this.maze.nodes[edgeKey].metadata.position[0] * this.cDiv + (this.cDiv / 2), this.maze.nodes[edgeKey].metadata.position[1] * this.cDiv + (this.cDiv / 2));
            });
          }

          ctx.fill(fillPath);
          ctx.stroke(strokePath);

          ctx.fillStyle = this.startColor;
          ctx.fillRect(this.maze.nodes[this.maze.start].metadata.position[0] * this.cDiv + (this.wallThickness / 2), this.maze.nodes[this.maze.start].metadata.position[1] * this.cDiv + (this.wallThickness / 2),
            this.nodeWidth, this.nodeWidth);
          ctx.fillStyle = this.endColor;
          ctx.fillRect(this.maze.nodes[this.maze.end].metadata.position[0] * this.cDiv + (this.wallThickness / 2), this.maze.nodes[this.maze.end].metadata.position[1] * this.cDiv + (this.wallThickness / 2),
            this.nodeWidth, this.nodeWidth);
      }
    }

    updateNode(x, y, buttons) {
      // calulate X anf Y relative to the grid
      let nodeX = Math.floor(x / cDiv);
      let nodeY = Math.floor(y / cDiv);

      if (nodeX >= this.maze.xTiles || nodeY >= this.maze.yTiles) return;

      // get the key of the node
      let loc = `${nodeX}.${nodeY}`;

      // if the user is trying to update the node they just updated, ignore.
      if (lastUpdated[lastUpdated.length - 1] === loc) return;

      // get the metadata for the requested node
      let renderInfo = this.maze.nodes[loc].metadata.render;

      // if it was a left click
      if (buttons == 1) {
        // if there are nodes in the lastUpdated array
        if (lastUpdated.length > 0) {
          // if the user is trying to toggle a node that is not an edge of any of the previously toggled nodes, ignore.
            // this only applies to nodes changed since the user started the current interaction
          // lastUpdated will be cleared on control release.
            let isNeighbor = false;
          lastUpdated.forEach(key => {
            if(maze.nodes[key].edges.indexOf(loc) != -1) isNeighbor = true;
          });

          if (!isNeighbor)
            return;
        }

        // if the draw state for this control interaction has not yet been defined, use the userPath value of the current node to define it.
          // this is cleared on control release
        if (drawState == undefined) {
          if (renderInfo.userPath)
            drawState = 0;
          else 
            drawState = 1;
        }

        // if we are drawing, not erasing
        if (drawState) {
          // set userPath value of current node
          renderInfo.userPath = true;
          renderInfo.highlighted = false;
        } else {
          // we are erasing, not drawing
          // set userPath value of the current node
          renderInfo.userPath = false;
          renderInfo.highlighted = false;
        }
      } else if (buttons == 2) {
        if (drawState == undefined) {
          if (renderInfo.highlighted)
            drawState = 0;
          else 
            drawState = 1;
        }

        if (drawState) {
          renderInfo.highlighted = true;
        } else {
          renderInfo.highlighted = false;
        }
      }

      switch (this.maze.gridType) {
        case 'hex':
          console.log("hexagonal maze rendering has not been implemented yet.");
          break;
        case 'rect':
        default:
          this.renderNode(loc, ctx);
      }

      lastUpdated.push(loc);
    }
    
    getNodeColor(key) {
      const render = this.maze.nodes[key].metadata.render;

      if (render.highlighted) {
        console.log('highlighted');
        return this.highlightColor;
      } else if (render.userPath) {
        console.log('userPath');
        return this.userPathColor;
      } else if (render.compPath && this.renderSolved) {
        console.log('compPath');
        return this.compPathColor;
      } else if (render.compCurrent) {
        console.log('compCurrent');
        return this.compCurrentColor;
      } else if (render.compOpen) {
        console.log('compOpen');
        return this.compOpenColor;
      } else if (render.compClosed) {
        console.log('compClosed');
        return this.compClosedColor;
      } else if (render.isStart) {
        console.log('isStart');
        return this.startColor;
      } else if (render.isEnd) {
        console.log('isEnd');
        return this.endColor;
      } else {
        console.log('default');
        return this.pathColor;
      }
    }

    renderNode(key, ctx) {
      switch (this.maze.gridType) {
        case 'rect':
        default:
          ctx.fillStyle = this.getNodeColor(key);

          const node = this.maze.nodes[key];

          ctx.fillRect(node.metadata.position[0] * this.cDiv + this.wallThickness, node.metadata.position[1] * this.cDiv + this.wallThickness, 
            this.pathWidth, this.pathWidth);
      }
    }

    renderConnection(key1, key2, ctx) {
      switch (this.maze.gridType) {
        case 'rect':
        default:
          ctx.strokeStyle = this.getNodeColor(key1);
          ctx.lineWidth = this.cDiv - (this.wallThickness * 2);

          const node1 = this.maze.nodes[key1];
          const node2 = this.maze.nodes[key2];

          ctx.beginPath();
          ctx.moveTo(node1.metadata.position[0] * this.cDiv + (this.cDiv / 2), node1.metadata.position[1] * this.cDiv + (this.cDiv / 2));
          ctx.lineTo(node2.metadata.position[0] * this.cDiv + (this.cDiv / 2), node2.metadata.position[1] * this.cDiv + (this.cDiv / 2));
          ctx.stroke();
      }

    }

    renderSolvedPath(ctx) {
      switch (this.maze.gridType) {
        case 'rect':
        default:
          for (let i = 0; i < this.maze.solvedPath.length - 1; i++) {
            this.maze.nodes[this.maze.solvedPath[i]].metadata.render.compPath = true;
            this.renderNode(this.maze.solvedPath[i], ctx);
            //this.renderConnection(this.maze.solvedPath[i], this.maze.solvedPath[i+1], ctx);
          }
          this.maze.nodes[this.maze.solvedPath[this.maze.solvedPath.length - 1]].metadata.render.compPath = true;
          this.renderNode(this.maze.solvedPath[this.maze.solvedPath.length - 1], ctx);
      }
    }

    renderYield(ctx, state) {
      for (const key in state.closedSet) {
        this.maze.nodes[key].metadata.render.compCurrent = false;
        this.maze.nodes[key].metadata.render.compOpen = false;
        this.maze.nodes[key].metadata.render.compClosed = true;
        this.renderNode(key, ctx);
      }

      this.maze.nodes[state.currentKey].metadata.render.compCurrent = true;
      this.renderNode(state.currentKey, ctx);
      
      for (const key in state.openSet) {
        this.maze.nodes[key].metadata.render.compCurrent = false;
        this.maze.nodes[key].metadata.render.compClosed = false;
        this.maze.nodes[key].metadata.render.compOpen = true;
        this.renderNode(key, ctx);
      }
    }
  }

  __exports.MazeRenderer = MazeRenderer;

  maze_renderer = Object.assign(__exports);
})();
