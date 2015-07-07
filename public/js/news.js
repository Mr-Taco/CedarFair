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



},{"../plugins/BasicOverlay.coffee":9,"../plugins/SvgInject.coffee":17}],5:[function(require,module,exports){
var AnimationBase, DraggableGallery, FadeGallery, FormHandler, FrameAnimation, HeaderAnimation, NewsPage, NewsRoom, ParksList, ResizeButtons, animations, globalAnimations,
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

NewsRoom = require('../plugins/NewsRoom.coffee');

FormHandler = require('../plugins/FormHandler.coffee');

animations = require('./animations/news.coffee');

globalAnimations = require('./animations/global.coffee');

NewsPage = (function(superClass) {
  extend(NewsPage, superClass);

  function NewsPage(el) {
    this.resetTimeline = bind(this.resetTimeline, this);
    this.findDeepLink = bind(this.findDeepLink, this);
    this.removeDeepLink = bind(this.removeDeepLink, this);
    this.totalAnimationTime = 25;
    NewsPage.__super__.constructor.call(this, el);
  }

  NewsPage.prototype.initialize = function() {
    return NewsPage.__super__.initialize.call(this);
  };

  NewsPage.prototype.initComponents = function() {
    var coaster, newsform, newsroom;
    NewsPage.__super__.initComponents.call(this);
    newsform = new FormHandler({
      el: '#news-form'
    });
    newsroom = new NewsRoom({
      el: '#select-news',
      isPhone: this.isPhone
    });
    if (!this.isPhone) {
      coaster = new FrameAnimation({
        id: "news-coaster-1",
        el: "#news-section1",
        baseUrl: this.cdnRoot + "coasters/",
        url: "shot-2/data.json"
      });
      coaster.loadFrames();
    } else {
      $('#news-select').cfDropdown({
        onSelect: function(t) {
          var id;
          id = $(t).data('id');
          return newsroom.switchToPage(id);
        }
      });
    }
    $('.overlay-close-button, #basic-overlay').on('click', this.removeDeepLink);
    $('a.news.story').on('click', function() {
      var lastpart;
      lastpart = $(this).data('link');
      return history.pushState({
        id: lastpart
      }, '', '/news/article/' + lastpart);
    });
    return this.findDeepLink();
  };

  NewsPage.prototype.removeDeepLink = function() {
    return history.pushState({
      id: 'news'
    }, '', '/news');
  };

  NewsPage.prototype.findDeepLink = function() {
    var lastpart, location, parts;
    location = window.location.href;
    parts = location.split('/');
    if ($.inArray('article', parts) > -1) {
      lastpart = parts[parts.length - 1];
      return $('.post .news.story').each(function(i, o) {
        var year;
        if ($(o).data('link') === lastpart) {
          $('.news-year-wrapper').removeClass('visible');
          $(o).parents('.news-year-wrapper').addClass('visible');
          year = $(o).parents('.news-year-wrapper').data('year');
          $('.select-news-year-wrapper a').removeClass('active').each(function(i, a) {
            if (parseInt($(a).text()) === year) {
              return $(a).addClass('active');
            }
          });
          return $(o).trigger('click');
        }
      });
    }
  };

  NewsPage.prototype.resetTimeline = function() {
    NewsPage.__super__.resetTimeline.call(this);
    if (!this.isPhone) {
      return this.triggers.push(animations.selectBox());
    }
  };

  return NewsPage;

})(AnimationBase);

module.exports = NewsPage;



},{"../abstract/AnimationBase.coffee":1,"../plugins/DraggableGallery.coffee":10,"../plugins/FadeGallery.coffee":11,"../plugins/FormHandler.coffee":12,"../plugins/HeaderAnimation.coffee":13,"../plugins/NewsRoom.coffee":14,"../plugins/ParksList.coffee":15,"../plugins/ResizeButtons.coffee":16,"../plugins/coasters/FrameAnimation.coffee":19,"./animations/global.coffee":7,"./animations/news.coffee":8}],6:[function(require,module,exports){
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

module.exports.selectBox = function() {
  var $el, tween;
  $el = $('#news #select-news');
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



},{"../abstract/PluginBase.coffee":2,"./VideoOverlay.coffee":18}],12:[function(require,module,exports){
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
var NewsRoom, PluginBase,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PluginBase = require('../abstract/PluginBase.coffee');

NewsRoom = (function(superClass) {
  extend(NewsRoom, superClass);

  function NewsRoom(opts) {
    this.resizeNewsContainer = bind(this.resizeNewsContainer, this);
    this.switchToPage = bind(this.switchToPage, this);
    this.switchPage = bind(this.switchPage, this);
    this.switchYears = bind(this.switchYears, this);
    this.$el = $(opts.el);
    this.isPhone = opts.isPhone;
    NewsRoom.__super__.constructor.call(this, opts);
  }

  NewsRoom.prototype.initialize = function() {
    this.resizeNewsContainer();
    return NewsRoom.__super__.initialize.call(this);
  };

  NewsRoom.prototype.addEvents = function() {
    $('.select-news-year-wrapper').on('click', 'a', this.switchYears);
    return $('.select-news-button-wrapper').on('click', 'a', this.switchPage);
  };

  NewsRoom.prototype.switchYears = function(e) {
    var activeYear, targetYear;
    if ($(e.target).hasClass('active')) {
      return false;
    }
    e.preventDefault();
    activeYear = $('.select-news-posts-wrapper .news-year-wrapper.visible');
    targetYear = $('.select-news-posts-wrapper .news-year-wrapper.' + $(e.target).text());
    $('.select-news-year-wrapper a').removeClass('active');
    $(e.target).addClass('active');
    activeYear.removeClass('visible');
    targetYear.addClass('visible');
    return this.resizeNewsContainer();
  };

  NewsRoom.prototype.switchPage = function(e) {
    var activePage, targetPage;
    if ($(e.target).hasClass('active')) {
      return false;
    }
    e.preventDefault();
    activePage = $('.select-news-pages-wrapper').children('div.visible');
    targetPage = $('.' + $(e.target).data('page'));
    $('.select-news-button-wrapper a').removeClass('active');
    $(e.target).addClass('active');
    activePage.removeClass('visible');
    return targetPage.addClass('visible');
  };

  NewsRoom.prototype.switchToPage = function(target) {
    var activePage, targetPage;
    activePage = $('.select-news-pages-wrapper').children('div.visible');
    targetPage = $('.' + target);
    console.log(target);
    activePage.removeClass('visible');
    return targetPage.addClass('visible');
  };

  NewsRoom.prototype.resizeNewsContainer = function() {
    var activeWrapper, activeYear, height, i, len, post, postHeight, ref;
    activeYear = $('.select-news-year-wrapper a.active').text();
    activeWrapper = $('.news-year-wrapper.' + activeYear);
    height = 0;
    ref = $(activeWrapper).find('.post');
    for (i = 0, len = ref.length; i < len; i++) {
      post = ref[i];
      postHeight = $(post).height();
      height = height + postHeight;
    }
    $('.select-news-posts-wrapper').css('height', height);
    if (this.isPhone) {
      height = $('.select-news-media-form').height() > height ? $('.select-news-media-form').height() : height;
      return $('.select-news-pages-wrapper').css('height', eval(height + 75) + 'px');
    }
  };

  return NewsRoom;

})(PluginBase);

module.exports = NewsRoom;



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
var DraggableGallery, FadeGallery, HeaderAnimation, NewsPage, ParksList;

DraggableGallery = require('./com/plugins/DraggableGallery.coffee');

FadeGallery = require('./com/plugins/FadeGallery.coffee');

ParksList = require('./com/plugins/ParksList.coffee');

HeaderAnimation = require('./com/plugins/HeaderAnimation.coffee');

NewsPage = require('./com/pages/NewsPage.coffee');

$(document).ready(function() {
  var jobs;
  return jobs = new NewsPage({
    el: "body"
  });
});



},{"./com/pages/NewsPage.coffee":5,"./com/plugins/DraggableGallery.coffee":10,"./com/plugins/FadeGallery.coffee":11,"./com/plugins/HeaderAnimation.coffee":13,"./com/plugins/ParksList.coffee":15}]},{},[23])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvQW5pbWF0aW9uQmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vYWJzdHJhY3QvVmlld0Jhc2UuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL2dsb2JhbC9pbmRleC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvTmV3c1BhZ2UuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BhZ2VzL2FuaW1hdGlvbnMvY2xvdWRzLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wYWdlcy9hbmltYXRpb25zL2dsb2JhbC5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGFnZXMvYW5pbWF0aW9ucy9uZXdzLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0Jhc2ljT3ZlcmxheS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9EcmFnZ2FibGVHYWxsZXJ5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0ZhZGVHYWxsZXJ5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0Zvcm1IYW5kbGVyLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL0hlYWRlckFuaW1hdGlvbi5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9OZXdzUm9vbS5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9QYXJrc0xpc3QuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvUmVzaXplQnV0dG9ucy5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vcGx1Z2lucy9TdmdJbmplY3QuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvY29tL3BsdWdpbnMvVmlkZW9PdmVybGF5LmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL2NvYXN0ZXJzL0ZyYW1lQW5pbWF0aW9uLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS9wbHVnaW5zL2NvYXN0ZXJzL0ZyYW1lc01vZGVsLmNvZmZlZSIsIi9Vc2Vycy9waGlsYnJhZHkvU2l0ZXMvY2VkYXItZmFpci13ZWItc2l0ZS9zcmMvYXBwL2NvbS91dGlsL1Njcm9sbEJhci5jb2ZmZWUiLCIvVXNlcnMvcGhpbGJyYWR5L1NpdGVzL2NlZGFyLWZhaXItd2ViLXNpdGUvc3JjL2FwcC9jb20vdXRpbC9TaGFyZXIuY29mZmVlIiwiL1VzZXJzL3BoaWxicmFkeS9TaXRlcy9jZWRhci1mYWlyLXdlYi1zaXRlL3NyYy9hcHAvbmV3cy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNDQSxJQUFBLDJEQUFBO0VBQUE7OzZCQUFBOztBQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsbUJBQVIsQ0FBWCxDQUFBOztBQUFBLFNBQ0EsR0FBWSxPQUFBLENBQVEsMEJBQVIsQ0FEWixDQUFBOztBQUFBLGVBRUEsR0FBa0IsT0FBQSxDQUFRLG1DQUFSLENBRmxCLENBQUE7O0FBQUEsTUFHQSxHQUFTLE9BQUEsQ0FBUSxtQ0FBUixDQUhULENBQUE7O0FBQUE7QUFRSSxtQ0FBQSxDQUFBOztBQUFhLEVBQUEsdUJBQUMsRUFBRCxHQUFBO0FBQ1QseURBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEseUNBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEsSUFBQSwrQ0FBTSxFQUFOLENBQUEsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQURaLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FGVixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsVUFBRCxHQUFjLENBSGQsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLGtCQUFELEdBQXlCLElBQUMsQ0FBQSxRQUFKLEdBQWtCLEVBQWxCLEdBQTBCLENBSmhELENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxZQUFELEdBQWdCLENBTGhCLENBQUE7QUFBQSxJQU1BLElBQUMs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SmxCLENBQUE7O0FBQUEsUUFLQSxHQUFXLE9BQUEsQ0FBUSw2QkFBUixDQUxYLENBQUE7O0FBQUEsQ0FRQSxDQUFFLFFBQUYsQ0FBVyxDQUFDLEtBQVosQ0FBa0IsU0FBQSxHQUFBO0FBSWQsTUFBQSxJQUFBO1NBQUEsSUFBQSxHQUFXLElBQUEsUUFBQSxDQUNQO0FBQUEsSUFBQSxFQUFBLEVBQUksTUFBSjtHQURPLEVBSkc7QUFBQSxDQUFsQixDQVJBLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5WaWV3QmFzZSA9IHJlcXVpcmUgXCIuL1ZpZXdCYXNlLmNvZmZlZVwiXG5TY3JvbGxCYXIgPSByZXF1aXJlIFwiLi4vdXRpbC9TY3JvbGxCYXIuY29mZmVlXCJcbkhlYWRlckFuaW1hdGlvbiA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvSGVhZGVyQW5pbWF0aW9uLmNvZmZlZSdcbmNsb3VkcyA9IHJlcXVpcmUgJy4uL3BhZ2VzL2FuaW1hdGlvbnMvY2xvdWRzLmNvZmZlZSdcblxuY2xhc3MgQW5pbWF0aW9uQmFzZSBleHRlbmRzIFZpZXdCYXNlXG5cblxuICAgIGNvbnN0cnVjdG9yOiAoZWwpIC0+XG4gICAgICAgIHN1cGVyKGVsKVxuICAgICAgICBAdGltZWxpbmUgPSBudWxsXG4gICAgICAgIEB0b3VjaFkgPSAwXG4gICAgICAgIEB0b3VjaFlMYXN0ID0gMFxuICAgICAgICBAZ2xvYmFsU2Nyb2xsQW1vdW50ID0gaWYgQGlzVGFibGV0IHRoZW4gLjUgZWxzZSAxXG4gICAgICAgIEBwcmV2U2Nyb2xsVG8gPSAwXG4gICAgICAgIEBwcmV2RGVsdGEgPSAwXG4gICAgICAgIEBjdXJyZW50UHJvZ3Jlc3MgPSAwXG4gICAgICAgIEB0b3RhbEFuaW1hdGlvblRpbWUgPSAxMFxuICAgICAgICBAc21vb3RoTXVsdGlwbGllciA9IDVcbiAgICAgICAgQG5hdlRpbWVyID0gbnVsbFxuICAgICAgICBAdmlkZW8gPSBudWxsXG4gICAgICAgIEBpbmxpbmVWaWRlbyA9IG51bGxcbiAgICAgICAgQGlzVGFibGV0ID0gJCgnaHRtbCcpLmhhc0NsYXNzKCd0YWJsZXQnKVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgICAgIGlmICFAaXNQaG9uZSAgXG4gICAgICAgICAgICBAcmVzZXRUaW1lbGluZSgpXG4gICAgICAgICAgICBAdG9nZ2xlVG91Y2hNb3ZlKClcbiAgICAgICAgICAgIEBvblJlc2l6ZSgpXG4gICAgICAgICAgICBAdXBkYXRlVGltZWxpbmUoKVxuXG4gICAgaW5pdENvbXBvbmVudHM6IC0+XG4gICAgICAgIEBoZWFkZXIgPSBuZXcgSGVhZGVyQW5pbWF0aW9uIFxuICAgICAgICAgICAgZWw6J2hlYWRlcidcblxuICAgIFxuXG5cbiAgICB0b2dnbGVUb3VjaE1vdmU6ICgpID0+XG4gICAgICAgICQoZG9jdW1lbnQpLm9mZiAnc2Nyb2xsJyAsIEBvblNjcm9sbFxuICAgICAgICBcbiAgICAgICAgQHNjcm9sbCA9XG4gICAgICAgICAgICBwb3NpdGlvbjogMFxuICAgICAgICAgICAgc2Nyb2xsVG9wOiAwXG4gICAgICAgICQoZG9jdW1lbnQpLnNjcm9sbCBAb25TY3JvbGxcbiAgICAgICAgQG9uU2Nyb2xsKClcblxuXG4gICAgZ2V0U2Nyb2xsYWJsZUFyZWE6IC0+XG4gICAgICAgIE1hdGguYWJzKCQoXCIjY29udGVudFwiKS5vdXRlckhlaWdodCgpIC0gQHN0YWdlSGVpZ2h0KVxuICAgIFxuICAgIGdldFNjcm9sbFRvcDogLT5cbiAgICAgICAgJChkb2N1bWVudCkuc2Nyb2xsVG9wKCkgLyBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAgICAgXG4gICAgXG4gICAgXG4gICAgc2V0U2Nyb2xsVG9wOiAocGVyKSAtPiAgICAgIFxuICAgICAgICBwb3MgPSBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAqIHBlclxuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8gMCAsIHBvc1xuXG5cbiAgICBzZXREcmFnZ2FibGVQb3NpdGlvbjogKHBlcikgLT4gICAgICAgIFxuICAgICAgICBwb3MgPSBAZ2V0U2Nyb2xsYWJsZUFyZWEoKSAqIHBlciAgICAgICAgXG4gICAgICAgIFR3ZWVuTWF4LnNldCAkKFwiI2NvbnRlbnRcIikgLFxuICAgICAgICAgICAgeTogLXBvcyBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgb25TY3JvbGw6IChlKSA9PlxuICAgICAgICBpZiAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSA+IDMwXG4gICAgICAgICAgICAkKCcuY2lyYy1idG4td3JhcHBlcicpLmFkZENsYXNzICdpbnZpc2libGUnXG4gICAgICAgICAgICBcbiAgICAgICAgQHNjcm9sbC5wb3NpdGlvbiA9IEBnZXRTY3JvbGxUb3AoKVxuICAgICAgICBAc2Nyb2xsLnNjcm9sbFRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpXG4gICAgICAgIEB1cGRhdGVUaW1lbGluZSgpICAgICAgICBcbiAgICAgICAgXG5cbiAgICBvbkRyYWc6IChlKSA9PlxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEBzY3JvbGwucG9zaXRpb24gPSBNYXRoLmFicyBAc2Nyb2xsLnkgLyAgQGdldFNjcm9sbGFibGVBcmVhKClcbiAgICAgICAgQHNjcm9sbC5zY3JvbGxUb3AgPSAtQHNjcm9sbC55XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIEB1cGRhdGVUaW1lbGluZSgpXG5cblxuICAgIG9uUmVzaXplOiA9PlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIGlmICFAaXNUYWJsZXRcbiAgICAgICAgICAgIEByZXNldFRpbWVsaW5lKClcbiAgICAgICAgICAgIFxuICAgICAgICBAY2VudGVyT2Zmc2V0ID0gKEBzdGFnZUhlaWdodCAqIC42NjY3KVxuICAgICAgICBpZiBAc2Nyb2xsP1xuICAgICAgICAgICAgcG9zID0gQHNjcm9sbC5wb3NpdGlvbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQHRvZ2dsZVRvdWNoTW92ZSgpXG4gICAgICAgICAgICBpZiAhQGlzVGFibGV0XG4gICAgICAgICAgICAgICAgQHNldFNjcm9sbFRvcChwb3MpXG4gICAgICAgICAgICBcblxuICAgIHJlc2V0VGltZWxpbmU6ID0+XG4gICAgICAgIEB0aW1lbGluZSA9IG5ldyBUaW1lbGluZU1heFxuICAgICAgICBAdHJpZ2dlcnMgPSBbXVxuICAgICAgICBAcGFyYWxsYXggPSBbXVxuXG4gICAgICAgICQoJ1tkYXRhLWNsb3VkXScpLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgICRlbCA9ICQodClcbiAgICAgICAgICAgICRjbG9zZXN0Q29udGFpbmVyID0gJGVsLmNsb3Nlc3QoJ1tkYXRhLWNsb3VkLWNvbnRhaW5lcl0nKVxuICAgICAgICAgICAgaW5pdFBvcyA9ICRjbG9zZXN0Q29udGFpbmVyLmRhdGEoKS5jbG91ZENvbnRhaW5lci5pbml0UG9zXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2xvdWRGdW5jdGlvbiA9IGNsb3Vkc1xuICAgICAgICAgICAgICAgICRlbDokZWxcblxuICAgICAgICAgICAgaWYgaW5pdFBvcyBcbiAgICAgICAgICAgICAgICBjbG91ZEZ1bmN0aW9uKGluaXRQb3MpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAcGFyYWxsYXgucHVzaCBjbG91ZEZ1bmN0aW9uXG5cbiAgICB1cGRhdGVUaW1lbGluZTogPT5cbiAgICAgICAgXG4gICAgICAgIEBoZWFkZXIuYW5pbWF0ZUhlYWRlcihAc2Nyb2xsLnNjcm9sbFRvcClcblxuICAgICAgICBmb3IgdCBpbiBAdHJpZ2dlcnNcbiAgICAgICAgICAgIGlmIEBzY3JvbGwuc2Nyb2xsVG9wID4gdC5vZmZzZXQgLSBAY2VudGVyT2Zmc2V0XG4gICAgICAgICAgICAgICAgdC5hLnBsYXkoKVxuICAgICAgICAgICAgZWxzZSBpZiBAc2Nyb2xsLnNjcm9sbFRvcCArIEBzdGFnZUhlaWdodCA8IHQub2Zmc2V0XG4gICAgICAgICAgICAgICAgdC5hLnBhdXNlZCh0cnVlKVxuICAgICAgICAgICAgICAgIHQuYS5zZWVrKDApXG5cblxuICAgICAgICBmb3IgcCBpbiBAcGFyYWxsYXhcbiAgICAgICAgICAgIHAoQHNjcm9sbC5wb3NpdGlvbilcblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25CYXNlXG4iLCJjbGFzcyBQbHVnaW5CYXNlIGV4dGVuZHMgRXZlbnRFbWl0dGVyXG5cblxuXG4gICAgY29uc3RydWN0b3I6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcigpXG4gICAgICAgIEAkZWwgPSBpZiBvcHRzLmVsPyB0aGVuICQgb3B0cy5lbFxuXG4gICAgICAgIEBpbml0aWFsaXplKG9wdHMpXG5cblxuXG5cbiAgICBpbml0aWFsaXplOiAob3B0cykgLT5cbiAgICAgICAgQGFkZEV2ZW50cygpXG5cbiAgICBhZGRFdmVudHM6IC0+XG5cblxuXG4gICAgcmVtb3ZlRXZlbnRzOiAtPlxuXG5cbiAgICBkZXN0cm95OiAtPlxuICAgICAgICBAcmVtb3ZlRXZlbnRzKClcblxuXG5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsdWdpbkJhc2VcblxuIiwiXG5TaGFyZXIgPSByZXF1aXJlIFwiLi4vdXRpbC9TaGFyZXIuY29mZmVlXCIgXG5cblxuY2xhc3MgVmlld0Jhc2UgZXh0ZW5kcyBFdmVudEVtaXR0ZXJcblxuXG5cblxuXG4gICAgY29uc3RydWN0b3I6IChlbCkgLT5cblxuICAgICAgICBAJGVsID0gJChlbClcbiAgICAgICAgQGlzVGFibGV0ID0gJChcImh0bWxcIikuaGFzQ2xhc3MoXCJ0YWJsZXRcIilcbiAgICAgICAgQGlzUGhvbmUgPSAkKFwiaHRtbFwiKS5oYXNDbGFzcyhcInBob25lXCIpXG4gICAgICAgIEBjZG5Sb290ID0gJCgnYm9keScpLmRhdGEoJ2NkbicpIG9yIFwiL1wiXG4gICAgICAgICQod2luZG93KS5vbiBcInJlc2l6ZS5hcHBcIiAsIEBvblJlc2l6ZVxuXG4gICAgICAgIEBzdGFnZUhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICBAc3RhZ2VXaWR0aCA9ICQod2luZG93KS53aWR0aCgpXG4gICAgICAgIEBtb3VzZVggPSAwXG4gICAgICAgIEBtb3VzZVkgPSAwXG5cbiAgICAgICAgI0BkZWxlZ2F0ZUV2ZW50cyhAZ2VuZXJhdGVFdmVudHMoKSlcbiAgICAgICAgQGluaXRpYWxpemUoKVxuXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBAaW5pdENvbXBvbmVudHMoKVxuXG4gICAgaW5pdENvbXBvbmVudHM6IC0+XG5cbiAgICBvblJlc2l6ZTogPT5cbiAgICAgICAgQHN0YWdlSGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXG4gICAgICAgIEBzdGFnZVdpZHRoID0gJCh3aW5kb3cpLndpZHRoKClcblxuXG4gICAgZ2VuZXJhdGVFdmVudHM6IC0+XG4gICAgICAgIHJldHVybiB7fVxuXG5cbm1vZHVsZS5leHBvcnRzID0gVmlld0Jhc2VcbiIsIkJhc2ljT3ZlcmxheSA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvQmFzaWNPdmVybGF5LmNvZmZlZSdcblN2Z0luamVjdCA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvU3ZnSW5qZWN0LmNvZmZlZSdcblxuXG5cbmlmIHdpbmRvdy5jb25zb2xlIGlzIHVuZGVmaW5lZCBvciB3aW5kb3cuY29uc29sZSBpcyBudWxsXG4gIHdpbmRvdy5jb25zb2xlID1cbiAgICBsb2c6IC0+XG4gICAgd2FybjogLT5cbiAgICBmYXRhbDogLT5cblxuXG5cbiQoZG9jdW1lbnQpLnJlYWR5IC0+XG4gICAgIyQoJy5zdmctaW5qZWN0Jykuc3ZnSW5qZWN0KClcbiAgICAjbmV3IFN2Z0luamVjdCBcIi5zdmctaW5qZWN0XCJcbiAgICBcbiAgICBiYXNpY092ZXJsYXlzID0gbmV3IEJhc2ljT3ZlcmxheVxuICAgICAgICBlbDogJCgnI2NvbnRlbnQnKVxuXG5cbiAgICAkKCcuc2Nyb2xsdG8nKS5jbGljayAtPlxuICAgICAgIHQgPSAkKHRoaXMpLmRhdGEoJ3RhcmdldCcpXG4gICAgICAgJCgnYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiAkKCcjJyt0KS5vZmZzZXQoKS50b3AgLSA3MCAjIDcwIGZvciB0aGUgY29sbGFwc2VkIGhlYWRlclxuICAgICAgICB9KTtcblxuICAgICNpZiB3aW5kb3cuZGRscz9cbiAgICAjIGNvbnNvbGUubG9nICdjbGlja3knXG4gICAgJCh3aW5kb3cpLmNsaWNrIC0+XG4gICAgICAgIGlmIHdpbmRvdy5kZGxzP1xuICAgICAgICAgICAgJC5lYWNoIHdpbmRvdy5kZGxzLCAoaSwgdCkgLT5cbiAgICAgICAgICAgICAgICBpZiB0LmlzT3BlbiBhbmQgbm90IHQuaXNIb3ZlcmVkXG4gICAgICAgICAgICAgICAgICAgIHQuY2xvc2VNZW51KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAkKCdbZGF0YS1kZXB0aF0nKS5lYWNoIC0+XG4gICAgICAgICRlbCA9ICQoQClcbiAgICAgICAgZGVwdGggPSAkZWwuZGF0YSgpLmRlcHRoXG4gICAgICAgIFxuICAgICAgICAkZWwuY3NzKCd6LWluZGV4JywgZGVwdGgpXG4gICAgICAgIFR3ZWVuTWF4LnNldCAkZWwgLCBcbiAgICAgICAgICAgIHo6IGRlcHRoICogMTBcblxuXG5cbiAgICAkKCdib2R5Jykub24gJ0RPTU5vZGVJbnNlcnRlZCcsICAtPlxuICAgICAgICAkKCdhJykuZWFjaCAtPiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGhyZWYgPSAkKEApLmF0dHIoJ2hyZWYnKVxuICAgICAgICAgICAgaWYgaHJlZj9cbiAgICAgICAgICAgICAgICBocmVmID0gaHJlZi50cmltKClcbiAgICAgICAgICAgICAgICBpZiBocmVmLmluZGV4T2YoJ2h0dHA6Ly8nKSBpcyAwIG9yIGhyZWYuaW5kZXhPZignaHR0cHM6Ly8nKSBpcyAwIG9yIGhyZWYuaW5kZXhPZignLnBkZicpIGlzIChocmVmLmxlbmd0aCAtIDQpXG4gICAgICAgICAgICAgICAgICAgICQoQCkuYXR0cigndGFyZ2V0JywgJ19ibGFuaycpXG5cblxuICAgICQoJy5jaXJjbGUsIC5jaXJjbGUtb3V0ZXInKS5vbignbW91c2VlbnRlcicsIC0+XG4gICAgICAgIFR3ZWVuTWF4LnRvKCQodGhpcyksIC4zNSxcbiAgICAgICAgICAgIHNjYWxlOiAxLjA1LFxuICAgICAgICAgICAgZWFzZTogUG93ZXIyLmVhc2VPdXRcbiAgICAgICAgKVxuICAgIClcblxuICAgICQoJy5jaXJjbGUsIC5jaXJjbGUtb3V0ZXInKS5vbignbW91c2VsZWF2ZScsIC0+XG4gICAgICAgIFR3ZWVuTWF4LnRvKCQodGhpcyksIC4zNSxcbiAgICAgICAgICAgIHNjYWxlOiAxLFxuICAgICAgICAgICAgZWFzZTogUG93ZXIyLmVhc2VPdXRcbiAgICAgICAgKVxuICAgIClcblxuICAgICQoJyNqb2JzLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXIgbGknKS5vbignbW91c2VlbmV0ZXInLCAtPlxuICAgICAgICBjb25zb2xlLmxvZyAnaGVsbG8nXG4gICAgKVxuXG5cbiMgdGhpcyBpcyBzaGl0dHksIGJ1dCBpdCdzIG15IG9ubHkgd29ya2Fyb3VuZCBmb3IgdGhlIGNsaXBwaW5nIGlzc3VlIChDRi0xNzEpXG5kb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSAtPlxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlIGlzICdjb21wbGV0ZScpXG4gICAgICAgIHNldFRpbWVvdXQoLT5cbiAgICAgICAgICAgICQoJy5xdW90ZScpLmFkZENsYXNzKCdrZWVwaXRhaHVuZHJlZCcpXG4gICAgICAgICwgMjAwKVxuIiwiQW5pbWF0aW9uQmFzZSA9IHJlcXVpcmUgXCIuLi9hYnN0cmFjdC9BbmltYXRpb25CYXNlLmNvZmZlZVwiXG5QYXJrc0xpc3QgPSByZXF1aXJlICcuLi9wbHVnaW5zL1BhcmtzTGlzdC5jb2ZmZWUnXG5EcmFnZ2FibGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9EcmFnZ2FibGVHYWxsZXJ5LmNvZmZlZSdcbkZhZGVHYWxsZXJ5ID0gcmVxdWlyZSAnLi4vcGx1Z2lucy9GYWRlR2FsbGVyeS5jb2ZmZWUnXG5IZWFkZXJBbmltYXRpb24gPSByZXF1aXJlICcuLi9wbHVnaW5zL0hlYWRlckFuaW1hdGlvbi5jb2ZmZWUnXG5GcmFtZUFuaW1hdGlvbiA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvY29hc3RlcnMvRnJhbWVBbmltYXRpb24uY29mZmVlJ1xuUmVzaXplQnV0dG9ucyA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvUmVzaXplQnV0dG9ucy5jb2ZmZWUnXG5OZXdzUm9vbSA9IHJlcXVpcmUgJy4uL3BsdWdpbnMvTmV3c1Jvb20uY29mZmVlJ1xuRm9ybUhhbmRsZXIgPSByZXF1aXJlICcuLi9wbHVnaW5zL0Zvcm1IYW5kbGVyLmNvZmZlZSdcblxuYW5pbWF0aW9ucyA9IHJlcXVpcmUgJy4vYW5pbWF0aW9ucy9uZXdzLmNvZmZlZSdcbmdsb2JhbEFuaW1hdGlvbnMgPSByZXF1aXJlICcuL2FuaW1hdGlvbnMvZ2xvYmFsLmNvZmZlZSdcbiAgICAgICAgXG5cbmNsYXNzIE5ld3NQYWdlIGV4dGVuZHMgQW5pbWF0aW9uQmFzZVxuXG5cbiAgICBjb25zdHJ1Y3RvcjogKGVsKSAtPlxuICAgICAgICBAdG90YWxBbmltYXRpb25UaW1lID0gMjVcbiAgICAgICAgc3VwZXIoZWwpXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBzdXBlcigpXG5cbiAgICBpbml0Q29tcG9uZW50czogLT5cbiAgICAgICAgc3VwZXIoKVxuICAgICAgICBcbiAgICAgICAgbmV3c2Zvcm0gPSBuZXcgRm9ybUhhbmRsZXJcbiAgICAgICAgICAgIGVsOiAnI25ld3MtZm9ybSdcbiAgICAgICAgXG4gICAgICAgIG5ld3Nyb29tID0gbmV3IE5ld3NSb29tXG4gICAgICAgICAgICBlbDogJyNzZWxlY3QtbmV3cycsXG4gICAgICAgICAgICBpc1Bob25lOiBAaXNQaG9uZVxuXG4gICAgICAgIGlmICFAaXNQaG9uZVxuXG4gICAgICAgICAgICBjb2FzdGVyID0gbmV3IEZyYW1lQW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgaWQ6XCJuZXdzLWNvYXN0ZXItMVwiXG4gICAgICAgICAgICAgICAgZWw6XCIjbmV3cy1zZWN0aW9uMVwiXG4gICAgICAgICAgICAgICAgYmFzZVVybDogXCIje0BjZG5Sb290fWNvYXN0ZXJzL1wiXG4gICAgICAgICAgICAgICAgdXJsOiBcInNob3QtMi9kYXRhLmpzb25cIlxuICAgICAgICAgICAgY29hc3Rlci5sb2FkRnJhbWVzKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgJCgnI25ld3Mtc2VsZWN0JykuY2ZEcm9wZG93blxuICAgICAgICAgICAgICAgIG9uU2VsZWN0OiAodCkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWQgPSAkKHQpLmRhdGEoJ2lkJylcbiAgICAgICAgICAgICAgICAgICAgbmV3c3Jvb20uc3dpdGNoVG9QYWdlIGlkXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAkKCcub3ZlcmxheS1jbG9zZS1idXR0b24sICNiYXNpYy1vdmVybGF5Jykub24gJ2NsaWNrJywgQHJlbW92ZURlZXBMaW5rXG4gICAgICAgICQoJ2EubmV3cy5zdG9yeScpLm9uICdjbGljaycsICgpIC0+XG4gICAgICAgICAgICBsYXN0cGFydCA9ICQoQCkuZGF0YSAnbGluaydcbiAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHtpZDogbGFzdHBhcnR9LCAnJywgJy9uZXdzL2FydGljbGUvJyArIGxhc3RwYXJ0KTtcbiAgICAgICAgXG4gICAgICAgIEBmaW5kRGVlcExpbmsoKVxuICAgICAgICBcbiAgICByZW1vdmVEZWVwTGluazogPT5cbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe2lkOiAnbmV3cyd9LCAnJywgJy9uZXdzJyk7XG4gICAgICAgIFxuICAgIGZpbmREZWVwTGluazogPT5cblxuICAgICAgICBsb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG4gICAgICAgIHBhcnRzID0gbG9jYXRpb24uc3BsaXQoJy8nKVxuICAgICAgICBcbiAgICAgICAgaWYgKCQuaW5BcnJheSgnYXJ0aWNsZScsIHBhcnRzKSA+IC0xKVxuICAgICAgICAgICAgbGFzdHBhcnQgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcucG9zdCAubmV3cy5zdG9yeScpLmVhY2ggKGksIG8pIC0+XG4gICAgICAgICAgICAgICAgaWYgJChvKS5kYXRhKCdsaW5rJykgaXMgbGFzdHBhcnRcbiAgICAgICAgICAgICAgICAgICAgJCgnLm5ld3MteWVhci13cmFwcGVyJykucmVtb3ZlQ2xhc3MgJ3Zpc2libGUnXG4gICAgICAgICAgICAgICAgICAgICQobykucGFyZW50cygnLm5ld3MteWVhci13cmFwcGVyJykuYWRkQ2xhc3MgJ3Zpc2libGUnXG4gICAgICAgICAgICAgICAgICAgIHllYXIgPSAkKG8pLnBhcmVudHMoJy5uZXdzLXllYXItd3JhcHBlcicpLmRhdGEoJ3llYXInKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJCgnLnNlbGVjdC1uZXdzLXllYXItd3JhcHBlciBhJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpLmVhY2ggKGksIGEpLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHBhcnNlSW50KCQoYSkudGV4dCgpKSBpcyB5ZWFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJChhKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgJChvKS50cmlnZ2VyICdjbGljaycgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgIHJlc2V0VGltZWxpbmU6ID0+XG4gICAgICAgIHN1cGVyKCkgICAgICAgXG5cbiAgICAgICAgI0BwYXJhbGxheC5wdXNoIGdsb2JhbEFuaW1hdGlvbnMuY2xvdWRzKFwiI3NlY3Rpb24xXCIsIDAgLCAxLCBpZiBAaXNUYWJsZXQgdGhlbiAxIGVsc2UgNSlcblxuICAgICAgICBpZiAhQGlzUGhvbmVcbiAgICAgICAgICAgIEB0cmlnZ2Vycy5wdXNoIGFuaW1hdGlvbnMuc2VsZWN0Qm94KClcblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBOZXdzUGFnZVxuXG5cbiIsIlxuY2xvdWRzT25VcGRhdGUgPSAoZWwsIGR1cmF0aW9uKSAtPlxuICAgIHdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICBcbiAgICBUd2Vlbk1heC5zZXQgZWwsXG4gICAgICAgIHg6IC0yMDUwXG4gICAgICAgIFxuICAgIFR3ZWVuTWF4LnRvIGVsLCBkdXJhdGlvbiAsIFxuICAgICAgICB4OiB3aW5kb3dXaWR0aFxuICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgY2xvdWRzT25VcGRhdGUgZWwgLCBkdXJhdGlvblxuICAgICAgICBcblxuXG5zZXRCb2JpbmcgPSAoJGVsICwgZHVyLGRlbGF5KSAtPlxuICAgIFxuICAgIEBpc1RhYmxldCA9ICQoJ2h0bWwnKS5oYXNDbGFzcyAndGFibGV0J1xuICAgIHdpZHRoID0gd2luZG93LmlubmVyV2lkdGhcbiAgICB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG4gICAgXG4gICAgaWYgd2luZG93LmlubmVyV2lkdGggPiA3NjcgJiYgIUBpc1RhYmxldFxuXG4jICAgICAgICBkID0gKCh3aW5kb3cuaW5uZXJXaWR0aCArIDE1NTApIC8gd2luZG93LmlubmVyV2lkdGgpICogMTgwXG4gICAgICAgIGQgPSAzMDAgLSAoJGVsLmRhdGEoJ2Nsb3VkJykuc3BlZWQgKiAyNTApXG4gICAgICAgIFxuICAgICAgICBUd2Vlbk1heC50byAkZWwgLCBkdXIgLCBcbiAgICAgICAgICAgIHg6IHdpZHRoXG4gICAgICAgICAgICBkZWxheTpkZWxheVxuICAgICAgICAgICAgZWFzZTpMaW5lYXIuZWFzZU5vbmVcbiAgICAgICAgICAgIG9uVXBkYXRlUGFyYW1zOiBbXCJ7c2VsZn1cIl1cbiAgICAgICAgICAgIG9uQ29tcGxldGU6ICh0d2VlbikgPT5cbiAgICAgICAgICAgICAgICBjbG91ZHNPblVwZGF0ZSAkZWwgLCBkXG5cblxuXG5zZXRSZWdpc3RyYXRpb24gPSAoJGVsLCByZWdpc3RyYXRpb24pIC0+XG4gICAgXG4gICAgdmFsdWVzID0gcmVnaXN0cmF0aW9uLnNwbGl0KFwifFwiKVxuICAgIFxuICAgIHZpZXdwb3J0V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIHNldHRpbmdzID0ge31cbiAgICBcbiAgICBhbGlnbiA9IHZhbHVlc1swXVxuICAgIG9mZnNldCA9IHBhcnNlSW50KHZhbHVlc1sxXSkgb3IgMFxuXG4gICAgc3dpdGNoIGFsaWduXG4gICAgICAgIHdoZW4gJ2xlZnQnXG4gICAgICAgICAgICBzZXR0aW5ncy54ID0gMCArIG9mZnNldFxuICAgICAgICB3aGVuICdyaWdodCdcbiAgICAgICAgICAgIHNldHRpbmdzLnggPSB2aWV3cG9ydFdpZHRoICsgb2Zmc2V0ICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgd2hlbiAnY2VudGVyJ1xuICAgICAgICAgICAgc2V0dGluZ3MueCA9ICh2aWV3cG9ydFdpZHRoKi41IC0gJGVsLndpZHRoKCkqLjUpICsgb2Zmc2V0ICAgIFxuICAgIFxuICAgIFR3ZWVuTWF4LnNldCAkZWwgLCBzZXR0aW5nc1xuICAgIFxuICAgIFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSAob3B0aW9ucykgLT5cbiAgICBcbiAgICAkZWwgPSBvcHRpb25zLiRlbFxuICAgICRjb250YWluZXIgPSAkZWwuY2xvc2VzdCgnW2RhdGEtY2xvdWQtY29udGFpbmVyXScpICAgIFxuICAgIGNvbnRhaW5lclRvcFBhZGRpbmcgPSBwYXJzZUludCgkY29udGFpbmVyLmNzcygncGFkZGluZy10b3AnKSlcbiAgICBcbiAgICBcbiAgICB0cnkgICAgICAgIFxuICAgICAgICBjbG91ZERhdGEgPSAkZWwuZGF0YSgpLmNsb3VkXG4gICAgICAgXG4gICAgY2F0Y2ggZVxuICAgICAgICBjb25zb2xlLmVycm9yIFwiQ2xvdWQgRGF0YSBQYXJzZSBFcnJvcjogSW52YWxpZCBKU09OXCIgICAgICAgIFxuICAgICAgICBcbiAgICBjbG91ZERlcHRoID0gJGVsLmRhdGEoJ2RlcHRoJylcbiAgICBjbG91ZFNwZWVkID0gY2xvdWREYXRhLnNwZWVkIG9yIDFcbiAgICBjbG91ZE9mZnNldE1pbiA9IHBhcnNlSW50KGNsb3VkRGF0YS5vZmZzZXRNaW4pIG9yIDBcbiAgICBjbG91ZFJldmVyc2UgPSBjbG91ZERhdGEucmV2ZXJzZSBvciBmYWxzZVxuICAgIGNsb3VkUmVnaXN0cmF0aW9uID0gY2xvdWREYXRhLnJlZ2lzdGVyIG9yIFwiY2VudGVyXCJcblxuXG4gICAgXG4gICAgc2V0UmVnaXN0cmF0aW9uICRlbCAsIGNsb3VkUmVnaXN0cmF0aW9uXG4gICAgaWYgISgkY29udGFpbmVyLmhhc0NsYXNzKCdzcGxhc2gtY29udGFpbmVyJykpXG4gICAgICAgIG9mZkxlZnQgPSAkZWwub2Zmc2V0KCkubGVmdFxuICAgICAgICBkaXN0YW5jZSA9ICh3aW5kb3cuaW5uZXJXaWR0aCAtIG9mZkxlZnQpIC8gd2luZG93LmlubmVyV2lkdGhcbiMgICAgICAgIHBlcmNlbnRhZ2UgPSBkaXN0YW5jZSAqIDE4MCBcbiAgICAgICAgcGVyY2VudGFnZSA9IDI1MCAtIChjbG91ZFNwZWVkICogMjAwKVxuICAgICAgICBcbiAgICAgICAgc2V0Qm9iaW5nICRlbCwgcGVyY2VudGFnZSwgY2xvdWRTcGVlZC81XG4gXG4gICAgbWluWSA9ICRjb250YWluZXIub2Zmc2V0KCkudG9wXG4gICAgbWF4WSA9ICQoZG9jdW1lbnQpLm91dGVySGVpZ2h0KClcbiAgICB0b3RhbFJhbmdlPSAkY29udGFpbmVyLm91dGVySGVpZ2h0KClcbiAgICBcbiAgICBcbiAgICBcbiAgICBwZXJjZW50YWdlUmFuZ2UgPSB0b3RhbFJhbmdlL21heFlcbiAgICBtaW5SYW5nZVBlcmNlbnRhZ2UgPSBtaW5ZL21heFkgICAgXG4gICAgbWF4UmFuZ2VQZXJjZW50YWdlID0gbWluUmFuZ2VQZXJjZW50YWdlICsgcGVyY2VudGFnZVJhbmdlXG5cbiMgICAgY29uc29sZS5sb2cgbWluUmFuZ2VQZXJjZW50YWdlICwgbWF4UmFuZ2VQZXJjZW50YWdlXG5cblxuICAgIGxhc3RTY3JvbGxQZXJjZW50YWdlID0gcHJlc2VudFNjcm9sbFBlcmNlbnRhZ2UgPSBzY3JvbGxEZWx0YSA9IDBcblxuICAgIGlmICgkY29udGFpbmVyLmhhc0NsYXNzKCdzcGxhc2gtY29udGFpbmVyJykgJiYgJCgnaHRtbCcpLmhhc0NsYXNzKCd0YWJsZXQnKSlcbiAgICAgICAgJGNvbnRhaW5lci5oaWRlKClcbiAgICAgICAgXG4gICAgXG4gICAgcmV0dXJuIChwb3MpIC0+XG4gICAgICAgIGlmICgoJGNvbnRhaW5lci5oYXNDbGFzcygnc3BsYXNoLWNvbnRhaW5lcicpKSAmJiAoJCgnaHRtbCcpLmhhc0NsYXNzKCd0YWJsZXQnKSkpXG4gICAgICAgICAgICBUd2Vlbk1heC50byAkZWwgLCAwLjI1ICxcbiAgICAgICAgICAgICAgICBlYXNlOlNpbmUuZWFzZU91dFxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNsb3VkUG9zaXRpb25QZXJjZW50YWdlID0gKHBvcyAtIG1pblJhbmdlUGVyY2VudGFnZSkgLyAobWF4UmFuZ2VQZXJjZW50YWdlIC0gbWluUmFuZ2VQZXJjZW50YWdlKVxuICAgICAgICAgICAgaWYgMCA8PSBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZSA8PSAxXG4gICAgICAgICAgICAgICAgcHJlc2VudFNjcm9sbFBlcmNlbnRhZ2UgPSBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZVxuICAgICAgICAgICAgICAgIGlmIGNsb3VkUmV2ZXJzZSAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZSA9IDEgLSBjbG91ZFBvc2l0aW9uUGVyY2VudGFnZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNsb3VkWSA9ICh0b3RhbFJhbmdlICogY2xvdWRQb3NpdGlvblBlcmNlbnRhZ2UpICogY2xvdWRTcGVlZFxuICAgICAgICAgICAgICAgIGNsb3VkWSA9IGNsb3VkWSAtIGNvbnRhaW5lclRvcFBhZGRpbmdcbiAgICAgICAgICAgICAgICBjbG91ZFkgPSBjbG91ZFkgKyBjbG91ZE9mZnNldE1pblxuICAgIFxuICAgICAgICAgICAgICAgICNNYXliZSB1c2UgdGhpcz9cbiAgICAgICAgICAgICAgICBzY3JvbGxEZWx0YSA9IE1hdGguYWJzKGxhc3RTY3JvbGxQZXJjZW50YWdlIC0gcHJlc2VudFNjcm9sbFBlcmNlbnRhZ2UpICogM1xuICAgIFxuICAgICAgICAgICAgICAgIGxhc3RTY3JvbGxQZXJjZW50YWdlID0gcHJlc2VudFNjcm9sbFBlcmNlbnRhZ2VcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgVHdlZW5NYXgudG8gJGVsICwgMC4yNSAsIFxuICAgICAgICAgICAgICAgICAgICB5OmNsb3VkWVxuICAgICAgICAgICAgICAgICAgICBlYXNlOlNpbmUuZWFzZU91dFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgIFxuIiwiXG5cbiNDb3VudFxuY29tbWFzID0gKHgpIC0+XG4gIHgudG9TdHJpbmcoKS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCBcIixcIilcblxuXG5tb2R1bGUuZXhwb3J0cy5jb3VudCA9IChlbCkgLT5cbiAgICBcbiAgICBcbiAgICAkZWwgPSAkKGVsKVxuICAgIHRhcmdldFZhbCA9ICQoZWwpLmh0bWwoKVxuICAgIG51bSA9ICQoZWwpLnRleHQoKS5zcGxpdCgnLCcpLmpvaW4oJycpXG5cbiAgICBzdGFydCA9IG51bSAqIC45OTk1XG4gICAgY2hhbmdlID0gbnVtICogLjAwMDVcbiAgICBcbiAgICB0bCA9IG5ldyBUaW1lbGluZU1heFxuICAgICAgICBvblN0YXJ0OiAtPlxuICAgICAgICAgICAgJGVsLmh0bWwoXCI0MlwiKVxuICAgICAgICBvbkNvbXBsZXRlOiAtPlxuICAgICAgICAgICAgJGVsLmh0bWwodGFyZ2V0VmFsKVxuICAgICAgICAgICAgXG4gICAgdHdlZW5zID0gW11cblxuICAgICAgICBcblxuICAgIHR3ZWVucy5wdXNoIFR3ZWVuTWF4LmZyb21UbyAkZWwgLCAwLjI1LCAgICAgICAgXG4gICAgICAgIGF1dG9BbHBoYTowXG4gICAgICAgIGltbWVkaWF0ZVJlbmRlcjp0cnVlXG4gICAgICAgIGVhc2U6UXVpbnQuZWFzZU91dFxuICAgICxcbiAgICAgICAgYXV0b0FscGhhOjFcblxuICAgIHR3ZWVucy5wdXNoIFR3ZWVuTWF4LnRvICRlbCAsIDEuNSwgXG4gICAgICAgIGVhc2U6UXVpbnQuZWFzZU91dFxuICAgICAgICBcbiAgICAgICAgb25VcGRhdGU6IC0+XG4gICAgICAgICAgICB2YWx1ZSA9IHBhcnNlSW50KHN0YXJ0ICsgcGFyc2VJbnQoY2hhbmdlICogQHByb2dyZXNzKCkpKVxuICAgICAgICAgICAgdmFsdWUgPSBjb21tYXModmFsdWUpXG4gICAgICAgICAgICBlbHMgPSB2YWx1ZS5zcGxpdCgnJylcbiAgICAgICAgICAgIGh0bWwgPSAnJ1xuICAgICAgICAgICAgJC5lYWNoIGVscywgKG5hbWUsIHZhbHVlKSAtPlxuICAgICAgICAgICAgICAgIGh0bWwgKz0gaWYgKHZhbHVlIGlzICcsJykgdGhlbiAnLCcgZWxzZSAnPHNwYW4+JyArIHZhbHVlICsgJzwvc3Bhbj4nXG4gICAgICAgICAgICAkZWwuaHRtbChodG1sKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICB0bC5hZGQgdHdlZW5zXG4gICAgXG4gICAgdGxcblxuI1Njcm9sbGluZ1xuXG5cblxudHdlZW5QYXJhbGxheCA9IChwb3MsdHdlZW4sbWluLG1heCxkdXIpIC0+XG5cblxuXG4gICAgcGVyY2VudCA9ICgocG9zLW1pbikgLyAobWF4LW1pbikpICogMVxuICAgIGFtb3VudCA9IHBlcmNlbnQgKiBkdXJcblxuXG5cbiAgICBpZiBwb3MgPD0gbWF4IGFuZCBwb3MgPj0gbWluXG4gICAgICAgICNjb25zb2xlLmxvZyBwZXJjZW50ICwgdHdlZW4ubnMubmFtZSAsIHBvc1xuICAgICAgICBpZiBNYXRoLmFicyhhbW91bnQgLSB0d2Vlbi50aW1lKCkpID49IC4wMDFcbiAgICAgICAgICAgIHR3ZWVuLnR3ZWVuVG8gIGFtb3VudCAsXG4gICAgICAgICAgICAgICAgb3ZlcndyaXRlOlwicHJlZXhpc3RpbmdcIixcbiAgICAgICAgICAgICAgICBlYXNlOlF1YWQuZWFzZU91dFxuXG5cbm1vZHVsZS5leHBvcnRzLmNsb3VkcyA9IChzZXRJZCwgbWluLCBtYXgsIGR1cikgLT5cblxuICAgIG1pblBvcyA9IG1pblxuICAgIG1heFBvcyA9IG1heFxuICAgIGR1cmF0aW9uID0gZHVyXG5cbiAgICAkZWwgPSAkKFwiLmNsb3VkcyN7c2V0SWR9XCIpXG4gICAgY2xvdWRzID0gJGVsLmZpbmQoXCIuY2xvdWRcIilcblxuICAgIHR3ZWVuID0gbmV3IFRpbWVsaW5lTWF4XG4gICAgdHdlZW4ubnMgPSB7fVxuICAgIHR3ZWVuLm5zLm5hbWUgPSBzZXRJZFxuXG4gICAgdHdlZW5zID0gW11cbiAgICBmb3IgY2xvdWQsaSBpbiBjbG91ZHNcbiAgICAgICAgb2Zmc2V0ID0gXCIrPSN7MjUwKihpKzEpfVwiXG5cblxuICAgICAgICB0d2VlbnMucHVzaCBUd2Vlbk1heC50byBjbG91ZCAsIGR1cmF0aW9uICxcbiAgICAgICAgICAgIHk6b2Zmc2V0XG5cblxuXG4gICAgdHdlZW4uYWRkIHR3ZWVuc1xuXG5cblxuICAgIHR3ZWVuLnBhdXNlZCh0cnVlKVxuICAgIHJldHVybiAocG9zKSAtPlxuICAgICAgICB0d2VlblBhcmFsbGF4IHBvcyAsIHR3ZWVuICwgbWluUG9zLCBtYXhQb3MsIGR1cmF0aW9uXG5cbm1vZHVsZS5leHBvcnRzLnNjcm9sbCA9IChtaW5Qb3MsIG1heFBvcywgZHVyYXRpb24sIGVsZW0pIC0+XG5cbiAgICB0d2VlbiA9IG5ldyBUaW1lbGluZU1heFxuICAgIHR3ZWVuLm5zID0ge31cbiAgICB0d2Vlbi5ucy5uYW1lID0gXCIuc2Nyb2xsdG9cIlxuICAgIFxuICAgIHR3ZWVucyA9IFtdXG4gICAgdHdlZW5zLnB1c2ggVHdlZW5NYXgudG8gZWxlbSAsIGR1cmF0aW9uICwgb3BhY2l0eTowXG4gICAgXG4gICAgdHdlZW4uYWRkIHR3ZWVuc1xuICAgIFxuICAgIHR3ZWVuLnBhdXNlZCh0cnVlKVxuICAgIHJldHVybiAocG9zKSAtPlxuICAgICAgICB0d2VlblBhcmFsbGF4IHBvcyAsIHR3ZWVuICwgbWluUG9zLCBtYXhQb3MsIGR1cmF0aW9uXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMuYXJtcyA9IChtaW4sIG1heCwgZHVyKSAtPlxuXG4gICAgbWluUG9zID0gbWluXG4gICAgbWF4UG9zID0gbWF4XG4gICAgZHVyYXRpb24gPSBkdXJcblxuICAgIGFybSA9ICQoXCIuYXJtc1wiKVxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcbiAgICB0d2Vlbi5ucyA9IHt9XG4gICAgdHdlZW4ubnMubmFtZSA9IFwiLmFybXNcIlxuXG4gICAgdHdlZW5zID0gW11cbiAgICB0d2VlbnMucHVzaCBUd2Vlbk1heC50byBhcm0gLCBkdXJhdGlvbiAsIHRvcDowXG5cblxuXG4gICAgdHdlZW4uYWRkIHR3ZWVuc1xuXG5cblxuICAgIHR3ZWVuLnBhdXNlZCh0cnVlKVxuICAgIHJldHVybiAocG9zKSAtPlxuICAgICAgICB0d2VlblBhcmFsbGF4IHBvcyAsIHR3ZWVuICwgbWluUG9zLCBtYXhQb3MsIGR1cmF0aW9uXG4iLCJnbG9iYWwgPSByZXF1aXJlICcuL2dsb2JhbC5jb2ZmZWUnXG5cblxubW9kdWxlLmV4cG9ydHMuc2VsZWN0Qm94ID0gKCkgLT5cbiAgICAkZWwgPSAkKCcjbmV3cyAjc2VsZWN0LW5ld3MnKVxuXG4gICAgdHdlZW4gPSBuZXcgVGltZWxpbmVNYXhcblxuICAgIHR3ZWVuLmFkZCBUd2Vlbk1heC5mcm9tVG8oJGVsLCAuMzUsXG4gICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgLHNjYWxlOiAuNzVcbiAgICAsXG4gICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgLHNjYWxlOiAxXG4gICAgKSwgMC41XG5cbiAgICB0d2Vlbi5wYXVzZWQodHJ1ZSlcbiAgICBhOnR3ZWVuXG4gICAgb2Zmc2V0OiRlbC5vZmZzZXQoKS50b3BcbiIsIlBsdWdpbkJhc2UgPSByZXF1aXJlICcuLi9hYnN0cmFjdC9QbHVnaW5CYXNlLmNvZmZlZSdcblxuY2xhc3MgQmFzaWNPdmVybGF5IGV4dGVuZHMgUGx1Z2luQmFzZVxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgc3VwZXIob3B0cylcblxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgICMgQCRlbCA9ICQoZWwpXG4gICAgICAgIEBvdmVybGF5VHJpZ2dlcnMgPSAkKCcub3ZlcmxheS10cmlnZ2VyJylcbiAgICAgICAgQGFkZEV2ZW50cygpXG5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgXG4gICAgYWRkRXZlbnRzOiAtPlxuXG4gICAgICAgICQoJyNiYXNpYy1vdmVybGF5LCAjb3ZlcmxheS1iYXNpYy1pbm5lciAub3ZlcmxheS1jbG9zZScpLmNsaWNrKEBjbG9zZU92ZXJsYXkpO1xuICAgICAgICBAb3ZlcmxheVRyaWdnZXJzLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgICQodCkub24gJ2NsaWNrJywgQG9wZW5PdmVybGF5XG5cbiAgICAgICAgI2dsb2JhbCBidXkgdGlja2V0cyBsaW5rc1xuXG4gICAgICAgICQoJy5vdmVybGF5LWNvbnRlbnQnKS5vbiAnY2xpY2snLCAnbGknICxAb3BlbkxpbmtcbiMgICAgICAgICQod2luZG93KS5vbiAncmVzaXplJywgQGNsb3NlT3ZlcmxheVxuICAgICAgICBcbiAgICBvcGVuTGluazogKGUpID0+XG4gICAgICAgIHRhcmdldCA9ICQoZS50YXJnZXQpLnBhcmVudHMgJy5wYXJrJ1xuICAgICAgICBpZiB0YXJnZXQuZGF0YSgndGFyZ2V0JylcbiAgICAgICAgICAgIHdpbmRvdy5vcGVuKHRhcmdldC5kYXRhKCd0YXJnZXQnKSlcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIFxuICAgIGNsb3NlT3ZlcmxheTogKGUpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiAhICgoZS50eXBlIGlzICdyZXNpemUnKSBhbmQgKCQoJyNvdmVybGF5IHZpZGVvOnZpc2libGUnKS5zaXplKCkgPiAwKSlcbiAgICAgICAgICAgICQoJy5vdmVybGF5LWJhc2ljJykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAgICAgfSwgKCkgLT4gXG4gICAgICAgICAgICAgICAgJCgnLm92ZXJsYXktYmFzaWMnKS5oaWRlKClcbiAgICAgICAgICAgICAgICAkKCcjb3ZlcmxheScpLmhpZGUoKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgb3Blbk92ZXJsYXk6ICh0KSAtPlxuICAgICAgICAkZWwgPSAkKHRoaXMpXG4gICAgICAgIG92ZXJsYXlTb3VyY2UgPSAkZWwuZGF0YSgnc291cmNlJylcbiAgICAgICAgJHRhcmdldEVsZW1lbnQgPSAkKCcjb3ZlcmxheS1iYXNpYy1pbm5lciAub3ZlcmxheS1jb250ZW50JylcbiAgICAgICAgaXNOZXdzID0gJGVsLmhhc0NsYXNzKCduZXdzJylcblxuICAgICAgICAkKCcjb3ZlcmxheScpLnNob3coKVxuICAgICAgICBcbiAgICAgICAgaWYgJGVsLmhhc0NsYXNzICdvZmZlcmluZ3Mtb3B0aW9uJ1xuICAgICAgICAgICAgb2MgPSAkKCcjb2ZmZXJpbmdzLW92ZXJsYXktY29udGVudCcpXG4gICAgICAgICAgICBvYy5maW5kKCdoMS50aXRsZScpLnRleHQoJGVsLmZpbmQoJ3NwYW4ub2ZmZXInKS50ZXh0KCkpXG4gICAgICAgICAgICBvYy5maW5kKCdkaXYuZGVzY3JpcHRpb24nKS5odG1sKCRlbC5maW5kKCdkaXYuZGVzY3JpcHRpb24nKS5odG1sKCkpXG4gICAgICAgICAgICBvYy5maW5kKCcuY29udGVudC5tZWRpYScpLmNzcyh7YmFja2dyb3VuZEltYWdlOiBcInVybCgnXCIgKyAkZWwuZmluZCgnc3Bhbi5tZWRpYScpLmRhdGEoJ3NvdXJjZScpICsgXCInKVwifSlcblxuICAgICAgICBcbiAgICAgICAgaWYgKCQoJyMnICsgb3ZlcmxheVNvdXJjZSkuc2l6ZSgpIGlzIDEpIFxuICAgICAgICAgICAgI2h0bWwgPSAkKCcjJyArIG92ZXJsYXlTb3VyY2UpLmh0bWwoKVxuXG4gICAgICAgICAgICAkdGFyZ2V0RWxlbWVudC5jaGlsZHJlbigpLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgICAgICAkKHQpLmFwcGVuZFRvKCcjb3ZlcmxheS1jb250ZW50LXNvdXJjZXMnKVxuXG4gICAgICAgICAgICBpZiBpc05ld3NcbiAgICAgICAgICAgICAgICBjID0gJGVsLm5leHQoJy5hcnRpY2xlJykuY2xvbmUoKVxuICAgICAgICAgICAgICAgICQoJyNvdmVybGF5X2NvbnRlbnQnKS5odG1sKGMuaHRtbCgpKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJCgnIycgKyBvdmVybGF5U291cmNlKS5hcHBlbmRUbygkdGFyZ2V0RWxlbWVudClcblxuICAgICAgICAgICAgJGVsID0gJCgnI292ZXJsYXktYmFzaWMtaW5uZXInKVxuICAgICAgICAgICAgaXNTbWFsbCA9ICRlbC5oZWlnaHQoKSA8ICQod2luZG93KS5oZWlnaHQoKSBhbmQgJCgkdGFyZ2V0RWxlbWVudCkuZmluZCgnLnNlbGVjdC1ib3gtd3JhcHBlcicpLnNpemUoKSBpcyAwXG4gICAgICAgICAgICBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKClcbiAgICAgICAgICAgIGFkZHRvcCA9IGlmIGlzU21hbGwgdGhlbiAwIGVsc2Ugc2Nyb2xsVG9wO1xuICAgICAgICAgICAgcG9zaXRpb24gPSAkZWwuY3NzICdwb3NpdGlvbicsIGlmIGlzU21hbGwgdGhlbiAnZml4ZWQnIGVsc2UgJ2Fic29sdXRlJ1xuICAgICAgICAgICAgdG9wID0gTWF0aC5tYXgoMCwgKCgkKHdpbmRvdykuaGVpZ2h0KCkgLSAkZWwub3V0ZXJIZWlnaHQoKSkgLyAyKSArIGFkZHRvcClcbiAgICAgICAgICAgIGlmICFpc1NtYWxsIGFuZCAodG9wIDwgc2Nyb2xsVG9wKSB0aGVuIHRvcCA9IHNjcm9sbFRvcFxuICAgICAgICAgICAgJGVsLmNzcyhcInRvcFwiLCB0b3AgKyBcInB4XCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIGhlaWdodDpcbiAgICAgICAgICAgICMkZWwuY3NzKFwibGVmdFwiLCBNYXRoLm1heCgwLCAoKCQod2luZG93KS53aWR0aCgpIC0gJGVsLm91dGVyV2lkdGgoKSkgLyAyKSArIGFkZGxlZnQpICsgXCJweFwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJCgnLm92ZXJsYXktYmFzaWMnKS5jc3MoJ29wYWNpdHknLCAwKS5kZWxheSgwKS5zaG93KCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICAgICAgfSlcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2ljT3ZlcmxheVxuXG5cblxuXG5cblxuIiwiXG5QbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5WaWV3QmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1ZpZXdCYXNlLmNvZmZlZSdcblxuY2xhc3MgRHJhZ2dhYmxlR2FsbGVyeSBleHRlbmRzIFBsdWdpbkJhc2VcblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgc3VwZXIob3B0cylcblxuXG4gICAgaW5pdGlhbGl6ZTogKG9wdHMpIC0+XG5cbiAgICAgICAgQGdhbGxlcnkgPSBAJGVsLmZpbmQgXCIuc3dpcGVyLWNvbnRhaW5lclwiXG5cbiAgICAgICAgaWYoQGdhbGxlcnkubGVuZ3RoIDwgMSlcbiAgICAgICAgICAgIEBnYWxsZXJ5ID0gQCRlbC5maWx0ZXIgXCIuc3dpcGVyLWNvbnRhaW5lclwiXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgb3B0cy5wYWdlID09ICdqb2JzJ1xuICAgICAgICAgICAgQGpvYnNQYWdlID0gdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAam9ic1BhZ2UgPSBmYWxzZVxuXG4gICAgICAgIEBnYWxsZXJ5Q3JlYXRlZCA9IGZhbHNlXG4gICAgICAgIEBnYWxsZXJ5Q29udGFpbmVyID0gQGdhbGxlcnkuZmluZCgndWwnKVxuICAgICAgICBAZ2FsbGVyeUl0ZW1zID0gQGdhbGxlcnlDb250YWluZXIuZmluZCgnbGknKVxuICAgICAgICBAY3VycmVudEluZGV4ID0gQGdhbGxlcnlJdGVtcy5maWx0ZXIoJy5zZWxlY3RlZCcpLmRhdGEoJ2luZGV4JylcbiAgICAgICAgQGFjcm9zcyA9IG9wdHMuYWNyb3NzIG9yIDFcbiAgICAgICAgQGFuZ2xlTGVmdCA9IEBnYWxsZXJ5LmZpbmQgJy5mYS1hbmdsZS1sZWZ0J1xuICAgICAgICBAYW5nbGVSaWdodCA9IEBnYWxsZXJ5LmZpbmQgJy5mYS1hbmdsZS1yaWdodCdcbiAgICAgICAgQHBhZ2luYXRpb24gPSBvcHRzLnBhZ2luYXRpb24gb3IgZmFsc2VcbiAgICAgICAgQGNvbnRyb2xzID0gb3B0cy5jb250cm9sIG9yIG51bGxcbiAgICAgICAgQGpvYnNDYXJvdXNlbFN0b3BwZWQgPSBmYWxzZVxuICAgICAgICBAam9ic0Nhcm91c2VsUGF1c2VkID0gZmFsc2VcbiAgICAgICAgQGpvYnNJbnRlcnZhbCA9IG51bGxcblxuICAgICAgICBAc2l6ZUNvbnRhaW5lcigpXG5cbiAgICAgICAgQGFkZEFycm93cygpXG5cbiAgICAgICAgc3VwZXIoKVxuXG4gICAgYWRkRXZlbnRzOiAtPlxuICAgICAgICAkKHdpbmRvdykub24gJ3Jlc2l6ZScgLCBAc2l6ZUNvbnRhaW5lclxuXG4gICAgICAgICQoQCRlbCkub24gJ2NsaWNrJywgJy5mYS1hbmdsZS1sZWZ0JywgQHByZXZTbGlkZVxuICAgICAgICAkKEAkZWwpLm9uICdjbGljaycsICcuZmEtYW5nbGUtcmlnaHQnLCBAbmV4dFNsaWRlXG4gICAgICAgIGlmIEBqb2JzUGFnZSA9PSB0cnVlXG4gICAgICAgICAgICAkKEAkZWwpLm9uICdjbGljaycsICcuc3dpcGVyLWNvbnRhaW5lcicsIEBzdG9wSm9ic0Nhcm91c2VsXG4gICAgICAgICAgICAkKEAkZWwpLm9uICdtb3VzZW92ZXInLCAnLnN3aXBlci1jb250YWluZXInLCBAcGF1c2VKb2JzQ2Fyb3VzZWxcbiAgICAgICAgICAgICQoQCRlbCkub24gJ21vdXNlbGVhdmUnLCAnLnN3aXBlci1jb250YWluZXInLCBAcmVzdW1lSm9ic0Nhcm91c2VsXG4gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgc3RvcEpvYnNDYXJvdXNlbDogPT5cbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGpvYnNJbnRlcnZhbClcbiAgICAgICAgQGpvYnNDYXJvdXNlbFN0b3BwZWQgPSB0cnVlXG5cbiAgICBwYXVzZUpvYnNDYXJvdXNlbDogPT5cbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGpvYnNJbnRlcnZhbClcbiAgICAgICAgQGpvYnNDYXJvdXNlbFBhdXNlZCA9IHRydWVcblxuICAgIHJlc3VtZUpvYnNDYXJvdXNlbDogPT5cbiAgICAgICAgaWYgQGpvYnNDYXJvdXNlbFN0b3BwZWQgPT0gZmFsc2VcbiAgICAgICAgICAgIEBqb2JzSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCAoLT5cbiAgICAgICAgICAgICAgICAkKCcjam9icy1nYWxsZXJ5IC5mYS1hbmdsZS1yaWdodCcpLnRyaWdnZXIoJ2NsaWNrJylcbiAgICAgICAgICAgICksIDgwMDBcbiAgICAgICAgICAgIEBqb2JzQ2Fyb3VzZWxQYXVzZWQgPSBmYWxzZVxuXG4gICAgcHJldlNsaWRlOiAoZSkgPT5cbiAgICAgICAgdGhhdCA9IEBteVN3aXBlclxuICAgICAgICBnYWwgPSBAZ2FsbGVyeVxuICAgICAgICBcbiAgICAgICAgVHdlZW5NYXgudG8oJChnYWwpLCAuMiwgXG4gICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICBzY2FsZTogMS4xXG4gICAgICAgICAgICBvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgICAgIHRoYXQuc3dpcGVQcmV2KClcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC5zZXQoJChnYWwpLFxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogMVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC50bygkKGdhbCksIC4zNSwgXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgICAgICAgICAgICAgZGVsYXk6IC4zNVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgIFxuICAgIG5leHRTbGlkZTogKGUpID0+XG4gICAgICAgIHRoYXQgPSBAbXlTd2lwZXJcbiAgICAgICAgZ2FsID0gQGdhbGxlcnlcblxuICAgICAgICBUd2Vlbk1heC50bygkKGdhbCksIC4yLFxuICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAgICAgc2NhbGU6IDEuMVxuICAgICAgICAgICAgb25Db21wbGV0ZTogPT5cbiAgICAgICAgICAgICAgICB0aGF0LnN3aXBlTmV4dCgpXG4gICAgICAgICAgICAgICAgVHdlZW5NYXguc2V0KCQoZ2FsKSxcbiAgICAgICAgICAgICAgICAgICAgc2NhbGU6IDAuODVcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgVHdlZW5NYXgudG8oJChnYWwpLCAuMzUsXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgICAgICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgICAgICAgICAgICAgZGVsYXk6IC4zNVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgKVxuXG5cbiAgICBhZGRBcnJvd3M6IC0+XG4gICAgICAgIEBpc1Bob25lID0gJChcImh0bWxcIikuaGFzQ2xhc3MoXCJwaG9uZVwiKVxuXG4gICAgICAgIGFycm93TGVmdCA9ICQoXCI8aSBjbGFzcz0nZ2FsLWFycm93IGZhIGZhLWFuZ2xlLWxlZnQnPjwvaT5cIilcbiAgICAgICAgYXJyb3dSaWdodCA9ICQoXCI8aSBjbGFzcz0nZ2FsLWFycm93IGZhIGZhLWFuZ2xlLXJpZ2h0Jz48L2k+XCIpXG5cbiAgICAgICAgQCRlbC5hcHBlbmQoYXJyb3dMZWZ0LCBhcnJvd1JpZ2h0KVxuXG4gICAgICAgICQoJy5nYWwtYXJyb3cnKS5vbiAnY2xpY2snLCAtPlxuICAgICAgICAgICAgJChAKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgdGhhdCA9ICQoQClcbiAgICAgICAgICAgIHNldFRpbWVvdXQgLT5cbiAgICAgICAgICAgICAgICAkKHRoYXQpLnJlbW92ZUNsYXNzICdhY3RpdmUnLCAxMDBcbiAgICAgICAgICAgIFxuXG4gICAgc2l6ZUNvbnRhaW5lcjogKCkgPT5cbiAgICAgICAgQGdhbGxlcnlDb250YWluZXIuY3NzKCd3aWR0aCcsIFwiMTAwJVwiKVxuICAgICAgICBpZiBAYWNyb3NzIDwgMlxuICAgICAgICAgICAgQGdhbGxlcnlJdGVtcy5jc3MoJ3dpZHRoJyAsIFwiMTAwJVwiKVxuICAgICAgICBlbHNlIGlmIEBhY3Jvc3MgPCAzXG4gICAgICAgICAgICBAZ2FsbGVyeUl0ZW1zLmNzcygnd2lkdGgnICwgXCI1MCVcIilcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGdhbGxlcnlJdGVtcy5jc3MoJ3dpZHRoJyAsIFwiMzMuMzMzMzMzJVwiKVxuXG4gICAgICAgIEBpdGVtV2lkdGggPSBAZ2FsbGVyeUl0ZW1zLmZpcnN0KCkub3V0ZXJXaWR0aCgpXG4gICAgICAgIGl0ZW1MZW5ndGggPSBAZ2FsbGVyeUl0ZW1zLmxlbmd0aFxuXG4gICAgICAgIEBnYWxsZXJ5SXRlbXMuY3NzKCd3aWR0aCcsIEBpdGVtV2lkdGgpXG4gICAgICAgIEBnYWxsZXJ5Q29udGFpbmVyLmNzcygnd2lkdGgnLCBpdGVtTGVuZ3RoICogKEBpdGVtV2lkdGgpKVxuICAgICAgICBUd2Vlbk1heC5zZXQgQGdhbGxlcnlDb250YWluZXIgLFxuICAgICAgICAgICAgeDogLUBjdXJyZW50SW5kZXggKiBAaXRlbVdpZHRoXG4gICAgICAgIFxuICAgICAgICBpZiAhQGdhbGxlcnlDcmVhdGVkICAgIFxuICAgICAgICAgICAgQGNyZWF0ZURyYWdnYWJsZSgpXG4jICAgICAgICAgICAgQG15U3dpcGVyLnN3aXBlTmV4dCgpXG4gICAgICAgIFxuICAgIGNyZWF0ZURyYWdnYWJsZTogKCkgLT5cbiAgICAgICAgaXRlbUxlbmd0aCA9IEBnYWxsZXJ5SXRlbXMubGVuZ3RoXG5cbiAgICAgICAgaWYgQHNjcm9sbCB0aGVuIEBzY3JvbGwua2lsbCgpXG5cbiAgICAgICAgaWQgPSAkKEAuJGVsKS5hdHRyICdpZCdcblxuXG4gICAgICAgIGlmIEBwYWdpbmF0aW9uXG4gICAgICAgICAgICBAYWRkUGFnaW5hdGlvbigpXG5cbiAgICAgICAgaWYgQGFjcm9zcyA8IDNcbiAgICAgICAgICAgIGlmIEBwYWdpbmF0aW9uXG4gICAgICAgICAgICAgICAgQG15U3dpcGVyID0gbmV3IFN3aXBlcignIycgKyBpZCArICcgLnN3aXBlci1jb250YWluZXInLHtcbiAgICAgICAgICAgICAgICAgICAgbG9vcDp0cnVlLFxuICAgICAgICAgICAgICAgICAgICBncmFiQ3Vyc29yOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiBAYWNyb3NzLFxuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uOiAnIycgKyBpZCArICcgLnN3aXBlci1wYWdpbmF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvbkFzUmFuZ2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG9uVG91Y2hTdGFydDogQG9uU2xpZGVDaGFuZ2VTdGFydCxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaEVuZDogQG9uU2xpZGVDaGFuZ2VFbmQsXG4gICAgICAgICAgICAgICAgICAgIG9uU2xpZGVDaGFuZ2VTdGFydDogQG9uU2xpZGVDaGFuZ2VTdGFydCxcbiAgICAgICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZUVuZDogQG9uU2xpZGVDaGFuZ2VFbmQsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1Blckdyb3VwOiBAYWNyb3NzXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcjJyArIGlkICsgJyAuc3dpcGVyLWNvbnRhaW5lcicse1xuICAgICAgICAgICAgICAgICAgICBsb29wOnRydWUsXG4gICAgICAgICAgICAgICAgICAgIGdyYWJDdXJzb3I6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IEBhY3Jvc3MsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlc1Blckdyb3VwOiBAYWNyb3NzXG4gICAgICAgICAgICAgICAgICAgIG9uVG91Y2hTdGFydDogQG9uU2xpZGVDaGFuZ2VTdGFydCxcbiAgICAgICAgICAgICAgICAgICAgb25Ub3VjaEVuZDogQG9uU2xpZGVDaGFuZ2VFbmQsXG4gICAgICAgICAgICAgICAgICAgIG9uU2xpZGVDaGFuZ2VTdGFydDogQG9uU2xpZGVDaGFuZ2VTdGFydCxcbiAgICAgICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZUVuZDogQG9uU2xpZGVDaGFuZ2VFbmQsXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAbXlTd2lwZXIgPSBuZXcgU3dpcGVyKCcjJyArIGlkICsgJyAuc3dpcGVyLWNvbnRhaW5lcicse1xuICAgICAgICAgICAgICAgIGxvb3A6dHJ1ZSxcbiAgICAgICAgICAgICAgICBncmFiQ3Vyc29yOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDMsXG4gICAgICAgICAgICAgICAgc2xpZGVzUGVyR3JvdXA6IDNcbiAgICAgICAgICAgICAgICBvblRvdWNoU3RhcnQ6IEBvblNsaWRlQ2hhbmdlU3RhcnQsXG4gICAgICAgICAgICAgICAgb25Ub3VjaEVuZDogQG9uU2xpZGVDaGFuZ2VFbmQsXG4gICAgICAgICAgICAgICAgb25TbGlkZUNoYW5nZVN0YXJ0OiBAb25TbGlkZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgICAgIG9uU2xpZGVDaGFuZ2VFbmQ6IEBvblNsaWRlQ2hhbmdlRW5kLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFxuICAgICAgICBAZ2FsbGVyeUNyZWF0ZWQgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICBpZiBAam9ic1BhZ2UgPT0gdHJ1ZVxuICAgICAgICAgICAgQGpvYnNJbnRlcnZhbCA9IHNldEludGVydmFsICgtPlxuICAgICAgICAgICAgICAgICQoJyNqb2JzLWdhbGxlcnkgLmZhLWFuZ2xlLXJpZ2h0JykudHJpZ2dlcignY2xpY2snKVxuICAgICAgICAgICAgKSwgODAwMFxuXG4gICAgICAgIFxuICAgIG9uU2xpZGVDaGFuZ2VTdGFydDogPT5cbiAgICAgICAgJChALiRlbCkuY2xvc2VzdCgnLmFkZC1ib3JkZXItZmFkZScpLmFkZENsYXNzICdzaG93aW5nJ1xuICAgICAgICAkKEAuJGVsKS5maW5kKCcuYWRkLWJvcmRlci1mYWRlJykuYWRkQ2xhc3MgJ3Nob3dpbmcnXG5cbiAgICBvblNsaWRlQ2hhbmdlRW5kOiA9PlxuICAgICAgICAkKEAuJGVsKS5jbG9zZXN0KCcuYWRkLWJvcmRlci1mYWRlJykucmVtb3ZlQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICQoQC4kZWwpLmZpbmQoJy5hZGQtYm9yZGVyLWZhZGUnKS5yZW1vdmVDbGFzcyAnc2hvd2luZydcbiAgICAgICAgXG4gICAgICAgIGlmICEoQGNvbnRyb2xzID09IG51bGwpXG4gICAgICAgICAgICBwYXJrID0gQG15U3dpcGVyLmFjdGl2ZVNsaWRlKCkuZGF0YSgnaWQnKVxuICAgICAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXInKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLmNhcm91c2VsLXdyYXBwZXInKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgZGl2IycgKyBwYXJrKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgZGl2IycgKyBwYXJrKS5wYXJlbnQoKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIChAcGFya0xpc3QpXG4gICAgICAgICAgICBAcGFya0xpc3Quc2VsZWN0TG9nbyAkKEAuJGVsKS5maW5kKCcuc3dpcGVyLXNsaWRlLWFjdGl2ZScpLmRhdGEoJ2lkJyk7XG5cbiAgICBhZGRQYWdpbmF0aW9uOiA9PlxuICAgICAgICB3cmFwcGVyID0gJChcIjxkaXYgY2xhc3M9J3N3aXBlci1wYWdpbmF0aW9uJz48L2Rpdj5cIilcbiAgICAgICAgJChALiRlbCkuZmluZCgnLnN3aXBlci1jb250YWluZXInKS5hZGRDbGFzcygnYWRkUGFnaW5hdGlvbicpLmFwcGVuZCh3cmFwcGVyKVxuXG5cbiAgICBnb3RvOiAoaWQsIGluaXRWYWwpIC0+XG5cbiAgICAgICAgaWYgbm90IGluaXRWYWwgdGhlbiAkKCdib2R5JykuYW5pbWF0ZSB7IHNjcm9sbFRvcDogJCgnIycgKyAoJChAJGVsKS5hdHRyKCdpZCcpKSkub2Zmc2V0KCkudG9wIH1cblxuICAgICAgICB0b0luZGV4ID0gJChcImxpLnBhcmtbZGF0YS1pZD0nI3tpZH0nXVwiKS5kYXRhKCdpbmRleCcpXG5cbiAgICAgICAgdGwgPSBuZXcgVGltZWxpbmVNYXhcblxuICAgICAgICB0bC5hZGQgVHdlZW5NYXgudG8gQGdhbGxlcnlDb250YWluZXIgLCAuNCxcbiAgICAgICAgICAgIGF1dG9BbHBoYTowXG5cbiAgICAgICAgdGwuYWRkQ2FsbGJhY2sgPT5cbiAgICAgICAgICAgIEBteVN3aXBlci5zd2lwZVRvKHRvSW5kZXgsIDApXG5cbiAgICAgICAgdGwuYWRkIFR3ZWVuTWF4LnRvIEBnYWxsZXJ5Q29udGFpbmVyICwgLjQsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MVxuXG4gICAgICAgIEBjdXJyZW50SW5kZXggPSB0b0luZGV4XG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBEcmFnZ2FibGVHYWxsZXJ5XG5cbiIsIlxuUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuVmlkZW9PdmVybGF5ID0gcmVxdWlyZSAnLi9WaWRlb092ZXJsYXkuY29mZmVlJ1xuXG5jbGFzcyBGYWRlR2FsbGVyeSBleHRlbmRzIFBsdWdpbkJhc2VcblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgc3VwZXIob3B0cylcblxuXG4gICAgaW5pdGlhbGl6ZTogKG9wdHMpIC0+XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyAnaW5pdGlhbGl6ZTogJywgb3B0c1xuXG4gICAgICAgIEBwYWdlID0gb3B0cy5wYWdlIG9yIG51bGxcbiAgICAgICAgdGFyZ2V0ID0gb3B0cy50YXJnZXQgb3IgbnVsbFxuICAgICAgICBcbiAgICAgICAgaWYgKHRhcmdldD8pXG4gICAgICAgICAgICBAJHRhcmdldCA9ICQodGFyZ2V0KVxuICAgICAgICBcbiAgICAgICAgaWYgIShAcGFnZSA9PSBudWxsKVxuICAgICAgICAgICAgQGluZm9Cb3hlcyA9IEAkZWwuZmluZCBcImxpLnZpZGVvXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGluZm9Cb3hlcyA9IEAkZWwuZmluZCBcImxpXCJcbiAgICAgICAgICAgIFxuICAgICAgICBAY3VycmVudFNlbGVjdGVkID0gQGluZm9Cb3hlcy5maWx0ZXIoXCI6Zmlyc3QtY2hpbGRcIilcblxuICAgICAgICBzdXBlcigpXG4gICAgXG4gICAgYWRkRXZlbnRzOiAtPiAgXG5cbiAgICAgICAgQGluZm9Cb3hlcy5lYWNoIChpLHQpID0+XG4gICAgICAgICAgICAkYnRuID0gJCh0KS5maW5kKCcudmlkZW8tYnV0dG9uJylcblxuICAgICAgICAgICAgaWYgJGJ0bi5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgdmlkZW9FdmVudHMgPSBuZXcgSGFtbWVyKCRidG5bMF0pXG4gICAgICAgICAgICAgICAgdmlkZW9FdmVudHMub24gJ3RhcCcgLCBAaGFuZGxlVmlkZW9JbnRlcmFjdGlvblxuXG5cblxuXG4gICAgaGFuZGxlVmlkZW9JbnRlcmFjdGlvbjogKGUpID0+XG5cbiAgICAgICAgJHRhcmdldCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoXCIudmlkZW8tYnV0dG9uXCIpXG4gICAgICAgIGlmICgkdGFyZ2V0LnNpemUoKSBpcyAwKSBcbiAgICAgICAgICAgICR0YXJnZXQgPSBlLnRhcmdldFxuICAgICAgICBcbiAgICAgICAgaWYgJHRhcmdldC5kYXRhKCd0eXBlJykgPT0gJ2ltYWdlJ1xuICAgICAgICAgICAgaWYgKCR0YXJnZXQuZGF0YSgnZnVsbCcpKVxuICAgICAgICAgICAgICAgIEBpbWFnZVNyYyA9ICR0YXJnZXQuZGF0YSgnZnVsbCcpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQGltYWdlU3JjID0gJHRhcmdldC5jaGlsZHJlbignaW1nJykuYXR0cignc3JjJylcbiAgICAgICAgZGF0YSA9XG4gICAgICAgICAgICBtcDQ6JHRhcmdldC5kYXRhKCdtcDQnKVxuICAgICAgICAgICAgd2VibTokdGFyZ2V0LmRhdGEoJ3dlYm0nKVxuICAgICAgICAgICAgcG9zdGVyOkBpbWFnZVNyY1xuXG4gICAgICAgIFZpZGVvT3ZlcmxheS5pbml0VmlkZW9PdmVybGF5IGRhdGFcblxuXG4gICAgZ290bzogKGlkLCBpbml0VmFsKSAtPlxuICAgICAgICBpbmZvSWQgPSBcIiMje2lkfS1pbmZvXCJcblxuICAgICAgICBpZiAhKEBwYWdlID09IG51bGwpXG4gICAgICAgICAgICB0YXJnZXQgPSBAaW5mb0JveGVzLnBhcmVudHMoJ2xpLmdyb3VwLWluZm8nKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0YXJnZXQgPSBAaW5mb0JveGVzXG4gICAgICAgIFxuXG4gICAgICAgICNTd2l0Y2ggSW5mbyBCb3hlc1xuICAgICAgICB0bCA9IG5ldyBUaW1lbGluZU1heFxuICAgICAgICB0bC5hZGQgVHdlZW5NYXgudG8gdGFyZ2V0ICwgLjQgLFxuICAgICAgICAgICAgYXV0b0FscGhhOjBcbiAgICAgICAgICAgIG92ZXJ3cml0ZTpcImFsbFwiXG4gICAgICAgIHRsLmFkZCBUd2Vlbk1heC50byB0YXJnZXQuZmlsdGVyKGluZm9JZCkgLCAuNCAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MVxuXG5cbiAgICAgICAgaWYgKEAkdGFyZ2V0PylcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIEAkdGFyZ2V0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRvcCA9IEAkdGFyZ2V0Lm9mZnNldCgpLnRvcCAtICgkKCdoZWFkZXInKS5oZWlnaHQoKSlcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIHRvcFxuICAgICAgICAgICAgcG9zID0gJCgnYm9keScpLnNjcm9sbFRvcCgpXG4gICAgICAgICAgICBpZiAocG9zIDwgdG9wKVxuICAgICAgICAgICAgICAgICQoJ2JvZHknKS5hbmltYXRlIHsgc2Nyb2xsVG9wOiB0b3AgfVxuICBcblxubW9kdWxlLmV4cG9ydHMgPSBGYWRlR2FsbGVyeVxuXG4iLCJQbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5cbiMjI1xuICBcbiAgY3JlYXRlIGZvcm0gb2JqZWN0IG9uIHBhZ2UgKHNyYy9jb20vcGFnZXMvKSBhZnRlciB5b3UndmUgY3JlYXRlZCBhbmQgYWRkZWQgYW55IGRkbCBvYmplY3RzXG4gIFxuICB3aW5kb3cuZGRscyA9IFtdICAgIFxuICB3aW5kb3cuZGRscy5wdXNoICQoJyNzZWxlY3QnKS5jZkRyb3Bkb3duXG4gICAgICAgIG9uU2VsZWN0OiAodCkgLT5cbiAgICAgICAgICAgIGlkID0gJCh0KS5kYXRhKCdpZCcpICBcbiAgXG4gIG15Zm9ybSA9IG5ldyBGb3JtSGFuZGxlclxuICAgIGVsOiAnI3NhbGVzLWZvcm0nIFxuICBcbiMjI1xuXG4jIyMgXG4gIHRvZG86XG4gIDUuIGN1c3RvbWl6ZSBjb25maXJtYXRpb25cbiAgMjogdmFsaWRhdGUgZGF0ZSB0eXBlXG4gIDQ6IGFkZCBpbnB1dCBtYXNrIGZvciBwaG9uZSBhbmQgZGF0ZVxuIyMjXG5cbmNsYXNzIEZvcm1IYW5kbGVyIGV4dGVuZHMgUGx1Z2luQmFzZVxuICAgIFxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgQCRlbCA9ICQob3B0cy5lbClcbiAgICAgICAgQGZvcm1jb250YWluZXIgPSBAXG4gICAgICAgIHN1cGVyKG9wdHMpXG5cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgICBzdXBlcigpXG5cbiAgICB2YWxpZGF0ZTogLT5cblxuICAgICAgICAkZm9ybSA9IEAkZWxcbiAgICAgICAgXG4gICAgICAgIGVycm9yc0NvbnRhaW5lciA9ICAnIycgKyAkZm9ybS5kYXRhKCdlcnJvcnMnKVxuICAgICAgICBoYW5kbGVyID0gJGZvcm0uZGF0YSgnaGFuZGxlcicpXG4gICAgICAgIGVycm9ycyA9ICcnXG4gICAgICAgIGludmFsaWRGaWVsZENvdW50ID0gMFxuICAgICAgICBkYXRhID0ge31cblxuICAgICAgICBpbnB1dHMgPSAkZm9ybS5maW5kICdpbnB1dDpub3QoW3R5cGU9cmFkaW9dLCBbdHlwZT1oaWRkZW5dKSwgdGV4dGFyZWEsIC5yYWRpb3MnXG4gICAgICAgIGlucHV0Q29udGFpbmVycyA9ICRmb3JtLmZpbmQoJy5pbnB1dCwgdGV4dGFyZWEsIC5yYWRpb3MnKVxuXG4gICAgICAgICQoaW5wdXRDb250YWluZXJzKS5yZW1vdmVDbGFzcygnaW52YWxpZCcpXG5cbiAgICAgICAgIyB0ZXh0Ym94ZXMgYW5kIHRleHQgaW5wdXRzXG4gICAgICAgIGlucHV0cy5lYWNoIChpLHQpID0+XG4gICAgICAgICAgICB2YWx1ZSA9ICcnXG4gICAgICAgICAgICB0eXBlID0gJCh0KS5kYXRhKCd0eXBlJylcbiAgICAgICAgICAgIHBhcmVudCA9ICQodCkucGFyZW50cygnLmlucHV0JykuZXEoMClcbiAgICAgICAgICAgIHJlcXVpcmVkID0gJChwYXJlbnQpLmhhc0NsYXNzKCdyZXF1aXJlZCcpIG9yICQodCkuaGFzQ2xhc3MoJ3JlcXVpcmVkJylcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaXNyYWRpbyA9ICQodCkuaGFzQ2xhc3MoJ3JhZGlvcycpXG4gICAgICAgICAgICBpZiBpc3JhZGlvIGFuZCAkKCdpbnB1dDpyYWRpb1tuYW1lPScgKyAkKHQpLmRhdGEoJ2dyb3VwJykgKyAnXTpjaGVja2VkJykuc2l6ZSgpIGlzIDFcbiAgICAgICAgICAgICAgICB2YWx1ZSA9ICQoJ2lucHV0OnJhZGlvW25hbWU9JyArICQodCkuZGF0YSgnZ3JvdXAnKSArICddOmNoZWNrZWQnKS52YWwoKS50cmltKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHZhbHVlID0gaWYgaXNyYWRpbyB0aGVuIHZhbHVlIGVsc2UgJCh0KS52YWwoKS50cmltKClcbiAgICAgICAgICAgIGRhdGFbJCh0KS5kYXRhKCdtYXBwaW5nJyldID0gdmFsdWVcblxuICAgICAgICAgICAgZmllbGROYW1lID0gaWYgJCh0KS5kYXRhKCduYW1lJykgdGhlbiAkKHQpLmRhdGEoJ25hbWUnKSBlbHNlICQodCkuYXR0cigncGxhY2Vob2xkZXInKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAjIHZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkc1xuICAgICAgICAgICAgaWYgcmVxdWlyZWQgYW5kICh2YWx1ZS5sZW5ndGggaXMgMClcbiAgICAgICAgICAgICAgICBlcnJvcnMgKz0gJzxsaT4nICsgZmllbGROYW1lICsgJyBpcyByZXF1aXJlZC48L2xpPidcbiAgICAgICAgICAgICAgICBpZiAkKHQpLnByb3AoJ3RhZ05hbWUnKS50b0xvd2VyQ2FzZSgpIGlzICd0ZXh0YXJlYScgb3IgJCh0KS5oYXNDbGFzcygncmFkaW9zJylcbiAgICAgICAgICAgICAgICAgICAgJCh0KS5hZGRDbGFzcygnaW52YWxpZCcpICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICQodCkucGFyZW50cygnLmlucHV0JykuYWRkQ2xhc3MoJ2ludmFsaWQnKVxuICAgICAgICAgICAgICAgIGludmFsaWRGaWVsZENvdW50KytcblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICMgdmFsaWRhdGUgaW5wdXQgdHlwZXNcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUubGVuZ3RoID4gMClcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ2VtYWlsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsUGF0dGVybiA9IC8vL14oW1xcdy4tXSspQChbXFx3Li1dKylcXC4oW2EtekEtWi5dezIsNn0pJCAvLy9pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgISB2YWx1ZS5tYXRjaCBlbWFpbFBhdHRlcm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JzICs9ICc8bGk+JyArIGZpZWxkTmFtZSArICcgaXMgbm90IGEgdmFsaWQgZW1haWwgYWRkcmVzcy48L2xpPidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0KS5wYXJlbnRzKCcuaW5wdXQnKS5hZGRDbGFzcygnaW52YWxpZCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludmFsaWRGaWVsZENvdW50KytcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBpc05hTih2YWx1ZSkgb3IgKHZhbHVlICUgMSAhPSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMgKz0gJzxsaT4nICsgZmllbGROYW1lICsgJyBpcyBub3QgYSB2YWxpZCBudW1iZXIuPC9saT4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodCkucGFyZW50cygnLmlucHV0JykuYWRkQ2xhc3MoJ2ludmFsaWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnZhbGlkRmllbGRDb3VudCsrXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGVuICdwaG9uZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXQgPSAvXlsoXXswLDF9WzAtOV17M31bKV17MCwxfVstXFxzXFwuXXswLDF9WzAtOV17M31bLVxcc1xcLl17MCwxfVswLTldezR9JC9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAhIHZhbHVlLm1hdGNoIHBhdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMgKz0gJzxsaT4nICsgZmllbGROYW1lICsgJyBpcyBub3QgYSB2YWxpZCBwaG9uZSBudW1iZXIuPC9saT4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodCkucGFyZW50cygnLmlucHV0JykuYWRkQ2xhc3MoJ2ludmFsaWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnZhbGlkRmllbGRDb3VudCsrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cbiAgICAgIFxuICAgICAgICAjIHZhbGlkYXRlIGRyb3Bkb3duIGxpc3RzXG4gICAgICAgIGlmIHdpbmRvdy5kZGxzP1xuICAgICAgICAgICAgJC5lYWNoIHdpbmRvdy5kZGxzLCAoaSwgZCkgPT5cbiAgICAgICAgICAgICAgICBkLnJlbW92ZUNsYXNzKCdpbnZhbGlkJylcbiAgICAgICAgICAgICAgICBkYXRhW2QubWFwcGluZ10gPSBkLnZhbHVlLnRyaW0oKVxuICAgICAgICAgICAgICAgIGlmIChkLnJlcXVpcmVkKSBhbmQgKGQudmFsdWUudHJpbSgpLmxlbmd0aCBpcyAwKVxuICAgICAgICAgICAgICAgICAgICBlcnJvcnMgKz0gJzxsaT4nICsgZC5uYW1lICsgJyBpcyByZXF1aXJlZC48L2xpPidcbiAgICAgICAgICAgICAgICAgICAgZC5hZGRDbGFzcygnaW52YWxpZCcpXG4gICAgICAgICAgICAgICAgICAgIGludmFsaWRGaWVsZENvdW50KysgICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgIHZhbGlkID0gaW52YWxpZEZpZWxkQ291bnQgaXMgMFxuICAgICAgICBlcnJvckh0bWwgPSBpZiB2YWxpZCB0aGVuICcnIGVsc2UgJzx1bD4nICsgZXJyb3JzICsgJzwvdWw+J1xuICAgICAgICBjbHMgPSBpZiB2YWxpZCB0aGVuICdzdWNjZXNzJyBlbHNlICdmYWlsdXJlJ1xuICAgICAgICAgICAgXG4gICAgICAgICQoZXJyb3JzQ29udGFpbmVyKS5yZW1vdmVDbGFzcygnc3VjY2VzcyBmYWlsdXJlJykuYWRkQ2xhc3MoY2xzKS5odG1sKGVycm9ySHRtbCkgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAjIGRpc3BsYXkgZXJyb3JzXG4gICAgICAgICQoZXJyb3JzQ29udGFpbmVyKS5zdG9wKCkuYW5pbWF0ZSh7XG4gICAgICAgICAgICBoZWlnaHQ6ICQoZXJyb3JzQ29udGFpbmVyKS5maW5kKCd1bCcpLmhlaWdodCgpXG4gICAgICAgIH0pXG4gICAgICAgICAgICBcbiAgICAgICAgcmVzcG9uc2UgPSB7XG4gICAgICAgICAgICB2YWxpZDogdmFsaWQsXG4gICAgICAgICAgICBoYW5kbGVyOiBoYW5kbGVyLFxuICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgIGNvbnRhaW5lcjogZXJyb3JzQ29udGFpbmVyXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlXG5cbiAgICBzdWJtaXRGb3JtOiAoZSwgcGFyZW50KSAtPlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgIFxuICAgICAgICB2YWxpZGF0aW9uID0gcGFyZW50LnZhbGlkYXRlKClcbiAgICAgICAgaWYgdmFsaWRhdGlvbi52YWxpZFxuICAgICAgICBcbiAgICAgICAgICAgICQuYWpheCBcbiAgICAgICAgICAgICAgICB1cmw6IHZhbGlkYXRpb24uaGFuZGxlcixcbiAgICAgICAgICAgICAgICBtZXRob2Q6XCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBkYXRhOiB2YWxpZGF0aW9uLmRhdGEsXG4gICAgICAgICAgICAgICAgY29tcGxldGU6IChyZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgcmVzID0gaWYgcmVzcG9uc2UucmVzcG9uc2VKU09OPyB0aGVuIHJlc3BvbnNlLnJlc3BvbnNlSlNPTiBlbHNlIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAnPGRpdiBpZD1cImNvbmNsdXNpb25cIj5Zb3VyIHN1Ym1pc3Npb24gZmFpbGVkLjwvZGl2PidcbiAgICAgICAgICAgICAgICAgICAgZ29vZCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIHJlcy5tZXNzYWdlP1xuICAgICAgICAgICAgICAgICAgICAgICAgZ29vZCA9IHJlcy5tZXNzYWdlIGlzICdzdWNjZXNzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgIyB0b2RvOiBjdXN0b21pemUgbWVzc2FnZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGdvb2RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gJzxkaXYgaWQ9XCJjb25jbHVzaW9uXCI+VGhhbmsgeW91LiAgV2UgaGF2ZSByZWNlaXZlZCB5b3VyIHJlcXVlc3QsIGFuZCB3aWxsIHJlcGx5IHRvIHlvdSBzaG9ydGx5LjwvZGl2PidcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIHNlcnZlciBzaWRlIHZhbGlkYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiByZXMuZXJyb3I/IGFuZCByZXMuZXJyb3IuZXJyb3JzP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gJzx1bCBpZD1cImNvbmNsdXNpb25cIj4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkLmVhY2ggcmVzLmVycm9yLmVycm9ycywgKGksIG9iaikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgKz0gJzxsaT4nICsgb2JqLm1lc3NhZ2UgKyAnPC9saT4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSAnPC91bD4nXG4gICAgXG4gICAgICAgICAgICAgICAgICAgIGNscyA9IGlmIGdvb2QgdGhlbiAnc3VjY2VzcycgZWxzZSAnZmFpbHVyZSdcbiAgICAgICAgICAgICAgICAgICAgJCh2YWxpZGF0aW9uLmNvbnRhaW5lcikucmVtb3ZlQ2xhc3MoJ3N1Y2Nlc3MgZmFpbHVyZScpLmFkZENsYXNzKGNscykuaHRtbChtZXNzYWdlKVxuXG4gICAgICAgICAgICAgICAgICAgICQodmFsaWRhdGlvbi5jb250YWluZXIpLnN0b3AoKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJCh2YWxpZGF0aW9uLmNvbnRhaW5lcikuZmluZCgnI2NvbmNsdXNpb24nKS5oZWlnaHQoKVxuICAgICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIGdvb2RcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5jbGVhckZvcm0oKVxuXG4gICAgY2xlYXJGb3JtOiAtPlxuXG4gICAgICAgICRmb3JtID0gQCRlbFxuICAgICAgICBcbiAgICAgICAgI3JhZGlvc1xuICAgICAgICByYWRpb3MgPSAkZm9ybS5maW5kICcucmFkaW9zJ1xuICAgICAgICByYWRpb3MucmVtb3ZlQ2xhc3MoJ2ludmFsaWQnKVxuICAgICAgICAkLmVhY2ggcmFkaW9zLCAoeCwgcikgPT5cbiAgICAgICAgICAgICQocmFkaW9zKS5maW5kKCdpbnB1dDpyYWRpbycpLnJlbW92ZUF0dHIoXCJjaGVja2VkXCIpXG4gICAgICAgIFxuICAgICAgICAjIGlucHV0c1xuICAgICAgICBpbnB1dHMgPSAkZm9ybS5maW5kICdpbnB1dDpub3QoW3R5cGU9cmFkaW9dKSwgdGV4dGFyZWEnXG4gICAgICAgIGlucHV0cy5yZW1vdmVDbGFzcygnaW52YWxpZCcpLnBhcmVudHMoJy5pbnB1dCcpLnJlbW92ZUNsYXNzKCdpbnZhbGlkJylcbiAgICAgICAgJC5lYWNoIGlucHV0cywgKGksIHQpID0+XG4gICAgICAgICAgICAkKHQpLnZhbCgnJylcblxuICAgICAgICAjIGRyb3Bkb3dubGlzdHNcbiAgICAgICAgaWYgd2luZG93LmRkbHM/XG4gICAgICAgICAgICAkLmVhY2ggd2luZG93LmRkbHMsIChpLCBkKSA9PlxuICAgICAgICAgICAgICAgIGQuY2xlYXJTZWxlY3Rpb24oKVxuICAgICAgICAgICAgICAgIFxuICAgIGFkZEV2ZW50czogLT5cbiAgICAgICAgc3VibWl0dGVyID0gIEAkZWwuZGF0YSgnc3VibWl0dGVyJylcbiAgICAgICAgdGhhdCA9IEBcbiAgICAgICAgJCgnIycgKyBzdWJtaXR0ZXIpLm9uICdjbGljaycsIChlKSAtPlxuICAgICAgICAgICAgdGhhdC5zdWJtaXRGb3JtIGUsIHRoYXRcblxuICAgICAgICAjIHRleHQgaW5wdXRzIFxuICAgICAgICBAJGVsLmZpbmQoJ2lucHV0Om5vdChbdHlwZT1yYWRpb10pLCB0ZXh0YXJlYScpLm9uICdibHVyJywgKGUpIC0+XG4gICAgICAgICAgICBpZiAkKEApLnBhcmVudHMoJy5pbnB1dCcpLmhhc0NsYXNzKCdpbnZhbGlkJykgb3IgJChAKS5oYXNDbGFzcygnaW52YWxpZCcpXG4gICAgICAgICAgICAgICAgdGhhdC52YWxpZGF0ZSgpXG5cbiAgICAgICAgIyByYWRpbyBidXR0b25zXG4gICAgICAgIEAkZWwuZmluZCgnaW5wdXQ6cmFkaW8nKS5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICAgICAgICAgIGlmICQoQCkucGFyZW50cygnLnJhZGlvcycpLmhhc0NsYXNzKCdpbnZhbGlkJylcbiAgICAgICAgICAgICAgICB0aGF0LnZhbGlkYXRlKClcblxuICAgICAgICAjIGRyb3AgZG93biBsaXN0c1xuICAgICAgICBpZiB3aW5kb3cuZGRscz9cbiAgICAgICAgICAgICQuZWFjaCB3aW5kb3cuZGRscywgKGksIGQpID0+IFxuICAgICAgICAgICAgICAgIGlmIChkLnJlcXVpcmVkKSBcbiAgICAgICAgICAgICAgICAgICAgaGlkZGVuRmllbGQgPSBkLmlucHV0WzBdXG4gICAgICAgICAgICAgICAgICAgICQoaGlkZGVuRmllbGQpLm9uICdjaGFuZ2UnLCAoZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQudmFsaWRhdGUoKVxuICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBGb3JtSGFuZGxlclxuIiwiZ2xvYmFscyA9IHJlcXVpcmUgJy4uL2dsb2JhbC9pbmRleC5jb2ZmZWUnXG5QbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIEhlYWRlckFuaW1hdGlvbiBleHRlbmRzIFBsdWdpbkJhc2VcblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgXG4gICAgICAgIEBib2R5ID0gJChcImJvZHlcIilcbiAgICAgICAgQGh0bWwgPSAkKFwiaHRtbFwiKVxuICAgICAgICBAY29udGVudCA9ICQoXCIjY29udGVudFwiKVxuICAgICAgICBAbW9ibmF2ID0gJChcIiNtb2JpbGUtaGVhZGVyLW5hdlwiKVxuICAgICAgICBAc3VibmF2ID0gJChcIi5zdWJuYXZcIilcbiAgICAgICAgQHN1Ym5hdlNob3dpbmcgPSBmYWxzZVxuICAgICAgICBAb3VyUGFya3NMZWZ0ID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwib3VyLXBhcmtzXCJdJykub2Zmc2V0KCkubGVmdFxuICAgICAgICBAcGFydG5lcnNoaXBMZWZ0ID0gJCgnLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwicGFydG5lcnNoaXBzXCJdJykub2Zmc2V0KCkubGVmdFxuICAgICAgICBcblxuICAgICAgICBzdXBlcihvcHRzKSAgXG5cblxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgIHN1cGVyKCkgICAgXG4gICAgICAgIEBzaG93SW5pdGlhbFN1Yk5hdigpICAgICAgICBcblxuICAgIGFkZEV2ZW50czogLT5cbiAgICAgICAgaWYgISQoJ2h0bWwnKS5oYXNDbGFzcyAndGFibGV0J1xuICAgICAgICAgICAgJCgnLm5hdi1saXN0IGEgbGknKS5vbiAnbW91c2VlbnRlcicsIEBoYW5kbGVOYXZIb3ZlclxuICAgICAgICAgICAgJCgnaGVhZGVyJykub24gJ21vdXNlbGVhdmUnLCBAaGlkZVN1Yk5hdlxuICAgICAgICBcbiAgICAgICAgd2luZG93Lm9ucmVzaXplID0gQGhhbmRsZVJlc2l6ZVxuICAgICAgICBAYm9keS5maW5kKFwiI25hdmJhci1tZW51XCIpLm9uICdjbGljaycsIEB0b2dnbGVOYXZcbiAgICAgICAgJCgnI21vYmlsZS1oZWFkZXItbmF2IGEnKS5vbiAnY2xpY2snLCBAc2hvd01vYmlsZVN1Yk5hdlxuICAgICAgICAkKCcjbW9iaWxlLWhlYWRlci1uYXYgaScpLm9uICdjbGljaycsIEBoYW5kbGVBcnJvd0NsaWNrXG4gICAgICAgIFxuICAgICAgICBAYm9keS5maW5kKCcudG9nZ2xlLW5hdicpLm9uICdjbGljaycsICgpIC0+XG4gICAgICAgICAgICAkKEApLnBhcmVudHMoJ2hlYWRlcicpLmZpbmQoJyNuYXZiYXItbWVudSBpbWcnKS50cmlnZ2VyKCdjbGljaycpXG4gICAgICAgICAgICBcbiAgICAgICAgJCgnI21vYmlsZS1oZWFkZXItbmF2Jykub24gJ2NsaWNrJywgJy5tb2JpbGUtc3ViLW5hdiBsaScsIEBvbkNsaWNrTW9iaWxlU3ViTmF2TGlua1xuICAgICAgICBcbiAgICBcbiAgICBoYW5kbGVTdWJOYXY6ID0+XG4gICAgICAgIHN0YXJ0UGFnZSA9ICQoJy5zdWJuYXYnKS5kYXRhICdwYWdlJ1xuICAgICAgICBpZCA9ICQoJy5uYXYtbGlzdCBhW2RhdGEtcGFnZS1zaG9ydD1cIicgKyBzdGFydFBhZ2UgKyAnXCJdJykuZGF0YSAncGFnZSdcbiAgICAgICAgQHNob3dTdWJOYXZMaW5rcyhpZClcbiAgICAgICAgXG4gICAgc2hvd0luaXRpYWxTdWJOYXY6ID0+XG4gICAgICAgIHNlY3Rpb24gPSAkKCcuc3VibmF2JykuZGF0YSAncGFnZSdcbiAgICAgICAgXG4gICAgICAgIGlmIHNlY3Rpb24gPT0gJ29mZmVyaW5ncycgfHwgc2VjdGlvbiA9PSAnYWNjb21tb2RhdGlvbnMnIHx8IHNlY3Rpb24gPT0gJ291cnBhcmtzJ1xuICAgICAgICAgICAgQHNob3dTdWJOYXZMaW5rcygnb3VyLXBhcmtzJylcbiAgICAgICAgZWxzZSBpZiBzZWN0aW9uID09ICdwYXJ0bmVyc2hpcC1kZXRhaWxzJyB8fCBzZWN0aW9uID09ICdwYXJ0bmVyc2hpcCdcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MoJ3BhcnRuZXJzaGlwcycpXG4gICAgICAgIFxuICAgIHRvZ2dsZU5hdjogKGUpID0+XG4gICAgICAgICAgICAgICAgXG4gICAgaGFuZGxlUmVzaXplOiA9PlxuICAgICAgICBAaGFuZGxlU3ViTmF2KClcbiAgICAgICAgQGFkanVzdE1vYmlsZU5hdigpXG4gICAgICAgIFxuICAgICAgICBcbiAgICBwb3NpdGlvblN1Yk5hdkxpc3RzOiA9PlxuICAgICAgICAjY29uc29sZS5sb2cgJ3Bvc2l0aW9uU3ViTmF2TGlzdHMnXG4jICAgICAgICBvdXJQYXJrc0xlZnQgPSAkKCcubmF2LWxpc3QgYVtkYXRhLXBhZ2U9XCJvdXItcGFya3NcIl0nKS5vZmZzZXQoKS5sZWZ0XG4jICAgICAgICBwYXJ0bmVyc2hpcExlZnQgPSAkKCcubmF2LWxpc3QgYVtkYXRhLXBhZ2U9XCJwYXJ0bmVyc2hpcHNcIl0nKS5vZmZzZXQoKS5sZWZ0ICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZiAkKCcjaGVhZGVyLXRvcCcpLmhhc0NsYXNzICdzbWFsbCdcbiAgICAgICAgICAgIGlmIHdpbmRvdy5pbm5lcldpZHRoIDwgOTkzXG4gICAgICAgICAgICAgICAgJCgnI291ci1wYXJrcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBvdXJQYXJrc0xlZnQgLSA5MClcbiAgICAgICAgICAgICAgICAkKCcjcGFydG5lcnNoaXBzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQHBhcnRuZXJzaGlwTGVmdCAtIDEzMylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAkKCcjb3VyLXBhcmtzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQG91clBhcmtzTGVmdCAtIDkwKVxuICAgICAgICAgICAgICAgICQoJyNwYXJ0bmVyc2hpcHMtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAcGFydG5lcnNoaXBMZWZ0IC0gMTE4KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiB3aW5kb3cuaW5uZXJXaWR0aCA8IDk5M1xuICAgICAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBAb3VyUGFya3NMZWZ0IC0gNjApXG4gICAgICAgICAgICAgICAgJCgnI3BhcnRuZXJzaGlwcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBwYXJ0bmVyc2hpcExlZnQgLSAxMDUpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgJCgnI291ci1wYXJrcy1zdWJuYXYtbGlzdCcpLmNzcygnbGVmdCcsIEBvdXJQYXJrc0xlZnQgLSA2MClcbiAgICAgICAgICAgICAgICAkKCcjcGFydG5lcnNoaXBzLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgQHBhcnRuZXJzaGlwTGVmdCAtIDkwKVxuXG4gICAgYW5pbWF0ZUhlYWRlcjogKHNjcm9sbFkpID0+XG4gICAgICAgIGlmIEBodG1sLmhhc0NsYXNzICdwaG9uZSdcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICRodCA9IEAkZWwuZmluZCgnI2hlYWRlci10b3AnKVxuICAgICAgICAkaGIgPSBAJGVsLmZpbmQoJyNoZWFkZXItYm90dG9tJykgXG5cbiAgICAgICAgaWYgc2Nyb2xsWSA+IDg1IFxuICAgICAgICAgICAgaWYgIUBuYXZDb2xsYXBzZWRcbiAgICAgICAgICAgICAgICAkKCcjaGVhZGVyLXRvcCwgI2hlYWRlci1ib3R0b20sICNuYXZiYXItbG9nbywgLm5hdi1saXN0LCAjYnV5LCAuaGVhZGVyLWNvbnRhY3QsIC5oZWFkZXItc29jaWFsJykuYWRkQ2xhc3MoJ3NtYWxsJylcbiAgICAgICAgICAgICAgICBAbmF2Q29sbGFwc2VkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIEBwb3NpdGlvblN1Yk5hdkxpc3RzKCkgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIEBuYXZDb2xsYXBzZWRcbiAgICAgICAgICAgICAgICAkKCcjaGVhZGVyLXRvcCwgI2hlYWRlci1ib3R0b20sICNuYXZiYXItbG9nbywgLm5hdi1saXN0LCAjYnV5LCAuaGVhZGVyLWNvbnRhY3QsIC5oZWFkZXItc29jaWFsJykucmVtb3ZlQ2xhc3MoJ3NtYWxsJylcbiAgICAgICAgICAgICAgICBAbmF2Q29sbGFwc2VkID0gZmFsc2VcbiAgICAgICAgICAgICAgICBAaGFuZGxlU3ViTmF2KClcbiAgICAgICAgICAgICAgICBAcG9zaXRpb25TdWJOYXZMaXN0cygpIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgaGFuZGxlTmF2SG92ZXI6IChlKSA9PlxuICAgICAgICBwYXJlbnRJRCA9ICQoZS50YXJnZXQpLnBhcmVudCgpLmRhdGEoJ3BhZ2UnKVxuICAgICAgICBpZiAkKCcjJyArIHBhcmVudElEICsgJy1zdWJuYXYtbGlzdCcpLmZpbmQoJ2EnKS5sZW5ndGggPCAxXG4gICAgICAgICAgICBAaGlkZVN1Yk5hdigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBoaWRlU3ViTmF2TGlua3MoKVxuICAgICAgICAgICAgQHNob3dTdWJOYXZMaW5rcyhwYXJlbnRJRClcbiAgICAgICAgXG4gICAgICAgICAgICBpZiAhQHN1Ym5hdlNob3dpbmdcbiAgICAgICAgICAgICAgICBAc2hvd1N1Yk5hdigpXG4gICAgICAgICAgICAgIFxuICAgIHNob3dTdWJOYXY6ID0+XG4gICAgICAgIEBzdWJuYXYuYWRkQ2xhc3MoJ3Nob3dpbmcnKVxuICAgICAgICBAc3VibmF2U2hvd2luZyA9IHRydWVcbiAgICAgICAgXG4gICAgaGlkZVN1Yk5hdjogPT5cbiAgICAgICAgQHN1Ym5hdi5yZW1vdmVDbGFzcygnc2hvd2luZycpXG4gICAgICAgIEBzdWJuYXZTaG93aW5nID0gZmFsc2VcbiAgICAgICAgQGhhbmRsZVN1Yk5hdigpXG5cbiAgICBzaG93U3ViTmF2TGlua3M6IChwYWdlKSA9PlxuICAgICAgICBpZiBwYWdlP1xuICAgICAgICAgICAgbGVmdCA9ICQoJy5uYXYgLm5hdi1saXN0IGFbZGF0YS1wYWdlPVwiJyArIHBhZ2UgKyAnXCJdJykucG9zaXRpb24oKS5sZWZ0XG4gICAgICAgICAgICBvZmZzZXQgPSAwXG4gICAgICAgICAgICBoZWxwZXIgPSAtNDUgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHdpbmRvdy5pbm5lcldpZHRoIDwgOTkzXG4gICAgICAgICAgICAgICAgaGVscGVyID0gLTIwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICNjb25zb2xlLmxvZyAncGFnZTogJywgcGFnZVxuICAgICAgICAgICAgI2NvbnNvbGUubG9nICdiOiAnLCAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0IGEnKS5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgJCgnIycgKyBwYWdlICsgJy1zdWJuYXYtbGlzdCBhJykubGVuZ3RoIDwgM1xuICAgICAgICAgICAgICAgIGZvciBhIGluICQoJyMnICsgcGFnZSArICctc3VibmF2LWxpc3QgYScpXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IG9mZnNldCArICQoYSkud2lkdGgoKVxuXG4gICAgICAgICAgICBpZiBvZmZzZXQgPiAwXG4gICAgICAgICAgICAgICAgI2NvbnNvbGUubG9nICdhJ1xuICAgICAgICAgICAgICAgICQoJyMnICsgcGFnZSArICctc3VibmF2LWxpc3QnKS5jc3MoJ2xlZnQnLCBsZWZ0IC0gKG9mZnNldCAvIDMpKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICNjb25zb2xlLmxvZyAnYidcbiMgICAgICAgICAgICAgICAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0JykuY3NzKCdsZWZ0JywgbGVmdCArIGhlbHBlcilcbiAgICAgICAgICAgICAgICBAcG9zaXRpb25TdWJOYXZMaXN0cygpXG4gICAgICAgICAgICAkKCcjJyArIHBhZ2UgKyAnLXN1Ym5hdi1saXN0JykuYWRkQ2xhc3MoJ3Nob3dpbmcnKVxuICAgIFxuICAgIGhpZGVTdWJOYXZMaW5rczogPT5cbiAgICAgICAgJCgnLnN1Ym5hdi1saXN0IGxpJykucmVtb3ZlQ2xhc3MoJ3Nob3dpbmcnKVxuICAgICAgICBcbiAgICBoYW5kbGVTdWJOYXY6ID0+XG4gICAgICAgIGlmICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygnb3VycGFya3MnKSB8fCAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ29mZmVyaW5ncycpIHx8ICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygnYWNjb21tb2RhdGlvbnMnKVxuICAgICAgICAgICAgJCgndWwuc3VibmF2LWxpc3QgbGknKS5yZW1vdmVDbGFzcyAnc2hvd2luZydcbiAgICAgICAgICAgICQoJyNvdXItcGFya3Mtc3VibmF2LWxpc3QnKS5hZGRDbGFzcyAnc2hvd2luZydcbiAgICAgICAgICAgIEBzaG93U3ViTmF2TGlua3MoJ291ci1wYXJrcycpXG5cbiAgICAgICAgICAgIGlmICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygnb2ZmZXJpbmdzJylcbiAgICAgICAgICAgICAgICAkKCdhI291ci1wYXJrcy1vZmZlcmluZ3Mtc3VibmF2LWxpbmsnKS5hZGRDbGFzcyAnc2VsZWN0ZWQnXG5cbiAgICAgICAgICAgIGlmICQoJyNoZWFkZXItYm90dG9tIC5zdWJuYXYnKS5oYXNDbGFzcygnYWNjb21tb2RhdGlvbnMnKVxuICAgICAgICAgICAgICAgICQoJ2Ejb3VyLXBhcmtzLWFjY29tbW9kYXRpb25zLXN1Ym5hdi1saW5rJykuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cbiAgICAgICAgZWxzZSBpZiAkKCcjaGVhZGVyLWJvdHRvbSAuc3VibmF2JykuaGFzQ2xhc3MoJ3BhcnRuZXJzaGlwJykgfHwgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdwYXJ0bmVyc2hpcC1kZXRhaWxzJylcbiAgICAgICAgICAgICQoJ3VsLnN1Ym5hdi1saXN0IGxpJykucmVtb3ZlQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICAgICAkKCcjcGFydG5lcnNoaXBzLXN1Ym5hdi1saXN0JykuYWRkQ2xhc3MgJ3Nob3dpbmcnXG4gICAgICAgICAgICBAc2hvd1N1Yk5hdkxpbmtzKCdwYXJ0bmVyc2hpcHMnKVxuXG4jICAgICAgICAgICAgaWYgJCgnI2hlYWRlci1ib3R0b20gLnN1Ym5hdicpLmhhc0NsYXNzKCdwYXJ0bmVyc2hpcC1kZXRhaWxzJylcbiMgICAgICAgICAgICAgICAgJCgnYSNwYXJ0bmVyc2hpcC1kZXRhaWxzLXN1Ym5hdi1saW5rJykuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG5cbiM9PT09PT09PT09PT09PT09PT09Iz09PT09PT09PT09PT09PT09PT0jPT09PT09PT09PT09PT09PT09PSNcbiM9PT09PT09PT09PT09PT09PT09ICBNT0JJTEUgU1RBUlRTIEhFUkUgPT09PT09PT09PT09PT09PT09I1xuIz09PT09PT09PT09PT09PT09PT0jPT09PT09PT09PT09PT09PT09PSM9PT09PT09PT09PT09PT09PT09IyBcblxuICAgIHRvZ2dsZU5hdjogKGUpID0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAkdCA9ICQoZS50YXJnZXQpXG4gICAgICAgICRoYiA9ICQoJyNoZWFkZXItYm90dG9tJylcbiAgICAgICAgJG1uID0gJCgnI21vYmlsZS1oZWFkZXItbmF2JylcbiAgICAgICAgJGhoID0gJGhiLmhlaWdodCgpXG5cbiAgICAgICAgJHQudG9nZ2xlQ2xhc3MoJ2Nsb3NlZCcpXG5cbiAgICAgICAgY29uc29sZS5sb2cgJ3NlY29uZCB0b2dnbGUnXG4gICAgICAgIGNvbnNvbGUubG9nICR0XG4gICAgICAgIFxuICAgICAgICBpZiAkdC5oYXNDbGFzcygnY2xvc2VkJylcbiAgICAgICAgICAgIEBhZGp1c3RNb2JpbGVOYXYoKVxuICAgICAgICAgICAgVHdlZW5NYXgudG8gQG1vYm5hdiwgLjM1LCBcbiAgICAgICAgICAgICAgICB7eTogKDgwMCArICRoaClcbiAgICAgICAgICAgICAgICAsejogMFxuICAgICAgICAgICAgICAgICxlYXNlOiBQb3dlcjEuZWFzZU91dFxuICAgICAgICAgICAgICAgICxvbkNvbXBsZXRlOiA9PlxuICAgICAgICAgICAgICAgICAgICBUd2Vlbk1heC5zZXQgQG1vYm5hdixcbiAgICAgICAgICAgICAgICAgICAgICAgIHo6IDEwXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBUd2Vlbk1heC5zZXQgQG1vYm5hdixcbiAgICAgICAgICAgICAgICB6OiAtMiBcbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvIEBtb2JuYXYsIC41LCB7eTogMCwgejogMCwgZWFzZTogUG93ZXIxLmVhc2VJbn1cbiAgICAgICAgICAgICQoJy5tb2JpbGUtc3ViLW5hdicpLmNzcygnaGVpZ2h0JywgJzBweCcpXG4gICAgICAgICAgICBAYWRqdXN0TW9iaWxlTmF2XG4gICAgICAgICAgICBAaGlkZU1vYmlsZVN1Yk5hdigpXG4gICAgICAgICAgICBUd2Vlbk1heC5zZXQgQGNvbnRlbnQgLFxuICAgICAgICAgICAgICAgIHk6IDBcblxuICAgIGFkanVzdE1vYmlsZU5hdjogPT5cbiAgICAgICAgJGhiID0gJCgnI2hlYWRlci1ib3R0b20nKVxuICAgICAgICAkbW4gPSAkKCcjbW9iaWxlLWhlYWRlci1uYXYnKVxuICAgICAgICAjIFNldCBuYXYgaGVpZ2h0IHRvIDM1MHB4IGV2ZXJ5IHRpbWUgYmVmb3JlIGFkanVzdGluZ1xuICAgICAgICAjJG1uLmNzcyB7aGVpZ2h0OiAzNTB9XG4gICAgICAgICRoaCA9ICRoYi5oZWlnaHQoKVxuICAgICAgICAkbmggPSAkbW4uaGVpZ2h0KClcbiAgICAgICAgJGl3ID0gd2luZG93LmlubmVyV2lkdGhcbiAgICAgICAgJGloID0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgICRtYiA9ICQoJyNuYXZiYXItbWVudScpXG5cbiAgICAgICAgaWYgJG5oID4gJGloXG4gICAgICAgICAgICAkbW4uY3NzIHtoZWlnaHQ6ICgkaWggLSAkaGgpLCBvdmVyZmxvdzogJ3Njcm9sbCd9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICRtbi5jc3Mge2hlaWdodDogNDAwICsgJ3B4J30gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgc2hvd01vYmlsZVN1Yk5hdjogKGUpID0+XG4gICAgICAgIHRoaXNTdWJOYXYgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKS5maW5kICcubW9iaWxlLXN1Yi1uYXYnXG4gICAgICAgIFxuICAgICAgICBpZiAodGhpc1N1Yk5hdi5maW5kKCdsaScpLmxlbmd0aCA8IDEpXG4gICAgICAgICAgICBAaGlkZU1vYmlsZVN1Yk5hdigpXG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiAhKCQoZS50YXJnZXQpLnBhcmVudCgpLmhhc0NsYXNzKCdhY3RpdmUnKSlcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgXG4gICAgICAgIGhvd01hbnkgPSB0aGlzU3ViTmF2LmZpbmQoJ2xpJykubGVuZ3RoXG4gICAgICAgIHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICB0YXJnZXQgPSAkKGUudGFyZ2V0KVxuXG4gICAgICAgIEBoaWRlTW9iaWxlU3ViTmF2KClcbiAgICAgICAgdGFyZ2V0LmZpbmQoJ2knKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICB0YXJnZXQuYWRkQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgdGFyZ2V0LnBhcmVudHMoJ2EnKS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICBAbW9ibmF2LmNzcygnaGVpZ2h0JywgKHdpbmRvd0hlaWdodCAtIDEwMCkgKyAncHgnKVxuICAgICAgICB0aGlzU3ViTmF2LmNzcygnaGVpZ2h0JywgKGhvd01hbnkgKiA1MCkgKyAncHgnKVxuICAgICAgICBcbiAgICBoaWRlTW9iaWxlU3ViTmF2OiA9PlxuICAgICAgICAkKCcubW9iaWxlLXN1Yi1uYXYnKS5jc3MoJ2hlaWdodCcsICcwcHgnKVxuICAgICAgICBAbW9ibmF2LmNzcygnaGVpZ2h0JywgJzQwMHB4JylcbiAgICAgICAgQG1vYm5hdi5maW5kKCdpJykucmVtb3ZlQ2xhc3MgJ2FjdGl2ZSdcbiAgICAgICAgQG1vYm5hdi5maW5kKCdsaScpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgIEBtb2JuYXYuZmluZCgndWwgYScpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG5cbiAgICBcbiAgICBoYW5kbGVBcnJvd0NsaWNrOiAoZSkgPT5cbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgXG4gICAgICAgIGlmICQoZS50YXJnZXQpLmhhc0NsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICBAaGlkZU1vYmlsZVN1Yk5hdigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoJ2xpJykudHJpZ2dlciAnY2xpY2snXG4gICAgICAgIFxuICAgICAgICBcbiAgICBvbkNsaWNrTW9iaWxlU3ViTmF2TGluazogKGUpID0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIFxuICAgICAgICBpZiAkKGUudGFyZ2V0KS5kYXRhKCdocmVmJyk/XG4gICAgICAgICAgICB1cmwgPSAkKGUudGFyZ2V0KS5kYXRhICdocmVmJ1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmxcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWRlckFuaW1hdGlvblxuXG5cbiIsIlxuUGx1Z2luQmFzZSA9IHJlcXVpcmUgJy4uL2Fic3RyYWN0L1BsdWdpbkJhc2UuY29mZmVlJ1xuXG5jbGFzcyBOZXdzUm9vbSBleHRlbmRzIFBsdWdpbkJhc2VcblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgQCRlbCA9ICQob3B0cy5lbClcbiAgICAgICAgQGlzUGhvbmUgPSBvcHRzLmlzUGhvbmVcbiAgICAgICAgc3VwZXIob3B0cylcbiAgICBcblxuICAgIGluaXRpYWxpemU6IC0+XG4gICAgICAgIEByZXNpemVOZXdzQ29udGFpbmVyKClcbiAgICAgICAgc3VwZXIoKVxuXG4gICAgYWRkRXZlbnRzOiAtPlxuICAgICAgICAkKCcuc2VsZWN0LW5ld3MteWVhci13cmFwcGVyJykub24gJ2NsaWNrJywgJ2EnLCBAc3dpdGNoWWVhcnNcbiAgICAgICAgJCgnLnNlbGVjdC1uZXdzLWJ1dHRvbi13cmFwcGVyJykub24gJ2NsaWNrJywgJ2EnLCBAc3dpdGNoUGFnZVxuICAgICAgICBcbiAgICBzd2l0Y2hZZWFyczogKGUpID0+XG4gICAgICAgIGlmICQoZS50YXJnZXQpLmhhc0NsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBhY3RpdmVZZWFyID0gJCgnLnNlbGVjdC1uZXdzLXBvc3RzLXdyYXBwZXIgLm5ld3MteWVhci13cmFwcGVyLnZpc2libGUnKVxuICAgICAgICB0YXJnZXRZZWFyID0gJCgnLnNlbGVjdC1uZXdzLXBvc3RzLXdyYXBwZXIgLm5ld3MteWVhci13cmFwcGVyLicgKyAkKGUudGFyZ2V0KS50ZXh0KCkpXG4gICAgICAgIFxuICAgICAgICAkKCcuc2VsZWN0LW5ld3MteWVhci13cmFwcGVyIGEnKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAkKGUudGFyZ2V0KS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgIFxuICAgICAgICBhY3RpdmVZZWFyLnJlbW92ZUNsYXNzKCd2aXNpYmxlJylcbiAgICAgICAgdGFyZ2V0WWVhci5hZGRDbGFzcygndmlzaWJsZScpXG4gICAgICAgIFxuICAgICAgICBAcmVzaXplTmV3c0NvbnRhaW5lcigpXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgc3dpdGNoUGFnZTogKGUpID0+XG4gICAgICAgIGlmICQoZS50YXJnZXQpLmhhc0NsYXNzICdhY3RpdmUnXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIFxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgYWN0aXZlUGFnZSA9ICQoJy5zZWxlY3QtbmV3cy1wYWdlcy13cmFwcGVyJykuY2hpbGRyZW4oJ2Rpdi52aXNpYmxlJylcbiAgICAgICAgdGFyZ2V0UGFnZSA9ICQoJy4nICsgJChlLnRhcmdldCkuZGF0YSgncGFnZScpKVxuICAgICAgICBcbiAgICAgICAgJCgnLnNlbGVjdC1uZXdzLWJ1dHRvbi13cmFwcGVyIGEnKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAkKGUudGFyZ2V0KS5hZGRDbGFzcyAnYWN0aXZlJ1xuICAgICAgICBcbiAgICAgICAgYWN0aXZlUGFnZS5yZW1vdmVDbGFzcygndmlzaWJsZScpXG4gICAgICAgIHRhcmdldFBhZ2UuYWRkQ2xhc3MoJ3Zpc2libGUnKVxuXG4gICAgc3dpdGNoVG9QYWdlOiAodGFyZ2V0KSA9PlxuICAgICAgICBhY3RpdmVQYWdlID0gJCgnLnNlbGVjdC1uZXdzLXBhZ2VzLXdyYXBwZXInKS5jaGlsZHJlbignZGl2LnZpc2libGUnKVxuICAgICAgICB0YXJnZXRQYWdlID0gJCgnLicgKyB0YXJnZXQpXG4gICAgICAgIGNvbnNvbGUubG9nIHRhcmdldFxuICAgICAgICBhY3RpdmVQYWdlLnJlbW92ZUNsYXNzKCd2aXNpYmxlJylcbiAgICAgICAgdGFyZ2V0UGFnZS5hZGRDbGFzcygndmlzaWJsZScpXG5cblxuICAgIHJlc2l6ZU5ld3NDb250YWluZXI6ID0+XG4gICAgICAgIGFjdGl2ZVllYXIgPSAkKCcuc2VsZWN0LW5ld3MteWVhci13cmFwcGVyIGEuYWN0aXZlJykudGV4dCgpXG4gICAgICAgIGFjdGl2ZVdyYXBwZXIgPSAkKCcubmV3cy15ZWFyLXdyYXBwZXIuJyArIGFjdGl2ZVllYXIpXG4gICAgICAgIFxuICAgICAgICBoZWlnaHQgPSAwXG4gICAgICAgIFxuICAgICAgICBmb3IgcG9zdCBpbiAkKGFjdGl2ZVdyYXBwZXIpLmZpbmQoJy5wb3N0JylcbiAgICAgICAgICAgIHBvc3RIZWlnaHQgPSAkKHBvc3QpLmhlaWdodCgpICAgICAgICAgICAgXG4gICAgICAgICAgICBoZWlnaHQgPSBoZWlnaHQgKyBwb3N0SGVpZ2h0XG4gICAgICAgICAgICBcbiAgICAgICAgJCgnLnNlbGVjdC1uZXdzLXBvc3RzLXdyYXBwZXInKS5jc3MoJ2hlaWdodCcsIGhlaWdodClcbiAgICAgICAgaWYgQGlzUGhvbmVcbiAgICAgICAgICAgIGhlaWdodCA9IGlmICQoJy5zZWxlY3QtbmV3cy1tZWRpYS1mb3JtJykuaGVpZ2h0KCkgPiBoZWlnaHQgdGhlbiAkKCcuc2VsZWN0LW5ld3MtbWVkaWEtZm9ybScpLmhlaWdodCgpIGVsc2UgaGVpZ2h0XG4gICAgICAgICAgICAkKCcuc2VsZWN0LW5ld3MtcGFnZXMtd3JhcHBlcicpLmNzcygnaGVpZ2h0JywgZXZhbChoZWlnaHQgKyA3NSkgKyAncHgnKTtcbiAgICAgICAgXG5cbm1vZHVsZS5leHBvcnRzID0gTmV3c1Jvb21cblxuIiwiXG5QbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5WaWRlb092ZXJsYXkgPSByZXF1aXJlICcuL1ZpZGVvT3ZlcmxheS5jb2ZmZWUnXG5cbmNsYXNzIFBhcmtzTGlzdCBleHRlbmRzIFBsdWdpbkJhc2VcblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgQCRlbCA9ICQob3B0cy5lbClcbiAgICAgICAgc3VwZXIob3B0cykgICAgICAgICBcbiAgICAgICAgQGdhbGxlcnkgPSBvcHRzLmdhbGxlcnlcbiAgICAgICAgaWYgQGdhbGxlcnk/XG4gICAgICAgICAgICBAZ2FsbGVyeS5vbiBcIml0ZW1JbmRleFwiICwgQHNlbGVjdExvZ29cbiAgICAgICAgICAgIFxuICAgICAgICBAcGFnZSA9IG9wdHMucGFnZVxuXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgICAgQHBhcmtMb2dvcyA9ICQoQCRlbCkuZmluZCBcImxpXCJcbiAgICAgICAgQGN1cnJlbnRTZWxlY3RlZCA9IEBwYXJrTG9nb3MuZmlsdGVyKFwiOmZpcnN0LWNoaWxkXCIpXG4gICAgICAgIGlmIEBnYWxsZXJ5P1xuICAgICAgICAgICAgQHNlbGVjdExvZ28gQHNlbGVjdGVkTG9nbygpXG4gICAgICAgICAgICBAZ2FsbGVyeS5nb3RvIEBzZWxlY3RlZExvZ28oKSwgdHJ1ZVxuICAgICAgICBzdXBlcigpXG5cbiAgICBhZGRFdmVudHM6IC0+XG4gICAgICAgIEAkZWwub24gJ2NsaWNrJywgJ2xpLnBhcmsnLCBAaGFuZGxlTG9nb0ludGVyYWN0aW9uXG4gICAgICAgIFxuICAgICAgICBAcGFya0xvZ29zLmVhY2ggKGksdCkgPT5cbiAgICAgICAgICAgIGxvZ29FdmVudHMgPSBuZXcgSGFtbWVyKHQpXG4gICAgICAgICAgICBsb2dvRXZlbnRzLm9uICd0YXAnICwgQGhhbmRsZUxvZ29JbnRlcmFjdGlvblxuXG4gICAgaGFuZGxlTG9nb0ludGVyYWN0aW9uOiAoZSkgPT5cbiAgICAgICAgaWYgQHBhZ2UgPT0gJ2FjY29tbW9kYXRpb24nXG4gICAgICAgICAgICBAcGFya0xvZ29zLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcbiAgICAgICAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoJ2xpLnBhcmsnKS5hZGRDbGFzcyAnc2VsZWN0ZWQnXG4gICAgICAgICAgICB3aGljaFBhcmsgPSAkKGUudGFyZ2V0KS5wYXJlbnRzKCdsaS5wYXJrJykuYXR0cignaWQnKVxuICAgICAgICAgICAgQHNob3dOZXdBY2NvbW1vZGF0aW9ucyh3aGljaFBhcmspXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgXG4gICAgICAgICR0YXJnZXQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdsaScpXG5cbiAgICAgICAgaWQgPSAkdGFyZ2V0LmRhdGEoJ2lkJylcbiAgICAgICAgXG4gICAgICAgIEBkaXNwbGF5Q29udGVudCBpZFxuICAgICAgICBcbiAgICAgICAgXG4gICAgc2hvd05ld0FjY29tbW9kYXRpb25zOiAocGFyaykgPT5cbiAgICAgICAgJCgnI2FjY29tbW9kYXRpb25zLWdhbGxlcnkgLnN3aXBlci1jb250YWluZXInKS5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgICAgICAkKCcjYWNjb21tb2RhdGlvbnMtZ2FsbGVyeSAuY2Fyb3VzZWwtd3JhcHBlcicpLnJlbW92ZUNsYXNzICdhY3RpdmUnXG4gICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IC5zd2lwZXItY29udGFpbmVyW2RhdGEtbG9nbz1cIicgKyBwYXJrICsgJ1wiXScpLmFkZENsYXNzICdhY3RpdmUnXG4gICAgICAgICQoJyNhY2NvbW1vZGF0aW9ucy1nYWxsZXJ5IC5zd2lwZXItY29udGFpbmVyW2RhdGEtbG9nbz1cIicgKyBwYXJrICsgJ1wiXScpLnBhcmVudCgpLmFkZENsYXNzICdhY3RpdmUnXG5cbiAgICBkaXNwbGF5Q29udGVudDogKGlkKSAtPlxuXG5cbiAgICAgICAgQHNlbGVjdExvZ28oaWQpXG5cbiAgICAgICAgI1N3aXRjaCBJbmZvIEJveGVzXG4gICAgICAgIEBnYWxsZXJ5LmdvdG8oaWQpXG5cblxuICAgIHNlbGVjdExvZ286IChpZCkgPT5cbiAgICAgICAgbG9nb0lkID0gXCIjI3tpZH0tbG9nb1wiXG4gICAgICAgIEBwYXJrTG9nb3MucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICAgQHBhcmtMb2dvcy5maWx0ZXIobG9nb0lkKS5hZGRDbGFzcygnc2VsZWN0ZWQnKVxuXG5cbiAgICBzZWxlY3RlZExvZ286IC0+XG4gICAgICAgIHJldHVybiBAcGFya0xvZ29zLnBhcmVudCgpLmZpbmQoJ2xpLnNlbGVjdGVkJykuZGF0YSgnaWQnKTtcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcmtzTGlzdFxuXG4iLCJQbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5cbmNsYXNzIFJlc2l6ZUJ1dHRvbnMgZXh0ZW5kcyBQbHVnaW5CYXNlXG5cbiAgICBjb25zdHJ1Y3RvcjogLT5cbiAgICAgICAgQHJlc2l6ZUJ1dHRvbnMoKVxuXG4gICAgcmVzaXplQnV0dG9uczogLT5cbiAgICAgICAgYyA9ICQoJyNjb250ZW50JylcbiAgICAgICAgYnRuX3dyYXBwZXJzID0gYy5maW5kICcuYnRuLXdyYXBwZXInXG5cbiAgICAgICAgZm9yIGJ0bl93cmFwcGVyIGluIGJ0bl93cmFwcGVyc1xuICAgICAgICAgICAgYnRucyA9ICQoYnRuX3dyYXBwZXIpLmZpbmQgJ2EnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGJ0bnMubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgIG1heFdpZHRoID0gMFxuICAgICAgICAgICAgICAgIHdpZGVzdFNwYW4gPSBudWxsXG5cbiAgICAgICAgICAgICAgICAkKGJ0bnMpLmVhY2ggLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgJCh0aGlzKS53aWR0aCgpID4gbWF4V2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heFdpZHRoID0gJCh0aGlzKS53aWR0aCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRlc3RTcGFuID0gJCh0aGlzKVxuXG4gICAgICAgICAgICAgICAgJChidG5zKS5lYWNoIC0+XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuY3NzKHt3aWR0aDogbWF4V2lkdGggKyA2MH0pXG5cblxuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBSZXNpemVCdXR0b25zIiwiY2xhc3MgU3ZnSW5qZWN0XG5cbiAgICBjb25zdHJ1Y3RvcjogKHNlbGVjdG9yKSAtPlxuICAgICAgICBcbiAgICAgICAgQCRzdmdzID0gJChzZWxlY3RvcilcbiAgICAgICAgXG4gICAgICAgIEBwcmVsb2FkZXIgPSBuZXcgY3JlYXRlanMuTG9hZFF1ZXVlIHRydWUgLCBcIlwiICwgdHJ1ZVxuICAgICAgICBAcHJlbG9hZGVyLnNldE1heENvbm5lY3Rpb25zKDEwKVxuICAgICAgICBAcHJlbG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIgJ2ZpbGVsb2FkJyAsIEBvblN2Z0xvYWRlZFxuICAgICAgICBAcHJlbG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvbkxvYWRDb21wbGV0ZVxuICAgICAgICBAbWFuaWZlc3QgPSBbXVxuICAgICAgICBAY29sbGVjdFN2Z1VybHMoKVxuICAgICAgICBAbG9hZFN2Z3MoKVxuICAgICAgICBcbiAgICBjb2xsZWN0U3ZnVXJsczogLT5cbiAgICAgICAgXG4gICAgICAgIHNlbGYgPSBAXG4gICAgICAgIFxuICAgICAgICBAJHN2Z3MuZWFjaCAtPlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZCA9IFwic3ZnLWluamVjdC0je3BhcnNlSW50KE1hdGgucmFuZG9tKCkgKiAxMDAwKS50b1N0cmluZygpfVwiXG4gICAgICAgICAgXG4gICAgICAgICAgICAkKEApLmF0dHIoJ2lkJywgaWQpXG4gICAgICAgICAgICAkKEApLmF0dHIoJ2RhdGEtYXJiJyAsIFwiYWJjMTIzXCIpXG4gICAgICAgICAgICBzdmdVcmwgPSAkKEApLmF0dHIoJ3NyYycpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgXG5cbiAgICAgICAgICAgIHNlbGYubWFuaWZlc3QucHVzaCBcbiAgICAgICAgICAgICAgICBpZDppZFxuICAgICAgICAgICAgICAgIHNyYzpzdmdVcmxcbiAgICAgICAgICAgICAgICBcbiAgICBsb2FkU3ZnczogLT5cbiAgICAgICAgXG4gICAgICAgIEBwcmVsb2FkZXIubG9hZE1hbmlmZXN0KEBtYW5pZmVzdClcbiAgICAgICAgICAgICAgICBcbiAgICBcbiAgICBpbmplY3RTdmc6IChpZCxzdmdEYXRhKSAtPlxuICAgICAgICBcbiAgICAgICAgJGVsID0gJChcIiMje2lkfVwiKSAgICBcbiBcbiBcbiAgICAgICAgaW1nSUQgPSAkZWwuYXR0cignaWQnKVxuICAgICAgICBpbWdDbGFzcyA9ICRlbC5hdHRyKCdjbGFzcycpXG4gICAgICAgIGltZ0RhdGEgPSAkZWwuY2xvbmUodHJ1ZSkuZGF0YSgpIG9yIFtdXG4gICAgICAgIGRpbWVuc2lvbnMgPSBcbiAgICAgICAgICAgIHc6ICRlbC5hdHRyKCd3aWR0aCcpXG4gICAgICAgICAgICBoOiAkZWwuYXR0cignaGVpZ2h0JylcblxuICAgICAgICBzdmcgPSAkKHN2Z0RhdGEpLmZpbHRlcignc3ZnJylcbiAgICAgICAgXG5cbiAgICAgICAgc3ZnID0gc3ZnLmF0dHIoXCJpZFwiLCBpbWdJRCkgIGlmIHR5cGVvZiBpbWdJRCBpc250ICd1bmRlZmluZWQnXG4gICAgICAgIGlmIHR5cGVvZiBpbWdDbGFzcyBpc250ICd1bmRlZmluZWQnXG4gICAgICAgICAgICBjbHMgPSAoaWYgKHN2Zy5hdHRyKFwiY2xhc3NcIikgaXNudCAndW5kZWZpbmVkJykgdGhlbiBzdmcuYXR0cihcImNsYXNzXCIpIGVsc2UgXCJcIilcbiAgICAgICAgICAgIHN2ZyA9IHN2Zy5hdHRyKFwiY2xhc3NcIiwgaW1nQ2xhc3MgKyBcIiBcIiArIGNscyArIFwiIHJlcGxhY2VkLXN2Z1wiKVxuICAgICAgICBcbiAgICAgICAgIyBjb3B5IGFsbCB0aGUgZGF0YSBlbGVtZW50cyBmcm9tIHRoZSBpbWcgdG8gdGhlIHN2Z1xuICAgICAgICAkLmVhY2ggaW1nRGF0YSwgKG5hbWUsIHZhbHVlKSAtPiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgc3ZnWzBdLnNldEF0dHJpYnV0ZSBcImRhdGEtXCIgKyBuYW1lLCB2YWx1ZVxuICAgICAgICAgICAgcmV0dXJuICAgICAgICBcbiAgICAgICAgc3ZnID0gc3ZnLnJlbW92ZUF0dHIoXCJ4bWxuczphXCIpXG4gICAgICAgIFxuICAgICAgICAjR2V0IG9yaWdpbmFsIGRpbWVuc2lvbnMgb2YgU1ZHIGZpbGUgdG8gdXNlIGFzIGZvdW5kYXRpb24gZm9yIHNjYWxpbmcgYmFzZWQgb24gaW1nIHRhZyBkaW1lbnNpb25zXG4gICAgICAgIG93ID0gcGFyc2VGbG9hdChzdmcuYXR0cihcIndpZHRoXCIpKVxuICAgICAgICBvaCA9IHBhcnNlRmxvYXQoc3ZnLmF0dHIoXCJoZWlnaHRcIikpXG4gICAgICAgIFxuICAgICAgICAjU2NhbGUgYWJzb2x1dGVseSBpZiBib3RoIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlcyBleGlzdFxuICAgICAgICBpZiBkaW1lbnNpb25zLncgYW5kIGRpbWVuc2lvbnMuaFxuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJ3aWR0aFwiLCBkaW1lbnNpb25zLndcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwiaGVpZ2h0XCIsIGRpbWVuc2lvbnMuaFxuICAgICAgICBcbiAgICAgICAgI1NjYWxlIHByb3BvcnRpb25hbGx5IGJhc2VkIG9uIHdpZHRoXG4gICAgICAgIGVsc2UgaWYgZGltZW5zaW9ucy53XG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcIndpZHRoXCIsIGRpbWVuc2lvbnMud1xuICAgICAgICAgICAgJChzdmcpLmF0dHIgXCJoZWlnaHRcIiwgKG9oIC8gb3cpICogZGltZW5zaW9ucy53XG4gICAgICAgIFxuICAgICAgICAjU2NhbGUgcHJvcG9ydGlvbmFsbHkgYmFzZWQgb24gaGVpZ2h0XG4gICAgICAgIGVsc2UgaWYgZGltZW5zaW9ucy5oXG4gICAgICAgICAgICAkKHN2ZykuYXR0ciBcImhlaWdodFwiLCBkaW1lbnNpb25zLmhcbiAgICAgICAgICAgICQoc3ZnKS5hdHRyIFwid2lkdGhcIiwgKG93IC8gb2gpICogZGltZW5zaW9ucy5oXG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgJGVsLnJlcGxhY2VXaXRoIHN2Z1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIG9uU3ZnTG9hZGVkOiAoZSkgPT5cbiAgICAgICAgXG4gICAgICAgIEBpbmplY3RTdmcoZS5pdGVtLmlkLCBlLnJhd1Jlc3VsdClcbiAgICBcbiAgICBvbkxvYWRDb21wbGV0ZTogKGUpID0+XG4gICAgXG4gICAgXG4gICAgXG4gICAgXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IFN2Z0luamVjdCAiLCJcblxuY2xhc3MgVmlkZW9PdmVybGF5XG5cblxuXG4gICAgY29uc3RydWN0b3I6IChlbCkgLT5cbiAgICAgICAgQCRlbCA9ICQoZWwpXG4gICAgICAgIEAkaW5uZXIgPSBAJGVsLmZpbmQoXCIub3ZlcmxheS1pbm5lclwiKVxuICAgICAgICBAJGNvbnRhaW5lciA9IEAkZWwuZmluZChcIi5vdmVybGF5LWlubmVyLWNvbnRhaW5lclwiKVxuICAgICAgICBcbiAgICAgICAgaWYgKEAkY29udGFpbmVyLmZpbmQoJy5vdmVybGF5LWNvbnRlbnQnKS5zaXplKCkgaXMgMSkgXG4gICAgICAgICAgICBAJGNvbnRhaW5lciA9IEAkY29udGFpbmVyLmZpbmQoJy5vdmVybGF5LWNvbnRlbnQnKVxuICAgICAgICAgICAgXG4gICAgICAgIEAkY2xvc2UgPSBAJGVsLmZpbmQoXCIub3ZlcmxheS1jbG9zZVwiKVxuICAgICAgICBcblxuICAgICAgICBAY3JlYXRlVmlkZW9JbnN0YW5jZSgpXG4gICAgICAgIEBjcmVhdGVPdmVybGF5VHJhbnNpdGlvbigpXG4gICAgICAgIEBhZGRFdmVudHMoKVxuXG5cblxuICAgIGNyZWF0ZU92ZXJsYXlUcmFuc2l0aW9uOiAtPlxuICAgICAgICBAdGwgPSBuZXcgVGltZWxpbmVNYXhcblxuICAgICAgICBAJGVsLnNob3coKVxuXG4gICAgICAgIEB0bC5hZGQgVHdlZW5NYXguZnJvbVRvICQoJyNvdmVybGF5JyksIC4wMSxcbiAgICAgICAgICAgIHt6SW5kZXg6IC0xLCBkaXNwbGF5Oidub25lJywgejogMH0sIHt6SW5kZXg6IDUwMDAsIGRpc3BsYXk6J2Jsb2NrJywgejogOTk5OTk5OTk5OX1cbiAgICAgICAgXG4gICAgICAgIEB0bC5hZGQgVHdlZW5NYXgudG8gQCRlbCAsIC4zNSAsXG4gICAgICAgICAgICBhdXRvQWxwaGE6MVxuXG4gICAgICAgIEB0bC5hZGQgVHdlZW5NYXgudG8gQCRpbm5lciAsIC41NSAsXG4gICAgICAgICAgICBhbHBoYToxXG5cbiAgICAgICAgQHRsLmFkZCBUd2Vlbk1heC50byBAJGNsb3NlICwgLjI1ICxcbiAgICAgICAgICAgIGFscGhhOjFcbiAgICAgICAgLFxuICAgICAgICAgICAgXCItPS4xNVwiXG5cbiAgICAgICAgQHRsLmFkZExhYmVsKFwiaW5pdENvbnRlbnRcIilcblxuICAgICAgICBAdGwuc3RvcCgpXG5cbiAgICBjcmVhdGVWaWRlb0luc3RhbmNlOiAoKSAtPlxuXG5cblxuICAgIGFkZEV2ZW50czogLT5cbiAgICAgICAgQGNsb3NlRXZlbnQgPSBuZXcgSGFtbWVyKEAkY2xvc2VbMF0pXG5cblxuXG4gICAgdHJhbnNpdGlvbkluT3ZlcmxheTogKG5leHQpIC0+XG4gICAgICAgIGNvbnNvbGUubG9nICd0cmFuc2l0aW9uSW5PdmVybGF5J1xuICAgICAgICBAdHJhbnNJbkNiID0gbmV4dFxuICAgICAgICBAdGwuYWRkQ2FsbGJhY2soQHRyYW5zSW5DYiwgXCJpbml0Q29udGVudFwiKVxuICAgICAgICBAdGwucGxheSgpXG4gICAgICAgIEBjbG9zZUV2ZW50Lm9uICd0YXAnICwgQGNsb3NlT3ZlcmxheVxuXG4gICAgdHJhbnNpdGlvbk91dE92ZXJsYXk6IC0+XG4gICAgICAgIGNvbnNvbGUubG9nICd0cmFuc2l0aW9uT3V0T3ZlcmxheSdcbiAgICAgICAgQGNsb3NlRXZlbnQub2ZmICd0YXAnICwgQGNsb3NlT3ZlcmxheVxuICAgICAgICBAdGwucmVtb3ZlQ2FsbGJhY2soQHRyYW5zSW5DYilcbiAgICAgICAgQHRsLnJldmVyc2UoKVxuICAgICAgICBkZWxldGUgQHRyYW5zSW5DYlxuXG5cbiAgICBjbG9zZU92ZXJsYXk6IChlKSA9PlxuICAgICAgICBAcmVtb3ZlVmlkZW8oKVxuICAgICAgICBAdHJhbnNpdGlvbk91dE92ZXJsYXkoKVxuXG5cbiAgICByZW1vdmVWaWRlbzogKCkgLT5cbiAgICAgICAgaWYgQHZpZGVvSW5zdGFuY2VcbiAgICAgICAgICAgIEB2aWRlb0luc3RhbmNlLnBhdXNlKClcbiAgICAgICAgICAgIEB2aWRlb0luc3RhbmNlLmN1cnJlbnRUaW1lKDApXG4gICAgICAgICAgICAjQHZpZGVvSW5zdGFuY2UuZGlzcG9zZSgpXG5cbiAgICByZXNpemVPdmVybGF5OiAoKSAtPlxuICAgICAgICAkdmlkID0gQCRlbC5maW5kKCd2aWRlbycpXG4gICAgICAgICR3ID0gd2luZG93LmlubmVyV2lkdGhcbiAgICAgICAgJGggPSAkdmlkLmhlaWdodCgpXG5cbiAgICAgICAgIyBAJGlubmVyLmNzcyB7d2lkdGg6ICR3LCBoZWlnaHQ6ICRofVxuICAgICAgICAjICR2aWQuY3NzIHtoZWlnaHQ6IDEwMCArICclJywgd2lkdGg6IDEwMCArICclJ31cblxuICAgIGFwcGVuZERhdGE6IChkYXRhKSAtPlxuICAgICAgICBpZiBkYXRhLm1wNCA9PSBcIlwiIG9yICEgZGF0YS5tcDQ/XG4gICAgICAgICAgICBjb25zb2xlLmxvZyAnbm8gdmlkZW8sIGl0cyBhbiBpbWFnZSdcbiAgICAgICAgICAgIEBwb3N0ZXIgPSAkKFwiPGRpdiBjbGFzcz0ndmlkZW8tanMnPjxpbWcgY2xhc3M9J3Zqcy10ZWNoJyBzcmM9J1wiICsgZGF0YS5wb3N0ZXIgKyBcIicgY2xhc3M9J21lZGlhLWltYWdlLXBvc3RlcicgLz48L2Rpdj5cIilcbiAgICAgICAgICAgIEAkY29udGFpbmVyLmh0bWwgQHBvc3RlclxuICAgICAgICAgICAgQHBvc3Rlci5jc3MgJ2hlaWdodCcsICcxMDAlJ1xuICAgICAgICAgICAgQHJlbW92ZVZpZGVvKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICAgIG1wNCA9ICQoXCI8c291cmNlIHNyYz1cXFwiI3tkYXRhLm1wNH1cXFwiIHR5cGU9XFxcInZpZGVvL21wNFxcXCIgLz4gXCIpXG4gICAgICAgIHdlYm0gPSAkKFwiPHNvdXJjZSBzcmM9XFxcIiN7ZGF0YS53ZWJtfVxcXCIgdHlwZT1cXFwidmlkZW8vd2VibVxcXCIgLz4gXCIpXG5cbiAgICAgICAgQCR2aWRlb0VsID0gJChcIjx2aWRlbyBpZD0nb3ZlcmxheS1wbGF5ZXInIGNsYXNzPSd2anMtZGVmYXVsdC1za2luIHZpZGVvLWpzJyBjb250cm9scyBwcmVsb2FkPSdhdXRvJyAvPlwiKVxuICAgICAgICBAJHZpZGVvRWwuYXBwZW5kKG1wNClcbiAgICAgICAgQCR2aWRlb0VsLmFwcGVuZCh3ZWJtKVxuICAgICAgICBAJGNvbnRhaW5lci5odG1sIEAkdmlkZW9FbFxuXG4gICAgICAgIGlmIEB2aWRlb0luc3RhbmNlP1xuICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UuZGlzcG9zZSgpXG4gICAgICAgIEB2aWRlb0luc3RhbmNlID0gdmlkZW9qcyBcIm92ZXJsYXktcGxheWVyXCIgICxcbiAgICAgICAgICAgIHdpZHRoOlwiMTAwJVwiXG4gICAgICAgICAgICBoZWlnaHQ6XCIxMDAlXCJcblxuXG5cblxuICAgIHBsYXlWaWRlbzogKCkgPT5cbiMgICAgICAgIGlmKCEkKFwiaHRtbFwiKS5oYXNDbGFzcygnbW9iaWxlJykpXG4jICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UucGxheSgpXG4gICAgICAgIGlmIEB2aWRlb0luc3RhbmNlP1xuICAgICAgICAgICAgQHZpZGVvSW5zdGFuY2UucGxheSgpXG4gICAgICAgICAgICBcbiAgICBzaG93SW1hZ2U6ICgpID0+XG4gICAgICAgIGNvbnNvbGUubG9nICdzaG93SW1hZ2UnXG5cblxuXG5vdmVybGF5ID0gbmV3IFZpZGVvT3ZlcmxheSBcIiNvdmVybGF5XCJcblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cy5pbml0VmlkZW9PdmVybGF5ID0gKGRhdGEpIC0+XG4gICAgY29uc29sZS5sb2cgJ2RhdGEyOiAnLCBkYXRhXG4gICAgb3ZlcmxheS5hcHBlbmREYXRhKGRhdGEpXG5cblxuICAgIGlmICEoZGF0YS5tcDQgPT0gXCJcIilcbiAgICAgICAgY29uc29sZS5sb2cgJ2RhdGEubXA0ICE9PSBcIlwiJ1xuICAgICAgICBvdmVybGF5LnRyYW5zaXRpb25Jbk92ZXJsYXkob3ZlcmxheS5wbGF5VmlkZW8pXG4gICAgZWxzZVxuICAgICAgICBjb25zb2xlLmxvZyAnZGF0YS5tcDQgPT09IFwiXCInXG4gICAgICAgIG92ZXJsYXkudHJhbnNpdGlvbkluT3ZlcmxheShvdmVybGF5LnNob3dJbWFnZSlcblxuXG5cblxuXG5cblxuXG5cblxuXG4iLCJQbHVnaW5CYXNlID0gcmVxdWlyZSAnLi4vLi4vYWJzdHJhY3QvUGx1Z2luQmFzZS5jb2ZmZWUnXG5GcmFtZXNNb2RlbCA9IHJlcXVpcmUgJy4vRnJhbWVzTW9kZWwuY29mZmVlJ1xuXG5tYXRjaEZyYW1lTnVtID0gL1xcZCsoPz1cXC5bYS16QS1aXSspL1xuXG5jbGFzcyBGcmFtZUFuaW1hdGlvbiBleHRlbmRzIFBsdWdpbkJhc2VcbiAgICBcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogKG9wdHMpIC0+XG4gICAgICAgIFxuICAgICAgICBAJGVsID0gJChvcHRzLmVsKVxuICAgICAgICBAYXN5bmMgPSBvcHRzLmFzeW5jIG9yIGZhbHNlXG4gICAgICAgIGRlcHRoPSBvcHRzLmRlcHRoIG9yIDFcbiAgICAgICAgQCRjb250YWluZXIgPSAkKFwiPGRpdiBjbGFzcz0nY29hc3Rlci1jb250YWluZXInIC8+XCIpXG4gICAgICAgIEAkY29udGFpbmVyLmF0dHIoJ2lkJyAsIG9wdHMuaWQpXG4gICAgICAgIEAkY29udGFpbmVyLmNzcygnei1pbmRleCcsIGRlcHRoKVxuICAgICAgICBUd2Vlbk1heC5zZXQgQCRjb250YWluZXIgLCBcbiAgICAgICAgICAgIHo6ZGVwdGggKiAxMFxuICAgICAgICBcbiAgICAgICAgc3VwZXIob3B0cylcbiAgICAgICAgXG4gICAgICAgIFxuICAgIFxuICAgIGluaXRpYWxpemU6IChvcHRzKSAtPlxuICAgICAgICBzdXBlcihvcHRzKVxuICAgICAgICBcbiAgICAgICAgQG1vZGVsID0gbmV3IEZyYW1lc01vZGVsIG9wdHNcbiAgICAgICAgQG1vZGVsLm9uIFwiZGF0YUxvYWRlZFwiICwgQHNldHVwQ2FudmFzXG4gICAgICAgIEBtb2RlbC5vbiBcInRyYWNrTG9hZGVkXCIgLCBAb25UcmFja0xvYWRlZFxuICAgICAgICBAbW9kZWwub24gXCJmcmFtZXNMb2FkZWRcIiAsIEBvbkZyYW1lc0xvYWRlZFxuICAgICAgICBAbW9kZWwubG9hZERhdGEoKVxuICAgICAgICBcbiAgIFxuICAgICAgIFxuICAgIGxvYWRGcmFtZXM6IC0+XG4gICAgICAgIGlmIEBtb2RlbC5kYXRhP1xuICAgICAgICAgICAgQG1vZGVsLnByZWxvYWRGcmFtZXMoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZGVmZXJMb2FkaW5nID0gdHJ1ZVxuICAgICAgICBcbiAgICBcbiAgICBcbiAgICBzZXR1cENhbnZhczogPT5cbiAgICAgICAgXG5cbiAgICAgICAgQGNhbnZhc1dpZHRoID0gQG1vZGVsLmdldCgnZ2xvYmFsJykud2lkdGhcbiAgICAgICAgQGNhbnZhc0hlaWdodCA9IEBtb2RlbC5nZXQoJ2dsb2JhbCcpLmhlaWdodFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKVxuICAgICAgICBAY29udGV4dCA9IEBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgICBcbiAgICAgICAgQGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJyAsIEBjYW52YXNXaWR0aClcbiAgICAgICAgQGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcgLCBAY2FudmFzSGVpZ2h0KVxuXG4gICAgICAgIFxuICAgICAgICBAJGNvbnRhaW5lci5hcHBlbmQoQGNhbnZhcylcbiAgICAgICAgQCRlbC5wcmVwZW5kKEAkY29udGFpbmVyKVxuICAgICAgICBAbW9kZWwucHJlbG9hZFRyYWNrKClcbiAgICAgICAgaWYgQGRlZmVyTG9hZGluZ1xuICAgICAgICAgICAgQG1vZGVsLnByZWxvYWRGcmFtZXMoKVxuICAgICAgXG4gICAgXG4gICAgZGlzcGxheVRyYWNrOiAtPlxuICAgICAgICBcbiAgICAgICAgQGNvbnRleHQuY2xlYXJSZWN0IDAgLCAwICwgQGNhbnZhc1dpZHRoICwgQGNhbnZhc0hlaWdodFxuICAgICAgICBAY29udGV4dC5kcmF3SW1hZ2UgQHRyYWNrSW1hZ2UudGFnICwgMCAsMCAsIEBjYW52YXNXaWR0aCAsIEBjYW52YXNIZWlnaHRcbiAgICAgICAgXG4gICAgZGlzcGxheUZyYW1lOiAobnVtKSAtPlxuICAgICAgICBcbiAgICAgICAgbWFuaWZlc3QgPSBAbW9kZWwuZ2V0KCdtYW5pZmVzdCcpXG4gICAgICAgIFxuICAgICAgICBpZiBtYW5pZmVzdC5sZW5ndGggPiBudW1cbiAgICAgICAgICAgIGFzc2V0ID0gbWFuaWZlc3RbbnVtXSBcbiAgICAgICAgICAgIGZyYW1lQXNzZXQgPSBAbW9kZWwuZ2V0QXNzZXQoYXNzZXQuZmlsZW5hbWUpXG4gICAgICAgICAgICAjIGNvbnNvbGUubG9nIGZyYW1lQXNzZXQudGFnICwgYXNzZXQueCAsIGFzc2V0LnksIGFzc2V0LndpZHRoLCBhc3NldC5oZWlnaHRcbiAgICAgICAgICAgIEBjb250ZXh0LmRyYXdJbWFnZSBmcmFtZUFzc2V0LnRhZyAsIGFzc2V0LnggLCBhc3NldC55LCBhc3NldC53aWR0aCwgYXNzZXQuaGVpZ2h0XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBcbiAgICBpbml0QW5pbWF0aW9uOiAtPlxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGZyYW1lcyA9IEBtb2RlbC5nZXQoJ21hbmlmZXN0JykubGVuZ3RoXG4gICAgICAgIHNwZWVkID0gQG1vZGVsLmdldCgnZ2xvYmFsJykuZnBzXG4gICAgICAgIGRlbGF5ID0gQG1vZGVsLmdldCgnZ2xvYmFsJykuZGVsYXkgb3IgMFxuICAgICAgICByZXBlYXREZWxheSA9IEBtb2RlbC5nZXQoJ2dsb2JhbCcpLnJlcGVhdERlbGF5IG9yIDEwXG4gICAgICAgIFxuICAgIFxuXG4gICAgICAgIGR1cmF0aW9uID0gIGZyYW1lcyAvIHNwZWVkXG5cblxuICAgICAgICBzZWxmID0gQCBcbiAgICAgICAgQGxhc3RGcmFtZU51bSA9IC0xXG4gICAgICAgIEB0aW1lbGluZSA9IHdpbmRvdy5jb2FzdGVyID0gVHdlZW5NYXgudG8gQGNhbnZhcyAsIGR1cmF0aW9uICwgXG4gICAgICAgICAgICBvblVwZGF0ZTogLT5cbiAgICAgICAgICAgICAgICBmcmFtZU51bSA9IE1hdGguZmxvb3IoZnJhbWVzICogQHByb2dyZXNzKCkpICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGZyYW1lTnVtIGlzbnQgQGxhc3RGcmFtZU51bSAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kaXNwbGF5VHJhY2soKVxuICAgICAgICAgICAgICAgICAgICBzZWxmLmRpc3BsYXlGcmFtZShmcmFtZU51bSlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQGxhc3RGcmFtZU51bSA9IGZyYW1lTnVtXG4gICAgICAgICAgICByZXBlYXQ6LTFcbiAgICAgICAgICAgIHJlcGVhdERlbGF5OiByZXBlYXREZWxheVxuICAgICAgICAgICAgZGVsYXk6ZGVsYXlcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG5cbiAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgXG4gICAgXG4gICAgb25UcmFja0xvYWRlZDogPT5cblxuICAgICAgICBAdHJhY2tJbWFnZSA9IEBtb2RlbC5nZXRBc3NldCgndHJhY2snKVxuICAgICAgICBAZGlzcGxheVRyYWNrKClcbiAgICAgICAgXG5cbiAgICBvbkZyYW1lc0xvYWRlZDogPT5cbiAgICAgICAgaWYgdHlwZW9mIEBhc3luYyBpcyAnZnVuY3Rpb24nXG4gICAgICAgICAgICBAYXN5bmMoKVxuICAgICAgICAkKHdpbmRvdykub24gJ3Njcm9sbCcsICBAY2hlY2tDb2FzdGVyVmlzaWJpbGl0eVxuICAgICAgICBAY2hlY2tDb2FzdGVyVmlzaWJpbGl0eSgpXG4gICAgXG4gICAgICAgIFxuICAgIGNoZWNrQ29hc3RlclZpc2liaWxpdHk6ID0+XG4gICAgICAgIFxuICAgICAgICBpZihAaW5WaWV3cG9ydCgpKVxuXG4gICAgICAgICAgICAkKHdpbmRvdykub2ZmICdzY3JvbGwnLCAgQGNoZWNrQ29hc3RlclZpc2liaWxpdHlcbiAgICAgICAgICAgIEBpbml0QW5pbWF0aW9uKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIGluVmlld3BvcnQ6ID0+XG4gICAgICAgIFxuICAgICAgICB0b3AgPSBAJGNvbnRhaW5lci5vZmZzZXQoKS50b3BcbiAgICAgICAgaGVpZ2h0ID0gQCRjb250YWluZXIuZmluZCgnY2FudmFzJykuZmlyc3QoKS5oZWlnaHQoKVxuICAgICAgICBib3R0b20gPSB0b3AgKyBoZWlnaHRcbiAgICAgICAgXG4gICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKVxuICAgICAgICBzY3JvbGxCb3R0b20gPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgKyAkKHdpbmRvdykuaGVpZ2h0KClcblxuICAgICAgICBpZiBzY3JvbGxUb3AgPD0gdG9wIDw9IHNjcm9sbEJvdHRvbVxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICBcbiBcblxubW9kdWxlLmV4cG9ydHMgPSBGcmFtZUFuaW1hdGlvblxuIiwiXG5cbm1hdGNoRnJhbWVOdW0gPSAvXFxkKyg/PVxcLlthLXpBLVpdKykvXG5cbmNsYXNzIEZyYW1lc01vZGVsIGV4dGVuZHMgRXZlbnRFbWl0dGVyXG5cblxuICAgIGNvbnN0cnVjdG9yOiAob3B0cykgLT5cbiAgICAgICAgQGJhc2VVcmwgPSBvcHRzLmJhc2VVcmxcbiAgICAgICAgQHVybCA9IG9wdHMudXJsXG4gICAgICAgIEBsb2FkTWFuaWZlc3QgPSBbXTtcbiAgICAgICAgQHRyYWNrTWFuaWZlc3QgPSBbXTtcbiAgICAgICAgQGluaXRMb2FkZXIoKVxuICAgICAgICBzdXBlcihvcHRzKVxuICAgICAgICBcblxuICAgIGxvYWREYXRhOiAtPlxuICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgIHVybDogQGJhc2VVcmwgICsgQHVybFxuICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IEBvbkRhdGFMb2FkZWRcbiAgICAgICAgICAgIGVycm9yOiBAaGFuZGxlRXJyb3JcblxuICAgIGhhbmRsZUVycm9yOiAoZXJyKSAtPlxuICAgICAgICB0aHJvdyBlcnJcblxuICAgIG9uRGF0YUxvYWRlZDogKGRhdGEpID0+XG4gICAgICAgIFxuICAgICAgICBAZGF0YSA9IGRhdGFcbiAgICAgICAgQHRyYW5zZm9ybURhdGEoKVxuICAgICAgICBAZW1pdCBcImRhdGFMb2FkZWRcIlxuICAgICAgXG5cbiAgICBzb3J0U2VxdWVuY2U6IChhLGIpIC0+XG4gICAgICAgIGFGcmFtZSA9IG1hdGNoRnJhbWVOdW0uZXhlYyhhLmZpbGVuYW1lKVxuICAgICAgICBiRnJhbWUgPSBtYXRjaEZyYW1lTnVtLmV4ZWMoYi5maWxlbmFtZSlcbiAgICAgICAgcmV0dXJuIGlmIHBhcnNlSW50KGFGcmFtZVswXSkgPCBwYXJzZUludChiRnJhbWVbMF0pIHRoZW4gLTEgZWxzZSAxXG5cbiAgICB0cmFuc2Zvcm1EYXRhOiAtPlxuICAgICAgICBAZGF0YS5tYW5pZmVzdC5zb3J0IEBzb3J0U2VxdWVuY2VcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBAdHJhY2tNYW5pZmVzdC5wdXNoXG4gICAgICAgICAgICBpZDpcInRyYWNrXCJcbiAgICAgICAgICAgIHNyYzogXCIje0BkYXRhLmdsb2JhbC5mb2xkZXJ9LyN7QGRhdGEuZ2xvYmFsLnRyYWNrfVwiXG5cbiAgICAgICAgZm9yIGZyYW1lIGluIEBkYXRhLm1hbmlmZXN0XG4gICAgICAgICAgICBmcmFtZS5zcmMgPSBcIiN7QGRhdGEuZ2xvYmFsLmZvbGRlcn0vI3tmcmFtZS5maWxlbmFtZX1cIlxuICAgICAgICAgICAgQGxvYWRNYW5pZmVzdC5wdXNoXG4gICAgICAgICAgICAgICAgaWQ6IGZyYW1lLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgc3JjOiBmcmFtZS5zcmNcblxuICAgIGluaXRMb2FkZXI6IC0+XG4gICAgICAgIEB0cmFja0xvYWRlciA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUgdHJ1ZSwgQGJhc2VVcmwsIHRydWVcbiAgICAgICAgQHByZWxvYWRlciA9IG5ldyBjcmVhdGVqcy5Mb2FkUXVldWUgdHJ1ZSwgQGJhc2VVcmwsIHRydWVcbiAgICAgICAgQHRyYWNrTG9hZGVyLnNldE1heENvbm5lY3Rpb25zKDEwKVxuICAgICAgICBAcHJlbG9hZGVyLnNldE1heENvbm5lY3Rpb25zKDE1KVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIFxuICAgIHByZWxvYWRUcmFjazogLT5cblxuICAgICAgICBAdHJhY2tMb2FkZXIuYWRkRXZlbnRMaXN0ZW5lciAnY29tcGxldGUnICwgQG9uVHJhY2tBc3NldHNDb21wbGV0ZVxuICAgICAgICBAdHJhY2tMb2FkZXIubG9hZE1hbmlmZXN0KEB0cmFja01hbmlmZXN0KVxuICAgIHByZWxvYWRGcmFtZXM6IC0+XG4jICAgICAgICBjb25zb2xlLmxvZyBAbG9hZE1hbmlmZXN0XG4gICAgICAgIFxuICAgICAgICBAcHJlbG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvbkFzc2V0c0NvbXBsZXRlXG4gICAgICAgIEBwcmVsb2FkZXIubG9hZE1hbmlmZXN0KEBsb2FkTWFuaWZlc3QpXG5cbiAgICBvblRyYWNrQXNzZXRzQ29tcGxldGU6IChlKSA9PlxuICAgICAgICBcbiAgICAgICAgQHRyYWNrTG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvblRyYWNrQXNzZXRzQ29tcGxldGVcbiAgICAgICAgQGVtaXQgXCJ0cmFja0xvYWRlZFwiXG5cbiAgICBvbkFzc2V0c0NvbXBsZXRlOiAoZSk9PlxuIyAgICAgICAgY29uc29sZS5sb2cgQHByZWxvYWRlclxuICAgICAgICBAcHJlbG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIgJ2NvbXBsZXRlJyAsIEBvbkFzc2V0c0NvbXBsZXRlXG4gICAgICAgIEBlbWl0IFwiZnJhbWVzTG9hZGVkXCJcblxuXG5cblxuICAgIGdldEFzc2V0OiAoaWQpIC0+XG4gICAgICAgIFxuICAgICAgICBpdGVtID0gIEBwcmVsb2FkZXIuZ2V0SXRlbSBpZFxuICAgICAgICBpZiAhaXRlbT9cbiAgICAgICAgICAgIGl0ZW0gPSAgQHRyYWNrTG9hZGVyLmdldEl0ZW0gaWQgICAgICAgIFxuICAgICAgICByZXR1cm4gaXRlbVxuXG4gICAgZ2V0OiAoa2V5KSAtPlxuICAgICAgICBmb3Igayx2IG9mIEBkYXRhXG4gICAgICAgICAgICBpZiBrIGlzIGtleVxuICAgICAgICAgICAgICAgIHJldHVybiB2XG5cbiAgICBzZXQ6IChrZXksIHZhbCkgLT5cbiAgICAgICAgQGRhdGFba2V5XSA9IHZhbFxuXG5cblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gRnJhbWVzTW9kZWxcbiIsIlxyXG5WaWV3QmFzZSA9IHJlcXVpcmUgXCIuLi9hYnN0cmFjdC9WaWV3QmFzZS5jb2ZmZWVcIlxyXG5cclxuY2xhc3MgU2Nyb2xsQmFyIGV4dGVuZHMgVmlld0Jhc2VcclxuXHJcbiAgICBzY3JvbGxpbmcgOiBmYWxzZVxyXG4gICAgb2Zmc2V0WSA6IDBcclxuICAgIHBvc2l0aW9uIDogMFxyXG4gICAgaGlkZVRpbWVvdXQ6IDBcclxuXHJcblxyXG4gICAgaW5pdGlhbGl6ZTogLT5cclxuICAgICAgICBAb25SZXNpemUoKVxyXG4gICAgICAgIEBzZXRFdmVudHMoKVxyXG5cclxuICAgICAgICBpZiB3aW5kb3cuaXNUaWVyVGFibGV0XHJcbiAgICAgICAgICAgIEAkZWwuaGlkZSgpXHJcblxyXG5cclxuXHJcbiAgICBzZXRFdmVudHM6ID0+XHJcbiAgICAgICAgQGRlbGVnYXRlRXZlbnRzXHJcbiAgICAgICAgICAgIFwibW91c2Vkb3duIC5oYW5kbGVcIiA6IFwib25IYW5kbGVEb3duXCJcclxuICAgICAgICAgICAgI1wibW91c2VlbnRlclwiIDogXCJvbkhhbmRsZVVwXCJcclxuICAgICAgICAgICAgXCJjbGljayAucmFpbFwiIDogXCJvblJhaWxDbGlja1wiXHJcblxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uIFwibW91c2V1cFwiICwgQG9uSGFuZGxlVXBcclxuICAgICAgICAkKGRvY3VtZW50KS5vbiBcIm1vdXNlbW92ZVwiICwgQG9uTW91c2VNb3ZlXHJcblxyXG5cclxuICAgICAgICBcclxuICAgIHVwZGF0ZUhhbmRsZTogKHBvcykgPT5cclxuICAgICAgICBAcG9zaXRpb24gPSBwb3NcclxuICAgICAgICBAJGVsLmZpbmQoJy5oYW5kbGUnKS5jc3NcclxuICAgICAgICAgICAgdG9wOiBAcG9zaXRpb24gKiAoJCh3aW5kb3cpLmhlaWdodCgpIC0gQCRlbC5maW5kKFwiLmhhbmRsZVwiKS5oZWlnaHQoKSlcclxuICAgICAgICBAc2hvd1Njcm9sbGJhcigpXHJcbiAgICAgICAgQGhpZGVTY3JvbGxiYXIoKVxyXG5cclxuICAgIG9uUmFpbENsaWNrOiAoZSkgPT5cclxuICAgICAgICBAb2Zmc2V0WSA9IGlmIGUub2Zmc2V0WSBpc250IHVuZGVmaW5lZCB0aGVuIGUub2Zmc2V0WSBlbHNlIGUub3JpZ2luYWxFdmVudC5sYXllcllcclxuICAgICAgICBAcG9zaXRpb24gPSBAb2Zmc2V0WSAvICQod2luZG93KS5oZWlnaHQoKVxyXG4gICAgICAgIEB0cmlnZ2VyIFwiY3VzdG9tU2Nyb2xsSnVtcFwiICwgQHBvc2l0aW9uXHJcbiAgICAgICAgXHJcblxyXG5cclxuICAgIG9uSGFuZGxlRG93bjogKGUpID0+XHJcblxyXG4gICAgICAgIEAkZWwuY3NzXHJcbiAgICAgICAgICAgIHdpZHRoOlwiMTAwJVwiXHJcbiAgICAgICAgQG9mZnNldFkgPSBpZiBlLm9mZnNldFkgaXNudCB1bmRlZmluZWQgdGhlbiBlLm9mZnNldFkgZWxzZSBlLm9yaWdpbmFsRXZlbnQubGF5ZXJZXHJcbiAgICAgICAgQHNjcm9sbGluZyA9IHRydWVcclxuXHJcbiAgICBvbkhhbmRsZVVwOiAoZSkgPT5cclxuICAgICAgICBAJGVsLmNzc1xyXG4gICAgICAgICAgICB3aWR0aDpcIjE1cHhcIlxyXG5cclxuICAgICAgICBAc2Nyb2xsaW5nID0gZmFsc2VcclxuXHJcbiAgICBvbk1vdXNlTW92ZTogKGUpID0+XHJcbiAgICAgICAgaWYgQHNjcm9sbGluZ1xyXG5cclxuICAgICAgICAgICAgaWYgZS5wYWdlWSAtIEBvZmZzZXRZIDw9IDBcclxuICAgICAgICAgICAgICAgICQoXCIuaGFuZGxlXCIpLmNzc1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogMVxyXG4gICAgICAgICAgICBlbHNlIGlmIGUucGFnZVkgLSBAb2Zmc2V0WSA+PSAkKHdpbmRvdykuaGVpZ2h0KCkgLSAkKFwiI3Njcm9sbGJhciAuaGFuZGxlXCIpLmhlaWdodCgpXHJcbiAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAkKFwiLmhhbmRsZVwiKS5jc3NcclxuICAgICAgICAgICAgICAgICAgICB0b3A6ICAgKCQod2luZG93KS5oZWlnaHQoKSAtICQoXCIjc2Nyb2xsYmFyIC5oYW5kbGVcIikuaGVpZ2h0KCkpIC0gMVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAkKFwiLmhhbmRsZVwiKS5jc3NcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IGUucGFnZVkgLSBAb2Zmc2V0WVxyXG5cclxuXHJcbiAgICAgICAgICAgIEBwb3NpdGlvbiA9IHBhcnNlSW50KCQoXCIjc2Nyb2xsYmFyIC5oYW5kbGVcIikuY3NzKFwidG9wXCIpKSAvICgkKHdpbmRvdykuaGVpZ2h0KCkgLSAkKFwiI3Njcm9sbGJhciAuaGFuZGxlXCIpLmhlaWdodCgpKVxyXG5cclxuICAgICAgICAgICAgaWYgQHBvc2l0aW9uIDwgcGFyc2VGbG9hdCguMDA1KVxyXG4gICAgICAgICAgICAgICAgQHBvc2l0aW9uID0gMFxyXG4gICAgICAgICAgICBlbHNlIGlmIEBwb3NpdGlvbiA+IHBhcnNlRmxvYXQoLjk5NSlcclxuICAgICAgICAgICAgICAgIEBwb3NpdGlvbiA9IDFcclxuXHJcblxyXG4gICAgICAgICAgICBAdHJpZ2dlciBcImN1c3RvbVNjcm9sbFwiICwgQHBvc2l0aW9uXHJcbiAgICAgICAgICBcclxuICAgXHJcbiAgICAgICAgaWYgQG1vdXNlWCBpc250IGUuY2xpZW50WCBhbmQgQG1vdXNlWSBpc250IGUuY2xpZW50WVxyXG4gICAgICAgICAgICBAc2hvd1Njcm9sbGJhcigpXHJcbiAgICAgICAgICAgIEBoaWRlU2Nyb2xsYmFyKClcclxuXHJcbiAgICAgICAgQG1vdXNlWCA9IGUuY2xpZW50WFxyXG4gICAgICAgIEBtb3VzZVkgPSBlLmNsaWVudFlcclxuXHJcbiAgICBvblJlc2l6ZTogKGUpID0+XHJcblxyXG5cclxuICAgICAgICBAJGVsLmZpbmQoJy5oYW5kbGUnKS5jc3NcclxuICAgICAgICAgICAgaGVpZ2h0OiAoJCh3aW5kb3cpLmhlaWdodCgpIC8gJChcInNlY3Rpb25cIikuaGVpZ2h0KCkgKSAqICQod2luZG93KS5oZWlnaHQoKVxyXG5cclxuICAgICAgICBAdXBkYXRlSGFuZGxlKEBwb3NpdGlvbilcclxuXHJcblxyXG4gICAgaGlkZVNjcm9sbGJhcjogPT5cclxuICAgICAgICBpZiBAaGlkZVRpbWVvdXQ/XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChAaGlkZVRpbWVvdXQpXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIEBoaWRlVGltZW91dCA9IHNldFRpbWVvdXQgKD0+XHJcbiAgICAgICAgICAgIGlmIEBtb3VzZVkgPiA3MlxyXG4gICAgICAgICAgICAgICAgVHdlZW5NYXgudG8gQCRlbCwgLjUgLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1dG9BbHBoYTogMFxyXG4gICAgICAgICAgICApICwgMjAwMFxyXG4gICAgICAgIFxyXG5cclxuICAgIHNob3dTY3JvbGxiYXI6ID0+XHJcbiAgICAgICAgVHdlZW5NYXgudG8gQCRlbCAsIC41ICxcclxuICAgICAgICAgICAgYXV0b0FscGhhOiAuNVxyXG5cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNjcm9sbEJhciIsIlxyXG5cclxuY2xhc3MgU2hhcmVyXHJcblxyXG4gICAgXHJcbiAgICBTaGFyZXIuaW5pdEZhY2Vib29rID0gLT5cclxuICAgICAgICBGQi5pbml0IFxyXG4gICAgICAgICAgICBhcHBJZDpcIjIxNTIyNDcwNTMwNzM0MVwiXHJcbiAgICAgICAgICAgIGNoYW5uZWxVcmw6XCIvY2hhbm5lbC5odG1sXCJcclxuICAgICAgICAgICAgc3RhdHVzOiB0cnVlXHJcbiAgICAgICAgICAgIHhmYmw6IHRydWVcclxuXHJcblxyXG4gICAgICAgIFxyXG4gICAgXHJcbiAgICBTaGFyZXIuc2hhcmVUd2l0dGVyID0gKHNoYXJlTWVzc2FnZSwgIHVybCwgaGFzaHRhZ3MpIC0+XHJcbiAgICAgICAgdGV4dCA9IHNoYXJlTWVzc2FnZVxyXG4gICAgICAgIGhhc2h0YWdzID0gXCJcIlxyXG4gICAgICAgIHVybCA9IHVybFxyXG4gICAgICAgIHR3VVJMID0gXCJodHRwczovL3R3aXR0ZXIuY29tL2ludGVudC90d2VldD90ZXh0PVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpICsgXCImdXJsPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHVybClcclxuICAgICAgICBzdHIgKz0gXCImaGFzaHRhZ3M9XCIgKyBoYXNodGFncyAgaWYgaGFzaHRhZ3NcclxuICAgICAgICBAb3BlblBvcHVwIDU3NSwgNDIwLCB0d1VSTCwgXCJUd2l0dGVyXCJcclxuXHJcbiAgICBTaGFyZXIuc2hhcmVGYWNlYm9vayA9IChuYW1lLCAgY2FwdGlvbiAsZGVzY3JpcHRpb24gLCBsaW5rICwgcGljdHVyZSkgLT5cclxuXHJcbiAgICAgICAgRkIudWlcclxuICAgICAgICAgICAgbWV0aG9kOlwiZmVlZFwiXHJcbiAgICAgICAgICAgIGxpbms6bGlua1xyXG4gICAgICAgICAgICBwaWN0dXJlOnBpY3R1cmVcclxuICAgICAgICAgICAgbmFtZTogbmFtZVxyXG4gICAgICAgICAgICBjYXB0aW9uOmNhcHRpb25cclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ZGVzY3JpcHRpb25cclxuICAgICAgICBcclxuXHJcbiAgICBTaGFyZXIuc2hhcmVHb29nbGUgPSAodXJsKSAtPlxyXG5cclxuICAgICAgICBAb3BlblBvcHVwIDYwMCwgNDAwICwgXCJodHRwczovL3BsdXMuZ29vZ2xlLmNvbS9zaGFyZT91cmw9XCIrdXJsLCBcIkdvb2dsZVwiXHJcblxyXG4gICAgU2hhcmVyLnNoYXJlUGludGVyZXN0ID0gKHVybCAsIGRlc2NyaXB0aW9uLCBwaWN0dXJlKSAtPlxyXG5cclxuICAgICAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uLnNwbGl0KFwiIFwiKS5qb2luKFwiK1wiKVxyXG4gICAgICAgIEBvcGVuUG9wdXAgNzgwLCAzMjAsIFwiaHR0cDovL3BpbnRlcmVzdC5jb20vcGluL2NyZWF0ZS9idXR0b24vP3VybD0je2VuY29kZVVSSUNvbXBvbmVudCh1cmwpfSZhbXA7ZGVzY3JpcHRpb249I3tkZXNjcmlwdGlvbn0mYW1wO21lZGlhPSN7ZW5jb2RlVVJJQ29tcG9uZW50KHBpY3R1cmUpfVwiXHJcblxyXG5cclxuICAgIFNoYXJlci5lbWFpbExpbmsgPSAoc3ViamVjdCwgYm9keSkgLT5cclxuICAgICAgICB4ID0gQG9wZW5Qb3B1cCAxICwgMSwgXCJtYWlsdG86JnN1YmplY3Q9I3tlbmNvZGVVUklDb21wb25lbnQoc3ViamVjdCl9JmJvZHk9I3tlbmNvZGVVUklDb21wb25lbnQoYm9keSl9XCJcclxuICAgICAgICB4LmNsb3NlKClcclxuXHJcbiAgICBTaGFyZXIub3BlblBvcHVwID0gKHcsIGgsIHVybCwgbmFtZSkgLT5cclxuICAgICAgICB3aW5kb3cub3BlbiB1cmwsIG5hbWUsIFwic3RhdHVzPTEsd2lkdGg9XCIgKyB3ICsgXCIsaGVpZ2h0PVwiICsgaCArIFwiLGxlZnQ9XCIgKyAoc2NyZWVuLndpZHRoIC0gdykgLyAyICsgXCIsdG9wPVwiICsgKHNjcmVlbi5oZWlnaHQgLSBoKSAvIDJcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXJlciIsIkRyYWdnYWJsZUdhbGxlcnkgPSByZXF1aXJlICcuL2NvbS9wbHVnaW5zL0RyYWdnYWJsZUdhbGxlcnkuY29mZmVlJ1xuRmFkZUdhbGxlcnkgPSByZXF1aXJlICcuL2NvbS9wbHVnaW5zL0ZhZGVHYWxsZXJ5LmNvZmZlZSdcblBhcmtzTGlzdCA9IHJlcXVpcmUgJy4vY29tL3BsdWdpbnMvUGFya3NMaXN0LmNvZmZlZSdcblxuSGVhZGVyQW5pbWF0aW9uID0gcmVxdWlyZSAnLi9jb20vcGx1Z2lucy9IZWFkZXJBbmltYXRpb24uY29mZmVlJ1xuTmV3c1BhZ2UgPSByZXF1aXJlICcuL2NvbS9wYWdlcy9OZXdzUGFnZS5jb2ZmZWUnXG5cblxuJChkb2N1bWVudCkucmVhZHkgLT5cblxuICAgICMkKFwiI2NvbnRlbnRcIikuY3NzKFwiaGVpZ2h0XCIgLCAkKCcjY29udGVudCcpLmhlaWdodCgpKVxuXG4gICAgam9icyA9IG5ldyBOZXdzUGFnZVxuICAgICAgICBlbDogXCJib2R5XCJcbiJdfQ==
