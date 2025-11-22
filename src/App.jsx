import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast' // <--- 1. IMPORT TOASTER

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import TambahBuku from './pages/TambahBuku'
import BukuSaya from './pages/BukuSaya'

function App() {
  const [session, setSession] = useState(null)
  
  // GANTI EMAIL INI DENGAN EMAIL ADMIN KAMU
  const adminEmail = "alwznx@gmail.com" 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Kita tidak pakai alert lagi nanti, tapi untuk logout biarkan dulu
  }

  return (
    <BrowserRouter>
      {/* 2. PASANG TOASTER DI SINI (Posisi di atas tengah) */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="min-h-screen flex flex-col font-sans">
        
        <nav className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Perpustakaan Digital</h1>
            
            <div className="flex gap-4 items-center">
              <Link to="/" className="hover:text-blue-200 font-medium">Home</Link>
              
              {session ? (
                <>
                  {session.user.email === adminEmail && (
                    <Link to="/tambah" className="hover:text-blue-200 font-semibold text-yellow-300">
                      + Tambah Buku
                    </Link> 
                  )}

                  <Link to="/buku-saya" className="hover:text-blue-200 font-medium">
                    Buku Saya
                  </Link> 
                  
                  <div className="hidden md:block text-sm bg-blue-700 px-3 py-1 rounded-full">
                    {session.user.email}
                  </div>
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-medium transition">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-blue-200 font-medium">Login</Link>
                  <Link to="/register" className="hover:text-blue-200 font-medium">Register</Link>
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
          </Routes>
        </main>

        <footer className="bg-white border-t p-6 text-center text-gray-500 text-sm">
          <p>&copy; 2025 Perpustakaan Digital Mahasiswa. Built with React & Supabase.</p>
        </footer>

      </div>
    </BrowserRouter>
  )
}

export default App