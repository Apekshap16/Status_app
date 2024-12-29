import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { io } from 'socket.io-client';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'Status_app';
  services: any[] = [];
  incidents: any[] = [];
  form: FormGroup;
  socket: any;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: [''],
      status: ['Operational'],
    });
  }

  ngOnInit() {
    this.socket = io('http://localhost:3000');
    this.socket.on('update', (data: any) => {
      this.services = data;
    });

    this.fetchServices();
  }

  // fetchServices() {
  //   this.http.get('/api/services').subscribe((data: any) => {
  //     this.services = data;
  //   });
  // }

  // addService() {
  //   this.http.post('/api/services', this.form.value).subscribe(() => {
  //     this.form.reset();
  //   });
  // }
  fetchServices() {
    // Update the URL to point to the backend (port 3000)
    this.http.get('http://localhost:3000/api/services').subscribe((data: any) => {
      this.services = data;
    });
  }
  
  addService() {
    // Update the URL to point to the backend (port 3000)
    this.http.post('http://localhost:3000/api/services', this.form.value).subscribe(() => {
      this.form.reset();
    });
  }
  updateService(id: number, status: string) {
    this.http.put(`http://localhost:3000/api/services/${id}`, { status }).subscribe();
  }
  // updateService(id: number, status: string) {
  //   this.http.put(`/api/services/${id}`, { status }).subscribe();
  // }
}
