export class Property {
    property_name;
    property_id;
    base;
    add;
    final;
    constructor(data) {
        const { property_name, property_id, base, add, final } = data;
        this.property_name = property_name;
        this.property_id = property_id;
        this.base = base;
        this.add = add;
        this.final = final;
    }
}
//# sourceMappingURL=property.js.map