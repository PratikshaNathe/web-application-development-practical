
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { JobList } from './components/job-list/job-list';
import { JobDetails } from './components/job-details/job-details';
import { ApplyJob } from './components/apply-job/apply-job';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'jobs', component: JobList },
  { path: 'jobs/:id', component: JobDetails },
  { path: 'apply/:id', component: ApplyJob },
  { path: '**', redirectTo: '' }
];
