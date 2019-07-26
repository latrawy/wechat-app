const api = require('../../config/config.js');
const app = getApp();
Page({
    data: {
        userInfo: {},   // 用户信息
    },
    onGotUserInfo: function (e) {
        let that = this;
        let infoRes = e.detail;
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
        if (infoRes.userInfo) {
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
                                    that.jumpTo();
                                } else {
                                    app.showInfo(res);
                                    app.showInfo(res.errmsg);
                                }
                            },
                            fail: function (error) {
                                // 调用服务端登录接口失败
                                app.showInfo('调用接口失败');
                                console.log(error);
                            }
                        });
                    }
                }
            })
        } else {
            console.log('获取用户数据失败');
            wx.hideLoading();
            app.showInfo('被拒绝了QAQ');
        }
    },
    cancelGotUserInfo: function (e) {
        let that = this;
        console.log('获取用户数据失败');
        wx.hideLoading();
        // 检查用户信息授权设置
        app.showInfo('被拒绝了QAQ');
    },
    // 页面跳转
    jumpTo: function () {
        let navigateUrl = '../books/books';
        let pages = getCurrentPages(); // 获取当前页面的页桢
        // 判断上级页面是否存在
        if (pages.length > 1) {
            let prePage = pages[pages.length - 2];
            prePage.updateData();
            wx.navigateBack({
                delta: 1
            })
        } else {
            wx.switchTab({
                url: navigateUrl
            });
        }
    },
})