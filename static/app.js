const FAVORITES_FILTER = "__favorites__";

const state = {
  brands: [],
  savedBrands: [],
  summary: { active: 0, unassigned: 0 },
  parts: [],
  favoriteIds: new Set(),
  department: localStorage.getItem("ppwork-department") || "parts",
  filters: {
    brand: "",
    family: "",
    model: "",
    category: "",
    q: "",
  },
  editMode: false,
  editingBrandId: "",
  darkTheme: false,
  themeVariant: "classic",
  brandOrderMode: "az",
  customBrandOrder: [],
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  [
    "department-eyebrow",
    "active-count",
    "unassigned-count",
    "brand-list",
    "search-input",
    "family-filter",
    "model-filter",
    "category-filter",
    "edit-toggle",
    "add-button",
    "feedback",
    "part-board",
    "settings-button",
    "part-dialog",
    "part-form",
    "part-id",
    "part-brand",
    "part-family",
    "part-model",
    "part-category",
    "part-item",
    "part-button-text",
    "part-number",
    "part-notes",
    "dialog-title",
    "delete-button",
    "cancel-button",
    "close-dialog",
    "settings-dialog",
    "close-settings",
    "done-settings",
    "department-parts-button",
    "department-service-button",
    "theme-toggle",
    "theme-variant",
    "brand-order-mode",
    "lock-brand-order-button",
    "settings-brand-list",
    "new-brand-button",
    "brand-form",
    "brand-id",
    "brand-name",
    "brand-accent",
    "brand-logo",
    "brand-logo-file",
    "delete-brand-button",
    "saved-brand-list",
  ].forEach((id) => {
    els[toCamel(id)] = document.getElementById(id);
  });

  applyDepartment(state.department);
  applyTheme(localStorage.getItem("ppwork-theme") === "dark");
  applyThemeVariant(localStorage.getItem("ppwork-theme-variant") || "classic");
  applyBrandOrderMode(localStorage.getItem("ppwork-brand-order") || "az");
  wireEvents();
  refreshAll();
});

function wireEvents() {
  els.searchInput.addEventListener(
    "input",
    debounce(() => {
      state.filters.q = els.searchInput.value.trim();
      loadParts();
    }, 160),
  );

  [
    ["family", els.familyFilter],
    ["model", els.modelFilter],
    ["category", els.categoryFilter],
  ].forEach(([key, select]) => {
    select.addEventListener("change", () => {
      state.filters[key] = select.value;
      loadParts();
    });
  });

  els.editToggle.addEventListener("change", () => {
    state.editMode = els.editToggle.checked;
    els.addButton.classList.toggle("is-visible", state.editMode);
    renderParts();
  });

  els.addButton.addEventListener("click", () => openEditor());
  els.settingsButton.addEventListener("click", openSettings);
  els.cancelButton.addEventListener("click", () => els.partDialog.close());
  els.closeDialog.addEventListener("click", () => els.partDialog.close());
  els.partForm.addEventListener("submit", savePart);
  els.deleteButton.addEventListener("click", deletePart);
  els.closeSettings.addEventListener("click", () => els.settingsDialog.close());
  els.doneSettings.addEventListener("click", () => els.settingsDialog.close());
  els.departmentPartsButton.addEventListener("click", () => switchDepartment("parts"));
  els.departmentServiceButton.addEventListener("click", () => switchDepartment("service"));
  els.themeToggle.addEventListener("change", () => applyTheme(els.themeToggle.checked));
  els.themeVariant.addEventListener("change", () => applyThemeVariant(els.themeVariant.value));
  els.brandOrderMode.addEventListener("change", () => setBrandOrderMode(els.brandOrderMode.value));
  els.lockBrandOrderButton.addEventListener("click", lockCustomBrandOrder);
  els.newBrandButton.addEventListener("click", () => openBrandEditor());
  els.brandForm.addEventListener("submit", saveBrand);
  els.deleteBrandButton.addEventListener("click", deleteBrand);
}

