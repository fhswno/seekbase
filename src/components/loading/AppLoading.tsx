// FRAMER MOTION
import { motion } from "framer-motion";

const AppLoading = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative flex flex-col items-center"
      >
        {/* GLOW RING */}
        <motion.div
          className="absolute -inset-8 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(59,91,219,0.15) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* LOGO */}
        <motion.h1
          className="font-display text-4xl font-bold text-text"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          Seekbase
        </motion.h1>

        {/* TAGLINE */}
        <motion.p
          className="mt-2 text-sm text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          Your second brain. Fully yours.
        </motion.p>

        {/* LOADING BAR */}
        <motion.div
          className="mt-6 h-0.5 w-32 overflow-hidden rounded-full bg-surface-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ width: "40%" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AppLoading;
