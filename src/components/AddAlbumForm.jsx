"use Client";

import { use, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AddAlbumForm({ onAlbumAdded }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim() === "") return;

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/search-albums?q=${query}`);
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setResults(data);
    } catch (error) {
      setMessage(`Erro ao buscar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlbum = async (album) => {
    setMessage("");
    const newAlbum = {
      nome: album.nome,
      aritista: album.artista,
      ano: album.ano,
      genero: "A definir",
      capa: `https://coverartarchive.org/release-group/${album.id}/front-250`,
    };

    const { data, error } = await supabase.from("albums").insert([newAlbum]).select().single();

    if (error) {
      if (error.code === "23505") {
        setMessage('Album "${newAlbum.nome}" ja existe na sua coleção.');
      } else {
        setMessage(`Erro ao adicionar album: ${error.message}`);
      }
    } else {
      setMessage(`Album "${data.nome}" adicionado com sucesso!`);
      onAlbumAdded(data);
      setQuery("");
      setResults([]);
    }
  };

  return (
    <div className="my-8 p-6 bg-gray-900 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-white">Adicionar novo Album</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite o nome do Album ou artista"
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        />
        <button type="submit" disabled={loading} className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded">
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-yellow-400">{message}</p>}
      <div className="mt-4 max-h-60 overflow-y-auto">
        {results.map((album) => (
          <div key={album.id} className="flex justify-between items-center p-2 border-b border-gray-700">
            <div>
              <p className="font-bold text-white">{album.nome}</p>
              <p className="text-sm text-gray-400">
                {album.artista} ({album.ano})
              </p>
            </div>
            <button
              onClick={() => handleAddAlbum(album)}
              className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 rounded"
            >
              Adicionar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
