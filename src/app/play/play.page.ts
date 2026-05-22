import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AudioPlayerService, PlayerEffect } from '../services/audio-player.service';
import { ProfileStateService } from '../services/profile-state.service';
import { SupabaseService } from '../services/supabase.service';
import { TrackPlayerComponent } from '../track-player/track-player.component';

type AudioEffect = PlayerEffect;

@Component({
  selector: 'app-play',
  templateUrl: './play.page.html',
  styleUrls: ['./play.page.scss'],
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
export class PlayPage implements OnDestroy {
  readonly avatar$ = inject(ProfileStateService).avatar$;

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  musicUrl = '';
  musicName = '';
  localMusicUrl = '';
  selectedEffect: AudioEffect = 'normal';
  playMessage = '';
  isBusy = false;
  private isPlayActive = false;

  readonly effects: { id: AudioEffect; label: string }[] = [
    { id: 'normal', label: 'Normal' },
    { id: 'reverb', label: 'Reverb' },
    { id: 'inverso', label: 'Inverso' },
    { id: 'chillon', label: 'Chillon' },
    { id: 'tembloroso', label: 'Tembloroso' },
  ];

  constructor(
    private readonly router: Router,
    private readonly audioPlayerService: AudioPlayerService,
    private readonly supabaseService: SupabaseService
  ) {
    void this.loadMusic();
  }

  ionViewWillEnter(): void {
    this.isPlayActive = true;
    this.applySelectedEffect();
  }

  ionViewWillLeave(): void {
    this.isPlayActive = false;
    this.resetSharedPlayerEffect();
  }

  ngOnDestroy(): void {
    this.resetSharedPlayerEffect();
  }

  openPicker(): void {
    this.fileInput?.nativeElement.click();
  }

  async chooseMusic(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.isBusy = true;
    this.playMessage = '';

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
      this.selectedEffect = 'normal';

      try {
        this.musicUrl = await this.supabaseService.uploadMusic(file, user.id);
        this.saveCachedMusic(this.musicUrl, this.musicName);
        this.playMessage = 'Musica subida. Ya puedes jugar con efectos.';
      } catch {
        this.playMessage = 'Storage no permitió guardar esta música. Puedes jugarla localmente por ahora.';
      }
    } catch (error) {
      this.playMessage = error instanceof Error ? error.message : 'No se pudo subir la música.';
    } finally {
      this.isBusy = false;
      input.value = '';
    }
  }

  selectEffect(effect: AudioEffect): void {
    this.selectedEffect = effect;
    this.applySelectedEffect();
  }

  async deleteMusic(): Promise<void> {
    this.isBusy = true;
    this.playMessage = '';

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
      this.selectedEffect = 'normal';
      this.resetSharedPlayerEffect();
      this.playMessage = 'Sube una música';
      window.setTimeout(() => this.openPicker(), 250);
    } catch (error) {
      this.playMessage = error instanceof Error ? error.message : 'No se pudo borrar la música.';
    } finally {
      this.isBusy = false;
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
      this.playMessage = this.musicUrl ? '' : 'Sube una música';
      this.applySelectedEffect();
    } catch {
      this.playMessage = 'No se pudo cargar tu música.';
    }
  }

  private applySelectedEffect(): void {
    if (!this.isPlayActive || !this.musicUrl) {
      return;
    }

    void this.audioPlayerService.applyEffect(this.selectedEffect);
  }

  private resetSharedPlayerEffect(): void {
    void this.audioPlayerService.applyEffect('normal');
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
