const FAVORITES_FILTER = "__favorites__";
const AUTO_SIGN_OUT_MS = 30 * 60 * 1000;
const ROLE_ORDER = ["counter", "manager", "admin"];
const ROLE_LABELS = { counter: "Counter", manager: "Manager", admin: "Admin" };
const DEFAULT_PERMISSION_ACTIONS = [
  { key: "import", label: "Import parts" },
  { key: "export", label: "Export parts" },
  { key: "brandEdit", label: "Brand editing" },
  { key: "brandDelete", label: "Brand deletion" },
  { key: "employeeEdit", label: "Employee editing" },
  { key: "permanentBrandDelete", label: "Permanent saved-brand removal" },
];
const DEFAULT_ROLE_PERMISSIONS = {
  counter: [],
  manager: ["import", "export", "brandEdit"],
  admin: DEFAULT_PERMISSION_ACTIONS.map((action) => action.key),
};

const state = {
  brands: [],
  savedBrands: [],
  summary: { active: 0, unassigned: 0 },
  parts: [],
  catalogParts: [],
  catalogLoaded: false,
  catalogWarmPromise: null,
  catalogGeneration: 0,
  partsRequestId: 0,
  optionsRequestId: 0,
  favoriteIds: new Set(),
  pinnedBrandIds: new Set(),
  copyHistory: [],
  copyStats: {},
  copyTemplate: "number",
  employees: [],
  currentEmployee: loadStoredEmployee(),
  serviceResources: [],
  savedSearchPresets: [],
  rolePermissions: JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS)),
  permissionActions: DEFAULT_PERMISSION_ACTIONS,
  inactivityTimer: null,
  appSettings: {},
  editingServiceResourceId: "",
  editingEmployeeId: "",
  department: localStorage.getItem("ppwork-department") || "parts",
  filters: {
    brand: "",
    family: "",
    model: "",
    category: "",
    year: "",
    make: "",
    fitmentModel: "",
    unitType: "",
    q: "",
    view: "all",
  },
  editMode: false,
  editingBrandId: "",
  darkTheme: false,
  themeVariant: "classic",
  brandOrderMode: "az",
  customBrandOrder: [],
  densityMode: "comfortable",
  stagedUpdate: null,
  advancedFiltersOpen: localStorage.getItem("ppwork-advanced-filters") === "open",
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  [
    "app-title",
    "department-eyebrow",
    "active-count",
    "unassigned-count",
    "brand-list",
    "search-input",
    "saved-search-select",
    "save-search-preset-button",
    "delete-search-preset-button",
    "copy-template-select",
    "advanced-filters-toggle",
    "family-filter",
    "model-filter",
    "category-filter",
    "year-filter",
    "make-filter",
    "fitment-model-filter",
    "unit-type-filter",
    "clear-fitment-button",
    "view-filter",
    "edit-toggle",
    "add-button",
    "feedback",
    "quick-panels",
    "recent-copy-list",
    "most-used-list",
    "clear-copy-history-button",
    "part-board",
    "employee-button",
    "login-button",
    "settings-button",
    "part-dialog",
    "part-form",
    "part-id",
    "part-brand",
    "part-family",
    "part-model",
    "part-category",
    "part-year-start",
    "part-year-end",
    "part-make",
    "part-fitment-model",
    "part-unit-type",
    "part-review-status",
    "part-review-note",
    "part-item",
    "part-button-text",
    "part-number",
    "part-old-part-number",
    "part-new-part-number",
    "part-vendor",
    "part-alternate-numbers",
    "part-aftermarket-numbers",
    "part-tags",
    "part-fitment-notes",
    "part-attachment-url",
    "part-notes",
    "dialog-title",
    "delete-button",
    "cancel-button",
    "close-dialog",
    "settings-dialog",
    "close-settings",
    "done-settings",
    "login-dialog",
    "login-form",
    "close-login",
    "login-current",
    "employees-settings-tab",
    "dealership-settings-tab",
    "department-parts-button",
    "department-service-button",
    "admin-tools-panel",
    "setup-dialog",
    "setup-form",
    "setup-admin-name",
    "setup-admin-username",
    "setup-admin-password",
    "setup-admin-password-confirm",
    "employee-current",
    "employee-login-username",
    "employee-login-password",
    "employee-sign-in-button",
    "employee-sign-out-button",
    "employee-list",
    "new-employee-button",
    "employee-form",
    "employee-id",
    "employee-name",
    "employee-username",
    "employee-role",
    "employee-password-new",
    "employee-pin-new",
    "employee-department-parts",
    "employee-department-service",
    "employee-location-scope",
    "employee-admin-password",
    "delete-employee-button",
    "reset-employee-login-button",
    "role-permission-grid",
    "save-role-permissions-button",
    "theme-toggle",
    "theme-variant",
    "density-mode",
    "brand-order-mode",
    "lock-brand-order-button",
    "settings-brand-list",
    "new-brand-button",
    "brand-form",
    "brand-id",
    "brand-name",
    "brand-accent",
    "brand-category",
    "brand-default-family",
    "brand-default-model",
    "brand-default-category",
    "brand-logo",
    "brand-logo-file",
    "brand-archive-note",
    "delete-brand-button",
    "saved-brand-list",
    "app-version",
    "dealership-form",
    "dealership-name",
    "location-name",
    "parts-department-label",
    "service-department-label",
    "local-link-output",
    "copy-local-link-button",
    "setup-checklist-button",
    "save-settings-button",
    "review-report-button",
    "new-service-resource-button",
    "service-resource-list",
    "service-resource-form",
    "service-resource-id",
    "service-resource-type",
    "service-resource-title",
    "service-resource-brand",
    "service-resource-model",
    "service-resource-unit-type",
    "service-resource-season",
    "service-resource-content",
    "delete-service-resource-button",
    "admin-password",
    "create-backup-button",
    "export-parts-button",
    "export-parts-xlsx-button",
    "import-parts-file",
    "missing-report-button",
    "duplicate-report-button",
    "recent-report-button",
    "copy-activity-report-button",
    "print-list-button",
    "quick-reference-button",
    "network-setup-button",
    "migration-report-button",
    "error-log-button",
    "demo-database-button",
    "backup-health-button",
    "compact-database-button",
    "check-update-button",
    "apply-update-button",
    "restart-server-button",
    "deployment-checklist-button",
    "release-notes-button",
    "backup-select",
    "refresh-backups-button",
    "restore-backup-button",
    "admin-report-output",
  ].forEach((id) => {
    els[toCamel(id)] = document.getElementById(id);
  });

  applyDepartment(state.department);
  applyTheme(localStorage.getItem("ppwork-theme") === "dark");
  applyThemeVariant(localStorage.getItem("ppwork-theme-variant") || "classic");
  applyDensityMode(localStorage.getItem("ppwork-density") || "comfortable");
  applyBrandOrderMode(localStorage.getItem("ppwork-brand-order") || "az");
  applyAdvancedFilterVisibility();
  loadSavedSearchPresets();
  loadCopyTemplate();
  wireEvents();
  renderEmployeeState();
  void initializeSecurityState();
  void loadAppSettings();
  refreshAll();
});

function wireEvents() {
  els.setupForm.addEventListener("submit", createFirstAdmin);
  els.setupDialog.addEventListener("cancel", (event) => {
    if (els.setupDialog.dataset.required === "true") {
      event.preventDefault();
    }
  });
  els.savedSearchSelect.addEventListener("change", () => applySavedSearchPreset(els.savedSearchSelect.value));
  els.saveSearchPresetButton.addEventListener("click", saveCurrentSearchPreset);
  els.deleteSearchPresetButton.addEventListener("click", deleteSelectedSearchPreset);
  els.copyTemplateSelect.addEventListener("change", () => saveCopyTemplate(els.copyTemplateSelect.value));
  els.advancedFiltersToggle.addEventListener("click", toggleAdvancedFilters);

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
    ["make", els.makeFilter],
    ["fitmentModel", els.fitmentModelFilter],
    ["unitType", els.unitTypeFilter],
  ].forEach(([key, select]) => {
    select.addEventListener("change", () => {
      state.filters[key] = select.value;
      loadParts();
    });
  });

  els.yearFilter.addEventListener(
    "input",
    debounce(() => {
      state.filters.year = els.yearFilter.value.trim();
      loadParts();
    }, 160),
  );
  els.clearFitmentButton.addEventListener("click", clearFitmentFilters);

  els.viewFilter.addEventListener("change", () => {
    state.filters.view = els.viewFilter.value;
    renderParts();
  });

  els.editToggle.addEventListener("change", () => {
    state.editMode = els.editToggle.checked;
    renderParts();
  });

  els.addButton.addEventListener("click", () => openEditor());
  els.loginButton.addEventListener("click", () => {
    if (state.currentEmployee?.id) {
      signOutEmployee();
      return;
    }
    openLogin();
  });
  els.settingsButton.addEventListener("click", openSettings);
  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.addEventListener("click", () => selectSettingsTab(button.dataset.settingsTab || "employees"));
  });
  els.cancelButton.addEventListener("click", () => els.partDialog.close());
  els.closeDialog.addEventListener("click", () => els.partDialog.close());
  els.partForm.addEventListener("submit", savePart);
  els.deleteButton.addEventListener("click", deletePart);
  els.closeSettings.addEventListener("click", () => els.settingsDialog.close());
  els.doneSettings.addEventListener("click", () => els.settingsDialog.close());
  els.closeLogin.addEventListener("click", () => els.loginDialog.close());
  els.departmentPartsButton.addEventListener("click", () => switchDepartment("parts"));
  els.departmentServiceButton.addEventListener("click", () => switchDepartment("service"));
  els.loginForm.addEventListener("submit", signInEmployee);
  els.employeeSignOutButton.addEventListener("click", signOutEmployee);
  els.newEmployeeButton.addEventListener("click", () => openEmployeeEditor());
  els.employeeForm.addEventListener("submit", saveEmployee);
  els.deleteEmployeeButton.addEventListener("click", deleteEmployee);
  els.resetEmployeeLoginButton.addEventListener("click", resetEmployeeLogin);
  els.saveRolePermissionsButton.addEventListener("click", saveRolePermissions);
  els.themeToggle.addEventListener("change", () => applyTheme(els.themeToggle.checked));
  els.themeVariant.addEventListener("change", () => applyThemeVariant(els.themeVariant.value));
  els.densityMode.addEventListener("change", () => applyDensityMode(els.densityMode.value));
  els.brandOrderMode.addEventListener("change", () => setBrandOrderMode(els.brandOrderMode.value));
  els.lockBrandOrderButton.addEventListener("click", lockCustomBrandOrder);
  els.newBrandButton.addEventListener("click", () => openBrandEditor());
  els.brandForm.addEventListener("submit", saveBrand);
  els.deleteBrandButton.addEventListener("click", deleteBrand);
  els.createBackupButton.addEventListener("click", createBackup);
  els.exportPartsButton.addEventListener("click", exportPartsCsv);
  els.exportPartsXlsxButton.addEventListener("click", exportPartsXlsx);
  els.importPartsFile.addEventListener("change", importPartsFile);
  els.missingReportButton.addEventListener("click", () => loadReport("missing"));
  els.duplicateReportButton.addEventListener("click", () => loadReport("duplicates"));
  els.recentReportButton.addEventListener("click", () => loadReport("recent"));
  els.reviewReportButton.addEventListener("click", () => loadReport("review"));
  els.copyActivityReportButton.addEventListener("click", () => loadReport("copyActivity"));
  els.migrationReportButton.addEventListener("click", () => loadReport("migrations"));
  els.errorLogButton.addEventListener("click", () => loadReport("errorLog"));
  els.backupHealthButton.addEventListener("click", () => loadReport("backupHealth"));
  els.compactDatabaseButton.addEventListener("click", compactDatabase);
  els.checkUpdateButton.addEventListener("click", checkForUpdates);
  els.applyUpdateButton.addEventListener("click", applyStagedUpdate);
  els.restartServerButton.addEventListener("click", restartServer);
  els.deploymentChecklistButton.addEventListener("click", openDeploymentChecklist);
  els.demoDatabaseButton.addEventListener("click", downloadDemoDatabase);
  els.dealershipForm.addEventListener("submit", saveAppSettings);
  els.copyLocalLinkButton.addEventListener("click", copyLocalLink);
  els.setupChecklistButton.addEventListener("click", openSetupChecklist);
  if (els.newServiceResourceButton && els.serviceResourceForm && els.deleteServiceResourceButton) {
    els.newServiceResourceButton.addEventListener("click", () => openServiceResourceEditor());
    els.serviceResourceForm.addEventListener("submit", saveServiceResource);
    els.deleteServiceResourceButton.addEventListener("click", deleteServiceResource);
  }
  els.printListButton.addEventListener("click", openPrintableList);
  els.quickReferenceButton.addEventListener("click", openQuickReference);
  els.networkSetupButton.addEventListener("click", openNetworkSetup);
  els.refreshBackupsButton.addEventListener("click", loadBackups);
  els.restoreBackupButton.addEventListener("click", restoreBackup);
  els.releaseNotesButton.addEventListener("click", openReleaseNotes);
  els.clearCopyHistoryButton.addEventListener("click", clearCopyHistory);
  ["click", "keydown", "mousemove", "touchstart"].forEach((eventName) => {
    document.addEventListener(eventName, resetInactivityTimer, { passive: true });
  });
  document.addEventListener("keydown", handleKeyboardShortcuts);
}

