root=window

root.util = 
    formatBytes: (bytes, decimals) ->
        if bytes == 0
            return '0 Byte'
        k = 1000
        # or 1024 for binary
        dm = decimals + 1 or 3
        sizes = [
            'Bytes'
            'KB'
            'MB'
            'GB'
            'TB'
            'PB'
            'EB'
            'ZB'
            'YB'
        ]

        i = Math.floor(Math.log(bytes) / Math.log(k))
        parseFloat((bytes / k ** i).toFixed(dm)) + ' ' + sizes[i]
    rnd_int: (max, min) ->
        Math.floor Math.random() * (max - min + 1) + min
    mktime: ->
        Math.floor Date.now() / 1000
    trim: ($s) ->
        try
            $s.replace /^\s+|\s+$/g, ''
        catch e
            $s
    parseTime: ($s) ->
        $r = Date.parse($s) / 1000
        $r
    parseDate_sign: ($s) ->

        $da = @trim($s).split(/[\.\/-]/g)
        $da2 = []
        for $i of $da
            $da[$i] = parseInt($da[$i], 10)
            if !isNaN($da[$i])
                $da2.push $da[$i]
        $sign = 0
        if $da2.length > 0 and $da2.length < 4
            $sign = 3 - ($da2.length)
        $i = 0
        while $i < $sign
            $da2.push 1
            $i++
            
        $ts = @parseTime($da2.join('/'))
        #timestamp
        {
            'time': $ts
            'sign': $sign
        }
    datetime: ($timestamp, $deyear, $split,$sec=true) ->
        $d = new Date
        $yo = $d.getFullYear()
        $d.setTime $timestamp * 1000
        $da = 
            'm': $d.getMonth() + 1
            'd': $d.getDate()
            'h': $d.getHours()
            'n': $d.getMinutes()
            's': $d.getSeconds()
            'y': $d.getFullYear()
        for $i of $da
            if $da[$i] < 10
                $da[$i] = '0' + $da[$i]
        if !$split
            $split = ' '
        $r = $da['m'] + '/' + $da['d'] + $split + $da['h'] + ':' + $da['n']
        if $sec
            $r+=':' + $da['s']
        if !$deyear
            $r = $da['y'] + '/' + $r
        $r
    datetime_date: ($timestamp, $deyear, $sign, $mk) ->

        #this year
        if $mk
            $yo = $yo - 1911
        
        $da = @datetime_arr($timestamp)
        for $i of $da
            if $da[$i] < 10
                $da[$i] = '0' + $da[$i]
        $y = $da['y']
        if $mk
            $y = $y - 1911
        $dsa = [
            $y
            $da['m']
            $da['d']
        ]
        if $sign
            $i = 0
            while $i < $sign
                $dsa.pop()
                $i++
        if $deyear
            $d = new Date
            $yo = $d.getFullYear()
            if $y == $yo
                $dsa.shift()
                #return $da['m']+ '/' + $da['d'];
        #return ($y+ '/' + $da['m']+ '/' + $da['d'] );
        $dsa.join '/'
        #return ;
    datetime_min: ($timestamp, $deyear, $split) ->
        $d = new Date
        $yo = $d.getFullYear()
        $d.setTime $timestamp * 1000
        $da = 
            'm': $d.getMonth() + 1
            'd': $d.getDate()
            'h': $d.getHours()
            'n': $d.getMinutes()
            's': $d.getSeconds()
            'y': $d.getFullYear()
        for $i of $da
            if $da[$i] < 10
                $da[$i] = '0' + $da[$i]
        if !$split
            $split = ' '
        $r = $da['m'] + '/' + $da['d'] + $split + $da['h'] + ':' + $da['n']
        if $deyear
            if $da['y'] != $yo
                $r = $da['y'] + '/' + $r
        else
            $r = $da['y'] + '/' + $r
        $r
    datetime_arr: ($timestamp) ->
        $d = new Date
        if $timestamp?
            $d.setTime $timestamp * 1000
        $da = 
            'm': $d.getMonth() + 1
            'd': $d.getDate()
            'h': $d.getHours()
            'n': $d.getMinutes()
            's': $d.getSeconds()
            'y': $d.getFullYear()
        $da
    MkDate2DateStr: ($mks,$split='/',$new_split='/') ->
        #$ma=trim($mks).replace('：',':').split('/');
        $ma = @trim($mks).split($split)
        $y = parseInt($ma[0], 10)
        if $y < 1000
            $y += 1911
        $ma[0] = $y
        $ma.join($new_split)
    parseMkTime: ($mks) ->
        #$ma=trim($mks).replace('：',':').split('/');
        $ma = trim($mks).split('/')
        $y = parseInt($ma[0], 10)
        if $y < 1000
            $y += 1911
        $ma[0] = $y
        #return (Date.parse($mks)/1000)+60305299200;
        $r = Date.parse($ma.join('/')) / 1000
        $r
    chdate2arr: ($s) ->
        $sf = 0
        $s=@trim $s
        if $s.length == 7
            $sf = 1
        $y = parseInt($s.slice(0, 2 + $sf), 10) + 1911
        $m = parseInt($s.slice(2 + $sf, 4 + $sf), 10)
        $d = parseInt($s.slice(4 + $sf), 10)
        [
            $y
            $m
            $d
        ]
    parseMKdatetime:($dstr,$tstr)->
        [$y,$m,$d]=@chdate2arr $dstr
        $dobj = new Date($y, $m - 1, $d, 0, 0, 0)
        $ts=Math.floor ($dobj.getTime()/1000)
        $ts+=@timestr2sec($tstr) if $tstr
        $ts
    timestamp_date:($ts)->
        $t_shift=0-(new Date(1970,0,1)).getTime()/1000
        $s_1day=24*60*60
        @timestamp_date=($ts)->
            $ts=parseInt $ts
            $ts+=$t_shift
            $ts-($ts%$s_1day)
        @timestamp_date $ts
    chdate2timestamp: ($s) ->
        $sf = 0
        if $s.length == 7
            $sf = 1
        $y = parseInt($s.slice(0, 2 + $sf), 10) + 1911
        $m = parseInt($s.slice(2 + $sf, 4 + $sf), 10)
        $d = parseInt($s.slice(4 + $sf), 10)
        $dobj = new Date($y, $m - 1, $d, 0, 0, 0)
        $dobj.getTime() / 1000
    timestr2sec: ($s) ->
        $sf = 0
        if $s.length > 3
            $sf = 1
        $h = parseInt($s.slice(0, 1 + $sf, 10))
        $m = parseInt($s.slice(1 + $sf), 10)
        ($h * 60 + $m) * 60
    nl2br: ($s) ->
        if $s
            $s.replace(/(\r\n)/g, '<br />').replace /\n/g, '<br />'
        else
            $s
    stripnl: ($s) ->
        #return $s.replace(/((\r\n)|\n){2,}/g,"\r\n\r\n").replace(/\n{2,}/g,"\n\n")
        $s.replace(/((\r\n)|\n){2,}/g, '\n\n').replace /^\s+|\s+$/g, ''
    stripPoorBreak: ($s) ->
        $sa = $s.split(/(\r\n)|\n/)
        $ra = ''
        if $sa.length > 1
            $ra.push $sa[0]
            $i = 1
            while $i < $sa.length
                #if ($sa[$i-1])
                $i++
        return
    
    bitwise: ($def) ->
        ###
        	$def 
        	ex. ['read','write','list']

        ###
        $bw = 
            def: $def
            data: 0
            val: ->
                if arguments.length == 0
                    return @data
                else
                    @data = arguments[0]
                    @dict_dated = true
                this
            mix_val: ($arg) ->
                $mix_val = 0
                $i = 0
                while $i < $arg.length
                    $mix_val = $mix_val | 1 << @def.indexOf($arg[$i])
                    $i++
                $mix_val
            has: ->
                $check_mix = @mix_val(arguments)
                (@data & $check_mix) == $check_mix
            add: ->
                $add_val = @mix_val(arguments)
                @val @data | $add_val
                this
            rm: ->
                $add_val = @mix_val(arguments)
                @val @data - (@data & $add_val)
                #this.data=this.data-(this.data&$add_val);
                this
            dict_dated: true
            _dict: {}
            dict: ->
                if @dict_dated
                    @_dict = {}
                    $i = 0
                    while $i < @def.length
                        $tmp_v = 1 << $i
                        @_dict[@def[$i]] = (@data & $tmp_v) == $tmp_v
                        $i++
                    @dict_dated = false
                @_dict
            print: ->
                @data.toString 2
        $bw
