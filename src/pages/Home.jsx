import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const Home = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBooks()
  }, [])

  const getBooks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('id', { ascending: false }) // Urutkan dari yang terbaru

    if (error) {
      console.log("Gagal ambil buku:", error.message)
    } else {
      setBooks(data)
    }
    setLoading(false)
  }

  // FUNGSI BARU: Hapus Buku
  const deleteBook = async (id) => {
    // 1. Tanya dulu, yakin mau hapus?
    const confirmDelete = window.confirm("Apakah kamu yakin ingin menghapus buku ini?")
    if (!confirmDelete) return // Kalau batal, stop di sini

    // 2. Perintah Hapus ke Supabase
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id) // Hapus yang id-nya sama dengan yang diklik

    if (error) {
      alert("Gagal menghapus: " + error.message)
    } else {
      // 3. Kalau sukses, panggil lagi daftar buku biar update
      alert("Buku berhasil dihapus!")
      getBooks() 
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">
        📚 Koleksi Perpustakaan
      </h2>

      {loading ? (
        <p className="text-center">Sedang memuat buku...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{book.title}</h3>
                <p className="text-sm text-blue-600 font-semibold mb-3">Penulis: {book.author}</p>
                <p className="text-gray-600 text-sm mb-4">{book.description}</p>
              </div>
              
              {/* TOMBOL HAPUS */}
              <button 
                onClick={() => deleteBook(book.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm self-start"
              >
                Hapus Buku
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && books.length === 0 && (
        <p className="text-center text-gray-500">Belum ada buku yang tersedia.</p>
      )}
    </div>
  )
}

export default Home