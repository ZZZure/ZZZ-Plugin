import request from '../../utils/request.js'

export default new class {
  private readonly host = 'https://static.nanoka.cc'
  private readonly versionUrl = `${this.host}/manifest.json`
  private version = '2.7.3+14158029'
  private refreshPromise?: Promise<void>

  constructor() {
    this.refresh()
    setInterval(this.refresh.bind(this), 12 * 3600 * 1000)
  }

  private async refresh() {
    if (this.refreshPromise) return this.refreshPromise

    this.refreshPromise = (async () => {
      try {
        const version = (await request.get(this.versionUrl, {}, { retry: 3 }).then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch manifest：${res.statusText}`)
          }
          return res.json() as any
        })).zzz.latest
        if (version && version !== this.version) {
          logger.debug(`成功刷新NanokaURL绝区零最新版本：${version}`)
          this.version = version
        }
      } catch (error) {
        logger.error(`获取NanokaURL绝区零最新版本失败，使用默认版本：${this.version}`)
        logger.error(error)
      } finally {
        this.refreshPromise = undefined
      }
    })()

    return this.refreshPromise
  }

  get ZZZ_BASE() {
    return `${this.host}/zzz/${this.version}`
  }

  get ZZZ_ALL_CHAR() {
    return `${this.ZZZ_BASE}/character.json`
  }

  get ZZZ_CHARACTER() {
    return `${this.ZZZ_BASE}/zh/character`
  }

  get ZZZ_ALL_WEAPON() {
    return `${this.ZZZ_BASE}/weapon.json`
  }

  get ZZZ_WEAPON() {
    return `${this.ZZZ_BASE}/zh/weapon`
  }

  get ZZZ_ALL_EQUIPMENT() {
    return `${this.ZZZ_BASE}/equipment.json`
  }

  get ZZZ_EQUIPMENT() {
    return `${this.ZZZ_BASE}/zh/equipment`
  }

  get ZZZ_ALL_BANGBOO() {
    return `${this.ZZZ_BASE}/bangboo.json`
  }

  get ZZZ_UI() {
    return `${this.host}/assets/zzz`
  }

}
