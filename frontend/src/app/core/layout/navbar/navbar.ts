import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '../../auth/auth';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  constructor(
    private readonly auth: Auth,
    private readonly router: Router,
  ) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
