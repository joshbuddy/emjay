require('../../lib/emjay/node');
var sys = require('sys')

HTMLHelper = {
  SelfClosingTags: ['br', 'img', 'hr'],
  tag: function(name, attrs, func) {
    var buf = "<"+name;
    for(var key in attrs) {
      buf += ' ' + this.escapeHtml(key) + '="'+this.escapeHtml(attrs[key]) + '"'
    }
    if (func) {
      __runtime.write((buf + '>').makeSafe());
      func();
      __runtime.write(('</'+name+'>').makeSafe());
    } else {
      return (buf + '>').makeSafe();
    }
  }
}

new Emjay.NodeJs([HTMLHelper, Emjay.NodeJs.Helpers]).load('./examples/nodejs/test.mjs').run({title: 'test title'}, function(rendered) {
  sys.puts('--------------------------------- RENDERED');
  sys.puts(rendered);
});
