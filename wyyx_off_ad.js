/*
 * 网易严选 · 去开屏广告
 * Quantumult X 响应体重写脚本
 *
 * 仓库：https://github.com/zhanghaoanhui/wyyx_off_ad
 *
 * 处理的接口（依据 2026-10-26 抓包）：
 *   1. GET https://support.you.163.com/xhr/boot/getBootMedia.json
 *      返回 data.bootPic / data.bootVideo，就是开屏广告的图片、视频和跳转 scheme。
 *      清空后 App 启动不再展示推广开屏，直接进首页。
 *   2. GET https://support.you.163.com/appversync/check.do
 *      返回 data.wel_data（旧版欢迎页/开屏数据），一并置空。
 *
 * 说明：
 *   - 不拦截 yanxuan.nosdn.127.net 等图片域名，商品图和页面配图不受影响；
 *   - 不改动版本更新字段，避免影响正常升级提示；
 *   - 解析失败时原样放行，不破坏接口。
 */

(function () {
  var url = ($request && $request.url) || '';
  var body = ($response && $response.body) || '';

  // 开屏广告素材：直接返回一个「没有开屏素材」的正常响应
  function emptyBootMedia() {
    return {
      code: '200',
      data: {
        bootPic: null,
        bootVideo: null,
        firstPublishLogoUrl: null,
        videoEffect: false,
        needRookieGuide: false,
        allowSkipRookieGuide: true,
        newDevice: false
      }
    };
  }

  // 版本同步接口：只清掉欢迎页数据，保留更新相关字段
  function stripWelcomeData(obj) {
    if (obj && obj.data && typeof obj.data === 'object') {
      if ('wel_data' in obj.data) obj.data.wel_data = null;
      if ('firstPublishLogoUrl' in obj.data) obj.data.firstPublishLogoUrl = null;
    }
    return obj;
  }

  try {
    if (/\/xhr\/boot\/getBootMedia\.json(\?|$)/.test(url)) {
      $done({ body: JSON.stringify(emptyBootMedia()) });
      return;
    }

    if (/\/appversync\/check\.do(\?|$)/.test(url)) {
      $done({ body: JSON.stringify(stripWelcomeData(JSON.parse(body))) });
      return;
    }

    // 其它请求不处理
    $done({});
  } catch (e) {
    // 任何异常都原样放行，避免接口被脚本弄坏
    $done({});
  }
})();
