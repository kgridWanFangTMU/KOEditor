# LazyR Node Framework

#config
app_path=__dirname+'/'
cfg_path=__dirname+'/cfg/'
log_path=app_path+'log'
#port=8088
cfg=
    port:8088
    cron_enable:true
    multithread:true
    max_thread_num:1
    controllers:[]
fs=require 'fs'


    
load_json = ($fp)->
    try
        $jstr=fs.readFileSync $fp
        $j=JSON.parse $jstr
        #console.log $j
        if typeof($j) is 'object'
            
            $j
        else
            {}
    catch e
        #console.log e
        {}
        

load_sv_cfg=($add_cfg)->
    console.log 'Loading config...'
    Object.assign cfg,load_json(cfg_path+'sv.json')
    #c2=load_json(cfg_path+'sv.local.json')
    
    Object.assign cfg,load_json(cfg_path+'sv.local.json')
    if $add_cfg
        if not Array.isArray($add_cfg)
            $add_cfg=[$add_cfg]
        
        #console.log load_json(cfg_path+$add_cfg)
        for $cfg in $add_cfg
            console.log $cfg
            Object.assign cfg,load_json(cfg_path+$cfg)
        #console.log cfg
    console.log 'Config loaded.'
    cfg


#controllers
###
ctler=[
    #'rt_his'
	#'mosaiq'
    'duty'
    'ret_shift'
    'lab_dept'
]
###

cron=
    jobs:{}
    add:($name,$job)->
        console.log 'cron:add job:',$name
        $job['name']=$name
        @jobs[$name]=$job
    start:->
        console.log 'cron:start'
        for $name,$job of @jobs
            if $job['inited'] isnt true
                if typeof($job.target) is 'function'
                    ###
                    $work_fn= do ($job)->
                        $job.target.bind $job
                        $job.target
                    ###
                    #$work_fn=$job.target
                    #$work_fn.bind $job
                    $job.target.bind
                    $work_fn =$job.target.bind $job
                else
                    $c=$job['c']
                    if $c[$job.target]
                        $work_fn = $c[$job.target].bind $c #,{},{'data':null}
                        #$work_fn.bind $c
                    else
                        console.log 'cron:err method not found for',$name,':',$job.target
                        
                
                
                $job.inited=true
                if $job['start']
                    $delay=5*1000
                    if $job['start'].indexOf(':')>-1
                        
                        [$hour,$min]=$job['start'].split(':').map (x)->parseInt(x,10)
                        $date=new Date()
                        $date.setHours $h
                        $date.setMinutes $min
                        $date.setMilliseconds 0
                        $delay=$date-Date.now()
                        if $delay<0
                            $delay+=60*60*24*1000
                    setTimeout do ($job,$work_fn)->
                        ->
                            try
                                console.log 'cron job:first'
                                do $work_fn
                            catch e
                                console.log 'crone error:',e
                            if $job['every']
                                console.log 'cron setup :setInterval'
                                setInterval ->
                                    try
                                        do $work_fn
                                    catch e
                                        console.log 'crone error:',e
                                ,$job.every*1000
                        
                    ,$delay
                else
                    #console.log 'setIntervel',$work_fn,$job.every*1000
                    setInterval do ($work_fn)->
                        ->
                            try
                                do $work_fn
                            catch e
                                console.log 'crone error:',e
                    ,$job.every*1000
