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



},{"../pages/animations/clouds.coffee":6,"../plugins/HeaderAnimation.coffee":13,"../util/ScrollBar.coffee":21,"./ViewBase.coffee":3}],2:[function(require,module,exports){
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



},{"../util/Sharer.coffee":22}],4:[function(require,module,exports){
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



},{"../plugins/BasicOverlay.coffee":10,"../plugins/SvgInject.coffee":17}],5:[function(require,module,exports){
var AnimationBase, DraggableGallery, FadeGallery, FrameAnimation, HeaderAnimation, InlineVideo, ParksList, ResizeButtons, WhoWeArePage, animations, globalAnimations,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AnimationBase = require("../abstract/AnimationBase.coffee");

ParksList = require('../plugins/ParksList.coffee');

DraggableGallery = require('../plugins/DraggableGallery.coffee');

FadeGallery = require('../plugins/FadeGallery.coffee');

HeaderAnimation = require('../plugins/HeaderAnimation.coffee');

ResizeButtons = require('../plugins/ResizeButtons.coffee');

InlineVideo = require('../plugins/InlineVideo.coffee');

FrameAnimation = require('../plugins/coasters/FrameAnimation.coffee');

animations = require('./animations/groupsales.coffee');

animations = require('./animations/whoweare.coffee');

globalAnimations = require('./animations/global.coffee');

WhoWeArePage = (function(superClass) {
  extend(WhoWeArePage, superClass);

  function WhoWeArePage(el) {
    this.resetTimeline = bind(this.resetTimeline, this);
    this.totalAnimationTime = 25;
    WhoWeArePage.__super__.constructor.call(this, el);
  }

  WhoWeArePage.prototype.initialize = function() {
    return WhoWeArePage.__super__.initialize.call(this);
  };

  WhoWeArePage.prototype.initComponents = function() {
    var coaster, video, whoweare;
    WhoWeArePage.__super__.initComponents.call(this);
    if (!this.isPhone) {
      video = new InlineVideo({
        el: $('.player')
      });
      coaster = new FrameAnimation({
        id: "whoweare-coaster-1",
        el: "#whoweare-section1",
        baseUrl: this.cdnRoot + "coasters/",
        url: "shot-2/data.json"
      });
      coaster.loadFrames();
    }
    return whoweare = new FadeGallery({
      el: "#who-we-are"
    });
  };

  WhoWeArePage.prototype.resetTimeline = function() {
    WhoWeArePage.__super__.resetTimeline.call(this);
    this.parallax.push(globalAnimations.clouds("#section1", 0, 1, this.isTablet ? 1 : 5));
    if (!this.isPhone) {
      this.triggers.push(animations.topHeadline());
      this.triggers.push(animations.mainVideo());
      return this.triggers.push(animations.bottomHeadline());
    }
  };

  return WhoWeArePage;

})(AnimationBase);

module.exports = WhoWeArePage;



},{"../abstract/AnimationBase.coffee":1,"../plugins/DraggableGallery.coffee":11,"../plugins/FadeGallery.coffee":12,"../plugins/HeaderAnimation.coffee":13,"../plugins/InlineVideo.coffee":14,"../plugins/ParksList.coffee":15,"../plugins/ResizeButtons.coffee":16,"../plugins/coasters/FrameAnimation.coffee":19,"./animations/global.coffee":7,"./animations/groupsales.coffee":8,"./animations/whoweare.coffee":9}],6:[function(require,module,exports){
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
  $el = $('#group-sales');
  tween = new TimelineMax;
  tween.add(TweenMax.fromTo($el.find('.top-headline .title-bucket h1'), .35, {
    y: -10,
    alpha: 0
  }, {
    y: 0,
    alpha: 1
  }), 0.5);
  tween.add(TweenMax.fromTo($el.find('.top-headline .title-bucket h2'), .35, {
    y: -10,
    alpha: 0
  }, {
    y: 0,
    alpha: 1
  }), "-=.3");
  tween.add(TweenMax.fromTo($el.find('.top-headline .title-bucket p'), .35, {
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
  $el = $("#group-sales .circ-btn-wrapper");
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
  $el = $('#group-sales #select');
  tween = new TimelineMax;
  tween.add(TweenMax.fromTo($el, .35, {
    opacity: 0,
    scale: .75
  }, {
    opacity: 1,
    scale: 1
  }), 0.25);
  tween.paused(true);
  return {
    a: tween,
    offset: $el.offset().top
  };
};

module.exports.s2TopHeadline = function() {
  var $el, tween;
  $el = $('#testimonials');
  tween = new TimelineMax;
  tween.add(TweenMax.fromTo($el.find('.title-bucket h1'), .35, {
    y: -10,
    alpha: 0
  }, {
    y: 0,
    alpha: 1
  }));
  tween.add(TweenMax.fromTo($el.find('.title-bucket h2'), .35, {
    y: -10,
    alpha: 0
  }, {
    y: 0,
    alpha: 1
  }), "-=.3");
  tween.paused(true);
  return {
    a: tween,
    offset: $el.offset().top
  };
};

module.exports.offeringsTestimonials = function() {
  var $el, arrow, distance, i, j, len, ref, tween;
  $el = $('#testimonials');
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
var global;

global = require('./global.coffee');

module.exports.topHeadline = function() {
  var $el, child, i, j, len, ref, tween;
  $el = $('#who-we-are.section-inner');
  tween = new TimelineMax;
  ref = $el.find('.title-bucket:first-child').children();
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    child = ref[i];
    tween.add(TweenMax.fromTo($(child), .35, {
      y: -25,
      alpha: 0
    }, {
      y: 0,
      alpha: 1
    }), 0 + .1 * i);
  }
  tween.add(TweenMax.fromTo($el.find('.top-headline a.btn'), .35, {
    alpha: 0,
    scale: 0.5
  }, {
    alpha: 1,
    scale: 1,
    onComplete: (function(_this) {
      return function() {
        return $el.find('.top-headline a.btn').css('transform', '');
      };
    })(this)
  }), "-=.2");
  return {
    a: tween,
    offset: $el.offset().top
  };
};

module.exports.mainVideo = function() {
  var $el, tween;
  $el = $('#who-we-are #player-container');
  tween = new TimelineMax;
  tween.add(TweenMax.fromTo($el.find('li'), .5, {
    alpha: 0,
    y: 10
  }, {
    alpha: 1,
    y: 0
  }));
  tween.paused(true);
  return {
    a: tween,
    offset: $el.offset().top
  };
};

module.exports.bottomHeadline = function() {
  var $el, tween;
  $el = $('#who-we-are .title-bucket.six');
  tween = new TimelineMax;
  tween.add(TweenMax.fromTo($el.find('h1'), .35, {
    y: -25,
    alpha: 0
  }, {
    y: 0,
    alpha: 1
  }));
  tween.add(TweenMax.fromTo($el.next().find('a'), .35, {
    alpha: 0,
    scale: 0.5
  }, {
    alpha: 1,
    scale: 1,
    onComplete: (function(_this) {
      return function() {
        return $el.next().find('a').css('transform', '');
      };
    })(this)
  }), "-=.2");
  tween.paused(true);
  return {
    a: tween,
    offset: $el.offset().top
  };
};



},{"./global.coffee":7}],10:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":2}],11:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":2,"../abstract/ViewBase.coffee":3}],12:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":2,"./VideoOverlay.coffee":18}],13:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":2,"../global/index.coffee":4}],14:[function(require,module,exports){
var InlineVideo, PluginBase,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = require('../abstract/PluginBase.coffee');

InlineVideo = (function(superClass) {
  extend(InlineVideo, superClass);

  function InlineVideo(opts) {
    InlineVideo.__super__.constructor.call(this, opts);
  }

  InlineVideo.prototype.initialize = function() {
    this.videoPlayers = this.$el;
    this.addEvents();
    return InlineVideo.__super__.initialize.call(this);
  };

  InlineVideo.prototype.addEvents = function() {
    return this.videoPlayers.each((function(_this) {
      return function(i, t) {
        return $(t).on('click', _this.startPlayer);
      };
    })(this));
  };

  InlineVideo.prototype.startPlayer = function(t) {
    var $el, data, height, mp4, webm, width;
    if ($(this).parent().find('video').size() === 0) {
      $el = $(this);
      data = {
        mp4: $el.data('mp4'),
        webm: $el.data('webm')
      };
      console.log(data);
      width = $el.width();
      height = $el.outerHeight();
      mp4 = $('<source src="' + data.mp4 + '" type="video/mp4" />');
      webm = $('<source src=' + data.webm + '" type="video/webm" />');
      this.$videoEl = $("<video id='overlay-player' class='vjs-default-skin video-js' controls preload='auto' autoplay='true' />");
      this.$videoEl.append(mp4);
      this.$videoEl.append(webm);
      $el.parent().append(this.$videoEl);
      return this.$videoEl.show().height(height);
    }
  };

  return InlineVideo;

})(PluginBase);

module.exports = InlineVideo;



},{"../abstract/PluginBase.coffee":2}],15:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":2,"./VideoOverlay.coffee":18}],16:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":2}],17:[function(require,module,exports){
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



},{}],18:[function(require,module,exports){
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



},{}],19:[function(require,module,exports){
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



},{"../../abstract/PluginBase.coffee":2,"./FramesModel.coffee":20}],20:[function(require,module,exports){
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



},{}],21:[function(require,module,exports){
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



},{"../abstract/ViewBase.coffee":3}],22:[function(require,module,exports){
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



},{}],23:[function(require,module,exports){
var DraggableGallery, FadeGallery, HeaderAnimation, InlineVideo, ParksList, WhoWeArePage, globals;

globals = require('./com/global/index.coffee');

ParksList = require('./com/plugins/ParksList.coffee');

DraggableGallery = require('./com/plugins/DraggableGallery.coffee');

FadeGallery = require('./com/plugins/FadeGallery.coffee');

HeaderAnimation = require('./com/plugins/HeaderAnimation.coffee');

WhoWeArePage = require('./com/pages/WhoWeArePage.coffee');

InlineVideo = require('./com/plugins/InlineVideo.coffee');

$(document).ready(function() {
  var jobs;
  return jobs = new WhoWeArePage({
    el: "body"
  });
});



},{"./com/global/index.coffee":4,"./com/pages/WhoWeArePage.coffee":5,"./com/plugins/DraggableGallery.coffee":11,"./com/plugins/FadeGallery.coffee":12,"./com/plugins/HeaderAnimation.coffee":13,"./com/plugins/InlineVideo.coffee":14,"./com/plugins/ParksList.coffee":15}]},{},[23])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvQW5pbWF0aW9uQmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvVmlld0Jhc2UuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL2dsb2JhbC9pbmRleC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvV2hvV2VBcmVQYWdlLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wYWdlcy9hbmltYXRpb25zL2Nsb3Vkcy5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvYW5pbWF0aW9ucy9nbG9iYWwuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BhZ2VzL2FuaW1hdGlvbnMvZ3JvdXBzYWxlcy5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvYW5pbWF0aW9ucy93aG93ZWFyZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9CYXNpY092ZXJsYXkuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvRHJhZ2dhYmxlR2FsbGVyeS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9GYWRlR2FsbGVyeS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9IZWFkZXJBbmltYXRpb24uY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvSW5saW5lVmlkZW8uY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvUGFya3NMaXN0LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL1Jlc2l6ZUJ1dHRvbnMuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvU3ZnSW5qZWN0LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL1ZpZGVvT3ZlcmxheS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9jb2FzdGVycy9GcmFtZUFuaW1hdGlvbi5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9jb2FzdGVycy9GcmFtZXNNb2RlbC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vdXRpbC9TY3JvbGxCYXIuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3V0aWwvU2hhcmVyLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL3dob3dlYXJlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0NBLElBQUEsMkRBQUE7RUFBQTs7NkJBQUE7O0FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUixDQUFYLENBQUE7O0FBQUEsU0FDQSxHQUFZLE9BQUEsQ0FBUSwwQkFBUixDQURaLENBQUE7O0FBQUEsZUFFQSxHQUFrQixPQUFBLENBQVEsbUNBQVIsQ0FGbEIsQ0FBQTs7QUFBQSxNQUdBLEdBQVMsT0FBQSxDQUFRLG1DQUFSLENBSFQsQ0FBQTs7QUFBQTtBQVFJLG1DQUFBLENBQUE7O0FBQWEsRUFBQSx1QkFBQyxFQUFELEdBQUE7QUFDVCx5REFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSx5Q0FBQSxDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSxJQUFBLCtDQUFNLEVBQU4sQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBRFosQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUZWLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxVQUFELEdBQWMsQ0FIZCxDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsa0JBQUQsR0FBeUIsSUFBQyxDQUFBLFFBQUosR0FBa0IsRUFBbEIsR0FBMEIsQ0FKaEQsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsQ0FM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QUdBLEdBQWMsT0FBQSxDQUFRLGtDQUFSLENBSGQsQ0FBQTs7QUFBQSxlQUlBLEdBQWtCLE9BQUEsQ0FBUSxzQ0FBUixDQUpsQixDQUFBOztBQUFBLFlBS0EsR0FBZSxPQUFBLENBQVEsaUNBQVIsQ0FMZixDQUFBOztBQUFBLFdBTUEsR0FBYyxPQUFBLENBQVEsa0NBQVIsQ0FOZCxDQUFBOztBQUFBLENBU0EsQ0FBRSxRQUFGLENBQVcsQ0FBQyxLQUFaLENBQWtCLFNBQUEsR0FBQTtBQUlkLE1BQUEsSUFBQTtTQUFBLElBQUEsR0FBVyxJQUFBLFlBQUEsQ0FDUDtBQUFBLElBQUEsRUFBQSxFQUFJLE1BQUo7R0FETyxFQUpHO0FBQUEsQ0FBbEIsQ0FUQSxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuVmlld0Jhc2UgPSByZXF1aXJlIFwiLi9WaWV3QmFzZS5jb2ZmZWVcIlxuU2Nyb2xsQmFyID0gcmVxdWlyZSBcIi4uL3V0aWwvU2Nyb2xsQmFyLmNvZmZlZVwiXG5IZWFkZXJBbmltYXRpb24gPSByZXF1aXJlICcuLi9wbHVnaW5zL0hlYWRlckFuaW1hdGlvbi5jb2ZmZWUnXG5jbG91ZHMgPSByZXF1aXJlICcuLi9wYWdlcy9hbmltYXRpb25zL2Nsb3Vkcy5jb2ZmZWUnXG5cbmNsYXNzIEFuaW1hdGlvbkJhc2UgZXh0ZW5kcyBWaWV3QmFzZVxuXG5cbiAgICBjb25zdHJ1Y3RvcjogKGVsKSAtPlxuICAgICAgICBzdXBlcihlbClcbiAgICAgICAgQHRpbWVsaW5lID0gbnVsbFxuICAgICAgICBAdG91Y2hZID0gMFxuICAgICAgICBAdG91Y2hZTGFzdCA9IDBcbiAgICAgICAgQGdsb2JhbFNjcm9sbEFtb3VudCA9IGlmIEBpc1RhYmxldCB0aGVuIC41IGVsc2UgMVxuICAgICAgICBAcHJldlNjcm9sbFRvID0gMFxuICAgICAgICBAcHJldkRlbHRhID0gMFxuICAgICAgICBAY3VycmVudFByb2dyZXNzID0gMFxuICAgICAgICBAdG90YWxBbmltYXRpb25UaW1lID0gMTBcbiAgICAgICAgQHNtb290aE11bHRpcGxpZXIgPSA1XG4gICAgICAgIEBuYXZUaW1lciA9IG51bGxcbiAgICAgICAgQHZpZGVvID0gbnVsbFxuICAgICAgICBAaW5saW5lVmlkZW8gPSBudWxsXG4gICAgICAgIEBpc1RhYmxldCA9ICQoJ2h0bWwnKS5oYXNDbGFzcygndGFibGV0JylcblxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgIHN1cGVyKClcblxuICAgICAgICBpZiAhQGlzUGhvbmUgIFxuICAgICAgICAgICAgQHJlc2V0VGltZWxpbmUoKVxuICAgICAgICAgICAgQHRvZ2dsZVRvdWNoTW92ZSgpXG4gICAgICAgICAgICBAb25SZXNpemUoKVxuICAgICAgICAgICAgQHVwZGF0ZVRpbWVsaW5lKClcblxuICAgIGluaXRDb21wb25lbnRzOiAtPlxuICAgICAgICBAaGVhZGVyID0gbmV3IEhlYWRlckFuaW1hdGlvbiBcbiAgICAgICAgICAgIGVsOidoZWFkZXInXG5cbiAgICBcblxuXG4gICAgdG9nZ2xlVG91Y2hNb3ZlOiAoKSA9PlxuICAgICAgICAkKGRvY3VtZW50KS5vZmYgJ3Njcm9sbCcgLCBAb25TY3JvbGxcbiAgICAgICAgXG4gICAgICAgIEBzY3JvbGwgPVxuICAgICAgICAgICAgcG9zaXRpb246IDBcbiAgICAgICAgICAgIHNjcm9sbFRvcDogMFxuICAgICAgICAkKGRvY3VtZW50KS5zY3JvbGwgQG9uU2Nyb2xsXG4gICAgICAgIEBvblNjcm9sbCgpXG5cblxuICAgIGdldFNjcm9sbGFibGVBcmVhOiAtPlxuICAgICAgICBNYXRoLmFicygkKFwiI2NvbnRlbnRcIikub3V0ZXJIZWlnaHQoKSAtIEBzdGFnZUhlaWdodClcbiAgICBcbiAgICBnZXRTY3JvbGxUb3A6IC0+XG4gICAgICAgICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpIC8gQGdldFNjcm9sbGFibGVBcmVhKCkgICAgIFxuICAgIFxuICAgIFxuICAgIHNldFNjcm9sbFRvcDogKHBlcikgLT4gICAgICBcbiAgICAgICAgcG9zID0gQGdldFNjcm9sbGFibGVBcmVhKCkgKiBwZXJcbiAgICAgICAgd2luZG93LnNjcm9sbFRvIDAgLCBwb3NcblxuXG4gICAgc2V0RHJhZ2dhYmxlUG9zaXRpb246IChwZXIpIC0+ICAgICAgICBcbiAgICAgICAgcG9zID0gQGdldFNjcm9sbGFibGVBcmVhKCkgKiBwZXIgICAgICAgIFxuICAgICAgICBUd2Vlbk1heC5zZXQgJChcIiNjb250ZW50XCIpICxcbiAgICAgICAgICAgIHk6IC1wb3MgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgIG9uU2Nyb2xsOiAoZSkgPT5cbiAgICAgICAgaWYgJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkgPiAzMFxuICAgICAgICAgICAgJCgnLmNpcmMtYnRuLXdyYXBwZXInKS5hZGRDbGFzcyAnaW52aXNpYmxlJ1xuICAgICAgICAgICAgXG4gICAgICAgIEBzY3JvbGwucG9zaXRpb24gPSBAZ2V0U2Nyb2xsVG9wKClcbiAgICAgICAgQHNjcm9sbC5zY3JvbGxUb3AgPSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKVxuICAgICAgICBAdXBkYXRlVGltZWxpbmUoKSAgICAgICAgXG4gICAgICAgIFxuXG4gICAgb25EcmFnOiAoZSkgPT5cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBAc2Nyb2xsLnBvc2l0aW9uID0gTWF0aC5hYnMgQHNjcm9sbC55IC8gIEBnZXRTY3JvbGxhYmxlQXJlYSgpXG4gICAgICAgIEBzY3JvbGwuc2Nyb2xsVG9wID0gLUBzY3JvbGwueVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBAdXBkYXRlVGltZWxpbmUoKVxuXG5cbiAgICBvblJlc2l6ZTogPT5cbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBpZiAhQGlzVGFibGV0XG4gICAgICAgICAgICBAcmVzZXRUaW1lbGluZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgQGNlbnRlck9mZnNldCA9IChAc3RhZ2VIZWlnaHQgKiAuNjY2NylcbiAgICAgICAgaWYgQHNjcm9sbD9cbiAgICAgICAgICAgIHBvcyA9IEBzY3JvbGwucG9zaXRpb24gICAgICAgICAgICBcbiAgICAgICAgICAgIEB0b2dnbGVUb3VjaE1vdmUoKVxuICAgICAgICAgICAgaWYgIUBpc1RhYmxldFxuICAgICAgICAgICAgICAgIEBzZXRTY3JvbGxUb3AocG9zKVxuICAgICAgICAgICAgXG5cbiAgICByZXNldFRpbWVsaW5lOiA9PlxuICAgICAgICBAdGltZWxpbmUgPSBuZXcgVGltZWxpbmVNYXhcbiAgICAgICAgQHRyaWdnZXJzID0gW11cbiAgICAgICAgQHBhcmFsbGF4ID0gW11cblxuICAgICAgICAkKCdbZGF0YS1jbG91ZF0nKS5lYWNoIChpLHQpID0+XG4gICAgICAgICAgICAkZWwgPSAkKHQpXG4gICAgICAgICAgICAkY2xvc2VzdENvbnRhaW5lciA9ICRlbC5jbG9zZXN0KCdbZGF0YS1jbG91ZC1jb250YWluZXJdJylcbiAgICAgICAgICAgIGluaXRQb3MgPSAkY2xvc2VzdENvbnRhaW5lci5kYXRhKCkuY2xvdWRDb250YWluZXIuaW5pdFBvc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNsb3VkRnVuY3Rpb24gPSBjbG91ZHNcbiAgICAgICAgICAgICAgICAkZWw6JGVsXG5cbiAgICAgICAgICAgIGlmIGluaXRQb3MgXG4gICAgICAgICAgICAgICAgY2xvdWRGdW5jdGlvbihpbml0UG9zKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgQHBhcmFsbGF4LnB1c2ggY2xvdWRGdW5jdGlvblxuXG4gICAgdXBkYXRlVGltZWxpbmU6ID0+XG4gICAgICAgIFxuICAgICAgICBAaGVhZGVyLmFuaW1hdGVIZWFkZXIoQHNjcm9sbC5zY3JvbGxUb3ApXG5cbiAgICAgICAgZm9yIHQgaW4gQHRyaWdnZXJzXG4gICAgICAgICAgICBpZiBAc2Nyb2xsLnNjcm9sbFRvcCA+IHQub2Zmc2V0IC0gQGNlbnRlck9mZnNldFxuICAgICAgICAgICAgICAgIHQuYS5wbGF5KClcbiAgICAgICAgICAgIGVsc2UgaWYgQHNjcm9sbC5zY3JvbGxUb3AgKyBAc3RhZ2VIZWlnaHQgPCB0Lm9mZnNldFxuICAgICAgICAgICAgICAgIHQuYS5wYXVzZWQodHJ1ZSlcbiAgICAgICAgICAgICAgICB0LmEuc2VlaygwKVxuXG5cbiAgICAgICAgZm9yIHAgaW4gQHBhcmFsbGF4XG4gICAgICAgICAgICBwKEBzY3JvbGwucG9zaXRpb24pXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gQW5pbWF0aW9uQmFzZVxuIiwiY2xhc3MgUGx1Z2luQmFzZSBleHRlbmRzIEV2ZW50RW1pdHRlclxuXG5cblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBAJGVsID0gaWYgb3B0cy5lbD8gdGhlbiAkIG9wdHMuZWxcblxuICAgICAgICBAaW5pdGlhbGl6ZShvcHRzKVxuXG5cblxuXG4gICAgaW5pdGlhbGl6ZTogKG9wdHMpIC0+XG4gICAgICAgIEBhZGRFdmVudHMoKVxuXG4gICAgYWRkRXZlbnRzOiAtPlxuXG5cblxuICAgIHJlbW92ZUV2ZW50czogLT5cblxuXG4gICAgZGVzdHJveTogLT5cbiAgICAgICAgQHJlbW92ZUV2ZW50cygpXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQbHVnaW5CYXNlXG5cbiIsIlxuU2hhcmVyID0gcmVxdWlyZSBcIi4uL3V0aWwvU2hhcmVyLmNvZmZlZVwiIFxuXG5cbmNsYXNzIFZpZXdCYXNlIGV4dGVuZHMgRXZlbnRFbWl0dGVyXG5cblxuXG5cblxuICAgIGNvbnN0cnVjdG9yOiAoZWwpIC0+XG5cbiAgICAgICAgQCRlbCA9ICQoZWwpXG4gICAgICAgIEBpc1RhYmxldCA9ICQoXCJodG1sXCIpLmhhc0NsYXNzKFwidGFibGV0XCIpXG4gICAgICAgIEBpc1Bob25lID0gJChcImh0bWxcIikuaGFzQ2xhc3MoXCJwaG9uZVwiKVxuICAgICAgICBAY2RuUm9vdCA9ICQoJ2JvZHknKS5kYXRhKCdjZG4nKSBvciBcIi9cIlxuICAgICAgICAkKHdpbmRvdykub24gXCJyZXNpemUuYXBwXCIgLCBAb25SZXNpemVcblxuICAgICAgICBAc3RhZ2VIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgQHN0YWdlV2lkdGggPSAkKHdpbmRvdykud2lkdGgoKVxuICAgICAgICBAbW91c2VYID0gMFxuICAgICAgICBAbW91c2VZID0gMFxuXG4gICAgICAgICNAZGVsZWdhdGVFdmVudHMoQGdlbmVyYXRlRXZlbnRzKCkpXG4gICAgICAgIEBpbml0aWFsaXplKClcblxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgQGluaXRDb21wb25lbnRzKClcblxuICAgIGluaXRDb21wb25lbnRzOiAtPlxuXG4gICAgb25SZXNpemU6ID0+XG4gICAgICAgIEBzdGFnZUhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKVxuICAgICAgICBAc3RhZ2VXaWR0aCA9ICQod2luZG93KS53aWR0aCgpXG5cblxuICAgIGdlbmVyYXRlRXZlbnRzOiAtPlxuICAgICAgICByZXR1cm4ge31cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdCYXNlXG4iLCJCYXNpY092ZXJsYXkgPSByZXF1aXJlICcuLi9wbHVnaW5zL0Jhc2ljT3ZlcmxheS5jb2ZmZWUnXG5TdmdJbmplY3QgPSByZXF1aXJlICcuLi9wbHVnaW5zL1N2Z0luamVjdC5jb2ZmZWUnXG5cblxuXG5pZiB3aW5kb3cuY29uc29sZSBpcyB1bmRlZmluZWQgb3Igd2luZG93LmNvbnNvbGUgaXMgbnVsbFxuICB3aW5kb3cuY29uc29sZSA9XG4gICAgbG9nOiAtPlxuICAgIHdhcm46IC0+XG4gICAgZmF0YWw6IC0+XG5cblxuXG4kKGRvY3VtZW50KS5yZWFkeSAtPlxuICAgICMkKCcuc3ZnLWluamVjdCcpLnN2Z0luamVjdCgpXG4gICAgI25ldyBTdmdJbmplY3QgXCIuc3ZnLWluamVjdFwiXG4gICAgXG4gICAgYmFzaWNPdmVybGF5cyA9IG5ldyBCYXNpY092ZXJsYXlcbiAgICAgICAgZWw6ICQoJyNjb250ZW50JylcblxuXG4gICAgJCgnLnNjcm9sbHRvJykuY2xpY2sgLT5cbiAgICAgICB0ID0gJCh0aGlzKS5kYXRhKCd0YXJnZXQnKVxuICAgICAgICQoJ2JvZHknKS5hbmltYXRlKHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogJCgnIycrdCkub2Zmc2V0KCkudG9wIC0gNzAgIyA3MCBmb3IgdGhlIGNvbGxhcHNlZCBoZWFkZXJcbiAgICAgICAgfSk7XG5cbiAgICAjaWYgd2luZG93LmRkbHM/XG4gICAgIyBjb25zb2xlLmxvZyAnY2xpY2t5J1xuICAgICQod2luZG93KS5jbGljayAtPlxuICAgICAgICBpZiB3aW5kb3cuZGRscz9cbiAgICAgICAgICAgICQuZWFjaCB3aW5kb3cuZGRscywgKGksIHQpIC0+XG4gICAgICAgICAgICAgICAgaWYgdC5pc09wZW4gYW5kIG5vdCB0LmlzSG92ZXJlZFxuICAgICAgICAgICAgICAgICAgICB0LmNsb3NlTWVudSgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgJCgnW2RhdGEtZGVwdGhdJykuZWFjaCAtPlxuICAgICAgICAkZWwgPSAkKEApXG4gICAgICAgIGRlcHRoID0gJGVsLmRhdGEoKS5kZXB0aFxuICAgICAgICBcbiAgICAgICAgJGVsLmNzcygnei1pbmRleCcsIGRlcHRoKVxuICAgICAgICBUd2Vlbk1heC5zZXQgJGVsICwgXG4gICAgICAgICAgICB6OiBkZXB0aCAqIDEwXG5cblxuXG4gICAgJCgnYm9keScpLm9uICdET01Ob2RlSW5zZXJ0ZWQnLCAgLT5cbiAgICAgICAgJCgnYScpLmVhY2ggLT4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBocmVmID0gJChAKS5hdHRyKCdocmVmJylcbiAgICAgICAgICAgIGlmIGhyZWY/XG4gICAgICAgICAgICAgICAgaHJlZiA9IGhyZWYudHJpbSgpXG4gICAgICAgICAgICAgICAgaWYgaHJlZi5pbmRleE9mKCdodHRwOi8vJykgaXMgMCBvciBocmVmLmluZGV4T2YoJ2h0dHBzOi8vJykgaXMgMCBvciBocmVmLmluZGV4T2YoJy5wZGYnKSBpcyAoaHJlZi5sZW5ndGggLSA0KVxuICAgICAgICAgICAgICAgICAgICAkKEApLmF0dHIoJ3RhcmdldCcsICdfYmxhbmsnKVxuXG5cbiAgICAkKCcuY2lyY2xlLCAuY2lyY2xlLW91dGVyJykub24oJ21vdXNlZW50ZXInLCAtPlxuICAgICAgICBUd2Vlbk1heC50bygkKHRoaXMpLCAuMzUsXG4gICAgICAgICAgICBzY2FsZTogMS4wNSxcbiAgICAgICAgICAgIGVhc2U6IFBvd2VyMi5lYXNlT3V0XG4gICAgICAgIClcbiAgICApXG5cbiAgICAkKCcuY2lyY2xlLCAuY2lyY2xlLW91dGVyJykub24oJ21vdXNlbGVhdmUnLCAtPlxuICAgICAgICBUd2Vlbk1heC50bygkKHRoaXMpLCAuMzUsXG4gICAgICAgICAgICBzY2FsZTogMSxcbiAgICAgICAgICAgIGVhc2U6IFBvd2VyMi5lYXNlT3V0XG4gICAgICAgIClcbiAgICApXG5cbiAgICAkKCcjam9icy1nYWxsZXJ5IC5zd2lwZXItY29udGFpbmVyIGxpJykub24oJ21vdXNlZW5ldGVyJywgLT5cbiAgICAgICAgY29uc29sZS5sb2cgJ2hlbGxvJ1xuICAgIClcblxuXG4jIHRoaXMgaXMgc2hpdHR5LCBidXQgaXQncyBteSBvbmx5IHdvcmthcm91bmQgZm9yIHRoZSBjbGlwcGluZyBpc3N1ZSAoQ0YtMTcxKVxuZG9jdW1lbnQub25yZWFkeXN0YXRlY2hhbmdlID0gKCkgLT5cbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSBpcyAnY29tcGxldGUnKVxuICAgICAgICBzZXRUaW1lb3V0KC0+XG4gICAgICAgICAgICAkKCcucXVvdGUnKS5hZGRDbGFzcygna2VlcGl0YWh1bmRyZWQnKVxuICAgICAgICAsIDIwMClcbiIsIkFuaW1hdGlvbkJhc2UgPSByZXF1aXJlIFwiLi4vYWJzdHJhY3QvQW5pbWF0aW9uQmFzZS5jb2ZmZWVcIlxuUGFya3NMaXN0ID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9QYXJrc0xpc3QuY29mZmVlJ1xuRHJhZ2dhYmxlR2FsbGVyeSA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvRHJhZ2dhYmxlR2FsbGVyeS5jb2ZmZWUnXG5GYWRlR2FsbGVyeSA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvRmFkZUdhbGxlcnkuY29mZmVlJ1xuSGVhZGVyQW5pbWF0aW9uID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9IZWFkZXJBbmltYXRpb24uY29mZmVlJ1xuUmVzaXplQnV0dG9ucyA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvUmVzaXplQnV0dG9ucy5jb2ZmZWUnXG5JbmxpbmVWaWRlbyA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvSW5saW5lVmlkZW8uY29mZmVlJ1xuRnJhbWVBbmltYXRpb24gPSByZXF1aXJlICcuLi9wbHVnaW5zL2NvYXN0ZXJzL0ZyYW1lQW5pbWF0aW9uLmNvZmZlZSdcbmFuaW1hdGlvbnMgPSByZXF1aXJlICcuL2FuaW1hdGlvbnMvZ3JvdXBzYWxlcy5jb2ZmZWUnXG5hbmltYXRpb25zID0gcmVxdWlyZSAnLi9hbmltYXRpb25zL3dob3dlYXJlLmNvZmZlZSdcbmdsb2JhbEFuaW1hdGlvbnMgPSByZXF1aXJlICcuL2FuaW1hdGlvbnMvZ2xvYmFsLmNvZmZlZSdcbiAgICAgICAgXG5cbmNsYXNzIFdob1dlQXJlUGFnZSBleHRlbmRzIEFuaW1hdGlvbkJhc2VcblxuXG4gICAgY29uc3RydWN0b3I6IChlbCkgLT5cbiAgICAgICAgQHRvdGFsQW5pbWF0aW9uVGltZSA9IDI1XG4gICAgICAgIHN1cGVyKGVsKVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgaW5pdENvbXBvbmVudHM6IC0+XG4gICAgICAgIHN1cGVyKClcblxuICAgICAgICBpZiAhQGlzUGhvbmVcblxuICAgICAgICAgICAgdmlkZW8gPSBuZXcgSW5saW5lVmlkZW9cbiAgICAgICAgICAgICAgICBlbDogJCgnLnBsYXllcicpXG5cblxuICAgICAgICAgICAgY29hc3RlciA9IG5ldyBGcmFtZUFuaW1hdGlvblxuICAgICAgICAgICAgICAgIGlkOlwid2hvd2VhcmUtY29hc3Rlci0xXCJcbiAgICAgICAgICAgICAgICBlbDpcIiN3aG93ZWFyZS1zZWN0aW9uMVwiXG4gICAgICAgICAgICAgICAgYmFzZVVybDogXCIje0BjZG5Sb290fWNvYXN0ZXJzL1wiXG4gICAgICAgICAgICAgICAgdXJsOiBcInNob3QtMi9kYXRhLmpzb25cIlxuXG4gICAgICAgICAgICBjb2FzdGVyLmxvYWRGcmFtZXMoKVxuICAgICAgICAgICAgICAgIFxuXG4gICAgICAgIHdob3dlYXJlID0gbmV3IEZhZGVHYWxsZXJ5XG4gICAgICAgICAgICBlbDogXCIjd2hvLXdlLWFyZVwiXG5cbiAgICByZXNldFRpbWVsaW5lOiA9PlxuICAgICAgICBzdXBlcigpXG5cbiAgICAgICAgQHBhcmFsbGF4LnB1c2ggZ2xvYmFsQW5pbWF0aW9ucy5jbG91ZHMoXCIjc2VjdGlvbjFcIiwgMCAsIDEgLCBpZiBAaXNUYWJsZXQgdGhlbiAxIGVsc2UgNSlcblxuICAgICAgICBpZiAhQGlzUGhvbmVcbiAgICAgICAgICAgIEB0cmlnZ2Vycy5wdXNoIGFuaW1hdGlvbnMudG9wSGVhZGxpbmUoKVxuICAgICAgICAgICAgQHRyaWdnZXJzLnB1c2ggYW5pbWF0aW9ucy5tYWluVmlkZW8oKVxuICAgICAgICAgICAgQHRyaWdnZXJzLnB1c2ggYW5pbWF0aW9ucy5ib3R0b21IZWFkbGluZSgpXG4gICAgICAgIFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBXaG9XZUFyZVBhZ2VcblxuXG4iLCJcbmNsb3Vkc09uVXBkYXRlID0gKGVsLCBkdXJhdGlvbikgLT5cbiAgICB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgXG4gICAgVHdlZW5NYXguc2V0IGVsLFxuICAgICAgICB4OiAtMjA1MFxuICAgICAgICBcbiAgICBUd2Vlbk1heC50byBlbCwgZHVyYXRpb24gLCBcbiAgICAgICAgeDogd2luZG93V2lkdGhcbiAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgIGNsb3Vkc09uVXBkYXRlIGVsICwgZHVyYXRpb25cbiAgICAgICAgXG5cblxuc2V0Qm9iaW5nID0gKCRlbCAsIGR1cixkZWxheSkgLT5cbiAgICBcbiAgICBAaXNUYWJsZXQgPSAkKCdodG1sJykuaGFzQ2xhc3MgJ3RhYmxldCdcbiAgICB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgd2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIFxuICAgIGlmIHdpbmRvdy5pbm5lcldpZHRoID4gNzY3ICYmICFAaXNUYWJsZXRcblxuIyAgICAgICAgZCA9ICgod2luZG93LmlubmVyV2lkdGggKyAxNTUwKSAvIHdpbmRvdy5pbm5lcldpZHRoKSAqIDE4MFxuICAgICAgICBkID0gMzAwIC0gKCRlbC5kYXRhKCdjbG91ZCcpLnNwZWVkICogMjUwKVxuICAgICAgICBcbiAgICAgICAgVHdlZW5NYXgudG8gJGVsICwgZHVyICwgXG4gICAgICAgICAgICB4OiB3aWR0aFxuICAgICAgICAgICAgZGVsYXk6ZGVsYXlcbiAgICAgICAgICAgIGVhc2U6TGluZWFyLmVhc2VOb25lXG4gICAgICAgICAgICBvblVwZGF0ZVBhcmFtczogW1wie3NlbGZ9XCJdXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiAodHdlZW4pID0+XG4gICAgICAgICAgICAgICAgY2xvdWRzT25VcGRhdGUgJGVsICwgZFxuXG5cblxuc2V0UmVnaXN0cmF0aW9uID0gKCRlbCwgcmVnaXN0cmF0aW9uKSAtPlxuICAgIFxuICAgIHZhbHVlcyA9IHJlZ2lzdHJhdGlvbi5zcGxpdChcInxcIilcbiAgICBcbiAgICB2aWV3cG9ydFdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICBzZXR0aW5ncyA9IHt9XG4gICAgXG4gICAgYWxpZ24gPSB2YWx1ZXNbMF1cbiAgICBvZmZzZXQgPSBwYXJzZUludCh2YWx1ZXNbMV0pIG9yIDBcblxuICAgIHN3aXRjaCBhbGlnblxuICAgICAgICB3aGVuICdsZWZ0J1xuICAgICAgICAgICAgc2V0dGluZ3MueCA9IDAgKyBvZmZzZXRcbiAgICAgICAgd2hlbiAncmlnaHQnXG4gICAgICAgICAgICBzZXR0aW5ncy54ID0gdmlld3BvcnRXaWR0aCArIG9mZnNldCAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIHdoZW4gJ2NlbnRlcidcbiAgICAgICAgICAgIHNldHRpbmdzLnggPSAodmlld3BvcnRXaWR0aCouNSAtICRlbC53aWR0aCgpKi41KSArIG9mZnNldCAgICBcbiAgICBcbiAgICBUd2Vlbk1heC5zZXQgJGVsICwgc2V0dGluZ3NcbiAgICBcbiAgICBcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gKG9wdGlvbnMpIC0+XG4gICAgXG4gICAgJGVsID0gb3B0aW9ucy4kZWxcbiAgICAkY29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJ1tkYXRhLWNsb3VkLWNvbnRhaW5lcl0nKSAgICBcbiAgICBjb250YWluZXJUb3BQYWRkaW5nID0gcGFyc2VJbnQoJGNvbnRhaW5lci5jc3MoJ3BhZGRpbmctdG9wJykpXG4gICAgXG4gICAgXG4gICAgdHJ5ICAgICAgICBcbiAgICAgICAgY2xvdWREYXRhID0gJGVsLmRhdGEoKS5jbG91ZFxuICAgICAgIFxuICAgIGNhdGNoIGVcbiAgICAgICAgY29uc29sZS5lcnJvciBcIkNsb3VkIERhdGEgUGFyc2UgRXJyb3I6IEludmFsaWQgSlNPTlwiICAgICAgICBcbiAgICAgICAgXG4gICAgY2xvdWREZXB0aCA9ICRlbC5kYXRhKCdkZXB0aCcpXG4gICAgY2xvdWRTcGVlZCA9IGNsb3VkRGF0YS5zcGVlZCBvciAxXG4gICAgY2xvdWRPZmZzZXRNaW4gPSBwYXJzZUludChjbG91ZERhdGEub2Zmc2V0TWluKSBvciAwXG4gICAgY2xvdWRSZXZlcnNlID0gY2xvdWREYXRhLnJldmVyc2Ugb3IgZmFsc2VcbiAgICBjbG91ZFJlZ2lzdHJhdGlvbiA9IGNsb3VkRGF0YS5yZWdpc3RlciBvciBcImNlbnRlclwiXG5cblxuICAgIFxuICAgIHNldFJlZ2lzdHJhdGlvbiAkZWwgLCBjbG91ZFJlZ2lzdHJhdGlvblxuICAgIGlmICEoJGNvbnRhaW5lci5oYXNDbGFzcygnc3BsYXNoLWNvbnRhaW5lcicpKVxuICAgICAgICBvZmZMZWZ0ID0gJGVsLm9mZnNldCgpLmxlZnRcbiAgICAgICAgZGlzdGFuY2UgPSAod2luZG93LmlubmVyV2lkdGggLSBvZmZMZWZ0KSAvIHdpbmRvdy5pbm5lcldpZHRoXG4jICAgICAgICBwZXJjZW50YWdlID0gZGlzdGFuY2UgKiAxODAgXG4gICAgICAgIHBlcmNlbnRhZ2UgPSAyNTAgLSAoY2xvdWRTcGVlZCAqIDIwMClcbiAgICAgICAgXG4gICAgICAgIHNldEJvYmluZyAkZWwsIHBlcmNlbnRhZ2UsIGNsb3VkU3BlZWQvNVxuIFxuICAgIG1pblkgPSAkY29udGFpbmVyLm9mZnNldCgpLnRvcFxuICAgIG1heFkgPSAkKGRvY3VtZW50KS5vdXRlckhlaWdodCgpXG4gICAgdG90YWxSYW5nZT0gJGNvbnRhaW5lci5vdXRlckhlaWdodCgpXG4gICAgXG4gICAgXG4gICAgXG4gICAgcGVyY2VudGFnZVJhbmdlID0gdG90YWxSYW5nZS9tYXhZXG4gICAgbWluUmFuZ2VQZXJjZW50YWdlID0gbWluWS9tYXhZICAgIFxuICAgIG1heFJhbmdlUGVyY2VudGFnZSA9IG1pblJhbmdlUGVyY2VudGFnZSArIHBlcmNlbnRhZ2VSYW5nZVxuXG4jICAgIGNvbnNvbGUubG9nIG1pblJhbmdlUGVyY2VudGFnZSAsIG1heFJhbmdlUGVyY2VudGFnZVxuXG5cbiAgICBsYXN0U2Nyb2xsUGVyY2VudGFnZSA9IHByZXNlbnRTY3JvbGxQZXJjZW50YWdlID0gc2Nyb2xsRGVsdGEgPSAwXG5cbiAgICBpZiAoJGNvbnRhaW5lci5oYXNDbGFzcygnc3BsYXNoLWNvbnRhaW5lcicpICYmICQoJ2h0bWwnKS5oYXNDbGFzcygndGFibGV0JykpXG4gICAgICAgICRjb250YWluZXIuaGlkZSgpXG4gICAgICAgIFxuICAgIFxuICAgIHJldHVybiAocG9zKSAtPlxuICAgICAgICBpZiAoKCRjb250YWluZXIuaGFzQ2xhc3MoJ3NwbGFzaC1jb250YWluZXInKSkgJiYgKCQoJ2h0bWwnKS5oYXNDbGFzcygndGFibGV0JykpKVxuICAgICAgICAgICAgVHdlZW5NYXgudG8gJGVsICwgMC4yNSAsXG4gICAgICAgICAgICAgICAgZWFzZTpTaW5lLmVhc2VPdXRcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZSA9IChwb3MgLSBtaW5SYW5nZVBlcmNlbnRhZ2UpIC8gKG1heFJhbmdlUGVyY2VudGFnZSAtIG1pblJhbmdlUGVyY2VudGFnZSlcbiAgICAgICAgICAgIGlmIDAgPD0gY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2UgPD0gMVxuICAgICAgICAgICAgICAgIHByZXNlbnRTY3JvbGxQZXJjZW50YWdlID0gY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2VcbiAgICAgICAgICAgICAgICBpZiBjbG91ZFJldmVyc2UgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2UgPSAxIC0gY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjbG91ZFkgPSAodG90YWxSYW5nZSAqIGNsb3VkUG9zaXRpb25QZXJjZW50YWdlKSAqIGNsb3VkU3BlZWRcbiAgICAgICAgICAgICAgICBjbG91ZFkgPSBjbG91ZFkgLSBjb250YWluZXJUb3BQYWRkaW5nXG4gICAgICAgICAgICAgICAgY2xvdWRZID0gY2xvdWRZICsgY2xvdWRPZmZzZXRNaW5cbiAgICBcbiAgICAgICAgICAgICAgICAjTWF5YmUgdXNlIHRoaXM/XG4gICAgICAgICAgICAgICAgc2Nyb2xsRGVsdGEgPSBNYXRoLmFicyhsYXN0U2Nyb2xsUGVyY2VudGFnZSAtIHByZXNlbnRTY3JvbGxQZXJjZW50YWdlKSAqIDNcbiAgICBcbiAgICAgICAgICAgICAgICBsYXN0U2Nyb2xsUGVyY2VudGFnZSA9IHByZXNlbnRTY3JvbGxQZXJjZW50YWdlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvICRlbCAsIDAuMjUgLCBcbiAgICAgICAgICAgICAgICAgICAgeTpjbG91ZFlcbiAgICAgICAgICAgICAgICAgICAgZWFzZTpTaW5lLmVhc2VPdXRcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICBcbiIsIlxuXG4jQ291bnRcbmNvbW1hcyA9ICh4KSAtPlxuICB4LnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpXG5cblxubW9kdWxlLmV4cG9ydHMuY291bnQgPSAoZWwpIC0+XG4gICAgXG4gICAgXG4gICAgJGVsID0gJChlbClcbiAgICB0YXJnZXRWYWwgPSAkKGVsKS5odG1sKClcbiAgICBudW0gPSAkKGVsKS50ZXh0KCkuc3BsaXQoJywnKS5qb2luKCcnKVxuXG4gICAgc3RhcnQgPSBudW0gKiAuOTk5NVxuICAgIGNoYW5nZSA9IG51bSAqIC4wMDA1XG4gICAgXG4gICAgdGwgPSBuZXcgVGltZWxpbmVNYXhcbiAgICAgICAgb25TdGFydDogLT5cbiAgICAgICAgICAgICRlbC5odG1sKFwiNDJcIilcbiAgICAgICAgb25Db21wbGV0ZTogLT5cbiAgICAgICAgICAgICRlbC5odG1sKHRhcmdldFZhbClcbiAgICAgICAgICAgIFxuICAgIHR3ZWVucyA9IFtdXG5cbiAgICAgICAgXG5cbiAgICB0d2VlbnMucHVzaCBUd2Vlbk1heC5mcm9tVG8gJGVsICwgMC4yNSwgICAgICAgIFxuICAgICAgICBhdXRvQWxwaGE6MFxuICAgICAgICBpbW1lZGlhdGVSZW5kZXI6dHJ1ZVxuICAgICAgICBlYXNlOlF1aW50LmVhc2VPdXRcbiAgICAsXG4gICAgICAgIGF1dG9BbHBoYToxXG5cbiAgICB0d2VlbnMucHVzaCBUd2Vlbk1heC50byAkZWwgLCAxLjUsIFxuICAgICAgICBlYXNlOlF1aW50LmVhc2VPdXRcbiAgICAgICAgXG4gICAgICAgIG9uVXBkYXRlOiAtPlxuICAgICAgICAgICAgdmFsdWUgPSBwYXJzZUludChzdGFydCArIHBhcnNlSW50KGNoYW5nZSAqIEBwcm9ncmVzcygpKSlcbiAgICAgICAgICAgIHZhbHVlID0gY29tbWFzKHZhbHVlKVxuICAgICAgICAgICAgZWxzID0gdmFsdWUuc3BsaXQoJycpXG4gICAgICAgICAgICBodG1sID0gJydcbiAgICAgICAgICAgICQuZWFjaCBlbHMsIChuYW1lLCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBodG1sICs9IGlmICh2YWx1ZSBpcyAnLCcpIHRoZW4gJywnIGVsc2UgJzxzcGFuPicgKyB2YWx1ZSArICc8L3NwYW4+J1xuICAgICAgICAgICAgJGVsLmh0bWwoaHRtbClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgdGwuYWRkIHR3ZWVuc1xuICAgIFxuICAgIHRsXG5cbiNTY3JvbGxpbmdcblxuXG5cbnR3ZWVuUGFyYWxsYXggPSAocG9zLHR3ZWVuLG1pbixtYXgsZHVyKSAtPlxuXG5cblxuICAgIHBlcmNlbnQgPSAoKHBvcy1taW4pIC8gKG1heC1taW4pKSAqIDFcbiAgICBhbW91bnQgPSBwZXJjZW50ICogZHVyXG5cblxuXG4gICAgaWYgcG9zIDw9IG1heCBhbmQgcG9zID49IG1pblxuICAgICAgICAjY29uc29sZS5sb2cgcGVyY2VudCAsIHR3ZWVuLm5zLm5hbWUgLCBwb3NcbiAgICAgICAgaWYgTWF0aC5hYnMoYW1vdW50IC0gdHdlZW4udGltZSgpKSA+PSAuMDAxXG4gICAgICAgICAgICB0d2Vlbi50d2VlblRvICBhbW91bnQgLFxuICAgICAgICAgICAgICAgIG92ZXJ3cml0ZTpcInByZWV4aXN0aW5nXCIsXG4gICAgICAgICAgICAgICAgZWFzZTpRdWFkLmVhc2VPdXRcblxuXG5tb2R1bGUuZXhwb3J0cy5jbG91ZHMgPSAoc2V0SWQsIG1pbiwgbWF4LCBkdXIpIC0+XG5cbiAgICBtaW5Qb3MgPSBtaW5cbiAgICBtYXhQb3MgPSBtYXhcbiAgICBkdXJhdGlvbiA9IGR1clxuXG4gICAgJGVsID0gJChcIi5jbG91ZHMje3NldElkfVwiKVxuICAgIGNsb3VkcyA9ICRlbC5maW5kKFwiLmNsb3VkXCIpXG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuICAgIHR3ZWVuLm5zID0ge31cbiAgICB0d2Vlbi5ucy5uYW1lID0gc2V0SWRcblxuICAgIHR3ZWVucyA9IFtdXG4gICAgZm9yIGNsb3VkLGkgaW4gY2xvdWRzXG4gICAgICAgIG9mZnNldCA9IFwiKz0jezI1MCooaSsxKX1cIlxuXG5cbiAgICAgICAgdHdlZW5zLnB1c2ggVHdlZW5NYXgudG8gY2xvdWQgLCBkdXJhdGlvbiAsXG4gICAgICAgICAgICB5Om9mZnNldFxuXG5cblxuICAgIHR3ZWVuLmFkZCB0d2VlbnNcblxuXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICByZXR1cm4gKHBvcykgLT5cbiAgICAgICAgdHdlZW5QYXJhbGxheCBwb3MgLCB0d2VlbiAsIG1pblBvcywgbWF4UG9zLCBkdXJhdGlvblxuXG5tb2R1bGUuZXhwb3J0cy5zY3JvbGwgPSAobWluUG9zLCBtYXhQb3MsIGR1cmF0aW9uLCBlbGVtKSAtPlxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcbiAgICB0d2Vlbi5ucyA9IHt9XG4gICAgdHdlZW4ubnMubmFtZSA9IFwiLnNjcm9sbHRvXCJcbiAgICBcbiAgICB0d2VlbnMgPSBbXVxuICAgIHR3ZWVucy5wdXNoIFR3ZWVuTWF4LnRvIGVsZW0gLCBkdXJhdGlvbiAsIG9wYWNpdHk6MFxuICAgIFxuICAgIHR3ZWVuLmFkZCB0d2VlbnNcbiAgICBcbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICByZXR1cm4gKHBvcykgLT5cbiAgICAgICAgdHdlZW5QYXJhbGxheCBwb3MgLCB0d2VlbiAsIG1pblBvcywgbWF4UG9zLCBkdXJhdGlvblxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzLmFybXMgPSAobWluLCBtYXgsIGR1cikgLT5cblxuICAgIG1pblBvcyA9IG1pblxuICAgIG1heFBvcyA9IG1heFxuICAgIGR1cmF0aW9uID0gZHVyXG5cbiAgICBhcm0gPSAkKFwiLmFybXNcIilcblxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgdHdlZW4ubnMgPSB7fVxuICAgIHR3ZWVuLm5zLm5hbWUgPSBcIi5hcm1zXCJcblxuICAgIHR3ZWVucyA9IFtdXG4gICAgdHdlZW5zLnB1c2ggVHdlZW5NYXgudG8gYXJtICwgZHVyYXRpb24gLCB0b3A6MFxuXG5cblxuICAgIHR3ZWVuLmFkZCB0d2VlbnNcblxuXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICByZXR1cm4gKHBvcykgLT5cbiAgICAgICAgdHdlZW5QYXJhbGxheCBwb3MgLCB0d2VlbiAsIG1pblBvcywgbWF4UG9zLCBkdXJhdGlvblxuIiwiZ2xvYmFsID0gcmVxdWlyZSAnLi9nbG9iYWwuY29mZmVlJ1xuXG5tb2R1bGUuZXhwb3J0cy50b3BIZWFkbGluZSA9ICgpIC0+XG5cbiAgICAkZWwgPSAkKCcjZ3JvdXAtc2FsZXMnKVxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLmZpbmQoJy50b3AtaGVhZGxpbmUgLnRpdGxlLWJ1Y2tldCBoMScpLCAuMzUsXG4gICAgICAgIHk6IC0xMFxuICAgICAgICAsYWxwaGE6IDBcbiAgICAsXG4gICAgICAgIHk6IDBcbiAgICAgICAgLGFscGhhOiAxXG4gICAgKSwgMC41XG5cbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbC5maW5kKCcudG9wLWhlYWRsaW5lIC50aXRsZS1idWNrZXQgaDInKSwgLjM1LFxuICAgICAgICB5OiAtMTBcbiAgICAgICAgLGFscGhhOiAwXG4gICAgLFxuICAgICAgICB5OiAwXG4gICAgICAgICxhbHBoYTogMVxuICAgICksIFwiLT0uM1wiXG5cbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbC5maW5kKCcudG9wLWhlYWRsaW5lIC50aXRsZS1idWNrZXQgcCcpLCAuMzUsXG4gICAgICAgIHk6IC0xMFxuICAgICAgICAsYWxwaGE6IDBcbiAgICAsXG4gICAgICAgIHk6IDBcbiAgICAgICAgLGFscGhhOiAxXG4gICAgKSwgXCItPS4zXCJcblxuXG5cbiAgICBhOiB0d2VlblxuICAgIG9mZnNldDokZWwub2Zmc2V0KCkudG9wXG5cblxubW9kdWxlLmV4cG9ydHMuc2Nyb2xsQ2lyY2xlID0gLT5cbiAgICAkZWwgPSAkKFwiI2dyb3VwLXNhbGVzIC5jaXJjLWJ0bi13cmFwcGVyXCIpXG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZChcInBcIikgLCAuMyAsXG4gICAgICAgIGF1dG9BbHBoYTowXG4gICAgLFxuICAgICAgICBhdXRvQWxwaGE6MVxuICAgIClcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLmZpbmQoXCJhXCIpICwgLjQ1ICxcbiAgICAgICAgc2NhbGU6MFxuICAgICAgICByb3RhdGlvbjoxODBcbiAgICAgICAgaW1tZWRpYXRlUmVuZGVyOnRydWVcbiAgICAsXG4gICAgICAgIHNjYWxlOjFcbiAgICAgICAgcm90YXRpb246MFxuICAgICAgICBlYXNlOkJhY2suZWFzZU91dFxuICAgICkgLCBcIi09LjJcIlxuXG4gICAgYTogdHdlZW5cbiAgICBvZmZzZXQ6JGVsLm9mZnNldCgpLnRvcFxuXG5cbm1vZHVsZS5leHBvcnRzLnNlbGVjdEJveCA9ICgpIC0+XG4gICAgJGVsID0gJCgnI2dyb3VwLXNhbGVzICNzZWxlY3QnKVxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLCAuMzUsXG4gICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgLHNjYWxlOiAuNzVcbiAgICAsXG4gICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgLHNjYWxlOiAxXG4gICAgKSwgMC4yNVxuXG4gICAgdHdlZW4ucGF1c2VkKHRydWUpXG4gICAgYTp0d2VlblxuICAgIG9mZnNldDokZWwub2Zmc2V0KCkudG9wXG4gICAgXG4gICAgXG5cbm1vZHVsZS5leHBvcnRzLnMyVG9wSGVhZGxpbmUgPSAoKSAtPlxuICAgICRlbCA9ICQoJyN0ZXN0aW1vbmlhbHMnKVxuICAgIFxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZCgnLnRpdGxlLWJ1Y2tldCBoMScpLCAuMzUsXG4gICAgICAgIHk6IC0xMFxuICAgICAgICBhbHBoYTogMFxuICAgICxcbiAgICAgICAgeTogMFxuICAgICAgICBhbHBoYTogMVxuICAgIClcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLmZpbmQoJy50aXRsZS1idWNrZXQgaDInKSwgLjM1LFxuICAgICAgICB5OiAtMTBcbiAgICAgICAgYWxwaGE6IDBcbiAgICAsXG4gICAgICAgIHk6IDBcbiAgICAgICAgYWxwaGE6IDFcbiAgICApLCBcIi09LjNcIlxuXG4gICAgdHdlZW4ucGF1c2VkKHRydWUpXG4gICAgYTp0d2VlblxuICAgIG9mZnNldDokZWwub2Zmc2V0KCkudG9wXG5cblxubW9kdWxlLmV4cG9ydHMub2ZmZXJpbmdzVGVzdGltb25pYWxzID0gKCkgLT5cbiAgICAkZWwgPSAkKCcjdGVzdGltb25pYWxzJylcblxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG5cbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbC5maW5kKCcuc3dpcGVyLWNvbnRhaW5lcicpLCAuMzUgLFxuICAgICAgICBhbHBoYTogMFxuICAgICxcbiAgICAgICAgYWxwaGE6IDFcbiAgICApLCAwLjVcblxuICAgIGZvciBhcnJvdyxpIGluICRlbC5maW5kKCcuZ2FsLWFycm93JylcbiAgICAgICAgaWYgaSUyID09IDBcbiAgICAgICAgICAgIGRpc3RhbmNlID0gLTIwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRpc3RhbmNlID0gMjBcblxuICAgICAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCQoYXJyb3cpLCAuMzUgLFxuICAgICAgICAgICAgeDogZGlzdGFuY2VcbiAgICAgICAgICAgICxhbHBoYTogMFxuICAgICAgICAsXG4gICAgICAgICAgICB4OiAwXG4gICAgICAgICAgICAsYWxwaGE6IDFcbiAgICAgICAgKSwgMFxuXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICBhOnR3ZWVuXG4gICAgb2Zmc2V0OiRlbC5vZmZzZXQoKS50b3BcbiIsIlxuZ2xvYmFsID0gcmVxdWlyZSAnLi9nbG9iYWwuY29mZmVlJ1xuXG5cbm1vZHVsZS5leHBvcnRzLnRvcEhlYWRsaW5lID0gKCkgLT5cbiAgICAkZWwgPSAkKCcjd2hvLXdlLWFyZS5zZWN0aW9uLWlubmVyJylcbiAgICBcbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuICAgIFxuICAgIGZvciBjaGlsZCxpIGluICRlbC5maW5kKCcudGl0bGUtYnVja2V0OmZpcnN0LWNoaWxkJykuY2hpbGRyZW4oKVxuICAgICAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCQoY2hpbGQpICwgLjM1ICwgXG4gICAgICAgICAgICB5OiAtMjVcbiAgICAgICAgICAgICxhbHBoYTogMFxuICAgICAgICAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAsYWxwaGE6IDFcbiAgICAgICAgKSwgKDAgKyAuMSppKVxuICAgICAgICBcbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbC5maW5kKCcudG9wLWhlYWRsaW5lIGEuYnRuJyksIC4zNSAsXG4gICAgICAgIGFscGhhOiAwXG4gICAgICAgICxzY2FsZTogMC41XG4gICAgLFxuICAgICAgICBhbHBoYTogMVxuICAgICAgICAsc2NhbGU6IDEsIFxuICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgJGVsLmZpbmQoJy50b3AtaGVhZGxpbmUgYS5idG4nKS5jc3MoJ3RyYW5zZm9ybScsICcnKVxuICAgICksIFwiLT0uMlwiXG5cbiAgICBhOnR3ZWVuXG4gICAgb2Zmc2V0OiRlbC5vZmZzZXQoKS50b3BcbiAgICBcbiAgICBcbm1vZHVsZS5leHBvcnRzLm1haW5WaWRlbyA9IC0+XG4gICAgJGVsID0gJCgnI3doby13ZS1hcmUgI3BsYXllci1jb250YWluZXInKVxuICAgIFxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZCgnbGknKSwgLjUgLFxuICAgICAgICBhbHBoYTogMFxuICAgICAgICAseTogMTBcbiAgICAsXG4gICAgICAgIGFscGhhOiAxXG4gICAgICAgICx5OiAwXG4gICAgKVxuXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICAgICAgXG4gICAgYTp0d2VlblxuICAgIG9mZnNldDokZWwub2Zmc2V0KCkudG9wXG4gICAgXG4gICAgXG5tb2R1bGUuZXhwb3J0cy5ib3R0b21IZWFkbGluZSA9IC0+XG4gICAgJGVsID0gJCgnI3doby13ZS1hcmUgLnRpdGxlLWJ1Y2tldC5zaXgnKVxuICAgIFxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZCgnaDEnKSwgLjM1ICxcbiAgICAgICAgeTogLTI1XG4gICAgICAgICxhbHBoYTogMFxuICAgICxcbiAgICAgICAgeTogMFxuICAgICAgICAsYWxwaGE6IDFcbiAgICApXG4gICAgXG4gICAgXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwubmV4dCgpLmZpbmQoJ2EnKSwgLjM1ICxcbiAgICAgICAgYWxwaGE6IDBcbiAgICAgICAgLHNjYWxlOiAwLjVcbiAgICAsXG4gICAgICAgIGFscGhhOiAxXG4gICAgICAgICxzY2FsZTogMSxcbiAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgICRlbC5uZXh0KCkuZmluZCgnYScpLmNzcygndHJhbnNmb3JtJywgJycpXG4gICAgKSwgXCItPS4yXCJcblxuICAgIHR3ZWVuLnBhdXNlZCh0cnVlKVxuICAgIFxuICAgIGE6dHdlZW5cbiAgICBvZmZzZXQ6JGVsLm9mZnNldCgpLnRvcFxuIiwiUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuXG5jbGFzcyBCYXNpY092ZXJsYXkgZXh0ZW5kcyBQbHVnaW5CYXNlXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgIyBAJGVsID0gJChlbClcbiAgICAgICAgQG92ZXJsYXlUcmlnZ2VycyA9ICQoJy5vdmVybGF5LXRyaWdnZXInKVxuICAgICAgICBAYWRkRXZlbnRzKClcblxuICAgICAgICBzdXBlcigpXG5cbiAgICBcbiAgICBhZGRFdmVudHM6IC0+XG5cbiAgICAgICAgJCgnI2Jhc2ljLW92ZXJsYXksICNvdmVybGF5LWJhc2ljLWlubmVyIC5vdmVybGF5LWNsb3NlJykuY2xpY2soQGNsb3NlT3ZlcmxheSk7XG4gICAgICAgIEBvdmVybGF5VHJpZ2dlcnMuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgJCh0KS5vbiAnY2xpY2snLCBAb3Blbk92ZXJsYXlcblxuICAgICAgICAjZ2xvYmFsIGJ1eSB0aWNrZXRzIGxpbmtzXG5cbiAgICAgICAgJCgnLm92ZXJsYXktY29udGVudCcpLm9uICdjbGljaycsICdsaScgLEBvcGVuTGlua1xuIyAgICAgICAgJCh3aW5kb3cpLm9uICdyZXNpemUnLCBAY2xvc2VPdmVybGF5XG4gICAgICAgIFxuICAgIG9wZW5MaW5rOiAoZSkgPT5cbiAgICAgICAgdGFyZ2V0ID0gJChlLnRhcmdldCkucGFyZW50cyAnLnBhcmsnXG4gICAgICAgIGlmIHRhcmdldC5kYXRhKCd0YXJnZXQnKVxuICAgICAgICAgICAgd2luZG93Lm9wZW4odGFyZ2V0LmRhdGEoJ3RhcmdldCcpKVxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgXG4gICAgY2xvc2VPdmVybGF5OiAoZSkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICEgKChlLnR5cGUgaXMgJ3Jlc2l6ZScpIGFuZCAoJCgnI292ZXJsYXkgdmlkZW86dmlzaWJsZScpLnNpemUoKSA+IDApKVxuICAgICAgICAgICAgJCgnLm92ZXJsYXktYmFzaWMnKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICB9LCAoKSAtPiBcbiAgICAgICAgICAgICAgICAkKCcub3ZlcmxheS1iYXNpYycpLmhpZGUoKVxuICAgICAgICAgICAgICAgICQoJyNvdmVybGF5JykuaGlkZSgpXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvcGVuT3ZlcmxheTogKHQpIC0+XG4gICAgICAgICRlbCA9ICQodGhpcylcbiAgICAgICAgb3ZlcmxheVNvdXJjZSA9ICRlbC5kYXRhKCdzb3VyY2UnKVxuICAgICAgICAkdGFyZ2V0RWxlbWVudCA9ICQoJyNvdmVybGF5LWJhc2ljLWlubmVyIC5vdmVybGF5LWNvbnRlbnQnKVxuICAgICAgICBpc05ld3MgPSAkZWwuaGFzQ2xhc3MoJ25ld3MnKVxuXG4gICAgICAgICQoJyNvdmVybGF5Jykuc2hvdygpXG4gICAgICAgIFxuICAgICAgICBpZiAkZWwuaGFzQ2xhc3MgJ29mZmVyaW5ncy1vcHRpb24nXG4gICAgICAgICAgICBvYyA9ICQoJyNvZmZlcmluZ3Mtb3ZlcmxheS1jb250ZW50JylcbiAgICAgICAgICAgIG9jLmZpbmQoJ2gxLnRpdGxlJykudGV4dCgkZWwuZmluZCgnc3Bhbi5vZmZlcicpLnRleHQoKSlcbiAgICAgICAgICAgIG9jLmZpbmQoJ2Rpdi5kZXNjcmlwdGlvbicpLmh0bWwoJGVsLmZpbmQoJ2Rpdi5kZXNjcmlwdGlvbicpLmh0bWwoKSlcbiAgICAgICAgICAgIG9jLmZpbmQoJy5jb250ZW50Lm1lZGlhJykuY3NzKHtiYWNrZ3JvdW5kSW1hZ2U6IFwidXJsKCdcIiArICRlbC5maW5kKCdzcGFuLm1lZGlhJykuZGF0YSgnc291cmNlJykgKyBcIicpXCJ9KVxuXG4gICAgICAgIFxuICAgICAgICBpZiAoJCgnIycgKyBvdmVybGF5U291cmNlKS5zaXplKCkgaXMgMSkgXG4gICAgICAgICAgICAjaHRtbCA9ICQoJyMnICsgb3ZlcmxheVNvdXJjZSkuaHRtbCgpXG5cbiAgICAgICAgICAgICR0YXJnZXRFbGVtZW50LmNoaWxkcmVuKCkuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgICAgICQodCkuYXBwZW5kVG8oJyNvdmVybGF5LWNvbnRlbnQtc291cmNlcycpXG5cbiAgICAgICAgICAgIGlmIGlzTmV3c1xuICAgICAgICAgICAgICAgIGMgPSAkZWwubmV4dCgnLmFydGljbGUnKS5jbG9uZSgpXG4gICAgICAgICAgICAgICAgJCgnI292ZXJsYXlfY29udGVudCcpLmh0bWwoYy5odG1sKCkpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcjJyArIG92ZXJsYXlTb3VyY2UpLmFwcGVuZFRvKCR0YXJnZXRFbGVtZW50KVxuXG4gICAgICAgICAgICAkZWwgPSAkKCcjb3ZlcmxheS1iYXNpYy1pbm5lcicpXG4gICAgICAgICAgICBpc1NtYWxsID0gJGVsLmhlaWdodCgpIDwgJCh3aW5kb3cpLmhlaWdodCgpIGFuZCAkKCR0YXJnZXRFbGVtZW50KS5maW5kKCcuc2VsZWN0LWJveC13cmFwcGVyJykuc2l6ZSgpIGlzIDBcbiAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKVxuICAgICAgICAgICAgYWRkdG9wID0gaWYgaXNTbWFsbCB0aGVuIDAgZWxzZSBzY3JvbGxUb3A7XG4gICAgICAgICAgICBwb3NpdGlvbiA9ICRlbC5jc3MgJ3Bvc2l0aW9uJywgaWYgaXNTbWFsbCB0aGVuICdmaXhlZCcgZWxzZSAnYWJzb2x1dGUnXG4gICAgICAgICAgICB0b3AgPSBNYXRoLm1heCgwLCAoKCQod2luZG93KS5oZWlnaHQoKSAtICRlbC5vdXRlckhlaWdodCgpKSAvIDIpICsgYWRkdG9wKVxuICAgICAgICAgICAgaWYgIWlzU21hbGwgYW5kICh0b3AgPCBzY3JvbGxUb3ApIHRoZW4gdG9wID0gc2Nyb2xsVG9wXG4gICAgICAgICAgICAkZWwuY3NzKFwidG9wXCIsIHRvcCArIFwicHhcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgaGVpZ2h0OlxuICAgICAgICAgICAgIyRlbC5jc3MoXCJsZWZ0XCIsIE1hdGgubWF4KDAsICgoJCh3aW5kb3cpLndpZHRoKCkgLSAkZWwub3V0ZXJXaWR0aCgpKSAvIDIpICsgYWRkbGVmdCkgKyBcInB4XCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcub3ZlcmxheS1iYXNpYycpLmNzcygnb3BhY2l0eScsIDApLmRlbGF5KDApLnNob3coKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgICAgICB9KVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzaWNPdmVybGF5XG5cblxuXG5cblxuXG4iLCJcblBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblZpZXdCYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvVmlld0Jhc2UuY29mZmVlJ1xuXG5jbGFzcyBEcmFnZ2FibGVHYWxsZXJ5IGV4dGVuZHMgUGx1Z2luQmFzZVxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cblxuICAgICAgICBAZ2FsbGVyeSA9IEAkZWwuZmluZCBcIi5zd2lwZXItY29udGFpbmVyXCJcblxuICAgICAgICBpZihAZ2FsbGVyeS5sZW5ndGggPCAxKVxuICAgICAgICAgICAgQGdhbGxlcnkgPSBAJGVsLmZpbHRlciBcIi5zd2lwZXItY29udGFpbmVyXCJcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBvcHRzLnBhZ2UgPT0gJ2pvYnMnXG4gICAgICAgICAgICBAam9ic1BhZ2UgPSB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBqb2JzUGFnZSA9IGZhbHNlXG5cbiAgICAgICAgQGdhbGxlcnlDcmVhdGVkID0gZmFsc2VcbiAgICAgICAgQGdhbGxlcnlDb250YWluZXIgPSBAZ2FsbGVyeS5maW5kKCd1bCcpXG4gICAgICAgIEBnYWxsZXJ5SXRlbXMgPSBAZ2FsbGVyeUNvbnRhaW5lci5maW5kKCdsaScpXG4gICAgICAgIEBjdXJyZW50SW5kZXggPSBAZ2FsbGVyeUl0ZW1zLmZpbHRlcignLnNlbGVjdGVkJykuZGF0YSgnaW5kZXgnKVxuICAgICAgICBAYWNyb3NzID0gb3B0cy5hY3Jvc3Mgb3IgMVxuICAgICAgICBAYW5nbGVMZWZ0ID0gQGdhbGxlcnkuZmluZCAnLmZhLWFuZ2xlLWxlZnQnXG4gICAgICAgIEBhbmdsZVJpZ2h0ID0gQGdhbGxlcnkuZmluZCAnLmZhLWFuZ2xlLXJpZ2h0J1xuICAgICAgICBAcGFnaW5hdGlvbiA9IG9wdHMucGFnaW5hdGlvbiBvciBmYWxzZVxuICAgICAgICBAY29udHJvbHMgPSBvcHRzLmNvbnRyb2wgb3IgbnVsbFxuICAgICAgICBAam9ic0Nhcm91c2VsU3RvcHBlZCA9IGZhbHNlXG4gICAgICAgIEBqb2JzQ2Fyb3VzZWxQYXVzZWQgPSBmYWxzZVxuICAgICAgICBAam9ic0ludGVydmFsID0gbnVsbFxuXG4gICAgICAgIEBzaXplQ29udGFpbmVyKClcblxuICAgICAgICBAYWRkQXJyb3dzKClcblxuICAgICAgICBzdXBlcigpXG5cbiAgICBhZGRFdmVudHM6IC0+XG4gICAgICAgICQod2luZG93KS5vbiAncmVzaXplJyAsIEBzaXplQ29udGFpbmVyXG5cbiAgICAgICAgJChAJGVsKS5vbiAnY2xpY2snLCAnLmZhLWFuZ2xlLWxlZnQnLCBAcHJldlNsaWRlXG4gICAgICAgICQoQCRlbCkub24gJ2NsaWNrJywgJy5mYS1hbmdsZS1yaWdodCcsIEBuZXh0U2xpZGVcbiAgICAgICAgaWYgQGpvYnNQYWdlID09IHRydWVcbiAgICAgICAgICAgICQoQCRlbCkub24gJ2NsaWNrJywgJy5zd2lwZXItY29udGFpbmVyJywgQHN0b3BKb2JzQ2Fyb3VzZWxcbiAgICAgICAgICAgICQoQCRlbCkub24gJ21vdXNlb3ZlcicsICcuc3dpcGVyLWNvbnRhaW5lcicsIEBwYXVzZUpvYnNDYXJvdXNlbFxuICAgICAgICAgICAgJChAJGVsKS5vbiAnbW91c2VsZWF2ZScsICcuc3dpcGVyLWNvbnRhaW5lcicsIEByZXN1bWVKb2JzQ2Fyb3VzZWxcbiAgICAgICAgICAgIFxuICAgICAgICBcbiAgICBzdG9wSm9ic0Nhcm91c2VsOiA9PlxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAam9ic0ludGVydmFsKVxuICAgICAgICBAam9ic0Nhcm91c2VsU3RvcHBlZCA9IHRydWVcblxuICAgIHBhdXNlSm9ic0Nhcm91c2VsOiA9PlxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAam9ic0ludGVydmFsKVxuICAgICAgICBAam9ic0Nhcm91c2VsUGF1c2VkID0gdHJ1ZVxuXG4gICAgcmVzdW1lSm9ic0Nhcm91c2VsOiA9PlxuICAgICAgICBpZiBAam9ic0Nhcm91c2VsU3RvcHBlZCA9PSBmYWxzZVxuICAgICAgICAgICAgQGpvYnNJbnRlcnZhbCA9IHNldEludGVydmFsICgtPlxuICAgICAgICAgICAgICAgICQoJyNqb2JzLWdhbGxlcnkgLmZhLWFuZ2xlLXJpZ2h0JykudHJpZ2dlcignY2xpY2snKVxuICAgICAgICAgICAgKSwgODAwMFxuICAgICAgICAgICAgQGpvYnNDYXJvdXNlbFBhdXNlZCA9IGZhbHNlXG5cbiAgICBwcmV2U2xpZGU6IChlKSA9PlxuICAgICAgICB0aGF0ID0gQG15U3dpcGVyXG4gICAgICAgIGdhbCA9IEBnYWxsZXJ5XG4gICAgICAgIFxuICAgICAgICBUd2Vlbk1heC50bygkKGdhbCksIC4yLCBcbiAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICAgIHNjYWxlOiAxLjFcbiAgICAgICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICAgICAgdGhhdC5zd2lwZVByZXYoKVxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnNldCgkKGdhbCksXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlOiAxXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvKCQoZ2FsKSwgLjM1LCBcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgICAgICAgICAgICBkZWxheTogLjM1XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICApXG4gICAgXG4gICAgbmV4dFNsaWRlOiAoZSkgPT5cbiAgICAgICAgdGhhdCA9IEBteVN3aXBlclxuICAgICAgICBnYWwgPSBAZ2FsbGVyeVxuXG4gICAgICAgIFR3ZWVuTWF4LnRvKCQoZ2FsKSwgLjIsXG4gICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICBzY2FsZTogMS4xXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgICAgIHRoYXQuc3dpcGVOZXh0KClcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC5zZXQoJChnYWwpLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogMC44NVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC50bygkKGdhbCksIC4zNSxcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogMVxuICAgICAgICAgICAgICAgICAgICBkZWxheTogLjM1XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICApXG5cblxuICAgIGFkZEFycm93czogLT5cbiAgICAgICAgQGlzUGhvbmUgPSAkKFwiaHRtbFwiKS5oYXNDbGFzcyhcInBob25lXCIpXG5cbiAgICAgICAgYXJyb3dMZWZ0ID0gJChcIjxpIGNsYXNzPSdnYWwtYXJyb3cgZmEgZmEtYW5nbGUtbGVmdCc+PC9pPlwiKVxuICAgICAgICBhcnJvd1JpZ2h0ID0gJChcIjxpIGNsYXNzPSdnYWwtYXJyb3cgZmEgZmEtYW5nbGUtcmlnaHQnPjwvaT5cIilcblxuICAgICAgICBAJGVsLmFwcGVuZChhcnJvd0xlZnQsIGFycm93UmlnaHQpXG5cbiAgICAgICAgJCgnLmdhbC1hcnJvdycpLm9uICdjbGljaycsIC0+XG4gICAgICAgICAgICAkKEApLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICB0aGF0ID0gJChAKVxuICAgICAgICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICAgICAgICAgICQodGhhdCkucmVtb3ZlQ2xhc3MgJ2FjdGl2ZScsIDEwMFxuICAgICAgICAgICAgXG5cbiAgICBzaXplQ29udGFpbmVyOiAoKSA9PlxuICAgICAgICBAZ2FsbGVyeUNvbnRhaW5lci5jc3MoJ3dpZHRoJywgXCIxMDAlXCIpXG4gICAgICAgIGlmIEBhY3Jvc3MgPCAyXG4gICAgICAgICAgICBAZ2FsbGVyeUl0ZW1zLmNzcygnd2lkdGgnICwgXCIxMDAlXCIpXG4gICAgICAgIGVsc2UgaWYgQGFjcm9zcyA8IDNcbiAgICAgICAgICAgIEBnYWxsZXJ5SXRlbXMuY3NzKCd3aWR0aCcgLCBcIjUwJVwiKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZ2FsbGVyeUl0ZW1zLmNzcygnd2lkdGgnICwgXCIzMy4zMzMzMzMlXCIpXG5cbiAgICAgICAgQGl0ZW1XaWR0aCA9IEBnYWxsZXJ5SXRlbXMuZmlyc3QoKS5vdXRlcldpZHRoKClcbiAgICAgICAgaXRlbUxlbmd0aCA9IEBnYWxsZXJ5SXRlbXMubGVuZ3RoXG5cbiAgICAgICAgQGdhbGxlcnlJdGVtcy5jc3MoJ3dpZHRoJywgQGl0ZW1XaWR0aClcbiAgICAgICAgQGdhbGxlcnlDb250YWluZXIuY3NzKCd3aWR0aCcsIGl0ZW1MZW5ndGggKiAoQGl0ZW1XaWR0aCkpXG4gICAgICAgIFR3ZWVuTWF4LnNldCBAZ2FsbGVyeUNvbnRhaW5lciAsXG4gICAgICAgICAgICB4OiAtQGN1cnJlbnRJbmRleCAqIEBpdGVtV2lkdGhcbiAgICAgICAgXG4gICAgICAgIGlmICFAZ2FsbGVyeUNyZWF0ZWQgICAgXG4gICAgICAgICAgICBAY3JlYXRlRHJhZ2dhYmxlKClcbiMgICAgICAgICAgICBAbXlTd2lwZXIuc3dpcGVOZXh0KClcbiAgICAgICAgXG4gICAgY3JlYXRlRHJhZ2dhYmxlOiAoKSAtPlxuICAgICAgICBpdGVtTGVuZ3RoID0gQGdhbGxlcnlJdGVtcy5sZW5ndGhcblxuICAgICAgICBpZiBAc2Nyb2xsIHRoZW4gQHNjcm9sbC5raWxsKClcblxuICAgICAgICBpZCA9ICQoQC4kZWwpLmF0dHIgJ2lkJ1xuXG5cbiAgICAgICAgaWYgQHBhZ2luYXRpb25cbiAgICAgICAgICAgIEBhZGRQYWdpbmF0aW9uKClcblxuICAgICAgICBpZiBAYWNyb3NzIDwgM1xuICAgICAgICAgICAgaWYgQHBhZ2luYXRpb25cbiAgICAgICAgICAgICAgICBAbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcjJyArIGlkICsgJyAuc3dpcGVyLWNvbnRhaW5lcicse1xuICAgICAgICAgICAgICAgICAgICBsb29wOnRydWUsXG4gICAgICAgICAgICAgICAgICAgIGdyYWJDdXJzb3I6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IEBhY3Jvc3MsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb246ICcjJyArIGlkICsgJyAuc3dpcGVyLXBhZ2luYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQXNSYW5nZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblRvdWNoRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZVN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyR3JvdXA6IEBhY3Jvc3NcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBteVN3aXBlciA9IG5ldyBTd2lwZXIoJyMnICsgaWQgKyAnIC5zd2lwZXItY29udGFpbmVyJyx7XG4gICAgICAgICAgICAgICAgICAgIGxvb3A6dHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZ3JhYkN1cnNvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogQGFjcm9zcyxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyR3JvdXA6IEBhY3Jvc3NcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblRvdWNoRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZVN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBteVN3aXBlciA9IG5ldyBTd2lwZXIoJyMnICsgaWQgKyAnIC5zd2lwZXItY29udGFpbmVyJyx7XG4gICAgICAgICAgICAgICAgbG9vcDp0cnVlLFxuICAgICAgICAgICAgICAgIGdyYWJDdXJzb3I6IHRydWUsXG4gICAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcbiAgICAgICAgICAgICAgICBzbGlkZXNQZXJHcm91cDogM1xuICAgICAgICAgICAgICAgIG9uVG91Y2hTdGFydDogQG9uU2xpZGVDaGFuZ2VTdGFydCxcbiAgICAgICAgICAgICAgICBvblRvdWNoRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlU3RhcnQ6IEBvblNsaWRlQ2hhbmdlU3RhcnQsXG4gICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZUVuZDogQG9uU2xpZGVDaGFuZ2VFbmQsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgIEBnYWxsZXJ5Q3JlYXRlZCA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIGlmIEBqb2JzUGFnZSA9PSB0cnVlXG4gICAgICAgICAgICBAam9ic0ludGVydmFsID0gc2V0SW50ZXJ2YWwgKC0+XG4gICAgICAgICAgICAgICAgJCgnI2pvYnMtZ2FsbGVyeSAuZmEtYW5nbGUtcmlnaHQnKS50cmlnZ2VyKCdjbGljaycpXG4gICAgICAgICAgICApLCA4MDAwXG5cbiAgICAgICAgXG4gICAgb25TbGlkZUNoYW5nZVN0YXJ0OiA9PlxuICAgICAgICAkKEAuJGVsKS5jbG9zZXN0KCcuYWRkLWJvcmRlci1mYWRlJykuYWRkQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICQoQC4kZWwpLmZpbmQoJy5hZGQtYm9yZGVyLWZhZGUnKS5hZGRDbGFzcyAnc2hvd2luZydcblxuICAgIG9uU2xpZGVDaGFuZ2VFbmQ6ID0+XG4gICAgICAgICQoQC4kZWwpLmNsb3Nlc3QoJy5hZGQtYm9yZGVyLWZhZGUnKS5yZW1vdmVDbGFzcyAnc2hvd2luZydcbiAgICAgICAgJChALiRlbCkuZmluZCgnLmFkZC1ib3JkZXItZmFkZScpLnJlbW92ZUNsYXNzICdzaG93aW5nJ1xuICAgICAgICBcbiAgICAgICAgaWYgIShAY29udHJvbHMgPT0gbnVsbClcbiAgICAgICAgICAgIHBhcmsgPSBAbXlTd2lwZXIuYWN0aXZlU2xpZGUoKS5kYXRhKCdpZCcpXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuc3dpcGVyLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuY2Fyb3VzZWwtd3JhcHBlcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSBkaXYjJyArIHBhcmspLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSBkaXYjJyArIHBhcmspLnBhcmVudCgpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgKEBwYXJrTGlzdClcbiAgICAgICAgICAgIEBwYXJrTGlzdC5zZWxlY3RMb2dvICQoQC4kZWwpLmZpbmQoJy5zd2lwZXItc2xpZGUtYWN0aXZlJykuZGF0YSgnaWQnKTtcblxuICAgIGFkZFBhZ2luYXRpb246ID0+XG4gICAgICAgIHdyYXBwZXIgPSAkKFwiPGRpdiBjbGFzcz0nc3dpcGVyLXBhZ2luYXRpb24nPjwvZGl2PlwiKVxuICAgICAgICAkKEAuJGVsKS5maW5kKCcuc3dpcGVyLWNvbnRhaW5lcicpLmFkZENsYXNzKCdhZGRQYWdpbmF0aW9uJykuYXBwZW5kKHdyYXBwZXIpXG5cblxuICAgIGdvdG86IChpZCwgaW5pdFZhbCkgLT5cblxuICAgICAgICBpZiBub3QgaW5pdFZhbCB0aGVuICQoJ2JvZHknKS5hbmltYXRlIHsgc2Nyb2xsVG9wOiAkKCcjJyArICgkKEAkZWwpLmF0dHIoJ2lkJykpKS5vZmZzZXQoKS50b3AgfVxuXG4gICAgICAgIHRvSW5kZXggPSAkKFwibGkucGFya1tkYXRhLWlkPScje2lkfSddXCIpLmRhdGEoJ2luZGV4JylcblxuICAgICAgICB0bCA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgICAgIHRsLmFkZCBUd2Vlbk1heC50byBAZ2FsbGVyeUNvbnRhaW5lciAsIC40LFxuICAgICAgICAgICAgYXV0b0FscGhhOjBcblxuICAgICAgICB0bC5hZGRDYWxsYmFjayA9PlxuICAgICAgICAgICAgQG15U3dpcGVyLnN3aXBlVG8odG9JbmRleCwgMClcblxuICAgICAgICB0bC5hZGQgVHdlZW5NYXgudG8gQGdhbGxlcnlDb250YWluZXIgLCAuNCxcbiAgICAgICAgICAgIGF1dG9BbHBoYToxXG5cbiAgICAgICAgQGN1cnJlbnRJbmRleCA9IHRvSW5kZXhcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdnYWJsZUdhbGxlcnlcblxuIiwiXG5QbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5WaWRlb092ZXJsYXkgPSByZXF1aXJlICcuL1ZpZGVvT3ZlcmxheS5jb2ZmZWUnXG5cbmNsYXNzIEZhZGVHYWxsZXJ5IGV4dGVuZHMgUGx1Z2luQmFzZVxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nICdpbml0aWFsaXplOiAnLCBvcHRzXG5cbiAgICAgICAgQHBhZ2UgPSBvcHRzLnBhZ2Ugb3IgbnVsbFxuICAgICAgICB0YXJnZXQgPSBvcHRzLnRhcmdldCBvciBudWxsXG4gICAgICAgIFxuICAgICAgICBpZiAodGFyZ2V0PylcbiAgICAgICAgICAgIEAkdGFyZ2V0ID0gJCh0YXJnZXQpXG4gICAgICAgIFxuICAgICAgICBpZiAhKEBwYWdlID09IG51bGwpXG4gICAgICAgICAgICBAaW5mb0JveGVzID0gQCRlbC5maW5kIFwibGkudmlkZW9cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAaW5mb0JveGVzID0gQCRlbC5maW5kIFwibGlcIlxuICAgICAgICAgICAgXG4gICAgICAgIEBjdXJyZW50U2VsZWN0ZWQgPSBAaW5mb0JveGVzLmZpbHRlcihcIjpmaXJzdC1jaGlsZFwiKVxuXG4gICAgICAgIHN1cGVyKClcbiAgICBcbiAgICBhZGRFdmVudHM6IC0+ICBcblxuICAgICAgICBAaW5mb0JveGVzLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgICRidG4gPSAkKHQpLmZpbmQoJy52aWRlby1idXR0b24nKVxuXG4gICAgICAgICAgICBpZiAkYnRuLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICB2aWRlb0V2ZW50cyA9IG5ldyBIYW1tZXIoJGJ0blswXSlcbiAgICAgICAgICAgICAgICB2aWRlb0V2ZW50cy5vbiAndGFwJyAsIEBoYW5kbGVWaWRlb0ludGVyYWN0aW9uXG5cblxuXG5cbiAgICBoYW5kbGVWaWRlb0ludGVyYWN0aW9uOiAoZSkgPT5cblxuICAgICAgICAkdGFyZ2V0ID0gJChlLnRhcmdldCkuY2xvc2VzdChcIi52aWRlby1idXR0b25cIilcbiAgICAgICAgaWYgKCR0YXJnZXQuc2l6ZSgpIGlzIDApIFxuICAgICAgICAgICAgJHRhcmdldCA9IGUudGFyZ2V0XG4gICAgICAgIFxuICAgICAgICBpZiAkdGFyZ2V0LmRhdGEoJ3R5cGUnKSA9PSAnaW1hZ2UnXG4gICAgICAgICAgICBpZiAoJHRhcmdldC5kYXRhKCdmdWxsJykpXG4gICAgICAgICAgICAgICAgQGltYWdlU3JjID0gJHRhcmdldC5kYXRhKCdmdWxsJylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAaW1hZ2VTcmMgPSAkdGFyZ2V0LmNoaWxkcmVuKCdpbWcnKS5hdHRyKCdzcmMnKVxuICAgICAgICBkYXRhID1cbiAgICAgICAgICAgIG1wNDokdGFyZ2V0LmRhdGEoJ21wNCcpXG4gICAgICAgICAgICB3ZWJtOiR0YXJnZXQuZGF0YSgnd2VibScpXG4gICAgICAgICAgICBwb3N0ZXI6QGltYWdlU3JjXG5cbiAgICAgICAgVmlkZW9PdmVybGF5LmluaXRWaWRlb092ZXJsYXkgZGF0YVxuXG5cbiAgICBnb3RvOiAoaWQsIGluaXRWYWwpIC0+XG4gICAgICAgIGluZm9JZCA9IFwiIyN7aWR9LWluZm9cIlxuXG4gICAgICAgIGlmICEoQHBhZ2UgPT0gbnVsbClcbiAgICAgICAgICAgIHRhcmdldCA9IEBpbmZvQm94ZXMucGFyZW50cygnbGkuZ3JvdXAtaW5mbycpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRhcmdldCA9IEBpbmZvQm94ZXNcbiAgICAgICAgXG5cbiAgICAgICAgI1N3aXRjaCBJbmZvIEJveGVzXG4gICAgICAgIHRsID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgICAgIHRsLmFkZCBUd2Vlbk1heC50byB0YXJnZXQgLCAuNCAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MFxuICAgICAgICAgICAgb3ZlcndyaXRlOlwiYWxsXCJcbiAgICAgICAgdGwuYWRkIFR3ZWVuTWF4LnRvIHRhcmdldC5maWx0ZXIoaW5mb0lkKSAsIC40ICxcbiAgICAgICAgICAgIGF1dG9BbHBoYToxXG5cblxuICAgICAgICBpZiAoQCR0YXJnZXQ/KVxuICAgICAgICAgICAgY29uc29sZS5sb2cgQCR0YXJnZXRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9wID0gQCR0YXJnZXQub2Zmc2V0KCkudG9wIC0gKCQoJ2hlYWRlcicpLmhlaWdodCgpKVxuICAgICAgICAgICAgY29uc29sZS5sb2cgdG9wXG4gICAgICAgICAgICBwb3MgPSAkKCdib2R5Jykuc2Nyb2xsVG9wKClcbiAgICAgICAgICAgIGlmIChwb3MgPCB0b3ApXG4gICAgICAgICAgICAgICAgJCgnYm9keScpLmFuaW1hdGUgeyBzY3JvbGxUb3A6IHRvcCB9XG4gIFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhZGVHYWxsZXJ5XG5cbiIsImdsb2JhbHMgPSByZXF1aXJlICcuLi9nbG9iYWwvaW5kZXguY29mZmVlJ1xuUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuXG5jbGFzcyBIZWFkZXJBbmltYXRpb24gZXh0ZW5kcyBQbHVnaW5CYXNlXG5cbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gIFxuICAgICAgICBAYm9keSA9ICQoXCJib2R5XCIpXG4gICAgICAgIEBodG1sID0gJChcImh0bWxcIilcbiAgICAgICAgQGNvbnRlbnQgPSAkKFwiI2NvbnRlbnRcIilcbiAgICAgICAgQG1vYm5hdiA9ICQoXCIjbW9iaWxlLWhlYWRlci1uYXZcIilcbiAgICAgICAgQHN1Ym5hdiA9ICQoXCIuc3VibmF2XCIpXG4gICAgICAgIEBzdWJuYXZTaG93aW5nID0gZmFsc2VcbiAgICAgICAgQG91clBhcmtzTGVmdCA9ICQoJy5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cIm91ci1wYXJrc1wiXScpLm9mZnNldCgpLmxlZnRcbiAgICAgICAgQHBhcnRuZXJzaGlwTGVmdCA9ICQoJy5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cInBhcnRuZXJzaGlwc1wiXScpLm9mZnNldCgpLmxlZnRcbiAgICAgICAgXG5cbiAgICAgICAgc3VwZXIob3B0cykgIFxuXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBzdXBlcigpICAgIFxuICAgICAgICBAc2hvd0luaXRpYWxTdWJOYXYoKSAgICAgICAgXG5cbiAgICBhZGRFdmVudHM6IC0+XG4gICAgICAgIGlmICEkKCdodG1sJykuaGFzQ2xhc3MgJ3RhYmxldCdcbiAgICAgICAgICAgICQoJy5uYXYtbGlzdCBhIGxpJykub24gJ21vdXNlZW50ZXInLCBAaGFuZGxlTmF2SG92ZXJcbiAgICAgICAgICAgICQoJ2hlYWRlcicpLm9uICdtb3VzZWxlYXZlJywgQGhpZGVTdWJOYXZcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5vbnJlc2l6ZSA9IEBoYW5kbGVSZXNpemVcbiAgICAgICAgQGJvZHkuZmluZChcIiNuYXZiYXItbWVudVwiKS5vbiAnY2xpY2snLCBAdG9nZ2xlTmF2XG4gICAgICAgICQoJyNtb2JpbGUtaGVhZGVyLW5hdiBhJykub24gJ2NsaWNrJywgQHNob3dNb2JpbGVTdWJOYXZcbiAgICAgICAgJCgnI21vYmlsZS1oZWFkZXItbmF2IGknKS5vbiAnY2xpY2snLCBAaGFuZGxlQXJyb3dDbGlja1xuICAgICAgICBcbiAgICAgICAgQGJvZHkuZmluZCgnLnRvZ2dsZS1uYXYnKS5vbiAnY2xpY2snLCAoKSAtPlxuICAgICAgICAgICAgJChAKS5wYXJlbnRzKCdoZWFkZXInKS5maW5kKCcjbmF2YmFyLW1lbnUgaW1nJykudHJpZ2dlcignY2xpY2snKVxuICAgICAgICAgICAgXG4gICAgICAgICQoJyNtb2JpbGUtaGVhZGVyLW5hdicpLm9uICdjbGljaycsICcubW9iaWxlLXN1Yi1uYXYgbGknLCBAb25DbGlja01vYmlsZVN1Yk5hdkxpbmtcbiAgICAgICAgXG4gICAgXG4gICAgaGFuZGxlU3ViTmF2OiA9PlxuICAgICAgICBzdGFydFBhZ2UgPSAkKCcuc3VibmF2JykuZGF0YSAncGFnZSdcbiAgICAgICAgaWQgPSAkKCcubmF2LWxpc3QgYVtkYXRhLXBhZ2Utc2hvcnQ9XCInICsgc3RhcnRQYWdlICsgJ1wiXScpLmRhdGEgJ3BhZ2UnXG4gICAgICAgIEBzaG93U3ViTmF2TGlua3MoaWQpXG4gICAgICAgIFxuICAgIHNob3dJbml0aWFsU3ViTmF2OiA9PlxuICAgICAgICBzZWN0aW9uID0gJCgnLnN1Ym5hdicpLmRhdGEgJ3BhZ2UnXG4gICAgICAgIFxuICAgICAgICBpZiBzZWN0aW9uID09ICdvZmZlcmluZ3MnIHx8IHNlY3Rpb24gPT0gJ2FjY29tbW9kYXRpb25zJyB8fCBzZWN0aW9uID09ICdvdXJwYXJrcydcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MoJ291ci1wYXJrcycpXG4gICAgICAgIGVsc2UgaWYgc2VjdGlvbiA9PSAncGFydG5lcnNoaXAtZGV0YWlscycgfHwgc2VjdGlvbiA9PSAncGFydG5lcnNoaXAnXG4gICAgICAgICAgICBAc2hvd1N1Yk5hdkxpbmtzKCdwYXJ0bmVyc2hpcHMnKVxuICAgICAgICBcbiAgICB0b2dnbGVOYXY6IChlKSA9PlxuICAgICAgICAgICAgICAgIFxuICAgIGhhbmRsZVJlc2l6ZTogPT5cbiAgICAgICAgQGhhbmRsZVN1Yk5hdigpXG4gICAgICAgIEBhZGp1c3RNb2JpbGVOYXYoKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgcG9zaXRpb25TdWJOYXZMaXN0czogPT5cbiAgICAgICAgI2NvbnNvbGUubG9nICdwb3NpdGlvblN1Yk5hdkxpc3RzJ1xuIyAgICAgICAgb3VyUGFya3NMZWZ0ID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwib3VyLXBhcmtzXCJdJykub2Zmc2V0KCkubGVmdFxuIyAgICAgICAgcGFydG5lcnNoaXBMZWZ0ID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwicGFydG5lcnNoaXBzXCJdJykub2Zmc2V0KCkubGVmdCAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgJCgnI2hlYWRlci10b3AnKS5oYXNDbGFzcyAnc21hbGwnXG4gICAgICAgICAgICBpZiB3aW5kb3cuaW5uZXJXaWR0aCA8IDk5M1xuICAgICAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAb3VyUGFya3NMZWZ0IC0gOTApXG4gICAgICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBwYXJ0bmVyc2hpcExlZnQgLSAxMzMpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgJCgnI291ci1wYXJrcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBvdXJQYXJrc0xlZnQgLSA5MClcbiAgICAgICAgICAgICAgICAkKCcjcGFydG5lcnNoaXBzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQHBhcnRuZXJzaGlwTGVmdCAtIDExOClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgd2luZG93LmlubmVyV2lkdGggPCA5OTNcbiAgICAgICAgICAgICAgICAkKCcjb3VyLXBhcmtzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQG91clBhcmtzTGVmdCAtIDYwKVxuICAgICAgICAgICAgICAgICQoJyNwYXJ0bmVyc2hpcHMtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAcGFydG5lcnNoaXBMZWZ0IC0gMTA1KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAb3VyUGFya3NMZWZ0IC0gNjApXG4gICAgICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBwYXJ0bmVyc2hpcExlZnQgLSA5MClcblxuICAgIGFuaW1hdGVIZWFkZXI6IChzY3JvbGxZKSA9PlxuICAgICAgICBpZiBAaHRtbC5oYXNDbGFzcyAncGhvbmUnXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAkaHQgPSBAJGVsLmZpbmQoJyNoZWFkZXItdG9wJylcbiAgICAgICAgJGhiID0gQCRlbC5maW5kKCcjaGVhZGVyLWJvdHRvbScpIFxuXG4gICAgICAgIGlmIHNjcm9sbFkgPiA4NSBcbiAgICAgICAgICAgIGlmICFAbmF2Q29sbGFwc2VkXG4gICAgICAgICAgICAgICAgJCgnI2hlYWRlci10b3AsICNoZWFkZXItYm90dG9tLCAjbmF2YmFyLWxvZ28sIC5uYXYtbGlzdCwgI2J1eSwgLmhlYWRlci1jb250YWN0LCAuaGVhZGVyLXNvY2lhbCcpLmFkZENsYXNzKCdzbWFsbCcpXG4gICAgICAgICAgICAgICAgQG5hdkNvbGxhcHNlZCA9IHRydWVcbiAgICAgICAgICAgICAgICBAcG9zaXRpb25TdWJOYXZMaXN0cygpIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBAbmF2Q29sbGFwc2VkXG4gICAgICAgICAgICAgICAgJCgnI2hlYWRlci10b3AsICNoZWFkZXItYm90dG9tLCAjbmF2YmFyLWxvZ28sIC5uYXYtbGlzdCwgI2J1eSwgLmhlYWRlci1jb250YWN0LCAuaGVhZGVyLXNvY2lhbCcpLnJlbW92ZUNsYXNzKCdzbWFsbCcpXG4gICAgICAgICAgICAgICAgQG5hdkNvbGxhcHNlZCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgQGhhbmRsZVN1Yk5hdigpXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uU3ViTmF2TGlzdHMoKSBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgIGhhbmRsZU5hdkhvdmVyOiAoZSkgPT5cbiAgICAgICAgcGFyZW50SUQgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5kYXRhKCdwYWdlJylcbiAgICAgICAgaWYgJCgnIycgKyBwYXJlbnRJRCArICctc3VibmF2LWxpc3QnKS5maW5kKCdhJykubGVuZ3RoIDwgMVxuICAgICAgICAgICAgQGhpZGVTdWJOYXYoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAaGlkZVN1Yk5hdkxpbmtzKClcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MocGFyZW50SUQpXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgIUBzdWJuYXZTaG93aW5nXG4gICAgICAgICAgICAgICAgQHNob3dTdWJOYXYoKVxuICAgICAgICAgICAgICBcbiAgICBzaG93U3ViTmF2OiA9PlxuICAgICAgICBAc3VibmF2LmFkZENsYXNzKCdzaG93aW5nJylcbiAgICAgICAgQHN1Ym5hdlNob3dpbmcgPSB0cnVlXG4gICAgICAgIFxuICAgIGhpZGVTdWJOYXY6ID0+XG4gICAgICAgIEBzdWJuYXYucmVtb3ZlQ2xhc3MoJ3Nob3dpbmcnKVxuICAgICAgICBAc3VibmF2U2hvd2luZyA9IGZhbHNlXG4gICAgICAgIEBoYW5kbGVTdWJOYXYoKVxuXG4gICAgc2hvd1N1Yk5hdkxpbmtzOiAocGFnZSkgPT5cbiAgICAgICAgaWYgcGFnZT9cbiAgICAgICAgICAgIGxlZnQgPSAkKCcubmF2IC5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cIicgKyBwYWdlICsgJ1wiXScpLnBvc2l0aW9uKCkubGVmdFxuICAgICAgICAgICAgb2Zmc2V0ID0gMFxuICAgICAgICAgICAgaGVscGVyID0gLTQ1IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB3aW5kb3cuaW5uZXJXaWR0aCA8IDk5M1xuICAgICAgICAgICAgICAgIGhlbHBlciA9IC0yMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjY29uc29sZS5sb2cgJ3BhZ2U6ICcsIHBhZ2VcbiAgICAgICAgICAgICNjb25zb2xlLmxvZyAnYjogJywgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCBhJykubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICQoJyMnICsgcGFnZSArICctc3VibmF2LWxpc3QgYScpLmxlbmd0aCA8IDNcbiAgICAgICAgICAgICAgICBmb3IgYSBpbiAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0IGEnKVxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBvZmZzZXQgKyAkKGEpLndpZHRoKClcblxuICAgICAgICAgICAgaWYgb2Zmc2V0ID4gMFxuICAgICAgICAgICAgICAgICNjb25zb2xlLmxvZyAnYSdcbiAgICAgICAgICAgICAgICAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgbGVmdCAtIChvZmZzZXQgLyAzKSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjY29uc29sZS5sb2cgJ2InXG4jICAgICAgICAgICAgICAgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIGxlZnQgKyBoZWxwZXIpXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uU3ViTmF2TGlzdHMoKVxuICAgICAgICAgICAgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCcpLmFkZENsYXNzKCdzaG93aW5nJylcbiAgICBcbiAgICBoaWRlU3ViTmF2TGlua3M6ID0+XG4gICAgICAgICQoJy5zdWJuYXYtbGlzdCBsaScpLnJlbW92ZUNsYXNzKCdzaG93aW5nJylcbiAgICAgICAgXG4gICAgaGFuZGxlU3ViTmF2OiA9PlxuICAgICAgICBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ291cnBhcmtzJykgfHwgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdvZmZlcmluZ3MnKSB8fCAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ2FjY29tbW9kYXRpb25zJylcbiAgICAgICAgICAgICQoJ3VsLnN1Ym5hdi1saXN0IGxpJykucmVtb3ZlQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICAgICAkKCcjb3VyLXBhcmtzLXN1Ym5hdi1saXN0JykuYWRkQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICAgICBAc2hvd1N1Yk5hdkxpbmtzKCdvdXItcGFya3MnKVxuXG4gICAgICAgICAgICBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ29mZmVyaW5ncycpXG4gICAgICAgICAgICAgICAgJCgnYSNvdXItcGFya3Mtb2ZmZXJpbmdzLXN1Ym5hdi1saW5rJykuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG4gICAgICAgICAgICBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ2FjY29tbW9kYXRpb25zJylcbiAgICAgICAgICAgICAgICAkKCdhI291ci1wYXJrcy1hY2NvbW1vZGF0aW9ucy1zdWJuYXYtbGluaycpLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG4gICAgICAgIGVsc2UgaWYgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdwYXJ0bmVyc2hpcCcpIHx8ICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygncGFydG5lcnNoaXAtZGV0YWlscycpXG4gICAgICAgICAgICAkKCd1bC5zdWJuYXYtbGlzdCBsaScpLnJlbW92ZUNsYXNzICdzaG93aW5nJ1xuICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmFkZENsYXNzICdzaG93aW5nJ1xuICAgICAgICAgICAgQHNob3dTdWJOYXZMaW5rcygncGFydG5lcnNoaXBzJylcblxuIyAgICAgICAgICAgIGlmICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygncGFydG5lcnNoaXAtZGV0YWlscycpXG4jICAgICAgICAgICAgICAgICQoJ2EjcGFydG5lcnNoaXAtZGV0YWlscy1zdWJuYXYtbGluaycpLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG4jPT09PT09PT09PT09PT09PT09PSM9PT09PT09PT09PT09PT09PT09Iz09PT09PT09PT09PT09PT09PT0jXG4jPT09PT09PT09PT09PT09PT09PSAgTU9CSUxFIFNUQVJUUyBIRVJFID09PT09PT09PT09PT09PT09PSNcbiM9PT09PT09PT09PT09PT09PT09Iz09PT09PT09PT09PT09PT09PT0jPT09PT09PT09PT09PT09PT09PSMgXG5cbiAgICB0b2dnbGVOYXY6IChlKSA9PlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgJHQgPSAkKGUudGFyZ2V0KVxuICAgICAgICAkaGIgPSAkKCcjaGVhZGVyLWJvdHRvbScpXG4gICAgICAgICRtbiA9ICQoJyNtb2JpbGUtaGVhZGVyLW5hdicpXG4gICAgICAgICRoaCA9ICRoYi5oZWlnaHQoKVxuXG4gICAgICAgICR0LnRvZ2dsZUNsYXNzKCdjbG9zZWQnKVxuXG4gICAgICAgIGNvbnNvbGUubG9nICdzZWNvbmQgdG9nZ2xlJ1xuICAgICAgICBjb25zb2xlLmxvZyAkdFxuICAgICAgICBcbiAgICAgICAgaWYgJHQuaGFzQ2xhc3MoJ2Nsb3NlZCcpXG4gICAgICAgICAgICBAYWRqdXN0TW9iaWxlTmF2KClcbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvIEBtb2JuYXYsIC4zNSwgXG4gICAgICAgICAgICAgICAge3k6ICg4MDAgKyAkaGgpXG4gICAgICAgICAgICAgICAgLHo6IDBcbiAgICAgICAgICAgICAgICAsZWFzZTogUG93ZXIxLmVhc2VPdXRcbiAgICAgICAgICAgICAgICAsb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgICAgICAgICAgVHdlZW5NYXguc2V0IEBtb2JuYXYsXG4gICAgICAgICAgICAgICAgICAgICAgICB6OiAxMFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgVHdlZW5NYXguc2V0IEBtb2JuYXYsXG4gICAgICAgICAgICAgICAgejogLTIgXG4gICAgICAgICAgICBUd2Vlbk1heC50byBAbW9ibmF2LCAuNSwge3k6IDAsIHo6IDAsIGVhc2U6IFBvd2VyMS5lYXNlSW59XG4gICAgICAgICAgICAkKCcubW9iaWxlLXN1Yi1uYXYnKS5jc3MoJ2hlaWdodCcsICcwcHgnKVxuICAgICAgICAgICAgQGFkanVzdE1vYmlsZU5hdlxuICAgICAgICAgICAgQGhpZGVNb2JpbGVTdWJOYXYoKVxuICAgICAgICAgICAgVHdlZW5NYXguc2V0IEBjb250ZW50ICxcbiAgICAgICAgICAgICAgICB5OiAwXG5cbiAgICBhZGp1c3RNb2JpbGVOYXY6ID0+XG4gICAgICAgICRoYiA9ICQoJyNoZWFkZXItYm90dG9tJylcbiAgICAgICAgJG1uID0gJCgnI21vYmlsZS1oZWFkZXItbmF2JylcbiAgICAgICAgIyBTZXQgbmF2IGhlaWdodCB0byAzNTBweCBldmVyeSB0aW1lIGJlZm9yZSBhZGp1c3RpbmdcbiAgICAgICAgIyRtbi5jc3Mge2hlaWdodDogMzUwfVxuICAgICAgICAkaGggPSAkaGIuaGVpZ2h0KClcbiAgICAgICAgJG5oID0gJG1uLmhlaWdodCgpXG4gICAgICAgICRpdyA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgICAgICRpaCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICAkbWIgPSAkKCcjbmF2YmFyLW1lbnUnKVxuXG4gICAgICAgIGlmICRuaCA+ICRpaFxuICAgICAgICAgICAgJG1uLmNzcyB7aGVpZ2h0OiAoJGloIC0gJGhoKSwgb3ZlcmZsb3c6ICdzY3JvbGwnfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAkbW4uY3NzIHtoZWlnaHQ6IDQwMCArICdweCd9ICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIHNob3dNb2JpbGVTdWJOYXY6IChlKSA9PlxuICAgICAgICB0aGlzU3ViTmF2ID0gJChlLnRhcmdldCkucGFyZW50KCkuZmluZCAnLm1vYmlsZS1zdWItbmF2J1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXNTdWJOYXYuZmluZCgnbGknKS5sZW5ndGggPCAxKVxuICAgICAgICAgICAgQGhpZGVNb2JpbGVTdWJOYXYoKVxuICAgICAgICAgICAgJChlLnRhcmdldCkuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgaWYgISgkKGUudGFyZ2V0KS5wYXJlbnQoKS5oYXNDbGFzcygnYWN0aXZlJykpXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIFxuICAgICAgICBob3dNYW55ID0gdGhpc1N1Yk5hdi5maW5kKCdsaScpLmxlbmd0aFxuICAgICAgICB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgdGFyZ2V0ID0gJChlLnRhcmdldClcblxuICAgICAgICBAaGlkZU1vYmlsZVN1Yk5hdigpXG4gICAgICAgIHRhcmdldC5maW5kKCdpJykuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgdGFyZ2V0LmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgIHRhcmdldC5wYXJlbnRzKCdhJykuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgQG1vYm5hdi5jc3MoJ2hlaWdodCcsICh3aW5kb3dIZWlnaHQgLSAxMDApICsgJ3B4JylcbiAgICAgICAgdGhpc1N1Yk5hdi5jc3MoJ2hlaWdodCcsIChob3dNYW55ICogNTApICsgJ3B4JylcbiAgICAgICAgXG4gICAgaGlkZU1vYmlsZVN1Yk5hdjogPT5cbiAgICAgICAgJCgnLm1vYmlsZS1zdWItbmF2JykuY3NzKCdoZWlnaHQnLCAnMHB4JylcbiAgICAgICAgQG1vYm5hdi5jc3MoJ2hlaWdodCcsICc0MDBweCcpXG4gICAgICAgIEBtb2JuYXYuZmluZCgnaScpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgIEBtb2JuYXYuZmluZCgnbGknKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICBAbW9ibmF2LmZpbmQoJ3VsIGEnKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuXG4gICAgXG4gICAgaGFuZGxlQXJyb3dDbGljazogKGUpID0+XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIFxuICAgICAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgQGhpZGVNb2JpbGVTdWJOYXYoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnRzKCdsaScpLnRyaWdnZXIgJ2NsaWNrJ1xuICAgICAgICBcbiAgICAgICAgXG4gICAgb25DbGlja01vYmlsZVN1Yk5hdkxpbms6IChlKSA9PlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBcbiAgICAgICAgaWYgJChlLnRhcmdldCkuZGF0YSgnaHJlZicpP1xuICAgICAgICAgICAgdXJsID0gJChlLnRhcmdldCkuZGF0YSAnaHJlZidcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJBbmltYXRpb25cblxuXG4iLCJQbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIElubGluZVZpZGVvIGV4dGVuZHMgUGx1Z2luQmFzZVxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgc3VwZXIob3B0cylcblxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgICMgQCRlbCA9ICQoZWwpXG5cbiAgICAgICAgQHZpZGVvUGxheWVycyA9IEAkZWxcbiAgICAgICAgQGFkZEV2ZW50cygpXG5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgYWRkRXZlbnRzOiAtPlxuXG4gICAgICAgIEB2aWRlb1BsYXllcnMuZWFjaCAoaSx0KSA9PiAgICAgICAgICAgIFxuICAgICAgICAgICAgJCh0KS5vbiAnY2xpY2snLCBAc3RhcnRQbGF5ZXJcblxuXG4gICAgc3RhcnRQbGF5ZXI6ICh0KSAtPlxuICAgICAgICBpZiAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJ3ZpZGVvJykuc2l6ZSgpID09IDAgXG4gICAgICAgICAgICAkZWwgPSAkKHRoaXMpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgIG1wNDogJGVsLmRhdGEoJ21wNCcpLFxuICAgICAgICAgICAgICAgIHdlYm06ICRlbC5kYXRhKCd3ZWJtJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2cgZGF0YVxuICAgICAgICAgICAgd2lkdGggPSAkZWwud2lkdGgoKVxuICAgICAgICAgICAgaGVpZ2h0ID0gJGVsLm91dGVySGVpZ2h0KClcblxuICAgICAgICAgICAgbXA0ID0gJCgnPHNvdXJjZSBzcmM9XCInICsgZGF0YS5tcDQgKyAnXCIgdHlwZT1cInZpZGVvL21wNFwiIC8+JylcbiAgICAgICAgICAgIHdlYm0gPSAkKCc8c291cmNlIHNyYz0nICsgZGF0YS53ZWJtICsgJ1wiIHR5cGU9XCJ2aWRlby93ZWJtXCIgLz4nKVxuXG4gICAgICAgICAgICBAJHZpZGVvRWwgPSAkKFwiPHZpZGVvIGlkPSdvdmVybGF5LXBsYXllcicgY2xhc3M9J3Zqcy1kZWZhdWx0LXNraW4gdmlkZW8tanMnIGNvbnRyb2xzIHByZWxvYWQ9J2F1dG8nIGF1dG9wbGF5PSd0cnVlJyAvPlwiKVxuICAgICAgICAgICAgQCR2aWRlb0VsLmFwcGVuZChtcDQpXG4gICAgICAgICAgICBAJHZpZGVvRWwuYXBwZW5kKHdlYm0pXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICRlbC5wYXJlbnQoKS5hcHBlbmQgQCR2aWRlb0VsXG4gICAgICAgICAgICBAJHZpZGVvRWwuc2hvdygpLmhlaWdodChoZWlnaHQpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbmxpbmVWaWRlb1xuXG5cblxuXG5cblxuIiwiXG5QbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5WaWRlb092ZXJsYXkgPSByZXF1aXJlICcuL1ZpZGVvT3ZlcmxheS5jb2ZmZWUnXG5cbmNsYXNzIFBhcmtzTGlzdCBleHRlbmRzIFBsdWdpbkJhc2VcblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgQCRlbCA9ICQob3B0cy5lbClcbiAgICAgICAgc3VwZXIob3B0cykgICAgICAgICBcbiAgICAgICAgQGdhbGxlcnkgPSBvcHRzLmdhbGxlcnlcbiAgICAgICAgaWYgQGdhbGxlcnk/XG4gICAgICAgICAgICBAZ2FsbGVyeS5vbiBcIml0ZW1JbmRleFwiICwgQHNlbGVjdExvZ29cbiAgICAgICAgICAgIFxuICAgICAgICBAcGFnZSA9IG9wdHMucGFnZVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgQHBhcmtMb2dvcyA9ICQoQCRlbCkuZmluZCBcImxpXCJcbiAgICAgICAgQGN1cnJlbnRTZWxlY3RlZCA9IEBwYXJrTG9nb3MuZmlsdGVyKFwiOmZpcnN0LWNoaWxkXCIpXG4gICAgICAgIGlmIEBnYWxsZXJ5P1xuICAgICAgICAgICAgQHNlbGVjdExvZ28gQHNlbGVjdGVkTG9nbygpXG4gICAgICAgICAgICBAZ2FsbGVyeS5nb3RvIEBzZWxlY3RlZExvZ28oKSwgdHJ1ZVxuICAgICAgICBzdXBlcigpXG5cbiAgICBhZGRFdmVudHM6IC0+XG4gICAgICAgIEAkZWwub24gJ2NsaWNrJywgJ2xpLnBhcmsnLCBAaGFuZGxlTG9nb0ludGVyYWN0aW9uXG4gICAgICAgIFxuICAgICAgICBAcGFya0xvZ29zLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgIGxvZ29FdmVudHMgPSBuZXcgSGFtbWVyKHQpXG4gICAgICAgICAgICBsb2dvRXZlbnRzLm9uICd0YXAnICwgQGhhbmRsZUxvZ29JbnRlcmFjdGlvblxuXG4gICAgaGFuZGxlTG9nb0ludGVyYWN0aW9uOiAoZSkgPT5cbiAgICAgICAgaWYgQHBhZ2UgPT0gJ2FjY29tbW9kYXRpb24nXG4gICAgICAgICAgICBAcGFya0xvZ29zLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcbiAgICAgICAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoJ2xpLnBhcmsnKS5hZGRDbGFzcyAnc2VsZWN0ZWQnXG4gICAgICAgICAgICB3aGljaFBhcmsgPSAkKGUudGFyZ2V0KS5wYXJlbnRzKCdsaS5wYXJrJykuYXR0cignaWQnKVxuICAgICAgICAgICAgQHNob3dOZXdBY2NvbW1vZGF0aW9ucyh3aGljaFBhcmspXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgXG4gICAgICAgICR0YXJnZXQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdsaScpXG5cbiAgICAgICAgaWQgPSAkdGFyZ2V0LmRhdGEoJ2lkJylcbiAgICAgICAgXG4gICAgICAgIEBkaXNwbGF5Q29udGVudCBpZFxuICAgICAgICBcbiAgICAgICAgXG4gICAgc2hvd05ld0FjY29tbW9kYXRpb25zOiAocGFyaykgPT5cbiAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXInKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuY2Fyb3VzZWwtd3JhcHBlcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IC5zd2lwZXItY29udGFpbmVyW2RhdGEtbG9nbz1cIicgKyBwYXJrICsgJ1wiXScpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IC5zd2lwZXItY29udGFpbmVyW2RhdGEtbG9nbz1cIicgKyBwYXJrICsgJ1wiXScpLnBhcmVudCgpLmFkZENsYXNzICdhY3RpdmUnXG5cbiAgICBkaXNwbGF5Q29udGVudDogKGlkKSAtPlxuXG5cbiAgICAgICAgQHNlbGVjdExvZ28oaWQpXG5cbiAgICAgICAgI1N3aXRjaCBJbmZvIEJveGVzXG4gICAgICAgIEBnYWxsZXJ5LmdvdG8oaWQpXG5cblxuICAgIHNlbGVjdExvZ286IChpZCkgPT5cbiAgICAgICAgbG9nb0lkID0gXCIjI3tpZH0tbG9nb1wiXG4gICAgICAgIEBwYXJrTG9nb3MucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgQHBhcmtMb2dvcy5maWx0ZXIobG9nb0lkKS5hZGRDbGFzcygnc2VsZWN0ZWQnKVxuXG5cbiAgICBzZWxlY3RlZExvZ286IC0+XG4gICAgICAgIHJldHVybiBAcGFya0xvZ29zLnBhcmVudCgpLmZpbmQoJ2xpLnNlbGVjdGVkJykuZGF0YSgnaWQnKTtcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcmtzTGlzdFxuXG4iLCJQbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIFJlc2l6ZUJ1dHRvbnMgZXh0ZW5kcyBQbHVnaW5CYXNlXG5cbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgQHJlc2l6ZUJ1dHRvbnMoKVxuXG4gICAgcmVzaXplQnV0dG9uczogLT5cbiAgICAgICAgYyA9ICQoJyNjb250ZW50JylcbiAgICAgICAgYnRuX3dyYXBwZXJzID0gYy5maW5kICcuYnRuLXdyYXBwZXInXG5cbiAgICAgICAgZm9yIGJ0bl93cmFwcGVyIGluIGJ0bl93cmFwcGVyc1xuICAgICAgICAgICAgYnRucyA9ICQoYnRuX3dyYXBwZXIpLmZpbmQgJ2EnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGJ0bnMubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgIG1heFdpZHRoID0gMFxuICAgICAgICAgICAgICAgIHdpZGVzdFNwYW4gPSBudWxsXG5cbiAgICAgICAgICAgICAgICAkKGJ0bnMpLmVhY2ggLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgJCh0aGlzKS53aWR0aCgpID4gbWF4V2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFdpZHRoID0gJCh0aGlzKS53aWR0aCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRlc3RTcGFuID0gJCh0aGlzKVxuXG4gICAgICAgICAgICAgICAgJChidG5zKS5lYWNoIC0+XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuY3NzKHt3aWR0aDogbWF4V2lkdGggKyA2MH0pXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBSZXNpemVCdXR0b25zIiwiY2xhc3MgU3ZnSW5qZWN0XG5cbiAgICBjb25zdHJ1Y3RvcjogKHNlbGVjdG9yKSAtPlxuICAgICAgICBcbiAgICAgICAgQCRzdmdzID0gJChzZWxlY3RvcilcbiAgICAgICAgXG4gICAgICAgIEBwcmVsb2FkZXIgPSBuZXcgY3JlYXRlanMuTG9hZFF1ZXVlIHRydWUgLCBcIlwiICwgdHJ1ZVxuICAgICAgICBAcHJlbG9hZGVyLnNldE1heENvbm5lY3Rpb25zKDEwKVxuICAgICAgICBAcHJlbG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIgJ2ZpbGVsb2FkJyAsIEBvblN2Z0xvYWRlZFxuICAgICAgICBAcHJlbG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvbkxvYWRDb21wbGV0ZVxuICAgICAgICBAbWFuaWZlc3QgPSBbXVxuICAgICAgICBAY29sbGVjdFN2Z1VybHMoKVxuICAgICAgICBAbG9hZFN2Z3MoKVxuICAgICAgICBcbiAgICBjb2xsZWN0U3ZnVXJsczogLT5cbiAgICAgICAgXG4gICAgICAgIHNlbGYgPSBAXG4gICAgICAgIFxuICAgICAgICBAJHN2Z3MuZWFjaCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZCA9IFwic3ZnLWluamVjdC0je3BhcnNlSW50KE1hdGgucmFuZG9tKCkgKiAxMDAwKS50b1N0cmluZygpfVwiXG4gICAgICAgICAgXG4gICAgICAgICAgICAkKEApLmF0dHIoJ2lkJywgaWQpXG4gICAgICAgICAgICAkKEApLmF0dHIoJ2RhdGEtYXJiJyAsIFwiYWJjMTIzXCIpXG4gICAgICAgICAgICBzdmdVcmwgPSAkKEApLmF0dHIoJ3NyYycpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgXG5cbiAgICAgICAgICAgIHNlbGYubWFuaWZlc3QucHVzaCBcbiAgICAgICAgICAgICAgICBpZDppZFxuICAgICAgICAgICAgICAgIHNyYzpzdmdVcmxcbiAgICAgICAgICAgICAgICBcbiAgICBsb2FkU3ZnczogLT5cbiAgICAgICAgXG4gICAgICAgIEBwcmVsb2FkZXIubG9hZE1hbmlmZXN0KEBtYW5pZmVzdClcbiAgICAgICAgICAgICAgICBcbiAgICBcbiAgICBpbmplY3RTdmc6IChpZCxzdmdEYXRhKSAtPlxuICAgICAgICBcbiAgICAgICAgJGVsID0gJChcIiMje2lkfVwiKSAgICBcbiBcbiBcbiAgICAgICAgaW1nSUQgPSAkZWwuYXR0cignaWQnKVxuICAgICAgICBpbWdDbGFzcyA9ICRlbC5hdHRyKCdjbGFzcycpXG4gICAgICAgIGltZ0RhdGEgPSAkZWwuY2xvbmUodHJ1ZSkuZGF0YSgpIG9yIFtdXG4gICAgICAgIGRpbWVuc2lvbnMgPSBcbiAgICAgICAgICAgIHc6ICRlbC5hdHRyKCd3aWR0aCcpXG4gICAgICAgICAgICBoOiAkZWwuYXR0cignaGVpZ2h0JylcblxuICAgICAgICBzdmcgPSAkKHN2Z0RhdGEpLmZpbHRlcignc3ZnJylcbiAgICAgICAgXG5cbiAgICAgICAgc3ZnID0gc3ZnLmF0dHIoXCJpZFwiLCBpbWdJRCkgIGlmIHR5cGVvZiBpbWdJRCBpc250ICd1bmRlZmluZWQnXG4gICAgICAgIGlmIHR5cGVvZiBpbWdDbGFzcyBpc250ICd1bmRlZmluZWQnXG4gICAgICAgICAgICBjbHMgPSAoaWYgKHN2Zy5hdHRyKFwiY2xhc3NcIikgaXNudCAndW5kZWZpbmVkJykgdGhlbiBzdmcuYXR0cihcImNsYXNzXCIpIGVsc2UgXCJcIilcbiAgICAgICAgICAgIHN2ZyA9IHN2Zy5hdHRyKFwiY2xhc3NcIiwgaW1nQ2xhc3MgKyBcIiBcIiArIGNscyArIFwiIHJlcGxhY2VkLXN2Z1wiKVxuICAgICAgICBcbiAgICAgICAgIyBjb3B5IGFsbCB0aGUgZGF0YSBlbGVtZW50cyBmcm9tIHRoZSBpbWcgdG8gdGhlIHN2Z1xuICAgICAgICAkLmVhY2ggaW1nRGF0YSwgKG5hbWUsIHZhbHVlKSAtPiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgc3ZnWzBdLnNldEF0dHJpYnV0ZSBcImRhdGEtXCIgKyBuYW1lLCB2YWx1ZVxuICAgICAgICAgICAgcmV0dXJuICAgICAgICBcbiAgICAgICAgc3ZnID0gc3ZnLnJlbW92ZUF0dHIoXCJ4bWxuczphXCIpXG4gICAgICAgIFxuICAgICAgICAjR2V0IG9yaWdpbmFsIGRpbWVuc2lvbnMgb2YgU1ZHIGZpbGUgdG8gdXNlIGFzIGZvdW5kYXRpb24gZm9yIHNjYWxpbmcgYmFzZWQgb24gaW1nIHRhZyBkaW1lbnNpb25zXG4gICAgICAgIG93ID0gcGFyc2VGbG9hdChzdmcuYXR0cihcIndpZHRoXCIpKVxuICAgICAgICBvaCA9IHBhcnNlRmxvYXQoc3ZnLmF0dHIoXCJoZWlnaHRcIikpXG4gICAgICAgIFxuICAgICAgICAjU2NhbGUgYWJzb2x1dGVseSBpZiBib3RoIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlcyBleGlzdFxuICAgICAgICBpZiBkaW1lbnNpb25zLncgYW5kIGRpbWVuc2lvbnMuaFxuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJ3aWR0aFwiLCBkaW1lbnNpb25zLndcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwiaGVpZ2h0XCIsIGRpbWVuc2lvbnMuaFxuICAgICAgICBcbiAgICAgICAgI1NjYWxlIHByb3BvcnRpb25hbGx5IGJhc2VkIG9uIHdpZHRoXG4gICAgICAgIGVsc2UgaWYgZGltZW5zaW9ucy53XG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcIndpZHRoXCIsIGRpbWVuc2lvbnMud1xuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJoZWlnaHRcIiwgKG9oIC8gb3cpICogZGltZW5zaW9ucy53XG4gICAgICAgIFxuICAgICAgICAjU2NhbGUgcHJvcG9ydGlvbmFsbHkgYmFzZWQgb24gaGVpZ2h0XG4gICAgICAgIGVsc2UgaWYgZGltZW5zaW9ucy5oXG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcImhlaWdodFwiLCBkaW1lbnNpb25zLmhcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwid2lkdGhcIiwgKG93IC8gb2gpICogZGltZW5zaW9ucy5oXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgJGVsLnJlcGxhY2VXaXRoIHN2Z1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIG9uU3ZnTG9hZGVkOiAoZSkgPT5cbiAgICAgICAgXG4gICAgICAgIEBpbmplY3RTdmcoZS5pdGVtLmlkLCBlLnJhd1Jlc3VsdClcbiAgICBcbiAgICBvbkxvYWRDb21wbGV0ZTogKGUpID0+XG4gICAgXG4gICAgXG4gICAgXG4gICAgXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IFN2Z0luamVjdCAiLCJcblxuY2xhc3MgVmlkZW9PdmVybGF5XG5cblxuXG4gICAgY29uc3RydWN0b3I6IChlbCkgLT5cbiAgICAgICAgQCRlbCA9ICQoZWwpXG4gICAgICAgIEAkaW5uZXIgPSBAJGVsLmZpbmQoXCIub3ZlcmxheS1pbm5lclwiKVxuICAgICAgICBAJGNvbnRhaW5lciA9IEAkZWwuZmluZChcIi5vdmVybGF5LWlubmVyLWNvbnRhaW5lclwiKVxuICAgICAgICBcbiAgICAgICAgaWYgKEAkY29udGFpbmVyLmZpbmQoJy5vdmVybGF5LWNvbnRlbnQnKS5zaXplKCkgaXMgMSkgXG4gICAgICAgICAgICBAJGNvbnRhaW5lciA9IEAkY29udGFpbmVyLmZpbmQoJy5vdmVybGF5LWNvbnRlbnQnKVxuICAgICAgICAgICAgXG4gICAgICAgIEAkY2xvc2UgPSBAJGVsLmZpbmQoXCIub3ZlcmxheS1jbG9zZVwiKVxuICAgICAgICBcblxuICAgICAgICBAY3JlYXRlVmlkZW9JbnN0YW5jZSgpXG4gICAgICAgIEBjcmVhdGVPdmVybGF5VHJhbnNpdGlvbigpXG4gICAgICAgIEBhZGRFdmVudHMoKVxuXG5cblxuICAgIGNyZWF0ZU92ZXJsYXlUcmFuc2l0aW9uOiAtPlxuICAgICAgICBAdGwgPSBuZXcgVGltZWxpbmVNYXhcblxuICAgICAgICBAJGVsLnNob3coKVxuXG4gICAgICAgIEB0bC5hZGQgVHdlZW5NYXguZnJvbVRvICQoJyNvdmVybGF5JyksIC4wMSxcbiAgICAgICAgICAgIHt6SW5kZXg6IC0xLCBkaXNwbGF5Oidub25lJywgejogMH0sIHt6SW5kZXg6IDUwMDAsIGRpc3BsYXk6J2Jsb2NrJywgejogOTk5OTk5OTk5OX1cbiAgICAgICAgXG4gICAgICAgIEB0bC5hZGQgVHdlZW5NYXgudG8gQCRlbCAsIC4zNSAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MVxuXG4gICAgICAgIEB0bC5hZGQgVHdlZW5NYXgudG8gQCRpbm5lciAsIC41NSAsXG4gICAgICAgICAgICBhbHBoYToxXG5cbiAgICAgICAgQHRsLmFkZCBUd2Vlbk1heC50byBAJGNsb3NlICwgLjI1ICxcbiAgICAgICAgICAgIGFscGhhOjFcbiAgICAgICAgLFxuICAgICAgICAgICAgXCItPS4xNVwiXG5cbiAgICAgICAgQHRsLmFkZExhYmVsKFwiaW5pdENvbnRlbnRcIilcblxuICAgICAgICBAdGwuc3RvcCgpXG5cbiAgICBjcmVhdGVWaWRlb0luc3RhbmNlOiAoKSAtPlxuXG5cblxuICAgIGFkZEV2ZW50czogLT5cbiAgICAgICAgQGNsb3NlRXZlbnQgPSBuZXcgSGFtbWVyKEAkY2xvc2VbMF0pXG5cblxuXG4gICAgdHJhbnNpdGlvbkluT3ZlcmxheTogKG5leHQpIC0+XG4gICAgICAgIGNvbnNvbGUubG9nICd0cmFuc2l0aW9uSW5PdmVybGF5J1xuICAgICAgICBAdHJhbnNJbkNiID0gbmV4dFxuICAgICAgICBAdGwuYWRkQ2FsbGJhY2soQHRyYW5zSW5DYiwgXCJpbml0Q29udGVudFwiKVxuICAgICAgICBAdGwucGxheSgpXG4gICAgICAgIEBjbG9zZUV2ZW50Lm9uICd0YXAnICwgQGNsb3NlT3ZlcmxheVxuXG4gICAgdHJhbnNpdGlvbk91dE92ZXJsYXk6IC0+XG4gICAgICAgIGNvbnNvbGUubG9nICd0cmFuc2l0aW9uT3V0T3ZlcmxheSdcbiAgICAgICAgQGNsb3NlRXZlbnQub2ZmICd0YXAnICwgQGNsb3NlT3ZlcmxheVxuICAgICAgICBAdGwucmVtb3ZlQ2FsbGJhY2soQHRyYW5zSW5DYilcbiAgICAgICAgQHRsLnJldmVyc2UoKVxuICAgICAgICBkZWxldGUgQHRyYW5zSW5DYlxuXG5cbiAgICBjbG9zZU92ZXJsYXk6IChlKSA9PlxuICAgICAgICBAcmVtb3ZlVmlkZW8oKVxuICAgICAgICBAdHJhbnNpdGlvbk91dE92ZXJsYXkoKVxuXG5cbiAgICByZW1vdmVWaWRlbzogKCkgLT5cbiAgICAgICAgaWYgQHZpZGVvSW5zdGFuY2VcbiAgICAgICAgICAgIEB2aWRlb0luc3RhbmNlLnBhdXNlKClcbiAgICAgICAgICAgIEB2aWRlb0luc3RhbmNlLmN1cnJlbnRUaW1lKDApXG4gICAgICAgICAgICAjQHZpZGVvSW5zdGFuY2UuZGlzcG9zZSgpXG5cbiAgICByZXNpemVPdmVybGF5OiAoKSAtPlxuICAgICAgICAkdmlkID0gQCRlbC5maW5kKCd2aWRlbycpXG4gICAgICAgICR3ID0gd2luZG93LmlubmVyV2lkdGhcbiAgICAgICAgJGggPSAkdmlkLmhlaWdodCgpXG5cbiAgICAgICAgIyBAJGlubmVyLmNzcyB7d2lkdGg6ICR3LCBoZWlnaHQ6ICRofVxuICAgICAgICAjICR2aWQuY3NzIHtoZWlnaHQ6IDEwMCArICclJywgd2lkdGg6IDEwMCArICclJ31cblxuICAgIGFwcGVuZERhdGE6IChkYXRhKSAtPlxuICAgICAgICBpZiBkYXRhLm1wNCA9PSBcIlwiIG9yICEgZGF0YS5tcDQ/XG4gICAgICAgICAgICBjb25zb2xlLmxvZyAnbm8gdmlkZW8sIGl0cyBhbiBpbWFnZSdcbiAgICAgICAgICAgIEBwb3N0ZXIgPSAkKFwiPGRpdiBjbGFzcz0ndmlkZW8tanMnPjxpbWcgY2xhc3M9J3Zqcy10ZWNoJyBzcmM9J1wiICsgZGF0YS5wb3N0ZXIgKyBcIicgY2xhc3M9J21lZGlhLWltYWdlLXBvc3RlcicgLz48L2Rpdj5cIilcbiAgICAgICAgICAgIEAkY29udGFpbmVyLmh0bWwgQHBvc3RlclxuICAgICAgICAgICAgQHBvc3Rlci5jc3MgJ2hlaWdodCcsICcxMDAlJ1xuICAgICAgICAgICAgQHJlbW92ZVZpZGVvKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICAgIG1wNCA9ICQoXCI8c291cmNlIHNyYz1cXFwiI3tkYXRhLm1wNH1cXFwiIHR5cGU9XFxcInZpZGVvL21wNFxcXCIgLz4gXCIpXG4gICAgICAgIHdlYm0gPSAkKFwiPHNvdXJjZSBzcmM9XFxcIiN7ZGF0YS53ZWJtfVxcXCIgdHlwZT1cXFwidmlkZW8vd2VibVxcXCIgLz4gXCIpXG5cbiAgICAgICAgQCR2aWRlb0VsID0gJChcIjx2aWRlbyBpZD0nb3ZlcmxheS1wbGF5ZXInIGNsYXNzPSd2anMtZGVmYXVsdC1za2luIHZpZGVvLWpzJyBjb250cm9scyBwcmVsb2FkPSdhdXRvJyAvPlwiKVxuICAgICAgICBAJHZpZGVvRWwuYXBwZW5kKG1wNClcbiAgICAgICAgQCR2aWRlb0VsLmFwcGVuZCh3ZWJtKVxuICAgICAgICBAJGNvbnRhaW5lci5odG1sIEAkdmlkZW9FbFxuXG4gICAgICAgIGlmIEB2aWRlb0luc3RhbmNlP1xuICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UuZGlzcG9zZSgpXG4gICAgICAgIEB2aWRlb0luc3RhbmNlID0gdmlkZW9qcyBcIm92ZXJsYXktcGxheWVyXCIgICxcbiAgICAgICAgICAgIHdpZHRoOlwiMTAwJVwiXG4gICAgICAgICAgICBoZWlnaHQ6XCIxMDAlXCJcblxuXG5cblxuICAgIHBsYXlWaWRlbzogKCkgPT5cbiMgICAgICAgIGlmKCEkKFwiaHRtbFwiKS5oYXNDbGFzcygnbW9iaWxlJykpXG4jICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UucGxheSgpXG4gICAgICAgIGlmIEB2aWRlb0luc3RhbmNlP1xuICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UucGxheSgpXG4gICAgICAgICAgICBcbiAgICBzaG93SW1hZ2U6ICgpID0+XG4gICAgICAgIGNvbnNvbGUubG9nICdzaG93SW1hZ2UnXG5cblxuXG5vdmVybGF5ID0gbmV3IFZpZGVvT3ZlcmxheSBcIiNvdmVybGF5XCJcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cy5pbml0VmlkZW9PdmVybGF5ID0gKGRhdGEpIC0+XG4gICAgY29uc29sZS5sb2cgJ2RhdGEyOiAnLCBkYXRhXG4gICAgb3ZlcmxheS5hcHBlbmREYXRhKGRhdGEpXG5cblxuICAgIGlmICEoZGF0YS5tcDQgPT0gXCJcIilcbiAgICAgICAgY29uc29sZS5sb2cgJ2RhdGEubXA0ICE9PSBcIlwiJ1xuICAgICAgICBvdmVybGF5LnRyYW5zaXRpb25Jbk92ZXJsYXkob3ZlcmxheS5wbGF5VmlkZW8pXG4gICAgZWxzZVxuICAgICAgICBjb25zb2xlLmxvZyAnZGF0YS5tcDQgPT09IFwiXCInXG4gICAgICAgIG92ZXJsYXkudHJhbnNpdGlvbkluT3ZlcmxheShvdmVybGF5LnNob3dJbWFnZSlcblxuXG5cblxuXG5cblxuXG5cblxuXG4iLCJQbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5GcmFtZXNNb2RlbCA9IHJlcXVpcmUgJy4vRnJhbWVzTW9kZWwuY29mZmVlJ1xuXG5tYXRjaEZyYW1lTnVtID0gL1xcZCsoPz1cXC5bYS16QS1aXSspL1xuXG5jbGFzcyBGcmFtZUFuaW1hdGlvbiBleHRlbmRzIFBsdWdpbkJhc2VcbiAgICBcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gICAgICAgIFxuICAgICAgICBAJGVsID0gJChvcHRzLmVsKVxuICAgICAgICBAYXN5bmMgPSBvcHRzLmFzeW5jIG9yIGZhbHNlXG4gICAgICAgIGRlcHRoPSBvcHRzLmRlcHRoIG9yIDFcbiAgICAgICAgQCRjb250YWluZXIgPSAkKFwiPGRpdiBjbGFzcz0nY29hc3Rlci1jb250YWluZXInIC8+XCIpXG4gICAgICAgIEAkY29udGFpbmVyLmF0dHIoJ2lkJyAsIG9wdHMuaWQpXG4gICAgICAgIEAkY29udGFpbmVyLmNzcygnei1pbmRleCcsIGRlcHRoKVxuICAgICAgICBUd2Vlbk1heC5zZXQgQCRjb250YWluZXIgLCBcbiAgICAgICAgICAgIHo6ZGVwdGggKiAxMFxuICAgICAgICBcbiAgICAgICAgc3VwZXIob3B0cylcbiAgICAgICAgXG4gICAgICAgIFxuICAgIFxuICAgIGluaXRpYWxpemU6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuICAgICAgICBcbiAgICAgICAgQG1vZGVsID0gbmV3IEZyYW1lc01vZGVsIG9wdHNcbiAgICAgICAgQG1vZGVsLm9uIFwiZGF0YUxvYWRlZFwiICwgQHNldHVwQ2FudmFzXG4gICAgICAgIEBtb2RlbC5vbiBcInRyYWNrTG9hZGVkXCIgLCBAb25UcmFja0xvYWRlZFxuICAgICAgICBAbW9kZWwub24gXCJmcmFtZXNMb2FkZWRcIiAsIEBvbkZyYW1lc0xvYWRlZFxuICAgICAgICBAbW9kZWwubG9hZERhdGEoKVxuICAgICAgICBcbiAgIFxuICAgICAgIFxuICAgIGxvYWRGcmFtZXM6IC0+XG4gICAgICAgIGlmIEBtb2RlbC5kYXRhP1xuICAgICAgICAgICAgQG1vZGVsLnByZWxvYWRGcmFtZXMoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZGVmZXJMb2FkaW5nID0gdHJ1ZVxuICAgICAgICBcbiAgICBcbiAgICBcbiAgICBzZXR1cENhbnZhczogPT5cbiAgICAgICAgXG5cbiAgICAgICAgQGNhbnZhc1dpZHRoID0gQG1vZGVsLmdldCgnZ2xvYmFsJykud2lkdGhcbiAgICAgICAgQGNhbnZhc0hlaWdodCA9IEBtb2RlbC5nZXQoJ2dsb2JhbCcpLmhlaWdodFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKVxuICAgICAgICBAY29udGV4dCA9IEBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICBcbiAgICAgICAgQGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJyAsIEBjYW52YXNXaWR0aClcbiAgICAgICAgQGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcgLCBAY2FudmFzSGVpZ2h0KVxuXG4gICAgICAgIFxuICAgICAgICBAJGNvbnRhaW5lci5hcHBlbmQoQGNhbnZhcylcbiAgICAgICAgQCRlbC5wcmVwZW5kKEAkY29udGFpbmVyKVxuICAgICAgICBAbW9kZWwucHJlbG9hZFRyYWNrKClcbiAgICAgICAgaWYgQGRlZmVyTG9hZGluZ1xuICAgICAgICAgICAgQG1vZGVsLnByZWxvYWRGcmFtZXMoKVxuICAgICAgXG4gICAgXG4gICAgZGlzcGxheVRyYWNrOiAtPlxuICAgICAgICBcbiAgICAgICAgQGNvbnRleHQuY2xlYXJSZWN0IDAgLCAwICwgQGNhbnZhc1dpZHRoICwgQGNhbnZhc0hlaWdodFxuICAgICAgICBAY29udGV4dC5kcmF3SW1hZ2UgQHRyYWNrSW1hZ2UudGFnICwgMCAsMCAsIEBjYW52YXNXaWR0aCAsIEBjYW52YXNIZWlnaHRcbiAgICAgICAgXG4gICAgZGlzcGxheUZyYW1lOiAobnVtKSAtPlxuICAgICAgICBcbiAgICAgICAgbWFuaWZlc3QgPSBAbW9kZWwuZ2V0KCdtYW5pZmVzdCcpXG4gICAgICAgIFxuICAgICAgICBpZiBtYW5pZmVzdC5sZW5ndGggPiBudW1cbiAgICAgICAgICAgIGFzc2V0ID0gbWFuaWZlc3RbbnVtXSBcbiAgICAgICAgICAgIGZyYW1lQXNzZXQgPSBAbW9kZWwuZ2V0QXNzZXQoYXNzZXQuZmlsZW5hbWUpXG4gICAgICAgICAgICAjIGNvbnNvbGUubG9nIGZyYW1lQXNzZXQudGFnICwgYXNzZXQueCAsIGFzc2V0LnksIGFzc2V0LndpZHRoLCBhc3NldC5oZWlnaHRcbiAgICAgICAgICAgIEBjb250ZXh0LmRyYXdJbWFnZSBmcmFtZUFzc2V0LnRhZyAsIGFzc2V0LnggLCBhc3NldC55LCBhc3NldC53aWR0aCwgYXNzZXQuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICBpbml0QW5pbWF0aW9uOiAtPlxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGZyYW1lcyA9IEBtb2RlbC5nZXQoJ21hbmlmZXN0JykubGVuZ3RoXG4gICAgICAgIHNwZWVkID0gQG1vZGVsLmdldCgnZ2xvYmFsJykuZnBzXG4gICAgICAgIGRlbGF5ID0gQG1vZGVsLmdldCgnZ2xvYmFsJykuZGVsYXkgb3IgMFxuICAgICAgICByZXBlYXREZWxheSA9IEBtb2RlbC5nZXQoJ2dsb2JhbCcpLnJlcGVhdERlbGF5IG9yIDEwXG4gICAgICAgIFxuICAgIFxuXG4gICAgICAgIGR1cmF0aW9uID0gIGZyYW1lcyAvIHNwZWVkXG5cblxuICAgICAgICBzZWxmID0gQCBcbiAgICAgICAgQGxhc3RGcmFtZU51bSA9IC0xXG4gICAgICAgIEB0aW1lbGluZSA9IHdpbmRvdy5jb2FzdGVyID0gVHdlZW5NYXgudG8gQGNhbnZhcyAsIGR1cmF0aW9uICwgXG4gICAgICAgICAgICBvblVwZGF0ZTogLT5cbiAgICAgICAgICAgICAgICBmcmFtZU51bSA9IE1hdGguZmxvb3IoZnJhbWVzICogQHByb2dyZXNzKCkpICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGZyYW1lTnVtIGlzbnQgQGxhc3RGcmFtZU51bSAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kaXNwbGF5VHJhY2soKVxuICAgICAgICAgICAgICAgICAgICBzZWxmLmRpc3BsYXlGcmFtZShmcmFtZU51bSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQGxhc3RGcmFtZU51bSA9IGZyYW1lTnVtXG4gICAgICAgICAgICByZXBlYXQ6LTFcbiAgICAgICAgICAgIHJlcGVhdERlbGF5OiByZXBlYXREZWxheVxuICAgICAgICAgICAgZGVsYXk6ZGVsYXlcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG5cbiAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgXG4gICAgb25UcmFja0xvYWRlZDogPT5cblxuICAgICAgICBAdHJhY2tJbWFnZSA9IEBtb2RlbC5nZXRBc3NldCgndHJhY2snKVxuICAgICAgICBAZGlzcGxheVRyYWNrKClcbiAgICAgICAgXG5cbiAgICBvbkZyYW1lc0xvYWRlZDogPT5cbiAgICAgICAgaWYgdHlwZW9mIEBhc3luYyBpcyAnZnVuY3Rpb24nXG4gICAgICAgICAgICBAYXN5bmMoKVxuICAgICAgICAkKHdpbmRvdykub24gJ3Njcm9sbCcsICBAY2hlY2tDb2FzdGVyVmlzaWJpbGl0eVxuICAgICAgICBAY2hlY2tDb2FzdGVyVmlzaWJpbGl0eSgpXG4gICAgXG4gICAgICAgIFxuICAgIGNoZWNrQ29hc3RlclZpc2liaWxpdHk6ID0+XG4gICAgICAgIFxuICAgICAgICBpZihAaW5WaWV3cG9ydCgpKVxuXG4gICAgICAgICAgICAkKHdpbmRvdykub2ZmICdzY3JvbGwnLCAgQGNoZWNrQ29hc3RlclZpc2liaWxpdHlcbiAgICAgICAgICAgIEBpbml0QW5pbWF0aW9uKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIGluVmlld3BvcnQ6ID0+XG4gICAgICAgIFxuICAgICAgICB0b3AgPSBAJGNvbnRhaW5lci5vZmZzZXQoKS50b3BcbiAgICAgICAgaGVpZ2h0ID0gQCRjb250YWluZXIuZmluZCgnY2FudmFzJykuZmlyc3QoKS5oZWlnaHQoKVxuICAgICAgICBib3R0b20gPSB0b3AgKyBoZWlnaHRcbiAgICAgICAgXG4gICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKVxuICAgICAgICBzY3JvbGxCb3R0b20gPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgKyAkKHdpbmRvdykuaGVpZ2h0KClcblxuICAgICAgICBpZiBzY3JvbGxUb3AgPD0gdG9wIDw9IHNjcm9sbEJvdHRvbVxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICBcbiBcblxubW9kdWxlLmV4cG9ydHMgPSBGcmFtZUFuaW1hdGlvblxuIiwiXG5cbm1hdGNoRnJhbWVOdW0gPSAvXFxkKyg/PVxcLlthLXpBLVpdKykvXG5cbmNsYXNzIEZyYW1lc01vZGVsIGV4dGVuZHMgRXZlbnRFbWl0dGVyXG5cblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgQGJhc2VVcmwgPSBvcHRzLmJhc2VVcmxcbiAgICAgICAgQHVybCA9IG9wdHMudXJsXG4gICAgICAgIEBsb2FkTWFuaWZlc3QgPSBbXTtcbiAgICAgICAgQHRyYWNrTWFuaWZlc3QgPSBbXTtcbiAgICAgICAgQGluaXRMb2FkZXIoKVxuICAgICAgICBzdXBlcihvcHRzKVxuICAgICAgICBcblxuICAgIGxvYWREYXRhOiAtPlxuICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgIHVybDogQGJhc2VVcmwgICsgQHVybFxuICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IEBvbkRhdGFMb2FkZWRcbiAgICAgICAgICAgIGVycm9yOiBAaGFuZGxlRXJyb3JcblxuICAgIGhhbmRsZUVycm9yOiAoZXJyKSAtPlxuICAgICAgICB0aHJvdyBlcnJcblxuICAgIG9uRGF0YUxvYWRlZDogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICBAZGF0YSA9IGRhdGFcbiAgICAgICAgQHRyYW5zZm9ybURhdGEoKVxuICAgICAgICBAZW1pdCBcImRhdGFMb2FkZWRcIlxuICAgICAgXG5cbiAgICBzb3J0U2VxdWVuY2U6IChhLGIpIC0+XG4gICAgICAgIGFGcmFtZSA9IG1hdGNoRnJhbWVOdW0uZXhlYyhhLmZpbGVuYW1lKVxuICAgICAgICBiRnJhbWUgPSBtYXRjaEZyYW1lTnVtLmV4ZWMoYi5maWxlbmFtZSlcbiAgICAgICAgcmV0dXJuIGlmIHBhcnNlSW50KGFGcmFtZVswXSkgPCBwYXJzZUludChiRnJhbWVbMF0pIHRoZW4gLTEgZWxzZSAxXG5cbiAgICB0cmFuc2Zvcm1EYXRhOiAtPlxuICAgICAgICBAZGF0YS5tYW5pZmVzdC5zb3J0IEBzb3J0U2VxdWVuY2VcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBAdHJhY2tNYW5pZmVzdC5wdXNoXG4gICAgICAgICAgICBpZDpcInRyYWNrXCJcbiAgICAgICAgICAgIHNyYzogXCIje0BkYXRhLmdsb2JhbC5mb2xkZXJ9LyN7QGRhdGEuZ2xvYmFsLnRyYWNrfVwiXG5cbiAgICAgICAgZm9yIGZyYW1lIGluIEBkYXRhLm1hbmlmZXN0XG4gICAgICAgICAgICBmcmFtZS5zcmMgPSBcIiN7QGRhdGEuZ2xvYmFsLmZvbGRlcn0vI3tmcmFtZS5maWxlbmFtZX1cIlxuICAgICAgICAgICAgQGxvYWRNYW5pZmVzdC5wdXNoXG4gICAgICAgICAgICAgICAgaWQ6IGZyYW1lLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgc3JjOiBmcmFtZS5zcmNcblxuICAgIGluaXRMb2FkZXI6IC0+XG4gICAgICAgIEB0cmFja0xvYWRlciA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUgdHJ1ZSwgQGJhc2VVcmwsIHRydWVcbiAgICAgICAgQHByZWxvYWRlciA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUgdHJ1ZSwgQGJhc2VVcmwsIHRydWVcbiAgICAgICAgQHRyYWNrTG9hZGVyLnNldE1heENvbm5lY3Rpb25zKDEwKVxuICAgICAgICBAcHJlbG9hZGVyLnNldE1heENvbm5lY3Rpb25zKDE1KVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIHByZWxvYWRUcmFjazogLT5cblxuICAgICAgICBAdHJhY2tMb2FkZXIuYWRkRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uVHJhY2tBc3NldHNDb21wbGV0ZVxuICAgICAgICBAdHJhY2tMb2FkZXIubG9hZE1hbmlmZXN0KEB0cmFja01hbmlmZXN0KVxuICAgIHByZWxvYWRGcmFtZXM6IC0+XG4jICAgICAgICBjb25zb2xlLmxvZyBAbG9hZE1hbmlmZXN0XG4gICAgICAgIFxuICAgICAgICBAcHJlbG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvbkFzc2V0c0NvbXBsZXRlXG4gICAgICAgIEBwcmVsb2FkZXIubG9hZE1hbmlmZXN0KEBsb2FkTWFuaWZlc3QpXG5cbiAgICBvblRyYWNrQXNzZXRzQ29tcGxldGU6IChlKSA9PlxuICAgICAgICBcbiAgICAgICAgQHRyYWNrTG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvblRyYWNrQXNzZXRzQ29tcGxldGVcbiAgICAgICAgQGVtaXQgXCJ0cmFja0xvYWRlZFwiXG5cbiAgICBvbkFzc2V0c0NvbXBsZXRlOiAoZSk9PlxuIyAgICAgICAgY29uc29sZS5sb2cgQHByZWxvYWRlclxuICAgICAgICBAcHJlbG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvbkFzc2V0c0NvbXBsZXRlXG4gICAgICAgIEBlbWl0IFwiZnJhbWVzTG9hZGVkXCJcblxuXG5cblxuICAgIGdldEFzc2V0OiAoaWQpIC0+XG4gICAgICAgIFxuICAgICAgICBpdGVtID0gIEBwcmVsb2FkZXIuZ2V0SXRlbSBpZFxuICAgICAgICBpZiAhaXRlbT9cbiAgICAgICAgICAgIGl0ZW0gPSAgQHRyYWNrTG9hZGVyLmdldEl0ZW0gaWQgICAgICAgIFxuICAgICAgICByZXR1cm4gaXRlbVxuXG4gICAgZ2V0OiAoa2V5KSAtPlxuICAgICAgICBmb3Igayx2IG9mIEBkYXRhXG4gICAgICAgICAgICBpZiBrIGlzIGtleVxuICAgICAgICAgICAgICAgIHJldHVybiB2XG5cbiAgICBzZXQ6IChrZXksIHZhbCkgLT5cbiAgICAgICAgQGRhdGFba2V5XSA9IHZhbFxuXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRnJhbWVzTW9kZWxcbiIsIlxyXG5WaWV3QmFzZSA9IHJlcXVpcmUgXCIuLi9hYnN0cmFjdC9WaWV3QmFzZS5jb2ZmZWVcIlxyXG5cclxuY2xhc3MgU2Nyb2xsQmFyIGV4dGVuZHMgVmlld0Jhc2VcclxuXHJcbiAgICBzY3JvbGxpbmcgOiBmYWxzZVxyXG4gICAgb2Zmc2V0WSA6IDBcclxuICAgIHBvc2l0aW9uIDogMFxyXG4gICAgaGlkZVRpbWVvdXQ6IDBcclxuXHJcblxyXG4gICAgaW5pdGlhbGl6ZTogLT5cclxuICAgICAgICBAb25SZXNpemUoKVxyXG4gICAgICAgIEBzZXRFdmVudHMoKVxyXG5cclxuICAgICAgICBpZiB3aW5kb3cuaXNUaWVyVGFibGV0XHJcbiAgICAgICAgICAgIEAkZWwuaGlkZSgpXHJcblxyXG5cclxuXHJcbiAgICBzZXRFdmVudHM6ID0+XHJcbiAgICAgICAgQGRlbGVnYXRlRXZlbnRzXHJcbiAgICAgICAgICAgIFwibW91c2Vkb3duIC5oYW5kbGVcIiA6IFwib25IYW5kbGVEb3duXCJcclxuICAgICAgICAgICAgI1wibW91c2VlbnRlclwiIDogXCJvbkhhbmRsZVVwXCJcclxuICAgICAgICAgICAgXCJjbGljayAucmFpbFwiIDogXCJvblJhaWxDbGlja1wiXHJcblxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uIFwibW91c2V1cFwiICwgQG9uSGFuZGxlVXBcclxuICAgICAgICAkKGRvY3VtZW50KS5vbiBcIm1vdXNlbW92ZVwiICwgQG9uTW91c2VNb3ZlXHJcblxyXG5cclxuICAgICAgICBcclxuICAgIHVwZGF0ZUhhbmRsZTogKHBvcykgPT5cclxuICAgICAgICBAcG9zaXRpb24gPSBwb3NcclxuICAgICAgICBAJGVsLmZpbmQoJy5oYW5kbGUnKS5jc3NcclxuICAgICAgICAgICAgdG9wOiBAcG9zaXRpb24gKiAoJCh3aW5kb3cpLmhlaWdodCgpIC0gQCRlbC5maW5kKFwiLmhhbmRsZVwiKS5oZWlnaHQoKSlcclxuICAgICAgICBAc2hvd1Njcm9sbGJhcigpXHJcbiAgICAgICAgQGhpZGVTY3JvbGxiYXIoKVxyXG5cclxuICAgIG9uUmFpbENsaWNrOiAoZSkgPT5cclxuICAgICAgICBAb2Zmc2V0WSA9IGlmIGUub2Zmc2V0WSBpc250IHVuZGVmaW5lZCB0aGVuIGUub2Zmc2V0WSBlbHNlIGUub3JpZ2luYWxFdmVudC5sYXllcllcclxuICAgICAgICBAcG9zaXRpb24gPSBAb2Zmc2V0WSAvICQod2luZG93KS5oZWlnaHQoKVxyXG4gICAgICAgIEB0cmlnZ2VyIFwiY3VzdG9tU2Nyb2xsSnVtcFwiICwgQHBvc2l0aW9uXHJcbiAgICAgICAgXHJcblxyXG5cclxuICAgIG9uSGFuZGxlRG93bjogKGUpID0+XHJcblxyXG4gICAgICAgIEAkZWwuY3NzXHJcbiAgICAgICAgICAgIHdpZHRoOlwiMTAwJVwiXHJcbiAgICAgICAgQG9mZnNldFkgPSBpZiBlLm9mZnNldFkgaXNudCB1bmRlZmluZWQgdGhlbiBlLm9mZnNldFkgZWxzZSBlLm9yaWdpbmFsRXZlbnQubGF5ZXJZXHJcbiAgICAgICAgQHNjcm9sbGluZyA9IHRydWVcclxuXHJcbiAgICBvbkhhbmRsZVVwOiAoZSkgPT5cclxuICAgICAgICBAJGVsLmNzc1xyXG4gICAgICAgICAgICB3aWR0aDpcIjE1cHhcIlxyXG5cclxuICAgICAgICBAc2Nyb2xsaW5nID0gZmFsc2VcclxuXHJcbiAgICBvbk1vdXNlTW92ZTogKGUpID0+XHJcbiAgICAgICAgaWYgQHNjcm9sbGluZ1xyXG5cclxuICAgICAgICAgICAgaWYgZS5wYWdlWSAtIEBvZmZzZXRZIDw9IDBcclxuICAgICAgICAgICAgICAgICQoXCIuaGFuZGxlXCIpLmNzc1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogMVxyXG4gICAgICAgICAgICBlbHNlIGlmIGUucGFnZVkgLSBAb2Zmc2V0WSA+PSAkKHdpbmRvdykuaGVpZ2h0KCkgLSAkKFwiI3Njcm9sbGJhciAuaGFuZGxlXCIpLmhlaWdodCgpXHJcbiAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAkKFwiLmhhbmRsZVwiKS5jc3NcclxuICAgICAgICAgICAgICAgICAgICB0b3A6ICAgKCQod2luZG93KS5oZWlnaHQoKSAtICQoXCIjc2Nyb2xsYmFyIC5oYW5kbGVcIikuaGVpZ2h0KCkpIC0gMVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAkKFwiLmhhbmRsZVwiKS5jc3NcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IGUucGFnZVkgLSBAb2Zmc2V0WVxyXG5cclxuXHJcbiAgICAgICAgICAgIEBwb3NpdGlvbiA9IHBhcnNlSW50KCQoXCIjc2Nyb2xsYmFyIC5oYW5kbGVcIikuY3NzKFwidG9wXCIpKSAvICgkKHdpbmRvdykuaGVpZ2h0KCkgLSAkKFwiI3Njcm9sbGJhciAuaGFuZGxlXCIpLmhlaWdodCgpKVxyXG5cclxuICAgICAgICAgICAgaWYgQHBvc2l0aW9uIDwgcGFyc2VGbG9hdCguMDA1KVxyXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uID0gMFxyXG4gICAgICAgICAgICBlbHNlIGlmIEBwb3NpdGlvbiA+IHBhcnNlRmxvYXQoLjk5NSlcclxuICAgICAgICAgICAgICAgIEBwb3NpdGlvbiA9IDFcclxuXHJcblxyXG4gICAgICAgICAgICBAdHJpZ2dlciBcImN1c3RvbVNjcm9sbFwiICwgQHBvc2l0aW9uXHJcbiAgICAgICAgICBcclxuICAgXHJcbiAgICAgICAgaWYgQG1vdXNlWCBpc250IGUuY2xpZW50WCBhbmQgQG1vdXNlWSBpc250IGUuY2xpZW50WVxyXG4gICAgICAgICAgICBAc2hvd1Njcm9sbGJhcigpXHJcbiAgICAgICAgICAgIEBoaWRlU2Nyb2xsYmFyKClcclxuXHJcbiAgICAgICAgQG1vdXNlWCA9IGUuY2xpZW50WFxyXG4gICAgICAgIEBtb3VzZVkgPSBlLmNsaWVudFlcclxuXHJcbiAgICBvblJlc2l6ZTogKGUpID0+XHJcblxyXG5cclxuICAgICAgICBAJGVsLmZpbmQoJy5oYW5kbGUnKS5jc3NcclxuICAgICAgICAgICAgaGVpZ2h0OiAoJCh3aW5kb3cpLmhlaWdodCgpIC8gJChcInNlY3Rpb25cIikuaGVpZ2h0KCkgKSAqICQod2luZG93KS5oZWlnaHQoKVxyXG5cclxuICAgICAgICBAdXBkYXRlSGFuZGxlKEBwb3NpdGlvbilcclxuXHJcblxyXG4gICAgaGlkZVNjcm9sbGJhcjogPT5cclxuICAgICAgICBpZiBAaGlkZVRpbWVvdXQ/XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChAaGlkZVRpbWVvdXQpXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIEBoaWRlVGltZW91dCA9IHNldFRpbWVvdXQgKD0+XHJcbiAgICAgICAgICAgIGlmIEBtb3VzZVkgPiA3MlxyXG4gICAgICAgICAgICAgICAgVHdlZW5NYXgudG8gQCRlbCwgLjUgLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dG9BbHBoYTogMFxyXG4gICAgICAgICAgICApICwgMjAwMFxyXG4gICAgICAgIFxyXG5cclxuICAgIHNob3dTY3JvbGxiYXI6ID0+XHJcbiAgICAgICAgVHdlZW5NYXgudG8gQCRlbCAsIC41ICxcclxuICAgICAgICAgICAgYXV0b0FscGhhOiAuNVxyXG5cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNjcm9sbEJhciIsIlxyXG5cclxuY2xhc3MgU2hhcmVyXHJcblxyXG4gICAgXHJcbiAgICBTaGFyZXIuaW5pdEZhY2Vib29rID0gLT5cclxuICAgICAgICBGQi5pbml0IFxyXG4gICAgICAgICAgICBhcHBJZDpcIjIxNTIyNDcwNTMwNzM0MVwiXHJcbiAgICAgICAgICAgIGNoYW5uZWxVcmw6XCIvY2hhbm5lbC5odG1sXCJcclxuICAgICAgICAgICAgc3RhdHVzOiB0cnVlXHJcbiAgICAgICAgICAgIHhmYmw6IHRydWVcclxuXHJcblxyXG4gICAgICAgIFxyXG4gICAgXHJcbiAgICBTaGFyZXIuc2hhcmVUd2l0dGVyID0gKHNoYXJlTWVzc2FnZSwgIHVybCwgaGFzaHRhZ3MpIC0+XHJcbiAgICAgICAgdGV4dCA9IHNoYXJlTWVzc2FnZVxyXG4gICAgICAgIGhhc2h0YWdzID0gXCJcIlxyXG4gICAgICAgIHVybCA9IHVybFxyXG4gICAgICAgIHR3VVJMID0gXCJodHRwczovL3R3aXR0ZXIuY29tL2ludGVudC90d2VldD90ZXh0PVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpICsgXCImdXJsPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHVybClcclxuICAgICAgICBzdHIgKz0gXCImaGFzaHRhZ3M9XCIgKyBoYXNodGFncyAgaWYgaGFzaHRhZ3NcclxuICAgICAgICBAb3BlblBvcHVwIDU3NSwgNDIwLCB0d1VSTCwgXCJUd2l0dGVyXCJcclxuXHJcbiAgICBTaGFyZXIuc2hhcmVGYWNlYm9vayA9IChuYW1lLCAgY2FwdGlvbiAsZGVzY3JpcHRpb24gLCBsaW5rICwgcGljdHVyZSkgLT5cclxuXHJcbiAgICAgICAgRkIudWlcclxuICAgICAgICAgICAgbWV0aG9kOlwiZmVlZFwiXHJcbiAgICAgICAgICAgIGxpbms6bGlua1xyXG4gICAgICAgICAgICBwaWN0dXJlOnBpY3R1cmVcclxuICAgICAgICAgICAgbmFtZTogbmFtZVxyXG4gICAgICAgICAgICBjYXB0aW9uOmNhcHRpb25cclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ZGVzY3JpcHRpb25cclxuICAgICAgICBcclxuXHJcbiAgICBTaGFyZXIuc2hhcmVHb29nbGUgPSAodXJsKSAtPlxyXG5cclxuICAgICAgICBAb3BlblBvcHVwIDYwMCwgNDAwICwgXCJodHRwczovL3BsdXMuZ29vZ2xlLmNvbS9zaGFyZT91cmw9XCIrdXJsLCBcIkdvb2dsZVwiXHJcblxyXG4gICAgU2hhcmVyLnNoYXJlUGludGVyZXN0ID0gKHVybCAsIGRlc2NyaXB0aW9uLCBwaWN0dXJlKSAtPlxyXG5cclxuICAgICAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uLnNwbGl0KFwiIFwiKS5qb2luKFwiK1wiKVxyXG4gICAgICAgIEBvcGVuUG9wdXAgNzgwLCAzMjAsIFwiaHR0cDovL3BpbnRlcmVzdC5jb20vcGluL2NyZWF0ZS9idXR0b24vP3VybD0je2VuY29kZVVSSUNvbXBvbmVudCh1cmwpfSZhbXA7ZGVzY3JpcHRpb249I3tkZXNjcmlwdGlvbn0mYW1wO21lZGlhPSN7ZW5jb2RlVVJJQ29tcG9uZW50KHBpY3R1cmUpfVwiXHJcblxyXG5cclxuICAgIFNoYXJlci5lbWFpbExpbmsgPSAoc3ViamVjdCwgYm9keSkgLT5cclxuICAgICAgICB4ID0gQG9wZW5Qb3B1cCAxICwgMSwgXCJtYWlsdG86JnN1YmplY3Q9I3tlbmNvZGVVUklDb21wb25lbnQoc3ViamVjdCl9JmJvZHk9I3tlbmNvZGVVUklDb21wb25lbnQoYm9keSl9XCJcclxuICAgICAgICB4LmNsb3NlKClcclxuXHJcbiAgICBTaGFyZXIub3BlblBvcHVwID0gKHcsIGgsIHVybCwgbmFtZSkgLT5cclxuICAgICAgICB3aW5kb3cub3BlbiB1cmwsIG5hbWUsIFwic3RhdHVzPTEsd2lkdGg9XCIgKyB3ICsgXCIsaGVpZ2h0PVwiICsgaCArIFwiLGxlZnQ9XCIgKyAoc2NyZWVuLndpZHRoIC0gdykgLyAyICsgXCIsdG9wPVwiICsgKHNjcmVlbi5oZWlnaHQgLSBoKSAvIDJcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXJlciIsImdsb2JhbHMgPSByZXF1aXJlICcuL2NvbS9nbG9iYWwvaW5kZXguY29mZmVlJ1xuUGFya3NMaXN0ID0gcmVxdWlyZSAnLi9jb20vcGx1Z2lucy9QYXJrc0xpc3QuY29mZmVlJ1xuRHJhZ2dhYmxlR2FsbGVyeSA9IHJlcXVpcmUgJy4vY29tL3BsdWdpbnMvRHJhZ2dhYmxlR2FsbGVyeS5jb2ZmZWUnXG5GYWRlR2FsbGVyeSA9IHJlcXVpcmUgJy4vY29tL3BsdWdpbnMvRmFkZUdhbGxlcnkuY29mZmVlJ1xuSGVhZGVyQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9jb20vcGx1Z2lucy9IZWFkZXJBbmltYXRpb24uY29mZmVlJ1xuV2hvV2VBcmVQYWdlID0gcmVxdWlyZSAnLi9jb20vcGFnZXMvV2hvV2VBcmVQYWdlLmNvZmZlZSdcbklubGluZVZpZGVvID0gcmVxdWlyZSAnLi9jb20vcGx1Z2lucy9JbmxpbmVWaWRlby5jb2ZmZWUnXG5cblxuJChkb2N1bWVudCkucmVhZHkgLT5cblxuICAgICMkKFwiI2NvbnRlbnRcIikuY3NzKFwiaGVpZ2h0XCIgLCAkKCcjY29udGVudCcpLmhlaWdodCgpKVxuXG4gICAgam9icyA9IG5ldyBXaG9XZUFyZVBhZ2VcbiAgICAgICAgZWw6IFwiYm9keVwiXG4gICAgICAgIFxuICAgICAgICBcbiJdfQ==
