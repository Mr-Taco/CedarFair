PluginBase = require '../../abstract/PluginBase.coffee'
FramesModel = require './FramesModel.coffee'

matchFrameNum = /\d+(?=\.[a-zA-Z]+)/

class FrameAnimation extends PluginBase
    
    
    constructor: (opts) ->
        
        @$el = $(opts.el)
        @async = opts.async or false
        depth= opts.depth or 1
        @$container = $("<div class='coaster-container' />")
        @$container.attr('id' , opts.id)
        @$container.css('z-index', depth)
        TweenMax.set @$container , 
            z:depth * 10
        
        super(opts)
        
        
    
    initialize: (opts) ->
        super(opts)
        
        @model = new FramesModel opts
        @model.on "dataLoaded" , @setupCanvas
        @model.on "trackLoaded" , @onTrackLoaded
        @model.on "framesLoaded" , @onFramesLoaded
        @model.loadData()
        
   
       
    loadFrames: ->
        if @model.data?
            @model.preloadFrames()
        else
            @deferLoading = true
        
    
    
    setupCanvas: =>

        @canvasWidth = @model.get('global').width
        @canvasHeight = @model.get('global').height
                
        @canvas = document.createElement("canvas")
        @context = @canvas.getContext('2d')
        
        @canvas.setAttribute('width' , @canvasWidth)
        @canvas.setAttribute('height' , @canvasHeight)

        @$container.append(@canvas)
        @$el.prepend(@$container)
        @model.preloadTrack()
        if @deferLoading
            @model.preloadFrames()
            
        
    
    displayTrack: ->
        
        @context.clearRect 0 , 0 , @canvasWidth , @canvasHeight
        @context.drawImage @trackImage.tag , 0 ,0 , @canvasWidth , @canvasHeight
        
    displayFrame: (num) ->
        
        manifest = @model.get('manifest')
        
        if manifest.length > num
            asset = manifest[num] 
            frameAsset = @model.getAsset(asset.filename)
            # console.log frameAsset.tag , asset.x , asset.y, asset.width, asset.height
            @context.drawImage frameAsset.tag , asset.x , asset.y, asset.width, asset.height
        
        
        
        
        
    initAnimation: ->
        
        
        frames = @model.get('manifest').length
        speed = @model.get('global').fps
        delay = @model.get('global').delay or 0
        repeatDelay = @model.get('global').repeatDelay or 10
        
    

        duration =  frames / speed


        self = @ 
        @lastFrameNum = -1
        @timeline = window.coaster = TweenMax.to @canvas , duration , 
            onUpdate: ->
                frameNum = Math.floor(frames * @progress())                
                if frameNum isnt @lastFrameNum       
                    self.displayTrack()
                    self.displayFrame(frameNum)
                    
                @lastFrameNum = frameNum
            repeat:-1
            repeatDelay: repeatDelay
            delay:delay
               
               
                

      
                
        
        
    
    onTrackLoaded: =>

        @trackImage = @model.getAsset('track')
        @displayTrack()
        

    onFramesLoaded: =>
        if typeof @async is 'function'
            @async()
        $(window).on 'scroll',  @checkCoasterVisibility
        @checkCoasterVisibility()
    
        
    checkCoasterVisibility: =>
        
        if(@inViewport())

            $(window).off 'scroll',  @checkCoasterVisibility
            @initAnimation()
            
            
            
            
            
        
    inViewport: =>
        
        top = @$container.offset().top
        height = @$container.find('canvas').first().height()
        bottom = top + height
        
        scrollTop = $(window).scrollTop()
        scrollBottom = $(window).scrollTop() + $(window).height()

        if scrollTop <= top <= scrollBottom
            true
        else
            false
        
 

module.exports = FrameAnimation
