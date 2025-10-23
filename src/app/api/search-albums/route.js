import { NextResponse } from "next/server";

const genreCache = new Map();

async function fetchBestGenre(albumId, artistId) {
  if (genreCache.has(albumId)) return genreCache.get(albumId);
  let genre = "Indefinido";

  try {
    let apiUrl = `https://musicbrainz.org/ws/2/release-group/${albumId}?inc=genres&fmt=json`;
    let response = await fetch(apiUrl, {
      headers: { "User-Agent": "RecordsRecord/1.0.0 (pietrokettner52@gmail.com)" },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.genres && data.genres.length > 0) {
        genre = data.genres[0].name;
      }
    }

    if (genre === "Indefinido" && artistId) {
      apiUrl = `https://musicbrainz.org/ws/2/artist/${artistId}?inc=genres&fmt=json`;
      response = await fetch(apiUrl, {
        headers: { "User-Agent": "RecordsRecord/1.0.0 (pietrokettner52@gmail.com)" },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.genres && data.genres.length > 0) {
          genre = data.genres[0].name;
        }
      }
    }
  } catch (error) {
    console.error("Erro ao buscar genero:", error);
    return "Indefinido";
  }
  genreCache.set(albumId, genre);
  return genre;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = searchParams.get("limit") || 10;
  const offset = searchParams.get("offset") || 0;

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required.' }, { status: 400 });
  }

  try {
    const apiUrl = `https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(
      query
    )}&fmt=json&limit=${limit}&offset=${offset}`;

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "RecordsRecord/1.0.0 (pietrokettner52@gmail.com)",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch data from MusicBrainz API: ${response.statusText}`);
    }

    const data = await response.json();

    // formatar os dados
    const formattedResults = data["release-groups"].map((item) => ({
      id: item.id,
      nome: item.title,
      artista: item["artist-credit"]?.[0]?.artist?.name || "Desconhecido",
      artistId: item["artist-credit"]?.[0]?.artist?.id || null,
      ano: item["first-release-date"]?.split("-")[0] || "N/A",
      capa: `https://coverartarchive.org/release-group/${item.id}/front-250`,
    }));

    const retultsWithGenre = await Promise.all(
      formattedResults.map(async (album) => {
        const genre = await fetchBestGenre(album.id, album.artistId);
        return {
          ...album,
          genero: genre,
        };
      })
    );

    return NextResponse.json({
      albums: retultsWithGenre,
      count: data.count,
    });
  } catch (error) {
    console.error("Erro geral na busca:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
