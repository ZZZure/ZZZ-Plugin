/**
 * @class
 */
export class SkillItem {

  constructor(public title: string, public text: string) {

  }

}

/**
 * @class
 */
export class Skill {
  level: number
  skill_type: number
  items: SkillItem[]

  constructor(data: {
    level: number
    skill_type: number
    items: SkillItem[]
  }) {
    const { level, skill_type, items } = data
    this.level = level
    this.skill_type = skill_type
    this.items = items
  }

}
