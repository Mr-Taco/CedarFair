

class VideoOverlay



    constructor: (el) ->
        @$el = $(el)
        @$inner = @$el.find(".overlay-inner")
        @$container = @$el.find(".overlay-inner-container")
        
        if (@$container.find('.overlay-content').size() is 1) 
            @$container = @$container.find('.overlay-content')
            
        @$close = @$el.find(".overlay-close")
        

        @createVideoInstance()
        @createOverlayTransition()
        @addEvents()



    createOverlayTransition: ->
        @tl = new TimelineMax

        @$el.show()

        @tl.add TweenMax.fromTo $('#overlay'), .01,
            {zIndex: -1, display:'none', z: 0}, {zIndex: 5000, display:'block', z: 9999999999}
        
        @tl.add TweenMax.to @$el , .35 ,
            autoAlpha:1

        @tl.add TweenMax.to @$inner , .55 ,
            alpha:1

        @tl.add TweenMax.to @$close , .25 ,
            alpha:1
        ,
            "-=.15"

        @tl.addLabel("initContent")

        @tl.stop()

    createVideoInstance: () ->



    addEvents: ->
        @closeEvent = new Hammer(@$close[0])



    transitionInOverlay: (next) ->
        console.log 'transitionInOverlay'
        @transInCb = next
        @tl.addCallback(@transInCb, "initContent")
        @tl.play()
        @closeEvent.on 'tap' , @closeOverlay

    transitionOutOverlay: ->
        console.log 'transitionOutOverlay'
        @closeEvent.off 'tap' , @closeOverlay
        @tl.removeCallback(@transInCb)
        @tl.reverse()
        delete @transInCb


    closeOverlay: (e) =>
        @removeVideo()
        @transitionOutOverlay()


    removeVideo: () ->
        if @videoInstance
            @videoInstance.pause()
            @videoInstance.currentTime(0)
            #@videoInstance.dispose()

    resizeOverlay: () ->
        $vid = @$el.find('video')
        $w = window.innerWidth
        $h = $vid.height()

        # @$inner.css {width: $w, height: $h}
        # $vid.css {height: 100 + '%', width: 100 + '%'}

    appendData: (data) ->
        if data.mp4 == "" or ! data.mp4?
            console.log 'no video, its an image'
            @poster = $("<div class='video-js'><img class='vjs-tech' src='" + data.poster + "' class='media-image-poster' /></div>")
            @$container.html @poster
            @poster.css 'height', '100%'
            @removeVideo()
                
            return false

        mp4 = $("<source src=\"#{data.mp4}\" type=\"video/mp4\" /> ")
        webm = $("<source src=\"#{data.webm}\" type=\"video/webm\" /> ")

        @$videoEl = $("<video id='overlay-player' class='vjs-default-skin video-js' controls preload='auto' />")
        @$videoEl.append(mp4)
        @$videoEl.append(webm)
        @$container.html @$videoEl

        if @videoInstance?
            @videoInstance.dispose()
        @videoInstance = videojs "overlay-player"  ,
            width:"100%"
            height:"100%"




    playVideo: () =>
#        if(!$("html").hasClass('mobile'))
#            @videoInstance.play()
        if @videoInstance?
            @videoInstance.play()
            
    showImage: () =>
        console.log 'showImage'



overlay = new VideoOverlay "#overlay"





module.exports.initVideoOverlay = (data) ->
    console.log 'data2: ', data
    overlay.appendData(data)


    if !(data.mp4 == "")
        console.log 'data.mp4 !== ""'
        overlay.transitionInOverlay(overlay.playVideo)
    else
        console.log 'data.mp4 === ""'
        overlay.transitionInOverlay(overlay.showImage)











