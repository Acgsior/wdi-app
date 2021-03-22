//index.js
import assetUtils from '../../utils/assetUtils';
import animationUtils from '../../utils/animationUtils';

const {
  pushIfAbsent
} = animationUtils;

const notAnimatedCls = 'not-animated';

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

    // swiper page index
    pageIndex: 0,

    // animation class name of page#1
    p1AnimationCls: {
      bgImg: notAnimatedCls,
      bgRect: notAnimatedCls,
      top1: notAnimatedCls,
      top2: notAnimatedCls,
      protagonist: notAnimatedCls,
      protagonistName: notAnimatedCls,
      protagonistSplit: notAnimatedCls,
      bottom: notAnimatedCls
    },
    p2AnimationCls: {
      bgRect: notAnimatedCls,
      logo: notAnimatedCls,
      inviteYou: notAnimatedCls,
      protagonist: notAnimatedCls,
      protagonistSplit: notAnimatedCls,
      time: notAnimatedCls,
      address: notAnimatedCls,
      weddingEn: notAnimatedCls,
      weddingCn: notAnimatedCls,
      bottom: notAnimatedCls
    },

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

  handlePageChange: function (e) {
    const {
      detail: {
        current,
        source
      }
    } = e;
    console.log('= [swiper] handle page change');
  },

  handlePageChangeFinish: function (e) {
    const {
      detail: {
        current
      }
    } = e;
    console.log('= [swiper] handle page change finish');

    switch (current) {
      case 0: {
        this.startAnimationChain1();
        break;
      }
      case 1: {
        this.startAnimationChain2();
        break;
      }
    }

    // reset animate state after changing to the other page
    const prevPageAniKey = `p${this.data.pageIndex + 1}AnimationCls`;
    const animationClassKeys = Object.keys(this.data[prevPageAniKey]);
    const nextAnimationClassData = animationClassKeys.reduce((acc, cur) => ({
      ...acc,
      [cur]: notAnimatedCls
    }), {});
    this.setData({
      [prevPageAniKey]: nextAnimationClassData
    });

    // FIXME combine setData
    this.setData({
      pageIndex: current
    });

    // FIXME need think about what if animation do not completed?
    // OPTION#1: cancel all setTimeout
    // OPTION#2: directly call clearAnimation
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

  getAniStateClass: function (page, key) {
    const aniState = this.data[`aniStateP${page}`][key];
    return aniState ? '' : 'not-animated'
  },

  startAnimationChain1: function () {
    console.log('= [ani] start animation chain#1');

    this.animateP1MainBgImg();
    this.animateP1Top1();
    setTimeout(this.animateP1Top2, 800);
    setTimeout(this.animateP1MainBgRect, 1600);
    setTimeout(this.animateP1Protagonist, 1600);
    setTimeout(this.animateBottom, 2800, 1);
    setTimeout(this.animateP1ProtagonistName, 3000);
    setTimeout(this.animateP1ProtagonistSplit, 3000);
  },

  startAnimationChain2: function () {
    console.log('= [ani] start animation chain#2');

    this.animateP2Logo();
    this.animateP2BgRect()
    this.animateP2InviteYou()
    this.animateP2Protagonist()
    this.animateP2ProtagonistSplit()
    this.animateP2Time();
    this.animateP2Address();
    this.animateP2WeddingEn()
    this.animateP2WeddingCn()
    this.animateBottom(2)
  },

  animateP1MainBgImg: function () {
    const selector = '.page-1 .main-bg-img';
    this.animate(selector, [{
        ease: 'ease-in',
        opacity: 0,
      },
      {
        ease: 'ease-out',
        opacity: 1,
      }
    ], 2000, function () {
      this.setData({
        ['p1AnimationCls.bgImg']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`)
      })
    }.bind(this));
  },

  animateP1Top1: function () {
    const selector = '.page-1 .top-content-1';
    this.animate(selector, [{
        opacity: 0,
        translateY: 40,
      },
      {
        opacity: 1,
        translateY: 0,
      }
    ], 800, function () {
      this.setData({
        ['p1AnimationCls.top1']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`)
      })
    }.bind(this));
  },

  animateP1Top2: function () {
    const selector = '.page-1 .top-content-2';
    this.animate(selector, [{
        opacity: 0,
        translateY: 40,
      },
      {
        opacity: 1,
        translateY: 0,
      }
    ], 800, function () {
      this.setData({
        ['p1AnimationCls.top2']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`)
      })
    }.bind(this));
  },

  animateP1MainBgRect: function () {
    const selector = '.page-1 .main-bg--rect';
    this.animate(selector, [{
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
      this.setData({
        ['p1AnimationCls.bgRect']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`)
      })
    }.bind(this));
  },

  animateP1Protagonist: function () {
    const selector = '.page-1 .protagonist'
    this.animate(selector, [{
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
      this.setData({
        ['p1AnimationCls.protagonist']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`)
      })
    }.bind(this));
  },

  animateP1ProtagonistName: function () {
    const selector = '.page-1 .protagonist-name';
    this.animate(selector, [{
        ease: 'ease-out',
        opacity: 0,
      },
      {
        ease: 'ease-out',
        opacity: 1,
      }
    ], 400, function () {
      this.setData({
        ['p1AnimationCls.protagonistName']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`)
      })
    }.bind(this));
  },

  animateP1ProtagonistSplit: function () {
    const selector = '.page-1 .protagonist-split';
    this.animate(selector, [{
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
      this.setData({
        ['p1AnimationCls.protagonistSplit']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`)
      })
    }.bind(this));
  },

  animateBottom: function (page) {
    const selector = `.page-${page} .bottom`;
    this.animate(selector, [{
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
      this.setData({
        [`p${page}AnimationCls.bottom`]: '',
        bottomReady: true
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`)
      })
    }.bind(this));
  },

  animateP2Logo: function () {
    const selector = '.page-2 .logo-container';
    this.animate(selector, [{
        ease: 'ease-in',
        opacity: 0,
      },
      {
        ease: 'ease-in',
        opacity: 1,
      }
    ], 400, function () {
      this.setData({
        ['p2AnimationCls.logo']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP2BgRect: function () {
    const selector = '.page-2 .container--outside';
    this.animate(selector, [{
        ease: 'ease-in',
        opacity: 0,
      },
      {
        ease: 'ease-out',
        opacity: 1,
      }
    ], 800, function () {
      this.setData({
        ['p2AnimationCls.bgRect']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP2InviteYou: function () {
    const selector = '.page-2 .invite-you';
    this.animate(selector, [{
        ease: 'ease-in',
        opacity: 0,
      },
      {
        ease: 'ease-out',
        opacity: 1,
      }
    ], 2000, function () {
      this.setData({
        ['p2AnimationCls.inviteYou']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP2Protagonist: function () {
    const selector = '.page-2 .protagonist';
    this.animate(selector, [{
        ease: 'ease-in',
        opacity: 0,
      },
      {
        ease: 'ease-out',
        opacity: 1,
      }
    ], 2000, function () {
      this.setData({
        ['p2AnimationCls.protagonist']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP2ProtagonistSplit: function () {
    const selector = '.page-2 .protagonist-split';
    this.animate(selector, [{
        ease: 'ease-in',
        opacity: 0,
      },
      {
        ease: 'ease-out',
        opacity: 1,
      }
    ], 2000, function () {
      this.setData({
        ['p2AnimationCls.protagonistSplit']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP2Time: function () {
    const selector = '.page-2 >>> .time';
    this.animate(selector, [{
        ease: 'ease-in',
        opacity: 0,
      },
      {
        ease: 'ease-out',
        opacity: 1,
      }
    ], 2000, function () {
      this.setData({
        ['p2AnimationCls.time']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP2Address: function () {
    const selector = '.page-2 >>> .address';
    this.animate(selector, [{
        ease: 'ease-in',
        opacity: 0,
      },
      {
        ease: 'ease-out',
        opacity: 1,
      }
    ], 2000, function () {
      this.setData({
        ['p2AnimationCls.address']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP2WeddingEn: function () {
    const selector = '.page-2 .wedding--en';
    this.animate(selector, [{
        ease: 'ease-in',
        opacity: 0,
      },
      {
        ease: 'ease-out',
        opacity: 1,
      }
    ], 2000, function () {
      this.setData({
        ['p2AnimationCls.weddingEn']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP2WeddingCn: function () {
    const selector = '.page-2 .wedding--cn';
    this.animate(selector, [{
        ease: 'ease-in',
        opacity: 0,
      },
      {
        ease: 'ease-out',
        opacity: 1,
      }
    ], 2000, function () {
      this.setData({
        ['p2AnimationCls.weddingCn']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
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