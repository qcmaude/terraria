var $ = require('jquery');

$(function() { 

var PIXI = require('pixi');

var islandShape = require('./voronoi-map/src/island-shape.js');
var lavaModule = require('./voronoi-map/src/lava.js');
var mapModule = require('./voronoi-map/src/map.js');
var noisyEdgesModule = require('./voronoi-map/src/noisy-edges.js');
var pointSelectorModule = require('./voronoi-map/src/point-selector.js');
var renderCanvas = require('./voronoi-map/src/render-canvas.js');
var renderPixi = require('./voronoi-map/src/render-pixi.js');
var roadsModule = require('./voronoi-map/src/roads.js');
var style = require('./voronoi-map/src/style.js');
var watershedsModule = require('./voronoi-map/src/watersheds.js');

var map = mapModule({width: 1000.0, height: 1000.0});
map.newIsland(islandShape.makeRadial(1), 1);
map.go0PlacePoints(100, pointSelectorModule.generateRandom(map.SIZE.width, map.SIZE.height, map.mapRandom.seed));
map.go1BuildGraph();
map.assignBiomes();
map.go2AssignElevations();
map.go3AssignMoisture();
map.go4DecorateMap();

var lava = lavaModule();
var roads = roadsModule();
roads.createRoads(map, [0, 0.05, 0.37, 0.64]);
var watersheds = watershedsModule();
watersheds.createWatersheds(map);
var noisyEdges = noisyEdgesModule();
noisyEdges.buildNoisyEdges(map, lava, map.mapRandom.seed);

// render with Canvas Context 2D

var canvas = document.createElement('canvas');
var ctx = canvas.getContext("2d");
renderCanvas.graphicsReset(ctx, map.SIZE.width, map.SIZE.height, style.displayColors);
renderCanvas.renderDebugPolygons(ctx, map, style.displayColors);
document.body.appendChild(canvas);
});