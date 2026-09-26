import { motion } from 'framer-motion'

function GlowButton({ children, className = '', ...props }) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98] ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default GlowButton
