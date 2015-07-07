globals = require '../global/index.coffee'
PluginBase = require '../abstract/PluginBase.coffee'

class HeaderAnimation extends PluginBase

    constructor: (opts) ->
  
        @body = $("body")
        @html = $("html")
        @content = $("#content")
        @mobnav = $("#mobile-header-nav")
        @subnav = $(".subnav")
        @subnavShowing = false
        @ourParksLeft = $('.nav-list a[data-page="our-parks"]').offset().left
        @partnershipLeft = $('.nav-list a[data-page="partnerships"]').offset().left
        

        super(opts)  


    initialize: ->
        super()    
        @showInitialSubNav()        

    addEvents: ->
        if !$('html').hasClass 'tablet'
            $('.nav-list a li').on 'mouseenter', @handleNavHover
            $('header').on 'mouseleave', @hideSubNav
        
        window.onresize = @handleResize
        @body.find("#navbar-menu").on 'click', @toggleNav
        $('#mobile-header-nav a').on 'click', @showMobileSubNav
        $('#mobile-header-nav i').on 'click', @handleArrowClick
        
        @body.find('.toggle-nav').on 'click', () ->
            $(@).parents('header').find('#navbar-menu img').trigger('click')
            
        $('#mobile-header-nav').on 'click', '.mobile-sub-nav li', @onClickMobileSubNavLink
        
    
    handleSubNav: =>
        startPage = $('.subnav').data 'page'
        id = $('.nav-list a[data-page-short="' + startPage + '"]').data 'page'
        @showSubNavLinks(id)
        
    showInitialSubNav: =>
        section = $('.subnav').data 'page'
        
        if section == 'offerings' || section == 'accommodations' || section == 'ourparks'
            @showSubNavLinks('our-parks')
        else if section == 'partnership-details' || section == 'partnership'
            @showSubNavLinks('partnerships')
        
    toggleNav: (e) =>
                
    handleResize: =>
        @handleSubNav()
        @adjustMobileNav()
        
        
    positionSubNavLists: =>
        #console.log 'positionSubNavLists'
#        ourParksLeft = $('.nav-list a[data-page="our-parks"]').offset().left
#        partnershipLeft = $('.nav-list a[data-page="partnerships"]').offset().left            
        
        if $('#header-top').hasClass 'small'
            if window.innerWidth < 993
                $('#our-parks-subnav-list').css('left', @ourParksLeft - 90)
                $('#partnerships-subnav-list').css('left', @partnershipLeft - 133)
            else
                $('#our-parks-subnav-list').css('left', @ourParksLeft - 90)
                $('#partnerships-subnav-list').css('left', @partnershipLeft - 118)
        else
            if window.innerWidth < 993
                $('#our-parks-subnav-list').css('left', @ourParksLeft - 60)
                $('#partnerships-subnav-list').css('left', @partnershipLeft - 105)
            else
                $('#our-parks-subnav-list').css('left', @ourParksLeft - 60)
                $('#partnerships-subnav-list').css('left', @partnershipLeft - 90)

    animateHeader: (scrollY) =>
        if @html.hasClass 'phone'
            return

        $ht = @$el.find('#header-top')
        $hb = @$el.find('#header-bottom') 

        if scrollY > 85 
            if !@navCollapsed
                $('#header-top, #header-bottom, #navbar-logo, .nav-list, #buy, .header-contact, .header-social').addClass('small')
                @navCollapsed = true
                @positionSubNavLists() 
        else
            if @navCollapsed
                $('#header-top, #header-bottom, #navbar-logo, .nav-list, #buy, .header-contact, .header-social').removeClass('small')
                @navCollapsed = false
                @handleSubNav()
                @positionSubNavLists() 
            
                
    handleNavHover: (e) =>
        parentID = $(e.target).parent().data('page')
        if $('#' + parentID + '-subnav-list').find('a').length < 1
            @hideSubNav()
        else
            @hideSubNavLinks()
            @showSubNavLinks(parentID)
        
            if !@subnavShowing
                @showSubNav()
              
    showSubNav: =>
        @subnav.addClass('showing')
        @subnavShowing = true
        
    hideSubNav: =>
        @subnav.removeClass('showing')
        @subnavShowing = false
        @handleSubNav()

    showSubNavLinks: (page) =>
        if page?
            left = $('.nav .nav-list a[data-page="' + page + '"]').position().left
            offset = 0
            helper = -45 
            
            if window.innerWidth < 993
                helper = -20
            
            #console.log 'page: ', page
            #console.log 'b: ', $('#' + page + '-subnav-list a').length
            
            if $('#' + page + '-subnav-list a').length < 3
                for a in $('#' + page + '-subnav-list a')
                    offset = offset + $(a).width()

            if offset > 0
                #console.log 'a'
                $('#' + page + '-subnav-list').css('left', left - (offset / 3))
            else
                #console.log 'b'
