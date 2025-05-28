import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAxQEbSBtaSwO76yNhHpGst63jWZkqkzxE",
  authDomain: "potros-632ee.firebaseapp.com",
  projectId: "potros-632ee",
  storageBucket: "potros-632ee.firebasestorage.app",
  messagingSenderId: "715399204517",
  appId: "1:715399204517:web:6f82c57e723c47931b074c"
};


if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };