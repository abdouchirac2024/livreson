import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingCoursesComponent } from './reporting-courses.component';

describe('ReportingCoursesComponent', () => {
  let component: ReportingCoursesComponent;
  let fixture: ComponentFixture<ReportingCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportingCoursesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportingCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
