// OAuth configuration and utilities for Google and Microsoft authentication

export interface OAuthConfig {
  google: {
    clientId: string;
  };
  microsoft: {
    clientId: string;
    tenantId: string;
  };
}

export const oauthConfig: OAuthConfig = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  },
  microsoft: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || "",
    tenantId: import.meta.env.VITE_MICROSOFT_TENANT_ID || "common",
  },
};

// Google OAuth Handler
export const handleGoogleAuth = async (credentialResponse: any, onSuccess: (token: string) => void, onError: (error: string) => void) => {
  try {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      throw new Error("No token received from Google");
    }

    // Send token to backend for verification and user creation
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/auth/oauth/google`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "Google authentication failed");
    }

    onSuccess(data.data.token);
  } catch (err: any) {
    onError(err.message);
  }
};

// Microsoft OAuth Handler
export const handleMicrosoftAuth = async (
  response: any,
  onSuccess: (token: string) => void,
  onError: (error: string) => void
) => {
  try {
    const accessToken = response.accessToken;
    if (!accessToken) {
      throw new Error("No token received from Microsoft");
    }

    // Send token to backend for verification and user creation
    const resp = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/auth/oauth/microsoft`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      }
    );

    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error?.message || "Microsoft authentication failed");
    }

    onSuccess(data.data.token);
  } catch (err: any) {
    onError(err.message);
  }
};

// GitHub OAuth Handler
export const handleGitHubAuth = async (
  onError: (error: string) => void
) => {
  try {
    const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!githubClientId) {
      throw new Error("GitHub Client ID not configured");
    }

    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;

    window.location.href = authUrl;
  } catch (err: any) {
    onError(err.message);
  }
};
