// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
const token =
  "BQAqgugHitymsHO1cclc_7wfcwq-qusihDTS0Fbwl4RyuD6n4ncgW4fMNQsCcqE7qXQc2cUttlWRH698s39iKFbrQum3TMx6iVnJSJ5whIDXoo5w1SJoFk8bJthg5veS4yCvmLd_ju9L203TgoRQtnjgKqaWhPe__SS4pAoTNOJZATS33kAxzKBhKSvlu1aLGGrkOY5vZaRfAiZtA3ivDLLSY12DHyS_XQoQm-fRZ17TGh_HdLPcVnsGZwTwDVROSybY5Zy9lvlmY-s2-Lzuq8mboVIVF45bMnFmtdc8kPjOIHQ-Z6cgrzxa-3VMD9YTK_Qr";
async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body: JSON.stringify(body),
  });
  return await res.json();
}

async function getTopTracks() {
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  return (
    await fetchWebApi("v1/me/top/tracks?time_range=long_term&limit=5", "GET")
  ).items;
}

const topTracks = await getTopTracks();
console.log(
  topTracks?.map(
    ({ name, artists }) =>
      `${name} by ${artists.map((artist) => artist.name).join(", ")}`
  )
);
