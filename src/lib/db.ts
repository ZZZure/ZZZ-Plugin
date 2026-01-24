import type { ZZZ } from '#interface'
import {
  getDB,
  setDB,
  removeDB,
  removeAllDB
} from './db/core.js'

/**
 * @param uid
 */
export function getGachaLog(uid: string) {
  return getDB('gacha', uid)
}

/**
 * @param uid
 * @param data
 */
export function saveGachaLog(uid: string, data: ZZZ.DBMap['gacha']) {
  setDB('gacha', uid, data)
}

/**
 * @param uid
 */
export function getPanelData(uid: string) {
  return getDB('panel', uid) || []
}

/**
 * @param uid
 * @param data
 */
export function savePanelData(uid: string, data: ZZZ.DBMap['panel']) {
  setDB('panel', uid, data)
}

/**
 * @param uid
 * @param data
 */
export function saveAbyssData(uid: string, data: ZZZ.DBMap['abyss']) {
  setDB('abyss', uid, data)
}

/**
 * @param uid
 */
export function getAbyssData(uid: string) {
  return getDB('abyss', uid)
}

/**
 * @param uid
 */
export function removeAbyssData(uid: string) {
  return removeDB('abyss', uid)
}

/**
 * @param uids
 */
export function getAbyssDataInGroupRank(uids: string[]) {
  return uids.map(uid => getAbyssData(uid)).filter((item): item is ZZZ.DBMap['abyss'] => item !== null)
}

export function removeAllAbyssData(): boolean {
  return removeAllDB('abyss')
}

export function saveDeadlyData(uid: string, data: ZZZ.DBMap['deadly']) {
  setDB('deadly', uid, data)
}

export function getDeadlyData(uid: string) {
  return getDB('deadly', uid)
}

export function removeDeadlyData(uid: string) {
  return removeDB('deadly', uid)
}

export function getDeadlyDataInGroupRank(uids: string[]) {
  return uids.map(uid => getDeadlyData(uid)).filter((item): item is ZZZ.DBMap['deadly'] => item !== null)
}

export function removeAllDeadlyData(): boolean {
  return removeAllDB('deadly')
}

/**
 * @param uid
 */
export function getMonthlyData(uid: string) {
  return getDB('monthly', uid) || []
}

/**
 * @param uid
 * @param data
 */
export function saveMonthlyData(uid: string, data: ZZZ.DBMap['monthly']) {
  setDB('monthly', uid, data)
}