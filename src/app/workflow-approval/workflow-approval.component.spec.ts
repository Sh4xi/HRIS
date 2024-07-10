import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkflowComponent } from './workflow-approval.component'; // Correct import

describe('WorkflowApprovalComponent', () => {
  let component: WorkflowComponent;
  let fixture: ComponentFixture<WorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
