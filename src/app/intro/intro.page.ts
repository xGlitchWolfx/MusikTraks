import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
  imports: [IonButton, IonContent],
})
export class IntroPage implements OnInit {
  isLeaving = false;

  constructor(
    private readonly router: Router,
    private readonly supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    window.setTimeout(() => {
      this.enterApp();
    }, 2500);
  }

  enterApp(): void {
    if (this.isLeaving) {
      return;
    }

    this.isLeaving = true;

    window.setTimeout(async () => {
      const session = await this.supabaseService.getSession();
      this.router.navigateByUrl(session ? '/tabs/tab1' : '/auth', { replaceUrl: true });
    }, 420);
  }
}
