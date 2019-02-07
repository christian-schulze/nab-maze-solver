const { loadMaze, renderMaze, solveMaze } = require("./src");

const args = process.argv.splice(process.execArgv.length + 2);

const mazePath = args[0];
const maze = loadMaze(mazePath);
const positionHistory = solveMaze(maze);
renderMaze(maze, positionHistory);

process.exit(0);
