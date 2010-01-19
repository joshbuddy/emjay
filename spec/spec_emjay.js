require('../lib/emjay');

describe("Emjay", function() {

  //it("should interpolate a simple value", function() {
  //  new Emjay.Parser("test[=1-]").generator().run(function(runtime) {
  //    assertEqual(runtime.result(), 'test1');
  //  });
  //});
  //
  it("should interpolate a more complex example using single quotes", function() {
    new Emjay.Parser("test[='test' + 3-]").generator().run(function(runtime) {
      assertEqual(runtime.result(), 'testtest3');
    })
  });
  
  it("should interpolate a more complex example using double quotes", function() {
    new Emjay.Parser("test[=\"test\" + 3-]").generator().run(function(runtime) {
      assertEqual(runtime.result(), 'testtest3');
    })
  });
  
  it("should not interpolate if it starts with -", function() {
    new Emjay.Parser("test[-1+1-]").generator().run(function(runtime) {
      assertEqual(runtime.result(), 'test');
    })
  });
  
  it("should preserve variables declared in it, but not on subsequent runs", function() {
    var parser = new Emjay.Parser("[- try {val += 1} catch(e) {}; val = 1 -]test[=val-][-val += 1-]");
    parser.generator().run(function(runtime) {
      assertEqual('test1', runtime.result());
      puts('done first run ..... \n');
      parser.generator().run(function(runtime) {
        assertEqual('test1', runtime.result());
      });
    });
  });
  
  it("should reference variables bound at eval-time", function() {
    new Emjay.Parser("test[=val-]").generator().run(function(runtime) {
      assertEqual(runtime.result({val:1}), 'test1');
    });
  });
  
  it("should reference and call variables bound at eval-time", function() {
    new Emjay.Parser("test[=val(1)-]").generator().run(function(runtime) {
      assertEqual(runtime.result({val:function(e) {return e}}), 'test1');
    });
  });
  
  it("should be able to loop", function() {
    new Emjay.Parser("[-for (var i = 0; i!= 5; i++) { -][=i-][-}-]").generator().run(function(runtime) {
      assertEqual('01234', runtime.result());
    });
  });
  
  it("should be able to output and accept a function", function() {
    var looper = function(func) {
      __runtime.__buffer +=  'this';
      func(1);
      __runtime.__buffer +=  'that';
    }

    new Emjay.Parser("[- test(function(i) { -][= i -][- }) -]").generator().run(function(runtime) {
      assertEqual('this1that', runtime.result({test: looper}));
    });

  });
  
  it('should support comments', function() {
    new Emjay.Parser("test[- //throw('i hate you') -]").generator().run(function(runtime) {
      assertEqual('test', runtime.result());
    });
  });
  
  it('should support multiline comments', function() {
    new Emjay.Parser("test[- /* -]testing dude[-*/-]").generator().run(function(runtime) {
      assertEqual('test', runtime.result());
    });
  });
  
  it('should escape by default', function() {
    new Emjay.Parser("test[='<test>'-]").generator().run(function(runtime) {
      assertEqual("test&lt;test&gt;", runtime.result());
    });
  });
  
  it('should unescape explicitly', function() {
    new Emjay.Parser("test[=='<test>'-]").generator().run(function(runtime) {
      assertEqual("test<test>", runtime.result());
    });
  });
  

});


