export class MysError extends Error {
  /**
   * 自定义错误类
   * @param {string} code 错误码
   */
  constructor(code, uid, result) {
    let msg = '未知错误';
    switch (code) {
      case '10102':
        if (result.message === 'Data is not public for the user') {
          msg = `UID:${uid}，米游社数据未公开`;
        } else {
          msg = `UID:${uid}，请先去米游社绑定角色`;
        }
        break;
      case '10041':
      case '5003':
        msg = `UID:${uid}，米游社账号异常，暂时无法查询，请发送 %绑定设备帮助 查看如何绑定设备`;
        break;
      case '10035':
      case '1034':
        msg = `UID:${uid}，米游社查询遇到验证码`;
        break;
      default:
        if (/(登录|login)/i.test(result.message)) {
          msg = `UID:${uid}，米游社cookie已失效, 请重新绑定ck或发送#刷新ck`;
        } else {
          msg = `UID:${uid}，米游社接口报错：${result.message}`;
        }
    }
    super(msg);
    this.code = Number(code);
    this.uid = uid;
    this.result = result;
    this.name = 'MysError';
  }
}
