import Vue from "../../src";

let data = {a: 1}
let v1 = new Vue(
  {
    data
  }
)

window.v1 = v1
window.data = data

v1.$watch('a', (l, r) => console.log(l, r))