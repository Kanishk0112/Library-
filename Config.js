import * as firebase from "firebase"
require("@firebase/firestore")
var firebaseConfig = {
    apiKey: "AIzaSyACPSpWc0K1sF898HvKyD2SIplIky6Lhhw",
    authDomain: "library-11dff.firebaseapp.com",
    projectId: "library-11dff",
    storageBucket: "library-11dff.appspot.com",
    messagingSenderId: "276835060768",
    appId: "1:276835060768:web:684eb43acfe590af7ec045"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore();