<html>
<head>
<title>[=title-]</title>
[=this.tag('test', {attr:'value'})-]
[== this.partial('./examples/nodejs/test2.mjs', {output: 'i love the world a lot'})-]
[- this.__buffer += 'testing' -]
</head>
<body>
</body>
</html>