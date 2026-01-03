import { rulePrefix } from '../lib/common.js';
import { ZZZPlugin } from '../lib/plugin.js';
import settings from '../lib/settings.js';

export class Abyss extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]abyss',
      dsc: 'zzz式舆防卫战',
      event: 'message',
      priority: settings.getConfig('priority')?.abyss ?? 70,
      rule: [
        {
          reg: `${rulePrefix}(上期|往期)?(式舆防卫战|式舆|深渊|防卫战|防卫)$`,
          fnc: 'abyss',
        },
      ],
    });
  }
  async abyss() {
    const { api, deviceFp } = await this.getAPI();
    await this.getPlayerInfo();
    const method = this.e.msg.match(`(上期|往期)`)
      ? 'zzzChallengePeriod'
      : 'zzzChallenge';
    const abyssData = await api.getFinalData(method, {
      deviceFp,
    }).catch(e => {
      this.reply(e.message);
      throw e;
    });
    if (abyssData?.hadal_ver !== "v2") {
      return this.reply('式舆防卫战数据不是最新版本，可能为之前的深渊');
    }
    const data = abyssData?.hadal_info_v2;
    if (['fitfh', 'fourth', 'third', 'second', 'first'].every(layer => !data?.[`${layer}_layer_detail`])) {
      return this.reply('式舆防卫战数据为空');
    }
    const abyss = processAbyssData(data);
    const finalData = {
      abyss,
    };
    await this.render('abyss/index.html', finalData, this);
  }
}

function processAbyssData(abyss) {
  const rankPercent = abyss.brief.rank_percent / 100;
  if (rankPercent < 1) {
    abyss.rankBg = 1;
  } else if (rankPercent < 5) {
    abyss.rankBg = 2;
  } else if (rankPercent < 10) {
    abyss.rankBg = 3;
  } else if (rankPercent < 50) {
    abyss.rankBg = 4;
  } else {
    abyss.rankBg = 5;
  }
  abyss.formatTime = function (time) {
    const pad = (num) => num.toString().padStart(2, '0');
    return `${time.year}-${pad(time.month)}-${pad(time.day)} ${pad(time.hour)}:${pad(time.minute)}:${pad(time.second)}`;
  };
  abyss.formatBattleTime = function (seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  return abyss;
}