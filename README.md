## NAD-MAZE-SOLVER

This maze solver works by keep to the left. It is possible to create an imposible maze, so the code has a hard coded maximum of 1000 iterations.

## Assumptions

- maze file is utf8 encoded
- maze file encodes new lines as `\n`
- maze is a rectangle or square

## Requirements

- [NodeJs 11+](https://nodejs.org/en/download/)
- [YarnPkg](https://yarnpkg.com/lang/en/docs/install/)

# Setup

From a console, run:

```bash
cd <project-folder>
yarn
```

# How to use

From a console, run:

```bash
cd <project-folder>
node ./solve-maze.js maze.txt
```
