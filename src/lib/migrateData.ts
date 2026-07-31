import {
  defaultDataPath,
  legacyDataPath,
  pluginName,
  setDataPath
} from './path.js'
import path from 'path'
import fs from 'fs'

/** 旧目录中的迁移完成提示文件名 */
export const MIGRATION_NOTICE_NAME = '【重要】数据已迁移.txt'

/**
 * 新目录中的迁移标记（防呆主信号）
 * 即使用户删掉旧目录提示文件，只要新目录仍有此标记，就不会用旧数据覆盖新数据
 */
export const MIGRATION_MARKER_NAME = '.zzz-data-migrated'

const STAGING_SUFFIX = '.__migrating__'
const INCOMPLETE_SUFFIX = '.__incomplete__'

type FileMeta = {
  rel: string
  size: number
  mtimeMs: number
}

/**
 * 判断路径是否为迁移过程中的临时目录
 */
function isMigrationTempName(name: string) {
  return name.endsWith(STAGING_SUFFIX) || name.endsWith(INCOMPLETE_SUFFIX)
}

/**
 * 是否为迁移元数据文件（提示 / 标记），不参与数据比较
 */
function isMigrationMetaName(name: string) {
  return name === MIGRATION_NOTICE_NAME || name === MIGRATION_MARKER_NAME
}

/**
 * 递归列出目录下所有数据文件（相对路径 + 大小 + mtime），跳过元数据与临时目录
 */
function listDataFiles(root: string): FileMeta[] {
  const result: FileMeta[] = []
  if (!fs.existsSync(root)) return result

  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir)) {
      if (isMigrationMetaName(name) || isMigrationTempName(name)) continue
      const full = path.join(dir, name)
      const stat = fs.statSync(full)
      if (stat.isDirectory()) {
        walk(full)
      } else if (stat.isFile()) {
        result.push({
          rel: path.relative(root, full),
          size: stat.size,
          mtimeMs: stat.mtimeMs
        })
      }
    }
  }

  walk(root)
  return result.sort((a, b) => a.rel.localeCompare(b.rel))
}

/**
 * 目录内数据文件的最近修改时间；无文件时返回 0
 */
function getNewestMtime(root: string): number {
  const files = listDataFiles(root)
  if (files.length === 0) return 0
  return Math.max(...files.map(f => f.mtimeMs))
}

/**
 * 校验目标目录是否完整包含源目录的全部文件（路径 + 大小一致）
 */
function isCopyComplete(sourceRoot: string, targetRoot: string): boolean {
  const sourceFiles = listDataFiles(sourceRoot)
  if (sourceFiles.length === 0) return true
  if (!fs.existsSync(targetRoot)) return false

  const targetMap = new Map(
    listDataFiles(targetRoot).map(f => [f.rel, f.size])
  )
  return sourceFiles.every(f => targetMap.get(f.rel) === f.size)
}

/**
 * 安全删除目录（不存在则忽略）
 */
function rmDirIfExists(dir: string) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

/**
 * 在新 data 目录写入迁移标记
 */
function writeMigrationMarker(targetPath: string) {
  fs.mkdirSync(targetPath, { recursive: true })
  const markerPath = path.join(targetPath, MIGRATION_MARKER_NAME)
  const content = [
    `plugin=${pluginName}`,
    `migratedAt=${new Date().toISOString()}`,
    `target=${path.resolve(targetPath)}`,
    ''
  ].join('\n')
  fs.writeFileSync(markerPath, content, 'utf8')
}

/**
 * 在旧 data 目录写入迁移提示
 */
function writeMigrationNotice(targetPath: string) {
  const noticePath = path.join(legacyDataPath, MIGRATION_NOTICE_NAME)
  const content = [
    '【ZZZ-Plugin 数据迁移提示】',
    '',
    '插件数据目录已迁移至 Yunzai 根目录统一管理：',
    `  data/${pluginName}/`,
    '',
    '原有数据已完整复制到新目录，本旧目录仅保留备用。',
    '后续请在新目录管理插件数据；确认新目录数据无误后，可自行删除本旧目录（请勿单独删除本提示文件）。',
    '',
    '新目录绝对路径：',
    `  ${path.resolve(targetPath)}`,
    '',
    `迁移时间：${new Date().toLocaleString('zh-CN', { hour12: false })}`,
    ''
  ].join('\n')

  fs.mkdirSync(legacyDataPath, { recursive: true })
  fs.writeFileSync(noticePath, content, 'utf8')
}

/**
 * 将已确认的「新目录为准」状态落盘：补写标记与提示，不再覆盖新目录
 */
