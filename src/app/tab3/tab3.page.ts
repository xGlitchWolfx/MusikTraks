import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { MusicTrack } from '../services/deezer.service';
import { FavoritesService } from '../services/favorites.service';
import { ProfileStateService } from '../services/profile-state.service';
import { TrackPlayerComponent } from '../track-player/track-player.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    CommonModule,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonTitle,
    IonToolbar,
    TrackPlayerComponent,
  ],
})
export class Tab3Page {
  readonly avatar$ = inject(ProfileStateService).avatar$;
  readonly favorites$: Observable<MusicTrack[]> = this.favoritesService.favorites$;

  constructor(public readonly favoritesService: FavoritesService) {}

  removeFavorite(track: MusicTrack): void {
    this.favoritesService.toggle(track);
  }
}