#event obj
root.event_obj = ->
    evt = 
        _event_debug:false
        _event: {}
        _event_once: {}
        on: ($event_name, $fn) ->
            if $event_name
                if $event_name.constructor == Array
                    for $evn in $event_name
                        @_on $evn, $fn
                else
                    @_on $event_name, $fn
                if @_event_debug
                    console.log 'set on:',$event_name
            @
        _on: ($event_name, $fn) ->
            if !@_event[$event_name]
                @_event[$event_name] = []
            @_event[$event_name].push $fn
            @
        once: ($event_name, $fn) ->
            if !@_event_once[$event_name]
                @_event_once[$event_name] = []
            @_event_once[$event_name].push $fn
            @
        _raise:($event_name,$arg) ->
            $evns=$event_name.split '.'
            #console.log $evns
            $elen=$evns.length
            $i=0
            while $i <$elen
                $evn=($evns.slice 0,$elen-$i).join '.'
                #console.log $i,$evn
                #@_raise $evn,$arg
                if @_event[$evn]
                    for $evt in @_event[$evn]
                        $evt.apply @, $arg

                if @_event_once[$evn]

                    for $evt in @_event_once[$evn]
                        $evt.apply @, $arg
                    delete @_event_once[$evn]
                if @_event_debug
                    console.log 'raise:',$evn
                $i++
                
            @
        ###
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
        ###
        raise: ($event_name,$arg...) ->

            @_raise $event_name,$arg

        raise_tag: ($event_name,$tag,$arg...) ->
            $tag_str=''
            if $tag
                if $tag.constructor == Array
                    $tag_str=$tag.join '.'
                else
                    $tag_str=$tag
                $tag_str='.'+$tag_str

            @_raise $event_name+$tag_str,$arg
            

    evt
