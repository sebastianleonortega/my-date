import { Component } from '@angular/core';
import { CumpleComponent } from './cumple/cumple.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CumpleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'my-date';
}
