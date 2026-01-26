import { rulePrefix } from '../lib/common.js';
import { ZZZPlugin } from '../lib/plugin.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
import { saveVoidFrontBattleData } from '../lib/db.js';
import { isGroupRankAllowed, isUserRankAllowed, addUserToGroupRank, setUidAndQQ } from '../lib/rank.js';

export class VoidFrontBattle extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]voidFrontBattle',
      dsc: 'zzz临界推演',
      event: 'message',
      priority: settings.getConfig('priority')?.voidFrontBattle ?? 70,
      rule: [
        {
          reg: `${rulePrefix}(临界推演|临界|推演)$`,
          fnc: 'voidFrontBattle',
        },
      ],
    });
    this.isGroupRankAllowed = isGroupRankAllowed;
  }
  async voidFrontBattle() {
    const { api, deviceFp } = await this.getAPI();
    await this.getPlayerInfo();

    // 请求 brief
    const voidFrontBattleAbstractInfo = await api.getFinalData('zzzVoidFrontBattleAbstractInfo', {
      deviceFp,
    }).catch(e => {
      this.reply(e.message);
      throw e;
    });
    if (!voidFrontBattleAbstractInfo?.has_detail_record) {
      return this.reply('暂无临界推演数据');
    }
    const abstractInfoBrief = voidFrontBattleAbstractInfo?.void_front_battle_abstract_info_brief;

    // 请求详细数据
    const voidFrontBattleDetail = await api.getFinalData('zzzVoidFrontBattleDetail', {
      deviceFp,
      void_front_id: abstractInfoBrief.void_front_id,
    }).catch(e => {
      this.reply(e.message);
      throw e;
    });
    
    // 持久化到文件
    const rank_type = 'VOID_FRONT_BATTLE';
    const uid = await this.getUID();
    let userRankAllowed = null;
    if (uid) {
      if (this.e?.group_id) {
        // 无论如何在当前群里面都探测到了 uid
        await addUserToGroupRank(rank_type, uid, this.e.group_id);
        const qq = (this.e.at && !this.e.atBot) ? this.e.at : this.e.user_id;
        await setUidAndQQ(this.e.group_id, uid, qq);
        userRankAllowed = await isUserRankAllowed(rank_type, uid, this.e.group_id);
      }

      // 存记录的时候先不管 userRankAllowed
      if (this.isGroupRankAllowed()) {
        saveVoidFrontBattleData(uid, {
          player: this.e.playerCard,
          result: voidFrontBattleDetail
        });
      }
    }
    const voidFrontBattle = processVoidFrontBattleData(voidFrontBattleDetail);
    const finalData = {
      voidFrontBattle,
      userRankAllowed
    };
    await this.render('voidFrontBattle/index.html', finalData, this);
  }
}

function processVoidFrontBattleData(voidFrontBattleDetail)  {
  const rankPercent = voidFrontBattleDetail.void_front_battle_abstract_info_brief.rank_percent / 100;
  if (rankPercent < 1) {
    voidFrontBattleDetail.rankBg = 1;
  } else if (rankPercent < 5) {
    voidFrontBattleDetail.rankBg = 2; 
  } else if (rankPercent < 10) {
    voidFrontBattleDetail.rankBg = 3;
  } else if (rankPercent < 50) {
    voidFrontBattleDetail.rankBg = 4;
  } else {
    voidFrontBattleDetail.rankBg = 5;
  }
  voidFrontBattleDetail.formatTime = function (time) {
    const pad = (num) => num.toString().padStart(2, '0');
    return `${time.year}-${pad(time.month)}-${pad(time.day)} ${pad(time.hour)}:${pad(time.minute)}:${pad(time.second)}`;
  };
  voidFrontBattleDetail.formatTimestamp = function (timestamp) {
    const date = new Date(timestamp * 1000);
    const pad = (num) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };
  voidFrontBattleDetail.void_front_battle_abstract_info_brief.formatted_end_time = voidFrontBattleDetail.formatTimestamp(voidFrontBattleDetail.void_front_battle_abstract_info_brief.end_ts);
  voidFrontBattleDetail.boss_challenge_record.main_challenge_record.formatted_challenge_time = voidFrontBattleDetail.formatTime(voidFrontBattleDetail.boss_challenge_record.main_challenge_record.challenge_time);
  voidFrontBattleDetail.main_challenge_record_list.forEach(record => {
    record.formatted_challenge_time = voidFrontBattleDetail.formatTime(record.challenge_time);
  });
  return voidFrontBattleDetail;
}