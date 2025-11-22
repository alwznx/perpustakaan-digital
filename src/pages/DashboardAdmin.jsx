import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts' // Import Grafik

const DashboardAdmin = () => {
  const [loans, setLoans] = useState([])
  const [stats, setStats] = useState([]) // Data untuk Grafik
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  
  // GANTI DENGAN EMAIL ADMIN KAMU
  const adminEmail = "alwznx@gmail.com" 

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session || session.user.email !== adminEmail) {
        toast.error("Eits, ini area terlarang!")
        navigate('/')
        return
      }

      // 1. AMBIL DATA PEMINJAMAN
      const { data: loanData, error: loanError } = await supabase
        .from('borrowed_books')
        .select('*, books(title, stock)')
        .order('due_date', { ascending: true })

      if (loanError) toast.error(loanError.message)
      else setLoans(loanData)

      // 2. AMBIL DATA BUKU UNTUK STATISTIK
      const { data: booksData } = await supabase.from('books').select('category')
      
      if (booksData) {
        // Hitung jumlah buku per kategori
        const categoryCount = {}
        booksData.forEach(book => {
          const cat = book.category || 'Umum'
          categoryCount[cat] = (categoryCount[cat] || 0) + 1
        })

        // Ubah format jadi Array biar bisa dibaca Grafik
        // Contoh: [{ name: 'Teknologi', value: 5 }, { name: 'Fiksi', value: 3 }]
        const chartData = Object.keys(categoryCount).map(key => ({
          name: key,
          value: categoryCount[key]
        }))
        
        setStats(chartData)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const forceReturn = async (loanId, bookId, currentStock) => {
    if (!confirm("Yakin mau tarik paksa buku ini dari member?")) return
    const { error: deleteError } = await supabase.from('borrowed_books').delete().eq('id', loanId)
    if (deleteError) { toast.error("Gagal menarik buku!"); return }
    await supabase.from('books').update({ stock: currentStock + 1 }).eq('id', bookId)
    toast.success("Buku berhasil ditarik paksa!")
    window.location.reload() 
  }

  // Warna-warni untuk grafik
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
        📊 Dashboard Admin
      </h2>
      
      {/* BAGIAN GRAFIK STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        
        {/* KARTU RINGKASAN */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 flex flex-col justify-center items-center">
          <h3 className="text-lg font-bold text-gray-500 mb-2">Total Peminjaman Aktif</h3>
          <p className="text-5xl font-bold text-blue-600">{loans.length}</p>
          <p className="text-sm text-gray-400 mt-2">Buku sedang berada di luar</p>
        </div>

        {/* GRAFIK BATANG KATEGORI */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-64">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Distribusi Koleksi Buku</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats}>
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                {stats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABEL PEMINJAMAN (YANG LAMA) */}
      <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto border border-gray-100">
        <h3 className="text-xl font-bold mb-4 text-blue-600 flex items-center gap-2">
          Daftar Peminjam
          <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{loans.length}</span>
        </h3>
        
        {loading ? <p className="text-center py-4">Memuat data...</p> : (
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold">Peminjam</th>
                <th className="p-4 font-semibold">Judul Buku</th>
                <th className="p-4 font-semibold">Jatuh Tempo</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">Belum ada yang meminjam buku.</td></tr>
              ) : (
                loans.map((item) => {
                  const isOverdue = new Date() > new Date(item.due_date)
                  return (
                    <tr key={item.id} className="hover:bg-blue-50 transition">
                      <td className="p-4 font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                            {item.user_email ? item.user_email[0].toUpperCase() : '?'}
                          </div>
                          {item.user_email || <span className="text-gray-400 italic text-sm">Tanpa Email</span>}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{item.books?.title}</td>
                      <td className="p-4 font-medium">{new Date(item.due_date).toLocaleDateString('id-ID')}</td>
                      <td className="p-4">
                        {isOverdue ? <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">TERLAMBAT</span> : <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold">AMAN</span>}
                      </td>
                      <td className="p-4">
                        <button onClick={() => forceReturn(item.id, item.book_id, item.books.stock)} className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs font-bold shadow transition">Tarik Buku</button>
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