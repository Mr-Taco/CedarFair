

#Count
commas = (x) ->
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")


module.exports.count = (el) ->
    
    
    $el = $(el)
    targetVal = $(el).html()
    num = $(el).text().split(',').join('')

    start = num * .9995
    change = num * .0005
    
    tl = new TimelineMax
        onStart: ->
            $el.html("42")
        onComplete: ->
            $el.html(targetVal)
            
    tweens = []

        

    tweens.push TweenMax.fromTo $el , 0.25,        
        autoAlpha:0
        immediateRender:true
        ease:Quint.easeOut
    ,
        autoAlpha:1

    tweens.push TweenMax.to $el , 1.5, 
        ease:Quint.easeOut
        
        onUpdate: ->
            value = parseInt(start + parseInt(change * @progress()))
            value = commas(value)
            els = value.split('')
            html = ''
            $.each els, (name, value) ->
                html += if (value is ',') then ',' else '<span>' + value + '</span>'
            $el.html(html)
            
            
    tl.add tweens
    
    tl

#Scrolling



tweenParallax = (pos,tween,min,max,dur) ->



    percent = ((pos-min) / (max-min)) * 1
    amount = percent * dur



    if pos <= max and pos >= min
        #console.log percent , tween.ns.name , pos
        if Math.abs(amount - tween.time()) >= .001
            tween.tweenTo  amount ,
                overwrite:"preexisting",
                ease:Quad.easeOut


module.exports.clouds = (setId, min, max, dur) ->

    minPos = min
    maxPos = max
    duration = dur

    $el = $(".clouds#{setId}")
    clouds = $el.find(".cloud")

    tween = new TimelineMax
    tween.ns = {}
    tween.ns.name = setId

    tweens = []
    for cloud,i in clouds
        offset = "+=#{250*(i+1)}"


        tweens.push TweenMax.to cloud , duration ,
            y:offset



    tween.add tweens



    tween.paused(true)
    return (pos) ->
        tweenParallax pos , tween , minPos, maxPos, duration

module.exports.scroll = (minPos, maxPos, duration, elem) ->

    tween = new TimelineMax
    tween.ns = {}
    tween.ns.name = ".scrollto"
    
    tweens = []
    tweens.push TweenMax.to elem , duration , opacity:0
    
    tween.add tweens
    
    tween.paused(true)
    return (pos) ->
        tweenParallax pos , tween , minPos, maxPos, duration
        
module.exports.arms = (min, max, dur) ->

    minPos = min
    maxPos = max
    duration = dur

    arm = $(".arms")

    tween = new TimelineMax
    tween.ns = {}
    tween.ns.name = ".arms"

    tweens = []
    tweens.push TweenMax.to arm , duration , top:0



    tween.add tweens



    tween.paused(true)
    return (pos) ->
        tweenParallax pos , tween , minPos, maxPos, duration
