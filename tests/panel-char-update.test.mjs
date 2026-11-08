import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fixture } from './helpers/panel-fixture.mjs'

test('specified-character update prefers full update commands and rejects unknown names', async () => {
  const unknown = await fixture({ msg: '#zzz更新假角色面板', unknownChar: true })
  await unknown.panel.handleRule()
  assert.equal(unknown.sent.length, 1)
  assert.match(unknown.sent[0], /角色【假角色】不存在/)
  assert.deepEqual(unknown.renders, [])

  const full = await fixture({ msg: '#zzz更新面板', hasCk: true })
  await full.panel.handleRule()
  assert.equal(full.sent[0], '正在更新面板列表，请稍候...')
})

test('specified-character MYS update keeps old roles in the refresh list', async () => {
  const { panel, sent, renders, refreshCalls } = await fixture({
    msg: '#zzz更新安比面板',
    hasCk: true
  })
  await panel.handleRule()
  assert.equal(sent[0], '正在更新安比面板，请稍候...')
  assert.equal(sent.length, 2)
  assert.equal(renders.length, 1)
  // VM 隔离后的数组需拷贝再比，避免跨 realm deepEqual 误报
  assert.deepEqual(Array.from(refreshCalls[0]), [1011])
  assert.deepEqual(renders[0].data.list.map(item => item.name_mi18n), ['安比', '妮可'])
  assert.equal(renders[0].data.newChar, 1)
  assert.equal(renders[0].data.list[0].isNew, true)
  assert.equal(renders[0].data.list[1].isNew, false)
})

test('specified-character update requires Cookie and does not fall back to Enka', async () => {
  const { panel, sent, renders } = await fixture({ msg: '#zzz更新安比面板' })
  await panel.handleRule()
  assert.equal(sent.length, 1)
  assert.match(sent[0], /指定角色更新需要绑定Cookie/)
  assert.deepEqual(renders, [])
})

test('showcase commands reject specified-character update', async () => {
  const { panel, sent, renders } = await fixture({
    msg: '#zzz更新展柜安比面板',
    hasCk: true
  })
  await panel.handleRule()
  assert.equal(sent.length, 1)
  assert.match(sent[0], /展柜更新不支持指定角色/)
  assert.deepEqual(renders, [])
})

test('multi-character update accepts顿号 / comma / space separators', async () => {
  for (const msg of [
    '#zzz更新安比、妮可面板',
    '#zzz更新安比,妮可面板',
    '#zzz更新安比，妮可面板',
    '#zzz更新安比 妮可面板'
  ]) {
    const { panel, sent, renders, refreshCalls } = await fixture({ msg, hasCk: true })
    await panel.handleRule()
    assert.equal(sent[0], '正在更新安比、妮可面板，请稍候...')
    assert.deepEqual(Array.from(refreshCalls[0]), [1011, 1021])
    assert.equal(renders[0].data.newChar, 2)
    assert.deepEqual(renders[0].data.list.map(item => item.name_mi18n), ['安比', '妮可'])
  }
})

test('multi-character update rejects when any name is unknown', async () => {
  const { panel, sent, renders } = await fixture({
    msg: '#zzz更新安比、假角色面板',
    hasCk: true,
    unknownChar: ['假角色']
  })
  await panel.handleRule()
  assert.equal(sent.length, 1)
  assert.match(sent[0], /角色【假角色】不存在/)
  assert.deepEqual(renders, [])
})
