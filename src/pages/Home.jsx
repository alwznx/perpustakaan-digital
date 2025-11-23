import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'
import { FaTrash, FaSearch, FaEdit, FaImage, FaBoxOpen, FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart } from 'react-icons/fa' 
import { Link } from 'react-router-dom'
import SkeletonCard from '../components/SkeletonCard' // Import Skeleton
import PageTransition from '../components/PageTransition' // Import Animasi
import { sendNotification } from '../utils/notify'

const Home = () => {
  const [books, setBooks] = useState([])
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [wishlistIDs, setWishlistIDs] = useState([])

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8 

  // GANTI DENGAN EMAIL ADMIN KAMU
  const adminEmail = "alwznx@gmail.com" 

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      await getBooks()
      
      if (session) {
        // Ambil data Wishlist User
        const { data } = await supabase.from('wishlist').select('book_id').eq('user_id', session.user.id)
        if (data) {
          const ids = data.map(item => item.book_id)
          setWishlistIDs(ids)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const getBooks = async () => {
    const { data, error } = await supabase.from('books').select('*').order('id', { ascending: false })
    if (error) console.log("Error:", error.message)
    else setBooks(data)
  }

  const deleteBook = async (id) => {
    if (!confirm("Yakin hapus?")) return
    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) toast.error("Gagal hapus!")
    else { toast.success("Terhapus!", { icon: '🗑️' }); getBooks() }
  }

  const borrowBook = async (book) => {
    if (!session) { toast.error("Login dulu!"); return }
    
    const MAX_LOANS = 3
    
    // 1. Hitung jumlah buku yang sedang dipinjam user ini
    const { count, error: countError } = await supabase
      .from('borrowed_books')
      .select('*', { count: 'exact', head: true }) // head: true artinya cuma hitung jumlah, gak ambil datanya (biar ringan)
      .eq('user_id', session.user.id)

    if (countError) {
      toast.error("Gagal cek kuota peminjaman.")
      return
    }

    // 2. Kalau sudah 3 atau lebih, tolak!
    if (count >= MAX_LOANS) {
      toast.error(`Kuota habis! Kamu cuma boleh pinjam maks ${MAX_LOANS} buku.`)
      return 
    }

    if (book.stock <= 0) {
        toast.error("Stok habis bos!")
        return
    }

    // Kurangi Stok
    const { error: updateError } = await supabase.from('books').update({ stock: book.stock - 1 }).eq('id', book.id)
    if (updateError) { toast.error("Gagal update stok"); return }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)

    const { error: borrowError } = await supabase.from('borrowed_books').insert([{ 
        user_id: session.user.id, 
        user_email: session.user.email,
        book_id: book.id,
        due_date: dueDate
      }])
    
      if (borrowError) {
        toast.error("Gagal pinjam")
      } else {
        toast.success("Berhasil! Cek 'Buku Saya'.")
        sendNotification(session.user.id, `Berhasil meminjam buku: ${book.title}. Jangan lupa kembalikan tanggal ${dueDate.toLocaleDateString('id-ID')} ya!`)
        getBooks()
      }
  }

  const toggleWishlist = async (bookId) => {
    if (!session) { toast.error("Login dulu buat nge-love!"); return }

    const isLiked = wishlistIDs.includes(bookId)

    if (isLiked) {
      const { error } = await supabase.from('wishlist').delete().eq('user_id', session.user.id).eq('book_id', bookId)
      if (!error) {
        setWishlistIDs(prev => prev.filter(id => id !== bookId))
        toast.success("Dihapus dari Favorit")
      }
    } else {
      const { error } = await supabase.from('wishlist').insert([{ user_id: session.user.id, book_id: bookId }])
      if (!error) {
        setWishlistIDs(prev => [...prev, bookId])
        toast.success("Masuk Favorit ❤️")
      }
    }
  }

  // --- LOGIKA FILTER & PAGINATION ---
  const filteredBooks = books.filter((book) => {
    const matchKeyword = book.title.toLowerCase().includes(keyword.toLowerCase()) || 
                         book.author.toLowerCase().includes(keyword.toLowerCase())
    const matchCategory = selectedCategory === 'All' || book.category === selectedCategory
    return matchKeyword && matchCategory
  })

  const indexOfLastItem = currentPage * itemsPerPage 
  const indexOfFirstItem = indexOfLastItem - itemsPerPage 
  const currentBooks = filteredBooks.slice(indexOfFirstItem, indexOfLastItem) 
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage) 
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  useEffect(() => { setCurrentPage(1) }, [keyword, selectedCategory])
  const categories = ['All', 'Teknologi', 'Fiksi', 'Sains', 'Sejarah', 'Bisnis', 'Umum']

  return (
    <PageTransition> {/* <--- PEMBUNGKUS ANIMASI */}
      <div className="container mx-auto p-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 transition-colors">Perpustakaan Digital</h2>
          <p className="text-gray-500 dark:text-gray-400">Temukan wawasan baru di setiap halaman.</p>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-full max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="text-gray-400" /></div>
            <input 
              type="text" 
              placeholder="Cari judul atau penulis..." 
              className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition bg-white dark:bg-gray-800 dark:text-white" 
              value={keyword} 
              onChange={(e) => setKeyword(e.target.value)} 
            />
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition border ${selectedCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{cat}</button>
          ))}
        </div>

        {/* GRID BUKU */}
        {loading ? (
          // TAMPILAN SKELETON SAAT LOADING
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8"> 
              {currentBooks.length === 0 ? (
                <p className="col-span-full text-center text-gray-500 dark:text-gray-400 italic">Buku tidak ditemukan.</p>
              ) : (
                currentBooks.map((book) => {
                  const isLiked = wishlistIDs.includes(book.id)
                  return (
                    <div key={book.id} className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col relative">
                      
                      {/* TOMBOL LOVE */}
                      {session && (
                        <button onClick={() => toggleWishlist(book.id)} className="absolute top-3 left-3 z-10 bg-white dark:bg-gray-700 p-2 rounded-full shadow hover:bg-pink-50 dark:hover:bg-gray-600 transition text-lg">
                          {isLiked ? <FaHeart className="text-pink-500" /> : <FaRegHeart className="text-gray-400 dark:text-gray-300" />}
                        </button>
                      )}

                      <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden group">
                        <Link to={`/buku/${book.id}`}>
                          {book.image_url ? (
                            <img src={book.image_url} alt={book.title} className="w-full h-full object-cover transition group-hover:scale-110 duration-500" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400"><FaImage className="text-4xl mb-2" /><span className="text-xs">No Cover</span></div>
                          )}
                          <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded text-xs font-bold text-gray-700 dark:text-gray-200 shadow flex items-center gap-1"><FaBoxOpen /> Stok: {book.stock}</div>
                          <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow">{book.category || 'Umum'}</div>
                        </Link>
                      </div>

                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <Link to={`/buku/${book.id}`}><h3 className="text-lg font-bold text-gray-800 dark:text-white line-clamp-2 mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer">{book.title}</h3></Link>
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-2">{book.author}</p>
                        </div>
                        
                        <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                          {session && (
                            <button onClick={() => borrowBook(book)} disabled={book.stock === 0} className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${book.stock > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}`}>
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
                  )
                })
              )}
            </div>

            {/* TOMBOL PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className={`p-2 rounded-full border ${currentPage === 1 ? 'text-gray-300 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed' : 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800'}`}><FaChevronLeft /></button>
                <span className="text-gray-600 dark:text-gray-300 font-medium">Halaman {currentPage} dari {totalPages}</span>
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className={`p-2 rounded-full border ${currentPage === totalPages ? 'text-gray-300 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed' : 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800'}`}><FaChevronRight /></button>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  )
}

export default Home