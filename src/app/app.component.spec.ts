import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('updates the current search value on enter', () => {
    const component = new AppComponent();

    component.onEnter('Mickey Mouse');

    expect(component.inputValue).toBe('Mickey Mouse');
  });
});
