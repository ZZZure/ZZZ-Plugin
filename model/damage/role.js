import _ from 'lodash';

export const calculate_damage = (
  base_detail,
  bonus_detail,
  skill_type,
  add_skill_type,
  avatar_element,
  skill_multiplier,
  level
) => {
  const merged_attr = merge_attribute(base_detail, bonus_detail);
  logger.debug('merged_attr', merged_attr);

  const attack = merged_attr.attack;
  logger.debug('攻击区', attack);

  const defence_multiplier = get_defence_multiplier(merged_attr, level);
  logger.debug('防御区', defence_multiplier);

  const injury_area = get_injury_area(
    merged_attr,
    skill_type,
    add_skill_type,
    avatar_element
  );
  logger.debug('增伤区', injury_area);

  const damage_ratio = get_damage_ratio(
    merged_attr,
    skill_type,
    add_skill_type,
    avatar_element
  );
  logger.debug('易伤区', damage_ratio);

  const critical_damage_base = get_critical_damage_base(
    merged_attr,
    skill_type,
    add_skill_type,
    avatar_element
  );
  logger.debug('爆伤区', critical_damage_base);

  const critical_chance_base = get_critical_chance_base(
    merged_attr,
    skill_type,
    add_skill_type,
    avatar_element
  );
  logger.debug('暴击区', critical_chance_base);

  const qiwang_damage = critical_chance_base * critical_damage_base;
  logger.debug('暴击期望', qiwang_damage);

  const damage_cd =
    attack *
    skill_multiplier *
    defence_multiplier *
    injury_area *
    damage_ratio *
    critical_damage_base *
    1.2 *
    1.5;
  const damage_qw =
    attack *
    skill_multiplier *
    defence_multiplier *
    injury_area *
    damage_ratio *
    qiwang_damage *
    1.2 *
    1.5;

  const damagelist = {
    cd: damage_cd,
    qw: damage_qw,
  };
  return damagelist;
};

export const get_critical_chance_base = (
  merged_attr,
  skill_type,
  add_skill_type,
  avatar_element
) => {
  let critical_chance_base = _.get(merged_attr, 'CriticalChanceBase', 0);
  const merged_attrkey = Object.keys(merged_attr);
  for (const attr of merged_attrkey) {
    if (attr.search('_CriticalChanceBase') != -1) {
      const attr_name = attr.split('_CriticalChanceBase')[0];
      if (
        [skill_type, add_skill_type, 'All', avatar_element].includes(attr_name)
      ) {
        logger.debug(
          attr + '对' + attr_name + '有' + merged_attr[attr] + '暴击加成'
        );
        critical_chance_base = critical_chance_base + merged_attr[attr];
      }
    }
  }
  critical_chance_base = Math.min(1, critical_chance_base);
  return critical_chance_base;
};

export const get_critical_damage_base = (
  merged_attr,
  skill_type,
  add_skill_type,
  avatar_element
) => {
  let critical_damage_base = _.get(merged_attr, 'CriticalDamageBase', 0);
  const merged_attrkey = Object.keys(merged_attr);
  for (const attr of merged_attrkey) {
    if (attr.search('_CriticalDamageBase') != -1) {
      const attr_name = attr.split('_CriticalDamageBase')[0];
      if (
        [skill_type, add_skill_type, 'All', avatar_element].includes(attr_name)
      ) {
        logger.debug(
          attr + '对' + attr_name + '有' + merged_attr[attr] + '爆伤加成'
        );
        critical_damage_base = critical_damage_base + merged_attr[attr];
      }
    }
  }
  return critical_damage_base + 1;
};

export const get_damage_ratio = (
  merged_attr,
  skill_type,
  add_skill_type,
  avatar_element
) => {
  let damage_ratio = _.get(merged_attr, 'DmgRatio', 0);
  const merged_attrkey = Object.keys(merged_attr);
  for (const attr of merged_attrkey) {
    if (attr.search('_DmgRatio') != -1) {
      const attr_name = attr.split('_DmgRatio')[0];
      if (
        [skill_type, add_skill_type, 'All', avatar_element].includes(attr_name)
      ) {
        logger.debug(
          attr + '对' + attr_name + '有' + merged_attr[attr] + '易伤加成'
        );
        damage_ratio = damage_ratio + merged_attr[attr];
      }
    }
  }
  return damage_ratio + 1;
};

