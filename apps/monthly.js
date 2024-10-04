import { ZZZPlugin } from '../lib/plugin.js';
import { Monthly } from '../model/monthly.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
import { rulePrefix } from '../lib/common.js';
import { getMonthly, getMonthlyCollect } from '../lib/monthly.js';

export class Note extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Monthly',
      dsc: 'zzz monthly',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'monthly', 70),
      rule: [
        {
          reg: `${rulePrefix}(monthly|菲林|邦布券|收入|月报)((\\d{4})年)?((\\d{1,2}|上)月)?$`,
          fnc: 'monthly',
        },
        {
          reg: `${rulePrefix}(monthly|菲林|邦布券|收入|月报)统计$`,
          fnc: 'monthlyCollect',
        },
      ],
    });
  }
  async monthly() {
    const reg = new RegExp(
      `(monthly|菲林|邦布券|收入|月报)((\\d{4})年)?((\\d{1,2}|上)月)?$`
    );
    const match = this.e.msg.match(reg);
    if (!match) {
      await this.reply('参数错误，请检查输入');
      return false;
    }
    let year = match[3];
    let month = match[5];
    const { api } = await this.getAPI();
    await this.getPlayerInfo();
    const monthlyResponse = await getMonthly(
      api,
      this.getDateString(year, month)
    ).catch(e => {
      this.reply(e.message);
      throw e;
    });
    if (!monthlyResponse) {
      await this.reply('获取月报数据失败，请检查日期是否正确');
      return false;
    }
    if (!monthlyResponse?.month_data) {
      await this.reply('月报数据为空');
      return false;
    }
    const monthlyData = new Monthly(monthlyResponse);
    const finalData = {
      monthly: monthlyData,
    };
    await this.render('monthly/index.html', finalData);
  }

  async monthlyCollect() {
    const { api } = await this.getAPI();
    await this.getPlayerInfo();
    const collect = await getMonthlyCollect(api).catch(e => {
      this.reply(e.message);
      throw e;
    });

    if (!collect) {
      await this.reply('获取月报数据失败');
      return false;
    }

    const collectData = collect.map(item => new Monthly(item));

    const start = collectData[collectData.length - 1]?.query_full_date;

    const end = collectData[0]?.query_full_date;

    const total = {
      poly: collectData.reduce(
        (acc, cur) => acc + cur.month_data.overview.poly,
        0
      ),
      tape: collectData.reduce(
        (acc, cur) => acc + cur.month_data.overview.tape,
        0
      ),
      boopon: collectData.reduce(
        (acc, cur) => acc + cur.month_data.overview.boopon,
        0
      ),
    };

    const finalData = {
      collect: collectData,
      range: `${start}～${end}`,
      total,
    };

    await this.render('monthly/collect.html', finalData);
  }

  getDateString(year, month) {
    let _year = +year,
      _month = +month;
    if (!_month) {
      return '';
    }
    const currentTime = new Date();
    const currentYear = currentTime.getFullYear();
    const current_month = currentTime.getMonth() + 1;
    if (!_year || _year < 2023) {
      _year = currentYear;
    }
    if (_month === '上') {
      _month = current_month - 1;
      if (_month === 0) {
        _month = 12;
        _year--;
      }
    }
    const queryTime = new Date(`${_year}/${_month}/1`);
    if (queryTime > currentTime) {
      return '';
    }
    _month = _month < 10 ? `0${_month}` : `${_month}`;

    return `${_year}${_month}`;
  }
}
