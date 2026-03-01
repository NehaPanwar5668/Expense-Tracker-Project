const API_URL = "http://localhost:8081/expenses";
let allExpenses = [];

document.addEventListener("DOMContentLoaded", loadAllExpenses);

async function sendRequest(url, method = "GET", body = null) {
    const options = { method };

    if (body) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Request failed");

    return method === "DELETE" ? null : response.json();
}

async function loadAllExpenses() {
    try {
        document.getElementById("filterUpi").value = "";
        const data = await fetch(API_URL);
        allExpenses = await data.json();
        displayExpenses(allExpenses);
    } catch (error) {
        console.error(error);
    }
}

async function loadExpenses() {
    const upi = document.getElementById("filterUpi").value.trim();
    if (!upi) return alert("Enter UPI ID");

    try {
        const response = await fetch(`${API_URL}/upi/${upi}`);
        const data = await response.json();
        displayExpenses(data);
    } catch (error) {
        console.error(error);
    }
}

async function addExpense() {
    const amount = document.getElementById("amount").value;
    const description = document.getElementById("description").value;
    const recipientName = document.getElementById("recipientName").value;
    const recipientUpiId = document.getElementById("recipientUpi").value;

    if (!amount || !description || !recipientName || !recipientUpiId)
        return alert("Fill all fields");

    const expense = {
        amount: parseFloat(amount),
        description,
        recipientName,
        recipientUpiId
    };

    try {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expense)
        });

        clearForm();
        loadAllExpenses();
    } catch (error) {
        console.error(error);
    }
}

async function deleteExpense(id) {
    if (!confirm("Delete this expense?")) return;

    try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        loadAllExpenses();
    } catch (error) {
        console.error(error);
    }
}

function openUpdateModal(id) {
    const expense = allExpenses.find(e => e.id === id);
    if (!expense) return;

    document.getElementById("updateId").value = expense.id;
    document.getElementById("updateAmount").value = expense.amount;
    document.getElementById("updateDescription").value = expense.description;
    document.getElementById("updateRecipientName").value = expense.recipientName;
    document.getElementById("updateRecipientUpi").value = expense.recipientUpiId;

    document.getElementById("updateModal").style.display = "block";
}

function closeModal() {
    document.getElementById("updateModal").style.display = "none";
}


async function updateExpense() {
    const id = document.getElementById("updateId").value;

    const expense = {
        amount: parseFloat(document.getElementById("updateAmount").value),
        description: document.getElementById("updateDescription").value,
        recipientName: document.getElementById("updateRecipientName").value,
        recipientUpiId: document.getElementById("updateRecipientUpi").value
    };

    try {
        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expense)
        });

        closeModal();
        loadAllExpenses();
    } catch (error) {
        console.error(error);
    }
}

function displayExpenses(expenses) {
    const tableBody = document.getElementById("expenseTable");
    tableBody.innerHTML = "";

    if (!expenses.length) {
        tableBody.innerHTML =
            '<tr><td colspan="6" style="text-align:center;">No expenses found</td></tr>';
        document.getElementById("totalAmount").textContent = "₹0.00";
        return;
    }

    let total = 0;
    expenses.forEach(expense => {
        total += expense.amount;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${expense.date || "N/A"}</td>
            <td>${expense.description}</td>
            <td>${expense.recipientName}</td>
            <td>${expense.recipientUpiId}</td>
            <td>₹${expense.amount.toFixed(2)}</td>
            <td>
                <button onclick="openUpdateModal('${expense.id}')">Update</button>
                <button onclick="deleteExpense('${expense.id}')">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    document.getElementById("totalAmount").textContent =
        `₹${total.toFixed(2)}`;
}

function clearForm() {
    ["amount", "description", "recipientName", "recipientUpi"]
        .forEach(id => document.getElementById(id).value = "");
}