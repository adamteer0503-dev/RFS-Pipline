import { useState, useCallback, useEffect } from 'react';
import type { GoogleAuthState } from '../types';
import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from '../constants';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement | null, config: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

function parseJwt(token: string): Record<string, string> {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

export function useGoogleAuth() {
  const [auth, setAuth] = useState<GoogleAuthState>({
    isSignedIn: false,
    accessToken: null,
    userEmail: null,
    userName: null,
    userPicture: null,
  });
  const [tokenClient, setTokenClient] = useState<{ requestAccessToken: () => void } | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(interval);
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: GOOGLE_SCOPES,
          callback: (response) => {
            if (response.access_token) {
              setAuth((prev) => ({
                ...prev,
                isSignedIn: true,
                accessToken: response.access_token!,
              }));
            }
          },
        });
        setTokenClient(client);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (idToken) {
      const payload = parseJwt(idToken);
      setAuth((prev) => ({
        ...prev,
        userEmail: payload.email ?? null,
        userName: payload.name ?? null,
        userPicture: payload.picture ?? null,
      }));
    }
  }, [idToken]);

  const signIn = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      alert('VITE_GOOGLE_CLIENT_ID is not set. Please configure your .env file.');
      return;
    }

    if (!window.google?.accounts?.id) {
      alert('Google Identity Services script not loaded yet. Please wait and try again.');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        setIdToken(response.credential);
      },
    });

    if (tokenClient) {
      tokenClient.requestAccessToken();
    }
  }, [tokenClient]);

  const signOut = useCallback(() => {
    setAuth({
      isSignedIn: false,
      accessToken: null,
      userEmail: null,
      userName: null,
      userPicture: null,
    });
  }, []);

  return { auth, signIn, signOut };
}
