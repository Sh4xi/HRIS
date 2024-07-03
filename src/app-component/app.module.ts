import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { LoginModule } from 'src/app/login/login.module';  // Add this import

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,  
    LoginModule  // Add this import
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }