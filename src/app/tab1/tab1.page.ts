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
  vibe: string;
  classics: RoulettePick[];
  wildcards: RoulettePick[];
}

interface RoulettePick {
  query: string;
  label: string;
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
  winnerPick?: RoulettePick;
  activeGenreIndex = 1;
  visibleGenres: RouletteGenre[] = [];

  readonly genres: RouletteGenre[] = [
    {
      name: 'pop',
      vibe: 'Coro mundial',
      classics: [
        { query: 'Michael Jackson Billie Jean', label: 'Clasico pop' },
        { query: 'Lady Gaga Bad Romance', label: 'Icono pop' },
        { query: 'The Weeknd Blinding Lights', label: 'Hit global' },
        { query: 'Dua Lipa Levitating', label: 'Pop moderno' },
        { query: 'Katy Perry Firework', label: 'Todos la cantan' },
      ],
      wildcards: [
        { query: 'M83 Midnight City', label: 'Sorpresa popular' },
        { query: 'Foster The People Pumped Up Kicks', label: 'Indie conocido' },
      ],
    },
    {
      name: 'rock',
      vibe: 'Guitarras legendarias',
      classics: [
        { query: 'Queen Bohemian Rhapsody', label: 'Himno rock' },
        { query: 'Nirvana Smells Like Teen Spirit', label: 'Clasico noventero' },
        { query: 'The Killers Mr Brightside', label: 'Coro seguro' },
        { query: 'Bon Jovi Livin On A Prayer', label: 'Arena rock' },
        { query: 'Linkin Park In The End', label: 'Rock 2000s' },
      ],
      wildcards: [
        { query: 'Arctic Monkeys Do I Wanna Know', label: 'Rock alternativo' },
        { query: 'The Strokes Reptilia', label: 'Sorpresa popular' },
      ],
    },
    {
      name: 'latino',
      vibe: 'Fiesta conocida',
      classics: [
        { query: 'Daddy Yankee Gasolina', label: 'Reggaeton clasico' },
        { query: 'Shakira Hips Dont Lie', label: 'Hit mundial' },
        { query: 'Luis Fonsi Despacito', label: 'Pop cultura' },
        { query: 'Bad Bunny Titi Me Pregunto', label: 'Latino global' },
        { query: 'Enrique Iglesias Bailando', label: 'Coro latino' },
      ],
      wildcards: [
        { query: 'Bomba Estereo To My Love', label: 'Sorpresa latina' },
        { query: 'Monsieur Perine Nuestra Cancion', label: 'Joyita popular' },
      ],
    },
    {
      name: 'electro',
      vibe: 'Festival mode',
      classics: [
        { query: 'Daft Punk One More Time', label: 'Clasico dance' },
        { query: 'Avicii Wake Me Up', label: 'Festival hit' },
        { query: 'Calvin Harris Feel So Close', label: 'EDM conocido' },
        { query: 'David Guetta Titanium Sia', label: 'Hit global' },
        { query: 'Swedish House Mafia Dont You Worry Child', label: 'Mainstage' },
      ],
      wildcards: [
        { query: 'Disclosure Latch Sam Smith', label: 'Sorpresa dance' },
        { query: 'Madeon Pop Culture', label: 'Joyita electro' },
      ],
    },
    {
      name: 'hip hop',
      vibe: 'Barras iconicas',
      classics: [
        { query: 'Eminem Lose Yourself', label: 'Himno rap' },
        { query: 'Drake Hotline Bling', label: 'Pop rap' },
        { query: 'Kendrick Lamar HUMBLE', label: 'Rap moderno' },
        { query: 'OutKast Hey Ya', label: 'Todos la topan' },
        { query: 'Coolio Gangstas Paradise', label: 'Clasico rap' },
      ],
      wildcards: [
        { query: 'Kid Cudi Day N Nite', label: 'Sorpresa popular' },
        { query: 'Macklemore Thrift Shop', label: 'Random conocido' },
      ],
    },
    {
      name: 'indie',
      vibe: 'Alternativo famoso',
      classics: [
        { query: 'Tame Impala The Less I Know The Better', label: 'Indie global' },
        { query: 'MGMT Kids', label: 'Clasico indie' },
        { query: 'Gorillaz Feel Good Inc', label: 'Alternativo iconico' },
        { query: 'The Neighbourhood Sweater Weather', label: 'Hit indie' },
        { query: 'Gotye Somebody That I Used To Know', label: 'One hit gigante' },
      ],
      wildcards: [
        { query: 'Empire Of The Sun Walking On A Dream', label: 'Sorpresa brillante' },
        { query: 'Phoenix 1901', label: 'Joyita conocida' },
      ],
    },
    {
      name: 'nostalgia',
      vibe: 'Memoria desbloqueada',
      classics: [
        { query: 'a-ha Take On Me', label: '80s clasico' },
        { query: 'Britney Spears Toxic', label: 'Pop 2000s' },
        { query: 'Backstreet Boys I Want It That Way', label: 'Karaoke seguro' },
        { query: 'Eurythmics Sweet Dreams', label: 'Clasico mundial' },
        { query: 'Rick Astley Never Gonna Give You Up', label: 'Internet clasico' },
      ],
      wildcards: [
        { query: 'New Radicals You Get What You Give', label: 'Random nostalgico' },
        { query: 'Modjo Lady Hear Me Tonight', label: 'Joyita dance' },
      ],
    },
    {
      name: 'random',
      vibe: 'Ruleta rara pero buena',
      classics: [
        { query: 'Pharrell Williams Happy', label: 'Feel good' },
        { query: 'Mark Ronson Uptown Funk Bruno Mars', label: 'Fiesta segura' },
        { query: 'Black Eyed Peas I Gotta Feeling', label: 'Party clasico' },
        { query: 'Psy Gangnam Style', label: 'Cultura pop' },
        { query: 'Imagine Dragons Believer', label: 'Hit masivo' },
      ],
      wildcards: [
        { query: 'Glass Animals Heat Waves', label: 'Random popular' },
        { query: 'Portugal The Man Feel It Still', label: 'Sorpresa conocida' },
      ],
    },
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
    this.winnerPick = undefined;

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
    const selectedPick = this.getRoulettePick(genre);
    this.winnerPick = selectedPick;

    window.setTimeout(() => {
      this.deezerService.searchTracks(selectedPick.query, 8).subscribe({
        next: (tracks) => {
          if (!tracks.length) {
            this.rollError = 'La ruleta no encontro canciones. Intenta otra vez.';
            this.isRolling = false;
            return;
          }

          this.randomTrack = tracks[0];
          this.isRolling = false;
        },
        error: () => {
          this.rollError = 'No se pudo conectar con Deezer.';
          this.isRolling = false;
        },
      });
    }, 520);
  }

  private getRoulettePick(genre: RouletteGenre): RoulettePick {
    const shouldUseWildcard = Math.random() < 0.18;
    const source = shouldUseWildcard ? genre.wildcards : genre.classics;
    return source[Math.floor(Math.random() * source.length)];
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
