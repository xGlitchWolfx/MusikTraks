import { Injectable } from '@angular/core';
import { createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface Profile {
  id: string;
  username: string;
  age: number | null;
  bio: string;
  avatar_url: string;
  music?: string | null;
  created_at?: string;
}

const appAuthLock = async <Result>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<Result>
): Promise<Result> => fn();

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private readonly authStorageKey = `sb-${new URL(environment.supabaseUrl).hostname.split('.')[0]}-auth-token`;

  readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        lock: appAuthLock,
        lockAcquireTimeout: 5000,
      },
    }
  );

  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await this.client.auth.getSession();

      if (error) {
        await this.clearInvalidLocalSession(error);
        return null;
      }

      return data.session;
    } catch (error) {
      await this.clearInvalidLocalSession(error);
      return null;
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const { data, error } = await this.client.auth.getUser();

      if (error) {
        await this.clearInvalidLocalSession(error);
        return null;
      }

      return data.user;
    } catch (error) {
      await this.clearInvalidLocalSession(error);
      return null;
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.client.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }
  }

  async signUp(email: string, password: string, username: string): Promise<void> {
    const cleanUsername = username.trim();
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanUsername,
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      await this.upsertProfile({
        id: data.user.id,
        username: cleanUsername,
        age: null,
        bio: 'Explorando canciones nuevas con TRAK.',
        avatar_url: 'assets/MTIconApp.png',
      });
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.client.auth.signOut({ scope: 'local' });
    } catch {
      this.clearStoredSession();
    }
  }

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('id, username, age, bio, avatar_url, music, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }
async uploadAvatar(
  file: File,
  userId: string
): Promise<string> {

  const fileName =
    `${userId}.jpg`;

  const { data, error } =
    await this.client.storage
      .from('avatares')
      .upload(
        fileName,
        file,
        {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg'
        }
      );

  console.log(data);

  if (error) {
    console.error(error);
    throw error;
  }

  const { data: publicUrlData } =
    this.client.storage
      .from('avatares')
      .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

async uploadMusic(file: File, userId: string): Promise<string> {
  const extension = file.name.split('.').pop() || 'mp3';
  const fileName = `${userId}/play-track.${extension}`;

  const { error } = await this.client.storage
    .from('avatares')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'audio/mpeg',
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = this.client.storage
    .from('avatares')
    .getPublicUrl(fileName);

  await this.updateProfileMusic(userId, publicUrlData.publicUrl);

  return publicUrlData.publicUrl;
}

async deleteMusic(userId: string, musicUrl: string | null): Promise<void> {
  const path = this.getStoragePath(musicUrl);

  if (path) {
    await this.client.storage.from('avatares').remove([path]);
  }

  await this.updateProfileMusic(userId, null);
}

async updateProfileMusic(userId: string, musicUrl: string | null): Promise<void> {
  const { error } = await this.client
    .from('profiles')
    .update({ music: musicUrl })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

  async upsertProfile(profile: Profile): Promise<void> {
    const { error } = await this.client.from('profiles').upsert(profile, {
      onConflict: 'id',
    });

    if (error) {
      throw error;
    }
  }

  async ensureProfileFromUser(user: User): Promise<Profile> {
    const existingProfile = await this.getProfile(user.id);
    const metadataUsername =
      typeof user.user_metadata?.['username'] === 'string'
        ? user.user_metadata['username'].trim()
        : '';
    const emailUsername = user.email?.split('@')[0] || '';

    const profile: Profile = {
      id: user.id,
      username: existingProfile?.username || metadataUsername || emailUsername,
      age: existingProfile?.age ?? null,
      bio: existingProfile?.bio || 'Explorando canciones nuevas con TRAK.',
      avatar_url: existingProfile?.avatar_url || 'assets/MTIconApp.png',
      music: existingProfile?.music ?? null,
      created_at: existingProfile?.created_at,
    };

    if (!existingProfile || !existingProfile.username) {
      await this.upsertProfile(profile);
    }

    return profile;
  }

  private getStoragePath(publicUrl: string | null): string | null {
    if (!publicUrl) {
      return null;
    }

    const marker = '/storage/v1/object/public/avatares/';
    const [, path] = publicUrl.split(marker);
    return path ? decodeURIComponent(path.split('?')[0]) : null;
  }

  private async clearInvalidLocalSession(error: unknown): Promise<void> {
    if (!this.isInvalidSessionError(error)) {
      return;
    }

    this.clearStoredSession();
  }

  private clearStoredSession(): void {
    localStorage.removeItem(this.authStorageKey);
    localStorage.removeItem(`${this.authStorageKey}-code-verifier`);
  }

  private isInvalidSessionError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const status = 'status' in error ? Number(error.status) : 0;
    const message = 'message' in error ? String(error.message).toLowerCase() : '';

    return (
      status === 401 ||
      status === 403 ||
      message.includes('jwt') ||
      message.includes('session') ||
      message.includes('lockmanager') ||
      message.includes('lock')
    );
  }
}

