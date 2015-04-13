var seedRandom = require("seed-random");
var randFunc = seedRandom("asdasdas");
var Astar = require("./astar");

var COPPER_MODIF = 10;
var SILVER_MODIF = 10;
var COAL_MODIF = 10;
var ZINC_MODIF = 10;
var NICKEL_MODIF = 10;
var IRON_MODIF = 20;
var ALUMINIUM_MODIF = 30;
var LEAD_MODIF = 30;
var GOLD_MODIF = 60;
var GEMS_MODIF = 80;
var URANIUM_MODIF = 80;
var TITANIUM_MODIF = 80;

var WORKERS_RATIO = 0.7;
var MAX_TECH = TITANIUM_MODIF * 100;
var TECH_GROWTH = 0.1;
var WORK_EFFICIENCY = 0.1;

var map = {
  plains: [{
    type: "plain",
    location: [{x: 0, y: 2}, {x: 10, y: 2}, {x: 10, y: 9}, {x: 0, y: 9}]
  },{
    type: "plain",
    location: [{x: 0, y: 13}, {x: 10, y: 13}, {x: 10, y: 19}, {x: 0, y: 19}]
  }],
  rivers: [{
    type: "river",
    location: [{x: 0, y: 0}, {x: 10, y: 0}, {x: 10, y: 1}, {x: 0, y: 1}]
  }, {
    type: "river",
    location: [{x: 0, y: 10}, {x: 10, y: 10}, {x: 10, y: 12}, {x: 0, y: 12}]
  }]
};

var WIDTH = 200;
var HEIGHT = 200;
// Temporary filling grid
(function(map) {
  map.grid = new Array(HEIGHT);

  for (var i = 0; i < HEIGHT; i++) {
    map.grid[i] = new Array(WIDTH);
    for (var j = 0; j < WIDTH; j++) {
      map.grid[i][j] = {
        x: i,
        y: j,
        elevation: rand(),
        moisture: rand(),
        minerals: {
          copper: rand(100),
          iron: rand(100),
          gold: rand(100),
          titanium: rand(100),
          silver: rand(100),
          coal: rand(100),
          gems: rand(100),
          aluminium: rand(100),
          lead: rand(100),
          nickel:rand(100),
          uranium:rand(100),
          zinc:rand(100)
        },
        conquerability: 0,
        fertility: rand(100),
        wildlife: rand(100),
        trees: rand(100)
      };
      map.grid[i][j].conquerability = map.grid[i][j].elevation*10 + map.grid[i][j].trees;
    }
  }
})(map);

for (var i = 0; i < map.rivers.length; i++) {
  for (var j = 0; j < map.rivers[i].location.length; j++) {
    map.grid[map.rivers[i].location[j].x][map.rivers[i].location[j].y].blocked = true;
  }
}

var plainCenter1 = findLocationCentroid(map.grid, map.plains[0].location);
var city1 = {
  type: "city",
  center: plainCenter1,
  resources: {
    vegetables: 0,
    meat: 0,
    minerals: {
      copper: 0,
      iron: 0,
      gold: 0,
      titanium: 0,
      silver: 0,
      coal: 0,
      gems: 0,
      aluminium: 0,
      lead: 0,
      nickel:0,
      uranium:0,
      zinc:0
    },
    wood: 0
  },
  populationSize: 100,
  armySize: 0,
  location: [plainCenter1],
  curiosity: rand() * 2 + 1,
  aggressiveness: rand(),
  happiness: 1,
  technology: 0,
  workerRatio: 0.7,
  artistRatio: 0
};

var plainCenter2 = findLocationCentroid(map.grid, map.plains[1].location);
var city2 = {
  type: "city",
  center: plainCenter2,
  resources: {
    vegetables: 0,
    meat: 0,
    minerals: {
      copper: 0,
      iron: 0,
      gold: 0,
      titanium: 0,
      silver: 0,
      coal: 0,
      gems: 0,
      aluminium: 0,
      lead: 0,
      nickel:0,
      uranium:0,
      zinc:0
    },
    wood: 0
  },
  populationSize: 100,
  armySize: 0,
  location: [plainCenter2],
  curiosity: rand() * 2 + 1,
  aggressiveness: rand(),
  happiness: 1,
  technology: 0,
  workerRatio: 0.7,
  artistRatio: 0
};

