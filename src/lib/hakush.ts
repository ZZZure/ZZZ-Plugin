import { Character } from '../model/hakush/character.js'
import { getHakushCharacter } from './download.js'
import * as convert from './convert.js'

export const getHakushCharacterData = async (alias: string) => {
  const name = convert.char.aliasToName(alias)
  const id = convert.char.nameToId(name)
  if (!id) return null
  const data = await getHakushCharacter(id)
  if (!data) return null
  const result = new Character(data)
  return result
}

export const isSkillLevelLegal = (key: string, level: number) => {
  if (key === 'CoreLevel') {
    return Number.isInteger(level) && level >= 0 && level <= 6
  }
  return Number.isInteger(level) && level >= 1 && level <= 12
}
