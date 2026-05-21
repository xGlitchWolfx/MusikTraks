import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { AudioPlayerService, PlayerState } from '../services/audio-player.service';

@Component({
  selector: 'app-track-player',
  templateUrl: './track-player.component.html',
  styleUrls: ['./track-player.component.scss'],
  imports: [CommonModule],
})
export class TrackPlayerComponent {
  @Input({ required: true }) previewUrl = '';

  readonly state$: Observable<PlayerState> = this.audioPlayer.state$;

  constructor(private readonly audioPlayer: AudioPlayerService) {}

  getProgress(state: PlayerState): number {
    if (state.currentUrl !== this.previewUrl || !state.duration) {
      return 0;
    }

    return Math.min(100, (state.currentTime / state.duration) * 100);
  }

  getTime(state: PlayerState): string {
    if (state.currentUrl !== this.previewUrl) {
      return '0:00';
    }

    return this.formatTime(state.currentTime);
  }

  getDuration(state: PlayerState): string {
    if (state.currentUrl !== this.previewUrl || !state.duration) {
      return '0:30';
    }

    return this.formatTime(state.duration);
  }

  isPlaying(state: PlayerState): boolean {
    return state.currentUrl === this.previewUrl && state.isPlaying;
  }

  toggle(): void {
    this.audioPlayer.toggle(this.previewUrl);
  }

  seek(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.audioPlayer.seek(this.previewUrl, Number(input.value));
  }

  private formatTime(value: number): string {
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
