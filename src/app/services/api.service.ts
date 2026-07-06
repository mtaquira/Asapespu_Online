import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, lastValueFrom, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../environments/environment';

export interface ItemsResult {
  asociado: any[];
  cuotas: any[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private resolvedBaseUrl: string | null = null;

  constructor(private http: HttpClient) {}

  private getCandidateUrls(): string[] {
    const platform = Capacitor.getPlatform();

    if (platform === 'android') {
      return [
        environment.apiBaseUrlAndroidDevice,
        environment.apiBaseUrlAndroidEmulator,
      ];
    }

    return [environment.apiBaseUrlWeb];
  }

  private async resolveBaseUrl(): Promise<string> {
    if (this.resolvedBaseUrl) {
      return this.resolvedBaseUrl;
    }

    for (const url of this.getCandidateUrls()) {
      if (!url) {
        continue;
      }

      try {
        await lastValueFrom(this.http.get(`${url}/debug`));
        this.resolvedBaseUrl = url;
        return url;
      } catch {
        continue;
      }
    }

    this.resolvedBaseUrl = environment.apiBaseUrlWeb;
    return this.resolvedBaseUrl;
  }

  getItems(asociado?: string): Observable<ItemsResult> {
    let params = new HttpParams();

    if (asociado) {
      params = params.set('asociado', asociado);
    }

    return from(this.resolveBaseUrl()).pipe(
      switchMap((baseUrl) => this.http.get<ItemsResult>(`${baseUrl}/items`, { params }))
    );
  }

  searchAsociados(query: string): Observable<any[]> {
    const params = new HttpParams().set('q', query);

    return from(this.resolveBaseUrl()).pipe(
      switchMap((baseUrl) => this.http.get<any[]>(`${baseUrl}/asociados`, { params }))
    );
  }
}
