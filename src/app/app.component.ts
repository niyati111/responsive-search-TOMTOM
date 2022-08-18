import { AfterViewInit, Component } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import * as tt from '@tomtom-international/web-sdk-maps';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  map: any;
  currentLat: number = 0;
  currentLon: number = 0;
  ROOT_URL = 'https://api.tomtom.com/search/2/search/';
  searchResults: any = [];

  constructor(private http: HttpClient) {}

  public ngAfterViewInit(): void {
    this.initLocationMap();
  }

  getValue(value: string) {
    this.http
      .get(
        this.ROOT_URL +
          `${value}.json?lat=${this.currentLat}&lon=${this.currentLon}&minFuzzyLevel=1&maxFuzzyLevel=2&view=Unified&relatedPois=off&key=${environment.tomtom.key}`
      )
      .subscribe((data: any) => (this.searchResults = data['results']));
  }

  private getCurrentPosition(): any {
    return new Observable((observer: Subscriber<any>) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position: any) => {
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          this.currentLon = position.coords.longitude;
          this.currentLat = position.coords.latitude;
          observer.complete();
        });
      } else {
        observer.error();
      }
    });
  }

  private initLocationMap(): void {
    this.map = tt.map({
      key: environment.tomtom.key,
      container: 'map',
    });

    this.map.addControl(new tt.FullscreenControl());
    this.map.addControl(new tt.NavigationControl());

    this.getCurrentPosition().subscribe((position: any) => {
      this.map.flyTo({
        center: {
          lat: position.latitude,
          lng: position.longitude,
        },
        zoom: 13,
      });

      const popup = new tt.Popup({
        anchor: 'bottom',
        offset: { bottom: [0, -40] },
      }).setHTML('Current Location');

      const marker = new tt.Marker()
        .setLngLat({
          lat: position.latitude,
          lng: position.longitude,
        })
        .addTo(this.map);
      marker.setPopup(popup).togglePopup();
    });
  }

  setPlaceLocation(lat: number, lng: number, placeName: string): void {
    this.map.flyTo({
      center: {
        lat: lat,
        lng: lng,
      },
      zoom: 13,
    });

    const popup = new tt.Popup({
      anchor: 'bottom',
      offset: { bottom: [0, -40] },
    }).setHTML(placeName);

    const marker = new tt.Marker()
      .setLngLat({
        lat: lat,
        lng: lng,
      })
      .addTo(this.map);
    marker.setPopup(popup).togglePopup();
  }
}