async function refreshAll() {
  await Promise.all([loadSummary(), loadBrands()]);
  await loadOptions();
  await loadParts();
}

async function loadSummary() {
  state.summary = await api("/api/summary");
  els.activeCount.textContent = `${state.summary.active} active`;
  els.unassignedCount.textContent = `${state.summary.unassigned} need numbers`;
}

async function loadBrands() {
  const [brands, savedBrands] = await Promise.all([
    api("/api/brands"),
    api("/api/brands/saved"),
  ]);
  state.brands = brands;
  state.savedBrands = savedBrands;
  syncCustomBrandOrder();
  if (state.filters.brand === FAVORITES_FILTER && !hasFavorites()) {
    clearBrandFilters();
  } else if (
    state.filters.brand &&
    state.filters.brand !== FAVORITES_FILTER &&
    !state.brands.some((brand) => brand.name === state.filters.brand)
  ) {
    clearBrandFilters();
  }
  if (state.editingBrandId && !state.brands.some((brand) => String(brand.id) === String(state.editingBrandId))) {
    state.editingBrandId = "";
  }
  renderBrands();
  renderBrandSettings();
  renderSavedBrandSettings();
  updateBrandOrderControls();
}

async function loadOptions() {
  const query = new URLSearchParams();
  if (state.filters.brand && state.filters.brand !== FAVORITES_FILTER) {
    query.set("brand", state.filters.brand);
  }
  const options = await api(`/api/options?${query.toString()}`);
  fillSelect(els.familyFilter, "All families", options.families, state.filters.family);
  fillSelect(els.modelFilter, "All models", options.models, state.filters.model);
  fillSelect(els.categoryFilter, "All categories", options.categories, state.filters.category);
}

async function loadParts() {
  const query = new URLSearchParams();
  Object.entries(state.filters).forEach(([key, value]) => {
    if (!value || (key === "brand" && value === FAVORITES_FILTER)) {
      return;
    }
    query.set(key, value);
  });

  state.parts = await api(`/api/parts?${query.toString()}`);
  renderParts();
}

function renderBrands() {
  els.brandList.replaceChildren();

  const allButton = brandButton({
    name: "All",
    partCount: state.summary.active,
    unassignedCount: state.summary.unassigned,
    accent: "#334155",
    logo: "",
  });
  allButton.classList.toggle("is-active", state.filters.brand === "");
  allButton.addEventListener("click", () => selectBrand(""));
  els.brandList.appendChild(allButton);

  if (hasFavorites()) {
    const favoritesButton = brandButton({
      name: "Favorites",
      partCount: state.favoriteIds.size,
      unassignedCount: 0,
      accent: "#eab308",
      logo: "",
      isFavorites: true,
    });
    favoritesButton.classList.toggle("is-active", state.filters.brand === FAVORITES_FILTER);
    favoritesButton.addEventListener("click", () => selectBrand(FAVORITES_FILTER));
    els.brandList.appendChild(favoritesButton);
  }

  orderedBrands().forEach((brand) => {
    const button = brandButton(brand);
    button.classList.toggle("is-active", state.filters.brand === brand.name);
    button.addEventListener("click", () => selectBrand(brand.name));
    els.brandList.appendChild(button);
  });
}

