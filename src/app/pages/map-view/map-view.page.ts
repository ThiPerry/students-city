import { Component, ElementRef, ViewChild, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment'; 
import { PlacesService } from 'src/app/services/places.service';
import { IonHeader, IonToolbar, IonTitle, IonContent } from "@ionic/angular/standalone"; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.page.html',
  styleUrls: ['./map-view.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class MapViewPage implements AfterViewInit {
  @ViewChild('map') mapRef!: ElementRef<HTMLElement>;
  newMap!: GoogleMap;
  idmaptoidplace: { [idmap: string ] : number; } = {};

  constructor(
    private placesService: PlacesService,
    private router: Router
  ) {}

  ngAfterViewInit() {
    this.createMap();
  }

  async createMap() {
    this.newMap = await GoogleMap.create({
      id: 'students-city-map',
      element: this.mapRef.nativeElement,
      apiKey: environment.googleMapsApiKey,
      config: {
        center: {
          lat: 48.8566, 
          lng: 2.3522,
        },
        zoom: 12,
      },
    });

    this.addMarkers();
  }

  addMarkers() {
    this.placesService.getPlaces().subscribe(async (places) => {
      const markers = places.map(place => ({
        coordinate: {
          lat: place.latitude,
          lng: place.longitude
        },
        title: place.name,
        snippet: place.description,
      }));

      const temps = await this.newMap.addMarkers(markers);
      // temps.forEach(idMarker => {
      //   this.idmaptoidplace[idMarker] = 
        
      // });
      this.newMap.setOnMarkerClickListener(async (marker) => {
          console.log('Marqueur cliqué :', marker);
          this.router.navigate(["/places", (+marker.markerId)+1])
      });
    });
  }
}
