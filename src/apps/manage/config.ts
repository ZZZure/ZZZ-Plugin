import type { EventType } from '#interface'
import settings from '../../lib/settings.js'

/** 设置渲染精度 */
export async function setRenderPrecision(e: EventType) {
  // @ts-expect-error
  e ||= this.e
  if (!e.isMaster) {
    return e.reply('仅限主人设置', false, { at: true, recallMsg: 100 })
  }
  const match = /渲染精度(\d+)$/.exec(e.msg)
  if (!match) return false
  const render_precision = Number(match[1])
  if (render_precision < 50) {
    return e.reply('渲染精度不能小于50', false, {
      at: true,
      recallMsg: 100
    })
  }
  if (render_precision > 200) {
    return e.reply('渲染精度不能大于200', false, {
      at: true,
      recallMsg: 100
    })
  }
  settings.setSingleConfig('config', 'render', {
    scale: render_precision
  })
  await e.reply(`绝区零渲染精度已设置为: ${render_precision}`)
}

/** 设置刷新抽卡间隔 */
export async function setRefreshGachaInterval(e: EventType) {
  // @ts-expect-error
  e ||= this.e
  if (!e.isMaster) {
    return e.reply('仅限主人设置', false, { at: true, recallMsg: 100 })
  }
  const match = /刷新抽卡间隔(\d+)$/.exec(e.msg)
  if (!match) return false
  const refresh_gacha_interval = Number(match[1])
  if (refresh_gacha_interval < 0) {
    return e.reply('刷新抽卡间隔不能小于0秒', false, {
      at: true,
      recallMsg: 100
    })
  }
  if (refresh_gacha_interval > 1000) {
    return e.reply('刷新抽卡间隔不能大于1000秒', false, {
      at: true,
      recallMsg: 100
    })
  }
  settings.setSingleConfig('gacha', 'interval', refresh_gacha_interval)
  await e.reply(`绝区零刷新抽卡间隔已设置为: ${refresh_gacha_interval}`)
}

/** 设置刷新面板间隔 */
export async function setRefreshPanelInterval(e: EventType) {
  // @ts-expect-error
  e ||= this.e
  if (!e.isMaster) {
    return e.reply('仅限主人设置', false, { at: true, recallMsg: 100 })
  }
  const match = /刷新面板间隔(\d+)$/.exec(e.msg)
  if (!match) return false
  const refresh_panel_interval = Number(match[1])
  if (refresh_panel_interval < 0) {
    return e.reply('刷新面板间隔不能小于0秒', false, {
      at: true,
      recallMsg: 100
    })
  }
  if (refresh_panel_interval > 1000) {
    return e.reply('刷新面板间隔不能大于1000秒', false, {
      at: true,
      recallMsg: 100
    })
  }
  settings.setSingleConfig('panel', 'interval', refresh_panel_interval)
  await e.reply(
    `绝区零刷新面板间隔已设置为: ${refresh_panel_interval}`,
    false,
    { at: true, recallMsg: 100 }
  )
}

/** 设置角色刷新间隔 */
export async function setRefreshCharInterval(e: EventType) {
  // @ts-expect-error
  e ||= this.e
  if (!e.isMaster) {
    return e.reply('仅限主人设置', false, { at: true, recallMsg: 100 })
  }
  const match = /刷新角色间隔(\d+)$/.exec(e.msg)
  if (!match) return false
  const refresh_char_interval = Number(match[1])
  if (refresh_char_interval < 100) {
    return e.reply('刷新角色间隔不能小于100毫秒', false, {
      at: true,
      recallMsg: 100
    })
  }
  if (refresh_char_interval > 10000) {
    return e.reply('刷新角色间隔不能大于10000毫秒', false, {
      at: true,
      recallMsg: 100
    })
  }
  settings.setSingleConfig('panel', 'roleInterval', refresh_char_interval)
  await e.reply(`绝区零刷新角色间隔已设置为: ${refresh_char_interval}毫秒`)
}
