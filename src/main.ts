import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app-component/app.config';
import { AppComponent } from './app-component/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app-component/app.routes';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideRouter(routes)
  ]
})
.catch((err) => console.error(err));

