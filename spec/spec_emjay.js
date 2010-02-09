require('../lib/emjay');

describe("Emjay", function() {

  it("should interpolate a simple value", function() {
    new Emjay.Base("test[=1-]").parse().run({}, function(content) {
      assertEqual('test1', content);
    });
  });
  
  it("should interpolate a more complex example using single quotes", function() {
    new Emjay.Base("test[='test' + 3-]").parse().run({}, function(content) {
      assertEqual('testtest3', content);
    })
  });
  
  it("should interpolate a more complex example using double quotes", function() {
    new Emjay.Base("test[=\"test\" + 3-]").parse().run({}, function(content) {
      assertEqual('testtest3', content);
    })
  });
  
  it("should not interpolate if it starts with -", function() {
    new Emjay.Base("test[-1+1-]").parse().run({}, function(content) {
      assertEqual(content, 'test');
    })
  });
  
  
  it("should reference variables bound at eval-time", function() {
    new Emjay.Base("test[=val-]").parse().run({val:1}, function(content) {
      assertEqual('test1', content);
    });
  });
  
  it("should reference and call variables bound at eval-time", function() {
    new Emjay.Base("test[=val(1)-]").parse().run({val:function(e) {return e}}, function(content) {
      assertEqual('test1', content);
    });
  });
  
  it("should be able to loop", function() {
    new Emjay.Base("[-for (var i = 0; i!= 5; i++) { -][=i-][-}-]").parse().run({val:1}, function(content) {
      assertEqual('01234', content);
    });
  });
  
  it("should be able to output and accept a function", function() {
    var looper = function(func) {
      this.write('this');
      func.call(this, 1);
      this.write('that');
    }
  
    new Emjay.Base("[- test.call(this, function(i) { -][= i -][- }) -]").parse().run({test:looper}, function(content) {
      assertEqual('this1that', content);
    });
  
  });
  
  it('should support comments', function() {
    new Emjay.Base("test[- //throw('i hate you') -]").parse().run({}, function(content) {
      assertEqual('test', content);
    });
  });
  
  it('should support multiline comments', function() {
    new Emjay.Base("test[- /* -]testing dude[-*/-]").parse().run({}, function(content) {
      assertEqual('test', content);
    });
  });
  
  it('should escape by default', function() {
    new Emjay.Base("test[='<test>'-]").parse().run({}, function(content) {
      assertEqual("test&lt;test&gt;", content);
    });
  });
  
  it('should unescape explicitly', function() {
    new Emjay.Base("test[='<test>'.makeSafe()-]").parse().run({}, function(content) {
      assertEqual("test<test>", content);
    });
  });
  
  it('should unescape explicitly with [==', function() {
    new Emjay.Base("test[=='<test>'-]").parse().run({}, function(content) {
      assertEqual("test<test>", content);
    });
  });
  
  it('unsafe normal content should pass through normally', function() {
    new Emjay.Base("hey 'you' weirdo <p align=\"center\">[='<test>'.makeSafe()-]</p>").parse().run({}, function(content) {
      assertEqual("hey 'you' weirdo <p align=\"center\"><test></p>", content);
    });
  });
  
});


