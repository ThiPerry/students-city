import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment';
import { PlacesService } from 'src/app/services/places.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.page.html',
  styleUrls: ['./map-view.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MapViewPage implements AfterViewInit {
  @ViewChild('map') mapRef!: ElementRef<HTMLElement>;
  newMap!: GoogleMap;
  idmaptoidplace: { [idmap: string]: number } = {};

  constructor(
    private placesService: PlacesService,
    private router: Router,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private actionSheetController: ActionSheetController
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
      const markers = places.map((place) => ({
        coordinate: { lat: place.latitude, lng: place.longitude },
        title: place.name,
        snippet: place.description,
        id: place.id.toString(),
      }));

      await this.newMap.addMarkers(markers);

      // ← clic sur un marqueur
      this.newMap.setOnMarkerClickListener((marker) => {
        console.log('Marqueur cliqué :', marker);
        this.router.navigate(['/places', Number(marker.markerId) + 1]);
      });

     this.newMap.setOnMapClickListener(async (event) => {
        if (!event.latitude) {
          return;
        }
        const lat = event.latitude;
        const lng = event.longitude

        const actionSheet = await this.actionSheetController.create({
          header: 'Options',
          buttons: [
            {
              text: 'Crée un nouvel etablisement',
              handler: () => {
                console.log("test redirect");
                this.router.navigate(['places/new', lat, lng]);
              },
            },
            {
              text: 'Annuler',
              role: 'cancel',
            },
          ],
        });
        await actionSheet.present();
      });
    });
  }
}
