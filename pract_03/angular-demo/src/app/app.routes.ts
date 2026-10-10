import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Student } from './student/student';
import { About } from './about/about';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'student', component: Student },
  { path: 'about', component: About }
];