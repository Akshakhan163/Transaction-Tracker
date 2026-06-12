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

let transactions =
JSON.parse(localStorage.getItem("transactions")) || [];


// ---------------------
// SECURITY FUNCTIONS
// ---------------------

function sanitizeInput(input) {

    return input
        .trim()
        .replace(/[<>]/g, "");
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

    const transactionName =
    sanitizeInput(text.value);

    const transactionAmount =
    Number(amount.value);

    const transactionDate =
    date.value;

    if (
        !validateTransaction(
            transactionName,
            transactionAmount,
            transactionDate
        )
    ) {
        return;
    }

    const selectedType =
    document.querySelector(
        'input[name="type"]:checked'
    ).value;

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

    form.reset();

});


// ---------------------
// SAVE TO LOCAL STORAGE
// ---------------------

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}


// ---------------------
// DISPLAY TRANSACTIONS
// ---------------------

function displayTransactions() {

    transactionList.innerHTML = "";

    let filteredTransactions = [...transactions];

    // Search

    const searchValue =
    search.value.toLowerCase();

    filteredTransactions =
    filteredTransactions.filter(transaction =>
        transaction.text
        .toLowerCase()
        .includes(searchValue)
    );

    // Filter

    if (filter.value !== "all") {

        filteredTransactions =
        filteredTransactions.filter(transaction =>
            transaction.type === filter.value
        );
    }

    filteredTransactions.forEach(transaction => {

        const row =
        document.createElement("tr");

        row.innerHTML = `

        <td>${transaction.text}</td>

        <td>₹${transaction.amount}</td>

        <td>${transaction.category}</td>

        <td>${transaction.type}</td>

        <td>${transaction.date}</td>

        <td>

        <button
        class="delete-btn"
        onclick="deleteTransaction(${transaction.id})">

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

    const confirmDelete =
    confirm("Delete this transaction?");

    if (!confirmDelete) return;

    transactions =
    transactions.filter(transaction =>
        transaction.id !== id
    );

    saveTransactions();

    displayTransactions();

    updateBalance();

}


// ---------------------
// UPDATE BALANCE
// ---------------------

function updateBalance() {

    const incomeAmount =
    transactions
    .filter(transaction =>
        transaction.type === "income"
    )
    .reduce(
        (total, transaction) =>
        total + transaction.amount,
        0
    );

    const expenseAmount =
    transactions
    .filter(transaction =>
        transaction.type === "expense"
    )
    .reduce(
        (total, transaction) =>
        total + transaction.amount,
        0
    );

    const totalBalance =
    incomeAmount - expenseAmount;

    balance.innerText =
    `₹${totalBalance}`;

    income.innerText =
    `₹${incomeAmount}`;

    expense.innerText =
    `₹${expenseAmount}`;

    monthlyIncome.innerText =
    `₹${incomeAmount}`;

    monthlyExpense.innerText =
    `₹${expenseAmount}`;

    monthlySaving.innerText =
    `₹${totalBalance}`;
}


// ---------------------
// SEARCH
// ---------------------

search.addEventListener(
    "input",
    displayTransactions
);


// ---------------------
// FILTER
// ---------------------

filter.addEventListener(
    "change",
    displayTransactions
);


// ---------------------
// INITIAL LOAD
// ---------------------

displayTransactions();

updateBalance();