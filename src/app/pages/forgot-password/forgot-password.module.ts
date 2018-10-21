import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ForgotPasswordComponent } from './forgot-password.component';

export const routes = [
    { path: '', component: ForgotPasswordComponent, pathMatch: 'full' }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        SharedModule
    ],
    declarations: [
        ForgotPasswordComponent
    ]
})
export class ForgotPasswordModule { }
