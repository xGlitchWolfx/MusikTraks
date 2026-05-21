import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface MusicTrack {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  preview: string;
}

interface DeezerTrack {
  id: number;
  title: string;
  duration: number;
  preview: string;
  artist: {
    name: string;
  };
  album: {
    title: string;
    cover_medium: string;
    cover_big: string;
  };
}

interface DeezerSearchResponse {
  data: DeezerTrack[];
}

@Injectable({
  providedIn: 'root',
})
export class DeezerService {
  private readonly apiUrl = 'https://api.deezer.com/search';

  constructor(private readonly http: HttpClient) {}

  searchTracks(query: string, limit = 10): Observable<MusicTrack[]> {
    const url = `${this.apiUrl}?q=${encodeURIComponent(query)}&limit=${limit}&output=jsonp`;

    return this.http.jsonp<DeezerSearchResponse>(url, 'callback').pipe(
      map((response) =>
        (response.data ?? [])
          .filter((track) => Boolean(track.preview))
          .map((track) => ({
            id: track.id,
            title: track.title,
            artist: track.artist.name,
            album: track.album.title,
            duration: this.formatDuration(track.duration),
            cover: track.album.cover_big || track.album.cover_medium,
            preview: track.preview,
          }))
      )
    );
  }

  private formatDuration(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
