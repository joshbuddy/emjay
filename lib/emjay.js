Emjay = {
  Parser: function(input) {
    this.input = input;
  },
  Generator: function(parser, bindings, previousGenerator) {
    this.parser = parser;
    this.compiled = parser.compiled;
    this.buffer = '';
    this.position = 0;
    this.bindings = bindings;
    this.content_holder = {};
    this.previousGenerator;
  },
  Runtime: function(generator, program, bindings) {
    this.__generator = generator;
    this.__program = program;
    this.__bindings = bindings;
  },
  SafeString: function(__value__){
    this.length = (this.__value__ = __value__.toString() || "").length;
  }
};

Emjay.Parser.prototype = {
  parse: function() {
    this.compiled = [];
    var parts = this.input.split(/(\n*)(\[(?:-|==?)[\s\S]*?-\])(\n*)/);
    var processedTagLast = true;
    for(var index in parts) {
      var part = parts[index];
      if (part.substr(0,3) == '[==') {
        processedTagLast = true;
        eval("this.compiled.push(function(__result_from_arg){ __result = __result_from_arg;__bindings = this.bindings;\n" + part.substr(3, part.length - 5) + "});");
      } else if (part.substr(0,2) == '[=') {
        processedTagLast = true;
        eval("this.compiled.push(function(result){ result.write('__runtime.append(" + part.substr(2, part.length - 4).toJSON().replace(/'/g, "\\\'") + ");\\n').done();});");
      } else if(part.substr(0,2) == '[-') {
        processedTagLast = true;
        eval("this.compiled.push(function(result){ result.write('" + part.substr(2, part.length - 4).toJSON().replace(/'/g, "\\\'") + ";\\n').done();});");
      } else if(part == '') {
      // or, this is easy, just append it!
      } else if(part.match(/^\s$/) && processedTagLast) {
      // or, this is easy, just append it!
      } else {
        processedTagLast = false;
        eval("this.compiled.push(function(result){ result.write('__runtime.__buffer.push(\"" + part.toJSON().replace(/\n/g, '\\\\n').replace(/'/g, "\\\'").replace(/"/g, "\\\\\"") + "\");\\n').done();});");
      }
    }
    return this;
  },
  generator: function(bindings) {
    return new Emjay.Generator(this, bindings);
  },
};

Emjay.Generator.prototype = {
  run: function(success) {
    this.success = success;
    this.compiled[this.position].call(this, this);
  },
  write: function(output) {
    this.buffer += output;
    return this;
  },
  append: function(output) {
    if (this.isArray(output)) {
      for(var i in output) {
        this.append(output[i]);
      }
    } else {
      this.write("__runtime.__buffer.push('");
      this.write(output.toString().toJSON().replace(/'/g, "\\\'").replace(/\n/g, '\\n'));
      if (output && output.safe && output.safe()) {
        this.write("'.makeSafe();\n");
      } else {
        this.write("');\n");
      }
    }
    return this;
  },
  done: function() {
    this.position++;
    if (this.position == this.compiled.length) {
      this.success(new Emjay.Runtime(this, this.buffer, this.bindings));
    } else {
      this.compiled[this.position].call(this, this);
    }
  },
  isArray: function(test) {
    return typeof(test) == 'object' && typeof(test.safe) == 'undefined' && typeof(test.length) == 'number';
  },
  ancestor: function() {
    return this.oldestGenerator ? this.oldestGenerator.ancestor() : this;
  }
};

Emjay.Runtime.prototype = {
  htmlEscape: function(s) {
    return s.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
  append: function(s) {
    if (s === undefined) return;
    if (this.__generator.isArray(s)) {
      for (var i in s) {
        this.append(s[i]);
      }
    } else {
      this.__buffer.push(s && s.safe && s.safe() ? s.toString() : this.htmlEscape(s));
    }
  },
  capture: function(content_or_func) {
    var oldBuffer = __runtime.__buffer;
    var tempBuffer = [];
    __runtime.__buffer = tempBuffer;
    __buffer = tempBuffer;
    content_or_func();
    var result = __runtime.bufferToString(tempBuffer);
    __runtime.__buffer = oldBuffer;
    __buffer = oldBuffer;
    return result;
  },
  result: function() {
    this.__buffer = [];
    __runtime = this;
    if (this.__bindings !== undefined) {
      for(var i in this.__bindings) {
        eval("var " + i + " = __runtime.__bindings['" + i.toJSON() + "'];\n");
      }
    }
    eval(__runtime.__program);
    return this.bufferToString(__runtime.__buffer)
  },
  bufferToString: function(buffer) {
    var finalBuffer = '';
    for(var bufferIndex in buffer) {
      var sys = require('sys');
      if (typeof(buffer[bufferIndex]) == 'function') {
        finalBuffer += buffer[bufferIndex](__runtime);
      } else {
        finalBuffer += buffer[bufferIndex].toString();
      }
    }
    return finalBuffer;
  },
  contentFor: function(key) {
    __runtime.__buffer.push(function() {return __runtime.__generator.ancestor().bindings[key];});
  },
  captureFor: function(key, contentOrFunc) {
    if (__runtime.__generator.ancestor().bindings[key] === undefined) __runtime.__generator.ancestor().bindings[key] = '';
    if (typeof(contentOrFunc) == 'string') {
      __runtime.__generator.ancestor().bindings[key] += contentOrFunc;
    } else {
      __runtime.__generator.ancestor().bindings[key] += this.capture(contentOrFunc);
    }
  }
  
}

Emjay.SafeString.prototype = new String;
Emjay.SafeString.prototype.toString = Emjay.SafeString.prototype.valueOf = function(){return this.__value__};
Emjay.SafeString.prototype.safe = function(){return true};
Emjay.SafeString.prototype.makeSafe = function(){return this};

String.prototype.safe = function() {return false};
String.prototype.makeSafe = function() {
  return new Emjay.SafeString(this.valueOf());
}

var out = (typeof exports !== "undefined" ? exports : (function () {return this})()); out.Emjay = Emjay;