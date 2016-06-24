import { bootstrap } from '@angular/platform-browser-dynamic';
import { provideRouter } from '@angular/router'; 

import { enableProdMode } from '@angular/core';

import { AppComponent, environment } from './app/';
import { MxComponent } from './app/mx';
import { MxReadComponent } from './app/mx/mx-read';
import { MxWriteComponent } from './app/mx/mx-write';

if (environment.production) {
  enableProdMode();
}

bootstrap(AppComponent, [
  provideRouter([
    { path: '', component: MxComponent },
    { path: '/mx/new', component: MxWriteComponent },
    { path: '/mx/read', component: MxReadComponent },
    { path: '/mx/read/:id', component: MxReadComponent }
  ])
]);
