import { rulePrefix } from '../lib/common.js';
import { ZZZPlugin } from '../lib/plugin.js';
import { getCodeMsg } from '../lib/code.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
export class Code extends ZZZPlugin {
    constructor() {
        super({
            name: '[ZZZ-Plugin]Code',
            dsc: 'zzzcode',
            event: 'message',
            priority: _.get(settings.getConfig('priority'), 'code', 70),
            rule: [
                {
                    reg: `${rulePrefix}(code|兑换码)$`,
                    fnc: 'code'
                }
            ]
        });
    }
    async code() {
        const msg = await getCodeMsg();
        return this.reply(msg);
    }
}
//# sourceMappingURL=code.js.map