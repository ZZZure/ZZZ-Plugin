/**
 * @typedef {'PolychromesData'|'MatserTapeData'|'BooponsData'} DataType
 */

/**
 * @typedef {'daily_activity_rewards'|'growth_rewards'|'event_rewards'|'hollow_rewards'|'shiyu_rewards'|'mail_rewards'|'other_rewards'} IncomeAction
 */

/**
 * @typedef {Object} ListData
 * @property {DataType} data_type
 * @property {number} count
 * @property {string} data_name
 */

/**
 * @typedef {Object} IncomeComponents
 * @property {IncomeAction} action
 * @property {number} num
 * @property {number} percent
 */

/**
 * @typedef {Object} MonthData
 * @property {ListData[]} list
 * @property {IncomeComponents[]} income_components
 */

/**
 * @typedef {Object} Monthly
 * @property {string} uid
 * @property {string} region
 * @property {string} current_month
 * @property {string} data_month
 * @property {MonthData} month_data
 * @property {string[]} optional_month
 */

/**
 * @class ListData
 */
class ListData {
  /** @type {DataType} */
  data_type;
  /** @type {number} */
  count;
  /** @type {string} */
  data_name;

  constructor(data) {
    this.data_type = data.data_type;
    this.count = data.count;
    this.data_name = data.data_name;
  }
}

/**
 * @class IncomeComponents
 */
class IncomeComponents {
  /** @type {IncomeAction} */
  action;
  /** @type {number} */
  num;
  /** @type {number} */
  percent;

  constructor(data) {
    this.action = data.action;
    this.num = data.num;
    this.percent = data.percent;
  }

  /** @type {string} */
  get name() {
    switch (this.action) {
      case 'daily_activity_rewards':
        return '日常活跃奖励';
      case 'growth_rewards':
        return '成长奖励';
      case 'event_rewards':
        return '活动奖励';
      case 'hollow_rewards':
        return '零号空洞奖励';
      case 'shiyu_rewards':
        return '式舆防卫战奖励';
      case 'mail_rewards':
        return '邮件奖励';
      case 'other_rewards':
        return '其他奖励';
      default:
        return '未知奖励';
    }
  }
}

/**
 * @class MonthData
 */
class MonthData {
  /** @type {ListData[]} */
  list;
  /** @type {IncomeComponents[]} */
  income_components;

  constructor(data) {
    this.list = data.list.map(item => new ListData(item));
    this.income_components = data.income_components.map(
      item => new IncomeComponents(item)
    );
  }

  /** @type {{poly: number, tape: number, boopon: number}} */
  get overview() {
    return {
      poly:
        this.list.find(item => item.data_type === 'PolychromesData')?.count ||
        0,
      tape:
        this.list.find(item => item.data_type === 'MatserTapeData')?.count || 0,
      boopon:
        this.list.find(item => item.data_type === 'BooponsData')?.count || 0,
    };
  }
}

/**
 * @class Monthly
 *
 */
export class Monthly {
  /** @type {string} */
  uid;
  /** @type {string} */
  region;
  /** @type {string} */
  current_month;
  /** @type {string} */
  data_month;
  /** @type {MonthData} */
  month_data;
  /** @type {string[]} */
  optional_month;

  constructor(data) {
    this.uid = data.uid;
    this.region = data.region;
    this.current_month = data.current_month;
    this.data_month = data.data_month;
    this.month_data = new MonthData(data.month_data);
    this.optional_month = data.optional_month;
  }

  get query_month() {
    const month = +this.data_month.slice(-2);
    return `${month}月`;
  }

  get query_full_date() {
    return `${this.data_month.slice(0, 4)}年${this.query_month}`;
  }
}
