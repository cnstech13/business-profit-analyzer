/* =========================================================
   BUSINESS PROFIT ANALYZER
   MAIN JAVASCRIPT
   ========================================================= */

/* =========================================================
   STORAGE
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
let toastTimer = null;


/* =========================================================
   BASIC HELPERS
========================================================= */

function generateId(prefix) {
    return (
        prefix +
        "_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2, 8)
    );
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

            products: Array.isArray(parsed.products)
                ? parsed.products
                : [],

            sales: Array.isArray(parsed.sales)
                ? parsed.sales
                : [],

            expenses: Array.isArray(parsed.expenses)
                ? parsed.expenses
                : [],

            customers: Array.isArray(parsed.customers)
                ? parsed.customers
                : []
        };

    } catch (error) {
        console.error("Unable to load saved data:", error);

        return JSON.parse(JSON.stringify(defaultData));
    }
}


function saveData() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appData)
        );

        return true;

    } catch (error) {
        console.error("Unable to save data:", error);

        showToast(
            "Storage Error",
            "Unable to save your data on this device.",
            "error"
        );

        return false;
    }
}


function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatCurrency(amount) {
    const number = Number(amount) || 0;

    return "₦" + number.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


function formatNumber(number) {
    return (Number(number) || 0).toLocaleString("en-NG");
}


function formatDate(dateValue) {
    if (!dateValue) {
        return "---";
    }

    const date = new Date(dateValue + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function getToday() {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getProductById(id) {
    return appData.products.find(
        product => product.id === id
    );
}


function getCustomerById(id) {
    return appData.customers.find(
        customer => customer.id === id
    );
}


/* =========================================================
   DOM HELPERS
========================================================= */

function getElement(id) {
    return document.getElementById(id);
}


function showElement(id) {
    const element = getElement(id);

    if (element) {
        element.style.display = "";
    }
}


function hideElement(id) {
    const element = getElement(id);

    if (element) {
        element.style.display = "none";
    }
}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeNavigation();

    initializeSidebar();

    initializeButtons();

    initializeForms();

    initializeSearch();

    initializeModals();

    initializeReports();

    initializeSettings();

    setDefaultDates();

    refreshApplication();

    console.log(
        "Business Profit Analyzer JavaScript is working."
    );
});


/* =========================================================
   REFRESH EVERYTHING
========================================================= */

function refreshApplication() {

    updateBusinessInformation();

    updateDashboard();

    renderProducts();

    renderSales();

    renderExpenses();

    renderCustomers();

    populateSaleProducts();

    populateSaleCustomers();

    updateReports();

    updateSettingsForm();
}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    const navItems = document.querySelectorAll(
        ".nav-item"
    );

    navItems.forEach(item => {

        item.addEventListener("click", () => {

            const pageName = item.dataset.page;

            if (!pageName) {
                return;
            }

            openPage(pageName);

            closeMobileSidebar();
        });
    });


    document.querySelectorAll(
        '[data-page]'
    ).forEach(element => {

        if (
            !element.classList.contains("nav-item")
        ) {

            element.addEventListener("click", () => {

                const pageName =
                    element.dataset.page;

                if (pageName) {
                    openPage(pageName);
                }
            });
        }
    });
}


function openPage(pageName) {

    const pages = document.querySelectorAll(
        ".page"
    );

    pages.forEach(page => {
        page.classList.remove("active");
    });


    const selectedPage = getElement(
        pageName + "Page"
    );

    if (selectedPage) {
        selectedPage.classList.add("active");
    }


    const navItems = document.querySelectorAll(
        ".nav-item"
    );

    navItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === pageName
        );
    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (pageName === "reports") {
        updateReports();
    }

    if (pageName === "dashboard") {
        updateDashboard();
    }
}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function initializeSidebar() {

    const menuBtn = getElement("menuBtn");

    const sidebar = getElement("sidebar");

    const overlay =
        getElement("sidebarOverlay");


    if (menuBtn) {

        menuBtn.addEventListener(
            "click",
            () => {

                if (!sidebar) {
                    return;
                }

                sidebar.classList.toggle("open");

                if (overlay) {
                    overlay.classList.toggle(
                        "show",
                        sidebar.classList.contains("open")
                    );
                }
            }
        );
    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeMobileSidebar
        );
    }
}


function closeMobileSidebar() {

    const sidebar = getElement("sidebar");

    const overlay =
        getElement("sidebarOverlay");


    if (sidebar) {
        sidebar.classList.remove("open");
    }

    if (overlay) {
        overlay.classList.remove("show");
    }
}


/* =========================================================
   BUTTONS
========================================================= */

function initializeButtons() {

    const addProductBtn =
        getElement("addProductBtn");

    const addSaleBtn =
        getElement("addSaleBtn");

    const addExpenseBtn =
        getElement("addExpenseBtn");

    const addCustomerBtn =
        getElement("addCustomerBtn");

    const quickSaleBtn =
        getElement("quickSaleBtn");


    if (addProductBtn) {
        addProductBtn.addEventListener(
            "click",
            () => openProductModal()
        );
    }


    if (addSaleBtn) {
        addSaleBtn.addEventListener(
            "click",
            () => openSaleModal()
        );
    }


    if (quickSaleBtn) {
        quickSaleBtn.addEventListener(
            "click",
            () => openSaleModal()
        );
    }


    if (addExpenseBtn) {
        addExpenseBtn.addEventListener(
            "click",
            () => openExpenseModal()
        );
    }


    if (addCustomerBtn) {
        addCustomerBtn.addEventListener(
            "click",
            () => openCustomerModal()
        );
    }


    document.querySelectorAll(
        ".quick-action"
    ).forEach(button => {

        button.addEventListener("click", () => {

            const action =
                button.dataset.action;

            if (action === "product") {
                openProductModal();
            }

            if (action === "sale") {
                openSaleModal();
            }

            if (action === "expense") {
                openExpenseModal();
            }

            if (action === "customer") {
                openCustomerModal();
            }
        });
    });


    const notificationBtn =
        getElement("notificationBtn");

    if (notificationBtn) {

        notificationBtn.addEventListener(
            "click",
            () => {

                showToast(
                    "Business Analyzer",
                    "Your business data is stored locally on this device.",
                    "success"
                );
            }
        );
    }
}


/* =========================================================
   BUSINESS INFORMATION
========================================================= */

