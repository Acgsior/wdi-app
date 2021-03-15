//index.js
const app = getApp();

// FIXME need check why fileid do not work
// const audioURL = 'cloud://wdi-9g06h4rvb0ad273b.7764-wdi-9g06h4rvb0ad273b-1256827581/will-you-marry-me-marlboro-32kbps.mp3';
const audioURL = 'https://7764-wdi-9g06h4rvb0ad273b-1256827581.tcb.qcloud.la/will-you-marry-me-marlboro-32kbps.mp3?sign=a9f499c60953584d41af8e43befcf7af&t=1615743181';

Page({
  data: {
    // read extra height from global to adapt large screen
    extraHeight: app.globalData.extraHeight,

    audioContext: null,
    isPlaying: false
  },

  onReady: function () {
    wx.setInnerAudioOption({
      obeyMuteSwitch: false,
      success: function() {
        console.log('= [audio] audio set obey mute switch');
      },
      fail: function(e) {
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

    audioContext.onError((res) => {
      console.log('= [audio] audio onerroonErrorr');
      console.log(res.errMsg)
      console.log(res.errCode)
    });

    console.log('= [audio] audio try to play', audioContext.duration);
    const that = this;
    audioContext.onCanplay(() => {
      console.log('= [audio] audio onCanplay');
      audioContext.play();

      that.setData({ isPlaying: true });
    });
  },

  onUnload: function () {
    this.data.audioContext.destroy();
  },

  play: function() {
    this.data.audioContext.play();

    this.setData({ isPlaying: true });
  },

  stop: function() {
    this.data.audioContext.pause();

    this.setData({ isPlaying: false });
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