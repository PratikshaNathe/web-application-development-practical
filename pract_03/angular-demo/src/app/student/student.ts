import { Component } from '@angular/core';
import { NgIf, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-student',
  imports: [NgIf, UpperCasePipe],
  templateUrl: './student.html',
  styleUrl: './student.css'
})
export class Student {

  name = 'Pratiksha';
  course = 'Information Technology';
  show = false;

  showDetails() {
    this.show = !this.show;
  }
}