
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { JobService } from '../../services/job';

@Component({
  selector: 'app-application-success',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './application-success.html',
  styleUrl: './application-success.css'
})
export class ApplicationSuccess {
  constructor(public jobService: JobService) {}
}
