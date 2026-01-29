import { Routes } from '@angular/router';
import { StudentFormComponent } from './components/student-form/student-form';
import { StudentListComponent } from './components/student-list/student-list';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'students' },
	{ path: 'students', component: StudentListComponent },
	{ path: 'students/add', component: StudentFormComponent },
	{ path: 'students/edit/:id', component: StudentFormComponent },
	{ path: '**', redirectTo: 'students' },
];
