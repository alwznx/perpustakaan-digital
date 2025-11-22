import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const DashboardAdmin = () => {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  
  // GANTI DENGAN EMAIL ADMIN KAMU
  const adminEmail = "alwznx@gmail.com" 

  useEffect(() => {
    const fetchData = async () => {
      // 1. Cek apakah yang akses benar-benar Admin?
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session || session.user.email !== adminEmail) {
        toast.error("Eits, ini area terlarang!")
        navigate('/') // Kalau bukan admin, tendang ke Home
        return
      }

      // 2. Ambil SEMUA data peminjaman + Info Bukunya
      const { data, error } = await supabase
        .from('borrowed_books')
        .select('*, books(title, stock)') // Kita ambil Judul & Stok buku terkini
        .order('due_date', { ascending: true }) // Urutkan yang paling mepet deadline

      if (error) {
        toast.error(error.message)
      } else {
        setLoans(data)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  // FUNGSI TARIK BUKU (Admin Power)
  const forceReturn = async (loanId, bookId, currentStock) => {
    if (!confirm("Yakin mau tarik paksa buku ini dari member?")) return

    // 1. Hapus data pinjam dari tabel borrowed_books
    const { error: deleteError } = await supabase
      .from('borrowed_books')
      .delete()
      .eq('id', loanId)

    if (deleteError) {
      toast.error("Gagal menarik buku!")
      return
    }
    
    // 2. Kembalikan Stok Buku (+1)
    await supabase
      .from('books')
      .update({ stock: currentStock + 1 })
      .eq('id', bookId)
    
    toast.success("Buku berhasil ditarik paksa!")
    
    // Refresh halaman otomatis biar datanya hilang dari tabel
    window.location.reload() 
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
        📊 Dashboard Admin
      </h2>
      
      <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto border border-gray-100">
        <h3 className="text-xl font-bold mb-4 text-blue-600 flex items-center gap-2">
          Daftar Buku Sedang Dipinjam
          <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{loans.length}</span>
        </h3>
        
        {loading ? <p className="text-center py-4">Memuat data...</p> : (
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold">Peminjam</th>
                <th className="p-4 font-semibold">Judul Buku</th>
                <th className="p-4 font-semibold">Tgl Pinjam</th>
                <th className="p-4 font-semibold">Jatuh Tempo</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400 italic">
                    Belum ada yang meminjam buku. Sepi nih...
                  </td>
                </tr>
              ) : (
                loans.map((item) => {
                  const isOverdue = new Date() > new Date(item.due_date)
                  return (
                    <tr key={item.id} className="hover:bg-blue-50 transition">
                      {/* Email Peminjam */}
                      <td className="p-4 font-medium text-gray-700">
                        {item.user_email || <span className="text-gray-400 italic text-sm">Tanpa Email</span>}
                      </td>
                      
                      {/* Judul Buku */}
                      <td className="p-4 text-gray-600">{item.books?.title}</td>
                      
                      {/* Tanggal Pinjam */}
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </td>
                      
                      {/* Tanggal Jatuh Tempo */}
                      <td className="p-4 font-medium">
                        {new Date(item.due_date).toLocaleDateString('id-ID')}
                      </td>
                      
                      {/* Status Terlambat/Aman */}
                      <td className="p-4">
                        {isOverdue ? (
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                            TERLAMBAT
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold">
                            AMAN
                          </span>
                        )}
                      </td>
                      
                      {/* Tombol Aksi */}
                      <td className="p-4">
                        <button 
                          onClick={() => forceReturn(item.id, item.book_id, item.books.stock)}
                          className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs font-bold shadow transition"
                          title="Ambil paksa buku ini dan kembalikan stok"
                        >
                          Tarik Buku
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default DashboardAdmin