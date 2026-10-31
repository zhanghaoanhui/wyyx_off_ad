# 高德地图 去广告净化

Loon 插件版，由 [@ddgksf2013](https://github.com/ddgksf2013) 的 `AmapAds.conf`（高德地图净化[墨鱼版] V1.0.28）改写而来。

## 插件地址

```
https://raw.githubusercontent.com/zhanghaoanhui/fuck_ad/main/Aimap/amap_off_ad.plugin
```

Loon → 配置 → 插件 → 添加，粘贴上面的地址即可。

## 功能

| 类型 | 说明 |
| --- | --- |
| 拦截 | 开屏请求、首页底部信息流、路线规划下方广告、Tip 请求、通用广告上报、搜索框 scene、首页左上角 gif、左下天气 |
| 脚本 | 开屏广告、首页顶部推广/底部、右中广告、底部 tab 角标、附近页面、打车页面、我的页面、搜索热词、amdc 处理 |
| 规则 | `optimus-ads.amap.com` 直连 |

脚本沿用原作者仓库（`ddgksf2013/Scripts` 的 `amap.js`、`amdc.js`），随作者更新自动生效。

## 使用注意

- 原作者的提示：`使用前请卸载高德地图，挂载插件后重新安装`。
- 需要开启 MITM 并信任 Loon 的根证书。
- 只对 `m5.amap.com`、`m5-zb.amap.com`、`center.amap.com`、`amap-aos-info-nogw.amap.com`、`ai.amap.com` 这几个域名做 MITM（沿用原配置）。
- 去除广告会影响 App 推广收入，请自行权衡。

## 致谢

脚本与规则作者：[@ddgksf2013](https://github.com/ddgksf2013)（微信公众号「墨鱼手记」）。
