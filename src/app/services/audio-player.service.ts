import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PlayerState {
  currentUrl: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AudioPlayerService {
  private readonly audio = new Audio();
  private readonly stateSubject = new BehaviorSubject<PlayerState>({
    currentUrl: null,
    currentTime: 0,
    duration: 0,
    isPlaying: false,
  });

  readonly state$ = this.stateSubject.asObservable();

  constructor() {
    this.audio.addEventListener('timeupdate', () => this.syncState());
    this.audio.addEventListener('loadedmetadata', () => this.syncState());
    this.audio.addEventListener('ended', () => {
      this.stateSubject.next({
        ...this.stateSubject.value,
        currentTime: 0,
        isPlaying: false,
      });
    });
  }

  toggle(url: string): void {
    if (this.stateSubject.value.currentUrl === url) {
      if (this.audio.paused) {
        void this.audio.play();
      } else {
        this.audio.pause();
      }

      this.syncState();
      return;
    }

    this.audio.pause();
    this.audio.src = url;
    this.audio.currentTime = 0;
    this.stateSubject.next({
      currentUrl: url,
      currentTime: 0,
      duration: 0,
      isPlaying: true,
    });
    void this.audio.play();
  }

  seek(url: string, percent: number): void {
    if (this.stateSubject.value.currentUrl !== url || !this.audio.duration) {
      return;
    }

    this.audio.currentTime = this.audio.duration * (percent / 100);
    this.syncState();
  }

  private syncState(): void {
    this.stateSubject.next({
      currentUrl: this.stateSubject.value.currentUrl,
      currentTime: this.audio.currentTime || 0,
      duration: this.audio.duration || 0,
      isPlaying: !this.audio.paused,
    });
  }
}
