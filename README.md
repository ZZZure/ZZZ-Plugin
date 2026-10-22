# ZZZ-Plugin

<p align="center">
  <a href="https://github.com/ZZZure/ZZZ-Plugin"><img src="https://s2.loli.net/2024/04/19/hOEDmsoUFy6nH5d.jpg" width="480" height="270" alt="ZZZ-Plugin"></a>
</p>
<h1 align="center">ZZZ-Plugin</h1>
<h4 align="center">🚧Yunzai 绝区零 Bot 插件 ｜ 交流群 973399270🚧</h4>

> [!tip]
> 说明
>
> 插件依靠社区维护，发起者随缘更新，但是 ZZZure 组织成员会对 PR 进行合并，你可以在 PR 页面@协助者进行合并。
>
> 在你使用之前请 **务必** 完整阅读 `README` 内容，如因无视 `README` 遇到的问题，在提问时难免遭受嘲笑。

# 安装

进入 Yunzai 根目录，请根据网络情况选择运行下述指令之一：

使用 github

```bash
git clone --depth=1 https://github.com/ZZZure/ZZZ-Plugin.git ./plugins/ZZZ-Plugin
```

使用 gitee

```bash
git clone --depth=1 https://gitee.com/bietiaop/ZZZ-Plugin.git ./plugins/ZZZ-Plugin
```

安装后重启 Yunzai 即可使用。

## 注意