// Astar.findNeighbours = function(a) {
//   var neighbours = a.getNeighborIds();
//   var ret = new Array(neighbours.length);
//   for (var i = 0; i < neighbours.length; i++) {
//     ret = map.diagram.cells[neighbours[i]];
//   }

//   return ret;
// };

console.log(city1.aggressiveness, city2.aggressiveness);

var maxUpdates = 10;
for (var i = 0; i < maxUpdates; i++) {
  updateCity(map, city1);

  // console.log(city1.resources, city1.technology, city1.happiness);
  // updateCity(map, city2);
}

console.log(city1.location.length, city1.populationSize, city1.armySize, city1.technology, city1.resources);
// console.log(city2.location.length, city2.armySize, city2.technology, city2.resources);

function updateCity(map, city) {
  city = expandCityLocation(map, city);
  city.resources = calculateResources(city);
  city.populationSize = calculatePopulationSize(map, city);
  city.artistRatio = calculateArtistic(city);
  city.technology = calculateTechnology(city);
  city.armySize = calculateArmySize(city);

  // city.happiness = calculateHappiness(map, city);
}

// function calculateHappiness(map, city) {
//   var h = (city.resources.vegetables + city.resources.meat) / city.populationSize;
//   // h -= getPathDifficulty(Astar.findPath(city.center, findLocationCentroid(map, findNearest(map, "rivers", city.location))));
//   h -= (city.technology + city.resources.vegetables + city.resources.meat) * (city.armySize/city.populationSize) / city.populationSize;
//   console.log(h);
//   return h > 1 ? 1 : h;
// }

function calculateArtistic(city) {
  return 1;
}

function calculateTechnology(city) {
  var inverseAggressiveness = 1 - city.aggressiveness;
  return ~~((city.resources.minerals.copper * inverseAggressiveness * COPPER_MODIF +
    city.resources.minerals.silver * inverseAggressiveness * SILVER_MODIF +
    city.resources.minerals.coal * inverseAggressiveness * COAL_MODIF +
    city.resources.minerals.zinc * inverseAggressiveness * ZINC_MODIF +
    city.resources.minerals.iron * inverseAggressiveness * IRON_MODIF +
    city.resources.minerals.aluminium * inverseAggressiveness * ALUMINIUM_MODIF +
    city.resources.minerals.lead * inverseAggressiveness * LEAD_MODIF +
    city.resources.minerals.uranium * inverseAggressiveness * URANIUM_MODIF +
    city.resources.minerals.titanium * inverseAggressiveness * TITANIUM_MODIF +
    city.resources.wood * inverseAggressiveness + city.technology) * TECH_GROWTH);
}

function calculatePopulationSize(map, city) {
  return ~~city.location.reduce(function(acc, val) {
    return acc + (1 - getLifeCondition(city.center, val)) * 100;
  }, 0);
}

function calculateArmySize(city) {
  return ~~(city.populationSize * city.aggressiveness);
}

function expandCityLocation(map, city) {
  var num = city.location.length;
  for (var i = 0; i < num; i++) {
    // Get the possible cells to expand to
    var fringe = getFringe(map, city.location);
    // Remove the ones that are just too hard to conquer
    fringe = fringe.filter(function(x) {
      if(x.owner) return x.owner.armySize < city.armySize;

      return x.conquerability < city.populationSize + city.armySize * city.aggressiveness;
    });

    // Be lazy: find the one with the min cost to get there
    var m = findEasiest(map, fringe, city.center, city.curiosity);

    if(!m) continue;

    city.location.push(m);
    m.owner = city;
    setCellInMap(map, m);
  }

  city.center = findLocationCentroid(map.grid, city.location);
  return city;
}

