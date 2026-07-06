import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class DebugInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('[HTTP] Request:', request.url, request.method);

    return next.handle(request).pipe(
      tap({
        next: (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            console.log('[HTTP] Response:', event.url, event.status, event.body);
          }
        },
        error: (err: any) => {
          console.error('[HTTP] Error Response:', err.url, err.status, err.error);
        },
      })
    );
  }
}
