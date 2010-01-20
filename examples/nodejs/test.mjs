Doing simple output
[='simple output'-]

Outputting a variable passed into the template.
[=title-]

Or, interacting in async mode..
[==__result.append(__bindings.title).done()-]

Doing output with mixed in method, tag.
[=this.tag('test', {attr:'value'})-]

Including a partial via async inclusion.
[== this.partial('./examples/nodejs/test2.mjs', {output: 'i love the world a lot'})-]

Appending to the buffer directly.
[- this.append('<testing>') -]

Appending to the buffer directly without escaping.
[- this.append('<testing>'.makeSafe()) -]

Appending even more directly.
[- this.__buffer += 'you are in my buffer' -]

How many characters in the buffer?
[=this.__buffer.length-]

Loopin'!
[- for(var i =0; i != 10; i++) { -]
  This is i .. [=i-]<br>
[- } -]