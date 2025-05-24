import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorsHubComponent } from './calculators-hub.component';

describe('CalculatorsHubComponent', () => {
  let component: CalculatorsHubComponent;
  let fixture: ComponentFixture<CalculatorsHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculatorsHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculatorsHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
