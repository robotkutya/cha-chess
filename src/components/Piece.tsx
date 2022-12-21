export const pieces = [
  "pawn",
  "rook",
  "knight",
  "bishop",
  "queen",
  "king",
] as const;
export type PieceType = typeof pieces[number];

export const colors = ["white", "black"] as const;
export type ColorTypes = typeof colors[number];

export type PieceProps = {
  type: PieceType;
  color: ColorTypes;
};

function selectBlackPiece(type: PieceType) {
  switch (type) {
    case "pawn":
      return "♟︎";
    case "rook":
      return "♜";
    case "knight":
      return "♞";
    case "bishop":
      return "♝";
    case "queen":
      return "♛";
    case "king":
      return "♚";
  }
}

function selectWhitePiece(type: PieceType) {
  switch (type) {
    case "pawn":
      return "♙";
    case "rook":
      return "♖";
    case "knight":
      return "♘";
    case "bishop":
      return "♗";
    case "queen":
      return "♕";
    case "king":
      return "♔";
  }
}

export const selectPiece = (type: PieceType, color: ColorTypes) => {
  if (color === "black") return selectBlackPiece(type);
  return selectWhitePiece(type);
};

export function Piece(props: PieceProps) {
  return (
    <div className={"text-5xl text-black"}>
      {props.color === "white" && selectWhitePiece(props.type)}
      {props.color === "black" && selectBlackPiece(props.type)}
    </div>
  );
}

export default Piece;
