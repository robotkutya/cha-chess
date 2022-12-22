import React from "react";
import { useSession, getSession } from "next-auth/react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { Square } from "react-chessboard";

const chess = new Chess();

export default function Play() {
  const { data: session, status } = useSession();

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

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>Access Denied</p>;
  }

  if (status === "authenticated" && session) {
    return (
      <div className="grid place-items-center">
        <h1 className="mb-11 mt-8">{`Hi, ${session.user?.name}`}</h1>
        <Chessboard position={fen} onPieceDrop={onDrop} />
      </div>
    );
  }

  return <p>Something went wrong</p>;
}
