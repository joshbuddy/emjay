require('../lib/emjay');

describe("Emjay", function() {
  it("should interpolate a simple value", function() {
    var template = new Emjay("test=`1`");
    assertEqual('test1', template.run());
  });

  it("should interpolate a more complex example", function() {
    var template = new Emjay("test=`'test' + 3`");
    assertEqual('testtest3', template.run());
  });
  
  it("should not interpolate if it starts with `", function() {
    var template = new Emjay("test`1+1`");
    assertEqual('test', template.run());
  });
  
  it("should not interpolate if it starts with `", function() {
    var template = new Emjay("test`1+1`");
    assertEqual('test', template.run());
  });
  
  it("should preserve variables declared in it, but not on subsequent runs", function() {
    var template = new Emjay("`try {val += 1} catch(e) {}; val = 1`test=`val``val += 1`");
    assertEqual('test1', template.run());
    assertEqual('test1', template.run());
  });
  
  it("should reference variables bound at eval-time", function() {
    var template = new Emjay("test=`val`");
    assertEqual('test1', template.run({val: 1}));
  });
  
  it("should reference and call variables bound at eval-time", function() {
    var template = new Emjay("test=`val(1)`");
    assertEqual('test1', template.run({val: function(e) {return e}}));
  });

  it("should be able to loop", function() {
    var template = new Emjay("`for (var i = 0; i!= 5; i++) { `=`i``}`");
    assertEqual('01234', template.run());
  });

  it("should be able to output and loop", function() {

    var looper = function(runner) {
      _emjay.concat('this');
      runner(1);
      _emjay.concat('that');
    }
    
    var template = new Emjay("`test(function(i) {`=`i``})`");
    assertEqual('this1that', template.run({test: looper}));
  });

});


