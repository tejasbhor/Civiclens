import { MousePointerClick } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type RefObject, useRef, useState } from "react";
import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ParticleButtonProps extends ButtonProps {
  onSuccess?: () => void;
  successDuration?: number;
  showIcon?: boolean;
}

function SuccessParticles({
  buttonRef,
}: {
  buttonRef: React.RefObject<HTMLButtonElement>;
}) {
  const rect = buttonRef.current?.getBoundingClientRect();
  if (!rect) return null;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return (
    <AnimatePresence>
      {[...Array(8)].map((_, i) => (
        <motion.div
          animate={{
            scale: [0, 1.4, 0],
            x: [0, (i % 2 ? 1 : -1) * (Math.random() * 60 + 20)],
            y: [0, -Math.random() * 60 - 20],
            opacity: [0, 1, 0],
          }}
          className="fixed h-1.5 w-1.5 rounded-full bg-emerald-400 pointer-events-none z-50 shadow-[0_0_10px_rgba(52,211,153,0.9)]"
          initial={{
            scale: 0,
            x: 0,
            y: 0,
            opacity: 0,
          }}
          key={i}
          style={{ left: centerX, top: centerY }}
          transition={{
            duration: 0.65,
            delay: i * 0.06,
            ease: "easeOut",
          }}
        />
      ))}
    </AnimatePresence>
  );
}

export function ParticleButton({
  children,
  onClick,
  onSuccess,
  successDuration = 1000,
  showIcon = false,
  className,
  ...props
}: ParticleButtonProps) {
  const [showParticles, setShowParticles] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowParticles(true);
    if (onClick) {
      onClick(e);
    }
    if (onSuccess) {
      onSuccess();
    }
    setTimeout(() => {
      setShowParticles(false);
    }, successDuration);
  };

  return (
    <>
      {showParticles && (
        <SuccessParticles
          buttonRef={buttonRef as RefObject<HTMLButtonElement>}
        />
      )}
      <Button
        className={cn(
          "relative transition-transform duration-150 active:scale-95",
          showParticles && "ring-2 ring-emerald-400/50 scale-[0.98]",
          className
        )}
        onClick={handleClick}
        ref={buttonRef}
        {...props}
      >
        {children}
        {showIcon && <MousePointerClick className="h-4 w-4 ml-2" />}
      </Button>
    </>
  );
}

export default ParticleButton;
