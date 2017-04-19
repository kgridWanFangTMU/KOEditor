root=window
kgrid=($opt)->
    
    $kg=
        init:->
            @opt=
                server:window.location.href+"stack/"
                proxy:true
            
            $.extend @,event_obj()
            if $opt
                $.extend @opt,$opt
            {
                server:@url
                proxy:@proxy
                
            }=@opt
            @
        api:($method="GET",$ura=["shelf"],$body={})->
            $p=
                url:@url+$ura.join('/')
                method :$method
                data :$body
                dataType  :'json'
            if @proxy
                $.post '/proxy/rest',$p
            else
                $p.processData=false
                $p.data=JSON.stringify $p.data
                $.ajax $p
                
        raise_arg:($event,$data,$arg=[])->
            $arg.unshift $data
            $arg.unshift $event
            
            @raise.apply @,$arg
        arkid:($ko)->
            $id=null
            if $ko['metadata']
                if $ko['metadata']['arkId']
                    $id=$ko['metadata']['arkId']['arkId']
            if not $id
                if $ko['url']
                    $m=$ko['url'].match(/ark\:.+/)
                    if $m
                        $id=$m[0]
            $id
        shelf:($arg...)->
            @api 'GET',["shelf"]
            .done ($j)=>
                
                @ko={}
                for $ko in $j
                    $id=@arkid $ko
                    @ko[$id]=$ko
                @raise_arg 'shelf',@ko,$arg
                
        save:($ko,$arg...)->
            if typeof($ko) is 'string'
                $id=$ko
            else
                $id=@arkid $ko
            
            @api 'PUT',["shelf",$id],$ko
            .done ($j)=>
                @ko[$id]=$ko
                @raise_arg 'save',$j,$arg
                
        run:($ko,$arg...)->
            if typeof($ko) is 'string'
                $id=$ko
            else
                $id=@arkid $ko
            @api 'POST',[]
    do $kg.init

root.kedit=kedit=
    init:->
        @editor=editor = ace.edit "editor_py"
        @editor.setTheme "ace/theme/eclipse"
        @editor.getSession().setMode "ace/mode/python"
        @editor_out=editor_out = ace.edit "editor_out_xml"
        @editor_out.setTheme "ace/theme/eclipse"
        @editor_out.getSession().setMode "ace/mode/xml"
    
        
        @editor_in=editor_in = ace.edit "editor_in_xml"
        @editor_in.setTheme "ace/theme/eclipse"
        @editor_in.getSession().setMode "ace/mode/xml"
        
        @editor_meta=editor_meta = ace.edit "editor_meta"
        @editor_meta.setTheme "ace/theme/eclipse"
        @editor_meta.getSession().setMode "ace/mode/json"
        
        @editor.getSession().on 'change',=>
            @changed true
        @editor_out.getSession().on 'change',=>
            @changed true
        @editor_in.getSession().on 'change',=>
            @changed true
        @editor_meta.getSession().on 'change',=>
            @changed true
        
        @btn_save=$ '#btn_save'
        .on 'click',=>
            $ko=@pack()
            if @kg
                @kg.save $ko
                @dlg_saving=bootbox.dialog 
                    message: '<p class="text-center">Saving to server...</p>',
                    closeButton: false
            else
                bootbox.alert "No server connected"
        do @setSize
        @ko_sel=$ '#ko_sel'
        $(window).on 'resize',=>
            do @setSize
        $('#btn_server').on 'click',=>
            do @dlg_server
        $('#btn_pack').on 'click',=>
            $p=@pack()
            console.log $p
            $o=$ '<textarea  class="form-control" rows="5"></textarea>'
            .val (JSON.stringify $p,null,2)
            bootbox.alert 
                message:$o
                size: 'large'
            false
        
        
        @ko_sel.on 'change',=>
            $opt= @ko_sel.find(":selected")
            $id=$opt.attr('arkid')
            if $id?
                $ko=@kg.ko[$id]
                @load $ko
                
        $hash=window.location.hash
        if $hash
            $server_url=$hash.substr(1)
            @connect $server_url
    connect:($url)->
        delete @kg
        @kg=kgrid 
            server:$url
            proxy:true
        @kg.on 'save',($data)=>
            console.log 'saved'
            @dlg_saving.modal('hide')
        @kg.on 'shelf',($data)=>
            console.log $data
            do @render_ko_sel
        do @kg.shelf
        do @load
    setSize:->
        $wh=$(window).height()
        $sky_ground=158
        #console.log $sky_ground
        #$panel_h=93
        $panel_h=63
        $('#editor_py').height($wh-$sky_ground-$panel_h*2-150)
        $('#editor_in_xml').height(($wh-$sky_ground)/2-$panel_h)
        $('#editor_out_xml').height(($wh-$sky_ground)/2-$panel_h)
        $('#editor_meta').height(150)
    dlg_server:->
        $dlg=bootbox.prompt "Server URL",($url)=>
            if $url
                console.log 'try to connect to',$url
                @connect $url
        #$dlg
        if @kg
            if @kg.url
                $dlg.find '.bootbox-input'
                .val @kg.url
            
    render_ko_sel:()->
        @ko_sel.html('<option>Select Knowledge Object...</option>')
        for $id,$ko of @kg.ko
            
            $opt=$('<option></option>').text $ko['metadata']['title']
            .attr 'arkid',$id
            @ko_sel.append $opt
    changed:($changed=true)->
        if $changed isnt @btn_save['changed']
            @btn_save['changed']
            @btn_save.attr 'disabled',not $changed
    load:($ko={})->
        $meta='{}'
        if $ko['metadata']
            $meta=JSON.stringify $ko['metadata'],null,2
        @editor_meta.setValue $meta 
        @editor_meta.gotoLine 0
        $script=''
        $fn_name=''
        if $ko['payload']
            if $ko['payload']['content']
                $script=$ko['payload']['content']
            if $ko['payload']['functionName']
                $fn_name=$ko['payload']['functionName']
        @editor.setValue $script
        @editor.gotoLine 0
        $('#inp_func_name').val $fn_name
        $url=''
        if $ko['url']
            $url=$ko['url']
        $('#inp_url').val $url
        $in_xml=''
        if $ko['inputMessage']
            $in_xml=$ko['inputMessage']
        @editor_in.setValue $in_xml
        @editor_in.gotoLine 0
        $out_xml=''
        if $ko['outputMessage']
            $out_xml=$ko['outputMessage']
        @editor_out.setValue $out_xml
        @editor_out.gotoLine 0
        #@btn_save.attr 'disabled',true
        @changed false
    pack:->
        $meta_str=@editor_meta.getValue()
        $metadata={}
        if $meta_str
            try
                $metadata=JSON.parse $meta_str
            catch e
                console.log e
        $p=
            metadata:$metadata
            payload:
                content:@editor.getValue()
                engineType:'Python'
                functionName:$('#inp_func_name').val() or "getGuideline"
            inputMessage:@editor_in.getValue()
            outputMessage:@editor_out.getValue()
            url:$('#inp_url').val() or undefined
        $p
        
        
kedit.init()