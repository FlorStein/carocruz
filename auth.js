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

// Emails con permisos de administración (en minúsculas)
const ADMIN_EMAILS = [
  'admin@caracruz.com.ar',
  'admin@carocruz.com.ar'
];

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
    const userProfileItem = document.getElementById('userProfileItem');
    const adminMenuItem = document.getElementById('adminMenuItem');
    const tabUser = document.getElementById('tabUser');

    if (user) {
      if (btnMiCuenta) btnMiCuenta.style.display = 'none';
      if (userDisplay) userDisplay.style.display = 'flex';
      if (userProfileItem) userProfileItem.style.display = 'flex';
      if (tabUser) tabUser.style.display = '';
      const nombre = user.displayName || user.email.split('@')[0];
      if (userNameEl) userNameEl.textContent = nombre;

      const esAdmin = esUsuarioAdmin(user);
      if (adminMenuItem) adminMenuItem.style.display = esAdmin ? 'flex' : 'none';
      if (typeof window.actualizarEstadoAdmin === 'function') {
        window.actualizarEstadoAdmin(esAdmin, user);
      }

      cargarPerfilUsuario(user);

      cerrarModalAuth();
    } else {
      if (btnMiCuenta) btnMiCuenta.style.display = 'flex';
      if (userDisplay) userDisplay.style.display = 'none';
      if (userProfileItem) userProfileItem.style.display = 'none';
      if (tabUser) tabUser.style.display = 'none';
      if (adminMenuItem) adminMenuItem.style.display = 'none';
      if (typeof window.actualizarEstadoAdmin === 'function') {
        window.actualizarEstadoAdmin(false, null);
      }
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
  var user = window._auth ? window._auth.currentUser : null;
  if (user && (tab === 'login' || tab === 'register')) {
    tab = 'user';
  }
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
  var tabUser      = document.getElementById('tabUser');
  var formLogin    = document.getElementById('formLogin');
  var formRegister = document.getElementById('formRegister');
  var formUser     = document.getElementById('formUser');

  var user = window._auth ? window._auth.currentUser : null;
  var puedeVerUsuario = !!user;
  var puedeVerAuth = !user;
  if (tab === 'user' && !puedeVerUsuario) {
    tab = 'login';
  }
  if (tab === 'password') {
    tab = puedeVerUsuario ? 'user' : 'login';
  }

  if (tabLogin) {
    tabLogin.style.display = puedeVerAuth ? '' : 'none';
  }
  if (tabRegister) {
    tabRegister.style.display = puedeVerAuth ? '' : 'none';
  }
  if (tabUser) {
    tabUser.style.display = puedeVerUsuario ? '' : 'none';
  }

  tabLogin.classList.toggle('auth-tab--active', tab === 'login');
  tabRegister.classList.toggle('auth-tab--active', tab === 'register');
  if (tabUser) tabUser.classList.toggle('auth-tab--active', tab === 'user');

  formLogin.classList.toggle('hidden', tab !== 'login');
  formRegister.classList.toggle('hidden', tab !== 'register');
  if (formUser) formUser.classList.toggle('hidden', tab !== 'user');

  limpiarErroresAuth();
}
window.cambiarTabAuth = cambiarTabAuth;

function abrirModalUsuario() {
  cerrarUserDropdown();
  abrirModalAuth('user');
}
window.abrirModalUsuario = abrirModalUsuario;

function abrirModalCambioPassword() {
  cerrarUserDropdown();
  abrirModalAuth('password');
}
window.abrirModalCambioPassword = abrirModalCambioPassword;

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

