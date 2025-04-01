import { getMapData } from '../utils/file.js';
import { charNameToID } from './convert/char.js';
import { nameToId } from './convert/property.js';

/** @type {{ [propID: string]: number }} */
export const baseValueData = getMapData('EquipBaseValue');
const equipScore = getMapData('EquipScore');
/** @type {{ [charID: string]: { [propID: string]: number } }} */
export const scoreWeight = {};

/**
 * 将权重数据格式化为ID格式权重数据并处理小词条
 * @returns {{ [propID: string]: number }}
 */
export function formatScoreWeight(oriScoreWeight) {
  if (!oriScoreWeight) return false;
  if (typeof oriScoreWeight !== 'object') return false;
  const weight = {};
  for (const propName in oriScoreWeight) {
    if (!oriScoreWeight[propName])
      continue;
    const propID = +propName || nameToId(propName);
    if (!propID)
      continue;
    weight[propID] = oriScoreWeight[propName];
  };
  /** 小生命、小攻击、小防御映射为大生命、大攻击、大防御的1/3 */
  for (const [small, big] of [[11103, 11102], [12103, 12102], [13103, 13102]]) {
    if (weight[big]) {
      weight[small] ??= weight[big] / 3;
    };
  };
  return weight;
}

for (const charName in equipScore) {
  // 兼容原ID格式
  const charID = +charName || charNameToID(charName);
  if (!charID)
    continue;
  scoreWeight[charID] = formatScoreWeight(equipScore[charName]);
};

/**
 * 获取词条强化次数
 * @param {string} propertyID 属性id
 * @param {string} value 属性值
 * @returns {number}
 */
export const getEquipPropertyEnhanceCount = (propertyID, value) => {
  const baseValue = baseValueData[propertyID];
  value = +value.replace('%', '');
  return value / baseValue - 1 || 0;
};
