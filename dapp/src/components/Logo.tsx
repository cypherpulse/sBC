export function SbcLogo({ size = 40 }: { size?: number }) {
  return (
    <img 
      src="https://res.cloudinary.com/dg5rr4ntw/image/upload/v1772567233/favicon_kxcesl.svg" 
      alt="Bradley Coin Logo" 
      width={size} 
      height={size}
      className="object-contain"
    />
  );
}
