import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'
import { FaTrash, FaBookReader, FaSearch, FaEdit, FaImage, FaBoxOpen } from 'react-icons/fa' 
import { Link } from 'react-router-dom'

const Home = () => {
  const [books, setBooks] = useState([])
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All') // <--- STATE KATEGORI

  const adminEmail = "alwznx@gmail.com" // GANTI EMAIL KAMU

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    getBooks()
  }, [])

  const getBooks = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('books').select('*').order('id', { ascending: false })
    if (error) console.log("Error:", error.message)
    else setBooks(data)
    setLoading(false)
  }

  const deleteBook = async (id) => {
    if (!confirm("Yakin hapus?")) return
    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) toast.error("Gagal hapus!")
    else { toast.success("Terhapus!"); getBooks() }
  }

  const borrowBook = async (book) => {
    if (!session) { toast.error("Login dulu!"); return }
    if (book.stock <= 0) { toast.error("Stok habis bos!"); return }

    const { error: updateError } = await supabase.from('books').update({ stock: book.stock - 1 }).eq('id', book.id)
    if (updateError) { toast.error("Gagal update stok"); return }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)

    const { error: borrowError } = await supabase.from('borrowed_books').insert([{ user_id: session.user.id, book_id: book.id, due_date: dueDate }])
    if (borrowError) toast.error("Gagal pinjam")
    else { toast.success("Berhasil! Cek 'Buku Saya'."); getBooks() }
  }

  // LOGIKA FILTER YANG DIPERBARUI
  const filteredBooks = books.filter((book) => {
    // 1. Cek Keyword (Search)
    const matchKeyword = book.title.toLowerCase().includes(keyword.toLowerCase()) || 
                         book.author.toLowerCase().includes(keyword.toLowerCase())
    
    // 2. Cek Kategori
    const matchCategory = selectedCategory === 'All' || book.category === selectedCategory

    return matchKeyword && matchCategory
  })

  const categories = ['All', 'Teknologi', 'Fiksi', 'Sains', 'Sejarah', 'Bisnis', 'Umum']

  return (
    <div className="container mx-auto p-8">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-800 mb-2">Perpustakaan Digital</h2>
        <p className="text-gray-500">Temukan wawasan baru di setiap halaman.</p>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="text-gray-400" /></div>
          <input type="text" placeholder="Cari buku..." className="w-full pl-10 p-3 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
      </div>

      {/* FILTER BUTTONS (TOMBOL KATEGORI) */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition
              ${selectedCategory === cat 
                ? 'bg-blue-600 text-white shadow-md' // Gaya kalau Aktif
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100' // Gaya kalau Tidak Aktif
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8"> 
          {filteredBooks.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">Tidak ada buku di kategori ini.</p>
          ) : (
            filteredBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-xl shadow hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 flex flex-col">
                <div className="h-48 bg-gray-200 relative overflow-hidden group">
                  <Link to={`/buku/${book.id}`}>
                    {book.image_url ? (
                      <img src={book.image_url} alt={book.title} className="w-full h-full object-cover transition group-hover:scale-110 duration-500" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400"><FaImage className="text-4xl mb-2" /><span className="text-xs">No Cover</span></div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-700 shadow flex items-center gap-1">
                      <FaBoxOpen /> Stok: {book.stock}
                    </div>
                    {/* BADGE KATEGORI */}
                    <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow">
                      {book.category || 'Umum'}
                    </div>
                  </Link>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <Link to={`/buku/${book.id}`}>
                      <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-1 hover:text-blue-600 transition">{book.title}</h3>
                    </Link>
                    <p className="text-sm text-blue-600 font-semibold mb-2">{book.author}</p>
                  </div>
                  
                  <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                    {session && (
                      <button onClick={() => borrowBook(book)} disabled={book.stock === 0} className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${book.stock > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                        {book.stock > 0 ? 'PINJAM' : 'HABIS'}
                      </button>
                    )}
                    {session && session.user.email === adminEmail && (
                      <>
                        <Link to={`/edit/${book.id}`} className="bg-yellow-100 text-yellow-600 hover:bg-yellow-500 hover:text-white p-2 rounded-lg transition"><FaEdit /></Link>
                        <button onClick={() => deleteBook(book.id)} className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-lg transition"><FaTrash /></button>
                      </>
                    )}
                  </div>
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