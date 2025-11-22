import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const TambahBuku = () => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [stock, setStock] = useState(1)
  const [category, setCategory] = useState('Umum') // <--- STATE BARU
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const adminEmail = "alwznx@gmail.com" // GANTI EMAIL KAMU

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || session.user.email !== adminEmail) {
        toast.error("Akses Ditolak!")
        navigate('/')
      }
    }
    checkAdmin()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    let imageUrl = null

    if (image) {
      const fileName = `${Date.now()}-${image.name}`
      const { error: uploadError } = await supabase.storage.from('covers').upload(fileName, image)
      if (uploadError) { toast.error("Gagal upload"); setLoading(false); return }
      const { data } = supabase.storage.from('covers').getPublicUrl(fileName)
      imageUrl = data.publicUrl
    }

    const { error } = await supabase.from('books').insert([{ 
      title, author, description, image_url: imageUrl, 
      stock: parseInt(stock),
      category: category // <--- SIMPAN KATEGORI
    }])

    if (error) toast.error('Gagal simpan: ' + error.message)
    else { toast.success('Buku disimpan!'); navigate('/') }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8 max-w-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Tambah Buku</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        
        {/* ... Input Gambar (sama seperti sebelumnya) ... */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Sampul</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="w-full p-2 border border-gray-300 rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Judul</label>
          <input type="text" className="w-full p-2 border border-gray-300 rounded" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Penulis</label>
          <input type="text" className="w-full p-2 border border-gray-300 rounded" value={author} onChange={(e) => setAuthor(e.target.value)} required />
        </div>

        {/* INPUT KATEGORI BARU */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Kategori</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-white"
          >
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
          <input type="number" min="1" className="w-full p-2 border border-gray-300 rounded" value={stock} onChange={(e) => setStock(e.target.value)} required />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Deskripsi</label>
          <textarea className="w-full p-2 border border-gray-300 rounded h-24" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
          Simpan
        </button>
      </form>
    </div>
  )
}

export default TambahBuku