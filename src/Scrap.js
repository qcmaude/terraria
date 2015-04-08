// p.index = pub.centers.length;
// p.point = point;
// p.neighbors = [];
// p.borders = [];
// p.corners = [];
// pub.centers.push(p);
// centerLookup[pc.hash(point)] = p;

function drawPathForwards(graphics, path) {
    for (var i = 0; i < path.length; i++) {
        graphics.lineTo(path[i].x, path[i].y);
    }
}

// Render the interior of polygons
exports.renderPolygons = function (graphics, colors, gradientFillProperty, colorOverrideFunction, map, noisyEdges)  {
    // My Voronoi polygon rendering doesn't handle the boundary
    // polygons, so I just fill everything with ocean first.
    graphics.fillStyle = colorModule.intToHexColor(colors.OCEAN);
    graphics.fillRect(0, 0, core.toInt(map.SIZE.width), core.toInt(map.SIZE.height));
 
    var drawPath0 = function (graphics, x, y) {
        var path = noisyEdges.path0[edge.index];
        graphics.moveTo(x, y);
        graphics.lineTo(path[0].x, path[0].y);
        drawPathForwards(graphics, path);
        graphics.lineTo(x, y);
    };

    var drawPath1 = function (graphics, x, y) {
        var path = noisyEdges.path1[edge.index];
        graphics.moveTo(x, y);
        graphics.lineTo(path[0].x, path[0].y);
        drawPathForwards(graphics, path);
        graphics.lineTo(x, y);
    };

    for (var centerIndex = 0; centerIndex < map.centers.length; centerIndex++) {
        var p = map.centers[centerIndex];
        for (var neighborIndex = 0; neighborIndex < p.neighbors.length; neighborIndex++) {
            var r = p.neighbors[neighborIndex];
            var edge = map.lookupEdgeFromCenter(p, r);
            var color = core.coalesce(colors[p.biome], 0);
            if (colorOverrideFunction !== null) {
                color = colorOverrideFunction(color, p, r, edge, colors);
            }

            if (core.isUndefinedOrNull(noisyEdges.path0[edge.index]) || core.isUndefinedOrNull(noisyEdges.path1[edge.index])) {
                // It's at the edge of the map, where we don't have
                // the noisy edges computed. TODO: figure out how to
                // fill in these edges from the voronoi library.
                continue;
            }

            if (!core.isUndefinedOrNull(gradientFillProperty)) {
                // We'll draw two triangles: center - corner0 -
                // midpoint and center - midpoint - corner1.
                var corner0 = edge.v0;
                var corner1 = edge.v1;

                // We pick the midpoint elevation/moisture between
                // corners instead of between polygon centers because
                // the resulting gradients tend to be smoother.
                var midpoint = edge.midpoint;
                var midpointAttr = 0.5 * (corner0[gradientFillProperty] + corner1[gradientFillProperty]);
                drawGradientTriangle(
                    graphics,
                    vector3d(p.point.x, p.point.y, p[gradientFillProperty]),
                    vector3d(corner0.point.x, corner0.point.y, corner0[gradientFillProperty]),
                    vector3d(midpoint.x, midpoint.y, midpointAttr),
                    [colors.GRADIENT_LOW, colors.GRADIENT_HIGH],
                    drawPath0, p.point.x, p.point.y
                );
                drawGradientTriangle(
                    graphics,
                    vector3d(p.point.x, p.point.y, p[gradientFillProperty]),
                    vector3d(midpoint.x, midpoint.y, midpointAttr),
                    vector3d(corner1.point.x, corner1.point.y, corner1[gradientFillProperty]),
                    [colors.GRADIENT_LOW, colors.GRADIENT_HIGH],
                    drawPath1, p.point.x, p.point.y
                );
            } else {
                graphics.fillStyle = colorModule.intToHexColor(color);
                graphics.strokeStyle = graphics.fillStyle;
                graphics.beginPath();
                drawPath0(graphics, p.point.x, p.point.y);
                drawPath1(graphics, p.point.x, p.point.y);
                graphics.closePath();
                graphics.fill();
                graphics.stroke();
            }
        }
    }
};

