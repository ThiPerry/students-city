import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { IonicModule }       from '@ionic/angular';
import { RouterModule }      from '@angular/router';

import { PlacesService, Place } from 'src/app/services/places.service';

@Component({
  selector: 'app-places-list',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  templateUrl: './places-list.page.html',
  styleUrls: ['./places-list.page.scss'],
})
export class PlacesListPage implements OnInit {
  places: Place[] = [];
  loading = true;

  constructor(private placesService: PlacesService) {}

  ngOnInit(): void {
    this.placesService.getPlaces().subscribe({
      next: places => {
        this.places  = places;
        this.loading = false;
      },
      error: err => {
        console.error('Erreur chargement lieux', err);
        this.loading = false;
      }
    });
  }
}
