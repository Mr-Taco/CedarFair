global = require './global.coffee'


module.exports.selectBox = () ->
    $el = $('#news #select-news')

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
