/* Requests page: accept or decline a rider's request, with feedback and undo. */
(function () {
  var list = document.getElementById('request-list');
  if (!list) { return; }
  var left = document.getElementById('seats-left');
  var box = document.getElementById('confirm-box');
  var LABELS = {
    confirmed: '<span aria-hidden="true">✔</span> Confirmed',
    pending: '<span aria-hidden="true">⏳</span> Pending',
    declined: '<span aria-hidden="true">✖</span> Declined'
  };
  function setState(card, state) {
    var s = card.querySelector('.status');
    s.className = 'status status-' + (state === 'declined' ? 'cancelled' : state);
    s.innerHTML = LABELS[state];
    card.dataset.state = state;
  }
  function decide(card, state, text) {
    var wasConfirmed = card.dataset.state === 'confirmed';
    setState(card, state);
    card.querySelector('.accept-btn').hidden = true;
    card.querySelector('.decline-btn').hidden = true;
    card.querySelector('.undo-text').textContent = text;
    card.querySelector('.undo-area').hidden = false;
    card.querySelector('.undo-btn').focus();
    if (wasConfirmed) { left.textContent = Number(left.textContent) + 1; }
  }
  list.addEventListener('click', function (e) {
    var card = e.target.closest('.req');
    if (!card) { return; }
    var name = card.dataset.name;
    if (e.target.classList.contains('accept-btn')) {
      decide(card, 'confirmed', name + ' has been accepted and told.');
      left.textContent = Math.max(0, Number(left.textContent) - 1);
      document.getElementById('confirm-title').textContent = 'Ride confirmed with ' + name;
      document.getElementById('confirm-detail').textContent =
        'Pickup: Bayside Shopping Centre, east entrance, 07:15. Seats left: ' + left.textContent + ' of 4. ';
      box.hidden = false;
      box.focus();
    } else if (e.target.classList.contains('decline-btn')) {
      decide(card, 'declined', 'You declined ' + name + '. They will be told kindly and shown other rides.');
    } else if (e.target.classList.contains('undo-btn')) {
      var was = card.dataset.state;
      if (was === 'confirmed') { left.textContent = Number(left.textContent) + 1; }
      setState(card, 'pending');
      card.querySelector('.accept-btn').hidden = false;
      card.querySelector('.decline-btn').hidden = false;
      card.querySelector('.undo-area').hidden = true;
      box.hidden = true;
      card.querySelector('.accept-btn').focus();
    }
  });
})();
