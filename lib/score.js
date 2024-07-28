import { getMapData } from '../utils/file.js';

const scoreData = getMapData('EquipScore');
const baseValueData = getMapData('EquipBaseValue');

/**
 * 是否有分数数据
 * @param {string} charID 角色id
 * @returns {boolean}
 */
export const hasScoreData = charID => {
  return (
    scoreData.hasOwnProperty(charID) &&
    Object.keys(scoreData[charID]).length > 0
  );
};

/**
 * 获取装备属性基准分数
 * @param {string} charID 角色id
 * @param {string} propertyID 属性id
 * @returns {number}
 */
export const getEquipPropertyBaseScore = (charID, propertyID) => {
  const score = scoreData[charID][propertyID] || 0;
  return score;
};

/**
 * 获取装备属性分数
 * @param {string} charID 角色id
 * @param {number} propertyID 属性id
 * @param {string} value 属性值
 * @returns {number}
 */
export const getEquipPropertyScore = (charID, propertyID, value) => {
  if (value.includes('%')) {
    value = value.replace('%', '');
  }
  value = Number(value);
  propertyID = String(propertyID);
  const baseScore = getEquipPropertyBaseScore(charID, propertyID);
  let finalScore = baseScore * value;
  switch (propertyID) {
    // 小生命
    case '11103':
      finalScore = value * 0.043 * baseScore * 1;
      break;
    // 大生命
    case '11102':
      finalScore = value * 1.6 * baseScore * 1;
      break;
    // 小攻击
    case '12103':
      finalScore = value * 0.25 * baseScore * 1;
      break;
    // 大攻击
    case '12102':
      finalScore = value * 1.6 * baseScore * 1;
      break;
    // 小防御
    case '13103':
      finalScore = value * 0.32 * baseScore * 1;
      break;
    // 大防御
    case '13102':
      finalScore = value * 1 * baseScore * 1;
      break;
    // 暴击
    case '20103':
      finalScore = value * 2 * baseScore * 1;
      break;
    // 暴击伤害
    case '21103':
      finalScore = value * 1 * baseScore * 1;
      break;
    // 穿透值
    case '23203':
      finalScore = value * 0.53 * baseScore * 1;
      break;
    // 异常精通
    case '31403':
      finalScore = value * 0.5 * baseScore * 1;
      break;
    default:
      break;
  }
  return finalScore;
};

/**
 * 获取词条强化次数
 * @param {string} propertyID 属性id
 * @param {string} value 属性值
 * @returns {number}
 */
export const getEquipPropertyEnhanceCount = (propertyID, value) => {
  if (value.includes('%')) {
    value = value.replace('%', '');
  }
  value = Number(value);
  propertyID = String(propertyID);
  const baseValue = baseValueData[propertyID] || 0;
  if (baseValue === 0) {
    return 0;
  }
  return value / baseValue - 1;
};
