import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  constructor(private http: HttpClient) { }

  // Récupère tous les lieux validés
  getValidatedPlaces(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/places`);
  }

  // Ajoute un nouvel établissement 
  addPlace(placeData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/places`, placeData);
  }
}