function renderBrandSettings() {
  if (!els.settingsBrandList) {
    return;
  }

  els.settingsBrandList.replaceChildren();
  const brands = orderedBrands();
  brands.forEach((brand, index) => {
    const row = document.createElement("div");
    row.className = "settings-brand-row";
    row.classList.toggle("is-active", String(brand.id) === String(state.editingBrandId));
    row.style.setProperty("--brand-accent", brand.accent || "#334155");
    row.dataset.brandId = String(brand.id);

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "settings-brand-select";

    const swatch = document.createElement("span");
    swatch.className = "settings-brand-swatch";

    const text = document.createElement("span");
    text.className = "settings-brand-text";

    const name = document.createElement("span");
    name.textContent = brand.name;

    const count = document.createElement("small");
    count.textContent = `${brand.partCount || 0} parts`;

    text.append(name, count);
    selectButton.append(swatch, text);
    selectButton.addEventListener("click", () => openBrandEditor(brand));
    row.appendChild(selectButton);

    if (state.brandOrderMode === "custom") {
      const controls = document.createElement("span");
      controls.className = "brand-move-controls";

      const up = document.createElement("button");
      up.type = "button";
      up.className = "secondary-button compact-button";
      up.textContent = "Up";
      up.disabled = index === 0;
      up.addEventListener("click", () => moveBrand(brand.id, -1));

      const down = document.createElement("button");
      down.type = "button";
      down.className = "secondary-button compact-button";
      down.textContent = "Down";
      down.disabled = index === brands.length - 1;
      down.addEventListener("click", () => moveBrand(brand.id, 1));

      controls.append(up, down);
      row.appendChild(controls);
    }

    els.settingsBrandList.appendChild(row);
  });
}

function renderSavedBrandSettings() {
  if (!els.savedBrandList) {
    return;
  }

  els.savedBrandList.replaceChildren();
  if (!state.savedBrands.length) {
    const empty = document.createElement("div");
    empty.className = "saved-brand-empty";
    empty.textContent = "No saved brands.";
    els.savedBrandList.appendChild(empty);
    return;
  }

  state.savedBrands.forEach((brand) => {
    const row = document.createElement("div");
    row.className = "saved-brand-row";
    row.style.setProperty("--brand-accent", brand.accent || "#334155");

    const swatch = document.createElement("span");
    swatch.className = "settings-brand-swatch";

    const text = document.createElement("span");
    text.className = "settings-brand-text";

    const name = document.createElement("span");
    name.textContent = brand.name;

    const count = document.createElement("small");
    count.textContent = `${brand.partCount || 0} parts saved`;

    const restore = document.createElement("button");
    restore.type = "button";
    restore.className = "secondary-button compact-button";
    restore.textContent = "Restore";
    restore.addEventListener("click", () => restoreBrand(brand));

    const deleteForever = document.createElement("button");
    deleteForever.type = "button";
    deleteForever.className = "danger-button compact-button";
    deleteForever.textContent = "Delete Forever";
    deleteForever.addEventListener("click", () => permanentlyDeleteSavedBrand(brand));

    const actions = document.createElement("span");
    actions.className = "saved-brand-actions";
    actions.append(restore, deleteForever);

    text.append(name, count);
    row.append(swatch, text, actions);
    els.savedBrandList.appendChild(row);
  });
}

