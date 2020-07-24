class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }
  appendChild(vChild) {
    vChild.mountTo(this.root)
  }
  mountTo(parent) {
    parent.appendChild(this.root)
  }
}


class TextWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  mountTo(parent) {
    parent.appendChild(this.root)
  }
}

export const OReact = {
  createElement: function (type, attributes, ...children) {
    let element = document.createElement(type);

    for (let name in attributes) {
      element.setAttribute(name, attributes[name]);
    }

    for (let child of children) {
      if (typeof child === 'string') {
        child = document.createTextNode(child)
      }
      element.appendChild(child)
    }
    // debugger;
    return element
  },
  render: function (vdom, rootElement) {
    vdom.mountTo(rootElement)
  }
}
