import settings from './settings.js';
export class PanelButtons {
    enabled;
    userId;
    constructor(e) {
        const bot = e.bot;
        this.userId = e.user_id == null ? '' : String(e.user_id);
        const isGuild = e.isGuild || this.userId.startsWith('qg_') ||
            String(e.group_id ?? '').startsWith('qg_');
        this.enabled = !!settings.getConfig('panel')?.buttons &&
            bot?.adapter?.id === 'QQBot' && !isGuild && !e.at && !!this.userId &&
            typeof segment !== 'undefined' && typeof segment.button === 'function';
    }
    button(text, command, prefix = '#zzz') {
        return {
            text,
            input: `${prefix}${command}`,
            send: true,
            permission: this.userId
        };
    }
    make(rows) {
        if (!this.enabled)
            return;
        return segment.button?.(...rows);
    }
    detail(name) {
        if (!name || /[\r\n]/.test(name))
            return;
        return this.make([
            [this.button('面板列表', '面板列表'), this.button('练度统计', '练度统计')],
            [this.button('角色攻略', `${name}攻略`, '#绝区零'), this.button('更新面板', '更新面板')]
        ]);
    }
    list(characters, refreshed = false) {
        if (!this.enabled)
            return;
        const rows = [[
                refreshed ? this.button('面板列表', '面板列表') : this.button('更新面板', '更新面板'),
                this.button('更新展柜面板', '更新展柜面板')
            ]];
        const names = new Set();
        for (const character of characters) {
            const name = character.name_mi18n?.trim();
            if (!name || /[\r\n]/.test(name) || names.has(name))
                continue;
            if (names.size === 8)
                break;
            if (names.size % 2 === 0)
                rows.push([]);
            rows[rows.length - 1].push(this.button(`${name}面板`, `${name}面板`));
            names.add(name);
        }
        return this.make(rows);
    }
}
export function appendPanelButtons(image, buttons) {
    return image && buttons ? [image, buttons] : image;
}
//# sourceMappingURL=panelButtons.js.map