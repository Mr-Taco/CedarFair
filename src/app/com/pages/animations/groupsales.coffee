global = require './global.coffee'

module.exports.topHeadline = () ->

    $el = $('#group-sales')

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
    $el = $("#group-sales .circ-btn-wrapper")

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
    $el = $('#group-sales #select')

    tween = new TimelineMax

    tween.add TweenMax.fromTo($el, .35,
        opacity: 0
        ,scale: .75
    ,
        opacity: 1
        ,scale: 1
    ), 0.25

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


module.exports.offeringsTestimonials = () ->
    $el = $('#testimonials')

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