function setCellInMap(map, c) {
  map.grid[c.x][c.y] = c;
}

function calculateResources(city) {
  var vegetables = 0;
  var meat = 0;
  var wood = 0;

  var copper = 0;
  var iron = 0;
  var gold = 0;
  var titanium = 0;
  var silver = 0;
  var coal = 0;
  var gems = 0;
  var aluminium = 0;
  var lead = 0;
  var nickel = 0;
  var uranium = 0;
  var zinc = 0;

  var location = city.location;
  for (var i = 0; i < location.length; i++) {
    var collectPower = (1 + city.technology / MAX_TECH) * city.populationSize * city.workerRatio * WORK_EFFICIENCY;
    wood += ~~Math.min(location[i].trees, collectPower);
    meat += ~~Math.min(location[i].wildlife, collectPower);
    vegetables += ~~Math.min(location[i].fertility, collectPower);

    if(city.technology > COPPER_MODIF) copper += ~~Math.min(location[i].minerals.copper, collectPower * (1 - COPPER_MODIF/100));
    if(city.technology > IRON_MODIF) iron += ~~Math.min(location[i].minerals.iron, collectPower * (1 - IRON_MODIF/100));
    if(city.technology > GOLD_MODIF) gold += ~~Math.min(location[i].minerals.gold, collectPower * (1 - GOLD_MODIF/100));
    if(city.technology > TITANIUM_MODIF) titanium += ~~Math.min(location[i].minerals.titanium, collectPower * (1 - TITANIUM_MODIF/100));
    if(city.technology > SILVER_MODIF) silver += ~~Math.min(location[i].minerals.silver, collectPower * (1 - SILVER_MODIF/100));
    if(city.technology > COAL_MODIF) coal += ~~Math.min(location[i].minerals.coal, collectPower * (1 - COAL_MODIF/100));
    if(city.technology > GEMS_MODIF) gems += ~~Math.min(location[i].minerals.gems, collectPower * (1 - GEMS_MODIF/100));
    if(city.technology > ALUMINIUM_MODIF) aluminium += ~~Math.min(location[i].minerals.aluminium, collectPower * (1 - ALUMINIUM_MODIF/100));
    if(city.technology > LEAD_MODIF) lead += ~~Math.min(location[i].minerals.lead, collectPower * (1 - LEAD_MODIF/100));
    if(city.technology > NICKEL_MODIF) nickel += ~~Math.min(location[i].minerals.nickel, collectPower * (1 - NICKEL_MODIF/100));
    if(city.technology > URANIUM_MODIF) uranium += ~~Math.min(location[i].minerals.uranium, collectPower * (1 - URANIUM_MODIF/100));
    if(city.technology > ZINC_MODIF) zinc += ~~Math.min(location[i].minerals.zinc, collectPower * (1 - ZINC_MODIF/100));
  }

  return {
    vegetables: vegetables,
    meat: meat,
    minerals: {
      copper: copper,
      iron: iron,
      gold: gold,
      titanium: titanium,
      silver: silver,
      coal: coal,
      gems: gems,
      aluminium: aluminium,
      lead: lead,
      nickel:nickel,
      uranium:uranium,
      zinc:zinc
    },
    wood: wood
  };
}

function getFringe(map, space) {
  var ret = [];
  for (var i = 0; i < space.length; i++) {
    var neighbours = Astar.findNeighbours(map.grid, space[i]).filter(function(x) {
      return !contains(space, x, comparePoints);
    });
    ret = ret.concat(neighbours);
  }

  return ret;
}

// (reduce p #(+ (:lifeCondition %2) %1) 0)
function getPathDifficulty(center, p) {
  if(p.length <= 0) return Infinity;
  return p.reduce(function(acc, val) {return acc + getLifeCondition(center, val);}, 0);
}

