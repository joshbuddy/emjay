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
      this.write((buf + '>').makeSafe());
      func();
      this.write(('</'+name+'>').makeSafe());
    } else {
      return (buf + '>').makeSafe();
    }
  }
}

var sys = require("sys"),
    http = require("http");
http.createServer(function (request, response) {
  var emjay = new Emjay.NodeJs([HTMLHelper, Emjay.NodeJs.Helpers]);
  emjay.load('./examples/nodejs/test.mjs').run({title: 'test title'}, function(rendered) {
    response.sendHeader(200, {"Content-Type": "text/plain"});
    response.sendBody(rendered);
    response.finish();
  });
}).listen(8000);
sys.puts("Server running at http://127.0.0.1:8000/");

//
//
//new Emjay.NodeJs([HTMLHelper, Emjay.NodeJs.Helpers]).load('./examples/nodejs/test.mjs').run({title: 'test title'}, function(rendered) {
//  sys.puts('--------------------------------- RENDERED');
//  sys.puts(rendered);
//  sys.puts('\n--------------------------------- RENDERED');
//});
//