function toggleAdvancedFilters() {
  state.advancedFiltersOpen = !state.advancedFiltersOpen;
  localStorage.setItem("ppwork-advanced-filters", state.advancedFiltersOpen ? "open" : "closed");
  applyAdvancedFilterVisibility();
}

function applyAdvancedFilterVisibility() {
  document.querySelectorAll(".advanced-filter-field").forEach((field) => {
    field.hidden = !state.advancedFiltersOpen;
  });
  if (els.advancedFiltersToggle) {
    const advancedFilterIsActive = Boolean(state.filters.family || state.filters.model || state.filters.category);
    els.advancedFiltersToggle.setAttribute("aria-expanded", String(state.advancedFiltersOpen));
    els.advancedFiltersToggle.textContent = state.advancedFiltersOpen
      ? "Hide Filters"
      : advancedFilterIsActive
        ? "Filters Active"
        : "Filters";
  }
}

function selectSettingsTab(tabName) {
  const availableTabs = isAdminEmployee() ? ["employees", "dealership", "brands"] : ["brands"];
  const selected = availableTabs.includes(tabName) ? tabName : availableTabs[0];
  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    const active = button.dataset.settingsTab === selected;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll("[data-settings-tab-panel]").forEach((panel) => {
    const active = panel.dataset.settingsTabPanel === selected;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });
  scrollSettingsToTop();
}

function scrollSettingsToTop() {
  if (!els.settingsDialog?.open) {
    return;
  }
  els.settingsDialog.scrollTop = 0;
  const layout = els.settingsDialog.querySelector(".settings-layout");
  if (layout) {
    layout.scrollTop = 0;
  }
}

function isAdminEmployee() {
  return state.currentEmployee?.role === "admin" && state.currentEmployee?.sessionToken;
}

function renderEmployeeAdminVisibility() {
  const adminVisible = Boolean(isAdminEmployee());
  if (els.employeesSettingsTab) {
    els.employeesSettingsTab.hidden = !adminVisible;
  }
  if (els.dealershipSettingsTab) {
    els.dealershipSettingsTab.hidden = !adminVisible;
  }
  if (!adminVisible && els.settingsDialog?.open) {
    selectSettingsTab("brands");
  }
}

function normalizeRolePermissions(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : DEFAULT_ROLE_PERMISSIONS;
  const normalized = {};
  ROLE_ORDER.forEach((role) => {
    const raw = Array.isArray(source[role]) ? source[role] : DEFAULT_ROLE_PERMISSIONS[role] || [];
    normalized[role] = raw.filter((permission, index, values) => (
      DEFAULT_PERMISSION_ACTIONS.some((action) => action.key === permission) && values.indexOf(permission) === index
    ));
  });
  normalized.admin = DEFAULT_PERMISSION_ACTIONS.map((action) => action.key);
  return normalized;
}

function userCan(permission) {
  if (isAdminEmployee()) {
    return true;
  }
  const role = state.currentEmployee?.role;
  if (!role || !state.currentEmployee?.sessionToken) {
    return false;
  }
  return (state.rolePermissions[role] || []).includes(permission);
}

function hasAnyToolPermission() {
  return ["import", "export", "employeeEdit", "permanentBrandDelete"].some((permission) => userCan(permission));
}

function renderAdminToolsVisibility() {
  if (els.adminToolsPanel) {
    els.adminToolsPanel.hidden = !(state.currentEmployee?.id && (isAdminEmployee() || hasAnyToolPermission()));
  }
  if (els.importPartsFile) {
    els.importPartsFile.disabled = !userCan("import");
  }
  if (els.exportPartsButton) {
    els.exportPartsButton.disabled = !userCan("export");
  }
  if (els.exportPartsXlsxButton) {
    els.exportPartsXlsxButton.disabled = !userCan("export");
  }
}

function accessHeaders() {
  const headers = { "X-PPWork-Department": state.department };
  if (state.currentEmployee?.id && state.currentEmployee?.sessionToken) {
    headers["X-PPWork-Employee-Id"] = state.currentEmployee.id;
    headers["X-PPWork-Session-Token"] = state.currentEmployee.sessionToken;
  }
  if (els.adminPassword?.value) {
    headers["X-PPWork-Admin-Password"] = els.adminPassword.value;
  }
  return headers;
}

