import { anaylizeGachaLog, updateGachaLog, updateGachaLog_ck } from '../lib/gacha.js'
import { getZZZGachaLink, getZZZGachaLogByAuthkey, parseGachaLink } from '../lib/gacha/core.js'
import { gacha_type_meta_data, type GachaType } from '../lib/gacha/const.js'
import common from '../../../../lib/common/common.js'
import { getAuthKey } from '../lib/authkey.js'
import { getRecallMsg, rulePrefix } from '../lib/common.js'
import { ZZZPlugin } from '../lib/plugin.js'
import settings from '../lib/settings.js'
import _ from 'lodash'

export class GachaLog extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]GachaLog',
      dsc: 'zzzGachaLog',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'gachalog', 70),
      rule: [
        {
          reg: `^${rulePrefix}抽卡帮助$`,
          fnc: 'gachaHelp'
        },
        {
          reg: `${rulePrefix}抽卡链接$`,
          fnc: 'startGachaLog'
        },
        {
          reg: `${rulePrefix}(刷新|更新)抽卡(链接|记录)?$`,
          fnc: 'refreshGachaLog'
        },
        {
          reg: `^${rulePrefix}抽卡(分析|记录|统计)$`,
          fnc: 'gachaLogAnalysis'
        },
        {
          reg: `^${rulePrefix}获取抽卡链接$`,
          fnc: 'getGachaLink'
        }
      ]
    })
  }

  async gachaHelp() {
    const reply_msg = [
      'ZZZ-Plugin 抽卡链接绑定方法：',
      '一、（不推荐）抓包获取',
      '1. 私聊 bot 发送【#zzz抽卡链接】，等待 bot 回复【请发送抽卡链接】',
      '2. 抓包获取抽卡链接',
      '3. 将获取到的抽卡链接发送给 bot',
      '二、通过 Cookie 直接刷新抽卡记录',
      '1. 绑定当前绝区零 UID 对应的有效 Cookie',
      '2. 发送【#zzz刷新抽卡记录】，不需要抽卡链接或 Stoken',
      '如需导出链接，请私聊发送【#zzz获取抽卡链接】。国服需要 Stoken 和逍遥插件，国际服需要含 CookieToken 的 HoYoLAB Cookie。',
      '更新记录后，可以发送【#zzz抽卡分析】查看结果'
    ].join('\n')
    await this.reply(reply_msg)
  }

  async startGachaLog() {
    const allowGroup = _.get(settings.getConfig('gacha'), 'allow_group', false)
    const whiteList = _.get(settings.getConfig('gacha'), 'white_list', []) as number[]
    const blackList = _.get(settings.getConfig('gacha'), 'black_list', []) as number[]
    if (!this.e.isPrivate) {
      const currentGroup = this.e?.group_id
      if (!currentGroup) {
        return this.reply('获取群聊ID失败，请尝试私聊发送抽卡链接', false, {
          at: true,
          recallMsg: getRecallMsg()
        })
      }
      if (!allowGroup) {
        if (whiteList.length <= 0 || !whiteList?.includes(currentGroup)) {
          return this.reply(
            '当前群聊未开启链接刷新抽卡记录功能，请私聊发送',
            false,
            {
              at: true,
              recallMsg: getRecallMsg()
            }
          )
        }
      } else {
        if (blackList.length > 0 && blackList?.includes(currentGroup)) {
          return this.reply(
            '当前群聊未开启链接刷新抽卡记录功能，请私聊发送',
            false,
            {
              at: true,
              recallMsg: getRecallMsg()
            }
          )
        }
      }
      await this.reply(
        '请注意，当前在群聊中发送抽卡链接，包含authkey，其他人获取authkey可能导致未知后果，请谨慎操作，请在机器人回复你获取链接成功后及时撤回抽卡链接消息。',
        false,
        { at: true, recallMsg: getRecallMsg() }
      )
    }
    this.setContext('gachaLog')
    await this.reply(
      '请发送抽卡链接，发送“取消”即可取消本次抽卡链接刷新',
      false,
      { at: true, recallMsg: getRecallMsg() }
    )
  }

  async gachaLog() {
    const msg = this.e.msg.trim()
    if (msg.includes('取消')) {
      this.finish('gachaLog')
      return this.reply('已取消', false, { at: true, recallMsg: getRecallMsg() })
    }
    this.finish('gachaLog')
    const link = parseGachaLink(msg)
    if (!link) {
      return this.reply('抽卡链接格式错误，请重新发起%抽卡链接并发送完整链接（含 authkey、region 和 game_biz）', false, {
        at: true,
        recallMsg: getRecallMsg()
      })
    }
    try {
      return await this.getLogWithOutUID(link.key, link.region, link.gameBiz)
    } catch (error) {
      return this.reply(error instanceof Error ? error.message : '更新抽卡记录失败，请稍后重试', false, {
        at: true,
        recallMsg: getRecallMsg()
      })
    }
  }

  async refreshGachaLog() {
    try {
      const { api, uid, deviceFp } = await this.getAPI()
      await this.reply('抽卡记录获取中请稍等...可能需要一段时间，请耐心等待')
      const { data, count } = await updateGachaLog_ck(api, uid, deviceFp)
      const msg: string[] = []
      msg.push(`抽卡记录更新成功，共${Object.keys(data).length}个卡池`)
      for (const name in data) {
        msg.push(
          `${name}新增${count[name as GachaType] || 0}条记录，一共${data[name as GachaType].length}条记录`
        )
      }
      return this.reply(
        await common.makeForwardMsg(this.e, msg, '抽卡记录更新成功')
      )
    } catch (error: any) {
      await this.reply(error.message)
    }
  }

  async getLog(key: string) {
    const uid = await this.getUID()
    if (!uid) return false
    this.reply('抽卡记录获取中请稍等...可能需要一段时间，请耐心等待')
    const { data, count } = await updateGachaLog(key, uid)
    const msg: string[] = []
    msg.push(`抽卡记录更新成功，共${Object.keys(data).length}个卡池`)
    for (const name in data) {
      msg.push(
        `${name}新增${count[name as GachaType] || 0}条记录，一共${data[name as GachaType].length}条记录`
      )
    }
    return this.reply(
      await common.makeForwardMsg(this.e, msg, '抽卡记录更新成功')
    )
  }

  async getLogWithOutUID(key: string, region?: string, game_biz?: string) {
    await this.reply(
      '抽卡链接解析成功，正在查询抽卡记录，可能耗费一段时间，请勿重复发送',
      false,
      { at: true, recallMsg: getRecallMsg() }
    )
    let uid: string | undefined
    queryLabel: for (const name in gacha_type_meta_data) {
      for (const type of gacha_type_meta_data[name as GachaType]) {
        const log = await getZZZGachaLogByAuthkey(
          key,
          type,
          type[0],
          1,
          '0',
          region,
          game_biz
        )
        if (log && log.list && log.list.length > 0) {
          uid = log.list[0].uid
          break queryLabel
        }
      }
    }
    if (!uid) {
      return this.reply('未查询到uid，请检查链接是否正确', false, {
        at: true,
        recallMsg: getRecallMsg()
      })
    }
    const { data, count } = await updateGachaLog(key, uid, region, game_biz)
    const msg: string[] = []
    msg.push(`抽卡记录更新成功，共${Object.keys(data).length}个卡池`)
    for (const name in data) {
      msg.push(
        `${name}新增${count[name as GachaType] || 0}条记录，一共${data[name as GachaType].length}条记录`
      )
    }
    return this.reply(
      await common.makeForwardMsg(this.e, msg, '抽卡记录更新成功')
    )
  }

  async gachaLogAnalysis() {
    const uid = await this.getUID()
    if (!uid) return false
    await this.getPlayerInfo()
    await this.reply('正在分析抽卡记录，请稍等', false, {
      at: true,
      recallMsg: getRecallMsg()
    })
    const data = await anaylizeGachaLog(uid)
    if (!data) {
      return this.reply(
        '未查询到抽卡记录，请先发送抽卡链接或%更新抽卡记录',
        false,
        {
          at: true,
          recallMsg: getRecallMsg()
        }
      )
    }
    const result = {
      data
    }
    await this.render('gachalog/index.html', result)
  }

  async getGachaLink() {
    if (!this.e.isPrivate || this.e.isGroup || this.e.isGuild) {
      return this.reply('请私聊获取抽卡链接', false, { at: true })
    }
    if (this.e.at && String(this.e.at) !== String(this.e.user_id)) {
      return this.reply('只能获取自己绑定账号的抽卡链接')
    }
    const uid = await this.getUID()
    if (!uid) return false

    let link: string
    try {
      const { authKey, region, gameBiz } = await getAuthKey(this.e, this.User, uid)
      link = await getZZZGachaLink(authKey, '2001', '2', 1, '0', region, gameBiz)
    } catch (error) {
      return this.reply(error instanceof Error ? error.message : '获取抽卡链接失败，请稍后重试')
    }
    await this.reply(link)
  }

}