function updateBusinessInformation() {

    const businessName =
        appData.business.name ||
        "My Business";


    const dashboardName =
        getElement("dashboardBusinessName");

    if (dashboardName) {
        dashboardName.textContent =
            businessName;
    }


    const receiptName =
        getElement("receiptBusinessName");

    if (receiptName) {
        receiptName.textContent =
            businessName;
    }


    const receiptPhone =
        getElement("receiptBusinessPhone");

    if (receiptPhone) {
        receiptPhone.textContent =
            appData.business.phone || "";
    }


    const receiptAddress =
        getElement("receiptBusinessAddress");

    if (receiptAddress) {
        receiptAddress.textContent =
            appData.business.address || "";
    }
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const totalSales =
        appData.sales.reduce(
            (total, sale) =>
                total + Number(sale.total || 0),
            0
        );


    const totalExpenses =
        appData.expenses.reduce(
            (total, expense) =>
                total + Number(expense.amount || 0),
            0
        );


    const netProfit =
        totalSales - totalExpenses;


    const totalSalesElement =
        getElement("totalSales");

    const totalExpensesElement =
        getElement("totalExpenses");

    const netProfitElement =
        getElement("netProfit");

    const totalProductsElement =
        getElement("totalProducts");


    if (totalSalesElement) {
        totalSalesElement.textContent =
            formatCurrency(totalSales);
    }


    if (totalExpensesElement) {
        totalExpensesElement.textContent =
            formatCurrency(totalExpenses);
    }


    if (netProfitElement) {
        netProfitElement.textContent =
            formatCurrency(netProfit);

        netProfitElement.style.color =
            netProfit < 0
                ? "#d93025"
                : "";
    }


    if (totalProductsElement) {
        totalProductsElement.textContent =
            formatNumber(appData.products.length);
    }


    renderRecentSales();

    renderSalesChart();
}


/* =========================================================
   RECENT SALES
========================================================= */

