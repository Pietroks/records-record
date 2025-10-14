"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const ratingLegend = {
  0: "Pessimo",
  1: "Ruim",
  2: "Regular",
  3: "Bom",
  4: "Otimo",
  5: "Excelente!",
};

export default function ReviewModal({ album, onClose, onReviewSaved }) {
  const [ratings, setRatings] = useState({
    producao: 3,
    composicao: 3,
    originalidade: 3,
  });
  const [observacoes, setObservacoes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  if (!album) return null;

  const handleRatingChange = (criterio, value) => {
    setRatings((prev) => ({ ...prev, [criterio]: parseInt(value, 10) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    const reviewData = {
      album_id: album.id,
      ...ratings,
      observacoes,
    };

    const { data, error } = await supabase.from("reviews").insert([reviewData]);

    if (error) {
      setError(`Erro ao salvar avaliação: ${error.message}`);
    } else {
      onReviewSaved();
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-white">Avaliar: {album.nome}</h2>
        <p className="text-gray-400 mb-6">{album.artista}</p>
        <form onSubmit={handleSubmit}>
          {Object.keys(ratings).map((criterio) => (
            <div key={criterio} className="mb-4">
              <label className="block text-white capitalize mb-1">{criterio}</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={ratings[criterio]}
                  onChange={(e) => handleRatingChange(criterio, e.target.value)}
                  className="w-full"
                />
                <span className="font-bold text-white w-8 text-center">{ratings[criterio]}</span>
              </div>
              <p className="text-sm text-gray-500 text-center">{ratingLegend[ratings[criterio]]}</p>
            </div>
          ))}

          <div className="mb-4">
            <label htmlFor="Observacoes" className="block text-white mb-1">
              Observações
            </label>
            <textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 h-24"
            />
          </div>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              {isSaving ? "Salvando..." : "Salvar avaliação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
