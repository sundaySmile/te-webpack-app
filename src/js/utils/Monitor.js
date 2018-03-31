/**
 * @desc 监听某一个事件的触发
 * @param null
 * @return {Object} { listen, one, remove, trigger }
 * @example
 * import events from '@m7/monitor';
 * const monitor = new events();
 * monitor.trigger('ShowIcon', {})
 * monitor.listen('ShowIcon', () => {})
 */
/* eslint-disable no-param-reassign, no-empty */
export default class Events {
  constructor() {
    this.obj = {};
  }
  listen(key, eventfn) {
    const _ref = this.obj[key];
    if (_ref) eventfn();
    const stack = _ref != null ? _ref : this.obj[key] = [];
    return stack.push(eventfn);
  }
  remove(key) {
    const _ref = this.obj[key];
    if (_ref != null) {
      _ref.length = 0;
    }
  }
  one(key, eventfn) {
    this.remove(key);
    return this.listen(key, eventfn);
  }
  trigger(...keys) {
    let fn;
    const key = Array.prototype.shift.call(keys);
    const _ref = this.obj[key];
    const stack = _ref != null ? _ref : this.obj[key] = [];
    for (let _i = 0, _len = stack.length; _i < _len; _i + 1) {
      fn = stack[_i];
      if (!fn(keys)) {
        return false;
      }
    }
  }
}