function renderRecentSales() {

    const container =
        getElement("recentSales");

    if (!container) {
        return;
    }


    const sales = [...appData.sales]
        .sort(
            (a, b) =>
                new Date(
                    b.date
                ) -
                new Date(
                    a.date
                )
        )
        .slice(0, 5);


    if (sales.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    💰
                </div>

                <h4>
                    No sales yet
                </h4>

                <p>
                    Your recent sales will appear here.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        sales.map(sale => {

            const product =
                getProductById(
                    sale.productId
                );

            const customer =
                getCustomerById(
                    sale.customerId
                );


            return `
                <div class="recent-sale-item"
                     style="
                        display:flex;
                        align-items:center;
                        gap:10px;
                        padding:11px 0;
                        border-bottom:1px solid #eef1f5;
                     ">

                    <div
                        style="
                            width:36px;
                            height:36px;
                            border-radius:10px;
                            background:#fff8d6;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            flex-shrink:0;
                        "
                    >
                        💰
                    </div>

                    <div style="flex:1;min-width:0;">

                        <strong
                            style="
                                display:block;
                                color:#172033;
                                font-size:11px;
                                overflow:hidden;
                                text-overflow:ellipsis;
                                white-space:nowrap;
                            "
                        >
                            ${escapeHTML(
                                product
                                    ? product.name
                                    : "Deleted Product"
                            )}
                        </strong>

                        <small
                            style="
                                display:block;
                                color:#8b95a7;
                                font-size:9px;
                                margin-top:3px;
                            "
                        >
                            ${formatDate(sale.date)}
                            ·
                            ${escapeHTML(
                                customer
                                    ? customer.name
                                    : "Walk-in Customer"
                            )}
                        </small>

                    </div>

                    <strong
                        style="
                            color:#0b1f3a;
                            font-size:11px;
                        "
                    >
                        ${formatCurrency(
                            sale.total
                        )}
                    </strong>

                </div>
            `;
        })
        .join("");
}


/* =========================================================
   SALES CHART
========================================================= */

function renderSalesChart() {

    const container =
        getElement("salesChart");

    if (!container) {
        return;
    }


    if (appData.sales.length === 0) {

        container.innerHTML = `
            <div class="empty-chart">

                <div>
                    📈
                </div>

                <p>
                    No sales data yet
                </p>

                <small>
                    Record your first sale to see your
                    sales chart.
                </small>

            </div>
        `;

        return;
    }


    const rangeElement =
        getElement("salesChartRange");

    const days =
        Number(
            rangeElement
                ? rangeElement.value
                : 7
        );


    const today = new Date();

    const data = [];


    for (
        let i = days - 1;
        i >= 0;
        i--
    ) {

        const date =
            new Date(today);

        date.setDate(
            today.getDate() - i
        );


        const dateString =
            date.toISOString()
                .split("T")[0];


        const amount =
            appData.sales
                .filter(
                    sale =>
                        sale.date ===
                        dateString
                )
                .reduce(
                    (sum, sale) =>
                        sum +
                        Number(
                            sale.total || 0
                        ),
                    0
                );


        data.push({
            date: dateString,
            amount
        });
    }


    const maxAmount =
        Math.max(
            ...data.map(item => item.amount),
            1
        );


    const chartHeight = 220;


    let svgWidth = 700;


    if (
        container.clientWidth &&
        container.clientWidth < 700
    ) {
        svgWidth =
            Math.max(
                500,
                container.clientWidth - 30
            );
    }


    const horizontalPadding = 35;

    const verticalPadding = 25;

    const graphWidth =
        svgWidth -
        horizontalPadding * 2;

    const graphHeight =
        chartHeight -
        verticalPadding * 2;


    const points =
        data.map((item, index) => {

            const x =
                horizontalPadding +
                (
                    index /
                    Math.max(
                        data.length - 1,
                        1
                    )
                ) *
                graphWidth;


            const y =
                verticalPadding +
                graphHeight -
                (
                    item.amount /
                    maxAmount
                ) *
                graphHeight;


            return {
                x,
                y,
                ...item
            };
        });


    const linePoints =
        points
            .map(
                point =>
                    `${point.x},${point.y}`
            )
            .join(" ");


    const areaPoints =
        [
            `${horizontalPadding},${chartHeight - verticalPadding}`,
            linePoints,
            `${horizontalPadding + graphWidth},${chartHeight - verticalPadding}`
        ]
            .join(" ");


    const visibleLabels =
        data.length <= 10
            ? data
            : data.filter(
                (_, index) =>
                    index %
                        Math.ceil(
                            data.length / 7
                        ) ===
                    0
            );


    container.innerHTML = `
        <div
            style="
                width:100%;
                overflow-x:auto;
            "
        >

            <svg
                viewBox="0 0 ${svgWidth} ${chartHeight}"
                width="100%"
                height="${chartHeight}"
                preserveAspectRatio="none"
                style="min-width:500px;"
            >

                <defs>

                    <linearGradient
                        id="salesGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >

                        <stop
                            offset="0%"
                            stop-color="#d4af37"
                            stop-opacity="0.35"
                        />

                        <stop
                            offset="100%"
                            stop-color="#d4af37"
                            stop-opacity="0"
                        />

                    </linearGradient>

                </defs>


                ${[0, 0.25, 0.5, 0.75, 1]
                    .map(level => {

                        const y =
                            verticalPadding +
                            graphHeight -
                            level *
                            graphHeight;

                        const value =
                            maxAmount *
                            level;

                        return `
                            <line
                                x1="${horizontalPadding}"
                                y1="${y}"
                                x2="${horizontalPadding + graphWidth}"
                                y2="${y}"
                                stroke="#e9edf3"
                                stroke-width="1"
                            />

                            <text
                                x="3"
                                y="${y + 3}"
                                font-size="8"
                                fill="#8b95a7"
                            >
                                ${formatCurrency(value)}
                            </text>
                        `;
                    })
                    .join("")}


                <polygon
                    points="${areaPoints}"
                    fill="url(#salesGradient)"
                />


                <polyline
                    points="${linePoints}"
                    fill="none"
                    stroke="#d4af37"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />


                ${points
                    .map(
                        point =>
                            `
                            <circle
                                cx="${point.x}"
                                cy="${point.y}"
                                r="3.5"
                                fill="#ffffff"
                                stroke="#d4af37"
                                stroke-width="2"
                            />
                            `
                    )
                    .join("")}


                ${visibleLabels
                    .map(item => {

                        const point =
                            points.find(
                                point =>
                                    point.date ===
                                    item.date
                            );

                        if (!point) {
                            return "";
                        }

                        const labelDate =
                            new Date(
                                item.date +
                                "T00:00:00"
                            );


                        return `
                            <text
                                x="${point.x}"
                                y="${chartHeight - 5}"
                                text-anchor="middle"
                                font-size="8"
                                fill="#8b95a7"
                            >
                                ${labelDate.toLocaleDateString(
                                    "en-NG",
                                    {
                                        day: "numeric",
                                        month: "short"
                                    }
                                )}
                            </text>
                        `;
                    })
                    .join("")}

            </svg>

        </div>
    `;
}


/* =========================================================
   PRODUCT MANAGEMENT
========================================================= */

function renderProducts(searchTerm = "") {

    const tbody =
        getElement("productsTableBody");

    const empty =
        getElement("productsEmpty");

    if (!tbody || !empty) {
        return;
    }


    const search =
        searchTerm
            .trim()
            .toLowerCase();


    const products =
        appData.products.filter(product => {

            if (!search) {
                return true;
            }

            return (
                String(product.name || "")
                    .toLowerCase()
                    .includes(search)
                ||
                String(product.category || "")
                    .toLowerCase()
                    .includes(search)
            );
        });


    tbody.innerHTML = "";


    if (products.length === 0) {

        empty.classList.add("show");

        return;
    }


    empty.classList.remove("show");


    tbody.innerHTML =
        products.map(product => {

            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(
                                product.name
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            product.category ||
                            "Uncategorized"
                        )}
                    </td>

                    <td>
                        ${formatCurrency(
                            product.costPrice
                        )}
                    </td>

                    <td>
                        ${formatCurrency(
                            product.sellingPrice
                        )}
                    </td>

                    <td>

                        <span
                            class="badge ${
                                Number(
                                    product.stock
                                ) <= 5
                                    ? "badge-warning"
                                    : "badge-success"
                            }"
                        >
                            ${formatNumber(
                                product.stock
                            )}
                        </span>

                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                type="button"
                                class="action-btn edit"
                                title="Edit product"
                                onclick="editProduct('${product.id}')"
                            >
                                ✏️
                            </button>

                            <button
                                type="button"
                                class="action-btn delete"
                                title="Delete product"
                                onclick="deleteProduct('${product.id}')"
                            >
                                🗑️
                            </button>

                        </div>

                    </td>

                </tr>
            `;
        })
        .join("");
}


function openProductModal(productId = "") {

    const modal =
        getElement("productModal");

    const form =
        getElement("productForm");

    if (!modal || !form) {
        return;
    }


    form.reset();


    getElement("productId").value =
        "";


    getElement("productModalTitle").textContent =
        "Add Product";


    if (productId) {

        const product =
            getProductById(productId);

        if (!product) {
            return;
        }


        getElement("productId").value =
            product.id;

        getElement("productName").value =
            product.name || "";

        getElement("productCategory").value =
            product.category || "";

        getElement("productStock").value =
            product.stock ?? 0;

        getElement("productCostPrice").value =
            product.costPrice ?? 0;

        getElement("productSellingPrice").value =
            product.sellingPrice ?? 0;


        getElement("productModalTitle").textContent =
            "Edit Product";
    }


    openModal("productModal");
}


function editProduct(id) {
    openProductModal(id);
}


function deleteProduct(id) {

    const product =
        getProductById(id);

    if (!product) {
        return;
    }


    const confirmed =
        window.confirm(
            `Delete "${product.name}"?`
        );


    if (!confirmed) {
        return;
    }


    appData.products =
        appData.products.filter(
            item => item.id !== id
        );


    saveData();

    refreshApplication();


    showToast(
        "Product Deleted",
        `${product.name} was removed.`,
        "success"
    );
}


/* =========================================================
   SALES MANAGEMENT
========================================================= */

function renderSales(searchTerm = "") {

    const tbody =
        getElement("salesTableBody");

    const empty =
        getElement("salesEmpty");

    if (!tbody || !empty) {
        return;
    }


    const search =
        searchTerm
            .trim()
            .toLowerCase();


    const sales =
        [...appData.sales]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .filter(sale => {

                if (!search) {
                    return true;
                }


                const product =
                    getProductById(
                        sale.productId
                    );


                const customer =
                    getCustomerById(
                        sale.customerId
                    );


                const text =
                    [
                        sale.date,
                        product
                            ? product.name
                            : "",
                        customer
                            ? customer.name
                            : "Walk-in Customer"
                    ]
                        .join(" ")
                        .toLowerCase();


                return text.includes(search);
            });


    tbody.innerHTML = "";


    if (sales.length === 0) {

        empty.classList.add("show");

        return;
    }


    empty.classList.remove("show");


    tbody.innerHTML =
        sales.map(sale => {

            const product =
                getProductById(
                    sale.productId
                );


            const customer =
                getCustomerById(
                    sale.customerId
                );


            return `
                <tr>

                    <td>
                        ${formatDate(
                            sale.date
                        )}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(
                                product
                                    ? product.name
                                    : "Deleted Product"
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            customer
                                ? customer.name
                                : "Walk-in Customer"
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            sale.quantity
                        )}
                    </td>

                    <td>
                        ${formatCurrency(
                            sale.total
                        )}
                    </td>

                    <td>
                        <span
                            class="badge ${
                                Number(
                                    sale.profit
                                ) >= 0
                                    ? "badge-success"
                                    : "badge-danger"
                            }"
                        >
                            ${formatCurrency(
                                sale.profit
                            )}
                        </span>
                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                type="button"
                                class="action-btn view"
                                title="View receipt"
                                onclick="viewReceipt('${sale.id}')"
                            >
                                🧾
                            </button>

                            <button
                                type="button"
                                class="action-btn delete"
                                title="Delete sale"
                                onclick="deleteSale('${sale.id}')"
                            >
                                🗑️
                            </button>

                        </div>

                    </td>

                </tr>
            `;
        })
        .join("");
}


function openSaleModal(saleId = "") {

    const modal =
        getElement("saleModal");

    const form =
        getElement("saleForm");

    if (!modal || !form) {
        return;
    }


    form.reset();


    getElement("saleId").value = "";

    getElement("saleDate").value =
        getToday();

    getElement("saleQuantity").value =
        1;

    getElement("salePrice").value =
        "";


    getElement("saleTotalPreview").textContent =
        formatCurrency(0);


    getElement("saleModalTitle").textContent =
        "Record Sale";


    populateSaleProducts();

    populateSaleCustomers();


    if (saleId) {

        const sale =
            appData.sales.find(
                item => item.id === saleId
            );

        if (!sale) {
            return;
        }


        getElement("saleId").value =
            sale.id;

        getElement("saleDate").value =
            sale.date;

        getElement("saleProduct").value =
            sale.productId;

        getElement("saleCustomer").value =
            sale.customerId || "";

        getElement("saleQuantity").value =
            sale.quantity;

        getElement("salePrice").value =
            sale.price;

        getElement("saleNotes").value =
            sale.notes || "";


        getElement("saleModalTitle").textContent =
            "Edit Sale";


        updateSaleTotalPreview();
    }


    openModal("saleModal");
}


function populateSaleProducts() {

    const select =
        getElement("saleProduct");

    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    select.innerHTML = `
        <option value="">
            Select product
        </option>
    `;


    appData.products.forEach(product => {

        const option =
            document.createElement("option");

        option.value =
            product.id;

        option.textContent =
            `${product.name} — ${formatCurrency(
                product.sellingPrice
            )}`;

        select.appendChild(option);
    });


    if (
        appData.products.some(
            product =>
                product.id ===
                currentValue
        )
    ) {
        select.value =
            currentValue;
    }
}


function populateSaleCustomers() {

    const select =
        getElement("saleCustomer");

    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    select.innerHTML = `
        <option value="">
            Walk-in Customer
        </option>
    `;


    appData.customers.forEach(customer => {

        const option =
            document.createElement("option");

        option.value =
            customer.id;

        option.textContent =
            customer.name;

        select.appendChild(option);
    });


    if (
        appData.customers.some(
            customer =>
                customer.id ===
                currentValue
        )
    ) {
        select.value =
            currentValue;
    }
}


function updateSalePriceFromProduct() {

    const productSelect =
        getElement("saleProduct");

    const priceInput =
        getElement("salePrice");


    if (!productSelect || !priceInput) {
        return;
    }


    const product =
        getProductById(
            productSelect.value
        );


    if (!product) {
        priceInput.value = "";

        updateSaleTotalPreview();

        return;
    }


    priceInput.value =
        product.sellingPrice;


    updateSaleTotalPreview();
}


function updateSaleTotalPreview() {

    const quantity =
        Number(
            getElement("saleQuantity")?.value
        ) || 0;


    const price =
        Number(
            getElement("salePrice")?.value
        ) || 0;


    const total =
        quantity * price;


    const preview =
        getElement("saleTotalPreview");


    if (preview) {
        preview.textContent =
            formatCurrency(total);
    }
}


function deleteSale(id) {

    const sale =
        appData.sales.find(
            item => item.id === id
        );

    if (!sale) {
        return;
    }


    const product =
        getProductById(
            sale.productId
        );


    const confirmed =
        window.confirm(
            "Delete this sale?"
        );


    if (!confirmed) {
        return;
    }


    /*
       Return sold quantity to stock.
    */
    if (product) {

        product.stock =
            Number(product.stock || 0) +
            Number(sale.quantity || 0);
    }


    appData.sales =
        appData.sales.filter(
            item => item.id !== id
        );


    saveData();

    refreshApplication();


    showToast(
        "Sale Deleted",
        "The sale was removed and stock was restored.",
        "success"
    );
}


/* =========================================================
   EXPENSE MANAGEMENT
========================================================= */

function renderExpenses(searchTerm = "") {

    const tbody =
        getElement("expensesTableBody");

    const empty =
        getElement("expensesEmpty");

    if (!tbody || !empty) {
        return;
    }


    const search =
        searchTerm
            .trim()
            .toLowerCase();


    const expenses =
        [...appData.expenses]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .filter(expense => {

                if (!search) {
                    return true;
                }


                const text =
                    [
                        expense.name,
                        expense.category,
                        expense.notes,
                        expense.date
                    ]
                        .join(" ")
                        .toLowerCase();


                return text.includes(search);
            });


    tbody.innerHTML = "";


    if (expenses.length === 0) {

        empty.classList.add("show");

        return;
    }


    empty.classList.remove("show");


    tbody.innerHTML =
        expenses.map(expense => {

            return `
                <tr>

                    <td>
                        ${formatDate(
                            expense.date
                        )}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(
                                expense.name
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            expense.category ||
                            "Other"
                        )}
                    </td>

                    <td>
                        <strong>
                            ${formatCurrency(
                                expense.amount
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            expense.notes ||
                            "---"
                        )}
                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                type="button"
                                class="action-btn edit"
                                title="Edit expense"
                                onclick="editExpense('${expense.id}')"
                            >
                                ✏️
                            </button>

                            <button
                                type="button"
                                class="action-btn delete"
                                title="Delete expense"
                                onclick="deleteExpense('${expense.id}')"
                            >
                                🗑️
                            </button>

                        </div>

                    </td>

                </tr>
            `;
        })
        .join("");
}


function openExpenseModal(expenseId = "") {

    const modal =
        getElement("expenseModal");

    const form =
        getElement("expenseForm");

    if (!modal || !form) {
        return;
    }


    form.reset();


    getElement("expenseId").value = "";

    getElement("expenseDate").value =
        getToday();


    getElement("expenseModalTitle").textContent =
        "Add Expense";


    if (expenseId) {

        const expense =
            appData.expenses.find(
                item =>
                    item.id === expenseId
            );

        if (!expense) {
            return;
        }


        getElement("expenseId").value =
            expense.id;

        getElement("expenseDate").value =
            expense.date;

        getElement("expenseName").value =
            expense.name;

        getElement("expenseCategory").value =
            expense.category || "Other";

        getElement("expenseAmount").value =
            expense.amount;

        getElement("expenseNotes").value =
            expense.notes || "";


        getElement("expenseModalTitle").textContent =
            "Edit Expense";
    }


    openModal("expenseModal");
}


function editExpense(id) {
    openExpenseModal(id);
}


function deleteExpense(id) {

    const expense =
        appData.expenses.find(
            item => item.id === id
        );

    if (!expense) {
        return;
    }


    const confirmed =
        window.confirm(
            `Delete "${expense.name}"?`
        );


    if (!confirmed) {
        return;
    }


    appData.expenses =
        appData.expenses.filter(
            item => item.id !== id
        );


    saveData();

    refreshApplication();


    showToast(
        "Expense Deleted",
        "The expense was removed.",
        "success"
    );
}


/* =========================================================
   CUSTOMER MANAGEMENT
========================================================= */

function renderCustomers(searchTerm = "") {

    const tbody =
        getElement("customersTableBody");

    const empty =
        getElement("customersEmpty");

    if (!tbody || !empty) {
        return;
    }


    const search =
        searchTerm
            .trim()
            .toLowerCase();


    const customers =
        appData.customers.filter(customer => {

            if (!search) {
                return true;
            }


            const text =
                [
                    customer.name,
                    customer.phone,
                    customer.email,
                    customer.address
                ]
                    .join(" ")
                    .toLowerCase();


            return text.includes(search);
        });


    tbody.innerHTML = "";


    if (customers.length === 0) {

        empty.classList.add("show");

        return;
    }


    empty.classList.remove("show");


    tbody.innerHTML =
        customers.map(customer => {

            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(
                                customer.name
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            customer.phone ||
                            "---"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            customer.email ||
                            "---"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            customer.address ||
                            "---"
                        )}
                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                type="button"
                                class="action-btn edit"
                                title="Edit customer"
                                onclick="editCustomer('${customer.id}')"
                            >
                                ✏️
                            </button>

                            <button
                                type="button"
                                class="action-btn delete"
                                title="Delete customer"
                                onclick="deleteCustomer('${customer.id}')"
                            >
                                🗑️
                            </button>

                        </div>

                    </td>

                </tr>
            `;
        })
        .join("");
}


