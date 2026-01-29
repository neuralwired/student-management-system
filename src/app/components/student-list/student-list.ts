import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'sms-student-list',
  imports: [RouterLink],
  templateUrl: './student-list.html',
  styleUrl: './student-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentListComponent {
  private readonly studentService = inject(StudentService);

  protected readonly students = signal<Student[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly alert = signal<{ kind: 'success' | 'danger'; message: string } | null>(null);

  protected readonly isEmpty = computed(() => !this.isLoading() && this.students().length === 0);

  constructor() {
    this.refresh();
  }

  protected refresh(): void {
    this.isLoading.set(true);
    this.alert.set(null);

    this.studentService
      .getStudents()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: students => this.students.set(students),
        error: () => this.alert.set({ kind: 'danger', message: 'Failed to load students.' }),
      });
  }

  protected confirmAndDelete(student: Student): void {
    const ok = window.confirm(`Delete ${student.name}? This cannot be undone.`);
    if (!ok) return;

    this.alert.set(null);

    this.studentService.deleteStudent(student.studentId).subscribe({
      next: () => {
        this.students.update(list => list.filter(s => s.studentId !== student.studentId));
        this.alert.set({ kind: 'success', message: 'Student deleted.' });
      },
      error: () => this.alert.set({ kind: 'danger', message: 'Failed to delete student.' }),
    });
  }

  protected dismissAlert(): void {
    this.alert.set(null);
  }
}
