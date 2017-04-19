root=exports ? this

dev_mode=false
test_mode=true

app_path='./'

rq=require 'request'



param=(req,$name)->
    req.query[$name] || req.body[$name]
    
params=(req,$names)->
    $p={}
    for $name in $names
        $v=req.query[$name] || req.body[$name]
        if $v
            $p[$name]=$v
    $p

root.c =(router)->
    api=
        
        rest:(req,res,get_nx)->
            $method=param(req,'method') or 'GET'
            $url=param req,'url'
            $data=param(req,'data') or {}
            if $url
                $nx=do get_nx
                rq 
                    url:$url
                    body:$data
                    json:true
                    method:$method
                ,($err,$r,$body)->
                    res.data=$body
                    do $nx
            else
                
                res.data['err']='no url'
        test:(req,res,get_nx)->
            res.data['err']='hello'
    api
