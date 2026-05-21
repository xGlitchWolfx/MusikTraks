import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  imports: [CommonModule, FormsModule, IonContent],
})
export class AuthPage {
  mode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  username = '';
  authMessage = '';
  isLoading = false;

  constructor(
    private readonly router: Router,
    private readonly supabaseService: SupabaseService
  ) {}

  async submit(): Promise<void> {
    this.isLoading = true;
    this.authMessage = '';

    try {
      if (this.mode === 'login') {
        await this.supabaseService.signIn(this.email, this.password);
      } else {
        await this.supabaseService.signUp(this.email, this.password, this.username || 'MusicTraks User');
      }

      this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
    } catch (error) {
      this.authMessage = error instanceof Error ? error.message : 'No se pudo conectar con Supabase.';
    } finally {
      this.isLoading = false;
    }
  }

  switchMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.authMessage = '';
  }
}
