exports.products = {
  kiosk: {
    id: 1,
    title: "Kiosk",
    description: "Golf Course Kiosk",
    one_time_payment: true,
    price: 1,
  },
};

exports.getProducts = () => {
  return Object.values(this.products);
};
