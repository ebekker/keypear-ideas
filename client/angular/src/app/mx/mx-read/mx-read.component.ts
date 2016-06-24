import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'app-mx-read',
  templateUrl: 'mx-read.component.html',
  styleUrls: ['mx-read.component.css']
})
export class MxReadComponent implements OnInit {
  msgKey: string = 'n/a';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // this.route.params
    //   .map(params => params['id']).subscribe((id) => {
    //     //this.msgKey = id;
    //   })

    let msgKey = this.route.snapshot.params['id'];
    if (msgKey != null && msgKey.trim().length > 0) {
      this.msgKey = msgKey;
    }
  }
}
