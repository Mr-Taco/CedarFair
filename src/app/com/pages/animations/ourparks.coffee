global = require './global.coffee'

module.exports.topHeadline = () ->
    
    $el = $('#our-parks .inner-title-header')
    
    tween = new TimelineMax
    
    tween.add TweenMax.fromTo($el.find('h1'), .35 ,
        y: -10
        ,alpha: 0
    ,
        y: 0
        ,alpha: 1
    ), 0.5

    tween.add TweenMax.fromTo($el.find('p'), .35 ,
        y: -10
        ,alpha: 0
    ,
        y: 0
        ,alpha: 1
    ), "-=.2"
    
    
    a: tween
    offset:$el.offset().top



module.exports.scrollCircle = ->
    $el = $("#our-parks .circ-btn-wrapper")

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
    
    
    
module.exports.selectBox = ->
    $el = $('#our-parks.section-inner #select')
    
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
    
    
    
module.exports.parksCarousel = () ->
    $el = $('#our-parks-gallery')
    
    tween = new TimelineMax
    
    tween.add TweenMax.fromTo($el.find('.swiper-container'), .35 ,
        alpha: 0
    ,
        alpha: 1
    ), 0.5

    for arrow,i in $el.find('.gal-arrow')
        if i%2 == 0
            distance = -20
        else
            distance = 20

        tween.add TweenMax.fromTo($(arrow), .35 ,
            x: distance
            ,alpha: 0
        ,
            x: 0
            ,alpha: 1
        ), 0

    tween.paused(true)
    a:tween
    offset:$el.offset().top
    
    