function openCustomerModal(customerId = "") {

    const modal =
        getElement("customerModal");

    const form =
        getElement("customerForm");

    if (!modal || !form) {
        return;
    }


    form.reset();


    getElement("customerId").value =
        "";


    getElement("customerModalTitle").textContent =
        "Add Customer";


    if (customerId) {

        const customer =
            getCustomerById(
                customerId
            );

        if (!customer) {
            return;
        }


        getElement("customerId").value =
            customer.id;

        getElement("customerName").value =
            customer.name || "";

        getElement("customerPhone").value =
            customer.phone || "";

        getElement("customerEmail").value =
            customer.email || "";

        getElement("customerAddress").value =
            customer.address || "";


        getElement("customerModalTitle").textContent =
            "Edit Customer";
    }


    openModal("customerModal");
}


function editCustomer(id) {
    openCustomerModal(id);
}


function deleteCustomer(id) {

    const customer =
        getCustomerById(id);

    if (!customer) {
        return;
    }


    const confirmed =
        window.confirm(
            `Delete "${customer.name}"?`
        );


    if (!confirmed) {
        return;
    }


    appData.customers =
        appData.customers.filter(
            item => item.id !== id
        );


    saveData();

    refreshApplication();


    showToast(
        "Customer Deleted",
        `${customer.name} was removed.`,
        "success"
    );
}


