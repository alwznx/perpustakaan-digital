import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaTrash, FaHeart } from 'react-icons/fa'

const FavoritSaya = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Ambil data wishlist + detail bukunya
      const { data } = await supabase
        .from('wishlist')
        .select('*, books(*)') 
        .eq('user_id', session.user.id)
      
      setFavorites(data || [])
    }
    setLoading(false)
  }

  const removeFavorite = async (wishlistId) => {
    const { error } = await supabase.from('wishlist').delete().eq('id', wishlistId)
    if (error) toast.error("Gagal hapus")
    else {
      toast.success("Dihapus dari favorit")
      fetchFavorites() 
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-pink-600 flex justify-center items-center gap-2">
        <FaHeart /> Buku Favorit Saya
      </h2>

      {loading ? <p className="text-center">Memuat...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">
              <p>Kamu belum menandai buku favorit.</p>
              <Link to="/" className="text-blue-600 underline mt-2 block">Cari buku dulu yuk!</Link>
            </div>
          ) : (
            favorites.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow border border-pink-100 flex flex-col justify-between">
                
                {/* Info Buku */}
                <div className="mb-4">
                  <Link to={`/buku/${item.books.id}`}>
                    <img 
                      src={item.books.image_url || 'https://via.placeholder.com/150'} 
                      alt="Cover" 
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-bold text-gray-800 line-clamp-1 hover:text-pink-600 transition">{item.books.title}</h3>
                  </Link>
                  <p className="text-sm text-gray-500">{item.books.author}</p>
                </div>

                {/* Tombol Hapus */}
                <button 
                  onClick={() => removeFavorite(item.id)}
                  className="w-full border border-red-500 text-red-500 hover:bg-red-50 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2"
                >
                  <FaTrash /> Hapus
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default FavoritSaya