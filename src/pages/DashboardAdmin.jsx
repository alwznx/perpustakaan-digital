import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import * as XLSX from 'xlsx' // <--- 1. IMPORT LIBRARY EXCEL
import { FaFileExcel } from 'react-icons/fa' // Import Ikon Excel

const DashboardAdmin = () => {
  const [loans, setLoans] = useState([])
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const adminEmail = "alwznx@gmail.com" // GANTI EMAIL KAMU

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
    const { error } = await supabase.from('borrowed_books').delete().eq('id', loanId)
    if (error) { toast.error("Gagal!"); return }
    await supabase.from('books').update({ stock: currentStock + 1 }).eq('id', bookId)
    toast.success("Buku ditarik!")
    window.location.reload()
  }

  // --- 2. FUNGSI DOWNLOAD EXCEL ---
  const handleExport = () => {
    // Siapkan data yang mau di-print (Format rapi)
    const dataToExport = loans.map(item => ({
      'Email Peminjam': item.user_email || 'Tanpa Email',
      'Judul Buku': item.books?.title,
      'Tanggal Pinjam': new Date(item.created_at).toLocaleDateString('id-ID'),
      'Jatuh Tempo': new Date(item.due_date).toLocaleDateString('id-ID'),
      'Status': new Date() > new Date(item.due_date) ? 'TERLAMBAT' : 'AMAN'
    }))

    // Buat Worksheet (Lembar Kerja)
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    // Buat Workbook (Buku Excel)
    const workbook = XLSX.utils.book_new()
    // Tempel lembar ke buku
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Peminjaman")
    
    // Download file
    XLSX.writeFile(workbook, "Laporan_Perpustakaan.xlsx")
    toast.success("Laporan berhasil didownload!")
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-800">📊 Dashboard Admin</h2>
        
        {/* TOMBOL DOWNLOAD */}
        <button 
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-lg"
        >
          <FaFileExcel /> Download Laporan
        </button>
      </div>
      
      {/* GRAFIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 flex flex-col justify-center items-center">
          <h3 className="text-lg font-bold text-gray-500 mb-2">Total Peminjaman Aktif</h3>
          <p className="text-5xl font-bold text-blue-600">{loans.length}</p>
          <p className="text-sm text-gray-400 mt-2">Buku sedang berada di luar</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-64">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Distribusi Koleksi</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats}>
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                {stats.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABEL */}
      <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto border border-gray-100">
        <h3 className="text-xl font-bold mb-4 text-blue-600">Daftar Peminjam</h3>
        {loading ? <p className="text-center">Memuat...</p> : (
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm uppercase border-b">
                <th className="p-4">Peminjam</th>
                <th className="p-4">Buku</th>
                <th className="p-4">Tgl Pinjam</th>
                <th className="p-4">Jatuh Tempo</th>
                <th className="p-4">Status</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50 border-b border-gray-50">
                  <td className="p-4">{item.user_email || 'No Email'}</td>
                  <td className="p-4">{item.books?.title}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4">{new Date(item.due_date).toLocaleDateString('id-ID')}</td>
                  <td className="p-4">
                    {new Date() > new Date(item.due_date) ? <span className="text-red-600 font-bold bg-red-100 px-2 py-1 rounded text-xs">TERLAMBAT</span> : <span className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded text-xs">AMAN</span>}
                  </td>
                  <td className="p-4">
                    <button onClick={() => forceReturn(item.id, item.book_id, item.books.stock)} className="text-red-500 underline text-sm">Tarik</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default DashboardAdmin