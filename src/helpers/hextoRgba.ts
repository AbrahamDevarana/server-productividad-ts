export const hexToRgba = (hex: string, opacity: number): string => {
    // Eliminar el símbolo '#' si está presente
    const cleanHex = hex.replace("#", "");
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
  
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
  