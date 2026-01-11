
import { AppState } from '../types';
import { createClient } from '@supabase/supabase-js';

// Load Supabase public (anon) values from environment variables.
// Sensitive service role key MUST NOT be present in the frontend.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const authService = {
  signUp: async (name: string, email: string, pass: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { full_name: name },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return data.user;
    } catch (e) {
      console.error("Auth SignUp error:", e);
      throw e;
    }
  },

  signIn: async (email: string, pass: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;
      return data.user;
    } catch (e) {
      console.error("Auth SignIn error:", e);
      throw e;
    }
  },

  verifyCode: async (email: string, token: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });
      if (error) throw error;
      return data.user;
    } catch (e) {
      console.error("Auth VerifyOtp error:", e);
      throw e;
    }
  },

  signInWithGoogle: async () => {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (e) {
      console.error("Auth GoogleSignIn error:", e);
      throw e;
    }
  },

  signOut: async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Auth SignOut error:", e);
    }
  }
};

export const backendBridge = {
  // Proxy cloud sync through serverless endpoints that hold the Supabase service key.
  syncToCloud: async (data: AppState, userId: string): Promise<boolean> => {
    console.log('[DEBUG] syncToCloud called with userId:', userId, 'data keys:', Object.keys(data));
    if (!userId) {
      console.log('[DEBUG] syncToCloud: no userId, returning false');
      return false;
    }
    try {
      console.log('[DEBUG] syncToCloud: making fetch to /.netlify/functions/supabase-sync');
      const res = await fetch('/.netlify/functions/supabase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, payload: data })
      });
      console.log('[DEBUG] syncToCloud: fetch response status:', res.status, 'ok:', res.ok);
      return res.ok;
    } catch (e: any) {
      console.warn('[Sync Proxy] Falhou, salvando apenas localmente.', e?.message || e);
      console.log('[DEBUG] syncToCloud: error:', e);
      return false;
    }
  },

  fetchFromCloud: async (userId: string): Promise<AppState | null> => {
    console.log('[DEBUG] fetchFromCloud called with userId:', userId);
    if (!userId) {
      console.log('[DEBUG] fetchFromCloud: no userId, returning null');
      return null;
    }
    try {
      console.log('[DEBUG] fetchFromCloud: making fetch to /.netlify/functions/supabase-fetch');
      const res = await fetch(`/.netlify/functions/supabase-fetch?userId=${encodeURIComponent(userId)}`);
      console.log('[DEBUG] fetchFromCloud: fetch response status:', res.status, 'ok:', res.ok);
      if (!res.ok) {
        console.log('[DEBUG] fetchFromCloud: response not ok, returning null');
        return null;
      }
      const json = await res.json();
      console.log('[DEBUG] fetchFromCloud: received json:', json);
      const parsed = json?.payload ? JSON.parse(json.payload) : null;
      console.log('[DEBUG] fetchFromCloud: parsed payload:', parsed ? Object.keys(parsed) : null);
      return parsed;
    } catch (e: any) {
      console.warn('[Fetch Proxy] Falhou.', e?.message || e);
      console.log('[DEBUG] fetchFromCloud: error:', e);
      return null;
    }
  }
};
