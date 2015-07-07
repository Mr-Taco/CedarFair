global = require './global.coffee'

module.exports.topHeadline = () ->
    
    $el = $('#accommodations')
    
    tween = new TimelineMax
    
    tween.add TweenMax.fromTo($el.find('.top-headline .title-bucket h1'), .35,  
        y: -10
        ,alpha: 0
    ,
        y: 0
        ,alpha: 1
    ), 0.5

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
    $el = $("#accommodations .circ-btn-wrapper")

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



    a:tween
    offset:$el.offset().top



module.exports.selectBox = () ->
    $el = $('#accommodations #accommodations-select')

    tween = new TimelineMax

    tween.add TweenMax.fromTo($el, .35,
        opacity: 0
        ,scale: .75
    ,
        opacity: 1
        ,scale: 1
    )

    tween.paused(true)
    a:tween
    offset:$el.offset().top



module.exports.accommodationsCarousel = () ->
    $el = $('#accommodations-gallery')

    tween = new TimelineMax

    tween.add TweenMax.fromTo($el, .35 ,
        alpha: 0
    ,
        alpha: 1
    )

    tween.paused(true)
    a:tween
    offset:$el.offset().top
