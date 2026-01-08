import { Character } from '../model/hakush/character.js';
import * as convert from './convert.js';
import { getHakushCharacter } from './download.js';
export const getHakushCharacterData = async alias => {
  const name = convert.char.aliasToName(alias);
  const id = convert.char.charNameToID(name);
  if (!id) return null;
  const data = await getHakushCharacter(id);
  if (!data) return null;
  const result = new Character(data);
  return result;
};

export const isSkillLevelLegal = (key, level) => {
  if (key === 'CoreLevel') {
    return !!level && level >= 0 && level <= 6;
  }
  return !!level && level >= 1 && level <= 12;
};
