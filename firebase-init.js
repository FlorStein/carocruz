// firebase-init.js — SDK Modular Firebase v10
// type="module": el browser solo descarga los módulos que se importan,
// sin cargar el SDK compat completo (~400 KiB menos que los 4 scripts anteriores).
// Se ejecuta ANTES que script.js y auth.js (orden de documento, todos diferidos).

import { initializeApp }    from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
  signInWithPopup,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  addDoc,
  serverTimestamp,
  writeBatch,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL,
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// ─── Inicializar ──────────────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey:            'AIzaSyAzwyvdj6hhJDMyPhkWmEgIBZl1MfzQ4M8',
  authDomain:        'carocruz-4bccc.firebaseapp.com',
  projectId:         'carocruz-4bccc',
  storageBucket:     'carocruz-4bccc.firebasestorage.app',
  messagingSenderId: '478517746609',
  appId:             '1:478517746609:web:a06ee588d3b3d88d547b90',
};

const app     = initializeApp(FIREBASE_CONFIG);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

// ─── Proxy compat Firestore ───────────────────────────────────────────────────
// Replica el subconjunto de la API compat que usan script.js y auth.js, sin que
// esos archivos tengan que cambiar sus llamadas encadenadas:
//   .collection(name).onSnapshot(cb[, errCb])
//   .collection(name).doc(id).get()
//   .collection(name).doc(id).set(data[, opts])
//   .collection(name).doc(id).update(data)
//   .collection(name).doc(id).delete()
//   .collection(name).doc(id).onSnapshot(cb[, errCb])
function mkDoc(colName, docId) {
  const dRef = doc(db, colName, docId);
  return {
    _ref:       dRef,
    get:        ()           => getDoc(dRef),
    set:        (data, opts) => opts ? setDoc(dRef, data, opts) : setDoc(dRef, data),
    update:     (data)       => updateDoc(dRef, data),
    delete:     ()           => deleteDoc(dRef),
    onSnapshot: (cb, errCb)  => onSnapshot(dRef, cb, errCb || undefined),
  };
}

function mkCol(colName) {
  const cRef = collection(db, colName);
  return {
    doc:        (docId)      => mkDoc(colName, docId),
    add:        (data)       => addDoc(cRef, data),
    get:        ()           => getDocs(cRef),
    onSnapshot: (cb, errCb)  => onSnapshot(cRef, cb, errCb || undefined),
  };
}

// ─── Proxy compat Storage ─────────────────────────────────────────────────────
// Replica: firebaseStorageRef.ref(path).put(data, meta) → task.ref.getDownloadURL()
function mkStorage() {
  return {
    ref: (path) => ({
      put: (data, meta) => uploadBytes(sRef(storage, path), data, meta)
        .then(result => ({
          ref: { getDownloadURL: () => getDownloadURL(result.ref) },
        })),
    }),
  };
}

// ─── Proxy compat Batch ───────────────────────────────────────────────────────
function mkBatch() {
  const batch = writeBatch(db);
  // Acepta tanto un proxy mkDoc (tiene ._ref) como un DocumentReference nativo
  function toRef(r) { return r._ref || r; }
  return {
    set:    (r, data, opts) => { opts ? batch.set(toRef(r), data, opts) : batch.set(toRef(r), data); },
    update: (r, data)       => { batch.update(toRef(r), data); },
    delete: (r)             => { batch.delete(toRef(r)); },
    commit: ()              => batch.commit(),
  };
}

// ─── window.firebase (shim compat) ────────────────────────────────────────────
// script.js y auth.js siguen usando window.firebase.firestore(), etc.
// Este shim los atiende sin que esos archivos necesiten cambios estructurales.
const firebaseShim = {
  firestore: () => ({ collection: (name) => mkCol(name), batch: () => mkBatch() }),
  auth:      () => auth,
  storage:   () => mkStorage(),
};

// Estáticos usados como firebase.firestore.FieldValue.serverTimestamp()
// y firebase.auth.EmailAuthProvider / firebase.auth.GoogleAuthProvider
firebaseShim.firestore.FieldValue    = { serverTimestamp };
firebaseShim.auth.EmailAuthProvider  = EmailAuthProvider;
firebaseShim.auth.GoogleAuthProvider = GoogleAuthProvider;

window.firebase = firebaseShim;

// ─── Instancias directas ──────────────────────────────────────────────────────
window._fbApp     = app;
window._fbAuth    = auth;
window._fbDb      = db;
window._fbStorage = storage;

// ─── API modular para auth.js ─────────────────────────────────────────────────
// auth.js llama a window._fb.* en lugar de los métodos de instancia del SDK compat.
window._fb = {
  onAuthStateChanged:             (cb)       => onAuthStateChanged(auth, cb),
  createUserWithEmailAndPassword: (e, p)     => createUserWithEmailAndPassword(auth, e, p),
  signInWithEmailAndPassword:     (e, p)     => signInWithEmailAndPassword(auth, e, p),
  signOut:                        ()         => signOut(auth),
  sendPasswordResetEmail:         (e)        => sendPasswordResetEmail(auth, e),
  updateProfile:                  (u, d)     => updateProfile(u, d),
  reauthenticateWithCredential:   (u, c)     => reauthenticateWithCredential(u, c),
  updatePassword:                 (u, p)     => updatePassword(u, p),
  signInWithPopup:                (prov)     => signInWithPopup(auth, prov),
};
