
PluginBase = require '../abstract/PluginBase.coffee'

class NewsRoom extends PluginBase

    constructor: (opts) ->
        @$el = $(opts.el)
        @isPhone = opts.isPhone
        super(opts)
    

    initialize: ->
        @resizeNewsContainer()
        super()

    addEvents: ->
        $('.select-news-year-wrapper').on 'click', 'a', @switchYears
        $('.select-news-button-wrapper').on 'click', 'a', @switchPage
        
    switchYears: (e) =>
        if $(e.target).hasClass 'active'
            return false
        
        e.preventDefault()
        activeYear = $('.select-news-posts-wrapper .news-year-wrapper.visible')
        targetYear = $('.select-news-posts-wrapper .news-year-wrapper.' + $(e.target).text())
        
        $('.select-news-year-wrapper a').removeClass 'active'
        $(e.target).addClass 'active'
    
        activeYear.removeClass('visible')
        targetYear.addClass('visible')
        
        @resizeNewsContainer()
        
        
        
    switchPage: (e) =>
        if $(e.target).hasClass 'active'
            return false
            
        e.preventDefault()
        activePage = $('.select-news-pages-wrapper').children('div.visible')
        targetPage = $('.' + $(e.target).data('page'))
        
        $('.select-news-button-wrapper a').removeClass 'active'
        $(e.target).addClass 'active'
        
        activePage.removeClass('visible')
        targetPage.addClass('visible')

    switchToPage: (target) =>
        activePage = $('.select-news-pages-wrapper').children('div.visible')
        targetPage = $('.' + target)
        console.log target
        activePage.removeClass('visible')
        targetPage.addClass('visible')


    resizeNewsContainer: =>
        activeYear = $('.select-news-year-wrapper a.active').text()
        activeWrapper = $('.news-year-wrapper.' + activeYear)
        
        height = 0
        
        for post in $(activeWrapper).find('.post')
            postHeight = $(post).height()            
            height = height + postHeight
            
        $('.select-news-posts-wrapper').css('height', height)
        if @isPhone
            height = if $('.select-news-media-form').height() > height then $('.select-news-media-form').height() else height
            $('.select-news-pages-wrapper').css('height', eval(height + 75) + 'px');
        

module.exports = NewsRoom

