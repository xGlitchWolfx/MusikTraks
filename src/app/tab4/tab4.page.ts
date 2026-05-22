import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import {
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonMenuButton,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { Profile, SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonMenuButton,
    IonTextarea,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab4Page {

  username = '';

  age: number | null = null;

  bio = 'Explorando canciones nuevas con TRAK.';

  photoUrl = 'assets/MTIconApp.png';

  selectedFile: File | null = null;

  profileMessage = '';

  isSaving = false;

  constructor(
    private readonly router: Router,
    private readonly supabaseService: SupabaseService
  ) {
    void this.loadProfile();
  }

  async takePhoto(): Promise<void> {
    await this.pickPhoto(CameraSource.Camera);
  }

  async chooseFromGallery(): Promise<void> {
    await this.pickPhoto(CameraSource.Photos);
  }

  chooseFromFile(event: Event): void {

    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.selectedFile = file;

    this.photoUrl = URL.createObjectURL(file);
  }

  async saveProfile(): Promise<void> {

    this.isSaving = true;

    this.profileMessage = '';

    try {

      const user = await this.supabaseService.getUser();

      if (!user) {

        this.router.navigateByUrl('/auth', {
          replaceUrl: true
        });

        return;
      }

      // Subir avatar a Supabase Storage
      if (this.selectedFile) {

        this.photoUrl =
          await this.supabaseService.uploadAvatar(
            this.selectedFile,
            user.id
          );
      }

      // Guardar perfil
      await this.supabaseService.upsertProfile({
        id: user.id,
        username: this.username,
        age: this.age,
        bio: this.bio,
        avatar_url: this.photoUrl,
      });

      // Recargar perfil
      await this.loadProfile();

      this.profileMessage = 'Perfil Actualizado!';

    } catch (error) {

      this.profileMessage =
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el perfil.';

    } finally {

      this.isSaving = false;
    }
  }

  async signOut(): Promise<void> {

    await this.supabaseService.signOut();

    this.router.navigateByUrl('/auth', {
      replaceUrl: true
    });
  }

private async pickPhoto(
  source: CameraSource
): Promise<void> {

  try {

    const image = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.Uri,
      source,
    });

    if (!image.webPath) {
      return;
    }

    // preview temporal
    this.photoUrl = image.webPath;

    // obtener blob real
    const response = await fetch(image.webPath);

    const blob = await response.blob();

    console.log(blob);

    // crear archivo real
    this.selectedFile = new File(
      [blob],
      'avatar.jpg',
      {
        type: 'image/jpeg'
      }
    );

  } catch (error) {

    console.error(error);
  }
}

  private async loadProfile(): Promise<void> {

    try {

      const user = await this.supabaseService.getUser();

      if (!user) {
        return;
      }

      const profile: Profile =
        await this.supabaseService.ensureProfileFromUser(user);

      this.username =
        profile.username;

      this.age = profile.age;

      this.bio =
        profile.bio || this.bio;

      this.photoUrl =
        profile.avatar_url || this.photoUrl;

    } catch {

      this.profileMessage =
        'No se pudo cargar el perfil.';
    }
  }
}
