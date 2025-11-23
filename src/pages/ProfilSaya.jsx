import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'
import QRCode from 'react-qr-code'
import html2canvas from 'html2canvas' 
import { FaDownload, FaIdCard } from 'react-icons/fa'

const ProfilSaya = () => {
  const [session, setSession] = useState(null)
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Ref untuk "menandai" elemen kartu yang mau difoto
  const cardRef = useRef(null) 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) getProfile(session)
    })
  }, [])

  const getProfile = async (session) => {
    try {
      setLoading(true)
      const { user } = session
      const { data, error } = await supabase
        .from('profiles')
        .select(`full_name, avatar_url`)
        .eq('id', user.id)
        .single()

      if (data) {
        setFullName(data.full_name)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      console.log('Error loading user data!')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const { user } = session
      const updates = {
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      }
      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
      toast.success('Profil berhasil diupdate!')
      window.location.reload()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const uploadAvatar = async (event) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) throw new Error('Pilih gambar dulu!')
      
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      setAvatarUrl(data.publicUrl)
      toast.success("Foto terupload! Klik Simpan.")
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  // --- FUNGSI DOWNLOAD KARTU ---
  const downloadCard = async () => {
    if (!cardRef.current) return
    
    try {
      // Foto elemen cardRef
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null })
      const dataUrl = canvas.toDataURL('image/png')
      
      // Buat link download palsu lalu klik otomatis
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `Kartu_Member_${fullName || 'User'}.png`
      link.click()
      
      toast.success("Kartu berhasil didownload!")
    } catch (err) {
      toast.error("Gagal download kartu")
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Profil & Keanggotaan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        
        {/* BAGIAN KIRI: FORM EDIT PROFIL */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-6 text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <FaIdCard /> Edit Biodata
          </h3>
          
          <div className="flex flex-col items-center mb-6">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 mb-4" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mb-4 text-2xl font-bold">?</div>
            )}
            
            <label className="bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-300 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600 transition text-sm font-bold">
              {uploading ? '...' : 'Ganti Foto'}
              <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
            </label>
          </div>

          <form onSubmit={updateProfile}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Email</label>
              <input type="text" value={session?.user.email} disabled className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Nama Lengkap</label>
              <input type="text" value={fullName || ''} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama kamu" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-bold" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>

        {/* BAGIAN KANAN: KARTU MEMBER DIGITAL */}
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Kartu Anggota Digital</h3>
          
          {/* AREA KARTU YANG AKAN DI-DOWNLOAD (ref={cardRef}) */}
          <div 
            ref={cardRef}
            className="relative w-full max-w-sm h-56 rounded-2xl shadow-2xl overflow-hidden text-white transition-transform hover:scale-105 duration-300"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' 
            }}
          >
            {/* Dekorasi Background */}
            <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-white opacity-10 rounded-full"></div>
            <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 bg-white opacity-10 rounded-full"></div>

            <div className="p-6 h-full flex flex-col justify-between relative z-10">
              {/* Header Kartu */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold tracking-wider opacity-90">PERPUSTAKAAN</h4>
                  <p className="text-xs opacity-70">Digital Campus Member</p>
                </div>
                {/* Logo Kecil (Opsional) */}
                <div className="text-2xl opacity-80">📚</div>
              </div>

              {/* Isi Kartu */}
              <div className="flex items-center gap-4 mt-2">
                {/* Foto di Kartu */}
                <div className="w-16 h-16 rounded-full border-2 border-white/50 overflow-hidden bg-white/20 flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">No Foto</div>
                  )}
                </div>
                
                {/* Info User */}
                <div>
                  <p className="font-bold text-lg leading-tight truncate w-40">{fullName || 'Member Baru'}</p>
                  <p className="text-xs opacity-75 font-mono mt-1">{session?.user.email}</p>
                  <p className="text-[10px] opacity-60 mt-1">ID: {session?.user.id.slice(0, 8)}...</p>
                </div>
              </div>

              {/* Footer: QR Code */}
              <div className="absolute bottom-4 right-4 bg-white p-1 rounded-lg shadow-sm">
                {session && (
                  <QRCode 
                    value={session.user.id} 
                    size={60}
                    viewBox={`0 0 256 256`}
                  />
                )}
              </div>
            </div>
          </div>

          {/* TOMBOL DOWNLOAD */}
          <button 
            onClick={downloadCard}
            className="mt-6 bg-gray-800 dark:bg-white dark:text-gray-900 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition flex items-center gap-2"
          >
            <FaDownload /> Download Kartu
          </button>
          <p className="text-xs text-gray-500 mt-2">Simpan kartu ini untuk peminjaman cepat.</p>
        </div>

      </div>
    </div>
  )
}

export default ProfilSaya