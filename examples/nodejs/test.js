require('../../lib/emjay');
process.mixin(this, 'sys');

HTMLHelper = {
  tag: function(name, attrs) {
    var buf = "<"+name;
    for(var key in attrs) {
      buf += ' ' + this.htmlEscape(key) + '="'+this.htmlEscape(attrs[key]) + '"'
    }
    return (buf + '>').makeSafe();
  }
}

var template = new Emjay.NodeJs('./examples/nodejs/test.mjs').run({title: 'test title'}, function(rendered) {
  puts('--------------------------------- RENDERED');
  puts(rendered);
});
