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
   * @param {number} level
   * @param {number} skill_type
   * @param {SkillItem[]} items
   */
  constructor(level, skill_type, items) {
    this.level = level;
    this.skill_type = skill_type;
    this.items = items;
  }
}
