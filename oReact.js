class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }
  appendChild(vChild) {
    console.log('vChild', vChild)
    vChild.mountTo(this.root)
  }
  mountTo(parent) {
    parent.appendChild(this.root)
  }
}


class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
  mountTo(parent) {
    parent.appendChild(this.root)
  }
}


class Component {
  constructor() {
    this.children = [];

  }
  setAttribute(name, value) {
    this[name] = value;
  }
  mountTo(parent) {
    let vdom = this.render();
    vdom.mountTo(parent)
  }
  appendChild(vChild) {
    this.children.push(vChild)
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
          debugger;
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
    vdom.mountTo(rootElement)
  }
}

export {
  Component,
  OReact
}
