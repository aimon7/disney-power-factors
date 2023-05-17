import {
  Component,
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Disney Characters';

  inputValue: string;
  userCharacterNameUpdate = new Subject<string>();

  constructor() {
    // Debounce search.
    this.userCharacterNameUpdate.pipe(
      debounceTime(300),
      distinctUntilChanged())
      .subscribe(value => {
        this.inputValue =  value;
      });
  }

  onEnter(value: string) {
    this.inputValue = value;
  }
}
