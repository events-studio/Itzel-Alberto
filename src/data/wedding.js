export const wedding = {
  couple: {
    bride: 'Itzel',
    groom: 'Alberto',
    initials: 'I&A',
    phrase: 'Dos almas, una historia, y toda una vida para celebrarla.',
  },
  hero: {
    image: '/photos/novios-inicio.jpg',
    kicker: 'Save the date',
    caption: 'Este día empieza con nosotros, pero se vuelve inolvidable con ustedes.',
  },
  music: {
    src: '/audio/song.m4a',
    note: 'Toca para ambientar la invitación',
  },
  date: {
    iso: '2026-11-28T15:00:00-13:30',
    pretty: 'Sábado 28 de noviembre de 2026',
    short: '28 · 11 · 2026',
  },
  ceremony: {
    title: 'Ceremonia religiosa',
    time: '1:30 PM',
    place: 'Templo de la inmaculada concepción.',
    address: 'Laguna Larga, Irapuato, Gto.',
    mapUrl: 'https://maps.app.goo.gl/UprDWxuoQPZa5zmB8',
    image: '/photos/parroquia.jpg',
    photoLabel: 'Templo',
  },
  reception: {
    title: 'Recepción',
    time: '3:00 PM',
    place: 'Salón tulipanes',
    address: 'Laguna Larga, Irapuato, Gto.',
    mapUrl: 'https://maps.app.goo.gl/fZig8CennTMQA4JF8',
    image: '/photos/salon-recepcion.jpg',
    photoLabel: 'Recepción',
  },
  dressCode: {
    title: 'Código de vestimenta',
    text: 'Formal elegante. Te pedimos evitar blanco, ivory o tonos similares reservados para los novios y damas de honor.',
  },
  rsvp: {
    deadline: 'Confirma antes del 15 de noviembre de 2026',
    whatsappNumber: '5214620000000',
    message: 'Hola, confirmo mi asistencia a la boda de Andrea y Mateo. Mi nombre es:',
  },
  gift: {
    title: 'Mesa de regalos',
    text: 'Tu presencia es nuestro regalo más bonito. Si deseas tener un detalle con nosotros, puedes hacerlo aquí.',
    url: 'https://example.com/mesa-de-regalos',
  },
  memories: {
    uploadUrl: import.meta.env.VITE_MEMORIES_UPLOAD_URL || 'https://forms.gle/tu-formulario',
    appsScriptUrl: import.meta.env.VITE_APPS_SCRIPT_UPLOAD_URL || '',
  },
  photos: [
    '/photos/couple-1.jpg',
    '/photos/couple-2.jpg',
    '/photos/couple-3.jpg',
    '/photos/couple-4.jpg',
    '/photos/couple-5.jpg',
    '/photos/couple-6.jpg',
    '/photos/couple-7.jpg',
    '/photos/couple-8.jpg',
  ],
  timeline: [
    {
      time: '1:00 PM',
      title: 'Llegada de invitados',
      text: 'Lleguen con calma para saludar, tomar asiento y disfrutar el inicio.',
    },
    {
      time: '1:30 PM',
      title: 'Ceremonia',
      text: 'El momento más importante: compartir nuestros votos frente a quienes amamos.',
    },
   
    {
      time: '3:00 PM',
      title: 'Recepción',
      text: 'El día se enciende con música, alimentos y felicidad.',
    },
    {
      time: '6:30 PM',
      title: 'Baile',
      text: 'Una canción, una pista y el inicio oficial de la fiesta.',
    },
  ],
  highlights: [
 
  ],
}
