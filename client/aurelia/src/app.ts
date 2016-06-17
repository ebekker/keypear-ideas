import {Aurelia} from 'aurelia-framework';
import {Router, RouterConfiguration, NavigationInstruction} from 'aurelia-router';
import {KeypearMx} from './mx/mx';
import {KeypearSx} from './sx/sx';
import {FBTest} from './fb/fb';

export class App {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {

    // To support router paths without the '#' uncomment this
    // and uncomment the <base> tag in index.html as per:
    //    https://github.com/aurelia/router/issues/303
    //config.options.pushState = true;

    config.title = 'Aurelia';
    config.map([
      { route: '', redirect: 'mx' },
      { route: 'mx',            name: 'mx',           moduleId: 'mx/mx',           nav: true,  title: 'MX'},
      { route: 'sx',            name: 'sx',           moduleId: 'sx/sx',           nav: true,  title: 'SX'},
      { route: 'fb',            name: 'fb',           moduleId: 'fb/fb',           nav: true,  title: 'FB Test'},
      { route: 'child-router',  name: 'child-router', moduleId: 'child-router',    nav: true,  title: 'Child Router' },
      { route: ':msgkey',       name: 'mx-msg',       moduleId: 'mx/mx-read',      nav: false, href: "mx" }
    ]);
    // Assume the default route is an MX message key,
    // re-route it to the mx component with the key as a parameter
    /*
    config.mapUnknownRoutes((instruction: NavigationInstruction) => {
      
      //return instruction.config; //`mx/read?m=${instruction.fragment}`;
      return router.
    });
    */
    this.router = router;
  }
}
