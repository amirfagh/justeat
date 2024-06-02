import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDfJ9W7P7Z4XivaRqoVGktPJaPz8A9BXIk",
  authDomain: "just-eat-63f9f.firebaseapp.com",
  projectId: "just-eat-63f9f",
  storageBucket: "just-eat-63f9f",
  messagingSenderId: "623577717263",
  appId: "1:623577717263:web:fa996529c21a584fbe217a",
  measurementId: "G-NREMK4JEV7",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
export { firebaseConfig };
