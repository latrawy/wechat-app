const api = require('../../config/config.js');
const app = getApp();
Page({
    data: {
        userInfo: {},   // 用户信息
        hasLogin: wx.getStorageSync('loginFlag')
            ? true
            : false     // 是否登录，根据后台返回的skey判断
    },
    onGotUserInfo: function (e) {
        let that = this;
        let infoRes = e.detail;
        let navigateUrl = '../books/books';
        console.info('userInfo is:', infoRes.userInfo);
        /* 
        * @desc: 获取用户信息 期望数据如下 
        *
        * @param: userInfo       [Object]
        * @param: rawData        [String]
        * @param: signature      [String]
        * @param: encryptedData  [String]
        * @param: iv             [String]
        **/
        if (infoRes) {
            // 请求服务端的登录接口
            wx.login({
                success: function (loginRes) {
                    if (loginRes.code) {
                        wx.request({
                            url: api.loginUrl,
            
                            data: {
                                code: loginRes.code,                    // 临时登录凭证
                                rawData: infoRes.rawData,               // 用户非敏感信息
                                signature: infoRes.signature,           // 签名
                                encryptedData: infoRes.encryptedData,   // 用户敏感信息
                                iv: infoRes.iv                          // 解密算法的向量
                            },
            
                            success: function (res) {
                                console.log('login success');
                                res = res.data;
            
                                if (res.result == 0) {
                                    app.globalData.userInfo = res.userInfo;
                                    wx.setStorageSync('userInfo', JSON.stringify(res.userInfo));
                                    wx.setStorageSync('loginFlag', res.skey);
                                    wx.switchTab({
                                        url: navigateUrl
                                    })
                                } else {
                                    that.showInfo(res.errmsg);
                                }
                            },
                            fail: function (error) {
                                // 调用服务端登录接口失败
                                that.showInfo('调用接口失败');
                                console.log(error);
                            }
                        });
                    }
                }
            })
        } else {
            console.log('获取用户数据失败');
            wx.hideLoading();
            that.checkUserInfoPermission();
        }
    },
    // 封装 wx.showToast 方法
    showInfo: function (info = 'error', icon = 'none') {
      wx.showToast({
        title: info,
        icon: icon,
        duration: 1500,
        mask: true
      });
    },
})