import { rulePrefix } from "../lib/common.js";
import { ZZZPlugin } from "../lib/plugin.js";
import settings from "../lib/settings.js";
import { saveVoidFrontBattleData } from "../lib/db.js";
import { isGroupRankAllowed, isUserRankAllowed, addUserToGroupRank, setUidAndQQ, } from "../lib/rank.js";
export class VoidFrontBattle extends ZZZPlugin {
    isGroupRankAllowed;
    constructor() {
        super({
            name: "[ZZZ-Plugin]voidFrontBattle",
            dsc: "zzz临界推演",
            event: "message",
            priority: settings.getConfig("priority")?.voidFrontBattle ?? 70,
            rule: [
                {
                    reg: `${rulePrefix}(上期|往期)?(临界推演|临界|推演)$`,
                    fnc: "voidFrontBattle",
                },
            ],
        });
        this.isGroupRankAllowed = isGroupRankAllowed;
    }
    async voidFrontBattle() {
        const { api, deviceFp } = await this.getAPI();
        await this.getPlayerInfo();
        const isPeriod = this.e.msg.match(`(上期|往期)`);
        const method = isPeriod ? 'zzzVoidFrontBattlePeriod' : 'zzzVoidFrontBattle';
        const voidFrontBattleDetail = await api
            .getFinalData(method, {
            deviceFp,
        })
            .catch((e) => {
            this.reply(e.message);
            throw e;
        });
        if (!voidFrontBattleDetail?.void_front_battle_detail) {
            return this.reply("暂无临界推演数据");
        }
        const rank_type = "VOID_FRONT_BATTLE";
        const uid = await this.getUID();
        let userRankAllowed = null;
        if (!isPeriod && uid) {
            if (this.e?.group_id) {
                await addUserToGroupRank(rank_type, uid, this.e.group_id);
                const qq = this.e.at && !this.e.atBot ? this.e.at : this.e.user_id;
                await setUidAndQQ(this.e.group_id, uid, qq);
                userRankAllowed = !!(await isUserRankAllowed(rank_type, uid, this.e.group_id));
            }
            if (this.isGroupRankAllowed()) {
                saveVoidFrontBattleData(uid, {
                    player: this.e.playerCard,
                    result: voidFrontBattleDetail.void_front_battle_detail,
                });
            }
        }
        const voidFrontBattle = processVoidFrontBattleData(voidFrontBattleDetail.void_front_battle_detail);
        const finalData = {
            voidFrontBattle,
            userRankAllowed,
            isPeriod,
        };
        await this.render("voidFrontBattle/index.html", finalData, this);
    }
}
function processVoidFrontBattleData(voidFrontBattle) {
    const rankPercent = voidFrontBattle.void_front_battle_abstract_info_brief.rank_percent / 100;
    if (rankPercent < 1) {
        voidFrontBattle.rankBg = 1;
    }
    else if (rankPercent < 5) {
        voidFrontBattle.rankBg = 2;
    }
    else if (rankPercent < 10) {
        voidFrontBattle.rankBg = 3;
    }
    else if (rankPercent < 50) {
        voidFrontBattle.rankBg = 4;
    }
    else {
        voidFrontBattle.rankBg = 5;
    }
    voidFrontBattle.formatTime = function (time) {
        const pad = (num) => num.toString().padStart(2, "0");
        return `${time.year}-${pad(time.month)}-${pad(time.day)} ${pad(time.hour)}:${pad(time.minute)}:${pad(time.second)}`;
    };
    return voidFrontBattle;
}
//# sourceMappingURL=voidFrontBattle.js.map