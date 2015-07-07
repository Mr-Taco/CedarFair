global = require './global.coffee'


module.exports.topHeadline = () ->

    $el = $('#sponsorships')

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

    tween.add TweenMax.fromTo($el.find('.top-headline .title-bucket p'), .35,
        y: -10
        ,alpha: 0
    ,
        y: 0
        ,alpha: 1
    ), "-=.3"



    a: tween
    offset:$el.offset().top


module.exports.scrollCircle = ->
    $el = $("#sponsorships .circ-btn-wrapper")

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
    $el = $('#sponsorships #select')

    tween = new TimelineMax

    tween.add TweenMax.fromTo($el, .35,
        opacity: 0
        ,scale: .75
    ,
        opacity: 1
        ,scale: 1
    ), 0.5

    tween.paused(true)
    a:tween
    offset:$el.offset().top


module.exports.s2TopHeadline = () ->
    $el = $('#testimonials')

    tween = new TimelineMax

    tween.add TweenMax.fromTo($el.find('.title-bucket h1'), .35,
        y: -10
        alpha: 0
    ,
        y: 0
        alpha: 1
    )

    tween.add TweenMax.fromTo($el.find('.title-bucket h2'), .35,
        y: -10
        alpha: 0
    ,
        y: 0
        alpha: 1
    ), "-=.3"

    tween.paused(true)
    a:tween
    offset:$el.offset().top
    
    

module.exports.testimonialCircles = () -> 

    $el = $('#testimonials')
    
    tween = new TimelineMax
    
    for slide,i in $el.find('.swiper-container .swiper-slide')
        tween.add TweenMax.fromTo($(slide).find('.circle'), .35,
            rotation: -90
            alpha: 0
            scale: 0
        ,
            rotation: 0
            alpha: 1
            scale: 1
            ease:Back.easeOut
        ,
            .05
        ), (i*.15) 

        tween.add TweenMax.fromTo($(slide).find('a.btn'), .25,
            scale: 0.5
            alpha: 0
        ,
            scale: 1
            alpha: 1
        ), 0.15 + (i*.2)


    tween.paused(true)
    a:tween
    offset:$el.offset().top
