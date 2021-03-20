//index.js
import assetUtils from '../../utils/assetUtils';


const app = getApp();

// FIXME need check why fileid do not work
// const audioURL = 'cloud://wdi-9g06h4rvb0ad273b.7764-wdi-9g06h4rvb0ad273b-1256827581/will-you-marry-me-marlboro-32kbps.mp3';
const audioURL = 'https://7764-wdi-9g06h4rvb0ad273b-1256827581.tcb.qcloud.la/will-you-marry-me-marlboro-32kbps.mp3?sign=a9f499c60953584d41af8e43befcf7af&t=1615743181';

const assetTotal = 2;

Page({
  data: {
    // read extra height from global to adapt large screen
    extraHeight: app.globalData.extraHeight,
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
      // audioContext.play();

      // that.setData({ isPlaying: true });
      this.notifyAssetLoaded('audio');
    });

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

  notifyAssetLoaded: function(e) {
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