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
var AnimationBase, DraggableGallery, FadeGallery, FormHandler, FrameAnimation, HeaderAnimation, ParksList, PartnershipDetailPage, ResizeButtons, animations, globalAnimations,
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

animations = require('./animations/partnershipdetails.coffee');

globalAnimations = require('./animations/global.coffee');

FormHandler = require('../plugins/FormHandler.coffee');

PartnershipDetailPage = (function(superClass) {
  extend(PartnershipDetailPage, superClass);

  function PartnershipDetailPage(el) {
    this.resetTimeline = bind(this.resetTimeline, this);
    this.resetHeight = bind(this.resetHeight, this);
    this.findDeepLink = bind(this.findDeepLink, this);
    this.totalAnimationTime = 25;
    PartnershipDetailPage.__super__.constructor.call(this, el);
  }

  PartnershipDetailPage.prototype.initialize = function() {
    return PartnershipDetailPage.__super__.initialize.call(this);
  };

  PartnershipDetailPage.prototype.initComponents = function() {
    var coaster, sponsorshipForm, sponsorshipTypeDetails, sponsorshipTypes;
    PartnershipDetailPage.__super__.initComponents.call(this);
    if (!this.isPhone) {
      coaster = new FrameAnimation({
        id: "partnership-details-coaster-1",
        el: "#partnership-details-section1",
        baseUrl: this.cdnRoot + "coasters/",
        url: "shot-2/data.json"
      });
      coaster.loadFrames();
    } else {
      this.resetHeight('#select-media-gallery', '#select-media-gallery li.group-info');
    }
    sponsorshipTypes = new FadeGallery({
      el: "#select-media-gallery",
      page: 'partnership-details'
    });
    sponsorshipForm = new FormHandler({
      el: '#partnership-contact-form'
    });
    sponsorshipTypeDetails = new FadeGallery({
      el: "#typeDescriptions"
    });
    window.ddls = [];
    window.ddls.push($('#PartnershipTypes-select').cfDropdown({
      onSelect: function(t) {
        var id;
        $('.title-bucket.seven h1').text($(t).text());
        id = $(t).data('id');
        return sponsorshipTypes.goto(id);
      }
    }));
    window.ddls.push($('#PartnershipTypes1-select').cfDropdown({
      onSelect: function(t) {
        var id;
        return id = $(t).data('id');
      }
    }));
    window.ddls.push($('#PartnershipTypes2-select').cfDropdown({
      onSelect: function(t) {
        var id;
        return id = $(t).data('id');

        /*numbers = new DraggableGallery
            el:"#select"
            across: 1
         */
      }
    }));
    return this.findDeepLink();
  };

  PartnershipDetailPage.prototype.findDeepLink = function() {
    var lastpart, location, parts;
    location = window.location.href;
    parts = location.split('/');
    lastpart = parts[parts.length - 1];
    if ((lastpart === 'sponsorship') || (lastpart === 'experiential') || (lastpart === 'in-park-media')) {
      console.log('lastpart: ', lastpart);
      return setTimeout((function() {
        $('#PartnershipTypes-select ul').trigger('click');
        $('#PartnershipTypes-select li[data-id="' + lastpart + '"]').trigger('click');
        $('#PartnershipTypes-select.drop-container').css('opacity', '1');
        return $('#PartnershipTypes-select ul').prepend($('#PartnershipTypes-select li[data-id="' + lastpart + '"]'));
      }), 50);
    }
  };

  PartnershipDetailPage.prototype.resetHeight = function(target, els) {
    var h;
    $(els).css('position', 'relative');
    h = $(els).eq(0).height();
    $(els).each(function(i, el) {
      if (h < $(el).height()) {
        return h = $(el).height();
      }
    });
    $(target).height(h);
    return $(els).css('position', 'absolute');
  };

  PartnershipDetailPage.prototype.resetTimeline = function() {
    PartnershipDetailPage.__super__.resetTimeline.call(this);
    this.parallax.push(globalAnimations.clouds("#section1", 0, 1, this.isTablet ? 1 : 5));
    if (!this.isPhone) {
      this.triggers.push(animations.topHeadline());
      this.triggers.push(animations.scrollCircle());
      return this.triggers.push(animations.selectBox());
    }
  };

  return PartnershipDetailPage;

})(AnimationBase);

module.exports = PartnershipDetailPage;



},{"../abstract/AnimationBase.coffee":1,"../plugins/DraggableGallery.coffee":10,"../plugins/FadeGallery.coffee":11,"../plugins/FormHandler.coffee":12,"../plugins/HeaderAnimation.coffee":13,"../plugins/ParksList.coffee":14,"../plugins/ResizeButtons.coffee":15,"../plugins/coasters/FrameAnimation.coffee":18,"./animations/global.coffee":7,"./animations/partnershipdetails.coffee":8}],6:[function(require,module,exports){
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
  $el = $('#partnership-details');
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
  return {
    a: tween,
    offset: $el.offset().top
  };
};

module.exports.scrollCircle = function() {
  var $el, tween;
  $el = $("#partnership-details .circ-btn-wrapper");
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
  $el = $('#partnership-details #select-sponsorships');
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
var DraggableGallery, FadeGallery, ParksList, PartnershipDetailPage, globals;

globals = require('./com/global/index.coffee');

ParksList = require('./com/plugins/ParksList.coffee');

DraggableGallery = require('./com/plugins/DraggableGallery.coffee');

FadeGallery = require('./com/plugins/FadeGallery.coffee');

PartnershipDetailPage = require('./com/pages/PartnershipDetailPage.coffee');

$(document).ready(function() {
  var partnershipDetails;
  return partnershipDetails = new PartnershipDetailPage({
    el: "body"
  });
});



},{"./com/global/index.coffee":4,"./com/pages/PartnershipDetailPage.coffee":5,"./com/plugins/DraggableGallery.coffee":10,"./com/plugins/FadeGallery.coffee":11,"./com/plugins/ParksList.coffee":14}]},{},[22])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvQW5pbWF0aW9uQmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvVmlld0Jhc2UuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL2dsb2JhbC9pbmRleC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvUGFydG5lcnNoaXBEZXRhaWxQYWdlLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wYWdlcy9hbmltYXRpb25zL2Nsb3Vkcy5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvYW5pbWF0aW9ucy9nbG9iYWwuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BhZ2VzL2FuaW1hdGlvbnMvcGFydG5lcnNoaXBkZXRhaWxzLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0Jhc2ljT3ZlcmxheS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9EcmFnZ2FibGVHYWxsZXJ5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0ZhZGVHYWxsZXJ5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0Zvcm1IYW5kbGVyLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0hlYWRlckFuaW1hdGlvbi5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9QYXJrc0xpc3QuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvUmVzaXplQnV0dG9ucy5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9TdmdJbmplY3QuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvVmlkZW9PdmVybGF5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL2NvYXN0ZXJzL0ZyYW1lQW5pbWF0aW9uLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL2NvYXN0ZXJzL0ZyYW1lc01vZGVsLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS91dGlsL1Njcm9sbEJhci5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vdXRpbC9TaGFyZXIuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvcGFydG5lcnNoaXAtZGV0YWlscy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNDQSxJQUFBLDJEQUFBO0VBQUE7OzZCQUFBOztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsbUJBQVIsQ0FBWCxDQUFBOztBQUFBLFNBQ0EsR0FBWSxPQUFBLENBQVEsMEJBQVIsQ0FEWixDQUFBOztBQUFBLGVBRUEsR0FBa0IsT0FBQSxDQUFRLG1DQUFSLENBRmxCLENBQUE7O0FBQUEsTUFHQSxHQUFTLE9BQUEsQ0FBUSxtQ0FBUixDQUhULENBQUE7O0FBQUE7QUFRSSxtQ0FBQSxDQUFBOztBQUFhLEVBQUEsdUJBQUMsRUFBRCxHQUFBO0FBQ1QseURBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEseUNBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsSUFBQSwrQ0FBTSxFQUFOLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQURaLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FGVixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLENBSGQsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLGtCQUFELEdBQXlCLElBQUMsQ0FBQSxRQUFKLEdBQWtCLEVBQWxCLEdBQTBCLENBSmhELENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxZQUFELEdBQWdCLENBTGhCLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FOYixDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsZUFBRCxHQUFtQixDQVBuQixDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsRUFSdEIsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CLENBVHBCLENBQUE7QUFBQSxJQVVBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFWWixDQUFBO0FBQUEsSUFXQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBWFQsQ0FBQTtBQUFBLElBWUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQVpmLENBQUE7QUFBQSxJQWFBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFFBQVYsQ0FBbUIsUUFBbkIsQ0FiWixDQURTO0VBQUEsQ0FBYjs7QUFBQSwwQkFnQkEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNSLElBQUEsNENBQUEsQ0FBQSxDQUFBO0FBRUEsSUFBQSxJQUFHLENBQUEsSUFBRSxDQUFBLE9BQUw7QUFDSSxNQUFBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsZUFBRCxDQUFBLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUZBLENBQUE7YUFHQSxJQUFDLENBQUEsY0FBRCxDQUFBLEVBSko7S0FIUTtFQUFBLENBaEJaLENBQUE7O0FBQUEsMEJBeUJBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO1dBQ1osSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLGVBQUEsQ0FDVjtBQUFBLE1BQUEsRUFBQSxFQUFHLFFBQUg7S0FEVSxFQURGO0VBQUEsQ0F6QmhCLENBQUE7O0FBQUEsMEJBZ0NBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2IsSUFBQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsR0FBWixDQUFnQixRQUFoQixFQUEyQixJQUFDLENBQUEsUUFBNUIsQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsTUFBRCxHQUNJO0FBQUEsTUFBQSxRQUFBLEVBQVUsQ0FBVjtBQUFBLE1BQ0EsU0FBQSxFQUFXLENBRFg7S0FISixDQUFBO0FBQUEsSUFLQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsTUFBWixDQUFtQixJQUFDLENBQUEsUUFBcEIsQ0FMQSxDQUFBO1dBTUEsSUFBQyxDQUFBLFFBQUQsQ0FBQSxFQVBhO0VBQUEsQ0FoQ2pCLENBQUE7O0FBQUEsMEJBMENBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtXQUNmLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLFdBQWQsQ0FBQSxDQUFBLEdBQThCLElBQUMsQ0FBQSxXQUF4QyxFQURlO0VBQUEsQ0ExQ25CLENBQUE7O0FBQUEsMEJBNkNBLFlBQUEsR0FBYyxTQUFBLEdBQUE7V0FDVixDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsU0FBWixDQUFBLENBQUEsR0FBMEIsSUFBQyxDQUFBLGlCQUFELENBQUEsRUFEaEI7RUFBQSxDQTdDZCxDQUFBOztBQUFBLDBCQWlEQSxZQUFBLEdBQWMsU0FBQyxHQUFELEdBQUE7QUFDVixRQUFBLEdBQUE7QUFBQSxJQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUFBLEdBQXVCLEdBQTdCLENBQUE7V0FDQSxNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFoQixFQUFvQixHQUFwQixFQUZVO0VBQUEsQ0FqRGQsQ0FBQTs7QUFBQSwwQkFzREEsb0JBQUEsR0FBc0IsU0FBQyxHQUFELEdBQUE7QUFDbEIsUUFBQSxHQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FBQSxHQUF1QixHQUE3QixDQUFBO1dBQ0EsUUFBUSxDQUFDLEdBQVQsQ0FBYSxDQUFBLENBQUUsVUFBRixDQUFiLEVBQ0k7QUFBQSxNQUFBLENBQUEsRUFBRyxDQUFBLEdBQUg7S0FESixFQUZrQjtFQUFBLENBdER0QixDQUFBOztBQUFBLDBCQTREQSxRQUFBLEdBQVUsU0FBQyxDQUFELEdBQUE7QUFDTixJQUFBLElBQUcsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLFNBQVosQ0FBQSxDQUFBLEdBQTBCLEVBQTdCO0FBQ0ksTUFBQSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxRQUF2QixDQUFnQyxXQUFoQyxDQUFBLENBREo7S0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLEdBQW1CLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FIbkIsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLEdBQW9CLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxTQUFaLENBQUEsQ0FKcEIsQ0FBQTtXQUtBLElBQUMsQ0FBQSxjQUFELENBQUEsRUFOTTtFQUFBLENBNURWLENBQUE7O0FBQUEsMEJBcUVBLE1BQUEsR0FBUSxTQUFDLENBQUQsR0FBQTtBQUdKLElBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLEdBQW1CLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxDQUFSLEdBQWEsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FBdEIsQ0FBbkIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLEdBQW9CLENBQUEsSUFBRSxDQUFBLE1BQU0sQ0FBQyxDQUQ3QixDQUFBO1dBS0EsSUFBQyxDQUFBLGNBQUQsQ0FBQSxFQVJJO0VBQUEsQ0FyRVIsQ0FBQTs7QUFBQSwwQkFnRkEsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNOLFFBQUEsR0FBQTtBQUFBLElBQUEsMENBQUEsQ0FBQSxDQUFBO0FBQ0EsSUFBQSxJQUFHLENBQUEsSUFBRSxDQUFBLFFBQUw7QUFDSSxNQUFBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBQSxDQURKO0tBREE7QUFBQSxJQUlBLElBQUMsQ0FBQSxZQUFELEdBQWlCLElBQUMsQ0FBQSxXQUFELEdBQWUsS0FKaEMsQ0FBQTtBQUtBLElBQUEsSUFBRyxtQkFBSDtBQUNJLE1BQUEsR0FBQSxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBZCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsZUFBRCxDQUFBLENBREEsQ0FBQTtBQUVBLE1BQUEsSUFBRyxDQUFBLElBQUUsQ0FBQSxRQUFMO2VBQ0ksSUFBQyxDQUFBLFlBQUQsQ0FBYyxHQUFkLEVBREo7T0FISjtLQU5NO0VBQUEsQ0FoRlYsQ0FBQTs7QUFBQSwwQkE2RkEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNYLElBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxHQUFBLENBQUEsV0FBWixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLEVBRFosQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxFQUZaLENBQUE7V0FJQSxDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLElBQWxCLENBQXVCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsRUFBRyxDQUFILEdBQUE7QUFDbkIsWUFBQSw4Q0FBQTtBQUFBLFFBQUEsR0FBQSxHQUFNLENBQUEsQ0FBRSxDQUFGLENBQU4sQ0FBQTtBQUFBLFFBQ0EsaUJBQUEsR0FBb0IsR0FBRyxDQUFDLE9BQUosQ0FBWSx3QkFBWixDQURwQixDQUFBO0FBQUEsUUFFQSxPQUFBLEdBQVUsaUJBQWlCLENBQUMsSUFBbEIsQ0FBQSxDQUF3QixDQUFDLGNBQWMsQ0FBQyxPQUZsRCxDQUFBO0FBQUEsUUFLQSxhQUFBLEdBQWdCLE1BQUEsQ0FDWjtBQUFBLFVBQUEsR0FBQSxFQUFJLEdBQUo7U0FEWSxDQUxoQixDQUFBO0FBUUEsUUFBQSxJQUFHLE9BQUg7QUFDSSxVQUFBLGFBQUEsQ0FBYyxPQUFkLENBQUEsQ0FESjtTQVJBO2VBV0EsS0FBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsYUFBZixFQVptQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCLEVBTFc7RUFBQSxDQTdGZixDQUFBOztBQUFBLDBCQWdIQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtBQUVaLFFBQUEseUNBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFzQixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQTlCLENBQUEsQ0FBQTtBQUVBO0FBQUEsU0FBQSxxQ0FBQTtpQkFBQTtBQUNJLE1BQUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsR0FBb0IsQ0FBQyxDQUFDLE1BQUYsR0FBVyxJQUFDLENBQUEsWUFBbkM7QUFDSSxRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSixDQUFBLENBQUEsQ0FESjtPQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsR0FBb0IsSUFBQyxDQUFBLFdBQXJCLEdBQW1DLENBQUMsQ0FBQyxNQUF4QztBQUNELFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFKLENBQVcsSUFBWCxDQUFBLENBQUE7QUFBQSxRQUNBLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSixDQUFTLENBQVQsQ0FEQSxDQURDO09BSFQ7QUFBQSxLQUZBO0FBVUE7QUFBQTtTQUFBLHdDQUFBO2tCQUFBO0FBQ0ksbUJBQUEsQ0FBQSxDQUFFLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBVixFQUFBLENBREo7QUFBQTttQkFaWTtFQUFBLENBaEhoQixDQUFBOzt1QkFBQTs7R0FId0IsU0FMNUIsQ0FBQTs7QUFBQSxNQTZJTSxDQUFDLE9BQVAsR0FBaUIsYUE3SWpCLENBQUE7Ozs7O0FDREEsSUFBQSxVQUFBO0VBQUE7NkJBQUE7O0FBQUE7QUFJSSxnQ0FBQSxDQUFBOztBQUFhLEVBQUEsb0JBQUMsSUFBRCxHQUFBO0FBQ1QsSUFBQSwwQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxHQUFELEdBQVUsZUFBSCxHQUFpQixDQUFBLENBQUUsSUFBSSxDQUFDLEVBQVAsQ0FBakIsR0FBQSxNQURQLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxVQUFELENBQVksSUFBWixDQUhBLENBRFM7RUFBQSxDQUFiOztBQUFBLHVCQVNBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTtXQUNSLElBQUMsQ0FBQSxTQUFELENBQUEsRUFEUTtFQUFBLENBVFosQ0FBQTs7QUFBQSx1QkFZQSxTQUFBLEdBQVcsU0FBQSxHQUFBLENBWlgsQ0FBQTs7QUFBQSx1QkFnQkEsWUFBQSxHQUFjLFNBQUEsR0FBQSxDQWhCZCxDQUFBOztBQUFBLHVCQW1CQSxPQUFBLEdBQVMsU0FBQSxHQUFBO1dBQ0wsSUFBQyxDQUFBLFlBQUQsQ0FBQSxFQURLO0VBQUEsQ0FuQlQsQ0FBQTs7b0JBQUE7O0dBSnFCLGFBQXpCLENBQUE7O0FBQUEsTUFpQ00sQ0FBQyxPQUFQLEdBQWlCLFVBakNqQixDQUFBOzs7OztBQ0NBLElBQUEsZ0JBQUE7RUFBQTs7NkJBQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSx1QkFBUixDQUFULENBQUE7O0FBQUE7QUFTSSw4QkFBQSxDQUFBOztBQUFhLEVBQUEsa0JBQUMsRUFBRCxHQUFBO0FBRVQsNkNBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFBLENBQUUsRUFBRixDQUFQLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFFBQVYsQ0FBbUIsUUFBbkIsQ0FEWixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxRQUFWLENBQW1CLE9BQW5CLENBRlgsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsSUFBVixDQUFlLEtBQWYsQ0FBQSxJQUF5QixHQUhwQyxDQUFBO0FBQUEsSUFJQSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsRUFBVixDQUFhLFlBQWIsRUFBNEIsSUFBQyxDQUFBLFFBQTdCLENBSkEsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxNQUFNLENBQUMsV0FOdEIsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsS0FBVixDQUFBLENBUGQsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQVJWLENBQUE7QUFBQSxJQVNBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FUVixDQUFBO0FBQUEsSUFZQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBWkEsQ0FGUztFQUFBLENBQWI7O0FBQUEscUJBaUJBLFVBQUEsR0FBWSxTQUFBLEdBQUE7V0FDUixJQUFDLENBQUEsY0FBRCxDQUFBLEVBRFE7RUFBQSxDQWpCWixDQUFBOztBQUFBLHFCQW9CQSxjQUFBLEdBQWdCLFNBQUEsR0FBQSxDQXBCaEIsQ0FBQTs7QUFBQSxxQkFzQkEsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNOLElBQUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBQWYsQ0FBQTtXQUNBLElBQUMsQ0FBQSxVQUFELEdBQWMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEtBQVYsQ0FBQSxFQUZSO0VBQUEsQ0F0QlYsQ0FBQTs7QUFBQSxxQkEyQkEsY0FBQSxHQUFnQixTQUFBLEdBQUE7QUFDWixXQUFPLEVBQVAsQ0FEWTtFQUFBLENBM0JoQixDQUFBOztrQkFBQTs7R0FObUIsYUFIdkIsQ0FBQTs7QUFBQSxNQXdDTSxDQUFDLE9BQVAsR0FBaUIsUUF4Q2pCLENBQUE7Ozs7O0FDREEsSUFBQSx1QkFBQTs7QUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGdDQUFSLENBQWYsQ0FBQTs7QUFBQSxTQUNBLEdBQVksT0FBQSxDQUFRLDZCQUFSLENBRFosQ0FBQTs7QUFLQSxJQUFHLE1BQU0sQ0FBQyxPQUFQLEtBQWtCLE1BQWxCLElBQStCLE1BQU0sQ0FBQyxPQUFQLEtBQWtCLElBQXBEO0FBQ0UsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxHQUFBLEVBQUssU0FBQSxHQUFBLENBQUw7QUFBQSxJQUNBLElBQUEsRUFBTSxTQUFBLEdBQUEsQ0FETjtBQUFBLElBRUEsS0FBQSxFQUFPLFNBQUEsR0FBQSxDQUZQO0dBREYsQ0FERjtDQUxBOztBQUFBLENBYUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxLQUFaLENBQWtCLFNBQUEsR0FBQTtBQUlkLE1BQUEsYUFBQTtBQUFBLEVBQUEsYUFBQSxHQUFvQixJQUFBLFlBQUEsQ0FDaEI7QUFBQSxJQUFBLEVBQUEsRUFBSSxDQUFBLENBQUUsVUFBRixDQUFKO0dBRGdCLENBQXBCLENBQUE7QUFBQSxFQUlBLENBQUEsQ0FBRSxXQUFGLENBQWMsQ0FBQyxLQUFmLENBQXFCLFNBQUEsR0FBQTtBQUNsQixRQUFBLENBQUE7QUFBQSxJQUFBLENBQUEsR0FBSSxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsSUFBUixDQUFhLFFBQWIsQ0FBSixDQUFBO1dBQ0EsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE9BQVYsQ0FBa0I7QUFBQSxNQUNiLFNBQUEsRUFBVyxDQUFBLENBQUUsR0FBQSxHQUFJLENBQU4sQ0FBUSxDQUFDLE1BQVQsQ0FBQSxDQUFpQixDQUFDLEdBQWxCLEdBQXdCLEVBRHRCO0tBQWxCLEVBRmtCO0VBQUEsQ0FBckIsQ0FKQSxDQUFBO0FBQUEsRUFZQSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsS0FBVixDQUFnQixTQUFBLEdBQUE7QUFDWixJQUFBLElBQUcsbUJBQUg7YUFDSSxDQUFDLENBQUMsSUFBRixDQUFPLE1BQU0sQ0FBQyxJQUFkLEVBQW9CLFNBQUMsQ0FBRCxFQUFJLENBQUosR0FBQTtBQUNoQixRQUFBLElBQUcsQ0FBQyxDQUFDLE1BQUYsSUFBYSxDQUFBLENBQUssQ0FBQyxTQUF0QjtpQkFDSSxDQUFDLENBQUMsU0FBRixDQUFBLEVBREo7U0FEZ0I7TUFBQSxDQUFwQixFQURKO0tBRFk7RUFBQSxDQUFoQixDQVpBLENBQUE7QUFBQSxFQW9CQSxDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLElBQWxCLENBQXVCLFNBQUEsR0FBQTtBQUNuQixRQUFBLFVBQUE7QUFBQSxJQUFBLEdBQUEsR0FBTSxDQUFBLENBQUUsSUFBRixDQUFOLENBQUE7QUFBQSxJQUNBLEtBQUEsR0FBUSxHQUFHLENBQUMsSUFBSixDQUFBLENBQVUsQ0FBQyxLQURuQixDQUFBO0FBQUEsSUFHQSxHQUFHLENBQUMsR0FBSixDQUFRLFNBQVIsRUFBbUIsS0FBbkIsQ0FIQSxDQUFBO1dBSUEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxHQUFiLEVBQ0k7QUFBQSxNQUFBLENBQUEsRUFBRyxLQUFBLEdBQVEsRUFBWDtLQURKLEVBTG1CO0VBQUEsQ0FBdkIsQ0FwQkEsQ0FBQTtBQUFBLEVBOEJBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxFQUFWLENBQWEsaUJBQWIsRUFBaUMsU0FBQSxHQUFBO1dBQzdCLENBQUEsQ0FBRSxHQUFGLENBQU0sQ0FBQyxJQUFQLENBQVksU0FBQSxHQUFBO0FBQ1IsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLENBQVAsQ0FBQTtBQUNBLE1BQUEsSUFBRyxZQUFIO0FBQ0ksUUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLElBQUwsQ0FBQSxDQUFQLENBQUE7QUFDQSxRQUFBLElBQUcsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLENBQUEsS0FBMkIsQ0FBM0IsSUFBZ0MsSUFBSSxDQUFDLE9BQUwsQ0FBYSxVQUFiLENBQUEsS0FBNEIsQ0FBNUQsSUFBaUUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxNQUFiLENBQUEsS0FBd0IsQ0FBQyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQWYsQ0FBNUY7aUJBQ0ksQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxRQUFWLEVBQW9CLFFBQXBCLEVBREo7U0FGSjtPQUZRO0lBQUEsQ0FBWixFQUQ2QjtFQUFBLENBQWpDLENBOUJBLENBQUE7QUFBQSxFQXVDQSxDQUFBLENBQUUsd0JBQUYsQ0FBMkIsQ0FBQyxFQUE1QixDQUErQixZQUEvQixFQUE2QyxTQUFBLEdBQUE7V0FDekMsUUFBUSxDQUFDLEVBQVQsQ0FBWSxDQUFBLENBQUUsSUFBRixDQUFaLEVBQXFCLEdBQXJCLEVBQ0k7QUFBQSxNQUFBLEtBQUEsRUFBTyxJQUFQO0FBQUEsTUFDQSxJQUFBLEVBQU0sTUFBTSxDQUFDLE9BRGI7S0FESixFQUR5QztFQUFBLENBQTdDLENBdkNBLENBQUE7QUFBQSxFQThDQSxDQUFBLENBQUUsd0JBQUYsQ0FBMkIsQ0FBQyxFQUE1QixDQUErQixZQUEvQixFQUE2QyxTQUFBLEdBQUE7V0FDekMsUUFBUSxDQUFDLEVBQVQsQ0FBWSxDQUFBLENBQUUsSUFBRixDQUFaLEVBQXFCLEdBQXJCLEVBQ0k7QUFBQSxNQUFBLEtBQUEsRUFBTyxDQUFQO0FBQUEsTUFDQSxJQUFBLEVBQU0sTUFBTSxDQUFDLE9BRGI7S0FESixFQUR5QztFQUFBLENBQTdDLENBOUNBLENBQUE7U0FxREEsQ0FBQSxDQUFFLG9DQUFGLENBQXVDLENBQUMsRUFBeEMsQ0FBMkMsYUFBM0MsRUFBMEQsU0FBQSxHQUFBO1dBQ3RELE9BQU8sQ0FBQyxHQUFSLENBQVksT0FBWixFQURzRDtFQUFBLENBQTFELEVBekRjO0FBQUEsQ0FBbEIsQ0FiQSxDQUFBOztBQUFBLFFBNEVRLENBQUMsa0JBQVQsR0FBOEIsU0FBQSxHQUFBO0FBQzFCLEVBQUEsSUFBSSxRQUFRLENBQUMsVUFBVCxLQUF1QixVQUEzQjtXQUNJLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDUCxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsUUFBWixDQUFxQixnQkFBckIsRUFETztJQUFBLENBQVgsRUFFRSxHQUZGLEVBREo7R0FEMEI7QUFBQSxDQTVFOUIsQ0FBQTs7Ozs7QUNBQSxJQUFBLHlLQUFBO0VBQUE7OzZCQUFBOztBQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtDQUFSLENBQWhCLENBQUE7O0FBQUEsU0FDQSxHQUFZLE9BQUEsQ0FBUSw2QkFBUixDQURaLENBQUE7O0FBQUEsZ0JBRUEsR0FBbUIsT0FBQSxDQUFRLG9DQUFSLENBRm5CLENBQUE7O0FBQUEsV0FHQSxHQUFjLE9BQUEsQ0FBUSwrQkFBUixDQUhkLENBQUE7O0FBQUEsZUFJQSxHQUFrQixPQUFBLENBQVEsbUNBQVIsQ0FKbEIsQ0FBQTs7QUFBQSxhQUtBLEdBQWdCLE9BQUEsQ0FBUSxpQ0FBUixDQUxoQixDQUFBOztBQUFBLGNBTUEsR0FBaUIsT0FBQSxDQUFRLDJDQUFSLENBTmpCLENBQUE7O0FBQUEsVUFPQSxHQUFhLE9BQUEsQ0FBUSx3Q0FBUixDQVBiLENBQUE7O0FBQUEsZ0JBUUEsR0FBbUIsT0FBQSxDQUFRLDRCQUFSLENBUm5CLENBQUE7O0FBQUEsV0FTQSxHQUFjLE9BQUEsQ0FBUSwrQkFBUixDQVRkLENBQUE7O0FBQUE7QUFlSSwyQ0FBQSxDQUFBOztBQUFhLEVBQUEsK0JBQUMsRUFBRCxHQUFBO0FBQ1QsdURBQUEsQ0FBQTtBQUFBLG1EQUFBLENBQUE7QUFBQSxxREFBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsRUFBdEIsQ0FBQTtBQUFBLElBQ0EsdURBQU0sRUFBTixDQURBLENBRFM7RUFBQSxDQUFiOztBQUFBLGtDQUlBLFVBQUEsR0FBWSxTQUFBLEdBQUE7V0FDUixvREFBQSxFQURRO0VBQUEsQ0FKWixDQUFBOztBQUFBLGtDQU9BLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ1osUUFBQSxrRUFBQTtBQUFBLElBQUEsd0RBQUEsQ0FBQSxDQUFBO0FBSUEsSUFBQSxJQUFHLENBQUEsSUFBRSxDQUFBLE9BQUw7QUFFSSxNQUFBLE9BQUEsR0FBYyxJQUFBLGNBQUEsQ0FDVjtBQUFBLFFBQUEsRUFBQSxFQUFHLCtCQUFIO0FBQUEsUUFDQSxFQUFBLEVBQUcsK0JBREg7QUFBQSxRQUVBLE9BQUEsRUFBWSxJQUFDLENBQUEsT0FBRixHQUFVLFdBRnJCO0FBQUEsUUFHQSxHQUFBLEVBQUssa0JBSEw7T0FEVSxDQUFkLENBQUE7QUFBQSxNQU1BLE9BQU8sQ0FBQyxVQUFSLENBQUEsQ0FOQSxDQUZKO0tBQUEsTUFBQTtBQVdJLE1BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSx1QkFBYixFQUFzQyxxQ0FBdEMsQ0FBQSxDQVhKO0tBSkE7QUFBQSxJQWtCQSxnQkFBQSxHQUF1QixJQUFBLFdBQUEsQ0FDbkI7QUFBQSxNQUFBLEVBQUEsRUFBRyx1QkFBSDtBQUFBLE1BQ0EsSUFBQSxFQUFNLHFCQUROO0tBRG1CLENBbEJ2QixDQUFBO0FBQUEsSUFzQkEsZUFBQSxHQUFzQixJQUFBLFdBQUEsQ0FDbEI7QUFBQSxNQUFBLEVBQUEsRUFBSSwyQkFBSjtLQURrQixDQXRCdEIsQ0FBQTtBQUFBLElBeUJBLHNCQUFBLEdBQTZCLElBQUEsV0FBQSxDQUN6QjtBQUFBLE1BQUEsRUFBQSxFQUFHLG1CQUFIO0tBRHlCLENBekI3QixDQUFBO0FBQUEsSUE0QkEsTUFBTSxDQUFDLElBQVAsR0FBYyxFQTVCZCxDQUFBO0FBQUEsSUE4QkEsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCLENBQUEsQ0FBRSwwQkFBRixDQUE2QixDQUFDLFVBQTlCLENBQ2I7QUFBQSxNQUFBLFFBQUEsRUFBVSxTQUFDLENBQUQsR0FBQTtBQUNOLFlBQUEsRUFBQTtBQUFBLFFBQUEsQ0FBQSxDQUFFLHdCQUFGLENBQTJCLENBQUMsSUFBNUIsQ0FBaUMsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBQSxDQUFqQyxDQUFBLENBQUE7QUFBQSxRQUNBLEVBQUEsR0FBSyxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsQ0FETCxDQUFBO2VBRUEsZ0JBQWdCLENBQUMsSUFBakIsQ0FBc0IsRUFBdEIsRUFITTtNQUFBLENBQVY7S0FEYSxDQUFqQixDQTlCQSxDQUFBO0FBQUEsSUFxQ0EsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCLENBQUEsQ0FBRSwyQkFBRixDQUE4QixDQUFDLFVBQS9CLENBQ2I7QUFBQSxNQUFBLFFBQUEsRUFBVSxTQUFDLENBQUQsR0FBQTtBQUNOLFlBQUEsRUFBQTtlQUFBLEVBQUEsR0FBSyxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsRUFEQztNQUFBLENBQVY7S0FEYSxDQUFqQixDQXJDQSxDQUFBO0FBQUEsSUF5Q0EsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCLENBQUEsQ0FBRSwyQkFBRixDQUE4QixDQUFDLFVBQS9CLENBQ2I7QUFBQSxNQUFBLFFBQUEsRUFBVSxTQUFDLENBQUQsR0FBQTtBQUNOLFlBQUEsRUFBQTtlQUFBLEVBQUEsR0FBSyxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsRUFBTDtBQUNBO0FBQUE7OztXQUZNO01BQUEsQ0FBVjtLQURhLENBQWpCLENBekNBLENBQUE7V0FnREEsSUFBQyxDQUFBLFlBQUQsQ0FBQSxFQWpEWTtFQUFBLENBUGhCLENBQUE7O0FBQUEsa0NBNERBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDVixRQUFBLHlCQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUEzQixDQUFBO0FBQUEsSUFDQSxLQUFBLEdBQVEsUUFBUSxDQUFDLEtBQVQsQ0FBZSxHQUFmLENBRFIsQ0FBQTtBQUFBLElBRUEsUUFBQSxHQUFXLEtBQU0sQ0FBQSxLQUFLLENBQUMsTUFBTixHQUFlLENBQWYsQ0FGakIsQ0FBQTtBQUlBLElBQUEsSUFBRyxDQUFDLFFBQUEsS0FBWSxhQUFiLENBQUEsSUFBK0IsQ0FBQyxRQUFBLEtBQVksY0FBYixDQUEvQixJQUErRCxDQUFDLFFBQUEsS0FBWSxlQUFiLENBQWxFO0FBQ0ksTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFlBQVosRUFBMEIsUUFBMUIsQ0FBQSxDQUFBO2FBQ0EsVUFBQSxDQUFXLENBQUMsU0FBQSxHQUFBO0FBQ1IsUUFBQSxDQUFBLENBQUUsNkJBQUYsQ0FBZ0MsQ0FBQyxPQUFqQyxDQUF5QyxPQUF6QyxDQUFBLENBQUE7QUFBQSxRQUNBLENBQUEsQ0FBRSx1Q0FBQSxHQUEwQyxRQUExQyxHQUFxRCxJQUF2RCxDQUE0RCxDQUFDLE9BQTdELENBQXFFLE9BQXJFLENBREEsQ0FBQTtBQUFBLFFBRUEsQ0FBQSxDQUFFLHlDQUFGLENBQTRDLENBQUMsR0FBN0MsQ0FBaUQsU0FBakQsRUFBNEQsR0FBNUQsQ0FGQSxDQUFBO2VBR0EsQ0FBQSxDQUFFLDZCQUFGLENBQWdDLENBQUMsT0FBakMsQ0FBeUMsQ0FBQSxDQUFFLHVDQUFBLEdBQTBDLFFBQTFDLEdBQXFELElBQXZELENBQXpDLEVBSlE7TUFBQSxDQUFELENBQVgsRUFLRyxFQUxILEVBRko7S0FMVTtFQUFBLENBNURkLENBQUE7O0FBQUEsa0NBMkVBLFdBQUEsR0FBYSxTQUFDLE1BQUQsRUFBUyxHQUFULEdBQUE7QUFDVCxRQUFBLENBQUE7QUFBQSxJQUFBLENBQUEsQ0FBRSxHQUFGLENBQU0sQ0FBQyxHQUFQLENBQVcsVUFBWCxFQUF1QixVQUF2QixDQUFBLENBQUE7QUFBQSxJQUNBLENBQUEsR0FBSSxDQUFBLENBQUUsR0FBRixDQUFNLENBQUMsRUFBUCxDQUFVLENBQVYsQ0FBWSxDQUFDLE1BQWIsQ0FBQSxDQURKLENBQUE7QUFBQSxJQUVBLENBQUEsQ0FBRSxHQUFGLENBQU0sQ0FBQyxJQUFQLENBQVksU0FBQyxDQUFELEVBQUksRUFBSixHQUFBO0FBQ1IsTUFBQSxJQUFHLENBQUEsR0FBSSxDQUFBLENBQUUsRUFBRixDQUFLLENBQUMsTUFBTixDQUFBLENBQVA7ZUFBMkIsQ0FBQSxHQUFJLENBQUEsQ0FBRSxFQUFGLENBQUssQ0FBQyxNQUFOLENBQUEsRUFBL0I7T0FEUTtJQUFBLENBQVosQ0FGQSxDQUFBO0FBQUEsSUFLQSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFpQixDQUFqQixDQUxBLENBQUE7V0FNQSxDQUFBLENBQUUsR0FBRixDQUFNLENBQUMsR0FBUCxDQUFXLFVBQVgsRUFBdUIsVUFBdkIsRUFQUztFQUFBLENBM0ViLENBQUE7O0FBQUEsa0NBb0ZBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDWCxJQUFBLHVEQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsZ0JBQWdCLENBQUMsTUFBakIsQ0FBd0IsV0FBeEIsRUFBcUMsQ0FBckMsRUFBeUMsQ0FBekMsRUFBK0MsSUFBQyxDQUFBLFFBQUosR0FBa0IsQ0FBbEIsR0FBeUIsQ0FBckUsQ0FBZixDQUZBLENBQUE7QUFLQSxJQUFBLElBQUcsQ0FBQSxJQUFFLENBQUEsT0FBTDtBQUNJLE1BQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsVUFBVSxDQUFDLFdBQVgsQ0FBQSxDQUFmLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQWUsVUFBVSxDQUFDLFlBQVgsQ0FBQSxDQUFmLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLFVBQVUsQ0FBQyxTQUFYLENBQUEsQ0FBZixFQUhKO0tBTlc7RUFBQSxDQXBGZixDQUFBOzsrQkFBQTs7R0FIZ0MsY0FacEMsQ0FBQTs7QUFBQSxNQStHTSxDQUFDLE9BQVAsR0FBaUIscUJBL0dqQixDQUFBOzs7OztBQ0NBLElBQUEsMENBQUE7O0FBQUEsY0FBQSxHQUFpQixTQUFDLEVBQUQsRUFBSyxRQUFMLEdBQUE7QUFDYixNQUFBLFdBQUE7QUFBQSxFQUFBLFdBQUEsR0FBYyxNQUFNLENBQUMsVUFBckIsQ0FBQTtBQUFBLEVBRUEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxFQUFiLEVBQ0k7QUFBQSxJQUFBLENBQUEsRUFBRyxDQUFBLElBQUg7R0FESixDQUZBLENBQUE7U0FLQSxRQUFRLENBQUMsRUFBVCxDQUFZLEVBQVosRUFBZ0IsUUFBaEIsRUFDSTtBQUFBLElBQUEsQ0FBQSxFQUFHLFdBQUg7QUFBQSxJQUNBLFVBQUEsRUFBWSxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO2VBQ1IsY0FBQSxDQUFlLEVBQWYsRUFBb0IsUUFBcEIsRUFEUTtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRFo7R0FESixFQU5hO0FBQUEsQ0FBakIsQ0FBQTs7QUFBQSxTQWFBLEdBQVksU0FBQyxHQUFELEVBQU8sR0FBUCxFQUFXLEtBQVgsR0FBQTtBQUVSLE1BQUEscUJBQUE7QUFBQSxFQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFFBQVYsQ0FBbUIsUUFBbkIsQ0FBWixDQUFBO0FBQUEsRUFDQSxLQUFBLEdBQVEsTUFBTSxDQUFDLFVBRGYsQ0FBQTtBQUFBLEVBRUEsV0FBQSxHQUFjLE1BQU0sQ0FBQyxVQUZyQixDQUFBO0FBSUEsRUFBQSxJQUFHLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLEdBQXBCLElBQTJCLENBQUEsSUFBRSxDQUFBLFFBQWhDO0FBR0ksSUFBQSxDQUFBLEdBQUksR0FBQSxHQUFNLENBQUMsR0FBRyxDQUFDLElBQUosQ0FBUyxPQUFULENBQWlCLENBQUMsS0FBbEIsR0FBMEIsR0FBM0IsQ0FBVixDQUFBO1dBRUEsUUFBUSxDQUFDLEVBQVQsQ0FBWSxHQUFaLEVBQWtCLEdBQWxCLEVBQ0k7QUFBQSxNQUFBLENBQUEsRUFBRyxLQUFIO0FBQUEsTUFDQSxLQUFBLEVBQU0sS0FETjtBQUFBLE1BRUEsSUFBQSxFQUFLLE1BQU0sQ0FBQyxRQUZaO0FBQUEsTUFHQSxjQUFBLEVBQWdCLENBQUMsUUFBRCxDQUhoQjtBQUFBLE1BSUEsVUFBQSxFQUFZLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEtBQUQsR0FBQTtpQkFDUixjQUFBLENBQWUsR0FBZixFQUFxQixDQUFyQixFQURRO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKWjtLQURKLEVBTEo7R0FOUTtBQUFBLENBYlosQ0FBQTs7QUFBQSxlQWtDQSxHQUFrQixTQUFDLEdBQUQsRUFBTSxZQUFOLEdBQUE7QUFFZCxNQUFBLDhDQUFBO0FBQUEsRUFBQSxNQUFBLEdBQVMsWUFBWSxDQUFDLEtBQWIsQ0FBbUIsR0FBbkIsQ0FBVCxDQUFBO0FBQUEsRUFFQSxhQUFBLEdBQWdCLE1BQU0sQ0FBQyxVQUZ2QixDQUFBO0FBQUEsRUFHQSxRQUFBLEdBQVcsRUFIWCxDQUFBO0FBQUEsRUFLQSxLQUFBLEdBQVEsTUFBTyxDQUFBLENBQUEsQ0FMZixDQUFBO0FBQUEsRUFNQSxNQUFBLEdBQVMsUUFBQSxDQUFTLE1BQU8sQ0FBQSxDQUFBLENBQWhCLENBQUEsSUFBdUIsQ0FOaEMsQ0FBQTtBQVFBLFVBQU8sS0FBUDtBQUFBLFNBQ1MsTUFEVDtBQUVRLE1BQUEsUUFBUSxDQUFDLENBQVQsR0FBYSxDQUFBLEdBQUksTUFBakIsQ0FGUjtBQUNTO0FBRFQsU0FHUyxPQUhUO0FBSVEsTUFBQSxRQUFRLENBQUMsQ0FBVCxHQUFhLGFBQUEsR0FBZ0IsTUFBN0IsQ0FKUjtBQUdTO0FBSFQsU0FNUyxRQU5UO0FBT1EsTUFBQSxRQUFRLENBQUMsQ0FBVCxHQUFhLENBQUMsYUFBQSxHQUFjLEVBQWQsR0FBbUIsR0FBRyxDQUFDLEtBQUosQ0FBQSxDQUFBLEdBQVksRUFBaEMsQ0FBQSxHQUFzQyxNQUFuRCxDQVBSO0FBQUEsR0FSQTtTQWlCQSxRQUFRLENBQUMsR0FBVCxDQUFhLEdBQWIsRUFBbUIsUUFBbkIsRUFuQmM7QUFBQSxDQWxDbEIsQ0FBQTs7QUFBQSxNQTJETSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxPQUFELEdBQUE7QUFFYixNQUFBLHVTQUFBO0FBQUEsRUFBQSxHQUFBLEdBQU0sT0FBTyxDQUFDLEdBQWQsQ0FBQTtBQUFBLEVBQ0EsVUFBQSxHQUFhLEdBQUcsQ0FBQyxPQUFKLENBQVksd0JBQVosQ0FEYixDQUFBO0FBQUEsRUFFQSxtQkFBQSxHQUFzQixRQUFBLENBQVMsVUFBVSxDQUFDLEdBQVgsQ0FBZSxhQUFmLENBQVQsQ0FGdEIsQ0FBQTtBQUtBO0FBQ0ksSUFBQSxTQUFBLEdBQVksR0FBRyxDQUFDLElBQUosQ0FBQSxDQUFVLENBQUMsS0FBdkIsQ0FESjtHQUFBLGNBQUE7QUFJSSxJQURFLFVBQ0YsQ0FBQTtBQUFBLElBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxzQ0FBZCxDQUFBLENBSko7R0FMQTtBQUFBLEVBV0EsVUFBQSxHQUFhLEdBQUcsQ0FBQyxJQUFKLENBQVMsT0FBVCxDQVhiLENBQUE7QUFBQSxFQVlBLFVBQUEsR0FBYSxTQUFTLENBQUMsS0FBVixJQUFtQixDQVpoQyxDQUFBO0FBQUEsRUFhQSxjQUFBLEdBQWlCLFFBQUEsQ0FBUyxTQUFTLENBQUMsU0FBbkIsQ0FBQSxJQUFpQyxDQWJsRCxDQUFBO0FBQUEsRUFjQSxZQUFBLEdBQWUsU0FBUyxDQUFDLE9BQVYsSUFBcUIsS0FkcEMsQ0FBQTtBQUFBLEVBZUEsaUJBQUEsR0FBb0IsU0FBUyxDQUFDLFFBQVYsSUFBc0IsUUFmMUMsQ0FBQTtBQUFBLEVBbUJBLGVBQUEsQ0FBZ0IsR0FBaEIsRUFBc0IsaUJBQXRCLENBbkJBLENBQUE7QUFvQkEsRUFBQSxJQUFHLENBQUEsQ0FBRSxVQUFVLENBQUMsUUFBWCxDQUFvQixrQkFBcEIsQ0FBRCxDQUFKO0FBQ0ksSUFBQSxPQUFBLEdBQVUsR0FBRyxDQUFDLE1BQUosQ0FBQSxDQUFZLENBQUMsSUFBdkIsQ0FBQTtBQUFBLElBQ0EsUUFBQSxHQUFXLENBQUMsTUFBTSxDQUFDLFVBQVAsR0FBb0IsT0FBckIsQ0FBQSxHQUFnQyxNQUFNLENBQUMsVUFEbEQsQ0FBQTtBQUFBLElBR0EsVUFBQSxHQUFhLEdBQUEsR0FBTSxDQUFDLFVBQUEsR0FBYSxHQUFkLENBSG5CLENBQUE7QUFBQSxJQUtBLFNBQUEsQ0FBVSxHQUFWLEVBQWUsVUFBZixFQUEyQixVQUFBLEdBQVcsQ0FBdEMsQ0FMQSxDQURKO0dBcEJBO0FBQUEsRUE0QkEsSUFBQSxHQUFPLFVBQVUsQ0FBQyxNQUFYLENBQUEsQ0FBbUIsQ0FBQyxHQTVCM0IsQ0FBQTtBQUFBLEVBNkJBLElBQUEsR0FBTyxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsV0FBWixDQUFBLENBN0JQLENBQUE7QUFBQSxFQThCQSxVQUFBLEdBQVksVUFBVSxDQUFDLFdBQVgsQ0FBQSxDQTlCWixDQUFBO0FBQUEsRUFrQ0EsZUFBQSxHQUFrQixVQUFBLEdBQVcsSUFsQzdCLENBQUE7QUFBQSxFQW1DQSxrQkFBQSxHQUFxQixJQUFBLEdBQUssSUFuQzFCLENBQUE7QUFBQSxFQW9DQSxrQkFBQSxHQUFxQixrQkFBQSxHQUFxQixlQXBDMUMsQ0FBQTtBQUFBLEVBeUNBLG9CQUFBLEdBQXVCLHVCQUFBLEdBQTBCLFdBQUEsR0FBYyxDQXpDL0QsQ0FBQTtBQTJDQSxFQUFBLElBQUksVUFBVSxDQUFDLFFBQVgsQ0FBb0Isa0JBQXBCLENBQUEsSUFBMkMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFFBQVYsQ0FBbUIsUUFBbkIsQ0FBL0M7QUFDSSxJQUFBLFVBQVUsQ0FBQyxJQUFYLENBQUEsQ0FBQSxDQURKO0dBM0NBO0FBK0NBLFNBQU8sU0FBQyxHQUFELEdBQUE7QUFDSCxRQUFBLCtCQUFBO0FBQUEsSUFBQSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVgsQ0FBb0Isa0JBQXBCLENBQUQsQ0FBQSxJQUE2QyxDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxRQUFWLENBQW1CLFFBQW5CLENBQUQsQ0FBakQ7YUFDSSxRQUFRLENBQUMsRUFBVCxDQUFZLEdBQVosRUFBa0IsSUFBbEIsRUFDSTtBQUFBLFFBQUEsSUFBQSxFQUFLLElBQUksQ0FBQyxPQUFWO09BREosRUFESjtLQUFBLE1BQUE7QUFLSSxNQUFBLHVCQUFBLEdBQTBCLENBQUMsR0FBQSxHQUFNLGtCQUFQLENBQUEsR0FBNkIsQ0FBQyxrQkFBQSxHQUFxQixrQkFBdEIsQ0FBdkQsQ0FBQTtBQUNBLE1BQUEsSUFBRyxDQUFBLENBQUEsSUFBSyx1QkFBTCxJQUFLLHVCQUFMLElBQWdDLENBQWhDLENBQUg7QUFDSSxRQUFBLHVCQUFBLEdBQTBCLHVCQUExQixDQUFBO0FBQ0EsUUFBQSxJQUFHLFlBQUg7QUFDSSxVQUFBLHVCQUFBLEdBQTBCLENBQUEsR0FBSSx1QkFBOUIsQ0FESjtTQURBO0FBQUEsUUFJQSxNQUFBLEdBQVMsQ0FBQyxVQUFBLEdBQWEsdUJBQWQsQ0FBQSxHQUF5QyxVQUpsRCxDQUFBO0FBQUEsUUFLQSxNQUFBLEdBQVMsTUFBQSxHQUFTLG1CQUxsQixDQUFBO0FBQUEsUUFNQSxNQUFBLEdBQVMsTUFBQSxHQUFTLGNBTmxCLENBQUE7QUFBQSxRQVNBLFdBQUEsR0FBYyxJQUFJLENBQUMsR0FBTCxDQUFTLG9CQUFBLEdBQXVCLHVCQUFoQyxDQUFBLEdBQTJELENBVHpFLENBQUE7QUFBQSxRQVdBLG9CQUFBLEdBQXVCLHVCQVh2QixDQUFBO2VBZUEsUUFBUSxDQUFDLEVBQVQsQ0FBWSxHQUFaLEVBQWtCLElBQWxCLEVBQ0k7QUFBQSxVQUFBLENBQUEsRUFBRSxNQUFGO0FBQUEsVUFDQSxJQUFBLEVBQUssSUFBSSxDQUFDLE9BRFY7U0FESixFQWhCSjtPQU5KO0tBREc7RUFBQSxDQUFQLENBakRhO0FBQUEsQ0EzRGpCLENBQUE7Ozs7O0FDRUEsSUFBQSxxQkFBQTs7QUFBQSxNQUFBLEdBQVMsU0FBQyxDQUFELEdBQUE7U0FDUCxDQUFDLENBQUMsUUFBRixDQUFBLENBQVksQ0FBQyxPQUFiLENBQXFCLHVCQUFyQixFQUE4QyxHQUE5QyxFQURPO0FBQUEsQ0FBVCxDQUFBOztBQUFBLE1BSU0sQ0FBQyxPQUFPLENBQUMsS0FBZixHQUF1QixTQUFDLEVBQUQsR0FBQTtBQUduQixNQUFBLDhDQUFBO0FBQUEsRUFBQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLEVBQUYsQ0FBTixDQUFBO0FBQUEsRUFDQSxTQUFBLEdBQVksQ0FBQSxDQUFFLEVBQUYsQ0FBSyxDQUFDLElBQU4sQ0FBQSxDQURaLENBQUE7QUFBQSxFQUVBLEdBQUEsR0FBTSxDQUFBLENBQUUsRUFBRixDQUFLLENBQUMsSUFBTixDQUFBLENBQVksQ0FBQyxLQUFiLENBQW1CLEdBQW5CLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsRUFBN0IsQ0FGTixDQUFBO0FBQUEsRUFJQSxLQUFBLEdBQVEsR0FBQSxHQUFNLEtBSmQsQ0FBQTtBQUFBLEVBS0EsTUFBQSxHQUFTLEdBQUEsR0FBTSxLQUxmLENBQUE7QUFBQSxFQU9BLEVBQUEsR0FBUyxJQUFBLFdBQUEsQ0FDTDtBQUFBLElBQUEsT0FBQSxFQUFTLFNBQUEsR0FBQTthQUNMLEdBQUcsQ0FBQyxJQUFKLENBQVMsSUFBVCxFQURLO0lBQUEsQ0FBVDtBQUFBLElBRUEsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNSLEdBQUcsQ0FBQyxJQUFKLENBQVMsU0FBVCxFQURRO0lBQUEsQ0FGWjtHQURLLENBUFQsQ0FBQTtBQUFBLEVBYUEsTUFBQSxHQUFTLEVBYlQsQ0FBQTtBQUFBLEVBaUJBLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsR0FBaEIsRUFBc0IsSUFBdEIsRUFDUjtBQUFBLElBQUEsU0FBQSxFQUFVLENBQVY7QUFBQSxJQUNBLGVBQUEsRUFBZ0IsSUFEaEI7QUFBQSxJQUVBLElBQUEsRUFBSyxLQUFLLENBQUMsT0FGWDtHQURRLEVBS1I7QUFBQSxJQUFBLFNBQUEsRUFBVSxDQUFWO0dBTFEsQ0FBWixDQWpCQSxDQUFBO0FBQUEsRUF3QkEsTUFBTSxDQUFDLElBQVAsQ0FBWSxRQUFRLENBQUMsRUFBVCxDQUFZLEdBQVosRUFBa0IsR0FBbEIsRUFDUjtBQUFBLElBQUEsSUFBQSxFQUFLLEtBQUssQ0FBQyxPQUFYO0FBQUEsSUFFQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ04sVUFBQSxnQkFBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLFFBQUEsQ0FBUyxLQUFBLEdBQVEsUUFBQSxDQUFTLE1BQUEsR0FBUyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQWxCLENBQWpCLENBQVIsQ0FBQTtBQUFBLE1BQ0EsS0FBQSxHQUFRLE1BQUEsQ0FBTyxLQUFQLENBRFIsQ0FBQTtBQUFBLE1BRUEsR0FBQSxHQUFNLEtBQUssQ0FBQyxLQUFOLENBQVksRUFBWixDQUZOLENBQUE7QUFBQSxNQUdBLElBQUEsR0FBTyxFQUhQLENBQUE7QUFBQSxNQUlBLENBQUMsQ0FBQyxJQUFGLENBQU8sR0FBUCxFQUFZLFNBQUMsSUFBRCxFQUFPLEtBQVAsR0FBQTtlQUNSLElBQUEsSUFBWSxLQUFBLEtBQVMsR0FBYixHQUF1QixHQUF2QixHQUFnQyxRQUFBLEdBQVcsS0FBWCxHQUFtQixVQURuRDtNQUFBLENBQVosQ0FKQSxDQUFBO2FBTUEsR0FBRyxDQUFDLElBQUosQ0FBUyxJQUFULEVBUE07SUFBQSxDQUZWO0dBRFEsQ0FBWixDQXhCQSxDQUFBO0FBQUEsRUFxQ0EsRUFBRSxDQUFDLEdBQUgsQ0FBTyxNQUFQLENBckNBLENBQUE7U0F1Q0EsR0ExQ21CO0FBQUEsQ0FKdkIsQ0FBQTs7QUFBQSxhQW9EQSxHQUFnQixTQUFDLEdBQUQsRUFBSyxLQUFMLEVBQVcsR0FBWCxFQUFlLEdBQWYsRUFBbUIsR0FBbkIsR0FBQTtBQUlaLE1BQUEsZUFBQTtBQUFBLEVBQUEsT0FBQSxHQUFVLENBQUMsQ0FBQyxHQUFBLEdBQUksR0FBTCxDQUFBLEdBQVksQ0FBQyxHQUFBLEdBQUksR0FBTCxDQUFiLENBQUEsR0FBMEIsQ0FBcEMsQ0FBQTtBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsR0FBVSxHQURuQixDQUFBO0FBS0EsRUFBQSxJQUFHLEdBQUEsSUFBTyxHQUFQLElBQWUsR0FBQSxJQUFPLEdBQXpCO0FBRUksSUFBQSxJQUFHLElBQUksQ0FBQyxHQUFMLENBQVMsTUFBQSxHQUFTLEtBQUssQ0FBQyxJQUFOLENBQUEsQ0FBbEIsQ0FBQSxJQUFtQyxJQUF0QzthQUNJLEtBQUssQ0FBQyxPQUFOLENBQWUsTUFBZixFQUNJO0FBQUEsUUFBQSxTQUFBLEVBQVUsYUFBVjtBQUFBLFFBQ0EsSUFBQSxFQUFLLElBQUksQ0FBQyxPQURWO09BREosRUFESjtLQUZKO0dBVFk7QUFBQSxDQXBEaEIsQ0FBQTs7QUFBQSxNQXFFTSxDQUFDLE9BQU8sQ0FBQyxNQUFmLEdBQXdCLFNBQUMsS0FBRCxFQUFRLEdBQVIsRUFBYSxHQUFiLEVBQWtCLEdBQWxCLEdBQUE7QUFFcEIsTUFBQSw4RUFBQTtBQUFBLEVBQUEsTUFBQSxHQUFTLEdBQVQsQ0FBQTtBQUFBLEVBQ0EsTUFBQSxHQUFTLEdBRFQsQ0FBQTtBQUFBLEVBRUEsUUFBQSxHQUFXLEdBRlgsQ0FBQTtBQUFBLEVBSUEsR0FBQSxHQUFNLENBQUEsQ0FBRSxTQUFBLEdBQVUsS0FBWixDQUpOLENBQUE7QUFBQSxFQUtBLE1BQUEsR0FBUyxHQUFHLENBQUMsSUFBSixDQUFTLFFBQVQsQ0FMVCxDQUFBO0FBQUEsRUFPQSxLQUFBLEdBQVEsR0FBQSxDQUFBLFdBUFIsQ0FBQTtBQUFBLEVBUUEsS0FBSyxDQUFDLEVBQU4sR0FBVyxFQVJYLENBQUE7QUFBQSxFQVNBLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBVCxHQUFnQixLQVRoQixDQUFBO0FBQUEsRUFXQSxNQUFBLEdBQVMsRUFYVCxDQUFBO0FBWUEsT0FBQSxnREFBQTtzQkFBQTtBQUNJLElBQUEsTUFBQSxHQUFTLElBQUEsR0FBSSxDQUFDLEdBQUEsR0FBSSxDQUFDLENBQUEsR0FBRSxDQUFILENBQUwsQ0FBYixDQUFBO0FBQUEsSUFHQSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVEsQ0FBQyxFQUFULENBQVksS0FBWixFQUFvQixRQUFwQixFQUNSO0FBQUEsTUFBQSxDQUFBLEVBQUUsTUFBRjtLQURRLENBQVosQ0FIQSxDQURKO0FBQUEsR0FaQTtBQUFBLEVBcUJBLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixDQXJCQSxDQUFBO0FBQUEsRUF5QkEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUFiLENBekJBLENBQUE7QUEwQkEsU0FBTyxTQUFDLEdBQUQsR0FBQTtXQUNILGFBQUEsQ0FBYyxHQUFkLEVBQW9CLEtBQXBCLEVBQTRCLE1BQTVCLEVBQW9DLE1BQXBDLEVBQTRDLFFBQTVDLEVBREc7RUFBQSxDQUFQLENBNUJvQjtBQUFBLENBckV4QixDQUFBOztBQUFBLE1Bb0dNLENBQUMsT0FBTyxDQUFDLE1BQWYsR0FBd0IsU0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixRQUFqQixFQUEyQixJQUEzQixHQUFBO0FBRXBCLE1BQUEsYUFBQTtBQUFBLEVBQUEsS0FBQSxHQUFRLEdBQUEsQ0FBQSxXQUFSLENBQUE7QUFBQSxFQUNBLEtBQUssQ0FBQyxFQUFOLEdBQVcsRUFEWCxDQUFBO0FBQUEsRUFFQSxLQUFLLENBQUMsRUFBRSxDQUFDLElBQVQsR0FBZ0IsV0FGaEIsQ0FBQTtBQUFBLEVBSUEsTUFBQSxHQUFTLEVBSlQsQ0FBQTtBQUFBLEVBS0EsTUFBTSxDQUFDLElBQVAsQ0FBWSxRQUFRLENBQUMsRUFBVCxDQUFZLElBQVosRUFBbUIsUUFBbkIsRUFBOEI7QUFBQSxJQUFBLE9BQUEsRUFBUSxDQUFSO0dBQTlCLENBQVosQ0FMQSxDQUFBO0FBQUEsRUFPQSxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsQ0FQQSxDQUFBO0FBQUEsRUFTQSxLQUFLLENBQUMsTUFBTixDQUFhLElBQWIsQ0FUQSxDQUFBO0FBVUEsU0FBTyxTQUFDLEdBQUQsR0FBQTtXQUNILGFBQUEsQ0FBYyxHQUFkLEVBQW9CLEtBQXBCLEVBQTRCLE1BQTVCLEVBQW9DLE1BQXBDLEVBQTRDLFFBQTVDLEVBREc7RUFBQSxDQUFQLENBWm9CO0FBQUEsQ0FwR3hCLENBQUE7O0FBQUEsTUFtSE0sQ0FBQyxPQUFPLENBQUMsSUFBZixHQUFzQixTQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxHQUFBO0FBRWxCLE1BQUEsNENBQUE7QUFBQSxFQUFBLE1BQUEsR0FBUyxHQUFULENBQUE7QUFBQSxFQUNBLE1BQUEsR0FBUyxHQURULENBQUE7QUFBQSxFQUVBLFFBQUEsR0FBVyxHQUZYLENBQUE7QUFBQSxFQUlBLEdBQUEsR0FBTSxDQUFBLENBQUUsT0FBRixDQUpOLENBQUE7QUFBQSxFQU1BLEtBQUEsR0FBUSxHQUFBLENBQUEsV0FOUixDQUFBO0FBQUEsRUFPQSxLQUFLLENBQUMsRUFBTixHQUFXLEVBUFgsQ0FBQTtBQUFBLEVBUUEsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFULEdBQWdCLE9BUmhCLENBQUE7QUFBQSxFQVVBLE1BQUEsR0FBUyxFQVZULENBQUE7QUFBQSxFQVdBLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBUSxDQUFDLEVBQVQsQ0FBWSxHQUFaLEVBQWtCLFFBQWxCLEVBQTZCO0FBQUEsSUFBQSxHQUFBLEVBQUksQ0FBSjtHQUE3QixDQUFaLENBWEEsQ0FBQTtBQUFBLEVBZUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFWLENBZkEsQ0FBQTtBQUFBLEVBbUJBLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixDQW5CQSxDQUFBO0FBb0JBLFNBQU8sU0FBQyxHQUFELEdBQUE7V0FDSCxhQUFBLENBQWMsR0FBZCxFQUFvQixLQUFwQixFQUE0QixNQUE1QixFQUFvQyxNQUFwQyxFQUE0QyxRQUE1QyxFQURHO0VBQUEsQ0FBUCxDQXRCa0I7QUFBQSxDQW5IdEIsQ0FBQTs7Ozs7QUNIQSxJQUFBLE1BQUE7O0FBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxpQkFBUixDQUFULENBQUE7O0FBQUEsTUFHTSxDQUFDLE9BQU8sQ0FBQyxXQUFmLEdBQTZCLFNBQUEsR0FBQTtBQUV6QixNQUFBLFVBQUE7QUFBQSxFQUFBLEdBQUEsR0FBTSxDQUFBLENBQUUsc0JBQUYsQ0FBTixDQUFBO0FBQUEsRUFFQSxLQUFBLEdBQVEsR0FBQSxDQUFBLFdBRlIsQ0FBQTtBQUFBLEVBSUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxRQUFRLENBQUMsTUFBVCxDQUFnQixHQUFHLENBQUMsSUFBSixDQUFTLGdDQUFULENBQWhCLEVBQTRELEdBQTVELEVBQ047QUFBQSxJQUFBLENBQUEsRUFBRyxDQUFBLEVBQUg7QUFBQSxJQUNDLEtBQUEsRUFBTyxDQURSO0dBRE0sRUFJTjtBQUFBLElBQUEsQ0FBQSxFQUFHLENBQUg7QUFBQSxJQUNDLEtBQUEsRUFBTyxDQURSO0dBSk0sQ0FBVixFQU1HLEdBTkgsQ0FKQSxDQUFBO0FBQUEsRUFZQSxLQUFLLENBQUMsR0FBTixDQUFVLFFBQVEsQ0FBQyxNQUFULENBQWdCLEdBQUcsQ0FBQyxJQUFKLENBQVMsZ0NBQVQsQ0FBaEIsRUFBNEQsR0FBNUQsRUFDTjtBQUFBLElBQUEsQ0FBQSxFQUFHLENBQUEsRUFBSDtBQUFBLElBQ0MsS0FBQSxFQUFPLENBRFI7R0FETSxFQUlOO0FBQUEsSUFBQSxDQUFBLEVBQUcsQ0FBSDtBQUFBLElBQ0MsS0FBQSxFQUFPLENBRFI7R0FKTSxDQUFWLEVBTUcsTUFOSCxDQVpBLENBQUE7U0FvQkE7QUFBQSxJQUFBLENBQUEsRUFBRyxLQUFIO0FBQUEsSUFDQSxNQUFBLEVBQU8sR0FBRyxDQUFDLE1BQUosQ0FBQSxDQUFZLENBQUMsR0FEcEI7SUF0QnlCO0FBQUEsQ0FIN0IsQ0FBQTs7QUFBQSxNQTZCTSxDQUFDLE9BQU8sQ0FBQyxZQUFmLEdBQThCLFNBQUEsR0FBQTtBQUMxQixNQUFBLFVBQUE7QUFBQSxFQUFBLEdBQUEsR0FBTSxDQUFBLENBQUUsd0NBQUYsQ0FBTixDQUFBO0FBQUEsRUFFQSxLQUFBLEdBQVEsR0FBQSxDQUFBLFdBRlIsQ0FBQTtBQUFBLEVBSUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxRQUFRLENBQUMsTUFBVCxDQUFnQixHQUFHLENBQUMsSUFBSixDQUFTLEdBQVQsQ0FBaEIsRUFBZ0MsRUFBaEMsRUFDTjtBQUFBLElBQUEsU0FBQSxFQUFVLENBQVY7R0FETSxFQUdOO0FBQUEsSUFBQSxTQUFBLEVBQVUsQ0FBVjtHQUhNLENBQVYsQ0FKQSxDQUFBO0FBQUEsRUFVQSxLQUFLLENBQUMsR0FBTixDQUFVLFFBQVEsQ0FBQyxNQUFULENBQWdCLEdBQUcsQ0FBQyxJQUFKLENBQVMsR0FBVCxDQUFoQixFQUFnQyxHQUFoQyxFQUNOO0FBQUEsSUFBQSxLQUFBLEVBQU0sQ0FBTjtBQUFBLElBQ0EsUUFBQSxFQUFTLEdBRFQ7QUFBQSxJQUVBLGVBQUEsRUFBZ0IsSUFGaEI7R0FETSxFQUtOO0FBQUEsSUFBQSxLQUFBLEVBQU0sQ0FBTjtBQUFBLElBQ0EsUUFBQSxFQUFTLENBRFQ7QUFBQSxJQUVBLElBQUEsRUFBSyxJQUFJLENBQUMsT0FGVjtHQUxNLENBQVYsRUFRSSxNQVJKLENBVkEsQ0FBQTtTQW9CQTtBQUFBLElBQUEsQ0FBQSxFQUFHLEtBQUg7QUFBQSxJQUNBLE1BQUEsRUFBTyxHQUFHLENBQUMsTUFBSixDQUFBLENBQVksQ0FBQyxHQURwQjtJQXJCMEI7QUFBQSxDQTdCOUIsQ0FBQTs7QUFBQSxNQXNETSxDQUFDLE9BQU8sQ0FBQyxTQUFmLEdBQTJCLFNBQUEsR0FBQTtBQUN2QixNQUFBLFVBQUE7QUFBQSxFQUFBLEdBQUEsR0FBTSxDQUFBLENBQUUsMkNBQUYsQ0FBTixDQUFBO0FBQUEsRUFFQSxLQUFBLEdBQVEsR0FBQSxDQUFBLFdBRlIsQ0FBQTtBQUFBLEVBSUEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxRQUFRLENBQUMsTUFBVCxDQUFnQixHQUFoQixFQUFxQixHQUFyQixFQUNOO0FBQUEsSUFBQSxPQUFBLEVBQVMsQ0FBVDtBQUFBLElBQ0MsS0FBQSxFQUFPLEdBRFI7R0FETSxFQUlOO0FBQUEsSUFBQSxPQUFBLEVBQVMsQ0FBVDtBQUFBLElBQ0MsS0FBQSxFQUFPLENBRFI7R0FKTSxDQUFWLEVBTUcsR0FOSCxDQUpBLENBQUE7QUFBQSxFQVlBLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYixDQVpBLENBQUE7U0FhQTtBQUFBLElBQUEsQ0FBQSxFQUFFLEtBQUY7QUFBQSxJQUNBLE1BQUEsRUFBTyxHQUFHLENBQUMsTUFBSixDQUFBLENBQVksQ0FBQyxHQURwQjtJQWR1QjtBQUFBLENBdEQzQixDQUFBOzs7OztBQ0FBLElBQUEsd0JBQUE7RUFBQTs7NkJBQUE7O0FBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSwrQkFBUixDQUFiLENBQUE7O0FBQUE7QUFHSSxrQ0FBQSxDQUFBOztBQUFhLEVBQUEsc0JBQUMsSUFBRCxHQUFBO0FBQ1QsNkNBQUEsQ0FBQTtBQUFBLElBQUEsOENBQU0sSUFBTixDQUFBLENBRFM7RUFBQSxDQUFiOztBQUFBLHlCQUdBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFFUixJQUFBLElBQUMsQ0FBQSxlQUFELEdBQW1CLENBQUEsQ0FBRSxrQkFBRixDQUFuQixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsU0FBRCxDQUFBLENBREEsQ0FBQTtXQUdBLDJDQUFBLEVBTFE7RUFBQSxDQUhaLENBQUE7O0FBQUEseUJBV0EsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUVQLElBQUEsQ0FBQSxDQUFFLHFEQUFGLENBQXdELENBQUMsS0FBekQsQ0FBK0QsSUFBQyxDQUFBLFlBQWhFLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGVBQWUsQ0FBQyxJQUFqQixDQUFzQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxDQUFELEVBQUcsQ0FBSCxHQUFBO2VBQ2xCLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFpQixLQUFDLENBQUEsV0FBbEIsRUFEa0I7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QixDQURBLENBQUE7V0FNQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxFQUF0QixDQUF5QixPQUF6QixFQUFrQyxJQUFsQyxFQUF3QyxJQUFDLENBQUEsUUFBekMsRUFSTztFQUFBLENBWFgsQ0FBQTs7QUFBQSx5QkFzQkEsUUFBQSxHQUFVLFNBQUMsQ0FBRCxHQUFBO0FBQ04sUUFBQSxNQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxPQUFaLENBQW9CLE9BQXBCLENBQVQsQ0FBQTtBQUNBLElBQUEsSUFBRyxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVosQ0FBSDtBQUNJLE1BQUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVosQ0FBWixDQUFBLENBQUE7YUFDQSxDQUFDLENBQUMsY0FBRixDQUFBLEVBRko7S0FGTTtFQUFBLENBdEJWLENBQUE7O0FBQUEseUJBNEJBLFlBQUEsR0FBYyxTQUFDLENBQUQsR0FBQTtBQUVWLElBQUEsSUFBRyxDQUFBLENBQUcsQ0FBQyxDQUFDLENBQUMsSUFBRixLQUFVLFFBQVgsQ0FBQSxJQUF5QixDQUFDLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLElBQTVCLENBQUEsQ0FBQSxHQUFxQyxDQUF0QyxDQUExQixDQUFMO2FBQ0ksQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsT0FBcEIsQ0FBNEI7QUFBQSxRQUN4QixPQUFBLEVBQVMsQ0FEZTtPQUE1QixFQUVHLFNBQUEsR0FBQTtBQUNDLFFBQUEsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQSxDQUFBLENBQUE7ZUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBLEVBRkQ7TUFBQSxDQUZILEVBREo7S0FGVTtFQUFBLENBNUJkLENBQUE7O0FBQUEseUJBc0NBLFdBQUEsR0FBYSxTQUFDLENBQUQsR0FBQTtBQUNULFFBQUEsNEZBQUE7QUFBQSxJQUFBLEdBQUEsR0FBTSxDQUFBLENBQUUsSUFBRixDQUFOLENBQUE7QUFBQSxJQUNBLGFBQUEsR0FBZ0IsR0FBRyxDQUFDLElBQUosQ0FBUyxRQUFULENBRGhCLENBQUE7QUFBQSxJQUVBLGNBQUEsR0FBaUIsQ0FBQSxDQUFFLHVDQUFGLENBRmpCLENBQUE7QUFBQSxJQUdBLE1BQUEsR0FBUyxHQUFHLENBQUMsUUFBSixDQUFhLE1BQWIsQ0FIVCxDQUFBO0FBQUEsSUFLQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBLENBTEEsQ0FBQTtBQU9BLElBQUEsSUFBRyxHQUFHLENBQUMsUUFBSixDQUFhLGtCQUFiLENBQUg7QUFDSSxNQUFBLEVBQUEsR0FBSyxDQUFBLENBQUUsNEJBQUYsQ0FBTCxDQUFBO0FBQUEsTUFDQSxFQUFFLENBQUMsSUFBSCxDQUFRLFVBQVIsQ0FBbUIsQ0FBQyxJQUFwQixDQUF5QixHQUFHLENBQUMsSUFBSixDQUFTLFlBQVQsQ0FBc0IsQ0FBQyxJQUF2QixDQUFBLENBQXpCLENBREEsQ0FBQTtBQUFBLE1BRUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxpQkFBUixDQUEwQixDQUFDLElBQTNCLENBQWdDLEdBQUcsQ0FBQyxJQUFKLENBQVMsaUJBQVQsQ0FBMkIsQ0FBQyxJQUE1QixDQUFBLENBQWhDLENBRkEsQ0FBQTtBQUFBLE1BR0EsRUFBRSxDQUFDLElBQUgsQ0FBUSxnQkFBUixDQUF5QixDQUFDLEdBQTFCLENBQThCO0FBQUEsUUFBQyxlQUFBLEVBQWlCLE9BQUEsR0FBVSxHQUFHLENBQUMsSUFBSixDQUFTLFlBQVQsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixRQUE1QixDQUFWLEdBQWtELElBQXBFO09BQTlCLENBSEEsQ0FESjtLQVBBO0FBY0EsSUFBQSxJQUFJLENBQUEsQ0FBRSxHQUFBLEdBQU0sYUFBUixDQUFzQixDQUFDLElBQXZCLENBQUEsQ0FBQSxLQUFpQyxDQUFyQztBQUdJLE1BQUEsY0FBYyxDQUFDLFFBQWYsQ0FBQSxDQUF5QixDQUFDLElBQTFCLENBQStCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLENBQUQsRUFBRyxDQUFILEdBQUE7aUJBQzNCLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxRQUFMLENBQWMsMEJBQWQsRUFEMkI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEvQixDQUFBLENBQUE7QUFHQSxNQUFBLElBQUcsTUFBSDtBQUNJLFFBQUEsQ0FBQSxHQUFJLEdBQUcsQ0FBQyxJQUFKLENBQVMsVUFBVCxDQUFvQixDQUFDLEtBQXJCLENBQUEsQ0FBSixDQUFBO0FBQUEsUUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixDQUFDLENBQUMsSUFBRixDQUFBLENBQTNCLENBREEsQ0FESjtPQUhBO0FBQUEsTUFPQSxDQUFBLENBQUUsR0FBQSxHQUFNLGFBQVIsQ0FBc0IsQ0FBQyxRQUF2QixDQUFnQyxjQUFoQyxDQVBBLENBQUE7QUFBQSxNQVNBLEdBQUEsR0FBTSxDQUFBLENBQUUsc0JBQUYsQ0FUTixDQUFBO0FBQUEsTUFVQSxPQUFBLEdBQVUsR0FBRyxDQUFDLE1BQUosQ0FBQSxDQUFBLEdBQWUsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBQSxDQUFmLElBQXNDLENBQUEsQ0FBRSxjQUFGLENBQWlCLENBQUMsSUFBbEIsQ0FBdUIscUJBQXZCLENBQTZDLENBQUMsSUFBOUMsQ0FBQSxDQUFBLEtBQXdELENBVnhHLENBQUE7QUFBQSxNQVdBLFNBQUEsR0FBWSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsU0FBVixDQUFBLENBWFosQ0FBQTtBQUFBLE1BWUEsTUFBQSxHQUFZLE9BQUgsR0FBZ0IsQ0FBaEIsR0FBdUIsU0FaaEMsQ0FBQTtBQUFBLE1BYUEsUUFBQSxHQUFXLEdBQUcsQ0FBQyxHQUFKLENBQVEsVUFBUixFQUF1QixPQUFILEdBQWdCLE9BQWhCLEdBQTZCLFVBQWpELENBYlgsQ0FBQTtBQUFBLE1BY0EsR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFZLENBQUMsQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBQUEsR0FBcUIsR0FBRyxDQUFDLFdBQUosQ0FBQSxDQUF0QixDQUFBLEdBQTJDLENBQTVDLENBQUEsR0FBaUQsTUFBN0QsQ0FkTixDQUFBO0FBZUEsTUFBQSxJQUFHLENBQUEsT0FBQSxJQUFhLENBQUMsR0FBQSxHQUFNLFNBQVAsQ0FBaEI7QUFBdUMsUUFBQSxHQUFBLEdBQU0sU0FBTixDQUF2QztPQWZBO0FBQUEsTUFnQkEsR0FBRyxDQUFDLEdBQUosQ0FBUSxLQUFSLEVBQWUsR0FBQSxHQUFNLElBQXJCLENBaEJBLENBQUE7YUFxQkEsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsR0FBcEIsQ0FBd0IsU0FBeEIsRUFBbUMsQ0FBbkMsQ0FBcUMsQ0FBQyxLQUF0QyxDQUE0QyxDQUE1QyxDQUE4QyxDQUFDLElBQS9DLENBQUEsQ0FBcUQsQ0FBQyxPQUF0RCxDQUE4RDtBQUFBLFFBQzFELE9BQUEsRUFBUyxDQURpRDtPQUE5RCxFQXhCSjtLQWZTO0VBQUEsQ0F0Q2IsQ0FBQTs7c0JBQUE7O0dBRHVCLFdBRjNCLENBQUE7O0FBQUEsTUFxRk0sQ0FBQyxPQUFQLEdBQWlCLFlBckZqQixDQUFBOzs7OztBQ0NBLElBQUEsc0NBQUE7RUFBQTs7NkJBQUE7O0FBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSwrQkFBUixDQUFiLENBQUE7O0FBQUEsUUFDQSxHQUFXLE9BQUEsQ0FBUSw2QkFBUixDQURYLENBQUE7O0FBQUE7QUFLSSxzQ0FBQSxDQUFBOztBQUFhLEVBQUEsMEJBQUMsSUFBRCxHQUFBO0FBQ1QsdURBQUEsQ0FBQTtBQUFBLDZEQUFBLENBQUE7QUFBQSxpRUFBQSxDQUFBO0FBQUEsdURBQUEsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsaUVBQUEsQ0FBQTtBQUFBLCtEQUFBLENBQUE7QUFBQSw2REFBQSxDQUFBO0FBQUEsSUFBQSxrREFBTSxJQUFOLENBQUEsQ0FEUztFQUFBLENBQWI7O0FBQUEsNkJBSUEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBRVIsSUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLG1CQUFWLENBQVgsQ0FBQTtBQUVBLElBQUEsSUFBRyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsR0FBa0IsQ0FBckI7QUFDSSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksbUJBQVosQ0FBWCxDQURKO0tBRkE7QUFLQSxJQUFBLElBQUcsSUFBSSxDQUFDLElBQUwsS0FBYSxNQUFoQjtBQUNJLE1BQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFaLENBREo7S0FBQSxNQUFBO0FBR0ksTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBQVosQ0FISjtLQUxBO0FBQUEsSUFVQSxJQUFDLENBQUEsY0FBRCxHQUFrQixLQVZsQixDQUFBO0FBQUEsSUFXQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQVhwQixDQUFBO0FBQUEsSUFZQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FaaEIsQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLENBQXFCLFdBQXJCLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsT0FBdkMsQ0FiaEIsQ0FBQTtBQUFBLElBY0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLENBQUMsTUFBTCxJQUFlLENBZHpCLENBQUE7QUFBQSxJQWVBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsZ0JBQWQsQ0FmYixDQUFBO0FBQUEsSUFnQkEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxpQkFBZCxDQWhCZCxDQUFBO0FBQUEsSUFpQkEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsVUFBTCxJQUFtQixLQWpCakMsQ0FBQTtBQUFBLElBa0JBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDLE9BQUwsSUFBZ0IsSUFsQjVCLENBQUE7QUFBQSxJQW1CQSxJQUFDLENBQUEsbUJBQUQsR0FBdUIsS0FuQnZCLENBQUE7QUFBQSxJQW9CQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsS0FwQnRCLENBQUE7QUFBQSxJQXFCQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQXJCaEIsQ0FBQTtBQUFBLElBdUJBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0F2QkEsQ0FBQTtBQUFBLElBeUJBLElBQUMsQ0FBQSxTQUFELENBQUEsQ0F6QkEsQ0FBQTtXQTJCQSwrQ0FBQSxFQTdCUTtFQUFBLENBSlosQ0FBQTs7QUFBQSw2QkFtQ0EsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNQLElBQUEsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEVBQVYsQ0FBYSxRQUFiLEVBQXdCLElBQUMsQ0FBQSxhQUF6QixDQUFBLENBQUE7QUFBQSxJQUVBLENBQUEsQ0FBRSxJQUFDLENBQUEsR0FBSCxDQUFPLENBQUMsRUFBUixDQUFXLE9BQVgsRUFBb0IsZ0JBQXBCLEVBQXNDLElBQUMsQ0FBQSxTQUF2QyxDQUZBLENBQUE7QUFBQSxJQUdBLENBQUEsQ0FBRSxJQUFDLENBQUEsR0FBSCxDQUFPLENBQUMsRUFBUixDQUFXLE9BQVgsRUFBb0IsaUJBQXBCLEVBQXVDLElBQUMsQ0FBQSxTQUF4QyxDQUhBLENBQUE7QUFJQSxJQUFBLElBQUcsSUFBQyxDQUFBLFFBQUQsS0FBYSxJQUFoQjtBQUNJLE1BQUEsQ0FBQSxDQUFFLElBQUMsQ0FBQSxHQUFILENBQU8sQ0FBQyxFQUFSLENBQVcsT0FBWCxFQUFvQixtQkFBcEIsRUFBeUMsSUFBQyxDQUFBLGdCQUExQyxDQUFBLENBQUE7QUFBQSxNQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsR0FBSCxDQUFPLENBQUMsRUFBUixDQUFXLFdBQVgsRUFBd0IsbUJBQXhCLEVBQTZDLElBQUMsQ0FBQSxpQkFBOUMsQ0FEQSxDQUFBO2FBRUEsQ0FBQSxDQUFFLElBQUMsQ0FBQSxHQUFILENBQU8sQ0FBQyxFQUFSLENBQVcsWUFBWCxFQUF5QixtQkFBekIsRUFBOEMsSUFBQyxDQUFBLGtCQUEvQyxFQUhKO0tBTE87RUFBQSxDQW5DWCxDQUFBOztBQUFBLDZCQThDQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFDZCxJQUFBLE1BQU0sQ0FBQyxhQUFQLENBQXFCLElBQUMsQ0FBQSxZQUF0QixDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsbUJBQUQsR0FBdUIsS0FGVDtFQUFBLENBOUNsQixDQUFBOztBQUFBLDZCQWtEQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7QUFDZixJQUFBLE1BQU0sQ0FBQyxhQUFQLENBQXFCLElBQUMsQ0FBQSxZQUF0QixDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsS0FGUDtFQUFBLENBbERuQixDQUFBOztBQUFBLDZCQXNEQSxrQkFBQSxHQUFvQixTQUFBLEdBQUE7QUFDaEIsSUFBQSxJQUFHLElBQUMsQ0FBQSxtQkFBRCxLQUF3QixLQUEzQjtBQUNJLE1BQUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsV0FBQSxDQUFZLENBQUMsU0FBQSxHQUFBO2VBQ3pCLENBQUEsQ0FBRSwrQkFBRixDQUFrQyxDQUFDLE9BQW5DLENBQTJDLE9BQTNDLEVBRHlCO01BQUEsQ0FBRCxDQUFaLEVBRWIsSUFGYSxDQUFoQixDQUFBO2FBR0EsSUFBQyxDQUFBLGtCQUFELEdBQXNCLE1BSjFCO0tBRGdCO0VBQUEsQ0F0RHBCLENBQUE7O0FBQUEsNkJBNkRBLFNBQUEsR0FBVyxTQUFDLENBQUQsR0FBQTtBQUNQLFFBQUEsU0FBQTtBQUFBLElBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFSLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBTSxJQUFDLENBQUEsT0FEUCxDQUFBO1dBR0EsUUFBUSxDQUFDLEVBQVQsQ0FBWSxDQUFBLENBQUUsR0FBRixDQUFaLEVBQW9CLEVBQXBCLEVBQ0k7QUFBQSxNQUFBLE9BQUEsRUFBUyxDQUFUO0FBQUEsTUFDQSxLQUFBLEVBQU8sR0FEUDtBQUFBLE1BRUEsVUFBQSxFQUFZLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDUixVQUFBLElBQUksQ0FBQyxTQUFMLENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxRQUFRLENBQUMsR0FBVCxDQUFhLENBQUEsQ0FBRSxHQUFGLENBQWIsRUFDSTtBQUFBLFlBQUEsS0FBQSxFQUFPLENBQVA7V0FESixDQURBLENBQUE7aUJBSUEsUUFBUSxDQUFDLEVBQVQsQ0FBWSxDQUFBLENBQUUsR0FBRixDQUFaLEVBQW9CLEdBQXBCLEVBQ0k7QUFBQSxZQUFBLE9BQUEsRUFBUyxDQUFUO0FBQUEsWUFDQSxLQUFBLEVBQU8sR0FEUDtXQURKLEVBTFE7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZaO0tBREosRUFKTztFQUFBLENBN0RYLENBQUE7O0FBQUEsNkJBK0VBLFNBQUEsR0FBVyxTQUFDLENBQUQsR0FBQTtBQUNQLFFBQUEsU0FBQTtBQUFBLElBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFSLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBTSxJQUFDLENBQUEsT0FEUCxDQUFBO1dBR0EsUUFBUSxDQUFDLEVBQVQsQ0FBWSxDQUFBLENBQUUsR0FBRixDQUFaLEVBQW9CLEVBQXBCLEVBQ0k7QUFBQSxNQUFBLE9BQUEsRUFBUyxDQUFUO0FBQUEsTUFDQSxLQUFBLEVBQU8sR0FEUDtBQUFBLE1BRUEsVUFBQSxFQUFZLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDUixVQUFBLElBQUksQ0FBQyxTQUFMLENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxRQUFRLENBQUMsR0FBVCxDQUFhLENBQUEsQ0FBRSxHQUFGLENBQWIsRUFDSTtBQUFBLFlBQUEsS0FBQSxFQUFPLElBQVA7V0FESixDQURBLENBQUE7aUJBSUEsUUFBUSxDQUFDLEVBQVQsQ0FBWSxDQUFBLENBQUUsR0FBRixDQUFaLEVBQW9CLEdBQXBCLEVBQ0k7QUFBQSxZQUFBLE9BQUEsRUFBUyxDQUFUO0FBQUEsWUFDQSxLQUFBLEVBQU8sQ0FEUDtBQUFBLFlBRUEsS0FBQSxFQUFPLEdBRlA7V0FESixFQUxRO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGWjtLQURKLEVBSk87RUFBQSxDQS9FWCxDQUFBOztBQUFBLDZCQW1HQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1AsUUFBQSxxQkFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsUUFBVixDQUFtQixPQUFuQixDQUFYLENBQUE7QUFBQSxJQUVBLFNBQUEsR0FBWSxDQUFBLENBQUUsNENBQUYsQ0FGWixDQUFBO0FBQUEsSUFHQSxVQUFBLEdBQWEsQ0FBQSxDQUFFLDZDQUFGLENBSGIsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksU0FBWixFQUF1QixVQUF2QixDQUxBLENBQUE7V0FPQSxDQUFBLENBQUUsWUFBRixDQUFlLENBQUMsRUFBaEIsQ0FBbUIsT0FBbkIsRUFBNEIsU0FBQSxHQUFBO0FBQ3hCLFVBQUEsSUFBQTtBQUFBLE1BQUEsQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLFFBQUwsQ0FBYyxRQUFkLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFPLENBQUEsQ0FBRSxJQUFGLENBRFAsQ0FBQTthQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDUCxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsV0FBUixDQUFvQixRQUFwQixFQUE4QixHQUE5QixFQURPO01BQUEsQ0FBWCxFQUh3QjtJQUFBLENBQTVCLEVBUk87RUFBQSxDQW5HWCxDQUFBOztBQUFBLDZCQWtIQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ1gsUUFBQSxVQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsR0FBbEIsQ0FBc0IsT0FBdEIsRUFBK0IsTUFBL0IsQ0FBQSxDQUFBO0FBQ0EsSUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBYjtBQUNJLE1BQUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxHQUFkLENBQWtCLE9BQWxCLEVBQTRCLE1BQTVCLENBQUEsQ0FESjtLQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsTUFBRCxHQUFVLENBQWI7QUFDRCxNQUFBLElBQUMsQ0FBQSxZQUFZLENBQUMsR0FBZCxDQUFrQixPQUFsQixFQUE0QixLQUE1QixDQUFBLENBREM7S0FBQSxNQUFBO0FBR0QsTUFBQSxJQUFDLENBQUEsWUFBWSxDQUFDLEdBQWQsQ0FBa0IsT0FBbEIsRUFBNEIsWUFBNUIsQ0FBQSxDQUhDO0tBSEw7QUFBQSxJQVFBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLFlBQVksQ0FBQyxLQUFkLENBQUEsQ0FBcUIsQ0FBQyxVQUF0QixDQUFBLENBUmIsQ0FBQTtBQUFBLElBU0EsVUFBQSxHQUFhLElBQUMsQ0FBQSxZQUFZLENBQUMsTUFUM0IsQ0FBQTtBQUFBLElBV0EsSUFBQyxDQUFBLFlBQVksQ0FBQyxHQUFkLENBQWtCLE9BQWxCLEVBQTJCLElBQUMsQ0FBQSxTQUE1QixDQVhBLENBQUE7QUFBQSxJQVlBLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxHQUFsQixDQUFzQixPQUF0QixFQUErQixVQUFBLEdBQWMsSUFBQyxDQUFBLFNBQTlDLENBWkEsQ0FBQTtBQUFBLElBYUEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxJQUFDLENBQUEsZ0JBQWQsRUFDSTtBQUFBLE1BQUEsQ0FBQSxFQUFHLENBQUEsSUFBRSxDQUFBLFlBQUYsR0FBaUIsSUFBQyxDQUFBLFNBQXJCO0tBREosQ0FiQSxDQUFBO0FBZ0JBLElBQUEsSUFBRyxDQUFBLElBQUUsQ0FBQSxjQUFMO2FBQ0ksSUFBQyxDQUFBLGVBQUQsQ0FBQSxFQURKO0tBakJXO0VBQUEsQ0FsSGYsQ0FBQTs7QUFBQSw2QkF1SUEsZUFBQSxHQUFpQixTQUFBLEdBQUE7QUFDYixRQUFBLGNBQUE7QUFBQSxJQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsWUFBWSxDQUFDLE1BQTNCLENBQUE7QUFFQSxJQUFBLElBQUcsSUFBQyxDQUFBLE1BQUo7QUFBZ0IsTUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBQSxDQUFBLENBQWhCO0tBRkE7QUFBQSxJQUlBLEVBQUEsR0FBSyxDQUFBLENBQUUsSUFBQyxDQUFDLEdBQUosQ0FBUSxDQUFDLElBQVQsQ0FBYyxJQUFkLENBSkwsQ0FBQTtBQU9BLElBQUEsSUFBRyxJQUFDLENBQUEsVUFBSjtBQUNJLE1BQUEsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFBLENBREo7S0FQQTtBQVVBLElBQUEsSUFBRyxJQUFDLENBQUEsTUFBRCxHQUFVLENBQWI7QUFDSSxNQUFBLElBQUcsSUFBQyxDQUFBLFVBQUo7QUFDSSxRQUFBLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsTUFBQSxDQUFPLEdBQUEsR0FBTSxFQUFOLEdBQVcsb0JBQWxCLEVBQXVDO0FBQUEsVUFDbkQsSUFBQSxFQUFLLElBRDhDO0FBQUEsVUFFbkQsVUFBQSxFQUFZLElBRnVDO0FBQUEsVUFHbkQsYUFBQSxFQUFlLElBQUMsQ0FBQSxNQUhtQztBQUFBLFVBSW5ELFVBQUEsRUFBWSxHQUFBLEdBQU0sRUFBTixHQUFXLHFCQUo0QjtBQUFBLFVBS25ELGlCQUFBLEVBQW1CLElBTGdDO0FBQUEsVUFNbkQsWUFBQSxFQUFjLElBQUMsQ0FBQSxrQkFOb0M7QUFBQSxVQU9uRCxVQUFBLEVBQVksSUFBQyxDQUFBLGdCQVBzQztBQUFBLFVBUW5ELGtCQUFBLEVBQW9CLElBQUMsQ0FBQSxrQkFSOEI7QUFBQSxVQVNuRCxnQkFBQSxFQUFrQixJQUFDLENBQUEsZ0JBVGdDO0FBQUEsVUFVbkQsY0FBQSxFQUFnQixJQUFDLENBQUEsTUFWa0M7U0FBdkMsQ0FBaEIsQ0FESjtPQUFBLE1BQUE7QUFjSSxRQUFBLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsTUFBQSxDQUFPLEdBQUEsR0FBTSxFQUFOLEdBQVcsb0JBQWxCLEVBQXVDO0FBQUEsVUFDbkQsSUFBQSxFQUFLLElBRDhDO0FBQUEsVUFFbkQsVUFBQSxFQUFZLElBRnVDO0FBQUEsVUFHbkQsYUFBQSxFQUFlLElBQUMsQ0FBQSxNQUhtQztBQUFBLFVBSW5ELGNBQUEsRUFBZ0IsSUFBQyxDQUFBLE1BSmtDO0FBQUEsVUFLbkQsWUFBQSxFQUFjLElBQUMsQ0FBQSxrQkFMb0M7QUFBQSxVQU1uRCxVQUFBLEVBQVksSUFBQyxDQUFBLGdCQU5zQztBQUFBLFVBT25ELGtCQUFBLEVBQW9CLElBQUMsQ0FBQSxrQkFQOEI7QUFBQSxVQVFuRCxnQkFBQSxFQUFrQixJQUFDLENBQUEsZ0JBUmdDO1NBQXZDLENBQWhCLENBZEo7T0FESjtLQUFBLE1BQUE7QUEyQkksTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLE1BQUEsQ0FBTyxHQUFBLEdBQU0sRUFBTixHQUFXLG9CQUFsQixFQUF1QztBQUFBLFFBQ25ELElBQUEsRUFBSyxJQUQ4QztBQUFBLFFBRW5ELFVBQUEsRUFBWSxJQUZ1QztBQUFBLFFBR25ELGFBQUEsRUFBZSxDQUhvQztBQUFBLFFBSW5ELGNBQUEsRUFBZ0IsQ0FKbUM7QUFBQSxRQUtuRCxZQUFBLEVBQWMsSUFBQyxDQUFBLGtCQUxvQztBQUFBLFFBTW5ELFVBQUEsRUFBWSxJQUFDLENBQUEsZ0JBTnNDO0FBQUEsUUFPbkQsa0JBQUEsRUFBb0IsSUFBQyxDQUFBLGtCQVA4QjtBQUFBLFFBUW5ELGdCQUFBLEVBQWtCLElBQUMsQ0FBQSxnQkFSZ0M7T0FBdkMsQ0FBaEIsQ0EzQko7S0FWQTtBQUFBLElBZ0RBLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBaERsQixDQUFBO0FBa0RBLElBQUEsSUFBRyxJQUFDLENBQUEsUUFBRCxLQUFhLElBQWhCO2FBQ0ksSUFBQyxDQUFBLFlBQUQsR0FBZ0IsV0FBQSxDQUFZLENBQUMsU0FBQSxHQUFBO2VBQ3pCLENBQUEsQ0FBRSwrQkFBRixDQUFrQyxDQUFDLE9BQW5DLENBQTJDLE9BQTNDLEVBRHlCO01BQUEsQ0FBRCxDQUFaLEVBRWIsSUFGYSxFQURwQjtLQW5EYTtFQUFBLENBdklqQixDQUFBOztBQUFBLDZCQWdNQSxrQkFBQSxHQUFvQixTQUFBLEdBQUE7QUFDaEIsSUFBQSxDQUFBLENBQUUsSUFBQyxDQUFDLEdBQUosQ0FBUSxDQUFDLE9BQVQsQ0FBaUIsa0JBQWpCLENBQW9DLENBQUMsUUFBckMsQ0FBOEMsU0FBOUMsQ0FBQSxDQUFBO1dBQ0EsQ0FBQSxDQUFFLElBQUMsQ0FBQyxHQUFKLENBQVEsQ0FBQyxJQUFULENBQWMsa0JBQWQsQ0FBaUMsQ0FBQyxRQUFsQyxDQUEyQyxTQUEzQyxFQUZnQjtFQUFBLENBaE1wQixDQUFBOztBQUFBLDZCQW9NQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFDZCxRQUFBLElBQUE7QUFBQSxJQUFBLENBQUEsQ0FBRSxJQUFDLENBQUMsR0FBSixDQUFRLENBQUMsT0FBVCxDQUFpQixrQkFBakIsQ0FBb0MsQ0FBQyxXQUFyQyxDQUFpRCxTQUFqRCxDQUFBLENBQUE7QUFBQSxJQUNBLENBQUEsQ0FBRSxJQUFDLENBQUMsR0FBSixDQUFRLENBQUMsSUFBVCxDQUFjLGtCQUFkLENBQWlDLENBQUMsV0FBbEMsQ0FBOEMsU0FBOUMsQ0FEQSxDQUFBO0FBR0EsSUFBQSxJQUFHLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBRCxLQUFhLElBQWQsQ0FBSjtBQUNJLE1BQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFRLENBQUMsV0FBVixDQUFBLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsSUFBN0IsQ0FBUCxDQUFBO0FBQUEsTUFDQSxDQUFBLENBQUUsMkNBQUYsQ0FBOEMsQ0FBQyxXQUEvQyxDQUEyRCxRQUEzRCxDQURBLENBQUE7QUFBQSxNQUVBLENBQUEsQ0FBRSwyQ0FBRixDQUE4QyxDQUFDLFdBQS9DLENBQTJELFFBQTNELENBRkEsQ0FBQTtBQUFBLE1BR0EsQ0FBQSxDQUFFLDhCQUFBLEdBQWlDLElBQW5DLENBQXdDLENBQUMsUUFBekMsQ0FBa0QsUUFBbEQsQ0FIQSxDQUFBO0FBQUEsTUFJQSxDQUFBLENBQUUsOEJBQUEsR0FBaUMsSUFBbkMsQ0FBd0MsQ0FBQyxNQUF6QyxDQUFBLENBQWlELENBQUMsUUFBbEQsQ0FBMkQsUUFBM0QsQ0FKQSxDQURKO0tBSEE7QUFVQSxJQUFBLElBQUksSUFBQyxDQUFBLFFBQUw7YUFDSSxJQUFDLENBQUEsUUFBUSxDQUFDLFVBQVYsQ0FBcUIsQ0FBQSxDQUFFLElBQUMsQ0FBQyxHQUFKLENBQVEsQ0FBQyxJQUFULENBQWMsc0JBQWQsQ0FBcUMsQ0FBQyxJQUF0QyxDQUEyQyxJQUEzQyxDQUFyQixFQURKO0tBWGM7RUFBQSxDQXBNbEIsQ0FBQTs7QUFBQSw2QkFrTkEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNYLFFBQUEsT0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLENBQUEsQ0FBRSx1Q0FBRixDQUFWLENBQUE7V0FDQSxDQUFBLENBQUUsSUFBQyxDQUFDLEdBQUosQ0FBUSxDQUFDLElBQVQsQ0FBYyxtQkFBZCxDQUFrQyxDQUFDLFFBQW5DLENBQTRDLGVBQTVDLENBQTRELENBQUMsTUFBN0QsQ0FBb0UsT0FBcEUsRUFGVztFQUFBLENBbE5mLENBQUE7O0FBQUEsNkJBdU5BLElBQUEsR0FBTSxTQUFDLEVBQUQsRUFBSyxPQUFMLEdBQUE7QUFFRixRQUFBLFdBQUE7QUFBQSxJQUFBLElBQUcsQ0FBQSxPQUFIO0FBQW9CLE1BQUEsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE9BQVYsQ0FBa0I7QUFBQSxRQUFFLFNBQUEsRUFBVyxDQUFBLENBQUUsR0FBQSxHQUFNLENBQUMsQ0FBQSxDQUFFLElBQUMsQ0FBQSxHQUFILENBQU8sQ0FBQyxJQUFSLENBQWEsSUFBYixDQUFELENBQVIsQ0FBNkIsQ0FBQyxNQUE5QixDQUFBLENBQXNDLENBQUMsR0FBcEQ7T0FBbEIsQ0FBQSxDQUFwQjtLQUFBO0FBQUEsSUFFQSxPQUFBLEdBQVUsQ0FBQSxDQUFFLG1CQUFBLEdBQW9CLEVBQXBCLEdBQXVCLElBQXpCLENBQTZCLENBQUMsSUFBOUIsQ0FBbUMsT0FBbkMsQ0FGVixDQUFBO0FBQUEsSUFJQSxFQUFBLEdBQUssR0FBQSxDQUFBLFdBSkwsQ0FBQTtBQUFBLElBTUEsRUFBRSxDQUFDLEdBQUgsQ0FBTyxRQUFRLENBQUMsRUFBVCxDQUFZLElBQUMsQ0FBQSxnQkFBYixFQUFnQyxFQUFoQyxFQUNIO0FBQUEsTUFBQSxTQUFBLEVBQVUsQ0FBVjtLQURHLENBQVAsQ0FOQSxDQUFBO0FBQUEsSUFTQSxFQUFFLENBQUMsV0FBSCxDQUFlLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7ZUFDWCxLQUFDLENBQUEsUUFBUSxDQUFDLE9BQVYsQ0FBa0IsT0FBbEIsRUFBMkIsQ0FBM0IsRUFEVztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWYsQ0FUQSxDQUFBO0FBQUEsSUFZQSxFQUFFLENBQUMsR0FBSCxDQUFPLFFBQVEsQ0FBQyxFQUFULENBQVksSUFBQyxDQUFBLGdCQUFiLEVBQWdDLEVBQWhDLEVBQ0g7QUFBQSxNQUFBLFNBQUEsRUFBVSxDQUFWO0tBREcsQ0FBUCxDQVpBLENBQUE7V0FlQSxJQUFDLENBQUEsWUFBRCxHQUFnQixRQWpCZDtFQUFBLENBdk5OLENBQUE7OzBCQUFBOztHQUYyQixXQUgvQixDQUFBOztBQUFBLE1BK1BNLENBQUMsT0FBUCxHQUFpQixnQkEvUGpCLENBQUE7Ozs7O0FDQUEsSUFBQSxxQ0FBQTtFQUFBOzs2QkFBQTs7QUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLCtCQUFSLENBQWIsQ0FBQTs7QUFBQSxZQUNBLEdBQWUsT0FBQSxDQUFRLHVCQUFSLENBRGYsQ0FBQTs7QUFBQTtBQUtJLGlDQUFBLENBQUE7O0FBQWEsRUFBQSxxQkFBQyxJQUFELEdBQUE7QUFDVCx5RUFBQSxDQUFBO0FBQUEsSUFBQSw2Q0FBTSxJQUFOLENBQUEsQ0FEUztFQUFBLENBQWI7O0FBQUEsd0JBSUEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBRVIsUUFBQSxNQUFBO0FBQUEsSUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGNBQVosRUFBNEIsSUFBNUIsQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUksQ0FBQyxJQUFMLElBQWEsSUFGckIsQ0FBQTtBQUFBLElBR0EsTUFBQSxHQUFTLElBQUksQ0FBQyxNQUFMLElBQWUsSUFIeEIsQ0FBQTtBQUtBLElBQUEsSUFBRyxDQUFDLGNBQUQsQ0FBSDtBQUNJLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFBLENBQUUsTUFBRixDQUFYLENBREo7S0FMQTtBQVFBLElBQUEsSUFBRyxDQUFBLENBQUUsSUFBQyxDQUFBLElBQUQsS0FBUyxJQUFWLENBQUo7QUFDSSxNQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsVUFBVixDQUFiLENBREo7S0FBQSxNQUFBO0FBR0ksTUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLElBQVYsQ0FBYixDQUhKO0tBUkE7QUFBQSxJQWFBLElBQUMsQ0FBQSxlQUFELEdBQW1CLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFrQixjQUFsQixDQWJuQixDQUFBO1dBZUEsMENBQUEsRUFqQlE7RUFBQSxDQUpaLENBQUE7O0FBQUEsd0JBdUJBLFNBQUEsR0FBVyxTQUFBLEdBQUE7V0FFUCxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsQ0FBRCxFQUFHLENBQUgsR0FBQTtBQUNaLFlBQUEsaUJBQUE7QUFBQSxRQUFBLElBQUEsR0FBTyxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsSUFBTCxDQUFVLGVBQVYsQ0FBUCxDQUFBO0FBRUEsUUFBQSxJQUFHLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBakI7QUFDSSxVQUFBLFdBQUEsR0FBa0IsSUFBQSxNQUFBLENBQU8sSUFBSyxDQUFBLENBQUEsQ0FBWixDQUFsQixDQUFBO2lCQUNBLFdBQVcsQ0FBQyxFQUFaLENBQWUsS0FBZixFQUF1QixLQUFDLENBQUEsc0JBQXhCLEVBRko7U0FIWTtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCLEVBRk87RUFBQSxDQXZCWCxDQUFBOztBQUFBLHdCQW1DQSxzQkFBQSxHQUF3QixTQUFDLENBQUQsR0FBQTtBQUVwQixRQUFBLGFBQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLE9BQVosQ0FBb0IsZUFBcEIsQ0FBVixDQUFBO0FBQ0EsSUFBQSxJQUFJLE9BQU8sQ0FBQyxJQUFSLENBQUEsQ0FBQSxLQUFrQixDQUF0QjtBQUNJLE1BQUEsT0FBQSxHQUFVLENBQUMsQ0FBQyxNQUFaLENBREo7S0FEQTtBQUlBLElBQUEsSUFBRyxPQUFPLENBQUMsSUFBUixDQUFhLE1BQWIsQ0FBQSxLQUF3QixPQUEzQjtBQUNJLE1BQUEsSUFBSSxPQUFPLENBQUMsSUFBUixDQUFhLE1BQWIsQ0FBSjtBQUNJLFFBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQUFPLENBQUMsSUFBUixDQUFhLE1BQWIsQ0FBWixDQURKO09BQUEsTUFBQTtBQUdJLFFBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQUFPLENBQUMsUUFBUixDQUFpQixLQUFqQixDQUF1QixDQUFDLElBQXhCLENBQTZCLEtBQTdCLENBQVosQ0FISjtPQURKO0tBSkE7QUFBQSxJQVNBLElBQUEsR0FDSTtBQUFBLE1BQUEsR0FBQSxFQUFJLE9BQU8sQ0FBQyxJQUFSLENBQWEsS0FBYixDQUFKO0FBQUEsTUFDQSxJQUFBLEVBQUssT0FBTyxDQUFDLElBQVIsQ0FBYSxNQUFiLENBREw7QUFBQSxNQUVBLE1BQUEsRUFBTyxJQUFDLENBQUEsUUFGUjtLQVZKLENBQUE7V0FjQSxZQUFZLENBQUMsZ0JBQWIsQ0FBOEIsSUFBOUIsRUFoQm9CO0VBQUEsQ0FuQ3hCLENBQUE7O0FBQUEsd0JBc0RBLElBQUEsR0FBTSxTQUFDLEVBQUQsRUFBSyxPQUFMLEdBQUE7QUFDRixRQUFBLDRCQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsR0FBQSxHQUFJLEVBQUosR0FBTyxPQUFoQixDQUFBO0FBRUEsSUFBQSxJQUFHLENBQUEsQ0FBRSxJQUFDLENBQUEsSUFBRCxLQUFTLElBQVYsQ0FBSjtBQUNJLE1BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFtQixlQUFuQixDQUFULENBREo7S0FBQSxNQUFBO0FBR0ksTUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFNBQVYsQ0FISjtLQUZBO0FBQUEsSUFTQSxFQUFBLEdBQUssR0FBQSxDQUFBLFdBVEwsQ0FBQTtBQUFBLElBVUEsRUFBRSxDQUFDLEdBQUgsQ0FBTyxRQUFRLENBQUMsRUFBVCxDQUFZLE1BQVosRUFBcUIsRUFBckIsRUFDSDtBQUFBLE1BQUEsU0FBQSxFQUFVLENBQVY7QUFBQSxNQUNBLFNBQUEsRUFBVSxLQURWO0tBREcsQ0FBUCxDQVZBLENBQUE7QUFBQSxJQWFBLEVBQUUsQ0FBQyxHQUFILENBQU8sUUFBUSxDQUFDLEVBQVQsQ0FBWSxNQUFNLENBQUMsTUFBUCxDQUFjLE1BQWQsQ0FBWixFQUFvQyxFQUFwQyxFQUNIO0FBQUEsTUFBQSxTQUFBLEVBQVUsQ0FBVjtLQURHLENBQVAsQ0FiQSxDQUFBO0FBaUJBLElBQUEsSUFBRyxDQUFDLG9CQUFELENBQUg7QUFDSSxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBQyxDQUFBLE9BQWIsQ0FBQSxDQUFBO0FBQUEsTUFFQSxHQUFBLEdBQU0sSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUEsQ0FBaUIsQ0FBQyxHQUFsQixHQUF3QixDQUFDLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxNQUFaLENBQUEsQ0FBRCxDQUY5QixDQUFBO0FBQUEsTUFHQSxPQUFPLENBQUMsR0FBUixDQUFZLEdBQVosQ0FIQSxDQUFBO0FBQUEsTUFJQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFNBQVYsQ0FBQSxDQUpOLENBQUE7QUFLQSxNQUFBLElBQUksR0FBQSxHQUFNLEdBQVY7ZUFDSSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsT0FBVixDQUFrQjtBQUFBLFVBQUUsU0FBQSxFQUFXLEdBQWI7U0FBbEIsRUFESjtPQU5KO0tBbEJFO0VBQUEsQ0F0RE4sQ0FBQTs7cUJBQUE7O0dBRnNCLFdBSDFCLENBQUE7O0FBQUEsTUF1Rk0sQ0FBQyxPQUFQLEdBQWlCLFdBdkZqQixDQUFBOzs7OztBQ0RBLElBQUEsdUJBQUE7RUFBQTs2QkFBQTs7QUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLCtCQUFSLENBQWIsQ0FBQTs7QUFFQTtBQUFBOzs7Ozs7Ozs7OztHQUZBOztBQWdCQTtBQUFBOzs7OztHQWhCQTs7QUFBQTtBQXlCSSxpQ0FBQSxDQUFBOztBQUFhLEVBQUEscUJBQUMsSUFBRCxHQUFBO0FBQ1QsSUFBQSxJQUFDLENBQUEsR0FBRCxHQUFPLENBQUEsQ0FBRSxJQUFJLENBQUMsRUFBUCxDQUFQLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBRGpCLENBQUE7QUFBQSxJQUVBLDZDQUFNLElBQU4sQ0FGQSxDQURTO0VBQUEsQ0FBYjs7QUFBQSx3QkFLQSxVQUFBLEdBQVksU0FBQSxHQUFBO1dBQ1IsMENBQUEsRUFEUTtFQUFBLENBTFosQ0FBQTs7QUFBQSx3QkFRQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBRU4sUUFBQSwwSEFBQTtBQUFBLElBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxHQUFULENBQUE7QUFBQSxJQUVBLGVBQUEsR0FBbUIsR0FBQSxHQUFNLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBWCxDQUZ6QixDQUFBO0FBQUEsSUFHQSxPQUFBLEdBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLENBSFYsQ0FBQTtBQUFBLElBSUEsTUFBQSxHQUFTLEVBSlQsQ0FBQTtBQUFBLElBS0EsaUJBQUEsR0FBb0IsQ0FMcEIsQ0FBQTtBQUFBLElBTUEsSUFBQSxHQUFPLEVBTlAsQ0FBQTtBQUFBLElBUUEsTUFBQSxHQUFTLEtBQUssQ0FBQyxJQUFOLENBQVcsMkRBQVgsQ0FSVCxDQUFBO0FBQUEsSUFTQSxlQUFBLEdBQWtCLEtBQUssQ0FBQyxJQUFOLENBQVcsMkJBQVgsQ0FUbEIsQ0FBQTtBQUFBLElBV0EsQ0FBQSxDQUFFLGVBQUYsQ0FBa0IsQ0FBQyxXQUFuQixDQUErQixTQUEvQixDQVhBLENBQUE7QUFBQSxJQWNBLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsQ0FBRCxFQUFHLENBQUgsR0FBQTtBQUNSLFlBQUEsb0VBQUE7QUFBQSxRQUFBLEtBQUEsR0FBUSxFQUFSLENBQUE7QUFBQSxRQUNBLElBQUEsR0FBTyxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsSUFBTCxDQUFVLE1BQVYsQ0FEUCxDQUFBO0FBQUEsUUFFQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLENBQXNCLENBQUMsRUFBdkIsQ0FBMEIsQ0FBMUIsQ0FGVCxDQUFBO0FBQUEsUUFHQSxRQUFBLEdBQVcsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFFBQVYsQ0FBbUIsVUFBbkIsQ0FBQSxJQUFrQyxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsUUFBTCxDQUFjLFVBQWQsQ0FIN0MsQ0FBQTtBQUFBLFFBS0EsT0FBQSxHQUFVLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxRQUFMLENBQWMsUUFBZCxDQUxWLENBQUE7QUFNQSxRQUFBLElBQUcsT0FBQSxJQUFZLENBQUEsQ0FBRSxtQkFBQSxHQUFzQixDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBdEIsR0FBMkMsV0FBN0MsQ0FBeUQsQ0FBQyxJQUExRCxDQUFBLENBQUEsS0FBb0UsQ0FBbkY7QUFDSSxVQUFBLEtBQUEsR0FBUSxDQUFBLENBQUUsbUJBQUEsR0FBc0IsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLENBQXRCLEdBQTJDLFdBQTdDLENBQXlELENBQUMsR0FBMUQsQ0FBQSxDQUErRCxDQUFDLElBQWhFLENBQUEsQ0FBUixDQURKO1NBTkE7QUFBQSxRQVNBLEtBQUEsR0FBVyxPQUFILEdBQWdCLEtBQWhCLEdBQTJCLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxHQUFMLENBQUEsQ0FBVSxDQUFDLElBQVgsQ0FBQSxDQVRuQyxDQUFBO0FBQUEsUUFVQSxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLENBQUEsQ0FBTCxHQUE2QixLQVY3QixDQUFBO0FBQUEsUUFZQSxTQUFBLEdBQWUsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLENBQUgsR0FBMEIsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLENBQTFCLEdBQWlELENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxJQUFMLENBQVUsYUFBVixDQVo3RCxDQUFBO0FBZUEsUUFBQSxJQUFHLFFBQUEsSUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFOLEtBQWdCLENBQWpCLENBQWhCO0FBQ0ksVUFBQSxNQUFBLElBQVUsTUFBQSxHQUFTLFNBQVQsR0FBcUIsb0JBQS9CLENBQUE7QUFDQSxVQUFBLElBQUcsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLENBQW9CLENBQUMsV0FBckIsQ0FBQSxDQUFBLEtBQXNDLFVBQXRDLElBQW9ELENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxRQUFMLENBQWMsUUFBZCxDQUF2RDtBQUNJLFlBQUEsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLFFBQUwsQ0FBYyxTQUFkLENBQUEsQ0FESjtXQUFBLE1BQUE7QUFHSSxZQUFBLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixDQUFzQixDQUFDLFFBQXZCLENBQWdDLFNBQWhDLENBQUEsQ0FISjtXQURBO2lCQUtBLGlCQUFBLEdBTko7U0FBQSxNQUFBO0FBVUksVUFBQSxJQUFJLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBbkI7QUFDSSxvQkFBTyxJQUFQO0FBQUEsbUJBQ1MsT0FEVDtBQUVRLGdCQUFBLFlBQUEsR0FBZSwwQ0FBZixDQUFBO0FBQ0EsZ0JBQUEsSUFBRyxDQUFBLEtBQU8sQ0FBQyxLQUFOLENBQVksWUFBWixDQUFMO0FBQ0ksa0JBQUEsTUFBQSxJQUFVLE1BQUEsR0FBUyxTQUFULEdBQXFCLHFDQUEvQixDQUFBO0FBQUEsa0JBQ0EsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLENBQXNCLENBQUMsUUFBdkIsQ0FBZ0MsU0FBaEMsQ0FEQSxDQUFBO3lCQUVBLGlCQUFBLEdBSEo7aUJBSFI7QUFDUztBQURULG1CQU9TLFFBUFQ7QUFRUSxnQkFBQSxJQUFHLEtBQUEsQ0FBTSxLQUFOLENBQUEsSUFBZ0IsQ0FBQyxLQUFBLEdBQVEsQ0FBUixLQUFhLENBQWQsQ0FBbkI7QUFDSSxrQkFBQSxNQUFBLElBQVUsTUFBQSxHQUFTLFNBQVQsR0FBcUIsOEJBQS9CLENBQUE7QUFBQSxrQkFDQSxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsT0FBTCxDQUFhLFFBQWIsQ0FBc0IsQ0FBQyxRQUF2QixDQUFnQyxTQUFoQyxDQURBLENBQUE7eUJBRUEsaUJBQUEsR0FISjtpQkFSUjtBQU9TO0FBUFQsbUJBWVMsT0FaVDtBQWFRLGdCQUFBLEdBQUEsR0FBTSxvRUFBTixDQUFBO0FBQ0EsZ0JBQUEsSUFBRyxDQUFBLEtBQU8sQ0FBQyxLQUFOLENBQVksR0FBWixDQUFMO0FBQ0ksa0JBQUEsTUFBQSxJQUFVLE1BQUEsR0FBUyxTQUFULEdBQXFCLG9DQUEvQixDQUFBO0FBQUEsa0JBQ0EsQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLENBQXNCLENBQUMsUUFBdkIsQ0FBZ0MsU0FBaEMsQ0FEQSxDQUFBO3lCQUVBLGlCQUFBLEdBSEo7aUJBZFI7QUFBQSxhQURKO1dBVko7U0FoQlE7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaLENBZEEsQ0FBQTtBQStEQSxJQUFBLElBQUcsbUJBQUg7QUFDSSxNQUFBLENBQUMsQ0FBQyxJQUFGLENBQU8sTUFBTSxDQUFDLElBQWQsRUFBb0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsQ0FBRCxFQUFJLENBQUosR0FBQTtBQUNoQixVQUFBLENBQUMsQ0FBQyxXQUFGLENBQWMsU0FBZCxDQUFBLENBQUE7QUFBQSxVQUNBLElBQUssQ0FBQSxDQUFDLENBQUMsT0FBRixDQUFMLEdBQWtCLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBUixDQUFBLENBRGxCLENBQUE7QUFFQSxVQUFBLElBQUksQ0FBQyxDQUFDLFFBQUgsSUFBaUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQVIsQ0FBQSxDQUFjLENBQUMsTUFBZixLQUF5QixDQUExQixDQUFwQjtBQUNJLFlBQUEsTUFBQSxJQUFVLE1BQUEsR0FBUyxDQUFDLENBQUMsSUFBWCxHQUFrQixvQkFBNUIsQ0FBQTtBQUFBLFlBQ0EsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxTQUFYLENBREEsQ0FBQTttQkFFQSxpQkFBQSxHQUhKO1dBSGdCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsQ0FBQSxDQURKO0tBL0RBO0FBQUEsSUF3RUEsS0FBQSxHQUFRLGlCQUFBLEtBQXFCLENBeEU3QixDQUFBO0FBQUEsSUF5RUEsU0FBQSxHQUFlLEtBQUgsR0FBYyxFQUFkLEdBQXNCLE1BQUEsR0FBUyxNQUFULEdBQWtCLE9BekVwRCxDQUFBO0FBQUEsSUEwRUEsR0FBQSxHQUFTLEtBQUgsR0FBYyxTQUFkLEdBQTZCLFNBMUVuQyxDQUFBO0FBQUEsSUE0RUEsQ0FBQSxDQUFFLGVBQUYsQ0FBa0IsQ0FBQyxXQUFuQixDQUErQixpQkFBL0IsQ0FBaUQsQ0FBQyxRQUFsRCxDQUEyRCxHQUEzRCxDQUErRCxDQUFDLElBQWhFLENBQXFFLFNBQXJFLENBNUVBLENBQUE7QUFBQSxJQStFQSxDQUFBLENBQUUsZUFBRixDQUFrQixDQUFDLElBQW5CLENBQUEsQ0FBeUIsQ0FBQyxPQUExQixDQUFrQztBQUFBLE1BQzlCLE1BQUEsRUFBUSxDQUFBLENBQUUsZUFBRixDQUFrQixDQUFDLElBQW5CLENBQXdCLElBQXhCLENBQTZCLENBQUMsTUFBOUIsQ0FBQSxDQURzQjtLQUFsQyxDQS9FQSxDQUFBO0FBQUEsSUFtRkEsUUFBQSxHQUFXO0FBQUEsTUFDUCxLQUFBLEVBQU8sS0FEQTtBQUFBLE1BRVAsT0FBQSxFQUFTLE9BRkY7QUFBQSxNQUdQLElBQUEsRUFBTSxJQUhDO0FBQUEsTUFJUCxTQUFBLEVBQVcsZUFKSjtLQW5GWCxDQUFBO0FBeUZBLFdBQU8sUUFBUCxDQTNGTTtFQUFBLENBUlYsQ0FBQTs7QUFBQSx3QkFxR0EsVUFBQSxHQUFZLFNBQUMsQ0FBRCxFQUFJLE1BQUosR0FBQTtBQUNSLFFBQUEsVUFBQTtBQUFBLElBQUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUVBLFVBQUEsR0FBYSxNQUFNLENBQUMsUUFBUCxDQUFBLENBRmIsQ0FBQTtBQUdBLElBQUEsSUFBRyxVQUFVLENBQUMsS0FBZDthQUVJLENBQUMsQ0FBQyxJQUFGLENBQ0k7QUFBQSxRQUFBLEdBQUEsRUFBSyxVQUFVLENBQUMsT0FBaEI7QUFBQSxRQUNBLE1BQUEsRUFBTyxNQURQO0FBQUEsUUFFQSxRQUFBLEVBQVUsTUFGVjtBQUFBLFFBR0EsSUFBQSxFQUFNLFVBQVUsQ0FBQyxJQUhqQjtBQUFBLFFBSUEsUUFBQSxFQUFVLFNBQUMsUUFBRCxHQUFBO0FBQ04sY0FBQSx1QkFBQTtBQUFBLFVBQUEsR0FBQSxHQUFTLDZCQUFILEdBQStCLFFBQVEsQ0FBQyxZQUF4QyxHQUEwRCxRQUFoRSxDQUFBO0FBQUEsVUFDQSxPQUFBLEdBQVUsb0RBRFYsQ0FBQTtBQUFBLFVBRUEsSUFBQSxHQUFPLEtBRlAsQ0FBQTtBQUdBLFVBQUEsSUFBRyxtQkFBSDtBQUNJLFlBQUEsSUFBQSxHQUFPLEdBQUcsQ0FBQyxPQUFKLEtBQWUsU0FBdEIsQ0FBQTtBQUdBLFlBQUEsSUFBRyxJQUFIO0FBQ0ksY0FBQSxPQUFBLEdBQVUsc0dBQVYsQ0FESjthQUFBLE1BQUE7QUFJSSxjQUFBLElBQUcsbUJBQUEsSUFBZSwwQkFBbEI7QUFDSSxnQkFBQSxPQUFBLEdBQVUsc0JBQVYsQ0FBQTtBQUFBLGdCQUVBLENBQUMsQ0FBQyxJQUFGLENBQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFqQixFQUF5QixDQUFBLFNBQUEsS0FBQSxHQUFBO3lCQUFBLFNBQUMsQ0FBRCxFQUFJLEdBQUosR0FBQTsyQkFDckIsT0FBQSxJQUFXLE1BQUEsR0FBUyxHQUFHLENBQUMsT0FBYixHQUF1QixRQURiO2tCQUFBLEVBQUE7Z0JBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QixDQUZBLENBQUE7QUFBQSxnQkFLQSxPQUFBLElBQVcsT0FMWCxDQURKO2VBSko7YUFKSjtXQUhBO0FBQUEsVUFtQkEsR0FBQSxHQUFTLElBQUgsR0FBYSxTQUFiLEdBQTRCLFNBbkJsQyxDQUFBO0FBQUEsVUFvQkEsQ0FBQSxDQUFFLFVBQVUsQ0FBQyxTQUFiLENBQXVCLENBQUMsV0FBeEIsQ0FBb0MsaUJBQXBDLENBQXNELENBQUMsUUFBdkQsQ0FBZ0UsR0FBaEUsQ0FBb0UsQ0FBQyxJQUFyRSxDQUEwRSxPQUExRSxDQXBCQSxDQUFBO0FBQUEsVUFzQkEsQ0FBQSxDQUFFLFVBQVUsQ0FBQyxTQUFiLENBQXVCLENBQUMsSUFBeEIsQ0FBQSxDQUE4QixDQUFDLE9BQS9CLENBQXVDO0FBQUEsWUFDbkMsTUFBQSxFQUFRLENBQUEsQ0FBRSxVQUFVLENBQUMsU0FBYixDQUF1QixDQUFDLElBQXhCLENBQTZCLGFBQTdCLENBQTJDLENBQUMsTUFBNUMsQ0FBQSxDQUQyQjtXQUF2QyxDQXRCQSxDQUFBO0FBMEJBLFVBQUEsSUFBRyxJQUFIO21CQUNJLE1BQU0sQ0FBQyxTQUFQLENBQUEsRUFESjtXQTNCTTtRQUFBLENBSlY7T0FESixFQUZKO0tBSlE7RUFBQSxDQXJHWixDQUFBOztBQUFBLHdCQThJQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBRVAsUUFBQSxxQkFBQTtBQUFBLElBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxHQUFULENBQUE7QUFBQSxJQUdBLE1BQUEsR0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsQ0FIVCxDQUFBO0FBQUEsSUFJQSxNQUFNLENBQUMsV0FBUCxDQUFtQixTQUFuQixDQUpBLENBQUE7QUFBQSxJQUtBLENBQUMsQ0FBQyxJQUFGLENBQU8sTUFBUCxFQUFlLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7ZUFDWCxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsSUFBVixDQUFlLGFBQWYsQ0FBNkIsQ0FBQyxVQUE5QixDQUF5QyxTQUF6QyxFQURXO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZixDQUxBLENBQUE7QUFBQSxJQVNBLE1BQUEsR0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLG1DQUFYLENBVFQsQ0FBQTtBQUFBLElBVUEsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsU0FBbkIsQ0FBNkIsQ0FBQyxPQUE5QixDQUFzQyxRQUF0QyxDQUErQyxDQUFDLFdBQWhELENBQTRELFNBQTVELENBVkEsQ0FBQTtBQUFBLElBV0EsQ0FBQyxDQUFDLElBQUYsQ0FBTyxNQUFQLEVBQWUsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsQ0FBRCxFQUFJLENBQUosR0FBQTtlQUNYLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxHQUFMLENBQVMsRUFBVCxFQURXO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZixDQVhBLENBQUE7QUFlQSxJQUFBLElBQUcsbUJBQUg7YUFDSSxDQUFDLENBQUMsSUFBRixDQUFPLE1BQU0sQ0FBQyxJQUFkLEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7aUJBQ2hCLENBQUMsQ0FBQyxjQUFGLENBQUEsRUFEZ0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixFQURKO0tBakJPO0VBQUEsQ0E5SVgsQ0FBQTs7QUFBQSx3QkFtS0EsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNQLFFBQUEsZUFBQTtBQUFBLElBQUEsU0FBQSxHQUFhLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFdBQVYsQ0FBYixDQUFBO0FBQUEsSUFDQSxJQUFBLEdBQU8sSUFEUCxDQUFBO0FBQUEsSUFFQSxDQUFBLENBQUUsR0FBQSxHQUFNLFNBQVIsQ0FBa0IsQ0FBQyxFQUFuQixDQUFzQixPQUF0QixFQUErQixTQUFDLENBQUQsR0FBQTthQUMzQixJQUFJLENBQUMsVUFBTCxDQUFnQixDQUFoQixFQUFtQixJQUFuQixFQUQyQjtJQUFBLENBQS9CLENBRkEsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsbUNBQVYsQ0FBOEMsQ0FBQyxFQUEvQyxDQUFrRCxNQUFsRCxFQUEwRCxTQUFDLENBQUQsR0FBQTtBQUN0RCxNQUFBLElBQUcsQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLENBQXNCLENBQUMsUUFBdkIsQ0FBZ0MsU0FBaEMsQ0FBQSxJQUE4QyxDQUFBLENBQUUsSUFBRixDQUFJLENBQUMsUUFBTCxDQUFjLFNBQWQsQ0FBakQ7ZUFDSSxJQUFJLENBQUMsUUFBTCxDQUFBLEVBREo7T0FEc0Q7SUFBQSxDQUExRCxDQU5BLENBQUE7QUFBQSxJQVdBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGFBQVYsQ0FBd0IsQ0FBQyxFQUF6QixDQUE0QixPQUE1QixFQUFxQyxTQUFDLENBQUQsR0FBQTtBQUNqQyxNQUFBLElBQUcsQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLENBQXVCLENBQUMsUUFBeEIsQ0FBaUMsU0FBakMsQ0FBSDtlQUNJLElBQUksQ0FBQyxRQUFMLENBQUEsRUFESjtPQURpQztJQUFBLENBQXJDLENBWEEsQ0FBQTtBQWdCQSxJQUFBLElBQUcsbUJBQUg7YUFDSSxDQUFDLENBQUMsSUFBRixDQUFPLE1BQU0sQ0FBQyxJQUFkLEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7QUFDaEIsY0FBQSxXQUFBO0FBQUEsVUFBQSxJQUFJLENBQUMsQ0FBQyxRQUFOO0FBQ0ksWUFBQSxXQUFBLEdBQWMsQ0FBQyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQXRCLENBQUE7bUJBQ0EsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLEVBQWYsQ0FBa0IsUUFBbEIsRUFBNEIsU0FBQyxDQUFELEdBQUE7cUJBQ3hCLElBQUksQ0FBQyxRQUFMLENBQUEsRUFEd0I7WUFBQSxDQUE1QixFQUZKO1dBRGdCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsRUFESjtLQWpCTztFQUFBLENBbktYLENBQUE7O3FCQUFBOztHQUZzQixXQXZCMUIsQ0FBQTs7QUFBQSxNQW9OTSxDQUFDLE9BQVAsR0FBaUIsV0FwTmpCLENBQUE7Ozs7O0FDQUEsSUFBQSxvQ0FBQTtFQUFBOzs2QkFBQTs7QUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLHdCQUFSLENBQVYsQ0FBQTs7QUFBQSxVQUNBLEdBQWEsT0FBQSxDQUFRLCtCQUFSLENBRGIsQ0FBQTs7QUFBQTtBQUtJLHFDQUFBLENBQUE7O0FBQWEsRUFBQSx5QkFBQyxJQUFELEdBQUE7QUFFVCwyRUFBQSxDQUFBO0FBQUEsNkRBQUEsQ0FBQTtBQUFBLDZEQUFBLENBQUE7QUFBQSw2REFBQSxDQUFBO0FBQUEsMkRBQUEsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSxxREFBQSxDQUFBO0FBQUEsMkRBQUEsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSxpREFBQSxDQUFBO0FBQUEsaURBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsbUVBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsK0RBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsQ0FBQSxDQUFFLE1BQUYsQ0FBUixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRLENBQUEsQ0FBRSxNQUFGLENBRFIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFBLENBQUUsVUFBRixDQUZYLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQSxDQUFFLG9CQUFGLENBSFYsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUFBLENBQUUsU0FBRixDQUpWLENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEtBTGpCLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxZQUFELEdBQWdCLENBQUEsQ0FBRSxvQ0FBRixDQUF1QyxDQUFDLE1BQXhDLENBQUEsQ0FBZ0QsQ0FBQyxJQU5qRSxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsZUFBRCxHQUFtQixDQUFBLENBQUUsdUNBQUYsQ0FBMEMsQ0FBQyxNQUEzQyxDQUFBLENBQW1ELENBQUMsSUFQdkUsQ0FBQTtBQUFBLElBVUEsaURBQU0sSUFBTixDQVZBLENBRlM7RUFBQSxDQUFiOztBQUFBLDRCQWVBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDUixJQUFBLDhDQUFBLENBQUEsQ0FBQTtXQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBLEVBRlE7RUFBQSxDQWZaLENBQUE7O0FBQUEsNEJBbUJBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDUCxJQUFBLElBQUcsQ0FBQSxDQUFDLENBQUUsTUFBRixDQUFTLENBQUMsUUFBVixDQUFtQixRQUFuQixDQUFKO0FBQ0ksTUFBQSxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxFQUFwQixDQUF1QixZQUF2QixFQUFxQyxJQUFDLENBQUEsY0FBdEMsQ0FBQSxDQUFBO0FBQUEsTUFDQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLFlBQWYsRUFBNkIsSUFBQyxDQUFBLFVBQTlCLENBREEsQ0FESjtLQUFBO0FBQUEsSUFJQSxNQUFNLENBQUMsUUFBUCxHQUFrQixJQUFDLENBQUEsWUFKbkIsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsY0FBWCxDQUEwQixDQUFDLEVBQTNCLENBQThCLE9BQTlCLEVBQXVDLElBQUMsQ0FBQSxTQUF4QyxDQUxBLENBQUE7QUFBQSxJQU1BLENBQUEsQ0FBRSxzQkFBRixDQUF5QixDQUFDLEVBQTFCLENBQTZCLE9BQTdCLEVBQXNDLElBQUMsQ0FBQSxnQkFBdkMsQ0FOQSxDQUFBO0FBQUEsSUFPQSxDQUFBLENBQUUsc0JBQUYsQ0FBeUIsQ0FBQyxFQUExQixDQUE2QixPQUE3QixFQUFzQyxJQUFDLENBQUEsZ0JBQXZDLENBUEEsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsYUFBWCxDQUF5QixDQUFDLEVBQTFCLENBQTZCLE9BQTdCLEVBQXNDLFNBQUEsR0FBQTthQUNsQyxDQUFBLENBQUUsSUFBRixDQUFJLENBQUMsT0FBTCxDQUFhLFFBQWIsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixrQkFBNUIsQ0FBK0MsQ0FBQyxPQUFoRCxDQUF3RCxPQUF4RCxFQURrQztJQUFBLENBQXRDLENBVEEsQ0FBQTtXQVlBLENBQUEsQ0FBRSxvQkFBRixDQUF1QixDQUFDLEVBQXhCLENBQTJCLE9BQTNCLEVBQW9DLG9CQUFwQyxFQUEwRCxJQUFDLENBQUEsdUJBQTNELEVBYk87RUFBQSxDQW5CWCxDQUFBOztBQUFBLDRCQW1DQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1YsUUFBQSxhQUFBO0FBQUEsSUFBQSxTQUFBLEdBQVksQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBa0IsTUFBbEIsQ0FBWixDQUFBO0FBQUEsSUFDQSxFQUFBLEdBQUssQ0FBQSxDQUFFLCtCQUFBLEdBQWtDLFNBQWxDLEdBQThDLElBQWhELENBQXFELENBQUMsSUFBdEQsQ0FBMkQsTUFBM0QsQ0FETCxDQUFBO1dBRUEsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsRUFBakIsRUFIVTtFQUFBLENBbkNkLENBQUE7O0FBQUEsNEJBd0NBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNmLFFBQUEsT0FBQTtBQUFBLElBQUEsT0FBQSxHQUFVLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQWtCLE1BQWxCLENBQVYsQ0FBQTtBQUVBLElBQUEsSUFBRyxPQUFBLEtBQVcsV0FBWCxJQUEwQixPQUFBLEtBQVcsZ0JBQXJDLElBQXlELE9BQUEsS0FBVyxVQUF2RTthQUNJLElBQUMsQ0FBQSxlQUFELENBQWlCLFdBQWpCLEVBREo7S0FBQSxNQUVLLElBQUcsT0FBQSxLQUFXLHFCQUFYLElBQW9DLE9BQUEsS0FBVyxhQUFsRDthQUNELElBQUMsQ0FBQSxlQUFELENBQWlCLGNBQWpCLEVBREM7S0FMVTtFQUFBLENBeENuQixDQUFBOztBQUFBLDRCQWdEQSxTQUFBLEdBQVcsU0FBQyxDQUFELEdBQUEsQ0FoRFgsQ0FBQTs7QUFBQSw0QkFrREEsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUNWLElBQUEsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsZUFBRCxDQUFBLEVBRlU7RUFBQSxDQWxEZCxDQUFBOztBQUFBLDRCQXVEQSxtQkFBQSxHQUFxQixTQUFBLEdBQUE7QUFLakIsSUFBQSxJQUFHLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsUUFBakIsQ0FBMEIsT0FBMUIsQ0FBSDtBQUNJLE1BQUEsSUFBRyxNQUFNLENBQUMsVUFBUCxHQUFvQixHQUF2QjtBQUNJLFFBQUEsQ0FBQSxDQUFFLHdCQUFGLENBQTJCLENBQUMsR0FBNUIsQ0FBZ0MsTUFBaEMsRUFBd0MsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsRUFBeEQsQ0FBQSxDQUFBO2VBQ0EsQ0FBQSxDQUFFLDJCQUFGLENBQThCLENBQUMsR0FBL0IsQ0FBbUMsTUFBbkMsRUFBMkMsSUFBQyxDQUFBLGVBQUQsR0FBbUIsR0FBOUQsRUFGSjtPQUFBLE1BQUE7QUFJSSxRQUFBLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLEdBQTVCLENBQWdDLE1BQWhDLEVBQXdDLElBQUMsQ0FBQSxZQUFELEdBQWdCLEVBQXhELENBQUEsQ0FBQTtlQUNBLENBQUEsQ0FBRSwyQkFBRixDQUE4QixDQUFDLEdBQS9CLENBQW1DLE1BQW5DLEVBQTJDLElBQUMsQ0FBQSxlQUFELEdBQW1CLEdBQTlELEVBTEo7T0FESjtLQUFBLE1BQUE7QUFRSSxNQUFBLElBQUcsTUFBTSxDQUFDLFVBQVAsR0FBb0IsR0FBdkI7QUFDSSxRQUFBLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLEdBQTVCLENBQWdDLE1BQWhDLEVBQXdDLElBQUMsQ0FBQSxZQUFELEdBQWdCLEVBQXhELENBQUEsQ0FBQTtlQUNBLENBQUEsQ0FBRSwyQkFBRixDQUE4QixDQUFDLEdBQS9CLENBQW1DLE1BQW5DLEVBQTJDLElBQUMsQ0FBQSxlQUFELEdBQW1CLEdBQTlELEVBRko7T0FBQSxNQUFBO0FBSUksUUFBQSxDQUFBLENBQUUsd0JBQUYsQ0FBMkIsQ0FBQyxHQUE1QixDQUFnQyxNQUFoQyxFQUF3QyxJQUFDLENBQUEsWUFBRCxHQUFnQixFQUF4RCxDQUFBLENBQUE7ZUFDQSxDQUFBLENBQUUsMkJBQUYsQ0FBOEIsQ0FBQyxHQUEvQixDQUFtQyxNQUFuQyxFQUEyQyxJQUFDLENBQUEsZUFBRCxHQUFtQixFQUE5RCxFQUxKO09BUko7S0FMaUI7RUFBQSxDQXZEckIsQ0FBQTs7QUFBQSw0QkEyRUEsYUFBQSxHQUFlLFNBQUMsT0FBRCxHQUFBO0FBQ1gsUUFBQSxRQUFBO0FBQUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTixDQUFlLE9BQWYsQ0FBSDtBQUNJLFlBQUEsQ0FESjtLQUFBO0FBQUEsSUFHQSxHQUFBLEdBQU0sSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsYUFBVixDQUhOLENBQUE7QUFBQSxJQUlBLEdBQUEsR0FBTSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxnQkFBVixDQUpOLENBQUE7QUFNQSxJQUFBLElBQUcsT0FBQSxHQUFVLEVBQWI7QUFDSSxNQUFBLElBQUcsQ0FBQSxJQUFFLENBQUEsWUFBTDtBQUNJLFFBQUEsQ0FBQSxDQUFFLDZGQUFGLENBQWdHLENBQUMsUUFBakcsQ0FBMEcsT0FBMUcsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQURoQixDQUFBO2VBRUEsSUFBQyxDQUFBLG1CQUFELENBQUEsRUFISjtPQURKO0tBQUEsTUFBQTtBQU1JLE1BQUEsSUFBRyxJQUFDLENBQUEsWUFBSjtBQUNJLFFBQUEsQ0FBQSxDQUFFLDZGQUFGLENBQWdHLENBQUMsV0FBakcsQ0FBNkcsT0FBN0csQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixLQURoQixDQUFBO0FBQUEsUUFFQSxJQUFDLENBQUEsWUFBRCxDQUFBLENBRkEsQ0FBQTtlQUdBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLEVBSko7T0FOSjtLQVBXO0VBQUEsQ0EzRWYsQ0FBQTs7QUFBQSw0QkErRkEsY0FBQSxHQUFnQixTQUFDLENBQUQsR0FBQTtBQUNaLFFBQUEsUUFBQTtBQUFBLElBQUEsUUFBQSxHQUFXLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsTUFBWixDQUFBLENBQW9CLENBQUMsSUFBckIsQ0FBMEIsTUFBMUIsQ0FBWCxDQUFBO0FBQ0EsSUFBQSxJQUFHLENBQUEsQ0FBRSxHQUFBLEdBQU0sUUFBTixHQUFpQixjQUFuQixDQUFrQyxDQUFDLElBQW5DLENBQXdDLEdBQXhDLENBQTRDLENBQUMsTUFBN0MsR0FBc0QsQ0FBekQ7YUFDSSxJQUFDLENBQUEsVUFBRCxDQUFBLEVBREo7S0FBQSxNQUFBO0FBR0ksTUFBQSxJQUFDLENBQUEsZUFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsUUFBakIsQ0FEQSxDQUFBO0FBR0EsTUFBQSxJQUFHLENBQUEsSUFBRSxDQUFBLGFBQUw7ZUFDSSxJQUFDLENBQUEsVUFBRCxDQUFBLEVBREo7T0FOSjtLQUZZO0VBQUEsQ0EvRmhCLENBQUE7O0FBQUEsNEJBMEdBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDUixJQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixTQUFqQixDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsYUFBRCxHQUFpQixLQUZUO0VBQUEsQ0ExR1osQ0FBQTs7QUFBQSw0QkE4R0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUNSLElBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQW9CLFNBQXBCLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsS0FEakIsQ0FBQTtXQUVBLElBQUMsQ0FBQSxZQUFELENBQUEsRUFIUTtFQUFBLENBOUdaLENBQUE7O0FBQUEsNEJBbUhBLGVBQUEsR0FBaUIsU0FBQyxJQUFELEdBQUE7QUFDYixRQUFBLG9DQUFBO0FBQUEsSUFBQSxJQUFHLFlBQUg7QUFDSSxNQUFBLElBQUEsR0FBTyxDQUFBLENBQUUsOEJBQUEsR0FBaUMsSUFBakMsR0FBd0MsSUFBMUMsQ0FBK0MsQ0FBQyxRQUFoRCxDQUFBLENBQTBELENBQUMsSUFBbEUsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLENBRFQsQ0FBQTtBQUFBLE1BRUEsTUFBQSxHQUFTLENBQUEsRUFGVCxDQUFBO0FBSUEsTUFBQSxJQUFHLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLEdBQXZCO0FBQ0ksUUFBQSxNQUFBLEdBQVMsQ0FBQSxFQUFULENBREo7T0FKQTtBQVVBLE1BQUEsSUFBRyxDQUFBLENBQUUsR0FBQSxHQUFNLElBQU4sR0FBYSxnQkFBZixDQUFnQyxDQUFDLE1BQWpDLEdBQTBDLENBQTdDO0FBQ0k7QUFBQSxhQUFBLHFDQUFBO3FCQUFBO0FBQ0ksVUFBQSxNQUFBLEdBQVMsTUFBQSxHQUFTLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxLQUFMLENBQUEsQ0FBbEIsQ0FESjtBQUFBLFNBREo7T0FWQTtBQWNBLE1BQUEsSUFBRyxNQUFBLEdBQVMsQ0FBWjtBQUVJLFFBQUEsQ0FBQSxDQUFFLEdBQUEsR0FBTSxJQUFOLEdBQWEsY0FBZixDQUE4QixDQUFDLEdBQS9CLENBQW1DLE1BQW5DLEVBQTJDLElBQUEsR0FBTyxDQUFDLE1BQUEsR0FBUyxDQUFWLENBQWxELENBQUEsQ0FGSjtPQUFBLE1BQUE7QUFNSSxRQUFBLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQUEsQ0FOSjtPQWRBO2FBcUJBLENBQUEsQ0FBRSxHQUFBLEdBQU0sSUFBTixHQUFhLGNBQWYsQ0FBOEIsQ0FBQyxRQUEvQixDQUF3QyxTQUF4QyxFQXRCSjtLQURhO0VBQUEsQ0FuSGpCLENBQUE7O0FBQUEsNEJBNElBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO1dBQ2IsQ0FBQSxDQUFFLGlCQUFGLENBQW9CLENBQUMsV0FBckIsQ0FBaUMsU0FBakMsRUFEYTtFQUFBLENBNUlqQixDQUFBOztBQUFBLDRCQStJQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1YsSUFBQSxJQUFHLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLFFBQTVCLENBQXFDLFVBQXJDLENBQUEsSUFBb0QsQ0FBQSxDQUFFLHdCQUFGLENBQTJCLENBQUMsUUFBNUIsQ0FBcUMsV0FBckMsQ0FBcEQsSUFBeUcsQ0FBQSxDQUFFLHdCQUFGLENBQTJCLENBQUMsUUFBNUIsQ0FBcUMsZ0JBQXJDLENBQTVHO0FBQ0ksTUFBQSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxXQUF2QixDQUFtQyxTQUFuQyxDQUFBLENBQUE7QUFBQSxNQUNBLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLFFBQTVCLENBQXFDLFNBQXJDLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsV0FBakIsQ0FGQSxDQUFBO0FBSUEsTUFBQSxJQUFHLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLFFBQTVCLENBQXFDLFdBQXJDLENBQUg7QUFDSSxRQUFBLENBQUEsQ0FBRSxtQ0FBRixDQUFzQyxDQUFDLFFBQXZDLENBQWdELFVBQWhELENBQUEsQ0FESjtPQUpBO0FBT0EsTUFBQSxJQUFHLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLFFBQTVCLENBQXFDLGdCQUFyQyxDQUFIO2VBQ0ksQ0FBQSxDQUFFLHdDQUFGLENBQTJDLENBQUMsUUFBNUMsQ0FBcUQsVUFBckQsRUFESjtPQVJKO0tBQUEsTUFZSyxJQUFHLENBQUEsQ0FBRSx3QkFBRixDQUEyQixDQUFDLFFBQTVCLENBQXFDLGFBQXJDLENBQUEsSUFBdUQsQ0FBQSxDQUFFLHdCQUFGLENBQTJCLENBQUMsUUFBNUIsQ0FBcUMscUJBQXJDLENBQTFEO0FBQ0QsTUFBQSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxXQUF2QixDQUFtQyxTQUFuQyxDQUFBLENBQUE7QUFBQSxNQUNBLENBQUEsQ0FBRSwyQkFBRixDQUE4QixDQUFDLFFBQS9CLENBQXdDLFNBQXhDLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxlQUFELENBQWlCLGNBQWpCLEVBSEM7S0FiSztFQUFBLENBL0lkLENBQUE7O0FBQUEsNEJBeUtBLFNBQUEsR0FBVyxTQUFDLENBQUQsR0FBQTtBQUNQLFFBQUEsaUJBQUE7QUFBQSxJQUFBLENBQUMsQ0FBQyxjQUFGLENBQUEsQ0FBQSxDQUFBO0FBQUEsSUFDQSxFQUFBLEdBQUssQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBREwsQ0FBQTtBQUFBLElBRUEsR0FBQSxHQUFNLENBQUEsQ0FBRSxnQkFBRixDQUZOLENBQUE7QUFBQSxJQUdBLEdBQUEsR0FBTSxDQUFBLENBQUUsb0JBQUYsQ0FITixDQUFBO0FBQUEsSUFJQSxHQUFBLEdBQU0sR0FBRyxDQUFDLE1BQUosQ0FBQSxDQUpOLENBQUE7QUFBQSxJQU1BLEVBQUUsQ0FBQyxXQUFILENBQWUsUUFBZixDQU5BLENBQUE7QUFBQSxJQVFBLE9BQU8sQ0FBQyxHQUFSLENBQVksZUFBWixDQVJBLENBQUE7QUFBQSxJQVNBLE9BQU8sQ0FBQyxHQUFSLENBQVksRUFBWixDQVRBLENBQUE7QUFXQSxJQUFBLElBQUcsRUFBRSxDQUFDLFFBQUgsQ0FBWSxRQUFaLENBQUg7QUFDSSxNQUFBLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBQSxDQUFBO2FBQ0EsUUFBUSxDQUFDLEVBQVQsQ0FBWSxJQUFDLENBQUEsTUFBYixFQUFxQixHQUFyQixFQUNJO0FBQUEsUUFBQyxDQUFBLEVBQUksR0FBQSxHQUFNLEdBQVg7QUFBQSxRQUNDLENBQUEsRUFBRyxDQURKO0FBQUEsUUFFQyxJQUFBLEVBQU0sTUFBTSxDQUFDLE9BRmQ7QUFBQSxRQUdDLFVBQUEsRUFBWSxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFDVCxRQUFRLENBQUMsR0FBVCxDQUFhLEtBQUMsQ0FBQSxNQUFkLEVBQ0k7QUFBQSxjQUFBLENBQUEsRUFBRyxFQUFIO2FBREosRUFEUztVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSGI7T0FESixFQUZKO0tBQUEsTUFBQTtBQVdJLE1BQUEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxJQUFDLENBQUEsTUFBZCxFQUNJO0FBQUEsUUFBQSxDQUFBLEVBQUcsQ0FBQSxDQUFIO09BREosQ0FBQSxDQUFBO0FBQUEsTUFFQSxRQUFRLENBQUMsRUFBVCxDQUFZLElBQUMsQ0FBQSxNQUFiLEVBQXFCLEVBQXJCLEVBQXlCO0FBQUEsUUFBQyxDQUFBLEVBQUcsQ0FBSjtBQUFBLFFBQU8sQ0FBQSxFQUFHLENBQVY7QUFBQSxRQUFhLElBQUEsRUFBTSxNQUFNLENBQUMsTUFBMUI7T0FBekIsQ0FGQSxDQUFBO0FBQUEsTUFHQSxDQUFBLENBQUUsaUJBQUYsQ0FBb0IsQ0FBQyxHQUFyQixDQUF5QixRQUF6QixFQUFtQyxLQUFuQyxDQUhBLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxlQUpELENBQUE7QUFBQSxNQUtBLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBTEEsQ0FBQTthQU1BLFFBQVEsQ0FBQyxHQUFULENBQWEsSUFBQyxDQUFBLE9BQWQsRUFDSTtBQUFBLFFBQUEsQ0FBQSxFQUFHLENBQUg7T0FESixFQWpCSjtLQVpPO0VBQUEsQ0F6S1gsQ0FBQTs7QUFBQSw0QkF5TUEsZUFBQSxHQUFpQixTQUFBLEdBQUE7QUFDYixRQUFBLGlDQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLGdCQUFGLENBQU4sQ0FBQTtBQUFBLElBQ0EsR0FBQSxHQUFNLENBQUEsQ0FBRSxvQkFBRixDQUROLENBQUE7QUFBQSxJQUlBLEdBQUEsR0FBTSxHQUFHLENBQUMsTUFBSixDQUFBLENBSk4sQ0FBQTtBQUFBLElBS0EsR0FBQSxHQUFNLEdBQUcsQ0FBQyxNQUFKLENBQUEsQ0FMTixDQUFBO0FBQUEsSUFNQSxHQUFBLEdBQU0sTUFBTSxDQUFDLFVBTmIsQ0FBQTtBQUFBLElBT0EsR0FBQSxHQUFNLE1BQU0sQ0FBQyxXQVBiLENBQUE7QUFBQSxJQVFBLEdBQUEsR0FBTSxDQUFBLENBQUUsY0FBRixDQVJOLENBQUE7QUFVQSxJQUFBLElBQUcsR0FBQSxHQUFNLEdBQVQ7YUFDSSxHQUFHLENBQUMsR0FBSixDQUFRO0FBQUEsUUFBQyxNQUFBLEVBQVMsR0FBQSxHQUFNLEdBQWhCO0FBQUEsUUFBc0IsUUFBQSxFQUFVLFFBQWhDO09BQVIsRUFESjtLQUFBLE1BQUE7YUFHSSxHQUFHLENBQUMsR0FBSixDQUFRO0FBQUEsUUFBQyxNQUFBLEVBQVEsR0FBQSxHQUFNLElBQWY7T0FBUixFQUhKO0tBWGE7RUFBQSxDQXpNakIsQ0FBQTs7QUFBQSw0QkF5TkEsZ0JBQUEsR0FBa0IsU0FBQyxDQUFELEdBQUE7QUFDZCxRQUFBLHlDQUFBO0FBQUEsSUFBQSxVQUFBLEdBQWEsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxNQUFaLENBQUEsQ0FBb0IsQ0FBQyxJQUFyQixDQUEwQixpQkFBMUIsQ0FBYixDQUFBO0FBRUEsSUFBQSxJQUFJLFVBQVUsQ0FBQyxJQUFYLENBQWdCLElBQWhCLENBQXFCLENBQUMsTUFBdEIsR0FBK0IsQ0FBbkM7QUFDSSxNQUFBLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxRQUFaLENBQXFCLFFBQXJCLENBREEsQ0FBQTtBQUVBLFlBQUEsQ0FISjtLQUZBO0FBT0EsSUFBQSxJQUFHLENBQUEsQ0FBRSxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLE1BQVosQ0FBQSxDQUFvQixDQUFDLFFBQXJCLENBQThCLFFBQTlCLENBQUQsQ0FBSjtBQUNJLE1BQUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQSxDQUFBLENBREo7S0FQQTtBQUFBLElBVUEsT0FBQSxHQUFVLFVBQVUsQ0FBQyxJQUFYLENBQWdCLElBQWhCLENBQXFCLENBQUMsTUFWaEMsQ0FBQTtBQUFBLElBV0EsWUFBQSxHQUFlLE1BQU0sQ0FBQyxXQVh0QixDQUFBO0FBQUEsSUFZQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBWlQsQ0FBQTtBQUFBLElBY0EsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FkQSxDQUFBO0FBQUEsSUFlQSxNQUFNLENBQUMsSUFBUCxDQUFZLEdBQVosQ0FBZ0IsQ0FBQyxRQUFqQixDQUEwQixRQUExQixDQWZBLENBQUE7QUFBQSxJQWdCQSxNQUFNLENBQUMsUUFBUCxDQUFnQixRQUFoQixDQWhCQSxDQUFBO0FBQUEsSUFpQkEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxHQUFmLENBQW1CLENBQUMsUUFBcEIsQ0FBNkIsUUFBN0IsQ0FqQkEsQ0FBQTtBQUFBLElBa0JBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFFBQVosRUFBc0IsQ0FBQyxZQUFBLEdBQWUsR0FBaEIsQ0FBQSxHQUF1QixJQUE3QyxDQWxCQSxDQUFBO1dBbUJBLFVBQVUsQ0FBQyxHQUFYLENBQWUsUUFBZixFQUF5QixDQUFDLE9BQUEsR0FBVSxFQUFYLENBQUEsR0FBaUIsSUFBMUMsRUFwQmM7RUFBQSxDQXpObEIsQ0FBQTs7QUFBQSw0QkErT0EsZ0JBQUEsR0FBa0IsU0FBQSxHQUFBO0FBQ2QsSUFBQSxDQUFBLENBQUUsaUJBQUYsQ0FBb0IsQ0FBQyxHQUFyQixDQUF5QixRQUF6QixFQUFtQyxLQUFuQyxDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFFBQVosRUFBc0IsT0FBdEIsQ0FEQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxHQUFiLENBQWlCLENBQUMsV0FBbEIsQ0FBOEIsUUFBOUIsQ0FGQSxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxJQUFiLENBQWtCLENBQUMsV0FBbkIsQ0FBK0IsUUFBL0IsQ0FIQSxDQUFBO1dBSUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsTUFBYixDQUFvQixDQUFDLFdBQXJCLENBQWlDLFFBQWpDLEVBTGM7RUFBQSxDQS9PbEIsQ0FBQTs7QUFBQSw0QkF1UEEsZ0JBQUEsR0FBa0IsU0FBQyxDQUFELEdBQUE7QUFDZCxJQUFBLENBQUMsQ0FBQyxlQUFGLENBQUEsQ0FBQSxDQUFBO0FBQUEsSUFDQSxDQUFDLENBQUMsY0FBRixDQUFBLENBREEsQ0FBQTtBQUdBLElBQUEsSUFBRyxDQUFBLENBQUUsQ0FBQyxDQUFDLE1BQUosQ0FBVyxDQUFDLFFBQVosQ0FBcUIsUUFBckIsQ0FBSDthQUNJLElBQUMsQ0FBQSxnQkFBRCxDQUFBLEVBREo7S0FBQSxNQUFBO2FBR0ksQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxPQUFaLENBQW9CLElBQXBCLENBQXlCLENBQUMsT0FBMUIsQ0FBa0MsT0FBbEMsRUFISjtLQUpjO0VBQUEsQ0F2UGxCLENBQUE7O0FBQUEsNEJBaVFBLHVCQUFBLEdBQXlCLFNBQUMsQ0FBRCxHQUFBO0FBQ3JCLFFBQUEsR0FBQTtBQUFBLElBQUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUNBLENBQUMsQ0FBQyxlQUFGLENBQUEsQ0FEQSxDQUFBO0FBR0EsSUFBQSxJQUFHLGdDQUFIO0FBQ0ksTUFBQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxJQUFaLENBQWlCLE1BQWpCLENBQU4sQ0FBQTthQUNBLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBaEIsR0FBdUIsSUFGM0I7S0FKcUI7RUFBQSxDQWpRekIsQ0FBQTs7eUJBQUE7O0dBRjBCLFdBSDlCLENBQUE7O0FBQUEsTUE4UU0sQ0FBQyxPQUFQLEdBQWlCLGVBOVFqQixDQUFBOzs7OztBQ0NBLElBQUEsbUNBQUE7RUFBQTs7NkJBQUE7O0FBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSwrQkFBUixDQUFiLENBQUE7O0FBQUEsWUFDQSxHQUFlLE9BQUEsQ0FBUSx1QkFBUixDQURmLENBQUE7O0FBQUE7QUFLSSwrQkFBQSxDQUFBOztBQUFhLEVBQUEsbUJBQUMsSUFBRCxHQUFBO0FBQ1QsaURBQUEsQ0FBQTtBQUFBLHVFQUFBLENBQUE7QUFBQSx1RUFBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsR0FBRCxHQUFPLENBQUEsQ0FBRSxJQUFJLENBQUMsRUFBUCxDQUFQLENBQUE7QUFBQSxJQUNBLDJDQUFNLElBQU4sQ0FEQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUksQ0FBQyxPQUZoQixDQUFBO0FBR0EsSUFBQSxJQUFHLG9CQUFIO0FBQ0ksTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxXQUFaLEVBQTBCLElBQUMsQ0FBQSxVQUEzQixDQUFBLENBREo7S0FIQTtBQUFBLElBTUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFJLENBQUMsSUFOYixDQURTO0VBQUEsQ0FBYjs7QUFBQSxzQkFTQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1IsSUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLENBQUEsQ0FBRSxJQUFDLENBQUEsR0FBSCxDQUFPLENBQUMsSUFBUixDQUFhLElBQWIsQ0FBYixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsZUFBRCxHQUFtQixJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBa0IsY0FBbEIsQ0FEbkIsQ0FBQTtBQUVBLElBQUEsSUFBRyxvQkFBSDtBQUNJLE1BQUEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFDLENBQUEsWUFBRCxDQUFBLENBQVosQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFDLENBQUEsWUFBRCxDQUFBLENBQWQsRUFBK0IsSUFBL0IsQ0FEQSxDQURKO0tBRkE7V0FLQSx3Q0FBQSxFQU5RO0VBQUEsQ0FUWixDQUFBOztBQUFBLHNCQWlCQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1AsSUFBQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxPQUFSLEVBQWlCLFNBQWpCLEVBQTRCLElBQUMsQ0FBQSxxQkFBN0IsQ0FBQSxDQUFBO1dBRUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLENBQUQsRUFBRyxDQUFILEdBQUE7QUFDWixZQUFBLFVBQUE7QUFBQSxRQUFBLFVBQUEsR0FBaUIsSUFBQSxNQUFBLENBQU8sQ0FBUCxDQUFqQixDQUFBO2VBQ0EsVUFBVSxDQUFDLEVBQVgsQ0FBYyxLQUFkLEVBQXNCLEtBQUMsQ0FBQSxxQkFBdkIsRUFGWTtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCLEVBSE87RUFBQSxDQWpCWCxDQUFBOztBQUFBLHNCQXdCQSxxQkFBQSxHQUF1QixTQUFDLENBQUQsR0FBQTtBQUNuQixRQUFBLHNCQUFBO0FBQUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxJQUFELEtBQVMsZUFBWjtBQUNJLE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxXQUFYLENBQXVCLFVBQXZCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxPQUFaLENBQW9CLFNBQXBCLENBQThCLENBQUMsUUFBL0IsQ0FBd0MsVUFBeEMsQ0FEQSxDQUFBO0FBQUEsTUFFQSxTQUFBLEdBQVksQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxPQUFaLENBQW9CLFNBQXBCLENBQThCLENBQUMsSUFBL0IsQ0FBb0MsSUFBcEMsQ0FGWixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsU0FBdkIsQ0FIQSxDQUFBO0FBSUEsYUFBTyxLQUFQLENBTEo7S0FBQTtBQUFBLElBT0EsT0FBQSxHQUFVLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsT0FBWixDQUFvQixJQUFwQixDQVBWLENBQUE7QUFBQSxJQVNBLEVBQUEsR0FBSyxPQUFPLENBQUMsSUFBUixDQUFhLElBQWIsQ0FUTCxDQUFBO1dBV0EsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsRUFBaEIsRUFabUI7RUFBQSxDQXhCdkIsQ0FBQTs7QUFBQSxzQkF1Q0EscUJBQUEsR0FBdUIsU0FBQyxJQUFELEdBQUE7QUFDbkIsSUFBQSxDQUFBLENBQUUsMkNBQUYsQ0FBOEMsQ0FBQyxXQUEvQyxDQUEyRCxRQUEzRCxDQUFBLENBQUE7QUFBQSxJQUNBLENBQUEsQ0FBRSwyQ0FBRixDQUE4QyxDQUFDLFdBQS9DLENBQTJELFFBQTNELENBREEsQ0FBQTtBQUFBLElBRUEsQ0FBQSxDQUFFLHVEQUFBLEdBQTBELElBQTFELEdBQWlFLElBQW5FLENBQXdFLENBQUMsUUFBekUsQ0FBa0YsUUFBbEYsQ0FGQSxDQUFBO1dBR0EsQ0FBQSxDQUFFLHVEQUFBLEdBQTBELElBQTFELEdBQWlFLElBQW5FLENBQXdFLENBQUMsTUFBekUsQ0FBQSxDQUFpRixDQUFDLFFBQWxGLENBQTJGLFFBQTNGLEVBSm1CO0VBQUEsQ0F2Q3ZCLENBQUE7O0FBQUEsc0JBNkNBLGNBQUEsR0FBZ0IsU0FBQyxFQUFELEdBQUE7QUFHWixJQUFBLElBQUMsQ0FBQSxVQUFELENBQVksRUFBWixDQUFBLENBQUE7V0FHQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxFQUFkLEVBTlk7RUFBQSxDQTdDaEIsQ0FBQTs7QUFBQSxzQkFzREEsVUFBQSxHQUFZLFNBQUMsRUFBRCxHQUFBO0FBQ1IsUUFBQSxNQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsR0FBQSxHQUFJLEVBQUosR0FBTyxPQUFoQixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLFdBQVgsQ0FBdUIsVUFBdkIsQ0FEQSxDQUFBO1dBRUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLE1BQWxCLENBQXlCLENBQUMsUUFBMUIsQ0FBbUMsVUFBbkMsRUFIUTtFQUFBLENBdERaLENBQUE7O0FBQUEsc0JBNERBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDVixXQUFPLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsYUFBekIsQ0FBdUMsQ0FBQyxJQUF4QyxDQUE2QyxJQUE3QyxDQUFQLENBRFU7RUFBQSxDQTVEZCxDQUFBOzttQkFBQTs7R0FGb0IsV0FIeEIsQ0FBQTs7QUFBQSxNQXdFTSxDQUFDLE9BQVAsR0FBaUIsU0F4RWpCLENBQUE7Ozs7O0FDREEsSUFBQSx5QkFBQTtFQUFBOzZCQUFBOztBQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEsK0JBQVIsQ0FBYixDQUFBOztBQUFBO0FBSUksbUNBQUEsQ0FBQTs7QUFBYSxFQUFBLHVCQUFBLEdBQUE7QUFDVCxJQUFBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBQSxDQURTO0VBQUEsQ0FBYjs7QUFBQSwwQkFHQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ1gsUUFBQSx5RUFBQTtBQUFBLElBQUEsQ0FBQSxHQUFJLENBQUEsQ0FBRSxVQUFGLENBQUosQ0FBQTtBQUFBLElBQ0EsWUFBQSxHQUFlLENBQUMsQ0FBQyxJQUFGLENBQU8sY0FBUCxDQURmLENBQUE7QUFHQTtTQUFBLDhDQUFBO29DQUFBO0FBQ0ksTUFBQSxJQUFBLEdBQU8sQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLElBQWYsQ0FBb0IsR0FBcEIsQ0FBUCxDQUFBO0FBRUEsTUFBQSxJQUFHLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBakI7QUFDSSxRQUFBLFFBQUEsR0FBVyxDQUFYLENBQUE7QUFBQSxRQUNBLFVBQUEsR0FBYSxJQURiLENBQUE7QUFBQSxRQUdBLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxJQUFSLENBQWEsU0FBQSxHQUFBO0FBQ1QsVUFBQSxJQUFHLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxLQUFSLENBQUEsQ0FBQSxHQUFrQixRQUFyQjtBQUNJLFlBQUEsUUFBQSxHQUFXLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxLQUFSLENBQUEsQ0FBWCxDQUFBO21CQUNBLFVBQUEsR0FBYSxDQUFBLENBQUUsSUFBRixFQUZqQjtXQURTO1FBQUEsQ0FBYixDQUhBLENBQUE7QUFBQSxxQkFRQSxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsSUFBUixDQUFhLFNBQUEsR0FBQTtpQkFDVCxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsR0FBUixDQUFZO0FBQUEsWUFBQyxLQUFBLEVBQU8sUUFBQSxHQUFXLEVBQW5CO1dBQVosRUFEUztRQUFBLENBQWIsRUFSQSxDQURKO09BQUEsTUFBQTs2QkFBQTtPQUhKO0FBQUE7bUJBSlc7RUFBQSxDQUhmLENBQUE7O3VCQUFBOztHQUZ3QixXQUY1QixDQUFBOztBQUFBLE1BaUNNLENBQUMsT0FBUCxHQUFpQixhQWpDakIsQ0FBQTs7Ozs7QUNBQSxJQUFBLFNBQUE7RUFBQSxnRkFBQTs7QUFBQTtBQUVpQixFQUFBLG1CQUFDLFFBQUQsR0FBQTtBQUVULHlEQUFBLENBQUE7QUFBQSxtREFBQSxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLENBQUEsQ0FBRSxRQUFGLENBQVQsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFNBQUQsR0FBaUIsSUFBQSxRQUFRLENBQUMsU0FBVCxDQUFtQixJQUFuQixFQUEwQixFQUExQixFQUErQixJQUEvQixDQUZqQixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsU0FBUyxDQUFDLGlCQUFYLENBQTZCLEVBQTdCLENBSEEsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxnQkFBWCxDQUE0QixVQUE1QixFQUF5QyxJQUFDLENBQUEsV0FBMUMsQ0FKQSxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsU0FBUyxDQUFDLGdCQUFYLENBQTRCLFVBQTVCLEVBQXlDLElBQUMsQ0FBQSxjQUExQyxDQUxBLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxRQUFELEdBQVksRUFOWixDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsY0FBRCxDQUFBLENBUEEsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQVJBLENBRlM7RUFBQSxDQUFiOztBQUFBLHNCQVlBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBRVosUUFBQSxJQUFBO0FBQUEsSUFBQSxJQUFBLEdBQU8sSUFBUCxDQUFBO1dBRUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksU0FBQSxHQUFBO0FBRVIsVUFBQSxVQUFBO0FBQUEsTUFBQSxFQUFBLEdBQUssYUFBQSxHQUFhLENBQUMsUUFBQSxDQUFTLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixJQUF6QixDQUE4QixDQUFDLFFBQS9CLENBQUEsQ0FBRCxDQUFsQixDQUFBO0FBQUEsTUFFQSxDQUFBLENBQUUsSUFBRixDQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsRUFBZ0IsRUFBaEIsQ0FGQSxDQUFBO0FBQUEsTUFHQSxDQUFBLENBQUUsSUFBRixDQUFJLENBQUMsSUFBTCxDQUFVLFVBQVYsRUFBdUIsUUFBdkIsQ0FIQSxDQUFBO0FBQUEsTUFJQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLENBSlQsQ0FBQTthQVFBLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBZCxDQUNJO0FBQUEsUUFBQSxFQUFBLEVBQUcsRUFBSDtBQUFBLFFBQ0EsR0FBQSxFQUFJLE1BREo7T0FESixFQVZRO0lBQUEsQ0FBWixFQUpZO0VBQUEsQ0FaaEIsQ0FBQTs7QUFBQSxzQkE4QkEsUUFBQSxHQUFVLFNBQUEsR0FBQTtXQUVOLElBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxDQUF3QixJQUFDLENBQUEsUUFBekIsRUFGTTtFQUFBLENBOUJWLENBQUE7O0FBQUEsc0JBbUNBLFNBQUEsR0FBVyxTQUFDLEVBQUQsRUFBSSxPQUFKLEdBQUE7QUFFUCxRQUFBLDJEQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLEdBQUEsR0FBSSxFQUFOLENBQU4sQ0FBQTtBQUFBLElBR0EsS0FBQSxHQUFRLEdBQUcsQ0FBQyxJQUFKLENBQVMsSUFBVCxDQUhSLENBQUE7QUFBQSxJQUlBLFFBQUEsR0FBVyxHQUFHLENBQUMsSUFBSixDQUFTLE9BQVQsQ0FKWCxDQUFBO0FBQUEsSUFLQSxPQUFBLEdBQVUsR0FBRyxDQUFDLEtBQUosQ0FBVSxJQUFWLENBQWUsQ0FBQyxJQUFoQixDQUFBLENBQUEsSUFBMEIsRUFMcEMsQ0FBQTtBQUFBLElBTUEsVUFBQSxHQUNJO0FBQUEsTUFBQSxDQUFBLEVBQUcsR0FBRyxDQUFDLElBQUosQ0FBUyxPQUFULENBQUg7QUFBQSxNQUNBLENBQUEsRUFBRyxHQUFHLENBQUMsSUFBSixDQUFTLFFBQVQsQ0FESDtLQVBKLENBQUE7QUFBQSxJQVVBLEdBQUEsR0FBTSxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsTUFBWCxDQUFrQixLQUFsQixDQVZOLENBQUE7QUFhQSxJQUFBLElBQWdDLE1BQUEsQ0FBQSxLQUFBLEtBQWtCLFdBQWxEO0FBQUEsTUFBQSxHQUFBLEdBQU0sR0FBRyxDQUFDLElBQUosQ0FBUyxJQUFULEVBQWUsS0FBZixDQUFOLENBQUE7S0FiQTtBQWNBLElBQUEsSUFBRyxNQUFBLENBQUEsUUFBQSxLQUFxQixXQUF4QjtBQUNJLE1BQUEsR0FBQSxHQUFNLENBQUssR0FBRyxDQUFDLElBQUosQ0FBUyxPQUFULENBQUEsS0FBdUIsV0FBM0IsR0FBNkMsR0FBRyxDQUFDLElBQUosQ0FBUyxPQUFULENBQTdDLEdBQW9FLEVBQXJFLENBQU4sQ0FBQTtBQUFBLE1BQ0EsR0FBQSxHQUFNLEdBQUcsQ0FBQyxJQUFKLENBQVMsT0FBVCxFQUFrQixRQUFBLEdBQVcsR0FBWCxHQUFpQixHQUFqQixHQUF1QixlQUF6QyxDQUROLENBREo7S0FkQTtBQUFBLElBbUJBLENBQUMsQ0FBQyxJQUFGLENBQU8sT0FBUCxFQUFnQixTQUFDLElBQUQsRUFBTyxLQUFQLEdBQUE7QUFDWixNQUFBLEdBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQyxZQUFQLENBQW9CLE9BQUEsR0FBVSxJQUE5QixFQUFvQyxLQUFwQyxDQUFBLENBRFk7SUFBQSxDQUFoQixDQW5CQSxDQUFBO0FBQUEsSUFzQkEsR0FBQSxHQUFNLEdBQUcsQ0FBQyxVQUFKLENBQWUsU0FBZixDQXRCTixDQUFBO0FBQUEsSUF5QkEsRUFBQSxHQUFLLFVBQUEsQ0FBVyxHQUFHLENBQUMsSUFBSixDQUFTLE9BQVQsQ0FBWCxDQXpCTCxDQUFBO0FBQUEsSUEwQkEsRUFBQSxHQUFLLFVBQUEsQ0FBVyxHQUFHLENBQUMsSUFBSixDQUFTLFFBQVQsQ0FBWCxDQTFCTCxDQUFBO0FBNkJBLElBQUEsSUFBRyxVQUFVLENBQUMsQ0FBWCxJQUFpQixVQUFVLENBQUMsQ0FBL0I7QUFDSSxNQUFBLENBQUEsQ0FBRSxHQUFGLENBQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQixVQUFVLENBQUMsQ0FBaEMsQ0FBQSxDQUFBO0FBQUEsTUFDQSxDQUFBLENBQUUsR0FBRixDQUFNLENBQUMsSUFBUCxDQUFZLFFBQVosRUFBc0IsVUFBVSxDQUFDLENBQWpDLENBREEsQ0FESjtLQUFBLE1BS0ssSUFBRyxVQUFVLENBQUMsQ0FBZDtBQUNELE1BQUEsQ0FBQSxDQUFFLEdBQUYsQ0FBTSxDQUFDLElBQVAsQ0FBWSxPQUFaLEVBQXFCLFVBQVUsQ0FBQyxDQUFoQyxDQUFBLENBQUE7QUFBQSxNQUNBLENBQUEsQ0FBRSxHQUFGLENBQU0sQ0FBQyxJQUFQLENBQVksUUFBWixFQUFzQixDQUFDLEVBQUEsR0FBSyxFQUFOLENBQUEsR0FBWSxVQUFVLENBQUMsQ0FBN0MsQ0FEQSxDQURDO0tBQUEsTUFLQSxJQUFHLFVBQVUsQ0FBQyxDQUFkO0FBQ0QsTUFBQSxDQUFBLENBQUUsR0FBRixDQUFNLENBQUMsSUFBUCxDQUFZLFFBQVosRUFBc0IsVUFBVSxDQUFDLENBQWpDLENBQUEsQ0FBQTtBQUFBLE1BQ0EsQ0FBQSxDQUFFLEdBQUYsQ0FBTSxDQUFDLElBQVAsQ0FBWSxPQUFaLEVBQXFCLENBQUMsRUFBQSxHQUFLLEVBQU4sQ0FBQSxHQUFZLFVBQVUsQ0FBQyxDQUE1QyxDQURBLENBREM7S0F2Q0w7V0E0Q0EsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsR0FBaEIsRUE5Q087RUFBQSxDQW5DWCxDQUFBOztBQUFBLHNCQXNGQSxXQUFBLEdBQWEsU0FBQyxDQUFELEdBQUE7V0FFVCxJQUFDLENBQUEsU0FBRCxDQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBbEIsRUFBc0IsQ0FBQyxDQUFDLFNBQXhCLEVBRlM7RUFBQSxDQXRGYixDQUFBOztBQUFBLHNCQTBGQSxjQUFBLEdBQWdCLFNBQUMsQ0FBRCxHQUFBLENBMUZoQixDQUFBOzttQkFBQTs7SUFGSixDQUFBOztBQUFBLE1Ba0dNLENBQUMsT0FBUCxHQUFpQixTQWxHakIsQ0FBQTs7Ozs7QUNFQSxJQUFBLHFCQUFBO0VBQUEsZ0ZBQUE7O0FBQUE7QUFJaUIsRUFBQSxzQkFBQyxFQUFELEdBQUE7QUFDVCwrQ0FBQSxDQUFBO0FBQUEsK0NBQUEsQ0FBQTtBQUFBLHFEQUFBLENBQUE7QUFBQSxJQUFBLElBQUMsQ0FBQSxHQUFELEdBQU8sQ0FBQSxDQUFFLEVBQUYsQ0FBUCxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdCQUFWLENBRFYsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSwwQkFBVixDQUZkLENBQUE7QUFJQSxJQUFBLElBQUksSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLGtCQUFqQixDQUFvQyxDQUFDLElBQXJDLENBQUEsQ0FBQSxLQUErQyxDQUFuRDtBQUNJLE1BQUEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsa0JBQWpCLENBQWQsQ0FESjtLQUpBO0FBQUEsSUFPQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdCQUFWLENBUFYsQ0FBQTtBQUFBLElBVUEsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FWQSxDQUFBO0FBQUEsSUFXQSxJQUFDLENBQUEsdUJBQUQsQ0FBQSxDQVhBLENBQUE7QUFBQSxJQVlBLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FaQSxDQURTO0VBQUEsQ0FBYjs7QUFBQSx5QkFpQkEsdUJBQUEsR0FBeUIsU0FBQSxHQUFBO0FBQ3JCLElBQUEsSUFBQyxDQUFBLEVBQUQsR0FBTSxHQUFBLENBQUEsV0FBTixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBQSxDQUZBLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxFQUFFLENBQUMsR0FBSixDQUFRLFFBQVEsQ0FBQyxNQUFULENBQWdCLENBQUEsQ0FBRSxVQUFGLENBQWhCLEVBQStCLEdBQS9CLEVBQ0o7QUFBQSxNQUFDLE1BQUEsRUFBUSxDQUFBLENBQVQ7QUFBQSxNQUFhLE9BQUEsRUFBUSxNQUFyQjtBQUFBLE1BQTZCLENBQUEsRUFBRyxDQUFoQztLQURJLEVBQ2dDO0FBQUEsTUFBQyxNQUFBLEVBQVEsSUFBVDtBQUFBLE1BQWUsT0FBQSxFQUFRLE9BQXZCO0FBQUEsTUFBZ0MsQ0FBQSxFQUFHLFVBQW5DO0tBRGhDLENBQVIsQ0FKQSxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsRUFBRSxDQUFDLEdBQUosQ0FBUSxRQUFRLENBQUMsRUFBVCxDQUFZLElBQUMsQ0FBQSxHQUFiLEVBQW1CLEdBQW5CLEVBQ0o7QUFBQSxNQUFBLFNBQUEsRUFBVSxDQUFWO0tBREksQ0FBUixDQVBBLENBQUE7QUFBQSxJQVVBLElBQUMsQ0FBQSxFQUFFLENBQUMsR0FBSixDQUFRLFFBQVEsQ0FBQyxFQUFULENBQVksSUFBQyxDQUFBLE1BQWIsRUFBc0IsR0FBdEIsRUFDSjtBQUFBLE1BQUEsS0FBQSxFQUFNLENBQU47S0FESSxDQUFSLENBVkEsQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLEVBQUUsQ0FBQyxHQUFKLENBQVEsUUFBUSxDQUFDLEVBQVQsQ0FBWSxJQUFDLENBQUEsTUFBYixFQUFzQixHQUF0QixFQUNKO0FBQUEsTUFBQSxLQUFBLEVBQU0sQ0FBTjtLQURJLEVBR0osT0FISSxDQUFSLENBYkEsQ0FBQTtBQUFBLElBa0JBLElBQUMsQ0FBQSxFQUFFLENBQUMsUUFBSixDQUFhLGFBQWIsQ0FsQkEsQ0FBQTtXQW9CQSxJQUFDLENBQUEsRUFBRSxDQUFDLElBQUosQ0FBQSxFQXJCcUI7RUFBQSxDQWpCekIsQ0FBQTs7QUFBQSx5QkF3Q0EsbUJBQUEsR0FBcUIsU0FBQSxHQUFBLENBeENyQixDQUFBOztBQUFBLHlCQTRDQSxTQUFBLEdBQVcsU0FBQSxHQUFBO1dBQ1AsSUFBQyxDQUFBLFVBQUQsR0FBa0IsSUFBQSxNQUFBLENBQU8sSUFBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQWYsRUFEWDtFQUFBLENBNUNYLENBQUE7O0FBQUEseUJBaURBLG1CQUFBLEdBQXFCLFNBQUMsSUFBRCxHQUFBO0FBQ2pCLElBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxxQkFBWixDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFEYixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsRUFBRSxDQUFDLFdBQUosQ0FBZ0IsSUFBQyxDQUFBLFNBQWpCLEVBQTRCLGFBQTVCLENBRkEsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLEVBQUUsQ0FBQyxJQUFKLENBQUEsQ0FIQSxDQUFBO1dBSUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxFQUFaLENBQWUsS0FBZixFQUF1QixJQUFDLENBQUEsWUFBeEIsRUFMaUI7RUFBQSxDQWpEckIsQ0FBQTs7QUFBQSx5QkF3REEsb0JBQUEsR0FBc0IsU0FBQSxHQUFBO0FBQ2xCLElBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxzQkFBWixDQUFBLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFnQixLQUFoQixFQUF3QixJQUFDLENBQUEsWUFBekIsQ0FEQSxDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsRUFBRSxDQUFDLGNBQUosQ0FBbUIsSUFBQyxDQUFBLFNBQXBCLENBRkEsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLEVBQUUsQ0FBQyxPQUFKLENBQUEsQ0FIQSxDQUFBO1dBSUEsTUFBQSxDQUFBLElBQVEsQ0FBQSxVQUxVO0VBQUEsQ0F4RHRCLENBQUE7O0FBQUEseUJBZ0VBLFlBQUEsR0FBYyxTQUFDLENBQUQsR0FBQTtBQUNWLElBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsb0JBQUQsQ0FBQSxFQUZVO0VBQUEsQ0FoRWQsQ0FBQTs7QUFBQSx5QkFxRUEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUNULElBQUEsSUFBRyxJQUFDLENBQUEsYUFBSjtBQUNJLE1BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxXQUFmLENBQTJCLENBQTNCLEVBRko7S0FEUztFQUFBLENBckViLENBQUE7O0FBQUEseUJBMkVBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDWCxRQUFBLFlBQUE7QUFBQSxJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxPQUFWLENBQVAsQ0FBQTtBQUFBLElBQ0EsRUFBQSxHQUFLLE1BQU0sQ0FBQyxVQURaLENBQUE7V0FFQSxFQUFBLEdBQUssSUFBSSxDQUFDLE1BQUwsQ0FBQSxFQUhNO0VBQUEsQ0EzRWYsQ0FBQTs7QUFBQSx5QkFtRkEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1IsUUFBQSxTQUFBO0FBQUEsSUFBQSxJQUFHLElBQUksQ0FBQyxHQUFMLEtBQVksRUFBWixJQUFvQixrQkFBdkI7QUFDSSxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksd0JBQVosQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUEsQ0FBRSxtREFBQSxHQUFzRCxJQUFJLENBQUMsTUFBM0QsR0FBb0UsdUNBQXRFLENBRFYsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLElBQUMsQ0FBQSxNQUFsQixDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFFBQVosRUFBc0IsTUFBdEIsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBSkEsQ0FBQTtBQU1BLGFBQU8sS0FBUCxDQVBKO0tBQUE7QUFBQSxJQVNBLEdBQUEsR0FBTSxDQUFBLENBQUUsZ0JBQUEsR0FBaUIsSUFBSSxDQUFDLEdBQXRCLEdBQTBCLDJCQUE1QixDQVROLENBQUE7QUFBQSxJQVVBLElBQUEsR0FBTyxDQUFBLENBQUUsZ0JBQUEsR0FBaUIsSUFBSSxDQUFDLElBQXRCLEdBQTJCLDRCQUE3QixDQVZQLENBQUE7QUFBQSxJQVlBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQSxDQUFFLHlGQUFGLENBWlosQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLEdBQWpCLENBYkEsQ0FBQTtBQUFBLElBY0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLElBQWpCLENBZEEsQ0FBQTtBQUFBLElBZUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLElBQUMsQ0FBQSxRQUFsQixDQWZBLENBQUE7QUFpQkEsSUFBQSxJQUFHLDBCQUFIO0FBQ0ksTUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxDQUFBLENBREo7S0FqQkE7V0FtQkEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsT0FBQSxDQUFRLGdCQUFSLEVBQ2I7QUFBQSxNQUFBLEtBQUEsRUFBTSxNQUFOO0FBQUEsTUFDQSxNQUFBLEVBQU8sTUFEUDtLQURhLEVBcEJUO0VBQUEsQ0FuRlosQ0FBQTs7QUFBQSx5QkE4R0EsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUdQLElBQUEsSUFBRywwQkFBSDthQUNJLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFBLEVBREo7S0FITztFQUFBLENBOUdYLENBQUE7O0FBQUEseUJBb0hBLFNBQUEsR0FBVyxTQUFBLEdBQUE7V0FDUCxPQUFPLENBQUMsR0FBUixDQUFZLFdBQVosRUFETztFQUFBLENBcEhYLENBQUE7O3NCQUFBOztJQUpKLENBQUE7O0FBQUEsT0E2SEEsR0FBYyxJQUFBLFlBQUEsQ0FBYSxVQUFiLENBN0hkLENBQUE7O0FBQUEsTUFtSU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWYsR0FBa0MsU0FBQyxJQUFELEdBQUE7QUFDOUIsRUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFNBQVosRUFBdUIsSUFBdkIsQ0FBQSxDQUFBO0FBQUEsRUFDQSxPQUFPLENBQUMsVUFBUixDQUFtQixJQUFuQixDQURBLENBQUE7QUFJQSxFQUFBLElBQUcsQ0FBQSxDQUFFLElBQUksQ0FBQyxHQUFMLEtBQVksRUFBYixDQUFKO0FBQ0ksSUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGlCQUFaLENBQUEsQ0FBQTtXQUNBLE9BQU8sQ0FBQyxtQkFBUixDQUE0QixPQUFPLENBQUMsU0FBcEMsRUFGSjtHQUFBLE1BQUE7QUFJSSxJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksaUJBQVosQ0FBQSxDQUFBO1dBQ0EsT0FBTyxDQUFDLG1CQUFSLENBQTRCLE9BQU8sQ0FBQyxTQUFwQyxFQUxKO0dBTDhCO0FBQUEsQ0FuSWxDLENBQUE7Ozs7O0FDRkEsSUFBQSxzREFBQTtFQUFBOzs2QkFBQTs7QUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGtDQUFSLENBQWIsQ0FBQTs7QUFBQSxXQUNBLEdBQWMsT0FBQSxDQUFRLHNCQUFSLENBRGQsQ0FBQTs7QUFBQSxhQUdBLEdBQWdCLG9CQUhoQixDQUFBOztBQUFBO0FBUUksb0NBQUEsQ0FBQTs7QUFBYSxFQUFBLHdCQUFDLElBQUQsR0FBQTtBQUVULGlEQUFBLENBQUE7QUFBQSx5RUFBQSxDQUFBO0FBQUEseURBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSxtREFBQSxDQUFBO0FBQUEsUUFBQSxLQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsR0FBRCxHQUFPLENBQUEsQ0FBRSxJQUFJLENBQUMsRUFBUCxDQUFQLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxDQUFDLEtBQUwsSUFBYyxLQUR2QixDQUFBO0FBQUEsSUFFQSxLQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsSUFBYyxDQUZyQixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLENBQUEsQ0FBRSxtQ0FBRixDQUhkLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixJQUFqQixFQUF3QixJQUFJLENBQUMsRUFBN0IsQ0FKQSxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsU0FBaEIsRUFBMkIsS0FBM0IsQ0FMQSxDQUFBO0FBQUEsSUFNQSxRQUFRLENBQUMsR0FBVCxDQUFhLElBQUMsQ0FBQSxVQUFkLEVBQ0k7QUFBQSxNQUFBLENBQUEsRUFBRSxLQUFBLEdBQVEsRUFBVjtLQURKLENBTkEsQ0FBQTtBQUFBLElBU0EsZ0RBQU0sSUFBTixDQVRBLENBRlM7RUFBQSxDQUFiOztBQUFBLDJCQWVBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTtBQUNSLElBQUEsK0NBQU0sSUFBTixDQUFBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQSxXQUFBLENBQVksSUFBWixDQUZiLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFlBQVYsRUFBeUIsSUFBQyxDQUFBLFdBQTFCLENBSEEsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsYUFBVixFQUEwQixJQUFDLENBQUEsYUFBM0IsQ0FKQSxDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxjQUFWLEVBQTJCLElBQUMsQ0FBQSxjQUE1QixDQUxBLENBQUE7V0FNQSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBQSxFQVBRO0VBQUEsQ0FmWixDQUFBOztBQUFBLDJCQTBCQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1IsSUFBQSxJQUFHLHVCQUFIO2FBQ0ksSUFBQyxDQUFBLEtBQUssQ0FBQyxhQUFQLENBQUEsRUFESjtLQUFBLE1BQUE7YUFHSSxJQUFDLENBQUEsWUFBRCxHQUFnQixLQUhwQjtLQURRO0VBQUEsQ0ExQlosQ0FBQTs7QUFBQSwyQkFrQ0EsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUdULElBQUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLENBQW9CLENBQUMsS0FBcEMsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsUUFBWCxDQUFvQixDQUFDLE1BRHJDLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxNQUFELEdBQVUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FIVixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFtQixJQUFuQixDQUpYLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixPQUFyQixFQUErQixJQUFDLENBQUEsV0FBaEMsQ0FOQSxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsUUFBckIsRUFBZ0MsSUFBQyxDQUFBLFlBQWpDLENBUEEsQ0FBQTtBQUFBLElBVUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLElBQUMsQ0FBQSxNQUFwQixDQVZBLENBQUE7QUFBQSxJQVdBLElBQUMsQ0FBQSxHQUFHLENBQUMsT0FBTCxDQUFhLElBQUMsQ0FBQSxVQUFkLENBWEEsQ0FBQTtBQUFBLElBWUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxZQUFQLENBQUEsQ0FaQSxDQUFBO0FBYUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxZQUFKO2FBQ0ksSUFBQyxDQUFBLEtBQUssQ0FBQyxhQUFQLENBQUEsRUFESjtLQWhCUztFQUFBLENBbENiLENBQUE7O0FBQUEsMkJBc0RBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFFVixJQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFtQixDQUFuQixFQUF1QixDQUF2QixFQUEyQixJQUFDLENBQUEsV0FBNUIsRUFBMEMsSUFBQyxDQUFBLFlBQTNDLENBQUEsQ0FBQTtXQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFtQixJQUFDLENBQUEsVUFBVSxDQUFDLEdBQS9CLEVBQXFDLENBQXJDLEVBQXdDLENBQXhDLEVBQTRDLElBQUMsQ0FBQSxXQUE3QyxFQUEyRCxJQUFDLENBQUEsWUFBNUQsRUFIVTtFQUFBLENBdERkLENBQUE7O0FBQUEsMkJBMkRBLFlBQUEsR0FBYyxTQUFDLEdBQUQsR0FBQTtBQUVWLFFBQUEsMkJBQUE7QUFBQSxJQUFBLFFBQUEsR0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxVQUFYLENBQVgsQ0FBQTtBQUVBLElBQUEsSUFBRyxRQUFRLENBQUMsTUFBVCxHQUFrQixHQUFyQjtBQUNJLE1BQUEsS0FBQSxHQUFRLFFBQVMsQ0FBQSxHQUFBLENBQWpCLENBQUE7QUFBQSxNQUNBLFVBQUEsR0FBYSxJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVAsQ0FBZ0IsS0FBSyxDQUFDLFFBQXRCLENBRGIsQ0FBQTthQUdBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFtQixVQUFVLENBQUMsR0FBOUIsRUFBb0MsS0FBSyxDQUFDLENBQTFDLEVBQThDLEtBQUssQ0FBQyxDQUFwRCxFQUF1RCxLQUFLLENBQUMsS0FBN0QsRUFBb0UsS0FBSyxDQUFDLE1BQTFFLEVBSko7S0FKVTtFQUFBLENBM0RkLENBQUE7O0FBQUEsMkJBeUVBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFHWCxRQUFBLGlEQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsVUFBWCxDQUFzQixDQUFDLE1BQWhDLENBQUE7QUFBQSxJQUNBLEtBQUEsR0FBUSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLENBQW9CLENBQUMsR0FEN0IsQ0FBQTtBQUFBLElBRUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFFBQVgsQ0FBb0IsQ0FBQyxLQUFyQixJQUE4QixDQUZ0QyxDQUFBO0FBQUEsSUFHQSxXQUFBLEdBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsUUFBWCxDQUFvQixDQUFDLFdBQXJCLElBQW9DLEVBSGxELENBQUE7QUFBQSxJQU9BLFFBQUEsR0FBWSxNQUFBLEdBQVMsS0FQckIsQ0FBQTtBQUFBLElBVUEsSUFBQSxHQUFPLElBVlAsQ0FBQTtBQUFBLElBV0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsQ0FBQSxDQVhoQixDQUFBO1dBWUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFRLENBQUMsRUFBVCxDQUFZLElBQUMsQ0FBQSxNQUFiLEVBQXNCLFFBQXRCLEVBQ3pCO0FBQUEsTUFBQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ04sWUFBQSxRQUFBO0FBQUEsUUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFBLEdBQVMsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFwQixDQUFYLENBQUE7QUFDQSxRQUFBLElBQUcsUUFBQSxLQUFjLElBQUMsQ0FBQSxZQUFsQjtBQUNJLFVBQUEsSUFBSSxDQUFDLFlBQUwsQ0FBQSxDQUFBLENBQUE7QUFBQSxVQUNBLElBQUksQ0FBQyxZQUFMLENBQWtCLFFBQWxCLENBREEsQ0FESjtTQURBO2VBS0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsU0FOVjtNQUFBLENBQVY7QUFBQSxNQU9BLE1BQUEsRUFBTyxDQUFBLENBUFA7QUFBQSxNQVFBLFdBQUEsRUFBYSxXQVJiO0FBQUEsTUFTQSxLQUFBLEVBQU0sS0FUTjtLQUR5QixFQWZsQjtFQUFBLENBekVmLENBQUE7O0FBQUEsMkJBNEdBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFFWCxJQUFBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFQLENBQWdCLE9BQWhCLENBQWQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxZQUFELENBQUEsRUFIVztFQUFBLENBNUdmLENBQUE7O0FBQUEsMkJBa0hBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ1osSUFBQSxJQUFHLE1BQUEsQ0FBQSxJQUFRLENBQUEsS0FBUixLQUFpQixVQUFwQjtBQUNJLE1BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUFBLENBREo7S0FBQTtBQUFBLElBRUEsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEVBQVYsQ0FBYSxRQUFiLEVBQXdCLElBQUMsQ0FBQSxzQkFBekIsQ0FGQSxDQUFBO1dBR0EsSUFBQyxDQUFBLHNCQUFELENBQUEsRUFKWTtFQUFBLENBbEhoQixDQUFBOztBQUFBLDJCQXlIQSxzQkFBQSxHQUF3QixTQUFBLEdBQUE7QUFFcEIsSUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBSDtBQUVJLE1BQUEsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEdBQVYsQ0FBYyxRQUFkLEVBQXlCLElBQUMsQ0FBQSxzQkFBMUIsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQUhKO0tBRm9CO0VBQUEsQ0F6SHhCLENBQUE7O0FBQUEsMkJBcUlBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFFUixRQUFBLDRDQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQUEsQ0FBb0IsQ0FBQyxHQUEzQixDQUFBO0FBQUEsSUFDQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLFFBQWpCLENBQTBCLENBQUMsS0FBM0IsQ0FBQSxDQUFrQyxDQUFDLE1BQW5DLENBQUEsQ0FEVCxDQUFBO0FBQUEsSUFFQSxNQUFBLEdBQVMsR0FBQSxHQUFNLE1BRmYsQ0FBQTtBQUFBLElBSUEsU0FBQSxHQUFZLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxTQUFWLENBQUEsQ0FKWixDQUFBO0FBQUEsSUFLQSxZQUFBLEdBQWUsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFNBQVYsQ0FBQSxDQUFBLEdBQXdCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQUEsQ0FMdkMsQ0FBQTtBQU9BLElBQUEsSUFBRyxDQUFBLFNBQUEsSUFBYSxHQUFiLElBQWEsR0FBYixJQUFvQixZQUFwQixDQUFIO2FBQ0ksS0FESjtLQUFBLE1BQUE7YUFHSSxNQUhKO0tBVFE7RUFBQSxDQXJJWixDQUFBOzt3QkFBQTs7R0FIeUIsV0FMN0IsQ0FBQTs7QUFBQSxNQTZKTSxDQUFDLE9BQVAsR0FBaUIsY0E3SmpCLENBQUE7Ozs7O0FDRUEsSUFBQSwwQkFBQTtFQUFBOzs2QkFBQTs7QUFBQSxhQUFBLEdBQWdCLG9CQUFoQixDQUFBOztBQUFBO0FBS0ksaUNBQUEsQ0FBQTs7QUFBYSxFQUFBLHFCQUFDLElBQUQsR0FBQTtBQUNULDZEQUFBLENBQUE7QUFBQSx1RUFBQSxDQUFBO0FBQUEscURBQUEsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUMsT0FBaEIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLEdBQUQsR0FBTyxJQUFJLENBQUMsR0FEWixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsWUFBRCxHQUFnQixFQUZoQixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsYUFBRCxHQUFpQixFQUhqQixDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBSkEsQ0FBQTtBQUFBLElBS0EsNkNBQU0sSUFBTixDQUxBLENBRFM7RUFBQSxDQUFiOztBQUFBLHdCQVNBLFFBQUEsR0FBVSxTQUFBLEdBQUE7V0FDTixDQUFDLENBQUMsSUFBRixDQUNJO0FBQUEsTUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLE9BQUQsR0FBWSxJQUFDLENBQUEsR0FBbEI7QUFBQSxNQUNBLE1BQUEsRUFBUSxLQURSO0FBQUEsTUFFQSxRQUFBLEVBQVUsTUFGVjtBQUFBLE1BR0EsT0FBQSxFQUFTLElBQUMsQ0FBQSxZQUhWO0FBQUEsTUFJQSxLQUFBLEVBQU8sSUFBQyxDQUFBLFdBSlI7S0FESixFQURNO0VBQUEsQ0FUVixDQUFBOztBQUFBLHdCQWlCQSxXQUFBLEdBQWEsU0FBQyxHQUFELEdBQUE7QUFDVCxVQUFNLEdBQU4sQ0FEUztFQUFBLENBakJiLENBQUE7O0FBQUEsd0JBb0JBLFlBQUEsR0FBYyxTQUFDLElBQUQsR0FBQTtBQUVWLElBQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFSLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FEQSxDQUFBO1dBRUEsSUFBQyxDQUFBLElBQUQsQ0FBTSxZQUFOLEVBSlU7RUFBQSxDQXBCZCxDQUFBOztBQUFBLHdCQTJCQSxZQUFBLEdBQWMsU0FBQyxDQUFELEVBQUcsQ0FBSCxHQUFBO0FBQ1YsUUFBQSxjQUFBO0FBQUEsSUFBQSxNQUFBLEdBQVMsYUFBYSxDQUFDLElBQWQsQ0FBbUIsQ0FBQyxDQUFDLFFBQXJCLENBQVQsQ0FBQTtBQUFBLElBQ0EsTUFBQSxHQUFTLGFBQWEsQ0FBQyxJQUFkLENBQW1CLENBQUMsQ0FBQyxRQUFyQixDQURULENBQUE7QUFFTyxJQUFBLElBQUcsUUFBQSxDQUFTLE1BQU8sQ0FBQSxDQUFBLENBQWhCLENBQUEsR0FBc0IsUUFBQSxDQUFTLE1BQU8sQ0FBQSxDQUFBLENBQWhCLENBQXpCO2FBQWtELENBQUEsRUFBbEQ7S0FBQSxNQUFBO2FBQTBELEVBQTFEO0tBSEc7RUFBQSxDQTNCZCxDQUFBOztBQUFBLHdCQWdDQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ1gsUUFBQSwyQkFBQTtBQUFBLElBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBZixDQUFvQixJQUFDLENBQUEsWUFBckIsQ0FBQSxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FDSTtBQUFBLE1BQUEsRUFBQSxFQUFHLE9BQUg7QUFBQSxNQUNBLEdBQUEsRUFBUSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFkLEdBQXFCLEdBQXJCLEdBQXdCLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBRDVDO0tBREosQ0FIQSxDQUFBO0FBT0E7QUFBQTtTQUFBLHFDQUFBO3FCQUFBO0FBQ0ksTUFBQSxLQUFLLENBQUMsR0FBTixHQUFlLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQWQsR0FBcUIsR0FBckIsR0FBd0IsS0FBSyxDQUFDLFFBQTVDLENBQUE7QUFBQSxtQkFDQSxJQUFDLENBQUEsWUFBWSxDQUFDLElBQWQsQ0FDSTtBQUFBLFFBQUEsRUFBQSxFQUFJLEtBQUssQ0FBQyxRQUFWO0FBQUEsUUFDQSxHQUFBLEVBQUssS0FBSyxDQUFDLEdBRFg7T0FESixFQURBLENBREo7QUFBQTttQkFSVztFQUFBLENBaENmLENBQUE7O0FBQUEsd0JBOENBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDUixJQUFBLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsSUFBbkIsRUFBeUIsSUFBQyxDQUFBLE9BQTFCLEVBQW1DLElBQW5DLENBQW5CLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUEsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsSUFBbkIsRUFBeUIsSUFBQyxDQUFBLE9BQTFCLEVBQW1DLElBQW5DLENBRGpCLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsaUJBQWIsQ0FBK0IsRUFBL0IsQ0FGQSxDQUFBO1dBR0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxpQkFBWCxDQUE2QixFQUE3QixFQUpRO0VBQUEsQ0E5Q1osQ0FBQTs7QUFBQSx3QkFzREEsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUVWLElBQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxnQkFBYixDQUE4QixVQUE5QixFQUEyQyxJQUFDLENBQUEscUJBQTVDLENBQUEsQ0FBQTtXQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsWUFBYixDQUEwQixJQUFDLENBQUEsYUFBM0IsRUFIVTtFQUFBLENBdERkLENBQUE7O0FBQUEsd0JBMERBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFHWCxJQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsZ0JBQVgsQ0FBNEIsVUFBNUIsRUFBeUMsSUFBQyxDQUFBLGdCQUExQyxDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsU0FBUyxDQUFDLFlBQVgsQ0FBd0IsSUFBQyxDQUFBLFlBQXpCLEVBSlc7RUFBQSxDQTFEZixDQUFBOztBQUFBLHdCQWdFQSxxQkFBQSxHQUF1QixTQUFDLENBQUQsR0FBQTtBQUVuQixJQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsbUJBQWIsQ0FBaUMsVUFBakMsRUFBOEMsSUFBQyxDQUFBLHFCQUEvQyxDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsSUFBRCxDQUFNLGFBQU4sRUFIbUI7RUFBQSxDQWhFdkIsQ0FBQTs7QUFBQSx3QkFxRUEsZ0JBQUEsR0FBa0IsU0FBQyxDQUFELEdBQUE7QUFFZCxJQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsbUJBQVgsQ0FBK0IsVUFBL0IsRUFBNEMsSUFBQyxDQUFBLGdCQUE3QyxDQUFBLENBQUE7V0FDQSxJQUFDLENBQUEsSUFBRCxDQUFNLGNBQU4sRUFIYztFQUFBLENBckVsQixDQUFBOztBQUFBLHdCQTZFQSxRQUFBLEdBQVUsU0FBQyxFQUFELEdBQUE7QUFFTixRQUFBLElBQUE7QUFBQSxJQUFBLElBQUEsR0FBUSxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBbUIsRUFBbkIsQ0FBUixDQUFBO0FBQ0EsSUFBQSxJQUFJLFlBQUo7QUFDSSxNQUFBLElBQUEsR0FBUSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBcUIsRUFBckIsQ0FBUixDQURKO0tBREE7QUFHQSxXQUFPLElBQVAsQ0FMTTtFQUFBLENBN0VWLENBQUE7O0FBQUEsd0JBb0ZBLEdBQUEsR0FBSyxTQUFDLEdBQUQsR0FBQTtBQUNELFFBQUEsU0FBQTtBQUFBO0FBQUEsU0FBQSxRQUFBO2lCQUFBO0FBQ0ksTUFBQSxJQUFHLENBQUEsS0FBSyxHQUFSO0FBQ0ksZUFBTyxDQUFQLENBREo7T0FESjtBQUFBLEtBREM7RUFBQSxDQXBGTCxDQUFBOztBQUFBLHdCQXlGQSxHQUFBLEdBQUssU0FBQyxHQUFELEVBQU0sR0FBTixHQUFBO1dBQ0QsSUFBQyxDQUFBLElBQUssQ0FBQSxHQUFBLENBQU4sR0FBYSxJQURaO0VBQUEsQ0F6RkwsQ0FBQTs7cUJBQUE7O0dBSHNCLGFBRjFCLENBQUE7O0FBQUEsTUF3R00sQ0FBQyxPQUFQLEdBQWlCLFdBeEdqQixDQUFBOzs7OztBQ0RBLElBQUEsbUJBQUE7RUFBQTs7NkJBQUE7O0FBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSw2QkFBUixDQUFYLENBQUE7O0FBQUE7QUFJSSwrQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7O0dBQUE7O0FBQUEsc0JBQUEsU0FBQSxHQUFZLEtBQVosQ0FBQTs7QUFBQSxzQkFDQSxPQUFBLEdBQVUsQ0FEVixDQUFBOztBQUFBLHNCQUVBLFFBQUEsR0FBVyxDQUZYLENBQUE7O0FBQUEsc0JBR0EsV0FBQSxHQUFhLENBSGIsQ0FBQTs7QUFBQSxzQkFNQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1IsSUFBQSxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQURBLENBQUE7QUFHQSxJQUFBLElBQUcsTUFBTSxDQUFDLFlBQVY7YUFDSSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBQSxFQURKO0tBSlE7RUFBQSxDQU5aLENBQUE7O0FBQUEsc0JBZUEsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNQLElBQUEsSUFBQyxDQUFBLGNBQUQsQ0FDSTtBQUFBLE1BQUEsbUJBQUEsRUFBc0IsY0FBdEI7QUFBQSxNQUVBLGFBQUEsRUFBZ0IsYUFGaEI7S0FESixDQUFBLENBQUE7QUFBQSxJQUtBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsU0FBZixFQUEyQixJQUFDLENBQUEsVUFBNUIsQ0FMQSxDQUFBO1dBTUEsQ0FBQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEVBQVosQ0FBZSxXQUFmLEVBQTZCLElBQUMsQ0FBQSxXQUE5QixFQVBPO0VBQUEsQ0FmWCxDQUFBOztBQUFBLHNCQTBCQSxZQUFBLEdBQWMsU0FBQyxHQUFELEdBQUE7QUFDVixJQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksR0FBWixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxTQUFWLENBQW9CLENBQUMsR0FBckIsQ0FDSTtBQUFBLE1BQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBQUEsR0FBcUIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsU0FBVixDQUFvQixDQUFDLE1BQXJCLENBQUEsQ0FBdEIsQ0FBakI7S0FESixDQURBLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FIQSxDQUFBO1dBSUEsSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQUxVO0VBQUEsQ0ExQmQsQ0FBQTs7QUFBQSxzQkFpQ0EsV0FBQSxHQUFhLFNBQUMsQ0FBRCxHQUFBO0FBQ1QsSUFBQSxJQUFDLENBQUEsT0FBRCxHQUFjLENBQUMsQ0FBQyxPQUFGLEtBQWUsTUFBbEIsR0FBaUMsQ0FBQyxDQUFDLE9BQW5DLEdBQWdELENBQUMsQ0FBQyxhQUFhLENBQUMsTUFBM0UsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsT0FBRCxHQUFXLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQUEsQ0FEdkIsQ0FBQTtXQUVBLElBQUMsQ0FBQSxPQUFELENBQVMsa0JBQVQsRUFBOEIsSUFBQyxDQUFBLFFBQS9CLEVBSFM7RUFBQSxDQWpDYixDQUFBOztBQUFBLHNCQXdDQSxZQUFBLEdBQWMsU0FBQyxDQUFELEdBQUE7QUFFVixJQUFBLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBTCxDQUNJO0FBQUEsTUFBQSxLQUFBLEVBQU0sTUFBTjtLQURKLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLE9BQUQsR0FBYyxDQUFDLENBQUMsT0FBRixLQUFlLE1BQWxCLEdBQWlDLENBQUMsQ0FBQyxPQUFuQyxHQUFnRCxDQUFDLENBQUMsYUFBYSxDQUFDLE1BRjNFLENBQUE7V0FHQSxJQUFDLENBQUEsU0FBRCxHQUFhLEtBTEg7RUFBQSxDQXhDZCxDQUFBOztBQUFBLHNCQStDQSxVQUFBLEdBQVksU0FBQyxDQUFELEdBQUE7QUFDUixJQUFBLElBQUMsQ0FBQSxHQUFHLENBQUMsR0FBTCxDQUNJO0FBQUEsTUFBQSxLQUFBLEVBQU0sTUFBTjtLQURKLENBQUEsQ0FBQTtXQUdBLElBQUMsQ0FBQSxTQUFELEdBQWEsTUFKTDtFQUFBLENBL0NaLENBQUE7O0FBQUEsc0JBcURBLFdBQUEsR0FBYSxTQUFDLENBQUQsR0FBQTtBQUNULElBQUEsSUFBRyxJQUFDLENBQUEsU0FBSjtBQUVJLE1BQUEsSUFBRyxDQUFDLENBQUMsS0FBRixHQUFVLElBQUMsQ0FBQSxPQUFYLElBQXNCLENBQXpCO0FBQ0ksUUFBQSxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsR0FBYixDQUNJO0FBQUEsVUFBQSxHQUFBLEVBQUssQ0FBTDtTQURKLENBQUEsQ0FESjtPQUFBLE1BR0ssSUFBRyxDQUFDLENBQUMsS0FBRixHQUFVLElBQUMsQ0FBQSxPQUFYLElBQXNCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQUEsQ0FBQSxHQUFxQixDQUFBLENBQUUsb0JBQUYsQ0FBdUIsQ0FBQyxNQUF4QixDQUFBLENBQTlDO0FBR0QsUUFBQSxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsR0FBYixDQUNJO0FBQUEsVUFBQSxHQUFBLEVBQU8sQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBQUEsR0FBcUIsQ0FBQSxDQUFFLG9CQUFGLENBQXVCLENBQUMsTUFBeEIsQ0FBQSxDQUF0QixDQUFBLEdBQTBELENBQWpFO1NBREosQ0FBQSxDQUhDO09BQUEsTUFBQTtBQU1ELFFBQUEsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLEdBQWIsQ0FDSTtBQUFBLFVBQUEsR0FBQSxFQUFLLENBQUMsQ0FBQyxLQUFGLEdBQVUsSUFBQyxDQUFBLE9BQWhCO1NBREosQ0FBQSxDQU5DO09BSEw7QUFBQSxNQWFBLElBQUMsQ0FBQSxRQUFELEdBQVksUUFBQSxDQUFTLENBQUEsQ0FBRSxvQkFBRixDQUF1QixDQUFDLEdBQXhCLENBQTRCLEtBQTVCLENBQVQsQ0FBQSxHQUErQyxDQUFDLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQUEsQ0FBQSxHQUFxQixDQUFBLENBQUUsb0JBQUYsQ0FBdUIsQ0FBQyxNQUF4QixDQUFBLENBQXRCLENBYjNELENBQUE7QUFlQSxNQUFBLElBQUcsSUFBQyxDQUFBLFFBQUQsR0FBWSxVQUFBLENBQVcsSUFBWCxDQUFmO0FBQ0ksUUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLENBQVosQ0FESjtPQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsUUFBRCxHQUFZLFVBQUEsQ0FBVyxJQUFYLENBQWY7QUFDRCxRQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBWixDQURDO09BakJMO0FBQUEsTUFxQkEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxjQUFULEVBQTBCLElBQUMsQ0FBQSxRQUEzQixDQXJCQSxDQUZKO0tBQUE7QUEwQkEsSUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFELEtBQWEsQ0FBQyxDQUFDLE9BQWYsSUFBMkIsSUFBQyxDQUFBLE1BQUQsS0FBYSxDQUFDLENBQUMsT0FBN0M7QUFDSSxNQUFBLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBRCxDQUFBLENBREEsQ0FESjtLQTFCQTtBQUFBLElBOEJBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxDQUFDLE9BOUJaLENBQUE7V0ErQkEsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUFDLENBQUMsUUFoQ0g7RUFBQSxDQXJEYixDQUFBOztBQUFBLHNCQXVGQSxRQUFBLEdBQVUsU0FBQyxDQUFELEdBQUE7QUFHTixJQUFBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFNBQVYsQ0FBb0IsQ0FBQyxHQUFyQixDQUNJO0FBQUEsTUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBQUEsR0FBcUIsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLE1BQWIsQ0FBQSxDQUF0QixDQUFBLEdBQWdELENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQUEsQ0FBeEQ7S0FESixDQUFBLENBQUE7V0FHQSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxRQUFmLEVBTk07RUFBQSxDQXZGVixDQUFBOztBQUFBLHNCQWdHQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ1gsSUFBQSxJQUFHLHdCQUFIO0FBQ0ksTUFBQSxZQUFBLENBQWEsSUFBQyxDQUFBLFdBQWQsQ0FBQSxDQURKO0tBQUE7V0FJQSxJQUFDLENBQUEsV0FBRCxHQUFlLFVBQUEsQ0FBVyxDQUFDLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFBLEdBQUE7QUFDdkIsUUFBQSxJQUFHLEtBQUMsQ0FBQSxNQUFELEdBQVUsRUFBYjtpQkFDSSxRQUFRLENBQUMsRUFBVCxDQUFZLEtBQUMsQ0FBQSxHQUFiLEVBQWtCLEVBQWxCLEVBQ0k7QUFBQSxZQUFBLFNBQUEsRUFBVyxDQUFYO1dBREosRUFESjtTQUR1QjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUQsQ0FBWCxFQUlQLElBSk8sRUFMSjtFQUFBLENBaEdmLENBQUE7O0FBQUEsc0JBNEdBLGFBQUEsR0FBZSxTQUFBLEdBQUE7V0FDWCxRQUFRLENBQUMsRUFBVCxDQUFZLElBQUMsQ0FBQSxHQUFiLEVBQW1CLEVBQW5CLEVBQ0k7QUFBQSxNQUFBLFNBQUEsRUFBVyxFQUFYO0tBREosRUFEVztFQUFBLENBNUdmLENBQUE7O21CQUFBOztHQUZvQixTQUZ4QixDQUFBOztBQUFBLE1Bc0hNLENBQUMsT0FBUCxHQUFpQixTQXRIakIsQ0FBQTs7Ozs7QUNDQSxJQUFBLE1BQUE7O0FBQUE7c0JBR0k7O0FBQUEsRUFBQSxNQUFNLENBQUMsWUFBUCxHQUFzQixTQUFBLEdBQUE7V0FDbEIsRUFBRSxDQUFDLElBQUgsQ0FDSTtBQUFBLE1BQUEsS0FBQSxFQUFNLGlCQUFOO0FBQUEsTUFDQSxVQUFBLEVBQVcsZUFEWDtBQUFBLE1BRUEsTUFBQSxFQUFRLElBRlI7QUFBQSxNQUdBLElBQUEsRUFBTSxJQUhOO0tBREosRUFEa0I7RUFBQSxDQUF0QixDQUFBOztBQUFBLEVBVUEsTUFBTSxDQUFDLFlBQVAsR0FBc0IsU0FBQyxZQUFELEVBQWdCLEdBQWhCLEVBQXFCLFFBQXJCLEdBQUE7QUFDbEIsUUFBQSxXQUFBO0FBQUEsSUFBQSxJQUFBLEdBQU8sWUFBUCxDQUFBO0FBQUEsSUFDQSxRQUFBLEdBQVcsRUFEWCxDQUFBO0FBQUEsSUFFQSxHQUFBLEdBQU0sR0FGTixDQUFBO0FBQUEsSUFHQSxLQUFBLEdBQVEsd0NBQUEsR0FBMkMsa0JBQUEsQ0FBbUIsSUFBbkIsQ0FBM0MsR0FBc0UsT0FBdEUsR0FBZ0Ysa0JBQUEsQ0FBbUIsR0FBbkIsQ0FIeEYsQ0FBQTtBQUlBLElBQUEsSUFBbUMsUUFBbkM7QUFBQSxNQUFBLEdBQUEsSUFBTyxZQUFBLEdBQWUsUUFBdEIsQ0FBQTtLQUpBO1dBS0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLEtBQXJCLEVBQTRCLFNBQTVCLEVBTmtCO0VBQUEsQ0FWdEIsQ0FBQTs7QUFBQSxFQWtCQSxNQUFNLENBQUMsYUFBUCxHQUF1QixTQUFDLElBQUQsRUFBUSxPQUFSLEVBQWlCLFdBQWpCLEVBQStCLElBQS9CLEVBQXNDLE9BQXRDLEdBQUE7V0FFbkIsRUFBRSxDQUFDLEVBQUgsQ0FDSTtBQUFBLE1BQUEsTUFBQSxFQUFPLE1BQVA7QUFBQSxNQUNBLElBQUEsRUFBSyxJQURMO0FBQUEsTUFFQSxPQUFBLEVBQVEsT0FGUjtBQUFBLE1BR0EsSUFBQSxFQUFNLElBSE47QUFBQSxNQUlBLE9BQUEsRUFBUSxPQUpSO0FBQUEsTUFLQSxXQUFBLEVBQVksV0FMWjtLQURKLEVBRm1CO0VBQUEsQ0FsQnZCLENBQUE7O0FBQUEsRUE2QkEsTUFBTSxDQUFDLFdBQVAsR0FBcUIsU0FBQyxHQUFELEdBQUE7V0FFakIsSUFBQyxDQUFBLFNBQUQsQ0FBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXNCLG9DQUFBLEdBQXFDLEdBQTNELEVBQWdFLFFBQWhFLEVBRmlCO0VBQUEsQ0E3QnJCLENBQUE7O0FBQUEsRUFpQ0EsTUFBTSxDQUFDLGNBQVAsR0FBd0IsU0FBQyxHQUFELEVBQU8sV0FBUCxFQUFvQixPQUFwQixHQUFBO0FBRXBCLElBQUEsV0FBQSxHQUFjLFdBQVcsQ0FBQyxLQUFaLENBQWtCLEdBQWxCLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsR0FBNUIsQ0FBZCxDQUFBO1dBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxHQUFYLEVBQWdCLEdBQWhCLEVBQXFCLDhDQUFBLEdBQThDLENBQUMsa0JBQUEsQ0FBbUIsR0FBbkIsQ0FBRCxDQUE5QyxHQUF1RSxtQkFBdkUsR0FBMEYsV0FBMUYsR0FBc0csYUFBdEcsR0FBa0gsQ0FBQyxrQkFBQSxDQUFtQixPQUFuQixDQUFELENBQXZJLEVBSG9CO0VBQUEsQ0FqQ3hCLENBQUE7O0FBQUEsRUF1Q0EsTUFBTSxDQUFDLFNBQVAsR0FBbUIsU0FBQyxPQUFELEVBQVUsSUFBVixHQUFBO0FBQ2YsUUFBQSxDQUFBO0FBQUEsSUFBQSxDQUFBLEdBQUksSUFBQyxDQUFBLFNBQUQsQ0FBVyxDQUFYLEVBQWUsQ0FBZixFQUFrQixrQkFBQSxHQUFrQixDQUFDLGtCQUFBLENBQW1CLE9BQW5CLENBQUQsQ0FBbEIsR0FBK0MsUUFBL0MsR0FBc0QsQ0FBQyxrQkFBQSxDQUFtQixJQUFuQixDQUFELENBQXhFLENBQUosQ0FBQTtXQUNBLENBQUMsQ0FBQyxLQUFGLENBQUEsRUFGZTtFQUFBLENBdkNuQixDQUFBOztBQUFBLEVBMkNBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxHQUFQLEVBQVksSUFBWixHQUFBO1dBQ2YsTUFBTSxDQUFDLElBQVAsQ0FBWSxHQUFaLEVBQWlCLElBQWpCLEVBQXVCLGlCQUFBLEdBQW9CLENBQXBCLEdBQXdCLFVBQXhCLEdBQXFDLENBQXJDLEdBQXlDLFFBQXpDLEdBQW9ELENBQUMsTUFBTSxDQUFDLEtBQVAsR0FBZSxDQUFoQixDQUFBLEdBQXFCLENBQXpFLEdBQTZFLE9BQTdFLEdBQXVGLENBQUMsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBakIsQ0FBQSxHQUFzQixDQUFwSSxFQURlO0VBQUEsQ0EzQ25CLENBQUE7O2dCQUFBOztJQUhKLENBQUE7O0FBQUEsTUFrRE0sQ0FBQyxPQUFQLEdBQWlCLE1BbERqQixDQUFBOzs7OztBQ0ZBLElBQUEsd0VBQUE7O0FBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSwyQkFBUixDQUFWLENBQUE7O0FBQUEsU0FDQSxHQUFZLE9BQUEsQ0FBUSxnQ0FBUixDQURaLENBQUE7O0FBQUEsZ0JBRUEsR0FBbUIsT0FBQSxDQUFRLHVDQUFSLENBRm5CLENBQUE7O0FBQUEsV0FHQSxHQUFjLE9BQUEsQ0FBUSxrQ0FBUixDQUhkLENBQUE7O0FBQUEscUJBSUEsR0FBd0IsT0FBQSxDQUFRLDBDQUFSLENBSnhCLENBQUE7O0FBQUEsQ0FPQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEtBQVosQ0FBa0IsU0FBQSxHQUFBO0FBRWQsTUFBQSxrQkFBQTtTQUFBLGtCQUFBLEdBQXlCLElBQUEscUJBQUEsQ0FDckI7QUFBQSxJQUFBLEVBQUEsRUFBSSxNQUFKO0dBRHFCLEVBRlg7QUFBQSxDQUFsQixDQVBBLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5WaWV3QmFzZSA9IHJlcXVpcmUgXCIuL1ZpZXdCYXNlLmNvZmZlZVwiXG5TY3JvbGxCYXIgPSByZXF1aXJlIFwiLi4vdXRpbC9TY3JvbGxCYXIuY29mZmVlXCJcbkhlYWRlckFuaW1hdGlvbiA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvSGVhZGVyQW5pbWF0aW9uLmNvZmZlZSdcbmNsb3VkcyA9IHJlcXVpcmUgJy4uL3BhZ2VzL2FuaW1hdGlvbnMvY2xvdWRzLmNvZmZlZSdcblxuY2xhc3MgQW5pbWF0aW9uQmFzZSBleHRlbmRzIFZpZXdCYXNlXG5cblxuICAgIGNvbnN0cnVjdG9yOiAoZWwpIC0+XG4gICAgICAgIHN1cGVyKGVsKVxuICAgICAgICBAdGltZWxpbmUgPSBudWxsXG4gICAgICAgIEB0b3VjaFkgPSAwXG4gICAgICAgIEB0b3VjaFlMYXN0ID0gMFxuICAgICAgICBAZ2xvYmFsU2Nyb2xsQW1vdW50ID0gaWYgQGlzVGFibGV0IHRoZW4gLjUgZWxzZSAxXG4gICAgICAgIEBwcmV2U2Nyb2xsVG8gPSAwXG4gICAgICAgIEBwcmV2RGVsdGEgPSAwXG4gICAgICAgIEBjdXJyZW50UHJvZ3Jlc3MgPSAwXG4gICAgICAgIEB0b3RhbEFuaW1hdGlvblRpbWUgPSAxMFxuICAgICAgICBAc21vb3RoTXVsdGlwbGllciA9IDVcbiAgICAgICAgQG5hdlRpbWVyID0gbnVsbFxuICAgICAgICBAdmlkZW8gPSBudWxsXG4gICAgICAgIEBpbmxpbmVWaWRlbyA9IG51bGxcbiAgICAgICAgQGlzVGFibGV0ID0gJCgnaHRtbCcpLmhhc0NsYXNzKCd0YWJsZXQnKVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIGlmICFAaXNQaG9uZSAgXG4gICAgICAgICAgICBAcmVzZXRUaW1lbGluZSgpXG4gICAgICAgICAgICBAdG9nZ2xlVG91Y2hNb3ZlKClcbiAgICAgICAgICAgIEBvblJlc2l6ZSgpXG4gICAgICAgICAgICBAdXBkYXRlVGltZWxpbmUoKVxuXG4gICAgaW5pdENvbXBvbmVudHM6IC0+XG4gICAgICAgIEBoZWFkZXIgPSBuZXcgSGVhZGVyQW5pbWF0aW9uIFxuICAgICAgICAgICAgZWw6J2hlYWRlcidcblxuICAgIFxuXG5cbiAgICB0b2dnbGVUb3VjaE1vdmU6ICgpID0+XG4gICAgICAgICQoZG9jdW1lbnQpLm9mZiAnc2Nyb2xsJyAsIEBvblNjcm9sbFxuICAgICAgICBcbiAgICAgICAgQHNjcm9sbCA9XG4gICAgICAgICAgICBwb3NpdGlvbjogMFxuICAgICAgICAgICAgc2Nyb2xsVG9wOiAwXG4gICAgICAgICQoZG9jdW1lbnQpLnNjcm9sbCBAb25TY3JvbGxcbiAgICAgICAgQG9uU2Nyb2xsKClcblxuXG4gICAgZ2V0U2Nyb2xsYWJsZUFyZWE6IC0+XG4gICAgICAgIE1hdGguYWJzKCQoXCIjY29udGVudFwiKS5vdXRlckhlaWdodCgpIC0gQHN0YWdlSGVpZ2h0KVxuICAgIFxuICAgIGdldFNjcm9sbFRvcDogLT5cbiAgICAgICAgJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkgLyBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAgICAgXG4gICAgXG4gICAgXG4gICAgc2V0U2Nyb2xsVG9wOiAocGVyKSAtPiAgICAgIFxuICAgICAgICBwb3MgPSBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAqIHBlclxuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8gMCAsIHBvc1xuXG5cbiAgICBzZXREcmFnZ2FibGVQb3NpdGlvbjogKHBlcikgLT4gICAgICAgIFxuICAgICAgICBwb3MgPSBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAqIHBlciAgICAgICAgXG4gICAgICAgIFR3ZWVuTWF4LnNldCAkKFwiI2NvbnRlbnRcIikgLFxuICAgICAgICAgICAgeTogLXBvcyBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgb25TY3JvbGw6IChlKSA9PlxuICAgICAgICBpZiAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSA+IDMwXG4gICAgICAgICAgICAkKCcuY2lyYy1idG4td3JhcHBlcicpLmFkZENsYXNzICdpbnZpc2libGUnXG4gICAgICAgICAgICBcbiAgICAgICAgQHNjcm9sbC5wb3NpdGlvbiA9IEBnZXRTY3JvbGxUb3AoKVxuICAgICAgICBAc2Nyb2xsLnNjcm9sbFRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpXG4gICAgICAgIEB1cGRhdGVUaW1lbGluZSgpICAgICAgICBcbiAgICAgICAgXG5cbiAgICBvbkRyYWc6IChlKSA9PlxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEBzY3JvbGwucG9zaXRpb24gPSBNYXRoLmFicyBAc2Nyb2xsLnkgLyAgQGdldFNjcm9sbGFibGVBcmVhKClcbiAgICAgICAgQHNjcm9sbC5zY3JvbGxUb3AgPSAtQHNjcm9sbC55XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVUaW1lbGluZSgpXG5cblxuICAgIG9uUmVzaXplOiA9PlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIGlmICFAaXNUYWJsZXRcbiAgICAgICAgICAgIEByZXNldFRpbWVsaW5lKClcbiAgICAgICAgICAgIFxuICAgICAgICBAY2VudGVyT2Zmc2V0ID0gKEBzdGFnZUhlaWdodCAqIC42NjY3KVxuICAgICAgICBpZiBAc2Nyb2xsP1xuICAgICAgICAgICAgcG9zID0gQHNjcm9sbC5wb3NpdGlvbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHRvZ2dsZVRvdWNoTW92ZSgpXG4gICAgICAgICAgICBpZiAhQGlzVGFibGV0XG4gICAgICAgICAgICAgICAgQHNldFNjcm9sbFRvcChwb3MpXG4gICAgICAgICAgICBcblxuICAgIHJlc2V0VGltZWxpbmU6ID0+XG4gICAgICAgIEB0aW1lbGluZSA9IG5ldyBUaW1lbGluZU1heFxuICAgICAgICBAdHJpZ2dlcnMgPSBbXVxuICAgICAgICBAcGFyYWxsYXggPSBbXVxuXG4gICAgICAgICQoJ1tkYXRhLWNsb3VkXScpLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgICRlbCA9ICQodClcbiAgICAgICAgICAgICRjbG9zZXN0Q29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJ1tkYXRhLWNsb3VkLWNvbnRhaW5lcl0nKVxuICAgICAgICAgICAgaW5pdFBvcyA9ICRjbG9zZXN0Q29udGFpbmVyLmRhdGEoKS5jbG91ZENvbnRhaW5lci5pbml0UG9zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2xvdWRGdW5jdGlvbiA9IGNsb3Vkc1xuICAgICAgICAgICAgICAgICRlbDokZWxcblxuICAgICAgICAgICAgaWYgaW5pdFBvcyBcbiAgICAgICAgICAgICAgICBjbG91ZEZ1bmN0aW9uKGluaXRQb3MpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAcGFyYWxsYXgucHVzaCBjbG91ZEZ1bmN0aW9uXG5cbiAgICB1cGRhdGVUaW1lbGluZTogPT5cbiAgICAgICAgXG4gICAgICAgIEBoZWFkZXIuYW5pbWF0ZUhlYWRlcihAc2Nyb2xsLnNjcm9sbFRvcClcblxuICAgICAgICBmb3IgdCBpbiBAdHJpZ2dlcnNcbiAgICAgICAgICAgIGlmIEBzY3JvbGwuc2Nyb2xsVG9wID4gdC5vZmZzZXQgLSBAY2VudGVyT2Zmc2V0XG4gICAgICAgICAgICAgICAgdC5hLnBsYXkoKVxuICAgICAgICAgICAgZWxzZSBpZiBAc2Nyb2xsLnNjcm9sbFRvcCArIEBzdGFnZUhlaWdodCA8IHQub2Zmc2V0XG4gICAgICAgICAgICAgICAgdC5hLnBhdXNlZCh0cnVlKVxuICAgICAgICAgICAgICAgIHQuYS5zZWVrKDApXG5cblxuICAgICAgICBmb3IgcCBpbiBAcGFyYWxsYXhcbiAgICAgICAgICAgIHAoQHNjcm9sbC5wb3NpdGlvbilcblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25CYXNlXG4iLCJjbGFzcyBQbHVnaW5CYXNlIGV4dGVuZHMgRXZlbnRFbWl0dGVyXG5cblxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIEAkZWwgPSBpZiBvcHRzLmVsPyB0aGVuICQgb3B0cy5lbFxuXG4gICAgICAgIEBpbml0aWFsaXplKG9wdHMpXG5cblxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cbiAgICAgICAgQGFkZEV2ZW50cygpXG5cbiAgICBhZGRFdmVudHM6IC0+XG5cblxuXG4gICAgcmVtb3ZlRXZlbnRzOiAtPlxuXG5cbiAgICBkZXN0cm95OiAtPlxuICAgICAgICBAcmVtb3ZlRXZlbnRzKClcblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsdWdpbkJhc2VcblxuIiwiXG5TaGFyZXIgPSByZXF1aXJlIFwiLi4vdXRpbC9TaGFyZXIuY29mZmVlXCIgXG5cblxuY2xhc3MgVmlld0Jhc2UgZXh0ZW5kcyBFdmVudEVtaXR0ZXJcblxuXG5cblxuXG4gICAgY29uc3RydWN0b3I6IChlbCkgLT5cblxuICAgICAgICBAJGVsID0gJChlbClcbiAgICAgICAgQGlzVGFibGV0ID0gJChcImh0bWxcIikuaGFzQ2xhc3MoXCJ0YWJsZXRcIilcbiAgICAgICAgQGlzUGhvbmUgPSAkKFwiaHRtbFwiKS5oYXNDbGFzcyhcInBob25lXCIpXG4gICAgICAgIEBjZG5Sb290ID0gJCgnYm9keScpLmRhdGEoJ2NkbicpIG9yIFwiL1wiXG4gICAgICAgICQod2luZG93KS5vbiBcInJlc2l6ZS5hcHBcIiAsIEBvblJlc2l6ZVxuXG4gICAgICAgIEBzdGFnZUhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICBAc3RhZ2VXaWR0aCA9ICQod2luZG93KS53aWR0aCgpXG4gICAgICAgIEBtb3VzZVggPSAwXG4gICAgICAgIEBtb3VzZVkgPSAwXG5cbiAgICAgICAgI0BkZWxlZ2F0ZUV2ZW50cyhAZ2VuZXJhdGVFdmVudHMoKSlcbiAgICAgICAgQGluaXRpYWxpemUoKVxuXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBAaW5pdENvbXBvbmVudHMoKVxuXG4gICAgaW5pdENvbXBvbmVudHM6IC0+XG5cbiAgICBvblJlc2l6ZTogPT5cbiAgICAgICAgQHN0YWdlSGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXG4gICAgICAgIEBzdGFnZVdpZHRoID0gJCh3aW5kb3cpLndpZHRoKClcblxuXG4gICAgZ2VuZXJhdGVFdmVudHM6IC0+XG4gICAgICAgIHJldHVybiB7fVxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld0Jhc2VcbiIsIkJhc2ljT3ZlcmxheSA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvQmFzaWNPdmVybGF5LmNvZmZlZSdcblN2Z0luamVjdCA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvU3ZnSW5qZWN0LmNvZmZlZSdcblxuXG5cbmlmIHdpbmRvdy5jb25zb2xlIGlzIHVuZGVmaW5lZCBvciB3aW5kb3cuY29uc29sZSBpcyBudWxsXG4gIHdpbmRvdy5jb25zb2xlID1cbiAgICBsb2c6IC0+XG4gICAgd2FybjogLT5cbiAgICBmYXRhbDogLT5cblxuXG5cbiQoZG9jdW1lbnQpLnJlYWR5IC0+XG4gICAgIyQoJy5zdmctaW5qZWN0Jykuc3ZnSW5qZWN0KClcbiAgICAjbmV3IFN2Z0luamVjdCBcIi5zdmctaW5qZWN0XCJcbiAgICBcbiAgICBiYXNpY092ZXJsYXlzID0gbmV3IEJhc2ljT3ZlcmxheVxuICAgICAgICBlbDogJCgnI2NvbnRlbnQnKVxuXG5cbiAgICAkKCcuc2Nyb2xsdG8nKS5jbGljayAtPlxuICAgICAgIHQgPSAkKHRoaXMpLmRhdGEoJ3RhcmdldCcpXG4gICAgICAgJCgnYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiAkKCcjJyt0KS5vZmZzZXQoKS50b3AgLSA3MCAjIDcwIGZvciB0aGUgY29sbGFwc2VkIGhlYWRlclxuICAgICAgICB9KTtcblxuICAgICNpZiB3aW5kb3cuZGRscz9cbiAgICAjIGNvbnNvbGUubG9nICdjbGlja3knXG4gICAgJCh3aW5kb3cpLmNsaWNrIC0+XG4gICAgICAgIGlmIHdpbmRvdy5kZGxzP1xuICAgICAgICAgICAgJC5lYWNoIHdpbmRvdy5kZGxzLCAoaSwgdCkgLT5cbiAgICAgICAgICAgICAgICBpZiB0LmlzT3BlbiBhbmQgbm90IHQuaXNIb3ZlcmVkXG4gICAgICAgICAgICAgICAgICAgIHQuY2xvc2VNZW51KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAkKCdbZGF0YS1kZXB0aF0nKS5lYWNoIC0+XG4gICAgICAgICRlbCA9ICQoQClcbiAgICAgICAgZGVwdGggPSAkZWwuZGF0YSgpLmRlcHRoXG4gICAgICAgIFxuICAgICAgICAkZWwuY3NzKCd6LWluZGV4JywgZGVwdGgpXG4gICAgICAgIFR3ZWVuTWF4LnNldCAkZWwgLCBcbiAgICAgICAgICAgIHo6IGRlcHRoICogMTBcblxuXG5cbiAgICAkKCdib2R5Jykub24gJ0RPTU5vZGVJbnNlcnRlZCcsICAtPlxuICAgICAgICAkKCdhJykuZWFjaCAtPiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGhyZWYgPSAkKEApLmF0dHIoJ2hyZWYnKVxuICAgICAgICAgICAgaWYgaHJlZj9cbiAgICAgICAgICAgICAgICBocmVmID0gaHJlZi50cmltKClcbiAgICAgICAgICAgICAgICBpZiBocmVmLmluZGV4T2YoJ2h0dHA6Ly8nKSBpcyAwIG9yIGhyZWYuaW5kZXhPZignaHR0cHM6Ly8nKSBpcyAwIG9yIGhyZWYuaW5kZXhPZignLnBkZicpIGlzIChocmVmLmxlbmd0aCAtIDQpXG4gICAgICAgICAgICAgICAgICAgICQoQCkuYXR0cigndGFyZ2V0JywgJ19ibGFuaycpXG5cblxuICAgICQoJy5jaXJjbGUsIC5jaXJjbGUtb3V0ZXInKS5vbignbW91c2VlbnRlcicsIC0+XG4gICAgICAgIFR3ZWVuTWF4LnRvKCQodGhpcyksIC4zNSxcbiAgICAgICAgICAgIHNjYWxlOiAxLjA1LFxuICAgICAgICAgICAgZWFzZTogUG93ZXIyLmVhc2VPdXRcbiAgICAgICAgKVxuICAgIClcblxuICAgICQoJy5jaXJjbGUsIC5jaXJjbGUtb3V0ZXInKS5vbignbW91c2VsZWF2ZScsIC0+XG4gICAgICAgIFR3ZWVuTWF4LnRvKCQodGhpcyksIC4zNSxcbiAgICAgICAgICAgIHNjYWxlOiAxLFxuICAgICAgICAgICAgZWFzZTogUG93ZXIyLmVhc2VPdXRcbiAgICAgICAgKVxuICAgIClcblxuICAgICQoJyNqb2JzLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXIgbGknKS5vbignbW91c2VlbmV0ZXInLCAtPlxuICAgICAgICBjb25zb2xlLmxvZyAnaGVsbG8nXG4gICAgKVxuXG5cbiMgdGhpcyBpcyBzaGl0dHksIGJ1dCBpdCdzIG15IG9ubHkgd29ya2Fyb3VuZCBmb3IgdGhlIGNsaXBwaW5nIGlzc3VlIChDRi0xNzEpXG5kb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSAtPlxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlIGlzICdjb21wbGV0ZScpXG4gICAgICAgIHNldFRpbWVvdXQoLT5cbiAgICAgICAgICAgICQoJy5xdW90ZScpLmFkZENsYXNzKCdrZWVwaXRhaHVuZHJlZCcpXG4gICAgICAgICwgMjAwKVxuIiwiQW5pbWF0aW9uQmFzZSA9IHJlcXVpcmUgXCIuLi9hYnN0cmFjdC9BbmltYXRpb25CYXNlLmNvZmZlZVwiXG5QYXJrc0xpc3QgPSByZXF1aXJlICcuLi9wbHVnaW5zL1BhcmtzTGlzdC5jb2ZmZWUnXG5EcmFnZ2FibGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9EcmFnZ2FibGVHYWxsZXJ5LmNvZmZlZSdcbkZhZGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9GYWRlR2FsbGVyeS5jb2ZmZWUnXG5IZWFkZXJBbmltYXRpb24gPSByZXF1aXJlICcuLi9wbHVnaW5zL0hlYWRlckFuaW1hdGlvbi5jb2ZmZWUnXG5SZXNpemVCdXR0b25zID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9SZXNpemVCdXR0b25zLmNvZmZlZSdcbkZyYW1lQW5pbWF0aW9uID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9jb2FzdGVycy9GcmFtZUFuaW1hdGlvbi5jb2ZmZWUnXG5hbmltYXRpb25zID0gcmVxdWlyZSAnLi9hbmltYXRpb25zL3BhcnRuZXJzaGlwZGV0YWlscy5jb2ZmZWUnXG5nbG9iYWxBbmltYXRpb25zID0gcmVxdWlyZSAnLi9hbmltYXRpb25zL2dsb2JhbC5jb2ZmZWUnXG5Gb3JtSGFuZGxlciA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvRm9ybUhhbmRsZXIuY29mZmVlJ1xuICAgICAgICBcblxuY2xhc3MgUGFydG5lcnNoaXBEZXRhaWxQYWdlIGV4dGVuZHMgQW5pbWF0aW9uQmFzZVxuXG5cbiAgICBjb25zdHJ1Y3RvcjogKGVsKSAtPlxuICAgICAgICBAdG90YWxBbmltYXRpb25UaW1lID0gMjVcbiAgICAgICAgc3VwZXIoZWwpXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBzdXBlcigpXG5cbiAgICBpbml0Q29tcG9uZW50czogLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgICMgQHJlc2V0SGVpZ2h0KCcjdHlwZURlc2NyaXB0aW9ucycsICcjdHlwZURlc2NyaXB0aW9ucyBsaS5ncm91cC1pbmZvJylcbiAgICAgICAgXG4gICAgICAgIGlmICFAaXNQaG9uZVxuXG4gICAgICAgICAgICBjb2FzdGVyID0gbmV3IEZyYW1lQW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgaWQ6XCJwYXJ0bmVyc2hpcC1kZXRhaWxzLWNvYXN0ZXItMVwiXG4gICAgICAgICAgICAgICAgZWw6XCIjcGFydG5lcnNoaXAtZGV0YWlscy1zZWN0aW9uMVwiXG4gICAgICAgICAgICAgICAgYmFzZVVybDogXCIje0BjZG5Sb290fWNvYXN0ZXJzL1wiXG4gICAgICAgICAgICAgICAgdXJsOiBcInNob3QtMi9kYXRhLmpzb25cIlxuXG4gICAgICAgICAgICBjb2FzdGVyLmxvYWRGcmFtZXMoKVxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEByZXNldEhlaWdodCgnI3NlbGVjdC1tZWRpYS1nYWxsZXJ5JywgJyNzZWxlY3QtbWVkaWEtZ2FsbGVyeSBsaS5ncm91cC1pbmZvJylcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIHNwb25zb3JzaGlwVHlwZXMgPSBuZXcgRmFkZUdhbGxlcnlcbiAgICAgICAgICAgIGVsOlwiI3NlbGVjdC1tZWRpYS1nYWxsZXJ5XCJcbiAgICAgICAgICAgIHBhZ2U6ICdwYXJ0bmVyc2hpcC1kZXRhaWxzJ1xuXG4gICAgICAgIHNwb25zb3JzaGlwRm9ybSA9IG5ldyBGb3JtSGFuZGxlclxuICAgICAgICAgICAgZWw6ICcjcGFydG5lcnNoaXAtY29udGFjdC1mb3JtJ1xuICAgICAgICAgICAgXG4gICAgICAgIHNwb25zb3JzaGlwVHlwZURldGFpbHMgPSBuZXcgRmFkZUdhbGxlcnlcbiAgICAgICAgICAgIGVsOlwiI3R5cGVEZXNjcmlwdGlvbnNcIlxuICAgICAgICAgICAgXG4gICAgICAgIHdpbmRvdy5kZGxzID0gW11cblxuICAgICAgICB3aW5kb3cuZGRscy5wdXNoICQoJyNQYXJ0bmVyc2hpcFR5cGVzLXNlbGVjdCcpLmNmRHJvcGRvd25cbiAgICAgICAgICAgIG9uU2VsZWN0OiAodCkgLT5cbiAgICAgICAgICAgICAgICAkKCcudGl0bGUtYnVja2V0LnNldmVuIGgxJykudGV4dCgkKHQpLnRleHQoKSlcbiAgICAgICAgICAgICAgICBpZCA9ICQodCkuZGF0YSgnaWQnKVxuICAgICAgICAgICAgICAgIHNwb25zb3JzaGlwVHlwZXMuZ290byBpZFxuICAgICAgICAgICAgICAgICMgc3BvbnNvcnNoaXBUeXBlRGV0YWlscy5nb3RvIGlkXG5cbiAgICAgICAgd2luZG93LmRkbHMucHVzaCAkKCcjUGFydG5lcnNoaXBUeXBlczEtc2VsZWN0JykuY2ZEcm9wZG93blxuICAgICAgICAgICAgb25TZWxlY3Q6ICh0KSAtPlxuICAgICAgICAgICAgICAgIGlkID0gJCh0KS5kYXRhKCdpZCcpXG5cbiAgICAgICAgd2luZG93LmRkbHMucHVzaCAkKCcjUGFydG5lcnNoaXBUeXBlczItc2VsZWN0JykuY2ZEcm9wZG93blxuICAgICAgICAgICAgb25TZWxlY3Q6ICh0KSAtPlxuICAgICAgICAgICAgICAgIGlkID0gJCh0KS5kYXRhKCdpZCcpXG4gICAgICAgICAgICAgICAgIyMjbnVtYmVycyA9IG5ldyBEcmFnZ2FibGVHYWxsZXJ5XG4gICAgICAgICAgICAgICAgICAgIGVsOlwiI3NlbGVjdFwiXG4gICAgICAgICAgICAgICAgICAgIGFjcm9zczogMSMjI1xuICBcbiAgICAgICAgQGZpbmREZWVwTGluaygpXG4gIFxuICAgIFxuICAgIFxuICAgIGZpbmREZWVwTGluazogPT5cbiAgICAgICAgbG9jYXRpb24gPSB3aW5kb3cubG9jYXRpb24uaHJlZlxuICAgICAgICBwYXJ0cyA9IGxvY2F0aW9uLnNwbGl0KCcvJylcbiAgICAgICAgbGFzdHBhcnQgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXVxuICAgICAgICBcbiAgICAgICAgaWYgKGxhc3RwYXJ0ID09ICdzcG9uc29yc2hpcCcpIHx8IChsYXN0cGFydCA9PSAnZXhwZXJpZW50aWFsJykgfHwgKGxhc3RwYXJ0ID09ICdpbi1wYXJrLW1lZGlhJylcbiAgICAgICAgICAgIGNvbnNvbGUubG9nICdsYXN0cGFydDogJywgbGFzdHBhcnRcbiAgICAgICAgICAgIHNldFRpbWVvdXQgKC0+XG4gICAgICAgICAgICAgICAgJCgnI1BhcnRuZXJzaGlwVHlwZXMtc2VsZWN0IHVsJykudHJpZ2dlcignY2xpY2snKVxuICAgICAgICAgICAgICAgICQoJyNQYXJ0bmVyc2hpcFR5cGVzLXNlbGVjdCBsaVtkYXRhLWlkPVwiJyArIGxhc3RwYXJ0ICsgJ1wiXScpLnRyaWdnZXIoJ2NsaWNrJylcbiAgICAgICAgICAgICAgICAkKCcjUGFydG5lcnNoaXBUeXBlcy1zZWxlY3QuZHJvcC1jb250YWluZXInKS5jc3MoJ29wYWNpdHknLCAnMScpXG4gICAgICAgICAgICAgICAgJCgnI1BhcnRuZXJzaGlwVHlwZXMtc2VsZWN0IHVsJykucHJlcGVuZCgkKCcjUGFydG5lcnNoaXBUeXBlcy1zZWxlY3QgbGlbZGF0YS1pZD1cIicgKyBsYXN0cGFydCArICdcIl0nKSlcbiAgICAgICAgICAgICksIDUwXG5cbiAgICAgICAgICAgIFxuICAgIHJlc2V0SGVpZ2h0OiAodGFyZ2V0LCBlbHMpID0+XG4gICAgICAgICQoZWxzKS5jc3MoJ3Bvc2l0aW9uJywgJ3JlbGF0aXZlJylcbiAgICAgICAgaCA9ICQoZWxzKS5lcSgwKS5oZWlnaHQoKVxuICAgICAgICAkKGVscykuZWFjaCAoaSwgZWwpIC0+XG4gICAgICAgICAgICBpZiBoIDwgJChlbCkuaGVpZ2h0KCkgdGhlbiBoID0gJChlbCkuaGVpZ2h0KClcblxuICAgICAgICAkKHRhcmdldCkuaGVpZ2h0KGgpXG4gICAgICAgICQoZWxzKS5jc3MoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJylcbiAgICAgICAgXG4gICAgcmVzZXRUaW1lbGluZTogPT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIEBwYXJhbGxheC5wdXNoIGdsb2JhbEFuaW1hdGlvbnMuY2xvdWRzKFwiI3NlY3Rpb24xXCIsIDAgLCAxLCBpZiBAaXNUYWJsZXQgdGhlbiAxIGVsc2UgNSlcblxuXG4gICAgICAgIGlmICFAaXNQaG9uZVxuICAgICAgICAgICAgQHRyaWdnZXJzLnB1c2ggYW5pbWF0aW9ucy50b3BIZWFkbGluZSgpXG4gICAgICAgICAgICBAdHJpZ2dlcnMucHVzaCBhbmltYXRpb25zLnNjcm9sbENpcmNsZSgpXG4gICAgICAgICAgICBAdHJpZ2dlcnMucHVzaCBhbmltYXRpb25zLnNlbGVjdEJveCgpXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXJ0bmVyc2hpcERldGFpbFBhZ2VcblxuXG4iLCJcbmNsb3Vkc09uVXBkYXRlID0gKGVsLCBkdXJhdGlvbikgLT5cbiAgICB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgXG4gICAgVHdlZW5NYXguc2V0IGVsLFxuICAgICAgICB4OiAtMjA1MFxuICAgICAgICBcbiAgICBUd2Vlbk1heC50byBlbCwgZHVyYXRpb24gLCBcbiAgICAgICAgeDogd2luZG93V2lkdGhcbiAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgIGNsb3Vkc09uVXBkYXRlIGVsICwgZHVyYXRpb25cbiAgICAgICAgXG5cblxuc2V0Qm9iaW5nID0gKCRlbCAsIGR1cixkZWxheSkgLT5cbiAgICBcbiAgICBAaXNUYWJsZXQgPSAkKCdodG1sJykuaGFzQ2xhc3MgJ3RhYmxldCdcbiAgICB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgd2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIFxuICAgIGlmIHdpbmRvdy5pbm5lcldpZHRoID4gNzY3ICYmICFAaXNUYWJsZXRcblxuIyAgICAgICAgZCA9ICgod2luZG93LmlubmVyV2lkdGggKyAxNTUwKSAvIHdpbmRvdy5pbm5lcldpZHRoKSAqIDE4MFxuICAgICAgICBkID0gMzAwIC0gKCRlbC5kYXRhKCdjbG91ZCcpLnNwZWVkICogMjUwKVxuICAgICAgICBcbiAgICAgICAgVHdlZW5NYXgudG8gJGVsICwgZHVyICwgXG4gICAgICAgICAgICB4OiB3aWR0aFxuICAgICAgICAgICAgZGVsYXk6ZGVsYXlcbiAgICAgICAgICAgIGVhc2U6TGluZWFyLmVhc2VOb25lXG4gICAgICAgICAgICBvblVwZGF0ZVBhcmFtczogW1wie3NlbGZ9XCJdXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiAodHdlZW4pID0+XG4gICAgICAgICAgICAgICAgY2xvdWRzT25VcGRhdGUgJGVsICwgZFxuXG5cblxuc2V0UmVnaXN0cmF0aW9uID0gKCRlbCwgcmVnaXN0cmF0aW9uKSAtPlxuICAgIFxuICAgIHZhbHVlcyA9IHJlZ2lzdHJhdGlvbi5zcGxpdChcInxcIilcbiAgICBcbiAgICB2aWV3cG9ydFdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICBzZXR0aW5ncyA9IHt9XG4gICAgXG4gICAgYWxpZ24gPSB2YWx1ZXNbMF1cbiAgICBvZmZzZXQgPSBwYXJzZUludCh2YWx1ZXNbMV0pIG9yIDBcblxuICAgIHN3aXRjaCBhbGlnblxuICAgICAgICB3aGVuICdsZWZ0J1xuICAgICAgICAgICAgc2V0dGluZ3MueCA9IDAgKyBvZmZzZXRcbiAgICAgICAgd2hlbiAncmlnaHQnXG4gICAgICAgICAgICBzZXR0aW5ncy54ID0gdmlld3BvcnRXaWR0aCArIG9mZnNldCAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIHdoZW4gJ2NlbnRlcidcbiAgICAgICAgICAgIHNldHRpbmdzLnggPSAodmlld3BvcnRXaWR0aCouNSAtICRlbC53aWR0aCgpKi41KSArIG9mZnNldCAgICBcbiAgICBcbiAgICBUd2Vlbk1heC5zZXQgJGVsICwgc2V0dGluZ3NcbiAgICBcbiAgICBcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gKG9wdGlvbnMpIC0+XG4gICAgXG4gICAgJGVsID0gb3B0aW9ucy4kZWxcbiAgICAkY29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJ1tkYXRhLWNsb3VkLWNvbnRhaW5lcl0nKSAgICBcbiAgICBjb250YWluZXJUb3BQYWRkaW5nID0gcGFyc2VJbnQoJGNvbnRhaW5lci5jc3MoJ3BhZGRpbmctdG9wJykpXG4gICAgXG4gICAgXG4gICAgdHJ5ICAgICAgICBcbiAgICAgICAgY2xvdWREYXRhID0gJGVsLmRhdGEoKS5jbG91ZFxuICAgICAgIFxuICAgIGNhdGNoIGVcbiAgICAgICAgY29uc29sZS5lcnJvciBcIkNsb3VkIERhdGEgUGFyc2UgRXJyb3I6IEludmFsaWQgSlNPTlwiICAgICAgICBcbiAgICAgICAgXG4gICAgY2xvdWREZXB0aCA9ICRlbC5kYXRhKCdkZXB0aCcpXG4gICAgY2xvdWRTcGVlZCA9IGNsb3VkRGF0YS5zcGVlZCBvciAxXG4gICAgY2xvdWRPZmZzZXRNaW4gPSBwYXJzZUludChjbG91ZERhdGEub2Zmc2V0TWluKSBvciAwXG4gICAgY2xvdWRSZXZlcnNlID0gY2xvdWREYXRhLnJldmVyc2Ugb3IgZmFsc2VcbiAgICBjbG91ZFJlZ2lzdHJhdGlvbiA9IGNsb3VkRGF0YS5yZWdpc3RlciBvciBcImNlbnRlclwiXG5cblxuICAgIFxuICAgIHNldFJlZ2lzdHJhdGlvbiAkZWwgLCBjbG91ZFJlZ2lzdHJhdGlvblxuICAgIGlmICEoJGNvbnRhaW5lci5oYXNDbGFzcygnc3BsYXNoLWNvbnRhaW5lcicpKVxuICAgICAgICBvZmZMZWZ0ID0gJGVsLm9mZnNldCgpLmxlZnRcbiAgICAgICAgZGlzdGFuY2UgPSAod2luZG93LmlubmVyV2lkdGggLSBvZmZMZWZ0KSAvIHdpbmRvdy5pbm5lcldpZHRoXG4jICAgICAgICBwZXJjZW50YWdlID0gZGlzdGFuY2UgKiAxODAgXG4gICAgICAgIHBlcmNlbnRhZ2UgPSAyNTAgLSAoY2xvdWRTcGVlZCAqIDIwMClcbiAgICAgICAgXG4gICAgICAgIHNldEJvYmluZyAkZWwsIHBlcmNlbnRhZ2UsIGNsb3VkU3BlZWQvNVxuIFxuICAgIG1pblkgPSAkY29udGFpbmVyLm9mZnNldCgpLnRvcFxuICAgIG1heFkgPSAkKGRvY3VtZW50KS5vdXRlckhlaWdodCgpXG4gICAgdG90YWxSYW5nZT0gJGNvbnRhaW5lci5vdXRlckhlaWdodCgpXG4gICAgXG4gICAgXG4gICAgXG4gICAgcGVyY2VudGFnZVJhbmdlID0gdG90YWxSYW5nZS9tYXhZXG4gICAgbWluUmFuZ2VQZXJjZW50YWdlID0gbWluWS9tYXhZICAgIFxuICAgIG1heFJhbmdlUGVyY2VudGFnZSA9IG1pblJhbmdlUGVyY2VudGFnZSArIHBlcmNlbnRhZ2VSYW5nZVxuXG4jICAgIGNvbnNvbGUubG9nIG1pblJhbmdlUGVyY2VudGFnZSAsIG1heFJhbmdlUGVyY2VudGFnZVxuXG5cbiAgICBsYXN0U2Nyb2xsUGVyY2VudGFnZSA9IHByZXNlbnRTY3JvbGxQZXJjZW50YWdlID0gc2Nyb2xsRGVsdGEgPSAwXG5cbiAgICBpZiAoJGNvbnRhaW5lci5oYXNDbGFzcygnc3BsYXNoLWNvbnRhaW5lcicpICYmICQoJ2h0bWwnKS5oYXNDbGFzcygndGFibGV0JykpXG4gICAgICAgICRjb250YWluZXIuaGlkZSgpXG4gICAgICAgIFxuICAgIFxuICAgIHJldHVybiAocG9zKSAtPlxuICAgICAgICBpZiAoKCRjb250YWluZXIuaGFzQ2xhc3MoJ3NwbGFzaC1jb250YWluZXInKSkgJiYgKCQoJ2h0bWwnKS5oYXNDbGFzcygndGFibGV0JykpKVxuICAgICAgICAgICAgVHdlZW5NYXgudG8gJGVsICwgMC4yNSAsXG4gICAgICAgICAgICAgICAgZWFzZTpTaW5lLmVhc2VPdXRcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZSA9IChwb3MgLSBtaW5SYW5nZVBlcmNlbnRhZ2UpIC8gKG1heFJhbmdlUGVyY2VudGFnZSAtIG1pblJhbmdlUGVyY2VudGFnZSlcbiAgICAgICAgICAgIGlmIDAgPD0gY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2UgPD0gMVxuICAgICAgICAgICAgICAgIHByZXNlbnRTY3JvbGxQZXJjZW50YWdlID0gY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2VcbiAgICAgICAgICAgICAgICBpZiBjbG91ZFJldmVyc2UgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2UgPSAxIC0gY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjbG91ZFkgPSAodG90YWxSYW5nZSAqIGNsb3VkUG9zaXRpb25QZXJjZW50YWdlKSAqIGNsb3VkU3BlZWRcbiAgICAgICAgICAgICAgICBjbG91ZFkgPSBjbG91ZFkgLSBjb250YWluZXJUb3BQYWRkaW5nXG4gICAgICAgICAgICAgICAgY2xvdWRZID0gY2xvdWRZICsgY2xvdWRPZmZzZXRNaW5cbiAgICBcbiAgICAgICAgICAgICAgICAjTWF5YmUgdXNlIHRoaXM/XG4gICAgICAgICAgICAgICAgc2Nyb2xsRGVsdGEgPSBNYXRoLmFicyhsYXN0U2Nyb2xsUGVyY2VudGFnZSAtIHByZXNlbnRTY3JvbGxQZXJjZW50YWdlKSAqIDNcbiAgICBcbiAgICAgICAgICAgICAgICBsYXN0U2Nyb2xsUGVyY2VudGFnZSA9IHByZXNlbnRTY3JvbGxQZXJjZW50YWdlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvICRlbCAsIDAuMjUgLCBcbiAgICAgICAgICAgICAgICAgICAgeTpjbG91ZFlcbiAgICAgICAgICAgICAgICAgICAgZWFzZTpTaW5lLmVhc2VPdXRcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICBcbiIsIlxuXG4jQ291bnRcbmNvbW1hcyA9ICh4KSAtPlxuICB4LnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpXG5cblxubW9kdWxlLmV4cG9ydHMuY291bnQgPSAoZWwpIC0+XG4gICAgXG4gICAgXG4gICAgJGVsID0gJChlbClcbiAgICB0YXJnZXRWYWwgPSAkKGVsKS5odG1sKClcbiAgICBudW0gPSAkKGVsKS50ZXh0KCkuc3BsaXQoJywnKS5qb2luKCcnKVxuXG4gICAgc3RhcnQgPSBudW0gKiAuOTk5NVxuICAgIGNoYW5nZSA9IG51bSAqIC4wMDA1XG4gICAgXG4gICAgdGwgPSBuZXcgVGltZWxpbmVNYXhcbiAgICAgICAgb25TdGFydDogLT5cbiAgICAgICAgICAgICRlbC5odG1sKFwiNDJcIilcbiAgICAgICAgb25Db21wbGV0ZTogLT5cbiAgICAgICAgICAgICRlbC5odG1sKHRhcmdldFZhbClcbiAgICAgICAgICAgIFxuICAgIHR3ZWVucyA9IFtdXG5cbiAgICAgICAgXG5cbiAgICB0d2VlbnMucHVzaCBUd2Vlbk1heC5mcm9tVG8gJGVsICwgMC4yNSwgICAgICAgIFxuICAgICAgICBhdXRvQWxwaGE6MFxuICAgICAgICBpbW1lZGlhdGVSZW5kZXI6dHJ1ZVxuICAgICAgICBlYXNlOlF1aW50LmVhc2VPdXRcbiAgICAsXG4gICAgICAgIGF1dG9BbHBoYToxXG5cbiAgICB0d2VlbnMucHVzaCBUd2Vlbk1heC50byAkZWwgLCAxLjUsIFxuICAgICAgICBlYXNlOlF1aW50LmVhc2VPdXRcbiAgICAgICAgXG4gICAgICAgIG9uVXBkYXRlOiAtPlxuICAgICAgICAgICAgdmFsdWUgPSBwYXJzZUludChzdGFydCArIHBhcnNlSW50KGNoYW5nZSAqIEBwcm9ncmVzcygpKSlcbiAgICAgICAgICAgIHZhbHVlID0gY29tbWFzKHZhbHVlKVxuICAgICAgICAgICAgZWxzID0gdmFsdWUuc3BsaXQoJycpXG4gICAgICAgICAgICBodG1sID0gJydcbiAgICAgICAgICAgICQuZWFjaCBlbHMsIChuYW1lLCB2YWx1ZSkgLT5cbiAgICAgICAgICAgICAgICBodG1sICs9IGlmICh2YWx1ZSBpcyAnLCcpIHRoZW4gJywnIGVsc2UgJzxzcGFuPicgKyB2YWx1ZSArICc8L3NwYW4+J1xuICAgICAgICAgICAgJGVsLmh0bWwoaHRtbClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgdGwuYWRkIHR3ZWVuc1xuICAgIFxuICAgIHRsXG5cbiNTY3JvbGxpbmdcblxuXG5cbnR3ZWVuUGFyYWxsYXggPSAocG9zLHR3ZWVuLG1pbixtYXgsZHVyKSAtPlxuXG5cblxuICAgIHBlcmNlbnQgPSAoKHBvcy1taW4pIC8gKG1heC1taW4pKSAqIDFcbiAgICBhbW91bnQgPSBwZXJjZW50ICogZHVyXG5cblxuXG4gICAgaWYgcG9zIDw9IG1heCBhbmQgcG9zID49IG1pblxuICAgICAgICAjY29uc29sZS5sb2cgcGVyY2VudCAsIHR3ZWVuLm5zLm5hbWUgLCBwb3NcbiAgICAgICAgaWYgTWF0aC5hYnMoYW1vdW50IC0gdHdlZW4udGltZSgpKSA+PSAuMDAxXG4gICAgICAgICAgICB0d2Vlbi50d2VlblRvICBhbW91bnQgLFxuICAgICAgICAgICAgICAgIG92ZXJ3cml0ZTpcInByZWV4aXN0aW5nXCIsXG4gICAgICAgICAgICAgICAgZWFzZTpRdWFkLmVhc2VPdXRcblxuXG5tb2R1bGUuZXhwb3J0cy5jbG91ZHMgPSAoc2V0SWQsIG1pbiwgbWF4LCBkdXIpIC0+XG5cbiAgICBtaW5Qb3MgPSBtaW5cbiAgICBtYXhQb3MgPSBtYXhcbiAgICBkdXJhdGlvbiA9IGR1clxuXG4gICAgJGVsID0gJChcIi5jbG91ZHMje3NldElkfVwiKVxuICAgIGNsb3VkcyA9ICRlbC5maW5kKFwiLmNsb3VkXCIpXG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuICAgIHR3ZWVuLm5zID0ge31cbiAgICB0d2Vlbi5ucy5uYW1lID0gc2V0SWRcblxuICAgIHR3ZWVucyA9IFtdXG4gICAgZm9yIGNsb3VkLGkgaW4gY2xvdWRzXG4gICAgICAgIG9mZnNldCA9IFwiKz0jezI1MCooaSsxKX1cIlxuXG5cbiAgICAgICAgdHdlZW5zLnB1c2ggVHdlZW5NYXgudG8gY2xvdWQgLCBkdXJhdGlvbiAsXG4gICAgICAgICAgICB5Om9mZnNldFxuXG5cblxuICAgIHR3ZWVuLmFkZCB0d2VlbnNcblxuXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICByZXR1cm4gKHBvcykgLT5cbiAgICAgICAgdHdlZW5QYXJhbGxheCBwb3MgLCB0d2VlbiAsIG1pblBvcywgbWF4UG9zLCBkdXJhdGlvblxuXG5tb2R1bGUuZXhwb3J0cy5zY3JvbGwgPSAobWluUG9zLCBtYXhQb3MsIGR1cmF0aW9uLCBlbGVtKSAtPlxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcbiAgICB0d2Vlbi5ucyA9IHt9XG4gICAgdHdlZW4ubnMubmFtZSA9IFwiLnNjcm9sbHRvXCJcbiAgICBcbiAgICB0d2VlbnMgPSBbXVxuICAgIHR3ZWVucy5wdXNoIFR3ZWVuTWF4LnRvIGVsZW0gLCBkdXJhdGlvbiAsIG9wYWNpdHk6MFxuICAgIFxuICAgIHR3ZWVuLmFkZCB0d2VlbnNcbiAgICBcbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICByZXR1cm4gKHBvcykgLT5cbiAgICAgICAgdHdlZW5QYXJhbGxheCBwb3MgLCB0d2VlbiAsIG1pblBvcywgbWF4UG9zLCBkdXJhdGlvblxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzLmFybXMgPSAobWluLCBtYXgsIGR1cikgLT5cblxuICAgIG1pblBvcyA9IG1pblxuICAgIG1heFBvcyA9IG1heFxuICAgIGR1cmF0aW9uID0gZHVyXG5cbiAgICBhcm0gPSAkKFwiLmFybXNcIilcblxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgdHdlZW4ubnMgPSB7fVxuICAgIHR3ZWVuLm5zLm5hbWUgPSBcIi5hcm1zXCJcblxuICAgIHR3ZWVucyA9IFtdXG4gICAgdHdlZW5zLnB1c2ggVHdlZW5NYXgudG8gYXJtICwgZHVyYXRpb24gLCB0b3A6MFxuXG5cblxuICAgIHR3ZWVuLmFkZCB0d2VlbnNcblxuXG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICByZXR1cm4gKHBvcykgLT5cbiAgICAgICAgdHdlZW5QYXJhbGxheCBwb3MgLCB0d2VlbiAsIG1pblBvcywgbWF4UG9zLCBkdXJhdGlvblxuIiwiZ2xvYmFsID0gcmVxdWlyZSAnLi9nbG9iYWwuY29mZmVlJ1xuXG5cbm1vZHVsZS5leHBvcnRzLnRvcEhlYWRsaW5lID0gKCkgLT5cblxuICAgICRlbCA9ICQoJyNwYXJ0bmVyc2hpcC1kZXRhaWxzJylcblxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG5cbiAgICB0d2Vlbi5hZGQgVHdlZW5NYXguZnJvbVRvKCRlbC5maW5kKCcudG9wLWhlYWRsaW5lIC50aXRsZS1idWNrZXQgaDEnKSwgLjM1LFxuICAgICAgICB5OiAtMTBcbiAgICAgICAgLGFscGhhOiAwXG4gICAgLFxuICAgICAgICB5OiAwXG4gICAgICAgICxhbHBoYTogMVxuICAgICksIDAuNVxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZCgnLnRvcC1oZWFkbGluZSAudGl0bGUtYnVja2V0IGgyJyksIC4zNSxcbiAgICAgICAgeTogLTEwXG4gICAgICAgICxhbHBoYTogMFxuICAgICxcbiAgICAgICAgeTogMFxuICAgICAgICAsYWxwaGE6IDFcbiAgICApLCBcIi09LjNcIlxuXG4gICAgYTogdHdlZW5cbiAgICBvZmZzZXQ6JGVsLm9mZnNldCgpLnRvcFxuXG5cbm1vZHVsZS5leHBvcnRzLnNjcm9sbENpcmNsZSA9IC0+XG4gICAgJGVsID0gJChcIiNwYXJ0bmVyc2hpcC1kZXRhaWxzIC5jaXJjLWJ0bi13cmFwcGVyXCIpXG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuXG4gICAgdHdlZW4uYWRkIFR3ZWVuTWF4LmZyb21UbygkZWwuZmluZChcInBcIikgLCAuMyAsXG4gICAgICAgIGF1dG9BbHBoYTowXG4gICAgLFxuICAgICAgICBhdXRvQWxwaGE6MVxuICAgIClcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLmZpbmQoXCJhXCIpICwgLjQ1ICxcbiAgICAgICAgc2NhbGU6MFxuICAgICAgICByb3RhdGlvbjoxODBcbiAgICAgICAgaW1tZWRpYXRlUmVuZGVyOnRydWVcbiAgICAsXG4gICAgICAgIHNjYWxlOjFcbiAgICAgICAgcm90YXRpb246MFxuICAgICAgICBlYXNlOkJhY2suZWFzZU91dFxuICAgICkgLCBcIi09LjJcIlxuXG4gICAgYTogdHdlZW5cbiAgICBvZmZzZXQ6JGVsLm9mZnNldCgpLnRvcFxuXG5cbm1vZHVsZS5leHBvcnRzLnNlbGVjdEJveCA9ICgpIC0+XG4gICAgJGVsID0gJCgnI3BhcnRuZXJzaGlwLWRldGFpbHMgI3NlbGVjdC1zcG9uc29yc2hpcHMnKVxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLCAuMzUsXG4gICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgLHNjYWxlOiAuNzVcbiAgICAsXG4gICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgLHNjYWxlOiAxXG4gICAgKSwgMC41XG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICBhOnR3ZWVuXG4gICAgb2Zmc2V0OiRlbC5vZmZzZXQoKS50b3BcbiIsIlBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblxuY2xhc3MgQmFzaWNPdmVybGF5IGV4dGVuZHMgUGx1Z2luQmFzZVxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgc3VwZXIob3B0cylcblxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgICMgQCRlbCA9ICQoZWwpXG4gICAgICAgIEBvdmVybGF5VHJpZ2dlcnMgPSAkKCcub3ZlcmxheS10cmlnZ2VyJylcbiAgICAgICAgQGFkZEV2ZW50cygpXG5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgXG4gICAgYWRkRXZlbnRzOiAtPlxuXG4gICAgICAgICQoJyNiYXNpYy1vdmVybGF5LCAjb3ZlcmxheS1iYXNpYy1pbm5lciAub3ZlcmxheS1jbG9zZScpLmNsaWNrKEBjbG9zZU92ZXJsYXkpO1xuICAgICAgICBAb3ZlcmxheVRyaWdnZXJzLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgICQodCkub24gJ2NsaWNrJywgQG9wZW5PdmVybGF5XG5cbiAgICAgICAgI2dsb2JhbCBidXkgdGlja2V0cyBsaW5rc1xuXG4gICAgICAgICQoJy5vdmVybGF5LWNvbnRlbnQnKS5vbiAnY2xpY2snLCAnbGknICxAb3BlbkxpbmtcbiMgICAgICAgICQod2luZG93KS5vbiAncmVzaXplJywgQGNsb3NlT3ZlcmxheVxuICAgICAgICBcbiAgICBvcGVuTGluazogKGUpID0+XG4gICAgICAgIHRhcmdldCA9ICQoZS50YXJnZXQpLnBhcmVudHMgJy5wYXJrJ1xuICAgICAgICBpZiB0YXJnZXQuZGF0YSgndGFyZ2V0JylcbiAgICAgICAgICAgIHdpbmRvdy5vcGVuKHRhcmdldC5kYXRhKCd0YXJnZXQnKSlcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIFxuICAgIGNsb3NlT3ZlcmxheTogKGUpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAhICgoZS50eXBlIGlzICdyZXNpemUnKSBhbmQgKCQoJyNvdmVybGF5IHZpZGVvOnZpc2libGUnKS5zaXplKCkgPiAwKSlcbiAgICAgICAgICAgICQoJy5vdmVybGF5LWJhc2ljJykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAgICAgfSwgKCkgLT4gXG4gICAgICAgICAgICAgICAgJCgnLm92ZXJsYXktYmFzaWMnKS5oaWRlKClcbiAgICAgICAgICAgICAgICAkKCcjb3ZlcmxheScpLmhpZGUoKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgb3Blbk92ZXJsYXk6ICh0KSAtPlxuICAgICAgICAkZWwgPSAkKHRoaXMpXG4gICAgICAgIG92ZXJsYXlTb3VyY2UgPSAkZWwuZGF0YSgnc291cmNlJylcbiAgICAgICAgJHRhcmdldEVsZW1lbnQgPSAkKCcjb3ZlcmxheS1iYXNpYy1pbm5lciAub3ZlcmxheS1jb250ZW50JylcbiAgICAgICAgaXNOZXdzID0gJGVsLmhhc0NsYXNzKCduZXdzJylcblxuICAgICAgICAkKCcjb3ZlcmxheScpLnNob3coKVxuICAgICAgICBcbiAgICAgICAgaWYgJGVsLmhhc0NsYXNzICdvZmZlcmluZ3Mtb3B0aW9uJ1xuICAgICAgICAgICAgb2MgPSAkKCcjb2ZmZXJpbmdzLW92ZXJsYXktY29udGVudCcpXG4gICAgICAgICAgICBvYy5maW5kKCdoMS50aXRsZScpLnRleHQoJGVsLmZpbmQoJ3NwYW4ub2ZmZXInKS50ZXh0KCkpXG4gICAgICAgICAgICBvYy5maW5kKCdkaXYuZGVzY3JpcHRpb24nKS5odG1sKCRlbC5maW5kKCdkaXYuZGVzY3JpcHRpb24nKS5odG1sKCkpXG4gICAgICAgICAgICBvYy5maW5kKCcuY29udGVudC5tZWRpYScpLmNzcyh7YmFja2dyb3VuZEltYWdlOiBcInVybCgnXCIgKyAkZWwuZmluZCgnc3Bhbi5tZWRpYScpLmRhdGEoJ3NvdXJjZScpICsgXCInKVwifSlcblxuICAgICAgICBcbiAgICAgICAgaWYgKCQoJyMnICsgb3ZlcmxheVNvdXJjZSkuc2l6ZSgpIGlzIDEpIFxuICAgICAgICAgICAgI2h0bWwgPSAkKCcjJyArIG92ZXJsYXlTb3VyY2UpLmh0bWwoKVxuXG4gICAgICAgICAgICAkdGFyZ2V0RWxlbWVudC5jaGlsZHJlbigpLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgICAgICAkKHQpLmFwcGVuZFRvKCcjb3ZlcmxheS1jb250ZW50LXNvdXJjZXMnKVxuXG4gICAgICAgICAgICBpZiBpc05ld3NcbiAgICAgICAgICAgICAgICBjID0gJGVsLm5leHQoJy5hcnRpY2xlJykuY2xvbmUoKVxuICAgICAgICAgICAgICAgICQoJyNvdmVybGF5X2NvbnRlbnQnKS5odG1sKGMuaHRtbCgpKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJCgnIycgKyBvdmVybGF5U291cmNlKS5hcHBlbmRUbygkdGFyZ2V0RWxlbWVudClcblxuICAgICAgICAgICAgJGVsID0gJCgnI292ZXJsYXktYmFzaWMtaW5uZXInKVxuICAgICAgICAgICAgaXNTbWFsbCA9ICRlbC5oZWlnaHQoKSA8ICQod2luZG93KS5oZWlnaHQoKSBhbmQgJCgkdGFyZ2V0RWxlbWVudCkuZmluZCgnLnNlbGVjdC1ib3gtd3JhcHBlcicpLnNpemUoKSBpcyAwXG4gICAgICAgICAgICBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKClcbiAgICAgICAgICAgIGFkZHRvcCA9IGlmIGlzU21hbGwgdGhlbiAwIGVsc2Ugc2Nyb2xsVG9wO1xuICAgICAgICAgICAgcG9zaXRpb24gPSAkZWwuY3NzICdwb3NpdGlvbicsIGlmIGlzU21hbGwgdGhlbiAnZml4ZWQnIGVsc2UgJ2Fic29sdXRlJ1xuICAgICAgICAgICAgdG9wID0gTWF0aC5tYXgoMCwgKCgkKHdpbmRvdykuaGVpZ2h0KCkgLSAkZWwub3V0ZXJIZWlnaHQoKSkgLyAyKSArIGFkZHRvcClcbiAgICAgICAgICAgIGlmICFpc1NtYWxsIGFuZCAodG9wIDwgc2Nyb2xsVG9wKSB0aGVuIHRvcCA9IHNjcm9sbFRvcFxuICAgICAgICAgICAgJGVsLmNzcyhcInRvcFwiLCB0b3AgKyBcInB4XCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIGhlaWdodDpcbiAgICAgICAgICAgICMkZWwuY3NzKFwibGVmdFwiLCBNYXRoLm1heCgwLCAoKCQod2luZG93KS53aWR0aCgpIC0gJGVsLm91dGVyV2lkdGgoKSkgLyAyKSArIGFkZGxlZnQpICsgXCJweFwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJCgnLm92ZXJsYXktYmFzaWMnKS5jc3MoJ29wYWNpdHknLCAwKS5kZWxheSgwKS5zaG93KCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgICAgfSlcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljT3ZlcmxheVxuXG5cblxuXG5cblxuIiwiXG5QbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5WaWV3QmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1ZpZXdCYXNlLmNvZmZlZSdcblxuY2xhc3MgRHJhZ2dhYmxlR2FsbGVyeSBleHRlbmRzIFBsdWdpbkJhc2VcblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgc3VwZXIob3B0cylcblxuXG4gICAgaW5pdGlhbGl6ZTogKG9wdHMpIC0+XG5cbiAgICAgICAgQGdhbGxlcnkgPSBAJGVsLmZpbmQgXCIuc3dpcGVyLWNvbnRhaW5lclwiXG5cbiAgICAgICAgaWYoQGdhbGxlcnkubGVuZ3RoIDwgMSlcbiAgICAgICAgICAgIEBnYWxsZXJ5ID0gQCRlbC5maWx0ZXIgXCIuc3dpcGVyLWNvbnRhaW5lclwiXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgb3B0cy5wYWdlID09ICdqb2JzJ1xuICAgICAgICAgICAgQGpvYnNQYWdlID0gdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAam9ic1BhZ2UgPSBmYWxzZVxuXG4gICAgICAgIEBnYWxsZXJ5Q3JlYXRlZCA9IGZhbHNlXG4gICAgICAgIEBnYWxsZXJ5Q29udGFpbmVyID0gQGdhbGxlcnkuZmluZCgndWwnKVxuICAgICAgICBAZ2FsbGVyeUl0ZW1zID0gQGdhbGxlcnlDb250YWluZXIuZmluZCgnbGknKVxuICAgICAgICBAY3VycmVudEluZGV4ID0gQGdhbGxlcnlJdGVtcy5maWx0ZXIoJy5zZWxlY3RlZCcpLmRhdGEoJ2luZGV4JylcbiAgICAgICAgQGFjcm9zcyA9IG9wdHMuYWNyb3NzIG9yIDFcbiAgICAgICAgQGFuZ2xlTGVmdCA9IEBnYWxsZXJ5LmZpbmQgJy5mYS1hbmdsZS1sZWZ0J1xuICAgICAgICBAYW5nbGVSaWdodCA9IEBnYWxsZXJ5LmZpbmQgJy5mYS1hbmdsZS1yaWdodCdcbiAgICAgICAgQHBhZ2luYXRpb24gPSBvcHRzLnBhZ2luYXRpb24gb3IgZmFsc2VcbiAgICAgICAgQGNvbnRyb2xzID0gb3B0cy5jb250cm9sIG9yIG51bGxcbiAgICAgICAgQGpvYnNDYXJvdXNlbFN0b3BwZWQgPSBmYWxzZVxuICAgICAgICBAam9ic0Nhcm91c2VsUGF1c2VkID0gZmFsc2VcbiAgICAgICAgQGpvYnNJbnRlcnZhbCA9IG51bGxcblxuICAgICAgICBAc2l6ZUNvbnRhaW5lcigpXG5cbiAgICAgICAgQGFkZEFycm93cygpXG5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgYWRkRXZlbnRzOiAtPlxuICAgICAgICAkKHdpbmRvdykub24gJ3Jlc2l6ZScgLCBAc2l6ZUNvbnRhaW5lclxuXG4gICAgICAgICQoQCRlbCkub24gJ2NsaWNrJywgJy5mYS1hbmdsZS1sZWZ0JywgQHByZXZTbGlkZVxuICAgICAgICAkKEAkZWwpLm9uICdjbGljaycsICcuZmEtYW5nbGUtcmlnaHQnLCBAbmV4dFNsaWRlXG4gICAgICAgIGlmIEBqb2JzUGFnZSA9PSB0cnVlXG4gICAgICAgICAgICAkKEAkZWwpLm9uICdjbGljaycsICcuc3dpcGVyLWNvbnRhaW5lcicsIEBzdG9wSm9ic0Nhcm91c2VsXG4gICAgICAgICAgICAkKEAkZWwpLm9uICdtb3VzZW92ZXInLCAnLnN3aXBlci1jb250YWluZXInLCBAcGF1c2VKb2JzQ2Fyb3VzZWxcbiAgICAgICAgICAgICQoQCRlbCkub24gJ21vdXNlbGVhdmUnLCAnLnN3aXBlci1jb250YWluZXInLCBAcmVzdW1lSm9ic0Nhcm91c2VsXG4gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgc3RvcEpvYnNDYXJvdXNlbDogPT5cbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGpvYnNJbnRlcnZhbClcbiAgICAgICAgQGpvYnNDYXJvdXNlbFN0b3BwZWQgPSB0cnVlXG5cbiAgICBwYXVzZUpvYnNDYXJvdXNlbDogPT5cbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGpvYnNJbnRlcnZhbClcbiAgICAgICAgQGpvYnNDYXJvdXNlbFBhdXNlZCA9IHRydWVcblxuICAgIHJlc3VtZUpvYnNDYXJvdXNlbDogPT5cbiAgICAgICAgaWYgQGpvYnNDYXJvdXNlbFN0b3BwZWQgPT0gZmFsc2VcbiAgICAgICAgICAgIEBqb2JzSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCAoLT5cbiAgICAgICAgICAgICAgICAkKCcjam9icy1nYWxsZXJ5IC5mYS1hbmdsZS1yaWdodCcpLnRyaWdnZXIoJ2NsaWNrJylcbiAgICAgICAgICAgICksIDgwMDBcbiAgICAgICAgICAgIEBqb2JzQ2Fyb3VzZWxQYXVzZWQgPSBmYWxzZVxuXG4gICAgcHJldlNsaWRlOiAoZSkgPT5cbiAgICAgICAgdGhhdCA9IEBteVN3aXBlclxuICAgICAgICBnYWwgPSBAZ2FsbGVyeVxuICAgICAgICBcbiAgICAgICAgVHdlZW5NYXgudG8oJChnYWwpLCAuMiwgXG4gICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICBzY2FsZTogMS4xXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgICAgIHRoYXQuc3dpcGVQcmV2KClcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC5zZXQoJChnYWwpLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogMVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC50bygkKGdhbCksIC4zNSwgXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgICAgICAgICAgICAgZGVsYXk6IC4zNVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgIFxuICAgIG5leHRTbGlkZTogKGUpID0+XG4gICAgICAgIHRoYXQgPSBAbXlTd2lwZXJcbiAgICAgICAgZ2FsID0gQGdhbGxlcnlcblxuICAgICAgICBUd2Vlbk1heC50bygkKGdhbCksIC4yLFxuICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAgICAgc2NhbGU6IDEuMVxuICAgICAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgICAgICB0aGF0LnN3aXBlTmV4dCgpXG4gICAgICAgICAgICAgICAgVHdlZW5NYXguc2V0KCQoZ2FsKSxcbiAgICAgICAgICAgICAgICAgICAgc2NhbGU6IDAuODVcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgVHdlZW5NYXgudG8oJChnYWwpLCAuMzUsXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgICAgICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgICAgICAgICAgICAgZGVsYXk6IC4zNVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgKVxuXG5cbiAgICBhZGRBcnJvd3M6IC0+XG4gICAgICAgIEBpc1Bob25lID0gJChcImh0bWxcIikuaGFzQ2xhc3MoXCJwaG9uZVwiKVxuXG4gICAgICAgIGFycm93TGVmdCA9ICQoXCI8aSBjbGFzcz0nZ2FsLWFycm93IGZhIGZhLWFuZ2xlLWxlZnQnPjwvaT5cIilcbiAgICAgICAgYXJyb3dSaWdodCA9ICQoXCI8aSBjbGFzcz0nZ2FsLWFycm93IGZhIGZhLWFuZ2xlLXJpZ2h0Jz48L2k+XCIpXG5cbiAgICAgICAgQCRlbC5hcHBlbmQoYXJyb3dMZWZ0LCBhcnJvd1JpZ2h0KVxuXG4gICAgICAgICQoJy5nYWwtYXJyb3cnKS5vbiAnY2xpY2snLCAtPlxuICAgICAgICAgICAgJChAKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgdGhhdCA9ICQoQClcbiAgICAgICAgICAgIHNldFRpbWVvdXQgLT5cbiAgICAgICAgICAgICAgICAkKHRoYXQpLnJlbW92ZUNsYXNzICdhY3RpdmUnLCAxMDBcbiAgICAgICAgICAgIFxuXG4gICAgc2l6ZUNvbnRhaW5lcjogKCkgPT5cbiAgICAgICAgQGdhbGxlcnlDb250YWluZXIuY3NzKCd3aWR0aCcsIFwiMTAwJVwiKVxuICAgICAgICBpZiBAYWNyb3NzIDwgMlxuICAgICAgICAgICAgQGdhbGxlcnlJdGVtcy5jc3MoJ3dpZHRoJyAsIFwiMTAwJVwiKVxuICAgICAgICBlbHNlIGlmIEBhY3Jvc3MgPCAzXG4gICAgICAgICAgICBAZ2FsbGVyeUl0ZW1zLmNzcygnd2lkdGgnICwgXCI1MCVcIilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGdhbGxlcnlJdGVtcy5jc3MoJ3dpZHRoJyAsIFwiMzMuMzMzMzMzJVwiKVxuXG4gICAgICAgIEBpdGVtV2lkdGggPSBAZ2FsbGVyeUl0ZW1zLmZpcnN0KCkub3V0ZXJXaWR0aCgpXG4gICAgICAgIGl0ZW1MZW5ndGggPSBAZ2FsbGVyeUl0ZW1zLmxlbmd0aFxuXG4gICAgICAgIEBnYWxsZXJ5SXRlbXMuY3NzKCd3aWR0aCcsIEBpdGVtV2lkdGgpXG4gICAgICAgIEBnYWxsZXJ5Q29udGFpbmVyLmNzcygnd2lkdGgnLCBpdGVtTGVuZ3RoICogKEBpdGVtV2lkdGgpKVxuICAgICAgICBUd2Vlbk1heC5zZXQgQGdhbGxlcnlDb250YWluZXIgLFxuICAgICAgICAgICAgeDogLUBjdXJyZW50SW5kZXggKiBAaXRlbVdpZHRoXG4gICAgICAgIFxuICAgICAgICBpZiAhQGdhbGxlcnlDcmVhdGVkICAgIFxuICAgICAgICAgICAgQGNyZWF0ZURyYWdnYWJsZSgpXG4jICAgICAgICAgICAgQG15U3dpcGVyLnN3aXBlTmV4dCgpXG4gICAgICAgIFxuICAgIGNyZWF0ZURyYWdnYWJsZTogKCkgLT5cbiAgICAgICAgaXRlbUxlbmd0aCA9IEBnYWxsZXJ5SXRlbXMubGVuZ3RoXG5cbiAgICAgICAgaWYgQHNjcm9sbCB0aGVuIEBzY3JvbGwua2lsbCgpXG5cbiAgICAgICAgaWQgPSAkKEAuJGVsKS5hdHRyICdpZCdcblxuXG4gICAgICAgIGlmIEBwYWdpbmF0aW9uXG4gICAgICAgICAgICBAYWRkUGFnaW5hdGlvbigpXG5cbiAgICAgICAgaWYgQGFjcm9zcyA8IDNcbiAgICAgICAgICAgIGlmIEBwYWdpbmF0aW9uXG4gICAgICAgICAgICAgICAgQG15U3dpcGVyID0gbmV3IFN3aXBlcignIycgKyBpZCArICcgLnN3aXBlci1jb250YWluZXInLHtcbiAgICAgICAgICAgICAgICAgICAgbG9vcDp0cnVlLFxuICAgICAgICAgICAgICAgICAgICBncmFiQ3Vyc29yOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiBAYWNyb3NzLFxuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uOiAnIycgKyBpZCArICcgLnN3aXBlci1wYWdpbmF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvbkFzUmFuZ2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG9uVG91Y2hTdGFydDogQG9uU2xpZGVDaGFuZ2VTdGFydCxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaEVuZDogQG9uU2xpZGVDaGFuZ2VFbmQsXG4gICAgICAgICAgICAgICAgICAgIG9uU2xpZGVDaGFuZ2VTdGFydDogQG9uU2xpZGVDaGFuZ2VTdGFydCxcbiAgICAgICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZUVuZDogQG9uU2xpZGVDaGFuZ2VFbmQsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1Blckdyb3VwOiBAYWNyb3NzXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcjJyArIGlkICsgJyAuc3dpcGVyLWNvbnRhaW5lcicse1xuICAgICAgICAgICAgICAgICAgICBsb29wOnRydWUsXG4gICAgICAgICAgICAgICAgICAgIGdyYWJDdXJzb3I6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IEBhY3Jvc3MsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1Blckdyb3VwOiBAYWNyb3NzXG4gICAgICAgICAgICAgICAgICAgIG9uVG91Y2hTdGFydDogQG9uU2xpZGVDaGFuZ2VTdGFydCxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaEVuZDogQG9uU2xpZGVDaGFuZ2VFbmQsXG4gICAgICAgICAgICAgICAgICAgIG9uU2xpZGVDaGFuZ2VTdGFydDogQG9uU2xpZGVDaGFuZ2VTdGFydCxcbiAgICAgICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZUVuZDogQG9uU2xpZGVDaGFuZ2VFbmQsXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcjJyArIGlkICsgJyAuc3dpcGVyLWNvbnRhaW5lcicse1xuICAgICAgICAgICAgICAgIGxvb3A6dHJ1ZSxcbiAgICAgICAgICAgICAgICBncmFiQ3Vyc29yOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDMsXG4gICAgICAgICAgICAgICAgc2xpZGVzUGVyR3JvdXA6IDNcbiAgICAgICAgICAgICAgICBvblRvdWNoU3RhcnQ6IEBvblNsaWRlQ2hhbmdlU3RhcnQsXG4gICAgICAgICAgICAgICAgb25Ub3VjaEVuZDogQG9uU2xpZGVDaGFuZ2VFbmQsXG4gICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZVN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgIG9uU2xpZGVDaGFuZ2VFbmQ6IEBvblNsaWRlQ2hhbmdlRW5kLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFxuICAgICAgICBAZ2FsbGVyeUNyZWF0ZWQgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICBpZiBAam9ic1BhZ2UgPT0gdHJ1ZVxuICAgICAgICAgICAgQGpvYnNJbnRlcnZhbCA9IHNldEludGVydmFsICgtPlxuICAgICAgICAgICAgICAgICQoJyNqb2JzLWdhbGxlcnkgLmZhLWFuZ2xlLXJpZ2h0JykudHJpZ2dlcignY2xpY2snKVxuICAgICAgICAgICAgKSwgODAwMFxuXG4gICAgICAgIFxuICAgIG9uU2xpZGVDaGFuZ2VTdGFydDogPT5cbiAgICAgICAgJChALiRlbCkuY2xvc2VzdCgnLmFkZC1ib3JkZXItZmFkZScpLmFkZENsYXNzICdzaG93aW5nJ1xuICAgICAgICAkKEAuJGVsKS5maW5kKCcuYWRkLWJvcmRlci1mYWRlJykuYWRkQ2xhc3MgJ3Nob3dpbmcnXG5cbiAgICBvblNsaWRlQ2hhbmdlRW5kOiA9PlxuICAgICAgICAkKEAuJGVsKS5jbG9zZXN0KCcuYWRkLWJvcmRlci1mYWRlJykucmVtb3ZlQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICQoQC4kZWwpLmZpbmQoJy5hZGQtYm9yZGVyLWZhZGUnKS5yZW1vdmVDbGFzcyAnc2hvd2luZydcbiAgICAgICAgXG4gICAgICAgIGlmICEoQGNvbnRyb2xzID09IG51bGwpXG4gICAgICAgICAgICBwYXJrID0gQG15U3dpcGVyLmFjdGl2ZVNsaWRlKCkuZGF0YSgnaWQnKVxuICAgICAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXInKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLmNhcm91c2VsLXdyYXBwZXInKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgZGl2IycgKyBwYXJrKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgZGl2IycgKyBwYXJrKS5wYXJlbnQoKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIChAcGFya0xpc3QpXG4gICAgICAgICAgICBAcGFya0xpc3Quc2VsZWN0TG9nbyAkKEAuJGVsKS5maW5kKCcuc3dpcGVyLXNsaWRlLWFjdGl2ZScpLmRhdGEoJ2lkJyk7XG5cbiAgICBhZGRQYWdpbmF0aW9uOiA9PlxuICAgICAgICB3cmFwcGVyID0gJChcIjxkaXYgY2xhc3M9J3N3aXBlci1wYWdpbmF0aW9uJz48L2Rpdj5cIilcbiAgICAgICAgJChALiRlbCkuZmluZCgnLnN3aXBlci1jb250YWluZXInKS5hZGRDbGFzcygnYWRkUGFnaW5hdGlvbicpLmFwcGVuZCh3cmFwcGVyKVxuXG5cbiAgICBnb3RvOiAoaWQsIGluaXRWYWwpIC0+XG5cbiAgICAgICAgaWYgbm90IGluaXRWYWwgdGhlbiAkKCdib2R5JykuYW5pbWF0ZSB7IHNjcm9sbFRvcDogJCgnIycgKyAoJChAJGVsKS5hdHRyKCdpZCcpKSkub2Zmc2V0KCkudG9wIH1cblxuICAgICAgICB0b0luZGV4ID0gJChcImxpLnBhcmtbZGF0YS1pZD0nI3tpZH0nXVwiKS5kYXRhKCdpbmRleCcpXG5cbiAgICAgICAgdGwgPSBuZXcgVGltZWxpbmVNYXhcblxuICAgICAgICB0bC5hZGQgVHdlZW5NYXgudG8gQGdhbGxlcnlDb250YWluZXIgLCAuNCxcbiAgICAgICAgICAgIGF1dG9BbHBoYTowXG5cbiAgICAgICAgdGwuYWRkQ2FsbGJhY2sgPT5cbiAgICAgICAgICAgIEBteVN3aXBlci5zd2lwZVRvKHRvSW5kZXgsIDApXG5cbiAgICAgICAgdGwuYWRkIFR3ZWVuTWF4LnRvIEBnYWxsZXJ5Q29udGFpbmVyICwgLjQsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MVxuXG4gICAgICAgIEBjdXJyZW50SW5kZXggPSB0b0luZGV4XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBEcmFnZ2FibGVHYWxsZXJ5XG5cbiIsIlxuUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuVmlkZW9PdmVybGF5ID0gcmVxdWlyZSAnLi9WaWRlb092ZXJsYXkuY29mZmVlJ1xuXG5jbGFzcyBGYWRlR2FsbGVyeSBleHRlbmRzIFBsdWdpbkJhc2VcblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgc3VwZXIob3B0cylcblxuXG4gICAgaW5pdGlhbGl6ZTogKG9wdHMpIC0+XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyAnaW5pdGlhbGl6ZTogJywgb3B0c1xuXG4gICAgICAgIEBwYWdlID0gb3B0cy5wYWdlIG9yIG51bGxcbiAgICAgICAgdGFyZ2V0ID0gb3B0cy50YXJnZXQgb3IgbnVsbFxuICAgICAgICBcbiAgICAgICAgaWYgKHRhcmdldD8pXG4gICAgICAgICAgICBAJHRhcmdldCA9ICQodGFyZ2V0KVxuICAgICAgICBcbiAgICAgICAgaWYgIShAcGFnZSA9PSBudWxsKVxuICAgICAgICAgICAgQGluZm9Cb3hlcyA9IEAkZWwuZmluZCBcImxpLnZpZGVvXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGluZm9Cb3hlcyA9IEAkZWwuZmluZCBcImxpXCJcbiAgICAgICAgICAgIFxuICAgICAgICBAY3VycmVudFNlbGVjdGVkID0gQGluZm9Cb3hlcy5maWx0ZXIoXCI6Zmlyc3QtY2hpbGRcIilcblxuICAgICAgICBzdXBlcigpXG4gICAgXG4gICAgYWRkRXZlbnRzOiAtPiAgXG5cbiAgICAgICAgQGluZm9Cb3hlcy5lYWNoIChpLHQpID0+XG4gICAgICAgICAgICAkYnRuID0gJCh0KS5maW5kKCcudmlkZW8tYnV0dG9uJylcblxuICAgICAgICAgICAgaWYgJGJ0bi5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgdmlkZW9FdmVudHMgPSBuZXcgSGFtbWVyKCRidG5bMF0pXG4gICAgICAgICAgICAgICAgdmlkZW9FdmVudHMub24gJ3RhcCcgLCBAaGFuZGxlVmlkZW9JbnRlcmFjdGlvblxuXG5cblxuXG4gICAgaGFuZGxlVmlkZW9JbnRlcmFjdGlvbjogKGUpID0+XG5cbiAgICAgICAgJHRhcmdldCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoXCIudmlkZW8tYnV0dG9uXCIpXG4gICAgICAgIGlmICgkdGFyZ2V0LnNpemUoKSBpcyAwKSBcbiAgICAgICAgICAgICR0YXJnZXQgPSBlLnRhcmdldFxuICAgICAgICBcbiAgICAgICAgaWYgJHRhcmdldC5kYXRhKCd0eXBlJykgPT0gJ2ltYWdlJ1xuICAgICAgICAgICAgaWYgKCR0YXJnZXQuZGF0YSgnZnVsbCcpKVxuICAgICAgICAgICAgICAgIEBpbWFnZVNyYyA9ICR0YXJnZXQuZGF0YSgnZnVsbCcpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGltYWdlU3JjID0gJHRhcmdldC5jaGlsZHJlbignaW1nJykuYXR0cignc3JjJylcbiAgICAgICAgZGF0YSA9XG4gICAgICAgICAgICBtcDQ6JHRhcmdldC5kYXRhKCdtcDQnKVxuICAgICAgICAgICAgd2VibTokdGFyZ2V0LmRhdGEoJ3dlYm0nKVxuICAgICAgICAgICAgcG9zdGVyOkBpbWFnZVNyY1xuXG4gICAgICAgIFZpZGVvT3ZlcmxheS5pbml0VmlkZW9PdmVybGF5IGRhdGFcblxuXG4gICAgZ290bzogKGlkLCBpbml0VmFsKSAtPlxuICAgICAgICBpbmZvSWQgPSBcIiMje2lkfS1pbmZvXCJcblxuICAgICAgICBpZiAhKEBwYWdlID09IG51bGwpXG4gICAgICAgICAgICB0YXJnZXQgPSBAaW5mb0JveGVzLnBhcmVudHMoJ2xpLmdyb3VwLWluZm8nKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0YXJnZXQgPSBAaW5mb0JveGVzXG4gICAgICAgIFxuXG4gICAgICAgICNTd2l0Y2ggSW5mbyBCb3hlc1xuICAgICAgICB0bCA9IG5ldyBUaW1lbGluZU1heFxuICAgICAgICB0bC5hZGQgVHdlZW5NYXgudG8gdGFyZ2V0ICwgLjQgLFxuICAgICAgICAgICAgYXV0b0FscGhhOjBcbiAgICAgICAgICAgIG92ZXJ3cml0ZTpcImFsbFwiXG4gICAgICAgIHRsLmFkZCBUd2Vlbk1heC50byB0YXJnZXQuZmlsdGVyKGluZm9JZCkgLCAuNCAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MVxuXG5cbiAgICAgICAgaWYgKEAkdGFyZ2V0PylcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIEAkdGFyZ2V0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRvcCA9IEAkdGFyZ2V0Lm9mZnNldCgpLnRvcCAtICgkKCdoZWFkZXInKS5oZWlnaHQoKSlcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIHRvcFxuICAgICAgICAgICAgcG9zID0gJCgnYm9keScpLnNjcm9sbFRvcCgpXG4gICAgICAgICAgICBpZiAocG9zIDwgdG9wKVxuICAgICAgICAgICAgICAgICQoJ2JvZHknKS5hbmltYXRlIHsgc2Nyb2xsVG9wOiB0b3AgfVxuICBcblxubW9kdWxlLmV4cG9ydHMgPSBGYWRlR2FsbGVyeVxuXG4iLCJQbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5cbiMjI1xuICBcbiAgY3JlYXRlIGZvcm0gb2JqZWN0IG9uIHBhZ2UgKHNyYy9jb20vcGFnZXMvKSBhZnRlciB5b3UndmUgY3JlYXRlZCBhbmQgYWRkZWQgYW55IGRkbCBvYmplY3RzXG4gIFxuICB3aW5kb3cuZGRscyA9IFtdICAgIFxuICB3aW5kb3cuZGRscy5wdXNoICQoJyNzZWxlY3QnKS5jZkRyb3Bkb3duXG4gICAgICAgIG9uU2VsZWN0OiAodCkgLT5cbiAgICAgICAgICAgIGlkID0gJCh0KS5kYXRhKCdpZCcpICBcbiAgXG4gIG15Zm9ybSA9IG5ldyBGb3JtSGFuZGxlclxuICAgIGVsOiAnI3NhbGVzLWZvcm0nIFxuICBcbiMjI1xuXG4jIyMgXG4gIHRvZG86XG4gIDUuIGN1c3RvbWl6ZSBjb25maXJtYXRpb25cbiAgMjogdmFsaWRhdGUgZGF0ZSB0eXBlXG4gIDQ6IGFkZCBpbnB1dCBtYXNrIGZvciBwaG9uZSBhbmQgZGF0ZVxuIyMjXG5cbmNsYXNzIEZvcm1IYW5kbGVyIGV4dGVuZHMgUGx1Z2luQmFzZVxuICAgIFxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgQCRlbCA9ICQob3B0cy5lbClcbiAgICAgICAgQGZvcm1jb250YWluZXIgPSBAXG4gICAgICAgIHN1cGVyKG9wdHMpXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBzdXBlcigpXG5cbiAgICB2YWxpZGF0ZTogLT5cblxuICAgICAgICAkZm9ybSA9IEAkZWxcbiAgICAgICAgXG4gICAgICAgIGVycm9yc0NvbnRhaW5lciA9ICAnIycgKyAkZm9ybS5kYXRhKCdlcnJvcnMnKVxuICAgICAgICBoYW5kbGVyID0gJGZvcm0uZGF0YSgnaGFuZGxlcicpXG4gICAgICAgIGVycm9ycyA9ICcnXG4gICAgICAgIGludmFsaWRGaWVsZENvdW50ID0gMFxuICAgICAgICBkYXRhID0ge31cblxuICAgICAgICBpbnB1dHMgPSAkZm9ybS5maW5kICdpbnB1dDpub3QoW3R5cGU9cmFkaW9dLCBbdHlwZT1oaWRkZW5dKSwgdGV4dGFyZWEsIC5yYWRpb3MnXG4gICAgICAgIGlucHV0Q29udGFpbmVycyA9ICRmb3JtLmZpbmQoJy5pbnB1dCwgdGV4dGFyZWEsIC5yYWRpb3MnKVxuXG4gICAgICAgICQoaW5wdXRDb250YWluZXJzKS5yZW1vdmVDbGFzcygnaW52YWxpZCcpXG5cbiAgICAgICAgIyB0ZXh0Ym94ZXMgYW5kIHRleHQgaW5wdXRzXG4gICAgICAgIGlucHV0cy5lYWNoIChpLHQpID0+XG4gICAgICAgICAgICB2YWx1ZSA9ICcnXG4gICAgICAgICAgICB0eXBlID0gJCh0KS5kYXRhKCd0eXBlJylcbiAgICAgICAgICAgIHBhcmVudCA9ICQodCkucGFyZW50cygnLmlucHV0JykuZXEoMClcbiAgICAgICAgICAgIHJlcXVpcmVkID0gJChwYXJlbnQpLmhhc0NsYXNzKCdyZXF1aXJlZCcpIG9yICQodCkuaGFzQ2xhc3MoJ3JlcXVpcmVkJylcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaXNyYWRpbyA9ICQodCkuaGFzQ2xhc3MoJ3JhZGlvcycpXG4gICAgICAgICAgICBpZiBpc3JhZGlvIGFuZCAkKCdpbnB1dDpyYWRpb1tuYW1lPScgKyAkKHQpLmRhdGEoJ2dyb3VwJykgKyAnXTpjaGVja2VkJykuc2l6ZSgpIGlzIDFcbiAgICAgICAgICAgICAgICB2YWx1ZSA9ICQoJ2lucHV0OnJhZGlvW25hbWU9JyArICQodCkuZGF0YSgnZ3JvdXAnKSArICddOmNoZWNrZWQnKS52YWwoKS50cmltKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHZhbHVlID0gaWYgaXNyYWRpbyB0aGVuIHZhbHVlIGVsc2UgJCh0KS52YWwoKS50cmltKClcbiAgICAgICAgICAgIGRhdGFbJCh0KS5kYXRhKCdtYXBwaW5nJyldID0gdmFsdWVcblxuICAgICAgICAgICAgZmllbGROYW1lID0gaWYgJCh0KS5kYXRhKCduYW1lJykgdGhlbiAkKHQpLmRhdGEoJ25hbWUnKSBlbHNlICQodCkuYXR0cigncGxhY2Vob2xkZXInKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIHZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkc1xuICAgICAgICAgICAgaWYgcmVxdWlyZWQgYW5kICh2YWx1ZS5sZW5ndGggaXMgMClcbiAgICAgICAgICAgICAgICBlcnJvcnMgKz0gJzxsaT4nICsgZmllbGROYW1lICsgJyBpcyByZXF1aXJlZC48L2xpPidcbiAgICAgICAgICAgICAgICBpZiAkKHQpLnByb3AoJ3RhZ05hbWUnKS50b0xvd2VyQ2FzZSgpIGlzICd0ZXh0YXJlYScgb3IgJCh0KS5oYXNDbGFzcygncmFkaW9zJylcbiAgICAgICAgICAgICAgICAgICAgJCh0KS5hZGRDbGFzcygnaW52YWxpZCcpICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICQodCkucGFyZW50cygnLmlucHV0JykuYWRkQ2xhc3MoJ2ludmFsaWQnKVxuICAgICAgICAgICAgICAgIGludmFsaWRGaWVsZENvdW50KytcblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICMgdmFsaWRhdGUgaW5wdXQgdHlwZXNcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2VtYWlsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsUGF0dGVybiA9IC8vL14oW1xcdy4tXSspQChbXFx3Li1dKylcXC4oW2EtekEtWi5dezIsNn0pJCAvLy9pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgISB2YWx1ZS5tYXRjaCBlbWFpbFBhdHRlcm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JzICs9ICc8bGk+JyArIGZpZWxkTmFtZSArICcgaXMgbm90IGEgdmFsaWQgZW1haWwgYWRkcmVzcy48L2xpPidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0KS5wYXJlbnRzKCcuaW5wdXQnKS5hZGRDbGFzcygnaW52YWxpZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludmFsaWRGaWVsZENvdW50KytcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBpc05hTih2YWx1ZSkgb3IgKHZhbHVlICUgMSAhPSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMgKz0gJzxsaT4nICsgZmllbGROYW1lICsgJyBpcyBub3QgYSB2YWxpZCBudW1iZXIuPC9saT4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodCkucGFyZW50cygnLmlucHV0JykuYWRkQ2xhc3MoJ2ludmFsaWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnZhbGlkRmllbGRDb3VudCsrXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdwaG9uZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXQgPSAvXlsoXXswLDF9WzAtOV17M31bKV17MCwxfVstXFxzXFwuXXswLDF9WzAtOV17M31bLVxcc1xcLl17MCwxfVswLTldezR9JC9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAhIHZhbHVlLm1hdGNoIHBhdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMgKz0gJzxsaT4nICsgZmllbGROYW1lICsgJyBpcyBub3QgYSB2YWxpZCBwaG9uZSBudW1iZXIuPC9saT4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodCkucGFyZW50cygnLmlucHV0JykuYWRkQ2xhc3MoJ2ludmFsaWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnZhbGlkRmllbGRDb3VudCsrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cbiAgICAgIFxuICAgICAgICAjIHZhbGlkYXRlIGRyb3Bkb3duIGxpc3RzXG4gICAgICAgIGlmIHdpbmRvdy5kZGxzP1xuICAgICAgICAgICAgJC5lYWNoIHdpbmRvdy5kZGxzLCAoaSwgZCkgPT5cbiAgICAgICAgICAgICAgICBkLnJlbW92ZUNsYXNzKCdpbnZhbGlkJylcbiAgICAgICAgICAgICAgICBkYXRhW2QubWFwcGluZ10gPSBkLnZhbHVlLnRyaW0oKVxuICAgICAgICAgICAgICAgIGlmIChkLnJlcXVpcmVkKSBhbmQgKGQudmFsdWUudHJpbSgpLmxlbmd0aCBpcyAwKVxuICAgICAgICAgICAgICAgICAgICBlcnJvcnMgKz0gJzxsaT4nICsgZC5uYW1lICsgJyBpcyByZXF1aXJlZC48L2xpPidcbiAgICAgICAgICAgICAgICAgICAgZC5hZGRDbGFzcygnaW52YWxpZCcpXG4gICAgICAgICAgICAgICAgICAgIGludmFsaWRGaWVsZENvdW50KysgICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgIHZhbGlkID0gaW52YWxpZEZpZWxkQ291bnQgaXMgMFxuICAgICAgICBlcnJvckh0bWwgPSBpZiB2YWxpZCB0aGVuICcnIGVsc2UgJzx1bD4nICsgZXJyb3JzICsgJzwvdWw+J1xuICAgICAgICBjbHMgPSBpZiB2YWxpZCB0aGVuICdzdWNjZXNzJyBlbHNlICdmYWlsdXJlJ1xuICAgICAgICAgICAgXG4gICAgICAgICQoZXJyb3JzQ29udGFpbmVyKS5yZW1vdmVDbGFzcygnc3VjY2VzcyBmYWlsdXJlJykuYWRkQ2xhc3MoY2xzKS5odG1sKGVycm9ySHRtbCkgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAjIGRpc3BsYXkgZXJyb3JzXG4gICAgICAgICQoZXJyb3JzQ29udGFpbmVyKS5zdG9wKCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICBoZWlnaHQ6ICQoZXJyb3JzQ29udGFpbmVyKS5maW5kKCd1bCcpLmhlaWdodCgpXG4gICAgICAgIH0pXG4gICAgICAgICAgICBcbiAgICAgICAgcmVzcG9uc2UgPSB7XG4gICAgICAgICAgICB2YWxpZDogdmFsaWQsXG4gICAgICAgICAgICBoYW5kbGVyOiBoYW5kbGVyLFxuICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgIGNvbnRhaW5lcjogZXJyb3JzQ29udGFpbmVyXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlXG5cbiAgICBzdWJtaXRGb3JtOiAoZSwgcGFyZW50KSAtPlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgIFxuICAgICAgICB2YWxpZGF0aW9uID0gcGFyZW50LnZhbGlkYXRlKClcbiAgICAgICAgaWYgdmFsaWRhdGlvbi52YWxpZFxuICAgICAgICBcbiAgICAgICAgICAgICQuYWpheCBcbiAgICAgICAgICAgICAgICB1cmw6IHZhbGlkYXRpb24uaGFuZGxlcixcbiAgICAgICAgICAgICAgICBtZXRob2Q6XCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBkYXRhOiB2YWxpZGF0aW9uLmRhdGEsXG4gICAgICAgICAgICAgICAgY29tcGxldGU6IChyZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgcmVzID0gaWYgcmVzcG9uc2UucmVzcG9uc2VKU09OPyB0aGVuIHJlc3BvbnNlLnJlc3BvbnNlSlNPTiBlbHNlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAnPGRpdiBpZD1cImNvbmNsdXNpb25cIj5Zb3VyIHN1Ym1pc3Npb24gZmFpbGVkLjwvZGl2PidcbiAgICAgICAgICAgICAgICAgICAgZ29vZCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIHJlcy5tZXNzYWdlP1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29vZCA9IHJlcy5tZXNzYWdlIGlzICdzdWNjZXNzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgIyB0b2RvOiBjdXN0b21pemUgbWVzc2FnZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGdvb2RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gJzxkaXYgaWQ9XCJjb25jbHVzaW9uXCI+VGhhbmsgeW91LiAgV2UgaGF2ZSByZWNlaXZlZCB5b3VyIHJlcXVlc3QsIGFuZCB3aWxsIHJlcGx5IHRvIHlvdSBzaG9ydGx5LjwvZGl2PidcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIHNlcnZlciBzaWRlIHZhbGlkYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiByZXMuZXJyb3I/IGFuZCByZXMuZXJyb3IuZXJyb3JzP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gJzx1bCBpZD1cImNvbmNsdXNpb25cIj4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkLmVhY2ggcmVzLmVycm9yLmVycm9ycywgKGksIG9iaikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgKz0gJzxsaT4nICsgb2JqLm1lc3NhZ2UgKyAnPC9saT4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSAnPC91bD4nXG4gICAgXG4gICAgICAgICAgICAgICAgICAgIGNscyA9IGlmIGdvb2QgdGhlbiAnc3VjY2VzcycgZWxzZSAnZmFpbHVyZSdcbiAgICAgICAgICAgICAgICAgICAgJCh2YWxpZGF0aW9uLmNvbnRhaW5lcikucmVtb3ZlQ2xhc3MoJ3N1Y2Nlc3MgZmFpbHVyZScpLmFkZENsYXNzKGNscykuaHRtbChtZXNzYWdlKVxuXG4gICAgICAgICAgICAgICAgICAgICQodmFsaWRhdGlvbi5jb250YWluZXIpLnN0b3AoKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJCh2YWxpZGF0aW9uLmNvbnRhaW5lcikuZmluZCgnI2NvbmNsdXNpb24nKS5oZWlnaHQoKVxuICAgICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIGdvb2RcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5jbGVhckZvcm0oKVxuXG4gICAgY2xlYXJGb3JtOiAtPlxuXG4gICAgICAgICRmb3JtID0gQCRlbFxuICAgICAgICBcbiAgICAgICAgI3JhZGlvc1xuICAgICAgICByYWRpb3MgPSAkZm9ybS5maW5kICcucmFkaW9zJ1xuICAgICAgICByYWRpb3MucmVtb3ZlQ2xhc3MoJ2ludmFsaWQnKVxuICAgICAgICAkLmVhY2ggcmFkaW9zLCAoeCwgcikgPT5cbiAgICAgICAgICAgICQocmFkaW9zKS5maW5kKCdpbnB1dDpyYWRpbycpLnJlbW92ZUF0dHIoXCJjaGVja2VkXCIpXG4gICAgICAgIFxuICAgICAgICAjIGlucHV0c1xuICAgICAgICBpbnB1dHMgPSAkZm9ybS5maW5kICdpbnB1dDpub3QoW3R5cGU9cmFkaW9dKSwgdGV4dGFyZWEnXG4gICAgICAgIGlucHV0cy5yZW1vdmVDbGFzcygnaW52YWxpZCcpLnBhcmVudHMoJy5pbnB1dCcpLnJlbW92ZUNsYXNzKCdpbnZhbGlkJylcbiAgICAgICAgJC5lYWNoIGlucHV0cywgKGksIHQpID0+XG4gICAgICAgICAgICAkKHQpLnZhbCgnJylcblxuICAgICAgICAjIGRyb3Bkb3dubGlzdHNcbiAgICAgICAgaWYgd2luZG93LmRkbHM/XG4gICAgICAgICAgICAkLmVhY2ggd2luZG93LmRkbHMsIChpLCBkKSA9PlxuICAgICAgICAgICAgICAgIGQuY2xlYXJTZWxlY3Rpb24oKVxuICAgICAgICAgICAgICAgIFxuICAgIGFkZEV2ZW50czogLT5cbiAgICAgICAgc3VibWl0dGVyID0gIEAkZWwuZGF0YSgnc3VibWl0dGVyJylcbiAgICAgICAgdGhhdCA9IEBcbiAgICAgICAgJCgnIycgKyBzdWJtaXR0ZXIpLm9uICdjbGljaycsIChlKSAtPlxuICAgICAgICAgICAgdGhhdC5zdWJtaXRGb3JtIGUsIHRoYXRcblxuICAgICAgICAjIHRleHQgaW5wdXRzIFxuICAgICAgICBAJGVsLmZpbmQoJ2lucHV0Om5vdChbdHlwZT1yYWRpb10pLCB0ZXh0YXJlYScpLm9uICdibHVyJywgKGUpIC0+XG4gICAgICAgICAgICBpZiAkKEApLnBhcmVudHMoJy5pbnB1dCcpLmhhc0NsYXNzKCdpbnZhbGlkJykgb3IgJChAKS5oYXNDbGFzcygnaW52YWxpZCcpXG4gICAgICAgICAgICAgICAgdGhhdC52YWxpZGF0ZSgpXG5cbiAgICAgICAgIyByYWRpbyBidXR0b25zXG4gICAgICAgIEAkZWwuZmluZCgnaW5wdXQ6cmFkaW8nKS5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICAgICAgICAgIGlmICQoQCkucGFyZW50cygnLnJhZGlvcycpLmhhc0NsYXNzKCdpbnZhbGlkJylcbiAgICAgICAgICAgICAgICB0aGF0LnZhbGlkYXRlKClcblxuICAgICAgICAjIGRyb3AgZG93biBsaXN0c1xuICAgICAgICBpZiB3aW5kb3cuZGRscz9cbiAgICAgICAgICAgICQuZWFjaCB3aW5kb3cuZGRscywgKGksIGQpID0+IFxuICAgICAgICAgICAgICAgIGlmIChkLnJlcXVpcmVkKSBcbiAgICAgICAgICAgICAgICAgICAgaGlkZGVuRmllbGQgPSBkLmlucHV0WzBdXG4gICAgICAgICAgICAgICAgICAgICQoaGlkZGVuRmllbGQpLm9uICdjaGFuZ2UnLCAoZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQudmFsaWRhdGUoKVxuICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBGb3JtSGFuZGxlclxuIiwiZ2xvYmFscyA9IHJlcXVpcmUgJy4uL2dsb2JhbC9pbmRleC5jb2ZmZWUnXG5QbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIEhlYWRlckFuaW1hdGlvbiBleHRlbmRzIFBsdWdpbkJhc2VcblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgXG4gICAgICAgIEBib2R5ID0gJChcImJvZHlcIilcbiAgICAgICAgQGh0bWwgPSAkKFwiaHRtbFwiKVxuICAgICAgICBAY29udGVudCA9ICQoXCIjY29udGVudFwiKVxuICAgICAgICBAbW9ibmF2ID0gJChcIiNtb2JpbGUtaGVhZGVyLW5hdlwiKVxuICAgICAgICBAc3VibmF2ID0gJChcIi5zdWJuYXZcIilcbiAgICAgICAgQHN1Ym5hdlNob3dpbmcgPSBmYWxzZVxuICAgICAgICBAb3VyUGFya3NMZWZ0ID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwib3VyLXBhcmtzXCJdJykub2Zmc2V0KCkubGVmdFxuICAgICAgICBAcGFydG5lcnNoaXBMZWZ0ID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwicGFydG5lcnNoaXBzXCJdJykub2Zmc2V0KCkubGVmdFxuICAgICAgICBcblxuICAgICAgICBzdXBlcihvcHRzKSAgXG5cblxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgIHN1cGVyKCkgICAgXG4gICAgICAgIEBzaG93SW5pdGlhbFN1Yk5hdigpICAgICAgICBcblxuICAgIGFkZEV2ZW50czogLT5cbiAgICAgICAgaWYgISQoJ2h0bWwnKS5oYXNDbGFzcyAndGFibGV0J1xuICAgICAgICAgICAgJCgnLm5hdi1saXN0IGEgbGknKS5vbiAnbW91c2VlbnRlcicsIEBoYW5kbGVOYXZIb3ZlclxuICAgICAgICAgICAgJCgnaGVhZGVyJykub24gJ21vdXNlbGVhdmUnLCBAaGlkZVN1Yk5hdlxuICAgICAgICBcbiAgICAgICAgd2luZG93Lm9ucmVzaXplID0gQGhhbmRsZVJlc2l6ZVxuICAgICAgICBAYm9keS5maW5kKFwiI25hdmJhci1tZW51XCIpLm9uICdjbGljaycsIEB0b2dnbGVOYXZcbiAgICAgICAgJCgnI21vYmlsZS1oZWFkZXItbmF2IGEnKS5vbiAnY2xpY2snLCBAc2hvd01vYmlsZVN1Yk5hdlxuICAgICAgICAkKCcjbW9iaWxlLWhlYWRlci1uYXYgaScpLm9uICdjbGljaycsIEBoYW5kbGVBcnJvd0NsaWNrXG4gICAgICAgIFxuICAgICAgICBAYm9keS5maW5kKCcudG9nZ2xlLW5hdicpLm9uICdjbGljaycsICgpIC0+XG4gICAgICAgICAgICAkKEApLnBhcmVudHMoJ2hlYWRlcicpLmZpbmQoJyNuYXZiYXItbWVudSBpbWcnKS50cmlnZ2VyKCdjbGljaycpXG4gICAgICAgICAgICBcbiAgICAgICAgJCgnI21vYmlsZS1oZWFkZXItbmF2Jykub24gJ2NsaWNrJywgJy5tb2JpbGUtc3ViLW5hdiBsaScsIEBvbkNsaWNrTW9iaWxlU3ViTmF2TGlua1xuICAgICAgICBcbiAgICBcbiAgICBoYW5kbGVTdWJOYXY6ID0+XG4gICAgICAgIHN0YXJ0UGFnZSA9ICQoJy5zdWJuYXYnKS5kYXRhICdwYWdlJ1xuICAgICAgICBpZCA9ICQoJy5uYXYtbGlzdCBhW2RhdGEtcGFnZS1zaG9ydD1cIicgKyBzdGFydFBhZ2UgKyAnXCJdJykuZGF0YSAncGFnZSdcbiAgICAgICAgQHNob3dTdWJOYXZMaW5rcyhpZClcbiAgICAgICAgXG4gICAgc2hvd0luaXRpYWxTdWJOYXY6ID0+XG4gICAgICAgIHNlY3Rpb24gPSAkKCcuc3VibmF2JykuZGF0YSAncGFnZSdcbiAgICAgICAgXG4gICAgICAgIGlmIHNlY3Rpb24gPT0gJ29mZmVyaW5ncycgfHwgc2VjdGlvbiA9PSAnYWNjb21tb2RhdGlvbnMnIHx8IHNlY3Rpb24gPT0gJ291cnBhcmtzJ1xuICAgICAgICAgICAgQHNob3dTdWJOYXZMaW5rcygnb3VyLXBhcmtzJylcbiAgICAgICAgZWxzZSBpZiBzZWN0aW9uID09ICdwYXJ0bmVyc2hpcC1kZXRhaWxzJyB8fCBzZWN0aW9uID09ICdwYXJ0bmVyc2hpcCdcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MoJ3BhcnRuZXJzaGlwcycpXG4gICAgICAgIFxuICAgIHRvZ2dsZU5hdjogKGUpID0+XG4gICAgICAgICAgICAgICAgXG4gICAgaGFuZGxlUmVzaXplOiA9PlxuICAgICAgICBAaGFuZGxlU3ViTmF2KClcbiAgICAgICAgQGFkanVzdE1vYmlsZU5hdigpXG4gICAgICAgIFxuICAgICAgICBcbiAgICBwb3NpdGlvblN1Yk5hdkxpc3RzOiA9PlxuICAgICAgICAjY29uc29sZS5sb2cgJ3Bvc2l0aW9uU3ViTmF2TGlzdHMnXG4jICAgICAgICBvdXJQYXJrc0xlZnQgPSAkKCcubmF2LWxpc3QgYVtkYXRhLXBhZ2U9XCJvdXItcGFya3NcIl0nKS5vZmZzZXQoKS5sZWZ0XG4jICAgICAgICBwYXJ0bmVyc2hpcExlZnQgPSAkKCcubmF2LWxpc3QgYVtkYXRhLXBhZ2U9XCJwYXJ0bmVyc2hpcHNcIl0nKS5vZmZzZXQoKS5sZWZ0ICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZiAkKCcjaGVhZGVyLXRvcCcpLmhhc0NsYXNzICdzbWFsbCdcbiAgICAgICAgICAgIGlmIHdpbmRvdy5pbm5lcldpZHRoIDwgOTkzXG4gICAgICAgICAgICAgICAgJCgnI291ci1wYXJrcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBvdXJQYXJrc0xlZnQgLSA5MClcbiAgICAgICAgICAgICAgICAkKCcjcGFydG5lcnNoaXBzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQHBhcnRuZXJzaGlwTGVmdCAtIDEzMylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAkKCcjb3VyLXBhcmtzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQG91clBhcmtzTGVmdCAtIDkwKVxuICAgICAgICAgICAgICAgICQoJyNwYXJ0bmVyc2hpcHMtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAcGFydG5lcnNoaXBMZWZ0IC0gMTE4KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiB3aW5kb3cuaW5uZXJXaWR0aCA8IDk5M1xuICAgICAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAb3VyUGFya3NMZWZ0IC0gNjApXG4gICAgICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBwYXJ0bmVyc2hpcExlZnQgLSAxMDUpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgJCgnI291ci1wYXJrcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBvdXJQYXJrc0xlZnQgLSA2MClcbiAgICAgICAgICAgICAgICAkKCcjcGFydG5lcnNoaXBzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQHBhcnRuZXJzaGlwTGVmdCAtIDkwKVxuXG4gICAgYW5pbWF0ZUhlYWRlcjogKHNjcm9sbFkpID0+XG4gICAgICAgIGlmIEBodG1sLmhhc0NsYXNzICdwaG9uZSdcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICRodCA9IEAkZWwuZmluZCgnI2hlYWRlci10b3AnKVxuICAgICAgICAkaGIgPSBAJGVsLmZpbmQoJyNoZWFkZXItYm90dG9tJykgXG5cbiAgICAgICAgaWYgc2Nyb2xsWSA+IDg1IFxuICAgICAgICAgICAgaWYgIUBuYXZDb2xsYXBzZWRcbiAgICAgICAgICAgICAgICAkKCcjaGVhZGVyLXRvcCwgI2hlYWRlci1ib3R0b20sICNuYXZiYXItbG9nbywgLm5hdi1saXN0LCAjYnV5LCAuaGVhZGVyLWNvbnRhY3QsIC5oZWFkZXItc29jaWFsJykuYWRkQ2xhc3MoJ3NtYWxsJylcbiAgICAgICAgICAgICAgICBAbmF2Q29sbGFwc2VkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIEBwb3NpdGlvblN1Yk5hdkxpc3RzKCkgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIEBuYXZDb2xsYXBzZWRcbiAgICAgICAgICAgICAgICAkKCcjaGVhZGVyLXRvcCwgI2hlYWRlci1ib3R0b20sICNuYXZiYXItbG9nbywgLm5hdi1saXN0LCAjYnV5LCAuaGVhZGVyLWNvbnRhY3QsIC5oZWFkZXItc29jaWFsJykucmVtb3ZlQ2xhc3MoJ3NtYWxsJylcbiAgICAgICAgICAgICAgICBAbmF2Q29sbGFwc2VkID0gZmFsc2VcbiAgICAgICAgICAgICAgICBAaGFuZGxlU3ViTmF2KClcbiAgICAgICAgICAgICAgICBAcG9zaXRpb25TdWJOYXZMaXN0cygpIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgaGFuZGxlTmF2SG92ZXI6IChlKSA9PlxuICAgICAgICBwYXJlbnRJRCA9ICQoZS50YXJnZXQpLnBhcmVudCgpLmRhdGEoJ3BhZ2UnKVxuICAgICAgICBpZiAkKCcjJyArIHBhcmVudElEICsgJy1zdWJuYXYtbGlzdCcpLmZpbmQoJ2EnKS5sZW5ndGggPCAxXG4gICAgICAgICAgICBAaGlkZVN1Yk5hdigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBoaWRlU3ViTmF2TGlua3MoKVxuICAgICAgICAgICAgQHNob3dTdWJOYXZMaW5rcyhwYXJlbnRJRClcbiAgICAgICAgXG4gICAgICAgICAgICBpZiAhQHN1Ym5hdlNob3dpbmdcbiAgICAgICAgICAgICAgICBAc2hvd1N1Yk5hdigpXG4gICAgICAgICAgICAgIFxuICAgIHNob3dTdWJOYXY6ID0+XG4gICAgICAgIEBzdWJuYXYuYWRkQ2xhc3MoJ3Nob3dpbmcnKVxuICAgICAgICBAc3VibmF2U2hvd2luZyA9IHRydWVcbiAgICAgICAgXG4gICAgaGlkZVN1Yk5hdjogPT5cbiAgICAgICAgQHN1Ym5hdi5yZW1vdmVDbGFzcygnc2hvd2luZycpXG4gICAgICAgIEBzdWJuYXZTaG93aW5nID0gZmFsc2VcbiAgICAgICAgQGhhbmRsZVN1Yk5hdigpXG5cbiAgICBzaG93U3ViTmF2TGlua3M6IChwYWdlKSA9PlxuICAgICAgICBpZiBwYWdlP1xuICAgICAgICAgICAgbGVmdCA9ICQoJy5uYXYgLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwiJyArIHBhZ2UgKyAnXCJdJykucG9zaXRpb24oKS5sZWZ0XG4gICAgICAgICAgICBvZmZzZXQgPSAwXG4gICAgICAgICAgICBoZWxwZXIgPSAtNDUgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHdpbmRvdy5pbm5lcldpZHRoIDwgOTkzXG4gICAgICAgICAgICAgICAgaGVscGVyID0gLTIwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICNjb25zb2xlLmxvZyAncGFnZTogJywgcGFnZVxuICAgICAgICAgICAgI2NvbnNvbGUubG9nICdiOiAnLCAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0IGEnKS5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCBhJykubGVuZ3RoIDwgM1xuICAgICAgICAgICAgICAgIGZvciBhIGluICQoJyMnICsgcGFnZSArICctc3VibmF2LWxpc3QgYScpXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IG9mZnNldCArICQoYSkud2lkdGgoKVxuXG4gICAgICAgICAgICBpZiBvZmZzZXQgPiAwXG4gICAgICAgICAgICAgICAgI2NvbnNvbGUubG9nICdhJ1xuICAgICAgICAgICAgICAgICQoJyMnICsgcGFnZSArICctc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBsZWZ0IC0gKG9mZnNldCAvIDMpKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICNjb25zb2xlLmxvZyAnYidcbiMgICAgICAgICAgICAgICAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgbGVmdCArIGhlbHBlcilcbiAgICAgICAgICAgICAgICBAcG9zaXRpb25TdWJOYXZMaXN0cygpXG4gICAgICAgICAgICAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0JykuYWRkQ2xhc3MoJ3Nob3dpbmcnKVxuICAgIFxuICAgIGhpZGVTdWJOYXZMaW5rczogPT5cbiAgICAgICAgJCgnLnN1Ym5hdi1saXN0IGxpJykucmVtb3ZlQ2xhc3MoJ3Nob3dpbmcnKVxuICAgICAgICBcbiAgICBoYW5kbGVTdWJOYXY6ID0+XG4gICAgICAgIGlmICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygnb3VycGFya3MnKSB8fCAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ29mZmVyaW5ncycpIHx8ICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygnYWNjb21tb2RhdGlvbnMnKVxuICAgICAgICAgICAgJCgndWwuc3VibmF2LWxpc3QgbGknKS5yZW1vdmVDbGFzcyAnc2hvd2luZydcbiAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5hZGRDbGFzcyAnc2hvd2luZydcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MoJ291ci1wYXJrcycpXG5cbiAgICAgICAgICAgIGlmICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygnb2ZmZXJpbmdzJylcbiAgICAgICAgICAgICAgICAkKCdhI291ci1wYXJrcy1vZmZlcmluZ3Mtc3VibmF2LWxpbmsnKS5hZGRDbGFzcyAnc2VsZWN0ZWQnXG5cbiAgICAgICAgICAgIGlmICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygnYWNjb21tb2RhdGlvbnMnKVxuICAgICAgICAgICAgICAgICQoJ2Ejb3VyLXBhcmtzLWFjY29tbW9kYXRpb25zLXN1Ym5hdi1saW5rJykuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cbiAgICAgICAgZWxzZSBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ3BhcnRuZXJzaGlwJykgfHwgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdwYXJ0bmVyc2hpcC1kZXRhaWxzJylcbiAgICAgICAgICAgICQoJ3VsLnN1Ym5hdi1saXN0IGxpJykucmVtb3ZlQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICAgICAkKCcjcGFydG5lcnNoaXBzLXN1Ym5hdi1saXN0JykuYWRkQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICAgICBAc2hvd1N1Yk5hdkxpbmtzKCdwYXJ0bmVyc2hpcHMnKVxuXG4jICAgICAgICAgICAgaWYgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdwYXJ0bmVyc2hpcC1kZXRhaWxzJylcbiMgICAgICAgICAgICAgICAgJCgnYSNwYXJ0bmVyc2hpcC1kZXRhaWxzLXN1Ym5hdi1saW5rJykuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cbiM9PT09PT09PT09PT09PT09PT09Iz09PT09PT09PT09PT09PT09PT0jPT09PT09PT09PT09PT09PT09PSNcbiM9PT09PT09PT09PT09PT09PT09ICBNT0JJTEUgU1RBUlRTIEhFUkUgPT09PT09PT09PT09PT09PT09I1xuIz09PT09PT09PT09PT09PT09PT0jPT09PT09PT09PT09PT09PT09PSM9PT09PT09PT09PT09PT09PT09IyBcblxuICAgIHRvZ2dsZU5hdjogKGUpID0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAkdCA9ICQoZS50YXJnZXQpXG4gICAgICAgICRoYiA9ICQoJyNoZWFkZXItYm90dG9tJylcbiAgICAgICAgJG1uID0gJCgnI21vYmlsZS1oZWFkZXItbmF2JylcbiAgICAgICAgJGhoID0gJGhiLmhlaWdodCgpXG5cbiAgICAgICAgJHQudG9nZ2xlQ2xhc3MoJ2Nsb3NlZCcpXG5cbiAgICAgICAgY29uc29sZS5sb2cgJ3NlY29uZCB0b2dnbGUnXG4gICAgICAgIGNvbnNvbGUubG9nICR0XG4gICAgICAgIFxuICAgICAgICBpZiAkdC5oYXNDbGFzcygnY2xvc2VkJylcbiAgICAgICAgICAgIEBhZGp1c3RNb2JpbGVOYXYoKVxuICAgICAgICAgICAgVHdlZW5NYXgudG8gQG1vYm5hdiwgLjM1LCBcbiAgICAgICAgICAgICAgICB7eTogKDgwMCArICRoaClcbiAgICAgICAgICAgICAgICAsejogMFxuICAgICAgICAgICAgICAgICxlYXNlOiBQb3dlcjEuZWFzZU91dFxuICAgICAgICAgICAgICAgICxvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgICAgICAgICBUd2Vlbk1heC5zZXQgQG1vYm5hdixcbiAgICAgICAgICAgICAgICAgICAgICAgIHo6IDEwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBUd2Vlbk1heC5zZXQgQG1vYm5hdixcbiAgICAgICAgICAgICAgICB6OiAtMiBcbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvIEBtb2JuYXYsIC41LCB7eTogMCwgejogMCwgZWFzZTogUG93ZXIxLmVhc2VJbn1cbiAgICAgICAgICAgICQoJy5tb2JpbGUtc3ViLW5hdicpLmNzcygnaGVpZ2h0JywgJzBweCcpXG4gICAgICAgICAgICBAYWRqdXN0TW9iaWxlTmF2XG4gICAgICAgICAgICBAaGlkZU1vYmlsZVN1Yk5hdigpXG4gICAgICAgICAgICBUd2Vlbk1heC5zZXQgQGNvbnRlbnQgLFxuICAgICAgICAgICAgICAgIHk6IDBcblxuICAgIGFkanVzdE1vYmlsZU5hdjogPT5cbiAgICAgICAgJGhiID0gJCgnI2hlYWRlci1ib3R0b20nKVxuICAgICAgICAkbW4gPSAkKCcjbW9iaWxlLWhlYWRlci1uYXYnKVxuICAgICAgICAjIFNldCBuYXYgaGVpZ2h0IHRvIDM1MHB4IGV2ZXJ5IHRpbWUgYmVmb3JlIGFkanVzdGluZ1xuICAgICAgICAjJG1uLmNzcyB7aGVpZ2h0OiAzNTB9XG4gICAgICAgICRoaCA9ICRoYi5oZWlnaHQoKVxuICAgICAgICAkbmggPSAkbW4uaGVpZ2h0KClcbiAgICAgICAgJGl3ID0gd2luZG93LmlubmVyV2lkdGhcbiAgICAgICAgJGloID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgICRtYiA9ICQoJyNuYXZiYXItbWVudScpXG5cbiAgICAgICAgaWYgJG5oID4gJGloXG4gICAgICAgICAgICAkbW4uY3NzIHtoZWlnaHQ6ICgkaWggLSAkaGgpLCBvdmVyZmxvdzogJ3Njcm9sbCd9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICRtbi5jc3Mge2hlaWdodDogNDAwICsgJ3B4J30gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgc2hvd01vYmlsZVN1Yk5hdjogKGUpID0+XG4gICAgICAgIHRoaXNTdWJOYXYgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5maW5kICcubW9iaWxlLXN1Yi1uYXYnXG4gICAgICAgIFxuICAgICAgICBpZiAodGhpc1N1Yk5hdi5maW5kKCdsaScpLmxlbmd0aCA8IDEpXG4gICAgICAgICAgICBAaGlkZU1vYmlsZVN1Yk5hdigpXG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiAhKCQoZS50YXJnZXQpLnBhcmVudCgpLmhhc0NsYXNzKCdhY3RpdmUnKSlcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgXG4gICAgICAgIGhvd01hbnkgPSB0aGlzU3ViTmF2LmZpbmQoJ2xpJykubGVuZ3RoXG4gICAgICAgIHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICB0YXJnZXQgPSAkKGUudGFyZ2V0KVxuXG4gICAgICAgIEBoaWRlTW9iaWxlU3ViTmF2KClcbiAgICAgICAgdGFyZ2V0LmZpbmQoJ2knKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICB0YXJnZXQuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgdGFyZ2V0LnBhcmVudHMoJ2EnKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICBAbW9ibmF2LmNzcygnaGVpZ2h0JywgKHdpbmRvd0hlaWdodCAtIDEwMCkgKyAncHgnKVxuICAgICAgICB0aGlzU3ViTmF2LmNzcygnaGVpZ2h0JywgKGhvd01hbnkgKiA1MCkgKyAncHgnKVxuICAgICAgICBcbiAgICBoaWRlTW9iaWxlU3ViTmF2OiA9PlxuICAgICAgICAkKCcubW9iaWxlLXN1Yi1uYXYnKS5jc3MoJ2hlaWdodCcsICcwcHgnKVxuICAgICAgICBAbW9ibmF2LmNzcygnaGVpZ2h0JywgJzQwMHB4JylcbiAgICAgICAgQG1vYm5hdi5maW5kKCdpJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgQG1vYm5hdi5maW5kKCdsaScpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgIEBtb2JuYXYuZmluZCgndWwgYScpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG5cbiAgICBcbiAgICBoYW5kbGVBcnJvd0NsaWNrOiAoZSkgPT5cbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgXG4gICAgICAgIGlmICQoZS50YXJnZXQpLmhhc0NsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICBAaGlkZU1vYmlsZVN1Yk5hdigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoJ2xpJykudHJpZ2dlciAnY2xpY2snXG4gICAgICAgIFxuICAgICAgICBcbiAgICBvbkNsaWNrTW9iaWxlU3ViTmF2TGluazogKGUpID0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIFxuICAgICAgICBpZiAkKGUudGFyZ2V0KS5kYXRhKCdocmVmJyk/XG4gICAgICAgICAgICB1cmwgPSAkKGUudGFyZ2V0KS5kYXRhICdocmVmJ1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmxcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlckFuaW1hdGlvblxuXG5cbiIsIlxuUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuVmlkZW9PdmVybGF5ID0gcmVxdWlyZSAnLi9WaWRlb092ZXJsYXkuY29mZmVlJ1xuXG5jbGFzcyBQYXJrc0xpc3QgZXh0ZW5kcyBQbHVnaW5CYXNlXG5cbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gICAgICAgIEAkZWwgPSAkKG9wdHMuZWwpXG4gICAgICAgIHN1cGVyKG9wdHMpICAgICAgICAgXG4gICAgICAgIEBnYWxsZXJ5ID0gb3B0cy5nYWxsZXJ5XG4gICAgICAgIGlmIEBnYWxsZXJ5P1xuICAgICAgICAgICAgQGdhbGxlcnkub24gXCJpdGVtSW5kZXhcIiAsIEBzZWxlY3RMb2dvXG4gICAgICAgICAgICBcbiAgICAgICAgQHBhZ2UgPSBvcHRzLnBhZ2VcblxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgIEBwYXJrTG9nb3MgPSAkKEAkZWwpLmZpbmQgXCJsaVwiXG4gICAgICAgIEBjdXJyZW50U2VsZWN0ZWQgPSBAcGFya0xvZ29zLmZpbHRlcihcIjpmaXJzdC1jaGlsZFwiKVxuICAgICAgICBpZiBAZ2FsbGVyeT9cbiAgICAgICAgICAgIEBzZWxlY3RMb2dvIEBzZWxlY3RlZExvZ28oKVxuICAgICAgICAgICAgQGdhbGxlcnkuZ290byBAc2VsZWN0ZWRMb2dvKCksIHRydWVcbiAgICAgICAgc3VwZXIoKVxuXG4gICAgYWRkRXZlbnRzOiAtPlxuICAgICAgICBAJGVsLm9uICdjbGljaycsICdsaS5wYXJrJywgQGhhbmRsZUxvZ29JbnRlcmFjdGlvblxuICAgICAgICBcbiAgICAgICAgQHBhcmtMb2dvcy5lYWNoIChpLHQpID0+XG4gICAgICAgICAgICBsb2dvRXZlbnRzID0gbmV3IEhhbW1lcih0KVxuICAgICAgICAgICAgbG9nb0V2ZW50cy5vbiAndGFwJyAsIEBoYW5kbGVMb2dvSW50ZXJhY3Rpb25cblxuICAgIGhhbmRsZUxvZ29JbnRlcmFjdGlvbjogKGUpID0+XG4gICAgICAgIGlmIEBwYWdlID09ICdhY2NvbW1vZGF0aW9uJ1xuICAgICAgICAgICAgQHBhcmtMb2dvcy5yZW1vdmVDbGFzcyAnc2VsZWN0ZWQnXG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnRzKCdsaS5wYXJrJykuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuICAgICAgICAgICAgd2hpY2hQYXJrID0gJChlLnRhcmdldCkucGFyZW50cygnbGkucGFyaycpLmF0dHIoJ2lkJylcbiAgICAgICAgICAgIEBzaG93TmV3QWNjb21tb2RhdGlvbnMod2hpY2hQYXJrKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIFxuICAgICAgICAkdGFyZ2V0ID0gJChlLnRhcmdldCkuY2xvc2VzdCgnbGknKVxuXG4gICAgICAgIGlkID0gJHRhcmdldC5kYXRhKCdpZCcpXG4gICAgICAgIFxuICAgICAgICBAZGlzcGxheUNvbnRlbnQgaWRcbiAgICAgICAgXG4gICAgICAgIFxuICAgIHNob3dOZXdBY2NvbW1vZGF0aW9uczogKHBhcmspID0+XG4gICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IC5zd2lwZXItY29udGFpbmVyJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLmNhcm91c2VsLXdyYXBwZXInKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuc3dpcGVyLWNvbnRhaW5lcltkYXRhLWxvZ289XCInICsgcGFyayArICdcIl0nKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuc3dpcGVyLWNvbnRhaW5lcltkYXRhLWxvZ289XCInICsgcGFyayArICdcIl0nKS5wYXJlbnQoKS5hZGRDbGFzcyAnYWN0aXZlJ1xuXG4gICAgZGlzcGxheUNvbnRlbnQ6IChpZCkgLT5cblxuXG4gICAgICAgIEBzZWxlY3RMb2dvKGlkKVxuXG4gICAgICAgICNTd2l0Y2ggSW5mbyBCb3hlc1xuICAgICAgICBAZ2FsbGVyeS5nb3RvKGlkKVxuXG5cbiAgICBzZWxlY3RMb2dvOiAoaWQpID0+XG4gICAgICAgIGxvZ29JZCA9IFwiIyN7aWR9LWxvZ29cIlxuICAgICAgICBAcGFya0xvZ29zLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAgIEBwYXJrTG9nb3MuZmlsdGVyKGxvZ29JZCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcblxuXG4gICAgc2VsZWN0ZWRMb2dvOiAtPlxuICAgICAgICByZXR1cm4gQHBhcmtMb2dvcy5wYXJlbnQoKS5maW5kKCdsaS5zZWxlY3RlZCcpLmRhdGEoJ2lkJyk7XG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXJrc0xpc3RcblxuIiwiUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuXG5jbGFzcyBSZXNpemVCdXR0b25zIGV4dGVuZHMgUGx1Z2luQmFzZVxuXG4gICAgY29uc3RydWN0b3I6IC0+XG4gICAgICAgIEByZXNpemVCdXR0b25zKClcblxuICAgIHJlc2l6ZUJ1dHRvbnM6IC0+XG4gICAgICAgIGMgPSAkKCcjY29udGVudCcpXG4gICAgICAgIGJ0bl93cmFwcGVycyA9IGMuZmluZCAnLmJ0bi13cmFwcGVyJ1xuXG4gICAgICAgIGZvciBidG5fd3JhcHBlciBpbiBidG5fd3JhcHBlcnNcbiAgICAgICAgICAgIGJ0bnMgPSAkKGJ0bl93cmFwcGVyKS5maW5kICdhJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBidG5zLmxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICBtYXhXaWR0aCA9IDBcbiAgICAgICAgICAgICAgICB3aWRlc3RTcGFuID0gbnVsbFxuXG4gICAgICAgICAgICAgICAgJChidG5zKS5lYWNoIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmICQodGhpcykud2lkdGgoKSA+IG1heFdpZHRoXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhXaWR0aCA9ICQodGhpcykud2lkdGgoKVxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZXN0U3BhbiA9ICQodGhpcylcblxuICAgICAgICAgICAgICAgICQoYnRucykuZWFjaCAtPlxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmNzcyh7d2lkdGg6IG1heFdpZHRoICsgNjB9KVxuXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gUmVzaXplQnV0dG9ucyIsImNsYXNzIFN2Z0luamVjdFxuXG4gICAgY29uc3RydWN0b3I6IChzZWxlY3RvcikgLT5cbiAgICAgICAgXG4gICAgICAgIEAkc3ZncyA9ICQoc2VsZWN0b3IpXG4gICAgICAgIFxuICAgICAgICBAcHJlbG9hZGVyID0gbmV3IGNyZWF0ZWpzLkxvYWRRdWV1ZSB0cnVlICwgXCJcIiAsIHRydWVcbiAgICAgICAgQHByZWxvYWRlci5zZXRNYXhDb25uZWN0aW9ucygxMClcbiAgICAgICAgQHByZWxvYWRlci5hZGRFdmVudExpc3RlbmVyICdmaWxlbG9hZCcgLCBAb25TdmdMb2FkZWRcbiAgICAgICAgQHByZWxvYWRlci5hZGRFdmVudExpc3RlbmVyICdjb21wbGV0ZScgLCBAb25Mb2FkQ29tcGxldGVcbiAgICAgICAgQG1hbmlmZXN0ID0gW11cbiAgICAgICAgQGNvbGxlY3RTdmdVcmxzKClcbiAgICAgICAgQGxvYWRTdmdzKClcbiAgICAgICAgXG4gICAgY29sbGVjdFN2Z1VybHM6IC0+XG4gICAgICAgIFxuICAgICAgICBzZWxmID0gQFxuICAgICAgICBcbiAgICAgICAgQCRzdmdzLmVhY2ggLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWQgPSBcInN2Zy1pbmplY3QtI3twYXJzZUludChNYXRoLnJhbmRvbSgpICogMTAwMCkudG9TdHJpbmcoKX1cIlxuICAgICAgICAgIFxuICAgICAgICAgICAgJChAKS5hdHRyKCdpZCcsIGlkKVxuICAgICAgICAgICAgJChAKS5hdHRyKCdkYXRhLWFyYicgLCBcImFiYzEyM1wiKVxuICAgICAgICAgICAgc3ZnVXJsID0gJChAKS5hdHRyKCdzcmMnKVxuICAgICAgICAgICAgXG4gICAgICAgICAgIFxuXG4gICAgICAgICAgICBzZWxmLm1hbmlmZXN0LnB1c2ggXG4gICAgICAgICAgICAgICAgaWQ6aWRcbiAgICAgICAgICAgICAgICBzcmM6c3ZnVXJsXG4gICAgICAgICAgICAgICAgXG4gICAgbG9hZFN2Z3M6IC0+XG4gICAgICAgIFxuICAgICAgICBAcHJlbG9hZGVyLmxvYWRNYW5pZmVzdChAbWFuaWZlc3QpXG4gICAgICAgICAgICAgICAgXG4gICAgXG4gICAgaW5qZWN0U3ZnOiAoaWQsc3ZnRGF0YSkgLT5cbiAgICAgICAgXG4gICAgICAgICRlbCA9ICQoXCIjI3tpZH1cIikgICAgXG4gXG4gXG4gICAgICAgIGltZ0lEID0gJGVsLmF0dHIoJ2lkJylcbiAgICAgICAgaW1nQ2xhc3MgPSAkZWwuYXR0cignY2xhc3MnKVxuICAgICAgICBpbWdEYXRhID0gJGVsLmNsb25lKHRydWUpLmRhdGEoKSBvciBbXVxuICAgICAgICBkaW1lbnNpb25zID0gXG4gICAgICAgICAgICB3OiAkZWwuYXR0cignd2lkdGgnKVxuICAgICAgICAgICAgaDogJGVsLmF0dHIoJ2hlaWdodCcpXG5cbiAgICAgICAgc3ZnID0gJChzdmdEYXRhKS5maWx0ZXIoJ3N2ZycpXG4gICAgICAgIFxuXG4gICAgICAgIHN2ZyA9IHN2Zy5hdHRyKFwiaWRcIiwgaW1nSUQpICBpZiB0eXBlb2YgaW1nSUQgaXNudCAndW5kZWZpbmVkJ1xuICAgICAgICBpZiB0eXBlb2YgaW1nQ2xhc3MgaXNudCAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgY2xzID0gKGlmIChzdmcuYXR0cihcImNsYXNzXCIpIGlzbnQgJ3VuZGVmaW5lZCcpIHRoZW4gc3ZnLmF0dHIoXCJjbGFzc1wiKSBlbHNlIFwiXCIpXG4gICAgICAgICAgICBzdmcgPSBzdmcuYXR0cihcImNsYXNzXCIsIGltZ0NsYXNzICsgXCIgXCIgKyBjbHMgKyBcIiByZXBsYWNlZC1zdmdcIilcbiAgICAgICAgXG4gICAgICAgICMgY29weSBhbGwgdGhlIGRhdGEgZWxlbWVudHMgZnJvbSB0aGUgaW1nIHRvIHRoZSBzdmdcbiAgICAgICAgJC5lYWNoIGltZ0RhdGEsIChuYW1lLCB2YWx1ZSkgLT4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHN2Z1swXS5zZXRBdHRyaWJ1dGUgXCJkYXRhLVwiICsgbmFtZSwgdmFsdWVcbiAgICAgICAgICAgIHJldHVybiAgICAgICAgXG4gICAgICAgIHN2ZyA9IHN2Zy5yZW1vdmVBdHRyKFwieG1sbnM6YVwiKVxuICAgICAgICBcbiAgICAgICAgI0dldCBvcmlnaW5hbCBkaW1lbnNpb25zIG9mIFNWRyBmaWxlIHRvIHVzZSBhcyBmb3VuZGF0aW9uIGZvciBzY2FsaW5nIGJhc2VkIG9uIGltZyB0YWcgZGltZW5zaW9uc1xuICAgICAgICBvdyA9IHBhcnNlRmxvYXQoc3ZnLmF0dHIoXCJ3aWR0aFwiKSlcbiAgICAgICAgb2ggPSBwYXJzZUZsb2F0KHN2Zy5hdHRyKFwiaGVpZ2h0XCIpKVxuICAgICAgICBcbiAgICAgICAgI1NjYWxlIGFic29sdXRlbHkgaWYgYm90aCB3aWR0aCBhbmQgaGVpZ2h0IGF0dHJpYnV0ZXMgZXhpc3RcbiAgICAgICAgaWYgZGltZW5zaW9ucy53IGFuZCBkaW1lbnNpb25zLmhcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwid2lkdGhcIiwgZGltZW5zaW9ucy53XG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcImhlaWdodFwiLCBkaW1lbnNpb25zLmhcbiAgICAgICAgXG4gICAgICAgICNTY2FsZSBwcm9wb3J0aW9uYWxseSBiYXNlZCBvbiB3aWR0aFxuICAgICAgICBlbHNlIGlmIGRpbWVuc2lvbnMud1xuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJ3aWR0aFwiLCBkaW1lbnNpb25zLndcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwiaGVpZ2h0XCIsIChvaCAvIG93KSAqIGRpbWVuc2lvbnMud1xuICAgICAgICBcbiAgICAgICAgI1NjYWxlIHByb3BvcnRpb25hbGx5IGJhc2VkIG9uIGhlaWdodFxuICAgICAgICBlbHNlIGlmIGRpbWVuc2lvbnMuaFxuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJoZWlnaHRcIiwgZGltZW5zaW9ucy5oXG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcIndpZHRoXCIsIChvdyAvIG9oKSAqIGRpbWVuc2lvbnMuaFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICRlbC5yZXBsYWNlV2l0aCBzdmdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICBvblN2Z0xvYWRlZDogKGUpID0+XG4gICAgICAgIFxuICAgICAgICBAaW5qZWN0U3ZnKGUuaXRlbS5pZCwgZS5yYXdSZXN1bHQpXG4gICAgXG4gICAgb25Mb2FkQ29tcGxldGU6IChlKSA9PlxuICAgIFxuICAgIFxuICAgIFxuICAgIFxuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBTdmdJbmplY3QgIiwiXG5cbmNsYXNzIFZpZGVvT3ZlcmxheVxuXG5cblxuICAgIGNvbnN0cnVjdG9yOiAoZWwpIC0+XG4gICAgICAgIEAkZWwgPSAkKGVsKVxuICAgICAgICBAJGlubmVyID0gQCRlbC5maW5kKFwiLm92ZXJsYXktaW5uZXJcIilcbiAgICAgICAgQCRjb250YWluZXIgPSBAJGVsLmZpbmQoXCIub3ZlcmxheS1pbm5lci1jb250YWluZXJcIilcbiAgICAgICAgXG4gICAgICAgIGlmIChAJGNvbnRhaW5lci5maW5kKCcub3ZlcmxheS1jb250ZW50Jykuc2l6ZSgpIGlzIDEpIFxuICAgICAgICAgICAgQCRjb250YWluZXIgPSBAJGNvbnRhaW5lci5maW5kKCcub3ZlcmxheS1jb250ZW50JylcbiAgICAgICAgICAgIFxuICAgICAgICBAJGNsb3NlID0gQCRlbC5maW5kKFwiLm92ZXJsYXktY2xvc2VcIilcbiAgICAgICAgXG5cbiAgICAgICAgQGNyZWF0ZVZpZGVvSW5zdGFuY2UoKVxuICAgICAgICBAY3JlYXRlT3ZlcmxheVRyYW5zaXRpb24oKVxuICAgICAgICBAYWRkRXZlbnRzKClcblxuXG5cbiAgICBjcmVhdGVPdmVybGF5VHJhbnNpdGlvbjogLT5cbiAgICAgICAgQHRsID0gbmV3IFRpbWVsaW5lTWF4XG5cbiAgICAgICAgQCRlbC5zaG93KClcblxuICAgICAgICBAdGwuYWRkIFR3ZWVuTWF4LmZyb21UbyAkKCcjb3ZlcmxheScpLCAuMDEsXG4gICAgICAgICAgICB7ekluZGV4OiAtMSwgZGlzcGxheTonbm9uZScsIHo6IDB9LCB7ekluZGV4OiA1MDAwLCBkaXNwbGF5OidibG9jaycsIHo6IDk5OTk5OTk5OTl9XG4gICAgICAgIFxuICAgICAgICBAdGwuYWRkIFR3ZWVuTWF4LnRvIEAkZWwgLCAuMzUgLFxuICAgICAgICAgICAgYXV0b0FscGhhOjFcblxuICAgICAgICBAdGwuYWRkIFR3ZWVuTWF4LnRvIEAkaW5uZXIgLCAuNTUgLFxuICAgICAgICAgICAgYWxwaGE6MVxuXG4gICAgICAgIEB0bC5hZGQgVHdlZW5NYXgudG8gQCRjbG9zZSAsIC4yNSAsXG4gICAgICAgICAgICBhbHBoYToxXG4gICAgICAgICxcbiAgICAgICAgICAgIFwiLT0uMTVcIlxuXG4gICAgICAgIEB0bC5hZGRMYWJlbChcImluaXRDb250ZW50XCIpXG5cbiAgICAgICAgQHRsLnN0b3AoKVxuXG4gICAgY3JlYXRlVmlkZW9JbnN0YW5jZTogKCkgLT5cblxuXG5cbiAgICBhZGRFdmVudHM6IC0+XG4gICAgICAgIEBjbG9zZUV2ZW50ID0gbmV3IEhhbW1lcihAJGNsb3NlWzBdKVxuXG5cblxuICAgIHRyYW5zaXRpb25Jbk92ZXJsYXk6IChuZXh0KSAtPlxuICAgICAgICBjb25zb2xlLmxvZyAndHJhbnNpdGlvbkluT3ZlcmxheSdcbiAgICAgICAgQHRyYW5zSW5DYiA9IG5leHRcbiAgICAgICAgQHRsLmFkZENhbGxiYWNrKEB0cmFuc0luQ2IsIFwiaW5pdENvbnRlbnRcIilcbiAgICAgICAgQHRsLnBsYXkoKVxuICAgICAgICBAY2xvc2VFdmVudC5vbiAndGFwJyAsIEBjbG9zZU92ZXJsYXlcblxuICAgIHRyYW5zaXRpb25PdXRPdmVybGF5OiAtPlxuICAgICAgICBjb25zb2xlLmxvZyAndHJhbnNpdGlvbk91dE92ZXJsYXknXG4gICAgICAgIEBjbG9zZUV2ZW50Lm9mZiAndGFwJyAsIEBjbG9zZU92ZXJsYXlcbiAgICAgICAgQHRsLnJlbW92ZUNhbGxiYWNrKEB0cmFuc0luQ2IpXG4gICAgICAgIEB0bC5yZXZlcnNlKClcbiAgICAgICAgZGVsZXRlIEB0cmFuc0luQ2JcblxuXG4gICAgY2xvc2VPdmVybGF5OiAoZSkgPT5cbiAgICAgICAgQHJlbW92ZVZpZGVvKClcbiAgICAgICAgQHRyYW5zaXRpb25PdXRPdmVybGF5KClcblxuXG4gICAgcmVtb3ZlVmlkZW86ICgpIC0+XG4gICAgICAgIGlmIEB2aWRlb0luc3RhbmNlXG4gICAgICAgICAgICBAdmlkZW9JbnN0YW5jZS5wYXVzZSgpXG4gICAgICAgICAgICBAdmlkZW9JbnN0YW5jZS5jdXJyZW50VGltZSgwKVxuICAgICAgICAgICAgI0B2aWRlb0luc3RhbmNlLmRpc3Bvc2UoKVxuXG4gICAgcmVzaXplT3ZlcmxheTogKCkgLT5cbiAgICAgICAgJHZpZCA9IEAkZWwuZmluZCgndmlkZW8nKVxuICAgICAgICAkdyA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgICAgICRoID0gJHZpZC5oZWlnaHQoKVxuXG4gICAgICAgICMgQCRpbm5lci5jc3Mge3dpZHRoOiAkdywgaGVpZ2h0OiAkaH1cbiAgICAgICAgIyAkdmlkLmNzcyB7aGVpZ2h0OiAxMDAgKyAnJScsIHdpZHRoOiAxMDAgKyAnJSd9XG5cbiAgICBhcHBlbmREYXRhOiAoZGF0YSkgLT5cbiAgICAgICAgaWYgZGF0YS5tcDQgPT0gXCJcIiBvciAhIGRhdGEubXA0P1xuICAgICAgICAgICAgY29uc29sZS5sb2cgJ25vIHZpZGVvLCBpdHMgYW4gaW1hZ2UnXG4gICAgICAgICAgICBAcG9zdGVyID0gJChcIjxkaXYgY2xhc3M9J3ZpZGVvLWpzJz48aW1nIGNsYXNzPSd2anMtdGVjaCcgc3JjPSdcIiArIGRhdGEucG9zdGVyICsgXCInIGNsYXNzPSdtZWRpYS1pbWFnZS1wb3N0ZXInIC8+PC9kaXY+XCIpXG4gICAgICAgICAgICBAJGNvbnRhaW5lci5odG1sIEBwb3N0ZXJcbiAgICAgICAgICAgIEBwb3N0ZXIuY3NzICdoZWlnaHQnLCAnMTAwJSdcbiAgICAgICAgICAgIEByZW1vdmVWaWRlbygpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgICBtcDQgPSAkKFwiPHNvdXJjZSBzcmM9XFxcIiN7ZGF0YS5tcDR9XFxcIiB0eXBlPVxcXCJ2aWRlby9tcDRcXFwiIC8+IFwiKVxuICAgICAgICB3ZWJtID0gJChcIjxzb3VyY2Ugc3JjPVxcXCIje2RhdGEud2VibX1cXFwiIHR5cGU9XFxcInZpZGVvL3dlYm1cXFwiIC8+IFwiKVxuXG4gICAgICAgIEAkdmlkZW9FbCA9ICQoXCI8dmlkZW8gaWQ9J292ZXJsYXktcGxheWVyJyBjbGFzcz0ndmpzLWRlZmF1bHQtc2tpbiB2aWRlby1qcycgY29udHJvbHMgcHJlbG9hZD0nYXV0bycgLz5cIilcbiAgICAgICAgQCR2aWRlb0VsLmFwcGVuZChtcDQpXG4gICAgICAgIEAkdmlkZW9FbC5hcHBlbmQod2VibSlcbiAgICAgICAgQCRjb250YWluZXIuaHRtbCBAJHZpZGVvRWxcblxuICAgICAgICBpZiBAdmlkZW9JbnN0YW5jZT9cbiAgICAgICAgICAgIEB2aWRlb0luc3RhbmNlLmRpc3Bvc2UoKVxuICAgICAgICBAdmlkZW9JbnN0YW5jZSA9IHZpZGVvanMgXCJvdmVybGF5LXBsYXllclwiICAsXG4gICAgICAgICAgICB3aWR0aDpcIjEwMCVcIlxuICAgICAgICAgICAgaGVpZ2h0OlwiMTAwJVwiXG5cblxuXG5cbiAgICBwbGF5VmlkZW86ICgpID0+XG4jICAgICAgICBpZighJChcImh0bWxcIikuaGFzQ2xhc3MoJ21vYmlsZScpKVxuIyAgICAgICAgICAgIEB2aWRlb0luc3RhbmNlLnBsYXkoKVxuICAgICAgICBpZiBAdmlkZW9JbnN0YW5jZT9cbiAgICAgICAgICAgIEB2aWRlb0luc3RhbmNlLnBsYXkoKVxuICAgICAgICAgICAgXG4gICAgc2hvd0ltYWdlOiAoKSA9PlxuICAgICAgICBjb25zb2xlLmxvZyAnc2hvd0ltYWdlJ1xuXG5cblxub3ZlcmxheSA9IG5ldyBWaWRlb092ZXJsYXkgXCIjb3ZlcmxheVwiXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMuaW5pdFZpZGVvT3ZlcmxheSA9IChkYXRhKSAtPlxuICAgIGNvbnNvbGUubG9nICdkYXRhMjogJywgZGF0YVxuICAgIG92ZXJsYXkuYXBwZW5kRGF0YShkYXRhKVxuXG5cbiAgICBpZiAhKGRhdGEubXA0ID09IFwiXCIpXG4gICAgICAgIGNvbnNvbGUubG9nICdkYXRhLm1wNCAhPT0gXCJcIidcbiAgICAgICAgb3ZlcmxheS50cmFuc2l0aW9uSW5PdmVybGF5KG92ZXJsYXkucGxheVZpZGVvKVxuICAgIGVsc2VcbiAgICAgICAgY29uc29sZS5sb2cgJ2RhdGEubXA0ID09PSBcIlwiJ1xuICAgICAgICBvdmVybGF5LnRyYW5zaXRpb25Jbk92ZXJsYXkob3ZlcmxheS5zaG93SW1hZ2UpXG5cblxuXG5cblxuXG5cblxuXG5cblxuIiwiUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uLy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuRnJhbWVzTW9kZWwgPSByZXF1aXJlICcuL0ZyYW1lc01vZGVsLmNvZmZlZSdcblxubWF0Y2hGcmFtZU51bSA9IC9cXGQrKD89XFwuW2EtekEtWl0rKS9cblxuY2xhc3MgRnJhbWVBbmltYXRpb24gZXh0ZW5kcyBQbHVnaW5CYXNlXG4gICAgXG4gICAgXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBcbiAgICAgICAgQCRlbCA9ICQob3B0cy5lbClcbiAgICAgICAgQGFzeW5jID0gb3B0cy5hc3luYyBvciBmYWxzZVxuICAgICAgICBkZXB0aD0gb3B0cy5kZXB0aCBvciAxXG4gICAgICAgIEAkY29udGFpbmVyID0gJChcIjxkaXYgY2xhc3M9J2NvYXN0ZXItY29udGFpbmVyJyAvPlwiKVxuICAgICAgICBAJGNvbnRhaW5lci5hdHRyKCdpZCcgLCBvcHRzLmlkKVxuICAgICAgICBAJGNvbnRhaW5lci5jc3MoJ3otaW5kZXgnLCBkZXB0aClcbiAgICAgICAgVHdlZW5NYXguc2V0IEAkY29udGFpbmVyICwgXG4gICAgICAgICAgICB6OmRlcHRoICogMTBcbiAgICAgICAgXG4gICAgICAgIHN1cGVyKG9wdHMpXG4gICAgICAgIFxuICAgICAgICBcbiAgICBcbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cbiAgICAgICAgc3VwZXIob3B0cylcbiAgICAgICAgXG4gICAgICAgIEBtb2RlbCA9IG5ldyBGcmFtZXNNb2RlbCBvcHRzXG4gICAgICAgIEBtb2RlbC5vbiBcImRhdGFMb2FkZWRcIiAsIEBzZXR1cENhbnZhc1xuICAgICAgICBAbW9kZWwub24gXCJ0cmFja0xvYWRlZFwiICwgQG9uVHJhY2tMb2FkZWRcbiAgICAgICAgQG1vZGVsLm9uIFwiZnJhbWVzTG9hZGVkXCIgLCBAb25GcmFtZXNMb2FkZWRcbiAgICAgICAgQG1vZGVsLmxvYWREYXRhKClcbiAgICAgICAgXG4gICBcbiAgICAgICBcbiAgICBsb2FkRnJhbWVzOiAtPlxuICAgICAgICBpZiBAbW9kZWwuZGF0YT9cbiAgICAgICAgICAgIEBtb2RlbC5wcmVsb2FkRnJhbWVzKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGRlZmVyTG9hZGluZyA9IHRydWVcbiAgICAgICAgXG4gICAgXG4gICAgXG4gICAgc2V0dXBDYW52YXM6ID0+XG4gICAgICAgIFxuXG4gICAgICAgIEBjYW52YXNXaWR0aCA9IEBtb2RlbC5nZXQoJ2dsb2JhbCcpLndpZHRoXG4gICAgICAgIEBjYW52YXNIZWlnaHQgPSBAbW9kZWwuZ2V0KCdnbG9iYWwnKS5oZWlnaHRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIilcbiAgICAgICAgQGNvbnRleHQgPSBAY2FudmFzLmdldENvbnRleHQoJzJkJylcbiAgICAgICAgXG4gICAgICAgIEBjYW52YXMuc2V0QXR0cmlidXRlKCd3aWR0aCcgLCBAY2FudmFzV2lkdGgpXG4gICAgICAgIEBjYW52YXMuc2V0QXR0cmlidXRlKCdoZWlnaHQnICwgQGNhbnZhc0hlaWdodClcblxuICAgICAgICBcbiAgICAgICAgQCRjb250YWluZXIuYXBwZW5kKEBjYW52YXMpXG4gICAgICAgIEAkZWwucHJlcGVuZChAJGNvbnRhaW5lcilcbiAgICAgICAgQG1vZGVsLnByZWxvYWRUcmFjaygpXG4gICAgICAgIGlmIEBkZWZlckxvYWRpbmdcbiAgICAgICAgICAgIEBtb2RlbC5wcmVsb2FkRnJhbWVzKClcbiAgICAgIFxuICAgIFxuICAgIGRpc3BsYXlUcmFjazogLT5cbiAgICAgICAgXG4gICAgICAgIEBjb250ZXh0LmNsZWFyUmVjdCAwICwgMCAsIEBjYW52YXNXaWR0aCAsIEBjYW52YXNIZWlnaHRcbiAgICAgICAgQGNvbnRleHQuZHJhd0ltYWdlIEB0cmFja0ltYWdlLnRhZyAsIDAgLDAgLCBAY2FudmFzV2lkdGggLCBAY2FudmFzSGVpZ2h0XG4gICAgICAgIFxuICAgIGRpc3BsYXlGcmFtZTogKG51bSkgLT5cbiAgICAgICAgXG4gICAgICAgIG1hbmlmZXN0ID0gQG1vZGVsLmdldCgnbWFuaWZlc3QnKVxuICAgICAgICBcbiAgICAgICAgaWYgbWFuaWZlc3QubGVuZ3RoID4gbnVtXG4gICAgICAgICAgICBhc3NldCA9IG1hbmlmZXN0W251bV0gXG4gICAgICAgICAgICBmcmFtZUFzc2V0ID0gQG1vZGVsLmdldEFzc2V0KGFzc2V0LmZpbGVuYW1lKVxuICAgICAgICAgICAgIyBjb25zb2xlLmxvZyBmcmFtZUFzc2V0LnRhZyAsIGFzc2V0LnggLCBhc3NldC55LCBhc3NldC53aWR0aCwgYXNzZXQuaGVpZ2h0XG4gICAgICAgICAgICBAY29udGV4dC5kcmF3SW1hZ2UgZnJhbWVBc3NldC50YWcgLCBhc3NldC54ICwgYXNzZXQueSwgYXNzZXQud2lkdGgsIGFzc2V0LmhlaWdodFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgaW5pdEFuaW1hdGlvbjogLT5cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBmcmFtZXMgPSBAbW9kZWwuZ2V0KCdtYW5pZmVzdCcpLmxlbmd0aFxuICAgICAgICBzcGVlZCA9IEBtb2RlbC5nZXQoJ2dsb2JhbCcpLmZwc1xuICAgICAgICBkZWxheSA9IEBtb2RlbC5nZXQoJ2dsb2JhbCcpLmRlbGF5IG9yIDBcbiAgICAgICAgcmVwZWF0RGVsYXkgPSBAbW9kZWwuZ2V0KCdnbG9iYWwnKS5yZXBlYXREZWxheSBvciAxMFxuICAgICAgICBcbiAgICBcblxuICAgICAgICBkdXJhdGlvbiA9ICBmcmFtZXMgLyBzcGVlZFxuXG5cbiAgICAgICAgc2VsZiA9IEAgXG4gICAgICAgIEBsYXN0RnJhbWVOdW0gPSAtMVxuICAgICAgICBAdGltZWxpbmUgPSB3aW5kb3cuY29hc3RlciA9IFR3ZWVuTWF4LnRvIEBjYW52YXMgLCBkdXJhdGlvbiAsIFxuICAgICAgICAgICAgb25VcGRhdGU6IC0+XG4gICAgICAgICAgICAgICAgZnJhbWVOdW0gPSBNYXRoLmZsb29yKGZyYW1lcyAqIEBwcm9ncmVzcygpKSAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBmcmFtZU51bSBpc250IEBsYXN0RnJhbWVOdW0gICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGlzcGxheVRyYWNrKClcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kaXNwbGF5RnJhbWUoZnJhbWVOdW0pXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBsYXN0RnJhbWVOdW0gPSBmcmFtZU51bVxuICAgICAgICAgICAgcmVwZWF0Oi0xXG4gICAgICAgICAgICByZXBlYXREZWxheTogcmVwZWF0RGVsYXlcbiAgICAgICAgICAgIGRlbGF5OmRlbGF5XG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuXG4gICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIFxuICAgIG9uVHJhY2tMb2FkZWQ6ID0+XG5cbiAgICAgICAgQHRyYWNrSW1hZ2UgPSBAbW9kZWwuZ2V0QXNzZXQoJ3RyYWNrJylcbiAgICAgICAgQGRpc3BsYXlUcmFjaygpXG4gICAgICAgIFxuXG4gICAgb25GcmFtZXNMb2FkZWQ6ID0+XG4gICAgICAgIGlmIHR5cGVvZiBAYXN5bmMgaXMgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgQGFzeW5jKClcbiAgICAgICAgJCh3aW5kb3cpLm9uICdzY3JvbGwnLCAgQGNoZWNrQ29hc3RlclZpc2liaWxpdHlcbiAgICAgICAgQGNoZWNrQ29hc3RlclZpc2liaWxpdHkoKVxuICAgIFxuICAgICAgICBcbiAgICBjaGVja0NvYXN0ZXJWaXNpYmlsaXR5OiA9PlxuICAgICAgICBcbiAgICAgICAgaWYoQGluVmlld3BvcnQoKSlcblxuICAgICAgICAgICAgJCh3aW5kb3cpLm9mZiAnc2Nyb2xsJywgIEBjaGVja0NvYXN0ZXJWaXNpYmlsaXR5XG4gICAgICAgICAgICBAaW5pdEFuaW1hdGlvbigpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICBcbiAgICBpblZpZXdwb3J0OiA9PlxuICAgICAgICBcbiAgICAgICAgdG9wID0gQCRjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgICAgIGhlaWdodCA9IEAkY29udGFpbmVyLmZpbmQoJ2NhbnZhcycpLmZpcnN0KCkuaGVpZ2h0KClcbiAgICAgICAgYm90dG9tID0gdG9wICsgaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKClcbiAgICAgICAgc2Nyb2xsQm90dG9tID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpICsgJCh3aW5kb3cpLmhlaWdodCgpXG5cbiAgICAgICAgaWYgc2Nyb2xsVG9wIDw9IHRvcCA8PSBzY3JvbGxCb3R0b21cbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgXG4gXG5cbm1vZHVsZS5leHBvcnRzID0gRnJhbWVBbmltYXRpb25cbiIsIlxuXG5tYXRjaEZyYW1lTnVtID0gL1xcZCsoPz1cXC5bYS16QS1aXSspL1xuXG5jbGFzcyBGcmFtZXNNb2RlbCBleHRlbmRzIEV2ZW50RW1pdHRlclxuXG5cbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gICAgICAgIEBiYXNlVXJsID0gb3B0cy5iYXNlVXJsXG4gICAgICAgIEB1cmwgPSBvcHRzLnVybFxuICAgICAgICBAbG9hZE1hbmlmZXN0ID0gW107XG4gICAgICAgIEB0cmFja01hbmlmZXN0ID0gW107XG4gICAgICAgIEBpbml0TG9hZGVyKClcbiAgICAgICAgc3VwZXIob3B0cylcbiAgICAgICAgXG5cbiAgICBsb2FkRGF0YTogLT5cbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgICB1cmw6IEBiYXNlVXJsICArIEB1cmxcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIlxuICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgICBzdWNjZXNzOiBAb25EYXRhTG9hZGVkXG4gICAgICAgICAgICBlcnJvcjogQGhhbmRsZUVycm9yXG5cbiAgICBoYW5kbGVFcnJvcjogKGVycikgLT5cbiAgICAgICAgdGhyb3cgZXJyXG5cbiAgICBvbkRhdGFMb2FkZWQ6IChkYXRhKSA9PlxuICAgICAgICBcbiAgICAgICAgQGRhdGEgPSBkYXRhXG4gICAgICAgIEB0cmFuc2Zvcm1EYXRhKClcbiAgICAgICAgQGVtaXQgXCJkYXRhTG9hZGVkXCJcbiAgICAgIFxuXG4gICAgc29ydFNlcXVlbmNlOiAoYSxiKSAtPlxuICAgICAgICBhRnJhbWUgPSBtYXRjaEZyYW1lTnVtLmV4ZWMoYS5maWxlbmFtZSlcbiAgICAgICAgYkZyYW1lID0gbWF0Y2hGcmFtZU51bS5leGVjKGIuZmlsZW5hbWUpXG4gICAgICAgIHJldHVybiBpZiBwYXJzZUludChhRnJhbWVbMF0pIDwgcGFyc2VJbnQoYkZyYW1lWzBdKSB0aGVuIC0xIGVsc2UgMVxuXG4gICAgdHJhbnNmb3JtRGF0YTogLT5cbiAgICAgICAgQGRhdGEubWFuaWZlc3Quc29ydCBAc29ydFNlcXVlbmNlXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgQHRyYWNrTWFuaWZlc3QucHVzaFxuICAgICAgICAgICAgaWQ6XCJ0cmFja1wiXG4gICAgICAgICAgICBzcmM6IFwiI3tAZGF0YS5nbG9iYWwuZm9sZGVyfS8je0BkYXRhLmdsb2JhbC50cmFja31cIlxuXG4gICAgICAgIGZvciBmcmFtZSBpbiBAZGF0YS5tYW5pZmVzdFxuICAgICAgICAgICAgZnJhbWUuc3JjID0gXCIje0BkYXRhLmdsb2JhbC5mb2xkZXJ9LyN7ZnJhbWUuZmlsZW5hbWV9XCJcbiAgICAgICAgICAgIEBsb2FkTWFuaWZlc3QucHVzaFxuICAgICAgICAgICAgICAgIGlkOiBmcmFtZS5maWxlbmFtZVxuICAgICAgICAgICAgICAgIHNyYzogZnJhbWUuc3JjXG5cbiAgICBpbml0TG9hZGVyOiAtPlxuICAgICAgICBAdHJhY2tMb2FkZXIgPSBuZXcgY3JlYXRlanMuTG9hZFF1ZXVlIHRydWUsIEBiYXNlVXJsLCB0cnVlXG4gICAgICAgIEBwcmVsb2FkZXIgPSBuZXcgY3JlYXRlanMuTG9hZFF1ZXVlIHRydWUsIEBiYXNlVXJsLCB0cnVlXG4gICAgICAgIEB0cmFja0xvYWRlci5zZXRNYXhDb25uZWN0aW9ucygxMClcbiAgICAgICAgQHByZWxvYWRlci5zZXRNYXhDb25uZWN0aW9ucygxNSlcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICBwcmVsb2FkVHJhY2s6IC0+XG5cbiAgICAgICAgQHRyYWNrTG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvblRyYWNrQXNzZXRzQ29tcGxldGVcbiAgICAgICAgQHRyYWNrTG9hZGVyLmxvYWRNYW5pZmVzdChAdHJhY2tNYW5pZmVzdClcbiAgICBwcmVsb2FkRnJhbWVzOiAtPlxuIyAgICAgICAgY29uc29sZS5sb2cgQGxvYWRNYW5pZmVzdFxuICAgICAgICBcbiAgICAgICAgQHByZWxvYWRlci5hZGRFdmVudExpc3RlbmVyICdjb21wbGV0ZScgLCBAb25Bc3NldHNDb21wbGV0ZVxuICAgICAgICBAcHJlbG9hZGVyLmxvYWRNYW5pZmVzdChAbG9hZE1hbmlmZXN0KVxuXG4gICAgb25UcmFja0Fzc2V0c0NvbXBsZXRlOiAoZSkgPT5cbiAgICAgICAgXG4gICAgICAgIEB0cmFja0xvYWRlci5yZW1vdmVFdmVudExpc3RlbmVyICdjb21wbGV0ZScgLCBAb25UcmFja0Fzc2V0c0NvbXBsZXRlXG4gICAgICAgIEBlbWl0IFwidHJhY2tMb2FkZWRcIlxuXG4gICAgb25Bc3NldHNDb21wbGV0ZTogKGUpPT5cbiMgICAgICAgIGNvbnNvbGUubG9nIEBwcmVsb2FkZXJcbiAgICAgICAgQHByZWxvYWRlci5yZW1vdmVFdmVudExpc3RlbmVyICdjb21wbGV0ZScgLCBAb25Bc3NldHNDb21wbGV0ZVxuICAgICAgICBAZW1pdCBcImZyYW1lc0xvYWRlZFwiXG5cblxuXG5cbiAgICBnZXRBc3NldDogKGlkKSAtPlxuICAgICAgICBcbiAgICAgICAgaXRlbSA9ICBAcHJlbG9hZGVyLmdldEl0ZW0gaWRcbiAgICAgICAgaWYgIWl0ZW0/XG4gICAgICAgICAgICBpdGVtID0gIEB0cmFja0xvYWRlci5nZXRJdGVtIGlkICAgICAgICBcbiAgICAgICAgcmV0dXJuIGl0ZW1cblxuICAgIGdldDogKGtleSkgLT5cbiAgICAgICAgZm9yIGssdiBvZiBAZGF0YVxuICAgICAgICAgICAgaWYgayBpcyBrZXlcbiAgICAgICAgICAgICAgICByZXR1cm4gdlxuXG4gICAgc2V0OiAoa2V5LCB2YWwpIC0+XG4gICAgICAgIEBkYXRhW2tleV0gPSB2YWxcblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZyYW1lc01vZGVsXG4iLCJcclxuVmlld0Jhc2UgPSByZXF1aXJlIFwiLi4vYWJzdHJhY3QvVmlld0Jhc2UuY29mZmVlXCJcclxuXHJcbmNsYXNzIFNjcm9sbEJhciBleHRlbmRzIFZpZXdCYXNlXHJcblxyXG4gICAgc2Nyb2xsaW5nIDogZmFsc2VcclxuICAgIG9mZnNldFkgOiAwXHJcbiAgICBwb3NpdGlvbiA6IDBcclxuICAgIGhpZGVUaW1lb3V0OiAwXHJcblxyXG5cclxuICAgIGluaXRpYWxpemU6IC0+XHJcbiAgICAgICAgQG9uUmVzaXplKClcclxuICAgICAgICBAc2V0RXZlbnRzKClcclxuXHJcbiAgICAgICAgaWYgd2luZG93LmlzVGllclRhYmxldFxyXG4gICAgICAgICAgICBAJGVsLmhpZGUoKVxyXG5cclxuXHJcblxyXG4gICAgc2V0RXZlbnRzOiA9PlxyXG4gICAgICAgIEBkZWxlZ2F0ZUV2ZW50c1xyXG4gICAgICAgICAgICBcIm1vdXNlZG93biAuaGFuZGxlXCIgOiBcIm9uSGFuZGxlRG93blwiXHJcbiAgICAgICAgICAgICNcIm1vdXNlZW50ZXJcIiA6IFwib25IYW5kbGVVcFwiXHJcbiAgICAgICAgICAgIFwiY2xpY2sgLnJhaWxcIiA6IFwib25SYWlsQ2xpY2tcIlxyXG5cclxuICAgICAgICAkKGRvY3VtZW50KS5vbiBcIm1vdXNldXBcIiAsIEBvbkhhbmRsZVVwXHJcbiAgICAgICAgJChkb2N1bWVudCkub24gXCJtb3VzZW1vdmVcIiAsIEBvbk1vdXNlTW92ZVxyXG5cclxuXHJcbiAgICAgICAgXHJcbiAgICB1cGRhdGVIYW5kbGU6IChwb3MpID0+XHJcbiAgICAgICAgQHBvc2l0aW9uID0gcG9zXHJcbiAgICAgICAgQCRlbC5maW5kKCcuaGFuZGxlJykuY3NzXHJcbiAgICAgICAgICAgIHRvcDogQHBvc2l0aW9uICogKCQod2luZG93KS5oZWlnaHQoKSAtIEAkZWwuZmluZChcIi5oYW5kbGVcIikuaGVpZ2h0KCkpXHJcbiAgICAgICAgQHNob3dTY3JvbGxiYXIoKVxyXG4gICAgICAgIEBoaWRlU2Nyb2xsYmFyKClcclxuXHJcbiAgICBvblJhaWxDbGljazogKGUpID0+XHJcbiAgICAgICAgQG9mZnNldFkgPSBpZiBlLm9mZnNldFkgaXNudCB1bmRlZmluZWQgdGhlbiBlLm9mZnNldFkgZWxzZSBlLm9yaWdpbmFsRXZlbnQubGF5ZXJZXHJcbiAgICAgICAgQHBvc2l0aW9uID0gQG9mZnNldFkgLyAkKHdpbmRvdykuaGVpZ2h0KClcclxuICAgICAgICBAdHJpZ2dlciBcImN1c3RvbVNjcm9sbEp1bXBcIiAsIEBwb3NpdGlvblxyXG4gICAgICAgIFxyXG5cclxuXHJcbiAgICBvbkhhbmRsZURvd246IChlKSA9PlxyXG5cclxuICAgICAgICBAJGVsLmNzc1xyXG4gICAgICAgICAgICB3aWR0aDpcIjEwMCVcIlxyXG4gICAgICAgIEBvZmZzZXRZID0gaWYgZS5vZmZzZXRZIGlzbnQgdW5kZWZpbmVkIHRoZW4gZS5vZmZzZXRZIGVsc2UgZS5vcmlnaW5hbEV2ZW50LmxheWVyWVxyXG4gICAgICAgIEBzY3JvbGxpbmcgPSB0cnVlXHJcblxyXG4gICAgb25IYW5kbGVVcDogKGUpID0+XHJcbiAgICAgICAgQCRlbC5jc3NcclxuICAgICAgICAgICAgd2lkdGg6XCIxNXB4XCJcclxuXHJcbiAgICAgICAgQHNjcm9sbGluZyA9IGZhbHNlXHJcblxyXG4gICAgb25Nb3VzZU1vdmU6IChlKSA9PlxyXG4gICAgICAgIGlmIEBzY3JvbGxpbmdcclxuXHJcbiAgICAgICAgICAgIGlmIGUucGFnZVkgLSBAb2Zmc2V0WSA8PSAwXHJcbiAgICAgICAgICAgICAgICAkKFwiLmhhbmRsZVwiKS5jc3NcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IDFcclxuICAgICAgICAgICAgZWxzZSBpZiBlLnBhZ2VZIC0gQG9mZnNldFkgPj0gJCh3aW5kb3cpLmhlaWdodCgpIC0gJChcIiNzY3JvbGxiYXIgLmhhbmRsZVwiKS5oZWlnaHQoKVxyXG4gICAgICAgICAgICAgICAgXHJcblxyXG4gICAgICAgICAgICAgICAgJChcIi5oYW5kbGVcIikuY3NzXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAgICgkKHdpbmRvdykuaGVpZ2h0KCkgLSAkKFwiI3Njcm9sbGJhciAuaGFuZGxlXCIpLmhlaWdodCgpKSAtIDFcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgJChcIi5oYW5kbGVcIikuY3NzXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBlLnBhZ2VZIC0gQG9mZnNldFlcclxuXHJcblxyXG4gICAgICAgICAgICBAcG9zaXRpb24gPSBwYXJzZUludCgkKFwiI3Njcm9sbGJhciAuaGFuZGxlXCIpLmNzcyhcInRvcFwiKSkgLyAoJCh3aW5kb3cpLmhlaWdodCgpIC0gJChcIiNzY3JvbGxiYXIgLmhhbmRsZVwiKS5oZWlnaHQoKSlcclxuXHJcbiAgICAgICAgICAgIGlmIEBwb3NpdGlvbiA8IHBhcnNlRmxvYXQoLjAwNSlcclxuICAgICAgICAgICAgICAgIEBwb3NpdGlvbiA9IDBcclxuICAgICAgICAgICAgZWxzZSBpZiBAcG9zaXRpb24gPiBwYXJzZUZsb2F0KC45OTUpXHJcbiAgICAgICAgICAgICAgICBAcG9zaXRpb24gPSAxXHJcblxyXG5cclxuICAgICAgICAgICAgQHRyaWdnZXIgXCJjdXN0b21TY3JvbGxcIiAsIEBwb3NpdGlvblxyXG4gICAgICAgICAgXHJcbiAgIFxyXG4gICAgICAgIGlmIEBtb3VzZVggaXNudCBlLmNsaWVudFggYW5kIEBtb3VzZVkgaXNudCBlLmNsaWVudFlcclxuICAgICAgICAgICAgQHNob3dTY3JvbGxiYXIoKVxyXG4gICAgICAgICAgICBAaGlkZVNjcm9sbGJhcigpXHJcblxyXG4gICAgICAgIEBtb3VzZVggPSBlLmNsaWVudFhcclxuICAgICAgICBAbW91c2VZID0gZS5jbGllbnRZXHJcblxyXG4gICAgb25SZXNpemU6IChlKSA9PlxyXG5cclxuXHJcbiAgICAgICAgQCRlbC5maW5kKCcuaGFuZGxlJykuY3NzXHJcbiAgICAgICAgICAgIGhlaWdodDogKCQod2luZG93KS5oZWlnaHQoKSAvICQoXCJzZWN0aW9uXCIpLmhlaWdodCgpICkgKiAkKHdpbmRvdykuaGVpZ2h0KClcclxuXHJcbiAgICAgICAgQHVwZGF0ZUhhbmRsZShAcG9zaXRpb24pXHJcblxyXG5cclxuICAgIGhpZGVTY3JvbGxiYXI6ID0+XHJcbiAgICAgICAgaWYgQGhpZGVUaW1lb3V0P1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoQGhpZGVUaW1lb3V0KVxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICBAaGlkZVRpbWVvdXQgPSBzZXRUaW1lb3V0ICg9PlxyXG4gICAgICAgICAgICBpZiBAbW91c2VZID4gNzJcclxuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvIEAkZWwsIC41ICxcclxuICAgICAgICAgICAgICAgICAgICBhdXRvQWxwaGE6IDBcclxuICAgICAgICAgICAgKSAsIDIwMDBcclxuICAgICAgICBcclxuXHJcbiAgICBzaG93U2Nyb2xsYmFyOiA9PlxyXG4gICAgICAgIFR3ZWVuTWF4LnRvIEAkZWwgLCAuNSAsXHJcbiAgICAgICAgICAgIGF1dG9BbHBoYTogLjVcclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTY3JvbGxCYXIiLCJcclxuXHJcbmNsYXNzIFNoYXJlclxyXG5cclxuICAgIFxyXG4gICAgU2hhcmVyLmluaXRGYWNlYm9vayA9IC0+XHJcbiAgICAgICAgRkIuaW5pdCBcclxuICAgICAgICAgICAgYXBwSWQ6XCIyMTUyMjQ3MDUzMDczNDFcIlxyXG4gICAgICAgICAgICBjaGFubmVsVXJsOlwiL2NoYW5uZWwuaHRtbFwiXHJcbiAgICAgICAgICAgIHN0YXR1czogdHJ1ZVxyXG4gICAgICAgICAgICB4ZmJsOiB0cnVlXHJcblxyXG5cclxuICAgICAgICBcclxuICAgIFxyXG4gICAgU2hhcmVyLnNoYXJlVHdpdHRlciA9IChzaGFyZU1lc3NhZ2UsICB1cmwsIGhhc2h0YWdzKSAtPlxyXG4gICAgICAgIHRleHQgPSBzaGFyZU1lc3NhZ2VcclxuICAgICAgICBoYXNodGFncyA9IFwiXCJcclxuICAgICAgICB1cmwgPSB1cmxcclxuICAgICAgICB0d1VSTCA9IFwiaHR0cHM6Ly90d2l0dGVyLmNvbS9pbnRlbnQvdHdlZXQ/dGV4dD1cIiArIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KSArIFwiJnVybD1cIiArIGVuY29kZVVSSUNvbXBvbmVudCh1cmwpXHJcbiAgICAgICAgc3RyICs9IFwiJmhhc2h0YWdzPVwiICsgaGFzaHRhZ3MgIGlmIGhhc2h0YWdzXHJcbiAgICAgICAgQG9wZW5Qb3B1cCA1NzUsIDQyMCwgdHdVUkwsIFwiVHdpdHRlclwiXHJcblxyXG4gICAgU2hhcmVyLnNoYXJlRmFjZWJvb2sgPSAobmFtZSwgIGNhcHRpb24gLGRlc2NyaXB0aW9uICwgbGluayAsIHBpY3R1cmUpIC0+XHJcblxyXG4gICAgICAgIEZCLnVpXHJcbiAgICAgICAgICAgIG1ldGhvZDpcImZlZWRcIlxyXG4gICAgICAgICAgICBsaW5rOmxpbmtcclxuICAgICAgICAgICAgcGljdHVyZTpwaWN0dXJlXHJcbiAgICAgICAgICAgIG5hbWU6IG5hbWVcclxuICAgICAgICAgICAgY2FwdGlvbjpjYXB0aW9uXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOmRlc2NyaXB0aW9uXHJcbiAgICAgICAgXHJcblxyXG4gICAgU2hhcmVyLnNoYXJlR29vZ2xlID0gKHVybCkgLT5cclxuXHJcbiAgICAgICAgQG9wZW5Qb3B1cCA2MDAsIDQwMCAsIFwiaHR0cHM6Ly9wbHVzLmdvb2dsZS5jb20vc2hhcmU/dXJsPVwiK3VybCwgXCJHb29nbGVcIlxyXG5cclxuICAgIFNoYXJlci5zaGFyZVBpbnRlcmVzdCA9ICh1cmwgLCBkZXNjcmlwdGlvbiwgcGljdHVyZSkgLT5cclxuXHJcbiAgICAgICAgZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbi5zcGxpdChcIiBcIikuam9pbihcIitcIilcclxuICAgICAgICBAb3BlblBvcHVwIDc4MCwgMzIwLCBcImh0dHA6Ly9waW50ZXJlc3QuY29tL3Bpbi9jcmVhdGUvYnV0dG9uLz91cmw9I3tlbmNvZGVVUklDb21wb25lbnQodXJsKX0mYW1wO2Rlc2NyaXB0aW9uPSN7ZGVzY3JpcHRpb259JmFtcDttZWRpYT0je2VuY29kZVVSSUNvbXBvbmVudChwaWN0dXJlKX1cIlxyXG5cclxuXHJcbiAgICBTaGFyZXIuZW1haWxMaW5rID0gKHN1YmplY3QsIGJvZHkpIC0+XHJcbiAgICAgICAgeCA9IEBvcGVuUG9wdXAgMSAsIDEsIFwibWFpbHRvOiZzdWJqZWN0PSN7ZW5jb2RlVVJJQ29tcG9uZW50KHN1YmplY3QpfSZib2R5PSN7ZW5jb2RlVVJJQ29tcG9uZW50KGJvZHkpfVwiXHJcbiAgICAgICAgeC5jbG9zZSgpXHJcblxyXG4gICAgU2hhcmVyLm9wZW5Qb3B1cCA9ICh3LCBoLCB1cmwsIG5hbWUpIC0+XHJcbiAgICAgICAgd2luZG93Lm9wZW4gdXJsLCBuYW1lLCBcInN0YXR1cz0xLHdpZHRoPVwiICsgdyArIFwiLGhlaWdodD1cIiArIGggKyBcIixsZWZ0PVwiICsgKHNjcmVlbi53aWR0aCAtIHcpIC8gMiArIFwiLHRvcD1cIiArIChzY3JlZW4uaGVpZ2h0IC0gaCkgLyAyXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTaGFyZXIiLCJnbG9iYWxzID0gcmVxdWlyZSAnLi9jb20vZ2xvYmFsL2luZGV4LmNvZmZlZSdcblBhcmtzTGlzdCA9IHJlcXVpcmUgJy4vY29tL3BsdWdpbnMvUGFya3NMaXN0LmNvZmZlZSdcbkRyYWdnYWJsZUdhbGxlcnkgPSByZXF1aXJlICcuL2NvbS9wbHVnaW5zL0RyYWdnYWJsZUdhbGxlcnkuY29mZmVlJ1xuRmFkZUdhbGxlcnkgPSByZXF1aXJlICcuL2NvbS9wbHVnaW5zL0ZhZGVHYWxsZXJ5LmNvZmZlZSdcblBhcnRuZXJzaGlwRGV0YWlsUGFnZSA9IHJlcXVpcmUgJy4vY29tL3BhZ2VzL1BhcnRuZXJzaGlwRGV0YWlsUGFnZS5jb2ZmZWUnXG5cblxuJChkb2N1bWVudCkucmVhZHkgLT5cblxuICAgIHBhcnRuZXJzaGlwRGV0YWlscyA9IG5ldyBQYXJ0bmVyc2hpcERldGFpbFBhZ2VcbiAgICAgICAgZWw6IFwiYm9keVwiXG4iXX0=
