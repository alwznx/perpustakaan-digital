import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

const BukuSaya = () => {
  const [borrowed, setBorrowed] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBorrowedBooks()
  }, [])

  const getBorrowedBooks = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data } = await supabase
        .from('borrowed_books')
        .select('*, books(*)')
        .eq('user_id', session.user.id)
      setBorrowed(data || [])
    }
    setLoading(false)
  }

  const returnBook = async (borrowId, bookId, currentStock) => {
    if (!confirm("Kembalikan buku ini?")) return

    const { error: deleteError } = await supabase.from('borrowed_books').delete().eq('id', borrowId)
    if (deleteError) { toast.error("Gagal kembalikan"); return }

    const { error: updateError } = await supabase.from('books').update({ stock: currentStock + 1 }).eq('id', bookId)
    if (updateError) toast.error("Stok error")
    else toast.success("Buku dikembalikan! Terima kasih.")
    
    getBorrowedBooks()
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-800">📖 Buku yang Saya Pinjam</h2>
      
      {loading ? <p className="text-center">Memuat data...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {borrowed.length === 0 ? (
            <p className="col-span-2 text-center text-gray-500">Tidak ada buku yang sedang dipinjam.</p>
          ) : (
            borrowed.map((item) => {
              // LOGIKA CEK KETERLAMBATAN
              const today = new Date()
              const dueDate = new Date(item.due_date)
              const isOverdue = today > dueDate // True kalau hari ini melewati batas

              return (
                <div 
                  key={item.id} 
                  className={`p-6 rounded-xl shadow-md flex justify-between items-center border-l-4 transition hover:shadow-lg
                    ${isOverdue ? 'bg-red-50 border-red-500' : 'bg-white border-blue-500'}
                  `}
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{item.books.title}</h3>
                    <p className="text-gray-600 mb-2">{item.books.author}</p>
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>📅 Pinjam: {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                      
                      {/* TAMPILAN TANGGAL JATUH TEMPO */}
                      <p className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                        ⏳ Batas: {dueDate.toLocaleDateString('id-ID')}
                        {isOverdue && <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">TERLAMBAT!</span>}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => returnBook(item.id, item.books.id, item.books.stock)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition"
                  >
                    Kembalikan
                  </button>
                </div>
              )
            })
          )}

        </div>
      )}
    </div>
  )
}

export default BukuSaya