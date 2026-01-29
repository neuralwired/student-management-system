import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { Student } from '../models/student.model';

const STORAGE_KEY = 'sms.students.v1';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private readonly simulatedLatencyMs = 150;
  private inMemory: Student[] | null = null;

  getStudents(): Observable<Student[]> {
    return of(this.readAll()).pipe(delay(this.simulatedLatencyMs));
  }

  getStudentById(studentId: number): Observable<Student> {
    const found = this.readAll().find(s => s.studentId === studentId);
    if (!found) {
      return throwError(() => new Error('Student not found')).pipe(delay(this.simulatedLatencyMs));
    }

    return of(found).pipe(delay(this.simulatedLatencyMs));
  }

  addStudent(student: Omit<Student, 'studentId'>): Observable<Student> {
    const students = this.readAll();
    const nextId = students.length === 0 ? 1 : Math.max(...students.map(s => s.studentId)) + 1;

    const created: Student = {
      studentId: nextId,
      ...student,
    };

    this.writeAll([created, ...students]);
    return of(created).pipe(delay(this.simulatedLatencyMs));
  }

  updateStudent(studentId: number, student: Omit<Student, 'studentId'>): Observable<Student> {
    const students = this.readAll();
    const index = students.findIndex(s => s.studentId === studentId);

    if (index === -1) {
      return throwError(() => new Error('Student not found')).pipe(delay(this.simulatedLatencyMs));
    }

    const updated: Student = {
      studentId,
      ...student,
    };

    const next = [...students];
    next[index] = updated;
    this.writeAll(next);

    return of(updated).pipe(delay(this.simulatedLatencyMs));
  }

  deleteStudent(studentId: number): Observable<void> {
    const students = this.readAll();
    const next = students.filter(s => s.studentId !== studentId);

    if (next.length === students.length) {
      return throwError(() => new Error('Student not found')).pipe(delay(this.simulatedLatencyMs));
    }

    this.writeAll(next);
    return of(void 0).pipe(delay(this.simulatedLatencyMs));
  }

  private readAll(): Student[] {
    if (this.inMemory) return this.inMemory;

    let raw: string | null = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage can be unavailable (blocked, private mode, etc.). Fall back to memory.
    }

    if (!raw) {
      const seeded = this.seed();
      this.writeAll(seeded);
      return seeded;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid storage format');
      }

      return parsed as Student[];
    } catch {
      const seeded = this.seed();
      this.writeAll(seeded);
      return seeded;
    }
  }

  private writeAll(students: Student[]): void {
    this.inMemory = students;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch {
      // Intentionally ignore; in-memory fallback keeps the app functional.
    }
  }

  private seed(): Student[] {
    return [
      {
        studentId: 1,
        name: 'Ava Johnson',
        email: 'ava.johnson@example.com',
        course: 'Computer Science',
        marks: 88,
        result: 'Pass',
      },
      {
        studentId: 2,
        name: 'Noah Williams',
        email: 'noah.williams@example.com',
        course: 'Business Administration',
        marks: 62,
        result: 'Pass',
      },
      {
        studentId: 3,
        name: 'Sophia Brown',
        email: 'sophia.brown@example.com',
        course: 'Mathematics',
        marks: 45,
        result: 'Fail',
      },
    ];
  }
}
