
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Job, JobService } from '../../services/job.service';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './job-list.html',
  styleUrl: './job-list.css'
})
export class JobList {
  jobs: Job[];
  searchText = '';

  constructor(private jobService: JobService) {
    this.jobs = this.jobService.getJobs();
  }

  get filteredJobs(): Job[] {
    const query = this.searchText.toLowerCase().trim();

    return this.jobs.filter(job =>
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    );
  }
}
