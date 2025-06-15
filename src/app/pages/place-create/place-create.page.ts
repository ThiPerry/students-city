import { Component, OnInit }                   from '@angular/core';
import { FormBuilder, FormGroup, Validators }  from '@angular/forms';
import { ActivatedRoute, Router }              from '@angular/router';
import { PlacesService }                       from 'src/app/services/places.service';
import { IonicModule, ToastController }        from '@ionic/angular';
import { CommonModule }                        from '@angular/common';
import { ReactiveFormsModule }                 from '@angular/forms';

@Component({
  selector: 'app-place-create',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './place-create.page.html',
  styleUrls: ['./place-create.page.scss'],
})
export class PlaceCreatePage implements OnInit {
  form!: FormGroup;
  types = ['Restaurant', 'Café', 'Bibliothèque'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private placesService: PlacesService,
    private toastCtrl: ToastController
  ) {
    this.form = this.fb.group({
      name:        ['', Validators.required],
      type:        ['Restaurant', Validators.required],
      adresse:     ['', Validators.required],    // ← nouveau champ adresse
      description: [''],
      latitude:    ['', Validators.required],
      longitude:   ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const lat = this.route.snapshot.paramMap.get('lat');
    const lng = this.route.snapshot.paramMap.get('lng');
    if (lat && lng) {
      this.form.patchValue({ latitude: lat, longitude: lng });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const toast = await this.toastCtrl.create({
      message: 'Création en cours…',
      duration: 1000
    });
    await toast.present();

    this.placesService.addPlace(this.form.value).subscribe({
      next: async place => {
        (await this.toastCtrl.create({
          message: 'Lieu créé !',
          duration: 2000,
          color: 'success'
        })).present();
        this.router.navigateByUrl(`/map`);
      },
      error: async () => {
        (await this.toastCtrl.create({
          message: 'Échec de la création.',
          duration: 2000,
          color: 'danger'
        })).present();
      }
    });
  }
}
