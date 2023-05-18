export const formatPrice = (number) => {
  return (number).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}