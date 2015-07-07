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
var AnimationBase, DraggableGallery, FadeGallery, FormHandler, FrameAnimation, GroupSalesPage, HeaderAnimation, ParksList, ResizeButtons, animations, globalAnimations,
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

FormHandler = require('../plugins/FormHandler.coffee');

animations = require('./animations/groupsales.coffee');

globalAnimations = require('./animations/global.coffee');

GroupSalesPage = (function(superClass) {
  extend(GroupSalesPage, superClass);

  function GroupSalesPage(el) {
    this.resetTimeline = bind(this.resetTimeline, this);
    this.totalAnimationTime = 25;
    GroupSalesPage.__super__.constructor.call(this, el);
  }

  GroupSalesPage.prototype.initialize = function() {
    return GroupSalesPage.__super__.initialize.call(this);
  };

  GroupSalesPage.prototype.initComponents = function() {
    var coaster, groupForm, groupTypes, groups, resizebuttons;
    GroupSalesPage.__super__.initComponents.call(this);
    groupTypes = new FadeGallery({
      el: ".select-gallery"
    });
    window.ddls = [];
    this.grouptypes = $('#grouptypes-select').cfDropdown({
      onSelect: function(t) {
        var id;
        id = $(t).data('id');
        return groupTypes.goto(id);
      }
    });
    this.formtypes = $('#programs-select').cfDropdown({
      onSelect: function(t) {
        var id;
        return id = $(t).data('id');
      }
    });
    window.ddls.push(this.grouptypes);
    window.ddls.push(this.formtypes);
    window.ddls.push($('#parks-select').cfDropdown({
      onSelect: function(t) {
        var id;
        return id = $(t).data('id');
      }
    }));
    groupForm = new FormHandler({
      el: '#group-sales-form'
    });
    $('#form-opener').on('click', (function(_this) {
      return function() {
        console.log(_this.formtypes.value);
        console.log(_this.grouptypes.value);
        return _this.formtypes.setToValue(_this.grouptypes.value);
      };
    })(this));
    if (!this.isPhone) {
      coaster = new FrameAnimation({
        id: "groups-coaster-1-a",
        el: "#group-sales-section1",
        baseUrl: this.cdnRoot + "coasters/",
        url: "shot-6/data.json",
        depth: 8
      });
      coaster.loadFrames();
      groups = new DraggableGallery({
        el: "#group-sales-section2  #select-testimony",
        across: 1
      });
      return resizebuttons = new ResizeButtons;
    } else {
      return groups = new DraggableGallery({
        el: "#group-sales-section2 #testimonials",
        across: 1
      });
    }
  };

  GroupSalesPage.prototype.resetTimeline = function() {
    GroupSalesPage.__super__.resetTimeline.call(this);
    this.parallax.push(globalAnimations.clouds("#section1", 0, 1, this.isTablet ? 1 : 5));
    if (!this.isPhone) {
      this.triggers.push(animations.topHeadline());
      this.triggers.push(animations.scrollCircle());
      this.triggers.push(animations.selectBox());
      this.triggers.push(animations.s2TopHeadline());
      return this.triggers.push(animations.offeringsTestimonials());
    }
  };

  return GroupSalesPage;

})(AnimationBase);

module.exports = GroupSalesPage;



},{"../abstract/AnimationBase.coffee":1,"../plugins/DraggableGallery.coffee":10,"../plugins/FadeGallery.coffee":11,"../plugins/FormHandler.coffee":12,"../plugins/HeaderAnimation.coffee":13,"../plugins/ParksList.coffee":14,"../plugins/ResizeButtons.coffee":15,"../plugins/coasters/FrameAnimation.coffee":18,"./animations/global.coffee":7,"./animations/groupsales.coffee":8}],6:[function(require,module,exports){
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
var DraggableGallery, FadeGallery, GroupSalesPage, ParksList, globals;

globals = require('./com/global/index.coffee');

ParksList = require('./com/plugins/ParksList.coffee');

DraggableGallery = require('./com/plugins/DraggableGallery.coffee');

FadeGallery = require('./com/plugins/FadeGallery.coffee');

GroupSalesPage = require('./com/pages/GroupSalesPage.coffee');

$(document).ready(function() {
  var groupsales;
  return groupsales = new GroupSalesPage({
    el: "body"
  });
});



},{"./com/global/index.coffee":4,"./com/pages/GroupSalesPage.coffee":5,"./com/plugins/DraggableGallery.coffee":10,"./com/plugins/FadeGallery.coffee":11,"./com/plugins/ParksList.coffee":14}]},{},[22])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvQW5pbWF0aW9uQmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvVmlld0Jhc2UuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL2dsb2JhbC9pbmRleC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvR3JvdXBTYWxlc1BhZ2UuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BhZ2VzL2FuaW1hdGlvbnMvY2xvdWRzLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wYWdlcy9hbmltYXRpb25zL2dsb2JhbC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvYW5pbWF0aW9ucy9ncm91cHNhbGVzLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0Jhc2ljT3ZlcmxheS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9EcmFnZ2FibGVHYWxsZXJ5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0ZhZGVHYWxsZXJ5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0Zvcm1IYW5kbGVyLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0hlYWRlckFuaW1hdGlvbi5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9QYXJrc0xpc3QuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvUmVzaXplQnV0dG9ucy5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9TdmdJbmplY3QuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvVmlkZW9PdmVybGF5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL2NvYXN0ZXJzL0ZyYW1lQW5pbWF0aW9uLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL2NvYXN0ZXJzL0ZyYW1lc01vZGVsLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS91dGlsL1Njcm9sbEJhci5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vdXRpbC9TaGFyZXIuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvZ3JvdXBzYWxlcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNDQSxJQUFBLDJEQUFBO0VBQUE7OzZCQUFBOztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsbUJBQVIsQ0FBWCxDQUFBOztBQUFBLFNBQ0EsR0FBWSxPQUFBLENBQVEsMEJBQVIsQ0FEWixDQUFBOztBQUFBLGVBRUEsR0FBa0IsT0FBQSxDQUFRLG1DQUFSLENBRmxCLENBQUE7O0FBQUEsTUFHQSxHQUFTLE9BQUEsQ0FBUSxtQ0FBUixDQUhULENBQUE7O0FBQUE7QUFRSSxtQ0FBQSxDQUFBOztBQUFhLEVBQUEsdUJBQUMsRUFBRCxHQUFBO0FBQ1QseURBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEseUNBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsSUFBQSwrQ0FBTSxFQUFOLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQURaLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FGVixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLENBSGQsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLGtCQUFELEdBQXlCLElBQUMsQ0FBQSxRQUFKLEdBQWtCLEVBQWxCLEdBQTBCLENBSmhELENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxZQUFELEdBQWdCLENBTGhCLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FOYixDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsZUFBRCxHQUFtQixDQVBuQixDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsRUFSdEIsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CLENBVHBCLENBQUE7QUFBQSxJQVVBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFWWixDQUFBO0FBQUEsSUFXQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBWFQsQ0FBQTtBQUFBLElBWUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQVpmLENBQUE7QUFBQSxJQWFBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFFBQVYsQ0FBbUIsUUFBbkIsQ0FiWixDQURTO0VBQUEsQ0FBYjs7QUFBQSwwQkFnQkEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNSLElBQUEsNENBQUEsQ0FBQSxDQUFBO0FBRUEsSUFBQSxJQUFHLENBQUEsSUFBRSxDQUFBLE9BQUw7QUFDSSxNQUFBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsZUFBRCxDQUFBLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUZBLENBQUE7YUFHQSxJQUFDLENBQUEsY0FBRCxDQUFBLEVBSko7S0FIUTtFQUFBLENBaEJaLENBQUE7O0FBQUEsMEJBeUJBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO1dBQ1osSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLGVBQUEsQ0FDVjtBQUFBLE1BQUEsRUFBQSxFQUFHLFFBQUg7S0FEVSxFQURGO0VBQUEsQ0F6QmhCLENBQUE7O0FBQUEsMEJBZ0NBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2IsSUFBQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsR0FBWixDQUFnQixRQUFoQixFQUEyQixJQUFDLENBQUEsUUFBNUIsQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsTUFBRCxHQUNJO0FBQUEsTUFBQSxRQUFBLEVBQVUsQ0FBVjtBQUFBLE1BQ0EsU0FBQSxFQUFXLENBRFg7S0FISixDQUFBO0FBQUEsSUFLQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsTUFBWixDQUFtQixJQUFDLENBQUEsUUFBcEIsQ0FMQSxDQUFBO1dBTUEsSUFBQyxDQUFBLFFBQUQsQ0FBQSxFQVBhO0VBQUEsQ0FoQ2pCLENBQUE7O0FBQUEsMEJBMENBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtXQUNmLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLFdBQWQsQ0FBQSxDQUFBLEdBQThCLElBQUMsQ0FBQSxXQUF4QyxFQURlO0VBQUEsQ0ExQ25CLENBQUE7O0FBQUEsMEJBNkNBLFlBQUEsR0FBYyxTQUFBLEdBQUE7V0FDVixDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsU0FBWixDQUFBLENBQUEsR0FBMEIsSUFBQyxDQUFBLGlCQUFELENBQUEsRUFEaEI7RUFBQSxDQTdDZCxDQUFBOztBQUFBLDBCQWlEQSxZQUFBLEdBQWMsU0FBQyxHQUFELEdBQUE7QUFDVixRQUFBLEdBQUE7QUFBQSxJQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUFBLEdBQXVCLEdBQTdCLENBQUE7V0FDQSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFoQixFQUFvQixHQUFwQixFQUZVO0VBQUEsQ0FqRGQsQ0FBQTs7QUFBQSwwQkFzREEsb0JBQUEsR0FBc0IsU0FBQyxHQUFELEdBQUE7QUFDbEIsUUFBQSxHQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FBQSxHQUF1QixHQUE3QixDQUFBO1dBQ0EsUUFBUSxDQUFDLEdBQVQsQ0FBYSxDQUFBLENBQUUsVUFBRixDQUFiLEVBQ0k7QUFBQSxNQUFBLENBQUEsRUFBRyxDQUFBLEdBQUg7S0FESixFQUZrQjtFQUFBLENBdER0QixDQUFBOztBQUFBLDBCQTREQSxRQUFBLEdBQVUsU0FBQyxDQUFELEdBQUE7QUFDTixJQUFBLElBQUcsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLFNBQVosQ0FBQSxDQUFBLEdBQTBCLEVBQTdCO0FBQ0ksTUFBQSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxRQUF2QixDQUFnQyxXQUFoQyxDQUFBLENBREo7S0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLEdBQW1CLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FIbkIsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLEdBQW9CLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxTQUFaLENBQUEsQ0FKcEIsQ0FBQTtXQUtBLElBQUMsQ0FBQSxjQUFELENBQUEsRUFOTTtFQUFBLENBNURWLENBQUE7O0FBQUEsMEJBcUVBLE1BQUEsR0FBUSxTQUFDLENBQUQsR0FBQTtBQUdKLElBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLEdBQW1CLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxDQUFSLEdBQWEsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FBdEIsQ0FBbkIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLEdBQW9CLENBQUEsSUFBRSxDQUFBLE1BQU0sQ0FBQyxDQUQ3QixDQUFBO1dBS0EsSUFBQyxDQUFBLGNBQUQsQ0FBQSxFQVJJO0VBQUEsQ0FyRVIsQ0FBQTs7QUFBQSwwQkFnRkEsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNOLFFBQUEsR0FBQTtBQUFBLElBQUEsMENBQUEsQ0FBQSxDQUFBO0FBQ0EsSUFBQSxJQUFHLENBQUEsSUFBRSxDQUFBLFFBQUw7QUFDSSxNQUFBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBQSxDQURKO0tBREE7QUFBQSxJQUlBLElBQUMsQ0FBQSxZQUFELEdBQWlCLElBQUMsQ0FBQSxXQUFELEdBQWUsS0FKaEMsQ0FBQTtBQUtBLElBQUEsSUFBRyxtQkFBSDtBQUNJLE1BQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBZCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsZUFBRCxDQUFBLENBREEsQ0FBQTtBQUVBLE1BQUEsSUFBRyxDQUFBLElBQUUsQ0FBQSxRQUFMO2VBQ0ksSUFBQyxDQUFBLFlBQUQsQ0FBYyxHQUFkLEVBREo7T0FISjtLQU5NO0VBQUEsQ0FoRlYsQ0FBQTs7QUFBQSwwQkE2RkEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNYLElBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxHQUFBLENBQUEsV0FBWixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLEVBRFosQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxFQUZaLENBQUE7V0FJQSxDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLElBQWxCLENBQXVCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsRUFBRyxDQUFILEdBQUE7QUFDbkIsWUFBQSw4Q0FBQTtBQUFBLFFBQUEsR0FBQSxHQUFNLENBQUEsQ0FBRSxDQUFGLENBQU4sQ0FBQTtBQUFBLFFBQ0EsaUJBQUEsR0FBb0IsR0FBRyxDQUFDLE9BQUosQ0FBWSx3QkFBWixDQURwQixDQUFBO0FBQUEsUUFFQSxPQUFBLEdBQVUsaUJBQWlCLENBQUMsSUFBbEIsQ0FBQSxDQUF3QixDQUFDLGNBQWMsQ0FBQyxPQUZsRCxDQUFBO0FBQUEsUUFLQSxhQUFBLEdBQWdCLE1BQUEsQ0FDWjtBQUFBLFVBQUEsR0FBQSxFQUFJLEdBQUo7U0FEWSxDQUxoQixDQUFBO0FBUUEsUUFBQSxJQUFHLE9BQUg7QUFDSSxVQUFBLGFBQUEsQ0FBYyxPQUFkLENBQUEsQ0FESjtTQVJBO2VBV0EsS0FBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsYUFBZixFQVptQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCLEVBTFc7RUFBQSxDQTdGZixDQUFBOztBQUFBLDBCQWdIQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtBQUVaLFFBQUEseUNBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFzQixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQTlCLENBQUEsQ0FBQTtBQUVBO0FBQUEsU0FBQSxxQ0FBQTtpQkFBQTtBQUNJLE1BQUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsR0FBb0IsQ0FBQyxDQUFDLE1BQUYsR0FBVyxJQUFDLENBQUEsWUFBbkM7QUFDSSxRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSixDQUFBLENBQUEsQ0FESjtPQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsR0FBb0IsSUFBQyxDQUFBLFdBQXJCLEdBQW1DLENBQUMsQ0FBQyxNQUF4QztBQUNELFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFKLENBQVcsSUFBWCxDQUFBLENBQUE7QUFBQSxRQUNBLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSixDQUFTLENBQVQsQ0FEQSxDQURDO09BSFQ7QUFBQSxLQUZBO0FBVUE7QUFBQTtTQUFBLHdDQUFBO2tCQUFBO0FBQ0ksbUJBQUEsQ0FBQSxDQUFFLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBVixFQUFBLENBREo7QUFBQTttQkFaWTtFQUFBLENBaEhoQixDQUFBOzt1QkFBQTs7R0FId0IsU0FMNUIsQ0FBQTs7QUFBQSxNQTZJTSxDQUFDLE9BQVAsR0FBaUIsYUE3SWpCLENBQUE7Ozs7O0FDREEsSUFBQSxVQUFBO0VBQUE7NkJBQUE7O0FBQUE7QUFJSSxnQ0FBQSxDQUFBOztBQUFhLEVBQUEsb0JBQUMsSUFBRCxHQUFBO0FBQ1QsSUFBQSwwQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxHQUFELEdBQVUsZUFBSCxHQUFpQixDQUFBLENBQUUsSUFBSSxDQUFDLEVBQVAsQ0FBakIsR0FBQSxNQURQLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxVQUFELENBQVksSUFBWixDQUhBLENBRFM7RUFBQSxDQUFiOztBQUFBLHVCQVNBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTtXQUNSLElBQUMsQ0FBQSxTQUFELENBQUEsRUFEUTtFQUFBLENBVFosQ0FBQTs7QUFBQSx1QkFZQSxTQUFBLEdBQVcsU0FBQSxHQUFBLENBWlgsQ0FBQTs7QUFBQSx1QkFnQkEsWUFBQSxHQUFjLFNBQUEsR0FBQSxDQWhCZCxDQUFBOztBQUFBLHVCQW1CQSxPQUFBLEdBQVMsU0FBQSxHQUFBO1dBQ0wsSUFBQyxDQUFBLFlBQUQsQ0FBQSxFQURLO0VBQUEsQ0FuQlQsQ0FBQTs7b0JBQUE7O0dBSnFCLGFBQXpCLENBQUE7O0FBQUEsTUFpQ00sQ0FBQyxPQUFQLEdBQWlCLFVBakNqQixDQUFBOzs7OztBQ0NBLElBQUEsZ0JBQUE7RUFBQTs7NkJBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSx1QkFBUixDQUFULENBQUE7O0FBQUE7QUFTSSw4QkFBQSxDQUFBOztBQUFhLEVBQUEsa0JBQUMsRUFBRCxHQUFBO0FBRVQsNkNBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFBLENBQUUsRUFBRixDQUFQLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFFBQVYsQ0FBbUIsUUFBbkIsQ0FEWixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxRQUFWLENBQW1CLE9BQW5CLENBRlgsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsSUFBVixDQUFlLEtBQWYsQ0FBQSxJQUF5QixHQUhwQyxDQUFBO0FBQUEsSUFJQSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsRUFBVixDQUFhLFlBQWIsRUFBNEIsSUFBQyxDQUFBLFFBQTdCLENBSkEsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxNQUFNLENBQUMsV0FOdEIsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsS0FBVixDQUFBLENBUGQsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQVJWLENBQUE7QUFBQSxJQVNBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FUVixDQUFBO0FBQUEsSUFZQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBWkEsQ0FGUztFQUFBLENBQWI7O0FBQUEscUJBaUJBLFVBQUEsR0FBWSxTQUFBLEdBQUE7V0FDUixJQUFDLENBQUEsY0FBRCxDQUFBLEVBRFE7RUFBQSxDQWpCWixDQUFBOztBQUFBLHFCQW9CQSxjQUFBLEdBQWdCLFNBQUEsR0FBQSxDQXBCaEIsQ0FBQTs7QUFBQSxxQkFzQkEsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNOLElBQUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBQWYsQ0FBQTtXQUNBLElBQUMsQ0FBQSxVQUFELEdBQWMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEtBQVYsQ0FBQSxFQUZSO0VBQUEsQ0F0QlYsQ0FBQTs7QUFBQSxxQkEyQkEsY0FBQSxHQUFnQixTQUFBLEdBQUE7QUFDWixXQUFPLEVBQVAsQ0FEWTtFQUFBLENBM0JoQixDQUFBOztrQkFBQTs7R0FObUIsYUFIdkIsQ0FBQTs7QUFBQSxNQXdDTSxDQUFDLE9BQVAsR0FBaUIsUUF4Q2pCLENBQUE7Ozs7O0FDREEsSUFBQSx1QkFBQTs7QUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGdDQUFSLENBQWYsQ0FBQTs7QUFBQSxTQUNBLEdBQVksT0FBQSxDQUFRLDZCQUFSLENBRFosQ0FBQTs7QUFLQSxJQUFHLE1BQU0sQ0FBQyxPQUFQLEtBQWtCLE1BQWxCLElBQStCLE1BQU0sQ0FBQyxPQUFQLEtBQWtCLElBQXBEO0FBQ0UsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxHQUFBLEVBQUssU0FBQSxHQUFBLENBQUw7QUFBQSxJQUNBLElBQUEsRUFBTSxTQUFBLEdBQUEsQ0FETjtBQUFBLElBRUEsS0FBQSxFQUFPLFNBQUEsR0FBQSxDQUZQO0dBREYsQ0FERjtDQUxBOztBQUFBLENBYUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxLQUFaLENBQWtCLFNBQUEsR0FBQTtBQUlkLE1BQUEsYUFBQTtBQUFBLEVBQUEsYUFBQSxHQUFvQixJQUFBLFlBQUEsQ0FDaEI7QUFBQSxJQUFBLEVBQUEsRUFBSSxDQUFBLENBQUUsVUFBRixDQUFKO0dBRGdCLENBQXBCLENBQUE7QUFBQSxFQUlBLENBQUEsQ0FBRSxXQUFGLENBQWMsQ0FBQyxLQUFmLENBQXFCLFNBQUEsR0FBQTtBQUNsQixRQUFBLENBQUE7QUFBQSxJQUFBLENBQUEsR0FBSSxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsSUFBUixDQUFhLFFBQWIsQ0FBSixDQUFBO1dBQ0EsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE9BQVYsQ0FBa0I7QUFBQSxNQUNiLFNBQUEsRUFBVyxDQUFBLENBQUUsR0FBQSxHQUFJLENBQU4sQ0FBUSxDQUFDLE1BQVQsQ0FBQSxDQUFpQixDQUFDLEdBQWxCLEdBQXdCLEVBRHRCO0tBQWxCLEVBRmtCO0VBQUEsQ0FBckIsQ0FKQSxDQUFBO0FBQUEsRUFZQSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsS0FBVixDQUFnQixTQUFBLEdBQUE7QUFDWixJQUFBLElBQUcsbUJBQUg7YUFDSSxDQUFDLENBQUMsSUFBRixDQUFPLE1BQU0sQ0FBQyxJQUFkLEVBQW9CLFNBQUMsQ0FBRCxFQUFJLENBQUosR0FBQTtBQUNoQixRQUFBLElBQUcsQ0FBQyxDQUFDLE1BQUYsSUFBYSxDQUFBLENBQUssQ0FBQyxTQUF0QjtpQkFDSSxDQUFDLENBQUMsU0FBRixDQUFBLEVBREo7U0FEZ0I7TUFBQSxDQUFwQixFQURKO0tBRFk7RUFBQSxDQUFoQixDQVpBLENBQUE7QUFBQSxFQW9CQSxDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLElBQWxCLENBQXVCLFNBQUEsR0FBQTtBQUNuQixRQUFBLFVBQUE7QUFBQSxJQUFBLEdBQUEsR0FBTSxDQUFBLENBQUUsSUFBRixDQUFOLENBQUE7QUFBQSxJQUNBLEtBQUEsR0FBUSxHQUFHLENBQUMsSUFBSixDQUFBLENBQVUsQ0FBQyxLQURuQixDQUFBO0FBQUEsSUFHQSxHQUFHLENBQUMsR0FBSixDQUFRLFNBQVIsRUFBbUIsS0FBbkIsQ0FIQSxDQUFBO1dBSUEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxHQUFiLEVBQ0k7QUFBQSxNQUFBLENBQUEsRUFBRyxLQUFBLEdBQVEsRUFBWDtLQURKLEVBTG1CO0VBQUEsQ0FBdkIsQ0FwQkEsQ0FBQTtBQUFBLEVBOEJBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxFQUFWLENBQWEsaUJBQWIsRUFBaUMsU0FBQSxHQUFBO1dBQzdCLENBQUEsQ0FBRSxHQUFGLENBQU0sQ0FBQyxJQUFQLENBQVksU0FBQSxHQUFBO0FBQ1IsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLENBQVAsQ0FBQTtBQUNBLE1BQUEsSUFBRyxZQUFIO0FBQ0ksUUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLElBQUwsQ0FBQSxDQUFQLENBQUE7QUFDQSxRQUFBLElBQUcsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLENBQUEsS0FBMkIsQ0FBM0IsSUFBZ0MsSUFBSSxDQUFDLE9BQUwsQ0FBYSxVQUFiLENBQUEsS0FBNEIsQ0FBNUQsSUFBaUUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxNQUFiLENBQUEsS0FBd0IsQ0FBQyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQWYsQ0FBNUY7aUJBQ0ksQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxRQUFWLEVBQW9CLFFBQXBCLEVBREo7U0FGSjtPQUZRO0lBQUEsQ0FBWixFQUQ2QjtFQUFBLENBQWpDLENBOUJBLENBQUE7QUFBQSxFQXVDQSxDQUFBLENBQUUsd0JBQUYsQ0FBMkIsQ0FBQyxFQUE1QixDQUErQixZQUEvQixFQUE2QyxTQUFBLEdBQUE7V0FDekMsUUFBUSxDQUFDLEVBQVQsQ0FBWSxDQUFBLENBQUUsSUFBRixDQUFaLEVBQXFCLEdBQXJCLEVBQ0k7QUFBQSxNQUFBLEtBQUEsRUFBTyxJQUFQO0FBQUEsTUFDQSxJQUFBLEVBQU0sTUFBTSxDQUFDLE9BRGI7S0FESixFQUR5QztFQUFBLENBQTdDLENBdkNBLENBQUE7QUFBQSxFQThDQSxDQUFBLENBQUUsd0JBQUYsQ0FBMkIsQ0FBQyxFQUE1QixDQUErQixZQUEvQixFQUE2QyxTQUFBLEdBQUE7V0FDekMsUUFBUSxDQUFDLEVBQVQsQ0FBWSxDQUFBLENBQUUsSUFBRixDQUFaLEVBQXFCLEdBQXJCLEVBQ0k7QUFBQSxNQUFBLEtBQUEsRUFBTyxDQUFQO0FBQUEsTUFDQSxJQUFBLEVBQU0sTUFBTSxDQUFDLE9BRGI7S0FESixFQUR5QztFQUFBLENBQTdDLENBOUNBLENBQUE7U0FxREEsQ0FBQSxDQUFFLG9DQUFGLENBQXVDLENBQUMsRUFBeEMsQ0FBMkMsYUFBM0MsRUFBMEQsU0FBQSxHQUFBO1dBQ3RELE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWixFQURzRDtFQUFBLENBQTFELEVBekRjO0FBQUEsQ0FBbEIsQ0FiQSxDQUFBOztBQUFBLFFBNEVRLENBQUMsa0JBQVQsR0FBOEIsU0FBQSxHQUFBO0FBQzFCLEVBQUEsSUFBSSxRQUFRLENBQUMsVUFBVCxLQUF1QixVQUEzQjtXQUNJLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDUCxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsUUFBWixDQUFxQixnQkFBckIsRUFETztJQUFBLENBQVgsRUFFRSxHQUZGLEVBREo7R0FEMEI7QUFBQSxDQTVFOUIsQ0FBQTs7Ozs7QUNBQSxJQUFBLGtLQUFBO0VBQUE7OzZCQUFBOztBQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtDQUFSLENBQWhCLENBQUE7O0FBQUEsU0FDQSxHQUFZLE9BQUEsQ0FBUSw2QkFBUixDQURaLENBQUE7O0FBQUEsZ0JBRUEsR0FBbUIsT0FBQSxDQUFRLG9DQUFSLENBRm5CLENBQUE7O0FBQUEsV0FHQSxHQUFjLE9BQUEsQ0FBUSwrQkFBUixDQUhkLENBQUE7O0FBQUEsZUFJQSxHQUFrQixPQUFBLENBQVEsbUNBQVIsQ0FKbEIsQ0FBQTs7QUFBQSxjQUtBLEdBQWlCLE9BQUEsQ0FBUSwyQ0FBUixDQUxqQixDQUFBOztBQUFBLGFBTUEsR0FBZ0IsT0FBQSxDQUFRLGlDQUFSLENBTmhCLENBQUE7O0FBQUEsV0FPQSxHQUFjLE9BQUEsQ0FBUSwrQkFBUixDQVBkLENBQUE7O0FBQUEsVUFTQSxHQUFhLE9BQUEsQ0FBUSxnQ0FBUixDQVRiLENBQUE7O0FBQUEsZ0JBVUEsR0FBbUIsT0FBQSxDQUFRLDRCQUFSLENBVm5CLENBQUE7O0FBQUE7QUFnQkksb0NBQUEsQ0FBQTs7QUFBYSxFQUFBLHdCQUFDLEVBQUQsR0FBQTtBQUNULHVEQUFBLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxrQkFBRCxHQUFzQixFQUF0QixDQUFBO0FBQUEsSUFDQSxnREFBTSxFQUFOLENBREEsQ0FEUztFQUFBLENBQWI7O0FBQUEsMkJBSUEsVUFBQSxHQUFZLFNBQUEsR0FBQTtXQUNSLDZDQUFBLEVBRFE7RUFBQSxDQUpaLENBQUE7O0FBQUEsMkJBT0EsY0FBQSxHQUFnQixTQUFBLEdBQUE7QUFDWixRQUFBLHFEQUFBO0FBQUEsSUFBQSxpREFBQSxDQUFBLENBQUE7QUFBQSxJQUVBLFVBQUEsR0FBaUIsSUFBQSxXQUFBLENBQ2I7QUFBQSxNQUFBLEVBQUEsRUFBRyxpQkFBSDtLQURhLENBRmpCLENBQUE7QUFBQSxJQUtBLE1BQU0sQ0FBQyxJQUFQLEdBQWMsRUFMZCxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsVUFBRCxHQUFjLENBQUEsQ0FBRSxvQkFBRixDQUF1QixDQUFDLFVBQXhCLENBQ1Y7QUFBQSxNQUFBLFFBQUEsRUFBVSxTQUFDLENBQUQsR0FBQTtBQUNOLFlBQUEsRUFBQTtBQUFBLFFBQUEsRUFBQSxHQUFLLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxJQUFMLENBQVUsSUFBVixDQUFMLENBQUE7ZUFDQSxVQUFVLENBQUMsSUFBWCxDQUFnQixFQUFoQixFQUZNO01BQUEsQ0FBVjtLQURVLENBUGQsQ0FBQTtBQUFBLElBWUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxVQUF0QixDQUNUO0FBQUEsTUFBQSxRQUFBLEVBQVUsU0FBQyxDQUFELEdBQUE7QUFDTixZQUFBLEVBQUE7ZUFBQSxFQUFBLEdBQUssQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxJQUFWLEVBREM7TUFBQSxDQUFWO0tBRFMsQ0FaYixDQUFBO0FBQUEsSUFnQkEsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCLElBQUMsQ0FBQSxVQUFsQixDQWhCQSxDQUFBO0FBQUEsSUFpQkEsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCLElBQUMsQ0FBQSxTQUFsQixDQWpCQSxDQUFBO0FBQUEsSUFtQkEsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCLENBQUEsQ0FBRSxlQUFGLENBQWtCLENBQUMsVUFBbkIsQ0FDYjtBQUFBLE1BQUEsUUFBQSxFQUFVLFNBQUMsQ0FBRCxHQUFBO0FBQ04sWUFBQSxFQUFBO2VBQUEsRUFBQSxHQUFLLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxJQUFMLENBQVUsSUFBVixFQURDO01BQUEsQ0FBVjtLQURhLENBQWpCLENBbkJBLENBQUE7QUFBQSxJQXdCQSxTQUFBLEdBQWdCLElBQUEsV0FBQSxDQUNaO0FBQUEsTUFBQSxFQUFBLEVBQUksbUJBQUo7S0FEWSxDQXhCaEIsQ0FBQTtBQUFBLElBNkJBLENBQUEsQ0FBRSxjQUFGLENBQWlCLENBQUMsRUFBbEIsQ0FBcUIsT0FBckIsRUFBOEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUMxQixRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBQyxDQUFBLFNBQVMsQ0FBQyxLQUF2QixDQUFBLENBQUE7QUFBQSxRQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBQyxDQUFBLFVBQVUsQ0FBQyxLQUF4QixDQURBLENBQUE7ZUFFQSxLQUFDLENBQUEsU0FBUyxDQUFDLFVBQVgsQ0FBc0IsS0FBQyxDQUFBLFVBQVUsQ0FBQyxLQUFsQyxFQUgwQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCLENBN0JBLENBQUE7QUFrQ0EsSUFBQSxJQUFHLENBQUEsSUFBRSxDQUFBLE9BQUw7QUFFSSxNQUFBLE9BQUEsR0FBYyxJQUFBLGNBQUEsQ0FDVjtBQUFBLFFBQUEsRUFBQSxFQUFHLG9CQUFIO0FBQUEsUUFDQSxFQUFBLEVBQUcsdUJBREg7QUFBQSxRQUVBLE9BQUEsRUFBWSxJQUFDLENBQUEsT0FBRixHQUFVLFdBRnJCO0FBQUEsUUFHQSxHQUFBLEVBQUssa0JBSEw7QUFBQSxRQUlBLEtBQUEsRUFBTSxDQUpOO09BRFUsQ0FBZCxDQUFBO0FBQUEsTUFNQSxPQUFPLENBQUMsVUFBUixDQUFBLENBTkEsQ0FBQTtBQUFBLE1BUUEsTUFBQSxHQUFhLElBQUEsZ0JBQUEsQ0FDVDtBQUFBLFFBQUEsRUFBQSxFQUFHLDBDQUFIO0FBQUEsUUFDQSxNQUFBLEVBQVEsQ0FEUjtPQURTLENBUmIsQ0FBQTthQVlBLGFBQUEsR0FBZ0IsR0FBQSxDQUFBLGNBZHBCO0tBQUEsTUFBQTthQWlCSSxNQUFBLEdBQWEsSUFBQSxnQkFBQSxDQUNUO0FBQUEsUUFBQSxFQUFBLEVBQUcscUNBQUg7QUFBQSxRQUNBLE1BQUEsRUFBUSxDQURSO09BRFMsRUFqQmpCO0tBbkNZO0VBQUEsQ0FQaEIsQ0FBQTs7QUFBQSwyQkFnRUEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNYLElBQUEsZ0RBQUEsQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxnQkFBZ0IsQ0FBQyxNQUFqQixDQUF3QixXQUF4QixFQUFxQyxDQUFyQyxFQUF5QyxDQUF6QyxFQUErQyxJQUFDLENBQUEsUUFBSixHQUFrQixDQUFsQixHQUF5QixDQUFyRSxDQUFmLENBRkEsQ0FBQTtBQU1BLElBQUEsSUFBRyxDQUFBLElBQUUsQ0FBQSxPQUFMO0FBQ0ksTUFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxVQUFVLENBQUMsV0FBWCxDQUFBLENBQWYsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxVQUFVLENBQUMsWUFBWCxDQUFBLENBQWYsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxVQUFVLENBQUMsU0FBWCxDQUFBLENBQWYsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxVQUFVLENBQUMsYUFBWCxDQUFBLENBQWYsQ0FIQSxDQUFBO2FBSUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsVUFBVSxDQUFDLHFCQUFYLENBQUEsQ0FBZixFQUxKO0tBUFc7RUFBQSxDQWhFZixDQUFBOzt3QkFBQTs7R0FIeUIsY0FiN0IsQ0FBQTs7QUFBQSxNQWdHTSxDQUFDLE9BQVAsR0FBaUIsY0FoR2pCLENBQUE7Ozs7O0FDQ0EsSUFBQSwwQ0FBQTs7QUFBQSxjQUFBLEdBQWlCLFNBQUMsRUFBRCxFQUFLLFFBQUwsR0FBQTtBQUNiLE1BQUEsV0FBQTtBQUFBLEVBQUEsV0FBQSxHQUFjLE1BQU0sQ0FBQyxVQUFyQixDQUFBO0FBQUEsRUFFQSxRQUFRLENBQUMsR0FBVCxDQUFhLEVBQWIsRUFDSTtBQUFBLElBQUEsQ0FBQSxFQUFHLENBQUEsSUFBSDtHQURKLENBRkEsQ0FBQTtTQUtBLFFBQVEsQ0FBQyxFQUFULENBQVksRUFBWixFQUFnQixRQUFoQixFQUNJO0FBQUEsSUFBQSxDQUFBLEVBQUcsV0FBSDtBQUFBLElBQ0EsVUFBQSxFQUFZLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7ZUFDUixjQUFBLENBQWUsRUFBZixFQUFvQixRQUFwQixFQURRO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEWjtHQURKLEVBTmE7QUFBQSxDQUFqQixDQUFBOztBQUFBLFNBYUEsR0FBWSxTQUFDLEdBQUQsRUFBTyxHQUFQLEVBQVcsS0FBWCxHQUFBO0FBRVIsTUFBQSxxQkFBQTtBQUFBLEVBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsUUFBVixDQUFtQixRQUFuQixDQUFaLENBQUE7QUFBQSxFQUNBLEtBQUEsR0FBUSxNQUFNLENBQUMsVUFEZixDQUFBO0FBQUEsRUFFQSxXQUFBLEdBQWMsTUFBTSxDQUFDLFVBRnJCLENBQUE7QUFJQSxFQUFBLElBQUcsTUFBTSxDQUFDLFVBQVAsR0FBb0IsR0FBcEIsSUFBMkIsQ0FBQSxJQUFFLENBQUEsUUFBaEM7QUFHSSxJQUFBLENBQUEsR0FBSSxHQUFBLEdBQU0sQ0FBQyxHQUFHLENBQUMsSUFBSixDQUFTLE9BQVQsQ0FBaUIsQ0FBQyxLQUFsQixHQUEwQixHQUEzQixDQUFWLENBQUE7V0FFQSxRQUFRLENBQUMsRUFBVCxDQUFZLEdBQVosRUFBa0IsR0FBbEIsRUFDSTtBQUFBLE1BQUEsQ0FBQSxFQUFHLEtBQUg7QUFBQSxNQUNBLEtBQUEsRUFBTSxLQUROO0FBQUEsTUFFQSxJQUFBLEVBQUssTUFBTSxDQUFDLFFBRlo7QUFBQSxNQUdBLGNBQUEsRUFBZ0IsQ0FBQyxRQUFELENBSGhCO0FBQUEsTUFJQSxVQUFBLEVBQVksQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxHQUFBO2lCQUNSLGNBQUEsQ0FBZSxHQUFmLEVBQXFCLENBQXJCLEVBRFE7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpaO0tBREosRUFMSjtHQU5RO0FBQUEsQ0FiWixDQUFBOztBQUFBLGVBa0NBLEdBQWtCLFNBQUMsR0FBRCxFQUFNLFlBQU4sR0FBQTtBQUVkLE1BQUEsOENBQUE7QUFBQSxFQUFBLE1BQUEsR0FBUyxZQUFZLENBQUMsS0FBYixDQUFtQixHQUFuQixDQUFULENBQUE7QUFBQSxFQUVBLGFBQUEsR0FBZ0IsTUFBTSxDQUFDLFVBRnZCLENBQUE7QUFBQSxFQUdBLFFBQUEsR0FBVyxFQUhYLENBQUE7QUFBQSxFQUtBLEtBQUEsR0FBUSxNQUFPLENBQUEsQ0FBQSxDQUxmLENBQUE7QUFBQSxFQU1BLE1BQUEsR0FBUyxRQUFBLENBQVMsTUFBTyxDQUFBLENBQUEsQ0FBaEIsQ0FBQSxJQUF1QixDQU5oQyxDQUFBO0FBUUEsVUFBTyxLQUFQO0FBQUEsU0FDUyxNQURUO0FBRVEsTUFBQSxRQUFRLENBQUMsQ0FBVCxHQUFhLENBQUEsR0FBSSxNQUFqQixDQUZSO0FBQ1M7QUFEVCxTQUdTLE9BSFQ7QUFJUSxNQUFBLFFBQVEsQ0FBQyxDQUFULEdBQWEsYUFBQSxHQUFnQixNQUE3QixDQUpSO0FBR1M7QUFIVCxTQU1TLFFBTlQ7QUFPUSxNQUFBLFFBQVEsQ0FBQyxDQUFULEdBQWEsQ0FBQyxhQUFBLEdBQWMsRUFBZCxHQUFtQixHQUFHLENBQUMsS0FBSixDQUFBLENBQUEsR0FBWSxFQUFoQyxDQUFBLEdBQXNDLE1BQW5ELENBUFI7QUFBQSxHQVJBO1NBaUJBLFFBQVEsQ0FBQyxHQUFULENBQWEsR0FBYixFQUFtQixRQUFuQixFQW5CYztBQUFBLENBbENsQixDQUFBOztBQUFBLE1BMkRNLENBQUMsT0FBUCxHQUFpQixTQUFDLE9BQUQsR0FBQTtBQUViLE1BQUEsdVNBQUE7QUFBQSxFQUFBLEdBQUEsR0FBTSxPQUFPLENBQUMsR0FBZCxDQUFBO0FBQUEsRUFDQSxVQUFBLEdBQWEsR0FBRyxDQUFDLE9BQUosQ0FBWSx3QkFBWixDQURiLENBQUE7QUFBQSxFQUVBLG1CQUFBLEdBQXNCLFFBQUEsQ0FBUyxVQUFVLENBQUMsR0FBWCxDQUFlLGFBQWYsQ0FBVCxDQUZ0QixDQUFBO0FBS0E7QUFDSSxJQUFBLFNBQUEsR0FBWSxHQUFHLENBQUMsSUFBSixDQUFBLENBQVUsQ0FBQyxLQUF2QixDQURKO0dBQUEsY0FBQTtBQUlJLElBREUsVUFDRixDQUFBO0FBQUEsSUFBQSxPQUFPLENBQUMsS0FBUixDQUFjLHNDQUFkLENBQUEsQ0FKSjtHQUxBO0FBQUEsRUFXQSxVQUFBLEdBQWEsR0FBRyxDQUFDLElBQUosQ0FBUyxPQUFULENBWGIsQ0FBQTtBQUFBLEVBWUEsVUFBQSxHQUFhLFNBQVMsQ0FBQyxLQUFWLElBQW1CLENBWmhDLENBQUE7QUFBQSxFQWFBLGNBQUEsR0FBaUIsUUFBQSxDQUFTLFNBQVMsQ0FBQyxTQUFuQixDQUFBLElBQWlDLENBYmxELENBQUE7QUFBQSxFQWNBLFlBQUEsR0FBZSxTQUFTLENBQUMsT0FBVixJQUFxQixLQWRwQyxDQUFBO0FBQUEsRUFlQSxpQkFBQSxHQUFvQixTQUFTLENBQUMsUUFBVixJQUFzQixRQWYxQyxDQUFBO0FBQUEsRUFtQkEsZUFBQSxDQUFnQixHQUFoQixFQUFzQixpQkFBdEIsQ0FuQkEsQ0FBQTtBQW9CQSxFQUFBLElBQUcsQ0FBQSxDQUFFLFVBQVUsQ0FBQyxRQUFYLENBQW9CLGtCQUFwQixDQUFELENBQUo7QUFDSSxJQUFBLE9BQUEsR0FBVSxHQUFHLENBQUMsTUFBSixDQUFBLENBQVksQ0FBQyxJQUF2QixDQUFBO0FBQUEsSUFDQSxRQUFBLEdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBUCxHQUFvQixPQUFyQixDQUFBLEdBQWdDLE1BQU0sQ0FBQyxVQURsRCxDQUFBO0FBQUEsSUFHQSxVQUFBLEdBQWEsR0FBQSxHQUFNLENBQUMsVUFBQSxHQUFhLEdBQWQsQ0FIbkIsQ0FBQTtBQUFBLElBS0EsU0FBQSxDQUFVLEdBQVYsRUFBZSxVQUFmLEVBQTJCLFVBQUEsR0FBVyxDQUF0QyxDQUxBLENBREo7R0FwQkE7QUFBQSxFQTRCQSxJQUFBLEdBQU8sVUFBVSxDQUFDLE1BQVgsQ0FBQSxDQUFtQixDQUFDLEdBNUIzQixDQUFBO0FBQUEsRUE2QkEsSUFBQSxHQUFPLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxXQUFaLENBQUEsQ0E3QlAsQ0FBQTtBQUFBLEVBOEJBLFVBQUEsR0FBWSxVQUFVLENBQUMsV0FBWCxDQUFBLENBOUJaLENBQUE7QUFBQSxFQWtDQSxlQUFBLEdBQWtCLFVBQUEsR0FBVyxJQWxDN0IsQ0FBQTtBQUFBLEVBbUNBLGtCQUFBLEdBQXFCLElBQUEsR0FBSyxJQW5DMUIsQ0FBQTtBQUFBLEVBb0NBLGtCQUFBLEdBQXFCLGtCQUFBLEdBQXFCLGVBcEMxQyxDQUFBO0FBQUEsRUF5Q0Esb0JBQUEsR0FBdUIsdUJBQUEsR0FBMEIsV0FBQSxHQUFjLENBekMvRCxDQUFBO0FBMkNBLEVBQUEsSUFBSSxVQUFVLENBQUMsUUFBWCxDQUFvQixrQkFBcEIsQ0FBQSxJQUEyQyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsUUFBVixDQUFtQixRQUFuQixDQUEvQztBQUNJLElBQUEsVUFBVSxDQUFDLElBQVgsQ0FBQSxDQUFBLENBREo7R0EzQ0E7QUErQ0EsU0FBTyxTQUFDLEdBQUQsR0FBQTtBQUNILFFBQUEsK0JBQUE7QUFBQSxJQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBWCxDQUFvQixrQkFBcEIsQ0FBRCxDQUFBLElBQTZDLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFFBQVYsQ0FBbUIsUUFBbkIsQ0FBRCxDQUFqRDthQUNJLFFBQVEsQ0FBQyxFQUFULENBQVksR0FBWixFQUFrQixJQUFsQixFQUNJO0FBQUEsUUFBQSxJQUFBLEVBQUssSUFBSSxDQUFDLE9BQVY7T0FESixFQURKO0tBQUEsTUFBQTtBQUtJLE1BQUEsdUJBQUEsR0FBMEIsQ0FBQyxHQUFBLEdBQU0sa0JBQVAsQ0FBQSxHQUE2QixDQUFDLGtCQUFBLEdBQXFCLGtCQUF0QixDQUF2RCxDQUFBO0FBQ0EsTUFBQSxJQUFHLENBQUEsQ0FBQSxJQUFLLHVCQUFMLElBQUssdUJBQUwsSUFBZ0MsQ0FBaEMsQ0FBSDtBQUNJLFFBQUEsdUJBQUEsR0FBMEIsdUJBQTFCLENBQUE7QUFDQSxRQUFBLElBQUcsWUFBSDtBQUNJLFVBQUEsdUJBQUEsR0FBMEIsQ0FBQSxHQUFJLHVCQUE5QixDQURKO1NBREE7QUFBQSxRQUlBLE1BQUEsR0FBUyxDQUFDLFVBQUEsR0FBYSx1QkFBZCxDQUFBLEdBQXlDLFVBSmxELENBQUE7QUFBQSxRQUtBLE1BQUEsR0FBUyxNQUFBLEdBQVMsbUJBTGxCLENBQUE7QUFBQSxRQU1BLE1BQUEsR0FBUyxNQUFBLEdBQVMsY0FObEIsQ0FBQTtBQUFBLFFBU0EsV0FBQSxHQUFjLElBQUksQ0FBQyxHQUFMLENBQVMsb0JBQUEsR0FBdUIsdUJBQWhDLENBQUEsR0FBMkQsQ0FUekUsQ0FBQTtBQUFBLFFBV0Esb0JBQUEsR0FBdUIsdUJBWHZCLENBQUE7ZUFlQSxRQUFRLENBQUMsRUFBVCxDQUFZLEdBQVosRUFBa0IsSUFBbEIsRUFDSTtBQUFBLFVBQUEsQ0FBQSxFQUFFLE1BQUY7QUFBQSxVQUNBLElBQUEsRUFBSyxJQUFJLENBQUMsT0FEVjtTQURKLEVBaEJKO09BTko7S0FERztFQUFBLENBQVAsQ0FqRGE7QUFBQSxDQTNEakIsQ0FBQTs7Ozs7QUNFQSxJQUFBLHFCQUFBOztBQUFBLE1BQUEsR0FBUyxTQUFDLENBQUQsR0FBQTtTQUNQLENBQUMsQ0FBQyxRQUFGLENBQUEsQ0FBWSxDQUFDLE9BQWIsQ0FBcUIsdUJBQXJCLEVBQThDLEdBQTlDLEVBRE87QUFBQSxDQUFULENBQUE7O0FBQUEsTUFJTSxDQUFDLE9BQU8sQ0FBQyxLQUFmLEdBQXVCLFNBQUMsRUFBRCxHQUFBO0FBR25CLE1BQUEsOENBQUE7QUFBQSxFQUFBLEdBQUEsR0FBTSxDQUFBLENBQUUsRUFBRixDQUFOLENBQUE7QUFBQSxFQUNBLFNBQUEsR0FBWSxDQUFBLENBQUUsRUFBRixDQUFLLENBQUMsSUFBTixDQUFBLENBRFosQ0FBQTtBQUFBLEVBRUEsR0FBQSxHQUFNLENBQUEsQ0FBRSxFQUFGLENBQUssQ0FBQyxJQUFOLENBQUEsQ0FBWSxDQUFDLEtBQWIsQ0FBbUIsR0FBbkIsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixFQUE3QixDQUZOLENBQUE7QUFBQSxFQUlBLEtBQUEsR0FBUSxHQUFBLEdBQU0sS0FKZCxDQUFBO0FBQUEsRUFLQSxNQUFBLEdBQVMsR0FBQSxHQUFNLEtBTGYsQ0FBQTtBQUFBLEVBT0EsRUFBQSxHQUFTLElBQUEsV0FBQSxDQUNMO0FBQUEsSUFBQSxPQUFBLEVBQVMsU0FBQSxHQUFBO2FBQ0wsR0FBRyxDQUFDLElBQUosQ0FBUyxJQUFULEVBREs7SUFBQSxDQUFUO0FBQUEsSUFFQSxVQUFBLEVBQVksU0FBQSxHQUFBO2FBQ1IsR0FBRyxDQUFDLElBQUosQ0FBUyxTQUFULEVBRFE7SUFBQSxDQUZaO0dBREssQ0FQVCxDQUFBO0FBQUEsRUFhQSxNQUFBLEdBQVMsRUFiVCxDQUFBO0FBQUEsRUFpQkEsTUFBTSxDQUFDLElBQVAsQ0FBWSxRQUFRLENBQUMsTUFBVCxDQUFnQixHQUFoQixFQUFzQixJQUF0QixFQUNSO0FBQUEsSUFBQSxTQUFBLEVBQVUsQ0FBVjtBQUFBLElBQ0EsZUFBQSxFQUFnQixJQURoQjtBQUFBLElBRUEsSUFBQSxFQUFLLEtBQUssQ0FBQyxPQUZYO0dBRFEsRUFLUjtBQUFBLElBQUEsU0FBQSxFQUFVLENBQVY7R0FMUSxDQUFaLENBakJBLENBQUE7QUFBQSxFQXdCQSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVEsQ0FBQyxFQUFULENBQVksR0FBWixFQUFrQixHQUFsQixFQUNSO0FBQUEsSUFBQSxJQUFBLEVBQUssS0FBSyxDQUFDLE9BQVg7QUFBQSxJQUVBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFDTixVQUFBLGdCQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsUUFBQSxDQUFTLEtBQUEsR0FBUSxRQUFBLENBQVMsTUFBQSxHQUFTLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBbEIsQ0FBakIsQ0FBUixDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsTUFBQSxDQUFPLEtBQVAsQ0FEUixDQUFBO0FBQUEsTUFFQSxHQUFBLEdBQU0sS0FBSyxDQUFDLEtBQU4sQ0FBWSxFQUFaLENBRk4sQ0FBQTtBQUFBLE1BR0EsSUFBQSxHQUFPLEVBSFAsQ0FBQTtBQUFBLE1BSUEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxHQUFQLEVBQVksU0FBQyxJQUFELEVBQU8sS0FBUCxHQUFBO2VBQ1IsSUFBQSxJQUFZLEtBQUEsS0FBUyxHQUFiLEdBQXVCLEdBQXZCLEdBQWdDLFFBQUEsR0FBVyxLQUFYLEdBQW1CLFVBRG5EO01BQUEsQ0FBWixDQUpBLENBQUE7YUFNQSxHQUFHLENBQUMsSUFBSixDQUFTLElBQVQsRUFQTTtJQUFBLENBRlY7R0FEUSxDQUFaLENBeEJBLENBQUE7QUFBQSxFQXFDQSxFQUFFLENBQUMsR0FBSCxDQUFPLE1BQVAsQ0FyQ0EsQ0FBQTtTQXVDQSxHQTFDbUI7QUFBQSxDQUp2QixDQUFBOztBQUFBLGFBb0RBLEdBQWdCLFNBQUMsR0FBRCxFQUFLLEtBQUwsRUFBVyxHQUFYLEVBQWUsR0FBZixFQUFtQixHQUFuQixHQUFBO0FBSVosTUFBQSxlQUFBO0FBQUEsRUFBQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLEdBQUEsR0FBSSxHQUFMLENBQUEsR0FBWSxDQUFDLEdBQUEsR0FBSSxHQUFMLENBQWIsQ0FBQSxHQUEwQixDQUFwQyxDQUFBO0FBQUEsRUFDQSxNQUFBLEdBQVMsT0FBQSxHQUFVLEdBRG5CLENBQUE7QUFLQSxFQUFBLElBQUcsR0FBQSxJQUFPLEdBQVAsSUFBZSxHQUFBLElBQU8sR0FBekI7QUFFSSxJQUFBLElBQUcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxNQUFBLEdBQVMsS0FBSyxDQUFDLElBQU4sQ0FBQSxDQUFsQixDQUFBLElBQW1DLElBQXRDO2FBQ0ksS0FBSyxDQUFDLE9BQU4sQ0FBZSxNQUFmLEVBQ0k7QUFBQSxRQUFBLFNBQUEsRUFBVSxhQUFWO0FBQUEsUUFDQSxJQUFBLEVBQUssSUFBSSxDQUFDLE9BRFY7T0FESixFQURKO0tBRko7R0FUWTtBQUFBLENBcERoQixDQUFBOztBQUFBLE1BcUVNLENBQUMsT0FBTyxDQUFDLE1BQWYsR0FBd0IsU0FBQyxLQUFELEVBQVEsR0FBUixFQUFhLEdBQWIsRUFBa0IsR0FBbEIsR0FBQTtBQUVwQixNQUFBLDhFQUFBO0FBQUEsRUFBQSxNQUFBLEdBQVMsR0FBVCxDQUFBO0FBQUEsRUFDQSxNQUFBLEdBQVMsR0FEVCxDQUFBO0FBQUEsRUFFQSxRQUFBLEdBQVcsR0FGWCxDQUFBO0FBQUEsRUFJQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLFNBQUEsR0FBVSxLQUFaLENBSk4sQ0FBQTtBQUFBLEVBS0EsTUFBQSxHQUFTLEdBQUcsQ0FBQyxJQUFKLENBQVMsUUFBVCxDQUxULENBQUE7QUFBQSxFQU9BLEtBQUEsR0FBUSxHQUFBLENBQUEsV0FQUixDQUFBO0FBQUEsRUFRQSxLQUFLLENBQUMsRUFBTixHQUFXLEVBUlgsQ0FBQTtBQUFBLEVBU0EsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFULEdBQWdCLEtBVGhCLENBQUE7QUFBQSxFQVdBLE1BQUEsR0FBUyxFQVhULENBQUE7QUFZQSxPQUFBLGdEQUFBO3NCQUFBO0FBQ0ksSUFBQSxNQUFBLEdBQVMsSUFBQSxHQUFJLENBQUMsR0FBQSxHQUFJLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBTCxDQUFiLENBQUE7QUFBQSxJQUdBLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBUSxDQUFDLEVBQVQsQ0FBWSxLQUFaLEVBQW9CLFFBQXBCLEVBQ1I7QUFBQSxNQUFBLENBQUEsRUFBRSxNQUFGO0tBRFEsQ0FBWixDQUhBLENBREo7QUFBQSxHQVpBO0FBQUEsRUFxQkEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFWLENBckJBLENBQUE7QUFBQSxFQXlCQSxLQUFLLENBQUMsTUFBTixDQUFhLElBQWIsQ0F6QkEsQ0FBQTtBQTBCQSxTQUFPLFNBQUMsR0FBRCxHQUFBO1dBQ0gsYUFBQSxDQUFjLEdBQWQsRUFBb0IsS0FBcEIsRUFBNEIsTUFBNUIsRUFBb0MsTUFBcEMsRUFBNEMsUUFBNUMsRUFERztFQUFBLENBQVAsQ0E1Qm9CO0FBQUEsQ0FyRXhCLENBQUE7O0FBQUEsTUFvR00sQ0FBQyxPQUFPLENBQUMsTUFBZixHQUF3QixTQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLFFBQWpCLEVBQTJCLElBQTNCLEdBQUE7QUFFcEIsTUFBQSxhQUFBO0FBQUEsRUFBQSxLQUFBLEdBQVEsR0FBQSxDQUFBLFdBQVIsQ0FBQTtBQUFBLEVBQ0EsS0FBSyxDQUFDLEVBQU4sR0FBVyxFQURYLENBQUE7QUFBQSxFQUVBLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBVCxHQUFnQixXQUZoQixDQUFBO0FBQUEsRUFJQSxNQUFBLEdBQVMsRUFKVCxDQUFBO0FBQUEsRUFLQSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVEsQ0FBQyxFQUFULENBQVksSUFBWixFQUFtQixRQUFuQixFQUE4QjtBQUFBLElBQUEsT0FBQSxFQUFRLENBQVI7R0FBOUIsQ0FBWixDQUxBLENBQUE7QUFBQSxFQU9BLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixDQVBBLENBQUE7QUFBQSxFQVNBLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixDQVRBLENBQUE7QUFVQSxTQUFPLFNBQUMsR0FBRCxHQUFBO1dBQ0gsYUFBQSxDQUFjLEdBQWQsRUFBb0IsS0FBcEIsRUFBNEIsTUFBNUIsRUFBb0MsTUFBcEMsRUFBNEMsUUFBNUMsRUFERztFQUFBLENBQVAsQ0Fab0I7QUFBQSxDQXBHeEIsQ0FBQTs7QUFBQSxNQW1ITSxDQUFDLE9BQU8sQ0FBQyxJQUFmLEdBQXNCLFNBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEdBQUE7QUFFbEIsTUFBQSw0Q0FBQTtBQUFBLEVBQUEsTUFBQSxHQUFTLEdBQVQsQ0FBQTtBQUFBLEVBQ0EsTUFBQSxHQUFTLEdBRFQsQ0FBQTtBQUFBLEVBRUEsUUFBQSxHQUFXLEdBRlgsQ0FBQTtBQUFBLEVBSUEsR0FBQSxHQUFNLENBQUEsQ0FBRSxPQUFGLENBSk4sQ0FBQTtBQUFBLEVBTUEsS0FBQSxHQUFRLEdBQUEsQ0FBQSxXQU5SLENBQUE7QUFBQSxFQU9BLEtBQUssQ0FBQyxFQUFOLEdBQVcsRUFQWCxDQUFBO0FBQUEsRUFRQSxLQUFLLENBQUMsRUFBRSxDQUFDLElBQVQsR0FBZ0IsT0FSaEIsQ0FBQTtBQUFBLEVBVUEsTUFBQSxHQUFTLEVBVlQsQ0FBQTtBQUFBLEVBV0EsTUFBTSxDQUFDLElBQVAsQ0FBWSxRQUFRLENBQUMsRUFBVCxDQUFZLEdBQVosRUFBa0IsUUFBbEIsRUFBNkI7QUFBQSxJQUFBLEdBQUEsRUFBSSxDQUFKO0dBQTdCLENBQVosQ0FYQSxDQUFBO0FBQUEsRUFlQSxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsQ0FmQSxDQUFBO0FBQUEsRUFtQkEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFiLENBbkJBLENBQUE7QUFvQkEsU0FBTyxTQUFDLEdBQUQsR0FBQTtXQUNILGFBQUEsQ0FBYyxHQUFkLEVBQW9CLEtBQXBCLEVBQTRCLE1BQTVCLEVBQW9DLE1BQXBDLEVBQTRDLFFBQTVDLEVBREc7RUFBQSxDQUFQLENBdEJrQjtBQUFBLENBbkh0QixDQUFBOzs7OztBQ0hBLElBQUEsTUFBQTs7QUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLGlCQUFSLENBQVQsQ0FBQTs7QUFBQSxNQUVNLENBQUMsT0FBTyxDQUFDLFdBQWYsR0FBNkIsU0FBQSxHQUFBO0FBRXpCLE1BQUEsVUFBQTtBQUFBLEVBQUEsR0FBQSxHQUFNLENBQUEsQ0FBRSxjQUFGLENBQU4sQ0FBQTtBQUFBLEVBRUEsS0FBQSxHQUFRLEdBQUEsQ0FBQSxXQUZSLENBQUE7QUFBQSxFQUlBLEtBQUssQ0FBQyxHQUFOLENBQVUsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsR0FBRyxDQUFDLElBQUosQ0FBUyxnQ0FBVCxDQUFoQixFQUE0RCxHQUE1RCxFQUNOO0FBQUEsSUFBQSxDQUFBLEVBQUcsQ0FBQSxFQUFIO0FBQUEsSUFDQyxLQUFBLEVBQU8sQ0FEUjtHQURNLEVBSU47QUFBQSxJQUFBLENBQUEsRUFBRyxDQUFIO0FBQUEsSUFDQyxLQUFBLEVBQU8sQ0FEUjtHQUpNLENBQVYsRUFNRyxHQU5ILENBSkEsQ0FBQTtBQUFBLEVBWUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxRQUFRLENBQUMsTUFBVCxDQUFnQixHQUFHLENBQUMsSUFBSixDQUFTLGdDQUFULENBQWhCLEVBQTRELEdBQTVELEVBQ047QUFBQSxJQUFBLENBQUEsRUFBRyxDQUFBLEVBQUg7QUFBQSxJQUNDLEtBQUEsRUFBTyxDQURSO0dBRE0sRUFJTjtBQUFBLElBQUEsQ0FBQSxFQUFHLENBQUg7QUFBQSxJQUNDLEtBQUEsRUFBTyxDQURSO0dBSk0sQ0FBVixFQU1HLE1BTkgsQ0FaQSxDQUFBO0FBQUEsRUFvQkEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxRQUFRLENBQUMsTUFBVCxDQUFnQixHQUFHLENBQUMsSUFBSixDQUFTLCtCQUFULENBQWhCLEVBQTJELEdBQTNELEVBQ047QUFBQSxJQUFBLENBQUEsRUFBRyxDQUFBLEVBQUg7QUFBQSxJQUNDLEtBQUEsRUFBTyxDQURSO0dBRE0sRUFJTjtBQUFBLElBQUEsQ0FBQSxFQUFHLENBQUg7QUFBQSxJQUNDLEtBQUEsRUFBTyxDQURSO0dBSk0sQ0FBVixFQU1HLE1BTkgsQ0FwQkEsQ0FBQTtTQThCQTtBQUFBLElBQUEsQ0FBQSxFQUFHLEtBQUg7QUFBQSxJQUNBLE1BQUEsRUFBTyxHQUFHLENBQUMsTUFBSixDQUFBLENBQVksQ0FBQyxHQURwQjtJQWhDeUI7QUFBQSxDQUY3QixDQUFBOztBQUFBLE1Bc0NNLENBQUMsT0FBTyxDQUFDLFlBQWYsR0FBOEIsU0FBQSxHQUFBO0FBQzFCLE1BQUEsVUFBQTtBQUFBLEVBQUEsR0FBQSxHQUFNLENBQUEsQ0FBRSxnQ0FBRixDQUFOLENBQUE7QUFBQSxFQUVBLEtBQUEsR0FBUSxHQUFBLENBQUEsV0FGUixDQUFBO0FBQUEsRUFJQSxLQUFLLENBQUMsR0FBTixDQUFVLFFBQVEsQ0FBQyxNQUFULENBQWdCLEdBQUcsQ0FBQyxJQUFKLENBQVMsR0FBVCxDQUFoQixFQUFnQyxFQUFoQyxFQUNOO0FBQUEsSUFBQSxTQUFBLEVBQVUsQ0FBVjtHQURNLEVBR047QUFBQSxJQUFBLFNBQUEsRUFBVSxDQUFWO0dBSE0sQ0FBVixDQUpBLENBQUE7QUFBQSxFQVVBLEtBQUssQ0FBQyxHQUFOLENBQVUsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsR0FBRyxDQUFDLElBQUosQ0FBUyxHQUFULENBQWhCLEVBQWdDLEdBQWhDLEVBQ047QUFBQSxJQUFBLEtBQUEsRUFBTSxDQUFOO0FBQUEsSUFDQSxRQUFBLEVBQVMsR0FEVDtBQUFBLElBRUEsZUFBQSxFQUFnQixJQUZoQjtHQURNLEVBS047QUFBQSxJQUFBLEtBQUEsRUFBTSxDQUFOO0FBQUEsSUFDQSxRQUFBLEVBQVMsQ0FEVDtBQUFBLElBRUEsSUFBQSxFQUFLLElBQUksQ0FBQyxPQUZWO0dBTE0sQ0FBVixFQVFJLE1BUkosQ0FWQSxDQUFBO1NBb0JBO0FBQUEsSUFBQSxDQUFBLEVBQUcsS0FBSDtBQUFBLElBQ0EsTUFBQSxFQUFPLEdBQUcsQ0FBQyxNQUFKLENBQUEsQ0FBWSxDQUFDLEdBRHBCO0lBckIwQjtBQUFBLENBdEM5QixDQUFBOztBQUFBLE1BK0RNLENBQUMsT0FBTyxDQUFDLFNBQWYsR0FBMkIsU0FBQSxHQUFBO0FBQ3ZCLE1BQUEsVUFBQTtBQUFBLEVBQUEsR0FBQSxHQUFNLENBQUEsQ0FBRSxzQkFBRixDQUFOLENBQUE7QUFBQSxFQUVBLEtBQUEsR0FBUSxHQUFBLENBQUEsV0FGUixDQUFBO0FBQUEsRUFJQSxLQUFLLENBQUMsR0FBTixDQUFVLFFBQVEsQ0FBQyxNQUFULENBQWdCLEdBQWhCLEVBQXFCLEdBQXJCLEVBQ047QUFBQSxJQUFBLE9BQUEsRUFBUyxDQUFUO0FBQUEsSUFDQyxLQUFBLEVBQU8sR0FEUjtHQURNLEVBSU47QUFBQSxJQUFBLE9BQUEsRUFBUyxDQUFUO0FBQUEsSUFDQyxLQUFBLEVBQU8sQ0FEUjtHQUpNLENBQVYsRUFNRyxJQU5ILENBSkEsQ0FBQTtBQUFBLEVBWUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFiLENBWkEsQ0FBQTtTQWFBO0FBQUEsSUFBQSxDQUFBLEVBQUUsS0FBRjtBQUFBLElBQ0EsTUFBQSxFQUFPLEdBQUcsQ0FBQyxNQUFKLENBQUEsQ0FBWSxDQUFDLEdBRHBCO0lBZHVCO0FBQUEsQ0EvRDNCLENBQUE7O0FBQUEsTUFrRk0sQ0FBQyxPQUFPLENBQUMsYUFBZixHQUErQixTQUFBLEdBQUE7QUFDM0IsTUFBQSxVQUFBO0FBQUEsRUFBQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLGVBQUYsQ0FBTixDQUFBO0FBQUEsRUFFQSxLQUFBLEdBQVEsR0FBQSxDQUFBLFdBRlIsQ0FBQTtBQUFBLEVBSUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxRQUFRLENBQUMsTUFBVCxDQUFnQixHQUFHLENBQUMsSUFBSixDQUFTLGtCQUFULENBQWhCLEVBQThDLEdBQTlDLEVBQ047QUFBQSxJQUFBLENBQUEsRUFBRyxDQUFBLEVBQUg7QUFBQSxJQUNBLEtBQUEsRUFBTyxDQURQO0dBRE0sRUFJTjtBQUFBLElBQUEsQ0FBQSxFQUFHLENBQUg7QUFBQSxJQUNBLEtBQUEsRUFBTyxDQURQO0dBSk0sQ0FBVixDQUpBLENBQUE7QUFBQSxFQVlBLEtBQUssQ0FBQyxHQUFOLENBQVUsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsR0FBRyxDQUFDLElBQUosQ0FBUyxrQkFBVCxDQUFoQixFQUE4QyxHQUE5QyxFQUNOO0FBQUEsSUFBQSxDQUFBLEVBQUcsQ0FBQSxFQUFIO0FBQUEsSUFDQSxLQUFBLEVBQU8sQ0FEUDtHQURNLEVBSU47QUFBQSxJQUFBLENBQUEsRUFBRyxDQUFIO0FBQUEsSUFDQSxLQUFBLEVBQU8sQ0FEUDtHQUpNLENBQVYsRUFNRyxNQU5ILENBWkEsQ0FBQTtBQUFBLEVBb0JBLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixDQXBCQSxDQUFBO1NBcUJBO0FBQUEsSUFBQSxDQUFBLEVBQUUsS0FBRjtBQUFBLElBQ0EsTUFBQSxFQUFPLEdBQUcsQ0FBQyxNQUFKLENBQUEsQ0FBWSxDQUFDLEdBRHBCO0lBdEIyQjtBQUFBLENBbEYvQixDQUFBOztBQUFBLE1BNEdNLENBQUMsT0FBTyxDQUFDLHFCQUFmLEdBQXVDLFNBQUEsR0FBQTtBQUNuQyxNQUFBLDJDQUFBO0FBQUEsRUFBQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLGVBQUYsQ0FBTixDQUFBO0FBQUEsRUFFQSxLQUFBLEdBQVEsR0FBQSxDQUFBLFdBRlIsQ0FBQTtBQUFBLEVBSUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxRQUFRLENBQUMsTUFBVCxDQUFnQixHQUFHLENBQUMsSUFBSixDQUFTLG1CQUFULENBQWhCLEVBQStDLEdBQS9DLEVBQ047QUFBQSxJQUFBLEtBQUEsRUFBTyxDQUFQO0dBRE0sRUFHTjtBQUFBLElBQUEsS0FBQSxFQUFPLENBQVA7R0FITSxDQUFWLEVBSUcsR0FKSCxDQUpBLENBQUE7QUFVQTtBQUFBLE9BQUEsNkNBQUE7bUJBQUE7QUFDSSxJQUFBLElBQUcsQ0FBQSxHQUFFLENBQUYsS0FBTyxDQUFWO0FBQ0ksTUFBQSxRQUFBLEdBQVcsQ0FBQSxFQUFYLENBREo7S0FBQSxNQUFBO0FBR0ksTUFBQSxRQUFBLEdBQVcsRUFBWCxDQUhKO0tBQUE7QUFBQSxJQUtBLEtBQUssQ0FBQyxHQUFOLENBQVUsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsQ0FBQSxDQUFFLEtBQUYsQ0FBaEIsRUFBMEIsR0FBMUIsRUFDTjtBQUFBLE1BQUEsQ0FBQSxFQUFHLFFBQUg7QUFBQSxNQUNDLEtBQUEsRUFBTyxDQURSO0tBRE0sRUFJTjtBQUFBLE1BQUEsQ0FBQSxFQUFHLENBQUg7QUFBQSxNQUNDLEtBQUEsRUFBTyxDQURSO0tBSk0sQ0FBVixFQU1HLENBTkgsQ0FMQSxDQURKO0FBQUEsR0FWQTtBQUFBLEVBeUJBLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixDQXpCQSxDQUFBO1NBMEJBO0FBQUEsSUFBQSxDQUFBLEVBQUUsS0FBRjtBQUFBLElBQ0EsTUFBQSxFQUFPLEdBQUcsQ0FBQyxNQUFKLENBQUEsQ0FBWSxDQUFDLEdBRHBCO0lBM0JtQztBQUFBLENBNUd2QyxDQUFBOzs7OztBQ0FBLElBQUEsd0JBQUE7RUFBQTs7NkJBQUE7O0FBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSwrQkFBUixDQUFiLENBQUE7O0FBQUE7QUFHSSxrQ0FBQSxDQUFBOztBQUFhLEVBQUEsc0JBQUMsSUFBRCxHQUFBO0FBQ1QsNkNBQUEsQ0FBQTtBQUFBLElBQUEsOENBQU0sSUFBTixDQUFBLENBRFM7RUFBQSxDQUFiOztBQUFBLHlCQUdBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFFUixJQUFBLElBQUMsQ0FBQSxlQUFELEdBQW1CLENBQUEsQ0FBRSxrQkFBRixDQUFuQixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsU0FBRCxDQUFBLENBREEsQ0FBQTtXQUdBLDJDQUFBLEVBTFE7RUFBQSxDQUhaLENBQUE7O0FBQUEseUJBV0EsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUVQLElBQUEsQ0FBQSxDQUFFLHFEQUFGLENBQXdELENBQUMsS0FBekQsQ0FBK0QsSUFBQyxDQUFBLFlBQWhFLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGVBQWUsQ0FBQyxJQUFqQixDQUFzQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxDQUFELEVBQUcsQ0FBSCxHQUFBO2VBQ2xCLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFpQixLQUFDLENBQUEsV0FBbEIsRUFEa0I7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QixDQURBLENBQUE7V0FNQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxFQUF0QixDQUF5QixPQUF6QixFQUFrQyxJQUFsQyxFQUF3QyxJQUFDLENBQUEsUUFBekMsRUFSTztFQUFBLENBWFgsQ0FBQTs7QUFBQSx5QkFzQkEsUUFBQSxHQUFVLFNBQUMsQ0FBRCxHQUFBO0FBQ04sUUFBQSxNQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxPQUFaLENBQW9CLE9BQXBCLENBQVQsQ0FBQTtBQUNBLElBQUEsSUFBRyxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVosQ0FBSDtBQUNJLE1BQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVosQ0FBWixDQUFBLENBQUE7YUFDQSxDQUFDLENBQUMsY0FBRixDQUFBLEVBRko7S0FGTTtFQUFBLENBdEJWLENBQUE7O0FBQUEseUJBNEJBLFlBQUEsR0FBYyxTQUFDLENBQUQsR0FBQTtBQUVWLElBQUEsSUFBRyxDQUFBLENBQUcsQ0FBQyxDQUFDLENBQUMsSUFBRixLQUFVLFFBQVgsQ0FBQSxJQUF5QixDQUFDLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLElBQTVCLENBQUEsQ0FBQSxHQUFxQyxDQUF0QyxDQUExQixDQUFMO2FBQ0ksQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsT0FBcEIsQ0FBNEI7QUFBQSxRQUN4QixPQUFBLEVBQVMsQ0FEZTtPQUE1QixFQUVHLFNBQUEsR0FBQTtBQUNDLFFBQUEsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQSxDQUFBLENBQUE7ZUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBLEVBRkQ7TUFBQSxDQUZILEVBREo7S0FGVTtFQUFBLENBNUJkLENBQUE7O0FBQUEseUJBc0NBLFdBQUEsR0FBYSxTQUFDLENBQUQsR0FBQTtBQUNULFFBQUEsNEZBQUE7QUFBQSxJQUFBLEdBQUEsR0FBTSxDQUFBLENBQUUsSUFBRixDQUFOLENBQUE7QUFBQSxJQUNBLGFBQUEsR0FBZ0IsR0FBRyxDQUFDLElBQUosQ0FBUyxRQUFULENBRGhCLENBQUE7QUFBQSxJQUVBLGNBQUEsR0FBaUIsQ0FBQSxDQUFFLHVDQUFGLENBRmpCLENBQUE7QUFBQSxJQUdBLE1BQUEsR0FBUyxHQUFHLENBQUMsUUFBSixDQUFhLE1BQWIsQ0FIVCxDQUFBO0FBQUEsSUFLQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBLENBTEEsQ0FBQTtBQU9BLElBQUEsSUFBRyxHQUFHLENBQUMsUUFBSixDQUFhLGtCQUFiLENBQUg7QUFDSSxNQUFBLEVBQUEsR0FBSyxDQUFBLENBQUUsNEJBQUYsQ0FBTCxDQUFBO0FBQUEsTUFDQSxFQUFFLENBQUMsSUFBSCxDQUFRLFVBQVIsQ0FBbUIsQ0FBQyxJQUFwQixDQUF5QixHQUFHLENBQUMsSUFBSixDQUFTLFlBQVQsQ0FBc0IsQ0FBQyxJQUF2QixDQUFBLENBQXpCLENBREEsQ0FBQTtBQUFBLE1BRUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxpQkFBUixDQUEwQixDQUFDLElBQTNCLENBQWdDLEdBQUcsQ0FBQyxJQUFKLENBQVMsaUJBQVQsQ0FBMkIsQ0FBQyxJQUE1QixDQUFBLENBQWhDLENBRkEsQ0FBQTtBQUFBLE1BR0EsRUFBRSxDQUFDLElBQUgsQ0FBUSxnQkFBUixDQUF5QixDQUFDLEdBQTFCLENBQThCO0FBQUEsUUFBQyxlQUFBLEVBQWlCLE9BQUEsR0FBVSxHQUFHLENBQUMsSUFBSixDQUFTLFlBQVQsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixRQUE1QixDQUFWLEdBQWtELElBQXBFO09BQTlCLENBSEEsQ0FESjtLQVBBO0FBY0EsSUFBQSxJQUFJLENBQUEsQ0FBRSxHQUFBLEdBQU0sYUFBUixDQUFzQixDQUFDLElBQXZCLENBQUEsQ0FBQSxLQUFpQyxDQUFyQztBQUdJLE1BQUEsY0FBYyxDQUFDLFFBQWYsQ0FBQSxDQUF5QixDQUFDLElBQTFCLENBQStCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLENBQUQsRUFBRyxDQUFILEdBQUE7aUJBQzNCLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxRQUFMLENBQWMsMEJBQWQsRUFEMkI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQixDQUFBLENBQUE7QUFHQSxNQUFBLElBQUcsTUFBSDtBQUNJLFFBQUEsQ0FBQSxHQUFJLEdBQUcsQ0FBQyxJQUFKLENBQVMsVUFBVCxDQUFvQixDQUFDLEtBQXJCLENBQUEsQ0FBSixDQUFBO0FBQUEsUUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixDQUFDLENBQUMsSUFBRixDQUFBLENBQTNCLENBREEsQ0FESjtPQUhBO0FBQUEsTUFPQSxDQUFBLENBQUUsR0FBQSxHQUFNLGFBQVIsQ0FBc0IsQ0FBQyxRQUF2QixDQUFnQyxjQUFoQyxDQVBBLENBQUE7QUFBQSxNQVNBLEdBQUEsR0FBTSxDQUFBLENBQUUsc0JBQUYsQ0FUTixDQUFBO0FBQUEsTUFVQSxPQUFBLEdBQVUsR0FBRyxDQUFDLE1BQUosQ0FBQSxDQUFBLEdBQWUsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBQSxDQUFmLElBQXNDLENBQUEsQ0FBRSxjQUFGLENBQWlCLENBQUMsSUFBbEIsQ0FBdUIscUJBQXZCLENBQTZDLENBQUMsSUFBOUMsQ0FBQSxDQUFBLEtBQXdELENBVnhHLENBQUE7QUFBQSxNQVdBLFNBQUEsR0FBWSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsU0FBVixDQUFBLENBWFosQ0FBQTtBQUFBLE1BWUEsTUFBQSxHQUFZLE9BQUgsR0FBZ0IsQ0FBaEIsR0FBdUIsU0FaaEMsQ0FBQTtBQUFBLE1BYUEsUUFBQSxHQUFXLEdBQUcsQ0FBQyxHQUFKLENBQVEsVUFBUixFQUF1QixPQUFILEdBQWdCLE9BQWhCLEdBQTZCLFVBQWpELENBYlgsQ0FBQTtBQUFBLE1BY0EsR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFZLENBQUMsQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBQUEsR0FBcUIsR0FBRyxDQUFDLFdBQUosQ0FBQSxDQUF0QixDQUFBLEdBQTJDLENBQTVDLENBQUEsR0FBaUQsTUFBN0QsQ0FkTixDQUFBO0FBZUEsTUFBQSxJQUFHLENBQUEsT0FBQSxJQUFhLENBQUMsR0FBQSxHQUFNLFNBQVAsQ0FBaEI7QUFBdUMsUUFBQSxHQUFBLEdBQU0sU0FBTixDQUF2QztPQWZBO0FBQUEsTUFnQkEsR0FBRyxDQUFDLEdBQUosQ0FBUSxLQUFSLEVBQWUsR0FBQSxHQUFNLElBQXJCLENBaEJBLENBQUE7YUFxQkEsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsR0FBcEIsQ0FBd0IsU0FBeEIsRUFBbUMsQ0FBbkMsQ0FBcUMsQ0FBQyxLQUF0QyxDQUE0QyxDQUE1QyxDQUE4QyxDQUFDLElBQS9DLENBQUEsQ0FBcUQsQ0FBQyxPQUF0RCxDQUE4RDtBQUFBLFFBQzFELE9BQUEsRUFBUyxDQURpRDtPQUE5RCxFQXhCSjtLQWZTO0VBQUEsQ0F0Q2IsQ0FBQTs7c0JBQUE7O0dBRHVCLFdBRjNCLENBQUE7O0FBQUEsTUFxRk0sQ0FBQyxPQUFQLEdBQWlCLFlBckZqQixDQUFBOzs7OztBQ0NBLElBQUEsc0NBQUE7RUFBQTs7NkJBQUE7O0FBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSwrQkFBUixDQUFiLENBQUE7O0FBQUEsUUFDQSxHQUFXLE9BQUEsQ0FBUSw2QkFBUixDQURYLENBQUE7O0FBQUE7QUFLSSxzQ0FBQSxDQUFBOztBQUFhLEVBQUEsMEJBQUMsSUFBRCxHQUFBO0FBQ1QsdURBQUEsQ0FBQTtBQUFBLDZEQUFBLENBQUE7QUFBQSxpRUFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsaUVBQUEsQ0FBQTtBQUFBLCtEQUFBLENBQUE7QUFBQSw2REFBQSxDQUFBO0FBQUEsSUFBQSxrREFBTSxJQUFOLENBQUEsQ0FEUztFQUFBLENBQWI7O0FBQUEsNkJBSUEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBRVIsSUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLG1CQUFWLENBQVgsQ0FBQTtBQUVBLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsR0FBa0IsQ0FBckI7QUFDSSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksbUJBQVosQ0FBWCxDQURKO0tBRkE7QUFLQSxJQUFBLElBQUcsSUFBSSxDQUFDLElBQUwsS0FBYSxNQUFoQjtBQUNJLE1BQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFaLENBREo7S0FBQSxNQUFBO0FBR0ksTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBQVosQ0FISjtLQUxBO0FBQUEsSUFVQSxJQUFDLENBQUEsY0FBRCxHQUFrQixLQVZsQixDQUFBO0FBQUEsSUFXQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQVhwQixDQUFBO0FBQUEsSUFZQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FaaEIsQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLENBQXFCLFdBQXJCLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsT0FBdkMsQ0FiaEIsQ0FBQTtBQUFBLElBY0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLENBQUMsTUFBTCxJQUFlLENBZHpCLENBQUE7QUFBQSxJQWVBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsZ0JBQWQsQ0FmYixDQUFBO0FBQUEsSUFnQkEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxpQkFBZCxDQWhCZCxDQUFBO0FBQUEsSUFpQkEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsVUFBTCxJQUFtQixLQWpCakMsQ0FBQTtBQUFBLElBa0JBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLE9BQUwsSUFBZ0IsSUFsQjVCLENBQUE7QUFBQSxJQW1CQSxJQUFDLENBQUEsbUJBQUQsR0FBdUIsS0FuQnZCLENBQUE7QUFBQSxJQW9CQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsS0FwQnRCLENBQUE7QUFBQSxJQXFCQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQXJCaEIsQ0FBQTtBQUFBLElBdUJBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0F2QkEsQ0FBQTtBQUFBLElBeUJBLElBQUMsQ0FBQSxTQUFELENBQUEsQ0F6QkEsQ0FBQTtXQTJCQSwrQ0FBQSxFQTdCUTtFQUFBLENBSlosQ0FBQTs7QUFBQSw2QkFtQ0EsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNQLElBQUEsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEVBQVYsQ0FBYSxRQUFiLEVBQXdCLElBQUMsQ0FBQSxhQUF6QixDQUFBLENBQUE7QUFBQSxJQUVBLENBQUEsQ0FBRSxJQUFDLENBQUEsR0FBSCxDQUFPLENBQUMsRUFBUixDQUFXLE9BQVgsRUFBb0IsZ0JBQXBCLEVBQXNDLElBQUMsQ0FBQSxTQUF2QyxDQUZBLENBQUE7QUFBQSxJQUdBLENBQUEsQ0FBRSxJQUFDLENBQUEsR0FBSCxDQUFPLENBQUMsRUFBUixDQUFXLE9BQVgsRUFBb0IsaUJBQXBCLEVBQXVDLElBQUMsQ0FBQSxTQUF4QyxDQUhBLENBQUE7QUFJQSxJQUFBLElBQUcsSUFBQyxDQUFBLFFBQUQsS0FBYSxJQUFoQjtBQUNJLE1BQUEsQ0FBQSxDQUFFLElBQUMsQ0FBQSxHQUFILENBQU8sQ0FBQyxFQUFSLENBQVcsT0FBWCxFQUFvQixtQkFBcEIsRUFBeUMsSUFBQyxDQUFBLGdCQUExQyxDQUFBLENBQUE7QUFBQSxNQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsR0FBSCxDQUFPLENBQUMsRUFBUixDQUFXLFdBQVgsRUFBd0IsbUJBQXhCLEVBQTZDLElBQUMsQ0FBQSxpQkFBOUMsQ0FEQSxDQUFBO2FBRUEsQ0FBQSxDQUFFLElBQUMsQ0FBQSxHQUFILENBQU8sQ0FBQyxFQUFSLENBQVcsWUFBWCxFQUF5QixtQkFBekIsRUFBOEMsSUFBQyxDQUFBLGtCQUEvQyxFQUhKO0tBTE87RUFBQSxDQW5DWCxDQUFBOztBQUFBLDZCQThDQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFDZCxJQUFBLE1BQU0sQ0FBQyxhQUFQLENBQXFCLElBQUMsQ0FBQSxZQUF0QixDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsbUJBQUQsR0FBdUIsS0FGVDtFQUFBLENBOUNsQixDQUFBOztBQUFBLDZCQWtEQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7QUFDZixJQUFBLE1BQU0sQ0FBQyxhQUFQLENBQXFCLElBQUMsQ0FBQSxZQUF0QixDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsS0FGUDtFQUFBLENBbERuQixDQUFBOztBQUFBLDZCQXNEQSxrQkFBQSxHQUFvQixTQUFBLEdBQUE7QUFDaEIsSUFBQSxJQUFHLElBQUMsQ0FBQSxtQkFBRCxLQUF3QixLQUEzQjtBQUNJLE1BQUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsV0FBQSxDQUFZLENBQUMsU0FBQSxHQUFBO2VBQ3pCLENBQUEsQ0FBRSwrQkFBRixDQUFrQyxDQUFDLE9BQW5DLENBQTJDLE9BQTNDLEVBRHlCO01BQUEsQ0FBRCxDQUFaLEVBRWIsSUFGYSxDQUFoQixDQUFBO2FBR0EsSUFBQyxDQUFBLGtCQUFELEdBQXNCLE1BSjFCO0tBRGdCO0VBQUEsQ0F0RHBCLENBQUE7O0FBQUEsNkJBNkRBLFNBQUEsR0FBVyxTQUFDLENBQUQsR0FBQTtBQUNQLFFBQUEsU0FBQTtBQUFBLElBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFSLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBTSxJQUFDLENBQUEsT0FEUCxDQUFBO1dBR0EsUUFBUSxDQUFDLEVBQVQsQ0FBWSxDQUFBLENBQUUsR0FBRixDQUFaLEVBQW9CLEVBQXBCLEVBQ0k7QUFBQSxNQUFBLE9BQUEsRUFBUyxDQUFUO0FBQUEsTUFDQSxLQUFBLEVBQU8sR0FEUDtBQUFBLE1BRUEsVUFBQSxFQUFZLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDUixVQUFBLElBQUksQ0FBQyxTQUFMLENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxRQUFRLENBQUMsR0FBVCxDQUFhLENBQUEsQ0FBRSxHQUFGLENBQWIsRUFDSTtBQUFBLFlBQUEsS0FBQSxFQUFPLENBQVA7V0FESixDQURBLENBQUE7aUJBSUEsUUFBUSxDQUFDLEVBQVQsQ0FBWSxDQUFBLENBQUUsR0FBRixDQUFaLEVBQW9CLEdBQXBCLEVBQ0k7QUFBQSxZQUFBLE9BQUEsRUFBUyxDQUFUO0FBQUEsWUFDQSxLQUFBLEVBQU8sR0FEUDtXQURKLEVBTFE7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZaO0tBREosRUFKTztFQUFBLENBN0RYLENBQUE7O0FBQUEsNkJBK0VBLFNBQUEsR0FBVyxTQUFDLENBQUQsR0FBQTtBQUNQLFFBQUEsU0FBQTtBQUFBLElBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFSLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBTSxJQUFDLENBQUEsT0FEUCxDQUFBO1dBR0EsUUFBUSxDQUFDLEVBQVQsQ0FBWSxDQUFBLENBQUUsR0FBRixDQUFaLEVBQW9CLEVBQXBCLEVBQ0k7QUFBQSxNQUFBLE9BQUEsRUFBUyxDQUFUO0FBQUEsTUFDQSxLQUFBLEVBQU8sR0FEUDtBQUFBLE1BRUEsVUFBQSxFQUFZLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDUixVQUFBLElBQUksQ0FBQyxTQUFMLENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxRQUFRLENBQUMsR0FBVCxDQUFhLENBQUEsQ0FBRSxHQUFGLENBQWIsRUFDSTtBQUFBLFlBQUEsS0FBQSxFQUFPLElBQVA7V0FESixDQURBLENBQUE7aUJBSUEsUUFBUSxDQUFDLEVBQVQsQ0FBWSxDQUFBLENBQUUsR0FBRixDQUFaLEVBQW9CLEdBQXBCLEVBQ0k7QUFBQSxZQUFBLE9BQUEsRUFBUyxDQUFUO0FBQUEsWUFDQSxLQUFBLEVBQU8sQ0FEUDtBQUFBLFlBRUEsS0FBQSxFQUFPLEdBRlA7V0FESixFQUxRO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGWjtLQURKLEVBSk87RUFBQSxDQS9FWCxDQUFBOztBQUFBLDZCQW1HQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1AsUUFBQSxxQkFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsUUFBVixDQUFtQixPQUFuQixDQUFYLENBQUE7QUFBQSxJQUVBLFNBQUEsR0FBWSxDQUFBLENBQUUsNENBQUYsQ0FGWixDQUFBO0FBQUEsSUFHQSxVQUFBLEdBQWEsQ0FBQSxDQUFFLDZDQUFGLENBSGIsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksU0FBWixFQUF1QixVQUF2QixDQUxBLENBQUE7V0FPQSxDQUFBLENBQUUsWUFBRixDQUFlLENBQUMsRUFBaEIsQ0FBbUIsT0FBbkIsRUFBNEIsU0FBQSxHQUFBO0FBQ3hCLFVBQUEsSUFBQTtBQUFBLE1BQUEsQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLFFBQUwsQ0FBYyxRQUFkLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFPLENBQUEsQ0FBRSxJQUFGLENBRFAsQ0FBQTthQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDUCxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsV0FBUixDQUFvQixRQUFwQixFQUE4QixHQUE5QixFQURPO01BQUEsQ0FBWCxFQUh3QjtJQUFBLENBQTVCLEVBUk87RUFBQSxDQW5HWCxDQUFBOztBQUFBLDZCQWtIQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ1gsUUFBQSxVQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsR0FBbEIsQ0FBc0IsT0FBdEIsRUFBK0IsTUFBL0IsQ0FBQSxDQUFBO0FBQ0EsSUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBYjtBQUNJLE1BQUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxHQUFkLENBQWtCLE9BQWxCLEVBQTRCLE1BQTVCLENBQUEsQ0FESjtLQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsTUFBRCxHQUFVLENBQWI7QUFDRCxNQUFBLElBQUMsQ0FBQSxZQUFZLENBQUMsR0FBZCxDQUFrQixPQUFsQixFQUE0QixLQUE1QixDQUFBLENBREM7S0FBQSxNQUFBO0FBR0QsTUFBQSxJQUFDLENBQUEsWUFBWSxDQUFDLEdBQWQsQ0FBa0IsT0FBbEIsRUFBNEIsWUFBNUIsQ0FBQSxDQUhDO0tBSEw7QUFBQSxJQVFBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLFlBQVksQ0FBQyxLQUFkLENBQUEsQ0FBcUIsQ0FBQyxVQUF0QixDQUFBLENBUmIsQ0FBQTtBQUFBLElBU0EsVUFBQSxHQUFhLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFUM0IsQ0FBQTtBQUFBLElBV0EsSUFBQyxDQUFBLFlBQVksQ0FBQyxHQUFkLENBQWtCLE9BQWxCLEVBQTJCLElBQUMsQ0FBQSxTQUE1QixDQVhBLENBQUE7QUFBQSxJQVlBLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxHQUFsQixDQUFzQixPQUF0QixFQUErQixVQUFBLEdBQWMsSUFBQyxDQUFBLFNBQTlDLENBWkEsQ0FBQTtBQUFBLElBYUEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxJQUFDLENBQUEsZ0JBQWQsRUFDSTtBQUFBLE1BQUEsQ0FBQSxFQUFHLENBQUEsSUFBRSxDQUFBLFlBQUYsR0FBaUIsSUFBQyxDQUFBLFNBQXJCO0tBREosQ0FiQSxDQUFBO0FBZ0JBLElBQUEsSUFBRyxDQUFBLElBQUUsQ0FBQSxjQUFMO2FBQ0ksSUFBQyxDQUFBLGVBQUQsQ0FBQSxFQURKO0tBakJXO0VBQUEsQ0FsSGYsQ0FBQTs7QUFBQSw2QkF1SUEsZUFBQSxHQUFpQixTQUFBLEdBQUE7QUFDYixRQUFBLGNBQUE7QUFBQSxJQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQTNCLENBQUE7QUFFQSxJQUFBLElBQUcsSUFBQyxDQUFBLE1BQUo7QUFBZ0IsTUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBQSxDQUFBLENBQWhCO0tBRkE7QUFBQSxJQUlBLEVBQUEsR0FBSyxDQUFBLENBQUUsSUFBQyxDQUFDLEdBQUosQ0FBUSxDQUFDLElBQVQsQ0FBYyxJQUFkLENBSkwsQ0FBQTtBQU9BLElBQUEsSUFBRyxJQUFDLENBQUEsVUFBSjtBQUNJLE1BQUEsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFBLENBREo7S0FQQTtBQVVBLElBQUEsSUFBRyxJQUFDLENBQUEsTUFBRCxHQUFVLENBQWI7QUFDSSxNQUFBLElBQUcsSUFBQyxDQUFBLFVBQUo7QUFDSSxRQUFBLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsTUFBQSxDQUFPLEdBQUEsR0FBTSxFQUFOLEdBQVcsb0JBQWxCLEVBQXVDO0FBQUEsVUFDbkQsSUFBQSxFQUFLLElBRDhDO0FBQUEsVUFFbkQsVUFBQSxFQUFZLElBRnVDO0FBQUEsVUFHbkQsYUFBQSxFQUFlLElBQUMsQ0FBQSxNQUhtQztBQUFBLFVBSW5ELFVBQUEsRUFBWSxHQUFBLEdBQU0sRUFBTixHQUFXLHFCQUo0QjtBQUFBLFVBS25ELGlCQUFBLEVBQW1CLElBTGdDO0FBQUEsVUFNbkQsWUFBQSxFQUFjLElBQUMsQ0FBQSxrQkFOb0M7QUFBQSxVQU9uRCxVQUFBLEVBQVksSUFBQyxDQUFBLGdCQVBzQztBQUFBLFVBUW5ELGtCQUFBLEVBQW9CLElBQUMsQ0FBQSxrQkFSOEI7QUFBQSxVQVNuRCxnQkFBQSxFQUFrQixJQUFDLENBQUEsZ0JBVGdDO0FBQUEsVUFVbkQsY0FBQSxFQUFnQixJQUFDLENBQUEsTUFWa0M7U0FBdkMsQ0FBaEIsQ0FESjtPQUFBLE1BQUE7QUFjSSxRQUFBLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsTUFBQSxDQUFPLEdBQUEsR0FBTSxFQUFOLEdBQVcsb0JBQWxCLEVBQXVDO0FBQUEsVUFDbkQsSUFBQSxFQUFLLElBRDhDO0FBQUEsVUFFbkQsVUFBQSxFQUFZLElBRnVDO0FBQUEsVUFHbkQsYUFBQSxFQUFlLElBQUMsQ0FBQSxNQUhtQztBQUFBLFVBSW5ELGNBQUEsRUFBZ0IsSUFBQyxDQUFBLE1BSmtDO0FBQUEsVUFLbkQsWUFBQSxFQUFjLElBQUMsQ0FBQSxrQkFMb0M7QUFBQSxVQU1uRCxVQUFBLEVBQVksSUFBQyxDQUFBLGdCQU5zQztBQUFBLFVBT25ELGtCQUFBLEVBQW9CLElBQUMsQ0FBQSxrQkFQOEI7QUFBQSxVQVFuRCxnQkFBQSxFQUFrQixJQUFDLENBQUEsZ0JBUmdDO1NBQXZDLENBQWhCLENBZEo7T0FESjtLQUFBLE1BQUE7QUEyQkksTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLE1BQUEsQ0FBTyxHQUFBLEdBQU0sRUFBTixHQUFXLG9CQUFsQixFQUF1QztBQUFBLFFBQ25ELElBQUEsRUFBSyxJQUQ4QztBQUFBLFFBRW5ELFVBQUEsRUFBWSxJQUZ1QztBQUFBLFFBR25ELGFBQUEsRUFBZSxDQUhvQztBQUFBLFFBSW5ELGNBQUEsRUFBZ0IsQ0FKbUM7QUFBQSxRQUtuRCxZQUFBLEVBQWMsSUFBQyxDQUFBLGtCQUxvQztBQUFBLFFBTW5ELFVBQUEsRUFBWSxJQUFDLENBQUEsZ0JBTnNDO0FBQUEsUUFPbkQsa0JBQUEsRUFBb0IsSUFBQyxDQUFBLGtCQVA4QjtBQUFBLFFBUW5ELGdCQUFBLEVBQWtCLElBQUMsQ0FBQSxnQkFSZ0M7T0FBdkMsQ0FBaEIsQ0EzQko7S0FWQTtBQUFBLElBZ0RBLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBaERsQixDQUFBO0FBa0RBLElBQUEsSUFBRyxJQUFDLENBQUEsUUFBRCxLQUFhLElBQWhCO2FBQ0ksSUFBQyxDQUFBLFlBQUQsR0FBZ0IsV0FBQSxDQUFZLENBQUMsU0FBQSxHQUFBO2VBQ3pCLENBQUEsQ0FBRSwrQkFBRixDQUFrQyxDQUFDLE9BQW5DLENBQTJDLE9BQTNDLEVBRHlCO01BQUEsQ0FBRCxDQUFaLEVBRWIsSUFGYSxFQURwQjtLQW5EYTtFQUFBLENBdklqQixDQUFBOztBQUFBLDZCQWdNQSxrQkFBQSxHQUFvQixTQUFBLEdBQUE7QUFDaEIsSUFBQSxDQUFBLENBQUUsSUFBQyxDQUFDLEdBQUosQ0FBUSxDQUFDLE9BQVQsQ0FBaUIsa0JBQWpCLENBQW9DLENBQUMsUUFBckMsQ0FBOEMsU0FBOUMsQ0FBQSxDQUFBO1dBQ0EsQ0FBQSxDQUFFLElBQUMsQ0FBQyxHQUFKLENBQVEsQ0FBQyxJQUFULENBQWMsa0JBQWQsQ0FBaUMsQ0FBQyxRQUFsQyxDQUEyQyxTQUEzQyxFQUZnQjtFQUFBLENBaE1wQixDQUFBOztBQUFBLDZCQW9NQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFDZCxRQUFBLElBQUE7QUFBQSxJQUFBLENBQUEsQ0FBRSxJQUFDLENBQUMsR0FBSixDQUFRLENBQUMsT0FBVCxDQUFpQixrQkFBakIsQ0FBb0MsQ0FBQyxXQUFyQyxDQUFpRCxTQUFqRCxDQUFBLENBQUE7QUFBQSxJQUNBLENBQUEsQ0FBRSxJQUFDLENBQUMsR0FBSixDQUFRLENBQUMsSUFBVCxDQUFjLGtCQUFkLENBQWlDLENBQUMsV0FBbEMsQ0FBOEMsU0FBOUMsQ0FEQSxDQUFBO0FBR0EsSUFBQSxJQUFHLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBRCxLQUFhLElBQWQsQ0FBSjtBQUNJLE1BQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFRLENBQUMsV0FBVixDQUFBLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsSUFBN0IsQ0FBUCxDQUFBO0FBQUEsTUFDQSxDQUFBLENBQUUsMkNBQUYsQ0FBOEMsQ0FBQyxXQUEvQyxDQUEyRCxRQUEzRCxDQURBLENBQUE7QUFBQSxNQUVBLENBQUEsQ0FBRSwyQ0FBRixDQUE4QyxDQUFDLFdBQS9DLENBQTJELFFBQTNELENBRkEsQ0FBQTtBQUFBLE1BR0EsQ0FBQSxDQUFFLDhCQUFBLEdBQWlDLElBQW5DLENBQXdDLENBQUMsUUFBekMsQ0FBa0QsUUFBbEQsQ0FIQSxDQUFBO0FBQUEsTUFJQSxDQUFBLENBQUUsOEJBQUEsR0FBaUMsSUFBbkMsQ0FBd0MsQ0FBQyxNQUF6QyxDQUFBLENBQWlELENBQUMsUUFBbEQsQ0FBMkQsUUFBM0QsQ0FKQSxDQURKO0tBSEE7QUFVQSxJQUFBLElBQUksSUFBQyxDQUFBLFFBQUw7YUFDSSxJQUFDLENBQUEsUUFBUSxDQUFDLFVBQVYsQ0FBcUIsQ0FBQSxDQUFFLElBQUMsQ0FBQyxHQUFKLENBQVEsQ0FBQyxJQUFULENBQWMsc0JBQWQsQ0FBcUMsQ0FBQyxJQUF0QyxDQUEyQyxJQUEzQyxDQUFyQixFQURKO0tBWGM7RUFBQSxDQXBNbEIsQ0FBQTs7QUFBQSw2QkFrTkEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNYLFFBQUEsT0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLENBQUEsQ0FBRSx1Q0FBRixDQUFWLENBQUE7V0FDQSxDQUFBLENBQUUsSUFBQyxDQUFDLEdBQUosQ0FBUSxDQUFDLElBQVQsQ0FBYyxtQkFBZCxDQUFrQyxDQUFDLFFBQW5DLENBQTRDLGVBQTVDLENBQTRELENBQUMsTUFBN0QsQ0FBb0UsT0FBcEUsRUFGVztFQUFBLENBbE5mLENBQUE7O0FBQUEsNkJBdU5BLElBQUEsR0FBTSxTQUFDLEVBQUQsRUFBSyxPQUFMLEdBQUE7QUFFRixRQUFBLFdBQUE7QUFBQSxJQUFBLElBQUcsQ0FBQSxPQUFIO0FBQW9CLE1BQUEsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE9BQVYsQ0FBa0I7QUFBQSxRQUFFLFNBQUEsRUFBVyxDQUFBLENBQUUsR0FBQSxHQUFNLENBQUMsQ0FBQSxDQUFFLElBQUMsQ0FBQSxHQUFILENBQU8sQ0FBQyxJQUFSLENBQWEsSUFBYixDQUFELENBQVIsQ0FBNkIsQ0FBQyxNQUE5QixDQUFBLENBQXNDLENBQUMsR0FBcEQ7T0FBbEIsQ0FBQSxDQUFwQjtLQUFBO0FBQUEsSUFFQSxPQUFBLEdBQVUsQ0FBQSxDQUFFLG1CQUFBLEdBQW9CLEVBQXBCLEdBQXVCLElBQXpCLENBQTZCLENBQUMsSUFBOUIsQ0FBbUMsT0FBbkMsQ0FGVixDQUFBO0FBQUEsSUFJQSxFQUFBLEdBQUssR0FBQSxDQUFBLFdBSkwsQ0FBQTtBQUFBLElBTUEsRUFBRSxDQUFDLEdBQUgsQ0FBTyxRQUFRLENBQUMsRUFBVCxDQUFZLElBQUMsQ0FBQSxnQkFBYixFQUFnQyxFQUFoQyxFQUNIO0FBQUEsTUFBQSxTQUFBLEVBQVUsQ0FBVjtLQURHLENBQVAsQ0FOQSxDQUFBO0FBQUEsSUFTQSxFQUFFLENBQUMsV0FBSCxDQUFlLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7ZUFDWCxLQUFDLENBQUEsUUFBUSxDQUFDLE9BQVYsQ0FBa0IsT0FBbEIsRUFBMkIsQ0FBM0IsRUFEVztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWYsQ0FUQSxDQUFBO0FBQUEsSUFZQSxFQUFFLENBQUMsR0FBSCxDQUFPLFFBQVEsQ0FBQyxFQUFULENBQVksSUFBQyxDQUFBLGdCQUFiLEVBQWdDLEVBQWhDLEVBQ0g7QUFBQSxNQUFBLFNBQUEsRUFBVSxDQUFWO0tBREcsQ0FBUCxDQVpBLENBQUE7V0FlQSxJQUFDLENBQUEsWUFBRCxHQUFnQixRQWpCZDtFQUFBLENBdk5OLENBQUE7OzBCQUFBOztHQUYyQixXQUgvQixDQUFBOztBQUFBLE1BK1BNLENBQUMsT0FBUCxHQUFpQixnQkEvUGpCLENBQUE7Ozs7O0FDQUEsSUFBQSxxQ0FBQTtFQUFBOzs2QkFBQTs7QUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLCtCQUFSLENBQWIsQ0FBQTs7QUFBQSxZQUNBLEdBQWUsT0FBQSxDQUFRLHVCQUFSLENBRGYsQ0FBQTs7QUFBQTtBQUtJLGlDQUFBLENBQUE7O0FBQWEsRUFBQSxxQkFBQyxJQUFELEdBQUE7QUFDVCx5RUFBQSxDQUFBO0FBQUEsSUFBQSw2Q0FBTSxJQUFOLENBQUEsQ0FEUztFQUFBLENBQWI7O0FBQUEsd0JBSUEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBRVIsUUFBQSxNQUFBO0FBQUEsSUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQVosRUFBNEIsSUFBNUIsQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUksQ0FBQyxJQUFMLElBQWEsSUFGckIsQ0FBQTtBQUFBLElBR0EsTUFBQSxHQUFTLElBQUksQ0FBQyxNQUFMLElBQWUsSUFIeEIsQ0FBQTtBQUtBLElBQUEsSUFBRyxDQUFDLGNBQUQsQ0FBSDtBQUNJLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFBLENBQUUsTUFBRixDQUFYLENBREo7S0FMQTtBQVFBLElBQUEsSUFBRyxDQUFBLENBQUUsSUFBQyxDQUFBLElBQUQsS0FBUyxJQUFWLENBQUo7QUFDSSxNQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsVUFBVixDQUFiLENBREo7S0FBQSxNQUFBO0FBR0ksTUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLElBQVYsQ0FBYixDQUhKO0tBUkE7QUFBQSxJQWFBLElBQUMsQ0FBQSxlQUFELEdBQW1CLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFrQixjQUFsQixDQWJuQixDQUFBO1dBZUEsMENBQUEsRUFqQlE7RUFBQSxDQUpaLENBQUE7O0FBQUEsd0JBdUJBLFNBQUEsR0FBVyxTQUFBLEdBQUE7V0FFUCxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsQ0FBRCxFQUFHLENBQUgsR0FBQTtBQUNaLFlBQUEsaUJBQUE7QUFBQSxRQUFBLElBQUEsR0FBTyxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsSUFBTCxDQUFVLGVBQVYsQ0FBUCxDQUFBO0FBRUEsUUFBQSxJQUFHLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBakI7QUFDSSxVQUFBLFdBQUEsR0FBa0IsSUFBQSxNQUFBLENBQU8sSUFBSyxDQUFBLENBQUEsQ0FBWixDQUFsQixDQUFBO2lCQUNBLFdBQVcsQ0FBQyxFQUFaLENBQWUsS0FBZixFQUF1QixLQUFDLENBQUEsc0JBQXhCLEVBRko7U0FIWTtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCLEVBRk87RUFBQSxDQXZCWCxDQUFBOztBQUFBLHdCQW1DQSxzQkFBQSxHQUF3QixTQUFDLENBQUQsR0FBQTtBQUVwQixRQUFBLGFBQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLE9BQVosQ0FBb0IsZUFBcEIsQ0FBVixDQUFBO0FBQ0EsSUFBQSxJQUFJLE9BQU8sQ0FBQyxJQUFSLENBQUEsQ0FBQSxLQUFrQixDQUF0QjtBQUNJLE1BQUEsT0FBQSxHQUFVLENBQUMsQ0FBQyxNQUFaLENBREo7S0FEQTtBQUlBLElBQUEsSUFBRyxPQUFPLENBQUMsSUFBUixDQUFhLE1BQWIsQ0FBQSxLQUF3QixPQUEzQjtBQUNJLE1BQUEsSUFBSSxPQUFPLENBQUMsSUFBUixDQUFhLE1BQWIsQ0FBSjtBQUNJLFFBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQUFPLENBQUMsSUFBUixDQUFhLE1BQWIsQ0FBWixDQURKO09BQUEsTUFBQTtBQUdJLFFBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQUFPLENBQUMsUUFBUixDQUFpQixLQUFqQixDQUF1QixDQUFDLElBQXhCLENBQTZCLEtBQTdCLENBQVosQ0FISjtPQURKO0tBSkE7QUFBQSxJQVNBLElBQUEsR0FDSTtBQUFBLE1BQUEsR0FBQSxFQUFJLE9BQU8sQ0FBQyxJQUFSLENBQWEsS0FBYixDQUFKO0FBQUEsTUFDQSxJQUFBLEVBQUssT0FBTyxDQUFDLElBQVIsQ0FBYSxNQUFiLENBREw7QUFBQSxNQUVBLE1BQUEsRUFBTyxJQUFDLENBQUEsUUFGUjtLQVZKLENBQUE7V0FjQSxZQUFZLENBQUMsZ0JBQWIsQ0FBOEIsSUFBOUIsRUFoQm9CO0VBQUEsQ0FuQ3hCLENBQUE7O0FBQUEsd0JBc0RBLElBQUEsR0FBTSxTQUFDLEVBQUQsRUFBSyxPQUFMLEdBQUE7QUFDRixRQUFBLDRCQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsR0FBQSxHQUFJLEVBQUosR0FBTyxPQUFoQixDQUFBO0FBRUEsSUFBQSxJQUFHLENBQUEsQ0FBRSxJQUFDLENBQUEsSUFBRCxLQUFTLElBQVYsQ0FBSjtBQUNJLE1BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFtQixlQUFuQixDQUFULENBREo7S0FBQSxNQUFBO0FBR0ksTUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQVYsQ0FISjtLQUZBO0FBQUEsSUFTQSxFQUFBLEdBQUssR0FBQSxDQUFBLFdBVEwsQ0FBQTtBQUFBLElBVUEsRUFBRSxDQUFDLEdBQUgsQ0FBTyxRQUFRLENBQUMsRUFBVCxDQUFZLE1BQVosRUFBcUIsRUFBckIsRUFDSDtBQUFBLE1BQUEsU0FBQSxFQUFVLENBQVY7QUFBQSxNQUNBLFNBQUEsRUFBVSxLQURWO0tBREcsQ0FBUCxDQVZBLENBQUE7QUFBQSxJQWFBLEVBQUUsQ0FBQyxHQUFILENBQU8sUUFBUSxDQUFDLEVBQVQsQ0FBWSxNQUFNLENBQUMsTUFBUCxDQUFjLE1BQWQsQ0FBWixFQUFvQyxFQUFwQyxFQUNIO0FBQUEsTUFBQSxTQUFBLEVBQVUsQ0FBVjtLQURHLENBQVAsQ0FiQSxDQUFBO0FBaUJBLElBQUEsSUFBRyxDQUFDLG9CQUFELENBQUg7QUFDSSxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBQyxDQUFBLE9BQWIsQ0FBQSxDQUFBO0FBQUEsTUFFQSxHQUFBLEdBQU0sSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUEsQ0FBaUIsQ0FBQyxHQUFsQixHQUF3QixDQUFDLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxNQUFaLENBQUEsQ0FBRCxDQUY5QixDQUFBO0FBQUEsTUFHQSxPQUFPLENBQUMsR0FBUixDQUFZLEdBQVosQ0FIQSxDQUFBO0FBQUEsTUFJQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFNBQVYsQ0FBQSxDQUpOLENBQUE7QUFLQSxNQUFBLElBQUksR0FBQSxHQUFNLEdBQVY7ZUFDSSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsT0FBVixDQUFrQjtBQUFBLFVBQUUsU0FBQSxFQUFXLEdBQWI7U0FBbEIsRUFESjtPQU5KO0tBbEJFO0VBQUEsQ0F0RE4sQ0FBQTs7cUJBQUE7O0dBRnNCLFdBSDFCLENBQUE7O0FBQUEsTUF1Rk0sQ0FBQyxPQUFQLEdBQWlCLFdBdkZqQixDQUFBOzs7OztBQ0RBLElBQUEsdUJBQUE7RUFBQTs2QkFBQTs7QUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLCtCQUFSLENBQWIsQ0FBQTs7QUFFQTtBQUFBOzs7Ozs7Ozs7OztHQUZBOztBQWdCQTtBQUFBOzs7OztHQWhCQTs7QUFBQTtBQXlCSSxpQ0FBQSxDQUFBOztBQUFhLEVBQUEscUJBQUMsSUFBRCxHQUFBO0FBQ1QsSUFBQSxJQUFDLENBQUEsR0FBRCxHQUFPLENBQUEsQ0FBRSxJQUFJLENBQUMsRUFBUCxDQUFQLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBRGpCLENBQUE7QUFBQSxJQUVBLDZDQUFNLElBQU4sQ0FGQSxDQURTO0VBQUEsQ0FBYjs7QUFBQSx3QkFLQSxVQUFBLEdBQVksU0FBQSxHQUFBO1dBQ1IsMENBQUEsRUFEUTtFQUFBLENBTFosQ0FBQTs7QUFBQSx3QkFRQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBRU4sUUFBQSwwSEFBQTtBQUFBLElBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxHQUFULENBQUE7QUFBQSxJQUVBLGVBQUEsR0FBbUIsR0FBQSxHQUFNLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBWCxDQUZ6QixDQUFBO0FBQUEsSUFHQSxPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLENBSFYsQ0FBQTtBQUFBLElBSUEsTUFBQSxHQUFTLEVBSlQsQ0FBQTtBQUFBLElBS0EsaUJBQUEsR0FBb0IsQ0FMcEIsQ0FBQTtBQUFBLElBTUEsSUFBQSxHQUFPLEVBTlAsQ0FBQTtBQUFBLElBUUEsTUFBQSxHQUFTLEtBQUssQ0FBQyxJQUFOLENBQVcsMkRBQVgsQ0FSVCxDQUFBO0FBQUEsSUFTQSxlQUFBLEdBQWtCLEtBQUssQ0FBQyxJQUFOLENBQVcsMkJBQVgsQ0FUbEIsQ0FBQTtBQUFBLElBV0EsQ0FBQSxDQUFFLGVBQUYsQ0FBa0IsQ0FBQyxXQUFuQixDQUErQixTQUEvQixDQVhBLENBQUE7QUFBQSxJQWNBLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsQ0FBRCxFQUFHLENBQUgsR0FBQTtBQUNSLFlBQUEsb0VBQUE7QUFBQSxRQUFBLEtBQUEsR0FBUSxFQUFSLENBQUE7QUFBQSxRQUNBLElBQUEsR0FBTyxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsSUFBTCxDQUFVLE1BQVYsQ0FEUCxDQUFBO0FBQUEsUUFFQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLENBQXNCLENBQUMsRUFBdkIsQ0FBMEIsQ0FBMUIsQ0FGVCxDQUFBO0FBQUEsUUFHQSxRQUFBLEdBQVcsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFFBQVYsQ0FBbUIsVUFBbkIsQ0FBQSxJQUFrQyxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsUUFBTCxDQUFjLFVBQWQsQ0FIN0MsQ0FBQTtBQUFBLFFBS0EsT0FBQSxHQUFVLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxRQUFMLENBQWMsUUFBZCxDQUxWLENBQUE7QUFNQSxRQUFBLElBQUcsT0FBQSxJQUFZLENBQUEsQ0FBRSxtQkFBQSxHQUFzQixDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBdEIsR0FBMkMsV0FBN0MsQ0FBeUQsQ0FBQyxJQUExRCxDQUFBLENBQUEsS0FBb0UsQ0FBbkY7QUFDSSxVQUFBLEtBQUEsR0FBUSxDQUFBLENBQUUsbUJBQUEsR0FBc0IsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLENBQXRCLEdBQTJDLFdBQTdDLENBQXlELENBQUMsR0FBMUQsQ0FBQSxDQUErRCxDQUFDLElBQWhFLENBQUEsQ0FBUixDQURKO1NBTkE7QUFBQSxRQVNBLEtBQUEsR0FBVyxPQUFILEdBQWdCLEtBQWhCLEdBQTJCLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxHQUFMLENBQUEsQ0FBVSxDQUFDLElBQVgsQ0FBQSxDQVRuQyxDQUFBO0FBQUEsUUFVQSxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLENBQUEsQ0FBTCxHQUE2QixLQVY3QixDQUFBO0FBQUEsUUFZQSxTQUFBLEdBQWUsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLENBQUgsR0FBMEIsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLENBQTFCLEdBQWlELENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxJQUFMLENBQVUsYUFBVixDQVo3RCxDQUFBO0FBZUEsUUFBQSxJQUFHLFFBQUEsSUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFOLEtBQWdCLENBQWpCLENBQWhCO0FBQ0ksVUFBQSxNQUFBLElBQVUsTUFBQSxHQUFTLFNBQVQsR0FBcUIsb0JBQS9CLENBQUE7QUFDQSxVQUFBLElBQUcsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLENBQW9CLENBQUMsV0FBckIsQ0FBQSxDQUFBLEtBQXNDLFVBQXRDLElBQW9ELENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxRQUFMLENBQWMsUUFBZCxDQUF2RDtBQUNJLFlBQUEsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLFFBQUwsQ0FBYyxTQUFkLENBQUEsQ0FESjtXQUFBLE1BQUE7QUFHSSxZQUFBLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixDQUFzQixDQUFDLFFBQXZCLENBQWdDLFNBQWhDLENBQUEsQ0FISjtXQURBO2lCQUtBLGlCQUFBLEdBTko7U0FBQSxNQUFBO0FBVUksVUFBQSxJQUFJLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBbkI7QUFDSSxvQkFBTyxJQUFQO0FBQUEsbUJBQ1MsT0FEVDtBQUVRLGdCQUFBLFlBQUEsR0FBZSwwQ0FBZixDQUFBO0FBQ0EsZ0JBQUEsSUFBRyxDQUFBLEtBQU8sQ0FBQyxLQUFOLENBQVksWUFBWixDQUFMO0FBQ0ksa0JBQUEsTUFBQSxJQUFVLE1BQUEsR0FBUyxTQUFULEdBQXFCLHFDQUEvQixDQUFBO0FBQUEsa0JBQ0EsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLENBQXNCLENBQUMsUUFBdkIsQ0FBZ0MsU0FBaEMsQ0FEQSxDQUFBO3lCQUVBLGlCQUFBLEdBSEo7aUJBSFI7QUFDUztBQURULG1CQU9TLFFBUFQ7QUFRUSxnQkFBQSxJQUFHLEtBQUEsQ0FBTSxLQUFOLENBQUEsSUFBZ0IsQ0FBQyxLQUFBLEdBQVEsQ0FBUixLQUFhLENBQWQsQ0FBbkI7QUFDSSxrQkFBQSxNQUFBLElBQVUsTUFBQSxHQUFTLFNBQVQsR0FBcUIsOEJBQS9CLENBQUE7QUFBQSxrQkFDQSxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsT0FBTCxDQUFhLFFBQWIsQ0FBc0IsQ0FBQyxRQUF2QixDQUFnQyxTQUFoQyxDQURBLENBQUE7eUJBRUEsaUJBQUEsR0FISjtpQkFSUjtBQU9TO0FBUFQsbUJBWVMsT0FaVDtBQWFRLGdCQUFBLEdBQUEsR0FBTSxvRUFBTixDQUFBO0FBQ0EsZ0JBQUEsSUFBRyxDQUFBLEtBQU8sQ0FBQyxLQUFOLENBQVksR0FBWixDQUFMO0FBQ0ksa0JBQUEsTUFBQSxJQUFVLE1BQUEsR0FBUyxTQUFULEdBQXFCLG9DQUEvQixDQUFBO0FBQUEsa0JBQ0EsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLENBQXNCLENBQUMsUUFBdkIsQ0FBZ0MsU0FBaEMsQ0FEQSxDQUFBO3lCQUVBLGlCQUFBLEdBSEo7aUJBZFI7QUFBQSxhQURKO1dBVko7U0FoQlE7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaLENBZEEsQ0FBQTtBQStEQSxJQUFBLElBQUcsbUJBQUg7QUFDSSxNQUFBLENBQUMsQ0FBQyxJQUFGLENBQU8sTUFBTSxDQUFDLElBQWQsRUFBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsQ0FBRCxFQUFJLENBQUosR0FBQTtBQUNoQixVQUFBLENBQUMsQ0FBQyxXQUFGLENBQWMsU0FBZCxDQUFBLENBQUE7QUFBQSxVQUNBLElBQUssQ0FBQSxDQUFDLENBQUMsT0FBRixDQUFMLEdBQWtCLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBUixDQUFBLENBRGxCLENBQUE7QUFFQSxVQUFBLElBQUksQ0FBQyxDQUFDLFFBQUgsSUFBaUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQVIsQ0FBQSxDQUFjLENBQUMsTUFBZixLQUF5QixDQUExQixDQUFwQjtBQUNJLFlBQUEsTUFBQSxJQUFVLE1BQUEsR0FBUyxDQUFDLENBQUMsSUFBWCxHQUFrQixvQkFBNUIsQ0FBQTtBQUFBLFlBQ0EsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxTQUFYLENBREEsQ0FBQTttQkFFQSxpQkFBQSxHQUhKO1dBSGdCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0FBQSxDQURKO0tBL0RBO0FBQUEsSUF3RUEsS0FBQSxHQUFRLGlCQUFBLEtBQXFCLENBeEU3QixDQUFBO0FBQUEsSUF5RUEsU0FBQSxHQUFlLEtBQUgsR0FBYyxFQUFkLEdBQXNCLE1BQUEsR0FBUyxNQUFULEdBQWtCLE9BekVwRCxDQUFBO0FBQUEsSUEwRUEsR0FBQSxHQUFTLEtBQUgsR0FBYyxTQUFkLEdBQTZCLFNBMUVuQyxDQUFBO0FBQUEsSUE0RUEsQ0FBQSxDQUFFLGVBQUYsQ0FBa0IsQ0FBQyxXQUFuQixDQUErQixpQkFBL0IsQ0FBaUQsQ0FBQyxRQUFsRCxDQUEyRCxHQUEzRCxDQUErRCxDQUFDLElBQWhFLENBQXFFLFNBQXJFLENBNUVBLENBQUE7QUFBQSxJQStFQSxDQUFBLENBQUUsZUFBRixDQUFrQixDQUFDLElBQW5CLENBQUEsQ0FBeUIsQ0FBQyxPQUExQixDQUFrQztBQUFBLE1BQzlCLE1BQUEsRUFBUSxDQUFBLENBQUUsZUFBRixDQUFrQixDQUFDLElBQW5CLENBQXdCLElBQXhCLENBQTZCLENBQUMsTUFBOUIsQ0FBQSxDQURzQjtLQUFsQyxDQS9FQSxDQUFBO0FBQUEsSUFtRkEsUUFBQSxHQUFXO0FBQUEsTUFDUCxLQUFBLEVBQU8sS0FEQTtBQUFBLE1BRVAsT0FBQSxFQUFTLE9BRkY7QUFBQSxNQUdQLElBQUEsRUFBTSxJQUhDO0FBQUEsTUFJUCxTQUFBLEVBQVcsZUFKSjtLQW5GWCxDQUFBO0FBeUZBLFdBQU8sUUFBUCxDQTNGTTtFQUFBLENBUlYsQ0FBQTs7QUFBQSx3QkFxR0EsVUFBQSxHQUFZLFNBQUMsQ0FBRCxFQUFJLE1BQUosR0FBQTtBQUNSLFFBQUEsVUFBQTtBQUFBLElBQUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUVBLFVBQUEsR0FBYSxNQUFNLENBQUMsUUFBUCxDQUFBLENBRmIsQ0FBQTtBQUdBLElBQUEsSUFBRyxVQUFVLENBQUMsS0FBZDthQUVJLENBQUMsQ0FBQyxJQUFGLENBQ0k7QUFBQSxRQUFBLEdBQUEsRUFBSyxVQUFVLENBQUMsT0FBaEI7QUFBQSxRQUNBLE1BQUEsRUFBTyxNQURQO0FBQUEsUUFFQSxRQUFBLEVBQVUsTUFGVjtBQUFBLFFBR0EsSUFBQSxFQUFNLFVBQVUsQ0FBQyxJQUhqQjtBQUFBLFFBSUEsUUFBQSxFQUFVLFNBQUMsUUFBRCxHQUFBO0FBQ04sY0FBQSx1QkFBQTtBQUFBLFVBQUEsR0FBQSxHQUFTLDZCQUFILEdBQStCLFFBQVEsQ0FBQyxZQUF4QyxHQUEwRCxRQUFoRSxDQUFBO0FBQUEsVUFDQSxPQUFBLEdBQVUsb0RBRFYsQ0FBQTtBQUFBLFVBRUEsSUFBQSxHQUFPLEtBRlAsQ0FBQTtBQUdBLFVBQUEsSUFBRyxtQkFBSDtBQUNJLFlBQUEsSUFBQSxHQUFPLEdBQUcsQ0FBQyxPQUFKLEtBQWUsU0FBdEIsQ0FBQTtBQUdBLFlBQUEsSUFBRyxJQUFIO0FBQ0ksY0FBQSxPQUFBLEdBQVUsc0dBQVYsQ0FESjthQUFBLE1BQUE7QUFJSSxjQUFBLElBQUcsbUJBQUEsSUFBZSwwQkFBbEI7QUFDSSxnQkFBQSxPQUFBLEdBQVUsc0JBQVYsQ0FBQTtBQUFBLGdCQUVBLENBQUMsQ0FBQyxJQUFGLENBQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFqQixFQUF5QixDQUFBLFNBQUEsS0FBQSxHQUFBO3lCQUFBLFNBQUMsQ0FBRCxFQUFJLEdBQUosR0FBQTsyQkFDckIsT0FBQSxJQUFXLE1BQUEsR0FBUyxHQUFHLENBQUMsT0FBYixHQUF1QixRQURiO2tCQUFBLEVBQUE7Z0JBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QixDQUZBLENBQUE7QUFBQSxnQkFLQSxPQUFBLElBQVcsT0FMWCxDQURKO2VBSko7YUFKSjtXQUhBO0FBQUEsVUFtQkEsR0FBQSxHQUFTLElBQUgsR0FBYSxTQUFiLEdBQTRCLFNBbkJsQyxDQUFBO0FBQUEsVUFvQkEsQ0FBQSxDQUFFLFVBQVUsQ0FBQyxTQUFiLENBQXVCLENBQUMsV0FBeEIsQ0FBb0MsaUJBQXBDLENBQXNELENBQUMsUUFBdkQsQ0FBZ0UsR0FBaEUsQ0FBb0UsQ0FBQyxJQUFyRSxDQUEwRSxPQUExRSxDQXBCQSxDQUFBO0FBQUEsVUFzQkEsQ0FBQSxDQUFFLFVBQVUsQ0FBQyxTQUFiLENBQXVCLENBQUMsSUFBeEIsQ0FBQSxDQUE4QixDQUFDLE9BQS9CLENBQXVDO0FBQUEsWUFDbkMsTUFBQSxFQUFRLENBQUEsQ0FBRSxVQUFVLENBQUMsU0FBYixDQUF1QixDQUFDLElBQXhCLENBQTZCLGFBQTdCLENBQTJDLENBQUMsTUFBNUMsQ0FBQSxDQUQyQjtXQUF2QyxDQXRCQSxDQUFBO0FBMEJBLFVBQUEsSUFBRyxJQUFIO21CQUNJLE1BQU0sQ0FBQyxTQUFQLENBQUEsRUFESjtXQTNCTTtRQUFBLENBSlY7T0FESixFQUZKO0tBSlE7RUFBQSxDQXJHWixDQUFBOztBQUFBLHdCQThJQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBRVAsUUFBQSxxQkFBQTtBQUFBLElBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxHQUFULENBQUE7QUFBQSxJQUdBLE1BQUEsR0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsQ0FIVCxDQUFBO0FBQUEsSUFJQSxNQUFNLENBQUMsV0FBUCxDQUFtQixTQUFuQixDQUpBLENBQUE7QUFBQSxJQUtBLENBQUMsQ0FBQyxJQUFGLENBQU8sTUFBUCxFQUFlLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7ZUFDWCxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsSUFBVixDQUFlLGFBQWYsQ0FBNkIsQ0FBQyxVQUE5QixDQUF5QyxTQUF6QyxFQURXO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZixDQUxBLENBQUE7QUFBQSxJQVNBLE1BQUEsR0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLG1DQUFYLENBVFQsQ0FBQTtBQUFBLElBVUEsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsU0FBbkIsQ0FBNkIsQ0FBQyxPQUE5QixDQUFzQyxRQUF0QyxDQUErQyxDQUFDLFdBQWhELENBQTRELFNBQTVELENBVkEsQ0FBQTtBQUFBLElBV0EsQ0FBQyxDQUFDLElBQUYsQ0FBTyxNQUFQLEVBQWUsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsQ0FBRCxFQUFJLENBQUosR0FBQTtlQUNYLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxHQUFMLENBQVMsRUFBVCxFQURXO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZixDQVhBLENBQUE7QUFlQSxJQUFBLElBQUcsbUJBQUg7YUFDSSxDQUFDLENBQUMsSUFBRixDQUFPLE1BQU0sQ0FBQyxJQUFkLEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7aUJBQ2hCLENBQUMsQ0FBQyxjQUFGLENBQUEsRUFEZ0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixFQURKO0tBakJPO0VBQUEsQ0E5SVgsQ0FBQTs7QUFBQSx3QkFtS0EsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNQLFFBQUEsZUFBQTtBQUFBLElBQUEsU0FBQSxHQUFhLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFdBQVYsQ0FBYixDQUFBO0FBQUEsSUFDQSxJQUFBLEdBQU8sSUFEUCxDQUFBO0FBQUEsSUFFQSxDQUFBLENBQUUsR0FBQSxHQUFNLFNBQVIsQ0FBa0IsQ0FBQyxFQUFuQixDQUFzQixPQUF0QixFQUErQixTQUFDLENBQUQsR0FBQTthQUMzQixJQUFJLENBQUMsVUFBTCxDQUFnQixDQUFoQixFQUFtQixJQUFuQixFQUQyQjtJQUFBLENBQS9CLENBRkEsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsbUNBQVYsQ0FBOEMsQ0FBQyxFQUEvQyxDQUFrRCxNQUFsRCxFQUEwRCxTQUFDLENBQUQsR0FBQTtBQUN0RCxNQUFBLElBQUcsQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLENBQXNCLENBQUMsUUFBdkIsQ0FBZ0MsU0FBaEMsQ0FBQSxJQUE4QyxDQUFBLENBQUUsSUFBRixDQUFJLENBQUMsUUFBTCxDQUFjLFNBQWQsQ0FBakQ7ZUFDSSxJQUFJLENBQUMsUUFBTCxDQUFBLEVBREo7T0FEc0Q7SUFBQSxDQUExRCxDQU5BLENBQUE7QUFBQSxJQVdBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGFBQVYsQ0FBd0IsQ0FBQyxFQUF6QixDQUE0QixPQUE1QixFQUFxQyxTQUFDLENBQUQsR0FBQTtBQUNqQyxNQUFBLElBQUcsQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLENBQXVCLENBQUMsUUFBeEIsQ0FBaUMsU0FBakMsQ0FBSDtlQUNJLElBQUksQ0FBQyxRQUFMLENBQUEsRUFESjtPQURpQztJQUFBLENBQXJDLENBWEEsQ0FBQTtBQWdCQSxJQUFBLElBQUcsbUJBQUg7YUFDSSxDQUFDLENBQUMsSUFBRixDQUFPLE1BQU0sQ0FBQyxJQUFkLEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7QUFDaEIsY0FBQSxXQUFBO0FBQUEsVUFBQSxJQUFJLENBQUMsQ0FBQyxRQUFOO0FBQ0ksWUFBQSxXQUFBLEdBQWMsQ0FBQyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQXRCLENBQUE7bUJBQ0EsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLEVBQWYsQ0FBa0IsUUFBbEIsRUFBNEIsU0FBQyxDQUFELEdBQUE7cUJBQ3hCLElBQUksQ0FBQyxRQUFMLENBQUEsRUFEd0I7WUFBQSxDQUE1QixFQUZKO1dBRGdCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsRUFESjtLQWpCTztFQUFBLENBbktYLENBQUE7O3FCQUFBOztHQUZzQixXQXZCMUIsQ0FBQTs7QUFBQSxNQW9OTSxDQUFDLE9BQVAsR0FBaUIsV0FwTmpCLENBQUE7Ozs7O0FDQUEsSUFBQSxvQ0FBQTtFQUFBOzs2QkFBQTs7QUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLHdCQUFSLENBQVYsQ0FBQTs7QUFBQSxVQUNBLEdBQWEsT0FBQSxDQUFRLCtCQUFSLENBRGIsQ0FBQTs7QUFBQTtBQUtJLHFDQUFBLENBQUE7O0FBQWEsRUFBQSx5QkFBQyxJQUFELEdBQUE7QUFFVCwyRUFBQSxDQUFBO0FBQUEsNkRBQUEsQ0FBQTtBQUFBLDZEQUFBLENBQUE7QUFBQSw2REFBQSxDQUFBO0FBQUEsMkRBQUEsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSxxREFBQSxDQUFBO0FBQUEsMkRBQUEsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSxpREFBQSxDQUFBO0FBQUEsaURBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsbUVBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsK0RBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsQ0FBQSxDQUFFLE1BQUYsQ0FBUixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRLENBQUEsQ0FBRSxNQUFGLENBRFIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFBLENBQUUsVUFBRixDQUZYLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQSxDQUFFLG9CQUFGLENBSFYsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUFBLENBQUUsU0FBRixDQUpWLENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEtBTGpCLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxZQUFELEdBQWdCLENBQUEsQ0FBRSxvQ0FBRixDQUF1QyxDQUFDLE1BQXhDLENBQUEsQ0FBZ0QsQ0FBQyxJQU5qRSxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsZUFBRCxHQUFtQixDQUFBLENBQUUsdUNBQUYsQ0FBMEMsQ0FBQyxNQUEzQyxDQUFBLENBQW1ELENBQUMsSUFQdkUsQ0FBQTtBQUFBLElBVUEsaURBQU0sSUFBTixDQVZBLENBRlM7RUFBQSxDQUFiOztBQUFBLDRCQWVBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDUixJQUFBLDhDQUFBLENBQUEsQ0FBQTtXQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBRlE7RUFBQSxDQWZaLENBQUE7O0FBQUEsNEJBbUJBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDUCxJQUFBLElBQUcsQ0FBQSxDQUFDLENBQUUsTUFBRixDQUFTLENBQUMsUUFBVixDQUFtQixRQUFuQixDQUFKO0FBQ0ksTUFBQSxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxFQUFwQixDQUF1QixZQUF2QixFQUFxQyxJQUFDLENBQUEsY0FBdEMsQ0FBQSxDQUFBO0FBQUEsTUFDQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLFlBQWYsRUFBNkIsSUFBQyxDQUFBLFVBQTlCLENBREEsQ0FESjtLQUFBO0FBQUEsSUFJQSxNQUFNLENBQUMsUUFBUCxHQUFrQixJQUFDLENBQUEsWUFKbkIsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsY0FBWCxDQUEwQixDQUFDLEVBQTNCLENBQThCLE9BQTlCLEVBQXVDLElBQUMsQ0FBQSxTQUF4QyxDQUxBLENBQUE7QUFBQSxJQU1BLENBQUEsQ0FBRSxzQkFBRixDQUF5QixDQUFDLEVBQTFCLENBQTZCLE9BQTdCLEVBQXNDLElBQUMsQ0FBQSxnQkFBdkMsQ0FOQSxDQUFBO0FBQUEsSUFPQSxDQUFBLENBQUUsc0JBQUYsQ0FBeUIsQ0FBQyxFQUExQixDQUE2QixPQUE3QixFQUFzQyxJQUFDLENBQUEsZ0JBQXZDLENBUEEsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsYUFBWCxDQUF5QixDQUFDLEVBQTFCLENBQTZCLE9BQTdCLEVBQXNDLFNBQUEsR0FBQTthQUNsQyxDQUFBLENBQUUsSUFBRixDQUFJLENBQUMsT0FBTCxDQUFhLFFBQWIsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixrQkFBNUIsQ0FBK0MsQ0FBQyxPQUFoRCxDQUF3RCxPQUF4RCxFQURrQztJQUFBLENBQXRDLENBVEEsQ0FBQTtXQVlBLENBQUEsQ0FBRSxvQkFBRixDQUF1QixDQUFDLEVBQXhCLENBQTJCLE9BQTNCLEVBQW9DLG9CQUFwQyxFQUEwRCxJQUFDLENBQUEsdUJBQTNELEVBYk87RUFBQSxDQW5CWCxDQUFBOztBQUFBLDRCQW1DQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1YsUUFBQSxhQUFBO0FBQUEsSUFBQSxTQUFBLEdBQVksQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBa0IsTUFBbEIsQ0FBWixDQUFBO0FBQUEsSUFDQSxFQUFBLEdBQUssQ0FBQSxDQUFFLCtCQUFBLEdBQWtDLFNBQWxDLEdBQThDLElBQWhELENBQXFELENBQUMsSUFBdEQsQ0FBMkQsTUFBM0QsQ0FETCxDQUFBO1dBRUEsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsRUFBakIsRUFIVTtFQUFBLENBbkNkLENBQUE7O0FBQUEsNEJBd0NBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNmLFFBQUEsT0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQWtCLE1BQWxCLENBQVYsQ0FBQTtBQUVBLElBQUEsSUFBRyxPQUFBLEtBQVcsV0FBWCxJQUEwQixPQUFBLEtBQVcsZ0JBQXJDLElBQXlELE9BQUEsS0FBVyxVQUF2RTthQUNJLElBQUMsQ0FBQSxlQUFELENBQWlCLFdBQWpCLEVBREo7S0FBQSxNQUVLLElBQUcsT0FBQSxLQUFXLHFCQUFYLElBQW9DLE9BQUEsS0FBVyxhQUFsRDthQUNELElBQUMsQ0FBQSxlQUFELENBQWlCLGNBQWpCLEVBREM7S0FMVTtFQUFBLENBeENuQixDQUFBOztBQUFBLDRCQWdEQSxTQUFBLEdBQVcsU0FBQyxDQUFELEdBQUEsQ0FoRFgsQ0FBQTs7QUFBQSw0QkFrREEsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUNWLElBQUEsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsZUFBRCxDQUFBLEVBRlU7RUFBQSxDQWxEZCxDQUFBOztBQUFBLDRCQXVEQSxtQkFBQSxHQUFxQixTQUFBLEdBQUE7QUFLakIsSUFBQSxJQUFHLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsUUFBakIsQ0FBMEIsT0FBMUIsQ0FBSDtBQUNJLE1BQUEsSUFBRyxNQUFNLENBQUMsVUFBUCxHQUFvQixHQUF2QjtBQUNJLFFBQUEsQ0FBQSxDQUFFLHdCQUFGLENBQTJCLENBQUMsR0FBNUIsQ0FBZ0MsTUFBaEMsRUFBd0MsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsRUFBeEQsQ0FBQSxDQUFBO2VBQ0EsQ0FBQSxDQUFFLDJCQUFGLENBQThCLENBQUMsR0FBL0IsQ0FBbUMsTUFBbkMsRUFBMkMsSUFBQyxDQUFBLGVBQUQsR0FBbUIsR0FBOUQsRUFGSjtPQUFBLE1BQUE7QUFJSSxRQUFBLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLEdBQTVCLENBQWdDLE1BQWhDLEVBQXdDLElBQUMsQ0FBQSxZQUFELEdBQWdCLEVBQXhELENBQUEsQ0FBQTtlQUNBLENBQUEsQ0FBRSwyQkFBRixDQUE4QixDQUFDLEdBQS9CLENBQW1DLE1BQW5DLEVBQTJDLElBQUMsQ0FBQSxlQUFELEdBQW1CLEdBQTlELEVBTEo7T0FESjtLQUFBLE1BQUE7QUFRSSxNQUFBLElBQUcsTUFBTSxDQUFDLFVBQVAsR0FBb0IsR0FBdkI7QUFDSSxRQUFBLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLEdBQTVCLENBQWdDLE1BQWhDLEVBQXdDLElBQUMsQ0FBQSxZQUFELEdBQWdCLEVBQXhELENBQUEsQ0FBQTtlQUNBLENBQUEsQ0FBRSwyQkFBRixDQUE4QixDQUFDLEdBQS9CLENBQW1DLE1BQW5DLEVBQTJDLElBQUMsQ0FBQSxlQUFELEdBQW1CLEdBQTlELEVBRko7T0FBQSxNQUFBO0FBSUksUUFBQSxDQUFBLENBQUUsd0JBQUYsQ0FBMkIsQ0FBQyxHQUE1QixDQUFnQyxNQUFoQyxFQUF3QyxJQUFDLENBQUEsWUFBRCxHQUFnQixFQUF4RCxDQUFBLENBQUE7ZUFDQSxDQUFBLENBQUUsMkJBQUYsQ0FBOEIsQ0FBQyxHQUEvQixDQUFtQyxNQUFuQyxFQUEyQyxJQUFDLENBQUEsZUFBRCxHQUFtQixFQUE5RCxFQUxKO09BUko7S0FMaUI7RUFBQSxDQXZEckIsQ0FBQTs7QUFBQSw0QkEyRUEsYUFBQSxHQUFlLFNBQUMsT0FBRCxHQUFBO0FBQ1gsUUFBQSxRQUFBO0FBQUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTixDQUFlLE9BQWYsQ0FBSDtBQUNJLFlBQUEsQ0FESjtLQUFBO0FBQUEsSUFHQSxHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsYUFBVixDQUhOLENBQUE7QUFBQSxJQUlBLEdBQUEsR0FBTSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxnQkFBVixDQUpOLENBQUE7QUFNQSxJQUFBLElBQUcsT0FBQSxHQUFVLEVBQWI7QUFDSSxNQUFBLElBQUcsQ0FBQSxJQUFFLENBQUEsWUFBTDtBQUNJLFFBQUEsQ0FBQSxDQUFFLDZGQUFGLENBQWdHLENBQUMsUUFBakcsQ0FBMEcsT0FBMUcsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQURoQixDQUFBO2VBRUEsSUFBQyxDQUFBLG1CQUFELENBQUEsRUFISjtPQURKO0tBQUEsTUFBQTtBQU1JLE1BQUEsSUFBRyxJQUFDLENBQUEsWUFBSjtBQUNJLFFBQUEsQ0FBQSxDQUFFLDZGQUFGLENBQWdHLENBQUMsV0FBakcsQ0FBNkcsT0FBN0csQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixLQURoQixDQUFBO0FBQUEsUUFFQSxJQUFDLENBQUEsWUFBRCxDQUFBLENBRkEsQ0FBQTtlQUdBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLEVBSko7T0FOSjtLQVBXO0VBQUEsQ0EzRWYsQ0FBQTs7QUFBQSw0QkErRkEsY0FBQSxHQUFnQixTQUFDLENBQUQsR0FBQTtBQUNaLFFBQUEsUUFBQTtBQUFBLElBQUEsUUFBQSxHQUFXLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsTUFBWixDQUFBLENBQW9CLENBQUMsSUFBckIsQ0FBMEIsTUFBMUIsQ0FBWCxDQUFBO0FBQ0EsSUFBQSxJQUFHLENBQUEsQ0FBRSxHQUFBLEdBQU0sUUFBTixHQUFpQixjQUFuQixDQUFrQyxDQUFDLElBQW5DLENBQXdDLEdBQXhDLENBQTRDLENBQUMsTUFBN0MsR0FBc0QsQ0FBekQ7YUFDSSxJQUFDLENBQUEsVUFBRCxDQUFBLEVBREo7S0FBQSxNQUFBO0FBR0ksTUFBQSxJQUFDLENBQUEsZUFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsUUFBakIsQ0FEQSxDQUFBO0FBR0EsTUFBQSxJQUFHLENBQUEsSUFBRSxDQUFBLGFBQUw7ZUFDSSxJQUFDLENBQUEsVUFBRCxDQUFBLEVBREo7T0FOSjtLQUZZO0VBQUEsQ0EvRmhCLENBQUE7O0FBQUEsNEJBMEdBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDUixJQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixTQUFqQixDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsYUFBRCxHQUFpQixLQUZUO0VBQUEsQ0ExR1osQ0FBQTs7QUFBQSw0QkE4R0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNSLElBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQW9CLFNBQXBCLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsS0FEakIsQ0FBQTtXQUVBLElBQUMsQ0FBQSxZQUFELENBQUEsRUFIUTtFQUFBLENBOUdaLENBQUE7O0FBQUEsNEJBbUhBLGVBQUEsR0FBaUIsU0FBQyxJQUFELEdBQUE7QUFDYixRQUFBLG9DQUFBO0FBQUEsSUFBQSxJQUFHLFlBQUg7QUFDSSxNQUFBLElBQUEsR0FBTyxDQUFBLENBQUUsOEJBQUEsR0FBaUMsSUFBakMsR0FBd0MsSUFBMUMsQ0FBK0MsQ0FBQyxRQUFoRCxDQUFBLENBQTBELENBQUMsSUFBbEUsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLENBRFQsQ0FBQTtBQUFBLE1BRUEsTUFBQSxHQUFTLENBQUEsRUFGVCxDQUFBO0FBSUEsTUFBQSxJQUFHLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLEdBQXZCO0FBQ0ksUUFBQSxNQUFBLEdBQVMsQ0FBQSxFQUFULENBREo7T0FKQTtBQVVBLE1BQUEsSUFBRyxDQUFBLENBQUUsR0FBQSxHQUFNLElBQU4sR0FBYSxnQkFBZixDQUFnQyxDQUFDLE1BQWpDLEdBQTBDLENBQTdDO0FBQ0k7QUFBQSxhQUFBLHFDQUFBO3FCQUFBO0FBQ0ksVUFBQSxNQUFBLEdBQVMsTUFBQSxHQUFTLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxLQUFMLENBQUEsQ0FBbEIsQ0FESjtBQUFBLFNBREo7T0FWQTtBQWNBLE1BQUEsSUFBRyxNQUFBLEdBQVMsQ0FBWjtBQUVJLFFBQUEsQ0FBQSxDQUFFLEdBQUEsR0FBTSxJQUFOLEdBQWEsY0FBZixDQUE4QixDQUFDLEdBQS9CLENBQW1DLE1BQW5DLEVBQTJDLElBQUEsR0FBTyxDQUFDLE1BQUEsR0FBUyxDQUFWLENBQWxELENBQUEsQ0FGSjtPQUFBLE1BQUE7QUFNSSxRQUFBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQUEsQ0FOSjtPQWRBO2FBcUJBLENBQUEsQ0FBRSxHQUFBLEdBQU0sSUFBTixHQUFhLGNBQWYsQ0FBOEIsQ0FBQyxRQUEvQixDQUF3QyxTQUF4QyxFQXRCSjtLQURhO0VBQUEsQ0FuSGpCLENBQUE7O0FBQUEsNEJBNElBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO1dBQ2IsQ0FBQSxDQUFFLGlCQUFGLENBQW9CLENBQUMsV0FBckIsQ0FBaUMsU0FBakMsRUFEYTtFQUFBLENBNUlqQixDQUFBOztBQUFBLDRCQStJQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1YsSUFBQSxJQUFHLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLFFBQTVCLENBQXFDLFVBQXJDLENBQUEsSUFBb0QsQ0FBQSxDQUFFLHdCQUFGLENBQTJCLENBQUMsUUFBNUIsQ0FBcUMsV0FBckMsQ0FBcEQsSUFBeUcsQ0FBQSxDQUFFLHdCQUFGLENBQTJCLENBQUMsUUFBNUIsQ0FBcUMsZ0JBQXJDLENBQTVHO0FBQ0ksTUFBQSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxXQUF2QixDQUFtQyxTQUFuQyxDQUFBLENBQUE7QUFBQSxNQUNBLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLFFBQTVCLENBQXFDLFNBQXJDLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsV0FBakIsQ0FGQSxDQUFBO0FBSUEsTUFBQSxJQUFHLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLFFBQTVCLENBQXFDLFdBQXJDLENBQUg7QUFDSSxRQUFBLENBQUEsQ0FBRSxtQ0FBRixDQUFzQyxDQUFDLFFBQXZDLENBQWdELFVBQWhELENBQUEsQ0FESjtPQUpBO0FBT0EsTUFBQSxJQUFHLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLFFBQTVCLENBQXFDLGdCQUFyQyxDQUFIO2VBQ0ksQ0FBQSxDQUFFLHdDQUFGLENBQTJDLENBQUMsUUFBNUMsQ0FBcUQsVUFBckQsRUFESjtPQVJKO0tBQUEsTUFZSyxJQUFHLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLFFBQTVCLENBQXFDLGFBQXJDLENBQUEsSUFBdUQsQ0FBQSxDQUFFLHdCQUFGLENBQTJCLENBQUMsUUFBNUIsQ0FBcUMscUJBQXJDLENBQTFEO0FBQ0QsTUFBQSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxXQUF2QixDQUFtQyxTQUFuQyxDQUFBLENBQUE7QUFBQSxNQUNBLENBQUEsQ0FBRSwyQkFBRixDQUE4QixDQUFDLFFBQS9CLENBQXdDLFNBQXhDLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxlQUFELENBQWlCLGNBQWpCLEVBSEM7S0FiSztFQUFBLENBL0lkLENBQUE7O0FBQUEsNEJBeUtBLFNBQUEsR0FBVyxTQUFDLENBQUQsR0FBQTtBQUNQLFFBQUEsaUJBQUE7QUFBQSxJQUFBLENBQUMsQ0FBQyxjQUFGLENBQUEsQ0FBQSxDQUFBO0FBQUEsSUFDQSxFQUFBLEdBQUssQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBREwsQ0FBQTtBQUFBLElBRUEsR0FBQSxHQUFNLENBQUEsQ0FBRSxnQkFBRixDQUZOLENBQUE7QUFBQSxJQUdBLEdBQUEsR0FBTSxDQUFBLENBQUUsb0JBQUYsQ0FITixDQUFBO0FBQUEsSUFJQSxHQUFBLEdBQU0sR0FBRyxDQUFDLE1BQUosQ0FBQSxDQUpOLENBQUE7QUFBQSxJQU1BLEVBQUUsQ0FBQyxXQUFILENBQWUsUUFBZixDQU5BLENBQUE7QUFBQSxJQVFBLE9BQU8sQ0FBQyxHQUFSLENBQVksZUFBWixDQVJBLENBQUE7QUFBQSxJQVNBLE9BQU8sQ0FBQyxHQUFSLENBQVksRUFBWixDQVRBLENBQUE7QUFXQSxJQUFBLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBWSxRQUFaLENBQUg7QUFDSSxNQUFBLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBQSxDQUFBO2FBQ0EsUUFBUSxDQUFDLEVBQVQsQ0FBWSxJQUFDLENBQUEsTUFBYixFQUFxQixHQUFyQixFQUNJO0FBQUEsUUFBQyxDQUFBLEVBQUksR0FBQSxHQUFNLEdBQVg7QUFBQSxRQUNDLENBQUEsRUFBRyxDQURKO0FBQUEsUUFFQyxJQUFBLEVBQU0sTUFBTSxDQUFDLE9BRmQ7QUFBQSxRQUdDLFVBQUEsRUFBWSxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFDVCxRQUFRLENBQUMsR0FBVCxDQUFhLEtBQUMsQ0FBQSxNQUFkLEVBQ0k7QUFBQSxjQUFBLENBQUEsRUFBRyxFQUFIO2FBREosRUFEUztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSGI7T0FESixFQUZKO0tBQUEsTUFBQTtBQVdJLE1BQUEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxJQUFDLENBQUEsTUFBZCxFQUNJO0FBQUEsUUFBQSxDQUFBLEVBQUcsQ0FBQSxDQUFIO09BREosQ0FBQSxDQUFBO0FBQUEsTUFFQSxRQUFRLENBQUMsRUFBVCxDQUFZLElBQUMsQ0FBQSxNQUFiLEVBQXFCLEVBQXJCLEVBQXlCO0FBQUEsUUFBQyxDQUFBLEVBQUcsQ0FBSjtBQUFBLFFBQU8sQ0FBQSxFQUFHLENBQVY7QUFBQSxRQUFhLElBQUEsRUFBTSxNQUFNLENBQUMsTUFBMUI7T0FBekIsQ0FGQSxDQUFBO0FBQUEsTUFHQSxDQUFBLENBQUUsaUJBQUYsQ0FBb0IsQ0FBQyxHQUFyQixDQUF5QixRQUF6QixFQUFtQyxLQUFuQyxDQUhBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxlQUpELENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBTEEsQ0FBQTthQU1BLFFBQVEsQ0FBQyxHQUFULENBQWEsSUFBQyxDQUFBLE9BQWQsRUFDSTtBQUFBLFFBQUEsQ0FBQSxFQUFHLENBQUg7T0FESixFQWpCSjtLQVpPO0VBQUEsQ0F6S1gsQ0FBQTs7QUFBQSw0QkF5TUEsZUFBQSxHQUFpQixTQUFBLEdBQUE7QUFDYixRQUFBLGlDQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLGdCQUFGLENBQU4sQ0FBQTtBQUFBLElBQ0EsR0FBQSxHQUFNLENBQUEsQ0FBRSxvQkFBRixDQUROLENBQUE7QUFBQSxJQUlBLEdBQUEsR0FBTSxHQUFHLENBQUMsTUFBSixDQUFBLENBSk4sQ0FBQTtBQUFBLElBS0EsR0FBQSxHQUFNLEdBQUcsQ0FBQyxNQUFKLENBQUEsQ0FMTixDQUFBO0FBQUEsSUFNQSxHQUFBLEdBQU0sTUFBTSxDQUFDLFVBTmIsQ0FBQTtBQUFBLElBT0EsR0FBQSxHQUFNLE1BQU0sQ0FBQyxXQVBiLENBQUE7QUFBQSxJQVFBLEdBQUEsR0FBTSxDQUFBLENBQUUsY0FBRixDQVJOLENBQUE7QUFVQSxJQUFBLElBQUcsR0FBQSxHQUFNLEdBQVQ7YUFDSSxHQUFHLENBQUMsR0FBSixDQUFRO0FBQUEsUUFBQyxNQUFBLEVBQVMsR0FBQSxHQUFNLEdBQWhCO0FBQUEsUUFBc0IsUUFBQSxFQUFVLFFBQWhDO09BQVIsRUFESjtLQUFBLE1BQUE7YUFHSSxHQUFHLENBQUMsR0FBSixDQUFRO0FBQUEsUUFBQyxNQUFBLEVBQVEsR0FBQSxHQUFNLElBQWY7T0FBUixFQUhKO0tBWGE7RUFBQSxDQXpNakIsQ0FBQTs7QUFBQSw0QkF5TkEsZ0JBQUEsR0FBa0IsU0FBQyxDQUFELEdBQUE7QUFDZCxRQUFBLHlDQUFBO0FBQUEsSUFBQSxVQUFBLEdBQWEsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxNQUFaLENBQUEsQ0FBb0IsQ0FBQyxJQUFyQixDQUEwQixpQkFBMUIsQ0FBYixDQUFBO0FBRUEsSUFBQSxJQUFJLFVBQVUsQ0FBQyxJQUFYLENBQWdCLElBQWhCLENBQXFCLENBQUMsTUFBdEIsR0FBK0IsQ0FBbkM7QUFDSSxNQUFBLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxRQUFaLENBQXFCLFFBQXJCLENBREEsQ0FBQTtBQUVBLFlBQUEsQ0FISjtLQUZBO0FBT0EsSUFBQSxJQUFHLENBQUEsQ0FBRSxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLE1BQVosQ0FBQSxDQUFvQixDQUFDLFFBQXJCLENBQThCLFFBQTlCLENBQUQsQ0FBSjtBQUNJLE1BQUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQSxDQUFBLENBREo7S0FQQTtBQUFBLElBVUEsT0FBQSxHQUFVLFVBQVUsQ0FBQyxJQUFYLENBQWdCLElBQWhCLENBQXFCLENBQUMsTUFWaEMsQ0FBQTtBQUFBLElBV0EsWUFBQSxHQUFlLE1BQU0sQ0FBQyxXQVh0QixDQUFBO0FBQUEsSUFZQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBWlQsQ0FBQTtBQUFBLElBY0EsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FkQSxDQUFBO0FBQUEsSUFlQSxNQUFNLENBQUMsSUFBUCxDQUFZLEdBQVosQ0FBZ0IsQ0FBQyxRQUFqQixDQUEwQixRQUExQixDQWZBLENBQUE7QUFBQSxJQWdCQSxNQUFNLENBQUMsUUFBUCxDQUFnQixRQUFoQixDQWhCQSxDQUFBO0FBQUEsSUFpQkEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxHQUFmLENBQW1CLENBQUMsUUFBcEIsQ0FBNkIsUUFBN0IsQ0FqQkEsQ0FBQTtBQUFBLElBa0JBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFFBQVosRUFBc0IsQ0FBQyxZQUFBLEdBQWUsR0FBaEIsQ0FBQSxHQUF1QixJQUE3QyxDQWxCQSxDQUFBO1dBbUJBLFVBQVUsQ0FBQyxHQUFYLENBQWUsUUFBZixFQUF5QixDQUFDLE9BQUEsR0FBVSxFQUFYLENBQUEsR0FBaUIsSUFBMUMsRUFwQmM7RUFBQSxDQXpObEIsQ0FBQTs7QUFBQSw0QkErT0EsZ0JBQUEsR0FBa0IsU0FBQSxHQUFBO0FBQ2QsSUFBQSxDQUFBLENBQUUsaUJBQUYsQ0FBb0IsQ0FBQyxHQUFyQixDQUF5QixRQUF6QixFQUFtQyxLQUFuQyxDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFFBQVosRUFBc0IsT0FBdEIsQ0FEQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxHQUFiLENBQWlCLENBQUMsV0FBbEIsQ0FBOEIsUUFBOUIsQ0FGQSxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxJQUFiLENBQWtCLENBQUMsV0FBbkIsQ0FBK0IsUUFBL0IsQ0FIQSxDQUFBO1dBSUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsTUFBYixDQUFvQixDQUFDLFdBQXJCLENBQWlDLFFBQWpDLEVBTGM7RUFBQSxDQS9PbEIsQ0FBQTs7QUFBQSw0QkF1UEEsZ0JBQUEsR0FBa0IsU0FBQyxDQUFELEdBQUE7QUFDZCxJQUFBLENBQUMsQ0FBQyxlQUFGLENBQUEsQ0FBQSxDQUFBO0FBQUEsSUFDQSxDQUFDLENBQUMsY0FBRixDQUFBLENBREEsQ0FBQTtBQUdBLElBQUEsSUFBRyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLFFBQVosQ0FBcUIsUUFBckIsQ0FBSDthQUNJLElBQUMsQ0FBQSxnQkFBRCxDQUFBLEVBREo7S0FBQSxNQUFBO2FBR0ksQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxPQUFaLENBQW9CLElBQXBCLENBQXlCLENBQUMsT0FBMUIsQ0FBa0MsT0FBbEMsRUFISjtLQUpjO0VBQUEsQ0F2UGxCLENBQUE7O0FBQUEsNEJBaVFBLHVCQUFBLEdBQXlCLFNBQUMsQ0FBRCxHQUFBO0FBQ3JCLFFBQUEsR0FBQTtBQUFBLElBQUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUNBLENBQUMsQ0FBQyxlQUFGLENBQUEsQ0FEQSxDQUFBO0FBR0EsSUFBQSxJQUFHLGdDQUFIO0FBQ0ksTUFBQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxJQUFaLENBQWlCLE1BQWpCLENBQU4sQ0FBQTthQUNBLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBaEIsR0FBdUIsSUFGM0I7S0FKcUI7RUFBQSxDQWpRekIsQ0FBQTs7eUJBQUE7O0dBRjBCLFdBSDlCLENBQUE7O0FBQUEsTUE4UU0sQ0FBQyxPQUFQLEdBQWlCLGVBOVFqQixDQUFBOzs7OztBQ0NBLElBQUEsbUNBQUE7RUFBQTs7NkJBQUE7O0FBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSwrQkFBUixDQUFiLENBQUE7O0FBQUEsWUFDQSxHQUFlLE9BQUEsQ0FBUSx1QkFBUixDQURmLENBQUE7O0FBQUE7QUFLSSwrQkFBQSxDQUFBOztBQUFhLEVBQUEsbUJBQUMsSUFBRCxHQUFBO0FBQ1QsaURBQUEsQ0FBQTtBQUFBLHVFQUFBLENBQUE7QUFBQSx1RUFBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsR0FBRCxHQUFPLENBQUEsQ0FBRSxJQUFJLENBQUMsRUFBUCxDQUFQLENBQUE7QUFBQSxJQUNBLDJDQUFNLElBQU4sQ0FEQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQyxPQUZoQixDQUFBO0FBR0EsSUFBQSxJQUFHLG9CQUFIO0FBQ0ksTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxXQUFaLEVBQTBCLElBQUMsQ0FBQSxVQUEzQixDQUFBLENBREo7S0FIQTtBQUFBLElBTUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFJLENBQUMsSUFOYixDQURTO0VBQUEsQ0FBYjs7QUFBQSxzQkFTQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1IsSUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLENBQUEsQ0FBRSxJQUFDLENBQUEsR0FBSCxDQUFPLENBQUMsSUFBUixDQUFhLElBQWIsQ0FBYixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsZUFBRCxHQUFtQixJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBa0IsY0FBbEIsQ0FEbkIsQ0FBQTtBQUVBLElBQUEsSUFBRyxvQkFBSDtBQUNJLE1BQUEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFDLENBQUEsWUFBRCxDQUFBLENBQVosQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFDLENBQUEsWUFBRCxDQUFBLENBQWQsRUFBK0IsSUFBL0IsQ0FEQSxDQURKO0tBRkE7V0FLQSx3Q0FBQSxFQU5RO0VBQUEsQ0FUWixDQUFBOztBQUFBLHNCQWlCQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1AsSUFBQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxPQUFSLEVBQWlCLFNBQWpCLEVBQTRCLElBQUMsQ0FBQSxxQkFBN0IsQ0FBQSxDQUFBO1dBRUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsRUFBRyxDQUFILEdBQUE7QUFDWixZQUFBLFVBQUE7QUFBQSxRQUFBLFVBQUEsR0FBaUIsSUFBQSxNQUFBLENBQU8sQ0FBUCxDQUFqQixDQUFBO2VBQ0EsVUFBVSxDQUFDLEVBQVgsQ0FBYyxLQUFkLEVBQXNCLEtBQUMsQ0FBQSxxQkFBdkIsRUFGWTtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCLEVBSE87RUFBQSxDQWpCWCxDQUFBOztBQUFBLHNCQXdCQSxxQkFBQSxHQUF1QixTQUFDLENBQUQsR0FBQTtBQUNuQixRQUFBLHNCQUFBO0FBQUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxJQUFELEtBQVMsZUFBWjtBQUNJLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxXQUFYLENBQXVCLFVBQXZCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxPQUFaLENBQW9CLFNBQXBCLENBQThCLENBQUMsUUFBL0IsQ0FBd0MsVUFBeEMsQ0FEQSxDQUFBO0FBQUEsTUFFQSxTQUFBLEdBQVksQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxPQUFaLENBQW9CLFNBQXBCLENBQThCLENBQUMsSUFBL0IsQ0FBb0MsSUFBcEMsQ0FGWixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsU0FBdkIsQ0FIQSxDQUFBO0FBSUEsYUFBTyxLQUFQLENBTEo7S0FBQTtBQUFBLElBT0EsT0FBQSxHQUFVLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsT0FBWixDQUFvQixJQUFwQixDQVBWLENBQUE7QUFBQSxJQVNBLEVBQUEsR0FBSyxPQUFPLENBQUMsSUFBUixDQUFhLElBQWIsQ0FUTCxDQUFBO1dBV0EsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsRUFBaEIsRUFabUI7RUFBQSxDQXhCdkIsQ0FBQTs7QUFBQSxzQkF1Q0EscUJBQUEsR0FBdUIsU0FBQyxJQUFELEdBQUE7QUFDbkIsSUFBQSxDQUFBLENBQUUsMkNBQUYsQ0FBOEMsQ0FBQyxXQUEvQyxDQUEyRCxRQUEzRCxDQUFBLENBQUE7QUFBQSxJQUNBLENBQUEsQ0FBRSwyQ0FBRixDQUE4QyxDQUFDLFdBQS9DLENBQTJELFFBQTNELENBREEsQ0FBQTtBQUFBLElBRUEsQ0FBQSxDQUFFLHVEQUFBLEdBQTBELElBQTFELEdBQWlFLElBQW5FLENBQXdFLENBQUMsUUFBekUsQ0FBa0YsUUFBbEYsQ0FGQSxDQUFBO1dBR0EsQ0FBQSxDQUFFLHVEQUFBLEdBQTBELElBQTFELEdBQWlFLElBQW5FLENBQXdFLENBQUMsTUFBekUsQ0FBQSxDQUFpRixDQUFDLFFBQWxGLENBQTJGLFFBQTNGLEVBSm1CO0VBQUEsQ0F2Q3ZCLENBQUE7O0FBQUEsc0JBNkNBLGNBQUEsR0FBZ0IsU0FBQyxFQUFELEdBQUE7QUFHWixJQUFBLElBQUMsQ0FBQSxVQUFELENBQVksRUFBWixDQUFBLENBQUE7V0FHQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxFQUFkLEVBTlk7RUFBQSxDQTdDaEIsQ0FBQTs7QUFBQSxzQkFzREEsVUFBQSxHQUFZLFNBQUMsRUFBRCxHQUFBO0FBQ1IsUUFBQSxNQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsR0FBQSxHQUFJLEVBQUosR0FBTyxPQUFoQixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLFdBQVgsQ0FBdUIsVUFBdkIsQ0FEQSxDQUFBO1dBRUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLE1BQWxCLENBQXlCLENBQUMsUUFBMUIsQ0FBbUMsVUFBbkMsRUFIUTtFQUFBLENBdERaLENBQUE7O0FBQUEsc0JBNERBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDVixXQUFPLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsYUFBekIsQ0FBdUMsQ0FBQyxJQUF4QyxDQUE2QyxJQUE3QyxDQUFQLENBRFU7RUFBQSxDQTVEZCxDQUFBOzttQkFBQTs7R0FGb0IsV0FIeEIsQ0FBQTs7QUFBQSxNQXdFTSxDQUFDLE9BQVAsR0FBaUIsU0F4RWpCLENBQUE7Ozs7O0FDREEsSUFBQSx5QkFBQTtFQUFBOzZCQUFBOztBQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEsK0JBQVIsQ0FBYixDQUFBOztBQUFBO0FBSUksbUNBQUEsQ0FBQTs7QUFBYSxFQUFBLHVCQUFBLEdBQUE7QUFDVCxJQUFBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBQSxDQURTO0VBQUEsQ0FBYjs7QUFBQSwwQkFHQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ1gsUUFBQSx5RUFBQTtBQUFBLElBQUEsQ0FBQSxHQUFJLENBQUEsQ0FBRSxVQUFGLENBQUosQ0FBQTtBQUFBLElBQ0EsWUFBQSxHQUFlLENBQUMsQ0FBQyxJQUFGLENBQU8sY0FBUCxDQURmLENBQUE7QUFHQTtTQUFBLDhDQUFBO29DQUFBO0FBQ0ksTUFBQSxJQUFBLEdBQU8sQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLElBQWYsQ0FBb0IsR0FBcEIsQ0FBUCxDQUFBO0FBRUEsTUFBQSxJQUFHLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBakI7QUFDSSxRQUFBLFFBQUEsR0FBVyxDQUFYLENBQUE7QUFBQSxRQUNBLFVBQUEsR0FBYSxJQURiLENBQUE7QUFBQSxRQUdBLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxJQUFSLENBQWEsU0FBQSxHQUFBO0FBQ1QsVUFBQSxJQUFHLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxLQUFSLENBQUEsQ0FBQSxHQUFrQixRQUFyQjtBQUNJLFlBQUEsUUFBQSxHQUFXLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxLQUFSLENBQUEsQ0FBWCxDQUFBO21CQUNBLFVBQUEsR0FBYSxDQUFBLENBQUUsSUFBRixFQUZqQjtXQURTO1FBQUEsQ0FBYixDQUhBLENBQUE7QUFBQSxxQkFRQSxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsSUFBUixDQUFhLFNBQUEsR0FBQTtpQkFDVCxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsR0FBUixDQUFZO0FBQUEsWUFBQyxLQUFBLEVBQU8sUUFBQSxHQUFXLEVBQW5CO1dBQVosRUFEUztRQUFBLENBQWIsRUFSQSxDQURKO09BQUEsTUFBQTs2QkFBQTtPQUhKO0FBQUE7bUJBSlc7RUFBQSxDQUhmLENBQUE7O3VCQUFBOztHQUZ3QixXQUY1QixDQUFBOztBQUFBLE1BaUNNLENBQUMsT0FBUCxHQUFpQixhQWpDakIsQ0FBQTs7Ozs7QUNBQSxJQUFBLFNBQUE7RUFBQSxnRkFBQTs7QUFBQTtBQUVpQixFQUFBLG1CQUFDLFFBQUQsR0FBQTtBQUVULHlEQUFBLENBQUE7QUFBQSxtREFBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLENBQUEsQ0FBRSxRQUFGLENBQVQsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFNBQUQsR0FBaUIsSUFBQSxRQUFRLENBQUMsU0FBVCxDQUFtQixJQUFuQixFQUEwQixFQUExQixFQUErQixJQUEvQixDQUZqQixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsU0FBUyxDQUFDLGlCQUFYLENBQTZCLEVBQTdCLENBSEEsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxnQkFBWCxDQUE0QixVQUE1QixFQUF5QyxJQUFDLENBQUEsV0FBMUMsQ0FKQSxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsU0FBUyxDQUFDLGdCQUFYLENBQTRCLFVBQTVCLEVBQXlDLElBQUMsQ0FBQSxjQUExQyxDQUxBLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxRQUFELEdBQVksRUFOWixDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsY0FBRCxDQUFBLENBUEEsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQVJBLENBRlM7RUFBQSxDQUFiOztBQUFBLHNCQVlBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBRVosUUFBQSxJQUFBO0FBQUEsSUFBQSxJQUFBLEdBQU8sSUFBUCxDQUFBO1dBRUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksU0FBQSxHQUFBO0FBRVIsVUFBQSxVQUFBO0FBQUEsTUFBQSxFQUFBLEdBQUssYUFBQSxHQUFhLENBQUMsUUFBQSxDQUFTLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixJQUF6QixDQUE4QixDQUFDLFFBQS9CLENBQUEsQ0FBRCxDQUFsQixDQUFBO0FBQUEsTUFFQSxDQUFBLENBQUUsSUFBRixDQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsRUFBZ0IsRUFBaEIsQ0FGQSxDQUFBO0FBQUEsTUFHQSxDQUFBLENBQUUsSUFBRixDQUFJLENBQUMsSUFBTCxDQUFVLFVBQVYsRUFBdUIsUUFBdkIsQ0FIQSxDQUFBO0FBQUEsTUFJQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLENBSlQsQ0FBQTthQVFBLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBZCxDQUNJO0FBQUEsUUFBQSxFQUFBLEVBQUcsRUFBSDtBQUFBLFFBQ0EsR0FBQSxFQUFJLE1BREo7T0FESixFQVZRO0lBQUEsQ0FBWixFQUpZO0VBQUEsQ0FaaEIsQ0FBQTs7QUFBQSxzQkE4QkEsUUFBQSxHQUFVLFNBQUEsR0FBQTtXQUVOLElBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxDQUF3QixJQUFDLENBQUEsUUFBekIsRUFGTTtFQUFBLENBOUJWLENBQUE7O0FBQUEsc0JBbUNBLFNBQUEsR0FBVyxTQUFDLEVBQUQsRUFBSSxPQUFKLEdBQUE7QUFFUCxRQUFBLDJEQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLEdBQUEsR0FBSSxFQUFOLENBQU4sQ0FBQTtBQUFBLElBR0EsS0FBQSxHQUFRLEdBQUcsQ0FBQyxJQUFKLENBQVMsSUFBVCxDQUhSLENBQUE7QUFBQSxJQUlBLFFBQUEsR0FBVyxHQUFHLENBQUMsSUFBSixDQUFTLE9BQVQsQ0FKWCxDQUFBO0FBQUEsSUFLQSxPQUFBLEdBQVUsR0FBRyxDQUFDLEtBQUosQ0FBVSxJQUFWLENBQWUsQ0FBQyxJQUFoQixDQUFBLENBQUEsSUFBMEIsRUFMcEMsQ0FBQTtBQUFBLElBTUEsVUFBQSxHQUNJO0FBQUEsTUFBQSxDQUFBLEVBQUcsR0FBRyxDQUFDLElBQUosQ0FBUyxPQUFULENBQUg7QUFBQSxNQUNBLENBQUEsRUFBRyxHQUFHLENBQUMsSUFBSixDQUFTLFFBQVQsQ0FESDtLQVBKLENBQUE7QUFBQSxJQVVBLEdBQUEsR0FBTSxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsTUFBWCxDQUFrQixLQUFsQixDQVZOLENBQUE7QUFhQSxJQUFBLElBQWdDLE1BQUEsQ0FBQSxLQUFBLEtBQWtCLFdBQWxEO0FBQUEsTUFBQSxHQUFBLEdBQU0sR0FBRyxDQUFDLElBQUosQ0FBUyxJQUFULEVBQWUsS0FBZixDQUFOLENBQUE7S0FiQTtBQWNBLElBQUEsSUFBRyxNQUFBLENBQUEsUUFBQSxLQUFxQixXQUF4QjtBQUNJLE1BQUEsR0FBQSxHQUFNLENBQUssR0FBRyxDQUFDLElBQUosQ0FBUyxPQUFULENBQUEsS0FBdUIsV0FBM0IsR0FBNkMsR0FBRyxDQUFDLElBQUosQ0FBUyxPQUFULENBQTdDLEdBQW9FLEVBQXJFLENBQU4sQ0FBQTtBQUFBLE1BQ0EsR0FBQSxHQUFNLEdBQUcsQ0FBQyxJQUFKLENBQVMsT0FBVCxFQUFrQixRQUFBLEdBQVcsR0FBWCxHQUFpQixHQUFqQixHQUF1QixlQUF6QyxDQUROLENBREo7S0FkQTtBQUFBLElBbUJBLENBQUMsQ0FBQyxJQUFGLENBQU8sT0FBUCxFQUFnQixTQUFDLElBQUQsRUFBTyxLQUFQLEdBQUE7QUFDWixNQUFBLEdBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQyxZQUFQLENBQW9CLE9BQUEsR0FBVSxJQUE5QixFQUFvQyxLQUFwQyxDQUFBLENBRFk7SUFBQSxDQUFoQixDQW5CQSxDQUFBO0FBQUEsSUFzQkEsR0FBQSxHQUFNLEdBQUcsQ0FBQyxVQUFKLENBQWUsU0FBZixDQXRCTixDQUFBO0FBQUEsSUF5QkEsRUFBQSxHQUFLLFVBQUEsQ0FBVyxHQUFHLENBQUMsSUFBSixDQUFTLE9BQVQsQ0FBWCxDQXpCTCxDQUFBO0FBQUEsSUEwQkEsRUFBQSxHQUFLLFVBQUEsQ0FBVyxHQUFHLENBQUMsSUFBSixDQUFTLFFBQVQsQ0FBWCxDQTFCTCxDQUFBO0FBNkJBLElBQUEsSUFBRyxVQUFVLENBQUMsQ0FBWCxJQUFpQixVQUFVLENBQUMsQ0FBL0I7QUFDSSxNQUFBLENBQUEsQ0FBRSxHQUFGLENBQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQixVQUFVLENBQUMsQ0FBaEMsQ0FBQSxDQUFBO0FBQUEsTUFDQSxDQUFBLENBQUUsR0FBRixDQUFNLENBQUMsSUFBUCxDQUFZLFFBQVosRUFBc0IsVUFBVSxDQUFDLENBQWpDLENBREEsQ0FESjtLQUFBLE1BS0ssSUFBRyxVQUFVLENBQUMsQ0FBZDtBQUNELE1BQUEsQ0FBQSxDQUFFLEdBQUYsQ0FBTSxDQUFDLElBQVAsQ0FBWSxPQUFaLEVBQXFCLFVBQVUsQ0FBQyxDQUFoQyxDQUFBLENBQUE7QUFBQSxNQUNBLENBQUEsQ0FBRSxHQUFGLENBQU0sQ0FBQyxJQUFQLENBQVksUUFBWixFQUFzQixDQUFDLEVBQUEsR0FBSyxFQUFOLENBQUEsR0FBWSxVQUFVLENBQUMsQ0FBN0MsQ0FEQSxDQURDO0tBQUEsTUFLQSxJQUFHLFVBQVUsQ0FBQyxDQUFkO0FBQ0QsTUFBQSxDQUFBLENBQUUsR0FBRixDQUFNLENBQUMsSUFBUCxDQUFZLFFBQVosRUFBc0IsVUFBVSxDQUFDLENBQWpDLENBQUEsQ0FBQTtBQUFBLE1BQ0EsQ0FBQSxDQUFFLEdBQUYsQ0FBTSxDQUFDLElBQVAsQ0FBWSxPQUFaLEVBQXFCLENBQUMsRUFBQSxHQUFLLEVBQU4sQ0FBQSxHQUFZLFVBQVUsQ0FBQyxDQUE1QyxDQURBLENBREM7S0F2Q0w7V0E0Q0EsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsR0FBaEIsRUE5Q087RUFBQSxDQW5DWCxDQUFBOztBQUFBLHNCQXNGQSxXQUFBLEdBQWEsU0FBQyxDQUFELEdBQUE7V0FFVCxJQUFDLENBQUEsU0FBRCxDQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBbEIsRUFBc0IsQ0FBQyxDQUFDLFNBQXhCLEVBRlM7RUFBQSxDQXRGYixDQUFBOztBQUFBLHNCQTBGQSxjQUFBLEdBQWdCLFNBQUMsQ0FBRCxHQUFBLENBMUZoQixDQUFBOzttQkFBQTs7SUFGSixDQUFBOztBQUFBLE1Ba0dNLENBQUMsT0FBUCxHQUFpQixTQWxHakIsQ0FBQTs7Ozs7QUNFQSxJQUFBLHFCQUFBO0VBQUEsZ0ZBQUE7O0FBQUE7QUFJaUIsRUFBQSxzQkFBQyxFQUFELEdBQUE7QUFDVCwrQ0FBQSxDQUFBO0FBQUEsK0NBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBQSxDQUFFLEVBQUYsQ0FBUCxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdCQUFWLENBRFYsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSwwQkFBVixDQUZkLENBQUE7QUFJQSxJQUFBLElBQUksSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLGtCQUFqQixDQUFvQyxDQUFDLElBQXJDLENBQUEsQ0FBQSxLQUErQyxDQUFuRDtBQUNJLE1BQUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsa0JBQWpCLENBQWQsQ0FESjtLQUpBO0FBQUEsSUFPQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdCQUFWLENBUFYsQ0FBQTtBQUFBLElBVUEsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FWQSxDQUFBO0FBQUEsSUFXQSxJQUFDLENBQUEsdUJBQUQsQ0FBQSxDQVhBLENBQUE7QUFBQSxJQVlBLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FaQSxDQURTO0VBQUEsQ0FBYjs7QUFBQSx5QkFpQkEsdUJBQUEsR0FBeUIsU0FBQSxHQUFBO0FBQ3JCLElBQUEsSUFBQyxDQUFBLEVBQUQsR0FBTSxHQUFBLENBQUEsV0FBTixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBQSxDQUZBLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxFQUFFLENBQUMsR0FBSixDQUFRLFFBQVEsQ0FBQyxNQUFULENBQWdCLENBQUEsQ0FBRSxVQUFGLENBQWhCLEVBQStCLEdBQS9CLEVBQ0o7QUFBQSxNQUFDLE1BQUEsRUFBUSxDQUFBLENBQVQ7QUFBQSxNQUFhLE9BQUEsRUFBUSxNQUFyQjtBQUFBLE1BQTZCLENBQUEsRUFBRyxDQUFoQztLQURJLEVBQ2dDO0FBQUEsTUFBQyxNQUFBLEVBQVEsSUFBVDtBQUFBLE1BQWUsT0FBQSxFQUFRLE9BQXZCO0FBQUEsTUFBZ0MsQ0FBQSxFQUFHLFVBQW5DO0tBRGhDLENBQVIsQ0FKQSxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsRUFBRSxDQUFDLEdBQUosQ0FBUSxRQUFRLENBQUMsRUFBVCxDQUFZLElBQUMsQ0FBQSxHQUFiLEVBQW1CLEdBQW5CLEVBQ0o7QUFBQSxNQUFBLFNBQUEsRUFBVSxDQUFWO0tBREksQ0FBUixDQVBBLENBQUE7QUFBQSxJQVVBLElBQUMsQ0FBQSxFQUFFLENBQUMsR0FBSixDQUFRLFFBQVEsQ0FBQyxFQUFULENBQVksSUFBQyxDQUFBLE1BQWIsRUFBc0IsR0FBdEIsRUFDSjtBQUFBLE1BQUEsS0FBQSxFQUFNLENBQU47S0FESSxDQUFSLENBVkEsQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLEVBQUUsQ0FBQyxHQUFKLENBQVEsUUFBUSxDQUFDLEVBQVQsQ0FBWSxJQUFDLENBQUEsTUFBYixFQUFzQixHQUF0QixFQUNKO0FBQUEsTUFBQSxLQUFBLEVBQU0sQ0FBTjtLQURJLEVBR0osT0FISSxDQUFSLENBYkEsQ0FBQTtBQUFBLElBa0JBLElBQUMsQ0FBQSxFQUFFLENBQUMsUUFBSixDQUFhLGFBQWIsQ0FsQkEsQ0FBQTtXQW9CQSxJQUFDLENBQUEsRUFBRSxDQUFDLElBQUosQ0FBQSxFQXJCcUI7RUFBQSxDQWpCekIsQ0FBQTs7QUFBQSx5QkF3Q0EsbUJBQUEsR0FBcUIsU0FBQSxHQUFBLENBeENyQixDQUFBOztBQUFBLHlCQTRDQSxTQUFBLEdBQVcsU0FBQSxHQUFBO1dBQ1AsSUFBQyxDQUFBLFVBQUQsR0FBa0IsSUFBQSxNQUFBLENBQU8sSUFBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQWYsRUFEWDtFQUFBLENBNUNYLENBQUE7O0FBQUEseUJBaURBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxHQUFBO0FBQ2pCLElBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxxQkFBWixDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFEYixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsRUFBRSxDQUFDLFdBQUosQ0FBZ0IsSUFBQyxDQUFBLFNBQWpCLEVBQTRCLGFBQTVCLENBRkEsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLEVBQUUsQ0FBQyxJQUFKLENBQUEsQ0FIQSxDQUFBO1dBSUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxFQUFaLENBQWUsS0FBZixFQUF1QixJQUFDLENBQUEsWUFBeEIsRUFMaUI7RUFBQSxDQWpEckIsQ0FBQTs7QUFBQSx5QkF3REEsb0JBQUEsR0FBc0IsU0FBQSxHQUFBO0FBQ2xCLElBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxzQkFBWixDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFnQixLQUFoQixFQUF3QixJQUFDLENBQUEsWUFBekIsQ0FEQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsRUFBRSxDQUFDLGNBQUosQ0FBbUIsSUFBQyxDQUFBLFNBQXBCLENBRkEsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLEVBQUUsQ0FBQyxPQUFKLENBQUEsQ0FIQSxDQUFBO1dBSUEsTUFBQSxDQUFBLElBQVEsQ0FBQSxVQUxVO0VBQUEsQ0F4RHRCLENBQUE7O0FBQUEseUJBZ0VBLFlBQUEsR0FBYyxTQUFDLENBQUQsR0FBQTtBQUNWLElBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsb0JBQUQsQ0FBQSxFQUZVO0VBQUEsQ0FoRWQsQ0FBQTs7QUFBQSx5QkFxRUEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNULElBQUEsSUFBRyxJQUFDLENBQUEsYUFBSjtBQUNJLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxXQUFmLENBQTJCLENBQTNCLEVBRko7S0FEUztFQUFBLENBckViLENBQUE7O0FBQUEseUJBMkVBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDWCxRQUFBLFlBQUE7QUFBQSxJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxPQUFWLENBQVAsQ0FBQTtBQUFBLElBQ0EsRUFBQSxHQUFLLE1BQU0sQ0FBQyxVQURaLENBQUE7V0FFQSxFQUFBLEdBQUssSUFBSSxDQUFDLE1BQUwsQ0FBQSxFQUhNO0VBQUEsQ0EzRWYsQ0FBQTs7QUFBQSx5QkFtRkEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1IsUUFBQSxTQUFBO0FBQUEsSUFBQSxJQUFHLElBQUksQ0FBQyxHQUFMLEtBQVksRUFBWixJQUFvQixrQkFBdkI7QUFDSSxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksd0JBQVosQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUEsQ0FBRSxtREFBQSxHQUFzRCxJQUFJLENBQUMsTUFBM0QsR0FBb0UsdUNBQXRFLENBRFYsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLElBQUMsQ0FBQSxNQUFsQixDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFFBQVosRUFBc0IsTUFBdEIsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBSkEsQ0FBQTtBQU1BLGFBQU8sS0FBUCxDQVBKO0tBQUE7QUFBQSxJQVNBLEdBQUEsR0FBTSxDQUFBLENBQUUsZ0JBQUEsR0FBaUIsSUFBSSxDQUFDLEdBQXRCLEdBQTBCLDJCQUE1QixDQVROLENBQUE7QUFBQSxJQVVBLElBQUEsR0FBTyxDQUFBLENBQUUsZ0JBQUEsR0FBaUIsSUFBSSxDQUFDLElBQXRCLEdBQTJCLDRCQUE3QixDQVZQLENBQUE7QUFBQSxJQVlBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQSxDQUFFLHlGQUFGLENBWlosQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLEdBQWpCLENBYkEsQ0FBQTtBQUFBLElBY0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLElBQWpCLENBZEEsQ0FBQTtBQUFBLElBZUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLElBQUMsQ0FBQSxRQUFsQixDQWZBLENBQUE7QUFpQkEsSUFBQSxJQUFHLDBCQUFIO0FBQ0ksTUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxDQUFBLENBREo7S0FqQkE7V0FtQkEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsT0FBQSxDQUFRLGdCQUFSLEVBQ2I7QUFBQSxNQUFBLEtBQUEsRUFBTSxNQUFOO0FBQUEsTUFDQSxNQUFBLEVBQU8sTUFEUDtLQURhLEVBcEJUO0VBQUEsQ0FuRlosQ0FBQTs7QUFBQSx5QkE4R0EsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUdQLElBQUEsSUFBRywwQkFBSDthQUNJLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFBLEVBREo7S0FITztFQUFBLENBOUdYLENBQUE7O0FBQUEseUJBb0hBLFNBQUEsR0FBVyxTQUFBLEdBQUE7V0FDUCxPQUFPLENBQUMsR0FBUixDQUFZLFdBQVosRUFETztFQUFBLENBcEhYLENBQUE7O3NCQUFBOztJQUpKLENBQUE7O0FBQUEsT0E2SEEsR0FBYyxJQUFBLFlBQUEsQ0FBYSxVQUFiLENBN0hkLENBQUE7O0FBQUEsTUFtSU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWYsR0FBa0MsU0FBQyxJQUFELEdBQUE7QUFDOUIsRUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFNBQVosRUFBdUIsSUFBdkIsQ0FBQSxDQUFBO0FBQUEsRUFDQSxPQUFPLENBQUMsVUFBUixDQUFtQixJQUFuQixDQURBLENBQUE7QUFJQSxFQUFBLElBQUcsQ0FBQSxDQUFFLElBQUksQ0FBQyxHQUFMLEtBQVksRUFBYixDQUFKO0FBQ0ksSUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGlCQUFaLENBQUEsQ0FBQTtXQUNBLE9BQU8sQ0FBQyxtQkFBUixDQUE0QixPQUFPLENBQUMsU0FBcEMsRUFGSjtHQUFBLE1BQUE7QUFJSSxJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksaUJBQVosQ0FBQSxDQUFBO1dBQ0EsT0FBTyxDQUFDLG1CQUFSLENBQTRCLE9BQU8sQ0FBQyxTQUFwQyxFQUxKO0dBTDhCO0FBQUEsQ0FuSWxDLENBQUE7Ozs7O0FDRkEsSUFBQSxzREFBQTtFQUFBOzs2QkFBQTs7QUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGtDQUFSLENBQWIsQ0FBQTs7QUFBQSxXQUNBLEdBQWMsT0FBQSxDQUFRLHNCQUFSLENBRGQsQ0FBQTs7QUFBQSxhQUdBLEdBQWdCLG9CQUhoQixDQUFBOztBQUFBO0FBUUksb0NBQUEsQ0FBQTs7QUFBYSxFQUFBLHdCQUFDLElBQUQsR0FBQTtBQUVULGlEQUFBLENBQUE7QUFBQSx5RUFBQSxDQUFBO0FBQUEseURBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSxtREFBQSxDQUFBO0FBQUEsUUFBQSxLQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsR0FBRCxHQUFPLENBQUEsQ0FBRSxJQUFJLENBQUMsRUFBUCxDQUFQLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxDQUFDLEtBQUwsSUFBYyxLQUR2QixDQUFBO0FBQUEsSUFFQSxLQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsSUFBYyxDQUZyQixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLENBQUEsQ0FBRSxtQ0FBRixDQUhkLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixJQUFqQixFQUF3QixJQUFJLENBQUMsRUFBN0IsQ0FKQSxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsU0FBaEIsRUFBMkIsS0FBM0IsQ0FMQSxDQUFBO0FBQUEsSUFNQSxRQUFRLENBQUMsR0FBVCxDQUFhLElBQUMsQ0FBQSxVQUFkLEVBQ0k7QUFBQSxNQUFBLENBQUEsRUFBRSxLQUFBLEdBQVEsRUFBVjtLQURKLENBTkEsQ0FBQTtBQUFBLElBU0EsZ0RBQU0sSUFBTixDQVRBLENBRlM7RUFBQSxDQUFiOztBQUFBLDJCQWVBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTtBQUNSLElBQUEsK0NBQU0sSUFBTixDQUFBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQSxXQUFBLENBQVksSUFBWixDQUZiLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFlBQVYsRUFBeUIsSUFBQyxDQUFBLFdBQTFCLENBSEEsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsYUFBVixFQUEwQixJQUFDLENBQUEsYUFBM0IsQ0FKQSxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxjQUFWLEVBQTJCLElBQUMsQ0FBQSxjQUE1QixDQUxBLENBQUE7V0FNQSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBQSxFQVBRO0VBQUEsQ0FmWixDQUFBOztBQUFBLDJCQTBCQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1IsSUFBQSxJQUFHLHVCQUFIO2FBQ0ksSUFBQyxDQUFBLEtBQUssQ0FBQyxhQUFQLENBQUEsRUFESjtLQUFBLE1BQUE7YUFHSSxJQUFDLENBQUEsWUFBRCxHQUFnQixLQUhwQjtLQURRO0VBQUEsQ0ExQlosQ0FBQTs7QUFBQSwyQkFrQ0EsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUdULElBQUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLENBQW9CLENBQUMsS0FBcEMsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsUUFBWCxDQUFvQixDQUFDLE1BRHJDLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxNQUFELEdBQVUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FIVixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFtQixJQUFuQixDQUpYLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixPQUFyQixFQUErQixJQUFDLENBQUEsV0FBaEMsQ0FOQSxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsUUFBckIsRUFBZ0MsSUFBQyxDQUFBLFlBQWpDLENBUEEsQ0FBQTtBQUFBLElBVUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLElBQUMsQ0FBQSxNQUFwQixDQVZBLENBQUE7QUFBQSxJQVdBLElBQUMsQ0FBQSxHQUFHLENBQUMsT0FBTCxDQUFhLElBQUMsQ0FBQSxVQUFkLENBWEEsQ0FBQTtBQUFBLElBWUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxZQUFQLENBQUEsQ0FaQSxDQUFBO0FBYUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxZQUFKO2FBQ0ksSUFBQyxDQUFBLEtBQUssQ0FBQyxhQUFQLENBQUEsRUFESjtLQWhCUztFQUFBLENBbENiLENBQUE7O0FBQUEsMkJBc0RBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFFVixJQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFtQixDQUFuQixFQUF1QixDQUF2QixFQUEyQixJQUFDLENBQUEsV0FBNUIsRUFBMEMsSUFBQyxDQUFBLFlBQTNDLENBQUEsQ0FBQTtXQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFtQixJQUFDLENBQUEsVUFBVSxDQUFDLEdBQS9CLEVBQXFDLENBQXJDLEVBQXdDLENBQXhDLEVBQTRDLElBQUMsQ0FBQSxXQUE3QyxFQUEyRCxJQUFDLENBQUEsWUFBNUQsRUFIVTtFQUFBLENBdERkLENBQUE7O0FBQUEsMkJBMkRBLFlBQUEsR0FBYyxTQUFDLEdBQUQsR0FBQTtBQUVWLFFBQUEsMkJBQUE7QUFBQSxJQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxVQUFYLENBQVgsQ0FBQTtBQUVBLElBQUEsSUFBRyxRQUFRLENBQUMsTUFBVCxHQUFrQixHQUFyQjtBQUNJLE1BQUEsS0FBQSxHQUFRLFFBQVMsQ0FBQSxHQUFBLENBQWpCLENBQUE7QUFBQSxNQUNBLFVBQUEsR0FBYSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBZ0IsS0FBSyxDQUFDLFFBQXRCLENBRGIsQ0FBQTthQUdBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFtQixVQUFVLENBQUMsR0FBOUIsRUFBb0MsS0FBSyxDQUFDLENBQTFDLEVBQThDLEtBQUssQ0FBQyxDQUFwRCxFQUF1RCxLQUFLLENBQUMsS0FBN0QsRUFBb0UsS0FBSyxDQUFDLE1BQTFFLEVBSko7S0FKVTtFQUFBLENBM0RkLENBQUE7O0FBQUEsMkJBeUVBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFHWCxRQUFBLGlEQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsVUFBWCxDQUFzQixDQUFDLE1BQWhDLENBQUE7QUFBQSxJQUNBLEtBQUEsR0FBUSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLENBQW9CLENBQUMsR0FEN0IsQ0FBQTtBQUFBLElBRUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFFBQVgsQ0FBb0IsQ0FBQyxLQUFyQixJQUE4QixDQUZ0QyxDQUFBO0FBQUEsSUFHQSxXQUFBLEdBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsUUFBWCxDQUFvQixDQUFDLFdBQXJCLElBQW9DLEVBSGxELENBQUE7QUFBQSxJQU9BLFFBQUEsR0FBWSxNQUFBLEdBQVMsS0FQckIsQ0FBQTtBQUFBLElBVUEsSUFBQSxHQUFPLElBVlAsQ0FBQTtBQUFBLElBV0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsQ0FBQSxDQVhoQixDQUFBO1dBWUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFRLENBQUMsRUFBVCxDQUFZLElBQUMsQ0FBQSxNQUFiLEVBQXNCLFFBQXRCLEVBQ3pCO0FBQUEsTUFBQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ04sWUFBQSxRQUFBO0FBQUEsUUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFBLEdBQVMsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFwQixDQUFYLENBQUE7QUFDQSxRQUFBLElBQUcsUUFBQSxLQUFjLElBQUMsQ0FBQSxZQUFsQjtBQUNJLFVBQUEsSUFBSSxDQUFDLFlBQUwsQ0FBQSxDQUFBLENBQUE7QUFBQSxVQUNBLElBQUksQ0FBQyxZQUFMLENBQWtCLFFBQWxCLENBREEsQ0FESjtTQURBO2VBS0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsU0FOVjtNQUFBLENBQVY7QUFBQSxNQU9BLE1BQUEsRUFBTyxDQUFBLENBUFA7QUFBQSxNQVFBLFdBQUEsRUFBYSxXQVJiO0FBQUEsTUFTQSxLQUFBLEVBQU0sS0FUTjtLQUR5QixFQWZsQjtFQUFBLENBekVmLENBQUE7O0FBQUEsMkJBNEdBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFFWCxJQUFBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFQLENBQWdCLE9BQWhCLENBQWQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxZQUFELENBQUEsRUFIVztFQUFBLENBNUdmLENBQUE7O0FBQUEsMkJBa0hBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ1osSUFBQSxJQUFHLE1BQUEsQ0FBQSxJQUFRLENBQUEsS0FBUixLQUFpQixVQUFwQjtBQUNJLE1BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUFBLENBREo7S0FBQTtBQUFBLElBRUEsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEVBQVYsQ0FBYSxRQUFiLEVBQXdCLElBQUMsQ0FBQSxzQkFBekIsQ0FGQSxDQUFBO1dBR0EsSUFBQyxDQUFBLHNCQUFELENBQUEsRUFKWTtFQUFBLENBbEhoQixDQUFBOztBQUFBLDJCQXlIQSxzQkFBQSxHQUF3QixTQUFBLEdBQUE7QUFFcEIsSUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBSDtBQUVJLE1BQUEsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEdBQVYsQ0FBYyxRQUFkLEVBQXlCLElBQUMsQ0FBQSxzQkFBMUIsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQUhKO0tBRm9CO0VBQUEsQ0F6SHhCLENBQUE7O0FBQUEsMkJBcUlBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFFUixRQUFBLDRDQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQUEsQ0FBb0IsQ0FBQyxHQUEzQixDQUFBO0FBQUEsSUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLFFBQWpCLENBQTBCLENBQUMsS0FBM0IsQ0FBQSxDQUFrQyxDQUFDLE1BQW5DLENBQUEsQ0FEVCxDQUFBO0FBQUEsSUFFQSxNQUFBLEdBQVMsR0FBQSxHQUFNLE1BRmYsQ0FBQTtBQUFBLElBSUEsU0FBQSxHQUFZLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxTQUFWLENBQUEsQ0FKWixDQUFBO0FBQUEsSUFLQSxZQUFBLEdBQWUsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFNBQVYsQ0FBQSxDQUFBLEdBQXdCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQUEsQ0FMdkMsQ0FBQTtBQU9BLElBQUEsSUFBRyxDQUFBLFNBQUEsSUFBYSxHQUFiLElBQWEsR0FBYixJQUFvQixZQUFwQixDQUFIO2FBQ0ksS0FESjtLQUFBLE1BQUE7YUFHSSxNQUhKO0tBVFE7RUFBQSxDQXJJWixDQUFBOzt3QkFBQTs7R0FIeUIsV0FMN0IsQ0FBQTs7QUFBQSxNQTZKTSxDQUFDLE9BQVAsR0FBaUIsY0E3SmpCLENBQUE7Ozs7O0FDRUEsSUFBQSwwQkFBQTtFQUFBOzs2QkFBQTs7QUFBQSxhQUFBLEdBQWdCLG9CQUFoQixDQUFBOztBQUFBO0FBS0ksaUNBQUEsQ0FBQTs7QUFBYSxFQUFBLHFCQUFDLElBQUQsR0FBQTtBQUNULDZEQUFBLENBQUE7QUFBQSx1RUFBQSxDQUFBO0FBQUEscURBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUMsT0FBaEIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLEdBQUQsR0FBTyxJQUFJLENBQUMsR0FEWixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsWUFBRCxHQUFnQixFQUZoQixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsYUFBRCxHQUFpQixFQUhqQixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBSkEsQ0FBQTtBQUFBLElBS0EsNkNBQU0sSUFBTixDQUxBLENBRFM7RUFBQSxDQUFiOztBQUFBLHdCQVNBLFFBQUEsR0FBVSxTQUFBLEdBQUE7V0FDTixDQUFDLENBQUMsSUFBRixDQUNJO0FBQUEsTUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLE9BQUQsR0FBWSxJQUFDLENBQUEsR0FBbEI7QUFBQSxNQUNBLE1BQUEsRUFBUSxLQURSO0FBQUEsTUFFQSxRQUFBLEVBQVUsTUFGVjtBQUFBLE1BR0EsT0FBQSxFQUFTLElBQUMsQ0FBQSxZQUhWO0FBQUEsTUFJQSxLQUFBLEVBQU8sSUFBQyxDQUFBLFdBSlI7S0FESixFQURNO0VBQUEsQ0FUVixDQUFBOztBQUFBLHdCQWlCQSxXQUFBLEdBQWEsU0FBQyxHQUFELEdBQUE7QUFDVCxVQUFNLEdBQU4sQ0FEUztFQUFBLENBakJiLENBQUE7O0FBQUEsd0JBb0JBLFlBQUEsR0FBYyxTQUFDLElBQUQsR0FBQTtBQUVWLElBQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFSLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FEQSxDQUFBO1dBRUEsSUFBQyxDQUFBLElBQUQsQ0FBTSxZQUFOLEVBSlU7RUFBQSxDQXBCZCxDQUFBOztBQUFBLHdCQTJCQSxZQUFBLEdBQWMsU0FBQyxDQUFELEVBQUcsQ0FBSCxHQUFBO0FBQ1YsUUFBQSxjQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsYUFBYSxDQUFDLElBQWQsQ0FBbUIsQ0FBQyxDQUFDLFFBQXJCLENBQVQsQ0FBQTtBQUFBLElBQ0EsTUFBQSxHQUFTLGFBQWEsQ0FBQyxJQUFkLENBQW1CLENBQUMsQ0FBQyxRQUFyQixDQURULENBQUE7QUFFTyxJQUFBLElBQUcsUUFBQSxDQUFTLE1BQU8sQ0FBQSxDQUFBLENBQWhCLENBQUEsR0FBc0IsUUFBQSxDQUFTLE1BQU8sQ0FBQSxDQUFBLENBQWhCLENBQXpCO2FBQWtELENBQUEsRUFBbEQ7S0FBQSxNQUFBO2FBQTBELEVBQTFEO0tBSEc7RUFBQSxDQTNCZCxDQUFBOztBQUFBLHdCQWdDQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ1gsUUFBQSwyQkFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBZixDQUFvQixJQUFDLENBQUEsWUFBckIsQ0FBQSxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FDSTtBQUFBLE1BQUEsRUFBQSxFQUFHLE9BQUg7QUFBQSxNQUNBLEdBQUEsRUFBUSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFkLEdBQXFCLEdBQXJCLEdBQXdCLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBRDVDO0tBREosQ0FIQSxDQUFBO0FBT0E7QUFBQTtTQUFBLHFDQUFBO3FCQUFBO0FBQ0ksTUFBQSxLQUFLLENBQUMsR0FBTixHQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQWQsR0FBcUIsR0FBckIsR0FBd0IsS0FBSyxDQUFDLFFBQTVDLENBQUE7QUFBQSxtQkFDQSxJQUFDLENBQUEsWUFBWSxDQUFDLElBQWQsQ0FDSTtBQUFBLFFBQUEsRUFBQSxFQUFJLEtBQUssQ0FBQyxRQUFWO0FBQUEsUUFDQSxHQUFBLEVBQUssS0FBSyxDQUFDLEdBRFg7T0FESixFQURBLENBREo7QUFBQTttQkFSVztFQUFBLENBaENmLENBQUE7O0FBQUEsd0JBOENBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDUixJQUFBLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsSUFBbkIsRUFBeUIsSUFBQyxDQUFBLE9BQTFCLEVBQW1DLElBQW5DLENBQW5CLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUEsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsSUFBbkIsRUFBeUIsSUFBQyxDQUFBLE9BQTFCLEVBQW1DLElBQW5DLENBRGpCLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsaUJBQWIsQ0FBK0IsRUFBL0IsQ0FGQSxDQUFBO1dBR0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxpQkFBWCxDQUE2QixFQUE3QixFQUpRO0VBQUEsQ0E5Q1osQ0FBQTs7QUFBQSx3QkFzREEsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUVWLElBQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixVQUE5QixFQUEyQyxJQUFDLENBQUEscUJBQTVDLENBQUEsQ0FBQTtXQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsWUFBYixDQUEwQixJQUFDLENBQUEsYUFBM0IsRUFIVTtFQUFBLENBdERkLENBQUE7O0FBQUEsd0JBMERBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFHWCxJQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsZ0JBQVgsQ0FBNEIsVUFBNUIsRUFBeUMsSUFBQyxDQUFBLGdCQUExQyxDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsU0FBUyxDQUFDLFlBQVgsQ0FBd0IsSUFBQyxDQUFBLFlBQXpCLEVBSlc7RUFBQSxDQTFEZixDQUFBOztBQUFBLHdCQWdFQSxxQkFBQSxHQUF1QixTQUFDLENBQUQsR0FBQTtBQUVuQixJQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsbUJBQWIsQ0FBaUMsVUFBakMsRUFBOEMsSUFBQyxDQUFBLHFCQUEvQyxDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsSUFBRCxDQUFNLGFBQU4sRUFIbUI7RUFBQSxDQWhFdkIsQ0FBQTs7QUFBQSx3QkFxRUEsZ0JBQUEsR0FBa0IsU0FBQyxDQUFELEdBQUE7QUFFZCxJQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsbUJBQVgsQ0FBK0IsVUFBL0IsRUFBNEMsSUFBQyxDQUFBLGdCQUE3QyxDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsSUFBRCxDQUFNLGNBQU4sRUFIYztFQUFBLENBckVsQixDQUFBOztBQUFBLHdCQTZFQSxRQUFBLEdBQVUsU0FBQyxFQUFELEdBQUE7QUFFTixRQUFBLElBQUE7QUFBQSxJQUFBLElBQUEsR0FBUSxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBbUIsRUFBbkIsQ0FBUixDQUFBO0FBQ0EsSUFBQSxJQUFJLFlBQUo7QUFDSSxNQUFBLElBQUEsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBcUIsRUFBckIsQ0FBUixDQURKO0tBREE7QUFHQSxXQUFPLElBQVAsQ0FMTTtFQUFBLENBN0VWLENBQUE7O0FBQUEsd0JBb0ZBLEdBQUEsR0FBSyxTQUFDLEdBQUQsR0FBQTtBQUNELFFBQUEsU0FBQTtBQUFBO0FBQUEsU0FBQSxRQUFBO2lCQUFBO0FBQ0ksTUFBQSxJQUFHLENBQUEsS0FBSyxHQUFSO0FBQ0ksZUFBTyxDQUFQLENBREo7T0FESjtBQUFBLEtBREM7RUFBQSxDQXBGTCxDQUFBOztBQUFBLHdCQXlGQSxHQUFBLEdBQUssU0FBQyxHQUFELEVBQU0sR0FBTixHQUFBO1dBQ0QsSUFBQyxDQUFBLElBQUssQ0FBQSxHQUFBLENBQU4sR0FBYSxJQURaO0VBQUEsQ0F6RkwsQ0FBQTs7cUJBQUE7O0dBSHNCLGFBRjFCLENBQUE7O0FBQUEsTUF3R00sQ0FBQyxPQUFQLEdBQWlCLFdBeEdqQixDQUFBOzs7OztBQ0RBLElBQUEsbUJBQUE7RUFBQTs7NkJBQUE7O0FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSw2QkFBUixDQUFYLENBQUE7O0FBQUE7QUFJSSwrQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7O0dBQUE7O0FBQUEsc0JBQUEsU0FBQSxHQUFZLEtBQVosQ0FBQTs7QUFBQSxzQkFDQSxPQUFBLEdBQVUsQ0FEVixDQUFBOztBQUFBLHNCQUVBLFFBQUEsR0FBVyxDQUZYLENBQUE7O0FBQUEsc0JBR0EsV0FBQSxHQUFhLENBSGIsQ0FBQTs7QUFBQSxzQkFNQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1IsSUFBQSxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQURBLENBQUE7QUFHQSxJQUFBLElBQUcsTUFBTSxDQUFDLFlBQVY7YUFDSSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBQSxFQURKO0tBSlE7RUFBQSxDQU5aLENBQUE7O0FBQUEsc0JBZUEsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNQLElBQUEsSUFBQyxDQUFBLGNBQUQsQ0FDSTtBQUFBLE1BQUEsbUJBQUEsRUFBc0IsY0FBdEI7QUFBQSxNQUVBLGFBQUEsRUFBZ0IsYUFGaEI7S0FESixDQUFBLENBQUE7QUFBQSxJQUtBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsU0FBZixFQUEyQixJQUFDLENBQUEsVUFBNUIsQ0FMQSxDQUFBO1dBTUEsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEVBQVosQ0FBZSxXQUFmLEVBQTZCLElBQUMsQ0FBQSxXQUE5QixFQVBPO0VBQUEsQ0FmWCxDQUFBOztBQUFBLHNCQTBCQSxZQUFBLEdBQWMsU0FBQyxHQUFELEdBQUE7QUFDVixJQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksR0FBWixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxTQUFWLENBQW9CLENBQUMsR0FBckIsQ0FDSTtBQUFBLE1BQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBQUEsR0FBcUIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsU0FBVixDQUFvQixDQUFDLE1BQXJCLENBQUEsQ0FBdEIsQ0FBakI7S0FESixDQURBLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FIQSxDQUFBO1dBSUEsSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQUxVO0VBQUEsQ0ExQmQsQ0FBQTs7QUFBQSxzQkFpQ0EsV0FBQSxHQUFhLFNBQUMsQ0FBRCxHQUFBO0FBQ1QsSUFBQSxJQUFDLENBQUEsT0FBRCxHQUFjLENBQUMsQ0FBQyxPQUFGLEtBQWUsTUFBbEIsR0FBaUMsQ0FBQyxDQUFDLE9BQW5DLEdBQWdELENBQUMsQ0FBQyxhQUFhLENBQUMsTUFBM0UsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsT0FBRCxHQUFXLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQUEsQ0FEdkIsQ0FBQTtXQUVBLElBQUMsQ0FBQSxPQUFELENBQVMsa0JBQVQsRUFBOEIsSUFBQyxDQUFBLFFBQS9CLEVBSFM7RUFBQSxDQWpDYixDQUFBOztBQUFBLHNCQXdDQSxZQUFBLEdBQWMsU0FBQyxDQUFELEdBQUE7QUFFVixJQUFBLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBTCxDQUNJO0FBQUEsTUFBQSxLQUFBLEVBQU0sTUFBTjtLQURKLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLE9BQUQsR0FBYyxDQUFDLENBQUMsT0FBRixLQUFlLE1BQWxCLEdBQWlDLENBQUMsQ0FBQyxPQUFuQyxHQUFnRCxDQUFDLENBQUMsYUFBYSxDQUFDLE1BRjNFLENBQUE7V0FHQSxJQUFDLENBQUEsU0FBRCxHQUFhLEtBTEg7RUFBQSxDQXhDZCxDQUFBOztBQUFBLHNCQStDQSxVQUFBLEdBQVksU0FBQyxDQUFELEdBQUE7QUFDUixJQUFBLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBTCxDQUNJO0FBQUEsTUFBQSxLQUFBLEVBQU0sTUFBTjtLQURKLENBQUEsQ0FBQTtXQUdBLElBQUMsQ0FBQSxTQUFELEdBQWEsTUFKTDtFQUFBLENBL0NaLENBQUE7O0FBQUEsc0JBcURBLFdBQUEsR0FBYSxTQUFDLENBQUQsR0FBQTtBQUNULElBQUEsSUFBRyxJQUFDLENBQUEsU0FBSjtBQUVJLE1BQUEsSUFBRyxDQUFDLENBQUMsS0FBRixHQUFVLElBQUMsQ0FBQSxPQUFYLElBQXNCLENBQXpCO0FBQ0ksUUFBQSxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsR0FBYixDQUNJO0FBQUEsVUFBQSxHQUFBLEVBQUssQ0FBTDtTQURKLENBQUEsQ0FESjtPQUFBLE1BR0ssSUFBRyxDQUFDLENBQUMsS0FBRixHQUFVLElBQUMsQ0FBQSxPQUFYLElBQXNCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQUEsQ0FBQSxHQUFxQixDQUFBLENBQUUsb0JBQUYsQ0FBdUIsQ0FBQyxNQUF4QixDQUFBLENBQTlDO0FBR0QsUUFBQSxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsR0FBYixDQUNJO0FBQUEsVUFBQSxHQUFBLEVBQU8sQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBQUEsR0FBcUIsQ0FBQSxDQUFFLG9CQUFGLENBQXVCLENBQUMsTUFBeEIsQ0FBQSxDQUF0QixDQUFBLEdBQTBELENBQWpFO1NBREosQ0FBQSxDQUhDO09BQUEsTUFBQTtBQU1ELFFBQUEsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLEdBQWIsQ0FDSTtBQUFBLFVBQUEsR0FBQSxFQUFLLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLE9BQWhCO1NBREosQ0FBQSxDQU5DO09BSEw7QUFBQSxNQWFBLElBQUMsQ0FBQSxRQUFELEdBQVksUUFBQSxDQUFTLENBQUEsQ0FBRSxvQkFBRixDQUF1QixDQUFDLEdBQXhCLENBQTRCLEtBQTVCLENBQVQsQ0FBQSxHQUErQyxDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQUEsQ0FBQSxHQUFxQixDQUFBLENBQUUsb0JBQUYsQ0FBdUIsQ0FBQyxNQUF4QixDQUFBLENBQXRCLENBYjNELENBQUE7QUFlQSxNQUFBLElBQUcsSUFBQyxDQUFBLFFBQUQsR0FBWSxVQUFBLENBQVcsSUFBWCxDQUFmO0FBQ0ksUUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLENBQVosQ0FESjtPQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsUUFBRCxHQUFZLFVBQUEsQ0FBVyxJQUFYLENBQWY7QUFDRCxRQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBWixDQURDO09BakJMO0FBQUEsTUFxQkEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxjQUFULEVBQTBCLElBQUMsQ0FBQSxRQUEzQixDQXJCQSxDQUZKO0tBQUE7QUEwQkEsSUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFELEtBQWEsQ0FBQyxDQUFDLE9BQWYsSUFBMkIsSUFBQyxDQUFBLE1BQUQsS0FBYSxDQUFDLENBQUMsT0FBN0M7QUFDSSxNQUFBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBRCxDQUFBLENBREEsQ0FESjtLQTFCQTtBQUFBLElBOEJBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxDQUFDLE9BOUJaLENBQUE7V0ErQkEsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUFDLENBQUMsUUFoQ0g7RUFBQSxDQXJEYixDQUFBOztBQUFBLHNCQXVGQSxRQUFBLEdBQVUsU0FBQyxDQUFELEdBQUE7QUFHTixJQUFBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFNBQVYsQ0FBb0IsQ0FBQyxHQUFyQixDQUNJO0FBQUEsTUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBQUEsR0FBcUIsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLE1BQWIsQ0FBQSxDQUF0QixDQUFBLEdBQWdELENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQUEsQ0FBeEQ7S0FESixDQUFBLENBQUE7V0FHQSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxRQUFmLEVBTk07RUFBQSxDQXZGVixDQUFBOztBQUFBLHNCQWdHQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ1gsSUFBQSxJQUFHLHdCQUFIO0FBQ0ksTUFBQSxZQUFBLENBQWEsSUFBQyxDQUFBLFdBQWQsQ0FBQSxDQURKO0tBQUE7V0FJQSxJQUFDLENBQUEsV0FBRCxHQUFlLFVBQUEsQ0FBVyxDQUFDLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7QUFDdkIsUUFBQSxJQUFHLEtBQUMsQ0FBQSxNQUFELEdBQVUsRUFBYjtpQkFDSSxRQUFRLENBQUMsRUFBVCxDQUFZLEtBQUMsQ0FBQSxHQUFiLEVBQWtCLEVBQWxCLEVBQ0k7QUFBQSxZQUFBLFNBQUEsRUFBVyxDQUFYO1dBREosRUFESjtTQUR1QjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUQsQ0FBWCxFQUlQLElBSk8sRUFMSjtFQUFBLENBaEdmLENBQUE7O0FBQUEsc0JBNEdBLGFBQUEsR0FBZSxTQUFBLEdBQUE7V0FDWCxRQUFRLENBQUMsRUFBVCxDQUFZLElBQUMsQ0FBQSxHQUFiLEVBQW1CLEVBQW5CLEVBQ0k7QUFBQSxNQUFBLFNBQUEsRUFBVyxFQUFYO0tBREosRUFEVztFQUFBLENBNUdmLENBQUE7O21CQUFBOztHQUZvQixTQUZ4QixDQUFBOztBQUFBLE1Bc0hNLENBQUMsT0FBUCxHQUFpQixTQXRIakIsQ0FBQTs7Ozs7QUNDQSxJQUFBLE1BQUE7O0FBQUE7c0JBR0k7O0FBQUEsRUFBQSxNQUFNLENBQUMsWUFBUCxHQUFzQixTQUFBLEdBQUE7V0FDbEIsRUFBRSxDQUFDLElBQUgsQ0FDSTtBQUFBLE1BQUEsS0FBQSxFQUFNLGlCQUFOO0FBQUEsTUFDQSxVQUFBLEVBQVcsZUFEWDtBQUFBLE1BRUEsTUFBQSxFQUFRLElBRlI7QUFBQSxNQUdBLElBQUEsRUFBTSxJQUhOO0tBREosRUFEa0I7RUFBQSxDQUF0QixDQUFBOztBQUFBLEVBVUEsTUFBTSxDQUFDLFlBQVAsR0FBc0IsU0FBQyxZQUFELEVBQWdCLEdBQWhCLEVBQXFCLFFBQXJCLEdBQUE7QUFDbEIsUUFBQSxXQUFBO0FBQUEsSUFBQSxJQUFBLEdBQU8sWUFBUCxDQUFBO0FBQUEsSUFDQSxRQUFBLEdBQVcsRUFEWCxDQUFBO0FBQUEsSUFFQSxHQUFBLEdBQU0sR0FGTixDQUFBO0FBQUEsSUFHQSxLQUFBLEdBQVEsd0NBQUEsR0FBMkMsa0JBQUEsQ0FBbUIsSUFBbkIsQ0FBM0MsR0FBc0UsT0FBdEUsR0FBZ0Ysa0JBQUEsQ0FBbUIsR0FBbkIsQ0FIeEYsQ0FBQTtBQUlBLElBQUEsSUFBbUMsUUFBbkM7QUFBQSxNQUFBLEdBQUEsSUFBTyxZQUFBLEdBQWUsUUFBdEIsQ0FBQTtLQUpBO1dBS0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLEtBQXJCLEVBQTRCLFNBQTVCLEVBTmtCO0VBQUEsQ0FWdEIsQ0FBQTs7QUFBQSxFQWtCQSxNQUFNLENBQUMsYUFBUCxHQUF1QixTQUFDLElBQUQsRUFBUSxPQUFSLEVBQWlCLFdBQWpCLEVBQStCLElBQS9CLEVBQXNDLE9BQXRDLEdBQUE7V0FFbkIsRUFBRSxDQUFDLEVBQUgsQ0FDSTtBQUFBLE1BQUEsTUFBQSxFQUFPLE1BQVA7QUFBQSxNQUNBLElBQUEsRUFBSyxJQURMO0FBQUEsTUFFQSxPQUFBLEVBQVEsT0FGUjtBQUFBLE1BR0EsSUFBQSxFQUFNLElBSE47QUFBQSxNQUlBLE9BQUEsRUFBUSxPQUpSO0FBQUEsTUFLQSxXQUFBLEVBQVksV0FMWjtLQURKLEVBRm1CO0VBQUEsQ0FsQnZCLENBQUE7O0FBQUEsRUE2QkEsTUFBTSxDQUFDLFdBQVAsR0FBcUIsU0FBQyxHQUFELEdBQUE7V0FFakIsSUFBQyxDQUFBLFNBQUQsQ0FBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXNCLG9DQUFBLEdBQXFDLEdBQTNELEVBQWdFLFFBQWhFLEVBRmlCO0VBQUEsQ0E3QnJCLENBQUE7O0FBQUEsRUFpQ0EsTUFBTSxDQUFDLGNBQVAsR0FBd0IsU0FBQyxHQUFELEVBQU8sV0FBUCxFQUFvQixPQUFwQixHQUFBO0FBRXBCLElBQUEsV0FBQSxHQUFjLFdBQVcsQ0FBQyxLQUFaLENBQWtCLEdBQWxCLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsR0FBNUIsQ0FBZCxDQUFBO1dBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLDhDQUFBLEdBQThDLENBQUMsa0JBQUEsQ0FBbUIsR0FBbkIsQ0FBRCxDQUE5QyxHQUF1RSxtQkFBdkUsR0FBMEYsV0FBMUYsR0FBc0csYUFBdEcsR0FBa0gsQ0FBQyxrQkFBQSxDQUFtQixPQUFuQixDQUFELENBQXZJLEVBSG9CO0VBQUEsQ0FqQ3hCLENBQUE7O0FBQUEsRUF1Q0EsTUFBTSxDQUFDLFNBQVAsR0FBbUIsU0FBQyxPQUFELEVBQVUsSUFBVixHQUFBO0FBQ2YsUUFBQSxDQUFBO0FBQUEsSUFBQSxDQUFBLEdBQUksSUFBQyxDQUFBLFNBQUQsQ0FBVyxDQUFYLEVBQWUsQ0FBZixFQUFrQixrQkFBQSxHQUFrQixDQUFDLGtCQUFBLENBQW1CLE9BQW5CLENBQUQsQ0FBbEIsR0FBK0MsUUFBL0MsR0FBc0QsQ0FBQyxrQkFBQSxDQUFtQixJQUFuQixDQUFELENBQXhFLENBQUosQ0FBQTtXQUNBLENBQUMsQ0FBQyxLQUFGLENBQUEsRUFGZTtFQUFBLENBdkNuQixDQUFBOztBQUFBLEVBMkNBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxHQUFQLEVBQVksSUFBWixHQUFBO1dBQ2YsTUFBTSxDQUFDLElBQVAsQ0FBWSxHQUFaLEVBQWlCLElBQWpCLEVBQXVCLGlCQUFBLEdBQW9CLENBQXBCLEdBQXdCLFVBQXhCLEdBQXFDLENBQXJDLEdBQXlDLFFBQXpDLEdBQW9ELENBQUMsTUFBTSxDQUFDLEtBQVAsR0FBZSxDQUFoQixDQUFBLEdBQXFCLENBQXpFLEdBQTZFLE9BQTdFLEdBQXVGLENBQUMsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBakIsQ0FBQSxHQUFzQixDQUFwSSxFQURlO0VBQUEsQ0EzQ25CLENBQUE7O2dCQUFBOztJQUhKLENBQUE7O0FBQUEsTUFrRE0sQ0FBQyxPQUFQLEdBQWlCLE1BbERqQixDQUFBOzs7OztBQ0ZBLElBQUEsaUVBQUE7O0FBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSwyQkFBUixDQUFWLENBQUE7O0FBQUEsU0FDQSxHQUFZLE9BQUEsQ0FBUSxnQ0FBUixDQURaLENBQUE7O0FBQUEsZ0JBRUEsR0FBbUIsT0FBQSxDQUFRLHVDQUFSLENBRm5CLENBQUE7O0FBQUEsV0FHQSxHQUFjLE9BQUEsQ0FBUSxrQ0FBUixDQUhkLENBQUE7O0FBQUEsY0FJQSxHQUFpQixPQUFBLENBQVEsbUNBQVIsQ0FKakIsQ0FBQTs7QUFBQSxDQU9BLENBQUUsUUFBRixDQUFXLENBQUMsS0FBWixDQUFrQixTQUFBLEdBQUE7QUFFZCxNQUFBLFVBQUE7U0FBQSxVQUFBLEdBQWlCLElBQUEsY0FBQSxDQUNiO0FBQUEsSUFBQSxFQUFBLEVBQUksTUFBSjtHQURhLEVBRkg7QUFBQSxDQUFsQixDQVBBLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5WaWV3QmFzZSA9IHJlcXVpcmUgXCIuL1ZpZXdCYXNlLmNvZmZlZVwiXG5TY3JvbGxCYXIgPSByZXF1aXJlIFwiLi4vdXRpbC9TY3JvbGxCYXIuY29mZmVlXCJcbkhlYWRlckFuaW1hdGlvbiA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvSGVhZGVyQW5pbWF0aW9uLmNvZmZlZSdcbmNsb3VkcyA9IHJlcXVpcmUgJy4uL3BhZ2VzL2FuaW1hdGlvbnMvY2xvdWRzLmNvZmZlZSdcblxuY2xhc3MgQW5pbWF0aW9uQmFzZSBleHRlbmRzIFZpZXdCYXNlXG5cblxuICAgIGNvbnN0cnVjdG9yOiAoZWwpIC0+XG4gICAgICAgIHN1cGVyKGVsKVxuICAgICAgICBAdGltZWxpbmUgPSBudWxsXG4gICAgICAgIEB0b3VjaFkgPSAwXG4gICAgICAgIEB0b3VjaFlMYXN0ID0gMFxuICAgICAgICBAZ2xvYmFsU2Nyb2xsQW1vdW50ID0gaWYgQGlzVGFibGV0IHRoZW4gLjUgZWxzZSAxXG4gICAgICAgIEBwcmV2U2Nyb2xsVG8gPSAwXG4gICAgICAgIEBwcmV2RGVsdGEgPSAwXG4gICAgICAgIEBjdXJyZW50UHJvZ3Jlc3MgPSAwXG4gICAgICAgIEB0b3RhbEFuaW1hdGlvblRpbWUgPSAxMFxuICAgICAgICBAc21vb3RoTXVsdGlwbGllciA9IDVcbiAgICAgICAgQG5hdlRpbWVyID0gbnVsbFxuICAgICAgICBAdmlkZW8gPSBudWxsXG4gICAgICAgIEBpbmxpbmVWaWRlbyA9IG51bGxcbiAgICAgICAgQGlzVGFibGV0ID0gJCgnaHRtbCcpLmhhc0NsYXNzKCd0YWJsZXQnKVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIGlmICFAaXNQaG9uZSAgXG4gICAgICAgICAgICBAcmVzZXRUaW1lbGluZSgpXG4gICAgICAgICAgICBAdG9nZ2xlVG91Y2hNb3ZlKClcbiAgICAgICAgICAgIEBvblJlc2l6ZSgpXG4gICAgICAgICAgICBAdXBkYXRlVGltZWxpbmUoKVxuXG4gICAgaW5pdENvbXBvbmVudHM6IC0+XG4gICAgICAgIEBoZWFkZXIgPSBuZXcgSGVhZGVyQW5pbWF0aW9uIFxuICAgICAgICAgICAgZWw6J2hlYWRlcidcblxuICAgIFxuXG5cbiAgICB0b2dnbGVUb3VjaE1vdmU6ICgpID0+XG4gICAgICAgICQoZG9jdW1lbnQpLm9mZiAnc2Nyb2xsJyAsIEBvblNjcm9sbFxuICAgICAgICBcbiAgICAgICAgQHNjcm9sbCA9XG4gICAgICAgICAgICBwb3NpdGlvbjogMFxuICAgICAgICAgICAgc2Nyb2xsVG9wOiAwXG4gICAgICAgICQoZG9jdW1lbnQpLnNjcm9sbCBAb25TY3JvbGxcbiAgICAgICAgQG9uU2Nyb2xsKClcblxuXG4gICAgZ2V0U2Nyb2xsYWJsZUFyZWE6IC0+XG4gICAgICAgIE1hdGguYWJzKCQoXCIjY29udGVudFwiKS5vdXRlckhlaWdodCgpIC0gQHN0YWdlSGVpZ2h0KVxuICAgIFxuICAgIGdldFNjcm9sbFRvcDogLT5cbiAgICAgICAgJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkgLyBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAgICAgXG4gICAgXG4gICAgXG4gICAgc2V0U2Nyb2xsVG9wOiAocGVyKSAtPiAgICAgIFxuICAgICAgICBwb3MgPSBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAqIHBlclxuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8gMCAsIHBvc1xuXG5cbiAgICBzZXREcmFnZ2FibGVQb3NpdGlvbjogKHBlcikgLT4gICAgICAgIFxuICAgICAgICBwb3MgPSBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAqIHBlciAgICAgICAgXG4gICAgICAgIFR3ZWVuTWF4LnNldCAkKFwiI2NvbnRlbnRcIikgLFxuICAgICAgICAgICAgeTogLXBvcyBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgb25TY3JvbGw6IChlKSA9PlxuICAgICAgICBpZiAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSA+IDMwXG4gICAgICAgICAgICAkKCcuY2lyYy1idG4td3JhcHBlcicpLmFkZENsYXNzICdpbnZpc2libGUnXG4gICAgICAgICAgICBcbiAgICAgICAgQHNjcm9sbC5wb3NpdGlvbiA9IEBnZXRTY3JvbGxUb3AoKVxuICAgICAgICBAc2Nyb2xsLnNjcm9sbFRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpXG4gICAgICAgIEB1cGRhdGVUaW1lbGluZSgpICAgICAgICBcbiAgICAgICAgXG5cbiAgICBvbkRyYWc6IChlKSA9PlxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEBzY3JvbGwucG9zaXRpb24gPSBNYXRoLmFicyBAc2Nyb2xsLnkgLyAgQGdldFNjcm9sbGFibGVBcmVhKClcbiAgICAgICAgQHNjcm9sbC5zY3JvbGxUb3AgPSAtQHNjcm9sbC55XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVUaW1lbGluZSgpXG5cblxuICAgIG9uUmVzaXplOiA9PlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIGlmICFAaXNUYWJsZXRcbiAgICAgICAgICAgIEByZXNldFRpbWVsaW5lKClcbiAgICAgICAgICAgIFxuICAgICAgICBAY2VudGVyT2Zmc2V0ID0gKEBzdGFnZUhlaWdodCAqIC42NjY3KVxuICAgICAgICBpZiBAc2Nyb2xsP1xuICAgICAgICAgICAgcG9zID0gQHNjcm9sbC5wb3NpdGlvbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHRvZ2dsZVRvdWNoTW92ZSgpXG4gICAgICAgICAgICBpZiAhQGlzVGFibGV0XG4gICAgICAgICAgICAgICAgQHNldFNjcm9sbFRvcChwb3MpXG4gICAgICAgICAgICBcblxuICAgIHJlc2V0VGltZWxpbmU6ID0+XG4gICAgICAgIEB0aW1lbGluZSA9IG5ldyBUaW1lbGluZU1heFxuICAgICAgICBAdHJpZ2dlcnMgPSBbXVxuICAgICAgICBAcGFyYWxsYXggPSBbXVxuXG4gICAgICAgICQoJ1tkYXRhLWNsb3VkXScpLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgICRlbCA9ICQodClcbiAgICAgICAgICAgICRjbG9zZXN0Q29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJ1tkYXRhLWNsb3VkLWNvbnRhaW5lcl0nKVxuICAgICAgICAgICAgaW5pdFBvcyA9ICRjbG9zZXN0Q29udGFpbmVyLmRhdGEoKS5jbG91ZENvbnRhaW5lci5pbml0UG9zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2xvdWRGdW5jdGlvbiA9IGNsb3Vkc1xuICAgICAgICAgICAgICAgICRlbDokZWxcblxuICAgICAgICAgICAgaWYgaW5pdFBvcyBcbiAgICAgICAgICAgICAgICBjbG91ZEZ1bmN0aW9uKGluaXRQb3MpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAcGFyYWxsYXgucHVzaCBjbG91ZEZ1bmN0aW9uXG5cbiAgICB1cGRhdGVUaW1lbGluZTogPT5cbiAgICAgICAgXG4gICAgICAgIEBoZWFkZXIuYW5pbWF0ZUhlYWRlcihAc2Nyb2xsLnNjcm9sbFRvcClcblxuICAgICAgICBmb3IgdCBpbiBAdHJpZ2dlcnNcbiAgICAgICAgICAgIGlmIEBzY3JvbGwuc2Nyb2xsVG9wID4gdC5vZmZzZXQgLSBAY2VudGVyT2Zmc2V0XG4gICAgICAgICAgICAgICAgdC5hLnBsYXkoKVxuICAgICAgICAgICAgZWxzZSBpZiBAc2Nyb2xsLnNjcm9sbFRvcCArIEBzdGFnZUhlaWdodCA8IHQub2Zmc2V0XG4gICAgICAgICAgICAgICAgdC5hLnBhdXNlZCh0cnVlKVxuICAgICAgICAgICAgICAgIHQuYS5zZWVrKDApXG5cblxuICAgICAgICBmb3IgcCBpbiBAcGFyYWxsYXhcbiAgICAgICAgICAgIHAoQHNjcm9sbC5wb3NpdGlvbilcblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25CYXNlXG4iLCJjbGFzcyBQbHVnaW5CYXNlIGV4dGVuZHMgRXZlbnRFbWl0dGVyXG5cblxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIEAkZWwgPSBpZiBvcHRzLmVsPyB0aGVuICQgb3B0cy5lbFxuXG4gICAgICAgIEBpbml0aWFsaXplKG9wdHMpXG5cblxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cbiAgICAgICAgQGFkZEV2ZW50cygpXG5cbiAgICBhZGRFdmVudHM6IC0+XG5cblxuXG4gICAgcmVtb3ZlRXZlbnRzOiAtPlxuXG5cbiAgICBkZXN0cm95OiAtPlxuICAgICAgICBAcmVtb3ZlRXZlbnRzKClcblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsdWdpbkJhc2VcblxuIiwiXG5TaGFyZXIgPSByZXF1aXJlIFwiLi4vdXRpbC9TaGFyZXIuY29mZmVlXCIgXG5cblxuY2xhc3MgVmlld0Jhc2UgZXh0ZW5kcyBFdmVudEVtaXR0ZXJcblxuXG5cblxuXG4gICAgY29uc3RydWN0b3I6IChlbCkgLT5cblxuICAgICAgICBAJGVsID0gJChlbClcbiAgICAgICAgQGlzVGFibGV0ID0gJChcImh0bWxcIikuaGFzQ2xhc3MoXCJ0YWJsZXRcIilcbiAgICAgICAgQGlzUGhvbmUgPSAkKFwiaHRtbFwiKS5oYXNDbGFzcyhcInBob25lXCIpXG4gICAgICAgIEBjZG5Sb290ID0gJCgnYm9keScpLmRhdGEoJ2NkbicpIG9yIFwiL1wiXG4gICAgICAgICQod2luZG93KS5vbiBcInJlc2l6ZS5hcHBcIiAsIEBvblJlc2l6ZVxuXG4gICAgICAgIEBzdGFnZUhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICBAc3RhZ2VXaWR0aCA9ICQod2luZG93KS53aWR0aCgpXG4gICAgICAgIEBtb3VzZVggPSAwXG4gICAgICAgIEBtb3VzZVkgPSAwXG5cbiAgICAgICAgI0BkZWxlZ2F0ZUV2ZW50cyhAZ2VuZXJhdGVFdmVudHMoKSlcbiAgICAgICAgQGluaXRpYWxpemUoKVxuXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBAaW5pdENvbXBvbmVudHMoKVxuXG4gICAgaW5pdENvbXBvbmVudHM6IC0+XG5cbiAgICBvblJlc2l6ZTogPT5cbiAgICAgICAgQHN0YWdlSGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXG4gICAgICAgIEBzdGFnZVdpZHRoID0gJCh3aW5kb3cpLndpZHRoKClcblxuXG4gICAgZ2VuZXJhdGVFdmVudHM6IC0+XG4gICAgICAgIHJldHVybiB7fVxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld0Jhc2VcbiIsIkJhc2ljT3ZlcmxheSA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvQmFzaWNPdmVybGF5LmNvZmZlZSdcblN2Z0luamVjdCA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvU3ZnSW5qZWN0LmNvZmZlZSdcblxuXG5cbmlmIHdpbmRvdy5jb25zb2xlIGlzIHVuZGVmaW5lZCBvciB3aW5kb3cuY29uc29sZSBpcyBudWxsXG4gIHdpbmRvdy5jb25zb2xlID1cbiAgICBsb2c6IC0+XG4gICAgd2FybjogLT5cbiAgICBmYXRhbDogLT5cblxuXG5cbiQoZG9jdW1lbnQpLnJlYWR5IC0+XG4gICAgIyQoJy5zdmctaW5qZWN0Jykuc3ZnSW5qZWN0KClcbiAgICAjbmV3IFN2Z0luamVjdCBcIi5zdmctaW5qZWN0XCJcbiAgICBcbiAgICBiYXNpY092ZXJsYXlzID0gbmV3IEJhc2ljT3ZlcmxheVxuICAgICAgICBlbDogJCgnI2NvbnRlbnQnKVxuXG5cbiAgICAkKCcuc2Nyb2xsdG8nKS5jbGljayAtPlxuICAgICAgIHQgPSAkKHRoaXMpLmRhdGEoJ3RhcmdldCcpXG4gICAgICAgJCgnYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiAkKCcjJyt0KS5vZmZzZXQoKS50b3AgLSA3MCAjIDcwIGZvciB0aGUgY29sbGFwc2VkIGhlYWRlclxuICAgICAgICB9KTtcblxuICAgICNpZiB3aW5kb3cuZGRscz9cbiAgICAjIGNvbnNvbGUubG9nICdjbGlja3knXG4gICAgJCh3aW5kb3cpLmNsaWNrIC0+XG4gICAgICAgIGlmIHdpbmRvdy5kZGxzP1xuICAgICAgICAgICAgJC5lYWNoIHdpbmRvdy5kZGxzLCAoaSwgdCkgLT5cbiAgICAgICAgICAgICAgICBpZiB0LmlzT3BlbiBhbmQgbm90IHQuaXNIb3ZlcmVkXG4gICAgICAgICAgICAgICAgICAgIHQuY2xvc2VNZW51KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAkKCdbZGF0YS1kZXB0aF0nKS5lYWNoIC0+XG4gICAgICAgICRlbCA9ICQoQClcbiAgICAgICAgZGVwdGggPSAkZWwuZGF0YSgpLmRlcHRoXG4gICAgICAgIFxuICAgICAgICAkZWwuY3NzKCd6LWluZGV4JywgZGVwdGgpXG4gICAgICAgIFR3ZWVuTWF4LnNldCAkZWwgLCBcbiAgICAgICAgICAgIHo6IGRlcHRoICogMTBcblxuXG5cbiAgICAkKCdib2R5Jykub24gJ0RPTU5vZGVJbnNlcnRlZCcsICAtPlxuICAgICAgICAkKCdhJykuZWFjaCAtPiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGhyZWYgPSAkKEApLmF0dHIoJ2hyZWYnKVxuICAgICAgICAgICAgaWYgaHJlZj9cbiAgICAgICAgICAgICAgICBocmVmID0gaHJlZi50cmltKClcbiAgICAgICAgICAgICAgICBpZiBocmVmLmluZGV4T2YoJ2h0dHA6Ly8nKSBpcyAwIG9yIGhyZWYuaW5kZXhPZignaHR0cHM6Ly8nKSBpcyAwIG9yIGhyZWYuaW5kZXhPZignLnBkZicpIGlzIChocmVmLmxlbmd0aCAtIDQpXG4gICAgICAgICAgICAgICAgICAgICQoQCkuYXR0cigndGFyZ2V0JywgJ19ibGFuaycpXG5cblxuICAgICQoJy5jaXJjbGUsIC5jaXJjbGUtb3V0ZXInKS5vbignbW91c2VlbnRlcicsIC0+XG4gICAgICAgIFR3ZWVuTWF4LnRvKCQodGhpcyksIC4zNSxcbiAgICAgICAgICAgIHNjYWxlOiAxLjA1LFxuICAgICAgICAgICAgZWFzZTogUG93ZXIyLmVhc2VPdXRcbiAgICAgICAgKVxuICAgIClcblxuICAgICQoJy5jaXJjbGUsIC5jaXJjbGUtb3V0ZXInKS5vbignbW91c2VsZWF2ZScsIC0+XG4gICAgICAgIFR3ZWVuTWF4LnRvKCQodGhpcyksIC4zNSxcbiAgICAgICAgICAgIHNjYWxlOiAxLFxuICAgICAgICAgICAgZWFzZTogUG93ZXIyLmVhc2VPdXRcbiAgICAgICAgKVxuICAgIClcblxuICAgICQoJyNqb2JzLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXIgbGknKS5vbignbW91c2VlbmV0ZXInLCAtPlxuICAgICAgICBjb25zb2xlLmxvZyAnaGVsbG8nXG4gICAgKVxuXG5cbiMgdGhpcyBpcyBzaGl0dHksIGJ1dCBpdCdzIG15IG9ubHkgd29ya2Fyb3VuZCBmb3IgdGhlIGNsaXBwaW5nIGlzc3VlIChDRi0xNzEpXG5kb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSAtPlxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlIGlzICdjb21wbGV0ZScpXG4gICAgICAgIHNldFRpbWVvdXQoLT5cbiAgICAgICAgICAgICQoJy5xdW90ZScpLmFkZENsYXNzKCdrZWVwaXRhaHVuZHJlZCcpXG4gICAgICAgICwgMjAwKVxuIiwiQW5pbWF0aW9uQmFzZSA9IHJlcXVpcmUgXCIuLi9hYnN0cmFjdC9BbmltYXRpb25CYXNlLmNvZmZlZVwiXG5QYXJrc0xpc3QgPSByZXF1aXJlICcuLi9wbHVnaW5zL1BhcmtzTGlzdC5jb2ZmZWUnXG5EcmFnZ2FibGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9EcmFnZ2FibGVHYWxsZXJ5LmNvZmZlZSdcbkZhZGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9GYWRlR2FsbGVyeS5jb2ZmZWUnXG5IZWFkZXJBbmltYXRpb24gPSByZXF1aXJlICcuLi9wbHVnaW5zL0hlYWRlckFuaW1hdGlvbi5jb2ZmZWUnXG5GcmFtZUFuaW1hdGlvbiA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvY29hc3RlcnMvRnJhbWVBbmltYXRpb24uY29mZmVlJ1xuUmVzaXplQnV0dG9ucyA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvUmVzaXplQnV0dG9ucy5jb2ZmZWUnXG5Gb3JtSGFuZGxlciA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvRm9ybUhhbmRsZXIuY29mZmVlJ1xuXG5hbmltYXRpb25zID0gcmVxdWlyZSAnLi9hbmltYXRpb25zL2dyb3Vwc2FsZXMuY29mZmVlJ1xuZ2xvYmFsQW5pbWF0aW9ucyA9IHJlcXVpcmUgJy4vYW5pbWF0aW9ucy9nbG9iYWwuY29mZmVlJ1xuICAgICAgICBcblxuY2xhc3MgR3JvdXBTYWxlc1BhZ2UgZXh0ZW5kcyBBbmltYXRpb25CYXNlXG5cblxuICAgIGNvbnN0cnVjdG9yOiAoZWwpIC0+XG4gICAgICAgIEB0b3RhbEFuaW1hdGlvblRpbWUgPSAyNVxuICAgICAgICBzdXBlcihlbClcblxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgIHN1cGVyKClcblxuICAgIGluaXRDb21wb25lbnRzOiAtPlxuICAgICAgICBzdXBlcigpXG5cbiAgICAgICAgZ3JvdXBUeXBlcyA9IG5ldyBGYWRlR2FsbGVyeVxuICAgICAgICAgICAgZWw6XCIuc2VsZWN0LWdhbGxlcnlcIlxuXG4gICAgICAgIHdpbmRvdy5kZGxzID0gW11cblxuICAgICAgICBAZ3JvdXB0eXBlcyA9ICQoJyNncm91cHR5cGVzLXNlbGVjdCcpLmNmRHJvcGRvd25cbiAgICAgICAgICAgIG9uU2VsZWN0OiAodCkgLT5cbiAgICAgICAgICAgICAgICBpZCA9ICQodCkuZGF0YSgnaWQnKVxuICAgICAgICAgICAgICAgIGdyb3VwVHlwZXMuZ290byBpZFxuXG4gICAgICAgIEBmb3JtdHlwZXMgPSAkKCcjcHJvZ3JhbXMtc2VsZWN0JykuY2ZEcm9wZG93blxuICAgICAgICAgICAgb25TZWxlY3Q6ICh0KSAtPlxuICAgICAgICAgICAgICAgIGlkID0gJCh0KS5kYXRhKCdpZCcpXG5cbiAgICAgICAgd2luZG93LmRkbHMucHVzaCBAZ3JvdXB0eXBlc1xuICAgICAgICB3aW5kb3cuZGRscy5wdXNoIEBmb3JtdHlwZXNcblxuICAgICAgICB3aW5kb3cuZGRscy5wdXNoICQoJyNwYXJrcy1zZWxlY3QnKS5jZkRyb3Bkb3duXG4gICAgICAgICAgICBvblNlbGVjdDogKHQpIC0+XG4gICAgICAgICAgICAgICAgaWQgPSAkKHQpLmRhdGEoJ2lkJylcblxuXG4gICAgICAgIGdyb3VwRm9ybSA9IG5ldyBGb3JtSGFuZGxlclxuICAgICAgICAgICAgZWw6ICcjZ3JvdXAtc2FsZXMtZm9ybSdcbiAgICAgICAgICAgIFxuICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICQoJyNmb3JtLW9wZW5lcicpLm9uICdjbGljaycsID0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBAZm9ybXR5cGVzLnZhbHVlXG4gICAgICAgICAgICBjb25zb2xlLmxvZyBAZ3JvdXB0eXBlcy52YWx1ZVxuICAgICAgICAgICAgQGZvcm10eXBlcy5zZXRUb1ZhbHVlKEBncm91cHR5cGVzLnZhbHVlKTtcbiAgICAgICAgICAgIFxuICAgICAgICBpZiAhQGlzUGhvbmVcbiAgICAgICAgICAgXG4gICAgICAgICAgICBjb2FzdGVyID0gbmV3IEZyYW1lQW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgaWQ6XCJncm91cHMtY29hc3Rlci0xLWFcIlxuICAgICAgICAgICAgICAgIGVsOlwiI2dyb3VwLXNhbGVzLXNlY3Rpb24xXCJcbiAgICAgICAgICAgICAgICBiYXNlVXJsOiBcIiN7QGNkblJvb3R9Y29hc3RlcnMvXCJcbiAgICAgICAgICAgICAgICB1cmw6IFwic2hvdC02L2RhdGEuanNvblwiXG4gICAgICAgICAgICAgICAgZGVwdGg6OFxuICAgICAgICAgICAgY29hc3Rlci5sb2FkRnJhbWVzKClcblxuICAgICAgICAgICAgZ3JvdXBzID0gbmV3IERyYWdnYWJsZUdhbGxlcnlcbiAgICAgICAgICAgICAgICBlbDpcIiNncm91cC1zYWxlcy1zZWN0aW9uMiAgI3NlbGVjdC10ZXN0aW1vbnlcIlxuICAgICAgICAgICAgICAgIGFjcm9zczogMVxuXG4gICAgICAgICAgICByZXNpemVidXR0b25zID0gbmV3IFJlc2l6ZUJ1dHRvbnNcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBncm91cHMgPSBuZXcgRHJhZ2dhYmxlR2FsbGVyeVxuICAgICAgICAgICAgICAgIGVsOlwiI2dyb3VwLXNhbGVzLXNlY3Rpb24yICN0ZXN0aW1vbmlhbHNcIlxuICAgICAgICAgICAgICAgIGFjcm9zczogMVxuXG4gICAgXG4gICAgcmVzZXRUaW1lbGluZTogPT5cbiAgICAgICAgc3VwZXIoKSAgICAgICBcblxuICAgICAgICBAcGFyYWxsYXgucHVzaCBnbG9iYWxBbmltYXRpb25zLmNsb3VkcyhcIiNzZWN0aW9uMVwiLCAwICwgMSwgaWYgQGlzVGFibGV0IHRoZW4gMSBlbHNlIDUpXG5cblxuXG4gICAgICAgIGlmICFAaXNQaG9uZVxuICAgICAgICAgICAgQHRyaWdnZXJzLnB1c2ggYW5pbWF0aW9ucy50b3BIZWFkbGluZSgpXG4gICAgICAgICAgICBAdHJpZ2dlcnMucHVzaCBhbmltYXRpb25zLnNjcm9sbENpcmNsZSgpXG4gICAgICAgICAgICBAdHJpZ2dlcnMucHVzaCBhbmltYXRpb25zLnNlbGVjdEJveCgpXG4gICAgICAgICAgICBAdHJpZ2dlcnMucHVzaCBhbmltYXRpb25zLnMyVG9wSGVhZGxpbmUoKVxuICAgICAgICAgICAgQHRyaWdnZXJzLnB1c2ggYW5pbWF0aW9ucy5vZmZlcmluZ3NUZXN0aW1vbmlhbHMoKVxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBHcm91cFNhbGVzUGFnZVxuXG5cbiIsIlxuY2xvdWRzT25VcGRhdGUgPSAoZWwsIGR1cmF0aW9uKSAtPlxuICAgIHdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICBcbiAgICBUd2Vlbk1heC5zZXQgZWwsXG4gICAgICAgIHg6IC0yMDUwXG4gICAgICAgIFxuICAgIFR3ZWVuTWF4LnRvIGVsLCBkdXJhdGlvbiAsIFxuICAgICAgICB4OiB3aW5kb3dXaWR0aFxuICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgY2xvdWRzT25VcGRhdGUgZWwgLCBkdXJhdGlvblxuICAgICAgICBcblxuXG5zZXRCb2JpbmcgPSAoJGVsICwgZHVyLGRlbGF5KSAtPlxuICAgIFxuICAgIEBpc1RhYmxldCA9ICQoJ2h0bWwnKS5oYXNDbGFzcyAndGFibGV0J1xuICAgIHdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgXG4gICAgaWYgd2luZG93LmlubmVyV2lkdGggPiA3NjcgJiYgIUBpc1RhYmxldFxuXG4jICAgICAgICBkID0gKCh3aW5kb3cuaW5uZXJXaWR0aCArIDE1NTApIC8gd2luZG93LmlubmVyV2lkdGgpICogMTgwXG4gICAgICAgIGQgPSAzMDAgLSAoJGVsLmRhdGEoJ2Nsb3VkJykuc3BlZWQgKiAyNTApXG4gICAgICAgIFxuICAgICAgICBUd2Vlbk1heC50byAkZWwgLCBkdXIgLCBcbiAgICAgICAgICAgIHg6IHdpZHRoXG4gICAgICAgICAgICBkZWxheTpkZWxheVxuICAgICAgICAgICAgZWFzZTpMaW5lYXIuZWFzZU5vbmVcbiAgICAgICAgICAgIG9uVXBkYXRlUGFyYW1zOiBbXCJ7c2VsZn1cIl1cbiAgICAgICAgICAgIG9uQ29tcGxldGU6ICh0d2VlbikgPT5cbiAgICAgICAgICAgICAgICBjbG91ZHNPblVwZGF0ZSAkZWwgLCBkXG5cblxuXG5zZXRSZWdpc3RyYXRpb24gPSAoJGVsLCByZWdpc3RyYXRpb24pIC0+XG4gICAgXG4gICAgdmFsdWVzID0gcmVnaXN0cmF0aW9uLnNwbGl0KFwifFwiKVxuICAgIFxuICAgIHZpZXdwb3J0V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIHNldHRpbmdzID0ge31cbiAgICBcbiAgICBhbGlnbiA9IHZhbHVlc1swXVxuICAgIG9mZnNldCA9IHBhcnNlSW50KHZhbHVlc1sxXSkgb3IgMFxuXG4gICAgc3dpdGNoIGFsaWduXG4gICAgICAgIHdoZW4gJ2xlZnQnXG4gICAgICAgICAgICBzZXR0aW5ncy54ID0gMCArIG9mZnNldFxuICAgICAgICB3aGVuICdyaWdodCdcbiAgICAgICAgICAgIHNldHRpbmdzLnggPSB2aWV3cG9ydFdpZHRoICsgb2Zmc2V0ICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgd2hlbiAnY2VudGVyJ1xuICAgICAgICAgICAgc2V0dGluZ3MueCA9ICh2aWV3cG9ydFdpZHRoKi41IC0gJGVsLndpZHRoKCkqLjUpICsgb2Zmc2V0ICAgIFxuICAgIFxuICAgIFR3ZWVuTWF4LnNldCAkZWwgLCBzZXR0aW5nc1xuICAgIFxuICAgIFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSAob3B0aW9ucykgLT5cbiAgICBcbiAgICAkZWwgPSBvcHRpb25zLiRlbFxuICAgICRjb250YWluZXIgPSAkZWwuY2xvc2VzdCgnW2RhdGEtY2xvdWQtY29udGFpbmVyXScpICAgIFxuICAgIGNvbnRhaW5lclRvcFBhZGRpbmcgPSBwYXJzZUludCgkY29udGFpbmVyLmNzcygncGFkZGluZy10b3AnKSlcbiAgICBcbiAgICBcbiAgICB0cnkgICAgICAgIFxuICAgICAgICBjbG91ZERhdGEgPSAkZWwuZGF0YSgpLmNsb3VkXG4gICAgICAgXG4gICAgY2F0Y2ggZVxuICAgICAgICBjb25zb2xlLmVycm9yIFwiQ2xvdWQgRGF0YSBQYXJzZSBFcnJvcjogSW52YWxpZCBKU09OXCIgICAgICAgIFxuICAgICAgICBcbiAgICBjbG91ZERlcHRoID0gJGVsLmRhdGEoJ2RlcHRoJylcbiAgICBjbG91ZFNwZWVkID0gY2xvdWREYXRhLnNwZWVkIG9yIDFcbiAgICBjbG91ZE9mZnNldE1pbiA9IHBhcnNlSW50KGNsb3VkRGF0YS5vZmZzZXRNaW4pIG9yIDBcbiAgICBjbG91ZFJldmVyc2UgPSBjbG91ZERhdGEucmV2ZXJzZSBvciBmYWxzZVxuICAgIGNsb3VkUmVnaXN0cmF0aW9uID0gY2xvdWREYXRhLnJlZ2lzdGVyIG9yIFwiY2VudGVyXCJcblxuXG4gICAgXG4gICAgc2V0UmVnaXN0cmF0aW9uICRlbCAsIGNsb3VkUmVnaXN0cmF0aW9uXG4gICAgaWYgISgkY29udGFpbmVyLmhhc0NsYXNzKCdzcGxhc2gtY29udGFpbmVyJykpXG4gICAgICAgIG9mZkxlZnQgPSAkZWwub2Zmc2V0KCkubGVmdFxuICAgICAgICBkaXN0YW5jZSA9ICh3aW5kb3cuaW5uZXJXaWR0aCAtIG9mZkxlZnQpIC8gd2luZG93LmlubmVyV2lkdGhcbiMgICAgICAgIHBlcmNlbnRhZ2UgPSBkaXN0YW5jZSAqIDE4MCBcbiAgICAgICAgcGVyY2VudGFnZSA9IDI1MCAtIChjbG91ZFNwZWVkICogMjAwKVxuICAgICAgICBcbiAgICAgICAgc2V0Qm9iaW5nICRlbCwgcGVyY2VudGFnZSwgY2xvdWRTcGVlZC81XG4gXG4gICAgbWluWSA9ICRjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgbWF4WSA9ICQoZG9jdW1lbnQpLm91dGVySGVpZ2h0KClcbiAgICB0b3RhbFJhbmdlPSAkY29udGFpbmVyLm91dGVySGVpZ2h0KClcbiAgICBcbiAgICBcbiAgICBcbiAgICBwZXJjZW50YWdlUmFuZ2UgPSB0b3RhbFJhbmdlL21heFlcbiAgICBtaW5SYW5nZVBlcmNlbnRhZ2UgPSBtaW5ZL21heFkgICAgXG4gICAgbWF4UmFuZ2VQZXJjZW50YWdlID0gbWluUmFuZ2VQZXJjZW50YWdlICsgcGVyY2VudGFnZVJhbmdlXG5cbiMgICAgY29uc29sZS5sb2cgbWluUmFuZ2VQZXJjZW50YWdlICwgbWF4UmFuZ2VQZXJjZW50YWdlXG5cblxuICAgIGxhc3RTY3JvbGxQZXJjZW50YWdlID0gcHJlc2VudFNjcm9sbFBlcmNlbnRhZ2UgPSBzY3JvbGxEZWx0YSA9IDBcblxuICAgIGlmICgkY29udGFpbmVyLmhhc0NsYXNzKCdzcGxhc2gtY29udGFpbmVyJykgJiYgJCgnaHRtbCcpLmhhc0NsYXNzKCd0YWJsZXQnKSlcbiAgICAgICAgJGNvbnRhaW5lci5oaWRlKClcbiAgICAgICAgXG4gICAgXG4gICAgcmV0dXJuIChwb3MpIC0+XG4gICAgICAgIGlmICgoJGNvbnRhaW5lci5oYXNDbGFzcygnc3BsYXNoLWNvbnRhaW5lcicpKSAmJiAoJCgnaHRtbCcpLmhhc0NsYXNzKCd0YWJsZXQnKSkpXG4gICAgICAgICAgICBUd2Vlbk1heC50byAkZWwgLCAwLjI1ICxcbiAgICAgICAgICAgICAgICBlYXNlOlNpbmUuZWFzZU91dFxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNsb3VkUG9zaXRpb25QZXJjZW50YWdlID0gKHBvcyAtIG1pblJhbmdlUGVyY2VudGFnZSkgLyAobWF4UmFuZ2VQZXJjZW50YWdlIC0gbWluUmFuZ2VQZXJjZW50YWdlKVxuICAgICAgICAgICAgaWYgMCA8PSBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZSA8PSAxXG4gICAgICAgICAgICAgICAgcHJlc2VudFNjcm9sbFBlcmNlbnRhZ2UgPSBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZVxuICAgICAgICAgICAgICAgIGlmIGNsb3VkUmV2ZXJzZSAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZSA9IDEgLSBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNsb3VkWSA9ICh0b3RhbFJhbmdlICogY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2UpICogY2xvdWRTcGVlZFxuICAgICAgICAgICAgICAgIGNsb3VkWSA9IGNsb3VkWSAtIGNvbnRhaW5lclRvcFBhZGRpbmdcbiAgICAgICAgICAgICAgICBjbG91ZFkgPSBjbG91ZFkgKyBjbG91ZE9mZnNldE1pblxuICAgIFxuICAgICAgICAgICAgICAgICNNYXliZSB1c2UgdGhpcz9cbiAgICAgICAgICAgICAgICBzY3JvbGxEZWx0YSA9IE1hdGguYWJzKGxhc3RTY3JvbGxQZXJjZW50YWdlIC0gcHJlc2VudFNjcm9sbFBlcmNlbnRhZ2UpICogM1xuICAgIFxuICAgICAgICAgICAgICAgIGxhc3RTY3JvbGxQZXJjZW50YWdlID0gcHJlc2VudFNjcm9sbFBlcmNlbnRhZ2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgVHdlZW5NYXgudG8gJGVsICwgMC4yNSAsIFxuICAgICAgICAgICAgICAgICAgICB5OmNsb3VkWVxuICAgICAgICAgICAgICAgICAgICBlYXNlOlNpbmUuZWFzZU91dFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgIFxuIiwiXG5cbiNDb3VudFxuY29tbWFzID0gKHgpIC0+XG4gIHgudG9TdHJpbmcoKS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCBcIixcIilcblxuXG5tb2R1bGUuZXhwb3J0cy5jb3VudCA9IChlbCkgLT5cbiAgICBcbiAgICBcbiAgICAkZWwgPSAkKGVsKVxuICAgIHRhcmdldFZhbCA9ICQoZWwpLmh0bWwoKVxuICAgIG51bSA9ICQoZWwpLnRleHQoKS5zcGxpdCgnLCcpLmpvaW4oJycpXG5cbiAgICBzdGFydCA9IG51bSAqIC45OTk1XG4gICAgY2hhbmdlID0gbnVtICogLjAwMDVcbiAgICBcbiAgICB0bCA9IG5ldyBUaW1lbGluZU1heFxuICAgICAgICBvblN0YXJ0OiAtPlxuICAgICAgICAgICAgJGVsLmh0bWwoXCI0MlwiKVxuICAgICAgICBvbkNvbXBsZXRlOiAtPlxuICAgICAgICAgICAgJGVsLmh0bWwodGFyZ2V0VmFsKVxuICAgICAgICAgICAgXG4gICAgdHdlZW5zID0gW11cblxuICAgICAgICBcblxuICAgIHR3ZWVucy5wdXNoIFR3ZWVuTWF4LmZyb21UbyAkZWwgLCAwLjI1LCAgICAgICAgXG4gICAgICAgIGF1dG9BbHBoYTowXG4gICAgICAgIGltbWVkaWF0ZVJlbmRlcjp0cnVlXG4gICAgICAgIGVhc2U6UXVpbnQuZWFzZU91dFxuICAgICxcbiAgICAgICAgYXV0b0FscGhhOjFcblxuICAgIHR3ZWVucy5wdXNoIFR3ZWVuTWF4LnRvICRlbCAsIDEuNSwgXG4gICAgICAgIGVhc2U6UXVpbnQuZWFzZU91dFxuICAgICAgICBcbiAgICAgICAgb25VcGRhdGU6IC0+XG4gICAgICAgICAgICB2YWx1ZSA9IHBhcnNlSW50KHN0YXJ0ICsgcGFyc2VJbnQoY2hhbmdlICogQHByb2dyZXNzKCkpKVxuICAgICAgICAgICAgdmFsdWUgPSBjb21tYXModmFsdWUpXG4gICAgICAgICAgICBlbHMgPSB2YWx1ZS5zcGxpdCgnJylcbiAgICAgICAgICAgIGh0bWwgPSAnJ1xuICAgICAgICAgICAgJC5lYWNoIGVscywgKG5hbWUsIHZhbHVlKSAtPlxuICAgICAgICAgICAgICAgIGh0bWwgKz0gaWYgKHZhbHVlIGlzICcsJykgdGhlbiAnLCcgZWxzZSAnPHNwYW4+JyArIHZhbHVlICsgJzwvc3Bhbj4nXG4gICAgICAgICAgICAkZWwuaHRtbChodG1sKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICB0bC5hZGQgdHdlZW5zXG4gICAgXG4gICAgdGxcblxuI1Njcm9sbGluZ1xuXG5cblxudHdlZW5QYXJhbGxheCA9IChwb3MsdHdlZW4sbWluLG1heCxkdXIpIC0+XG5cblxuXG4gICAgcGVyY2VudCA9ICgocG9zLW1pbikgLyAobWF4LW1pbikpICogMVxuICAgIGFtb3VudCA9IHBlcmNlbnQgKiBkdXJcblxuXG5cbiAgICBpZiBwb3MgPD0gbWF4IGFuZCBwb3MgPj0gbWluXG4gICAgICAgICNjb25zb2xlLmxvZyBwZXJjZW50ICwgdHdlZW4ubnMubmFtZSAsIHBvc1xuICAgICAgICBpZiBNYXRoLmFicyhhbW91bnQgLSB0d2Vlbi50aW1lKCkpID49IC4wMDFcbiAgICAgICAgICAgIHR3ZWVuLnR3ZWVuVG8gIGFtb3VudCAsXG4gICAgICAgICAgICAgICAgb3ZlcndyaXRlOlwicHJlZXhpc3RpbmdcIixcbiAgICAgICAgICAgICAgICBlYXNlOlF1YWQuZWFzZU91dFxuXG5cbm1vZHVsZS5leHBvcnRzLmNsb3VkcyA9IChzZXRJZCwgbWluLCBtYXgsIGR1cikgLT5cblxuICAgIG1pblBvcyA9IG1pblxuICAgIG1heFBvcyA9IG1heFxuICAgIGR1cmF0aW9uID0gZHVyXG5cbiAgICAkZWwgPSAkKFwiLmNsb3VkcyN7c2V0SWR9XCIpXG4gICAgY2xvdWRzID0gJGVsLmZpbmQoXCIuY2xvdWRcIilcblxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgdHdlZW4ubnMgPSB7fVxuICAgIHR3ZWVuLm5zLm5hbWUgPSBzZXRJZFxuXG4gICAgdHdlZW5zID0gW11cbiAgICBmb3IgY2xvdWQsaSBpbiBjbG91ZHNcbiAgICAgICAgb2Zmc2V0ID0gXCIrPSN7MjUwKihpKzEpfVwiXG5cblxuICAgICAgICB0d2VlbnMucHVzaCBUd2Vlbk1heC50byBjbG91ZCAsIGR1cmF0aW9uICxcbiAgICAgICAgICAgIHk6b2Zmc2V0XG5cblxuXG4gICAgdHdlZW4uYWRkIHR3ZWVuc1xuXG5cblxuICAgIHR3ZWVuLnBhdXNlZCh0cnVlKVxuICAgIHJldHVybiAocG9zKSAtPlxuICAgICAgICB0d2VlblBhcmFsbGF4IHBvcyAsIHR3ZWVuICwgbWluUG9zLCBtYXhQb3MsIGR1cmF0aW9uXG5cbm1vZHVsZS5leHBvcnRzLnNjcm9sbCA9IChtaW5Qb3MsIG1heFBvcywgZHVyYXRpb24sIGVsZW0pIC0+XG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuICAgIHR3ZWVuLm5zID0ge31cbiAgICB0d2Vlbi5ucy5uYW1lID0gXCIuc2Nyb2xsdG9cIlxuICAgIFxuICAgIHR3ZWVucyA9IFtdXG4gICAgdHdlZW5zLnB1c2ggVHdlZW5NYXgudG8gZWxlbSAsIGR1cmF0aW9uICwgb3BhY2l0eTowXG4gICAgXG4gICAgdHdlZW4uYWRkIHR3ZWVuc1xuICAgIFxuICAgIHR3ZWVuLnBhdXNlZCh0cnVlKVxuICAgIHJldHVybiAocG9zKSAtPlxuICAgICAgICB0d2VlblBhcmFsbGF4IHBvcyAsIHR3ZWVuICwgbWluUG9zLCBtYXhQb3MsIGR1cmF0aW9uXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMuYXJtcyA9IChtaW4sIG1heCwgZHVyKSAtPlxuXG4gICAgbWluUG9zID0gbWluXG4gICAgbWF4UG9zID0gbWF4XG4gICAgZHVyYXRpb24gPSBkdXJcblxuICAgIGFybSA9ICQoXCIuYXJtc1wiKVxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcbiAgICB0d2Vlbi5ucyA9IHt9XG4gICAgdHdlZW4ubnMubmFtZSA9IFwiLmFybXNcIlxuXG4gICAgdHdlZW5zID0gW11cbiAgICB0d2VlbnMucHVzaCBUd2Vlbk1heC50byBhcm0gLCBkdXJhdGlvbiAsIHRvcDowXG5cblxuXG4gICAgdHdlZW4uYWRkIHR3ZWVuc1xuXG5cblxuICAgIHR3ZWVuLnBhdXNlZCh0cnVlKVxuICAgIHJldHVybiAocG9zKSAtPlxuICAgICAgICB0d2VlblBhcmFsbGF4IHBvcyAsIHR3ZWVuICwgbWluUG9zLCBtYXhQb3MsIGR1cmF0aW9uXG4iLCJnbG9iYWwgPSByZXF1aXJlICcuL2dsb2JhbC5jb2ZmZWUnXG5cbm1vZHVsZS5leHBvcnRzLnRvcEhlYWRsaW5lID0gKCkgLT5cblxuICAgICRlbCA9ICQoJyNncm91cC1zYWxlcycpXG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZCgnLnRvcC1oZWFkbGluZSAudGl0bGUtYnVja2V0IGgxJyksIC4zNSxcbiAgICAgICAgeTogLTEwXG4gICAgICAgICxhbHBoYTogMFxuICAgICxcbiAgICAgICAgeTogMFxuICAgICAgICAsYWxwaGE6IDFcbiAgICApLCAwLjVcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLmZpbmQoJy50b3AtaGVhZGxpbmUgLnRpdGxlLWJ1Y2tldCBoMicpLCAuMzUsXG4gICAgICAgIHk6IC0xMFxuICAgICAgICAsYWxwaGE6IDBcbiAgICAsXG4gICAgICAgIHk6IDBcbiAgICAgICAgLGFscGhhOiAxXG4gICAgKSwgXCItPS4zXCJcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLmZpbmQoJy50b3AtaGVhZGxpbmUgLnRpdGxlLWJ1Y2tldCBwJyksIC4zNSxcbiAgICAgICAgeTogLTEwXG4gICAgICAgICxhbHBoYTogMFxuICAgICxcbiAgICAgICAgeTogMFxuICAgICAgICAsYWxwaGE6IDFcbiAgICApLCBcIi09LjNcIlxuXG5cblxuICAgIGE6IHR3ZWVuXG4gICAgb2Zmc2V0OiRlbC5vZmZzZXQoKS50b3BcblxuXG5tb2R1bGUuZXhwb3J0cy5zY3JvbGxDaXJjbGUgPSAtPlxuICAgICRlbCA9ICQoXCIjZ3JvdXAtc2FsZXMgLmNpcmMtYnRuLXdyYXBwZXJcIilcblxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG5cbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbC5maW5kKFwicFwiKSAsIC4zICxcbiAgICAgICAgYXV0b0FscGhhOjBcbiAgICAsXG4gICAgICAgIGF1dG9BbHBoYToxXG4gICAgKVxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZChcImFcIikgLCAuNDUgLFxuICAgICAgICBzY2FsZTowXG4gICAgICAgIHJvdGF0aW9uOjE4MFxuICAgICAgICBpbW1lZGlhdGVSZW5kZXI6dHJ1ZVxuICAgICxcbiAgICAgICAgc2NhbGU6MVxuICAgICAgICByb3RhdGlvbjowXG4gICAgICAgIGVhc2U6QmFjay5lYXNlT3V0XG4gICAgKSAsIFwiLT0uMlwiXG5cbiAgICBhOiB0d2VlblxuICAgIG9mZnNldDokZWwub2Zmc2V0KCkudG9wXG5cblxubW9kdWxlLmV4cG9ydHMuc2VsZWN0Qm94ID0gKCkgLT5cbiAgICAkZWwgPSAkKCcjZ3JvdXAtc2FsZXMgI3NlbGVjdCcpXG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwsIC4zNSxcbiAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAsc2NhbGU6IC43NVxuICAgICxcbiAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAsc2NhbGU6IDFcbiAgICApLCAwLjI1XG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICBhOnR3ZWVuXG4gICAgb2Zmc2V0OiRlbC5vZmZzZXQoKS50b3BcbiAgICBcbiAgICBcblxubW9kdWxlLmV4cG9ydHMuczJUb3BIZWFkbGluZSA9ICgpIC0+XG4gICAgJGVsID0gJCgnI3Rlc3RpbW9uaWFscycpXG4gICAgXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcbiAgICBcbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbC5maW5kKCcudGl0bGUtYnVja2V0IGgxJyksIC4zNSxcbiAgICAgICAgeTogLTEwXG4gICAgICAgIGFscGhhOiAwXG4gICAgLFxuICAgICAgICB5OiAwXG4gICAgICAgIGFscGhhOiAxXG4gICAgKVxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZCgnLnRpdGxlLWJ1Y2tldCBoMicpLCAuMzUsXG4gICAgICAgIHk6IC0xMFxuICAgICAgICBhbHBoYTogMFxuICAgICxcbiAgICAgICAgeTogMFxuICAgICAgICBhbHBoYTogMVxuICAgICksIFwiLT0uM1wiXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICBhOnR3ZWVuXG4gICAgb2Zmc2V0OiRlbC5vZmZzZXQoKS50b3BcblxuXG5tb2R1bGUuZXhwb3J0cy5vZmZlcmluZ3NUZXN0aW1vbmlhbHMgPSAoKSAtPlxuICAgICRlbCA9ICQoJyN0ZXN0aW1vbmlhbHMnKVxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLmZpbmQoJy5zd2lwZXItY29udGFpbmVyJyksIC4zNSAsXG4gICAgICAgIGFscGhhOiAwXG4gICAgLFxuICAgICAgICBhbHBoYTogMVxuICAgICksIDAuNVxuXG4gICAgZm9yIGFycm93LGkgaW4gJGVsLmZpbmQoJy5nYWwtYXJyb3cnKVxuICAgICAgICBpZiBpJTIgPT0gMFxuICAgICAgICAgICAgZGlzdGFuY2UgPSAtMjBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGlzdGFuY2UgPSAyMFxuXG4gICAgICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJChhcnJvdyksIC4zNSAsXG4gICAgICAgICAgICB4OiBkaXN0YW5jZVxuICAgICAgICAgICAgLGFscGhhOiAwXG4gICAgICAgICxcbiAgICAgICAgICAgIHg6IDBcbiAgICAgICAgICAgICxhbHBoYTogMVxuICAgICAgICApLCAwXG5cblxuICAgIHR3ZWVuLnBhdXNlZCh0cnVlKVxuICAgIGE6dHdlZW5cbiAgICBvZmZzZXQ6JGVsLm9mZnNldCgpLnRvcFxuIiwiUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuXG5jbGFzcyBCYXNpY092ZXJsYXkgZXh0ZW5kcyBQbHVnaW5CYXNlXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgIyBAJGVsID0gJChlbClcbiAgICAgICAgQG92ZXJsYXlUcmlnZ2VycyA9ICQoJy5vdmVybGF5LXRyaWdnZXInKVxuICAgICAgICBAYWRkRXZlbnRzKClcblxuICAgICAgICBzdXBlcigpXG5cbiAgICBcbiAgICBhZGRFdmVudHM6IC0+XG5cbiAgICAgICAgJCgnI2Jhc2ljLW92ZXJsYXksICNvdmVybGF5LWJhc2ljLWlubmVyIC5vdmVybGF5LWNsb3NlJykuY2xpY2soQGNsb3NlT3ZlcmxheSk7XG4gICAgICAgIEBvdmVybGF5VHJpZ2dlcnMuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgJCh0KS5vbiAnY2xpY2snLCBAb3Blbk92ZXJsYXlcblxuICAgICAgICAjZ2xvYmFsIGJ1eSB0aWNrZXRzIGxpbmtzXG5cbiAgICAgICAgJCgnLm92ZXJsYXktY29udGVudCcpLm9uICdjbGljaycsICdsaScgLEBvcGVuTGlua1xuIyAgICAgICAgJCh3aW5kb3cpLm9uICdyZXNpemUnLCBAY2xvc2VPdmVybGF5XG4gICAgICAgIFxuICAgIG9wZW5MaW5rOiAoZSkgPT5cbiAgICAgICAgdGFyZ2V0ID0gJChlLnRhcmdldCkucGFyZW50cyAnLnBhcmsnXG4gICAgICAgIGlmIHRhcmdldC5kYXRhKCd0YXJnZXQnKVxuICAgICAgICAgICAgd2luZG93Lm9wZW4odGFyZ2V0LmRhdGEoJ3RhcmdldCcpKVxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgXG4gICAgY2xvc2VPdmVybGF5OiAoZSkgLT5cbiAgICAgICAgXG4gICAgICAgIGlmICEgKChlLnR5cGUgaXMgJ3Jlc2l6ZScpIGFuZCAoJCgnI292ZXJsYXkgdmlkZW86dmlzaWJsZScpLnNpemUoKSA+IDApKVxuICAgICAgICAgICAgJCgnLm92ZXJsYXktYmFzaWMnKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICB9LCAoKSAtPiBcbiAgICAgICAgICAgICAgICAkKCcub3ZlcmxheS1iYXNpYycpLmhpZGUoKVxuICAgICAgICAgICAgICAgICQoJyNvdmVybGF5JykuaGlkZSgpXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvcGVuT3ZlcmxheTogKHQpIC0+XG4gICAgICAgICRlbCA9ICQodGhpcylcbiAgICAgICAgb3ZlcmxheVNvdXJjZSA9ICRlbC5kYXRhKCdzb3VyY2UnKVxuICAgICAgICAkdGFyZ2V0RWxlbWVudCA9ICQoJyNvdmVybGF5LWJhc2ljLWlubmVyIC5vdmVybGF5LWNvbnRlbnQnKVxuICAgICAgICBpc05ld3MgPSAkZWwuaGFzQ2xhc3MoJ25ld3MnKVxuXG4gICAgICAgICQoJyNvdmVybGF5Jykuc2hvdygpXG4gICAgICAgIFxuICAgICAgICBpZiAkZWwuaGFzQ2xhc3MgJ29mZmVyaW5ncy1vcHRpb24nXG4gICAgICAgICAgICBvYyA9ICQoJyNvZmZlcmluZ3Mtb3ZlcmxheS1jb250ZW50JylcbiAgICAgICAgICAgIG9jLmZpbmQoJ2gxLnRpdGxlJykudGV4dCgkZWwuZmluZCgnc3Bhbi5vZmZlcicpLnRleHQoKSlcbiAgICAgICAgICAgIG9jLmZpbmQoJ2Rpdi5kZXNjcmlwdGlvbicpLmh0bWwoJGVsLmZpbmQoJ2Rpdi5kZXNjcmlwdGlvbicpLmh0bWwoKSlcbiAgICAgICAgICAgIG9jLmZpbmQoJy5jb250ZW50Lm1lZGlhJykuY3NzKHtiYWNrZ3JvdW5kSW1hZ2U6IFwidXJsKCdcIiArICRlbC5maW5kKCdzcGFuLm1lZGlhJykuZGF0YSgnc291cmNlJykgKyBcIicpXCJ9KVxuXG4gICAgICAgIFxuICAgICAgICBpZiAoJCgnIycgKyBvdmVybGF5U291cmNlKS5zaXplKCkgaXMgMSkgXG4gICAgICAgICAgICAjaHRtbCA9ICQoJyMnICsgb3ZlcmxheVNvdXJjZSkuaHRtbCgpXG5cbiAgICAgICAgICAgICR0YXJnZXRFbGVtZW50LmNoaWxkcmVuKCkuZWFjaCAoaSx0KSA9PlxuICAgICAgICAgICAgICAgICQodCkuYXBwZW5kVG8oJyNvdmVybGF5LWNvbnRlbnQtc291cmNlcycpXG5cbiAgICAgICAgICAgIGlmIGlzTmV3c1xuICAgICAgICAgICAgICAgIGMgPSAkZWwubmV4dCgnLmFydGljbGUnKS5jbG9uZSgpXG4gICAgICAgICAgICAgICAgJCgnI292ZXJsYXlfY29udGVudCcpLmh0bWwoYy5odG1sKCkpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcjJyArIG92ZXJsYXlTb3VyY2UpLmFwcGVuZFRvKCR0YXJnZXRFbGVtZW50KVxuXG4gICAgICAgICAgICAkZWwgPSAkKCcjb3ZlcmxheS1iYXNpYy1pbm5lcicpXG4gICAgICAgICAgICBpc1NtYWxsID0gJGVsLmhlaWdodCgpIDwgJCh3aW5kb3cpLmhlaWdodCgpIGFuZCAkKCR0YXJnZXRFbGVtZW50KS5maW5kKCcuc2VsZWN0LWJveC13cmFwcGVyJykuc2l6ZSgpIGlzIDBcbiAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKVxuICAgICAgICAgICAgYWRkdG9wID0gaWYgaXNTbWFsbCB0aGVuIDAgZWxzZSBzY3JvbGxUb3A7XG4gICAgICAgICAgICBwb3NpdGlvbiA9ICRlbC5jc3MgJ3Bvc2l0aW9uJywgaWYgaXNTbWFsbCB0aGVuICdmaXhlZCcgZWxzZSAnYWJzb2x1dGUnXG4gICAgICAgICAgICB0b3AgPSBNYXRoLm1heCgwLCAoKCQod2luZG93KS5oZWlnaHQoKSAtICRlbC5vdXRlckhlaWdodCgpKSAvIDIpICsgYWRkdG9wKVxuICAgICAgICAgICAgaWYgIWlzU21hbGwgYW5kICh0b3AgPCBzY3JvbGxUb3ApIHRoZW4gdG9wID0gc2Nyb2xsVG9wXG4gICAgICAgICAgICAkZWwuY3NzKFwidG9wXCIsIHRvcCArIFwicHhcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgaGVpZ2h0OlxuICAgICAgICAgICAgIyRlbC5jc3MoXCJsZWZ0XCIsIE1hdGgubWF4KDAsICgoJCh3aW5kb3cpLndpZHRoKCkgLSAkZWwub3V0ZXJXaWR0aCgpKSAvIDIpICsgYWRkbGVmdCkgKyBcInB4XCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcub3ZlcmxheS1iYXNpYycpLmNzcygnb3BhY2l0eScsIDApLmRlbGF5KDApLnNob3coKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgICAgICB9KVxuXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzaWNPdmVybGF5XG5cblxuXG5cblxuXG4iLCJcblBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblZpZXdCYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvVmlld0Jhc2UuY29mZmVlJ1xuXG5jbGFzcyBEcmFnZ2FibGVHYWxsZXJ5IGV4dGVuZHMgUGx1Z2luQmFzZVxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cblxuICAgICAgICBAZ2FsbGVyeSA9IEAkZWwuZmluZCBcIi5zd2lwZXItY29udGFpbmVyXCJcblxuICAgICAgICBpZihAZ2FsbGVyeS5sZW5ndGggPCAxKVxuICAgICAgICAgICAgQGdhbGxlcnkgPSBAJGVsLmZpbHRlciBcIi5zd2lwZXItY29udGFpbmVyXCJcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBvcHRzLnBhZ2UgPT0gJ2pvYnMnXG4gICAgICAgICAgICBAam9ic1BhZ2UgPSB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBqb2JzUGFnZSA9IGZhbHNlXG5cbiAgICAgICAgQGdhbGxlcnlDcmVhdGVkID0gZmFsc2VcbiAgICAgICAgQGdhbGxlcnlDb250YWluZXIgPSBAZ2FsbGVyeS5maW5kKCd1bCcpXG4gICAgICAgIEBnYWxsZXJ5SXRlbXMgPSBAZ2FsbGVyeUNvbnRhaW5lci5maW5kKCdsaScpXG4gICAgICAgIEBjdXJyZW50SW5kZXggPSBAZ2FsbGVyeUl0ZW1zLmZpbHRlcignLnNlbGVjdGVkJykuZGF0YSgnaW5kZXgnKVxuICAgICAgICBAYWNyb3NzID0gb3B0cy5hY3Jvc3Mgb3IgMVxuICAgICAgICBAYW5nbGVMZWZ0ID0gQGdhbGxlcnkuZmluZCAnLmZhLWFuZ2xlLWxlZnQnXG4gICAgICAgIEBhbmdsZVJpZ2h0ID0gQGdhbGxlcnkuZmluZCAnLmZhLWFuZ2xlLXJpZ2h0J1xuICAgICAgICBAcGFnaW5hdGlvbiA9IG9wdHMucGFnaW5hdGlvbiBvciBmYWxzZVxuICAgICAgICBAY29udHJvbHMgPSBvcHRzLmNvbnRyb2wgb3IgbnVsbFxuICAgICAgICBAam9ic0Nhcm91c2VsU3RvcHBlZCA9IGZhbHNlXG4gICAgICAgIEBqb2JzQ2Fyb3VzZWxQYXVzZWQgPSBmYWxzZVxuICAgICAgICBAam9ic0ludGVydmFsID0gbnVsbFxuXG4gICAgICAgIEBzaXplQ29udGFpbmVyKClcblxuICAgICAgICBAYWRkQXJyb3dzKClcblxuICAgICAgICBzdXBlcigpXG5cbiAgICBhZGRFdmVudHM6IC0+XG4gICAgICAgICQod2luZG93KS5vbiAncmVzaXplJyAsIEBzaXplQ29udGFpbmVyXG5cbiAgICAgICAgJChAJGVsKS5vbiAnY2xpY2snLCAnLmZhLWFuZ2xlLWxlZnQnLCBAcHJldlNsaWRlXG4gICAgICAgICQoQCRlbCkub24gJ2NsaWNrJywgJy5mYS1hbmdsZS1yaWdodCcsIEBuZXh0U2xpZGVcbiAgICAgICAgaWYgQGpvYnNQYWdlID09IHRydWVcbiAgICAgICAgICAgICQoQCRlbCkub24gJ2NsaWNrJywgJy5zd2lwZXItY29udGFpbmVyJywgQHN0b3BKb2JzQ2Fyb3VzZWxcbiAgICAgICAgICAgICQoQCRlbCkub24gJ21vdXNlb3ZlcicsICcuc3dpcGVyLWNvbnRhaW5lcicsIEBwYXVzZUpvYnNDYXJvdXNlbFxuICAgICAgICAgICAgJChAJGVsKS5vbiAnbW91c2VsZWF2ZScsICcuc3dpcGVyLWNvbnRhaW5lcicsIEByZXN1bWVKb2JzQ2Fyb3VzZWxcbiAgICAgICAgICAgIFxuICAgICAgICBcbiAgICBzdG9wSm9ic0Nhcm91c2VsOiA9PlxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAam9ic0ludGVydmFsKVxuICAgICAgICBAam9ic0Nhcm91c2VsU3RvcHBlZCA9IHRydWVcblxuICAgIHBhdXNlSm9ic0Nhcm91c2VsOiA9PlxuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAam9ic0ludGVydmFsKVxuICAgICAgICBAam9ic0Nhcm91c2VsUGF1c2VkID0gdHJ1ZVxuXG4gICAgcmVzdW1lSm9ic0Nhcm91c2VsOiA9PlxuICAgICAgICBpZiBAam9ic0Nhcm91c2VsU3RvcHBlZCA9PSBmYWxzZVxuICAgICAgICAgICAgQGpvYnNJbnRlcnZhbCA9IHNldEludGVydmFsICgtPlxuICAgICAgICAgICAgICAgICQoJyNqb2JzLWdhbGxlcnkgLmZhLWFuZ2xlLXJpZ2h0JykudHJpZ2dlcignY2xpY2snKVxuICAgICAgICAgICAgKSwgODAwMFxuICAgICAgICAgICAgQGpvYnNDYXJvdXNlbFBhdXNlZCA9IGZhbHNlXG5cbiAgICBwcmV2U2xpZGU6IChlKSA9PlxuICAgICAgICB0aGF0ID0gQG15U3dpcGVyXG4gICAgICAgIGdhbCA9IEBnYWxsZXJ5XG4gICAgICAgIFxuICAgICAgICBUd2Vlbk1heC50bygkKGdhbCksIC4yLCBcbiAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICAgIHNjYWxlOiAxLjFcbiAgICAgICAgICAgIG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICAgICAgdGhhdC5zd2lwZVByZXYoKVxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnNldCgkKGdhbCksXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlOiAxXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvKCQoZ2FsKSwgLjM1LCBcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgICAgICAgICAgICBkZWxheTogLjM1XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICApXG4gICAgXG4gICAgbmV4dFNsaWRlOiAoZSkgPT5cbiAgICAgICAgdGhhdCA9IEBteVN3aXBlclxuICAgICAgICBnYWwgPSBAZ2FsbGVyeVxuXG4gICAgICAgIFR3ZWVuTWF4LnRvKCQoZ2FsKSwgLjIsXG4gICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICBzY2FsZTogMS4xXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgICAgIHRoYXQuc3dpcGVOZXh0KClcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC5zZXQoJChnYWwpLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogMC44NVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC50bygkKGdhbCksIC4zNSxcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogMVxuICAgICAgICAgICAgICAgICAgICBkZWxheTogLjM1XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICApXG5cblxuICAgIGFkZEFycm93czogLT5cbiAgICAgICAgQGlzUGhvbmUgPSAkKFwiaHRtbFwiKS5oYXNDbGFzcyhcInBob25lXCIpXG5cbiAgICAgICAgYXJyb3dMZWZ0ID0gJChcIjxpIGNsYXNzPSdnYWwtYXJyb3cgZmEgZmEtYW5nbGUtbGVmdCc+PC9pPlwiKVxuICAgICAgICBhcnJvd1JpZ2h0ID0gJChcIjxpIGNsYXNzPSdnYWwtYXJyb3cgZmEgZmEtYW5nbGUtcmlnaHQnPjwvaT5cIilcblxuICAgICAgICBAJGVsLmFwcGVuZChhcnJvd0xlZnQsIGFycm93UmlnaHQpXG5cbiAgICAgICAgJCgnLmdhbC1hcnJvdycpLm9uICdjbGljaycsIC0+XG4gICAgICAgICAgICAkKEApLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICB0aGF0ID0gJChAKVxuICAgICAgICAgICAgc2V0VGltZW91dCAtPlxuICAgICAgICAgICAgICAgICQodGhhdCkucmVtb3ZlQ2xhc3MgJ2FjdGl2ZScsIDEwMFxuICAgICAgICAgICAgXG5cbiAgICBzaXplQ29udGFpbmVyOiAoKSA9PlxuICAgICAgICBAZ2FsbGVyeUNvbnRhaW5lci5jc3MoJ3dpZHRoJywgXCIxMDAlXCIpXG4gICAgICAgIGlmIEBhY3Jvc3MgPCAyXG4gICAgICAgICAgICBAZ2FsbGVyeUl0ZW1zLmNzcygnd2lkdGgnICwgXCIxMDAlXCIpXG4gICAgICAgIGVsc2UgaWYgQGFjcm9zcyA8IDNcbiAgICAgICAgICAgIEBnYWxsZXJ5SXRlbXMuY3NzKCd3aWR0aCcgLCBcIjUwJVwiKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZ2FsbGVyeUl0ZW1zLmNzcygnd2lkdGgnICwgXCIzMy4zMzMzMzMlXCIpXG5cbiAgICAgICAgQGl0ZW1XaWR0aCA9IEBnYWxsZXJ5SXRlbXMuZmlyc3QoKS5vdXRlcldpZHRoKClcbiAgICAgICAgaXRlbUxlbmd0aCA9IEBnYWxsZXJ5SXRlbXMubGVuZ3RoXG5cbiAgICAgICAgQGdhbGxlcnlJdGVtcy5jc3MoJ3dpZHRoJywgQGl0ZW1XaWR0aClcbiAgICAgICAgQGdhbGxlcnlDb250YWluZXIuY3NzKCd3aWR0aCcsIGl0ZW1MZW5ndGggKiAoQGl0ZW1XaWR0aCkpXG4gICAgICAgIFR3ZWVuTWF4LnNldCBAZ2FsbGVyeUNvbnRhaW5lciAsXG4gICAgICAgICAgICB4OiAtQGN1cnJlbnRJbmRleCAqIEBpdGVtV2lkdGhcbiAgICAgICAgXG4gICAgICAgIGlmICFAZ2FsbGVyeUNyZWF0ZWQgICAgXG4gICAgICAgICAgICBAY3JlYXRlRHJhZ2dhYmxlKClcbiMgICAgICAgICAgICBAbXlTd2lwZXIuc3dpcGVOZXh0KClcbiAgICAgICAgXG4gICAgY3JlYXRlRHJhZ2dhYmxlOiAoKSAtPlxuICAgICAgICBpdGVtTGVuZ3RoID0gQGdhbGxlcnlJdGVtcy5sZW5ndGhcblxuICAgICAgICBpZiBAc2Nyb2xsIHRoZW4gQHNjcm9sbC5raWxsKClcblxuICAgICAgICBpZCA9ICQoQC4kZWwpLmF0dHIgJ2lkJ1xuXG5cbiAgICAgICAgaWYgQHBhZ2luYXRpb25cbiAgICAgICAgICAgIEBhZGRQYWdpbmF0aW9uKClcblxuICAgICAgICBpZiBAYWNyb3NzIDwgM1xuICAgICAgICAgICAgaWYgQHBhZ2luYXRpb25cbiAgICAgICAgICAgICAgICBAbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcjJyArIGlkICsgJyAuc3dpcGVyLWNvbnRhaW5lcicse1xuICAgICAgICAgICAgICAgICAgICBsb29wOnRydWUsXG4gICAgICAgICAgICAgICAgICAgIGdyYWJDdXJzb3I6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IEBhY3Jvc3MsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb246ICcjJyArIGlkICsgJyAuc3dpcGVyLXBhZ2luYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQXNSYW5nZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblRvdWNoRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZVN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyR3JvdXA6IEBhY3Jvc3NcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBteVN3aXBlciA9IG5ldyBTd2lwZXIoJyMnICsgaWQgKyAnIC5zd2lwZXItY29udGFpbmVyJyx7XG4gICAgICAgICAgICAgICAgICAgIGxvb3A6dHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgZ3JhYkN1cnNvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogQGFjcm9zcyxcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzUGVyR3JvdXA6IEBhY3Jvc3NcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaFN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblRvdWNoRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZVN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBteVN3aXBlciA9IG5ldyBTd2lwZXIoJyMnICsgaWQgKyAnIC5zd2lwZXItY29udGFpbmVyJyx7XG4gICAgICAgICAgICAgICAgbG9vcDp0cnVlLFxuICAgICAgICAgICAgICAgIGdyYWJDdXJzb3I6IHRydWUsXG4gICAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcbiAgICAgICAgICAgICAgICBzbGlkZXNQZXJHcm91cDogM1xuICAgICAgICAgICAgICAgIG9uVG91Y2hTdGFydDogQG9uU2xpZGVDaGFuZ2VTdGFydCxcbiAgICAgICAgICAgICAgICBvblRvdWNoRW5kOiBAb25TbGlkZUNoYW5nZUVuZCxcbiAgICAgICAgICAgICAgICBvblNsaWRlQ2hhbmdlU3RhcnQ6IEBvblNsaWRlQ2hhbmdlU3RhcnQsXG4gICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZUVuZDogQG9uU2xpZGVDaGFuZ2VFbmQsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgXG4gICAgICAgIEBnYWxsZXJ5Q3JlYXRlZCA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIGlmIEBqb2JzUGFnZSA9PSB0cnVlXG4gICAgICAgICAgICBAam9ic0ludGVydmFsID0gc2V0SW50ZXJ2YWwgKC0+XG4gICAgICAgICAgICAgICAgJCgnI2pvYnMtZ2FsbGVyeSAuZmEtYW5nbGUtcmlnaHQnKS50cmlnZ2VyKCdjbGljaycpXG4gICAgICAgICAgICApLCA4MDAwXG5cbiAgICAgICAgXG4gICAgb25TbGlkZUNoYW5nZVN0YXJ0OiA9PlxuICAgICAgICAkKEAuJGVsKS5jbG9zZXN0KCcuYWRkLWJvcmRlci1mYWRlJykuYWRkQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICQoQC4kZWwpLmZpbmQoJy5hZGQtYm9yZGVyLWZhZGUnKS5hZGRDbGFzcyAnc2hvd2luZydcblxuICAgIG9uU2xpZGVDaGFuZ2VFbmQ6ID0+XG4gICAgICAgICQoQC4kZWwpLmNsb3Nlc3QoJy5hZGQtYm9yZGVyLWZhZGUnKS5yZW1vdmVDbGFzcyAnc2hvd2luZydcbiAgICAgICAgJChALiRlbCkuZmluZCgnLmFkZC1ib3JkZXItZmFkZScpLnJlbW92ZUNsYXNzICdzaG93aW5nJ1xuICAgICAgICBcbiAgICAgICAgaWYgIShAY29udHJvbHMgPT0gbnVsbClcbiAgICAgICAgICAgIHBhcmsgPSBAbXlTd2lwZXIuYWN0aXZlU2xpZGUoKS5kYXRhKCdpZCcpXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuc3dpcGVyLWNvbnRhaW5lcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuY2Fyb3VzZWwtd3JhcHBlcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSBkaXYjJyArIHBhcmspLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSBkaXYjJyArIHBhcmspLnBhcmVudCgpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgKEBwYXJrTGlzdClcbiAgICAgICAgICAgIEBwYXJrTGlzdC5zZWxlY3RMb2dvICQoQC4kZWwpLmZpbmQoJy5zd2lwZXItc2xpZGUtYWN0aXZlJykuZGF0YSgnaWQnKTtcblxuICAgIGFkZFBhZ2luYXRpb246ID0+XG4gICAgICAgIHdyYXBwZXIgPSAkKFwiPGRpdiBjbGFzcz0nc3dpcGVyLXBhZ2luYXRpb24nPjwvZGl2PlwiKVxuICAgICAgICAkKEAuJGVsKS5maW5kKCcuc3dpcGVyLWNvbnRhaW5lcicpLmFkZENsYXNzKCdhZGRQYWdpbmF0aW9uJykuYXBwZW5kKHdyYXBwZXIpXG5cblxuICAgIGdvdG86IChpZCwgaW5pdFZhbCkgLT5cblxuICAgICAgICBpZiBub3QgaW5pdFZhbCB0aGVuICQoJ2JvZHknKS5hbmltYXRlIHsgc2Nyb2xsVG9wOiAkKCcjJyArICgkKEAkZWwpLmF0dHIoJ2lkJykpKS5vZmZzZXQoKS50b3AgfVxuXG4gICAgICAgIHRvSW5kZXggPSAkKFwibGkucGFya1tkYXRhLWlkPScje2lkfSddXCIpLmRhdGEoJ2luZGV4JylcblxuICAgICAgICB0bCA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgICAgIHRsLmFkZCBUd2Vlbk1heC50byBAZ2FsbGVyeUNvbnRhaW5lciAsIC40LFxuICAgICAgICAgICAgYXV0b0FscGhhOjBcblxuICAgICAgICB0bC5hZGRDYWxsYmFjayA9PlxuICAgICAgICAgICAgQG15U3dpcGVyLnN3aXBlVG8odG9JbmRleCwgMClcblxuICAgICAgICB0bC5hZGQgVHdlZW5NYXgudG8gQGdhbGxlcnlDb250YWluZXIgLCAuNCxcbiAgICAgICAgICAgIGF1dG9BbHBoYToxXG5cbiAgICAgICAgQGN1cnJlbnRJbmRleCA9IHRvSW5kZXhcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdnYWJsZUdhbGxlcnlcblxuIiwiXG5QbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5WaWRlb092ZXJsYXkgPSByZXF1aXJlICcuL1ZpZGVvT3ZlcmxheS5jb2ZmZWUnXG5cbmNsYXNzIEZhZGVHYWxsZXJ5IGV4dGVuZHMgUGx1Z2luQmFzZVxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nICdpbml0aWFsaXplOiAnLCBvcHRzXG5cbiAgICAgICAgQHBhZ2UgPSBvcHRzLnBhZ2Ugb3IgbnVsbFxuICAgICAgICB0YXJnZXQgPSBvcHRzLnRhcmdldCBvciBudWxsXG4gICAgICAgIFxuICAgICAgICBpZiAodGFyZ2V0PylcbiAgICAgICAgICAgIEAkdGFyZ2V0ID0gJCh0YXJnZXQpXG4gICAgICAgIFxuICAgICAgICBpZiAhKEBwYWdlID09IG51bGwpXG4gICAgICAgICAgICBAaW5mb0JveGVzID0gQCRlbC5maW5kIFwibGkudmlkZW9cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAaW5mb0JveGVzID0gQCRlbC5maW5kIFwibGlcIlxuICAgICAgICAgICAgXG4gICAgICAgIEBjdXJyZW50U2VsZWN0ZWQgPSBAaW5mb0JveGVzLmZpbHRlcihcIjpmaXJzdC1jaGlsZFwiKVxuXG4gICAgICAgIHN1cGVyKClcbiAgICBcbiAgICBhZGRFdmVudHM6IC0+ICBcblxuICAgICAgICBAaW5mb0JveGVzLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgICRidG4gPSAkKHQpLmZpbmQoJy52aWRlby1idXR0b24nKVxuXG4gICAgICAgICAgICBpZiAkYnRuLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgICB2aWRlb0V2ZW50cyA9IG5ldyBIYW1tZXIoJGJ0blswXSlcbiAgICAgICAgICAgICAgICB2aWRlb0V2ZW50cy5vbiAndGFwJyAsIEBoYW5kbGVWaWRlb0ludGVyYWN0aW9uXG5cblxuXG5cbiAgICBoYW5kbGVWaWRlb0ludGVyYWN0aW9uOiAoZSkgPT5cblxuICAgICAgICAkdGFyZ2V0ID0gJChlLnRhcmdldCkuY2xvc2VzdChcIi52aWRlby1idXR0b25cIilcbiAgICAgICAgaWYgKCR0YXJnZXQuc2l6ZSgpIGlzIDApIFxuICAgICAgICAgICAgJHRhcmdldCA9IGUudGFyZ2V0XG4gICAgICAgIFxuICAgICAgICBpZiAkdGFyZ2V0LmRhdGEoJ3R5cGUnKSA9PSAnaW1hZ2UnXG4gICAgICAgICAgICBpZiAoJHRhcmdldC5kYXRhKCdmdWxsJykpXG4gICAgICAgICAgICAgICAgQGltYWdlU3JjID0gJHRhcmdldC5kYXRhKCdmdWxsJylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAaW1hZ2VTcmMgPSAkdGFyZ2V0LmNoaWxkcmVuKCdpbWcnKS5hdHRyKCdzcmMnKVxuICAgICAgICBkYXRhID1cbiAgICAgICAgICAgIG1wNDokdGFyZ2V0LmRhdGEoJ21wNCcpXG4gICAgICAgICAgICB3ZWJtOiR0YXJnZXQuZGF0YSgnd2VibScpXG4gICAgICAgICAgICBwb3N0ZXI6QGltYWdlU3JjXG5cbiAgICAgICAgVmlkZW9PdmVybGF5LmluaXRWaWRlb092ZXJsYXkgZGF0YVxuXG5cbiAgICBnb3RvOiAoaWQsIGluaXRWYWwpIC0+XG4gICAgICAgIGluZm9JZCA9IFwiIyN7aWR9LWluZm9cIlxuXG4gICAgICAgIGlmICEoQHBhZ2UgPT0gbnVsbClcbiAgICAgICAgICAgIHRhcmdldCA9IEBpbmZvQm94ZXMucGFyZW50cygnbGkuZ3JvdXAtaW5mbycpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRhcmdldCA9IEBpbmZvQm94ZXNcbiAgICAgICAgXG5cbiAgICAgICAgI1N3aXRjaCBJbmZvIEJveGVzXG4gICAgICAgIHRsID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgICAgIHRsLmFkZCBUd2Vlbk1heC50byB0YXJnZXQgLCAuNCAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MFxuICAgICAgICAgICAgb3ZlcndyaXRlOlwiYWxsXCJcbiAgICAgICAgdGwuYWRkIFR3ZWVuTWF4LnRvIHRhcmdldC5maWx0ZXIoaW5mb0lkKSAsIC40ICxcbiAgICAgICAgICAgIGF1dG9BbHBoYToxXG5cblxuICAgICAgICBpZiAoQCR0YXJnZXQ/KVxuICAgICAgICAgICAgY29uc29sZS5sb2cgQCR0YXJnZXRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdG9wID0gQCR0YXJnZXQub2Zmc2V0KCkudG9wIC0gKCQoJ2hlYWRlcicpLmhlaWdodCgpKVxuICAgICAgICAgICAgY29uc29sZS5sb2cgdG9wXG4gICAgICAgICAgICBwb3MgPSAkKCdib2R5Jykuc2Nyb2xsVG9wKClcbiAgICAgICAgICAgIGlmIChwb3MgPCB0b3ApXG4gICAgICAgICAgICAgICAgJCgnYm9keScpLmFuaW1hdGUgeyBzY3JvbGxUb3A6IHRvcCB9XG4gIFxuXG5tb2R1bGUuZXhwb3J0cyA9IEZhZGVHYWxsZXJ5XG5cbiIsIlBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblxuIyMjXG4gIFxuICBjcmVhdGUgZm9ybSBvYmplY3Qgb24gcGFnZSAoc3JjL2NvbS9wYWdlcy8pIGFmdGVyIHlvdSd2ZSBjcmVhdGVkIGFuZCBhZGRlZCBhbnkgZGRsIG9iamVjdHNcbiAgXG4gIHdpbmRvdy5kZGxzID0gW10gICAgXG4gIHdpbmRvdy5kZGxzLnB1c2ggJCgnI3NlbGVjdCcpLmNmRHJvcGRvd25cbiAgICAgICAgb25TZWxlY3Q6ICh0KSAtPlxuICAgICAgICAgICAgaWQgPSAkKHQpLmRhdGEoJ2lkJykgIFxuICBcbiAgbXlmb3JtID0gbmV3IEZvcm1IYW5kbGVyXG4gICAgZWw6ICcjc2FsZXMtZm9ybScgXG4gIFxuIyMjXG5cbiMjIyBcbiAgdG9kbzpcbiAgNS4gY3VzdG9taXplIGNvbmZpcm1hdGlvblxuICAyOiB2YWxpZGF0ZSBkYXRlIHR5cGVcbiAgNDogYWRkIGlucHV0IG1hc2sgZm9yIHBob25lIGFuZCBkYXRlXG4jIyNcblxuY2xhc3MgRm9ybUhhbmRsZXIgZXh0ZW5kcyBQbHVnaW5CYXNlXG4gICAgXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBAJGVsID0gJChvcHRzLmVsKVxuICAgICAgICBAZm9ybWNvbnRhaW5lciA9IEBcbiAgICAgICAgc3VwZXIob3B0cylcblxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgIHN1cGVyKClcblxuICAgIHZhbGlkYXRlOiAtPlxuXG4gICAgICAgICRmb3JtID0gQCRlbFxuICAgICAgICBcbiAgICAgICAgZXJyb3JzQ29udGFpbmVyID0gICcjJyArICRmb3JtLmRhdGEoJ2Vycm9ycycpXG4gICAgICAgIGhhbmRsZXIgPSAkZm9ybS5kYXRhKCdoYW5kbGVyJylcbiAgICAgICAgZXJyb3JzID0gJydcbiAgICAgICAgaW52YWxpZEZpZWxkQ291bnQgPSAwXG4gICAgICAgIGRhdGEgPSB7fVxuXG4gICAgICAgIGlucHV0cyA9ICRmb3JtLmZpbmQgJ2lucHV0Om5vdChbdHlwZT1yYWRpb10sIFt0eXBlPWhpZGRlbl0pLCB0ZXh0YXJlYSwgLnJhZGlvcydcbiAgICAgICAgaW5wdXRDb250YWluZXJzID0gJGZvcm0uZmluZCgnLmlucHV0LCB0ZXh0YXJlYSwgLnJhZGlvcycpXG5cbiAgICAgICAgJChpbnB1dENvbnRhaW5lcnMpLnJlbW92ZUNsYXNzKCdpbnZhbGlkJylcblxuICAgICAgICAjIHRleHRib3hlcyBhbmQgdGV4dCBpbnB1dHNcbiAgICAgICAgaW5wdXRzLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgIHZhbHVlID0gJydcbiAgICAgICAgICAgIHR5cGUgPSAkKHQpLmRhdGEoJ3R5cGUnKVxuICAgICAgICAgICAgcGFyZW50ID0gJCh0KS5wYXJlbnRzKCcuaW5wdXQnKS5lcSgwKVxuICAgICAgICAgICAgcmVxdWlyZWQgPSAkKHBhcmVudCkuaGFzQ2xhc3MoJ3JlcXVpcmVkJykgb3IgJCh0KS5oYXNDbGFzcygncmVxdWlyZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpc3JhZGlvID0gJCh0KS5oYXNDbGFzcygncmFkaW9zJylcbiAgICAgICAgICAgIGlmIGlzcmFkaW8gYW5kICQoJ2lucHV0OnJhZGlvW25hbWU9JyArICQodCkuZGF0YSgnZ3JvdXAnKSArICddOmNoZWNrZWQnKS5zaXplKCkgaXMgMVxuICAgICAgICAgICAgICAgIHZhbHVlID0gJCgnaW5wdXQ6cmFkaW9bbmFtZT0nICsgJCh0KS5kYXRhKCdncm91cCcpICsgJ106Y2hlY2tlZCcpLnZhbCgpLnRyaW0oKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFsdWUgPSBpZiBpc3JhZGlvIHRoZW4gdmFsdWUgZWxzZSAkKHQpLnZhbCgpLnRyaW0oKVxuICAgICAgICAgICAgZGF0YVskKHQpLmRhdGEoJ21hcHBpbmcnKV0gPSB2YWx1ZVxuXG4gICAgICAgICAgICBmaWVsZE5hbWUgPSBpZiAkKHQpLmRhdGEoJ25hbWUnKSB0aGVuICQodCkuZGF0YSgnbmFtZScpIGVsc2UgJCh0KS5hdHRyKCdwbGFjZWhvbGRlcicpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgdmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzXG4gICAgICAgICAgICBpZiByZXF1aXJlZCBhbmQgKHZhbHVlLmxlbmd0aCBpcyAwKVxuICAgICAgICAgICAgICAgIGVycm9ycyArPSAnPGxpPicgKyBmaWVsZE5hbWUgKyAnIGlzIHJlcXVpcmVkLjwvbGk+J1xuICAgICAgICAgICAgICAgIGlmICQodCkucHJvcCgndGFnTmFtZScpLnRvTG93ZXJDYXNlKCkgaXMgJ3RleHRhcmVhJyBvciAkKHQpLmhhc0NsYXNzKCdyYWRpb3MnKVxuICAgICAgICAgICAgICAgICAgICAkKHQpLmFkZENsYXNzKCdpbnZhbGlkJykgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgJCh0KS5wYXJlbnRzKCcuaW5wdXQnKS5hZGRDbGFzcygnaW52YWxpZCcpXG4gICAgICAgICAgICAgICAgaW52YWxpZEZpZWxkQ291bnQrK1xuXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgIyB2YWxpZGF0ZSBpbnB1dCB0eXBlc1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKVxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnZW1haWwnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1haWxQYXR0ZXJuID0gLy8vXihbXFx3Li1dKylAKFtcXHcuLV0rKVxcLihbYS16QS1aLl17Miw2fSkkIC8vL2lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAhIHZhbHVlLm1hdGNoIGVtYWlsUGF0dGVyblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMgKz0gJzxsaT4nICsgZmllbGROYW1lICsgJyBpcyBub3QgYSB2YWxpZCBlbWFpbCBhZGRyZXNzLjwvbGk+J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHQpLnBhcmVudHMoJy5pbnB1dCcpLmFkZENsYXNzKCdpbnZhbGlkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW52YWxpZEZpZWxkQ291bnQrK1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGlzTmFOKHZhbHVlKSBvciAodmFsdWUgJSAxICE9IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9ycyArPSAnPGxpPicgKyBmaWVsZE5hbWUgKyAnIGlzIG5vdCBhIHZhbGlkIG51bWJlci48L2xpPidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0KS5wYXJlbnRzKCcuaW5wdXQnKS5hZGRDbGFzcygnaW52YWxpZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludmFsaWRGaWVsZENvdW50KytcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ3Bob25lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdCA9IC9eWyhdezAsMX1bMC05XXszfVspXXswLDF9Wy1cXHNcXC5dezAsMX1bMC05XXszfVstXFxzXFwuXXswLDF9WzAtOV17NH0kL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICEgdmFsdWUubWF0Y2ggcGF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9ycyArPSAnPGxpPicgKyBmaWVsZE5hbWUgKyAnIGlzIG5vdCBhIHZhbGlkIHBob25lIG51bWJlci48L2xpPidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0KS5wYXJlbnRzKCcuaW5wdXQnKS5hZGRDbGFzcygnaW52YWxpZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludmFsaWRGaWVsZENvdW50KytcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcblxuICAgICAgXG4gICAgICAgICMgdmFsaWRhdGUgZHJvcGRvd24gbGlzdHNcbiAgICAgICAgaWYgd2luZG93LmRkbHM/XG4gICAgICAgICAgICAkLmVhY2ggd2luZG93LmRkbHMsIChpLCBkKSA9PlxuICAgICAgICAgICAgICAgIGQucmVtb3ZlQ2xhc3MoJ2ludmFsaWQnKVxuICAgICAgICAgICAgICAgIGRhdGFbZC5tYXBwaW5nXSA9IGQudmFsdWUudHJpbSgpXG4gICAgICAgICAgICAgICAgaWYgKGQucmVxdWlyZWQpIGFuZCAoZC52YWx1ZS50cmltKCkubGVuZ3RoIGlzIDApXG4gICAgICAgICAgICAgICAgICAgIGVycm9ycyArPSAnPGxpPicgKyBkLm5hbWUgKyAnIGlzIHJlcXVpcmVkLjwvbGk+J1xuICAgICAgICAgICAgICAgICAgICBkLmFkZENsYXNzKCdpbnZhbGlkJylcbiAgICAgICAgICAgICAgICAgICAgaW52YWxpZEZpZWxkQ291bnQrKyAgICAgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgdmFsaWQgPSBpbnZhbGlkRmllbGRDb3VudCBpcyAwXG4gICAgICAgIGVycm9ySHRtbCA9IGlmIHZhbGlkIHRoZW4gJycgZWxzZSAnPHVsPicgKyBlcnJvcnMgKyAnPC91bD4nXG4gICAgICAgIGNscyA9IGlmIHZhbGlkIHRoZW4gJ3N1Y2Nlc3MnIGVsc2UgJ2ZhaWx1cmUnXG4gICAgICAgICAgICBcbiAgICAgICAgJChlcnJvcnNDb250YWluZXIpLnJlbW92ZUNsYXNzKCdzdWNjZXNzIGZhaWx1cmUnKS5hZGRDbGFzcyhjbHMpLmh0bWwoZXJyb3JIdG1sKSAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICMgZGlzcGxheSBlcnJvcnNcbiAgICAgICAgJChlcnJvcnNDb250YWluZXIpLnN0b3AoKS5hbmltYXRlKHtcbiAgICAgICAgICAgIGhlaWdodDogJChlcnJvcnNDb250YWluZXIpLmZpbmQoJ3VsJykuaGVpZ2h0KClcbiAgICAgICAgfSlcbiAgICAgICAgICAgIFxuICAgICAgICByZXNwb25zZSA9IHtcbiAgICAgICAgICAgIHZhbGlkOiB2YWxpZCxcbiAgICAgICAgICAgIGhhbmRsZXI6IGhhbmRsZXIsXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgY29udGFpbmVyOiBlcnJvcnNDb250YWluZXJcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzcG9uc2VcblxuICAgIHN1Ym1pdEZvcm06IChlLCBwYXJlbnQpIC0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgXG4gICAgICAgIHZhbGlkYXRpb24gPSBwYXJlbnQudmFsaWRhdGUoKVxuICAgICAgICBpZiB2YWxpZGF0aW9uLnZhbGlkXG4gICAgICAgIFxuICAgICAgICAgICAgJC5hamF4IFxuICAgICAgICAgICAgICAgIHVybDogdmFsaWRhdGlvbi5oYW5kbGVyLFxuICAgICAgICAgICAgICAgIG1ldGhvZDpcIlBPU1RcIixcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIGRhdGE6IHZhbGlkYXRpb24uZGF0YSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgICAgICByZXMgPSBpZiByZXNwb25zZS5yZXNwb25zZUpTT04/IHRoZW4gcmVzcG9uc2UucmVzcG9uc2VKU09OIGVsc2UgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9ICc8ZGl2IGlkPVwiY29uY2x1c2lvblwiPllvdXIgc3VibWlzc2lvbiBmYWlsZWQuPC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICBnb29kID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgcmVzLm1lc3NhZ2U/XG4gICAgICAgICAgICAgICAgICAgICAgICBnb29kID0gcmVzLm1lc3NhZ2UgaXMgJ3N1Y2Nlc3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAjIHRvZG86IGN1c3RvbWl6ZSBtZXNzYWdlc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZ29vZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAnPGRpdiBpZD1cImNvbmNsdXNpb25cIj5UaGFuayB5b3UuICBXZSBoYXZlIHJlY2VpdmVkIHlvdXIgcmVxdWVzdCwgYW5kIHdpbGwgcmVwbHkgdG8geW91IHNob3J0bHkuPC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgc2VydmVyIHNpZGUgdmFsaWRhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHJlcy5lcnJvcj8gYW5kIHJlcy5lcnJvci5lcnJvcnM/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAnPHVsIGlkPVwiY29uY2x1c2lvblwiPidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQuZWFjaCByZXMuZXJyb3IuZXJyb3JzLCAoaSwgb2JqKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSAnPGxpPicgKyBvYmoubWVzc2FnZSArICc8L2xpPidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlICs9ICc8L3VsPidcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgY2xzID0gaWYgZ29vZCB0aGVuICdzdWNjZXNzJyBlbHNlICdmYWlsdXJlJ1xuICAgICAgICAgICAgICAgICAgICAkKHZhbGlkYXRpb24uY29udGFpbmVyKS5yZW1vdmVDbGFzcygnc3VjY2VzcyBmYWlsdXJlJykuYWRkQ2xhc3MoY2xzKS5odG1sKG1lc3NhZ2UpXG5cbiAgICAgICAgICAgICAgICAgICAgJCh2YWxpZGF0aW9uLmNvbnRhaW5lcikuc3RvcCgpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAkKHZhbGlkYXRpb24uY29udGFpbmVyKS5maW5kKCcjY29uY2x1c2lvbicpLmhlaWdodCgpXG4gICAgICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgZ29vZFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LmNsZWFyRm9ybSgpXG5cbiAgICBjbGVhckZvcm06IC0+XG5cbiAgICAgICAgJGZvcm0gPSBAJGVsXG4gICAgICAgIFxuICAgICAgICAjcmFkaW9zXG4gICAgICAgIHJhZGlvcyA9ICRmb3JtLmZpbmQgJy5yYWRpb3MnXG4gICAgICAgIHJhZGlvcy5yZW1vdmVDbGFzcygnaW52YWxpZCcpXG4gICAgICAgICQuZWFjaCByYWRpb3MsICh4LCByKSA9PlxuICAgICAgICAgICAgJChyYWRpb3MpLmZpbmQoJ2lucHV0OnJhZGlvJykucmVtb3ZlQXR0cihcImNoZWNrZWRcIilcbiAgICAgICAgXG4gICAgICAgICMgaW5wdXRzXG4gICAgICAgIGlucHV0cyA9ICRmb3JtLmZpbmQgJ2lucHV0Om5vdChbdHlwZT1yYWRpb10pLCB0ZXh0YXJlYSdcbiAgICAgICAgaW5wdXRzLnJlbW92ZUNsYXNzKCdpbnZhbGlkJykucGFyZW50cygnLmlucHV0JykucmVtb3ZlQ2xhc3MoJ2ludmFsaWQnKVxuICAgICAgICAkLmVhY2ggaW5wdXRzLCAoaSwgdCkgPT5cbiAgICAgICAgICAgICQodCkudmFsKCcnKVxuXG4gICAgICAgICMgZHJvcGRvd25saXN0c1xuICAgICAgICBpZiB3aW5kb3cuZGRscz9cbiAgICAgICAgICAgICQuZWFjaCB3aW5kb3cuZGRscywgKGksIGQpID0+XG4gICAgICAgICAgICAgICAgZC5jbGVhclNlbGVjdGlvbigpXG4gICAgICAgICAgICAgICAgXG4gICAgYWRkRXZlbnRzOiAtPlxuICAgICAgICBzdWJtaXR0ZXIgPSAgQCRlbC5kYXRhKCdzdWJtaXR0ZXInKVxuICAgICAgICB0aGF0ID0gQFxuICAgICAgICAkKCcjJyArIHN1Ym1pdHRlcikub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgICAgICAgICB0aGF0LnN1Ym1pdEZvcm0gZSwgdGhhdFxuXG4gICAgICAgICMgdGV4dCBpbnB1dHMgXG4gICAgICAgIEAkZWwuZmluZCgnaW5wdXQ6bm90KFt0eXBlPXJhZGlvXSksIHRleHRhcmVhJykub24gJ2JsdXInLCAoZSkgLT5cbiAgICAgICAgICAgIGlmICQoQCkucGFyZW50cygnLmlucHV0JykuaGFzQ2xhc3MoJ2ludmFsaWQnKSBvciAkKEApLmhhc0NsYXNzKCdpbnZhbGlkJylcbiAgICAgICAgICAgICAgICB0aGF0LnZhbGlkYXRlKClcblxuICAgICAgICAjIHJhZGlvIGJ1dHRvbnNcbiAgICAgICAgQCRlbC5maW5kKCdpbnB1dDpyYWRpbycpLm9uICdjbGljaycsIChlKSAtPlxuICAgICAgICAgICAgaWYgJChAKS5wYXJlbnRzKCcucmFkaW9zJykuaGFzQ2xhc3MoJ2ludmFsaWQnKVxuICAgICAgICAgICAgICAgIHRoYXQudmFsaWRhdGUoKVxuXG4gICAgICAgICMgZHJvcCBkb3duIGxpc3RzXG4gICAgICAgIGlmIHdpbmRvdy5kZGxzP1xuICAgICAgICAgICAgJC5lYWNoIHdpbmRvdy5kZGxzLCAoaSwgZCkgPT4gXG4gICAgICAgICAgICAgICAgaWYgKGQucmVxdWlyZWQpIFxuICAgICAgICAgICAgICAgICAgICBoaWRkZW5GaWVsZCA9IGQuaW5wdXRbMF1cbiAgICAgICAgICAgICAgICAgICAgJChoaWRkZW5GaWVsZCkub24gJ2NoYW5nZScsIChlKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC52YWxpZGF0ZSgpXG4gICAgICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEZvcm1IYW5kbGVyXG4iLCJnbG9iYWxzID0gcmVxdWlyZSAnLi4vZ2xvYmFsL2luZGV4LmNvZmZlZSdcblBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblxuY2xhc3MgSGVhZGVyQW5pbWF0aW9uIGV4dGVuZHMgUGx1Z2luQmFzZVxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICBcbiAgICAgICAgQGJvZHkgPSAkKFwiYm9keVwiKVxuICAgICAgICBAaHRtbCA9ICQoXCJodG1sXCIpXG4gICAgICAgIEBjb250ZW50ID0gJChcIiNjb250ZW50XCIpXG4gICAgICAgIEBtb2JuYXYgPSAkKFwiI21vYmlsZS1oZWFkZXItbmF2XCIpXG4gICAgICAgIEBzdWJuYXYgPSAkKFwiLnN1Ym5hdlwiKVxuICAgICAgICBAc3VibmF2U2hvd2luZyA9IGZhbHNlXG4gICAgICAgIEBvdXJQYXJrc0xlZnQgPSAkKCcubmF2LWxpc3QgYVtkYXRhLXBhZ2U9XCJvdXItcGFya3NcIl0nKS5vZmZzZXQoKS5sZWZ0XG4gICAgICAgIEBwYXJ0bmVyc2hpcExlZnQgPSAkKCcubmF2LWxpc3QgYVtkYXRhLXBhZ2U9XCJwYXJ0bmVyc2hpcHNcIl0nKS5vZmZzZXQoKS5sZWZ0XG4gICAgICAgIFxuXG4gICAgICAgIHN1cGVyKG9wdHMpICBcblxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgc3VwZXIoKSAgICBcbiAgICAgICAgQHNob3dJbml0aWFsU3ViTmF2KCkgICAgICAgIFxuXG4gICAgYWRkRXZlbnRzOiAtPlxuICAgICAgICBpZiAhJCgnaHRtbCcpLmhhc0NsYXNzICd0YWJsZXQnXG4gICAgICAgICAgICAkKCcubmF2LWxpc3QgYSBsaScpLm9uICdtb3VzZWVudGVyJywgQGhhbmRsZU5hdkhvdmVyXG4gICAgICAgICAgICAkKCdoZWFkZXInKS5vbiAnbW91c2VsZWF2ZScsIEBoaWRlU3ViTmF2XG4gICAgICAgIFxuICAgICAgICB3aW5kb3cub25yZXNpemUgPSBAaGFuZGxlUmVzaXplXG4gICAgICAgIEBib2R5LmZpbmQoXCIjbmF2YmFyLW1lbnVcIikub24gJ2NsaWNrJywgQHRvZ2dsZU5hdlxuICAgICAgICAkKCcjbW9iaWxlLWhlYWRlci1uYXYgYScpLm9uICdjbGljaycsIEBzaG93TW9iaWxlU3ViTmF2XG4gICAgICAgICQoJyNtb2JpbGUtaGVhZGVyLW5hdiBpJykub24gJ2NsaWNrJywgQGhhbmRsZUFycm93Q2xpY2tcbiAgICAgICAgXG4gICAgICAgIEBib2R5LmZpbmQoJy50b2dnbGUtbmF2Jykub24gJ2NsaWNrJywgKCkgLT5cbiAgICAgICAgICAgICQoQCkucGFyZW50cygnaGVhZGVyJykuZmluZCgnI25hdmJhci1tZW51IGltZycpLnRyaWdnZXIoJ2NsaWNrJylcbiAgICAgICAgICAgIFxuICAgICAgICAkKCcjbW9iaWxlLWhlYWRlci1uYXYnKS5vbiAnY2xpY2snLCAnLm1vYmlsZS1zdWItbmF2IGxpJywgQG9uQ2xpY2tNb2JpbGVTdWJOYXZMaW5rXG4gICAgICAgIFxuICAgIFxuICAgIGhhbmRsZVN1Yk5hdjogPT5cbiAgICAgICAgc3RhcnRQYWdlID0gJCgnLnN1Ym5hdicpLmRhdGEgJ3BhZ2UnXG4gICAgICAgIGlkID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlLXNob3J0PVwiJyArIHN0YXJ0UGFnZSArICdcIl0nKS5kYXRhICdwYWdlJ1xuICAgICAgICBAc2hvd1N1Yk5hdkxpbmtzKGlkKVxuICAgICAgICBcbiAgICBzaG93SW5pdGlhbFN1Yk5hdjogPT5cbiAgICAgICAgc2VjdGlvbiA9ICQoJy5zdWJuYXYnKS5kYXRhICdwYWdlJ1xuICAgICAgICBcbiAgICAgICAgaWYgc2VjdGlvbiA9PSAnb2ZmZXJpbmdzJyB8fCBzZWN0aW9uID09ICdhY2NvbW1vZGF0aW9ucycgfHwgc2VjdGlvbiA9PSAnb3VycGFya3MnXG4gICAgICAgICAgICBAc2hvd1N1Yk5hdkxpbmtzKCdvdXItcGFya3MnKVxuICAgICAgICBlbHNlIGlmIHNlY3Rpb24gPT0gJ3BhcnRuZXJzaGlwLWRldGFpbHMnIHx8IHNlY3Rpb24gPT0gJ3BhcnRuZXJzaGlwJ1xuICAgICAgICAgICAgQHNob3dTdWJOYXZMaW5rcygncGFydG5lcnNoaXBzJylcbiAgICAgICAgXG4gICAgdG9nZ2xlTmF2OiAoZSkgPT5cbiAgICAgICAgICAgICAgICBcbiAgICBoYW5kbGVSZXNpemU6ID0+XG4gICAgICAgIEBoYW5kbGVTdWJOYXYoKVxuICAgICAgICBAYWRqdXN0TW9iaWxlTmF2KClcbiAgICAgICAgXG4gICAgICAgIFxuICAgIHBvc2l0aW9uU3ViTmF2TGlzdHM6ID0+XG4gICAgICAgICNjb25zb2xlLmxvZyAncG9zaXRpb25TdWJOYXZMaXN0cydcbiMgICAgICAgIG91clBhcmtzTGVmdCA9ICQoJy5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cIm91ci1wYXJrc1wiXScpLm9mZnNldCgpLmxlZnRcbiMgICAgICAgIHBhcnRuZXJzaGlwTGVmdCA9ICQoJy5uYXYtbGlzdCBhW2RhdGEtcGFnZT1cInBhcnRuZXJzaGlwc1wiXScpLm9mZnNldCgpLmxlZnQgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmICQoJyNoZWFkZXItdG9wJykuaGFzQ2xhc3MgJ3NtYWxsJ1xuICAgICAgICAgICAgaWYgd2luZG93LmlubmVyV2lkdGggPCA5OTNcbiAgICAgICAgICAgICAgICAkKCcjb3VyLXBhcmtzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQG91clBhcmtzTGVmdCAtIDkwKVxuICAgICAgICAgICAgICAgICQoJyNwYXJ0bmVyc2hpcHMtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAcGFydG5lcnNoaXBMZWZ0IC0gMTMzKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAb3VyUGFya3NMZWZ0IC0gOTApXG4gICAgICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBwYXJ0bmVyc2hpcExlZnQgLSAxMTgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIHdpbmRvdy5pbm5lcldpZHRoIDwgOTkzXG4gICAgICAgICAgICAgICAgJCgnI291ci1wYXJrcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBvdXJQYXJrc0xlZnQgLSA2MClcbiAgICAgICAgICAgICAgICAkKCcjcGFydG5lcnNoaXBzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQHBhcnRuZXJzaGlwTGVmdCAtIDEwNSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAkKCcjb3VyLXBhcmtzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQG91clBhcmtzTGVmdCAtIDYwKVxuICAgICAgICAgICAgICAgICQoJyNwYXJ0bmVyc2hpcHMtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAcGFydG5lcnNoaXBMZWZ0IC0gOTApXG5cbiAgICBhbmltYXRlSGVhZGVyOiAoc2Nyb2xsWSkgPT5cbiAgICAgICAgaWYgQGh0bWwuaGFzQ2xhc3MgJ3Bob25lJ1xuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgJGh0ID0gQCRlbC5maW5kKCcjaGVhZGVyLXRvcCcpXG4gICAgICAgICRoYiA9IEAkZWwuZmluZCgnI2hlYWRlci1ib3R0b20nKSBcblxuICAgICAgICBpZiBzY3JvbGxZID4gODUgXG4gICAgICAgICAgICBpZiAhQG5hdkNvbGxhcHNlZFxuICAgICAgICAgICAgICAgICQoJyNoZWFkZXItdG9wLCAjaGVhZGVyLWJvdHRvbSwgI25hdmJhci1sb2dvLCAubmF2LWxpc3QsICNidXksIC5oZWFkZXItY29udGFjdCwgLmhlYWRlci1zb2NpYWwnKS5hZGRDbGFzcygnc21hbGwnKVxuICAgICAgICAgICAgICAgIEBuYXZDb2xsYXBzZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uU3ViTmF2TGlzdHMoKSBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgQG5hdkNvbGxhcHNlZFxuICAgICAgICAgICAgICAgICQoJyNoZWFkZXItdG9wLCAjaGVhZGVyLWJvdHRvbSwgI25hdmJhci1sb2dvLCAubmF2LWxpc3QsICNidXksIC5oZWFkZXItY29udGFjdCwgLmhlYWRlci1zb2NpYWwnKS5yZW1vdmVDbGFzcygnc21hbGwnKVxuICAgICAgICAgICAgICAgIEBuYXZDb2xsYXBzZWQgPSBmYWxzZVxuICAgICAgICAgICAgICAgIEBoYW5kbGVTdWJOYXYoKVxuICAgICAgICAgICAgICAgIEBwb3NpdGlvblN1Yk5hdkxpc3RzKCkgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICBoYW5kbGVOYXZIb3ZlcjogKGUpID0+XG4gICAgICAgIHBhcmVudElEID0gJChlLnRhcmdldCkucGFyZW50KCkuZGF0YSgncGFnZScpXG4gICAgICAgIGlmICQoJyMnICsgcGFyZW50SUQgKyAnLXN1Ym5hdi1saXN0JykuZmluZCgnYScpLmxlbmd0aCA8IDFcbiAgICAgICAgICAgIEBoaWRlU3ViTmF2KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGhpZGVTdWJOYXZMaW5rcygpXG4gICAgICAgICAgICBAc2hvd1N1Yk5hdkxpbmtzKHBhcmVudElEKVxuICAgICAgICBcbiAgICAgICAgICAgIGlmICFAc3VibmF2U2hvd2luZ1xuICAgICAgICAgICAgICAgIEBzaG93U3ViTmF2KClcbiAgICAgICAgICAgICAgXG4gICAgc2hvd1N1Yk5hdjogPT5cbiAgICAgICAgQHN1Ym5hdi5hZGRDbGFzcygnc2hvd2luZycpXG4gICAgICAgIEBzdWJuYXZTaG93aW5nID0gdHJ1ZVxuICAgICAgICBcbiAgICBoaWRlU3ViTmF2OiA9PlxuICAgICAgICBAc3VibmF2LnJlbW92ZUNsYXNzKCdzaG93aW5nJylcbiAgICAgICAgQHN1Ym5hdlNob3dpbmcgPSBmYWxzZVxuICAgICAgICBAaGFuZGxlU3ViTmF2KClcblxuICAgIHNob3dTdWJOYXZMaW5rczogKHBhZ2UpID0+XG4gICAgICAgIGlmIHBhZ2U/XG4gICAgICAgICAgICBsZWZ0ID0gJCgnLm5hdiAubmF2LWxpc3QgYVtkYXRhLXBhZ2U9XCInICsgcGFnZSArICdcIl0nKS5wb3NpdGlvbigpLmxlZnRcbiAgICAgICAgICAgIG9mZnNldCA9IDBcbiAgICAgICAgICAgIGhlbHBlciA9IC00NSBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgd2luZG93LmlubmVyV2lkdGggPCA5OTNcbiAgICAgICAgICAgICAgICBoZWxwZXIgPSAtMjBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgI2NvbnNvbGUubG9nICdwYWdlOiAnLCBwYWdlXG4gICAgICAgICAgICAjY29uc29sZS5sb2cgJ2I6ICcsICQoJyMnICsgcGFnZSArICctc3VibmF2LWxpc3QgYScpLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0IGEnKS5sZW5ndGggPCAzXG4gICAgICAgICAgICAgICAgZm9yIGEgaW4gJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCBhJylcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gb2Zmc2V0ICsgJChhKS53aWR0aCgpXG5cbiAgICAgICAgICAgIGlmIG9mZnNldCA+IDBcbiAgICAgICAgICAgICAgICAjY29uc29sZS5sb2cgJ2EnXG4gICAgICAgICAgICAgICAgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIGxlZnQgLSAob2Zmc2V0IC8gMykpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgI2NvbnNvbGUubG9nICdiJ1xuIyAgICAgICAgICAgICAgICQoJyMnICsgcGFnZSArICctc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBsZWZ0ICsgaGVscGVyKVxuICAgICAgICAgICAgICAgIEBwb3NpdGlvblN1Yk5hdkxpc3RzKClcbiAgICAgICAgICAgICQoJyMnICsgcGFnZSArICctc3VibmF2LWxpc3QnKS5hZGRDbGFzcygnc2hvd2luZycpXG4gICAgXG4gICAgaGlkZVN1Yk5hdkxpbmtzOiA9PlxuICAgICAgICAkKCcuc3VibmF2LWxpc3QgbGknKS5yZW1vdmVDbGFzcygnc2hvd2luZycpXG4gICAgICAgIFxuICAgIGhhbmRsZVN1Yk5hdjogPT5cbiAgICAgICAgaWYgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdvdXJwYXJrcycpIHx8ICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygnb2ZmZXJpbmdzJykgfHwgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdhY2NvbW1vZGF0aW9ucycpXG4gICAgICAgICAgICAkKCd1bC5zdWJuYXYtbGlzdCBsaScpLnJlbW92ZUNsYXNzICdzaG93aW5nJ1xuICAgICAgICAgICAgJCgnI291ci1wYXJrcy1zdWJuYXYtbGlzdCcpLmFkZENsYXNzICdzaG93aW5nJ1xuICAgICAgICAgICAgQHNob3dTdWJOYXZMaW5rcygnb3VyLXBhcmtzJylcblxuICAgICAgICAgICAgaWYgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdvZmZlcmluZ3MnKVxuICAgICAgICAgICAgICAgICQoJ2Ejb3VyLXBhcmtzLW9mZmVyaW5ncy1zdWJuYXYtbGluaycpLmFkZENsYXNzICdzZWxlY3RlZCdcblxuICAgICAgICAgICAgaWYgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdhY2NvbW1vZGF0aW9ucycpXG4gICAgICAgICAgICAgICAgJCgnYSNvdXItcGFya3MtYWNjb21tb2RhdGlvbnMtc3VibmF2LWxpbmsnKS5hZGRDbGFzcyAnc2VsZWN0ZWQnXG5cblxuICAgICAgICBlbHNlIGlmICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygncGFydG5lcnNoaXAnKSB8fCAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ3BhcnRuZXJzaGlwLWRldGFpbHMnKVxuICAgICAgICAgICAgJCgndWwuc3VibmF2LWxpc3QgbGknKS5yZW1vdmVDbGFzcyAnc2hvd2luZydcbiAgICAgICAgICAgICQoJyNwYXJ0bmVyc2hpcHMtc3VibmF2LWxpc3QnKS5hZGRDbGFzcyAnc2hvd2luZydcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MoJ3BhcnRuZXJzaGlwcycpXG5cbiMgICAgICAgICAgICBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ3BhcnRuZXJzaGlwLWRldGFpbHMnKVxuIyAgICAgICAgICAgICAgICAkKCdhI3BhcnRuZXJzaGlwLWRldGFpbHMtc3VibmF2LWxpbmsnKS5hZGRDbGFzcyAnc2VsZWN0ZWQnXG5cblxuIz09PT09PT09PT09PT09PT09PT0jPT09PT09PT09PT09PT09PT09PSM9PT09PT09PT09PT09PT09PT09I1xuIz09PT09PT09PT09PT09PT09PT0gIE1PQklMRSBTVEFSVFMgSEVSRSA9PT09PT09PT09PT09PT09PT0jXG4jPT09PT09PT09PT09PT09PT09PSM9PT09PT09PT09PT09PT09PT09Iz09PT09PT09PT09PT09PT09PT0jIFxuXG4gICAgdG9nZ2xlTmF2OiAoZSkgPT5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICR0ID0gJChlLnRhcmdldClcbiAgICAgICAgJGhiID0gJCgnI2hlYWRlci1ib3R0b20nKVxuICAgICAgICAkbW4gPSAkKCcjbW9iaWxlLWhlYWRlci1uYXYnKVxuICAgICAgICAkaGggPSAkaGIuaGVpZ2h0KClcblxuICAgICAgICAkdC50b2dnbGVDbGFzcygnY2xvc2VkJylcblxuICAgICAgICBjb25zb2xlLmxvZyAnc2Vjb25kIHRvZ2dsZSdcbiAgICAgICAgY29uc29sZS5sb2cgJHRcbiAgICAgICAgXG4gICAgICAgIGlmICR0Lmhhc0NsYXNzKCdjbG9zZWQnKVxuICAgICAgICAgICAgQGFkanVzdE1vYmlsZU5hdigpXG4gICAgICAgICAgICBUd2Vlbk1heC50byBAbW9ibmF2LCAuMzUsIFxuICAgICAgICAgICAgICAgIHt5OiAoODAwICsgJGhoKVxuICAgICAgICAgICAgICAgICx6OiAwXG4gICAgICAgICAgICAgICAgLGVhc2U6IFBvd2VyMS5lYXNlT3V0XG4gICAgICAgICAgICAgICAgLG9uQ29tcGxldGU6ID0+XG4gICAgICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnNldCBAbW9ibmF2LFxuICAgICAgICAgICAgICAgICAgICAgICAgejogMTBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFR3ZWVuTWF4LnNldCBAbW9ibmF2LFxuICAgICAgICAgICAgICAgIHo6IC0yIFxuICAgICAgICAgICAgVHdlZW5NYXgudG8gQG1vYm5hdiwgLjUsIHt5OiAwLCB6OiAwLCBlYXNlOiBQb3dlcjEuZWFzZUlufVxuICAgICAgICAgICAgJCgnLm1vYmlsZS1zdWItbmF2JykuY3NzKCdoZWlnaHQnLCAnMHB4JylcbiAgICAgICAgICAgIEBhZGp1c3RNb2JpbGVOYXZcbiAgICAgICAgICAgIEBoaWRlTW9iaWxlU3ViTmF2KClcbiAgICAgICAgICAgIFR3ZWVuTWF4LnNldCBAY29udGVudCAsXG4gICAgICAgICAgICAgICAgeTogMFxuXG4gICAgYWRqdXN0TW9iaWxlTmF2OiA9PlxuICAgICAgICAkaGIgPSAkKCcjaGVhZGVyLWJvdHRvbScpXG4gICAgICAgICRtbiA9ICQoJyNtb2JpbGUtaGVhZGVyLW5hdicpXG4gICAgICAgICMgU2V0IG5hdiBoZWlnaHQgdG8gMzUwcHggZXZlcnkgdGltZSBiZWZvcmUgYWRqdXN0aW5nXG4gICAgICAgICMkbW4uY3NzIHtoZWlnaHQ6IDM1MH1cbiAgICAgICAgJGhoID0gJGhiLmhlaWdodCgpXG4gICAgICAgICRuaCA9ICRtbi5oZWlnaHQoKVxuICAgICAgICAkaXcgPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgICAgICAkaWggPSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgJG1iID0gJCgnI25hdmJhci1tZW51JylcblxuICAgICAgICBpZiAkbmggPiAkaWhcbiAgICAgICAgICAgICRtbi5jc3Mge2hlaWdodDogKCRpaCAtICRoaCksIG92ZXJmbG93OiAnc2Nyb2xsJ31cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgJG1uLmNzcyB7aGVpZ2h0OiA0MDAgKyAncHgnfSAgICAgICAgICAgIFxuICAgICAgICBcbiAgICBzaG93TW9iaWxlU3ViTmF2OiAoZSkgPT5cbiAgICAgICAgdGhpc1N1Yk5hdiA9ICQoZS50YXJnZXQpLnBhcmVudCgpLmZpbmQgJy5tb2JpbGUtc3ViLW5hdidcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzU3ViTmF2LmZpbmQoJ2xpJykubGVuZ3RoIDwgMSlcbiAgICAgICAgICAgIEBoaWRlTW9iaWxlU3ViTmF2KClcbiAgICAgICAgICAgICQoZS50YXJnZXQpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIGlmICEoJChlLnRhcmdldCkucGFyZW50KCkuaGFzQ2xhc3MoJ2FjdGl2ZScpKVxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICBcbiAgICAgICAgaG93TWFueSA9IHRoaXNTdWJOYXYuZmluZCgnbGknKS5sZW5ndGhcbiAgICAgICAgd2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgIHRhcmdldCA9ICQoZS50YXJnZXQpXG5cbiAgICAgICAgQGhpZGVNb2JpbGVTdWJOYXYoKVxuICAgICAgICB0YXJnZXQuZmluZCgnaScpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgIHRhcmdldC5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICB0YXJnZXQucGFyZW50cygnYScpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgIEBtb2JuYXYuY3NzKCdoZWlnaHQnLCAod2luZG93SGVpZ2h0IC0gMTAwKSArICdweCcpXG4gICAgICAgIHRoaXNTdWJOYXYuY3NzKCdoZWlnaHQnLCAoaG93TWFueSAqIDUwKSArICdweCcpXG4gICAgICAgIFxuICAgIGhpZGVNb2JpbGVTdWJOYXY6ID0+XG4gICAgICAgICQoJy5tb2JpbGUtc3ViLW5hdicpLmNzcygnaGVpZ2h0JywgJzBweCcpXG4gICAgICAgIEBtb2JuYXYuY3NzKCdoZWlnaHQnLCAnNDAwcHgnKVxuICAgICAgICBAbW9ibmF2LmZpbmQoJ2knKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICBAbW9ibmF2LmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgQG1vYm5hdi5maW5kKCd1bCBhJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcblxuICAgIFxuICAgIGhhbmRsZUFycm93Q2xpY2s6IChlKSA9PlxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBcbiAgICAgICAgaWYgJChlLnRhcmdldCkuaGFzQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgICAgIEBoaWRlTW9iaWxlU3ViTmF2KClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgJChlLnRhcmdldCkucGFyZW50cygnbGknKS50cmlnZ2VyICdjbGljaydcbiAgICAgICAgXG4gICAgICAgIFxuICAgIG9uQ2xpY2tNb2JpbGVTdWJOYXZMaW5rOiAoZSkgPT5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgXG4gICAgICAgIGlmICQoZS50YXJnZXQpLmRhdGEoJ2hyZWYnKT9cbiAgICAgICAgICAgIHVybCA9ICQoZS50YXJnZXQpLmRhdGEgJ2hyZWYnXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyQW5pbWF0aW9uXG5cblxuIiwiXG5QbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5WaWRlb092ZXJsYXkgPSByZXF1aXJlICcuL1ZpZGVvT3ZlcmxheS5jb2ZmZWUnXG5cbmNsYXNzIFBhcmtzTGlzdCBleHRlbmRzIFBsdWdpbkJhc2VcblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgQCRlbCA9ICQob3B0cy5lbClcbiAgICAgICAgc3VwZXIob3B0cykgICAgICAgICBcbiAgICAgICAgQGdhbGxlcnkgPSBvcHRzLmdhbGxlcnlcbiAgICAgICAgaWYgQGdhbGxlcnk/XG4gICAgICAgICAgICBAZ2FsbGVyeS5vbiBcIml0ZW1JbmRleFwiICwgQHNlbGVjdExvZ29cbiAgICAgICAgICAgIFxuICAgICAgICBAcGFnZSA9IG9wdHMucGFnZVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgQHBhcmtMb2dvcyA9ICQoQCRlbCkuZmluZCBcImxpXCJcbiAgICAgICAgQGN1cnJlbnRTZWxlY3RlZCA9IEBwYXJrTG9nb3MuZmlsdGVyKFwiOmZpcnN0LWNoaWxkXCIpXG4gICAgICAgIGlmIEBnYWxsZXJ5P1xuICAgICAgICAgICAgQHNlbGVjdExvZ28gQHNlbGVjdGVkTG9nbygpXG4gICAgICAgICAgICBAZ2FsbGVyeS5nb3RvIEBzZWxlY3RlZExvZ28oKSwgdHJ1ZVxuICAgICAgICBzdXBlcigpXG5cbiAgICBhZGRFdmVudHM6IC0+XG4gICAgICAgIEAkZWwub24gJ2NsaWNrJywgJ2xpLnBhcmsnLCBAaGFuZGxlTG9nb0ludGVyYWN0aW9uXG4gICAgICAgIFxuICAgICAgICBAcGFya0xvZ29zLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgIGxvZ29FdmVudHMgPSBuZXcgSGFtbWVyKHQpXG4gICAgICAgICAgICBsb2dvRXZlbnRzLm9uICd0YXAnICwgQGhhbmRsZUxvZ29JbnRlcmFjdGlvblxuXG4gICAgaGFuZGxlTG9nb0ludGVyYWN0aW9uOiAoZSkgPT5cbiAgICAgICAgaWYgQHBhZ2UgPT0gJ2FjY29tbW9kYXRpb24nXG4gICAgICAgICAgICBAcGFya0xvZ29zLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcbiAgICAgICAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoJ2xpLnBhcmsnKS5hZGRDbGFzcyAnc2VsZWN0ZWQnXG4gICAgICAgICAgICB3aGljaFBhcmsgPSAkKGUudGFyZ2V0KS5wYXJlbnRzKCdsaS5wYXJrJykuYXR0cignaWQnKVxuICAgICAgICAgICAgQHNob3dOZXdBY2NvbW1vZGF0aW9ucyh3aGljaFBhcmspXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgXG4gICAgICAgICR0YXJnZXQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdsaScpXG5cbiAgICAgICAgaWQgPSAkdGFyZ2V0LmRhdGEoJ2lkJylcbiAgICAgICAgXG4gICAgICAgIEBkaXNwbGF5Q29udGVudCBpZFxuICAgICAgICBcbiAgICAgICAgXG4gICAgc2hvd05ld0FjY29tbW9kYXRpb25zOiAocGFyaykgPT5cbiAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXInKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuY2Fyb3VzZWwtd3JhcHBlcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IC5zd2lwZXItY29udGFpbmVyW2RhdGEtbG9nbz1cIicgKyBwYXJrICsgJ1wiXScpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IC5zd2lwZXItY29udGFpbmVyW2RhdGEtbG9nbz1cIicgKyBwYXJrICsgJ1wiXScpLnBhcmVudCgpLmFkZENsYXNzICdhY3RpdmUnXG5cbiAgICBkaXNwbGF5Q29udGVudDogKGlkKSAtPlxuXG5cbiAgICAgICAgQHNlbGVjdExvZ28oaWQpXG5cbiAgICAgICAgI1N3aXRjaCBJbmZvIEJveGVzXG4gICAgICAgIEBnYWxsZXJ5LmdvdG8oaWQpXG5cblxuICAgIHNlbGVjdExvZ286IChpZCkgPT5cbiAgICAgICAgbG9nb0lkID0gXCIjI3tpZH0tbG9nb1wiXG4gICAgICAgIEBwYXJrTG9nb3MucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgQHBhcmtMb2dvcy5maWx0ZXIobG9nb0lkKS5hZGRDbGFzcygnc2VsZWN0ZWQnKVxuXG5cbiAgICBzZWxlY3RlZExvZ286IC0+XG4gICAgICAgIHJldHVybiBAcGFya0xvZ29zLnBhcmVudCgpLmZpbmQoJ2xpLnNlbGVjdGVkJykuZGF0YSgnaWQnKTtcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcmtzTGlzdFxuXG4iLCJQbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIFJlc2l6ZUJ1dHRvbnMgZXh0ZW5kcyBQbHVnaW5CYXNlXG5cbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgQHJlc2l6ZUJ1dHRvbnMoKVxuXG4gICAgcmVzaXplQnV0dG9uczogLT5cbiAgICAgICAgYyA9ICQoJyNjb250ZW50JylcbiAgICAgICAgYnRuX3dyYXBwZXJzID0gYy5maW5kICcuYnRuLXdyYXBwZXInXG5cbiAgICAgICAgZm9yIGJ0bl93cmFwcGVyIGluIGJ0bl93cmFwcGVyc1xuICAgICAgICAgICAgYnRucyA9ICQoYnRuX3dyYXBwZXIpLmZpbmQgJ2EnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGJ0bnMubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgIG1heFdpZHRoID0gMFxuICAgICAgICAgICAgICAgIHdpZGVzdFNwYW4gPSBudWxsXG5cbiAgICAgICAgICAgICAgICAkKGJ0bnMpLmVhY2ggLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgJCh0aGlzKS53aWR0aCgpID4gbWF4V2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFdpZHRoID0gJCh0aGlzKS53aWR0aCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRlc3RTcGFuID0gJCh0aGlzKVxuXG4gICAgICAgICAgICAgICAgJChidG5zKS5lYWNoIC0+XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuY3NzKHt3aWR0aDogbWF4V2lkdGggKyA2MH0pXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBSZXNpemVCdXR0b25zIiwiY2xhc3MgU3ZnSW5qZWN0XG5cbiAgICBjb25zdHJ1Y3RvcjogKHNlbGVjdG9yKSAtPlxuICAgICAgICBcbiAgICAgICAgQCRzdmdzID0gJChzZWxlY3RvcilcbiAgICAgICAgXG4gICAgICAgIEBwcmVsb2FkZXIgPSBuZXcgY3JlYXRlanMuTG9hZFF1ZXVlIHRydWUgLCBcIlwiICwgdHJ1ZVxuICAgICAgICBAcHJlbG9hZGVyLnNldE1heENvbm5lY3Rpb25zKDEwKVxuICAgICAgICBAcHJlbG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIgJ2ZpbGVsb2FkJyAsIEBvblN2Z0xvYWRlZFxuICAgICAgICBAcHJlbG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvbkxvYWRDb21wbGV0ZVxuICAgICAgICBAbWFuaWZlc3QgPSBbXVxuICAgICAgICBAY29sbGVjdFN2Z1VybHMoKVxuICAgICAgICBAbG9hZFN2Z3MoKVxuICAgICAgICBcbiAgICBjb2xsZWN0U3ZnVXJsczogLT5cbiAgICAgICAgXG4gICAgICAgIHNlbGYgPSBAXG4gICAgICAgIFxuICAgICAgICBAJHN2Z3MuZWFjaCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZCA9IFwic3ZnLWluamVjdC0je3BhcnNlSW50KE1hdGgucmFuZG9tKCkgKiAxMDAwKS50b1N0cmluZygpfVwiXG4gICAgICAgICAgXG4gICAgICAgICAgICAkKEApLmF0dHIoJ2lkJywgaWQpXG4gICAgICAgICAgICAkKEApLmF0dHIoJ2RhdGEtYXJiJyAsIFwiYWJjMTIzXCIpXG4gICAgICAgICAgICBzdmdVcmwgPSAkKEApLmF0dHIoJ3NyYycpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgXG5cbiAgICAgICAgICAgIHNlbGYubWFuaWZlc3QucHVzaCBcbiAgICAgICAgICAgICAgICBpZDppZFxuICAgICAgICAgICAgICAgIHNyYzpzdmdVcmxcbiAgICAgICAgICAgICAgICBcbiAgICBsb2FkU3ZnczogLT5cbiAgICAgICAgXG4gICAgICAgIEBwcmVsb2FkZXIubG9hZE1hbmlmZXN0KEBtYW5pZmVzdClcbiAgICAgICAgICAgICAgICBcbiAgICBcbiAgICBpbmplY3RTdmc6IChpZCxzdmdEYXRhKSAtPlxuICAgICAgICBcbiAgICAgICAgJGVsID0gJChcIiMje2lkfVwiKSAgICBcbiBcbiBcbiAgICAgICAgaW1nSUQgPSAkZWwuYXR0cignaWQnKVxuICAgICAgICBpbWdDbGFzcyA9ICRlbC5hdHRyKCdjbGFzcycpXG4gICAgICAgIGltZ0RhdGEgPSAkZWwuY2xvbmUodHJ1ZSkuZGF0YSgpIG9yIFtdXG4gICAgICAgIGRpbWVuc2lvbnMgPSBcbiAgICAgICAgICAgIHc6ICRlbC5hdHRyKCd3aWR0aCcpXG4gICAgICAgICAgICBoOiAkZWwuYXR0cignaGVpZ2h0JylcblxuICAgICAgICBzdmcgPSAkKHN2Z0RhdGEpLmZpbHRlcignc3ZnJylcbiAgICAgICAgXG5cbiAgICAgICAgc3ZnID0gc3ZnLmF0dHIoXCJpZFwiLCBpbWdJRCkgIGlmIHR5cGVvZiBpbWdJRCBpc250ICd1bmRlZmluZWQnXG4gICAgICAgIGlmIHR5cGVvZiBpbWdDbGFzcyBpc250ICd1bmRlZmluZWQnXG4gICAgICAgICAgICBjbHMgPSAoaWYgKHN2Zy5hdHRyKFwiY2xhc3NcIikgaXNudCAndW5kZWZpbmVkJykgdGhlbiBzdmcuYXR0cihcImNsYXNzXCIpIGVsc2UgXCJcIilcbiAgICAgICAgICAgIHN2ZyA9IHN2Zy5hdHRyKFwiY2xhc3NcIiwgaW1nQ2xhc3MgKyBcIiBcIiArIGNscyArIFwiIHJlcGxhY2VkLXN2Z1wiKVxuICAgICAgICBcbiAgICAgICAgIyBjb3B5IGFsbCB0aGUgZGF0YSBlbGVtZW50cyBmcm9tIHRoZSBpbWcgdG8gdGhlIHN2Z1xuICAgICAgICAkLmVhY2ggaW1nRGF0YSwgKG5hbWUsIHZhbHVlKSAtPiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgc3ZnWzBdLnNldEF0dHJpYnV0ZSBcImRhdGEtXCIgKyBuYW1lLCB2YWx1ZVxuICAgICAgICAgICAgcmV0dXJuICAgICAgICBcbiAgICAgICAgc3ZnID0gc3ZnLnJlbW92ZUF0dHIoXCJ4bWxuczphXCIpXG4gICAgICAgIFxuICAgICAgICAjR2V0IG9yaWdpbmFsIGRpbWVuc2lvbnMgb2YgU1ZHIGZpbGUgdG8gdXNlIGFzIGZvdW5kYXRpb24gZm9yIHNjYWxpbmcgYmFzZWQgb24gaW1nIHRhZyBkaW1lbnNpb25zXG4gICAgICAgIG93ID0gcGFyc2VGbG9hdChzdmcuYXR0cihcIndpZHRoXCIpKVxuICAgICAgICBvaCA9IHBhcnNlRmxvYXQoc3ZnLmF0dHIoXCJoZWlnaHRcIikpXG4gICAgICAgIFxuICAgICAgICAjU2NhbGUgYWJzb2x1dGVseSBpZiBib3RoIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlcyBleGlzdFxuICAgICAgICBpZiBkaW1lbnNpb25zLncgYW5kIGRpbWVuc2lvbnMuaFxuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJ3aWR0aFwiLCBkaW1lbnNpb25zLndcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwiaGVpZ2h0XCIsIGRpbWVuc2lvbnMuaFxuICAgICAgICBcbiAgICAgICAgI1NjYWxlIHByb3BvcnRpb25hbGx5IGJhc2VkIG9uIHdpZHRoXG4gICAgICAgIGVsc2UgaWYgZGltZW5zaW9ucy53XG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcIndpZHRoXCIsIGRpbWVuc2lvbnMud1xuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJoZWlnaHRcIiwgKG9oIC8gb3cpICogZGltZW5zaW9ucy53XG4gICAgICAgIFxuICAgICAgICAjU2NhbGUgcHJvcG9ydGlvbmFsbHkgYmFzZWQgb24gaGVpZ2h0XG4gICAgICAgIGVsc2UgaWYgZGltZW5zaW9ucy5oXG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcImhlaWdodFwiLCBkaW1lbnNpb25zLmhcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwid2lkdGhcIiwgKG93IC8gb2gpICogZGltZW5zaW9ucy5oXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgJGVsLnJlcGxhY2VXaXRoIHN2Z1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIG9uU3ZnTG9hZGVkOiAoZSkgPT5cbiAgICAgICAgXG4gICAgICAgIEBpbmplY3RTdmcoZS5pdGVtLmlkLCBlLnJhd1Jlc3VsdClcbiAgICBcbiAgICBvbkxvYWRDb21wbGV0ZTogKGUpID0+XG4gICAgXG4gICAgXG4gICAgXG4gICAgXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IFN2Z0luamVjdCAiLCJcblxuY2xhc3MgVmlkZW9PdmVybGF5XG5cblxuXG4gICAgY29uc3RydWN0b3I6IChlbCkgLT5cbiAgICAgICAgQCRlbCA9ICQoZWwpXG4gICAgICAgIEAkaW5uZXIgPSBAJGVsLmZpbmQoXCIub3ZlcmxheS1pbm5lclwiKVxuICAgICAgICBAJGNvbnRhaW5lciA9IEAkZWwuZmluZChcIi5vdmVybGF5LWlubmVyLWNvbnRhaW5lclwiKVxuICAgICAgICBcbiAgICAgICAgaWYgKEAkY29udGFpbmVyLmZpbmQoJy5vdmVybGF5LWNvbnRlbnQnKS5zaXplKCkgaXMgMSkgXG4gICAgICAgICAgICBAJGNvbnRhaW5lciA9IEAkY29udGFpbmVyLmZpbmQoJy5vdmVybGF5LWNvbnRlbnQnKVxuICAgICAgICAgICAgXG4gICAgICAgIEAkY2xvc2UgPSBAJGVsLmZpbmQoXCIub3ZlcmxheS1jbG9zZVwiKVxuICAgICAgICBcblxuICAgICAgICBAY3JlYXRlVmlkZW9JbnN0YW5jZSgpXG4gICAgICAgIEBjcmVhdGVPdmVybGF5VHJhbnNpdGlvbigpXG4gICAgICAgIEBhZGRFdmVudHMoKVxuXG5cblxuICAgIGNyZWF0ZU92ZXJsYXlUcmFuc2l0aW9uOiAtPlxuICAgICAgICBAdGwgPSBuZXcgVGltZWxpbmVNYXhcblxuICAgICAgICBAJGVsLnNob3coKVxuXG4gICAgICAgIEB0bC5hZGQgVHdlZW5NYXguZnJvbVRvICQoJyNvdmVybGF5JyksIC4wMSxcbiAgICAgICAgICAgIHt6SW5kZXg6IC0xLCBkaXNwbGF5Oidub25lJywgejogMH0sIHt6SW5kZXg6IDUwMDAsIGRpc3BsYXk6J2Jsb2NrJywgejogOTk5OTk5OTk5OX1cbiAgICAgICAgXG4gICAgICAgIEB0bC5hZGQgVHdlZW5NYXgudG8gQCRlbCAsIC4zNSAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MVxuXG4gICAgICAgIEB0bC5hZGQgVHdlZW5NYXgudG8gQCRpbm5lciAsIC41NSAsXG4gICAgICAgICAgICBhbHBoYToxXG5cbiAgICAgICAgQHRsLmFkZCBUd2Vlbk1heC50byBAJGNsb3NlICwgLjI1ICxcbiAgICAgICAgICAgIGFscGhhOjFcbiAgICAgICAgLFxuICAgICAgICAgICAgXCItPS4xNVwiXG5cbiAgICAgICAgQHRsLmFkZExhYmVsKFwiaW5pdENvbnRlbnRcIilcblxuICAgICAgICBAdGwuc3RvcCgpXG5cbiAgICBjcmVhdGVWaWRlb0luc3RhbmNlOiAoKSAtPlxuXG5cblxuICAgIGFkZEV2ZW50czogLT5cbiAgICAgICAgQGNsb3NlRXZlbnQgPSBuZXcgSGFtbWVyKEAkY2xvc2VbMF0pXG5cblxuXG4gICAgdHJhbnNpdGlvbkluT3ZlcmxheTogKG5leHQpIC0+XG4gICAgICAgIGNvbnNvbGUubG9nICd0cmFuc2l0aW9uSW5PdmVybGF5J1xuICAgICAgICBAdHJhbnNJbkNiID0gbmV4dFxuICAgICAgICBAdGwuYWRkQ2FsbGJhY2soQHRyYW5zSW5DYiwgXCJpbml0Q29udGVudFwiKVxuICAgICAgICBAdGwucGxheSgpXG4gICAgICAgIEBjbG9zZUV2ZW50Lm9uICd0YXAnICwgQGNsb3NlT3ZlcmxheVxuXG4gICAgdHJhbnNpdGlvbk91dE92ZXJsYXk6IC0+XG4gICAgICAgIGNvbnNvbGUubG9nICd0cmFuc2l0aW9uT3V0T3ZlcmxheSdcbiAgICAgICAgQGNsb3NlRXZlbnQub2ZmICd0YXAnICwgQGNsb3NlT3ZlcmxheVxuICAgICAgICBAdGwucmVtb3ZlQ2FsbGJhY2soQHRyYW5zSW5DYilcbiAgICAgICAgQHRsLnJldmVyc2UoKVxuICAgICAgICBkZWxldGUgQHRyYW5zSW5DYlxuXG5cbiAgICBjbG9zZU92ZXJsYXk6IChlKSA9PlxuICAgICAgICBAcmVtb3ZlVmlkZW8oKVxuICAgICAgICBAdHJhbnNpdGlvbk91dE92ZXJsYXkoKVxuXG5cbiAgICByZW1vdmVWaWRlbzogKCkgLT5cbiAgICAgICAgaWYgQHZpZGVvSW5zdGFuY2VcbiAgICAgICAgICAgIEB2aWRlb0luc3RhbmNlLnBhdXNlKClcbiAgICAgICAgICAgIEB2aWRlb0luc3RhbmNlLmN1cnJlbnRUaW1lKDApXG4gICAgICAgICAgICAjQHZpZGVvSW5zdGFuY2UuZGlzcG9zZSgpXG5cbiAgICByZXNpemVPdmVybGF5OiAoKSAtPlxuICAgICAgICAkdmlkID0gQCRlbC5maW5kKCd2aWRlbycpXG4gICAgICAgICR3ID0gd2luZG93LmlubmVyV2lkdGhcbiAgICAgICAgJGggPSAkdmlkLmhlaWdodCgpXG5cbiAgICAgICAgIyBAJGlubmVyLmNzcyB7d2lkdGg6ICR3LCBoZWlnaHQ6ICRofVxuICAgICAgICAjICR2aWQuY3NzIHtoZWlnaHQ6IDEwMCArICclJywgd2lkdGg6IDEwMCArICclJ31cblxuICAgIGFwcGVuZERhdGE6IChkYXRhKSAtPlxuICAgICAgICBpZiBkYXRhLm1wNCA9PSBcIlwiIG9yICEgZGF0YS5tcDQ/XG4gICAgICAgICAgICBjb25zb2xlLmxvZyAnbm8gdmlkZW8sIGl0cyBhbiBpbWFnZSdcbiAgICAgICAgICAgIEBwb3N0ZXIgPSAkKFwiPGRpdiBjbGFzcz0ndmlkZW8tanMnPjxpbWcgY2xhc3M9J3Zqcy10ZWNoJyBzcmM9J1wiICsgZGF0YS5wb3N0ZXIgKyBcIicgY2xhc3M9J21lZGlhLWltYWdlLXBvc3RlcicgLz48L2Rpdj5cIilcbiAgICAgICAgICAgIEAkY29udGFpbmVyLmh0bWwgQHBvc3RlclxuICAgICAgICAgICAgQHBvc3Rlci5jc3MgJ2hlaWdodCcsICcxMDAlJ1xuICAgICAgICAgICAgQHJlbW92ZVZpZGVvKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICAgIG1wNCA9ICQoXCI8c291cmNlIHNyYz1cXFwiI3tkYXRhLm1wNH1cXFwiIHR5cGU9XFxcInZpZGVvL21wNFxcXCIgLz4gXCIpXG4gICAgICAgIHdlYm0gPSAkKFwiPHNvdXJjZSBzcmM9XFxcIiN7ZGF0YS53ZWJtfVxcXCIgdHlwZT1cXFwidmlkZW8vd2VibVxcXCIgLz4gXCIpXG5cbiAgICAgICAgQCR2aWRlb0VsID0gJChcIjx2aWRlbyBpZD0nb3ZlcmxheS1wbGF5ZXInIGNsYXNzPSd2anMtZGVmYXVsdC1za2luIHZpZGVvLWpzJyBjb250cm9scyBwcmVsb2FkPSdhdXRvJyAvPlwiKVxuICAgICAgICBAJHZpZGVvRWwuYXBwZW5kKG1wNClcbiAgICAgICAgQCR2aWRlb0VsLmFwcGVuZCh3ZWJtKVxuICAgICAgICBAJGNvbnRhaW5lci5odG1sIEAkdmlkZW9FbFxuXG4gICAgICAgIGlmIEB2aWRlb0luc3RhbmNlP1xuICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UuZGlzcG9zZSgpXG4gICAgICAgIEB2aWRlb0luc3RhbmNlID0gdmlkZW9qcyBcIm92ZXJsYXktcGxheWVyXCIgICxcbiAgICAgICAgICAgIHdpZHRoOlwiMTAwJVwiXG4gICAgICAgICAgICBoZWlnaHQ6XCIxMDAlXCJcblxuXG5cblxuICAgIHBsYXlWaWRlbzogKCkgPT5cbiMgICAgICAgIGlmKCEkKFwiaHRtbFwiKS5oYXNDbGFzcygnbW9iaWxlJykpXG4jICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UucGxheSgpXG4gICAgICAgIGlmIEB2aWRlb0luc3RhbmNlP1xuICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UucGxheSgpXG4gICAgICAgICAgICBcbiAgICBzaG93SW1hZ2U6ICgpID0+XG4gICAgICAgIGNvbnNvbGUubG9nICdzaG93SW1hZ2UnXG5cblxuXG5vdmVybGF5ID0gbmV3IFZpZGVvT3ZlcmxheSBcIiNvdmVybGF5XCJcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cy5pbml0VmlkZW9PdmVybGF5ID0gKGRhdGEpIC0+XG4gICAgY29uc29sZS5sb2cgJ2RhdGEyOiAnLCBkYXRhXG4gICAgb3ZlcmxheS5hcHBlbmREYXRhKGRhdGEpXG5cblxuICAgIGlmICEoZGF0YS5tcDQgPT0gXCJcIilcbiAgICAgICAgY29uc29sZS5sb2cgJ2RhdGEubXA0ICE9PSBcIlwiJ1xuICAgICAgICBvdmVybGF5LnRyYW5zaXRpb25Jbk92ZXJsYXkob3ZlcmxheS5wbGF5VmlkZW8pXG4gICAgZWxzZVxuICAgICAgICBjb25zb2xlLmxvZyAnZGF0YS5tcDQgPT09IFwiXCInXG4gICAgICAgIG92ZXJsYXkudHJhbnNpdGlvbkluT3ZlcmxheShvdmVybGF5LnNob3dJbWFnZSlcblxuXG5cblxuXG5cblxuXG5cblxuXG4iLCJQbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5GcmFtZXNNb2RlbCA9IHJlcXVpcmUgJy4vRnJhbWVzTW9kZWwuY29mZmVlJ1xuXG5tYXRjaEZyYW1lTnVtID0gL1xcZCsoPz1cXC5bYS16QS1aXSspL1xuXG5jbGFzcyBGcmFtZUFuaW1hdGlvbiBleHRlbmRzIFBsdWdpbkJhc2VcbiAgICBcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gICAgICAgIFxuICAgICAgICBAJGVsID0gJChvcHRzLmVsKVxuICAgICAgICBAYXN5bmMgPSBvcHRzLmFzeW5jIG9yIGZhbHNlXG4gICAgICAgIGRlcHRoPSBvcHRzLmRlcHRoIG9yIDFcbiAgICAgICAgQCRjb250YWluZXIgPSAkKFwiPGRpdiBjbGFzcz0nY29hc3Rlci1jb250YWluZXInIC8+XCIpXG4gICAgICAgIEAkY29udGFpbmVyLmF0dHIoJ2lkJyAsIG9wdHMuaWQpXG4gICAgICAgIEAkY29udGFpbmVyLmNzcygnei1pbmRleCcsIGRlcHRoKVxuICAgICAgICBUd2Vlbk1heC5zZXQgQCRjb250YWluZXIgLCBcbiAgICAgICAgICAgIHo6ZGVwdGggKiAxMFxuICAgICAgICBcbiAgICAgICAgc3VwZXIob3B0cylcbiAgICAgICAgXG4gICAgICAgIFxuICAgIFxuICAgIGluaXRpYWxpemU6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuICAgICAgICBcbiAgICAgICAgQG1vZGVsID0gbmV3IEZyYW1lc01vZGVsIG9wdHNcbiAgICAgICAgQG1vZGVsLm9uIFwiZGF0YUxvYWRlZFwiICwgQHNldHVwQ2FudmFzXG4gICAgICAgIEBtb2RlbC5vbiBcInRyYWNrTG9hZGVkXCIgLCBAb25UcmFja0xvYWRlZFxuICAgICAgICBAbW9kZWwub24gXCJmcmFtZXNMb2FkZWRcIiAsIEBvbkZyYW1lc0xvYWRlZFxuICAgICAgICBAbW9kZWwubG9hZERhdGEoKVxuICAgICAgICBcbiAgIFxuICAgICAgIFxuICAgIGxvYWRGcmFtZXM6IC0+XG4gICAgICAgIGlmIEBtb2RlbC5kYXRhP1xuICAgICAgICAgICAgQG1vZGVsLnByZWxvYWRGcmFtZXMoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZGVmZXJMb2FkaW5nID0gdHJ1ZVxuICAgICAgICBcbiAgICBcbiAgICBcbiAgICBzZXR1cENhbnZhczogPT5cbiAgICAgICAgXG5cbiAgICAgICAgQGNhbnZhc1dpZHRoID0gQG1vZGVsLmdldCgnZ2xvYmFsJykud2lkdGhcbiAgICAgICAgQGNhbnZhc0hlaWdodCA9IEBtb2RlbC5nZXQoJ2dsb2JhbCcpLmhlaWdodFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKVxuICAgICAgICBAY29udGV4dCA9IEBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICBcbiAgICAgICAgQGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJyAsIEBjYW52YXNXaWR0aClcbiAgICAgICAgQGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcgLCBAY2FudmFzSGVpZ2h0KVxuXG4gICAgICAgIFxuICAgICAgICBAJGNvbnRhaW5lci5hcHBlbmQoQGNhbnZhcylcbiAgICAgICAgQCRlbC5wcmVwZW5kKEAkY29udGFpbmVyKVxuICAgICAgICBAbW9kZWwucHJlbG9hZFRyYWNrKClcbiAgICAgICAgaWYgQGRlZmVyTG9hZGluZ1xuICAgICAgICAgICAgQG1vZGVsLnByZWxvYWRGcmFtZXMoKVxuICAgICAgXG4gICAgXG4gICAgZGlzcGxheVRyYWNrOiAtPlxuICAgICAgICBcbiAgICAgICAgQGNvbnRleHQuY2xlYXJSZWN0IDAgLCAwICwgQGNhbnZhc1dpZHRoICwgQGNhbnZhc0hlaWdodFxuICAgICAgICBAY29udGV4dC5kcmF3SW1hZ2UgQHRyYWNrSW1hZ2UudGFnICwgMCAsMCAsIEBjYW52YXNXaWR0aCAsIEBjYW52YXNIZWlnaHRcbiAgICAgICAgXG4gICAgZGlzcGxheUZyYW1lOiAobnVtKSAtPlxuICAgICAgICBcbiAgICAgICAgbWFuaWZlc3QgPSBAbW9kZWwuZ2V0KCdtYW5pZmVzdCcpXG4gICAgICAgIFxuICAgICAgICBpZiBtYW5pZmVzdC5sZW5ndGggPiBudW1cbiAgICAgICAgICAgIGFzc2V0ID0gbWFuaWZlc3RbbnVtXSBcbiAgICAgICAgICAgIGZyYW1lQXNzZXQgPSBAbW9kZWwuZ2V0QXNzZXQoYXNzZXQuZmlsZW5hbWUpXG4gICAgICAgICAgICAjIGNvbnNvbGUubG9nIGZyYW1lQXNzZXQudGFnICwgYXNzZXQueCAsIGFzc2V0LnksIGFzc2V0LndpZHRoLCBhc3NldC5oZWlnaHRcbiAgICAgICAgICAgIEBjb250ZXh0LmRyYXdJbWFnZSBmcmFtZUFzc2V0LnRhZyAsIGFzc2V0LnggLCBhc3NldC55LCBhc3NldC53aWR0aCwgYXNzZXQuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICBpbml0QW5pbWF0aW9uOiAtPlxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGZyYW1lcyA9IEBtb2RlbC5nZXQoJ21hbmlmZXN0JykubGVuZ3RoXG4gICAgICAgIHNwZWVkID0gQG1vZGVsLmdldCgnZ2xvYmFsJykuZnBzXG4gICAgICAgIGRlbGF5ID0gQG1vZGVsLmdldCgnZ2xvYmFsJykuZGVsYXkgb3IgMFxuICAgICAgICByZXBlYXREZWxheSA9IEBtb2RlbC5nZXQoJ2dsb2JhbCcpLnJlcGVhdERlbGF5IG9yIDEwXG4gICAgICAgIFxuICAgIFxuXG4gICAgICAgIGR1cmF0aW9uID0gIGZyYW1lcyAvIHNwZWVkXG5cblxuICAgICAgICBzZWxmID0gQCBcbiAgICAgICAgQGxhc3RGcmFtZU51bSA9IC0xXG4gICAgICAgIEB0aW1lbGluZSA9IHdpbmRvdy5jb2FzdGVyID0gVHdlZW5NYXgudG8gQGNhbnZhcyAsIGR1cmF0aW9uICwgXG4gICAgICAgICAgICBvblVwZGF0ZTogLT5cbiAgICAgICAgICAgICAgICBmcmFtZU51bSA9IE1hdGguZmxvb3IoZnJhbWVzICogQHByb2dyZXNzKCkpICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGZyYW1lTnVtIGlzbnQgQGxhc3RGcmFtZU51bSAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kaXNwbGF5VHJhY2soKVxuICAgICAgICAgICAgICAgICAgICBzZWxmLmRpc3BsYXlGcmFtZShmcmFtZU51bSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQGxhc3RGcmFtZU51bSA9IGZyYW1lTnVtXG4gICAgICAgICAgICByZXBlYXQ6LTFcbiAgICAgICAgICAgIHJlcGVhdERlbGF5OiByZXBlYXREZWxheVxuICAgICAgICAgICAgZGVsYXk6ZGVsYXlcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG5cbiAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgXG4gICAgb25UcmFja0xvYWRlZDogPT5cblxuICAgICAgICBAdHJhY2tJbWFnZSA9IEBtb2RlbC5nZXRBc3NldCgndHJhY2snKVxuICAgICAgICBAZGlzcGxheVRyYWNrKClcbiAgICAgICAgXG5cbiAgICBvbkZyYW1lc0xvYWRlZDogPT5cbiAgICAgICAgaWYgdHlwZW9mIEBhc3luYyBpcyAnZnVuY3Rpb24nXG4gICAgICAgICAgICBAYXN5bmMoKVxuICAgICAgICAkKHdpbmRvdykub24gJ3Njcm9sbCcsICBAY2hlY2tDb2FzdGVyVmlzaWJpbGl0eVxuICAgICAgICBAY2hlY2tDb2FzdGVyVmlzaWJpbGl0eSgpXG4gICAgXG4gICAgICAgIFxuICAgIGNoZWNrQ29hc3RlclZpc2liaWxpdHk6ID0+XG4gICAgICAgIFxuICAgICAgICBpZihAaW5WaWV3cG9ydCgpKVxuXG4gICAgICAgICAgICAkKHdpbmRvdykub2ZmICdzY3JvbGwnLCAgQGNoZWNrQ29hc3RlclZpc2liaWxpdHlcbiAgICAgICAgICAgIEBpbml0QW5pbWF0aW9uKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIGluVmlld3BvcnQ6ID0+XG4gICAgICAgIFxuICAgICAgICB0b3AgPSBAJGNvbnRhaW5lci5vZmZzZXQoKS50b3BcbiAgICAgICAgaGVpZ2h0ID0gQCRjb250YWluZXIuZmluZCgnY2FudmFzJykuZmlyc3QoKS5oZWlnaHQoKVxuICAgICAgICBib3R0b20gPSB0b3AgKyBoZWlnaHRcbiAgICAgICAgXG4gICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKVxuICAgICAgICBzY3JvbGxCb3R0b20gPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgKyAkKHdpbmRvdykuaGVpZ2h0KClcblxuICAgICAgICBpZiBzY3JvbGxUb3AgPD0gdG9wIDw9IHNjcm9sbEJvdHRvbVxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICBcbiBcblxubW9kdWxlLmV4cG9ydHMgPSBGcmFtZUFuaW1hdGlvblxuIiwiXG5cbm1hdGNoRnJhbWVOdW0gPSAvXFxkKyg/PVxcLlthLXpBLVpdKykvXG5cbmNsYXNzIEZyYW1lc01vZGVsIGV4dGVuZHMgRXZlbnRFbWl0dGVyXG5cblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgQGJhc2VVcmwgPSBvcHRzLmJhc2VVcmxcbiAgICAgICAgQHVybCA9IG9wdHMudXJsXG4gICAgICAgIEBsb2FkTWFuaWZlc3QgPSBbXTtcbiAgICAgICAgQHRyYWNrTWFuaWZlc3QgPSBbXTtcbiAgICAgICAgQGluaXRMb2FkZXIoKVxuICAgICAgICBzdXBlcihvcHRzKVxuICAgICAgICBcblxuICAgIGxvYWREYXRhOiAtPlxuICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgIHVybDogQGJhc2VVcmwgICsgQHVybFxuICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IEBvbkRhdGFMb2FkZWRcbiAgICAgICAgICAgIGVycm9yOiBAaGFuZGxlRXJyb3JcblxuICAgIGhhbmRsZUVycm9yOiAoZXJyKSAtPlxuICAgICAgICB0aHJvdyBlcnJcblxuICAgIG9uRGF0YUxvYWRlZDogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICBAZGF0YSA9IGRhdGFcbiAgICAgICAgQHRyYW5zZm9ybURhdGEoKVxuICAgICAgICBAZW1pdCBcImRhdGFMb2FkZWRcIlxuICAgICAgXG5cbiAgICBzb3J0U2VxdWVuY2U6IChhLGIpIC0+XG4gICAgICAgIGFGcmFtZSA9IG1hdGNoRnJhbWVOdW0uZXhlYyhhLmZpbGVuYW1lKVxuICAgICAgICBiRnJhbWUgPSBtYXRjaEZyYW1lTnVtLmV4ZWMoYi5maWxlbmFtZSlcbiAgICAgICAgcmV0dXJuIGlmIHBhcnNlSW50KGFGcmFtZVswXSkgPCBwYXJzZUludChiRnJhbWVbMF0pIHRoZW4gLTEgZWxzZSAxXG5cbiAgICB0cmFuc2Zvcm1EYXRhOiAtPlxuICAgICAgICBAZGF0YS5tYW5pZmVzdC5zb3J0IEBzb3J0U2VxdWVuY2VcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBAdHJhY2tNYW5pZmVzdC5wdXNoXG4gICAgICAgICAgICBpZDpcInRyYWNrXCJcbiAgICAgICAgICAgIHNyYzogXCIje0BkYXRhLmdsb2JhbC5mb2xkZXJ9LyN7QGRhdGEuZ2xvYmFsLnRyYWNrfVwiXG5cbiAgICAgICAgZm9yIGZyYW1lIGluIEBkYXRhLm1hbmlmZXN0XG4gICAgICAgICAgICBmcmFtZS5zcmMgPSBcIiN7QGRhdGEuZ2xvYmFsLmZvbGRlcn0vI3tmcmFtZS5maWxlbmFtZX1cIlxuICAgICAgICAgICAgQGxvYWRNYW5pZmVzdC5wdXNoXG4gICAgICAgICAgICAgICAgaWQ6IGZyYW1lLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgc3JjOiBmcmFtZS5zcmNcblxuICAgIGluaXRMb2FkZXI6IC0+XG4gICAgICAgIEB0cmFja0xvYWRlciA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUgdHJ1ZSwgQGJhc2VVcmwsIHRydWVcbiAgICAgICAgQHByZWxvYWRlciA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUgdHJ1ZSwgQGJhc2VVcmwsIHRydWVcbiAgICAgICAgQHRyYWNrTG9hZGVyLnNldE1heENvbm5lY3Rpb25zKDEwKVxuICAgICAgICBAcHJlbG9hZGVyLnNldE1heENvbm5lY3Rpb25zKDE1KVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIHByZWxvYWRUcmFjazogLT5cblxuICAgICAgICBAdHJhY2tMb2FkZXIuYWRkRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uVHJhY2tBc3NldHNDb21wbGV0ZVxuICAgICAgICBAdHJhY2tMb2FkZXIubG9hZE1hbmlmZXN0KEB0cmFja01hbmlmZXN0KVxuICAgIHByZWxvYWRGcmFtZXM6IC0+XG4jICAgICAgICBjb25zb2xlLmxvZyBAbG9hZE1hbmlmZXN0XG4gICAgICAgIFxuICAgICAgICBAcHJlbG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvbkFzc2V0c0NvbXBsZXRlXG4gICAgICAgIEBwcmVsb2FkZXIubG9hZE1hbmlmZXN0KEBsb2FkTWFuaWZlc3QpXG5cbiAgICBvblRyYWNrQXNzZXRzQ29tcGxldGU6IChlKSA9PlxuICAgICAgICBcbiAgICAgICAgQHRyYWNrTG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvblRyYWNrQXNzZXRzQ29tcGxldGVcbiAgICAgICAgQGVtaXQgXCJ0cmFja0xvYWRlZFwiXG5cbiAgICBvbkFzc2V0c0NvbXBsZXRlOiAoZSk9PlxuIyAgICAgICAgY29uc29sZS5sb2cgQHByZWxvYWRlclxuICAgICAgICBAcHJlbG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvbkFzc2V0c0NvbXBsZXRlXG4gICAgICAgIEBlbWl0IFwiZnJhbWVzTG9hZGVkXCJcblxuXG5cblxuICAgIGdldEFzc2V0OiAoaWQpIC0+XG4gICAgICAgIFxuICAgICAgICBpdGVtID0gIEBwcmVsb2FkZXIuZ2V0SXRlbSBpZFxuICAgICAgICBpZiAhaXRlbT9cbiAgICAgICAgICAgIGl0ZW0gPSAgQHRyYWNrTG9hZGVyLmdldEl0ZW0gaWQgICAgICAgIFxuICAgICAgICByZXR1cm4gaXRlbVxuXG4gICAgZ2V0OiAoa2V5KSAtPlxuICAgICAgICBmb3Igayx2IG9mIEBkYXRhXG4gICAgICAgICAgICBpZiBrIGlzIGtleVxuICAgICAgICAgICAgICAgIHJldHVybiB2XG5cbiAgICBzZXQ6IChrZXksIHZhbCkgLT5cbiAgICAgICAgQGRhdGFba2V5XSA9IHZhbFxuXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRnJhbWVzTW9kZWxcbiIsIlxyXG5WaWV3QmFzZSA9IHJlcXVpcmUgXCIuLi9hYnN0cmFjdC9WaWV3QmFzZS5jb2ZmZWVcIlxyXG5cclxuY2xhc3MgU2Nyb2xsQmFyIGV4dGVuZHMgVmlld0Jhc2VcclxuXHJcbiAgICBzY3JvbGxpbmcgOiBmYWxzZVxyXG4gICAgb2Zmc2V0WSA6IDBcclxuICAgIHBvc2l0aW9uIDogMFxyXG4gICAgaGlkZVRpbWVvdXQ6IDBcclxuXHJcblxyXG4gICAgaW5pdGlhbGl6ZTogLT5cclxuICAgICAgICBAb25SZXNpemUoKVxyXG4gICAgICAgIEBzZXRFdmVudHMoKVxyXG5cclxuICAgICAgICBpZiB3aW5kb3cuaXNUaWVyVGFibGV0XHJcbiAgICAgICAgICAgIEAkZWwuaGlkZSgpXHJcblxyXG5cclxuXHJcbiAgICBzZXRFdmVudHM6ID0+XHJcbiAgICAgICAgQGRlbGVnYXRlRXZlbnRzXHJcbiAgICAgICAgICAgIFwibW91c2Vkb3duIC5oYW5kbGVcIiA6IFwib25IYW5kbGVEb3duXCJcclxuICAgICAgICAgICAgI1wibW91c2VlbnRlclwiIDogXCJvbkhhbmRsZVVwXCJcclxuICAgICAgICAgICAgXCJjbGljayAucmFpbFwiIDogXCJvblJhaWxDbGlja1wiXHJcblxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uIFwibW91c2V1cFwiICwgQG9uSGFuZGxlVXBcclxuICAgICAgICAkKGRvY3VtZW50KS5vbiBcIm1vdXNlbW92ZVwiICwgQG9uTW91c2VNb3ZlXHJcblxyXG5cclxuICAgICAgICBcclxuICAgIHVwZGF0ZUhhbmRsZTogKHBvcykgPT5cclxuICAgICAgICBAcG9zaXRpb24gPSBwb3NcclxuICAgICAgICBAJGVsLmZpbmQoJy5oYW5kbGUnKS5jc3NcclxuICAgICAgICAgICAgdG9wOiBAcG9zaXRpb24gKiAoJCh3aW5kb3cpLmhlaWdodCgpIC0gQCRlbC5maW5kKFwiLmhhbmRsZVwiKS5oZWlnaHQoKSlcclxuICAgICAgICBAc2hvd1Njcm9sbGJhcigpXHJcbiAgICAgICAgQGhpZGVTY3JvbGxiYXIoKVxyXG5cclxuICAgIG9uUmFpbENsaWNrOiAoZSkgPT5cclxuICAgICAgICBAb2Zmc2V0WSA9IGlmIGUub2Zmc2V0WSBpc250IHVuZGVmaW5lZCB0aGVuIGUub2Zmc2V0WSBlbHNlIGUub3JpZ2luYWxFdmVudC5sYXllcllcclxuICAgICAgICBAcG9zaXRpb24gPSBAb2Zmc2V0WSAvICQod2luZG93KS5oZWlnaHQoKVxyXG4gICAgICAgIEB0cmlnZ2VyIFwiY3VzdG9tU2Nyb2xsSnVtcFwiICwgQHBvc2l0aW9uXHJcbiAgICAgICAgXHJcblxyXG5cclxuICAgIG9uSGFuZGxlRG93bjogKGUpID0+XHJcblxyXG4gICAgICAgIEAkZWwuY3NzXHJcbiAgICAgICAgICAgIHdpZHRoOlwiMTAwJVwiXHJcbiAgICAgICAgQG9mZnNldFkgPSBpZiBlLm9mZnNldFkgaXNudCB1bmRlZmluZWQgdGhlbiBlLm9mZnNldFkgZWxzZSBlLm9yaWdpbmFsRXZlbnQubGF5ZXJZXHJcbiAgICAgICAgQHNjcm9sbGluZyA9IHRydWVcclxuXHJcbiAgICBvbkhhbmRsZVVwOiAoZSkgPT5cclxuICAgICAgICBAJGVsLmNzc1xyXG4gICAgICAgICAgICB3aWR0aDpcIjE1cHhcIlxyXG5cclxuICAgICAgICBAc2Nyb2xsaW5nID0gZmFsc2VcclxuXHJcbiAgICBvbk1vdXNlTW92ZTogKGUpID0+XHJcbiAgICAgICAgaWYgQHNjcm9sbGluZ1xyXG5cclxuICAgICAgICAgICAgaWYgZS5wYWdlWSAtIEBvZmZzZXRZIDw9IDBcclxuICAgICAgICAgICAgICAgICQoXCIuaGFuZGxlXCIpLmNzc1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogMVxyXG4gICAgICAgICAgICBlbHNlIGlmIGUucGFnZVkgLSBAb2Zmc2V0WSA+PSAkKHdpbmRvdykuaGVpZ2h0KCkgLSAkKFwiI3Njcm9sbGJhciAuaGFuZGxlXCIpLmhlaWdodCgpXHJcbiAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAkKFwiLmhhbmRsZVwiKS5jc3NcclxuICAgICAgICAgICAgICAgICAgICB0b3A6ICAgKCQod2luZG93KS5oZWlnaHQoKSAtICQoXCIjc2Nyb2xsYmFyIC5oYW5kbGVcIikuaGVpZ2h0KCkpIC0gMVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAkKFwiLmhhbmRsZVwiKS5jc3NcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IGUucGFnZVkgLSBAb2Zmc2V0WVxyXG5cclxuXHJcbiAgICAgICAgICAgIEBwb3NpdGlvbiA9IHBhcnNlSW50KCQoXCIjc2Nyb2xsYmFyIC5oYW5kbGVcIikuY3NzKFwidG9wXCIpKSAvICgkKHdpbmRvdykuaGVpZ2h0KCkgLSAkKFwiI3Njcm9sbGJhciAuaGFuZGxlXCIpLmhlaWdodCgpKVxyXG5cclxuICAgICAgICAgICAgaWYgQHBvc2l0aW9uIDwgcGFyc2VGbG9hdCguMDA1KVxyXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uID0gMFxyXG4gICAgICAgICAgICBlbHNlIGlmIEBwb3NpdGlvbiA+IHBhcnNlRmxvYXQoLjk5NSlcclxuICAgICAgICAgICAgICAgIEBwb3NpdGlvbiA9IDFcclxuXHJcblxyXG4gICAgICAgICAgICBAdHJpZ2dlciBcImN1c3RvbVNjcm9sbFwiICwgQHBvc2l0aW9uXHJcbiAgICAgICAgICBcclxuICAgXHJcbiAgICAgICAgaWYgQG1vdXNlWCBpc250IGUuY2xpZW50WCBhbmQgQG1vdXNlWSBpc250IGUuY2xpZW50WVxyXG4gICAgICAgICAgICBAc2hvd1Njcm9sbGJhcigpXHJcbiAgICAgICAgICAgIEBoaWRlU2Nyb2xsYmFyKClcclxuXHJcbiAgICAgICAgQG1vdXNlWCA9IGUuY2xpZW50WFxyXG4gICAgICAgIEBtb3VzZVkgPSBlLmNsaWVudFlcclxuXHJcbiAgICBvblJlc2l6ZTogKGUpID0+XHJcblxyXG5cclxuICAgICAgICBAJGVsLmZpbmQoJy5oYW5kbGUnKS5jc3NcclxuICAgICAgICAgICAgaGVpZ2h0OiAoJCh3aW5kb3cpLmhlaWdodCgpIC8gJChcInNlY3Rpb25cIikuaGVpZ2h0KCkgKSAqICQod2luZG93KS5oZWlnaHQoKVxyXG5cclxuICAgICAgICBAdXBkYXRlSGFuZGxlKEBwb3NpdGlvbilcclxuXHJcblxyXG4gICAgaGlkZVNjcm9sbGJhcjogPT5cclxuICAgICAgICBpZiBAaGlkZVRpbWVvdXQ/XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChAaGlkZVRpbWVvdXQpXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIEBoaWRlVGltZW91dCA9IHNldFRpbWVvdXQgKD0+XHJcbiAgICAgICAgICAgIGlmIEBtb3VzZVkgPiA3MlxyXG4gICAgICAgICAgICAgICAgVHdlZW5NYXgudG8gQCRlbCwgLjUgLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dG9BbHBoYTogMFxyXG4gICAgICAgICAgICApICwgMjAwMFxyXG4gICAgICAgIFxyXG5cclxuICAgIHNob3dTY3JvbGxiYXI6ID0+XHJcbiAgICAgICAgVHdlZW5NYXgudG8gQCRlbCAsIC41ICxcclxuICAgICAgICAgICAgYXV0b0FscGhhOiAuNVxyXG5cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNjcm9sbEJhciIsIlxyXG5cclxuY2xhc3MgU2hhcmVyXHJcblxyXG4gICAgXHJcbiAgICBTaGFyZXIuaW5pdEZhY2Vib29rID0gLT5cclxuICAgICAgICBGQi5pbml0IFxyXG4gICAgICAgICAgICBhcHBJZDpcIjIxNTIyNDcwNTMwNzM0MVwiXHJcbiAgICAgICAgICAgIGNoYW5uZWxVcmw6XCIvY2hhbm5lbC5odG1sXCJcclxuICAgICAgICAgICAgc3RhdHVzOiB0cnVlXHJcbiAgICAgICAgICAgIHhmYmw6IHRydWVcclxuXHJcblxyXG4gICAgICAgIFxyXG4gICAgXHJcbiAgICBTaGFyZXIuc2hhcmVUd2l0dGVyID0gKHNoYXJlTWVzc2FnZSwgIHVybCwgaGFzaHRhZ3MpIC0+XHJcbiAgICAgICAgdGV4dCA9IHNoYXJlTWVzc2FnZVxyXG4gICAgICAgIGhhc2h0YWdzID0gXCJcIlxyXG4gICAgICAgIHVybCA9IHVybFxyXG4gICAgICAgIHR3VVJMID0gXCJodHRwczovL3R3aXR0ZXIuY29tL2ludGVudC90d2VldD90ZXh0PVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpICsgXCImdXJsPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHVybClcclxuICAgICAgICBzdHIgKz0gXCImaGFzaHRhZ3M9XCIgKyBoYXNodGFncyAgaWYgaGFzaHRhZ3NcclxuICAgICAgICBAb3BlblBvcHVwIDU3NSwgNDIwLCB0d1VSTCwgXCJUd2l0dGVyXCJcclxuXHJcbiAgICBTaGFyZXIuc2hhcmVGYWNlYm9vayA9IChuYW1lLCAgY2FwdGlvbiAsZGVzY3JpcHRpb24gLCBsaW5rICwgcGljdHVyZSkgLT5cclxuXHJcbiAgICAgICAgRkIudWlcclxuICAgICAgICAgICAgbWV0aG9kOlwiZmVlZFwiXHJcbiAgICAgICAgICAgIGxpbms6bGlua1xyXG4gICAgICAgICAgICBwaWN0dXJlOnBpY3R1cmVcclxuICAgICAgICAgICAgbmFtZTogbmFtZVxyXG4gICAgICAgICAgICBjYXB0aW9uOmNhcHRpb25cclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ZGVzY3JpcHRpb25cclxuICAgICAgICBcclxuXHJcbiAgICBTaGFyZXIuc2hhcmVHb29nbGUgPSAodXJsKSAtPlxyXG5cclxuICAgICAgICBAb3BlblBvcHVwIDYwMCwgNDAwICwgXCJodHRwczovL3BsdXMuZ29vZ2xlLmNvbS9zaGFyZT91cmw9XCIrdXJsLCBcIkdvb2dsZVwiXHJcblxyXG4gICAgU2hhcmVyLnNoYXJlUGludGVyZXN0ID0gKHVybCAsIGRlc2NyaXB0aW9uLCBwaWN0dXJlKSAtPlxyXG5cclxuICAgICAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uLnNwbGl0KFwiIFwiKS5qb2luKFwiK1wiKVxyXG4gICAgICAgIEBvcGVuUG9wdXAgNzgwLCAzMjAsIFwiaHR0cDovL3BpbnRlcmVzdC5jb20vcGluL2NyZWF0ZS9idXR0b24vP3VybD0je2VuY29kZVVSSUNvbXBvbmVudCh1cmwpfSZhbXA7ZGVzY3JpcHRpb249I3tkZXNjcmlwdGlvbn0mYW1wO21lZGlhPSN7ZW5jb2RlVVJJQ29tcG9uZW50KHBpY3R1cmUpfVwiXHJcblxyXG5cclxuICAgIFNoYXJlci5lbWFpbExpbmsgPSAoc3ViamVjdCwgYm9keSkgLT5cclxuICAgICAgICB4ID0gQG9wZW5Qb3B1cCAxICwgMSwgXCJtYWlsdG86JnN1YmplY3Q9I3tlbmNvZGVVUklDb21wb25lbnQoc3ViamVjdCl9JmJvZHk9I3tlbmNvZGVVUklDb21wb25lbnQoYm9keSl9XCJcclxuICAgICAgICB4LmNsb3NlKClcclxuXHJcbiAgICBTaGFyZXIub3BlblBvcHVwID0gKHcsIGgsIHVybCwgbmFtZSkgLT5cclxuICAgICAgICB3aW5kb3cub3BlbiB1cmwsIG5hbWUsIFwic3RhdHVzPTEsd2lkdGg9XCIgKyB3ICsgXCIsaGVpZ2h0PVwiICsgaCArIFwiLGxlZnQ9XCIgKyAoc2NyZWVuLndpZHRoIC0gdykgLyAyICsgXCIsdG9wPVwiICsgKHNjcmVlbi5oZWlnaHQgLSBoKSAvIDJcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXJlciIsImdsb2JhbHMgPSByZXF1aXJlICcuL2NvbS9nbG9iYWwvaW5kZXguY29mZmVlJ1xuUGFya3NMaXN0ID0gcmVxdWlyZSAnLi9jb20vcGx1Z2lucy9QYXJrc0xpc3QuY29mZmVlJ1xuRHJhZ2dhYmxlR2FsbGVyeSA9IHJlcXVpcmUgJy4vY29tL3BsdWdpbnMvRHJhZ2dhYmxlR2FsbGVyeS5jb2ZmZWUnXG5GYWRlR2FsbGVyeSA9IHJlcXVpcmUgJy4vY29tL3BsdWdpbnMvRmFkZUdhbGxlcnkuY29mZmVlJ1xuR3JvdXBTYWxlc1BhZ2UgPSByZXF1aXJlICcuL2NvbS9wYWdlcy9Hcm91cFNhbGVzUGFnZS5jb2ZmZWUnXG5cblxuJChkb2N1bWVudCkucmVhZHkgLT5cblxuICAgIGdyb3Vwc2FsZXMgPSBuZXcgR3JvdXBTYWxlc1BhZ2VcbiAgICAgICAgZWw6IFwiYm9keVwiXG4iXX0=
