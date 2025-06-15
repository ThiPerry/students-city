import { Component, OnInit } from '@angular/core';
import { ActivatedRoute }    from '@angular/router';
import { PlacesService, Place } from 'src/app/services/places.service';
import { CommonModule }      from '@angular/common';
import { IonicModule }       from '@ionic/angular';
import { RouterModule }      from '@angular/router';

@Component({
  selector: 'app-place-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit {
  place?: Place;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private placesService: PlacesService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.placesService.getPlace(id).subscribe({
      next: p => {
        this.place = p;
        this.loading = false;
      },
      error: err => {
        console.error('Erreur chargement détail lieu', err);
        this.loading = false;
      }
    });
  }
}
