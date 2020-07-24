import {OReact} from "../oReact";

class MyComponent {
  render() {
    return <div>cool</div>
  }
  montTo(parent) {
    let vdom = this.render();
    vdom.mountTo(parent)

  }

}


let a = <div name={"222"}>
  <div>1</div>
  <div>2</div>
  <div>33</div>
  <div>44</div>
  <div>55</div>
</div>

OReact.render(
  a,
  document.body
)
