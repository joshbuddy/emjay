// require emjay
require(__filename.replace(/\/node\.js$/, ''));

Emjay.NodeJs = function(mixins) {
  this.mixins = mixins;
  this.cache = {};
};

Emjay.NodeJs.Instance = function(factory, file) {
  this.factory = factory;
  this.file = file;
};

Emjay.NodeJs.prototype = {
  load: function(file, mixins) {
    return new Emjay.NodeJs.Instance(this, file);
  }
};

Emjay.NodeJs.Instance.prototype = {
  loadFile: function(file, callback) {
    var instance = this;
    var posix = require('posix');
    if (this.factory.cache[file]) {
      callback(this.factory.cache[file]);
    } else {
      posix.cat(file).addCallback(function(content) {
        instance.factory.cache[file] = content;
        callback(content);
      });
    }
  },
  runWithMethod: function(bindings, callback, method) {
    var sys = require('sys');
    
    var instance = this;
    instance.loadFile(instance.file, function(content) {
      var base = new Emjay.Base(content, bindings);
      instance.root = base;
      base.root = base;
      base.instance = instance;
      var stage2 = base.run();
      for(var mixinIndex in instance.factory.mixins) process.mixin(stage2, instance.factory.mixins[mixinIndex]);
      stage2.run(function(stage3) {
        for(var mixinIndex in instance.factory.mixins) process.mixin(stage3, instance.factory.mixins[mixinIndex]);
        callback(stage3[method]());
      });
    });    
  },
  unprocessedResult: function(bindings, callback) {
    this.runWithMethod(bindings, callback, 'unprocessedResult');
  },
  run: function(bindings, callback) {
    this.runWithMethod(bindings, callback, 'run');
  }
};

Emjay.NodeJs.Helpers = {
  fileToString: function(file) {
    var posix = require('posix');
    var originalRuntime = this;
    originalRuntime.base.instance.loadFile(file, function (content) {
      var base = new Emjay.Base(content);
      base.root = originalRuntime.base;
      base.instance = originalRuntime.base.instance;
      var stage2 = base.run();
      var mixins = originalRuntime.base.root.instance.factory.mixins;
      for(var mixinIndex in mixins) process.mixin(stage2, mixins[mixinIndex]);
      stage2.run(function(executedContent) {
        var safeContent = executedContent.input.replace(/\n/g, '\n').replace(/'/g,"\\'").replace(/\[-/g,'\\[-').replace(/-\]/g,'-\\]');
        originalRuntime.write("'"+safeContent+"'");
        originalRuntime.done();
      });
    });
  },
  partial: function(string, bindings) {
    var sys = require('sys');
    var stage3 = new Emjay.Stage3(this.stage2, bindings, string);
    stage3.base = this.stage2.base;
    var mixins = this.base.root.instance.factory.mixins;
    for(var mixinIndex in mixins) process.mixin(stage3, mixins[mixinIndex]);
    var content = stage3.unprocessed();
    for (var contentIndex in content) {
      this.write(content[contentIndex]);
    }
    return '';
  }
};

var out = (typeof exports !== "undefined" ? exports : (function () {return this})()); out.Emjay = Emjay;