#nv_event (event_obj v2)
#imporve tag, add event object to callback
root.nv_event = ->
    evt = 
        _event_debug:false
        _event: {}
        _event_once: {}
        on: ($event_name, $fn) ->
            if $event_name
                if $event_name.constructor == Array
                    for $evn in $event_name
                        @_on $evn, $fn
                else
                    @_on $event_name, $fn
                if @_event_debug
                    console.log 'set on:',$event_name
            @
        _on: ($event_name, $fn) ->
            if !@_event[$event_name]
                @_event[$event_name] = []
            @_event[$event_name].push $fn
            @
        once: ($event_name, $fn) ->
            if !@_event_once[$event_name]
                @_event_once[$event_name] = []
            @_event_once[$event_name].push $fn
            @
        _raise:($event_name,$arg) ->
            $evns=$event_name.split '.'
            #console.log $evns
            $elen=$evns.length
            #$i=0
            $evn_left=[]
            
            #while $evns.length>0
            while $i <$elen
                $evn=$evns.join '.'
                #console.log $i,$evn
                #@_raise $evn,$arg
                if @_event[$evn]
                    for $evt in @_event[$evn]
                        $evt.apply @, [{once:false,tag:$evn_left}].concat($arg)

                if @_event_once[$evn]

                    for $evt in @_event_once[$evn]
                        $evt.apply @, [{once:true,tag:$evn_left}].concat($arg)
                    delete @_event_once[$evn]
                if @_event_debug
                    console.log 'raise:',$evn
                $evn_left.push $evns.pop()
                $i++
            @
        raise: ($event_name,$arg...) ->

            @_raise $event_name,$arg

        raise_tag: ($event_name,$tag,$arg...) ->
            $tag_str=''
            if $tag
                if $tag.constructor == Array
                    $tag_str=$tag.join '.'
                else
                    $tag_str=$tag
                $tag_str='.'+$tag_str

            @_raise $event_name+$tag_str,$arg
            
    evt
root.log =
    data: {}
    event:
        'err': []
        'msg': []
    index: -1
    max: 100
    count: 0
    enable: false
    add: ($msg, $force) ->
        if @enable or $force
            @count++
            @index++
            if @count > @max
                for $i of @data
                    if $i < @index - 1
                        delete @data[$i]
                    else
                        break
                @count = 2
            @data[@index] = $msg
            if window['console']
                console.log 'Log(' + @index + '):' + $msg
        @index