function orderedBrands() {
  const brands = [...state.brands];
  const byName = (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

  if (state.brandOrderMode === "za") {
    return brands.sort((a, b) => byName(b, a));
  }
  if (state.brandOrderMode === "most") {
    return brands.sort((a, b) => (b.partCount || 0) - (a.partCount || 0) || byName(a, b));
  }
  if (state.brandOrderMode === "least") {
    return brands.sort((a, b) => (a.partCount || 0) - (b.partCount || 0) || byName(a, b));
  }
  if (state.brandOrderMode === "custom") {
    const byId = new Map(brands.map((brand) => [String(brand.id), brand]));
    return state.customBrandOrder.map((id) => byId.get(String(id))).filter(Boolean);
  }

  return brands.sort(byName);
}

function syncCustomBrandOrder() {
  const existing = new Set(state.brands.map((brand) => String(brand.id)));
  const bySavedOrder = [...state.brands].sort((a, b) => {
    return (a.sortOrder || 0) - (b.sortOrder || 0) ||
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
  const previous = state.customBrandOrder.filter((id) => existing.has(String(id)));
  bySavedOrder.forEach((brand) => {
    if (!previous.some((id) => String(id) === String(brand.id))) {
      previous.push(String(brand.id));
    }
  });
  state.customBrandOrder = previous;
}

function setBrandOrderMode(mode) {
  const previousOrder = orderedBrands().map((brand) => String(brand.id));
  state.brandOrderMode = ["az", "za", "most", "least", "custom"].includes(mode) ? mode : "az";
  if (state.brandOrderMode === "custom") {
    state.customBrandOrder = previousOrder;
  }
  applyBrandOrderMode(state.brandOrderMode);
  renderBrands();
  renderBrandSettings();
  renderParts();
}

function applyBrandOrderMode(mode) {
  state.brandOrderMode = ["az", "za", "most", "least", "custom"].includes(mode) ? mode : "az";
  localStorage.setItem("ppwork-brand-order", state.brandOrderMode);
  if (els.brandOrderMode) {
    els.brandOrderMode.value = state.brandOrderMode;
  }
  updateBrandOrderControls();
}

function updateBrandOrderControls() {
  if (!els.lockBrandOrderButton) {
    return;
  }
  els.lockBrandOrderButton.disabled = state.brandOrderMode !== "custom";
  els.lockBrandOrderButton.classList.toggle("is-visible", state.brandOrderMode === "custom");
}

function moveBrand(brandId, direction) {
  const order = orderedBrands().map((brand) => String(brand.id));
  const index = order.indexOf(String(brandId));
  const target = index + direction;
  if (index < 0 || target < 0 || target >= order.length) {
    return;
  }

  [order[index], order[target]] = [order[target], order[index]];
  state.customBrandOrder = order;
  renderBrands();
  renderBrandSettings();
  renderParts();
}

async function lockCustomBrandOrder() {
  if (state.brandOrderMode !== "custom") {
    return;
  }

  try {
    await api("/api/brands/reorder", {
      method: "POST",
      body: JSON.stringify({ brandIds: state.customBrandOrder }),
    });
    await loadBrands();
    showFeedback("Custom brand order locked.", "ok");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

function brandButton(brand) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "brand-button";
  button.style.setProperty("--brand-accent", brand.accent || "#334155");

  const mark = document.createElement("span");
  mark.className = "brand-mark";
  if (brand.isFavorites) {
    mark.classList.add("is-favorite-mark");
    mark.textContent = "\u2605";
  } else if (brand.logo) {
    const img = document.createElement("img");
    img.src = brand.logo;
    img.alt = "";
    mark.appendChild(img);
  } else {
    mark.textContent = brand.name.slice(0, 1);
  }

  const body = document.createElement("span");
  body.className = "brand-body";

  const name = document.createElement("span");
  name.className = "brand-name";
  name.textContent = brand.name;

  const count = document.createElement("span");
  count.className = "brand-count";
  count.textContent = `${brand.partCount || 0} parts`;

  body.append(name, count);

  if (brand.unassignedCount) {
    const badge = document.createElement("span");
    badge.className = "needs-badge";
    badge.textContent = String(brand.unassignedCount);
    button.append(mark, body, badge);
  } else {
    button.append(mark, body);
  }

  return button;
}

async function selectBrand(name) {
  if (name === FAVORITES_FILTER && !hasFavorites()) {
    return;
  }

  state.filters.brand = name;
  state.filters.family = "";
  state.filters.model = "";
  state.filters.category = "";
  await loadOptions();
  renderBrands();
  await loadParts();
}

function openSettings() {
  renderDepartmentControls();
  renderBrandSettings();
  renderSavedBrandSettings();
  if (state.brands.length && !state.editingBrandId) {
    openBrandEditor(orderedBrands()[0]);
  } else if (!state.brands.length) {
    openBrandEditor(null);
  }
  els.settingsDialog.showModal();
}

function openBrandEditor(brand = null) {
  state.editingBrandId = brand ? String(brand.id) : "";
  els.brandId.value = brand?.id || "";
  els.brandName.value = brand?.name || "";
  els.brandAccent.value = normalizeColor(brand?.accent || "#2563eb");
  els.brandLogo.value = brand?.logo || "";
  els.brandLogoFile.value = "";
  els.deleteBrandButton.hidden = !brand;
  renderBrandSettings();
  els.brandName.focus();
}

function renderParts() {
  els.partBoard.replaceChildren();

  const parts = orderedParts(visibleParts());
  if (!parts.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No matching parts.";
    els.partBoard.appendChild(empty);
    return;
  }

  groupedParts(parts).forEach((group) => {
    const section = document.createElement("section");
    section.className = "part-section";

    const header = document.createElement("div");
    header.className = "section-header";

    const titleBlock = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = group.title;
    const subtitle = document.createElement("p");
    subtitle.textContent = group.subtitle;
    titleBlock.append(title, subtitle);

    const count = document.createElement("span");
    count.className = "section-count";
    count.textContent = `${group.parts.length}`;
    header.append(titleBlock, count);

    const grid = document.createElement("div");
    grid.className = "parts-grid";
    group.parts.forEach((part) => grid.appendChild(partTile(part)));

    section.append(header, grid);
    els.partBoard.appendChild(section);
  });
}

function orderedParts(parts = state.parts) {
  const brandRanks = new Map(orderedBrands().map((brand, index) => [brand.name, index]));
  return [...parts].sort((a, b) => {
    const brandRank = (brandRanks.get(a.brand) ?? 9999) - (brandRanks.get(b.brand) ?? 9999);
    if (brandRank !== 0) {
      return brandRank;
    }
    return (a.sortOrder || 0) - (b.sortOrder || 0) ||
      a.family.localeCompare(b.family, undefined, { sensitivity: "base" }) ||
      a.model.localeCompare(b.model, undefined, { sensitivity: "base" }) ||
      a.category.localeCompare(b.category, undefined, { sensitivity: "base" }) ||
      a.item.localeCompare(b.item, undefined, { sensitivity: "base" });
  });
}

function groupedParts(parts) {
  const map = new Map();
  parts.forEach((part) => {
    const key = [part.brand, part.family, part.model, part.category].join("|");
    if (!map.has(key)) {
      map.set(key, {
        title: [part.brand, part.model].filter(Boolean).join(" / "),
        subtitle: [part.family, part.category].filter(Boolean).join(" - "),
        parts: [],
      });
    }
    map.get(key).parts.push(part);
  });
  return [...map.values()];
}

function partTile(part) {
  const tile = document.createElement("article");
  tile.className = "part-tile";
  tile.dataset.partId = String(part.id);
  tile.tabIndex = 0;
  tile.setAttribute("role", "button");
  tile.setAttribute(
    "aria-label",
    part.partNumber ? `Copy ${part.partNumber} for ${part.item}` : `Open ${part.item}`,
  );
  tile.classList.toggle("is-unassigned", !part.partNumber);
  tile.style.setProperty("--brand-accent", part.accent || "#2563eb");

  const title = document.createElement("span");
  title.className = "part-title";
  title.textContent = part.item;

  const meta = document.createElement("span");
  meta.className = "part-meta";
  meta.textContent = part.buttonText && part.buttonText !== part.item ? part.buttonText : part.category;

  const numberRow = document.createElement("span");
  numberRow.className = "part-number-row";

  const favorite = document.createElement("button");
  const favoriteActive = isFavorite(part);
  favorite.type = "button";
  favorite.className = "favorite-button";
  favorite.classList.toggle("is-favorite", favoriteActive);
  favorite.textContent = favoriteActive ? "\u2605" : "\u2606";
  favorite.setAttribute("aria-pressed", String(favoriteActive));
  favorite.setAttribute(
    "aria-label",
    `${favoriteActive ? "Remove" : "Add"} ${part.item} ${favoriteActive ? "from" : "to"} favorites`,
  );
  favorite.addEventListener("click", (event) => {
    event.stopPropagation();
    void toggleFavorite(part);
  });

  const number = document.createElement("span");
  number.className = "part-number";
  number.textContent = part.partNumber || "Needs number";

  numberRow.append(favorite, number);
  tile.append(title, meta, numberRow);
  tile.addEventListener("click", () => handlePartAction(part));
  tile.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handlePartAction(part);
    }
  });

  return tile;
}

function handlePartAction(part) {
  if (state.editMode) {
    openEditor(part);
  } else {
    copyPart(part);
  }
}

function visibleParts() {
  if (state.filters.brand !== FAVORITES_FILTER) {
    return state.parts;
  }
  return state.parts.filter((part) => isFavorite(part));
}

function isFavorite(part) {
  return state.favoriteIds.has(String(part.id));
}

function hasFavorites() {
  return state.favoriteIds.size > 0;
}

async function toggleFavorite(part) {
  const favoriteId = String(part.id);
  const wasFavorite = state.favoriteIds.has(favoriteId);
  if (wasFavorite) {
    state.favoriteIds.delete(favoriteId);
  } else {
    state.favoriteIds.add(favoriteId);
  }
  saveFavorites();

  if (!hasFavorites() && state.filters.brand === FAVORITES_FILTER) {
    clearBrandFilters();
    await loadOptions();
    renderBrands();
    await loadParts();
  } else {
    renderBrands();
    renderParts();
  }

  showFeedback(`${part.item} ${wasFavorite ? "removed from" : "added to"} favorites.`, wasFavorite ? "warn" : "ok");
}

function loadFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem(favoritesStorageKey()) || "[]");
    state.favoriteIds = new Set(Array.isArray(raw) ? raw.map(String).filter(Boolean) : []);
  } catch (error) {
    state.favoriteIds = new Set();
  }
}