export const get_injury_area = (
  merged_attr,
  skill_type,
  add_skill_type,
  avatar_element
) => {
  let injury_area = 1.0;
  const merged_attrkey = Object.keys(merged_attr);
  for (const attr of merged_attrkey) {
    if (attr.search('_DmgAdd') != -1) {
      const attr_name = attr.split('_DmgAdd')[0];
      if (
        [skill_type, add_skill_type, 'All', avatar_element].includes(attr_name)
      ) {
        logger.debug(
          attr + '对' + attr_name + '有' + merged_attr[attr] + '增伤'
        );
        injury_area = injury_area + merged_attr[attr];
      }
    }
    if (attr.search('AddedRatio') != -1) {
      const attr_name = attr.split('AddedRatio')[0];
      if ([avatar_element, 'AllDamage'].includes(attr_name)) {
        logger.debug(
          attr + '对' + attr_name + '有' + merged_attr[attr] + '增伤'
        );
        injury_area = injury_area + merged_attr[attr];
      }
    }
  }
  return injury_area;
};

export const get_defence_multiplier = (merged_attr, level) => {
  /** 计算防御基础值 */
  const defadd = 0.155 * (level * level) + 3.12 * level + 46.95;
  /** 计算降防 */
  let ignore_defence = 1.0;
  if (merged_attr.ignore_defence) {
    ignore_defence = 1 - merged_attr.ignore_defence;
  }
  /** 计算穿透率 */
  let penratio = 1.0;
  if (merged_attr.PenRatioBase) {
    penratio = 1 - merged_attr.PenRatioBase;
  }
  /** 计算穿透值 */
  const pendelta = _.get(merged_attr, 'PenDelta', 0);
  /** 计算防御乘区 */
  const defence_multiplier =
    defadd / (defadd + (defadd * ignore_defence * penratio - pendelta));
  return defence_multiplier;
};

export const merge_attribute = (base_detail, bonus_detail) => {
  const merged_attr = {};
  const bonus_detailkey = Object.keys(bonus_detail);
  for (const merged of bonus_detailkey) {
    if (
      merged.search('Attack') != -1 ||
      merged.search('Defence') != -1 ||
      merged.search('HP') != -1
    ) {
      continue;
    } else if (merged.search('Base') != -1) {
      merged_attr[merged] =
        _.get(base_detail, merged, 0) + _.get(bonus_detail, merged, 0);
    } else {
      merged_attr[merged] = _.get(bonus_detail, merged, 0);
    }
  }
  merged_attr['hp'] =
    _.get(bonus_detail, 'HPDelta', 0) +
    _.get(base_detail, 'hp', 0) * (_.get(bonus_detail, 'HPAddedRatio', 0) + 1);
  merged_attr['attack'] =
    _.get(bonus_detail, 'AttackDelta', 0) +
    _.get(base_detail, 'attack', 0) *
      (_.get(bonus_detail, 'AttackAddedRatio', 0) + 1);
  merged_attr['defence'] =
    _.get(bonus_detail, 'DefenceDelta', 0) +
    _.get(base_detail, 'defence', 0) *
      (_.get(bonus_detail, 'DefenceAddedRatio', 0) + 1);
  merged_attr['CriticalChanceBase'] =
    _.get(bonus_detail, 'CriticalChanceBase', 0) +
    _.get(base_detail, 'CriticalChanceBase', 0);
  merged_attr['CriticalDamageBase'] =
    _.get(bonus_detail, 'CriticalDamageBase', 0) +
    _.get(base_detail, 'CriticalDamageBase', 0);
  merged_attr['PenRatioBase'] =
    _.get(bonus_detail, 'PenRatioBase', 0) +
    _.get(base_detail, 'PenRatioBase', 0);
  return merged_attr;
};
