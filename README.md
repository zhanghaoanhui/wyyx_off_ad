# 网易严选 · 去开屏广告（Quantumult X）

基于 **2026-10-26 网易严选 iOS 9.7.6 抓包**整理的开屏广告重写。

冷启动时网易严选会请求 `getBootMedia.json` 拉取开屏推广素材（图片 / 视频 + 跳转 scheme），
本重写把这份素材清空，App 启动后不再展示推广开屏，直接进入首页。

## 效果

- 去掉冷启动的开屏推广图 / 视频，不再有「前往查看」跳转
- 不拦截 `yanxuan.nosdn.127.net` 等图片域名，商品图、首页配图不受影响
- 不修改版本更新字段，正常升级提示保留
- 脚本解析失败时原样放行，不会把接口弄坏

## 抓包依据

| 接口 | 作用 | 处理 |
| --- | --- | --- |
| `GET https://support.you.163.com/xhr/boot/getBootMedia.json` | 返回 `data.bootPic`（开屏大图、`schemeUrl` 活动页跳转）、`data.bootVideo` | `bootPic` / `bootVideo` 置空 |
| `GET https://support.you.163.com/appversync/check.do` | 返回 `data.wel_data`（旧版欢迎页 / 开屏数据） | `wel_data` 置空，保留更新字段 |

抓包中一次启动连续请求了 3 次 `getBootMedia.json`，返回 3 个不同的推广素材（A/B 测试），
所以脚本对这个接口直接返回「无素材」的合法响应，而不是只屏蔽某一张图。

> 首页弹窗 `m.you.163.com/activity/popWindow` 属于站内营销弹窗，不是开屏，本仓库未处理，避免影响首页正常加载。

## 安装

### 方式一：引用远程重写（推荐）

1. 打开 Quantumult X → **重写** → **引用** → 右上角 `+`
2. 填入：

   ```
   https://raw.githubusercontent.com/zhanghaoanhui/wyyx_off_ad/main/wyyx_off_ad.conf
   ```

3. 回到重写页，确认该引用已启用
4. **设置 → MitM** → 生成证书 → 安装证书 → 在 iOS「设置 → 通用 → 关于本机 → 证书信任设置」中信任
5. 确认 MitM 的 hostname 中包含 `support.you.163.com`
6. 从后台完全划掉网易严选，重新冷启动

### 方式二：手动添加

在 Quantumult X 的 `[rewrite_local]` 中加入：

```
^https:\/\/support\.you\.163\.com\/xhr\/boot\/getBootMedia\.json url script-response-body https://raw.githubusercontent.com/zhanghaoanhui/wyyx_off_ad/main/wyyx_off_ad.js
^https:\/\/support\.you\.163\.com\/appversync\/check\.do url script-response-body https://raw.githubusercontent.com/zhanghaoanhui/wyyx_off_ad/main/wyyx_off_ad.js
```

在 `[mitm]` 的 hostname 中加入：

```
support.you.163.com
```

## 文件说明

| 文件 | 说明 |
| --- | --- |
| `wyyx_off_ad.js` | 响应体重写脚本，处理上面两个接口 |
| `wyyx_off_ad.conf` | Quantumult X 重写配置（含 `[rewrite_local]` 与 `[mitm]`） |

## 常见问题

**装完还有开屏？**

- 确认 MitM 证书已安装并信任，且 `support.you.163.com` 在 hostname 列表里
- 确认重写引用处于启用状态，然后彻底杀掉 App 再冷启动
- 部分版本开屏有本地缓存，首次可多启动一两次；若长期无效，说明接口有变，欢迎带抓包提 issue

**会影响商品图片吗？**

不会。脚本只改写 `support.you.163.com` 上的两个 JSON 接口，不触碰图片 CDN。

**Surge / Loon 能用吗？**

脚本按 Quantumult X 的 `$response.body` / `$done({ body })` 写法编写，其它客户端需要按各自 API 调整。

## 免责声明

仅供学习与交流使用，请勿用于商业用途。屏蔽广告会影响 App 的推广收入，是否使用请自行权衡。
