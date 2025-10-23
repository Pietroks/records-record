// src/components/AddAlbumForm.jsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useDebounce } from "use-debounce";

const PAGE_SIZE = 20;

export default function AddAlbumForm({ onAlbumAdded }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [offset, setOffset] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);

  const fetchMoreResults = useCallback(async (queryToSearch, currentOffset, isNewSearch = false) => {
    if (queryToSearch.trim() === "") {
      setResults([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/search-albums?q=${queryToSearch}&limit=${PAGE_SIZE}&offset=${currentOffset}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResults((prevResults) => {
        const newAlbums = data.albums.filter((newAlbum) => !prevResults.find((existingAlbum) => existingAlbum.id === newAlbum.id));
        return isNewSearch ? data.albums : [...prevResults, ...newAlbums];
      });

      setTotalResults(data.count);
      setOffset(currentOffset + PAGE_SIZE);
    } catch (error) {
      setMessage(`Erro ao buscar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim().length > 2) {
      setResults([]);
      setOffset(0);
      setSearchedQuery(debouncedQuery);
      fetchMoreResults(debouncedQuery, 0, true);
    } else {
      setResults([]);
      setTotalResults(0);
      setSearchedQuery("");
    }
  }, [debouncedQuery, fetchMoreResults]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() === "") return;
    setResults([]);
    setOffset(0);
    setSearchedQuery(query);
    fetchMoreResults(query, 0, true);
  };

  const handleLoadMore = () => {
    fetchMoreResults(searchedQuery, offset);
  };

  const handleAddAlbum = async (album) => {
    setMessage("");
    const newAlbum = {
      mbid: album.id,
      nome: album.nome,
      artista: album.artista,
      ano: album.ano,
      genero: album.genero,
      capa: `https://coverartarchive.org/release-group/${album.id}/front-250`,
    };

    const { data, error } = await supabase.from("albums").insert([newAlbum]).select().single();

    if (error) {
      if (error.code === "23505") {
        setMessage(`O álbum "${newAlbum.nome}" já existe na sua coleção.`);
      } else {
        setMessage(`Erro ao adicionar álbum: ${error.message}`);
      }
    } else {
      setMessage(`Álbum "${data.nome}" adicionado com sucesso!`);
      onAlbumAdded(data);
      setQuery("");
      setResults([]);
      setTotalResults(0);
      setSearchedQuery("");
    }
  };

  return (
    <div className="my-8 p-6 bg-gray-900 rounded-lg shadow-xl text-center ">
      <h2 className="text-2xl font-bold mb-4 text-white">Adicionar novo Album</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite o nome do Album ou artista"
          className="w-full max-w-3xl mx-auto p-2 rounded bg-gray-700 text-white border border-gray-600"
        />
        <button
          type="submit"
          disabled={loading && results.length === 0}
          className="cursor-pointer mt-2 w-full max-w-3xl mx-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
        >
          {loading && results.length === 0 ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-yellow-400">{message}</p>}

      <div className="mt-4 max-h-80 overflow-y-auto text-center w-full max-w-3xl mx-auto">
        {results.map((album) => (
          <div key={album.id} className="flex items-center space-x-4 p-2 border-b border-gray-700">
            <img
              src={album.capa || "/album-cover-made-with-love-by-neural-frames.png"}
              alt={`Capa do ${album.nome}`}
              width={50}
              height={50}
              className="rounded-md object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/album-cover-made-with-love-by-neural-frames.png";
              }}
            />
            <div className="flex-grow text-left">
              <p className="font-bold text-white truncate">{album.nome}</p>
              <p className="text-sm text-gray-400">
                {album.artista} ({album.ano})
              </p>
              <p className="text-xs text-blue-400 capitalize">{album.genero}</p>
            </div>
            <button
              onClick={() => handleAddAlbum(album)}
              className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 rounded flex-shrink-0"
            >
              Adicionar
            </button>
          </div>
        ))}
      </div>

      {results.length > 0 && results.length < totalResults && (
        <div className="mt-4 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            {loading ? "Carregando..." : "Carregar mais"}
          </button>
        </div>
      )}
    </div>
  );
}
