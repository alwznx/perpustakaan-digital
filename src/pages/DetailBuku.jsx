import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'
import { FaStar, FaArrowLeft } from 'react-icons/fa'

const DetailBuku = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [reviews, setReviews] = useState([])
  const [session, setSession] = useState(null)
  
  // State untuk Form Review
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  useEffect(() => {
    // 1. Cek Session
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))

    // 2. Ambil Detail Buku
    const fetchBook = async () => {
      const { data, error } = await supabase.from('books').select('*').eq('id', id).single()
      if (error) navigate('/')
      else setBook(data)
    }

    // 3. Ambil Review
    fetchReviews()
    fetchBook()
  }, [id])

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('book_id', id)
      .order('created_at', { ascending: false }) 
    setReviews(data || [])
  }

  const handlePostReview = async (e) => {
    e.preventDefault()
    if (!session) { toast.error("Login dulu bos!"); return }

    const { error } = await supabase.from('reviews').insert([
      {
        book_id: id,
        user_email: session.user.email,
        rating: rating,
        comment: comment
      }
    ])

    if (error) {
      toast.error("Gagal kirim review")
    } else {
      toast.success("Review terkirim!")
      setComment('') 
      fetchReviews() 
    }
  }

  if (!book) return <p className="text-center mt-10">Memuat...</p>

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Link to="/" className="flex items-center gap-2 text-gray-600 mb-6 hover:text-blue-600">
        <FaArrowLeft /> Kembali ke Home
      </Link>

      {/* BAGIAN 1: INFO BUKU */}
      <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col md:flex-row gap-8 mb-10">
        {/* Gambar */}
        <div className="w-full md:w-1/3">
          {book.image_url ? (
            <img src={book.image_url} className="w-full rounded-lg shadow-md object-cover" />
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">No Cover</div>
          )}
        </div>

        {/* Teks */}
        <div className="w-full md:w-2/3">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{book.title}</h1>
          <p className="text-lg text-blue-600 font-semibold mb-4">{book.author}</p>
          <p className="text-gray-600 leading-relaxed mb-6">{book.description}</p>
          
          <div className="flex items-center gap-4">
             <span className="bg-gray-100 px-3 py-1 rounded text-sm font-bold">Stok: {book.stock}</span>
          </div>
        </div>
      </div>

      {/* BAGIAN 2: FORM REVIEW */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Ulasan Pembaca</h3>
        
        {session ? (
          <form onSubmit={handlePostReview} className="bg-blue-50 p-6 rounded-xl mb-8 border border-blue-100">
            <h4 className="font-bold mb-3 text-blue-800">Tulis Ulasanmu</h4>
            
            <div className="mb-3">
              <label className="block text-sm mb-1">Rating (1-5 Bintang)</label>
              <select 
                value={rating} 
                onChange={(e) => setRating(e.target.value)}
                className="p-2 rounded border border-blue-200 bg-white"
              >
                <option value="5">⭐⭐⭐⭐⭐ (Sempurna)</option>
                <option value="4">⭐⭐⭐⭐ (Bagus)</option>
                <option value="3">⭐⭐⭐ (Lumayan)</option>
                <option value="2">⭐⭐ (Kurang)</option>
                <option value="1">⭐ (Buruk)</option>
              </select>
            </div>

            <textarea 
              className="w-full p-3 rounded border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
              rows="3"
              placeholder="Gimana menurutmu buku ini?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            ></textarea>
            
            <button type="submit" className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Kirim Ulasan
            </button>
          </form>
        ) : (
          <p className="bg-gray-100 p-4 rounded text-center mb-8">Silakan Login untuk menulis review.</p>
        )}

        {/* DAFTAR REVIEW */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500 italic">Belum ada review. Jadilah yang pertama!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-700">{review.user_email}</span>
                  <div className="flex text-yellow-400 text-sm">
                    {[...Array(review.rating)].map((_, i) => <FaStar key={i} />)}
                  </div>
                </div>
                <p className="text-gray-600">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}

export default DetailBuku