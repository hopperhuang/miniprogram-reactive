# reactive data

[![Coverage Status](https://coveralls.io/repos/github/hopperhuang/miniprogram-reactive/badge.svg?branch=master)](https://coveralls.io/github/hopperhuang/miniprogram-reactive?branch=master)

让数据变的observable
    - watch属性，监听data对应的属性变化
    - computed属性，根据data衍生出相应的属性
    - 高效，相应依赖发生变化时，监听方法才会执行
    - 支持深层嵌套属性的监听

---

## 安装

```
npm install miniprogram-reactive --save
```

## 小程序api

**initPage**

初始化页面：

```js
const { initPage } = require('miniprogram-reactive')
const options = {
    data: {
        number: 1,
    },
    watche: {
        number() {
            console.log('number change!!')
        }
    },
    computed: {
        anotherNumber() {
            return this.data.number + 1
        }
    }
}
initPage(options)
```

调用this.setData属性更改对应的值时，watch方法会被调用，computed属性会被重新计算

---

**initComponent**

初始化组件

比如，在组件页面中：
```js
const { initComponent } = require('miniprogram-reactive')
const options = {
    data: {
        number: 1,
    },
    watche: {
        number() {
            console.log('number change!!')
        }
    },
    computed: {
        anotherNumber() {
            return this.data.number + 1
        }
    }
}
initComponent(options)

```

调用this.setData属性更改对应的值时，watch方法会被调用，computed属性会被重新计算

## 一般用法

**init**

监察数据变化：

```js
const { init } = require('miniprogram-reactive')
const options = {
    data: {
        number: 1,
    },
    watche: {
        number() {
            console.log('number change!!')
        }
    },
    computed: {
        anotherNumber() {
            return this.data.number + 1
        }
    }
}
const observable = init(options)

```

修改observable.data对应的属性值时,watch方法会被调用，computed属性会被重新计算

## watch属性

观察data对应的key值,key发生变化时,对应的watch方法也会被调用

初始化不调用:

```js
const options = {
    data: {
        number: 1
    },
    watch: {
        number() {
            console.log('number change')
        }
    }
}
const observable = init(options)
```

或者:

```js
const options = {
    data: {
        number: 1
    },
    watch: {
        number() {
            handler() {
                console.log('number change')
            }
        }
    }
}
const observable = init(options)
```

---

初始化时调用

```js
const options = {
    data: {
        number: 1
    },
    watch: {
        number() {
            handler() {
                console.log('number change')
            },
            immediate: true
        }
    }
}
const observable = init(options)
```

## coputed属性

比如:

```js
const options = {
    data: {
        number: 1,
    },
    computed: {
        anotherNumber() {
            return this.data.number + 1
        }
    }
}
const observable = init(options)
assert.equal(observable.anotherNumber, 2) // true
```

## 具体例子

请参考examples/miniprogram中的例子


## 提示

- 小程序使用者可以先安装npm包，然后复制lib/index.js到项目目录下使用
- 小程序使用者也可以在github上下载源代码，npm run build, 手动构建好后，将lib/index.js复制到项目目录下
