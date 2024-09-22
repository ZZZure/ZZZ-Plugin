# ZZZ-Plugin

<p align="center">
  <a href="https://github.com/ZZZure/ZZZ-Plugin"><img src="https://s2.loli.net/2024/04/19/hOEDmsoUFy6nH5d.jpg" width="480" height="270" alt="ZZZ-Plugin"></a>
</p>
<h1 align = "center">ZZZ-Plugin</h1>
<h4 align = "center">🚧Yunzai绝区零Bot插件 ｜ 交流群 973399270🚧</h4>

> [!tip]
> 说明
> 
> 插件依靠社区维护，发起者随缘更新，但是ZZZure组织成员会对PR进行合并，你可以在PR页面@协助者进行合并。
>
> 在你使用之前请**务必**完整阅读 `README` 内容，如因无视 `README` 遇到的问题，在提问时难免遭受嘲笑。

# 安装

进入Yunzai根目录，请根据网络情况选择运行下述指令之一：

使用github
```bash
git clone --depth=1 https://github.com/ZZZure/ZZZ-Plugin.git ./plugins/ZZZ-Plugin
```
使用gitee
```bash
git clone --depth=1 https://gitee.com/bietiaop/ZZZ-Plugin.git ./plugins/ZZZ-Plugin
```

安装后重启Yunzai即可使用。

## 注意

刷新抽卡链接需要“[逍遥插件](https://github.com/ctrlcvs/xiaoyao-cvs-plugin)”支持。需要刷新抽卡链接功能请安装逍遥插件。

# 功能

以下所有功能前缀为：`#zzz`、`%`、`#ZZZ`、`#绝区零` 任选其一

![帮助图片](https://s2.loli.net/2024/08/23/apNDFBj8Gt7LIxy.png)

## 攻略、图鉴

**攻略、图鉴建议使用第三方插件**，本插件的攻略功能是在没有专业插件的情况下的保底功能。

推荐使用的图鉴插件：

* [Atlas](https://github.com/Nwflower/Atlas)
  Atlas是一个适用于V3版本及以上Yunzai-Bot的图鉴查询插件，可通过Yunzai-Bot查询游戏图鉴，插件代码严格遵循ES6规范。
* [Mora-Plugin](https://gitee.com/Rrrrrrray/mora-plugin)
  Mora-Plugin是一个Yunzai-Bot的插件 仅用于自我学习其他优秀插件

## 自定义面板图

将你下载的面板图放在`zzz插件目录/resources/images/panel/[角色名简称]/`文件夹下。若文件夹不存在请自行创建。

**角色名简称**请参考官方wiki中代理人名称：[米游社·绝区零 绳网情报站](https://baike.mihoyo.com/zzz/wiki/channel/map/2/43)

若要查看或者批量删除自定义面板图，请发送指令 `%帮助` 进行查看如何使用相关指令。

## 验证码

遭遇验证码是不可避免的，这是米游社保护账号的一种方式，机器人的所有请求在米游社看来都是非法的，因此**大概率**会遭遇验证码。

如果你需要绕过验证码，请使用第三方插件。或者到交流群里询问他人使用的方法（请务必声明你**已经**阅读过 `README` 内容）。

## 默认设备

发送 `%设置默认设备` 可修改本插件自带默认设备参数，或使用锅巴插件进行修改。

## 绑定设备

本插件会自带一个默认设备参数模拟真机进行请求，但是这个设备参数会被所有使用本插件的用户共同使用，因此**大概率**会遭遇账号异常，因此在遇到米游社抛出对应错误时，需要每个人绑定**已经登陆米游社账号的常用设备参数**进行请求。

如果需要绑定设备，请发送 `%绑定设备帮助` 进行查看如何绑定。第一种方法就是抓包，此种方法危害性较小，技术难度相对较高，但是IOS与Android设备通用。

使用方法二绑定设备操作方便，仅需下载一个**开源软件**复制设备信息即可，仅适用于Android设备，但是其他人会看到你的设备基本信息如型号、ID标识符等，需要提醒用户慎重选择。

如果认为以上两种方法麻烦，你可以自己尝试探索出其他未发现的方法。

绑定设备**无法100%解决**账号异常问题。

## 角色图缺失

由于历史代码缘故，以前在游戏资源未更新就进行资源下载的可能导致角色图片缺失，你可以到插件资源目录手动删除对应文件，或者执行命令 `%删除全部资源` 进行删除。删除全部资源指令目前**不会**删除自定义面板图，仅会删除下载的图片资源，再次使用时需重新下载图片（自动下载）。

## 更新推送

如果你不需要更新推送，发送 `%关闭更新推送` 即可关闭更新推送，如果需要推送发送 `%开启更新推送` 即可开启更新推送。

此功能目前为默认关闭状态，如果你更新插件过早，可能会默认为开启状态，此时需要你发送指令进行关闭。

**此功能仅针对不及时更新插件并且到群里询问已解决的bug的用户。**

# 贡献

请先 `fork` 本仓库，修改并测试完成后提交PR。

**请注意：**

* 你的 CSS 必须是 `scss` 编写

# 鸣谢

* 特别鸣谢 **[Wuyi无疑](https://github.com/KimigaiiWuyi)** 为 `ZZZeroUID` 和 `ZZZ-Plugin` 作出的巨大贡献！本插件的功能按照 **Wuyi无疑** 的设计进行编写。欢迎给本仓库以及 [`ZZZeroUID`](https://github.com/ZZZure/ZZZeroUID) 点个 Star！
* 特别鸣谢以下攻略作者：
  * 新艾利都快讯
  * 清茶沐沐Kiyotya
  * 小橙子阿
  * 猫冬
  * 月光中心

## 仓库贡献者

<a href="https://github.com/ZZZure/ZZZ-Plugin/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ZZZure/ZZZ-Plugin" />
</a>

## Reportbeats
![Alt](https://repobeats.axiom.co/api/embed/613a1e7717c6651ca1b725ceb710f6dc03fdb937.svg "Repobeats analytics image")

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=ZZZure/ZZZ-Plugin&type=Date)](https://star-history.com/#ZZZure/ZZZ-Plugin&Date)

# 其他

* 本项目仅供学习使用，请勿用于商业用途
* [GPL-3.0 License](./LICENSE)
