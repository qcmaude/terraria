var assert = require("assert");
var SortedHash = require("../src/SortedHash.js");

describe('SortedHash', function() {
  describe('#fullTest', function() {
    it('should return a perfectly sorted list', function() {
      var objects = [];
      var hash = new SortedHash("val");
      for (var i = 0; i < 1000; i++) {
        hash.push({
          id: i,
          val: Math.random()
        });
      }

      var last = hash.pop();
      var next;
      while (last) {
        next = hash.pop();
        if (next) {
          assert(last.val <= next.val);
        }
        last = next;
      }
    });
  });
});
