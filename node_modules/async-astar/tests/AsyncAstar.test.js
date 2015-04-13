var assert = require("assert");
var AsyncAstar = require("../src/AsyncAstar.js");

describe('AsyncAstar', function() {
  describe('#Maze0', function() {
    it('should find the correct path', function(done) {
      var maze = new Maze(mazes[0]);
      var solver = new AsyncAstar({
        initial: maze.state(),
        neighbors: maze.neighbors,
        heuristic: maze.heuristic,
        onComplete: function(solution) {
          assert(solution.success);
          assert(JSON.stringify(solution.actions) == "[null,1]");
          assert(solution.cost == 1);
          done();
        }
      });
    });
  });
  describe('#Maze1', function() {
    it('should find the correct path', function(done) {
      var maze = new Maze(mazes[1]);
      var solver = new AsyncAstar({
        initial: maze.state(),
        neighbors: maze.neighbors,
        heuristic: maze.heuristic,
        onComplete: function(solution) {
          console.log(solution);
          assert(solution.success);
          assert(JSON.stringify(solution.actions) == "[null,2,2,1,1,0,0,1,1,2,2,2,2]");
          assert(solution.cost == 12);
          done();
        }
      });
    });
  });
  describe('#Maze2', function() {
    it('should be unsolvable path', function(done) {
      var maze = new Maze(mazes[2]);
      var solver = new AsyncAstar({
        initial: maze.state(),
        neighbors: maze.neighbors,
        heuristic: maze.heuristic,
        onComplete: function(solution) {
          assert(!solution.success);
          assert(JSON.stringify(solution.actions) == "[]");
          assert(solution.cost === 0);
          done();
        }
      });
    });
  });
  describe('#Maze3', function() {
    it('should timeout', function(done) {
      var maze = new Maze(mazes[2]);
      var solver = new AsyncAstar({
        initial: maze.state(),
        neighbors: function badNeighborFunction() {
          return [{
            id: Math.random(),
            state: 0
          }, {
            id: Math.random(),
            state: 0
          }];
        },
        heuristic: maze.heuristic,
        onComplete: function(solution) {
          assert(false);
          done();
        },
        onTimeout: function() {
          done();
        },
        timeout: 1
      });
    });
  });
});

/* MAZE TEST DATA */
var mazes = [{
  x: 1,
  y: 1,
  end: {
    x: 2,
    y: 1
  },
  maze: [
    [-1, -1, -1, -1],
    [-1, 0, 1, -1],
    [-1, -1, -1, -1]
  ]
}, {
  x: 1,
  y: 1,
  end: {
    x: 5,
    y: 5
  },
  maze: [
    [-1, -1, -1, -1, -1, -1, -1],
    [-1, +0, -1, +0, +0, +0, -1],
    [-1, +0, -1, +0, -1, +0, -1],
    [-1, +0, +0, +0, -1, +0, -1],
    [-1, +0, -1, +0, -1, +0, -1],
    [-1, +0, -1, +0, -1, +1, -1],
    [-1, -1, -1, -1, -1, -1, -1],
  ]
}, {
  x: 1,
  y: 1,
  end: {
    x: 5,
    y: 5
  },
  maze: [
    [-1, -1, -1, -1, -1, -1, -1],
    [-1, +0, -1, +0, +0, +0, -1],
    [-1, +0, -1, +0, -1, +0, -1],
    [-1, +0, -1, +0, -1, +0, -1],
    [-1, +0, -1, +0, -1, +0, -1],
    [-1, +0, -1, +0, -1, +1, -1],
    [-1, -1, -1, -1, -1, -1, -1],
  ]
}];

/* Simple Maze Class for testing */

var Maze = function Maze(mazeDescription) {
  var self = this;
  this.x = mazeDescription.x;
  this.y = mazeDescription.y;
  this.end = mazeDescription.end;
  this.m = mazeDescription.maze;

  this.state = function getState() {
    return {
      id: "" + self.x + "" + self.y,
      x: self.x,
      y: self.y,
      action: null,
      state: self.m[self.y][self.x]
    };
  };

  this.neighbors = function getNeighbors(state) {
    var n = [];
    n.push({
      id: "" + (state.x - 1) + "" + state.y,
      x: state.x - 1,
      y: state.y,
      action: 3,
      state: self.m[state.y][state.x - 1]
    });

    n.push({
      id: "" + (state.x + 1) + "" + state.y,
      x: state.x + 1,
      y: state.y,
      action: 1,
      state: self.m[state.y][state.x + 1]
    });

    n.push({
      id: "" + state.x + "" + (state.y - 1),
      x: state.x,
      y: state.y - 1,
      action: 0,
      state: self.m[state.y - 1][state.x]
    });

    n.push({
      id: "" + state.x + "" + (state.y + 1),
      x: state.x,
      y: state.y + 1,
      action: 2,
      state: self.m[state.y + 1][state.x]
    });

    return n;
  };

  this.heuristic = function heuristic(state) {
    return Math.abs(state.x - self.end.x) + Math.abs(state.y - self.end.y);
  };

  return this;
};
