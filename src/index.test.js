const { logMessage } = require("./utils");
const {
  findNextPosition,
  findPositionByType,
  hasFinished,
  loadMaze,
  POSITION_TYPE,
  renderMaze,
  solveMaze
} = require("./index");

jest.mock("./utils", () => ({
  ...require.requireActual("./utils"),
  logMessage: jest.fn()
}));

describe("index", () => {
  describe("loadMaze()", () => {
    it("returns a nested array containing maze data", () => {
      expect(loadMaze("src/test/maze.txt")).toEqual([
        ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
        ["S", " ", "#", " ", " ", " ", "#", " ", " ", " ", "#"],
        ["#", " ", "#", " ", "#", " ", "#", " ", "#", " ", "#"],
        ["#", " ", " ", " ", "#", " ", " ", " ", "#", " ", "#"],
        ["#", "#", "#", "#", "#", "#", "#", "#", "#", " ", "#"],
        ["#", " ", "#", " ", " ", " ", " ", " ", " ", " ", "#"],
        ["#", " ", "#", " ", "#", "#", "#", "#", "#", "#", "#"],
        ["#", " ", "#", " ", " ", " ", "#", " ", " ", " ", "#"],
        ["#", " ", "#", " ", "#", " ", "#", "#", "#", " ", "#"],
        ["#", " ", " ", " ", "#", " ", " ", " ", " ", " ", "F"],
        ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]
      ]);
    });
  });

  describe("findPositionByType()", () => {
    const maze = [
      ["#", "#", "#"],
      ["S", " ", "#"],
      ["#", " ", "F"],
      ["#", "#", "#"]
    ];

    it("returns the start position", () => {
      expect(findPositionByType(maze, POSITION_TYPE.START)).toEqual({
        x: 0,
        y: 1
      });
    });

    it("returns the end position", () => {
      expect(findPositionByType(maze, POSITION_TYPE.END)).toEqual({
        x: 2,
        y: 2
      });
    });

    it("throws an exception if position is not found", () => {
      expect(() => findPositionByType(maze, "X")).toThrowError(
        "Position type X not found."
      );
    });
  });

  describe("findNextPosition()", () => {
    describe("When there is no direction (first move)", () => {
      it("finds the next position", () => {
        const maze = [
          ["#", "#", "#"],
          ["S", " ", "#"],
          ["#", " ", "F"],
          ["#", "#", "#"]
        ];
        const currentPosition = { x: 0, y: 1 };

        expect(findNextPosition(maze, currentPosition)).toEqual({
          x: 1,
          y: 1,
          direction: "EAST"
        });
      });
    });

    describe("When first direction is not blocked", () => {
      it("finds the next position", () => {
        const maze = [
          ["#", "#", "#"],
          ["#", " ", "F"],
          ["S", " ", "#"],
          ["#", "#", "#"]
        ];
        const currentPosition = { x: 1, y: 2, direction: "EAST" };

        expect(findNextPosition(maze, currentPosition)).toEqual({
          x: 1,
          y: 1,
          direction: "NORTH"
        });
      });
    });

    describe("When first direction is blocked", () => {
      it("finds the next position", () => {
        const maze = [["#", "#", "#"], ["S", " ", "F"], ["#", "#", "#"]];
        const currentPosition = { x: 1, y: 1, direction: "EAST" };

        expect(findNextPosition(maze, currentPosition)).toEqual({
          x: 2,
          y: 1,
          direction: "EAST"
        });
      });
    });

    describe("When second direction is blocked", () => {
      it("finds the next position", () => {
        const maze = [
          ["#", "#", "#"],
          ["S", " ", "#"],
          ["#", " ", "F"],
          ["#", "#", "#"]
        ];
        const currentPosition = { x: 1, y: 1, direction: "EAST" };

        expect(findNextPosition(maze, currentPosition)).toEqual({
          x: 1,
          y: 2,
          direction: "SOUTH"
        });
      });
    });

    describe("When there is a deadend", () => {
      it("finds the next position", () => {
        const maze = [
          ["#", "#", "#", "#"],
          ["S", " ", " ", "#"],
          ["#", " ", "#", "#"],
          ["#", " ", " ", "F"],
          ["#", "#", "#", "#"]
        ];
        const currentPosition = { x: 2, y: 1, direction: "EAST" };

        expect(findNextPosition(maze, currentPosition)).toEqual({
          x: 1,
          y: 1,
          direction: "WEST"
        });
      });
    });

    describe("When no position can be found", () => {
      it("throws an error", () => {
        const maze = [["S", "#"], ["#", "F"]];
        const currentPosition = { x: 0, y: 0 };

        expect(() => findNextPosition(maze, currentPosition)).toThrowError(
          "Could not find next position."
        );
      });
    });
  });

  describe("hasFinished()", () => {
    it("returns false if current position is not end of maze", () => {
      const currentPosition = { x: 10, y: 5 };
      const endPosition = { x: 0, y: 2 };

      expect(hasFinished(currentPosition, endPosition)).toEqual(false);
    });

    it("returns true if current position is end of maze", () => {
      const currentPosition = { x: 10, y: 5 };
      const endPosition = { x: 10, y: 5 };

      expect(hasFinished(currentPosition, endPosition)).toEqual(true);
    });
  });

  describe("renderMaze()", () => {
    it("renders the maze overlaying position history", () => {
      const maze = [
        ["#", "#", "#"],
        ["S", " ", "#"],
        ["#", " ", "F"],
        ["#", "#", "#"]
      ];
      const positionHistory = [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 2 }
      ];

      renderMaze(maze, positionHistory);

      expect(logMessage).toHaveBeenCalledWith("###");
      expect(logMessage).toHaveBeenCalledWith("**#");
      expect(logMessage).toHaveBeenCalledWith("#**");
      expect(logMessage).toHaveBeenCalledWith("###");
    });
  });

  describe("solveMaze()", () => {
    describe("On success", () => {
      const maze = [
        ["#", "#", "#"],
        ["S", " ", "#"],
        ["#", " ", "F"],
        ["#", "#", "#"]
      ];
      const positionHistory = [
        { x: 0, y: 1 },
        { x: 1, y: 1, direction: "EAST" },
        { x: 1, y: 2, direction: "SOUTH" },
        { x: 2, y: 2, direction: "EAST" }
      ];

      it("returns the position history", () => {
        expect(solveMaze(maze)).toEqual(positionHistory);
      });

      it("logs a solved message", () => {
        solveMaze(maze);

        expect(logMessage).toHaveBeenCalledWith("Maze solved in 4 steps.");
      });
    });

    describe("On failure (unsolvable in x iterations)", () => {
      const maze = [
        ["#", "#", "#", "#", "#", "#"],
        ["#", " ", " ", " ", " ", "#"],
        ["#", " ", " ", "S", " ", "#"],
        ["#", " ", " ", " ", " ", "#"],
        ["#", " ", " ", " ", " ", "#"],
        ["#", " ", " ", " ", " ", "F"],
        ["#", "#", "#", "#", "#", "#"]
      ];
      const positionHistory = [
        { x: 0, x: 3, y: 2 },
        {
          direction: "SOUTH",
          x: 3,
          y: 3
        },
        {
          direction: "EAST",
          x: 4,
          y: 3
        },
        {
          direction: "NORTH",
          x: 4,
          y: 2
        },
        {
          direction: "NORTH",
          x: 4,
          y: 1
        },
        {
          direction: "WEST",
          x: 3,
          y: 1
        },
        {
          direction: "WEST",
          x: 2,
          y: 1
        },
        {
          direction: "SOUTH",
          x: 2,
          y: 2
        },
        {
          direction: "SOUTH",
          x: 2,
          y: 3
        },
        {
          direction: "EAST",
          x: 3,
          y: 3
        },
        {
          direction: "EAST",
          x: 4,
          y: 3
        }
      ];

      it("returns the position history", () => {
        expect(solveMaze(maze, 10)).toEqual(positionHistory);
      });

      it("logs a solved message", () => {
        solveMaze(maze, 10);

        expect(logMessage).toHaveBeenCalledWith(
          "Could not solve maze in 10 steps, giving up."
        );
      });
    });
  });
});