/* =========================================================
   FORMS
========================================================= */

function initializeForms() {

    const productForm =
        getElement("productForm");

    const saleForm =
        getElement("saleForm");

    const expenseForm =
        getElement("expenseForm");

    const customerForm =
        getElement("customerForm");


    /* PRODUCT */

    if (productForm) {

        productForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                saveProduct();
            }
        );
    }


    /* SALE */

    if (saleForm) {

        saleForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                saveSale();
            }
        );
    }


    /* EXPENSE */

    if (expenseForm) {

        expenseForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                saveExpense();
            }
        );
    }


    /* CUSTOMER */

    if (customerForm) {

        customerForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                saveCustomer();
            }
        );
    }


    const saleProduct =
        getElement("saleProduct");

    const saleQuantity =
        getElement("saleQuantity");

    const salePrice =
        getElement("salePrice");


    if (saleProduct) {

        saleProduct.addEventListener(
            "change",
            updateSalePriceFromProduct
        );
    }


    if (saleQuantity) {

        saleQuantity.addEventListener(
            "input",
            updateSaleTotalPreview
        );
    }


    if (salePrice) {

        salePrice.addEventListener(
            "input",
            updateSaleTotalPreview
        );
    }
}


/* =========================================================
   SAVE PRODUCT
========================================================= */

function saveProduct() {

    const id =
        getElement("productId").value.trim();

    const name =
        getElement("productName").value.trim();

    const category =
        getElement("productCategory").value.trim();

    const stock =
        Number(
            getElement("productStock").value
        );

    const costPrice =
        Number(
            getElement("productCostPrice").value
        );

    const sellingPrice =
        Number(
            getElement("productSellingPrice").value
        );


    if (!name) {

        showToast(
            "Missing Information",
            "Enter a product name.",
            "error"
        );

        return;
    }


    if (
        !Number.isFinite(stock) ||
        stock < 0
    ) {

        showToast(
            "Invalid Stock",
            "Enter a valid stock quantity.",
            "error"
        );

        return;
    }


    if (
        !Number.isFinite(costPrice) ||
        costPrice < 0
    ) {

        showToast(
            "Invalid Cost Price",
            "Enter a valid cost price.",
            "error"
        );

        return;
    }


    if (
        !Number.isFinite(sellingPrice) ||
        sellingPrice < 0
    ) {

        showToast(
            "Invalid Selling Price",
            "Enter a valid selling price.",
            "error"
        );

        return;
    }


    if (id) {

        const product =
            getProductById(id);

        if (!product) {
            return;
        }


        product.name =
            name;

        product.category =
            category;

        product.stock =
            stock;

        product.costPrice =
            costPrice;

        product.sellingPrice =
            sellingPrice;


        saveData();

        refreshApplication();

        closeModal("productModal");


        showToast(
            "Product Updated",
            `${name} was updated successfully.`,
            "success"
        );

        return;
    }


    appData.products.push({

        id: generateId("product"),

        name,

        category,

        stock,

        costPrice,

        sellingPrice,

        createdAt:
            new Date().toISOString()
    });


    saveData();

    refreshApplication();

    closeModal("productModal");


    showToast(
        "Product Added",
        `${name} was added successfully.`,
        "success"
    );
}


/* =========================================================
   SAVE SALE
========================================================= */

