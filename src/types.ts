export type CourseType = "Lecture" | "Lab" | "Both";

export interface Course {
  id: string;
  code: string;
  title: string;
  type: CourseType;
  credits: number;
  price: number;
  prerequisites: string[];
  instructorId?: string;
  capacity: number;
}

export interface Instructor {
  id: string;
  name: string;
  department: string;
}

export type ShiftingStatus = "pending" | "approved" | "rejected";

export interface ShiftingApplication {
  id: string;
  studentId: string;
  studentName: string;
  currentProgram: string;
  targetProgram: string;
  reason: string;
  status: ShiftingStatus;
  submittedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}
