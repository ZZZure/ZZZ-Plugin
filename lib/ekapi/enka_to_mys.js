// enka_to_mys.js
// enka_to_mys.js
import {
    equip_data,
    weapon_data,
    partner_data,
    PartnerId2SkillParam // 确认已从 name_convert.js 导出
} from './name_convert.js';
import _ from 'lodash'; // 引入 lodash (如果需要 get 等方法)

// --- 日志和数据导入确认 ---
// logger.debug(`[enka_to_mys.js] 文件顶层: partner_data keys: ${Object.keys(partner_data || {}).length}`);
// logger.debug(`[enka_to_mys.js] 文件顶层: PartnerId2SkillParam keys: ${Object.keys(PartnerId2SkillParam || {}).length}`);
if (typeof PartnerId2SkillParam === 'undefined' || Object.keys(PartnerId2SkillParam || {}).length === 0) {
    console.warn("[enka_to_mys.js] 警告：PartnerId2SkillParam 未定义或为空，技能名称将使用默认值。");
    PartnerId2SkillParam = {}; // 确保它是个空对象以防万一
}

// --- 常量和映射定义 ---
const ID_TO_PROP_NAME = {
    '11101': '生命值', '11103': '生命值', '11102': '生命值百分比',
    '12101': '攻击力', '12103': '攻击力', '12102': '攻击力百分比',
    '13101': '防御力', '13103': '防御力', '13102': '防御力百分比',
    '12203': '冲击力', '20103': '暴击率', '21103': '暴击伤害',
    '31402': '异常掌控', '31403': '异常掌控',
    '31202': '异常精通', '31203': '异常精通',
    '23103': '穿透率', '23203': '穿透值',
    '30503': '能量自动回复', '30502': '能量自动回复', // 注意：ID_TO_PROP_NAME 中百分比能量回复的名字也是'能量自动回复'
    '31503': '物理伤害加成', '31603': '火属性伤害加成', '31703': '冰属性伤害加成',
    '31803': '雷属性伤害加成', '31903': '以太属性伤害加成',
};
// MysApi 返回的 Property ID 映射 (根据日志样本)
const MYSAPI_PROP_ID = {
    '生命值': 1, '攻击力': 2, '防御力': 3, '冲击力': 4, '暴击率': 5, '暴击伤害': 6,
    '异常掌控': 7, '异常精通': 8, '穿透率': 9, '能量自动回复': 11,
    '穿透值': 232, '物理伤害加成': 315, '火属性伤害加成': 316, '冰属性伤害加成': 317,
    '雷属性伤害加成': 318, '以太属性伤害加成': 319,
    // 百分比属性的 MysApi ID 未知，用 0 占位
    '生命值百分比': 0, '攻击力百分比': 0, '防御力百分比': 0,
};

const ID_TO_EN = {
    '11101': 'HpMax', '11103': 'HpBase', '11102': 'HpAdd',
    '12101': 'Attack', '12103': 'AttackBase', '12102': 'AttackAdd',
    '13101': 'Defence', '13103': 'DefenceBase', '13102': 'DefenceAdd',
    '12203': 'BreakStun', '20103': 'Crit', '21103': 'CritDmg',
    '31402': 'ElementAbnormalPower', '31403': 'ElementAbnormalPower',
    '31202': 'ElementMystery', '31203': 'ElementMystery',
    '23103': 'PenRate', '23203': 'PenDelta',
    '30503': 'SpRecover', '30502': 'SpRecover',
    '31503': 'PhysDmgBonus', '31603': 'FireDmgBonus', '31703': 'IceDmgBonus',
    '31803': 'ThunderDmgBonus', '31903': 'EtherDmgBonus',
};

const EN_TO_ZH = Object.fromEntries(Object.entries(ID_TO_EN).map(([k, v]) => [v, ID_TO_PROP_NAME[k]]));

