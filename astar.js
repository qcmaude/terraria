function find(coll, el, f) {
  var max = coll.length;
  for (var i = 0; i < max; ++i){
    if(f(coll[i], el)) {
      return coll[i];
    }
  }

  return null;
}

function contains(coll, el, f) {
  return find(coll, el, f) !== null;
}

function remove(arr, el, f) {
  var max = arr.length;
  var i = 0;
  for (; i < max; i++){
    if(f(arr[i], el)) break;
  }
  arr.splice(i, 1);
}

function hashPoint(p) {
  return "" + p.x + "-" + p.y;
}

function comparePoints(p1, p2) {
  return p1.x === p2.x && p1.y === p2.y;
}

function findPath(space, start, end){
  var isFunc = (typeof end == "function");
  var openSet = [start];
  var closedSet = [];
  var cameFrom = {};
  var gScore = {};
  var fScore = {};
  gScore[hashPoint(start)] = Astar.getWeight(start);

  if(isFunc) fScore[hashPoint(start)] = gScore[hashPoint(start)];
  else fScore[hashPoint(start)] = gScore[hashPoint(start)] + Astar.heuristicEstimate(start, end);

  while(openSet.length > 0) {
    var cur = openSet[0];
    for(var i = 1; i < openSet.length; i++) {
      if(fScore[hashPoint(openSet[i])] < fScore[hashPoint(cur)]) cur = openSet[i];
    }

    // we've reached the end, we're all goods
    if(!isFunc && comparePoints(cur, end)) {
      return constructPath(cameFrom, end);
    } else if (isFunc) {
      var maybePoint = end(cur);
      if(maybePoint) {
        return constructPath(cameFrom, maybePoint);
      }
    }

    remove(openSet, cur, comparePoints);
    closedSet.push(cur);

    var allNeighbours = Astar.findNeighbours(space, cur);
    for (var n in allNeighbours){
      var neighbour = allNeighbours[n];
      if(contains(closedSet, neighbour, comparePoints)) continue;

      var tentativeGScore = gScore[hashPoint(cur)] + Astar.getWeight(neighbour);
      var neighbourHash = hashPoint(neighbour);
      if(!contains(openSet, neighbour, comparePoints) || tentativeGScore < gScore[neighbourHash]) {

        cameFrom[neighbourHash] = cur;
        gScore[neighbourHash] = tentativeGScore;

        if(!isFunc) fScore[neighbourHash] = gScore[neighbourHash];
        else fScore[neighbourHash] = gScore[neighbourHash] + Astar.heuristicEstimate(neighbour, end);

        if(!contains(openSet, neighbour, comparePoints)) {
          openSet.push(neighbour);
        }
      }
    }
  }

  // We haven't reached the end, it's unreachable
  return [];
}

function heuristicEstimate(p1, p2) {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p1.y);
}

function findNeighbours(space, p) {
  var arr = [];
  if(p.x + 1 < space.length && !Astar.isBlocked(space[p.x + 1][p.y])) arr.push(space[p.x + 1][p.y]);
  if(p.x - 1 >= 0 && !Astar.isBlocked(space[p.x - 1][p.y])) arr.push(space[p.x - 1][p.y]);

  if(p.y + 1 < space[p.x].length && !Astar.isBlocked(space[p.x][p.y + 1])) arr.push(space[p.x][p.y + 1]);
  if(p.y - 1 >= 0 && !Astar.isBlocked(space[p.x][p.y - 1])) arr.push(space[p.x][p.y - 1]);

  return arr;
}

function isBlocked(node) {
  return node.blocked;
}

function getWeight(node) {
  return node.moveDifficulty;
}

function constructPath(cameFrom, end) {
  var cur = end;
  var path = [cur];
  while(cameFrom[hashPoint(cur)] !== undefined) {
    cur = cameFrom[hashPoint(cur)];
    path.push(cur);
  }

  // remove the start node
  path.pop();
  return path.reverse();
}



var Astar = {
  isBlocked: isBlocked,
  getWeight: getWeight,
  findNeighbours: findNeighbours,
  findPath: findPath,
  heuristicEstimate: heuristicEstimate
};

module.exports = Astar;