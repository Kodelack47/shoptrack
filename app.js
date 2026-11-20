/* Author: Ousmana Tunkara · github.com/Kodelack47 · ShopTrack */
/*
 * ShopTrack prototype - Add/Edit/Delete Product Listings (FR1 / US1)
 *
 * Split into three small pieces on purpose, mostly so the code stays easy to
 * change later:
 *   - ProductRepository: owns the data and talks to localStorage
 *   - validateProduct:   pure function, no DOM or storage code in it
 *   - ProductController: wires the form + table to the repository
 *
 * This is a client-only prototype. There's no real backend here - the
 * "server" is just the browser's localStorage, which is fine for a
 * prototype but would need to be swapped for a real API + database
 * before this could support more than one user.
 */

// ---------- Data model ----------
function makeId() {
  return "p_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

function makeProduct({ id, sku, name, price, quantity }) {
  return {
    id: id || makeId(),
    sku: sku.trim(),
    name: name.trim(),
    price: Number(price),
    quantity: Number(quantity),
  };
}

// ---------- Repository (storage layer) ----------
const ProductRepository = (function () {
  const STORAGE_KEY = "shoptrack_products";

  function readAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  function writeAll(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  return {
    getAll() {
      return readAll();
    },
    findBySku(sku, excludeId) {
      return readAll().find(
        (p) => p.sku.toLowerCase() === sku.toLowerCase() && p.id !== excludeId
      );
    },
    add(product) {
      const products = readAll();
      products.push(product);
      writeAll(products);
    },
    update(id, changes) {
      const products = readAll().map((p) =>
        p.id === id ? { ...p, ...changes } : p
      );
      writeAll(products);
    },
    remove(id) {
      const products = readAll().filter((p) => p.id !== id);
      writeAll(products);
    },
  };
})();

// ---------- Validation (pure function - no DOM, no storage) ----------
function validateProduct({ sku, name, price, quantity }, existingId) {
  const errors = {};

  if (!sku || !sku.trim()) {
    errors.sku = "SKU is required.";
  } else if (ProductRepository.findBySku(sku, existingId)) {
    errors.sku = "That SKU is already in use.";
  }

  if (!name || !name.trim()) {
    errors.name = "Product name is required.";
  }

  if (price === "" || price === null || isNaN(price) || Number(price) < 0) {
    errors.price = "Price must be a number of 0 or more.";
  }

  if (
    quantity === "" ||
    quantity === null ||
    isNaN(quantity) ||
    Number(quantity) < 0
  ) {
    errors.quantity = "Quantity must be a whole number of 0 or more.";
  }

  return errors;
}

// ---------- Controller (wires the DOM to the repository) ----------
const ProductController = (function () {
  const form = document.getElementById("productForm");
  const idField = document.getElementById("productId");
  const skuField = document.getElementById("sku");
  const nameField = document.getElementById("name");
  const priceField = document.getElementById("price");
  const quantityField = document.getElementById("quantity");
  const submitBtn = document.getElementById("submitBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const formTitle = document.getElementById("formTitle");
  const formMessage = document.getElementById("formMessage");
  const tableBody = document.getElementById("productTableBody");
  const emptyState = document.getElementById("emptyState");

  function clearErrors() {
    ["sku", "name", "price", "quantity"].forEach((field) => {
      document.getElementById(field + "Error").textContent = "";
      document.getElementById(field).classList.remove("invalid");
    });
    formMessage.textContent = "";
    formMessage.className = "formMessage";
  }

  function showErrors(errors) {
    Object.keys(errors).forEach((field) => {
      document.getElementById(field + "Error").textContent = errors[field];
      document.getElementById(field).classList.add("invalid");
    });
  }

  function resetForm() {
    form.reset();
    idField.value = "";
    formTitle.textContent = "Add a Product";
    submitBtn.textContent = "Add Product";
    cancelBtn.hidden = true;
    clearErrors();
  }

  function startEdit(product) {
    idField.value = product.id;
    skuField.value = product.sku;
    nameField.value = product.name;
    priceField.value = product.price;
    quantityField.value = product.quantity;
    formTitle.textContent = "Edit Product";
    submitBtn.textContent = "Save Changes";
    cancelBtn.hidden = false;
    clearErrors();
    skuField.focus();
  }

  function render() {
    const products = ProductRepository.getAll();
    tableBody.innerHTML = "";
    emptyState.hidden = products.length > 0;

    products.forEach((product) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(product.sku)}</td>
        <td>${escapeHtml(product.name)}</td>
        <td>$${Number(product.price).toFixed(2)}</td>
        <td>${product.quantity}</td>
        <td class="actions">
          <button class="editBtn" data-id="${product.id}">Edit</button>
          <button class="deleteBtn" data-id="${product.id}">Delete</button>
        </td>`;
      tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll(".editBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const product = ProductRepository.getAll().find(
          (p) => p.id === btn.dataset.id
        );
        if (product) startEdit(product);
      });
    });

    tableBody.querySelectorAll(".deleteBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        ProductRepository.remove(btn.dataset.id);
        render();
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function handleSubmit(event) {
    event.preventDefault();
    clearErrors();

    const editingId = idField.value || undefined;
    const draft = {
      sku: skuField.value,
      name: nameField.value,
      price: priceField.value,
      quantity: quantityField.value,
    };

    const errors = validateProduct(draft, editingId);
    if (Object.keys(errors).length > 0) {
      showErrors(errors);
      formMessage.textContent = "Please fix the highlighted fields.";
      formMessage.className = "formMessage error";
      return;
    }

    const product = makeProduct({ id: editingId, ...draft });

    if (editingId) {
      ProductRepository.update(editingId, product);
      formMessage.textContent = "Product updated.";
    } else {
      ProductRepository.add(product);
      formMessage.textContent = "Product added.";
    }
    formMessage.className = "formMessage success";

    resetForm();
    render();
  }

  function init() {
    form.addEventListener("submit", handleSubmit);
    cancelBtn.addEventListener("click", resetForm);
    render();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", ProductController.init);
