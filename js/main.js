/* =========================================================
   MIL · Interacciones del sitio
   ========================================================= */
// ---------- 1. Sombra del encabezado al bajar ----------
const encabezado = document.getElementById('encabezado');
window.addEventListener('scroll', () => {
  encabezado.classList.toggle('con-sombra', window.scrollY > 10);
});

// ---------- 2. Menú del celular ----------
const menuBoton = document.getElementById('menu-boton');
const menu = document.getElementById('menu');

function cerrarMenu() {
  menu.classList.remove('abierto');
  menuBoton.setAttribute('aria-expanded', 'false');
  menuBoton.setAttribute('aria-label', 'Abrir menú');
  document.body.style.overflow = '';
}

menuBoton.addEventListener('click', () => {
  const abrir = !menu.classList.contains('abierto');
  if (!abrir) return cerrarMenu();
  menu.classList.add('abierto');
  menuBoton.setAttribute('aria-expanded', 'true');
  menuBoton.setAttribute('aria-label', 'Cerrar menú');
  document.body.style.overflow = 'hidden'; // evita que la página se mueva detrás del menú
});

// Al tocar una opción del menú, se cierra
menu.querySelectorAll('a').forEach((enlace) => enlace.addEventListener('click', cerrarMenu));

// ---------- 3. Sobre MIL: se abre una tarjeta a la vez, solo con el botón ----------
const tarjetas = document.querySelectorAll('.mil__tarjeta');

tarjetas.forEach((tarjeta) => {
  const boton = tarjeta.querySelector('.mil__boton');
  boton.addEventListener('click', () => {
    const abrir = !tarjeta.classList.contains('abierta');

    // Primero se cierran todas
    tarjetas.forEach((otra) => {
      otra.classList.remove('abierta');
      const b = otra.querySelector('.mil__boton');
      b.textContent = 'Saber más +';
      b.setAttribute('aria-expanded', 'false');
    });

    // Después se abre la elegida (si estaba cerrada)
    if (abrir) {
      tarjeta.classList.add('abierta');
      boton.textContent = 'Cerrar −';
      boton.setAttribute('aria-expanded', 'true');
    }
  });
});

// ---------- 4. Galería con visor ----------
const fotos = Array.from(document.querySelectorAll('.galeria__foto'));
const visor = document.getElementById('visor');
const visorFoto = document.getElementById('visor-foto');
const visorTitulo = document.getElementById('visor-titulo');
let fotoActual = 0;
let fotoQueAbrio = null;

function mostrarFoto(indice) {
  fotoActual = (indice + fotos.length) % fotos.length; // da la vuelta al llegar al final
  const boton = fotos[fotoActual];
  const img = boton.querySelector('img');
  const titulo = boton.dataset.titulo;

  visorFoto.src = img.src;   // copia la foto del botón al visor
  visorFoto.alt = img.alt;
  visorTitulo.textContent = titulo + ' · ' + (fotoActual + 1) + ' de ' + fotos.length;
}

function abrirVisor(indice) {
  fotoQueAbrio = fotos[indice];
  mostrarFoto(indice);
  visor.hidden = false;
  document.body.style.overflow = 'hidden';
  document.getElementById('visor-cerrar').focus();
}

function cerrarVisor() {
  visor.hidden = true;
  document.body.style.overflow = '';
  if (fotoQueAbrio) fotoQueAbrio.focus(); // el foco vuelve a la foto que se abrió
}

fotos.forEach((foto, i) => foto.addEventListener('click', () => abrirVisor(i)));
document.getElementById('visor-cerrar').addEventListener('click', cerrarVisor);
document.getElementById('visor-ant').addEventListener('click', () => mostrarFoto(fotoActual - 1));
document.getElementById('visor-sig').addEventListener('click', () => mostrarFoto(fotoActual + 1));
visor.addEventListener('click', (e) => { if (e.target === visor) cerrarVisor(); });

// Deslizar con el dedo en el celular
let inicioToque = 0;
visor.addEventListener('touchstart', (e) => { inicioToque = e.touches[0].clientX; }, { passive: true });
visor.addEventListener('touchend', (e) => {
  const distancia = e.changedTouches[0].clientX - inicioToque;
  if (Math.abs(distancia) > 50) mostrarFoto(fotoActual + (distancia < 0 ? 1 : -1));
});

