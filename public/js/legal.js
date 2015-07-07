(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var AnimationBase, HeaderAnimation, ScrollBar, ViewBase, clouds,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ViewBase = require("./ViewBase.coffee");

ScrollBar = require("../util/ScrollBar.coffee");

HeaderAnimation = require('../plugins/HeaderAnimation.coffee');

clouds = require('../pages/animations/clouds.coffee');

AnimationBase = (function(superClass) {
  extend(AnimationBase, superClass);

  function AnimationBase(el) {
    this.updateTimeline = bind(this.updateTimeline, this);
    this.resetTimeline = bind(this.resetTimeline, this);
    this.onResize = bind(this.onResize, this);
    this.onDrag = bind(this.onDrag, this);
    this.onScroll = bind(this.onScroll, this);
    this.toggleTouchMove = bind(this.toggleTouchMove, this);
    AnimationBase.__super__.constructor.call(this, el);
    this.timeline = null;
    this.touchY = 0;
    this.touchYLast = 0;
    this.globalScrollAmount = this.isTablet ? .5 : 1;
    this.prevScrollTo = 0;
    this.prevDelta = 0;
    this.currentProgress = 0;
    this.totalAnimationTime = 10;
    this.smoothMultiplier = 5;
    this.navTimer = null;
    this.video = null;
    this.inlineVideo = null;
    this.isTablet = $('html').hasClass('tablet');
  }

  AnimationBase.prototype.initialize = function() {
    AnimationBase.__super__.initialize.call(this);
    if (!this.isPhone) {
      this.resetTimeline();
      this.toggleTouchMove();
      this.onResize();
      return this.updateTimeline();
    }
  };

  AnimationBase.prototype.initComponents = function() {
    return this.header = new HeaderAnimation({
      el: 'header'
    });
  };

  AnimationBase.prototype.toggleTouchMove = function() {
    $(document).off('scroll', this.onScroll);
    this.scroll = {
      position: 0,
      scrollTop: 0
    };
    $(document).scroll(this.onScroll);
    return this.onScroll();
  };

  AnimationBase.prototype.getScrollableArea = function() {
    return Math.abs($("#content").outerHeight() - this.stageHeight);
  };

  AnimationBase.prototype.getScrollTop = function() {
    return $(document).scrollTop() / this.getScrollableArea();
  };

  AnimationBase.prototype.setScrollTop = function(per) {
    var pos;
    pos = this.getScrollableArea() * per;
    return window.scrollTo(0, pos);
  };

  AnimationBase.prototype.setDraggablePosition = function(per) {
    var pos;
    pos = this.getScrollableArea() * per;
    return TweenMax.set($("#content"), {
      y: -pos
    });
  };

  AnimationBase.prototype.onScroll = function(e) {
    if ($(document).scrollTop() > 30) {
      $('.circ-btn-wrapper').addClass('invisible');
    }
    this.scroll.position = this.getScrollTop();
    this.scroll.scrollTop = $(document).scrollTop();
    return this.updateTimeline();
  };

  AnimationBase.prototype.onDrag = function(e) {
    this.scroll.position = Math.abs(this.scroll.y / this.getScrollableArea());
    this.scroll.scrollTop = -this.scroll.y;
    return this.updateTimeline();
  };

  AnimationBase.prototype.onResize = function() {
    var pos;
    AnimationBase.__super__.onResize.call(this);
    if (!this.isTablet) {
      this.resetTimeline();
    }
    this.centerOffset = this.stageHeight * .6667;
    if (this.scroll != null) {
      pos = this.scroll.position;
      this.toggleTouchMove();
      if (!this.isTablet) {
        return this.setScrollTop(pos);
      }
    }
  };

  AnimationBase.prototype.resetTimeline = function() {
    this.timeline = new TimelineMax;
    this.triggers = [];
    this.parallax = [];
    return $('[data-cloud]').each((function(_this) {
      return function(i, t) {
        var $closestContainer, $el, cloudFunction, initPos;
        $el = $(t);
        $closestContainer = $el.closest('[data-cloud-container]');
        initPos = $closestContainer.data().cloudContainer.initPos;
        cloudFunction = clouds({
          $el: $el
        });
        if (initPos) {
          cloudFunction(initPos);
        }
        return _this.parallax.push(cloudFunction);
      };
    })(this));
  };

  AnimationBase.prototype.updateTimeline = function() {
    var j, k, len, len1, p, ref, ref1, results, t;
    this.header.animateHeader(this.scroll.scrollTop);
    ref = this.triggers;
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      if (this.scroll.scrollTop > t.offset - this.centerOffset) {
        t.a.play();
      } else if (this.scroll.scrollTop + this.stageHeight < t.offset) {
        t.a.paused(true);
        t.a.seek(0);
      }
    }
    ref1 = this.parallax;
    results = [];
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      p = ref1[k];
      results.push(p(this.scroll.position));
    }
    return results;
  };

  return AnimationBase;

})(ViewBase);

