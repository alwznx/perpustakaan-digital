import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { FaCrown, FaFire, FaUserAstronaut } from 'react-icons/fa'

const Komunitas = () => {
  const [topUsers, setTopUsers] = useState([])
  const [trendingBooks, setTrendingBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // 1. Panggil Mantra SQL: Top Users
      const { data: users } = await supabase.rpc('get_top_users')
      if (users) setTopUsers(users)

      // 2. Panggil Mantra SQL: Trending Books
      const { data: books } = await supabase.rpc('get_trending_books')
      if (books) setTrendingBooks(books)

      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-blue-800 dark:text-white mb-2">
          🏆 Hall of Fame
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Lihat siapa pembaca paling rajin dan buku apa yang sedang hangat!
        </p>
      </div>

      {loading ? <div className="text-center animate-pulse">Sedang menghitung skor...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* KOLOM KIRI: TOP READER */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-yellow-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 w-20 h-20 rotate-45 translate-x-10 -translate-y-10"></div>
            
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 dark:text-white">
              <FaCrown className="text-yellow-500 text-3xl" /> Top Pembaca
            </h3>

            <div className="space-y-6">
              {topUsers.length === 0 ? <p>Belum ada data.</p> : topUsers.map((user, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl transition hover:scale-105">
                  
                  {/* Ranking Badge */}
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white
                    ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-500' : 'bg-blue-500'}
                  `}>
                    #{idx + 1}
                  </div>

                  {/* Avatar */}
                  {user.avatar_url ? (
                    <img src={user.avatar_url} className="w-12 h-12 rounded-full object-cover border-2 border-white" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">😎</div>
                  )}

                  {/* Nama & Skor */}
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">{user.user_email || 'Hamba Allah'}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Meminjam <span className="font-bold text-blue-600 dark:text-blue-400">{user.total_borrowed}</span> buku</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KOLOM KANAN: TRENDING BOOKS */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-2xl shadow-xl text-white">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FaFire className="text-orange-300 text-3xl animate-bounce" /> Buku Trending
            </h3>

            <div className="space-y-4">
              {trendingBooks.length === 0 ? <p>Belum ada tren.</p> : trendingBooks.map((book, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white/10 p-3 rounded-lg backdrop-blur-sm hover:bg-white/20 transition cursor-pointer">
                  
                  <img 
                    src={book.cover_url || 'https://via.placeholder.com/100'} 
                    className="w-12 h-16 object-cover rounded shadow-md"
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-sm line-clamp-1">{book.title}</h4>
                    <div className="w-full bg-black/20 rounded-full h-2 mt-2 overflow-hidden">
                      <div 
                        className="bg-yellow-400 h-full rounded-full" 
                        style={{ width: `${(book.total_borrowed / trendingBooks[0].total_borrowed) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1 opacity-80">{book.total_borrowed}x Dipinjam</p>
                  </div>

                  <div className="text-2xl font-bold opacity-50">#{idx + 1}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

export default Komunitas