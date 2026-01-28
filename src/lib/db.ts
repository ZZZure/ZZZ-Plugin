import type { ZZZ } from '#interface'
import {
  getDB,
  setDB,
  removeDB,
  removeAllDB
} from './db/core.js'

/**
 * 获取抽卡记录
 */
export function getGachaLog(uid: string) {
  return getDB('gacha', uid)
}

/**
 * 保存抽卡记录
 */
export function saveGachaLog(uid: string, data: ZZZ.DBMap['gacha']) {
  setDB('gacha', uid, data)
}

/**
 * 获取面板数据
 */
export function getPanelData(uid: string) {
  return getDB('panel', uid) || []
}

/**
 * 保存面板数据
 */
export function savePanelData(uid: string, data: ZZZ.DBMap['panel']) {
  setDB('panel', uid, data)
}

/**
 * 保存深渊数据
 */
export function saveAbyssData(uid: string, data: ZZZ.DBMap['abyss']) {
  setDB('abyss', uid, data)
}

/**
 * 获取深渊数据
 */
export function getAbyssData(uid: string) {
  return getDB('abyss', uid)
}

/**
 * 删除深渊数据
 */
export function removeAbyssData(uid: string) {
  return removeDB('abyss', uid)
}

/**
 * 批量获取深渊数据
 */
export function getAbyssDataInGroupRank(uids: string[]) {
  return uids.map(uid => getAbyssData(uid)).filter((item): item is ZZZ.DBMap['abyss'] => item !== null)
}

/**
 * 删除所有深渊数据
 */
export function removeAllAbyssData(): boolean {
  return removeAllDB('abyss')
}

/**
 * 保存危局数据
 */
export function saveDeadlyData(uid: string, data: ZZZ.DBMap['deadly']) {
  setDB('deadly', uid, data)
}

/**
 * 获取危局数据
 */
export function getDeadlyData(uid: string) {
  return getDB('deadly', uid)
}

/**
 * 删除危局数据
 */
export function removeDeadlyData(uid: string) {
  return removeDB('deadly', uid)
}

/**
 * 批量获取危局数据
 */
export function getDeadlyDataInGroupRank(uids: string[]) {
  return uids.map(uid => getDeadlyData(uid)).filter((item): item is ZZZ.DBMap['deadly'] => item !== null)
}

/**
 * 删除所有危局数据
 */
export function removeAllDeadlyData(): boolean {
  return removeAllDB('deadly')
}

/**
 * 保存临界推演数据
 */
export function saveVoidFrontBattleData(uid: string, data: ZZZ.DBMap['voidFrontBattle']) {
  setDB('voidFrontBattle', uid, data);
}

/**
 * 获取临界推演数据
 */
export function getVoidFrontBattleData(uid: string) {
  return getDB('voidFrontBattle', uid);
}

/**
 * 删除临界推演数据
 */
export function removeVoidFrontBattleData(uid: string) {
  return removeDB('voidFrontBattle', uid);
}

/**
 * 批量获取临界推演数据
 */
export function getVoidFrontBattleDataInGroupRank(uids: string[]) {
  return uids.map(uid => getVoidFrontBattleData(uid)).filter((item): item is ZZZ.DBMap['voidFrontBattle'] => item !== null);
}

/**
 * 删除所有临界推演数据
 */
export function removeAllVoidFrontBattleData() {
  return removeAllDB('voidFrontBattle');
}

/**
 * 获取菲林月历数据
 */
export function getMonthlyData(uid: string) {
  return getDB('monthly', uid) || []
}

/**
 * 保存菲林月历数据
 */
export function saveMonthlyData(uid: string, data: ZZZ.DBMap['monthly']) {
  setDB('monthly', uid, data)
}