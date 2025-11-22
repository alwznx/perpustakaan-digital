import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const Home = () => {
  const [books, setBooks] = useState([])
  const [session, setSession] = useState(null) // Simpan data user login
  const [loading, setLoading] = useState(true)

  // GANTI DENGAN EMAIL KAMU SUPAYA JADI ADMIN
  const adminEmail = "tes1@coba.com" 

  useEffect(() => {
    // 1. Cek siapa yang login
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    getBooks()
  }, [])

  const getBooks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('id', { ascending: false })
    
    if (error) console.log("Gagal ambil buku:", error.message)
    else setBooks(data)
    
    setLoading(false)
  }

  const deleteBook = async (id) => {
    if (!confirm("Yakin mau hapus buku ini?")) return
    
    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) alert("Gagal hapus: " + error.message)
    else {
      alert("Buku terhapus!")
      getBooks()
    }
  }

  // FUNGSI BARU: Pinjam Buku
  const borrowBook = async (bookId) => {
    if (!session) {
      alert("Silakan login dulu untuk meminjam!")
      return
    }

    // Masukkan data ke tabel 'borrowed_books'
    const { error } = await supabase
      .from('borrowed_books')
      .insert([
        { 
          user_id: session.user.id, // Siapa yang minjam
          book_id: bookId           // Buku apa yang dipinjam
        }
      ])

    if (error) {
      alert("Gagal meminjam: " + error.message)
    } else {
      alert("Buku berhasil dipinjam! Selamat membaca.")
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">
        📚 Koleksi Perpustakaan
      </h2>

      {/* PESAN SELAMAT DATANG SESUAI ROLE */}
      {session && (
        <div className="text-center mb-6 text-gray-600">
          Login sebagai: <span className="font-bold">{session.user.email}</span>
          {session.user.email === adminEmail && <span className="ml-2 text-red-500">(Admin)</span>}
        </div>
      )}

      {loading ? (
        <p className="text-center">Sedang memuat...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{book.title}</h3>
                <p className="text-sm text-blue-600 font-semibold mb-3">Penulis: {book.author}</p>
                <p className="text-gray-600 text-sm mb-4">{book.description}</p>
              </div>
              
              <div className="flex gap-2 mt-4">
                
                {/* TOMBOL PINJAM (Hanya untuk yang sudah login) */}
                {session && (
                  <button 
                    onClick={() => borrowBook(book.id)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm transition"
                  >
                    📖 Pinjam
                  </button>
                )}

                {/* TOMBOL HAPUS (Hanya untuk ADMIN) */}
                {session && session.user.email === adminEmail && (
                  <button 
                    onClick={() => deleteBook(book.id)}
                    className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm transition"
                  >
                    🗑️ Hapus
                  </button>
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