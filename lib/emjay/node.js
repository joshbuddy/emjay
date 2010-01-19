// require emjay
require(__filename.replace(/\/node\.js$/, ''));

Emjay.NodeJs = function(mixins) {
  this.mixins = mixins;
};

Emjay.NodeJs.Instance = function(factory, file) {
  this.factory = factory;
  this.file = file;
};

Emjay.NodeJs.prototype = {
  load: function(file) {
    return new Emjay.NodeJs.Instance(this, file);
  }
};

Emjay.NodeJs.Instance.prototype = {
  run: function(binding, callback) {
    var posix = require('posix');
    var sys = require('sys')
    var instance = this;
    posix.cat(instance.file).addCallback(function (content) {
      var parser = new Emjay.Parser(content);
      parser.parse();
      var generator = parser.generator();
      generator.__factory = instance.factory;
      for(var mixinIndex in instance.factory.mixins) process.mixin(generator, instance.factory.mixins[mixinIndex]);
      generator.run(function(runtime) {
        for(var mixinIndex in instance.factory.mixins) process.mixin(runtime, instance.factory.mixins[mixinIndex]);
        callback(runtime.result(binding));
      });
    });    
  }
};

Emjay.NodeJs.Helpers = {
  partial: function(file, bindings) {
    new Emjay.NodeJs.Instance(__result.__factory, file).run(bindings, function(rendered) {
      __result.append(rendered).done();
    });
  }
};