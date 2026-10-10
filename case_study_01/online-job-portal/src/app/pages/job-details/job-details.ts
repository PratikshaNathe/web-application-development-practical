
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Job, JobService } from '../../services/job';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './job-details.html',
  styleUrl: './job-details.css'
})
export class JobDetails {
  job: Job | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (Number.isInteger(id) && id > 0) {
      this.job = this.jobService.getJobById(id);
    }

    if (!this.job) {
      this.router.navigate(['/jobs']);
    }
  }
}
