import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AudioPlayerService } from '../services/audio-player.service';
import { ProfileStateService } from '../services/profile-state.service';
import { SupabaseService } from '../services/supabase.service';
import { TrackPlayerComponent } from '../track-player/track-player.component';

type VisualSource = 'audio' | 'youtube';

@Component({
  selector: 'app-visualicer',
  templateUrl: './visualicer.page.html',
  styleUrls: ['./visualicer.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonTitle,
    IonToolbar,
    TrackPlayerComponent,
  ],
})
export class VisualicerPage implements OnDestroy {
  readonly avatar$ = inject(ProfileStateService).avatar$;

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('visualCanvas') visualCanvas?: ElementRef<HTMLCanvasElement>;

  musicUrl = '';
  musicName = '';
  localMusicUrl = '';
  youtubeUrl = '';
  youtubeEmbedUrl?: SafeResourceUrl;
  source: VisualSource = 'audio';
  showChangePopup = false;
  visualMessage = '';
  isBusy = false;
  isVisualizing = false;

  private analyser?: AnalyserNode;
  private frameId?: number;
  private readonly playerSubscription: Subscription;

  constructor(
    private readonly router: Router,
    private readonly audioPlayerService: AudioPlayerService,
    private readonly sanitizer: DomSanitizer,
    private readonly supabaseService: SupabaseService
  ) {
    void this.loadMusic();
    this.playerSubscription = this.audioPlayerService.state$.subscribe((state) => {
      if (this.source === 'audio' && state.currentUrl === this.musicUrl && state.isPlaying) {
        void this.startAudioVisualizer();
      }

      if (state.currentUrl === this.musicUrl && !state.isPlaying) {
        this.stopVisualizer();
      }
    });
  }

  ngOnDestroy(): void {
    this.playerSubscription.unsubscribe();
    this.stopVisualizer();
  }

  openChangePopup(): void {
    this.showChangePopup = true;
  }

  closeChangePopup(): void {
    this.showChangePopup = false;
  }

  openPicker(): void {
    this.source = 'audio';
    this.closeChangePopup();
    this.fileInput?.nativeElement.click();
  }

  useYoutubeMode(): void {
    this.source = 'youtube';
    this.closeChangePopup();
  }

  async chooseMusic(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.isBusy = true;
    this.visualMessage = '';

    try {
      const user = await this.supabaseService.getUser();

      if (!user) {
        this.router.navigateByUrl('/auth', { replaceUrl: true });
        return;
      }

      this.localMusicUrl = URL.createObjectURL(file);
      this.musicUrl = this.localMusicUrl;
      this.musicName = file.name;
      this.saveCachedMusic(this.musicUrl, this.musicName);
      this.source = 'audio';
      this.youtubeEmbedUrl = undefined;
      this.closeChangePopup();

      try {
        this.musicUrl = await this.supabaseService.uploadMusic(file, user.id);
        this.saveCachedMusic(this.musicUrl, this.musicName);
      } catch {
        this.visualMessage = 'Storage no permitió guardar esta música. El visualizer la usará localmente por ahora.';
      }
    } catch (error) {
      this.visualMessage = error instanceof Error ? error.message : 'No se pudo subir la música.';
    } finally {
      this.isBusy = false;
      input.value = '';
    }
  }

  async deleteMusic(): Promise<void> {
    this.isBusy = true;
    this.visualMessage = '';

    try {
      const user = await this.supabaseService.getUser();

      if (!user) {
        this.router.navigateByUrl('/auth', { replaceUrl: true });
        return;
      }

      await this.supabaseService.deleteMusic(user.id, this.musicUrl || null);
      this.musicUrl = '';
      this.musicName = '';
      this.localMusicUrl = '';
      this.clearCachedMusic();
      this.stopVisualizer();
      this.closeChangePopup();
      this.visualMessage = 'Sube una música';
      window.setTimeout(() => this.openPicker(), 250);
    } catch (error) {
      this.visualMessage = error instanceof Error ? error.message : 'No se pudo borrar la música.';
    } finally {
      this.isBusy = false;
    }
  }

  loadYoutube(): void {
    const videoId = this.getYoutubeId(this.youtubeUrl);

    if (!videoId) {
      this.visualMessage = 'Pega un URL valido de YouTube.';
      return;
    }

    this.source = 'youtube';
    this.youtubeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`
    );
    this.isVisualizing = true;
    this.drawAmbientVisualizer();
  }

  async startAudioVisualizer(): Promise<void> {
    this.source = 'audio';
    this.isVisualizing = true;
    this.analyser = await this.audioPlayerService.getAnalyser();
    this.drawAudioVisualizer();
  }

  stopVisualizer(): void {
    this.isVisualizing = false;

    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = undefined;
    }
  }

  private async loadMusic(): Promise<void> {
    try {
      const user = await this.supabaseService.getUser();

      if (!user) {
        return;
      }

      const profile = await this.supabaseService.getProfile(user.id);
      const cachedMusic = this.getCachedMusic();
      this.musicUrl = profile?.music || cachedMusic.url;
      this.musicName = this.musicUrl ? cachedMusic.name || 'Musica subida en PLAY' : '';
      this.visualMessage = this.musicUrl ? '' : 'Sube una música o carga un URL.';
    } catch {
      this.visualMessage = 'No se pudo cargar tu música.';
    }
  }

  private drawAudioVisualizer(): void {
    const canvas = this.visualCanvas?.nativeElement;
    const analyser = this.analyser;

    if (!canvas || !analyser) {
      return;
    }

    const context = canvas.getContext('2d');
    const data = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      if (!context || !this.isVisualizing) {
        return;
      }

      analyser.getByteFrequencyData(data);
      this.paintBars(context, canvas, data);
      this.frameId = requestAnimationFrame(draw);
    };

    draw();
  }

  private drawAmbientVisualizer(): void {
    const canvas = this.visualCanvas?.nativeElement;
    const context = canvas?.getContext('2d');
    let tick = 0;

    const draw = () => {
      if (!canvas || !context || !this.isVisualizing || this.source !== 'youtube') {
        return;
      }

      const data = Array.from({ length: 48 }, (_, index) =>
        70 + Math.sin(tick / 8 + index / 2) * 55 + Math.random() * 42
      );

      this.paintBars(context, canvas, data);
      tick += 1;
      this.frameId = requestAnimationFrame(draw);
    };

    draw();
  }

  private paintBars(
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    data: ArrayLike<number>
  ): void {
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / data.length;

    context.clearRect(0, 0, width, height);
    context.fillStyle = '#0d0e11';
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#f6c90e';

    for (let index = 0; index < data.length; index += 1) {
      const barHeight = (Number(data[index]) / 255) * height;
      context.fillRect(index * barWidth, height - barHeight, Math.max(3, barWidth - 4), barHeight);
    }
  }

  private getYoutubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/);
    return match?.[1] || null;
  }

  private saveCachedMusic(url: string, name: string): void {
    localStorage.setItem('musictraks-play-music', JSON.stringify({ url, name }));
  }

  private getCachedMusic(): { url: string; name: string } {
    const cached = localStorage.getItem('musictraks-play-music');

    if (!cached) {
      return { url: '', name: '' };
    }

    try {
      return JSON.parse(cached);
    } catch {
      return { url: '', name: '' };
    }
  }

  private clearCachedMusic(): void {
    localStorage.removeItem('musictraks-play-music');
  }
}
