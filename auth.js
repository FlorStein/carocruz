/* =====================================================
   auth.js — Papelera Caro Cruz
   Autenticación segura con Firebase Auth

   CONFIGURACIÓN INICIAL (hacé esto una sola vez):
   1. Ir a https://console.firebase.google.com
   2. Crear un proyecto nuevo
   3. Ir a "Autenticación" → "Método de inicio de sesión" → activar "Correo/Contraseña"
   4. Ir a ⚙ Configuración del proyecto → Tu app web → copiá la config y pegala abajo
   ===================================================== */

// ─── REEMPLAZÁ ESTOS VALORES CON LOS DE TU PROYECTO ──────────────────────────
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAzwyvdj6hhJDMyPhkWmEgIBZl1MfzQ4M8",
  authDomain:        "carocruz-4bccc.firebaseapp.com",
  projectId:         "carocruz-4bccc",
  storageBucket:     "carocruz-4bccc.firebasestorage.app",
  messagingSenderId: "478517746609",
  appId:             "1:478517746609:web:a06ee588d3b3d88d547b90"
};
// ─────────────────────────────────────────────────────────────────────────────

// Inicializar Firebase solo si la config fue reemplazada
const CONFIG_PENDIENTE = FIREBASE_CONFIG.apiKey.startsWith('REEMPLAZAR');

if (!CONFIG_PENDIENTE) {
  firebase.initializeApp(FIREBASE_CONFIG);
  iniciarAuth();
} else {
  console.warn('[Caro Cruz Auth] Configurá Firebase en auth.js para activar el sistema de cuentas.');
  mostrarModoBeta();
}

/* =====================================================
   INICIALIZAR AUTH
   ===================================================== */
function iniciarAuth() {
  const auth = firebase.auth();

  // Observar estado de sesión
  auth.onAuthStateChanged(function(user) {
    const btnMiCuenta = document.getElementById('btnMiCuenta');
    const userDisplay  = document.getElementById('userDisplay');
    const userNameEl   = document.getElementById('userNameDisplay');

    if (user) {
      if (btnMiCuenta) btnMiCuenta.style.display = 'none';
      if (userDisplay) userDisplay.style.display = 'flex';
      const nombre = user.displayName || user.email.split('@')[0];
      if (userNameEl) userNameEl.textContent = nombre;
      cerrarModalAuth();
    } else {
      if (btnMiCuenta) btnMiCuenta.style.display = 'flex';
      if (userDisplay) userDisplay.style.display = 'none';
    }
  });

  // Exponer funciones globales con referencia al objeto auth
  window._auth = auth;
}

/* =====================================================
   MODAL — ABRIR / CERRAR
   ===================================================== */
function abrirModalAuth(tab) {
  tab = tab || 'login';
  document.getElementById('authModal').classList.add('open');
  document.getElementById('authOverlay').classList.remove('hidden');
  cambiarTabAuth(tab);
  document.body.style.overflow = 'hidden';
}
window.abrirModalAuth = abrirModalAuth;

function cerrarModalAuth() {
  document.getElementById('authModal').classList.remove('open');
  document.getElementById('authOverlay').classList.add('hidden');
  document.body.style.overflow = '';
  limpiarErroresAuth();
}
window.cerrarModalAuth = cerrarModalAuth;

function cambiarTabAuth(tab) {
  var tabLogin     = document.getElementById('tabLogin');
  var tabRegister  = document.getElementById('tabRegister');
  var formLogin    = document.getElementById('formLogin');
  var formRegister = document.getElementById('formRegister');

  if (tab === 'login') {
    tabLogin.classList.add('auth-tab--active');
    tabRegister.classList.remove('auth-tab--active');
    formLogin.classList.remove('hidden');
    formRegister.classList.add('hidden');
  } else {
    tabRegister.classList.add('auth-tab--active');
    tabLogin.classList.remove('auth-tab--active');
    formRegister.classList.remove('hidden');
    formLogin.classList.add('hidden');
  }
  limpiarErroresAuth();
}
window.cambiarTabAuth = cambiarTabAuth;

/* =====================================================
   REGISTRO
   ===================================================== */
async function handleRegister(e) {
  e.preventDefault();
  limpiarErroresAuth();

  var nombre   = document.getElementById('regName').value.trim();
  var email    = document.getElementById('regEmail').value.trim();
  var password = document.getElementById('regPassword').value;
  var confirm  = document.getElementById('regConfirm').value;

  var valido = true;
  if (!nombre) {
    mostrarErrorAuth('regNameError', 'Ingresá tu nombre.'); valido = false;
  }
  if (!emailValido(email)) {
    mostrarErrorAuth('regEmailError', 'Ingresá un email válido.'); valido = false;
  }
  if (!passwordSegura(password)) {
    mostrarErrorAuth('regPasswordError', 'Mínimo 8 caracteres, una mayúscula y un número.'); valido = false;
  }
  if (password !== confirm) {
    mostrarErrorAuth('regConfirmError', 'Las contraseñas no coinciden.'); valido = false;
  }
  if (!valido) return;

  var btn = document.getElementById('btnRegister');
  btnCargando(btn, 'Creando cuenta…');

  try {
    var cred = await window._auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: nombre });
    // onAuthStateChanged se encarga del resto
  } catch (err) {
    btnReset(btn, 'Crear cuenta');
    mostrarErrorAuth('regEmailError', mensajeFirebase(err.code));
  }
}
window.handleRegister = handleRegister;

/* =====================================================
   LOGIN
   ===================================================== */