function saveSale() {

    const id =
        getElement("saleId").value.trim();

    const date =
        getElement("saleDate").value;

    const productId =
        getElement("saleProduct").value;

    const customerId =
        getElement("saleCustomer").value;

    const quantity =
        Number(
            getElement("saleQuantity").value
        );

    const price =
        Number(
            getElement("salePrice").value
        );

    const notes =
        getElement("saleNotes").value.trim();


    if (!date) {

        showToast(
            "Missing Date",
            "Select the sale date.",
            "error"
        );

        return;
    }


    const product =
        getProductById(productId);


    if (!product) {

        showToast(
            "Product Required",
            "Select a valid product.",
            "error"
        );

        return;
    }


    if (
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {

        showToast(
            "Invalid Quantity",
            "Enter a valid quantity.",
            "error"
        );

        return;
    }


    if (
        !Number.isFinite(price) ||
        price < 0
    ) {

        showToast(
            "Invalid Price",
            "Enter a valid selling price.",
            "error"
        );

        return;
    }


    const total =
        quantity * price;


    /*
       EDITING EXISTING SALE
    */

    if (id) {

        const sale =
            appData.sales.find(
                item => item.id === id
            );


        if (!sale) {
            return;
        }


        /*
           Restore the old quantity first.
        */

        const oldProduct =
            getProductById(
                sale.productId
            );


        if (oldProduct) {

            oldProduct.stock =
                Number(
                    oldProduct.stock || 0
                ) +
                Number(
                    sale.quantity || 0
                );
        }


        /*
           Check the new quantity.
        */

        if (
            product.stock <
            quantity
        ) {

            /*
               Restore the original stock
               because the sale cannot be updated.
            */

            if (oldProduct) {

                oldProduct.stock =
                    Number(
                        oldProduct.stock || 0
                    ) -
                    Number(
                        sale.quantity || 0
                    );
            }


            showToast(
                "Insufficient Stock",
                `Only ${formatNumber(
                    product.stock
                )} unit(s) are available.`,
                "error"
            );

            return;
        }


        product.stock =
            Number(product.stock || 0) -
            quantity;


        const profit =
            (
                price -
                Number(
                    product.costPrice || 0
                )
            ) *
            quantity;


        sale.date =
            date;

        sale.productId =
            productId;

        sale.customerId =
            customerId;

        sale.quantity =
            quantity;

        sale.price =
            price;

        sale.total =
            total;

        sale.profit =
            profit;

        sale.notes =
            notes;


        saveData();

        refreshApplication();

        closeModal("saleModal");


        showToast(
            "Sale Updated",
            "The sale was updated successfully.",
            "success"
        );

        return;
    }


    /*
       NEW SALE
    */

    if (
        Number(product.stock || 0) <
        quantity
    ) {

        showToast(
            "Insufficient Stock",
            `Only ${formatNumber(
                product.stock
            )} unit(s) are available.`,
            "error"
        );

        return;
    }


    const profit =
        (
            price -
            Number(
                product.costPrice || 0
            )
        ) *
        quantity;


    product.stock =
        Number(product.stock || 0) -
        quantity;


    appData.sales.push({

        id: generateId("sale"),

        date,

        productId,

        customerId,

        quantity,

        price,

        total,

        profit,

        notes,

        createdAt:
            new Date().toISOString()
    });


    saveData();

    refreshApplication();

    closeModal("saleModal");


    showToast(
        "Sale Recorded",
        `Sale of ${formatNumber(
            quantity
        )} unit(s) recorded successfully.`,
        "success"
    );
}


/* =========================================================
   SAVE EXPENSE
========================================================= */

function saveExpense() {

    const id =
        getElement("expenseId").value.trim();

    const date =
        getElement("expenseDate").value;

    const name =
        getElement("expenseName").value.trim();

    const category =
        getElement("expenseCategory").value;

    const amount =
        Number(
            getElement("expenseAmount").value
        );

    const notes =
        getElement("expenseNotes").value.trim();


    if (!date || !name) {

        showToast(
            "Missing Information",
            "Enter the expense date and name.",
            "error"
        );

        return;
    }


    if (
        !Number.isFinite(amount) ||
        amount < 0
    ) {

        showToast(
            "Invalid Amount",
            "Enter a valid expense amount.",
            "error"
        );

        return;
    }


    if (id) {

        const expense =
            appData.expenses.find(
                item => item.id === id
            );

        if (!expense) {
            return;
        }


        expense.date =
            date;

        expense.name =
            name;

        expense.category =
            category;

        expense.amount =
            amount;

        expense.notes =
            notes;


        saveData();

        refreshApplication();

        closeModal("expenseModal");


        showToast(
            "Expense Updated",
            "The expense was updated successfully.",
            "success"
        );

        return;
    }


    appData.expenses.push({

        id: generateId("expense"),

        date,

        name,

        category,

        amount,

        notes,

        createdAt:
            new Date().toISOString()
    });


    saveData();

    refreshApplication();

    closeModal("expenseModal");


    showToast(
        "Expense Added",
        `${name} was added successfully.`,
        "success"
    );
}


/* =========================================================
   SAVE CUSTOMER
========================================================= */

function saveCustomer() {

    const id =
        getElement("customerId").value.trim();

    const name =
        getElement("customerName").value.trim();

    const phone =
        getElement("customerPhone").value.trim();

    const email =
        getElement("customerEmail").value.trim();

    const address =
        getElement("customerAddress").value.trim();


    if (!name) {

        showToast(
            "Missing Name",
            "Enter the customer's name.",
            "error"
        );

        return;
    }


    if (id) {

        const customer =
            getCustomerById(id);

        if (!customer) {
            return;
        }


        customer.name =
            name;

        customer.phone =
            phone;

        customer.email =
            email;

        customer.address =
            address;


        saveData();

        refreshApplication();

        closeModal("customerModal");


        showToast(
            "Customer Updated",
            `${name} was updated successfully.`,
            "success"
        );

        return;
    }


    appData.customers.push({

        id: generateId("customer"),

        name,

        phone,

        email,

        address,

        createdAt:
            new Date().toISOString()
    });


    saveData();

    refreshApplication();

    closeModal("customerModal");


    showToast(
        "Customer Added",
        `${name} was added successfully.`,
        "success"
    );
}


/* =========================================================
   SEARCH
========================================================= */

function initializeSearch() {

    const productSearch =
        getElement("productSearch");

    const salesSearch =
        getElement("salesSearch");

    const expenseSearch =
        getElement("expenseSearch");

    const customerSearch =
        getElement("customerSearch");


    if (productSearch) {

        productSearch.addEventListener(
            "input",
            () =>
                renderProducts(
                    productSearch.value
                )
        );
    }


    if (salesSearch) {

        salesSearch.addEventListener(
            "input",
            () =>
                renderSales(
                    salesSearch.value
                )
        );
    }


    if (expenseSearch) {

        expenseSearch.addEventListener(
            "input",
            () =>
                renderExpenses(
                    expenseSearch.value
                )
        );
    }


    if (customerSearch) {

        customerSearch.addEventListener(
            "input",
            () =>
                renderCustomers(
                    customerSearch.value
                )
        );
    }
}


/* =========================================================
   MODALS
========================================================= */

function initializeModals() {

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


    document.querySelectorAll(
        ".modal"
    ).forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    closeModal(
                        modal.id
                    );
                }
            }
        );
    });


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                document
                    .querySelectorAll(
                        ".modal.show"
                    )
                    .forEach(modal => {

                        closeModal(
                            modal.id
                        );
                    });
            }
        }
    );
}


function openModal(id) {

    const modal =
        getElement(id);

    if (!modal) {
        return;
    }


    modal.classList.add("show");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";
}


function closeModal(id) {

    const modal =
        getElement(id);

    if (!modal) {
        return;
    }


    modal.classList.remove("show");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (
        document.querySelectorAll(
            ".modal.show"
        ).length === 0
    ) {

        document.body.style.overflow =
            "";
    }
}


/* =========================================================
   RECEIPT
========================================================= */

function viewReceipt(id) {

    const sale =
        appData.sales.find(
            item => item.id === id
        );

    if (!sale) {
        return;
    }


    const product =
        getProductById(
            sale.productId
        );


    const customer =
        getCustomerById(
            sale.customerId
        );


    getElement("receiptNumber").textContent =
        sale.id.substring(0, 12).toUpperCase();


    getElement("receiptDate").textContent =
        formatDate(sale.date);


    getElement("receiptCustomer").textContent =
        customer
            ? customer.name
            : "Walk-in Customer";


    getElement("receiptProduct").textContent =
        product
            ? product.name
            : "Deleted Product";


    getElement("receiptQuantity").textContent =
        formatNumber(
            sale.quantity
        );


    getElement("receiptAmount").textContent =
        formatCurrency(
            sale.price
        );


    getElement("receiptTotal").textContent =
        formatCurrency(
            sale.total
        );


    updateBusinessInformation();


    openModal("receiptModal");
}