module.exports = AnimationBase;



},{"../pages/animations/clouds.coffee":5,"../plugins/HeaderAnimation.coffee":9,"../util/ScrollBar.coffee":13,"./ViewBase.coffee":3}],2:[function(require,module,exports){
var PluginBase,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = (function(superClass) {
  extend(PluginBase, superClass);

  function PluginBase(opts) {
    PluginBase.__super__.constructor.call(this);
    this.$el = opts.el != null ? $(opts.el) : void 0;
    this.initialize(opts);
  }

  PluginBase.prototype.initialize = function(opts) {
    return this.addEvents();
  };

  PluginBase.prototype.addEvents = function() {};

  PluginBase.prototype.removeEvents = function() {};

  PluginBase.prototype.destroy = function() {
    return this.removeEvents();
  };

  return PluginBase;

})(EventEmitter);

module.exports = PluginBase;



},{}],3:[function(require,module,exports){
var Sharer, ViewBase,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Sharer = require("../util/Sharer.coffee");

ViewBase = (function(superClass) {
  extend(ViewBase, superClass);

  function ViewBase(el) {
    this.onResize = bind(this.onResize, this);
    this.$el = $(el);
    this.isTablet = $("html").hasClass("tablet");
    this.isPhone = $("html").hasClass("phone");
    this.cdnRoot = $('body').data('cdn') || "/";
    $(window).on("resize.app", this.onResize);
    this.stageHeight = window.innerHeight;
    this.stageWidth = $(window).width();
    this.mouseX = 0;
    this.mouseY = 0;
    this.initialize();
  }

  ViewBase.prototype.initialize = function() {
    return this.initComponents();
  };

  ViewBase.prototype.initComponents = function() {};

  ViewBase.prototype.onResize = function() {
    this.stageHeight = $(window).height();
    return this.stageWidth = $(window).width();
  };

  ViewBase.prototype.generateEvents = function() {
    return {};
  };

  return ViewBase;

})(EventEmitter);

module.exports = ViewBase;



},{"../util/Sharer.coffee":14}],4:[function(require,module,exports){
var BasicOverlay, SvgInject;

BasicOverlay = require('../plugins/BasicOverlay.coffee');

SvgInject = require('../plugins/SvgInject.coffee');

if (window.console === void 0 || window.console === null) {
  window.console = {
    log: function() {},
    warn: function() {},
    fatal: function() {}
  };
}

$(document).ready(function() {
  var basicOverlays;
  basicOverlays = new BasicOverlay({
    el: $('#content')
  });
  $('.scrollto').click(function() {
    var t;
    t = $(this).data('target');
    return $('body').animate({
      scrollTop: $('#' + t).offset().top - 70
    });
  });
  $(window).click(function() {
    if (window.ddls != null) {
      return $.each(window.ddls, function(i, t) {
        if (t.isOpen && !t.isHovered) {
          return t.closeMenu();
        }
      });
    }
  });
  $('[data-depth]').each(function() {
    var $el, depth;
    $el = $(this);
    depth = $el.data().depth;
    $el.css('z-index', depth);
    return TweenMax.set($el, {
      z: depth * 10
    });
  });
  $('body').on('DOMNodeInserted', function() {
    return $('a').each(function() {
      var href;
      href = $(this).attr('href');
      if (href != null) {
        href = href.trim();
        if (href.indexOf('http://') === 0 || href.indexOf('https://') === 0 || href.indexOf('.pdf') === (href.length - 4)) {
          return $(this).attr('target', '_blank');
        }
      }
    });
  });
  $('.circle, .circle-outer').on('mouseenter', function() {
    return TweenMax.to($(this), .35, {
      scale: 1.05,
      ease: Power2.easeOut
    });
  });
  $('.circle, .circle-outer').on('mouseleave', function() {
    return TweenMax.to($(this), .35, {
      scale: 1,
      ease: Power2.easeOut
    });
  });
  return $('#jobs-gallery .swiper-container li').on('mouseeneter', function() {
    return console.log('hello');
  });
});

document.onreadystatechange = function() {
  if (document.readyState === 'complete') {
    return setTimeout(function() {
      return $('.quote').addClass('keepitahundred');
    }, 200);
  }
};



},{"../plugins/BasicOverlay.coffee":6,"../plugins/SvgInject.coffee":11}],5:[function(require,module,exports){
var cloudsOnUpdate, setBobing, setRegistration;

cloudsOnUpdate = function(el, duration) {
  var windowWidth;
  windowWidth = window.innerWidth;
  TweenMax.set(el, {
    x: -2050
  });
  return TweenMax.to(el, duration, {
    x: windowWidth,
    onComplete: (function(_this) {
      return function() {
        return cloudsOnUpdate(el, duration);
      };
    })(this)
  });
};

setBobing = function($el, dur, delay) {
  var d, width, windowWidth;
  this.isTablet = $('html').hasClass('tablet');
  width = window.innerWidth;
  windowWidth = window.innerWidth;
  if (window.innerWidth > 767 && !this.isTablet) {
    d = 300 - ($el.data('cloud').speed * 250);
    return TweenMax.to($el, dur, {
      x: width,
      delay: delay,
      ease: Linear.easeNone,
      onUpdateParams: ["{self}"],
      onComplete: (function(_this) {
        return function(tween) {
          return cloudsOnUpdate($el, d);
        };
      })(this)
    });
  }
};

setRegistration = function($el, registration) {
  var align, offset, settings, values, viewportWidth;
  values = registration.split("|");
  viewportWidth = window.innerWidth;
  settings = {};
  align = values[0];
  offset = parseInt(values[1]) || 0;
  switch (align) {
    case 'left':
      settings.x = 0 + offset;
      break;
    case 'right':
      settings.x = viewportWidth + offset;
      break;
    case 'center':
      settings.x = (viewportWidth * .5 - $el.width() * .5) + offset;
  }
  return TweenMax.set($el, settings);
};

module.exports = function(options) {
  var $container, $el, cloudData, cloudDepth, cloudOffsetMin, cloudRegistration, cloudReverse, cloudSpeed, containerTopPadding, distance, e, lastScrollPercentage, maxRangePercentage, maxY, minRangePercentage, minY, offLeft, percentage, percentageRange, presentScrollPercentage, scrollDelta, totalRange;
  $el = options.$el;
  $container = $el.closest('[data-cloud-container]');
  containerTopPadding = parseInt($container.css('padding-top'));
  try {
    cloudData = $el.data().cloud;
  } catch (_error) {
    e = _error;
    console.error("Cloud Data Parse Error: Invalid JSON");
  }
  cloudDepth = $el.data('depth');
  cloudSpeed = cloudData.speed || 1;
  cloudOffsetMin = parseInt(cloudData.offsetMin) || 0;
  cloudReverse = cloudData.reverse || false;
  cloudRegistration = cloudData.register || "center";
  setRegistration($el, cloudRegistration);
  if (!($container.hasClass('splash-container'))) {
    offLeft = $el.offset().left;
    distance = (window.innerWidth - offLeft) / window.innerWidth;
    percentage = 250 - (cloudSpeed * 200);
    setBobing($el, percentage, cloudSpeed / 5);
  }
  minY = $container.offset().top;
  maxY = $(document).outerHeight();
  totalRange = $container.outerHeight();
  percentageRange = totalRange / maxY;
  minRangePercentage = minY / maxY;
  maxRangePercentage = minRangePercentage + percentageRange;
  lastScrollPercentage = presentScrollPercentage = scrollDelta = 0;
  if ($container.hasClass('splash-container') && $('html').hasClass('tablet')) {
    $container.hide();
  }
  return function(pos) {
    var cloudPositionPercentage, cloudY;
    if (($container.hasClass('splash-container')) && ($('html').hasClass('tablet'))) {
      return TweenMax.to($el, 0.25, {
        ease: Sine.easeOut
      });
    } else {
      cloudPositionPercentage = (pos - minRangePercentage) / (maxRangePercentage - minRangePercentage);
      if ((0 <= cloudPositionPercentage && cloudPositionPercentage <= 1)) {
        presentScrollPercentage = cloudPositionPercentage;
        if (cloudReverse) {
          cloudPositionPercentage = 1 - cloudPositionPercentage;
        }
        cloudY = (totalRange * cloudPositionPercentage) * cloudSpeed;
        cloudY = cloudY - containerTopPadding;
        cloudY = cloudY + cloudOffsetMin;
        scrollDelta = Math.abs(lastScrollPercentage - presentScrollPercentage) * 3;
        lastScrollPercentage = presentScrollPercentage;
        return TweenMax.to($el, 0.25, {
          y: cloudY,
          ease: Sine.easeOut
        });
      }
    }
  };
};



},{}],6:[function(require,module,exports){
var BasicOverlay, PluginBase,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = require('../abstract/PluginBase.coffee');

BasicOverlay = (function(superClass) {
  extend(BasicOverlay, superClass);

  function BasicOverlay(opts) {
    this.openLink = bind(this.openLink, this);
    BasicOverlay.__super__.constructor.call(this, opts);
  }

  BasicOverlay.prototype.initialize = function() {
    this.overlayTriggers = $('.overlay-trigger');
    this.addEvents();
    return BasicOverlay.__super__.initialize.call(this);
  };

  BasicOverlay.prototype.addEvents = function() {
    $('#basic-overlay, #overlay-basic-inner .overlay-close').click(this.closeOverlay);
    this.overlayTriggers.each((function(_this) {
      return function(i, t) {
        return $(t).on('click', _this.openOverlay);
      };
    })(this));
    return $('.overlay-content').on('click', 'li', this.openLink);
  };

  BasicOverlay.prototype.openLink = function(e) {
    var target;
    target = $(e.target).parents('.park');
    if (target.data('target')) {
      window.open(target.data('target'));
      return e.preventDefault();
    }
  };

  BasicOverlay.prototype.closeOverlay = function(e) {
    if (!((e.type === 'resize') && ($('#overlay video:visible').size() > 0))) {
      return $('.overlay-basic').animate({
        opacity: 0
      }, function() {
        $('.overlay-basic').hide();
        return $('#overlay').hide();
      });
    }
  };

  BasicOverlay.prototype.openOverlay = function(t) {
    var $el, $targetElement, addtop, c, isNews, isSmall, oc, overlaySource, position, scrollTop, top;
    $el = $(this);
    overlaySource = $el.data('source');
    $targetElement = $('#overlay-basic-inner .overlay-content');
    isNews = $el.hasClass('news');
    $('#overlay').show();
    if ($el.hasClass('offerings-option')) {
      oc = $('#offerings-overlay-content');
      oc.find('h1.title').text($el.find('span.offer').text());
      oc.find('div.description').html($el.find('div.description').html());
      oc.find('.content.media').css({
        backgroundImage: "url('" + $el.find('span.media').data('source') + "')"
      });
    }
    if ($('#' + overlaySource).size() === 1) {
      $targetElement.children().each((function(_this) {
        return function(i, t) {
          return $(t).appendTo('#overlay-content-sources');
        };
      })(this));
      if (isNews) {
        c = $el.next('.article').clone();
        $('#overlay_content').html(c.html());
      }
      $('#' + overlaySource).appendTo($targetElement);
      $el = $('#overlay-basic-inner');
      isSmall = $el.height() < $(window).height() && $($targetElement).find('.select-box-wrapper').size() === 0;
      scrollTop = $(window).scrollTop();
      addtop = isSmall ? 0 : scrollTop;
      position = $el.css('position', isSmall ? 'fixed' : 'absolute');
      top = Math.max(0, (($(window).height() - $el.outerHeight()) / 2) + addtop);
      if (!isSmall && (top < scrollTop)) {
        top = scrollTop;
      }
      $el.css("top", top + "px");
      return $('.overlay-basic').css('opacity', 0).delay(0).show().animate({
        opacity: 1
      });
    }
  };

  return BasicOverlay;

})(PluginBase);

module.exports = BasicOverlay;



},{"../abstract/PluginBase.coffee":2}],7:[function(require,module,exports){
var DraggableGallery, PluginBase, ViewBase,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = require('../abstract/PluginBase.coffee');

ViewBase = require('../abstract/ViewBase.coffee');

DraggableGallery = (function(superClass) {
  extend(DraggableGallery, superClass);

  function DraggableGallery(opts) {
    this.addPagination = bind(this.addPagination, this);
    this.onSlideChangeEnd = bind(this.onSlideChangeEnd, this);
    this.onSlideChangeStart = bind(this.onSlideChangeStart, this);
    this.sizeContainer = bind(this.sizeContainer, this);
    this.nextSlide = bind(this.nextSlide, this);
    this.prevSlide = bind(this.prevSlide, this);
    this.resumeJobsCarousel = bind(this.resumeJobsCarousel, this);
    this.pauseJobsCarousel = bind(this.pauseJobsCarousel, this);
    this.stopJobsCarousel = bind(this.stopJobsCarousel, this);
    DraggableGallery.__super__.constructor.call(this, opts);
  }

  DraggableGallery.prototype.initialize = function(opts) {
    this.gallery = this.$el.find(".swiper-container");
    if (this.gallery.length < 1) {
      this.gallery = this.$el.filter(".swiper-container");
    }
    if (opts.page === 'jobs') {
      this.jobsPage = true;
    } else {
      this.jobsPage = false;
    }
    this.galleryCreated = false;
    this.galleryContainer = this.gallery.find('ul');
    this.galleryItems = this.galleryContainer.find('li');
    this.currentIndex = this.galleryItems.filter('.selected').data('index');
    this.across = opts.across || 1;
    this.angleLeft = this.gallery.find('.fa-angle-left');
    this.angleRight = this.gallery.find('.fa-angle-right');
    this.pagination = opts.pagination || false;
    this.controls = opts.control || null;
    this.jobsCarouselStopped = false;
    this.jobsCarouselPaused = false;
    this.jobsInterval = null;
    this.sizeContainer();
    this.addArrows();
    return DraggableGallery.__super__.initialize.call(this);
  };

  DraggableGallery.prototype.addEvents = function() {
    $(window).on('resize', this.sizeContainer);
    $(this.$el).on('click', '.fa-angle-left', this.prevSlide);
    $(this.$el).on('click', '.fa-angle-right', this.nextSlide);
    if (this.jobsPage === true) {
      $(this.$el).on('click', '.swiper-container', this.stopJobsCarousel);
      $(this.$el).on('mouseover', '.swiper-container', this.pauseJobsCarousel);
      return $(this.$el).on('mouseleave', '.swiper-container', this.resumeJobsCarousel);
    }
  };

  DraggableGallery.prototype.stopJobsCarousel = function() {
    window.clearInterval(this.jobsInterval);
    return this.jobsCarouselStopped = true;
  };

  DraggableGallery.prototype.pauseJobsCarousel = function() {
    window.clearInterval(this.jobsInterval);
    return this.jobsCarouselPaused = true;
  };

  DraggableGallery.prototype.resumeJobsCarousel = function() {
    if (this.jobsCarouselStopped === false) {
      this.jobsInterval = setInterval((function() {
        return $('#jobs-gallery .fa-angle-right').trigger('click');
      }), 8000);
      return this.jobsCarouselPaused = false;
    }
  };

  DraggableGallery.prototype.prevSlide = function(e) {
    var gal, that;
    that = this.mySwiper;
    gal = this.gallery;
    return TweenMax.to($(gal), .2, {
      opacity: 0,
      scale: 1.1,
      onComplete: (function(_this) {
        return function() {
          that.swipePrev();
          TweenMax.set($(gal), {
            scale: 1
          });
          return TweenMax.to($(gal), .35, {
            opacity: 1,
            delay: .35
          });
        };
      })(this)
    });
  };

  DraggableGallery.prototype.nextSlide = function(e) {
    var gal, that;
    that = this.mySwiper;
    gal = this.gallery;
    return TweenMax.to($(gal), .2, {
      opacity: 0,
      scale: 1.1,
      onComplete: (function(_this) {
        return function() {
          that.swipeNext();
          TweenMax.set($(gal), {
            scale: 0.85
          });
          return TweenMax.to($(gal), .35, {
            opacity: 1,
            scale: 1,
            delay: .35
          });
        };
      })(this)
    });
  };

  DraggableGallery.prototype.addArrows = function() {
    var arrowLeft, arrowRight;
    this.isPhone = $("html").hasClass("phone");
    arrowLeft = $("<i class='gal-arrow fa fa-angle-left'></i>");
    arrowRight = $("<i class='gal-arrow fa fa-angle-right'></i>");
    this.$el.append(arrowLeft, arrowRight);
    return $('.gal-arrow').on('click', function() {
      var that;
      $(this).addClass('active');
      that = $(this);
      return setTimeout(function() {
        return $(that).removeClass('active', 100);
      });
    });
  };

  DraggableGallery.prototype.sizeContainer = function() {
    var itemLength;
    this.galleryContainer.css('width', "100%");
    if (this.across < 2) {
      this.galleryItems.css('width', "100%");
    } else if (this.across < 3) {
      this.galleryItems.css('width', "50%");
    } else {
      this.galleryItems.css('width', "33.333333%");
    }
    this.itemWidth = this.galleryItems.first().outerWidth();
    itemLength = this.galleryItems.length;
    this.galleryItems.css('width', this.itemWidth);
    this.galleryContainer.css('width', itemLength * this.itemWidth);
    TweenMax.set(this.galleryContainer, {
      x: -this.currentIndex * this.itemWidth
    });
    if (!this.galleryCreated) {
      return this.createDraggable();
    }
  };

  DraggableGallery.prototype.createDraggable = function() {
    var id, itemLength;
    itemLength = this.galleryItems.length;
    if (this.scroll) {
      this.scroll.kill();
    }
    id = $(this.$el).attr('id');
    if (this.pagination) {
      this.addPagination();
    }
    if (this.across < 3) {
      if (this.pagination) {
        this.mySwiper = new Swiper('#' + id + ' .swiper-container', {
          loop: true,
          grabCursor: true,
          slidesPerView: this.across,
          pagination: '#' + id + ' .swiper-pagination',
          paginationAsRange: true,
          onTouchStart: this.onSlideChangeStart,
          onTouchEnd: this.onSlideChangeEnd,
          onSlideChangeStart: this.onSlideChangeStart,
          onSlideChangeEnd: this.onSlideChangeEnd,
          slidesPerGroup: this.across
        });
      } else {
        this.mySwiper = new Swiper('#' + id + ' .swiper-container', {
          loop: true,
          grabCursor: true,
          slidesPerView: this.across,
          slidesPerGroup: this.across,
          onTouchStart: this.onSlideChangeStart,
          onTouchEnd: this.onSlideChangeEnd,
          onSlideChangeStart: this.onSlideChangeStart,
          onSlideChangeEnd: this.onSlideChangeEnd
        });
      }
    } else {
      this.mySwiper = new Swiper('#' + id + ' .swiper-container', {
        loop: true,
        grabCursor: true,
        slidesPerView: 3,
        slidesPerGroup: 3,
        onTouchStart: this.onSlideChangeStart,
        onTouchEnd: this.onSlideChangeEnd,
        onSlideChangeStart: this.onSlideChangeStart,
        onSlideChangeEnd: this.onSlideChangeEnd
      });
    }
    this.galleryCreated = true;
    if (this.jobsPage === true) {
      return this.jobsInterval = setInterval((function() {
        return $('#jobs-gallery .fa-angle-right').trigger('click');
      }), 8000);
    }
  };

  DraggableGallery.prototype.onSlideChangeStart = function() {
    $(this.$el).closest('.add-border-fade').addClass('showing');
    return $(this.$el).find('.add-border-fade').addClass('showing');
  };

  DraggableGallery.prototype.onSlideChangeEnd = function() {
    var park;
    $(this.$el).closest('.add-border-fade').removeClass('showing');
    $(this.$el).find('.add-border-fade').removeClass('showing');
    if (!(this.controls === null)) {
      park = this.mySwiper.activeSlide().data('id');
      $('#accommodations-gallery .swiper-container').removeClass('active');
      $('#accommodations-gallery .carousel-wrapper').removeClass('active');
      $('#accommodations-gallery div#' + park).addClass('active');
      $('#accommodations-gallery div#' + park).parent().addClass('active');
    }
    if (this.parkList) {
      return this.parkList.selectLogo($(this.$el).find('.swiper-slide-active').data('id'));
    }
  };

  DraggableGallery.prototype.addPagination = function() {
    var wrapper;
    wrapper = $("<div class='swiper-pagination'></div>");
    return $(this.$el).find('.swiper-container').addClass('addPagination').append(wrapper);
  };

  DraggableGallery.prototype.goto = function(id, initVal) {
    var tl, toIndex;
    if (!initVal) {
      $('body').animate({
        scrollTop: $('#' + ($(this.$el).attr('id'))).offset().top
      });
    }
    toIndex = $("li.park[data-id='" + id + "']").data('index');
    tl = new TimelineMax;
    tl.add(TweenMax.to(this.galleryContainer, .4, {
      autoAlpha: 0
    }));
    tl.addCallback((function(_this) {
      return function() {
        return _this.mySwiper.swipeTo(toIndex, 0);
      };
    })(this));
    tl.add(TweenMax.to(this.galleryContainer, .4, {
      autoAlpha: 1
    }));
    return this.currentIndex = toIndex;
  };

  return DraggableGallery;

})(PluginBase);

module.exports = DraggableGallery;



},{"../abstract/PluginBase.coffee":2,"../abstract/ViewBase.coffee":3}],8:[function(require,module,exports){
var FadeGallery, PluginBase, VideoOverlay,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = require('../abstract/PluginBase.coffee');

VideoOverlay = require('./VideoOverlay.coffee');

FadeGallery = (function(superClass) {
  extend(FadeGallery, superClass);

  function FadeGallery(opts) {
    this.handleVideoInteraction = bind(this.handleVideoInteraction, this);
    FadeGallery.__super__.constructor.call(this, opts);
  }

  FadeGallery.prototype.initialize = function(opts) {
    var target;
    console.log('initialize: ', opts);
    this.page = opts.page || null;
    target = opts.target || null;
    if ((target != null)) {
      this.$target = $(target);
    }
    if (!(this.page === null)) {
      this.infoBoxes = this.$el.find("li.video");
    } else {
      this.infoBoxes = this.$el.find("li");
    }
    this.currentSelected = this.infoBoxes.filter(":first-child");
    return FadeGallery.__super__.initialize.call(this);
  };

  FadeGallery.prototype.addEvents = function() {
    return this.infoBoxes.each((function(_this) {
      return function(i, t) {
        var $btn, videoEvents;
        $btn = $(t).find('.video-button');
        if ($btn.length > 0) {
          videoEvents = new Hammer($btn[0]);
          return videoEvents.on('tap', _this.handleVideoInteraction);
        }
      };
    })(this));
  };

  FadeGallery.prototype.handleVideoInteraction = function(e) {
    var $target, data;
    $target = $(e.target).closest(".video-button");
    if ($target.size() === 0) {
      $target = e.target;
    }
    if ($target.data('type') === 'image') {
      if ($target.data('full')) {
        this.imageSrc = $target.data('full');
      } else {
        this.imageSrc = $target.children('img').attr('src');
      }
    }
    data = {
      mp4: $target.data('mp4'),
      webm: $target.data('webm'),
      poster: this.imageSrc
    };
    return VideoOverlay.initVideoOverlay(data);
  };

  FadeGallery.prototype.goto = function(id, initVal) {
    var infoId, pos, target, tl, top;
    infoId = "#" + id + "-info";
    if (!(this.page === null)) {
      target = this.infoBoxes.parents('li.group-info');
    } else {
      target = this.infoBoxes;
    }
    tl = new TimelineMax;
    tl.add(TweenMax.to(target, .4, {
      autoAlpha: 0,
      overwrite: "all"
    }));
    tl.add(TweenMax.to(target.filter(infoId), .4, {
      autoAlpha: 1
    }));
    if ((this.$target != null)) {
      console.log(this.$target);
      top = this.$target.offset().top - ($('header').height());
      console.log(top);
      pos = $('body').scrollTop();
      if (pos < top) {
        return $('body').animate({
          scrollTop: top
        });
      }
    }
  };

  return FadeGallery;

})(PluginBase);

module.exports = FadeGallery;



},{"../abstract/PluginBase.coffee":2,"./VideoOverlay.coffee":12}],9:[function(require,module,exports){
var HeaderAnimation, PluginBase, globals,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

globals = require('../global/index.coffee');

PluginBase = require('../abstract/PluginBase.coffee');

HeaderAnimation = (function(superClass) {
  extend(HeaderAnimation, superClass);

  function HeaderAnimation(opts) {
    this.onClickMobileSubNavLink = bind(this.onClickMobileSubNavLink, this);
    this.handleArrowClick = bind(this.handleArrowClick, this);
    this.hideMobileSubNav = bind(this.hideMobileSubNav, this);
    this.showMobileSubNav = bind(this.showMobileSubNav, this);
    this.adjustMobileNav = bind(this.adjustMobileNav, this);
    this.toggleNav = bind(this.toggleNav, this);
    this.handleSubNav = bind(this.handleSubNav, this);
    this.hideSubNavLinks = bind(this.hideSubNavLinks, this);
    this.showSubNavLinks = bind(this.showSubNavLinks, this);
    this.hideSubNav = bind(this.hideSubNav, this);
    this.showSubNav = bind(this.showSubNav, this);
    this.handleNavHover = bind(this.handleNavHover, this);
    this.animateHeader = bind(this.animateHeader, this);
    this.positionSubNavLists = bind(this.positionSubNavLists, this);
    this.handleResize = bind(this.handleResize, this);
    this.toggleNav = bind(this.toggleNav, this);
    this.showInitialSubNav = bind(this.showInitialSubNav, this);
    this.handleSubNav = bind(this.handleSubNav, this);
    this.body = $("body");
    this.html = $("html");
    this.content = $("#content");
    this.mobnav = $("#mobile-header-nav");
    this.subnav = $(".subnav");
    this.subnavShowing = false;
    this.ourParksLeft = $('.nav-list a[data-page="our-parks"]').offset().left;
    this.partnershipLeft = $('.nav-list a[data-page="partnerships"]').offset().left;
    HeaderAnimation.__super__.constructor.call(this, opts);
  }

  HeaderAnimation.prototype.initialize = function() {
    HeaderAnimation.__super__.initialize.call(this);
    return this.showInitialSubNav();
  };

  HeaderAnimation.prototype.addEvents = function() {
    if (!$('html').hasClass('tablet')) {
      $('.nav-list a li').on('mouseenter', this.handleNavHover);
      $('header').on('mouseleave', this.hideSubNav);
    }
    window.onresize = this.handleResize;
    this.body.find("#navbar-menu").on('click', this.toggleNav);
    $('#mobile-header-nav a').on('click', this.showMobileSubNav);
    $('#mobile-header-nav i').on('click', this.handleArrowClick);
    this.body.find('.toggle-nav').on('click', function() {
      return $(this).parents('header').find('#navbar-menu img').trigger('click');
    });
    return $('#mobile-header-nav').on('click', '.mobile-sub-nav li', this.onClickMobileSubNavLink);
  };

  HeaderAnimation.prototype.handleSubNav = function() {
    var id, startPage;
    startPage = $('.subnav').data('page');
    id = $('.nav-list a[data-page-short="' + startPage + '"]').data('page');
    return this.showSubNavLinks(id);
  };

  HeaderAnimation.prototype.showInitialSubNav = function() {
    var section;
    section = $('.subnav').data('page');
    if (section === 'offerings' || section === 'accommodations' || section === 'ourparks') {
      return this.showSubNavLinks('our-parks');
    } else if (section === 'partnership-details' || section === 'partnership') {
      return this.showSubNavLinks('partnerships');
    }
  };

  HeaderAnimation.prototype.toggleNav = function(e) {};

  HeaderAnimation.prototype.handleResize = function() {
    this.handleSubNav();
    return this.adjustMobileNav();
  };

  HeaderAnimation.prototype.positionSubNavLists = function() {
    if ($('#header-top').hasClass('small')) {
      if (window.innerWidth < 993) {
        $('#our-parks-subnav-list').css('left', this.ourParksLeft - 90);
        return $('#partnerships-subnav-list').css('left', this.partnershipLeft - 133);
      } else {
        $('#our-parks-subnav-list').css('left', this.ourParksLeft - 90);
        return $('#partnerships-subnav-list').css('left', this.partnershipLeft - 118);
      }
    } else {
      if (window.innerWidth < 993) {
        $('#our-parks-subnav-list').css('left', this.ourParksLeft - 60);
        return $('#partnerships-subnav-list').css('left', this.partnershipLeft - 105);
      } else {
        $('#our-parks-subnav-list').css('left', this.ourParksLeft - 60);
        return $('#partnerships-subnav-list').css('left', this.partnershipLeft - 90);
      }
    }
  };

  HeaderAnimation.prototype.animateHeader = function(scrollY) {
    var $hb, $ht;
    if (this.html.hasClass('phone')) {
      return;
    }
    $ht = this.$el.find('#header-top');
    $hb = this.$el.find('#header-bottom');
    if (scrollY > 85) {
      if (!this.navCollapsed) {
        $('#header-top, #header-bottom, #navbar-logo, .nav-list, #buy, .header-contact, .header-social').addClass('small');
        this.navCollapsed = true;
        return this.positionSubNavLists();
      }
    } else {
      if (this.navCollapsed) {
        $('#header-top, #header-bottom, #navbar-logo, .nav-list, #buy, .header-contact, .header-social').removeClass('small');
        this.navCollapsed = false;
        this.handleSubNav();
        return this.positionSubNavLists();
      }
    }
  };

  HeaderAnimation.prototype.handleNavHover = function(e) {
    var parentID;
    parentID = $(e.target).parent().data('page');
    if ($('#' + parentID + '-subnav-list').find('a').length < 1) {
      return this.hideSubNav();
    } else {
      this.hideSubNavLinks();
      this.showSubNavLinks(parentID);
      if (!this.subnavShowing) {
        return this.showSubNav();
      }
    }
  };

  HeaderAnimation.prototype.showSubNav = function() {
    this.subnav.addClass('showing');
    return this.subnavShowing = true;
  };

  HeaderAnimation.prototype.hideSubNav = function() {
    this.subnav.removeClass('showing');
    this.subnavShowing = false;
    return this.handleSubNav();
  };

  HeaderAnimation.prototype.showSubNavLinks = function(page) {
    var a, helper, i, left, len, offset, ref;
    if (page != null) {
      left = $('.nav .nav-list a[data-page="' + page + '"]').position().left;
      offset = 0;
      helper = -45;
      if (window.innerWidth < 993) {
        helper = -20;
      }
      if ($('#' + page + '-subnav-list a').length < 3) {
        ref = $('#' + page + '-subnav-list a');
        for (i = 0, len = ref.length; i < len; i++) {
          a = ref[i];
          offset = offset + $(a).width();
        }
      }
      if (offset > 0) {
        $('#' + page + '-subnav-list').css('left', left - (offset / 3));
      } else {
        this.positionSubNavLists();
      }
      return $('#' + page + '-subnav-list').addClass('showing');
    }
  };

  HeaderAnimation.prototype.hideSubNavLinks = function() {
    return $('.subnav-list li').removeClass('showing');
  };

  HeaderAnimation.prototype.handleSubNav = function() {
    if ($('#header-bottom .subnav').hasClass('ourparks') || $('#header-bottom .subnav').hasClass('offerings') || $('#header-bottom .subnav').hasClass('accommodations')) {
      $('ul.subnav-list li').removeClass('showing');
      $('#our-parks-subnav-list').addClass('showing');
      this.showSubNavLinks('our-parks');
      if ($('#header-bottom .subnav').hasClass('offerings')) {
        $('a#our-parks-offerings-subnav-link').addClass('selected');
      }
      if ($('#header-bottom .subnav').hasClass('accommodations')) {
        return $('a#our-parks-accommodations-subnav-link').addClass('selected');
      }
    } else if ($('#header-bottom .subnav').hasClass('partnership') || $('#header-bottom .subnav').hasClass('partnership-details')) {
      $('ul.subnav-list li').removeClass('showing');
      $('#partnerships-subnav-list').addClass('showing');
      return this.showSubNavLinks('partnerships');
    }
  };

  HeaderAnimation.prototype.toggleNav = function(e) {
    var $hb, $hh, $mn, $t;
    e.preventDefault();
    $t = $(e.target);
    $hb = $('#header-bottom');
    $mn = $('#mobile-header-nav');
    $hh = $hb.height();
    $t.toggleClass('closed');
    console.log('second toggle');
    console.log($t);
    if ($t.hasClass('closed')) {
      this.adjustMobileNav();
      return TweenMax.to(this.mobnav, .35, {
        y: 800 + $hh,
        z: 0,
        ease: Power1.easeOut,
        onComplete: (function(_this) {
          return function() {
            return TweenMax.set(_this.mobnav, {
              z: 10
            });
          };
        })(this)
      });
    } else {
      TweenMax.set(this.mobnav, {
        z: -2
      });
      TweenMax.to(this.mobnav, .5, {
        y: 0,
        z: 0,
        ease: Power1.easeIn
      });
      $('.mobile-sub-nav').css('height', '0px');
      this.adjustMobileNav;
      this.hideMobileSubNav();
      return TweenMax.set(this.content, {
        y: 0
      });
    }
  };

  HeaderAnimation.prototype.adjustMobileNav = function() {
    var $hb, $hh, $ih, $iw, $mb, $mn, $nh;
    $hb = $('#header-bottom');
    $mn = $('#mobile-header-nav');
    $hh = $hb.height();
    $nh = $mn.height();
    $iw = window.innerWidth;
    $ih = window.innerHeight;
    $mb = $('#navbar-menu');
    if ($nh > $ih) {
      return $mn.css({
        height: $ih - $hh,
        overflow: 'scroll'
      });
    } else {
      return $mn.css({
        height: 400 + 'px'
      });
    }
  };

  HeaderAnimation.prototype.showMobileSubNav = function(e) {
    var howMany, target, thisSubNav, windowHeight;
    thisSubNav = $(e.target).parent().find('.mobile-sub-nav');
    if (thisSubNav.find('li').length < 1) {
      this.hideMobileSubNav();
      $(e.target).addClass('active');
      return;
    }
    if (!($(e.target).parent().hasClass('active'))) {
      e.preventDefault();
    }
    howMany = thisSubNav.find('li').length;
    windowHeight = window.innerHeight;
    target = $(e.target);
    this.hideMobileSubNav();
    target.find('i').addClass('active');
    target.addClass('active');
    target.parents('a').addClass('active');
    this.mobnav.css('height', (windowHeight - 100) + 'px');
    return thisSubNav.css('height', (howMany * 50) + 'px');
  };

  HeaderAnimation.prototype.hideMobileSubNav = function() {
    $('.mobile-sub-nav').css('height', '0px');
    this.mobnav.css('height', '400px');
    this.mobnav.find('i').removeClass('active');
    this.mobnav.find('li').removeClass('active');
    return this.mobnav.find('ul a').removeClass('active');
  };

  HeaderAnimation.prototype.handleArrowClick = function(e) {
    e.stopPropagation();
    e.preventDefault();
    if ($(e.target).hasClass('active')) {
      return this.hideMobileSubNav();
    } else {
      return $(e.target).parents('li').trigger('click');
    }
  };

  HeaderAnimation.prototype.onClickMobileSubNavLink = function(e) {
    var url;
    e.preventDefault();
    e.stopPropagation();
    if ($(e.target).data('href') != null) {
      url = $(e.target).data('href');
      return window.location.href = url;
    }
  };

  return HeaderAnimation;

})(PluginBase);

module.exports = HeaderAnimation;



},{"../abstract/PluginBase.coffee":2,"../global/index.coffee":4}],10:[function(require,module,exports){
var ParksList, PluginBase, VideoOverlay,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = require('../abstract/PluginBase.coffee');

VideoOverlay = require('./VideoOverlay.coffee');

ParksList = (function(superClass) {
  extend(ParksList, superClass);

  function ParksList(opts) {
    this.selectLogo = bind(this.selectLogo, this);
    this.showNewAccommodations = bind(this.showNewAccommodations, this);
    this.handleLogoInteraction = bind(this.handleLogoInteraction, this);
    this.$el = $(opts.el);
    ParksList.__super__.constructor.call(this, opts);
    this.gallery = opts.gallery;
    if (this.gallery != null) {
      this.gallery.on("itemIndex", this.selectLogo);
    }
    this.page = opts.page;
  }

  ParksList.prototype.initialize = function() {
    this.parkLogos = $(this.$el).find("li");
    this.currentSelected = this.parkLogos.filter(":first-child");
    if (this.gallery != null) {
      this.selectLogo(this.selectedLogo());
      this.gallery.goto(this.selectedLogo(), true);
    }
    return ParksList.__super__.initialize.call(this);
  };

  ParksList.prototype.addEvents = function() {
    this.$el.on('click', 'li.park', this.handleLogoInteraction);
    return this.parkLogos.each((function(_this) {
      return function(i, t) {
        var logoEvents;
        logoEvents = new Hammer(t);
        return logoEvents.on('tap', _this.handleLogoInteraction);
      };
    })(this));
  };

  ParksList.prototype.handleLogoInteraction = function(e) {
    var $target, id, whichPark;
    if (this.page === 'accommodation') {
      this.parkLogos.removeClass('selected');
      $(e.target).parents('li.park').addClass('selected');
      whichPark = $(e.target).parents('li.park').attr('id');
      this.showNewAccommodations(whichPark);
      return false;
    }
    $target = $(e.target).closest('li');
    id = $target.data('id');
    return this.displayContent(id);
  };

  ParksList.prototype.showNewAccommodations = function(park) {
    $('#accommodations-gallery .swiper-container').removeClass('active');
    $('#accommodations-gallery .carousel-wrapper').removeClass('active');
    $('#accommodations-gallery .swiper-container[data-logo="' + park + '"]').addClass('active');
    return $('#accommodations-gallery .swiper-container[data-logo="' + park + '"]').parent().addClass('active');
  };

  ParksList.prototype.displayContent = function(id) {
    this.selectLogo(id);
    return this.gallery.goto(id);
  };

  ParksList.prototype.selectLogo = function(id) {
    var logoId;
    logoId = "#" + id + "-logo";
    this.parkLogos.removeClass('selected');
    return this.parkLogos.filter(logoId).addClass('selected');
  };

  ParksList.prototype.selectedLogo = function() {
    return this.parkLogos.parent().find('li.selected').data('id');
  };

  return ParksList;

})(PluginBase);

module.exports = ParksList;



},{"../abstract/PluginBase.coffee":2,"./VideoOverlay.coffee":12}],11:[function(require,module,exports){
var SvgInject,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

SvgInject = (function() {
  function SvgInject(selector) {
    this.onLoadComplete = bind(this.onLoadComplete, this);
    this.onSvgLoaded = bind(this.onSvgLoaded, this);
    this.$svgs = $(selector);
    this.preloader = new createjs.LoadQueue(true, "", true);
    this.preloader.setMaxConnections(10);
    this.preloader.addEventListener('fileload', this.onSvgLoaded);
    this.preloader.addEventListener('complete', this.onLoadComplete);
    this.manifest = [];
    this.collectSvgUrls();
    this.loadSvgs();
  }

  SvgInject.prototype.collectSvgUrls = function() {
    var self;
    self = this;
    return this.$svgs.each(function() {
      var id, svgUrl;
      id = "svg-inject-" + (parseInt(Math.random() * 1000).toString());
      $(this).attr('id', id);
      $(this).attr('data-arb', "abc123");
      svgUrl = $(this).attr('src');
      return self.manifest.push({
        id: id,
        src: svgUrl
      });
    });
  };

  SvgInject.prototype.loadSvgs = function() {
    return this.preloader.loadManifest(this.manifest);
  };

  SvgInject.prototype.injectSvg = function(id, svgData) {
    var $el, cls, dimensions, imgClass, imgData, imgID, oh, ow, svg;
    $el = $("#" + id);
    imgID = $el.attr('id');
    imgClass = $el.attr('class');
    imgData = $el.clone(true).data() || [];
    dimensions = {
      w: $el.attr('width'),
      h: $el.attr('height')
    };
    svg = $(svgData).filter('svg');
    if (typeof imgID !== 'undefined') {
      svg = svg.attr("id", imgID);
    }
    if (typeof imgClass !== 'undefined') {
      cls = (svg.attr("class") !== 'undefined' ? svg.attr("class") : "");
      svg = svg.attr("class", imgClass + " " + cls + " replaced-svg");
    }
    $.each(imgData, function(name, value) {
      svg[0].setAttribute("data-" + name, value);
    });
    svg = svg.removeAttr("xmlns:a");
    ow = parseFloat(svg.attr("width"));
    oh = parseFloat(svg.attr("height"));
    if (dimensions.w && dimensions.h) {
      $(svg).attr("width", dimensions.w);
      $(svg).attr("height", dimensions.h);
    } else if (dimensions.w) {
      $(svg).attr("width", dimensions.w);
      $(svg).attr("height", (oh / ow) * dimensions.w);
    } else if (dimensions.h) {
      $(svg).attr("height", dimensions.h);
      $(svg).attr("width", (ow / oh) * dimensions.h);
    }
    return $el.replaceWith(svg);
  };

  SvgInject.prototype.onSvgLoaded = function(e) {
    return this.injectSvg(e.item.id, e.rawResult);
  };

  SvgInject.prototype.onLoadComplete = function(e) {};

  return SvgInject;

})();

module.exports = SvgInject;



},{}],12:[function(require,module,exports){
var VideoOverlay, overlay,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

VideoOverlay = (function() {
  function VideoOverlay(el) {
    this.showImage = bind(this.showImage, this);
    this.playVideo = bind(this.playVideo, this);
    this.closeOverlay = bind(this.closeOverlay, this);
    this.$el = $(el);
    this.$inner = this.$el.find(".overlay-inner");
    this.$container = this.$el.find(".overlay-inner-container");
    if (this.$container.find('.overlay-content').size() === 1) {
      this.$container = this.$container.find('.overlay-content');
    }
    this.$close = this.$el.find(".overlay-close");
    this.createVideoInstance();
    this.createOverlayTransition();
    this.addEvents();
  }

  VideoOverlay.prototype.createOverlayTransition = function() {
    this.tl = new TimelineMax;
    this.$el.show();
    this.tl.add(TweenMax.fromTo($('#overlay'), .01, {
      zIndex: -1,
      display: 'none',
      z: 0
    }, {
      zIndex: 5000,
      display: 'block',
      z: 9999999999
    }));
    this.tl.add(TweenMax.to(this.$el, .35, {
      autoAlpha: 1
    }));
    this.tl.add(TweenMax.to(this.$inner, .55, {
      alpha: 1
    }));
    this.tl.add(TweenMax.to(this.$close, .25, {
      alpha: 1
    }, "-=.15"));
    this.tl.addLabel("initContent");
    return this.tl.stop();
  };

  VideoOverlay.prototype.createVideoInstance = function() {};

  VideoOverlay.prototype.addEvents = function() {
    return this.closeEvent = new Hammer(this.$close[0]);
  };

  VideoOverlay.prototype.transitionInOverlay = function(next) {
    console.log('transitionInOverlay');
    this.transInCb = next;
    this.tl.addCallback(this.transInCb, "initContent");
    this.tl.play();
    return this.closeEvent.on('tap', this.closeOverlay);
  };

  VideoOverlay.prototype.transitionOutOverlay = function() {
    console.log('transitionOutOverlay');
    this.closeEvent.off('tap', this.closeOverlay);
    this.tl.removeCallback(this.transInCb);
    this.tl.reverse();
    return delete this.transInCb;
  };

  VideoOverlay.prototype.closeOverlay = function(e) {
    this.removeVideo();
    return this.transitionOutOverlay();
  };

  VideoOverlay.prototype.removeVideo = function() {
    if (this.videoInstance) {
      this.videoInstance.pause();
      return this.videoInstance.currentTime(0);
    }
  };

  VideoOverlay.prototype.resizeOverlay = function() {
    var $h, $vid, $w;
    $vid = this.$el.find('video');
    $w = window.innerWidth;
    return $h = $vid.height();
  };

  VideoOverlay.prototype.appendData = function(data) {
    var mp4, webm;
    if (data.mp4 === "" || (data.mp4 == null)) {
      console.log('no video, its an image');
      this.poster = $("<div class='video-js'><img class='vjs-tech' src='" + data.poster + "' class='media-image-poster' /></div>");
      this.$container.html(this.poster);
      this.poster.css('height', '100%');
      this.removeVideo();
      return false;
    }
    mp4 = $("<source src=\"" + data.mp4 + "\" type=\"video/mp4\" /> ");
    webm = $("<source src=\"" + data.webm + "\" type=\"video/webm\" /> ");
    this.$videoEl = $("<video id='overlay-player' class='vjs-default-skin video-js' controls preload='auto' />");
    this.$videoEl.append(mp4);
    this.$videoEl.append(webm);
    this.$container.html(this.$videoEl);
    if (this.videoInstance != null) {
      this.videoInstance.dispose();
    }
    return this.videoInstance = videojs("overlay-player", {
      width: "100%",
      height: "100%"
    });
  };

  VideoOverlay.prototype.playVideo = function() {
    if (this.videoInstance != null) {
      return this.videoInstance.play();
    }
  };

  VideoOverlay.prototype.showImage = function() {
    return console.log('showImage');
  };

  return VideoOverlay;

})();

overlay = new VideoOverlay("#overlay");

module.exports.initVideoOverlay = function(data) {
  console.log('data2: ', data);
  overlay.appendData(data);
  if (!(data.mp4 === "")) {
    console.log('data.mp4 !== ""');
    return overlay.transitionInOverlay(overlay.playVideo);
  } else {
    console.log('data.mp4 === ""');
    return overlay.transitionInOverlay(overlay.showImage);
  }
};



},{}],13:[function(require,module,exports){
var ScrollBar, ViewBase,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ViewBase = require("../abstract/ViewBase.coffee");

ScrollBar = (function(superClass) {
  extend(ScrollBar, superClass);

  function ScrollBar() {
    this.showScrollbar = bind(this.showScrollbar, this);
    this.hideScrollbar = bind(this.hideScrollbar, this);
    this.onResize = bind(this.onResize, this);
    this.onMouseMove = bind(this.onMouseMove, this);
    this.onHandleUp = bind(this.onHandleUp, this);
    this.onHandleDown = bind(this.onHandleDown, this);
    this.onRailClick = bind(this.onRailClick, this);
    this.updateHandle = bind(this.updateHandle, this);
    this.setEvents = bind(this.setEvents, this);
    return ScrollBar.__super__.constructor.apply(this, arguments);
  }

  ScrollBar.prototype.scrolling = false;

  ScrollBar.prototype.offsetY = 0;

  ScrollBar.prototype.position = 0;

  ScrollBar.prototype.hideTimeout = 0;

  ScrollBar.prototype.initialize = function() {
    this.onResize();
    this.setEvents();
    if (window.isTierTablet) {
      return this.$el.hide();
    }
  };

  ScrollBar.prototype.setEvents = function() {
    this.delegateEvents({
      "mousedown .handle": "onHandleDown",
      "click .rail": "onRailClick"
    });
    $(document).on("mouseup", this.onHandleUp);
    return $(document).on("mousemove", this.onMouseMove);
  };

  ScrollBar.prototype.updateHandle = function(pos) {
    this.position = pos;
    this.$el.find('.handle').css({
      top: this.position * ($(window).height() - this.$el.find(".handle").height())
    });
    this.showScrollbar();
    return this.hideScrollbar();
  };

  ScrollBar.prototype.onRailClick = function(e) {
    this.offsetY = e.offsetY !== void 0 ? e.offsetY : e.originalEvent.layerY;
    this.position = this.offsetY / $(window).height();
    return this.trigger("customScrollJump", this.position);
  };

  ScrollBar.prototype.onHandleDown = function(e) {
    this.$el.css({
      width: "100%"
    });
    this.offsetY = e.offsetY !== void 0 ? e.offsetY : e.originalEvent.layerY;
    return this.scrolling = true;
  };

  ScrollBar.prototype.onHandleUp = function(e) {
    this.$el.css({
      width: "15px"
    });
    return this.scrolling = false;
  };

  ScrollBar.prototype.onMouseMove = function(e) {
    if (this.scrolling) {
      if (e.pageY - this.offsetY <= 0) {
        $(".handle").css({
          top: 1
        });
      } else if (e.pageY - this.offsetY >= $(window).height() - $("#scrollbar .handle").height()) {
        $(".handle").css({
          top: ($(window).height() - $("#scrollbar .handle").height()) - 1
        });
      } else {
        $(".handle").css({
          top: e.pageY - this.offsetY
        });
      }
      this.position = parseInt($("#scrollbar .handle").css("top")) / ($(window).height() - $("#scrollbar .handle").height());
      if (this.position < parseFloat(.005)) {
        this.position = 0;
      } else if (this.position > parseFloat(.995)) {
        this.position = 1;
      }
      this.trigger("customScroll", this.position);
    }
    if (this.mouseX !== e.clientX && this.mouseY !== e.clientY) {
      this.showScrollbar();
      this.hideScrollbar();
    }
    this.mouseX = e.clientX;
    return this.mouseY = e.clientY;
  };

  ScrollBar.prototype.onResize = function(e) {
    this.$el.find('.handle').css({
      height: ($(window).height() / $("section").height()) * $(window).height()
    });
    return this.updateHandle(this.position);
  };

  ScrollBar.prototype.hideScrollbar = function() {
    if (this.hideTimeout != null) {
      clearTimeout(this.hideTimeout);
    }
    return this.hideTimeout = setTimeout(((function(_this) {
      return function() {
        if (_this.mouseY > 72) {
          return TweenMax.to(_this.$el, .5, {
            autoAlpha: 0
          });
        }
      };
    })(this)), 2000);
  };

  ScrollBar.prototype.showScrollbar = function() {
    return TweenMax.to(this.$el, .5, {
      autoAlpha: .5
    });
  };

  return ScrollBar;

})(ViewBase);

module.exports = ScrollBar;



},{"../abstract/ViewBase.coffee":3}],14:[function(require,module,exports){
var Sharer;

Sharer = (function() {
  function Sharer() {}

  Sharer.initFacebook = function() {
    return FB.init({
      appId: "215224705307341",
      channelUrl: "/channel.html",
      status: true,
      xfbl: true
    });
  };

  Sharer.shareTwitter = function(shareMessage, url, hashtags) {
    var text, twURL;
    text = shareMessage;
    hashtags = "";
    url = url;
    twURL = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(url);
    if (hashtags) {
      str += "&hashtags=" + hashtags;
    }
    return this.openPopup(575, 420, twURL, "Twitter");
  };

  Sharer.shareFacebook = function(name, caption, description, link, picture) {
    return FB.ui({
      method: "feed",
      link: link,
      picture: picture,
      name: name,
      caption: caption,
      description: description
    });
  };

  Sharer.shareGoogle = function(url) {
    return this.openPopup(600, 400, "https://plus.google.com/share?url=" + url, "Google");
  };

  Sharer.sharePinterest = function(url, description, picture) {
    description = description.split(" ").join("+");
    return this.openPopup(780, 320, "http://pinterest.com/pin/create/button/?url=" + (encodeURIComponent(url)) + "&amp;description=" + description + "&amp;media=" + (encodeURIComponent(picture)));
  };

  Sharer.emailLink = function(subject, body) {
    var x;
    x = this.openPopup(1, 1, "mailto:&subject=" + (encodeURIComponent(subject)) + "&body=" + (encodeURIComponent(body)));
    return x.close();
  };

  Sharer.openPopup = function(w, h, url, name) {
    return window.open(url, name, "status=1,width=" + w + ",height=" + h + ",left=" + (screen.width - w) / 2 + ",top=" + (screen.height - h) / 2);
  };

  return Sharer;

})();

module.exports = Sharer;



},{}],15:[function(require,module,exports){
var AnimationBase, DraggableGallery, FadeGallery, HeaderAnimation, ParksList;

DraggableGallery = require('./com/plugins/DraggableGallery.coffee');

FadeGallery = require('./com/plugins/FadeGallery.coffee');

ParksList = require('./com/plugins/ParksList.coffee');

HeaderAnimation = require('./com/plugins/HeaderAnimation.coffee');

AnimationBase = require('./com/abstract/AnimationBase.coffee');

$(document).ready(function() {
  var legal;
  return legal = new AnimationBase({
    el: "body"
  });
});



},{"./com/abstract/AnimationBase.coffee":1,"./com/plugins/DraggableGallery.coffee":7,"./com/plugins/FadeGallery.coffee":8,"./com/plugins/HeaderAnimation.coffee":9,"./com/plugins/ParksList.coffee":10}]},{},[15])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvQW5pbWF0aW9uQmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvVmlld0Jhc2UuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL2dsb2JhbC9pbmRleC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvYW5pbWF0aW9ucy9jbG91ZHMuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvQmFzaWNPdmVybGF5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0RyYWdnYWJsZUdhbGxlcnkuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvRmFkZUdhbGxlcnkuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvSGVhZGVyQW5pbWF0aW9uLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL1BhcmtzTGlzdC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9TdmdJbmplY3QuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvVmlkZW9PdmVybGF5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS91dGlsL1Njcm9sbEJhci5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vdXRpbC9TaGFyZXIuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvbGVnYWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQ0EsSUFBQSwyREFBQTtFQUFBOzs2QkFBQTs7QUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLG1CQUFSLENBQVgsQ0FBQTs7QUFBQSxTQUNBLEdBQVksT0FBQSxDQUFRLDBCQUFSLENBRFosQ0FBQTs7QUFBQSxlQUVBLEdBQWtCLE9BQUEsQ0FBUSxtQ0FBUixDQUZsQixDQUFBOztBQUFBLE1BR0EsR0FBUyxPQUFBLENBQVEsbUNBQVIsQ0FIVCxDQUFBOztBQUFBO0FBUUksbUNBQUEsQ0FBQTs7QUFBYSxFQUFBLHVCQUFDLEVBQUQsR0FBQTtBQUNULHlEQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLHlDQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsMkRBQUEsQ0FBQTtBQUFBLElBQUEsK0NBQU0sRUFBTixDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFEWixDQUFBO0FBQUEs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eUMsUUFBekMsR0FBb0QsQ0FBQyxNQUFNLENBQUMsS0FBUCxHQUFlLENBQWhCLENBQUEsR0FBcUIsQ0FBekUsR0FBNkUsT0FBN0UsR0FBdUYsQ0FBQyxNQUFNLENBQUMsTUFBUCxHQUFnQixDQUFqQixDQUFBLEdBQXNCLENBQXBJLEVBRGU7RUFBQSxDQTNDbkIsQ0FBQTs7Z0JBQUE7O0lBSEosQ0FBQTs7QUFBQSxNQWtETSxDQUFDLE9BQVAsR0FBaUIsTUFsRGpCLENBQUE7Ozs7O0FDRkEsSUFBQSx3RUFBQTs7QUFBQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsdUNBQVIsQ0FBbkIsQ0FBQTs7QUFBQSxXQUNBLEdBQWMsT0FBQSxDQUFRLGtDQUFSLENBRGQsQ0FBQTs7QUFBQSxTQUVBLEdBQVksT0FBQSxDQUFRLGdDQUFSLENBRlosQ0FBQTs7QUFBQSxlQUlBLEdBQWtCLE9BQUEsQ0FBUSxzQ0FBUixDQUpsQixDQUFBOztBQUFBLGFBS0EsR0FBZ0IsT0FBQSxDQUFRLHFDQUFSLENBTGhCLENBQUE7O0FBQUEsQ0FRQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEtBQVosQ0FBa0IsU0FBQSxHQUFBO0FBSWQsTUFBQSxLQUFBO1NBQUEsS0FBQSxHQUFZLElBQUEsYUFBQSxDQUNSO0FBQUEsSUFBQSxFQUFBLEVBQUksTUFBSjtHQURRLEVBSkU7QUFBQSxDQUFsQixDQVJBLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5WaWV3QmFzZSA9IHJlcXVpcmUgXCIuL1ZpZXdCYXNlLmNvZmZlZVwiXG5TY3JvbGxCYXIgPSByZXF1aXJlIFwiLi4vdXRpbC9TY3JvbGxCYXIuY29mZmVlXCJcbkhlYWRlckFuaW1hdGlvbiA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvSGVhZGVyQW5pbWF0aW9uLmNvZmZlZSdcbmNsb3VkcyA9IHJlcXVpcmUgJy4uL3BhZ2VzL2FuaW1hdGlvbnMvY2xvdWRzLmNvZmZlZSdcblxuY2xhc3MgQW5pbWF0aW9uQmFzZSBleHRlbmRzIFZpZXdCYXNlXG5cblxuICAgIGNvbnN0cnVjdG9yOiAoZWwpIC0+XG4gICAgICAgIHN1cGVyKGVsKVxuICAgICAgICBAdGltZWxpbmUgPSBudWxsXG4gICAgICAgIEB0b3VjaFkgPSAwXG4gICAgICAgIEB0b3VjaFlMYXN0ID0gMFxuICAgICAgICBAZ2xvYmFsU2Nyb2xsQW1vdW50ID0gaWYgQGlzVGFibGV0IHRoZW4gLjUgZWxzZSAxXG4gICAgICAgIEBwcmV2U2Nyb2xsVG8gPSAwXG4gICAgICAgIEBwcmV2RGVsdGEgPSAwXG4gICAgICAgIEBjdXJyZW50UHJvZ3Jlc3MgPSAwXG4gICAgICAgIEB0b3RhbEFuaW1hdGlvblRpbWUgPSAxMFxuICAgICAgICBAc21vb3RoTXVsdGlwbGllciA9IDVcbiAgICAgICAgQG5hdlRpbWVyID0gbnVsbFxuICAgICAgICBAdmlkZW8gPSBudWxsXG4gICAgICAgIEBpbmxpbmVWaWRlbyA9IG51bGxcbiAgICAgICAgQGlzVGFibGV0ID0gJCgnaHRtbCcpLmhhc0NsYXNzKCd0YWJsZXQnKVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIGlmICFAaXNQaG9uZSAgXG4gICAgICAgICAgICBAcmVzZXRUaW1lbGluZSgpXG4gICAgICAgICAgICBAdG9nZ2xlVG91Y2hNb3ZlKClcbiAgICAgICAgICAgIEBvblJlc2l6ZSgpXG4gICAgICAgICAgICBAdXBkYXRlVGltZWxpbmUoKVxuXG4gICAgaW5pdENvbXBvbmVudHM6IC0+XG4gICAgICAgIEBoZWFkZXIgPSBuZXcgSGVhZGVyQW5pbWF0aW9uIFxuICAgICAgICAgICAgZWw6J2hlYWRlcidcblxuICAgIFxuXG5cbiAgICB0b2dnbGVUb3VjaE1vdmU6ICgpID0+XG4gICAgICAgICQoZG9jdW1lbnQpLm9mZiAnc2Nyb2xsJyAsIEBvblNjcm9sbFxuICAgICAgICBcbiAgICAgICAgQHNjcm9sbCA9XG4gICAgICAgICAgICBwb3NpdGlvbjogMFxuICAgICAgICAgICAgc2Nyb2xsVG9wOiAwXG4gICAgICAgICQoZG9jdW1lbnQpLnNjcm9sbCBAb25TY3JvbGxcbiAgICAgICAgQG9uU2Nyb2xsKClcblxuXG4gICAgZ2V0U2Nyb2xsYWJsZUFyZWE6IC0+XG4gICAgICAgIE1hdGguYWJzKCQoXCIjY29udGVudFwiKS5vdXRlckhlaWdodCgpIC0gQHN0YWdlSGVpZ2h0KVxuICAgIFxuICAgIGdldFNjcm9sbFRvcDogLT5cbiAgICAgICAgJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkgLyBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAgICAgXG4gICAgXG4gICAgXG4gICAgc2V0U2Nyb2xsVG9wOiAocGVyKSAtPiAgICAgIFxuICAgICAgICBwb3MgPSBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAqIHBlclxuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8gMCAsIHBvc1xuXG5cbiAgICBzZXREcmFnZ2FibGVQb3NpdGlvbjogKHBlcikgLT4gICAgICAgIFxuICAgICAgICBwb3MgPSBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAqIHBlciAgICAgICAgXG4gICAgICAgIFR3ZWVuTWF4LnNldCAkKFwiI2NvbnRlbnRcIikgLFxuICAgICAgICAgICAgeTogLXBvcyBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgb25TY3JvbGw6IChlKSA9PlxuICAgICAgICBpZiAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSA+IDMwXG4gICAgICAgICAgICAkKCcuY2lyYy1idG4td3JhcHBlcicpLmFkZENsYXNzICdpbnZpc2libGUnXG4gICAgICAgICAgICBcbiAgICAgICAgQHNjcm9sbC5wb3NpdGlvbiA9IEBnZXRTY3JvbGxUb3AoKVxuICAgICAgICBAc2Nyb2xsLnNjcm9sbFRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpXG4gICAgICAgIEB1cGRhdGVUaW1lbGluZSgpICAgICAgICBcbiAgICAgICAgXG5cbiAgICBvbkRyYWc6IChlKSA9PlxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEBzY3JvbGwucG9zaXRpb24gPSBNYXRoLmFicyBAc2Nyb2xsLnkgLyAgQGdldFNjcm9sbGFibGVBcmVhKClcbiAgICAgICAgQHNjcm9sbC5zY3JvbGxUb3AgPSAtQHNjcm9sbC55XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVUaW1lbGluZSgpXG5cblxuICAgIG9uUmVzaXplOiA9PlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIGlmICFAaXNUYWJsZXRcbiAgICAgICAgICAgIEByZXNldFRpbWVsaW5lKClcbiAgICAgICAgICAgIFxuICAgICAgICBAY2VudGVyT2Zmc2V0ID0gKEBzdGFnZUhlaWdodCAqIC42NjY3KVxuICAgICAgICBpZiBAc2Nyb2xsP1xuICAgICAgICAgICAgcG9zID0gQHNjcm9sbC5wb3NpdGlvbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHRvZ2dsZVRvdWNoTW92ZSgpXG4gICAgICAgICAgICBpZiAhQGlzVGFibGV0XG4gICAgICAgICAgICAgICAgQHNldFNjcm9sbFRvcChwb3MpXG4gICAgICAgICAgICBcblxuICAgIHJlc2V0VGltZWxpbmU6ID0+XG4gICAgICAgIEB0aW1lbGluZSA9IG5ldyBUaW1lbGluZU1heFxuICAgICAgICBAdHJpZ2dlcnMgPSBbXVxuICAgICAgICBAcGFyYWxsYXggPSBbXVxuXG4gICAgICAgICQoJ1tkYXRhLWNsb3VkXScpLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgICRlbCA9ICQodClcbiAgICAgICAgICAgICRjbG9zZXN0Q29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJ1tkYXRhLWNsb3VkLWNvbnRhaW5lcl0nKVxuICAgICAgICAgICAgaW5pdFBvcyA9ICRjbG9zZXN0Q29udGFpbmVyLmRhdGEoKS5jbG91ZENvbnRhaW5lci5pbml0UG9zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2xvdWRGdW5jdGlvbiA9IGNsb3Vkc1xuICAgICAgICAgICAgICAgICRlbDokZWxcblxuICAgICAgICAgICAgaWYgaW5pdFBvcyBcbiAgICAgICAgICAgICAgICBjbG91ZEZ1bmN0aW9uKGluaXRQb3MpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAcGFyYWxsYXgucHVzaCBjbG91ZEZ1bmN0aW9uXG5cbiAgICB1cGRhdGVUaW1lbGluZTogPT5cbiAgICAgICAgXG4gICAgICAgIEBoZWFkZXIuYW5pbWF0ZUhlYWRlcihAc2Nyb2xsLnNjcm9sbFRvcClcblxuICAgICAgICBmb3IgdCBpbiBAdHJpZ2dlcnNcbiAgICAgICAgICAgIGlmIEBzY3JvbGwuc2Nyb2xsVG9wID4gdC5vZmZzZXQgLSBAY2VudGVyT2Zmc2V0XG4gICAgICAgICAgICAgICAgdC5hLnBsYXkoKVxuICAgICAgICAgICAgZWxzZSBpZiBAc2Nyb2xsLnNjcm9sbFRvcCArIEBzdGFnZUhlaWdodCA8IHQub2Zmc2V0XG4gICAgICAgICAgICAgICAgdC5hLnBhdXNlZCh0cnVlKVxuICAgICAgICAgICAgICAgIHQuYS5zZWVrKDApXG5cblxuICAgICAgICBmb3IgcCBpbiBAcGFyYWxsYXhcbiAgICAgICAgICAgIHAoQHNjcm9sbC5wb3NpdGlvbilcblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25CYXNlXG4iLCJjbGFzcyBQbHVnaW5CYXNlIGV4dGVuZHMgRXZlbnRFbWl0dGVyXG5cblxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIEAkZWwgPSBpZiBvcHRzLmVsPyB0aGVuICQgb3B0cy5lbFxuXG4gICAgICAgIEBpbml0aWFsaXplKG9wdHMpXG5cblxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cbiAgICAgICAgQGFkZEV2ZW50cygpXG5cbiAgICBhZGRFdmVudHM6IC0+XG5cblxuXG4gICAgcmVtb3ZlRXZlbnRzOiAtPlxuXG5cbiAgICBkZXN0cm95OiAtPlxuICAgICAgICBAcmVtb3ZlRXZlbnRzKClcblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsdWdpbkJhc2VcblxuIiwiXG5TaGFyZXIgPSByZXF1aXJlIFwiLi4vdXRpbC9TaGFyZXIuY29mZmVlXCIgXG5cblxuY2xhc3MgVmlld0Jhc2UgZXh0ZW5kcyBFdmVudEVtaXR0ZXJcblxuXG5cblxuXG4gICAgY29uc3RydWN0b3I6IChlbCkgLT5cblxuICAgICAgICBAJGVsID0gJChlbClcbiAgICAgICAgQGlzVGFibGV0ID0gJChcImh0bWxcIikuaGFzQ2xhc3MoXCJ0YWJsZXRcIilcbiAgICAgICAgQGlzUGhvbmUgPSAkKFwiaHRtbFwiKS5oYXNDbGFzcyhcInBob25lXCIpXG4gICAgICAgIEBjZG5Sb290ID0gJCgnYm9keScpLmRhdGEoJ2NkbicpIG9yIFwiL1wiXG4gICAgICAgICQod2luZG93KS5vbiBcInJlc2l6ZS5hcHBcIiAsIEBvblJlc2l6ZVxuXG4gICAgICAgIEBzdGFnZUhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICBAc3RhZ2VXaWR0aCA9ICQod2luZG93KS53aWR0aCgpXG4gICAgICAgIEBtb3VzZVggPSAwXG4gICAgICAgIEBtb3VzZVkgPSAwXG5cbiAgICAgICAgI0BkZWxlZ2F0ZUV2ZW50cyhAZ2VuZXJhdGVFdmVudHMoKSlcbiAgICAgICAgQGluaXRpYWxpemUoKVxuXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBAaW5pdENvbXBvbmVudHMoKVxuXG4gICAgaW5pdENvbXBvbmVudHM6IC0+XG5cbiAgICBvblJlc2l6ZTogPT5cbiAgICAgICAgQHN0YWdlSGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXG4gICAgICAgIEBzdGFnZVdpZHRoID0gJCh3aW5kb3cpLndpZHRoKClcblxuXG4gICAgZ2VuZXJhdGVFdmVudHM6IC0+XG4gICAgICAgIHJldHVybiB7fVxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld0Jhc2VcbiIsIkJhc2ljT3ZlcmxheSA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvQmFzaWNPdmVybGF5LmNvZmZlZSdcblN2Z0luamVjdCA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvU3ZnSW5qZWN0LmNvZmZlZSdcblxuXG5cbmlmIHdpbmRvdy5jb25zb2xlIGlzIHVuZGVmaW5lZCBvciB3aW5kb3cuY29uc29sZSBpcyBudWxsXG4gIHdpbmRvdy5jb25zb2xlID1cbiAgICBsb2c6IC0+XG4gICAgd2FybjogLT5cbiAgICBmYXRhbDogLT5cblxuXG5cbiQoZG9jdW1lbnQpLnJlYWR5IC0+XG4gICAgIyQoJy5zdmctaW5qZWN0Jykuc3ZnSW5qZWN0KClcbiAgICAjbmV3IFN2Z0luamVjdCBcIi5zdmctaW5qZWN0XCJcbiAgICBcbiAgICBiYXNpY092ZXJsYXlzID0gbmV3IEJhc2ljT3ZlcmxheVxuICAgICAgICBlbDogJCgnI2NvbnRlbnQnKVxuXG5cbiAgICAkKCcuc2Nyb2xsdG8nKS5jbGljayAtPlxuICAgICAgIHQgPSAkKHRoaXMpLmRhdGEoJ3RhcmdldCcpXG4gICAgICAgJCgnYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiAkKCcjJyt0KS5vZmZzZXQoKS50b3AgLSA3MCAjIDcwIGZvciB0aGUgY29sbGFwc2VkIGhlYWRlclxuICAgICAgICB9KTtcblxuICAgICNpZiB3aW5kb3cuZGRscz9cbiAgICAjIGNvbnNvbGUubG9nICdjbGlja3knXG4gICAgJCh3aW5kb3cpLmNsaWNrIC0+XG4gICAgICAgIGlmIHdpbmRvdy5kZGxzP1xuICAgICAgICAgICAgJC5lYWNoIHdpbmRvdy5kZGxzLCAoaSwgdCkgLT5cbiAgICAgICAgICAgICAgICBpZiB0LmlzT3BlbiBhbmQgbm90IHQuaXNIb3ZlcmVkXG4gICAgICAgICAgICAgICAgICAgIHQuY2xvc2VNZW51KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAkKCdbZGF0YS1kZXB0aF0nKS5lYWNoIC0+XG4gICAgICAgICRlbCA9ICQoQClcbiAgICAgICAgZGVwdGggPSAkZWwuZGF0YSgpLmRlcHRoXG4gICAgICAgIFxuICAgICAgICAkZWwuY3NzKCd6LWluZGV4JywgZGVwdGgpXG4gICAgICAgIFR3ZWVuTWF4LnNldCAkZWwgLCBcbiAgICAgICAgICAgIHo6IGRlcHRoICogMTBcblxuXG5cbiAgICAkKCdib2R5Jykub24gJ0RPTU5vZGVJbnNlcnRlZCcsICAtPlxuICAgICAgICAkKCdhJykuZWFjaCAtPiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGhyZWYgPSAkKEApLmF0dHIoJ2hyZWYnKVxuICAgICAgICAgICAgaWYgaHJlZj9cbiAgICAgICAgICAgICAgICBocmVmID0gaHJlZi50cmltKClcbiAgICAgICAgICAgICAgICBpZiBocmVmLmluZGV4T2YoJ2h0dHA6Ly8nKSBpcyAwIG9yIGhyZWYuaW5kZXhPZignaHR0cHM6Ly8nKSBpcyAwIG9yIGhyZWYuaW5kZXhPZignLnBkZicpIGlzIChocmVmLmxlbmd0aCAtIDQpXG4gICAgICAgICAgICAgICAgICAgICQoQCkuYXR0cigndGFyZ2V0JywgJ19ibGFuaycpXG5cblxuICAgICQoJy5jaXJjbGUsIC5jaXJjbGUtb3V0ZXInKS5vbignbW91c2VlbnRlcicsIC0+XG4gICAgICAgIFR3ZWVuTWF4LnRvKCQodGhpcyksIC4zNSxcbiAgICAgICAgICAgIHNjYWxlOiAxLjA1LFxuICAgICAgICAgICAgZWFzZTogUG93ZXIyLmVhc2VPdXRcbiAgICAgICAgKVxuICAgIClcblxuICAgICQoJy5jaXJjbGUsIC5jaXJjbGUtb3V0ZXInKS5vbignbW91c2VsZWF2ZScsIC0+XG4gICAgICAgIFR3ZWVuTWF4LnRvKCQodGhpcyksIC4zNSxcbiAgICAgICAgICAgIHNjYWxlOiAxLFxuICAgICAgICAgICAgZWFzZTogUG93ZXIyLmVhc2VPdXRcbiAgICAgICAgKVxuICAgIClcblxuICAgICQoJyNqb2JzLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXIgbGknKS5vbignbW91c2VlbmV0ZXInLCAtPlxuICAgICAgICBjb25zb2xlLmxvZyAnaGVsbG8nXG4gICAgKVxuXG5cbiMgdGhpcyBpcyBzaGl0dHksIGJ1dCBpdCdzIG15IG9ubHkgd29ya2Fyb3VuZCBmb3IgdGhlIGNsaXBwaW5nIGlzc3VlIChDRi0xNzEpXG5kb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSAtPlxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlIGlzICdjb21wbGV0ZScpXG4gICAgICAgIHNldFRpbWVvdXQoLT5cbiAgICAgICAgICAgICQoJy5xdW90ZScpLmFkZENsYXNzKCdrZWVwaXRhaHVuZHJlZCcpXG4gICAgICAgICwgMjAwKVxuIiwiXG5jbG91ZHNPblVwZGF0ZSA9IChlbCwgZHVyYXRpb24pIC0+XG4gICAgd2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIFxuICAgIFR3ZWVuTWF4LnNldCBlbCxcbiAgICAgICAgeDogLTIwNTBcbiAgICAgICAgXG4gICAgVHdlZW5NYXgudG8gZWwsIGR1cmF0aW9uICwgXG4gICAgICAgIHg6IHdpbmRvd1dpZHRoXG4gICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICBjbG91ZHNPblVwZGF0ZSBlbCAsIGR1cmF0aW9uXG4gICAgICAgIFxuXG5cbnNldEJvYmluZyA9ICgkZWwgLCBkdXIsZGVsYXkpIC0+XG4gICAgXG4gICAgQGlzVGFibGV0ID0gJCgnaHRtbCcpLmhhc0NsYXNzICd0YWJsZXQnXG4gICAgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIHdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICBcbiAgICBpZiB3aW5kb3cuaW5uZXJXaWR0aCA+IDc2NyAmJiAhQGlzVGFibGV0XG5cbiMgICAgICAgIGQgPSAoKHdpbmRvdy5pbm5lcldpZHRoICsgMTU1MCkgLyB3aW5kb3cuaW5uZXJXaWR0aCkgKiAxODBcbiAgICAgICAgZCA9IDMwMCAtICgkZWwuZGF0YSgnY2xvdWQnKS5zcGVlZCAqIDI1MClcbiAgICAgICAgXG4gICAgICAgIFR3ZWVuTWF4LnRvICRlbCAsIGR1ciAsIFxuICAgICAgICAgICAgeDogd2lkdGhcbiAgICAgICAgICAgIGRlbGF5OmRlbGF5XG4gICAgICAgICAgICBlYXNlOkxpbmVhci5lYXNlTm9uZVxuICAgICAgICAgICAgb25VcGRhdGVQYXJhbXM6IFtcIntzZWxmfVwiXVxuICAgICAgICAgICAgb25Db21wbGV0ZTogKHR3ZWVuKSA9PlxuICAgICAgICAgICAgICAgIGNsb3Vkc09uVXBkYXRlICRlbCAsIGRcblxuXG5cbnNldFJlZ2lzdHJhdGlvbiA9ICgkZWwsIHJlZ2lzdHJhdGlvbikgLT5cbiAgICBcbiAgICB2YWx1ZXMgPSByZWdpc3RyYXRpb24uc3BsaXQoXCJ8XCIpXG4gICAgXG4gICAgdmlld3BvcnRXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgc2V0dGluZ3MgPSB7fVxuICAgIFxuICAgIGFsaWduID0gdmFsdWVzWzBdXG4gICAgb2Zmc2V0ID0gcGFyc2VJbnQodmFsdWVzWzFdKSBvciAwXG5cbiAgICBzd2l0Y2ggYWxpZ25cbiAgICAgICAgd2hlbiAnbGVmdCdcbiAgICAgICAgICAgIHNldHRpbmdzLnggPSAwICsgb2Zmc2V0XG4gICAgICAgIHdoZW4gJ3JpZ2h0J1xuICAgICAgICAgICAgc2V0dGluZ3MueCA9IHZpZXdwb3J0V2lkdGggKyBvZmZzZXQgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICB3aGVuICdjZW50ZXInXG4gICAgICAgICAgICBzZXR0aW5ncy54ID0gKHZpZXdwb3J0V2lkdGgqLjUgLSAkZWwud2lkdGgoKSouNSkgKyBvZmZzZXQgICAgXG4gICAgXG4gICAgVHdlZW5NYXguc2V0ICRlbCAsIHNldHRpbmdzXG4gICAgXG4gICAgXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IChvcHRpb25zKSAtPlxuICAgIFxuICAgICRlbCA9IG9wdGlvbnMuJGVsXG4gICAgJGNvbnRhaW5lciA9ICRlbC5jbG9zZXN0KCdbZGF0YS1jbG91ZC1jb250YWluZXJdJykgICAgXG4gICAgY29udGFpbmVyVG9wUGFkZGluZyA9IHBhcnNlSW50KCRjb250YWluZXIuY3NzKCdwYWRkaW5nLXRvcCcpKVxuICAgIFxuICAgIFxuICAgIHRyeSAgICAgICAgXG4gICAgICAgIGNsb3VkRGF0YSA9ICRlbC5kYXRhKCkuY2xvdWRcbiAgICAgICBcbiAgICBjYXRjaCBlXG4gICAgICAgIGNvbnNvbGUuZXJyb3IgXCJDbG91ZCBEYXRhIFBhcnNlIEVycm9yOiBJbnZhbGlkIEpTT05cIiAgICAgICAgXG4gICAgICAgIFxuICAgIGNsb3VkRGVwdGggPSAkZWwuZGF0YSgnZGVwdGgnKVxuICAgIGNsb3VkU3BlZWQgPSBjbG91ZERhdGEuc3BlZWQgb3IgMVxuICAgIGNsb3VkT2Zmc2V0TWluID0gcGFyc2VJbnQoY2xvdWREYXRhLm9mZnNldE1pbikgb3IgMFxuICAgIGNsb3VkUmV2ZXJzZSA9IGNsb3VkRGF0YS5yZXZlcnNlIG9yIGZhbHNlXG4gICAgY2xvdWRSZWdpc3RyYXRpb24gPSBjbG91ZERhdGEucmVnaXN0ZXIgb3IgXCJjZW50ZXJcIlxuXG5cbiAgICBcbiAgICBzZXRSZWdpc3RyYXRpb24gJGVsICwgY2xvdWRSZWdpc3RyYXRpb25cbiAgICBpZiAhKCRjb250YWluZXIuaGFzQ2xhc3MoJ3NwbGFzaC1jb250YWluZXInKSlcbiAgICAgICAgb2ZmTGVmdCA9ICRlbC5vZmZzZXQoKS5sZWZ0XG4gICAgICAgIGRpc3RhbmNlID0gKHdpbmRvdy5pbm5lcldpZHRoIC0gb2ZmTGVmdCkgLyB3aW5kb3cuaW5uZXJXaWR0aFxuIyAgICAgICAgcGVyY2VudGFnZSA9IGRpc3RhbmNlICogMTgwIFxuICAgICAgICBwZXJjZW50YWdlID0gMjUwIC0gKGNsb3VkU3BlZWQgKiAyMDApXG4gICAgICAgIFxuICAgICAgICBzZXRCb2JpbmcgJGVsLCBwZXJjZW50YWdlLCBjbG91ZFNwZWVkLzVcbiBcbiAgICBtaW5ZID0gJGNvbnRhaW5lci5vZmZzZXQoKS50b3BcbiAgICBtYXhZID0gJChkb2N1bWVudCkub3V0ZXJIZWlnaHQoKVxuICAgIHRvdGFsUmFuZ2U9ICRjb250YWluZXIub3V0ZXJIZWlnaHQoKVxuICAgIFxuICAgIFxuICAgIFxuICAgIHBlcmNlbnRhZ2VSYW5nZSA9IHRvdGFsUmFuZ2UvbWF4WVxuICAgIG1pblJhbmdlUGVyY2VudGFnZSA9IG1pblkvbWF4WSAgICBcbiAgICBtYXhSYW5nZVBlcmNlbnRhZ2UgPSBtaW5SYW5nZVBlcmNlbnRhZ2UgKyBwZXJjZW50YWdlUmFuZ2VcblxuIyAgICBjb25zb2xlLmxvZyBtaW5SYW5nZVBlcmNlbnRhZ2UgLCBtYXhSYW5nZVBlcmNlbnRhZ2VcblxuXG4gICAgbGFzdFNjcm9sbFBlcmNlbnRhZ2UgPSBwcmVzZW50U2Nyb2xsUGVyY2VudGFnZSA9IHNjcm9sbERlbHRhID0gMFxuXG4gICAgaWYgKCRjb250YWluZXIuaGFzQ2xhc3MoJ3NwbGFzaC1jb250YWluZXInKSAmJiAkKCdodG1sJykuaGFzQ2xhc3MoJ3RhYmxldCcpKVxuICAgICAgICAkY29udGFpbmVyLmhpZGUoKVxuICAgICAgICBcbiAgICBcbiAgICByZXR1cm4gKHBvcykgLT5cbiAgICAgICAgaWYgKCgkY29udGFpbmVyLmhhc0NsYXNzKCdzcGxhc2gtY29udGFpbmVyJykpICYmICgkKCdodG1sJykuaGFzQ2xhc3MoJ3RhYmxldCcpKSlcbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvICRlbCAsIDAuMjUgLFxuICAgICAgICAgICAgICAgIGVhc2U6U2luZS5lYXNlT3V0XG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2UgPSAocG9zIC0gbWluUmFuZ2VQZXJjZW50YWdlKSAvIChtYXhSYW5nZVBlcmNlbnRhZ2UgLSBtaW5SYW5nZVBlcmNlbnRhZ2UpXG4gICAgICAgICAgICBpZiAwIDw9IGNsb3VkUG9zaXRpb25QZXJjZW50YWdlIDw9IDFcbiAgICAgICAgICAgICAgICBwcmVzZW50U2Nyb2xsUGVyY2VudGFnZSA9IGNsb3VkUG9zaXRpb25QZXJjZW50YWdlXG4gICAgICAgICAgICAgICAgaWYgY2xvdWRSZXZlcnNlICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNsb3VkUG9zaXRpb25QZXJjZW50YWdlID0gMSAtIGNsb3VkUG9zaXRpb25QZXJjZW50YWdlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY2xvdWRZID0gKHRvdGFsUmFuZ2UgKiBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZSkgKiBjbG91ZFNwZWVkXG4gICAgICAgICAgICAgICAgY2xvdWRZID0gY2xvdWRZIC0gY29udGFpbmVyVG9wUGFkZGluZ1xuICAgICAgICAgICAgICAgIGNsb3VkWSA9IGNsb3VkWSArIGNsb3VkT2Zmc2V0TWluXG4gICAgXG4gICAgICAgICAgICAgICAgI01heWJlIHVzZSB0aGlzP1xuICAgICAgICAgICAgICAgIHNjcm9sbERlbHRhID0gTWF0aC5hYnMobGFzdFNjcm9sbFBlcmNlbnRhZ2UgLSBwcmVzZW50U2Nyb2xsUGVyY2VudGFnZSkgKiAzXG4gICAgXG4gICAgICAgICAgICAgICAgbGFzdFNjcm9sbFBlcmNlbnRhZ2UgPSBwcmVzZW50U2Nyb2xsUGVyY2VudGFnZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC50byAkZWwgLCAwLjI1ICwgXG4gICAgICAgICAgICAgICAgICAgIHk6Y2xvdWRZXG4gICAgICAgICAgICAgICAgICAgIGVhc2U6U2luZS5lYXNlT3V0XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgXG4iLCJQbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIEJhc2ljT3ZlcmxheSBleHRlbmRzIFBsdWdpbkJhc2VcbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gICAgICAgIHN1cGVyKG9wdHMpXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICAjIEAkZWwgPSAkKGVsKVxuICAgICAgICBAb3ZlcmxheVRyaWdnZXJzID0gJCgnLm92ZXJsYXktdHJpZ2dlcicpXG4gICAgICAgIEBhZGRFdmVudHMoKVxuXG4gICAgICAgIHN1cGVyKClcblxuICAgIFxuICAgIGFkZEV2ZW50czogLT5cblxuICAgICAgICAkKCcjYmFzaWMtb3ZlcmxheSwgI292ZXJsYXktYmFzaWMtaW5uZXIgLm92ZXJsYXktY2xvc2UnKS5jbGljayhAY2xvc2VPdmVybGF5KTtcbiAgICAgICAgQG92ZXJsYXlUcmlnZ2Vycy5lYWNoIChpLHQpID0+XG4gICAgICAgICAgICAkKHQpLm9uICdjbGljaycsIEBvcGVuT3ZlcmxheVxuXG4gICAgICAgICNnbG9iYWwgYnV5IHRpY2tldHMgbGlua3NcblxuICAgICAgICAkKCcub3ZlcmxheS1jb250ZW50Jykub24gJ2NsaWNrJywgJ2xpJyAsQG9wZW5MaW5rXG4jICAgICAgICAkKHdpbmRvdykub24gJ3Jlc2l6ZScsIEBjbG9zZU92ZXJsYXlcbiAgICAgICAgXG4gICAgb3Blbkxpbms6IChlKSA9PlxuICAgICAgICB0YXJnZXQgPSAkKGUudGFyZ2V0KS5wYXJlbnRzICcucGFyaydcbiAgICAgICAgaWYgdGFyZ2V0LmRhdGEoJ3RhcmdldCcpXG4gICAgICAgICAgICB3aW5kb3cub3Blbih0YXJnZXQuZGF0YSgndGFyZ2V0JykpXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBcbiAgICBjbG9zZU92ZXJsYXk6IChlKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgISAoKGUudHlwZSBpcyAncmVzaXplJykgYW5kICgkKCcjb3ZlcmxheSB2aWRlbzp2aXNpYmxlJykuc2l6ZSgpID4gMCkpXG4gICAgICAgICAgICAkKCcub3ZlcmxheS1iYXNpYycpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICAgIH0sICgpIC0+IFxuICAgICAgICAgICAgICAgICQoJy5vdmVybGF5LWJhc2ljJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgJCgnI292ZXJsYXknKS5oaWRlKClcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIG9wZW5PdmVybGF5OiAodCkgLT5cbiAgICAgICAgJGVsID0gJCh0aGlzKVxuICAgICAgICBvdmVybGF5U291cmNlID0gJGVsLmRhdGEoJ3NvdXJjZScpXG4gICAgICAgICR0YXJnZXRFbGVtZW50ID0gJCgnI292ZXJsYXktYmFzaWMtaW5uZXIgLm92ZXJsYXktY29udGVudCcpXG4gICAgICAgIGlzTmV3cyA9ICRlbC5oYXNDbGFzcygnbmV3cycpXG5cbiAgICAgICAgJCgnI292ZXJsYXknKS5zaG93KClcbiAgICAgICAgXG4gICAgICAgIGlmICRlbC5oYXNDbGFzcyAnb2ZmZXJpbmdzLW9wdGlvbidcbiAgICAgICAgICAgIG9jID0gJCgnI29mZmVyaW5ncy1vdmVybGF5LWNvbnRlbnQnKVxuICAgICAgICAgICAgb2MuZmluZCgnaDEudGl0bGUnKS50ZXh0KCRlbC5maW5kKCdzcGFuLm9mZmVyJykudGV4dCgpKVxuICAgICAgICAgICAgb2MuZmluZCgnZGl2LmRlc2NyaXB0aW9uJykuaHRtbCgkZWwuZmluZCgnZGl2LmRlc2NyaXB0aW9uJykuaHRtbCgpKVxuICAgICAgICAgICAgb2MuZmluZCgnLmNvbnRlbnQubWVkaWEnKS5jc3Moe2JhY2tncm91bmRJbWFnZTogXCJ1cmwoJ1wiICsgJGVsLmZpbmQoJ3NwYW4ubWVkaWEnKS5kYXRhKCdzb3VyY2UnKSArIFwiJylcIn0pXG5cbiAgICAgICAgXG4gICAgICAgIGlmICgkKCcjJyArIG92ZXJsYXlTb3VyY2UpLnNpemUoKSBpcyAxKSBcbiAgICAgICAgICAgICNodG1sID0gJCgnIycgKyBvdmVybGF5U291cmNlKS5odG1sKClcblxuICAgICAgICAgICAgJHRhcmdldEVsZW1lbnQuY2hpbGRyZW4oKS5lYWNoIChpLHQpID0+XG4gICAgICAgICAgICAgICAgJCh0KS5hcHBlbmRUbygnI292ZXJsYXktY29udGVudC1zb3VyY2VzJylcblxuICAgICAgICAgICAgaWYgaXNOZXdzXG4gICAgICAgICAgICAgICAgYyA9ICRlbC5uZXh0KCcuYXJ0aWNsZScpLmNsb25lKClcbiAgICAgICAgICAgICAgICAkKCcjb3ZlcmxheV9jb250ZW50JykuaHRtbChjLmh0bWwoKSlcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyMnICsgb3ZlcmxheVNvdXJjZSkuYXBwZW5kVG8oJHRhcmdldEVsZW1lbnQpXG5cbiAgICAgICAgICAgICRlbCA9ICQoJyNvdmVybGF5LWJhc2ljLWlubmVyJylcbiAgICAgICAgICAgIGlzU21hbGwgPSAkZWwuaGVpZ2h0KCkgPCAkKHdpbmRvdykuaGVpZ2h0KCkgYW5kICQoJHRhcmdldEVsZW1lbnQpLmZpbmQoJy5zZWxlY3QtYm94LXdyYXBwZXInKS5zaXplKCkgaXMgMFxuICAgICAgICAgICAgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpXG4gICAgICAgICAgICBhZGR0b3AgPSBpZiBpc1NtYWxsIHRoZW4gMCBlbHNlIHNjcm9sbFRvcDtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gJGVsLmNzcyAncG9zaXRpb24nLCBpZiBpc1NtYWxsIHRoZW4gJ2ZpeGVkJyBlbHNlICdhYnNvbHV0ZSdcbiAgICAgICAgICAgIHRvcCA9IE1hdGgubWF4KDAsICgoJCh3aW5kb3cpLmhlaWdodCgpIC0gJGVsLm91dGVySGVpZ2h0KCkpIC8gMikgKyBhZGR0b3ApXG4gICAgICAgICAgICBpZiAhaXNTbWFsbCBhbmQgKHRvcCA8IHNjcm9sbFRvcCkgdGhlbiB0b3AgPSBzY3JvbGxUb3BcbiAgICAgICAgICAgICRlbC5jc3MoXCJ0b3BcIiwgdG9wICsgXCJweFwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBoZWlnaHQ6XG4gICAgICAgICAgICAjJGVsLmNzcyhcImxlZnRcIiwgTWF0aC5tYXgoMCwgKCgkKHdpbmRvdykud2lkdGgoKSAtICRlbC5vdXRlcldpZHRoKCkpIC8gMikgKyBhZGRsZWZ0KSArIFwicHhcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoJy5vdmVybGF5LWJhc2ljJykuY3NzKCdvcGFjaXR5JywgMCkuZGVsYXkoMCkuc2hvdygpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgICAgIH0pXG5cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNpY092ZXJsYXlcblxuXG5cblxuXG5cbiIsIlxuUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuVmlld0Jhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9WaWV3QmFzZS5jb2ZmZWUnXG5cbmNsYXNzIERyYWdnYWJsZUdhbGxlcnkgZXh0ZW5kcyBQbHVnaW5CYXNlXG5cbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gICAgICAgIHN1cGVyKG9wdHMpXG5cblxuICAgIGluaXRpYWxpemU6IChvcHRzKSAtPlxuXG4gICAgICAgIEBnYWxsZXJ5ID0gQCRlbC5maW5kIFwiLnN3aXBlci1jb250YWluZXJcIlxuXG4gICAgICAgIGlmKEBnYWxsZXJ5Lmxlbmd0aCA8IDEpXG4gICAgICAgICAgICBAZ2FsbGVyeSA9IEAkZWwuZmlsdGVyIFwiLnN3aXBlci1jb250YWluZXJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGlmIG9wdHMucGFnZSA9PSAnam9icydcbiAgICAgICAgICAgIEBqb2JzUGFnZSA9IHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGpvYnNQYWdlID0gZmFsc2VcblxuICAgICAgICBAZ2FsbGVyeUNyZWF0ZWQgPSBmYWxzZVxuICAgICAgICBAZ2FsbGVyeUNvbnRhaW5lciA9IEBnYWxsZXJ5LmZpbmQoJ3VsJylcbiAgICAgICAgQGdhbGxlcnlJdGVtcyA9IEBnYWxsZXJ5Q29udGFpbmVyLmZpbmQoJ2xpJylcbiAgICAgICAgQGN1cnJlbnRJbmRleCA9IEBnYWxsZXJ5SXRlbXMuZmlsdGVyKCcuc2VsZWN0ZWQnKS5kYXRhKCdpbmRleCcpXG4gICAgICAgIEBhY3Jvc3MgPSBvcHRzLmFjcm9zcyBvciAxXG4gICAgICAgIEBhbmdsZUxlZnQgPSBAZ2FsbGVyeS5maW5kICcuZmEtYW5nbGUtbGVmdCdcbiAgICAgICAgQGFuZ2xlUmlnaHQgPSBAZ2FsbGVyeS5maW5kICcuZmEtYW5nbGUtcmlnaHQnXG4gICAgICAgIEBwYWdpbmF0aW9uID0gb3B0cy5wYWdpbmF0aW9uIG9yIGZhbHNlXG4gICAgICAgIEBjb250cm9scyA9IG9wdHMuY29udHJvbCBvciBudWxsXG4gICAgICAgIEBqb2JzQ2Fyb3VzZWxTdG9wcGVkID0gZmFsc2VcbiAgICAgICAgQGpvYnNDYXJvdXNlbFBhdXNlZCA9IGZhbHNlXG4gICAgICAgIEBqb2JzSW50ZXJ2YWwgPSBudWxsXG5cbiAgICAgICAgQHNpemVDb250YWluZXIoKVxuXG4gICAgICAgIEBhZGRBcnJvd3MoKVxuXG4gICAgICAgIHN1cGVyKClcblxuICAgIGFkZEV2ZW50czogLT5cbiAgICAgICAgJCh3aW5kb3cpLm9uICdyZXNpemUnICwgQHNpemVDb250YWluZXJcblxuICAgICAgICAkKEAkZWwpLm9uICdjbGljaycsICcuZmEtYW5nbGUtbGVmdCcsIEBwcmV2U2xpZGVcbiAgICAgICAgJChAJGVsKS5vbiAnY2xpY2snLCAnLmZhLWFuZ2xlLXJpZ2h0JywgQG5leHRTbGlkZVxuICAgICAgICBpZiBAam9ic1BhZ2UgPT0gdHJ1ZVxuICAgICAgICAgICAgJChAJGVsKS5vbiAnY2xpY2snLCAnLnN3aXBlci1jb250YWluZXInLCBAc3RvcEpvYnNDYXJvdXNlbFxuICAgICAgICAgICAgJChAJGVsKS5vbiAnbW91c2VvdmVyJywgJy5zd2lwZXItY29udGFpbmVyJywgQHBhdXNlSm9ic0Nhcm91c2VsXG4gICAgICAgICAgICAkKEAkZWwpLm9uICdtb3VzZWxlYXZlJywgJy5zd2lwZXItY29udGFpbmVyJywgQHJlc3VtZUpvYnNDYXJvdXNlbFxuICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIHN0b3BKb2JzQ2Fyb3VzZWw6ID0+XG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBqb2JzSW50ZXJ2YWwpXG4gICAgICAgIEBqb2JzQ2Fyb3VzZWxTdG9wcGVkID0gdHJ1ZVxuXG4gICAgcGF1c2VKb2JzQ2Fyb3VzZWw6ID0+XG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBqb2JzSW50ZXJ2YWwpXG4gICAgICAgIEBqb2JzQ2Fyb3VzZWxQYXVzZWQgPSB0cnVlXG5cbiAgICByZXN1bWVKb2JzQ2Fyb3VzZWw6ID0+XG4gICAgICAgIGlmIEBqb2JzQ2Fyb3VzZWxTdG9wcGVkID09IGZhbHNlXG4gICAgICAgICAgICBAam9ic0ludGVydmFsID0gc2V0SW50ZXJ2YWwgKC0+XG4gICAgICAgICAgICAgICAgJCgnI2pvYnMtZ2FsbGVyeSAuZmEtYW5nbGUtcmlnaHQnKS50cmlnZ2VyKCdjbGljaycpXG4gICAgICAgICAgICApLCA4MDAwXG4gICAgICAgICAgICBAam9ic0Nhcm91c2VsUGF1c2VkID0gZmFsc2VcblxuICAgIHByZXZTbGlkZTogKGUpID0+XG4gICAgICAgIHRoYXQgPSBAbXlTd2lwZXJcbiAgICAgICAgZ2FsID0gQGdhbGxlcnlcbiAgICAgICAgXG4gICAgICAgIFR3ZWVuTWF4LnRvKCQoZ2FsKSwgLjIsIFxuICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAgICAgc2NhbGU6IDEuMVxuICAgICAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgICAgICB0aGF0LnN3aXBlUHJldigpXG4gICAgICAgICAgICAgICAgVHdlZW5NYXguc2V0KCQoZ2FsKSxcbiAgICAgICAgICAgICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgVHdlZW5NYXgudG8oJChnYWwpLCAuMzUsIFxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5OiAuMzVcbiAgICAgICAgICAgICAgICApXG4gICAgICAgIClcbiAgICBcbiAgICBuZXh0U2xpZGU6IChlKSA9PlxuICAgICAgICB0aGF0ID0gQG15U3dpcGVyXG4gICAgICAgIGdhbCA9IEBnYWxsZXJ5XG5cbiAgICAgICAgVHdlZW5NYXgudG8oJChnYWwpLCAuMixcbiAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICAgIHNjYWxlOiAxLjFcbiAgICAgICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICAgICAgdGhhdC5zd2lwZU5leHQoKVxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnNldCgkKGdhbCksXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlOiAwLjg1XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvKCQoZ2FsKSwgLjM1LFxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlOiAxXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5OiAuMzVcbiAgICAgICAgICAgICAgICApXG4gICAgICAgIClcblxuXG4gICAgYWRkQXJyb3dzOiAtPlxuICAgICAgICBAaXNQaG9uZSA9ICQoXCJodG1sXCIpLmhhc0NsYXNzKFwicGhvbmVcIilcblxuICAgICAgICBhcnJvd0xlZnQgPSAkKFwiPGkgY2xhc3M9J2dhbC1hcnJvdyBmYSBmYS1hbmdsZS1sZWZ0Jz48L2k+XCIpXG4gICAgICAgIGFycm93UmlnaHQgPSAkKFwiPGkgY2xhc3M9J2dhbC1hcnJvdyBmYSBmYS1hbmdsZS1yaWdodCc+PC9pPlwiKVxuXG4gICAgICAgIEAkZWwuYXBwZW5kKGFycm93TGVmdCwgYXJyb3dSaWdodClcblxuICAgICAgICAkKCcuZ2FsLWFycm93Jykub24gJ2NsaWNrJywgLT5cbiAgICAgICAgICAgICQoQCkuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgIHRoYXQgPSAkKEApXG4gICAgICAgICAgICBzZXRUaW1lb3V0IC0+XG4gICAgICAgICAgICAgICAgJCh0aGF0KS5yZW1vdmVDbGFzcyAnYWN0aXZlJywgMTAwXG4gICAgICAgICAgICBcblxuICAgIHNpemVDb250YWluZXI6ICgpID0+XG4gICAgICAgIEBnYWxsZXJ5Q29udGFpbmVyLmNzcygnd2lkdGgnLCBcIjEwMCVcIilcbiAgICAgICAgaWYgQGFjcm9zcyA8IDJcbiAgICAgICAgICAgIEBnYWxsZXJ5SXRlbXMuY3NzKCd3aWR0aCcgLCBcIjEwMCVcIilcbiAgICAgICAgZWxzZSBpZiBAYWNyb3NzIDwgM1xuICAgICAgICAgICAgQGdhbGxlcnlJdGVtcy5jc3MoJ3dpZHRoJyAsIFwiNTAlXCIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBnYWxsZXJ5SXRlbXMuY3NzKCd3aWR0aCcgLCBcIjMzLjMzMzMzMyVcIilcblxuICAgICAgICBAaXRlbVdpZHRoID0gQGdhbGxlcnlJdGVtcy5maXJzdCgpLm91dGVyV2lkdGgoKVxuICAgICAgICBpdGVtTGVuZ3RoID0gQGdhbGxlcnlJdGVtcy5sZW5ndGhcblxuICAgICAgICBAZ2FsbGVyeUl0ZW1zLmNzcygnd2lkdGgnLCBAaXRlbVdpZHRoKVxuICAgICAgICBAZ2FsbGVyeUNvbnRhaW5lci5jc3MoJ3dpZHRoJywgaXRlbUxlbmd0aCAqIChAaXRlbVdpZHRoKSlcbiAgICAgICAgVHdlZW5NYXguc2V0IEBnYWxsZXJ5Q29udGFpbmVyICxcbiAgICAgICAgICAgIHg6IC1AY3VycmVudEluZGV4ICogQGl0ZW1XaWR0aFxuICAgICAgICBcbiAgICAgICAgaWYgIUBnYWxsZXJ5Q3JlYXRlZCAgICBcbiAgICAgICAgICAgIEBjcmVhdGVEcmFnZ2FibGUoKVxuIyAgICAgICAgICAgIEBteVN3aXBlci5zd2lwZU5leHQoKVxuICAgICAgICBcbiAgICBjcmVhdGVEcmFnZ2FibGU6ICgpIC0+XG4gICAgICAgIGl0ZW1MZW5ndGggPSBAZ2FsbGVyeUl0ZW1zLmxlbmd0aFxuXG4gICAgICAgIGlmIEBzY3JvbGwgdGhlbiBAc2Nyb2xsLmtpbGwoKVxuXG4gICAgICAgIGlkID0gJChALiRlbCkuYXR0ciAnaWQnXG5cblxuICAgICAgICBpZiBAcGFnaW5hdGlvblxuICAgICAgICAgICAgQGFkZFBhZ2luYXRpb24oKVxuXG4gICAgICAgIGlmIEBhY3Jvc3MgPCAzXG4gICAgICAgICAgICBpZiBAcGFnaW5hdGlvblxuICAgICAgICAgICAgICAgIEBteVN3aXBlciA9IG5ldyBTd2lwZXIoJyMnICsgaWQgKyAnIC5zd2lwZXItY29udGFpbmVyJyx7XG4gICAgICAgICAgICAgICAgICAgIGxvb3A6dHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZ3JhYkN1cnNvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogQGFjcm9zcyxcbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvbjogJyMnICsgaWQgKyAnIC5zd2lwZXItcGFnaW5hdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Bc1JhbmdlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBvblRvdWNoU3RhcnQ6IEBvblNsaWRlQ2hhbmdlU3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIG9uVG91Y2hFbmQ6IEBvblNsaWRlQ2hhbmdlRW5kLFxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlU3RhcnQ6IEBvblNsaWRlQ2hhbmdlU3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIG9uU2xpZGVDaGFuZ2VFbmQ6IEBvblNsaWRlQ2hhbmdlRW5kLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZXNQZXJHcm91cDogQGFjcm9zc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQG15U3dpcGVyID0gbmV3IFN3aXBlcignIycgKyBpZCArICcgLnN3aXBlci1jb250YWluZXInLHtcbiAgICAgICAgICAgICAgICAgICAgbG9vcDp0cnVlLFxuICAgICAgICAgICAgICAgICAgICBncmFiQ3Vyc29yOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiBAYWNyb3NzLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZXNQZXJHcm91cDogQGFjcm9zc1xuICAgICAgICAgICAgICAgICAgICBvblRvdWNoU3RhcnQ6IEBvblNsaWRlQ2hhbmdlU3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIG9uVG91Y2hFbmQ6IEBvblNsaWRlQ2hhbmdlRW5kLFxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlU3RhcnQ6IEBvblNsaWRlQ2hhbmdlU3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIG9uU2xpZGVDaGFuZ2VFbmQ6IEBvblNsaWRlQ2hhbmdlRW5kLFxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG15U3dpcGVyID0gbmV3IFN3aXBlcignIycgKyBpZCArICcgLnN3aXBlci1jb250YWluZXInLHtcbiAgICAgICAgICAgICAgICBsb29wOnRydWUsXG4gICAgICAgICAgICAgICAgZ3JhYkN1cnNvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxuICAgICAgICAgICAgICAgIHNsaWRlc1Blckdyb3VwOiAzXG4gICAgICAgICAgICAgICAgb25Ub3VjaFN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgIG9uVG91Y2hFbmQ6IEBvblNsaWRlQ2hhbmdlRW5kLFxuICAgICAgICAgICAgICAgIG9uU2xpZGVDaGFuZ2VTdGFydDogQG9uU2xpZGVDaGFuZ2VTdGFydCxcbiAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcbiAgICAgICAgQGdhbGxlcnlDcmVhdGVkID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgaWYgQGpvYnNQYWdlID09IHRydWVcbiAgICAgICAgICAgIEBqb2JzSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCAoLT5cbiAgICAgICAgICAgICAgICAkKCcjam9icy1nYWxsZXJ5IC5mYS1hbmdsZS1yaWdodCcpLnRyaWdnZXIoJ2NsaWNrJylcbiAgICAgICAgICAgICksIDgwMDBcblxuICAgICAgICBcbiAgICBvblNsaWRlQ2hhbmdlU3RhcnQ6ID0+XG4gICAgICAgICQoQC4kZWwpLmNsb3Nlc3QoJy5hZGQtYm9yZGVyLWZhZGUnKS5hZGRDbGFzcyAnc2hvd2luZydcbiAgICAgICAgJChALiRlbCkuZmluZCgnLmFkZC1ib3JkZXItZmFkZScpLmFkZENsYXNzICdzaG93aW5nJ1xuXG4gICAgb25TbGlkZUNoYW5nZUVuZDogPT5cbiAgICAgICAgJChALiRlbCkuY2xvc2VzdCgnLmFkZC1ib3JkZXItZmFkZScpLnJlbW92ZUNsYXNzICdzaG93aW5nJ1xuICAgICAgICAkKEAuJGVsKS5maW5kKCcuYWRkLWJvcmRlci1mYWRlJykucmVtb3ZlQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgIFxuICAgICAgICBpZiAhKEBjb250cm9scyA9PSBudWxsKVxuICAgICAgICAgICAgcGFyayA9IEBteVN3aXBlci5hY3RpdmVTbGlkZSgpLmRhdGEoJ2lkJylcbiAgICAgICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IC5zd2lwZXItY29udGFpbmVyJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IC5jYXJvdXNlbC13cmFwcGVyJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IGRpdiMnICsgcGFyaykuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IGRpdiMnICsgcGFyaykucGFyZW50KCkuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgIFxuICAgICAgICBpZiAoQHBhcmtMaXN0KVxuICAgICAgICAgICAgQHBhcmtMaXN0LnNlbGVjdExvZ28gJChALiRlbCkuZmluZCgnLnN3aXBlci1zbGlkZS1hY3RpdmUnKS5kYXRhKCdpZCcpO1xuXG4gICAgYWRkUGFnaW5hdGlvbjogPT5cbiAgICAgICAgd3JhcHBlciA9ICQoXCI8ZGl2IGNsYXNzPSdzd2lwZXItcGFnaW5hdGlvbic+PC9kaXY+XCIpXG4gICAgICAgICQoQC4kZWwpLmZpbmQoJy5zd2lwZXItY29udGFpbmVyJykuYWRkQ2xhc3MoJ2FkZFBhZ2luYXRpb24nKS5hcHBlbmQod3JhcHBlcilcblxuXG4gICAgZ290bzogKGlkLCBpbml0VmFsKSAtPlxuXG4gICAgICAgIGlmIG5vdCBpbml0VmFsIHRoZW4gJCgnYm9keScpLmFuaW1hdGUgeyBzY3JvbGxUb3A6ICQoJyMnICsgKCQoQCRlbCkuYXR0cignaWQnKSkpLm9mZnNldCgpLnRvcCB9XG5cbiAgICAgICAgdG9JbmRleCA9ICQoXCJsaS5wYXJrW2RhdGEtaWQ9JyN7aWR9J11cIikuZGF0YSgnaW5kZXgnKVxuXG4gICAgICAgIHRsID0gbmV3IFRpbWVsaW5lTWF4XG5cbiAgICAgICAgdGwuYWRkIFR3ZWVuTWF4LnRvIEBnYWxsZXJ5Q29udGFpbmVyICwgLjQsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MFxuXG4gICAgICAgIHRsLmFkZENhbGxiYWNrID0+XG4gICAgICAgICAgICBAbXlTd2lwZXIuc3dpcGVUbyh0b0luZGV4LCAwKVxuXG4gICAgICAgIHRsLmFkZCBUd2Vlbk1heC50byBAZ2FsbGVyeUNvbnRhaW5lciAsIC40LFxuICAgICAgICAgICAgYXV0b0FscGhhOjFcblxuICAgICAgICBAY3VycmVudEluZGV4ID0gdG9JbmRleFxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRHJhZ2dhYmxlR2FsbGVyeVxuXG4iLCJcblBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblZpZGVvT3ZlcmxheSA9IHJlcXVpcmUgJy4vVmlkZW9PdmVybGF5LmNvZmZlZSdcblxuY2xhc3MgRmFkZUdhbGxlcnkgZXh0ZW5kcyBQbHVnaW5CYXNlXG5cbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gICAgICAgIHN1cGVyKG9wdHMpXG5cblxuICAgIGluaXRpYWxpemU6IChvcHRzKSAtPlxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2cgJ2luaXRpYWxpemU6ICcsIG9wdHNcblxuICAgICAgICBAcGFnZSA9IG9wdHMucGFnZSBvciBudWxsXG4gICAgICAgIHRhcmdldCA9IG9wdHMudGFyZ2V0IG9yIG51bGxcbiAgICAgICAgXG4gICAgICAgIGlmICh0YXJnZXQ/KVxuICAgICAgICAgICAgQCR0YXJnZXQgPSAkKHRhcmdldClcbiAgICAgICAgXG4gICAgICAgIGlmICEoQHBhZ2UgPT0gbnVsbClcbiAgICAgICAgICAgIEBpbmZvQm94ZXMgPSBAJGVsLmZpbmQgXCJsaS52aWRlb1wiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBpbmZvQm94ZXMgPSBAJGVsLmZpbmQgXCJsaVwiXG4gICAgICAgICAgICBcbiAgICAgICAgQGN1cnJlbnRTZWxlY3RlZCA9IEBpbmZvQm94ZXMuZmlsdGVyKFwiOmZpcnN0LWNoaWxkXCIpXG5cbiAgICAgICAgc3VwZXIoKVxuICAgIFxuICAgIGFkZEV2ZW50czogLT4gIFxuXG4gICAgICAgIEBpbmZvQm94ZXMuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgJGJ0biA9ICQodCkuZmluZCgnLnZpZGVvLWJ1dHRvbicpXG5cbiAgICAgICAgICAgIGlmICRidG4ubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgIHZpZGVvRXZlbnRzID0gbmV3IEhhbW1lcigkYnRuWzBdKVxuICAgICAgICAgICAgICAgIHZpZGVvRXZlbnRzLm9uICd0YXAnICwgQGhhbmRsZVZpZGVvSW50ZXJhY3Rpb25cblxuXG5cblxuICAgIGhhbmRsZVZpZGVvSW50ZXJhY3Rpb246IChlKSA9PlxuXG4gICAgICAgICR0YXJnZXQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KFwiLnZpZGVvLWJ1dHRvblwiKVxuICAgICAgICBpZiAoJHRhcmdldC5zaXplKCkgaXMgMCkgXG4gICAgICAgICAgICAkdGFyZ2V0ID0gZS50YXJnZXRcbiAgICAgICAgXG4gICAgICAgIGlmICR0YXJnZXQuZGF0YSgndHlwZScpID09ICdpbWFnZSdcbiAgICAgICAgICAgIGlmICgkdGFyZ2V0LmRhdGEoJ2Z1bGwnKSlcbiAgICAgICAgICAgICAgICBAaW1hZ2VTcmMgPSAkdGFyZ2V0LmRhdGEoJ2Z1bGwnKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBpbWFnZVNyYyA9ICR0YXJnZXQuY2hpbGRyZW4oJ2ltZycpLmF0dHIoJ3NyYycpXG4gICAgICAgIGRhdGEgPVxuICAgICAgICAgICAgbXA0OiR0YXJnZXQuZGF0YSgnbXA0JylcbiAgICAgICAgICAgIHdlYm06JHRhcmdldC5kYXRhKCd3ZWJtJylcbiAgICAgICAgICAgIHBvc3RlcjpAaW1hZ2VTcmNcblxuICAgICAgICBWaWRlb092ZXJsYXkuaW5pdFZpZGVvT3ZlcmxheSBkYXRhXG5cblxuICAgIGdvdG86IChpZCwgaW5pdFZhbCkgLT5cbiAgICAgICAgaW5mb0lkID0gXCIjI3tpZH0taW5mb1wiXG5cbiAgICAgICAgaWYgIShAcGFnZSA9PSBudWxsKVxuICAgICAgICAgICAgdGFyZ2V0ID0gQGluZm9Cb3hlcy5wYXJlbnRzKCdsaS5ncm91cC1pbmZvJylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGFyZ2V0ID0gQGluZm9Cb3hlc1xuICAgICAgICBcblxuICAgICAgICAjU3dpdGNoIEluZm8gQm94ZXNcbiAgICAgICAgdGwgPSBuZXcgVGltZWxpbmVNYXhcbiAgICAgICAgdGwuYWRkIFR3ZWVuTWF4LnRvIHRhcmdldCAsIC40ICxcbiAgICAgICAgICAgIGF1dG9BbHBoYTowXG4gICAgICAgICAgICBvdmVyd3JpdGU6XCJhbGxcIlxuICAgICAgICB0bC5hZGQgVHdlZW5NYXgudG8gdGFyZ2V0LmZpbHRlcihpbmZvSWQpICwgLjQgLFxuICAgICAgICAgICAgYXV0b0FscGhhOjFcblxuXG4gICAgICAgIGlmIChAJHRhcmdldD8pXG4gICAgICAgICAgICBjb25zb2xlLmxvZyBAJHRhcmdldFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0b3AgPSBAJHRhcmdldC5vZmZzZXQoKS50b3AgLSAoJCgnaGVhZGVyJykuaGVpZ2h0KCkpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyB0b3BcbiAgICAgICAgICAgIHBvcyA9ICQoJ2JvZHknKS5zY3JvbGxUb3AoKVxuICAgICAgICAgICAgaWYgKHBvcyA8IHRvcClcbiAgICAgICAgICAgICAgICAkKCdib2R5JykuYW5pbWF0ZSB7IHNjcm9sbFRvcDogdG9wIH1cbiAgXG5cbm1vZHVsZS5leHBvcnRzID0gRmFkZUdhbGxlcnlcblxuIiwiZ2xvYmFscyA9IHJlcXVpcmUgJy4uL2dsb2JhbC9pbmRleC5jb2ZmZWUnXG5QbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIEhlYWRlckFuaW1hdGlvbiBleHRlbmRzIFBsdWdpbkJhc2VcblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgXG4gICAgICAgIEBib2R5ID0gJChcImJvZHlcIilcbiAgICAgICAgQGh0bWwgPSAkKFwiaHRtbFwiKVxuICAgICAgICBAY29udGVudCA9ICQoXCIjY29udGVudFwiKVxuICAgICAgICBAbW9ibmF2ID0gJChcIiNtb2JpbGUtaGVhZGVyLW5hdlwiKVxuICAgICAgICBAc3VibmF2ID0gJChcIi5zdWJuYXZcIilcbiAgICAgICAgQHN1Ym5hdlNob3dpbmcgPSBmYWxzZVxuICAgICAgICBAb3VyUGFya3NMZWZ0ID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwib3VyLXBhcmtzXCJdJykub2Zmc2V0KCkubGVmdFxuICAgICAgICBAcGFydG5lcnNoaXBMZWZ0ID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwicGFydG5lcnNoaXBzXCJdJykub2Zmc2V0KCkubGVmdFxuICAgICAgICBcblxuICAgICAgICBzdXBlcihvcHRzKSAgXG5cblxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgIHN1cGVyKCkgICAgXG4gICAgICAgIEBzaG93SW5pdGlhbFN1Yk5hdigpICAgICAgICBcblxuICAgIGFkZEV2ZW50czogLT5cbiAgICAgICAgaWYgISQoJ2h0bWwnKS5oYXNDbGFzcyAndGFibGV0J1xuICAgICAgICAgICAgJCgnLm5hdi1saXN0IGEgbGknKS5vbiAnbW91c2VlbnRlcicsIEBoYW5kbGVOYXZIb3ZlclxuICAgICAgICAgICAgJCgnaGVhZGVyJykub24gJ21vdXNlbGVhdmUnLCBAaGlkZVN1Yk5hdlxuICAgICAgICBcbiAgICAgICAgd2luZG93Lm9ucmVzaXplID0gQGhhbmRsZVJlc2l6ZVxuICAgICAgICBAYm9keS5maW5kKFwiI25hdmJhci1tZW51XCIpLm9uICdjbGljaycsIEB0b2dnbGVOYXZcbiAgICAgICAgJCgnI21vYmlsZS1oZWFkZXItbmF2IGEnKS5vbiAnY2xpY2snLCBAc2hvd01vYmlsZVN1Yk5hdlxuICAgICAgICAkKCcjbW9iaWxlLWhlYWRlci1uYXYgaScpLm9uICdjbGljaycsIEBoYW5kbGVBcnJvd0NsaWNrXG4gICAgICAgIFxuICAgICAgICBAYm9keS5maW5kKCcudG9nZ2xlLW5hdicpLm9uICdjbGljaycsICgpIC0+XG4gICAgICAgICAgICAkKEApLnBhcmVudHMoJ2hlYWRlcicpLmZpbmQoJyNuYXZiYXItbWVudSBpbWcnKS50cmlnZ2VyKCdjbGljaycpXG4gICAgICAgICAgICBcbiAgICAgICAgJCgnI21vYmlsZS1oZWFkZXItbmF2Jykub24gJ2NsaWNrJywgJy5tb2JpbGUtc3ViLW5hdiBsaScsIEBvbkNsaWNrTW9iaWxlU3ViTmF2TGlua1xuICAgICAgICBcbiAgICBcbiAgICBoYW5kbGVTdWJOYXY6ID0+XG4gICAgICAgIHN0YXJ0UGFnZSA9ICQoJy5zdWJuYXYnKS5kYXRhICdwYWdlJ1xuICAgICAgICBpZCA9ICQoJy5uYXYtbGlzdCBhW2RhdGEtcGFnZS1zaG9ydD1cIicgKyBzdGFydFBhZ2UgKyAnXCJdJykuZGF0YSAncGFnZSdcbiAgICAgICAgQHNob3dTdWJOYXZMaW5rcyhpZClcbiAgICAgICAgXG4gICAgc2hvd0luaXRpYWxTdWJOYXY6ID0+XG4gICAgICAgIHNlY3Rpb24gPSAkKCcuc3VibmF2JykuZGF0YSAncGFnZSdcbiAgICAgICAgXG4gICAgICAgIGlmIHNlY3Rpb24gPT0gJ29mZmVyaW5ncycgfHwgc2VjdGlvbiA9PSAnYWNjb21tb2RhdGlvbnMnIHx8IHNlY3Rpb24gPT0gJ291cnBhcmtzJ1xuICAgICAgICAgICAgQHNob3dTdWJOYXZMaW5rcygnb3VyLXBhcmtzJylcbiAgICAgICAgZWxzZSBpZiBzZWN0aW9uID09ICdwYXJ0bmVyc2hpcC1kZXRhaWxzJyB8fCBzZWN0aW9uID09ICdwYXJ0bmVyc2hpcCdcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MoJ3BhcnRuZXJzaGlwcycpXG4gICAgICAgIFxuICAgIHRvZ2dsZU5hdjogKGUpID0+XG4gICAgICAgICAgICAgICAgXG4gICAgaGFuZGxlUmVzaXplOiA9PlxuICAgICAgICBAaGFuZGxlU3ViTmF2KClcbiAgICAgICAgQGFkanVzdE1vYmlsZU5hdigpXG4gICAgICAgIFxuICAgICAgICBcbiAgICBwb3NpdGlvblN1Yk5hdkxpc3RzOiA9PlxuICAgICAgICAjY29uc29sZS5sb2cgJ3Bvc2l0aW9uU3ViTmF2TGlzdHMnXG4jICAgICAgICBvdXJQYXJrc0xlZnQgPSAkKCcubmF2LWxpc3QgYVtkYXRhLXBhZ2U9XCJvdXItcGFya3NcIl0nKS5vZmZzZXQoKS5sZWZ0XG4jICAgICAgICBwYXJ0bmVyc2hpcExlZnQgPSAkKCcubmF2LWxpc3QgYVtkYXRhLXBhZ2U9XCJwYXJ0bmVyc2hpcHNcIl0nKS5vZmZzZXQoKS5sZWZ0ICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZiAkKCcjaGVhZGVyLXRvcCcpLmhhc0NsYXNzICdzbWFsbCdcbiAgICAgICAgICAgIGlmIHdpbmRvdy5pbm5lcldpZHRoIDwgOTkzXG4gICAgICAgICAgICAgICAgJCgnI291ci1wYXJrcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBvdXJQYXJrc0xlZnQgLSA5MClcbiAgICAgICAgICAgICAgICAkKCcjcGFydG5lcnNoaXBzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQHBhcnRuZXJzaGlwTGVmdCAtIDEzMylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAkKCcjb3VyLXBhcmtzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQG91clBhcmtzTGVmdCAtIDkwKVxuICAgICAgICAgICAgICAgICQoJyNwYXJ0bmVyc2hpcHMtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAcGFydG5lcnNoaXBMZWZ0IC0gMTE4KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiB3aW5kb3cuaW5uZXJXaWR0aCA8IDk5M1xuICAgICAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAb3VyUGFya3NMZWZ0IC0gNjApXG4gICAgICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBwYXJ0bmVyc2hpcExlZnQgLSAxMDUpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgJCgnI291ci1wYXJrcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBvdXJQYXJrc0xlZnQgLSA2MClcbiAgICAgICAgICAgICAgICAkKCcjcGFydG5lcnNoaXBzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQHBhcnRuZXJzaGlwTGVmdCAtIDkwKVxuXG4gICAgYW5pbWF0ZUhlYWRlcjogKHNjcm9sbFkpID0+XG4gICAgICAgIGlmIEBodG1sLmhhc0NsYXNzICdwaG9uZSdcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICRodCA9IEAkZWwuZmluZCgnI2hlYWRlci10b3AnKVxuICAgICAgICAkaGIgPSBAJGVsLmZpbmQoJyNoZWFkZXItYm90dG9tJykgXG5cbiAgICAgICAgaWYgc2Nyb2xsWSA+IDg1IFxuICAgICAgICAgICAgaWYgIUBuYXZDb2xsYXBzZWRcbiAgICAgICAgICAgICAgICAkKCcjaGVhZGVyLXRvcCwgI2hlYWRlci1ib3R0b20sICNuYXZiYXItbG9nbywgLm5hdi1saXN0LCAjYnV5LCAuaGVhZGVyLWNvbnRhY3QsIC5oZWFkZXItc29jaWFsJykuYWRkQ2xhc3MoJ3NtYWxsJylcbiAgICAgICAgICAgICAgICBAbmF2Q29sbGFwc2VkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIEBwb3NpdGlvblN1Yk5hdkxpc3RzKCkgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIEBuYXZDb2xsYXBzZWRcbiAgICAgICAgICAgICAgICAkKCcjaGVhZGVyLXRvcCwgI2hlYWRlci1ib3R0b20sICNuYXZiYXItbG9nbywgLm5hdi1saXN0LCAjYnV5LCAuaGVhZGVyLWNvbnRhY3QsIC5oZWFkZXItc29jaWFsJykucmVtb3ZlQ2xhc3MoJ3NtYWxsJylcbiAgICAgICAgICAgICAgICBAbmF2Q29sbGFwc2VkID0gZmFsc2VcbiAgICAgICAgICAgICAgICBAaGFuZGxlU3ViTmF2KClcbiAgICAgICAgICAgICAgICBAcG9zaXRpb25TdWJOYXZMaXN0cygpIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgaGFuZGxlTmF2SG92ZXI6IChlKSA9PlxuICAgICAgICBwYXJlbnRJRCA9ICQoZS50YXJnZXQpLnBhcmVudCgpLmRhdGEoJ3BhZ2UnKVxuICAgICAgICBpZiAkKCcjJyArIHBhcmVudElEICsgJy1zdWJuYXYtbGlzdCcpLmZpbmQoJ2EnKS5sZW5ndGggPCAxXG4gICAgICAgICAgICBAaGlkZVN1Yk5hdigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBoaWRlU3ViTmF2TGlua3MoKVxuICAgICAgICAgICAgQHNob3dTdWJOYXZMaW5rcyhwYXJlbnRJRClcbiAgICAgICAgXG4gICAgICAgICAgICBpZiAhQHN1Ym5hdlNob3dpbmdcbiAgICAgICAgICAgICAgICBAc2hvd1N1Yk5hdigpXG4gICAgICAgICAgICAgIFxuICAgIHNob3dTdWJOYXY6ID0+XG4gICAgICAgIEBzdWJuYXYuYWRkQ2xhc3MoJ3Nob3dpbmcnKVxuICAgICAgICBAc3VibmF2U2hvd2luZyA9IHRydWVcbiAgICAgICAgXG4gICAgaGlkZVN1Yk5hdjogPT5cbiAgICAgICAgQHN1Ym5hdi5yZW1vdmVDbGFzcygnc2hvd2luZycpXG4gICAgICAgIEBzdWJuYXZTaG93aW5nID0gZmFsc2VcbiAgICAgICAgQGhhbmRsZVN1Yk5hdigpXG5cbiAgICBzaG93U3ViTmF2TGlua3M6IChwYWdlKSA9PlxuICAgICAgICBpZiBwYWdlP1xuICAgICAgICAgICAgbGVmdCA9ICQoJy5uYXYgLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwiJyArIHBhZ2UgKyAnXCJdJykucG9zaXRpb24oKS5sZWZ0XG4gICAgICAgICAgICBvZmZzZXQgPSAwXG4gICAgICAgICAgICBoZWxwZXIgPSAtNDUgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHdpbmRvdy5pbm5lcldpZHRoIDwgOTkzXG4gICAgICAgICAgICAgICAgaGVscGVyID0gLTIwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICNjb25zb2xlLmxvZyAncGFnZTogJywgcGFnZVxuICAgICAgICAgICAgI2NvbnNvbGUubG9nICdiOiAnLCAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0IGEnKS5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCBhJykubGVuZ3RoIDwgM1xuICAgICAgICAgICAgICAgIGZvciBhIGluICQoJyMnICsgcGFnZSArICctc3VibmF2LWxpc3QgYScpXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IG9mZnNldCArICQoYSkud2lkdGgoKVxuXG4gICAgICAgICAgICBpZiBvZmZzZXQgPiAwXG4gICAgICAgICAgICAgICAgI2NvbnNvbGUubG9nICdhJ1xuICAgICAgICAgICAgICAgICQoJyMnICsgcGFnZSArICctc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBsZWZ0IC0gKG9mZnNldCAvIDMpKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICNjb25zb2xlLmxvZyAnYidcbiMgICAgICAgICAgICAgICAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgbGVmdCArIGhlbHBlcilcbiAgICAgICAgICAgICAgICBAcG9zaXRpb25TdWJOYXZMaXN0cygpXG4gICAgICAgICAgICAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0JykuYWRkQ2xhc3MoJ3Nob3dpbmcnKVxuICAgIFxuICAgIGhpZGVTdWJOYXZMaW5rczogPT5cbiAgICAgICAgJCgnLnN1Ym5hdi1saXN0IGxpJykucmVtb3ZlQ2xhc3MoJ3Nob3dpbmcnKVxuICAgICAgICBcbiAgICBoYW5kbGVTdWJOYXY6ID0+XG4gICAgICAgIGlmICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygnb3VycGFya3MnKSB8fCAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ29mZmVyaW5ncycpIHx8ICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygnYWNjb21tb2RhdGlvbnMnKVxuICAgICAgICAgICAgJCgndWwuc3VibmF2LWxpc3QgbGknKS5yZW1vdmVDbGFzcyAnc2hvd2luZydcbiAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5hZGRDbGFzcyAnc2hvd2luZydcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MoJ291ci1wYXJrcycpXG5cbiAgICAgICAgICAgIGlmICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygnb2ZmZXJpbmdzJylcbiAgICAgICAgICAgICAgICAkKCdhI291ci1wYXJrcy1vZmZlcmluZ3Mtc3VibmF2LWxpbmsnKS5hZGRDbGFzcyAnc2VsZWN0ZWQnXG5cbiAgICAgICAgICAgIGlmICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygnYWNjb21tb2RhdGlvbnMnKVxuICAgICAgICAgICAgICAgICQoJ2Ejb3VyLXBhcmtzLWFjY29tbW9kYXRpb25zLXN1Ym5hdi1saW5rJykuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cbiAgICAgICAgZWxzZSBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ3BhcnRuZXJzaGlwJykgfHwgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdwYXJ0bmVyc2hpcC1kZXRhaWxzJylcbiAgICAgICAgICAgICQoJ3VsLnN1Ym5hdi1saXN0IGxpJykucmVtb3ZlQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICAgICAkKCcjcGFydG5lcnNoaXBzLXN1Ym5hdi1saXN0JykuYWRkQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICAgICBAc2hvd1N1Yk5hdkxpbmtzKCdwYXJ0bmVyc2hpcHMnKVxuXG4jICAgICAgICAgICAgaWYgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdwYXJ0bmVyc2hpcC1kZXRhaWxzJylcbiMgICAgICAgICAgICAgICAgJCgnYSNwYXJ0bmVyc2hpcC1kZXRhaWxzLXN1Ym5hdi1saW5rJykuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cbiM9PT09PT09PT09PT09PT09PT09Iz09PT09PT09PT09PT09PT09PT0jPT09PT09PT09PT09PT09PT09PSNcbiM9PT09PT09PT09PT09PT09PT09ICBNT0JJTEUgU1RBUlRTIEhFUkUgPT09PT09PT09PT09PT09PT09I1xuIz09PT09PT09PT09PT09PT09PT0jPT09PT09PT09PT09PT09PT09PSM9PT09PT09PT09PT09PT09PT09IyBcblxuICAgIHRvZ2dsZU5hdjogKGUpID0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAkdCA9ICQoZS50YXJnZXQpXG4gICAgICAgICRoYiA9ICQoJyNoZWFkZXItYm90dG9tJylcbiAgICAgICAgJG1uID0gJCgnI21vYmlsZS1oZWFkZXItbmF2JylcbiAgICAgICAgJGhoID0gJGhiLmhlaWdodCgpXG5cbiAgICAgICAgJHQudG9nZ2xlQ2xhc3MoJ2Nsb3NlZCcpXG5cbiAgICAgICAgY29uc29sZS5sb2cgJ3NlY29uZCB0b2dnbGUnXG4gICAgICAgIGNvbnNvbGUubG9nICR0XG4gICAgICAgIFxuICAgICAgICBpZiAkdC5oYXNDbGFzcygnY2xvc2VkJylcbiAgICAgICAgICAgIEBhZGp1c3RNb2JpbGVOYXYoKVxuICAgICAgICAgICAgVHdlZW5NYXgudG8gQG1vYm5hdiwgLjM1LCBcbiAgICAgICAgICAgICAgICB7eTogKDgwMCArICRoaClcbiAgICAgICAgICAgICAgICAsejogMFxuICAgICAgICAgICAgICAgICxlYXNlOiBQb3dlcjEuZWFzZU91dFxuICAgICAgICAgICAgICAgICxvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgICAgICAgICBUd2Vlbk1heC5zZXQgQG1vYm5hdixcbiAgICAgICAgICAgICAgICAgICAgICAgIHo6IDEwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBUd2Vlbk1heC5zZXQgQG1vYm5hdixcbiAgICAgICAgICAgICAgICB6OiAtMiBcbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvIEBtb2JuYXYsIC41LCB7eTogMCwgejogMCwgZWFzZTogUG93ZXIxLmVhc2VJbn1cbiAgICAgICAgICAgICQoJy5tb2JpbGUtc3ViLW5hdicpLmNzcygnaGVpZ2h0JywgJzBweCcpXG4gICAgICAgICAgICBAYWRqdXN0TW9iaWxlTmF2XG4gICAgICAgICAgICBAaGlkZU1vYmlsZVN1Yk5hdigpXG4gICAgICAgICAgICBUd2Vlbk1heC5zZXQgQGNvbnRlbnQgLFxuICAgICAgICAgICAgICAgIHk6IDBcblxuICAgIGFkanVzdE1vYmlsZU5hdjogPT5cbiAgICAgICAgJGhiID0gJCgnI2hlYWRlci1ib3R0b20nKVxuICAgICAgICAkbW4gPSAkKCcjbW9iaWxlLWhlYWRlci1uYXYnKVxuICAgICAgICAjIFNldCBuYXYgaGVpZ2h0IHRvIDM1MHB4IGV2ZXJ5IHRpbWUgYmVmb3JlIGFkanVzdGluZ1xuICAgICAgICAjJG1uLmNzcyB7aGVpZ2h0OiAzNTB9XG4gICAgICAgICRoaCA9ICRoYi5oZWlnaHQoKVxuICAgICAgICAkbmggPSAkbW4uaGVpZ2h0KClcbiAgICAgICAgJGl3ID0gd2luZG93LmlubmVyV2lkdGhcbiAgICAgICAgJGloID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgICRtYiA9ICQoJyNuYXZiYXItbWVudScpXG5cbiAgICAgICAgaWYgJG5oID4gJGloXG4gICAgICAgICAgICAkbW4uY3NzIHtoZWlnaHQ6ICgkaWggLSAkaGgpLCBvdmVyZmxvdzogJ3Njcm9sbCd9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICRtbi5jc3Mge2hlaWdodDogNDAwICsgJ3B4J30gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgc2hvd01vYmlsZVN1Yk5hdjogKGUpID0+XG4gICAgICAgIHRoaXNTdWJOYXYgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5maW5kICcubW9iaWxlLXN1Yi1uYXYnXG4gICAgICAgIFxuICAgICAgICBpZiAodGhpc1N1Yk5hdi5maW5kKCdsaScpLmxlbmd0aCA8IDEpXG4gICAgICAgICAgICBAaGlkZU1vYmlsZVN1Yk5hdigpXG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiAhKCQoZS50YXJnZXQpLnBhcmVudCgpLmhhc0NsYXNzKCdhY3RpdmUnKSlcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgXG4gICAgICAgIGhvd01hbnkgPSB0aGlzU3ViTmF2LmZpbmQoJ2xpJykubGVuZ3RoXG4gICAgICAgIHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICB0YXJnZXQgPSAkKGUudGFyZ2V0KVxuXG4gICAgICAgIEBoaWRlTW9iaWxlU3ViTmF2KClcbiAgICAgICAgdGFyZ2V0LmZpbmQoJ2knKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICB0YXJnZXQuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgdGFyZ2V0LnBhcmVudHMoJ2EnKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICBAbW9ibmF2LmNzcygnaGVpZ2h0JywgKHdpbmRvd0hlaWdodCAtIDEwMCkgKyAncHgnKVxuICAgICAgICB0aGlzU3ViTmF2LmNzcygnaGVpZ2h0JywgKGhvd01hbnkgKiA1MCkgKyAncHgnKVxuICAgICAgICBcbiAgICBoaWRlTW9iaWxlU3ViTmF2OiA9PlxuICAgICAgICAkKCcubW9iaWxlLXN1Yi1uYXYnKS5jc3MoJ2hlaWdodCcsICcwcHgnKVxuICAgICAgICBAbW9ibmF2LmNzcygnaGVpZ2h0JywgJzQwMHB4JylcbiAgICAgICAgQG1vYm5hdi5maW5kKCdpJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgQG1vYm5hdi5maW5kKCdsaScpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgIEBtb2JuYXYuZmluZCgndWwgYScpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG5cbiAgICBcbiAgICBoYW5kbGVBcnJvd0NsaWNrOiAoZSkgPT5cbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgXG4gICAgICAgIGlmICQoZS50YXJnZXQpLmhhc0NsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICBAaGlkZU1vYmlsZVN1Yk5hdigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoJ2xpJykudHJpZ2dlciAnY2xpY2snXG4gICAgICAgIFxuICAgICAgICBcbiAgICBvbkNsaWNrTW9iaWxlU3ViTmF2TGluazogKGUpID0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIFxuICAgICAgICBpZiAkKGUudGFyZ2V0KS5kYXRhKCdocmVmJyk/XG4gICAgICAgICAgICB1cmwgPSAkKGUudGFyZ2V0KS5kYXRhICdocmVmJ1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmxcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlckFuaW1hdGlvblxuXG5cbiIsIlxuUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuVmlkZW9PdmVybGF5ID0gcmVxdWlyZSAnLi9WaWRlb092ZXJsYXkuY29mZmVlJ1xuXG5jbGFzcyBQYXJrc0xpc3QgZXh0ZW5kcyBQbHVnaW5CYXNlXG5cbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gICAgICAgIEAkZWwgPSAkKG9wdHMuZWwpXG4gICAgICAgIHN1cGVyKG9wdHMpICAgICAgICAgXG4gICAgICAgIEBnYWxsZXJ5ID0gb3B0cy5nYWxsZXJ5XG4gICAgICAgIGlmIEBnYWxsZXJ5P1xuICAgICAgICAgICAgQGdhbGxlcnkub24gXCJpdGVtSW5kZXhcIiAsIEBzZWxlY3RMb2dvXG4gICAgICAgICAgICBcbiAgICAgICAgQHBhZ2UgPSBvcHRzLnBhZ2VcblxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgIEBwYXJrTG9nb3MgPSAkKEAkZWwpLmZpbmQgXCJsaVwiXG4gICAgICAgIEBjdXJyZW50U2VsZWN0ZWQgPSBAcGFya0xvZ29zLmZpbHRlcihcIjpmaXJzdC1jaGlsZFwiKVxuICAgICAgICBpZiBAZ2FsbGVyeT9cbiAgICAgICAgICAgIEBzZWxlY3RMb2dvIEBzZWxlY3RlZExvZ28oKVxuICAgICAgICAgICAgQGdhbGxlcnkuZ290byBAc2VsZWN0ZWRMb2dvKCksIHRydWVcbiAgICAgICAgc3VwZXIoKVxuXG4gICAgYWRkRXZlbnRzOiAtPlxuICAgICAgICBAJGVsLm9uICdjbGljaycsICdsaS5wYXJrJywgQGhhbmRsZUxvZ29JbnRlcmFjdGlvblxuICAgICAgICBcbiAgICAgICAgQHBhcmtMb2dvcy5lYWNoIChpLHQpID0+XG4gICAgICAgICAgICBsb2dvRXZlbnRzID0gbmV3IEhhbW1lcih0KVxuICAgICAgICAgICAgbG9nb0V2ZW50cy5vbiAndGFwJyAsIEBoYW5kbGVMb2dvSW50ZXJhY3Rpb25cblxuICAgIGhhbmRsZUxvZ29JbnRlcmFjdGlvbjogKGUpID0+XG4gICAgICAgIGlmIEBwYWdlID09ICdhY2NvbW1vZGF0aW9uJ1xuICAgICAgICAgICAgQHBhcmtMb2dvcy5yZW1vdmVDbGFzcyAnc2VsZWN0ZWQnXG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnRzKCdsaS5wYXJrJykuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuICAgICAgICAgICAgd2hpY2hQYXJrID0gJChlLnRhcmdldCkucGFyZW50cygnbGkucGFyaycpLmF0dHIoJ2lkJylcbiAgICAgICAgICAgIEBzaG93TmV3QWNjb21tb2RhdGlvbnMod2hpY2hQYXJrKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIFxuICAgICAgICAkdGFyZ2V0ID0gJChlLnRhcmdldCkuY2xvc2VzdCgnbGknKVxuXG4gICAgICAgIGlkID0gJHRhcmdldC5kYXRhKCdpZCcpXG4gICAgICAgIFxuICAgICAgICBAZGlzcGxheUNvbnRlbnQgaWRcbiAgICAgICAgXG4gICAgICAgIFxuICAgIHNob3dOZXdBY2NvbW1vZGF0aW9uczogKHBhcmspID0+XG4gICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IC5zd2lwZXItY29udGFpbmVyJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLmNhcm91c2VsLXdyYXBwZXInKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuc3dpcGVyLWNvbnRhaW5lcltkYXRhLWxvZ289XCInICsgcGFyayArICdcIl0nKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuc3dpcGVyLWNvbnRhaW5lcltkYXRhLWxvZ289XCInICsgcGFyayArICdcIl0nKS5wYXJlbnQoKS5hZGRDbGFzcyAnYWN0aXZlJ1xuXG4gICAgZGlzcGxheUNvbnRlbnQ6IChpZCkgLT5cblxuXG4gICAgICAgIEBzZWxlY3RMb2dvKGlkKVxuXG4gICAgICAgICNTd2l0Y2ggSW5mbyBCb3hlc1xuICAgICAgICBAZ2FsbGVyeS5nb3RvKGlkKVxuXG5cbiAgICBzZWxlY3RMb2dvOiAoaWQpID0+XG4gICAgICAgIGxvZ29JZCA9IFwiIyN7aWR9LWxvZ29cIlxuICAgICAgICBAcGFya0xvZ29zLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgIEBwYXJrTG9nb3MuZmlsdGVyKGxvZ29JZCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcblxuXG4gICAgc2VsZWN0ZWRMb2dvOiAtPlxuICAgICAgICByZXR1cm4gQHBhcmtMb2dvcy5wYXJlbnQoKS5maW5kKCdsaS5zZWxlY3RlZCcpLmRhdGEoJ2lkJyk7XG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXJrc0xpc3RcblxuIiwiY2xhc3MgU3ZnSW5qZWN0XG5cbiAgICBjb25zdHJ1Y3RvcjogKHNlbGVjdG9yKSAtPlxuICAgICAgICBcbiAgICAgICAgQCRzdmdzID0gJChzZWxlY3RvcilcbiAgICAgICAgXG4gICAgICAgIEBwcmVsb2FkZXIgPSBuZXcgY3JlYXRlanMuTG9hZFF1ZXVlIHRydWUgLCBcIlwiICwgdHJ1ZVxuICAgICAgICBAcHJlbG9hZGVyLnNldE1heENvbm5lY3Rpb25zKDEwKVxuICAgICAgICBAcHJlbG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIgJ2ZpbGVsb2FkJyAsIEBvblN2Z0xvYWRlZFxuICAgICAgICBAcHJlbG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvbkxvYWRDb21wbGV0ZVxuICAgICAgICBAbWFuaWZlc3QgPSBbXVxuICAgICAgICBAY29sbGVjdFN2Z1VybHMoKVxuICAgICAgICBAbG9hZFN2Z3MoKVxuICAgICAgICBcbiAgICBjb2xsZWN0U3ZnVXJsczogLT5cbiAgICAgICAgXG4gICAgICAgIHNlbGYgPSBAXG4gICAgICAgIFxuICAgICAgICBAJHN2Z3MuZWFjaCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZCA9IFwic3ZnLWluamVjdC0je3BhcnNlSW50KE1hdGgucmFuZG9tKCkgKiAxMDAwKS50b1N0cmluZygpfVwiXG4gICAgICAgICAgXG4gICAgICAgICAgICAkKEApLmF0dHIoJ2lkJywgaWQpXG4gICAgICAgICAgICAkKEApLmF0dHIoJ2RhdGEtYXJiJyAsIFwiYWJjMTIzXCIpXG4gICAgICAgICAgICBzdmdVcmwgPSAkKEApLmF0dHIoJ3NyYycpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgXG5cbiAgICAgICAgICAgIHNlbGYubWFuaWZlc3QucHVzaCBcbiAgICAgICAgICAgICAgICBpZDppZFxuICAgICAgICAgICAgICAgIHNyYzpzdmdVcmxcbiAgICAgICAgICAgICAgICBcbiAgICBsb2FkU3ZnczogLT5cbiAgICAgICAgXG4gICAgICAgIEBwcmVsb2FkZXIubG9hZE1hbmlmZXN0KEBtYW5pZmVzdClcbiAgICAgICAgICAgICAgICBcbiAgICBcbiAgICBpbmplY3RTdmc6IChpZCxzdmdEYXRhKSAtPlxuICAgICAgICBcbiAgICAgICAgJGVsID0gJChcIiMje2lkfVwiKSAgICBcbiBcbiBcbiAgICAgICAgaW1nSUQgPSAkZWwuYXR0cignaWQnKVxuICAgICAgICBpbWdDbGFzcyA9ICRlbC5hdHRyKCdjbGFzcycpXG4gICAgICAgIGltZ0RhdGEgPSAkZWwuY2xvbmUodHJ1ZSkuZGF0YSgpIG9yIFtdXG4gICAgICAgIGRpbWVuc2lvbnMgPSBcbiAgICAgICAgICAgIHc6ICRlbC5hdHRyKCd3aWR0aCcpXG4gICAgICAgICAgICBoOiAkZWwuYXR0cignaGVpZ2h0JylcblxuICAgICAgICBzdmcgPSAkKHN2Z0RhdGEpLmZpbHRlcignc3ZnJylcbiAgICAgICAgXG5cbiAgICAgICAgc3ZnID0gc3ZnLmF0dHIoXCJpZFwiLCBpbWdJRCkgIGlmIHR5cGVvZiBpbWdJRCBpc250ICd1bmRlZmluZWQnXG4gICAgICAgIGlmIHR5cGVvZiBpbWdDbGFzcyBpc250ICd1bmRlZmluZWQnXG4gICAgICAgICAgICBjbHMgPSAoaWYgKHN2Zy5hdHRyKFwiY2xhc3NcIikgaXNudCAndW5kZWZpbmVkJykgdGhlbiBzdmcuYXR0cihcImNsYXNzXCIpIGVsc2UgXCJcIilcbiAgICAgICAgICAgIHN2ZyA9IHN2Zy5hdHRyKFwiY2xhc3NcIiwgaW1nQ2xhc3MgKyBcIiBcIiArIGNscyArIFwiIHJlcGxhY2VkLXN2Z1wiKVxuICAgICAgICBcbiAgICAgICAgIyBjb3B5IGFsbCB0aGUgZGF0YSBlbGVtZW50cyBmcm9tIHRoZSBpbWcgdG8gdGhlIHN2Z1xuICAgICAgICAkLmVhY2ggaW1nRGF0YSwgKG5hbWUsIHZhbHVlKSAtPiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgc3ZnWzBdLnNldEF0dHJpYnV0ZSBcImRhdGEtXCIgKyBuYW1lLCB2YWx1ZVxuICAgICAgICAgICAgcmV0dXJuICAgICAgICBcbiAgICAgICAgc3ZnID0gc3ZnLnJlbW92ZUF0dHIoXCJ4bWxuczphXCIpXG4gICAgICAgIFxuICAgICAgICAjR2V0IG9yaWdpbmFsIGRpbWVuc2lvbnMgb2YgU1ZHIGZpbGUgdG8gdXNlIGFzIGZvdW5kYXRpb24gZm9yIHNjYWxpbmcgYmFzZWQgb24gaW1nIHRhZyBkaW1lbnNpb25zXG4gICAgICAgIG93ID0gcGFyc2VGbG9hdChzdmcuYXR0cihcIndpZHRoXCIpKVxuICAgICAgICBvaCA9IHBhcnNlRmxvYXQoc3ZnLmF0dHIoXCJoZWlnaHRcIikpXG4gICAgICAgIFxuICAgICAgICAjU2NhbGUgYWJzb2x1dGVseSBpZiBib3RoIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlcyBleGlzdFxuICAgICAgICBpZiBkaW1lbnNpb25zLncgYW5kIGRpbWVuc2lvbnMuaFxuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJ3aWR0aFwiLCBkaW1lbnNpb25zLndcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwiaGVpZ2h0XCIsIGRpbWVuc2lvbnMuaFxuICAgICAgICBcbiAgICAgICAgI1NjYWxlIHByb3BvcnRpb25hbGx5IGJhc2VkIG9uIHdpZHRoXG4gICAgICAgIGVsc2UgaWYgZGltZW5zaW9ucy53XG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcIndpZHRoXCIsIGRpbWVuc2lvbnMud1xuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJoZWlnaHRcIiwgKG9oIC8gb3cpICogZGltZW5zaW9ucy53XG4gICAgICAgIFxuICAgICAgICAjU2NhbGUgcHJvcG9ydGlvbmFsbHkgYmFzZWQgb24gaGVpZ2h0XG4gICAgICAgIGVsc2UgaWYgZGltZW5zaW9ucy5oXG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcImhlaWdodFwiLCBkaW1lbnNpb25zLmhcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwid2lkdGhcIiwgKG93IC8gb2gpICogZGltZW5zaW9ucy5oXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgJGVsLnJlcGxhY2VXaXRoIHN2Z1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIG9uU3ZnTG9hZGVkOiAoZSkgPT5cbiAgICAgICAgXG4gICAgICAgIEBpbmplY3RTdmcoZS5pdGVtLmlkLCBlLnJhd1Jlc3VsdClcbiAgICBcbiAgICBvbkxvYWRDb21wbGV0ZTogKGUpID0+XG4gICAgXG4gICAgXG4gICAgXG4gICAgXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IFN2Z0luamVjdCAiLCJcblxuY2xhc3MgVmlkZW9PdmVybGF5XG5cblxuXG4gICAgY29uc3RydWN0b3I6IChlbCkgLT5cbiAgICAgICAgQCRlbCA9ICQoZWwpXG4gICAgICAgIEAkaW5uZXIgPSBAJGVsLmZpbmQoXCIub3ZlcmxheS1pbm5lclwiKVxuICAgICAgICBAJGNvbnRhaW5lciA9IEAkZWwuZmluZChcIi5vdmVybGF5LWlubmVyLWNvbnRhaW5lclwiKVxuICAgICAgICBcbiAgICAgICAgaWYgKEAkY29udGFpbmVyLmZpbmQoJy5vdmVybGF5LWNvbnRlbnQnKS5zaXplKCkgaXMgMSkgXG4gICAgICAgICAgICBAJGNvbnRhaW5lciA9IEAkY29udGFpbmVyLmZpbmQoJy5vdmVybGF5LWNvbnRlbnQnKVxuICAgICAgICAgICAgXG4gICAgICAgIEAkY2xvc2UgPSBAJGVsLmZpbmQoXCIub3ZlcmxheS1jbG9zZVwiKVxuICAgICAgICBcblxuICAgICAgICBAY3JlYXRlVmlkZW9JbnN0YW5jZSgpXG4gICAgICAgIEBjcmVhdGVPdmVybGF5VHJhbnNpdGlvbigpXG4gICAgICAgIEBhZGRFdmVudHMoKVxuXG5cblxuICAgIGNyZWF0ZU92ZXJsYXlUcmFuc2l0aW9uOiAtPlxuICAgICAgICBAdGwgPSBuZXcgVGltZWxpbmVNYXhcblxuICAgICAgICBAJGVsLnNob3coKVxuXG4gICAgICAgIEB0bC5hZGQgVHdlZW5NYXguZnJvbVRvICQoJyNvdmVybGF5JyksIC4wMSxcbiAgICAgICAgICAgIHt6SW5kZXg6IC0xLCBkaXNwbGF5Oidub25lJywgejogMH0sIHt6SW5kZXg6IDUwMDAsIGRpc3BsYXk6J2Jsb2NrJywgejogOTk5OTk5OTk5OX1cbiAgICAgICAgXG4gICAgICAgIEB0bC5hZGQgVHdlZW5NYXgudG8gQCRlbCAsIC4zNSAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MVxuXG4gICAgICAgIEB0bC5hZGQgVHdlZW5NYXgudG8gQCRpbm5lciAsIC41NSAsXG4gICAgICAgICAgICBhbHBoYToxXG5cbiAgICAgICAgQHRsLmFkZCBUd2Vlbk1heC50byBAJGNsb3NlICwgLjI1ICxcbiAgICAgICAgICAgIGFscGhhOjFcbiAgICAgICAgLFxuICAgICAgICAgICAgXCItPS4xNVwiXG5cbiAgICAgICAgQHRsLmFkZExhYmVsKFwiaW5pdENvbnRlbnRcIilcblxuICAgICAgICBAdGwuc3RvcCgpXG5cbiAgICBjcmVhdGVWaWRlb0luc3RhbmNlOiAoKSAtPlxuXG5cblxuICAgIGFkZEV2ZW50czogLT5cbiAgICAgICAgQGNsb3NlRXZlbnQgPSBuZXcgSGFtbWVyKEAkY2xvc2VbMF0pXG5cblxuXG4gICAgdHJhbnNpdGlvbkluT3ZlcmxheTogKG5leHQpIC0+XG4gICAgICAgIGNvbnNvbGUubG9nICd0cmFuc2l0aW9uSW5PdmVybGF5J1xuICAgICAgICBAdHJhbnNJbkNiID0gbmV4dFxuICAgICAgICBAdGwuYWRkQ2FsbGJhY2soQHRyYW5zSW5DYiwgXCJpbml0Q29udGVudFwiKVxuICAgICAgICBAdGwucGxheSgpXG4gICAgICAgIEBjbG9zZUV2ZW50Lm9uICd0YXAnICwgQGNsb3NlT3ZlcmxheVxuXG4gICAgdHJhbnNpdGlvbk91dE92ZXJsYXk6IC0+XG4gICAgICAgIGNvbnNvbGUubG9nICd0cmFuc2l0aW9uT3V0T3ZlcmxheSdcbiAgICAgICAgQGNsb3NlRXZlbnQub2ZmICd0YXAnICwgQGNsb3NlT3ZlcmxheVxuICAgICAgICBAdGwucmVtb3ZlQ2FsbGJhY2soQHRyYW5zSW5DYilcbiAgICAgICAgQHRsLnJldmVyc2UoKVxuICAgICAgICBkZWxldGUgQHRyYW5zSW5DYlxuXG5cbiAgICBjbG9zZU92ZXJsYXk6IChlKSA9PlxuICAgICAgICBAcmVtb3ZlVmlkZW8oKVxuICAgICAgICBAdHJhbnNpdGlvbk91dE92ZXJsYXkoKVxuXG5cbiAgICByZW1vdmVWaWRlbzogKCkgLT5cbiAgICAgICAgaWYgQHZpZGVvSW5zdGFuY2VcbiAgICAgICAgICAgIEB2aWRlb0luc3RhbmNlLnBhdXNlKClcbiAgICAgICAgICAgIEB2aWRlb0luc3RhbmNlLmN1cnJlbnRUaW1lKDApXG4gICAgICAgICAgICAjQHZpZGVvSW5zdGFuY2UuZGlzcG9zZSgpXG5cbiAgICByZXNpemVPdmVybGF5OiAoKSAtPlxuICAgICAgICAkdmlkID0gQCRlbC5maW5kKCd2aWRlbycpXG4gICAgICAgICR3ID0gd2luZG93LmlubmVyV2lkdGhcbiAgICAgICAgJGggPSAkdmlkLmhlaWdodCgpXG5cbiAgICAgICAgIyBAJGlubmVyLmNzcyB7d2lkdGg6ICR3LCBoZWlnaHQ6ICRofVxuICAgICAgICAjICR2aWQuY3NzIHtoZWlnaHQ6IDEwMCArICclJywgd2lkdGg6IDEwMCArICclJ31cblxuICAgIGFwcGVuZERhdGE6IChkYXRhKSAtPlxuICAgICAgICBpZiBkYXRhLm1wNCA9PSBcIlwiIG9yICEgZGF0YS5tcDQ/XG4gICAgICAgICAgICBjb25zb2xlLmxvZyAnbm8gdmlkZW8sIGl0cyBhbiBpbWFnZSdcbiAgICAgICAgICAgIEBwb3N0ZXIgPSAkKFwiPGRpdiBjbGFzcz0ndmlkZW8tanMnPjxpbWcgY2xhc3M9J3Zqcy10ZWNoJyBzcmM9J1wiICsgZGF0YS5wb3N0ZXIgKyBcIicgY2xhc3M9J21lZGlhLWltYWdlLXBvc3RlcicgLz48L2Rpdj5cIilcbiAgICAgICAgICAgIEAkY29udGFpbmVyLmh0bWwgQHBvc3RlclxuICAgICAgICAgICAgQHBvc3Rlci5jc3MgJ2hlaWdodCcsICcxMDAlJ1xuICAgICAgICAgICAgQHJlbW92ZVZpZGVvKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICAgIG1wNCA9ICQoXCI8c291cmNlIHNyYz1cXFwiI3tkYXRhLm1wNH1cXFwiIHR5cGU9XFxcInZpZGVvL21wNFxcXCIgLz4gXCIpXG4gICAgICAgIHdlYm0gPSAkKFwiPHNvdXJjZSBzcmM9XFxcIiN7ZGF0YS53ZWJtfVxcXCIgdHlwZT1cXFwidmlkZW8vd2VibVxcXCIgLz4gXCIpXG5cbiAgICAgICAgQCR2aWRlb0VsID0gJChcIjx2aWRlbyBpZD0nb3ZlcmxheS1wbGF5ZXInIGNsYXNzPSd2anMtZGVmYXVsdC1za2luIHZpZGVvLWpzJyBjb250cm9scyBwcmVsb2FkPSdhdXRvJyAvPlwiKVxuICAgICAgICBAJHZpZGVvRWwuYXBwZW5kKG1wNClcbiAgICAgICAgQCR2aWRlb0VsLmFwcGVuZCh3ZWJtKVxuICAgICAgICBAJGNvbnRhaW5lci5odG1sIEAkdmlkZW9FbFxuXG4gICAgICAgIGlmIEB2aWRlb0luc3RhbmNlP1xuICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UuZGlzcG9zZSgpXG4gICAgICAgIEB2aWRlb0luc3RhbmNlID0gdmlkZW9qcyBcIm92ZXJsYXktcGxheWVyXCIgICxcbiAgICAgICAgICAgIHdpZHRoOlwiMTAwJVwiXG4gICAgICAgICAgICBoZWlnaHQ6XCIxMDAlXCJcblxuXG5cblxuICAgIHBsYXlWaWRlbzogKCkgPT5cbiMgICAgICAgIGlmKCEkKFwiaHRtbFwiKS5oYXNDbGFzcygnbW9iaWxlJykpXG4jICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UucGxheSgpXG4gICAgICAgIGlmIEB2aWRlb0luc3RhbmNlP1xuICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UucGxheSgpXG4gICAgICAgICAgICBcbiAgICBzaG93SW1hZ2U6ICgpID0+XG4gICAgICAgIGNvbnNvbGUubG9nICdzaG93SW1hZ2UnXG5cblxuXG5vdmVybGF5ID0gbmV3IFZpZGVvT3ZlcmxheSBcIiNvdmVybGF5XCJcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cy5pbml0VmlkZW9PdmVybGF5ID0gKGRhdGEpIC0+XG4gICAgY29uc29sZS5sb2cgJ2RhdGEyOiAnLCBkYXRhXG4gICAgb3ZlcmxheS5hcHBlbmREYXRhKGRhdGEpXG5cblxuICAgIGlmICEoZGF0YS5tcDQgPT0gXCJcIilcbiAgICAgICAgY29uc29sZS5sb2cgJ2RhdGEubXA0ICE9PSBcIlwiJ1xuICAgICAgICBvdmVybGF5LnRyYW5zaXRpb25Jbk92ZXJsYXkob3ZlcmxheS5wbGF5VmlkZW8pXG4gICAgZWxzZVxuICAgICAgICBjb25zb2xlLmxvZyAnZGF0YS5tcDQgPT09IFwiXCInXG4gICAgICAgIG92ZXJsYXkudHJhbnNpdGlvbkluT3ZlcmxheShvdmVybGF5LnNob3dJbWFnZSlcblxuXG5cblxuXG5cblxuXG5cblxuXG4iLCJcclxuVmlld0Jhc2UgPSByZXF1aXJlIFwiLi4vYWJzdHJhY3QvVmlld0Jhc2UuY29mZmVlXCJcclxuXHJcbmNsYXNzIFNjcm9sbEJhciBleHRlbmRzIFZpZXdCYXNlXHJcblxyXG4gICAgc2Nyb2xsaW5nIDogZmFsc2VcclxuICAgIG9mZnNldFkgOiAwXHJcbiAgICBwb3NpdGlvbiA6IDBcclxuICAgIGhpZGVUaW1lb3V0OiAwXHJcblxyXG5cclxuICAgIGluaXRpYWxpemU6IC0+XHJcbiAgICAgICAgQG9uUmVzaXplKClcclxuICAgICAgICBAc2V0RXZlbnRzKClcclxuXHJcbiAgICAgICAgaWYgd2luZG93LmlzVGllclRhYmxldFxyXG4gICAgICAgICAgICBAJGVsLmhpZGUoKVxyXG5cclxuXHJcblxyXG4gICAgc2V0RXZlbnRzOiA9PlxyXG4gICAgICAgIEBkZWxlZ2F0ZUV2ZW50c1xyXG4gICAgICAgICAgICBcIm1vdXNlZG93biAuaGFuZGxlXCIgOiBcIm9uSGFuZGxlRG93blwiXHJcbiAgICAgICAgICAgICNcIm1vdXNlZW50ZXJcIiA6IFwib25IYW5kbGVVcFwiXHJcbiAgICAgICAgICAgIFwiY2xpY2sgLnJhaWxcIiA6IFwib25SYWlsQ2xpY2tcIlxyXG5cclxuICAgICAgICAkKGRvY3VtZW50KS5vbiBcIm1vdXNldXBcIiAsIEBvbkhhbmRsZVVwXHJcbiAgICAgICAgJChkb2N1bWVudCkub24gXCJtb3VzZW1vdmVcIiAsIEBvbk1vdXNlTW92ZVxyXG5cclxuXHJcbiAgICAgICAgXHJcbiAgICB1cGRhdGVIYW5kbGU6IChwb3MpID0+XHJcbiAgICAgICAgQHBvc2l0aW9uID0gcG9zXHJcbiAgICAgICAgQCRlbC5maW5kKCcuaGFuZGxlJykuY3NzXHJcbiAgICAgICAgICAgIHRvcDogQHBvc2l0aW9uICogKCQod2luZG93KS5oZWlnaHQoKSAtIEAkZWwuZmluZChcIi5oYW5kbGVcIikuaGVpZ2h0KCkpXHJcbiAgICAgICAgQHNob3dTY3JvbGxiYXIoKVxyXG4gICAgICAgIEBoaWRlU2Nyb2xsYmFyKClcclxuXHJcbiAgICBvblJhaWxDbGljazogKGUpID0+XHJcbiAgICAgICAgQG9mZnNldFkgPSBpZiBlLm9mZnNldFkgaXNudCB1bmRlZmluZWQgdGhlbiBlLm9mZnNldFkgZWxzZSBlLm9yaWdpbmFsRXZlbnQubGF5ZXJZXHJcbiAgICAgICAgQHBvc2l0aW9uID0gQG9mZnNldFkgLyAkKHdpbmRvdykuaGVpZ2h0KClcclxuICAgICAgICBAdHJpZ2dlciBcImN1c3RvbVNjcm9sbEp1bXBcIiAsIEBwb3NpdGlvblxyXG4gICAgICAgIFxyXG5cclxuXHJcbiAgICBvbkhhbmRsZURvd246IChlKSA9PlxyXG5cclxuICAgICAgICBAJGVsLmNzc1xyXG4gICAgICAgICAgICB3aWR0aDpcIjEwMCVcIlxyXG4gICAgICAgIEBvZmZzZXRZID0gaWYgZS5vZmZzZXRZIGlzbnQgdW5kZWZpbmVkIHRoZW4gZS5vZmZzZXRZIGVsc2UgZS5vcmlnaW5hbEV2ZW50LmxheWVyWVxyXG4gICAgICAgIEBzY3JvbGxpbmcgPSB0cnVlXHJcblxyXG4gICAgb25IYW5kbGVVcDogKGUpID0+XHJcbiAgICAgICAgQCRlbC5jc3NcclxuICAgICAgICAgICAgd2lkdGg6XCIxNXB4XCJcclxuXHJcbiAgICAgICAgQHNjcm9sbGluZyA9IGZhbHNlXHJcblxyXG4gICAgb25Nb3VzZU1vdmU6IChlKSA9PlxyXG4gICAgICAgIGlmIEBzY3JvbGxpbmdcclxuXHJcbiAgICAgICAgICAgIGlmIGUucGFnZVkgLSBAb2Zmc2V0WSA8PSAwXHJcbiAgICAgICAgICAgICAgICAkKFwiLmhhbmRsZVwiKS5jc3NcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IDFcclxuICAgICAgICAgICAgZWxzZSBpZiBlLnBhZ2VZIC0gQG9mZnNldFkgPj0gJCh3aW5kb3cpLmhlaWdodCgpIC0gJChcIiNzY3JvbGxiYXIgLmhhbmRsZVwiKS5oZWlnaHQoKVxyXG4gICAgICAgICAgICAgICAgXHJcblxyXG4gICAgICAgICAgICAgICAgJChcIi5oYW5kbGVcIikuY3NzXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAgICgkKHdpbmRvdykuaGVpZ2h0KCkgLSAkKFwiI3Njcm9sbGJhciAuaGFuZGxlXCIpLmhlaWdodCgpKSAtIDFcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgJChcIi5oYW5kbGVcIikuY3NzXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBlLnBhZ2VZIC0gQG9mZnNldFlcclxuXHJcblxyXG4gICAgICAgICAgICBAcG9zaXRpb24gPSBwYXJzZUludCgkKFwiI3Njcm9sbGJhciAuaGFuZGxlXCIpLmNzcyhcInRvcFwiKSkgLyAoJCh3aW5kb3cpLmhlaWdodCgpIC0gJChcIiNzY3JvbGxiYXIgLmhhbmRsZVwiKS5oZWlnaHQoKSlcclxuXHJcbiAgICAgICAgICAgIGlmIEBwb3NpdGlvbiA8IHBhcnNlRmxvYXQoLjAwNSlcclxuICAgICAgICAgICAgICAgIEBwb3NpdGlvbiA9IDBcclxuICAgICAgICAgICAgZWxzZSBpZiBAcG9zaXRpb24gPiBwYXJzZUZsb2F0KC45OTUpXHJcbiAgICAgICAgICAgICAgICBAcG9zaXRpb24gPSAxXHJcblxyXG5cclxuICAgICAgICAgICAgQHRyaWdnZXIgXCJjdXN0b21TY3JvbGxcIiAsIEBwb3NpdGlvblxyXG4gICAgICAgICAgXHJcbiAgIFxyXG4gICAgICAgIGlmIEBtb3VzZVggaXNudCBlLmNsaWVudFggYW5kIEBtb3VzZVkgaXNudCBlLmNsaWVudFlcclxuICAgICAgICAgICAgQHNob3dTY3JvbGxiYXIoKVxyXG4gICAgICAgICAgICBAaGlkZVNjcm9sbGJhcigpXHJcblxyXG4gICAgICAgIEBtb3VzZVggPSBlLmNsaWVudFhcclxuICAgICAgICBAbW91c2VZID0gZS5jbGllbnRZXHJcblxyXG4gICAgb25SZXNpemU6IChlKSA9PlxyXG5cclxuXHJcbiAgICAgICAgQCRlbC5maW5kKCcuaGFuZGxlJykuY3NzXHJcbiAgICAgICAgICAgIGhlaWdodDogKCQod2luZG93KS5oZWlnaHQoKSAvICQoXCJzZWN0aW9uXCIpLmhlaWdodCgpICkgKiAkKHdpbmRvdykuaGVpZ2h0KClcclxuXHJcbiAgICAgICAgQHVwZGF0ZUhhbmRsZShAcG9zaXRpb24pXHJcblxyXG5cclxuICAgIGhpZGVTY3JvbGxiYXI6ID0+XHJcbiAgICAgICAgaWYgQGhpZGVUaW1lb3V0P1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoQGhpZGVUaW1lb3V0KVxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICBAaGlkZVRpbWVvdXQgPSBzZXRUaW1lb3V0ICg9PlxyXG4gICAgICAgICAgICBpZiBAbW91c2VZID4gNzJcclxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvIEAkZWwsIC41ICxcclxuICAgICAgICAgICAgICAgICAgICBhdXRvQWxwaGE6IDBcclxuICAgICAgICAgICAgKSAsIDIwMDBcclxuICAgICAgICBcclxuXHJcbiAgICBzaG93U2Nyb2xsYmFyOiA9PlxyXG4gICAgICAgIFR3ZWVuTWF4LnRvIEAkZWwgLCAuNSAsXHJcbiAgICAgICAgICAgIGF1dG9BbHBoYTogLjVcclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTY3JvbGxCYXIiLCJcclxuXHJcbmNsYXNzIFNoYXJlclxyXG5cclxuICAgIFxyXG4gICAgU2hhcmVyLmluaXRGYWNlYm9vayA9IC0+XHJcbiAgICAgICAgRkIuaW5pdCBcclxuICAgICAgICAgICAgYXBwSWQ6XCIyMTUyMjQ3MDUzMDczNDFcIlxyXG4gICAgICAgICAgICBjaGFubmVsVXJsOlwiL2NoYW5uZWwuaHRtbFwiXHJcbiAgICAgICAgICAgIHN0YXR1czogdHJ1ZVxyXG4gICAgICAgICAgICB4ZmJsOiB0cnVlXHJcblxyXG5cclxuICAgICAgICBcclxuICAgIFxyXG4gICAgU2hhcmVyLnNoYXJlVHdpdHRlciA9IChzaGFyZU1lc3NhZ2UsICB1cmwsIGhhc2h0YWdzKSAtPlxyXG4gICAgICAgIHRleHQgPSBzaGFyZU1lc3NhZ2VcclxuICAgICAgICBoYXNodGFncyA9IFwiXCJcclxuICAgICAgICB1cmwgPSB1cmxcclxuICAgICAgICB0d1VSTCA9IFwiaHR0cHM6Ly90d2l0dGVyLmNvbS9pbnRlbnQvdHdlZXQ/dGV4dD1cIiArIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KSArIFwiJnVybD1cIiArIGVuY29kZVVSSUNvbXBvbmVudCh1cmwpXHJcbiAgICAgICAgc3RyICs9IFwiJmhhc2h0YWdzPVwiICsgaGFzaHRhZ3MgIGlmIGhhc2h0YWdzXHJcbiAgICAgICAgQG9wZW5Qb3B1cCA1NzUsIDQyMCwgdHdVUkwsIFwiVHdpdHRlclwiXHJcblxyXG4gICAgU2hhcmVyLnNoYXJlRmFjZWJvb2sgPSAobmFtZSwgIGNhcHRpb24gLGRlc2NyaXB0aW9uICwgbGluayAsIHBpY3R1cmUpIC0+XHJcblxyXG4gICAgICAgIEZCLnVpXHJcbiAgICAgICAgICAgIG1ldGhvZDpcImZlZWRcIlxyXG4gICAgICAgICAgICBsaW5rOmxpbmtcclxuICAgICAgICAgICAgcGljdHVyZTpwaWN0dXJlXHJcbiAgICAgICAgICAgIG5hbWU6IG5hbWVcclxuICAgICAgICAgICAgY2FwdGlvbjpjYXB0aW9uXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOmRlc2NyaXB0aW9uXHJcbiAgICAgICAgXHJcblxyXG4gICAgU2hhcmVyLnNoYXJlR29vZ2xlID0gKHVybCkgLT5cclxuXHJcbiAgICAgICAgQG9wZW5Qb3B1cCA2MDAsIDQwMCAsIFwiaHR0cHM6Ly9wbHVzLmdvb2dsZS5jb20vc2hhcmU/dXJsPVwiK3VybCwgXCJHb29nbGVcIlxyXG5cclxuICAgIFNoYXJlci5zaGFyZVBpbnRlcmVzdCA9ICh1cmwgLCBkZXNjcmlwdGlvbiwgcGljdHVyZSkgLT5cclxuXHJcbiAgICAgICAgZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbi5zcGxpdChcIiBcIikuam9pbihcIitcIilcclxuICAgICAgICBAb3BlblBvcHVwIDc4MCwgMzIwLCBcImh0dHA6Ly9waW50ZXJlc3QuY29tL3Bpbi9jcmVhdGUvYnV0dG9uLz91cmw9I3tlbmNvZGVVUklDb21wb25lbnQodXJsKX0mYW1wO2Rlc2NyaXB0aW9uPSN7ZGVzY3JpcHRpb259JmFtcDttZWRpYT0je2VuY29kZVVSSUNvbXBvbmVudChwaWN0dXJlKX1cIlxyXG5cclxuXHJcbiAgICBTaGFyZXIuZW1haWxMaW5rID0gKHN1YmplY3QsIGJvZHkpIC0+XHJcbiAgICAgICAgeCA9IEBvcGVuUG9wdXAgMSAsIDEsIFwibWFpbHRvOiZzdWJqZWN0PSN7ZW5jb2RlVVJJQ29tcG9uZW50KHN1YmplY3QpfSZib2R5PSN7ZW5jb2RlVVJJQ29tcG9uZW50KGJvZHkpfVwiXHJcbiAgICAgICAgeC5jbG9zZSgpXHJcblxyXG4gICAgU2hhcmVyLm9wZW5Qb3B1cCA9ICh3LCBoLCB1cmwsIG5hbWUpIC0+XHJcbiAgICAgICAgd2luZG93Lm9wZW4gdXJsLCBuYW1lLCBcInN0YXR1cz0xLHdpZHRoPVwiICsgdyArIFwiLGhlaWdodD1cIiArIGggKyBcIixsZWZ0PVwiICsgKHNjcmVlbi53aWR0aCAtIHcpIC8gMiArIFwiLHRvcD1cIiArIChzY3JlZW4uaGVpZ2h0IC0gaCkgLyAyXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTaGFyZXIiLCJEcmFnZ2FibGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi9jb20vcGx1Z2lucy9EcmFnZ2FibGVHYWxsZXJ5LmNvZmZlZSdcbkZhZGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi9jb20vcGx1Z2lucy9GYWRlR2FsbGVyeS5jb2ZmZWUnXG5QYXJrc0xpc3QgPSByZXF1aXJlICcuL2NvbS9wbHVnaW5zL1BhcmtzTGlzdC5jb2ZmZWUnXG5cbkhlYWRlckFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vY29tL3BsdWdpbnMvSGVhZGVyQW5pbWF0aW9uLmNvZmZlZSdcbkFuaW1hdGlvbkJhc2UgPSByZXF1aXJlICcuL2NvbS9hYnN0cmFjdC9BbmltYXRpb25CYXNlLmNvZmZlZSdcblxuXG4kKGRvY3VtZW50KS5yZWFkeSAtPlxuXG4gICAgIyQoXCIjY29udGVudFwiKS5jc3MoXCJoZWlnaHRcIiAsICQoJyNjb250ZW50JykuaGVpZ2h0KCkpXG5cbiAgICBsZWdhbCA9IG5ldyBBbmltYXRpb25CYXNlXG4gICAgICAgIGVsOiBcImJvZHlcIlxuIl19
