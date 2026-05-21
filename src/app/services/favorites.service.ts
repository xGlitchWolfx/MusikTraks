import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MusicTrack } from './deezer.service';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly storageKey = 'musictraks:favorites';
  private readonly favoritesSubject = new BehaviorSubject<MusicTrack[]>(this.readFavorites());

  readonly favorites$ = this.favoritesSubject.asObservable();

  get favorites(): MusicTrack[] {
    return this.favoritesSubject.value;
  }

  isFavorite(track: MusicTrack): boolean {
    return this.favorites.some((favorite) => favorite.id === track.id);
  }

  toggle(track: MusicTrack): void {
    const exists = this.isFavorite(track);
    const nextFavorites = exists
      ? this.favorites.filter((favorite) => favorite.id !== track.id)
      : [track, ...this.favorites];

    this.favoritesSubject.next(nextFavorites);
    localStorage.setItem(this.storageKey, JSON.stringify(nextFavorites));
  }

  private readFavorites(): MusicTrack[] {
    const storedFavorites = localStorage.getItem(this.storageKey);

    if (!storedFavorites) {
      return [];
    }

    try {
      return JSON.parse(storedFavorites) as MusicTrack[];
    } catch {
      return [];
    }
  }
}
