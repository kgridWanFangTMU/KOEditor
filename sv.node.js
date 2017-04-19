(function() {
  var CPUs, app_path, cfg, cfg_path, cluster, cpu, cron, env_cfg, fs, i, load_c, load_json, load_sv_cfg, log_path, run_server, _i, _len,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  app_path = __dirname + '/';

  cfg_path = __dirname + '/cfg/';

  log_path = app_path + 'log';

  cfg = {
    port: 8088,
    cron_enable: true,
    multithread: true,
    max_thread_num: 1,
    controllers: []
  };

  fs = require('fs');

  load_json = function($fp) {
    var $j, $jstr, e;
    try {
      $jstr = fs.readFileSync($fp);
      $j = JSON.parse($jstr);
      if (typeof $j === 'object') {
        return $j;
      } else {
        return {};
      }
    } catch (_error) {
      e = _error;
      return {};
    }
  };

  load_sv_cfg = function($add_cfg) {
    var $cfg, _i, _len;
    console.log('Loading config...');
    Object.assign(cfg, load_json(cfg_path + 'sv.json'));
    Object.assign(cfg, load_json(cfg_path + 'sv.local.json'));
    if ($add_cfg) {
      if (!Array.isArray($add_cfg)) {
        $add_cfg = [$add_cfg];
      }
      for (_i = 0, _len = $add_cfg.length; _i < _len; _i++) {
        $cfg = $add_cfg[_i];
        console.log($cfg);
        Object.assign(cfg, load_json(cfg_path + $cfg));
      }
    }
    console.log('Config loaded.');
    return cfg;
  };


  /*
  ctler=[
       *'rt_his'
  	 *'mosaiq'
      'duty'
      'ret_shift'
      'lab_dept'
  ]
   */

  cron = {
    jobs: {},
    add: function($name, $job) {
      console.log('cron:add job:', $name);
      $job['name'] = $name;
      return this.jobs[$name] = $job;
    },
    start: function() {
      var $c, $date, $delay, $hour, $job, $min, $name, $work_fn, _ref, _ref1, _results;
      console.log('cron:start');
      _ref = this.jobs;
      _results = [];
      for ($name in _ref) {
        $job = _ref[$name];
        if ($job['inited'] !== true) {
          if (typeof $job.target === 'function') {

            /*
            $work_fn= do ($job)->
                $job.target.bind $job
                $job.target
             */
            $job.target.bind;
            $work_fn = $job.target.bind($job);
          } else {
            $c = $job['c'];
            if ($c[$job.target]) {
              $work_fn = $c[$job.target].bind($c);
            } else {
              console.log('cron:err method not found for', $name, ':', $job.target);
            }
          }
          $job.inited = true;
          if ($job['start']) {
            $delay = 5 * 1000;
            if ($job['start'].indexOf(':') > -1) {
              _ref1 = $job['start'].split(':').map(function(x) {
                return parseInt(x, 10);
              }), $hour = _ref1[0], $min = _ref1[1];
              $date = new Date();
              $date.setHours($h);
              $date.setMinutes($min);
              $date.setMilliseconds(0);
              $delay = $date - Date.now();
              if ($delay < 0) {
                $delay += 60 * 60 * 24 * 1000;
              }
            }
            _results.push(setTimeout((function($job, $work_fn) {
              return function() {
                var e;
                try {
                  console.log('cron job:first');
                  $work_fn();
                } catch (_error) {
                  e = _error;
                  console.log('crone error:', e);
                }
                if ($job['every']) {
                  console.log('cron setup :setInterval');
                  return setInterval(function() {
                    try {
                      return $work_fn();
                    } catch (_error) {
                      e = _error;
                      return console.log('crone error:', e);
                    }
                  }, $job.every * 1000);
                }
              };
            })($job, $work_fn), $delay));
          } else {
            _results.push(setInterval((function($work_fn) {
              return function() {
                var e;
                try {
                  return $work_fn();
                } catch (_error) {
                  e = _error;
                  return console.log('crone error:', e);
                }
              };
            })($work_fn), $job.every * 1000));
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };

  load_c = function(c, $http, $cron, $force) {
    var $cr_name, $job, $rout_fns, act, c_mod, c_obj, c_path, cookieSession, express, fn, r_fn, router, _ref;
    if ($http == null) {
      $http = true;
    }
    if ($cron == null) {
      $cron = true;
    }
    if ($force == null) {
      $force = false;
    }
    if ($http) {
      express = require('express');
      router = express.Router();
    } else {
      router = {};
    }
    c_path = require.resolve(app_path + 'c/' + c + '.js');
    console.log("Load_C : " + c + " -> " + c_path);
    console.log("HTTP: " + $http + ", CRON: " + $cron);
    if ($force) {
      console.log("Load_C : Force Mode");
      if (require.cache[c_path]) {
        console.log("Load_C : Force Delete " + c_path);
        delete require.cache[c_path];
      }
    }
    c_mod = require(c_path);
    c_obj = c_mod.c(router);
    if ($http) {
      if (c_mod['session_enable']) {
        cookieSession = require('cookie-session');
        router.use(cookieSession({
          name: "sess_" + c,
          keys: ["key_" + c],
          maxAge: c_mod['session_age'] || 24 * 60 * 60 * 1000
        }));
      }
      for (act in c_obj) {
        fn = c_obj[act];
        $rout_fns = [];
        if (['pre'].indexOf(act) > -1) {
          continue;
        }
        if (c_obj['pre']) {
          $rout_fns.push((function(act) {
            return function(req, res, nx) {
              req['act'] = act;
              return c_obj['pre'](req, res, nx);
            };
          })(act));
        }
        if (typeof fn === 'function') {
          r_fn = function(self, act, fn) {
            return function(req, res, nx) {
              res.data = {};
              fn.call(self, req, res, function() {
                nx.called = true;
                return nx;
              });
              if (!nx['called']) {
                nx();
              } else {
                console.log('called');
              }
            };
          };
          $rout_fns.push((function(c_obj, act, fn) {
            return function(req, res, nx) {
              res.data = {};
              fn.call(c_obj, req, res, function() {
                nx.called = true;
                return nx;
              });
              if (!nx['called']) {
                nx();
              } else {
                console.log('called');
              }
            };
          })(c_obj, act, fn));
        } else {
          r_fn = function(self, act) {
            return function(req, res, nx) {
              res.data = {};
              res.data[act] = self[act];
              nx();
            };
          };
          $rout_fns.push(r_fn(c_obj, act));
        }
        router.use('/' + act, $rout_fns);
      }
      if (!c_obj['view']) {
        c_obj['view'] = function(req, res) {
          if (res['view']) {
            switch (res['view']) {
              case 'text-json':
                res.type('text/plain');
                return res.jsonp(res['data']);
              case 'xml':
                res.type('text/xml');
                return res.send(res['data']);
              case 'json':
              case 'jsonp':
                return res.jsonp(res['data']);
              case 'file':
                if (res['data']['name']) {
                  res.append('Content-Disposition', "attachment;filename=" + res['data']['name']);
                }
                if (res['data']['type']) {
                  res.type(res['data']['type']);
                } else {
                  res.type('application/octet-stream');
                }
                return res.send(res['data']['content']);
              default:
                return res.send(res['data']);
            }
          } else {
            return res.jsonp(res['data']);
          }
        };
      }
      router.use(c_obj.view.bind(c_obj));
    }
    if ($cron) {
      if (c_mod['cron']) {
        _ref = c_mod['cron'];
        for ($cr_name in _ref) {
          $job = _ref[$cr_name];
          $job['c'] = c_obj;
          cron.add("" + c + "-" + $cr_name, $job);
        }
      }
    }
    return {
      router: router,
      mod: c_mod,
      api: c_obj
    };
  };

  run_server = function($http, $cron) {
    var $1day_ms, $ctl, $ctls, $log_err, $static_age, $static_lib_age, $static_root_opt, FileStreamRotator, accessLogStream, app, bodyParser, c, compression, express, morgan, server, set_static, _i, _len, _ref;
    if ($http == null) {
      $http = true;
    }
    if ($cron == null) {
      $cron = true;
    }
    if ($http) {
      express = require('express');
      bodyParser = require('body-parser');
      morgan = require('morgan');
      compression = require('compression');
      app = express();
      if (cfg['log']) {
        try {
          FileStreamRotator = require('file-stream-rotator');
          accessLogStream = FileStreamRotator.getStream({
            date_format: 'YYYYMMDD',
            filename: log_path + '/access-%DATE%.log',
            frequency: 'daily',
            verbose: false
          });
          app.use(morgan('combined', {
            stream: accessLogStream
          }));
        } catch (_error) {
          $log_err = _error;
          console.log('log err', $log_err);
        }
      }
      app.use(compression());
      app.use(bodyParser.json({
        limit: '5mb'
      }));
      app.use(bodyParser.urlencoded({
        extended: true,
        limit: '5mb'
      }));
      $ctls = {};
      _ref = cfg.controllers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        $ctl = load_c(c, $http, $cron);
        $ctls[c] = $ctl;
        app.use('/' + c, $ctl.router);
      }
      app.use('/reload/:c', function(req, res, nx) {
        var m, r_list, rn;
        c = req.params['c'];
        if (c) {
          if (__indexOf.call(ctler, c) >= 0) {
            load_c(c, true);
            return res.send(c + 'reloaded');
          } else {
            r_list = (function() {
              var _ref1, _results;
              _ref1 = require.cache;
              _results = [];
              for (rn in _ref1) {
                m = _ref1[rn];
                _results.push(rn);
              }
              return _results;
            })();
            return res.send(r_list);
          }
        }
      });
      $1day_ms = 86400000;
      $static_age = 15;
      $static_lib_age = 365;
      if (cfg['degug']) {
        $static_age = 0;
      }
      set_static = function($rel_path, $days, $etag) {
        if ($days == null) {
          $days = 0;
        }
        if ($etag == null) {
          $etag = true;
        }
        return app.use($rel_path, express["static"](app_path + 'static' + $rel_path, {
          'maxAge': $1day_ms * $days,
          'lastModified': false,
          'etag': $etag
        }));
      };
      set_static('/js', $static_age);
      set_static('/css', $static_age);
      $static_root_opt = {};
      if (cfg['static_index']) {
        console.log('static_index', cfg['static_index']);
        $static_root_opt['index'] = cfg['static_index'];
      }
      app.use(express["static"](app_path + 'static', $static_root_opt));
      server = app.listen(process.env.PORT || cfg.port);
      console.log('Listening port :', process.env.PORT || cfg.port);
    }
    if ($cron) {
      return cron.start();
    }
  };

  cfg = load_sv_cfg(process.argv.slice(2));

  console.log(cfg);

  if (cfg.multithread) {
    cluster = require('cluster');
    CPUs = require('os').cpus();
    if (cluster.isMaster) {
      for (i = _i = 0, _len = CPUs.length; _i < _len; i = ++_i) {
        cpu = CPUs[i];
        env_cfg = {
          worker_no: i,
          http_enable: true,
          cron_enable: false,
          cfg: cfg
        };
        if (i === 0) {
          if (cfg.cron_enable) {
            env_cfg.cron_enable = true;
          }
        }
        if (i < cfg.max_thread_num) {
          console.log(env_cfg);
          cluster.fork({
            'env_cfg': JSON.stringify(env_cfg)
          });
        }
      }
      cluster.on('exit', function(worker, code, signal) {
        return console.log("worker " + worker.id + " dead");
      });
      cluster.on('online', function($worker) {
        return console.log("worker " + $worker.id + " online");
      });
    } else {
      env_cfg = JSON.parse(process.env['env_cfg']);
      console.log(env_cfg);
      cfg = env_cfg['cfg'];
      run_server(env_cfg['http_enable'], env_cfg['cron_enable']);
    }
  } else {
    run_server(cfg['http_enable'], cfg['cron_enable']);
  }

}).call(this);