function renderRolePermissions() {
  if (!els.rolePermissionGrid) {
    return;
  }
  els.rolePermissionGrid.replaceChildren();
  const table = document.createElement("table");
  table.className = "role-permission-table";
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const headerRow = document.createElement("tr");
  ["Permission", ...ROLE_ORDER.map((role) => ROLE_LABELS[role] || role)].forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  state.permissionActions.forEach((action) => {
    const row = document.createElement("tr");
    const label = document.createElement("td");
    label.textContent = action.label;
    row.appendChild(label);
    ROLE_ORDER.forEach((role) => {
      const cell = document.createElement("td");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.dataset.role = role;
      checkbox.dataset.permission = action.key;
      checkbox.checked = role === "admin" || (state.rolePermissions[role] || []).includes(action.key);
      checkbox.disabled = role === "admin";
      checkbox.addEventListener("change", () => {
        const permissions = new Set(state.rolePermissions[role] || []);
        if (checkbox.checked) {
          permissions.add(action.key);
        } else {
          permissions.delete(action.key);
        }
        state.rolePermissions[role] = [...permissions].filter((permission) => state.permissionActions.some((item) => item.key === permission));
      });
      cell.appendChild(checkbox);
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });
  table.append(thead, tbody);
  els.rolePermissionGrid.appendChild(table);
}

async function saveRolePermissions() {
  const accessPayload = protectedAccessOrPrompt(
    "Admin password or employee editing permission is required to save role permissions.",
    { rolePermissions: state.rolePermissions },
  );
  if (!accessPayload) {
    return;
  }
  try {
    state.appSettings = await api("/api/settings/role-permissions", {
      method: "PUT",
      body: JSON.stringify(accessPayload),
    });
    state.rolePermissions = normalizeRolePermissions(state.appSettings.rolePermissions);
    renderRolePermissions();
    renderEmployeeState();
    showFeedback("Role permissions saved.", "ok");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function initializeSecurityState() {
  await loadEmployees();
  await loadSetupStatus();
}

async function loadSetupStatus() {
  try {
    const status = await api("/api/setup/status");
    if (status.needsAdminSetup) {
      els.setupDialog.dataset.required = "true";
      if (!els.setupDialog.open) {
        els.setupDialog.showModal();
        els.setupAdminName.focus();
      }
    } else {
      els.setupDialog.dataset.required = "false";
    }
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function createFirstAdmin(event) {
  event.preventDefault();
  const password = els.setupAdminPassword.value;
  if (password !== els.setupAdminPasswordConfirm.value) {
    showFeedback("Admin passwords do not match.", "warn");
    return;
  }
  try {
    const employee = await api("/api/setup/admin", {
      method: "POST",
      body: JSON.stringify({
        name: els.setupAdminName.value.trim(),
        username: els.setupAdminUsername.value.trim(),
        password,
      }),
    });
    state.currentEmployee = employee;
    saveStoredEmployee(employee);
    els.setupForm.reset();
    els.setupDialog.dataset.required = "false";
    els.setupDialog.close();
    await loadEmployees();
    await loadAppSettings();
    renderEmployeeState();
    showFeedback(`${employee.name} admin account created.`, "ok");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

function savedSearchStorageKey() {
  return `ppwork-search-presets-${state.department}`;
}

function defaultSearchPresets() {
  return [
    { id: "oil-change", name: "Oil Change", filters: { ...defaultFilters(), q: "oil filter" } },
    { id: "belts", name: "Belts", filters: { ...defaultFilters(), q: "belt" } },
    { id: "batteries", name: "Batteries", filters: { ...defaultFilters(), q: "battery" } },
  ];
}

function loadSavedSearchPresets() {
  try {
    const raw = JSON.parse(localStorage.getItem(savedSearchStorageKey()) || "null");
    state.savedSearchPresets = Array.isArray(raw) && raw.length ? raw : defaultSearchPresets();
  } catch (error) {
    state.savedSearchPresets = defaultSearchPresets();
  }
  renderSavedSearchPresets();
}

function saveSavedSearchPresets() {
  localStorage.setItem(savedSearchStorageKey(), JSON.stringify(state.savedSearchPresets));
  renderSavedSearchPresets();
}

function renderSavedSearchPresets() {
  if (!els.savedSearchSelect) {
    return;
  }
  els.savedSearchSelect.replaceChildren();
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = state.savedSearchPresets.length ? "Choose preset" : "No presets";
  els.savedSearchSelect.appendChild(empty);
  state.savedSearchPresets.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset.id;
    option.textContent = preset.name;
    els.savedSearchSelect.appendChild(option);
  });
  els.deleteSearchPresetButton.disabled = !els.savedSearchSelect.value;
}

function searchPresetFromCurrentFilters(name) {
  return {
    id: `preset-${Date.now()}`,
    name,
    filters: { ...defaultFilters(), ...state.filters },
  };
}

function saveCurrentSearchPreset() {
  const name = window.prompt("Name this search preset:");
  if (!name) {
    return;
  }
  const cleanName = name.trim();
  if (!cleanName) {
    return;
  }
  const existingIndex = state.savedSearchPresets.findIndex((preset) => preset.name.toLowerCase() === cleanName.toLowerCase());
  const preset = searchPresetFromCurrentFilters(cleanName);
  if (existingIndex >= 0) {
    if (!window.confirm(`Replace the saved search preset "${cleanName}"?`)) {
      return;
    }
    preset.id = state.savedSearchPresets[existingIndex].id;
    state.savedSearchPresets.splice(existingIndex, 1, preset);
  } else {
    state.savedSearchPresets.push(preset);
  }
  saveSavedSearchPresets();
  els.savedSearchSelect.value = preset.id;
  showFeedback(`Saved search preset: ${cleanName}`, "ok");
}

async function applySavedSearchPreset(presetId) {
  const preset = state.savedSearchPresets.find((item) => item.id === presetId);
  els.deleteSearchPresetButton.disabled = !preset;
  if (!preset) {
    return;
  }
  state.filters = { ...defaultFilters(), ...(preset.filters || {}) };
  syncFilterControls();
  await loadOptions();
  renderBrands();
  await loadParts();
  showFeedback(`Loaded preset: ${preset.name}`, "ok");
}

function deleteSelectedSearchPreset() {
  const presetId = els.savedSearchSelect.value;
  const preset = state.savedSearchPresets.find((item) => item.id === presetId);
  if (!preset) {
    return;
  }
  if (!window.confirm(`Delete saved search preset "${preset.name}"?`)) {
    return;
  }
  state.savedSearchPresets = state.savedSearchPresets.filter((item) => item.id !== presetId);
  saveSavedSearchPresets();
  showFeedback(`Deleted preset: ${preset.name}`, "warn");
}

async function refreshAll() {
  invalidateCatalogCache();
  await loadFavorites();
  await loadSummary();
  await loadBrands();
  await Promise.all([loadOptions(), loadParts()]);
  void warmCatalogCache();
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
  const requestId = ++state.optionsRequestId;
  if (state.catalogLoaded) {
    applyFilterOptions(catalogOptionsForBrand(state.filters.brand));
    return;
  }

  const query = new URLSearchParams();
  if (state.filters.brand && state.filters.brand !== FAVORITES_FILTER) {
    query.set("brand", state.filters.brand);
  }
  const options = await api(`/api/options?${query.toString()}`);
  if (requestId !== state.optionsRequestId) {
    return;
  }
  applyFilterOptions(options);
}

function applyFilterOptions(options) {
  fillSelect(els.familyFilter, "All families", options.families, state.filters.family);
  fillSelect(els.modelFilter, "All models", options.models, state.filters.model);
  fillSelect(els.categoryFilter, "All categories", options.categories, state.filters.category);
  fillSelect(els.makeFilter, "All makes", options.makes, state.filters.make);
  fillSelect(els.fitmentModelFilter, "All unit models", options.fitmentModels, state.filters.fitmentModel);
  fillSelect(els.unitTypeFilter, "All unit types", options.unitTypes, state.filters.unitType);
}

async function loadParts() {
  const requestId = ++state.partsRequestId;
  if (state.catalogLoaded && hasOnlyBrandServerFilter()) {
    state.parts = catalogPartsForBrand(state.filters.brand);
    renderParts();
    renderQuickPanels();
    return;
  }

  const query = new URLSearchParams();
  Object.entries(state.filters).forEach(([key, value]) => {
    if (!value || key === "view" || (key === "brand" && value === FAVORITES_FILTER)) {
      return;
    }
    query.set(key, value);
  });

  const parts = await api(`/api/parts?${query.toString()}`);
  if (requestId !== state.partsRequestId) {
    return;
  }
  state.parts = parts;
  if (isFullCatalogRequest()) {
    state.catalogParts = parts;
    state.catalogLoaded = true;
  }
  renderParts();
  renderQuickPanels();
}

const SERVER_FILTER_KEYS = ["brand", "family", "model", "category", "year", "make", "fitmentModel", "unitType", "q"];

function hasOnlyBrandServerFilter() {
  return SERVER_FILTER_KEYS.every((key) => key === "brand" || !state.filters[key]);
}

function isFullCatalogRequest() {
  return SERVER_FILTER_KEYS.every((key) => {
    if (key === "brand") {
      return !state.filters.brand || state.filters.brand === FAVORITES_FILTER;
    }
    return !state.filters[key];
  });
}

function catalogPartsForBrand(brand) {
  if (!brand || brand === FAVORITES_FILTER) {
    return state.catalogParts;
  }
  return state.catalogParts.filter((part) => part.brand === brand);
}

function catalogOptionsForBrand(brand) {
  const parts = catalogPartsForBrand(brand);
  const values = (key) => [...new Set(parts.map((part) => part[key]).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));
  return {
    families: values("family"),
    models: values("model"),
    categories: values("category"),
    makes: values("make"),
    fitmentModels: values("fitmentModel"),
    unitTypes: values("unitType"),
  };
}

function invalidateCatalogCache() {
  state.catalogGeneration += 1;
  state.catalogParts = [];
  state.catalogLoaded = false;
  state.catalogWarmPromise = null;
}

async function warmCatalogCache() {
  if (state.catalogLoaded || state.catalogWarmPromise) {
    return state.catalogWarmPromise;
  }
  const generation = state.catalogGeneration;
  const department = state.department;
  const request = api("/api/parts");
  state.catalogWarmPromise = request;
  try {
    const parts = await request;
    if (generation === state.catalogGeneration && department === state.department) {
      state.catalogParts = parts;
      state.catalogLoaded = true;
    }
  } catch (error) {
    console.warn("CounterFlow could not warm the brand cache.", error);
  } finally {
    if (state.catalogWarmPromise === request) {
      state.catalogWarmPromise = null;
    }
  }
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

  const ordered = orderedBrands();
  const pinned = ordered.filter((brand) => isPinnedBrand(brand));
  const unpinned = ordered.filter((brand) => !isPinnedBrand(brand));
  [...pinned, ...unpinned].forEach((brand) => {
    const button = brandButton({ ...brand, isPinned: isPinnedBrand(brand) });
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
    row.draggable = state.brandOrderMode === "custom";
    if (state.brandOrderMode === "custom") {
      row.addEventListener("dragstart", (event) => handleBrandDragStart(event, brand.id));
      row.addEventListener("dragover", handleBrandDragOver);
      row.addEventListener("dragleave", handleBrandDragLeave);
      row.addEventListener("drop", (event) => handleBrandDrop(event, brand.id));
      row.addEventListener("dragend", handleBrandDragEnd);
    }

    if (state.brandOrderMode === "custom") {
      const dragHandle = document.createElement("span");
      dragHandle.className = "brand-drag-handle";
      dragHandle.textContent = "Drag";
      dragHandle.title = "Drag to reorder this brand";
      row.appendChild(dragHandle);
    }

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

    const controls = document.createElement("span");
    controls.className = "brand-move-controls";

    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = "secondary-button compact-button";
    pin.textContent = isPinnedBrand(brand) ? "Unpin" : "Pin";
    pin.addEventListener("click", () => togglePinnedBrand(brand.id));
    controls.appendChild(pin);

    if (state.brandOrderMode === "custom") {
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
    }

    row.appendChild(controls);
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
    count.textContent = `${brand.partCount || 0} parts saved${brand.archiveNote ? ` - ${brand.archiveNote}` : ""}`;

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
  applyCustomBrandOrder(order);
}

function applyCustomBrandOrder(order) {
  state.customBrandOrder = order;
  renderBrands();
  renderBrandSettings();
  renderParts();
}

function handleBrandDragStart(event, brandId) {
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", String(brandId));
  event.currentTarget.classList.add("is-dragging");
}

function handleBrandDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  event.currentTarget.classList.add("is-drop-target");
}

function handleBrandDragLeave(event) {
  event.currentTarget.classList.remove("is-drop-target");
}

function handleBrandDragDropOrder(sourceId, targetId) {
  const order = orderedBrands().map((brand) => String(brand.id));
  const sourceIndex = order.indexOf(String(sourceId));
  const targetIndex = order.indexOf(String(targetId));
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return;
  }
  const [moved] = order.splice(sourceIndex, 1);
  order.splice(targetIndex, 0, moved);
  applyCustomBrandOrder(order);
  showFeedback("Brand order updated. Lock Custom Order to save it.", "ok");
}

function handleBrandDrop(event, targetId) {
  event.preventDefault();
  const sourceId = event.dataTransfer.getData("text/plain");
  handleBrandDragDropOrder(sourceId, targetId);
  handleBrandDragEnd();
}

function handleBrandDragEnd() {
  document.querySelectorAll(".settings-brand-row.is-dragging, .settings-brand-row.is-drop-target").forEach((row) => {
    row.classList.remove("is-dragging", "is-drop-target");
  });
}

async function lockCustomBrandOrder() {
  if (state.brandOrderMode !== "custom") {
    return;
  }

  try {
    const accessPayload = protectedAccessOrPrompt(
      "Admin password or brand editing role permission is required to lock brand order.",
      { brandIds: state.customBrandOrder },
    );
    if (!accessPayload) {
      return;
    }
    await api("/api/brands/reorder", {
      method: "POST",
      body: JSON.stringify(accessPayload),
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
  button.classList.toggle("is-pinned-brand", Boolean(brand.isPinned));
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
  } else if (brand.isPinned) {
    const badge = document.createElement("span");
    badge.className = "pin-badge";
    badge.textContent = "?";
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
  renderBrands();
  await Promise.all([loadOptions(), loadParts()]);
}

function openSettings() {
  renderDepartmentControls();
  renderEmployeeAdminVisibility();
  renderAdminToolsVisibility();
  renderBrandSettings();
  renderSavedBrandSettings();
  void loadVersion();
  void loadBackups();
  void loadEmployees();
  void loadAppSettings();
  void loadLocalLink();
  if (state.brands.length && !state.editingBrandId) {
    openBrandEditor(orderedBrands()[0], { focus: false });
  } else if (!state.brands.length) {
    openBrandEditor(null, { focus: false });
  }
  selectSettingsTab(isAdminEmployee() ? "employees" : "brands");
  els.settingsDialog.showModal();
  scrollSettingsToTop();
}

function openLogin() {
  renderEmployeeState();
  els.loginDialog.showModal();
  if (state.currentEmployee?.id) {
    els.employeeSignOutButton.focus();
  } else {
    els.employeeLoginUsername.focus();
  }
}

function openBrandEditor(brand = null, options = {}) {
  state.editingBrandId = brand ? String(brand.id) : "";
  els.brandId.value = brand?.id || "";
  els.brandName.value = brand?.name || "";
  els.brandAccent.value = normalizeColor(brand?.accent || "#2563eb");
  els.brandCategory.value = brand?.category || "";
  els.brandDefaultFamily.value = brand?.defaultFamily || "";
  els.brandDefaultModel.value = brand?.defaultModel || "";
  els.brandDefaultCategory.value = brand?.defaultCategory || "";
  els.brandLogo.value = brand?.logo || "";
  els.brandLogoFile.value = "";
  els.brandArchiveNote.value = brand?.archiveNote || "";
  els.deleteBrandButton.hidden = !brand;
  renderBrandSettings();
  if (options.focus !== false) {
    els.brandName.focus();
  }
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

  const fitment = document.createElement("span");
  fitment.className = "part-fitment";
  fitment.textContent = fitmentLabel(part);
  fitment.hidden = !fitment.textContent;

  const reviewBadge = document.createElement("span");
  reviewBadge.className = "review-badge";
  reviewBadge.textContent = "Review";
  reviewBadge.hidden = part.reviewStatus !== "needs-review";

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
  tile.append(title, meta, fitment, reviewBadge, numberRow);
  tile.addEventListener("click", () => handlePartAction(part));
  tile.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handlePartAction(part);
    }
  });

  return tile;
}

function fitmentLabel(part) {
  const yearStart = Number(part.yearStart || 0);
  const yearEnd = Number(part.yearEnd || 0);
  let year = "";
  if (yearStart && yearEnd) {
    year = yearStart === yearEnd ? String(yearStart) : `${yearStart}-${yearEnd}`;
  } else if (yearStart) {
    year = `${yearStart}+`;
  } else if (yearEnd) {
    year = `Through ${yearEnd}`;
  }
  return [year, part.make, part.fitmentModel, part.unitType].filter(Boolean).join(" - ");
}

function handlePartAction(part) {
  if (state.editMode) {
    openEditor(part);
  } else {
    copyPart(part);
  }
}

function visibleParts() {
  let parts = state.parts;
  if (state.filters.brand === FAVORITES_FILTER) {
    parts = parts.filter((part) => isFavorite(part));
  }
  return parts.filter((part) => matchesViewFilter(part));
}

function matchesViewFilter(part) {
  if (state.filters.view === "missing") {
    return !part.partNumber;
  }
  if (state.filters.view === "superseded") {
    return Boolean(part.oldPartNumber || part.newPartNumber);
  }
  if (state.filters.view === "favorites") {
    return isFavorite(part);
  }
  if (state.filters.view === "recent") {
    const updated = Date.parse(part.updatedAt || "");
    if (!updated) {
      return false;
    }
    return Date.now() - updated <= 30 * 24 * 60 * 60 * 1000;
  }
  return true;
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
  try {
    await saveFavorites();
  } catch (error) {
    showFeedback(error.message, "warn");
    return;
  }

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

function defaultFilters() {
  return {
    brand: "",
    family: "",
    model: "",
    category: "",
    year: "",
    make: "",
    fitmentModel: "",
    unitType: "",
    q: "",
    view: "all",
  };
}

function syncFilterControls() {
  els.searchInput.value = state.filters.q || "";
  els.yearFilter.value = state.filters.year || "";
  els.viewFilter.value = state.filters.view || "all";
}

async function loadFavorites() {
  if (state.currentEmployee?.id) {
    try {
      const result = await api(`/api/employee-favorites?employeeId=${encodeURIComponent(state.currentEmployee.id)}`);
      state.favoriteIds = new Set(Array.isArray(result.partIds) ? result.partIds.map(String).filter(Boolean) : []);
      return;
    } catch (error) {
      showFeedback(error.message, "warn");
    }
  }
  loadLocalFavorites();
}

function loadLocalFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem(favoritesStorageKey()) || "[]");
    state.favoriteIds = new Set(Array.isArray(raw) ? raw.map(String).filter(Boolean) : []);
  } catch (error) {
    state.favoriteIds = new Set();
  }
}

async function saveFavorites() {
  if (state.currentEmployee?.id) {
    await api("/api/employee-favorites", {
      method: "PUT",
      body: JSON.stringify({ employeeId: state.currentEmployee.id, partIds: [...state.favoriteIds] }),
    });
    return;
  }
  localStorage.setItem(favoritesStorageKey(), JSON.stringify([...state.favoriteIds]));
}

function favoritesStorageKey() {
  const scope = state.currentEmployee?.id ? `employee-${state.currentEmployee.id}` : "guest";
  return `ppwork-favorites-${state.department}-${scope}`;
}

function clearBrandFilters() {
  state.filters.brand = "";
  state.filters.family = "";
  state.filters.model = "";
  state.filters.category = "";
}

function clearFitmentFilters() {
  state.filters.year = "";
  state.filters.make = "";
  state.filters.fitmentModel = "";
  state.filters.unitType = "";
  syncFilterControls();
  void loadOptions().then(loadParts);
}

function copyTemplateStorageKey() {
  return `ppwork-copy-template-${state.department}-${employeeStorageScope()}`;
}

function loadCopyTemplate() {
  const value = localStorage.getItem(copyTemplateStorageKey()) || "number";
  state.copyTemplate = ["number", "numberItem", "brandItemNumber", "repairOrder", "dmsRow", "csvRow"].includes(value) ? value : "number";
  renderCopyTemplateControl();
}

function saveCopyTemplate(value) {
  state.copyTemplate = ["number", "numberItem", "brandItemNumber", "repairOrder", "dmsRow", "csvRow"].includes(value) ? value : "number";
  localStorage.setItem(copyTemplateStorageKey(), state.copyTemplate);
  renderCopyTemplateControl();
  showFeedback("Copy format saved for this employee.", "ok");
}

function renderCopyTemplateControl() {
  if (els.copyTemplateSelect) {
    els.copyTemplateSelect.value = state.copyTemplate;
  }
}

function csvCell(value) {
  return `"${String(value || "").replace(/"/g, '""')}"`;
}

function copyTextForPart(part) {
  const partNumber = part.partNumber || "";
  const brand = part.brand || "";
  const item = part.item || "";
  const model = part.model || "";
  const category = part.category || "";
  if (state.copyTemplate === "numberItem") {
    return `${partNumber} ${item}`.trim();
  }
  if (state.copyTemplate === "brandItemNumber") {
    return [brand, item, partNumber].filter(Boolean).join(" - ");
  }
  if (state.copyTemplate === "repairOrder") {
    return [brand, model, item].filter(Boolean).join(" ") + ` - ${partNumber}`;
  }
  if (state.copyTemplate === "dmsRow") {
    return [partNumber, item, brand, model, category].join("\t");
  }
  if (state.copyTemplate === "csvRow") {
    return [partNumber, item, brand, model, category].map(csvCell).join(",");
  }
  return partNumber;
}

async function copyPart(part) {
  if (!part.partNumber) {
    showFeedback(`${part.item} needs a part number.`, "warn");
    return;
  }

  const copyText = copyTextForPart(part);
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(copyText);
    } else if (!fallbackCopy(copyText)) {
      throw new Error("Copy command failed.");
    }
    recordCopiedPart(part);
    showFeedback(`Copied ${part.partNumber}`, "ok");
  } catch (error) {
    if (fallbackCopy(copyText)) {
      recordCopiedPart(part);
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

function loadCopyActivity() {
  try {
    const history = JSON.parse(localStorage.getItem(copyHistoryStorageKey()) || "[]");
    state.copyHistory = Array.isArray(history) ? history : [];
  } catch (error) {
    state.copyHistory = [];
  }
  try {
    const stats = JSON.parse(localStorage.getItem(copyStatsStorageKey()) || "{}");
    state.copyStats = stats && typeof stats === "object" && !Array.isArray(stats) ? stats : {};
  } catch (error) {
    state.copyStats = {};
  }
}

function recordCopiedPart(part) {
  const snapshot = copySnapshot(part);
  state.copyHistory = [snapshot, ...state.copyHistory.filter((item) => String(item.id) !== String(part.id))].slice(0, 20);
  const previous = state.copyStats[String(part.id)] || { ...snapshot, count: 0 };
  state.copyStats[String(part.id)] = { ...snapshot, count: (previous.count || 0) + 1, lastCopiedAt: snapshot.copiedAt };
  saveCopyActivity();
  recordEmployeeCopyActivity(part);
  renderQuickPanels();
}

function copySnapshot(part) {
  return {
    id: String(part.id),
    brand: part.brand,
    item: part.item,
    model: part.model,
    category: part.category,
    partNumber: part.partNumber,
    copiedAt: new Date().toISOString(),
  };
}

function saveCopyActivity() {
  localStorage.setItem(copyHistoryStorageKey(), JSON.stringify(state.copyHistory));
  localStorage.setItem(copyStatsStorageKey(), JSON.stringify(state.copyStats));
}

function recordEmployeeCopyActivity(part) {
  if (!state.currentEmployee?.id) {
    return;
  }
  void api("/api/copy-activity", {
    method: "POST",
    body: JSON.stringify({ employeeId: state.currentEmployee.id, partId: part.id }),
  }).catch(() => {});
}

function employeeStorageScope() {
  return state.currentEmployee?.id ? `employee-${state.currentEmployee.id}` : "guest";
}

function copyHistoryStorageKey() {
  return `ppwork-copy-history-${state.department}-${employeeStorageScope()}`;
}

function copyStatsStorageKey() {
  return `ppwork-copy-stats-${state.department}-${employeeStorageScope()}`;
}

function clearCopyHistory() {
  state.copyHistory = [];
  state.copyStats = {};
  saveCopyActivity();
  renderQuickPanels();
  showFeedback("Copy history cleared.", "warn");
}

function renderQuickPanels() {
  if (!els.quickPanels) {
    return;
  }
  const history = state.copyHistory.slice(0, 6);
  const mostUsed = Object.values(state.copyStats)
    .sort((a, b) => (b.count || 0) - (a.count || 0) || String(b.lastCopiedAt || "").localeCompare(String(a.lastCopiedAt || "")))
    .slice(0, 6);
  renderQuickList(els.recentCopyList, history, false);
  renderQuickList(els.mostUsedList, mostUsed, true);
  els.quickPanels.hidden = !history.length && !mostUsed.length;
}

function renderQuickList(container, items, showCount) {
  container.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("span");
    empty.className = "quick-empty";
    empty.textContent = "No copied parts yet.";
    container.appendChild(empty);
    return;
  }
  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quick-copy-button";
    const label = [item.brand, item.item].filter(Boolean).join(" - ");
    button.textContent = `${label} ${item.partNumber}${showCount ? ` (${item.count})` : ""}`;
    button.addEventListener("click", () => copyQuickItem(item));
    container.appendChild(button);
  });
}

async function copyQuickItem(item) {
  const part = state.parts.find((candidate) => String(candidate.id) === String(item.id));
  if (part) {
    await copyPart(part);
    return;
  }
  const copyText = copyTextForPart(item);
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(copyText);
    } else if (!fallbackCopy(copyText)) {
      throw new Error("Copy command failed.");
    }
    showFeedback(`Copied ${item.partNumber}`, "ok");
  } catch (error) {
    showFeedback(`Copy failed: ${item.partNumber}`, "warn");
  }
}

