import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncaissementsComponent } from './encaissements.component';

describe('EncaissementsComponent', () => {
  let component: EncaissementsComponent;
  let fixture: ComponentFixture<EncaissementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncaissementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncaissementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
