import { rulePrefix } from "../lib/common.js";
import { ZZZPlugin } from "../lib/plugin.js";
import settings from "../lib/settings.js";
export class ExplorationDetail extends ZZZPlugin {
    constructor() {
        super({
            name: "[ZZZ-Plugin]explorationDetail",
            dsc: "zzz区域收集",
            event: "message",
            priority: settings.getConfig("priority")?.explorationDetail ?? 70,
            rule: [
                {
                    reg: `${rulePrefix}(区域收集|收集|探索|探索度)$`,
                    fnc: "explorationDetail",
                },
            ],
        });
    }
    async explorationDetail() {
        const { api, deviceFp } = await this.getAPI();
        await this.getPlayerInfo();
        const explorationDetail = await api
            .getFinalData("zzzExplorationDetail", {
            deviceFp,
        })
            .catch((e) => {
            this.reply(e.message);
            throw e;
        });
        if (!explorationDetail) {
            return this.reply("暂无探索详情数据");
        }
        const finalData = {
            explorationDetail,
        };
        await this.render("explorationDetail/index.html", finalData, this);
    }
}
//# sourceMappingURL=explorationDetail.js.map