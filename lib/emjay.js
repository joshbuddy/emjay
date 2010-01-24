process.mixin(GLOBAL, require('sys'))

Emjay = {
  Base: function(input, bindings) {
    this.input = input;
    this.bindings = bindings;
  },
  Stage2: function(base, bindings, input) {
    this.base = base;
    this.input = input;
  },
  Stage3: function(stage2, bindings, input) {
    this.base = stage2 && stage2.base;
    this.stage2 = stage2;
    this.bindings = bindings;
    this.input = input;
    this.buffer = '';
  },
  SafeString: function(__value__){
    this.length = (this.__value__ = __value__.toString() || "").length;
  }
};

Emjay.Base.prototype = {
  execute: function(callback) {
    this.run().run(function(stage3) {
      callback(stage3.run());
    })
  },
  run: function() {
    var parts = this.input.split(/(\[%[\s\S]*?%\])/);
    var output = [];
    for(var index in parts) {
      var part = parts[index];
      debug("BASE working on "+part);
      if (part == '') {
        debug("BASE part is empty");
        // empty
      } else if (part.substr(0,2) == '[%') {
        var s = "output.push(function() { __runtime = this; " + part.substr(2, part.length - 4) + "});";
        debug("BASE " + s);
        eval(s);
      } else {
        var s = "output.push(function() { this.write(\"" + this.escape(part) + "\").done() });";
        debug("BASE " + s);
        eval(s);
      }
    }
    return new Emjay.Stage2(this, this.bindings, output);
  },
  escape: function(s) {
    return s.replace(/\n/g, '\\n').replace(/\\/g,'\\\\').replace(/"/g, '\\"').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
  }
};

Emjay.Stage2.prototype = {
  run: function(callback) {
    this.position = 0;
    this.callback = callback;
    this.buffer = '';
    this.input[this.position].call(this);
  },
  write: function(s) {
    this.buffer += s;
    return this;
  },
  append: function(s) {
    this.write("[='" + this.escape(s) + "'-]");
    return this;
  },
  done: function() {
    this.position += 1;
    if (this.position == this.input.length) {
      debug("STAGE2 finished with\n"+this.buffer);
      this.callback(new Emjay.Stage3(this, this.base.bindings, this.buffer));
    } else {
      this.input[this.position].call(this);
    }
  },
  escape: function(s) {
    return s.replace(/'/g, '\\\'').replace(/"/g, '\\"');
  }
};

Emjay.Stage3.prototype = {
  unprocessed: function() {
    var parts = this.input.split(/(\[[-=][\s\S]*?-\])/);
    this.program = 'var __runtime = this;\n';
    for(var bindingIndex in this.bindings) {
      this.program += "var " + bindingIndex + " = this.bindings['" + bindingIndex + "'];\n";
    }
    
    for(var index in parts) {
      var part = parts[index];
      debug('STAGE 3 working on part: '+inspect(part));
      if (part == '') {
        // empty
      } else if(part.substr(0, 2) == '[-') {
        this.program += part.substr(2, part.length - 4) + "\n";
      } else if(part.substr(0, 2) == '[=') {
        this.program += "__runtime.write(" + part.substr(2, part.length - 4) + ");\n";
      } else {
        this.program += "__runtime.write('" + this.escape(part) + "'.makeSafe());\n";
      }
    }
    debug("STAGE 3 program:\n"+this.program)
    return this.program;
  },
  run: function() {
    eval(this.unprocessed());
    return this.buffer;
  },
  escape: function(s) {
    return s.replace(/\'/g, '\\\'').replace(/\"/g, '\\"').replace(/\n/g,'\\n');
  },
  escapeHtml: function(s) {
    return s.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
  write: function(s) {
    debug("STAGE 3 writing "+inspect(s));
    this.buffer += (s && s.safe && s.safe() ? s.toString() : this.escapeHtml(s));
  },
  process: function(s, bindings) {
    return new Emjay.Stage3(null, bindings, s).run().makeSafe();
  },
  capture: function(func) {
    var oldBuffer = this.buffer;
    this.buffer = '';
    func.call(this);
    var result = this.buffer;
    this.buffer = oldBuffer;
    return result;
  },
  ancestor: function() {
    return this.previousStage3 ? this.previousStage3.ancestor() : this.base;
  },
  captureFor: function(key, stringOrFunc) {
    if (this.ancestor().bindings[key] === undefined) __runtime.__generator.ancestor().bindings[key] = '';
    if (typeof(contentOrFunc) == 'string') {
      __runtime.__generator.ancestor().bindings[key] += contentOrFunc;
    } else {
      __runtime.__generator.ancestor().bindings[key] += this.capture(contentOrFunc);
    }
  },
  contentFor: function(key) {
    ancestor.push(function() {return __runtime.__generator.ancestor().bindings[key];});
  }
};

Emjay.SafeString.prototype = new String;
Emjay.SafeString.prototype.toString = Emjay.SafeString.prototype.valueOf = function(){return this.__value__};
Emjay.SafeString.prototype.safe = function(){return true};
Emjay.SafeString.prototype.makeSafe = function(){return this};

String.prototype.safe = function() {return false};
String.prototype.makeSafe = function() {
  return new Emjay.SafeString(this.valueOf());
}

new Emjay.Base("[=this.contentFor('test')-][- this.captureFor('test', 'out') -]").execute(function(content) {
  puts(content);
});

var out = (typeof exports !== "undefined" ? exports : (function () {return this})()); out.Emjay = Emjay;