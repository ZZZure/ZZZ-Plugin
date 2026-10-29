/// <reference path="./src/@types/yunzai/index.d.ts"/>
import { configPath, dataPath, appPath, resourcesPath, pluginPath } from './dist/lib/path.js'
import { migrateLegacyData } from './dist/lib/migrateData.js'
import path from 'path'
import fs from 'fs'

try {
  await import('source-map-support/register.js')
} catch {
  //
}

logger.info('*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*')
logger.info('ZZZ-Plugin 加载中')
logger.info('仓库地址 https://github.com/ZZZure/ZZZ-plugin')
logger.info('Created By ZZZure Project (MIHOMO)')
logger.info('*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*')

migrateLegacyData()

const coreCss = path.join(resourcesPath, 'panel/card.css')
if (!fs.existsSync(coreCss)) {
  try {
    const { execSync } = await import('child_process')
    logger.info('[ZZZ-Plugin] 检测到缺失资源 CSS 文件，正在自动编译 SCSS...')
    execSync('npx sass resources:resources --update --no-error-css', {
      cwd: pluginPath,
      stdio: 'inherit'
    })
    logger.info('[ZZZ-Plugin] SCSS 资源编译完成')
  } catch (err) {
    logger.error('[ZZZ-Plugin] 自动编译 SCSS 失败，可能影响面板渲染：', err)
  }
}

void [configPath, dataPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

const files = fs.readdirSync(appPath).filter(file => file.endsWith('.js'))

const ret = []

files.forEach(file => {
  ret.push(import(`./dist/apps/${file}`))
})

const retPromise = await Promise.allSettled(ret)

const apps = {}

for (const i in files) {
  const name = files[i].replace('.js', '')

  if (retPromise[i].status != 'fulfilled') {
    logger.error(`[ZZZ-Plugin] 载入模块${logger.red(name)}错误`)
    logger.error(retPromise[i].reason)
    continue
  }

  apps[name] = retPromise[i].value[Object.keys(retPromise[i].value)[0]]
}

export { apps }