#               $('#' + page + '-subnav-list').css('left', left + helper)
                @positionSubNavLists()
            $('#' + page + '-subnav-list').addClass('showing')
    
    hideSubNavLinks: =>
        $('.subnav-list li').removeClass('showing')
        
    handleSubNav: =>
        if $('#header-bottom .subnav').hasClass('ourparks') || $('#header-bottom .subnav').hasClass('offerings') || $('#header-bottom .subnav').hasClass('accommodations')
            $('ul.subnav-list li').removeClass 'showing'
            $('#our-parks-subnav-list').addClass 'showing'
            @showSubNavLinks('our-parks')

            if $('#header-bottom .subnav').hasClass('offerings')
                $('a#our-parks-offerings-subnav-link').addClass 'selected'

            if $('#header-bottom .subnav').hasClass('accommodations')
                $('a#our-parks-accommodations-subnav-link').addClass 'selected'


        else if $('#header-bottom .subnav').hasClass('partnership') || $('#header-bottom .subnav').hasClass('partnership-details')
            $('ul.subnav-list li').removeClass 'showing'
            $('#partnerships-subnav-list').addClass 'showing'
            @showSubNavLinks('partnerships')

#            if $('#header-bottom .subnav').hasClass('partnership-details')
#                $('a#partnership-details-subnav-link').addClass 'selected'


#===================#===================#===================#
#===================  MOBILE STARTS HERE ==================#
#===================#===================#===================# 

    toggleNav: (e) =>
        e.preventDefault()
        $t = $(e.target)
        $hb = $('#header-bottom')
        $mn = $('#mobile-header-nav')
        $hh = $hb.height()

        $t.toggleClass('closed')

        console.log 'second toggle'
        console.log $t
        
        if $t.hasClass('closed')
            @adjustMobileNav()
            TweenMax.to @mobnav, .35, 
                {y: (800 + $hh)
                ,z: 0
                ,ease: Power1.easeOut
                ,onComplete: =>
                    TweenMax.set @mobnav,
                        z: 10
                }
        else
            TweenMax.set @mobnav,
                z: -2 
            TweenMax.to @mobnav, .5, {y: 0, z: 0, ease: Power1.easeIn}
            $('.mobile-sub-nav').css('height', '0px')
            @adjustMobileNav
            @hideMobileSubNav()
            TweenMax.set @content ,
                y: 0

    adjustMobileNav: =>
        $hb = $('#header-bottom')
        $mn = $('#mobile-header-nav')
        # Set nav height to 350px every time before adjusting
        #$mn.css {height: 350}
        $hh = $hb.height()
        $nh = $mn.height()
        $iw = window.innerWidth
        $ih = window.innerHeight
        $mb = $('#navbar-menu')

        if $nh > $ih
            $mn.css {height: ($ih - $hh), overflow: 'scroll'}
        else
            $mn.css {height: 400 + 'px'}            
        
    showMobileSubNav: (e) =>
        thisSubNav = $(e.target).parent().find '.mobile-sub-nav'
        
        if (thisSubNav.find('li').length < 1)
            @hideMobileSubNav()
            $(e.target).addClass 'active'
            return
        
        if !($(e.target).parent().hasClass('active'))
            e.preventDefault()
            
        howMany = thisSubNav.find('li').length
        windowHeight = window.innerHeight
        target = $(e.target)

        @hideMobileSubNav()
        target.find('i').addClass 'active'
        target.addClass 'active'
        target.parents('a').addClass 'active'
        @mobnav.css('height', (windowHeight - 100) + 'px')
        thisSubNav.css('height', (howMany * 50) + 'px')
        
    hideMobileSubNav: =>
        $('.mobile-sub-nav').css('height', '0px')
        @mobnav.css('height', '400px')
        @mobnav.find('i').removeClass 'active'
        @mobnav.find('li').removeClass 'active'
        @mobnav.find('ul a').removeClass 'active'

    
    handleArrowClick: (e) =>
        e.stopPropagation()
        e.preventDefault()
        
        if $(e.target).hasClass 'active'
            @hideMobileSubNav()
        else
            $(e.target).parents('li').trigger 'click'
        
        
    onClickMobileSubNavLink: (e) =>
        e.preventDefault()
        e.stopPropagation()
        
        if $(e.target).data('href')?
            url = $(e.target).data 'href'
            window.location.href = url
        
module.exports = HeaderAnimation


