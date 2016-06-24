import { Router, RouterConfiguration } from 'aurelia-router';

//import { MxWriteComponent } from './mx-write';
//import { MxReadComponent } from './mx-read';

export class MxComponent {
  router: Router;
  
  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'Keypear MX';
    config.map([
      { route: ['', 'new'],     name: 'write',  moduleId: './mx-write',  nav: true,  title: 'Write Message' },
      { route: 'read',          name: 'read',   moduleId: './mx-read',   nav: true,  title: 'Read Message' },
      { route: ':msgkey',       name: 'read',   moduleId: './mx-read',   nav: false },
    ]);

    this.router = router;
  }
}
