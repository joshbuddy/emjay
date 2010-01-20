require('../lib/emjay');

describe("Emjay", function() {

  it("should interpolate a simple value", function() {
    new Emjay.Parser("test[=1-]").parse().generator().run(function(runtime) {
      assertEqual(runtime.result(), 'test1');
    });
  });
  
  it("should interpolate a more complex example using single quotes", function() {
    new Emjay.Parser("test[='test' + 3-]").parse().generator().run(function(runtime) {
      assertEqual(runtime.result(), 'testtest3');
    })
  });
  
  it("should interpolate a more complex example using double quotes", function() {
    new Emjay.Parser("test[=\"test\" + 3-]").parse().generator().run(function(runtime) {
      assertEqual(runtime.result(), 'testtest3');
    })
  });
  
  it("should not interpolate if it starts with -", function() {
    new Emjay.Parser("test[-1+1-]").parse().generator().run(function(runtime) {
      assertEqual(runtime.result(), 'test');
    })
  });
  
  it("should preserve variables declared in it, but not on subsequent runs", function() {
    var parser = new Emjay.Parser("[- try {val += 1} catch(e) {}; val = 1 -]test[=val-][-val += 1-]");
    parser.parse().generator().run(function(runtime) {
      assertEqual('test1', runtime.result());
      parser.parse().generator().run(function(runtime) {
        assertEqual('test1', runtime.result());
      });
    });
  });
  
  it("should reference variables bound at eval-time", function() {
    new Emjay.Parser("test[=val-]").parse().generator({val:1}).run(function(runtime) {
      assertEqual(runtime.result(), 'test1');
    });
  });
  
  it("should reference and call variables bound at eval-time", function() {
    new Emjay.Parser("test[=val(1)-]").parse().generator({val:function(e) {return e}}).run(function(runtime) {
      assertEqual(runtime.result(), 'test1');
    });
  });
  
  it("should be able to loop", function() {
    new Emjay.Parser("[-for (var i = 0; i!= 5; i++) { -][=i-][-}-]").parse().generator().run(function(runtime) {
      assertEqual('01234', runtime.result());
    });
  });
  
  it("should be able to output and accept a function", function() {
    var looper = function(func) {
      __runtime.__buffer.push('this');
      func(1);
      __runtime.__buffer.push('that');
    }

    new Emjay.Parser("[- test(function(i) { -][= i -][- }) -]").parse().generator({test: looper}).run(function(runtime) {
      assertEqual('this1that', runtime.result());
    });

  });
  
  it('should support comments', function() {
    new Emjay.Parser("test[- //throw('i hate you') -]").parse().generator().run(function(runtime) {
      assertEqual('test', runtime.result());
    });
  });
  
  it('should support multiline comments', function() {
    new Emjay.Parser("test[- /* -]testing dude[-*/-]").parse().generator().run(function(runtime) {
      assertEqual('test', runtime.result());
    });
  });
  
  it('should escape by default', function() {
    new Emjay.Parser("test[='<test>'-]").parse().generator().run(function(runtime) {
      assertEqual("test&lt;test&gt;", runtime.result());
    });
  });
  
  it('should unescape explicitly', function() {
    new Emjay.Parser("test[='<test>'.makeSafe()-]").parse().generator().run(function(runtime) {
      assertEqual("test<test>", runtime.result());
    });
  });
  
  //it('should be able to ', function() {
  //  new Emjay.Parser("test[='<test>'.makeSafe()-]").parse().generator().run(function(runtime) {
  //    assertEqual("test<test>", runtime.result());
  //  });
  //});

});


