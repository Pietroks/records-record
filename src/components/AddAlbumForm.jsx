// src/components/AddAlbumForm.jsx

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

const PAGE_SIZE = 20;

export default function AddAlbumForm({ onAlbumAdded }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [offset, setOffset] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  // Função para buscar os dados da API
  const fetchMoreResults = async (currentOffset, isNewSearch = false) => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/search-albums?q=${query}&limit=${PAGE_SIZE}&offset=${currentOffset}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Atualiza o estado dos resultados
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
  };

  // Função chamada quando o formulário de busca é submetido
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() === "") return;
    setResults([]); // Limpa os resultados antigos antes de uma nova busca
    setOffset(0);
    fetchMoreResults(0, true);
  };

  // Função chamada pelo botão "Carregar mais"
  const handleLoadMore = () => {
    fetchMoreResults(offset);
  };

  // Função para adicionar um álbum à base de dados
  const handleAddAlbum = async (album) => {
    setMessage("");
    const newAlbum = {
      mbid: album.id,
      nome: album.nome,
      artista: album.artista,
      ano: album.ano,
      genero: "A definir",
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
    }
  };

  // O JSX que desenha o componente na tela
  return (
    <div className="my-8 p-6 bg-gray-900 rounded-lg shadow-xl text-center ">
      <h2 className="text-2xl font-bold mb-4 text-white">Adicionar novo Album</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite o nome do Album ou artista"
          className="w-3xl p-2 rounded bg-gray-700 text-white border border-gray-600"
        />
        <button
          type="submit"
          disabled={loading && results.length === 0}
          className="cursor-pointer mt-2 w-3xl bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
        >
          {loading && results.length === 0 ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-yellow-400">{message}</p>}

      <div className="mt-4 max-h-80 overflow-y-auto text-center w-3xl mx-auto">
        {results.map((album) => (
          <div key={album.id} className="flex items-center space-x-4 p-2 border-b border-gray-700">
            <Image
              src={album.capa || "/placeholder.jpg"}
              alt={`Capa do ${album.nome}`}
              width={50}
              height={50}
              className="rounded-md object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder.jpg";
              }}
            />
            <div className="flex-grow text-left">
              <p className="font-bold text-white truncate">{album.nome}</p>
              <p className="text-sm text-gray-400">
                {album.artista} ({album.ano})
              </p>
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
