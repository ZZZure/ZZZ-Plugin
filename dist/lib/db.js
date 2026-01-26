import { getDB, setDB, removeDB, removeAllDB } from './db/core.js';
export function getGachaLog(uid) {
    return getDB('gacha', uid);
}
export function saveGachaLog(uid, data) {
    setDB('gacha', uid, data);
}
export function getPanelData(uid) {
    return getDB('panel', uid) || [];
}
export function savePanelData(uid, data) {
    setDB('panel', uid, data);
}
export function saveAbyssData(uid, data) {
    setDB('abyss', uid, data);
}
export function getAbyssData(uid) {
    return getDB('abyss', uid);
}
export function removeAbyssData(uid) {
    return removeDB('abyss', uid);
}
export function getAbyssDataInGroupRank(uids) {
    return uids.map(uid => getAbyssData(uid)).filter((item) => item !== null);
}
export function removeAllAbyssData() {
    return removeAllDB('abyss');
}
export function saveDeadlyData(uid, data) {
    setDB('deadly', uid, data);
}
export function getDeadlyData(uid) {
    return getDB('deadly', uid);
}
export function removeDeadlyData(uid) {
    return removeDB('deadly', uid);
}
export function getDeadlyDataInGroupRank(uids) {
    return uids.map(uid => getDeadlyData(uid)).filter((item) => item !== null);
}
export function removeAllDeadlyData() {
    return removeAllDB('deadly');
}
export function getMonthlyData(uid) {
    return getDB('monthly', uid) || [];
}
export function saveMonthlyData(uid, data) {
    setDB('monthly', uid, data);
}
