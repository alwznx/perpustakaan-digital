import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'
import { FaTrash, FaBookReader, FaSearch, FaEdit } from 'react-icons/fa' // Tambah FaEdit
import { Link } from 'react-router-dom' // Import Link

const Home = () => {
  const [books, setBooks] = useState([])
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')

  const adminEmail = "alwznx@gmail.com" // Email Admin Kamu

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
    if (!confirm("Yakin mau hapus buku ini?")) return
    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) toast.error("Gagal menghapus!")
    else {
      toast.success("Buku dihapus!", { icon: '🗑️' })
      getBooks()
    }
  }

  const borrowBook = async (bookId) => {
    if (!session) {
      toast.error("Login dulu dong!")
      return
    }
    const { error } = await supabase.from('borrowed_books').insert([{ user_id: session.user.id, book_id: bookId }])
    if (error) toast.error("Gagal meminjam")
    else toast.success("Berhasil dipinjam!")
  }

  const filteredBooks = books.filter((book) => 
    book.title.toLowerCase().includes(keyword.toLowerCase()) || 
    book.author.toLowerCase().includes(keyword.toLowerCase())
  )

  return (
    <div className="container mx-auto p-8">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-800 mb-2">Perpustakaan Digital</h2>
        <p className="text-gray-500">Temukan wawasan baru di setiap halaman.</p>
      </div>

      <div className="mb-10 flex justify-center">
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input 
            type="text" placeholder="Cari judul buku atau penulis..." 
            className="w-full pl-10 p-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={keyword} onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col justify-between border border-gray-100">
              <div>
                <h3 className="text-xl font-bold mb-1 text-gray-800 line-clamp-2">{book.title}</h3>
                <p className="text-sm text-blue-600 font-semibold mb-3">{book.author}</p>
                <p className="text-gray-500 text-sm mb-4 line-clamp-3">{book.description}</p>
              </div>
              
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                {session && (
                  <button onClick={() => borrowBook(book.id)} className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 group">
                    <FaBookReader className="text-lg" /> Pinjam
                  </button>
                )}
                
                {/* MENU ADMIN: EDIT & DELETE */}
                {session && session.user.email === adminEmail && (
                  <>
                    {/* TOMBOL EDIT (KUNING) */}
                    <Link 
                      to={`/edit/${book.id}`} 
                      className="bg-yellow-100 text-yellow-600 hover:bg-yellow-500 hover:text-white px-3 py-2 rounded-lg transition flex items-center justify-center"
                      title="Edit Buku"
                    >
                      <FaEdit />
                    </Link>

                    {/* TOMBOL HAPUS (MERAH) */}
                    <button onClick={() => deleteBook(book.id)} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-2 rounded-lg transition flex items-center justify-center" title="Hapus Buku">
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home