function saveFavorites() {
  localStorage.setItem(favoritesStorageKey(), JSON.stringify([...state.favoriteIds]));
}

function favoritesStorageKey() {
  return `ppwork-favorites-${state.department}`;
}

function clearBrandFilters() {
  state.filters.brand = "";
  state.filters.family = "";
  state.filters.model = "";
  state.filters.category = "";
}

async function copyPart(part) {
  if (!part.partNumber) {
    showFeedback(`${part.item} needs a part number.`, "warn");
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(part.partNumber);
    } else if (!fallbackCopy(part.partNumber)) {
      throw new Error("Copy command failed.");
    }
    showFeedback(`Copied ${part.partNumber}`, "ok");
  } catch (error) {
    if (fallbackCopy(part.partNumber)) {
      showFeedback(`Copied ${part.partNumber}`, "ok");
      return;
    }
    showFeedback(`Copy failed: ${part.partNumber}`, "warn");
  }
}

function fallbackCopy(value) {
  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  return copied;
}

function openEditor(part = null) {
  const defaultBrand = state.filters.brand || state.brands[0]?.name || "";
  const values = part || {
    id: "",
    brand: defaultBrand,
    family: state.filters.family,
    model: state.filters.model,
    category: state.filters.category,
    item: "",
    buttonText: "",
    partNumber: "",
    notes: "",
  };

  els.dialogTitle.textContent = part ? "Edit Part" : "Add Part";
  els.partId.value = values.id || "";
  els.partBrand.value = values.brand || "";
  els.partFamily.value = values.family || "";
  els.partModel.value = values.model || "";
  els.partCategory.value = values.category || "";
  els.partItem.value = values.item || "";
  els.partButtonText.value = values.buttonText || "";
  els.partNumber.value = values.partNumber || "";
  els.partNotes.value = values.notes || "";
  els.deleteButton.hidden = !part;

  els.partDialog.showModal();
  els.partItem.focus();
}

