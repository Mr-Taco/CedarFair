PluginBase = require '../abstract/PluginBase.coffee'

class TickerList extends PluginBase

    constructor: (opts) ->      
        super(opts)

    initialize: ->
        super()
        @tickerListWrapper = @$el.find ".ticker-list-wrapper"
        @tickerList1 = @$el.find ".ticker-list.1"
        @tickerList2 = @$el.find ".ticker-list.2"

        @tickerLists = @$el.find ".ticker-list"

        @tickers = @$el.find "span.ticker"
        @firstTicker = @$el.find "span.ticker:first-child"

        #@getStockInfo()
        @initializeTicker()


    getStockInfo: ->


        ### AJAX call to grab Cedar Fair Stock Price from Google and insert into stock ticker ###
        $.ajax
            url: "http://finance.google.com/finance/info?client=ig&q=NYSE:FUN"
            dataType: "jsonp"
            error: @onGetStockFail
            success: @onGetStockSuccess

    generateStockElement: (info) ->

        ### Setup the HTML to be inserted into the ticker ###
        wrapper = $("<span class='ticker' id='ticker-span-nyse'></span>")
        name = $("<p class='ticker-headline'>" + info.t + "</p>")


        amnt = info.c.substr(1, info.c.length-1)



        if info.c.indexOf('+') > -1
            img = $("<img class='ticker-arrow' src='images/icons/ticker-up-arrow.png' />")
        else
            img = $("<img class='ticker-arrow' src='images/icons/ticker-down-arrow.png' />")
            

        amntEl = $("<p class='ticker-amount'>" + amnt + "</p>")

        ### Append the HTML to the ticker lists ###
        wrapper.append(name, img, amntEl)

        return wrapper



    initializeTicker: (stockEl) ->

        ### Set the width of the ticker list wrapper to be equal to sum of ticker1 and ticker2 width  ###
        targetWidth = (@tickerList1.width() * 2.1) + 200
        console.log 'targetWidth: ', targetWidth
        @tickerListWrapper.css {width: targetWidth}

        ### Define distance to slide left and setup TimelineMax ###
        moveLeft = @tickerLists.first().width()
        howMany = $('.ticker-list.1').children('span').length
        time = howMany * 8

        TweenMax.to @tickerListWrapper , time ,
            repeat:-1
            force3D:true
            x: -moveLeft
            ease:Linear.easeNone

    onGetStockSuccess: (data) =>
        info = data[0]
        
        stockEl = @generateStockElement(info)
        @initializeTicker(stockEl)


    onGetStockFail: =>
        @initializeTicker()

module.exports = TickerList

