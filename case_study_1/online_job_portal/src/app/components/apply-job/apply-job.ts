
import { Component } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Job, JobService } from '../../services/job';

@Component({
  selector: 'app-apply-job',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './apply-job.html',
  styleUrl: './apply-job.css'
})
export class ApplyJob {
  job?: Job;
  submitted = false;

  applicationForm;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private jobService: JobService
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.job = this.jobService.getJobById(id);

    this.applicationForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      skills: ['', Validators.required],
      resume: ['', [
        Validators.required,
        Validators.pattern(/^https?:\/\/.+/i)
      ]]
    });
  }

  onSubmit(): void {
    if (this.applicationForm.invalid || !this.job) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    this.submitted = true;
  }
}

