process.mixin(require('sys'));

Emjay = function(input) {
  this.input = input;
};

Emjay.prototype = {
  compile: function() {
    var parts = this.input.split(/(\[(?:-|==?).*?-\])/m);
    var compiled = '';
    for(var index in parts) {
      var part = parts[index];
      // concat
      if (part.substr(0,3) == '[==') {
        compiled += '_emjay.concat(eval(\''+part.substr(3, part.length - 5).replace(/'/g, "\\'").replace('\n','\\n')+'\'), false);\n'
      } else if (part.substr(0,2) == '[=') {
        compiled += '_emjay.concat(eval(\''+part.substr(2, part.length - 4).replace(/'/g, "\\'").replace('\n','\\n')+'\'), true);\n'
      // eval only
      } else if(part.substr(0,2) == '[-') {
        compiled += part.substr(2, part.length - 4)+';\n'
      } else if(part == ''){
      // or, this is easy, just append it!
      } else {
        compiled += '_emjay.concat(\'' + part.replace(/'/g, "\\'").replace('\n','\\n') + '\');\n'
      }
    }
    
    var compiler = this;
    
    this.Compiled = function(compiler) {
      debug('creating new compiled instance\n'+compiled);
      this.compiler = compiler;
      this.compiled = compiled;
    }
    
    this.Compiled.prototype = {
      evaluate: function(binding) {
        this.buffer = '';
        this.binding = binding;
        eval('_emjay = this;\n');
        for (var k in binding) {
          eval('var '+k+' = this.binding["'+k+'"];\n');
        }
        eval(this.compiled);
        return this;
      },
      concat: function(output, escape) {
        debug("concat: "+output);
        if (escape) {
          this.buffer += this.escape(output);
        } else {
          this.buffer += output;
        }
      },
      escape: function(s) {
        return s.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
    }
    debug("COMPILED TEMPLATE!\n" + inspect(compiled));
    return compiler;
  },
  evaluate: function(binding) {
    return new this.Compiled().evaluate(binding).buffer;
  },
  
  run: function(binding) {
    return this.compile(binding).evaluate(binding);
  }
}
