import { Component, OReact } from '../oReact';

class MyComponent extends Component{
  render() {
    return <div name={'111'}>
      <div>123</div>
      <div>123123</div>
      <div>
        {this.children}
      </div>
    </div>
  }
}

let c = <div><MyComponent name="!">
  <div>asd</div>
  <div>asd</div>
  <div>asd</div>
</MyComponent></div>

OReact.render(
  c,
  document.body
)
