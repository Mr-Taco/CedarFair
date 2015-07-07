PluginBase = require '../abstract/PluginBase.coffee'

###
  
  create form object on page (src/com/pages/) after you've created and added any ddl objects
  
  window.ddls = []    
  window.ddls.push $('#select').cfDropdown
        onSelect: (t) ->
            id = $(t).data('id')  
  
  myform = new FormHandler
    el: '#sales-form' 
  
###

### 
  todo:
  5. customize confirmation
  2: validate date type
  4: add input mask for phone and date
###

class FormHandler extends PluginBase
    
    constructor: (opts) ->
        @$el = $(opts.el)
        @formcontainer = @
        super(opts)

    initialize: ->
        super()

    validate: ->

        $form = @$el
        
        errorsContainer =  '#' + $form.data('errors')
        handler = $form.data('handler')
        errors = ''
        invalidFieldCount = 0
        data = {}

        inputs = $form.find 'input:not([type=radio], [type=hidden]), textarea, .radios'
        inputContainers = $form.find('.input, textarea, .radios')

        $(inputContainers).removeClass('invalid')

        # textboxes and text inputs
        inputs.each (i,t) =>
            value = ''
            type = $(t).data('type')
            parent = $(t).parents('.input').eq(0)
            required = $(parent).hasClass('required') or $(t).hasClass('required')
                        
            isradio = $(t).hasClass('radios')
            if isradio and $('input:radio[name=' + $(t).data('group') + ']:checked').size() is 1
                value = $('input:radio[name=' + $(t).data('group') + ']:checked').val().trim()
                
            value = if isradio then value else $(t).val().trim()
            data[$(t).data('mapping')] = value

            fieldName = if $(t).data('name') then $(t).data('name') else $(t).attr('placeholder')
            
            # validate required fields
            if required and (value.length is 0)
                errors += '<li>' + fieldName + ' is required.</li>'
                if $(t).prop('tagName').toLowerCase() is 'textarea' or $(t).hasClass('radios')
                    $(t).addClass('invalid')                    
                else
                    $(t).parents('.input').addClass('invalid')
                invalidFieldCount++

            else
                # validate input types
                if (value.length > 0)
                    switch type
                        when 'email'
                            emailPattern = ///^([\w.-]+)@([\w.-]+)\.([a-zA-Z.]{2,6})$ ///i
                            if ! value.match emailPattern
                                errors += '<li>' + fieldName + ' is not a valid email address.</li>'
                                $(t).parents('.input').addClass('invalid')
                                invalidFieldCount++
                        when 'number'
                            if isNaN(value) or (value % 1 != 0)
                                errors += '<li>' + fieldName + ' is not a valid number.</li>'
                                $(t).parents('.input').addClass('invalid')
                                invalidFieldCount++
                        when 'phone'
                            pat = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/
                            if ! value.match pat
                                errors += '<li>' + fieldName + ' is not a valid phone number.</li>'
                                $(t).parents('.input').addClass('invalid')
                                invalidFieldCount++
                            

      
        # validate dropdown lists
        if window.ddls?
            $.each window.ddls, (i, d) =>
                d.removeClass('invalid')
                data[d.mapping] = d.value.trim()
                if (d.required) and (d.value.trim().length is 0)
                    errors += '<li>' + d.name + ' is required.</li>'
                    d.addClass('invalid')
                    invalidFieldCount++                    

        valid = invalidFieldCount is 0
        errorHtml = if valid then '' else '<ul>' + errors + '</ul>'
        cls = if valid then 'success' else 'failure'
            
        $(errorsContainer).removeClass('success failure').addClass(cls).html(errorHtml)            
            
        # display errors
        $(errorsContainer).stop().animate({
            height: $(errorsContainer).find('ul').height()
        })
            
        response = {
            valid: valid,
            handler: handler,
            data: data,
            container: errorsContainer
        }
        return response

    submitForm: (e, parent) ->
        e.preventDefault()
         
        validation = parent.validate()
        if validation.valid
        
            $.ajax 
                url: validation.handler,
                method:"POST",
                dataType: 'json',
                data: validation.data,
                complete: (response) ->
                    res = if response.responseJSON? then response.responseJSON else response
                    message = '<div id="conclusion">Your submission failed.</div>'
                    good = false
                    if res.message?
                        good = res.message is 'success'
                                                    
                        # todo: customize messages
                        if good
                            message = '<div id="conclusion">Thank you.  We have received your request, and will reply to you shortly.</div>'
                        else
                            # server side validation
                            if res.error? and res.error.errors?
                                message = '<ul id="conclusion">'
                                
                                $.each res.error.errors, (i, obj) =>
                                    message += '<li>' + obj.message + '</li>'
                                    
                                message += '</ul>'
    
                    cls = if good then 'success' else 'failure'
                    $(validation.container).removeClass('success failure').addClass(cls).html(message)

                    $(validation.container).stop().animate({
                        height: $(validation.container).find('#conclusion').height()
                    })

                    if good
                        parent.clearForm()

    clearForm: ->

        $form = @$el
        
        #radios
        radios = $form.find '.radios'
        radios.removeClass('invalid')
        $.each radios, (x, r) =>
            $(radios).find('input:radio').removeAttr("checked")
        
        # inputs
        inputs = $form.find 'input:not([type=radio]), textarea'
        inputs.removeClass('invalid').parents('.input').removeClass('invalid')
        $.each inputs, (i, t) =>
            $(t).val('')

        # dropdownlists
        if window.ddls?
            $.each window.ddls, (i, d) =>
                d.clearSelection()
                
    addEvents: ->
        submitter =  @$el.data('submitter')
        that = @
        $('#' + submitter).on 'click', (e) ->
            that.submitForm e, that

        # text inputs 
        @$el.find('input:not([type=radio]), textarea').on 'blur', (e) ->
            if $(@).parents('.input').hasClass('invalid') or $(@).hasClass('invalid')
                that.validate()

        # radio buttons
        @$el.find('input:radio').on 'click', (e) ->
            if $(@).parents('.radios').hasClass('invalid')
                that.validate()

        # drop down lists
        if window.ddls?
            $.each window.ddls, (i, d) => 
                if (d.required) 
                    hiddenField = d.input[0]
                    $(hiddenField).on 'change', (e) ->
                        that.validate()
                
module.exports = FormHandler
