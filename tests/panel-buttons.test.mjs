import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const panelSource = readFileSync(new URL('../src/apps/panel.ts', import.meta.url), 'utf8')
const buttonSource = readFileSync(new URL('../src/lib/panelButtons.ts', import.meta.url), 'utf8')
const commonSource = readFileSync(new URL('../src/lib/common.ts', import.meta.url), 'utf8')
const rulePrefix = commonSource.match(/export const rulePrefix = '([^']+)'/)[1]
const image = { type: 'image', file: 'fixture-panel.png' }
const response = { message_id: 'fixture-message' }

function character(name, isNew = false) {
  return {
    name_mi18n: name,
    isNew,
    role_icon: 'fixture-original.png',
    async get_basic_assets() {},
    async get_detail_assets() {}
  }
}

// 隔离加载源码，测试不访问 QQ 和米游社。
async function fixture(options = {}) {
  const sent = []
  const renders = []
  const writes = []
  const handlerCalls = []
  const uidQueries = []
  const characters = options.characters ?? [character('安比'), character('妮可')]
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
      refreshPanel: async () => {
        if (options.mysFailure) {
          await panel.reply('fixture MYS failure')
          return null
        }
        return characters
      },
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
  return { panel, event, sent, renders, writes, handlerCalls, characters, uidQueries, buttons: buttonsModule.namespace }
}

function allButtons(message) {
  return Array.from(message.data).flatMap(row => Array.from(row))
}

const nonQQBotCases = [
  ...['QQ', 'OneBotv11', 'OneBotv12', 'Satori', 'Milky', 'WeChat', 'icqq']
    .map(adapter => ({ label: adapter, options: { adapter } })),
  { label: 'without adapter', options: { bot: {} } },
  { label: 'without bot', options: { bot: undefined } }
]

for (const { label, options } of nonQQBotCases) {
  test(`non-QQBot ${label} preserves the original role-handler argument keys`, async () => {
    const { panel, handlerCalls } = await fixture({ ...options, msg: '#zzz安比面板' })
    await panel.handleRule()
    assert.equal(handlerCalls.length, 1)
    assert.deepEqual(Object.keys(handlerCalls[0].data).sort(), ['data', 'needSave', 'uid'])
  })

  test(`non-QQBot ${label} ignores explicitly supplied tool buttons`, async () => {
    const { panel, event, characters, sent, writes } = await fixture(options)
    const result = await panel.getCharPanelTool(event, {
      uid: 'fixture-uid', data: characters[0], needSave: false,
      buttons: { type: 'button', data: [[{
        text: '面板列表', input: '#zzz面板列表', send: true, permission: 'fixture-user'
      }]] }
    })
    assert.deepEqual(sent, [image])
    assert.equal(result.image, image)
    assert.equal(result.message, response)
    assert.equal(writes[0][0], 'ZZZ:PANEL:IMAGE:fixture-message')
  })
}

test('QQ buttons submit normal commands immediately so replies keep the incoming message ID', async () => {
  const { buttons, event } = await fixture()
  const helper = new buttons.PanelButtons(event)
  const messages = [helper.detail('妮可'), helper.list([character('安比')]),
    helper.list([character('安比')], true)]
  for (const message of messages) {
    for (const button of allButtons(message)) {
      assert.equal(button.send, true)
      assert.match(button.input, new RegExp(rulePrefix))
      assert.equal(Object.hasOwn(button, 'callback'), false)
      assert.equal(button.permission, 'fixture-user')
    }
  }
})

test('guide button uses the Chinese ZZZ prefix for shared guide routing', async () => {
  const { buttons, event } = await fixture()
  const guide = allButtons(new buttons.PanelButtons(event).detail('妮可'))
    .find(button => button.text === '角色攻略')
  assert.equal(guide.input, '#绝区零妮可攻略')
  assert.match(guide.input, new RegExp(`${rulePrefix}\\S+攻略$`))
  assert.equal(guide.send, true)
  assert.equal(guide.permission, 'fixture-user')
})

