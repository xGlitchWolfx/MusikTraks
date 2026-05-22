import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileStateService {
  private readonly avatarSubject = new BehaviorSubject<string>('assets/MTIconApp.png');

  readonly avatar$ = this.avatarSubject.asObservable();

  setAvatar(url: string | null | undefined): void {
    this.avatarSubject.next(url || 'assets/MTIconApp.png');
  }
}
