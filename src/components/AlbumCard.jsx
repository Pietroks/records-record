import Image from "next/image";

export default function AlbumCard({ album, onRate }) {
  return (
    <div className="border rounder-lg p-4 shadow-md  bg-gray-800 text-white">
      <Image
        src={album.capa || "/placeholder-cover.jpg"}
        alt={`Capa do album ${album.nome}`}
        width={200}
        height={200}
        className="w-full h-auto object-cover rounded-md mb-4"
      />
      <h3 className="text-xl font-bold truncate">{album.nome}</h3>
      <p className="text-gray-400">{album.artista}</p>
      <p className="text-gray-500 text-sm">{album.ano}</p>
      <button onClick={() => onRate(album)} className="mt-4 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded">
        Avaliar
      </button>
    </div>
  );
}
