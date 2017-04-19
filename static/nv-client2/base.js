(function() {
  var root,
    __slice = [].slice;

  root = window;

  root.util = {
    formatBytes: function(bytes, decimals) {
      var dm, i, k, sizes;
      if (bytes === 0) {
        return '0 Byte';
      }
      k = 1000;
      dm = decimals + 1 || 3;
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    rnd_int: function(max, min) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    },
    mktime: function() {
      return Math.floor(Date.now() / 1000);
    },
    trim: function($s) {
      var e;
      try {
        return $s.replace(/^\s+|\s+$/g, '');
      } catch (_error) {
        e = _error;
        return $s;
      }
    },
    parseTime: function($s) {
      var $r;
      $r = Date.parse($s) / 1000;
      return $r;
    },
    parseDate_sign: function($s) {
      var $da, $da2, $i, $sign, $ts;
      $da = this.trim($s).split(/[\.\/-]/g);
      $da2 = [];
      for ($i in $da) {
        $da[$i] = parseInt($da[$i], 10);
        if (!isNaN($da[$i])) {
          $da2.push($da[$i]);
        }
      }
      $sign = 0;
      if ($da2.length > 0 && $da2.length < 4) {
        $sign = 3 - $da2.length;
      }
      $i = 0;
      while ($i < $sign) {
        $da2.push(1);
        $i++;
      }
      $ts = this.parseTime($da2.join('/'));
      return {
        'time': $ts,
        'sign': $sign
      };
    },
    datetime: function($timestamp, $deyear, $split, $sec) {
      var $d, $da, $i, $r, $yo;
      if ($sec == null) {
        $sec = true;
      }
      $d = new Date;
      $yo = $d.getFullYear();
      $d.setTime($timestamp * 1000);
      $da = {
        'm': $d.getMonth() + 1,
        'd': $d.getDate(),
        'h': $d.getHours(),
        'n': $d.getMinutes(),
        's': $d.getSeconds(),
        'y': $d.getFullYear()
      };
      for ($i in $da) {
        if ($da[$i] < 10) {
          $da[$i] = '0' + $da[$i];
        }
      }
      if (!$split) {
        $split = ' ';
      }
      $r = $da['m'] + '/' + $da['d'] + $split + $da['h'] + ':' + $da['n'];
      if ($sec) {
        $r += ':' + $da['s'];
      }
      if (!$deyear) {
        $r = $da['y'] + '/' + $r;
      }
      return $r;
    },
    datetime_date: function($timestamp, $deyear, $sign, $mk) {
      var $d, $da, $dsa, $i, $y, $yo;
      if ($mk) {
        $yo = $yo - 1911;
      }
      $da = this.datetime_arr($timestamp);
      for ($i in $da) {
        if ($da[$i] < 10) {
          $da[$i] = '0' + $da[$i];
        }
      }
      $y = $da['y'];
      if ($mk) {
        $y = $y - 1911;
      }
      $dsa = [$y, $da['m'], $da['d']];
      if ($sign) {
        $i = 0;
        while ($i < $sign) {
          $dsa.pop();
          $i++;
        }
      }
      if ($deyear) {
        $d = new Date;
        $yo = $d.getFullYear();
        if ($y === $yo) {
          $dsa.shift();
        }
      }
      return $dsa.join('/');
    },
    datetime_min: function($timestamp, $deyear, $split) {
      var $d, $da, $i, $r, $yo;
      $d = new Date;
      $yo = $d.getFullYear();
      $d.setTime($timestamp * 1000);
      $da = {
        'm': $d.getMonth() + 1,
        'd': $d.getDate(),
        'h': $d.getHours(),
        'n': $d.getMinutes(),
        's': $d.getSeconds(),
        'y': $d.getFullYear()
      };
      for ($i in $da) {
        if ($da[$i] < 10) {
          $da[$i] = '0' + $da[$i];
        }
      }
      if (!$split) {
        $split = ' ';
      }
      $r = $da['m'] + '/' + $da['d'] + $split + $da['h'] + ':' + $da['n'];
      if ($deyear) {
        if ($da['y'] !== $yo) {
          $r = $da['y'] + '/' + $r;
        }
      } else {
        $r = $da['y'] + '/' + $r;
      }
      return $r;
    },
    datetime_arr: function($timestamp) {
      var $d, $da;
      $d = new Date;
      if ($timestamp != null) {
        $d.setTime($timestamp * 1000);
      }
      $da = {
        'm': $d.getMonth() + 1,
        'd': $d.getDate(),
        'h': $d.getHours(),
        'n': $d.getMinutes(),
        's': $d.getSeconds(),
        'y': $d.getFullYear()
      };
      return $da;
    },
    MkDate2DateStr: function($mks, $split, $new_split) {
      var $ma, $y;
      if ($split == null) {
        $split = '/';
      }
      if ($new_split == null) {
        $new_split = '/';
      }
      $ma = this.trim($mks).split($split);
      $y = parseInt($ma[0], 10);
      if ($y < 1000) {
        $y += 1911;
      }
      $ma[0] = $y;
      return $ma.join($new_split);
    },
    parseMkTime: function($mks) {
      var $ma, $r, $y;
      $ma = trim($mks).split('/');
      $y = parseInt($ma[0], 10);
      if ($y < 1000) {
        $y += 1911;
      }
      $ma[0] = $y;
      $r = Date.parse($ma.join('/')) / 1000;
      return $r;
    },
    chdate2arr: function($s) {
      var $d, $m, $sf, $y;
      $sf = 0;
      $s = this.trim($s);
      if ($s.length === 7) {
        $sf = 1;
      }
      $y = parseInt($s.slice(0, 2 + $sf), 10) + 1911;
      $m = parseInt($s.slice(2 + $sf, 4 + $sf), 10);
      $d = parseInt($s.slice(4 + $sf), 10);
      return [$y, $m, $d];
    },
    parseMKdatetime: function($dstr, $tstr) {
      var $d, $dobj, $m, $ts, $y, _ref;
      _ref = this.chdate2arr($dstr), $y = _ref[0], $m = _ref[1], $d = _ref[2];
      $dobj = new Date($y, $m - 1, $d, 0, 0, 0);
      $ts = Math.floor($dobj.getTime() / 1000);
      if ($tstr) {
        $ts += this.timestr2sec($tstr);
      }
      return $ts;
    },
    timestamp_date: function($ts) {
      var $s_1day, $t_shift;
      $t_shift = 0 - (new Date(1970, 0, 1)).getTime() / 1000;
      $s_1day = 24 * 60 * 60;
      this.timestamp_date = function($ts) {
        $ts = parseInt($ts);
        $ts += $t_shift;
        return $ts - ($ts % $s_1day);
      };
      return this.timestamp_date($ts);
    },
    chdate2timestamp: function($s) {
      var $d, $dobj, $m, $sf, $y;
      $sf = 0;
      if ($s.length === 7) {
        $sf = 1;
      }
      $y = parseInt($s.slice(0, 2 + $sf), 10) + 1911;
      $m = parseInt($s.slice(2 + $sf, 4 + $sf), 10);
      $d = parseInt($s.slice(4 + $sf), 10);
      $dobj = new Date($y, $m - 1, $d, 0, 0, 0);
      return $dobj.getTime() / 1000;
    },
    timestr2sec: function($s) {
      var $h, $m, $sf;
      $sf = 0;
      if ($s.length > 3) {
        $sf = 1;
      }
      $h = parseInt($s.slice(0, 1 + $sf, 10));
      $m = parseInt($s.slice(1 + $sf), 10);
      return ($h * 60 + $m) * 60;
    },
    nl2br: function($s) {
      if ($s) {
        return $s.replace(/(\r\n)/g, '<br />').replace(/\n/g, '<br />');
      } else {
        return $s;
      }
    },
    stripnl: function($s) {
      return $s.replace(/((\r\n)|\n){2,}/g, '\n\n').replace(/^\s+|\s+$/g, '');
    },
    stripPoorBreak: function($s) {
      var $i, $ra, $sa;
      $sa = $s.split(/(\r\n)|\n/);
      $ra = '';
      if ($sa.length > 1) {
        $ra.push($sa[0]);
        $i = 1;
        while ($i < $sa.length) {
          $i++;
        }
      }
    },
    bitwise: function($def) {

      /*
      	$def 
      	ex. ['read','write','list']
       */
      var $bw;
      $bw = {
        def: $def,
        data: 0,
        val: function() {
          if (arguments.length === 0) {
            return this.data;
          } else {
            this.data = arguments[0];
            this.dict_dated = true;
          }
          return this;
        },
        mix_val: function($arg) {
          var $i, $mix_val;
          $mix_val = 0;
          $i = 0;
          while ($i < $arg.length) {
            $mix_val = $mix_val | 1 << this.def.indexOf($arg[$i]);
            $i++;
          }
          return $mix_val;
        },
        has: function() {
          var $check_mix;
          $check_mix = this.mix_val(arguments);
          return (this.data & $check_mix) === $check_mix;
        },
        add: function() {
          var $add_val;
          $add_val = this.mix_val(arguments);
          this.val(this.data | $add_val);
          return this;
        },
        rm: function() {
          var $add_val;
          $add_val = this.mix_val(arguments);
          this.val(this.data - (this.data & $add_val));
          return this;
        },
        dict_dated: true,
        _dict: {},
        dict: function() {
          var $i, $tmp_v;
          if (this.dict_dated) {
            this._dict = {};
            $i = 0;
            while ($i < this.def.length) {
              $tmp_v = 1 << $i;
              this._dict[this.def[$i]] = (this.data & $tmp_v) === $tmp_v;
              $i++;
            }
            this.dict_dated = false;
          }
          return this._dict;
        },
        print: function() {
          return this.data.toString(2);
        }
      };
      return $bw;
    }
  };

  root.event_obj = function() {
    var evt;
    evt = {
      _event_debug: false,
      _event: {},
      _event_once: {},
      on: function($event_name, $fn) {
        var $evn, _i, _len;
        if ($event_name) {
          if ($event_name.constructor === Array) {
            for (_i = 0, _len = $event_name.length; _i < _len; _i++) {
              $evn = $event_name[_i];
              this._on($evn, $fn);
            }
          } else {
            this._on($event_name, $fn);
          }
          if (this._event_debug) {
            console.log('set on:', $event_name);
          }
        }
        return this;
      },
      _on: function($event_name, $fn) {
        if (!this._event[$event_name]) {
          this._event[$event_name] = [];
        }
        this._event[$event_name].push($fn);
        return this;
      },
      once: function($event_name, $fn) {
        if (!this._event_once[$event_name]) {
          this._event_once[$event_name] = [];
        }
        this._event_once[$event_name].push($fn);
        return this;
      },
      _raise: function($event_name, $arg) {
        var $elen, $evn, $evns, $evt, $i, _i, _j, _len, _len1, _ref, _ref1;
        $evns = $event_name.split('.');
        $elen = $evns.length;
        $i = 0;
        while ($i < $elen) {
          $evn = ($evns.slice(0, $elen - $i)).join('.');
          if (this._event[$evn]) {
            _ref = this._event[$evn];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              $evt = _ref[_i];
              $evt.apply(this, $arg);
            }
          }
          if (this._event_once[$evn]) {
            _ref1 = this._event_once[$evn];
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              $evt = _ref1[_j];
              $evt.apply(this, $arg);
            }
            delete this._event_once[$evn];
          }
          if (this._event_debug) {
            console.log('raise:', $evn);
          }
          $i++;
        }
        return this;
      },

      /*
      raise: ($event_name) ->
          $arg = []
      
          if arguments.length > 1
              $i = 1
              while $i < arguments.length
                  $arg.push arguments[$i]
                  $i++
       
          @_raise $event_name,$arg
      
      raise_tag: ($event_name,$tag) ->
          $tag_str=''
          if $tag
              if $tag.constructor == Array
                  $tag_str=$tag.join '.'
              else
                  $tag_str=$tag
              $tag_str='.'+$tag_str
      
          $arg = []
          if arguments.length > 2
              $i = 2
              while $i < arguments.length
                  $arg.push arguments[$i]
                  $i++
          @_raise $event_name+$tag_str,$arg
       */
      raise: function() {
        var $arg, $event_name;
        $event_name = arguments[0], $arg = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return this._raise($event_name, $arg);
      },
      raise_tag: function() {
        var $arg, $event_name, $tag, $tag_str;
        $event_name = arguments[0], $tag = arguments[1], $arg = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        $tag_str = '';
        if ($tag) {
          if ($tag.constructor === Array) {
            $tag_str = $tag.join('.');
          } else {
            $tag_str = $tag;
          }
          $tag_str = '.' + $tag_str;
        }
        return this._raise($event_name + $tag_str, $arg);
      }
    };
    return evt;
  };

  root.nv_event = function() {
    var evt;
    evt = {
      _event_debug: false,
      _event: {},
      _event_once: {},
      on: function($event_name, $fn) {
        var $evn, _i, _len;
        if ($event_name) {
          if ($event_name.constructor === Array) {
            for (_i = 0, _len = $event_name.length; _i < _len; _i++) {
              $evn = $event_name[_i];
              this._on($evn, $fn);
            }
          } else {
            this._on($event_name, $fn);
          }
          if (this._event_debug) {
            console.log('set on:', $event_name);
          }
        }
        return this;
      },
      _on: function($event_name, $fn) {
        if (!this._event[$event_name]) {
          this._event[$event_name] = [];
        }
        this._event[$event_name].push($fn);
        return this;
      },
      once: function($event_name, $fn) {
        if (!this._event_once[$event_name]) {
          this._event_once[$event_name] = [];
        }
        this._event_once[$event_name].push($fn);
        return this;
      },
      _raise: function($event_name, $arg) {
        var $elen, $evn, $evn_left, $evns, $evt, _i, _j, _len, _len1, _ref, _ref1;
        $evns = $event_name.split('.');
        $elen = $evns.length;
        $evn_left = [];
        while ($i < $elen) {
          $evn = $evns.join('.');
          if (this._event[$evn]) {
            _ref = this._event[$evn];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              $evt = _ref[_i];
              $evt.apply(this, [
                {
                  once: false,
                  tag: $evn_left
                }
              ].concat($arg));
            }
          }
          if (this._event_once[$evn]) {
            _ref1 = this._event_once[$evn];
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              $evt = _ref1[_j];
              $evt.apply(this, [
                {
                  once: true,
                  tag: $evn_left
                }
              ].concat($arg));
            }
            delete this._event_once[$evn];
          }
          if (this._event_debug) {
            console.log('raise:', $evn);
          }
          $evn_left.push($evns.pop());
          $i++;
        }
        return this;
      },
      raise: function() {
        var $arg, $event_name;
        $event_name = arguments[0], $arg = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return this._raise($event_name, $arg);
      },
      raise_tag: function() {
        var $arg, $event_name, $tag, $tag_str;
        $event_name = arguments[0], $tag = arguments[1], $arg = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        $tag_str = '';
        if ($tag) {
          if ($tag.constructor === Array) {
            $tag_str = $tag.join('.');
          } else {
            $tag_str = $tag;
          }
          $tag_str = '.' + $tag_str;
        }
        return this._raise($event_name + $tag_str, $arg);
      }
    };
    return evt;
  };

  root.log = {
    data: {},
    event: {
      'err': [],
      'msg': []
    },
    index: -1,
    max: 100,
    count: 0,
    enable: false,
    add: function($msg, $force) {
      var $i;
      if (this.enable || $force) {
        this.count++;
        this.index++;
        if (this.count > this.max) {
          for ($i in this.data) {
            if ($i < this.index - 1) {
              delete this.data[$i];
            } else {
              break;
            }
          }
          this.count = 2;
        }
        this.data[this.index] = $msg;
        if (window['console']) {
          console.log('Log(' + this.index + '):' + $msg);
        }
      }
      return this.index;
    }
  };

  root.timer = {
    obj: {},
    time_id: 0,
    pf: {},
    running: false,
    init: function() {},
    add: function($id, $time_sec, $eval_str, $dom, $perm) {
      var $dom_type;
      if ($perm) {
        $perm = true;
      } else {
        $perm = false;
      }
      this.pf[$id] = {
        'total': $time_sec,
        'left': $time_sec,
        'obj': false,
        'eval_str': $eval_str,
        'perm': $perm
      };
      if ($dom) {
        $dom_type = typeof $dom;
        if ($dom_type === 'boolean') {
          this.pf[$id]['obj'] = $($id);
        } else {
          this.pf[$id]['obj'] = $($dom);
        }
      }
      if (!this.running) {
        this.handler();
      }
    },
    rm: function($id) {
      var e;
      try {
        if (this.pf[$id]) {
          delete this.pf[$id];
        }
      } catch (_error) {
        e = _error;
        log.add(['timer.rm', 'err', $id]);
      }
    },
    format_time: function() {},
    err: [],
    debug: false,
    handler: function() {
      var $id, $run_count, e;
      timer.running = true;
      $run_count = 0;
      for ($id in timer.pf) {
        try {
          if (timer.pf[$id].left > 0) {
            $run_count++;
            timer.pf[$id].left--;
            if (timer.pf[$id].obj) {
              timer.pf[$id].obj.text(util.format_time_hr(timer.pf[$id].left));
            }
          } else {
            if (timer.pf[$id]['eval_str']) {
              if (typeof timer.pf[$id]['eval_str'] === 'string') {
                eval(timer.pf[$id]['eval_str']);
              } else if (typeof timer.pf[$id]['eval_str'] === 'function') {
                timer.pf[$id]['eval_str']();
              }
            }
            if (timer.pf[$id]['perm']) {
              timer.pf[$id]['left'] = timer.pf[$id]['total'];
            } else {
              delete timer.pf[$id];
            }
          }
        } catch (_error) {
          e = _error;
          if (timer.debug) {
            timer.err.push(e);
          }
          timer.err_o = e;
        }
      }
      clearTimeout(timer.time_id);
      if ($run_count > 0) {
        timer.time_id = setTimeout('timer.handler();', 1000);
      } else {
        timer.running = false;
      }
    }
  };

  util.Base64 = {
    _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    encode: function(input) {
      var chra, enc, i, outa;
      outa = [];
      i = 0;
      input = this._utf8_encode(input);
      while (i < input.length) {
        chra = [input.charCodeAt(i++), input.charCodeAt(i++), input.charCodeAt(i++)];
        enc = [chra[0] >> 2, (chra[0] & 3) << 4 | chra[1] >> 4, (chra[1] & 15) << 2 | chra[2] >> 6, chra[2] & 63];
        if (isNaN(chra[1])) {
          enc[2] = enc[3] = 64;
        } else if (isNaN(chra[2])) {
          enc[3] = 64;
        }
        outa.push([this._keyStr.charAt(enc[0]), this._keyStr.charAt(enc[1]), this._keyStr.charAt(enc[2]), this._keyStr.charAt(enc[3])].join(''));
      }
      return outa.join('');
    },
    decode: function(input) {
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4, i, output;
      i = 0;
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
      while (i < input.length) {
        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));
        chr1 = enc1 << 2 | enc2 >> 4;
        chr2 = (enc2 & 15) << 4 | enc3 >> 2;
        chr3 = (enc3 & 3) << 6 | enc4;
        output = output + String.fromCharCode(chr1);
        if (enc3 !== 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 !== 64) {
          output = output + String.fromCharCode(chr3);
        }
      }
      output = this._utf8_decode(output);
      return output;
    },
    _utf8_encode: function(string) {
      var c, n, utftext;
      string = string.replace(/\r\n/g, '\n');
      utftext = '';
      n = 0;
      while (n < string.length) {
        c = string.charCodeAt(n);
        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if (c > 127 && c < 2048) {
          utftext += String.fromCharCode(c >> 6 | 192);
          utftext += String.fromCharCode(c & 63 | 128);
        } else {
          utftext += String.fromCharCode(c >> 12 | 224);
          utftext += String.fromCharCode(c >> 6 & 63 | 128);
          utftext += String.fromCharCode(c & 63 | 128);
        }
        n++;
      }
      return utftext;
    },
    _utf8_decode: function(utftext) {
      var c, c1, c2, c3, i, string;
      string = '';
      i = 0;
      c = c1 = c2 = 0;
      while (i < utftext.length) {
        c = utftext.charCodeAt(i);
        if (c < 128) {
          string += String.fromCharCode(c);
          i++;
        } else if (c > 191 && c < 224) {
          c2 = utftext.charCodeAt(i + 1);
          string += String.fromCharCode((c & 31) << 6 | c2 & 63);
          i += 2;
        } else {
          c2 = utftext.charCodeAt(i + 1);
          c3 = utftext.charCodeAt(i + 2);
          string += String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
          i += 3;
        }
      }
      return string;
    }
  };

  if (!root['console']) {
    root['console'] = {
      data: [],
      log: function($txt) {}
    };
  }

}).call(this);
