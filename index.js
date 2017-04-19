(function() {
  require('child_process').fork('sv.node.js', ['sv.test.json']);

}).call(this);
