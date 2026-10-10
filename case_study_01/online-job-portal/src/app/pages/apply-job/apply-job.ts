
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Job, JobApplication, JobService } from '../../services/job';

@Component({
  selector: 'app-apply-job',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './apply-job.html',
  styleUrl: './apply-job.css'
})
export class ApplyJob {
  job: Job | undefined;

  applicant: JobApplication = {
    name: '',
    email: '',
    phone: '',
    education: ''
  };

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

  submitApplication(): void {
    if (!this.job) {
      return;
    }

    this.jobService.submitApplication(this.applicant, this.job);
    this.router.navigate(['/application-success']);
  }
}
