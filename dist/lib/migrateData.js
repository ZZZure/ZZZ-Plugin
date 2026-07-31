import { defaultDataPath, legacyDataPath, pluginName, setDataPath } from './path.js';
import path from 'path';
import fs from 'fs';
export const MIGRATION_NOTICE_NAME = '【重要】数据已迁移.txt';
export const MIGRATION_MARKER_NAME = '.zzz-data-migrated';
const STAGING_SUFFIX = '.__migrating__';
const INCOMPLETE_SUFFIX = '.__incomplete__';
function isMigrationTempName(name) {
    return name.endsWith(STAGING_SUFFIX) || name.endsWith(INCOMPLETE_SUFFIX);
}
function isMigrationMetaName(name) {
    return name === MIGRATION_NOTICE_NAME || name === MIGRATION_MARKER_NAME;
}
function listDataFiles(root) {
    const result = [];
    if (!fs.existsSync(root))
        return result;
    const walk = (dir) => {
        for (const name of fs.readdirSync(dir)) {
            if (isMigrationMetaName(name) || isMigrationTempName(name))
                continue;
            const full = path.join(dir, name);
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                walk(full);
            }
            else if (stat.isFile()) {
                result.push({
                    rel: path.relative(root, full),
                    size: stat.size,
                    mtimeMs: stat.mtimeMs
                });
            }
        }
    };
    walk(root);
    return result.sort((a, b) => a.rel.localeCompare(b.rel));
}
function getNewestMtime(root) {
    const files = listDataFiles(root);
    if (files.length === 0)
        return 0;
    return Math.max(...files.map(f => f.mtimeMs));
}
function isCopyComplete(sourceRoot, targetRoot) {
    const sourceFiles = listDataFiles(sourceRoot);
    if (sourceFiles.length === 0)
        return true;
    if (!fs.existsSync(targetRoot))
        return false;
    const targetMap = new Map(listDataFiles(targetRoot).map(f => [f.rel, f.size]));
    return sourceFiles.every(f => targetMap.get(f.rel) === f.size);
}
function rmDirIfExists(dir) {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}
function writeMigrationMarker(targetPath) {
    fs.mkdirSync(targetPath, { recursive: true });
    const markerPath = path.join(targetPath, MIGRATION_MARKER_NAME);
    const content = [
        `plugin=${pluginName}`,
        `migratedAt=${new Date().toISOString()}`,
        `target=${path.resolve(targetPath)}`,
        ''
    ].join('\n');
    fs.writeFileSync(markerPath, content, 'utf8');
}
function writeMigrationNotice(targetPath) {
    const noticePath = path.join(legacyDataPath, MIGRATION_NOTICE_NAME);
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
    ].join('\n');
    fs.mkdirSync(legacyDataPath, { recursive: true });
    fs.writeFileSync(noticePath, content, 'utf8');
}
function adoptTargetAsAuthoritative(target, reason) {
    try {
        writeMigrationMarker(target);
        writeMigrationNotice(target);
        logger.mark(`[${pluginName}] ${reason}，已保留新目录数据：${path.resolve(target)}`);
    }
    catch (error) {
        logger.error(`[${pluginName}] 写入迁移标记/提示失败：${error?.message || error}`);
    }
    setDataPath(target);
    return true;
}
export function migrateLegacyData() {
    const target = defaultDataPath;
    const noticePath = path.join(legacyDataPath, MIGRATION_NOTICE_NAME);
    const markerPath = path.join(target, MIGRATION_MARKER_NAME);
    const stagingPath = `${target}${STAGING_SUFFIX}`;
    const incompletePath = `${target}${INCOMPLETE_SUFFIX}`;
    const parentDir = path.dirname(target);
    if (fs.existsSync(noticePath)) {
        try {
            if (!fs.existsSync(markerPath))
                writeMigrationMarker(target);
        }
        catch {
        }
        setDataPath(target);
        return true;
    }
    if (!fs.existsSync(legacyDataPath)) {
        setDataPath(target);
        return true;
    }
    const legacyFiles = listDataFiles(legacyDataPath);
    if (legacyFiles.length === 0) {
        setDataPath(target);
        return true;
    }
    if (fs.existsSync(markerPath)) {
        return adoptTargetAsAuthoritative(target, '检测到新目录迁移标记（旧目录提示可能被人为单独删除）');
    }
    const targetFiles = listDataFiles(target);
    if (isCopyComplete(legacyDataPath, target)) {
        return adoptTargetAsAuthoritative(target, '数据迁移提示已补写');
    }
    if (targetFiles.length > 0) {
        const targetMtime = getNewestMtime(target);
        const legacyMtime = getNewestMtime(legacyDataPath);
        if (targetMtime >= legacyMtime) {
            return adoptTargetAsAuthoritative(target, `检测到新目录数据较新或相同（mtime ${new Date(targetMtime).toISOString()} >= ${new Date(legacyMtime).toISOString()}），已跳过覆盖迁移`);
        }
    }
    try {
        fs.mkdirSync(parentDir, { recursive: true });
        rmDirIfExists(stagingPath);
        rmDirIfExists(incompletePath);
        fs.cpSync(legacyDataPath, stagingPath, {
            recursive: true,
            filter: (src) => {
                const base = path.basename(src);
                return !isMigrationMetaName(base) && !isMigrationTempName(base);
            }
        });
        if (!isCopyComplete(legacyDataPath, stagingPath)) {
            throw new Error('暂存目录与源数据校验不一致');
        }
        if (fs.existsSync(target)) {
            fs.renameSync(target, incompletePath);
        }
        try {
            fs.renameSync(stagingPath, target);
        }
        catch (error) {
            if (!fs.existsSync(target) && fs.existsSync(incompletePath)) {
                fs.renameSync(incompletePath, target);
            }
            throw error;
        }
        rmDirIfExists(incompletePath);
        if (!isCopyComplete(legacyDataPath, target)) {
            throw new Error('目标目录与源数据最终校验不一致');
        }
        writeMigrationMarker(target);
        writeMigrationNotice(target);
        setDataPath(target);
        logger.mark(`[${pluginName}] 插件数据已迁移至崽根目录 ${path.resolve(target)}`);
        return true;
    }
    catch (error) {
        rmDirIfExists(stagingPath);
        logger.error(`[${pluginName}] 数据迁移失败，本次仍使用旧数据目录，将在下次启动重试：${error?.message || error}`);
        setDataPath(legacyDataPath);
        return false;
    }
}
//# sourceMappingURL=migrateData.js.map