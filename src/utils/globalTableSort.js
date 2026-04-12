function parseValue(raw) {
  const value = String(raw || "").trim();
  if (!value) return { type: "text", value: "" };

  const numberCandidate = value.replace(/\./g, "").replace(/,/g, ".").replace(/[^0-9.-]/g, "");
  const numeric = Number(numberCandidate);
  if (!Number.isNaN(numeric) && /\d/.test(numberCandidate)) {
    return { type: "number", value: numeric };
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return { type: "date", value: date.getTime() };
  }

  return { type: "text", value: value.toLocaleLowerCase("es") };
}

function compareCells(aText, bText) {
  const a = parseValue(aText);
  const b = parseValue(bText);

  if (a.type === b.type) {
    if (a.value < b.value) return -1;
    if (a.value > b.value) return 1;
    return 0;
  }

  return String(aText || "").localeCompare(String(bText || ""), "es", { sensitivity: "base" });
}

function getCellText(row, index) {
  const cell = row.children[index];
  if (!cell) return "";
  return (cell.innerText || cell.textContent || "").trim();
}

function clearHeaderState(headers) {
  headers.forEach((th) => {
    th.classList.remove("global-sort-active", "global-sort-asc", "global-sort-desc");
    const indicator = th.querySelector(".global-sort-indicator");
    if (indicator) indicator.textContent = "↕";
  });
}

function ensureIndicator(th) {
  if (th.querySelector(".global-sort-indicator")) return;

  const indicator = document.createElement("span");
  indicator.className = "global-sort-indicator";
  indicator.textContent = "↕";
  th.appendChild(indicator);
}

function sortTableByColumn(table, index, direction) {
  const body = table.tBodies && table.tBodies[0];
  if (!body) return;

  const rows = Array.from(body.rows);
  rows.sort((a, b) => {
    const cmp = compareCells(getCellText(a, index), getCellText(b, index));
    return direction === "desc" ? -cmp : cmp;
  });

  rows.forEach((row) => body.appendChild(row));
}

function setupTable(table) {
  if (!table || table.dataset.globalSortReady === "1") return;
  if (table.dataset.noGlobalSort === "1") return;

  const headers = Array.from(table.querySelectorAll("thead th"));
  if (!headers.length) return;

  // Respetar tablas con ordenamiento propio por cabeceras.
  if (headers.some((th) => th.getAttribute("role") === "button" || th.dataset.sortManaged === "1")) {
    return;
  }

  headers.forEach((th, index) => {
    ensureIndicator(th);
    th.classList.add("global-sort-header");

    th.addEventListener("click", () => {
      const wasActive = th.classList.contains("global-sort-active");
      const wasAsc = th.classList.contains("global-sort-asc");
      const direction = !wasActive ? "asc" : (wasAsc ? "desc" : "asc");

      clearHeaderState(headers);
      th.classList.add("global-sort-active", direction === "asc" ? "global-sort-asc" : "global-sort-desc");
      const indicator = th.querySelector(".global-sort-indicator");
      if (indicator) indicator.textContent = direction === "asc" ? "↑" : "↓";

      sortTableByColumn(table, index, direction);
    });
  });

  table.dataset.globalSortReady = "1";
}

function scanTables(root = document) {
  const tables = Array.from(root.querySelectorAll("table.table"));
  tables.forEach(setupTable);
}

export function initGlobalTableSort() {
  scanTables(document);

  const observer = new MutationObserver((mutations) => {
    const shouldScan = mutations.some((m) => m.addedNodes && m.addedNodes.length > 0);
    if (shouldScan) scanTables(document);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return () => observer.disconnect();
}
