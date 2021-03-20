// components/spin/spin.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    percent: 0,
    spinning: false
  },

  /**
   * 组件的方法列表
   */
  methods: {

  },

  pageLifetimes: {
    show: function () {
      this.setData({
        percent: 0
      });
    },

    hide: function () {
      this.setData({
        percent: 0
      });
    },
  },

  options: {
    styleIsolation: 'shared'
  }
})