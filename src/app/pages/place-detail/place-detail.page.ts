import { Component, OnInit }                    from '@angular/core';
import { ActivatedRoute }                       from '@angular/router';
import { FormBuilder, FormGroup, Validators }   from '@angular/forms';
import { ReviewService, Review }                from 'src/app/services/review.service';
import { AuthService, Session }                 from 'src/app/services/auth.service';
import { CommonModule }                         from '@angular/common';
import { IonicModule, AlertController }         from '@ionic/angular';
import { ReactiveFormsModule }                  from '@angular/forms';
import { PlacesService, Place }                 from 'src/app/services/places.service';

@Component({
  selector: 'app-place-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ],
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit {
  place?: Place;
  reviews: Review[] = [];
  loading = true;
  reviewForm: FormGroup;
  currentUserId?: number;

  constructor(
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private reviewService: ReviewService,
    private auth: AuthService,
    private fb: FormBuilder,
    private alertCtrl: AlertController
  ) {
    this.reviewForm = this.fb.group({
      commentaire: [''],
      rating:      [5, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
    this.auth.currentUser.subscribe((s: Session|null) => {
      this.currentUserId = s?.id;
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.placesService.getPlace(id).subscribe(p => {
      this.place = p;
      this.loading = false;
    });
    this.loadReviews(id);
  }

  private loadReviews(placeId: number) {
    this.reviewService.getReviewsForPlace(placeId)
      .subscribe(r => this.reviews = r);
  }

  submitReview() {
    if (!this.place || this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    const { commentaire, rating } = this.reviewForm.value;
    this.reviewService.createReview({
      place_id: this.place.id!,
      commentaire, rating
    }).subscribe(review => {
      this.reviews.unshift(review);
      this.reviewForm.reset({ commentaire: '', rating: 5 });
    });
  }

  async editReview(r: Review) {
    const alert = await this.alertCtrl.create({
      header: 'Modifier avis',
      inputs: [
        { name: 'rating', type: 'number', value: r.rating, min: '1', max: '5' },
        { name: 'commentaire', type: 'textarea', value: r.commentaire }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Enregistrer',
          handler: data => {
            this.reviewService.updateReview(r.id!, {
              commentaire: data.commentaire,
              rating: Number(data.rating)
            }).subscribe(() => this.loadReviews(this.place!.id!));
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteReview(r: Review) {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer avis',
      message: 'Confirmer la suppression ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.reviewService.deleteReview(r.id!).subscribe(() =>
              this.reviews = this.reviews.filter(x => x.id !== r.id)
            );
          }
        }
      ]
    });
    await alert.present();
  }
}
