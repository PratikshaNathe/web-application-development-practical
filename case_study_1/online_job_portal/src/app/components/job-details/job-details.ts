
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Job, JobService } from '../../services/job.service';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './job-details.html',
  styleUrl: './job-details.css'
})
export class JobDetails {
  job?: Job;

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.job = this.jobService.getJobById(id);
  }
}
