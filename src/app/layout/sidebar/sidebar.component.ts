import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule],
  template: `
    <div class="sidebar">
      <mat-nav-list>
        @for (item of navItems; track item.route) {
          <a mat-list-item
             [routerLink]="item.route"
             routerLinkActive="active-link"
             [routerLinkActiveOptions]="{ exact: item.route === '/' }">
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </a>
        }
      </mat-nav-list>
    </div>
  `,
  styles: [`
    .sidebar { height: 100%; background: #fafafa; }
    .active-link { background-color: rgba(63, 81, 181, 0.1); color: #3f51b5; font-weight: 500; }
  `]
})
export class SidebarComponent {
  readonly navItems: NavItem[] = [
    { label: 'Employees', icon: 'people', route: '/employees' }
    // Phase 2+: Dashboard, Reports, Settings will be added here
  ];
}
