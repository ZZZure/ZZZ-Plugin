declare module '*lib/plugins/handler.js' {
  import { EventType } from "#interface"

  function has(key: string): boolean
  function call(key: string, e?: EventType, args?: any, allHandler?: boolean): Promise<any>

  export default { has, call }

}
