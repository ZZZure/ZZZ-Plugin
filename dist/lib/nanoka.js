import { Character } from '../model/nanoka/character.js';
import { getNanokaCharacter } from './download.js';
import * as convert from './convert.js';
export const getNanokaCharacterData = async (alias) => {
    const name = convert.char.aliasToName(alias);
    const id = convert.char.nameToId(name);
    if (!id)
        return null;
    const data = await getNanokaCharacter(id);
    if (!data)
        return null;
    const result = new Character(data);
    return result;
};
export const isSkillLevelLegal = (key, level) => {
    if (key === 'CoreLevel') {
        return Number.isInteger(level) && level >= 0 && level <= 6;
    }
    return Number.isInteger(level) && level >= 1 && level <= 12;
};
//# sourceMappingURL=nanoka.js.map