// FRAMER MOTION
import { motion } from "framer-motion";

const OnboardingStep = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex w-full max-w-lg items-center justify-center px-8"
    >
      {children}
    </motion.div>
  );
};

export default OnboardingStep;
