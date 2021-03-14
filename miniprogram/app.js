//app.js
App({
  onLaunch: function () {
    const that = this;

    this.globalData = {}

    // check new version
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          // update resource ready
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好了, 是否重启应用?',
              success: function (res) {
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })
          wx.getUpdateManager().onUpdateFailed(function () {
            // update failed
            wx.showModal({
              title: '更新失败提示',
              content: '下载新版本失败, 请检查网络设置',
              showCancel: false
            })
          })
        }
      })
    } else {
      // if wechat app version is too old
      wx.showModal({
        title: '微信版本过低提示',
        confirmColor: '#D1B177',
        content: '当前微信版本过低, 暂时无法使用全部功能. 请升级到最新微信版本后重试.'
      })
    }

    // load fzyou font asset
    // https://0424-1256827581.cos.ap-chengdu.myqcloud.com/FZYouSJW-508R.woff2
    wx.loadFontFace({
      family: 'fzyou',
      source: 'url("https://0424-1256827581.cos.ap-chengdu.myqcloud.com/FZYouSJW-508R.woff2")',
      global: true,
      success: () => {
        console.log('=== load font success.');
      },
      fail: () => {
        console.log('=== load font fail.')
      }
    });

    // get windows height to calc visual content height distance for iphone 6
    wx.getSystemInfo({
      success: (res) => {
        console.log('=== window height', res.windowHeight);
        const windowHeight = res.windowHeight;
        if (windowHeight > 603) {
          that.globalData.extraHeight = windowHeight - 603;
        } else {
          that.globalData.extraHeight = 0;
        }
      }
    });
  },

  globalData: {
    extraHeight: 0
  }
})