const PERCENT_ID = Object.keys(ID_TO_PROP_NAME).filter(id => ID_TO_PROP_NAME[id].includes('百分比') || ['20103', '21103', '23103', '12203', '31503', '31603', '31703', '31803', '31903'].includes(id));
const PERCENT_NAME = [ 'HpAdd', 'AttackAdd', 'DefenceAdd', 'Crit', 'CritDmg', 'PenRate', 'BreakStun', 'PhysDmgBonus', 'FireDmgBonus', 'IceDmgBonus', 'ThunderDmgBonus', 'EtherDmgBonus', 'SpRecover'];
// 驱动器主属性每阶提升值 (单位：万分位) - 这些值需要根据游戏精确数据进行校准
const MAIN_PROP_VALUE_PER_TIER = {
    '11101': 3300, '11103': 3300, '11102': 474,  // HP Flat, Base, % (*10)
    '12101': 210,  '12103': 210,  '12102': 276,  // ATK Flat, Base, % (*10)
    '13101': 260,  '13103': 260,  '13102': 360,  // DEF Flat, Base, % (*10)
    '12203': 360,  // 冲击力 (*10)
    '20103': 360,  // 暴击率 (*10)
    '21103': 720,  // 暴击伤害 (*10)
    '31402': 45,   '31403': 45,   // 异常掌控
    '31202': 13,   '31203': 13,   // 异常精通
    '23103': 360,  // 穿透率 (*10)
    '23203': 36,   // 穿透值 (*10)
    '30503': 540,  '30502': 540,  // 能量回复 (*10)
    '31503': 450, '31603': 450, '31703': 450, '31803': 450, '31903': 450 // 伤害加成 (*10)
};
const ELEMENT_TO_EN = { '203': 'Thunder', '205': 'Ether', '202': 'Ice', '200': 'Phys', '201': 'Fire' };

// --- 辅助函数 ---
function _format_value_str(value, prop_id) {
    const idStr = String(prop_id);
    const name = ID_TO_PROP_NAME[idStr] || '';
    // 检查 ID 是否代表百分比或元素加成 (使用更精确的判断)
    const isPercentProp = idStr.endsWith('2') || ['20103', '21103', '23103', '12203', '31503', '31603', '31703', '31803', '31903'].includes(idStr);

    if (isPercentProp) {
        // Enka 的百分比值是 MYS 的 10 倍（例如 Enka 500 = MYS 50.0%）
        return (value / 10).toFixed(1) + '%';
    } else if (idStr === '30503') { // MysApi 能量回复是小数
        return (value / 100).toFixed(2);
    } else {
        return String(Math.floor(value)); // 非百分比取整
    }
}

function render_weapon_detail(weapon_meta, weapon_level, weapon_break_level) {
    if (!weapon_meta || weapon_meta.props_value === undefined || !weapon_meta.level || !weapon_meta.stars) {
        console.error("[enka_to_mys.js] 无效的武器元数据:", weapon_meta);
        return [0, 0];
    }
    const levelData = weapon_meta.level[String(weapon_level)];
    const starData = weapon_meta.stars[String(weapon_break_level)];
    if (!levelData || !starData) {
        console.error(`[enka_to_mys.js] 武器ID ${weapon_meta.id || '未知'} 缺少等级 (${weapon_level}) 或突破 (${weapon_break_level}) 数据`);
        return [0, 0];
    }
    let base_value = weapon_meta.props_value;
    base_value = base_value + base_value * ((levelData.Rate + starData.StarRate) / 10000);
    let rand_value = weapon_meta.rand_props_value || 0;
    if (rand_value > 0 && starData.RandRate) {
        rand_value = rand_value + rand_value * (starData.RandRate / 10000);
    } else {
        rand_value = 0;
    }
    // 返回未格式化的原始值 (万分位)
    return [Math.floor(base_value), Math.floor(rand_value)];
}

function _calculate_char_base_stat(base_val, growth_val, level_data, char_level, promotion_level, stat_key_in_promo) {
    let final_value = base_val;
    if (char_level > 1) {
        final_value += (char_level - 1) * growth_val / 10000;
    }
    const promoStr = String(promotion_level);
    if (level_data && level_data[promoStr] && level_data[promoStr][stat_key_in_promo] !== undefined) {
        final_value += level_data[promoStr][stat_key_in_promo];
    }
    return Math.floor(final_value);
}

