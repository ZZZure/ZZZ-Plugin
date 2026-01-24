import type { EventMap, EventType } from './message.ts'
import type {
  Client,
  segment as segmentSource,
  Sendable
} from 'icqq'
import type redisM from 'redis'
import type chalk from 'chalk'

type task = {
  name: string
  cron: string
  fnc: (e: any) => any
  dsc?: string
  log?: boolean
}

declare global {
  var Bot: typeof Client.prototype
  var redis: redisM.RedisClientType
  var segment: typeof segmentSource
  var logger: {
    chalk: typeof chalk
    red: typeof chalk
    yellow: typeof chalk
    blue: typeof chalk
    magenta: typeof chalk
    cyan: typeof chalk
    green: typeof chalk
    trace: (...args: any[]) => void
    debug: (...args: any[]) => void
    info: (...args: any[]) => void
    error: (...args: any[]) => void
    warn: (...args: any[]) => void
    fatal: (...args: any[]) => void
    mark: (...args: any[]) => void
  }

  class plugin {
    [key: string]: any
    [key: symbol]: any
    e: EventType
    name: string
    dsc: string
    event: keyof EventMap
    priority: number
    rule: {
      /** 指令匹配正则，无则全响应 */
      reg?: string | RegExp
      /** 执行函数名称 */
      fnc: string
      /** 调用函数时，是否输出日志 */
      log?: boolean
      /** 响应事件 */
      event?: keyof EventMap
      /** 响应权限 */
      permission?: 'master' | 'owner' | 'admin' | 'all'
    }[]
    task: task | task[]
    handler?: any[]
    namespace?: string
    /**
     * @param name 插件名称
     * @param dsc 插件描述
     * @param event 执行事件，默认message
     * @param priority 优先级，数字越小优先级越高
     * @param rule
     * @param rule.reg 命令正则
     * @param rule.fnc 命令执行方法
     * @param rule.event 执行事件，默认message
     * @param rule.log  false时不显示执行日志
     * @param rule.permission 权限 master,owner,admin,all
     * @param task
     * @param task.name 定时任务名称
     * @param task.cron 定时任务cron表达式
     * @param task.fnc 定时任务方法名
     * @param task.log  true时显示执行日志
     * @param handler handler配置
     * @param handler.key handler支持的事件key
     * @param handler.fn handler的处理func
     * @param namespace namespace，设置handler时建议设置
     */
    constructor({ name, dsc, event, priority, rule, task, handler, namespace }: {
      name: string
      dsc: string
      event?: keyof EventMap
      priority?: number
      rule?: {
        /** 指令匹配正则，无则全响应 */
        reg?: string | RegExp
        /** 执行函数名称 */
        fnc: string
        /** 调用函数时，是否输出日志 */
        log?: boolean
        /** 响应事件 */
        event?: keyof EventMap
        /** 响应权限 */
        permission?: 'master' | 'owner' | 'admin' | 'all'
      }[]
      task?: {
        name: string
        fnc: string
        dsc?: string
        cron: string
      }
      handler?: any[]
      namespace?: string
    })
    reply(msg?: Sendable, quote?: boolean, data?: {
      at?: boolean
      recallMsg?: number
    }): any
    conKey(isGroup?: boolean): string
    /**
     * @param fnc 执行方法名
     * @param isGroup 是否群聊
     * @param time 操作时间
     * @param timeoutReply 超时回复
     */
    setContext(fnc: string, isGroup?: boolean, time?: number, timeoutReply?: Sendable): any
    getContext(fnc?: string, isGroup?: boolean): any
    finish(fnc: string, isGroup?: boolean): void
    awaitContext(...args: any[]): Promise<EventType>
    resolveContext(lastE: any): void
    renderImg(plugin: any, tpl: any, data: any, cfg: any): Promise<any>
  }

}
