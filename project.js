// Select Elements
const form = document.getElementById("transaction-form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const date = document.getElementById("date");

const transactionList = document.getElementById("transaction-list");

const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

const monthlyIncome = document.getElementById("monthly-income");
const monthlyExpense = document.getElementById("monthly-expense");
const monthlySaving = document.getElementById("monthly-saving");

const search = document.getElementById("search");
const filter = document.getElementById("filter");

// Load Transactions
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chart; // Global chart instance variable

// ---------------------
// SECURITY FUNCTIONS
// ---------------------
function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, "");
}

function validateTransaction(name, amount, date) {
    if (name.length < 2) {
        alert("Transaction name must contain at least 2 characters.");
        return false;
    }
    if (isNaN(amount) || amount <= 0) {
        alert("Amount must be greater than 0.");
        return false;
    }
    if (!date) {
        alert("Please select a date.");
        return false;
    }
    return true;
}

// ---------------------
// ADD TRANSACTION
// ---------------------
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const transactionName = sanitizeInput(text.value);
    const transactionAmount = Number(amount.value);
    const transactionDate = date.value;

    if (!validateTransaction(transactionName, transactionAmount, transactionDate)) {
        return;
    }

    const selectedType = document.querySelector('input[name="type"]:checked').value;

    const transaction = {
        id: Date.now(),
        text: transactionName,
        amount: transactionAmount,
        category: category.value,
        type: selectedType,
        date: transactionDate
    };

    transactions.push(transaction);
    saveTransactions();
    displayTransactions();
    updateBalance();
    updateChart(); // Added: Keep chart updated on fresh entry
    form.reset();
});

// ---------------------
// SAVE TO LOCAL STORAGE
// ---------------------
function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ---------------------
// DISPLAY TRANSACTIONS
// ---------------------
function displayTransactions() {
    transactionList.innerHTML = "";
    let filteredTransactions = [...transactions];

    // Search
    const searchValue = search.value.toLowerCase();
    filteredTransactions = filteredTransactions.filter(transaction =>
        transaction.text.toLowerCase().includes(searchValue)
    );

    // Filter
    if (filter.value !== "all") {
        filteredTransactions = filteredTransactions.filter(transaction =>
            transaction.type === filter.value
        );
    }

    filteredTransactions.forEach(transaction => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transaction.text}</td>
            <td>₹${transaction.amount}</td>
            <td>${transaction.category}</td>
            <td>${transaction.type}</td>
            <td>${transaction.date}</td>
            <td>
                <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">
                    Delete
                </button>
            </td>
        `;
        transactionList.appendChild(row);
    });
}

// ---------------------
// DELETE TRANSACTION
// ---------------------
function deleteTransaction(id) {
    const confirmDelete = confirm("Delete this transaction?");
    if (!confirmDelete) return;

    transactions = transactions.filter(transaction => transaction.id !== id);

    saveTransactions();
    displayTransactions();
    updateBalance();
    updateChart(); // Added: Keep chart updated on item deletion
}

// ---------------------
// UPDATE BALANCE
// ---------------------
function updateBalance() {
    const incomeAmount = transactions
        .filter(transaction => transaction.type === "income")
        .reduce((total, transaction) => total + transaction.amount, 0);

    const expenseAmount = transactions
        .filter(transaction => transaction.type === "expense")
        .reduce((total, transaction) => total + transaction.amount, 0);

    const totalBalance = incomeAmount - expenseAmount;

    balance.innerText = `₹${totalBalance}`;
    income.innerText = `₹${incomeAmount}`;
    expense.innerText = `₹${expenseAmount}`;

    // Fixed: Keeping these UI elements updated safely inside scope
    if (monthlyIncome) monthlyIncome.innerText = `₹${incomeAmount}`;
    if (monthlyExpense) monthlyExpense.innerText = `₹${expenseAmount}`;
    if (monthlySaving) monthlySaving.innerText = `₹${totalBalance}`;
}

// ---------------------
// UPDATE CHART
// ---------------------
function updateChart() {
    const categoryTotals = {};

    transactions
        .filter(transaction => transaction.type === "expense")
        .forEach(transaction => {
            if (categoryTotals[transaction.category]) {
                categoryTotals[transaction.category] += transaction.amount;
            } else {
                categoryTotals[transaction.category] = transaction.amount;
            }
        });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const ctx = document.getElementById("expenseChart");

    // Safety check: ensure canvas exists in HTML before rendering Chart.js
    if (!ctx) return; 

    if (chart) {
        chart.destroy();
    }

    // If there are no expenses, don't initialize an empty chart artifact
    if (data.length === 0) {
        return;
    }

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    "#38bdf8",
                    "#22c55e",
                    "#f97316",
                    "#ef4444",
                    "#a855f7",
                    "#eab308"
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: "white"
                    }
                }
            }
        }
    });
}

// ---------------------
// SEARCH & FILTER EVENTS
// ---------------------
search.addEventListener("input", displayTransactions);
filter.addEventListener("change", displayTransactions);

// ---------------------
// INITIAL LOAD RUNNER
// ---------------------
displayTransactions();
updateBalance();
updateChart(); // Added: Visualizes pie chart on application boot up