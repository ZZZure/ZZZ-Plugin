import type { Config } from '../@types/interface.js'
import { configPath, dataPath, defPath, pluginName } from './path.js'
import chokidar from 'chokidar'
import YAML from 'yaml'
import path from 'path'
import fs from 'fs'

type files = keyof Config.KeyValue
type fileTypes = 'defSet' | 'config'

type filesData = {
  [key in files]: Config.KeyValue[key]
}

type watchType = {
  // @ts-ignore
  [key in fileTypes]: { [key in files]: chokidar.FSWatcher }
}

type ArrayKeys<T> = {
  [K in keyof T]-?: T[K] extends Array<any> ? K : never
}[keyof T]

type ArrayElement<T> = T extends Array<infer U> ? U : never

type IsPlainObject<T> = T extends object ?
  T extends any[] ? false :
  T extends (...args: any[]) => any ? false : true
  : false

type SingleValue<T extends files, K extends keyof Config.KeyValue[T]> =
  IsPlainObject<Config.KeyValue[T][K]> extends true
  ? Partial<Config.KeyValue[T][K]>
  : Config.KeyValue[T][K]

class Setting {
  defPath: string
  configPath: string
  defSet: filesData
  config: filesData
  dataPath: string
  data: {}
  watcher: watchType

  constructor() {
    /** 默认设置 */
    this.defPath = defPath
    this.defSet = {} as filesData
    /** 用户设置 */
    this.configPath = configPath
    this.config = {} as filesData
    this.dataPath = dataPath
    this.data = {}
    /** 监听文件 */
    this.watcher = { config: {}, defSet: {} } as watchType
    this.initCfg()
  }

  /** 初始化配置 */
  initCfg() {
    const files = fs
      .readdirSync(this.defPath)
      .filter(file => file.endsWith('.yaml'))
    if (!fs.existsSync(this.configPath)) {
      fs.mkdirSync(this.configPath)
    }
    for (const file of files) {
      if (!fs.existsSync(path.join(this.configPath, file))) {
        fs.copyFileSync(
          path.join(this.defPath, file),
          path.join(this.configPath, file)
        )
      }
      this.watch(
        path.join(this.configPath, file),
        file.replace('.yaml', '') as files,
        'config'
      )
    }
  }

  /**
   * 配置对象化 用于锅巴插件界面填充
   */
  merge() {
    const sets: { [key: string]: any } = {}
    const appsConfig = fs
      .readdirSync(this.defPath)
      .filter(file => file.endsWith('.yaml'))
    for (const appConfig of appsConfig) {
      // 依次将每个文本填入键
      const filename = appConfig.replace(/.yaml/g, '').trim() as files
      sets[filename] = this.getConfig(filename)
    }
    return sets
  }

  /**
   * 配置对象分析 用于锅巴插件界面设置
   */
  analysis(config: filesData) {
    for (const key of Object.keys(config) as files[]) {
      this.setConfig(key, config[key])
    }
  }

  /**
   * 获取对应模块数据文件
   */
  getData(filepath: string, filename: string) {
    filename = `${filename}.yaml`
    filepath = path.join(this.dataPath, filepath)
    try {
      if (!fs.existsSync(path.join(filepath, filename))) {
        return false
      }
      return YAML.parse(fs.readFileSync(path.join(filepath, filename), 'utf8'))
    } catch (error) {
      logger.error(`[${pluginName}] [${filename}] 读取失败 ${error}`)
      return false
    }
  }

  /**
   * 写入对应模块数据文件
   */
  setData(filepath: string, filename: string, data: object): boolean {
    filename = `${filename}.yaml`
    filepath = path.join(this.dataPath, filepath)
    try {
      if (!fs.existsSync(filepath)) {
        // 递归创建目录
        fs.mkdirSync(filepath, { recursive: true })
      }
      fs.writeFileSync(
        path.join(filepath, filename),
        YAML.stringify(data),
        'utf8'
      )
      return true
    } catch (error) {
      logger.error(`[${pluginName}] [${filename}] 写入失败 ${error}`)
      return false
    }
  }

  /**
   * 获取对应模块默认配置
   */
  getdefSet<T extends files>(app: T): Config.KeyValue[T] {
    return this.getYaml(app, 'defSet')
  }

  /**
   * 获取对应模块用户配置（配置文件名）
   */
  getConfig<T extends files>(app: T): Config.KeyValue[T] {
    return { ...this.getdefSet(app), ...this.getYaml(app, 'config') }
  }

