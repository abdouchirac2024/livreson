import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SelectModule} from 'primeng/select';
import {DropdownOption} from '../../../features/courses/models/course.model';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-custom-dropdown',
  imports: [
    SelectModule, FormsModule
  ],
  templateUrl: './custom-dropdown.component.html',
  standalone: true,
  styleUrl: './custom-dropdown.component.scss'
})
export class CustomDropdownComponent implements OnInit {

  @Input() dropdownItems: DropdownOption[] = [];
  @Input() initialSelectedItem: DropdownOption | undefined;
  @Output() selectedItemChange = new EventEmitter<DropdownOption>(); // Output event
  @Input() libelle: string = '';
  @Input() placeholder: string = '';

  internalSelectedItem: DropdownOption | undefined;

  ngOnInit() {
    this.internalSelectedItem = this.initialSelectedItem;
  }

  onDropdownChange(event: any) {
    const selectedValue = event.value;
    console.log('Selected item in child:', selectedValue);
    this.selectedItemChange.emit(selectedValue); // Emit the new value
  }
}
