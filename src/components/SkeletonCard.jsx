const SkeletonCard = () => {
    return (
      <div className="bg-white rounded-xl shadow border border-gray-100 flex flex-col overflow-hidden h-full">
        
        {/* 1. Area Gambar (Abu-abu kedip-kedip) */}
        <div className="h-48 bg-gray-200 animate-pulse"></div>
  
        <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
          <div>
            {/* 2. Garis Judul (Lebar 3/4) */}
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
            
            {/* 3. Garis Penulis (Lebar 1/2) */}
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-4"></div>
          </div>
          
          {/* 4. Tombol Aksi (Bawah) */}
          <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
            <div className="h-8 bg-gray-200 rounded animate-pulse flex-1"></div>
          </div>
        </div>
      </div>
    )
  }
  
  export default SkeletonCard