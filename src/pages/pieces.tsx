import Piece, { colors, pieces } from "../components/Piece";

export default function Pieces() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {colors.map((color) => {
        return (
          <div key={`${color}-row`} className="flex gap-2">
            {pieces.map((piece) => {
              return (
                <Piece key={`${color}-${piece}`} type={piece} color={color} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
