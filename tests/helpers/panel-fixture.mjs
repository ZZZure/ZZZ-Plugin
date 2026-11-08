import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const panelSource = readFileSync(new URL('../../src/apps/panel.ts', import.meta.url), 'utf8')
const buttonSource = readFileSync(new URL('../../src/lib/panelButtons.ts', import.meta.url), 'utf8')
const commonSource = readFileSync(new URL('../../src/lib/common.ts', import.meta.url), 'utf8')
export const rulePrefix = commonSource.match(/export const rulePrefix = '([^']+)'/)[1]
export const image = { type: 'image', file: 'fixture-panel.png' }
export const response = { message_id: 'fixture-message' }

export function character(name, isNew = false, id) {
  return {
    id,
    name_mi18n: name,
    isNew,
    role_icon: 'fixture-original.png',
    async get_basic_assets() {},
    async get_detail_assets() {}
  }
}

export function allButtons(message) {
  return Array.from(message.data).flatMap(row => Array.from(row))
}

/**
 * 隔离加载面板源码，测试不访问 QQ 和米游社。
 */
export async function fixture(options = {}) {
  const sent = []
  const renders = []
  const writes = []
  const handlerCalls = []
  const uidQueries = []
  const refreshCalls = []
  const characters = options.characters ?? [character('安比', false, 1011), character('妮可', false, 1021)]
  // 回归默认开启按钮；传 buttons:false 覆盖为关闭。
  const panelConfig = { buttons: Object.hasOwn(options, 'buttons') ? options.buttons : true }
  const settingsMock = { getConfig: () => panelConfig }
  const event = {
    user_id: Object.hasOwn(options, 'userId') ? options.userId : 'fixture-user',
    group_id: options.groupId,
    isGuild: options.isGuild,
    at: options.at,
    msg: options.msg ?? '#zzz面板列表',
    bot: Object.hasOwn(options, 'bot') ? options.bot : { adapter: { id: options.adapter ?? 'QQBot' } },
    reply: async msg => {
      if (!msg) return false
      sent.push(msg)
      return response
    },
    runtime: { handler: null }
  }
  const context = vm.createContext({
    segment: options.segment ?? {
      button: (...rows) => ({ type: 'button', data: rows })
    },
    redis: {
      async get(key) {
        return options.cooldown && key.endsWith(':LASTTIME') ? String(Date.now()) : null
      },
      async set(...args) { writes.push(args) }
    },
    logger: { warn() {}, error() {}, mark() {} },
    setTimeout,
    clearTimeout
  })
  if (options.missingSegment) delete context.segment
  const ContextError = vm.runInContext('Error', context)
  const compile = source => ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
  }).outputText
  const settingsModule = new vm.SyntheticModule(['default'], function () {
    this.setExport('default', settingsMock)
  }, { context })
  const buttonsModule = new vm.SourceTextModule(compile(buttonSource), { context })
  await buttonsModule.link(specifier => {
    if (specifier === './settings.js') return settingsModule
    throw new Error(`Unexpected button helper dependency: ${specifier}`)
  })
  await buttonsModule.evaluate()

  class ZZZPlugin {
    constructor(config) { this.rule = config.rule; this.e = event }
    async getUID() {
      if (event.at) event.user_id = event.at
      const uid = options.uid ?? 'fixture-uid'
      uidQueries.push(uid)
      return uid
    }
    async getAPI() {
      if (options.apiFailure) throw new ContextError('fixture API failure')
      return { api: { uid: options.uid ?? 'fixture-uid' }, deviceFp: 'fixture-device' }
    }
    async getPlayerInfo() {}
    reply(msg) { return event.reply(msg) }
    async render(path, data, config) {
      renders.push({ path, data, config })
      if (options.renderFailure) return false
      if (config?.retType === 'base64') return image
      await event.reply(image)
      return response
    }
  }
  const dependencies = {
    '../lib/avatar.js': {
      mergePanel: async () => characters,
      getPanelList: () => characters,
      refreshPanel: async (_api, _deviceFp, charIds) => {
        refreshCalls.push(charIds)
        if (options.mysFailure) {
          await panel.reply('fixture MYS failure')
          return null
        }
        if (charIds != null && options.missingOwnedChar) return null
        if (charIds?.length) {
          return characters.map(item => ({
            ...item,
            isNew: charIds.includes(item.id)
          }))
        }
        return characters
      },
      resolvePanelChar: name => {
        if (options.unknownChar === true) return false
        if (Array.isArray(options.unknownChar) && options.unknownChar.includes(name)) return false
        const found = characters.find(item => item.name_mi18n === name)
        if (found) return { id: found.id ?? 1011, name }
        return false
      },
      splitPanelCharNames: raw => raw.split(/[\s,，、]+/).map(name => name.trim()).filter(Boolean),
      getPanelOrigin: (uid, name) => characters.find(item => item.name_mi18n === name) ?? characters[0],
      updatePanelData: (...args) => writes.push(['panel-data', ...args]),
      formatPanelData: data => data,
      getPanelListOrigin: () => characters
    },
    '../model/Enka/enkaApi.js': {
      parsePlayerInfo: data => data,
      refreshPanelFromEnka: async () => {
        if (options.enkaFailure) throw new ContextError('fixture Enka failure')
        return { playerInfo: {}, panelList: characters }
      }
    },
    '../lib/common.js': { rulePrefix, getCk: async () => options.hasCk ? {} : undefined },
    '../lib/plugin.js': { ZZZPlugin },
    '../lib/settings.js': { default: settingsMock },
    lodash: { default: { get: (value, key, fallback) => value?.[key] ?? fallback } }
  }
  const modules = new Map()
  const panelModule = new vm.SourceTextModule(compile(panelSource), { context })
  await panelModule.link(specifier => {
    if (specifier === '../lib/panelButtons.js') return buttonsModule
    if (!dependencies[specifier]) throw new Error(`Unexpected dependency: ${specifier}`)
    if (!modules.has(specifier)) {
      const values = dependencies[specifier]
      modules.set(specifier, new vm.SyntheticModule(Object.keys(values), function () {
        for (const [name, value] of Object.entries(values)) this.setExport(name, value)
      }, { context }))
    }
    return modules.get(specifier)
  })
  await panelModule.evaluate()
  const panel = new panelModule.namespace.Panel()
  event.runtime.handler = {
    has: () => true,
    async call(key, e, data) {
      handlerCalls.push({ key, e, data })
      return panel.getCharPanelTool(e, data)
    }
  }
  return {
    panel,
    event,
    sent,
    renders,
    writes,
    handlerCalls,
    characters,
    uidQueries,
    refreshCalls,
    buttons: buttonsModule.namespace
  }
}
