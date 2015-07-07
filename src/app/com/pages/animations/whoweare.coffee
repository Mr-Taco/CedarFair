
global = require './global.coffee'


module.exports.topHeadline = () ->
    $el = $('#who-we-are.section-inner')
    
    tween = new TimelineMax
    
    for child,i in $el.find('.title-bucket:first-child').children()
        tween.add TweenMax.fromTo($(child) , .35 , 
            y: -25
            ,alpha: 0
        ,
            y: 0
            ,alpha: 1
        ), (0 + .1*i)
        
    tween.add TweenMax.fromTo($el.find('.top-headline a.btn'), .35 ,
        alpha: 0
        ,scale: 0.5
    ,
        alpha: 1
        ,scale: 1, 
        onComplete: =>
            $el.find('.top-headline a.btn').css('transform', '')
    ), "-=.2"

    a:tween
    offset:$el.offset().top
    
    
module.exports.mainVideo = ->
    $el = $('#who-we-are #player-container')
    
    tween = new TimelineMax
    
    tween.add TweenMax.fromTo($el.find('li'), .5 ,
        alpha: 0
        ,y: 10
    ,
        alpha: 1
        ,y: 0
    )


    tween.paused(true)
        
    a:tween
    offset:$el.offset().top
    
    
module.exports.bottomHeadline = ->
    $el = $('#who-we-are .title-bucket.six')
    
    tween = new TimelineMax
    
    tween.add TweenMax.fromTo($el.find('h1'), .35 ,
        y: -25
        ,alpha: 0
    ,
        y: 0
        ,alpha: 1
    )
    
    
    tween.add TweenMax.fromTo($el.next().find('a'), .35 ,
        alpha: 0
        ,scale: 0.5
    ,
        alpha: 1
        ,scale: 1,
        onComplete: =>
            $el.next().find('a').css('transform', '')
    ), "-=.2"

    tween.paused(true)
    
    a:tween
    offset:$el.offset().top
