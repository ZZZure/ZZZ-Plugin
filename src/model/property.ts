import type { Mys } from '#interface'

/**
 * @class
 */
export class Property {
  property_name: string
  property_id: number
  base: string
  add: string
  final: string

  constructor(data: Mys.Avatar['properties'][number]) {
    const { property_name, property_id, base, add, final } = data
    this.property_name = property_name
    this.property_id = property_id
    this.base = base
    this.add = add
    this.final = final
  }

}
