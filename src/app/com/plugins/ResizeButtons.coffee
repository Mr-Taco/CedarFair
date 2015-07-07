PluginBase = require '../abstract/PluginBase.coffee'

class ResizeButtons extends PluginBase

    constructor: ->
        @resizeButtons()

    resizeButtons: ->
        c = $('#content')
        btn_wrappers = c.find '.btn-wrapper'

        for btn_wrapper in btn_wrappers
            btns = $(btn_wrapper).find 'a'
            
            if btns.length > 1
                maxWidth = 0
                widestSpan = null

                $(btns).each ->
                    if $(this).width() > maxWidth
                        maxWidth = $(this).width()
                        widestSpan = $(this)

                $(btns).each ->
                    $(this).css({width: maxWidth + 60})








module.exports = ResizeButtons