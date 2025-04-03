// enka_to_mys.js
// Purpose: Converts Enka Network ZZZ showcase data to MyS API format based on provided samples.

// --- Imports ---
import {
    equip_data,
    weapon_data,
    partner_data,
    PartnerId2SkillParam,
    get_char_circle_icon_url // Uses avatars.json via name_convert.js
} from './name_convert.js';
import _ from 'lodash';

// --- Simple Logger (Using console directly) ---
const logger = console;
// --- End Simple Logger ---


// --- Data Import Confirmation ---
if (typeof partner_data === 'undefined' || Object.keys(partner_data || {}).length === 0) { logger.error("[enka_to_mys.js] CRITICAL ERROR: partner_data is undefined or empty!"); }
if (typeof PartnerId2SkillParam === 'undefined') { PartnerId2SkillParam = {}; logger.warn("[enka_to_mys.js] WARNING: PartnerId2SkillParam is undefined."); }
if (typeof equip_data === 'undefined') { equip_data = {}; logger.warn("[enka_to_mys.js] WARNING: equip_data is undefined."); }
if (typeof weapon_data === 'undefined') { weapon_data = {}; logger.warn("[enka_to_mys.js] WARNING: weapon_data is undefined."); }
// --- End Data Import Confirmation ---


// --- Constants and Mappings ---
const ID_TO_PROP_NAME = {
    '11101': '生命值', '11103': '生命值', '11102': '生命值百分比', '12101': '攻击力', '12103': '攻击力', '12102': '攻击力百分比',
    '13101': '防御力', '13103': '防御力', '13102': '防御力百分比', '12203': '冲击力', '20103': '暴击率', '21103': '暴击伤害',
    '31402': '异常掌控', '31403': '异常掌控', '31202': '异常精通', '31203': '异常精通', '23103': '穿透率', '23203': '穿透值',
    '30503': '能量自动回复', '30502': '能量自动回复', '31503': '物理伤害加成', '31603': '火属性伤害加成', '31703': '冰属性伤害加成',
    '31803': '雷属性伤害加成', '31903': '以太属性伤害加成', '12202': '冲击力', // Correcting ID 12202 based on sample equip[5] main stat
};
const MYSAPI_PROP_ID = { // Final Panel Property IDs
    '生命值': 1, '攻击力': 2, '防御力': 3, '冲击力': 4, '暴击率': 5, '暴击伤害': 6, '异常掌控': 7, '异常精通': 8,
    '穿透率': 9, '能量自动回复': 11, // MyS uses 11 for SpRecover
    '穿透值': 232, '物理伤害加成': 315, '火属性伤害加成': 316, '冰属性伤害加成': 317, '雷属性伤害加成': 318, '以太属性伤害加成': 319,
    '生命值百分比': 0, '攻击力百分比': 0, '防御力百分比': 0, // Keep 0 for filtering in panel
};
const ID_TO_EN = { // Internal calculation keys
    '11101': 'HpMax', '11103': 'HpBase', '11102': 'HpAdd', '12101': 'Attack', '12103': 'AttackBase', '12102': 'AttackAdd',
    '13101': 'Defence', '13103': 'DefenceBase', '13102': 'DefenceAdd', '12203': 'BreakStun', // Flat Impact from Enka? MyS panel uses ID 4
    '20103': 'Crit', '21103': 'CritDmg', '31402': 'ElementAbnormalPower', '31403': 'ElementAbnormalPower',
    '31202': 'ElementMystery', '31203': 'ElementMystery', '23103': 'PenRate', '23203': 'PenDelta',
    '30503': 'SpRecover', '30502': 'SpRecover', '31503': 'PhysDmgBonus', '31603': 'FireDmgBonus', '31703': 'IceDmgBonus',
    '31803': 'ThunderDmgBonus', '31903': 'EtherDmgBonus',
    '12202': 'BreakStunPercent', // Assign a unique EN key for the % Impact (ID 12202) found on equip
};
const EN_TO_ZH = {};
for (const id in ID_TO_EN) { if (ID_TO_PROP_NAME[id]) { EN_TO_ZH[ID_TO_EN[id]] = ID_TO_PROP_NAME[id]; } }
EN_TO_ZH['HpAdd'] = '生命值百分比'; EN_TO_ZH['AttackAdd'] = '攻击力百分比'; EN_TO_ZH['DefenceAdd'] = '防御力百分比';
EN_TO_ZH['BreakStunPercent'] = '冲击力'; // Map the new EN key back to ZH

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
// --- End Constants and Mappings ---
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
 * Formats a raw stat value for the final character panel ('final' format).
//  */
// function formatFinalPanelPropValue(value, prop_id) {
//      const idStr = String(prop_id);
//      const isPercentProp = PERCENT_ID_LIST.includes(idStr);
//      const numericValue = Number(value);
//      if (value === undefined || value === null || isNaN(numericValue)) { return isPercentProp ? '0.0%' : '0'; }
//      try {
//          if (isPercentProp) { return (numericValue / 100).toFixed(1) + '%'; }
//          else if (idStr === '30503' || idStr === '30502') { return (numericValue / 100).toFixed(2); } // ER specific
//          else { return String(Math.floor(numericValue)); }
//      } catch (e) { logger.error(`Error formatting Final prop value ${value} for ${prop_id}:`, e); return '0'; }
// }

