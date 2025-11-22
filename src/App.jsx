import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast' // Notifikasi Cantik

// Import Semua Halaman
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import TambahBuku from './pages/TambahBuku'
import BukuSaya from './pages/BukuSaya'
import EditBuku from './pages/EditBuku'
import DetailBuku from './pages/DetailBuku'
import DashboardAdmin from './pages/DashboardAdmin' // <--- IMPORT MENU FINAL BOSS

function App() {
  const [session, setSession] = useState(null)
  
  // GANTI EMAIL INI DENGAN EMAIL ADMIN KAMU
  const adminEmail = "alwznx@gmail.com" 

  useEffect(() => {
    // Cek sesi saat ini
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    // Dengarkan perubahan sesi (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <BrowserRouter>
      {/* Wadah Notifikasi (Toast) */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="min-h-screen flex flex-col font-sans">
        
        {/* NAVBAR */}
        <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold tracking-tight hover:text-blue-100 flex items-center gap-2">
              📚 Perpustakaan Digital
            </Link>
            
            <div className="flex gap-4 items-center">
              <Link to="/" className="hover:text-blue-200 font-medium">Home</Link>
              
              {session ? (
                <>
                  {/* MENU KHUSUS ADMIN */}
                  {session.user.email === adminEmail && (
                    <>
                      <Link to="/admin" className="hover:text-blue-200 font-bold text-green-300">
                        📊 Dashboard
                      </Link>
                      <Link to="/tambah" className="hover:text-blue-200 font-bold text-yellow-300">
                        + Tambah
                      </Link> 
                    </>
                  )}

                  {/* MENU MEMBER */}
                  <Link to="/buku-saya" className="hover:text-blue-200 font-medium">
                    Buku Saya
                  </Link> 
                  
                  {/* INFO USER */}
                  <div className="hidden md:block text-sm bg-blue-700 px-3 py-1 rounded-full border border-blue-500">
                    {session.user.email}
                  </div>
                  
                  <button 
                    onClick={handleLogout} 
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-medium transition shadow"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* MENU TAMU */}
                  <Link to="/login" className="hover:text-blue-200 font-medium">Login</Link>
                  <Link to="/register" className="bg-white text-blue-600 px-3 py-1 rounded font-medium hover:bg-gray-100 transition">Register</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* KONTEN UTAMA */}
        <main className="flex-grow bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Halaman Khusus (Butuh Login/Admin) */}
            <Route path="/tambah" element={<TambahBuku />} />
            <Route path="/buku-saya" element={<BukuSaya />} />
            <Route path="/edit/:id" element={<EditBuku />} />
            <Route path="/admin" element={<DashboardAdmin />} /> {/* <--- RUTE FINAL BOSS */}
            
            {/* Halaman Detail */}
            <Route path="/buku/:id" element={<DetailBuku />} />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer className="bg-white border-t p-6 text-center text-gray-500 text-sm">
          <p>&copy; 2025 Perpustakaan Digital Mahasiswa. Built with React & Supabase.</p>
        </footer>

      </div>
    </BrowserRouter>
  )
}

export default App