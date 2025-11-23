import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import * as XLSX from 'xlsx'
import { FaFileExcel } from 'react-icons/fa'

const DashboardAdmin = () => {
  const [loans, setLoans] = useState([])
  const [stats, setStats] = useState([])
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

      // Ambil Data Peminjaman
      const { data: loanData, error: loanError } = await supabase
        .from('borrowed_books')
        .select('*, books(title, stock)')
        .order('due_date', { ascending: true })

      if (loanError) toast.error(loanError.message)
      else setLoans(loanData)

      // Statistik
      const { data: booksData } = await supabase.from('books').select('category')
      if (booksData) {
        const categoryCount = {}
        booksData.forEach(book => {
          const cat = book.category || 'Umum'
          categoryCount[cat] = (categoryCount[cat] || 0) + 1
        })
        const chartData = Object.keys(categoryCount).map(key => ({
          name: key, value: categoryCount[key]
        }))
        setStats(chartData)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const forceReturn = async (loanId, bookId, currentStock) => {
    if (!confirm("Yakin mau tarik paksa buku ini?")) return
    const { error: deleteError } = await supabase.from('borrowed_books').delete().eq('id', loanId)
    if (deleteError) { toast.error("Gagal!"); return }
    await supabase.from('books').update({ stock: currentStock + 1 }).eq('id', bookId)
    toast.success("Buku ditarik!")
    window.location.reload()
  }

  const handleExport = () => {
    const dataToExport = loans.map(item => ({
      'Email Peminjam': item.user_email || 'Tanpa Email',
      'Judul Buku': item.books?.title,
      'Tanggal Pinjam': new Date(item.created_at).toLocaleDateString('id-ID'),
      'Jatuh Tempo': new Date(item.due_date).toLocaleDateString('id-ID'),
      'Status': new Date() > new Date(item.due_date) ? 'TERLAMBAT' : 'AMAN'
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Peminjaman")
    XLSX.writeFile(workbook, "Laporan_Perpustakaan.xlsx")
    toast.success("Laporan berhasil didownload!")
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">📊 Dashboard Admin</h2>
        <button 
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-lg"
        >
          <FaFileExcel /> Download Laporan
        </button>
      </div>
      
      {/* GRAFIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        
        {/* KARTU RINGKASAN */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-blue-100 dark:border-gray-700 flex flex-col justify-center items-center transition-colors">
          <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-2">Total Peminjaman Aktif</h3>
          <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">{loans.length}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Buku sedang berada di luar</p>
        </div>

        {/* GRAFIK BATANG KATEGORI */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-64 transition-colors">
          <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-4">Distribusi Koleksi Buku</h3>
          <ResponsiveContainer width="100%" height="100%">
            {/* NOTE: Karena Recharts tidak support Tailwind CSS di dalam grafiknya, 
            kita harus menggunakan prop `stroke` pada XAxis dan YAxis untuk mengubah warna teks. */}
            <BarChart data={stats}>
              <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#9ca3af" /> 
              <YAxis allowDecimals={false} stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', color: '#f9fafb' }} />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                {stats.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABEL PEMINJAMAN */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg overflow-x-auto border border-gray-100 dark:border-gray-700 transition-colors">
        <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400 flex items-center gap-2">
          Daftar Peminjam
          <span className="text-sm bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-1 rounded-full">{loans.length}</span>
        </h3>
        
        {loading ? <p className="text-center py-4 dark:text-gray-300">Memuat data...</p> : (
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                <th className="p-4 font-semibold">Peminjam</th>
                <th className="p-4 font-semibold">Judul Buku</th>
                <th className="p-4 font-semibold">Jatuh Tempo</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loans.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">Tidak ada peminjaman aktif.</td></tr>
              ) : (
                loans.map((item) => {
                  const isOverdue = new Date() > new Date(item.due_date)
                  return (
                    <tr key={item.id} className="hover:bg-blue-50 dark:hover:bg-gray-700/50 transition">
                      
                      <td className="p-4 font-medium text-gray-700 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xs">
                            {item.user_email ? item.user_email[0].toUpperCase() : '?'}
                          </div>
                          <span className="text-gray-700 dark:text-white text-sm">
                            {item.user_email || <span className="text-gray-400 italic">Tanpa Email</span>}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4 text-gray-600 dark:text-gray-300">{item.books?.title}</td>
                      <td className="p-4 font-medium text-gray-700 dark:text-gray-300">{new Date(item.due_date).toLocaleDateString('id-ID')}</td>
                      <td className="p-4">
                        {isOverdue ? <span className="bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300 px-3 py-1 rounded-full text-xs font-bold animate-pulse">TERLAMBAT</span> : <span className="bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold">AMAN</span>}
                      </td>
                      <td className="p-4">
                        <button onClick={() => forceReturn(item.id, item.book_id, item.books.stock)} className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs font-bold shadow transition">Tarik</button>
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