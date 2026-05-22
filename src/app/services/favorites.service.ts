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
      return (JSON.parse(storedFavorites) as Array<Partial<MusicTrack> & Record<string, unknown>>)
        .map((favorite) => ({
          id: Number(favorite.id),
          title: String(favorite.title ?? ''),
          artist: String(favorite.artist ?? ''),
          album: String(favorite.album ?? ''),
          duration: String(favorite.duration ?? '0:30'),
          cover: String(favorite.cover ?? favorite['cover_url'] ?? ''),
          preview: String(favorite.preview ?? favorite['preview_url'] ?? favorite['audio_url'] ?? ''),
        }))
        .filter((favorite) => Boolean(favorite.id && favorite.title && favorite.preview));
    } catch {
      return [];
    }
  }
}
