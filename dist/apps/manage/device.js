import settings from '../../lib/settings.js';
export async function setDefaultDevice(e) {
    e ||= this.e;
    if (!e.isMaster) {
        return e.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    }
    this.setContext('toSetDefaultDevice');
    await e.reply('请发送默认设备信息，或者发送“取消”取消设置默认设备信息', false, { at: true, recallMsg: 100 });
}
export async function toSetDefaultDevice(e) {
    e = this.e;
    const msg = e.msg.trim();
    if (!msg) {
        return e.reply('请发送设备信息', false, { at: true, recallMsg: 100 });
    }
    if (msg.includes('取消')) {
        this.finish('toSetDefaultDevice');
        return e.reply('已取消', false, { at: true, recallMsg: 100 });
    }
    try {
        const info = JSON.parse(msg);
        if (!info) {
            return e.reply('设备信息格式错误', false, { at: true, recallMsg: 100 });
        }
        if (!info?.deviceName ||
            !info?.deviceBoard ||
            !info?.deviceModel ||
            !info?.androidVersion ||
            !info?.deviceFingerprint ||
            !info?.deviceProduct) {
            return e.reply('设备信息格式错误', false, { at: true, recallMsg: 100 });
        }
        settings.setConfig('device', {
            productName: info.deviceProduct,
            productType: info.deviceName,
            modelName: info.deviceModel,
            osVersion: info.androidVersion,
            deviceInfo: info.deviceFingerprint,
            board: info.deviceBoard
        });
        e.reply('默认设备信息设置成功', false, { at: true, recallMsg: 100 });
    }
    catch (error) {
        e.reply('设备信息格式错误', false, { at: true, recallMsg: 100 });
    }
    finally {
        this.finish('toSetDefaultDevice');
    }
}
//# sourceMappingURL=device.js.map