// ****** INSERT MISSING FUNCTIONS HERE ******

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

// ****** END OF INSERTED FUNCTIONS ******

// --- Helper Functions ---
/**
 * Formats a raw stat value into a display string ('base' format for equips/weapons).
//  */
// function formatEquipWeaponPropValue(value, prop_id) {
//     const idStr = String(prop_id);
//     const isPercentProp = PERCENT_ID_LIST.includes(idStr);
//     const numericValue = Number(value);
//     if (value === undefined || value === null || isNaN(numericValue)) { return isPercentProp ? '0.0%' : '0'; }
//
//     try {
//         if (isPercentProp) { return (numericValue / 100).toFixed(1) + '%'; } // Use 1 decimal for %
//         // No special case for energy regen here, format as flat
//         else { return String(Math.floor(numericValue)); } // Floor flat values
//     } catch (e) { logger.error(`Error formatting E/W prop value ${value} for ${prop_id}:`, e); return '0'; }
// }
/**
 * Formats a raw stat value for the final character panel ('final' format).
 */
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
// --- End Main Conversion Function ---
// import {
//     equip_data,
//     weapon_data,
//     partner_data,
//     PartnerId2SkillParam, get_char_circle_icon_url // 确认已从 name_convert.js 导出
// } from './name_convert.js'
// import _ from 'lodash'; // 引入 lodash (如果需要 get 等方法)
//
// // --- 数据导入确认 ---
// if (typeof partner_data === 'undefined' || Object.keys(partner_data || {}).length === 0) {
//     logger.error("[enka_to_mys.js] 错误：partner_data 未定义或为空！");
//     // 根据需要决定是否抛出错误或使用默认值
// }
// if (typeof PartnerId2SkillParam === 'undefined' || Object.keys(PartnerId2SkillParam || {}).length === 0) {
//     logger.warn("[enka_to_mys.js] 警告：PartnerId2SkillParam 未定义或为空，技能名称将使用默认值。");
//     PartnerId2SkillParam = {}; // 确保它是个空对象以防万一
// }
//
// // --- 常量和映射定义 ---
// const ID_TO_PROP_NAME = {
//     '11101': '生命值', '11103': '生命值', '11102': '生命值百分比', // Python: 11102 是 '生命值'
//     '12101': '攻击力', '12103': '攻击力', '12102': '攻击力百分比', // Python: 12102 是 '攻击力'
//     '13101': '防御力', '13103': '防御力', '13102': '防御力百分比', // Python: 13102 是 '防御力'
//     '12203': '冲击力', '20103': '暴击率', '21103': '暴击伤害',
//     '31402': '异常掌控', '31403': '异常掌控',
//     '31202': '异常精通', '31203': '异常精通',
//     '23103': '穿透率', '23203': '穿透值',
//     '30503': '能量自动回复', '30502': '能量自动回复', // Python: 30502 是 '能量回复百分比' (但值和30503一样？)
//     // Python 没有 315, 但有 31503
//     '31503': '物理伤害加成', '31603': '火属性伤害加成', '31703': '冰属性伤害加成',
//     '31803': '雷属性伤害加成', '31903': '以太属性伤害加成',
//     // '315': '伤害加成', // Python 存在此 ID, JS 暂无对应
// };
// // MysApi 返回的 Property ID 映射 (根据日志样本)
// const MYSAPI_PROP_ID = {
//     '生命值': 1, '攻击力': 2, '防御力': 3, '冲击力': 4, '暴击率': 5, '暴击伤害': 6,
//     '异常掌控': 7, '异常精通': 8, '穿透率': 9, '能量自动回复': 11,
//     '穿透值': 232, // Python ID: 23203
//     '物理伤害加成': 315, // Python ID: 31503
//     '火属性伤害加成': 316, // Python ID: 31603
//     '冰属性伤害加成': 317, // Python ID: 31703
//     '雷属性伤害加成': 318, // Python ID: 31803
//     '以太属性伤害加成': 319, // Python ID: 31903
//     // 百分比属性的 MysApi ID 未知，用 0 占位
//     '生命值百分比': 0, '攻击力百分比': 0, '防御力百分比': 0,
// };
//
// const ID_TO_EN = {
//     '11101': 'HpMax', '11103': 'HpBase', '11102': 'HpAdd', // % HP
//     '12101': 'Attack', '12103': 'AttackBase', '12102': 'AttackAdd', // % ATK
//     '13101': 'Defence', '13103': 'DefenceBase', '13102': 'DefenceAdd', // % DEF
//     '12203': 'BreakStun', '20103': 'Crit', '21103': 'CritDmg',
//     '31402': 'ElementAbnormalPower', '31403': 'ElementAbnormalPower',
//     '31202': 'ElementMystery', '31203': 'ElementMystery',
//     '23103': 'PenRate', '23203': 'PenDelta',
//     '30503': 'SpRecover', '30502': 'SpRecover', // Python calls 30502 '能量回复百分比' but uses same EN key? Let's keep it SpRecover for now.
//     // '315': 'DmgBonus', // Python has this, maybe map if needed?
//     '31503': 'PhysDmgBonus', '31603': 'FireDmgBonus', '31703': 'IceDmgBonus',
//     '31803': 'ThunderDmgBonus', '31903': 'EtherDmgBonus',
// };
//
// // 修正 EN_TO_ZH 以匹配更新的 ID_TO_PROP_NAME
// const EN_TO_ZH = {};
// for (const id in ID_TO_EN) {
//     if (ID_TO_PROP_NAME[id]) {
//         EN_TO_ZH[ID_TO_EN[id]] = ID_TO_PROP_NAME[id];
//     }
// }
// // 手动修正百分比名称，因为 Python 的 ID_TO_PROP_NAME 不区分
// EN_TO_ZH['HpAdd'] = '生命值百分比';
// EN_TO_ZH['AttackAdd'] = '攻击力百分比';
// EN_TO_ZH['DefenceAdd'] = '防御力百分比';
// // EN_TO_ZH['SpRecover'] = '能量自动回复'; // 保持不变，因为 Python 两个ID都叫这个
//
// // *** 新增：从 Python 复制的音擎主属性每阶基础增加值 (单位: 万分位) ***
// const MAIN_PROP_BASE_INCREASE = {
//     '11101': 330, // HP Flat
//     '11103': 330, // HP Base (?? unlikely main stat, but matching python)
//     '11102': 47.4, // HP% (value seems low compared to others, maybe *100?) -> Python value IS 47.4 -> This likely means 47.4 per tier = 4.74% increase per tier
//     '12101': 47.4, // ATK Flat (?? seems low, maybe python value is wrong or per level?) -> Python value IS 47.4
//     '12103': 47.4, // ATK Base (?? unlikely main stat)
//     '12102': 450, // ATK% -> 45.0% increase per tier? No, python value is 450, likely 45 per tier = 4.5%
//     '13101': 27.6, // DEF Flat (?? seems low) -> Python value IS 27.6
//     '13103': 27.6, // DEF Base (?? unlikely main stat)
//     '13102': 720, // DEF% -> 72 per tier = 7.2%
//     '12203': 270, // 冲击力 -> 27.0 per tier
//     '20103': 360, // 暴击率 -> 36.0% per tier? No, 36 per tier = 3.6%
//     '21103': 720, // 暴击伤害 -> 72.0% per tier? No, 72 per tier = 7.2%
//     '31402': 450, // 异常掌控 -> 45.0 per tier
//     '31403': 450, // 异常掌控
//     '31202': 13,  // 异常精通 -> 1.3 per tier? Python value IS 13
//     '31203': 13,  // 异常精通
//     '23103': 360, // 穿透率 -> 36 per tier = 3.6%
//     '23203': 36,  // 穿透值 -> 3.6 per tier
//     '30503': 900, // 能量自动回复 -> 90 per tier = 9.0% (or 0.9 rate?)
//     '30502': 900, // 能量回复百分比 (Python mapping) -> 90 per tier = 9.0%
//     // '315': 450, // 伤害加成 (General? Python has this)
//     '31503': 450, // 物理伤害加成 -> 45 per tier = 4.5%
//     '31603': 450, // 火 -> 4.5%
//     '31703': 450, // 冰 -> 4.5%
//     '31803': 450, // 雷 -> 4.5%
//     '31903': 450, // 以太 -> 4.5%
// };
//
//
// const PERCENT_ID_LIST = Object.keys(ID_TO_PROP_NAME).filter(id =>
//     ID_TO_PROP_NAME[id].includes('百分比') || // Based on JS name
//     ['20103', '21103', '23103', // Crit, CritDmg, PenRate
//      '12203', // Impact (Python lists it, check if it's % in game) - Assume % based on Python's PERCENT_ID
//      '31503', '31603', '31703', '31803', '31903', // Element Dmg Bonus
//      '11102', '12102', '13102', // Explicit % stats from Python ID mapping
//      '30502', // Energy Regen % from Python ID mapping
//      // Note: Python's PERCENT_ID includes 31603, 12203, 31703 etc. which are also Dmg Bonuses
//     ].includes(id)
// );
//
//
// const ELEMENT_TO_EN = { '203': 'Thunder', '205': 'Ether', '202': 'Ice', '200': 'Phys', '201': 'Fire' };
//
// // --- 辅助函数 ---
// // 格式化函数保持不变，它处理的是显示格式
// function _format_value_str(value, prop_id) {
//     const idStr = String(prop_id);
//     const isPercentProp = PERCENT_ID_LIST.includes(idStr);
//
//     if (isPercentProp) {
//         // Enka 的百分比值是 MYS 的 10 倍（例如 Enka 500 = MYS 50.0%）
//         // 或者根据 Python MAIN_PROP_BASE_INCREASE, 这些值可能已经是 *10 的?
//         // Let's assume the value passed is raw (万分位) and needs formatting
//         // Python example: 360 (Crit Rate) -> 3.6% per tier -> Total might be e.g., 360 base + 360 * tiers
//         // If value is 720 (e.g., base 360 + 1 tier 360), format as 72.0%? No, format as 7.2%
//         // => Divide by 100 for percent formatting
//          return (value / 100).toFixed(1) + '%';
//     } else if (idStr === '30503') { // MysApi 能量回复是小数 (e.g., 1.2)
//          // Python value 900 -> 9.0% per tier? Or 0.9 rate?
//          // If value is 900, format as 9.0? Or 0.9?
//          // MYS value is like 1.2, Python value is 900. Let's assume Python's 900 = MYS 9.0 (divide by 100)
//         return (value / 100).toFixed(2);
//     } else {
//         // 非百分比取整 (HP, ATK, DEF flat, Mastery, Control, PenDelta)
//         return String(Math.floor(value));
//     }
// }
//
//
// function render_weapon_detail(weapon_meta, weapon_level, weapon_break_level) {
//     if (!weapon_meta || weapon_meta.props_value === undefined || !weapon_meta.level || !weapon_meta.stars) {
//         logger.error("[enka_to_mys.js] 无效的武器元数据:", weapon_meta);
//         return [0, 0];
//     }
//     const levelData = weapon_meta.level[String(weapon_level)];
//     const starData = weapon_meta.stars[String(weapon_break_level)]; // Python uses BreakLevel for stars index
//     if (!levelData || !starData) {
//         logger.error(`[enka_to_mys.js] 武器ID ${weapon_meta.id || '未知'} 缺少等级 (${weapon_level}) 或突破 (${weapon_break_level}) 数据`);
//         return [0, 0];
//     }
//     let base_value = weapon_meta.props_value;
//     base_value = base_value + base_value * ((levelData.Rate + starData.StarRate) / 10000);
//     let rand_value = weapon_meta.rand_props_value || 0;
//     if (rand_value > 0 && starData.RandRate !== undefined) { // Check RandRate existence
//         rand_value = rand_value + rand_value * (starData.RandRate / 10000);
//     } else {
//         rand_value = 0; // Ensure it's zero if no rand prop or rate
//     }
//     // 返回未格式化的原始值 (万分位)
//     return [Math.floor(base_value), Math.floor(rand_value)];
// }
//
// function _calculate_char_base_stat(base_val, growth_val, level_data, extra_level_data, char_level, promotion_level, stat_key_in_promo, extra_key_id) {
//     let final_value = base_val;
//     if (char_level > 1) {
//         final_value += (char_level - 1) * growth_val / 10000;
//     }
//     const promoStr = String(promotion_level);
//     if (level_data && level_data[promoStr] && level_data[promoStr][stat_key_in_promo] !== undefined) {
//         final_value += level_data[promoStr][stat_key_in_promo];
//     }
//
//     // Match Python's extra level calculation
//     if (char_level > 10 && extra_level_data && extra_level_data[promoStr] && extra_level_data[promoStr]['Extra'] && extra_key_id) {
//         const extraValue = _.get(extra_level_data[promoStr], ['Extra', extra_key_id, 'Value'], 0); // Use lodash get for safety
//          final_value += extraValue;
//     }
//
//     return Math.floor(final_value);
// }
//
//
// function getSkillName(charId, skillIndex) {
//     const charSkillsData = PartnerId2SkillParam?.[String(charId)];
//     if (!charSkillsData) return `技能 ${skillIndex}`;
//     // Find the skill name by matching the Index property
//     for (const skillName in charSkillsData) {
//         if (Object.hasOwnProperty.call(charSkillsData, skillName) &&
//             charSkillsData[skillName] &&
//             charSkillsData[skillName].Index === skillIndex) {
//             return charSkillsData[skillName].Name || skillName; // Prefer Name field if available
//         }
//     }
//     return `技能 ${skillIndex}`; // Fallback
// }
//
// // --- 主要转换函数 ---
// export async function _enka_data_to_mys_data(enka_data) {
//     if (!enka_data || !enka_data.PlayerInfo || !enka_data.PlayerInfo.ShowcaseDetail || !enka_data.PlayerInfo.ShowcaseDetail.AvatarList) {
//         logger.error("[enka_to_mys.js] 接收到无效的 enka_data 结构。");
//         return [];
//     }
//
//     const uid = enka_data.uid;
//     const result_list = [];
//
//     for (const char of enka_data.PlayerInfo.ShowcaseDetail.AvatarList) {
//         const char_id = String(char.Id);
//         if (!partner_data[char_id]) {
//             logger.warn(`[enka_to_mys.js] 跳过角色 ID ${char_id}: 在 partner_data 中未找到数据。`);
//             continue;
//         }
//         const _partner = partner_data[char_id];
//         logger.debug(`[enka_to_mys.js] Processing character: ${char_id} (${_partner.name})`);
//
//         const characterIconUrl = get_char_circle_icon_url(char_id) ?? '';
//
//         // --- 初始化接近 MysApi 原始结构的 result 对象 ---
//         const result = {
//             id: char.Id, level: char.Level, name_mi18n: _partner.name,
//             full_name_mi18n: _partner.full_name, element_type: parseInt(_partner.ElementType),
//             camp_name_mi18n: _partner.Camp, avatar_profession: parseInt(_partner.WeaponType),
//             rarity: _partner.Rarity, // 使用字符串 'S'/'A'
//             rank: char.TalentLevel || 0, // 命座等级
//             equip: [], weapon: null, properties: [], skills: [], ranks: [], // 初始化为空数组
//             // --- MYS 特有字段占位符 ---
//             icon_paths: { group_icon_path: characterIconUrl, hollow_icon_path: characterIconUrl  },
//             role_vertical_painting_url: '', us_full_name: _partner.en_name || '',
//             vertical_painting_color: '', skin_list: [], role_square_url: '',
//         };
//
//         // --- 属性计算准备 ---
//         const props = { /* HpBase, AttackBase, DefenceBase will be calculated */ };
//         // Initialize all possible props from ID_TO_EN to 0
//         Object.values(ID_TO_EN).forEach(enKey => { props[enKey] = 0; });
//         // Add base crit damage (万分位)
//         props.CritDmg = _partner.CritDamage || 0; // Initialize CritDmg from base stats
//
//         // Calculate character base stats (matching Python logic)
//         const NAME_TO_ID = Object.fromEntries(Object.entries(EN_TO_ZH).map(([k, v]) => [v, Object.keys(ID_TO_EN).find(id => ID_TO_EN[id] === k)]));
//
//         const baseStatsToCalc = {
//             'HpMax': { base: _partner.HpMax, growth: _partner.HpGrowth, key: 'HpMax', extraKeyId: NAME_TO_ID['生命值']},
//             'Attack': { base: _partner.Attack, growth: _partner.AttackGrowth, key: 'Attack', extraKeyId: NAME_TO_ID['攻击力'] },
//             'Defence': { base: _partner.Defence, growth: _partner.DefenceGrowth, key: 'Defence', extraKeyId: NAME_TO_ID['防御力'] },
//         };
//
//         for (const [statName, statData] of Object.entries(baseStatsToCalc)) {
//             if (statData.base !== undefined && statData.growth !== undefined) {
//                 const calculatedBase = _calculate_char_base_stat(
//                     statData.base, statData.growth,
//                     _partner.Level, _partner.ExtraLevel, // Pass both level data structures
//                     char.Level, char.PromotionLevel,
//                     statData.key, statData.extraKeyId // Pass stat key and the ID for extra lookup
//                 );
//                 // Store calculated BASE values (HpBase, AttackBase, DefenceBase)
//                 const baseKey = statName.replace('Max', 'Base'); // Convert HpMax -> HpBase etc.
//                 props[baseKey] = calculatedBase;
//                  logger.debug(` > ${baseKey} calculated base: ${calculatedBase}`);
//             } else {
//                 logger.warn(` > Missing base/growth data for ${statName} in partner_data for ID ${char_id}`);
//             }
//         }
//          logger.debug(` > Initial props after base calc:`, JSON.stringify(props));
//
//
//         // --- 处理音擎驱动 (填充 result.equip) ---
//         if (char.EquippedList && Array.isArray(char.EquippedList)) {
//             for (const relic of char.EquippedList) {
//                 if (!relic || !relic.Equipment) continue;
//                 const _equip = relic.Equipment;
//                 const equip_id_str = String(_equip.Id);
//                 const suit_id = equip_id_str.slice(0, 3) + '00';
//                 const equip_meta = equip_data[suit_id];
//                 if (!equip_meta) {
//                     logger.warn(`[enka_to_mys.js] 未找到驱动器套装元数据 ID: ${suit_id}`);
//                     continue;
//                 }
//
//                 const relic_level = _equip.Level || 0;
//                 //const relic_tier = Math.floor(relic_level / 3); // Tier calculation moved inside loop
//
//                 const raw_equip_obj = {
//                     id: _equip.Id, level: relic_level,
//                     equipment_type: relic.Slot,
//                     name: equip_meta.equip_name ? `${equip_meta.equip_name} ${relic.Slot}` : `驱动 ${relic.Slot}`, // Append slot number like python
//                     rarity: 'S', // Assume S rank for now
//                     icon: '',
//                     equip_suit: {
//                         suit_id: parseInt(suit_id), name: equip_meta.equip_name || "未知套装",
//                         desc1: equip_meta.desc1 || "", desc2: equip_meta.desc2 || "",
//                     },
//                     main_properties: [],
//                     properties: [],
//                 };
//
//                 // --- 处理主词条 (!!! 使用 Python 的计算逻辑 !!!) ---
//                 if (_equip.MainPropertyList && _equip.MainPropertyList[0]) {
//                     const main_prop = _equip.MainPropertyList[0];
//                     const prop_id_str = String(main_prop.PropertyId);
//                     const prop_zh_name = ID_TO_PROP_NAME[prop_id_str] || `未知(${prop_id_str})`;
//                     const en_prop_name = ID_TO_EN[prop_id_str];
//
//                     // *** 使用 Python 的计算逻辑 ***
//                     const base_value = main_prop.PropertyValue || 0; // Base value at level 0
//                     const increase_per_tier = MAIN_PROP_BASE_INCREASE[prop_id_str] !== undefined ? MAIN_PROP_BASE_INCREASE[prop_id_str] : 0;
//                     const property_level_multiplier = main_prop.PropertyLevel || 1; // Get multiplier from Enka (likely 1 for main stat)
//                     const relic_tier = Math.floor(relic_level / 3); // Calculate tiers
//
//                     // Apply the exact Python formula: base + increase * (multiplier * tier)
//                     const total_main_value_raw = base_value + increase_per_tier * (property_level_multiplier * relic_tier);
//                     // *** End of Python calculation logic ***
//
//                     logger.debug(`  >> Relic ${equip_id_str} Slot ${relic.Slot} Main Stat ${prop_id_str} (${prop_zh_name}): Lvl ${relic_level} (Tier ${relic_tier}), Base ${base_value}, Inc ${increase_per_tier}, Mult ${property_level_multiplier} => Raw Total ${total_main_value_raw}`);
//
//                     // 累加到总属性 (使用 raw 万分位值)
//                     if (en_prop_name && props[en_prop_name] !== undefined) {
//                         props[en_prop_name] += total_main_value_raw;
//                     } else {
//                          logger.warn(`  >> Unknown EN mapping for main prop ID ${prop_id_str}`);
//                     }
//
//                     // 格式化显示值并添加到结果对象
//                     raw_equip_obj.main_properties.push({
//                         property_name: prop_zh_name,
//                         property_id: main_prop.PropertyId,
//                         base: "", add: "", // MYS often has these empty for relics
//                         final: _format_value_str(total_main_value_raw, prop_id_str) // Format the calculated raw value
//                     });
//                 } else {
//                     logger.warn(`  >> Relic ${equip_id_str} Slot ${relic.Slot} missing MainPropertyList`);
//                 }
//
//
//                 // --- 处理副词条 (逻辑保持不变) ---
//                 if (_equip.RandomPropertyList && Array.isArray(_equip.RandomPropertyList)) {
//                     for (const prop of _equip.RandomPropertyList) {
//                         const prop_id_str = String(prop.PropertyId);
//                         const prop_zh_name = ID_TO_PROP_NAME[prop_id_str] || `未知(${prop_id_str})`;
//                         const en_prop_name = ID_TO_EN[prop_id_str];
//                         const prop_level = prop.PropertyLevel || 1; // This level indicates number of rolls/upgrades
//                         const base_value_per_level = prop.PropertyValue || 0; // Value per roll
//
//                         // 副词条总值 = 每级数值 * 等级(次数)
//                         const total_substat_value_raw = base_value_per_level * prop_level;
//
//                          logger.debug(`  >> Relic ${equip_id_str} Sub Stat ${prop_id_str} (${prop_zh_name}): Val ${base_value_per_level} * Lvl ${prop_level} => Raw Total ${total_substat_value_raw}`);
//
//                         // 累加到总属性
//                         if (en_prop_name && props[en_prop_name] !== undefined) {
//                              props[en_prop_name] += total_substat_value_raw;
//                          } else {
//                             logger.warn(`  >> Unknown EN mapping for substat prop ID ${prop_id_str}`);
//                          }
//
//                         // 添加到结果对象
//                         raw_equip_obj.properties.push({
//                             property_name: prop_zh_name, property_id: prop.PropertyId,
//                             base: "", add: "", // MYS often empty here too
//                             final: _format_value_str(total_substat_value_raw, prop_id_str), // Format for display
//                         });
//                     }
//                 }
//                 result.equip.push(raw_equip_obj);
//             }
//         }
//         logger.debug(` > Props after relics:`, JSON.stringify(props));
//
//
//         // --- 处理武器 (逻辑保持不变) ---
//         if (char.Weapon && char.Weapon.Id) {
//             const weapon_id = String(char.Weapon.Id);
//             const _weapon_meta = weapon_data[weapon_id];
//
//             if (_weapon_meta) {
//                 const weapon_level = char.Weapon.Level || 1;
//                 const weapon_star = char.Weapon.UpgradeLevel || 0; // Refinement level (0-4 in Enka -> 1-5 in MYS?)
//                 const weapon_break_level = char.Weapon.BreakLevel || 0; // Ascension level
//
//                 const [base_stat_value_raw, rand_stat_value_raw] = render_weapon_detail(
//                     _weapon_meta, weapon_level, String(weapon_break_level) // Pass BreakLevel for calculation
//                 );
//                 logger.debug(`  >> Weapon ${weapon_id} (${_weapon_meta.name}): Lvl ${weapon_level}, Break ${weapon_break_level}, Star ${weapon_star} => Base Raw ${base_stat_value_raw}, Rand Raw ${rand_stat_value_raw}`);
//
//                 // 累加属性 (使用 raw 值)
//                 const base_prop_id_str = String(_weapon_meta.props_id);
//                 const base_en_prop = ID_TO_EN[base_prop_id_str];
//                 if (base_en_prop && props[base_en_prop] !== undefined) {
//                      props[base_en_prop] += base_stat_value_raw;
//                  } else {
//                     logger.warn(`  >> Unknown EN mapping for weapon base prop ID ${base_prop_id_str}`);
//                  }
//
//                 if (_weapon_meta.rand_props_id && rand_stat_value_raw > 0) {
//                      const rand_prop_id_str = String(_weapon_meta.rand_props_id);
//                      const rand_en_prop = ID_TO_EN[rand_prop_id_str];
//                     if (rand_en_prop && props[rand_en_prop] !== undefined) {
//                          props[rand_en_prop] += rand_stat_value_raw;
//                      } else {
//                         logger.warn(`  >> Unknown EN mapping for weapon rand prop ID ${rand_prop_id_str}`);
//                      }
//                 }
//
//                 // 构建 "原始" 武器对象
//                 result.weapon = {
//                     id: char.Weapon.Id, level: weapon_level, star: weapon_star + 1, // MYS uses 1-5 for refinement
//                     promote_level: weapon_break_level,
//                     name: _weapon_meta.name || "未知武器",
//                     rarity: _weapon_meta.rarity, // 使用 'S' 或 'A'
//                     icon: '', // Placeholder
//                     // Use refinement level (star + 1) to get talent description
//                     talent_title: _.get(_weapon_meta, ['talents', String(weapon_star + 1), 'Name'], ''),
//                     talent_content: _.get(_weapon_meta, ['talents', String(weapon_star + 1), 'Desc'], ''),
//                     main_properties: [], // Main stat is usually just one
//                     properties: [] // Secondary stat (if exists)
//                 };
//
//                 // 填充 "原始" 主属性对象
//                 const main_prop_obj = {
//                     property_name: _weapon_meta.props_name || ID_TO_PROP_NAME[base_prop_id_str] || `未知(${base_prop_id_str})`,
//                     property_id: _weapon_meta.props_id, base: "", add: "",
//                     final: _format_value_str(base_stat_value_raw, base_prop_id_str) // Format
//                 };
//                 result.weapon.main_properties.push(main_prop_obj);
//
//                 // 填充 "原始" 副属性对象
//                 if (_weapon_meta.rand_props_id && rand_stat_value_raw > 0) {
//                     const rand_prop_id_str = String(_weapon_meta.rand_props_id);
//                     result.weapon.properties.push({
//                         property_name: _weapon_meta.rand_props_name || ID_TO_PROP_NAME[rand_prop_id_str] || `未知(${rand_prop_id_str})`,
//                         property_id: _weapon_meta.rand_props_id, base: "", add: "",
//                         final: _format_value_str(rand_stat_value_raw, rand_prop_id_str) // Format
//                     });
//                 }
//             } else {
//                 logger.warn(`[enka_to_mys.js] 未找到武器元数据 ID: ${weapon_id}`);
//             }
//         }
//         logger.debug(` > Props after weapon:`, JSON.stringify(props));
//
//         // --- 最终属性计算 (逻辑保持不变) ---
//         // Base = Character Base + Weapon Base Flat
//         // Add = Sum of all % increases (Relics, Weapon Secondary)
//         // Flat = Sum of all Flat increases (Relics)
//         // Final = Base * (1 + Add% / 10000) + Flat
//         const final_Hp = (props.HpBase || 0) * (1 + (props.HpAdd || 0) / 10000) + (props.HpMax || 0);
//         const final_Attack = (props.AttackBase || 0) * (1 + (props.AttackAdd || 0) / 10000) + (props.Attack || 0);
//         const final_Defence = (props.DefenceBase || 0) * (1 + (props.DefenceAdd || 0) / 10000) + (props.Defence || 0);
//
//         // Update props object with final calculated values
//         props.HpMax = Math.floor(final_Hp);
//         props.Attack = Math.floor(final_Attack);
//         props.Defence = Math.floor(final_Defence);
//
//         // Delete intermediate values
//         delete props.HpBase; delete props.HpAdd;
//         delete props.AttackBase; delete props.AttackAdd;
//         delete props.DefenceBase; delete props.DefenceAdd;
//
//         // Filter out irrelevant element damage bonuses
//         const char_element_en = ELEMENT_TO_EN[_partner.ElementType];
//         const element_bonus_keys = ['FireDmgBonus', 'IceDmgBonus', 'ThunderDmgBonus', 'EtherDmgBonus']; // PhysDmgBonus is kept separately
//         for (const key of element_bonus_keys) {
//              if (props.hasOwnProperty(key) && key !== `${char_element_en}DmgBonus`) {
//                  // Keep the property if it has a non-zero value, otherwise delete?
//                  // Or strictly delete if not the character's element? Let's strictly delete.
//                  // logger.debug(` > Deleting non-matching element bonus: ${key}`);
//                  // Keep it for now, MYS might show it even if 0? Let final formatting handle 0 values.
//                  // If we need to strictly remove: delete props[key];
//              }
//         }
//         logger.debug(` > Props after final calculation & cleanup:`, JSON.stringify(props));
//
//
//         // --- 格式化最终属性面板 (填充 result.properties 数组，使用 MysApi ID) ---
//         result.properties = [];
//         const added_mys_ids = new Set();
//
//         // Add calculated props first
//         for (const [prop_en, prop_value] of Object.entries(props)) {
//             if (prop_value === undefined) continue; // Skip undefined props
//
//             const prop_zh = EN_TO_ZH[prop_en];
//             if (!prop_zh) {
//                 // logger.warn(`[enka_to_mys.js] Final Props: No ZH name for EN key ${prop_en}`);
//                 continue; // Skip if no Chinese name mapping
//             }
//
//             const prop_id_mys = MYSAPI_PROP_ID[prop_zh];
//             const current_prop_enka_id = Object.keys(ID_TO_EN).find(k => ID_TO_EN[k] === prop_en); // Get the Enka ID for formatting
//
//             if (prop_id_mys === undefined) {
//                  logger.warn(`[enka_to_mys.js] Final Props: 属性 ${prop_zh} (EN: ${prop_en}) 缺少 MysApi ID 映射`);
//                  // Add with MYS ID 0 if needed? For now, skip if no MYS ID.
//                  continue;
//             }
//
//             // Format the final value using the Enka ID associated with the EN key
//             const final_value_str = _format_value_str(prop_value, current_prop_enka_id);
//
//             // Only add if the value is not "0" or "0.0%" (unless it's a base stat like CR/CD)
//             const isBaseCritOrER = ['暴击率', '暴击伤害', '能量自动回复'].includes(prop_zh);
//             if (prop_value !== 0 || isBaseCritOrER) {
//                  result.properties.push({
//                      property_name: prop_zh,
//                      property_id: prop_id_mys, // Use MYS API ID
//                      base: "", // MYS usually leaves these empty in final panel
//                      add: "",
//                      final: final_value_str
//                  });
//                  added_mys_ids.add(prop_id_mys);
//             }
//         }
//
//         // Ensure essential stats have default values if missing (matching MYS behavior)
//         const ensurePropertyExists = (propName, propId, defaultValue) => {
//             if (!added_mys_ids.has(propId)) {
//                 // Check if the raw prop value was actually 0 before adding default
//                 const enKey = Object.keys(EN_TO_ZH).find(k => EN_TO_ZH[k] === propName);
//                 const enkaId = Object.keys(ID_TO_EN).find(k => ID_TO_EN[k] === enKey);
//                 const rawValue = props[enKey] || 0;
//
//                 result.properties.push({
//                     property_name: propName,
//                     property_id: propId,
//                     base: "", add: "",
//                     // Format the actual value (which might be 0) or the default if needed
//                     final: rawValue !== 0 ? _format_value_str(rawValue, enkaId) : defaultValue
//                 });
//                 added_mys_ids.add(propId); // Mark as added
//             }
//         };
//
//         ensurePropertyExists('生命值', 1, _format_value_str(props.HpMax || 0, '11101'));
//         ensurePropertyExists('攻击力', 2, _format_value_str(props.Attack || 0, '12101'));
//         ensurePropertyExists('防御力', 3, _format_value_str(props.Defence || 0, '13101'));
//         ensurePropertyExists('冲击力', 4, _format_value_str(props.BreakStun || 0, '12203'));
//         ensurePropertyExists('暴击率', 5, '5.0%'); // MYS default
//         ensurePropertyExists('暴击伤害', 6, '50.0%'); // MYS default
//         ensurePropertyExists('异常掌控', 7, _format_value_str(props.ElementAbnormalPower || 0, '31403'));
//         ensurePropertyExists('异常精通', 8, _format_value_str(props.ElementMystery || 0, '31203'));
//         ensurePropertyExists('穿透率', 9, '0.0%'); // MYS default
//         ensurePropertyExists('能量自动回复', 11, '1.00'); // MYS default is 1.00? Python used 1.20. Check MYS. Let's use 1.00 for now.
//         ensurePropertyExists('穿透值', 232, _format_value_str(props.PenDelta || 0, '23203'));
//
//         // Ensure element/phys bonus exists, defaulting to 0.0%
//         const elementDmgKey = `${ELEMENT_TO_EN[_partner.ElementType]}DmgBonus`;
//         const elementDmgZh = EN_TO_ZH[elementDmgKey];
//         const elementDmgIdMys = MYSAPI_PROP_ID[elementDmgZh];
//         const elementDmgEnkaId = Object.keys(ID_TO_EN).find(k => ID_TO_EN[k] === elementDmgKey);
//         if(elementDmgZh && elementDmgIdMys) {
//             ensurePropertyExists(elementDmgZh, elementDmgIdMys, '0.0%');
//         }
//         ensurePropertyExists('物理伤害加成', 315, '0.0%');
//
//
//         // Sort properties by MYS API ID
//         result.properties.sort((a, b) => a.property_id - b.property_id);
//
//
//         // --- 处理技能 (填充 result.skills, 对齐 MysApi 结构) ---
//         if (char.SkillLevelList && Array.isArray(char.SkillLevelList)) {
//              for (const skill of char.SkillLevelList) {
//                  result.skills.push({
//                      id: skill.Id || skill.Index, // Use Id if available, else Index
//                      level: skill.Level,
//                      name: getSkillName(char_id, skill.Index), // Get name from mapping
//                      skill_type: skill.Index, // Use skill_type to align with potential MYS field name
//                      icon: '', // Placeholder
//                      desc: '', // Placeholder
//                      is_unlocked: true, // Assume shown skills are unlocked
//                      // items: [], // Python didn't have items, maybe not needed for ZZZ?
//                  });
//              }
//         }
//          result.skills.sort((a, b) => a.skill_type - b.skill_type); // Sort by index
//
//
//         // --- 处理命座 (填充 result.ranks, 对齐 MysApi 结构) ---
//         result.ranks = [];
//          // Assuming ranks data comes from partner_data or needs a generic structure
//          const rankData = _partner.Talents || {}; // Check if talent data exists in partner_data
//          const maxRank = 6; // Assume 6 ranks
//
//         for (let i = 1; i <= maxRank; i++) {
//             const rankInfo = rankData[String(i)] || {}; // Get info for rank 'i'
//              result.ranks.push({
//                  id: rankInfo.TalentID || i, // Use actual ID if available
//                  name: rankInfo.Name || `影位 ${i}`, // Use actual name or generic
//                  desc: rankInfo.Desc || '',
//                  icon: '', // Placeholder
//                  pos: i,
//                  is_unlocked: i <= result.rank, // Check against character's rank level
//                  // level: result.rank, // Sometimes MYS includes the current total rank level here
//              });
//         }
//
//
//         // Add timestamp if available in Enka data
//         if (char.ObtainmentTimestamp) {
//              result.current_time = new Date(char.ObtainmentTimestamp * 1000); // Convert sec to ms
//         }
//
//         result_list.push(result);
//         logger.debug(`[enka_to_mys.js] Finished processing ${result.name_mi18n}`);
//     }
//
//     logger.debug(`[enka_to_mys.js] 成功转换 ${result_list.length} 个角色的数据`);
//     return result_list;
// }
