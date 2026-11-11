import { motion } from 'framer-motion'

export function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="py-4 md:py-6"
    >
      <h1 className="text-3xl font-semibold tracking-tight text-[#F2F2F3] md:text-4xl">
        Make things{' '}
        <em className="font-serif text-[2.25rem] font-normal italic text-[#E6E6E8] md:text-[2.5rem]">
          simple
        </em>
        .
      </h1>
      <p className="mt-2 max-w-xl text-sm text-[#8A8A8F] md:text-base">
        Tasks, focus, and the files that matter — one calm workspace.
      </p>
    </motion.div>
  )
}
