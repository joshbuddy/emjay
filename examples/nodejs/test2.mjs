this is from another file...:
[=output-]
[=this.tag('br')-]

Including a partial via async inclusion.
[=this.partial([% this.fileToString('./examples/nodejs/test/test.mjs') %], {output: 'i love the world a lot'})-]
