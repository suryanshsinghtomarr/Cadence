import { AnimatePresence, motion } from 'framer-motion'

function Modal({ open, title, onClose, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-40 bg-zinc-950/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close modal overlay"
          />
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border border-indigo-100/80 bg-white p-5 shadow-sm md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold tracking-tight text-zinc-950">{title}</h3>
              <button
                type="button"
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-600"
                onClick={onClose}
              >
                Close
              </button>
            </div>
            {children}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

export default Modal
