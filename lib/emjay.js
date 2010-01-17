process.mixin(require('sys'));

Emjay = function(input) {
  this.input = input;
};

Emjay.prototype = {
  compile: function() {
    var parts = this.input.split(/(\=?`[^`]+`)/m);
    var compiled = '';
    
    for(var index in parts) {
      var part = parts[index];
      // concat
      if (part.substr(0,2) == '=`') {
        compiled += 'this.concat(eval(\''+part.substr(2, part.length - 3).replace(/'/g, "\\'").replace('\n','\\n')+'\'));\n'
      // eval only
      } else if(part.substr(0,1) == '`') {
        compiled += part.substr(1, part.length - 2)+';\n'
      } else if(part == ''){
      // or, this is easy, just append it!
      } else {
        compiled += 'this.concat(\'' + part.replace(/'/g, "\\'").replace('\n','\\n') + '\');\n'
      }
    }
    
    var me = this;
    
    this.Compiled = function() {
      debug('creating new compiled instance\n'+compiled);
      this.compiled = compiled;
    }
    
    this.Compiled.prototype = {
      evaluate: function(binding) {
        this.buffer = '';
        this.binding = binding;
        for (var k in binding) {
          eval('var '+k+' = this.binding["'+k+'"];\n');
        }
        eval(this.compiled);
        return this;
      },
      concat: function(output) {
        debug("concat: "+output);
        this.buffer += output;
      }
    }
    debug(this.Compiled);
    return me;
  },
  
  evaluate: function(binding) {
    return new this.Compiled().evaluate(binding).buffer;
  },
  
  run: function(binding) {
    return this.compile(binding).evaluate(binding);
  }
}
