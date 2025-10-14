import { NextResponse } from "next/server";

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
      ano: item["first-release-date"]?.split("-")[0] || "N/A",
      capa: `https://coverartarchive.org/release-group/${item.id}/front-250`,
    }));

    return NextResponse.json({
      albums: formattedResults,
      count: data.count,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
