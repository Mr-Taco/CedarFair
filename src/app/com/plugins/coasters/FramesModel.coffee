

matchFrameNum = /\d+(?=\.[a-zA-Z]+)/

class FramesModel extends EventEmitter


    constructor: (opts) ->
        @baseUrl = opts.baseUrl
        @url = opts.url
        @loadManifest = [];
        @trackManifest = [];
        @initLoader()
        super(opts)
        

    loadData: ->
        $.ajax
            url: @baseUrl  + @url
            method: "GET"
            dataType: "json"
            success: @onDataLoaded
            error: @handleError

    handleError: (err) ->
        throw err

    onDataLoaded: (data) =>
        
        @data = data
        @transformData()
        @emit "dataLoaded"
      

    sortSequence: (a,b) ->
        aFrame = matchFrameNum.exec(a.filename)
        bFrame = matchFrameNum.exec(b.filename)
        return if parseInt(aFrame[0]) < parseInt(bFrame[0]) then -1 else 1

    transformData: ->
        @data.manifest.sort @sortSequence
        
        
        @trackManifest.push
            id:"track"
            src: "#{@data.global.folder}/#{@data.global.track}"

        for frame in @data.manifest
            frame.src = "#{@data.global.folder}/#{frame.filename}"
            @loadManifest.push
                id: frame.filename
                src: frame.src

    initLoader: ->
        @trackLoader = new createjs.LoadQueue true, @baseUrl, true
        @preloader = new createjs.LoadQueue true, @baseUrl, true
        @trackLoader.setMaxConnections(10)
        @preloader.setMaxConnections(15)
        
        
        
    preloadTrack: ->

        @trackLoader.addEventListener 'complete' , @onTrackAssetsComplete
        @trackLoader.loadManifest(@trackManifest)
    
    preloadFrames: ->
#        console.log @loadManifest
        
        @preloader.addEventListener 'complete' , @onAssetsComplete
        @preloader.loadManifest(@loadManifest)

    onTrackAssetsComplete: (e) =>
        
        @trackLoader.removeEventListener 'complete' , @onTrackAssetsComplete
        @emit "trackLoaded"

    onAssetsComplete: (e)=>
#        console.log @preloader
        @preloader.removeEventListener 'complete' , @onAssetsComplete
        @emit "framesLoaded"




    getAsset: (id) ->
        
        item =  @preloader.getItem id
        if !item?
            item =  @trackLoader.getItem id        
        return item

    get: (key) ->
        for k,v of @data
            if k is key
                return v

    set: (key, val) ->
        @data[key] = val








module.exports = FramesModel
