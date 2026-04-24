function submitReservation(event) {
  event.preventDefault();

  const reservation = {
    type: "reservation",
    name: elements.reservationName.value.trim(),
    phone: elements.reservationPhone.value.trim(),
    date: elements.reservationDate.value,
    time: elements.reservationTime.value,
    guests: elements.reservationGuests.value,
    comment: elements.reservationComment.value.trim()
  };

  elements.reservationStatus.textContent = "Заявка отправлена. Мы скоро свяжемся с вами.";

  if (tg?.sendData) {
    tg.sendData(JSON.stringify(reservation));
    return;
  }

  alert("Заявка на бронирование отправлена");
}