test('single-role actions are real ZZZ commands and restricted to the requesting user', async () => {
  const { panel, sent, writes } = await fixture({ msg: '#zzz妮可面板' })
  await panel.handleRule()
  assert.equal(sent.length, 1)
  assert.equal(sent[0][0], image)
  const buttons = allButtons(sent[0][1])
  assert.deepEqual(buttons.map(button => button.input), [
    '#zzz面板列表', '#zzz练度统计', '#绝区零妮可攻略', '#zzz更新面板'
  ])
  assert.ok(buttons.every(button => button.permission === 'fixture-user'))
  assert.equal(writes.length, 1)
  assert.equal(writes[0][0], 'ZZZ:PANEL:IMAGE:fixture-message')
  assert.equal(writes[0][1], 'fixture-original.png')
  assert.equal(writes[0][2].EX, 10800)
})

test('panel list renders once and sends image and buttons in one reply', async () => {
  const { panel, sent, renders } = await fixture()
  await panel.handleRule()
  assert.equal(renders.length, 1)
  assert.equal(renders[0].config.retType, 'base64')
  assert.equal(sent.length, 1)
  assert.equal(sent[0][0], image)
  assert.deepEqual(allButtons(sent[0][1]).map(button => button.input), [
    '#zzz更新面板', '#zzz更新展柜面板', '#zzz安比面板', '#zzz妮可面板'
  ])
})

for (const command of ['#zzz更新面板', '#zzz更新展柜面板']) {
  test(`${command} exposes refreshed roles first and a return-to-list action`, async () => {
    const { panel, sent } = await fixture({
      msg: command,
      characters: [character('安比'), character('妮可', true)]
    })
    await panel.handleRule()
    assert.equal(sent.length, 1)
    assert.deepEqual(allButtons(sent[0][1]).map(button => button.input), [
      '#zzz面板列表', '#zzz更新展柜面板', '#zzz妮可面板', '#zzz安比面板'
    ])
  })
}

test('lists stay within five rows of two buttons and skip duplicate or invalid names', async () => {
  const { buttons, event } = await fixture()
  const characters = [character(''), character('重复'), character('重复'), character('换\n行'),
    ...Array.from({ length: 15 }, (_, index) => character(`角色${index}`))]
  const message = new buttons.PanelButtons(event).list(characters)
  assert.equal(message.data.length, 5)
  assert.ok(message.data.every(row => row.length <= 2))
  const actions = allButtons(message)
  assert.equal(actions.length, 10)
  assert.equal(new Set(actions.map(button => button.input)).size, 10)
  assert.ok(actions.every(button => !button.input.includes('\n')))
})

test('empty character lists still offer the two existing refresh commands', async () => {
  const { buttons, event } = await fixture()
  assert.deepEqual(allButtons(new buttons.PanelButtons(event).list([])).map(button => button.input), [
    '#zzz更新面板', '#zzz更新展柜面板'
  ])
})

for (const options of [
  { adapter: 'OneBotv11' },
  { segment: {} },
  { missingSegment: true },
  { at: 'another-user' },
  { userId: 'qg_fixture-channel-user' },
  { groupId: 'qg_fixture-guild-channel' },
  { isGuild: true }
]) {
  for (const msg of ['#zzz面板列表', '#zzz安比面板', '#zzz更新展柜面板']) {
    test(`original image reply is preserved for ${JSON.stringify(options)} and ${msg}`, async () => {
      const { panel, sent, renders } = await fixture({ ...options, msg })
      await panel.handleRule()
      assert.deepEqual(sent, [image])
      if (!msg.includes('安比')) assert.equal(renders[0].config, undefined)
    })
  }
}

test('failed list rendering never sends a standalone keyboard', async () => {
  const { panel, sent } = await fixture({ renderFailure: true })
  await panel.getCharPanelList()
  assert.equal(sent.length, 0)
})

test('third-party panel tools keep their default image-only response and return shape', async () => {
  const { panel, event, sent, characters } = await fixture()
  const result = await panel.getCharPanelTool(event, { uid: 'tool-uid', data: characters[0], needSave: false })
  assert.deepEqual(sent, [image])
  assert.equal(result.image, image)
  assert.equal(result.message, response)
})

test('reply=false returns the original image without messages or original-image cache writes', async () => {
  const { panel, event, sent, writes, characters, buttons } = await fixture()
  const result = await panel.getCharPanelTool(event, {
    uid: 'tool-uid', data: characters[0], needSave: false, reply: false,
    buttons: new buttons.PanelButtons(event).detail('安比')
  })
  assert.equal(result, image)
  assert.deepEqual(sent, [])
  assert.deepEqual(writes, [])
})

