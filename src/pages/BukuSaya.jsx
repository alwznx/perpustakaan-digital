import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'
import { sendNotification } from '../utils/notify'

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

  // --- LOGIKA DENDA (RP 1000 / HARI) ---
  const calculateFine = (dueDateString) => {
    const today = new Date()
    const dueDate = new Date(dueDateString)

    // Kalau belum lewat tanggal, denda 0
    if (today <= dueDate) return 0

    // Hitung selisih waktu (dalam milidetik)
    const diffTime = Math.abs(today - dueDate)
    // Konversi ke hari (1 hari = 1000ms * 60detik * 60menit * 24jam)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // Hitung total (Rp 1000 per hari)
    return diffDays * 1000
  }

  const returnBook = async (borrowId, bookId, currentStock) => {
    if (!confirm("Kembalikan buku ini?")) return

    // Ambil user ID saat ini
    const { data: { user } } = await supabase.auth.getUser()

    const { error: deleteError } = await supabase.from('borrowed_books').delete().eq('id', borrowId)
    if (deleteError) { toast.error("Gagal kembalikan"); return }

    const { error: updateError } = await supabase.from('books').update({ stock: currentStock + 1 }).eq('id', bookId)
    
    if (updateError) toast.error("Stok error")
    else {
      toast.success("Buku dikembalikan!")
      
      // KIRIM PESAN
      if (user) {
        sendNotification(user.id, "Buku berhasil dikembalikan. Terima kasih sudah membaca!")
      }
      
      getBorrowedBooks()
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-800 dark:text-white">📖 Buku yang Saya Pinjam</h2>
      
      {loading ? <p className="text-center dark:text-white">Memuat data...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {borrowed.length === 0 ? (
            <p className="col-span-2 text-center text-gray-500 dark:text-gray-400">Tidak ada buku yang sedang dipinjam.</p>
          ) : (
            borrowed.map((item) => {
              const denda = calculateFine(item.due_date)
              const isOverdue = denda > 0

              return (
                <div 
                  key={item.id} 
                  className={`p-6 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center border-l-4 transition hover:shadow-lg gap-4
                    ${isOverdue ? 'bg-red-50 border-red-500 dark:bg-red-900/20' : 'bg-white border-blue-500 dark:bg-gray-800'}
                  `}
                >
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{item.books.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{item.books.author}</p>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      <p>📅 Pinjam: {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                      
                      <p className={`font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        ⏳ Batas: {new Date(item.due_date).toLocaleDateString('id-ID')}
                      </p>

                      {/* TAMPILAN DENDA JIKA ADA */}
                      {isOverdue && (
                        <div className="mt-2 animate-pulse">
                          <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm shadow-sm">
                            💸 Denda: Rp {denda.toLocaleString('id-ID')}
                          </span>
                          <p className="text-xs text-red-500 mt-1 italic">Telat {(denda/1000)} hari</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => returnBook(item.id, item.books.id, item.books.stock)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition w-full sm:w-auto"
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