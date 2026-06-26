$(document).ready(function() {
  
  if (!localStorage.getItem('walletBalance')) {
    localStorage.setItem('walletBalance', '0.00');
  }
  if (!localStorage.getItem('transactions')) {
    localStorage.setItem('transactions', JSON.stringify([]));
  }
  if (!localStorage.getItem('contacts')) {
    var initialContacts = [
      { name: 'Tulio Triviño', details: 'CBU: 313131313, Alias: tulio.trivino, Banco: Banco de Titirilquén' }
    ];
    localStorage.setItem('contacts', JSON.stringify(initialContacts));
  }

  $('#loginForm').submit(function(event) {
    event.preventDefault();
    var username = $('#username').val();
    var password = $('#password').val();

    if (username === 'admin' && password === '12345') {
      window.location.href = 'menu.html';
    } else {
      alert('Usuario o contraseña inválido. Inténtalo de nuevo.');
    }
  });

  if ($('#mainBalance').length) {
    var currentBalance = parseFloat(localStorage.getItem('walletBalance'));
    $('#mainBalance').text('$' + currentBalance.toLocaleString('es-CL', { minimumFractionDigits: 2 }));
  }

  $('#depositForm').submit(function(event) {
    event.preventDefault();
    var amount = parseFloat($('#depositAmount').val());

    if (!isNaN(amount) && amount > 0) {
      var currentBalance = parseFloat(localStorage.getItem('walletBalance'));
      currentBalance += amount;
      
      localStorage.setItem('walletBalance', currentBalance.toFixed(2));

      var transactions = JSON.parse(localStorage.getItem('transactions'));
      transactions.unshift({ type: 'in', desc: 'Depósito en cuenta', amount: amount });
      localStorage.setItem('transactions', JSON.stringify(transactions));

      alert('¡Depósito realizado con éxito!');
      window.location.href = 'menu.html';
    } else {
      alert('Por favor, ingrese un monto válido.');
    }
  });

  function loadContacts() {
    if ($('#contactList').length) {
      var contacts = JSON.parse(localStorage.getItem('contacts'));
      $('#contactList').empty();
      contacts.forEach(function(contact) {
        $('#contactList').append(
          '<li class="list-group-item d-flex justify-content-between align-items-center contact-item">' +
            '<div>' +
              '<strong>' + contact.name + '</strong><br>' +
              '<small class="text-muted">' + contact.details + '</small>' +
            '</div>' +
            '<button type="button" class="btn btn-sm btn-outline-success select-btn" data-name="' + contact.name + '">Seleccionar</button>' +
          '</li>'
        );
      });
    }
  }

  loadContacts();

  $('#searchContact').on('keyup', function() {
    var value = $(this).val().toLowerCase();
    $('#contactList .contact-item').filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });

  $(document).on('click', '.select-btn', function() {
    var contactName = $(this).data('name');
    $('#searchContact').val(contactName);
  });

  $('#addContactForm').submit(function(event) {
    event.preventDefault();
    var name = $('#newContactName').val().trim();
    if (name) {
      var contacts = JSON.parse(localStorage.getItem('contacts'));
      var randCBU = Math.floor(100000000 + Math.random() * 900000000);
      var newContact = {
        name: name,
        details: 'CBU: ' + randCBU + ', Alias: ' + name.toLowerCase().replace(/\s+/g, '.') + ', Banco: Digital Bank'
      };
      contacts.push(newContact);
      localStorage.setItem('contacts', JSON.stringify(contacts));
      $('#newContactName').val('');
      loadContacts();
      alert('Contacto agregado a la agenda.');
    }
  });

  $('#sendMoneyForm').submit(function(event) {
    event.preventDefault();
    var contact = $('#searchContact').val().trim();
    var amount = parseFloat($('#sendAmount').val());
    var currentBalance = parseFloat(localStorage.getItem('walletBalance'));

    if (!contact) {
      alert('Por favor, selecciona o escribe un destinatario.');
      return;
    }

    if (!isNaN(amount) && amount > 0) {
      if (amount <= currentBalance) {
        currentBalance -= amount;
        localStorage.setItem('walletBalance', currentBalance.toFixed(2));

        var transactions = JSON.parse(localStorage.getItem('transactions'));
        transactions.unshift({ type: 'out', desc: 'Envío de dinero a ' + contact, amount: amount });
        localStorage.setItem('transactions', JSON.stringify(transactions));

        alert('¡Transferencia enviada con éxito!');
        window.location.href = 'menu.html';
      } else {
        alert('Saldo insuficiente para completar esta operación.');
      }
    } else {
      alert('Por favor, ingrese un monto de transferencia válido.');
    }
  });

  if ($('#transactionList').length) {
    var transactions = JSON.parse(localStorage.getItem('transactions'));
    $('#transactionList').empty();
    
    if (transactions.length === 0) {
      $('#transactionList').append(
        '<li class="list-group-item text-center text-muted py-4">' +
          'No se han registrado movimientos en esta cuenta.' +
        '</li>'
      );
    } else {
      transactions.forEach(function(tx) {
        var badgeClass = tx.type === 'in' ? 'badge-success' : 'badge-danger';
        var prefix = tx.type === 'in' ? '+$' : '-$';
        
        $('#transactionList').append(
          '<li class="list-group-item d-flex justify-content-between align-items-center shadow-sm mb-1">' +
            tx.desc +
            '<span class="badge ' + badgeClass + ' badge-pill p-2">' + prefix + tx.amount.toFixed(2) + '</span>' +
          '</li>'
        );
      });
    }
  }

});