async function savePart(event) {
  event.preventDefault();

  const id = els.partId.value;
  const payload = readForm();
  const path = id ? `/api/parts/${id}` : "/api/parts";
  const method = id ? "PUT" : "POST";

  await api(path, {
    method,
    body: JSON.stringify(payload),
  });

  els.partDialog.close();
  await refreshAll();
  showFeedback(`${payload.item} saved.`, "ok");
}

async function deletePart() {
  const id = els.partId.value;
  const item = els.partItem.value.trim() || "this part";
  if (!id || !window.confirm(`Delete ${item}?`)) {
    return;
  }

  await api(`/api/parts/${id}`, { method: "DELETE" });
  state.favoriteIds.delete(String(id));
  saveFavorites();
  els.partDialog.close();
  await refreshAll();
  showFeedback(`${item} deleted.`, "warn");
}

async function saveBrand(event) {
  event.preventDefault();

  const id = els.brandId.value;
  const oldBrand = state.brands.find((brand) => String(brand.id) === String(id));
  const name = els.brandName.value.trim();
  const payload = {
    name,
    accent: els.brandAccent.value,
    logo: els.brandLogo.value.trim(),
  };
  const path = id ? `/api/brands/${id}` : "/api/brands";
  const method = id ? "PUT" : "POST";

  try {
    if (els.brandLogoFile.files.length) {
      const uploadedLogo = await uploadLogo(els.brandLogoFile.files[0], name);
      payload.logo = uploadedLogo;
      els.brandLogo.value = uploadedLogo;
    }

    const response = await api(path, {
      method,
      body: JSON.stringify(payload),
    });

    if (oldBrand?.name === state.filters.brand) {
      state.filters.brand = payload.name;
    }

    await refreshAll();
    const savedId = id || response.id;
    const savedBrand = state.brands.find((brand) => String(brand.id) === String(savedId));
    openBrandEditor(savedBrand || null);
    els.brandLogoFile.value = "";
    showFeedback(`${payload.name} saved.`, "ok");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function uploadLogo(file, brandName) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Logo must be an image file.");
  }
  if (file.size > 4 * 1024 * 1024) {
    throw new Error("Logo file must be smaller than 4 MB.");
  }

  const dataUrl = await fileToDataUrl(file);
  const response = await api("/api/upload-logo", {
    method: "POST",
    body: JSON.stringify({
      brandName,
      fileName: file.name,
      dataUrl,
    }),
  });
  return response.path;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("Could not read logo file.")));
    reader.readAsDataURL(file);
  });
}

