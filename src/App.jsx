import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

// Import halaman-halaman
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import TambahBuku from './pages/TambahBuku' // <--- INI BARU

function App() {
  const [session, setSession] = useState(null)

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
    alert('Berhasil Logout!')
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        
        <nav className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Perpustakaan Digital</h1>
            
            <div className="flex gap-4 items-center">
              <Link to="/" className="hover:text-blue-200">Home</Link>
              
              {session ? (
                <>
                  {/* Link Tambah Buku hanya muncul kalau login */}
                  <Link to="/tambah" className="hover:text-blue-200">Tambah Buku</Link> 
                  
                  <span className="text-sm bg-blue-700 px-3 py-1 rounded">
                    {session.user.email}
                  </span>
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-blue-200">Login</Link>
                  <Link to="/register" className="hover:text-blue-200">Register</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="flex-grow bg-gray-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/tambah" element={<TambahBuku />} /> {/* <--- RUTE BARU */}
          </Routes>
        </main>

        <footer className="bg-gray-900 text-white p-4 text-center">
          <p className="text-sm">&copy; 2025 Perpustakaan Digital Mahasiswa</p>
        </footer>

      </div>
    </BrowserRouter>
  )
}

export default App