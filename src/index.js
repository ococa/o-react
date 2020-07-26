import { Component, OReact } from '../oReact';

class MyComponent extends Component{
  render() {
    return <div name={'111'}><div>123</div><div>123123</div>cool</div>
  }
}

let c = <div><MyComponent name="!"></MyComponent></div>

OReact.render(
  c,
  document.body
)
