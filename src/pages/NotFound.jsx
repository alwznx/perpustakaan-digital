import { Link } from 'react-router-dom'
import { FaCompass } from 'react-icons/fa'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <div className="text-9xl font-bold text-gray-200 dark:text-gray-700 animate-pulse">
        404
      </div>
      
      <div className="absolute mt-[-50px]">
        <FaCompass className="text-6xl text-blue-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Wah, kamu tersesat!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Halaman yang kamu cari sepertinya sudah dipinjam orang lain atau memang tidak pernah ada.
        </p>
        
        <Link 
          to="/" 
          className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30"
        >
          Kembali ke Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound