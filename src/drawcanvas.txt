'use strict';

var seed = 53;

var islandRandom = {
	seed: 1,
    nextDouble: function () {
        return (this.gen() / 2147483647);
    },
    nextIntRange: function (min, max) {
        min -= 0.4999;
        max += 0.4999;
        return Math.round(min + ((max - min) * this.nextDouble()));
    },
    nextDoubleRange: function (min, max) {
        return min + ((max - min) * this.nextDouble());
    },
    gen: function () {
        //integer version 1, for max int 2^46 - 1 or larger.
        this.seed = (this.seed * 16807) % 2147483647;
        return this.seed;
    }
};

$(document).ready(function() {

	var height = 1000;
	var heightBounds = 50;
	var width = 800;
	var widthBounds = 30;
	var center = {x: height/2, y:width/2};
	var map = new Array(height);
	var maxDistance = Math.sqrt((width - width/2)*(width - width/2) + (height - height/2)*(height - height/2));
	var islandFactor = 1.07;

	for(var i = 0; i < height; i++) {
		map[i] = new Array(width);
	}

	for(var i = 0; i < height; i++) {
		for(var j = 0; j < width; j++) {
			map[i][j] = {x:i, y:j, length:10, biome:"None", inside:false};
			map[i][j].inside = makePerlin(map[i][j], 0.5);
		}
	}

	function distanceFromOrigin(q) {
		var distance = Math.sqrt((center.x - q.x)*(center.x - q.x)+(center.y - q.y)*(center.y - q.y));
		return distance/maxDistance;
	}

	function makePerlinNoise(width, height, _x, _y, _z, seed, octaves, falloff) {
        
        seed = seed || 666;
        octaves = octaves || 4;
        falloff = falloff || 0.5;

        var baseFactor = 1 / 64;
        
        var iXoffset = seed = (seed * 16807.0) % 2147483647;
        var iYoffset = seed = (seed * 16807.0) % 2147483647;
        var iZoffset = seed = (seed * 16807.0) % 2147483647;
      
        var aOctFreq = []; // frequency per octave
        var aOctPers = []; // persistence per octave
        var fPersMax = 0.0; // 1 / max persistence

        var fFreq, fPers;

        var i;
        for (i = 0; i < octaves; i++) {
            fFreq = Math.pow(2, i);
            fPers = Math.pow(falloff, i);
            fPersMax += fPers;
            aOctFreq.push(fFreq);
            aOctPers.push(fPers);
        }

        fPersMax = 1 / fPersMax;

        var bitmap = new Array2D([]);
        
        var baseX = _x * baseFactor + iXoffset;
        _y = _y * baseFactor + iYoffset;
        _z = _z * baseFactor + iZoffset;

        var py;
        for (py = 0; py < height; py++) {
            _x = baseX;
            
            var px;
            for (px = 0; px < width; px++) {
                var s = 0.0;

                for (i = 0; i < octaves; i++) {
                    var fFreq2 = aOctFreq[i];
                    var fPers2 = aOctPers[i];

                    var x = _x * fFreq2;
                    var y = _y * fFreq2;
                    var z = _z * fFreq2;

                    var xf = x - (x % 1);
                    var yf = y - (y % 1);
                    var zf = z - (z % 1);

                    var X = xf & 255;
                    var Y = yf & 255;
                    var Z = zf & 255;

                    x -= xf;
                    y -= yf;
                    z -= zf;

                    var u = x * x * x * (x * (x * 6 - 15) + 10);
                    var v = y * y * y * (y * (y * 6 - 15) + 10);
                    var w = z * z * z * (z * (z * 6 - 15) + 10);

                    var A  = (map[X]) + Y;
                    var AA = (map[A]) + Z;
                    var AB = (map[A + 1]) + Z;
                    var B  = (map[X + 1]) + Y;
                    var BA = (map[B]) + Z;
                    var BB = (map[B + 1]) + Z;

                    var x1 = x - 1;
                    var y1 = y - 1;
                    var z1 = z - 1;

                    var hash = (map[BB + 1]) & 15;
                    var g1 = ((hash&1) === 0 ? (hash < 8 ? x1 : y1) : (hash < 8 ? -x1 : -y1)) + ((hash&2) === 0 ? hash < 4 ? y1 : (hash === 12 ? x1 : z1) : hash < 4 ? -y1 : (hash === 14 ? -x1 : -z1));

                    hash = (map[AB + 1]) & 15;
                    var g2 = ((hash&1) === 0 ? (hash < 8 ? x  : y1) : (hash < 8 ? -x  : -y1)) + ((hash&2) === 0 ? hash < 4 ? y1 : (hash === 12 ? x  : z1) : hash < 4 ? -y1 : (hash === 14 ? -x : -z1));

                    hash = (map[BA + 1]) & 15;
                    var g3 = ((hash&1) === 0 ? (hash < 8 ? x1 : y) : (hash < 8 ? -x1 : -y)) + ((hash&2) === 0 ? hash < 4 ? y  : (hash === 12 ? x1 : z1) : hash < 4 ? -y  : (hash === 14 ? -x1 : -z1));

                    hash = (map[AA + 1]) & 15;
                    var g4 = ((hash&1) === 0 ? (hash < 8 ? x  : y) : (hash < 8 ? -x  : -y)) + ((hash&2) === 0 ? hash < 4 ? y  : (hash === 12 ? x  : z1) : hash < 4 ? -y  : (hash === 14 ? -x  : -z1));

                    hash = (map[BB]) & 15;
                    var g5 = ((hash&1) === 0 ? (hash < 8 ? x1 : y1) : (hash < 8 ? -x1 : -y1)) + ((hash&2) === 0 ? hash < 4 ? y1 : (hash === 12 ? x1 : z) : hash < 4 ? -y1 : (hash === 14 ? -x1 : -z));

                    hash = (map[AB]) & 15;
                    var g6 = ((hash&1) === 0 ? (hash < 8 ? x  : y1) : (hash < 8 ? -x  : -y1)) + ((hash&2) === 0 ? hash < 4 ? y1 : (hash === 12 ? x  : z) : hash < 4 ? -y1 : (hash === 14 ? -x  : -z));

                    hash = (map[BA]) & 15;
                    var g7 = ((hash&1) === 0 ? (hash < 8 ? x1 : y) : (hash < 8 ? -x1 : -y)) + ((hash&2) === 0 ? hash < 4 ? y  : (hash === 12 ? x1 : z) : hash < 4 ? -y  : (hash === 14 ? -x1 : -z));

                    hash = (map[AA]) & 15;
                    var g8 = ((hash&1) === 0 ? (hash < 8 ? x  : y) : (hash < 8 ? -x  : -y)) + ((hash&2) === 0 ? hash < 4 ? y  : (hash === 12 ? x  : z) : hash < 4 ? -y  : (hash === 14 ? -x  : -z));

                    g2 += u * (g1 - g2);
                    g4 += u * (g3 - g4);
                    g6 += u * (g5 - g6);
                    g8 += u * (g7 - g8);

                    g4 += v * (g2 - g4);
                    g8 += v * (g6 - g8);

                    s += (g8 + w * (g4 - g8)) * fPers2;
                }

                var color = (s * fPersMax + 1) * 128;

                console.log(bitmap);
                bitmap.set(px, py, 0xff000000 | color << 16 | color << 8 | color);

                _x += baseFactor;
            }

            _y += baseFactor;
        }
        return bitmap.value;
    }

	function makePerlin(t, e) {
        var r = .1,
            a = .5;
            e = (a - r) * e + r;
        var h = i(makePerlinNoise(256, 256, 1, 1, 1, t, 8));
        return function(t) {
            var r = (255 & h.get(n.toInt(128 * (t.x + 1)), n.toInt(128 * (t.y + 1)))) / 255;
            return r > e + e * o(t) * o(t)
        }
    }

	for(i = 0; i < height; i+=3) {
		for(j = 0; j < width; j+=3) {
			var inside = mamap[i][j].inside
			var color = '#158de2'
			
			if(inside) {
				color = '#6c9e6a'
			}

			$('canvas').drawRect({
				fillStyle: color,
				x:i, y:j,
				width: 3, height: 3,
				fromCenter: false
			});
		}
	}

	//Draw rivers:
	// $('canvas').drawLine({
	// 	strokeStyle: '#000',//'#36a3ef',
	// 	strokeWidth: 0.3,
	// 	x1:i, y1:j,
	// 	x2:i, y2:j+10
	// });

});