const spotifyData = {
  items: [
    {
      album: {
        images: [
          {
            url: "https://i.scdn.co/image/ab67616d0000b2738db37bc9a58543471bee78c5",
          },
        ],
        name: "Lemonade",
      },
      artists: [{ name: "Beyoncé" }],
      external_urls: {
        spotify: "https://open.spotify.com/track/71OvX5NNLrmz7rpq1ANTQn",
      },
      name: "Daddy Lessons",
    },
    {
      album: {
        images: [
          {
            url: "https://i.scdn.co/image/ab67616d0000b27391735860120f168ac8cdec14",
          },
        ],
        name: "Thana",
      },
      artists: [{ name: "Tayna" }],
      external_urls: {
        spotify: "https://open.spotify.com/track/6gk8YPQCAg5yupUeCpJEye",
      },
      name: "Thana",
    },
    {
      album: {
        images: [
          {
            url: "https://i.scdn.co/image/ab67616d0000b2738db37bc9a58543471bee78c5",
          },
        ],
        name: "Lemonade",
      },
      artists: [{ name: "Beyoncé" }],
      external_urls: {
        spotify: "https://open.spotify.com/track/7oAuqs6akGnPU3Tb00ZmyM",
      },
      name: "All Night",
    },
    {
      album: {
        images: [
          {
            url: "https://i.scdn.co/image/ab67616d0000b273a3ecf5c72b31ca2508bb4ad4",
          },
        ],
        name: "YAMA",
      },
      artists: [{ name: "DYSTINCT" }],
      external_urls: {
        spotify: "https://open.spotify.com/track/1GBn2lt8KfovKFP5gHPgMt",
      },
      name: "YAMA",
    },
    {
      album: {
        images: [
          {
            url: "https://i.scdn.co/image/ab67616d0000b273b9ff0a5f40d3406aed5e5e3b",
          },
        ],
        name: "Good Girl Gone Bad",
      },
      artists: [{ name: "Rihanna" }],
      external_urls: {
        spotify: "https://open.spotify.com/track/5EcG8eMMlwkHRVa4aTR1qd",
      },
      name: "Breakin' Dishes",
    },
  ],
};

const tracksContainer = document.getElementById("spotify-tracks");

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

document.addEventListener("DOMContentLoaded", () => {
  renderTracks(spotifyData.items);
});
