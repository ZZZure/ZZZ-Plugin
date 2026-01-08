/**
 * @class
 */
export class Property {
  /**
   * @param {{
   *  property_name: string,
   *  property_id: number,
   *  base: string,
   *  add: string,
   *  final: string
   * }} data
   * @param {string} property_name
   * @param {number} property_id
   * @param {string} base
   * @param {string} add
   * @param {string} final
   */
  constructor(data) {
    const { property_name, property_id, base, add, final } = data;
    this.property_name = property_name;
    this.property_id = property_id;
    this.base = base;
    this.add = add;
    this.final = final;
  }
}
