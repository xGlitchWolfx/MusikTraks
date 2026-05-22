import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { DeezerService, MusicTrack } from '../services/deezer.service';
import { FavoritesService } from '../services/favorites.service';
import { ProfileStateService } from '../services/profile-state.service';
import { TrackPlayerComponent } from '../track-player/track-player.component';

interface TrackSection {
  title: string;
  label: string;
  query: string;
  tracks: MusicTrack[];
}

interface GenreTag {
  name: string;
  query: string;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    CommonModule,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    TrackPlayerComponent,
  ],
})
export class Tab2Page implements OnInit {
  readonly avatar$ = inject(ProfileStateService).avatar$;
  query = '';
  selectedTag = 'Top del momento';
  tagTracks: MusicTrack[] = [];
  isLoading = false;
  loadError = '';

  genreTags: GenreTag[] = [
    { name: 'Electro', query: 'electronic dance' },
    { name: 'Rock', query: 'rock hits' },
    { name: 'Pop', query: 'pop hits' },
    { name: 'Kawaii', query: 'kawaii future bass' },
    { name: 'Lo-Fi', query: 'lofi hip hop' },
    { name: 'Indie', query: 'indie pop' },
    { name: 'Synthwave', query: 'synthwave' },
    { name: 'Latino', query: 'latin pop' },
  ];

  sections: TrackSection[] = [
    { title: 'Top 10 del momento', label: 'Ahora', query: 'top hits 2026', tracks: [] },
    { title: 'Top 10 electro', label: 'Energia', query: 'electronic dance', tracks: [] },
    { title: 'Top 10 rock', label: 'Guitarras', query: 'rock hits', tracks: [] },
    { title: 'Top 10 pop', label: 'Popular', query: 'pop hits', tracks: [] },
    { title: 'Kawaii', label: 'Cute', query: 'kawaii future bass', tracks: [] },
    { title: 'Lo-Fi', label: 'Chill', query: 'lofi hip hop', tracks: [] },
    { title: 'My top', label: 'Me gusta', query: 'the weeknd dua lipa tame impala', tracks: [] },
  ];

  constructor(
    private readonly deezerService: DeezerService,
    public readonly favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.searchByTag({ name: 'Top del momento', query: 'top hits 2026' });

    this.sections.forEach((section) => {
      this.deezerService.searchTracks(section.query, 10).subscribe({
        next: (tracks) => {
          section.tracks = tracks.slice(0, 10);
        },
      });
    });
  }

  updateQuery(event: Event): void {
    const input = event.target as HTMLIonSearchbarElement;
    this.query = input.value ?? '';

    if (this.query.trim().length >= 2) {
      this.search(this.query, 'Busqueda');
    }
  }

  searchByTag(tag: GenreTag): void {
    this.selectedTag = tag.name;
    this.query = '';
    this.search(tag.query, tag.name);
  }

  toggleFavorite(track: MusicTrack): void {
    this.favoritesService.toggle(track);
  }

  private search(query: string, label: string): void {
    this.isLoading = true;
    this.loadError = '';
    this.selectedTag = label;

    this.deezerService.searchTracks(query, 12).subscribe({
      next: (tracks) => {
        this.tagTracks = tracks;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'No se pudo consultar Deezer.';
        this.isLoading = false;
      },
    });
  }
}
