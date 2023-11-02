import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Quotable';
}
