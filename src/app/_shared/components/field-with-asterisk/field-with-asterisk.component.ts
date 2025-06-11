import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-field-with-asterisk',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './field-with-asterisk.component.html',
  styleUrl: './field-with-asterisk.component.css',
})
export class FieldWithAsteriskComponent {
  @Input() showAsterisk: boolean = true;
}
