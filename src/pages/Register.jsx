import { useState } from 'react'
import { supabase } from '../supabaseClient' // Kita panggil "jembatan" yang tadi dibuat

const Register = () => {
  // 1. Ini adalah "Ingatan" (State) untuk menyimpan inputan user
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('') // Untuk pesan sukses/gagal
  const [loading, setLoading] = useState(false) // Untuk status loading

  // 2. Fungsi yang jalan saat tombol "Daftar" diklik
  const handleRegister = async (e) => {
    e.preventDefault() // Mencegah halaman refresh otomatis
    setLoading(true)
    
    // Kirim data ke Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    // Cek hasilnya
    if (error) {
      setMessage('Gagal: ' + error.message)
    } else {
      setMessage('Sukses! Silakan cek email kamu untuk verifikasi.')
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8 max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Daftar Akun Baru</h2>
      
      {/* Tampilkan pesan jika ada */}
      {message && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <form onSubmit={handleRegister} className="bg-white p-6 rounded-lg shadow-md">
        
        {/* Input Email */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Simpan ketikan ke State
            required
          />
        </div>

        {/* Input Password */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input 
            type="password" 
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="******"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Simpan ketikan ke State
            required
          />
        </div>

        {/* Tombol Submit */}
        <button 
          type="submit" 
          disabled={loading} // Matikan tombol kalau lagi loading
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
        >
          {loading ? 'Sedang Memproses...' : 'Daftar Sekarang'}
        </button>

      </form>
    </div>
  )
}

export default Register