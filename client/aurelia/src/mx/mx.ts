
import {Router, RouterConfiguration} from 'aurelia-router';

export class KeypearMx {
  router: Router;

  heading = 'Keypear MX';

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: ['', 'write'], name: 'mx-write',       moduleId: 'mx/mx-write',      nav: true, title: 'Write Message' },
      { route: 'read',        name: 'mx-read',        moduleId: 'mx/mx-read',       nav: true, title: 'Read Message'  }
    ]);

    this.router = router;
  }
}
