class ElementWrapper {
  constructor(type) {
    // this.root = document.createElement(type);
    this.type = type;
    this.props = Object.create(null);
    this.children = [];
  }
  setAttribute(name, value) {
    // if (name.match(/^on([\s\S]+)$/)) {
    //   console.log(RegExp.$1)
    //   let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase())
    //   this.root.addEventListener(eventName, value)
    // } else {
    //   // this.props[name]/
    //   if (name === 'className') {
    //     name = 'class'
    //   }
    //   this.root.setAttribute(name, value)
    // }
    this.props[name] = value;

  }
  appendChild(vChild) {
    // console.log('vChild', vChild)
    // let range = document.createRange();
    // if (this.root?.children.length) {
    //   range.setStartAfter(this.root.lastChild);
    //   range.setEndAfter(this.root.lastChild);
    // } else {
    //   range.setStart(this.root, 0);
    //   range.setEnd(this.root, 0);
    // }
    // vChild.mountTo(range)
    this.children.push(vChild)
  }
  mountTo(range) {
    this.range = range;
    range.deleteContents();
    let element = document.createElement(this.type);

    for (let name in this.props) {
      let value = this.props[name];
      if (name.match(/^on([\s\S]+)$/)) {
        let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase())
        element.addEventListener(eventName, value);
      } else {
        if (name === 'className') {
          name = 'class'
        }
        element.setAttribute(name, value)
      }
    }

    for (let child of this.children) {
      let range = document.createRange();
      if (element?.children.length) {
        range.setStartAfter(element.lastChild);
        range.setEndAfter(element.lastChild);
      } else {
        range.setStart(element, 0);
        range.setEnd(element, 0);
      }
      child.mountTo(range)
    }
    range.insertNode(element)
  }
}


class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
  mountTo(range) {
    this.range = range;
    range.deleteContents();
    range.insertNode(this.root)
  }
}


class Component {
  constructor() {
    this.children = [];
    this.props = Object.create(null)
  }
  get type() {
    return this.constructor.name;
  }
  setAttribute(name, value) {
    this.props[name] = value;
    this[name] = value;
  }
  mountTo(range) {
    this.range = range;
    this.update();
  }
  update() {

    let vdom = this.render();
    /**
     * 在更新的时候对比vdom实现最小更新
     */
    if (this.vdom) {

      // 判断node 的type props 是否相同
      let isSameNode = (node1, node2) => {
        if (node2.type !== node1.type) {
          return false;
        }
        for (let name in node1.props) {
          if (node1.props[name] !== node2.props[name]) {
            return false;
          }
          if (Object.keys(node2.props).length !== Object.keys(node1.props).length) { // 判断props key是否完全一致，目前方案不可靠
            return false;
          }
          return true;
        }
      }
      // 判断node 的子节点是否是相同的node
      let isSameTree = (node1, node2) => {
        if (!isSameNode(node1, node2)) {
          return false;
        }
        if (node1.children.length !== node2.children.length) {
          return false;
        }
        for (let i = 0; i < node1.children.length; i++) {
          if (!isSameTree(node1.children[i], node2.children[i])) {
            return false;
          }
        }
        return true;
      }
      if (isSameTree(vdom, this.vdom)) { // 如果vdom 新旧一致 则return
        return;
      }
      console.log('new vdom', vdom);
      console.log('old vdom', this.vdom);

      let replace = (newTree, oldTree) => {
        // react diff

        // 如果是相同tree 则不更新
        if (isSameTree(newTree, oldTree)) {
          return;
        }

        /**
         * REACT 更新部分
         */

        // 1. 如果根节点不同 直接更新
        if (!isSameNode(newTree, oldTree)) {
          newTree.mountTo(oldTree.range);
          // children
        } else {
          for (let i = 0; i < newTree.children.length; i++) {
            replace(newTree.children[i], oldTree.children[i]);
          }
        }
      }

      replace(vdom, this.vdom)
      // vdom.mountTo(this.range);
    } else {
      vdom.mountTo(this.range);
    }
    this.vdom = vdom;
  }
  appendChild(vChild) {
    this.children.push(vChild)
  }
  setState(state) {
    let merge = (oldState, newState) => {
      for (let i in newState) {
        if (typeof newState[i] === "object" && newState[i] !== null) {
          if (typeof oldState[i] !== 'object') {
            if (Array.isArray(newState[i])) {
              oldState[i] = [];
            } else {
              oldState[i] = {};
            }
          }
          merge(oldState[i], newState[i])
        } else {
          oldState[i] = newState[i]
        }
      }

    }
    if (!this.state && state) {
      this.state = {}
    }
    merge(this.state, state)
    console.log(this.state)
    this.update()
  }
}

const OReact = {
  createElement: function (type, attributes, ...children) {
    let element;

    /**
     * 通过wrap实现 自定义component和原生dom一样的效果
     * 1. 如果是原生dom则包裹wrapper，
     * 2. 如果是自定义component则new component
     * 并且保证wrapper和component实现同样的方法
     */
    if (typeof type === 'string') {
      element = new ElementWrapper(type)
    } else {
      element = new type()
    }

    for (let name in attributes) {
      element.setAttribute(name, attributes[name]);
    }

    let insertChildren = (children) => {
      for (let child of children) {

        if (Array.isArray(child)) {
          insertChildren(child)
        } else {
          // debugger;
          if (child === null || child === void 0) {
            child = ''
          }
          if (!(child instanceof Component)
            && !(child instanceof TextWrapper)
            && !(child instanceof ElementWrapper)
          ) {
            child = String(child);
          }
          if (typeof child === 'string') {
            child = new TextWrapper(child)
          }
          element.appendChild(child)
        }
      }
    }

    insertChildren(children)

    // debugger;
    return element
  },
  render: function (vdom, rootElement) {
    let range = document.createRange();
    if (rootElement?.children.length) {
      range.setStartAfter(rootElement.lastChild);
      range.setEndAfter(rootElement.lastChild);
    } else {
      range.setStart(rootElement, 0);
      range.setEnd(rootElement, 0);
    }

    vdom.mountTo(range)
  }
}

export {
  Component,
  OReact
}
