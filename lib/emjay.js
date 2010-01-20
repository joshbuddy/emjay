Emjay = {
  Parser: function(input) {
    this.input = input;
  },
  Generator: function(parser, bindings) {
    this.parser = parser;
    this.compiled = parser.compiled;
    this.buffer = '';
    this.position = 0;
    this.bindings = bindings;
  },
  Runtime: function(program, bindings) {
    this.program = program;
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
        eval("this.compiled.push(function(result){ result.write('__runtime.__buffer += \"" + part.toJSON().replace(/\n/g, '\\\\n').replace(/'/g, "\\\'") + "\";\\n').done();});");
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
    this.write("__runtime.__buffer += '" + output.toString().toJSON().replace(/'/g, "\\\'").replace(/\n/g, '\\n') + "';\n");
    return this;
  },
  appendRaw: function(output) {
    this.write("__runtime.__buffer += '" + output.toString().toJSON().replace(/'/g, "\\\'").replace(/\n/g, '\\n') + "'.makeSafe();\n");
    return this;
  },
  done: function() {
    this.position += 1;
    if (this.position == this.compiled.length) {
      this.success(new Emjay.Runtime(this.buffer, this.bindings));
    } else {
      this.compiled[this.position].call(this, this);
    }
  },
};

Emjay.Runtime.prototype = {
  htmlEscape: function(s) {
    return s.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
  append: function(s) {
    this.__buffer += (s && s['safe'] && s.safe() ? s : this.htmlEscape(s));
  },
  result: function() {
    this.__buffer = '';
    __runtime = this;

    if (this.__bindings !== undefined) {
      for(var i in this.__bindings) {
        eval("var " + i + " = __runtime.__bindings['" + i.toJSON() + "'];\n");
      }
    }
    eval(__runtime.program);
    return this.__buffer;
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