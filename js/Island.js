var DISPLAY_COLORS = {
    OCEAN: new paper.Color('#82caff'), //Different sections for different levels of fish availability
    DEEP_WATER: new paper.Color('#52b5fe'), //Fishing area!
    FISHING: new paper.Color('#39aafe'),
    BEACH: new paper.Color('#ffe98d'),
    LAKE: new paper.Color('#2f9ceb'),
    RIVER: new paper.Color('#369eea'),
    SOURCE: new paper.Color('#00f'),
    MARSH: new paper.Color('#2ac6d3'), //Can't put city here because they'll sink.
    ICE: new paper.Color('#b3deff'), //Polar bears, probably don't want to put a city there.
    ROCK: new paper.Color('#535353'),
    LAVA: new paper.Color('#e22222'),
    SNOW: new paper.Color('#f8f8f8'),
    TUNDRA: new paper.Color('#ddddbb'),
    BARE: new paper.Color('#bbbbbb'),
    SCORCHED: new paper.Color('#999999'),
    TAIGA: new paper.Color('#ccd4bb'),
    SHRUBLAND: new paper.Color('#c4ccbb'),
    TEMPERATE_DESERT: new paper.Color('#e4e8ca'),
    TEMPERATE_RAIN_FOREST: new paper.Color('#a4c4a8'),
    TEMPERATE_DECIDUOUS_FOREST: new paper.Color('#b4c9a9'),
    GRASSLAND: new paper.Color('#c4d4aa'),
    TROPICAL_RAIN_FOREST: new paper.Color('#9cbba9'),
    TROPICAL_SEASONAL_FOREST: new paper.Color('#a9cca4'),
    SUBTROPICAL_DESERT: new paper.Color('#e9ddc7'),
    GOLD: new paper.Color('#ffd700'),
    SILVER: new paper.Color('#c0c0c0'),
    COAL: new paper.Color('#262626'),
    GEMS: new paper.Color('#50c878'),
    ALUMINIUM: new paper.Color('#cccccc'),
    COPPER: new paper.Color('#b87333'),
    IRON: new paper.Color('#5a5a5a'),
    LEAD: new paper.Color('#676767'),
    NICKEL: new paper.Color('#9a9a9a'),
    TITANIUM: new paper.Color('#d2b48c'),
    URANIUM: new paper.Color('#f2fd61'),
    ZINC: new paper.Color('#9191bb'), 
    VOLCANO: new paper.Color('#b30000'),
    VOLCANO_OUTLINE: new paper.Color('#414141')
};

var CITY_COLORS = {
    ONE: new paper.Color('#800080'),
    TWO: new paper.Color('#0000b4'),
    THREE: new paper.Color('#ffbf00'),
    FOUR: new paper.Color('#ff3f00'),
    FIVE: new paper.Color('#00b4b4'),
    SIX: new paper.Color('#ce0067')
};

