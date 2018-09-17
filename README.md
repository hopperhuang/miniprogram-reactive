# reaction-obsevable

[![NPM version](https://img.shields.io/npm/v/reaction-obsevable.svg?style=flat)](https://www.npmjs.com/package/reaction-obsevable)
[![Build Status](https://travis-ci.org/hopperhuang/reaction.svg?branch=master)](https://travis-ci.org/hopperhuang/reaction)
[![Coverage Status](https://coveralls.io/repos/github/hopperhuang/reaction/badge.svg?branch=master)](https://coveralls.io/github/hopperhuang/reaction?branch=master)

A ligth data flow framework, easily binding reactions to specific object.

---

### Feature

* Easy to use, transform object to be an observable, then u can listen on it's change
* Easy to learn, just 2 apis u have to learn, $listen and $unlisten
* Just object can be listen, reaction just observe object but no primative value

### Core
* Reaction just observe on objects
* Property changes was reflected on it's owner's listener
* We use Proxy to re-definie object's getter, setter and other behavior

### Install

```
npm i reaction-obsevable
```

### Examples

See examples: [here](https://github.com/hopperhuang/reaction-obsevable-examples)


### Usage

1. transfrom object to be an observable

```
import reaction from 'reaction-obsevable'
const person = reaction({ name: 'reaction.js' })
// now the person is observale, we can observe what property has change on person
```

2. listen to change

```
// u can add listenrs to the observable to listen it's changes by using $listen method
// event name and method is required
person.$listen('changename', (person) => { console.log(person.name )})
person.name = 'change name'
// the terminal will print out 'change name'
// reaction just observe peron above, when then name property is changed, the listenr will be called
// note: if you use the same event name for different handlers to listen to the changes, the latest one will cover the previous 
```

3. unlisten event

```
// you can see that we add listeners to the observable and marked it by using an event name
// so it's easily for you to remove specific listeners by event names you've used just now
person.$unlisten('changename')
pseron.name = 'reaction.js'
// now the terminal will print out nothing for listener has been removed
```

4. child can also be observable

```
// reaction will change object and it's children that whose data type is Array or Object

const team = reaction({
    leader: {
        name: 'reaction'
    }
})

// as team's property, the leader is also observable
// u can also listen to it 

team.leader.$listen((leader) => { console.log(leader.name)})
team.leader.name = 'reaction.js'

// ternimal will print out reaction.js
// note: array can also be listen, when the array's value, like index, length etc changed, the listener will run
// see example below:
describe('test listen and emit when target is array', () => {
    it('should add one when new value is settend', () => {
      const array = reaction([])
      let number = 1
      array.$listen('event', (array) => {
        number += array[0]
      })
      array[0] = 1
      assert.equal(number, 2)
    })
    it('child can also listen', () => {
      const array = reaction([{name: 'hopperhuang'}])
      let name = ''
      array[0].$listen('event', (element) => {
        name = element.name
      })
      array[0].name = 'hopper'
      assert.equal(name, 'hopper')
    })
  })

```

5. auto change new value to obsevable

```
// the new object is also observable, you don't need to tranform it manually
// use can listen to the new object
/ see example below:
      const object = reaction({})
      object.person = {name: 'hopperhuang'}
      let name = ''
      object.person.$listen('event', (person) => {
        name = person.name
      })
      object.person.name = 'hopper'
      assert.equal(name, 'hopper')
```

6. define change methods in advanced

```
// maybe u want to use the obsevable like a store to manage some status
// please difine methos in advanced
// see below examples:
      const store = reaction({
        name: 'hopperhuang',
        changeName () {
          // this will target to right object
          this.name = 'hopper'
        }
      })
      store.changeName()
      assert.equal(store.name, 'hopper')
// call child's method
      const team = reaction({
        leader: {
          name: 'hopperhuang',
          changeName () {
            this.name = 'hopper'
          }
        }
      })
      team.leader.changeName()
      assert.equal(team.leader.name, 'hopper')
// u shouldn't do like this
// object.change = () => { /* will not get correct context here */ }
```

7. rebinding listen after object property is dropped, so don't forget re-bind listeners to new object

```
// see examples below:
describe('listeners spy on itself, but not objet\'s keys, when object is dropped, listens is dropped too ', () => {
    it('nothing will change, when then object\'s value changeed the second time ', () => {
      let number = 0
      const proxied = reaction({
        person: {
          name: 'hopperhuang'
        }
      })
      proxied.person.$listen('event', () => {
        number += 1
      })
      proxied.person.name = 'hopper'
      assert.equal(number, 1)
      proxied.person = {name: 'hopperhuang'}
      assert.equal(number, 1)
    })
    it('new value should add new listener by youself', () => {
      let number = 0
      const proxied = reaction({
        person: {
          name: 'hopperhuang'
        }
      })
      proxied.person.$listen('event', () => {
        number += 1
      })
      proxied.person.name = 'hopper'
      assert.equal(number, 1)
      proxied.person = {name: 'hopperhuang'}
      assert.equal(number, 1)
      proxied.person.$listen('event', () => {
        number *= 3
      })
      proxied.person.name = 'huang'
      assert.equal(number, 3)
    })
  })
```