#load controller to router
load_c= (c,$http=true,$cron=true,$force=false)->
    if $http
        express=require 'express'
        router=express.Router()
    else
        router={}
    c_path=require.resolve app_path+'c/'+c+'.js'
    console.log "Load_C : #{c} -> #{c_path}"
    console.log "HTTP: #{$http}, CRON: #{$cron}"
    if $force
        console.log "Load_C : Force Mode"
        if require.cache[c_path]
            console.log "Load_C : Force Delete #{c_path}"
            delete require.cache[c_path]
            
    c_mod=require(c_path)
    c_obj=c_mod.c(router)
    
    if $http
        if c_mod['session_enable']
            cookieSession = require 'cookie-session'
            router.use (cookieSession 
                name:"sess_#{c}"
                keys:["key_#{c}"]
                maxAge: c_mod['session_age'] || 24 * 60 * 60 * 1000 #1 day
                #httpOnly:false
                #signed:false
            )
        for act,fn of c_obj
            $rout_fns=[]
            if ['pre'].indexOf(act) >-1
                continue
            if c_obj['pre']
                $rout_fns.push do (act)->(req,res,nx)->
                    req['act']=act
                    c_obj['pre'] req,res,nx
            if typeof(fn) is 'function'
                #wrap all act with next()
                r_fn= (self,act,fn) ->
                    (req,res,nx) ->
                        res.data={}
                        #console.log typeof(fn)
                        #console.log act,fn
                        fn.call self,req,res, -> #get_nx()
                            nx.called=true
                            nx
                        if not nx['called']
                            nx()
                        else 
                            console.log 'called'
                        return

                $rout_fns.push do (c_obj,act,fn)->
                    (req,res,nx) ->
                        res.data={}
                        
                        fn.call c_obj,req,res, -> #get_nx()
                            nx.called=true
                            nx
                        if not nx['called']
                            nx()
                        else 
                            console.log 'called'
                        return
            else
                #warp var to show-function
                r_fn= (self,act) ->
                    (req,res,nx) ->
                        res.data={}
                        res.data[act]=self[act]
                        nx()
                        return
                #router.use '/'+act,r_fn(c_obj,act)
                $rout_fns.push r_fn(c_obj,act)
            router.use '/'+act,$rout_fns
        if not c_obj['view']
            #set default view
            c_obj['view']=  (req,res)->
                if res['view']
                    switch res['view']
                        when 'text-json'
                            res.type 'text/plain'
                            res.jsonp res['data']
                        when 'xml'
                            res.type 'text/xml'
                            res.send res['data']
                        when 'json','jsonp'
                            res.jsonp res['data']
                        when 'file'
                            #if res['data']['header']
                            #    res.set res['data']['header']
                            if res['data']['name']
                                res.append 'Content-Disposition',"attachment;filename=#{res['data']['name']}"
                            if res['data']['type']
                                res.type res['data']['type']
                            else 
                                res.type 'application/octet-stream'
                            res.send res['data']['content']
                        else
                            res.send res['data']
                else
                    res.jsonp res['data']
        router.use c_obj.view.bind(c_obj)
    if $cron
        if c_mod['cron']
            for $cr_name,$job of c_mod['cron']
                $job['c']=c_obj
                cron.add "#{c}-#{$cr_name}",$job
    {
        router:router
        mod:c_mod
        api:c_obj
    }

run_server =($http=true,$cron=true) ->
    if $http
        express=require 'express'
        bodyParser = require 'body-parser'
        morgan = require 'morgan'
        compression = require 'compression'
        
        app=express()
        #server = require('http').createServer(app)
        #log router
        if cfg['log']
            try
                FileStreamRotator = require 'file-stream-rotator'
                accessLogStream = FileStreamRotator.getStream 
                    date_format: 'YYYYMMDD'
                    filename: log_path + '/access-%DATE%.log'
                    frequency: 'daily'
                    verbose: false

                app.use(morgan('combined', {stream: accessLogStream})) #logger
            catch $log_err
                console.log 'log err',$log_err
        #session
        
        #compression router
        app.use(compression())
        #multipart router
        app.use(bodyParser.json({limit: '5mb'}))
        app.use(bodyParser.urlencoded({ extended: true,limit: '5mb' }))
        #hook controller
        $ctls={}
        for c in cfg.controllers
            $ctl=load_c(c,$http,$cron)
            $ctls[c]=$ctl
            app.use '/'+c,  $ctl.router

        
        #reload controller
        app.use '/reload/:c',(req,res,nx)->
            c=req.params['c'] 
            if c
                if c in ctler
                    load_c c, true
                    res.send c+ 'reloaded'
                else
                    r_list=( rn for rn,m of require.cache)
                    res.send r_list
        

        #static
        $1day_ms=86400000
        $static_age=15
        $static_lib_age=365
        if cfg['degug']
            $static_age=0
        set_static = ($rel_path,$days=0,$etag=true)->
            app.use $rel_path,express.static(app_path + 'static'+$rel_path,{'maxAge':$1day_ms*$days,'lastModified':false,'etag':$etag})
        set_static '/js',$static_age
        set_static '/css',$static_age
        
        $static_root_opt={}
        if cfg['static_index']
            console.log 'static_index',cfg['static_index']
            $static_root_opt['index']=cfg['static_index']
        app.use express.static(app_path + 'static',$static_root_opt)
        #run server
        server=app.listen process.env.PORT || cfg.port
        
        console.log 'Listening port :',process.env.PORT || cfg.port
    if $cron
        do cron.start
cfg = load_sv_cfg(process.argv[2..])
console.log cfg 

    
#Cross cluster cache
if cfg.multithread
    cluster = require 'cluster'
    CPUs = require('os').cpus()
    if cluster.isMaster
        
        for cpu,i in CPUs
            env_cfg=
                worker_no:i
                http_enable:true
                cron_enable:false
                cfg:cfg
            if i is 0
                if cfg.cron_enable
                    env_cfg.cron_enable=true
            if i<cfg.max_thread_num
                console.log env_cfg
                cluster.fork {'env_cfg':JSON.stringify(env_cfg)}
        cluster.on 'exit', (worker, code, signal)->
            console.log "worker #{worker.id} dead"
        cluster.on 'online',($worker)->
            console.log "worker #{$worker.id} online"
        
        
    else
        env_cfg=JSON.parse process.env['env_cfg']
        console.log  env_cfg
        cfg = env_cfg['cfg']
        run_server env_cfg['http_enable'],env_cfg['cron_enable']
else
    
    run_server cfg['http_enable'],cfg['cron_enable']