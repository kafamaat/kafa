import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBxmhx7wRReWw5x7UfLO1n3OK9JfAMnsTw",
  authDomain: "recruitmen-2cc3d.firebaseapp.com",
  projectId: "recruitmen-2cc3d",
  storageBucket: "recruitmen-2cc3d.firebasestorage.app",
  messagingSenderId: "664767825491",
  appId: "1:664767825491:web:80bc3ef049c02dd75828a6",
  measurementId: "G-YB73966R7W"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
