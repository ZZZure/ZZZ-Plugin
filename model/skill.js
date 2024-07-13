/**
 * @class
 */
export class SkillItem {
  /**
   * @param {string} title
   * @param {string} text
   */
  constructor(title, text) {
    this.title = title;
    this.text = text;
  }
}

/**
 * @class
 */
export class Skill {
  /**
   * @param {{
   *  level: number,
   *  skill_type: number,
   *  items: SkillItem[]
   * }} data
   */
  constructor(data) {
    const { level, skill_type, items } = data;
    this.level = level;
    this.skill_type = skill_type;
    this.items = items;
  }
}
