Doing simple output
[='simple output'-]

Outputting a variable passed into the template.
[=title-]

Or, interacting in pre-processor mode..
[% this.append(this.base.bindings.title).done() %]

Doing output with mixed in method, tag and a function.
[-this.tag('p', {'text-align':'center'}, function() {-] Paragraph text bitches! [- }) -]

Including a partial via async inclusion.
[=this.partial([% this.fileToString('./examples/nodejs/test2.mjs') %], {output: 'i love the world a lot'})-]

Appending to the buffer directly.
[-this.write('<testing>') -]

Appending to the buffer directly without escaping.
[-this.write('<testing>'.makeSafe()) -]

Appending even more directly.
[-this.buffer.push('you are in my buffer') -]

Or, write a function in ... this works too
[- this.buffer.push(function() {return 'this is a string that will get executed later';})-]

Loopin'!
[- for(var i = 0; i != 10; i++) { -]
  This is i .. [=i-]<br>
[- } -]

Capturing ...
[- var captured = this.capture(function() {-][='testing'-][-})-]
[='We captured: '+captured-]

We have for test ...[=this.contentFor('test')-]
But .. lets do it later..
[- this.captureFor('test', 'this is my content for "testing"') -]

We have for test2 ...[=this.contentFor('test2')-]
But .. lets do it later..
[- this.captureFor('test2', function() { -][='this is some more content for "testing"' -][- }) -]


We have for test3 ...[=this.contentFor('test3')-]

Including a partial via async inclusion.
[=this.partial([% this.fileToString('./examples/nodejs/test3.mjs') %], {output: 'i love the world a lot'})-]
