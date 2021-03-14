//index.js
const app = getApp();

const bgm = wx.createInnerAudioContext();

Page({
  data: {
    extraHeight: app.globalData.extraHeight,

    isBgmPlaying: false,
    // bgmURL: 'https://gzc-download.weiyun.com/ftn_handler/ad7e9d0dde7c8238b8998a9411be75a33afe86f8a30c3cef2a385760517ef5248d96a3e109021183fc59cb4794538d7b2d47b9906b73573febbfd10d798be120/will-you-marry-me-marlboro..mp3?fname=will-you-marry-me-marlboro..mp3&from=30013&version=3.3.3.3'
    bgmURL: 'cloud://wdi-9g06h4rvb0ad273b.7764-wdi-9g06h4rvb0ad273b-1256827581/will-you-marry-me-marlboro-32kbps..mp3'
  },

  onShow: function () {
    const that = this;

    bgm.autoplay = true;
    bgm.loop = true;
    bgm.src = that.data.bgmURL;

    if (!that.data.isBgmPlaying) {
      that.setData({
        isBgmPlaying: true
      });
      bgm.play();
    }
  },

  onShareAppMessage: function (res) {
    return {
      title: '04.24的婚礼电子请柬',
      path: '/page/index/index',
      imageUrl: 'cloud://wdi-9g06h4rvb0ad273b.7764-wdi-9g06h4rvb0ad273b-1256827581/share-cover.png'
    }
  }
})