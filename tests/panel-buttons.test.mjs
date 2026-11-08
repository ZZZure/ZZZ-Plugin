import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  allButtons,
  character,
  fixture,
  image,
  response,
  rulePrefix
} from './helpers/panel-fixture.mjs'

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
