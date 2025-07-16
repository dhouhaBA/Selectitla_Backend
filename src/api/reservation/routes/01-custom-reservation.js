module.exports = {
  routes: [
    {
      method: "PUT",
      path: "/reservations/updateSatuts/:status",
      handler: "reservation.updateReservationStatus",
    },
  ],
};
