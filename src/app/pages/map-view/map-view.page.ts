import { Component, ElementRef, ViewChild, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // Importez CUSTOM_ELEMENTS_SCHEMA
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment'; // Pour la clé API
import { PlacesService } from 'src/app/services/places.service';
// Importez IonContent en plus des autres composants Ionic
import { IonHeader, IonToolbar, IonTitle, IonContent } from "@ionic/angular/standalone"; 

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.page.html',
  styleUrls: ['./map-view.page.scss'],
  // Ajoutez les modules/composants Ionic que vous utilisez dans le template
  imports: [IonHeader, IonToolbar, IonTitle, IonContent], 
  // Permet à Angular de reconnaître les Web Components comme <capacitor-google-map>
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class MapViewPage implements AfterViewInit {
  // Nous utilisons l'opérateur d'assertion d'affectation définie (!) car ces propriétés
  // sont initialisées par Angular via @ViewChild et dans ngAfterViewInit respectivement.
  @ViewChild('map') mapRef!: ElementRef<HTMLElement>;
  newMap!: GoogleMap;

  constructor(private placesService: PlacesService) {}

  ngAfterViewInit() {
    this.createMap();
  }

  async createMap() {
    this.newMap = await GoogleMap.create({
      id: 'students-city-map',
      element: this.mapRef.nativeElement,
      apiKey: environment.googleMapsApiKey, // Assurez-vous d'ajouter cette clé à vos fichiers environment
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
    this.placesService.getValidatedPlaces().subscribe(async (places) => {
      const markers = places.map(place => ({
        coordinate: {
          lat: place.latitude,
          lng: place.longitude
        },
        title: place.nom,
        snippet: place.description,
      }));

      // Ajoute les marqueurs à la carte 
      await this.newMap.addMarkers(markers);

      // Gère le clic sur un marqueur 
      this.newMap.setOnMarkerClickListener(async (marker) => {
          console.log('Marqueur cliqué :', marker);
          // Ici, vous pouvez ouvrir une modale avec les détails du lieu
      });
    });
  }
}
