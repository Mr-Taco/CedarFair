
Sharer = require "../util/Sharer.coffee" 


class ViewBase extends EventEmitter





    constructor: (el) ->

        @$el = $(el)
        @isTablet = $("html").hasClass("tablet")
        @isPhone = $("html").hasClass("phone")
        @cdnRoot = $('body').data('cdn') or "/"
        $(window).on "resize.app" , @onResize

        @stageHeight = window.innerHeight
        @stageWidth = $(window).width()
        @mouseX = 0
        @mouseY = 0

        #@delegateEvents(@generateEvents())
        @initialize()


    initialize: ->
        @initComponents()

    initComponents: ->

    onResize: =>
        @stageHeight = $(window).height()
        @stageWidth = $(window).width()


    generateEvents: ->
        return {}


module.exports = ViewBase
