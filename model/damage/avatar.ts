import type { skill } from './Calculator.js'
import type { ZZZAvatarInfo } from '../avatar.js'
import { aliasToID } from '../../lib/convert/char.js'
import { buff, BuffManager } from './BuffManager.js'
import { pluginPath } from '../../lib/path.js'
import { elementEnum } from './BuffManager.js'
import { Calculator } from './Calculator.js'
import chokidar from 'chokidar'
import path from 'path'
import fs from 'fs'

const damagePath = path.join(pluginPath, 'model', 'damage')

export const charData: {
	[id: number]: {
		skill: { [skillName: string]: number[] }
		buff: { [buffName: string]: number[] }
	}
} = {}

const calcFnc: {
	character: {
		[id: number]: {
			calc?: (buffM: BuffManager, calc: Calculator, avatar: ZZZAvatarInfo) => void
			buffs: buff[]
			skills: skill[]
		}
	}
	weapon: {
		[name: string]: {
			calc?: (buffM: BuffManager, star: number) => void
			buffs: buff[]
		}
	}
	set: {
		[name: string]: {
			calc?: (buffM: BuffManager, count: number) => void
			buffs: buff[]
		}
	}
} = {
	character: {},
	weapon: {},
	set: {}
}

async function init() {
	// debug模式下监听文件变化
	const isWatch = await (async () => {
		try {
			return (await import('../../../../lib/config/config.js')).default.bot.log_level === 'debug'
		} catch {
			return false
		}
	})()
	await Promise.all(fs.readdirSync(path.join(damagePath, 'character')).filter(v => v !== '模板').map(v => importChar(v, isWatch)))
	for (const type of ['weapon', 'set']) {
		await Promise.all(
			fs.readdirSync(path.join(damagePath, type)).filter(v => v !== '模板.js' && !v.endsWith('_user.js') && v.endsWith('.js'))
				.map(v => importFile(type as 'weapon' | 'set', v.replace('.js', ''), isWatch))
		)
	}
}

function watchFile(path: string, fnc: () => void) {
	if (!fs.existsSync(path)) return
	const watcher = chokidar.watch(path, {
		awaitWriteFinish: {
			stabilityThreshold: 50
		}
	})
	watcher.on('change', (path) => {
		logger.debug('重载' + path)
		fnc()
	})
}

async function importChar(charName: string, isWatch = false) {
	const id = aliasToID(charName)
	if (!id) return logger.warn(`未找到角色${charName}的ID`)
	const dir = path.join(damagePath, 'character', charName)
	const calcFile = fs.existsSync(path.join(dir, 'calc_user.js')) ? 'calc_user.js' : 'calc.js'
	const dataPath = path.join(dir, (fs.existsSync(path.join(dir, 'data_user.json')) ? 'data_user.json' : 'data.json'))
	try {
		const calcFilePath = path.join(dir, calcFile)
		if (isWatch) {
			watchFile(calcFilePath, () => importChar(charName))
			watchFile(dataPath, () => charData[id] = JSON.parse(fs.readFileSync(dataPath, 'utf8')))
		}
		charData[id] = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
		if (!fs.existsSync(calcFilePath)) return
		const m = await import(`./character/${charName}/${calcFile}?${Date.now()}`)
		if (!m.calc && (!m.buffs || !m.skills)) throw new Error('伤害计算文件格式错误')
		calcFnc.character[id] = m
	} catch (e) {
		logger.error(`导入角色${charName}伤害计算错误:`, e)
	}
}

async function importFile(type: 'weapon' | 'set', name: string, isWatch = false) {
	const defaultFilePath = path.join(damagePath, type, `${name}.js`)
	const userFilePath = path.join(damagePath, type, `${name}_user.js`)
	const isUser = fs.existsSync(userFilePath)
	const filePath = isUser ? userFilePath : defaultFilePath
	try {
		if (isWatch) {
			watchFile(filePath, () => importFile(type, name))
		}
		const m = await import(`./${type}/${name}${isUser ? '_user' : ''}.js?${Date.now()}`)
		if (!m.calc && !m.buffs) throw new Error(type + ' Buff计算文件格式错误')
		calcFnc[type][name] = m
	} catch (e) {
		logger.error(`导入${type}/${name}.js错误：`, e)
	}
}

await init()

/** 角色计算 */
export function avatar_ability(avatar: ZZZAvatarInfo) {
	const m = calcFnc.character[avatar.id]
	if (!m) return []
	const buffM = new BuffManager(avatar)
	const calc = new Calculator(buffM)
	logger.debug('initial_properties', avatar.initial_properties)
	weapon_buff(avatar.weapon, buffM)
	set_buff(avatar.equip, buffM)
	if (m.buffs) buffM.new(m.buffs)
	if (m.skills) calc.new(m.skills)
	if (m.calc) m.calc(buffM, calc, avatar)
	logger.debug(`Buff*${buffM.buffs.length}：`, buffM.buffs)
	return calc.calc()
}

/** 武器加成 */
export function weapon_buff(weapon: ZZZAvatarInfo['weapon'], buffM: BuffManager) {
	const name = weapon?.name
	if (!name) return
	logger.debug('武器：' + name)
	const m = calcFnc.weapon[name]
	if (!m) return
	buffM.default({ name, source: 'Weapon' })
	if (m.buffs) buffM.new(m.buffs)
	if (m.calc) m.calc(buffM, weapon.star)
	buffM.default({})
}

/** 套装加成 */
export function set_buff(equips: ZZZAvatarInfo['equip'], buffM: BuffManager) {
	buffM.default({ name: '', source: 'Set' })
	const setCount: { [name: string]: number } = {}
	for (const equip of equips) {
		if (equip.equipment_type == 5) {
			// 属伤加成
			const index = [31503, 31603, 31703, 31803, 31903].indexOf(equip.main_properties[0].property_id)
			if (index > -1 && elementEnum[index]) {
				// @ts-ignore
				buffM.new({
					name: '驱动盘5号位',
					type: '增伤',
					value: Number(equip.main_properties[0].base.replace('%', '')) / 100,
					isForever: true,
					element: elementEnum[index]
				})
			}
		}
		const suit_name = equip.equip_suit.name
		setCount[suit_name] = (setCount[suit_name] || 0) + 1
	}
	buffM.setCount = setCount
	for (const [name, count] of Object.entries(setCount)) {
		if (count < 2) continue
		logger.debug(`套装：${name}*${count}`)
		const m = calcFnc.set[name]
		if (!m) continue
		buffM.default('name', name)
		if (m.buffs) buffM.new(m.buffs)
		if (m.calc) m.calc(buffM, count)
	}
	buffM.default({})
}
