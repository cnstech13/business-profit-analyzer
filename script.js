/* =========================================================
   BUSINESS PROFIT ANALYZER
   Main JavaScript
   ========================================================= */

const STORAGE_KEY = "businessProfitAnalyzerData";

const defaultData = {
    business: {
        name: "My Business",
        phone: "",
        address: ""
    },
    products: [],
    sales: [],
    expenses: [],
    customers: []
};

let appData = loadData();
let currentReportRange = "all";


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function getEl(id) {
    return document.getElementById(id);
}


function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return JSON.parse(JSON.stringify(defaultData));
        }

        const parsed = JSON.parse(saved);

        return {
            business: {
                ...defaultData.business,
                ...(parsed.business || {})
            },
            products: Array.isArray(parsed.products) ? parsed.products : [],
            sales: Array.isArray(parsed.sales) ? parsed.sales : [],
            expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
            customers: Array.isArray(parsed.customers)
                ? parsed.customers
                : []
        };

    } catch (error) {
        console.error("Could not load saved data:", error);
        return JSON.parse(JSON.stringify(defaultData));
    }
}


function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );
}


function generateId(prefix = "ID") {
    return (
        prefix +
        "_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


function formatMoney(value) {
    const number = Number(value) || 0;

    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2
    }).format(number);
}


function formatNumber(value) {
    return new Intl.NumberFormat("en-NG").format(
        Number(value) || 0
    );
}


function formatDate(dateValue) {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getTodayStart() {
    const date = new Date();

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}


function getDateValue(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}


/* =========================================================
   SWEETALERT HELPERS
   ========================================================= */

function showSuccess(message) {
    if (typeof Swal !== "undefined") {
        Swal.fire({
            icon: "success",
            title: "Success",
            text: message,
            confirmButtonColor: "#0b1f3a"
        });
    } else {
        alert(message);
    }
}


function showError(message) {
    if (typeof Swal !== "undefined") {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: message,
            confirmButtonColor: "#0b1f3a"
        });
    } else {
        alert(message);
    }
}


function showWarning(message) {
    if (typeof Swal !== "undefined") {
        Swal.fire({
            icon: "warning",
            title: "Notice",
            text: message,
            confirmButtonColor: "#0b1f3a"
        });
    } else {
        alert(message);
    }
}


function showToast(message, icon = "success") {
    if (typeof Swal !== "undefined") {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon,
            title: message,
            showConfirmButton: false,
            timer: 2200,
            timerProgressBar: true
        });
    }
}


