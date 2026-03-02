async function loadStrava() {
  const grid = document.getElementById("strava-grid");
  const updated = document.getElementById("strava-updated");

  if (!grid) return;

  try {
    const res = await fetch("strava-data.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const activities = data.activities || [];
    const updatedAt = data.updated_at;

    if (updated && updatedAt) {
      updated.textContent = `Letztes Update: ${new Date(
        updatedAt
      ).toLocaleString("de-CH")}`;
    }

    // ✅ Filter: alles was als Ride getrackt wurde
    const rides = activities
      .filter((a) => a.sport_type === "Ride" || a.type === "Ride")
      .slice(0, 12);

    if (!rides.length) {
      grid.innerHTML = `<div class="muted">Keine passenden Aktivitäten gefunden (Filter anpassen).</div>`;
      return;
    }

    grid.innerHTML = rides
      .map((a) => {
        const date = new Date(a.start_date_local || a.start_date);
        const km = (a.distance / 1000).toFixed(1);
        const minutes = Math.round(a.moving_time / 60);
        const url = `https://www.strava.com/activities/${a.id}`;

        // ✅ Bild-Pfad: images/routes/<activity-id>.jpg
        const img = `images/routes/${a.id}.jpg`;

        return `
            <a class="strava-card" href="${url}" target="_blank" rel="noopener">
              <img
                class="strava-thumb"
                src="${img}"
                alt="Foto zur Route: ${escapeHtml(a.name)}"
                loading="lazy"
                onerror="this.remove()"
              />
              <div class="strava-title">${escapeHtml(a.name)}</div>
              <div class="strava-meta">
                <span>${date.toLocaleDateString("de-CH")}</span>
                <span>${km} km</span>
                <span>${minutes} min</span>
              </div>
            </a>
          `;
      })
      .join("");
  } catch (e) {
    console.error(e);
    grid.innerHTML = `<div class="muted">Konnte Strava-Daten nicht laden. Liegt strava-data.json im gleichen Ordner?</div>`;
  }
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadStrava();
