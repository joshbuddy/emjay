require('../lib/emjay');

describe("Emjay", function() {

  it("should interpolate a simple value", function() {
    new Emjay.Base("test[=1-]").execute(function(content) {
      assertEqual('test1', content);
    });
  });
  
  it("should interpolate a more complex example using single quotes", function() {
    new Emjay.Base("test[='test' + 3-]").execute(function(content) {
      assertEqual('testtest3', content);
    })
  });
  
  it("should interpolate a more complex example using double quotes", function() {
    new Emjay.Base("test[=\"test\" + 3-]").execute(function(content) {
      assertEqual('testtest3', content);
    })
  });
  
  it("should not interpolate if it starts with -", function() {
    new Emjay.Base("test[-1+1-]").execute(function(content) {
      assertEqual(content, 'test');
    })
  });
  
  it("should preserve variables declared in it, but not on subsequent runs", function() {
    new Emjay.Base("[- try {val += 1} catch(e) {}; val = 1 -]test[=val-][-val += 1-]").execute(function(content) {
      assertEqual('test1', content);
      new Emjay.Base("[- try {val += 1} catch(e) {}; val = 1 -]test[=val-][-val += 1-]").execute(function(content) {
        assertEqual('test1', content);
      });
    });
  });
  
  it("should reference variables bound at eval-time", function() {
    new Emjay.Base("test[=val-]", {val:1}).execute(function(content) {
      assertEqual('test1', content);
    });
  });
  
  it("should reference and call variables bound at eval-time", function() {
    new Emjay.Base("test[=val(1)-]", {val:function(e) {return e}}).execute(function(content) {
      assertEqual('test1', content);
    });
  });
  
  it("should be able to loop", function() {
    new Emjay.Base("[-for (var i = 0; i!= 5; i++) { -][=i-][-}-]").execute(function(content) {
      assertEqual('01234', content);
    });
  });
  
  it("should be able to output and accept a function", function() {
    var looper = function(func) {
      this.write('this');
      func(1);
      this.write('that');
    }
  
    new Emjay.Base("[- test.call(this, function(i) { -][= i -][- }) -]", {test: looper}).execute(function(content) {
      assertEqual('this1that', content);
    });
  
  });
  
  it('should support comments', function() {
    new Emjay.Base("test[- //throw('i hate you') -]").execute(function(content) {
      assertEqual('test', content);
    });
  });
  
  it('should support multiline comments', function() {
    new Emjay.Base("test[- /* -]testing dude[-*/-]").execute(function(content) {
      assertEqual('test', content);
    });
  });
  
  it('should escape by default', function() {
    new Emjay.Base("test[='<test>'-]").execute(function(content) {
      assertEqual("test&lt;test&gt;", content);
    });
  });
  
  it('should unescape explicitly', function() {
    new Emjay.Base("test[='<test>'.makeSafe()-]").execute(function(content) {
      assertEqual("test<test>", content);
    });
  });
  
  it('unsafe normal content should pass through normally', function() {
    new Emjay.Base("hey 'you' weirdo <p align=\"center\">[='<test>'.makeSafe()-]</p>").execute(function(content) {
      assertEqual("hey 'you' weirdo <p align=\"center\"><test></p>", content);
    });
  });
  
});


