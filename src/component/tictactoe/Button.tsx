import React from "react";

type ButtonProps = {
  resetGame: () => void;
  text?: string;
};

const Button: React.FC<ButtonProps> = ({ resetGame, text }) => {
  return <button onClick={() => resetGame()}>{text ?? "No text"}</button>;
};

export default Button;
