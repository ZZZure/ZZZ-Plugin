import { char } from '../../lib/convert.js';
import settings from '../../lib/settings.js';
export async function addAlias(e) {
    e ||= this.e;
    if (!e.isMaster) {
        return e.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    }
    const match = /添加(\S+)别名(\S+)$/.exec(e.msg);
    if (!match)
        return false;
    const [, key, value] = match;
    const oriName = char.aliasToName(key);
    const isExist = char.aliasToName(value);
    if (!oriName) {
        await e.reply(`未找到 ${value} 的对应角色`, false, {
            at: true,
            recallMsg: 100
        });
        return;
    }
    if (isExist) {
        await e.reply(`别名 ${value} 已存在`, false, {
            at: true,
            recallMsg: 100
        });
        return;
    }
    settings.addArrayleConfig('alias', oriName, value);
    await e.reply(`角色 ${key} 别名 ${value} 成功`, false, {
        at: true,
        recallMsg: 100
    });
}
export async function deleteAlias(e) {
    e ||= this.e;
    if (!e.isMaster) {
        return e.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    }
    const match = /删除别名(\S+)$/.exec(e.msg);
    if (!match)
        return false;
    const [, key] = match;
    const oriName = char.aliasToName(key);
    if (!oriName) {
        await e.reply(`未找到 ${key} 的对应角色`, false, {
            at: true,
            recallMsg: 100
        });
        return;
    }
    if (key === oriName) {
        await e.reply(`别名 ${key} 为角色本名，无法删除`, false, {
            at: true,
            recallMsg: 100
        });
        return;
    }
    settings.removeArrayleConfig('alias', oriName, key);
    await e.reply(`角色 ${key} 别名删除成功`, false, {
        at: true,
        recallMsg: 100
    });
}
//# sourceMappingURL=alias.js.map