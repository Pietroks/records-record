export default function AlbumCard({ album, onRate }) {
  return (
    <div className="border rounded-lg p-4 shadow-md  bg-gray-800 text-white">
      <img
        src={album.capa || "/album-cover-made-with-love-by-neural-frames.png"}
        onError={(e) => (e.currentTarget.src = "/album-cover-made-with-love-by-neural-frames.png")}
        alt={`Capa do album ${album.nome}`}
        width={200}
        height={200}
        className="w-full h-auto object-cover rounded-md mb-3 transition-transform duration-300 hover:scale-105"
      />
      <h3 className="text-xl font-bold truncate">{album.nome}</h3>
      <p className="text-gray-400">{album.artista}</p>
      <p className="text-gray-500 text-sm">{album.ano}</p>
      <button
        onClick={() => onRate(album)}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 transition-colors font-bold py-2 px-4 rounded cursor-pointer"
      >
        Avaliar
      </button>
    </div>
  );
}