async function handleForgotPassword() {
  limpiarErroresAuth();

  var email = document.getElementById('loginEmail').value.trim().toLowerCase();
  if (!emailValido(email)) {
    mostrarErrorAuth('loginEmailError', 'Ingresá tu email para recuperar la contraseña.');
    return;
  }

  var btn = document.getElementById('btnForgotPassword');
  if (btn) btnCargando(btn, 'Enviando...');

  try {
    await window._auth.sendPasswordResetEmail(email);
    var ok = document.getElementById('loginPasswordError');
    if (ok) {
      ok.textContent = 'Te enviamos un email para restablecer la contraseña.';
      ok.style.display = 'block';
      ok.style.color = '#16A34A';
    }
  } catch (err) {
    if (err && err.code === 'auth/user-not-found') {
      var regEmail = document.getElementById('regEmail');
      if (regEmail) regEmail.value = email;
      cambiarTabAuth('register');
      mostrarErrorAuth('regEmailError', 'Ese email no tiene cuenta todavía. Completá el registro para crearla.');
    } else {
      mostrarErrorAuth('loginPasswordError', mensajeFirebase(err.code));
    }
  } finally {
    if (btn) btnReset(btn, 'Olvidé mi contraseña');
  }
}
window.handleForgotPassword = handleForgotPassword;

async function handleUserProfileSave(e) {
  e.preventDefault();
  limpiarErroresAuth();

  var user = window._auth ? window._auth.currentUser : null;
  if (!user) {
    mostrarErrorAuth('userGeneralMsg', 'Iniciá sesión para editar tu usuario.');
    return;
  }

  var nombre = document.getElementById('userNombre').value.trim();
  var direccion = document.getElementById('userDireccion').value.trim();

  var pwdCurrent = document.getElementById('userPwdCurrent').value;
  var pwdNew = document.getElementById('userPwdNew').value;
  var pwdConfirm = document.getElementById('userPwdConfirm').value;
  var quiereCambiarPw = !!(pwdCurrent || pwdNew || pwdConfirm);

  var valido = true;
  if (!nombre) {
    mostrarErrorAuth('userNombreError', 'Ingresá tu nombre.'); valido = false;
  }
  if (direccion.length > 180) {
    mostrarErrorAuth('userDireccionError', 'La dirección es demasiado larga.'); valido = false;
  }

  if (quiereCambiarPw) {
    var providers = (user.providerData || []).map(function(p) { return p.providerId; });
    if (providers.indexOf('password') === -1) {
      mostrarErrorAuth('userGeneralMsg', 'Tu cuenta no usa contraseña. Ingresá con tu proveedor habitual.');
      valido = false;
    }
    if (!pwdCurrent) {
      mostrarErrorAuth('userPwdCurrentError', 'Ingresá tu contraseña actual.'); valido = false;
    }
    if (!passwordSegura(pwdNew)) {
      mostrarErrorAuth('userPwdNewError', 'Mínimo 8 caracteres, una mayúscula y un número.'); valido = false;
    }
    if (pwdNew !== pwdConfirm) {
      mostrarErrorAuth('userPwdConfirmError', 'Las contraseñas no coinciden.'); valido = false;
    }
    if (pwdCurrent && pwdNew && pwdCurrent === pwdNew) {
      mostrarErrorAuth('userPwdNewError', 'La nueva contraseña debe ser distinta de la actual.'); valido = false;
    }
  }

  if (!valido) return;

  var btn = document.getElementById('btnUserSave');
  btnCargando(btn, 'Guardando...');

  try {
    if (nombre !== (user.displayName || '')) {
      await user.updateProfile({ displayName: nombre });
    }
    await guardarPerfilUsuario(user, {
      nombre: nombre,
      email: user.email || '',
      direccion: direccion
    });

    if (quiereCambiarPw) {
      var credential = firebase.auth.EmailAuthProvider.credential(user.email, pwdCurrent);
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(pwdNew);
    }

    var userNameEl = document.getElementById('userNameDisplay');
    if (userNameEl) userNameEl.textContent = nombre || (user.email || '').split('@')[0];

    document.getElementById('userPwdCurrent').value = '';
    document.getElementById('userPwdNew').value = '';
    document.getElementById('userPwdConfirm').value = '';

    var ok = document.getElementById('userGeneralMsg');
    if (ok) {
      ok.textContent = 'Datos de usuario guardados correctamente.';
      ok.style.display = 'block';
      ok.style.color = '#16A34A';
    }
  } catch (err) {
    mostrarErrorAuth('userGeneralMsg', mensajeFirebase(err.code));
  } finally {
    btnReset(btn, 'Guardar usuario');
  }
}
window.handleUserProfileSave = handleUserProfileSave;

/* =====================================================
   GUARDAR CONTRASEÑA (PERFIL DE USUARIO)
   ===================================================== */
