import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldWithAsteriskComponent } from './field-with-asterisk.component';

describe('FieldWithAsterixComponent', () => {
  let component: FieldWithAsteriskComponent;
  let fixture: ComponentFixture<FieldWithAsteriskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldWithAsteriskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldWithAsteriskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
