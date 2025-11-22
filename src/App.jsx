import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient' // <--- SUDAH DIPERBAIKI (Titiknya satu)
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { FaHeart, FaUserCircle } from 'react-icons/fa' 

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import TambahBuku from './pages/TambahBuku'
import BukuSaya from './pages/BukuSaya'
import EditBuku from './pages/EditBuku'
import DetailBuku from './pages/DetailBuku'
import DashboardAdmin from './pages/DashboardAdmin'
import FavoritSaya from './pages/FavoritSaya'
import ProfilSaya from './pages/ProfilSaya'

function App() {
  const [session, setSession] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null)
  
  // GANTI EMAIL INI DENGAN EMAIL ADMIN KAMU
  const adminEmail = "alwznx@gmail.com" 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()
    
    if (data) setAvatarUrl(data.avatar_url)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); setAvatarUrl(null) }

  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="min-h-screen flex flex-col font-sans">
        <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold tracking-tight hover:text-blue-100 flex items-center gap-2">
              📚 Perpustakaan Digital
            </Link>
            
            <div className="flex gap-4 items-center">
              <Link to="/" className="hover:text-blue-200 font-medium">Home</Link>
              
              {session ? (
                <>
                  {session.user.email === adminEmail && (
                    <>
                      <Link to="/admin" className="hover:text-blue-200 font-bold text-green-300">📊 Dashboard</Link>
                      <Link to="/tambah" className="hover:text-blue-200 font-bold text-yellow-300">+ Tambah</Link> 
                    </>
                  )}

                  <Link to="/favorit" className="text-pink-300 hover:text-pink-100 text-xl" title="Favorit Saya"><FaHeart /></Link>
                  <Link to="/buku-saya" className="hover:text-blue-200 font-medium">Buku Saya</Link> 
                  
                  <Link to="/profil" className="flex items-center gap-2 hover:opacity-80 transition">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profil" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                    ) : (
                      <FaUserCircle className="text-2xl" />
                    )}
                  </Link>
                  
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-medium transition shadow">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-blue-200 font-medium">Login</Link>
                  <Link to="/register" className="bg-white text-blue-600 px-3 py-1 rounded font-medium hover:bg-gray-100 transition">Register</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="flex-grow bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/tambah" element={<TambahBuku />} />
            <Route path="/buku-saya" element={<BukuSaya />} />
            <Route path="/edit/:id" element={<EditBuku />} />
            <Route path="/admin" element={<DashboardAdmin />} />
            <Route path="/buku/:id" element={<DetailBuku />} />
            <Route path="/favorit" element={<FavoritSaya />} />
            <Route path="/profil" element={<ProfilSaya />} />
          </Routes>
        </main>

        <footer className="bg-white border-t p-6 text-center text-gray-500 text-sm">
          <p>&copy; 2025 Perpustakaan Digital Mahasiswa.</p>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App