import version from '../../lib/version.js';
import { ZZZUpdate } from '../../lib/update.js';
import { pluginName } from '../../lib/path.js';
import settings from '../../lib/settings.js';
export async function getChangeLog(e) {
    const versionData = version.changelogs;
    await this.render('help/version.html', {
        versionData
    });
    return false;
}
export async function getCommitLog(e) {
    e ||= this.e;
    if (!ZZZUpdate)
        return false;
    const updatePlugin = new ZZZUpdate();
    updatePlugin.e = e;
    updatePlugin.reply = e.reply;
    if (updatePlugin.getPlugin(pluginName)) {
        try {
            const commitData = await updatePlugin.getZZZAllLog();
            await this.render('help/commit.html', {
                commitData
            });
        }
        catch (error) {
            e.reply(`[${pluginName}]获取更新日志失败\n${error.message}`, false, {
                at: true,
                recallMsg: 100
            });
        }
    }
    return true;
}
export async function hasUpdate(e) {
    e ||= this.e;
    if (!ZZZUpdate)
        return false;
    const updatePlugin = new ZZZUpdate();
    updatePlugin.e = e;
    updatePlugin.reply = e.reply;
    if (updatePlugin.getPlugin(pluginName)) {
        const result = await updatePlugin.hasUpdate();
        if (result.hasUpdate) {
            await e.reply(`[${pluginName}]有${result.logs.length || 1}个更新`);
            await this.render('help/commit.html', {
                commitData: result.logs
            });
        }
        else {
            await e.reply(`[${pluginName}]已是最新`);
        }
    }
    return true;
}
export async function enableAutoUpdatePush(e) {
    e ||= this.e;
    if (!e.isMaster) {
        return e.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    }
    let enable = true;
    if (e.msg.includes('关闭')) {
        enable = false;
    }
    settings.setSingleConfig('config', 'update', { autoCheck: enable });
    await e.reply(`[${pluginName}]自动更新推送${enable ? '已开启' : '已关闭'}`, false, { at: true, recallMsg: 100 });
}
export async function setCheckUpdateCron(e) {
    e ||= this.e;
    if (!e.isMaster) {
        return e.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    }
    const cron = e.msg.split('时间')[1];
    if (!cron) {
        return e.reply(`[${pluginName}]设置自动更新频率失败，无cron表达式`, false, {
            at: true,
            recallMsg: 100
        });
    }
    settings.setSingleConfig('config', 'update', { cron });
    await e.reply(`[${pluginName}]自动更新频率已设置为${cron}`, false, {
        at: true,
        recallMsg: 100
    });
}
