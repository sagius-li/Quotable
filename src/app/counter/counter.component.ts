import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { interval } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.css'],
})
export class CounterComponent implements OnInit {
  @ViewChild('counterLabel') counterLabel!: ElementRef;

  counter = 0;
  labelColor = '#008000';

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    // set the counter label colour with a low opacity
    if (this.counterLabel) {
      this.renderer.setStyle(
        this.counterLabel.nativeElement,
        'color',
        `${this.labelColor}30`
      );
    }

    // define an observable object, which invokes every 2 seconds
    const obs = interval(2000);
    obs.pipe(
      // wait for 3 seconds at the beginning
      delay(3000),
      tap(() => {
        // add an increment between 1 and 9 to the counter
        const increment = Math.floor(Math.random() * 9) + 1;
        this.counter += increment;
        console.log(this.counter);

        // gradually increase the colour opacity of the counter label
        if (this.counter < 200) {
          const hex = (this.counter + 50).toString(16);
          if (this.counterLabel) {
            this.renderer.setStyle(
              this.counterLabel.nativeElement,
              'color',
              `${this.labelColor}${hex}`
            );
          }
        }
      })
    );
  }
}
