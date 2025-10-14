import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.URL);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required.' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(query)}&fmt=json`, {
      headers: {
        "User-Agent": "RecordsRecord/1.0.0 (pietrokettner52@gmail.com)",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from MusicBrainz API");
    }

    const data = await response.json();

    // formatar os dados
    const formattedResults = data["release-groups"].map((item) => ({
      id: item.id,
      nome: item.title,
      artista: item["artist-credit"]?.[0]?.artist?.name || "Desconhecido",
      ano: item["first-release-date"]?.split("-")[0] || "N/A",
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
