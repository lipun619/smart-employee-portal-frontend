import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary" class="app-header">
      <button mat-icon-button (click)="menuToggle.emit()">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="app-title">Smart Employee Portal</span>
      <span class="spacer"></span>
      <button mat-icon-button title="Profile">
        <mat-icon>account_circle</mat-icon>
      </button>
    </mat-toolbar>
  `,
  styles: [`
    .app-header { position: sticky; top: 0; z-index: 100; }
    .app-title { font-size: 1.1rem; font-weight: 500; margin-left: 8px; }
    .spacer { flex: 1; }
  `]
})
export class HeaderComponent {
  readonly menuToggle = output<void>();
}
