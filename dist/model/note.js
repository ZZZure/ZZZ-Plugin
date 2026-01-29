import { converSecondsToHM } from '../utils/time.js';
export class Vitality {
    max;
    current;
    constructor(max, current) {
        this.max = max;
        this.current = current;
    }
    get finish() {
        return this.max === this.current;
    }
}
export class VhsSale {
    sale_state;
    constructor(sale_state) {
        this.sale_state = sale_state;
    }
    get state() {
        if (this.sale_state.includes('Doing')) {
            return true;
        }
        return false;
    }
    get state_label() {
        if (this.sale_state.includes('Doing')) {
            return '正在营业';
        }
        return '尚未营业';
    }
}
export class EnergyProgress {
    max;
    current;
    percent;
    rest = '';
    constructor(max, current) {
        this.max = max;
        this.current = current;
        this.percent = Math.floor((Number(current) / Number(max)) * 100);
    }
}
export class Energy {
    progress;
    restore;
    constructor(progress, restore) {
        this.progress = new EnergyProgress(progress.max, progress.current);
        this.restore = restore;
        const leftHM = converSecondsToHM(restore);
        this.progress.rest = `${leftHM[0]}小时${leftHM[1]}分钟`;
    }
}
export class ZZZNoteResp {
    energy;
    vitality;
    vhs_sale;
    card_sign;
    constructor(data) {
        const { energy, vitality, vhs_sale, card_sign } = data;
        this.energy = new Energy(energy.progress, energy.restore);
        this.vitality = new Vitality(vitality.max, vitality.current);
        this.vhs_sale = new VhsSale(vhs_sale.sale_state);
        this.card_sign = card_sign;
    }
    get sign() {
        if (this.card_sign?.includes('Done')) {
            return true;
        }
        return false;
    }
    get sign_label() {
        if (this.card_sign?.includes('Done')) {
            return '已完成';
        }
        return '未完成';
    }
}
//# sourceMappingURL=note.js.map