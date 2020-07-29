class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      console.log(RegExp.$1)
      let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase())
      this.root.addEventListener(eventName, value)
    } else {
      // this.props[name]/
      if (name === 'className') {
        name = 'class'
      }
      this.root.setAttribute(name, value)
    }
  }
  appendChild(vChild) {
    // console.log('vChild', vChild)
    let range = document.createRange();
    if (this.root?.children.length) {
      range.setStartAfter(this.root.lastChild);
      range.setEndAfter(this.root.lastChild);
    } else {
      range.setStart(this.root, 0);
      range.setEnd(this.root, 0);
    }
    vChild.mountTo(range)
  }
  mountTo(range) {
    range.deleteContents();
    range.insertNode(this.root)
  }
}


class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
  mountTo(range) {
    range.deleteContents();
    range.insertNode(this.root)
  }
}


class Component {
  constructor() {
    this.children = [];
    this.props = Object.create(null)
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
    // 保存待会要删掉的range
    let placeholder = document.createElement('placeholder');
    let range = document.createRange();
    range.setStart(this.range.endContainer, this.range.endOffset);
    range.setEnd(this.range.endContainer, this.range.endOffset);
    range.insertNode(placeholder);

    this.range.deleteContents();

    let vdom = this.render();
    vdom.mountTo(this.range);

    // placeholder.parentNode.removeChild(placeholder)
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
