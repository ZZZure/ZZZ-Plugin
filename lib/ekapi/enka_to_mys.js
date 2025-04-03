
import {
    equip_data,
    weapon_data,
    partner_data,
    PartnerId2SkillParam,
    get_char_circle_icon_url // Uses avatars.json via name_convert.js
} from './name_convert.js';
import _ from 'lodash';





if (typeof partner_data === 'undefined' || Object.keys(partner_data || {}).length === 0) { logger.error("[enka_to_mys.js] CRITICAL ERROR: partner_data is undefined or empty!"); }
if (typeof PartnerId2SkillParam === 'undefined') { PartnerId2SkillParam = {}; logger.warn("[enka_to_mys.js] WARNING: PartnerId2SkillParam is undefined."); }
if (typeof equip_data === 'undefined') { equip_data = {}; logger.warn("[enka_to_mys.js] WARNING: equip_data is undefined."); }
if (typeof weapon_data === 'undefined') { weapon_data = {}; logger.warn("[enka_to_mys.js] WARNING: weapon_data is undefined."); }




const ID_TO_PROP_NAME = {
    '11101': '生命值', '11103': '生命值', '11102': '生命值百分比', '12101': '攻击力', '12103': '攻击力', '12102': '攻击力百分比',
    '13101': '防御力', '13103': '防御力', '13102': '防御力百分比', '12203': '冲击力', '20103': '暴击率', '21103': '暴击伤害',
    '31402': '异常掌控', '31403': '异常掌控', '31202': '异常精通', '31203': '异常精通', '23103': '穿透率', '23203': '穿透值',
    '30503': '能量自动回复', '30502': '能量自动回复', '31503': '物理伤害加成', '31603': '火属性伤害加成', '31703': '冰属性伤害加成',
    '31803': '雷属性伤害加成', '31903': '以太属性伤害加成', '12202': '冲击力', // Correcting ID 12202 based on sample equip[5] main stat
};
const MYSAPI_PROP_ID = {
    '生命值': 1, '攻击力': 2, '防御力': 3, '冲击力': 4, '暴击率': 5, '暴击伤害': 6, '异常掌控': 7, '异常精通': 8,
    '穿透率': 9, '能量自动回复': 11, // MyS uses 11 for SpRecover
    '穿透值': 232, '物理伤害加成': 315, '火属性伤害加成': 316, '冰属性伤害加成': 317, '雷属性伤害加成': 318, '以太属性伤害加成': 319,
    '生命值百分比': 0, '攻击力百分比': 0, '防御力百分比': 0, // Keep 0 for filtering in panel
};
const ID_TO_EN = {
    '11101': 'HpMax', '11103': 'HpBase', '11102': 'HpAdd', '12101': 'Attack', '12103': 'AttackBase', '12102': 'AttackAdd',
    '13101': 'Defence', '13103': 'DefenceBase', '13102': 'DefenceAdd', '12203': 'BreakStun', // Flat Impact from Enka? MyS panel uses ID 4
    '20103': 'Crit', '21103': 'CritDmg', '31402': 'ElementAbnormalPower', '31403': 'ElementAbnormalPower',
    '31202': 'ElementMystery', '31203': 'ElementMystery', '23103': 'PenRate', '23203': 'PenDelta',
    '30503': 'SpRecover', '30502': 'SpRecover', '31503': 'PhysDmgBonus', '31603': 'FireDmgBonus', '31703': 'IceDmgBonus',
    '31803': 'ThunderDmgBonus', '31903': 'EtherDmgBonus',
    '12202': 'BreakStunPercent',
};
const EN_TO_ZH = {};
for (const id in ID_TO_EN) { if (ID_TO_PROP_NAME[id]) { EN_TO_ZH[ID_TO_EN[id]] = ID_TO_PROP_NAME[id]; } }
EN_TO_ZH['HpAdd'] = '生命值百分比'; EN_TO_ZH['AttackAdd'] = '攻击力百分比'; EN_TO_ZH['DefenceAdd'] = '防御力百分比';
EN_TO_ZH['BreakStunPercent'] = '冲击力';

