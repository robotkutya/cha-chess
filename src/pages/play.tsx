import React from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { Square } from "react-chessboard";

const chess = new Chess();

export default function Play() {
  const [fen, setFen] = React.useState(chess.fen());

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    const move = chess.move({
      from: sourceSquare,
      to: targetSquare,
    });
    console.log(move);
    if (move === null) return false;

    setFen(chess.fen());

    return true;
  }

  return (
    <div className="grid place-items-center">
      <Chessboard position={fen} onPieceDrop={onDrop} />
    </div>
  );
}
