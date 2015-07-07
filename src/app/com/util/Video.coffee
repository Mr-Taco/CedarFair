

class Video
    
    videos: []



    constructor: (videos) ->
        @videos = videos

        if window.isTierTablet
            for video in @videos
                $(video).on "touchend" ,  ->
                    video.play()
        for video in @videos
            video.addEventListener "loadeddata" , (=>
                 @onResize()
                 setTimeout @onResize , 10
                )

        $(window).resize @onResize
        @onResize()




    onResize: =>
        for video in @videos
            height = $(video).height()
            width = $(video).width()
            marqueeHeight = $(video).parent().height()
            marqueeWidth = $(video).parent().width()

            ratio = marqueeWidth/marqueeHeight

   
            if width/height > ratio
                $(video).removeClass("w").addClass("h")
            else
                $(video).removeClass("h").addClass("w")

            
            $(video).css
                left: -(width/2 - marqueeWidth/2)
                top: -(height/2 - marqueeHeight/2)





module.exports = Video