const MAIN_PROP_BASE_INCREASE = { /* ... Keep values ... */
    '11101': 330, '11103': 330, '11102': 47.4, '12101': 47.4, '12103': 47.4, '12102': 450, '13101': 27.6, '13103': 27.6,
    '13102': 720, '12203': 270, '20103': 360, '21103': 720, '31402': 450, '31403': 450, '31202': 13, '31203': 13,
    '23103': 360, '23203': 36, '30503': 900, '30502': 900, '31503': 450, '31603': 450, '31703': 450, '31803': 450,
    '31903': 450, '12202': 180, // Assign base increase for ID 12202 (Impact %), e.g., 1.8% per tier? Adjust as needed
};
const PERCENT_ID_LIST = Object.keys(ID_TO_PROP_NAME).filter(id => // IDs formatted as percent
    ID_TO_PROP_NAME[id]?.includes('百分比') || ID_TO_PROP_NAME[id]?.includes('加成') ||
    ['20103', '21103', '23103', '12203', '30502', '12202'].includes(id) // Explicitly add IDs known to be %
);
const ELEMENT_TO_EN = { '203': 'Thunder', '205': 'Ether', '202': 'Ice', '200': 'Phys', '201': 'Fire' };

function formatEquipWeaponPropValue(value, prop_id) {
    const idStr = String(prop_id);
    const isPercentProp = PERCENT_ID_LIST.includes(idStr);
    const numericValue = Number(value);
    if (value === undefined || value === null || isNaN(numericValue)) { return isPercentProp ? '0.0%' : '0'; }
    try {
        if (isPercentProp) { return (numericValue / 100).toFixed(1) + '%'; }
        else { return String(Math.floor(numericValue)); } // No special ER formatting for equips
    } catch (e) { logger.error(`Error formatting E/W prop value ${value} for ${prop_id}:`, e); return '0'; }
}

/**
 * Calculates final weapon base and random stat values (raw, 1/10000 unit).
 * @param {object} weapon_meta Metadata for the weapon.
 * @param {number} weapon_level Current weapon level.
 * @param {string} weapon_break_level Current weapon break/ascension level (as string).
 * @returns {Array<number>} [calculated_base_value_raw, calculated_rand_value_raw]
 */
function render_weapon_detail(weapon_meta, weapon_level, weapon_break_level) {
    if (!weapon_meta || weapon_meta.props_value === undefined || !weapon_meta.level || !weapon_meta.stars) {
        logger.warn(`[enka_to_mys.js][render_weapon_detail] Invalid weapon metadata provided.`);
        return [0, 0]; // Return iterable default
    }
    const levelData = weapon_meta.level?.[String(weapon_level)];
    const starData = weapon_meta.stars?.[String(weapon_break_level)]; // Use break level as string key
    if (!levelData || !starData) {
         logger.warn(`[enka_to_mys.js][render_weapon_detail] Missing level/break data for weapon ${weapon_meta.id || 'Unknown'}. Lvl:${weapon_level}, Break:${weapon_break_level}`);
        return [0, 0]; // Return iterable default
    }

    let base_value = Number(weapon_meta.props_value) || 0;
    base_value = base_value + base_value * (((Number(levelData.Rate) || 0) + (Number(starData.StarRate) || 0)) / 10000);

    let rand_value = Number(weapon_meta.rand_props_value) || 0;
    if (rand_value > 0 && starData.RandRate !== undefined) {
        rand_value = rand_value + rand_value * ((Number(starData.RandRate) || 0) / 10000);
    } else {
        rand_value = 0;
    }
    // Ensure it always returns an array of two numbers
    return [Math.floor(base_value), Math.floor(rand_value)];
}

/**
 * Calculates character base stat (HP, ATK, DEF) considering level, growth, and promotions.
 * @returns {number} Calculated base stat (floored).
 */
function _calculate_char_base_stat(base_val = 0, growth_val = 0, level_data, extra_level_data, char_level, promotion_level, stat_key_in_promo, extra_key_id) {
    let final_value = Number(base_val) || 0;
    char_level = Number(char_level) || 1;
    growth_val = Number(growth_val) || 0;

    if (char_level > 1) { final_value += (char_level - 1) * growth_val / 10000; }

    const promoStr = String(promotion_level);
    // Add promotion base stat increase
    if (level_data?.[promoStr]?.[stat_key_in_promo] !== undefined) {
        final_value += Number(level_data[promoStr][stat_key_in_promo]) || 0;
    }
    // Add extra level stat increase (using lodash get for safety)
    if (char_level > 10 && extra_key_id && extra_level_data?.[promoStr]?.Extra) {
        // Ensure extra_key_id is used correctly (might need to be string)
        const extraValue = _.get(extra_level_data[promoStr], ['Extra', String(extra_key_id), 'Value'], 0);
        final_value += Number(extraValue) || 0;
    }
    return Math.floor(final_value);
}

