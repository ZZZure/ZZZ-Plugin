/**
 * @class
 */
export class Property {
  /**
   * @param {string} property_name
   * @param {number} property_id
   * @param {string} base
   * @param {string} add
   * @param {string} final
   */
  constructor(property_name, property_id, base, add, final) {
    this.property_name = property_name;
    this.property_id = property_id;
    this.base = base;
    this.add = add;
    this.final = final;
  }
}
