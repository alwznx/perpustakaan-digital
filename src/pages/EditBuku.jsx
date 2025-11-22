import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

const EditBuku = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [stock, setStock] = useState(0)
  const [category, setCategory] = useState('Umum') // <--- STATE
  const [loading, setLoading] = useState(true)

  const adminEmail = "alwznx@gmail.com" // GANTI EMAIL KAMU

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || session.user.email !== adminEmail) {
        toast.error("Akses ditolak!")
        navigate('/')
        return
      }

      const { data, error } = await supabase.from('books').select('*').eq('id', id).single()
      if (error) {
        toast.error("Buku tidak ditemukan!")
        navigate('/')
      } else {
        setTitle(data.title)
        setAuthor(data.author)
        setDescription(data.description)
        setStock(data.stock)
        setCategory(data.category || 'Umum') // <--- AMBIL DATA LAMA
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleUpdate = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('books').update({ 
        title, author, description, 
        stock: parseInt(stock),
        category // <--- UPDATE KATEGORI
      }).eq('id', id)

    if (error) toast.error('Gagal update: ' + error.message)
    else { toast.success('Diperbarui!'); navigate('/') }
  }

  if (loading) return <p className="text-center p-10">Loading...</p>

  return (
    <div className="container mx-auto p-8 max-w-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Edit Data Buku</h2>
      <form onSubmit={handleUpdate} className="bg-white p-6 rounded-lg shadow-md">
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Judul</label>
          <input type="text" className="w-full p-2 border border-gray-300 rounded" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Penulis</label>
          <input type="text" className="w-full p-2 border border-gray-300 rounded" value={author} onChange={(e) => setAuthor(e.target.value)} required />
        </div>

        {/* PILIHAN KATEGORI */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Kategori</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white">
            <option value="Umum">Umum</option>
            <option value="Teknologi">Teknologi</option>
            <option value="Fiksi">Fiksi / Novel</option>
            <option value="Sains">Sains</option>
            <option value="Sejarah">Sejarah</option>
            <option value="Bisnis">Bisnis</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Stok</label>
          <input type="number" min="0" className="w-full p-2 border border-gray-300 rounded" value={stock} onChange={(e) => setStock(e.target.value)} required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Deskripsi</label>
          <textarea className="w-full p-2 border border-gray-300 rounded h-24" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/')} className="flex-1 bg-gray-500 text-white p-2 rounded">Batal</button>
          <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded">Simpan</button>
        </div>
      </form>
    </div>
  )
}

export default EditBuku