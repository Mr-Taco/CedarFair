class PluginBase extends EventEmitter



    constructor: (opts) ->
        super()
        @$el = if opts.el? then $ opts.el

        @initialize(opts)




    initialize: (opts) ->
        @addEvents()

    addEvents: ->



    removeEvents: ->


    destroy: ->
        @removeEvents()








module.exports = PluginBase

