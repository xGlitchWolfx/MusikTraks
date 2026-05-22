import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PlayerState {
  currentUrl: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

export type PlayerEffect = 'normal' | 'reverb' | 'inverso' | 'chillon' | 'tembloroso';

@Injectable({
  providedIn: 'root',
})
export class AudioPlayerService {
  private readonly audio = new Audio();
  private audioContext?: AudioContext;
  private sourceNode?: MediaElementAudioSourceNode;
  private analyser?: AnalyserNode;
  private delayNode?: DelayNode;
  private feedbackNode?: GainNode;
  private filterNode?: BiquadFilterNode;
  private distortionNode?: WaveShaperNode;
  private tremoloGain?: GainNode;
  private lfoNode?: OscillatorNode;
  private lfoDepthNode?: GainNode;
  private trembleTimer?: number;
  private readonly stateSubject = new BehaviorSubject<PlayerState>({
    currentUrl: null,
    currentTime: 0,
    duration: 0,
    isPlaying: false,
  });

  readonly state$ = this.stateSubject.asObservable();

  constructor() {
    this.audio.crossOrigin = 'anonymous';
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

  getAudioElement(): HTMLAudioElement {
    return this.audio;
  }

  async getAnalyser(): Promise<AnalyserNode> {
    await this.ensureAudioGraph();
    return this.analyser as AnalyserNode;
  }

  async applyEffect(effect: PlayerEffect): Promise<void> {
    await this.ensureAudioGraph();
    this.stopTremble();
    this.audio.playbackRate = 1;
    this.disconnectEffects();

    if (!this.analyser || !this.audioContext) {
      return;
    }

    if (effect === 'reverb' && this.delayNode && this.feedbackNode) {
      this.delayNode.delayTime.value = 0.22;
      this.feedbackNode.gain.value = 0.34;
      this.analyser.connect(this.audioContext.destination);
      this.analyser.connect(this.delayNode);
      this.delayNode.connect(this.feedbackNode);
      this.feedbackNode.connect(this.delayNode);
      this.delayNode.connect(this.audioContext.destination);
      return;
    }

    if (effect === 'chillon' && this.filterNode && this.distortionNode) {
      this.filterNode.type = 'highpass';
      this.filterNode.frequency.value = 1500;
      this.distortionNode.curve = this.createDistortionCurve(160);
      this.analyser.connect(this.filterNode);
      this.filterNode.connect(this.distortionNode);
      this.distortionNode.connect(this.audioContext.destination);
      return;
    }

    if (effect === 'tembloroso' && this.tremoloGain) {
      this.tremoloGain.gain.value = 0.68;
      this.lfoNode = this.audioContext.createOscillator();
      this.lfoDepthNode = this.audioContext.createGain();
      this.lfoNode.frequency.value = 8;
      this.lfoDepthNode.gain.value = 0.32;
      this.lfoNode.connect(this.lfoDepthNode);
      this.lfoDepthNode.connect(this.tremoloGain.gain);
      this.analyser.connect(this.tremoloGain);
      this.tremoloGain.connect(this.audioContext.destination);
      this.lfoNode.start();
      return;
    }

    if (effect === 'inverso' && this.delayNode && this.filterNode) {
      this.delayNode.delayTime.value = 0.09;
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 900;
      this.analyser.connect(this.delayNode);
      this.delayNode.connect(this.filterNode);
      this.filterNode.connect(this.audioContext.destination);
      return;
    }

    this.analyser.connect(this.audioContext.destination);
  }

  async toggle(url: string): Promise<void> {
    await this.applyEffect('normal');

    if (this.stateSubject.value.currentUrl === url) {
      if (this.audio.paused) {
        await this.audio.play();
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
    await this.audio.play();
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

  private async ensureAudioGraph(): Promise<void> {
    this.audioContext ??= new AudioContext();

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    if (!this.sourceNode) {
      this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
      this.analyser = this.audioContext.createAnalyser();
      this.delayNode = this.audioContext.createDelay();
      this.feedbackNode = this.audioContext.createGain();
      this.filterNode = this.audioContext.createBiquadFilter();
      this.distortionNode = this.audioContext.createWaveShaper();
      this.tremoloGain = this.audioContext.createGain();
      this.analyser.fftSize = 128;
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    }
  }

  private stopTremble(): void {
    if (this.trembleTimer) {
      window.clearInterval(this.trembleTimer);
      this.trembleTimer = undefined;
    }

    this.lfoNode?.stop();
    this.lfoNode?.disconnect();
    this.lfoDepthNode?.disconnect();
    this.lfoNode = undefined;
    this.lfoDepthNode = undefined;
  }

  private disconnectEffects(): void {
    this.analyser?.disconnect();
    this.delayNode?.disconnect();
    this.feedbackNode?.disconnect();
    this.filterNode?.disconnect();
    this.distortionNode?.disconnect();
    this.tremoloGain?.disconnect();
  }

  private createDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let index = 0; index < samples; index += 1) {
      const x = (index * 2) / samples - 1;
      curve[index] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }

    return curve as Float32Array<ArrayBuffer>;
  }
}
