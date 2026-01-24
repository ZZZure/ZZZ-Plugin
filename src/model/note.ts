import { converSecondsToHM } from '../utils/time.js'

export class Vitality {

  constructor(public max: number, public current: number) {

  }

  get finish() {
    return this.max === this.current
  }

}

export class VhsSale {

  constructor(public sale_state: string) {

  }

  get state() {
    if (this.sale_state.includes('Doing')) {
      return true
    }
    return false
  }

  get state_label() {
    if (this.sale_state.includes('Doing')) {
      return '正在营业'
    }
    return '尚未营业'
  }

}

export class EnergyProgress {
  percent: number
  rest: string = ''

  constructor(public max: number, public current: number) {
    this.percent = Math.floor((Number(current) / Number(max)) * 100)
  }

}

export class Energy {
  progress: EnergyProgress
  restore: number

  constructor(progress: EnergyProgress, restore: number) {
    this.progress = new EnergyProgress(progress.max, progress.current)
    this.restore = restore
    const leftHM = converSecondsToHM(restore)
    this.progress.rest = `${leftHM[0]}小时${leftHM[1]}分钟`
  }

}

export class ZZZNoteResp {
  energy: Energy
  vitality: Vitality
  vhs_sale: VhsSale
  card_sign: string

  constructor(data: {
    energy: Energy
    vitality: Vitality
    vhs_sale: VhsSale
    card_sign: string
  }) {
    const { energy, vitality, vhs_sale, card_sign } = data
    this.energy = new Energy(energy.progress, energy.restore)
    this.vitality = new Vitality(vitality.max, vitality.current)
    this.vhs_sale = new VhsSale(vhs_sale.sale_state)
    this.card_sign = card_sign
  }

  get sign() {
    if (this.card_sign?.includes('Done')) {
      return true
    }
    return false
  }

  get sign_label() {
    if (this.card_sign?.includes('Done')) {
      return '已完成'
    }
    return '未完成'
  }

}