function getSkillName(charId, skillIndex) {
    const charSkillsData = PartnerId2SkillParam?.[String(charId)];
    if (!charSkillsData) return `技能 ${skillIndex}`;
    for (const skillName in charSkillsData) {
        // 假设 PartnerId2SkillParam.json 中每个技能对象包含一个名为 'Index' 的字段
        if (Object.hasOwnProperty.call(charSkillsData, skillName) && charSkillsData[skillName] && charSkillsData[skillName].Index === skillIndex) {
            return skillName;
        }
    }
    return `技能 ${skillIndex}`;
}

// --- 主要转换函数 ---
export async function _enka_data_to_mys_data(enka_data) {
    if (!enka_data || !enka_data.PlayerInfo || !enka_data.PlayerInfo.ShowcaseDetail || !enka_data.PlayerInfo.ShowcaseDetail.AvatarList) {
        console.error("[enka_to_mys.js] 接收到无效的 enka_data 结构。");
        return [];
    }

    const uid = enka_data.uid;
    const result_list = [];

    for (const char of enka_data.PlayerInfo.ShowcaseDetail.AvatarList) {
        const char_id = String(char.Id);
        if (!partner_data[char_id]) {
            console.warn(`[enka_to_mys.js] 跳过角色 ID ${char_id}: 在 partner_data 中未找到数据。`);
            continue;
        }
        const _partner = partner_data[char_id];

        // --- 初始化接近 MysApi 原始结构的 result 对象 ---
        const result = {
            id: char.Id, level: char.Level, name_mi18n: _partner.name,
            full_name_mi18n: _partner.full_name, element_type: parseInt(_partner.ElementType),
            camp_name_mi18n: _partner.Camp, avatar_profession: parseInt(_partner.WeaponType),
            rarity: _partner.Rarity, // <<< 使用字符串 'S'/'A'
            rank: char.TalentLevel || 0, // 命座等级
            equip: [], weapon: null, properties: [], skills: [], ranks: [], // 初始化为空数组
            // --- MYS 特有字段占位符 ---
            icon_paths: { group_icon_path: '', hollow_icon_path: '' }, // 匹配 MysApi 结构
            role_vertical_painting_url: '', us_full_name: _partner.en_name || '',
            vertical_painting_color: '', skin_list: [], role_square_url: '',
            // is_chosen: false, // 如果需要
            // sub_element_type: 0, // 如果 ZZZAvatarInfo 需要
        };

        // --- 属性计算准备 ---
        const props = { HpBase: 0, AttackBase: 0, DefenceBase: 0, HpAdd: 0, AttackAdd: 0, DefenceAdd: 0, HpMax: 0, Attack: 0, Defence: 0 };
        Object.values(ID_TO_EN).forEach(enKey => { if (props[enKey] === undefined) props[enKey] = 0; });
        props.CritDmg = _partner.CritDamage || 0; // 单位: 万分位

        const baseStatsToCalc = {
            'HpMax': { base: _partner.HpMax, growth: _partner.HpGrowth, key: 'HpMax' },
            'Attack': { base: _partner.Attack, growth: _partner.AttackGrowth, key: 'Attack' },
            'Defence': { base: _partner.Defence, growth: _partner.DefenceGrowth, key: 'Defence' },
        };
        for (const [statName, statData] of Object.entries(baseStatsToCalc)) {
            if (statData.base !== undefined && statData.growth !== undefined) {
                const calculatedBase = _calculate_char_base_stat(
                    statData.base, statData.growth, _partner.Level,
                    char.Level, char.PromotionLevel, statData.key
                );
                const baseKey = statName.replace('Max', 'Base');
                props[baseKey] = calculatedBase;
            }
        }

        // --- 处理音擎驱动 (填充 result.equip) ---
        if (char.EquippedList && Array.isArray(char.EquippedList)) {
            for (const relic of char.EquippedList) {
                if (!relic || !relic.Equipment) continue;
                const _equip = relic.Equipment;
                const equip_id_str = String(_equip.Id);
                const suit_id = equip_id_str.slice(0, 3) + '00';
                const equip_meta = equip_data[suit_id];
                if (!equip_meta) continue;

                const relic_level = _equip.Level || 0;
                const relic_tier = Math.floor(relic_level / 3);

                // 构建 "原始" 驱动器对象 (接近 MysApi 结构)
                const raw_equip_obj = {
                    id: _equip.Id, level: relic_level,
                    equipment_type: relic.Slot, // 使用 MysApi 可能的字段名
                    name: equip_meta.equip_name || `驱动 ${relic.Slot}`,
                    rarity: 'S', // <<< 修改: 使用字符串 'S' (假设都是S级)
                    icon: '', // 占位符
                    equip_suit: {
                        suit_id: parseInt(suit_id), name: equip_meta.equip_name || "未知套装",
                        desc1: equip_meta.desc1 || "", desc2: equip_meta.desc2 || "",
                    },
                    main_properties: [], // <<< 修改: 初始化为主词条对象【数组】
                    properties: [],      // <<< 初始化为空数组
                };

                // 处理主词条 (构建接近 MysApi 的原始对象)
                if (_equip.MainPropertyList?.[0]) {
                    const main_prop = _equip.MainPropertyList[0];
                    const prop_id_str = String(main_prop.PropertyId);
                    const prop_zh_name = ID_TO_PROP_NAME[prop_id_str] || `未知(${prop_id_str})`;
                    const en_prop_name = ID_TO_EN[prop_id_str];
                    const base_value = main_prop.PropertyValue || 0;
                    const value_per_tier = MAIN_PROP_VALUE_PER_TIER[prop_id_str] !== undefined ? MAIN_PROP_VALUE_PER_TIER[prop_id_str] : 0;
                    // 假设 Enka 返回值已经是 MYS 需要的 10 倍后的值 (或者 MYS 处理的就是万分位?) - 保持原值累加
                    const total_main_value_raw = base_value + (value_per_tier * relic_tier);

                    if (en_prop_name && props[en_prop_name] !== undefined) { props[en_prop_name] += total_main_value_raw; }
                    else if (prop_id_str === '11102') props.HpAdd += total_main_value_raw;
                    // ... (其他累加) ...
                    else if (prop_id_str === '13101') props.Defence += total_main_value_raw;

                    // <<< 修改：将主词条对象【放入数组】 >>>
                    raw_equip_obj.main_properties.push({
                        property_name: prop_zh_name,
                        property_id: main_prop.PropertyId,
                        base: "", add: "", // MYS可能为空
                        final: _format_value_str(total_main_value_raw, prop_id_str) // 格式化显示值
                    });
                }

                // 处理副词条 (构建接近 MysApi 的原始对象)
                if (_equip.RandomPropertyList && Array.isArray(_equip.RandomPropertyList)) {
                    for (const prop of _equip.RandomPropertyList) {
                        const prop_id_str = String(prop.PropertyId);
                        const prop_zh_name = ID_TO_PROP_NAME[prop_id_str] || `未知(${prop_id_str})`;
                        const en_prop_name = ID_TO_EN[prop_id_str];
                        const prop_level = prop.PropertyLevel || 1;
                        const base_value_per_level = prop.PropertyValue || 0;
                        const total_substat_value_raw = base_value_per_level * prop_level; // 保持原始万分位值

                         if (en_prop_name && props[en_prop_name] !== undefined) { props[en_prop_name] += total_substat_value_raw; }
                         else if (prop_id_str === '11102') props.HpAdd += total_substat_value_raw;
                         // ... (其他累加) ...
                         else if (prop_id_str === '13101') props.Defence += total_substat_value_raw;

                        raw_equip_obj.properties.push({
                            property_name: prop_zh_name, property_id: prop.PropertyId,
                            base: "", add: "", final: _format_value_str(total_substat_value_raw, prop_id_str),
                        });
                    }
                }
                result.equip.push(raw_equip_obj);
            }
        }

        // --- 处理武器 ---
        if (char.Weapon && char.Weapon.Id) {
            const weapon_id = String(char.Weapon.Id);
            const _weapon_meta = weapon_data[weapon_id];

            if (_weapon_meta) {
                const weapon_level = char.Weapon.Level || 1;
                const weapon_star = char.Weapon.UpgradeLevel || 0;
                const weapon_break_level = char.Weapon.BreakLevel || 0;

                const [base_stat_value_raw, rand_stat_value_raw] = render_weapon_detail(
                    _weapon_meta, weapon_level, String(weapon_break_level)
                );

                // 累加属性 (使用 raw 值)
                const base_prop_id_str = String(_weapon_meta.props_id);
                const base_en_prop = ID_TO_EN[base_prop_id_str];
                if (base_en_prop && props[base_en_prop] !== undefined) { props[base_en_prop] += base_stat_value_raw; }
                else if (base_prop_id_str === '11102') props.HpAdd += base_stat_value_raw;
                // ... (其他累加) ...

                if (_weapon_meta.rand_props_id && rand_stat_value_raw > 0) {
                     const rand_prop_id_str = String(_weapon_meta.rand_props_id);
                     const rand_en_prop = ID_TO_EN[rand_prop_id_str];
                    if (rand_en_prop && props[rand_en_prop] !== undefined) { props[rand_en_prop] += rand_stat_value_raw; }
                    else if (rand_prop_id_str === '11102') props.HpAdd += rand_stat_value_raw;
                    // ... (其他累加) ...
                }

                // 构建 "原始" 武器对象
                result.weapon = {
                    id: char.Weapon.Id, level: weapon_level, star: weapon_star + 1,
                    promote_level: weapon_break_level,
                    name: _weapon_meta.name || "未知武器",
                    rarity: _weapon_meta.rarity, // <<< 使用字符串 'S' 或 'A'
                    icon: '',
                    talent_content: _weapon_meta.talents?.[String(weapon_star + 1)]?.Desc || "", // MysApi 可能叫 talent_content
                    main_properties: [], // <<< 修改: 初始化为主属性对象【数组】
                    properties: [] // <<< 初始化为空数组
                };

                // 填充 "原始" 主属性对象
                const main_prop_obj = {
                    property_name: _weapon_meta.props_name || ID_TO_PROP_NAME[base_prop_id_str] || `未知(${base_prop_id_str})`,
                    property_id: _weapon_meta.props_id, base: "", add: "",
                    final: _format_value_str(base_stat_value_raw, base_prop_id_str) // 格式化
                };
                result.weapon.main_properties.push(main_prop_obj); // <<< 修改：放入数组

                // 填充 "原始" 副属性对象
                if (_weapon_meta.rand_props_id && rand_stat_value_raw > 0) {
                    const rand_prop_id_str = String(_weapon_meta.rand_props_id);
                    result.weapon.properties.push({
                        property_name: _weapon_meta.rand_props_name || ID_TO_PROP_NAME[rand_prop_id_str] || `未知(${rand_prop_id_str})`,
                        property_id: _weapon_meta.rand_props_id, base: "", add: "",
                        final: _format_value_str(rand_stat_value_raw, rand_prop_id_str) // 格式化
                    });
                }
            }
        }

        // --- 最终属性计算 ---
        const final_Hp = (props.HpBase || 0) * (1 + (props.HpAdd || 0) / 10000) + (props.HpMax || 0);
        const final_Attack = (props.AttackBase || 0) * (1 + (props.AttackAdd || 0) / 10000) + (props.Attack || 0);
        const final_Defence = (props.DefenceBase || 0) * (1 + (props.DefenceAdd || 0) / 10000) + (props.Defence || 0);

        props.HpMax = Math.floor(final_Hp);
        props.Attack = Math.floor(final_Attack);
        props.Defence = Math.floor(final_Defence);
        delete props.HpBase; delete props.HpAdd; delete props.AttackBase;
        delete props.AttackAdd; delete props.DefenceBase; delete props.DefenceAdd;

        const char_element_en = ELEMENT_TO_EN[_partner.ElementType];
        const element_bonus_keys = ['PhysDmgBonus', 'FireDmgBonus', 'IceDmgBonus', 'ThunderDmgBonus', 'EtherDmgBonus'];
        for (const key of element_bonus_keys) {
             if (props.hasOwnProperty(key)) {
                 if (props[key] === 0) { delete props[key]; }
                 else if (key !== `${char_element_en}DmgBonus` && key !== 'PhysDmgBonus') { delete props[key]; }
             }
        }

        // --- 格式化最终属性面板 (填充 result.properties 数组，使用 MysApi ID) ---
        result.properties = [];
        const ensurePropertyExists = (propName, propId, defaultValue = '0') => {
            if (!result.properties.find(p => p.property_id === propId)) {
                result.properties.push({ property_name: propName, property_id: propId, base: "", add: "", final: defaultValue });
            }
        };

        for (const [prop_en, prop_value] of Object.entries(props)) {
            if (prop_value === 0 && !['CritDmg'].includes(prop_en)) continue;
            const prop_zh = EN_TO_ZH[prop_en];
            if (!prop_zh) continue;

            const prop_id_mys = MYSAPI_PROP_ID[prop_zh];
            const current_prop_id = Object.keys(ID_TO_EN).find(k => ID_TO_EN[k] === prop_en); // 获取当前属性的 Enka ID

            if (!prop_id_mys && prop_zh !== '生命值百分比' && prop_zh !== '攻击力百分比' && prop_zh !== '防御力百分比') {
                console.warn(`[enka_to_mys.js] 属性 ${prop_zh} 缺少 MysApi ID 映射`);
                ensurePropertyExists(prop_zh, 0, _format_value_str(prop_value, current_prop_id));
                continue;
            }

            const final_value_str = _format_value_str(prop_value, current_prop_id);

            ensurePropertyExists(prop_zh, prop_id_mys || 0, final_value_str);
        }

        // 补充基础属性
        ensurePropertyExists('生命值', 1, _format_value_str(props.HpMax || 0, '11101'));
        ensurePropertyExists('攻击力', 2, _format_value_str(props.Attack || 0, '12101'));
        ensurePropertyExists('防御力', 3, _format_value_str(props.Defence || 0, '13101'));
        ensurePropertyExists('冲击力', 4, _format_value_str(props.BreakStun || 0, '12203'));
        ensurePropertyExists('暴击率', 5, props.Crit > 0 ? _format_value_str(props.Crit, '20103') : '5.0%');
        ensurePropertyExists('暴击伤害', 6, props.CritDmg > 0 ? _format_value_str(props.CritDmg, '21103') : '50.0%');
        ensurePropertyExists('异常掌控', 7, _format_value_str(props.ElementAbnormalPower || 0, '31403'));
        ensurePropertyExists('异常精通', 8, _format_value_str(props.ElementMystery || 0, '31203'));
        ensurePropertyExists('穿透率', 9, props.PenRate > 0 ? _format_value_str(props.PenRate, '23103') : '0.0%');
        ensurePropertyExists('能量自动回复', 11, props.SpRecover > 0 ? _format_value_str(props.SpRecover, '30503') : '1.20');
        ensurePropertyExists('穿透值', 232, _format_value_str(props.PenDelta || 0, '23203'));

        const elementDmgKey = `${ELEMENT_TO_EN[_partner.ElementType]}DmgBonus`;
        const elementDmgZh = EN_TO_ZH[elementDmgKey];
        const elementDmgIdMys = MYSAPI_PROP_ID[elementDmgZh];
        if(elementDmgZh && elementDmgIdMys) {
            const elementDmgEnkaId = Object.keys(ID_TO_EN).find(k => ID_TO_EN[k] === elementDmgKey);
            ensurePropertyExists(elementDmgZh, elementDmgIdMys, props[elementDmgKey] > 0 ? _format_value_str(props[elementDmgKey], elementDmgEnkaId) : '0.0%');
        }
        ensurePropertyExists('物理伤害加成', 315, props['PhysDmgBonus'] > 0 ? _format_value_str(props['PhysDmgBonus'], '31503') : '0.0%');

        result.properties.sort((a, b) => a.property_id - b.property_id);


        // --- 处理技能 (填充 result.skills, 对齐 MysApi 结构) ---
        if (char.SkillLevelList && Array.isArray(char.SkillLevelList)) {
             for (const skill of char.SkillLevelList) {
                 result.skills.push({
                     level: skill.Level,
                     skill_type: skill.Index, // <<< 使用 skill_type 对齐 MysApi
                     items: [], // <<< 添加空的 items 数组
                 });
             }
        }

        // --- 处理命座 (填充 result.ranks, 对齐 MysApi 结构) ---
        result.ranks = [];
        for (let i = 1; i <= 6; i++) {
             result.ranks.push({
                 id: i, name: `影 ${i}`, desc: '', pos: i, is_unlocked: i <= result.rank,
             });
        }

        result_list.push(result);
    }

    logger.debug(`[enka_to_mys.js] 成功转换 ${result_list.length} 个角色的数据`);
    return result_list;
}
