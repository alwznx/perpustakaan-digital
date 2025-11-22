import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const DashboardAdmin = () => {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const adminEmail = "alwznx@gmail.com" // GANTI EMAIL KAMU

  useEffect(() => {
    const fetchData = async () => {
      // 1. Cek apakah Admin?
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || session.user.email !== adminEmail) {
        toast.error("Area Terlarang!")
        navigate('/')
        return
      }

      // 2. Ambil SEMUA data peminjaman
      const { data, error } = await supabase
        .from('borrowed_books')
        .select('*, books(title)') // Ambil juga Judul Buku
        .order('due_date', { ascending: true }) // Urutkan dari yang paling mendesak

      if (error) toast.error(error.message)
      else setLoans(data)
      setLoading(false)
    }

    fetchData()
  }, [])

  // Fungsi Paksa Kembali (Admin override)
  const forceReturn = async (loanId, bookId) => {
    if (!confirm("Paksa kembalikan buku ini?")) return

    // 1. Ambil stok buku saat ini dulu
    const { data: bookData } = await supabase.from('books').select('stock').eq('id', bookId).single()
    
    // 2. Hapus data pinjam
    await supabase.from('borrowed_books').delete().eq('id', loanId)
    
    // 3. Balikin stok (+1)
    await supabase.from('books').update({ stock: bookData.stock + 1 }).eq('id', bookId)
    
    toast.success("Buku berhasil ditarik paksa!")
    
    // Refresh halaman manual biar cepat
    window.location.reload() 
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">📊 Dashboard Admin</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
        <h3 className="text-xl font-bold mb-4 text-blue-600">Daftar Peminjaman Aktif</h3>
        
        {loading ? <p>Memuat data...</p> : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-b border-gray-200">
                <th className="p-3">Peminjam (Email)</th>
                <th className="p-3">Buku</th>
                <th className="p-3">Tgl Pinjam</th>
                <th className="p-3">Jatuh Tempo</th>
                <th className="p-3">Status</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-gray-500">Tidak ada peminjaman aktif.</td></tr>
              ) : (
                loans.map((item) => {
                  const isOverdue = new Date() > new Date(item.due_date)
                  return (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-700">
                        {item.user_email || <span className="text-gray-400 italic">Data Lama (No Email)</span>}
                      </td>
                      <td className="p-3">{item.books?.title}</td>
                      <td className="p-3 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="p-3 font-bold">
                        {new Date(item.due_date).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {isOverdue ? (
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">TERLAMBAT</span>
                        ) : (
                          <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold">AMAN</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => forceReturn(item.id, item.book_id)}
                          className="text-red-500 hover:text-red-700 text-sm underline"
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