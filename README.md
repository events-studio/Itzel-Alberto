# Invitación de boda Pistache — Experiencia 3D por scroll

Invitación digital responsiva en React + Vite, con una escena 3D fija basada en scroll: anillos, pétalos, capas flotantes, parallax, cámara reactiva al movimiento del dedo/mouse, intro cinematográfica, contador, galería, itinerario, RSVP por WhatsApp y recuerdos compartidos en Drive.

## Requisitos

- Node.js LTS recomendado: 24.x
- npm incluido con Node

## Instalación rápida

```bash
npm install
npm run dev
```

Luego abre:

```txt
http://localhost:5173
```

## Crear desde cero

```bash
npm create vite@latest boda-pistache -- --template react
cd boda-pistache
npm install three @react-three/fiber framer-motion lucide-react canvas-confetti
npm install
npm run dev
```

Este proyecto ya trae todo listo; esos comandos son por si quieres recrearlo desde cero.

## Fotos

Pon tus 8 fotos en:

```txt
public/photos/couple-1.jpg
public/photos/couple-2.jpg
public/photos/couple-3.jpg
public/photos/couple-4.jpg
public/photos/couple-5.jpg
public/photos/couple-6.jpg
public/photos/couple-7.jpg
public/photos/couple-8.jpg
```

La app usa principalmente 6 fotos en la galería para que no se vea saturada. Si quieres mostrar las 8, cambia esto en `src/App.jsx`:

```js
const shown = wedding.photos.slice(0, 6)
```

por:

```js
const shown = wedding.photos
```

## Personalización

Edita:

```txt
src/data/wedding.js
```

Ahí cambias nombres, fecha, ubicaciones, WhatsApp, mesa de regalos, textos y links.

## Drive / recuerdos de invitados

Opción recomendada: crea un Google Form con pregunta de subida de archivo y pega el link en `.env`:

```bash
cp .env.example .env
```

```txt
VITE_MEMORIES_UPLOAD_URL="https://forms.gle/your-form"
```

Opción avanzada: usa `google-drive-upload/Code.gs` en Google Apps Script para enviar archivos directo a una carpeta de Drive. Pega la URL del Web App en:

```txt
VITE_APPS_SCRIPT_UPLOAD_URL="https://script.google.com/macros/s/.../exec"
```

## Build para publicar

```bash
npm run build
npm run preview
```

La carpeta final para subir a hosting queda en:

```txt
dist/
```

## Notas de rendimiento

- La escena 3D usa formas generativas, no modelos pesados.
- En móvil baja la opacidad de la escena para que el contenido siga legible.
- Respeta `prefers-reduced-motion`: si alguien tiene reducción de movimiento activada, se desactivan las animaciones pesadas.


## Cambios v3

Esta versión mejora la experiencia en teléfono y añade:

- Reproductor de música fijo y siempre presionable. Por reglas del navegador, la música empieza después del primer toque del usuario.
- Foto principal de los novios al inicio: `public/photos/novios-inicio.jpg`.
- Foto de parroquia: `public/photos/parroquia.jpg`.
- Foto de salón/recepción: `public/photos/salon-recepcion.jpg`.
- Los anillos ya no están amarrados al scroll; se quedan estables con movimiento ambiental suave.
- El scroll 3D ahora lo sienten principalmente los pétalos y las capas de contenido.
- Mobile-first más natural: menos centrado, más aire lateral y bloques legibles.
- Música configurada en `public/audio/cancion.mp3`.

Edita nombres, rutas, textos y links en `src/data/wedding.js`.
