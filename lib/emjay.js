process.mixin(require('sys'));

Emjay = {
  Parser: function(input) {
    this.input = input;
    this.compiled = [];
    this.init();
  },
  Generator: function(parser) {
    this.parser = parser;
    this.compiled = parser.compiled;
    this.buffer = '';
    this.position = 0;
    
  },
  Runtime: function(program) {
    this.program = program;
  }
};

Emjay.Parser.prototype = {
  init: function() {
    var parts = this.input.split(/(\[(?:-|==?)[\s\S]*?-\])/);
    for(var index in parts) {
      var part = parts[index];
      puts(index+" -> working on part: "+inspect(part));
      if (part.substr(0,3) == '[==') {
        var p = "this.compiled.push(function(__result_from_arg){ __result = __result_from_arg;\n" + part.substr(3, part.length - 5) + "});";
        puts(p)
        eval(p);
      } else if (part.substr(0,2) == '[=') {
        var p = "this.compiled.push(function(result){ result.write('__runtime.__buffer += __runtime.htmlEscape(" + part.substr(2, part.length - 4).toJSON().replace(/'/g, "\\\'") + ");\\n').done();});";
        puts(p)
        eval(p);
      } else if(part.substr(0,2) == '[-') {
        var p = "this.compiled.push(function(result){ result.write('" + part.substr(2, part.length - 4).toJSON().replace(/'/g, "\\\'") + ";\\n').done();});";
        puts(p)
        eval(p);
      } else if(part == '') {
      // or, this is easy, just append it!
      } else {
        eval("this.compiled.push(function(result){ result.write('__runtime.__buffer += \"" + part.toJSON().replace(/\n/g, '\\\\n') + "\";\\n').done();});");
      }
    }
    puts('done compiling');
  },
  generator: function() {
    return new Emjay.Generator(this);
  },
};

Emjay.Generator.prototype = {
  run: function(success) {
    puts('running -> '+this.position + " -->\n"+inspect(this.compiled[this.position]));
    this.success = success;
    this.compiled[this.position](this);
  },
  write: function(output) {
    puts('writing!' + output);
    this.buffer += output;
    return this;
  },
  append: function(output) {
    this.write("__runtime.__buffer += __runtime.htmlEscape('" + output.toString().toJSON().replace(/'/g, "\\\'").replace(/\n/g, '\\n') + "');\n");
    return this;
  },
  rawAppend: function(output) {
    this.write("__runtime.__buffer += '" + output.toString().toJSON().replace(/'/g, "\\\'").replace(/\n/g, '\\n') + "';\n");
    return this;
  },
  done: function() {
    puts("working on position "+this.position);
    this.position += 1;
    if (this.position == this.compiled.length) {
      this.success(new Emjay.Runtime(this.buffer));
    } else {
      puts("calling into "+this.position+" of "+this.compiled.length);
      this.compiled[this.position](this);
    }
  },
};

Emjay.Runtime.prototype = {
  htmlEscape: function(s) {
    return s.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
  result: function(__bindings) {
    puts("running\n"+this.program)
    this.__buffer = '';
    __runtime = this;

    if (__bindings !== undefined) {
      puts('loading bindings..');
      for(var i in __bindings) {
        puts("var " + i + " = __bindings['" + i.toJSON() + "'];\n")
        eval("var " + i + " = __bindings['" + i.toJSON() + "'];\n");
      }
    }
    eval(__runtime.program);
    return this.__buffer;
  }
}

//var base = new Emjay.Parser('[-3+"test"-][-3+"test"-]');
//base.generator().run(function(runtime) {
//  puts("RESULT:" + runtime.result());
//});

//var base = new Emjay.Parser('testing[="1"-]test[=2-]');
//base.generator().run(function(runtime) {
//  puts("RESULT:" + runtime.result({}));
//});
//
//var base = new Emjay.Parser('testing[=val-]test[=2-]');
//base.generator().run(function(runtime) {
//  puts("RESULT:" + runtime.result({val:1}));
//});

//.instance({}, function(buf) {puts("buf:"+buf)}).run();



Emjay.NodeJs = function(file) {
  this.file = file;
};


Emjay.NodeJs.prototype = {
  run: function(binding, beforeCallback, callback) {
    puts("BINDING ---> "+inspect(binding));
    var posix = require('posix');
    posix.cat(this.file).addCallback(function (content) {
      var base = new Emjay.Parser(content);
      base.generator().run(function(runtime) {
        beforeCallback(runtime);
        callback(runtime.result(binding));
      });
    });    
  }
}

Emjay.NodeJs.partial = function(file, bindings) {
  new Emjay.NodeJs('./test2.mjs').run(bindings, function(emjay){}, function(rendered) {
    __result.append(rendered).done();
  });
}

//new Emjay.Base('testing[="1"-]test').instance({}, function(buf) {puts("buf:"+buf)}).run();