import { rulePrefix } from "../lib/common.js";
import { ZZZPlugin } from "../lib/plugin.js";
import settings from "../lib/settings.js";
import { saveClimbingTowerData } from "../lib/db.js";
import { isGroupRankAllowed, isUserRankAllowed, addUserToGroupRank, setUidAndQQ, } from "../lib/rank.js";
export class ClimbingTower extends ZZZPlugin {
    isGroupRankAllowed;
    constructor() {
        super({
            name: "[ZZZ-Plugin]climbingTower",
            dsc: "zzz爬塔",
            event: "message",
            priority: settings.getConfig("priority")?.climbingTower ?? 70,
            rule: [
                {
                    reg: `${rulePrefix}(拟真鏖战试炼|鏖战|爬塔)$`,
                    fnc: "climbingTower",
                },
            ],
        });
        this.isGroupRankAllowed = isGroupRankAllowed;
    }
    async climbingTower() {
        const { api, deviceFp } = await this.getAPI();
        await this.getPlayerInfo();
        const climbingTowerDetail = await api
            .getFinalData("zzzClimbingTower", {
            deviceFp,
        })
            .catch((e) => {
            this.reply(e.message);
            throw e;
        });
        if (!climbingTowerDetail) {
            return this.reply("暂无爬塔数据");
        }
        const rank_types = ["CLIMBING_TOWER_S1", "CLIMBING_TOWER_S2", "CLIMBING_TOWER_S3", "CLIMBING_TOWER_S4"];
        const uid = await this.getUID();
        let userRankAllowed = null;
        if (uid) {
            if (this.e?.group_id) {
                for (const rank_type of rank_types) {
                    await addUserToGroupRank(rank_type, uid, this.e.group_id);
                }
                const qq = this.e.at && !this.e.atBot ? this.e.at : this.e.user_id;
                await setUidAndQQ(this.e.group_id, uid, qq);
                let allAllowed = true;
                for (const rank_type of rank_types) {
                    const allowed = await isUserRankAllowed(rank_type, uid, this.e.group_id);
                    if (!allowed) {
                        allAllowed = false;
                        break;
                    }
                }
                userRankAllowed = allAllowed;
            }
            if (this.isGroupRankAllowed()) {
                saveClimbingTowerData(uid, {
                    player: this.e.playerCard,
                    result: climbingTowerDetail,
                });
            }
        }
        const finalData = {
            climbingTower: climbingTowerDetail,
            userRankAllowed,
        };
        await this.render("climbingTower/index.html", finalData, this);
    }
}
//# sourceMappingURL=climbingTower.js.map