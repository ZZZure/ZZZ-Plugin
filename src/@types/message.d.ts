import type {
  GroupMessage,
  Friend,
  Member,
  Group,
  PrivateMessage,
  Sendable,
  EventMap as OriEventMap,
  Client,
  Message,
  MessageRet
} from 'icqq'
import type Runtime from '../../../../lib/plugins/runtime.js'
import type { ZZZ } from '#interface'

type _EventMap_ = Pick<OriEventMap, Exclude<keyof OriEventMap, 'message.group' | 'message' | 'message.private'>>

// 事件
export interface EventMap extends _EventMap_ {
  'message': (event: EventType) => void
  'message.group': (event: GroupMessageType) => void
  'message.private': (event: PrivateMessageType) => void
}

// 插件类基础参数
export type PluginSuperType = {
  /**
   * 应用名
   * 用于过滤功能启动和关闭
   * @param name
   */
  name?: string
  /** 插件描述 */
  dsc?: string
  /** namespace，设置handler时建议设置 */
  namespace?: string
  /**
   * @param handler handler配置
   * @param handler.key handler支持的事件key
   * @param handler.fn handler的处理func
   */
  handler?: {
    key: string,
    fn: string
  }[]
  /**
   *  task
   *  task.name 定时任务名称
   *  task.cron 定时任务cron表达式
   *  task.fnc 定时任务方法名
   *  task.log  false时不显示执行日志
   */
  task?: {
    name: string
    cron: string
    fnc: string
    dsc?: string
    log?: boolean
  }[]
  /** 优先级 */
  priority?: number
  /** 事件 */
  event?: keyof EventMap
  /**
   *  rule
   *  rule.reg 命令正则
   *  rule.fnc 命令执行方法
   *  rule.event 执行事件，默认message
   *  rule.log  false时不显示执行日志
   *  rule.permission 权限 master,owner,admin,all
   */
  rule?: RuleType[]
}

export type PermissionType = 'master' | 'owner' | 'admin' | 'all'

export type RuleType = {
  /** 正则 */
  reg?: RegExp | string
  /** 函数名 */
  fnc?: string
  /** 事件 */
  event?: keyof EventMap
  /** 是否打印log */
  log?: boolean
  /** 权限 */
  permission?: PermissionType
}

/** 私聊消息接口 */
export interface PrivateMessageType extends PrivateMessage {
  /** 支持扩展属性 */
  [key: string]: any
  /** 是否是机器人主人 */
  isMaster: boolean
  /** 是否群聊 */
  isGroup: false
  /** 是否私聊 */
  isPrivate: true
  /** 是否频道 */
  isGuild: false
  /** 用户名 */
  user_id: number
  /** 用户消息 */
  msg: string
  /** 图片 */
  img: string[]
  /** 是否存在at */
  at?: any
  /** 是否at了机器人 */
  atBot?: boolean
  /** 携带的文件 */
  file?: { name: string, fid: string }
  /** 被执行的地址 */
  logText: string
  /** 被执行的方法 */
  logFnc: string
  /**
   * @param msg 发送的消息
   * @param quote 是否引用回复
   * @param data.recallMsg 群聊是否撤回消息，0-120秒，0不撤回
   * @param data.at 是否at用户
   */
  reply: (
    msg: Sendable,
    quote?: boolean,
    data?: {
      recallMsg?: number
      at?: any
    }
  ) => Promise<any>
  /** Bot实例 */
  bot: typeof Client.prototype
  /** 机器人QQ号 */
  self_id?: number
  /** 是否符合别名要求 */
  hasAlias?: boolean
  /** 好友对象 */
  friend: Friend
}

/** 群聊消息接口 */
export interface GroupMessageType extends GroupMessage {
  /** 支持扩展属性 */
  [key: string]: any
  /** 是否是机器人主人 */
  isMaster: boolean
  /** 是否群聊 */
  isGroup: true
  /** 是否私聊 */
  isPrivate: false
  /** 是否频道 */
  isGuild: false
  /** 用户名 */
  user_id: number
  /** 用户消息 */
  msg: string
  /** 图片 */
  img?: string[]
  /** 是否存在at */
  at?: number
  /** 是否at了机器人 */
  atBot: boolean
  /** 携带的文件 */
  file?: { name: string, fid: string }
  /** 被执行的地址 */
  logText: string
  /** 被执行的方法 */
  logFnc: string
  /**
   * @param msg 发送的消息
   * @param quote 是否引用回复
   * @param data.recallMsg 群聊是否撤回消息，0-120秒，0不撤回
   * @param data.at 是否at用户
   */
  reply: (
    msg: Sendable,
    quote?: boolean,
    data?: {
      recallMsg?: number
      at?: any
    }
  ) => Promise<any>
  /** 群实例 */
  group: Group
  /** Bot实例 */
  bot: typeof Client.prototype
  /** Member实例 */
  member: Member
  /** 机器人QQ号 */
  self_id?: number
  /** 是否符合别名要求 */
  hasAlias?: boolean
}

/** 消息事件 */
export interface EventType extends Message {
  /** 支持扩展属性 */
  [key: string]: any
  [key: symbol]: any
  /** 是否是机器人主人 */
  isMaster: boolean
  /** 是否群聊 */
  isGroup: boolean
  /** 是否私聊 */
  isPrivate: boolean
  /** 是否频道 */
  isGuild: boolean
  /** 用户名 */
  user_id: number
  /** 用户消息 */
  msg: string
  /** 发送者信息 */
  sender: { user_id: number, nickname: string, card: string }
  /** 图片 */
  img: string[]
  /** 群号 */
  group_id?: number
  /** 群名 */
  group_name?: string
  /** at目标 */
  at?: number
  /** 是否at了机器人 */
  atBot: boolean
  /** 携带的文件 */
  file?: { name: string, fid: string }
  /** 被执行的地址 */
  logText: string
  /** 被执行的方法 */
  logFnc: string
  /**
   * @param msg 发送的消息
   * @param quote 是否引用回复
   * @param data.recallMsg 群聊是否撤回消息，0-120秒，0不撤回
   * @param data.at 是否at用户
   */
  reply: (
    msg?: Sendable,
    quote?: boolean,
    data?: {
      recallMsg?: number | boolean
      at?: any
    }
  ) => Promise<MessageRet>
  /** */
  notice_type: string
  /** 群实例 */
  group: Group
  /** Bot实例 */
  bot: typeof Client.prototype
  /** */
  approve?: any
  /** Member实例 */
  member?: Member
  /** 机器人QQ号 */
  self_id?: number
  /** 是否符合别名要求 */
  hasAlias: boolean
  runtime: Runtime
  /** Friend实例 */
  friend?: Friend
  /** 游戏标识 */
  game: string
  /** 玩家信息 */
  playerCard?: ZZZ.playerCard
}
