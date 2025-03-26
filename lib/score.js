import { getMapData } from '../utils/file.js';
import { charNameToID } from './convert/char.js';
import { nameToId } from './convert/property.js';

/** @type {{ [propID: string]: number }} */
export const baseValueData = getMapData('EquipBaseValue');
const equipScore = getMapData('EquipScore');
/** @type {{ [charID: string]: { [propID: string]: number } }} */
export const scoreData = Object.create(null);
for (const charName in equipScore) {
  // 兼容原ID格式
  if (+charName) {
    scoreData[charName] = equipScore[charName];
    continue;
  };
  const charID = charNameToID(charName);
  if (!charID)
    continue;
  scoreData[charID] = Object.create(null);
  for (const propName in equipScore[charName]) {
    const propID = nameToId(propName);
    if (!propID || !equipScore[charName][propName])
      continue;
    scoreData[charID][propID] = equipScore[charName][propName];
  };
  /** 小生命、小攻击、小防御映射为大生命、大攻击、大防御的1/3 */
  for (const [small, big] of [[11103, 11102], [12103, 12102], [13103, 13102]]) {
    if (scoreData[charID][big]) {
      scoreData[charID][small] ??= scoreData[charID][big] / 3;
    };
  };
};

/**
 * 是否有分数数据
 * @param {string} charID 角色id
 * @returns {boolean}
 */
export const hasScoreData = charID => {
  return (
    scoreData[charID] &&
    Object.keys(scoreData[charID]).length > 0
  );
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
