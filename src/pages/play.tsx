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

  export default function Play() {
    const { data: session, status } = useSession();

    // receive websocket message here

    const [fen, setFen] = React.useState(chess.fen());

    React.useEffect(() => {
      console.log(supabase);

      const channel = supabase.channel("calc-latency", {
        config: {
          broadcast: { ack: true },
        },
      });

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const begin = performance.now();

          await channel.send({
            type: "broadcast",
            event: "latency",
            payload: {},
          });

          const end = performance.now();

          console.log(`Latency is ${end - begin} milliseconds`);
        }
      });
    }, []);

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
          <Chessboard position={fen} onPieceDrop={onDrop} />
        </div>
      );
    }

    return <p>Something went wrong</p>;
  }
