import { Injectable } from '@angular/core';
import { createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface Profile {
  id: string;
  username: string;
  age: number | null;
  bio: string;
  avatar_url: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );

  async getSession(): Promise<Session | null> {
    const { data } = await this.client.auth.getSession();
    return data.session;
  }

  async getUser(): Promise<User | null> {
    const { data } = await this.client.auth.getUser();
    return data.user;
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.client.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }
  }

  async signUp(email: string, password: string, username: string): Promise<void> {
    const { data, error } = await this.client.auth.signUp({ email, password });

    if (error) {
      throw error;
    }

    if (data.user) {
      await this.upsertProfile({
        id: data.user.id,
        username,
        age: null,
        bio: 'Explorando canciones nuevas con TRAK.',
        avatar_url: 'assets/MTIconApp.png',
      });
    }
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
  }

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('id, username, age, bio, avatar_url, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  async upsertProfile(profile: Profile): Promise<void> {
    const { error } = await this.client.from('profiles').upsert(profile, {
      onConflict: 'id',
    });

    if (error) {
      throw error;
    }
  }
}
