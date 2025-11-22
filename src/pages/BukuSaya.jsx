import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const BukuSaya = () => {
  const [borrowed, setBorrowed] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBorrowedBooks()
  }, [])

  const getBorrowedBooks = async () => {
    setLoading(true)
    
    // 1. Ambil user yang sedang login
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // 2. Ambil data peminjaman milik user ini
      // books(*) artinya: "Tolong ambilkan sekalian detail bukunya"
      const { data, error } = await supabase
        .from('borrowed_books')
        .select('*, books(*)') 
        .eq('user_id', session.user.id) // Filter punya user ini saja

      if (error) console.log("Error:", error.message)
      else setBorrowed(data)
    }
    setLoading(false)
  }

  // Fungsi Mengembalikan Buku (Hapus dari tabel peminjaman)
  const returnBook = async (id) => {
    if (!confirm("Sudah selesai membacanya? Mau dikembalikan?")) return

    const { error } = await supabase
      .from('borrowed_books')
      .delete()
      .eq('id', id) // Hapus baris peminjaman ini

    if (error) {
      alert("Gagal mengembalikan: " + error.message)
    } else {
      alert("Buku berhasil dikembalikan!")
      getBorrowedBooks() // Refresh daftar
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">
        📖 Buku yang Sedang Saya Pinjam
      </h2>

      {loading ? (
        <p className="text-center">Memuat data...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {borrowed.length === 0 ? (
            <p className="col-span-2 text-center text-gray-500 mt-8">
              Kamu belum meminjam buku apapun.
            </p>
          ) : (
            borrowed.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  {/* Perhatikan cara aksesnya: item.books.judul */}
                  <h3 className="text-xl font-bold text-gray-800">{item.books.title}</h3>
                  <p className="text-gray-600">Penulis: {item.books.author}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Dipinjam tanggal: {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <button 
                  onClick={() => returnBook(item.id)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition"
                >
                  Kembalikan
                </button>
              </div>
            ))
          )}

        </div>
      )}
    </div>
  )
}

export default BukuSaya