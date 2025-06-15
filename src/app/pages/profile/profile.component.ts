import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  LoadingController,
  ToastController
} from '@ionic/angular';
import { AuthService, Session } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfilePage implements OnInit {
  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    // Champs facultatifs (on retire Validators.required)
    this.profileForm = this.fb.group({
      pseudo: [''],
      email:  ['', [Validators.email]]
    });
  }

  async ngOnInit(): Promise<void> {
    // Optionnel : loader à l'ouverture de la page
    const loading = await this.loadingCtrl.create({
      message: 'Chargement…'
    });
    await loading.present();

    // On prend la dernière session stockée en local
    this.auth.currentUser
      .pipe(take(1))
      .subscribe({
        next: (session: Session | null) => {
          if (session) {
            // Pré-remplissage !
            this.profileForm.patchValue({
              pseudo: session.pseudo,
              email:  session.email
            });
          }
          loading.dismiss();
        },
        error: async () => {
          // En pratique il n'y a pas d'erreur ici,
          // mais on ferme le loader au cas où.
          await loading.dismiss();
        }
      });
  }

  async onSubmit(): Promise<void> {
    // Validation minimale : email, s'il est saisi, doit être valide
    if (this.profileForm.controls['email'].invalid) {
      this.profileForm.controls['email'].markAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Mise à jour…'
    });
    await loading.present();

    const { pseudo, email } = this.profileForm.value;
    this.auth.updateProfile({ pseudo, email }).subscribe({
      next: async () => {
        await loading.dismiss();
        (await this.toastCtrl.create({
          message: 'Profil mis à jour avec succès.',
          duration: 2000,
          color: 'success'
        })).present();
      },
      error: async err => {
        await loading.dismiss();
        (await this.toastCtrl.create({
          message: err?.message || 'Erreur lors de la mise à jour.',
          duration: 2000,
          color: 'danger'
        })).present();
      }
    });
  }
}
