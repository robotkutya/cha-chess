import { colors, pieces, Piece } from "../components/Piece";

export default function Play() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {colors.map((color) => {
        return (
          <div className="flex gap-2">
            {pieces.map((piece) => {
              return <Piece type={piece} color={color} />;
            })}
          </div>
        );
      })}
    </div>
  );
}