async function handleLogin(e) {
  e.preventDefault();
  limpiarErroresAuth();

  var email    = document.getElementById('loginEmail').value.trim();
  var password = document.getElementById('loginPassword').value;

  var valido = true;
  if (!emailValido(email)) {
    mostrarErrorAuth('loginEmailError', 'Ingresá un email válido.'); valido = false;
  }
  if (!password) {
    mostrarErrorAuth('loginPasswordError', 'Ingresá tu contraseña.'); valido = false;
  }
  if (!valido) return;

  var btn = document.getElementById('btnLogin');
  btnCargando(btn, 'Ingresando…');

  try {
    await window._auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    btnReset(btn, 'Ingresar');
    mostrarErrorAuth('loginPasswordError', mensajeFirebase(err.code));
  }
}
window.handleLogin = handleLogin;

/* =====================================================
   LOGIN CON GOOGLE
   ===================================================== */
async function handleGoogle() {
  limpiarErroresAuth();
  var btn = document.getElementById('btnGoogle') || document.getElementById('btnGoogleReg');
  try {
    var provider = new firebase.auth.GoogleAuthProvider();
    await window._auth.signInWithPopup(provider);
    // onAuthStateChanged cierra el modal y actualiza el header
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      mostrarErrorAuth('loginPasswordError', mensajeFirebase(err.code));
    }
  }
}
window.handleGoogle = handleGoogle;

/* =====================================================
   CERRAR SESIÓN
   ===================================================== */
async function handleLogout() {
  cerrarUserDropdown();
  await window._auth.signOut();
}
window.handleLogout = handleLogout;

/* =====================================================
   DROPDOWN USUARIO
   ===================================================== */
function toggleUserDropdown() {
  document.getElementById('userDropdown').classList.toggle('open');
}
window.toggleUserDropdown = toggleUserDropdown;

function cerrarUserDropdown() {
  var dd = document.getElementById('userDropdown');
  if (dd) dd.classList.remove('open');
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('#userDisplay')) cerrarUserDropdown();
});

/* =====================================================
   MOSTRAR / OCULTAR CONTRASEÑA
   ===================================================== */
function togglePw(inputId, btn) {
  var input  = document.getElementById(inputId);
  var isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  var eyeOn  = btn.querySelector('.eye-on');
  var eyeOff = btn.querySelector('.eye-off');
  if (eyeOn)  eyeOn.style.display  = isText ? 'none'  : 'block';
  if (eyeOff) eyeOff.style.display = isText ? 'block' : 'none';
}
window.togglePw = togglePw;

/* =====================================================
   MEDIDOR DE FORTALEZA DE CONTRASEÑA
   ===================================================== */
function updateStrength(val) {
  var bar  = document.getElementById('strengthBar');
  var text = document.getElementById('strengthText');
  if (!bar) return;

  if (!val) { bar.style.width = '0%'; text.textContent = ''; return; }

  var score = 0;
  if (val.length >= 8)           score++;
  if (/[A-Z]/.test(val))         score++;
  if (/[0-9]/.test(val))         score++;
  if (/[^A-Za-z0-9]/.test(val))  score++;

  var levels = [
    { w: '25%',  color: '#EF4444', label: 'Muy débil'  },
    { w: '50%',  color: '#F97316', label: 'Débil'      },
    { w: '75%',  color: '#EAB308', label: 'Aceptable'  },
    { w: '100%', color: '#22C55E', label: 'Fuerte ✓'   },
  ];
  var l = levels[Math.max(score - 1, 0)];
  bar.style.width      = l.w;
  bar.style.background = l.color;
  text.textContent     = l.label;
  text.style.color     = l.color;
}
window.updateStrength = updateStrength;

/* =====================================================
   MODO BETA (sin Firebase configurado)
   ===================================================== */
function mostrarModoBeta() {
  // Igualmente abre el modal pero muestra aviso
  var btnMiCuenta = document.getElementById('btnMiCuenta');
  if (btnMiCuenta) {
    btnMiCuenta.addEventListener('click', function() {
      abrirModalAuth('login');
    });
  }
}

/* =====================================================
   HELPERS
   ===================================================== */
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function passwordSegura(pw) {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw);
}

function mostrarErrorAuth(id, msg) {
  var el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function limpiarErroresAuth() {
  document.querySelectorAll('.auth-field-error').forEach(function(el) {
    el.textContent = '';
    el.style.display = 'none';
  });
  // Resetear botones
  var btnL = document.getElementById('btnLogin');
  var btnR = document.getElementById('btnRegister');
  if (btnL && btnL.disabled) btnReset(btnL, 'Ingresar');
  if (btnR && btnR.disabled) btnReset(btnR, 'Crear cuenta');
}

function btnCargando(btn, texto) {
  btn.disabled = true;
  btn.textContent = texto;
}

function btnReset(btn, texto) {
  btn.disabled = false;
  btn.textContent = texto;
}

function mensajeFirebase(code) {
  var msgs = {
    'auth/email-already-in-use':   'Ese email ya está registrado.',
    'auth/invalid-email':          'Email inválido.',
    'auth/weak-password':          'Contraseña muy débil. Probá con una más larga.',
    'auth/user-not-found':         'No existe cuenta con ese email.',
    'auth/wrong-password':         'Email o contraseña incorrectos.',
    'auth/invalid-credential':     'Email o contraseña incorrectos.',
    'auth/too-many-requests':      'Demasiados intentos fallidos. Esperá unos minutos.',
    'auth/network-request-failed': 'Error de red. Verificá tu conexión.',
    'auth/user-disabled':          'Esta cuenta fue desactivada.',
  };
  return msgs[code] || 'Ocurrió un error. Intentá de nuevo.';
}
