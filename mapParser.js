function transformMap(mapObj, rand) {
  var maxX = 0;
  var maxY = 0;
  for (var i = 0; i < mapObj.diagram.cells.length; i++) {
    if(mapObj.diagram.cells[i].site.x > maxX) maxX = mapObj.diagram.cells[i].site.x;
    if(mapObj.diagram.cells[i].site.y > maxY) maxY = mapObj.diagram.cells[i].site.y;
  }
  var grid = mapObj.diagram.cells;
  // var grid = new Array(maxX + 1);
  // for (i = 0; i < grid.length; i++) {
  //   grid[i] = new Array(maxY + 1);
  // }

  // for (i = 0; i < mapObj.diagram.cells.length; i++) {
  //   grid[mapObj.diagram.cells[i].site.x][mapObj.diagram.cells[i].site.y] = mapObj.diagram.cells[i];
  // }

  // var prev = null;
  // for(i = 0; grid.length; i++) {
  //   for (var j = 0; j < grid[i].length; j++) {
  //     if(grid[i][j]) {
  //       prev = grid[i][j];
  //       break;
  //     }
  //   }
  //   if(prev) break;
  // }
  var totalGold = 0;
  for (i = 0; i < grid.length; i++) {
    grid[i].blocked = (!!grid[i].water || !!grid[i].ocean || !!grid[i].river);
    grid[i].conquerability = grid[i].blocked ? 0 : grid[i].elevation + grid[i].trees - grid[i].trees;

    switch(grid[i].biome) {
        case 'VOLCANO':
        case 'VOLCANO_OUTLINE':
        case 'DEEP_WATER':
        case 'OCEAN':
        case 'MARSH':
        case 'ICE':
        case 'LAKE':
        case 'TUNDRA':
        case 'BARE':
        case 'SCORCHED':
        case 'SUBTROPICAL_DESERT':
          grid[i].fertility = 0;
          grid[i].wildlife = rand(0, 10);
          break;
        case 'FISHING':
          grid[i].wildlife = rand(80, 100);
          break;
        case 'BEACH':
          grid[i].fertility = rand(0, 10);
          grid[i].wildlife = rand(0, 10);
          break;
        case 'TAIGA':
          grid[i].fertility = rand(20, 50);
          grid[i].wildlife = rand(20, 30);
          break;
        case 'SHRUBLAND':
          grid[i].fertility = rand(0, 20);
          grid[i].wildlife = rand(0, 40);
          break;
        case 'TEMPERATE_DESERT':
          grid[i].fertility = rand(0, 5);
          grid[i].wildlife = rand(0, 5);
          break;
        case 'TEMPERATE_RAIN_FOREST':
          grid[i].fertility = rand(40, 80);
          grid[i].wildlife = rand(40, 100);
          break;
        case 'TEMPERATE_DECIDUOUS_FOREST':
          grid[i].fertility = rand(50, 70);
          grid[i].wildlife = rand(30, 90);
          break;
        case 'GRASSLAND':
          grid[i].fertility = rand(70, 90);
          grid[i].wildlife = rand(20, 80);
          break;
        case 'TROPICAL_RAIN_FOREST':
          grid[i].fertility = rand(70, 100);
          grid[i].wildlife = rand(50, 100);
          break;
        case 'TROPICAL_SEASONAL_FOREST':
          grid[i].fertility = rand(70, 90);
          grid[i].wildlife = rand(50, 100);
          break;
    }

    totalGold += grid[i].minerals.gold;
  }
  // for (var x = 0; x < grid.length; x++) {
  //   for (var y = 0; y < grid[x].length; y++) {
  //     if(!grid[x][y]) grid[x][y] = clone(prev);

  //     prev = grid[x][y];

  //     grid[x][y].x = x;
  //     grid[x][y].y = y;

  //     grid[x][y].blocked = (grid[x][y].water || grid[x][y].ocean || grid[x][y].river);

  //     grid[x][y].conquerability = grid[x][y].blocked ? 0 : grid[x][y].elevation + grid[x][y].trees - grid[x][y].trees;

  //     switch(grid[x][y].biome) {
  //         case 'VOLCANO':
  //         case 'VOLCANO_OUTLINE':
  //         case 'FISHING':
  //         case 'DEEP_WATER':
  //         case 'OCEAN':
  //         case 'MARSH':
  //         case 'ICE':
  //         case 'LAKE':
  //         case 'SNOW':
  //         case 'TUNDRA':
  //         case 'BARE':
  //         case 'SCORCHED':
  //         case 'SUBTROPICAL_DESERT':
  //           grid[x][y].fertility = 0;
  //           break;
  //         case 'BEACH':
  //           grid[x][y].fertility = rand(0, 10)/100;
  //           break;
  //         case 'TAIGA':
  //           grid[x][y].fertility = rand(20, 50)/100;
  //           break;
  //         case 'SHRUBLAND':
  //           grid[x][y].fertility = rand(0, 20)/100;
  //           break;
  //         case 'TEMPERATE_DESERT':
  //           grid[x][y].fertility = rand(0, 5)/100;
  //           break;
  //         case 'TEMPERATE_RAIN_FOREST':
  //           grid[x][y].fertility = rand(40, 80)/100;
  //           break;
  //         case 'TEMPERATE_DECIDUOUS_FOREST':
  //           grid[x][y].fertility = rand(50, 70)/100;
  //           break;
  //         case 'GRASSLAND':
  //           grid[x][y].fertility = rand(70, 90)/10;
  //           break;
  //         case 'TROPICAL_RAIN_FOREST':
  //           grid[x][y].fertility = rand(70, 100)/100;
  //           break;
  //         case 'TROPICAL_SEASONAL_FOREST':
  //           grid[x][y].fertility = rand(70, 90)/100;
  //           break;
  //     }

  //     totalGold += grid[x][y].minerals.gold;

    // }
  // }
  return {
    grid: grid,
    totalGold: totalGold
  };
}