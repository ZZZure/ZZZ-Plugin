import { getDB, setDB, removeDB, removeAllDB } from './db/core.js';

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
 * @returns {import('#interface').Mys.Avatar[]}
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
 * @param {object} data
 */
export function saveAbyssData(uid, data) {
  setDB('abyss', uid, data);
}

/**
 * @param {string} uid
 * @returns {object | null}
 */
export function getAbyssData(uid) {
  return getDB('abyss', uid);
}

/**
 * @param {string} uid
 * @returns {null}
 */
export function removeAbyssData(uid) {
  return removeDB('abyss', uid);
}

/**
 * @returns {Array<object>}
 */
export function getAbyssDataInGroupRank(uids) {
  return uids.map(uid => getAbyssData(uid)).filter(item => item !== null);
}

/**
 * @returns {null}
 */
export function removeAllAbyssData() {
  return removeAllDB('abyss');
}

/**
 * @param {string} uid
 * @param {object} data
 */
export function saveDeadlyData(uid, data) {
  setDB('deadly', uid, data);
}

/**
 * @param {string} uid
 * @returns {object}
 */
export function getDeadlyData(uid) {
  return getDB('deadly', uid);
}

/**
 * @param {string} uid
 * @returns {null}
 */
export function removeDeadlyData(uid) {
  return removeDB('deadly', uid);
}

/**
 * @returns {object}
 */
export function getDeadlyDataInGroupRank(uids) {
  return uids.map(uid => getDeadlyData(uid)).filter(item => item !== null);
}

/**
 * @returns {null}
 */
export function removeAllDeadlyData() {
  return removeAllDB('deadly');
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
