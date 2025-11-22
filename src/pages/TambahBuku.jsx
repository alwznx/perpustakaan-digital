import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const TambahBuku = () => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()

  // GANTI EMAIL INI DENGAN EMAIL ADMIN KAMU
  const adminEmail = "tes1@coba.com"

  // SATPAM: Cek saat halaman dibuka
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Kalau tidak login ATAU emailnya bukan admin -> TENDANG KELUAR
      if (!session || session.user.email !== adminEmail) {
        alert("Akses Ditolak! Kamu bukan Admin.")
        navigate('/') // Kembalikan ke Home
      }
    }
    checkAdmin()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('books')
      .insert([{ title, author, description }])

    if (error) {
      alert('Gagal simpan: ' + error.message)
    } else {
      alert('Buku berhasil disimpan!')
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8 max-w-lg">
      <h2 className="text-2xl font-bold mb-6">Tambah Buku Baru</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Judul Buku</label>
          <input type="text" className="w-full p-2 border border-gray-300 rounded" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Penulis</label>
          <input type="text" className="w-full p-2 border border-gray-300 rounded" value={author} onChange={(e) => setAuthor(e.target.value)} required />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Deskripsi Singkat</label>
          <textarea className="w-full p-2 border border-gray-300 rounded h-24" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
          {loading ? 'Menyimpan...' : 'Simpan Buku'}
        </button>
      </form>
    </div>
  )
}

export default TambahBuku