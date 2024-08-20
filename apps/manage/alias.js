import { char } from '../../lib/convert.js';
import settings from '../../lib/settings.js';

export async function addAlias() {
  if (!this.e.isMaster) {
    this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    return false;
  }
  const match = /添加(\S+)别名(\S+)$/g.exec(this.e.msg);
  const key = match[1];
  const value = match[2];
  const oriName = char.aliasToName(key);
  const isExist = char.aliasToName(value);
  if (!oriName) {
    await this.e.reply(`未找到 ${value} 的对应角色`, false, {
      at: true,
      recallMsg: 100,
    });
    return;
  }
  if (isExist) {
    await this.e.reply(`别名 ${value} 已存在`, false, {
      at: true,
      recallMsg: 100,
    });
    return;
  }
  settings.addArrayleConfig('alias', oriName, value);
  await this.e.reply(`角色 ${key} 别名 ${value} 成功`, false, {
    at: true,
    recallMsg: 100,
  });
}

export async function deleteAlias() {
  if (!this.e.isMaster) {
    this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    return false;
  }
  const match = /删除别名(\S+)$/g.exec(this.e.msg);
  const key = match[1];
  const oriName = char.aliasToName(key);
  if (!oriName) {
    await this.e.reply(`未找到 ${key} 的对应角色`, false, {
      at: true,
      recallMsg: 100,
    });
    return;
  }
  if (key === oriName) {
    await this.e.reply(`别名 ${key} 为角色本名，无法删除`, false, {
      at: true,
      recallMsg: 100,
    });
    return;
  }
  settings.removeArrayleConfig('alias', oriName, key);
  await this.e.reply(`角色 ${key} 别名删除成功`, false, {
    at: true,
    recallMsg: 100,
  });
}
