import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private supabaseUrl = 'https://vhmftufkipgbxmcimeuq.supabase.co/rest/v1';
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZobWZ0dWZraXBnYnhtY2ltZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk5MDExODAsImV4cCI6MjAzNTQ3NzE4MH0.7bzTx5n4SpXA1Go9kCRfgsxUIpK8j68vM-hIpVKJcnw';

  constructor(private http: HttpClient) {}

  submitTicket(ticket: any): Observable<any> {
    const headers = new HttpHeaders({
      'apikey': this.supabaseKey,
      'Authorization': `Bearer ${this.supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    });

    return this.http.post(
      `${this.supabaseUrl}/ticket`,
      ticket,
      { headers: headers }
    );
  }
}
