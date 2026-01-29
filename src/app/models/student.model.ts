export type StudentResult = 'Pass' | 'Fail';

export interface Student {
  studentId: number;
  name: string;
  email: string;
  course: string;
  marks: number;
  result: StudentResult;
}
