import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

import { MxComponent } from './mx';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [ MxComponent, ROUTER_DIRECTIVES ]
})
export class AppComponent {
  title = 'Keypear';
}
