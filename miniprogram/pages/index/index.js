//index.js
import assetUtils from '../../utils/assetUtils';


const app = getApp();

// FIXME need check why fileid do not work
// const audioURL = 'cloud://wdi-9g06h4rvb0ad273b.7764-wdi-9g06h4rvb0ad273b-1256827581/will-you-marry-me-marlboro-32kbps.mp3';
const audioURL = 'cloud://wdi-9g06h4rvb0ad273b.7764-wdi-9g06h4rvb0ad273b-1256827581/will-you-marry-me-marlboro-32kbps.mp3';

// FIXME update when page#3 photograph source is confirmed
const assetTotal = 2;

Page({
  data: {
    // dom
    // read extra height from global to adapt large screen
    extraHeight: app.globalData.extraHeight,
    bottomReady: false,

    // loading
    assetMgm: {
      intervalId: -1,
      loadedCount: 0,
      loaded: false,
      percent: 0
    },

    // audio
    audioContext: null,
    isPlaying: false,

    // map
    map: {
      latitude: 30.71899975983765,
      longitude: 103.82923803966423,
      markers: [{
        id: 1,
        latitude: 30.71899975983765,
        longitude: 103.82923803966423,
        title: '云豪假期酒店',
        iconPath: '../../images/location.png',
        width: 50,
        height: 50
      }]
    },
  },

  onReady: function () {
    // spin part
    this.loadAsset();

    // audio part
    wx.setInnerAudioOption({
      obeyMuteSwitch: false,
      success: function () {
        console.log('= [audio] audio set obey mute switch');
      },
      fail: function (e) {
        console.log('= [audio] audio set obey mute switch failed', e);
      }
    });

    const audioContext = wx.createInnerAudioContext();
    audioContext.loop = true;
    audioContext.src = audioURL;

    this.setData({
      audioContext
    });

    audioContext.onPlay(() => {
      console.log('= [audio] audio onPlay');
    });

    audioContext.onWaiting(() => {
      console.log('= [audio] audio onWaiting');
    });

    audioContext.onPause(() => {
      console.log('= [audio] audio onPause');
    });

    audioContext.onError((res) => {
      console.log('= [audio] audio onErrorr');
      console.log(res.errMsg)
      console.log(res.errCode)
    });

    console.log('= [audio] audio try to play', audioContext.duration);
    const that = this;
    audioContext.onCanplay(() => {
      console.log('= [audio] audio onCanplay');
      // audioContext.play();

      // that.setData({ isPlaying: true });

      // that.notifyAssetLoaded('audio');
    });

    // FIXME mock audio loaded
    setTimeout(function () {
      that.notifyAssetLoaded('audio');
    }, 1500);

    // map part
    this.mapCtx = wx.createMapContext('myMap')
  },

  onUnload: function () {
    this.cleanAssetLoadRes(true);

    this.data.audioContext.destroy();
  },

  onShow: function () {
    this.cleanAssetLoadRes();
  },

  onHide: function () {
    this.cleanAssetLoadRes();
  },

  checkAssetLoadState: function (that) {
    const loaded = that.data.assetMgm.loadedCount === assetTotal
    if (loaded) {
      if (that.data.assetMgm.intervalId >= 0) {
        clearInterval(that.data.assetMgm.intervalId);
      }
      that.setData({
        assetMgm: {
          ...that.data.assetMgm,
          intervalId: -1,
          loaded: true,
          percent: 100
        }
      })

      this.startAnimationChain1();
    } else {
      that.setData({
        assetMgm: {
          ...that.data.assetMgm,
          percent: assetUtils.autoIncreaseLoadPercent(that.data.assetMgm.percent)
        }
      })
    }
  },

  loadAsset: function () {
    if (!this.data.assetMgm.loaded) {
      const intervalId = setInterval(this.checkAssetLoadState, 200, this);
      this.setData({
        assetMgm: {
          ...this.data.assetMgm,
          intervalId
        }
      });
    }
  },

  notifyAssetLoaded: function (e) {
    console.log('= [asset] asset loaded', e);
    const loadedCount = this.data.assetMgm.loadedCount + 1;
    this.setData({
      assetMgm: {
        ...this.data.assetMgm,
        loadedCount
      }
    });
  },

  cleanAssetLoadRes: function (destory) {
    const intervalId = this.data.assetMgm.intervalId;
    intervalId >= 0 && clearInterval(intervalId);

    const assetMgm = {
      ...this.data.assetMgm,
      intervalId: -1,
    };
    if (destory) {
      assetMgm.loaded = false;
      assetMgm.loadedCount = 0;
      assetMgm.percent = 0;
    }

    this.setData({
      assetMgm
    });
  },

  startAnimationChain1: function () {
    console.log('= [ani] start animation after loading');
    const that = this;

    that.animateMainBgImg();
    that.animateTop1();
    setTimeout(this.animateTop2, 800);
    setTimeout(this.animateMainBgRect, 1600);
    setTimeout(this.animateProtagonist, 1600);
    setTimeout(this.animateBottom, 2800);
    setTimeout(this.animateProtagonistName, 3000);
    setTimeout(this.animateProtagonistSplit, 3000);
  },

  animateMainBgImg: function () {
    this.animate('.page-1 .main-bg-img', [{
        ease: 'ease-out',
        opacity: 0,
      },
      {
        ease: 'ease-out',
        opacity: 1,
      }
    ], 2000, function () {
      this.clearAnimation('.main-bg-img', {}, function () {
        console.log("= [ani] .main-bg-img animation")
      })
    }.bind(this));
  },

  animateTop1: function () {
    this.animate('.page-1 .top-content-1', [{
        opacity: 0,
        translateY: 40,
      },
      {
        opacity: 1,
        translateY: 0,
      }
    ], 800, function () {
      this.clearAnimation('.top-content-1', {
        translateY: true
      }, function () {
        console.log("= [ani] .top-content-1 animation")
      })
    }.bind(this));
  },

  animateTop2: function () {
    this.animate('.page-1 .top-content-2', [{
        opacity: 0,
        translateY: 40,
      },
      {
        opacity: 1,
        translateY: 0,
      }
    ], 800, function () {
      this.clearAnimation('.top-content-2', {
        translateY: true
      }, function () {
        console.log("= [ani] .top-content-2 animation")
      })
    }.bind(this));
  },

  animateMainBgRect: function () {
    this.animate('.page-1 .main-bg--rect', [{
        ease: 'ease-out',
        opacity: 0,
        translateY: 40,
        rotate: 45
      },
      {
        ease: 'ease-out',
        opacity: 1,
        translateY: 0,
        rotate: 45
      }
    ], 800, function () {
      this.clearAnimation('.main-bg--rect', {
        translateY: true
      }, function () {
        console.log("= [ani] .main-bg--rect animation")
      })
    }.bind(this));
  },

  animateProtagonist: function () {
    this.animate('.page-1 .protagonist', [{
        ease: 'ease-out',
        offset: 0,
        opacity: 0,
        scale3d: [0.3, 0.3, 0.3]
      },
      {
        ease: 'ease-out',
        offset: 0.5,
        opacity: 1
      }
    ], 1600, function () {
      this.clearAnimation('.protagonist', {
        scale3d: true
      }, function () {
        console.log("= [ani] .protagonist animation")
      })
    }.bind(this));
  },

  animateProtagonistName: function () {
    this.animate('.page-1 .protagonist-name', [{
        ease: 'ease-out',
        opacity: 0,
      },
      {
        ease: 'ease-out',
        opacity: 1,
      }
    ], 400, function () {
      this.clearAnimation('.protagonist-name', {}, function () {
        console.log("= [ani] .protagonist-name animation")
      })
    }.bind(this));
  },

  animateProtagonistSplit: function () {
    this.animate('.page-1 .protagonist-split', [{
        offset: 0,
        opacity: 0,
      },
      {
        offset: 0.2,
        opacity: 1
      },
      {
        offset: 0.4,
        scale: [1.3, 1.3]
      },
      {
        offset: 0.6,
        scale: [1, 1]
      },
      {
        offset: 0.8,
        scale: [1.3, 1.3]
      },
      {
        offset: 1,
        scale: [1, 1]
      },

    ], 1000, function () {
      this.clearAnimation('.protagonist-split', {}, function () {
        console.log("= [ani] .protagonist-split animation")
      })
    }.bind(this));
  },

  animateBottom: function () {
    const that = this;
    this.animate('.page-1 .bottom', [{
        ease: 'ease-out',
        opacity: 0,
        translateY: 72
      },
      {
        ease: 'ease-out',
        opacity: 1,
        translateY: 0
      }
    ], 1600, function () {
      this.clearAnimation('.bottom', {
        translateY: true
      }, function () {
        console.log("= [ani] .bottom animation");
        that.setData({
          bottomReady: true
        });
      })
    }.bind(this));
  },

  play: function () {
    this.data.audioContext.play();

    this.setData({
      isPlaying: true
    });
  },

  pause: function () {
    this.data.audioContext.pause();

    this.setData({
      isPlaying: false
    });
  },

  onShareAppMessage: function (res) {
    // FIXME need update title and img as current title text is too long which would be omitted
    return {
      title: '04.24的婚礼电子请柬',
      path: '/page/index/index',
      imageUrl: 'cloud://wdi-9g06h4rvb0ad273b.7764-wdi-9g06h4rvb0ad273b-1256827581/share-cover.png'
    }
  }
})