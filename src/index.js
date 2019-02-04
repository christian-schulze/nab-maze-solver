const fs = require("fs");
const path = require("path");

const { logMessage } = require("./utils");

const POSITION_TYPE = {
  START: "S",
  END: "F",
  WALL: "#",
  SPACE: " "
};

function loadMaze(mazePath) {
  const rows = fs
    .readFileSync(path.resolve(mazePath), { encoding: "utf8" })
    .split("\n");

  return rows.map(line => line.split(""));
}

function findPositionByType(maze, positionType) {
  let x = -1;
  let y = -1;

  for (let row of maze) {
    x = row.findIndex(column => column === positionType);
    y = y + 1;

    if (x > -1) {
      return { x, y };
    }
  }

  throw new Error(`Position type ${positionType} not found.`);
}

function isPositionOfType(maze, positonType, position) {
  return (
    position.y >= 0 &&
    position.y <= maze.length &&
    position.x >= 0 &&
    position.x <= maze[position.y].length &&
    maze[position.y][position.x] === positonType
  );
}

function leftOfCurrentDirection(direction = "WEST") {
  return {
    WEST: "SOUTH",
    NORTH: "WEST",
    EAST: "NORTH",
    SOUTH: "EAST"
  }[direction];
}

function* generatePositions(currentPosition) {
  const directions = ["WEST", "NORTH", "EAST", "SOUTH"];
  const positions = [
    [
      "WEST",
      { x: currentPosition.x - 1, y: currentPosition.y, direction: "WEST" }
    ],
    [
      "NORTH",
      { x: currentPosition.x, y: currentPosition.y - 1, direction: "NORTH" }
    ],
    [
      "EAST",
      { x: currentPosition.x + 1, y: currentPosition.y, direction: "EAST" }
    ],
    [
      "SOUTH",
      { x: currentPosition.x, y: currentPosition.y + 1, direction: "SOUTH" }
    ]
  ];

  const startDirection = leftOfCurrentDirection(currentPosition.direction);

  let currentIndex = directions.findIndex(
    direction => direction === startDirection
  );

  for (let _ of [0, 1, 2, 3]) {
    yield positions[currentIndex];

    if (currentIndex >= 3) {
      currentIndex = 0;
    } else {
      currentIndex = currentIndex + 1;
    }
  }
}

function findNextPosition(maze, currentPosition) {
  const positions = new Map([...generatePositions(currentPosition)]);

  for (let [direction, position] of positions) {
    if (
      isPositionOfType(maze, POSITION_TYPE.SPACE, position) ||
      isPositionOfType(maze, POSITION_TYPE.END, position)
    ) {
      return position;
    }
  }

  throw new Error("Could not find next position.");
}

function hasFinished(currentPosition, endPosition) {
  return (
    currentPosition.x === endPosition.x && currentPosition.y === endPosition.y
  );
}

function renderMaze(maze, positionHistory) {
  const updatedMaze = maze.map(row => [...row]);

  positionHistory.forEach(position => {
    updatedMaze[position.y][position.x] = "*";
  });

  updatedMaze.forEach(row => logMessage(row.join("")));
}

function solveMaze(maze, maxIterations = 1000) {
  const startPosition = findPositionByType(maze, POSITION_TYPE.START);
  const endPosition = findPositionByType(maze, POSITION_TYPE.END);
  const positionHistory = [startPosition];

  // iterate `maxIterations` times in case of infinite loop bugs
  for (let _ of Array(maxIterations).fill("")) {
    const currentPosition = positionHistory[positionHistory.length - 1];
    const nextPosition = findNextPosition(maze, currentPosition);
    positionHistory.push(nextPosition);

    if (hasFinished(nextPosition, endPosition)) {
      logMessage(`Maze solved in ${positionHistory.length} steps.`);
      return positionHistory;
    }
  }

  logMessage(`Could not solve maze in ${maxIterations} steps, giving up.`);
  return positionHistory;
}

module.exports = {
  POSITION_TYPE,
  loadMaze,
  findPositionByType,
  findNextPosition,
  hasFinished,
  renderMaze,
  solveMaze
};
