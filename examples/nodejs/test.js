require('../../lib/emjay/node');
var sys = require('sys')

HTMLHelper = {
  SelfClosingTags: ['br', 'img', 'hr'],
  tag: function(name, attrs, func) {
    var buf = "<"+name;
    for(var key in attrs) {
      buf += ' ' + this.htmlEscape(key) + '="'+this.htmlEscape(attrs[key]) + '"'
    }
    if (func) {
      __runtime.append((buf + '>').makeSafe());
      func();
      __runtime.append(('</'+name+'>').makeSafe());
    } else {
      return (buf + '>').makeSafe();
    }
  }
}

new Emjay.NodeJs([HTMLHelper, Emjay.NodeJs.Helpers]).load('./examples/nodejs/test.mjs').run({title: 'test title'}, function(rendered) {
  sys.puts('--------------------------------- RENDERED');
  sys.puts(rendered);
});
