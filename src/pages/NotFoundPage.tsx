import React from "react";
import { Link } from "react-router";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col pt-15 h-screen w-full relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full z-0"
          style={{
            width: `${5 + (i % 3) * 5}px`,
            height: `${5 + (i % 3) * 5}px`,
            top: `${10 + (i * 7) % 80}%`,
            left: `${5 + (i * 9) % 90}%`,
            opacity: 0.6,
            background: `rgba(${100 + (i * 10) % 100}, ${50 + (i * 15) % 200}, ${(i * 20) % 255}, 0.6)`,
            boxShadow: `0 0 10px rgba(${100 + (i * 10) % 100}, ${50 + (i * 15) % 200}, ${(i * 20) % 255}, 0.8)`,
            animation: `float-${i % 3} ${8 + i % 7}s infinite ease-in-out`
          }}
        />
      ))}

      {/* Simple animation keyframes */}
      <style>{`
        @keyframes float-0 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, -25px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, 25px); }
        }
      `}</style>

      {/* Content */}
      <div className="z-10 flex flex-col items-center">
        {/* 404 Text with simple animation */}
        <h1
          className="text-9xl font-bold mb-4"
          style={{
            fontFamily: "'Orbitron Variable', sans-serif",
            background: "linear-gradient(135deg, #646cff 0%, #61dafb 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 10px rgba(97, 218, 251, 0.5)",
            animation: "pulse 2s infinite ease-in-out"
          }}
        >
          404
        </h1>
        
        {/* Simple animation for the 404 text */}
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>

        {/* Error message */}
        <p
          className="text-xl mb-8 max-w-md px-4"
          style={{ color: "#c3c3df" }}
        >
          Oops! It seems the game level you're looking for has glitched out of existence.
        </p>

        {/* Home button with simple hover effect */}
        <div>
          <Link
            to="/"
            className="px-6 py-3 rounded-full font-medium"
            style={{
              background: "linear-gradient(135deg, #646cff 0%, #61dafb 100%)",
              boxShadow: "0 0 15px rgba(97, 218, 251, 0.5)",
              fontFamily: "'Orbitron Variable', sans-serif",
              color: "#ffffff",
              fontWeight: "600",
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
              transition: "transform 0.2s, box-shadow 0.2s",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              letterSpacing: "0.5px"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(97, 218, 251, 0.8)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 0 15px rgba(97, 218, 251, 0.5)";
              e.currentTarget.style.color = "#ffffff";
            }}
          >
            Return to Home Base
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

