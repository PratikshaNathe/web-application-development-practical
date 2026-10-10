
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Job, JobService } from '../../services/job';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css'
})
export class Jobs {
  searchText = '';

  constructor(
    public jobService: JobService,
    private route: ActivatedRoute
  ) {
    this.route.queryParamMap.subscribe(params => {
      this.searchText = params.get('q') ?? '';
    });
  }

  get filteredJobs(): Job[] {
    const query = this.searchText.trim().toLowerCase();

    if (!query) {
      return this.jobService.jobs;
    }

    return this.jobService.jobs.filter(job =>
      [
        job.title,
        job.company,
        job.location,
        job.type,
        ...job.skills
      ].some(value => value.toLowerCase().includes(query))
    );
  }
}
