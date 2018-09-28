'use strict';

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

var _require = require('./defineReactive'),
    defineReactive = _require.defineReactive;

var Watch = require('./watcher');

var Dep = require('./Dep');

function initState(data) {
  var _defineReactive = defineReactive(data),
      reactiveData = _defineReactive.res,
      dependencies = _defineReactive.dependencies;

  return {
    reactiveData: reactiveData,
    dependencies: dependencies
  };
}
function initWatch(watchers, reactiveData, dependencies, binder) {
  if (!reactiveData.__isReactive__) {
    throw new Error('watched data should be reactive');
  }

  var watchersType = _typeof(watchers);

  if (!!watchersType && watchersType === 'object' && !Array.isArray(watchers)) {
    //  watch存在且是对象时才执行
    // 获取watchers的key值
    var keys = Object.keys(watchers); // const dep = new Dep()
    // 生成dep实例，用于将Dep添加target和删除target

    keys.forEach(function (key) {
      // 判断key，在reactiveData中是否存在对应的属性, 存在则添加watcher, 支持deep watch，判断对应的依赖是否存在
      if (reactiveData.hasOwnProperty(key) || dependencies[key]) {
        var _watch = watchers[key];

        var _type = _typeof(_watch);

        if (_type === 'function') {
          // type是一个function， 延迟执行，data对应的key变动时才促发watcher
          var deps = dependencies;
          var dep = deps[key];

          if (dep && dep.pend) {
            // 确定依赖存在
            var watchFunc = _watch.bind(binder || null);

            var watcher = new Watch(watchFunc); // define dep

            dep.addTarget(watcher); // get dep

            dep.pend(); // remove dep

            dep.removeTarget();
          }
        } else if (_type === 'object' && !Array.isArray(_watch)) {
          // watcher时object的时候执行此逻辑
          // 已对象 { handler, immediate } 形式传入时执行此断逻辑
          var handler = _watch.handler;
          var immediate = _watch.immediate;

          if (typeof handler !== 'function') {
            // handler应该是一个function
            throw new Error('handler should be a function');
          } // 绑定this


          var _watchFunc = handler.bind(binder || null);

          if (immediate) {
            // 立即执行
            var _watcher = new Watch(_watchFunc); // define dependency


            setTimeout(function () {
              // 异步执行，
              // define dep
              var deps = dependencies;
              var dep = deps[key];
              dep.addTarget(_watcher); // get dependency

              dep.pend(); // remove dependency

              dep.removeTarget(); // excute

              _watcher.excute();
            });
          } else {
            // 延迟执行
            // 获取依赖对象库
            var _deps = dependencies; // 根据key找回对应的依赖

            var _dep = _deps[key];

            if (_dep && _dep.pend) {
              // 确定依赖存在
              var _watcher2 = new Watch(_watchFunc); // define dependency


              _dep.addTarget(_watcher2); // get dependency


              _dep.pend(); // remove dependency


              _dep.removeTarget();
            }
          }
        }
      }
    });
  }
}
function initComputed(computed, attachedData, binder, isMiniprogram) {
  if (!attachedData.__isReactive__) {
    throw new Error('computed props should be reactive');
  } // 生成用于定义和添加依赖的dep对象


  var dep = new Dep();

  var _type = _typeof(computed);

  if (_type === 'object' && !!_type && !Array.isArray(_type)) {
    // computed需要是一个对象
    // const dataKeys = Object.keys(attachedData)
    var computedKeys = Object.keys(computed);
    computedKeys.forEach(function (key) {
      var dataAndComputedHasTheSameKey = attachedData.hasOwnProperty(key);

      if (!dataAndComputedHasTheSameKey) {
        // data和computed的key值不能重复
        var computedGetter = computed[key];

        var getterType = _typeof(computedGetter);

        if (getterType === 'function') {
          // getter需要是一个function
          var value;
          var computedFunc = computedGetter.bind(binder); // 通过此方法去设置值

          var computedMethod = function computedMethod() {
            value = computedFunc();

            if (isMiniprogram) {
              // 小程序的情况下 通过setdata去改变值
              binder.setData(_defineProperty({}, key, value));
            }
          }; // 生成watcher


          var watcher = new Watch(computedMethod); // 定义依赖

          dep.addTarget(watcher); // 通过excute执行computedMethod,生成初始值，通过reactivedata的getter获取依赖

          watcher.excute(); // 移除依赖

          dep.removeTarget(); // 将对应的key和value定义到

          if (!isMiniprogram) {
            // 非小程序的情况下更改getter和setter
            Object.defineProperty(attachedData, key, {
              enumerable: true,
              configurable: true,
              get: function get() {
                return value;
              },
              set: function set() {
                throw new Error('can not set value in a computed props');
              }
            });
          }
        }
      }
    });
  }
}