function adoptTargetAsAuthoritative(target: string, reason: string): boolean {
  try {
    writeMigrationMarker(target)
    writeMigrationNotice(target)
    logger.mark(`[${pluginName}] ${reason}，已保留新目录数据：${path.resolve(target)}`)
  } catch (error: any) {
    logger.error(`[${pluginName}] 写入迁移标记/提示失败：${error?.message || error}`)
  }
  setDataPath(target)
  return true
}

/**
 * 将插件根目录 data 迁移到 Yunzai 根目录 data/ZZZ-Plugin。
 * - 使用暂存目录复制，校验通过后再替换目标，保证中断可恢复
 * - 成功后不删除旧数据，仅写入提示文件与新目录标记
 * - 若提示被删但新目录已有标记，或新目录数据更新时间不早于旧目录，则不会用旧数据覆盖
 * - 失败时回退使用旧目录，避免本次启动读不到数据
 */
export function migrateLegacyData(): boolean {
  const target = defaultDataPath
  const noticePath = path.join(legacyDataPath, MIGRATION_NOTICE_NAME)
  const markerPath = path.join(target, MIGRATION_MARKER_NAME)
  const stagingPath = `${target}${STAGING_SUFFIX}`
  const incompletePath = `${target}${INCOMPLETE_SUFFIX}`
  const parentDir = path.dirname(target)

  // 已迁移完成（旧目录提示仍在）
  if (fs.existsSync(noticePath)) {
    try {
      if (!fs.existsSync(markerPath)) writeMigrationMarker(target)
    } catch {
      // 标记补写失败不影响使用新目录
    }
    setDataPath(target)
    return true
  }

  // 无旧数据，直接使用新目录
  if (!fs.existsSync(legacyDataPath)) {
    setDataPath(target)
    return true
  }

  const legacyFiles = listDataFiles(legacyDataPath)
  if (legacyFiles.length === 0) {
    setDataPath(target)
    return true
  }

  // 防呆主信号：新目录已有迁移标记 → 不覆盖，只补提示文件
  if (fs.existsSync(markerPath)) {
    return adoptTargetAsAuthoritative(target, '检测到新目录迁移标记（旧目录提示可能被人为单独删除）')
  }

  const targetFiles = listDataFiles(target)

  // 上次已成功替换目标但提示/标记未写入：补写即可
  if (isCopyComplete(legacyDataPath, target)) {
    return adoptTargetAsAuthoritative(target, '数据迁移提示已补写')
  }

  // 防呆兜底：新目录已有数据，且最近修改时间不早于旧目录 → 视为新目录在用，禁止回滚覆盖
  if (targetFiles.length > 0) {
    const targetMtime = getNewestMtime(target)
    const legacyMtime = getNewestMtime(legacyDataPath)
    if (targetMtime >= legacyMtime) {
      return adoptTargetAsAuthoritative(
        target,
        `检测到新目录数据较新或相同（mtime ${new Date(targetMtime).toISOString()} >= ${new Date(legacyMtime).toISOString()}），已跳过覆盖迁移`
      )
    }
  }

  try {
    fs.mkdirSync(parentDir, { recursive: true })

    // 清理上次中断留下的临时目录
    rmDirIfExists(stagingPath)
    rmDirIfExists(incompletePath)

    fs.cpSync(legacyDataPath, stagingPath, {
      recursive: true,
      filter: (src) => {
        const base = path.basename(src)
        return !isMigrationMetaName(base) && !isMigrationTempName(base)
      }
    })

    if (!isCopyComplete(legacyDataPath, stagingPath)) {
      throw new Error('暂存目录与源数据校验不一致')
    }

    // 先移走可能不完整的目标，再将暂存目录切换为正式目录
    if (fs.existsSync(target)) {
      fs.renameSync(target, incompletePath)
    }

    try {
      fs.renameSync(stagingPath, target)
    } catch (error) {
      // 切换失败则尽量恢复原目标目录
      if (!fs.existsSync(target) && fs.existsSync(incompletePath)) {
        fs.renameSync(incompletePath, target)
      }
      throw error
    }

    rmDirIfExists(incompletePath)

    if (!isCopyComplete(legacyDataPath, target)) {
      throw new Error('目标目录与源数据最终校验不一致')
    }

    writeMigrationMarker(target)
    writeMigrationNotice(target)
    setDataPath(target)
    logger.mark(`[${pluginName}] 插件数据已迁移至崽根目录 ${path.resolve(target)}`)
    return true
  } catch (error: any) {
    rmDirIfExists(stagingPath)
    logger.error(`[${pluginName}] 数据迁移失败，本次仍使用旧数据目录，将在下次启动重试：${error?.message || error}`)
    setDataPath(legacyDataPath)
    return false
  }
}
