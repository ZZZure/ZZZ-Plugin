import { getDB, setDB } from './db/core.js';

/**
 * @param {string} uid
 * @returns {object}
 */
export function getGachaLog(uid) {
  return getDB('gacha', uid);
}

/**
 * @param {string} uid
 * @param {object} data
 */
export function saveGachaLog(uid, data) {
  setDB('gacha', uid, data);
}

/**
 * @param {string} uid
 * @returns {Array<object>}
 */
export function getPanelData(uid) {
  return getDB('panel', uid) || [];
}

/**
 * @param {string} uid
 * @param {Array<object>} data
 */
export function savePanelData(uid, data) {
  setDB('panel', uid, data);
}

/**
 * @param {string} uid
 * @returns {Array<object>}
 */
export function getMonthlyData(uid) {
  return getDB('monthly', uid) || [];
}

/**
 * @param {string} uid
 * @param {Array<object>} data
 */
export function saveMonthlyData(uid, data) {
  setDB('monthly', uid, data);
}
