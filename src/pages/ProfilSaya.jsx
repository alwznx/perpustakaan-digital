import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

const ProfilSaya = () => {
  const [session, setSession] = useState(null)
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

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

      // Ambil data dari tabel profiles
      const { data, error, status } = await supabase
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
        id: user.id, // ID User
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      }

      // UPSERT: Kalau belum ada -> Buat baru. Kalau sudah ada -> Update.
      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) throw error
      toast.success('Profil berhasil diupdate!')
      
      // Refresh halaman biar navbar ikut berubah (cara cepat)
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

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Pilih gambar dulu!')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload ke bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Ambil Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      setAvatarUrl(data.publicUrl)
      
      toast.success("Foto terupload! Jangan lupa klik Simpan.")

    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Profil Saya</h2>
      
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* AVATAR PREVIEW */}
        <div className="flex flex-col items-center mb-6">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 mb-4 shadow-sm" 
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mb-4 text-4xl font-bold">
              ?
            </div>
          )}
          
          <label className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-100 transition text-sm font-bold">
            {uploading ? 'Mengupload...' : 'Ganti Foto'}
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
            />
          </label>
        </div>

        {/* FORM NAMA */}
        <form onSubmit={updateProfile}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Email</label>
            <input type="text" value={session?.user.email} disabled className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed" />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium">Nama Lengkap</label>
            <input 
              type="text" 
              value={fullName || ''} 
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Masukkan nama kerenmu"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfilSaya