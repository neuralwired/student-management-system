import { Routes } from '@angular/router';
import { StudentFormComponent } from './components/student-form/student-form';
import { StudentListComponent } from './components/student-list/student-list';

export const routes: Routes = [
	{ path: '', component: StudentListComponent },
	{ path: 'add', component: StudentFormComponent },
	{ path: 'edit/:id', component: StudentFormComponent },

	{ path: 'students', redirectTo: '' },
	{ path: 'students/add', redirectTo: 'add' },
	{ path: 'students/edit/:id', redirectTo: 'edit/:id' },

	{ path: '**', redirectTo: '' },
];
