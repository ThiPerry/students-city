import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id?: number;
  place?: { id: number; name?: string };
  user?: { id: number; pseudo?: string };
  commentaire: string;
  rating: number;
  createAt?: string;
  place_id?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private baseUrl = 'http://localhost:8000/api/reviews';

  constructor(private http: HttpClient) {}


  getMyReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`/reviews`) as Observable<Review[]>;
  }

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`/reviews`) as Observable<Review[]>;
  }

  getReview(id: number): Observable<Review> {
    return this.http.get<Review>(`/reviews/${id}`) as Observable<Review>;
  }

  createReview(review: {
    place_id: number;
    commentaire: string;
    rating: number;
  }): Observable<any> {
    return this.http.post(`/reviews`, review);
  }

  updateReview(id: number, update: Partial<Review>): Observable<any> {
    return this.http.put(`/reviews/${id}`, update);
  }

  deleteReview(id: number): Observable<any> {
    return this.http.delete(`/reviews/${id}`);
  }

  getReviewsForPlace(placeId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`/reviews/place/${placeId}`) as Observable<
      Review[]
    >;
  }
}