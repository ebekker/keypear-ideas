import Firebase = require('firebase');

const fb = new Firebase('https://keypearmx.firebaseio.com');

export class FBTest {
  items: Object[];

  constructor() {
    this.items = [];
    fb.auth("AIzaSyDEWtu3SrAPTKAWRXIaByNrcW5J5fE2t9A", (err, res) => {
      fb.child("items").on("child_added", (child, prevKey) => {
        this.items.push({ key: child.key(), value: child.val() });
      })
      fb.child("items").on("child_changed", (child) => {
        var k = child.key()
        this.items.filter((value: any, index, array) => {
          return value.key === k
        }).forEach((val: any) => { val.value = child.val() })
      })
      fb.child("items").on("child_removed", (child) => {
        var k = child.key()
        this.items.forEach((val: any, index: number) => {
           if (k === val.key) {
             this.items.splice(index, 1)
           }
        })
      })
    })
  }
}
