global = require './global.coffee'

module.exports.topHeadline = () ->

    $el = $('#offerings')

    tween = new TimelineMax

    tween.add TweenMax.fromTo($el.find('.top-headline .title-bucket h1'), .35,
        y: -10
        ,alpha: 0
    ,
        y: 0
        ,alpha: 1
    ), 0.5

    tween.add TweenMax.fromTo($el.find('.top-headline .title-bucket h2'), .35,
        y: -10
        ,alpha: 0
    ,
        y: 0
        ,alpha: 1
    ), "-=.3"   
   
    tween.add TweenMax.fromTo($el.find('.top-headline .title-bucket h3'), .35,
        y: -10
        ,alpha: 0
    ,
        y: 0
        ,alpha: 1
    ), "-=.3"


    a: tween
    offset:$el.offset().top


module.exports.scrollCircle = ->
    $el = $("#offerings .circ-btn-wrapper")

    tween = new TimelineMax

    tween.add TweenMax.fromTo($el.find("p") , .3 ,
        autoAlpha:0
    ,
        autoAlpha:1
    )

    tween.add TweenMax.fromTo($el.find("a") , .45 ,
        scale:0
        rotation:180
        immediateRender:true
    ,
        scale:1
        rotation:0
        ease:Back.easeOut
    ) , "-=.2"

    a: tween
    offset:$el.offset().top
    

module.exports.selectBox = () ->
    $el = $('#offerings #select-offerings')
    rotation = 0

    tween = new TimelineMax

    tween.add TweenMax.fromTo($el, .35,
        opacity: 0
        ,scale: .75
    ,
        opacity: 1
        ,scale: 1
    )
    
    for offering,i in $el.find('.offerings-option')
        if i%2 == 0
            rotation = -90
        else
            rotation = 90
            
        tween.add TweenMax.fromTo($(offering), .2,
            rotationY: rotation
        ,
            rotationY: 0
        ), 0.5 + (i*.1)


    tween.paused(true)

    a:tween
    offset:$el.offset().top
