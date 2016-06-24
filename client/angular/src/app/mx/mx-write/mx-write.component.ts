import { Component, OnInit } from '@angular/core';
import { FORM_DIRECTIVES } from '@angular/common';

import { EphemeralMessage, KpCrypto } from '../../kp-crypto';

@Component({
  moduleId: module.id,
  selector: 'app-mx-write',
  templateUrl: 'mx-write.component.html',
  styleUrls: ['mx-write.component.css']
})
export class MxWriteComponent implements OnInit {
  message = new EphemeralMessage();
  tosAgree = false;
  readUrl: string;

  constructor() {}

  ngOnInit() {
  }

  submit() {
    KpCrypto.encryptMessage(this.message);
    this.readUrl = `${document.location.origin}/${this.message.keyB64}`;
  }

  copyReadUrl(readUrlBox: any) {
    readUrlBox.select();
    document.execCommand('copy');
  }

  gotoReadUrl() {
    alert(`Should navigate to: ${this.readUrl}`);
  }

  alert(msg) {
    window.alert(msg);
  }
}