async function handleGuardarPassword() {
  limpiarErroresAuth();

  var user = window._auth ? window._auth.currentUser : null;
  if (!user) {
    mostrarErrorAuth('userGeneralMsg', 'Iniciá sesión para cambiar tu contraseña.');
    return;
  }

  var providers = (user.providerData || []).map(function(p) { return p.providerId; });
  if (providers.indexOf('password') === -1) {
    mostrarErrorAuth('userGeneralMsg', 'Tu cuenta no usa contraseña. Ingresá con tu proveedor habitual.');
    return;
  }

  var pwdCurrent = document.getElementById('userPwdCurrent').value;
  var pwdNew     = document.getElementById('userPwdNew').value;
  var pwdConfirm = document.getElementById('userPwdConfirm').value;

  var valido = true;
  if (!pwdCurrent) {
    mostrarErrorAuth('userPwdCurrentError', 'Ingresá tu contraseña actual.'); valido = false;
  }
  if (!passwordSegura(pwdNew)) {
    mostrarErrorAuth('userPwdNewError', 'Mínimo 8 caracteres, una mayúscula y un número.'); valido = false;
  }
  if (pwdNew !== pwdConfirm) {
    mostrarErrorAuth('userPwdConfirmError', 'Las contraseñas no coinciden.'); valido = false;
  }
  if (pwdCurrent && pwdNew && pwdCurrent === pwdNew) {
    mostrarErrorAuth('userPwdNewError', 'La nueva contraseña debe ser distinta de la actual.'); valido = false;
  }
  if (!valido) return;

  var btn = document.getElementById('btnGuardarPassword');
  btnCargando(btn, 'Guardando…');

  try {
    var credential = firebase.auth.EmailAuthProvider.credential(user.email, pwdCurrent);
    await user.reauthenticateWithCredential(credential);
    await user.updatePassword(pwdNew);

    document.getElementById('userPwdCurrent').value = '';
    document.getElementById('userPwdNew').value = '';
    document.getElementById('userPwdConfirm').value = '';

    var ok = document.getElementById('userGeneralMsg');
    if (ok) {
      ok.textContent = 'Contraseña actualizada correctamente.';
      ok.style.display = 'block';
      ok.style.color = '#16A34A';
    }
  } catch (err) {
    mostrarErrorAuth('userGeneralMsg', mensajeFirebase(err.code));
  } finally {
    btnReset(btn, 'Guardar contraseña');
  }
}
window.handleGuardarPassword = handleGuardarPassword;

/* =====================================================
   CAMBIAR CONTRASEÑA (ADMIN)
   ===================================================== */
async function handleChangePassword(e) {
  e.preventDefault();
  limpiarErroresAuth();

  var user = window._auth ? window._auth.currentUser : null;
  if (!user || !esUsuarioAdmin(user)) {
    mostrarErrorAuth('pwdGeneralMsg', 'Solo un admin autenticado puede cambiar la contraseña.');
    return;
  }

  var providers = (user.providerData || []).map(function(p) { return p.providerId; });
  if (providers.indexOf('password') === -1) {
    mostrarErrorAuth('pwdGeneralMsg', 'Esta cuenta no usa contraseña. Ingresá con tu proveedor habitual.');
    return;
  }

  var current = document.getElementById('pwdCurrent').value;
  var nextPw  = document.getElementById('pwdNew').value;
  var confirm = document.getElementById('pwdConfirm').value;

  var valido = true;
  if (!current) {
    mostrarErrorAuth('pwdCurrentError', 'Ingresá tu contraseña actual.'); valido = false;
  }
  if (!passwordSegura(nextPw)) {
    mostrarErrorAuth('pwdNewError', 'Mínimo 8 caracteres, una mayúscula y un número.'); valido = false;
  }
  if (nextPw !== confirm) {
    mostrarErrorAuth('pwdConfirmError', 'Las contraseñas no coinciden.'); valido = false;
  }
  if (current && nextPw && current === nextPw) {
    mostrarErrorAuth('pwdNewError', 'La nueva contraseña debe ser distinta de la actual.'); valido = false;
  }
  if (!valido) return;

  var btn = document.getElementById('btnChangePassword');
  btnCargando(btn, 'Actualizando…');

  try {
    var credential = firebase.auth.EmailAuthProvider.credential(user.email, current);
    await user.reauthenticateWithCredential(credential);
    await user.updatePassword(nextPw);
    var msg = document.getElementById('pwdGeneralMsg');
    if (msg) {
      msg.textContent = 'Contraseña actualizada correctamente.';
      msg.style.display = 'block';
      msg.style.color = '#16A34A';
    }
    document.getElementById('pwdCurrent').value = '';
    document.getElementById('pwdNew').value = '';
    document.getElementById('pwdConfirm').value = '';
    btnReset(btn, 'Actualizar contraseña');
  } catch (err) {
    btnReset(btn, 'Actualizar contraseña');
    mostrarErrorAuth('pwdGeneralMsg', mensajeFirebase(err.code));
  }
}
window.handleChangePassword = handleChangePassword;

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

  if (typeof window.actualizarEstadoAdmin === 'function') {
    window.actualizarEstadoAdmin(false, null);
  }
}

