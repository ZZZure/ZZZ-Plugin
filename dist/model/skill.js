export class SkillItem {
    title;
    text;
    constructor(title, text) {
        this.title = title;
        this.text = text;
    }
}
export class Skill {
    level;
    skill_type;
    items;
    constructor(data) {
        const { level, skill_type, items } = data;
        this.level = level;
        this.skill_type = skill_type;
        this.items = items;
    }
}
//# sourceMappingURL=skill.js.map