root.timer =
    obj: {}
    time_id: 0
    pf: {}
    running: false
    init: ->
    add: ($id, $time_sec, $eval_str, $dom, $perm) ->
        if $perm
            $perm = true
        else
            $perm = false
        @pf[$id] =
            'total': $time_sec
            'left': $time_sec
            'obj': false
            'eval_str': $eval_str
            'perm': $perm
        if $dom
            $dom_type = typeof $dom
            if $dom_type == 'boolean'
                @pf[$id]['obj'] = $($id)
            else
                @pf[$id]['obj'] = $($dom)
        if !@running
            @handler()
        return
    rm: ($id) ->
        try
            if @pf[$id]
                delete @pf[$id]
        catch e
            log.add [
                'timer.rm'
                'err'
                $id
            ]
        return
    format_time: ->
    err: []
    debug: false
    handler: ->
        timer.running = true
        $run_count = 0
        for $id of timer.pf
            try
                if timer.pf[$id].left > 0
                    $run_count++
                    timer.pf[$id].left--
                    if timer.pf[$id].obj
                        timer.pf[$id].obj.text util.format_time_hr(timer.pf[$id].left)
                else
                    if timer.pf[$id]['eval_str']
                        if typeof timer.pf[$id]['eval_str'] == 'string'
                            eval timer.pf[$id]['eval_str']
                        else if typeof timer.pf[$id]['eval_str'] == 'function'
                            timer.pf[$id]['eval_str']()
                    if timer.pf[$id]['perm']
                        timer.pf[$id]['left'] = timer.pf[$id]['total']
                    else
                        delete timer.pf[$id]
            catch e
                if timer.debug
                    timer.err.push e
                timer.err_o = e
        clearTimeout timer.time_id
        if $run_count > 0
            timer.time_id = setTimeout('timer.handler();', 1000)
        else
            timer.running = false
        return
    
    
util.Base64 = 
  _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  encode: (input) ->
    outa=[]


    i = 0
    input = @_utf8_encode(input)
    while i < input.length
        chra=[
            input.charCodeAt(i++)
            input.charCodeAt(i++)
            input.charCodeAt(i++)
        ]
        enc=[
            chra[0] >> 2
            (chra[0] & 3) << 4 | chra[1] >> 4
            (chra[1] & 15) << 2 | chra[2] >> 6
            chra[2] & 63
        ]

        if isNaN(chra[1])
            enc[2] = enc[3] = 64
        else if isNaN(chra[2])
            enc[3] = 64
        outa.push [
            @_keyStr.charAt enc[0]
            @_keyStr.charAt enc[1]
            @_keyStr.charAt enc[2]
            @_keyStr.charAt enc[3]
        ].join('')
    outa.join('')
  decode: (input) ->
    

    i = 0
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '')
    while i < input.length
      enc1 = @_keyStr.indexOf(input.charAt(i++))
      enc2 = @_keyStr.indexOf(input.charAt(i++))
      enc3 = @_keyStr.indexOf(input.charAt(i++))
      enc4 = @_keyStr.indexOf(input.charAt(i++))
      chr1 = enc1 << 2 | enc2 >> 4
      chr2 = (enc2 & 15) << 4 | enc3 >> 2
      chr3 = (enc3 & 3) << 6 | enc4
      output = output + String.fromCharCode(chr1)
      if enc3 != 64
        output = output + String.fromCharCode(chr2)
      if enc4 != 64
        output = output + String.fromCharCode(chr3)
    output = @_utf8_decode(output)
    output
  _utf8_encode: (string) ->
    string = string.replace(/\r\n/g, '\n')
    utftext = ''
    n = 0
    while n < string.length
      c = string.charCodeAt(n)
      if c < 128
        utftext += String.fromCharCode(c)
      else if c > 127 and c < 2048
        utftext += String.fromCharCode(c >> 6 | 192)
        utftext += String.fromCharCode(c & 63 | 128)
      else
        utftext += String.fromCharCode(c >> 12 | 224)
        utftext += String.fromCharCode(c >> 6 & 63 | 128)
        utftext += String.fromCharCode(c & 63 | 128)
      n++
    utftext
  _utf8_decode: (utftext) ->
    string = ''
    i = 0
    c = c1 = c2 = 0
    while i < utftext.length
      c = utftext.charCodeAt(i)
      if c < 128
        string += String.fromCharCode(c)
        i++
      else if c > 191 and c < 224
        c2 = utftext.charCodeAt(i + 1)
        string += String.fromCharCode((c & 31) << 6 | c2 & 63)
        i += 2
      else
        c2 = utftext.charCodeAt(i + 1)
        c3 = utftext.charCodeAt(i + 2)
        string += String.fromCharCode((c & 15) << 12 | (c2 & 63) << 6 | c3 & 63)
        i += 3
    string
    
if !root['console']
    root['console'] =
        data: []
        log: ($txt) ->
            #this.data.push($txt);
            return