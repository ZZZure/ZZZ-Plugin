import { configPath, dataPath, defPath, pluginName } from './path.js';
import chokidar from 'chokidar';
import YAML from 'yaml';
import path from 'path';
import fs from 'fs';
class Setting {
    defPath;
    configPath;
    defSet;
    config;
    dataPath;
    data;
    watcher;
    constructor() {
        this.defPath = defPath;
        this.defSet = {};
        this.configPath = configPath;
        this.config = {};
        this.dataPath = dataPath;
        this.data = {};
        this.watcher = { config: {}, defSet: {} };
        this.initCfg();
    }
    initCfg() {
        const files = fs
            .readdirSync(this.defPath)
            .filter(file => file.endsWith('.yaml'));
        if (!fs.existsSync(this.configPath)) {
            fs.mkdirSync(this.configPath);
        }
        for (const file of files) {
            if (!fs.existsSync(path.join(this.configPath, file))) {
                fs.copyFileSync(path.join(this.defPath, file), path.join(this.configPath, file));
            }
            this.watch(path.join(this.configPath, file), file.replace('.yaml', ''), 'config');
        }
    }
    merge() {
        const sets = {};
        const appsConfig = fs
            .readdirSync(this.defPath)
            .filter(file => file.endsWith('.yaml'));
        for (const appConfig of appsConfig) {
            const filename = appConfig.replace(/.yaml/g, '').trim();
            sets[filename] = this.getConfig(filename);
        }
        return sets;
    }
    analysis(config) {
        for (const key of Object.keys(config)) {
            this.setConfig(key, config[key]);
        }
    }
    getData(filepath, filename) {
        filename = `${filename}.yaml`;
        filepath = path.join(this.dataPath, filepath);
        try {
            if (!fs.existsSync(path.join(filepath, filename))) {
                return false;
            }
            return YAML.parse(fs.readFileSync(path.join(filepath, filename), 'utf8'));
        }
        catch (error) {
            logger.error(`[${pluginName}] [${filename}] 读取失败 ${error}`);
            return false;
        }
    }
    setData(filepath, filename, data) {
        filename = `${filename}.yaml`;
        filepath = path.join(this.dataPath, filepath);
        try {
            if (!fs.existsSync(filepath)) {
                fs.mkdirSync(filepath, { recursive: true });
            }
            fs.writeFileSync(path.join(filepath, filename), YAML.stringify(data), 'utf8');
            return true;
        }
        catch (error) {
            logger.error(`[${pluginName}] [${filename}] 写入失败 ${error}`);
            return false;
        }
    }
    getdefSet(app) {
        return this.getYaml(app, 'defSet');
    }
    getConfig(app) {
        return { ...this.getdefSet(app), ...this.getYaml(app, 'config') };
    }
    mergeConfigObjectArray(obj1, obj2) {
        for (const key in obj2) {
            if (Array.isArray(obj2[key]) && Array.isArray(obj1[key])) {
                const uniqueElements = new Set([...obj1[key], ...obj2[key]]);
                obj1[key] = [...uniqueElements];
            }
            else {
                obj1[key] = obj2[key];
            }
        }
        return obj1;
    }
    setConfig(app, obj) {
        const defSet = this.getdefSet(app);
        const config = this.getConfig(app);
        return this.setYaml(app, 'config', { ...defSet, ...config, ...obj });
    }
    setSingleConfig(app, key, value) {
        const defSet = this.getdefSet(app);
        const config = this.getConfig(app);
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            config[key] = { ...config[key], ...value };
        }
        else {
            config[key] = value;
        }
        return this.setYaml(app, 'config', { ...defSet, ...config });
    }
    addArrayleConfig(app, key, value) {
        const defSet = this.getdefSet(app);
        const config = this.getConfig(app);
        const list = (Array.isArray(config[key]) ? config[key] : []);
        list.push(value);
        config[key] = list;
        return this.setYaml(app, 'config', { ...defSet, ...config });
    }
    removeArrayleConfig(app, key, value) {
        const defSet = this.getdefSet(app);
        const config = this.getConfig(app);
        if (!config[key] || !Array.isArray(config[key])) {
            return false;
        }
        const list = config[key];
        config[key] = list.filter(item => item !== value);
        return this.setYaml(app, 'config', { ...defSet, ...config });
    }
    setYaml(app, type, Object) {
        const file = this.getFilePath(app, type);
        try {
            fs.writeFileSync(file, YAML.stringify(Object), 'utf8');
            return true;
        }
        catch (error) {
            logger.error(`[${app}] 写入失败 ${error}`);
            return false;
        }
    }
    getYaml(app, type) {
        const file = this.getFilePath(app, type);
        if (this[type][app])
            return this[type][app];
        this[type][app] = YAML.parse(fs.readFileSync(file, 'utf8'));
        this.watch(file, app, type);
        return this[type][app];
    }
    getFilePath(app, type) {
        const appFilename = `${app}.yaml`;
        if (type === 'defSet')
            return path.join(this.defPath, appFilename);
        else {
            try {
                if (!fs.existsSync(path.join(this.configPath, appFilename))) {
                    fs.copyFileSync(path.join(this.defPath, appFilename), path.join(this.configPath, appFilename));
                }
            }
            catch (error) {
                logger.error(`[${pluginName}]缺失默认文件[${app}]${error}`);
            }
            return path.join(this.configPath, `${app}.yaml`);
        }
    }
    watch(file, app, type = 'defSet') {
        if (this.watcher[type][app])
            return;
        const watcher = chokidar.watch(file);
        watcher.on('change', path => {
            delete this[type][app];
            logger.mark(`[${pluginName}][修改配置文件][${type}][${app}]`);
            this[`change_${app}`]?.();
        });
        this.watcher[type][app] = watcher;
    }
}
export default new Setting();
//# sourceMappingURL=settings.js.map