async function showConfirm(title, text) {
    if (typeof Swal === "undefined") {
        return confirm(text);
    }

    const result = await Swal.fire({
        icon: "warning",
        title,
        text,
        showCancelButton: true,
        confirmButtonText: "Yes, continue",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#0b1f3a",
        cancelButtonColor: "#777"
    });

    return result.isConfirmed;
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showPage(pageName) {
    const pages = document.querySelectorAll(".page");
    const navItems = document.querySelectorAll(".nav-item");

    pages.forEach(page => {
        page.classList.remove("active");
    });

    navItems.forEach(item => {
        item.classList.remove("active");
    });

    const selectedPage = getEl(pageName + "Page");

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    const selectedNav = document.querySelector(
        `.nav-item[data-page="${pageName}"]`
    );

    if (selectedNav) {
        selectedNav.classList.add("active");
    }

    updatePageHeader(pageName);

    closeMobileMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function updatePageHeader(pageName) {
    const pageTitle = getEl("pageTitle");
    const pageSubtitle = getEl("pageSubtitle");

    const titles = {
        dashboard: {
            title: "Dashboard",
            subtitle: "Overview of your business performance"
        },
        products: {
            title: "Products",
            subtitle: "Manage your products and inventory"
        },
        sales: {
            title: "Sales",
            subtitle: "Record and monitor your sales"
        },
        expenses: {
            title: "Expenses",
            subtitle: "Track your business expenses"
        },
        customers: {
            title: "Customers",
            subtitle: "Manage your customer information"
        },
        reports: {
            title: "Reports",
            subtitle: "Analyze your business performance"
        },
        settings: {
            title: "Settings",
            subtitle: "Manage your business information and data"
        }
    };

    const info = titles[pageName] || titles.dashboard;

    if (pageTitle) {
        pageTitle.textContent = info.title;
    }

    if (pageSubtitle) {
        pageSubtitle.textContent = info.subtitle;
    }
}


function openModal(modalId) {
    const modal = getEl(modalId);

    if (modal) {
        modal.classList.add("active");
    }
}


function closeModal(modalId) {
    const modal = getEl(modalId);

    if (modal) {
        modal.classList.remove("active");
    }
}


function closeAllModals() {
    document.querySelectorAll(".modal").forEach(modal => {
        modal.classList.remove("active");
    });
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function toggleMobileMenu() {
    const sidebar = getEl("sidebar");
    const menuToggle = getEl("menuToggle");

    if (!sidebar) return;

    sidebar.classList.toggle("mobile-open");

    if (menuToggle) {
        const isOpen = sidebar.classList.contains("mobile-open");

        menuToggle.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );
    }
}


function closeMobileMenu() {
    const sidebar = getEl("sidebar");
    const menuToggle = getEl("menuToggle");

    if (sidebar) {
        sidebar.classList.remove("mobile-open");
    }

    if (menuToggle) {
        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );
    }
}


/* =========================================================
   PRODUCT HELPERS
   ========================================================= */

function getProductStatus(product) {
    const stock = Number(product.stock) || 0;
    const lowLevel = Number(product.lowStockLevel) || 0;

    if (stock <= 0) {
        return {
            text: "Out of Stock",
            className: "danger"
        };
    }

    if (stock <= lowLevel) {
        return {
            text: "Low Stock",
            className: "warning"
        };
    }

    return {
        text: "In Stock",
        className: "success"
    };
}


function getProductById(id) {
    return appData.products.find(
        product => product.id === id
    );
}


function findProductByName(name) {
    const searchName = String(name)
        .trim()
        .toLowerCase();

    return appData.products.find(
        product =>
            String(product.name)
                .trim()
                .toLowerCase() === searchName
    );
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function calculateTotals() {
    const totalSales = appData.sales.reduce(
        (sum, sale) => sum + Number(sale.revenue || 0),
        0
    );

    const totalCost = appData.sales.reduce(
        (sum, sale) => sum + Number(sale.cost || 0),
        0
    );

    const grossProfit = appData.sales.reduce(
        (sum, sale) => sum + Number(sale.profit || 0),
        0
    );

    const totalExpenses = appData.expenses.reduce(
        (sum, expense) => sum + Number(expense.amount || 0),
        0
    );

    const netProfit = grossProfit - totalExpenses;

    const profitMargin =
        totalSales > 0
            ? (netProfit / totalSales) * 100
            : 0;

    return {
        totalSales,
        totalCost,
        grossProfit,
        totalExpenses,
        netProfit,
        profitMargin
    };
}


function renderDashboard() {
    const totals = calculateTotals();

    if (getEl("totalSales")) {
        getEl("totalSales").textContent =
            formatMoney(totals.totalSales);
    }

    if (getEl("totalCost")) {
        getEl("totalCost").textContent =
            formatMoney(totals.totalCost);
    }

    if (getEl("grossProfit")) {
        getEl("grossProfit").textContent =
            formatMoney(totals.grossProfit);
    }

    if (getEl("totalExpenses")) {
        getEl("totalExpenses").textContent =
            formatMoney(totals.totalExpenses);
    }

    if (getEl("netProfit")) {
        getEl("netProfit").textContent =
            formatMoney(totals.netProfit);
    }

    if (getEl("profitMargin")) {
        getEl("profitMargin").textContent =
            totals.profitMargin.toFixed(2) + "%";
    }

    renderRecentSales();
    renderLowStock();
    renderBusinessSummary();
}


function renderRecentSales() {
    const container = getEl("recentSalesContainer");

    if (!container) return;

    const sales = [...appData.sales]
        .sort(
            (a, b) =>
                new Date(b.date) - new Date(a.date)
        )
        .slice(0, 5);

    if (sales.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🛒</div>
                <h3>No sales yet</h3>
                <p>Your recent sales will appear here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = sales
        .map(sale => `
            <div class="list-row">
                <div>
                    <strong>${escapeHTML(sale.productName)}</strong>
                    <small>
                        ${formatDate(sale.date)}
                        • Qty: ${formatNumber(sale.quantity)}
                    </small>
                </div>

                <div class="list-value">
                    <strong>${formatMoney(sale.revenue)}</strong>
                    <small class="profit-text">
                        Profit: ${formatMoney(sale.profit)}
                    </small>
                </div>
            </div>
        `)
        .join("");
}


function renderLowStock() {
    const container = getEl("lowStockContainer");

    if (!container) return;

    const lowStockProducts = appData.products.filter(product => {
        const stock = Number(product.stock) || 0;
        const lowLevel = Number(product.lowStockLevel) || 0;

        return stock <= lowLevel;
    });

    if (lowStockProducts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✅</div>
                <h3>Stock levels are good</h3>
                <p>No products currently need restocking.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = lowStockProducts
        .map(product => {
            const status = getProductStatus(product);

            return `
                <div class="list-row">
                    <div>
                        <strong>${escapeHTML(product.name)}</strong>
                        <small>
                            ${escapeHTML(product.category || "Uncategorized")}
                        </small>
                    </div>

                    <div>
                        <span class="status-badge ${status.className}">
                            ${status.text}
                        </span>
                        <small>
                            ${formatNumber(product.stock)} left
                        </small>
                    </div>
                </div>
            `;
        })
        .join("");
}


function renderBusinessSummary() {
    const container = getEl("businessSummary");

    if (!container) return;

    const totalStock = appData.products.reduce(
        (sum, product) =>
            sum + Number(product.stock || 0),
        0
    );

    container.innerHTML = `
        <div class="summary-item">
            <span>Products</span>
            <strong>${formatNumber(appData.products.length)}</strong>
        </div>

        <div class="summary-item">
            <span>Stock Units</span>
            <strong>${formatNumber(totalStock)}</strong>
        </div>

        <div class="summary-item">
            <span>Customers</span>
            <strong>${formatNumber(appData.customers.length)}</strong>
        </div>

        <div class="summary-item">
            <span>Sales Transactions</span>
            <strong>${formatNumber(appData.sales.length)}</strong>
        </div>
    `;
}


/* =========================================================
   PRODUCTS
   ========================================================= */

function renderProducts() {
    const tbody = getEl("productsTableBody");

    if (!tbody) return;

    const searchInput = getEl("productSearch");

    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const products = appData.products.filter(product => {
        if (!searchTerm) return true;

        return (
            String(product.name)
                .toLowerCase()
                .includes(searchTerm) ||
            String(product.category || "")
                .toLowerCase()
                .includes(searchTerm)
        );
    });

    updateProductCounters();

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="empty-state">
                        <div class="empty-icon">📦</div>
                        <h3>No products found</h3>
                        <p>Add a product to start managing your inventory.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products
        .map(product => {
            const status = getProductStatus(product);
            const profit =
                Number(product.sellingPrice || 0) -
                Number(product.costPrice || 0);

            return `
                <tr>
                    <td>
                        <strong>${escapeHTML(product.name)}</strong>
                    </td>

                    <td>
                        ${escapeHTML(product.category || "-")}
                    </td>

                    <td>
                        ${formatMoney(product.costPrice)}
                    </td>

                    <td>
                        ${formatMoney(product.sellingPrice)}
                    </td>

                    <td>
                        <strong>${formatMoney(profit)}</strong>
                    </td>

                    <td>
                        ${formatNumber(product.stock)}
                    </td>

                    <td>
                        <span class="status-badge ${status.className}">
                            ${status.text}
                        </span>
                    </td>

                    <td>
                        <div class="table-actions">
                            <button
                                type="button"
                                class="action-btn edit"
                                data-action="edit-product"
                                data-id="${product.id}"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="action-btn delete"
                                data-action="delete-product"
                                data-id="${product.id}"
                            >
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        })
        .join("");
}


function updateProductCounters() {
    const totalProducts = appData.products.length;

    const totalStock = appData.products.reduce(
        (sum, product) =>
            sum + Number(product.stock || 0),
        0
    );

    const lowStock = appData.products.filter(product => {
        const stock = Number(product.stock) || 0;
        const lowLevel = Number(product.lowStockLevel) || 0;

        return stock > 0 && stock <= lowLevel;
    }).length;

    const outOfStock = appData.products.filter(
        product => Number(product.stock) <= 0
    ).length;

    if (getEl("productCount")) {
        getEl("productCount").textContent =
            formatNumber(totalProducts);
    }

    if (getEl("stockCount")) {
        getEl("stockCount").textContent =
            formatNumber(totalStock);
    }

    if (getEl("lowStockCount")) {
        getEl("lowStockCount").textContent =
            formatNumber(lowStock);
    }

    if (getEl("outStockCount")) {
        getEl("outStockCount").textContent =
            formatNumber(outOfStock);
    }
}


function openAddProductModal() {
    const form = getEl("productForm");

    if (form) {
        form.reset();
    }

    if (getEl("productId")) {
        getEl("productId").value = "";
    }

    const title = getEl("productModalTitle");

    if (title) {
        title.textContent = "Add Product";
    }

    openModal("productModal");
}


function openEditProductModal(productId) {
    const product = getProductById(productId);

    if (!product) return;

    if (getEl("productId")) {
        getEl("productId").value = product.id;
    }

    if (getEl("productName")) {
        getEl("productName").value = product.name;
    }

    if (getEl("productCategory")) {
        getEl("productCategory").value =
            product.category || "";
    }

    if (getEl("costPrice")) {
        getEl("costPrice").value =
            product.costPrice;
    }

    if (getEl("sellingPrice")) {
        getEl("sellingPrice").value =
            product.sellingPrice;
    }

    if (getEl("productStock")) {
        getEl("productStock").value =
            product.stock;
    }

    if (getEl("lowStockLevel")) {
        getEl("lowStockLevel").value =
            product.lowStockLevel;
    }

    const title = getEl("productModalTitle");

    if (title) {
        title.textContent = "Edit Product";
    }

    openModal("productModal");
}


function saveProduct(event) {
    event.preventDefault();

    const id = getEl("productId").value.trim();

    const name = getEl("productName").value.trim();
    const category = getEl("productCategory").value.trim();

    const costPrice = Number(
        getEl("costPrice").value
    );

    const sellingPrice = Number(
        getEl("sellingPrice").value
    );

    const stock = Number(
        getEl("productStock").value
    );

    const lowStockLevel = Number(
        getEl("lowStockLevel").value
    );

    if (!name) {
        showError("Please enter the product name.");
        return;
    }

    if (
        !Number.isFinite(costPrice) ||
        costPrice < 0
    ) {
        showError("Please enter a valid cost price.");
        return;
    }

    if (
        !Number.isFinite(sellingPrice) ||
        sellingPrice < 0
    ) {
        showError("Please enter a valid selling price.");
        return;
    }

    if (
        !Number.isFinite(stock) ||
        stock < 0
    ) {
        showError("Please enter a valid stock quantity.");
        return;
    }

    if (
        !Number.isFinite(lowStockLevel) ||
        lowStockLevel < 0
    ) {
        showError("Please enter a valid low-stock level.");
        return;
    }

    const duplicate = appData.products.find(
        product =>
            product.name.trim().toLowerCase() ===
                name.toLowerCase() &&
            product.id !== id
    );

    if (duplicate) {
        showError(
            "A product with this name already exists."
        );
        return;
    }

    if (id) {
        const product = getProductById(id);

        if (!product) {
            showError("Product could not be found.");
            return;
        }

        product.name = name;
        product.category = category;
        product.costPrice = costPrice;
        product.sellingPrice = sellingPrice;
        product.stock = stock;
        product.lowStockLevel = lowStockLevel;

        showToast("Product updated successfully.");

    } else {
        appData.products.push({
            id: generateId("PROD"),
            name,
            category,
            costPrice,
            sellingPrice,
            stock,
            lowStockLevel,
            createdAt: new Date().toISOString()
        });

        showToast("Product added successfully.");
    }

    saveData();
    closeModal("productModal");
    renderAll();
    updateSaleProductSuggestions();
}


async function deleteProduct(productId) {
    const product = getProductById(productId);

    if (!product) return;

    const confirmed = await showConfirm(
        "Delete Product?",
        `Delete "${product.name}" from your products?`
    );

    if (!confirmed) return;

    appData.products = appData.products.filter(
        item => item.id !== productId
    );

    saveData();
    renderAll();
    updateSaleProductSuggestions();

    showToast("Product deleted.");
}


/* =========================================================
   SALES
   ========================================================= */

function renderSales() {
    const tbody = getEl("salesTableBody");

    if (!tbody) return;

    const sales = [...appData.sales].sort(
        (a, b) =>
            new Date(b.date) - new Date(a.date)
    );

    const revenue = sales.reduce(
        (sum, sale) =>
            sum + Number(sale.revenue || 0),
        0
    );

    const profit = sales.reduce(
        (sum, sale) =>
            sum + Number(sale.profit || 0),
        0
    );

    if (getEl("salesCount")) {
        getEl("salesCount").textContent =
            formatNumber(sales.length);
    }

    if (getEl("salesRevenue")) {
        getEl("salesRevenue").textContent =
            formatMoney(revenue);
    }

    if (getEl("salesProfit")) {
        getEl("salesProfit").textContent =
            formatMoney(profit);
    }

    if (sales.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="empty-icon">🛒</div>
                        <h3>No sales recorded</h3>
                        <p>Your sales will appear here after you record them.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = sales
        .map(sale => `
            <tr>
                <td>
                    ${formatDate(sale.date)}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(sale.productName)}
                    </strong>
                </td>

                <td>
                    ${formatNumber(sale.quantity)}
                </td>

                <td>
                    ${formatMoney(sale.unitPrice)}
                </td>

                <td>
                    ${formatMoney(sale.revenue)}
                </td>

                <td>
                    <strong>
                        ${formatMoney(sale.profit)}
                    </strong>
                </td>

                <td>
                    <button
                        type="button"
                        class="action-btn delete"
                        data-action="delete-sale"
                        data-id="${sale.id}"
                    >
                        Delete
                    </button>
                </td>
            </tr>
        `)
        .join("");
}


function openAddSaleModal() {
    const form = getEl("saleForm");

    if (form) {
        form.reset();
    }

    if (getEl("availableStock")) {
        getEl("availableStock").textContent =
            "Available stock: 0";
    }

    resetSalePreview();

    updateSaleProductSuggestions();

    openModal("saleModal");
}


function updateSaleProductSuggestions() {
    const datalist = getEl("productSuggestions");

    if (!datalist) return;

    datalist.innerHTML = appData.products
        .map(product => `
            <option value="${escapeHTML(product.name)}">
        `)
        .join("");
}


function updateSalePreview() {
    const productInput = getEl("saleProduct");
    const quantityInput = getEl("saleQuantity");

    if (!productInput || !quantityInput) return;

    const product = findProductByName(
        productInput.value
    );

    const quantity = Number(
        quantityInput.value
    ) || 0;

    if (!product) {
        if (getEl("availableStock")) {
            getEl("availableStock").textContent =
                "Available stock: 0";
        }

        resetSalePreview();
        return;
    }

    const price = Number(product.sellingPrice) || 0;
    const cost = Number(product.costPrice) || 0;

    if (getEl("availableStock")) {
        getEl("availableStock").textContent =
            `Available stock: ${formatNumber(product.stock)}`;
    }

    const total = price * quantity;
    const profit = (price - cost) * quantity;

    if (getEl("saleUnitPrice")) {
        getEl("saleUnitPrice").textContent =
            formatMoney(price);
    }

    if (getEl("saleTotal")) {
        getEl("saleTotal").textContent =
            formatMoney(total);
    }

    if (getEl("saleProfit")) {
        getEl("saleProfit").textContent =
            formatMoney(profit);
    }
}


function resetSalePreview() {
    if (getEl("saleUnitPrice")) {
        getEl("saleUnitPrice").textContent =
            formatMoney(0);
    }

    if (getEl("saleTotal")) {
        getEl("saleTotal").textContent =
            formatMoney(0);
    }

    if (getEl("saleProfit")) {
        getEl("saleProfit").textContent =
            formatMoney(0);
    }
}


function saveSale(event) {
    event.preventDefault();

    const productName = getEl("saleProduct")
        .value
        .trim();

    const quantity = Number(
        getEl("saleQuantity").value
    );

    if (!productName) {
        showError("Please select or enter a product.");
        return;
    }

    if (
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {
        showError("Please enter a valid quantity.");
        return;
    }

    const product = findProductByName(productName);

    if (!product) {
        showError(
            "Product not found. Please select a product from your inventory."
        );
        return;
    }

    if (product.stock <= 0) {
        showError(
            "This product is currently out of stock."
        );
        return;
    }

    if (quantity > Number(product.stock)) {
        showError(
            `Only ${product.stock} unit(s) of this product are available.`
        );
        return;
    }

    const unitPrice = Number(
        product.sellingPrice
    );

    const costPrice = Number(
        product.costPrice
    );

    const revenue = unitPrice * quantity;
    const cost = costPrice * quantity;
    const profit = revenue - cost;

    appData.sales.push({
        id: generateId("SALE"),
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice,
        costPrice,
        revenue,
        cost,
        profit,
        date: new Date().toISOString()
    });

    product.stock =
        Number(product.stock) - quantity;

    saveData();

    closeModal("saleModal");

    renderAll();
    updateSaleProductSuggestions();

    showToast("Sale recorded successfully.");
}


async function deleteSale(saleId) {
    const sale = appData.sales.find(
        item => item.id === saleId
    );

    if (!sale) return;

    const confirmed = await showConfirm(
        "Delete Sale?",
        "The sale will be removed and the sold quantity will be returned to stock."
    );

    if (!confirmed) return;

    const product = getProductById(
        sale.productId
    );

    if (product) {
        product.stock =
            Number(product.stock || 0) +
            Number(sale.quantity || 0);
    }

    appData.sales = appData.sales.filter(
        item => item.id !== saleId
    );

    saveData();
    renderAll();

    showToast("Sale deleted and stock restored.");
}


/* =========================================================
   EXPENSES
   ========================================================= */

function renderExpenses() {
    const tbody = getEl("expensesTableBody");

    if (!tbody) return;

    const expenses = [...appData.expenses].sort(
        (a, b) =>
            new Date(b.date) - new Date(a.date)
    );

    const total = expenses.reduce(
        (sum, expense) =>
            sum + Number(expense.amount || 0),
        0
    );

    if (getEl("expenseCount")) {
        getEl("expenseCount").textContent =
            formatNumber(expenses.length);
    }

    if (getEl("expenseTotal")) {
        getEl("expenseTotal").textContent =
            formatMoney(total);
    }

    if (expenses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <div class="empty-icon">💳</div>
                        <h3>No expenses recorded</h3>
                        <p>Your business expenses will appear here.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = expenses
        .map(expense => `
            <tr>
                <td>
                    ${formatDate(expense.date)}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(expense.description)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(expense.category)}
                </td>

                <td>
                    ${formatMoney(expense.amount)}
                </td>

                <td>
                    <button
                        type="button"
                        class="action-btn delete"
                        data-action="delete-expense"
                        data-id="${expense.id}"
                    >
                        Delete
                    </button>
                </td>
            </tr>
        `)
        .join("");
}


function openAddExpenseModal() {
    const form = getEl("expenseForm");

    if (form) {
        form.reset();
    }

    openModal("expenseModal");
}


function saveExpense(event) {
    event.preventDefault();

    const description = getEl("expenseDescription")
        .value
        .trim();

    const category = getEl("expenseCategory")
        .value;

    const amount = Number(
        getEl("expenseAmount").value
    );

    if (!description) {
        showError(
            "Please enter an expense description."
        );
        return;
    }

    if (!category) {
        showError(
            "Please select an expense category."
        );
        return;
    }

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        showError(
            "Please enter a valid expense amount."
        );
        return;
    }

    appData.expenses.push({
        id: generateId("EXP"),
        description,
        category,
        amount,
        date: new Date().toISOString()
    });

    saveData();

    closeModal("expenseModal");

    renderAll();

    showToast("Expense recorded successfully.");
}


async function deleteExpense(expenseId) {
    const expense = appData.expenses.find(
        item => item.id === expenseId
    );

    if (!expense) return;

    const confirmed = await showConfirm(
        "Delete Expense?",
        `Delete "${expense.description}" from your expenses?`
    );

    if (!confirmed) return;

    appData.expenses =
        appData.expenses.filter(
            item => item.id !== expenseId
        );

    saveData();
    renderAll();

    showToast("Expense deleted.");
}


/* =========================================================
   CUSTOMERS
   ========================================================= */

function renderCustomers() {
    const tbody = getEl("customersTableBody");

    if (!tbody) return;

    if (appData.customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <div class="empty-icon">👥</div>
                        <h3>No customers yet</h3>
                        <p>Add your customers to keep their information organized.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    const customers = [...appData.customers].sort(
        (a, b) =>
            new Date(b.date) - new Date(a.date)
    );

    tbody.innerHTML = customers
        .map(customer => `
            <tr>
                <td>
                    <strong>
                        ${escapeHTML(customer.name)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(customer.phone || "-")}
                </td>

                <td>
                    ${escapeHTML(customer.address || "-")}
                </td>

                <td>
                    ${formatDate(customer.date)}
                </td>

                <td>
                    <button
                        type="button"
                        class="action-btn delete"
                        data-action="delete-customer"
                        data-id="${customer.id}"
                    >
                        Delete
                    </button>
                </td>
            </tr>
        `)
        .join("");
}


function openAddCustomerModal() {
    const form = getEl("customerForm");

    if (form) {
        form.reset();
    }

    openModal("customerModal");
}


function saveCustomer(event) {
    event.preventDefault();

    const name = getEl("customerName")
        .value
        .trim();

    const phone = getEl("customerPhone")
        .value
        .trim();

    const address = getEl("customerAddress")
        .value
        .trim();

    if (!name) {
        showError("Please enter the customer's name.");
        return;
    }

    appData.customers.push({
        id: generateId("CUST"),
        name,
        phone,
        address,
        date: new Date().toISOString()
    });

    saveData();

    closeModal("customerModal");

    renderAll();

    showToast("Customer added successfully.");
}


async function deleteCustomer(customerId) {
    const customer = appData.customers.find(
        item => item.id === customerId
    );

    if (!customer) return;

    const confirmed = await showConfirm(
        "Delete Customer?",
        `Delete "${customer.name}" from your customer list?`
    );

    if (!confirmed) return;

    appData.customers =
        appData.customers.filter(
            item => item.id !== customerId
        );

    saveData();
    renderAll();

    showToast("Customer deleted.");
}


/* =========================================================
   REPORTS
   ========================================================= */

function getDateRange(range) {
    const now = new Date();

    if (range === "today") {
        const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const end = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
        );

        return { start, end };
    }

    if (range === "week") {
        const day = now.getDay();

        const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - day
        );

        const end = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate() + 7
        );

        return { start, end };
    }

    if (range === "month") {
        const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const end = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
        );

        return { start, end };
    }

    return {
        start: null,
        end: null
    };
}


function filterByDateRange(items, range) {
    if (range === "all") {
        return items;
    }

    const { start, end } =
        getDateRange(range);

    return items.filter(item => {
        const date = getDateValue(item.date);

        if (!date) return false;

        return date >= start && date < end;
    });
}


function renderReports() {
    const sales = filterByDateRange(
        appData.sales,
        currentReportRange
    );

    const expenses = filterByDateRange(
        appData.expenses,
        currentReportRange
    );

    const revenue = sales.reduce(
        (sum, sale) =>
            sum + Number(sale.revenue || 0),
        0
    );

    const grossProfit = sales.reduce(
        (sum, sale) =>
            sum + Number(sale.profit || 0),
        0
    );

    const expenseTotal = expenses.reduce(
        (sum, expense) =>
            sum + Number(expense.amount || 0),
        0
    );

    const netProfit =
        grossProfit - expenseTotal;

    if (getEl("reportRevenue")) {
        getEl("reportRevenue").textContent =
            formatMoney(revenue);
    }

    if (getEl("reportGross")) {
        getEl("reportGross").textContent =
            formatMoney(grossProfit);
    }

    if (getEl("reportExpenses")) {
        getEl("reportExpenses").textContent =
            formatMoney(expenseTotal);
    }

    if (getEl("reportNet")) {
        getEl("reportNet").textContent =
            formatMoney(netProfit);
    }

    renderTopProducts(sales);
    renderExpenseBreakdown(expenses);

    document.querySelectorAll(".filter-btn")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.range ===
                    currentReportRange
            );
        });
}


function renderTopProducts(sales) {
    const container =
        getEl("topProductsContainer");

    if (!container) return;

    const productMap = {};

    sales.forEach(sale => {
        const key = sale.productId || sale.productName;

        if (!productMap[key]) {
            productMap[key] = {
                name: sale.productName,
                quantity: 0,
                revenue: 0,
                profit: 0
            };
        }

        productMap[key].quantity +=
            Number(sale.quantity || 0);

        productMap[key].revenue +=
            Number(sale.revenue || 0);

        productMap[key].profit +=
            Number(sale.profit || 0);
    });

    const products = Object.values(productMap)
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 5);

    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No product data</h3>
                <p>Product performance will appear here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products
        .map((product, index) => `
            <div class="report-item">
                <div class="report-rank">
                    ${index + 1}
                </div>

                <div class="report-info">
                    <strong>
                        ${escapeHTML(product.name)}
                    </strong>

                    <small>
                        ${formatNumber(product.quantity)}
                        units sold
                    </small>
                </div>

                <div class="report-value">
                    <strong>
                        ${formatMoney(product.profit)}
                    </strong>

                    <small>
                        Revenue:
                        ${formatMoney(product.revenue)}
                    </small>
                </div>
            </div>
        `)
        .join("");
}


function renderExpenseBreakdown(expenses) {
    const container =
        getEl("expenseBreakdownContainer");

    if (!container) return;

    const categoryMap = {};

    expenses.forEach(expense => {
        const category =
            expense.category || "Other";

        if (!categoryMap[category]) {
            categoryMap[category] = 0;
        }

        categoryMap[category] +=
            Number(expense.amount || 0);
    });

    const entries = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💳</div>
                <h3>No expense data</h3>
                <p>Expense breakdown will appear here.</p>
            </div>
        `;
        return;
    }

    const total = entries.reduce(
        (sum, [, amount]) =>
            sum + amount,
        0
    );

    container.innerHTML = entries
        .map(([category, amount]) => {
            const percentage =
                total > 0
                    ? (amount / total) * 100
                    : 0;

            return `
                <div class="expense-breakdown-item">
                    <div class="expense-breakdown-header">
                        <strong>
                            ${escapeHTML(category)}
                        </strong>

                        <span>
                            ${formatMoney(amount)}
                        </span>
                    </div>

                    <div class="progress-bar">
                        <div
                            class="progress-fill"
                            style="width:${percentage.toFixed(2)}%"
                        ></div>
                    </div>

                    <small>
                        ${percentage.toFixed(1)}%
                    </small>
                </div>
            `;
        })
        .join("");
}


/* =========================================================
   SETTINGS
   ========================================================= */

function loadBusinessSettings() {
    if (getEl("businessName")) {
        getEl("businessName").value =
            appData.business.name || "";
    }

    if (getEl("businessPhone")) {
        getEl("businessPhone").value =
            appData.business.phone || "";
    }

    if (getEl("businessAddress")) {
        getEl("businessAddress").value =
            appData.business.address || "";
    }

    if (getEl("headerBusinessName")) {
        getEl("headerBusinessName").textContent =
            appData.business.name ||
            "My Business";
    }
}


function saveBusinessSettings(event) {
    event.preventDefault();

    const name = getEl("businessName")
        .value
        .trim();

    const phone = getEl("businessPhone")
        .value
        .trim();

    const address = getEl("businessAddress")
        .value
        .trim();

    if (!name) {
        showError(
            "Please enter your business name."
        );
        return;
    }

    appData.business = {
        name,
        phone,
        address
    };

    saveData();
    loadBusinessSettings();

    showToast(
        "Business settings saved successfully."
    );
}


/* =========================================================
   EXPORT / RESTORE
   ========================================================= */

function exportData() {
    try {
        const data = JSON.stringify(
            appData,
            null,
            2
        );

        const blob = new Blob(
            [data],
            {
                type: "application/json"
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        const date =
            new Date()
                .toISOString()
                .slice(0, 10);

        link.href = url;

        link.download =
            `business-profit-analyzer-backup-${date}.json`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

        showToast(
            "Backup exported successfully."
        );

    } catch (error) {
        console.error(error);

        showError(
            "Unable to export your data."
        );
    }
}


function triggerRestore() {
    const fileInput = getEl("restoreFile");

    if (fileInput) {
        fileInput.click();
    }
}


function restoreData(event) {
    const file =
        event.target.files &&
        event.target.files[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload = async function () {
        try {
            const imported =
                JSON.parse(reader.result);

            if (
                !imported ||
                typeof imported !== "object"
            ) {
                throw new Error(
                    "Invalid backup file."
                );
            }

            const confirmed =
                await showConfirm(
                    "Restore Backup?",
                    "Restoring this backup will replace the current business data on this device."
                );

            if (!confirmed) {
                event.target.value = "";
                return;
            }

            appData = {
                business: {
                    ...defaultData.business,
                    ...(imported.business || {})
                },
                products: Array.isArray(
                    imported.products
                )
                    ? imported.products
                    : [],
                sales: Array.isArray(
                    imported.sales
                )
                    ? imported.sales
                    : [],
                expenses: Array.isArray(
                    imported.expenses
                )
                    ? imported.expenses
                    : [],
                customers: Array.isArray(
                    imported.customers
                )
                    ? imported.customers
                    : []
            };

            saveData();
            renderAll();
            loadBusinessSettings();
            updateSaleProductSuggestions();

            showSuccess(
                "Your backup has been restored successfully."
            );

        } catch (error) {
            console.error(error);

            showError(
                "This file is not a valid Profit Analyzer backup."
            );
        }

        event.target.value = "";
    };

    reader.onerror = function () {
        showError(
            "Could not read the selected backup file."
        );

        event.target.value = "";
    };

    reader.readAsText(file);
}


async function clearAllData() {
    const confirmed =
        await showConfirm(
            "Clear All Data?",
            "This will permanently remove all products, sales, expenses, customers and business settings from this device."
        );

    if (!confirmed) return;

    appData =
        JSON.parse(
            JSON.stringify(defaultData)
        );

    saveData();

    currentReportRange = "all";

    renderAll();
    loadBusinessSettings();
    updateSaleProductSuggestions();

    showSuccess(
        "All business data has been cleared."
    );
}


/* =========================================================
   PRINT REPORT
   ========================================================= */

function printReport() {
    showPage("reports");

    setTimeout(() => {
        window.print();
    }, 300);
}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderAll() {
    renderDashboard();
    renderProducts();
    renderSales();
    renderExpenses();
    renderCustomers();
    renderReports();
}


/* =========================================================
   EVENT DELEGATION
   ========================================================= */

function handleActionClick(event) {
    const button =
        event.target.closest(
            "[data-action]"
        );

    if (!button) return;

    const action =
        button.dataset.action;

    const id =
        button.dataset.id;

    if (action === "edit-product") {
        openEditProductModal(id);
    }

    if (action === "delete-product") {
        deleteProduct(id);
    }

    if (action === "delete-sale") {
        deleteSale(id);
    }

    if (action === "delete-expense") {
        deleteExpense(id);
    }

    if (action === "delete-customer") {
        deleteCustomer(id);
    }
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function initializeEventListeners() {

    /* ---------- Navigation ---------- */

    document.querySelectorAll(".nav-item")
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    showPage(
                        button.dataset.page
                    );
                }
            );
        });


    /* ---------- Mobile menu ---------- */

    const menuToggle =
        getEl("menuToggle");

    if (menuToggle) {
        menuToggle.addEventListener(
            "click",
            toggleMobileMenu
        );
    }


    /* ---------- Product ---------- */

    const addProductBtn =
        getEl("addProductBtn");

    if (addProductBtn) {
        addProductBtn.addEventListener(
            "click",
            openAddProductModal
        );
    }

    const productForm =
        getEl("productForm");

    if (productForm) {
        productForm.addEventListener(
            "submit",
            saveProduct
        );
    }

    const productSearch =
        getEl("productSearch");

    if (productSearch) {
        productSearch.addEventListener(
            "input",
            renderProducts
        );
    }


    /* ---------- Sales ---------- */

    const addSaleBtn =
        getEl("addSaleBtn");

    if (addSaleBtn) {
        addSaleBtn.addEventListener(
            "click",
            openAddSaleModal
        );
    }

    const saleForm =
        getEl("saleForm");

    if (saleForm) {
        saleForm.addEventListener(
            "submit",
            saveSale
        );
    }

    const saleProduct =
        getEl("saleProduct");

    const saleQuantity =
        getEl("saleQuantity");

    if (saleProduct) {
        saleProduct.addEventListener(
            "input",
            updateSalePreview
        );

        saleProduct.addEventListener(
            "change",
            updateSalePreview
        );
    }

    if (saleQuantity) {
        saleQuantity.addEventListener(
            "input",
            updateSalePreview
        );
    }


    /* ---------- Expenses ---------- */

    const addExpenseBtn =
        getEl("addExpenseBtn");

    if (addExpenseBtn) {
        addExpenseBtn.addEventListener(
            "click",
            openAddExpenseModal
        );
    }

    const expenseForm =
        getEl("expenseForm");

    if (expenseForm) {
        expenseForm.addEventListener(
            "submit",
            saveExpense
        );
    }


    /* ---------- Customers ---------- */

    const addCustomerBtn =
        getEl("addCustomerBtn");

    if (addCustomerBtn) {
        addCustomerBtn.addEventListener(
            "click",
            openAddCustomerModal
        );
    }

    const customerForm =
        getEl("customerForm");

    if (customerForm) {
        customerForm.addEventListener(
            "submit",
            saveCustomer
        );
    }


    /* ---------- Report filters ---------- */

    document.querySelectorAll(".filter-btn")
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    currentReportRange =
                        button.dataset.range ||
                        "all";

                    renderReports();
                }
            );
        });


    /* ---------- Settings ---------- */

    const businessForm =
        getEl("businessForm");

    if (businessForm) {
        businessForm.addEventListener(
            "submit",
            saveBusinessSettings
        );
    }

    const exportDataBtn =
        getEl("exportDataBtn");

    if (exportDataBtn) {
        exportDataBtn.addEventListener(
            "click",
            exportData
        );
    }

    const restoreDataBtn =
        getEl("restoreDataBtn");

    if (restoreDataBtn) {
        restoreDataBtn.addEventListener(
            "click",
            triggerRestore
        );
    }

    const restoreFile =
        getEl("restoreFile");

    if (restoreFile) {
        restoreFile.addEventListener(
            "change",
            restoreData
        );
    }

    const clearDataBtn =
        getEl("clearDataBtn");

    if (clearDataBtn) {
        clearDataBtn.addEventListener(
            "click",
            clearAllData
        );
    }


    /* ---------- Print ---------- */

    const printReportBtn =
        getEl("printReportBtn");

    if (printReportBtn) {
        printReportBtn.addEventListener(
            "click",
            printReport
        );
    }


    /* ---------- Modal close buttons ---------- */

    document.querySelectorAll(
        "[data-close-modal]"
    ).forEach(button => {
        button.addEventListener(
            "click",
            () => {
                closeModal(
                    button.dataset.closeModal
                );
            }
        );
    });


    /* ---------- Click outside modal ---------- */

    document.querySelectorAll(".modal")
        .forEach(modal => {
            modal.addEventListener(
                "click",
                event => {
                    if (
                        event.target === modal
                    ) {
                        modal.classList.remove(
                            "active"
                        );
                    }
                }
            );
        });


    /* ---------- Action buttons ---------- */

    document.addEventListener(
        "click",
        handleActionClick
    );


    /* ---------- Escape key ---------- */

    document.addEventListener(
        "keydown",
        event => {
            if (event.key === "Escape") {
                closeAllModals();
                closeMobileMenu();
            }
        }
    );
}


/* =========================================================
   INITIALIZE APP
   ========================================================= */

function initializeApp() {
    initializeEventListeners();

    loadBusinessSettings();

    updateSaleProductSuggestions();

    renderAll();

    showPage("dashboard");

    console.log(
        "Business Profit Analyzer initialized successfully."
    );
}


if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );
} else {
    initializeApp();
}