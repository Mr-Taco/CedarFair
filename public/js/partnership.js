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



},{"../pages/animations/clouds.coffee":6,"../plugins/HeaderAnimation.coffee":13,"../util/ScrollBar.coffee":20,"./ViewBase.coffee":3}],2:[function(require,module,exports){
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



},{"../util/Sharer.coffee":21}],4:[function(require,module,exports){
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



},{"../plugins/BasicOverlay.coffee":9,"../plugins/SvgInject.coffee":16}],5:[function(require,module,exports){
var AnimationBase, DraggableGallery, FadeGallery, FormHandler, FrameAnimation, HeaderAnimation, ParksList, PartnershipPage, ResizeButtons, animations, globalAnimations,
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

animations = require('./animations/partnerships.coffee');

globalAnimations = require('./animations/global.coffee');

FormHandler = require('../plugins/FormHandler.coffee');

PartnershipPage = (function(superClass) {
  extend(PartnershipPage, superClass);

  function PartnershipPage(el) {
    this.resetTimeline = bind(this.resetTimeline, this);
    this.totalAnimationTime = 25;
    PartnershipPage.__super__.constructor.call(this, el);
  }

  PartnershipPage.prototype.initialize = function() {
    return PartnershipPage.__super__.initialize.call(this);
  };

  PartnershipPage.prototype.initComponents = function() {
    var coaster, numbers, resizebuttons, sponsorTypes, sponsorshipForm;
    PartnershipPage.__super__.initComponents.call(this);
    sponsorshipForm = new FormHandler({
      el: '#partnership-contact-form'
    });
    if (!this.isPhone) {
      coaster = new FrameAnimation({
        id: "sponsorship-coaster-1",
        el: "#sponsorship-section1",
        baseUrl: this.cdnRoot + "coasters/",
        url: "shot-2/data.json"
      });
      coaster.loadFrames();
      resizebuttons = new ResizeButtons;
      numbers = new DraggableGallery({
        el: "#select",
        across: 1
      });
    } else {
      sponsorTypes = new DraggableGallery({
        el: "#testimonials",
        across: 1
      });
      numbers = new DraggableGallery({
        el: "#select #thrilling-numbers-wrapper",
        across: 1
      });
    }
    window.ddls = [];
    window.ddls.push($('#PartnershipTypes1-select').cfDropdown({
      onSelect: function(t) {
        var id;
        return id = $(t).data('id');
      }
    }));
    return window.ddls.push($('#PartnershipTypes2-select').cfDropdown({
      onSelect: function(t) {
        var id;
        return id = $(t).data('id');
      }
    }));
  };

  PartnershipPage.prototype.resetTimeline = function() {
    PartnershipPage.__super__.resetTimeline.call(this);
    this.parallax.push(globalAnimations.clouds("#section1", 0, 1, this.isTablet ? 1 : 5));
    if (!this.isPhone) {
      this.triggers.push(animations.topHeadline());
      this.triggers.push(animations.scrollCircle());
      this.triggers.push(animations.selectBox());
      this.triggers.push(animations.s2TopHeadline());
      return this.triggers.push(animations.testimonialCircles());
    }
  };

  return PartnershipPage;

})(AnimationBase);

module.exports = PartnershipPage;



},{"../abstract/AnimationBase.coffee":1,"../plugins/DraggableGallery.coffee":10,"../plugins/FadeGallery.coffee":11,"../plugins/FormHandler.coffee":12,"../plugins/HeaderAnimation.coffee":13,"../plugins/ParksList.coffee":14,"../plugins/ResizeButtons.coffee":15,"../plugins/coasters/FrameAnimation.coffee":18,"./animations/global.coffee":7,"./animations/partnerships.coffee":8}],6:[function(require,module,exports){
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
  $el = $('#sponsorships');
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
  $el = $("#sponsorships .circ-btn-wrapper");
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
  $el = $('#sponsorships #select');
  tween = new TimelineMax;
  tween.add(TweenMax.fromTo($el, .35, {
    opacity: 0,
    scale: .75
  }, {
    opacity: 1,
    scale: 1
  }), 0.5);
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

module.exports.testimonialCircles = function() {
  var $el, i, j, len, ref, slide, tween;
  $el = $('#testimonials');
  tween = new TimelineMax;
  ref = $el.find('.swiper-container .swiper-slide');
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    slide = ref[i];
    tween.add(TweenMax.fromTo($(slide).find('.circle'), .35, {
      rotation: -90,
      alpha: 0,
      scale: 0
    }, {
      rotation: 0,
      alpha: 1,
      scale: 1,
      ease: Back.easeOut
    }, .05), i * .15);
    tween.add(TweenMax.fromTo($(slide).find('a.btn'), .25, {
      scale: 0.5,
      alpha: 0
    }, {
      scale: 1,
      alpha: 1
    }), 0.15 + (i * .2));
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



},{"../abstract/PluginBase.coffee":2,"./VideoOverlay.coffee":17}],12:[function(require,module,exports){
var FormHandler, PluginBase,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = require('../abstract/PluginBase.coffee');


/*
  
  create form object on page (src/com/pages/) after you've created and added any ddl objects
  
  window.ddls = []    
  window.ddls.push $('#select').cfDropdown
        onSelect: (t) ->
            id = $(t).data('id')  
  
  myform = new FormHandler
    el: '#sales-form'
 */


/* 
  todo:
  5. customize confirmation
  2: validate date type
  4: add input mask for phone and date
 */

FormHandler = (function(superClass) {
  extend(FormHandler, superClass);

  function FormHandler(opts) {
    this.$el = $(opts.el);
    this.formcontainer = this;
    FormHandler.__super__.constructor.call(this, opts);
  }

  FormHandler.prototype.initialize = function() {
    return FormHandler.__super__.initialize.call(this);
  };

  FormHandler.prototype.validate = function() {
    var $form, cls, data, errorHtml, errors, errorsContainer, handler, inputContainers, inputs, invalidFieldCount, response, valid;
    $form = this.$el;
    errorsContainer = '#' + $form.data('errors');
    handler = $form.data('handler');
    errors = '';
    invalidFieldCount = 0;
    data = {};
    inputs = $form.find('input:not([type=radio], [type=hidden]), textarea, .radios');
    inputContainers = $form.find('.input, textarea, .radios');
    $(inputContainers).removeClass('invalid');
    inputs.each((function(_this) {
      return function(i, t) {
        var emailPattern, fieldName, isradio, parent, pat, required, type, value;
        value = '';
        type = $(t).data('type');
        parent = $(t).parents('.input').eq(0);
        required = $(parent).hasClass('required') || $(t).hasClass('required');
        isradio = $(t).hasClass('radios');
        if (isradio && $('input:radio[name=' + $(t).data('group') + ']:checked').size() === 1) {
          value = $('input:radio[name=' + $(t).data('group') + ']:checked').val().trim();
        }
        value = isradio ? value : $(t).val().trim();
        data[$(t).data('mapping')] = value;
        fieldName = $(t).data('name') ? $(t).data('name') : $(t).attr('placeholder');
        if (required && (value.length === 0)) {
          errors += '<li>' + fieldName + ' is required.</li>';
          if ($(t).prop('tagName').toLowerCase() === 'textarea' || $(t).hasClass('radios')) {
            $(t).addClass('invalid');
          } else {
            $(t).parents('.input').addClass('invalid');
          }
          return invalidFieldCount++;
        } else {
          if (value.length > 0) {
            switch (type) {
              case 'email':
                emailPattern = /^([\w.-]+)@([\w.-]+)\.([a-zA-Z.]{2,6})$/i;
                if (!value.match(emailPattern)) {
                  errors += '<li>' + fieldName + ' is not a valid email address.</li>';
                  $(t).parents('.input').addClass('invalid');
                  return invalidFieldCount++;
                }
                break;
              case 'number':
                if (isNaN(value) || (value % 1 !== 0)) {
                  errors += '<li>' + fieldName + ' is not a valid number.</li>';
                  $(t).parents('.input').addClass('invalid');
                  return invalidFieldCount++;
                }
                break;
              case 'phone':
                pat = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/;
                if (!value.match(pat)) {
                  errors += '<li>' + fieldName + ' is not a valid phone number.</li>';
                  $(t).parents('.input').addClass('invalid');
                  return invalidFieldCount++;
                }
            }
          }
        }
      };
    })(this));
    if (window.ddls != null) {
      $.each(window.ddls, (function(_this) {
        return function(i, d) {
          d.removeClass('invalid');
          data[d.mapping] = d.value.trim();
          if (d.required && (d.value.trim().length === 0)) {
            errors += '<li>' + d.name + ' is required.</li>';
            d.addClass('invalid');
            return invalidFieldCount++;
          }
        };
      })(this));
    }
    valid = invalidFieldCount === 0;
    errorHtml = valid ? '' : '<ul>' + errors + '</ul>';
    cls = valid ? 'success' : 'failure';
    $(errorsContainer).removeClass('success failure').addClass(cls).html(errorHtml);
    $(errorsContainer).stop().animate({
      height: $(errorsContainer).find('ul').height()
    });
    response = {
      valid: valid,
      handler: handler,
      data: data,
      container: errorsContainer
    };
    return response;
  };

  FormHandler.prototype.submitForm = function(e, parent) {
    var validation;
    e.preventDefault();
    validation = parent.validate();
    if (validation.valid) {
      return $.ajax({
        url: validation.handler,
        method: "POST",
        dataType: 'json',
        data: validation.data,
        complete: function(response) {
          var cls, good, message, res;
          res = response.responseJSON != null ? response.responseJSON : response;
          message = '<div id="conclusion">Your submission failed.</div>';
          good = false;
          if (res.message != null) {
            good = res.message === 'success';
            if (good) {
              message = '<div id="conclusion">Thank you.  We have received your request, and will reply to you shortly.</div>';
            } else {
              if ((res.error != null) && (res.error.errors != null)) {
                message = '<ul id="conclusion">';
                $.each(res.error.errors, (function(_this) {
                  return function(i, obj) {
                    return message += '<li>' + obj.message + '</li>';
                  };
                })(this));
                message += '</ul>';
              }
            }
          }
          cls = good ? 'success' : 'failure';
          $(validation.container).removeClass('success failure').addClass(cls).html(message);
          $(validation.container).stop().animate({
            height: $(validation.container).find('#conclusion').height()
          });
          if (good) {
            return parent.clearForm();
          }
        }
      });
    }
  };

  FormHandler.prototype.clearForm = function() {
    var $form, inputs, radios;
    $form = this.$el;
    radios = $form.find('.radios');
    radios.removeClass('invalid');
    $.each(radios, (function(_this) {
      return function(x, r) {
        return $(radios).find('input:radio').removeAttr("checked");
      };
    })(this));
    inputs = $form.find('input:not([type=radio]), textarea');
    inputs.removeClass('invalid').parents('.input').removeClass('invalid');
    $.each(inputs, (function(_this) {
      return function(i, t) {
        return $(t).val('');
      };
    })(this));
    if (window.ddls != null) {
      return $.each(window.ddls, (function(_this) {
        return function(i, d) {
          return d.clearSelection();
        };
      })(this));
    }
  };

  FormHandler.prototype.addEvents = function() {
    var submitter, that;
    submitter = this.$el.data('submitter');
    that = this;
    $('#' + submitter).on('click', function(e) {
      return that.submitForm(e, that);
    });
    this.$el.find('input:not([type=radio]), textarea').on('blur', function(e) {
      if ($(this).parents('.input').hasClass('invalid') || $(this).hasClass('invalid')) {
        return that.validate();
      }
    });
    this.$el.find('input:radio').on('click', function(e) {
      if ($(this).parents('.radios').hasClass('invalid')) {
        return that.validate();
      }
    });
    if (window.ddls != null) {
      return $.each(window.ddls, (function(_this) {
        return function(i, d) {
          var hiddenField;
          if (d.required) {
            hiddenField = d.input[0];
            return $(hiddenField).on('change', function(e) {
              return that.validate();
            });
          }
        };
      })(this));
    }
  };

  return FormHandler;

})(PluginBase);

module.exports = FormHandler;



},{"../abstract/PluginBase.coffee":2}],13:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":2,"./VideoOverlay.coffee":17}],15:[function(require,module,exports){
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



},{"../abstract/PluginBase.coffee":2}],16:[function(require,module,exports){
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



},{"../../abstract/PluginBase.coffee":2,"./FramesModel.coffee":19}],19:[function(require,module,exports){
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



},{"../abstract/ViewBase.coffee":3}],21:[function(require,module,exports){
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



},{}],22:[function(require,module,exports){
var DraggableGallery, FadeGallery, ParksList, PartnershipPage, globals;

globals = require('./com/global/index.coffee');

ParksList = require('./com/plugins/ParksList.coffee');

DraggableGallery = require('./com/plugins/DraggableGallery.coffee');

FadeGallery = require('./com/plugins/FadeGallery.coffee');

PartnershipPage = require('./com/pages/PartnershipPage.coffee');

$(document).ready(function() {
  var partnership;
  partnership = new PartnershipPage({
    el: "body"
  });
  return $('.circle').on('click', function() {
    var target;
    target = $(this);
    return TweenMax.fromTo(target, .5, {
      rotationY: 720
    }, {
      rotationY: 0
    });
  });
});



},{"./com/global/index.coffee":4,"./com/pages/PartnershipPage.coffee":5,"./com/plugins/DraggableGallery.coffee":10,"./com/plugins/FadeGallery.coffee":11,"./com/plugins/ParksList.coffee":14}]},{},[22])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvQW5pbWF0aW9uQmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvVmlld0Jhc2UuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL2dsb2JhbC9pbmRleC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvUGFydG5lcnNoaXBQYWdlLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wYWdlcy9hbmltYXRpb25zL2Nsb3Vkcy5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvYW5pbWF0aW9ucy9nbG9iYWwuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BhZ2VzL2FuaW1hdGlvbnMvcGFydG5lcnNoaXBzLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0Jhc2ljT3ZlcmxheS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9EcmFnZ2FibGVHYWxsZXJ5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0ZhZGVHYWxsZXJ5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0Zvcm1IYW5kbGVyLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0hlYWRlckFuaW1hdGlvbi5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9QYXJrc0xpc3QuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvUmVzaXplQnV0dG9ucy5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9TdmdJbmplY3QuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvVmlkZW9PdmVybGF5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL2NvYXN0ZXJzL0ZyYW1lQW5pbWF0aW9uLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL2NvYXN0ZXJzL0ZyYW1lc01vZGVsLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS91dGlsL1Njcm9sbEJhci5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vdXRpbC9TaGFyZXIuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvcGFydG5lcnNoaXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQ0EsSUFBQSwyREFBQTtFQUFBOzs2QkFBQTs7QUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLG1CQUFSLENBQVgsQ0FBQTs7QUFBQSxTQUNBLEdBQVksT0FBQSxDQUFRLDBCQUFSLENBRFosQ0FBQTs7QUFBQSxlQUVBLEdBQWtCLE9BQUEsQ0FBUSxtQ0FBUixDQUZsQixDQUFBOztBQUFBLE1BR0EsR0FBUyxPQUFBLENBQVEsbUNBQVIsQ0FIVCxDQUFBOztBQUFBO0FBUUksbUNBQUEsQ0FBQTs7QUFBYSxFQUFBLHVCQUFDLEVBQUQsR0FBQTtBQUNULHlEQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsNkNBQUEsQ0FBQTtBQUFBLHlDQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsMkRBQUEsQ0FBQTtBQUFBLElBQUEsK0NBQU0sRUFBTixDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFEWixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLENBRlYsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxDQUhkLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxrQkFBRCxHQUF5QixJQUFDLENBQUEsUUFBSixHQUFrQixFQUFsQixHQUEwQixDQUpoRCxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsWUFBRCxHQUFnQixDQUxoQixDQUFBO0FBQUEsSUFNQSxJQUFDLENBQUEsU0FBRCxHQUFhLENBTmIsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLGVBQUQsR0FBbUIsQ0FQ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QUUsSUFBRixDQUFULENBQUE7V0FDQSxRQUFRLENBQUMsTUFBVCxDQUFnQixNQUFoQixFQUF3QixFQUF4QixFQUE0QjtBQUFBLE1BQUUsU0FBQSxFQUFXLEdBQWI7S0FBNUIsRUFBK0M7QUFBQSxNQUFDLFNBQUEsRUFBVyxDQUFaO0tBQS9DLEVBRnFCO0VBQUEsQ0FBekIsRUFMYztBQUFBLENBQWxCLENBUEEsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcblZpZXdCYXNlID0gcmVxdWlyZSBcIi4vVmlld0Jhc2UuY29mZmVlXCJcblNjcm9sbEJhciA9IHJlcXVpcmUgXCIuLi91dGlsL1Njcm9sbEJhci5jb2ZmZWVcIlxuSGVhZGVyQW5pbWF0aW9uID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9IZWFkZXJBbmltYXRpb24uY29mZmVlJ1xuY2xvdWRzID0gcmVxdWlyZSAnLi4vcGFnZXMvYW5pbWF0aW9ucy9jbG91ZHMuY29mZmVlJ1xuXG5jbGFzcyBBbmltYXRpb25CYXNlIGV4dGVuZHMgVmlld0Jhc2VcblxuXG4gICAgY29uc3RydWN0b3I6IChlbCkgLT5cbiAgICAgICAgc3VwZXIoZWwpXG4gICAgICAgIEB0aW1lbGluZSA9IG51bGxcbiAgICAgICAgQHRvdWNoWSA9IDBcbiAgICAgICAgQHRvdWNoWUxhc3QgPSAwXG4gICAgICAgIEBnbG9iYWxTY3JvbGxBbW91bnQgPSBpZiBAaXNUYWJsZXQgdGhlbiAuNSBlbHNlIDFcbiAgICAgICAgQHByZXZTY3JvbGxUbyA9IDBcbiAgICAgICAgQHByZXZEZWx0YSA9IDBcbiAgICAgICAgQGN1cnJlbnRQcm9ncmVzcyA9IDBcbiAgICAgICAgQHRvdGFsQW5pbWF0aW9uVGltZSA9IDEwXG4gICAgICAgIEBzbW9vdGhNdWx0aXBsaWVyID0gNVxuICAgICAgICBAbmF2VGltZXIgPSBudWxsXG4gICAgICAgIEB2aWRlbyA9IG51bGxcbiAgICAgICAgQGlubGluZVZpZGVvID0gbnVsbFxuICAgICAgICBAaXNUYWJsZXQgPSAkKCdodG1sJykuaGFzQ2xhc3MoJ3RhYmxldCcpXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBzdXBlcigpXG5cbiAgICAgICAgaWYgIUBpc1Bob25lICBcbiAgICAgICAgICAgIEByZXNldFRpbWVsaW5lKClcbiAgICAgICAgICAgIEB0b2dnbGVUb3VjaE1vdmUoKVxuICAgICAgICAgICAgQG9uUmVzaXplKClcbiAgICAgICAgICAgIEB1cGRhdGVUaW1lbGluZSgpXG5cbiAgICBpbml0Q29tcG9uZW50czogLT5cbiAgICAgICAgQGhlYWRlciA9IG5ldyBIZWFkZXJBbmltYXRpb24gXG4gICAgICAgICAgICBlbDonaGVhZGVyJ1xuXG4gICAgXG5cblxuICAgIHRvZ2dsZVRvdWNoTW92ZTogKCkgPT5cbiAgICAgICAgJChkb2N1bWVudCkub2ZmICdzY3JvbGwnICwgQG9uU2Nyb2xsXG4gICAgICAgIFxuICAgICAgICBAc2Nyb2xsID1cbiAgICAgICAgICAgIHBvc2l0aW9uOiAwXG4gICAgICAgICAgICBzY3JvbGxUb3A6IDBcbiAgICAgICAgJChkb2N1bWVudCkuc2Nyb2xsIEBvblNjcm9sbFxuICAgICAgICBAb25TY3JvbGwoKVxuXG5cbiAgICBnZXRTY3JvbGxhYmxlQXJlYTogLT5cbiAgICAgICAgTWF0aC5hYnMoJChcIiNjb250ZW50XCIpLm91dGVySGVpZ2h0KCkgLSBAc3RhZ2VIZWlnaHQpXG4gICAgXG4gICAgZ2V0U2Nyb2xsVG9wOiAtPlxuICAgICAgICAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSAvIEBnZXRTY3JvbGxhYmxlQXJlYSgpICAgICBcbiAgICBcbiAgICBcbiAgICBzZXRTY3JvbGxUb3A6IChwZXIpIC0+ICAgICAgXG4gICAgICAgIHBvcyA9IEBnZXRTY3JvbGxhYmxlQXJlYSgpICogcGVyXG4gICAgICAgIHdpbmRvdy5zY3JvbGxUbyAwICwgcG9zXG5cblxuICAgIHNldERyYWdnYWJsZVBvc2l0aW9uOiAocGVyKSAtPiAgICAgICAgXG4gICAgICAgIHBvcyA9IEBnZXRTY3JvbGxhYmxlQXJlYSgpICogcGVyICAgICAgICBcbiAgICAgICAgVHdlZW5NYXguc2V0ICQoXCIjY29udGVudFwiKSAsXG4gICAgICAgICAgICB5OiAtcG9zIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICBvblNjcm9sbDogKGUpID0+XG4gICAgICAgIGlmICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpID4gMzBcbiAgICAgICAgICAgICQoJy5jaXJjLWJ0bi13cmFwcGVyJykuYWRkQ2xhc3MgJ2ludmlzaWJsZSdcbiAgICAgICAgICAgIFxuICAgICAgICBAc2Nyb2xsLnBvc2l0aW9uID0gQGdldFNjcm9sbFRvcCgpXG4gICAgICAgIEBzY3JvbGwuc2Nyb2xsVG9wID0gJChkb2N1bWVudCkuc2Nyb2xsVG9wKClcbiAgICAgICAgQHVwZGF0ZVRpbWVsaW5lKCkgICAgICAgIFxuICAgICAgICBcblxuICAgIG9uRHJhZzogKGUpID0+XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgQHNjcm9sbC5wb3NpdGlvbiA9IE1hdGguYWJzIEBzY3JvbGwueSAvICBAZ2V0U2Nyb2xsYWJsZUFyZWEoKVxuICAgICAgICBAc2Nyb2xsLnNjcm9sbFRvcCA9IC1Ac2Nyb2xsLnlcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgQHVwZGF0ZVRpbWVsaW5lKClcblxuXG4gICAgb25SZXNpemU6ID0+XG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgaWYgIUBpc1RhYmxldFxuICAgICAgICAgICAgQHJlc2V0VGltZWxpbmUoKVxuICAgICAgICAgICAgXG4gICAgICAgIEBjZW50ZXJPZmZzZXQgPSAoQHN0YWdlSGVpZ2h0ICogLjY2NjcpXG4gICAgICAgIGlmIEBzY3JvbGw/XG4gICAgICAgICAgICBwb3MgPSBAc2Nyb2xsLnBvc2l0aW9uICAgICAgICAgICAgXG4gICAgICAgICAgICBAdG9nZ2xlVG91Y2hNb3ZlKClcbiAgICAgICAgICAgIGlmICFAaXNUYWJsZXRcbiAgICAgICAgICAgICAgICBAc2V0U2Nyb2xsVG9wKHBvcylcbiAgICAgICAgICAgIFxuXG4gICAgcmVzZXRUaW1lbGluZTogPT5cbiAgICAgICAgQHRpbWVsaW5lID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgICAgIEB0cmlnZ2VycyA9IFtdXG4gICAgICAgIEBwYXJhbGxheCA9IFtdXG5cbiAgICAgICAgJCgnW2RhdGEtY2xvdWRdJykuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgJGVsID0gJCh0KVxuICAgICAgICAgICAgJGNsb3Nlc3RDb250YWluZXIgPSAkZWwuY2xvc2VzdCgnW2RhdGEtY2xvdWQtY29udGFpbmVyXScpXG4gICAgICAgICAgICBpbml0UG9zID0gJGNsb3Nlc3RDb250YWluZXIuZGF0YSgpLmNsb3VkQ29udGFpbmVyLmluaXRQb3NcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjbG91ZEZ1bmN0aW9uID0gY2xvdWRzXG4gICAgICAgICAgICAgICAgJGVsOiRlbFxuXG4gICAgICAgICAgICBpZiBpbml0UG9zIFxuICAgICAgICAgICAgICAgIGNsb3VkRnVuY3Rpb24oaW5pdFBvcylcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIEBwYXJhbGxheC5wdXNoIGNsb3VkRnVuY3Rpb25cblxuICAgIHVwZGF0ZVRpbWVsaW5lOiA9PlxuICAgICAgICBcbiAgICAgICAgQGhlYWRlci5hbmltYXRlSGVhZGVyKEBzY3JvbGwuc2Nyb2xsVG9wKVxuXG4gICAgICAgIGZvciB0IGluIEB0cmlnZ2Vyc1xuICAgICAgICAgICAgaWYgQHNjcm9sbC5zY3JvbGxUb3AgPiB0Lm9mZnNldCAtIEBjZW50ZXJPZmZzZXRcbiAgICAgICAgICAgICAgICB0LmEucGxheSgpXG4gICAgICAgICAgICBlbHNlIGlmIEBzY3JvbGwuc2Nyb2xsVG9wICsgQHN0YWdlSGVpZ2h0IDwgdC5vZmZzZXRcbiAgICAgICAgICAgICAgICB0LmEucGF1c2VkKHRydWUpXG4gICAgICAgICAgICAgICAgdC5hLnNlZWsoMClcblxuXG4gICAgICAgIGZvciBwIGluIEBwYXJhbGxheFxuICAgICAgICAgICAgcChAc2Nyb2xsLnBvc2l0aW9uKVxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEFuaW1hdGlvbkJhc2VcbiIsImNsYXNzIFBsdWdpbkJhc2UgZXh0ZW5kcyBFdmVudEVtaXR0ZXJcblxuXG5cbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gICAgICAgIHN1cGVyKClcbiAgICAgICAgQCRlbCA9IGlmIG9wdHMuZWw/IHRoZW4gJCBvcHRzLmVsXG5cbiAgICAgICAgQGluaXRpYWxpemUob3B0cylcblxuXG5cblxuICAgIGluaXRpYWxpemU6IChvcHRzKSAtPlxuICAgICAgICBAYWRkRXZlbnRzKClcblxuICAgIGFkZEV2ZW50czogLT5cblxuXG5cbiAgICByZW1vdmVFdmVudHM6IC0+XG5cblxuICAgIGRlc3Ryb3k6IC0+XG4gICAgICAgIEByZW1vdmVFdmVudHMoKVxuXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGx1Z2luQmFzZVxuXG4iLCJcblNoYXJlciA9IHJlcXVpcmUgXCIuLi91dGlsL1NoYXJlci5jb2ZmZWVcIiBcblxuXG5jbGFzcyBWaWV3QmFzZSBleHRlbmRzIEV2ZW50RW1pdHRlclxuXG5cblxuXG5cbiAgICBjb25zdHJ1Y3RvcjogKGVsKSAtPlxuXG4gICAgICAgIEAkZWwgPSAkKGVsKVxuICAgICAgICBAaXNUYWJsZXQgPSAkKFwiaHRtbFwiKS5oYXNDbGFzcyhcInRhYmxldFwiKVxuICAgICAgICBAaXNQaG9uZSA9ICQoXCJodG1sXCIpLmhhc0NsYXNzKFwicGhvbmVcIilcbiAgICAgICAgQGNkblJvb3QgPSAkKCdib2R5JykuZGF0YSgnY2RuJykgb3IgXCIvXCJcbiAgICAgICAgJCh3aW5kb3cpLm9uIFwicmVzaXplLmFwcFwiICwgQG9uUmVzaXplXG5cbiAgICAgICAgQHN0YWdlSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgIEBzdGFnZVdpZHRoID0gJCh3aW5kb3cpLndpZHRoKClcbiAgICAgICAgQG1vdXNlWCA9IDBcbiAgICAgICAgQG1vdXNlWSA9IDBcblxuICAgICAgICAjQGRlbGVnYXRlRXZlbnRzKEBnZW5lcmF0ZUV2ZW50cygpKVxuICAgICAgICBAaW5pdGlhbGl6ZSgpXG5cblxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgIEBpbml0Q29tcG9uZW50cygpXG5cbiAgICBpbml0Q29tcG9uZW50czogLT5cblxuICAgIG9uUmVzaXplOiA9PlxuICAgICAgICBAc3RhZ2VIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KClcbiAgICAgICAgQHN0YWdlV2lkdGggPSAkKHdpbmRvdykud2lkdGgoKVxuXG5cbiAgICBnZW5lcmF0ZUV2ZW50czogLT5cbiAgICAgICAgcmV0dXJuIHt9XG5cblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3QmFzZVxuIiwiQmFzaWNPdmVybGF5ID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9CYXNpY092ZXJsYXkuY29mZmVlJ1xuU3ZnSW5qZWN0ID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9TdmdJbmplY3QuY29mZmVlJ1xuXG5cblxuaWYgd2luZG93LmNvbnNvbGUgaXMgdW5kZWZpbmVkIG9yIHdpbmRvdy5jb25zb2xlIGlzIG51bGxcbiAgd2luZG93LmNvbnNvbGUgPVxuICAgIGxvZzogLT5cbiAgICB3YXJuOiAtPlxuICAgIGZhdGFsOiAtPlxuXG5cblxuJChkb2N1bWVudCkucmVhZHkgLT5cbiAgICAjJCgnLnN2Zy1pbmplY3QnKS5zdmdJbmplY3QoKVxuICAgICNuZXcgU3ZnSW5qZWN0IFwiLnN2Zy1pbmplY3RcIlxuICAgIFxuICAgIGJhc2ljT3ZlcmxheXMgPSBuZXcgQmFzaWNPdmVybGF5XG4gICAgICAgIGVsOiAkKCcjY29udGVudCcpXG5cblxuICAgICQoJy5zY3JvbGx0bycpLmNsaWNrIC0+XG4gICAgICAgdCA9ICQodGhpcykuZGF0YSgndGFyZ2V0JylcbiAgICAgICAkKCdib2R5JykuYW5pbWF0ZSh7XG4gICAgICAgICAgICBzY3JvbGxUb3A6ICQoJyMnK3QpLm9mZnNldCgpLnRvcCAtIDcwICMgNzAgZm9yIHRoZSBjb2xsYXBzZWQgaGVhZGVyXG4gICAgICAgIH0pO1xuXG4gICAgI2lmIHdpbmRvdy5kZGxzP1xuICAgICMgY29uc29sZS5sb2cgJ2NsaWNreSdcbiAgICAkKHdpbmRvdykuY2xpY2sgLT5cbiAgICAgICAgaWYgd2luZG93LmRkbHM/XG4gICAgICAgICAgICAkLmVhY2ggd2luZG93LmRkbHMsIChpLCB0KSAtPlxuICAgICAgICAgICAgICAgIGlmIHQuaXNPcGVuIGFuZCBub3QgdC5pc0hvdmVyZWRcbiAgICAgICAgICAgICAgICAgICAgdC5jbG9zZU1lbnUoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICQoJ1tkYXRhLWRlcHRoXScpLmVhY2ggLT5cbiAgICAgICAgJGVsID0gJChAKVxuICAgICAgICBkZXB0aCA9ICRlbC5kYXRhKCkuZGVwdGhcbiAgICAgICAgXG4gICAgICAgICRlbC5jc3MoJ3otaW5kZXgnLCBkZXB0aClcbiAgICAgICAgVHdlZW5NYXguc2V0ICRlbCAsIFxuICAgICAgICAgICAgejogZGVwdGggKiAxMFxuXG5cblxuICAgICQoJ2JvZHknKS5vbiAnRE9NTm9kZUluc2VydGVkJywgIC0+XG4gICAgICAgICQoJ2EnKS5lYWNoIC0+ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaHJlZiA9ICQoQCkuYXR0cignaHJlZicpXG4gICAgICAgICAgICBpZiBocmVmP1xuICAgICAgICAgICAgICAgIGhyZWYgPSBocmVmLnRyaW0oKVxuICAgICAgICAgICAgICAgIGlmIGhyZWYuaW5kZXhPZignaHR0cDovLycpIGlzIDAgb3IgaHJlZi5pbmRleE9mKCdodHRwczovLycpIGlzIDAgb3IgaHJlZi5pbmRleE9mKCcucGRmJykgaXMgKGhyZWYubGVuZ3RoIC0gNClcbiAgICAgICAgICAgICAgICAgICAgJChAKS5hdHRyKCd0YXJnZXQnLCAnX2JsYW5rJylcblxuXG4gICAgJCgnLmNpcmNsZSwgLmNpcmNsZS1vdXRlcicpLm9uKCdtb3VzZWVudGVyJywgLT5cbiAgICAgICAgVHdlZW5NYXgudG8oJCh0aGlzKSwgLjM1LFxuICAgICAgICAgICAgc2NhbGU6IDEuMDUsXG4gICAgICAgICAgICBlYXNlOiBQb3dlcjIuZWFzZU91dFxuICAgICAgICApXG4gICAgKVxuXG4gICAgJCgnLmNpcmNsZSwgLmNpcmNsZS1vdXRlcicpLm9uKCdtb3VzZWxlYXZlJywgLT5cbiAgICAgICAgVHdlZW5NYXgudG8oJCh0aGlzKSwgLjM1LFxuICAgICAgICAgICAgc2NhbGU6IDEsXG4gICAgICAgICAgICBlYXNlOiBQb3dlcjIuZWFzZU91dFxuICAgICAgICApXG4gICAgKVxuXG4gICAgJCgnI2pvYnMtZ2FsbGVyeSAuc3dpcGVyLWNvbnRhaW5lciBsaScpLm9uKCdtb3VzZWVuZXRlcicsIC0+XG4gICAgICAgIGNvbnNvbGUubG9nICdoZWxsbydcbiAgICApXG5cblxuIyB0aGlzIGlzIHNoaXR0eSwgYnV0IGl0J3MgbXkgb25seSB3b3JrYXJvdW5kIGZvciB0aGUgY2xpcHBpbmcgaXNzdWUgKENGLTE3MSlcbmRvY3VtZW50Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9ICgpIC0+XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgaXMgJ2NvbXBsZXRlJylcbiAgICAgICAgc2V0VGltZW91dCgtPlxuICAgICAgICAgICAgJCgnLnF1b3RlJykuYWRkQ2xhc3MoJ2tlZXBpdGFodW5kcmVkJylcbiAgICAgICAgLCAyMDApXG4iLCJBbmltYXRpb25CYXNlID0gcmVxdWlyZSBcIi4uL2Fic3RyYWN0L0FuaW1hdGlvbkJhc2UuY29mZmVlXCJcblBhcmtzTGlzdCA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvUGFya3NMaXN0LmNvZmZlZSdcbkRyYWdnYWJsZUdhbGxlcnkgPSByZXF1aXJlICcuLi9wbHVnaW5zL0RyYWdnYWJsZUdhbGxlcnkuY29mZmVlJ1xuRmFkZUdhbGxlcnkgPSByZXF1aXJlICcuLi9wbHVnaW5zL0ZhZGVHYWxsZXJ5LmNvZmZlZSdcbkhlYWRlckFuaW1hdGlvbiA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvSGVhZGVyQW5pbWF0aW9uLmNvZmZlZSdcblJlc2l6ZUJ1dHRvbnMgPSByZXF1aXJlICcuLi9wbHVnaW5zL1Jlc2l6ZUJ1dHRvbnMuY29mZmVlJ1xuRnJhbWVBbmltYXRpb24gPSByZXF1aXJlICcuLi9wbHVnaW5zL2NvYXN0ZXJzL0ZyYW1lQW5pbWF0aW9uLmNvZmZlZSdcbmFuaW1hdGlvbnMgPSByZXF1aXJlICcuL2FuaW1hdGlvbnMvcGFydG5lcnNoaXBzLmNvZmZlZSdcbmdsb2JhbEFuaW1hdGlvbnMgPSByZXF1aXJlICcuL2FuaW1hdGlvbnMvZ2xvYmFsLmNvZmZlZSdcbkZvcm1IYW5kbGVyID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9Gb3JtSGFuZGxlci5jb2ZmZWUnXG4gICAgICAgIFxuXG5jbGFzcyBQYXJ0bmVyc2hpcFBhZ2UgZXh0ZW5kcyBBbmltYXRpb25CYXNlXG5cblxuICAgIGNvbnN0cnVjdG9yOiAoZWwpIC0+XG4gICAgICAgIEB0b3RhbEFuaW1hdGlvblRpbWUgPSAyNVxuICAgICAgICBzdXBlcihlbClcblxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgIHN1cGVyKClcblxuICAgIGluaXRDb21wb25lbnRzOiAtPlxuICAgICAgICBzdXBlcigpXG5cbiAgICAgICAgc3BvbnNvcnNoaXBGb3JtID0gbmV3IEZvcm1IYW5kbGVyXG4gICAgICAgICAgICBlbDogJyNwYXJ0bmVyc2hpcC1jb250YWN0LWZvcm0nXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgIUBpc1Bob25lXG5cbiAgICAgICAgICAgIGNvYXN0ZXIgPSBuZXcgRnJhbWVBbmltYXRpb25cbiAgICAgICAgICAgICAgICBpZDpcInNwb25zb3JzaGlwLWNvYXN0ZXItMVwiXG4gICAgICAgICAgICAgICAgZWw6XCIjc3BvbnNvcnNoaXAtc2VjdGlvbjFcIiBcbiAgICAgICAgICAgICAgICBiYXNlVXJsOiBcIiN7QGNkblJvb3R9Y29hc3RlcnMvXCJcbiAgICAgICAgICAgICAgICB1cmw6IFwic2hvdC0yL2RhdGEuanNvblwiXG5cbiAgICAgICAgICAgIGNvYXN0ZXIubG9hZEZyYW1lcygpXG5cbiMgICAgICAgICAgICBzcG9uc29yVHlwZXMgPSBuZXcgRHJhZ2dhYmxlR2FsbGVyeVxuIyAgICAgICAgICAgICAgICBlbDogXCIjdGVzdGltb25pYWxzXCJcbiMgICAgICAgICAgICAgICAgYWNyb3NzOiAzXG5cbiAgICAgICAgICAgIHJlc2l6ZWJ1dHRvbnMgPSBuZXcgUmVzaXplQnV0dG9uc1xuXG4gICAgICAgICAgICBudW1iZXJzID0gbmV3IERyYWdnYWJsZUdhbGxlcnlcbiAgICAgICAgICAgICAgICBlbDpcIiNzZWxlY3RcIlxuICAgICAgICAgICAgICAgIGFjcm9zczogMVxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNwb25zb3JUeXBlcyA9IG5ldyBEcmFnZ2FibGVHYWxsZXJ5XG4gICAgICAgICAgICAgICAgZWw6IFwiI3Rlc3RpbW9uaWFsc1wiXG4gICAgICAgICAgICAgICAgYWNyb3NzOiAxXG5cbiAgICAgICAgICAgIG51bWJlcnMgPSBuZXcgRHJhZ2dhYmxlR2FsbGVyeVxuICAgICAgICAgICAgICAgIGVsOlwiI3NlbGVjdCAjdGhyaWxsaW5nLW51bWJlcnMtd3JhcHBlclwiXG4gICAgICAgICAgICAgICAgYWNyb3NzOiAxXG5cblxuICAgICAgICB3aW5kb3cuZGRscyA9IFtdXG5cbiAgICAgICAgd2luZG93LmRkbHMucHVzaCAkKCcjUGFydG5lcnNoaXBUeXBlczEtc2VsZWN0JykuY2ZEcm9wZG93blxuICAgICAgICAgICAgb25TZWxlY3Q6ICh0KSAtPlxuICAgICAgICAgICAgICAgIGlkID0gJCh0KS5kYXRhKCdpZCcpXG5cbiAgICAgICAgd2luZG93LmRkbHMucHVzaCAkKCcjUGFydG5lcnNoaXBUeXBlczItc2VsZWN0JykuY2ZEcm9wZG93blxuICAgICAgICAgICAgb25TZWxlY3Q6ICh0KSAtPlxuICAgICAgICAgICAgICAgIGlkID0gJCh0KS5kYXRhKCdpZCcpXG5cbiAgICBcbiAgICByZXNldFRpbWVsaW5lOiA9PlxuICAgICAgICBzdXBlcigpXG5cbiAgICAgICAgQHBhcmFsbGF4LnB1c2ggZ2xvYmFsQW5pbWF0aW9ucy5jbG91ZHMoXCIjc2VjdGlvbjFcIiwgMCAsIDEsIGlmIEBpc1RhYmxldCB0aGVuIDEgZWxzZSA1KVxuXG5cbiAgICAgICAgaWYgIUBpc1Bob25lXG4gICAgICAgICAgICBAdHJpZ2dlcnMucHVzaCBhbmltYXRpb25zLnRvcEhlYWRsaW5lKClcbiAgICAgICAgICAgIEB0cmlnZ2Vycy5wdXNoIGFuaW1hdGlvbnMuc2Nyb2xsQ2lyY2xlKClcbiAgICAgICAgICAgIEB0cmlnZ2Vycy5wdXNoIGFuaW1hdGlvbnMuc2VsZWN0Qm94KClcbiAgICAgICAgICAgIEB0cmlnZ2Vycy5wdXNoIGFuaW1hdGlvbnMuczJUb3BIZWFkbGluZSgpXG4gICAgICAgICAgICBAdHJpZ2dlcnMucHVzaCBhbmltYXRpb25zLnRlc3RpbW9uaWFsQ2lyY2xlcygpXG4gICAgICAgIFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXJ0bmVyc2hpcFBhZ2VcblxuXG4iLCJcbmNsb3Vkc09uVXBkYXRlID0gKGVsLCBkdXJhdGlvbikgLT5cbiAgICB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgXG4gICAgVHdlZW5NYXguc2V0IGVsLFxuICAgICAgICB4OiAtMjA1MFxuICAgICAgICBcbiAgICBUd2Vlbk1heC50byBlbCwgZHVyYXRpb24gLCBcbiAgICAgICAgeDogd2luZG93V2lkdGhcbiAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgIGNsb3Vkc09uVXBkYXRlIGVsICwgZHVyYXRpb25cbiAgICAgICAgXG5cblxuc2V0Qm9iaW5nID0gKCRlbCAsIGR1cixkZWxheSkgLT5cbiAgICBcbiAgICBAaXNUYWJsZXQgPSAkKCdodG1sJykuaGFzQ2xhc3MgJ3RhYmxldCdcbiAgICB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgd2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIFxuICAgIGlmIHdpbmRvdy5pbm5lcldpZHRoID4gNzY3ICYmICFAaXNUYWJsZXRcblxuIyAgICAgICAgZCA9ICgod2luZG93LmlubmVyV2lkdGggKyAxNTUwKSAvIHdpbmRvdy5pbm5lcldpZHRoKSAqIDE4MFxuICAgICAgICBkID0gMzAwIC0gKCRlbC5kYXRhKCdjbG91ZCcpLnNwZWVkICogMjUwKVxuICAgICAgICBcbiAgICAgICAgVHdlZW5NYXgudG8gJGVsICwgZHVyICwgXG4gICAgICAgICAgICB4OiB3aWR0aFxuICAgICAgICAgICAgZGVsYXk6ZGVsYXlcbiAgICAgICAgICAgIGVhc2U6TGluZWFyLmVhc2VOb25lXG4gICAgICAgICAgICBvblVwZGF0ZVBhcmFtczogW1wie3NlbGZ9XCJdXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiAodHdlZW4pID0+XG4gICAgICAgICAgICAgICAgY2xvdWRzT25VcGRhdGUgJGVsICwgZFxuXG5cblxuc2V0UmVnaXN0cmF0aW9uID0gKCRlbCwgcmVnaXN0cmF0aW9uKSAtPlxuICAgIFxuICAgIHZhbHVlcyA9IHJlZ2lzdHJhdGlvbi5zcGxpdChcInxcIilcbiAgICBcbiAgICB2aWV3cG9ydFdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICBzZXR0aW5ncyA9IHt9XG4gICAgXG4gICAgYWxpZ24gPSB2YWx1ZXNbMF1cbiAgICBvZmZzZXQgPSBwYXJzZUludCh2YWx1ZXNbMV0pIG9yIDBcblxuICAgIHN3aXRjaCBhbGlnblxuICAgICAgICB3aGVuICdsZWZ0J1xuICAgICAgICAgICAgc2V0dGluZ3MueCA9IDAgKyBvZmZzZXRcbiAgICAgICAgd2hlbiAncmlnaHQnXG4gICAgICAgICAgICBzZXR0aW5ncy54ID0gdmlld3BvcnRXaWR0aCArIG9mZnNldCAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIHdoZW4gJ2NlbnRlcidcbiAgICAgICAgICAgIHNldHRpbmdzLnggPSAodmlld3BvcnRXaWR0aCouNSAtICRlbC53aWR0aCgpKi41KSArIG9mZnNldCAgICBcbiAgICBcbiAgICBUd2Vlbk1heC5zZXQgJGVsICwgc2V0dGluZ3NcbiAgICBcbiAgICBcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gKG9wdGlvbnMpIC0+XG4gICAgXG4gICAgJGVsID0gb3B0aW9ucy4kZWxcbiAgICAkY29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJ1tkYXRhLWNsb3VkLWNvbnRhaW5lcl0nKSAgICBcbiAgICBjb250YWluZXJUb3BQYWRkaW5nID0gcGFyc2VJbnQoJGNvbnRhaW5lci5jc3MoJ3BhZGRpbmctdG9wJykpXG4gICAgXG4gICAgXG4gICAgdHJ5ICAgICAgICBcbiAgICAgICAgY2xvdWREYXRhID0gJGVsLmRhdGEoKS5jbG91ZFxuICAgICAgIFxuICAgIGNhdGNoIGVcbiAgICAgICAgY29uc29sZS5lcnJvciBcIkNsb3VkIERhdGEgUGFyc2UgRXJyb3I6IEludmFsaWQgSlNPTlwiICAgICAgICBcbiAgICAgICAgXG4gICAgY2xvdWREZXB0aCA9ICRlbC5kYXRhKCdkZXB0aCcpXG4gICAgY2xvdWRTcGVlZCA9IGNsb3VkRGF0YS5zcGVlZCBvciAxXG4gICAgY2xvdWRPZmZzZXRNaW4gPSBwYXJzZUludChjbG91ZERhdGEub2Zmc2V0TWluKSBvciAwXG4gICAgY2xvdWRSZXZlcnNlID0gY2xvdWREYXRhLnJldmVyc2Ugb3IgZmFsc2VcbiAgICBjbG91ZFJlZ2lzdHJhdGlvbiA9IGNsb3VkRGF0YS5yZWdpc3RlciBvciBcImNlbnRlclwiXG5cblxuICAgIFxuICAgIHNldFJlZ2lzdHJhdGlvbiAkZWwgLCBjbG91ZFJlZ2lzdHJhdGlvblxuICAgIGlmICEoJGNvbnRhaW5lci5oYXNDbGFzcygnc3BsYXNoLWNvbnRhaW5lcicpKVxuICAgICAgICBvZmZMZWZ0ID0gJGVsLm9mZnNldCgpLmxlZnRcbiAgICAgICAgZGlzdGFuY2UgPSAod2luZG93LmlubmVyV2lkdGggLSBvZmZMZWZ0KSAvIHdpbmRvdy5pbm5lcldpZHRoXG4jICAgICAgICBwZXJjZW50YWdlID0gZGlzdGFuY2UgKiAxODAgXG4gICAgICAgIHBlcmNlbnRhZ2UgPSAyNTAgLSAoY2xvdWRTcGVlZCAqIDIwMClcbiAgICAgICAgXG4gICAgICAgIHNldEJvYmluZyAkZWwsIHBlcmNlbnRhZ2UsIGNsb3VkU3BlZWQvNVxuIFxuICAgIG1pblkgPSAkY29udGFpbmVyLm9mZnNldCgpLnRvcFxuICAgIG1heFkgPSAkKGRvY3VtZW50KS5vdXRlckhlaWdodCgpXG4gICAgdG90YWxSYW5nZT0gJGNvbnRhaW5lci5vdXRlckhlaWdodCgpXG4gICAgXG4gICAgXG4gICAgXG4gICAgcGVyY2VudGFnZVJhbmdlID0gdG90YWxSYW5nZS9tYXhZXG4gICAgbWluUmFuZ2VQZXJjZW50YWdlID0gbWluWS9tYXhZICAgIFxuICAgIG1heFJhbmdlUGVyY2VudGFnZSA9IG1pblJhbmdlUGVyY2VudGFnZSArIHBlcmNlbnRhZ2VSYW5nZVxuXG4jICAgIGNvbnNvbGUubG9nIG1pblJhbmdlUGVyY2VudGFnZSAsIG1heFJhbmdlUGVyY2VudGFnZVxuXG5cbiAgICBsYXN0U2Nyb2xsUGVyY2VudGFnZSA9IHByZXNlbnRTY3JvbGxQZXJjZW50YWdlID0gc2Nyb2xsRGVsdGEgPSAwXG5cbiAgICBpZiAoJGNvbnRhaW5lci5oYXNDbGFzcygnc3BsYXNoLWNvbnRhaW5lcicpICYmICQoJ2h0bWwnKS5oYXNDbGFzcygndGFibGV0JykpXG4gICAgICAgICRjb250YWluZXIuaGlkZSgpXG4gICAgICAgIFxuICAgIFxuICAgIHJldHVybiAocG9zKSAtPlxuICAgICAgICBpZiAoKCRjb250YWluZXIuaGFzQ2xhc3MoJ3NwbGFzaC1jb250YWluZXInKSkgJiYgKCQoJ2h0bWwnKS5oYXNDbGFzcygndGFibGV0JykpKVxuICAgICAgICAgICAgVHdlZW5NYXgudG8gJGVsICwgMC4yNSAsXG4gICAgICAgICAgICAgICAgZWFzZTpTaW5lLmVhc2VPdXRcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZSA9IChwb3MgLSBtaW5SYW5nZVBlcmNlbnRhZ2UpIC8gKG1heFJhbmdlUGVyY2VudGFnZSAtIG1pblJhbmdlUGVyY2VudGFnZSlcbiAgICAgICAgICAgIGlmIDAgPD0gY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2UgPD0gMVxuICAgICAgICAgICAgICAgIHByZXNlbnRTY3JvbGxQZXJjZW50YWdlID0gY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2VcbiAgICAgICAgICAgICAgICBpZiBjbG91ZFJldmVyc2UgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2UgPSAxIC0gY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjbG91ZFkgPSAodG90YWxSYW5nZSAqIGNsb3VkUG9zaXRpb25QZXJjZW50YWdlKSAqIGNsb3VkU3BlZWRcbiAgICAgICAgICAgICAgICBjbG91ZFkgPSBjbG91ZFkgLSBjb250YWluZXJUb3BQYWRkaW5nXG4gICAgICAgICAgICAgICAgY2xvdWRZID0gY2xvdWRZICsgY2xvdWRPZmZzZXRNaW5cbiAgICBcbiAgICAgICAgICAgICAgICAjTWF5YmUgdXNlIHRoaXM/XG4gICAgICAgICAgICAgICAgc2Nyb2xsRGVsdGEgPSBNYXRoLmFicyhsYXN0U2Nyb2xsUGVyY2VudGFnZSAtIHByZXNlbnRTY3JvbGxQZXJjZW50YWdlKSAqIDNcbiAgICBcbiAgICAgICAgICAgICAgICBsYXN0U2Nyb2xsUGVyY2VudGFnZSA9IHByZXNlbnRTY3JvbGxQZXJjZW50YWdlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvICRlbCAsIDAuMjUgLCBcbiAgICAgICAgICAgICAgICAgICAgeTpjbG91ZFlcbiAgICAgICAgICAgICAgICAgICAgZWFzZTpTaW5lLmVhc2VPdXRcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICBcbiIsIlxuXG4jQ291bnRcbmNvbW1hcyA9ICh4KSAtPlxuICB4LnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpXG5cblxubW9kdWxlLmV4cG9ydHMuY291bnQgPSAoZWwpIC0+XG4gICAgXG4gICAgXG4gICAgJGVsID0gJChlbClcbiAgICB0YXJnZXRWYWwgPSAkKGVsKS5odG1sKClcbiAgICBudW0gPSAkKGVsKS50ZXh0KCkuc3BsaXQoJywnKS5qb2luKCcnKVxuXG4gICAgc3RhcnQgPSBudW0gKiAuOTk5NVxuICAgIGNoYW5nZSA9IG51bSAqIC4wMDA1XG4gICAgXG4gICAgdGwgPSBuZXcgVGltZWxpbmVNYXhcbiAgICAgICAgb25TdGFydDogLT5cbiAgICAgICAgICAgICRlbC5odG1sKFwiNDJcIilcbiAgICAgICAgb25Db21wbGV0ZTogLT5cbiAgICAgICAgICAgICRlbC5odG1sKHRhcmdldFZhbClcbiAgICAgICAgICAgIFxuICAgIHR3ZWVucyA9IFtdXG5cbiAgICAgICAgXG5cbiAgICB0d2VlbnMucHVzaCBUd2Vlbk1heC5mcm9tVG8gJGVsICwgMC4yNSwgICAgICAgIFxuICAgICAgICBhdXRvQWxwaGE6MFxuICAgICAgICBpbW1lZGlhdGVSZW5kZXI6dHJ1ZVxuICAgICAgICBlYXNlOlF1aW50LmVhc2VPdXRcbiAgICAsXG4gICAgICAgIGF1dG9BbHBoYToxXG5cbiAgICB0d2VlbnMucHVzaCBUd2Vlbk1heC50byAkZWwgLCAxLjUsIFxuICAgICAgICBlYXNlOlF1aW50LmVhc2VPdXRcbiAgICAgICAgXG4gICAgICAgIG9uVXBkYXRlOiAtPlxuICAgICAgICAgICAgdmFsdWUgPSBwYXJzZUludChzdGFydCArIHBhcnNlSW50KGNoYW5nZSAqIEBwcm9ncmVzcygpKSlcbiAgICAgICAgICAgIHZhbHVlID0gY29tbWFzKHZhbHVlKVxuICAgICAgICAgICAgZWxzID0gdmFsdWUuc3BsaXQoJycpXG4gICAgICAgICAgICBodG1sID0gJydcbiAgICAgICAgICAgICQuZWFjaCBlbHMsIChuYW1lLCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBodG1sICs9IGlmICh2YWx1ZSBpcyAnLCcpIHRoZW4gJywnIGVsc2UgJzxzcGFuPicgKyB2YWx1ZSArICc8L3NwYW4+J1xuICAgICAgICAgICAgJGVsLmh0bWwoaHRtbClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgdGwuYWRkIHR3ZWVuc1xuICAgIFxuICAgIHRsXG5cbiNTY3JvbGxpbmdcblxuXG5cbnR3ZWVuUGFyYWxsYXggPSAocG9zLHR3ZWVuLG1pbixtYXgsZHVyKSAtPlxuXG5cblxuICAgIHBlcmNlbnQgPSAoKHBvcy1taW4pIC8gKG1heC1taW4pKSAqIDFcbiAgICBhbW91bnQgPSBwZXJjZW50ICogZHVyXG5cblxuXG4gICAgaWYgcG9zIDw9IG1heCBhbmQgcG9zID49IG1pblxuICAgICAgICAjY29uc29sZS5sb2cgcGVyY2VudCAsIHR3ZWVuLm5zLm5hbWUgLCBwb3NcbiAgICAgICAgaWYgTWF0aC5hYnMoYW1vdW50IC0gdHdlZW4udGltZSgpKSA+PSAuMDAxXG4gICAgICAgICAgICB0d2Vlbi50d2VlblRvICBhbW91bnQgLFxuICAgICAgICAgICAgICAgIG92ZXJ3cml0ZTpcInByZWV4aXN0aW5nXCIsXG4gICAgICAgICAgICAgICAgZWFzZTpRdWFkLmVhc2VPdXRcblxuXG5tb2R1bGUuZXhwb3J0cy5jbG91ZHMgPSAoc2V0SWQsIG1pbiwgbWF4LCBkdXIpIC0+XG5cbiAgICBtaW5Qb3MgPSBtaW5cbiAgICBtYXhQb3MgPSBtYXhcbiAgICBkdXJhdGlvbiA9IGR1clxuXG4gICAgJGVsID0gJChcIi5jbG91ZHMje3NldElkfVwiKVxuICAgIGNsb3VkcyA9ICRlbC5maW5kKFwiLmNsb3VkXCIpXG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuICAgIHR3ZWVuLm5zID0ge31cbiAgICB0d2Vlbi5ucy5uYW1lID0gc2V0SWRcblxuICAgIHR3ZWVucyA9IFtdXG4gICAgZm9yIGNsb3VkLGkgaW4gY2xvdWRzXG4gICAgICAgIG9mZnNldCA9IFwiKz0jezI1MCooaSsxKX1cIlxuXG5cbiAgICAgICAgdHdlZW5zLnB1c2ggVHdlZW5NYXgudG8gY2xvdWQgLCBkdXJhdGlvbiAsXG4gICAgICAgICAgICB5Om9mZnNldFxuXG5cblxuICAgIHR3ZWVuLmFkZCB0d2VlbnNcblxuXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICByZXR1cm4gKHBvcykgLT5cbiAgICAgICAgdHdlZW5QYXJhbGxheCBwb3MgLCB0d2VlbiAsIG1pblBvcywgbWF4UG9zLCBkdXJhdGlvblxuXG5tb2R1bGUuZXhwb3J0cy5zY3JvbGwgPSAobWluUG9zLCBtYXhQb3MsIGR1cmF0aW9uLCBlbGVtKSAtPlxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcbiAgICB0d2Vlbi5ucyA9IHt9XG4gICAgdHdlZW4ubnMubmFtZSA9IFwiLnNjcm9sbHRvXCJcbiAgICBcbiAgICB0d2VlbnMgPSBbXVxuICAgIHR3ZWVucy5wdXNoIFR3ZWVuTWF4LnRvIGVsZW0gLCBkdXJhdGlvbiAsIG9wYWNpdHk6MFxuICAgIFxuICAgIHR3ZWVuLmFkZCB0d2VlbnNcbiAgICBcbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICByZXR1cm4gKHBvcykgLT5cbiAgICAgICAgdHdlZW5QYXJhbGxheCBwb3MgLCB0d2VlbiAsIG1pblBvcywgbWF4UG9zLCBkdXJhdGlvblxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzLmFybXMgPSAobWluLCBtYXgsIGR1cikgLT5cblxuICAgIG1pblBvcyA9IG1pblxuICAgIG1heFBvcyA9IG1heFxuICAgIGR1cmF0aW9uID0gZHVyXG5cbiAgICBhcm0gPSAkKFwiLmFybXNcIilcblxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgdHdlZW4ubnMgPSB7fVxuICAgIHR3ZWVuLm5zLm5hbWUgPSBcIi5hcm1zXCJcblxuICAgIHR3ZWVucyA9IFtdXG4gICAgdHdlZW5zLnB1c2ggVHdlZW5NYXgudG8gYXJtICwgZHVyYXRpb24gLCB0b3A6MFxuXG5cblxuICAgIHR3ZWVuLmFkZCB0d2VlbnNcblxuXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICByZXR1cm4gKHBvcykgLT5cbiAgICAgICAgdHdlZW5QYXJhbGxheCBwb3MgLCB0d2VlbiAsIG1pblBvcywgbWF4UG9zLCBkdXJhdGlvblxuIiwiZ2xvYmFsID0gcmVxdWlyZSAnLi9nbG9iYWwuY29mZmVlJ1xuXG5cbm1vZHVsZS5leHBvcnRzLnRvcEhlYWRsaW5lID0gKCkgLT5cblxuICAgICRlbCA9ICQoJyNzcG9uc29yc2hpcHMnKVxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLmZpbmQoJy50b3AtaGVhZGxpbmUgLnRpdGxlLWJ1Y2tldCBoMScpLCAuMzUsXG4gICAgICAgIHk6IC0xMFxuICAgICAgICAsYWxwaGE6IDBcbiAgICAsXG4gICAgICAgIHk6IDBcbiAgICAgICAgLGFscGhhOiAxXG4gICAgKSwgMC41XG5cbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbC5maW5kKCcudG9wLWhlYWRsaW5lIC50aXRsZS1idWNrZXQgaDInKSwgLjM1LFxuICAgICAgICB5OiAtMTBcbiAgICAgICAgLGFscGhhOiAwXG4gICAgLFxuICAgICAgICB5OiAwXG4gICAgICAgICxhbHBoYTogMVxuICAgICksIFwiLT0uM1wiXG5cbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbC5maW5kKCcudG9wLWhlYWRsaW5lIC50aXRsZS1idWNrZXQgcCcpLCAuMzUsXG4gICAgICAgIHk6IC0xMFxuICAgICAgICAsYWxwaGE6IDBcbiAgICAsXG4gICAgICAgIHk6IDBcbiAgICAgICAgLGFscGhhOiAxXG4gICAgKSwgXCItPS4zXCJcblxuXG5cbiAgICBhOiB0d2VlblxuICAgIG9mZnNldDokZWwub2Zmc2V0KCkudG9wXG5cblxubW9kdWxlLmV4cG9ydHMuc2Nyb2xsQ2lyY2xlID0gLT5cbiAgICAkZWwgPSAkKFwiI3Nwb25zb3JzaGlwcyAuY2lyYy1idG4td3JhcHBlclwiKVxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLmZpbmQoXCJwXCIpICwgLjMgLFxuICAgICAgICBhdXRvQWxwaGE6MFxuICAgICxcbiAgICAgICAgYXV0b0FscGhhOjFcbiAgICApXG5cbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbC5maW5kKFwiYVwiKSAsIC40NSAsXG4gICAgICAgIHNjYWxlOjBcbiAgICAgICAgcm90YXRpb246MTgwXG4gICAgICAgIGltbWVkaWF0ZVJlbmRlcjp0cnVlXG4gICAgLFxuICAgICAgICBzY2FsZToxXG4gICAgICAgIHJvdGF0aW9uOjBcbiAgICAgICAgZWFzZTpCYWNrLmVhc2VPdXRcbiAgICApICwgXCItPS4yXCJcblxuICAgIGE6IHR3ZWVuXG4gICAgb2Zmc2V0OiRlbC5vZmZzZXQoKS50b3BcblxuXG5tb2R1bGUuZXhwb3J0cy5zZWxlY3RCb3ggPSAoKSAtPlxuICAgICRlbCA9ICQoJyNzcG9uc29yc2hpcHMgI3NlbGVjdCcpXG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwsIC4zNSxcbiAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAsc2NhbGU6IC43NVxuICAgICxcbiAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAsc2NhbGU6IDFcbiAgICApLCAwLjVcblxuICAgIHR3ZWVuLnBhdXNlZCh0cnVlKVxuICAgIGE6dHdlZW5cbiAgICBvZmZzZXQ6JGVsLm9mZnNldCgpLnRvcFxuXG5cbm1vZHVsZS5leHBvcnRzLnMyVG9wSGVhZGxpbmUgPSAoKSAtPlxuICAgICRlbCA9ICQoJyN0ZXN0aW1vbmlhbHMnKVxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLmZpbmQoJy50aXRsZS1idWNrZXQgaDEnKSwgLjM1LFxuICAgICAgICB5OiAtMTBcbiAgICAgICAgYWxwaGE6IDBcbiAgICAsXG4gICAgICAgIHk6IDBcbiAgICAgICAgYWxwaGE6IDFcbiAgICApXG5cbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbC5maW5kKCcudGl0bGUtYnVja2V0IGgyJyksIC4zNSxcbiAgICAgICAgeTogLTEwXG4gICAgICAgIGFscGhhOiAwXG4gICAgLFxuICAgICAgICB5OiAwXG4gICAgICAgIGFscGhhOiAxXG4gICAgKSwgXCItPS4zXCJcblxuICAgIHR3ZWVuLnBhdXNlZCh0cnVlKVxuICAgIGE6dHdlZW5cbiAgICBvZmZzZXQ6JGVsLm9mZnNldCgpLnRvcFxuICAgIFxuICAgIFxuXG5tb2R1bGUuZXhwb3J0cy50ZXN0aW1vbmlhbENpcmNsZXMgPSAoKSAtPiBcblxuICAgICRlbCA9ICQoJyN0ZXN0aW1vbmlhbHMnKVxuICAgIFxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgXG4gICAgZm9yIHNsaWRlLGkgaW4gJGVsLmZpbmQoJy5zd2lwZXItY29udGFpbmVyIC5zd2lwZXItc2xpZGUnKVxuICAgICAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCQoc2xpZGUpLmZpbmQoJy5jaXJjbGUnKSwgLjM1LFxuICAgICAgICAgICAgcm90YXRpb246IC05MFxuICAgICAgICAgICAgYWxwaGE6IDBcbiAgICAgICAgICAgIHNjYWxlOiAwXG4gICAgICAgICxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgICAgICBhbHBoYTogMVxuICAgICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgICAgIGVhc2U6QmFjay5lYXNlT3V0XG4gICAgICAgICxcbiAgICAgICAgICAgIC4wNVxuICAgICAgICApLCAoaSouMTUpIFxuXG4gICAgICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJChzbGlkZSkuZmluZCgnYS5idG4nKSwgLjI1LFxuICAgICAgICAgICAgc2NhbGU6IDAuNVxuICAgICAgICAgICAgYWxwaGE6IDBcbiAgICAgICAgLFxuICAgICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgICAgIGFscGhhOiAxXG4gICAgICAgICksIDAuMTUgKyAoaSouMilcblxuXG4gICAgdHdlZW4ucGF1c2VkKHRydWUpXG4gICAgYTp0d2VlblxuICAgIG9mZnNldDokZWwub2Zmc2V0KCkudG9wXG4iLCJQbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIEJhc2ljT3ZlcmxheSBleHRlbmRzIFBsdWdpbkJhc2VcbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gICAgICAgIHN1cGVyKG9wdHMpXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICAjIEAkZWwgPSAkKGVsKVxuICAgICAgICBAb3ZlcmxheVRyaWdnZXJzID0gJCgnLm92ZXJsYXktdHJpZ2dlcicpXG4gICAgICAgIEBhZGRFdmVudHMoKVxuXG4gICAgICAgIHN1cGVyKClcblxuICAgIFxuICAgIGFkZEV2ZW50czogLT5cblxuICAgICAgICAkKCcjYmFzaWMtb3ZlcmxheSwgI292ZXJsYXktYmFzaWMtaW5uZXIgLm92ZXJsYXktY2xvc2UnKS5jbGljayhAY2xvc2VPdmVybGF5KTtcbiAgICAgICAgQG92ZXJsYXlUcmlnZ2Vycy5lYWNoIChpLHQpID0+XG4gICAgICAgICAgICAkKHQpLm9uICdjbGljaycsIEBvcGVuT3ZlcmxheVxuXG4gICAgICAgICNnbG9iYWwgYnV5IHRpY2tldHMgbGlua3NcblxuICAgICAgICAkKCcub3ZlcmxheS1jb250ZW50Jykub24gJ2NsaWNrJywgJ2xpJyAsQG9wZW5MaW5rXG4jICAgICAgICAkKHdpbmRvdykub24gJ3Jlc2l6ZScsIEBjbG9zZU92ZXJsYXlcbiAgICAgICAgXG4gICAgb3Blbkxpbms6IChlKSA9PlxuICAgICAgICB0YXJnZXQgPSAkKGUudGFyZ2V0KS5wYXJlbnRzICcucGFyaydcbiAgICAgICAgaWYgdGFyZ2V0LmRhdGEoJ3RhcmdldCcpXG4gICAgICAgICAgICB3aW5kb3cub3Blbih0YXJnZXQuZGF0YSgndGFyZ2V0JykpXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBcbiAgICBjbG9zZU92ZXJsYXk6IChlKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgISAoKGUudHlwZSBpcyAncmVzaXplJykgYW5kICgkKCcjb3ZlcmxheSB2aWRlbzp2aXNpYmxlJykuc2l6ZSgpID4gMCkpXG4gICAgICAgICAgICAkKCcub3ZlcmxheS1iYXNpYycpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICAgIH0sICgpIC0+IFxuICAgICAgICAgICAgICAgICQoJy5vdmVybGF5LWJhc2ljJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgJCgnI292ZXJsYXknKS5oaWRlKClcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIG9wZW5PdmVybGF5OiAodCkgLT5cbiAgICAgICAgJGVsID0gJCh0aGlzKVxuICAgICAgICBvdmVybGF5U291cmNlID0gJGVsLmRhdGEoJ3NvdXJjZScpXG4gICAgICAgICR0YXJnZXRFbGVtZW50ID0gJCgnI292ZXJsYXktYmFzaWMtaW5uZXIgLm92ZXJsYXktY29udGVudCcpXG4gICAgICAgIGlzTmV3cyA9ICRlbC5oYXNDbGFzcygnbmV3cycpXG5cbiAgICAgICAgJCgnI292ZXJsYXknKS5zaG93KClcbiAgICAgICAgXG4gICAgICAgIGlmICRlbC5oYXNDbGFzcyAnb2ZmZXJpbmdzLW9wdGlvbidcbiAgICAgICAgICAgIG9jID0gJCgnI29mZmVyaW5ncy1vdmVybGF5LWNvbnRlbnQnKVxuICAgICAgICAgICAgb2MuZmluZCgnaDEudGl0bGUnKS50ZXh0KCRlbC5maW5kKCdzcGFuLm9mZmVyJykudGV4dCgpKVxuICAgICAgICAgICAgb2MuZmluZCgnZGl2LmRlc2NyaXB0aW9uJykuaHRtbCgkZWwuZmluZCgnZGl2LmRlc2NyaXB0aW9uJykuaHRtbCgpKVxuICAgICAgICAgICAgb2MuZmluZCgnLmNvbnRlbnQubWVkaWEnKS5jc3Moe2JhY2tncm91bmRJbWFnZTogXCJ1cmwoJ1wiICsgJGVsLmZpbmQoJ3NwYW4ubWVkaWEnKS5kYXRhKCdzb3VyY2UnKSArIFwiJylcIn0pXG5cbiAgICAgICAgXG4gICAgICAgIGlmICgkKCcjJyArIG92ZXJsYXlTb3VyY2UpLnNpemUoKSBpcyAxKSBcbiAgICAgICAgICAgICNodG1sID0gJCgnIycgKyBvdmVybGF5U291cmNlKS5odG1sKClcblxuICAgICAgICAgICAgJHRhcmdldEVsZW1lbnQuY2hpbGRyZW4oKS5lYWNoIChpLHQpID0+XG4gICAgICAgICAgICAgICAgJCh0KS5hcHBlbmRUbygnI292ZXJsYXktY29udGVudC1zb3VyY2VzJylcblxuICAgICAgICAgICAgaWYgaXNOZXdzXG4gICAgICAgICAgICAgICAgYyA9ICRlbC5uZXh0KCcuYXJ0aWNsZScpLmNsb25lKClcbiAgICAgICAgICAgICAgICAkKCcjb3ZlcmxheV9jb250ZW50JykuaHRtbChjLmh0bWwoKSlcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICQoJyMnICsgb3ZlcmxheVNvdXJjZSkuYXBwZW5kVG8oJHRhcmdldEVsZW1lbnQpXG5cbiAgICAgICAgICAgICRlbCA9ICQoJyNvdmVybGF5LWJhc2ljLWlubmVyJylcbiAgICAgICAgICAgIGlzU21hbGwgPSAkZWwuaGVpZ2h0KCkgPCAkKHdpbmRvdykuaGVpZ2h0KCkgYW5kICQoJHRhcmdldEVsZW1lbnQpLmZpbmQoJy5zZWxlY3QtYm94LXdyYXBwZXInKS5zaXplKCkgaXMgMFxuICAgICAgICAgICAgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpXG4gICAgICAgICAgICBhZGR0b3AgPSBpZiBpc1NtYWxsIHRoZW4gMCBlbHNlIHNjcm9sbFRvcDtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gJGVsLmNzcyAncG9zaXRpb24nLCBpZiBpc1NtYWxsIHRoZW4gJ2ZpeGVkJyBlbHNlICdhYnNvbHV0ZSdcbiAgICAgICAgICAgIHRvcCA9IE1hdGgubWF4KDAsICgoJCh3aW5kb3cpLmhlaWdodCgpIC0gJGVsLm91dGVySGVpZ2h0KCkpIC8gMikgKyBhZGR0b3ApXG4gICAgICAgICAgICBpZiAhaXNTbWFsbCBhbmQgKHRvcCA8IHNjcm9sbFRvcCkgdGhlbiB0b3AgPSBzY3JvbGxUb3BcbiAgICAgICAgICAgICRlbC5jc3MoXCJ0b3BcIiwgdG9wICsgXCJweFwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBoZWlnaHQ6XG4gICAgICAgICAgICAjJGVsLmNzcyhcImxlZnRcIiwgTWF0aC5tYXgoMCwgKCgkKHdpbmRvdykud2lkdGgoKSAtICRlbC5vdXRlcldpZHRoKCkpIC8gMikgKyBhZGRsZWZ0KSArIFwicHhcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQoJy5vdmVybGF5LWJhc2ljJykuY3NzKCdvcGFjaXR5JywgMCkuZGVsYXkoMCkuc2hvdygpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgICAgIH0pXG5cblxubW9kdWxlLmV4cG9ydHMgPSBCYXNpY092ZXJsYXlcblxuXG5cblxuXG5cbiIsIlxuUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuVmlld0Jhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9WaWV3QmFzZS5jb2ZmZWUnXG5cbmNsYXNzIERyYWdnYWJsZUdhbGxlcnkgZXh0ZW5kcyBQbHVnaW5CYXNlXG5cbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gICAgICAgIHN1cGVyKG9wdHMpXG5cblxuICAgIGluaXRpYWxpemU6IChvcHRzKSAtPlxuXG4gICAgICAgIEBnYWxsZXJ5ID0gQCRlbC5maW5kIFwiLnN3aXBlci1jb250YWluZXJcIlxuXG4gICAgICAgIGlmKEBnYWxsZXJ5Lmxlbmd0aCA8IDEpXG4gICAgICAgICAgICBAZ2FsbGVyeSA9IEAkZWwuZmlsdGVyIFwiLnN3aXBlci1jb250YWluZXJcIlxuICAgICAgICAgICAgXG4gICAgICAgIGlmIG9wdHMucGFnZSA9PSAnam9icydcbiAgICAgICAgICAgIEBqb2JzUGFnZSA9IHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGpvYnNQYWdlID0gZmFsc2VcblxuICAgICAgICBAZ2FsbGVyeUNyZWF0ZWQgPSBmYWxzZVxuICAgICAgICBAZ2FsbGVyeUNvbnRhaW5lciA9IEBnYWxsZXJ5LmZpbmQoJ3VsJylcbiAgICAgICAgQGdhbGxlcnlJdGVtcyA9IEBnYWxsZXJ5Q29udGFpbmVyLmZpbmQoJ2xpJylcbiAgICAgICAgQGN1cnJlbnRJbmRleCA9IEBnYWxsZXJ5SXRlbXMuZmlsdGVyKCcuc2VsZWN0ZWQnKS5kYXRhKCdpbmRleCcpXG4gICAgICAgIEBhY3Jvc3MgPSBvcHRzLmFjcm9zcyBvciAxXG4gICAgICAgIEBhbmdsZUxlZnQgPSBAZ2FsbGVyeS5maW5kICcuZmEtYW5nbGUtbGVmdCdcbiAgICAgICAgQGFuZ2xlUmlnaHQgPSBAZ2FsbGVyeS5maW5kICcuZmEtYW5nbGUtcmlnaHQnXG4gICAgICAgIEBwYWdpbmF0aW9uID0gb3B0cy5wYWdpbmF0aW9uIG9yIGZhbHNlXG4gICAgICAgIEBjb250cm9scyA9IG9wdHMuY29udHJvbCBvciBudWxsXG4gICAgICAgIEBqb2JzQ2Fyb3VzZWxTdG9wcGVkID0gZmFsc2VcbiAgICAgICAgQGpvYnNDYXJvdXNlbFBhdXNlZCA9IGZhbHNlXG4gICAgICAgIEBqb2JzSW50ZXJ2YWwgPSBudWxsXG5cbiAgICAgICAgQHNpemVDb250YWluZXIoKVxuXG4gICAgICAgIEBhZGRBcnJvd3MoKVxuXG4gICAgICAgIHN1cGVyKClcblxuICAgIGFkZEV2ZW50czogLT5cbiAgICAgICAgJCh3aW5kb3cpLm9uICdyZXNpemUnICwgQHNpemVDb250YWluZXJcblxuICAgICAgICAkKEAkZWwpLm9uICdjbGljaycsICcuZmEtYW5nbGUtbGVmdCcsIEBwcmV2U2xpZGVcbiAgICAgICAgJChAJGVsKS5vbiAnY2xpY2snLCAnLmZhLWFuZ2xlLXJpZ2h0JywgQG5leHRTbGlkZVxuICAgICAgICBpZiBAam9ic1BhZ2UgPT0gdHJ1ZVxuICAgICAgICAgICAgJChAJGVsKS5vbiAnY2xpY2snLCAnLnN3aXBlci1jb250YWluZXInLCBAc3RvcEpvYnNDYXJvdXNlbFxuICAgICAgICAgICAgJChAJGVsKS5vbiAnbW91c2VvdmVyJywgJy5zd2lwZXItY29udGFpbmVyJywgQHBhdXNlSm9ic0Nhcm91c2VsXG4gICAgICAgICAgICAkKEAkZWwpLm9uICdtb3VzZWxlYXZlJywgJy5zd2lwZXItY29udGFpbmVyJywgQHJlc3VtZUpvYnNDYXJvdXNlbFxuICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIHN0b3BKb2JzQ2Fyb3VzZWw6ID0+XG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBqb2JzSW50ZXJ2YWwpXG4gICAgICAgIEBqb2JzQ2Fyb3VzZWxTdG9wcGVkID0gdHJ1ZVxuXG4gICAgcGF1c2VKb2JzQ2Fyb3VzZWw6ID0+XG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBqb2JzSW50ZXJ2YWwpXG4gICAgICAgIEBqb2JzQ2Fyb3VzZWxQYXVzZWQgPSB0cnVlXG5cbiAgICByZXN1bWVKb2JzQ2Fyb3VzZWw6ID0+XG4gICAgICAgIGlmIEBqb2JzQ2Fyb3VzZWxTdG9wcGVkID09IGZhbHNlXG4gICAgICAgICAgICBAam9ic0ludGVydmFsID0gc2V0SW50ZXJ2YWwgKC0+XG4gICAgICAgICAgICAgICAgJCgnI2pvYnMtZ2FsbGVyeSAuZmEtYW5nbGUtcmlnaHQnKS50cmlnZ2VyKCdjbGljaycpXG4gICAgICAgICAgICApLCA4MDAwXG4gICAgICAgICAgICBAam9ic0Nhcm91c2VsUGF1c2VkID0gZmFsc2VcblxuICAgIHByZXZTbGlkZTogKGUpID0+XG4gICAgICAgIHRoYXQgPSBAbXlTd2lwZXJcbiAgICAgICAgZ2FsID0gQGdhbGxlcnlcbiAgICAgICAgXG4gICAgICAgIFR3ZWVuTWF4LnRvKCQoZ2FsKSwgLjIsIFxuICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAgICAgc2NhbGU6IDEuMVxuICAgICAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgICAgICB0aGF0LnN3aXBlUHJldigpXG4gICAgICAgICAgICAgICAgVHdlZW5NYXguc2V0KCQoZ2FsKSxcbiAgICAgICAgICAgICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgVHdlZW5NYXgudG8oJChnYWwpLCAuMzUsIFxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5OiAuMzVcbiAgICAgICAgICAgICAgICApXG4gICAgICAgIClcbiAgICBcbiAgICBuZXh0U2xpZGU6IChlKSA9PlxuICAgICAgICB0aGF0ID0gQG15U3dpcGVyXG4gICAgICAgIGdhbCA9IEBnYWxsZXJ5XG5cbiAgICAgICAgVHdlZW5NYXgudG8oJChnYWwpLCAuMixcbiAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICAgIHNjYWxlOiAxLjFcbiAgICAgICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICAgICAgdGhhdC5zd2lwZU5leHQoKVxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnNldCgkKGdhbCksXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlOiAwLjg1XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvKCQoZ2FsKSwgLjM1LFxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlOiAxXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5OiAuMzVcbiAgICAgICAgICAgICAgICApXG4gICAgICAgIClcblxuXG4gICAgYWRkQXJyb3dzOiAtPlxuICAgICAgICBAaXNQaG9uZSA9ICQoXCJodG1sXCIpLmhhc0NsYXNzKFwicGhvbmVcIilcblxuICAgICAgICBhcnJvd0xlZnQgPSAkKFwiPGkgY2xhc3M9J2dhbC1hcnJvdyBmYSBmYS1hbmdsZS1sZWZ0Jz48L2k+XCIpXG4gICAgICAgIGFycm93UmlnaHQgPSAkKFwiPGkgY2xhc3M9J2dhbC1hcnJvdyBmYSBmYS1hbmdsZS1yaWdodCc+PC9pPlwiKVxuXG4gICAgICAgIEAkZWwuYXBwZW5kKGFycm93TGVmdCwgYXJyb3dSaWdodClcblxuICAgICAgICAkKCcuZ2FsLWFycm93Jykub24gJ2NsaWNrJywgLT5cbiAgICAgICAgICAgICQoQCkuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgIHRoYXQgPSAkKEApXG4gICAgICAgICAgICBzZXRUaW1lb3V0IC0+XG4gICAgICAgICAgICAgICAgJCh0aGF0KS5yZW1vdmVDbGFzcyAnYWN0aXZlJywgMTAwXG4gICAgICAgICAgICBcblxuICAgIHNpemVDb250YWluZXI6ICgpID0+XG4gICAgICAgIEBnYWxsZXJ5Q29udGFpbmVyLmNzcygnd2lkdGgnLCBcIjEwMCVcIilcbiAgICAgICAgaWYgQGFjcm9zcyA8IDJcbiAgICAgICAgICAgIEBnYWxsZXJ5SXRlbXMuY3NzKCd3aWR0aCcgLCBcIjEwMCVcIilcbiAgICAgICAgZWxzZSBpZiBAYWNyb3NzIDwgM1xuICAgICAgICAgICAgQGdhbGxlcnlJdGVtcy5jc3MoJ3dpZHRoJyAsIFwiNTAlXCIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBnYWxsZXJ5SXRlbXMuY3NzKCd3aWR0aCcgLCBcIjMzLjMzMzMzMyVcIilcblxuICAgICAgICBAaXRlbVdpZHRoID0gQGdhbGxlcnlJdGVtcy5maXJzdCgpLm91dGVyV2lkdGgoKVxuICAgICAgICBpdGVtTGVuZ3RoID0gQGdhbGxlcnlJdGVtcy5sZW5ndGhcblxuICAgICAgICBAZ2FsbGVyeUl0ZW1zLmNzcygnd2lkdGgnLCBAaXRlbVdpZHRoKVxuICAgICAgICBAZ2FsbGVyeUNvbnRhaW5lci5jc3MoJ3dpZHRoJywgaXRlbUxlbmd0aCAqIChAaXRlbVdpZHRoKSlcbiAgICAgICAgVHdlZW5NYXguc2V0IEBnYWxsZXJ5Q29udGFpbmVyICxcbiAgICAgICAgICAgIHg6IC1AY3VycmVudEluZGV4ICogQGl0ZW1XaWR0aFxuICAgICAgICBcbiAgICAgICAgaWYgIUBnYWxsZXJ5Q3JlYXRlZCAgICBcbiAgICAgICAgICAgIEBjcmVhdGVEcmFnZ2FibGUoKVxuIyAgICAgICAgICAgIEBteVN3aXBlci5zd2lwZU5leHQoKVxuICAgICAgICBcbiAgICBjcmVhdGVEcmFnZ2FibGU6ICgpIC0+XG4gICAgICAgIGl0ZW1MZW5ndGggPSBAZ2FsbGVyeUl0ZW1zLmxlbmd0aFxuXG4gICAgICAgIGlmIEBzY3JvbGwgdGhlbiBAc2Nyb2xsLmtpbGwoKVxuXG4gICAgICAgIGlkID0gJChALiRlbCkuYXR0ciAnaWQnXG5cblxuICAgICAgICBpZiBAcGFnaW5hdGlvblxuICAgICAgICAgICAgQGFkZFBhZ2luYXRpb24oKVxuXG4gICAgICAgIGlmIEBhY3Jvc3MgPCAzXG4gICAgICAgICAgICBpZiBAcGFnaW5hdGlvblxuICAgICAgICAgICAgICAgIEBteVN3aXBlciA9IG5ldyBTd2lwZXIoJyMnICsgaWQgKyAnIC5zd2lwZXItY29udGFpbmVyJyx7XG4gICAgICAgICAgICAgICAgICAgIGxvb3A6dHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZ3JhYkN1cnNvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogQGFjcm9zcyxcbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvbjogJyMnICsgaWQgKyAnIC5zd2lwZXItcGFnaW5hdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Bc1JhbmdlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBvblRvdWNoU3RhcnQ6IEBvblNsaWRlQ2hhbmdlU3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIG9uVG91Y2hFbmQ6IEBvblNsaWRlQ2hhbmdlRW5kLFxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlU3RhcnQ6IEBvblNsaWRlQ2hhbmdlU3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIG9uU2xpZGVDaGFuZ2VFbmQ6IEBvblNsaWRlQ2hhbmdlRW5kLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZXNQZXJHcm91cDogQGFjcm9zc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQG15U3dpcGVyID0gbmV3IFN3aXBlcignIycgKyBpZCArICcgLnN3aXBlci1jb250YWluZXInLHtcbiAgICAgICAgICAgICAgICAgICAgbG9vcDp0cnVlLFxuICAgICAgICAgICAgICAgICAgICBncmFiQ3Vyc29yOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiBAYWNyb3NzLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZXNQZXJHcm91cDogQGFjcm9zc1xuICAgICAgICAgICAgICAgICAgICBvblRvdWNoU3RhcnQ6IEBvblNsaWRlQ2hhbmdlU3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIG9uVG91Y2hFbmQ6IEBvblNsaWRlQ2hhbmdlRW5kLFxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlU3RhcnQ6IEBvblNsaWRlQ2hhbmdlU3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIG9uU2xpZGVDaGFuZ2VFbmQ6IEBvblNsaWRlQ2hhbmdlRW5kLFxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG15U3dpcGVyID0gbmV3IFN3aXBlcignIycgKyBpZCArICcgLnN3aXBlci1jb250YWluZXInLHtcbiAgICAgICAgICAgICAgICBsb29wOnRydWUsXG4gICAgICAgICAgICAgICAgZ3JhYkN1cnNvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxuICAgICAgICAgICAgICAgIHNsaWRlc1Blckdyb3VwOiAzXG4gICAgICAgICAgICAgICAgb25Ub3VjaFN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgIG9uVG91Y2hFbmQ6IEBvblNsaWRlQ2hhbmdlRW5kLFxuICAgICAgICAgICAgICAgIG9uU2xpZGVDaGFuZ2VTdGFydDogQG9uU2xpZGVDaGFuZ2VTdGFydCxcbiAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcbiAgICAgICAgQGdhbGxlcnlDcmVhdGVkID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgaWYgQGpvYnNQYWdlID09IHRydWVcbiAgICAgICAgICAgIEBqb2JzSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCAoLT5cbiAgICAgICAgICAgICAgICAkKCcjam9icy1nYWxsZXJ5IC5mYS1hbmdsZS1yaWdodCcpLnRyaWdnZXIoJ2NsaWNrJylcbiAgICAgICAgICAgICksIDgwMDBcblxuICAgICAgICBcbiAgICBvblNsaWRlQ2hhbmdlU3RhcnQ6ID0+XG4gICAgICAgICQoQC4kZWwpLmNsb3Nlc3QoJy5hZGQtYm9yZGVyLWZhZGUnKS5hZGRDbGFzcyAnc2hvd2luZydcbiAgICAgICAgJChALiRlbCkuZmluZCgnLmFkZC1ib3JkZXItZmFkZScpLmFkZENsYXNzICdzaG93aW5nJ1xuXG4gICAgb25TbGlkZUNoYW5nZUVuZDogPT5cbiAgICAgICAgJChALiRlbCkuY2xvc2VzdCgnLmFkZC1ib3JkZXItZmFkZScpLnJlbW92ZUNsYXNzICdzaG93aW5nJ1xuICAgICAgICAkKEAuJGVsKS5maW5kKCcuYWRkLWJvcmRlci1mYWRlJykucmVtb3ZlQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgIFxuICAgICAgICBpZiAhKEBjb250cm9scyA9PSBudWxsKVxuICAgICAgICAgICAgcGFyayA9IEBteVN3aXBlci5hY3RpdmVTbGlkZSgpLmRhdGEoJ2lkJylcbiAgICAgICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IC5zd2lwZXItY29udGFpbmVyJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IC5jYXJvdXNlbC13cmFwcGVyJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IGRpdiMnICsgcGFyaykuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IGRpdiMnICsgcGFyaykucGFyZW50KCkuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgIFxuICAgICAgICBpZiAoQHBhcmtMaXN0KVxuICAgICAgICAgICAgQHBhcmtMaXN0LnNlbGVjdExvZ28gJChALiRlbCkuZmluZCgnLnN3aXBlci1zbGlkZS1hY3RpdmUnKS5kYXRhKCdpZCcpO1xuXG4gICAgYWRkUGFnaW5hdGlvbjogPT5cbiAgICAgICAgd3JhcHBlciA9ICQoXCI8ZGl2IGNsYXNzPSdzd2lwZXItcGFnaW5hdGlvbic+PC9kaXY+XCIpXG4gICAgICAgICQoQC4kZWwpLmZpbmQoJy5zd2lwZXItY29udGFpbmVyJykuYWRkQ2xhc3MoJ2FkZFBhZ2luYXRpb24nKS5hcHBlbmQod3JhcHBlcilcblxuXG4gICAgZ290bzogKGlkLCBpbml0VmFsKSAtPlxuXG4gICAgICAgIGlmIG5vdCBpbml0VmFsIHRoZW4gJCgnYm9keScpLmFuaW1hdGUgeyBzY3JvbGxUb3A6ICQoJyMnICsgKCQoQCRlbCkuYXR0cignaWQnKSkpLm9mZnNldCgpLnRvcCB9XG5cbiAgICAgICAgdG9JbmRleCA9ICQoXCJsaS5wYXJrW2RhdGEtaWQ9JyN7aWR9J11cIikuZGF0YSgnaW5kZXgnKVxuXG4gICAgICAgIHRsID0gbmV3IFRpbWVsaW5lTWF4XG5cbiAgICAgICAgdGwuYWRkIFR3ZWVuTWF4LnRvIEBnYWxsZXJ5Q29udGFpbmVyICwgLjQsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MFxuXG4gICAgICAgIHRsLmFkZENhbGxiYWNrID0+XG4gICAgICAgICAgICBAbXlTd2lwZXIuc3dpcGVUbyh0b0luZGV4LCAwKVxuXG4gICAgICAgIHRsLmFkZCBUd2Vlbk1heC50byBAZ2FsbGVyeUNvbnRhaW5lciAsIC40LFxuICAgICAgICAgICAgYXV0b0FscGhhOjFcblxuICAgICAgICBAY3VycmVudEluZGV4ID0gdG9JbmRleFxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRHJhZ2dhYmxlR2FsbGVyeVxuXG4iLCJcblBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblZpZGVvT3ZlcmxheSA9IHJlcXVpcmUgJy4vVmlkZW9PdmVybGF5LmNvZmZlZSdcblxuY2xhc3MgRmFkZUdhbGxlcnkgZXh0ZW5kcyBQbHVnaW5CYXNlXG5cbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gICAgICAgIHN1cGVyKG9wdHMpXG5cblxuICAgIGluaXRpYWxpemU6IChvcHRzKSAtPlxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2cgJ2luaXRpYWxpemU6ICcsIG9wdHNcblxuICAgICAgICBAcGFnZSA9IG9wdHMucGFnZSBvciBudWxsXG4gICAgICAgIHRhcmdldCA9IG9wdHMudGFyZ2V0IG9yIG51bGxcbiAgICAgICAgXG4gICAgICAgIGlmICh0YXJnZXQ/KVxuICAgICAgICAgICAgQCR0YXJnZXQgPSAkKHRhcmdldClcbiAgICAgICAgXG4gICAgICAgIGlmICEoQHBhZ2UgPT0gbnVsbClcbiAgICAgICAgICAgIEBpbmZvQm94ZXMgPSBAJGVsLmZpbmQgXCJsaS52aWRlb1wiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBpbmZvQm94ZXMgPSBAJGVsLmZpbmQgXCJsaVwiXG4gICAgICAgICAgICBcbiAgICAgICAgQGN1cnJlbnRTZWxlY3RlZCA9IEBpbmZvQm94ZXMuZmlsdGVyKFwiOmZpcnN0LWNoaWxkXCIpXG5cbiAgICAgICAgc3VwZXIoKVxuICAgIFxuICAgIGFkZEV2ZW50czogLT4gIFxuXG4gICAgICAgIEBpbmZvQm94ZXMuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgJGJ0biA9ICQodCkuZmluZCgnLnZpZGVvLWJ1dHRvbicpXG5cbiAgICAgICAgICAgIGlmICRidG4ubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgIHZpZGVvRXZlbnRzID0gbmV3IEhhbW1lcigkYnRuWzBdKVxuICAgICAgICAgICAgICAgIHZpZGVvRXZlbnRzLm9uICd0YXAnICwgQGhhbmRsZVZpZGVvSW50ZXJhY3Rpb25cblxuXG5cblxuICAgIGhhbmRsZVZpZGVvSW50ZXJhY3Rpb246IChlKSA9PlxuXG4gICAgICAgICR0YXJnZXQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KFwiLnZpZGVvLWJ1dHRvblwiKVxuICAgICAgICBpZiAoJHRhcmdldC5zaXplKCkgaXMgMCkgXG4gICAgICAgICAgICAkdGFyZ2V0ID0gZS50YXJnZXRcbiAgICAgICAgXG4gICAgICAgIGlmICR0YXJnZXQuZGF0YSgndHlwZScpID09ICdpbWFnZSdcbiAgICAgICAgICAgIGlmICgkdGFyZ2V0LmRhdGEoJ2Z1bGwnKSlcbiAgICAgICAgICAgICAgICBAaW1hZ2VTcmMgPSAkdGFyZ2V0LmRhdGEoJ2Z1bGwnKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBpbWFnZVNyYyA9ICR0YXJnZXQuY2hpbGRyZW4oJ2ltZycpLmF0dHIoJ3NyYycpXG4gICAgICAgIGRhdGEgPVxuICAgICAgICAgICAgbXA0OiR0YXJnZXQuZGF0YSgnbXA0JylcbiAgICAgICAgICAgIHdlYm06JHRhcmdldC5kYXRhKCd3ZWJtJylcbiAgICAgICAgICAgIHBvc3RlcjpAaW1hZ2VTcmNcblxuICAgICAgICBWaWRlb092ZXJsYXkuaW5pdFZpZGVvT3ZlcmxheSBkYXRhXG5cblxuICAgIGdvdG86IChpZCwgaW5pdFZhbCkgLT5cbiAgICAgICAgaW5mb0lkID0gXCIjI3tpZH0taW5mb1wiXG5cbiAgICAgICAgaWYgIShAcGFnZSA9PSBudWxsKVxuICAgICAgICAgICAgdGFyZ2V0ID0gQGluZm9Cb3hlcy5wYXJlbnRzKCdsaS5ncm91cC1pbmZvJylcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGFyZ2V0ID0gQGluZm9Cb3hlc1xuICAgICAgICBcblxuICAgICAgICAjU3dpdGNoIEluZm8gQm94ZXNcbiAgICAgICAgdGwgPSBuZXcgVGltZWxpbmVNYXhcbiAgICAgICAgdGwuYWRkIFR3ZWVuTWF4LnRvIHRhcmdldCAsIC40ICxcbiAgICAgICAgICAgIGF1dG9BbHBoYTowXG4gICAgICAgICAgICBvdmVyd3JpdGU6XCJhbGxcIlxuICAgICAgICB0bC5hZGQgVHdlZW5NYXgudG8gdGFyZ2V0LmZpbHRlcihpbmZvSWQpICwgLjQgLFxuICAgICAgICAgICAgYXV0b0FscGhhOjFcblxuXG4gICAgICAgIGlmIChAJHRhcmdldD8pXG4gICAgICAgICAgICBjb25zb2xlLmxvZyBAJHRhcmdldFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0b3AgPSBAJHRhcmdldC5vZmZzZXQoKS50b3AgLSAoJCgnaGVhZGVyJykuaGVpZ2h0KCkpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyB0b3BcbiAgICAgICAgICAgIHBvcyA9ICQoJ2JvZHknKS5zY3JvbGxUb3AoKVxuICAgICAgICAgICAgaWYgKHBvcyA8IHRvcClcbiAgICAgICAgICAgICAgICAkKCdib2R5JykuYW5pbWF0ZSB7IHNjcm9sbFRvcDogdG9wIH1cbiAgXG5cbm1vZHVsZS5leHBvcnRzID0gRmFkZUdhbGxlcnlcblxuIiwiUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuXG4jIyNcbiAgXG4gIGNyZWF0ZSBmb3JtIG9iamVjdCBvbiBwYWdlIChzcmMvY29tL3BhZ2VzLykgYWZ0ZXIgeW91J3ZlIGNyZWF0ZWQgYW5kIGFkZGVkIGFueSBkZGwgb2JqZWN0c1xuICBcbiAgd2luZG93LmRkbHMgPSBbXSAgICBcbiAgd2luZG93LmRkbHMucHVzaCAkKCcjc2VsZWN0JykuY2ZEcm9wZG93blxuICAgICAgICBvblNlbGVjdDogKHQpIC0+XG4gICAgICAgICAgICBpZCA9ICQodCkuZGF0YSgnaWQnKSAgXG4gIFxuICBteWZvcm0gPSBuZXcgRm9ybUhhbmRsZXJcbiAgICBlbDogJyNzYWxlcy1mb3JtJyBcbiAgXG4jIyNcblxuIyMjIFxuICB0b2RvOlxuICA1LiBjdXN0b21pemUgY29uZmlybWF0aW9uXG4gIDI6IHZhbGlkYXRlIGRhdGUgdHlwZVxuICA0OiBhZGQgaW5wdXQgbWFzayBmb3IgcGhvbmUgYW5kIGRhdGVcbiMjI1xuXG5jbGFzcyBGb3JtSGFuZGxlciBleHRlbmRzIFBsdWdpbkJhc2VcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gICAgICAgIEAkZWwgPSAkKG9wdHMuZWwpXG4gICAgICAgIEBmb3JtY29udGFpbmVyID0gQFxuICAgICAgICBzdXBlcihvcHRzKVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgdmFsaWRhdGU6IC0+XG5cbiAgICAgICAgJGZvcm0gPSBAJGVsXG4gICAgICAgIFxuICAgICAgICBlcnJvcnNDb250YWluZXIgPSAgJyMnICsgJGZvcm0uZGF0YSgnZXJyb3JzJylcbiAgICAgICAgaGFuZGxlciA9ICRmb3JtLmRhdGEoJ2hhbmRsZXInKVxuICAgICAgICBlcnJvcnMgPSAnJ1xuICAgICAgICBpbnZhbGlkRmllbGRDb3VudCA9IDBcbiAgICAgICAgZGF0YSA9IHt9XG5cbiAgICAgICAgaW5wdXRzID0gJGZvcm0uZmluZCAnaW5wdXQ6bm90KFt0eXBlPXJhZGlvXSwgW3R5cGU9aGlkZGVuXSksIHRleHRhcmVhLCAucmFkaW9zJ1xuICAgICAgICBpbnB1dENvbnRhaW5lcnMgPSAkZm9ybS5maW5kKCcuaW5wdXQsIHRleHRhcmVhLCAucmFkaW9zJylcblxuICAgICAgICAkKGlucHV0Q29udGFpbmVycykucmVtb3ZlQ2xhc3MoJ2ludmFsaWQnKVxuXG4gICAgICAgICMgdGV4dGJveGVzIGFuZCB0ZXh0IGlucHV0c1xuICAgICAgICBpbnB1dHMuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgdmFsdWUgPSAnJ1xuICAgICAgICAgICAgdHlwZSA9ICQodCkuZGF0YSgndHlwZScpXG4gICAgICAgICAgICBwYXJlbnQgPSAkKHQpLnBhcmVudHMoJy5pbnB1dCcpLmVxKDApXG4gICAgICAgICAgICByZXF1aXJlZCA9ICQocGFyZW50KS5oYXNDbGFzcygncmVxdWlyZWQnKSBvciAkKHQpLmhhc0NsYXNzKCdyZXF1aXJlZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlzcmFkaW8gPSAkKHQpLmhhc0NsYXNzKCdyYWRpb3MnKVxuICAgICAgICAgICAgaWYgaXNyYWRpbyBhbmQgJCgnaW5wdXQ6cmFkaW9bbmFtZT0nICsgJCh0KS5kYXRhKCdncm91cCcpICsgJ106Y2hlY2tlZCcpLnNpemUoKSBpcyAxXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAkKCdpbnB1dDpyYWRpb1tuYW1lPScgKyAkKHQpLmRhdGEoJ2dyb3VwJykgKyAnXTpjaGVja2VkJykudmFsKCkudHJpbSgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB2YWx1ZSA9IGlmIGlzcmFkaW8gdGhlbiB2YWx1ZSBlbHNlICQodCkudmFsKCkudHJpbSgpXG4gICAgICAgICAgICBkYXRhWyQodCkuZGF0YSgnbWFwcGluZycpXSA9IHZhbHVlXG5cbiAgICAgICAgICAgIGZpZWxkTmFtZSA9IGlmICQodCkuZGF0YSgnbmFtZScpIHRoZW4gJCh0KS5kYXRhKCduYW1lJykgZWxzZSAkKHQpLmF0dHIoJ3BsYWNlaG9sZGVyJylcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyB2YWxpZGF0ZSByZXF1aXJlZCBmaWVsZHNcbiAgICAgICAgICAgIGlmIHJlcXVpcmVkIGFuZCAodmFsdWUubGVuZ3RoIGlzIDApXG4gICAgICAgICAgICAgICAgZXJyb3JzICs9ICc8bGk+JyArIGZpZWxkTmFtZSArICcgaXMgcmVxdWlyZWQuPC9saT4nXG4gICAgICAgICAgICAgICAgaWYgJCh0KS5wcm9wKCd0YWdOYW1lJykudG9Mb3dlckNhc2UoKSBpcyAndGV4dGFyZWEnIG9yICQodCkuaGFzQ2xhc3MoJ3JhZGlvcycpXG4gICAgICAgICAgICAgICAgICAgICQodCkuYWRkQ2xhc3MoJ2ludmFsaWQnKSAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAkKHQpLnBhcmVudHMoJy5pbnB1dCcpLmFkZENsYXNzKCdpbnZhbGlkJylcbiAgICAgICAgICAgICAgICBpbnZhbGlkRmllbGRDb3VudCsrXG5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjIHZhbGlkYXRlIGlucHV0IHR5cGVzXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdlbWFpbCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbFBhdHRlcm4gPSAvLy9eKFtcXHcuLV0rKUAoW1xcdy4tXSspXFwuKFthLXpBLVouXXsyLDZ9KSQgLy8vaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICEgdmFsdWUubWF0Y2ggZW1haWxQYXR0ZXJuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9ycyArPSAnPGxpPicgKyBmaWVsZE5hbWUgKyAnIGlzIG5vdCBhIHZhbGlkIGVtYWlsIGFkZHJlc3MuPC9saT4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodCkucGFyZW50cygnLmlucHV0JykuYWRkQ2xhc3MoJ2ludmFsaWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnZhbGlkRmllbGRDb3VudCsrXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgaXNOYU4odmFsdWUpIG9yICh2YWx1ZSAlIDEgIT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JzICs9ICc8bGk+JyArIGZpZWxkTmFtZSArICcgaXMgbm90IGEgdmFsaWQgbnVtYmVyLjwvbGk+J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHQpLnBhcmVudHMoJy5pbnB1dCcpLmFkZENsYXNzKCdpbnZhbGlkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW52YWxpZEZpZWxkQ291bnQrK1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAncGhvbmUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0ID0gL15bKF17MCwxfVswLTldezN9WyldezAsMX1bLVxcc1xcLl17MCwxfVswLTldezN9Wy1cXHNcXC5dezAsMX1bMC05XXs0fSQvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgISB2YWx1ZS5tYXRjaCBwYXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JzICs9ICc8bGk+JyArIGZpZWxkTmFtZSArICcgaXMgbm90IGEgdmFsaWQgcGhvbmUgbnVtYmVyLjwvbGk+J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHQpLnBhcmVudHMoJy5pbnB1dCcpLmFkZENsYXNzKCdpbnZhbGlkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW52YWxpZEZpZWxkQ291bnQrK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICBcbiAgICAgICAgIyB2YWxpZGF0ZSBkcm9wZG93biBsaXN0c1xuICAgICAgICBpZiB3aW5kb3cuZGRscz9cbiAgICAgICAgICAgICQuZWFjaCB3aW5kb3cuZGRscywgKGksIGQpID0+XG4gICAgICAgICAgICAgICAgZC5yZW1vdmVDbGFzcygnaW52YWxpZCcpXG4gICAgICAgICAgICAgICAgZGF0YVtkLm1hcHBpbmddID0gZC52YWx1ZS50cmltKClcbiAgICAgICAgICAgICAgICBpZiAoZC5yZXF1aXJlZCkgYW5kIChkLnZhbHVlLnRyaW0oKS5sZW5ndGggaXMgMClcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JzICs9ICc8bGk+JyArIGQubmFtZSArICcgaXMgcmVxdWlyZWQuPC9saT4nXG4gICAgICAgICAgICAgICAgICAgIGQuYWRkQ2xhc3MoJ2ludmFsaWQnKVxuICAgICAgICAgICAgICAgICAgICBpbnZhbGlkRmllbGRDb3VudCsrICAgICAgICAgICAgICAgICAgICBcblxuICAgICAgICB2YWxpZCA9IGludmFsaWRGaWVsZENvdW50IGlzIDBcbiAgICAgICAgZXJyb3JIdG1sID0gaWYgdmFsaWQgdGhlbiAnJyBlbHNlICc8dWw+JyArIGVycm9ycyArICc8L3VsPidcbiAgICAgICAgY2xzID0gaWYgdmFsaWQgdGhlbiAnc3VjY2VzcycgZWxzZSAnZmFpbHVyZSdcbiAgICAgICAgICAgIFxuICAgICAgICAkKGVycm9yc0NvbnRhaW5lcikucmVtb3ZlQ2xhc3MoJ3N1Y2Nlc3MgZmFpbHVyZScpLmFkZENsYXNzKGNscykuaHRtbChlcnJvckh0bWwpICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgIyBkaXNwbGF5IGVycm9yc1xuICAgICAgICAkKGVycm9yc0NvbnRhaW5lcikuc3RvcCgpLmFuaW1hdGUoe1xuICAgICAgICAgICAgaGVpZ2h0OiAkKGVycm9yc0NvbnRhaW5lcikuZmluZCgndWwnKS5oZWlnaHQoKVxuICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgIHJlc3BvbnNlID0ge1xuICAgICAgICAgICAgdmFsaWQ6IHZhbGlkLFxuICAgICAgICAgICAgaGFuZGxlcjogaGFuZGxlcixcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICBjb250YWluZXI6IGVycm9yc0NvbnRhaW5lclxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNwb25zZVxuXG4gICAgc3VibWl0Rm9ybTogKGUsIHBhcmVudCkgLT5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICBcbiAgICAgICAgdmFsaWRhdGlvbiA9IHBhcmVudC52YWxpZGF0ZSgpXG4gICAgICAgIGlmIHZhbGlkYXRpb24udmFsaWRcbiAgICAgICAgXG4gICAgICAgICAgICAkLmFqYXggXG4gICAgICAgICAgICAgICAgdXJsOiB2YWxpZGF0aW9uLmhhbmRsZXIsXG4gICAgICAgICAgICAgICAgbWV0aG9kOlwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgZGF0YTogdmFsaWRhdGlvbi5kYXRhLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgICAgICAgIHJlcyA9IGlmIHJlc3BvbnNlLnJlc3BvbnNlSlNPTj8gdGhlbiByZXNwb25zZS5yZXNwb25zZUpTT04gZWxzZSByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gJzxkaXYgaWQ9XCJjb25jbHVzaW9uXCI+WW91ciBzdWJtaXNzaW9uIGZhaWxlZC48L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgIGdvb2QgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiByZXMubWVzc2FnZT9cbiAgICAgICAgICAgICAgICAgICAgICAgIGdvb2QgPSByZXMubWVzc2FnZSBpcyAnc3VjY2VzcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICMgdG9kbzogY3VzdG9taXplIG1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBnb29kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9ICc8ZGl2IGlkPVwiY29uY2x1c2lvblwiPlRoYW5rIHlvdS4gIFdlIGhhdmUgcmVjZWl2ZWQgeW91ciByZXF1ZXN0LCBhbmQgd2lsbCByZXBseSB0byB5b3Ugc2hvcnRseS48L2Rpdj4nXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBzZXJ2ZXIgc2lkZSB2YWxpZGF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgcmVzLmVycm9yPyBhbmQgcmVzLmVycm9yLmVycm9ycz9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9ICc8dWwgaWQ9XCJjb25jbHVzaW9uXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5lYWNoIHJlcy5lcnJvci5lcnJvcnMsIChpLCBvYmopID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlICs9ICc8bGk+JyArIG9iai5tZXNzYWdlICsgJzwvbGk+J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgKz0gJzwvdWw+J1xuICAgIFxuICAgICAgICAgICAgICAgICAgICBjbHMgPSBpZiBnb29kIHRoZW4gJ3N1Y2Nlc3MnIGVsc2UgJ2ZhaWx1cmUnXG4gICAgICAgICAgICAgICAgICAgICQodmFsaWRhdGlvbi5jb250YWluZXIpLnJlbW92ZUNsYXNzKCdzdWNjZXNzIGZhaWx1cmUnKS5hZGRDbGFzcyhjbHMpLmh0bWwobWVzc2FnZSlcblxuICAgICAgICAgICAgICAgICAgICAkKHZhbGlkYXRpb24uY29udGFpbmVyKS5zdG9wKCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICQodmFsaWRhdGlvbi5jb250YWluZXIpLmZpbmQoJyNjb25jbHVzaW9uJykuaGVpZ2h0KClcbiAgICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICAgICBpZiBnb29kXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuY2xlYXJGb3JtKClcblxuICAgIGNsZWFyRm9ybTogLT5cblxuICAgICAgICAkZm9ybSA9IEAkZWxcbiAgICAgICAgXG4gICAgICAgICNyYWRpb3NcbiAgICAgICAgcmFkaW9zID0gJGZvcm0uZmluZCAnLnJhZGlvcydcbiAgICAgICAgcmFkaW9zLnJlbW92ZUNsYXNzKCdpbnZhbGlkJylcbiAgICAgICAgJC5lYWNoIHJhZGlvcywgKHgsIHIpID0+XG4gICAgICAgICAgICAkKHJhZGlvcykuZmluZCgnaW5wdXQ6cmFkaW8nKS5yZW1vdmVBdHRyKFwiY2hlY2tlZFwiKVxuICAgICAgICBcbiAgICAgICAgIyBpbnB1dHNcbiAgICAgICAgaW5wdXRzID0gJGZvcm0uZmluZCAnaW5wdXQ6bm90KFt0eXBlPXJhZGlvXSksIHRleHRhcmVhJ1xuICAgICAgICBpbnB1dHMucmVtb3ZlQ2xhc3MoJ2ludmFsaWQnKS5wYXJlbnRzKCcuaW5wdXQnKS5yZW1vdmVDbGFzcygnaW52YWxpZCcpXG4gICAgICAgICQuZWFjaCBpbnB1dHMsIChpLCB0KSA9PlxuICAgICAgICAgICAgJCh0KS52YWwoJycpXG5cbiAgICAgICAgIyBkcm9wZG93bmxpc3RzXG4gICAgICAgIGlmIHdpbmRvdy5kZGxzP1xuICAgICAgICAgICAgJC5lYWNoIHdpbmRvdy5kZGxzLCAoaSwgZCkgPT5cbiAgICAgICAgICAgICAgICBkLmNsZWFyU2VsZWN0aW9uKClcbiAgICAgICAgICAgICAgICBcbiAgICBhZGRFdmVudHM6IC0+XG4gICAgICAgIHN1Ym1pdHRlciA9ICBAJGVsLmRhdGEoJ3N1Ym1pdHRlcicpXG4gICAgICAgIHRoYXQgPSBAXG4gICAgICAgICQoJyMnICsgc3VibWl0dGVyKS5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICAgICAgICAgIHRoYXQuc3VibWl0Rm9ybSBlLCB0aGF0XG5cbiAgICAgICAgIyB0ZXh0IGlucHV0cyBcbiAgICAgICAgQCRlbC5maW5kKCdpbnB1dDpub3QoW3R5cGU9cmFkaW9dKSwgdGV4dGFyZWEnKS5vbiAnYmx1cicsIChlKSAtPlxuICAgICAgICAgICAgaWYgJChAKS5wYXJlbnRzKCcuaW5wdXQnKS5oYXNDbGFzcygnaW52YWxpZCcpIG9yICQoQCkuaGFzQ2xhc3MoJ2ludmFsaWQnKVxuICAgICAgICAgICAgICAgIHRoYXQudmFsaWRhdGUoKVxuXG4gICAgICAgICMgcmFkaW8gYnV0dG9uc1xuICAgICAgICBAJGVsLmZpbmQoJ2lucHV0OnJhZGlvJykub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgICAgICAgICBpZiAkKEApLnBhcmVudHMoJy5yYWRpb3MnKS5oYXNDbGFzcygnaW52YWxpZCcpXG4gICAgICAgICAgICAgICAgdGhhdC52YWxpZGF0ZSgpXG5cbiAgICAgICAgIyBkcm9wIGRvd24gbGlzdHNcbiAgICAgICAgaWYgd2luZG93LmRkbHM/XG4gICAgICAgICAgICAkLmVhY2ggd2luZG93LmRkbHMsIChpLCBkKSA9PiBcbiAgICAgICAgICAgICAgICBpZiAoZC5yZXF1aXJlZCkgXG4gICAgICAgICAgICAgICAgICAgIGhpZGRlbkZpZWxkID0gZC5pbnB1dFswXVxuICAgICAgICAgICAgICAgICAgICAkKGhpZGRlbkZpZWxkKS5vbiAnY2hhbmdlJywgKGUpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnZhbGlkYXRlKClcbiAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gRm9ybUhhbmRsZXJcbiIsImdsb2JhbHMgPSByZXF1aXJlICcuLi9nbG9iYWwvaW5kZXguY29mZmVlJ1xuUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuXG5jbGFzcyBIZWFkZXJBbmltYXRpb24gZXh0ZW5kcyBQbHVnaW5CYXNlXG5cbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gIFxuICAgICAgICBAYm9keSA9ICQoXCJib2R5XCIpXG4gICAgICAgIEBodG1sID0gJChcImh0bWxcIilcbiAgICAgICAgQGNvbnRlbnQgPSAkKFwiI2NvbnRlbnRcIilcbiAgICAgICAgQG1vYm5hdiA9ICQoXCIjbW9iaWxlLWhlYWRlci1uYXZcIilcbiAgICAgICAgQHN1Ym5hdiA9ICQoXCIuc3VibmF2XCIpXG4gICAgICAgIEBzdWJuYXZTaG93aW5nID0gZmFsc2VcbiAgICAgICAgQG91clBhcmtzTGVmdCA9ICQoJy5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cIm91ci1wYXJrc1wiXScpLm9mZnNldCgpLmxlZnRcbiAgICAgICAgQHBhcnRuZXJzaGlwTGVmdCA9ICQoJy5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cInBhcnRuZXJzaGlwc1wiXScpLm9mZnNldCgpLmxlZnRcbiAgICAgICAgXG5cbiAgICAgICAgc3VwZXIob3B0cykgIFxuXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBzdXBlcigpICAgIFxuICAgICAgICBAc2hvd0luaXRpYWxTdWJOYXYoKSAgICAgICAgXG5cbiAgICBhZGRFdmVudHM6IC0+XG4gICAgICAgIGlmICEkKCdodG1sJykuaGFzQ2xhc3MgJ3RhYmxldCdcbiAgICAgICAgICAgICQoJy5uYXYtbGlzdCBhIGxpJykub24gJ21vdXNlZW50ZXInLCBAaGFuZGxlTmF2SG92ZXJcbiAgICAgICAgICAgICQoJ2hlYWRlcicpLm9uICdtb3VzZWxlYXZlJywgQGhpZGVTdWJOYXZcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5vbnJlc2l6ZSA9IEBoYW5kbGVSZXNpemVcbiAgICAgICAgQGJvZHkuZmluZChcIiNuYXZiYXItbWVudVwiKS5vbiAnY2xpY2snLCBAdG9nZ2xlTmF2XG4gICAgICAgICQoJyNtb2JpbGUtaGVhZGVyLW5hdiBhJykub24gJ2NsaWNrJywgQHNob3dNb2JpbGVTdWJOYXZcbiAgICAgICAgJCgnI21vYmlsZS1oZWFkZXItbmF2IGknKS5vbiAnY2xpY2snLCBAaGFuZGxlQXJyb3dDbGlja1xuICAgICAgICBcbiAgICAgICAgQGJvZHkuZmluZCgnLnRvZ2dsZS1uYXYnKS5vbiAnY2xpY2snLCAoKSAtPlxuICAgICAgICAgICAgJChAKS5wYXJlbnRzKCdoZWFkZXInKS5maW5kKCcjbmF2YmFyLW1lbnUgaW1nJykudHJpZ2dlcignY2xpY2snKVxuICAgICAgICAgICAgXG4gICAgICAgICQoJyNtb2JpbGUtaGVhZGVyLW5hdicpLm9uICdjbGljaycsICcubW9iaWxlLXN1Yi1uYXYgbGknLCBAb25DbGlja01vYmlsZVN1Yk5hdkxpbmtcbiAgICAgICAgXG4gICAgXG4gICAgaGFuZGxlU3ViTmF2OiA9PlxuICAgICAgICBzdGFydFBhZ2UgPSAkKCcuc3VibmF2JykuZGF0YSAncGFnZSdcbiAgICAgICAgaWQgPSAkKCcubmF2LWxpc3QgYVtkYXRhLXBhZ2Utc2hvcnQ9XCInICsgc3RhcnRQYWdlICsgJ1wiXScpLmRhdGEgJ3BhZ2UnXG4gICAgICAgIEBzaG93U3ViTmF2TGlua3MoaWQpXG4gICAgICAgIFxuICAgIHNob3dJbml0aWFsU3ViTmF2OiA9PlxuICAgICAgICBzZWN0aW9uID0gJCgnLnN1Ym5hdicpLmRhdGEgJ3BhZ2UnXG4gICAgICAgIFxuICAgICAgICBpZiBzZWN0aW9uID09ICdvZmZlcmluZ3MnIHx8IHNlY3Rpb24gPT0gJ2FjY29tbW9kYXRpb25zJyB8fCBzZWN0aW9uID09ICdvdXJwYXJrcydcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MoJ291ci1wYXJrcycpXG4gICAgICAgIGVsc2UgaWYgc2VjdGlvbiA9PSAncGFydG5lcnNoaXAtZGV0YWlscycgfHwgc2VjdGlvbiA9PSAncGFydG5lcnNoaXAnXG4gICAgICAgICAgICBAc2hvd1N1Yk5hdkxpbmtzKCdwYXJ0bmVyc2hpcHMnKVxuICAgICAgICBcbiAgICB0b2dnbGVOYXY6IChlKSA9PlxuICAgICAgICAgICAgICAgIFxuICAgIGhhbmRsZVJlc2l6ZTogPT5cbiAgICAgICAgQGhhbmRsZVN1Yk5hdigpXG4gICAgICAgIEBhZGp1c3RNb2JpbGVOYXYoKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgcG9zaXRpb25TdWJOYXZMaXN0czogPT5cbiAgICAgICAgI2NvbnNvbGUubG9nICdwb3NpdGlvblN1Yk5hdkxpc3RzJ1xuIyAgICAgICAgb3VyUGFya3NMZWZ0ID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwib3VyLXBhcmtzXCJdJykub2Zmc2V0KCkubGVmdFxuIyAgICAgICAgcGFydG5lcnNoaXBMZWZ0ID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwicGFydG5lcnNoaXBzXCJdJykub2Zmc2V0KCkubGVmdCAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgJCgnI2hlYWRlci10b3AnKS5oYXNDbGFzcyAnc21hbGwnXG4gICAgICAgICAgICBpZiB3aW5kb3cuaW5uZXJXaWR0aCA8IDk5M1xuICAgICAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAb3VyUGFya3NMZWZ0IC0gOTApXG4gICAgICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBwYXJ0bmVyc2hpcExlZnQgLSAxMzMpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgJCgnI291ci1wYXJrcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBvdXJQYXJrc0xlZnQgLSA5MClcbiAgICAgICAgICAgICAgICAkKCcjcGFydG5lcnNoaXBzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQHBhcnRuZXJzaGlwTGVmdCAtIDExOClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgd2luZG93LmlubmVyV2lkdGggPCA5OTNcbiAgICAgICAgICAgICAgICAkKCcjb3VyLXBhcmtzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQG91clBhcmtzTGVmdCAtIDYwKVxuICAgICAgICAgICAgICAgICQoJyNwYXJ0bmVyc2hpcHMtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAcGFydG5lcnNoaXBMZWZ0IC0gMTA1KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAb3VyUGFya3NMZWZ0IC0gNjApXG4gICAgICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBwYXJ0bmVyc2hpcExlZnQgLSA5MClcblxuICAgIGFuaW1hdGVIZWFkZXI6IChzY3JvbGxZKSA9PlxuICAgICAgICBpZiBAaHRtbC5oYXNDbGFzcyAncGhvbmUnXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAkaHQgPSBAJGVsLmZpbmQoJyNoZWFkZXItdG9wJylcbiAgICAgICAgJGhiID0gQCRlbC5maW5kKCcjaGVhZGVyLWJvdHRvbScpIFxuXG4gICAgICAgIGlmIHNjcm9sbFkgPiA4NSBcbiAgICAgICAgICAgIGlmICFAbmF2Q29sbGFwc2VkXG4gICAgICAgICAgICAgICAgJCgnI2hlYWRlci10b3AsICNoZWFkZXItYm90dG9tLCAjbmF2YmFyLWxvZ28sIC5uYXYtbGlzdCwgI2J1eSwgLmhlYWRlci1jb250YWN0LCAuaGVhZGVyLXNvY2lhbCcpLmFkZENsYXNzKCdzbWFsbCcpXG4gICAgICAgICAgICAgICAgQG5hdkNvbGxhcHNlZCA9IHRydWVcbiAgICAgICAgICAgICAgICBAcG9zaXRpb25TdWJOYXZMaXN0cygpIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiBAbmF2Q29sbGFwc2VkXG4gICAgICAgICAgICAgICAgJCgnI2hlYWRlci10b3AsICNoZWFkZXItYm90dG9tLCAjbmF2YmFyLWxvZ28sIC5uYXYtbGlzdCwgI2J1eSwgLmhlYWRlci1jb250YWN0LCAuaGVhZGVyLXNvY2lhbCcpLnJlbW92ZUNsYXNzKCdzbWFsbCcpXG4gICAgICAgICAgICAgICAgQG5hdkNvbGxhcHNlZCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgQGhhbmRsZVN1Yk5hdigpXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uU3ViTmF2TGlzdHMoKSBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgIGhhbmRsZU5hdkhvdmVyOiAoZSkgPT5cbiAgICAgICAgcGFyZW50SUQgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5kYXRhKCdwYWdlJylcbiAgICAgICAgaWYgJCgnIycgKyBwYXJlbnRJRCArICctc3VibmF2LWxpc3QnKS5maW5kKCdhJykubGVuZ3RoIDwgMVxuICAgICAgICAgICAgQGhpZGVTdWJOYXYoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAaGlkZVN1Yk5hdkxpbmtzKClcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MocGFyZW50SUQpXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgIUBzdWJuYXZTaG93aW5nXG4gICAgICAgICAgICAgICAgQHNob3dTdWJOYXYoKVxuICAgICAgICAgICAgICBcbiAgICBzaG93U3ViTmF2OiA9PlxuICAgICAgICBAc3VibmF2LmFkZENsYXNzKCdzaG93aW5nJylcbiAgICAgICAgQHN1Ym5hdlNob3dpbmcgPSB0cnVlXG4gICAgICAgIFxuICAgIGhpZGVTdWJOYXY6ID0+XG4gICAgICAgIEBzdWJuYXYucmVtb3ZlQ2xhc3MoJ3Nob3dpbmcnKVxuICAgICAgICBAc3VibmF2U2hvd2luZyA9IGZhbHNlXG4gICAgICAgIEBoYW5kbGVTdWJOYXYoKVxuXG4gICAgc2hvd1N1Yk5hdkxpbmtzOiAocGFnZSkgPT5cbiAgICAgICAgaWYgcGFnZT9cbiAgICAgICAgICAgIGxlZnQgPSAkKCcubmF2IC5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cIicgKyBwYWdlICsgJ1wiXScpLnBvc2l0aW9uKCkubGVmdFxuICAgICAgICAgICAgb2Zmc2V0ID0gMFxuICAgICAgICAgICAgaGVscGVyID0gLTQ1IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB3aW5kb3cuaW5uZXJXaWR0aCA8IDk5M1xuICAgICAgICAgICAgICAgIGhlbHBlciA9IC0yMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjY29uc29sZS5sb2cgJ3BhZ2U6ICcsIHBhZ2VcbiAgICAgICAgICAgICNjb25zb2xlLmxvZyAnYjogJywgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCBhJykubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICQoJyMnICsgcGFnZSArICctc3VibmF2LWxpc3QgYScpLmxlbmd0aCA8IDNcbiAgICAgICAgICAgICAgICBmb3IgYSBpbiAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0IGEnKVxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBvZmZzZXQgKyAkKGEpLndpZHRoKClcblxuICAgICAgICAgICAgaWYgb2Zmc2V0ID4gMFxuICAgICAgICAgICAgICAgICNjb25zb2xlLmxvZyAnYSdcbiAgICAgICAgICAgICAgICAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgbGVmdCAtIChvZmZzZXQgLyAzKSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAjY29uc29sZS5sb2cgJ2InXG4jICAgICAgICAgICAgICAgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIGxlZnQgKyBoZWxwZXIpXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uU3ViTmF2TGlzdHMoKVxuICAgICAgICAgICAgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCcpLmFkZENsYXNzKCdzaG93aW5nJylcbiAgICBcbiAgICBoaWRlU3ViTmF2TGlua3M6ID0+XG4gICAgICAgICQoJy5zdWJuYXYtbGlzdCBsaScpLnJlbW92ZUNsYXNzKCdzaG93aW5nJylcbiAgICAgICAgXG4gICAgaGFuZGxlU3ViTmF2OiA9PlxuICAgICAgICBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ291cnBhcmtzJykgfHwgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdvZmZlcmluZ3MnKSB8fCAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ2FjY29tbW9kYXRpb25zJylcbiAgICAgICAgICAgICQoJ3VsLnN1Ym5hdi1saXN0IGxpJykucmVtb3ZlQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICAgICAkKCcjb3VyLXBhcmtzLXN1Ym5hdi1saXN0JykuYWRkQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICAgICBAc2hvd1N1Yk5hdkxpbmtzKCdvdXItcGFya3MnKVxuXG4gICAgICAgICAgICBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ29mZmVyaW5ncycpXG4gICAgICAgICAgICAgICAgJCgnYSNvdXItcGFya3Mtb2ZmZXJpbmdzLXN1Ym5hdi1saW5rJykuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG4gICAgICAgICAgICBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ2FjY29tbW9kYXRpb25zJylcbiAgICAgICAgICAgICAgICAkKCdhI291ci1wYXJrcy1hY2NvbW1vZGF0aW9ucy1zdWJuYXYtbGluaycpLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG4gICAgICAgIGVsc2UgaWYgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdwYXJ0bmVyc2hpcCcpIHx8ICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygncGFydG5lcnNoaXAtZGV0YWlscycpXG4gICAgICAgICAgICAkKCd1bC5zdWJuYXYtbGlzdCBsaScpLnJlbW92ZUNsYXNzICdzaG93aW5nJ1xuICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmFkZENsYXNzICdzaG93aW5nJ1xuICAgICAgICAgICAgQHNob3dTdWJOYXZMaW5rcygncGFydG5lcnNoaXBzJylcblxuIyAgICAgICAgICAgIGlmICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygncGFydG5lcnNoaXAtZGV0YWlscycpXG4jICAgICAgICAgICAgICAgICQoJ2EjcGFydG5lcnNoaXAtZGV0YWlscy1zdWJuYXYtbGluaycpLmFkZENsYXNzICdzZWxlY3RlZCdcblxuXG4jPT09PT09PT09PT09PT09PT09PSM9PT09PT09PT09PT09PT09PT09Iz09PT09PT09PT09PT09PT09PT0jXG4jPT09PT09PT09PT09PT09PT09PSAgTU9CSUxFIFNUQVJUUyBIRVJFID09PT09PT09PT09PT09PT09PSNcbiM9PT09PT09PT09PT09PT09PT09Iz09PT09PT09PT09PT09PT09PT0jPT09PT09PT09PT09PT09PT09PSMgXG5cbiAgICB0b2dnbGVOYXY6IChlKSA9PlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgJHQgPSAkKGUudGFyZ2V0KVxuICAgICAgICAkaGIgPSAkKCcjaGVhZGVyLWJvdHRvbScpXG4gICAgICAgICRtbiA9ICQoJyNtb2JpbGUtaGVhZGVyLW5hdicpXG4gICAgICAgICRoaCA9ICRoYi5oZWlnaHQoKVxuXG4gICAgICAgICR0LnRvZ2dsZUNsYXNzKCdjbG9zZWQnKVxuXG4gICAgICAgIGNvbnNvbGUubG9nICdzZWNvbmQgdG9nZ2xlJ1xuICAgICAgICBjb25zb2xlLmxvZyAkdFxuICAgICAgICBcbiAgICAgICAgaWYgJHQuaGFzQ2xhc3MoJ2Nsb3NlZCcpXG4gICAgICAgICAgICBAYWRqdXN0TW9iaWxlTmF2KClcbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvIEBtb2JuYXYsIC4zNSwgXG4gICAgICAgICAgICAgICAge3k6ICg4MDAgKyAkaGgpXG4gICAgICAgICAgICAgICAgLHo6IDBcbiAgICAgICAgICAgICAgICAsZWFzZTogUG93ZXIxLmVhc2VPdXRcbiAgICAgICAgICAgICAgICAsb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgICAgICAgICAgVHdlZW5NYXguc2V0IEBtb2JuYXYsXG4gICAgICAgICAgICAgICAgICAgICAgICB6OiAxMFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgVHdlZW5NYXguc2V0IEBtb2JuYXYsXG4gICAgICAgICAgICAgICAgejogLTIgXG4gICAgICAgICAgICBUd2Vlbk1heC50byBAbW9ibmF2LCAuNSwge3k6IDAsIHo6IDAsIGVhc2U6IFBvd2VyMS5lYXNlSW59XG4gICAgICAgICAgICAkKCcubW9iaWxlLXN1Yi1uYXYnKS5jc3MoJ2hlaWdodCcsICcwcHgnKVxuICAgICAgICAgICAgQGFkanVzdE1vYmlsZU5hdlxuICAgICAgICAgICAgQGhpZGVNb2JpbGVTdWJOYXYoKVxuICAgICAgICAgICAgVHdlZW5NYXguc2V0IEBjb250ZW50ICxcbiAgICAgICAgICAgICAgICB5OiAwXG5cbiAgICBhZGp1c3RNb2JpbGVOYXY6ID0+XG4gICAgICAgICRoYiA9ICQoJyNoZWFkZXItYm90dG9tJylcbiAgICAgICAgJG1uID0gJCgnI21vYmlsZS1oZWFkZXItbmF2JylcbiAgICAgICAgIyBTZXQgbmF2IGhlaWdodCB0byAzNTBweCBldmVyeSB0aW1lIGJlZm9yZSBhZGp1c3RpbmdcbiAgICAgICAgIyRtbi5jc3Mge2hlaWdodDogMzUwfVxuICAgICAgICAkaGggPSAkaGIuaGVpZ2h0KClcbiAgICAgICAgJG5oID0gJG1uLmhlaWdodCgpXG4gICAgICAgICRpdyA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgICAgICRpaCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICAkbWIgPSAkKCcjbmF2YmFyLW1lbnUnKVxuXG4gICAgICAgIGlmICRuaCA+ICRpaFxuICAgICAgICAgICAgJG1uLmNzcyB7aGVpZ2h0OiAoJGloIC0gJGhoKSwgb3ZlcmZsb3c6ICdzY3JvbGwnfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAkbW4uY3NzIHtoZWlnaHQ6IDQwMCArICdweCd9ICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIHNob3dNb2JpbGVTdWJOYXY6IChlKSA9PlxuICAgICAgICB0aGlzU3ViTmF2ID0gJChlLnRhcmdldCkucGFyZW50KCkuZmluZCAnLm1vYmlsZS1zdWItbmF2J1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXNTdWJOYXYuZmluZCgnbGknKS5sZW5ndGggPCAxKVxuICAgICAgICAgICAgQGhpZGVNb2JpbGVTdWJOYXYoKVxuICAgICAgICAgICAgJChlLnRhcmdldCkuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgaWYgISgkKGUudGFyZ2V0KS5wYXJlbnQoKS5oYXNDbGFzcygnYWN0aXZlJykpXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIFxuICAgICAgICBob3dNYW55ID0gdGhpc1N1Yk5hdi5maW5kKCdsaScpLmxlbmd0aFxuICAgICAgICB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgdGFyZ2V0ID0gJChlLnRhcmdldClcblxuICAgICAgICBAaGlkZU1vYmlsZVN1Yk5hdigpXG4gICAgICAgIHRhcmdldC5maW5kKCdpJykuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgdGFyZ2V0LmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgIHRhcmdldC5wYXJlbnRzKCdhJykuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgQG1vYm5hdi5jc3MoJ2hlaWdodCcsICh3aW5kb3dIZWlnaHQgLSAxMDApICsgJ3B4JylcbiAgICAgICAgdGhpc1N1Yk5hdi5jc3MoJ2hlaWdodCcsIChob3dNYW55ICogNTApICsgJ3B4JylcbiAgICAgICAgXG4gICAgaGlkZU1vYmlsZVN1Yk5hdjogPT5cbiAgICAgICAgJCgnLm1vYmlsZS1zdWItbmF2JykuY3NzKCdoZWlnaHQnLCAnMHB4JylcbiAgICAgICAgQG1vYm5hdi5jc3MoJ2hlaWdodCcsICc0MDBweCcpXG4gICAgICAgIEBtb2JuYXYuZmluZCgnaScpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgIEBtb2JuYXYuZmluZCgnbGknKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICBAbW9ibmF2LmZpbmQoJ3VsIGEnKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuXG4gICAgXG4gICAgaGFuZGxlQXJyb3dDbGljazogKGUpID0+XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIFxuICAgICAgICBpZiAkKGUudGFyZ2V0KS5oYXNDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgQGhpZGVNb2JpbGVTdWJOYXYoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnRzKCdsaScpLnRyaWdnZXIgJ2NsaWNrJ1xuICAgICAgICBcbiAgICAgICAgXG4gICAgb25DbGlja01vYmlsZVN1Yk5hdkxpbms6IChlKSA9PlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBcbiAgICAgICAgaWYgJChlLnRhcmdldCkuZGF0YSgnaHJlZicpP1xuICAgICAgICAgICAgdXJsID0gJChlLnRhcmdldCkuZGF0YSAnaHJlZidcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJBbmltYXRpb25cblxuXG4iLCJcblBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblZpZGVvT3ZlcmxheSA9IHJlcXVpcmUgJy4vVmlkZW9PdmVybGF5LmNvZmZlZSdcblxuY2xhc3MgUGFya3NMaXN0IGV4dGVuZHMgUGx1Z2luQmFzZVxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBAJGVsID0gJChvcHRzLmVsKVxuICAgICAgICBzdXBlcihvcHRzKSAgICAgICAgIFxuICAgICAgICBAZ2FsbGVyeSA9IG9wdHMuZ2FsbGVyeVxuICAgICAgICBpZiBAZ2FsbGVyeT9cbiAgICAgICAgICAgIEBnYWxsZXJ5Lm9uIFwiaXRlbUluZGV4XCIgLCBAc2VsZWN0TG9nb1xuICAgICAgICAgICAgXG4gICAgICAgIEBwYWdlID0gb3B0cy5wYWdlXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBAcGFya0xvZ29zID0gJChAJGVsKS5maW5kIFwibGlcIlxuICAgICAgICBAY3VycmVudFNlbGVjdGVkID0gQHBhcmtMb2dvcy5maWx0ZXIoXCI6Zmlyc3QtY2hpbGRcIilcbiAgICAgICAgaWYgQGdhbGxlcnk/XG4gICAgICAgICAgICBAc2VsZWN0TG9nbyBAc2VsZWN0ZWRMb2dvKClcbiAgICAgICAgICAgIEBnYWxsZXJ5LmdvdG8gQHNlbGVjdGVkTG9nbygpLCB0cnVlXG4gICAgICAgIHN1cGVyKClcblxuICAgIGFkZEV2ZW50czogLT5cbiAgICAgICAgQCRlbC5vbiAnY2xpY2snLCAnbGkucGFyaycsIEBoYW5kbGVMb2dvSW50ZXJhY3Rpb25cbiAgICAgICAgXG4gICAgICAgIEBwYXJrTG9nb3MuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgbG9nb0V2ZW50cyA9IG5ldyBIYW1tZXIodClcbiAgICAgICAgICAgIGxvZ29FdmVudHMub24gJ3RhcCcgLCBAaGFuZGxlTG9nb0ludGVyYWN0aW9uXG5cbiAgICBoYW5kbGVMb2dvSW50ZXJhY3Rpb246IChlKSA9PlxuICAgICAgICBpZiBAcGFnZSA9PSAnYWNjb21tb2RhdGlvbidcbiAgICAgICAgICAgIEBwYXJrTG9nb3MucmVtb3ZlQ2xhc3MgJ3NlbGVjdGVkJ1xuICAgICAgICAgICAgJChlLnRhcmdldCkucGFyZW50cygnbGkucGFyaycpLmFkZENsYXNzICdzZWxlY3RlZCdcbiAgICAgICAgICAgIHdoaWNoUGFyayA9ICQoZS50YXJnZXQpLnBhcmVudHMoJ2xpLnBhcmsnKS5hdHRyKCdpZCcpXG4gICAgICAgICAgICBAc2hvd05ld0FjY29tbW9kYXRpb25zKHdoaWNoUGFyaylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBcbiAgICAgICAgJHRhcmdldCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ2xpJylcblxuICAgICAgICBpZCA9ICR0YXJnZXQuZGF0YSgnaWQnKVxuICAgICAgICBcbiAgICAgICAgQGRpc3BsYXlDb250ZW50IGlkXG4gICAgICAgIFxuICAgICAgICBcbiAgICBzaG93TmV3QWNjb21tb2RhdGlvbnM6IChwYXJrKSA9PlxuICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuc3dpcGVyLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IC5jYXJvdXNlbC13cmFwcGVyJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXJbZGF0YS1sb2dvPVwiJyArIHBhcmsgKyAnXCJdJykuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXJbZGF0YS1sb2dvPVwiJyArIHBhcmsgKyAnXCJdJykucGFyZW50KCkuYWRkQ2xhc3MgJ2FjdGl2ZSdcblxuICAgIGRpc3BsYXlDb250ZW50OiAoaWQpIC0+XG5cblxuICAgICAgICBAc2VsZWN0TG9nbyhpZClcblxuICAgICAgICAjU3dpdGNoIEluZm8gQm94ZXNcbiAgICAgICAgQGdhbGxlcnkuZ290byhpZClcblxuXG4gICAgc2VsZWN0TG9nbzogKGlkKSA9PlxuICAgICAgICBsb2dvSWQgPSBcIiMje2lkfS1sb2dvXCJcbiAgICAgICAgQHBhcmtMb2dvcy5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgICBAcGFya0xvZ29zLmZpbHRlcihsb2dvSWQpLmFkZENsYXNzKCdzZWxlY3RlZCcpXG5cblxuICAgIHNlbGVjdGVkTG9nbzogLT5cbiAgICAgICAgcmV0dXJuIEBwYXJrTG9nb3MucGFyZW50KCkuZmluZCgnbGkuc2VsZWN0ZWQnKS5kYXRhKCdpZCcpO1xuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFya3NMaXN0XG5cbiIsIlBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblxuY2xhc3MgUmVzaXplQnV0dG9ucyBleHRlbmRzIFBsdWdpbkJhc2VcblxuICAgIGNvbnN0cnVjdG9yOiAtPlxuICAgICAgICBAcmVzaXplQnV0dG9ucygpXG5cbiAgICByZXNpemVCdXR0b25zOiAtPlxuICAgICAgICBjID0gJCgnI2NvbnRlbnQnKVxuICAgICAgICBidG5fd3JhcHBlcnMgPSBjLmZpbmQgJy5idG4td3JhcHBlcidcblxuICAgICAgICBmb3IgYnRuX3dyYXBwZXIgaW4gYnRuX3dyYXBwZXJzXG4gICAgICAgICAgICBidG5zID0gJChidG5fd3JhcHBlcikuZmluZCAnYSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgYnRucy5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgbWF4V2lkdGggPSAwXG4gICAgICAgICAgICAgICAgd2lkZXN0U3BhbiA9IG51bGxcblxuICAgICAgICAgICAgICAgICQoYnRucykuZWFjaCAtPlxuICAgICAgICAgICAgICAgICAgICBpZiAkKHRoaXMpLndpZHRoKCkgPiBtYXhXaWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF4V2lkdGggPSAkKHRoaXMpLndpZHRoKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGVzdFNwYW4gPSAkKHRoaXMpXG5cbiAgICAgICAgICAgICAgICAkKGJ0bnMpLmVhY2ggLT5cbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5jc3Moe3dpZHRoOiBtYXhXaWR0aCArIDYwfSlcblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc2l6ZUJ1dHRvbnMiLCJjbGFzcyBTdmdJbmplY3RcblxuICAgIGNvbnN0cnVjdG9yOiAoc2VsZWN0b3IpIC0+XG4gICAgICAgIFxuICAgICAgICBAJHN2Z3MgPSAkKHNlbGVjdG9yKVxuICAgICAgICBcbiAgICAgICAgQHByZWxvYWRlciA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUgdHJ1ZSAsIFwiXCIgLCB0cnVlXG4gICAgICAgIEBwcmVsb2FkZXIuc2V0TWF4Q29ubmVjdGlvbnMoMTApXG4gICAgICAgIEBwcmVsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lciAnZmlsZWxvYWQnICwgQG9uU3ZnTG9hZGVkXG4gICAgICAgIEBwcmVsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uTG9hZENvbXBsZXRlXG4gICAgICAgIEBtYW5pZmVzdCA9IFtdXG4gICAgICAgIEBjb2xsZWN0U3ZnVXJscygpXG4gICAgICAgIEBsb2FkU3ZncygpXG4gICAgICAgIFxuICAgIGNvbGxlY3RTdmdVcmxzOiAtPlxuICAgICAgICBcbiAgICAgICAgc2VsZiA9IEBcbiAgICAgICAgXG4gICAgICAgIEAkc3Zncy5lYWNoIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlkID0gXCJzdmctaW5qZWN0LSN7cGFyc2VJbnQoTWF0aC5yYW5kb20oKSAqIDEwMDApLnRvU3RyaW5nKCl9XCJcbiAgICAgICAgICBcbiAgICAgICAgICAgICQoQCkuYXR0cignaWQnLCBpZClcbiAgICAgICAgICAgICQoQCkuYXR0cignZGF0YS1hcmInICwgXCJhYmMxMjNcIilcbiAgICAgICAgICAgIHN2Z1VybCA9ICQoQCkuYXR0cignc3JjJylcbiAgICAgICAgICAgIFxuICAgICAgICAgICBcblxuICAgICAgICAgICAgc2VsZi5tYW5pZmVzdC5wdXNoIFxuICAgICAgICAgICAgICAgIGlkOmlkXG4gICAgICAgICAgICAgICAgc3JjOnN2Z1VybFxuICAgICAgICAgICAgICAgIFxuICAgIGxvYWRTdmdzOiAtPlxuICAgICAgICBcbiAgICAgICAgQHByZWxvYWRlci5sb2FkTWFuaWZlc3QoQG1hbmlmZXN0KVxuICAgICAgICAgICAgICAgIFxuICAgIFxuICAgIGluamVjdFN2ZzogKGlkLHN2Z0RhdGEpIC0+XG4gICAgICAgIFxuICAgICAgICAkZWwgPSAkKFwiIyN7aWR9XCIpICAgIFxuIFxuIFxuICAgICAgICBpbWdJRCA9ICRlbC5hdHRyKCdpZCcpXG4gICAgICAgIGltZ0NsYXNzID0gJGVsLmF0dHIoJ2NsYXNzJylcbiAgICAgICAgaW1nRGF0YSA9ICRlbC5jbG9uZSh0cnVlKS5kYXRhKCkgb3IgW11cbiAgICAgICAgZGltZW5zaW9ucyA9IFxuICAgICAgICAgICAgdzogJGVsLmF0dHIoJ3dpZHRoJylcbiAgICAgICAgICAgIGg6ICRlbC5hdHRyKCdoZWlnaHQnKVxuXG4gICAgICAgIHN2ZyA9ICQoc3ZnRGF0YSkuZmlsdGVyKCdzdmcnKVxuICAgICAgICBcblxuICAgICAgICBzdmcgPSBzdmcuYXR0cihcImlkXCIsIGltZ0lEKSAgaWYgdHlwZW9mIGltZ0lEIGlzbnQgJ3VuZGVmaW5lZCdcbiAgICAgICAgaWYgdHlwZW9mIGltZ0NsYXNzIGlzbnQgJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgIGNscyA9IChpZiAoc3ZnLmF0dHIoXCJjbGFzc1wiKSBpc250ICd1bmRlZmluZWQnKSB0aGVuIHN2Zy5hdHRyKFwiY2xhc3NcIikgZWxzZSBcIlwiKVxuICAgICAgICAgICAgc3ZnID0gc3ZnLmF0dHIoXCJjbGFzc1wiLCBpbWdDbGFzcyArIFwiIFwiICsgY2xzICsgXCIgcmVwbGFjZWQtc3ZnXCIpXG4gICAgICAgIFxuICAgICAgICAjIGNvcHkgYWxsIHRoZSBkYXRhIGVsZW1lbnRzIGZyb20gdGhlIGltZyB0byB0aGUgc3ZnXG4gICAgICAgICQuZWFjaCBpbWdEYXRhLCAobmFtZSwgdmFsdWUpIC0+ICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBzdmdbMF0uc2V0QXR0cmlidXRlIFwiZGF0YS1cIiArIG5hbWUsIHZhbHVlXG4gICAgICAgICAgICByZXR1cm4gICAgICAgIFxuICAgICAgICBzdmcgPSBzdmcucmVtb3ZlQXR0cihcInhtbG5zOmFcIilcbiAgICAgICAgXG4gICAgICAgICNHZXQgb3JpZ2luYWwgZGltZW5zaW9ucyBvZiBTVkcgZmlsZSB0byB1c2UgYXMgZm91bmRhdGlvbiBmb3Igc2NhbGluZyBiYXNlZCBvbiBpbWcgdGFnIGRpbWVuc2lvbnNcbiAgICAgICAgb3cgPSBwYXJzZUZsb2F0KHN2Zy5hdHRyKFwid2lkdGhcIikpXG4gICAgICAgIG9oID0gcGFyc2VGbG9hdChzdmcuYXR0cihcImhlaWdodFwiKSlcbiAgICAgICAgXG4gICAgICAgICNTY2FsZSBhYnNvbHV0ZWx5IGlmIGJvdGggd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzIGV4aXN0XG4gICAgICAgIGlmIGRpbWVuc2lvbnMudyBhbmQgZGltZW5zaW9ucy5oXG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcIndpZHRoXCIsIGRpbWVuc2lvbnMud1xuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJoZWlnaHRcIiwgZGltZW5zaW9ucy5oXG4gICAgICAgIFxuICAgICAgICAjU2NhbGUgcHJvcG9ydGlvbmFsbHkgYmFzZWQgb24gd2lkdGhcbiAgICAgICAgZWxzZSBpZiBkaW1lbnNpb25zLndcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwid2lkdGhcIiwgZGltZW5zaW9ucy53XG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcImhlaWdodFwiLCAob2ggLyBvdykgKiBkaW1lbnNpb25zLndcbiAgICAgICAgXG4gICAgICAgICNTY2FsZSBwcm9wb3J0aW9uYWxseSBiYXNlZCBvbiBoZWlnaHRcbiAgICAgICAgZWxzZSBpZiBkaW1lbnNpb25zLmhcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwiaGVpZ2h0XCIsIGRpbWVuc2lvbnMuaFxuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJ3aWR0aFwiLCAob3cgLyBvaCkgKiBkaW1lbnNpb25zLmhcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAkZWwucmVwbGFjZVdpdGggc3ZnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgb25TdmdMb2FkZWQ6IChlKSA9PlxuICAgICAgICBcbiAgICAgICAgQGluamVjdFN2ZyhlLml0ZW0uaWQsIGUucmF3UmVzdWx0KVxuICAgIFxuICAgIG9uTG9hZENvbXBsZXRlOiAoZSkgPT5cbiAgICBcbiAgICBcbiAgICBcbiAgICBcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gU3ZnSW5qZWN0ICIsIlxuXG5jbGFzcyBWaWRlb092ZXJsYXlcblxuXG5cbiAgICBjb25zdHJ1Y3RvcjogKGVsKSAtPlxuICAgICAgICBAJGVsID0gJChlbClcbiAgICAgICAgQCRpbm5lciA9IEAkZWwuZmluZChcIi5vdmVybGF5LWlubmVyXCIpXG4gICAgICAgIEAkY29udGFpbmVyID0gQCRlbC5maW5kKFwiLm92ZXJsYXktaW5uZXItY29udGFpbmVyXCIpXG4gICAgICAgIFxuICAgICAgICBpZiAoQCRjb250YWluZXIuZmluZCgnLm92ZXJsYXktY29udGVudCcpLnNpemUoKSBpcyAxKSBcbiAgICAgICAgICAgIEAkY29udGFpbmVyID0gQCRjb250YWluZXIuZmluZCgnLm92ZXJsYXktY29udGVudCcpXG4gICAgICAgICAgICBcbiAgICAgICAgQCRjbG9zZSA9IEAkZWwuZmluZChcIi5vdmVybGF5LWNsb3NlXCIpXG4gICAgICAgIFxuXG4gICAgICAgIEBjcmVhdGVWaWRlb0luc3RhbmNlKClcbiAgICAgICAgQGNyZWF0ZU92ZXJsYXlUcmFuc2l0aW9uKClcbiAgICAgICAgQGFkZEV2ZW50cygpXG5cblxuXG4gICAgY3JlYXRlT3ZlcmxheVRyYW5zaXRpb246IC0+XG4gICAgICAgIEB0bCA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgICAgIEAkZWwuc2hvdygpXG5cbiAgICAgICAgQHRsLmFkZCBUd2Vlbk1heC5mcm9tVG8gJCgnI292ZXJsYXknKSwgLjAxLFxuICAgICAgICAgICAge3pJbmRleDogLTEsIGRpc3BsYXk6J25vbmUnLCB6OiAwfSwge3pJbmRleDogNTAwMCwgZGlzcGxheTonYmxvY2snLCB6OiA5OTk5OTk5OTk5fVxuICAgICAgICBcbiAgICAgICAgQHRsLmFkZCBUd2Vlbk1heC50byBAJGVsICwgLjM1ICxcbiAgICAgICAgICAgIGF1dG9BbHBoYToxXG5cbiAgICAgICAgQHRsLmFkZCBUd2Vlbk1heC50byBAJGlubmVyICwgLjU1ICxcbiAgICAgICAgICAgIGFscGhhOjFcblxuICAgICAgICBAdGwuYWRkIFR3ZWVuTWF4LnRvIEAkY2xvc2UgLCAuMjUgLFxuICAgICAgICAgICAgYWxwaGE6MVxuICAgICAgICAsXG4gICAgICAgICAgICBcIi09LjE1XCJcblxuICAgICAgICBAdGwuYWRkTGFiZWwoXCJpbml0Q29udGVudFwiKVxuXG4gICAgICAgIEB0bC5zdG9wKClcblxuICAgIGNyZWF0ZVZpZGVvSW5zdGFuY2U6ICgpIC0+XG5cblxuXG4gICAgYWRkRXZlbnRzOiAtPlxuICAgICAgICBAY2xvc2VFdmVudCA9IG5ldyBIYW1tZXIoQCRjbG9zZVswXSlcblxuXG5cbiAgICB0cmFuc2l0aW9uSW5PdmVybGF5OiAobmV4dCkgLT5cbiAgICAgICAgY29uc29sZS5sb2cgJ3RyYW5zaXRpb25Jbk92ZXJsYXknXG4gICAgICAgIEB0cmFuc0luQ2IgPSBuZXh0XG4gICAgICAgIEB0bC5hZGRDYWxsYmFjayhAdHJhbnNJbkNiLCBcImluaXRDb250ZW50XCIpXG4gICAgICAgIEB0bC5wbGF5KClcbiAgICAgICAgQGNsb3NlRXZlbnQub24gJ3RhcCcgLCBAY2xvc2VPdmVybGF5XG5cbiAgICB0cmFuc2l0aW9uT3V0T3ZlcmxheTogLT5cbiAgICAgICAgY29uc29sZS5sb2cgJ3RyYW5zaXRpb25PdXRPdmVybGF5J1xuICAgICAgICBAY2xvc2VFdmVudC5vZmYgJ3RhcCcgLCBAY2xvc2VPdmVybGF5XG4gICAgICAgIEB0bC5yZW1vdmVDYWxsYmFjayhAdHJhbnNJbkNiKVxuICAgICAgICBAdGwucmV2ZXJzZSgpXG4gICAgICAgIGRlbGV0ZSBAdHJhbnNJbkNiXG5cblxuICAgIGNsb3NlT3ZlcmxheTogKGUpID0+XG4gICAgICAgIEByZW1vdmVWaWRlbygpXG4gICAgICAgIEB0cmFuc2l0aW9uT3V0T3ZlcmxheSgpXG5cblxuICAgIHJlbW92ZVZpZGVvOiAoKSAtPlxuICAgICAgICBpZiBAdmlkZW9JbnN0YW5jZVxuICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UucGF1c2UoKVxuICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UuY3VycmVudFRpbWUoMClcbiAgICAgICAgICAgICNAdmlkZW9JbnN0YW5jZS5kaXNwb3NlKClcblxuICAgIHJlc2l6ZU92ZXJsYXk6ICgpIC0+XG4gICAgICAgICR2aWQgPSBAJGVsLmZpbmQoJ3ZpZGVvJylcbiAgICAgICAgJHcgPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgICAgICAkaCA9ICR2aWQuaGVpZ2h0KClcblxuICAgICAgICAjIEAkaW5uZXIuY3NzIHt3aWR0aDogJHcsIGhlaWdodDogJGh9XG4gICAgICAgICMgJHZpZC5jc3Mge2hlaWdodDogMTAwICsgJyUnLCB3aWR0aDogMTAwICsgJyUnfVxuXG4gICAgYXBwZW5kRGF0YTogKGRhdGEpIC0+XG4gICAgICAgIGlmIGRhdGEubXA0ID09IFwiXCIgb3IgISBkYXRhLm1wND9cbiAgICAgICAgICAgIGNvbnNvbGUubG9nICdubyB2aWRlbywgaXRzIGFuIGltYWdlJ1xuICAgICAgICAgICAgQHBvc3RlciA9ICQoXCI8ZGl2IGNsYXNzPSd2aWRlby1qcyc+PGltZyBjbGFzcz0ndmpzLXRlY2gnIHNyYz0nXCIgKyBkYXRhLnBvc3RlciArIFwiJyBjbGFzcz0nbWVkaWEtaW1hZ2UtcG9zdGVyJyAvPjwvZGl2PlwiKVxuICAgICAgICAgICAgQCRjb250YWluZXIuaHRtbCBAcG9zdGVyXG4gICAgICAgICAgICBAcG9zdGVyLmNzcyAnaGVpZ2h0JywgJzEwMCUnXG4gICAgICAgICAgICBAcmVtb3ZlVmlkZW8oKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgbXA0ID0gJChcIjxzb3VyY2Ugc3JjPVxcXCIje2RhdGEubXA0fVxcXCIgdHlwZT1cXFwidmlkZW8vbXA0XFxcIiAvPiBcIilcbiAgICAgICAgd2VibSA9ICQoXCI8c291cmNlIHNyYz1cXFwiI3tkYXRhLndlYm19XFxcIiB0eXBlPVxcXCJ2aWRlby93ZWJtXFxcIiAvPiBcIilcblxuICAgICAgICBAJHZpZGVvRWwgPSAkKFwiPHZpZGVvIGlkPSdvdmVybGF5LXBsYXllcicgY2xhc3M9J3Zqcy1kZWZhdWx0LXNraW4gdmlkZW8tanMnIGNvbnRyb2xzIHByZWxvYWQ9J2F1dG8nIC8+XCIpXG4gICAgICAgIEAkdmlkZW9FbC5hcHBlbmQobXA0KVxuICAgICAgICBAJHZpZGVvRWwuYXBwZW5kKHdlYm0pXG4gICAgICAgIEAkY29udGFpbmVyLmh0bWwgQCR2aWRlb0VsXG5cbiAgICAgICAgaWYgQHZpZGVvSW5zdGFuY2U/XG4gICAgICAgICAgICBAdmlkZW9JbnN0YW5jZS5kaXNwb3NlKClcbiAgICAgICAgQHZpZGVvSW5zdGFuY2UgPSB2aWRlb2pzIFwib3ZlcmxheS1wbGF5ZXJcIiAgLFxuICAgICAgICAgICAgd2lkdGg6XCIxMDAlXCJcbiAgICAgICAgICAgIGhlaWdodDpcIjEwMCVcIlxuXG5cblxuXG4gICAgcGxheVZpZGVvOiAoKSA9PlxuIyAgICAgICAgaWYoISQoXCJodG1sXCIpLmhhc0NsYXNzKCdtb2JpbGUnKSlcbiMgICAgICAgICAgICBAdmlkZW9JbnN0YW5jZS5wbGF5KClcbiAgICAgICAgaWYgQHZpZGVvSW5zdGFuY2U/XG4gICAgICAgICAgICBAdmlkZW9JbnN0YW5jZS5wbGF5KClcbiAgICAgICAgICAgIFxuICAgIHNob3dJbWFnZTogKCkgPT5cbiAgICAgICAgY29uc29sZS5sb2cgJ3Nob3dJbWFnZSdcblxuXG5cbm92ZXJsYXkgPSBuZXcgVmlkZW9PdmVybGF5IFwiI292ZXJsYXlcIlxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzLmluaXRWaWRlb092ZXJsYXkgPSAoZGF0YSkgLT5cbiAgICBjb25zb2xlLmxvZyAnZGF0YTI6ICcsIGRhdGFcbiAgICBvdmVybGF5LmFwcGVuZERhdGEoZGF0YSlcblxuXG4gICAgaWYgIShkYXRhLm1wNCA9PSBcIlwiKVxuICAgICAgICBjb25zb2xlLmxvZyAnZGF0YS5tcDQgIT09IFwiXCInXG4gICAgICAgIG92ZXJsYXkudHJhbnNpdGlvbkluT3ZlcmxheShvdmVybGF5LnBsYXlWaWRlbylcbiAgICBlbHNlXG4gICAgICAgIGNvbnNvbGUubG9nICdkYXRhLm1wNCA9PT0gXCJcIidcbiAgICAgICAgb3ZlcmxheS50cmFuc2l0aW9uSW5PdmVybGF5KG92ZXJsYXkuc2hvd0ltYWdlKVxuXG5cblxuXG5cblxuXG5cblxuXG5cbiIsIlBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi8uLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcbkZyYW1lc01vZGVsID0gcmVxdWlyZSAnLi9GcmFtZXNNb2RlbC5jb2ZmZWUnXG5cbm1hdGNoRnJhbWVOdW0gPSAvXFxkKyg/PVxcLlthLXpBLVpdKykvXG5cbmNsYXNzIEZyYW1lQW5pbWF0aW9uIGV4dGVuZHMgUGx1Z2luQmFzZVxuICAgIFxuICAgIFxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgXG4gICAgICAgIEAkZWwgPSAkKG9wdHMuZWwpXG4gICAgICAgIEBhc3luYyA9IG9wdHMuYXN5bmMgb3IgZmFsc2VcbiAgICAgICAgZGVwdGg9IG9wdHMuZGVwdGggb3IgMVxuICAgICAgICBAJGNvbnRhaW5lciA9ICQoXCI8ZGl2IGNsYXNzPSdjb2FzdGVyLWNvbnRhaW5lcicgLz5cIilcbiAgICAgICAgQCRjb250YWluZXIuYXR0cignaWQnICwgb3B0cy5pZClcbiAgICAgICAgQCRjb250YWluZXIuY3NzKCd6LWluZGV4JywgZGVwdGgpXG4gICAgICAgIFR3ZWVuTWF4LnNldCBAJGNvbnRhaW5lciAsIFxuICAgICAgICAgICAgejpkZXB0aCAqIDEwXG4gICAgICAgIFxuICAgICAgICBzdXBlcihvcHRzKVxuICAgICAgICBcbiAgICAgICAgXG4gICAgXG4gICAgaW5pdGlhbGl6ZTogKG9wdHMpIC0+XG4gICAgICAgIHN1cGVyKG9wdHMpXG4gICAgICAgIFxuICAgICAgICBAbW9kZWwgPSBuZXcgRnJhbWVzTW9kZWwgb3B0c1xuICAgICAgICBAbW9kZWwub24gXCJkYXRhTG9hZGVkXCIgLCBAc2V0dXBDYW52YXNcbiAgICAgICAgQG1vZGVsLm9uIFwidHJhY2tMb2FkZWRcIiAsIEBvblRyYWNrTG9hZGVkXG4gICAgICAgIEBtb2RlbC5vbiBcImZyYW1lc0xvYWRlZFwiICwgQG9uRnJhbWVzTG9hZGVkXG4gICAgICAgIEBtb2RlbC5sb2FkRGF0YSgpXG4gICAgICAgIFxuICAgXG4gICAgICAgXG4gICAgbG9hZEZyYW1lczogLT5cbiAgICAgICAgaWYgQG1vZGVsLmRhdGE/XG4gICAgICAgICAgICBAbW9kZWwucHJlbG9hZEZyYW1lcygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBkZWZlckxvYWRpbmcgPSB0cnVlXG4gICAgICAgIFxuICAgIFxuICAgIFxuICAgIHNldHVwQ2FudmFzOiA9PlxuICAgICAgICBcblxuICAgICAgICBAY2FudmFzV2lkdGggPSBAbW9kZWwuZ2V0KCdnbG9iYWwnKS53aWR0aFxuICAgICAgICBAY2FudmFzSGVpZ2h0ID0gQG1vZGVsLmdldCgnZ2xvYmFsJykuaGVpZ2h0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpXG4gICAgICAgIEBjb250ZXh0ID0gQGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG4gICAgICAgIFxuICAgICAgICBAY2FudmFzLnNldEF0dHJpYnV0ZSgnd2lkdGgnICwgQGNhbnZhc1dpZHRoKVxuICAgICAgICBAY2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JyAsIEBjYW52YXNIZWlnaHQpXG5cbiAgICAgICAgXG4gICAgICAgIEAkY29udGFpbmVyLmFwcGVuZChAY2FudmFzKVxuICAgICAgICBAJGVsLnByZXBlbmQoQCRjb250YWluZXIpXG4gICAgICAgIEBtb2RlbC5wcmVsb2FkVHJhY2soKVxuICAgICAgICBpZiBAZGVmZXJMb2FkaW5nXG4gICAgICAgICAgICBAbW9kZWwucHJlbG9hZEZyYW1lcygpXG4gICAgICBcbiAgICBcbiAgICBkaXNwbGF5VHJhY2s6IC0+XG4gICAgICAgIFxuICAgICAgICBAY29udGV4dC5jbGVhclJlY3QgMCAsIDAgLCBAY2FudmFzV2lkdGggLCBAY2FudmFzSGVpZ2h0XG4gICAgICAgIEBjb250ZXh0LmRyYXdJbWFnZSBAdHJhY2tJbWFnZS50YWcgLCAwICwwICwgQGNhbnZhc1dpZHRoICwgQGNhbnZhc0hlaWdodFxuICAgICAgICBcbiAgICBkaXNwbGF5RnJhbWU6IChudW0pIC0+XG4gICAgICAgIFxuICAgICAgICBtYW5pZmVzdCA9IEBtb2RlbC5nZXQoJ21hbmlmZXN0JylcbiAgICAgICAgXG4gICAgICAgIGlmIG1hbmlmZXN0Lmxlbmd0aCA+IG51bVxuICAgICAgICAgICAgYXNzZXQgPSBtYW5pZmVzdFtudW1dIFxuICAgICAgICAgICAgZnJhbWVBc3NldCA9IEBtb2RlbC5nZXRBc3NldChhc3NldC5maWxlbmFtZSlcbiAgICAgICAgICAgICMgY29uc29sZS5sb2cgZnJhbWVBc3NldC50YWcgLCBhc3NldC54ICwgYXNzZXQueSwgYXNzZXQud2lkdGgsIGFzc2V0LmhlaWdodFxuICAgICAgICAgICAgQGNvbnRleHQuZHJhd0ltYWdlIGZyYW1lQXNzZXQudGFnICwgYXNzZXQueCAsIGFzc2V0LnksIGFzc2V0LndpZHRoLCBhc3NldC5oZWlnaHRcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIGluaXRBbmltYXRpb246IC0+XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgZnJhbWVzID0gQG1vZGVsLmdldCgnbWFuaWZlc3QnKS5sZW5ndGhcbiAgICAgICAgc3BlZWQgPSBAbW9kZWwuZ2V0KCdnbG9iYWwnKS5mcHNcbiAgICAgICAgZGVsYXkgPSBAbW9kZWwuZ2V0KCdnbG9iYWwnKS5kZWxheSBvciAwXG4gICAgICAgIHJlcGVhdERlbGF5ID0gQG1vZGVsLmdldCgnZ2xvYmFsJykucmVwZWF0RGVsYXkgb3IgMTBcbiAgICAgICAgXG4gICAgXG5cbiAgICAgICAgZHVyYXRpb24gPSAgZnJhbWVzIC8gc3BlZWRcblxuXG4gICAgICAgIHNlbGYgPSBAIFxuICAgICAgICBAbGFzdEZyYW1lTnVtID0gLTFcbiAgICAgICAgQHRpbWVsaW5lID0gd2luZG93LmNvYXN0ZXIgPSBUd2Vlbk1heC50byBAY2FudmFzICwgZHVyYXRpb24gLCBcbiAgICAgICAgICAgIG9uVXBkYXRlOiAtPlxuICAgICAgICAgICAgICAgIGZyYW1lTnVtID0gTWF0aC5mbG9vcihmcmFtZXMgKiBAcHJvZ3Jlc3MoKSkgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgZnJhbWVOdW0gaXNudCBAbGFzdEZyYW1lTnVtICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzZWxmLmRpc3BsYXlUcmFjaygpXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGlzcGxheUZyYW1lKGZyYW1lTnVtKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAbGFzdEZyYW1lTnVtID0gZnJhbWVOdW1cbiAgICAgICAgICAgIHJlcGVhdDotMVxuICAgICAgICAgICAgcmVwZWF0RGVsYXk6IHJlcGVhdERlbGF5XG4gICAgICAgICAgICBkZWxheTpkZWxheVxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcblxuICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICBcbiAgICBvblRyYWNrTG9hZGVkOiA9PlxuXG4gICAgICAgIEB0cmFja0ltYWdlID0gQG1vZGVsLmdldEFzc2V0KCd0cmFjaycpXG4gICAgICAgIEBkaXNwbGF5VHJhY2soKVxuICAgICAgICBcblxuICAgIG9uRnJhbWVzTG9hZGVkOiA9PlxuICAgICAgICBpZiB0eXBlb2YgQGFzeW5jIGlzICdmdW5jdGlvbidcbiAgICAgICAgICAgIEBhc3luYygpXG4gICAgICAgICQod2luZG93KS5vbiAnc2Nyb2xsJywgIEBjaGVja0NvYXN0ZXJWaXNpYmlsaXR5XG4gICAgICAgIEBjaGVja0NvYXN0ZXJWaXNpYmlsaXR5KClcbiAgICBcbiAgICAgICAgXG4gICAgY2hlY2tDb2FzdGVyVmlzaWJpbGl0eTogPT5cbiAgICAgICAgXG4gICAgICAgIGlmKEBpblZpZXdwb3J0KCkpXG5cbiAgICAgICAgICAgICQod2luZG93KS5vZmYgJ3Njcm9sbCcsICBAY2hlY2tDb2FzdGVyVmlzaWJpbGl0eVxuICAgICAgICAgICAgQGluaXRBbmltYXRpb24oKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgaW5WaWV3cG9ydDogPT5cbiAgICAgICAgXG4gICAgICAgIHRvcCA9IEAkY29udGFpbmVyLm9mZnNldCgpLnRvcFxuICAgICAgICBoZWlnaHQgPSBAJGNvbnRhaW5lci5maW5kKCdjYW52YXMnKS5maXJzdCgpLmhlaWdodCgpXG4gICAgICAgIGJvdHRvbSA9IHRvcCArIGhlaWdodFxuICAgICAgICBcbiAgICAgICAgc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpXG4gICAgICAgIHNjcm9sbEJvdHRvbSA9ICQod2luZG93KS5zY3JvbGxUb3AoKSArICQod2luZG93KS5oZWlnaHQoKVxuXG4gICAgICAgIGlmIHNjcm9sbFRvcCA8PSB0b3AgPD0gc2Nyb2xsQm90dG9tXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIFxuIFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZyYW1lQW5pbWF0aW9uXG4iLCJcblxubWF0Y2hGcmFtZU51bSA9IC9cXGQrKD89XFwuW2EtekEtWl0rKS9cblxuY2xhc3MgRnJhbWVzTW9kZWwgZXh0ZW5kcyBFdmVudEVtaXR0ZXJcblxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBAYmFzZVVybCA9IG9wdHMuYmFzZVVybFxuICAgICAgICBAdXJsID0gb3B0cy51cmxcbiAgICAgICAgQGxvYWRNYW5pZmVzdCA9IFtdO1xuICAgICAgICBAdHJhY2tNYW5pZmVzdCA9IFtdO1xuICAgICAgICBAaW5pdExvYWRlcigpXG4gICAgICAgIHN1cGVyKG9wdHMpXG4gICAgICAgIFxuXG4gICAgbG9hZERhdGE6IC0+XG4gICAgICAgICQuYWpheFxuICAgICAgICAgICAgdXJsOiBAYmFzZVVybCAgKyBAdXJsXG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCJcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgICAgc3VjY2VzczogQG9uRGF0YUxvYWRlZFxuICAgICAgICAgICAgZXJyb3I6IEBoYW5kbGVFcnJvclxuXG4gICAgaGFuZGxlRXJyb3I6IChlcnIpIC0+XG4gICAgICAgIHRocm93IGVyclxuXG4gICAgb25EYXRhTG9hZGVkOiAoZGF0YSkgPT5cbiAgICAgICAgXG4gICAgICAgIEBkYXRhID0gZGF0YVxuICAgICAgICBAdHJhbnNmb3JtRGF0YSgpXG4gICAgICAgIEBlbWl0IFwiZGF0YUxvYWRlZFwiXG4gICAgICBcblxuICAgIHNvcnRTZXF1ZW5jZTogKGEsYikgLT5cbiAgICAgICAgYUZyYW1lID0gbWF0Y2hGcmFtZU51bS5leGVjKGEuZmlsZW5hbWUpXG4gICAgICAgIGJGcmFtZSA9IG1hdGNoRnJhbWVOdW0uZXhlYyhiLmZpbGVuYW1lKVxuICAgICAgICByZXR1cm4gaWYgcGFyc2VJbnQoYUZyYW1lWzBdKSA8IHBhcnNlSW50KGJGcmFtZVswXSkgdGhlbiAtMSBlbHNlIDFcblxuICAgIHRyYW5zZm9ybURhdGE6IC0+XG4gICAgICAgIEBkYXRhLm1hbmlmZXN0LnNvcnQgQHNvcnRTZXF1ZW5jZVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEB0cmFja01hbmlmZXN0LnB1c2hcbiAgICAgICAgICAgIGlkOlwidHJhY2tcIlxuICAgICAgICAgICAgc3JjOiBcIiN7QGRhdGEuZ2xvYmFsLmZvbGRlcn0vI3tAZGF0YS5nbG9iYWwudHJhY2t9XCJcblxuICAgICAgICBmb3IgZnJhbWUgaW4gQGRhdGEubWFuaWZlc3RcbiAgICAgICAgICAgIGZyYW1lLnNyYyA9IFwiI3tAZGF0YS5nbG9iYWwuZm9sZGVyfS8je2ZyYW1lLmZpbGVuYW1lfVwiXG4gICAgICAgICAgICBAbG9hZE1hbmlmZXN0LnB1c2hcbiAgICAgICAgICAgICAgICBpZDogZnJhbWUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICBzcmM6IGZyYW1lLnNyY1xuXG4gICAgaW5pdExvYWRlcjogLT5cbiAgICAgICAgQHRyYWNrTG9hZGVyID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZSB0cnVlLCBAYmFzZVVybCwgdHJ1ZVxuICAgICAgICBAcHJlbG9hZGVyID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZSB0cnVlLCBAYmFzZVVybCwgdHJ1ZVxuICAgICAgICBAdHJhY2tMb2FkZXIuc2V0TWF4Q29ubmVjdGlvbnMoMTApXG4gICAgICAgIEBwcmVsb2FkZXIuc2V0TWF4Q29ubmVjdGlvbnMoMTUpXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgcHJlbG9hZFRyYWNrOiAtPlxuXG4gICAgICAgIEB0cmFja0xvYWRlci5hZGRFdmVudExpc3RlbmVyICdjb21wbGV0ZScgLCBAb25UcmFja0Fzc2V0c0NvbXBsZXRlXG4gICAgICAgIEB0cmFja0xvYWRlci5sb2FkTWFuaWZlc3QoQHRyYWNrTWFuaWZlc3QpXG4gICAgcHJlbG9hZEZyYW1lczogLT5cbiMgICAgICAgIGNvbnNvbGUubG9nIEBsb2FkTWFuaWZlc3RcbiAgICAgICAgXG4gICAgICAgIEBwcmVsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uQXNzZXRzQ29tcGxldGVcbiAgICAgICAgQHByZWxvYWRlci5sb2FkTWFuaWZlc3QoQGxvYWRNYW5pZmVzdClcblxuICAgIG9uVHJhY2tBc3NldHNDb21wbGV0ZTogKGUpID0+XG4gICAgICAgIFxuICAgICAgICBAdHJhY2tMb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uVHJhY2tBc3NldHNDb21wbGV0ZVxuICAgICAgICBAZW1pdCBcInRyYWNrTG9hZGVkXCJcblxuICAgIG9uQXNzZXRzQ29tcGxldGU6IChlKT0+XG4jICAgICAgICBjb25zb2xlLmxvZyBAcHJlbG9hZGVyXG4gICAgICAgIEBwcmVsb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uQXNzZXRzQ29tcGxldGVcbiAgICAgICAgQGVtaXQgXCJmcmFtZXNMb2FkZWRcIlxuXG5cblxuXG4gICAgZ2V0QXNzZXQ6IChpZCkgLT5cbiAgICAgICAgXG4gICAgICAgIGl0ZW0gPSAgQHByZWxvYWRlci5nZXRJdGVtIGlkXG4gICAgICAgIGlmICFpdGVtP1xuICAgICAgICAgICAgaXRlbSA9ICBAdHJhY2tMb2FkZXIuZ2V0SXRlbSBpZCAgICAgICAgXG4gICAgICAgIHJldHVybiBpdGVtXG5cbiAgICBnZXQ6IChrZXkpIC0+XG4gICAgICAgIGZvciBrLHYgb2YgQGRhdGFcbiAgICAgICAgICAgIGlmIGsgaXMga2V5XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZcblxuICAgIHNldDogKGtleSwgdmFsKSAtPlxuICAgICAgICBAZGF0YVtrZXldID0gdmFsXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBGcmFtZXNNb2RlbFxuIiwiXHJcblZpZXdCYXNlID0gcmVxdWlyZSBcIi4uL2Fic3RyYWN0L1ZpZXdCYXNlLmNvZmZlZVwiXHJcblxyXG5jbGFzcyBTY3JvbGxCYXIgZXh0ZW5kcyBWaWV3QmFzZVxyXG5cclxuICAgIHNjcm9sbGluZyA6IGZhbHNlXHJcbiAgICBvZmZzZXRZIDogMFxyXG4gICAgcG9zaXRpb24gOiAwXHJcbiAgICBoaWRlVGltZW91dDogMFxyXG5cclxuXHJcbiAgICBpbml0aWFsaXplOiAtPlxyXG4gICAgICAgIEBvblJlc2l6ZSgpXHJcbiAgICAgICAgQHNldEV2ZW50cygpXHJcblxyXG4gICAgICAgIGlmIHdpbmRvdy5pc1RpZXJUYWJsZXRcclxuICAgICAgICAgICAgQCRlbC5oaWRlKClcclxuXHJcblxyXG5cclxuICAgIHNldEV2ZW50czogPT5cclxuICAgICAgICBAZGVsZWdhdGVFdmVudHNcclxuICAgICAgICAgICAgXCJtb3VzZWRvd24gLmhhbmRsZVwiIDogXCJvbkhhbmRsZURvd25cIlxyXG4gICAgICAgICAgICAjXCJtb3VzZWVudGVyXCIgOiBcIm9uSGFuZGxlVXBcIlxyXG4gICAgICAgICAgICBcImNsaWNrIC5yYWlsXCIgOiBcIm9uUmFpbENsaWNrXCJcclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkub24gXCJtb3VzZXVwXCIgLCBAb25IYW5kbGVVcFxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uIFwibW91c2Vtb3ZlXCIgLCBAb25Nb3VzZU1vdmVcclxuXHJcblxyXG4gICAgICAgIFxyXG4gICAgdXBkYXRlSGFuZGxlOiAocG9zKSA9PlxyXG4gICAgICAgIEBwb3NpdGlvbiA9IHBvc1xyXG4gICAgICAgIEAkZWwuZmluZCgnLmhhbmRsZScpLmNzc1xyXG4gICAgICAgICAgICB0b3A6IEBwb3NpdGlvbiAqICgkKHdpbmRvdykuaGVpZ2h0KCkgLSBAJGVsLmZpbmQoXCIuaGFuZGxlXCIpLmhlaWdodCgpKVxyXG4gICAgICAgIEBzaG93U2Nyb2xsYmFyKClcclxuICAgICAgICBAaGlkZVNjcm9sbGJhcigpXHJcblxyXG4gICAgb25SYWlsQ2xpY2s6IChlKSA9PlxyXG4gICAgICAgIEBvZmZzZXRZID0gaWYgZS5vZmZzZXRZIGlzbnQgdW5kZWZpbmVkIHRoZW4gZS5vZmZzZXRZIGVsc2UgZS5vcmlnaW5hbEV2ZW50LmxheWVyWVxyXG4gICAgICAgIEBwb3NpdGlvbiA9IEBvZmZzZXRZIC8gJCh3aW5kb3cpLmhlaWdodCgpXHJcbiAgICAgICAgQHRyaWdnZXIgXCJjdXN0b21TY3JvbGxKdW1wXCIgLCBAcG9zaXRpb25cclxuICAgICAgICBcclxuXHJcblxyXG4gICAgb25IYW5kbGVEb3duOiAoZSkgPT5cclxuXHJcbiAgICAgICAgQCRlbC5jc3NcclxuICAgICAgICAgICAgd2lkdGg6XCIxMDAlXCJcclxuICAgICAgICBAb2Zmc2V0WSA9IGlmIGUub2Zmc2V0WSBpc250IHVuZGVmaW5lZCB0aGVuIGUub2Zmc2V0WSBlbHNlIGUub3JpZ2luYWxFdmVudC5sYXllcllcclxuICAgICAgICBAc2Nyb2xsaW5nID0gdHJ1ZVxyXG5cclxuICAgIG9uSGFuZGxlVXA6IChlKSA9PlxyXG4gICAgICAgIEAkZWwuY3NzXHJcbiAgICAgICAgICAgIHdpZHRoOlwiMTVweFwiXHJcblxyXG4gICAgICAgIEBzY3JvbGxpbmcgPSBmYWxzZVxyXG5cclxuICAgIG9uTW91c2VNb3ZlOiAoZSkgPT5cclxuICAgICAgICBpZiBAc2Nyb2xsaW5nXHJcblxyXG4gICAgICAgICAgICBpZiBlLnBhZ2VZIC0gQG9mZnNldFkgPD0gMFxyXG4gICAgICAgICAgICAgICAgJChcIi5oYW5kbGVcIikuY3NzXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAxXHJcbiAgICAgICAgICAgIGVsc2UgaWYgZS5wYWdlWSAtIEBvZmZzZXRZID49ICQod2luZG93KS5oZWlnaHQoKSAtICQoXCIjc2Nyb2xsYmFyIC5oYW5kbGVcIikuaGVpZ2h0KClcclxuICAgICAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgICAgICQoXCIuaGFuZGxlXCIpLmNzc1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogICAoJCh3aW5kb3cpLmhlaWdodCgpIC0gJChcIiNzY3JvbGxiYXIgLmhhbmRsZVwiKS5oZWlnaHQoKSkgLSAxXHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICQoXCIuaGFuZGxlXCIpLmNzc1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogZS5wYWdlWSAtIEBvZmZzZXRZXHJcblxyXG5cclxuICAgICAgICAgICAgQHBvc2l0aW9uID0gcGFyc2VJbnQoJChcIiNzY3JvbGxiYXIgLmhhbmRsZVwiKS5jc3MoXCJ0b3BcIikpIC8gKCQod2luZG93KS5oZWlnaHQoKSAtICQoXCIjc2Nyb2xsYmFyIC5oYW5kbGVcIikuaGVpZ2h0KCkpXHJcblxyXG4gICAgICAgICAgICBpZiBAcG9zaXRpb24gPCBwYXJzZUZsb2F0KC4wMDUpXHJcbiAgICAgICAgICAgICAgICBAcG9zaXRpb24gPSAwXHJcbiAgICAgICAgICAgIGVsc2UgaWYgQHBvc2l0aW9uID4gcGFyc2VGbG9hdCguOTk1KVxyXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uID0gMVxyXG5cclxuXHJcbiAgICAgICAgICAgIEB0cmlnZ2VyIFwiY3VzdG9tU2Nyb2xsXCIgLCBAcG9zaXRpb25cclxuICAgICAgICAgIFxyXG4gICBcclxuICAgICAgICBpZiBAbW91c2VYIGlzbnQgZS5jbGllbnRYIGFuZCBAbW91c2VZIGlzbnQgZS5jbGllbnRZXHJcbiAgICAgICAgICAgIEBzaG93U2Nyb2xsYmFyKClcclxuICAgICAgICAgICAgQGhpZGVTY3JvbGxiYXIoKVxyXG5cclxuICAgICAgICBAbW91c2VYID0gZS5jbGllbnRYXHJcbiAgICAgICAgQG1vdXNlWSA9IGUuY2xpZW50WVxyXG5cclxuICAgIG9uUmVzaXplOiAoZSkgPT5cclxuXHJcblxyXG4gICAgICAgIEAkZWwuZmluZCgnLmhhbmRsZScpLmNzc1xyXG4gICAgICAgICAgICBoZWlnaHQ6ICgkKHdpbmRvdykuaGVpZ2h0KCkgLyAkKFwic2VjdGlvblwiKS5oZWlnaHQoKSApICogJCh3aW5kb3cpLmhlaWdodCgpXHJcblxyXG4gICAgICAgIEB1cGRhdGVIYW5kbGUoQHBvc2l0aW9uKVxyXG5cclxuXHJcbiAgICBoaWRlU2Nyb2xsYmFyOiA9PlxyXG4gICAgICAgIGlmIEBoaWRlVGltZW91dD9cclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KEBoaWRlVGltZW91dClcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgQGhpZGVUaW1lb3V0ID0gc2V0VGltZW91dCAoPT5cclxuICAgICAgICAgICAgaWYgQG1vdXNlWSA+IDcyXHJcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC50byBAJGVsLCAuNSAsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV0b0FscGhhOiAwXHJcbiAgICAgICAgICAgICkgLCAyMDAwXHJcbiAgICAgICAgXHJcblxyXG4gICAgc2hvd1Njcm9sbGJhcjogPT5cclxuICAgICAgICBUd2Vlbk1heC50byBAJGVsICwgLjUgLFxyXG4gICAgICAgICAgICBhdXRvQWxwaGE6IC41XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2Nyb2xsQmFyIiwiXHJcblxyXG5jbGFzcyBTaGFyZXJcclxuXHJcbiAgICBcclxuICAgIFNoYXJlci5pbml0RmFjZWJvb2sgPSAtPlxyXG4gICAgICAgIEZCLmluaXQgXHJcbiAgICAgICAgICAgIGFwcElkOlwiMjE1MjI0NzA1MzA3MzQxXCJcclxuICAgICAgICAgICAgY2hhbm5lbFVybDpcIi9jaGFubmVsLmh0bWxcIlxyXG4gICAgICAgICAgICBzdGF0dXM6IHRydWVcclxuICAgICAgICAgICAgeGZibDogdHJ1ZVxyXG5cclxuXHJcbiAgICAgICAgXHJcbiAgICBcclxuICAgIFNoYXJlci5zaGFyZVR3aXR0ZXIgPSAoc2hhcmVNZXNzYWdlLCAgdXJsLCBoYXNodGFncykgLT5cclxuICAgICAgICB0ZXh0ID0gc2hhcmVNZXNzYWdlXHJcbiAgICAgICAgaGFzaHRhZ3MgPSBcIlwiXHJcbiAgICAgICAgdXJsID0gdXJsXHJcbiAgICAgICAgdHdVUkwgPSBcImh0dHBzOi8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0P3RleHQ9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodGV4dCkgKyBcIiZ1cmw9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodXJsKVxyXG4gICAgICAgIHN0ciArPSBcIiZoYXNodGFncz1cIiArIGhhc2h0YWdzICBpZiBoYXNodGFnc1xyXG4gICAgICAgIEBvcGVuUG9wdXAgNTc1LCA0MjAsIHR3VVJMLCBcIlR3aXR0ZXJcIlxyXG5cclxuICAgIFNoYXJlci5zaGFyZUZhY2Vib29rID0gKG5hbWUsICBjYXB0aW9uICxkZXNjcmlwdGlvbiAsIGxpbmsgLCBwaWN0dXJlKSAtPlxyXG5cclxuICAgICAgICBGQi51aVxyXG4gICAgICAgICAgICBtZXRob2Q6XCJmZWVkXCJcclxuICAgICAgICAgICAgbGluazpsaW5rXHJcbiAgICAgICAgICAgIHBpY3R1cmU6cGljdHVyZVxyXG4gICAgICAgICAgICBuYW1lOiBuYW1lXHJcbiAgICAgICAgICAgIGNhcHRpb246Y2FwdGlvblxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjpkZXNjcmlwdGlvblxyXG4gICAgICAgIFxyXG5cclxuICAgIFNoYXJlci5zaGFyZUdvb2dsZSA9ICh1cmwpIC0+XHJcblxyXG4gICAgICAgIEBvcGVuUG9wdXAgNjAwLCA0MDAgLCBcImh0dHBzOi8vcGx1cy5nb29nbGUuY29tL3NoYXJlP3VybD1cIit1cmwsIFwiR29vZ2xlXCJcclxuXHJcbiAgICBTaGFyZXIuc2hhcmVQaW50ZXJlc3QgPSAodXJsICwgZGVzY3JpcHRpb24sIHBpY3R1cmUpIC0+XHJcblxyXG4gICAgICAgIGRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24uc3BsaXQoXCIgXCIpLmpvaW4oXCIrXCIpXHJcbiAgICAgICAgQG9wZW5Qb3B1cCA3ODAsIDMyMCwgXCJodHRwOi8vcGludGVyZXN0LmNvbS9waW4vY3JlYXRlL2J1dHRvbi8/dXJsPSN7ZW5jb2RlVVJJQ29tcG9uZW50KHVybCl9JmFtcDtkZXNjcmlwdGlvbj0je2Rlc2NyaXB0aW9ufSZhbXA7bWVkaWE9I3tlbmNvZGVVUklDb21wb25lbnQocGljdHVyZSl9XCJcclxuXHJcblxyXG4gICAgU2hhcmVyLmVtYWlsTGluayA9IChzdWJqZWN0LCBib2R5KSAtPlxyXG4gICAgICAgIHggPSBAb3BlblBvcHVwIDEgLCAxLCBcIm1haWx0bzomc3ViamVjdD0je2VuY29kZVVSSUNvbXBvbmVudChzdWJqZWN0KX0mYm9keT0je2VuY29kZVVSSUNvbXBvbmVudChib2R5KX1cIlxyXG4gICAgICAgIHguY2xvc2UoKVxyXG5cclxuICAgIFNoYXJlci5vcGVuUG9wdXAgPSAodywgaCwgdXJsLCBuYW1lKSAtPlxyXG4gICAgICAgIHdpbmRvdy5vcGVuIHVybCwgbmFtZSwgXCJzdGF0dXM9MSx3aWR0aD1cIiArIHcgKyBcIixoZWlnaHQ9XCIgKyBoICsgXCIsbGVmdD1cIiArIChzY3JlZW4ud2lkdGggLSB3KSAvIDIgKyBcIix0b3A9XCIgKyAoc2NyZWVuLmhlaWdodCAtIGgpIC8gMlxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2hhcmVyIiwiZ2xvYmFscyA9IHJlcXVpcmUgJy4vY29tL2dsb2JhbC9pbmRleC5jb2ZmZWUnXG5QYXJrc0xpc3QgPSByZXF1aXJlICcuL2NvbS9wbHVnaW5zL1BhcmtzTGlzdC5jb2ZmZWUnXG5EcmFnZ2FibGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi9jb20vcGx1Z2lucy9EcmFnZ2FibGVHYWxsZXJ5LmNvZmZlZSdcbkZhZGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi9jb20vcGx1Z2lucy9GYWRlR2FsbGVyeS5jb2ZmZWUnXG5QYXJ0bmVyc2hpcFBhZ2UgPSByZXF1aXJlICcuL2NvbS9wYWdlcy9QYXJ0bmVyc2hpcFBhZ2UuY29mZmVlJ1xuXG5cbiQoZG9jdW1lbnQpLnJlYWR5IC0+XG5cbiAgICBwYXJ0bmVyc2hpcCA9IG5ldyBQYXJ0bmVyc2hpcFBhZ2VcbiAgICAgICAgZWw6IFwiYm9keVwiXG5cbiAgICAkKCcuY2lyY2xlJykub24gJ2NsaWNrJywgLT5cbiAgICAgICAgdGFyZ2V0ID0gJCh0aGlzKVxuICAgICAgICBUd2Vlbk1heC5mcm9tVG8odGFyZ2V0LCAuNSwgeyByb3RhdGlvblk6IDcyMH0sIHtyb3RhdGlvblk6IDB9KVxuIl19