function printReceipt() {

    const receipt =
        getElement("receiptContent");

    if (!receipt) {
        return;
    }


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=500,height=700"
        );


    if (!printWindow) {

        showToast(
            "Print Blocked",
            "Allow pop-ups in your browser to print the receipt.",
            "error"
        );

        return;
    }


    printWindow.document.write(`
        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Sales Receipt
            </title>

            <style>

                * {
                    box-sizing:border-box;
                }

                body {
                    font-family:
                        Arial,
                        sans-serif;

                    padding:25px;

                    color:#172033;
                }

                .receipt {
                    max-width:450px;
                    margin:auto;
                }

                .receipt-business {
                    text-align:center;
                }

                .receipt-logo {
                    width:45px;
                    height:45px;
                    margin:0 auto 8px;

                    border-radius:12px;

                    background:#f4d35e;

                    display:flex;
                    align-items:center;
                    justify-content:center;

                    font-size:20px;
                    font-weight:bold;
                }

                .receipt-business h2 {
                    margin:0 0 5px;
                }

                .receipt-business p {
                    margin:2px 0;

                    font-size:12px;

                    color:#697386;
                }

                .receipt-divider {
                    border-top:1px dashed #aaa;

                    margin:18px 0;
                }

                .receipt-details {
                    display:grid;

                    grid-template-columns:
                        repeat(3,1fr);

                    gap:10px;
                }

                .receipt-details span {
                    display:block;

                    font-size:9px;

                    color:#888;

                    margin-bottom:3px;
                }

                .receipt-details strong {
                    font-size:10px;
                }

                .receipt-item {
                    display:grid;

                    grid-template-columns:
                        1fr 50px 90px;

                    gap:10px;

                    font-size:11px;

                    padding:6px 0;
                }

                .receipt-item span:last-child {
                    text-align:right;
                }

                .receipt-item span:nth-child(2) {
                    text-align:center;
                }

                .receipt-total {
                    display:flex;

                    justify-content:space-between;

                    font-weight:bold;

                    font-size:15px;
                }

                .receipt-footer {
                    text-align:center;

                    margin-top:25px;

                    color:#888;

                    font-size:11px;
                }

            </style>

        </head>

        <body>

            ${receipt.outerHTML}

            <script>

                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };

            <\/script>

        </body>

        </html>
    `);


    printWindow.document.close();
}


/* =========================================================
   REPORTS
========================================================= */

function initializeReports() {

    const range =
        getElement("reportRange");

    const chartRange =
        getElement("salesChartRange");

    const printBtn =
        getElement("printReportBtn");


    if (range) {

        range.addEventListener(
            "change",
            () => {

                currentReportRange =
                    range.value;

                updateReports();
            }
        );
    }


    if (chartRange) {

        chartRange.addEventListener(
            "change",
            renderSalesChart
        );
    }


    if (printBtn) {

        printBtn.addEventListener(
            "click",
            () => {

                openPage("reports");

                setTimeout(
                    () => window.print(),
                    200
                );
            }
        );
    }
}


function getDateRangeStart(range) {

    if (range === "all") {
        return null;
    }


    const days =
        Number(range);


    if (!Number.isFinite(days)) {
        return null;
    }


    const date =
        new Date();


    date.setHours(
        0,
        0,
        0,
        0
    );


    date.setDate(
        date.getDate() -
        (days - 1)
    );


    return date;
}


function isWithinRange(
    dateString,
    range
) {

    if (range === "all") {
        return true;
    }


    const start =
        getDateRangeStart(range);


    if (!start) {
        return true;
    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date >= start;
}


function updateReports() {

    const range =
        currentReportRange;


    const filteredSales =
        appData.sales.filter(
            sale =>
                isWithinRange(
                    sale.date,
                    range
                )
        );


    const filteredExpenses =
        appData.expenses.filter(
            expense =>
                isWithinRange(
                    expense.date,
                    range
                )
        );


    const revenue =
        filteredSales.reduce(
            (sum, sale) =>
                sum +
                Number(
                    sale.total || 0
                ),
            0
        );


    const expenses =
        filteredExpenses.reduce(
            (sum, expense) =>
                sum +
                Number(
                    expense.amount || 0
                ),
            0
        );


    const profit =
        revenue -
        expenses;


    const reportRevenue =
        getElement("reportRevenue");

    const reportExpenses =
        getElement("reportExpenses");

    const reportProfit =
        getElement("reportProfit");

    const reportTransactions =
        getElement("reportTransactions");


    if (reportRevenue) {
        reportRevenue.textContent =
            formatCurrency(revenue);
    }


    if (reportExpenses) {
        reportExpenses.textContent =
            formatCurrency(expenses);
    }


    if (reportProfit) {

        reportProfit.textContent =
            formatCurrency(profit);

        reportProfit.style.color =
            profit < 0
                ? "#d93025"
                : "";
    }


    if (reportTransactions) {
        reportTransactions.textContent =
            formatNumber(
                filteredSales.length
            );
    }


    renderReportSummary(
        revenue,
        expenses,
        profit
    );


    renderTopProducts(
        filteredSales
    );
}


function renderReportSummary(
    revenue,
    expenses,
    profit
) {

    const container =
        getElement("reportSummary");

    if (!container) {
        return;
    }


    if (
        revenue === 0 &&
        expenses === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    📊
                </div>

                <h4>
                    No report data
                </h4>

                <p>
                    Record sales and expenses to
                    generate your report.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML = `
        <div class="summary-list">

            <div class="summary-row">

                <span>
                    Total Revenue
                </span>

                <strong>
                    ${formatCurrency(revenue)}
                </strong>

            </div>


            <div class="summary-row">

                <span>
                    Total Expenses
                </span>

                <strong>
                    ${formatCurrency(expenses)}
                </strong>

            </div>


            <div class="summary-row profit-row">

                <span>
                    Net Profit
                </span>

                <strong>
                    ${formatCurrency(profit)}
                </strong>

            </div>


            <div class="summary-row">

                <span>
                    Profit Margin
                </span>

                <strong>
                    ${
                        revenue > 0
                            ? (
                                (
                                    profit /
                                    revenue
                                ) *
                                100
                            ).toFixed(1)
                            : "0.0"
                    }%
                </strong>

            </div>

        </div>
    `;
}


function renderTopProducts(
    sales
) {

    const container =
        getElement("topProducts");

    if (!container) {
        return;
    }


    const productMap = {};


    sales.forEach(sale => {

        if (!productMap[sale.productId]) {

            productMap[sale.productId] = {
                quantity: 0,
                revenue: 0
            };
        }


        productMap[sale.productId].quantity +=
            Number(
                sale.quantity || 0
            );


        productMap[sale.productId].revenue +=
            Number(
                sale.total || 0
            );
    });


    const products =
        Object.entries(productMap)
            .map(
                ([productId, values]) => {

                    const product =
                        getProductById(
                            productId
                        );


                    return {
                        name:
                            product
                                ? product.name
                                : "Deleted Product",

                        quantity:
                            values.quantity,

                        revenue:
                            values.revenue
                    };
                }
            )
            .sort(
                (a, b) =>
                    b.revenue -
                    a.revenue
            )
            .slice(0, 5);


    if (products.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    📦
                </div>

                <h4>
                    No product data
                </h4>

                <p>
                    Sales information will appear here.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        products.map(
            (product, index) => {

                return `
                    <div class="top-product-item">

                        <div class="top-product-rank">
                            ${index + 1}
                        </div>

                        <div class="top-product-info">

                            <strong>
                                ${escapeHTML(
                                    product.name
                                )}
                            </strong>

                            <small>
                                ${formatNumber(
                                    product.quantity
                                )}
                                unit(s) sold
                            </small>

                        </div>

                        <div class="top-product-value">
                            ${formatCurrency(
                                product.revenue
                            )}
                        </div>

                    </div>
                `;
            }
        )
        .join("");
}


/* =========================================================
   SETTINGS
========================================================= */

function initializeSettings() {

    const form =
        getElement(
            "businessSettingsForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                saveBusinessSettings();
            }
        );
    }


    const exportBtn =
        getElement("exportDataBtn");

    const importBtn =
        getElement("importDataBtn");

    const importFile =
        getElement("importFile");

    const clearBtn =
        getElement("clearDataBtn");


    if (exportBtn) {

        exportBtn.addEventListener(
            "click",
            exportData
        );
    }


    if (importBtn) {

        importBtn.addEventListener(
            "click",
            () => {

                if (importFile) {
                    importFile.click();
                }
            }
        );
    }


    if (importFile) {

        importFile.addEventListener(
            "change",
            handleImportFile
        );
    }


    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            clearAllData
        );
    }
}