function formatFinalPanelPropValue(value, prop_id) {
     const idStr = String(prop_id);
     const isPercentProp = PERCENT_ID_LIST.includes(idStr);
     const numericValue = Number(value);
     if (value === undefined || value === null || isNaN(numericValue)) { return isPercentProp ? '0.0%' : '0'; }

     try {
         if (isPercentProp) { return (numericValue / 100).toFixed(1) + '%'; }
         else if (idStr === '30503' || idStr === '30502') { return (numericValue / 100).toFixed(2); } // ER specific
         else { return String(Math.floor(numericValue)); }
     } catch (e) { logger.error(`Error formatting Final prop value ${value} for ${prop_id}:`, e); return '0'; }
}




// --- Main Conversion Function ---
export async function _enka_data_to_mys_data(enka_data) {
    if (!enka_data?.PlayerInfo?.ShowcaseDetail?.AvatarList || !Array.isArray(enka_data.PlayerInfo.ShowcaseDetail.AvatarList)) {
        logger.error("[enka_to_mys.js] Invalid enka_data structure."); return [];
    }

    const uid = enka_data.uid;
    const result_list = [];

    for (const char of enka_data.PlayerInfo.ShowcaseDetail.AvatarList) {
        try {
            if (!char || typeof char.Id === 'undefined') { logger.warn("[enka_to_mys.js] Skipping invalid character entry."); continue; }
            const char_id = String(char.Id);
            const _partner = partner_data[char_id];
            if (!_partner) { logger.warn(`[enka_to_mys.js] Skipping char ID ${char_id}: Data missing.`); continue; }
            logger.debug(`[enka_to_mys.js] Processing char: ${char_id} (${_partner.name || '?'})`);

            const characterIconUrl = get_char_circle_icon_url(char_id) ?? '';
            // Log if URL generation failed, but use the (potentially empty) result
            if (!characterIconUrl && _partner) { // Only warn if partner data exists but URL failed
                logger.warn(`[enka_to_mys.js] Char ID ${char_id}: Could not generate icon URL.`);
            }

            // Initialize Result Object matching the target MyS format
            const result = {
                id: char.Id,
                level: char.Level || 1,
                name_mi18n: _partner.name ?? `角色${char_id}`,
                full_name_mi18n: _partner.full_name ?? _partner.name ?? `角色${char_id}`,
                element_type: parseInt(_partner.ElementType) || 0,
                sub_element_type: parseInt(_partner.sub_element_type) || 0, // Default 0 if missing
                camp_name_mi18n: _partner.Camp ?? '?',
                avatar_profession: parseInt(_partner.WeaponType) || 0,
                rarity: _partner.Rarity ?? 'A', // Ensure 'S'/'A'
                group_icon_path: characterIconUrl, // Use generated Enka URL or ''
                hollow_icon_path: characterIconUrl, // Use generated Enka URL or ''
                equip: [],
                weapon: null,
                properties: [], // Final display panel
                skills: [],     // Skill details
                rank: char.TalentLevel || 0, // Constellation level from Enka
                ranks: [],      // Constellation details
            };

            // --- Stat Calculation ---
            const props = {}; // Accumulator for raw stats
            Object.values(ID_TO_EN).forEach(enKey => { props[enKey] = 0; });
            props.CritDmg = _partner.CritDamage || 5000;
            props.Crit = _partner.CritRate || 500;
            const NAME_TO_ID = Object.fromEntries(Object.entries(EN_TO_ZH).map(([k, v]) => [v, Object.keys(ID_TO_EN).find(id => ID_TO_EN[id] === k)]));
            const baseStatsToCalc = {
                'HpMax': { base: _partner.HpMax, growth: _partner.HpGrowth, key: 'HpMax', extraKeyId: NAME_TO_ID['生命值'] },
                'Attack': { base: _partner.Attack, growth: _partner.AttackGrowth, key: 'Attack', extraKeyId: NAME_TO_ID['攻击力'] },
                'Defence': { base: _partner.Defence, growth: _partner.DefenceGrowth, key: 'Defence', extraKeyId: NAME_TO_ID['防御力'] },
            };
            for (const [statName, statData] of Object.entries(baseStatsToCalc)) {
                 if (statData.base !== undefined && statData.growth !== undefined) {
                     const calculatedBase = _calculate_char_base_stat(statData.base, statData.growth, _partner.Level, _partner.ExtraLevel, char.Level, char.PromotionLevel, statData.key, statData.extraKeyId);
                     props[statName.replace('Max', 'Base')] = calculatedBase;
                 } else { logger.warn(` > Missing base/growth data for ${statName} ID ${char_id}`); }
            }
            props.HpMax += props.HpBase ?? 0; props.Attack += props.AttackBase ?? 0; props.Defence += props.DefenceBase ?? 0;


            // --- Process Equipment (Relics) ---
            if (char.EquippedList && Array.isArray(char.EquippedList)) {
                for (const relic of char.EquippedList) {
                    if (!relic?.Equipment) continue;
                    const _equip = relic.Equipment;
                    const equip_id_str = String(_equip.Id);
                    const suit_id = equip_id_str.slice(0, 3) + '00';
                    const equip_meta = equip_data[suit_id];
                    if (!equip_meta) { logger.warn(`[enka_to_mys.js] Relic suit metadata missing: ${suit_id}`); continue; }

                    const relic_level = _equip.Level || 0;
                    // *** Initialize matching MyS structure ***
                    const raw_equip_obj = {
                        id: _equip.Id, level: relic_level,
                        name: equip_meta.equip_name ? `${equip_meta.equip_name}[${relic.Slot}]` : `驱动 [${relic.Slot}]`, // Match name format [Slot]
                        icon: equip_meta.IconPath ?? '', // Add icon path if available in meta
                        rarity: equip_meta.Rarity ?? 'S',
                        properties: [],      // Substats go here
                        main_properties: [], // Main stat goes here
                        equip_suit: {
                            suit_id: parseInt(suit_id),
                            name: equip_meta.equip_name || "?",
                            own: 0, // Placeholder, needs logic to count owned pieces
                            desc1: equip_meta.desc1 || "",
                            desc2: equip_meta.desc2 || "",
                        },
                        equipment_type: relic.Slot, // Slot number
                    };

                    // Process Main Stat -> PUSH TO main_properties
                    if (_equip.MainPropertyList?.[0]) {
                        const main_prop = _equip.MainPropertyList[0];
                        const prop_id_str = String(main_prop.PropertyId);
                        const prop_zh_name = ID_TO_PROP_NAME[prop_id_str];
                        const en_prop_name = ID_TO_EN[prop_id_str];

                        if (prop_zh_name && en_prop_name) {
                            const base_value = main_prop.PropertyValue || 0;
                            const increase_per_tier = MAIN_PROP_BASE_INCREASE[prop_id_str] ?? 0;
                            const relic_tier = Math.floor(relic_level / 3);
                            const total_main_value_raw = base_value + increase_per_tier * relic_tier;

                            if (props[en_prop_name] !== undefined) { props[en_prop_name] += total_main_value_raw; }

                            // *** Push main stat object to main_properties ***
                            raw_equip_obj.main_properties.push({
                                property_name: prop_zh_name,
                                property_id: main_prop.PropertyId, // Use Enka ID
                                base: formatEquipWeaponPropValue(total_main_value_raw, prop_id_str) // Format value and put in 'base'
                            });
                        } else { logger.warn(`  >> Skipping unknown main relic prop ID ${prop_id_str}`); }
                    }

                    // Process Sub Stats -> PUSH TO properties
                    if (_equip.RandomPropertyList) {
                        for (const prop of _equip.RandomPropertyList) {
                            const prop_id_str = String(prop.PropertyId);
                            const prop_zh_name = ID_TO_PROP_NAME[prop_id_str];
                            const en_prop_name = ID_TO_EN[prop_id_str];

                            if (prop_zh_name && en_prop_name) {
                                const prop_level = prop.PropertyLevel || 1;
                                const base_value_per_level = prop.PropertyValue || 0;
                                const total_substat_value_raw = base_value_per_level * prop_level;

                                if (props[en_prop_name] !== undefined) { props[en_prop_name] += total_substat_value_raw; }

                                // *** Push substat object to properties ***
                                raw_equip_obj.properties.push({
                                    property_name: prop_zh_name,
                                    property_id: prop.PropertyId, // Use Enka ID
                                    base: formatEquipWeaponPropValue(total_substat_value_raw, prop_id_str) // Format value and put in 'base'
                                });
                            } else { logger.warn(`  >> Skipping unknown sub relic prop ID ${prop_id_str}`); }
                        }
                    }
                    result.equip.push(raw_equip_obj);
                } // End equip loop

                 // Logic to calculate equip_suit.own (count pieces of each suit)
                 const suitCounts = {};
                 result.equip.forEach(eq => {
                     const sid = eq.equip_suit.suit_id;
                     suitCounts[sid] = (suitCounts[sid] || 0) + 1;
                 });
                 result.equip.forEach(eq => {
                     eq.equip_suit.own = suitCounts[eq.equip_suit.suit_id] || 0;
                 });

            } // End equip processing


            // --- Process Weapon ---
            if (char.Weapon?.Id) {
                const weapon_id = String(char.Weapon.Id);
                const _weapon_meta = weapon_data[weapon_id];
                if (_weapon_meta) {
                    const weapon_level = char.Weapon.Level || 1;
                    const weapon_star = char.Weapon.UpgradeLevel || 0; // Enka 0-4
                    const weapon_break_level = char.Weapon.BreakLevel || 0;
                    const [base_stat_value_raw, rand_stat_value_raw] = render_weapon_detail(_weapon_meta, weapon_level, String(weapon_break_level));

                    // Accumulate stats
                    const base_prop_id_str = String(_weapon_meta.props_id);
                    const base_en_prop = ID_TO_EN[base_prop_id_str];
                    if (base_en_prop && props[base_en_prop] !== undefined) { props[base_en_prop] += base_stat_value_raw; }
                    else { logger.warn(`  >> Unknown EN mapping weapon base prop ID ${base_prop_id_str}`); }
                    if (_weapon_meta.rand_props_id && rand_stat_value_raw > 0) {
                        const rand_prop_id_str = String(_weapon_meta.rand_props_id);
                        const rand_en_prop = ID_TO_EN[rand_prop_id_str];
                        if (rand_en_prop && props[rand_en_prop] !== undefined) { props[rand_en_prop] += rand_stat_value_raw; }
                        else { logger.warn(`  >> Unknown EN mapping weapon rand prop ID ${rand_prop_id_str}`); }
                    }

                    // *** Build weapon object matching MyS structure ***
                    result.weapon = {
                        id: char.Weapon.Id,
                        level: weapon_level,
                        name: _weapon_meta.name || "?",
                        star: weapon_star + 1, // MyS 1-5
                        icon: _weapon_meta.IconPath ?? '', // Get icon from meta if exists
                        rarity: _weapon_meta.rarity ?? 'A',
                        properties: [],      // Substat goes here
                        main_properties: [], // Main stat goes here
                        talent_title: _.get(_weapon_meta, ['talents', String(weapon_star + 1), 'Name'], ''), // Add talent info
                        talent_content: _.get(_weapon_meta, ['talents', String(weapon_star + 1), 'Desc'], ''), // Add talent info
                        profession: parseInt(_partner.WeaponType) || 0, // Get profession from partner data
                        // promote_level: weapon_break_level, // MyS sample doesn't have promote_level
                    };

                    // Add main prop to main_properties
                    const base_prop_zh = ID_TO_PROP_NAME[base_prop_id_str] || `?(${base_prop_id_str})`;
                    result.weapon.main_properties.push({
                        property_name: base_prop_zh, // MyS uses full name like "基础攻击力" here? Use ZH name.
                        property_id: _weapon_meta.props_id, // Use Enka ID
                        base: formatEquipWeaponPropValue(base_stat_value_raw, base_prop_id_str) // Format and put in 'base'
                    });

                    // Add sub prop to properties if exists
                    if (_weapon_meta.rand_props_id && rand_stat_value_raw > 0) {
                        const rand_prop_id_str = String(_weapon_meta.rand_props_id);
                        const rand_prop_zh = ID_TO_PROP_NAME[rand_prop_id_str] || `?(${rand_prop_id_str})`;
                         result.weapon.properties.push({
                            property_name: rand_prop_zh,
                            property_id: _weapon_meta.rand_props_id, // Use Enka ID
                            base: formatEquipWeaponPropValue(rand_stat_value_raw, rand_prop_id_str) // Format and put in 'base'
                        });
                    }
                } else { logger.warn(`[enka_to_mys.js] Weapon metadata missing: ${weapon_id}`); }
            } // End weapon processing


            // --- Final Stat Calculation ---
            // Applies % multipliers and flat additions from ALL sources (char, equip, weapon)
            const final_Hp = (props.HpBase || 0) * (1 + (props.HpAdd || 0) / 10000) + (props.HpMax || 0) - (props.HpBase || 0);
            const final_Attack = (props.AttackBase || 0) * (1 + (props.AttackAdd || 0) / 10000) + (props.Attack || 0) - (props.AttackBase || 0);
            const final_Defence = (props.DefenceBase || 0) * (1 + (props.DefenceAdd || 0) / 10000) + (props.Defence || 0) - (props.DefenceBase || 0);
            // Update props with final values for panel display
            props.HpMax = Math.floor(final_Hp);
            props.Attack = Math.floor(final_Attack);
            props.Defence = Math.floor(final_Defence);
            // Clean up intermediate calculation keys
            delete props.HpBase; delete props.HpAdd; delete props.AttackBase; delete props.AttackAdd; delete props.DefenceBase; delete props.DefenceAdd;


            // --- Format Final Properties Panel ---
            result.properties = [];
            const added_mys_ids = new Set();
            // Add calculated stats to the final panel array
            for (const [prop_en, prop_value] of Object.entries(props)) {
                if (prop_value === undefined) continue;
                const prop_zh = EN_TO_ZH[prop_en];
                if (!prop_zh) continue;
                const prop_id_mys = MYSAPI_PROP_ID[prop_zh];
                if (prop_id_mys === undefined || prop_id_mys === 0) continue; // Skip unmapped/zero-ID props

                const current_prop_enka_id = Object.keys(ID_TO_EN).find(k => ID_TO_EN[k] === prop_en);
                 // *** Use formatFinalPanelPropValue for the final panel ***
                const final_value_str = formatFinalPanelPropValue(prop_value, current_prop_enka_id);

                const alwaysShow = ['暴击率', '暴击伤害', '能量自动回复'].includes(prop_zh);
                const isBaseMainStat = ['生命值', '攻击力', '防御力'].includes(prop_zh);

                 if (prop_value !== 0 || alwaysShow || isBaseMainStat) {
                     // *** Add base and add fields (empty) to match target format ***
                    result.properties.push({
                        property_name: prop_zh,
                        property_id: prop_id_mys, // Use MyS API ID
                        base: "", // Add empty base
                        add: "",  // Add empty add
                        final: final_value_str
                    });
                    added_mys_ids.add(prop_id_mys);
                }
            }

            // Ensure essential properties exist with defaults
            const ensurePropertyExists = (propName, propId, defaultValueFormatted, enkaIdForFormatting, enKey) => {
                if (!added_mys_ids.has(propId)) {
                    const rawValue = props[enKey] || 0;
                     // *** Add base and add fields (empty) here too ***
                    result.properties.push({
                        property_name: propName, property_id: propId,
                        base: "", add: "", // Added
                        final: (rawValue !== 0) ? formatFinalPanelPropValue(rawValue, enkaIdForFormatting) : defaultValueFormatted
                    });
                }
            };
            // Ensure base stats
            ensurePropertyExists('生命值', 1, '0', '11101', 'HpMax');
            ensurePropertyExists('攻击力', 2, '0', '12101', 'Attack');
            ensurePropertyExists('防御力', 3, '0', '13101', 'Defence');
            // Ensure other core stats with defaults from target
            ensurePropertyExists('冲击力', 4, '0', '12203', 'BreakStun'); // Target shows flat value for ID 4
            ensurePropertyExists('暴击率', 5, '5.0%', '20103', 'Crit');
            ensurePropertyExists('暴击伤害', 6, '50.0%', '21103', 'CritDmg');
            ensurePropertyExists('异常掌控', 7, '0', '31403', 'ElementAbnormalPower');
            ensurePropertyExists('异常精通', 8, '0', '31203', 'ElementMystery');
            ensurePropertyExists('穿透率', 9, '0.0%', '23103', 'PenRate');
            ensurePropertyExists('能量自动回复', 11, '1.20', '30503', 'SpRecover'); // Use MyS ID 11 and target default
            ensurePropertyExists('穿透值', 232, '0', '23203', 'PenDelta');
            // Ensure element/phys bonus exists
            const elementDmgBonusEnKeys = { Phys: { enKey: 'PhysDmgBonus', id: 315, enkaId: '31503' }, Fire: { enKey: 'FireDmgBonus', id: 316, enkaId: '31603' }, Ice: { enKey: 'IceDmgBonus', id: 317, enkaId: '31703' }, Thunder: { enKey: 'ThunderDmgBonus', id: 318, enkaId: '31803' }, Ether: { enKey: 'EtherDmgBonus', id: 319, enkaId: '31903' } };
            for (const data of Object.values(elementDmgBonusEnKeys)) { const propName = EN_TO_ZH[data.enKey]; if (propName && data.id) { ensurePropertyExists(propName, data.id, '0.0%', data.enkaId, data.enKey); } }

            // Sort final properties by MyS ID
            result.properties.sort((a, b) => a.property_id - b.property_id);


            // --- Process Skills (Matching Target Structure) ---
            result.skills = [];
            const charSkillLevels = Object.fromEntries((char.SkillLevelList || []).map(s => [String(s.Index ?? s.Id), s.Level]));
            const charSkillDetails = PartnerId2SkillParam[char_id] || {};
            const skillTypesInOrder = [0, 1, 2, 3, 5, 6]; // Based on target order
            for (const skillIndex of skillTypesInOrder) {
                const skillIndexStr = String(skillIndex);
                // !!! Verify Key & Structure: Adapt access to skillDetail, Items, Title, Text !!!
                const skillDetail = charSkillDetails[skillIndexStr]; // Assumes keys '0', '1'...
                const currentLevel = charSkillLevels[skillIndexStr] ?? 1;
                let items = [];
                if (skillDetail?.Items && Array.isArray(skillDetail.Items)) {
                    items = skillDetail.Items
                        .map(item => ({ title: item?.Title || '', text: item?.Text || '' }))
                        .filter(item => item.title || item.text);
                    if (items.length === 0 && skillDetail.Items.length > 0) { logger.warn(`[enka_to_mys.js] Char ${char_id}, Skill ${skillIndex}: Items array filtered empty.`); }
                } else { if (charSkillLevels[skillIndexStr]) { logger.warn(`[enka_to_mys.js] Char ${char_id}: Missing skill details/Items for skill_type ${skillIndex}.`); } }

                // Add skill entry even if details are missing, using level from Enka
                 result.skills.push({
                    level: currentLevel,
                    skill_type: skillIndex, // Keep numeric skill_type
                    items: items // Add the processed items array (might be empty)
                });
            }


            // --- Process Ranks (Constellations) ---
            result.ranks = [];
            // !!! Verify Structure: Assumes _partner.Talents is { "1": { TalentID: X, Name: "...", Desc: "..." }, ... } !!!
            const rankData = _partner.Talents || {}; // Get talent data from partner_data
            const maxRank = 6;
            for (let i = 1; i <= maxRank; i++) {
                const rankInfo = rankData[String(i)] || {}; // Access rank data by string key '1', '2', ...
                 result.ranks.push({
                     id: rankInfo.TalentID || i, // Use specific TalentID or fallback to index
                     name: rankInfo.Name || `影位 ${i}`, // Use specific Name or fallback
                     desc: rankInfo.Desc || '', // Use specific Desc
                     pos: i, // Position index
                     is_unlocked: i <= result.rank, // Check against character's rank from Enka
                 });
            }

            // Add the fully processed character object to the list
            result_list.push(result);

        // *** End of try block for individual character processing ***
        } catch (processingError) {
            logger.error(`[enka_to_mys.js] CRITICAL ERROR processing character ID ${char?.Id || 'Unknown'}:`, processingError.message);
            logger.error(processingError.stack); // Log the full stack trace
        }
    } // --- End of character loop ---

    logger.info(`[enka_to_mys.js] Finished conversion. Processed ${result_list.length} characters.`);
    return result_list; // Return the list of converted data
}