function openEditor(part = null) {
  const selectedBrand = state.brands.find((brand) => brand.name === state.filters.brand) || state.brands[0];
  const defaultBrand = selectedBrand?.name || "";
  const values = part || {
    id: "",
    brand: defaultBrand,
    family: state.filters.family || selectedBrand?.defaultFamily || "",
    model: state.filters.model || selectedBrand?.defaultModel || "",
    category: state.filters.category || selectedBrand?.defaultCategory || "",
    yearStart: state.filters.year || "",
    yearEnd: state.filters.year || "",
    make: state.filters.make || "",
    fitmentModel: state.filters.fitmentModel || "",
    unitType: state.filters.unitType || "",
    reviewStatus: "approved",
    reviewNote: "",
    item: "",
    buttonText: "",
    partNumber: "",
    oldPartNumber: "",
    newPartNumber: "",
    vendor: "",
    alternateNumbers: "",
    aftermarketNumbers: "",
    tags: "",
    fitmentNotes: "",
    attachmentUrl: "",
    notes: "",
  };

  els.dialogTitle.textContent = part ? "Edit Part" : "Add Part";
  els.partId.value = values.id || "";
  els.partBrand.value = values.brand || "";
  els.partFamily.value = values.family || "";
  els.partModel.value = values.model || "";
  els.partCategory.value = values.category || "";
  els.partYearStart.value = values.yearStart || "";
  els.partYearEnd.value = values.yearEnd || "";
  els.partMake.value = values.make || "";
  els.partFitmentModel.value = values.fitmentModel || "";
  els.partUnitType.value = values.unitType || "";
  els.partReviewStatus.value = values.reviewStatus || "approved";
  els.partReviewNote.value = values.reviewNote || "";
  els.partItem.value = values.item || "";
  els.partButtonText.value = values.buttonText || "";
  els.partNumber.value = values.partNumber || "";
  els.partOldPartNumber.value = values.oldPartNumber || "";
  els.partNewPartNumber.value = values.newPartNumber || "";
  els.partVendor.value = values.vendor || "";
  els.partAlternateNumbers.value = values.alternateNumbers || "";
  els.partAftermarketNumbers.value = values.aftermarketNumbers || "";
  els.partTags.value = values.tags || "";
  els.partFitmentNotes.value = values.fitmentNotes || "";
  els.partAttachmentUrl.value = values.attachmentUrl || "";
  els.partNotes.value = values.notes || "";
  els.deleteButton.hidden = !part;

  els.partDialog.showModal();
  els.partItem.focus();
}

