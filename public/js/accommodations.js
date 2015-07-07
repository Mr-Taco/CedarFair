(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var AccommodationsPage, DraggableGallery, FadeGallery, HeaderAnimation, ParksList;

DraggableGallery = require('./com/plugins/DraggableGallery.coffee');

FadeGallery = require('./com/plugins/FadeGallery.coffee');

ParksList = require('./com/plugins/ParksList.coffee');

HeaderAnimation = require('./com/plugins/HeaderAnimation.coffee');

AccommodationsPage = require('./com/pages/AccommodationsPage.coffee');

$(document).ready(function() {
  var accommodations;
  return accommodations = new AccommodationsPage({
    el: "body"
  });
});



},{"./com/pages/AccommodationsPage.coffee":6,"./com/plugins/DraggableGallery.coffee":11,"./com/plugins/FadeGallery.coffee":12,"./com/plugins/HeaderAnimation.coffee":13,"./com/plugins/ParksList.coffee":14}],2:[function(require,module,exports){
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



},{"../pages/animations/clouds.coffee":8,"../plugins/HeaderAnimation.coffee":13,"../util/ScrollBar.coffee":20,"./ViewBase.coffee":4}],3:[function(require,module,exports){
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



},{}],4:[function(require,module,exports){
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



},{"../util/Sharer.coffee":21}],5:[function(require,module,exports){
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



},{"../plugins/BasicOverlay.coffee":10,"../plugins/SvgInject.coffee":16}],6:[function(require,module,exports){
var AccommodationsPage, AnimationBase, DraggableGallery, FadeGallery, FrameAnimation, HeaderAnimation, ParksList, ResizeButtons, animations, globalAnimations,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AnimationBase = require("../abstract/AnimationBase.coffee");

ParksList = require('../plugins/ParksList.coffee');

DraggableGallery = require('../plugins/DraggableGallery.coffee');

FadeGallery = require('../plugins/FadeGallery.coffee');

HeaderAnimation = require('../plugins/HeaderAnimation.coffee');

FrameAnimation = require('../plugins/coasters/FrameAnimation.coffee');

ResizeButtons = require('../plugins/ResizeButtons.coffee');

animations = require('./animations/accommodations.coffee');

globalAnimations = require('./animations/global.coffee');

AccommodationsPage = (function(superClass) {
  extend(AccommodationsPage, superClass);

  function AccommodationsPage(el) {
    this.resetTimeline = bind(this.resetTimeline, this);
    this.totalAnimationTime = 25;
    AccommodationsPage.__super__.constructor.call(this, el);
  }

  AccommodationsPage.prototype.initialize = function() {
    return AccommodationsPage.__super__.initialize.call(this);
  };

  AccommodationsPage.prototype.initComponents = function() {
    var carousel, coaster, i, j, k, len, len1, ref, ref1;
    AccommodationsPage.__super__.initComponents.call(this);
    if (!this.isPhone) {
      coaster = new FrameAnimation({
        id: "accommodations-coaster-1",
        el: "#accomodations-section1",
        baseUrl: this.cdnRoot + "coasters/",
        url: "shot-2/data.json"
      });
      coaster.loadFrames();
      this.parks = new ParksList({
        el: "#accommodations-select",
        gallery: this.accommodations,
        page: "accommodation"
      });
      ref = $('#accommodations-gallery .swiper-container');
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        carousel = ref[i];
        if ($(carousel).find('li').length > 1) {
          this.accommodations = new DraggableGallery({
            el: "#accommodations-gallery .carousel-wrapper." + i,
            across: 1,
            page: 'accommodations'
          });
        } else {
          $(carousel).find('li').css('width', '100%');
        }
      }
      return this.accommodationVideos = new FadeGallery({
        el: '#accommodations-gallery'
      });
    } else {
      this.parks = new DraggableGallery({
        el: "#accommodations-select",
        control: '#accommodations-gallery'
      });
      ref1 = $('#accommodations-gallery .swiper-container');
      for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
        carousel = ref1[i];
        if ($(carousel).find('li').length > 1) {
          this.accommodations = new DraggableGallery({
            el: "#accommodations-gallery .carousel-wrapper." + i,
            across: 1
          });
        }
      }
      return this.accommodationVideos = new FadeGallery({
        el: '#accommodations-gallery'
      });
    }
  };

  AccommodationsPage.prototype.resetTimeline = function() {
    AccommodationsPage.__super__.resetTimeline.call(this);
    if (!this.isPhone) {
      this.triggers.push(animations.topHeadline());
      this.triggers.push(animations.scrollCircle());
      this.triggers.push(animations.selectBox());
      return this.triggers.push(animations.accommodationsCarousel());
    }
  };

  return AccommodationsPage;

})(AnimationBase);

module.exports = AccommodationsPage;



},{"../abstract/AnimationBase.coffee":2,"../plugins/DraggableGallery.coffee":11,"../plugins/FadeGallery.coffee":12,"../plugins/HeaderAnimation.coffee":13,"../plugins/ParksList.coffee":14,"../plugins/ResizeButtons.coffee":15,"../plugins/coasters/FrameAnimation.coffee":18,"./animations/accommodations.coffee":7,"./animations/global.coffee":9}],7:[function(require,module,exports){
var global;

global = require('./global.coffee');

module.exports.topHeadline = function() {
  var $el, tween;
  $el = $('#accommodations');
  tween = new TimelineMax;
  tween.add(TweenMax.fromTo($el.find('.top-headline .title-bucket h1'), .35, {
    y: -10,
    alpha: 0
  }, {
    y: 0,
    alpha: 1
  }), 0.5);
  tween.add(TweenMax.fromTo($el.find('.top-headline .title-bucket h3'), .35, {
    y: -10,
    alpha: 0
  }, {
    y: 0,
    alpha: 1
  }), "-=.3");
  return {
    a: tween,
    offset: $el.offset().top
  };
};

module.exports.scrollCircle = function() {
  var $el, tween;
  $el = $("#accommodations .circ-btn-wrapper");
  tween = new TimelineMax;
  tween.add(TweenMax.fromTo($el.find("p"), .3, {
    autoAlpha: 0
  }, {
    autoAlpha: 1
  }));
  tween.add(TweenMax.fromTo($el.find("a"), .45, {
    scale: 0,
    rotation: 180,
    immediateRender: true
  }, {
    scale: 1,
    rotation: 0,
    ease: Back.easeOut
  }), "-=.2");
  return {
    a: tween,
    offset: $el.offset().top
  };
};

module.exports.selectBox = function() {
  var $el, tween;
  $el = $('#accommodations #accommodations-select');
  tween = new TimelineMax;
  tween.add(TweenMax.fromTo($el, .35, {
    opacity: 0,
    scale: .75
  }, {
    opacity: 1,
    scale: 1
  }));
  tween.paused(true);
  return {
    a: tween,
    offset: $el.offset().top
  };
};

module.exports.accommodationsCarousel = function() {
  var $el, tween;
  $el = $('#accommodations-gallery');
  tween = new TimelineMax;
  tween.add(TweenMax.fromTo($el, .35, {
    alpha: 0
  }, {
    alpha: 1
  }));
  tween.paused(true);
  return {
    a: tween,
    offset: $el.offset().top
  };
};



},{"./global.coffee":9}],8:[function(require,module,exports){
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



},{}],9:[function(require,module,exports){
var commas, tweenParallax;

commas = function(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

module.exports.count = function(el) {
  var $el, change, num, start, targetVal, tl, tweens;
  $el = $(el);
  targetVal = $(el).html();
  num = $(el).text().split(',').join('');
  start = num * .9995;
  change = num * .0005;
  tl = new TimelineMax({
    onStart: function() {
      return $el.html("42");
    },
    onComplete: function() {
      return $el.html(targetVal);
    }
  });
  tweens = [];
  tweens.push(TweenMax.fromTo($el, 0.25, {
    autoAlpha: 0,
    immediateRender: true,
    ease: Quint.easeOut
  }, {
    autoAlpha: 1
  }));
  tweens.push(TweenMax.to($el, 1.5, {
    ease: Quint.easeOut,
    onUpdate: function() {
      var els, html, value;
      value = parseInt(start + parseInt(change * this.progress()));
      value = commas(value);
      els = value.split('');
      html = '';
      $.each(els, function(name, value) {
        return html += value === ',' ? ',' : '<span>' + value + '</span>';
      });
      return $el.html(html);
    }
  }));
  tl.add(tweens);
  return tl;
};

tweenParallax = function(pos, tween, min, max, dur) {
  var amount, percent;
  percent = ((pos - min) / (max - min)) * 1;
  amount = percent * dur;
  if (pos <= max && pos >= min) {
    if (Math.abs(amount - tween.time()) >= .001) {
      return tween.tweenTo(amount, {
        overwrite: "preexisting",
        ease: Quad.easeOut
      });
    }
  }
};

module.exports.clouds = function(setId, min, max, dur) {
  var $el, cloud, clouds, duration, i, j, len, maxPos, minPos, offset, tween, tweens;
  minPos = min;
  maxPos = max;
  duration = dur;
  $el = $(".clouds" + setId);
  clouds = $el.find(".cloud");
  tween = new TimelineMax;
  tween.ns = {};
  tween.ns.name = setId;
  tweens = [];
  for (i = j = 0, len = clouds.length; j < len; i = ++j) {
    cloud = clouds[i];
    offset = "+=" + (250 * (i + 1));
    tweens.push(TweenMax.to(cloud, duration, {
      y: offset
    }));
  }
  tween.add(tweens);
  tween.paused(true);
  return function(pos) {
    return tweenParallax(pos, tween, minPos, maxPos, duration);
  };
};

module.exports.scroll = function(minPos, maxPos, duration, elem) {
  var tween, tweens;
  tween = new TimelineMax;
  tween.ns = {};
  tween.ns.name = ".scrollto";
  tweens = [];
  tweens.push(TweenMax.to(elem, duration, {
    opacity: 0
  }));
  tween.add(tweens);
  tween.paused(true);
  return function(pos) {
    return tweenParallax(pos, tween, minPos, maxPos, duration);
  };
};

module.exports.arms = function(min, max, dur) {
  var arm, duration, maxPos, minPos, tween, tweens;
  minPos = min;
  maxPos = max;
  duration = dur;
  arm = $(".arms");
  tween = new TimelineMax;
  tween.ns = {};
  tween.ns.name = ".arms";
  tweens = [];
  tweens.push(TweenMax.to(arm, duration, {
    top: 0
  }));
  tween.add(tweens);
  tween.paused(true);
  return function(pos) {
    return tweenParallax(pos, tween, minPos, maxPos, duration);
  };
};



},{}],10:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":3}],11:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":3,"../abstract/ViewBase.coffee":4}],12:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":3,"./VideoOverlay.coffee":17}],13:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":3,"../global/index.coffee":5}],14:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":3,"./VideoOverlay.coffee":17}],15:[function(require,module,exports){
var PluginBase, ResizeButtons,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = require('../abstract/PluginBase.coffee');

