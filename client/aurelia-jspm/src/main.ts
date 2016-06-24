import 'bootstrap';
import {Aurelia} from 'aurelia-framework';

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging();

  //Uncomment the line below to enable animation.
  //aurelia.use.plugin('aurelia-animator-css');

  aurelia.use.plugin('aurelia-polymer');
  //Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  aurelia.use.plugin('aurelia-html-import-template-loader'); // As per the polymer guidance

  aurelia.start().then(() => aurelia.setRoot());
}
