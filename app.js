import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js"; 

const firebaseConfig = {
  apiKey: "AIzaSyAZrZnfBGVZInDOOT9KVjh770Xzgxo55hw",
  authDomain: "expensetracker-d2c0f.firebaseapp.com",
  projectId: "expensetracker-d2c0f",
  storageBucket: "expensetracker-d2c0f.firebasestorage.app",
  messagingSenderId: "888009953372",
  appId: "1:888009953372:web:c89ce627119acaa65a9699"
};

export const app = initializeApp(firebaseConfig);
