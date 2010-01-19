require('../../lib/emjay/node');
var sys = require('sys')

HTMLHelper = {
  tag: function(name, attrs) {
    var buf = "<"+name;
    for(var key in attrs) {
      buf += ' ' + this.htmlEscape(key) + '="'+this.htmlEscape(attrs[key]) + '"'
    }
    return (buf + '>').makeSafe();
  }
}

new Emjay.NodeJs([HTMLHelper, Emjay.NodeJs.Helpers]).load('./examples/nodejs/test.mjs').run({title: 'test title'}, function(rendered) {
  sys.puts('--------------------------------- RENDERED');
  sys.puts(rendered);
});
