(function() {
  var app_path, dev_mode, param, params, root, rq, test_mode;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  dev_mode = false;

  test_mode = true;

  app_path = './';

  rq = require('request');

  param = function(req, $name) {
    return req.query[$name] || req.body[$name];
  };

  params = function(req, $names) {
    var $name, $p, $v, _i, _len;
    $p = {};
    for (_i = 0, _len = $names.length; _i < _len; _i++) {
      $name = $names[_i];
      $v = req.query[$name] || req.body[$name];
      if ($v) {
        $p[$name] = $v;
      }
    }
    return $p;
  };

  root.c = function(router) {
    var api;
    api = {
      rest: function(req, res, get_nx) {
        var $data, $method, $nx, $url;
        $method = param(req, 'method') || 'GET';
        $url = param(req, 'url');
        $data = param(req, 'data') || {};
        if ($url) {
          $nx = get_nx();
          return rq({
            url: $url,
            body: $data,
            json: true,
            method: $method
          }, function($err, $r, $body) {
            res.data = $body;
            return $nx();
          });
        } else {
          return res.data['err'] = 'no url';
        }
      },
      test: function(req, res, get_nx) {
        return res.data['err'] = 'hello';
      }
    };
    return api;
  };

}).call(this);
