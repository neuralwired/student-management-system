import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Student, StudentResult } from '../../models/student.model';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'sms-student-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './student-form.html',
  styleUrl: './student-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly studentService = inject(StudentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isSaving = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly alert = signal<{ kind: 'success' | 'danger'; message: string } | null>(null);

  protected readonly studentId = computed(() => {
    const raw = this.route.snapshot.paramMap.get('id');
    const parsed = raw ? Number(raw) : null;
    return Number.isFinite(parsed) ? parsed : null;
  });

  protected readonly isEditMode = computed(() => this.studentId() !== null);
  protected readonly title = computed(() => (this.isEditMode() ? 'Edit Student' : 'Add Student'));

  protected readonly results: readonly StudentResult[] = ['Pass', 'Fail'] as const;

  protected readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [Validators.required]),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    course: this.fb.nonNullable.control('', [Validators.required]),
    marks: this.fb.nonNullable.control<number | null>(null, [Validators.required, Validators.min(0)]),
    result: this.fb.nonNullable.control<StudentResult>('Pass', [Validators.required]),
  });

  constructor() {
    this.loadIfEditing();
  }

  protected submit(): void {
    this.alert.set(null);

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const payload = this.toPayload();
    this.isSaving.set(true);

    const id = this.studentId();
    const request = id === null ? this.studentService.addStudent(payload) : this.studentService.updateStudent(id, payload);

    request
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.alert.set({ kind: 'success', message: id === null ? 'Student added.' : 'Student updated.' });
          void this.router.navigate(['/']);
        },
        error: () => this.alert.set({ kind: 'danger', message: 'Failed to save student.' }),
      });
  }

  protected dismissAlert(): void {
    this.alert.set(null);
  }

  private loadIfEditing(): void {
    const id = this.studentId();
    if (id === null) return;

    this.isLoading.set(true);
    this.studentService
      .getStudentById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: student => this.patchForm(student),
        error: () => this.alert.set({ kind: 'danger', message: 'Student not found.' }),
      });
  }

  private patchForm(student: Student): void {
    this.form.setValue({
      name: student.name,
      email: student.email,
      course: student.course,
      marks: student.marks,
      result: student.result,
    });
  }

  private toPayload(): Omit<Student, 'studentId'> {
    const value = this.form.getRawValue();

    return {
      name: value.name.trim(),
      email: value.email.trim(),
      course: value.course.trim(),
      marks: Number(value.marks),
      result: value.result,
    };
  }
}
