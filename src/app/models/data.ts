// Personnel Information Management
interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'Male' | 'Female' | 'Other';
    contactInformation: string;
    address: string;
    department: string;
    position: string;
    employmentStatus: 'Full-time' | 'Part-time' | 'Contract';
    joiningDate: Date;
    terminationDate?: Date;
    emergencyContactInformation: string;
  }
  
  // Payroll Management
  interface PayrollRecord {
    employeeId: number;
    basicSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    paymentMethod: string;
    paymentDate: Date;
    taxInformation: string;
    bankAccountDetails: string;
  }
  
  // Employee Information Management
  interface EmployeeQualification {
    employeeId: number;
    education: string;
    certifications: string[];
    skills: string[];
    trainingHistory: string[];
    performanceReviews: string[];
  }
  
  // Time & Attendance Management
  interface AttendanceRecord {
    employeeId: number;
    date: Date;
    clockInTime: Date;
    clockOutTime: Date;
    breaks: string[];
  }
  
  // Online Job Application Portal
  interface JobApplication {
    applicantId: number;
    positionAppliedFor: string;
    resume: string; // link or storage reference
    coverLetter: string;
    applicationStatus: 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected';
    interviewNotes?: string;
  }
  
  // Recruitment, Selection and Placement
  interface RecruitmentData {
    jobOpenings: string[];
    applicants: number[]; // Applicant IDs
    interviewSchedule: Date[];
    hiringDecisions: string[];
    offerLetters: string[];
  }
  
  // Learning and Development (L&D)
  interface TrainingRecord {
    trainingId: number;
    trainingTitle: string;
    trainer: string;
    participants: number[]; // Employee IDs
    duration: number; // hours
    feedback: string;
    certification?: string;
  }
  
  // Rewards and Recognition
  interface EmployeeReward {
    recognitionType: string;
    awardTitle: string;
    date: Date;
    recipient: string;
  }
  
  // Performance Management
  interface PerformanceReview {
    employeeId: number;
    reviewPeriod: string;
    goals: string[];
    ratings: number[];
    feedback: string[];
    developmentPlan: string;
  }
  
  // Health and Wellness
  interface HealthRecord {
    employeeId: number;
    medicalHistory: string;
    healthScreenings: Date[];
    wellnessProgramsParticipation: string[];
  }
  
  // Forms and Workflow
  interface FormSubmission {
    formId: number;
    formType: string;
    submissionDate: Date;
    approvals: string[]; // User IDs or roles
  }
  
  // Reports
  interface Report {
    reportId: number;
    reportType: string;
    date: Date;
    author: string;
    description: string;
  }
  
  // Data Exchange (Export and Import)
  interface DataExchangeLog {
    logId: number;
    dataType: string;
    importExportDate: Date;
    status: 'Success' | 'Failed';
    errors?: string[];
  }
  
  // Data Visualization
  interface VisualizationData {
    visualizationId: number;
    chartType: string;
    dataSource: string;
    filters: string[];
    dateRange: Date[];
  }
  
  // Reports Access
  interface ReportAccess {
    reportId: number;
    rolePermission: string;
    usersGroups: string[]; // User IDs or group names
  }
  
  // Data Access
  interface DataAccess {
    dataType: string;
    rolePermission: string;
    usersGroups: string[]; // User IDs or group names
  }
  
  // Reports Access Data
  const reportsAccessData: ReportAccess[] = [
    { reportId: 1, rolePermission: 'Admin', usersGroups: ['user1', 'group1'] },
    { reportId: 2, rolePermission: 'Manager', usersGroups: ['manager1', 'group2'] },
    // Add more entries as needed
  ];
  
  // Data Access Data
  const dataAccessData: DataAccess[] = [
    { dataType: 'Employee Records', rolePermission: 'Admin', usersGroups: ['user1', 'group1'] },
    { dataType: 'Financial Data', rolePermission: 'Finance Team', usersGroups: ['finance1', 'finance2'] },
    // Add more entries as needed
  ];