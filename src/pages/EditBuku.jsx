import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom' // useParams untuk ambil ID dari URL
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

const EditBuku = () => {
  const { id } = useParams() // Ambil angka ID dari alamat URL
  const navigate = useNavigate()
  
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)

  // GANTI DENGAN EMAIL ADMIN KAMU
  const adminEmail = "alwznx@gmail.com"

  useEffect(() => {
    // 1. Cek Admin & Ambil Data Buku Lama
    const fetchData = async () => {
      // Cek sesi login
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || session.user.email !== adminEmail) {
        toast.error("Akses ditolak!")
        navigate('/')
        return
      }

      // Ambil data buku berdasarkan ID
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single() // Ambil satu saja

      if (error) {
        toast.error("Buku tidak ditemukan!")
        navigate('/')
      } else {
        // Isi formulir dengan data lama
        setTitle(data.title)
        setAuthor(data.author)
        setDescription(data.description)
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleUpdate = async (e) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('books')
      .update({ // Perintah UPDATE
        title: title, 
        author: author, 
        description: description 
      })
      .eq('id', id) // Kunci: Hanya update yang ID-nya cocok

    if (error) {
      toast.error('Gagal update: ' + error.message)
    } else {
      toast.success('Buku berhasil diperbarui!')
      navigate('/')
    }
  }

  if (loading) return <p className="text-center p-10">Mengambil data buku...</p>

  return (
    <div className="container mx-auto p-8 max-w-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Edit Data Buku</h2>

      <form onSubmit={handleUpdate} className="bg-white p-6 rounded-lg shadow-md">
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Judul Buku</label>
          <input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Penulis</label>
          <input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Deskripsi Singkat</label>
          <textarea 
            className="w-full p-2 border border-gray-300 rounded h-24 focus:ring-2 focus:ring-blue-500 outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition"
          >
            Batal
          </button>
          <button 
            type="submit" 
            className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Simpan Perubahan
          </button>
        </div>

      </form>
    </div>
  )
}

export default EditBuku