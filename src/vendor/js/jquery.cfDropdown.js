/**
 * Created by wildlife009 on 10/22/14.
 */
$.fn.cfDropdown = function (opts) {

    var CFDropdown = $.extend({}, opts);
    CFDropdown.$el = $(this);
    (function () {
        
        this.value = '';
        this.mapping = (this.$el.parent().data('mapping')) ? this.$el.parent().data('mapping') : '';
        this.placeholder = (this.$el.parent().data('placeholder')) ? this.$el.parent().data('placeholder') : false;
        this.name = (this.$el.parent().data('name')) ? this.$el.parent().data('name') : this.mapping;
        this.required = (this.$el.parent().data('required')) ? this.$el.parent().data('required') : false;
        this.input = this.$el.find('input')
        
        this.openMenu = function () {
            
            //console.log('height: ' + this.menuHeight);
            this.menuHeight = this.$el.find('ul').height() / this.menuItemLength;
            //console.log('afetr: ' + this.menuHeight);
            this.$el.off('click' , this.toggleMenu);
            this.listItems.on('click', this.selectItem);
            this.isOpen = true;
            TweenMax.to(this.$el, 0.3 ,{
                height: this.menuHeight * this.menuItemLength, //
                ease:Cubic.easeInOut
            });

            TweenMax.to(this.list, 0.3 , {
                y: 0,
                ease:Cubic.easeInOut
            });

            
            that = this;
            if (window.ddls) {
                $.each(window.ddls, function() {
                   if ((this!==that) && (this.isOpen)) {
                       this.closeMenu();
                   } 
                });
            }
            this.onOpen();

        };

        this.toggleMenu = function (e) {
            if(this.isOpen)
                this.closeMenu();
            else
                this.openMenu();
        };

        this.closeMenu = function () {
            var that = this;
            this.isOpen = false;
            TweenMax.to(this.$el, 0.3 ,{
                height: this.menuHeight,
                ease:Cubic.easeInOut,
                onComplete: function () {
                    that.$el.on('click' , that.toggleMenu);
                    that.onClose();
                }
            });


        };

        this.selectItem = function (e) {
            console.log('clicked!');
            this.listItems.off('click', this.selectItem);
            var li = $(e.target);
            var i = $(li).data('index');
            this.value = ((this.placeholder) && (i === 0)) ? '' : $(li).text();
            if (this.input)
                $(this.input).val(this.value);
            
            var containerHeight = this.$el.parents('.select-box-wrapper').height();
            var itemHeight = $(li).outerHeight();            
            var adjustment = (containerHeight < itemHeight) ? ((itemHeight - containerHeight) / 2) : 0;                        
            var top = $(this.list).find('li').eq(i).position().top + adjustment;

            TweenMax.to(this.list, 0.3 , {
                y: - top, //i * -this.menuHeight,
                ease:Cubic.easeInOut

            });

            this.toggleMenu();
            this.onSelect(e.target);


            if (this.required) {
                if  (this.$el.hasClass('invalid')) {
                    this.removeClass('invalid');
                    if (this.value === '')
                        this.addClass('invalid');
                    $(this.input).trigger('change');
                }
            }
        };
        
        this.addClass = function(className) {
            this.$el.addClass(className);
        };

        this.removeClass = function(className) {
            this.$el.removeClass(className);
        };

        this.onOver = function() {
            this.isHovered = true;
        };
        this.onOut = function() {
            this.isHovered = false;
        };

        this.initialize = function () {
            this.$el.on('click' , this.toggleMenu);
            this.$el.on('mouseenter', this.onOver);
            this.$el.on('mouseleave', this.onOut);
            this.initValue();
        };
        
        this.clearSelection = function() {
            this.initValue();
            if (this.input) $(this.input).val('');
            TweenMax.to(this.list, 0.3 , {
                y: 0, //i * -this.menuHeight,
                ease:Cubic.easeInOut
            });
        };
        this.initValue = function() {
            this.value = '';
            //alert(this.placeholder);
            if (! this.placeholder) {
                // set to first item
                this.value = this.list.find("li").eq(0).text();
            }
        };
        this.setToValue = function(value) {
            that = this;
            this.list.find("li").each(function() {
                if($(this).text().trim()===value.trim()) {
                    var containerHeight = that.$el.parents('.select-box-wrapper').height();
                    var itemHeight = $(this).outerHeight();
                    var adjustment = (containerHeight < itemHeight) ? ((itemHeight - containerHeight) / 2) : 0;
                    var top = $(this).position().top + adjustment;
                    $(this).parent().css('transform', 'matrix(1, 0, 0, 1, 0, -' + top + ')');
                }
            });
        };

        this.listContainer = this.$el.find(".drop-container-inner");
        this.list = this.listContainer.find("ul");
        this.listItems = this.list.find("li");
        this.arrow = this.listContainer.find(".arrow");

        //console.log(this.$el.find('ul').height());
        this.menuHeight = this.$el.outerHeight();
        this.menuItemLength = this.listItems.length;

        this.isOpen = false;
        this.isHovered = false;
        

        this.toggleMenu = this.toggleMenu.bind(this);
        this.selectItem = this.selectItem.bind(this);
        this.onOver = this.onOver.bind(this);
        this.onOut = this.onOut.bind(this);

        this.onSelect = this.onSelect || function () {};
        this.onOpen = this.onOpen || function () {};
        this.onClose = this.onClose || function () {};
        //this.onMouseOver = this.onMouseOver || function() {};
        //this.onMouseOut = this.onMouseOut || function() {};




        this.initialize();


    }).apply(CFDropdown);
    
    return CFDropdown;

};
