import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-organization',
  imports: [],
  templateUrl: './organization.html',
  styleUrl: './organization.css',
})
export class Organization {
  readonly isEditing = signal(false);

  readonly organization = {
    name: 'WorkSphere Technologies',
    code: 'WS-ORG-001',
    industry: 'Software & Technology',
    email: 'admin@worksphere.example',
    phone: '+91 98765 43210',
    address: 'Bhubaneswar, Odisha, India',
    employees: 128,
  };

  toggleEdit(): void {
    this.isEditing.update((value) => !value);
  }
}
