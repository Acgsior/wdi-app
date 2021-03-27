//index.js
import assetUtils from '../../utils/assetUtils';

const notAnimatedCls = 'not-animated';

const app = getApp();

// FIXME need check why fileid do not work
// const audioURL = 'cloud://wdi-9g06h4rvb0ad273b.7764-wdi-9g06h4rvb0ad273b-1256827581/bgm.mp3';
const audioURL = 'https://0424-1256827581.cos.ap-chengdu.myqcloud.com/bgm.mp3';

const assetTotal = 0;

Page({
  data: {
    // dom
    // read extra height from global to adapt large screen
    extraHeight: app.globalData.extraHeight,
    ratio: app.globalData.ratio,
    isIPX: app.globalData.isIPX,

    bottomReady: false,

    // swiper page index
    pageIndex: 0,

    // animation class name of page
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
      weddingSplit: notAnimatedCls,
      weddingEn: notAnimatedCls,
      weddingCn: notAnimatedCls,
      bottom: notAnimatedCls
    },
    p3AnimationCls: {
      photo1: notAnimatedCls,
      text1: notAnimatedCls,
      shadow1: notAnimatedCls,
      photo2: notAnimatedCls,
      text2: notAnimatedCls,
      shadow2: notAnimatedCls,
      photo3: notAnimatedCls,
      text3: notAnimatedCls,
      rect3: notAnimatedCls,
      heart3: notAnimatedCls,
      prevArrow: notAnimatedCls,
      nextArrow: notAnimatedCls,
      bottom: notAnimatedCls
    },
    p4AnimationCls: {
      time: notAnimatedCls,
      address: notAnimatedCls,
      blessing: notAnimatedCls
    },
    pageTimeIds: {
      p1: [],
      p2: [],
      p3: [],
      p4: [],
    },

    p3PhotoIndex: 0,

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
        iconPath: '../../images/heart.png',
        width: 32,
        height: 32
      }]
    }
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
      audioContext.play();

      that.setData({
        isPlaying: true
      });

      that.notifyAssetLoaded('audio');
    });

    // FIXME mock audio loaded
    // setTimeout(function () {
    //   that.notifyAssetLoaded('audio');
    // }, 1500);

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
      }
    } = e;
    console.log(`= [swiper] handle page change to page#${current + 1}`);
  },

  handlePageChangeFinish: function (e) {
    const {
      detail: {
        current
      }
    } = e;
    console.log(`= [swiper] handle page change to page#${current + 1} finish`);

    if (this.data.pageIndex !== current) {
      this.startAnimationChain(current);
    }
  },

  startAnimationChain(page) {
    switch (page) {
      case 0: {
        this.startAnimationChain1();
        break;
      }
      case 1: {
        this.startAnimationChain2();
        break;
      }
      case 2: {
        this.startAnimationChain3Photo1();
        break;
      }
      case 3: {
        this.startAnimationChain4();
        // FIXME createMapContext then openMapApp to guide
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

    if (this.data.pageIndex !== page) {
      switch (this.data.pageIndex) {
        case 0: {
          this.clearAnimationChain1();
          break;
        }
        case 1: {
          this.clearAnimationChain2();
          break;
        }
        case 2: {
          this.clearAnimationChain3Photo1();
          this.clearAnimationChain3Photo2();
          this.clearAnimationChain3Photo3();
          break;
        }
        case 3: {
          this.clearAnimationChain4();
          break;
        }
      }

      this.setData({
        [prevPageAniKey]: nextAnimationClassData,
        pageIndex: page
      });
    }
  },

  checkAssetLoadState: function (that) {
    const loaded = that.data.assetMgm.loadedCount >= assetTotal
    if (loaded) {
      console.log('= [asset] asset load completed');
      if (that.data.assetMgm.intervalId >= 0) {
        clearInterval(that.data.assetMgm.intervalId);
      }
      that.setData({
        assetMgm: {
          ...that.data.assetMgm,
          percent: 100
        }
      }, function () {
        console.log('= [asset] hide spin transition animation start');
        const selector = '.container >>> .spin';
        that.animate(selector, [{
            ease: 'ease-out',
            opacity: 1,
          },
          {
            ease: 'ease-out',
            opacity: 0,
          }
        ], 1000, function () {
          console.log('= [asset] hide spin and start animation chain');
          that.setData({
            assetMgm: {
              ...that.data.assetMgm,
              intervalId: -1,
              loaded: true,
            }
          });
          that.startAnimationChain(that.data.pageIndex);
        }.bind(that));
      });
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
    const id1 = setTimeout(this.animateP1Top2, 400, 1);
    const id2 = setTimeout(this.animateP1MainBgRect, 800, 1);
    const id3 = setTimeout(this.animateP1Protagonist, 1100, 1);
    const id4 = setTimeout(this.animateBottom, 2000, 1);
    const id5 = setTimeout(this.animateP1ProtagonistName, 2100, 1);
    const id6 = setTimeout(this.animateP1ProtagonistSplit, 2100, 1);

    this.setData({
      'pageTimeIds.p1': [id1, id2, id3, id4, id5, id6]
    });
  },

  startAnimationChain2: function () {
    console.log('= [ani] start animation chain#2');

    this.animateP2Logo();
    this.animateP2BgRect()
    const id1 = setTimeout(this.animateP2InviteYou, 400);
    const id2 = setTimeout(this.animateP2Protagonist, 800);
    const id3 = setTimeout(this.animateP2ProtagonistSplit, 1400);
    const id4 = setTimeout(this.animateP2Time, 1000);
    const id5 = setTimeout(this.animateP2WeddingSplit, 1200);
    const id6 = setTimeout(this.animateP2WeddingEn, 1200);
    const id7 = setTimeout(this.animateP2WeddingCn, 1200);
    const id8 = setTimeout(this.animateP2Address, 1200);
    const id9 = setTimeout(this.animateBottom, 1800, 2);

    this.setData({
      'pageTimeIds.p2': [id1, id2, id3, id4, id5, id6, id7, id8, id9]
    });
  },

  startAnimationChain3Photo1: function () {
    console.log('= [ani] start animation chain#3 - photo@1');

    this.animateP3Photo(1);
    this.animateP3NextArrow();
    const id1 = setTimeout(this.animateP3Shadow1, 600);
    const id2 = setTimeout(this.animateP3Text, 800, 1);
    setTimeout(this.animateBottom, 1200, 3);

    this.setData({
      'pageTimeIds.p3': [...this.data.pageTimeIds.p3, id1, id2]
    });
  },


  startAnimationChain3Photo2: function () {
    console.log('= [ani] start animation chain#3 - photo@2');

    this.animateP3Photo(2);
    this.animateP3NextArrow();
    this.animateP3PrevArrow();
    const id1 = setTimeout(this.animateP3Shadow2, 600);
    const id2 = setTimeout(this.animateP3Text, 800, 2);

    this.setData({
      'pageTimeIds.p3': [...this.data.pageTimeIds.p3, id1, id2]
    });
  },

  startAnimationChain3Photo3: function () {
    console.log('= [ani] start animation chain#3 - photo@3');

    this.animateP3Photo(3);
    this.animateP3PrevArrow();
    const id1 = setTimeout(this.animateP3Rect3, 600);
    const id2 = setTimeout(this.animateP3Heart3, 1800);
    const id3 = setTimeout(this.animateP3Text, 800, 3);

    this.setData({
      'pageTimeIds.p3': [...this.data.pageTimeIds.p3, id1, id2, id3]
    });
  },

  startAnimationChain4: function () {
    console.log('= [ani] start animation chain#4');

    this.animateP4Time();
    const id1 = setTimeout(this.animateP4Address, 400);
    const id2 = setTimeout(this.animateP4Blessing, 600);

    this.setData({
      'pageTimeIds.p4': [id1, id2]
    });
  },

  clearAnimationChain1: function () {
    this.clearAnimation('.page-1 .main-bg-img', null);
    this.clearAnimation('.page-1 .top-content-1', null);
    this.clearAnimation('.page-1 .top-content-2', null);
    this.clearAnimation('.page-1 .main-bg--rect', null);
    this.clearAnimation('.page-1 .protagonist', null);
    this.clearAnimation('.page-1 .bottom', null);

    const timeoutIds = this.data.pageTimeIds.p1;
    timeoutIds.forEach(tid => {
      clearTimeout(tid);
    });
    this.setData({
      'pageTimeIds.p1': []
    });

    console.log('= [ani] clear all animation chain#1');
  },

  clearAnimationChain2: function () {
    this.clearAnimation('.page-1 .logo-container', null);
    this.clearAnimation('.page-1 .container--outside', null);
    this.clearAnimation('.page-1 .invite-you', null);
    this.clearAnimation('.page-1 .protagonist', null);
    this.clearAnimation('.page-1 .protagonist-split', null);
    this.clearAnimation('.page-1 .page-2 >>> .time', null);
    this.clearAnimation('.page-1 .page-2 >>> .address', null);
    this.clearAnimation('.page-1 .page-2 .wedding--split', null);
    this.clearAnimation('.page-1 .page-2 .wedding--en', null);
    this.clearAnimation('.page-1 .page-2 .wedding--cn', null);
    this.clearAnimation('.page-1 .bottom', null);

    const timeoutIds = this.data.pageTimeIds.p2;
    timeoutIds.forEach(tid => {
      clearTimeout(tid);
    });
    this.setData({
      'pageTimeIds.p2': []
    });

    console.log('= [ani] clear all animation chain#2');
  },

  clearAnimationChain3Timer: function () {
    const timeoutIds = this.data.pageTimeIds.p3;
    timeoutIds.forEach(tid => {
      clearTimeout(tid);
    });
    this.setData({
      'pageTimeIds.p3': []
    });
  },

  clearAnimationChain3Photo1: function () {
    this.clearAnimationChain3Timer();

    this.clearAnimation('.page-3 >>> .next-arrow', null);
    this.clearAnimation('.page-3 >>> .prev-arrow', null);
    this.clearAnimation('.page-3 .photo--1', null);
    this.clearAnimation('.page-3 .photo-text--1', null);
    this.clearAnimation('.page-3 .photo-shadow--1', null);
    this.clearAnimation('.page-3 .bottom', null);

    console.log('= [ani] clear all animation chain#3 photo@1');
  },

  clearAnimationChain3Photo2: function () {
    this.clearAnimationChain3Timer();

    this.clearAnimation('.page-3 >>> .next-arrow', null);
    this.clearAnimation('.page-3 >>> .prev-arrow', null);
    this.clearAnimation('.page-3 .photo--2', null);
    this.clearAnimation('.page-3 .photo-text--2', null);
    this.clearAnimation('.page-3 .photo-shadow--2', null);

    console.log('= [ani] clear all animation chain#3 photo@2');
  },

  clearAnimationChain3Photo3: function () {
    this.clearAnimationChain3Timer();

    this.clearAnimation('.page-3 >>> .next-arrow', null);
    this.clearAnimation('.page-3 >>> .prev-arrow', null);
    this.clearAnimation('.page-3 .photo--3', null);
    this.clearAnimation('.page-3 .photo-text--3', null);
    this.clearAnimation('.page-3 .top-border--heart', null);
    this.clearAnimation('.page-3 .top-border--3', null);

    console.log('= [ani] clear all animation chain#3 photo@3');
  },

  clearAnimationChain4: function () {
    this.clearAnimation('.page-4 >>> .time', null);
    this.clearAnimation('.page-4 >>> .address', null);
    this.clearAnimation('.page-4 .blessing', null);

    const timeoutIds = this.data.pageTimeIds.p4;
    timeoutIds.forEach(tid => {
      clearTimeout(tid);
    });
    this.setData({
      'pageTimeIds.p4': []
    });

    console.log('= [ani] clear all animation chain#4');
  },

  // --- Animation for Page#1 --- //

  animateP1MainBgImg: function () {
    const selector = '.page-1 .main-bg-img';
    this.animate(selector, [{
        ease: 'ease-out',
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
        translateY: '64rpx',
      },
      {
        opacity: 1,
        translateY: 0,
      }
    ], 500, function () {
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
        translateY: '64rpx',
      },
      {
        opacity: 1,
        translateY: 0,
      }
    ], 500, function () {
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
        translateY: '64rpx',
        rotate: 45
      },
      {
        ease: 'ease-out',
        opacity: 1,
        translateY: 0,
        rotate: 45
      }
    ], 500, function () {
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
        opacity: 0,
        scale: [0, 0]
      },
      {
        ease: 'ease-out',
        opacity: 1,
        scale: [1, 1]
      }
    ], 1200, function () {
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
        scale: [1.5, 1.5]
      },
      {
        offset: 0.6,
        scale: [1, 1]
      },
      {
        offset: 0.8,
        scale: [1.5, 1.5]
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
        translateY: '72rpx'
      },
      {
        ease: 'ease-out',
        opacity: 1,
        translateY: 0
      }
    ], 600, function () {
      this.setData({
        [`p${page}AnimationCls.bottom`]: '',
        bottomReady: true
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`)
      })
    }.bind(this));
  },

  // --- Animation for Page#2 --- //

  animateP2Logo: function () {
    const selector = '.page-2 .logo-container';
    this.animate(selector, [{
        opacity: 0,
      },
      {
        ease: 'ease-out',
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
        translateY: '-20rpx',
        opacity: 0,
      },
      {
        ease: 'ease-out',
        translateY: 0,
        opacity: 1,
      }
    ], 400, function () {
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
        translateY: '-20rpx',
        opacity: 0,
      },
      {
        ease: 'ease-out',
        translateY: 0,
        opacity: 1,
      }
    ], 500, function () {
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
        opacity: 0,
      },
      {
        ease: 'ease-out',
        opacity: 1,
      }
    ], 400, function () {
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
        ease: 'ease-out',
        opacity: 0,
        translateY: '-144rpx'
      },
      {
        ease: 'ease-out',
        opacity: 1,
        translateY: 0
      }
    ], 700, function () {
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
        ease: 'ease-out',
        opacity: 0,
        translateY: '-144rpx'
      },
      {
        ease: 'ease-out',
        opacity: 1,
        translateY: 0
      }
    ], 700, function () {
      this.setData({
        ['p2AnimationCls.address']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP2WeddingSplit: function () {
    const selector = '.page-2 .wedding--split';
    this.animate(selector, [{
        opacity: 0,
        scale3d: [0.2, 0.2, 0.2]
      },
      {
        ease: 'ease-out',
        opacity: 1,
        scale3d: [1, 1, 1]
      }
    ], 2000, function () {
      this.setData({
        ['p2AnimationCls.weddingSplit']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP2WeddingEn: function () {
    const selector = '.page-2 .wedding--en';
    this.animate(selector, [{
        opacity: 0,
        translateY: '24rpx'
      },
      {
        ease: 'ease-out',
        opacity: 1,
        translateY: 0
      }
    ], 1000, function () {
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
        opacity: 0,
        translateY: '-24rpx'
      },
      {
        ease: 'ease-out',
        opacity: 1,
        translateY: 0
      }
    ], 1000, function () {
      this.setData({
        ['p2AnimationCls.weddingCn']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  // --- Animation for Page#3 --- //

  animateP3Photo: function (photo) {
    const selector = `.page-3 .photo--${photo}`;
    this.animate(selector, [{
        opacity: 0,
      },
      {
        ease: 'ease-out',
        opacity: 1,
      }
    ], 800, function () {
      this.setData({
        [`p3AnimationCls.photo${photo}`]: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP3Shadow1: function () {
    const selector = '.page-3 .photo-shadow--1';
    this.animate(selector, [{
        opacity: 0,
        translate: [0, 0],
      },
      {
        ease: 'ease-out',
        translate: ['40rpx', '40rpx'],
        opacity: 1,
      }
    ], 600, function () {
      this.setData({
        ['p3AnimationCls.shadow1']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP3Shadow2: function () {
    const selector = '.page-3 .photo-shadow--2';
    this.animate(selector, [{
        opacity: 0,
        translate: [0, 0],
      },
      {
        ease: 'ease-out',
        translate: ['-40rpx', '-40rpx'],
        opacity: 1,
      }
    ], 600, function () {
      this.setData({
        ['p3AnimationCls.shadow2']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP3Rect3: function () {
    const selector = '.page-3 .top-border--3';
    this.animate(selector, [{
        opacity: 0,
      },
      {
        ease: 'ease-out',
        opacity: 1,
      }
    ], 1200, function () {
      this.setData({
        ['p3AnimationCls.rect3']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP3Heart3: function () {
    const selector = '.page-3 .top-border--heart';
    this.animate(selector, [{
        opacity: 0,
      },
      {
        ease: 'ease-out',
        opacity: 1
      }
    ], 1200, function () {
      this.setData({
        ['p3AnimationCls.heart3']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP3Text: function (photo) {
    const selector = `.page-3 .photo-text--${photo}`;
    this.animate(selector, [{
        opacity: 0,
        translateY: '-40rpx'
      },
      {
        ease: 'ease-out',
        opacity: 1,
        translateY: 0
      }
    ], 1000, function () {
      this.setData({
        [`p3AnimationCls.text${photo}`]: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP3NextArrow: function () {
    const selector = '.page-3 >>> .next-arrow';
    this.animate(selector, [{
        opacity: 0,
        translateX: '-48rpx'
      },
      {
        ease: 'ease-out',
        opacity: 1,
        translateX: '-8rpx'
      }
    ], 800, function () {
      this.setData({
        ['p3AnimationCls.nextArrow']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP3PrevArrow: function () {
    const selector = '.page-3 >>> .prev-arrow';
    this.animate(selector, [{
        opacity: 0,
        translateX: '12rpx'
      },
      {
        ease: 'ease-out',
        opacity: 1,
        translateX: '-28rpx'
      }
    ], 800, function () {
      this.setData({
        ['p3AnimationCls.prevArrow']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  // --- Animation for Page#4 --- //

  animateP4Time: function () {
    const selector = '.page-4 >>> .time';
    this.animate(selector, [{
        ease: 'ease-out',
        opacity: 0,
        translateY: -80
      },
      {
        ease: 'ease-out',
        opacity: 1,
        translateY: 0
      }
    ], 700, function () {
      this.setData({
        ['p4AnimationCls.time']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP4Address: function () {
    const selector = '.page-4 >>> .address';
    this.animate(selector, [{
        ease: 'ease-out',
        opacity: 0,
        translateY: -80
      },
      {
        ease: 'ease-out',
        opacity: 1,
        translateY: 0
      }
    ], 700, function () {
      this.setData({
        ['p4AnimationCls.address']: ''
      });
      this.clearAnimation(selector, null, function () {
        console.log(`= [ani] ${selector} animation`);
      })
    }.bind(this));
  },

  animateP4Blessing: function () {
    const selector = '.page-4 .blessing';
    this.animate(selector, [{
        opacity: 0,
        scale3d: [0.2, 0.2, 0.2]
      },
      {
        ease: 'ease-out',
        opacity: 1,
        scale3d: [1, 1, 1]
      }
    ], 1000, function () {
      this.setData({
        ['p4AnimationCls.blessing']: ''
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
    return {
      title: '4月24日的邀请函',
      imageUrl: '../../images/share.jpg'
    }
  },

  onTapPrev: function () {
    const prevIndex = this.data.p3PhotoIndex - 1;
    this.setData({
      p3PhotoIndex: prevIndex
    }, function () {
      if (prevIndex === 0) {
        this.clearAnimationChain3Photo2();
        this.startAnimationChain3Photo1();
      } else {
        this.clearAnimationChain3Photo3();
        this.startAnimationChain3Photo2();
      }
    });
  },

  onTapNext: function () {
    const nextIndex = this.data.p3PhotoIndex + 1;
    this.setData({
      p3PhotoIndex: nextIndex
    }, function () {
      if (nextIndex === 1) {
        this.clearAnimationChain3Photo1();
        this.startAnimationChain3Photo2();
      } else {
        this.clearAnimationChain3Photo2();
        this.startAnimationChain3Photo3();
      }
    });
  },


});