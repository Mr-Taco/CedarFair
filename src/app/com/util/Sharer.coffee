

class Sharer

    
    Sharer.initFacebook = ->
        FB.init 
            appId:"215224705307341"
            channelUrl:"/channel.html"
            status: true
            xfbl: true


        
    
    Sharer.shareTwitter = (shareMessage,  url, hashtags) ->
        text = shareMessage
        hashtags = ""
        url = url
        twURL = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(url)
        str += "&hashtags=" + hashtags  if hashtags
        @openPopup 575, 420, twURL, "Twitter"

    Sharer.shareFacebook = (name,  caption ,description , link , picture) ->

        FB.ui
            method:"feed"
            link:link
            picture:picture
            name: name
            caption:caption
            description:description
        

    Sharer.shareGoogle = (url) ->

        @openPopup 600, 400 , "https://plus.google.com/share?url="+url, "Google"

    Sharer.sharePinterest = (url , description, picture) ->

        description = description.split(" ").join("+")
        @openPopup 780, 320, "http://pinterest.com/pin/create/button/?url=#{encodeURIComponent(url)}&amp;description=#{description}&amp;media=#{encodeURIComponent(picture)}"


    Sharer.emailLink = (subject, body) ->
        x = @openPopup 1 , 1, "mailto:&subject=#{encodeURIComponent(subject)}&body=#{encodeURIComponent(body)}"
        x.close()

    Sharer.openPopup = (w, h, url, name) ->
        window.open url, name, "status=1,width=" + w + ",height=" + h + ",left=" + (screen.width - w) / 2 + ",top=" + (screen.height - h) / 2


module.exports = Sharer