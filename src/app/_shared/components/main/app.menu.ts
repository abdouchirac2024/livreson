// src/app/_shared/components/main/app.menu.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `
    <ul class="layout-menu">
      <ng-container *ngFor="let item of model; let i = index">
        <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="item['root'] === true"></li>
        <li *ngIf="item.separator" class="menu-separator"></li>
      </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {
  model: MenuItem[] = [];

  ngOnInit(): void {
    this.model = [
      // --- TITRE DE SECTION "HOME" ---
      {
        label: 'HOME',
        root: true,
        items: [
          {
            label: 'Dashboard',
            icon: PrimeIcons.HOME,
            routerLink: ['/']
          }
        ]
      },

      // --- TITRE DE SECTION "COMMANDE ET LIVRAISON" ---
      {
        label: 'COMMANDE ET LIVRAISON',
        root: true,
        items: [
          {
            label: 'Courses',
            icon: PrimeIcons.FILE_EDIT,
            routerLink: ['/courses']
          },
          {
            label: 'Colis',
            icon: PrimeIcons.FILE_EDIT,
            routerLink: ['/colis']
          },

          {
            label:'Stocks',
            icon: PrimeIcons.WAREHOUSE,
            routerLink: ['/stock']

          },
          {
            label:'Caisse',
            icon: PrimeIcons.WALLET,
            routerLink: ['/caisse']

          },

          {
            label:'Reporting',
            icon: PrimeIcons.FILE_EDIT,
            routerLink: ['/reporting_courses']

          }
        ]
      },



    ];
  }
}
