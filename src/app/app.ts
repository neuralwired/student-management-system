import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('Student Management System');

  protected readonly isNavExpanded = signal(false);

  protected toggleNav(): void {
    this.isNavExpanded.update(v => !v);
  }

  protected closeNav(): void {
    this.isNavExpanded.set(false);
  }
}
