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



},{"../pages/animations/clouds.coffee":6,"../plugins/HeaderAnimation.coffee":12,"../util/ScrollBar.coffee":19,"./ViewBase.coffee":3}],2:[function(require,module,exports){
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



},{"../util/Sharer.coffee":20}],4:[function(require,module,exports){
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



},{"../plugins/BasicOverlay.coffee":9,"../plugins/SvgInject.coffee":15}],5:[function(require,module,exports){
var AnimationBase, DraggableGallery, FadeGallery, FrameAnimation, HeaderAnimation, OurParks, ParksList, ResizeButtons, animations, globalAnimations,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AnimationBase = require("../abstract/AnimationBase.coffee");

ParksList = require('../plugins/ParksList.coffee');

DraggableGallery = require('../plugins/DraggableGallery.coffee');

FadeGallery = require('../plugins/FadeGallery.coffee');

HeaderAnimation = require('../plugins/HeaderAnimation.coffee');

ResizeButtons = require('../plugins/ResizeButtons.coffee');

FrameAnimation = require('../plugins/coasters/FrameAnimation.coffee');

animations = require('./animations/ourparks.coffee');

globalAnimations = require('./animations/global.coffee');

OurParks = (function(superClass) {
  extend(OurParks, superClass);

  function OurParks(el) {
    this.resetTimeline = bind(this.resetTimeline, this);
    this.totalAnimationTime = 25;
    OurParks.__super__.constructor.call(this, el);
  }

  OurParks.prototype.initialize = function() {
    return OurParks.__super__.initialize.call(this);
  };

  OurParks.prototype.initComponents = function() {
    var coaster, resizebuttons;
    OurParks.__super__.initComponents.call(this);
    if (!this.isPhone) {
      resizebuttons = new ResizeButtons;
      coaster = new FrameAnimation({
        id: "parks-coaster-1",
        el: "#parks-section1",
        baseUrl: this.cdnRoot + "coasters/",
        url: "shot-2/data.json"
      });
      coaster.loadFrames();
      this.parkGallery = new DraggableGallery({
        el: "#our-parks-gallery",
        across: 1
      });
      this.parksGallery1 = new FadeGallery({
        el: "#our-parks-gallery"
      });
    } else {
      this.parkGallery = new DraggableGallery({
        el: "#our-parks-gallery",
        across: 1
      });
    }
    this.parks = new ParksList({
      el: "#our-parks-logos",
      gallery: this.parkGallery
    });
    this.parkGallery.goto(this.parks.selectedLogo(), true);
    return this.parkGallery.parkList = this.parks;
  };

  OurParks.prototype.resetTimeline = function() {
    OurParks.__super__.resetTimeline.call(this);
    this.parallax.push(globalAnimations.clouds("#section1", 0, 1, this.isTablet ? 1 : 5));
    if (!this.isPhone) {
      this.triggers.push(animations.topHeadline());
      this.triggers.push(animations.scrollCircle());
      this.triggers.push(animations.selectBox());
      return this.triggers.push(animations.parksCarousel());
    }
  };

  return OurParks;

})(AnimationBase);

module.exports = OurParks;



},{"../abstract/AnimationBase.coffee":1,"../plugins/DraggableGallery.coffee":10,"../plugins/FadeGallery.coffee":11,"../plugins/HeaderAnimation.coffee":12,"../plugins/ParksList.coffee":13,"../plugins/ResizeButtons.coffee":14,"../plugins/coasters/FrameAnimation.coffee":17,"./animations/global.coffee":7,"./animations/ourparks.coffee":8}],6:[function(require,module,exports){
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



},{}],7:[function(require,module,exports){
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



},{}],8:[function(require,module,exports){
var global;

global = require('./global.coffee');

module.exports.topHeadline = function() {
  var $el, tween;
  $el = $('#our-parks .inner-title-header');
  tween = new TimelineMax;
  tween.add(TweenMax.fromTo($el.find('h1'), .35, {
    y: -10,
    alpha: 0
  }, {
    y: 0,
    alpha: 1
  }), 0.5);
  tween.add(TweenMax.fromTo($el.find('p'), .35, {
    y: -10,
    alpha: 0
  }, {
    y: 0,
    alpha: 1
  }), "-=.2");
  return {
    a: tween,
    offset: $el.offset().top
  };
};

module.exports.scrollCircle = function() {
  var $el, tween;
  $el = $("#our-parks .circ-btn-wrapper");
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
  $el = $('#our-parks.section-inner #select');
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

module.exports.parksCarousel = function() {
  var $el, arrow, distance, i, j, len, ref, tween;
  $el = $('#our-parks-gallery');
  tween = new TimelineMax;
  tween.add(TweenMax.fromTo($el.find('.swiper-container'), .35, {
    alpha: 0
  }, {
    alpha: 1
  }), 0.5);
  ref = $el.find('.gal-arrow');
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    arrow = ref[i];
    if (i % 2 === 0) {
      distance = -20;
    } else {
      distance = 20;
    }
    tween.add(TweenMax.fromTo($(arrow), .35, {
      x: distance,
      alpha: 0
    }, {
      x: 0,
      alpha: 1
    }), 0);
  }
  tween.paused(true);
  return {
    a: tween,
    offset: $el.offset().top
  };
};



},{"./global.coffee":7}],9:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":2}],10:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":2,"../abstract/ViewBase.coffee":3}],11:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":2,"./VideoOverlay.coffee":16}],12:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":2,"../global/index.coffee":4}],13:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":2,"./VideoOverlay.coffee":16}],14:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":2}],15:[function(require,module,exports){
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



},{}],16:[function(require,module,exports){
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



},{}],17:[function(require,module,exports){
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



},{"../../abstract/PluginBase.coffee":2,"./FramesModel.coffee":18}],18:[function(require,module,exports){
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



},{}],19:[function(require,module,exports){
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



},{"../abstract/ViewBase.coffee":3}],20:[function(require,module,exports){
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



},{}],21:[function(require,module,exports){
var DraggableGallery, OurParksPage, ParksList, wglobals;

wglobals = require('./com/global/index.coffee');

ParksList = require('./com/plugins/ParksList.coffee');

DraggableGallery = require('./com/plugins/DraggableGallery.coffee');

OurParksPage = require('./com/pages/OurParksPage.coffee');

$(document).ready(function() {
  var ourparks;
  return ourparks = new OurParksPage({
    el: "body"
  });
});



},{"./com/global/index.coffee":4,"./com/pages/OurParksPage.coffee":5,"./com/plugins/DraggableGallery.coffee":10,"./com/plugins/ParksList.coffee":13}]},{},[21])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvQW5pbWF0aW9uQmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvVmlld0Jhc2UuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL2dsb2JhbC9pbmRleC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvT3VyUGFya3NQYWdlLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wYWdlcy9hbmltYXRpb25zL2Nsb3Vkcy5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvYW5pbWF0aW9ucy9nbG9iYWwuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BhZ2VzL2FuaW1hdGlvbnMvb3VycGFya3MuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvQmFzaWNPdmVybGF5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0RyYWdnYWJsZUdhbGxlcnkuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvRmFkZUdhbGxlcnkuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvSGVhZGVyQW5pbWF0aW9uLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL1BhcmtzTGlzdC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9SZXNpemVCdXR0b25zLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL1N2Z0luamVjdC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9WaWRlb092ZXJsYXkuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvY29hc3RlcnMvRnJhbWVBbmltYXRpb24uY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvY29hc3RlcnMvRnJhbWVzTW9kZWwuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3V0aWwvU2Nyb2xsQmFyLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS91dGlsL1NoYXJlci5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9vdXJwYXJrcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNDQSxJQUFBLDJEQUFBO0VBQUE7OzZCQUFBOztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsbUJBQVIsQ0FBWCxDQUFBOztBQUFBLFNBQ0EsR0FBWSxPQUFBLENBQVEsMEJBQVIsQ0FEWixDQUFBOztBQUFBLGVBRUEsR0FBa0IsT0FBQSxDQUFRLG1DQUFSLENBRmxCLENBQUE7O0FBQUEsTUFHQSxHQUFTLE9BQUEsQ0FBUSxtQ0FBUixDQUhULENBQUE7O0FBQUE7QUFRSSxtQ0FBQSxDQUFBOztBQUFhLEVBQUEsdUJBQUMsRUFBRCxHQUFBO0FBQ1QseURBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEseUNBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsSUFBQSwrQ0FBTSxFQUFOLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQURaLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FGVixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLENBSGQsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLGtCQUFELEdBQXlCLElBQUMsQ0FBQSxRQUFKLEdBQWtCLEVBQWxCLEdBQTBCLENBSmhELENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxZQUFELEdBQWdCLENBTGhCLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FOYixDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsZUFBRCxHQUFtQixDQVBuQixDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsRUFSdEIsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CLENBVHBCLENBQUE7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QUFQLEVBQVksSUFBWixHQUFBO1dBQ2YsTUFBTSxDQUFDLElBQVAsQ0FBWSxHQUFaLEVBQWlCLElBQWpCLEVBQXVCLGlCQUFBLEdBQW9CLENBQXBCLEdBQXdCLFVBQXhCLEdBQXFDLENBQXJDLEdBQXlDLFFBQXpDLEdBQW9ELENBQUMsTUFBTSxDQUFDLEtBQVAsR0FBZSxDQUFoQixDQUFBLEdBQXFCLENBQXpFLEdBQTZFLE9BQTdFLEdBQXVGLENBQUMsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBakIsQ0FBQSxHQUFzQixDQUFwSSxFQURlO0VBQUEsQ0EzQ25CLENBQUE7O2dCQUFBOztJQUhKLENBQUE7O0FBQUEsTUFrRE0sQ0FBQyxPQUFQLEdBQWlCLE1BbERqQixDQUFBOzs7OztBQ0ZBLElBQUEsbURBQUE7O0FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSwyQkFBUixDQUFYLENBQUE7O0FBQUEsU0FDQSxHQUFZLE9BQUEsQ0FBUSxnQ0FBUixDQURaLENBQUE7O0FBQUEsZ0JBRUEsR0FBbUIsT0FBQSxDQUFRLHVDQUFSLENBRm5CLENBQUE7O0FBQUEsWUFHQSxHQUFlLE9BQUEsQ0FBUSxpQ0FBUixDQUhmLENBQUE7O0FBQUEsQ0FNQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEtBQVosQ0FBa0IsU0FBQSxHQUFBO0FBSWQsTUFBQSxRQUFBO1NBQUEsUUFBQSxHQUFlLElBQUEsWUFBQSxDQUNYO0FBQUEsSUFBQSxFQUFBLEVBQUksTUFBSjtHQURXLEVBSkQ7QUFBQSxDQUFsQixDQU5BLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5WaWV3QmFzZSA9IHJlcXVpcmUgXCIuL1ZpZXdCYXNlLmNvZmZlZVwiXG5TY3JvbGxCYXIgPSByZXF1aXJlIFwiLi4vdXRpbC9TY3JvbGxCYXIuY29mZmVlXCJcbkhlYWRlckFuaW1hdGlvbiA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvSGVhZGVyQW5pbWF0aW9uLmNvZmZlZSdcbmNsb3VkcyA9IHJlcXVpcmUgJy4uL3BhZ2VzL2FuaW1hdGlvbnMvY2xvdWRzLmNvZmZlZSdcblxuY2xhc3MgQW5pbWF0aW9uQmFzZSBleHRlbmRzIFZpZXdCYXNlXG5cblxuICAgIGNvbnN0cnVjdG9yOiAoZWwpIC0+XG4gICAgICAgIHN1cGVyKGVsKVxuICAgICAgICBAdGltZWxpbmUgPSBudWxsXG4gICAgICAgIEB0b3VjaFkgPSAwXG4gICAgICAgIEB0b3VjaFlMYXN0ID0gMFxuICAgICAgICBAZ2xvYmFsU2Nyb2xsQW1vdW50ID0gaWYgQGlzVGFibGV0IHRoZW4gLjUgZWxzZSAxXG4gICAgICAgIEBwcmV2U2Nyb2xsVG8gPSAwXG4gICAgICAgIEBwcmV2RGVsdGEgPSAwXG4gICAgICAgIEBjdXJyZW50UHJvZ3Jlc3MgPSAwXG4gICAgICAgIEB0b3RhbEFuaW1hdGlvblRpbWUgPSAxMFxuICAgICAgICBAc21vb3RoTXVsdGlwbGllciA9IDVcbiAgICAgICAgQG5hdlRpbWVyID0gbnVsbFxuICAgICAgICBAdmlkZW8gPSBudWxsXG4gICAgICAgIEBpbmxpbmVWaWRlbyA9IG51bGxcbiAgICAgICAgQGlzVGFibGV0ID0gJCgnaHRtbCcpLmhhc0NsYXNzKCd0YWJsZXQnKVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIGlmICFAaXNQaG9uZSAgXG4gICAgICAgICAgICBAcmVzZXRUaW1lbGluZSgpXG4gICAgICAgICAgICBAdG9nZ2xlVG91Y2hNb3ZlKClcbiAgICAgICAgICAgIEBvblJlc2l6ZSgpXG4gICAgICAgICAgICBAdXBkYXRlVGltZWxpbmUoKVxuXG4gICAgaW5pdENvbXBvbmVudHM6IC0+XG4gICAgICAgIEBoZWFkZXIgPSBuZXcgSGVhZGVyQW5pbWF0aW9uIFxuICAgICAgICAgICAgZWw6J2hlYWRlcidcblxuICAgIFxuXG5cbiAgICB0b2dnbGVUb3VjaE1vdmU6ICgpID0+XG4gICAgICAgICQoZG9jdW1lbnQpLm9mZiAnc2Nyb2xsJyAsIEBvblNjcm9sbFxuICAgICAgICBcbiAgICAgICAgQHNjcm9sbCA9XG4gICAgICAgICAgICBwb3NpdGlvbjogMFxuICAgICAgICAgICAgc2Nyb2xsVG9wOiAwXG4gICAgICAgICQoZG9jdW1lbnQpLnNjcm9sbCBAb25TY3JvbGxcbiAgICAgICAgQG9uU2Nyb2xsKClcblxuXG4gICAgZ2V0U2Nyb2xsYWJsZUFyZWE6IC0+XG4gICAgICAgIE1hdGguYWJzKCQoXCIjY29udGVudFwiKS5vdXRlckhlaWdodCgpIC0gQHN0YWdlSGVpZ2h0KVxuICAgIFxuICAgIGdldFNjcm9sbFRvcDogLT5cbiAgICAgICAgJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkgLyBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAgICAgXG4gICAgXG4gICAgXG4gICAgc2V0U2Nyb2xsVG9wOiAocGVyKSAtPiAgICAgIFxuICAgICAgICBwb3MgPSBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAqIHBlclxuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8gMCAsIHBvc1xuXG5cbiAgICBzZXREcmFnZ2FibGVQb3NpdGlvbjogKHBlcikgLT4gICAgICAgIFxuICAgICAgICBwb3MgPSBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAqIHBlciAgICAgICAgXG4gICAgICAgIFR3ZWVuTWF4LnNldCAkKFwiI2NvbnRlbnRcIikgLFxuICAgICAgICAgICAgeTogLXBvcyBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgb25TY3JvbGw6IChlKSA9PlxuICAgICAgICBpZiAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSA+IDMwXG4gICAgICAgICAgICAkKCcuY2lyYy1idG4td3JhcHBlcicpLmFkZENsYXNzICdpbnZpc2libGUnXG4gICAgICAgICAgICBcbiAgICAgICAgQHNjcm9sbC5wb3NpdGlvbiA9IEBnZXRTY3JvbGxUb3AoKVxuICAgICAgICBAc2Nyb2xsLnNjcm9sbFRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpXG4gICAgICAgIEB1cGRhdGVUaW1lbGluZSgpICAgICAgICBcbiAgICAgICAgXG5cbiAgICBvbkRyYWc6IChlKSA9PlxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEBzY3JvbGwucG9zaXRpb24gPSBNYXRoLmFicyBAc2Nyb2xsLnkgLyAgQGdldFNjcm9sbGFibGVBcmVhKClcbiAgICAgICAgQHNjcm9sbC5zY3JvbGxUb3AgPSAtQHNjcm9sbC55XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVUaW1lbGluZSgpXG5cblxuICAgIG9uUmVzaXplOiA9PlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIGlmICFAaXNUYWJsZXRcbiAgICAgICAgICAgIEByZXNldFRpbWVsaW5lKClcbiAgICAgICAgICAgIFxuICAgICAgICBAY2VudGVyT2Zmc2V0ID0gKEBzdGFnZUhlaWdodCAqIC42NjY3KVxuICAgICAgICBpZiBAc2Nyb2xsP1xuICAgICAgICAgICAgcG9zID0gQHNjcm9sbC5wb3NpdGlvbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHRvZ2dsZVRvdWNoTW92ZSgpXG4gICAgICAgICAgICBpZiAhQGlzVGFibGV0XG4gICAgICAgICAgICAgICAgQHNldFNjcm9sbFRvcChwb3MpXG4gICAgICAgICAgICBcblxuICAgIHJlc2V0VGltZWxpbmU6ID0+XG4gICAgICAgIEB0aW1lbGluZSA9IG5ldyBUaW1lbGluZU1heFxuICAgICAgICBAdHJpZ2dlcnMgPSBbXVxuICAgICAgICBAcGFyYWxsYXggPSBbXVxuXG4gICAgICAgICQoJ1tkYXRhLWNsb3VkXScpLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgICRlbCA9ICQodClcbiAgICAgICAgICAgICRjbG9zZXN0Q29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJ1tkYXRhLWNsb3VkLWNvbnRhaW5lcl0nKVxuICAgICAgICAgICAgaW5pdFBvcyA9ICRjbG9zZXN0Q29udGFpbmVyLmRhdGEoKS5jbG91ZENvbnRhaW5lci5pbml0UG9zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2xvdWRGdW5jdGlvbiA9IGNsb3Vkc1xuICAgICAgICAgICAgICAgICRlbDokZWxcblxuICAgICAgICAgICAgaWYgaW5pdFBvcyBcbiAgICAgICAgICAgICAgICBjbG91ZEZ1bmN0aW9uKGluaXRQb3MpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAcGFyYWxsYXgucHVzaCBjbG91ZEZ1bmN0aW9uXG5cbiAgICB1cGRhdGVUaW1lbGluZTogPT5cbiAgICAgICAgXG4gICAgICAgIEBoZWFkZXIuYW5pbWF0ZUhlYWRlcihAc2Nyb2xsLnNjcm9sbFRvcClcblxuICAgICAgICBmb3IgdCBpbiBAdHJpZ2dlcnNcbiAgICAgICAgICAgIGlmIEBzY3JvbGwuc2Nyb2xsVG9wID4gdC5vZmZzZXQgLSBAY2VudGVyT2Zmc2V0XG4gICAgICAgICAgICAgICAgdC5hLnBsYXkoKVxuICAgICAgICAgICAgZWxzZSBpZiBAc2Nyb2xsLnNjcm9sbFRvcCArIEBzdGFnZUhlaWdodCA8IHQub2Zmc2V0XG4gICAgICAgICAgICAgICAgdC5hLnBhdXNlZCh0cnVlKVxuICAgICAgICAgICAgICAgIHQuYS5zZWVrKDApXG5cblxuICAgICAgICBmb3IgcCBpbiBAcGFyYWxsYXhcbiAgICAgICAgICAgIHAoQHNjcm9sbC5wb3NpdGlvbilcblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25CYXNlXG4iLCJjbGFzcyBQbHVnaW5CYXNlIGV4dGVuZHMgRXZlbnRFbWl0dGVyXG5cblxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIEAkZWwgPSBpZiBvcHRzLmVsPyB0aGVuICQgb3B0cy5lbFxuXG4gICAgICAgIEBpbml0aWFsaXplKG9wdHMpXG5cblxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cbiAgICAgICAgQGFkZEV2ZW50cygpXG5cbiAgICBhZGRFdmVudHM6IC0+XG5cblxuXG4gICAgcmVtb3ZlRXZlbnRzOiAtPlxuXG5cbiAgICBkZXN0cm95OiAtPlxuICAgICAgICBAcmVtb3ZlRXZlbnRzKClcblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsdWdpbkJhc2VcblxuIiwiXG5TaGFyZXIgPSByZXF1aXJlIFwiLi4vdXRpbC9TaGFyZXIuY29mZmVlXCIgXG5cblxuY2xhc3MgVmlld0Jhc2UgZXh0ZW5kcyBFdmVudEVtaXR0ZXJcblxuXG5cblxuXG4gICAgY29uc3RydWN0b3I6IChlbCkgLT5cblxuICAgICAgICBAJGVsID0gJChlbClcbiAgICAgICAgQGlzVGFibGV0ID0gJChcImh0bWxcIikuaGFzQ2xhc3MoXCJ0YWJsZXRcIilcbiAgICAgICAgQGlzUGhvbmUgPSAkKFwiaHRtbFwiKS5oYXNDbGFzcyhcInBob25lXCIpXG4gICAgICAgIEBjZG5Sb290ID0gJCgnYm9keScpLmRhdGEoJ2NkbicpIG9yIFwiL1wiXG4gICAgICAgICQod2luZG93KS5vbiBcInJlc2l6ZS5hcHBcIiAsIEBvblJlc2l6ZVxuXG4gICAgICAgIEBzdGFnZUhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICBAc3RhZ2VXaWR0aCA9ICQod2luZG93KS53aWR0aCgpXG4gICAgICAgIEBtb3VzZVggPSAwXG4gICAgICAgIEBtb3VzZVkgPSAwXG5cbiAgICAgICAgI0BkZWxlZ2F0ZUV2ZW50cyhAZ2VuZXJhdGVFdmVudHMoKSlcbiAgICAgICAgQGluaXRpYWxpemUoKVxuXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBAaW5pdENvbXBvbmVudHMoKVxuXG4gICAgaW5pdENvbXBvbmVudHM6IC0+XG5cbiAgICBvblJlc2l6ZTogPT5cbiAgICAgICAgQHN0YWdlSGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXG4gICAgICAgIEBzdGFnZVdpZHRoID0gJCh3aW5kb3cpLndpZHRoKClcblxuXG4gICAgZ2VuZXJhdGVFdmVudHM6IC0+XG4gICAgICAgIHJldHVybiB7fVxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld0Jhc2VcbiIsIkJhc2ljT3ZlcmxheSA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvQmFzaWNPdmVybGF5LmNvZmZlZSdcblN2Z0luamVjdCA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvU3ZnSW5qZWN0LmNvZmZlZSdcblxuXG5cbmlmIHdpbmRvdy5jb25zb2xlIGlzIHVuZGVmaW5lZCBvciB3aW5kb3cuY29uc29sZSBpcyBudWxsXG4gIHdpbmRvdy5jb25zb2xlID1cbiAgICBsb2c6IC0+XG4gICAgd2FybjogLT5cbiAgICBmYXRhbDogLT5cblxuXG5cbiQoZG9jdW1lbnQpLnJlYWR5IC0+XG4gICAgIyQoJy5zdmctaW5qZWN0Jykuc3ZnSW5qZWN0KClcbiAgICAjbmV3IFN2Z0luamVjdCBcIi5zdmctaW5qZWN0XCJcbiAgICBcbiAgICBiYXNpY092ZXJsYXlzID0gbmV3IEJhc2ljT3ZlcmxheVxuICAgICAgICBlbDogJCgnI2NvbnRlbnQnKVxuXG5cbiAgICAkKCcuc2Nyb2xsdG8nKS5jbGljayAtPlxuICAgICAgIHQgPSAkKHRoaXMpLmRhdGEoJ3RhcmdldCcpXG4gICAgICAgJCgnYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiAkKCcjJyt0KS5vZmZzZXQoKS50b3AgLSA3MCAjIDcwIGZvciB0aGUgY29sbGFwc2VkIGhlYWRlclxuICAgICAgICB9KTtcblxuICAgICNpZiB3aW5kb3cuZGRscz9cbiAgICAjIGNvbnNvbGUubG9nICdjbGlja3knXG4gICAgJCh3aW5kb3cpLmNsaWNrIC0+XG4gICAgICAgIGlmIHdpbmRvdy5kZGxzP1xuICAgICAgICAgICAgJC5lYWNoIHdpbmRvdy5kZGxzLCAoaSwgdCkgLT5cbiAgICAgICAgICAgICAgICBpZiB0LmlzT3BlbiBhbmQgbm90IHQuaXNIb3ZlcmVkXG4gICAgICAgICAgICAgICAgICAgIHQuY2xvc2VNZW51KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAkKCdbZGF0YS1kZXB0aF0nKS5lYWNoIC0+XG4gICAgICAgICRlbCA9ICQoQClcbiAgICAgICAgZGVwdGggPSAkZWwuZGF0YSgpLmRlcHRoXG4gICAgICAgIFxuICAgICAgICAkZWwuY3NzKCd6LWluZGV4JywgZGVwdGgpXG4gICAgICAgIFR3ZWVuTWF4LnNldCAkZWwgLCBcbiAgICAgICAgICAgIHo6IGRlcHRoICogMTBcblxuXG5cbiAgICAkKCdib2R5Jykub24gJ0RPTU5vZGVJbnNlcnRlZCcsICAtPlxuICAgICAgICAkKCdhJykuZWFjaCAtPiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGhyZWYgPSAkKEApLmF0dHIoJ2hyZWYnKVxuICAgICAgICAgICAgaWYgaHJlZj9cbiAgICAgICAgICAgICAgICBocmVmID0gaHJlZi50cmltKClcbiAgICAgICAgICAgICAgICBpZiBocmVmLmluZGV4T2YoJ2h0dHA6Ly8nKSBpcyAwIG9yIGhyZWYuaW5kZXhPZignaHR0cHM6Ly8nKSBpcyAwIG9yIGhyZWYuaW5kZXhPZignLnBkZicpIGlzIChocmVmLmxlbmd0aCAtIDQpXG4gICAgICAgICAgICAgICAgICAgICQoQCkuYXR0cigndGFyZ2V0JywgJ19ibGFuaycpXG5cblxuICAgICQoJy5jaXJjbGUsIC5jaXJjbGUtb3V0ZXInKS5vbignbW91c2VlbnRlcicsIC0+XG4gICAgICAgIFR3ZWVuTWF4LnRvKCQodGhpcyksIC4zNSxcbiAgICAgICAgICAgIHNjYWxlOiAxLjA1LFxuICAgICAgICAgICAgZWFzZTogUG93ZXIyLmVhc2VPdXRcbiAgICAgICAgKVxuICAgIClcblxuICAgICQoJy5jaXJjbGUsIC5jaXJjbGUtb3V0ZXInKS5vbignbW91c2VsZWF2ZScsIC0+XG4gICAgICAgIFR3ZWVuTWF4LnRvKCQodGhpcyksIC4zNSxcbiAgICAgICAgICAgIHNjYWxlOiAxLFxuICAgICAgICAgICAgZWFzZTogUG93ZXIyLmVhc2VPdXRcbiAgICAgICAgKVxuICAgIClcblxuICAgICQoJyNqb2JzLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXIgbGknKS5vbignbW91c2VlbmV0ZXInLCAtPlxuICAgICAgICBjb25zb2xlLmxvZyAnaGVsbG8nXG4gICAgKVxuXG5cbiMgdGhpcyBpcyBzaGl0dHksIGJ1dCBpdCdzIG15IG9ubHkgd29ya2Fyb3VuZCBmb3IgdGhlIGNsaXBwaW5nIGlzc3VlIChDRi0xNzEpXG5kb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSAtPlxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlIGlzICdjb21wbGV0ZScpXG4gICAgICAgIHNldFRpbWVvdXQoLT5cbiAgICAgICAgICAgICQoJy5xdW90ZScpLmFkZENsYXNzKCdrZWVwaXRhaHVuZHJlZCcpXG4gICAgICAgICwgMjAwKVxuIiwiQW5pbWF0aW9uQmFzZSA9IHJlcXVpcmUgXCIuLi9hYnN0cmFjdC9BbmltYXRpb25CYXNlLmNvZmZlZVwiXG5QYXJrc0xpc3QgPSByZXF1aXJlICcuLi9wbHVnaW5zL1BhcmtzTGlzdC5jb2ZmZWUnXG5EcmFnZ2FibGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9EcmFnZ2FibGVHYWxsZXJ5LmNvZmZlZSdcbkZhZGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9GYWRlR2FsbGVyeS5jb2ZmZWUnXG5IZWFkZXJBbmltYXRpb24gPSByZXF1aXJlICcuLi9wbHVnaW5zL0hlYWRlckFuaW1hdGlvbi5jb2ZmZWUnXG5SZXNpemVCdXR0b25zID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9SZXNpemVCdXR0b25zLmNvZmZlZSdcbkZyYW1lQW5pbWF0aW9uID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9jb2FzdGVycy9GcmFtZUFuaW1hdGlvbi5jb2ZmZWUnXG5hbmltYXRpb25zID0gcmVxdWlyZSAnLi9hbmltYXRpb25zL291cnBhcmtzLmNvZmZlZSdcbmdsb2JhbEFuaW1hdGlvbnMgPSByZXF1aXJlICcuL2FuaW1hdGlvbnMvZ2xvYmFsLmNvZmZlZSdcbiAgICAgICAgXG5cbmNsYXNzIE91clBhcmtzIGV4dGVuZHMgQW5pbWF0aW9uQmFzZVxuXG5cbiAgICBjb25zdHJ1Y3RvcjogKGVsKSAtPlxuICAgICAgICBAdG90YWxBbmltYXRpb25UaW1lID0gMjVcbiAgICAgICAgc3VwZXIoZWwpXG4gICAgICAgIFxuIFxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgIHN1cGVyKClcblxuICAgIGluaXRDb21wb25lbnRzOiAtPlxuICAgICAgICBzdXBlcigpXG5cbiAgICAgICAgaWYgIUBpc1Bob25lXG4gICAgICAgICAgICByZXNpemVidXR0b25zID0gbmV3IFJlc2l6ZUJ1dHRvbnNcblxuICAgICAgICAgICAgY29hc3RlciA9IG5ldyBGcmFtZUFuaW1hdGlvblxuICAgICAgICAgICAgICAgIGlkOlwicGFya3MtY29hc3Rlci0xXCJcbiAgICAgICAgICAgICAgICBlbDpcIiNwYXJrcy1zZWN0aW9uMVwiXG4gICAgICAgICAgICAgICAgYmFzZVVybDogXCIje0BjZG5Sb290fWNvYXN0ZXJzL1wiXG4gICAgICAgICAgICAgICAgdXJsOiBcInNob3QtMi9kYXRhLmpzb25cIlxuXG4gICAgICAgICAgICBjb2FzdGVyLmxvYWRGcmFtZXMoKVxuXG4gICAgICAgICAgICBAcGFya0dhbGxlcnkgPSBuZXcgRHJhZ2dhYmxlR2FsbGVyeVxuICAgICAgICAgICAgICAgIGVsOiBcIiNvdXItcGFya3MtZ2FsbGVyeVwiXG4gICAgICAgICAgICAgICAgYWNyb3NzOiAxXG5cbiAgICAgICAgICAgIEBwYXJrc0dhbGxlcnkxID0gbmV3IEZhZGVHYWxsZXJ5XG4gICAgICAgICAgICAgICAgZWw6IFwiI291ci1wYXJrcy1nYWxsZXJ5XCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZWxzZVxuXG4gICAgICAgICAgICBAcGFya0dhbGxlcnkgPSBuZXcgRHJhZ2dhYmxlR2FsbGVyeVxuICAgICAgICAgICAgICAgIGVsOiBcIiNvdXItcGFya3MtZ2FsbGVyeVwiXG4gICAgICAgICAgICAgICAgYWNyb3NzOiAxXG5cblxuICAgICAgICBAcGFya3MgPSBuZXcgUGFya3NMaXN0XG4gICAgICAgICAgICBlbDogXCIjb3VyLXBhcmtzLWxvZ29zXCJcbiAgICAgICAgICAgIGdhbGxlcnk6IEBwYXJrR2FsbGVyeVxuXG4gICAgICAgIEBwYXJrR2FsbGVyeS5nb3RvIEBwYXJrcy5zZWxlY3RlZExvZ28oKSwgdHJ1ZVxuICAgICAgICBAcGFya0dhbGxlcnkucGFya0xpc3QgPSBAcGFya3NcbiAgICAgICAgXG4gICAgcmVzZXRUaW1lbGluZTogPT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIEBwYXJhbGxheC5wdXNoIGdsb2JhbEFuaW1hdGlvbnMuY2xvdWRzKFwiI3NlY3Rpb24xXCIsIDAgLCAxICwgaWYgQGlzVGFibGV0IHRoZW4gMSBlbHNlIDUpXG5cbiAgICAgICAgaWYgIUBpc1Bob25lXG4gICAgICAgICAgICBAdHJpZ2dlcnMucHVzaCBhbmltYXRpb25zLnRvcEhlYWRsaW5lKClcbiAgICAgICAgICAgIEB0cmlnZ2Vycy5wdXNoIGFuaW1hdGlvbnMuc2Nyb2xsQ2lyY2xlKClcbiAgICAgICAgICAgIEB0cmlnZ2Vycy5wdXNoIGFuaW1hdGlvbnMuc2VsZWN0Qm94KClcbiAgICAgICAgICAgIEB0cmlnZ2Vycy5wdXNoIGFuaW1hdGlvbnMucGFya3NDYXJvdXNlbCgpXG4gICAgIyAgICAgICAgQHRyaWdnZXJzLnB1c2ggYW5pbWF0aW9ucy5wYXJrc0Nhcm91c2VsQXJyb3dzKClcbiAgICBcblxuIFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBPdXJQYXJrc1xuXG5cbiIsIlxuY2xvdWRzT25VcGRhdGUgPSAoZWwsIGR1cmF0aW9uKSAtPlxuICAgIHdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICBcbiAgICBUd2Vlbk1heC5zZXQgZWwsXG4gICAgICAgIHg6IC0yMDUwXG4gICAgICAgIFxuICAgIFR3ZWVuTWF4LnRvIGVsLCBkdXJhdGlvbiAsIFxuICAgICAgICB4OiB3aW5kb3dXaWR0aFxuICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgY2xvdWRzT25VcGRhdGUgZWwgLCBkdXJhdGlvblxuICAgICAgICBcblxuXG5zZXRCb2JpbmcgPSAoJGVsICwgZHVyLGRlbGF5KSAtPlxuICAgIFxuICAgIEBpc1RhYmxldCA9ICQoJ2h0bWwnKS5oYXNDbGFzcyAndGFibGV0J1xuICAgIHdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgXG4gICAgaWYgd2luZG93LmlubmVyV2lkdGggPiA3NjcgJiYgIUBpc1RhYmxldFxuXG4jICAgICAgICBkID0gKCh3aW5kb3cuaW5uZXJXaWR0aCArIDE1NTApIC8gd2luZG93LmlubmVyV2lkdGgpICogMTgwXG4gICAgICAgIGQgPSAzMDAgLSAoJGVsLmRhdGEoJ2Nsb3VkJykuc3BlZWQgKiAyNTApXG4gICAgICAgIFxuICAgICAgICBUd2Vlbk1heC50byAkZWwgLCBkdXIgLCBcbiAgICAgICAgICAgIHg6IHdpZHRoXG4gICAgICAgICAgICBkZWxheTpkZWxheVxuICAgICAgICAgICAgZWFzZTpMaW5lYXIuZWFzZU5vbmVcbiAgICAgICAgICAgIG9uVXBkYXRlUGFyYW1zOiBbXCJ7c2VsZn1cIl1cbiAgICAgICAgICAgIG9uQ29tcGxldGU6ICh0d2VlbikgPT5cbiAgICAgICAgICAgICAgICBjbG91ZHNPblVwZGF0ZSAkZWwgLCBkXG5cblxuXG5zZXRSZWdpc3RyYXRpb24gPSAoJGVsLCByZWdpc3RyYXRpb24pIC0+XG4gICAgXG4gICAgdmFsdWVzID0gcmVnaXN0cmF0aW9uLnNwbGl0KFwifFwiKVxuICAgIFxuICAgIHZpZXdwb3J0V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIHNldHRpbmdzID0ge31cbiAgICBcbiAgICBhbGlnbiA9IHZhbHVlc1swXVxuICAgIG9mZnNldCA9IHBhcnNlSW50KHZhbHVlc1sxXSkgb3IgMFxuXG4gICAgc3dpdGNoIGFsaWduXG4gICAgICAgIHdoZW4gJ2xlZnQnXG4gICAgICAgICAgICBzZXR0aW5ncy54ID0gMCArIG9mZnNldFxuICAgICAgICB3aGVuICdyaWdodCdcbiAgICAgICAgICAgIHNldHRpbmdzLnggPSB2aWV3cG9ydFdpZHRoICsgb2Zmc2V0ICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgd2hlbiAnY2VudGVyJ1xuICAgICAgICAgICAgc2V0dGluZ3MueCA9ICh2aWV3cG9ydFdpZHRoKi41IC0gJGVsLndpZHRoKCkqLjUpICsgb2Zmc2V0ICAgIFxuICAgIFxuICAgIFR3ZWVuTWF4LnNldCAkZWwgLCBzZXR0aW5nc1xuICAgIFxuICAgIFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSAob3B0aW9ucykgLT5cbiAgICBcbiAgICAkZWwgPSBvcHRpb25zLiRlbFxuICAgICRjb250YWluZXIgPSAkZWwuY2xvc2VzdCgnW2RhdGEtY2xvdWQtY29udGFpbmVyXScpICAgIFxuICAgIGNvbnRhaW5lclRvcFBhZGRpbmcgPSBwYXJzZUludCgkY29udGFpbmVyLmNzcygncGFkZGluZy10b3AnKSlcbiAgICBcbiAgICBcbiAgICB0cnkgICAgICAgIFxuICAgICAgICBjbG91ZERhdGEgPSAkZWwuZGF0YSgpLmNsb3VkXG4gICAgICAgXG4gICAgY2F0Y2ggZVxuICAgICAgICBjb25zb2xlLmVycm9yIFwiQ2xvdWQgRGF0YSBQYXJzZSBFcnJvcjogSW52YWxpZCBKU09OXCIgICAgICAgIFxuICAgICAgICBcbiAgICBjbG91ZERlcHRoID0gJGVsLmRhdGEoJ2RlcHRoJylcbiAgICBjbG91ZFNwZWVkID0gY2xvdWREYXRhLnNwZWVkIG9yIDFcbiAgICBjbG91ZE9mZnNldE1pbiA9IHBhcnNlSW50KGNsb3VkRGF0YS5vZmZzZXRNaW4pIG9yIDBcbiAgICBjbG91ZFJldmVyc2UgPSBjbG91ZERhdGEucmV2ZXJzZSBvciBmYWxzZVxuICAgIGNsb3VkUmVnaXN0cmF0aW9uID0gY2xvdWREYXRhLnJlZ2lzdGVyIG9yIFwiY2VudGVyXCJcblxuXG4gICAgXG4gICAgc2V0UmVnaXN0cmF0aW9uICRlbCAsIGNsb3VkUmVnaXN0cmF0aW9uXG4gICAgaWYgISgkY29udGFpbmVyLmhhc0NsYXNzKCdzcGxhc2gtY29udGFpbmVyJykpXG4gICAgICAgIG9mZkxlZnQgPSAkZWwub2Zmc2V0KCkubGVmdFxuICAgICAgICBkaXN0YW5jZSA9ICh3aW5kb3cuaW5uZXJXaWR0aCAtIG9mZkxlZnQpIC8gd2luZG93LmlubmVyV2lkdGhcbiMgICAgICAgIHBlcmNlbnRhZ2UgPSBkaXN0YW5jZSAqIDE4MCBcbiAgICAgICAgcGVyY2VudGFnZSA9IDI1MCAtIChjbG91ZFNwZWVkICogMjAwKVxuICAgICAgICBcbiAgICAgICAgc2V0Qm9iaW5nICRlbCwgcGVyY2VudGFnZSwgY2xvdWRTcGVlZC81XG4gXG4gICAgbWluWSA9ICRjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgbWF4WSA9ICQoZG9jdW1lbnQpLm91dGVySGVpZ2h0KClcbiAgICB0b3RhbFJhbmdlPSAkY29udGFpbmVyLm91dGVySGVpZ2h0KClcbiAgICBcbiAgICBcbiAgICBcbiAgICBwZXJjZW50YWdlUmFuZ2UgPSB0b3RhbFJhbmdlL21heFlcbiAgICBtaW5SYW5nZVBlcmNlbnRhZ2UgPSBtaW5ZL21heFkgICAgXG4gICAgbWF4UmFuZ2VQZXJjZW50YWdlID0gbWluUmFuZ2VQZXJjZW50YWdlICsgcGVyY2VudGFnZVJhbmdlXG5cbiMgICAgY29uc29sZS5sb2cgbWluUmFuZ2VQZXJjZW50YWdlICwgbWF4UmFuZ2VQZXJjZW50YWdlXG5cblxuICAgIGxhc3RTY3JvbGxQZXJjZW50YWdlID0gcHJlc2VudFNjcm9sbFBlcmNlbnRhZ2UgPSBzY3JvbGxEZWx0YSA9IDBcblxuICAgIGlmICgkY29udGFpbmVyLmhhc0NsYXNzKCdzcGxhc2gtY29udGFpbmVyJykgJiYgJCgnaHRtbCcpLmhhc0NsYXNzKCd0YWJsZXQnKSlcbiAgICAgICAgJGNvbnRhaW5lci5oaWRlKClcbiAgICAgICAgXG4gICAgXG4gICAgcmV0dXJuIChwb3MpIC0+XG4gICAgICAgIGlmICgoJGNvbnRhaW5lci5oYXNDbGFzcygnc3BsYXNoLWNvbnRhaW5lcicpKSAmJiAoJCgnaHRtbCcpLmhhc0NsYXNzKCd0YWJsZXQnKSkpXG4gICAgICAgICAgICBUd2Vlbk1heC50byAkZWwgLCAwLjI1ICxcbiAgICAgICAgICAgICAgICBlYXNlOlNpbmUuZWFzZU91dFxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNsb3VkUG9zaXRpb25QZXJjZW50YWdlID0gKHBvcyAtIG1pblJhbmdlUGVyY2VudGFnZSkgLyAobWF4UmFuZ2VQZXJjZW50YWdlIC0gbWluUmFuZ2VQZXJjZW50YWdlKVxuICAgICAgICAgICAgaWYgMCA8PSBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZSA8PSAxXG4gICAgICAgICAgICAgICAgcHJlc2VudFNjcm9sbFBlcmNlbnRhZ2UgPSBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZVxuICAgICAgICAgICAgICAgIGlmIGNsb3VkUmV2ZXJzZSAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZSA9IDEgLSBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNsb3VkWSA9ICh0b3RhbFJhbmdlICogY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2UpICogY2xvdWRTcGVlZFxuICAgICAgICAgICAgICAgIGNsb3VkWSA9IGNsb3VkWSAtIGNvbnRhaW5lclRvcFBhZGRpbmdcbiAgICAgICAgICAgICAgICBjbG91ZFkgPSBjbG91ZFkgKyBjbG91ZE9mZnNldE1pblxuICAgIFxuICAgICAgICAgICAgICAgICNNYXliZSB1c2UgdGhpcz9cbiAgICAgICAgICAgICAgICBzY3JvbGxEZWx0YSA9IE1hdGguYWJzKGxhc3RTY3JvbGxQZXJjZW50YWdlIC0gcHJlc2VudFNjcm9sbFBlcmNlbnRhZ2UpICogM1xuICAgIFxuICAgICAgICAgICAgICAgIGxhc3RTY3JvbGxQZXJjZW50YWdlID0gcHJlc2VudFNjcm9sbFBlcmNlbnRhZ2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgVHdlZW5NYXgudG8gJGVsICwgMC4yNSAsIFxuICAgICAgICAgICAgICAgICAgICB5OmNsb3VkWVxuICAgICAgICAgICAgICAgICAgICBlYXNlOlNpbmUuZWFzZU91dFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgIFxuIiwiXG5cbiNDb3VudFxuY29tbWFzID0gKHgpIC0+XG4gIHgudG9TdHJpbmcoKS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCBcIixcIilcblxuXG5tb2R1bGUuZXhwb3J0cy5jb3VudCA9IChlbCkgLT5cbiAgICBcbiAgICBcbiAgICAkZWwgPSAkKGVsKVxuICAgIHRhcmdldFZhbCA9ICQoZWwpLmh0bWwoKVxuICAgIG51bSA9ICQoZWwpLnRleHQoKS5zcGxpdCgnLCcpLmpvaW4oJycpXG5cbiAgICBzdGFydCA9IG51bSAqIC45OTk1XG4gICAgY2hhbmdlID0gbnVtICogLjAwMDVcbiAgICBcbiAgICB0bCA9IG5ldyBUaW1lbGluZU1heFxuICAgICAgICBvblN0YXJ0OiAtPlxuICAgICAgICAgICAgJGVsLmh0bWwoXCI0MlwiKVxuICAgICAgICBvbkNvbXBsZXRlOiAtPlxuICAgICAgICAgICAgJGVsLmh0bWwodGFyZ2V0VmFsKVxuICAgICAgICAgICAgXG4gICAgdHdlZW5zID0gW11cblxuICAgICAgICBcblxuICAgIHR3ZWVucy5wdXNoIFR3ZWVuTWF4LmZyb21UbyAkZWwgLCAwLjI1LCAgICAgICAgXG4gICAgICAgIGF1dG9BbHBoYTowXG4gICAgICAgIGltbWVkaWF0ZVJlbmRlcjp0cnVlXG4gICAgICAgIGVhc2U6UXVpbnQuZWFzZU91dFxuICAgICxcbiAgICAgICAgYXV0b0FscGhhOjFcblxuICAgIHR3ZWVucy5wdXNoIFR3ZWVuTWF4LnRvICRlbCAsIDEuNSwgXG4gICAgICAgIGVhc2U6UXVpbnQuZWFzZU91dFxuICAgICAgICBcbiAgICAgICAgb25VcGRhdGU6IC0+XG4gICAgICAgICAgICB2YWx1ZSA9IHBhcnNlSW50KHN0YXJ0ICsgcGFyc2VJbnQoY2hhbmdlICogQHByb2dyZXNzKCkpKVxuICAgICAgICAgICAgdmFsdWUgPSBjb21tYXModmFsdWUpXG4gICAgICAgICAgICBlbHMgPSB2YWx1ZS5zcGxpdCgnJylcbiAgICAgICAgICAgIGh0bWwgPSAnJ1xuICAgICAgICAgICAgJC5lYWNoIGVscywgKG5hbWUsIHZhbHVlKSAtPlxuICAgICAgICAgICAgICAgIGh0bWwgKz0gaWYgKHZhbHVlIGlzICcsJykgdGhlbiAnLCcgZWxzZSAnPHNwYW4+JyArIHZhbHVlICsgJzwvc3Bhbj4nXG4gICAgICAgICAgICAkZWwuaHRtbChodG1sKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICB0bC5hZGQgdHdlZW5zXG4gICAgXG4gICAgdGxcblxuI1Njcm9sbGluZ1xuXG5cblxudHdlZW5QYXJhbGxheCA9IChwb3MsdHdlZW4sbWluLG1heCxkdXIpIC0+XG5cblxuXG4gICAgcGVyY2VudCA9ICgocG9zLW1pbikgLyAobWF4LW1pbikpICogMVxuICAgIGFtb3VudCA9IHBlcmNlbnQgKiBkdXJcblxuXG5cbiAgICBpZiBwb3MgPD0gbWF4IGFuZCBwb3MgPj0gbWluXG4gICAgICAgICNjb25zb2xlLmxvZyBwZXJjZW50ICwgdHdlZW4ubnMubmFtZSAsIHBvc1xuICAgICAgICBpZiBNYXRoLmFicyhhbW91bnQgLSB0d2Vlbi50aW1lKCkpID49IC4wMDFcbiAgICAgICAgICAgIHR3ZWVuLnR3ZWVuVG8gIGFtb3VudCAsXG4gICAgICAgICAgICAgICAgb3ZlcndyaXRlOlwicHJlZXhpc3RpbmdcIixcbiAgICAgICAgICAgICAgICBlYXNlOlF1YWQuZWFzZU91dFxuXG5cbm1vZHVsZS5leHBvcnRzLmNsb3VkcyA9IChzZXRJZCwgbWluLCBtYXgsIGR1cikgLT5cblxuICAgIG1pblBvcyA9IG1pblxuICAgIG1heFBvcyA9IG1heFxuICAgIGR1cmF0aW9uID0gZHVyXG5cbiAgICAkZWwgPSAkKFwiLmNsb3VkcyN7c2V0SWR9XCIpXG4gICAgY2xvdWRzID0gJGVsLmZpbmQoXCIuY2xvdWRcIilcblxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgdHdlZW4ubnMgPSB7fVxuICAgIHR3ZWVuLm5zLm5hbWUgPSBzZXRJZFxuXG4gICAgdHdlZW5zID0gW11cbiAgICBmb3IgY2xvdWQsaSBpbiBjbG91ZHNcbiAgICAgICAgb2Zmc2V0ID0gXCIrPSN7MjUwKihpKzEpfVwiXG5cblxuICAgICAgICB0d2VlbnMucHVzaCBUd2Vlbk1heC50byBjbG91ZCAsIGR1cmF0aW9uICxcbiAgICAgICAgICAgIHk6b2Zmc2V0XG5cblxuXG4gICAgdHdlZW4uYWRkIHR3ZWVuc1xuXG5cblxuICAgIHR3ZWVuLnBhdXNlZCh0cnVlKVxuICAgIHJldHVybiAocG9zKSAtPlxuICAgICAgICB0d2VlblBhcmFsbGF4IHBvcyAsIHR3ZWVuICwgbWluUG9zLCBtYXhQb3MsIGR1cmF0aW9uXG5cbm1vZHVsZS5leHBvcnRzLnNjcm9sbCA9IChtaW5Qb3MsIG1heFBvcywgZHVyYXRpb24sIGVsZW0pIC0+XG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuICAgIHR3ZWVuLm5zID0ge31cbiAgICB0d2Vlbi5ucy5uYW1lID0gXCIuc2Nyb2xsdG9cIlxuICAgIFxuICAgIHR3ZWVucyA9IFtdXG4gICAgdHdlZW5zLnB1c2ggVHdlZW5NYXgudG8gZWxlbSAsIGR1cmF0aW9uICwgb3BhY2l0eTowXG4gICAgXG4gICAgdHdlZW4uYWRkIHR3ZWVuc1xuICAgIFxuICAgIHR3ZWVuLnBhdXNlZCh0cnVlKVxuICAgIHJldHVybiAocG9zKSAtPlxuICAgICAgICB0d2VlblBhcmFsbGF4IHBvcyAsIHR3ZWVuICwgbWluUG9zLCBtYXhQb3MsIGR1cmF0aW9uXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMuYXJtcyA9IChtaW4sIG1heCwgZHVyKSAtPlxuXG4gICAgbWluUG9zID0gbWluXG4gICAgbWF4UG9zID0gbWF4XG4gICAgZHVyYXRpb24gPSBkdXJcblxuICAgIGFybSA9ICQoXCIuYXJtc1wiKVxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcbiAgICB0d2Vlbi5ucyA9IHt9XG4gICAgdHdlZW4ubnMubmFtZSA9IFwiLmFybXNcIlxuXG4gICAgdHdlZW5zID0gW11cbiAgICB0d2VlbnMucHVzaCBUd2Vlbk1heC50byBhcm0gLCBkdXJhdGlvbiAsIHRvcDowXG5cblxuXG4gICAgdHdlZW4uYWRkIHR3ZWVuc1xuXG5cblxuICAgIHR3ZWVuLnBhdXNlZCh0cnVlKVxuICAgIHJldHVybiAocG9zKSAtPlxuICAgICAgICB0d2VlblBhcmFsbGF4IHBvcyAsIHR3ZWVuICwgbWluUG9zLCBtYXhQb3MsIGR1cmF0aW9uXG4iLCJnbG9iYWwgPSByZXF1aXJlICcuL2dsb2JhbC5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzLnRvcEhlYWRsaW5lID0gKCkgLT5cbiAgICBcbiAgICAkZWwgPSAkKCcjb3VyLXBhcmtzIC5pbm5lci10aXRsZS1oZWFkZXInKVxuICAgIFxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZCgnaDEnKSwgLjM1ICxcbiAgICAgICAgeTogLTEwXG4gICAgICAgICxhbHBoYTogMFxuICAgICxcbiAgICAgICAgeTogMFxuICAgICAgICAsYWxwaGE6IDFcbiAgICApLCAwLjVcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLmZpbmQoJ3AnKSwgLjM1ICxcbiAgICAgICAgeTogLTEwXG4gICAgICAgICxhbHBoYTogMFxuICAgICxcbiAgICAgICAgeTogMFxuICAgICAgICAsYWxwaGE6IDFcbiAgICApLCBcIi09LjJcIlxuICAgIFxuICAgIFxuICAgIGE6IHR3ZWVuXG4gICAgb2Zmc2V0OiRlbC5vZmZzZXQoKS50b3BcblxuXG5cbm1vZHVsZS5leHBvcnRzLnNjcm9sbENpcmNsZSA9IC0+XG4gICAgJGVsID0gJChcIiNvdXItcGFya3MgLmNpcmMtYnRuLXdyYXBwZXJcIilcblxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG5cbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbC5maW5kKFwicFwiKSAsIC4zICxcbiAgICAgICAgYXV0b0FscGhhOjBcbiAgICAsXG4gICAgICAgIGF1dG9BbHBoYToxXG4gICAgKVxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZChcImFcIikgLCAuNDUgLFxuICAgICAgICBzY2FsZTowXG4gICAgICAgIHJvdGF0aW9uOjE4MFxuICAgICAgICBpbW1lZGlhdGVSZW5kZXI6dHJ1ZVxuICAgICxcbiAgICAgICAgc2NhbGU6MVxuICAgICAgICByb3RhdGlvbjowXG4gICAgICAgIGVhc2U6QmFjay5lYXNlT3V0XG4gICAgKSAsIFwiLT0uMlwiXG5cbiAgICBhOnR3ZWVuXG4gICAgb2Zmc2V0OiRlbC5vZmZzZXQoKS50b3BcbiAgICBcbiAgICBcbiAgICBcbm1vZHVsZS5leHBvcnRzLnNlbGVjdEJveCA9IC0+XG4gICAgJGVsID0gJCgnI291ci1wYXJrcy5zZWN0aW9uLWlubmVyICNzZWxlY3QnKVxuICAgIFxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwsIC4zNSwgXG4gICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgLHNjYWxlOiAuNzVcbiAgICAsXG4gICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgLHNjYWxlOiAxXG4gICAgKVxuXG4gICAgdHdlZW4ucGF1c2VkKHRydWUpXG4gICAgYTp0d2VlblxuICAgIG9mZnNldDokZWwub2Zmc2V0KCkudG9wXG4gICAgXG4gICAgXG4gICAgXG5tb2R1bGUuZXhwb3J0cy5wYXJrc0Nhcm91c2VsID0gKCkgLT5cbiAgICAkZWwgPSAkKCcjb3VyLXBhcmtzLWdhbGxlcnknKVxuICAgIFxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZCgnLnN3aXBlci1jb250YWluZXInKSwgLjM1ICxcbiAgICAgICAgYWxwaGE6IDBcbiAgICAsXG4gICAgICAgIGFscGhhOiAxXG4gICAgKSwgMC41XG5cbiAgICBmb3IgYXJyb3csaSBpbiAkZWwuZmluZCgnLmdhbC1hcnJvdycpXG4gICAgICAgIGlmIGklMiA9PSAwXG4gICAgICAgICAgICBkaXN0YW5jZSA9IC0yMFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkaXN0YW5jZSA9IDIwXG5cbiAgICAgICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkKGFycm93KSwgLjM1ICxcbiAgICAgICAgICAgIHg6IGRpc3RhbmNlXG4gICAgICAgICAgICAsYWxwaGE6IDBcbiAgICAgICAgLFxuICAgICAgICAgICAgeDogMFxuICAgICAgICAgICAgLGFscGhhOiAxXG4gICAgICAgICksIDBcblxuICAgIHR3ZWVuLnBhdXNlZCh0cnVlKVxuICAgIGE6dHdlZW5cbiAgICBvZmZzZXQ6JGVsLm9mZnNldCgpLnRvcFxuICAgIFxuICAgIFxuIiwiUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuXG5jbGFzcyBCYXNpY092ZXJsYXkgZXh0ZW5kcyBQbHVnaW5CYXNlXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgIyBAJGVsID0gJChlbClcbiAgICAgICAgQG92ZXJsYXlUcmlnZ2VycyA9ICQoJy5vdmVybGF5LXRyaWdnZXInKVxuICAgICAgICBAYWRkRXZlbnRzKClcblxuICAgICAgICBzdXBlcigpXG5cbiAgICBcbiAgICBhZGRFdmVudHM6IC0+XG5cbiAgICAgICAgJCgnI2Jhc2ljLW92ZXJsYXksICNvdmVybGF5LWJhc2ljLWlubmVyIC5vdmVybGF5LWNsb3NlJykuY2xpY2soQGNsb3NlT3ZlcmxheSk7XG4gICAgICAgIEBvdmVybGF5VHJpZ2dlcnMuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgJCh0KS5vbiAnY2xpY2snLCBAb3Blbk92ZXJsYXlcblxuICAgICAgICAjZ2xvYmFsIGJ1eSB0aWNrZXRzIGxpbmtzXG5cbiAgICAgICAgJCgnLm92ZXJsYXktY29udGVudCcpLm9uICdjbGljaycsICdsaScgLEBvcGVuTGlua1xuIyAgICAgICAgJCh3aW5kb3cpLm9uICdyZXNpemUnLCBAY2xvc2VPdmVybGF5XG4gICAgICAgIFxuICAgIG9wZW5MaW5rOiAoZSkgPT5cbiAgICAgICAgdGFyZ2V0ID0gJChlLnRhcmdldCkucGFyZW50cyAnLnBhcmsnXG4gICAgICAgIGlmIHRhcmdldC5kYXRhKCd0YXJnZXQnKVxuICAgICAgICAgICAgd2luZG93Lm9wZW4odGFyZ2V0LmRhdGEoJ3RhcmdldCcpKVxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgXG4gICAgY2xvc2VPdmVybGF5OiAoZSkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICEgKChlLnR5cGUgaXMgJ3Jlc2l6ZScpIGFuZCAoJCgnI292ZXJsYXkgdmlkZW86dmlzaWJsZScpLnNpemUoKSA+IDApKVxuICAgICAgICAgICAgJCgnLm92ZXJsYXktYmFzaWMnKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICB9LCAoKSAtPiBcbiAgICAgICAgICAgICAgICAkKCcub3ZlcmxheS1iYXNpYycpLmhpZGUoKVxuICAgICAgICAgICAgICAgICQoJyNvdmVybGF5JykuaGlkZSgpXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvcGVuT3ZlcmxheTogKHQpIC0+XG4gICAgICAgICRlbCA9ICQodGhpcylcbiAgICAgICAgb3ZlcmxheVNvdXJjZSA9ICRlbC5kYXRhKCdzb3VyY2UnKVxuICAgICAgICAkdGFyZ2V0RWxlbWVudCA9ICQoJyNvdmVybGF5LWJhc2ljLWlubmVyIC5vdmVybGF5LWNvbnRlbnQnKVxuICAgICAgICBpc05ld3MgPSAkZWwuaGFzQ2xhc3MoJ25ld3MnKVxuXG4gICAgICAgICQoJyNvdmVybGF5Jykuc2hvdygpXG4gICAgICAgIFxuICAgICAgICBpZiAkZWwuaGFzQ2xhc3MgJ29mZmVyaW5ncy1vcHRpb24nXG4gICAgICAgICAgICBvYyA9ICQoJyNvZmZlcmluZ3Mtb3ZlcmxheS1jb250ZW50JylcbiAgICAgICAgICAgIG9jLmZpbmQoJ2gxLnRpdGxlJykudGV4dCgkZWwuZmluZCgnc3Bhbi5vZmZlcicpLnRleHQoKSlcbiAgICAgICAgICAgIG9jLmZpbmQoJ2Rpdi5kZXNjcmlwdGlvbicpLmh0bWwoJGVsLmZpbmQoJ2Rpdi5kZXNjcmlwdGlvbicpLmh0bWwoKSlcbiAgICAgICAgICAgIG9jLmZpbmQoJy5jb250ZW50Lm1lZGlhJykuY3NzKHtiYWNrZ3JvdW5kSW1hZ2U6IFwidXJsKCdcIiArICRlbC5maW5kKCdzcGFuLm1lZGlhJykuZGF0YSgnc291cmNlJykgKyBcIicpXCJ9KVxuXG4gICAgICAgIFxuICAgICAgICBpZiAoJCgnIycgKyBvdmVybGF5U291cmNlKS5zaXplKCkgaXMgMSkgXG4gICAgICAgICAgICAjaHRtbCA9ICQoJyMnICsgb3ZlcmxheVNvdXJjZSkuaHRtbCgpXG5cbiAgICAgICAgICAgICR0YXJnZXRFbGVtZW50LmNoaWxkcmVuKCkuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgICAgICQodCkuYXBwZW5kVG8oJyNvdmVybGF5LWNvbnRlbnQtc291cmNlcycpXG5cbiAgICAgICAgICAgIGlmIGlzTmV3c1xuICAgICAgICAgICAgICAgIGMgPSAkZWwubmV4dCgnLmFydGljbGUnKS5jbG9uZSgpXG4gICAgICAgICAgICAgICAgJCgnI292ZXJsYXlfY29udGVudCcpLmh0bWwoYy5odG1sKCkpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcjJyArIG92ZXJsYXlTb3VyY2UpLmFwcGVuZFRvKCR0YXJnZXRFbGVtZW50KVxuXG4gICAgICAgICAgICAkZWwgPSAkKCcjb3ZlcmxheS1iYXNpYy1pbm5lcicpXG4gICAgICAgICAgICBpc1NtYWxsID0gJGVsLmhlaWdodCgpIDwgJCh3aW5kb3cpLmhlaWdodCgpIGFuZCAkKCR0YXJnZXRFbGVtZW50KS5maW5kKCcuc2VsZWN0LWJveC13cmFwcGVyJykuc2l6ZSgpIGlzIDBcbiAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKVxuICAgICAgICAgICAgYWRkdG9wID0gaWYgaXNTbWFsbCB0aGVuIDAgZWxzZSBzY3JvbGxUb3A7XG4gICAgICAgICAgICBwb3NpdGlvbiA9ICRlbC5jc3MgJ3Bvc2l0aW9uJywgaWYgaXNTbWFsbCB0aGVuICdmaXhlZCcgZWxzZSAnYWJzb2x1dGUnXG4gICAgICAgICAgICB0b3AgPSBNYXRoLm1heCgwLCAoKCQod2luZG93KS5oZWlnaHQoKSAtICRlbC5vdXRlckhlaWdodCgpKSAvIDIpICsgYWRkdG9wKVxuICAgICAgICAgICAgaWYgIWlzU21hbGwgYW5kICh0b3AgPCBzY3JvbGxUb3ApIHRoZW4gdG9wID0gc2Nyb2xsVG9wXG4gICAgICAgICAgICAkZWwuY3NzKFwidG9wXCIsIHRvcCArIFwicHhcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgaGVpZ2h0OlxuICAgICAgICAgICAgIyRlbC5jc3MoXCJsZWZ0XCIsIE1hdGgubWF4KDAsICgoJCh3aW5kb3cpLndpZHRoKCkgLSAkZWwub3V0ZXJXaWR0aCgpKSAvIDIpICsgYWRkbGVmdCkgKyBcInB4XCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcub3ZlcmxheS1iYXNpYycpLmNzcygnb3BhY2l0eScsIDApLmRlbGF5KDApLnNob3coKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgICAgICB9KVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzaWNPdmVybGF5XG5cblxuXG5cblxuXG4iLCJcblBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblZpZXdCYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvVmlld0Jhc2UuY29mZmVlJ1xuXG5jbGFzcyBEcmFnZ2FibGVHYWxsZXJ5IGV4dGVuZHMgUGx1Z2luQmFzZVxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cblxuICAgICAgICBAZ2FsbGVyeSA9IEAkZWwuZmluZCBcIi5zd2lwZXItY29udGFpbmVyXCJcblxuICAgICAgICBpZihAZ2FsbGVyeS5sZW5ndGggPCAxKVxuICAgICAgICAgICAgQGdhbGxlcnkgPSBAJGVsLmZpbHRlciBcIi5zd2lwZXItY29udGFpbmVyXCJcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBvcHRzLnBhZ2UgPT0gJ2pvYnMnXG4gICAgICAgICAgICBAam9ic1BhZ2UgPSB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBqb2JzUGFnZSA9IGZhbHNlXG5cbiAgICAgICAgQGdhbGxlcnlDcmVhdGVkID0gZmFsc2VcbiAgICAgICAgQGdhbGxlcnlDb250YWluZXIgPSBAZ2FsbGVyeS5maW5kKCd1bCcpXG4gICAgICAgIEBnYWxsZXJ5SXRlbXMgPSBAZ2FsbGVyeUNvbnRhaW5lci5maW5kKCdsaScpXG4gICAgICAgIEBjdXJyZW50SW5kZXggPSBAZ2FsbGVyeUl0ZW1zLmZpbHRlcignLnNlbGVjdGVkJykuZGF0YSgnaW5kZXgnKVxuICAgICAgICBAYWNyb3NzID0gb3B0cy5hY3Jvc3Mgb3IgMVxuICAgICAgICBAYW5nbGVMZWZ0ID0gQGdhbGxlcnkuZmluZCAnLmZhLWFuZ2xlLWxlZnQnXG4gICAgICAgIEBhbmdsZVJpZ2h0ID0gQGdhbGxlcnkuZmluZCAnLmZhLWFuZ2xlLXJpZ2h0J1xuICAgICAgICBAcGFnaW5hdGlvbiA9IG9wdHMucGFnaW5hdGlvbiBvciBmYWxzZVxuICAgICAgICBAY29udHJvbHMgPSBvcHRzLmNvbnRyb2wgb3IgbnVsbFxuICAgICAgICBAam9ic0Nhcm91c2VsU3RvcHBlZCA9IGZhbHNlXG4gICAgICAgIEBqb2JzQ2Fyb3VzZWxQYXVzZWQgPSBmYWxzZVxuICAgICAgICBAam9ic0ludGVydmFsID0gbnVsbFxuXG4gICAgICAgIEBzaXplQ29udGFpbmVyKClcblxuICAgICAgICBAYWRkQXJyb3dzKClcblxuICAgICAgICBzdXBlcigpXG5cbiAgICBhZGRFdmVudHM6IC0+XG4gICAgICAgICQod2luZG93KS5vbiAncmVzaXplJyAsIEBzaXplQ29udGFpbmVyXG5cbiAgICAgICAgJChAJGVsKS5vbiAnY2xpY2snLCAnLmZhLWFuZ2xlLWxlZnQnLCBAcHJldlNsaWRlXG4gICAgICAgICQoQCRlbCkub24gJ2NsaWNrJywgJy5mYS1hbmdsZS1yaWdodCcsIEBuZXh0U2xpZGVcbiAgICAgICAgaWYgQGpvYnNQYWdlID09IHRydWVcbiAgICAgICAgICAgICQoQCRlbCkub24gJ2NsaWNrJywgJy5zd2lwZXItY29udGFpbmVyJywgQHN0b3BKb2JzQ2Fyb3VzZWxcbiAgICAgICAgICAgICQoQCRlbCkub24gJ21vdXNlb3ZlcicsICcuc3dpcGVyLWNvbnRhaW5lcicsIEBwYXVzZUpvYnNDYXJvdXNlbFxuICAgICAgICAgICAgJChAJGVsKS5vbiAnbW91c2VsZWF2ZScsICcuc3dpcGVyLWNvbnRhaW5lcicsIEByZXN1bWVKb2JzQ2Fyb3VzZWxcbiAgICAgICAgICAgIFxuICAgICAgICBcbiAgICBzdG9wSm9ic0Nhcm91c2VsOiA9PlxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAam9ic0ludGVydmFsKVxuICAgICAgICBAam9ic0Nhcm91c2VsU3RvcHBlZCA9IHRydWVcblxuICAgIHBhdXNlSm9ic0Nhcm91c2VsOiA9PlxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAam9ic0ludGVydmFsKVxuICAgICAgICBAam9ic0Nhcm91c2VsUGF1c2VkID0gdHJ1ZVxuXG4gICAgcmVzdW1lSm9ic0Nhcm91c2VsOiA9PlxuICAgICAgICBpZiBAam9ic0Nhcm91c2VsU3RvcHBlZCA9PSBmYWxzZVxuICAgICAgICAgICAgQGpvYnNJbnRlcnZhbCA9IHNldEludGVydmFsICgtPlxuICAgICAgICAgICAgICAgICQoJyNqb2JzLWdhbGxlcnkgLmZhLWFuZ2xlLXJpZ2h0JykudHJpZ2dlcignY2xpY2snKVxuICAgICAgICAgICAgKSwgODAwMFxuICAgICAgICAgICAgQGpvYnNDYXJvdXNlbFBhdXNlZCA9IGZhbHNlXG5cbiAgICBwcmV2U2xpZGU6IChlKSA9PlxuICAgICAgICB0aGF0ID0gQG15U3dpcGVyXG4gICAgICAgIGdhbCA9IEBnYWxsZXJ5XG4gICAgICAgIFxuICAgICAgICBUd2Vlbk1heC50bygkKGdhbCksIC4yLCBcbiAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICAgIHNjYWxlOiAxLjFcbiAgICAgICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICAgICAgdGhhdC5zd2lwZVByZXYoKVxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnNldCgkKGdhbCksXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlOiAxXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvKCQoZ2FsKSwgLjM1LCBcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgICAgICAgICAgICBkZWxheTogLjM1XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICApXG4gICAgXG4gICAgbmV4dFNsaWRlOiAoZSkgPT5cbiAgICAgICAgdGhhdCA9IEBteVN3aXBlclxuICAgICAgICBnYWwgPSBAZ2FsbGVyeVxuXG4gICAgICAgIFR3ZWVuTWF4LnRvKCQoZ2FsKSwgLjIsXG4gICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICBzY2FsZTogMS4xXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgICAgIHRoYXQuc3dpcGVOZXh0KClcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC5zZXQoJChnYWwpLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogMC44NVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC50bygkKGdhbCksIC4zNSxcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogMVxuICAgICAgICAgICAgICAgICAgICBkZWxheTogLjM1XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICApXG5cblxuICAgIGFkZEFycm93czogLT5cbiAgICAgICAgQGlzUGhvbmUgPSAkKFwiaHRtbFwiKS5oYXNDbGFzcyhcInBob25lXCIpXG5cbiAgICAgICAgYXJyb3dMZWZ0ID0gJChcIjxpIGNsYXNzPSdnYWwtYXJyb3cgZmEgZmEtYW5nbGUtbGVmdCc+PC9pPlwiKVxuICAgICAgICBhcnJvd1JpZ2h0ID0gJChcIjxpIGNsYXNzPSdnYWwtYXJyb3cgZmEgZmEtYW5nbGUtcmlnaHQnPjwvaT5cIilcblxuICAgICAgICBAJGVsLmFwcGVuZChhcnJvd0xlZnQsIGFycm93UmlnaHQpXG5cbiAgICAgICAgJCgnLmdhbC1hcnJvdycpLm9uICdjbGljaycsIC0+XG4gICAgICAgICAgICAkKEApLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICB0aGF0ID0gJChAKVxuICAgICAgICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICAgICAgICAgICQodGhhdCkucmVtb3ZlQ2xhc3MgJ2FjdGl2ZScsIDEwMFxuICAgICAgICAgICAgXG5cbiAgICBzaXplQ29udGFpbmVyOiAoKSA9PlxuICAgICAgICBAZ2FsbGVyeUNvbnRhaW5lci5jc3MoJ3dpZHRoJywgXCIxMDAlXCIpXG4gICAgICAgIGlmIEBhY3Jvc3MgPCAyXG4gICAgICAgICAgICBAZ2FsbGVyeUl0ZW1zLmNzcygnd2lkdGgnICwgXCIxMDAlXCIpXG4gICAgICAgIGVsc2UgaWYgQGFjcm9zcyA8IDNcbiAgICAgICAgICAgIEBnYWxsZXJ5SXRlbXMuY3NzKCd3aWR0aCcgLCBcIjUwJVwiKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZ2FsbGVyeUl0ZW1zLmNzcygnd2lkdGgnICwgXCIzMy4zMzMzMzMlXCIpXG5cbiAgICAgICAgQGl0ZW1XaWR0aCA9IEBnYWxsZXJ5SXRlbXMuZmlyc3QoKS5vdXRlcldpZHRoKClcbiAgICAgICAgaXRlbUxlbmd0aCA9IEBnYWxsZXJ5SXRlbXMubGVuZ3RoXG5cbiAgICAgICAgQGdhbGxlcnlJdGVtcy5jc3MoJ3dpZHRoJywgQGl0ZW1XaWR0aClcbiAgICAgICAgQGdhbGxlcnlDb250YWluZXIuY3NzKCd3aWR0aCcsIGl0ZW1MZW5ndGggKiAoQGl0ZW1XaWR0aCkpXG4gICAgICAgIFR3ZWVuTWF4LnNldCBAZ2FsbGVyeUNvbnRhaW5lciAsXG4gICAgICAgICAgICB4OiAtQGN1cnJlbnRJbmRleCAqIEBpdGVtV2lkdGhcbiAgICAgICAgXG4gICAgICAgIGlmICFAZ2FsbGVyeUNyZWF0ZWQgICAgXG4gICAgICAgICAgICBAY3JlYXRlRHJhZ2dhYmxlKClcbiMgICAgICAgICAgICBAbXlTd2lwZXIuc3dpcGVOZXh0KClcbiAgICAgICAgXG4gICAgY3JlYXRlRHJhZ2dhYmxlOiAoKSAtPlxuICAgICAgICBpdGVtTGVuZ3RoID0gQGdhbGxlcnlJdGVtcy5sZW5ndGhcblxuICAgICAgICBpZiBAc2Nyb2xsIHRoZW4gQHNjcm9sbC5raWxsKClcblxuICAgICAgICBpZCA9ICQoQC4kZWwpLmF0dHIgJ2lkJ1xuXG5cbiAgICAgICAgaWYgQHBhZ2luYXRpb25cbiAgICAgICAgICAgIEBhZGRQYWdpbmF0aW9uKClcblxuICAgICAgICBpZiBAYWNyb3NzIDwgM1xuICAgICAgICAgICAgaWYgQHBhZ2luYXRpb25cbiAgICAgICAgICAgICAgICBAbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcjJyArIGlkICsgJyAuc3dpcGVyLWNvbnRhaW5lcicse1xuICAgICAgICAgICAgICAgICAgICBsb29wOnRydWUsXG4gICAgICAgICAgICAgICAgICAgIGdyYWJDdXJzb3I6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IEBhY3Jvc3MsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb246ICcjJyArIGlkICsgJyAuc3dpcGVyLXBhZ2luYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQXNSYW5nZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblRvdWNoRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZVN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyR3JvdXA6IEBhY3Jvc3NcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBteVN3aXBlciA9IG5ldyBTd2lwZXIoJyMnICsgaWQgKyAnIC5zd2lwZXItY29udGFpbmVyJyx7XG4gICAgICAgICAgICAgICAgICAgIGxvb3A6dHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZ3JhYkN1cnNvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogQGFjcm9zcyxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyR3JvdXA6IEBhY3Jvc3NcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblRvdWNoRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZVN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBteVN3aXBlciA9IG5ldyBTd2lwZXIoJyMnICsgaWQgKyAnIC5zd2lwZXItY29udGFpbmVyJyx7XG4gICAgICAgICAgICAgICAgbG9vcDp0cnVlLFxuICAgICAgICAgICAgICAgIGdyYWJDdXJzb3I6IHRydWUsXG4gICAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcbiAgICAgICAgICAgICAgICBzbGlkZXNQZXJHcm91cDogM1xuICAgICAgICAgICAgICAgIG9uVG91Y2hTdGFydDogQG9uU2xpZGVDaGFuZ2VTdGFydCxcbiAgICAgICAgICAgICAgICBvblRvdWNoRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlU3RhcnQ6IEBvblNsaWRlQ2hhbmdlU3RhcnQsXG4gICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZUVuZDogQG9uU2xpZGVDaGFuZ2VFbmQsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgIEBnYWxsZXJ5Q3JlYXRlZCA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIGlmIEBqb2JzUGFnZSA9PSB0cnVlXG4gICAgICAgICAgICBAam9ic0ludGVydmFsID0gc2V0SW50ZXJ2YWwgKC0+XG4gICAgICAgICAgICAgICAgJCgnI2pvYnMtZ2FsbGVyeSAuZmEtYW5nbGUtcmlnaHQnKS50cmlnZ2VyKCdjbGljaycpXG4gICAgICAgICAgICApLCA4MDAwXG5cbiAgICAgICAgXG4gICAgb25TbGlkZUNoYW5nZVN0YXJ0OiA9PlxuICAgICAgICAkKEAuJGVsKS5jbG9zZXN0KCcuYWRkLWJvcmRlci1mYWRlJykuYWRkQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICQoQC4kZWwpLmZpbmQoJy5hZGQtYm9yZGVyLWZhZGUnKS5hZGRDbGFzcyAnc2hvd2luZydcblxuICAgIG9uU2xpZGVDaGFuZ2VFbmQ6ID0+XG4gICAgICAgICQoQC4kZWwpLmNsb3Nlc3QoJy5hZGQtYm9yZGVyLWZhZGUnKS5yZW1vdmVDbGFzcyAnc2hvd2luZydcbiAgICAgICAgJChALiRlbCkuZmluZCgnLmFkZC1ib3JkZXItZmFkZScpLnJlbW92ZUNsYXNzICdzaG93aW5nJ1xuICAgICAgICBcbiAgICAgICAgaWYgIShAY29udHJvbHMgPT0gbnVsbClcbiAgICAgICAgICAgIHBhcmsgPSBAbXlTd2lwZXIuYWN0aXZlU2xpZGUoKS5kYXRhKCdpZCcpXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuc3dpcGVyLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuY2Fyb3VzZWwtd3JhcHBlcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSBkaXYjJyArIHBhcmspLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSBkaXYjJyArIHBhcmspLnBhcmVudCgpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgKEBwYXJrTGlzdClcbiAgICAgICAgICAgIEBwYXJrTGlzdC5zZWxlY3RMb2dvICQoQC4kZWwpLmZpbmQoJy5zd2lwZXItc2xpZGUtYWN0aXZlJykuZGF0YSgnaWQnKTtcblxuICAgIGFkZFBhZ2luYXRpb246ID0+XG4gICAgICAgIHdyYXBwZXIgPSAkKFwiPGRpdiBjbGFzcz0nc3dpcGVyLXBhZ2luYXRpb24nPjwvZGl2PlwiKVxuICAgICAgICAkKEAuJGVsKS5maW5kKCcuc3dpcGVyLWNvbnRhaW5lcicpLmFkZENsYXNzKCdhZGRQYWdpbmF0aW9uJykuYXBwZW5kKHdyYXBwZXIpXG5cblxuICAgIGdvdG86IChpZCwgaW5pdFZhbCkgLT5cblxuICAgICAgICBpZiBub3QgaW5pdFZhbCB0aGVuICQoJ2JvZHknKS5hbmltYXRlIHsgc2Nyb2xsVG9wOiAkKCcjJyArICgkKEAkZWwpLmF0dHIoJ2lkJykpKS5vZmZzZXQoKS50b3AgfVxuXG4gICAgICAgIHRvSW5kZXggPSAkKFwibGkucGFya1tkYXRhLWlkPScje2lkfSddXCIpLmRhdGEoJ2luZGV4JylcblxuICAgICAgICB0bCA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgICAgIHRsLmFkZCBUd2Vlbk1heC50byBAZ2FsbGVyeUNvbnRhaW5lciAsIC40LFxuICAgICAgICAgICAgYXV0b0FscGhhOjBcblxuICAgICAgICB0bC5hZGRDYWxsYmFjayA9PlxuICAgICAgICAgICAgQG15U3dpcGVyLnN3aXBlVG8odG9JbmRleCwgMClcblxuICAgICAgICB0bC5hZGQgVHdlZW5NYXgudG8gQGdhbGxlcnlDb250YWluZXIgLCAuNCxcbiAgICAgICAgICAgIGF1dG9BbHBoYToxXG5cbiAgICAgICAgQGN1cnJlbnRJbmRleCA9IHRvSW5kZXhcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdnYWJsZUdhbGxlcnlcblxuIiwiXG5QbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5WaWRlb092ZXJsYXkgPSByZXF1aXJlICcuL1ZpZGVvT3ZlcmxheS5jb2ZmZWUnXG5cbmNsYXNzIEZhZGVHYWxsZXJ5IGV4dGVuZHMgUGx1Z2luQmFzZVxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nICdpbml0aWFsaXplOiAnLCBvcHRzXG5cbiAgICAgICAgQHBhZ2UgPSBvcHRzLnBhZ2Ugb3IgbnVsbFxuICAgICAgICB0YXJnZXQgPSBvcHRzLnRhcmdldCBvciBudWxsXG4gICAgICAgIFxuICAgICAgICBpZiAodGFyZ2V0PylcbiAgICAgICAgICAgIEAkdGFyZ2V0ID0gJCh0YXJnZXQpXG4gICAgICAgIFxuICAgICAgICBpZiAhKEBwYWdlID09IG51bGwpXG4gICAgICAgICAgICBAaW5mb0JveGVzID0gQCRlbC5maW5kIFwibGkudmlkZW9cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAaW5mb0JveGVzID0gQCRlbC5maW5kIFwibGlcIlxuICAgICAgICAgICAgXG4gICAgICAgIEBjdXJyZW50U2VsZWN0ZWQgPSBAaW5mb0JveGVzLmZpbHRlcihcIjpmaXJzdC1jaGlsZFwiKVxuXG4gICAgICAgIHN1cGVyKClcbiAgICBcbiAgICBhZGRFdmVudHM6IC0+ICBcblxuICAgICAgICBAaW5mb0JveGVzLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgICRidG4gPSAkKHQpLmZpbmQoJy52aWRlby1idXR0b24nKVxuXG4gICAgICAgICAgICBpZiAkYnRuLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICB2aWRlb0V2ZW50cyA9IG5ldyBIYW1tZXIoJGJ0blswXSlcbiAgICAgICAgICAgICAgICB2aWRlb0V2ZW50cy5vbiAndGFwJyAsIEBoYW5kbGVWaWRlb0ludGVyYWN0aW9uXG5cblxuXG5cbiAgICBoYW5kbGVWaWRlb0ludGVyYWN0aW9uOiAoZSkgPT5cblxuICAgICAgICAkdGFyZ2V0ID0gJChlLnRhcmdldCkuY2xvc2VzdChcIi52aWRlby1idXR0b25cIilcbiAgICAgICAgaWYgKCR0YXJnZXQuc2l6ZSgpIGlzIDApIFxuICAgICAgICAgICAgJHRhcmdldCA9IGUudGFyZ2V0XG4gICAgICAgIFxuICAgICAgICBpZiAkdGFyZ2V0LmRhdGEoJ3R5cGUnKSA9PSAnaW1hZ2UnXG4gICAgICAgICAgICBpZiAoJHRhcmdldC5kYXRhKCdmdWxsJykpXG4gICAgICAgICAgICAgICAgQGltYWdlU3JjID0gJHRhcmdldC5kYXRhKCdmdWxsJylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAaW1hZ2VTcmMgPSAkdGFyZ2V0LmNoaWxkcmVuKCdpbWcnKS5hdHRyKCdzcmMnKVxuICAgICAgICBkYXRhID1cbiAgICAgICAgICAgIG1wNDokdGFyZ2V0LmRhdGEoJ21wNCcpXG4gICAgICAgICAgICB3ZWJtOiR0YXJnZXQuZGF0YSgnd2VibScpXG4gICAgICAgICAgICBwb3N0ZXI6QGltYWdlU3JjXG5cbiAgICAgICAgVmlkZW9PdmVybGF5LmluaXRWaWRlb092ZXJsYXkgZGF0YVxuXG5cbiAgICBnb3RvOiAoaWQsIGluaXRWYWwpIC0+XG4gICAgICAgIGluZm9JZCA9IFwiIyN7aWR9LWluZm9cIlxuXG4gICAgICAgIGlmICEoQHBhZ2UgPT0gbnVsbClcbiAgICAgICAgICAgIHRhcmdldCA9IEBpbmZvQm94ZXMucGFyZW50cygnbGkuZ3JvdXAtaW5mbycpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRhcmdldCA9IEBpbmZvQm94ZXNcbiAgICAgICAgXG5cbiAgICAgICAgI1N3aXRjaCBJbmZvIEJveGVzXG4gICAgICAgIHRsID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgICAgIHRsLmFkZCBUd2Vlbk1heC50byB0YXJnZXQgLCAuNCAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MFxuICAgICAgICAgICAgb3ZlcndyaXRlOlwiYWxsXCJcbiAgICAgICAgdGwuYWRkIFR3ZWVuTWF4LnRvIHRhcmdldC5maWx0ZXIoaW5mb0lkKSAsIC40ICxcbiAgICAgICAgICAgIGF1dG9BbHBoYToxXG5cblxuICAgICAgICBpZiAoQCR0YXJnZXQ/KVxuICAgICAgICAgICAgY29uc29sZS5sb2cgQCR0YXJnZXRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9wID0gQCR0YXJnZXQub2Zmc2V0KCkudG9wIC0gKCQoJ2hlYWRlcicpLmhlaWdodCgpKVxuICAgICAgICAgICAgY29uc29sZS5sb2cgdG9wXG4gICAgICAgICAgICBwb3MgPSAkKCdib2R5Jykuc2Nyb2xsVG9wKClcbiAgICAgICAgICAgIGlmIChwb3MgPCB0b3ApXG4gICAgICAgICAgICAgICAgJCgnYm9keScpLmFuaW1hdGUgeyBzY3JvbGxUb3A6IHRvcCB9XG4gIFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhZGVHYWxsZXJ5XG5cbiIsImdsb2JhbHMgPSByZXF1aXJlICcuLi9nbG9iYWwvaW5kZXguY29mZmVlJ1xuUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuXG5jbGFzcyBIZWFkZXJBbmltYXRpb24gZXh0ZW5kcyBQbHVnaW5CYXNlXG5cbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gIFxuICAgICAgICBAYm9keSA9ICQoXCJib2R5XCIpXG4gICAgICAgIEBodG1sID0gJChcImh0bWxcIilcbiAgICAgICAgQGNvbnRlbnQgPSAkKFwiI2NvbnRlbnRcIilcbiAgICAgICAgQG1vYm5hdiA9ICQoXCIjbW9iaWxlLWhlYWRlci1uYXZcIilcbiAgICAgICAgQHN1Ym5hdiA9ICQoXCIuc3VibmF2XCIpXG4gICAgICAgIEBzdWJuYXZTaG93aW5nID0gZmFsc2VcbiAgICAgICAgQG91clBhcmtzTGVmdCA9ICQoJy5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cIm91ci1wYXJrc1wiXScpLm9mZnNldCgpLmxlZnRcbiAgICAgICAgQHBhcnRuZXJzaGlwTGVmdCA9ICQoJy5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cInBhcnRuZXJzaGlwc1wiXScpLm9mZnNldCgpLmxlZnRcbiAgICAgICAgXG5cbiAgICAgICAgc3VwZXIob3B0cykgIFxuXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBzdXBlcigpICAgIFxuICAgICAgICBAc2hvd0luaXRpYWxTdWJOYXYoKSAgICAgICAgXG5cbiAgICBhZGRFdmVudHM6IC0+XG4gICAgICAgIGlmICEkKCdodG1sJykuaGFzQ2xhc3MgJ3RhYmxldCdcbiAgICAgICAgICAgICQoJy5uYXYtbGlzdCBhIGxpJykub24gJ21vdXNlZW50ZXInLCBAaGFuZGxlTmF2SG92ZXJcbiAgICAgICAgICAgICQoJ2hlYWRlcicpLm9uICdtb3VzZWxlYXZlJywgQGhpZGVTdWJOYXZcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5vbnJlc2l6ZSA9IEBoYW5kbGVSZXNpemVcbiAgICAgICAgQGJvZHkuZmluZChcIiNuYXZiYXItbWVudVwiKS5vbiAnY2xpY2snLCBAdG9nZ2xlTmF2XG4gICAgICAgICQoJyNtb2JpbGUtaGVhZGVyLW5hdiBhJykub24gJ2NsaWNrJywgQHNob3dNb2JpbGVTdWJOYXZcbiAgICAgICAgJCgnI21vYmlsZS1oZWFkZXItbmF2IGknKS5vbiAnY2xpY2snLCBAaGFuZGxlQXJyb3dDbGlja1xuICAgICAgICBcbiAgICAgICAgQGJvZHkuZmluZCgnLnRvZ2dsZS1uYXYnKS5vbiAnY2xpY2snLCAoKSAtPlxuICAgICAgICAgICAgJChAKS5wYXJlbnRzKCdoZWFkZXInKS5maW5kKCcjbmF2YmFyLW1lbnUgaW1nJykudHJpZ2dlcignY2xpY2snKVxuICAgICAgICAgICAgXG4gICAgICAgICQoJyNtb2JpbGUtaGVhZGVyLW5hdicpLm9uICdjbGljaycsICcubW9iaWxlLXN1Yi1uYXYgbGknLCBAb25DbGlja01vYmlsZVN1Yk5hdkxpbmtcbiAgICAgICAgXG4gICAgXG4gICAgaGFuZGxlU3ViTmF2OiA9PlxuICAgICAgICBzdGFydFBhZ2UgPSAkKCcuc3VibmF2JykuZGF0YSAncGFnZSdcbiAgICAgICAgaWQgPSAkKCcubmF2LWxpc3QgYVtkYXRhLXBhZ2Utc2hvcnQ9XCInICsgc3RhcnRQYWdlICsgJ1wiXScpLmRhdGEgJ3BhZ2UnXG4gICAgICAgIEBzaG93U3ViTmF2TGlua3MoaWQpXG4gICAgICAgIFxuICAgIHNob3dJbml0aWFsU3ViTmF2OiA9PlxuICAgICAgICBzZWN0aW9uID0gJCgnLnN1Ym5hdicpLmRhdGEgJ3BhZ2UnXG4gICAgICAgIFxuICAgICAgICBpZiBzZWN0aW9uID09ICdvZmZlcmluZ3MnIHx8IHNlY3Rpb24gPT0gJ2FjY29tbW9kYXRpb25zJyB8fCBzZWN0aW9uID09ICdvdXJwYXJrcydcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MoJ291ci1wYXJrcycpXG4gICAgICAgIGVsc2UgaWYgc2VjdGlvbiA9PSAncGFydG5lcnNoaXAtZGV0YWlscycgfHwgc2VjdGlvbiA9PSAncGFydG5lcnNoaXAnXG4gICAgICAgICAgICBAc2hvd1N1Yk5hdkxpbmtzKCdwYXJ0bmVyc2hpcHMnKVxuICAgICAgICBcbiAgICB0b2dnbGVOYXY6IChlKSA9PlxuICAgICAgICAgICAgICAgIFxuICAgIGhhbmRsZVJlc2l6ZTogPT5cbiAgICAgICAgQGhhbmRsZVN1Yk5hdigpXG4gICAgICAgIEBhZGp1c3RNb2JpbGVOYXYoKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgcG9zaXRpb25TdWJOYXZMaXN0czogPT5cbiAgICAgICAgI2NvbnNvbGUubG9nICdwb3NpdGlvblN1Yk5hdkxpc3RzJ1xuIyAgICAgICAgb3VyUGFya3NMZWZ0ID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwib3VyLXBhcmtzXCJdJykub2Zmc2V0KCkubGVmdFxuIyAgICAgICAgcGFydG5lcnNoaXBMZWZ0ID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwicGFydG5lcnNoaXBzXCJdJykub2Zmc2V0KCkubGVmdCAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgJCgnI2hlYWRlci10b3AnKS5oYXNDbGFzcyAnc21hbGwnXG4gICAgICAgICAgICBpZiB3aW5kb3cuaW5uZXJXaWR0aCA8IDk5M1xuICAgICAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAb3VyUGFya3NMZWZ0IC0gOTApXG4gICAgICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBwYXJ0bmVyc2hpcExlZnQgLSAxMzMpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgJCgnI291ci1wYXJrcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBvdXJQYXJrc0xlZnQgLSA5MClcbiAgICAgICAgICAgICAgICAkKCcjcGFydG5lcnNoaXBzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQHBhcnRuZXJzaGlwTGVmdCAtIDExOClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgd2luZG93LmlubmVyV2lkdGggPCA5OTNcbiAgICAgICAgICAgICAgICAkKCcjb3VyLXBhcmtzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQG91clBhcmtzTGVmdCAtIDYwKVxuICAgICAgICAgICAgICAgICQoJyNwYXJ0bmVyc2hpcHMtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAcGFydG5lcnNoaXBMZWZ0IC0gMTA1KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAb3VyUGFya3NMZWZ0IC0gNjApXG4gICAgICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBwYXJ0bmVyc2hpcExlZnQgLSA5MClcblxuICAgIGFuaW1hdGVIZWFkZXI6IChzY3JvbGxZKSA9PlxuICAgICAgICBpZiBAaHRtbC5oYXNDbGFzcyAncGhvbmUnXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAkaHQgPSBAJGVsLmZpbmQoJyNoZWFkZXItdG9wJylcbiAgICAgICAgJGhiID0gQCRlbC5maW5kKCcjaGVhZGVyLWJvdHRvbScpIFxuXG4gICAgICAgIGlmIHNjcm9sbFkgPiA4NSBcbiAgICAgICAgICAgIGlmICFAbmF2Q29sbGFwc2VkXG4gICAgICAgICAgICAgICAgJCgnI2hlYWRlci10b3AsICNoZWFkZXItYm90dG9tLCAjbmF2YmFyLWxvZ28sIC5uYXYtbGlzdCwgI2J1eSwgLmhlYWRlci1jb250YWN0LCAuaGVhZGVyLXNvY2lhbCcpLmFkZENsYXNzKCdzbWFsbCcpXG4gICAgICAgICAgICAgICAgQG5hdkNvbGxhcHNlZCA9IHRydWVcbiAgICAgICAgICAgICAgICBAcG9zaXRpb25TdWJOYXZMaXN0cygpIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBAbmF2Q29sbGFwc2VkXG4gICAgICAgICAgICAgICAgJCgnI2hlYWRlci10b3AsICNoZWFkZXItYm90dG9tLCAjbmF2YmFyLWxvZ28sIC5uYXYtbGlzdCwgI2J1eSwgLmhlYWRlci1jb250YWN0LCAuaGVhZGVyLXNvY2lhbCcpLnJlbW92ZUNsYXNzKCdzbWFsbCcpXG4gICAgICAgICAgICAgICAgQG5hdkNvbGxhcHNlZCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgQGhhbmRsZVN1Yk5hdigpXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uU3ViTmF2TGlzdHMoKSBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgIGhhbmRsZU5hdkhvdmVyOiAoZSkgPT5cbiAgICAgICAgcGFyZW50SUQgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5kYXRhKCdwYWdlJylcbiAgICAgICAgaWYgJCgnIycgKyBwYXJlbnRJRCArICctc3VibmF2LWxpc3QnKS5maW5kKCdhJykubGVuZ3RoIDwgMVxuICAgICAgICAgICAgQGhpZGVTdWJOYXYoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAaGlkZVN1Yk5hdkxpbmtzKClcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MocGFyZW50SUQpXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgIUBzdWJuYXZTaG93aW5nXG4gICAgICAgICAgICAgICAgQHNob3dTdWJOYXYoKVxuICAgICAgICAgICAgICBcbiAgICBzaG93U3ViTmF2OiA9PlxuICAgICAgICBAc3VibmF2LmFkZENsYXNzKCdzaG93aW5nJylcbiAgICAgICAgQHN1Ym5hdlNob3dpbmcgPSB0cnVlXG4gICAgICAgIFxuICAgIGhpZGVTdWJOYXY6ID0+XG4gICAgICAgIEBzdWJuYXYucmVtb3ZlQ2xhc3MoJ3Nob3dpbmcnKVxuICAgICAgICBAc3VibmF2U2hvd2luZyA9IGZhbHNlXG4gICAgICAgIEBoYW5kbGVTdWJOYXYoKVxuXG4gICAgc2hvd1N1Yk5hdkxpbmtzOiAocGFnZSkgPT5cbiAgICAgICAgaWYgcGFnZT9cbiAgICAgICAgICAgIGxlZnQgPSAkKCcubmF2IC5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cIicgKyBwYWdlICsgJ1wiXScpLnBvc2l0aW9uKCkubGVmdFxuICAgICAgICAgICAgb2Zmc2V0ID0gMFxuICAgICAgICAgICAgaGVscGVyID0gLTQ1IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB3aW5kb3cuaW5uZXJXaWR0aCA8IDk5M1xuICAgICAgICAgICAgICAgIGhlbHBlciA9IC0yMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjY29uc29sZS5sb2cgJ3BhZ2U6ICcsIHBhZ2VcbiAgICAgICAgICAgICNjb25zb2xlLmxvZyAnYjogJywgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCBhJykubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICQoJyMnICsgcGFnZSArICctc3VibmF2LWxpc3QgYScpLmxlbmd0aCA8IDNcbiAgICAgICAgICAgICAgICBmb3IgYSBpbiAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0IGEnKVxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBvZmZzZXQgKyAkKGEpLndpZHRoKClcblxuICAgICAgICAgICAgaWYgb2Zmc2V0ID4gMFxuICAgICAgICAgICAgICAgICNjb25zb2xlLmxvZyAnYSdcbiAgICAgICAgICAgICAgICAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgbGVmdCAtIChvZmZzZXQgLyAzKSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjY29uc29sZS5sb2cgJ2InXG4jICAgICAgICAgICAgICAgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIGxlZnQgKyBoZWxwZXIpXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uU3ViTmF2TGlzdHMoKVxuICAgICAgICAgICAgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCcpLmFkZENsYXNzKCdzaG93aW5nJylcbiAgICBcbiAgICBoaWRlU3ViTmF2TGlua3M6ID0+XG4gICAgICAgICQoJy5zdWJuYXYtbGlzdCBsaScpLnJlbW92ZUNsYXNzKCdzaG93aW5nJylcbiAgICAgICAgXG4gICAgaGFuZGxlU3ViTmF2OiA9PlxuICAgICAgICBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ291cnBhcmtzJykgfHwgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdvZmZlcmluZ3MnKSB8fCAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ2FjY29tbW9kYXRpb25zJylcbiAgICAgICAgICAgICQoJ3VsLnN1Ym5hdi1saXN0IGxpJykucmVtb3ZlQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICAgICAkKCcjb3VyLXBhcmtzLXN1Ym5hdi1saXN0JykuYWRkQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICAgICBAc2hvd1N1Yk5hdkxpbmtzKCdvdXItcGFya3MnKVxuXG4gICAgICAgICAgICBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ29mZmVyaW5ncycpXG4gICAgICAgICAgICAgICAgJCgnYSNvdXItcGFya3Mtb2ZmZXJpbmdzLXN1Ym5hdi1saW5rJykuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG4gICAgICAgICAgICBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ2FjY29tbW9kYXRpb25zJylcbiAgICAgICAgICAgICAgICAkKCdhI291ci1wYXJrcy1hY2NvbW1vZGF0aW9ucy1zdWJuYXYtbGluaycpLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG4gICAgICAgIGVsc2UgaWYgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdwYXJ0bmVyc2hpcCcpIHx8ICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygncGFydG5lcnNoaXAtZGV0YWlscycpXG4gICAgICAgICAgICAkKCd1bC5zdWJuYXYtbGlzdCBsaScpLnJlbW92ZUNsYXNzICdzaG93aW5nJ1xuICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmFkZENsYXNzICdzaG93aW5nJ1xuICAgICAgICAgICAgQHNob3dTdWJOYXZMaW5rcygncGFydG5lcnNoaXBzJylcblxuIyAgICAgICAgICAgIGlmICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygncGFydG5lcnNoaXAtZGV0YWlscycpXG4jICAgICAgICAgICAgICAgICQoJ2EjcGFydG5lcnNoaXAtZGV0YWlscy1zdWJuYXYtbGluaycpLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG4jPT09PT09PT09PT09PT09PT09PSM9PT09PT09PT09PT09PT09PT09Iz09PT09PT09PT09PT09PT09PT0jXG4jPT09PT09PT09PT09PT09PT09PSAgTU9CSUxFIFNUQVJUUyBIRVJFID09PT09PT09PT09PT09PT09PSNcbiM9PT09PT09PT09PT09PT09PT09Iz09PT09PT09PT09PT09PT09PT0jPT09PT09PT09PT09PT09PT09PSMgXG5cbiAgICB0b2dnbGVOYXY6IChlKSA9PlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgJHQgPSAkKGUudGFyZ2V0KVxuICAgICAgICAkaGIgPSAkKCcjaGVhZGVyLWJvdHRvbScpXG4gICAgICAgICRtbiA9ICQoJyNtb2JpbGUtaGVhZGVyLW5hdicpXG4gICAgICAgICRoaCA9ICRoYi5oZWlnaHQoKVxuXG4gICAgICAgICR0LnRvZ2dsZUNsYXNzKCdjbG9zZWQnKVxuXG4gICAgICAgIGNvbnNvbGUubG9nICdzZWNvbmQgdG9nZ2xlJ1xuICAgICAgICBjb25zb2xlLmxvZyAkdFxuICAgICAgICBcbiAgICAgICAgaWYgJHQuaGFzQ2xhc3MoJ2Nsb3NlZCcpXG4gICAgICAgICAgICBAYWRqdXN0TW9iaWxlTmF2KClcbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvIEBtb2JuYXYsIC4zNSwgXG4gICAgICAgICAgICAgICAge3k6ICg4MDAgKyAkaGgpXG4gICAgICAgICAgICAgICAgLHo6IDBcbiAgICAgICAgICAgICAgICAsZWFzZTogUG93ZXIxLmVhc2VPdXRcbiAgICAgICAgICAgICAgICAsb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgICAgICAgICAgVHdlZW5NYXguc2V0IEBtb2JuYXYsXG4gICAgICAgICAgICAgICAgICAgICAgICB6OiAxMFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgVHdlZW5NYXguc2V0IEBtb2JuYXYsXG4gICAgICAgICAgICAgICAgejogLTIgXG4gICAgICAgICAgICBUd2Vlbk1heC50byBAbW9ibmF2LCAuNSwge3k6IDAsIHo6IDAsIGVhc2U6IFBvd2VyMS5lYXNlSW59XG4gICAgICAgICAgICAkKCcubW9iaWxlLXN1Yi1uYXYnKS5jc3MoJ2hlaWdodCcsICcwcHgnKVxuICAgICAgICAgICAgQGFkanVzdE1vYmlsZU5hdlxuICAgICAgICAgICAgQGhpZGVNb2JpbGVTdWJOYXYoKVxuICAgICAgICAgICAgVHdlZW5NYXguc2V0IEBjb250ZW50ICxcbiAgICAgICAgICAgICAgICB5OiAwXG5cbiAgICBhZGp1c3RNb2JpbGVOYXY6ID0+XG4gICAgICAgICRoYiA9ICQoJyNoZWFkZXItYm90dG9tJylcbiAgICAgICAgJG1uID0gJCgnI21vYmlsZS1oZWFkZXItbmF2JylcbiAgICAgICAgIyBTZXQgbmF2IGhlaWdodCB0byAzNTBweCBldmVyeSB0aW1lIGJlZm9yZSBhZGp1c3RpbmdcbiAgICAgICAgIyRtbi5jc3Mge2hlaWdodDogMzUwfVxuICAgICAgICAkaGggPSAkaGIuaGVpZ2h0KClcbiAgICAgICAgJG5oID0gJG1uLmhlaWdodCgpXG4gICAgICAgICRpdyA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgICAgICRpaCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICAkbWIgPSAkKCcjbmF2YmFyLW1lbnUnKVxuXG4gICAgICAgIGlmICRuaCA+ICRpaFxuICAgICAgICAgICAgJG1uLmNzcyB7aGVpZ2h0OiAoJGloIC0gJGhoKSwgb3ZlcmZsb3c6ICdzY3JvbGwnfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAkbW4uY3NzIHtoZWlnaHQ6IDQwMCArICdweCd9ICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIHNob3dNb2JpbGVTdWJOYXY6IChlKSA9PlxuICAgICAgICB0aGlzU3ViTmF2ID0gJChlLnRhcmdldCkucGFyZW50KCkuZmluZCAnLm1vYmlsZS1zdWItbmF2J1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXNTdWJOYXYuZmluZCgnbGknKS5sZW5ndGggPCAxKVxuICAgICAgICAgICAgQGhpZGVNb2JpbGVTdWJOYXYoKVxuICAgICAgICAgICAgJChlLnRhcmdldCkuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgaWYgISgkKGUudGFyZ2V0KS5wYXJlbnQoKS5oYXNDbGFzcygnYWN0aXZlJykpXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIFxuICAgICAgICBob3dNYW55ID0gdGhpc1N1Yk5hdi5maW5kKCdsaScpLmxlbmd0aFxuICAgICAgICB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgdGFyZ2V0ID0gJChlLnRhcmdldClcblxuICAgICAgICBAaGlkZU1vYmlsZVN1Yk5hdigpXG4gICAgICAgIHRhcmdldC5maW5kKCdpJykuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgdGFyZ2V0LmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgIHRhcmdldC5wYXJlbnRzKCdhJykuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgQG1vYm5hdi5jc3MoJ2hlaWdodCcsICh3aW5kb3dIZWlnaHQgLSAxMDApICsgJ3B4JylcbiAgICAgICAgdGhpc1N1Yk5hdi5jc3MoJ2hlaWdodCcsIChob3dNYW55ICogNTApICsgJ3B4JylcbiAgICAgICAgXG4gICAgaGlkZU1vYmlsZVN1Yk5hdjogPT5cbiAgICAgICAgJCgnLm1vYmlsZS1zdWItbmF2JykuY3NzKCdoZWlnaHQnLCAnMHB4JylcbiAgICAgICAgQG1vYm5hdi5jc3MoJ2hlaWdodCcsICc0MDBweCcpXG4gICAgICAgIEBtb2JuYXYuZmluZCgnaScpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgIEBtb2JuYXYuZmluZCgnbGknKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICBAbW9ibmF2LmZpbmQoJ3VsIGEnKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuXG4gICAgXG4gICAgaGFuZGxlQXJyb3dDbGljazogKGUpID0+XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIFxuICAgICAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgQGhpZGVNb2JpbGVTdWJOYXYoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnRzKCdsaScpLnRyaWdnZXIgJ2NsaWNrJ1xuICAgICAgICBcbiAgICAgICAgXG4gICAgb25DbGlja01vYmlsZVN1Yk5hdkxpbms6IChlKSA9PlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBcbiAgICAgICAgaWYgJChlLnRhcmdldCkuZGF0YSgnaHJlZicpP1xuICAgICAgICAgICAgdXJsID0gJChlLnRhcmdldCkuZGF0YSAnaHJlZidcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJBbmltYXRpb25cblxuXG4iLCJcblBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblZpZGVvT3ZlcmxheSA9IHJlcXVpcmUgJy4vVmlkZW9PdmVybGF5LmNvZmZlZSdcblxuY2xhc3MgUGFya3NMaXN0IGV4dGVuZHMgUGx1Z2luQmFzZVxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBAJGVsID0gJChvcHRzLmVsKVxuICAgICAgICBzdXBlcihvcHRzKSAgICAgICAgIFxuICAgICAgICBAZ2FsbGVyeSA9IG9wdHMuZ2FsbGVyeVxuICAgICAgICBpZiBAZ2FsbGVyeT9cbiAgICAgICAgICAgIEBnYWxsZXJ5Lm9uIFwiaXRlbUluZGV4XCIgLCBAc2VsZWN0TG9nb1xuICAgICAgICAgICAgXG4gICAgICAgIEBwYWdlID0gb3B0cy5wYWdlXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBAcGFya0xvZ29zID0gJChAJGVsKS5maW5kIFwibGlcIlxuICAgICAgICBAY3VycmVudFNlbGVjdGVkID0gQHBhcmtMb2dvcy5maWx0ZXIoXCI6Zmlyc3QtY2hpbGRcIilcbiAgICAgICAgaWYgQGdhbGxlcnk/XG4gICAgICAgICAgICBAc2VsZWN0TG9nbyBAc2VsZWN0ZWRMb2dvKClcbiAgICAgICAgICAgIEBnYWxsZXJ5LmdvdG8gQHNlbGVjdGVkTG9nbygpLCB0cnVlXG4gICAgICAgIHN1cGVyKClcblxuICAgIGFkZEV2ZW50czogLT5cbiAgICAgICAgQCRlbC5vbiAnY2xpY2snLCAnbGkucGFyaycsIEBoYW5kbGVMb2dvSW50ZXJhY3Rpb25cbiAgICAgICAgXG4gICAgICAgIEBwYXJrTG9nb3MuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgbG9nb0V2ZW50cyA9IG5ldyBIYW1tZXIodClcbiAgICAgICAgICAgIGxvZ29FdmVudHMub24gJ3RhcCcgLCBAaGFuZGxlTG9nb0ludGVyYWN0aW9uXG5cbiAgICBoYW5kbGVMb2dvSW50ZXJhY3Rpb246IChlKSA9PlxuICAgICAgICBpZiBAcGFnZSA9PSAnYWNjb21tb2RhdGlvbidcbiAgICAgICAgICAgIEBwYXJrTG9nb3MucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuICAgICAgICAgICAgJChlLnRhcmdldCkucGFyZW50cygnbGkucGFyaycpLmFkZENsYXNzICdzZWxlY3RlZCdcbiAgICAgICAgICAgIHdoaWNoUGFyayA9ICQoZS50YXJnZXQpLnBhcmVudHMoJ2xpLnBhcmsnKS5hdHRyKCdpZCcpXG4gICAgICAgICAgICBAc2hvd05ld0FjY29tbW9kYXRpb25zKHdoaWNoUGFyaylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBcbiAgICAgICAgJHRhcmdldCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ2xpJylcblxuICAgICAgICBpZCA9ICR0YXJnZXQuZGF0YSgnaWQnKVxuICAgICAgICBcbiAgICAgICAgQGRpc3BsYXlDb250ZW50IGlkXG4gICAgICAgIFxuICAgICAgICBcbiAgICBzaG93TmV3QWNjb21tb2RhdGlvbnM6IChwYXJrKSA9PlxuICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuc3dpcGVyLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IC5jYXJvdXNlbC13cmFwcGVyJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXJbZGF0YS1sb2dvPVwiJyArIHBhcmsgKyAnXCJdJykuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXJbZGF0YS1sb2dvPVwiJyArIHBhcmsgKyAnXCJdJykucGFyZW50KCkuYWRkQ2xhc3MgJ2FjdGl2ZSdcblxuICAgIGRpc3BsYXlDb250ZW50OiAoaWQpIC0+XG5cblxuICAgICAgICBAc2VsZWN0TG9nbyhpZClcblxuICAgICAgICAjU3dpdGNoIEluZm8gQm94ZXNcbiAgICAgICAgQGdhbGxlcnkuZ290byhpZClcblxuXG4gICAgc2VsZWN0TG9nbzogKGlkKSA9PlxuICAgICAgICBsb2dvSWQgPSBcIiMje2lkfS1sb2dvXCJcbiAgICAgICAgQHBhcmtMb2dvcy5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICBAcGFya0xvZ29zLmZpbHRlcihsb2dvSWQpLmFkZENsYXNzKCdzZWxlY3RlZCcpXG5cblxuICAgIHNlbGVjdGVkTG9nbzogLT5cbiAgICAgICAgcmV0dXJuIEBwYXJrTG9nb3MucGFyZW50KCkuZmluZCgnbGkuc2VsZWN0ZWQnKS5kYXRhKCdpZCcpO1xuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFya3NMaXN0XG5cbiIsIlBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblxuY2xhc3MgUmVzaXplQnV0dG9ucyBleHRlbmRzIFBsdWdpbkJhc2VcblxuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBAcmVzaXplQnV0dG9ucygpXG5cbiAgICByZXNpemVCdXR0b25zOiAtPlxuICAgICAgICBjID0gJCgnI2NvbnRlbnQnKVxuICAgICAgICBidG5fd3JhcHBlcnMgPSBjLmZpbmQgJy5idG4td3JhcHBlcidcblxuICAgICAgICBmb3IgYnRuX3dyYXBwZXIgaW4gYnRuX3dyYXBwZXJzXG4gICAgICAgICAgICBidG5zID0gJChidG5fd3JhcHBlcikuZmluZCAnYSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgYnRucy5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgbWF4V2lkdGggPSAwXG4gICAgICAgICAgICAgICAgd2lkZXN0U3BhbiA9IG51bGxcblxuICAgICAgICAgICAgICAgICQoYnRucykuZWFjaCAtPlxuICAgICAgICAgICAgICAgICAgICBpZiAkKHRoaXMpLndpZHRoKCkgPiBtYXhXaWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4V2lkdGggPSAkKHRoaXMpLndpZHRoKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGVzdFNwYW4gPSAkKHRoaXMpXG5cbiAgICAgICAgICAgICAgICAkKGJ0bnMpLmVhY2ggLT5cbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3Moe3dpZHRoOiBtYXhXaWR0aCArIDYwfSlcblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZUJ1dHRvbnMiLCJjbGFzcyBTdmdJbmplY3RcblxuICAgIGNvbnN0cnVjdG9yOiAoc2VsZWN0b3IpIC0+XG4gICAgICAgIFxuICAgICAgICBAJHN2Z3MgPSAkKHNlbGVjdG9yKVxuICAgICAgICBcbiAgICAgICAgQHByZWxvYWRlciA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUgdHJ1ZSAsIFwiXCIgLCB0cnVlXG4gICAgICAgIEBwcmVsb2FkZXIuc2V0TWF4Q29ubmVjdGlvbnMoMTApXG4gICAgICAgIEBwcmVsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lciAnZmlsZWxvYWQnICwgQG9uU3ZnTG9hZGVkXG4gICAgICAgIEBwcmVsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uTG9hZENvbXBsZXRlXG4gICAgICAgIEBtYW5pZmVzdCA9IFtdXG4gICAgICAgIEBjb2xsZWN0U3ZnVXJscygpXG4gICAgICAgIEBsb2FkU3ZncygpXG4gICAgICAgIFxuICAgIGNvbGxlY3RTdmdVcmxzOiAtPlxuICAgICAgICBcbiAgICAgICAgc2VsZiA9IEBcbiAgICAgICAgXG4gICAgICAgIEAkc3Zncy5lYWNoIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlkID0gXCJzdmctaW5qZWN0LSN7cGFyc2VJbnQoTWF0aC5yYW5kb20oKSAqIDEwMDApLnRvU3RyaW5nKCl9XCJcbiAgICAgICAgICBcbiAgICAgICAgICAgICQoQCkuYXR0cignaWQnLCBpZClcbiAgICAgICAgICAgICQoQCkuYXR0cignZGF0YS1hcmInICwgXCJhYmMxMjNcIilcbiAgICAgICAgICAgIHN2Z1VybCA9ICQoQCkuYXR0cignc3JjJylcbiAgICAgICAgICAgIFxuICAgICAgICAgICBcblxuICAgICAgICAgICAgc2VsZi5tYW5pZmVzdC5wdXNoIFxuICAgICAgICAgICAgICAgIGlkOmlkXG4gICAgICAgICAgICAgICAgc3JjOnN2Z1VybFxuICAgICAgICAgICAgICAgIFxuICAgIGxvYWRTdmdzOiAtPlxuICAgICAgICBcbiAgICAgICAgQHByZWxvYWRlci5sb2FkTWFuaWZlc3QoQG1hbmlmZXN0KVxuICAgICAgICAgICAgICAgIFxuICAgIFxuICAgIGluamVjdFN2ZzogKGlkLHN2Z0RhdGEpIC0+XG4gICAgICAgIFxuICAgICAgICAkZWwgPSAkKFwiIyN7aWR9XCIpICAgIFxuIFxuIFxuICAgICAgICBpbWdJRCA9ICRlbC5hdHRyKCdpZCcpXG4gICAgICAgIGltZ0NsYXNzID0gJGVsLmF0dHIoJ2NsYXNzJylcbiAgICAgICAgaW1nRGF0YSA9ICRlbC5jbG9uZSh0cnVlKS5kYXRhKCkgb3IgW11cbiAgICAgICAgZGltZW5zaW9ucyA9IFxuICAgICAgICAgICAgdzogJGVsLmF0dHIoJ3dpZHRoJylcbiAgICAgICAgICAgIGg6ICRlbC5hdHRyKCdoZWlnaHQnKVxuXG4gICAgICAgIHN2ZyA9ICQoc3ZnRGF0YSkuZmlsdGVyKCdzdmcnKVxuICAgICAgICBcblxuICAgICAgICBzdmcgPSBzdmcuYXR0cihcImlkXCIsIGltZ0lEKSAgaWYgdHlwZW9mIGltZ0lEIGlzbnQgJ3VuZGVmaW5lZCdcbiAgICAgICAgaWYgdHlwZW9mIGltZ0NsYXNzIGlzbnQgJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgIGNscyA9IChpZiAoc3ZnLmF0dHIoXCJjbGFzc1wiKSBpc250ICd1bmRlZmluZWQnKSB0aGVuIHN2Zy5hdHRyKFwiY2xhc3NcIikgZWxzZSBcIlwiKVxuICAgICAgICAgICAgc3ZnID0gc3ZnLmF0dHIoXCJjbGFzc1wiLCBpbWdDbGFzcyArIFwiIFwiICsgY2xzICsgXCIgcmVwbGFjZWQtc3ZnXCIpXG4gICAgICAgIFxuICAgICAgICAjIGNvcHkgYWxsIHRoZSBkYXRhIGVsZW1lbnRzIGZyb20gdGhlIGltZyB0byB0aGUgc3ZnXG4gICAgICAgICQuZWFjaCBpbWdEYXRhLCAobmFtZSwgdmFsdWUpIC0+ICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBzdmdbMF0uc2V0QXR0cmlidXRlIFwiZGF0YS1cIiArIG5hbWUsIHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gICAgICAgIFxuICAgICAgICBzdmcgPSBzdmcucmVtb3ZlQXR0cihcInhtbG5zOmFcIilcbiAgICAgICAgXG4gICAgICAgICNHZXQgb3JpZ2luYWwgZGltZW5zaW9ucyBvZiBTVkcgZmlsZSB0byB1c2UgYXMgZm91bmRhdGlvbiBmb3Igc2NhbGluZyBiYXNlZCBvbiBpbWcgdGFnIGRpbWVuc2lvbnNcbiAgICAgICAgb3cgPSBwYXJzZUZsb2F0KHN2Zy5hdHRyKFwid2lkdGhcIikpXG4gICAgICAgIG9oID0gcGFyc2VGbG9hdChzdmcuYXR0cihcImhlaWdodFwiKSlcbiAgICAgICAgXG4gICAgICAgICNTY2FsZSBhYnNvbHV0ZWx5IGlmIGJvdGggd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzIGV4aXN0XG4gICAgICAgIGlmIGRpbWVuc2lvbnMudyBhbmQgZGltZW5zaW9ucy5oXG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcIndpZHRoXCIsIGRpbWVuc2lvbnMud1xuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJoZWlnaHRcIiwgZGltZW5zaW9ucy5oXG4gICAgICAgIFxuICAgICAgICAjU2NhbGUgcHJvcG9ydGlvbmFsbHkgYmFzZWQgb24gd2lkdGhcbiAgICAgICAgZWxzZSBpZiBkaW1lbnNpb25zLndcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwid2lkdGhcIiwgZGltZW5zaW9ucy53XG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcImhlaWdodFwiLCAob2ggLyBvdykgKiBkaW1lbnNpb25zLndcbiAgICAgICAgXG4gICAgICAgICNTY2FsZSBwcm9wb3J0aW9uYWxseSBiYXNlZCBvbiBoZWlnaHRcbiAgICAgICAgZWxzZSBpZiBkaW1lbnNpb25zLmhcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwiaGVpZ2h0XCIsIGRpbWVuc2lvbnMuaFxuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJ3aWR0aFwiLCAob3cgLyBvaCkgKiBkaW1lbnNpb25zLmhcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAkZWwucmVwbGFjZVdpdGggc3ZnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgb25TdmdMb2FkZWQ6IChlKSA9PlxuICAgICAgICBcbiAgICAgICAgQGluamVjdFN2ZyhlLml0ZW0uaWQsIGUucmF3UmVzdWx0KVxuICAgIFxuICAgIG9uTG9hZENvbXBsZXRlOiAoZSkgPT5cbiAgICBcbiAgICBcbiAgICBcbiAgICBcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gU3ZnSW5qZWN0ICIsIlxuXG5jbGFzcyBWaWRlb092ZXJsYXlcblxuXG5cbiAgICBjb25zdHJ1Y3RvcjogKGVsKSAtPlxuICAgICAgICBAJGVsID0gJChlbClcbiAgICAgICAgQCRpbm5lciA9IEAkZWwuZmluZChcIi5vdmVybGF5LWlubmVyXCIpXG4gICAgICAgIEAkY29udGFpbmVyID0gQCRlbC5maW5kKFwiLm92ZXJsYXktaW5uZXItY29udGFpbmVyXCIpXG4gICAgICAgIFxuICAgICAgICBpZiAoQCRjb250YWluZXIuZmluZCgnLm92ZXJsYXktY29udGVudCcpLnNpemUoKSBpcyAxKSBcbiAgICAgICAgICAgIEAkY29udGFpbmVyID0gQCRjb250YWluZXIuZmluZCgnLm92ZXJsYXktY29udGVudCcpXG4gICAgICAgICAgICBcbiAgICAgICAgQCRjbG9zZSA9IEAkZWwuZmluZChcIi5vdmVybGF5LWNsb3NlXCIpXG4gICAgICAgIFxuXG4gICAgICAgIEBjcmVhdGVWaWRlb0luc3RhbmNlKClcbiAgICAgICAgQGNyZWF0ZU92ZXJsYXlUcmFuc2l0aW9uKClcbiAgICAgICAgQGFkZEV2ZW50cygpXG5cblxuXG4gICAgY3JlYXRlT3ZlcmxheVRyYW5zaXRpb246IC0+XG4gICAgICAgIEB0bCA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgICAgIEAkZWwuc2hvdygpXG5cbiAgICAgICAgQHRsLmFkZCBUd2Vlbk1heC5mcm9tVG8gJCgnI292ZXJsYXknKSwgLjAxLFxuICAgICAgICAgICAge3pJbmRleDogLTEsIGRpc3BsYXk6J25vbmUnLCB6OiAwfSwge3pJbmRleDogNTAwMCwgZGlzcGxheTonYmxvY2snLCB6OiA5OTk5OTk5OTk5fVxuICAgICAgICBcbiAgICAgICAgQHRsLmFkZCBUd2Vlbk1heC50byBAJGVsICwgLjM1ICxcbiAgICAgICAgICAgIGF1dG9BbHBoYToxXG5cbiAgICAgICAgQHRsLmFkZCBUd2Vlbk1heC50byBAJGlubmVyICwgLjU1ICxcbiAgICAgICAgICAgIGFscGhhOjFcblxuICAgICAgICBAdGwuYWRkIFR3ZWVuTWF4LnRvIEAkY2xvc2UgLCAuMjUgLFxuICAgICAgICAgICAgYWxwaGE6MVxuICAgICAgICAsXG4gICAgICAgICAgICBcIi09LjE1XCJcblxuICAgICAgICBAdGwuYWRkTGFiZWwoXCJpbml0Q29udGVudFwiKVxuXG4gICAgICAgIEB0bC5zdG9wKClcblxuICAgIGNyZWF0ZVZpZGVvSW5zdGFuY2U6ICgpIC0+XG5cblxuXG4gICAgYWRkRXZlbnRzOiAtPlxuICAgICAgICBAY2xvc2VFdmVudCA9IG5ldyBIYW1tZXIoQCRjbG9zZVswXSlcblxuXG5cbiAgICB0cmFuc2l0aW9uSW5PdmVybGF5OiAobmV4dCkgLT5cbiAgICAgICAgY29uc29sZS5sb2cgJ3RyYW5zaXRpb25Jbk92ZXJsYXknXG4gICAgICAgIEB0cmFuc0luQ2IgPSBuZXh0XG4gICAgICAgIEB0bC5hZGRDYWxsYmFjayhAdHJhbnNJbkNiLCBcImluaXRDb250ZW50XCIpXG4gICAgICAgIEB0bC5wbGF5KClcbiAgICAgICAgQGNsb3NlRXZlbnQub24gJ3RhcCcgLCBAY2xvc2VPdmVybGF5XG5cbiAgICB0cmFuc2l0aW9uT3V0T3ZlcmxheTogLT5cbiAgICAgICAgY29uc29sZS5sb2cgJ3RyYW5zaXRpb25PdXRPdmVybGF5J1xuICAgICAgICBAY2xvc2VFdmVudC5vZmYgJ3RhcCcgLCBAY2xvc2VPdmVybGF5XG4gICAgICAgIEB0bC5yZW1vdmVDYWxsYmFjayhAdHJhbnNJbkNiKVxuICAgICAgICBAdGwucmV2ZXJzZSgpXG4gICAgICAgIGRlbGV0ZSBAdHJhbnNJbkNiXG5cblxuICAgIGNsb3NlT3ZlcmxheTogKGUpID0+XG4gICAgICAgIEByZW1vdmVWaWRlbygpXG4gICAgICAgIEB0cmFuc2l0aW9uT3V0T3ZlcmxheSgpXG5cblxuICAgIHJlbW92ZVZpZGVvOiAoKSAtPlxuICAgICAgICBpZiBAdmlkZW9JbnN0YW5jZVxuICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UucGF1c2UoKVxuICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UuY3VycmVudFRpbWUoMClcbiAgICAgICAgICAgICNAdmlkZW9JbnN0YW5jZS5kaXNwb3NlKClcblxuICAgIHJlc2l6ZU92ZXJsYXk6ICgpIC0+XG4gICAgICAgICR2aWQgPSBAJGVsLmZpbmQoJ3ZpZGVvJylcbiAgICAgICAgJHcgPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgICAgICAkaCA9ICR2aWQuaGVpZ2h0KClcblxuICAgICAgICAjIEAkaW5uZXIuY3NzIHt3aWR0aDogJHcsIGhlaWdodDogJGh9XG4gICAgICAgICMgJHZpZC5jc3Mge2hlaWdodDogMTAwICsgJyUnLCB3aWR0aDogMTAwICsgJyUnfVxuXG4gICAgYXBwZW5kRGF0YTogKGRhdGEpIC0+XG4gICAgICAgIGlmIGRhdGEubXA0ID09IFwiXCIgb3IgISBkYXRhLm1wND9cbiAgICAgICAgICAgIGNvbnNvbGUubG9nICdubyB2aWRlbywgaXRzIGFuIGltYWdlJ1xuICAgICAgICAgICAgQHBvc3RlciA9ICQoXCI8ZGl2IGNsYXNzPSd2aWRlby1qcyc+PGltZyBjbGFzcz0ndmpzLXRlY2gnIHNyYz0nXCIgKyBkYXRhLnBvc3RlciArIFwiJyBjbGFzcz0nbWVkaWEtaW1hZ2UtcG9zdGVyJyAvPjwvZGl2PlwiKVxuICAgICAgICAgICAgQCRjb250YWluZXIuaHRtbCBAcG9zdGVyXG4gICAgICAgICAgICBAcG9zdGVyLmNzcyAnaGVpZ2h0JywgJzEwMCUnXG4gICAgICAgICAgICBAcmVtb3ZlVmlkZW8oKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgbXA0ID0gJChcIjxzb3VyY2Ugc3JjPVxcXCIje2RhdGEubXA0fVxcXCIgdHlwZT1cXFwidmlkZW8vbXA0XFxcIiAvPiBcIilcbiAgICAgICAgd2VibSA9ICQoXCI8c291cmNlIHNyYz1cXFwiI3tkYXRhLndlYm19XFxcIiB0eXBlPVxcXCJ2aWRlby93ZWJtXFxcIiAvPiBcIilcblxuICAgICAgICBAJHZpZGVvRWwgPSAkKFwiPHZpZGVvIGlkPSdvdmVybGF5LXBsYXllcicgY2xhc3M9J3Zqcy1kZWZhdWx0LXNraW4gdmlkZW8tanMnIGNvbnRyb2xzIHByZWxvYWQ9J2F1dG8nIC8+XCIpXG4gICAgICAgIEAkdmlkZW9FbC5hcHBlbmQobXA0KVxuICAgICAgICBAJHZpZGVvRWwuYXBwZW5kKHdlYm0pXG4gICAgICAgIEAkY29udGFpbmVyLmh0bWwgQCR2aWRlb0VsXG5cbiAgICAgICAgaWYgQHZpZGVvSW5zdGFuY2U/XG4gICAgICAgICAgICBAdmlkZW9JbnN0YW5jZS5kaXNwb3NlKClcbiAgICAgICAgQHZpZGVvSW5zdGFuY2UgPSB2aWRlb2pzIFwib3ZlcmxheS1wbGF5ZXJcIiAgLFxuICAgICAgICAgICAgd2lkdGg6XCIxMDAlXCJcbiAgICAgICAgICAgIGhlaWdodDpcIjEwMCVcIlxuXG5cblxuXG4gICAgcGxheVZpZGVvOiAoKSA9PlxuIyAgICAgICAgaWYoISQoXCJodG1sXCIpLmhhc0NsYXNzKCdtb2JpbGUnKSlcbiMgICAgICAgICAgICBAdmlkZW9JbnN0YW5jZS5wbGF5KClcbiAgICAgICAgaWYgQHZpZGVvSW5zdGFuY2U/XG4gICAgICAgICAgICBAdmlkZW9JbnN0YW5jZS5wbGF5KClcbiAgICAgICAgICAgIFxuICAgIHNob3dJbWFnZTogKCkgPT5cbiAgICAgICAgY29uc29sZS5sb2cgJ3Nob3dJbWFnZSdcblxuXG5cbm92ZXJsYXkgPSBuZXcgVmlkZW9PdmVybGF5IFwiI292ZXJsYXlcIlxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzLmluaXRWaWRlb092ZXJsYXkgPSAoZGF0YSkgLT5cbiAgICBjb25zb2xlLmxvZyAnZGF0YTI6ICcsIGRhdGFcbiAgICBvdmVybGF5LmFwcGVuZERhdGEoZGF0YSlcblxuXG4gICAgaWYgIShkYXRhLm1wNCA9PSBcIlwiKVxuICAgICAgICBjb25zb2xlLmxvZyAnZGF0YS5tcDQgIT09IFwiXCInXG4gICAgICAgIG92ZXJsYXkudHJhbnNpdGlvbkluT3ZlcmxheShvdmVybGF5LnBsYXlWaWRlbylcbiAgICBlbHNlXG4gICAgICAgIGNvbnNvbGUubG9nICdkYXRhLm1wNCA9PT0gXCJcIidcbiAgICAgICAgb3ZlcmxheS50cmFuc2l0aW9uSW5PdmVybGF5KG92ZXJsYXkuc2hvd0ltYWdlKVxuXG5cblxuXG5cblxuXG5cblxuXG5cbiIsIlBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi8uLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcbkZyYW1lc01vZGVsID0gcmVxdWlyZSAnLi9GcmFtZXNNb2RlbC5jb2ZmZWUnXG5cbm1hdGNoRnJhbWVOdW0gPSAvXFxkKyg/PVxcLlthLXpBLVpdKykvXG5cbmNsYXNzIEZyYW1lQW5pbWF0aW9uIGV4dGVuZHMgUGx1Z2luQmFzZVxuICAgIFxuICAgIFxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgXG4gICAgICAgIEAkZWwgPSAkKG9wdHMuZWwpXG4gICAgICAgIEBhc3luYyA9IG9wdHMuYXN5bmMgb3IgZmFsc2VcbiAgICAgICAgZGVwdGg9IG9wdHMuZGVwdGggb3IgMVxuICAgICAgICBAJGNvbnRhaW5lciA9ICQoXCI8ZGl2IGNsYXNzPSdjb2FzdGVyLWNvbnRhaW5lcicgLz5cIilcbiAgICAgICAgQCRjb250YWluZXIuYXR0cignaWQnICwgb3B0cy5pZClcbiAgICAgICAgQCRjb250YWluZXIuY3NzKCd6LWluZGV4JywgZGVwdGgpXG4gICAgICAgIFR3ZWVuTWF4LnNldCBAJGNvbnRhaW5lciAsIFxuICAgICAgICAgICAgejpkZXB0aCAqIDEwXG4gICAgICAgIFxuICAgICAgICBzdXBlcihvcHRzKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgXG4gICAgaW5pdGlhbGl6ZTogKG9wdHMpIC0+XG4gICAgICAgIHN1cGVyKG9wdHMpXG4gICAgICAgIFxuICAgICAgICBAbW9kZWwgPSBuZXcgRnJhbWVzTW9kZWwgb3B0c1xuICAgICAgICBAbW9kZWwub24gXCJkYXRhTG9hZGVkXCIgLCBAc2V0dXBDYW52YXNcbiAgICAgICAgQG1vZGVsLm9uIFwidHJhY2tMb2FkZWRcIiAsIEBvblRyYWNrTG9hZGVkXG4gICAgICAgIEBtb2RlbC5vbiBcImZyYW1lc0xvYWRlZFwiICwgQG9uRnJhbWVzTG9hZGVkXG4gICAgICAgIEBtb2RlbC5sb2FkRGF0YSgpXG4gICAgICAgIFxuICAgXG4gICAgICAgXG4gICAgbG9hZEZyYW1lczogLT5cbiAgICAgICAgaWYgQG1vZGVsLmRhdGE/XG4gICAgICAgICAgICBAbW9kZWwucHJlbG9hZEZyYW1lcygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBkZWZlckxvYWRpbmcgPSB0cnVlXG4gICAgICAgIFxuICAgIFxuICAgIFxuICAgIHNldHVwQ2FudmFzOiA9PlxuICAgICAgICBcblxuICAgICAgICBAY2FudmFzV2lkdGggPSBAbW9kZWwuZ2V0KCdnbG9iYWwnKS53aWR0aFxuICAgICAgICBAY2FudmFzSGVpZ2h0ID0gQG1vZGVsLmdldCgnZ2xvYmFsJykuaGVpZ2h0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpXG4gICAgICAgIEBjb250ZXh0ID0gQGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG4gICAgICAgIFxuICAgICAgICBAY2FudmFzLnNldEF0dHJpYnV0ZSgnd2lkdGgnICwgQGNhbnZhc1dpZHRoKVxuICAgICAgICBAY2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JyAsIEBjYW52YXNIZWlnaHQpXG5cbiAgICAgICAgXG4gICAgICAgIEAkY29udGFpbmVyLmFwcGVuZChAY2FudmFzKVxuICAgICAgICBAJGVsLnByZXBlbmQoQCRjb250YWluZXIpXG4gICAgICAgIEBtb2RlbC5wcmVsb2FkVHJhY2soKVxuICAgICAgICBpZiBAZGVmZXJMb2FkaW5nXG4gICAgICAgICAgICBAbW9kZWwucHJlbG9hZEZyYW1lcygpXG4gICAgICBcbiAgICBcbiAgICBkaXNwbGF5VHJhY2s6IC0+XG4gICAgICAgIFxuICAgICAgICBAY29udGV4dC5jbGVhclJlY3QgMCAsIDAgLCBAY2FudmFzV2lkdGggLCBAY2FudmFzSGVpZ2h0XG4gICAgICAgIEBjb250ZXh0LmRyYXdJbWFnZSBAdHJhY2tJbWFnZS50YWcgLCAwICwwICwgQGNhbnZhc1dpZHRoICwgQGNhbnZhc0hlaWdodFxuICAgICAgICBcbiAgICBkaXNwbGF5RnJhbWU6IChudW0pIC0+XG4gICAgICAgIFxuICAgICAgICBtYW5pZmVzdCA9IEBtb2RlbC5nZXQoJ21hbmlmZXN0JylcbiAgICAgICAgXG4gICAgICAgIGlmIG1hbmlmZXN0Lmxlbmd0aCA+IG51bVxuICAgICAgICAgICAgYXNzZXQgPSBtYW5pZmVzdFtudW1dIFxuICAgICAgICAgICAgZnJhbWVBc3NldCA9IEBtb2RlbC5nZXRBc3NldChhc3NldC5maWxlbmFtZSlcbiAgICAgICAgICAgICMgY29uc29sZS5sb2cgZnJhbWVBc3NldC50YWcgLCBhc3NldC54ICwgYXNzZXQueSwgYXNzZXQud2lkdGgsIGFzc2V0LmhlaWdodFxuICAgICAgICAgICAgQGNvbnRleHQuZHJhd0ltYWdlIGZyYW1lQXNzZXQudGFnICwgYXNzZXQueCAsIGFzc2V0LnksIGFzc2V0LndpZHRoLCBhc3NldC5oZWlnaHRcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIGluaXRBbmltYXRpb246IC0+XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgZnJhbWVzID0gQG1vZGVsLmdldCgnbWFuaWZlc3QnKS5sZW5ndGhcbiAgICAgICAgc3BlZWQgPSBAbW9kZWwuZ2V0KCdnbG9iYWwnKS5mcHNcbiAgICAgICAgZGVsYXkgPSBAbW9kZWwuZ2V0KCdnbG9iYWwnKS5kZWxheSBvciAwXG4gICAgICAgIHJlcGVhdERlbGF5ID0gQG1vZGVsLmdldCgnZ2xvYmFsJykucmVwZWF0RGVsYXkgb3IgMTBcbiAgICAgICAgXG4gICAgXG5cbiAgICAgICAgZHVyYXRpb24gPSAgZnJhbWVzIC8gc3BlZWRcblxuXG4gICAgICAgIHNlbGYgPSBAIFxuICAgICAgICBAbGFzdEZyYW1lTnVtID0gLTFcbiAgICAgICAgQHRpbWVsaW5lID0gd2luZG93LmNvYXN0ZXIgPSBUd2Vlbk1heC50byBAY2FudmFzICwgZHVyYXRpb24gLCBcbiAgICAgICAgICAgIG9uVXBkYXRlOiAtPlxuICAgICAgICAgICAgICAgIGZyYW1lTnVtID0gTWF0aC5mbG9vcihmcmFtZXMgKiBAcHJvZ3Jlc3MoKSkgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgZnJhbWVOdW0gaXNudCBAbGFzdEZyYW1lTnVtICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzZWxmLmRpc3BsYXlUcmFjaygpXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGlzcGxheUZyYW1lKGZyYW1lTnVtKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAbGFzdEZyYW1lTnVtID0gZnJhbWVOdW1cbiAgICAgICAgICAgIHJlcGVhdDotMVxuICAgICAgICAgICAgcmVwZWF0RGVsYXk6IHJlcGVhdERlbGF5XG4gICAgICAgICAgICBkZWxheTpkZWxheVxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcblxuICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICBcbiAgICBvblRyYWNrTG9hZGVkOiA9PlxuXG4gICAgICAgIEB0cmFja0ltYWdlID0gQG1vZGVsLmdldEFzc2V0KCd0cmFjaycpXG4gICAgICAgIEBkaXNwbGF5VHJhY2soKVxuICAgICAgICBcblxuICAgIG9uRnJhbWVzTG9hZGVkOiA9PlxuICAgICAgICBpZiB0eXBlb2YgQGFzeW5jIGlzICdmdW5jdGlvbidcbiAgICAgICAgICAgIEBhc3luYygpXG4gICAgICAgICQod2luZG93KS5vbiAnc2Nyb2xsJywgIEBjaGVja0NvYXN0ZXJWaXNpYmlsaXR5XG4gICAgICAgIEBjaGVja0NvYXN0ZXJWaXNpYmlsaXR5KClcbiAgICBcbiAgICAgICAgXG4gICAgY2hlY2tDb2FzdGVyVmlzaWJpbGl0eTogPT5cbiAgICAgICAgXG4gICAgICAgIGlmKEBpblZpZXdwb3J0KCkpXG5cbiAgICAgICAgICAgICQod2luZG93KS5vZmYgJ3Njcm9sbCcsICBAY2hlY2tDb2FzdGVyVmlzaWJpbGl0eVxuICAgICAgICAgICAgQGluaXRBbmltYXRpb24oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgaW5WaWV3cG9ydDogPT5cbiAgICAgICAgXG4gICAgICAgIHRvcCA9IEAkY29udGFpbmVyLm9mZnNldCgpLnRvcFxuICAgICAgICBoZWlnaHQgPSBAJGNvbnRhaW5lci5maW5kKCdjYW52YXMnKS5maXJzdCgpLmhlaWdodCgpXG4gICAgICAgIGJvdHRvbSA9IHRvcCArIGhlaWdodFxuICAgICAgICBcbiAgICAgICAgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpXG4gICAgICAgIHNjcm9sbEJvdHRvbSA9ICQod2luZG93KS5zY3JvbGxUb3AoKSArICQod2luZG93KS5oZWlnaHQoKVxuXG4gICAgICAgIGlmIHNjcm9sbFRvcCA8PSB0b3AgPD0gc2Nyb2xsQm90dG9tXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIFxuIFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZyYW1lQW5pbWF0aW9uXG4iLCJcblxubWF0Y2hGcmFtZU51bSA9IC9cXGQrKD89XFwuW2EtekEtWl0rKS9cblxuY2xhc3MgRnJhbWVzTW9kZWwgZXh0ZW5kcyBFdmVudEVtaXR0ZXJcblxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBAYmFzZVVybCA9IG9wdHMuYmFzZVVybFxuICAgICAgICBAdXJsID0gb3B0cy51cmxcbiAgICAgICAgQGxvYWRNYW5pZmVzdCA9IFtdO1xuICAgICAgICBAdHJhY2tNYW5pZmVzdCA9IFtdO1xuICAgICAgICBAaW5pdExvYWRlcigpXG4gICAgICAgIHN1cGVyKG9wdHMpXG4gICAgICAgIFxuXG4gICAgbG9hZERhdGE6IC0+XG4gICAgICAgICQuYWpheFxuICAgICAgICAgICAgdXJsOiBAYmFzZVVybCAgKyBAdXJsXG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCJcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgICAgc3VjY2VzczogQG9uRGF0YUxvYWRlZFxuICAgICAgICAgICAgZXJyb3I6IEBoYW5kbGVFcnJvclxuXG4gICAgaGFuZGxlRXJyb3I6IChlcnIpIC0+XG4gICAgICAgIHRocm93IGVyclxuXG4gICAgb25EYXRhTG9hZGVkOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIEBkYXRhID0gZGF0YVxuICAgICAgICBAdHJhbnNmb3JtRGF0YSgpXG4gICAgICAgIEBlbWl0IFwiZGF0YUxvYWRlZFwiXG4gICAgICBcblxuICAgIHNvcnRTZXF1ZW5jZTogKGEsYikgLT5cbiAgICAgICAgYUZyYW1lID0gbWF0Y2hGcmFtZU51bS5leGVjKGEuZmlsZW5hbWUpXG4gICAgICAgIGJGcmFtZSA9IG1hdGNoRnJhbWVOdW0uZXhlYyhiLmZpbGVuYW1lKVxuICAgICAgICByZXR1cm4gaWYgcGFyc2VJbnQoYUZyYW1lWzBdKSA8IHBhcnNlSW50KGJGcmFtZVswXSkgdGhlbiAtMSBlbHNlIDFcblxuICAgIHRyYW5zZm9ybURhdGE6IC0+XG4gICAgICAgIEBkYXRhLm1hbmlmZXN0LnNvcnQgQHNvcnRTZXF1ZW5jZVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEB0cmFja01hbmlmZXN0LnB1c2hcbiAgICAgICAgICAgIGlkOlwidHJhY2tcIlxuICAgICAgICAgICAgc3JjOiBcIiN7QGRhdGEuZ2xvYmFsLmZvbGRlcn0vI3tAZGF0YS5nbG9iYWwudHJhY2t9XCJcblxuICAgICAgICBmb3IgZnJhbWUgaW4gQGRhdGEubWFuaWZlc3RcbiAgICAgICAgICAgIGZyYW1lLnNyYyA9IFwiI3tAZGF0YS5nbG9iYWwuZm9sZGVyfS8je2ZyYW1lLmZpbGVuYW1lfVwiXG4gICAgICAgICAgICBAbG9hZE1hbmlmZXN0LnB1c2hcbiAgICAgICAgICAgICAgICBpZDogZnJhbWUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICBzcmM6IGZyYW1lLnNyY1xuXG4gICAgaW5pdExvYWRlcjogLT5cbiAgICAgICAgQHRyYWNrTG9hZGVyID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZSB0cnVlLCBAYmFzZVVybCwgdHJ1ZVxuICAgICAgICBAcHJlbG9hZGVyID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZSB0cnVlLCBAYmFzZVVybCwgdHJ1ZVxuICAgICAgICBAdHJhY2tMb2FkZXIuc2V0TWF4Q29ubmVjdGlvbnMoMTApXG4gICAgICAgIEBwcmVsb2FkZXIuc2V0TWF4Q29ubmVjdGlvbnMoMTUpXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgcHJlbG9hZFRyYWNrOiAtPlxuXG4gICAgICAgIEB0cmFja0xvYWRlci5hZGRFdmVudExpc3RlbmVyICdjb21wbGV0ZScgLCBAb25UcmFja0Fzc2V0c0NvbXBsZXRlXG4gICAgICAgIEB0cmFja0xvYWRlci5sb2FkTWFuaWZlc3QoQHRyYWNrTWFuaWZlc3QpXG4gICAgcHJlbG9hZEZyYW1lczogLT5cbiMgICAgICAgIGNvbnNvbGUubG9nIEBsb2FkTWFuaWZlc3RcbiAgICAgICAgXG4gICAgICAgIEBwcmVsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uQXNzZXRzQ29tcGxldGVcbiAgICAgICAgQHByZWxvYWRlci5sb2FkTWFuaWZlc3QoQGxvYWRNYW5pZmVzdClcblxuICAgIG9uVHJhY2tBc3NldHNDb21wbGV0ZTogKGUpID0+XG4gICAgICAgIFxuICAgICAgICBAdHJhY2tMb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uVHJhY2tBc3NldHNDb21wbGV0ZVxuICAgICAgICBAZW1pdCBcInRyYWNrTG9hZGVkXCJcblxuICAgIG9uQXNzZXRzQ29tcGxldGU6IChlKT0+XG4jICAgICAgICBjb25zb2xlLmxvZyBAcHJlbG9hZGVyXG4gICAgICAgIEBwcmVsb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uQXNzZXRzQ29tcGxldGVcbiAgICAgICAgQGVtaXQgXCJmcmFtZXNMb2FkZWRcIlxuXG5cblxuXG4gICAgZ2V0QXNzZXQ6IChpZCkgLT5cbiAgICAgICAgXG4gICAgICAgIGl0ZW0gPSAgQHByZWxvYWRlci5nZXRJdGVtIGlkXG4gICAgICAgIGlmICFpdGVtP1xuICAgICAgICAgICAgaXRlbSA9ICBAdHJhY2tMb2FkZXIuZ2V0SXRlbSBpZCAgICAgICAgXG4gICAgICAgIHJldHVybiBpdGVtXG5cbiAgICBnZXQ6IChrZXkpIC0+XG4gICAgICAgIGZvciBrLHYgb2YgQGRhdGFcbiAgICAgICAgICAgIGlmIGsgaXMga2V5XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZcblxuICAgIHNldDogKGtleSwgdmFsKSAtPlxuICAgICAgICBAZGF0YVtrZXldID0gdmFsXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGcmFtZXNNb2RlbFxuIiwiXHJcblZpZXdCYXNlID0gcmVxdWlyZSBcIi4uL2Fic3RyYWN0L1ZpZXdCYXNlLmNvZmZlZVwiXHJcblxyXG5jbGFzcyBTY3JvbGxCYXIgZXh0ZW5kcyBWaWV3QmFzZVxyXG5cclxuICAgIHNjcm9sbGluZyA6IGZhbHNlXHJcbiAgICBvZmZzZXRZIDogMFxyXG4gICAgcG9zaXRpb24gOiAwXHJcbiAgICBoaWRlVGltZW91dDogMFxyXG5cclxuXHJcbiAgICBpbml0aWFsaXplOiAtPlxyXG4gICAgICAgIEBvblJlc2l6ZSgpXHJcbiAgICAgICAgQHNldEV2ZW50cygpXHJcblxyXG4gICAgICAgIGlmIHdpbmRvdy5pc1RpZXJUYWJsZXRcclxuICAgICAgICAgICAgQCRlbC5oaWRlKClcclxuXHJcblxyXG5cclxuICAgIHNldEV2ZW50czogPT5cclxuICAgICAgICBAZGVsZWdhdGVFdmVudHNcclxuICAgICAgICAgICAgXCJtb3VzZWRvd24gLmhhbmRsZVwiIDogXCJvbkhhbmRsZURvd25cIlxyXG4gICAgICAgICAgICAjXCJtb3VzZWVudGVyXCIgOiBcIm9uSGFuZGxlVXBcIlxyXG4gICAgICAgICAgICBcImNsaWNrIC5yYWlsXCIgOiBcIm9uUmFpbENsaWNrXCJcclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkub24gXCJtb3VzZXVwXCIgLCBAb25IYW5kbGVVcFxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uIFwibW91c2Vtb3ZlXCIgLCBAb25Nb3VzZU1vdmVcclxuXHJcblxyXG4gICAgICAgIFxyXG4gICAgdXBkYXRlSGFuZGxlOiAocG9zKSA9PlxyXG4gICAgICAgIEBwb3NpdGlvbiA9IHBvc1xyXG4gICAgICAgIEAkZWwuZmluZCgnLmhhbmRsZScpLmNzc1xyXG4gICAgICAgICAgICB0b3A6IEBwb3NpdGlvbiAqICgkKHdpbmRvdykuaGVpZ2h0KCkgLSBAJGVsLmZpbmQoXCIuaGFuZGxlXCIpLmhlaWdodCgpKVxyXG4gICAgICAgIEBzaG93U2Nyb2xsYmFyKClcclxuICAgICAgICBAaGlkZVNjcm9sbGJhcigpXHJcblxyXG4gICAgb25SYWlsQ2xpY2s6IChlKSA9PlxyXG4gICAgICAgIEBvZmZzZXRZID0gaWYgZS5vZmZzZXRZIGlzbnQgdW5kZWZpbmVkIHRoZW4gZS5vZmZzZXRZIGVsc2UgZS5vcmlnaW5hbEV2ZW50LmxheWVyWVxyXG4gICAgICAgIEBwb3NpdGlvbiA9IEBvZmZzZXRZIC8gJCh3aW5kb3cpLmhlaWdodCgpXHJcbiAgICAgICAgQHRyaWdnZXIgXCJjdXN0b21TY3JvbGxKdW1wXCIgLCBAcG9zaXRpb25cclxuICAgICAgICBcclxuXHJcblxyXG4gICAgb25IYW5kbGVEb3duOiAoZSkgPT5cclxuXHJcbiAgICAgICAgQCRlbC5jc3NcclxuICAgICAgICAgICAgd2lkdGg6XCIxMDAlXCJcclxuICAgICAgICBAb2Zmc2V0WSA9IGlmIGUub2Zmc2V0WSBpc250IHVuZGVmaW5lZCB0aGVuIGUub2Zmc2V0WSBlbHNlIGUub3JpZ2luYWxFdmVudC5sYXllcllcclxuICAgICAgICBAc2Nyb2xsaW5nID0gdHJ1ZVxyXG5cclxuICAgIG9uSGFuZGxlVXA6IChlKSA9PlxyXG4gICAgICAgIEAkZWwuY3NzXHJcbiAgICAgICAgICAgIHdpZHRoOlwiMTVweFwiXHJcblxyXG4gICAgICAgIEBzY3JvbGxpbmcgPSBmYWxzZVxyXG5cclxuICAgIG9uTW91c2VNb3ZlOiAoZSkgPT5cclxuICAgICAgICBpZiBAc2Nyb2xsaW5nXHJcblxyXG4gICAgICAgICAgICBpZiBlLnBhZ2VZIC0gQG9mZnNldFkgPD0gMFxyXG4gICAgICAgICAgICAgICAgJChcIi5oYW5kbGVcIikuY3NzXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAxXHJcbiAgICAgICAgICAgIGVsc2UgaWYgZS5wYWdlWSAtIEBvZmZzZXRZID49ICQod2luZG93KS5oZWlnaHQoKSAtICQoXCIjc2Nyb2xsYmFyIC5oYW5kbGVcIikuaGVpZ2h0KClcclxuICAgICAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgICAgICQoXCIuaGFuZGxlXCIpLmNzc1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogICAoJCh3aW5kb3cpLmhlaWdodCgpIC0gJChcIiNzY3JvbGxiYXIgLmhhbmRsZVwiKS5oZWlnaHQoKSkgLSAxXHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICQoXCIuaGFuZGxlXCIpLmNzc1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogZS5wYWdlWSAtIEBvZmZzZXRZXHJcblxyXG5cclxuICAgICAgICAgICAgQHBvc2l0aW9uID0gcGFyc2VJbnQoJChcIiNzY3JvbGxiYXIgLmhhbmRsZVwiKS5jc3MoXCJ0b3BcIikpIC8gKCQod2luZG93KS5oZWlnaHQoKSAtICQoXCIjc2Nyb2xsYmFyIC5oYW5kbGVcIikuaGVpZ2h0KCkpXHJcblxyXG4gICAgICAgICAgICBpZiBAcG9zaXRpb24gPCBwYXJzZUZsb2F0KC4wMDUpXHJcbiAgICAgICAgICAgICAgICBAcG9zaXRpb24gPSAwXHJcbiAgICAgICAgICAgIGVsc2UgaWYgQHBvc2l0aW9uID4gcGFyc2VGbG9hdCguOTk1KVxyXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uID0gMVxyXG5cclxuXHJcbiAgICAgICAgICAgIEB0cmlnZ2VyIFwiY3VzdG9tU2Nyb2xsXCIgLCBAcG9zaXRpb25cclxuICAgICAgICAgIFxyXG4gICBcclxuICAgICAgICBpZiBAbW91c2VYIGlzbnQgZS5jbGllbnRYIGFuZCBAbW91c2VZIGlzbnQgZS5jbGllbnRZXHJcbiAgICAgICAgICAgIEBzaG93U2Nyb2xsYmFyKClcclxuICAgICAgICAgICAgQGhpZGVTY3JvbGxiYXIoKVxyXG5cclxuICAgICAgICBAbW91c2VYID0gZS5jbGllbnRYXHJcbiAgICAgICAgQG1vdXNlWSA9IGUuY2xpZW50WVxyXG5cclxuICAgIG9uUmVzaXplOiAoZSkgPT5cclxuXHJcblxyXG4gICAgICAgIEAkZWwuZmluZCgnLmhhbmRsZScpLmNzc1xyXG4gICAgICAgICAgICBoZWlnaHQ6ICgkKHdpbmRvdykuaGVpZ2h0KCkgLyAkKFwic2VjdGlvblwiKS5oZWlnaHQoKSApICogJCh3aW5kb3cpLmhlaWdodCgpXHJcblxyXG4gICAgICAgIEB1cGRhdGVIYW5kbGUoQHBvc2l0aW9uKVxyXG5cclxuXHJcbiAgICBoaWRlU2Nyb2xsYmFyOiA9PlxyXG4gICAgICAgIGlmIEBoaWRlVGltZW91dD9cclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KEBoaWRlVGltZW91dClcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgQGhpZGVUaW1lb3V0ID0gc2V0VGltZW91dCAoPT5cclxuICAgICAgICAgICAgaWYgQG1vdXNlWSA+IDcyXHJcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC50byBAJGVsLCAuNSAsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0b0FscGhhOiAwXHJcbiAgICAgICAgICAgICkgLCAyMDAwXHJcbiAgICAgICAgXHJcblxyXG4gICAgc2hvd1Njcm9sbGJhcjogPT5cclxuICAgICAgICBUd2Vlbk1heC50byBAJGVsICwgLjUgLFxyXG4gICAgICAgICAgICBhdXRvQWxwaGE6IC41XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2Nyb2xsQmFyIiwiXHJcblxyXG5jbGFzcyBTaGFyZXJcclxuXHJcbiAgICBcclxuICAgIFNoYXJlci5pbml0RmFjZWJvb2sgPSAtPlxyXG4gICAgICAgIEZCLmluaXQgXHJcbiAgICAgICAgICAgIGFwcElkOlwiMjE1MjI0NzA1MzA3MzQxXCJcclxuICAgICAgICAgICAgY2hhbm5lbFVybDpcIi9jaGFubmVsLmh0bWxcIlxyXG4gICAgICAgICAgICBzdGF0dXM6IHRydWVcclxuICAgICAgICAgICAgeGZibDogdHJ1ZVxyXG5cclxuXHJcbiAgICAgICAgXHJcbiAgICBcclxuICAgIFNoYXJlci5zaGFyZVR3aXR0ZXIgPSAoc2hhcmVNZXNzYWdlLCAgdXJsLCBoYXNodGFncykgLT5cclxuICAgICAgICB0ZXh0ID0gc2hhcmVNZXNzYWdlXHJcbiAgICAgICAgaGFzaHRhZ3MgPSBcIlwiXHJcbiAgICAgICAgdXJsID0gdXJsXHJcbiAgICAgICAgdHdVUkwgPSBcImh0dHBzOi8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodGV4dCkgKyBcIiZ1cmw9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodXJsKVxyXG4gICAgICAgIHN0ciArPSBcIiZoYXNodGFncz1cIiArIGhhc2h0YWdzICBpZiBoYXNodGFnc1xyXG4gICAgICAgIEBvcGVuUG9wdXAgNTc1LCA0MjAsIHR3VVJMLCBcIlR3aXR0ZXJcIlxyXG5cclxuICAgIFNoYXJlci5zaGFyZUZhY2Vib29rID0gKG5hbWUsICBjYXB0aW9uICxkZXNjcmlwdGlvbiAsIGxpbmsgLCBwaWN0dXJlKSAtPlxyXG5cclxuICAgICAgICBGQi51aVxyXG4gICAgICAgICAgICBtZXRob2Q6XCJmZWVkXCJcclxuICAgICAgICAgICAgbGluazpsaW5rXHJcbiAgICAgICAgICAgIHBpY3R1cmU6cGljdHVyZVxyXG4gICAgICAgICAgICBuYW1lOiBuYW1lXHJcbiAgICAgICAgICAgIGNhcHRpb246Y2FwdGlvblxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjpkZXNjcmlwdGlvblxyXG4gICAgICAgIFxyXG5cclxuICAgIFNoYXJlci5zaGFyZUdvb2dsZSA9ICh1cmwpIC0+XHJcblxyXG4gICAgICAgIEBvcGVuUG9wdXAgNjAwLCA0MDAgLCBcImh0dHBzOi8vcGx1cy5nb29nbGUuY29tL3NoYXJlP3VybD1cIit1cmwsIFwiR29vZ2xlXCJcclxuXHJcbiAgICBTaGFyZXIuc2hhcmVQaW50ZXJlc3QgPSAodXJsICwgZGVzY3JpcHRpb24sIHBpY3R1cmUpIC0+XHJcblxyXG4gICAgICAgIGRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24uc3BsaXQoXCIgXCIpLmpvaW4oXCIrXCIpXHJcbiAgICAgICAgQG9wZW5Qb3B1cCA3ODAsIDMyMCwgXCJodHRwOi8vcGludGVyZXN0LmNvbS9waW4vY3JlYXRlL2J1dHRvbi8/dXJsPSN7ZW5jb2RlVVJJQ29tcG9uZW50KHVybCl9JmFtcDtkZXNjcmlwdGlvbj0je2Rlc2NyaXB0aW9ufSZhbXA7bWVkaWE9I3tlbmNvZGVVUklDb21wb25lbnQocGljdHVyZSl9XCJcclxuXHJcblxyXG4gICAgU2hhcmVyLmVtYWlsTGluayA9IChzdWJqZWN0LCBib2R5KSAtPlxyXG4gICAgICAgIHggPSBAb3BlblBvcHVwIDEgLCAxLCBcIm1haWx0bzomc3ViamVjdD0je2VuY29kZVVSSUNvbXBvbmVudChzdWJqZWN0KX0mYm9keT0je2VuY29kZVVSSUNvbXBvbmVudChib2R5KX1cIlxyXG4gICAgICAgIHguY2xvc2UoKVxyXG5cclxuICAgIFNoYXJlci5vcGVuUG9wdXAgPSAodywgaCwgdXJsLCBuYW1lKSAtPlxyXG4gICAgICAgIHdpbmRvdy5vcGVuIHVybCwgbmFtZSwgXCJzdGF0dXM9MSx3aWR0aD1cIiArIHcgKyBcIixoZWlnaHQ9XCIgKyBoICsgXCIsbGVmdD1cIiArIChzY3JlZW4ud2lkdGggLSB3KSAvIDIgKyBcIix0b3A9XCIgKyAoc2NyZWVuLmhlaWdodCAtIGgpIC8gMlxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2hhcmVyIiwid2dsb2JhbHMgPSByZXF1aXJlICcuL2NvbS9nbG9iYWwvaW5kZXguY29mZmVlJ1xuUGFya3NMaXN0ID0gcmVxdWlyZSAnLi9jb20vcGx1Z2lucy9QYXJrc0xpc3QuY29mZmVlJ1xuRHJhZ2dhYmxlR2FsbGVyeSA9IHJlcXVpcmUgJy4vY29tL3BsdWdpbnMvRHJhZ2dhYmxlR2FsbGVyeS5jb2ZmZWUnXG5PdXJQYXJrc1BhZ2UgPSByZXF1aXJlICcuL2NvbS9wYWdlcy9PdXJQYXJrc1BhZ2UuY29mZmVlJ1xuXG5cbiQoZG9jdW1lbnQpLnJlYWR5IC0+XG5cbiAgICAjJChcIiNjb250ZW50XCIpLmNzcyhcImhlaWdodFwiICwgJCgnI2NvbnRlbnQnKS5oZWlnaHQoKSlcblxuICAgIG91cnBhcmtzID0gbmV3IE91clBhcmtzUGFnZVxuICAgICAgICBlbDogXCJib2R5XCJcbiAgICAgICAgXG4gICBcblxuXG5cbiBcbiJdfQ==
