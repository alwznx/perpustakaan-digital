import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { FaHeart, FaUserCircle, FaSun, FaMoon, FaBars, FaTimes, FaUsers, FaBell } from 'react-icons/fa'
import { AnimatePresence } from 'framer-motion'

// Import Semua Halaman
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
import NotFound from './pages/NotFound'
import Komunitas from './pages/Komunitas'
import Notifikasi from './pages/Notifikasi' 

const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

const AnimatedRoutes = () => {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
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
        <Route path="/komunitas" element={<Komunitas />} />
        <Route path="/notifikasi" element={<Notifikasi />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0) 

  const adminEmail = "alwznx@gmail.com"

  useEffect(() => {
    if (darkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark') }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light') }
  }, [darkMode])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
        fetchUnreadCount(session.user.id)
      }
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
        fetchUnreadCount(session.user.id)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('avatar_url').eq('id', userId).single()
    if (data) setAvatarUrl(data.avatar_url)
  }

  // Hitung pesan yang belum dibaca
  const fetchUnreadCount = async (userId) => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    setUnreadCount(count || 0)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); setAvatarUrl(null); setUnreadCount(0) }

  const NavItem = ({ to, children, specialClass = "" }) => (
    <Link to={to} onClick={() => setIsMobileMenuOpen(false)} className={`hover:text-blue-200 font-medium block py-2 md:py-0 ${specialClass}`}>
      {children}
    </Link>
  )

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-center" reverseOrder={false} />

      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        
        <nav className="bg-blue-600 dark:bg-gray-800 text-white p-4 shadow-md sticky top-0 z-50 transition-colors duration-300">
          <div className="container mx-auto">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-2xl font-bold tracking-tight hover:text-blue-100 flex items-center gap-2">
                📚 <span className="inline">Perpus<span className="hidden sm:inline">takaan</span> Digital</span>
              </Link>
              
              <div className="flex items-center gap-4">
                <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition">
                  {darkMode ? <FaSun className="text-yellow-300" /> : <FaMoon className="text-white" />}
                </button>

                {/* ICON LONCENG NOTIFIKASI (Mobile & Desktop) */}
                {session && (
                  <Link to="/notifikasi" className="relative p-2 hover:text-blue-200 transition">
                    <FaBell className="text-xl" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                <button className="md:hidden text-2xl focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>

                <div className="hidden md:flex items-center gap-6">
                   <Link to="/" className="hover:text-blue-200 font-medium">Home</Link>
                   
                   {session ? (
                    <>
                      {session.user.email === adminEmail && (
                        <>
                          <Link to="/admin" className="hover:text-blue-200 font-bold text-green-300">Dash</Link>
                          <Link to="/tambah" className="hover:text-blue-200 font-bold text-yellow-300">+Add</Link> 
                        </>
                      )}
                      
                      <Link to="/komunitas" className="text-yellow-300 hover:text-yellow-100 text-xl" title="Komunitas"><FaUsers /></Link>
                      <Link to="/favorit" className="text-pink-300 hover:text-pink-100 text-xl" title="Favorit Saya"><FaHeart /></Link>
                      <Link to="/buku-saya" className="hover:text-blue-200 font-medium">Pinjaman</Link> 
                      
                      <Link to="/profil" className="flex items-center gap-2 hover:opacity-80 transition">
                        {avatarUrl ? <img src={avatarUrl} alt="Profil" className="w-8 h-8 rounded-full object-cover border-2 border-white" /> : <FaUserCircle className="text-2xl" />}
                      </Link>
                      
                      <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-medium transition shadow">Keluar</button>
                    </>
                   ) : (
                    <>
                      <Link to="/login" className="hover:text-blue-200 font-medium">Login</Link>
                      <Link to="/register" className="bg-white text-blue-600 px-3 py-1 rounded font-medium hover:bg-gray-100 transition">Daftar</Link>
                    </>
                   )}
                </div>
              </div>
            </div>

            {isMobileMenuOpen && (
              <div className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4 flex flex-col space-y-2 animate-fade-in-down">
                 <NavItem to="/">🏠 Home</NavItem>
                 {session ? (
                  <>
                    <NavItem to="/notifikasi" specialClass="text-yellow-300">🔔 Notifikasi ({unreadCount})</NavItem>
                    <NavItem to="/komunitas">🏆 Komunitas</NavItem>
                    <NavItem to="/favorit">❤️ Favorit</NavItem>
                    <NavItem to="/buku-saya">📖 Pinjaman</NavItem>
                    <NavItem to="/profil">👤 Profil</NavItem>
                    {session.user.email === adminEmail && <NavItem to="/admin" specialClass="text-green-300">📊 Dashboard Admin</NavItem>}
                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false) }} className="bg-red-500 text-white py-2 rounded text-left px-4 font-medium mt-2">Keluar</button>
                  </>
                 ) : (
                  <>
                    <NavItem to="/login">🔑 Login</NavItem>
                    <NavItem to="/register">📝 Daftar Akun</NavItem>
                  </>
                 )}
              </div>
            )}
          </div>
        </nav>

        <main className="flex-grow">
           <AnimatedRoutes />
        </main>

        <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-6 text-center text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
          <p>&copy; 2025 Perpustakaan Digital Mahasiswa.</p>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App