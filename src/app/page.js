"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import AlbumCard from "@/components/AlbumCard";
import AddAlbumForm from "@/components/AddAlbumForm";
import ReviewModal from "@/components/ReviewModal";

export default function HomePage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  async function fetchAlbums() {
    setLoading(true);
    const { data, error } = await supabase.from("albums").select("*").order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao buscar albums:", error);
    } else {
      setAlbums(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleOpenModal = (album) => {
    setSelectedAlbum(album);
  };

  const handleCloseModal = () => {
    setSelectedAlbum(null);
  };

  const handleReviewSaved = () => {
    handleCloseModal();
    alert("Avaliação salva com sucesso!");
  };

  const handleAlbumAdded = (newAlbum) => {
    setAlbums((prevAlbums) => [newAlbum, ...prevAlbums]);
  };

  return (
    <main className="container mx-auto p-4 bg-gray-950 min-h-screen text-white">
      <h1 className="text-4xl font-bold text-center my-8">Meu catalogo de Albums</h1>

      <AddAlbumForm onAlbumAdded={handleAlbumAdded} />
      {loading ? (
        <p className="text-center">Carregando albums...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} onRate={handleOpenModal} />
          ))}
        </div>
      )}

      {selectedAlbum && <ReviewModal album={selectedAlbum} onClose={handleCloseModal} onReviewSaved={handleReviewSaved} />}
    </main>
  );
}
