import { Component } from '@angular/core';
import {
  IonicModule,
  NavController,
  ToastController,
  LoadingController,
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterModule],
})
export class RegisterPage {
  registerForm = this.fb.group({
    pseudo: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private nav: NavController,
    private toast: ToastController,
    private loading: LoadingController
  ) {}

  get f() {
    return this.registerForm.controls;
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }
    const loading = await this.loading.create({ message: 'Inscription...' });
    await loading.present();

    this.auth
      .register(
        this.registerForm.value as {
          pseudo: string;
          email: string;
          password: string;
        }
      )
      .subscribe({
        next: async () => {
          await loading.dismiss();
          const t = await this.toast.create({
            message: 'Inscription réussie, en attente de validation.',
            duration: 2000,
            color: 'success',
          });
          await t.present();
          this.nav.navigateRoot('/auth/login');
        },
        error: async (err) => {
          await loading.dismiss();
          const t = await this.toast.create({
            message: err.error?.message || 'Erreur lors de l’inscription.',
            duration: 2000,
            color: 'danger',
          });
          await t.present();
        },
      });
  }
}