var Island = {
    config: {
        width: 500,
        height: 500,
        perlinWidth: 256,
        perlinHeight: 256,
        allowDebug: false, // if set to true, you can click on the map to enter "debug" mode. Warning : debug mode is slow to initialize, set to false for faster rendering.
        nbSites: 10000, // nb of voronoi cell
        sitesDistribution: 'hexagon', // distribution of the site : random, square or hexagon
        sitesRandomisation: 80, // will move each site in a random way (in %), for the square or hexagon distribution to look more random
        nbGraphRelaxation: 0, // nb of time we apply the relaxation algo to the voronoi graph (slow !), for the random distribution to look less random
        cliffsThreshold: 0.15,
        lakesThreshold: 0.005, // lake elevation will increase by this value (* the river size) when a new river end inside
        nbRivers: (10000 / 200),
        maxRiversSize: 4,
        shading: 0.35,
        shadeOcean: true,
        fishingDegree: 0.7
    },
    debug: false, // true if "debug" mode is activated
    voronoi: new Voronoi(),
    diagram: null,
    sites: [],
    seed: -1,
    perlin: null,
    cellsLayer: null,
    riversLayer: null,
    debugLayer: null,
    cities: 0,
    citiesMax: 6,

    init: function (userConfig) {        
        if (userConfig == undefined) {
            userConfig = {};
        }
        
        this.config.width               = (userConfig.width != undefined                ? userConfig.width              : view.viewSize.width);
        this.config.height              = (userConfig.height != undefined               ? userConfig.height             : view.viewSize.height);
        this.config.perlinWidth         = (userConfig.perlinWidth != undefined          ? userConfig.perlinWidth        : (this.config.width / 3));
        this.config.perlinHeight        = (userConfig.perlinHeight != undefined         ? userConfig.perlinHeight       : (this.config.height / 3));
        this.config.allowDebug          = (userConfig.allowDebug != undefined           ? userConfig.allowDebug         : false);
        this.config.nbSites             = (userConfig.nbSites != undefined              ? userConfig.nbSites            : ((this.config.width * this.config.height) / 100));
        this.config.sitesDistribution   = (userConfig.sitesDistribution != undefined    ? userConfig.sitesDistribution  : 'hexagon');
        this.config.sitesRandomisation  = (userConfig.sitesRandomisation != undefined   ? userConfig.sitesRandomisation : 80);
        this.config.nbGraphRelaxation   = (userConfig.nbGraphRelaxation != undefined    ? userConfig.nbGraphRelaxation  : 0);
        this.config.cliffsThreshold     = (userConfig.cliffsThreshold != undefined      ? userConfig.cliffsThreshold    : 0.15);
        this.config.lakesThreshold      = (userConfig.lakesThreshold != undefined       ? userConfig.lakesThreshold     : 0.005);
        this.config.nbRivers            = (userConfig.nbRivers != undefined             ? userConfig.nbRivers           : (this.config.nbSites / 200));
        this.config.maxRiversSize       = (userConfig.maxRiversSize != undefined        ? userConfig.maxRiversSize      : 4);
        this.config.shading             = (userConfig.shading != undefined              ? userConfig.shading            : 0.35);
        this.config.shadeOcean          = (userConfig.shadeOcean != undefined           ? userConfig.shadeOcean         : true);
        this.config.volcano             = (userConfig.volcano != undefined              ? userConfig.volcano            : true);
        this.config.tectonic             = (userConfig.tectonic != undefined            ? userConfig.tectonic           : true);        
        
        this.cellsLayer = new paper.Layer({name: 'cell'});
        this.riversLayer = new paper.Layer({name: 'rivers'});
        this.debugLayer = new paper.Layer({name: 'debug', visible: false});
        
        this.seed = Math.random();
        this.perlinCanvas = document.getElementById('perlin');
        this.perlinCanvas.width = this.config.perlinWidth;
        this.perlinCanvas.height = this.config.perlinHeight;
        this.perlin = perlinNoise(this.perlinCanvas, 64, 64, this.seed);
        this.randomSites();

        this.assignOceanCoastAndLand();
        this.assignRivers();
        this.assignMoisture();
        this.assignBiomes();
        if(this.config.volcano) this.createVolcano();
        if(this.config.tectonic) this.plateTectonics();
        this.assignMinerals();
        this.assignForestation();
        this.render();
        // this.printMap();
    },

    assignForestation: function() {
        for (var i = 0; i < this.diagram.cells.length; i++) {
            var cell = this.diagram.cells[i];
            cell.trees = this.getForestation(cell);
        }
    },

    assignFauna: function() {
    for (var i = 0; i < this.diagram.cells.length; i++) {
            var cell = this.diagram.cells[i];
            cell.fauna = this.getForestation(cell);
        }
    },

    getFauna: function(cell) {

        switch(cell.biome) {
            case 'VOLCANO': 
                return 0;
            case 'VOLCANO_OUTLINE': 
                return 0;
            case 'FISHING': 
                return this.getRandomInt(80,90);
            case 'DEEP_WATER': 
                return this.getRandomInt(0,10);
            case 'OCEAN': 
                return this.getRandomInt(50,60);
            case 'MARSH': 
                return this.getRandomInt(5, 50);
            case 'ICE': 
                //Basically, only polar bears. Or penguins. Depends.
                return this.getRandomInt(2,10);
            case 'LAKE': 
                //Could also be dependent on size of the lake.
                return this.getRandomInt(40,50);
            case 'BEACH': 
                return 0;
            case 'SNOW': 
                return this.getRandomInt(3, 10);
            case 'TUNDRA': 
                return this.getRandomInt(1, 3);
            case 'BARE': 
                return 0;
            case 'SCORCHED': 
                return 0;
            case 'TAIGA': 
                return this.getRandomInt(30, 40);
            case 'SHRUBLAND': 
                return this.getRandomInt(10,20);
            case 'TEMPERATE_DESERT': 
                return this.getRandomInt(5,15);
            case 'TEMPERATE_RAIN_FOREST': 
                return this.getRandomInt(80,100);
            case 'TEMPERATE_DECIDUOUS_FOREST': 
                return this.getRandomInt(85,95);
            case 'GRASSLAND': 
                return this.getRandomInt(30,50);
            case 'TROPICAL_RAIN_FOREST': 
                return this.getRandomInt(95,100);
            case 'TROPICAL_SEASONAL_FOREST': 
                return this.getRandomInt(70,90);
            case 'SUBTROPICAL_DESERT': ;
                return this.getRandomInt(10,20);
        }

    },

    getForestation: function(cell) {
        switch(cell.biome) {
            case 'VOLCANO': 
                return 0;
            case 'VOLCANO_OUTLINE': 
                return 0;
            case 'FISHING': 
                return 0;
            case 'DEEP_WATER': 
                return 0;
            case 'OCEAN': 
                return 0;
            case 'MARSH': 
                return this.getRandomInt(5, 50);
            case 'ICE': 
                return 0;
            case 'LAKE': 
                return 0;
            case 'BEACH': 
                return 0;
            case 'SNOW': 
                return this.getRandomInt(3, 10);
            case 'TUNDRA': 
                return this.getRandomInt(1, 3);
            case 'BARE': 
                return 0;
            case 'SCORCHED': 
                return 0;
            case 'TAIGA': 
                return this.getRandomInt(10, 20);
            case 'SHRUBLAND': 
                return this.getRandomInt(20,40);
            case 'TEMPERATE_DESERT': 
                return this.getRandomInt(2,5);
            case 'TEMPERATE_RAIN_FOREST': 
                return this.getRandomInt(90,100);
            case 'TEMPERATE_DECIDUOUS_FOREST': 
                return this.getRandomInt(85,100);
            case 'GRASSLAND': 
                return this.getRandomInt(30,50);
            case 'TROPICAL_RAIN_FOREST': 
                return this.getRandomInt(95,100);
            case 'TROPICAL_SEASONAL_FOREST': 
                return this.getRandomInt(90,100);
            case 'SUBTROPICAL_DESERT': ;
                return this.getRandomInt(10,20);
        }
    },

    getMinerals: function(cell) {

        var mineralObj = {
            gold: 0,
            silver: 0, 
            coal: 0,
            gems: 0,
            aluminium: 0,
            copper: 0,
            iron: 0,
            lead: 0,
            nickel: 0,
            titanium: 0,
            uranium: 0,
            zinc: 0
        };

        var random = this.getRandomInt(0, 100);

        //Minerals are distributed according to the biome and rarity.
        //There can anywhere between 0 and 100 items.
        if(cell.volcano) {
            //Gems can be there
            if(random == 0) {
                mineralObj.gems = this.getRandomInt(0,100);
                return mineralObj;
            }
        } else if (cell.volcanoOutline) {
            //Gems can be there
            if(random == 0) {
                mineralObj.gems = this.getRandomInt(0,100);
                return mineralObj;
            }
        } else if(cell.water) {
            //No minerals available in low elevation/watery terrain
        } else if (cell.elevation > 0.4) {
            if (cell.moisture > 0.33) {
                //Zinc is in colder areas
                if(random < 5) {
                    mineralObj.zinc = this.getRandomInt(0,100);
                    return mineralObj;
                }
            }
        } else if (cell.elevation > 0.3) {
            if (cell.moisture > 0.66) {
                //Maybe add gold or silver
                if(random == 0) {
                    mineralObj.gold = this.getRandomInt(0,100);
                    return mineralObj;
                }
            }
            else if (cell.moisture > 0.33) {
                //Maybe add gold or silver
                if(random == 0) {
                    mineralObj.silver = this.getRandomInt(0,100);
                    return mineralObj;
                }
            }
        } else if (cell.elevation > 0.15) {
            if (cell.moisture > 0.83) {
                //Maybe add gems, aluminium or copper
                if(random == 0) {
                    mineralObj.gems = this.getRandomInt(0,100);
                    return mineralObj;
                } else if (random < 3) {
                    mineralObj.aluminium = this.getRandomInt(0,100);
                    return mineralObj;
                } else if (random < 10) {
                    mineralObj.copper = this.getRandomInt(0,100);
                    return mineralObj;
                }
            }
            else if (cell.moisture > 0.50) {
                //Maybe add iron, lead or nickel
                if (random < 4) {
                    mineralObj.iron = this.getRandomInt(0,100);
                    return mineralObj;
                } else if (random < 6) {
                    mineralObj.lead = this.getRandomInt(0,100);
                    return mineralObj;
                } else if (random < 8) {
                    mineralObj.nickel = this.getRandomInt(0,100);
                    return mineralObj;
                }
            }
            else if (cell.moisture > 0.16) {
                //Maybe add gold or silver
                if (random < 3) {
                    mineralObj.titanium = this.getRandomInt(0,100);
                    return mineralObj;
                } else if (random == 0) {
                    mineralObj.uranium = this.getRandomInt(0,100);
                    return mineralObj;
                } 
            }
        } else {
            if (cell.moisture > 0.16) {
                if (random < 6) {
                    mineralObj.coal = this.getRandomInt(0,100);
                    return mineralObj;
                }
            }
        }

        return mineralObj;
    },

    randomSites: function (n) {
        var sites = [];

        // create vertices
        if (this.config.sitesDistribution == 'random') {
            for (var i = 0; i < this.config.nbSites; i++) {
                sites.push({
                    x: Math.round(Math.random() * this.config.width),
                    y: Math.round(Math.random() * this.config.height)
                });
            }
        } else {
            var delta = Math.sqrt(this.config.width * this.config.height / this.config.nbSites);
            var rand = this.config.sitesRandomisation * delta / 100;
            var x = 0;
            var y = 0;
            for (var i = 0; i < this.config.nbSites; i++) {
                sites.push({
                    x: Math.max(Math.min(Math.round(x * delta + (Math.random() * rand)), this.config.width), 0),
                    y: Math.max(Math.min(Math.round(y * delta + (Math.random() * rand)), this.config.height), 0)
                });
                x = x + 1;
                if (x * delta > this.config.width) {
                    x = (y % 2 == 1 || this.config.sitesDistribution == 'square' ? 0 : 0.5);
                    y = y + 1;
                }
            }
        }
        this.compute(sites);
        for (var i = 0; i < this.config.nbGraphRelaxation; i++) {
            this.relaxSites();
        }
    },
    
    compute: function (sites) {
        this.sites = sites;
        this.voronoi.recycle(this.diagram);
        var bbox = {xl: 0, xr: this.config.width, yt: 0, yb: this.config.height};
        this.diagram = this.voronoi.compute(sites, bbox);
    },

    relaxSites: function () {
        if (!this.diagram) {
            return;
        }
        var cells = this.diagram.cells,
            iCell = cells.length,
            cell,
            site, sites = [],
            rn, dist;
        var p = 1 / iCell * 0.1;
        while (iCell--) {
            cell = cells[iCell];
            rn = Math.random();
            // probability of apoptosis
            if (rn < p) {
                continue;
            }
            site = this.cellCentroid(cell);
            dist = this.distance(site, cell.site);
            // don't relax too fast
            if (dist > 2) {
                site.x = (site.x + cell.site.x) / 2;
                site.y = (site.y + cell.site.y) / 2;
            }
            // probability of mytosis
            if (rn > (1 - p)) {
                dist /= 2;
                sites.push({
                    x: site.x + (site.x - cell.site.x) / dist,
                    y: site.y + (site.y - cell.site.y) / dist
                });
            }
            sites.push(site);
        }
        this.compute(sites);
    },

    cellArea: function (cell) {
        var area = 0,
            halfedges = cell.halfedges,
            iHalfedge = halfedges.length,
            halfedge,
            p1, p2;
        while (iHalfedge--) {
            halfedge = halfedges[iHalfedge];
            p1 = halfedge.getStartpoint();
            p2 = halfedge.getEndpoint();
            area += p1.x * p2.y;
            area -= p1.y * p2.x;
        }
        area /= 2;
        return area;
    },

    cellCentroid: function (cell) {
        var x = 0,
            y = 0,
            halfedges = cell.halfedges,
            iHalfedge = halfedges.length,
            halfedge,
            v, p1, p2;
        while (iHalfedge--) {
            halfedge = halfedges[iHalfedge];
            p1 = halfedge.getStartpoint();
            p2 = halfedge.getEndpoint();
            v = p1.x * p2.y - p2.x * p1.y;
            x += (p1.x + p2.x) * v;
            y += (p1.y + p2.y) * v;
        }
        v = this.cellArea(cell) * 6;
        return {
            x: x / v,
            y: y / v
        };
    },

    extendedFishingZones: function() {

        var oceanCells = [];

        // extended fishing zone
        for (var i = 0; i < this.diagram.cells.length; i++) {
            var cell = this.diagram.cells[i];
            if(cell.ocean) {
                oceanCells.push(cell);
            }
        }

        var degree = Math.floor(oceanCells.length*(this.config.fishingDegree)/100);

        //Yeah, this should be cleaned up.
        for(var j = 0; j < degree; j++) {
            var cell = oceanCells[this.getRandomInt(0,oceanCells.length)];
            cell.fishing = true;
            var neighbors = cell.getNeighborIds();
            for (var k = 0; k < neighbors.length; k++) {
                //Set neighbors to be fishing = true.
                var nId = neighbors[k];
                var neighbor = this.diagram.cells[nId];
                neighbor.fishing = (neighbor.ocean) || (neighbor.fishing);
                
                var innerNeighbors = neighbor.getNeighborIds();
                for (var l = 0; l < innerNeighbors.length; l++) {
                    //Set neighbors to be fishing = true.
                    var nId2 = innerNeighbors[l];
                    var innerNeighbor = this.diagram.cells[nId2];
                    innerNeighbor.fishing = (innerNeighbor.ocean) || (innerNeighbor.fishing);

                    var innerInnerNeighbors = innerNeighbor.getNeighborIds();
                    for(var m = 0; m < innerInnerNeighbors.length; m++) {
                        //Set neighbors to be fishing = true.
                        var nId3 = innerInnerNeighbors[m];
                        var innerInnerNeighbor = this.diagram.cells[nId3];
                        innerInnerNeighbor.fishing = (innerInnerNeighbor.ocean) || (innerInnerNeighbor.fishing);

                        var innerInnerInnerNeighbors = innerInnerNeighbor.getNeighborIds();
                        for(var n = 0; n < innerInnerInnerNeighbors.length; n++) {
                            var nId4 = innerInnerInnerNeighbors[n];
                            var innerInnerInnerNeighbor = this.diagram.cells[nId4];
                            innerInnerInnerNeighbor.fishing = (innerInnerInnerNeighbor.ocean) || (innerInnerInnerNeighbor.fishing);

                            var innerInnerInnerInnerNeighbors = innerInnerInnerNeighbor.getNeighborIds();
                            for(var o = 0; o < innerInnerInnerInnerNeighbors.length; o++) {
                                var nId5 = innerInnerInnerInnerNeighbors[o];
                                var innerInnerInnerInnerNeighbor = this.diagram.cells[nId5];
                                innerInnerInnerInnerNeighbor.fishing = (innerInnerInnerInnerNeighbor.ocean) || (innerInnerInnerInnerNeighbor.fishing);

                                var innerInnerInnerInnerInnerNeighbors = innerInnerInnerInnerNeighbor.getNeighborIds();
                                for(var p = 0; p < innerInnerInnerInnerInnerNeighbors.length; p++) {
                                    var nId6 = innerInnerInnerInnerInnerNeighbors[p];
                                    var innerInnerInnerInnerInnerNeighbor = this.diagram.cells[nId6];
                                    innerInnerInnerInnerInnerNeighbor.fishing = (innerInnerInnerInnerInnerNeighbor.ocean) || (innerInnerInnerInnerInnerNeighbor.fishing);
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    
    assignOceanCoastAndLand: function() {
        // water
        var queue = new Array();
        for (var i = 0; i < this.diagram.cells.length; i++) {
            var cell = this.diagram.cells[i];
            cell.elevation = this.getElevation(cell.site);
            cell.water = (cell.elevation <= 0);
            var numWater = 0;
            for (var j = 0; j < cell.halfedges.length; j++) {
                var hedge = cell.halfedges[j];
                // border 
                if (hedge.edge.rSite == null) {
                    cell.border = true;
                    cell.ocean = true;
                    cell.water = true;
                    if (cell.elevation > 0) {
                        cell.elevation = 0;
                    }
                    queue.push(cell);
                }
            }
        }
        
        // ocean
        while (queue.length > 0) {
            var cell = queue.shift();
            var neighbors = cell.getNeighborIds();
            for (var i = 0; i < neighbors.length; i++) {
                var nId = neighbors[i];
                var neighbor = this.diagram.cells[nId];
                if (neighbor.water && !neighbor.ocean) {
                    neighbor.ocean = true;
                    queue.push(neighbor);
                }
            } 
        }
        
        // coast
        for (var i = 0; i < this.diagram.cells.length; i++) {
            var cell = this.diagram.cells[i];
            var numOcean = 0;
            var neighbors = cell.getNeighborIds();
            for (var j = 0; j < neighbors.length; j++) {
                var nId = neighbors[j];
                var neighbor = this.diagram.cells[nId];
                if (neighbor.ocean) {
                   numOcean++;
                }
            } 
            cell.coast = (numOcean > 0) && (!cell.water);
            cell.beach = (cell.coast && cell.elevation < this.config.cliffsThreshold);
        }

        // fishing zone
        for (var i = 0; i < this.diagram.cells.length; i++) {
            var cell = this.diagram.cells[i];
            var numOcean = 0;
            var neighbors = cell.getNeighborIds();
            var numCoast = 0;
            var numWater = 0;
            for (var j = 0; j < neighbors.length; j++) {
                var nId = neighbors[j];
                var neighbor = this.diagram.cells[nId];
                if(neighbor.coast) {
                    numCoast++;
                }
                if(neighbor.water) {
                    numWater++;
                }
            }
            cell.fishing = (numCoast > 0) && (numWater > 1) && !(cell.coast);
        }

        this.extendedFishingZones();
        
        // cliff
        for (var i = 0; i < this.diagram.edges.length; i++) {
            var edge = this.diagram.edges[i];
            if (edge.lSite != null && edge.rSite != null) {
                var lCell = this.diagram.cells[edge.lSite.voronoiId];
                var rCell = this.diagram.cells[edge.rSite.voronoiId];      
                edge.cliff = (!(lCell.water && rCell.water) && (Math.abs(this.getRealElevation(lCell) - this.getRealElevation(rCell)) >= this.config.cliffsThreshold));
            }            
        }

    }, 
    
    assignRivers: function() {
        for (var i = 0; i < this.config.nbRivers;) {
            var cell = this.diagram.cells[this.getRandomInt(0, this.diagram.cells.length - 1)];
            if (!cell.coast) {
                if (this.setAsRiver(cell, 1)) {
                    cell.source = true;
                    i++;
                }
            }
        }
    },
    
    setAsRiver: function(cell, size) {
        if (!cell.water && !cell.river) {
            cell.river = true;
            cell.riverSize = size;
            var lowerCell = null;
            var neighbors = cell.getNeighborIds();
            // we choose the lowest neighbour cell:
            for (var j = 0; j < neighbors.length; j++) {
                var nId = neighbors[j];
                var neighbor = this.diagram.cells[nId];
                if (lowerCell == null || neighbor.elevation < lowerCell.elevation) {
                    lowerCell = neighbor;
                }
            } 
            if (lowerCell.elevation < cell.elevation) {
                // we continue the river to the next lowest cell :
                this.setAsRiver(lowerCell, size);
                cell.nextRiver = lowerCell; 
            } else {
                // we are in a hole, so we create a lake :
                cell.water = true;
                this.fillLake(cell);
            }
        } else if (cell.water && !cell.ocean) {
            // we ended in a lake, the water level rise :
            cell.lakeElevation = this.getRealElevation(cell) + (this.config.lakesThreshold * size);
            this.fillLake(cell);
        } else if (cell.river) {
            // we ended in another river, the river size increase :
            cell.riverSize ++;
            var nextRiver = cell.nextRiver;
            while (nextRiver) {
                nextRiver.riverSize ++;
                nextRiver = nextRiver.nextRiver;
            }
        }
        
        return cell.river;
    },

    createVolcano: function() {
        var maxCell = 0;
        var maxElevation = 0;
        for (var i = 0; i < this.diagram.cells.length; i++) {
            var cell = this.diagram.cells[i];
            if(cell.elevation > maxElevation) {
                maxElevation = cell.elevation;
                maxCell = cell;
            }
        }

        maxCell.biome = 'VOLCANO';
        var neighbors = maxCell.getNeighborIds();
        for(var i = 0; i < neighbors.length; i++) {
            var nId = neighbors[i];
            var neighbor = this.diagram.cells[nId];
            neighbor.biome = 'VOLCANO_OUTLINE'
        }

    },

    distanceCells: function(a, b) {
        return Math.sqrt((a.site.x - b.site.x)*(a.site.x - b.site.x) + (a.site.y - b.site.y)*(a.site.y - b.site.y));
    },

    plateTectonics: function() {

        //Set up Astar
        Astar.getWeight = function(to) {
            return 1/(this.getRealElevation(to) + 1);
        }.bind(this);

        Astar.heuristicEstimate = function (p1, p2) {
            return Math.abs(p1.site.x - p2.site.x) + Math.abs(p1.site.y - p2.site.y);
        }

        Astar.findNeighbours = function(space, a) {
          var neighbours = a.getNeighborIds();
          var ret = new Array(neighbours.length);
          for (var i = 0; i < neighbours.length; i++) {
            ret[i] = space[neighbours[i]];
          }
          return ret;
        };

        Astar.hashPoint = function (cell) {
            return cell.site.x + "-" + cell.site.y;
        }

        //Choose how many tectonic plates the island lies on
        // var random = this.getRandomInt(2,4);
        random = 2;

        var maxA = 0;
        var maxACell = this.diagram.cells[0];
        var maxB = 0;
        var maxBCell = this.diagram.cells[0];
        var maxC = 0;
        var maxCCell = this.diagram.cells[0];
        var maxD = 0;
        var maxDCell = this.diagram.cells[0];

        var maxDist = this.config.width/10;

        for(var i = 0; i < this.diagram.cells.length; i++) {
            var cell = this.diagram.cells[i];

            if(this.getRealElevation(cell) >= maxA) {
                maxA = this.getRealElevation(cell);
                maxACell = cell;
            } else if (this.getRealElevation(cell) >= maxB && 
                this.distanceCells(maxACell, cell) > maxDist &&
                this.distanceCells(maxCCell, cell) > maxDist &&
                this.distanceCells(maxDCell, cell) > maxDist) {
                maxB = this.getRealElevation(cell);
                maxBCell = cell;
            } else if (this.getRealElevation(cell) >= maxC && 
                this.distanceCells(maxACell, cell) > maxDist &&
                this.distanceCells(maxCCell, cell) > maxDist &&
                this.distanceCells(maxDCell, cell) > maxDist) {
                maxC = this.getRealElevation(cell);
                maxCCell = cell;
            } else if (this.getRealElevation(cell) >= maxD && 
                this.distanceCells(maxACell, cell) > maxDist &&
                this.distanceCells(maxCCell, cell) > maxDist &&
                this.distanceCells(maxDCell, cell) > maxDist) {
                maxD = this.getRealElevation(cell);
                maxDCell = cell;
            }
        }

        //Set up all valid edges
        var edges = [];
        for(var j = 0; j < this.diagram.cells.length; j++) {
            var cell = this.diagram.cells[j];
            if(cell.site.x == 0 || cell.site.y == 0 || cell.site.x == width-1 || cell.site.y == height-1) {
                edges.push(cell);
            }
        }

        switch(random) {
            case 2:
                //Two plates coming together; use two max values 
                //to make a line determining where the plates come together.
                //Choose a random point along the edge (either x = 0, y = 0, x = height, y = height)
                //Call A-star
                var path = Astar.findPath(this.diagram.cells, maxACell, maxBCell);
                
                //Then path-find from maxA to an edge and maxB to an edge.

                // Debugging
                // for(var j = 0; j < path.length; j++) {
                //     var cell = path[j];
                //     cell.biome = 'VOLCANO';
                // }

                break;
            case 3:
                //Three plates coming together; calculate borders between the different fissures.
                //var path = Astar.findPath(this.diagram.cells, maxACell, maxBCell);
                break;
            case 4:
                //Four plates coming together; calculate borders between the different fissures.
                //var path = Astar.findPath(this.diagram.cells, maxACell, maxBCell);
                break;
            default:
                break;
        }

    },
    
    fillLake: function(cell) {
        // if the lake has an exit river he can not longer be filled
        if (cell.exitRiver == null) { 
            var exitRiver = null;
            var exitSource = null;
            var lake = new Array();
            var queue = new Array();
            queue.push(cell);
            
            while (queue.length > 0) {
                var c = queue.shift();
                lake.push(c);
                var neighbors = c.getNeighborIds();
                for (var i = 0; i < neighbors.length; i++) {
                    var nId = neighbors[i];
                    var neighbor = this.diagram.cells[nId];
                    
                    if (neighbor.water && !neighbor.ocean) { // water cell from the same lake
                        if (neighbor.lakeElevation == null || neighbor.lakeElevation < c.lakeElevation) {
                            neighbor.lakeElevation = c.lakeElevation;
                            queue.push(neighbor);
                        }
                    } else { // ground cell adjacent to the lake
                        if (c.elevation < neighbor.elevation) {
                            if (neighbor.elevation - c.lakeElevation < 0) {
                                // we fill the ground with water
                                neighbor.water = true;
                                neighbor.lakeElevation = c.lakeElevation;
                                queue.push(neighbor);
                            }
                        } else {
                            //neighbor.source = true;
                            // we found an new exit for the lake :
                            if (exitRiver == null || exitRiver.elevation > neighbor.elevation) {
                                exitSource = c;
                                exitRiver = neighbor;
                            } 
                        }
                    }
                } 
            }
            
            if (exitRiver != null) {
                // we start the exit river :
                exitSource.river = true;
                exitSource.nextRiver = exitRiver;
                this.setAsRiver(exitRiver, 2);
                // we mark all the lake as having an exit river :
                while (lake.length > 0) {
                    var c = lake.shift();
                    c.exitRiver = exitRiver;
                }
            }
        }
    },
    
    // Calculate moisture. Freshwater sources spread moisture: rivers and lakes (not ocean). 
    assignMoisture: function() {
        var queue = new Array();
        // lake and river 
        for (var i = 0; i < this.diagram.cells.length; i++) {
            var cell = this.diagram.cells[i];
            if ((cell.water || cell.river) && !cell.ocean) {
                cell.moisture = (cell.water ? 1 : 0.9);
                if (!cell.ocean) {
                    queue.push(cell);
                }
            }
        }
        
        while (queue.length > 0) {
            var cell = queue.shift();
            var neighbors = cell.getNeighborIds();
            for (var i = 0; i < neighbors.length; i++) {
                var nId = neighbors[i];
                var neighbor = this.diagram.cells[nId];
                var newMoisture = cell.moisture * 0.9;
                if (neighbor.moisture == null || newMoisture > neighbor.moisture) {
                    neighbor.moisture = newMoisture;
                    queue.push(neighbor);
                }
            } 
        }
        
        // ocean
        for (var i = 0; i < this.diagram.cells.length; i++) {
            var cell = this.diagram.cells[i];
            if (cell.ocean) {
                cell.moisture = 1;
            }
        }
    },
    
    assignBiomes: function() {
        for (var i = 0; i < this.diagram.cells.length; i++) {
            var cell = this.diagram.cells[i];
            cell.biome = this.getBiome(cell);
        }
    },

    assignMinerals: function() {
        for (var i = 0; i < this.diagram.cells.length; i++) {
            var cell = this.diagram.cells[i];
            cell.minerals = this.getMinerals(cell);
        }
    },
    
    getBiome: function (cell) {
        if(cell.volcano) {
            return 'VOLCANO';
        } else if (cell.volcanoOutline) {
            return 'VOLCANO_OUTLINE';
        } else if (cell.fishing) {
            if (this.getRealElevation(cell) < -0.13) return 'FISHING';
            return 'DEEP_WATER';
        } else if (cell.ocean) {
            if (this.getRealElevation(cell) < -0.13) return 'DEEP_WATER';
            return 'OCEAN';
        } else if (cell.water) {
            if (this.getRealElevation(cell) < 0.05) return 'MARSH';
            if (this.getRealElevation(cell) > 0.4) return 'ICE';
            return 'LAKE';
        } else if (cell.beach) {
            return 'BEACH';
        } else if (cell.elevation > 0.4) {
            if (cell.moisture > 0.50) return 'SNOW';
            else if (cell.moisture > 0.33) return 'TUNDRA';
            else if (cell.moisture > 0.16) return 'BARE';
            else return 'SCORCHED';
        } else if (cell.elevation > 0.3) {
            if (cell.moisture > 0.66) return 'TAIGA';
            else if (cell.moisture > 0.33) return 'SHRUBLAND';
            else return 'TEMPERATE_DESERT';
        } else if (cell.elevation > 0.15) {
            if (cell.moisture > 0.83) return 'TEMPERATE_RAIN_FOREST';
            else if (cell.moisture > 0.50) return 'TEMPERATE_DECIDUOUS_FOREST';
            else if (cell.moisture > 0.16) return 'GRASSLAND';
            else return 'TEMPERATE_DESERT';
        } else {
            if (cell.moisture > 0.66) return 'TROPICAL_RAIN_FOREST';
            else if (cell.moisture > 0.33) return 'TROPICAL_SEASONAL_FOREST';
            else if (cell.moisture > 0.16) return 'GRASSLAND';
            else return 'SUBTROPICAL_DESERT';
        }
    },

    // The Perlin-based island combines perlin noise with the radius
    getElevation: function (point) {
        var x = 2 * (point.x / this.config.width - 0.5);
        var y = 2 * (point.y / this.config.height - 0.5);
        var distance = Math.sqrt(x * x + y * y);
        var c = this.getPerlinValue(point); 

        return c - distance;
        //return c - (0.3 + 0.3 * distance * distance);
    },
    
    getPerlinValue: function(point) {
        var x = ((point.x / this.config.width) * this.perlin.width) | 0;
        var y = ((point.y / this.config.height) * this.perlin.height) | 0;        
        var pos = (x + y * this.perlin.width) * 4;
        var data = this.perlin.data;
        var val = data[pos + 0] << 16 | data[pos + 1] << 8 | data[pos + 2]; // rgb to hex
        
        return (val & 0xff) / 255.0;
    },
    
    getRealElevation: function(cell) {
        if (cell.water && cell.lakeElevation != null) {
            return cell.lakeElevation;
        } else if (cell.water && cell.elevation < 0) {
            return cell.elevation;
        } else {
            return cell.elevation;
        }
    },

    render: function () {
        if (!this.diagram) {
            return;
        }
        
        this.renderCells();
        this.renderRivers();
        this.renderEdges();
        this.renderSites();

        paper.view.draw();
    },
    
    renderCells: function() {
        this.cellsLayer.activate();
        for (var cellid in this.diagram.cells) {
            var cell = this.diagram.cells[cellid];
            var color = this.getCellColor(cell);
            
            var cellPath = new Path();
            cellPath.strokeWidth = 1;
            cellPath.strokeColor = color;
            cellPath.fillColor = color;
            var start =  cell.halfedges[0].getStartpoint();
            cellPath.add(new Point(start.x, start.y));
            for (var iHalfedge = 0; iHalfedge < cell.halfedges.length; iHalfedge++) {
                var halfEdge = cell.halfedges[iHalfedge];
                var end = halfEdge.getEndpoint();
                cellPath.add(new Point(end.x, end.y));
            }
            cellPath.closed = true;          
        }
    },
    
    renderRivers: function() {
        for (var cellid in this.diagram.cells) {
            var cell = this.diagram.cells[cellid];
            if (cell.nextRiver) {
                this.riversLayer.activate();
                var riverPath = new Path();
                riverPath.strokeWidth = Math.min(cell.riverSize, this.config.maxRiversSize);
                var riverColor = DISPLAY_COLORS.RIVER.clone();
                riverColor.brightness = riverColor.brightness - this.getShade(cell);
                riverPath.strokeColor = riverColor;
                riverPath.strokeCap = 'round';
                if (cell.water) {
                    riverPath.add(new Point(cell.site.x + (cell.nextRiver.site.x - cell.site.x) / 2, cell.site.y + (cell.nextRiver.site.y - cell.site.y) / 2));
                } else {
                    riverPath.add(new Point(cell.site.x, cell.site.y));
                }
                if (cell.nextRiver && !cell.nextRiver.water) {
                    riverPath.add(new Point(cell.nextRiver.site.x, cell.nextRiver.site.y));
                } else {
                    riverPath.add(new Point(cell.site.x + (cell.nextRiver.site.x - cell.site.x) / 2, cell.site.y + (cell.nextRiver.site.y - cell.site.y) / 2));
                }
            }
            // source :
            if (this.config.allowDebug && cell.source) {
                this.debugLayer.activate();
                var circle = new Path.Circle(new Point(cell.site.x, cell.site.y), 3);
                circle.fillColor = DISPLAY_COLORS.SOURCE;
            }
        }
    },
    
    renderEdges: function() {
        if (this.config.allowDebug) {
            this.debugLayer.activate();
            var edges = this.diagram.edges,
                iEdge = edges.length,
                edge, v;
            while (iEdge--) {
                edge = edges[iEdge];
                var edgePath = new Path();
                edgePath.strokeWidth = 1;

                if (edge.cliff) {
                    edgePath.strokeWidth = 1;
                    edgePath.strokeCap = 'round';
                    edgePath.strokeColor = DISPLAY_COLORS.ROCK;
                } else {
                    edgePath.strokeWidth = 1;
                    edgePath.strokeColor = '#000';
                }
                v = edge.va;
                edgePath.add(new Point(v.x, v.y));
                v = edge.vb;
                edgePath.add(new Point(v.x, v.y));
            }
        }
    },
    
    renderSites: function() {
        if (this.config.allowDebug) {
            this.debugLayer.activate();
            // sites :
            var sites = this.sites,
                iSite = sites.length;
            while (iSite--) {
                v = sites[iSite];
                var circle = new Path.Circle(new Point(v.x, v.y), 1);
                circle.fillColor = '#0f0';
            }       

            // values :
            for (var i = 0; i < this.diagram.cells.length; i++) {
                var cell = this.diagram.cells[i];
                var text = new PointText(new Point(cell.site.x, cell.site.y));
                text.fillColor = '#f00';
                text.fontSize = '8px';
                text.content = Math.ceil(this.getRealElevation(cell) * 100);
            }
        }
    },
    
    getCellColor: function(cell) {
        var c = DISPLAY_COLORS[cell.biome].clone();
        for (var key in cell.minerals) {
            if(cell.minerals[key] > 0) {
                c = DISPLAY_COLORS[key.toUpperCase()].clone();
            }
        }
        if(cell.city) {
            c = CITY_COLORS[cell.city%this.cityMax].clone();
        }
        c.brightness = c.brightness - this.getShade(cell);
        return c;
    },
    
    getShade: function(cell) {
        if (this.config.shading == 0) {
            return 0;
            
        } else if (cell.ocean) {
            return (this.config.shadeOcean ? - cell.elevation : 0);
            
        } else if (cell.water) {
            return 0;
            
        } else {
            var lowerCell = null;
            var upperCell = null;
            var neighbors = cell.getNeighborIds();
            for (var j = 0; j < neighbors.length; j++) {
                var nId = neighbors[j];
                var neighbor = this.diagram.cells[nId];
                if (lowerCell == null || neighbor.elevation < lowerCell.elevation) {
                    lowerCell = neighbor;
                }
                if (upperCell == null || neighbor.elevation > upperCell.elevation) {
                    upperCell = neighbor;
                }
            }
            
            var angleRadian = Math.atan2(upperCell.site.x - lowerCell.site.x, upperCell.site.y - lowerCell.site.y);
            var angleDegree = angleRadian * (180 / Math.PI);
            var diffElevation = (this.getRealElevation(upperCell) - this.getRealElevation(lowerCell));
            
            if (diffElevation + this.config.shading < 1) {
                diffElevation = diffElevation + this.config.shading;
            }
            
            return ((Math.abs(angleDegree) / 180) * diffElevation);
        }
    },
        
    toggleDebug: function() {
        this.debug = !this.debug;
        this.debugLayer.visible = this.debug;
    },
    
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    distance: function(a, b) {
        var dx = a.x - b.x,
            dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    printMap: function() {
        console.log(this.diagram);
        // var str = JSON.stringify(this.diagram);
        // console.log(str);
    },

    drawCity: function(cells) {
        for(var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            cell.city = this.cities;
        }
        this.cities++;
    }

};