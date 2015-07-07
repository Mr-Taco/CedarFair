class SvgInject

    constructor: (selector) ->
        
        @$svgs = $(selector)
        
        @preloader = new createjs.LoadQueue true , "" , true
        @preloader.setMaxConnections(10)
        @preloader.addEventListener 'fileload' , @onSvgLoaded
        @preloader.addEventListener 'complete' , @onLoadComplete
        @manifest = []
        @collectSvgUrls()
        @loadSvgs()
        
    collectSvgUrls: ->
        
        self = @
        
        @$svgs.each ->
            
            id = "svg-inject-#{parseInt(Math.random() * 1000).toString()}"
          
            $(@).attr('id', id)
            $(@).attr('data-arb' , "abc123")
            svgUrl = $(@).attr('src')
            
           

            self.manifest.push 
                id:id
                src:svgUrl
                
    loadSvgs: ->
        
        @preloader.loadManifest(@manifest)
                
    
    injectSvg: (id,svgData) ->
        
        $el = $("##{id}")    
 
 
        imgID = $el.attr('id')
        imgClass = $el.attr('class')
        imgData = $el.clone(true).data() or []
        dimensions = 
            w: $el.attr('width')
            h: $el.attr('height')

        svg = $(svgData).filter('svg')
        

        svg = svg.attr("id", imgID)  if typeof imgID isnt 'undefined'
        if typeof imgClass isnt 'undefined'
            cls = (if (svg.attr("class") isnt 'undefined') then svg.attr("class") else "")
            svg = svg.attr("class", imgClass + " " + cls + " replaced-svg")
        
        # copy all the data elements from the img to the svg
        $.each imgData, (name, value) ->                  
            svg[0].setAttribute "data-" + name, value
            return        
        svg = svg.removeAttr("xmlns:a")
        
        #Get original dimensions of SVG file to use as foundation for scaling based on img tag dimensions
        ow = parseFloat(svg.attr("width"))
        oh = parseFloat(svg.attr("height"))
        
        #Scale absolutely if both width and height attributes exist
        if dimensions.w and dimensions.h
            $(svg).attr "width", dimensions.w
            $(svg).attr "height", dimensions.h
        
        #Scale proportionally based on width
        else if dimensions.w
            $(svg).attr "width", dimensions.w
            $(svg).attr "height", (oh / ow) * dimensions.w
        
        #Scale proportionally based on height
        else if dimensions.h
            $(svg).attr "height", dimensions.h
            $(svg).attr "width", (ow / oh) * dimensions.h
        
        
        $el.replaceWith svg
            
            
        
        
    onSvgLoaded: (e) =>
        
        @injectSvg(e.item.id, e.rawResult)
    
    onLoadComplete: (e) =>
    
    
    
    
    
module.exports = SvgInject 