function updateSettingsForm() {

    const name =
        getElement("businessName");

    const phone =
        getElement("businessPhone");

    const address =
        getElement("businessAddress");


    if (name) {
        name.value =
            appData.business.name || "";
    }


    if (phone) {
        phone.value =
            appData.business.phone || "";
    }


    if (address) {
        address.value =
            appData.business.address || "";
    }
}


function saveBusinessSettings() {

    const name =
        getElement("businessName")
            .value
            .trim();


    const phone =
        getElement("businessPhone")
            .value
            .trim();


    const address =
        getElement("businessAddress")
            .value
            .trim();


    if (!name) {

        showToast(
            "Business Name Required",
            "Enter your business name.",
            "error"
        );

        return;
    }


    appData.business.name =
        name;

    appData.business.phone =
        phone;

    appData.business.address =
        address;


    saveData();

    updateBusinessInformation();


    showToast(
        "Settings Saved",
        "Your business information has been updated.",
        "success"
    );
}


/* =========================================================
   EXPORT DATA
========================================================= */

function exportData() {

    const data =
        JSON.stringify(
            appData,
            null,
            2
        );


    const blob =
        new Blob(
            [data],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement("a");


    const businessName =
        (
            appData.business.name ||
            "business"
        )
            .replace(
                /[^a-z0-9]/gi,
                "_"
            );


    link.href =
        url;

    link.download =
        `${businessName}_profit_analyzer_backup.json`;


    document.body.appendChild(link);

    link.click();

    link.remove();


    URL.revokeObjectURL(url);


    showToast(
        "Data Exported",
        "Your business data has been downloaded.",
        "success"
    );
}


/* =========================================================
   IMPORT DATA
========================================================= */

function handleImportFile(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload = function() {

        try {

            const imported =
                JSON.parse(
                    reader.result
                );


            if (
                !imported ||
                typeof imported !==
                    "object"
            ) {

                throw new Error(
                    "Invalid data"
                );
            }


            appData = {

                business: {
                    ...defaultData.business,
                    ...(imported.business || {})
                },

                products:
                    Array.isArray(
                        imported.products
                    )
                        ? imported.products
                        : [],

                sales:
                    Array.isArray(
                        imported.sales
                    )
                        ? imported.sales
                        : [],

                expenses:
                    Array.isArray(
                        imported.expenses
                    )
                        ? imported.expenses
                        : [],

                customers:
                    Array.isArray(
                        imported.customers
                    )
                        ? imported.customers
                        : []
            };


            saveData();

            refreshApplication();


            showToast(
                "Data Imported",
                "Your business data was restored successfully.",
                "success"
            );


        } catch (error) {

            console.error(
                "Import error:",
                error
            );


            showToast(
                "Import Failed",
                "The selected file is not a valid Profit Analyzer backup.",
                "error"
            );
        }


        event.target.value = "";
    };


    reader.onerror = function() {

        showToast(
            "Import Failed",
            "Unable to read the selected file.",
            "error"
        );

        event.target.value = "";
    };


    reader.readAsText(file);
}


/* =========================================================
   CLEAR ALL DATA
========================================================= */

function clearAllData() {

    const confirmed =
        window.confirm(
            "This will permanently remove all products, sales, expenses, customers and business information from this device. Continue?"
        );


    if (!confirmed) {
        return;
    }


    const secondConfirmation =
        window.confirm(
            "Are you absolutely sure? Make sure you have exported a backup if you need your data later."
        );


    if (!secondConfirmation) {
        return;
    }


    appData =
        JSON.parse(
            JSON.stringify(
                defaultData
            )
        );


    saveData();

    refreshApplication();


    showToast(
        "Data Cleared",
        "All business data has been removed from this device.",
        "success"
    );
}


/* =========================================================
   DATES
========================================================= */

function setDefaultDates() {

    const saleDate =
        getElement("saleDate");

    const expenseDate =
        getElement("expenseDate");


    if (saleDate) {
        saleDate.value =
            getToday();
    }


    if (expenseDate) {
        expenseDate.value =
            getToday();
    }
}


/* =========================================================
   TOAST NOTIFICATIONS
========================================================= */

function showToast(
    title,
    message,
    type = "success"
) {

    const toast =
        getElement("toast");

    const toastTitle =
        getElement("toastTitle");

    const toastMessage =
        getElement("toastMessage");

    const toastIcon =
        getElement("toastIcon");


    if (
        !toast ||
        !toastTitle ||
        !toastMessage ||
        !toastIcon
    ) {
        return;
    }


    toastTitle.textContent =
        title;

    toastMessage.textContent =
        message;


    if (type === "error") {

        toastIcon.textContent =
            "×";

        toastIcon.style.color =
            "#ff8f86";

    } else {

        toastIcon.textContent =
            "✓";

        toastIcon.style.color =
            "#f4d35e";
    }


    toast.classList.add("show");


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            4000
        );
}


const toastClose =
    getElement("toastClose");


if (toastClose) {

    toastClose.addEventListener(
        "click",
        () => {

            const toast =
                getElement("toast");

            if (toast) {
                toast.classList.remove(
                    "show"
                );
            }
        }
    );
}


/* =========================================================
   PRINT RECEIPT BUTTON
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const printReceiptBtn =
            getElement(
                "printReceiptBtn"
            );


        if (printReceiptBtn) {

            printReceiptBtn.addEventListener(
                "click",
                printReceipt
            );
        }
    }
);


/* =========================================================
   WINDOW RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        /*
           Redraw chart after resizing.
        */

        const dashboard =
            getElement(
                "dashboardPage"
            );


        if (
            dashboard &&
            dashboard.classList.contains(
                "active"
            )
        ) {
            renderSalesChart();
        }
    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   Required by inline action buttons.
========================================================= */

window.editProduct =
    editProduct;

window.deleteProduct =
    deleteProduct;

window.deleteSale =
    deleteSale;

window.viewReceipt =
    viewReceipt;

window.editExpense =
    editExpense;

window.deleteExpense =
    deleteExpense;

window.editCustomer =
    editCustomer;

window.deleteCustomer =
    deleteCustomer;