function esUsuarioAdmin(user) {
  const email = (user && user.email ? user.email : '').toLowerCase().trim();
  return !!email && ADMIN_EMAILS.includes(email);
}

function _perfilUsuarioStorageKey(user) {
  var uid = user && user.uid ? String(user.uid) : '';
  return 'carocruz_user_profile_' + uid;
}

async function cargarPerfilUsuario(user) {
  var nombreEl = document.getElementById('userNombre');
  var emailEl = document.getElementById('userEmail');
  var dirEl = document.getElementById('userDireccion');
  if (!user || !nombreEl || !emailEl || !dirEl) return;

  nombreEl.value = user.displayName || '';
  emailEl.value = user.email || '';
  dirEl.value = '';

  try {
    var db = firebase.firestore();
    var snap = await db.collection('usuarios').doc(user.uid).get();
    if (snap.exists) {
      var data = snap.data() || {};
      if (typeof data.nombre === 'string' && data.nombre.trim()) nombreEl.value = data.nombre.trim();
      if (typeof data.direccion === 'string') dirEl.value = data.direccion;
      localStorage.setItem(_perfilUsuarioStorageKey(user), JSON.stringify(data));
      return;
    }
  } catch (err) {
    // fallback local
  }

  try {
    var raw = localStorage.getItem(_perfilUsuarioStorageKey(user));
    if (!raw) return;
    var localData = JSON.parse(raw);
    if (localData && typeof localData.nombre === 'string' && localData.nombre.trim()) nombreEl.value = localData.nombre.trim();
    if (localData && typeof localData.direccion === 'string') dirEl.value = localData.direccion;
  } catch (err) {
    // ignore local parse errors
  }
}

async function guardarPerfilUsuario(user, perfil) {
  if (!user) return;
  var payload = {
    nombre: String(perfil?.nombre || ''),
    email: String(perfil?.email || user.email || ''),
    direccion: String(perfil?.direccion || ''),
    updatedAt: Date.now()
  };

  try {
    var db = firebase.firestore();
    await db.collection('usuarios').doc(user.uid).set(payload, { merge: true });
  } catch (err) {
    // fallback local
  }

  localStorage.setItem(_perfilUsuarioStorageKey(user), JSON.stringify(payload));
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
    el.style.color = '';
  });
  // Resetear botones
  var btnL = document.getElementById('btnLogin');
  var btnR = document.getElementById('btnRegister');
  var btnU = document.getElementById('btnUserSave');
  if (btnL && btnL.disabled) btnReset(btnL, 'Ingresar');
  if (btnR && btnR.disabled) btnReset(btnR, 'Crear cuenta');
  if (btnU && btnU.disabled) btnReset(btnU, 'Guardar usuario');
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
    'auth/requires-recent-login':  'Por seguridad, cerrá sesión e iniciá de nuevo para continuar.',
    'auth/operation-not-allowed':  'Operación no permitida para esta cuenta.',
    'auth/missing-email':          'Ingresá un email para continuar.',
  };
  return msgs[code] || 'Ocurrió un error. Intentá de nuevo.';
}
