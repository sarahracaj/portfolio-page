const CLIENT_ID = "6ee8dd6d731e454aa17560fd60d9a467";
const REDIRECT_URI = "https://sarahracaj.github.io/portfolio-page/";
const SCOPES = "user-top-read";

const tracksContainer = document.getElementById("spotify-tracks");

function base64UrlEncode(arrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

function randomString(length = 64) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const values = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    result += chars[values[i] % chars.length];
  }
  return result;
}

function getCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
}

function clearCodeFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  window.history.replaceState({}, document.title, url.toString());
}

async function redirectToSpotifyLogin() {
  const verifier = randomString(64);
  const challenge = base64UrlEncode(await sha256(verifier));

  localStorage.setItem("spotify_code_verifier", verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function exchangeCodeForToken(code) {
  const verifier = localStorage.getItem("spotify_code_verifier");

  if (!verifier) {
    throw new Error("Code verifier fehlt.");
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error_description || data.error || "Token-Austausch fehlgeschlagen."
    );
  }

  localStorage.setItem("spotify_access_token", data.access_token);
  localStorage.setItem("spotify_refresh_token", data.refresh_token);
  localStorage.setItem(
    "spotify_token_expires_at",
    String(Date.now() + data.expires_in * 1000)
  );
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("spotify_refresh_token");

  if (!refreshToken) {
    throw new Error("Kein Refresh Token vorhanden.");
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error_description || data.error || "Refresh fehlgeschlagen."
    );
  }

  localStorage.setItem("spotify_access_token", data.access_token);
  localStorage.setItem(
    "spotify_token_expires_at",
    String(Date.now() + data.expires_in * 1000)
  );

  if (data.refresh_token) {
    localStorage.setItem("spotify_refresh_token", data.refresh_token);
  }

  return data.access_token;
}

async function getValidAccessToken() {
  const accessToken = localStorage.getItem("spotify_access_token");
  const expiresAt = Number(
    localStorage.getItem("spotify_token_expires_at") || 0
  );

  if (accessToken && Date.now() < expiresAt - 60_000) {
    return accessToken;
  }

  return refreshAccessToken();
}

async function spotifyFetch(url, options = {}, attempt = 0) {
  const res = await fetch(url, options);

  if (res.status === 429 && attempt < 3) {
    const retryAfter = Number(res.headers.get("Retry-After") || "1");
    const waitMs =
      retryAfter > 0 ? retryAfter * 1000 : 1000 * Math.pow(2, attempt);

    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return spotifyFetch(url, options, attempt + 1);
  }

  return res;
}

function renderLoginButton() {
  if (!tracksContainer) return;

  tracksContainer.innerHTML = `
    <div class="spotify-login-box">
      <p class="spotify-login-text">Verbinde Spotify, um deine Top Tracks anzuzeigen.</p>
      <button class="spotify-login-button" id="spotify-connect-btn">Connect Spotify</button>
    </div>
  `;

  document
    .getElementById("spotify-connect-btn")
    ?.addEventListener("click", redirectToSpotifyLogin);
}

function renderTracks(items) {
  if (!tracksContainer) return;

  tracksContainer.innerHTML = items
    .map((track) => {
      const title = track.name;
      const artists = track.artists.map((artist) => artist.name).join(", ");
      const image = track.album?.images?.[0]?.url || "";
      const link = track.external_urls?.spotify || "#";
      const album = track.album?.name || "";

      return `
        <a class="spotify-track" href="${link}" target="_blank" rel="noopener noreferrer">
          <img src="${image}" alt="${album}">
          <div class="spotify-info">
            <p class="track-name">${title}</p>
            <p class="artist-name">${artists}</p>
          </div>
        </a>
      `;
    })
    .join("");
}

async function loadTopTracks() {
  try {
    const code = getCodeFromUrl();

    if (code) {
      await exchangeCodeForToken(code);
      clearCodeFromUrl();
    }

    const token = await getValidAccessToken();

    const res = await spotifyFetch(
      "https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=medium_term",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error?.message || "Tracks konnten nicht geladen werden."
      );
    }

    renderTracks(data.items || []);
  } catch (error) {
    console.error(error);
    renderLoginButton();
  }
}

document.addEventListener("DOMContentLoaded", loadTopTracks);
