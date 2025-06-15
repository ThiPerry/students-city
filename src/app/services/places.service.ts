// src/app/services/places.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

/**
 * Représente un lieu tel que retourné par l’API
 */
export interface Place {
  id: number;
  name: string;
  description: string;
  adresse:string;
  type:string;
  latitude: number;
  longitude: number;
  rating?: number;       // ← moyenne actuelle
  votesCount?: number; 
}


/** DTO pour créer un lieu (sans l’ID) */
export type PlaceCreateDto = Omit<Place, 'id'>;

/** DTO pour mettre à jour un lieu (partiel possible) */
export type PlaceUpdateDto = Partial<PlaceCreateDto>;

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private baseUrl = `${environment.apiUrl}/places`;

  constructor(private http: HttpClient) {}

  /** Récupère tous les lieux validés */
  getPlaces(): Observable<Place[]> {
    return this.http.get<Place[]>(this.baseUrl);
  }

  /** Récupère un seul lieu par son ID */
  getPlace(id: number): Observable<Place> {
    return this.http.get<Place>(`${this.baseUrl}/${id}`);
  }

  /** Crée un nouvel établissement */
  addPlace(placeData: PlaceCreateDto): Observable<Place> {
    return this.http.post<Place>(this.baseUrl, placeData);
  }

  /** Met à jour un établissement existant */
  updatePlace(id: number, data: PlaceUpdateDto): Observable<Place> {
    return this.http.put<Place>(`${this.baseUrl}/${id}`, data);
  }
}