async function deleteBrand() {
  const id = els.brandId.value;
  const name = els.brandName.value.trim() || "this brand";
  if (!id) {
    return;
  }

  const firstConfirmation = window.confirm(
    `Delete ${name} from the main board? It will be saved with its parts.`,
  );
  if (!firstConfirmation) {
    return;
  }

  const secondConfirmation = window.confirm(
    `Confirm again to save and hide ${name}. You can restore it from Saved Brands later.`,
  );
  if (!secondConfirmation) {
    return;
  }

  try {
    await api(`/api/brands/${id}`, { method: "DELETE" });
    if (state.filters.brand === name) {
      state.filters.brand = "";
    }
    state.editingBrandId = "";
    await refreshAll();
    openBrandEditor(orderedBrands()[0] || null);
    showFeedback(`${name} saved and hidden.`, "warn");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function restoreBrand(brand) {
  try {
    await api(`/api/brands/${brand.id}/restore`, { method: "POST" });
    await refreshAll();
    const restored = state.brands.find((candidate) => String(candidate.id) === String(brand.id));
    openBrandEditor(restored || orderedBrands()[0] || null);
    showFeedback(`${brand.name} restored.`, "ok");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function permanentlyDeleteSavedBrand(brand) {
  const partCount = brand.partCount || 0;
  const adminPassword = window.prompt(
    `Admin password required to permanently remove ${brand.name} from Saved Brands. ${partCount} part records will remain only in the database for admin backup.`,
  );
  if (adminPassword === null) {
    return;
  }

  try {
    await api(`/api/brands/${brand.id}/permanent`, {
      method: "DELETE",
      body: JSON.stringify({ adminPassword }),
    });
    await refreshAll();
    showFeedback(`${brand.name} permanently removed from Saved Brands.`, "warn");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

function readForm() {
  return {
    brand: els.partBrand.value.trim(),
    family: els.partFamily.value.trim(),
    model: els.partModel.value.trim(),
    category: els.partCategory.value.trim(),
    item: els.partItem.value.trim(),
    buttonText: els.partButtonText.value.trim(),
    partNumber: els.partNumber.value.trim(),
    notes: els.partNotes.value.trim(),
  };
}

function fillSelect(select, label, values, selected) {
  select.replaceChildren();

  const all = document.createElement("option");
  all.value = "";
  all.textContent = label;
  select.appendChild(all);

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });

  select.value = values.includes(selected) ? selected : "";
  if (select.value !== selected) {
    const key = select.id.replace("-filter", "");
    state.filters[key] = "";
  }
}

async function api(path, options = {}) {
  const url = apiUrl(path);
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-PPWork-Department": state.department,
      ...(options.headers || {}),
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }
  return payload;
}

function apiUrl(path) {
  const url = new URL(path, window.location.origin);
  if (url.pathname.startsWith("/api/")) {
    url.searchParams.set("department", state.department);
  }
  return `${url.pathname}${url.search}`;
}

async function switchDepartment(department) {
  if (state.department === department) {
    renderDepartmentControls();
    return;
  }

  applyDepartment(department);
  state.filters = { brand: "", family: "", model: "", category: "", q: "" };
  state.editingBrandId = "";
  els.searchInput.value = "";
  await refreshAll();
  if (els.settingsDialog.open) {
    openBrandEditor(orderedBrands()[0] || null);
  }
  showFeedback(`${departmentLabel()} department loaded.`, "ok");
}

function applyDepartment(department) {
  state.department = ["parts", "service"].includes(department) ? department : "parts";
  localStorage.setItem("ppwork-department", state.department);
  loadFavorites();
  renderDepartmentControls();
}

function renderDepartmentControls() {
  const isParts = state.department === "parts";
  if (els.departmentEyebrow) {
    els.departmentEyebrow.textContent = `${departmentLabel()} Department`;
  }
  if (els.departmentPartsButton) {
    els.departmentPartsButton.classList.toggle("is-active", isParts);
    els.departmentPartsButton.setAttribute("aria-pressed", String(isParts));
  }
  if (els.departmentServiceButton) {
    els.departmentServiceButton.classList.toggle("is-active", !isParts);
    els.departmentServiceButton.setAttribute("aria-pressed", String(!isParts));
  }
}

function departmentLabel() {
  return state.department === "service" ? "Service" : "Parts";
}

function showFeedback(message, type = "ok") {
  els.feedback.textContent = message;
  els.feedback.dataset.type = type;
  clearTimeout(showFeedback.timeout);
  showFeedback.timeout = setTimeout(() => {
    els.feedback.textContent = "";
    delete els.feedback.dataset.type;
  }, 2200);
}

function applyTheme(enabled) {
  state.darkTheme = enabled;
  document.documentElement.dataset.theme = enabled ? "dark" : "light";
  localStorage.setItem("ppwork-theme", enabled ? "dark" : "light");
  if (els.themeToggle) {
    els.themeToggle.checked = enabled;
  }
}

function applyThemeVariant(variant) {
  const allowed = ["classic", "trail", "service", "contrast", "sunset"];
  state.themeVariant = allowed.includes(variant) ? variant : "classic";
  document.documentElement.dataset.themeVariant = state.themeVariant;
  localStorage.setItem("ppwork-theme-variant", state.themeVariant);
  if (els.themeVariant) {
    els.themeVariant.value = state.themeVariant;
  }
}

function normalizeColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : "#2563eb";
}

function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

function toCamel(id) {
  return id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}



