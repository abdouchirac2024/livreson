import {Component, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {PrimeNG} from 'primeng/config';

@Component({
  selector: 'app-root',
  imports: [RouterModule],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private translateService: TranslateService, private primeng: PrimeNG) {
  }

  ngOnInit(): void {
    this.primeng.ripple.set(true);
    this.translateService.setDefaultLang('fr');
  }
}
