importScripts('../classes/mazeGen.js', '../classes/graph.js');

const { Graph } = _graph;
const { Maze, getKey } = maze_gen;

let canvas, ctx;
let cDiv;
let xTiles, yTiles;

let graph, maze;

let interval;

self.onmessage = event => {
        switch (event.data.msgType) {
                case "toggleTask":
                        console.log("toggleTask");
                        //toggleTask(event.data.state, event.data.fps);
                        step();
                        break;
                case 'resizeCanvas':
                        canvas.width = event.data.width;
                        canvas.height = event.data.height;

                        xTiles = Math.floor(canvas.width / cDiv);
                        yTiles = Math.floor(canvas.height / cDiv);

                        init();

                        break;
                case 'task':
                        canvas = event.data.canvas;
                        cDiv = event.data.cDiv;

                        xTiles = Math.floor(canvas.width / cDiv);
                        yTiles = Math.floor(canvas.height / cDiv);

                        ctx = canvas.getContext('2d');
                        ctx.imageSmoothingEnabled = false;
                        ctx.lineWidth = 1;

                        //TODO
                        init();

                        postMessage({ msgType: "ready" });
                        break;
                case "newMaze":
                        init();
                        break;
                case "clearPath":
                        console.log("clearPath()");
                        break;
                case "terminate":
                        //console.log("waiter terminated");
                        self.close();
                        break;
        }
};

postMessage({ msgType: "clockIn" });

function init() {
        initGraph();
        newMaze();
}

function initGraph() {
        graph = new Graph();

        for (let x = 0; x < xTiles; x++) {
                for (let y = 0; y < yTiles; y++) {
                        const key = getKey(x, y);
                        graph.AddNode(key, [], {
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

                                        if (ki in graph.Nodes) {
                                                graph.Nodes[key].potentialEdges.push(ki)
                                        }
                                }
                        }
                }
        }
}

function newMaze() {
        const start = getKey(0, 0);
        const end = getKey(xTiles - 1, yTiles - 1);

        maze = new Maze(graph.Nodes);
        maze.setStart(start);
        maze.setEnd(end);
        maze.generate(start);
        maze.render(ctx, xTiles, yTiles, cDiv);
}

function step() {

}

function toggleTask(state, fps) {
        if (state) {
                setTimeInterval(fps);
        } else {
                clearTimeInterval();
        }
}

function setTimeInterval(fps) {
        clearTimeInterval();

        interval = setInterval(step, 1000 / fps);
}

function clearTimeInterval() {
        if (interval) {
                clearInterval(interval);
        }
}