  /**
   * 合并两个对象 相同的数组对象 主要用于yml的列表属性合并 并去重  先备份一下方法
   */
  mergeConfigObjectArray(obj1: any, obj2: any): object {
    for (const key in obj2) {
      if (Array.isArray(obj2[key]) && Array.isArray(obj1[key])) {
        //合并两个对象中相同 数组属性
        const uniqueElements = new Set([...obj1[key], ...obj2[key]])
        obj1[key] = [...uniqueElements]
      } else {
        //否则以obj2中的为准
        obj1[key] = obj2[key]
      }
    }

    return obj1
  }

  /**
   * 设置对应模块用户配置
   */
  setConfig<T extends files>(app: T, obj: Config.KeyValue[T]) {
    // 先获取默认配置
    const defSet = this.getdefSet(app)
    // 再获取用户配置
    const config = this.getConfig(app)
    return this.setYaml(app, 'config', { ...defSet, ...config, ...obj })
  }

  /**
   * 设置对应模块用户配置单个键值对
   */
  setSingleConfig<T extends files, K extends keyof Config.KeyValue[T]>(
    app: T,
    key: K,
    value: SingleValue<T, K>
  ) {
    // 先获取默认配置
    const defSet = this.getdefSet(app)
    const config = this.getConfig(app)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      config[key] = { ...config[key], ...value }
    } else {
      config[key] = value as Config.KeyValue[T][K]
    }
    return this.setYaml(app, 'config', { ...defSet, ...config })
  }

  /**
   * 向数组中添加元素
   */
  addArrayleConfig<
    T extends files,
    K extends ArrayKeys<Config.KeyValue[T]>
  >(
    app: T, key: K, value: ArrayElement<Config.KeyValue[T][K]>
  ) {
    const defSet = this.getdefSet(app)
    const config = this.getConfig(app)
    const list = (Array.isArray(config[key]) ? config[key] : []) as ArrayElement<Config.KeyValue[T][K]>[]
    list.push(value)
    config[key] = list as Config.KeyValue[T][K]
    return this.setYaml(app, 'config', { ...defSet, ...config })
  }

  /**
   * 从数组中删除元素
   */
  removeArrayleConfig<
    T extends files,
    K extends ArrayKeys<Config.KeyValue[T]>
  >(
    app: T, key: K, value: ArrayElement<Config.KeyValue[T][K]>
  ) {
    const defSet = this.getdefSet(app)
    const config = this.getConfig(app)
    if (!config[key] || !Array.isArray(config[key])) {
      return false
    }
    const list = config[key] as ArrayElement<Config.KeyValue[T][K]>[]
    config[key] = list.filter(item => item !== value) as Config.KeyValue[T][K]
    return this.setYaml(app, 'config', { ...defSet, ...config })
  }

  /**
   * 将对象写入YAML文件
   */
  setYaml<T extends files>(app: T, type: fileTypes, Object: Config.KeyValue[T]): boolean {
    const file = this.getFilePath(app, type)
    try {
      fs.writeFileSync(file, YAML.stringify(Object), 'utf8')
      return true
    } catch (error) {
      logger.error(`[${app}] 写入失败 ${error}`)
      return false
    }
  }

  /**
   * 读取YAML文件 返回对象
   */
  getYaml<T extends files>(app: T, type: fileTypes): Config.KeyValue[T] {
    const file = this.getFilePath(app, type)
    if (this[type][app]) return this[type][app]
    this[type][app] = YAML.parse(fs.readFileSync(file, 'utf8'))
    this.watch(file, app, type)
    return this[type][app]
  }

  /**
   * 获取YAML文件目录
   */
  getFilePath(app: files, type: fileTypes) {
    const appFilename = `${app}.yaml`
    if (type === 'defSet') return path.join(this.defPath, appFilename)
    else {
      try {
        if (!fs.existsSync(path.join(this.configPath, appFilename))) {
          fs.copyFileSync(
            path.join(this.defPath, appFilename),
            path.join(this.configPath, appFilename)
          )
        }
      } catch (error) {
        logger.error(`[${pluginName}]缺失默认文件[${app}]${error}`)
      }
      return path.join(this.configPath, `${app}.yaml`)
    }
  }

  /**
   * 监听配置文件
   */
  watch<T extends files>(file: string, app: T, type: fileTypes = 'defSet') {
    if (this.watcher[type][app]) return
    const watcher = chokidar.watch(file)
    watcher.on('change', path => {
      delete this[type][app]
      logger.mark(`[${pluginName}][修改配置文件][${type}][${app}]`)
      // @ts-expect-error
      this[`change_${app}`]?.()
    })
    this.watcher[type][app] = watcher
  }
}

export default new Setting()
