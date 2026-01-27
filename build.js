import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

const pluginName = path.basename(path.dirname(fileURLToPath(import.meta.url)))

const toBuild = ['apps', 'lib', 'model', 'utils']

const assetDirs = [
  { from: 'src/model/damage', to: 'dist/model/damage', exts: ['.js', '.json'] }
]

// tsc编译→更新相应文件→删除编译文件夹
async function init() {
  const args = process.argv.slice(2)
  const onlySrc = args.includes('--only-src')
  const tsconfig = onlySrc ? 'tsconfig.src.json' : 'tsconfig.json'
  console.log('开始编译……')
  try {
    execSync(`tsc -p ${tsconfig}`)
    // eslint-disable-next-line no-empty
  } catch { }
  const files = []
  const md5 = (filePath) => crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex')
  function copyAssets() {
    assetDirs.forEach(({ from, to, exts }) => {
      if (!fs.existsSync(from)) return
      const copy = (src, dest) => {
        const stat = fs.statSync(src)
        if (stat.isDirectory()) {
          fs.mkdirSync(dest, { recursive: true })
          fs.readdirSync(src).forEach(name => copy(path.join(src, name), path.join(dest, name)))
          return
        }
        if (exts.includes(path.extname(src))) {
          if (fs.existsSync(dest)) {
            if (md5(src) === md5(dest)) return
          }
          fs.mkdirSync(path.dirname(dest), { recursive: true })
          fs.copyFileSync(src, dest)
          files.push(dest)
        }
      }
      copy(from, to)
    })
  }
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
  if (!onlySrc) {
    console.log('编译完成，开始更新编译文件……')
    toBuild.forEach((item) => {
      const oriDirPath = `dist/plugins/${pluginName}/src/${item}`
      const targetDirPath = `dist/${item}`
      if (!fs.existsSync(oriDirPath)) return
      copyFolderRecursively(oriDirPath, targetDirPath)
    })
    console.log('编译文件更新完毕，开始更新资源文件……')
  } else {
    console.log('编译完成，开始更新资源文件……')
  }
  copyAssets()
  console.log('资源文件更新完毕，开始删除无关文件……')
  fs.readdirSync('dist').map(v => {
    if (v === '.tsbuildinfo') return
    if (!toBuild.includes(v)) {
      fs.rmSync(`dist/${v}`, { recursive: true, force: true })
    }
  })
  console.log('pnpm build 完毕')
  if (!onlySrc) {
    if (files.length) {
      console.log(`更新文件 * ${files.length}：`)
      files.forEach(v => console.log(`   - ${v.replace('dist/', '')}`))
    } else {
      console.log('无文件更新')
    }
  }
}

await init()

process.exit(0)
