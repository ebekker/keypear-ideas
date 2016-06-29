import { autoinject } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';

import { KpApp } from './kp-app';

@autoinject
export class App {
  router: Router;

  constructor(private kpApp: KpApp) {}
  
  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'Keypear';
    config.map([
      { route: ['', 'mx'],      name: 'mx',           moduleId: 'mx/mx-write',  nav: true, title: 'MX' },
      { route: 'welcome',       name: 'welcome',      moduleId: 'welcome',      nav: true, title: 'Welcome' },
      { route: 'users',         name: 'users',        moduleId: 'users',        nav: true, title: 'Github Users' },
      { route: 'child-router',  name: 'child-router', moduleId: 'child-router', nav: true, title: 'Child Router' },
      { route: ':msgkey',       name: 'mx-read',      moduleId: 'mx/mx-read',   nav: false }
    ]);

    this.router = router;
  }
}
