import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ItemsResult {
  asociado: any[];
  cuotas: any[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getItems(asociado?: string): Observable<ItemsResult> {
    let params = new HttpParams();

    if (asociado) {
      params = params.set('codigo', asociado);
    }

    return this.http.get<ItemsResult>(`${this.baseUrl}/index.php`, { params });
  }

  searchAsociados(query: string): Observable<any[]> {
    const params = new HttpParams().set('q', query);

    return this.http.get<any[]>(`${this.baseUrl}/search.php`, { params });
  }
}
