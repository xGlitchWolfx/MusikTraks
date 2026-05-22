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
  confirmPassword = '';
  username = '';
  authMessage = '';
  showRegisterSuccess = false;
  isLoading = false;

  constructor(
    private readonly router: Router,
    private readonly supabaseService: SupabaseService
  ) {}

  async submit(): Promise<void> {
    if (this.mode === 'register' && !this.canRegister) {
      this.authMessage = this.registerValidationMessage;
      return;
    }

    this.isLoading = true;
    this.authMessage = '';

    try {
      if (this.mode === 'login') {
        await this.supabaseService.signIn(this.email, this.password);
        this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
      } else {
        await this.supabaseService.signUp(this.email, this.password, this.username);
        this.showRegisterSuccess = true;
        this.mode = 'login';
        this.password = '';
        this.confirmPassword = '';
        this.username = '';
      }
    } catch (error) {
      this.authMessage = this.getAuthErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
  }

  switchMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.authMessage = '';
    this.showRegisterSuccess = false;
    this.confirmPassword = '';
  }

  closeRegisterSuccess(): void {
    this.showRegisterSuccess = false;
  }

  get hasMinimumLength(): boolean {
    return this.password.length >= 6;
  }

  get hasNumber(): boolean {
    return /\d/.test(this.password);
  }

  get passwordsMatch(): boolean {
    return this.password.length > 0 && this.password === this.confirmPassword;
  }

  get passwordStrength(): 'empty' | 'facil' | 'normal' | 'fuerte' {
    if (!this.password) {
      return 'empty';
    }

    const hasLowercase = /[a-z]/.test(this.password);
    const hasUppercase = /[A-Z]/.test(this.password);
    const hasSpecial = /[^A-Za-z0-9]/.test(this.password);
    const isLong = this.password.length >= 10;
    const passedChecks = [
      this.hasMinimumLength,
      this.hasNumber,
      hasLowercase,
      hasUppercase,
      hasSpecial,
      isLong,
    ].filter(Boolean).length;

    if (passedChecks >= 5) {
      return 'fuerte';
    }

    if (passedChecks >= 3) {
      return 'normal';
    }

    return 'facil';
  }

  get passwordStrengthLabel(): string {
    const labels = {
      empty: 'Sin evaluar',
      facil: 'Facil',
      normal: 'Normal',
      fuerte: 'Fuerte',
    };

    return labels[this.passwordStrength];
  }

  get canRegister(): boolean {
    return this.hasMinimumLength && this.hasNumber && this.passwordsMatch;
  }

  private get registerValidationMessage(): string {
    if (!this.hasMinimumLength) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (!this.hasNumber) {
      return 'La contraseña debe incluir al menos un número.';
    }

    if (!this.passwordsMatch) {
      return 'Las contraseñas no coinciden.';
    }

    return 'Completa los requisitos para crear tu cuenta.';
  }

  private getAuthErrorMessage(error: unknown): string {
    const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : 0;
    const message = error instanceof Error ? error.message : '';

    if (status === 429 || message.toLowerCase().includes('rate limit')) {
      return 'Demasiados intentos seguidos. Espera un momento y vuelve a intentar.';
    }

    if (status === 403 || message.toLowerCase().includes('invalid')) {
      return 'Tu sesión anterior ya no es válida. Inicia sesión otra vez.';
    }

    return message || 'No se pudo conectar con Supabase.';
  }
}
