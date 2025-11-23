import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { FaBell, FaCheckDouble, FaTrash } from 'react-icons/fa'
import toast from 'react-hot-toast'

const Notifikasi = () => {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifs()
  }, [])

  const fetchNotifs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) // Pesan baru di atas
      setNotifs(data || [])
    }
    setLoading(false)
  }

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    fetchNotifs()
  }

  const deleteNotif = async (id) => {
    await supabase.from('notifications').delete().eq('id', id)
    toast.success("Pesan dihapus")
    fetchNotifs()
  }

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
    toast.success("Semua ditandai sudah dibaca")
    fetchNotifs()
  }

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FaBell className="text-yellow-500" /> Kotak Masuk
        </h2>
        {notifs.length > 0 && (
          <button onClick={markAllRead} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <FaCheckDouble /> Tandai semua dibaca
          </button>
        )}
      </div>

      {loading ? <p className="text-center dark:text-gray-300">Memuat pesan...</p> : (
        <div className="space-y-4">
          {notifs.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p>Tidak ada notifikasi baru.</p>
            </div>
          ) : (
            notifs.map((item) => (
              <div 
                key={item.id} 
                onClick={() => markAsRead(item.id)}
                className={`p-4 rounded-xl border transition cursor-pointer relative group
                  ${item.is_read 
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400' 
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-gray-800 dark:text-gray-200 shadow-sm'
                  }
                `}
              >
                {/* Titik Merah kalau belum dibaca */}
                {!item.is_read && (
                  <span className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                )}

                <p className="pr-8">{item.message}</p>
                <p className="text-xs opacity-60 mt-2">
                  {new Date(item.created_at).toLocaleString('id-ID')}
                </p>

                {/* Tombol Hapus (Muncul saat hover) */}
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNotif(item.id); }}
                  className="absolute bottom-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  title="Hapus pesan"
                >
                  <FaTrash />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Notifikasi