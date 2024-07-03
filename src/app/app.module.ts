import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    HttpClientModule,
  ],
})
export class AppModule { }

// You should move the getBackendData function to a service or a component
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  getBackendData() {
    this.http.get('http://your-backend-url/api/data')
     .subscribe(
        (response: any) => {
          console.log(response);
        },
        (error: any) => {
          console.error(error);
        }
      );
  }
}