Emjay = {
  Base: function(input, bindings) {
    this.input = input;
    this.bindings = bindings;
  },
  Stage2: function(base, input) {
    this.base = base;
    this.input = input;
  },
  Stage3: function(stage2, input) {
    this.base = stage2.base;
    this.stage2 = stage2;
    this.input = input;
    this.buffer = '';
  },
  SafeString: function(__value__){
    this.length = (this.__value__ = __value__.toString() || "").length;
  }
};

Emjay.Base.prototype = {
  run: function(callback) {
    var parts = this.input.split(/(\[%[\s\S]*?%\])/);
    var output = [];
    for(var index in parts) {
      var part = parts[index];
      //debug("BASE working on "+part);
      if (part == '') {
        //debug("BASE part is empty");
        // empty
      } else if (part.substr(0,2) == '[%') {
        var s = "output.push(function() {" + part.substr(2, part.length - 4) + "});";
        //debug("BASE " + s);
        eval(s);
      } else {
        var s = "output.push(function() { this.write(\"" + this.escape(part) + "\").done() });";
        //debug("BASE " + s);
        eval(s);
      }
    }
    new Emjay.Stage2(this, output).run(callback);
  },
  escape: function(s) {
    return s.replace(/\\/g,'\\\\').replace(/"/g, '\\"').replace(/\[-/, '\\[-').replace(/-\]/, '-\\]');
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
      //debug("STAGE2 finished with\n"+this.buffer);
      new Emjay.Stage3(this, this.buffer).run(this.callback);
    } else {
      this.input[this.position].call(this);
    }
  },
  escape: function(s) {
    return s.replace(/\'/g, '\\\'').replace(/\"/g, '\\"');
  }
};

Emjay.Stage3.prototype = {
  run: function(callback) {
    var parts = this.input.split(/(\[[-=][\s\S]*?-\])/);
    var program = '__runtime = this;\n';
    for(var bindingIndex in this.base.bindings) {
      program += "var " + bindingIndex + " = this.base.bindings['" + bindingIndex + "'];\n";
    }
    
    for(var index in parts) {
      var part = parts[index];
      //debug('STAGE 3 working on part: '+inspect(part));
      if (part == '') {
        // empty
      } else if(part.substr(0, 2) == '[-') {
        program += part.substr(2, part.length - 4) + "\n";
      } else if(part.substr(0, 2) == '[=') {
        program += "__runtime.write(" + part.substr(2, part.length - 4) + ");\n";
      } else {
        program += "__runtime.write('" + this.escape(part) + "'.makeSafe());\n";
      }
    }
    //debug("STAGE 3 program:\n"+program)
    eval(program);
    callback(this.buffer);
  },
  escape: function(s) {
    return s.replace(/\'/g, '\\\'').replace(/\"/g, '\\"');
  },
  escapeHtml: function(s) {
    return s.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
  write: function(s) {
    //debug("STAGE 3 writing "+s);
    this.buffer += (s && s.safe && s.safe() ? s.toString() : this.escapeHtml(s));
    //debug("STAGE 3 done writing "+s);
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

var out = (typeof exports !== "undefined" ? exports : (function () {return this})()); out.Emjay = Emjay;