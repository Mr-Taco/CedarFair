global = require './global.coffee'


module.exports.topHeadline = () ->

    $el = $('#jobs')

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
    $el = $("#jobs .circ-btn-wrapper")

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


module.exports.parks = ->
    $el = $("#jobs #parks")

    tween = new TimelineMax

    tween.add TweenMax.staggerFromTo($el.find('.title-bucket h1') , .5 ,
        autoAlpha:0 #from
    ,
        autoAlpha:1 #to 
    ,
        .2 #stagger amount    
    )

    tween.add TweenMax.staggerFromTo($el.find('#our-parks-logos li') , .35 ,
        autoAlpha:0
        scale:0
    ,
        autoAlpha:1
        scale:1
    ,
        .05
    ), "-=.4"

    tween.add TweenMax.fromTo($el.find("#our-parks-gallery ul") , .75 ,
        rotationY:180
        autoAlpha:0
    ,
        rotationY:0
        autoAlpha:1
        ease:Back.easeOut
    ), "-=.3"

    tween.paused(true)
    a:tween
    offset:$el.offset().top



module.exports.selectBox = () ->
    $el = $('#jobs #select')

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

    tween.paused(true)
    a:tween
    offset:$el.offset().top    



module.exports.testimonialCircles = () ->

    $el = $('#testimonials')

    tween = new TimelineMax

    for slide,i in $el.find('.swiper-container .swiper-slide')
        target = $(slide).find('.circle-outer')
        tween.add TweenMax.fromTo(target, .35,
            rotation: -90
            alpha: 0
            scale: 0
        ,
            rotation: 0
            alpha: 1
            scale: 1
#            onComplete: =>
#                $('.swiper-slide').css('opacity', '0.25')
#                $('.swiper-slide').addClass('ready')
        ), "-=.2"

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
        ), 1.05

    tween.paused(true)
    a:tween
    offset:$el.offset().top
