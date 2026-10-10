
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  searchText = '';

  constructor(private router: Router) {}

  searchJobs(): void {
    this.router.navigate(['/jobs'], {
      queryParams: { q: this.searchText }
    });
  }
}
