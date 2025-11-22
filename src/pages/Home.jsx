import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast' // Import Notifikasi
import { FaTrash, FaBookReader, FaSearch } from 'react-icons/fa' // Import Ikon

const Home = () => {
  const [books, setBooks] = useState([])
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')

  // GANTI DENGAN EMAIL ADMIN KAMU
  const adminEmail = "alwznx@gmail.com" 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    getBooks()
  }, [])

  const getBooks = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('books').select('*').order('id', { ascending: false })
    
    if (error) console.log("Gagal ambil buku:", error.message)
    else setBooks(data)
    setLoading(false)
  }

  const deleteBook = async (id) => {
    // Ganti window.confirm biasa dengan toast promise (opsional), tapi biar simpel pakai confirm dulu
    if (!confirm("Yakin mau hapus buku ini?")) return
    
    const { error } = await supabase.from('books').delete().eq('id', id)
    
    if (error) {
      toast.error("Gagal menghapus buku!") // Notifikasi Merah
    } else {
      toast.success("Buku berhasil dihapus!", { icon: '🗑️' }) // Notifikasi Hijau
      getBooks()
    }
  }

  const borrowBook = async (bookId) => {
    if (!session) {
      toast.error("Eits, login dulu dong!")
      return
    }
    const { error } = await supabase.from('borrowed_books').insert([
      { user_id: session.user.id, book_id: bookId }
    ])
    
    if (error) {
      toast.error("Gagal meminjam: " + error.message)
    } else {
      toast.success("Berhasil dipinjam! Cek di menu 'Buku Saya'")
    }
  }

  const filteredBooks = books.filter((book) => 
    book.title.toLowerCase().includes(keyword.toLowerCase()) || 
    book.author.toLowerCase().includes(keyword.toLowerCase())
  )

  return (
    <div className="container mx-auto p-8">
      
      {/* Header dengan Icon */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-800 mb-2">Perpustakaan Digital</h2>
        <p className="text-gray-500">Temukan wawasan baru di setiap halaman.</p>
      </div>

      {session && session.user.email === adminEmail && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 mx-auto max-w-2xl rounded shadow-sm">
          <p className="font-bold">Mode Admin Aktif</p>
          <p className="text-sm">Anda memiliki akses untuk menghapus dan menambah buku.</p>
        </div>
      )}

      {/* Input Pencarian Cantik */}
      <div className="mb-10 flex justify-center">
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input 
            type="text"
            placeholder="Cari judul buku atau penulis..." 
            className="w-full pl-10 p-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredBooks.length === 0 ? (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500 text-lg">Buku tidak ditemukan 😔</p>
            </div>
          ) : (
            filteredBooks.map((book) => (
              <div key={book.id} className="bg-white p-6 rounded-xl shadow hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between border border-gray-100">
                <div>
                  <h3 className="text-xl font-bold mb-1 text-gray-800 line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-blue-600 font-semibold mb-3">{book.author}</p>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed">{book.description}</p>
                </div>
                
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                  {session && (
                    <button 
                      onClick={() => borrowBook(book.id)}
                      className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 group"
                    >
                      <FaBookReader className="text-lg group-hover:scale-110 transition" /> 
                      Pinjam
                    </button>
                  )}
                  {session && session.user.email === adminEmail && (
                    <button 
                      onClick={() => deleteBook(book.id)}
                      className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg transition flex items-center justify-center"
                      title="Hapus Buku"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Home