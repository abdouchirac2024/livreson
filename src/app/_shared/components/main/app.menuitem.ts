// src/app/_shared/components/main/app.menuitem.ts
import {Component, HostBinding, Input, OnInit, OnDestroy} from '@angular/core';
import {NavigationEnd, Router, RouterModule} from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {CommonModule} from '@angular/common';
import {RippleModule} from 'primeng/ripple';
import {MenuItem} from 'primeng/api';
import {LayoutService} from '../../services/layout.service';

@Component({
  selector: '[app-menuitem]',
  standalone: true,
  imports: [CommonModule, RouterModule, RippleModule],
  template: `
    <ng-container>
      <!-- CAS 1: C'est un TITRE DE SECTION (propriété 'root' est vraie DANS LE MODÈLE) -->
      <div *ngIf="item['isGroupTitle'] === true && item.visible !== false" class="layout-menuitem-root-text">
        {{ item.label }}
      </div>

      <!-- CAS 2: C'est un ÉLÉMENT DE MENU CLiquable (pas un titre de section pur) -->
      <!--   Peut être un parent d'accordéon OU un lien final. -->
      <!--   Ne s'affiche que si ce n'est PAS un titre de groupe. -->
      <a *ngIf="item['isGroupTitle'] !== true && item.visible !== false"
         [attr.href]="item.url"
         (click)="itemClick($event)"
         [ngClass]="item.styleClass"
         [attr.target]="item.target"
         [routerLink]="item.routerLink"
         routerLinkActive="active-route"
         [routerLinkActiveOptions]="item.routerLinkActiveOptions || { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' }"
         tabindex="0"
         pRipple>
        <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
        <span class="layout-menuitem-text">{{ item.label }}</span>
        <i class="pi pi-fw pi-angle-down layout-submenu-toggler" *ngIf="item.items && item.items.length > 0"></i>
      </a>

      <!-- Affiche la liste <ul> des sous-items pour TOUS les types d'items qui ont des enfants -->
      <ul *ngIf="item.items && item.items.length > 0 && item.visible !== false" [@children]="submenuAnimationState">
        <ng-template ngFor let-child let-i="index" [ngForOf]="item.items">
          <!-- Les enfants sont toujours des éléments de menu normaux (pas des titres de groupe ici) -->
          <li app-menuitem [item]="child" [index]="i" [parentKey]="key" [root]="false" [class]="child['badgeClass']"></li>
        </ng-template>
      </ul>
    </ng-container>
  `,
  animations: [
    trigger('children', [
      state('collapsed', style({ height: '0', overflow: 'hidden' })), // Ajout overflow: hidden
      state('expanded', style({ height: '*', overflow: 'hidden'  })), // Ajout overflow: hidden
      transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ],
})
export class AppMenuitem implements OnInit, OnDestroy {
  // La propriété @Input() root n'est plus utilisée directement pour le template,
  // on se basera sur une propriété custom `isGroupTitle` dans le MenuItem.
  // @Input() @HostBinding('class.layout-root-menuitem') root!: boolean; // On peut la garder pour le HostBinding si besoin

  @Input() item!: MenuItem & { isGroupTitle?: boolean }; // Étendre MenuItem pour notre propriété custom
  @Input() index!: number;
  @Input() parentKey!: string;
  // La propriété root est toujours passée par le parent, mais on l'utilise différemment
  @Input() root!: boolean;


  active = false; // Si cet item (accordéon) est ouvert

  menuSourceSubscription!: Subscription;
  menuResetSubscription!: Subscription;
  key: string = '';

  constructor(
    public router: Router,
    private layoutService: LayoutService
  ) {
    this.menuSourceSubscription = this.layoutService.menuSource$.subscribe((value) => {
      Promise.resolve(null).then(() => {
        if (this.item && !this.item['isGroupTitle']) { // Ne pas affecter l'état 'active' des titres de groupe
            if (value.routeEvent) {
                this.active = !!(value.key === this.key || value.key.startsWith(this.key + '-'));
            } else {
                if (value.key !== this.key && !value.key.startsWith(this.key + '-')) {
                this.active = false;
                }
            }
        }
      });
    });

    this.menuResetSubscription = this.layoutService.resetSource$.subscribe(() => {
        if (!this.item['isGroupTitle']) { // Ne pas réinitialiser l'état 'active' des titres de groupe
            this.active = false;
        }
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (this.item && this.item.routerLink && !this.item['isGroupTitle']) {
        this.updateActiveStateFromRoute();
      }
    });
  }

  ngOnInit(): void {
    this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);
    if (this.item && this.item.routerLink && !this.item['isGroupTitle']) {
      this.updateActiveStateFromRoute();
    }
  }

  updateActiveStateFromRoute(): void {
    if (this.item && this.item.routerLink) {
        const linkPath = Array.isArray(this.item.routerLink) ? this.item.routerLink[0] : this.item.routerLink;
        let activeRoute = this.router.isActive(
            linkPath as string,
            this.item.routerLinkActiveOptions || { paths: 'exact', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' }
        );
        if (activeRoute) {
            this.layoutService.onMenuStateChange({ key: this.key, routeEvent: true });
        }
    }
  }

  itemClick(event: Event): void {
    // Ne rien faire si c'est un titre de groupe
    if (this.item['isGroupTitle']) {
        event.preventDefault();
        return;
    }

    if (this.item.disabled) {
      event.preventDefault();
      return;
    }

    if (this.item.command) {
      this.item.command({ originalEvent: event, item: this.item });
    }

    if (this.item.items && this.item.items.length > 0) {
      this.active = !this.active;
    } else if (this.item.routerLink || this.item.url) {
      if (this.layoutService.isMobile() || this.layoutService.isOverlay()) {
          this.layoutService.onMenuToggle();
      }
      this.active = false;
    }
    this.layoutService.onMenuStateChange({ key: this.key });
  }

  // Renommé pour plus de clarté
  get submenuAnimationState(): string {
    // Les items d'un titre de groupe sont toujours "visibles" (la liste <ul> est rendue),
    // mais l'animation d'ouverture/fermeture est contrôlée par l'état 'active' du parent
    // pour les éléments accordéons.
    // Pour un titre de groupe lui-même, ses 'items' sont toujours 'expanded' car ils sont listés en dessous.
    if (this.item['isGroupTitle']) return 'expanded';
    return this.active ? 'expanded' : 'collapsed';
  }

  @HostBinding('class.active-menuitem')
  get activeClass(): boolean {
    // Un titre de groupe ne doit pas avoir la classe active-menuitem
    return this.active && !this.item['isGroupTitle'];
  }

  ngOnDestroy(): void {
    if (this.menuSourceSubscription) {
      this.menuSourceSubscription.unsubscribe();
    }
    if (this.menuResetSubscription) {
      this.menuResetSubscription.unsubscribe();
    }
  }
}
