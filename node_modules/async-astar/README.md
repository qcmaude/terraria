[![NPM](https://nodei.co/npm/async-astar.png?downloads=true)](https://nodei.co/npm/async-astar/)

Async-Astar 
===

[![Build Status](https://travis-ci.org/tssweeney/async-astar.svg)](https://travis-ci.org/tssweeney/async-astar)

**[View Documentation](http://timssweeney.com/async-astar/src/AsyncAstar.js.html)**

**[Read About A\*(A-Star) Algorithm Here](http://en.wikipedia.org/wiki/A*_search_algorithm)**

This module provides an asynchronous, generic A\* implementation that can be used to solve various puzzles, games, or graph traversals. There are 2 main concepts to understand: neighbors and heuristics. Check out the tests for usage examples, but here's a quick overview:

### Usage

```
var AsyncAstar = require('async-astar');
var options = {
  initial: {StateObject}
  neighbors: {Function},
  [heuristic]: {Function},
  [timeout]: {Integer},
  onComplete: {Function},
  [onTimeout]: {Function}
}
var solver = new AsyncAstar(options);
```

##### StateObject {Object}
An object used by the solving algorithm to represent a single state in the puzzle/game/graph. The three required fields are:

* id {String} Uniquely identifies puzzle/game state
* state {Integer} -1|0|1 Impossible|Playing|Win respectively. This a-star solver can handle impossible cases (perhaps a wall, or a pit of doom).
* action {String|Integer} This is the last "thing" you had to do to get to this state. Upon solving the puzzle, the returned "path" is an array of the action attributes of the most efficient path. It might be a cardinal direction, a key-press, something that would work like this:

```
MyGame.takeAction(0);
MyGame.getState();
// ->
// {... action: 0 ...}
```

Additionally, if you need to store information that is needed to determine a state's neighbors or heuristic, append those attributes to this object. This might be x/y coordinates of your player.

##### initial {StateObject}
An object that represents the initial state to solve from.

```
initial: {
	id: "x1y5"
	state: 0,
	// action is null, because it is the starting state. Nothing came before.
	action: null,
	x: 1,	
	y: 5
}
```

##### neighbors {Function}
A function that accepts a single StateObject as the only parameter and returns an array of neighbors. For example:

```
neighbors: function(state){
	var neighborStates = [];
	MyGame.setPlayer({
		x: state.x,
		y: state.y
	});
	neighborStates.push(MyGame.moveUp.getState());
	neighborStates.push(MyGame.moveRight.getState());
	neighborStates.push(MyGame.moveDown.getState());
	neighborStates.push(MyGame.moveLeft.getState());
	return neighborStates;
}
```

Note, let's say that there is a game-rule (business rule of the game - maybe a wall or something) that is stopping the player from moving up. `The MyGame.moveUp.getState()` call should return a StateObject that has the same `id` as the original state. The A\* algorithm can then understand that the move resulted in the same state. This is also how the algorithm resolves circular paths. 

##### [optional] heuristic {Function}
A function that accepts a single StateObject as the only parameter and returns an integer - the lower the value, the better. A heuristic is an estimation of "closeness" to the end and defaults to a function returning 0 for all states. Read more about the principles of a heuristic here: [wiki](http://en.wikipedia.org/wiki/A*_search_algorithm#Admissibility_and_optimality). For example:

```
heuristic: function(state) {
	var endLocation = MyGame.getEndLocation();
	return Math.abs(state.x - endLocation.x) + Math.abs(state.y - endLocation.y)
}
```

##### [optional] timeout {Integer}
Number of milliseconds before timeout is called and solving halts. Defaults to no timeout.

##### onComplete {Function}
Function that is called once the solution has been found. It accepts a single argument that will have 3 attributes:

* success {Boolean} if the puzzle was solved
* actions {Array} of `action` attributes of each state to get to solution
* cost {Integer} count of actions needed (actions.length - 1)

```
onComplete: function(result) {
	if (result.success) {
		console.log("The steps(" + result.cost + ") required to solve the puzzle are: ", result.actions);
	} else {
		console.log("There is no solution to the puzzle.");
	}
}
```

##### [optional] onTimeout {Function}
Called if the solver times out. No parameters needed.

```
onTimeout: function(){
	console.log("Solver timed out.");
}
```
