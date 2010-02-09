var events = require('events')

Emjay = {
  Base: function(input, bindings) {
    this.input = input;
    this.bindings = bindings;
    this.contentCaptures = {};
    this.root = this;
  },
  Runner: function(base) {
    this.base = base;
  },
  SafeString: function(__value__){
    this.length = (this.__value__ = __value__.toString() || "").length;
  }
};

Emjay.Base.prototype = {
  parse: function() {
    var parts = this.input.split(/(\[(?==?|-).+?-\])/);
    var processed = [];
    var partsLength = parts.length;
    for (var i = 0; i != partsLength; i++) {
      var part = parts[i];
      if (part == '') {
        // do nothing
      } else if (part.substr(0, 2) == '[-') {
        processed += (part.substr(2, part.length - 4)+";\n");
      } else if (part.substr(0, 3) == '[==') {
        processed += ("this.unescapedWrite((" + part.substr(3, part.length - 5) + "));\n");
      } else if (part.substr(0, 2) == '[=') {
        processed += ("this.write((" + part.substr(2, part.length - 4) + "));\n");
      } else {
        processed += ("this.unescapedWrite(\"" + part.replace(/\n/g, '\\n').replace(/"/g, '\\"') + "\");\n");
      }
    }
    this.processed = processed;
    return new Emjay.Runner(this);
  }
};

Emjay.Runner.prototype = {
  bindingsHeader: function(bindings) {
    var prog = '';
    for (var i in bindings) {
      prog += "var " + i + " = this.bindings['" + i + "'];\n";
    }
    return prog;
  },
  run: function(bindings, callback) {
    this.bindings = bindings;
    this.callback = callback;
    this.output = [];
    eval(this.bindingsHeader(bindings) + this.base.processed);
    this.processOutput(0);
  },
  processOutput: function(index) {
    if (index == this.output.length) {
      this.callback(this.output.join(''));
    } else if (typeof(this.output[index]) == 'string' || this.output[index].safe) {
      this.output[index] = this.output[index].toString();
      this.processOutput(index + 1);
    } else {
      var runner = this;
      this.output[index].addCallback(function(result) {
        runner.output[index] = result;
        runner.processOutput(index + 1);
      });
    }
  },
  escape: function(s) {
    return s.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
  write: function(string) {
    if (typeof(string) == 'string') {
      this.output.push(this.escape(string));
    } else {
      this.output.push(string.toString());
    }
  },
  unescapedWrite: function(string) {
    this.output.push(string);
  },
  partial: function(file, bindings) {
    var promise = new events.Promise();
    var posix = require('posix');
    posix.cat(file).addCallback(function(content) {
      new Emjay.Base(content).parse().run(bindings, function(output) {
        promise.emitSuccess(output);
      });
    });
    return promise;
  }
};

Emjay.SafeString.prototype = new String;
Emjay.SafeString.prototype.toString = Emjay.SafeString.prototype.valueOf = function(){return this.__value__};
Emjay.SafeString.prototype.safe = function(){return true};
Emjay.SafeString.prototype.makeSafe = function(){return this};
//Emjay.SafeString.prototype.toString = function() {return this};

String.prototype.safe = function() {return false};
String.prototype.makeSafe = function() {
  return new Emjay.SafeString(this.valueOf());
}
var out = (typeof exports !== "undefined" ? exports : (function () {return this})()); out.Emjay = Emjay;