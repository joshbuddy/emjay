require('../lib/emjay');

describe("Emjay", function() {
  it("should interpolate a simple value", function() {
    var template = new Emjay("test`1`");
    assertEqual('test1', template.run());
  });

  it("should interpolate a more complex example", function() {
    var template = new Emjay("test`'test' + 3`");
    assertEqual('testtest3', template.run());
  });
  
  it("should not interpolate if it starts with ``", function() {
    var template = new Emjay("test`` 1+1`");
    assertEqual('test', template.run());
  });
  
  it("should not interpolate if it starts with ``", function() {
    var template = new Emjay("test`` 1+1`");
    assertEqual('test', template.run());
  });
  
  it("should preserve variables declared in it, but not on subsequent runs", function() {
    var template = new Emjay("``try {val += 1} catch(e) {}; val = 1`test`val`\n``val += 1`");
    assertEqual('test1\n', template.run());
    assertEqual('test1\n', template.run());
  });
  
  it("should reference variables bound at eval-time", function() {
    var template = new Emjay("test`val`");
    assertEqual('test1', template.run({val: 1}));
  });

  it("should reference and call variables bound at eval-time", function() {
    var template = new Emjay("test`val(1)`");
    assertEqual('test1', template.run({val: function(e) {return e}}));
  });

});