async function savePart(event) {
  event.preventDefault();

  const id = els.partId.value;
  const payload = readForm();
  if (!payload.brand || !payload.item || !payload.partNumber) {
    showFeedback("Brand, item, and part number are required.", "warn");
    return;
  }
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
  await saveFavorites();
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
    category: els.brandCategory.value,
    defaultFamily: els.brandDefaultFamily.value.trim(),
    defaultModel: els.brandDefaultModel.value.trim(),
    defaultCategory: els.brandDefaultCategory.value.trim(),
    logo: els.brandLogo.value.trim(),
  };
  const path = id ? `/api/brands/${id}` : "/api/brands";
  const method = id ? "PUT" : "POST";

  try {
    const accessPayload = protectedAccessOrPrompt(
      "Admin password or brand editing role permission is required to save brands.",
      payload,
    );
    if (!accessPayload) {
      return;
    }
    if (els.brandLogoFile.files.length) {
      const uploadedLogo = await uploadLogo(els.brandLogoFile.files[0], name, accessPayload);
      accessPayload.logo = uploadedLogo;
      els.brandLogo.value = uploadedLogo;
    }

    const response = await api(path, {
      method,
      body: JSON.stringify(accessPayload),
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

function currentEmployeeAccess() {
  if (state.currentEmployee?.id && state.currentEmployee?.sessionToken) {
    return { employeeId: state.currentEmployee.id, sessionToken: state.currentEmployee.sessionToken };
  }
  return {};
}

function protectedAccessPayload(extra = {}) {
  const payload = { ...extra, ...currentEmployeeAccess() };
  const adminPassword = els.adminPassword?.value || els.employeeAdminPassword?.value || "";
  if (adminPassword) {
    payload.adminPassword = adminPassword;
  }
  return payload;
}

function hasProtectedAccess(payload) {
  return Boolean(payload.adminPassword || payload.sessionToken);
}

function protectedAccessOrPrompt(promptText, extra = {}) {
  const payload = protectedAccessPayload(extra);
  if (hasProtectedAccess(payload)) {
    return payload;
  }
  const adminPassword = window.prompt(promptText);
  if (adminPassword === null) {
    return null;
  }
  return { ...payload, adminPassword };
}

async function uploadLogo(file, brandName, accessPayload = {}) {
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
      ...accessPayload,
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
    const accessPayload = protectedAccessOrPrompt(
      `Admin password or brand deletion role permission is required to save and hide ${name}.`,
      { archiveNote: els.brandArchiveNote.value.trim() },
    );
    if (!accessPayload) {
      return;
    }
    await api(`/api/brands/${id}`, {
      method: "DELETE",
      body: JSON.stringify(accessPayload),
    });
    if (state.filters.brand === name) {
      state.filters.brand = "";
    }
    state.editingBrandId = "";
    await refreshAll();
    openBrandEditor(orderedBrands()[0] || null, { focus: false });
    showFeedback(`${name} saved and hidden.`, "warn");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function restoreBrand(brand) {
  const detail = `${brand.partCount || 0} parts${brand.unassignedCount ? `, ${brand.unassignedCount} missing numbers` : ""}`;
  const note = brand.archiveNote ? `
Archive note: ${brand.archiveNote}` : "";
  if (!window.confirm(`Restore ${brand.name}?
${detail}${note}`)) {
    return;
  }
  try {
    const accessPayload = protectedAccessOrPrompt(
      `Admin password or brand deletion role permission is required to restore ${brand.name}.`,
    );
    if (!accessPayload) {
      return;
    }
    await api(`/api/brands/${brand.id}/restore`, { method: "POST", body: JSON.stringify(accessPayload) });
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
  const accessPayload = protectedAccessOrPrompt(
    `Admin password or permanent saved-brand removal permission is required to permanently remove ${brand.name}. ${partCount} part records will remain only in the database for admin backup.`,
  );
  if (!accessPayload) {
    return;
  }

  try {
    await api(`/api/brands/${brand.id}/permanent`, {
      method: "DELETE",
      body: JSON.stringify(accessPayload),
    });
    await refreshAll();
    showFeedback(`${brand.name} permanently removed from Saved Brands.`, "warn");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function loadVersion() {
  if (!els.appVersion) {
    return;
  }
  try {
    const result = await api("/api/version");
    els.appVersion.textContent = `Version ${result.version}`;
  } catch (error) {
    els.appVersion.textContent = "Version unavailable";
  }
}

async function loadBackups() {
  if (!els.backupSelect) {
    return;
  }
  try {
    const backups = await api("/api/admin/backups");
    els.backupSelect.replaceChildren();
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = backups.length ? "Choose backup" : "No backups yet";
    els.backupSelect.appendChild(empty);
    backups.forEach((backup) => {
      const option = document.createElement("option");
      option.value = backup.fileName;
      option.textContent = `${backup.fileName} (${formatFileSize(backup.size)})`;
      els.backupSelect.appendChild(option);
    });
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function createBackup() {
  const payload = protectedAccessOrPrompt("Admin password required to create a backup. Managers and admins can also sign in first.");
  if (!payload) {
    return;
  }
  try {
    const result = await api("/api/admin/backup", { method: "POST", body: JSON.stringify(payload) });
    await loadBackups();
    showFeedback(`Backup created: ${result.fileName}`, "ok");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function restoreBackup() {
  const fileName = els.backupSelect.value;
  const accessPayload = protectedAccessPayload();
  if (!fileName) {
    showFeedback("Choose a backup to restore.", "warn");
    return;
  }
  if (!hasProtectedAccess(accessPayload)) {
    showFeedback("Admin password or manager/admin sign-in is required to restore a backup.", "warn");
    return;
  }
  if (!window.confirm(`Restore ${fileName}? The current ${departmentLabel()} database will be backed up first.`)) {
    return;
  }

  try {
    const result = await api("/api/admin/restore", {
      method: "POST",
      body: JSON.stringify({ ...accessPayload, fileName }),
    });
    await refreshAll();
    await loadBackups();
    showFeedback(`Restored ${result.restored}. Safety backup: ${result.safetyBackup}`, "ok");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function exportPartsCsv() {
  await exportPartsFile("/api/export/parts", `${state.department}-parts.csv`, "Parts CSV exported.");
}

async function exportPartsXlsx() {
  await exportPartsFile("/api/export/parts.xlsx", `${state.department}-parts.xlsx`, "Parts Excel file exported.");
}

async function exportPartsFile(endpoint, fallbackName, successMessage) {
  try {
    const response = await fetch(apiUrl(endpoint), {
      headers: accessHeaders(),
    });
    if (!response.ok) {
      const message = await response.json().then((body) => body.error).catch(() => "Export failed.");
      throw new Error(message || "Export failed.");
    }
    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition") || "";
    const fileName = disposition.match(/filename="?([^";]+)"?/)?.[1] || fallbackName;
    downloadBlob(blob, fileName);
    showFeedback(successMessage, "ok");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function importPartsFile() {
  const file = els.importPartsFile.files[0];
  const accessPayload = protectedAccessPayload();
  els.importPartsFile.value = "";
  if (!file) {
    return;
  }
  if (!hasProtectedAccess(accessPayload)) {
    showFeedback("Admin password or import role permission is required to import parts.", "warn");
    return;
  }
  if (!window.confirm(`Import ${file.name}? A database backup will be created before changes are made.`)) {
    return;
  }

  try {
    const isExcel = file.name.toLowerCase().endsWith(".xlsx") || file.type.includes("spreadsheetml");
    const body = isExcel
      ? { ...accessPayload, xlsxBase64: await fileToBase64(file) }
      : { ...accessPayload, csvText: await file.text() };
    const result = await api(isExcel ? "/api/import/parts.xlsx" : "/api/import/parts", {
      method: "POST",
      body: JSON.stringify(body),
    });
    await refreshAll();
    await loadBackups();
    showFeedback(`Import complete: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped.`, "ok");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function fileToBase64(file) {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < bytes.byteLength; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return window.btoa(binary);
}


function loadStoredEmployee() {
  try {
    const employee = JSON.parse(localStorage.getItem("ppwork-current-employee") || "null");
    return employee && employee.id ? employee : null;
  } catch (error) {
    return null;
  }
}

function saveStoredEmployee(employee) {
  if (employee?.id) {
    localStorage.setItem("ppwork-current-employee", JSON.stringify(employee));
    return;
  }
  localStorage.removeItem("ppwork-current-employee");
}

function employeeRoleLabel(role) {
  const labels = { counter: "Counter", manager: "Manager", admin: "Admin" };
  return labels[role] || "Counter";
}

async function loadEmployees() {
  try {
    state.employees = await api("/api/employees");
    if (state.currentEmployee?.id) {
      const activeEmployee = state.employees.find((employee) => String(employee.id) === String(state.currentEmployee.id));
      if (activeEmployee) {
        state.currentEmployee = { ...activeEmployee, sessionToken: state.currentEmployee.sessionToken || "" };
        saveStoredEmployee(state.currentEmployee);
      } else {
        state.currentEmployee = null;
        saveStoredEmployee(null);
        loadLocalFavorites();
        loadCopyActivity();
      }
    }
    enforceCurrentDepartmentAccess();
    renderEmployeeState();
    renderEmployeeSettings();
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

function renderEmployeeState() {
  const employee = state.currentEmployee;
  if (els.employeeButton) {
    els.employeeButton.textContent = employee ? `Employee: ${employee.name}` : "Employee: Guest";
  }
  if (els.loginButton) {
    els.loginButton.textContent = employee ? "Logout" : "Login";
  }
  if (els.employeeCurrent) {
    const access = employee?.allowedDepartments?.length ? ` - ${employee.allowedDepartments.map(departmentName).join("/")}` : "";
    els.employeeCurrent.textContent = employee ? `${employee.name} - ${employeeRoleLabel(employee.role)}${access}` : "Guest";
  }
  if (els.loginCurrent) {
    els.loginCurrent.textContent = employee ? `${employee.name} - ${employeeRoleLabel(employee.role)}` : "Not signed in";
  }
  if (els.employeeSignInButton) {
    els.employeeSignInButton.disabled = Boolean(employee);
  }
  if (els.employeeLoginUsername) {
    els.employeeLoginUsername.disabled = Boolean(employee);
  }
  if (els.employeeLoginPassword) {
    els.employeeLoginPassword.disabled = Boolean(employee);
  }
  renderEmployeeAdminVisibility();
  renderAdminToolsVisibility();
}

function renderEmployeeSettings() {
  if (!els.employeeList) {
    return;
  }
  els.employeeSignOutButton.disabled = !state.currentEmployee;
  els.employeeList.replaceChildren();
  if (!state.employees.length) {
    const emptyRow = document.createElement("span");
    emptyRow.className = "quick-empty";
    emptyRow.textContent = "No employees yet.";
    els.employeeList.appendChild(emptyRow);
  } else {
    state.employees.forEach((employee) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "employee-row";
      button.dataset.employeeId = employee.id;
      button.classList.toggle("is-active", String(employee.id) === String(state.editingEmployeeId));
      const username = employee.username ? ` @${escapeHtml(employee.username)}` : "";
      const departments = employee.allowedDepartments?.length ? ` - ${employee.allowedDepartments.map(departmentName).join("/")}` : "";
      button.innerHTML = `<span>${escapeHtml(employee.name)}${username}</span><small>${employeeRoleLabel(employee.role)}${departments}${employee.hasPassword ? " - Password" : employee.hasPin ? " - PIN" : ""}</small>`;
      button.addEventListener("click", () => openEmployeeEditor(employee));
      els.employeeList.appendChild(button);
    });
  }
  if (!state.editingEmployeeId) {
    openEmployeeEditor(null);
  }
}

function openEmployeeEditor(employee = null) {
  state.editingEmployeeId = employee ? String(employee.id) : "";
  els.employeeId.value = employee?.id || "";
  els.employeeName.value = employee?.name || "";
  els.employeeUsername.value = employee?.username || "";
  els.employeeRole.value = employee?.role || "counter";
  els.employeePasswordNew.value = "";
  els.employeePinNew.value = "";
  els.employeeLocationScope.value = employee?.locationScope || "";
  const allowed = new Set(employee?.allowedDepartments || ["parts", "service"]);
  els.employeeDepartmentParts.checked = allowed.has("parts");
  els.employeeDepartmentService.checked = allowed.has("service");
  els.deleteEmployeeButton.hidden = !employee;
  els.resetEmployeeLoginButton.hidden = !employee;
  if (els.employeeList) {
    [...els.employeeList.querySelectorAll(".employee-row")].forEach((row) => {
      row.classList.toggle("is-active", (row.dataset.employeeId || "") === state.editingEmployeeId);
    });
  }
}

async function signInEmployee(event) {
  event?.preventDefault();
  const username = els.employeeLoginUsername.value.trim();
  const password = els.employeeLoginPassword.value;
  if (!username) {
    showFeedback("Enter an employee username first.", "warn");
    return;
  }
  try {
    const employee = await api("/api/employees/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    state.currentEmployee = employee;
    saveStoredEmployee(employee);
    els.employeeLoginPassword.value = "";
    loadCopyActivity();
    loadCopyTemplate();
    await loadFavorites();
    enforceCurrentDepartmentAccess();
    renderEmployeeState();
    renderEmployeeSettings();
    renderDepartmentControls();
    renderBrands();
    renderParts();
    renderQuickPanels();
    resetInactivityTimer();
    els.loginDialog.close();
    showFeedback(`${employee.name} signed in.`, "ok");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}
function resetInactivityTimer() {
  clearTimeout(state.inactivityTimer);
  if (!state.currentEmployee?.id) {
    return;
  }
  state.inactivityTimer = setTimeout(() => {
    if (!state.currentEmployee?.id) {
      return;
    }
    const name = state.currentEmployee.name;
    signOutEmployee({ silent: true });
    showFeedback(`${name} signed out after inactivity.`, "warn");
  }, AUTO_SIGN_OUT_MS);
}

function signOutEmployee(options = {}) {
  const name = state.currentEmployee?.name || "Employee";
  state.currentEmployee = null;
  saveStoredEmployee(null);
  loadLocalFavorites();
  loadCopyActivity();
  loadCopyTemplate();
  renderEmployeeState();
  renderEmployeeSettings();
  renderBrands();
  renderParts();
  renderQuickPanels();
  renderDepartmentControls();
  if (!options.silent) {
    showFeedback(`${name} signed out.`, "warn");
  }
}

async function saveEmployee(event) {
  event.preventDefault();
  const id = els.employeeId.value;
  const allowedDepartments = [];
  if (els.employeeDepartmentParts.checked) {
    allowedDepartments.push("parts");
  }
  if (els.employeeDepartmentService.checked) {
    allowedDepartments.push("service");
  }
  const payload = {
    name: els.employeeName.value.trim(),
    username: els.employeeUsername.value.trim(),
    role: els.employeeRole.value,
    password: els.employeePasswordNew.value,
    pin: els.employeePinNew.value,
    allowedDepartments,
    locationScope: els.employeeLocationScope.value.trim(),
    ...currentEmployeeAccess(),
    adminPassword: els.employeeAdminPassword.value,
  };
  if (!payload.name) {
    showFeedback("Employee name is required.", "warn");
    return;
  }
  if (!payload.allowedDepartments.length) {
    showFeedback("Choose at least one department for this employee.", "warn");
    return;
  }
  try {
    const employee = await api(id ? `/api/employees/${id}` : "/api/employees", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });
    els.employeePasswordNew.value = "";
    els.employeePinNew.value = "";
    els.employeeAdminPassword.value = "";
    if (state.currentEmployee?.id && String(state.currentEmployee.id) === String(employee.id)) {
      state.currentEmployee = { ...employee, sessionToken: state.currentEmployee.sessionToken || employee.sessionToken || "" };
      saveStoredEmployee(state.currentEmployee);
      enforceCurrentDepartmentAccess();
    }
    await loadEmployees();
    openEmployeeEditor(employee);
    renderDepartmentControls();
    showFeedback(`${employee.name} saved.`, "ok");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function resetEmployeeLogin() {
  const id = els.employeeId.value;
  const name = els.employeeName.value.trim() || "this employee";
  if (!id) {
    return;
  }
  if (!window.confirm(`Clear the password and PIN for ${name}? They will not be able to sign in until a new login is saved.`)) {
    return;
  }
  const payload = {
    name: els.employeeName.value.trim(),
    username: els.employeeUsername.value.trim(),
    role: els.employeeRole.value,
    allowedDepartments: [
      ...(els.employeeDepartmentParts.checked ? ["parts"] : []),
      ...(els.employeeDepartmentService.checked ? ["service"] : []),
    ],
    locationScope: els.employeeLocationScope.value.trim(),
    clearPassword: true,
    clearPin: true,
    ...currentEmployeeAccess(),
    adminPassword: els.employeeAdminPassword.value,
  };
  try {
    const employee = await api(`/api/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    els.employeePasswordNew.value = "";
    els.employeePinNew.value = "";
    els.employeeAdminPassword.value = "";
    await loadEmployees();
    openEmployeeEditor(employee);
    showFeedback(`${name} login reset.`, "warn");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function deleteEmployee() {
  const id = els.employeeId.value;
  const name = els.employeeName.value.trim() || "this employee";
  if (!id || !window.confirm(`Delete ${name}?`)) {
    return;
  }
  try {
    await api(`/api/employees/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ ...currentEmployeeAccess(), adminPassword: els.employeeAdminPassword.value }),
    });
    els.employeeAdminPassword.value = "";
    if (state.currentEmployee?.id && String(state.currentEmployee.id) === String(id)) {
      state.currentEmployee = null;
      saveStoredEmployee(null);
      loadLocalFavorites();
      loadCopyActivity();
    }
    state.editingEmployeeId = "";
    await loadEmployees();
    renderBrands();
    renderParts();
    renderQuickPanels();
    showFeedback(`${name} deleted.`, "warn");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

function formatLocalDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

async function loadAppSettings() {
  try {
    state.appSettings = await api("/api/settings");
    renderAppSettings();
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

function renderAppSettings() {
  const settings = state.appSettings || {};
  els.dealershipName.value = settings.dealershipName || "Independence County Offroad";
  els.locationName.value = settings.locationName || "";
  els.partsDepartmentLabel.value = settings.partsDepartmentLabel || "Parts";
  els.serviceDepartmentLabel.value = settings.serviceDepartmentLabel || "Service";
  state.permissionActions = Array.isArray(settings.permissionActions) && settings.permissionActions.length
    ? settings.permissionActions
    : DEFAULT_PERMISSION_ACTIONS;
  state.rolePermissions = normalizeRolePermissions(settings.rolePermissions);
  renderRolePermissions();
  const dealership = settings.dealershipName || "Independence County Offroad";
  els.appTitle.textContent = "CounterFlow";
  document.title = `CounterFlow | ${dealership}`;
  renderDepartmentControls();
}

async function saveAppSettings(event) {
  event.preventDefault();
  try {
    state.appSettings = await api("/api/settings", {
      method: "PUT",
      body: JSON.stringify({
        dealershipName: els.dealershipName.value.trim(),
        locationName: els.locationName.value.trim(),
        partsDepartmentLabel: els.partsDepartmentLabel.value.trim(),
        serviceDepartmentLabel: els.serviceDepartmentLabel.value.trim(),
      }),
    });
    renderAppSettings();
    showFeedback("Dealership settings saved.", "ok");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function loadLocalLink() {
  try {
    const link = await api("/api/local-link");
    const urls = [link.localUrl, ...(link.networkUrls || [])].filter(Boolean);
    els.localLinkOutput.textContent = urls.join("  ") || window.location.href;
  } catch (error) {
    els.localLinkOutput.textContent = window.location.href;
  }
}

async function copyLocalLink() {
  const value = els.localLinkOutput.textContent.trim();
  if (!value) {
    return;
  }
  await navigator.clipboard.writeText(value.split(/\s+/)[0]);
  showFeedback("Local app link copied.", "ok");
}

function openSetupChecklist() {
  window.open(apiUrl("/api/setup-checklist"), "_blank", "noopener");
}

async function loadServiceResources() {
  try {
    state.serviceResources = await api("/api/service-resources");
    renderServiceResources();
    if (!state.editingServiceResourceId) {
      openServiceResourceEditor(state.serviceResources[0] || null);
    }
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

function renderServiceResources() {
  els.serviceResourceList.replaceChildren();
  if (!state.serviceResources.length) {
    const empty = document.createElement("div");
    empty.className = "quick-empty";
    empty.textContent = "No service workflow items yet.";
    els.serviceResourceList.appendChild(empty);
    return;
  }
  state.serviceResources.forEach((resource) => {
    const row = document.createElement("div");
    row.className = "service-resource-row";
    row.classList.toggle("is-active", String(resource.id) === String(state.editingServiceResourceId));

    const body = document.createElement("button");
    body.type = "button";
    body.className = "service-resource-main";
    body.innerHTML = `<strong>${escapeHtml(resource.title)}</strong><span>${escapeHtml(resourceTypeLabel(resource.type))}${resource.model ? ` - ${escapeHtml(resource.model)}` : ""}</span>`;
    body.addEventListener("click", () => openServiceResourceEditor(resource));

    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "secondary-button compact-button";
    copy.textContent = "Copy";
    copy.addEventListener("click", () => copyServiceResource(resource));

    row.append(body, copy);
    els.serviceResourceList.appendChild(row);
  });
}

function openServiceResourceEditor(resource = null) {
  state.editingServiceResourceId = resource?.id ? String(resource.id) : "";
  els.serviceResourceId.value = state.editingServiceResourceId;
  els.serviceResourceType.value = resource?.type || "labor_template";
  els.serviceResourceTitle.value = resource?.title || "";
  els.serviceResourceBrand.value = resource?.brand || "";
  els.serviceResourceModel.value = resource?.model || "";
  els.serviceResourceUnitType.value = resource?.unitType || "";
  els.serviceResourceSeason.value = resource?.season || "";
  els.serviceResourceContent.value = resource?.content || "";
  els.deleteServiceResourceButton.hidden = !resource;
  renderServiceResources();
}

async function saveServiceResource(event) {
  event.preventDefault();
  const id = els.serviceResourceId.value;
  const payload = readServiceResourceForm();
  try {
    await api(id ? `/api/service-resources/${id}` : "/api/service-resources", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });
    state.editingServiceResourceId = "";
    await loadServiceResources();
    showFeedback(`${payload.title} saved.`, "ok");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function deleteServiceResource() {
  const id = els.serviceResourceId.value;
  const title = els.serviceResourceTitle.value.trim() || "this service workflow item";
  if (!id || !window.confirm(`Delete ${title}?`)) {
    return;
  }
  try {
    await api(`/api/service-resources/${id}`, { method: "DELETE" });
    state.editingServiceResourceId = "";
    await loadServiceResources();
    showFeedback(`${title} deleted.`, "warn");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

function readServiceResourceForm() {
  return {
    type: els.serviceResourceType.value,
    title: els.serviceResourceTitle.value.trim(),
    brand: els.serviceResourceBrand.value.trim(),
    model: els.serviceResourceModel.value.trim(),
    unitType: els.serviceResourceUnitType.value.trim(),
    season: els.serviceResourceSeason.value.trim(),
    content: els.serviceResourceContent.value.trim(),
  };
}

async function copyServiceResource(resource) {
  if (!resource.content) {
    showFeedback(`${resource.title} has no copy text yet.`, "warn");
    return;
  }
  await navigator.clipboard.writeText(resource.content);
  showFeedback(`${resource.title} copied.`, "ok");
}

function resourceTypeLabel(type) {
  return {
    labor_template: "Labor Template",
    favorite_kit: "Favorite Kit",
    model_note: "Model Note",
    seasonal_package: "Seasonal Package",
  }[type] || "Service Item";
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));
}

function adminUpdateAccessOrPrompt(promptText) {
  const payload = {};
  if (isAdminEmployee()) {
    Object.assign(payload, currentEmployeeAccess());
  }
  const adminPassword = els.adminPassword?.value || "";
  if (adminPassword) {
    payload.adminPassword = adminPassword;
  }
  if (payload.adminPassword || payload.sessionToken) {
    return payload;
  }
  const promptedPassword = window.prompt(promptText);
  if (promptedPassword === null) {
    return null;
  }
  return { adminPassword: promptedPassword };
}

async function checkForUpdates() {
  const payload = adminUpdateAccessOrPrompt("Admin password required to check and stage CounterFlow updates.");
  if (!payload) {
    return;
  }
  state.stagedUpdate = null;
  if (els.applyUpdateButton) {
    els.applyUpdateButton.disabled = true;
  }
  renderUpdateMessage("Checking GitHub for CounterFlow updates...");
  try {
    const result = await api("/api/admin/update/check", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.stagedUpdate = result.staged ? result : null;
    renderUpdateStatus(result);
    if (els.applyUpdateButton) {
      els.applyUpdateButton.disabled = !result.staged;
    }
    if (result.staged) {
      showFeedback(`Update ${result.incomingVersion} staged. Install when the counter can restart.`, "ok");
    } else {
      showFeedback("No newer CounterFlow update was found.", "ok");
    }
  } catch (error) {
    renderUpdateMessage(error.message);
    showFeedback(error.message, "warn");
  }
}

async function applyStagedUpdate() {
  if (!state.stagedUpdate) {
    showFeedback("Check for updates before installing.", "warn");
    return;
  }
  const payload = adminUpdateAccessOrPrompt("Admin password required to install the staged CounterFlow update.");
  if (!payload) {
    return;
  }
  if (!window.confirm(`Install CounterFlow ${state.stagedUpdate.incomingVersion}? Employees should finish active copies first. Restart CounterFlow after the install completes.`)) {
    return;
  }
  renderUpdateMessage("Installing staged update. Keep this window open...");
  if (els.applyUpdateButton) {
    els.applyUpdateButton.disabled = true;
  }
  try {
    const result = await api("/api/admin/update/apply", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.stagedUpdate = null;
    renderUpdateInstallResult(result);
    showFeedback(`Update files copied. Restart required. Backup: ${result.backup}`, "ok");
  } catch (error) {
    if (els.applyUpdateButton) {
      els.applyUpdateButton.disabled = false;
    }
    renderUpdateMessage(error.message);
    showFeedback(error.message, "warn");
  }
}

async function restartServer() {
  const payload = adminUpdateAccessOrPrompt("Admin password required to restart CounterFlow.");
  if (!payload) {
    return;
  }
  if (!window.confirm("Restart CounterFlow now? Every open counter will reconnect momentarily. Make sure employees finish active copies first.")) {
    return;
  }

  els.restartServerButton.disabled = true;
  renderUpdateMessage("Restarting CounterFlow. Reconnecting all counters...");
  try {
    const result = await api("/api/admin/restart", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    showFeedback("Server restart requested. Reconnecting...", "ok");
    await waitForServerRestart(result.instanceId, result.restartDelayMs || 750);
  } catch (error) {
    els.restartServerButton.disabled = false;
    renderUpdateMessage(error.message);
    showFeedback(error.message, "warn");
  }
}

async function waitForServerRestart(previousInstanceId, restartDelayMs) {
  const deadline = Date.now() + 20000;
  await new Promise((resolve) => window.setTimeout(resolve, Math.max(500, restartDelayMs)));
  while (Date.now() < deadline) {
    try {
      const response = await fetch(apiUrl("/api/version"), { cache: "no-store" });
      if (response.ok) {
        const result = await response.json();
        if (result.instanceId && result.instanceId !== previousInstanceId) {
          window.location.reload();
          return;
        }
      }
    } catch {
      // The server is expected to be briefly unavailable while it restarts.
    }
    await new Promise((resolve) => window.setTimeout(resolve, 500));
  }
  els.restartServerButton.disabled = false;
  renderUpdateMessage("CounterFlow did not report back after the restart request. Refresh this page or restart it from the launcher.");
  showFeedback("Server restart could not be confirmed.", "warn");
}

function renderUpdateMessage(message) {
  els.adminReportOutput.replaceChildren();
  const heading = document.createElement("h4");
  heading.textContent = "CounterFlow Updates";
  const text = document.createElement("p");
  text.textContent = message;
  els.adminReportOutput.append(heading, text);
}

function renderUpdateStatus(result) {
  els.adminReportOutput.replaceChildren();
  const heading = document.createElement("h4");
  heading.textContent = "CounterFlow Updates";
  els.adminReportOutput.appendChild(heading);

  const table = document.createElement("table");
  table.className = "admin-report-table";
  const tbody = document.createElement("tbody");
  const rows = [
    ["Current Version", result.currentVersion || "unknown"],
    ["GitHub Version", result.incomingVersion || "unknown"],
    ["Repository", `${result.repository || ""} (${result.branch || "main"})`],
    ["Status", result.staged ? "Update staged" : result.updateAvailable ? "Update available" : "No newer update"],
    ["Package", formatFileSize(result.packageSize || 0)],
    ["Expanded Files", `${result.fileCount || 0} files, ${formatFileSize(result.expandedSize || 0)}`],
  ];
  rows.forEach(([label, value]) => {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    const td = document.createElement("td");
    th.textContent = label;
    td.textContent = value;
    tr.append(th, td);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  els.adminReportOutput.appendChild(table);

  if (Array.isArray(result.previewItems) && result.previewItems.length) {
    const preview = document.createElement("p");
    preview.textContent = `Files ready to copy: ${result.previewItems.slice(0, 12).join(", ")}${result.previewItems.length > 12 ? ", ..." : ""}`;
    els.adminReportOutput.appendChild(preview);
  }
  const restart = document.createElement("p");
  restart.textContent = result.staged
    ? "Install Update can copy the staged files while the server is running. Restart CounterFlow afterward so every counter sees the new version."
    : "The running app will stay unchanged.";
  els.adminReportOutput.appendChild(restart);
}

function renderUpdateInstallResult(result) {
  els.adminReportOutput.replaceChildren();
  const heading = document.createElement("h4");
  heading.textContent = "CounterFlow Update Installed";
  const message = document.createElement("p");
  message.textContent = `Installed files for version ${result.installedVersion || "unknown"}. Restart CounterFlow to use the new version. App backup: ${result.backup}.`;
  els.adminReportOutput.append(heading, message);
}

async function loadReport(type) {
  const endpoints = {
    missing: ["Missing Part Numbers", "/api/reports/missing"],
    duplicates: ["Duplicate Part Numbers", "/api/reports/duplicates"],
    recent: ["Recently Changed Parts", "/api/reports/recent?limit=50"],
    review: ["Review Queue", "/api/reports/review"],
    copyActivity: ["Copy Activity", "/api/reports/copy-activity?limit=100"],
    migrations: ["Migration History", "/api/admin/migrations"],
    errorLog: ["Error Log", "/api/admin/logs?limit=50"],
    backupHealth: ["Backup Health", "/api/admin/backup-health"],
  };
  const [title, endpoint] = endpoints[type];
  try {
    const rows = await api(endpoint);
    renderAdminReport(title, type, rows);
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

function renderAdminReport(title, type, rows) {
  els.adminReportOutput.replaceChildren();
  const heading = document.createElement("h4");
  heading.textContent = `${title} (${rows.length})`;
  els.adminReportOutput.appendChild(heading);

  if (!rows.length) {
    const empty = document.createElement("p");
    empty.textContent = "No results.";
    els.adminReportOutput.appendChild(empty);
    return;
  }

  const table = document.createElement("table");
  table.className = "admin-report-table";
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  let headers = ["Brand", "Model", "Category", "Item", "Part Number", "Vendor"];
  if (type === "duplicates") {
    headers = ["Part Number", "Count", "Parts"];
  } else if (type === "review") {
    headers = ["Brand", "Model", "Category", "Item", "Part Number", "Review Note"];
  } else if (type === "copyActivity") {
    headers = ["Employee", "Brand", "Item", "Part Number", "Copied At"];
  } else if (type === "migrations") {
    headers = ["Department", "Migration", "Version", "Applied"];
  } else if (type === "errorLog") {
    headers = ["Time", "Level", "Message", "Path"];
  } else if (type === "backupHealth") {
    headers = ["Department", "Status", "Latest Backup", "Age", "Backups", "Size"];
  } else if (type === "maintenance") {
    headers = ["Department", "Integrity", "Before", "After", "Saved", "Safety Backup"];
  }
  const headerRow = document.createElement("tr");
  headers.forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  rows.slice(0, 50).forEach((row) => {
    const tr = document.createElement("tr");
    let values = [row.brand, row.model, row.category, row.item, row.partNumber || "Needs number", row.vendor || ""];
    if (type === "duplicates") {
      values = [row.partNumber, row.count, row.parts.map((part) => `${part.brand} ${part.item}`).join("; ")];
    } else if (type === "review") {
      values = [row.brand, row.model, row.category, row.item, row.partNumber || "Needs number", row.reviewNote || ""];
    } else if (type === "copyActivity") {
      values = [row.employeeName, row.brand, row.item, row.partNumber, formatLocalDateTime(row.copiedAt)];
    } else if (type === "migrations") {
      values = [row.department, row.name, row.appVersion, formatLocalDateTime(row.appliedAt)];
    } else if (type === "errorLog") {
      values = [formatLocalDateTime(row.time), row.level, row.message, row.path || ""];
    } else if (type === "backupHealth") {
      const age = row.ageHours === null || row.ageHours === undefined ? "Never" : `${row.ageHours} hours`;
      values = [row.department, row.status, row.latestBackup || "None", age, row.backupCount, formatFileSize(row.size || 0)];
    } else if (type === "maintenance") {
      values = [row.department, row.integrity, formatFileSize(row.beforeSize || 0), formatFileSize(row.afterSize || 0), formatFileSize(row.savedBytes || 0), row.safetyBackup];
    }
    values.forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.append(thead, tbody);
  els.adminReportOutput.appendChild(table);
}

function openPrintableList() {
  window.open(apiUrl("/api/reports/print-list"), "_blank", "noopener");
}

function openQuickReference() {
  window.open(apiUrl("/api/quick-reference"), "_blank", "noopener");
}

function openNetworkSetup() {
  window.open(apiUrl("/api/network-setup"), "_blank", "noopener");
}

function openDeploymentChecklist() {
  window.open(apiUrl("/api/deployment-checklist"), "_blank", "noopener");
}

async function compactDatabase() {
  const accessPayload = protectedAccessOrPrompt(
    `Admin password required to compact and repair the ${departmentLabel()} database. Managers and admins can also sign in first.`,
  );
  if (!accessPayload) {
    return;
  }
  if (!window.confirm(`Create a safety backup and compact the ${departmentLabel()} database?`)) {
    return;
  }

  try {
    const result = await api("/api/admin/compact", {
      method: "POST",
      body: JSON.stringify(accessPayload),
    });
    await loadBackups();
    renderAdminReport("Database Maintenance", "maintenance", [result]);
    showFeedback(`Database compacted. Safety backup: ${result.safetyBackup}`, "ok");
  } catch (error) {
    showFeedback(error.message, "warn");
  }
}

async function downloadDemoDatabase() {
  await exportPartsFile("/api/demo-database", "counterflow-demo-database.zip", "Demo database downloaded.");
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatFileSize(value) {
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`;
  }
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function readForm() {
  return {
    brand: els.partBrand.value.trim(),
    family: els.partFamily.value.trim(),
    model: els.partModel.value.trim(),
    category: els.partCategory.value.trim(),
    yearStart: els.partYearStart.value.trim(),
    yearEnd: els.partYearEnd.value.trim(),
    make: els.partMake.value.trim(),
    fitmentModel: els.partFitmentModel.value.trim(),
    unitType: els.partUnitType.value.trim(),
    reviewStatus: els.partReviewStatus.value,
    reviewNote: els.partReviewNote.value.trim(),
    item: els.partItem.value.trim(),
    buttonText: els.partButtonText.value.trim(),
    partNumber: els.partNumber.value.trim(),
    oldPartNumber: els.partOldPartNumber.value.trim(),
    newPartNumber: els.partNewPartNumber.value.trim(),
    vendor: els.partVendor.value.trim(),
    alternateNumbers: els.partAlternateNumbers.value.trim(),
    aftermarketNumbers: els.partAftermarketNumbers.value.trim(),
    tags: els.partTags.value.trim(),
    fitmentNotes: els.partFitmentNotes.value.trim(),
    attachmentUrl: els.partAttachmentUrl.value.trim(),
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
    const key = toCamel(select.id.replace("-filter", ""));
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
  const requestedDepartment = ["parts", "service"].includes(department) ? department : "parts";
  if (!employeeCanAccessDepartment(requestedDepartment)) {
    showFeedback(`${departmentName(requestedDepartment)} is not available for the signed-in employee.`, "warn");
    renderDepartmentControls();
    scrollSettingsToTop();
    return;
  }
  if (state.department === requestedDepartment) {
    renderDepartmentControls();
    scrollSettingsToTop();
    return;
  }

  applyDepartment(requestedDepartment);
  state.filters = defaultFilters();
  state.editingBrandId = "";
  syncFilterControls();
  await refreshAll();
  if (els.settingsDialog.open) {
    openBrandEditor(orderedBrands()[0] || null, { focus: false });
  }
  scrollSettingsToTop();
  showFeedback(`${departmentLabel()} department loaded.`, "ok");
}

function applyDepartment(department) {
  state.department = ["parts", "service"].includes(department) ? department : "parts";
  localStorage.setItem("ppwork-department", state.department);
  loadLocalFavorites();
  loadPinnedBrands();
  loadCopyActivity();
  loadSavedSearchPresets();
  loadCopyTemplate();
  syncFilterControls();
  renderQuickPanels();
  renderDepartmentControls();
}

function employeeCanAccessDepartment(department) {
  const employee = state.currentEmployee;
  if (!employee?.id) {
    return true;
  }
  if (["manager", "admin"].includes(employee.role)) {
    return true;
  }
  const allowed = employee.allowedDepartments || ["parts", "service"];
  return allowed.includes(department);
}

function enforceCurrentDepartmentAccess() {
  if (employeeCanAccessDepartment(state.department)) {
    return;
  }
  const allowed = state.currentEmployee?.allowedDepartments || ["parts"];
  applyDepartment(allowed.includes("parts") ? "parts" : allowed[0] || "parts");
}

function renderDepartmentControls() {
  const isParts = state.department === "parts";
  if (els.departmentEyebrow) {
    const dealership = (state.appSettings || {}).dealershipName || "Independence County Offroad";
    els.departmentEyebrow.textContent = `${dealership} | ${departmentLabel()} Department`;
  }
  if (els.departmentPartsButton) {
    els.departmentPartsButton.textContent = (state.appSettings || {}).partsDepartmentLabel || "Parts";
    els.departmentPartsButton.classList.toggle("is-active", isParts);
    els.departmentPartsButton.setAttribute("aria-pressed", String(isParts));
    els.departmentPartsButton.disabled = !employeeCanAccessDepartment("parts");
  }
  if (els.departmentServiceButton) {
    els.departmentServiceButton.textContent = (state.appSettings || {}).serviceDepartmentLabel || "Service";
    els.departmentServiceButton.classList.toggle("is-active", !isParts);
    els.departmentServiceButton.setAttribute("aria-pressed", String(!isParts));
    els.departmentServiceButton.disabled = !employeeCanAccessDepartment("service");
  }
}

function departmentName(department) {
  const settings = state.appSettings || {};
  return department === "service"
    ? (settings.serviceDepartmentLabel || "Service")
    : (settings.partsDepartmentLabel || "Parts");
}

function departmentLabel() {
  return departmentName(state.department);
}

function loadPinnedBrands() {
  try {
    const raw = JSON.parse(localStorage.getItem(pinnedBrandsStorageKey()) || "[]");
    state.pinnedBrandIds = new Set(Array.isArray(raw) ? raw.map(String).filter(Boolean) : []);
  } catch (error) {
    state.pinnedBrandIds = new Set();
  }
}

function savePinnedBrands() {
  localStorage.setItem(pinnedBrandsStorageKey(), JSON.stringify([...state.pinnedBrandIds]));
}

function pinnedBrandsStorageKey() {
  return `ppwork-pinned-brands-${state.department}`;
}

function isPinnedBrand(brand) {
  return state.pinnedBrandIds.has(String(brand.id));
}

function togglePinnedBrand(brandId) {
  const id = String(brandId);
  if (state.pinnedBrandIds.has(id)) {
    state.pinnedBrandIds.delete(id);
  } else {
    state.pinnedBrandIds.add(id);
  }
  savePinnedBrands();
  renderBrands();
  renderBrandSettings();
  showFeedback(state.pinnedBrandIds.has(id) ? "Brand pinned." : "Brand unpinned.", "ok");
}

function openReleaseNotes() {
  window.open(apiUrl("/api/release-notes"), "_blank", "noopener");
}

function applyDensityMode(mode) {
  state.densityMode = ["comfortable", "compact", "service-bay"].includes(mode) ? mode : "comfortable";
  document.documentElement.dataset.density = state.densityMode;
  localStorage.setItem("ppwork-density", state.densityMode);
  if (els.densityMode) {
    els.densityMode.value = state.densityMode;
  }
}
function focusPartTile(direction) {
  const tiles = [...els.partBoard.querySelectorAll(".part-tile")];
  if (!tiles.length) {
    return false;
  }
  const activeIndex = tiles.indexOf(document.activeElement);
  let nextIndex = activeIndex;
  if (direction === "home") {
    nextIndex = 0;
  } else if (direction === "end") {
    nextIndex = tiles.length - 1;
  } else if (activeIndex < 0) {
    nextIndex = direction > 0 ? 0 : tiles.length - 1;
  } else {
    nextIndex = Math.max(0, Math.min(tiles.length - 1, activeIndex + direction));
  }
  tiles[nextIndex].focus();
  return true;
}

function focusBrandButton(direction) {
  const buttons = [...els.brandList.querySelectorAll(".brand-button")];
  if (!buttons.length) {
    return false;
  }
  const activeIndex = buttons.indexOf(document.activeElement);
  let nextIndex = activeIndex;
  if (direction === "home") {
    nextIndex = 0;
  } else if (direction === "end") {
    nextIndex = buttons.length - 1;
  } else if (activeIndex < 0) {
    nextIndex = direction > 0 ? 0 : buttons.length - 1;
  } else {
    nextIndex = Math.max(0, Math.min(buttons.length - 1, activeIndex + direction));
  }
  buttons[nextIndex].focus();
  return true;
}

function activateFocusedBrand() {
  if (document.activeElement?.classList?.contains("brand-button")) {
    document.activeElement.click();
    return true;
  }
  return false;
}

function handleKeyboardShortcuts(event) {
  const active = document.activeElement;
  const isTyping = active && ["INPUT", "SELECT", "TEXTAREA"].includes(active.tagName);
  const dialogOpen = els.partDialog.open || els.settingsDialog.open;

  if (event.key === "/" && !isTyping && !dialogOpen) {
    event.preventDefault();
    els.searchInput.focus();
    els.searchInput.select();
    return;
  }

  if (!isTyping && !dialogOpen && event.altKey && event.key.toLowerCase() === "b") {
    event.preventDefault();
    focusBrandButton(1);
    return;
  }

  if (!isTyping && !dialogOpen && ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) {
    const inBrandRail = document.activeElement?.closest?.("#brand-list");
    if (inBrandRail) {
      event.preventDefault();
      const direction = event.key === "Home" ? "home" : event.key === "End" ? "end" : ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1;
      focusBrandButton(direction);
      return;
    }
    event.preventDefault();
    const direction = event.key === "Home" ? "home" : event.key === "End" ? "end" : ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1;
    focusPartTile(direction);
    return;
  }

  if (!isTyping && !dialogOpen && event.key === "Enter" && activateFocusedBrand()) {
    event.preventDefault();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "e" && !isTyping && !dialogOpen) {
    event.preventDefault();
    els.editToggle.checked = !els.editToggle.checked;
    state.editMode = els.editToggle.checked;
    renderParts();
    showFeedback(state.editMode ? "Edit mode on." : "Edit mode off.", "ok");
    return;
  }

  if (event.altKey && event.key.toLowerCase() === "a" && state.editMode && !dialogOpen) {
    event.preventDefault();
    openEditor();
    return;
  }

  if (event.key === "Escape" && !dialogOpen && !isTyping) {
    state.filters = defaultFilters();
    syncFilterControls();
    void loadOptions().then(loadParts);
    renderBrands();
  }
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