刷新抽卡链接需要“[逍遥插件](https://github.com/ctrlcvs/xiaoyao-cvs-plugin)”支持。需要刷新抽卡链接功能请安装逍遥插件。

# 功能

以下所有功能前缀为：`#zzz`、`%`、`#ZZZ`、`#绝区零` 任选其一

<details>
<summary> 点击展开帮助图 </summary>
<p align="center">
  <img width="800" src="https://s2.loli.net/2025/06/03/8jfKHbOkMXgxVu7.jpg" title="帮助图片">
</p>
</details>

## 自定义评分权重、伤害计算

**自定义评分权重** 请查看 [此教程](https://github.com/ZZZure/ZZZ-Plugin/blob/dev/src/model/score/README.md)

**自定义伤害计算** 请查看 [此教程](https://github.com/ZZZure/ZZZ-Plugin/blob/dev/src/model/damage/README.md)

## 攻略、图鉴

**攻略、图鉴建议使用第三方插件**，本插件的攻略功能是在没有专业插件的情况下的保底功能。

推荐使用的图鉴插件：

- [Atlas](https://github.com/Nwflower/Atlas)
  Atlas 是一个适用于 V3 版本及以上 Yunzai-Bot 的图鉴查询插件，可通过 Yunzai-Bot 查询游戏图鉴，插件代码严格遵循 ES6 规范。
- [Mora-Plugin](https://gitee.com/Rrrrrrray/mora-plugin)
  Mora-Plugin 是一个 Yunzai-Bot 的插件 仅用于自我学习其他优秀插件

## 自定义面板图

> 注意：未自定义角色面板图时，若穿戴角色时装，立绘会自动显示为时装立绘。自定义面板图后该功能失效

将你下载的面板图放在 `zzz插件目录/resources/images/panel/[角色名称]/` 文件夹下。若文件夹不存在请自行创建。

**角色名称** 可以是 [米游社绳网情报站](https://baike.mihoyo.com/zzz/wiki/channel/map/2/43) 中显示的代理人 `简称` 或 `全称`，也可以是 [插件数据 PartnerId2Data](resources/map/PartnerId2Data.json) 中的 `name` 或 `full_name`。四个路径依序检测，取第一个存在的路径中的面板图

若要查看或者批量删除自定义面板图，请发送指令 `%帮助` 进行查看如何使用相关指令。

## 验证码

遭遇验证码是不可避免的，这是米游社保护账号的一种方式，机器人的所有请求在米游社看来都是非法的，因此 **大概率** 会遭遇验证码。

如果你需要绕过验证码，请使用第三方插件。或者到交流群里询问他人使用的方法（请务必声明你 **已经** 阅读过 `README` 内容）。

## 默认设备

发送 `%设置默认设备` 可修改本插件自带默认设备参数，或使用锅巴插件进行修改。

## 绑定设备

本插件会自带一个默认设备参数模拟真机进行请求，但是这个设备参数会被所有使用本插件的用户共同使用，因此 **大概率** 会遭遇账号异常，因此在遇到米游社抛出对应错误时，需要每个人绑定 **已经登陆米游社账号的常用设备参数** 进行请求。

如果需要绑定设备，请发送 `%绑定设备帮助` 进行查看如何绑定。第一种方法就是抓包，此种方法危害性较小，技术难度相对较高，但是 IOS 与 Android 设备通用。

使用方法二绑定设备操作方便，仅需下载一个 **开源软件** 复制设备信息即可，仅适用于 Android 设备，但是其他人会看到你的设备基本信息如型号、ID 标识符等，需要提醒用户慎重选择。

如果认为以上两种方法麻烦，你可以自己尝试探索出其他未发现的方法。

绑定设备 **无法 100%解决** 账号异常问题。

## 更新展柜面板

若通过默认的米游社更新面板遇见账号异常问题，可尝试 **%更新展柜面板**，这将调用 [Enka](https://enka.network/?zzz) 接口更新游戏内展示的角色的数据。如若通过此方法更新的角色数据与实际不一致，请 [提出 issue](https://github.com/ZZZure/ZZZ-Plugin/issues/new)

该服务可能偶尔无法使用，如更新展柜面板一直请求失败，可通过锅巴修改 `自定义enkaApi地址` 项来自定义请求链接，请求和返回与 Enka 格式一致皆可

## QQBot 面板按钮

该功能**默认关闭**。可通过 `%开启面板按钮` / `%关闭面板按钮`、锅巴「面板设置 → QQBot 面板按钮」，或将 `config/panel.yaml` 中的 `buttons` 设为 `true` 开启。

在支持 `segment.button` 的 TRSS-Yunzai + QQBot-Plugin 环境中开启后，QQ群和机器人 C2C 私聊中的自己的角色面板、面板列表和更新结果会附加操作按钮。点击按钮会直接发送对应命令，仅允许发起查询的用户点击；账号相关操作使用该用户当前选中的绝区零 UID。面板相关按钮使用 `#zzz`，攻略按钮使用 `#绝区零`，以兼容 Mora 等攻略插件。

- 角色面板：面板列表、练度统计、角色攻略、更新面板。
- 面板列表和更新结果：更新操作或返回列表，以及最多八个角色的面板入口；更新结果优先展示本次更新的角色。

QQ 频道及频道私信、查询他人面板、第三方工具调用以及不支持按钮的环境保留原来的图片回复。QQBot 的消息模式决定按钮最终显示为键盘或文字入口。

## 角色图缺失

由于历史代码缘故，以前在游戏资源未更新就进行资源下载的可能导致角色图片缺失，你可以到插件资源目录手动删除对应文件，或者执行命令 `%删除全部资源` 进行删除。删除全部资源指令目前 **不会** 删除自定义面板图，仅会删除下载的图片资源，再次使用时需重新下载图片（自动下载）。

## 更新推送

如果你不需要更新推送，发送 `%关闭更新推送` 即可关闭更新推送，如果需要推送发送 `%开启更新推送` 即可开启更新推送。

此功能目前为默认关闭状态，如果你更新插件过早，可能会默认为开启状态，此时需要你发送指令进行关闭。

**此功能仅针对不及时更新插件并且到群里询问已解决的 bug 的用户。**

# 贡献

请先 `fork` 或切换至 本仓库 **dev 分支**，修改 **dev 分支** 并测试完成后提交 PR。

**请注意：**

> [!important]
> 请勿直接修改 **main** 分支的 dist 等编译产物；请基于 dev 分支修改并提交 PR，CI 会自动编译 ts 并同步到 main。
> 
> 请勿直接修改 **resources** 下的 css 编译产物；请基于 dev 分支对应的 scss 文件修改并提交，CI 会自动编译 scss 并同步到 main。

## 开发规范

* 提交前请确保本地已运行 `pnpm check`，能够成功通过且无报错
* 面板按钮回归：`pnpm test`，使用模拟消息和数据，不连接 QQ 或米游社

* 代码风格请参考 [eslint.config.mjs](./eslint.config.mjs)
  * 代码自检：`pnpm lint`
  * 自动修复：`pnpm lint:fix`

## TS 环境、编译

* 在宿主环境下（如将插件安装于 Miao-Yunzai 中进行开发），可使用 [tsconfig.json](./tsconfig.json) 作为 ts 环境配置
  * 全部编译：`pnpm build`
  * 监听编译：`pnpm watch`

* 在脱离宿主环境下（如独立开发或在 github actions 中编译），可使用 [tsconfig.src.json](./tsconfig.src.json) 作为 ts 环境配置
  * 全部编译：`pnpm build:src`
  * 监听编译：`pnpm watch:src`

## SCSS 编译

* 本项目的样式使用 scss 编写

* 项目的 scss 文件集中在 [resources](./resources/) 的子目录，开发时请编写/修改 scss，请勿提交 css
  * 全部编译：`pnpm build:css`
  * 监听编译：`pnpm watch:css`

# 鸣谢

- 特别鸣谢 **[Wuyi 无疑](https://github.com/KimigaiiWuyi)** 为 `ZZZeroUID` 和 `ZZZ-Plugin` 作出的巨大贡献！本插件的功能按照 **Wuyi 无疑** 的设计进行编写。欢迎给本仓库以及 [`ZZZeroUID`](https://github.com/ZZZure/ZZZeroUID) 点个 Star！
- 特别鸣谢以下攻略作者：
  - 新艾利都快讯
  - 清茶沐沐 Kiyotya
  - 小橙子阿
  - 猫冬
  - 月光中心

## 仓库贡献者

<a href="https://github.com/ZZZure/ZZZ-Plugin/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ZZZure/ZZZ-Plugin" />
</a>

## Reportbeats

![Alt](https://repobeats.axiom.co/api/embed/613a1e7717c6651ca1b725ceb710f6dc03fdb937.svg "Repobeats analytics image")

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=ZZZure/ZZZ-Plugin&type=Date)](https://star-history.com/#ZZZure/ZZZ-Plugin&Date)

# 其他

- 本项目仅供学习使用，请勿用于商业用途
- [GPL-3.0 License](./LICENSE)
