import type { EventType } from '#interface'
import type { Sendable } from 'icqq'
import settings from './settings.js'

type PanelButton = {
  text: string
  input: string
  send: true
  permission: string
}

export type PanelButtonMessage = {
  type: 'button'
  data: PanelButton[][]
}

type ButtonSegment = typeof segment & {
  button?: (...rows: PanelButton[][]) => PanelButtonMessage
}

type PanelCharacter = {
  name_mi18n: string
}

export class PanelButtons {
  readonly enabled: boolean
  private readonly userId: string

  constructor(e: EventType) {
    const bot = e.bot as typeof e.bot & { adapter?: { id?: string } }
    this.userId = e.user_id == null ? '' : String(e.user_id)
    // 频道和频道私信也由 QQBot 接入，但不支持这里的按钮。
    const isGuild = e.isGuild || this.userId.startsWith('qg_') ||
      String(e.group_id ?? '').startsWith('qg_')
    // 查询他人时按钮不带 UID，点击会查回自己的账号；需在锅巴/panel.yaml 中开启 buttons。
    this.enabled = !!settings.getConfig('panel')?.buttons &&
      bot?.adapter?.id === 'QQBot' && !isGuild && !e.at && !!this.userId &&
      typeof segment !== 'undefined' && typeof (segment as ButtonSegment).button === 'function'
  }

  private button(text: string, command: string, prefix = '#zzz'): PanelButton {
    // 发送普通命令，保留 QQ 被动回复所需的消息 ID。
    return {
      text,
      input: `${prefix}${command}`,
      send: true,
      permission: this.userId
    }
  }

  private make(rows: PanelButton[][]): PanelButtonMessage | undefined {
    if (!this.enabled) return
    return (segment as ButtonSegment).button?.(...rows)
  }

  detail(name: string): PanelButtonMessage | undefined {
    if (!name || /[\r\n]/.test(name)) return
    return this.make([
      [this.button('面板列表', '面板列表'), this.button('练度统计', '练度统计')],
      // 攻略可能由 Mora 接管，中文前缀能让它识别游戏。
      [this.button('角色攻略', `${name}攻略`, '#绝区零'), this.button('更新面板', '更新面板')]
    ])
  }

  list(characters: readonly PanelCharacter[], refreshed = false): PanelButtonMessage | undefined {
    if (!this.enabled) return
    const rows: PanelButton[][] = [[
      refreshed ? this.button('面板列表', '面板列表') : this.button('更新面板', '更新面板'),
      this.button('更新展柜面板', '更新展柜面板')
    ]]
    const names = new Set<string>()
    // 每行两个、最多五行，扣除操作按钮后可放八个角色。
    for (const character of characters) {
      const name = character.name_mi18n?.trim()
      if (!name || /[\r\n]/.test(name) || names.has(name)) continue
      if (names.size === 8) break
      if (names.size % 2 === 0) rows.push([])
      rows[rows.length - 1].push(this.button(`${name}面板`, `${name}面板`))
      names.add(name)
    }
    return this.make(rows)
  }
}

export function appendPanelButtons(image: Sendable, buttons?: PanelButtonMessage): Sendable {
  // TRSS 按钮段不在 icqq 类型定义里，只在发送处转换。
  return image && buttons ? [image, buttons] as unknown as Sendable : image
}
