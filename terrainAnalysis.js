var analyzeTerrain = function(island){
  "use strict";

  var MAX_MODIF = 100;

  var COPPER_MODIF = 10;
  var SILVER_MODIF = 10;
  var COAL_MODIF = 10;
  var ZINC_MODIF = 10;
  var NICKEL_MODIF = 10;
  var IRON_MODIF = 15;
  var ALUMINIUM_MODIF = 15;
  var LEAD_MODIF = 15;
  var GOLD_MODIF = 60;
  var GEMS_MODIF = 70;
  var URANIUM_MODIF = 80;
  var TITANIUM_MODIF = 80;

  var MEAT_MODIF = 2;
  var VEGETABLES_MODIF = 2;

  var ARTISTIS_RATIO = 0.7;
  var WORKER_STRENGTH = 0.2;
  var MAX_TECH = TITANIUM_MODIF * 100;
  var TECH_GROWTH = 2;
  var ARMY_WORK_EFFICIENCY = 0.1;

  var map = transformMap(island, rand);

  Astar.findNeighbours = function(space, a) {
    if(a.__neighbors) return a.__neighbors;

    var neighbours = a.getNeighborIds();
    var ret = [];
    for (var i = 0; i < neighbours.length; i++) {
      if(!space[neighbours[i]].blocked) ret.push(space[neighbours[i]]);
    }
    a.__neighbors = ret;
    return ret;
  };
  Astar.heuristicEstimate = function (p1, p2) {
    return Math.abs(p1.site.x - p2.site.x) + Math.abs(p1.site.y - p2.site.y);
  };

  Astar.hashPoint = function (cell) {
    return cell.site.x + ":" + cell.site.y;
  };
  // var map = {
  //   plains: [{
  //     type: "plain",
  //     location: [{x: 0, y: 0}, {x: 10, y: 0}, {x: 10, y: 10}, {x: 0, y: 10}]
  //   },{
  //     type: "plain",
  //     location: [{x: 0, y: 100}, {x: 10, y: 100}, {x: 10, y: 110}, {x: 0, y: 110}]
  //   }],
  //   rivers: []
  // };

  // var WIDTH = 200;
  // var HEIGHT = 200;
  // Temporary filling grid
  // (function(map) {
  //   map.grid = new Array(HEIGHT);

  //   for (var i = 0; i < HEIGHT; i++) {
  //     map.grid[i] = new Array(WIDTH);
  //     for (var j = 0; j < WIDTH; j++) {
  //       map.grid[i][j] = {
  //         x: i,
  //         y: j,
  //         elevation: rand(),
  //         moisture: rand(),
  //         minerals: {
  //           copper: rand(100),
  //           iron: rand(100),
  //           gold: rand(100),
  //           titanium: rand(100),
  //           silver: rand(100),
  //           coal: rand(100),
  //           gems: rand(100),
  //           aluminium: rand(100),
  //           lead: rand(100),
  //           nickel:rand(100),
  //           uranium:rand(100),
  //           zinc:rand(100)
  //         },
  //         conquerability: 0,
  //         fertility: rand(100),
  //         wildlife: rand(100),
  //         trees: rand(100)
  //       };

  //       map.grid[i][j].conquerability = map.grid[i][j].elevation*10 + map.grid[i][j].trees;
  //       TOTAL_GOLD += map.grid[i][j].minerals.gold;
  //     }
  //   }
  // })(map);

  // for (var i = 0; i < map.grid.length; i++) {
  //   for (var j = 0; j < map.grid[i].length; j++) {
  //     if(map.grid[i][j].biome == "GRASSLAND") {
        // plainCenter1 = map.grid[i][j];
        // break;
  //     }
  //   }
  // }

  // var allPlains = [];
  // for (var i = 0; i < map.grid.length; i++) {
  //   if(!map.grid[i].blocked) {
  //     allPlains.push(map.grid[i]);
  //   }
  // }

  var cities = [];
  var totalCities = 6;
  while(totalCities--) {
    var plainCenter = null;
    do {
      plainCenter = randFrom(map.grid);
    } while(plainCenter.blocked);

    var city = {
      center: plainCenter,
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
      location: [plainCenter],
      curiosity: rand(),
      aggressiveness: rand()/2,
      happiness: 1,
      technology: 0,
      artistNumber: 0,
      economy: 0
    };

    // console.log(city.aggressiveness, city.curiosity);
    // if(totalCities === 1) {
      for (var i = 0; i < 7; i++) {
        updateCity(map, city);
      }
      // console.log(city.location.length);
    // }

    Island.drawCity(city.location);

    cities.push(city);
  }

  Island.render();

  for (var i = 0; i < cities.length; i++) {
    var seen = [];
    var str = JSON.stringify(cities[i], function(key, val) {
      if(key === "center" || key === "location") return null;

       if (val !== null && typeof val === "object") {
            if (seen.indexOf(val) >= 0) {
                return;
            }
            seen.push(val);
        }
        return val;
    });

    console.log(str);
  }

  // for (i = 0; i < city1.location.length; i++) {
  //   console.log(city1.location[i].site.x, city1.location[i].site.y);
  // }
  // console.log(city1.location.length, city1.populationSize, city1.artistNumber, city1.armySize, city1.technology, city1.economy);

  function updateCity(map, city) {
    city = expandCityLocation(map, city);
    var resources = calculateResources(city);
    var populationSize = calculatePopulationSize(map, city);
    var economy = calculateEconomy(map, city);
    var artistNumber = calculateArtistic(city);
    var technology = calculateTechnology(city);
    var armySize = calculateArmySize(city);
    var happiness = calculateHappiness(map, city);

    city.resources = resources;
    city.populationSize = populationSize;
    city.economy = economy;
    city.artistNumber = artistNumber;
    city.technology = technology;
    city.armySize = armySize;
    city.happiness = happiness;
  }

  function calculateHappiness(map, city) {
    var h = (city.resources.vegetables + city.resources.meat) / city.populationSize;
    h -= city.economy * city.aggressiveness;
    h += city.artistNumber / city.populationSize;

    return h;
  }

  function calculateArtistic(city) {
    var minerals = city.resources.minerals;
    return ~~((city.populationSize - city.armySize) * minerals.zinc / (minerals.copper + minerals.coal + minerals.iron + minerals.aluminium + minerals.lead + minerals.uranium + minerals.titanium + minerals.zinc) * ARTISTIS_RATIO);
  }

  function calculateTechnology(city) {
    var inverseAggressiveness = 1 - city.aggressiveness;
    var minerals = city.resources.minerals;
    return ~~((minerals.copper * inverseAggressiveness * COPPER_MODIF +
      minerals.silver * inverseAggressiveness * SILVER_MODIF +
      minerals.coal * inverseAggressiveness * COAL_MODIF +
      minerals.zinc * inverseAggressiveness * ZINC_MODIF +
      minerals.iron * inverseAggressiveness * IRON_MODIF +
      minerals.aluminium * inverseAggressiveness * ALUMINIUM_MODIF +
      minerals.lead * inverseAggressiveness * LEAD_MODIF +
      minerals.uranium * inverseAggressiveness * URANIUM_MODIF +
      minerals.titanium * inverseAggressiveness * TITANIUM_MODIF +
      city.resources.wood * inverseAggressiveness + city.technology * TECH_GROWTH));
  }

  function calculatePopulationSize(map, city) {
    return ~~city.location.reduce(function(acc, val) {
      return acc + (1 - getLifeCondition(city.center, val)) * 100;
    }, 0);
  }

  function calculateEconomy(map, city) {
    return city.location.reduce(function(acc, val) {
      return acc + val.minerals.gold + val.minerals.gems;
    }, 0)/map.totalGold;
  }

  function calculateArmySize(city) {
    return ~~((city.populationSize - city.artistNumber) * city.aggressiveness);
  }

  function expandCityLocation(map, city) {
    var num = city.location.length;
    for (var i = 0; i < num; i++) {
      // Get the possible cells to expand to
      var fringe = getFringe(map, city.location);
      // Remove the ones that are just too hard to conquer
      fringe = fringe.filter(function(x) {
        if(x.owner) return x.owner.armySize < city.armySize;
        return x.conquerability < (city.populationSize - city.armySize) * WORKER_STRENGTH + city.armySize;
      });

      // Be lazy: find the one with the min cost to get there
      var m = findEasiest(map, fringe, city.center, city.curiosity);

      if(!m) continue;

      city.location.push(m);
      m.owner = city;
      // setCellInMap(map, m);
    }

    city.center = findLocationCentroid(map.grid, city.location);
    return city;
  }

  // function setCellInMap(map, c) {
  //   map.grid[c.x][c.y] = c;
  // }

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
      var collectPower = (1 + city.technology / MAX_TECH) * (city.populationSize - city.artistNumber - city.armySize) * WORKER_STRENGTH + city.armySize * ARMY_WORK_EFFICIENCY;
      wood += ~~Math.min(location[i].trees, collectPower);
      meat += ~~Math.min(location[i].wildlife * MEAT_MODIF, collectPower);
      vegetables += ~~Math.min(location[i].fertility * VEGETABLES_MODIF, collectPower);

      if(city.technology > COPPER_MODIF) copper += ~~Math.min(location[i].minerals.copper, collectPower * (1 - COPPER_MODIF/MAX_MODIF));
      if(city.technology > IRON_MODIF) iron += ~~Math.min(location[i].minerals.iron, collectPower * (1 - IRON_MODIF/MAX_MODIF));
      if(city.technology > GOLD_MODIF) gold += ~~Math.min(location[i].minerals.gold, collectPower * (1 - GOLD_MODIF/MAX_MODIF));
      if(city.technology > TITANIUM_MODIF) titanium += ~~Math.min(location[i].minerals.titanium, collectPower * (1 - TITANIUM_MODIF/MAX_MODIF));
      if(city.technology > SILVER_MODIF) silver += ~~Math.min(location[i].minerals.silver, collectPower * (1 - SILVER_MODIF/MAX_MODIF));
      if(city.technology > COAL_MODIF) coal += ~~Math.min(location[i].minerals.coal, collectPower * (1 - COAL_MODIF/MAX_MODIF));
      if(city.technology > GEMS_MODIF) gems += ~~Math.min(location[i].minerals.gems, collectPower * (1 - GEMS_MODIF/MAX_MODIF));
      if(city.technology > ALUMINIUM_MODIF) aluminium += ~~Math.min(location[i].minerals.aluminium, collectPower * (1 - ALUMINIUM_MODIF/MAX_MODIF));
      if(city.technology > LEAD_MODIF) lead += ~~Math.min(location[i].minerals.lead, collectPower * (1 - LEAD_MODIF/MAX_MODIF));
      if(city.technology > NICKEL_MODIF) nickel += ~~Math.min(location[i].minerals.nickel, collectPower * (1 - NICKEL_MODIF/MAX_MODIF));
      if(city.technology > URANIUM_MODIF) uranium += ~~Math.min(location[i].minerals.uranium, collectPower * (1 - URANIUM_MODIF/MAX_MODIF));
      if(city.technology > ZINC_MODIF) zinc += ~~Math.min(location[i].minerals.zinc, collectPower * (1 - ZINC_MODIF/MAX_MODIF));
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

    var tmp = Astar.getWeight;
    Astar.getWeight = partial(getLifeCondition, point);
    // console.log("Before astar", point);
    var p = Astar.findPath(map.grid, point, function(e) {
      return find(goalSpace, e, comparePoints);
    });
    Astar.getWeight = tmp;

    var min = getPathDifficulty(point, p);
    // console.log(min, p, point);
    if(min > threshold) return null;

    return p[p.length-1];
  }

  function getLifeCondition(center, cell) {
    if(cell.biome === "VOLCANO") return 10;
    if(cell.biome === "VOLCANO_OUTLINE") return 5;

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

  // function findNearestHelper(map, thing, point) {
  //   var nearestThing;
  //   var dist = Infinity;
  //   for (var i = 0; i < map[thing].length; i++) {
  //     for (var j = 0; j < map[thing][i].location.length; j++) {
  //       var d = distance(map[thing][i].location[j], point);
  //       if(d < dist) {
  //         dist = d;
  //         nearestThing = map[thing][i];
  //       }
  //     }
  //   }
  //   return nearestThing;
  // }

  // function findNearest(map, thing, polygon) {
  //   var nearestThing = findNearestHelper(map, thing, polygon[0]);
  //   var dist = distance(nearestThing, polygon[0]);

  //   for (var i = 1; i < polygon.length; i++) {
  //     var t = findNearestHelper(map, thing, polygon[i]);
  //     var d = distance(t, polygon[i]);
  //     if(d < dist) {
  //       dist = d;
  //       nearestThing = t;
  //     }
  //   }

  //   return nearestThing;
  // }

  function findLocationCentroid(reference, polygon) {
    var centroidX = 0;
    var centroidY = 0;
    for (var i = 0; i < polygon.length; i++) {
      centroidX += polygon[i].site.x;
      centroidY += polygon[i].site.y;
    }
    var x = ~~(centroidX / polygon.length);
    var y = ~~(centroidY / polygon.length);
    var p = {x: x, y: y};
    var closest = reference[0];
    var dist = distance(closest.site, p);
    for (i = 1; i < reference.length; i++) {
      var d = distance(reference[i].site, p);
      if(d < dist) {
        dist = d;
        closest = reference[i];
      }
    }
    return closest;
  }

};
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
  return p1.site.x === p2.site.x && p1.site.y === p2.site.y;
}

function range(max, f) {
  if(!f) f = function(x) { return x; };

  var ret = new Array(max);
  for (var i = 0; i < ret.length; i++) {
    ret[i] = f(i);
  }
  return ret;
}