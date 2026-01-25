import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const pluginName = path.basename(path.dirname(fileURLToPath(import.meta.url)))

const toBuild = ['apps', 'lib', 'model', 'utils']

// tsc编译→更新相应文件→删除编译文件夹
async function init() {
  console.log('开始编译……')
  try {
    execSync('tsc')
  } catch { }
  console.log('编译完成，开始更新文件……')
  const files = []
  function copyFolderRecursively(orlDirPath, targetDirPath) {
    fs.mkdirSync(targetDirPath, { recursive: true })
    fs.readdirSync(orlDirPath).forEach(element => {
      const sourcePath = `${orlDirPath}/${element}`
      const targetPath = `${targetDirPath}/${element}`
      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, targetPath)
        files.push(targetPath)
      } else {
        copyFolderRecursively(sourcePath, targetPath)
      }
    })
  }
  toBuild.forEach((item) => {
    const oriDirPath = `dist/plugins/${pluginName}/src/${item}`
    const targetDirPath = `dist/${item}`
    if (!fs.existsSync(oriDirPath)) return
    copyFolderRecursively(oriDirPath, targetDirPath)
  })
  console.log('文件更新完毕，删除无关文件……')
  fs.readdirSync('dist').map(v => {
    if (v === '.tsbuildinfo') return
    if (!toBuild.includes(v)) {
      fs.rmSync(`dist/${v}`, { recursive: true, force: true })
    }
  })
  console.log('pnpm build 完毕')
  if (files.length) {
    console.log('更新文件：')
    files.forEach(v => console.log(`   - ${v}`))
  } else {
    console.log('无文件更新')
  }
}

await init()

process.exit(0)
