import { getPanelOrigin, formatPanelData } from '../lib/avatar.js'
import { avatar_calc } from '../model/damage/avatar.js'
import { rulePrefix } from '../lib/common.js'
import { ZZZPlugin } from '../lib/plugin.js'
import settings from '../lib/settings.js'

export class Damage extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Damage',
      dsc: 'zzzdamage',
      event: 'message',
      priority: settings.getConfig('priority')?.panel ?? 70,
      rule: [
        {
          reg: `${rulePrefix}(.+)伤害\\d*$`,
          fnc: 'charDamagePanel'
        }
      ]
    })
  }

  async charDamagePanel() {
    const uid = await this.getUID()
    if (!uid) {
      return this.reply('UID为空')
    }
    const reg = new RegExp(`${rulePrefix}(.+)伤害(\\d*)$`)
    const match = this.e.msg.match(reg)
    if (!match) return null
    const name = match[4]
    const data = getPanelOrigin(uid, name)
    if (data === false) {
      return this.reply(`角色${name}不存在，请确保角色名称/别称存在`)
    } else if (data === null) {
      return this.reply(`暂无角色${name}面板数据，请先%更新面板`)
    }
    const parsedData = formatPanelData(data)
    const calc = avatar_calc(parsedData)
    const damages = parsedData._damages = calc?.calc()
    if (!calc || !damages?.length) return this.reply(`暂无角色${name}的伤害计算`)
    let skillIndex = match[5] && match[5] - 1
    if (skillIndex && skillIndex > damages.length)
      skillIndex = damages.length - 1
    else if (skillIndex < 0)
      skillIndex = 0
    const sub_differences = calc.calc_sub_differences(damages[skillIndex]?.skill)
    if (skillIndex === '') {
      const _s_ = sub_differences[0]?.[0].damage.skill
      skillIndex = ((_s_ && damages.findIndex(({ skill }) => skill.name === _s_.name && skill.type === _s_.type) + 1) || damages.length) - 1
    }
    const damage = damages[skillIndex]
    const skill = damage.skill
    const main_differences = calc.calc_main_differences(skill)
    await parsedData.get_detail_assets()
    const finalData = {
      uid,
      charData: parsedData,
      command: `%${parsedData.name_mi18n}伤害${skillIndex + 1}`,
      damage,
      damages,
      sub_differences,
      main_differences,
      skill: {
        ...skill,
        index: skillIndex
      }
    }
    const image = await this.render('panel/damage.html', finalData, { retType: 'base64' })
    const res = await this.reply(image)
    if (res?.message_id && parsedData.role_icon)
      await redis.set(`ZZZ:PANEL:IMAGE:${res.message_id}`, parsedData.role_icon, { EX: 3600 * 3 })
  }

}