test('needImg=false never adds buttons or invokes image rendering', async () => {
  const { panel, event, sent, renders, characters, buttons } = await fixture()
  const result = await panel.getCharPanelTool(event, {
    uid: 'tool-uid', data: characters[0], needSave: false, needImg: false,
    buttons: new buttons.PanelButtons(event).detail('安比')
  })
  assert.equal(result.image, false)
  assert.deepEqual(sent, [])
  assert.equal(result.message, false)
  assert.deepEqual(renders, [])
})

test('numeric requesting-user IDs become strings understood by the QQBot permission converter', async () => {
  const { buttons, event } = await fixture({ userId: 12345 })
  const message = new buttons.PanelButtons(event).detail('安比')
  assert.ok(allButtons(message).every(button => button.permission === '12345'))
})

test('MYS refresh restores normal replies and sends only one final image with buttons', async () => {
  const { panel, sent, renders } = await fixture({ msg: '#zzz更新面板', hasCk: true })
  await panel.handleRule()
  assert.equal(sent.length, 2)
  assert.equal(typeof sent[0], 'string')
  assert.equal(sent[1][0], image)
  assert.equal(sent[1][1].type, 'button')
  assert.equal(renders.length, 1)
  await panel.reply('after MYS refresh')
  assert.equal(sent[2], 'after MYS refresh')
})

for (const failure of ['mysFailure', 'apiFailure']) {
  test(`${failure} restores reply and does not send an image or keyboard`, async () => {
    const { panel, sent, renders } = await fixture({ msg: '#zzz更新面板', hasCk: true, [failure]: true })
    await panel.handleRule()
    assert.ok(sent.every(message => typeof message === 'string'))
    assert.match(sent.at(-1), /面板列表更新失败/)
    assert.deepEqual(renders, [])
    await panel.reply('after failed MYS refresh')
    assert.equal(sent.at(-1), 'after failed MYS refresh')
  })
}

test('Enka failure does not render or send buttons', async () => {
  const { panel, sent, renders } = await fixture({ msg: '#zzz更新展柜面板', enkaFailure: true })
  await panel.handleRule()
  assert.equal(sent.length, 1)
  assert.match(sent[0], /Enka服务调用失败/)
  assert.deepEqual(renders, [])
})

test('refresh cooldown does not perform rendering or send a keyboard', async () => {
  const { panel, sent, renders } = await fixture({ msg: '#zzz更新展柜面板', cooldown: true })
  await panel.handleRule()
  assert.equal(sent.length, 1)
  assert.match(sent[0], /只能更新一次/)
  assert.deepEqual(renders, [])
})

test('empty Enka results keep the original warning without a standalone keyboard', async () => {
  const { panel, sent, renders } = await fixture({ msg: '#zzz更新展柜面板', characters: [] })
  await panel.handleRule()
  assert.equal(sent.length, 1)
  assert.match(sent[0], /面板列表为空/)
  assert.deepEqual(renders, [])
})

test('clicking a previous menu uses the requesting user current selected UID after switching accounts', async () => {
  const options = { msg: '#zzz妮可面板', uid: 'first-uid' }
  const { panel, event, sent, uidQueries } = await fixture(options)
  await panel.handleRule()
  const menu = allButtons(sent[0][1])[0]
  assert.equal(menu.permission, event.user_id)
  assert.equal(menu.input, '#zzz面板列表')
  options.uid = 'second-uid'
  event.msg = menu.input
  await panel.handleRule()
  assert.deepEqual(uidQueries, ['first-uid', 'second-uid'])
})

test('unknown requesting user does not receive an account-specific keyboard', async () => {
  const { panel, sent } = await fixture({ userId: undefined })
  await panel.handleRule()
  assert.deepEqual(sent, [image])
})

test('panel.buttons=false keeps the original image-only reply on QQBot', async () => {
  for (const msg of ['#zzz面板列表', '#zzz安比面板', '#zzz更新展柜面板']) {
    const { panel, sent, renders } = await fixture({ buttons: false, msg })
    await panel.handleRule()
    assert.deepEqual(sent, [image])
    if (!msg.includes('安比')) assert.equal(renders[0].config, undefined)
  }
})

test('failed role rendering does not send buttons or create an original-image cache entry', async () => {
  const { panel, sent, writes } = await fixture({ msg: '#zzz安比面板', renderFailure: true })
  await panel.handleRule()
  assert.deepEqual(sent, [])
  assert.deepEqual(writes, [])
})
