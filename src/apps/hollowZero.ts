import type { Mys } from "#interface"
import { rulePrefix } from "../lib/common.js"
import { ZZZPlugin } from "../lib/plugin.js"
import settings from "../lib/settings.js"

export class HollowZero extends ZZZPlugin {
    constructor() {
        super({
            name: "[ZZZ-Plugin]hollowZero",
            dsc: "zzz零号空洞",
            event: "message",
            priority: settings.getConfig("priority")?.hollowZero ?? 70,
            rule: [
                {
                    reg: `${rulePrefix}(零号空洞|零号|空洞)$`,
                    fnc: "hollowZeroHelp",
                },
                {
                    reg: `${rulePrefix}(迷失之地|迷失)$`,
                    fnc: "hollowZeroS2",
                },
            ],
        })
    }

    /**
     * 格式化时间（秒）为 HH:MM:SS 格式
     */
    formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    async hollowZeroHelp() {
        const help_msg = [
            '当前可供查询的零号空洞数据有：',
            '- %枯萎苗圃',
            '- %迷失之地',
        ]
        this.reply(help_msg.join('\n'))
    }

    async hollowZeroS2() {
        const { api, deviceFp } = await this.getAPI()
        await this.getPlayerInfo()

        const hollowZeroDetail = await api
            .getFinalData("zzzHollowZeroS2", {
                deviceFp,
            })
            .catch((e: Error) => {
                this.reply(e.message)
                throw e
            })
        if (!hollowZeroDetail) {
            return this.reply("暂无零号空洞：迷失之地数据")
        }

        // 为包含best_time的对象添加formatted_best_time字段
        if (hollowZeroDetail.abyss_max) {
            hollowZeroDetail.abyss_max.formatted_best_time = this.formatTime(hollowZeroDetail.abyss_max.best_time)
        }
        if (hollowZeroDetail.abyss_task_force_investigation_max) {
            hollowZeroDetail.abyss_task_force_investigation_max.formatted_best_time = this.formatTime(hollowZeroDetail.abyss_task_force_investigation_max.best_time)
        }
        if (hollowZeroDetail.special_mission) {
            hollowZeroDetail.special_mission.formatted_best_time = this.formatTime(hollowZeroDetail.special_mission.best_time)
        }

        const finalData = {
            hollowZero: hollowZeroDetail,
        }
        await this.render("hollowZero/hollowZeroS2/index.html", finalData, this)
    }
}
