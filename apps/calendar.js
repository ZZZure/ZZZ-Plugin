import { ZZZPlugin } from '../lib/plugin.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
import { rulePrefix } from '../lib/common.js';
import request from '../utils/request.js';

export class Calendar extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Calendar',
      dsc: 'zzzCalendar',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'calendar', 70),
      rule: [
        {
          reg: `${rulePrefix}(cal|日历)$`,
          fnc: 'calendar',
        },
      ],
    });
  }
  async calendar() {
    const activityList = await request
      .get(
        'https://announcement-api.mihoyo.com/common/nap_cn/announcement/api/getAnnList?game=nap&game_biz=nap_cn&lang=zh-cn&bundle_id=nap_cn&channel_id=1&level=70&platform=pc&region=prod_gf_cn&uid=12345678'
      )
      .then(res => res.json());
    if (!activityList?.data) {
      await this.reply('获取活动列表失败');
      return false;
    }
    const t = activityList?.data?.t || new Date().getTime().toString();
    const activityContent = await request
      .get(
        `https://announcement-static.mihoyo.com/common/nap_cn/announcement/api/getAnnContent?game=nap&game_biz=nap_cn&lang=zh-cn&bundle_id=nap_cn&platform=pc&region=prod_gf_cn&t=${t}&level=70&channel_id=1`
      )
      .then(res => res.json());
    const contentList = activityContent?.data?.list || [];
    const calendarContent = contentList.find(
      item => item.title.includes('日历') && item.subtitle.includes('活动日历')
    );

    const htmlContent = calendarContent?.content || '';
    if (!htmlContent) {
      await this.reply('未找到活动日历');
      return false;
    }
    const imgReg = /<img.*?src="(.*?)".*?>/g;
    const imgSrc = imgReg.exec(htmlContent)?.[1];
    if (imgSrc) {
      await this.reply(segment.image(imgSrc));
    } else {
      await this.reply('未找到活动日历图片');
    }
    return false;
  }
}
