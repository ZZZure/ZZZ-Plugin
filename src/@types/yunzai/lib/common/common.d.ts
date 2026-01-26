declare module '*lib/common/common.js' {
  import { JsonElem, MessageRet, Sendable } from 'icqq'
  import { EventType } from '#interface'

  function relpyPrivate(userId: number, msg: Sendable, uin?: any): Promise<MessageRet | void>
  function sleep(ms: number): Promise<any>
  function downFile(fileUrl: string, savePath: string, param?: any): Promise<any>
  function makeForwardMsg(e: EventType, msg: Sendable[], dec?: string, msgsscr?: boolean): Promise<JsonElem>

  export default { sleep, relpyPrivate, downFile, makeForwardMsg }
}
