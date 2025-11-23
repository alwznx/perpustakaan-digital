import { supabase } from '../supabaseClient'

/**
 * Mengirim notifikasi ke pengguna tertentu.
 * @param {string} userId - ID (UUID) pengguna tujuan.
 * @param {string} message - Pesan notifikasi.
 */
export const sendNotification = async (userId, message) => {
  if (!userId) {
    console.error("Gagal kirim notifikasi: User ID tidak ada.")
    return
  }

  const { error } = await supabase
    .from('notifications')
    .insert([
      { 
        user_id: userId, 
        message: message,
        is_read: false // Default belum dibaca
      }
    ])
  
  if (error) {
    console.error("Gagal kirim notifikasi:", error.message)
  } else {
    console.log("Notifikasi terkirim ke:", userId)
  }
}