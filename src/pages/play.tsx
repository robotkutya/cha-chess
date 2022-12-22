import React from "react";
import { useSession } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { Square } from "react-chessboard";

const chess = new Chess();

// FIXME: make it work with env variables --> so we can deploy to vercel
export const supabase = createClient(
  // process.env.NEXT_PUBLIC_SUPABASE_URL ?? "public-supabase-url",
  // process.env.NEXT_PUBLIC_SUPABASE_KEY ?? "public-anon-key"
  "https://pjbbddqauxhgovxucfab.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYmJkZHFhdXhoZ292eHVjZmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzE3MDQ4NzEsImV4cCI6MTk4NzI4MDg3MX0.M4AEtGDzG67KqGWFRtsF0_ZShDqDWLKfLnHPgUX-pUA"
);


type ChessPayload = {
  fen: string;
  white: string; // user id
  black: string; // user id
};

type Message = {
  type: "broadcast";
  event: "join" | "move";
  payload: ChessPayload;
};

const GameStatus = [
  "joining",
  "waiting",
  "playing",
  "full",
  "finished",
] as const;

type GameStatusType = typeof GameStatus[number];

export default function Play() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [fen, setFen] = React.useState<string>(chess.fen());
  const [gameStatus, setGameStatus] = React.useState<GameStatusType>("joining");
  const [playerColor, setPlayerColor] = React.useState<
    "white" | "black" | undefined
  >();

  function assignColor(): {
    myColor: "white" | "black";
    otherColor: "white" | "black";
  } {
    const random = Math.floor(Math.random() * 2);
    const myColor = random > 1 ? "white" : "black";
    const otherColor = random > 1 ? "black" : "white";
    return { myColor, otherColor };
  }

  React.useEffect(() => {
    if (userId === undefined) return;

    // FIXME: 2 tabs breaks session why? --> session becomes undefined
    const channel = supabase.channel("chess-game", {
      config: {
        presence: {
          key: userId,
        },
        broadcast: { ack: true },
      },
    });

    channel.on("broadcast", { event: "handshake" }, (payload) => {
      console.log("handshake", payload);
      const { myColor } = payload[userId];
      setPlayerColor(myColor);
    });

    channel.on("presence", { event: "join" }, async ({ newPresences }) => {
      const presence = channel.presenceState();
      const newUserId = newPresences[0]!.user_id as string;

      if (Object.keys(presence).length === 2) {
        // start the game
        const { myColor, otherColor } = assignColor();

        await channel.send({
          type: "broadcast",
          event: "handshake",
          payload: { [userId]: myColor, [newUserId]: otherColor },
        });
        setGameStatus("playing");
      } else if (Object.keys(presence).length === 1) {
        // wait for another player
        setGameStatus("waiting");
      } else if (
        Object.keys(presence).length > 2 &&
        gameStatus !== "finished" &&
        gameStatus !== "playing"
      ) {
        // game is full
        setGameStatus("full");
      }
    });

    channel.on("presence", { event: "sync" }, () => {
      console.log("presence sync ", channel.presenceState());
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        // this is what actually logs in the user for supabase channel
        const trackResult = await channel.track({
          online_at: new Date().toISOString(),
          user_id: userId,
        });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    // set the new position in headless chess instance
    const move = chess.move({
      from: sourceSquare,
      to: targetSquare,
    });
    console.log(move);
    if (move === null) return false;

    // update the board position after the piece snap
    setFen(chess.fen());

    // websocket magic here

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
        {gameStatus === "joining" && <p>Joining...</p>}
        {gameStatus === "waiting" && <p>Waiting for more players to join...</p>}
        {gameStatus === "full" && <p>Game is full.</p>}
        {gameStatus === "finished" && <p>Game is finished.</p>}
        <Chessboard
          boardOrientation={playerColor}
          position={fen}
          onPieceDrop={onDrop}
        />
      </div>
    );
  }

  return <p>Something went wrong</p>;
}
