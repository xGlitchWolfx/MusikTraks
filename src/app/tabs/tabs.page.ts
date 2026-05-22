import { Component, EnvironmentInjector, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { ProfileStateService } from '../services/profile-state.service';
import { SupabaseService } from '../services/supabase.service';
import {
  compassOutline,
  heartOutline,
  personOutline,
  playCircleOutline,
  pulseOutline,
  radioOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonRouterOutlet,
    RouterLink,
  ],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  readonly avatar$ = inject(ProfileStateService).avatar$;
  private readonly profileState = inject(ProfileStateService);
  private readonly supabaseService = inject(SupabaseService);

  constructor() {
    addIcons({
      compassOutline,
      heartOutline,
      personOutline,
      playCircleOutline,
      pulseOutline,
      radioOutline,
    });

    void this.loadAvatar();
  }

  private async loadAvatar(): Promise<void> {
    const user = await this.supabaseService.getUser();

    if (!user) {
      return;
    }

    const profile = await this.supabaseService.getProfile(user.id);
    this.profileState.setAvatar(profile?.avatar_url);
  }
}
