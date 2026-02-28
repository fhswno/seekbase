// FRAMER MOTION
import { motion } from "framer-motion";

// TYPESCRIPT
type Props = {
  children: React.ReactNode;
  direction?: 1 | -1;
};

const OnboardingStep = ({ children, direction = 1 }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction * 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction * -60 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

export default OnboardingStep;