function normalInit(obj) {
  var data = obj.data,
      watch = obj.watch,
      computed = obj.computed;

  var _initState = initState(data),
      reactiveData = _initState.reactiveData,
      dependencies = _initState.dependencies;

  var binder = {
    data: reactiveData
  };
  initComputed(computed, reactiveData, binder);
  initWatch(watch, reactiveData, dependencies, binder);
  return binder;
}

function minprogramInit(obj) {
  // const { data, watch, computed } = obj
  var data = obj.data;

  var _initState2 = initState(data),
      reactiveData = _initState2.reactiveData,
      dependencies = _initState2.dependencies;

  var binder = {
    data: reactiveData,
    __dep__: dependencies // initComputed(computed, reactiveData, binder)
    // initWatch(watch, reactiveData, dependencies, binder)

  };
  return binder;
}

function init(obj, isMiniprogram) {
  if (isMiniprogram) {
    return minprogramInit(obj);
  } else {
    return normalInit(obj);
  }
} // module.exports = {s
//   init,
//   initState,
//   initWatch,
//   initComputed
// }

// init miniprogram page
var _require$1 = require('./initState'),
    init$1 = _require$1.init,
    initComputed$1 = _require$1.initComputed,
    initWatch$1 = _require$1.initWatch;

var initPage = function initPage(options) {
  var object = {
    data: options.data,
    watch: options.watch,
    computed: options.computed // generate reactiveDate

  };
  var reactiveData = init$1(object, true); // get data

  var data = reactiveData.data;
  var oldOnLoad = options.onLoad; // re-write onload

  function onLoad(opts) {
    var dataDescriptions = Object.getOwnPropertyDescriptor(this, 'data'); // set data to page

    Object.defineProperty(this, 'data', _objectSpread({}, dataDescriptions, {
      value: data
    })); // re-write __data__ and __viewData__, otherwise it's buggy when using component in page

    Object.defineProperty(this, '__data__', _objectSpread({}, dataDescriptions, {
      value: data
    }));
    Object.defineProperty(this, '__viewData__', _objectSpread({}, dataDescriptions, {
      value: data
    })); // init computed value

    initComputed$1(object.computed, this.data, this, true); // init watcher

    initWatch$1(object.watch, this.data, reactiveData.__dep__, this); // run old onload method

    if (typeof oldOnLoad === 'function') {
      oldOnLoad.apply(this, opts);
    }
  } // init page


  var page = Page(_objectSpread({}, options, {
    data: data,
    onLoad: onLoad
  }));
  return page;
}; // module.exports = initPage

var _require$2 = require('./initState'),
    init$2 = _require$2.init,
    initComputed$2 = _require$2.initComputed,
    initWatch$2 = _require$2.initWatch;

function decorateAttached(oldAttached, data, watch, computed) {
  return function decoratedAttached(opts) {
    // const self = this
    var reactiveData = init$2({
      data: data,
      watch: watch,
      computed: computed
    }, true); // generate reactive data

    var _reactiveData = reactiveData.data; // get descriptions

    var dataDescriptions = Object.getOwnPropertyDescriptor('this', 'data'); // map props to reactive data

    var mapPropsToReactiveData = function mapPropsToReactiveData(rData, oldData) {
      var keys = Object.keys(oldData);

      for (var index = 0; index < keys.length; index++) {
        var key = keys[index];

        if (!_reactiveData.hasOwnProperty(key)) {
          // key is not in reactiveData, that means it's a property
          rData[key] = oldData[key];
        }
      }

      return rData;
    };

    var reactiveDataWithProps = mapPropsToReactiveData(_reactiveData, this.data); // difine data

    Object.defineProperty(this, 'data', _objectSpread({}, dataDescriptions, {
      value: reactiveDataWithProps
    })); // re-write __data__ and __viewData__

    Object.defineProperty(this, '__data__', _objectSpread({}, dataDescriptions, {
      value: reactiveDataWithProps
    }));
    Object.defineProperty(this, '__viewData__', _objectSpread({}, dataDescriptions, {
      value: reactiveDataWithProps
    })); // init computed value, just computed data

    initComputed$2(computed, _reactiveData, this, true); // init watcher, just watch data

    initWatch$2(watch, _reactiveData, reactiveData.__dep__, this); // call old attched

    if (typeof oldAttached === 'function') {
      oldAttached.apply(this, opts);
    }
  };
}
function initComponent(Constructor, options) {
  var data = options.data,
      attached = options.attached,
      watch = options.watch,
      computed = options.computed;
  var decoratedAttached = decorateAttached(attached, data, watch, computed);
  var result = Constructor(_objectSpread({}, options, {
    attached: decoratedAttached
  }));
  return result;
} // module.exports = {
//   decorateAttached,
//   initComponent
// }

// const init = require('./initState').init
var index = {
  init: init,
  initPage: initPage,
  initComponent: initComponent
};

module.exports = index;
