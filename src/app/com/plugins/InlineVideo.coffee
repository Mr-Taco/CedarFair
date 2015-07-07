PluginBase = require '../abstract/PluginBase.coffee'

class InlineVideo extends PluginBase
    constructor: (opts) ->
        super(opts)

    initialize: ->
        # @$el = $(el)

        @videoPlayers = @$el
        @addEvents()

        super()

    addEvents: ->

        @videoPlayers.each (i,t) =>            
            $(t).on 'click', @startPlayer


    startPlayer: (t) ->
        if $(this).parent().find('video').size() == 0 
            $el = $(this)
                
            data = {
                mp4: $el.data('mp4'),
                webm: $el.data('webm')
            }
            
            console.log data
            width = $el.width()
            height = $el.outerHeight()

            mp4 = $('<source src="' + data.mp4 + '" type="video/mp4" />')
            webm = $('<source src=' + data.webm + '" type="video/webm" />')

            @$videoEl = $("<video id='overlay-player' class='vjs-default-skin video-js' controls preload='auto' autoplay='true' />")
            @$videoEl.append(mp4)
            @$videoEl.append(webm)
            
            $el.parent().append @$videoEl
            @$videoEl.show().height(height)


module.exports = InlineVideo