[
        function(t, e, r) {
            "use strict";
            r.displayColors = {
                OCEAN: 4473978,
                COAST: 3355482,
                LAKESHORE: 2250120,
                LAKE: 3368601,
                RIVER: 2250120,
                MARSH: 3106406,
                ICE: 10092543,
                BEACH: 10522743,
                ROAD1: 4465169,
                ROAD2: 5583650,
                ROAD3: 6702131,
                BRIDGE: 6842464,
                LAVA: 13382451,
                SNOW: 16777215,
                TUNDRA: 12303274,
                BARE: 8947848,
                SCORCHED: 5592405,
                TAIGA: 10070647,
                SHRUBLAND: 8952183,
                TEMPERATE_DESERT: 13226651,
                TEMPERATE_RAIN_FOREST: 4491349,
                TEMPERATE_DECIDUOUS_FOREST: 6788185,
                GRASSLAND: 8956501,
                SUBTROPICAL_DESERT: 13810059,
                TROPICAL_RAIN_FOREST: 3372885,
                TROPICAL_SEASONAL_FOREST: 5609796
            }, r.elevationGradientColors = {
                OCEAN: 34816,
                GRADIENT_LOW: 34816,
                GRADIENT_HIGH: 16776960
            }
        }, {}
    ],

    generateSquare: function (width, height) {
        return function (numPoints) {
            var points = []; // Vector.<Point>
            var n = Math.sqrt(numPoints);
            for (var x = 0; x < n; x++) {
                for (var y = 0; y < n; y++) {
                    points.push({
                        x: (0.5 + x) / n * width,
                        y: (0.5 + y) / n * height
                    });
                }
            }
            return points;
        };

            // Build graph data structure in 'edges', 'centers', 'corners',
    // based on information in the Voronoi results: point.neighbors
    // will be a list of neighboring points of the same type (corner
    // or center); point.edges will be a list of edges that include
    // that point. Each edge connects to four points: the Voronoi edge
    // edge.{v0,v1} and its dual Delaunay triangle edge edge.{d0,d1}.
    // For boundary polygons, the Delaunay edge will have one null
    // point, and the Voronoi edge may be null.
    pub.buildGraph = function (points, voronoi) {
        var p;
        var libedges = voronoi.edges();
        var centerLookup = {}; // Dictionary<Center>

        // Build Center objects for each of the points, and a lookup map
        // to find those Center objects again as we build the graph
        _(points).each(function (point) {
            p = centerModule();
            p.index = pub.centers.length;
            p.point = point;
            p.neighbors = [];
            p.borders = [];
            p.corners = [];
            pub.centers.push(p);
            centerLookup[pc.hash(point)] = p;
        });

        // Workaround for Voronoi lib bug: we need to call region()
        // before Edges or neighboringSites are available
        _(pub.centers).each(function (p) {
            voronoi.region(p.point);
        });
      
        // The Voronoi library generates multiple Point objects for
        // corners, and we need to canonicalize to one Corner object.
        // To make lookup fast, we keep an array of Points, bucketed by
        // x value, and then we only have to look at other Points in
        // nearby buckets. When we fail to find one, we'll create a new
        // Corner object.
        var _cornerMap = [];
        function makeCorner(point) {
            var q;
            if (point === null) { return null; }
            var bucket;
            for (bucket = core.toInt(point.x) - 1; bucket < core.toInt(point.x) + 2; bucket++) {
                if (!core.isUndefinedOrNull(_cornerMap[bucket])) {
                    for (var z = 0; z < _cornerMap[bucket].length; z++) {
                        q = _cornerMap[bucket][z];
                        var dx = point.x - q.point.x;
                        var dy = point.y - q.point.y;
                        if (dx * dx + dy * dy < 1e-6) {
                            return q;
                        }
                    }
                }
            }
            bucket = core.toInt(point.x);
            if (core.isUndefinedOrNull(_cornerMap[bucket])) { _cornerMap[bucket] = []; }
            q = cornerModule();
            q.index = pub.corners.length;
            pub.corners.push(q);
            q.point = point;
            q.border = (point.x === 0 || point.x === pub.SIZE.width || point.y === 0 || point.y === pub.SIZE.height);
            q.touches = [];
            q.protrudes = [];
            q.adjacent = [];
            _cornerMap[bucket].push(q);
            return q;
        }

        // Helper functions for the following for loop; ideally these
        // would be inlined
        function addToCornerList(v, x) {
            if (x !== null && v.indexOf(x) < 0) { v.push(x); }
        }

        function addToCenterList(v, x) {
            if (x !== null && v.indexOf(x) < 0) { v.push(x); }
        }

        _(libedges).each(function (libedge) {
            var dedge = libedge.delaunayLine();
            var vedge = libedge.voronoiEdge();

            // Fill the graph data. Make an Edge object corresponding to
            // the edge from the voronoi library.
            var edge = edgeModule();
            edge.index = pub.edges.length;
            edge.river = 0;
            pub.edges.push(edge);
            edge.midpoint = (vedge.p0 !== null && vedge.p1 !== null) ? pc.interpolate(vedge.p0, vedge.p1, 0.5) : null;
          
            // Edges point to corners. Edges point to centers. 
            edge.v0 = makeCorner(vedge.p0);
            edge.v1 = makeCorner(vedge.p1);
            edge.d0 = centerLookup[pc.hash(dedge.p0)];
            edge.d1 = centerLookup[pc.hash(dedge.p1)];

            // Centers point to edges. Corners point to edges.
            if (edge.d0 !== null) { edge.d0.borders.push(edge); }
            if (edge.d1 !== null) { edge.d1.borders.push(edge); }
            if (edge.v0 !== null) { edge.v0.protrudes.push(edge); }
            if (edge.v1 !== null) { edge.v1.protrudes.push(edge); }
          
            // Centers point to centers.
            if (edge.d0 !== null && edge.d1 !== null) {
                addToCenterList(edge.d0.neighbors, edge.d1);
                addToCenterList(edge.d1.neighbors, edge.d0);
            }

            // Corners point to corners
            if (edge.v0 !== null && edge.v1 !== null) {
                addToCornerList(edge.v0.adjacent, edge.v1);
                addToCornerList(edge.v1.adjacent, edge.v0);
            }

            // Centers point to corners
            if (edge.d0 !== null) {
                addToCornerList(edge.d0.corners, edge.v0);
                addToCornerList(edge.d0.corners, edge.v1);
            }
            if (edge.d1 !== null) {
                addToCornerList(edge.d1.corners, edge.v0);
                addToCornerList(edge.d1.corners, edge.v1);
            }

            // Corners point to centers
            if (edge.v0 !== null) {
                addToCenterList(edge.v0.touches, edge.d0);
                addToCenterList(edge.v0.touches, edge.d1);
            }
            if (edge.v1 !== null) {
                addToCenterList(edge.v1.touches, edge.d0);
                addToCenterList(edge.v1.touches, edge.d1);
            }
        });
    };

    // Determine elevations and water at Voronoi corners. By
    // construction, we have no local minima. This is important for
    // the downslope vectors later, which are used in the river
    // construction algorithm. Also by construction, inlets/bays
    // push low elevation areas inland, which means many rivers end
    // up flowing out through them. Also by construction, lakes
    // often end up on river paths because they don't raise the
    // elevation as much as other terrain does.
    pub.assignCornerElevations = function () {
        var queue = []; // Array<Corner>
      
        _(pub.corners).each(function (q) {
            q.water = !pub.inside(q.point);
        });

        _(pub.corners).each(function (q) {
            // The edges of the map are elevation 0
            if (q.border) {
                q.elevation = 0.0;
                queue.push(q);
            } else {
                q.elevation = Number.POSITIVE_INFINITY;
            }
        });
        // Traverse the graph and assign elevations to each point. As we
        // move away from the map border, increase the elevations. This
        // guarantees that rivers always have a way down to the coast by
        // going downhill (no local minima).
        while (queue.length > 0) {
            var q = queue.shift();
            for (var adjacentIndex = 0; adjacentIndex < q.adjacent.length; adjacentIndex++) {
                var s = q.adjacent[adjacentIndex];

                // Every step up is epsilon over water or 1 over land. The
                // number doesn't matter because we'll rescale the
                // elevations later.
                var newElevation = 0.01 + q.elevation;
                if (!q.water && !s.water) {
                    newElevation += 1;
                    if (pub.needsMoreRandomness) {
                        // HACK: the map looks nice because of randomness of
                        // points, randomness of rivers, and randomness of
                        // edges. Without random point selection, I needed to
                        // inject some more randomness to make maps look
                        // nicer. I'm doing it here, with elevations, but I
                        // think there must be a better way. This hack is only
                        // used with square/hexagon grids.
                        newElevation += pub.mapRandom.nextDouble();
                    }

                }

                // If this point changed, we'll add it to the queue so
                // that we can process its neighbors too.
                if (newElevation < s.elevation) {
                    s.elevation = newElevation;
                    queue.push(s);
                }
            }
        }
    };

    // Change the overall distribution of elevations so that lower
    // elevations are more common than higher
    // elevations. Specifically, we want elevation X to have frequency
    // (1-X).  To do this we will sort the corners, then set each
    // corner to its desired elevation.
    pub.redistributeElevations = function (locations) {
        // SCALE_FACTOR increases the mountain area. At 1.0 the maximum
        // elevation barely shows up on the map, so we set it to 1.1.
        var SCALE_FACTOR = 1.1;
        var i, y, x;

        //JavaScript port
        //locations.sortOn('elevation', Array.NUMERIC);
        locations.sort(function (c1, c2) {
            if (c1.elevation > c2.elevation) { return 1; }
            if (c1.elevation < c2.elevation) { return -1; }
            if (c1.index > c2.index) { return 1; }
            if (c1.index < c2.index) { return -1; }
            return 0;
        });
      
        for (i = 0; i < locations.length; i++) {
            // Let y(x) be the total area that we want at elevation <= x.
            // We want the higher elevations to occur less than lower
            // ones, and set the area to be y(x) = 1 - (1-x)^2.
            y = i / (locations.length - 1);
            // Now we have to solve for x, given the known y.
            //  *  y = 1 - (1-x)^2
            //  *  y = 1 - (1 - 2x + x^2)
            //  *  y = 2x - x^2
            //  *  x^2 - 2x + y = 0
            // From this we can use the quadratic equation to get:
            x = Math.sqrt(SCALE_FACTOR) - Math.sqrt(SCALE_FACTOR * (1 - y));
            if (x > 1.0) { x = 1.0; }  // TODO: does this break downslopes?
            locations[i].elevation = x;
        }
    };

    // Change the overall distribution of moisture to be evenly distributed.
    pub.redistributeMoisture = function (locations) {
        var i;
      
        locations.sort(function (c1, c2) {
            if (c1.moisture > c2.moisture) { return 1; }
            if (c1.moisture < c2.moisture) { return -1; }
            if (c1.index > c2.index) { return 1; }
            if (c1.index < c2.index) { return -1; }
            return 0;
        });
      
        for (i = 0; i < locations.length; i++) {
            locations[i].moisture = i / (locations.length - 1);
        }
    };

    // Determine polygon and corner types: ocean, coast, land.
    pub.assignOceanCoastAndLand = function (lakeThreshold) {
        // Compute polygon attributes 'ocean' and 'water' based on the
        // corner attributes. Count the water corners per
        // polygon. Oceans are all polygons connected to the edge of the
        // map. In the first pass, mark the edges of the map as ocean;
        // in the second pass, mark any water-containing polygon
        // connected an ocean as ocean.
        var queue = []; // Array<Center>
        var p, numWater;
      
        _(pub.centers).each(function (p) {
            numWater = 0;
            _(p.corners).each(function (q) {
                if (q.border) {
                    p.border = true;
                    p.ocean = true;
                    q.water = true;
                    queue.push(p);
                }
                if (q.water) {
                    numWater += 1;
                }
            });
            p.water = (p.ocean || numWater >= p.corners.length * lakeThreshold);
        });
        while (queue.length > 0) {
            p = queue.shift();
            for (var neighbourIndex = 0; neighbourIndex < p.neighbors.length; neighbourIndex++) {
                var r = p.neighbors[neighbourIndex];
                if (r.water && !r.ocean) {
                    r.ocean = true;
                    queue.push(r);
                }
            }
        }
      
        // Set the polygon attribute 'coast' based on its neighbors. If
        // it has at least one ocean and at least one land neighbor,
        // then this is a coastal polygon.
        _(pub.centers).each(function (p) {
            var numOcean = 0;
            var numLand = 0;
            _(p.neighbors).each(function (r) {
                numOcean += convert.intFromBoolean(r.ocean);
                numLand += convert.intFromBoolean(!r.water);
            });
            p.coast = (numOcean > 0) && (numLand > 0);
        });


        // Set the corner attributes based on the computed polygon
        // attributes. If all polygons connected to this corner are
        // ocean, then it's ocean; if all are land, then it's land;
        // otherwise it's coast.
        _(pub.corners).each(function (q) {
            var numOcean = 0;
            var numLand = 0;
            _(q.touches).each(function (p) {
                numOcean += convert.intFromBoolean(p.ocean);
                numLand += convert.intFromBoolean(!p.water);
            });
            q.ocean = (numOcean === q.touches.length);
            q.coast = (numOcean > 0) && (numLand > 0);
            q.water = q.border || ((numLand !== q.touches.length) && !q.coast);
        });
    };

    // Polygon elevations are the average of the elevations of their corners.
    pub.assignPolygonElevations = function () {
        var sumElevation;
        _(pub.centers).each(function (p) {
            sumElevation = 0.0;
            _(p.corners).each(function (q) {
                sumElevation += q.elevation;
            });
            p.elevation = sumElevation / p.corners.length;
        });
    };

    // Calculate downslope pointers.  At every point, we point to the
    // point downstream from it, or to itself.  This is used for
    // generating rivers and watersheds.
    pub.calculateDownslopes = function () {
        var r;
      
        _(pub.corners).each(function (q) {
            r = q;
            _(q.adjacent).each(function (s) {
                if (s.elevation <= r.elevation) {
                    r = s;
                }
            });
            q.downslope = r;
        });
    };

    // Calculate the watershed of every land point. The watershed is
    // the last downstream land point in the downslope graph. TODO:
    // watersheds are currently calculated on corners, but it'd be
    // more useful to compute them on polygon centers so that every
    // polygon can be marked as being in one watershed.
    pub.calculateWatersheds = function () {
        var r, i, changed;
      
        // Initially the watershed pointer points downslope one step.      
        _(pub.corners).each(function (q) {
            q.watershed = q;
            if (!q.ocean && !q.coast) {
                q.watershed = q.downslope;
            }
        });
        // Follow the downslope pointers to the coast. Limit to 100
        // iterations although most of the time with numPoints==2000 it
        // only takes 20 iterations because most points are not far from
        // a coast.  TODO: can run faster by looking at
        // p.watershed.watershed instead of p.downslope.watershed.
        var cornerIndex, q;
        for (i = 0; i < 100; i++) {
            changed = false;
            for (cornerIndex = 0; cornerIndex < pub.corners.length; cornerIndex++) {
                q = pub.corners[cornerIndex];
                if (!q.ocean && !q.coast && !q.watershed.coast) {
                    r = q.downslope.watershed;
                    if (!r.ocean) { q.watershed = r; }
                    changed = true;
                }
            }
            if (!changed) { break; }
        }
        // How big is each watershed?
        for (cornerIndex = 0; cornerIndex < pub.corners.length; cornerIndex++) {
            q = pub.corners[cornerIndex];
            r = q.watershed;
            r.watershedSize = 1 + (r.watershedSize || 0);
        }
    };

    // Create rivers along edges. Pick a random corner point,
    // then move downslope. Mark the edges and corners as rivers.
    // riverChance: Higher = more rivers.
    pub.createRivers = function (riverChance) {
        riverChance = core.coalesce(riverChance, core.toInt((pub.SIZE.width + pub.SIZE.height) / 4));

        var i, q, edge;
      
        for (i = 0; i < riverChance; i++) {
            q = pub.corners[pub.mapRandom.nextIntRange(0, pub.corners.length - 1)];
            if (q.ocean || q.elevation < 0.3 || q.elevation > 0.9) { continue; }
            // Bias rivers to go west: if (q.downslope.x > q.x) continue;
            while (!q.coast) {
                if (q === q.downslope) {
                    break;
                }
                edge = pub.lookupEdgeFromCorner(q, q.downslope);
                edge.river = edge.river + 1;
                q.river = (q.river || 0) + 1;
                q.downslope.river = (q.downslope.river || 0) + 1;  // TODO: fix double count
                q = q.downslope;
            }
        }
    };

    // Helper function for drawing triangles with gradients. This
// function sets up the fill on the graphics object, and then
// calls fillFunction to draw the desired path.
function drawGradientTriangle(graphics, v1, v2, v3, colors, fillFunction, fillX, fillY) {
    var m = matrix();

    // Center of triangle:
    var V = v1.add(v2).add(v3);
    V.scaleBy(1 / 3.0);

    // Normal of the plane containing the triangle:
    var N = v2.subtract(v1).crossProduct(v3.subtract(v1));
    N.normalize();

    // Gradient vector in x-y plane pointing in the direction of increasing z
    var G = vector3d(-N.x / N.z, -N.y / N.z, 0);

    // Center of the color gradient
    var C = vector3d(V.x - G.x * ((V.z - 0.5) / G.length / G.length), V.y - G.y * ((V.z - 0.5) / G.length / G.length));

    if (G.length < 1e-6) {
        // If the gradient vector is small, there's not much
        // difference in colors across this triangle. Use a plain
        // fill, because the numeric accuracy of 1/G.length is not to
        // be trusted.  NOTE: only works for 1, 2, 3 colors in the array
        var color = colors[0];
        if (colors.length === 2) {
            color = colorModule.interpolateColor(colors[0], colors[1], V.z);
        } else if (colors.length === 3) {
            if (V.z < 0.5) {
                color = colorModule.interpolateColor(colors[0], colors[1], V.z * 2);
            } else {
                color = colorModule.interpolateColor(colors[1], colors[2], V.z * 2 - 1);
            }
        }
        graphics.fillStyle = colorModule.intToHexColor(color); //graphics.beginFill(color);
    } else {
        // The gradient box is weird to set up, so we let Flash set up
        // a basic matrix and then we alter it:
        m.createGradientBox(1, 1, 0, 0, 0);
        m.translate(-0.5, -0.5);
        m.scale((1 / G.length), (1 / G.length));
        m.rotate(Math.atan2(G.y, G.x));
        m.translate(C.x, C.y);
        var alphas = _(colors).map(function (c) { return 1.0; });
        var spread = _(colors).map(function (c, index) { return 255 * index / (colors.length - 1); });
        //graphics.beginGradientFill(GradientType.LINEAR, colors, alphas, spread, m, SpreadMethod.PAD);
    }
    fillFunction(graphics, fillX, fillY);
    graphics.fill(); //graphics.endFill();
}