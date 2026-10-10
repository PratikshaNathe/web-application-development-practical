
import { Injectable } from '@angular/core';

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  skills: string[];
}

export interface JobApplication {
  name: string;
  email: string;
  phone: string;
  education: string;
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  jobs: Job[] = [
    {
      id: 1,
      title: 'Angular Developer Intern',
      company: 'Tech Solutions',
      location: 'Pune',
      salary: '₹10,000/month',
      type: 'Internship',
      description: 'Develop web applications using Angular and TypeScript.',
      skills: ['Angular', 'HTML', 'CSS', 'TypeScript']
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'WebCraft Technologies',
      location: 'Mumbai',
      salary: '₹3–5 LPA',
      type: 'Full-time',
      description: 'Build responsive websites using modern frontend technologies.',
      skills: ['HTML', 'CSS', 'JavaScript', 'Angular']
    },
    {
      id: 3,
      title: 'Java Developer Trainee',
      company: 'CodeBridge',
      location: 'Nagpur',
      salary: '₹2.5–4 LPA',
      type: 'Full-time',
      description: 'Develop and maintain Java applications.',
      skills: ['Java', 'OOP', 'SQL', 'Git']
    },
    {
      id: 4,
      title: 'Python Developer Intern',
      company: 'Innovate Labs',
      location: 'Remote',
      salary: '₹8,000/month',
      type: 'Internship',
      description: 'Develop Python applications and work with APIs.',
      skills: ['Python', 'SQL', 'REST API']
    },
    {
      id: 5,
      title: 'Junior Web Developer',
      company: 'Digital Hub',
      location: 'Akola',
      salary: '₹2–3 LPA',
      type: 'Full-time',
      description: 'Create and maintain responsive websites.',
      skills: ['HTML', 'CSS', 'JavaScript']
    },
    {
      id: 6,
      title: 'Software Testing Intern',
      company: 'Quality First',
      location: 'Remote',
      salary: '₹7,000/month',
      type: 'Internship',
      description: 'Test web applications and report software bugs.',
      skills: ['Manual Testing', 'Test Cases', 'Bug Reporting']
    }
  ];

  applications: JobApplication[] = [];
  lastSubmittedJobTitle = '';

  getJobById(id: number): Job | undefined {
    return this.jobs.find(job => job.id === id);
  }

  submitApplication(application: JobApplication, job: Job): void {
    this.applications.push({ ...application });
    this.lastSubmittedJobTitle = job.title;
  }
}