// Teclado: Escape cierra; flechas cambian de foto
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!visor.hidden) cerrarVisor();
    else if (menu.classList.contains('abierto')) { cerrarMenu(); menuBoton.focus(); }
  }
  if (!visor.hidden && e.key === 'ArrowRight') mostrarFoto(fotoActual + 1);
  if (!visor.hidden && e.key === 'ArrowLeft') mostrarFoto(fotoActual - 1);
});

// ---------- 5. Formulario de contacto ----------
const formulario = document.getElementById('formulario');
const avisoFormulario = document.getElementById('formulario-aviso');

const mensajesError = {
  nombre: 'Escribí tu nombre y apellido.',
  empresa: 'Escribí el nombre de tu empresa.',
  email: 'Escribí un email válido, por ejemplo nombre@empresa.com.',
  interes: 'Elegí una opción.',
  mensaje: 'Contanos brevemente tu consulta.',
  acepto: 'Necesitamos tu permiso para responderte.'
};

function marcarError(campo, texto) {
  const contenedor = campo.closest('.campo');
  let error = contenedor.querySelector('.error');
  if (!error) {
    error = document.createElement('p');
    error.className = 'error';
    error.id = 'error-' + campo.name;
    contenedor.appendChild(error);
  }
  error.textContent = texto; // textContent: nunca se interpreta como código
  campo.setAttribute('aria-invalid', 'true');
  campo.setAttribute('aria-describedby', error.id);
}

function limpiarError(campo) {
  const error = campo.closest('.campo').querySelector('.error');
  if (error) error.remove();
  campo.removeAttribute('aria-invalid');
  campo.removeAttribute('aria-describedby');
}

function campoValido(campo) {
  if (campo.type === 'checkbox') return campo.checked;
  const valor = campo.value.trim();
  if (campo.required && !valor) return false;
  if (campo.type === 'email' && valor) return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor);
  return true;
}

// Al corregir un campo, se borra su error
formulario.querySelectorAll('input, select, textarea').forEach((campo) => {
  campo.addEventListener('input', () => { if (campoValido(campo)) limpiarError(campo); });
  campo.addEventListener('change', () => { if (campoValido(campo)) limpiarError(campo); });
});

const URL_ENVIO = 'https://formspree.io/f/xvkzjgyp';   // pegá acá tu dirección de Formspree

formulario.addEventListener('submit', async (e) => {
  e.preventDefault();
  avisoFormulario.textContent = '';

  // Si el campo trampa tiene algo, lo completó un robot: se ignora en silencio
  if (formulario.web.value) return;

  let primerError = null;
  formulario.querySelectorAll('[required]').forEach((campo) => {
    if (!campoValido(campo)) {
      marcarError(campo, mensajesError[campo.name]);
      if (!primerError) primerError = campo;
    } else {
      limpiarError(campo);
    }
  });

  if (primerError) {
    primerError.focus();
    avisoFormulario.textContent = 'Revisá los campos marcados.';
    return;
  }

  // Envío real
  const boton = formulario.querySelector('[type="submit"]');
  boton.disabled = true;                        // evita el doble clic
  avisoFormulario.textContent = 'Enviando...';

  try {
    const respuesta = await fetch(URL_ENVIO, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(formulario)            // junta todos los campos con name
    });

    if (!respuesta.ok) throw new Error('El servicio rechazó el envío');

    avisoFormulario.textContent = '¡Gracias! Recibimos tu consulta y te vamos a responder a la brevedad.';
    formulario.reset();
  } catch (error) {
    avisoFormulario.textContent = 'No pudimos enviar tu consulta. Probá de nuevo en unos minutos o escribinos por WhatsApp o mail.';
  } finally {
    boton.disabled = false;
  }
});

// ---------- 7. Aparición suave de las secciones al bajar ----------
const aRevelar = document.querySelectorAll('.titulo-seccion, .bajada, .mil, .servicios, .pasos, .galeria, .contacto');
if ('IntersectionObserver' in window) {
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible');
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.12 });
  aRevelar.forEach((el) => { el.classList.add('revelar'); observador.observe(el); });
}
