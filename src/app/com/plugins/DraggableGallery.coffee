
PluginBase = require '../abstract/PluginBase.coffee'
ViewBase = require '../abstract/ViewBase.coffee'

class DraggableGallery extends PluginBase

    constructor: (opts) ->
        super(opts)


    initialize: (opts) ->

        @gallery = @$el.find ".swiper-container"

        if(@gallery.length < 1)
            @gallery = @$el.filter ".swiper-container"
            
        if opts.page == 'jobs'
            @jobsPage = true
        else
            @jobsPage = false

        @galleryCreated = false
        @galleryContainer = @gallery.find('ul')
        @galleryItems = @galleryContainer.find('li')
        @currentIndex = @galleryItems.filter('.selected').data('index')
        @across = opts.across or 1
        @angleLeft = @gallery.find '.fa-angle-left'
        @angleRight = @gallery.find '.fa-angle-right'
        @pagination = opts.pagination or false
        @controls = opts.control or null
        @jobsCarouselStopped = false
        @jobsCarouselPaused = false
        @jobsInterval = null

        @sizeContainer()

        @addArrows()

        super()

    addEvents: ->
        $(window).on 'resize' , @sizeContainer

        $(@$el).on 'click', '.fa-angle-left', @prevSlide
        $(@$el).on 'click', '.fa-angle-right', @nextSlide
        if @jobsPage == true
            $(@$el).on 'click', '.swiper-container', @stopJobsCarousel
            $(@$el).on 'mouseover', '.swiper-container', @pauseJobsCarousel
            $(@$el).on 'mouseleave', '.swiper-container', @resumeJobsCarousel
            
        
    stopJobsCarousel: =>
        window.clearInterval(@jobsInterval)
        @jobsCarouselStopped = true

    pauseJobsCarousel: =>
        window.clearInterval(@jobsInterval)
        @jobsCarouselPaused = true

    resumeJobsCarousel: =>
        if @jobsCarouselStopped == false
            @jobsInterval = setInterval (->
                $('#jobs-gallery .fa-angle-right').trigger('click')
            ), 8000
            @jobsCarouselPaused = false

    prevSlide: (e) =>
        that = @mySwiper
        gal = @gallery
        
        TweenMax.to($(gal), .2, 
            opacity: 0
            scale: 1.1
            onComplete: =>
                that.swipePrev()
                TweenMax.set($(gal),
                    scale: 1
                )
                TweenMax.to($(gal), .35, 
                    opacity: 1
                    delay: .35
                )
        )
    
    nextSlide: (e) =>
        that = @mySwiper
        gal = @gallery

        TweenMax.to($(gal), .2,
            opacity: 0
            scale: 1.1
            onComplete: =>
                that.swipeNext()
                TweenMax.set($(gal),
                    scale: 0.85
                )
                TweenMax.to($(gal), .35,
                    opacity: 1
                    scale: 1
                    delay: .35
                )
        )


    addArrows: ->
        @isPhone = $("html").hasClass("phone")

        arrowLeft = $("<i class='gal-arrow fa fa-angle-left'></i>")
        arrowRight = $("<i class='gal-arrow fa fa-angle-right'></i>")

        @$el.append(arrowLeft, arrowRight)

        $('.gal-arrow').on 'click', ->
            $(@).addClass 'active'
            that = $(@)
            setTimeout ->
                $(that).removeClass 'active', 100
            

    sizeContainer: () =>
        @galleryContainer.css('width', "100%")
        if @across < 2
            @galleryItems.css('width' , "100%")
        else if @across < 3
            @galleryItems.css('width' , "50%")
        else
            @galleryItems.css('width' , "33.333333%")

        @itemWidth = @galleryItems.first().outerWidth()
        itemLength = @galleryItems.length

        @galleryItems.css('width', @itemWidth)
        @galleryContainer.css('width', itemLength * (@itemWidth))
        TweenMax.set @galleryContainer ,
            x: -@currentIndex * @itemWidth
        
        if !@galleryCreated    
            @createDraggable()
#            @mySwiper.swipeNext()
        
    createDraggable: () ->
        itemLength = @galleryItems.length

        if @scroll then @scroll.kill()

        id = $(@.$el).attr 'id'


        if @pagination
            @addPagination()

        if @across < 3
            if @pagination
                @mySwiper = new Swiper('#' + id + ' .swiper-container',{
                    loop:true,
                    grabCursor: true,
                    slidesPerView: @across,
                    pagination: '#' + id + ' .swiper-pagination',
                    paginationAsRange: true,
                    onTouchStart: @onSlideChangeStart,
                    onTouchEnd: @onSlideChangeEnd,
                    onSlideChangeStart: @onSlideChangeStart,
                    onSlideChangeEnd: @onSlideChangeEnd,
                    slidesPerGroup: @across
                })
            else
                @mySwiper = new Swiper('#' + id + ' .swiper-container',{
                    loop:true,
                    grabCursor: true,
                    slidesPerView: @across,
                    slidesPerGroup: @across
                    onTouchStart: @onSlideChangeStart,
                    onTouchEnd: @onSlideChangeEnd,
                    onSlideChangeStart: @onSlideChangeStart,
                    onSlideChangeEnd: @onSlideChangeEnd,
                })

        else
            @mySwiper = new Swiper('#' + id + ' .swiper-container',{
                loop:true,
                grabCursor: true,
                slidesPerView: 3,
                slidesPerGroup: 3
                onTouchStart: @onSlideChangeStart,
                onTouchEnd: @onSlideChangeEnd,
                onSlideChangeStart: @onSlideChangeStart,
                onSlideChangeEnd: @onSlideChangeEnd,
            })
            
        @galleryCreated = true
        
        if @jobsPage == true
            @jobsInterval = setInterval (->
                $('#jobs-gallery .fa-angle-right').trigger('click')
            ), 8000

        
    onSlideChangeStart: =>
        $(@.$el).closest('.add-border-fade').addClass 'showing'
        $(@.$el).find('.add-border-fade').addClass 'showing'

    onSlideChangeEnd: =>
        $(@.$el).closest('.add-border-fade').removeClass 'showing'
        $(@.$el).find('.add-border-fade').removeClass 'showing'
        
        if !(@controls == null)
            park = @mySwiper.activeSlide().data('id')
            $('#accommodations-gallery .swiper-container').removeClass 'active'
            $('#accommodations-gallery .carousel-wrapper').removeClass 'active'
            $('#accommodations-gallery div#' + park).addClass 'active'
            $('#accommodations-gallery div#' + park).parent().addClass 'active'
            
        if (@parkList)
            @parkList.selectLogo $(@.$el).find('.swiper-slide-active').data('id');

    addPagination: =>
        wrapper = $("<div class='swiper-pagination'></div>")
        $(@.$el).find('.swiper-container').addClass('addPagination').append(wrapper)


    goto: (id, initVal) ->

        if not initVal then $('body').animate { scrollTop: $('#' + ($(@$el).attr('id'))).offset().top }

        toIndex = $("li.park[data-id='#{id}']").data('index')

        tl = new TimelineMax

        tl.add TweenMax.to @galleryContainer , .4,
            autoAlpha:0

        tl.addCallback =>
            @mySwiper.swipeTo(toIndex, 0)

        tl.add TweenMax.to @galleryContainer , .4,
            autoAlpha:1

        @currentIndex = toIndex

















module.exports = DraggableGallery

