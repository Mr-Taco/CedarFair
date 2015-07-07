

class InlineVideo
    
    videos: []



    constructor: (videos) ->
        @videos = videos

        for video in @videos
            $video = $(video)
            $video.find(".poster").click @onPosterClick



    onPosterClick: (e) =>
        $t = $(e.target).closest(".inline-video")
        poster = $t.find(".poster")
        video = $t.find("video")[0]

        @hidePoster(poster)
        video.play()
        video.addEventListener "ended" , =>
            @showPoster poster

    hidePoster: (poster) ->
        TweenMax.to poster , .4 ,
            autoAlpha:0

    showPoster: (poster) ->
        TweenMax.to poster , .4 ,
            autoAlpha:1




module.exports = InlineVideo