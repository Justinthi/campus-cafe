// Constants for pricing and calculations
const PRICES = { coffee: 3.25, sandwich: 8.50, salad: 7.25 };
const TAX_RATE = 0.05;
const STUDENT_RATE = 0.10;
const ECO_FEE = 1.00;
const BULK_QTY = 6;
const BULK_OFF = 2.00;

/*
 * Formats a number as currency with 2 decimal places
 */
function money(n) {
    return `$${n.toFixed(2)}`;
}

/*
 * Trims whitespace and converts inputs to lowercase
 * Handles errors (when user cancels prompt)
 */
function normalizeType(raw) {
     // If raw is null or undefined (user cancelled), return empty string
    if (raw === null || raw === undefined) {
    return "";
    }
    // Trim whitespace and convert to lowercase
    return raw.trim().toLowerCase();
}

/*
 * Validates item type
 */
function isValidType(t) {
    return t === "coffee" || t === "sandwich" || t === "salad";
}

/*
 * Generates a string of emoji icons that represents quantity (capped at 10)
 */
function iconsFor(type, qty) {
    const map = { coffee: "☕", sandwich: "🥪", salad: "🥗" };
    const icon = map[type] || "❓";
    const cap = Math.min(qty, 10);
    let line = "";
    
    for (let i = 0; i < cap; i++) {
        line += icon;
    }
    return line;
}

/*
 * Processes the quote calculation with all pricing rules
 */
function processQuote(type, qty, isStudent, ecoCup) {
  const unitPrice = PRICES[type];
  
  // Compute subtotal
  const subtotal = unitPrice * qty;
  
  // Compute studentDiscount (10% of subtotal if isStudent)
  let studentDiscount;
  if (isStudent) {
    studentDiscount = subtotal * STUDENT_RATE;
  } else {
    studentDiscount = 0;
  }
  
  // ecoFee is only if type is coffee and ecoCup is true
  let ecoFee;
  if (type === "coffee" && ecoCup) {
    ecoFee = ECO_FEE;
  } else {
    ecoFee = 0;
  }
  
  // bulkDiscount is BULK_OFF only if qty >= BULK_QTY
  let bulkDiscount;
  if (qty >= BULK_QTY) {
    bulkDiscount = BULK_OFF;
  } else {
    bulkDiscount = 0;
  }
  
  // Taxable amount is subtotal - studentDiscount + ecoFee - bulkDiscount
  const taxableAmount = subtotal - studentDiscount + ecoFee - bulkDiscount;
  
  // Compute tax and total
  const tax = taxableAmount * TAX_RATE;
  const total = taxableAmount + tax;
  
  // Return an object with all values
  return { 
    unitPrice, 
    subtotal, 
    studentDiscount, 
    ecoFee, 
    bulkDiscount, 
    tax, 
    total 
  };
}

/**
 * Builds a formatted receipt
 */
function buildReceipt(type, qty, isStudent, ecoCup, calc) {
    const icons = iconsFor(type, qty);
    const studentText = isStudent ? "Yes" : "No";
    const ecoText = (type === "coffee") ? (ecoCup ? "Yes" : "No") : "N/A";
    return `CAMPUS CAFÉ RECEIPT
------------
Item: ${type}
Unit price: ${money(calc.unitPrice)}
Quantity: ${qty} ${icons}
Student disc: ${studentText}
Eco cup add-on: ${ecoText}
Subtotal: ${money(calc.subtotal)}
Student -10%: -${money(calc.studentDiscount)}
Eco cup fee: ${money(calc.ecoFee)}
Bulk deal: -${money(calc.bulkDiscount)}
Tax (5%): ${money(calc.tax)}
------------
TOTAL: ${money(calc.total)}
`;
}

/**
 * Displays a error message in the receipt
 */
function showError(msg) {
    document.getElementById("display").textContent = `ERROR: ${msg}`;
}

/**
 * Resets the receipt display
 */
function resetUI() {
    document.getElementById("display").textContent = "No order data.";
}

/**
 * Fetches and displays weather from Open-Meteo API
 */
async function loadWeather() {
  const box = document.getElementById("weatherBox");
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=53.5461&longitude=-113.4938" +
    "&current=temperature_2m,wind_speed_10m" +
    "&timezone=America/Edmonton";
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    const t = data.current.temperature_2m;
    const w = data.current.wind_speed_10m;
    box.textContent = `Edmonton: ${t}°C • Wind ${w} km/h`;
  } catch {
    box.textContent = "Weather unavailable.";
  }
}

/**
 * Main function
 */
function main() {
    // Load weather on page load
    loadWeather();
    
    // Reset receipt display
    resetUI();
    
    // Get Quote button click handler
    document.getElementById("calcBtn").addEventListener("click", () => {
        // Get item type using prompt
        const type = normalizeType(prompt("Enter item type: coffee / sandwich / salad"));
        
        // Get quantity using prompt and convert to number
        const qty = Number(prompt("Enter quantity (1–10):"));
        
        // Validate item type
        if (!isValidType(type)) {
            showError("Item must be coffee, sandwich, or salad.");
            return;
        }
        
        // Quantity validation: must be a valid number
        if (isNaN(qty)) {
            showError("Quantity must be a valid number.");
            return;
        }
        
        // Quantity validation: must be an integer (no decimals)
        if (!Number.isInteger(qty)) {
            showError("Quantity must be a whole number (integer).");
            return;
        }
        
        // Quantity validation: must be in range 1-10
        if (qty < 1 || qty > 10) {
            howError("Quantity must be between 1 and 10.");
            return;
        }
        
        // Ask for student discount using confirm dialog
        const isStudent = confirm("Student discount? (10% off)");
        
        // Ask for reusable cup fee only if item is coffee
        const ecoCup = (type === "coffee") ? confirm("Add reusable cup? (+$1.00)") : false;
        
        // Process the quote with all inputs
        const calc = processQuote(type, qty, isStudent, ecoCup);
        
        // Display the receipt
        document.getElementById("display").textContent =
        buildReceipt(type, qty, isStudent, ecoCup, calc);
    });
    
    // Reset button click handler
    document.getElementById("resetBtn").addEventListener("click", () => {
        resetUI();
    });
}

main();