
global = require './global.coffee'



#Triggers

module.exports.funToUsTween = () ->
    $el = $("#who-we-are .title-bucket")
    tween = TweenMax.fromTo $el , .8 ,
            rotationX:180
            autoAlpha:0
        ,
            rotationX:0
            autoAlpha:1
            ease:Back.easeOut

    a:tween
    offset:$el.offset().top


module.exports.scrollCircle = ->
    $el = $("#who-we-are .circ-btn-wrapper")

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
    
    
module.exports.parks = ->
    $el = $("#our-parks")

    tween = new TimelineMax

    tween.add TweenMax.staggerFromTo($el.find('.title-bucket h1 , .title-bucket h2') , .5 , 
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
    
    
module.exports.jobs = ->
    $el = $("#jobs-section")

    tween = new TimelineMax

    tween.add TweenMax.staggerFromTo($el.find('.title-bucket h1 , .title-bucket h2') , .5 , 
            autoAlpha:0 #from
        ,
            autoAlpha:1 #to 
        ,
            .2 #stagger amount    
    )

    tween.add TweenMax.staggerFromTo($el.find('.swiper-container li') , .5 ,         
            autoAlpha:0
            scale:0
            rotation:180
        ,
            autoAlpha:1
            scale:1
            rotation:0
            ease:Back.easeOut            
        ,
            .05    
    ), "-=.4"

    tween.add TweenMax.staggerFromTo($el.find(".btn-wrapper a") , .75 ,        
            autoAlpha:0
        ,
            autoAlpha:1
    
        ,
            .2    
    ), "-=.3"


    tween.paused(true)

    a:tween
    offset:$el.offset().top


module.exports.groups = ->
    $el = $("#group-sales")

    tween = new TimelineMax
    
    tween.add TweenMax.staggerFromTo($el.find('.title-bucket h1 , .title-bucket h2') , .5 ,
            autoAlpha:0 #from
        ,
            autoAlpha:1 #to 
        ,
            .2 #stagger amount    
    )
    
    tween.add TweenMax.staggerFromTo($el.find('.draggable-container li') , .35 ,
            autoAlpha:0
            scale:0
            rotation:180
        ,
            autoAlpha:1
            scale:1
            rotation:0
            ease:Back.easeOut
        ,
            .05
    ), "-=.4"

    tween.add TweenMax.staggerFromTo($el.find(".btn-wrapper a") , .75 ,
            autoAlpha:0
        ,
            autoAlpha:1
        ,
            .2

    ), "-=.3"


    tween.paused(true)

    a:tween
    offset:$el.offset().top



module.exports.accomodations = ->
    $el = $("#accommodations")

    tween = new TimelineMax
    
    
    tween.add global.count($el.find('.title-bucket h1'))

    tween.add TweenMax.fromTo($el.find('.title-bucket h2 , .title-bucket h3') , .5 ,
        autoAlpha:0 #from
    ,
        autoAlpha:1 #to 
    ,
        .2 #stagger amount    
    ), "-=1.2"

    tween.add TweenMax.staggerFromTo($el.find(".btn-wrapper a") , .75 ,
        autoAlpha:0
    ,
        autoAlpha:1
    ,
        .2

    ), "-=.3"

    tween.add TweenMax.fromTo($el.find("#accommodations-carousel") , .75 ,
        rotationY:180
        alpha:0
        scale: 0.5
    ,
        rotationY:0
        alpha:1
        scale: 1
        ease:Back.easeOut
    ,
        .2
    ), 0.5


    tween.paused(true)

    a:tween
    offset:$el.offset().top
    
    
    
module.exports.seasonal = ->
    $el = $("#seasonal")
    
    tween = new TimelineMax
    
    tween.add TweenMax.fromTo($el.find(".overlay"), .85 ,  
        scale: 0.85
    ,
        scale: 1
    )
    
    
    tween.add TweenMax.fromTo($el.find(".halloween-text") , .2 ,
        scale: 2
        ,z: 500
        ,alpha: 0
    , 
        scale: 1
        ,z: 1
        ,alpha: 1
    ), 0
    
    letters = []
    letters[0] = $el.find('.haunt-text div').get(0)
    letters[1] = $el.find('.haunt-text div').get(3)
    letters[2] = $el.find('.haunt-text div').get(2)
    letters[3] = $el.find('.haunt-text div').get(4)
    letters[4] = $el.find('.haunt-text div').get(1)

    
    for letter,i in letters
        rotation = 0
        
        if i%2 == 0
            rotation = 30
        else
            rotation = -30
            
        tween.add TweenMax.fromTo($(letter) , .35 , 
            opacity: 0
            ,ease: Power0.easeNone
            ,y: -15
        ,
            opacity: 1
            ,y: 0
        ), (1.15 + i*0)

        
    tween.add TweenMax.fromTo($el.find(".fiftyfive"), .35 ,
        alpha: 0
        ,y:-15
    ,
        alpha: 1
        ,y: 0
    ), 1.5

    tween.add TweenMax.fromTo($el.find(".sightofblood"), .35 ,
        alpha: 0
        ,y:-15
    ,
        alpha: 1
        ,y: 0
    ), 1.85

    tween.add TweenMax.fromTo($el.find(".waitforhaunt"), .35 ,
        alpha: 0
        ,y:-15
    ,
        alpha: 1
        ,y: 0
    ), 2.2



    ###=============== ARMS ==============###
    ###=============== ARMS ==============###
    ###=============== ARMS ==============###

    totalParticles = 34
    particlesAdded = 0

    
    while particlesAdded < totalParticles
        className = 'HAUNT_PARTICLES-01_' + particlesAdded.toString()
        if particlesAdded < (totalParticles - 1)
            tween.add TweenMax.set($el.find(".particle-sprite") ,
                css: {className: '+=' + className}
                delay: (.003*particlesAdded)
            ), 2.5 + (.05*particlesAdded) 
            particlesAdded++
        else
            tween.add TweenMax.set($el.find(".particle-sprite") ,
                css: {className: '+=' + className}
                delay: (.003*particlesAdded)
                onComplete: =>
                    $el.find(".particle-sprite.left").removeClass().addClass('particle-sprite').addClass('left')
                    $el.find(".particle-sprite.right").removeClass().addClass('particle-sprite').addClass('right')
            ), 2.5 + (.05*particlesAdded)
            particlesAdded++
        
            
        
    tween.add TweenMax.set($el.find(".arms.left") , 
        y: 1000
    ), 0
            
    tween.add TweenMax.to($el.find(".arms.left") , .15 ,
        y: 550
        ,x:-15
        ,ease: Power1.easeIn
    ), 2.5

    tween.add TweenMax.to($el.find(".arms.left") , .4 ,
        y: 350
        ,rotation: 10
        ,x: 15
        ,ease: Power1.easeIn
    ), 2.65

    tween.add TweenMax.to($el.find(".arms.left") , .4 ,
        y: 0
        ,rotation: 0
        ,x: 0
        ,ease: Power1.easeIn
    ), 3.05

    
    tween.add TweenMax.set($el.find(".arms.right") , 
        y: 1000
    ), 0
    
    tween.add TweenMax.to($el.find(".arms.right") , .15 ,
        y: 550
        ,rotation: -10
        ,x: 15
        ,ease: Power0.easeNone
    ), 2.65


    tween.add TweenMax.to($el.find(".arms.right") , .4 ,
        y: 350
        ,x: -15
        ,ease: Power0.easeNone
    ), 2.8

    tween.add TweenMax.to($el.find(".arms.right") , .4 ,
        y: 0
        ,rotation: 0
        ,x: 0
        ,ease: Power1.easeIn
    ), 3.2


    bloods = []
    bloods[0] = $el.find('.haunt-text img.blood').get(0)
    bloods[1] = $el.find('.haunt-text img.blood').get(3)
    bloods[2] = $el.find('.haunt-text img.blood').get(2)
    bloods[3] = $el.find('.haunt-text img.blood').get(4)
    bloods[4] = $el.find('.haunt-text img.blood').get(1)
    
    for blood,i in bloods
        tween.add TweenMax.fromTo($(blood), .15 ,
            alpha: 0
            ,y:0
            ,scale: 1
        ,
            alpha: 1
            ,y: 0
            ,scale: 1
        ), (0.85 + i*.215)


    tween.paused(true)

    a:tween
    offset:$el.offset().top
    
    
    
    
