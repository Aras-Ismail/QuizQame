import { useEffect, useState } from "react";

const COLORS = ["#f00", "#0f0", "#00f", "#ff0", "#f0f", "#0ff"];

function randomConfettiPiece(i) {
  return {
    key: i,
    left: `${Math.random() * 100}vw`,
    backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    width: `${Math.random() * 10 + 5}px`,
    height: `${Math.random() * 10 + 5}px`,
    animationDuration: `${Math.random() * 3 + 2}s`,
    animationDelay: `${Math.random() * 2}s`,
  };
}

const Confetti = ({ perfectScore }) => {
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    if (perfectScore) {
      setConfettiPieces(Array.from({ length: 100 }, (_, i) => randomConfettiPiece(i)));
    } else {
      setConfettiPieces([]);
    }
  }, [perfectScore]);

  if (!perfectScore) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {confettiPieces.map((piece) => (
        <div
          key={piece.key}
          style={{
            position: "absolute",
            left: piece.left,
            top: 0,
            backgroundColor: piece.backgroundColor,
            width: piece.width,
            height: piece.height,
            borderRadius: "2px",
            opacity: 0.9,
            animation: `confetti-fall ${piece.animationDuration} linear ${piece.animationDelay}`,
          }}
        />
      ))}
      <style>
        {`
          @keyframes confetti-fall {
            to {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0.7;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Confetti;


