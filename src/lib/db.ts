import { getDB, setDB } from './db/core.js'

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
export function saveGachaLog(uid: string, data: any) {
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
export function savePanelData(uid: string, data: any) {
  setDB('panel', uid, data)
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
export function saveMonthlyData(uid: string, data: any) {
  setDB('monthly', uid, data)
}
