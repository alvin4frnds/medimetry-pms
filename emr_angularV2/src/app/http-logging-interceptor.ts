import {
    HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,
    HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs/index';
import { throwError } from 'rxjs';
import { Injectable } from "@angular/core";
import { map, catchError } from 'rxjs/operators';
import { UtilityService } from './services/utility.service';

@Injectable({
    providedIn: 'root'
})
export class HttpLoggingInterceptor implements HttpInterceptor {

    constructor(public _utilityService: UtilityService) {}

    //function which will be called for all http calls
    intercept(request: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {

        //noinspection TypeScriptValidateTypes
        return next.handle(request).pipe(map(event => {
            if (event instanceof HttpResponse && HttpLoggingInterceptor.shouldBeIntercepted(event)) {
                event = event.clone();

                // console.log("Http Interceptor: req, resp: ", request, event);
                if (event && event.body && event.body.message && !event.body.success) {

                    console.warn('HTTP Warn: ', "Resp: " + event.body.message);
                    this.storeError(request, event.body.message);
                    this._utilityService.broadcastEvent("httpWarn", "Resp: " + event.body.message);
                }
            }

            return event;
        })).pipe(catchError((error) => {
            if (error.error instanceof Error) {
                // A client-side or network error occurred. Handle it accordingly.
                console.error('An error occurred:', error.error.message);
                this.storeError(request, error.error.message);
            } else {
                // The backend returned an unsuccessful response code.
                // The response body may contain clues as to what went wrong,
                console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
                this.storeError(request, `Backend returned code ${error.status}, body was: ${error.error}`);
            }

            // return an observable with a user-facing error message
            return throwError(
                'Something bad happened; please try again later.');
        })); // @ts-ignore

    }

    static shouldBeIntercepted(event) {
        return true;
    }

    public twoDigits (number) {
        if (parseInt(number) < 10)
            return "0" + number;
        else return number
    }

    public storeError (request: HttpRequest<any>, error: String) {
        const obj = {
            url: request.url,
            request: {
                method: request.method,
                body: request.body,
                headers: request.headers,
                params: request.params,
                url: request.url,
                responseType: request.responseType
            },
            error: error
        };

        const key = this.getErrorKey();

        window.localStorage.setItem(key, JSON.stringify(obj));
    }

    private getErrorKey() {
        const now = new Date();
        const key = "httperror: " + now.getFullYear()
            + this.twoDigits(now.getMonth() + 1)
            + this.twoDigits(now.getDate()) + " "
            + this.twoDigits(now.getHours())
            + this.twoDigits(now.getMinutes())
            + this.twoDigits(now.getSeconds());
        return key;
    }
}