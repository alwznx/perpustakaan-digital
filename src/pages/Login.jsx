import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom' // Alat untuk pindah halaman

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate() // Siapkan alat navigasinya

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Kirim data login ke Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      setMessage('Gagal Login: ' + error.message)
    } else {
      // Kalau sukses:
      // 1. Tampilkan pesan sebentar (opsional)
      // 2. Pindahkan ke halaman Home ('/')
      navigate('/') 
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8 max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Masuk ke Akun</h2>

      {message && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            className="w-full p-2 border border-gray-300 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input 
            type="password" 
            className="w-full p-2 border border-gray-300 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Sedang Masuk...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default Login