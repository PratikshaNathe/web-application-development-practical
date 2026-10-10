
import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Jobs } from './pages/jobs/jobs';
import { JobDetails } from './pages/job-details/job-details';
import { ApplyJob } from './pages/apply-job/apply-job';
import { ApplicationSuccess } from './pages/application-success/application-success';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Home | CareerConnect'
  },
  {
    path: 'jobs',
    component: Jobs,
    title: 'Find Jobs | CareerConnect'
  },
  {
    path: 'jobs/:id/apply',
    component: ApplyJob,
    title: 'Apply for Job | CareerConnect'
  },
  {
    path: 'jobs/:id',
    component: JobDetails,
    title: 'Job Details | CareerConnect'
  },
  {
    path: 'application-success',
    component: ApplicationSuccess,
    title: 'Application Submitted | CareerConnect'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
