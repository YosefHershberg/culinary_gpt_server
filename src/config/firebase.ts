import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
    apiKey: "AIzaSyAoSfmgkyzsgPYoC3g7Vt-WJXuq_yCVS34",
    authDomain: "culinary-gpt-136d6.firebaseapp.com",
    projectId: "culinary-gpt-136d6",
    storageBucket: "culinary-gpt-136d6.appspot.com",
    messagingSenderId: "350212238307",
    appId: "1:350212238307:web:d6438513b92ee5f3cc8ed6"
};

const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;