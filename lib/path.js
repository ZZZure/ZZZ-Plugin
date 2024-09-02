import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前模块的 URL
const metaUrl = import.meta.url;

// 将 URL 转换为文件路径
const metaPath = fileURLToPath(new URL(metaUrl));

// 插件路径
export const pluginPath = path.join(metaPath, '../../');

// 插件名
export const pluginName = path.basename(pluginPath);

// apps 路径
export const appPath = path.join(pluginPath, 'apps');

// resources
export const resourcesPath = path.join(pluginPath, 'resources');

export const imageResourcesPath = path.join(resourcesPath, 'images');

export const dataResourcesPath = path.join(resourcesPath, 'data');

export const mapResourcesPath = path.join(resourcesPath, 'map');

// config 路径
export const configPath = path.join(pluginPath, 'config');

// 默认配置路径
export const defPath = path.join(pluginPath, 'defSet');

// data 路径
export const dataPath = path.join(pluginPath, 'data');
