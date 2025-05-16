import { Component } from '@angular/core';
import { IonicModule, NavController, ToastController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterModule]
})
export class LoginPage {
  loginForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private nav: NavController,
    private toast: ToastController,
    private loading: LoadingController
  ) {}

  get l() { return this.loginForm.controls; }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loading = await this.loading.create({
      message: 'Connexion...'
    });
    await loading.present();

    const { email, password } = this.loginForm.value!;

    if (!email) {
      await loading.dismiss();
      await this.toast.create({
        message: 'Erreur : l’email est vide.',
        duration: 2000,
        color: 'danger'
      }).then(t => t.present());
      return;
    }

    if (!password) {
      await loading.dismiss();
      await this.toast.create({
        message: 'Erreur : le mot de passe est vide.',
        duration: 2000,
        color: 'danger'
      }).then(t => t.present());
      return;
    }

    this.auth.login(email, password).subscribe({
      next: async () => {
        await loading.dismiss();
        this.nav.navigateRoot('/home');
      },
      error: async err => {
        await loading.dismiss();
        const toast = await this.toast.create({
          message: err?.message || 'Email ou mot de passe invalide.',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}
