PluginBase = require '../abstract/PluginBase.coffee'

class BasicOverlay extends PluginBase
    constructor: (opts) ->
        super(opts)

    initialize: ->
        # @$el = $(el)
        @overlayTriggers = $('.overlay-trigger')
        @addEvents()

        super()

    
    addEvents: ->

        $('#basic-overlay, #overlay-basic-inner .overlay-close').click(@closeOverlay);
        @overlayTriggers.each (i,t) =>
            $(t).on 'click', @openOverlay

        #global buy tickets links

        $('.overlay-content').on 'click', 'li' ,@openLink
#        $(window).on 'resize', @closeOverlay
        
    openLink: (e) =>
        target = $(e.target).parents '.park'
        if target.data('target')
            window.open(target.data('target'))
            e.preventDefault()
    
    closeOverlay: (e) ->
        
        if ! ((e.type is 'resize') and ($('#overlay video:visible').size() > 0))
            $('.overlay-basic').animate({
                opacity: 0
            }, () -> 
                $('.overlay-basic').hide()
                $('#overlay').hide()
            )
                        
    openOverlay: (t) ->
        $el = $(this)
        overlaySource = $el.data('source')
        $targetElement = $('#overlay-basic-inner .overlay-content')
        isNews = $el.hasClass('news')

        $('#overlay').show()
        
        if $el.hasClass 'offerings-option'
            oc = $('#offerings-overlay-content')
            oc.find('h1.title').text($el.find('span.offer').text())
            oc.find('div.description').html($el.find('div.description').html())
            oc.find('.content.media').css({backgroundImage: "url('" + $el.find('span.media').data('source') + "')"})

        
        if ($('#' + overlaySource).size() is 1) 
            #html = $('#' + overlaySource).html()

            $targetElement.children().each (i,t) =>
                $(t).appendTo('#overlay-content-sources')

            if isNews
                c = $el.next('.article').clone()
                $('#overlay_content').html(c.html())
                
            $('#' + overlaySource).appendTo($targetElement)

            $el = $('#overlay-basic-inner')
            isSmall = $el.height() < $(window).height() and $($targetElement).find('.select-box-wrapper').size() is 0
            scrollTop = $(window).scrollTop()
            addtop = if isSmall then 0 else scrollTop;
            position = $el.css 'position', if isSmall then 'fixed' else 'absolute'
            top = Math.max(0, (($(window).height() - $el.outerHeight()) / 2) + addtop)
            if !isSmall and (top < scrollTop) then top = scrollTop
            $el.css("top", top + "px");
            
            # height:
            #$el.css("left", Math.max(0, (($(window).width() - $el.outerWidth()) / 2) + addleft) + "px");
            
            $('.overlay-basic').css('opacity', 0).delay(0).show().animate({
                opacity: 1
            })


module.exports = BasicOverlay






