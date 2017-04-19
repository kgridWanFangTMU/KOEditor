(function() {
  var kedit, kgrid, root,
    __slice = [].slice;

  root = window;

  kgrid = function($opt) {
    var $kg;
    $kg = {
      init: function() {
        var _ref;
        this.opt = {
          server: window.location.href + "stack/",
          proxy: true
        };
        $.extend(this, event_obj());
        if ($opt) {
          $.extend(this.opt, $opt);
        }
        _ref = this.opt, this.url = _ref.server, this.proxy = _ref.proxy;
        return this;
      },
      api: function($method, $ura, $body) {
        var $p;
        if ($method == null) {
          $method = "GET";
        }
        if ($ura == null) {
          $ura = ["shelf"];
        }
        if ($body == null) {
          $body = {};
        }
        $p = {
          url: this.url + $ura.join('/'),
          method: $method,
          data: $body,
          dataType: 'json'
        };
        if (this.proxy) {
          return $.post('/proxy/rest', $p);
        } else {
          $p.processData = false;
          $p.data = JSON.stringify($p.data);
          return $.ajax($p);
        }
      },
      raise_arg: function($event, $data, $arg) {
        if ($arg == null) {
          $arg = [];
        }
        $arg.unshift($data);
        $arg.unshift($event);
        return this.raise.apply(this, $arg);
      },
      arkid: function($ko) {
        var $id, $m;
        $id = null;
        if ($ko['metadata']) {
          if ($ko['metadata']['arkId']) {
            $id = $ko['metadata']['arkId']['arkId'];
          }
        }
        if (!$id) {
          if ($ko['url']) {
            $m = $ko['url'].match(/ark\:.+/);
            if ($m) {
              $id = $m[0];
            }
          }
        }
        return $id;
      },
      shelf: function() {
        var $arg;
        $arg = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.api('GET', ["shelf"]).done((function(_this) {
          return function($j) {
            var $id, $ko, _i, _len;
            _this.ko = {};
            for (_i = 0, _len = $j.length; _i < _len; _i++) {
              $ko = $j[_i];
              $id = _this.arkid($ko);
              _this.ko[$id] = $ko;
            }
            return _this.raise_arg('shelf', _this.ko, $arg);
          };
        })(this));
      },
      save: function() {
        var $arg, $id, $ko;
        $ko = arguments[0], $arg = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (typeof $ko === 'string') {
          $id = $ko;
        } else {
          $id = this.arkid($ko);
        }
        return this.api('PUT', ["shelf", $id], $ko).done((function(_this) {
          return function($j) {
            _this.ko[$id] = $ko;
            return _this.raise_arg('save', $j, $arg);
          };
        })(this));
      },
      run: function() {
        var $arg, $id, $ko;
        $ko = arguments[0], $arg = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (typeof $ko === 'string') {
          $id = $ko;
        } else {
          $id = this.arkid($ko);
        }
        return this.api('POST', []);
      }
    };
    return $kg.init();
  };

  root.kedit = kedit = {
    init: function() {
      var $hash, $server_url, editor, editor_in, editor_meta, editor_out;
      this.editor = editor = ace.edit("editor_py");
      this.editor.setTheme("ace/theme/eclipse");
      this.editor.getSession().setMode("ace/mode/python");
      this.editor_out = editor_out = ace.edit("editor_out_xml");
      this.editor_out.setTheme("ace/theme/eclipse");
      this.editor_out.getSession().setMode("ace/mode/xml");
      this.editor_in = editor_in = ace.edit("editor_in_xml");
      this.editor_in.setTheme("ace/theme/eclipse");
      this.editor_in.getSession().setMode("ace/mode/xml");
      this.editor_meta = editor_meta = ace.edit("editor_meta");
      this.editor_meta.setTheme("ace/theme/eclipse");
      this.editor_meta.getSession().setMode("ace/mode/json");
      this.editor.getSession().on('change', (function(_this) {
        return function() {
          return _this.changed(true);
        };
      })(this));
      this.editor_out.getSession().on('change', (function(_this) {
        return function() {
          return _this.changed(true);
        };
      })(this));
      this.editor_in.getSession().on('change', (function(_this) {
        return function() {
          return _this.changed(true);
        };
      })(this));
      this.editor_meta.getSession().on('change', (function(_this) {
        return function() {
          return _this.changed(true);
        };
      })(this));
      this.btn_save = $('#btn_save').on('click', (function(_this) {
        return function() {
          var $ko;
          $ko = _this.pack();
          if (_this.kg) {
            _this.kg.save($ko);
            return _this.dlg_saving = bootbox.dialog({
              message: '<p class="text-center">Saving to server...</p>',
              closeButton: false
            });
          } else {
            return bootbox.alert("No server connected");
          }
        };
      })(this));
      this.setSize();
      this.ko_sel = $('#ko_sel');
      $(window).on('resize', (function(_this) {
        return function() {
          return _this.setSize();
        };
      })(this));
      $('#btn_server').on('click', (function(_this) {
        return function() {
          return _this.dlg_server();
        };
      })(this));
      $('#btn_pack').on('click', (function(_this) {
        return function() {
          var $o, $p;
          $p = _this.pack();
          console.log($p);
          $o = $('<textarea  class="form-control" rows="5"></textarea>').val(JSON.stringify($p, null, 2));
          bootbox.alert({
            message: $o,
            size: 'large'
          });
          return false;
        };
      })(this));
      this.ko_sel.on('change', (function(_this) {
        return function() {
          var $id, $ko, $opt;
          $opt = _this.ko_sel.find(":selected");
          $id = $opt.attr('arkid');
          if ($id != null) {
            $ko = _this.kg.ko[$id];
            return _this.load($ko);
          }
        };
      })(this));
      $hash = window.location.hash;
      if ($hash) {
        $server_url = $hash.substr(1);
        return this.connect($server_url);
      }
    },
    connect: function($url) {
      delete this.kg;
      this.kg = kgrid({
        server: $url,
        proxy: true
      });
      this.kg.on('save', (function(_this) {
        return function($data) {
          console.log('saved');
          return _this.dlg_saving.modal('hide');
        };
      })(this));
      this.kg.on('shelf', (function(_this) {
        return function($data) {
          console.log($data);
          return _this.render_ko_sel();
        };
      })(this));
      this.kg.shelf();
      return this.load();
    },
    setSize: function() {
      var $panel_h, $sky_ground, $wh;
      $wh = $(window).height();
      $sky_ground = 158;
      $panel_h = 63;
      $('#editor_py').height($wh - $sky_ground - $panel_h * 2 - 150);
      $('#editor_in_xml').height(($wh - $sky_ground) / 2 - $panel_h);
      $('#editor_out_xml').height(($wh - $sky_ground) / 2 - $panel_h);
      return $('#editor_meta').height(150);
    },
    dlg_server: function() {
      var $dlg;
      $dlg = bootbox.prompt("Server URL", (function(_this) {
        return function($url) {
          if ($url) {
            console.log('try to connect to', $url);
            return _this.connect($url);
          }
        };
      })(this));
      if (this.kg) {
        if (this.kg.url) {
          return $dlg.find('.bootbox-input').val(this.kg.url);
        }
      }
    },
    render_ko_sel: function() {
      var $id, $ko, $opt, _ref, _results;
      this.ko_sel.html('<option>Select Knowledge Object...</option>');
      _ref = this.kg.ko;
      _results = [];
      for ($id in _ref) {
        $ko = _ref[$id];
        $opt = $('<option></option>').text($ko['metadata']['title']).attr('arkid', $id);
        _results.push(this.ko_sel.append($opt));
      }
      return _results;
    },
    changed: function($changed) {
      if ($changed == null) {
        $changed = true;
      }
      if ($changed !== this.btn_save['changed']) {
        this.btn_save['changed'];
        return this.btn_save.attr('disabled', !$changed);
      }
    },
    load: function($ko) {
      var $fn_name, $in_xml, $meta, $out_xml, $script, $url;
      if ($ko == null) {
        $ko = {};
      }
      $meta = '{}';
      if ($ko['metadata']) {
        $meta = JSON.stringify($ko['metadata'], null, 2);
      }
      this.editor_meta.setValue($meta);
      this.editor_meta.gotoLine(0);
      $script = '';
      $fn_name = '';
      if ($ko['payload']) {
        if ($ko['payload']['content']) {
          $script = $ko['payload']['content'];
        }
        if ($ko['payload']['functionName']) {
          $fn_name = $ko['payload']['functionName'];
        }
      }
      this.editor.setValue($script);
      this.editor.gotoLine(0);
      $('#inp_func_name').val($fn_name);
      $url = '';
      if ($ko['url']) {
        $url = $ko['url'];
      }
      $('#inp_url').val($url);
      $in_xml = '';
      if ($ko['inputMessage']) {
        $in_xml = $ko['inputMessage'];
      }
      this.editor_in.setValue($in_xml);
      this.editor_in.gotoLine(0);
      $out_xml = '';
      if ($ko['outputMessage']) {
        $out_xml = $ko['outputMessage'];
      }
      this.editor_out.setValue($out_xml);
      this.editor_out.gotoLine(0);
      return this.changed(false);
    },
    pack: function() {
      var $meta_str, $metadata, $p, e;
      $meta_str = this.editor_meta.getValue();
      $metadata = {};
      if ($meta_str) {
        try {
          $metadata = JSON.parse($meta_str);
        } catch (_error) {
          e = _error;
          console.log(e);
        }
      }
      $p = {
        metadata: $metadata,
        payload: {
          content: this.editor.getValue(),
          engineType: 'Python',
          functionName: $('#inp_func_name').val() || "getGuideline"
        },
        inputMessage: this.editor_in.getValue(),
        outputMessage: this.editor_out.getValue(),
        url: $('#inp_url').val() || void 0
      };
      return $p;
    }
  };

  kedit.init();

}).call(this);
