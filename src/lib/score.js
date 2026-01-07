import { getMapData } from '../utils/file.js';
import { IDToCharData } from './convert/char.js';
import { nameToId } from './convert/property.js';

/** @type {{ [propID: string]: number }} */
export const baseValueData = getMapData('EquipBaseValue');

const elementType2propId = (elementType) => [31503, 31603, 31703, 31803, , 31903][elementType - 200];

/**
 * 将权重数据格式化为ID格式权重数据
 * @returns {{ rules?: string[], [propID: string]: number }}
 */
export function formatScoreWeight(oriScoreWeight, charID) {
  if (!oriScoreWeight) return false;
  if (Array.isArray(oriScoreWeight)) return oriScoreWeight;
  if (typeof oriScoreWeight !== 'object') return false;
  const weight = {};
  for (const propName in oriScoreWeight) {
    if (!oriScoreWeight[propName] && oriScoreWeight[propName] !== 0)
      continue;
    let propID;
    if (charID && propName === '属性伤害加成') {
      propID = elementType2propId(IDToCharData(charID)?.ElementType);
    } else {
      propID = +propName || nameToId(propName);
    }
    if (!propID)
      continue;
    weight[propID] = oriScoreWeight[propName];
  };
  return weight;
}

/**
 * 获取词条强化次数
 * @param {string} propertyID 属性id
 * @param {string} value 属性值
 * @returns {number}
 */
export const getEquipPropertyEnhanceCount = (propertyID, value) => {
  const baseValue = baseValueData[propertyID];
  value = +value.replace('%', '');
  return Math.trunc(value / baseValue - 1 || 0);
};
