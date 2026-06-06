import { app } from "./app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let allExpenses = [];
let chart = null;
let barChart = null;

// --- FIXED CATEGORY COLORS (used by both pie and bar)
const CATEGORY_COLORS = {
    Food: "#4caf50",
    Travel: "#2196f3",
    Shopping: "#ff9800",
    Bills: "#9c27b0",
    Entertainment: "#e91e63",
    Health: "#f44336",
    Groceries: "#8bc34a",
    Education: "#3f51b5",
    Other: "#607d8b"
};

// CHECK LOGIN
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        currentUser = user.uid;
        loadBudget();
        loadExpenses();
    }
});

// ------------------------------
// 🔹 SAVE BUDGET
// ------------------------------
window.saveBudget = async function () {
    const budget = Number(document.getElementById("budgetInput").value);

    if (!budget || budget <= 0) {
        alert("Enter a valid budget amount");
        return;
    }

    await setDoc(doc(db, `users/${currentUser}/budget`, "budgetData"), {
        totalBudget: budget
    });

    document.getElementById("budgetInput").value = "";
    loadBudget();
};

// ------------------------------
// 🔹 LOAD BUDGET
// ------------------------------
async function loadBudget() {
    const ref = doc(db, `users/${currentUser}/budget`, "budgetData");
    const snap = await getDoc(ref);

    if (snap.exists()) {
        const budget = snap.data().totalBudget;
        document.getElementById("totalBudget").innerText = budget;
        updateSummaryBoxes();
    } else {
        // Ensure UI shows 0 if none
        document.getElementById("totalBudget").innerText = 0;
        updateSummaryBoxes();
    }
}

// ------------------------------
// 🔹 ADD EXPENSE
// ------------------------------
window.addExpense = async function () {
    let title = document.getElementById("title").value;
    let amount = document.getElementById("amount").value;
    let category = document.getElementById("category").value;

    if (title === "" || amount === "" || !category) {
        alert("Please enter all fields");
        return;
    }

    await addDoc(collection(db, `users/${currentUser}/expenses`), {
        title,
        amount: Number(amount),
        category,
        date: new Date().toLocaleString()
    });

    document.getElementById("title").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
};

// ------------------------------
// 🔹 LOAD EXPENSES REAL-TIME
// ------------------------------
function loadExpenses() {
    const q = collection(db, `users/${currentUser}/expenses`);

    onSnapshot(q, snapshot => {
        allExpenses = [];
        snapshot.forEach(docu => {
            allExpenses.push({ id: docu.id, ...docu.data() });
        });

        applyFilters();
        updateSummaryBoxes();
    });
}

// ------------------------------
// 🔹 CALCULATE TOTAL EXPENSES
// ------------------------------
function calculateTotalExpenses(filteredList = allExpenses) {
    return filteredList.reduce((sum, item) => sum + Number(item.amount), 0);
}

// ------------------------------
// 🔹 UPDATE SUMMARY BOXES
// ------------------------------
function updateSummaryBoxes() {
    const totalBudget = Number(document.getElementById("totalBudget").innerText || 0);
    const totalExpenses = calculateTotalExpenses();

    document.getElementById("totalExpenses").innerText = totalExpenses;
    document.getElementById("budgetLeft").innerText = (totalBudget - totalExpenses).toFixed(2);
}

// ------------------------------
// 🔹 FILTER EXPENSES
// ------------------------------
window.applyFilters = function () {
    const categoryFilter = document.getElementById("filterCategory").value;

    let filtered = [...allExpenses];

    if (categoryFilter !== "All") {
        filtered = filtered.filter(item => item.category === categoryFilter);
    }

    renderTable(filtered);
    renderChartData(filtered);   // PIE CHART
    renderBarChart(filtered);    // BAR CHART (important)
    updateSummaryBoxes();
};

// ------------------------------
// 🔹 RENDER TABLE
// ------------------------------
function renderTable(expenses) {
    let tableHTML = "";

    expenses.forEach(d => {
        tableHTML += `
            <tr>
                <td>${d.title}</td>
                <td>${d.amount}</td>
                <td>${d.category}</td>
                <td>${d.date}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteExpense('${d.id}')">X</button>
                </td>
            </tr>
        `;
    });

    document.getElementById("expenseTable").innerHTML = tableHTML;
}

// ------------------------------
// 🔹 PIE CHART
// ------------------------------
function renderChartData(expenses) {
    let chartData = {};

    expenses.forEach(d => {
        chartData[d.category] = (chartData[d.category] || 0) + d.amount;
    });

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("expenseChart"), {
        type: "pie",
        data: {
            labels: Object.keys(chartData),
            datasets: [{
                data: Object.values(chartData),
                backgroundColor: Object.keys(chartData).map(cat => CATEGORY_COLORS[cat] || "#cccccc")
            }]
        },
        options: {
            plugins: {
                legend: { labels: { color: "#000000ff" } }
            }
        }
    });
}

// ------------------------------
// ◆ BAR CHART
// ------------------------------
function renderBarChart(expenses) {
    let barData = {};

    // Group expenses by category
    expenses.forEach(d => {
        barData[d.category] = (barData[d.category] || 0) + d.amount;
    });

    // Destroy old chart if exists
    if (barChart) barChart.destroy();

    // Create Bar Chart
    barChart = new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
            labels: Object.keys(barData),
            datasets: [{
                label: "Expenses",
                data: Object.values(barData),
                backgroundColor: Object.keys(barData).map(cat => CATEGORY_COLORS[cat] || "#cccccc"),
                borderColor: "#fff",
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    ticks: { color: "#fff" },
                    beginAtZero: true
                },
                x: {
                    ticks: { color: "#fff" }
                }
            }
        }
    });
}

// ------------------------------
// 🔹 DELETE EXPENSE
// ------------------------------
window.deleteExpense = async function (id) {
    await deleteDoc(doc(db, `users/${currentUser}/expenses`, id));
};

// ------------------------------
// 🔹 LOGOUT
// ------------------------------
window.logout = function () {
    signOut(auth);
    window.location.href = "login.html";
};
