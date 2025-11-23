import { motion } from 'framer-motion'

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // Awal: Transparan & agak di bawah
      animate={{ opacity: 1, y: 0 }}  // Masuk: Muncul & posisi normal
      exit={{ opacity: 0, y: -20 }}   // Keluar: Hilang ke atas
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition