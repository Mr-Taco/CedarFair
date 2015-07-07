BasicOverlay = require '../plugins/BasicOverlay.coffee'
SvgInject = require '../plugins/SvgInject.coffee'



if window.console is undefined or window.console is null
  window.console =
    log: ->
    warn: ->
    fatal: ->



$(document).ready ->
    #$('.svg-inject').svgInject()
    #new SvgInject ".svg-inject"
    
    basicOverlays = new BasicOverlay
        el: $('#content')


    $('.scrollto').click ->
       t = $(this).data('target')
       $('body').animate({
            scrollTop: $('#'+t).offset().top - 70 # 70 for the collapsed header
        });

    #if window.ddls?
    # console.log 'clicky'
    $(window).click ->
        if window.ddls?
            $.each window.ddls, (i, t) ->
                if t.isOpen and not t.isHovered
                    t.closeMenu()
                    
                    
                    
    $('[data-depth]').each ->
        $el = $(@)
        depth = $el.data().depth
        
        $el.css('z-index', depth)
        TweenMax.set $el , 
            z: depth * 10



    $('body').on 'DOMNodeInserted',  ->
        $('a').each ->                
            href = $(@).attr('href')
            if href?
                href = href.trim()
                if href.indexOf('http://') is 0 or href.indexOf('https://') is 0 or href.indexOf('.pdf') is (href.length - 4)
                    $(@).attr('target', '_blank')


    $('.circle, .circle-outer').on('mouseenter', ->
        TweenMax.to($(this), .35,
            scale: 1.05,
            ease: Power2.easeOut
        )
    )

    $('.circle, .circle-outer').on('mouseleave', ->
        TweenMax.to($(this), .35,
            scale: 1,
            ease: Power2.easeOut
        )
    )

    $('#jobs-gallery .swiper-container li').on('mouseeneter', ->
        console.log 'hello'
    )


# this is shitty, but it's my only workaround for the clipping issue (CF-171)
document.onreadystatechange = () ->
    if (document.readyState is 'complete')
        setTimeout(->
            $('.quote').addClass('keepitahundred')
        , 200)
