process.mixin(GLOBAL, require('sys'))

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
  runWithMethod: function(bindings, callback, previousStage3, method) {
    var posix = require('posix');
    var sys = require('sys')
    var instance = this;
    posix.cat(instance.file).addCallback(function(content) {
      var base = new Emjay.Base(content, bindings);
      var stage2 = base.run();
      for(var mixinIndex in instance.factory.mixins) process.mixin(stage2, instance.factory.mixins[mixinIndex]);
      stage2.run(function(stage3) {
        puts("stage3: "+stage3);
        stage3.previousStage3 = previousStage3;
        for(var mixinIndex in instance.factory.mixins) process.mixin(stage3, instance.factory.mixins[mixinIndex]);
        callback(stage3[method]());
      });
    });    
  },
  unprocessedResult: function(bindings, callback, previousStage3) {
    this.runWithMethod(bindings, callback, previousStage3, 'unprocessedResult');
  },
  run: function(bindings, callback, previousStage3) {
    this.runWithMethod(bindings, callback, previousStage3, 'run');
  }
};

Emjay.NodeJs.Helpers = {
  fileToString: function(file) {
    var posix = require('posix');
    var sys = require('sys');
    sys.debug("--LOADING "+file);
    var originalRuntime = __runtime;
    posix.cat(file).addCallback(function (content) {
      sys.puts("--LOADED "+content)
      new Emjay.Base(content).run().run(function(executedContent) {
        sys.puts("--EXECED "+executedContent.input)
        var safeContent = executedContent.input.replace(/'/g,"\\'").replace(/\[-/g,'\\[-').replace(/-\]/g,'-\\]').replace(/\n/g,'\\n');
        originalRuntime.write("'"+safeContent+"'");
        originalRuntime.done();
      });
    });
  },
  partial: function(string, bindings) {
    var stage3 = new Emjay.Stage3(this.stage2, bindings, string);
    stage3.previousStage3 = this;
    var mixins = [HTMLHelper, Emjay.NodeJs.Helpers];
    for(var mixinIndex in mixins) process.mixin(stage3, mixins[mixinIndex]);
    return stage3.run().makeSafe();
  }
};

var out = (typeof exports !== "undefined" ? exports : (function () {return this})()); out.Emjay = Emjay;