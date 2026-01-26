declare module '*lib/config/config.js' {
  import { FSWatcher } from "chokidar"

  type ConfigType = 'config' | 'default_config'
  type CfgName = 'bot' | 'group' | 'notice' | 'other' | 'qq' | 'redis' | 'renderer' | 'db'
  type keyType = `${ConfigType}.${CfgName}` | `test.${'config' | 'default'}`

  /** 配置文件 */
  declare class Cfg {
    config: {
      [key in keyType]: {
        [key: string]: any
      }
    }
    watcher: {
      [key in keyType]?: FSWatcher
    }
    constructor()
    /**
     * 初始化配置文件
     */
    initCfg(): void
    /** 机器人qq号 */
    get qq(): number
    /** 机器人密码 */
    get pwd(): string
    /** bot配置 */
    get bot(): BotCfg
    /** other配置 */
    get other(): OtherCfg
    /** redis配置 */
    get redis(): {
      [key: string]: any
    }
    /** renderer配置 */
    get renderer(): {
      [key: string]: any
    }
    /** notice配置 */
    get notice(): {
      [key: string]: any
    }
    /** db配置 */
    get db(): {
      [key: string]: any
    }
    /** 主人Q号 */
    get masterQQ(): string[]
    /** package.json */
    get package(): {
      [key: string]: any
    }
    /** 群配置 */
    getGroup(groupId: number | string): GroupCfg
    /** === other */
    getOther(): OtherCfg
    /** === notice */
    getNotice(): {
      [key: string]: any
    }
    /** 默认配置，原始数据 */
    getdefSet(name: CfgName): {
      [key: string]: any
    }
    /** 用户配置，原始数据 */
    getConfig(name: CfgName): {
      [key: string]: any
    }
    /**
     * 读取config/config/下yaml并监听；原始数据
     * @param dir 默认配置default_config，用户配置config
     * @param name 文件名称，不含后缀
     */
    getYaml(dir: ConfigType, name: CfgName): {
      [key: string]: any
    }
    /**
     * 测试模式配置文件
     */
    getYaml(dir: 'test', name: 'config' | 'default'): {
      [key: string]: any
    }
    /** 监听配置文件 */
    watch(file: string, name: CfgName, type: ConfigType = "default_config"): void
    change_qq(): void
    change_bot(): Promise<void>
  }
  declare const _default: Cfg
  export default _default
  /** 群配置数据 */
  export interface GroupCfg {
    /** 群聊中所有指令操作冷却时间，单位毫秒，0则无限制 */
    groupGlobalCD: number
    /** 群聊中个人操作冷却时间，单位毫秒 */
    singleCD: number
    /** 是否只仅关注主动@机器人的消息， 0-否 1-是 2-触发用户非主人只回复@机器人的消息及特定前缀的消息，主人免前缀 */
    onlyReplyAt: 0 | 1 | 2
    /** 只启用的功能，配置后只有该项中功能才响应 */
    botAlias: string[]
    /** 只启用的功能，配置后只有该数组中功能才响应 */
    enable: string[]
    /** 禁用功能，功能名称。例如：欢迎新人、退群通知 */
    disable: string[]
  }
  /** other配置文件数据 */
  export interface OtherCfg {
    /** 是否自动同意加好友 1 - 同意 0 - 不处理 */
    autoFriend: 0 | 1
    /** 是否自动退群人数，当被好友拉进群时，群人数小于配置值自动退出， 默认50，0则不处理 */
    autoQuit: number
    /** 主人QQ号 */
    masterQQ: number[]
    /** 黑名单qq */
    blackQQ: number[]
    /** 白名单qq */
    whiteQQ: number[]
    /** 白名单群，配置后只在该群生效 */
    whiteGroup: number[]
    /** 黑名单群 */
    blackGroup: number[]
    /** 禁用频道功能 true: 不处理频道消息，flase：处理频道消息 */
    disableGuildMsg: boolean
    /** 禁用私聊功能 true: 不处理私聊消息，flase：处理私聊消息 */
    disablePrivate: boolean
    /** 禁用私聊Bot提示内容 */
    disableMsg: string
    /** 私聊通行字符串，当私聊消息内容包含该字符串时，处理私聊消息 */
    disableAdopt: string[]
  }
  /** bot配置文件数据 */
  export interface BotCfg {
    /**
     * 日志等级：
     * - trace, debug, info, warn, fatal, mark, error, off
     * - mark时只显示执行命令，不显示聊天记录
     * @default 'info'
     */
    log_level: 'trace' | 'debug' | 'info' | 'warn' | 'fatal' | 'mark' | 'error' | 'off'
    /** 群聊和频道中过滤自己的消息 */
    ignore_self: boolean
    /** 被风控时是否尝试用分片发送 */
    resend: boolean
    /** 发送消息错误时是否通知主人 */
    sendmsg_error: boolean
    /** 重启API端口 仅ksr.js生效 */
    restart_port: number
    /** ffmpeg */
    ffmpeg_path: string
    ffprobe_path: string
    /** chromium其他路径 */
    chromium_path: string
    /** puppeteer接口地址 */
    puppeteer_ws: string
    /** puppeteer截图超时时间 */
    puppeteer_timeout: number
    /** 米游社接口代理地址，国际服用 */
    proxyAddress: string
    /** 上线时给首个主人QQ推送帮助 */
    online_msg: boolean
    /** 上线推送通知的冷却时间 */
    online_msg_exp: number
    /** 是否跳过登录ICQQ */
    skip_login: boolean
    /** 是否启用串行加载插件 */
    serial_load: boolean
    /** 签名API地址(如: http://127.0.0.1:801/sign?key=251) */
    sign_api_addr: string
    /** 传入的QQ版本(如: 8.9.78、8.9.83) */
    ver: string
    /** 滑动验证自动获取ticket API地址 */
    slider_ticket_addr: string
  }

}
