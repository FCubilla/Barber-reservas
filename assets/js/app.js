// Lógica simple de reservas usando localStorage
(function(){
  const STORAGE_KEY = 'barber_bookings';

  // Elementos
  const form = document.getElementById('bookingForm');
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const serviceInput = document.getElementById('service');
  const dateInput = document.getElementById('date');
  const timeSelect = document.getElementById('time');
  const message = document.getElementById('message');

  function getBookings(){
    try{
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }catch(e){
      console.error('Error parseando bookings', e);
      return [];
    }
  }
  function saveBookings(bookings){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }

  function showMessage(txt, type='success'){
    message.textContent = txt;
    message.className = type === 'error' ? 'alert alert-danger' : 'alert alert-success';
    setTimeout(()=>{ 
      message.textContent = ''; 
      message.className = ''; 
    }, 4000);
  }

  function generateTimeOptions(startHour=9, endHour=18, intervalMin=30, occupiedTimes=[]){
    timeSelect.innerHTML = '<option value="">Seleccioná una hora</option>';
    for(let h=startHour; h<=endHour; h++){
      for(let m=0; m<60; m+=intervalMin){
        const hh = String(h).padStart(2,'0');
        const mm = String(m).padStart(2,'0');
        const val = `${hh}:${mm}`;
        const opt = document.createElement('option');
        opt.value = val;
        
        // Deshabilitar si está ocupado
        if(occupiedTimes.includes(val)){
          opt.disabled = true;
          opt.textContent = `${val} (Ocupado)`;
          opt.style.color = '#999';
        } else {
          opt.textContent = val;
        }
        
        timeSelect.appendChild(opt);
      }
    }
  }

  function getOccupiedTimes(date){
    if(!date) return [];
    const bookings = getBookings();
    return bookings
      .filter(b => b.date === date)
      .map(b => b.time);
  }

  function updateAvailableTimes(){
    const selectedDate = dateInput.value;
    const occupiedTimes = getOccupiedTimes(selectedDate);
    generateTimeOptions(9, 17, 30, occupiedTimes);
    
    // Resetear selección de hora al cambiar fecha
    timeSelect.value = '';
  }

  function deleteBooking(id){
    const bookings = getBookings().filter(b=>String(b.id)!==String(id));
    saveBookings(bookings);
    showMessage('Turno cancelado correctamente', 'success');
  }

  function onSubmit(e){
    e.preventDefault();
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const service = serviceInput.value;
    const date = dateInput.value;
    const time = timeSelect.value;

    if(!name || !phone || !service || !date || !time){
      showMessage('Completá todos los campos', 'error');
      return;
    }

    // validar fecha no pasada
    const today = new Date();
    today.setHours(0,0,0,0);
    const selected = new Date(date + 'T00:00:00');
    if(selected < today){
      showMessage('La fecha seleccionada ya pasó', 'error');
      return;
    }

    // evitar solapamientos (mismo día y hora)
    const bookings = getBookings();
    const conflict = bookings.find(b=>b.date===date && b.time===time);
    if(conflict){
      showMessage('Esa fecha y hora ya está reservada. Elegí otra.', 'error');
      return;
    }

    const booking = {
      id: Date.now().toString(36),
      name,
      phone,
      service,
      date,
      time,
      timeStamp: Date.now()
    };
    bookings.push(booking);
    saveBookings(bookings);
    form.reset();
    // volver a fijar fecha mínima si se reseteó
    setMinDate();
    showMessage('✅ ¡Turno confirmado! Te esperamos en la fecha seleccionada.', 'success');

    // Enviar a Google Sheets
    sendToGoogleSheets(booking);
  }

  function sendToGoogleSheets(booking){
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxI2eBVp34TUyytWU74t3-U-095Wwfg7btYHA2OfakA7K4sRSeHGN8jzxvrhQAR1KmuSw/exec';
    
    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: booking.name,
        phone: booking.phone,
        service: booking.service,
        date: booking.date,
        time: booking.time
      })
    }).catch(err => {
      console.error('Error enviando a Google Sheets:', err);
      // No mostramos error al usuario para no confundirlo
    });
  }

  function setMinDate(){
    const today = new Date();
    const iso = today.toISOString().slice(0,10);
    dateInput.min = iso;
  }

  // Inicialización
  document.addEventListener('DOMContentLoaded', ()=>{
    generateTimeOptions(9,17,30); // horario 09:00 - 17:30
    setMinDate();
    form.addEventListener('submit', onSubmit);
    
    // Actualizar horarios disponibles cuando cambie la fecha
    dateInput.addEventListener('change', updateAvailableTimes);
  });

})();
