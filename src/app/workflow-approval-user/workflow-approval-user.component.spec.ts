//spec ts

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowApprovalUserComponent } from './workflow-approval-user.component';

describe('WorkflowApprovalUserComponent', () => {
  let component: WorkflowApprovalUserComponent;
  let fixture: ComponentFixture<WorkflowApprovalUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowApprovalUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorkflowApprovalUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
