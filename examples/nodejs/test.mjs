Doing simple output
[='simple output'-]

Outputting a variable passed into the template.
[=title-]

Or, interacting in async mode..
[% this.append(this.base.bindings.title).done() %]

Doing output with mixed in method, tag.
[=this.tag('test', {attr:'value'})-]

Doing output with mixed in method, tag and a function.
[-this.tag('p', {'text-align':'center'}, function() {-] Paragraph text bitches! [- }) -]

Including a partial via async inclusion.
[=this.partial([% this.fileToString('./examples/nodejs/test2.mjs') %], {output: 'i love the world a lot'})-]

Appending to the buffer directly.
[-// this.append('<testing>') -]

Appending to the buffer directly without escaping.
[-// this.append('<testing>'.makeSafe()) -]

Appending even more directly.
[-// this.__buffer.push('you are in my buffer') -]

Or, write a function in ... this works too
[-// this.__buffer.push(function() {return 'this is a string that will get executed later';})-]

Loopin'!
[- for(var i = 0; i != 10; i++) { -]
  This is i .. [=i-]<br>
[- } -]

Capturing ...
[- var captured = this.capture(function() {-][='testing'-][-})-]
[='We captured: '+captured-]

We have for test ...[=this.contentFor('test')-]
But .. lets do it later..
[- this.captureFor('test', function() { -]
  This is some content for "testing"
[- }) -]
