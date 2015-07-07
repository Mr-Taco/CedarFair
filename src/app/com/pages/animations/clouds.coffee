
cloudsOnUpdate = (el, duration) ->
    windowWidth = window.innerWidth
    
    TweenMax.set el,
        x: -2050
        
    TweenMax.to el, duration , 
        x: windowWidth
        onComplete: =>
            cloudsOnUpdate el , duration
        


setBobing = ($el , dur,delay) ->
    
    @isTablet = $('html').hasClass 'tablet'
    width = window.innerWidth
    windowWidth = window.innerWidth
    
    if window.innerWidth > 767 && !@isTablet

#        d = ((window.innerWidth + 1550) / window.innerWidth) * 180
        d = 300 - ($el.data('cloud').speed * 250)
        
        TweenMax.to $el , dur , 
            x: width
            delay:delay
            ease:Linear.easeNone
            onUpdateParams: ["{self}"]
            onComplete: (tween) =>
                cloudsOnUpdate $el , d



setRegistration = ($el, registration) ->
    
    values = registration.split("|")
    
    viewportWidth = window.innerWidth
    settings = {}
    
    align = values[0]
    offset = parseInt(values[1]) or 0

    switch align
        when 'left'
            settings.x = 0 + offset
        when 'right'
            settings.x = viewportWidth + offset            
            
        when 'center'
            settings.x = (viewportWidth*.5 - $el.width()*.5) + offset    
    
    TweenMax.set $el , settings
    
    



module.exports = (options) ->
    
    $el = options.$el
    $container = $el.closest('[data-cloud-container]')    
    containerTopPadding = parseInt($container.css('padding-top'))
    
    
    try        
        cloudData = $el.data().cloud
       
    catch e
        console.error "Cloud Data Parse Error: Invalid JSON"        
        
    cloudDepth = $el.data('depth')
    cloudSpeed = cloudData.speed or 1
    cloudOffsetMin = parseInt(cloudData.offsetMin) or 0
    cloudReverse = cloudData.reverse or false
    cloudRegistration = cloudData.register or "center"


    
    setRegistration $el , cloudRegistration
    if !($container.hasClass('splash-container'))
        offLeft = $el.offset().left
        distance = (window.innerWidth - offLeft) / window.innerWidth
#        percentage = distance * 180 
        percentage = 250 - (cloudSpeed * 200)
        
        setBobing $el, percentage, cloudSpeed/5
 
    minY = $container.offset().top
    maxY = $(document).outerHeight()
    totalRange= $container.outerHeight()
    
    
    
    percentageRange = totalRange/maxY
    minRangePercentage = minY/maxY    
    maxRangePercentage = minRangePercentage + percentageRange

#    console.log minRangePercentage , maxRangePercentage


    lastScrollPercentage = presentScrollPercentage = scrollDelta = 0

    if ($container.hasClass('splash-container') && $('html').hasClass('tablet'))
        $container.hide()
        
    
    return (pos) ->
        if (($container.hasClass('splash-container')) && ($('html').hasClass('tablet')))
            TweenMax.to $el , 0.25 ,
                ease:Sine.easeOut
            
        else
            cloudPositionPercentage = (pos - minRangePercentage) / (maxRangePercentage - minRangePercentage)
            if 0 <= cloudPositionPercentage <= 1
                presentScrollPercentage = cloudPositionPercentage
                if cloudReverse               
                    cloudPositionPercentage = 1 - cloudPositionPercentage
                
                cloudY = (totalRange * cloudPositionPercentage) * cloudSpeed
                cloudY = cloudY - containerTopPadding
                cloudY = cloudY + cloudOffsetMin
    
                #Maybe use this?
                scrollDelta = Math.abs(lastScrollPercentage - presentScrollPercentage) * 3
    
                lastScrollPercentage = presentScrollPercentage
                
        
                
                TweenMax.to $el , 0.25 , 
                    y:cloudY
                    ease:Sine.easeOut
                    
            
                    
         
