"use strict";

// Transactions are stored only in this browser.
const STORAGE_KEY = "catatan-pengeluaran.transactions.v1";

const form = document.getElementById("tx-form");
const listEl = document.getElementById("tx-list");
const emptyEl = document.getElementById("empty-state");
const filterEl = document.getElementById("filter-category");
const balanceEl = document.getElementById("total-balance");
const incomeEl = document.getElementById("total-income");
const expenseEl = document.getElementById("total-expense");
const categorySummaryEl = document.getElementById("category-summary");
const dateInput = document.getElementById("tx-date");

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function loadTransactions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

let transactions = loadTransactions();

function formatDate(isoDate) {
  const date = new Date(isoDate + "T00:00:00");
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function render() {
  const filter = filterEl.value;
  const visible = transactions.filter(
    (tx) => filter === "all" || tx.category === filter
  );

  listEl.innerHTML = "";
  emptyEl.style.display = visible.length ? "none" : "block";
  emptyEl.textContent = transactions.length
    ? "Tidak ada transaksi pada kategori ini."
    : "Belum ada transaksi. Tambahkan transaksi pertama lewat formulir di atas.";

  // Newest first: by date, then by insertion order.
  const sorted = [...visible].sort((a, b) =>
    a.date === b.date ? b.id - a.id : b.date.localeCompare(a.date)
  );

  for (const tx of sorted) {
    const item = document.createElement("li");
    item.className = "tx-item";

    const main = document.createElement("div");
    main.className = "tx-main";
    const name = document.createElement("span");
    name.className = "tx-name";
    name.textContent = tx.name;
    const meta = document.createElement("span");
    meta.className = "tx-meta";
    meta.textContent = tx.category + " · " + formatDate(tx.date);
    main.append(name, meta);

    const amount = document.createElement("span");
    amount.className = "tx-amount " + (tx.type === "income" ? "in" : "out");
    amount.textContent =
      (tx.type === "income" ? "+ " : "- ") + rupiah.format(tx.amount);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "btn-delete";
    del.textContent = "Hapus";
    del.setAttribute("aria-label", "Hapus transaksi " + tx.name);
    del.addEventListener("click", () => {
      transactions = transactions.filter((t) => t.id !== tx.id);
      saveTransactions();
      render();
    });

    item.append(main, amount, del);
    listEl.appendChild(item);
  }

  const income = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expense = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  balanceEl.textContent = rupiah.format(income - expense);
  incomeEl.textContent = rupiah.format(income);
  expenseEl.textContent = rupiah.format(expense);

  renderCategorySummary(expense);
}

function renderCategorySummary(totalExpense) {
  categorySummaryEl.innerHTML = "";
  if (!totalExpense) {
    const p = document.createElement("p");
    p.className = "cat-empty";
    p.textContent = "Belum ada pengeluaran untuk diringkas.";
    categorySummaryEl.appendChild(p);
    return;
  }
  const perCategory = new Map();
  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    perCategory.set(tx.category, (perCategory.get(tx.category) || 0) + tx.amount);
  }
  const rows = [...perCategory.entries()].sort((a, b) => b[1] - a[1]);
  for (const [category, total] of rows) {
    const row = document.createElement("div");
    row.className = "cat-row";
    const line = document.createElement("div");
    line.className = "cat-line";
    const label = document.createElement("span");
    label.textContent = category;
    const value = document.createElement("span");
    value.textContent = rupiah.format(total);
    line.append(label, value);
    const bar = document.createElement("div");
    bar.className = "cat-bar";
    const fill = document.createElement("div");
    fill.className = "cat-fill";
    fill.style.width = Math.max(2, Math.round((total / totalExpense) * 100)) + "%";
    bar.appendChild(fill);
    row.append(line, bar);
    categorySummaryEl.appendChild(row);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const amount = Number(data.get("amount"));
  if (!data.get("name") || !amount || amount <= 0) return;
  transactions.push({
    id: Date.now(),
    name: String(data.get("name")).trim(),
    amount,
    date: String(data.get("date")),
    type: String(data.get("type")),
    category: String(data.get("category")),
  });
  saveTransactions();
  form.reset();
  dateInput.value = new Date().toISOString().slice(0, 10);
  render();
});

filterEl.addEventListener("change", render);

dateInput.value = new Date().toISOString().slice(0, 10);
render();
