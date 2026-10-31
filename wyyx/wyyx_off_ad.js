/*
 * 网易严选 · 去开屏广告
 * Loon / Quantumult X 共用的响应体脚本（$request / $response / $done 三件套）
 *
 * 仓库：https://github.com/zhanghaoanhui/fuck_ad
 *
 * 抓包依据：Loon 抓包 2026-10-31，网易严选 iOS 9.7.8
 *
 * 处理的两个接口：
 *   1. GET https://support.you.163.com/xhr/boot/getBootMedia.json
 *        data.bootPic   —— 开屏大图 + schemeUrl 活动页跳转
 *        data.bootVideo —— 开屏视频（本次抓包为 null）
 *      一次冷启动内该接口会被请求 3 次，每次返回不同的推广素材（A/B 投放），
 *      所以按「清空素材字段」处理，而不是只屏蔽某一张图。
 *   2. GET https://support.you.163.com/appversync/check.do
 *        data.wel_data  —— 旧版本欢迎页 / 开屏数据（本次抓包为 null，做兜底）
 *
 * 设计原则：
 *   - 只改写这两个 JSON 接口，不拦截 yanxuan.nosdn.127.net 图片 CDN，
 *     商品图、首页配图、详情页图片都不受影响；
 *   - 在原始响应上就地清空字段，保留 code / newDevice / needRookieGuide 等其它字段，
 *     不破坏接口结构，也不碰版本更新相关字段；
 *   - 仅当响应体解析失败时，才退回一份「无开屏素材」的最小合法响应；
 *   - 非 200、非目标接口、任何异常，一律原样放行。
 */
(function () {
  var url = ($request && $request.url) || '';
  var status = $response && $response.status;
  var body = ($response && $response.body) || '';

  var RE_BOOT = /\/xhr\/boot\/getBootMedia\.json(\?|$)/;
  var RE_WELCOME = /\/appversync\/check\.do(\?|$)/;

  function send(obj) {
    $done({ body: JSON.stringify(obj) });
  }

  // 兜底：一份字段齐全、但没有开屏素材的响应
  function minimalBoot() {
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

  // 就地清空开屏素材，其它字段原样保留
  function stripBoot(data) {
    data.bootPic = null;
    data.bootVideo = null;
    if ('firstPublishLogoUrl' in data) data.firstPublishLogoUrl = null;
    return data;
  }

  function parse(text) {
    try {
      var obj = JSON.parse(text);
      return obj && typeof obj === 'object' ? obj : null;
    } catch (e) {
      return null;
    }
  }

  try {
    // 失败响应不加工，避免把错误页替换成看起来正常的业务数据
    if (status && status !== 200) {
      $done({});
      return;
    }

    if (RE_BOOT.test(url)) {
      var boot = parse(body);
      if (boot && boot.data && typeof boot.data === 'object') {
        stripBoot(boot.data);
        send(boot);
      } else {
        send(minimalBoot());
      }
      return;
    }

    if (RE_WELCOME.test(url)) {
      var wel = parse(body);
      if (wel && wel.data && typeof wel.data === 'object') {
        if ('wel_data' in wel.data) wel.data.wel_data = null;
        if ('firstPublishLogoUrl' in wel.data) wel.data.firstPublishLogoUrl = null;
        send(wel);
      } else {
        $done({});
      }
      return;
    }

    // 其它请求不处理
    $done({});
  } catch (e) {
    // 任何异常都原样放行，避免把接口弄坏
    $done({});
  }
})();
