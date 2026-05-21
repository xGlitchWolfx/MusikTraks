import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { DeezerService, MusicTrack } from '../services/deezer.service';
import { FavoritesService } from '../services/favorites.service';
import { TrackPlayerComponent } from '../track-player/track-player.component';

interface RouletteGenre {
  name: string;
  query: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
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
export class Tab1Page {
  randomTrack?: MusicTrack;
  isRolling = false;
  rollError = '';
  winnerGenre?: RouletteGenre;
  activeGenreIndex = 1;
  visibleGenres: RouletteGenre[] = [];

  readonly genres: RouletteGenre[] = [
    { name: 'electro', query: 'electronic dance' },
    { name: 'rock', query: 'rock hits' },
    { name: 'pop', query: 'pop hits' },
    { name: 'lo-fi', query: 'lofi hip hop' },
    { name: 'indie', query: 'indie pop' },
    { name: 'kawaii', query: 'kawaii future bass' },
    { name: 'synthwave', query: 'synthwave' },
    { name: 'latino', query: 'latin pop' },
  ];

  constructor(
    private readonly deezerService: DeezerService,
    public readonly favoritesService: FavoritesService
  ) {
    this.updateVisibleGenres();
  }

  rollTrack(): void {
    if (this.isRolling) {
      return;
    }

    this.isRolling = true;
    this.rollError = '';
    this.randomTrack = undefined;
    this.winnerGenre = undefined;

    const targetIndex = Math.floor(Math.random() * this.genres.length);
    const totalSteps = 24 + targetIndex;
    let currentStep = 0;
    let delay = 58;

    const spin = () => {
      this.activeGenreIndex = (this.activeGenreIndex + 1) % this.genres.length;
      this.updateVisibleGenres();
      currentStep += 1;

      if (currentStep < totalSteps) {
        delay += currentStep > 14 ? 32 : 7;
        window.setTimeout(spin, delay);
        return;
      }

      this.activeGenreIndex = targetIndex;
      this.winnerGenre = this.genres[targetIndex];
      this.updateVisibleGenres();
      this.loadWinnerTrack(this.winnerGenre);
    };

    spin();
  }

  toggleFavorite(track: MusicTrack): void {
    this.favoritesService.toggle(track);
  }

  private loadWinnerTrack(genre: RouletteGenre): void {
    window.setTimeout(() => {
      this.deezerService.searchTracks(genre.query, 25).subscribe({
        next: (tracks) => {
          if (!tracks.length) {
            this.rollError = 'La ruleta no encontro canciones. Intenta otra vez.';
            this.isRolling = false;
            return;
          }

          this.randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
          this.isRolling = false;
        },
        error: () => {
          this.rollError = 'No se pudo conectar con Deezer.';
          this.isRolling = false;
        },
      });
    }, 520);
  }

  private updateVisibleGenres(): void {
    const previousIndex = (this.activeGenreIndex - 1 + this.genres.length) % this.genres.length;
    const nextIndex = (this.activeGenreIndex + 1) % this.genres.length;
    this.visibleGenres = [
      this.genres[previousIndex],
      this.genres[this.activeGenreIndex],
      this.genres[nextIndex],
    ];
  }
}
