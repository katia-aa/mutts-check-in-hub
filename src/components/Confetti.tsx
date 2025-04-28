
import { useEffect, useState } from "react";

interface ConfettiPieceProps {
  color: string;
  size: number;
  speed: "slow" | "medium" | "fast";
  delay: number;
  left: string;
}

const ConfettiPiece = ({ color, size, speed, delay, left }: ConfettiPieceProps) => {
  return (
    <div 
      className={`absolute top-0 animate-confetti-${speed}`}
      style={{ 
        left, 
        width: `${size}px`, 
        height: `${size}px`, 
        backgroundColor: color,
        animationDelay: `${delay}s`,
        borderRadius: Math.random() > 0.5 ? "50%" : "0"
      }}
    />
  );
};

const Confetti = () => {
  const [pieces, setPieces] = useState<React.ReactNode[]>([]);
  
  useEffect(() => {
    const colors = ["#8C81BD", "#E79F52", "#F48FA8", "#FFD700", "#9FE2BF"];
    const speeds = ["slow", "medium", "fast"] as const;
    const confettiPieces = [];
    
    for (let i = 0; i < 100; i++) { // Increase count for better coverage
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.floor(Math.random() * 10) + 5;
      const speed = speeds[Math.floor(Math.random() * speeds.length)];
      const delay = Math.random() * 3;
      const left = `${Math.random() * 100}%`;
      
      confettiPieces.push(
        <ConfettiPiece 
          key={i}
          color={color}
          size={size}
          speed={speed}
          delay={delay}
          left={left}
        />
      );
    }
    
    setPieces(confettiPieces);
    
    const timer = setTimeout(() => {
      setPieces([]);
    }, 5000); // Slightly longer duration to ensure all confetti finishes
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" style={{ width: "100vw", height: "100vh" }}>
      {pieces}
    </div>
  );
};

export default Confetti;
