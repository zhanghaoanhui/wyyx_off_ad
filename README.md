# 网易严选 · 去开屏广告

基于 **2026-10-31 Loon 抓包、网易严选 iOS 9.7.8** 整理的开屏广告屏蔽配置，同时提供 **Loon 插件** 与 **Quantumult X 重写**。

冷启动时网易严选会请求 `getBootMedia.json` 拉取开屏推广素材（大图 / 视频 + 活动页跳转 scheme），本配置把素材字段清空，App 拿不到开屏素材，启动直接进入首页。

## 效果

- 去掉冷启动的开屏推广图 / 开屏视频，不再出现「立即抢购」跳转
- 只改写 `support.you.163.com` 上的两个 JSON 接口，**不拦截图片 CDN**，商品图、首页配图、详情页均不受影响
- 保留版本更新相关字段，正常升级提示不受影响
- 接口解析异常时原样放行，不会把接口弄坏

## 抓包依据

| 接口 | 作用 | 处理 |
| --- | --- | --- |
| `GET https://support.you.163.com/xhr/boot/getBootMedia.json` | 返回 `data.bootPic`（开屏大图、`schemeUrl` 活动页跳转）、`data.bootVideo`（开屏视频） | `bootPic` / `bootVideo` / `firstPublishLogoUrl` 置空，其余字段保留 |
| `GET https://support.you.163.com/appversync/check.do` | 返回 `data.wel_data`（旧版欢迎页 / 开屏数据），本次抓包为 `null` | `wel_data` 置空，保留更新字段（兜底） |

一次冷启动内 `getBootMedia.json` 被请求了 **3 次**，每次都返回不同的推广素材（A/B 投放，图片为 `yanxuan.nosdn.127.net/static-union/...`，全屏 1284×2778）。
所以脚本按「清空素材字段」处理，而不是只屏蔽某一张图——否则换一次素材广告又回来了。

## 安装（Loon）

### 方式一：一键导入插件（推荐）

在 Loon 里打开下面链接即可导入：

```
loon://import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2Fzhanghaoanhui%2Ffuck_ad%2Fmain%2Fwyyx%2Fwyyx_off_ad.plugin
```

或手动：Loon → **配置** → **插件** → 右上角 `+` → 粘贴

```
https://raw.githubusercontent.com/zhanghaoanhui/fuck_ad/main/wyyx/wyyx_off_ad.plugin
```

### 方式二：手动添加脚本

Loon 配置文件的 `[Script]` 段加入：

```
http-response ^https:\/\/support\.you\.163\.com\/xhr\/boot\/getBootMedia\.json(\?|$) script-path=https://raw.githubusercontent.com/zhanghaoanhui/fuck_ad/main/wyyx/wyyx_off_ad.js, requires-body=true, timeout=10, tag=严选-开屏素材
http-response ^https:\/\/support\.you\.163\.com\/appversync\/check\.do(\?|$) script-path=https://raw.githubusercontent.com/zhanghaoanhui/fuck_ad/main/wyyx/wyyx_off_ad.js, requires-body=true, timeout=10, tag=严选-欢迎页
```

`[MITM]` 段加入：

```
hostname = support.you.163.com
```

### 收尾（两种方式都要做）

1. **证书**：Loon → 设置 → MitM → 生成证书 → 安装描述文件 → 到 iOS「设置 → 通用 → 关于本机 → 证书信任设置」里打开信任
2. **确认脚本已启用**（插件页开关为开）
3. 从后台完全划掉网易严选，重新冷启动

## 安装（Quantumult X）

重写 → 引用 → `+`，填入：

```
https://raw.githubusercontent.com/zhanghaoanhui/fuck_ad/main/wyyx/wyyx_off_ad.conf
```

并在 MitM 的 hostname 中包含 `support.you.163.com`，证书同样需要安装并信任。

## 文件说明

| 文件 | 说明 |
| --- | --- |
| `wyyx/wyyx_off_ad.plugin` | **Loon 插件**，含 `[Script]` 与 `[MITM]` |
| `wyyx/wyyx_off_ad.conf` | Quantumult X 重写配置，含 `[rewrite_local]` 与 `[mitm]` |
| `wyyx/wyyx_off_ad.js` | 响应体脚本，Loon / Quantumult X 通用（同一套 `$request` / `$response` / `$done` 接口） |

## 实现细节

- 在**原始响应**上就地清空字段，`code`、`newDevice`、`needRookieGuide`、`allowSkipRookieGuide`、`videoEffect` 等字段原样保留，接口结构不变
- 只有响应体解析失败时，才退回一份「无素材」的最小合法响应（字段与真实返回一致）
- 非 200 响应不加工，避免把错误页替换成看起来正常的业务数据
- 非目标 URL、任何异常 → `$done({})` 原样放行

## 排查

装完还有开屏，按顺序检查：

1. MitM 证书已安装且**已信任**，`support.you.163.com` 在 hostname 列表里
2. 插件 / 重写引用处于启用状态
3. 彻底杀掉 App 再冷启动（从后台划掉，不是回桌面）
4. 开屏素材有本地缓存，首次可多冷启动一两次
5. 仍无效说明接口有变化，欢迎带抓包提 issue

## 已知未处理

以下不是开屏广告，本仓库有意不处理，避免影响正常功能：

- 首页弹窗 `m.you.163.com/activity/popWindow`（站内 CRM 营销弹窗，reject 后 WebView 会白屏）
- H5 页面内的运营 banner（`static-union/...1224y262` 等），属于页面内容，屏蔽会破坏排版
- 统计 / 埋点（`log.zijieapi.com`、`h.trace.qq.com`、`ahb.you.163.com` 等），属于上报而非广告展示

## 国内网络拉不到 raw.githubusercontent.com？

Loon 下载插件和脚本走它自己的网络栈，如果 `raw.githubusercontent.com` 直连失败，任选其一：

1. 在 Loon 里给 `raw.githubusercontent.com` 配一条走代理的规则，例如 `DOMAIN,raw.githubusercontent.com,PROXY`
2. 或改用 jsDelivr 镜像（插件与脚本都可换域名，路径不变）：

   ```
   https://cdn.jsdelivr.net/gh/zhanghaoanhui/fuck_ad@main/wyyx/wyyx_off_ad.plugin
   https://cdn.jsdelivr.net/gh/zhanghaoanhui/fuck_ad@main/wyyx/wyyx_off_ad.js
   ```

   用镜像时，记得把插件 `[Script]` 里的两处 `script-path=` 一并换成上面的 js 地址（jsDelivr 对 `@main` 有缓存，改动后可能延迟几小时生效）。

## 免责声明

仅供学习与交流使用，请勿用于商业用途。屏蔽广告会影响 App 的推广收入，是否使用请自行权衡。