function findEasiest(map, goalSpace, point, threshold) {
  if(goalSpace.length <= 0) return null;

  var p = Astar.findPath(map.grid, point, function(e) {
    return find(goalSpace, e, comparePoints);
  });

  var min = getPathDifficulty(point, p);

  if(min > threshold) return null;

  return p[p.length-1];
}

function getLifeCondition(center, cell) {
  var dm = cell.moisture - center.moisture;
  var de = cell.elevation - center.elevation;

  return dm*dm + de*de;
}

function distance(p1, p2) {
  var dx = p2.x - p1.x;
  var dy = p2.y - p1.y;
  return Math.sqrt(dx*dx + dy*dy);
}

function rand(max, min) {
  if(!max && !min) return randFunc();
  if(!min) return ~~(randFunc() * max);

  return ~~(randFunc() * (max - min) + min);
}

function randFrom(arr) {
  return arr[~~rand(arr.length)];
}

function findNearestHelper(map, thing, point) {
  var nearestThing;
  var dist = Infinity;
  for (var i = 0; i < map[thing].length; i++) {
    for (var j = 0; j < map[thing][i].location.length; j++) {
      var d = distance(map[thing][i].location[j], point);
      if(d < dist) {
        dist = d;
        nearestThing = map[thing][i];
      }
    }
  }
  return nearestThing;
}

function findNearest(map, thing, polygon) {
  var nearestThing = findNearestHelper(map, thing, polygon[0]);
  var dist = distance(nearestThing, polygon[0]);

  for (var i = 1; i < polygon.length; i++) {
    var t = findNearestHelper(map, thing, polygon[i]);
    var d = distance(t, polygon[i]);
    if(d < dist) {
      dist = d;
      nearestThing = t;
    }
  }

  return nearestThing;
}

function findLocationCentroid(reference, polygon) {
  var centroidX = 0;
  var centroidY = 0;
  for (var i = 0; i < polygon.length; i++) {
    centroidX += polygon[i].x;
    centroidY += polygon[i].y;
  }

  return reference[~~(centroidX / polygon.length)][~~(centroidY / polygon.length)];
}

function partial(fn) {
  var slice = Array.prototype.slice;
  var stored_args = slice.call(arguments, 1);
  return function () {
    var new_args = slice.call(arguments);
    var args = stored_args.concat(new_args);
    return fn.apply(null, args);
  };
}
function contains(coll, el, f) {
  return find(coll, el, f) !== null;
}
function find(coll, el, f) {
  var max = coll.length;
  for (var i = 0; i < max; ++i){
    if(f(coll[i], el)) {
      return coll[i];
    }
  }

  return null;
}
function remove(arr, el, f) {
  var max = arr.length;
  var i = 0;
  for (; i < max; i++){
    if(f(arr[i], el)) break;
  }
  arr.splice(i, 1);
}

function comparePoints(p1, p2) {
  return p1.x === p2.x && p1.y === p2.y;
}

function range(max, f) {
  if(!f) f = function(x) { return x; };

  var ret = new Array(max);
  for (var i = 0; i < ret.length; i++) {
    ret[i] = f(i);
  }
  return ret;
}



// var city = {
//   lStartWar: 0, // likelihood to start a war (between 0 and 1)
//   lStartExchange: 0, // likelihood to start exchanging goods (between 0 and 1)
//   populationSize: 0, // number of inhabitants
//   citySize: 0, // number of m^2
//   overallHappiness: 0, // percentage of happiness (between 0 and 1)
//   technology: 0, // percentage of technological advances (between 0 and 1)
//   regions: [{  // List of objects defining regions. The intersection of their
//                // location should be the whole city.
//     location: [{x:0, y:0}], // defines a polygon for that region
//     influence: 0 // influence that the region has on the city as a whole
//   }]
// };
/**
 * lStartWar: a mix of Math.random(), lots of resources, not a lot of
 * technology, and average ground height above a certain threshold
 *
 * lStartExchange: mix of Math.random(), lack of resources, some technology
 */