ResizeButtons = (function(superClass) {
  extend(ResizeButtons, superClass);

  function ResizeButtons() {
    this.resizeButtons();
  }

  ResizeButtons.prototype.resizeButtons = function() {
    var btn_wrapper, btn_wrappers, btns, c, i, len, maxWidth, results, widestSpan;
    c = $('#content');
    btn_wrappers = c.find('.btn-wrapper');
    results = [];
    for (i = 0, len = btn_wrappers.length; i < len; i++) {
      btn_wrapper = btn_wrappers[i];
      btns = $(btn_wrapper).find('a');
      if (btns.length > 1) {
        maxWidth = 0;
        widestSpan = null;
        $(btns).each(function() {
          if ($(this).width() > maxWidth) {
            maxWidth = $(this).width();
            return widestSpan = $(this);
          }
        });
        results.push($(btns).each(function() {
          return $(this).css({
            width: maxWidth + 60
          });
        }));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  return ResizeButtons;

})(PluginBase);

module.exports = ResizeButtons;



},{"../abstract/PluginBase.coffee":3}],16:[function(require,module,exports){
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



},{}],17:[function(require,module,exports){
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



},{}],18:[function(require,module,exports){
var FrameAnimation, FramesModel, PluginBase, matchFrameNum,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = require('../../abstract/PluginBase.coffee');

FramesModel = require('./FramesModel.coffee');

matchFrameNum = /\d+(?=\.[a-zA-Z]+)/;

FrameAnimation = (function(superClass) {
  extend(FrameAnimation, superClass);

  function FrameAnimation(opts) {
    this.inViewport = bind(this.inViewport, this);
    this.checkCoasterVisibility = bind(this.checkCoasterVisibility, this);
    this.onFramesLoaded = bind(this.onFramesLoaded, this);
    this.onTrackLoaded = bind(this.onTrackLoaded, this);
    this.setupCanvas = bind(this.setupCanvas, this);
    var depth;
    this.$el = $(opts.el);
    this.async = opts.async || false;
    depth = opts.depth || 1;
    this.$container = $("<div class='coaster-container' />");
    this.$container.attr('id', opts.id);
    this.$container.css('z-index', depth);
    TweenMax.set(this.$container, {
      z: depth * 10
    });
    FrameAnimation.__super__.constructor.call(this, opts);
  }

  FrameAnimation.prototype.initialize = function(opts) {
    FrameAnimation.__super__.initialize.call(this, opts);
    this.model = new FramesModel(opts);
    this.model.on("dataLoaded", this.setupCanvas);
    this.model.on("trackLoaded", this.onTrackLoaded);
    this.model.on("framesLoaded", this.onFramesLoaded);
    return this.model.loadData();
  };

  FrameAnimation.prototype.loadFrames = function() {
    if (this.model.data != null) {
      return this.model.preloadFrames();
    } else {
      return this.deferLoading = true;
    }
  };

  FrameAnimation.prototype.setupCanvas = function() {
    this.canvasWidth = this.model.get('global').width;
    this.canvasHeight = this.model.get('global').height;
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext('2d');
    this.canvas.setAttribute('width', this.canvasWidth);
    this.canvas.setAttribute('height', this.canvasHeight);
    this.$container.append(this.canvas);
    this.$el.prepend(this.$container);
    this.model.preloadTrack();
    if (this.deferLoading) {
      return this.model.preloadFrames();
    }
  };

  FrameAnimation.prototype.displayTrack = function() {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    return this.context.drawImage(this.trackImage.tag, 0, 0, this.canvasWidth, this.canvasHeight);
  };

  FrameAnimation.prototype.displayFrame = function(num) {
    var asset, frameAsset, manifest;
    manifest = this.model.get('manifest');
    if (manifest.length > num) {
      asset = manifest[num];
      frameAsset = this.model.getAsset(asset.filename);
      return this.context.drawImage(frameAsset.tag, asset.x, asset.y, asset.width, asset.height);
    }
  };

  FrameAnimation.prototype.initAnimation = function() {
    var delay, duration, frames, repeatDelay, self, speed;
    frames = this.model.get('manifest').length;
    speed = this.model.get('global').fps;
    delay = this.model.get('global').delay || 0;
    repeatDelay = this.model.get('global').repeatDelay || 10;
    duration = frames / speed;
    self = this;
    this.lastFrameNum = -1;
    return this.timeline = window.coaster = TweenMax.to(this.canvas, duration, {
      onUpdate: function() {
        var frameNum;
        frameNum = Math.floor(frames * this.progress());
        if (frameNum !== this.lastFrameNum) {
          self.displayTrack();
          self.displayFrame(frameNum);
        }
        return this.lastFrameNum = frameNum;
      },
      repeat: -1,
      repeatDelay: repeatDelay,
      delay: delay
    });
  };

  FrameAnimation.prototype.onTrackLoaded = function() {
    this.trackImage = this.model.getAsset('track');
    return this.displayTrack();
  };

  FrameAnimation.prototype.onFramesLoaded = function() {
    if (typeof this.async === 'function') {
      this.async();
    }
    $(window).on('scroll', this.checkCoasterVisibility);
    return this.checkCoasterVisibility();
  };

  FrameAnimation.prototype.checkCoasterVisibility = function() {
    if (this.inViewport()) {
      $(window).off('scroll', this.checkCoasterVisibility);
      return this.initAnimation();
    }
  };

  FrameAnimation.prototype.inViewport = function() {
    var bottom, height, scrollBottom, scrollTop, top;
    top = this.$container.offset().top;
    height = this.$container.find('canvas').first().height();
    bottom = top + height;
    scrollTop = $(window).scrollTop();
    scrollBottom = $(window).scrollTop() + $(window).height();
    if ((scrollTop <= top && top <= scrollBottom)) {
      return true;
    } else {
      return false;
    }
  };

  return FrameAnimation;

})(PluginBase);

module.exports = FrameAnimation;



},{"../../abstract/PluginBase.coffee":3,"./FramesModel.coffee":19}],19:[function(require,module,exports){
var FramesModel, matchFrameNum,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

matchFrameNum = /\d+(?=\.[a-zA-Z]+)/;

FramesModel = (function(superClass) {
  extend(FramesModel, superClass);

  function FramesModel(opts) {
    this.onAssetsComplete = bind(this.onAssetsComplete, this);
    this.onTrackAssetsComplete = bind(this.onTrackAssetsComplete, this);
    this.onDataLoaded = bind(this.onDataLoaded, this);
    this.baseUrl = opts.baseUrl;
    this.url = opts.url;
    this.loadManifest = [];
    this.trackManifest = [];
    this.initLoader();
    FramesModel.__super__.constructor.call(this, opts);
  }

  FramesModel.prototype.loadData = function() {
    return $.ajax({
      url: this.baseUrl + this.url,
      method: "GET",
      dataType: "json",
      success: this.onDataLoaded,
      error: this.handleError
    });
  };

  FramesModel.prototype.handleError = function(err) {
    throw err;
  };

  FramesModel.prototype.onDataLoaded = function(data) {
    this.data = data;
    this.transformData();
    return this.emit("dataLoaded");
  };

  FramesModel.prototype.sortSequence = function(a, b) {
    var aFrame, bFrame;
    aFrame = matchFrameNum.exec(a.filename);
    bFrame = matchFrameNum.exec(b.filename);
    if (parseInt(aFrame[0]) < parseInt(bFrame[0])) {
      return -1;
    } else {
      return 1;
    }
  };

  FramesModel.prototype.transformData = function() {
    var frame, i, len, ref, results;
    this.data.manifest.sort(this.sortSequence);
    this.trackManifest.push({
      id: "track",
      src: this.data.global.folder + "/" + this.data.global.track
    });
    ref = this.data.manifest;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      frame = ref[i];
      frame.src = this.data.global.folder + "/" + frame.filename;
      results.push(this.loadManifest.push({
        id: frame.filename,
        src: frame.src
      }));
    }
    return results;
  };

  FramesModel.prototype.initLoader = function() {
    this.trackLoader = new createjs.LoadQueue(true, this.baseUrl, true);
    this.preloader = new createjs.LoadQueue(true, this.baseUrl, true);
    this.trackLoader.setMaxConnections(10);
    return this.preloader.setMaxConnections(15);
  };

  FramesModel.prototype.preloadTrack = function() {
    this.trackLoader.addEventListener('complete', this.onTrackAssetsComplete);
    return this.trackLoader.loadManifest(this.trackManifest);
  };

  FramesModel.prototype.preloadFrames = function() {
    this.preloader.addEventListener('complete', this.onAssetsComplete);
    return this.preloader.loadManifest(this.loadManifest);
  };

  FramesModel.prototype.onTrackAssetsComplete = function(e) {
    this.trackLoader.removeEventListener('complete', this.onTrackAssetsComplete);
    return this.emit("trackLoaded");
  };

  FramesModel.prototype.onAssetsComplete = function(e) {
    this.preloader.removeEventListener('complete', this.onAssetsComplete);
    return this.emit("framesLoaded");
  };

  FramesModel.prototype.getAsset = function(id) {
    var item;
    item = this.preloader.getItem(id);
    if (item == null) {
      item = this.trackLoader.getItem(id);
    }
    return item;
  };

  FramesModel.prototype.get = function(key) {
    var k, ref, v;
    ref = this.data;
    for (k in ref) {
      v = ref[k];
      if (k === key) {
        return v;
      }
    }
  };

  FramesModel.prototype.set = function(key, val) {
    return this.data[key] = val;
  };

  return FramesModel;

})(EventEmitter);

module.exports = FramesModel;



},{}],20:[function(require,module,exports){
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



},{"../abstract/ViewBase.coffee":4}],21:[function(require,module,exports){
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



},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9hY2NvbW1vZGF0aW9ucy5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvQW5pbWF0aW9uQmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvVmlld0Jhc2UuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL2dsb2JhbC9pbmRleC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvQWNjb21tb2RhdGlvbnNQYWdlLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wYWdlcy9hbmltYXRpb25zL2FjY29tbW9kYXRpb25zLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wYWdlcy9hbmltYXRpb25zL2Nsb3Vkcy5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvYW5pbWF0aW9ucy9nbG9iYWwuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvQmFzaWNPdmVybGF5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0RyYWdnYWJsZUdhbGxlcnkuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvRmFkZUdhbGxlcnkuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvSGVhZGVyQW5pbWF0aW9uLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL1BhcmtzTGlzdC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9SZXNpemVCdXR0b25zLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL1N2Z0luamVjdC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9WaWRlb092ZXJsYXkuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvY29hc3RlcnMvRnJhbWVBbmltYXRpb24uY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvY29hc3RlcnMvRnJhbWVzTW9kZWwuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3V0aWwvU2Nyb2xsQmFyLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS91dGlsL1NoYXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLDZFQUFBOztBQUFBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSx1Q0FBUixDQUFuQixDQUFBOztBQUFBLFdBQ0EsR0FBYyxPQUFBLENBQVEsa0NBQVIsQ0FEZCxDQUFBOztBQUFBLFNBRUEsR0FBWSxPQUFBLENBQVEsZ0NBQVIsQ0FGWixDQUFBOztBQUFBLGVBSUEsR0FBa0IsT0FBQSxDQUFRLHNDQUFSLENBSmxCLENBQUE7O0FBQUEsa0JBS0EsR0FBcUIsT0FBQSxDQUFRLHVDQUFSLENBTHJCLENBQUE7O0FBQUEsQ0FRQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEtBQVosQ0FBa0IsU0FBQSxHQUFBO0FBSWQsTUFBQSxjQUFBO1NBQUEsY0FBQSxHQUFxQixJQUFBLGtCQUFBLENBQ2pCO0FBQUEsSUFBQSxFQUFBLEVBQUksTUFBSjtHQURpQixFQUpQO0FBQUEsQ0FBbEIsQ0FSQSxDQUFBOzs7OztBQ0NBLElBQUEsMkRBQUE7RUFBQTs7NkJBQUE7O0FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUixDQUFYLENBQUE7O0FBQUEsU0FDQSxHQUFZLE9BQUEsQ0FBUSwwQkFBUixDQURaLENBQUE7O0FBQUEsZUFFQSxHQUFrQixPQUFBLENBQVEsbUNBQVIsQ0FGbEIsQ0FBQTs7QUFBQSxNQUdBLEdBQVMsT0FBQSxDQUFRLG1DQUFSLENBSFQsQ0FBQTs7QUFBQTtBQVFJLG1DQUFBLENBQUE7O0FBQWEsRUFBQSx1QkFBQyxFQUFELEdBQUE7QUFDVCx5REFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSx5Q0FBQSxDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSxJQUFBLCtDQUFNLEVBQU4sQ0FB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QUFBLElBQUEsQ0FBQSxHQUFJLElBQUMsQ0FBQSxTQUFELENBQVcsQ0FBWCxFQUFlLENBQWYsRUFBa0Isa0JBQUEsR0FBa0IsQ0FBQyxrQkFBQSxDQUFtQixPQUFuQixDQUFELENBQWxCLEdBQStDLFFBQS9DLEdBQXNELENBQUMsa0JBQUEsQ0FBbUIsSUFBbkIsQ0FBRCxDQUF4RSxDQUFKLENBQUE7V0FDQSxDQUFDLENBQUMsS0FBRixDQUFBLEVBRmU7RUFBQSxDQXZDbkIsQ0FBQTs7QUFBQSxFQTJDQSxNQUFNLENBQUMsU0FBUCxHQUFtQixTQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sR0FBUCxFQUFZLElBQVosR0FBQTtXQUNmLE1BQU0sQ0FBQyxJQUFQLENBQVksR0FBWixFQUFpQixJQUFqQixFQUF1QixpQkFBQSxHQUFvQixDQUFwQixHQUF3QixVQUF4QixHQUFxQyxDQUFyQyxHQUF5QyxRQUF6QyxHQUFvRCxDQUFDLE1BQU0sQ0FBQyxLQUFQLEdBQWUsQ0FBaEIsQ0FBQSxHQUFxQixDQUF6RSxHQUE2RSxPQUE3RSxHQUF1RixDQUFDLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLENBQWpCLENBQUEsR0FBc0IsQ0FBcEksRUFEZTtFQUFBLENBM0NuQixDQUFBOztnQkFBQTs7SUFISixDQUFBOztBQUFBLE1Ba0RNLENBQUMsT0FBUCxHQUFpQixNQWxEakIsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJEcmFnZ2FibGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi9jb20vcGx1Z2lucy9EcmFnZ2FibGVHYWxsZXJ5LmNvZmZlZSdcbkZhZGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi9jb20vcGx1Z2lucy9GYWRlR2FsbGVyeS5jb2ZmZWUnXG5QYXJrc0xpc3QgPSByZXF1aXJlICcuL2NvbS9wbHVnaW5zL1BhcmtzTGlzdC5jb2ZmZWUnXG5cbkhlYWRlckFuaW1hdGlvbiA9IHJlcXVpcmUgJy4vY29tL3BsdWdpbnMvSGVhZGVyQW5pbWF0aW9uLmNvZmZlZSdcbkFjY29tbW9kYXRpb25zUGFnZSA9IHJlcXVpcmUgJy4vY29tL3BhZ2VzL0FjY29tbW9kYXRpb25zUGFnZS5jb2ZmZWUnXG5cblxuJChkb2N1bWVudCkucmVhZHkgLT5cblxuICAgICMkKFwiI2NvbnRlbnRcIikuY3NzKFwiaGVpZ2h0XCIgLCAkKCcjY29udGVudCcpLmhlaWdodCgpKVxuXG4gICAgYWNjb21tb2RhdGlvbnMgPSBuZXcgQWNjb21tb2RhdGlvbnNQYWdlXG4gICAgICAgIGVsOiBcImJvZHlcIlxuIiwiXG5WaWV3QmFzZSA9IHJlcXVpcmUgXCIuL1ZpZXdCYXNlLmNvZmZlZVwiXG5TY3JvbGxCYXIgPSByZXF1aXJlIFwiLi4vdXRpbC9TY3JvbGxCYXIuY29mZmVlXCJcbkhlYWRlckFuaW1hdGlvbiA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvSGVhZGVyQW5pbWF0aW9uLmNvZmZlZSdcbmNsb3VkcyA9IHJlcXVpcmUgJy4uL3BhZ2VzL2FuaW1hdGlvbnMvY2xvdWRzLmNvZmZlZSdcblxuY2xhc3MgQW5pbWF0aW9uQmFzZSBleHRlbmRzIFZpZXdCYXNlXG5cblxuICAgIGNvbnN0cnVjdG9yOiAoZWwpIC0+XG4gICAgICAgIHN1cGVyKGVsKVxuICAgICAgICBAdGltZWxpbmUgPSBudWxsXG4gICAgICAgIEB0b3VjaFkgPSAwXG4gICAgICAgIEB0b3VjaFlMYXN0ID0gMFxuICAgICAgICBAZ2xvYmFsU2Nyb2xsQW1vdW50ID0gaWYgQGlzVGFibGV0IHRoZW4gLjUgZWxzZSAxXG4gICAgICAgIEBwcmV2U2Nyb2xsVG8gPSAwXG4gICAgICAgIEBwcmV2RGVsdGEgPSAwXG4gICAgICAgIEBjdXJyZW50UHJvZ3Jlc3MgPSAwXG4gICAgICAgIEB0b3RhbEFuaW1hdGlvblRpbWUgPSAxMFxuICAgICAgICBAc21vb3RoTXVsdGlwbGllciA9IDVcbiAgICAgICAgQG5hdlRpbWVyID0gbnVsbFxuICAgICAgICBAdmlkZW8gPSBudWxsXG4gICAgICAgIEBpbmxpbmVWaWRlbyA9IG51bGxcbiAgICAgICAgQGlzVGFibGV0ID0gJCgnaHRtbCcpLmhhc0NsYXNzKCd0YWJsZXQnKVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIGlmICFAaXNQaG9uZSAgXG4gICAgICAgICAgICBAcmVzZXRUaW1lbGluZSgpXG4gICAgICAgICAgICBAdG9nZ2xlVG91Y2hNb3ZlKClcbiAgICAgICAgICAgIEBvblJlc2l6ZSgpXG4gICAgICAgICAgICBAdXBkYXRlVGltZWxpbmUoKVxuXG4gICAgaW5pdENvbXBvbmVudHM6IC0+XG4gICAgICAgIEBoZWFkZXIgPSBuZXcgSGVhZGVyQW5pbWF0aW9uIFxuICAgICAgICAgICAgZWw6J2hlYWRlcidcblxuICAgIFxuXG5cbiAgICB0b2dnbGVUb3VjaE1vdmU6ICgpID0+XG4gICAgICAgICQoZG9jdW1lbnQpLm9mZiAnc2Nyb2xsJyAsIEBvblNjcm9sbFxuICAgICAgICBcbiAgICAgICAgQHNjcm9sbCA9XG4gICAgICAgICAgICBwb3NpdGlvbjogMFxuICAgICAgICAgICAgc2Nyb2xsVG9wOiAwXG4gICAgICAgICQoZG9jdW1lbnQpLnNjcm9sbCBAb25TY3JvbGxcbiAgICAgICAgQG9uU2Nyb2xsKClcblxuXG4gICAgZ2V0U2Nyb2xsYWJsZUFyZWE6IC0+XG4gICAgICAgIE1hdGguYWJzKCQoXCIjY29udGVudFwiKS5vdXRlckhlaWdodCgpIC0gQHN0YWdlSGVpZ2h0KVxuICAgIFxuICAgIGdldFNjcm9sbFRvcDogLT5cbiAgICAgICAgJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkgLyBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAgICAgXG4gICAgXG4gICAgXG4gICAgc2V0U2Nyb2xsVG9wOiAocGVyKSAtPiAgICAgIFxuICAgICAgICBwb3MgPSBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAqIHBlclxuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8gMCAsIHBvc1xuXG5cbiAgICBzZXREcmFnZ2FibGVQb3NpdGlvbjogKHBlcikgLT4gICAgICAgIFxuICAgICAgICBwb3MgPSBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAqIHBlciAgICAgICAgXG4gICAgICAgIFR3ZWVuTWF4LnNldCAkKFwiI2NvbnRlbnRcIikgLFxuICAgICAgICAgICAgeTogLXBvcyBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgb25TY3JvbGw6IChlKSA9PlxuICAgICAgICBpZiAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSA+IDMwXG4gICAgICAgICAgICAkKCcuY2lyYy1idG4td3JhcHBlcicpLmFkZENsYXNzICdpbnZpc2libGUnXG4gICAgICAgICAgICBcbiAgICAgICAgQHNjcm9sbC5wb3NpdGlvbiA9IEBnZXRTY3JvbGxUb3AoKVxuICAgICAgICBAc2Nyb2xsLnNjcm9sbFRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpXG4gICAgICAgIEB1cGRhdGVUaW1lbGluZSgpICAgICAgICBcbiAgICAgICAgXG5cbiAgICBvbkRyYWc6IChlKSA9PlxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEBzY3JvbGwucG9zaXRpb24gPSBNYXRoLmFicyBAc2Nyb2xsLnkgLyAgQGdldFNjcm9sbGFibGVBcmVhKClcbiAgICAgICAgQHNjcm9sbC5zY3JvbGxUb3AgPSAtQHNjcm9sbC55XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVUaW1lbGluZSgpXG5cblxuICAgIG9uUmVzaXplOiA9PlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIGlmICFAaXNUYWJsZXRcbiAgICAgICAgICAgIEByZXNldFRpbWVsaW5lKClcbiAgICAgICAgICAgIFxuICAgICAgICBAY2VudGVyT2Zmc2V0ID0gKEBzdGFnZUhlaWdodCAqIC42NjY3KVxuICAgICAgICBpZiBAc2Nyb2xsP1xuICAgICAgICAgICAgcG9zID0gQHNjcm9sbC5wb3NpdGlvbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHRvZ2dsZVRvdWNoTW92ZSgpXG4gICAgICAgICAgICBpZiAhQGlzVGFibGV0XG4gICAgICAgICAgICAgICAgQHNldFNjcm9sbFRvcChwb3MpXG4gICAgICAgICAgICBcblxuICAgIHJlc2V0VGltZWxpbmU6ID0+XG4gICAgICAgIEB0aW1lbGluZSA9IG5ldyBUaW1lbGluZU1heFxuICAgICAgICBAdHJpZ2dlcnMgPSBbXVxuICAgICAgICBAcGFyYWxsYXggPSBbXVxuXG4gICAgICAgICQoJ1tkYXRhLWNsb3VkXScpLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgICRlbCA9ICQodClcbiAgICAgICAgICAgICRjbG9zZXN0Q29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJ1tkYXRhLWNsb3VkLWNvbnRhaW5lcl0nKVxuICAgICAgICAgICAgaW5pdFBvcyA9ICRjbG9zZXN0Q29udGFpbmVyLmRhdGEoKS5jbG91ZENvbnRhaW5lci5pbml0UG9zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2xvdWRGdW5jdGlvbiA9IGNsb3Vkc1xuICAgICAgICAgICAgICAgICRlbDokZWxcblxuICAgICAgICAgICAgaWYgaW5pdFBvcyBcbiAgICAgICAgICAgICAgICBjbG91ZEZ1bmN0aW9uKGluaXRQb3MpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAcGFyYWxsYXgucHVzaCBjbG91ZEZ1bmN0aW9uXG5cbiAgICB1cGRhdGVUaW1lbGluZTogPT5cbiAgICAgICAgXG4gICAgICAgIEBoZWFkZXIuYW5pbWF0ZUhlYWRlcihAc2Nyb2xsLnNjcm9sbFRvcClcblxuICAgICAgICBmb3IgdCBpbiBAdHJpZ2dlcnNcbiAgICAgICAgICAgIGlmIEBzY3JvbGwuc2Nyb2xsVG9wID4gdC5vZmZzZXQgLSBAY2VudGVyT2Zmc2V0XG4gICAgICAgICAgICAgICAgdC5hLnBsYXkoKVxuICAgICAgICAgICAgZWxzZSBpZiBAc2Nyb2xsLnNjcm9sbFRvcCArIEBzdGFnZUhlaWdodCA8IHQub2Zmc2V0XG4gICAgICAgICAgICAgICAgdC5hLnBhdXNlZCh0cnVlKVxuICAgICAgICAgICAgICAgIHQuYS5zZWVrKDApXG5cblxuICAgICAgICBmb3IgcCBpbiBAcGFyYWxsYXhcbiAgICAgICAgICAgIHAoQHNjcm9sbC5wb3NpdGlvbilcblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25CYXNlXG4iLCJjbGFzcyBQbHVnaW5CYXNlIGV4dGVuZHMgRXZlbnRFbWl0dGVyXG5cblxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIEAkZWwgPSBpZiBvcHRzLmVsPyB0aGVuICQgb3B0cy5lbFxuXG4gICAgICAgIEBpbml0aWFsaXplKG9wdHMpXG5cblxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cbiAgICAgICAgQGFkZEV2ZW50cygpXG5cbiAgICBhZGRFdmVudHM6IC0+XG5cblxuXG4gICAgcmVtb3ZlRXZlbnRzOiAtPlxuXG5cbiAgICBkZXN0cm95OiAtPlxuICAgICAgICBAcmVtb3ZlRXZlbnRzKClcblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsdWdpbkJhc2VcblxuIiwiXG5TaGFyZXIgPSByZXF1aXJlIFwiLi4vdXRpbC9TaGFyZXIuY29mZmVlXCIgXG5cblxuY2xhc3MgVmlld0Jhc2UgZXh0ZW5kcyBFdmVudEVtaXR0ZXJcblxuXG5cblxuXG4gICAgY29uc3RydWN0b3I6IChlbCkgLT5cblxuICAgICAgICBAJGVsID0gJChlbClcbiAgICAgICAgQGlzVGFibGV0ID0gJChcImh0bWxcIikuaGFzQ2xhc3MoXCJ0YWJsZXRcIilcbiAgICAgICAgQGlzUGhvbmUgPSAkKFwiaHRtbFwiKS5oYXNDbGFzcyhcInBob25lXCIpXG4gICAgICAgIEBjZG5Sb290ID0gJCgnYm9keScpLmRhdGEoJ2NkbicpIG9yIFwiL1wiXG4gICAgICAgICQod2luZG93KS5vbiBcInJlc2l6ZS5hcHBcIiAsIEBvblJlc2l6ZVxuXG4gICAgICAgIEBzdGFnZUhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICBAc3RhZ2VXaWR0aCA9ICQod2luZG93KS53aWR0aCgpXG4gICAgICAgIEBtb3VzZVggPSAwXG4gICAgICAgIEBtb3VzZVkgPSAwXG5cbiAgICAgICAgI0BkZWxlZ2F0ZUV2ZW50cyhAZ2VuZXJhdGVFdmVudHMoKSlcbiAgICAgICAgQGluaXRpYWxpemUoKVxuXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBAaW5pdENvbXBvbmVudHMoKVxuXG4gICAgaW5pdENvbXBvbmVudHM6IC0+XG5cbiAgICBvblJlc2l6ZTogPT5cbiAgICAgICAgQHN0YWdlSGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXG4gICAgICAgIEBzdGFnZVdpZHRoID0gJCh3aW5kb3cpLndpZHRoKClcblxuXG4gICAgZ2VuZXJhdGVFdmVudHM6IC0+XG4gICAgICAgIHJldHVybiB7fVxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld0Jhc2VcbiIsIkJhc2ljT3ZlcmxheSA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvQmFzaWNPdmVybGF5LmNvZmZlZSdcblN2Z0luamVjdCA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvU3ZnSW5qZWN0LmNvZmZlZSdcblxuXG5cbmlmIHdpbmRvdy5jb25zb2xlIGlzIHVuZGVmaW5lZCBvciB3aW5kb3cuY29uc29sZSBpcyBudWxsXG4gIHdpbmRvdy5jb25zb2xlID1cbiAgICBsb2c6IC0+XG4gICAgd2FybjogLT5cbiAgICBmYXRhbDogLT5cblxuXG5cbiQoZG9jdW1lbnQpLnJlYWR5IC0+XG4gICAgIyQoJy5zdmctaW5qZWN0Jykuc3ZnSW5qZWN0KClcbiAgICAjbmV3IFN2Z0luamVjdCBcIi5zdmctaW5qZWN0XCJcbiAgICBcbiAgICBiYXNpY092ZXJsYXlzID0gbmV3IEJhc2ljT3ZlcmxheVxuICAgICAgICBlbDogJCgnI2NvbnRlbnQnKVxuXG5cbiAgICAkKCcuc2Nyb2xsdG8nKS5jbGljayAtPlxuICAgICAgIHQgPSAkKHRoaXMpLmRhdGEoJ3RhcmdldCcpXG4gICAgICAgJCgnYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiAkKCcjJyt0KS5vZmZzZXQoKS50b3AgLSA3MCAjIDcwIGZvciB0aGUgY29sbGFwc2VkIGhlYWRlclxuICAgICAgICB9KTtcblxuICAgICNpZiB3aW5kb3cuZGRscz9cbiAgICAjIGNvbnNvbGUubG9nICdjbGlja3knXG4gICAgJCh3aW5kb3cpLmNsaWNrIC0+XG4gICAgICAgIGlmIHdpbmRvdy5kZGxzP1xuICAgICAgICAgICAgJC5lYWNoIHdpbmRvdy5kZGxzLCAoaSwgdCkgLT5cbiAgICAgICAgICAgICAgICBpZiB0LmlzT3BlbiBhbmQgbm90IHQuaXNIb3ZlcmVkXG4gICAgICAgICAgICAgICAgICAgIHQuY2xvc2VNZW51KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAkKCdbZGF0YS1kZXB0aF0nKS5lYWNoIC0+XG4gICAgICAgICRlbCA9ICQoQClcbiAgICAgICAgZGVwdGggPSAkZWwuZGF0YSgpLmRlcHRoXG4gICAgICAgIFxuICAgICAgICAkZWwuY3NzKCd6LWluZGV4JywgZGVwdGgpXG4gICAgICAgIFR3ZWVuTWF4LnNldCAkZWwgLCBcbiAgICAgICAgICAgIHo6IGRlcHRoICogMTBcblxuXG5cbiAgICAkKCdib2R5Jykub24gJ0RPTU5vZGVJbnNlcnRlZCcsICAtPlxuICAgICAgICAkKCdhJykuZWFjaCAtPiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGhyZWYgPSAkKEApLmF0dHIoJ2hyZWYnKVxuICAgICAgICAgICAgaWYgaHJlZj9cbiAgICAgICAgICAgICAgICBocmVmID0gaHJlZi50cmltKClcbiAgICAgICAgICAgICAgICBpZiBocmVmLmluZGV4T2YoJ2h0dHA6Ly8nKSBpcyAwIG9yIGhyZWYuaW5kZXhPZignaHR0cHM6Ly8nKSBpcyAwIG9yIGhyZWYuaW5kZXhPZignLnBkZicpIGlzIChocmVmLmxlbmd0aCAtIDQpXG4gICAgICAgICAgICAgICAgICAgICQoQCkuYXR0cigndGFyZ2V0JywgJ19ibGFuaycpXG5cblxuICAgICQoJy5jaXJjbGUsIC5jaXJjbGUtb3V0ZXInKS5vbignbW91c2VlbnRlcicsIC0+XG4gICAgICAgIFR3ZWVuTWF4LnRvKCQodGhpcyksIC4zNSxcbiAgICAgICAgICAgIHNjYWxlOiAxLjA1LFxuICAgICAgICAgICAgZWFzZTogUG93ZXIyLmVhc2VPdXRcbiAgICAgICAgKVxuICAgIClcblxuICAgICQoJy5jaXJjbGUsIC5jaXJjbGUtb3V0ZXInKS5vbignbW91c2VsZWF2ZScsIC0+XG4gICAgICAgIFR3ZWVuTWF4LnRvKCQodGhpcyksIC4zNSxcbiAgICAgICAgICAgIHNjYWxlOiAxLFxuICAgICAgICAgICAgZWFzZTogUG93ZXIyLmVhc2VPdXRcbiAgICAgICAgKVxuICAgIClcblxuICAgICQoJyNqb2JzLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXIgbGknKS5vbignbW91c2VlbmV0ZXInLCAtPlxuICAgICAgICBjb25zb2xlLmxvZyAnaGVsbG8nXG4gICAgKVxuXG5cbiMgdGhpcyBpcyBzaGl0dHksIGJ1dCBpdCdzIG15IG9ubHkgd29ya2Fyb3VuZCBmb3IgdGhlIGNsaXBwaW5nIGlzc3VlIChDRi0xNzEpXG5kb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSAtPlxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlIGlzICdjb21wbGV0ZScpXG4gICAgICAgIHNldFRpbWVvdXQoLT5cbiAgICAgICAgICAgICQoJy5xdW90ZScpLmFkZENsYXNzKCdrZWVwaXRhaHVuZHJlZCcpXG4gICAgICAgICwgMjAwKVxuIiwiQW5pbWF0aW9uQmFzZSA9IHJlcXVpcmUgXCIuLi9hYnN0cmFjdC9BbmltYXRpb25CYXNlLmNvZmZlZVwiXG5QYXJrc0xpc3QgPSByZXF1aXJlICcuLi9wbHVnaW5zL1BhcmtzTGlzdC5jb2ZmZWUnXG5EcmFnZ2FibGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9EcmFnZ2FibGVHYWxsZXJ5LmNvZmZlZSdcbkZhZGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9GYWRlR2FsbGVyeS5jb2ZmZWUnXG5IZWFkZXJBbmltYXRpb24gPSByZXF1aXJlICcuLi9wbHVnaW5zL0hlYWRlckFuaW1hdGlvbi5jb2ZmZWUnXG5GcmFtZUFuaW1hdGlvbiA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvY29hc3RlcnMvRnJhbWVBbmltYXRpb24uY29mZmVlJ1xuUmVzaXplQnV0dG9ucyA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvUmVzaXplQnV0dG9ucy5jb2ZmZWUnXG5cbmFuaW1hdGlvbnMgPSByZXF1aXJlICcuL2FuaW1hdGlvbnMvYWNjb21tb2RhdGlvbnMuY29mZmVlJ1xuZ2xvYmFsQW5pbWF0aW9ucyA9IHJlcXVpcmUgJy4vYW5pbWF0aW9ucy9nbG9iYWwuY29mZmVlJ1xuICAgICAgICBcblxuY2xhc3MgQWNjb21tb2RhdGlvbnNQYWdlIGV4dGVuZHMgQW5pbWF0aW9uQmFzZVxuXG5cbiAgICBjb25zdHJ1Y3RvcjogKGVsKSAtPlxuICAgICAgICBAdG90YWxBbmltYXRpb25UaW1lID0gMjVcbiAgICAgICAgc3VwZXIoZWwpXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBzdXBlcigpXG5cbiAgICBpbml0Q29tcG9uZW50czogLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIGlmICFAaXNQaG9uZVxuXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvYXN0ZXIgPSBuZXcgRnJhbWVBbmltYXRpb25cbiAgICAgICAgICAgICAgICBpZDpcImFjY29tbW9kYXRpb25zLWNvYXN0ZXItMVwiXG4gICAgICAgICAgICAgICAgZWw6XCIjYWNjb21vZGF0aW9ucy1zZWN0aW9uMVwiIFxuICAgICAgICAgICAgICAgIGJhc2VVcmw6IFwiI3tAY2RuUm9vdH1jb2FzdGVycy9cIlxuICAgICAgICAgICAgICAgIHVybDogXCJzaG90LTIvZGF0YS5qc29uXCJcbiAgICAgICAgICAgIGNvYXN0ZXIubG9hZEZyYW1lcygpXG4gICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgIEBwYXJrcyA9IG5ldyBQYXJrc0xpc3RcbiAgICAgICAgICAgICAgICBlbDogXCIjYWNjb21tb2RhdGlvbnMtc2VsZWN0XCJcbiAgICAgICAgICAgICAgICBnYWxsZXJ5OiBAYWNjb21tb2RhdGlvbnNcbiAgICAgICAgICAgICAgICBwYWdlOiBcImFjY29tbW9kYXRpb25cIlxuXG4gICAgICAgICAgICBmb3IgY2Fyb3VzZWwsaSBpbiAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuc3dpcGVyLWNvbnRhaW5lcicpXG4gICAgICAgICAgICAgICAgaWYgJChjYXJvdXNlbCkuZmluZCgnbGknKS5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgICAgIEBhY2NvbW1vZGF0aW9ucyA9IG5ldyBEcmFnZ2FibGVHYWxsZXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICBlbDogXCIjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuY2Fyb3VzZWwtd3JhcHBlci5cIiArIGlcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjcm9zczogMVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZTogJ2FjY29tbW9kYXRpb25zJ1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgJChjYXJvdXNlbCkuZmluZCgnbGknKS5jc3MoJ3dpZHRoJywgJzEwMCUnKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIEBhY2NvbW1vZGF0aW9uVmlkZW9zID0gbmV3IEZhZGVHYWxsZXJ5XG4gICAgICAgICAgICAgICAgZWw6ICcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSdcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBwYXJrcyA9IG5ldyBEcmFnZ2FibGVHYWxsZXJ5XG4gICAgICAgICAgICAgICAgZWw6IFwiI2FjY29tbW9kYXRpb25zLXNlbGVjdFwiLFxuICAgICAgICAgICAgICAgIGNvbnRyb2w6ICcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSdcblxuICAgICAgICAgICAgZm9yIGNhcm91c2VsLGkgaW4gJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXInKVxuICAgICAgICAgICAgICAgIGlmICQoY2Fyb3VzZWwpLmZpbmQoJ2xpJykubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgICAgICBAYWNjb21tb2RhdGlvbnMgPSBuZXcgRHJhZ2dhYmxlR2FsbGVyeVxuICAgICAgICAgICAgICAgICAgICAgICAgZWw6IFwiI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLmNhcm91c2VsLXdyYXBwZXIuXCIgKyBpXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Jvc3M6IDFcblxuICAgICAgICAgICAgQGFjY29tbW9kYXRpb25WaWRlb3MgPSBuZXcgRmFkZUdhbGxlcnlcbiAgICAgICAgICAgICAgICBlbDogJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5J1xuXG4gICAgXG4gICAgcmVzZXRUaW1lbGluZTogPT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgICNAcGFyYWxsYXgucHVzaCBnbG9iYWxBbmltYXRpb25zLmNsb3VkcyhcIiNzZWN0aW9uMVwiLCAwICwgMSAsIGlmIEBpc1RhYmxldCB0aGVuIDEgZWxzZSA1KVxuXG4gICAgICAgIGlmICFAaXNQaG9uZVxuICAgICAgICAgICAgQHRyaWdnZXJzLnB1c2ggYW5pbWF0aW9ucy50b3BIZWFkbGluZSgpXG4gICAgICAgICAgICBAdHJpZ2dlcnMucHVzaCBhbmltYXRpb25zLnNjcm9sbENpcmNsZSgpXG4gICAgICAgICAgICBAdHJpZ2dlcnMucHVzaCBhbmltYXRpb25zLnNlbGVjdEJveCgpXG4gICAgICAgICAgICBAdHJpZ2dlcnMucHVzaCBhbmltYXRpb25zLmFjY29tbW9kYXRpb25zQ2Fyb3VzZWwoKVxuXG5cbiAgICAgICAgXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFjY29tbW9kYXRpb25zUGFnZVxuXG5cbiIsImdsb2JhbCA9IHJlcXVpcmUgJy4vZ2xvYmFsLmNvZmZlZSdcblxubW9kdWxlLmV4cG9ydHMudG9wSGVhZGxpbmUgPSAoKSAtPlxuICAgIFxuICAgICRlbCA9ICQoJyNhY2NvbW1vZGF0aW9ucycpXG4gICAgXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcbiAgICBcbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbC5maW5kKCcudG9wLWhlYWRsaW5lIC50aXRsZS1idWNrZXQgaDEnKSwgLjM1LCAgXG4gICAgICAgIHk6IC0xMFxuICAgICAgICAsYWxwaGE6IDBcbiAgICAsXG4gICAgICAgIHk6IDBcbiAgICAgICAgLGFscGhhOiAxXG4gICAgKSwgMC41XG5cbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbC5maW5kKCcudG9wLWhlYWRsaW5lIC50aXRsZS1idWNrZXQgaDMnKSwgLjM1LCBcbiAgICAgICAgeTogLTEwXG4gICAgICAgICxhbHBoYTogMFxuICAgICxcbiAgICAgICAgeTogMFxuICAgICAgICAsYWxwaGE6IDFcbiAgICApLCBcIi09LjNcIlxuXG5cbiAgICBhOiB0d2VlblxuICAgIG9mZnNldDokZWwub2Zmc2V0KCkudG9wXG5cblxubW9kdWxlLmV4cG9ydHMuc2Nyb2xsQ2lyY2xlID0gLT5cbiAgICAkZWwgPSAkKFwiI2FjY29tbW9kYXRpb25zIC5jaXJjLWJ0bi13cmFwcGVyXCIpXG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZChcInBcIikgLCAuMyAsXG4gICAgICAgIGF1dG9BbHBoYTowXG4gICAgLFxuICAgICAgICBhdXRvQWxwaGE6MVxuICAgIClcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLmZpbmQoXCJhXCIpICwgLjQ1ICxcbiAgICAgICAgc2NhbGU6MFxuICAgICAgICByb3RhdGlvbjoxODBcbiAgICAgICAgaW1tZWRpYXRlUmVuZGVyOnRydWVcbiAgICAsXG4gICAgICAgIHNjYWxlOjFcbiAgICAgICAgcm90YXRpb246MFxuICAgICAgICBlYXNlOkJhY2suZWFzZU91dFxuICAgICkgLCBcIi09LjJcIlxuXG5cblxuICAgIGE6dHdlZW5cbiAgICBvZmZzZXQ6JGVsLm9mZnNldCgpLnRvcFxuXG5cblxubW9kdWxlLmV4cG9ydHMuc2VsZWN0Qm94ID0gKCkgLT5cbiAgICAkZWwgPSAkKCcjYWNjb21tb2RhdGlvbnMgI2FjY29tbW9kYXRpb25zLXNlbGVjdCcpXG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwsIC4zNSxcbiAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAsc2NhbGU6IC43NVxuICAgICxcbiAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAsc2NhbGU6IDFcbiAgICApXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICBhOnR3ZWVuXG4gICAgb2Zmc2V0OiRlbC5vZmZzZXQoKS50b3BcblxuXG5cbm1vZHVsZS5leHBvcnRzLmFjY29tbW9kYXRpb25zQ2Fyb3VzZWwgPSAoKSAtPlxuICAgICRlbCA9ICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5JylcblxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG5cbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbCwgLjM1ICxcbiAgICAgICAgYWxwaGE6IDBcbiAgICAsXG4gICAgICAgIGFscGhhOiAxXG4gICAgKVxuXG4gICAgdHdlZW4ucGF1c2VkKHRydWUpXG4gICAgYTp0d2VlblxuICAgIG9mZnNldDokZWwub2Zmc2V0KCkudG9wXG4iLCJcbmNsb3Vkc09uVXBkYXRlID0gKGVsLCBkdXJhdGlvbikgLT5cbiAgICB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgXG4gICAgVHdlZW5NYXguc2V0IGVsLFxuICAgICAgICB4OiAtMjA1MFxuICAgICAgICBcbiAgICBUd2Vlbk1heC50byBlbCwgZHVyYXRpb24gLCBcbiAgICAgICAgeDogd2luZG93V2lkdGhcbiAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgIGNsb3Vkc09uVXBkYXRlIGVsICwgZHVyYXRpb25cbiAgICAgICAgXG5cblxuc2V0Qm9iaW5nID0gKCRlbCAsIGR1cixkZWxheSkgLT5cbiAgICBcbiAgICBAaXNUYWJsZXQgPSAkKCdodG1sJykuaGFzQ2xhc3MgJ3RhYmxldCdcbiAgICB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgd2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIFxuICAgIGlmIHdpbmRvdy5pbm5lcldpZHRoID4gNzY3ICYmICFAaXNUYWJsZXRcblxuIyAgICAgICAgZCA9ICgod2luZG93LmlubmVyV2lkdGggKyAxNTUwKSAvIHdpbmRvdy5pbm5lcldpZHRoKSAqIDE4MFxuICAgICAgICBkID0gMzAwIC0gKCRlbC5kYXRhKCdjbG91ZCcpLnNwZWVkICogMjUwKVxuICAgICAgICBcbiAgICAgICAgVHdlZW5NYXgudG8gJGVsICwgZHVyICwgXG4gICAgICAgICAgICB4OiB3aWR0aFxuICAgICAgICAgICAgZGVsYXk6ZGVsYXlcbiAgICAgICAgICAgIGVhc2U6TGluZWFyLmVhc2VOb25lXG4gICAgICAgICAgICBvblVwZGF0ZVBhcmFtczogW1wie3NlbGZ9XCJdXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiAodHdlZW4pID0+XG4gICAgICAgICAgICAgICAgY2xvdWRzT25VcGRhdGUgJGVsICwgZFxuXG5cblxuc2V0UmVnaXN0cmF0aW9uID0gKCRlbCwgcmVnaXN0cmF0aW9uKSAtPlxuICAgIFxuICAgIHZhbHVlcyA9IHJlZ2lzdHJhdGlvbi5zcGxpdChcInxcIilcbiAgICBcbiAgICB2aWV3cG9ydFdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICBzZXR0aW5ncyA9IHt9XG4gICAgXG4gICAgYWxpZ24gPSB2YWx1ZXNbMF1cbiAgICBvZmZzZXQgPSBwYXJzZUludCh2YWx1ZXNbMV0pIG9yIDBcblxuICAgIHN3aXRjaCBhbGlnblxuICAgICAgICB3aGVuICdsZWZ0J1xuICAgICAgICAgICAgc2V0dGluZ3MueCA9IDAgKyBvZmZzZXRcbiAgICAgICAgd2hlbiAncmlnaHQnXG4gICAgICAgICAgICBzZXR0aW5ncy54ID0gdmlld3BvcnRXaWR0aCArIG9mZnNldCAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIHdoZW4gJ2NlbnRlcidcbiAgICAgICAgICAgIHNldHRpbmdzLnggPSAodmlld3BvcnRXaWR0aCouNSAtICRlbC53aWR0aCgpKi41KSArIG9mZnNldCAgICBcbiAgICBcbiAgICBUd2Vlbk1heC5zZXQgJGVsICwgc2V0dGluZ3NcbiAgICBcbiAgICBcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gKG9wdGlvbnMpIC0+XG4gICAgXG4gICAgJGVsID0gb3B0aW9ucy4kZWxcbiAgICAkY29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJ1tkYXRhLWNsb3VkLWNvbnRhaW5lcl0nKSAgICBcbiAgICBjb250YWluZXJUb3BQYWRkaW5nID0gcGFyc2VJbnQoJGNvbnRhaW5lci5jc3MoJ3BhZGRpbmctdG9wJykpXG4gICAgXG4gICAgXG4gICAgdHJ5ICAgICAgICBcbiAgICAgICAgY2xvdWREYXRhID0gJGVsLmRhdGEoKS5jbG91ZFxuICAgICAgIFxuICAgIGNhdGNoIGVcbiAgICAgICAgY29uc29sZS5lcnJvciBcIkNsb3VkIERhdGEgUGFyc2UgRXJyb3I6IEludmFsaWQgSlNPTlwiICAgICAgICBcbiAgICAgICAgXG4gICAgY2xvdWREZXB0aCA9ICRlbC5kYXRhKCdkZXB0aCcpXG4gICAgY2xvdWRTcGVlZCA9IGNsb3VkRGF0YS5zcGVlZCBvciAxXG4gICAgY2xvdWRPZmZzZXRNaW4gPSBwYXJzZUludChjbG91ZERhdGEub2Zmc2V0TWluKSBvciAwXG4gICAgY2xvdWRSZXZlcnNlID0gY2xvdWREYXRhLnJldmVyc2Ugb3IgZmFsc2VcbiAgICBjbG91ZFJlZ2lzdHJhdGlvbiA9IGNsb3VkRGF0YS5yZWdpc3RlciBvciBcImNlbnRlclwiXG5cblxuICAgIFxuICAgIHNldFJlZ2lzdHJhdGlvbiAkZWwgLCBjbG91ZFJlZ2lzdHJhdGlvblxuICAgIGlmICEoJGNvbnRhaW5lci5oYXNDbGFzcygnc3BsYXNoLWNvbnRhaW5lcicpKVxuICAgICAgICBvZmZMZWZ0ID0gJGVsLm9mZnNldCgpLmxlZnRcbiAgICAgICAgZGlzdGFuY2UgPSAod2luZG93LmlubmVyV2lkdGggLSBvZmZMZWZ0KSAvIHdpbmRvdy5pbm5lcldpZHRoXG4jICAgICAgICBwZXJjZW50YWdlID0gZGlzdGFuY2UgKiAxODAgXG4gICAgICAgIHBlcmNlbnRhZ2UgPSAyNTAgLSAoY2xvdWRTcGVlZCAqIDIwMClcbiAgICAgICAgXG4gICAgICAgIHNldEJvYmluZyAkZWwsIHBlcmNlbnRhZ2UsIGNsb3VkU3BlZWQvNVxuIFxuICAgIG1pblkgPSAkY29udGFpbmVyLm9mZnNldCgpLnRvcFxuICAgIG1heFkgPSAkKGRvY3VtZW50KS5vdXRlckhlaWdodCgpXG4gICAgdG90YWxSYW5nZT0gJGNvbnRhaW5lci5vdXRlckhlaWdodCgpXG4gICAgXG4gICAgXG4gICAgXG4gICAgcGVyY2VudGFnZVJhbmdlID0gdG90YWxSYW5nZS9tYXhZXG4gICAgbWluUmFuZ2VQZXJjZW50YWdlID0gbWluWS9tYXhZICAgIFxuICAgIG1heFJhbmdlUGVyY2VudGFnZSA9IG1pblJhbmdlUGVyY2VudGFnZSArIHBlcmNlbnRhZ2VSYW5nZVxuXG4jICAgIGNvbnNvbGUubG9nIG1pblJhbmdlUGVyY2VudGFnZSAsIG1heFJhbmdlUGVyY2VudGFnZVxuXG5cbiAgICBsYXN0U2Nyb2xsUGVyY2VudGFnZSA9IHByZXNlbnRTY3JvbGxQZXJjZW50YWdlID0gc2Nyb2xsRGVsdGEgPSAwXG5cbiAgICBpZiAoJGNvbnRhaW5lci5oYXNDbGFzcygnc3BsYXNoLWNvbnRhaW5lcicpICYmICQoJ2h0bWwnKS5oYXNDbGFzcygndGFibGV0JykpXG4gICAgICAgICRjb250YWluZXIuaGlkZSgpXG4gICAgICAgIFxuICAgIFxuICAgIHJldHVybiAocG9zKSAtPlxuICAgICAgICBpZiAoKCRjb250YWluZXIuaGFzQ2xhc3MoJ3NwbGFzaC1jb250YWluZXInKSkgJiYgKCQoJ2h0bWwnKS5oYXNDbGFzcygndGFibGV0JykpKVxuICAgICAgICAgICAgVHdlZW5NYXgudG8gJGVsICwgMC4yNSAsXG4gICAgICAgICAgICAgICAgZWFzZTpTaW5lLmVhc2VPdXRcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZSA9IChwb3MgLSBtaW5SYW5nZVBlcmNlbnRhZ2UpIC8gKG1heFJhbmdlUGVyY2VudGFnZSAtIG1pblJhbmdlUGVyY2VudGFnZSlcbiAgICAgICAgICAgIGlmIDAgPD0gY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2UgPD0gMVxuICAgICAgICAgICAgICAgIHByZXNlbnRTY3JvbGxQZXJjZW50YWdlID0gY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2VcbiAgICAgICAgICAgICAgICBpZiBjbG91ZFJldmVyc2UgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2UgPSAxIC0gY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjbG91ZFkgPSAodG90YWxSYW5nZSAqIGNsb3VkUG9zaXRpb25QZXJjZW50YWdlKSAqIGNsb3VkU3BlZWRcbiAgICAgICAgICAgICAgICBjbG91ZFkgPSBjbG91ZFkgLSBjb250YWluZXJUb3BQYWRkaW5nXG4gICAgICAgICAgICAgICAgY2xvdWRZID0gY2xvdWRZICsgY2xvdWRPZmZzZXRNaW5cbiAgICBcbiAgICAgICAgICAgICAgICAjTWF5YmUgdXNlIHRoaXM/XG4gICAgICAgICAgICAgICAgc2Nyb2xsRGVsdGEgPSBNYXRoLmFicyhsYXN0U2Nyb2xsUGVyY2VudGFnZSAtIHByZXNlbnRTY3JvbGxQZXJjZW50YWdlKSAqIDNcbiAgICBcbiAgICAgICAgICAgICAgICBsYXN0U2Nyb2xsUGVyY2VudGFnZSA9IHByZXNlbnRTY3JvbGxQZXJjZW50YWdlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvICRlbCAsIDAuMjUgLCBcbiAgICAgICAgICAgICAgICAgICAgeTpjbG91ZFlcbiAgICAgICAgICAgICAgICAgICAgZWFzZTpTaW5lLmVhc2VPdXRcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICBcbiIsIlxuXG4jQ291bnRcbmNvbW1hcyA9ICh4KSAtPlxuICB4LnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpXG5cblxubW9kdWxlLmV4cG9ydHMuY291bnQgPSAoZWwpIC0+XG4gICAgXG4gICAgXG4gICAgJGVsID0gJChlbClcbiAgICB0YXJnZXRWYWwgPSAkKGVsKS5odG1sKClcbiAgICBudW0gPSAkKGVsKS50ZXh0KCkuc3BsaXQoJywnKS5qb2luKCcnKVxuXG4gICAgc3RhcnQgPSBudW0gKiAuOTk5NVxuICAgIGNoYW5nZSA9IG51bSAqIC4wMDA1XG4gICAgXG4gICAgdGwgPSBuZXcgVGltZWxpbmVNYXhcbiAgICAgICAgb25TdGFydDogLT5cbiAgICAgICAgICAgICRlbC5odG1sKFwiNDJcIilcbiAgICAgICAgb25Db21wbGV0ZTogLT5cbiAgICAgICAgICAgICRlbC5odG1sKHRhcmdldFZhbClcbiAgICAgICAgICAgIFxuICAgIHR3ZWVucyA9IFtdXG5cbiAgICAgICAgXG5cbiAgICB0d2VlbnMucHVzaCBUd2Vlbk1heC5mcm9tVG8gJGVsICwgMC4yNSwgICAgICAgIFxuICAgICAgICBhdXRvQWxwaGE6MFxuICAgICAgICBpbW1lZGlhdGVSZW5kZXI6dHJ1ZVxuICAgICAgICBlYXNlOlF1aW50LmVhc2VPdXRcbiAgICAsXG4gICAgICAgIGF1dG9BbHBoYToxXG5cbiAgICB0d2VlbnMucHVzaCBUd2Vlbk1heC50byAkZWwgLCAxLjUsIFxuICAgICAgICBlYXNlOlF1aW50LmVhc2VPdXRcbiAgICAgICAgXG4gICAgICAgIG9uVXBkYXRlOiAtPlxuICAgICAgICAgICAgdmFsdWUgPSBwYXJzZUludChzdGFydCArIHBhcnNlSW50KGNoYW5nZSAqIEBwcm9ncmVzcygpKSlcbiAgICAgICAgICAgIHZhbHVlID0gY29tbWFzKHZhbHVlKVxuICAgICAgICAgICAgZWxzID0gdmFsdWUuc3BsaXQoJycpXG4gICAgICAgICAgICBodG1sID0gJydcbiAgICAgICAgICAgICQuZWFjaCBlbHMsIChuYW1lLCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBodG1sICs9IGlmICh2YWx1ZSBpcyAnLCcpIHRoZW4gJywnIGVsc2UgJzxzcGFuPicgKyB2YWx1ZSArICc8L3NwYW4+J1xuICAgICAgICAgICAgJGVsLmh0bWwoaHRtbClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgdGwuYWRkIHR3ZWVuc1xuICAgIFxuICAgIHRsXG5cbiNTY3JvbGxpbmdcblxuXG5cbnR3ZWVuUGFyYWxsYXggPSAocG9zLHR3ZWVuLG1pbixtYXgsZHVyKSAtPlxuXG5cblxuICAgIHBlcmNlbnQgPSAoKHBvcy1taW4pIC8gKG1heC1taW4pKSAqIDFcbiAgICBhbW91bnQgPSBwZXJjZW50ICogZHVyXG5cblxuXG4gICAgaWYgcG9zIDw9IG1heCBhbmQgcG9zID49IG1pblxuICAgICAgICAjY29uc29sZS5sb2cgcGVyY2VudCAsIHR3ZWVuLm5zLm5hbWUgLCBwb3NcbiAgICAgICAgaWYgTWF0aC5hYnMoYW1vdW50IC0gdHdlZW4udGltZSgpKSA+PSAuMDAxXG4gICAgICAgICAgICB0d2Vlbi50d2VlblRvICBhbW91bnQgLFxuICAgICAgICAgICAgICAgIG92ZXJ3cml0ZTpcInByZWV4aXN0aW5nXCIsXG4gICAgICAgICAgICAgICAgZWFzZTpRdWFkLmVhc2VPdXRcblxuXG5tb2R1bGUuZXhwb3J0cy5jbG91ZHMgPSAoc2V0SWQsIG1pbiwgbWF4LCBkdXIpIC0+XG5cbiAgICBtaW5Qb3MgPSBtaW5cbiAgICBtYXhQb3MgPSBtYXhcbiAgICBkdXJhdGlvbiA9IGR1clxuXG4gICAgJGVsID0gJChcIi5jbG91ZHMje3NldElkfVwiKVxuICAgIGNsb3VkcyA9ICRlbC5maW5kKFwiLmNsb3VkXCIpXG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuICAgIHR3ZWVuLm5zID0ge31cbiAgICB0d2Vlbi5ucy5uYW1lID0gc2V0SWRcblxuICAgIHR3ZWVucyA9IFtdXG4gICAgZm9yIGNsb3VkLGkgaW4gY2xvdWRzXG4gICAgICAgIG9mZnNldCA9IFwiKz0jezI1MCooaSsxKX1cIlxuXG5cbiAgICAgICAgdHdlZW5zLnB1c2ggVHdlZW5NYXgudG8gY2xvdWQgLCBkdXJhdGlvbiAsXG4gICAgICAgICAgICB5Om9mZnNldFxuXG5cblxuICAgIHR3ZWVuLmFkZCB0d2VlbnNcblxuXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICByZXR1cm4gKHBvcykgLT5cbiAgICAgICAgdHdlZW5QYXJhbGxheCBwb3MgLCB0d2VlbiAsIG1pblBvcywgbWF4UG9zLCBkdXJhdGlvblxuXG5tb2R1bGUuZXhwb3J0cy5zY3JvbGwgPSAobWluUG9zLCBtYXhQb3MsIGR1cmF0aW9uLCBlbGVtKSAtPlxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcbiAgICB0d2Vlbi5ucyA9IHt9XG4gICAgdHdlZW4ubnMubmFtZSA9IFwiLnNjcm9sbHRvXCJcbiAgICBcbiAgICB0d2VlbnMgPSBbXVxuICAgIHR3ZWVucy5wdXNoIFR3ZWVuTWF4LnRvIGVsZW0gLCBkdXJhdGlvbiAsIG9wYWNpdHk6MFxuICAgIFxuICAgIHR3ZWVuLmFkZCB0d2VlbnNcbiAgICBcbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICByZXR1cm4gKHBvcykgLT5cbiAgICAgICAgdHdlZW5QYXJhbGxheCBwb3MgLCB0d2VlbiAsIG1pblBvcywgbWF4UG9zLCBkdXJhdGlvblxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzLmFybXMgPSAobWluLCBtYXgsIGR1cikgLT5cblxuICAgIG1pblBvcyA9IG1pblxuICAgIG1heFBvcyA9IG1heFxuICAgIGR1cmF0aW9uID0gZHVyXG5cbiAgICBhcm0gPSAkKFwiLmFybXNcIilcblxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgdHdlZW4ubnMgPSB7fVxuICAgIHR3ZWVuLm5zLm5hbWUgPSBcIi5hcm1zXCJcblxuICAgIHR3ZWVucyA9IFtdXG4gICAgdHdlZW5zLnB1c2ggVHdlZW5NYXgudG8gYXJtICwgZHVyYXRpb24gLCB0b3A6MFxuXG5cblxuICAgIHR3ZWVuLmFkZCB0d2VlbnNcblxuXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICByZXR1cm4gKHBvcykgLT5cbiAgICAgICAgdHdlZW5QYXJhbGxheCBwb3MgLCB0d2VlbiAsIG1pblBvcywgbWF4UG9zLCBkdXJhdGlvblxuIiwiUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuXG5jbGFzcyBCYXNpY092ZXJsYXkgZXh0ZW5kcyBQbHVnaW5CYXNlXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgIyBAJGVsID0gJChlbClcbiAgICAgICAgQG92ZXJsYXlUcmlnZ2VycyA9ICQoJy5vdmVybGF5LXRyaWdnZXInKVxuICAgICAgICBAYWRkRXZlbnRzKClcblxuICAgICAgICBzdXBlcigpXG5cbiAgICBcbiAgICBhZGRFdmVudHM6IC0+XG5cbiAgICAgICAgJCgnI2Jhc2ljLW92ZXJsYXksICNvdmVybGF5LWJhc2ljLWlubmVyIC5vdmVybGF5LWNsb3NlJykuY2xpY2soQGNsb3NlT3ZlcmxheSk7XG4gICAgICAgIEBvdmVybGF5VHJpZ2dlcnMuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgJCh0KS5vbiAnY2xpY2snLCBAb3Blbk92ZXJsYXlcblxuICAgICAgICAjZ2xvYmFsIGJ1eSB0aWNrZXRzIGxpbmtzXG5cbiAgICAgICAgJCgnLm92ZXJsYXktY29udGVudCcpLm9uICdjbGljaycsICdsaScgLEBvcGVuTGlua1xuIyAgICAgICAgJCh3aW5kb3cpLm9uICdyZXNpemUnLCBAY2xvc2VPdmVybGF5XG4gICAgICAgIFxuICAgIG9wZW5MaW5rOiAoZSkgPT5cbiAgICAgICAgdGFyZ2V0ID0gJChlLnRhcmdldCkucGFyZW50cyAnLnBhcmsnXG4gICAgICAgIGlmIHRhcmdldC5kYXRhKCd0YXJnZXQnKVxuICAgICAgICAgICAgd2luZG93Lm9wZW4odGFyZ2V0LmRhdGEoJ3RhcmdldCcpKVxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgXG4gICAgY2xvc2VPdmVybGF5OiAoZSkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICEgKChlLnR5cGUgaXMgJ3Jlc2l6ZScpIGFuZCAoJCgnI292ZXJsYXkgdmlkZW86dmlzaWJsZScpLnNpemUoKSA+IDApKVxuICAgICAgICAgICAgJCgnLm92ZXJsYXktYmFzaWMnKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICB9LCAoKSAtPiBcbiAgICAgICAgICAgICAgICAkKCcub3ZlcmxheS1iYXNpYycpLmhpZGUoKVxuICAgICAgICAgICAgICAgICQoJyNvdmVybGF5JykuaGlkZSgpXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvcGVuT3ZlcmxheTogKHQpIC0+XG4gICAgICAgICRlbCA9ICQodGhpcylcbiAgICAgICAgb3ZlcmxheVNvdXJjZSA9ICRlbC5kYXRhKCdzb3VyY2UnKVxuICAgICAgICAkdGFyZ2V0RWxlbWVudCA9ICQoJyNvdmVybGF5LWJhc2ljLWlubmVyIC5vdmVybGF5LWNvbnRlbnQnKVxuICAgICAgICBpc05ld3MgPSAkZWwuaGFzQ2xhc3MoJ25ld3MnKVxuXG4gICAgICAgICQoJyNvdmVybGF5Jykuc2hvdygpXG4gICAgICAgIFxuICAgICAgICBpZiAkZWwuaGFzQ2xhc3MgJ29mZmVyaW5ncy1vcHRpb24nXG4gICAgICAgICAgICBvYyA9ICQoJyNvZmZlcmluZ3Mtb3ZlcmxheS1jb250ZW50JylcbiAgICAgICAgICAgIG9jLmZpbmQoJ2gxLnRpdGxlJykudGV4dCgkZWwuZmluZCgnc3Bhbi5vZmZlcicpLnRleHQoKSlcbiAgICAgICAgICAgIG9jLmZpbmQoJ2Rpdi5kZXNjcmlwdGlvbicpLmh0bWwoJGVsLmZpbmQoJ2Rpdi5kZXNjcmlwdGlvbicpLmh0bWwoKSlcbiAgICAgICAgICAgIG9jLmZpbmQoJy5jb250ZW50Lm1lZGlhJykuY3NzKHtiYWNrZ3JvdW5kSW1hZ2U6IFwidXJsKCdcIiArICRlbC5maW5kKCdzcGFuLm1lZGlhJykuZGF0YSgnc291cmNlJykgKyBcIicpXCJ9KVxuXG4gICAgICAgIFxuICAgICAgICBpZiAoJCgnIycgKyBvdmVybGF5U291cmNlKS5zaXplKCkgaXMgMSkgXG4gICAgICAgICAgICAjaHRtbCA9ICQoJyMnICsgb3ZlcmxheVNvdXJjZSkuaHRtbCgpXG5cbiAgICAgICAgICAgICR0YXJnZXRFbGVtZW50LmNoaWxkcmVuKCkuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgICAgICQodCkuYXBwZW5kVG8oJyNvdmVybGF5LWNvbnRlbnQtc291cmNlcycpXG5cbiAgICAgICAgICAgIGlmIGlzTmV3c1xuICAgICAgICAgICAgICAgIGMgPSAkZWwubmV4dCgnLmFydGljbGUnKS5jbG9uZSgpXG4gICAgICAgICAgICAgICAgJCgnI292ZXJsYXlfY29udGVudCcpLmh0bWwoYy5odG1sKCkpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcjJyArIG92ZXJsYXlTb3VyY2UpLmFwcGVuZFRvKCR0YXJnZXRFbGVtZW50KVxuXG4gICAgICAgICAgICAkZWwgPSAkKCcjb3ZlcmxheS1iYXNpYy1pbm5lcicpXG4gICAgICAgICAgICBpc1NtYWxsID0gJGVsLmhlaWdodCgpIDwgJCh3aW5kb3cpLmhlaWdodCgpIGFuZCAkKCR0YXJnZXRFbGVtZW50KS5maW5kKCcuc2VsZWN0LWJveC13cmFwcGVyJykuc2l6ZSgpIGlzIDBcbiAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKVxuICAgICAgICAgICAgYWRkdG9wID0gaWYgaXNTbWFsbCB0aGVuIDAgZWxzZSBzY3JvbGxUb3A7XG4gICAgICAgICAgICBwb3NpdGlvbiA9ICRlbC5jc3MgJ3Bvc2l0aW9uJywgaWYgaXNTbWFsbCB0aGVuICdmaXhlZCcgZWxzZSAnYWJzb2x1dGUnXG4gICAgICAgICAgICB0b3AgPSBNYXRoLm1heCgwLCAoKCQod2luZG93KS5oZWlnaHQoKSAtICRlbC5vdXRlckhlaWdodCgpKSAvIDIpICsgYWRkdG9wKVxuICAgICAgICAgICAgaWYgIWlzU21hbGwgYW5kICh0b3AgPCBzY3JvbGxUb3ApIHRoZW4gdG9wID0gc2Nyb2xsVG9wXG4gICAgICAgICAgICAkZWwuY3NzKFwidG9wXCIsIHRvcCArIFwicHhcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgaGVpZ2h0OlxuICAgICAgICAgICAgIyRlbC5jc3MoXCJsZWZ0XCIsIE1hdGgubWF4KDAsICgoJCh3aW5kb3cpLndpZHRoKCkgLSAkZWwub3V0ZXJXaWR0aCgpKSAvIDIpICsgYWRkbGVmdCkgKyBcInB4XCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcub3ZlcmxheS1iYXNpYycpLmNzcygnb3BhY2l0eScsIDApLmRlbGF5KDApLnNob3coKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgICAgICB9KVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzaWNPdmVybGF5XG5cblxuXG5cblxuXG4iLCJcblBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblZpZXdCYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvVmlld0Jhc2UuY29mZmVlJ1xuXG5jbGFzcyBEcmFnZ2FibGVHYWxsZXJ5IGV4dGVuZHMgUGx1Z2luQmFzZVxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cblxuICAgICAgICBAZ2FsbGVyeSA9IEAkZWwuZmluZCBcIi5zd2lwZXItY29udGFpbmVyXCJcblxuICAgICAgICBpZihAZ2FsbGVyeS5sZW5ndGggPCAxKVxuICAgICAgICAgICAgQGdhbGxlcnkgPSBAJGVsLmZpbHRlciBcIi5zd2lwZXItY29udGFpbmVyXCJcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBvcHRzLnBhZ2UgPT0gJ2pvYnMnXG4gICAgICAgICAgICBAam9ic1BhZ2UgPSB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBqb2JzUGFnZSA9IGZhbHNlXG5cbiAgICAgICAgQGdhbGxlcnlDcmVhdGVkID0gZmFsc2VcbiAgICAgICAgQGdhbGxlcnlDb250YWluZXIgPSBAZ2FsbGVyeS5maW5kKCd1bCcpXG4gICAgICAgIEBnYWxsZXJ5SXRlbXMgPSBAZ2FsbGVyeUNvbnRhaW5lci5maW5kKCdsaScpXG4gICAgICAgIEBjdXJyZW50SW5kZXggPSBAZ2FsbGVyeUl0ZW1zLmZpbHRlcignLnNlbGVjdGVkJykuZGF0YSgnaW5kZXgnKVxuICAgICAgICBAYWNyb3NzID0gb3B0cy5hY3Jvc3Mgb3IgMVxuICAgICAgICBAYW5nbGVMZWZ0ID0gQGdhbGxlcnkuZmluZCAnLmZhLWFuZ2xlLWxlZnQnXG4gICAgICAgIEBhbmdsZVJpZ2h0ID0gQGdhbGxlcnkuZmluZCAnLmZhLWFuZ2xlLXJpZ2h0J1xuICAgICAgICBAcGFnaW5hdGlvbiA9IG9wdHMucGFnaW5hdGlvbiBvciBmYWxzZVxuICAgICAgICBAY29udHJvbHMgPSBvcHRzLmNvbnRyb2wgb3IgbnVsbFxuICAgICAgICBAam9ic0Nhcm91c2VsU3RvcHBlZCA9IGZhbHNlXG4gICAgICAgIEBqb2JzQ2Fyb3VzZWxQYXVzZWQgPSBmYWxzZVxuICAgICAgICBAam9ic0ludGVydmFsID0gbnVsbFxuXG4gICAgICAgIEBzaXplQ29udGFpbmVyKClcblxuICAgICAgICBAYWRkQXJyb3dzKClcblxuICAgICAgICBzdXBlcigpXG5cbiAgICBhZGRFdmVudHM6IC0+XG4gICAgICAgICQod2luZG93KS5vbiAncmVzaXplJyAsIEBzaXplQ29udGFpbmVyXG5cbiAgICAgICAgJChAJGVsKS5vbiAnY2xpY2snLCAnLmZhLWFuZ2xlLWxlZnQnLCBAcHJldlNsaWRlXG4gICAgICAgICQoQCRlbCkub24gJ2NsaWNrJywgJy5mYS1hbmdsZS1yaWdodCcsIEBuZXh0U2xpZGVcbiAgICAgICAgaWYgQGpvYnNQYWdlID09IHRydWVcbiAgICAgICAgICAgICQoQCRlbCkub24gJ2NsaWNrJywgJy5zd2lwZXItY29udGFpbmVyJywgQHN0b3BKb2JzQ2Fyb3VzZWxcbiAgICAgICAgICAgICQoQCRlbCkub24gJ21vdXNlb3ZlcicsICcuc3dpcGVyLWNvbnRhaW5lcicsIEBwYXVzZUpvYnNDYXJvdXNlbFxuICAgICAgICAgICAgJChAJGVsKS5vbiAnbW91c2VsZWF2ZScsICcuc3dpcGVyLWNvbnRhaW5lcicsIEByZXN1bWVKb2JzQ2Fyb3VzZWxcbiAgICAgICAgICAgIFxuICAgICAgICBcbiAgICBzdG9wSm9ic0Nhcm91c2VsOiA9PlxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAam9ic0ludGVydmFsKVxuICAgICAgICBAam9ic0Nhcm91c2VsU3RvcHBlZCA9IHRydWVcblxuICAgIHBhdXNlSm9ic0Nhcm91c2VsOiA9PlxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAam9ic0ludGVydmFsKVxuICAgICAgICBAam9ic0Nhcm91c2VsUGF1c2VkID0gdHJ1ZVxuXG4gICAgcmVzdW1lSm9ic0Nhcm91c2VsOiA9PlxuICAgICAgICBpZiBAam9ic0Nhcm91c2VsU3RvcHBlZCA9PSBmYWxzZVxuICAgICAgICAgICAgQGpvYnNJbnRlcnZhbCA9IHNldEludGVydmFsICgtPlxuICAgICAgICAgICAgICAgICQoJyNqb2JzLWdhbGxlcnkgLmZhLWFuZ2xlLXJpZ2h0JykudHJpZ2dlcignY2xpY2snKVxuICAgICAgICAgICAgKSwgODAwMFxuICAgICAgICAgICAgQGpvYnNDYXJvdXNlbFBhdXNlZCA9IGZhbHNlXG5cbiAgICBwcmV2U2xpZGU6IChlKSA9PlxuICAgICAgICB0aGF0ID0gQG15U3dpcGVyXG4gICAgICAgIGdhbCA9IEBnYWxsZXJ5XG4gICAgICAgIFxuICAgICAgICBUd2Vlbk1heC50bygkKGdhbCksIC4yLCBcbiAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICAgIHNjYWxlOiAxLjFcbiAgICAgICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICAgICAgdGhhdC5zd2lwZVByZXYoKVxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnNldCgkKGdhbCksXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlOiAxXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvKCQoZ2FsKSwgLjM1LCBcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgICAgICAgICAgICBkZWxheTogLjM1XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICApXG4gICAgXG4gICAgbmV4dFNsaWRlOiAoZSkgPT5cbiAgICAgICAgdGhhdCA9IEBteVN3aXBlclxuICAgICAgICBnYWwgPSBAZ2FsbGVyeVxuXG4gICAgICAgIFR3ZWVuTWF4LnRvKCQoZ2FsKSwgLjIsXG4gICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICBzY2FsZTogMS4xXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgICAgIHRoYXQuc3dpcGVOZXh0KClcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC5zZXQoJChnYWwpLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogMC44NVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC50bygkKGdhbCksIC4zNSxcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogMVxuICAgICAgICAgICAgICAgICAgICBkZWxheTogLjM1XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICApXG5cblxuICAgIGFkZEFycm93czogLT5cbiAgICAgICAgQGlzUGhvbmUgPSAkKFwiaHRtbFwiKS5oYXNDbGFzcyhcInBob25lXCIpXG5cbiAgICAgICAgYXJyb3dMZWZ0ID0gJChcIjxpIGNsYXNzPSdnYWwtYXJyb3cgZmEgZmEtYW5nbGUtbGVmdCc+PC9pPlwiKVxuICAgICAgICBhcnJvd1JpZ2h0ID0gJChcIjxpIGNsYXNzPSdnYWwtYXJyb3cgZmEgZmEtYW5nbGUtcmlnaHQnPjwvaT5cIilcblxuICAgICAgICBAJGVsLmFwcGVuZChhcnJvd0xlZnQsIGFycm93UmlnaHQpXG5cbiAgICAgICAgJCgnLmdhbC1hcnJvdycpLm9uICdjbGljaycsIC0+XG4gICAgICAgICAgICAkKEApLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICB0aGF0ID0gJChAKVxuICAgICAgICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICAgICAgICAgICQodGhhdCkucmVtb3ZlQ2xhc3MgJ2FjdGl2ZScsIDEwMFxuICAgICAgICAgICAgXG5cbiAgICBzaXplQ29udGFpbmVyOiAoKSA9PlxuICAgICAgICBAZ2FsbGVyeUNvbnRhaW5lci5jc3MoJ3dpZHRoJywgXCIxMDAlXCIpXG4gICAgICAgIGlmIEBhY3Jvc3MgPCAyXG4gICAgICAgICAgICBAZ2FsbGVyeUl0ZW1zLmNzcygnd2lkdGgnICwgXCIxMDAlXCIpXG4gICAgICAgIGVsc2UgaWYgQGFjcm9zcyA8IDNcbiAgICAgICAgICAgIEBnYWxsZXJ5SXRlbXMuY3NzKCd3aWR0aCcgLCBcIjUwJVwiKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZ2FsbGVyeUl0ZW1zLmNzcygnd2lkdGgnICwgXCIzMy4zMzMzMzMlXCIpXG5cbiAgICAgICAgQGl0ZW1XaWR0aCA9IEBnYWxsZXJ5SXRlbXMuZmlyc3QoKS5vdXRlcldpZHRoKClcbiAgICAgICAgaXRlbUxlbmd0aCA9IEBnYWxsZXJ5SXRlbXMubGVuZ3RoXG5cbiAgICAgICAgQGdhbGxlcnlJdGVtcy5jc3MoJ3dpZHRoJywgQGl0ZW1XaWR0aClcbiAgICAgICAgQGdhbGxlcnlDb250YWluZXIuY3NzKCd3aWR0aCcsIGl0ZW1MZW5ndGggKiAoQGl0ZW1XaWR0aCkpXG4gICAgICAgIFR3ZWVuTWF4LnNldCBAZ2FsbGVyeUNvbnRhaW5lciAsXG4gICAgICAgICAgICB4OiAtQGN1cnJlbnRJbmRleCAqIEBpdGVtV2lkdGhcbiAgICAgICAgXG4gICAgICAgIGlmICFAZ2FsbGVyeUNyZWF0ZWQgICAgXG4gICAgICAgICAgICBAY3JlYXRlRHJhZ2dhYmxlKClcbiMgICAgICAgICAgICBAbXlTd2lwZXIuc3dpcGVOZXh0KClcbiAgICAgICAgXG4gICAgY3JlYXRlRHJhZ2dhYmxlOiAoKSAtPlxuICAgICAgICBpdGVtTGVuZ3RoID0gQGdhbGxlcnlJdGVtcy5sZW5ndGhcblxuICAgICAgICBpZiBAc2Nyb2xsIHRoZW4gQHNjcm9sbC5raWxsKClcblxuICAgICAgICBpZCA9ICQoQC4kZWwpLmF0dHIgJ2lkJ1xuXG5cbiAgICAgICAgaWYgQHBhZ2luYXRpb25cbiAgICAgICAgICAgIEBhZGRQYWdpbmF0aW9uKClcblxuICAgICAgICBpZiBAYWNyb3NzIDwgM1xuICAgICAgICAgICAgaWYgQHBhZ2luYXRpb25cbiAgICAgICAgICAgICAgICBAbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcjJyArIGlkICsgJyAuc3dpcGVyLWNvbnRhaW5lcicse1xuICAgICAgICAgICAgICAgICAgICBsb29wOnRydWUsXG4gICAgICAgICAgICAgICAgICAgIGdyYWJDdXJzb3I6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IEBhY3Jvc3MsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb246ICcjJyArIGlkICsgJyAuc3dpcGVyLXBhZ2luYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQXNSYW5nZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblRvdWNoRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZVN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyR3JvdXA6IEBhY3Jvc3NcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBteVN3aXBlciA9IG5ldyBTd2lwZXIoJyMnICsgaWQgKyAnIC5zd2lwZXItY29udGFpbmVyJyx7XG4gICAgICAgICAgICAgICAgICAgIGxvb3A6dHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZ3JhYkN1cnNvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogQGFjcm9zcyxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyR3JvdXA6IEBhY3Jvc3NcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblRvdWNoRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZVN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBteVN3aXBlciA9IG5ldyBTd2lwZXIoJyMnICsgaWQgKyAnIC5zd2lwZXItY29udGFpbmVyJyx7XG4gICAgICAgICAgICAgICAgbG9vcDp0cnVlLFxuICAgICAgICAgICAgICAgIGdyYWJDdXJzb3I6IHRydWUsXG4gICAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcbiAgICAgICAgICAgICAgICBzbGlkZXNQZXJHcm91cDogM1xuICAgICAgICAgICAgICAgIG9uVG91Y2hTdGFydDogQG9uU2xpZGVDaGFuZ2VTdGFydCxcbiAgICAgICAgICAgICAgICBvblRvdWNoRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlU3RhcnQ6IEBvblNsaWRlQ2hhbmdlU3RhcnQsXG4gICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZUVuZDogQG9uU2xpZGVDaGFuZ2VFbmQsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgIEBnYWxsZXJ5Q3JlYXRlZCA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIGlmIEBqb2JzUGFnZSA9PSB0cnVlXG4gICAgICAgICAgICBAam9ic0ludGVydmFsID0gc2V0SW50ZXJ2YWwgKC0+XG4gICAgICAgICAgICAgICAgJCgnI2pvYnMtZ2FsbGVyeSAuZmEtYW5nbGUtcmlnaHQnKS50cmlnZ2VyKCdjbGljaycpXG4gICAgICAgICAgICApLCA4MDAwXG5cbiAgICAgICAgXG4gICAgb25TbGlkZUNoYW5nZVN0YXJ0OiA9PlxuICAgICAgICAkKEAuJGVsKS5jbG9zZXN0KCcuYWRkLWJvcmRlci1mYWRlJykuYWRkQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICQoQC4kZWwpLmZpbmQoJy5hZGQtYm9yZGVyLWZhZGUnKS5hZGRDbGFzcyAnc2hvd2luZydcblxuICAgIG9uU2xpZGVDaGFuZ2VFbmQ6ID0+XG4gICAgICAgICQoQC4kZWwpLmNsb3Nlc3QoJy5hZGQtYm9yZGVyLWZhZGUnKS5yZW1vdmVDbGFzcyAnc2hvd2luZydcbiAgICAgICAgJChALiRlbCkuZmluZCgnLmFkZC1ib3JkZXItZmFkZScpLnJlbW92ZUNsYXNzICdzaG93aW5nJ1xuICAgICAgICBcbiAgICAgICAgaWYgIShAY29udHJvbHMgPT0gbnVsbClcbiAgICAgICAgICAgIHBhcmsgPSBAbXlTd2lwZXIuYWN0aXZlU2xpZGUoKS5kYXRhKCdpZCcpXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuc3dpcGVyLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuY2Fyb3VzZWwtd3JhcHBlcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSBkaXYjJyArIHBhcmspLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSBkaXYjJyArIHBhcmspLnBhcmVudCgpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgKEBwYXJrTGlzdClcbiAgICAgICAgICAgIEBwYXJrTGlzdC5zZWxlY3RMb2dvICQoQC4kZWwpLmZpbmQoJy5zd2lwZXItc2xpZGUtYWN0aXZlJykuZGF0YSgnaWQnKTtcblxuICAgIGFkZFBhZ2luYXRpb246ID0+XG4gICAgICAgIHdyYXBwZXIgPSAkKFwiPGRpdiBjbGFzcz0nc3dpcGVyLXBhZ2luYXRpb24nPjwvZGl2PlwiKVxuICAgICAgICAkKEAuJGVsKS5maW5kKCcuc3dpcGVyLWNvbnRhaW5lcicpLmFkZENsYXNzKCdhZGRQYWdpbmF0aW9uJykuYXBwZW5kKHdyYXBwZXIpXG5cblxuICAgIGdvdG86IChpZCwgaW5pdFZhbCkgLT5cblxuICAgICAgICBpZiBub3QgaW5pdFZhbCB0aGVuICQoJ2JvZHknKS5hbmltYXRlIHsgc2Nyb2xsVG9wOiAkKCcjJyArICgkKEAkZWwpLmF0dHIoJ2lkJykpKS5vZmZzZXQoKS50b3AgfVxuXG4gICAgICAgIHRvSW5kZXggPSAkKFwibGkucGFya1tkYXRhLWlkPScje2lkfSddXCIpLmRhdGEoJ2luZGV4JylcblxuICAgICAgICB0bCA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgICAgIHRsLmFkZCBUd2Vlbk1heC50byBAZ2FsbGVyeUNvbnRhaW5lciAsIC40LFxuICAgICAgICAgICAgYXV0b0FscGhhOjBcblxuICAgICAgICB0bC5hZGRDYWxsYmFjayA9PlxuICAgICAgICAgICAgQG15U3dpcGVyLnN3aXBlVG8odG9JbmRleCwgMClcblxuICAgICAgICB0bC5hZGQgVHdlZW5NYXgudG8gQGdhbGxlcnlDb250YWluZXIgLCAuNCxcbiAgICAgICAgICAgIGF1dG9BbHBoYToxXG5cbiAgICAgICAgQGN1cnJlbnRJbmRleCA9IHRvSW5kZXhcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdnYWJsZUdhbGxlcnlcblxuIiwiXG5QbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5WaWRlb092ZXJsYXkgPSByZXF1aXJlICcuL1ZpZGVvT3ZlcmxheS5jb2ZmZWUnXG5cbmNsYXNzIEZhZGVHYWxsZXJ5IGV4dGVuZHMgUGx1Z2luQmFzZVxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nICdpbml0aWFsaXplOiAnLCBvcHRzXG5cbiAgICAgICAgQHBhZ2UgPSBvcHRzLnBhZ2Ugb3IgbnVsbFxuICAgICAgICB0YXJnZXQgPSBvcHRzLnRhcmdldCBvciBudWxsXG4gICAgICAgIFxuICAgICAgICBpZiAodGFyZ2V0PylcbiAgICAgICAgICAgIEAkdGFyZ2V0ID0gJCh0YXJnZXQpXG4gICAgICAgIFxuICAgICAgICBpZiAhKEBwYWdlID09IG51bGwpXG4gICAgICAgICAgICBAaW5mb0JveGVzID0gQCRlbC5maW5kIFwibGkudmlkZW9cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAaW5mb0JveGVzID0gQCRlbC5maW5kIFwibGlcIlxuICAgICAgICAgICAgXG4gICAgICAgIEBjdXJyZW50U2VsZWN0ZWQgPSBAaW5mb0JveGVzLmZpbHRlcihcIjpmaXJzdC1jaGlsZFwiKVxuXG4gICAgICAgIHN1cGVyKClcbiAgICBcbiAgICBhZGRFdmVudHM6IC0+ICBcblxuICAgICAgICBAaW5mb0JveGVzLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgICRidG4gPSAkKHQpLmZpbmQoJy52aWRlby1idXR0b24nKVxuXG4gICAgICAgICAgICBpZiAkYnRuLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICB2aWRlb0V2ZW50cyA9IG5ldyBIYW1tZXIoJGJ0blswXSlcbiAgICAgICAgICAgICAgICB2aWRlb0V2ZW50cy5vbiAndGFwJyAsIEBoYW5kbGVWaWRlb0ludGVyYWN0aW9uXG5cblxuXG5cbiAgICBoYW5kbGVWaWRlb0ludGVyYWN0aW9uOiAoZSkgPT5cblxuICAgICAgICAkdGFyZ2V0ID0gJChlLnRhcmdldCkuY2xvc2VzdChcIi52aWRlby1idXR0b25cIilcbiAgICAgICAgaWYgKCR0YXJnZXQuc2l6ZSgpIGlzIDApIFxuICAgICAgICAgICAgJHRhcmdldCA9IGUudGFyZ2V0XG4gICAgICAgIFxuICAgICAgICBpZiAkdGFyZ2V0LmRhdGEoJ3R5cGUnKSA9PSAnaW1hZ2UnXG4gICAgICAgICAgICBpZiAoJHRhcmdldC5kYXRhKCdmdWxsJykpXG4gICAgICAgICAgICAgICAgQGltYWdlU3JjID0gJHRhcmdldC5kYXRhKCdmdWxsJylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAaW1hZ2VTcmMgPSAkdGFyZ2V0LmNoaWxkcmVuKCdpbWcnKS5hdHRyKCdzcmMnKVxuICAgICAgICBkYXRhID1cbiAgICAgICAgICAgIG1wNDokdGFyZ2V0LmRhdGEoJ21wNCcpXG4gICAgICAgICAgICB3ZWJtOiR0YXJnZXQuZGF0YSgnd2VibScpXG4gICAgICAgICAgICBwb3N0ZXI6QGltYWdlU3JjXG5cbiAgICAgICAgVmlkZW9PdmVybGF5LmluaXRWaWRlb092ZXJsYXkgZGF0YVxuXG5cbiAgICBnb3RvOiAoaWQsIGluaXRWYWwpIC0+XG4gICAgICAgIGluZm9JZCA9IFwiIyN7aWR9LWluZm9cIlxuXG4gICAgICAgIGlmICEoQHBhZ2UgPT0gbnVsbClcbiAgICAgICAgICAgIHRhcmdldCA9IEBpbmZvQm94ZXMucGFyZW50cygnbGkuZ3JvdXAtaW5mbycpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRhcmdldCA9IEBpbmZvQm94ZXNcbiAgICAgICAgXG5cbiAgICAgICAgI1N3aXRjaCBJbmZvIEJveGVzXG4gICAgICAgIHRsID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgICAgIHRsLmFkZCBUd2Vlbk1heC50byB0YXJnZXQgLCAuNCAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MFxuICAgICAgICAgICAgb3ZlcndyaXRlOlwiYWxsXCJcbiAgICAgICAgdGwuYWRkIFR3ZWVuTWF4LnRvIHRhcmdldC5maWx0ZXIoaW5mb0lkKSAsIC40ICxcbiAgICAgICAgICAgIGF1dG9BbHBoYToxXG5cblxuICAgICAgICBpZiAoQCR0YXJnZXQ/KVxuICAgICAgICAgICAgY29uc29sZS5sb2cgQCR0YXJnZXRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9wID0gQCR0YXJnZXQub2Zmc2V0KCkudG9wIC0gKCQoJ2hlYWRlcicpLmhlaWdodCgpKVxuICAgICAgICAgICAgY29uc29sZS5sb2cgdG9wXG4gICAgICAgICAgICBwb3MgPSAkKCdib2R5Jykuc2Nyb2xsVG9wKClcbiAgICAgICAgICAgIGlmIChwb3MgPCB0b3ApXG4gICAgICAgICAgICAgICAgJCgnYm9keScpLmFuaW1hdGUgeyBzY3JvbGxUb3A6IHRvcCB9XG4gIFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhZGVHYWxsZXJ5XG5cbiIsImdsb2JhbHMgPSByZXF1aXJlICcuLi9nbG9iYWwvaW5kZXguY29mZmVlJ1xuUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuXG5jbGFzcyBIZWFkZXJBbmltYXRpb24gZXh0ZW5kcyBQbHVnaW5CYXNlXG5cbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gIFxuICAgICAgICBAYm9keSA9ICQoXCJib2R5XCIpXG4gICAgICAgIEBodG1sID0gJChcImh0bWxcIilcbiAgICAgICAgQGNvbnRlbnQgPSAkKFwiI2NvbnRlbnRcIilcbiAgICAgICAgQG1vYm5hdiA9ICQoXCIjbW9iaWxlLWhlYWRlci1uYXZcIilcbiAgICAgICAgQHN1Ym5hdiA9ICQoXCIuc3VibmF2XCIpXG4gICAgICAgIEBzdWJuYXZTaG93aW5nID0gZmFsc2VcbiAgICAgICAgQG91clBhcmtzTGVmdCA9ICQoJy5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cIm91ci1wYXJrc1wiXScpLm9mZnNldCgpLmxlZnRcbiAgICAgICAgQHBhcnRuZXJzaGlwTGVmdCA9ICQoJy5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cInBhcnRuZXJzaGlwc1wiXScpLm9mZnNldCgpLmxlZnRcbiAgICAgICAgXG5cbiAgICAgICAgc3VwZXIob3B0cykgIFxuXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBzdXBlcigpICAgIFxuICAgICAgICBAc2hvd0luaXRpYWxTdWJOYXYoKSAgICAgICAgXG5cbiAgICBhZGRFdmVudHM6IC0+XG4gICAgICAgIGlmICEkKCdodG1sJykuaGFzQ2xhc3MgJ3RhYmxldCdcbiAgICAgICAgICAgICQoJy5uYXYtbGlzdCBhIGxpJykub24gJ21vdXNlZW50ZXInLCBAaGFuZGxlTmF2SG92ZXJcbiAgICAgICAgICAgICQoJ2hlYWRlcicpLm9uICdtb3VzZWxlYXZlJywgQGhpZGVTdWJOYXZcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5vbnJlc2l6ZSA9IEBoYW5kbGVSZXNpemVcbiAgICAgICAgQGJvZHkuZmluZChcIiNuYXZiYXItbWVudVwiKS5vbiAnY2xpY2snLCBAdG9nZ2xlTmF2XG4gICAgICAgICQoJyNtb2JpbGUtaGVhZGVyLW5hdiBhJykub24gJ2NsaWNrJywgQHNob3dNb2JpbGVTdWJOYXZcbiAgICAgICAgJCgnI21vYmlsZS1oZWFkZXItbmF2IGknKS5vbiAnY2xpY2snLCBAaGFuZGxlQXJyb3dDbGlja1xuICAgICAgICBcbiAgICAgICAgQGJvZHkuZmluZCgnLnRvZ2dsZS1uYXYnKS5vbiAnY2xpY2snLCAoKSAtPlxuICAgICAgICAgICAgJChAKS5wYXJlbnRzKCdoZWFkZXInKS5maW5kKCcjbmF2YmFyLW1lbnUgaW1nJykudHJpZ2dlcignY2xpY2snKVxuICAgICAgICAgICAgXG4gICAgICAgICQoJyNtb2JpbGUtaGVhZGVyLW5hdicpLm9uICdjbGljaycsICcubW9iaWxlLXN1Yi1uYXYgbGknLCBAb25DbGlja01vYmlsZVN1Yk5hdkxpbmtcbiAgICAgICAgXG4gICAgXG4gICAgaGFuZGxlU3ViTmF2OiA9PlxuICAgICAgICBzdGFydFBhZ2UgPSAkKCcuc3VibmF2JykuZGF0YSAncGFnZSdcbiAgICAgICAgaWQgPSAkKCcubmF2LWxpc3QgYVtkYXRhLXBhZ2Utc2hvcnQ9XCInICsgc3RhcnRQYWdlICsgJ1wiXScpLmRhdGEgJ3BhZ2UnXG4gICAgICAgIEBzaG93U3ViTmF2TGlua3MoaWQpXG4gICAgICAgIFxuICAgIHNob3dJbml0aWFsU3ViTmF2OiA9PlxuICAgICAgICBzZWN0aW9uID0gJCgnLnN1Ym5hdicpLmRhdGEgJ3BhZ2UnXG4gICAgICAgIFxuICAgICAgICBpZiBzZWN0aW9uID09ICdvZmZlcmluZ3MnIHx8IHNlY3Rpb24gPT0gJ2FjY29tbW9kYXRpb25zJyB8fCBzZWN0aW9uID09ICdvdXJwYXJrcydcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MoJ291ci1wYXJrcycpXG4gICAgICAgIGVsc2UgaWYgc2VjdGlvbiA9PSAncGFydG5lcnNoaXAtZGV0YWlscycgfHwgc2VjdGlvbiA9PSAncGFydG5lcnNoaXAnXG4gICAgICAgICAgICBAc2hvd1N1Yk5hdkxpbmtzKCdwYXJ0bmVyc2hpcHMnKVxuICAgICAgICBcbiAgICB0b2dnbGVOYXY6IChlKSA9PlxuICAgICAgICAgICAgICAgIFxuICAgIGhhbmRsZVJlc2l6ZTogPT5cbiAgICAgICAgQGhhbmRsZVN1Yk5hdigpXG4gICAgICAgIEBhZGp1c3RNb2JpbGVOYXYoKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgcG9zaXRpb25TdWJOYXZMaXN0czogPT5cbiAgICAgICAgI2NvbnNvbGUubG9nICdwb3NpdGlvblN1Yk5hdkxpc3RzJ1xuIyAgICAgICAgb3VyUGFya3NMZWZ0ID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwib3VyLXBhcmtzXCJdJykub2Zmc2V0KCkubGVmdFxuIyAgICAgICAgcGFydG5lcnNoaXBMZWZ0ID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwicGFydG5lcnNoaXBzXCJdJykub2Zmc2V0KCkubGVmdCAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgJCgnI2hlYWRlci10b3AnKS5oYXNDbGFzcyAnc21hbGwnXG4gICAgICAgICAgICBpZiB3aW5kb3cuaW5uZXJXaWR0aCA8IDk5M1xuICAgICAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAb3VyUGFya3NMZWZ0IC0gOTApXG4gICAgICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBwYXJ0bmVyc2hpcExlZnQgLSAxMzMpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgJCgnI291ci1wYXJrcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBvdXJQYXJrc0xlZnQgLSA5MClcbiAgICAgICAgICAgICAgICAkKCcjcGFydG5lcnNoaXBzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQHBhcnRuZXJzaGlwTGVmdCAtIDExOClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgd2luZG93LmlubmVyV2lkdGggPCA5OTNcbiAgICAgICAgICAgICAgICAkKCcjb3VyLXBhcmtzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQG91clBhcmtzTGVmdCAtIDYwKVxuICAgICAgICAgICAgICAgICQoJyNwYXJ0bmVyc2hpcHMtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAcGFydG5lcnNoaXBMZWZ0IC0gMTA1KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAb3VyUGFya3NMZWZ0IC0gNjApXG4gICAgICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBwYXJ0bmVyc2hpcExlZnQgLSA5MClcblxuICAgIGFuaW1hdGVIZWFkZXI6IChzY3JvbGxZKSA9PlxuICAgICAgICBpZiBAaHRtbC5oYXNDbGFzcyAncGhvbmUnXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAkaHQgPSBAJGVsLmZpbmQoJyNoZWFkZXItdG9wJylcbiAgICAgICAgJGhiID0gQCRlbC5maW5kKCcjaGVhZGVyLWJvdHRvbScpIFxuXG4gICAgICAgIGlmIHNjcm9sbFkgPiA4NSBcbiAgICAgICAgICAgIGlmICFAbmF2Q29sbGFwc2VkXG4gICAgICAgICAgICAgICAgJCgnI2hlYWRlci10b3AsICNoZWFkZXItYm90dG9tLCAjbmF2YmFyLWxvZ28sIC5uYXYtbGlzdCwgI2J1eSwgLmhlYWRlci1jb250YWN0LCAuaGVhZGVyLXNvY2lhbCcpLmFkZENsYXNzKCdzbWFsbCcpXG4gICAgICAgICAgICAgICAgQG5hdkNvbGxhcHNlZCA9IHRydWVcbiAgICAgICAgICAgICAgICBAcG9zaXRpb25TdWJOYXZMaXN0cygpIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBAbmF2Q29sbGFwc2VkXG4gICAgICAgICAgICAgICAgJCgnI2hlYWRlci10b3AsICNoZWFkZXItYm90dG9tLCAjbmF2YmFyLWxvZ28sIC5uYXYtbGlzdCwgI2J1eSwgLmhlYWRlci1jb250YWN0LCAuaGVhZGVyLXNvY2lhbCcpLnJlbW92ZUNsYXNzKCdzbWFsbCcpXG4gICAgICAgICAgICAgICAgQG5hdkNvbGxhcHNlZCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgQGhhbmRsZVN1Yk5hdigpXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uU3ViTmF2TGlzdHMoKSBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgIGhhbmRsZU5hdkhvdmVyOiAoZSkgPT5cbiAgICAgICAgcGFyZW50SUQgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5kYXRhKCdwYWdlJylcbiAgICAgICAgaWYgJCgnIycgKyBwYXJlbnRJRCArICctc3VibmF2LWxpc3QnKS5maW5kKCdhJykubGVuZ3RoIDwgMVxuICAgICAgICAgICAgQGhpZGVTdWJOYXYoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAaGlkZVN1Yk5hdkxpbmtzKClcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MocGFyZW50SUQpXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgIUBzdWJuYXZTaG93aW5nXG4gICAgICAgICAgICAgICAgQHNob3dTdWJOYXYoKVxuICAgICAgICAgICAgICBcbiAgICBzaG93U3ViTmF2OiA9PlxuICAgICAgICBAc3VibmF2LmFkZENsYXNzKCdzaG93aW5nJylcbiAgICAgICAgQHN1Ym5hdlNob3dpbmcgPSB0cnVlXG4gICAgICAgIFxuICAgIGhpZGVTdWJOYXY6ID0+XG4gICAgICAgIEBzdWJuYXYucmVtb3ZlQ2xhc3MoJ3Nob3dpbmcnKVxuICAgICAgICBAc3VibmF2U2hvd2luZyA9IGZhbHNlXG4gICAgICAgIEBoYW5kbGVTdWJOYXYoKVxuXG4gICAgc2hvd1N1Yk5hdkxpbmtzOiAocGFnZSkgPT5cbiAgICAgICAgaWYgcGFnZT9cbiAgICAgICAgICAgIGxlZnQgPSAkKCcubmF2IC5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cIicgKyBwYWdlICsgJ1wiXScpLnBvc2l0aW9uKCkubGVmdFxuICAgICAgICAgICAgb2Zmc2V0ID0gMFxuICAgICAgICAgICAgaGVscGVyID0gLTQ1IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB3aW5kb3cuaW5uZXJXaWR0aCA8IDk5M1xuICAgICAgICAgICAgICAgIGhlbHBlciA9IC0yMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjY29uc29sZS5sb2cgJ3BhZ2U6ICcsIHBhZ2VcbiAgICAgICAgICAgICNjb25zb2xlLmxvZyAnYjogJywgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCBhJykubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICQoJyMnICsgcGFnZSArICctc3VibmF2LWxpc3QgYScpLmxlbmd0aCA8IDNcbiAgICAgICAgICAgICAgICBmb3IgYSBpbiAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0IGEnKVxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBvZmZzZXQgKyAkKGEpLndpZHRoKClcblxuICAgICAgICAgICAgaWYgb2Zmc2V0ID4gMFxuICAgICAgICAgICAgICAgICNjb25zb2xlLmxvZyAnYSdcbiAgICAgICAgICAgICAgICAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgbGVmdCAtIChvZmZzZXQgLyAzKSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjY29uc29sZS5sb2cgJ2InXG4jICAgICAgICAgICAgICAgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIGxlZnQgKyBoZWxwZXIpXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uU3ViTmF2TGlzdHMoKVxuICAgICAgICAgICAgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCcpLmFkZENsYXNzKCdzaG93aW5nJylcbiAgICBcbiAgICBoaWRlU3ViTmF2TGlua3M6ID0+XG4gICAgICAgICQoJy5zdWJuYXYtbGlzdCBsaScpLnJlbW92ZUNsYXNzKCdzaG93aW5nJylcbiAgICAgICAgXG4gICAgaGFuZGxlU3ViTmF2OiA9PlxuICAgICAgICBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ291cnBhcmtzJykgfHwgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdvZmZlcmluZ3MnKSB8fCAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ2FjY29tbW9kYXRpb25zJylcbiAgICAgICAgICAgICQoJ3VsLnN1Ym5hdi1saXN0IGxpJykucmVtb3ZlQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICAgICAkKCcjb3VyLXBhcmtzLXN1Ym5hdi1saXN0JykuYWRkQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICAgICBAc2hvd1N1Yk5hdkxpbmtzKCdvdXItcGFya3MnKVxuXG4gICAgICAgICAgICBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ29mZmVyaW5ncycpXG4gICAgICAgICAgICAgICAgJCgnYSNvdXItcGFya3Mtb2ZmZXJpbmdzLXN1Ym5hdi1saW5rJykuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG4gICAgICAgICAgICBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ2FjY29tbW9kYXRpb25zJylcbiAgICAgICAgICAgICAgICAkKCdhI291ci1wYXJrcy1hY2NvbW1vZGF0aW9ucy1zdWJuYXYtbGluaycpLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG4gICAgICAgIGVsc2UgaWYgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdwYXJ0bmVyc2hpcCcpIHx8ICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygncGFydG5lcnNoaXAtZGV0YWlscycpXG4gICAgICAgICAgICAkKCd1bC5zdWJuYXYtbGlzdCBsaScpLnJlbW92ZUNsYXNzICdzaG93aW5nJ1xuICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmFkZENsYXNzICdzaG93aW5nJ1xuICAgICAgICAgICAgQHNob3dTdWJOYXZMaW5rcygncGFydG5lcnNoaXBzJylcblxuIyAgICAgICAgICAgIGlmICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygncGFydG5lcnNoaXAtZGV0YWlscycpXG4jICAgICAgICAgICAgICAgICQoJ2EjcGFydG5lcnNoaXAtZGV0YWlscy1zdWJuYXYtbGluaycpLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG4jPT09PT09PT09PT09PT09PT09PSM9PT09PT09PT09PT09PT09PT09Iz09PT09PT09PT09PT09PT09PT0jXG4jPT09PT09PT09PT09PT09PT09PSAgTU9CSUxFIFNUQVJUUyBIRVJFID09PT09PT09PT09PT09PT09PSNcbiM9PT09PT09PT09PT09PT09PT09Iz09PT09PT09PT09PT09PT09PT0jPT09PT09PT09PT09PT09PT09PSMgXG5cbiAgICB0b2dnbGVOYXY6IChlKSA9PlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgJHQgPSAkKGUudGFyZ2V0KVxuICAgICAgICAkaGIgPSAkKCcjaGVhZGVyLWJvdHRvbScpXG4gICAgICAgICRtbiA9ICQoJyNtb2JpbGUtaGVhZGVyLW5hdicpXG4gICAgICAgICRoaCA9ICRoYi5oZWlnaHQoKVxuXG4gICAgICAgICR0LnRvZ2dsZUNsYXNzKCdjbG9zZWQnKVxuXG4gICAgICAgIGNvbnNvbGUubG9nICdzZWNvbmQgdG9nZ2xlJ1xuICAgICAgICBjb25zb2xlLmxvZyAkdFxuICAgICAgICBcbiAgICAgICAgaWYgJHQuaGFzQ2xhc3MoJ2Nsb3NlZCcpXG4gICAgICAgICAgICBAYWRqdXN0TW9iaWxlTmF2KClcbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvIEBtb2JuYXYsIC4zNSwgXG4gICAgICAgICAgICAgICAge3k6ICg4MDAgKyAkaGgpXG4gICAgICAgICAgICAgICAgLHo6IDBcbiAgICAgICAgICAgICAgICAsZWFzZTogUG93ZXIxLmVhc2VPdXRcbiAgICAgICAgICAgICAgICAsb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgICAgICAgICAgVHdlZW5NYXguc2V0IEBtb2JuYXYsXG4gICAgICAgICAgICAgICAgICAgICAgICB6OiAxMFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgVHdlZW5NYXguc2V0IEBtb2JuYXYsXG4gICAgICAgICAgICAgICAgejogLTIgXG4gICAgICAgICAgICBUd2Vlbk1heC50byBAbW9ibmF2LCAuNSwge3k6IDAsIHo6IDAsIGVhc2U6IFBvd2VyMS5lYXNlSW59XG4gICAgICAgICAgICAkKCcubW9iaWxlLXN1Yi1uYXYnKS5jc3MoJ2hlaWdodCcsICcwcHgnKVxuICAgICAgICAgICAgQGFkanVzdE1vYmlsZU5hdlxuICAgICAgICAgICAgQGhpZGVNb2JpbGVTdWJOYXYoKVxuICAgICAgICAgICAgVHdlZW5NYXguc2V0IEBjb250ZW50ICxcbiAgICAgICAgICAgICAgICB5OiAwXG5cbiAgICBhZGp1c3RNb2JpbGVOYXY6ID0+XG4gICAgICAgICRoYiA9ICQoJyNoZWFkZXItYm90dG9tJylcbiAgICAgICAgJG1uID0gJCgnI21vYmlsZS1oZWFkZXItbmF2JylcbiAgICAgICAgIyBTZXQgbmF2IGhlaWdodCB0byAzNTBweCBldmVyeSB0aW1lIGJlZm9yZSBhZGp1c3RpbmdcbiAgICAgICAgIyRtbi5jc3Mge2hlaWdodDogMzUwfVxuICAgICAgICAkaGggPSAkaGIuaGVpZ2h0KClcbiAgICAgICAgJG5oID0gJG1uLmhlaWdodCgpXG4gICAgICAgICRpdyA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgICAgICRpaCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICAkbWIgPSAkKCcjbmF2YmFyLW1lbnUnKVxuXG4gICAgICAgIGlmICRuaCA+ICRpaFxuICAgICAgICAgICAgJG1uLmNzcyB7aGVpZ2h0OiAoJGloIC0gJGhoKSwgb3ZlcmZsb3c6ICdzY3JvbGwnfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAkbW4uY3NzIHtoZWlnaHQ6IDQwMCArICdweCd9ICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIHNob3dNb2JpbGVTdWJOYXY6IChlKSA9PlxuICAgICAgICB0aGlzU3ViTmF2ID0gJChlLnRhcmdldCkucGFyZW50KCkuZmluZCAnLm1vYmlsZS1zdWItbmF2J1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXNTdWJOYXYuZmluZCgnbGknKS5sZW5ndGggPCAxKVxuICAgICAgICAgICAgQGhpZGVNb2JpbGVTdWJOYXYoKVxuICAgICAgICAgICAgJChlLnRhcmdldCkuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgaWYgISgkKGUudGFyZ2V0KS5wYXJlbnQoKS5oYXNDbGFzcygnYWN0aXZlJykpXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIFxuICAgICAgICBob3dNYW55ID0gdGhpc1N1Yk5hdi5maW5kKCdsaScpLmxlbmd0aFxuICAgICAgICB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgdGFyZ2V0ID0gJChlLnRhcmdldClcblxuICAgICAgICBAaGlkZU1vYmlsZVN1Yk5hdigpXG4gICAgICAgIHRhcmdldC5maW5kKCdpJykuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgdGFyZ2V0LmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgIHRhcmdldC5wYXJlbnRzKCdhJykuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgQG1vYm5hdi5jc3MoJ2hlaWdodCcsICh3aW5kb3dIZWlnaHQgLSAxMDApICsgJ3B4JylcbiAgICAgICAgdGhpc1N1Yk5hdi5jc3MoJ2hlaWdodCcsIChob3dNYW55ICogNTApICsgJ3B4JylcbiAgICAgICAgXG4gICAgaGlkZU1vYmlsZVN1Yk5hdjogPT5cbiAgICAgICAgJCgnLm1vYmlsZS1zdWItbmF2JykuY3NzKCdoZWlnaHQnLCAnMHB4JylcbiAgICAgICAgQG1vYm5hdi5jc3MoJ2hlaWdodCcsICc0MDBweCcpXG4gICAgICAgIEBtb2JuYXYuZmluZCgnaScpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgIEBtb2JuYXYuZmluZCgnbGknKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICBAbW9ibmF2LmZpbmQoJ3VsIGEnKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuXG4gICAgXG4gICAgaGFuZGxlQXJyb3dDbGljazogKGUpID0+XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIFxuICAgICAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgQGhpZGVNb2JpbGVTdWJOYXYoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnRzKCdsaScpLnRyaWdnZXIgJ2NsaWNrJ1xuICAgICAgICBcbiAgICAgICAgXG4gICAgb25DbGlja01vYmlsZVN1Yk5hdkxpbms6IChlKSA9PlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBcbiAgICAgICAgaWYgJChlLnRhcmdldCkuZGF0YSgnaHJlZicpP1xuICAgICAgICAgICAgdXJsID0gJChlLnRhcmdldCkuZGF0YSAnaHJlZidcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJBbmltYXRpb25cblxuXG4iLCJcblBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblZpZGVvT3ZlcmxheSA9IHJlcXVpcmUgJy4vVmlkZW9PdmVybGF5LmNvZmZlZSdcblxuY2xhc3MgUGFya3NMaXN0IGV4dGVuZHMgUGx1Z2luQmFzZVxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBAJGVsID0gJChvcHRzLmVsKVxuICAgICAgICBzdXBlcihvcHRzKSAgICAgICAgIFxuICAgICAgICBAZ2FsbGVyeSA9IG9wdHMuZ2FsbGVyeVxuICAgICAgICBpZiBAZ2FsbGVyeT9cbiAgICAgICAgICAgIEBnYWxsZXJ5Lm9uIFwiaXRlbUluZGV4XCIgLCBAc2VsZWN0TG9nb1xuICAgICAgICAgICAgXG4gICAgICAgIEBwYWdlID0gb3B0cy5wYWdlXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBAcGFya0xvZ29zID0gJChAJGVsKS5maW5kIFwibGlcIlxuICAgICAgICBAY3VycmVudFNlbGVjdGVkID0gQHBhcmtMb2dvcy5maWx0ZXIoXCI6Zmlyc3QtY2hpbGRcIilcbiAgICAgICAgaWYgQGdhbGxlcnk/XG4gICAgICAgICAgICBAc2VsZWN0TG9nbyBAc2VsZWN0ZWRMb2dvKClcbiAgICAgICAgICAgIEBnYWxsZXJ5LmdvdG8gQHNlbGVjdGVkTG9nbygpLCB0cnVlXG4gICAgICAgIHN1cGVyKClcblxuICAgIGFkZEV2ZW50czogLT5cbiAgICAgICAgQCRlbC5vbiAnY2xpY2snLCAnbGkucGFyaycsIEBoYW5kbGVMb2dvSW50ZXJhY3Rpb25cbiAgICAgICAgXG4gICAgICAgIEBwYXJrTG9nb3MuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgbG9nb0V2ZW50cyA9IG5ldyBIYW1tZXIodClcbiAgICAgICAgICAgIGxvZ29FdmVudHMub24gJ3RhcCcgLCBAaGFuZGxlTG9nb0ludGVyYWN0aW9uXG5cbiAgICBoYW5kbGVMb2dvSW50ZXJhY3Rpb246IChlKSA9PlxuICAgICAgICBpZiBAcGFnZSA9PSAnYWNjb21tb2RhdGlvbidcbiAgICAgICAgICAgIEBwYXJrTG9nb3MucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuICAgICAgICAgICAgJChlLnRhcmdldCkucGFyZW50cygnbGkucGFyaycpLmFkZENsYXNzICdzZWxlY3RlZCdcbiAgICAgICAgICAgIHdoaWNoUGFyayA9ICQoZS50YXJnZXQpLnBhcmVudHMoJ2xpLnBhcmsnKS5hdHRyKCdpZCcpXG4gICAgICAgICAgICBAc2hvd05ld0FjY29tbW9kYXRpb25zKHdoaWNoUGFyaylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBcbiAgICAgICAgJHRhcmdldCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ2xpJylcblxuICAgICAgICBpZCA9ICR0YXJnZXQuZGF0YSgnaWQnKVxuICAgICAgICBcbiAgICAgICAgQGRpc3BsYXlDb250ZW50IGlkXG4gICAgICAgIFxuICAgICAgICBcbiAgICBzaG93TmV3QWNjb21tb2RhdGlvbnM6IChwYXJrKSA9PlxuICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuc3dpcGVyLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IC5jYXJvdXNlbC13cmFwcGVyJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXJbZGF0YS1sb2dvPVwiJyArIHBhcmsgKyAnXCJdJykuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXJbZGF0YS1sb2dvPVwiJyArIHBhcmsgKyAnXCJdJykucGFyZW50KCkuYWRkQ2xhc3MgJ2FjdGl2ZSdcblxuICAgIGRpc3BsYXlDb250ZW50OiAoaWQpIC0+XG5cblxuICAgICAgICBAc2VsZWN0TG9nbyhpZClcblxuICAgICAgICAjU3dpdGNoIEluZm8gQm94ZXNcbiAgICAgICAgQGdhbGxlcnkuZ290byhpZClcblxuXG4gICAgc2VsZWN0TG9nbzogKGlkKSA9PlxuICAgICAgICBsb2dvSWQgPSBcIiMje2lkfS1sb2dvXCJcbiAgICAgICAgQHBhcmtMb2dvcy5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICBAcGFya0xvZ29zLmZpbHRlcihsb2dvSWQpLmFkZENsYXNzKCdzZWxlY3RlZCcpXG5cblxuICAgIHNlbGVjdGVkTG9nbzogLT5cbiAgICAgICAgcmV0dXJuIEBwYXJrTG9nb3MucGFyZW50KCkuZmluZCgnbGkuc2VsZWN0ZWQnKS5kYXRhKCdpZCcpO1xuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFya3NMaXN0XG5cbiIsIlBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblxuY2xhc3MgUmVzaXplQnV0dG9ucyBleHRlbmRzIFBsdWdpbkJhc2VcblxuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBAcmVzaXplQnV0dG9ucygpXG5cbiAgICByZXNpemVCdXR0b25zOiAtPlxuICAgICAgICBjID0gJCgnI2NvbnRlbnQnKVxuICAgICAgICBidG5fd3JhcHBlcnMgPSBjLmZpbmQgJy5idG4td3JhcHBlcidcblxuICAgICAgICBmb3IgYnRuX3dyYXBwZXIgaW4gYnRuX3dyYXBwZXJzXG4gICAgICAgICAgICBidG5zID0gJChidG5fd3JhcHBlcikuZmluZCAnYSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgYnRucy5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgbWF4V2lkdGggPSAwXG4gICAgICAgICAgICAgICAgd2lkZXN0U3BhbiA9IG51bGxcblxuICAgICAgICAgICAgICAgICQoYnRucykuZWFjaCAtPlxuICAgICAgICAgICAgICAgICAgICBpZiAkKHRoaXMpLndpZHRoKCkgPiBtYXhXaWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4V2lkdGggPSAkKHRoaXMpLndpZHRoKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGVzdFNwYW4gPSAkKHRoaXMpXG5cbiAgICAgICAgICAgICAgICAkKGJ0bnMpLmVhY2ggLT5cbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3Moe3dpZHRoOiBtYXhXaWR0aCArIDYwfSlcblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZUJ1dHRvbnMiLCJjbGFzcyBTdmdJbmplY3RcblxuICAgIGNvbnN0cnVjdG9yOiAoc2VsZWN0b3IpIC0+XG4gICAgICAgIFxuICAgICAgICBAJHN2Z3MgPSAkKHNlbGVjdG9yKVxuICAgICAgICBcbiAgICAgICAgQHByZWxvYWRlciA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUgdHJ1ZSAsIFwiXCIgLCB0cnVlXG4gICAgICAgIEBwcmVsb2FkZXIuc2V0TWF4Q29ubmVjdGlvbnMoMTApXG4gICAgICAgIEBwcmVsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lciAnZmlsZWxvYWQnICwgQG9uU3ZnTG9hZGVkXG4gICAgICAgIEBwcmVsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uTG9hZENvbXBsZXRlXG4gICAgICAgIEBtYW5pZmVzdCA9IFtdXG4gICAgICAgIEBjb2xsZWN0U3ZnVXJscygpXG4gICAgICAgIEBsb2FkU3ZncygpXG4gICAgICAgIFxuICAgIGNvbGxlY3RTdmdVcmxzOiAtPlxuICAgICAgICBcbiAgICAgICAgc2VsZiA9IEBcbiAgICAgICAgXG4gICAgICAgIEAkc3Zncy5lYWNoIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlkID0gXCJzdmctaW5qZWN0LSN7cGFyc2VJbnQoTWF0aC5yYW5kb20oKSAqIDEwMDApLnRvU3RyaW5nKCl9XCJcbiAgICAgICAgICBcbiAgICAgICAgICAgICQoQCkuYXR0cignaWQnLCBpZClcbiAgICAgICAgICAgICQoQCkuYXR0cignZGF0YS1hcmInICwgXCJhYmMxMjNcIilcbiAgICAgICAgICAgIHN2Z1VybCA9ICQoQCkuYXR0cignc3JjJylcbiAgICAgICAgICAgIFxuICAgICAgICAgICBcblxuICAgICAgICAgICAgc2VsZi5tYW5pZmVzdC5wdXNoIFxuICAgICAgICAgICAgICAgIGlkOmlkXG4gICAgICAgICAgICAgICAgc3JjOnN2Z1VybFxuICAgICAgICAgICAgICAgIFxuICAgIGxvYWRTdmdzOiAtPlxuICAgICAgICBcbiAgICAgICAgQHByZWxvYWRlci5sb2FkTWFuaWZlc3QoQG1hbmlmZXN0KVxuICAgICAgICAgICAgICAgIFxuICAgIFxuICAgIGluamVjdFN2ZzogKGlkLHN2Z0RhdGEpIC0+XG4gICAgICAgIFxuICAgICAgICAkZWwgPSAkKFwiIyN7aWR9XCIpICAgIFxuIFxuIFxuICAgICAgICBpbWdJRCA9ICRlbC5hdHRyKCdpZCcpXG4gICAgICAgIGltZ0NsYXNzID0gJGVsLmF0dHIoJ2NsYXNzJylcbiAgICAgICAgaW1nRGF0YSA9ICRlbC5jbG9uZSh0cnVlKS5kYXRhKCkgb3IgW11cbiAgICAgICAgZGltZW5zaW9ucyA9IFxuICAgICAgICAgICAgdzogJGVsLmF0dHIoJ3dpZHRoJylcbiAgICAgICAgICAgIGg6ICRlbC5hdHRyKCdoZWlnaHQnKVxuXG4gICAgICAgIHN2ZyA9ICQoc3ZnRGF0YSkuZmlsdGVyKCdzdmcnKVxuICAgICAgICBcblxuICAgICAgICBzdmcgPSBzdmcuYXR0cihcImlkXCIsIGltZ0lEKSAgaWYgdHlwZW9mIGltZ0lEIGlzbnQgJ3VuZGVmaW5lZCdcbiAgICAgICAgaWYgdHlwZW9mIGltZ0NsYXNzIGlzbnQgJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgIGNscyA9IChpZiAoc3ZnLmF0dHIoXCJjbGFzc1wiKSBpc250ICd1bmRlZmluZWQnKSB0aGVuIHN2Zy5hdHRyKFwiY2xhc3NcIikgZWxzZSBcIlwiKVxuICAgICAgICAgICAgc3ZnID0gc3ZnLmF0dHIoXCJjbGFzc1wiLCBpbWdDbGFzcyArIFwiIFwiICsgY2xzICsgXCIgcmVwbGFjZWQtc3ZnXCIpXG4gICAgICAgIFxuICAgICAgICAjIGNvcHkgYWxsIHRoZSBkYXRhIGVsZW1lbnRzIGZyb20gdGhlIGltZyB0byB0aGUgc3ZnXG4gICAgICAgICQuZWFjaCBpbWdEYXRhLCAobmFtZSwgdmFsdWUpIC0+ICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBzdmdbMF0uc2V0QXR0cmlidXRlIFwiZGF0YS1cIiArIG5hbWUsIHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gICAgICAgIFxuICAgICAgICBzdmcgPSBzdmcucmVtb3ZlQXR0cihcInhtbG5zOmFcIilcbiAgICAgICAgXG4gICAgICAgICNHZXQgb3JpZ2luYWwgZGltZW5zaW9ucyBvZiBTVkcgZmlsZSB0byB1c2UgYXMgZm91bmRhdGlvbiBmb3Igc2NhbGluZyBiYXNlZCBvbiBpbWcgdGFnIGRpbWVuc2lvbnNcbiAgICAgICAgb3cgPSBwYXJzZUZsb2F0KHN2Zy5hdHRyKFwid2lkdGhcIikpXG4gICAgICAgIG9oID0gcGFyc2VGbG9hdChzdmcuYXR0cihcImhlaWdodFwiKSlcbiAgICAgICAgXG4gICAgICAgICNTY2FsZSBhYnNvbHV0ZWx5IGlmIGJvdGggd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzIGV4aXN0XG4gICAgICAgIGlmIGRpbWVuc2lvbnMudyBhbmQgZGltZW5zaW9ucy5oXG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcIndpZHRoXCIsIGRpbWVuc2lvbnMud1xuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJoZWlnaHRcIiwgZGltZW5zaW9ucy5oXG4gICAgICAgIFxuICAgICAgICAjU2NhbGUgcHJvcG9ydGlvbmFsbHkgYmFzZWQgb24gd2lkdGhcbiAgICAgICAgZWxzZSBpZiBkaW1lbnNpb25zLndcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwid2lkdGhcIiwgZGltZW5zaW9ucy53XG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcImhlaWdodFwiLCAob2ggLyBvdykgKiBkaW1lbnNpb25zLndcbiAgICAgICAgXG4gICAgICAgICNTY2FsZSBwcm9wb3J0aW9uYWxseSBiYXNlZCBvbiBoZWlnaHRcbiAgICAgICAgZWxzZSBpZiBkaW1lbnNpb25zLmhcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwiaGVpZ2h0XCIsIGRpbWVuc2lvbnMuaFxuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJ3aWR0aFwiLCAob3cgLyBvaCkgKiBkaW1lbnNpb25zLmhcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAkZWwucmVwbGFjZVdpdGggc3ZnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgb25TdmdMb2FkZWQ6IChlKSA9PlxuICAgICAgICBcbiAgICAgICAgQGluamVjdFN2ZyhlLml0ZW0uaWQsIGUucmF3UmVzdWx0KVxuICAgIFxuICAgIG9uTG9hZENvbXBsZXRlOiAoZSkgPT5cbiAgICBcbiAgICBcbiAgICBcbiAgICBcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gU3ZnSW5qZWN0ICIsIlxuXG5jbGFzcyBWaWRlb092ZXJsYXlcblxuXG5cbiAgICBjb25zdHJ1Y3RvcjogKGVsKSAtPlxuICAgICAgICBAJGVsID0gJChlbClcbiAgICAgICAgQCRpbm5lciA9IEAkZWwuZmluZChcIi5vdmVybGF5LWlubmVyXCIpXG4gICAgICAgIEAkY29udGFpbmVyID0gQCRlbC5maW5kKFwiLm92ZXJsYXktaW5uZXItY29udGFpbmVyXCIpXG4gICAgICAgIFxuICAgICAgICBpZiAoQCRjb250YWluZXIuZmluZCgnLm92ZXJsYXktY29udGVudCcpLnNpemUoKSBpcyAxKSBcbiAgICAgICAgICAgIEAkY29udGFpbmVyID0gQCRjb250YWluZXIuZmluZCgnLm92ZXJsYXktY29udGVudCcpXG4gICAgICAgICAgICBcbiAgICAgICAgQCRjbG9zZSA9IEAkZWwuZmluZChcIi5vdmVybGF5LWNsb3NlXCIpXG4gICAgICAgIFxuXG4gICAgICAgIEBjcmVhdGVWaWRlb0luc3RhbmNlKClcbiAgICAgICAgQGNyZWF0ZU92ZXJsYXlUcmFuc2l0aW9uKClcbiAgICAgICAgQGFkZEV2ZW50cygpXG5cblxuXG4gICAgY3JlYXRlT3ZlcmxheVRyYW5zaXRpb246IC0+XG4gICAgICAgIEB0bCA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgICAgIEAkZWwuc2hvdygpXG5cbiAgICAgICAgQHRsLmFkZCBUd2Vlbk1heC5mcm9tVG8gJCgnI292ZXJsYXknKSwgLjAxLFxuICAgICAgICAgICAge3pJbmRleDogLTEsIGRpc3BsYXk6J25vbmUnLCB6OiAwfSwge3pJbmRleDogNTAwMCwgZGlzcGxheTonYmxvY2snLCB6OiA5OTk5OTk5OTk5fVxuICAgICAgICBcbiAgICAgICAgQHRsLmFkZCBUd2Vlbk1heC50byBAJGVsICwgLjM1ICxcbiAgICAgICAgICAgIGF1dG9BbHBoYToxXG5cbiAgICAgICAgQHRsLmFkZCBUd2Vlbk1heC50byBAJGlubmVyICwgLjU1ICxcbiAgICAgICAgICAgIGFscGhhOjFcblxuICAgICAgICBAdGwuYWRkIFR3ZWVuTWF4LnRvIEAkY2xvc2UgLCAuMjUgLFxuICAgICAgICAgICAgYWxwaGE6MVxuICAgICAgICAsXG4gICAgICAgICAgICBcIi09LjE1XCJcblxuICAgICAgICBAdGwuYWRkTGFiZWwoXCJpbml0Q29udGVudFwiKVxuXG4gICAgICAgIEB0bC5zdG9wKClcblxuICAgIGNyZWF0ZVZpZGVvSW5zdGFuY2U6ICgpIC0+XG5cblxuXG4gICAgYWRkRXZlbnRzOiAtPlxuICAgICAgICBAY2xvc2VFdmVudCA9IG5ldyBIYW1tZXIoQCRjbG9zZVswXSlcblxuXG5cbiAgICB0cmFuc2l0aW9uSW5PdmVybGF5OiAobmV4dCkgLT5cbiAgICAgICAgY29uc29sZS5sb2cgJ3RyYW5zaXRpb25Jbk92ZXJsYXknXG4gICAgICAgIEB0cmFuc0luQ2IgPSBuZXh0XG4gICAgICAgIEB0bC5hZGRDYWxsYmFjayhAdHJhbnNJbkNiLCBcImluaXRDb250ZW50XCIpXG4gICAgICAgIEB0bC5wbGF5KClcbiAgICAgICAgQGNsb3NlRXZlbnQub24gJ3RhcCcgLCBAY2xvc2VPdmVybGF5XG5cbiAgICB0cmFuc2l0aW9uT3V0T3ZlcmxheTogLT5cbiAgICAgICAgY29uc29sZS5sb2cgJ3RyYW5zaXRpb25PdXRPdmVybGF5J1xuICAgICAgICBAY2xvc2VFdmVudC5vZmYgJ3RhcCcgLCBAY2xvc2VPdmVybGF5XG4gICAgICAgIEB0bC5yZW1vdmVDYWxsYmFjayhAdHJhbnNJbkNiKVxuICAgICAgICBAdGwucmV2ZXJzZSgpXG4gICAgICAgIGRlbGV0ZSBAdHJhbnNJbkNiXG5cblxuICAgIGNsb3NlT3ZlcmxheTogKGUpID0+XG4gICAgICAgIEByZW1vdmVWaWRlbygpXG4gICAgICAgIEB0cmFuc2l0aW9uT3V0T3ZlcmxheSgpXG5cblxuICAgIHJlbW92ZVZpZGVvOiAoKSAtPlxuICAgICAgICBpZiBAdmlkZW9JbnN0YW5jZVxuICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UucGF1c2UoKVxuICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UuY3VycmVudFRpbWUoMClcbiAgICAgICAgICAgICNAdmlkZW9JbnN0YW5jZS5kaXNwb3NlKClcblxuICAgIHJlc2l6ZU92ZXJsYXk6ICgpIC0+XG4gICAgICAgICR2aWQgPSBAJGVsLmZpbmQoJ3ZpZGVvJylcbiAgICAgICAgJHcgPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgICAgICAkaCA9ICR2aWQuaGVpZ2h0KClcblxuICAgICAgICAjIEAkaW5uZXIuY3NzIHt3aWR0aDogJHcsIGhlaWdodDogJGh9XG4gICAgICAgICMgJHZpZC5jc3Mge2hlaWdodDogMTAwICsgJyUnLCB3aWR0aDogMTAwICsgJyUnfVxuXG4gICAgYXBwZW5kRGF0YTogKGRhdGEpIC0+XG4gICAgICAgIGlmIGRhdGEubXA0ID09IFwiXCIgb3IgISBkYXRhLm1wND9cbiAgICAgICAgICAgIGNvbnNvbGUubG9nICdubyB2aWRlbywgaXRzIGFuIGltYWdlJ1xuICAgICAgICAgICAgQHBvc3RlciA9ICQoXCI8ZGl2IGNsYXNzPSd2aWRlby1qcyc+PGltZyBjbGFzcz0ndmpzLXRlY2gnIHNyYz0nXCIgKyBkYXRhLnBvc3RlciArIFwiJyBjbGFzcz0nbWVkaWEtaW1hZ2UtcG9zdGVyJyAvPjwvZGl2PlwiKVxuICAgICAgICAgICAgQCRjb250YWluZXIuaHRtbCBAcG9zdGVyXG4gICAgICAgICAgICBAcG9zdGVyLmNzcyAnaGVpZ2h0JywgJzEwMCUnXG4gICAgICAgICAgICBAcmVtb3ZlVmlkZW8oKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgbXA0ID0gJChcIjxzb3VyY2Ugc3JjPVxcXCIje2RhdGEubXA0fVxcXCIgdHlwZT1cXFwidmlkZW8vbXA0XFxcIiAvPiBcIilcbiAgICAgICAgd2VibSA9ICQoXCI8c291cmNlIHNyYz1cXFwiI3tkYXRhLndlYm19XFxcIiB0eXBlPVxcXCJ2aWRlby93ZWJtXFxcIiAvPiBcIilcblxuICAgICAgICBAJHZpZGVvRWwgPSAkKFwiPHZpZGVvIGlkPSdvdmVybGF5LXBsYXllcicgY2xhc3M9J3Zqcy1kZWZhdWx0LXNraW4gdmlkZW8tanMnIGNvbnRyb2xzIHByZWxvYWQ9J2F1dG8nIC8+XCIpXG4gICAgICAgIEAkdmlkZW9FbC5hcHBlbmQobXA0KVxuICAgICAgICBAJHZpZGVvRWwuYXBwZW5kKHdlYm0pXG4gICAgICAgIEAkY29udGFpbmVyLmh0bWwgQCR2aWRlb0VsXG5cbiAgICAgICAgaWYgQHZpZGVvSW5zdGFuY2U/XG4gICAgICAgICAgICBAdmlkZW9JbnN0YW5jZS5kaXNwb3NlKClcbiAgICAgICAgQHZpZGVvSW5zdGFuY2UgPSB2aWRlb2pzIFwib3ZlcmxheS1wbGF5ZXJcIiAgLFxuICAgICAgICAgICAgd2lkdGg6XCIxMDAlXCJcbiAgICAgICAgICAgIGhlaWdodDpcIjEwMCVcIlxuXG5cblxuXG4gICAgcGxheVZpZGVvOiAoKSA9PlxuIyAgICAgICAgaWYoISQoXCJodG1sXCIpLmhhc0NsYXNzKCdtb2JpbGUnKSlcbiMgICAgICAgICAgICBAdmlkZW9JbnN0YW5jZS5wbGF5KClcbiAgICAgICAgaWYgQHZpZGVvSW5zdGFuY2U/XG4gICAgICAgICAgICBAdmlkZW9JbnN0YW5jZS5wbGF5KClcbiAgICAgICAgICAgIFxuICAgIHNob3dJbWFnZTogKCkgPT5cbiAgICAgICAgY29uc29sZS5sb2cgJ3Nob3dJbWFnZSdcblxuXG5cbm92ZXJsYXkgPSBuZXcgVmlkZW9PdmVybGF5IFwiI292ZXJsYXlcIlxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzLmluaXRWaWRlb092ZXJsYXkgPSAoZGF0YSkgLT5cbiAgICBjb25zb2xlLmxvZyAnZGF0YTI6ICcsIGRhdGFcbiAgICBvdmVybGF5LmFwcGVuZERhdGEoZGF0YSlcblxuXG4gICAgaWYgIShkYXRhLm1wNCA9PSBcIlwiKVxuICAgICAgICBjb25zb2xlLmxvZyAnZGF0YS5tcDQgIT09IFwiXCInXG4gICAgICAgIG92ZXJsYXkudHJhbnNpdGlvbkluT3ZlcmxheShvdmVybGF5LnBsYXlWaWRlbylcbiAgICBlbHNlXG4gICAgICAgIGNvbnNvbGUubG9nICdkYXRhLm1wNCA9PT0gXCJcIidcbiAgICAgICAgb3ZlcmxheS50cmFuc2l0aW9uSW5PdmVybGF5KG92ZXJsYXkuc2hvd0ltYWdlKVxuXG5cblxuXG5cblxuXG5cblxuXG5cbiIsIlBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi8uLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcbkZyYW1lc01vZGVsID0gcmVxdWlyZSAnLi9GcmFtZXNNb2RlbC5jb2ZmZWUnXG5cbm1hdGNoRnJhbWVOdW0gPSAvXFxkKyg/PVxcLlthLXpBLVpdKykvXG5cbmNsYXNzIEZyYW1lQW5pbWF0aW9uIGV4dGVuZHMgUGx1Z2luQmFzZVxuICAgIFxuICAgIFxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgXG4gICAgICAgIEAkZWwgPSAkKG9wdHMuZWwpXG4gICAgICAgIEBhc3luYyA9IG9wdHMuYXN5bmMgb3IgZmFsc2VcbiAgICAgICAgZGVwdGg9IG9wdHMuZGVwdGggb3IgMVxuICAgICAgICBAJGNvbnRhaW5lciA9ICQoXCI8ZGl2IGNsYXNzPSdjb2FzdGVyLWNvbnRhaW5lcicgLz5cIilcbiAgICAgICAgQCRjb250YWluZXIuYXR0cignaWQnICwgb3B0cy5pZClcbiAgICAgICAgQCRjb250YWluZXIuY3NzKCd6LWluZGV4JywgZGVwdGgpXG4gICAgICAgIFR3ZWVuTWF4LnNldCBAJGNvbnRhaW5lciAsIFxuICAgICAgICAgICAgejpkZXB0aCAqIDEwXG4gICAgICAgIFxuICAgICAgICBzdXBlcihvcHRzKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgXG4gICAgaW5pdGlhbGl6ZTogKG9wdHMpIC0+XG4gICAgICAgIHN1cGVyKG9wdHMpXG4gICAgICAgIFxuICAgICAgICBAbW9kZWwgPSBuZXcgRnJhbWVzTW9kZWwgb3B0c1xuICAgICAgICBAbW9kZWwub24gXCJkYXRhTG9hZGVkXCIgLCBAc2V0dXBDYW52YXNcbiAgICAgICAgQG1vZGVsLm9uIFwidHJhY2tMb2FkZWRcIiAsIEBvblRyYWNrTG9hZGVkXG4gICAgICAgIEBtb2RlbC5vbiBcImZyYW1lc0xvYWRlZFwiICwgQG9uRnJhbWVzTG9hZGVkXG4gICAgICAgIEBtb2RlbC5sb2FkRGF0YSgpXG4gICAgICAgIFxuICAgXG4gICAgICAgXG4gICAgbG9hZEZyYW1lczogLT5cbiAgICAgICAgaWYgQG1vZGVsLmRhdGE/XG4gICAgICAgICAgICBAbW9kZWwucHJlbG9hZEZyYW1lcygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBkZWZlckxvYWRpbmcgPSB0cnVlXG4gICAgICAgIFxuICAgIFxuICAgIFxuICAgIHNldHVwQ2FudmFzOiA9PlxuICAgICAgICBcblxuICAgICAgICBAY2FudmFzV2lkdGggPSBAbW9kZWwuZ2V0KCdnbG9iYWwnKS53aWR0aFxuICAgICAgICBAY2FudmFzSGVpZ2h0ID0gQG1vZGVsLmdldCgnZ2xvYmFsJykuaGVpZ2h0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpXG4gICAgICAgIEBjb250ZXh0ID0gQGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG4gICAgICAgIFxuICAgICAgICBAY2FudmFzLnNldEF0dHJpYnV0ZSgnd2lkdGgnICwgQGNhbnZhc1dpZHRoKVxuICAgICAgICBAY2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JyAsIEBjYW52YXNIZWlnaHQpXG5cbiAgICAgICAgXG4gICAgICAgIEAkY29udGFpbmVyLmFwcGVuZChAY2FudmFzKVxuICAgICAgICBAJGVsLnByZXBlbmQoQCRjb250YWluZXIpXG4gICAgICAgIEBtb2RlbC5wcmVsb2FkVHJhY2soKVxuICAgICAgICBpZiBAZGVmZXJMb2FkaW5nXG4gICAgICAgICAgICBAbW9kZWwucHJlbG9hZEZyYW1lcygpXG4gICAgICBcbiAgICBcbiAgICBkaXNwbGF5VHJhY2s6IC0+XG4gICAgICAgIFxuICAgICAgICBAY29udGV4dC5jbGVhclJlY3QgMCAsIDAgLCBAY2FudmFzV2lkdGggLCBAY2FudmFzSGVpZ2h0XG4gICAgICAgIEBjb250ZXh0LmRyYXdJbWFnZSBAdHJhY2tJbWFnZS50YWcgLCAwICwwICwgQGNhbnZhc1dpZHRoICwgQGNhbnZhc0hlaWdodFxuICAgICAgICBcbiAgICBkaXNwbGF5RnJhbWU6IChudW0pIC0+XG4gICAgICAgIFxuICAgICAgICBtYW5pZmVzdCA9IEBtb2RlbC5nZXQoJ21hbmlmZXN0JylcbiAgICAgICAgXG4gICAgICAgIGlmIG1hbmlmZXN0Lmxlbmd0aCA+IG51bVxuICAgICAgICAgICAgYXNzZXQgPSBtYW5pZmVzdFtudW1dIFxuICAgICAgICAgICAgZnJhbWVBc3NldCA9IEBtb2RlbC5nZXRBc3NldChhc3NldC5maWxlbmFtZSlcbiAgICAgICAgICAgICMgY29uc29sZS5sb2cgZnJhbWVBc3NldC50YWcgLCBhc3NldC54ICwgYXNzZXQueSwgYXNzZXQud2lkdGgsIGFzc2V0LmhlaWdodFxuICAgICAgICAgICAgQGNvbnRleHQuZHJhd0ltYWdlIGZyYW1lQXNzZXQudGFnICwgYXNzZXQueCAsIGFzc2V0LnksIGFzc2V0LndpZHRoLCBhc3NldC5oZWlnaHRcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIGluaXRBbmltYXRpb246IC0+XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgZnJhbWVzID0gQG1vZGVsLmdldCgnbWFuaWZlc3QnKS5sZW5ndGhcbiAgICAgICAgc3BlZWQgPSBAbW9kZWwuZ2V0KCdnbG9iYWwnKS5mcHNcbiAgICAgICAgZGVsYXkgPSBAbW9kZWwuZ2V0KCdnbG9iYWwnKS5kZWxheSBvciAwXG4gICAgICAgIHJlcGVhdERlbGF5ID0gQG1vZGVsLmdldCgnZ2xvYmFsJykucmVwZWF0RGVsYXkgb3IgMTBcbiAgICAgICAgXG4gICAgXG5cbiAgICAgICAgZHVyYXRpb24gPSAgZnJhbWVzIC8gc3BlZWRcblxuXG4gICAgICAgIHNlbGYgPSBAIFxuICAgICAgICBAbGFzdEZyYW1lTnVtID0gLTFcbiAgICAgICAgQHRpbWVsaW5lID0gd2luZG93LmNvYXN0ZXIgPSBUd2Vlbk1heC50byBAY2FudmFzICwgZHVyYXRpb24gLCBcbiAgICAgICAgICAgIG9uVXBkYXRlOiAtPlxuICAgICAgICAgICAgICAgIGZyYW1lTnVtID0gTWF0aC5mbG9vcihmcmFtZXMgKiBAcHJvZ3Jlc3MoKSkgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgZnJhbWVOdW0gaXNudCBAbGFzdEZyYW1lTnVtICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzZWxmLmRpc3BsYXlUcmFjaygpXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGlzcGxheUZyYW1lKGZyYW1lTnVtKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAbGFzdEZyYW1lTnVtID0gZnJhbWVOdW1cbiAgICAgICAgICAgIHJlcGVhdDotMVxuICAgICAgICAgICAgcmVwZWF0RGVsYXk6IHJlcGVhdERlbGF5XG4gICAgICAgICAgICBkZWxheTpkZWxheVxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcblxuICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICBcbiAgICBvblRyYWNrTG9hZGVkOiA9PlxuXG4gICAgICAgIEB0cmFja0ltYWdlID0gQG1vZGVsLmdldEFzc2V0KCd0cmFjaycpXG4gICAgICAgIEBkaXNwbGF5VHJhY2soKVxuICAgICAgICBcblxuICAgIG9uRnJhbWVzTG9hZGVkOiA9PlxuICAgICAgICBpZiB0eXBlb2YgQGFzeW5jIGlzICdmdW5jdGlvbidcbiAgICAgICAgICAgIEBhc3luYygpXG4gICAgICAgICQod2luZG93KS5vbiAnc2Nyb2xsJywgIEBjaGVja0NvYXN0ZXJWaXNpYmlsaXR5XG4gICAgICAgIEBjaGVja0NvYXN0ZXJWaXNpYmlsaXR5KClcbiAgICBcbiAgICAgICAgXG4gICAgY2hlY2tDb2FzdGVyVmlzaWJpbGl0eTogPT5cbiAgICAgICAgXG4gICAgICAgIGlmKEBpblZpZXdwb3J0KCkpXG5cbiAgICAgICAgICAgICQod2luZG93KS5vZmYgJ3Njcm9sbCcsICBAY2hlY2tDb2FzdGVyVmlzaWJpbGl0eVxuICAgICAgICAgICAgQGluaXRBbmltYXRpb24oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgaW5WaWV3cG9ydDogPT5cbiAgICAgICAgXG4gICAgICAgIHRvcCA9IEAkY29udGFpbmVyLm9mZnNldCgpLnRvcFxuICAgICAgICBoZWlnaHQgPSBAJGNvbnRhaW5lci5maW5kKCdjYW52YXMnKS5maXJzdCgpLmhlaWdodCgpXG4gICAgICAgIGJvdHRvbSA9IHRvcCArIGhlaWdodFxuICAgICAgICBcbiAgICAgICAgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpXG4gICAgICAgIHNjcm9sbEJvdHRvbSA9ICQod2luZG93KS5zY3JvbGxUb3AoKSArICQod2luZG93KS5oZWlnaHQoKVxuXG4gICAgICAgIGlmIHNjcm9sbFRvcCA8PSB0b3AgPD0gc2Nyb2xsQm90dG9tXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIFxuIFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZyYW1lQW5pbWF0aW9uXG4iLCJcblxubWF0Y2hGcmFtZU51bSA9IC9cXGQrKD89XFwuW2EtekEtWl0rKS9cblxuY2xhc3MgRnJhbWVzTW9kZWwgZXh0ZW5kcyBFdmVudEVtaXR0ZXJcblxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBAYmFzZVVybCA9IG9wdHMuYmFzZVVybFxuICAgICAgICBAdXJsID0gb3B0cy51cmxcbiAgICAgICAgQGxvYWRNYW5pZmVzdCA9IFtdO1xuICAgICAgICBAdHJhY2tNYW5pZmVzdCA9IFtdO1xuICAgICAgICBAaW5pdExvYWRlcigpXG4gICAgICAgIHN1cGVyKG9wdHMpXG4gICAgICAgIFxuXG4gICAgbG9hZERhdGE6IC0+XG4gICAgICAgICQuYWpheFxuICAgICAgICAgICAgdXJsOiBAYmFzZVVybCAgKyBAdXJsXG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCJcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgICAgc3VjY2VzczogQG9uRGF0YUxvYWRlZFxuICAgICAgICAgICAgZXJyb3I6IEBoYW5kbGVFcnJvclxuXG4gICAgaGFuZGxlRXJyb3I6IChlcnIpIC0+XG4gICAgICAgIHRocm93IGVyclxuXG4gICAgb25EYXRhTG9hZGVkOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIEBkYXRhID0gZGF0YVxuICAgICAgICBAdHJhbnNmb3JtRGF0YSgpXG4gICAgICAgIEBlbWl0IFwiZGF0YUxvYWRlZFwiXG4gICAgICBcblxuICAgIHNvcnRTZXF1ZW5jZTogKGEsYikgLT5cbiAgICAgICAgYUZyYW1lID0gbWF0Y2hGcmFtZU51bS5leGVjKGEuZmlsZW5hbWUpXG4gICAgICAgIGJGcmFtZSA9IG1hdGNoRnJhbWVOdW0uZXhlYyhiLmZpbGVuYW1lKVxuICAgICAgICByZXR1cm4gaWYgcGFyc2VJbnQoYUZyYW1lWzBdKSA8IHBhcnNlSW50KGJGcmFtZVswXSkgdGhlbiAtMSBlbHNlIDFcblxuICAgIHRyYW5zZm9ybURhdGE6IC0+XG4gICAgICAgIEBkYXRhLm1hbmlmZXN0LnNvcnQgQHNvcnRTZXF1ZW5jZVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEB0cmFja01hbmlmZXN0LnB1c2hcbiAgICAgICAgICAgIGlkOlwidHJhY2tcIlxuICAgICAgICAgICAgc3JjOiBcIiN7QGRhdGEuZ2xvYmFsLmZvbGRlcn0vI3tAZGF0YS5nbG9iYWwudHJhY2t9XCJcblxuICAgICAgICBmb3IgZnJhbWUgaW4gQGRhdGEubWFuaWZlc3RcbiAgICAgICAgICAgIGZyYW1lLnNyYyA9IFwiI3tAZGF0YS5nbG9iYWwuZm9sZGVyfS8je2ZyYW1lLmZpbGVuYW1lfVwiXG4gICAgICAgICAgICBAbG9hZE1hbmlmZXN0LnB1c2hcbiAgICAgICAgICAgICAgICBpZDogZnJhbWUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICBzcmM6IGZyYW1lLnNyY1xuXG4gICAgaW5pdExvYWRlcjogLT5cbiAgICAgICAgQHRyYWNrTG9hZGVyID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZSB0cnVlLCBAYmFzZVVybCwgdHJ1ZVxuICAgICAgICBAcHJlbG9hZGVyID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZSB0cnVlLCBAYmFzZVVybCwgdHJ1ZVxuICAgICAgICBAdHJhY2tMb2FkZXIuc2V0TWF4Q29ubmVjdGlvbnMoMTApXG4gICAgICAgIEBwcmVsb2FkZXIuc2V0TWF4Q29ubmVjdGlvbnMoMTUpXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgcHJlbG9hZFRyYWNrOiAtPlxuXG4gICAgICAgIEB0cmFja0xvYWRlci5hZGRFdmVudExpc3RlbmVyICdjb21wbGV0ZScgLCBAb25UcmFja0Fzc2V0c0NvbXBsZXRlXG4gICAgICAgIEB0cmFja0xvYWRlci5sb2FkTWFuaWZlc3QoQHRyYWNrTWFuaWZlc3QpXG4gICAgcHJlbG9hZEZyYW1lczogLT5cbiMgICAgICAgIGNvbnNvbGUubG9nIEBsb2FkTWFuaWZlc3RcbiAgICAgICAgXG4gICAgICAgIEBwcmVsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uQXNzZXRzQ29tcGxldGVcbiAgICAgICAgQHByZWxvYWRlci5sb2FkTWFuaWZlc3QoQGxvYWRNYW5pZmVzdClcblxuICAgIG9uVHJhY2tBc3NldHNDb21wbGV0ZTogKGUpID0+XG4gICAgICAgIFxuICAgICAgICBAdHJhY2tMb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uVHJhY2tBc3NldHNDb21wbGV0ZVxuICAgICAgICBAZW1pdCBcInRyYWNrTG9hZGVkXCJcblxuICAgIG9uQXNzZXRzQ29tcGxldGU6IChlKT0+XG4jICAgICAgICBjb25zb2xlLmxvZyBAcHJlbG9hZGVyXG4gICAgICAgIEBwcmVsb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uQXNzZXRzQ29tcGxldGVcbiAgICAgICAgQGVtaXQgXCJmcmFtZXNMb2FkZWRcIlxuXG5cblxuXG4gICAgZ2V0QXNzZXQ6IChpZCkgLT5cbiAgICAgICAgXG4gICAgICAgIGl0ZW0gPSAgQHByZWxvYWRlci5nZXRJdGVtIGlkXG4gICAgICAgIGlmICFpdGVtP1xuICAgICAgICAgICAgaXRlbSA9ICBAdHJhY2tMb2FkZXIuZ2V0SXRlbSBpZCAgICAgICAgXG4gICAgICAgIHJldHVybiBpdGVtXG5cbiAgICBnZXQ6IChrZXkpIC0+XG4gICAgICAgIGZvciBrLHYgb2YgQGRhdGFcbiAgICAgICAgICAgIGlmIGsgaXMga2V5XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZcblxuICAgIHNldDogKGtleSwgdmFsKSAtPlxuICAgICAgICBAZGF0YVtrZXldID0gdmFsXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGcmFtZXNNb2RlbFxuIiwiXHJcblZpZXdCYXNlID0gcmVxdWlyZSBcIi4uL2Fic3RyYWN0L1ZpZXdCYXNlLmNvZmZlZVwiXHJcblxyXG5jbGFzcyBTY3JvbGxCYXIgZXh0ZW5kcyBWaWV3QmFzZVxyXG5cclxuICAgIHNjcm9sbGluZyA6IGZhbHNlXHJcbiAgICBvZmZzZXRZIDogMFxyXG4gICAgcG9zaXRpb24gOiAwXHJcbiAgICBoaWRlVGltZW91dDogMFxyXG5cclxuXHJcbiAgICBpbml0aWFsaXplOiAtPlxyXG4gICAgICAgIEBvblJlc2l6ZSgpXHJcbiAgICAgICAgQHNldEV2ZW50cygpXHJcblxyXG4gICAgICAgIGlmIHdpbmRvdy5pc1RpZXJUYWJsZXRcclxuICAgICAgICAgICAgQCRlbC5oaWRlKClcclxuXHJcblxyXG5cclxuICAgIHNldEV2ZW50czogPT5cclxuICAgICAgICBAZGVsZWdhdGVFdmVudHNcclxuICAgICAgICAgICAgXCJtb3VzZWRvd24gLmhhbmRsZVwiIDogXCJvbkhhbmRsZURvd25cIlxyXG4gICAgICAgICAgICAjXCJtb3VzZWVudGVyXCIgOiBcIm9uSGFuZGxlVXBcIlxyXG4gICAgICAgICAgICBcImNsaWNrIC5yYWlsXCIgOiBcIm9uUmFpbENsaWNrXCJcclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkub24gXCJtb3VzZXVwXCIgLCBAb25IYW5kbGVVcFxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uIFwibW91c2Vtb3ZlXCIgLCBAb25Nb3VzZU1vdmVcclxuXHJcblxyXG4gICAgICAgIFxyXG4gICAgdXBkYXRlSGFuZGxlOiAocG9zKSA9PlxyXG4gICAgICAgIEBwb3NpdGlvbiA9IHBvc1xyXG4gICAgICAgIEAkZWwuZmluZCgnLmhhbmRsZScpLmNzc1xyXG4gICAgICAgICAgICB0b3A6IEBwb3NpdGlvbiAqICgkKHdpbmRvdykuaGVpZ2h0KCkgLSBAJGVsLmZpbmQoXCIuaGFuZGxlXCIpLmhlaWdodCgpKVxyXG4gICAgICAgIEBzaG93U2Nyb2xsYmFyKClcclxuICAgICAgICBAaGlkZVNjcm9sbGJhcigpXHJcblxyXG4gICAgb25SYWlsQ2xpY2s6IChlKSA9PlxyXG4gICAgICAgIEBvZmZzZXRZID0gaWYgZS5vZmZzZXRZIGlzbnQgdW5kZWZpbmVkIHRoZW4gZS5vZmZzZXRZIGVsc2UgZS5vcmlnaW5hbEV2ZW50LmxheWVyWVxyXG4gICAgICAgIEBwb3NpdGlvbiA9IEBvZmZzZXRZIC8gJCh3aW5kb3cpLmhlaWdodCgpXHJcbiAgICAgICAgQHRyaWdnZXIgXCJjdXN0b21TY3JvbGxKdW1wXCIgLCBAcG9zaXRpb25cclxuICAgICAgICBcclxuXHJcblxyXG4gICAgb25IYW5kbGVEb3duOiAoZSkgPT5cclxuXHJcbiAgICAgICAgQCRlbC5jc3NcclxuICAgICAgICAgICAgd2lkdGg6XCIxMDAlXCJcclxuICAgICAgICBAb2Zmc2V0WSA9IGlmIGUub2Zmc2V0WSBpc250IHVuZGVmaW5lZCB0aGVuIGUub2Zmc2V0WSBlbHNlIGUub3JpZ2luYWxFdmVudC5sYXllcllcclxuICAgICAgICBAc2Nyb2xsaW5nID0gdHJ1ZVxyXG5cclxuICAgIG9uSGFuZGxlVXA6IChlKSA9PlxyXG4gICAgICAgIEAkZWwuY3NzXHJcbiAgICAgICAgICAgIHdpZHRoOlwiMTVweFwiXHJcblxyXG4gICAgICAgIEBzY3JvbGxpbmcgPSBmYWxzZVxyXG5cclxuICAgIG9uTW91c2VNb3ZlOiAoZSkgPT5cclxuICAgICAgICBpZiBAc2Nyb2xsaW5nXHJcblxyXG4gICAgICAgICAgICBpZiBlLnBhZ2VZIC0gQG9mZnNldFkgPD0gMFxyXG4gICAgICAgICAgICAgICAgJChcIi5oYW5kbGVcIikuY3NzXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAxXHJcbiAgICAgICAgICAgIGVsc2UgaWYgZS5wYWdlWSAtIEBvZmZzZXRZID49ICQod2luZG93KS5oZWlnaHQoKSAtICQoXCIjc2Nyb2xsYmFyIC5oYW5kbGVcIikuaGVpZ2h0KClcclxuICAgICAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgICAgICQoXCIuaGFuZGxlXCIpLmNzc1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogICAoJCh3aW5kb3cpLmhlaWdodCgpIC0gJChcIiNzY3JvbGxiYXIgLmhhbmRsZVwiKS5oZWlnaHQoKSkgLSAxXHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICQoXCIuaGFuZGxlXCIpLmNzc1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogZS5wYWdlWSAtIEBvZmZzZXRZXHJcblxyXG5cclxuICAgICAgICAgICAgQHBvc2l0aW9uID0gcGFyc2VJbnQoJChcIiNzY3JvbGxiYXIgLmhhbmRsZVwiKS5jc3MoXCJ0b3BcIikpIC8gKCQod2luZG93KS5oZWlnaHQoKSAtICQoXCIjc2Nyb2xsYmFyIC5oYW5kbGVcIikuaGVpZ2h0KCkpXHJcblxyXG4gICAgICAgICAgICBpZiBAcG9zaXRpb24gPCBwYXJzZUZsb2F0KC4wMDUpXHJcbiAgICAgICAgICAgICAgICBAcG9zaXRpb24gPSAwXHJcbiAgICAgICAgICAgIGVsc2UgaWYgQHBvc2l0aW9uID4gcGFyc2VGbG9hdCguOTk1KVxyXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uID0gMVxyXG5cclxuXHJcbiAgICAgICAgICAgIEB0cmlnZ2VyIFwiY3VzdG9tU2Nyb2xsXCIgLCBAcG9zaXRpb25cclxuICAgICAgICAgIFxyXG4gICBcclxuICAgICAgICBpZiBAbW91c2VYIGlzbnQgZS5jbGllbnRYIGFuZCBAbW91c2VZIGlzbnQgZS5jbGllbnRZXHJcbiAgICAgICAgICAgIEBzaG93U2Nyb2xsYmFyKClcclxuICAgICAgICAgICAgQGhpZGVTY3JvbGxiYXIoKVxyXG5cclxuICAgICAgICBAbW91c2VYID0gZS5jbGllbnRYXHJcbiAgICAgICAgQG1vdXNlWSA9IGUuY2xpZW50WVxyXG5cclxuICAgIG9uUmVzaXplOiAoZSkgPT5cclxuXHJcblxyXG4gICAgICAgIEAkZWwuZmluZCgnLmhhbmRsZScpLmNzc1xyXG4gICAgICAgICAgICBoZWlnaHQ6ICgkKHdpbmRvdykuaGVpZ2h0KCkgLyAkKFwic2VjdGlvblwiKS5oZWlnaHQoKSApICogJCh3aW5kb3cpLmhlaWdodCgpXHJcblxyXG4gICAgICAgIEB1cGRhdGVIYW5kbGUoQHBvc2l0aW9uKVxyXG5cclxuXHJcbiAgICBoaWRlU2Nyb2xsYmFyOiA9PlxyXG4gICAgICAgIGlmIEBoaWRlVGltZW91dD9cclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KEBoaWRlVGltZW91dClcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgQGhpZGVUaW1lb3V0ID0gc2V0VGltZW91dCAoPT5cclxuICAgICAgICAgICAgaWYgQG1vdXNlWSA+IDcyXHJcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC50byBAJGVsLCAuNSAsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0b0FscGhhOiAwXHJcbiAgICAgICAgICAgICkgLCAyMDAwXHJcbiAgICAgICAgXHJcblxyXG4gICAgc2hvd1Njcm9sbGJhcjogPT5cclxuICAgICAgICBUd2Vlbk1heC50byBAJGVsICwgLjUgLFxyXG4gICAgICAgICAgICBhdXRvQWxwaGE6IC41XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2Nyb2xsQmFyIiwiXHJcblxyXG5jbGFzcyBTaGFyZXJcclxuXHJcbiAgICBcclxuICAgIFNoYXJlci5pbml0RmFjZWJvb2sgPSAtPlxyXG4gICAgICAgIEZCLmluaXQgXHJcbiAgICAgICAgICAgIGFwcElkOlwiMjE1MjI0NzA1MzA3MzQxXCJcclxuICAgICAgICAgICAgY2hhbm5lbFVybDpcIi9jaGFubmVsLmh0bWxcIlxyXG4gICAgICAgICAgICBzdGF0dXM6IHRydWVcclxuICAgICAgICAgICAgeGZibDogdHJ1ZVxyXG5cclxuXHJcbiAgICAgICAgXHJcbiAgICBcclxuICAgIFNoYXJlci5zaGFyZVR3aXR0ZXIgPSAoc2hhcmVNZXNzYWdlLCAgdXJsLCBoYXNodGFncykgLT5cclxuICAgICAgICB0ZXh0ID0gc2hhcmVNZXNzYWdlXHJcbiAgICAgICAgaGFzaHRhZ3MgPSBcIlwiXHJcbiAgICAgICAgdXJsID0gdXJsXHJcbiAgICAgICAgdHdVUkwgPSBcImh0dHBzOi8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodGV4dCkgKyBcIiZ1cmw9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodXJsKVxyXG4gICAgICAgIHN0ciArPSBcIiZoYXNodGFncz1cIiArIGhhc2h0YWdzICBpZiBoYXNodGFnc1xyXG4gICAgICAgIEBvcGVuUG9wdXAgNTc1LCA0MjAsIHR3VVJMLCBcIlR3aXR0ZXJcIlxyXG5cclxuICAgIFNoYXJlci5zaGFyZUZhY2Vib29rID0gKG5hbWUsICBjYXB0aW9uICxkZXNjcmlwdGlvbiAsIGxpbmsgLCBwaWN0dXJlKSAtPlxyXG5cclxuICAgICAgICBGQi51aVxyXG4gICAgICAgICAgICBtZXRob2Q6XCJmZWVkXCJcclxuICAgICAgICAgICAgbGluazpsaW5rXHJcbiAgICAgICAgICAgIHBpY3R1cmU6cGljdHVyZVxyXG4gICAgICAgICAgICBuYW1lOiBuYW1lXHJcbiAgICAgICAgICAgIGNhcHRpb246Y2FwdGlvblxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjpkZXNjcmlwdGlvblxyXG4gICAgICAgIFxyXG5cclxuICAgIFNoYXJlci5zaGFyZUdvb2dsZSA9ICh1cmwpIC0+XHJcblxyXG4gICAgICAgIEBvcGVuUG9wdXAgNjAwLCA0MDAgLCBcImh0dHBzOi8vcGx1cy5nb29nbGUuY29tL3NoYXJlP3VybD1cIit1cmwsIFwiR29vZ2xlXCJcclxuXHJcbiAgICBTaGFyZXIuc2hhcmVQaW50ZXJlc3QgPSAodXJsICwgZGVzY3JpcHRpb24sIHBpY3R1cmUpIC0+XHJcblxyXG4gICAgICAgIGRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24uc3BsaXQoXCIgXCIpLmpvaW4oXCIrXCIpXHJcbiAgICAgICAgQG9wZW5Qb3B1cCA3ODAsIDMyMCwgXCJodHRwOi8vcGludGVyZXN0LmNvbS9waW4vY3JlYXRlL2J1dHRvbi8/dXJsPSN7ZW5jb2RlVVJJQ29tcG9uZW50KHVybCl9JmFtcDtkZXNjcmlwdGlvbj0je2Rlc2NyaXB0aW9ufSZhbXA7bWVkaWE9I3tlbmNvZGVVUklDb21wb25lbnQocGljdHVyZSl9XCJcclxuXHJcblxyXG4gICAgU2hhcmVyLmVtYWlsTGluayA9IChzdWJqZWN0LCBib2R5KSAtPlxyXG4gICAgICAgIHggPSBAb3BlblBvcHVwIDEgLCAxLCBcIm1haWx0bzomc3ViamVjdD0je2VuY29kZVVSSUNvbXBvbmVudChzdWJqZWN0KX0mYm9keT0je2VuY29kZVVSSUNvbXBvbmVudChib2R5KX1cIlxyXG4gICAgICAgIHguY2xvc2UoKVxyXG5cclxuICAgIFNoYXJlci5vcGVuUG9wdXAgPSAodywgaCwgdXJsLCBuYW1lKSAtPlxyXG4gICAgICAgIHdpbmRvdy5vcGVuIHVybCwgbmFtZSwgXCJzdGF0dXM9MSx3aWR0aD1cIiArIHcgKyBcIixoZWlnaHQ9XCIgKyBoICsgXCIsbGVmdD1cIiArIChzY3JlZW4ud2lkdGggLSB3KSAvIDIgKyBcIix0b3A9XCIgKyAoc2NyZWVuLmhlaWdodCAtIGgpIC8gMlxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2hhcmVyIl19
