let currentView = 'requirements';

const STORAGE_KEY = "reqtracker.requirements.v1";
const FEATURES_KEY = "reqtracker.features.v1";
const EPICS_KEY = "reqtracker.epics.v1";
const OWNERS_KEY = "reqtracker.owners.v1";
const US_KEY = "reqtracker.userstories.v1";
const TC_KEY = "reqtracker.testcases.v1";

const state = {
  requirements: loadRequirements(),
  features: loadFeatures(),
  search: "",
  status: "",
  priority: "",
  filterFeature: "",
  sortField: null,
  sortDir: "asc",
  selectedIds: new Set(),
  epics: loadEpics(),
  selectedFeatureIds: new Set(),
  owners: loadOwners(),
  userStories: loadUserStories(),
  testCases: loadTestCases(),
};

const elements = {
  excelInput: document.querySelector("#excelInput"),
  generateDemoButton: document.querySelector("#generateDemoButton"),
  clearButton: document.querySelector("#clearButton"),
  searchInput: document.querySelector("#searchInput"),
  statusFilter: document.querySelector("#statusFilter"),
  requirementsBody: document.querySelector("#requirementsBody"),
  emptyState: document.querySelector("#emptyState"),
  importStatus: document.querySelector("#importStatus"),
  totalCount: document.querySelector("#totalCount"),
  approvedCount: document.querySelector("#approvedCount"),
  draftCount: document.querySelector("#draftCount"),
  highCount: document.querySelector("#highCount"),
  priorityFilter: document.querySelector("#priorityFilter"),
  featureFilter: document.querySelector("#featureFilter"),
  selectionBar: document.querySelector("#selectionBar"),
  selectionCount: document.querySelector("#selectionCount"),
  assignFeatureBtn: document.querySelector("#assignFeatureBtn"),
  removeFeatureBtn: document.querySelector("#removeFeatureBtn"),
  clearSelectionBtn: document.querySelector("#clearSelectionBtn"),
  selectAll: document.querySelector("#selectAll"),
  requirementModal: document.querySelector("#requirementModal"),
  requirementModalClose: document.querySelector("#requirementModalClose"),
  requirementModalCancel: document.querySelector("#requirementModalCancel"),
  requirementModalSave: document.querySelector("#requirementModalSave"),
  requirementModalTitle: document.querySelector("#requirementModalTitle"),
  reqCode: document.querySelector("#reqCode"),
  reqStatus: document.querySelector("#reqStatus"),
  reqPriority: document.querySelector("#reqPriority"),
  reqOwner: document.querySelector("#reqOwner"),
  openOwnersBtn: document.querySelector("#openOwnersBtn"),
  reqSource: document.querySelector("#reqSource"),
  reqFeature: document.querySelector("#reqFeature"),
  reqText: document.querySelector("#reqText"),
  featureWarning: document.querySelector("#featureWarning"),
  featureSelectionBar: document.querySelector("#featureSelectionBar"),
  featureSelectionCount: document.querySelector("#featureSelectionCount"),
  assignEpicBtn: document.querySelector("#assignEpicBtn"),
  removeFromEpicBtn: document.querySelector("#removeFromEpicBtn"),
  clearFeatureSelectionBtn: document.querySelector("#clearFeatureSelectionBtn"),
  featureModal: document.querySelector("#featureModal"),
  featureModalClose: document.querySelector("#featureModalClose"),
  featureModalCancel: document.querySelector("#featureModalCancel"),
  featureModalSave: document.querySelector("#featureModalSave"),
  featureNumber: document.querySelector("#featureNumber"),
  featureName: document.querySelector("#featureName"),
  featureDescription: document.querySelector("#featureDescription"),
  featureAutoNumber: document.querySelector("#featureAutoNumber"),
  epicAutoNumber: document.querySelector("#epicAutoNumber"),
  reqAutoCode: document.querySelector("#reqAutoCode"),
  autoNumberModal: document.querySelector("#autoNumberModal"),
  autoNumberClose: document.querySelector("#autoNumberClose"),
  autoNumberCancel: document.querySelector("#autoNumberCancel"),
  autoNumberGap: document.querySelector("#autoNumberGap"),
  autoNumberNext: document.querySelector("#autoNumberNext"),
  autoNumberText: document.querySelector("#autoNumberText"),
};

const columnAliases = {
  code: ["code", "id", "req id", "requirement id", "код", "номер", "ид", "идентификатор"],
  text: ["text", "description", "requirement", "summary", "текст", "описание", "требование", "формулировка"],
  status: ["status", "state", "статус", "состояние"],
  priority: ["priority", "prio", "важность", "приоритет"],
  owner: ["owner", "assignee", "author", "владелец", "ответственный", "автор"],
  source: ["source", "document", "origin", "источник", "документ"],
  feature: ["feature", "фича", "функциональность", "группа", "модуль"],
};

document.querySelector("#filtersToggle").addEventListener("click", () => {
  const body = document.querySelector("#filtersBody");
  const btn = document.querySelector("#filtersToggle");
  const isOpen = !body.classList.contains("hidden");
  body.classList.toggle("hidden", isOpen);
  btn.setAttribute("aria-expanded", String(!isOpen));
  btn.querySelector(".toolbar-toggle-icon").textContent = isOpen ? "▼" : "▲";
});

elements.excelInput.addEventListener("change", handleFileUpload);
elements.generateDemoButton.addEventListener("click", generateDemoData);
elements.clearButton.addEventListener("click", clearRequirements);
elements.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value.trim().toLowerCase();
  render();
});
elements.statusFilter.addEventListener("change", (event) => {
  state.status = event.target.value;
  render();
});
elements.priorityFilter.addEventListener("change", (event) => {
  state.priority = event.target.value;
  render();
});
elements.featureFilter.addEventListener("change", (event) => {
  state.filterFeature = event.target.value;
  render();
});

document.querySelector("thead").addEventListener("click", (event) => {
  const th = event.target.closest("th[data-sort]");
  if (!th) return;
  const field = th.dataset.sort;
  if (state.sortField === field) {
    state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
  } else {
    state.sortField = field;
    state.sortDir = "asc";
  }
  render();
});

elements.selectAll.addEventListener("change", (event) => {
  const filtered = getFilteredRequirements();
  if (event.target.checked) {
    filtered.forEach((item) => state.selectedIds.add(item.id));
  } else {
    filtered.forEach((item) => state.selectedIds.delete(item.id));
  }
  render();
});

elements.assignEpicBtn.addEventListener("click", openEpicModal);
elements.removeFromEpicBtn.addEventListener("click", removeFromEpic);
elements.clearFeatureSelectionBtn.addEventListener("click", () => {
  state.selectedFeatureIds = new Set();
  render();
});
document.querySelector("#epicModalClose").addEventListener("click", closeEpicModal);
document.querySelector("#epicModalCancel").addEventListener("click", closeEpicModal);
document.querySelector("#epicModalSave").addEventListener("click", saveEpic);
document.querySelector("#epicModal").addEventListener("click", (e) => {
  if (e.target === document.querySelector("#epicModal") && !window.getSelection().toString()) closeEpicModal();
});
document.querySelector("#epicName").addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveEpic();
});

elements.requirementsBody.addEventListener("click", (event) => {
  const epicEditBtn = event.target.closest(".epic-edit-btn");
  if (epicEditBtn) {
    const epicObj = state.epics.find((e) => e.id === epicEditBtn.dataset.epicId);
    if (epicObj) openEpicEditModal(epicObj);
    return;
  }

  const featureEditBtn = event.target.closest(".feature-edit-btn");
  if (featureEditBtn) {
    const featureObj = state.features.find((f) => f.id === featureEditBtn.dataset.featureId);
    if (featureObj) openFeatureEditModal(featureObj);
    return;
  }

  const usBtn = event.target.closest(".us-count-btn");
  if (usBtn) {
    openUSListModal(usBtn.dataset.reqId);
    return;
  }

  const editBtn = event.target.closest(".row-edit-btn");
  if (editBtn) {
    const req = state.requirements.find((r) => r.id === editBtn.dataset.id);
    if (req) openRequirementModal(req);
    return;
  }

  const deleteBtn = event.target.closest(".row-delete-btn");
  if (deleteBtn) {
    deleteRequirement(deleteBtn.dataset.id);
  }
});

elements.requirementsBody.addEventListener("change", (event) => {
  const checkbox = event.target;
  if (checkbox.type !== "checkbox") return;

  if (checkbox.classList.contains("feature-checkbox")) {
    const featureId = checkbox.dataset.featureId;
    if (checkbox.checked) state.selectedFeatureIds.add(featureId);
    else state.selectedFeatureIds.delete(featureId);
    checkbox.closest("tr").classList.toggle("feature-selected", checkbox.checked);
    renderFeatureSelectionBar();
    return;
  }

  if (!checkbox.dataset.id) return;
  if (checkbox.checked) state.selectedIds.add(checkbox.dataset.id);
  else state.selectedIds.delete(checkbox.dataset.id);
  checkbox.closest("tr").classList.toggle("selected", checkbox.checked);
  renderSelectionBar();
  updateSelectAllState();
});

document.querySelector("#addRequirementBtn").addEventListener("click", () => openRequirementModal(null));
elements.requirementModalClose.addEventListener("click", closeRequirementModal);
elements.requirementModalCancel.addEventListener("click", closeRequirementModal);
elements.requirementModalSave.addEventListener("click", saveRequirement);
elements.requirementModal.addEventListener("click", (e) => {
  if (e.target === elements.requirementModal && !window.getSelection().toString()) closeRequirementModal();
});

elements.assignFeatureBtn.addEventListener("click", openFeatureModal);
elements.removeFeatureBtn.addEventListener("click", removeFromFeature);
elements.featureModalClose.addEventListener("click", closeFeatureModal);
elements.featureModalCancel.addEventListener("click", closeFeatureModal);
elements.featureModalSave.addEventListener("click", saveFeature);
elements.featureModal.addEventListener("click", (e) => {
  if (e.target === elements.featureModal && !window.getSelection().toString()) closeFeatureModal();
});
elements.featureName.addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveFeature();
});
elements.featureAutoNumber.addEventListener("click", autoAssignFeatureNumber);
elements.epicAutoNumber.addEventListener("click", autoAssignEpicNumber);
elements.reqAutoCode.addEventListener("click", autoAssignReqCode);
elements.autoNumberClose.addEventListener("click", closeAutoNumberModal);
elements.autoNumberCancel.addEventListener("click", closeAutoNumberModal);
elements.autoNumberGap.addEventListener("click", () => {
  if (pendingNumberTarget) pendingNumberTarget.value = padNum(pendingGapNumber);
  closeAutoNumberModal();
});
elements.autoNumberNext.addEventListener("click", () => {
  if (pendingNumberTarget) pendingNumberTarget.value = padNum(pendingNextNumber);
  closeAutoNumberModal();
});

// Подключает поддержку Ctrl+A/C/V и удержание фокуса для модального окна.
// Вызывать для каждой новой модалки при создании.
function enableModalKeyboard(overlayEl) {
  overlayEl.querySelector(".modal").addEventListener("mousedown", (e) => {
    if (!e.target.closest("input, textarea, select, button, a, [tabindex], label")) {
      e.preventDefault();
    }
  });

  overlayEl.addEventListener("keydown", (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const active = document.activeElement;
    const isEditable =
      active &&
      (active.tagName === "INPUT" || active.tagName === "TEXTAREA") &&
      overlayEl.contains(active);
    const target = isEditable
      ? active
      : overlayEl.querySelector('input[type="text"]') ||
        overlayEl.querySelector("textarea");
    if (!target) return;

    if (e.key === "a" || e.key === "A") {
      e.preventDefault();
      target.focus();
      target.select();
    } else if ((e.key === "c" || e.key === "C") && isEditable) {
      const sel = active.value.substring(active.selectionStart, active.selectionEnd);
      if (sel) {
        e.preventDefault();
        navigator.clipboard.writeText(sel).catch(() => document.execCommand("copy"));
      }
    } else if (e.key === "v" || e.key === "V") {
      if (!isEditable) {
        e.preventDefault();
        target.focus();
        navigator.clipboard.readText().then((text) => {
          const s = target.selectionStart, end = target.selectionEnd;
          target.value = target.value.substring(0, s) + text + target.value.substring(end);
          target.selectionStart = target.selectionEnd = s + text.length;
        }).catch(() => {});
      }
    }
  });
}

enableModalKeyboard(elements.requirementModal);
enableModalKeyboard(elements.featureModal);
enableModalKeyboard(document.querySelector("#epicModal"));
enableModalKeyboard(document.querySelector("#ownersModal"));
enableModalKeyboard(document.querySelector("#usListModal"));
enableModalKeyboard(document.querySelector("#usEditModal"));

function padNumberField(el) {
  const v = el.value.trim();
  if (v && /^\d+$/.test(v)) el.value = padNum(parseInt(v, 10));
}

elements.openOwnersBtn.addEventListener("click", openOwnersModal);
document.querySelector("#openOwnersDirectoryBtn").addEventListener("click", openOwnersModal);
document.querySelector("#ownersModalClose").addEventListener("click", closeOwnersModal);
document.querySelector("#ownersModal").addEventListener("click", (e) => {
  if (e.target === document.querySelector("#ownersModal") && !window.getSelection().toString()) closeOwnersModal();
});
document.querySelector("#ownerAddBtn").addEventListener("click", addOwner);
document.querySelector("#ownerAddInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addOwner();
});
document.querySelector("#ownersList").addEventListener("click", (e) => {
  const btn = e.target.closest(".owner-delete-btn");
  if (btn) deleteOwner(btn.dataset.owner);
});

document.querySelector("#usListModalClose").addEventListener("click", closeUSListModal);
document.querySelector("#usListModalCancel").addEventListener("click", closeUSListModal);
document.querySelector("#usListModal").addEventListener("click", (e) => {
  if (e.target === document.querySelector("#usListModal") && !window.getSelection().toString()) closeUSListModal();
});
document.querySelector("#usListAddBtn").addEventListener("click", () => openUSEditModal(null));
document.querySelector("#addRuleBtn").addEventListener("click", () => addRuleField("", true));
document.querySelector("#addCriterionBtn").addEventListener("click", () => addCriterionField("", true));
document.querySelector("#addScenarioStepBtn").addEventListener("click", () => addScenarioStep("", true));
document.querySelector("#addAltScenarioStepBtn").addEventListener("click", () => addAltScenarioStep("", true));
document.querySelector("#addAltScenarioBtn").addEventListener("click", () => {
  document.querySelector("#usAltScenarioSection").classList.remove("hidden");
  document.querySelector("#addAltScenarioBtn").classList.add("hidden");
  addAltScenarioStep("", true);
});
document.querySelector("#removeAltScenarioBtn").addEventListener("click", () => {
  document.querySelector("#usAltScenarioList").innerHTML = "";
  document.querySelector("#usAltScenarioSection").classList.add("hidden");
  document.querySelector("#addAltScenarioBtn").classList.remove("hidden");
});
document.querySelector("#usListItems").addEventListener("click", (e) => {
  const editBtn = e.target.closest(".us-edit-btn");
  if (editBtn) {
    const us = state.userStories.find(s => s.id === editBtn.dataset.usId);
    if (us) openUSEditModal(us);
    return;
  }
  const deleteBtn = e.target.closest(".us-delete-btn");
  if (deleteBtn) deleteUserStory(deleteBtn.dataset.usId);
});
document.querySelector("#usEditModalClose").addEventListener("click", closeUSEditModal);
document.querySelector("#usEditModalCancel").addEventListener("click", closeUSEditModal);
document.querySelector("#usEditModal").addEventListener("click", (e) => {
  if (e.target === document.querySelector("#usEditModal") && !window.getSelection().toString()) closeUSEditModal();
});
document.querySelector("#usEditModalSave").addEventListener("click", saveUserStory);
document.querySelector("#usAutoNumber").addEventListener("click", autoAssignUSNumber);
document.querySelector("#tcFromMainBtn").addEventListener("click", () => openTCFromEditModal('main'));
document.querySelector("#tcFromAltBtn").addEventListener("click", () => openTCFromEditModal('alt'));
document.querySelector("#usNumber").addEventListener("blur", () => padNumberField(document.querySelector("#usNumber")));
document.querySelector("#usTitle").addEventListener("keydown", (e) => { if (e.key === "Enter") saveUserStory(); });
document.querySelector("#openUSFromReqBtn").addEventListener("click", () => openUSListModal(editingRequirementId));
["usRole", "usAction", "usGoal"].forEach(id => {
  document.querySelector(`#${id}`).addEventListener("input", updateUSCombined);
});

elements.featureNumber.addEventListener("blur", () => padNumberField(elements.featureNumber));
elements.reqCode.addEventListener("blur", () => padNumberField(elements.reqCode));
document.querySelector("#epicNumber").addEventListener("blur", () => padNumberField(document.querySelector("#epicNumber")));

elements.clearSelectionBtn.addEventListener("click", () => {
  state.selectedIds = new Set();
  render();
});

mergeOwners(state.requirements.map(r => r.owner));
render();

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!window.XLSX) {
    setStatus("Не удалось загрузить библиотеку чтения Excel. Проверьте подключение к интернету и обновите страницу.");
    event.target.value = "";
    return;
  }

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
    const parsed = normalizeRows(rows);

    state.requirements = parsed;
    state.selectedIds = new Set();
    saveRequirements(parsed);
    mergeOwners(parsed.map(r => r.owner));
    setStatus(`Загружено ${parsed.length} требований из файла "${file.name}".`);
    render();
  } catch (error) {
    console.error(error);
    setStatus("Файл не удалось прочитать. Проверьте, что это корректный Excel или CSV.");
  } finally {
    event.target.value = "";
  }
}

function normalizeRows(rows) {
  return rows
    .filter((row) => Object.values(row).some((value) => String(value).trim()))
    .map((row, index) => {
      const normalized = normalizeRow(row);
      const fallbackCode = `REQ-${String(index + 1).padStart(3, "0")}`;
      return {
        id: crypto.randomUUID(),
        code: normalized.code || fallbackCode,
        text: normalized.text || "Текст требования не указан",
        status: normalizeStatus(normalized.status || "Draft"),
        priority: normalizePriority(normalized.priority || "Medium"),
        owner: normalized.owner || "Не назначен",
        source: normalized.source || "Импорт",
        feature: normalized.feature || "",
      };
    })
    .filter((item) => item.text || item.code);
}

function normalizeRow(row) {
  const result = {};
  const entries = Object.entries(row);

  for (const [target, aliases] of Object.entries(columnAliases)) {
    const match = entries.find(([name]) => {
      const header = String(name).trim().toLowerCase();
      return aliases.some((alias) => header === alias || header.includes(alias));
    });
    result[target] = match ? String(match[1]).trim() : "";
  }

  return result;
}

function normalizeStatus(value) {
  const clean = String(value).trim();
  const lower = clean.toLowerCase();

  if (["approved", "утверждено", "согласовано"].includes(lower)) return "Approved";
  if (["in review", "review", "на проверке", "на ревью"].includes(lower)) return "In Review";
  if (["changed", "изменено"].includes(lower)) return "Changed";
  if (["deprecated", "устарело", "отменено"].includes(lower)) return "Deprecated";
  return clean || "Draft";
}

function normalizePriority(value) {
  const clean = String(value).trim();
  const lower = clean.toLowerCase();

  if (["high", "высокий", "высокая", "critical", "критичный"].includes(lower)) return "High";
  if (["low", "низкий", "низкая"].includes(lower)) return "Low";
  return clean || "Medium";
}

function generateDemoData() {
  const demo = [
    {
      code: "REQ-001",
      text: "Система должна поддерживать импорт требований из Excel-файлов формата XLSX.",
      status: "Approved",
      priority: "High",
      owner: "Бизнес-аналитик",
      source: "ТЗ v1.0",
      feature: "",
    },
    {
      code: "REQ-002",
      text: "Пользователь должен видеть реестр требований с поиском по коду и тексту.",
      status: "Approved",
      priority: "High",
      owner: "Системный аналитик",
      source: "ТЗ v1.0",
      feature: "",
    },
    {
      code: "REQ-003",
      text: "Каждое требование должно иметь статус, приоритет, владельца и источник.",
      status: "In Review",
      priority: "Medium",
      owner: "Project Owner",
      source: "Workshop",
      feature: "",
    },
    {
      code: "REQ-004",
      text: "Система должна позволять формировать тестовые данные для демонстрации MVP.",
      status: "Draft",
      priority: "Medium",
      owner: "QA Engineer",
      source: "MVP Scope",
      feature: "",
    },
    {
      code: "REQ-005",
      text: "После изменения требования связанные артефакты должны помечаться как потенциально устаревшие.",
      status: "Changed",
      priority: "High",
      owner: "System Analyst",
      source: "Architecture",
      feature: "",
    },
    {
      code: "REQ-006",
      text: "Импорт должен сохранять исходный источник требования для последующего аудита.",
      status: "Draft",
      priority: "Low",
      owner: "Business Analyst",
      source: "Audit Policy",
      feature: "",
    },
  ].map((item) => ({ id: crypto.randomUUID(), ...item }));

  // Фичи
  const f1id = crypto.randomUUID(), f2id = crypto.randomUUID();
  const demoFeatures = [
    { id: f1id, number: "F-001", name: "Импорт и реестр", description: "Загрузка и отображение требований", label: "F-001 Импорт и реестр", epic: "E-001 MVP" },
    { id: f2id, number: "F-002", name: "Управление статусами", description: "Отслеживание изменений и артефактов", label: "F-002 Управление статусами", epic: "E-001 MVP" },
  ];
  // Привязываем требования к фичам
  demo[0].feature = demoFeatures[0].label;
  demo[1].feature = demoFeatures[0].label;
  demo[2].feature = demoFeatures[0].label;
  demo[3].feature = demoFeatures[0].label;
  demo[4].feature = demoFeatures[1].label;
  demo[5].feature = demoFeatures[1].label;

  // Эпик
  const demoEpics = [
    { id: crypto.randomUUID(), number: "E-001", name: "MVP", description: "Минимальный жизнеспособный продукт", label: "E-001 MVP" },
  ];

  // User Stories
  const demoUS = [
    { id: crypto.randomUUID(), requirementId: demo[0].id, number: "US-001", title: "Загрузить Excel с требованиями", role: "аналитик", action: "загружаю Excel-файл", goal: "быстро наполнить реестр требованиями", text: "Как аналитик, я хочу загружать Excel-файл, чтобы быстро наполнить реестр требованиями", rules: ["Поддерживаемые форматы: .xlsx, .xls", "Максимальный размер файла: 10 МБ"], criteria: ["Файл загружен без ошибок", "Требования появились в реестре"], scenario: ["Открыть страницу реестра", "Нажать «Загрузить Excel»", "Выбрать файл", "Подтвердить импорт"], altScenario: ["Файл содержит ошибки формата", "Система показывает сообщение об ошибке"], status: "Draft", priority: "High", owner: "Бизнес-аналитик" },
    { id: crypto.randomUUID(), requirementId: demo[1].id, number: "US-002", title: "Искать требования по тексту", role: "аналитик", action: "ввожу текст в поиск", goal: "быстро находить нужное требование", text: "Как аналитик, я хочу вводить текст в поиск, чтобы быстро находить нужное требование", rules: ["Поиск нечувствителен к регистру"], criteria: ["Список фильтруется мгновенно"], scenario: ["Ввести текст в поле поиска", "Список требований обновился"], altScenario: [], status: "Approved", priority: "Medium", owner: "Системный аналитик" },
  ];

  state.requirements = demo;
  state.features = demoFeatures;
  state.epics = demoEpics;
  state.userStories = demoUS;
  state.selectedIds = new Set();
  saveRequirements(demo);
  saveFeatures(demoFeatures);
  saveEpics(demoEpics);
  saveUserStories(demoUS);
  mergeOwners(demo.map(r => r.owner));
  setStatus("Сгенерирован демонстрационный набор: 6 требований, 2 Features, 1 Epic, 2 US.");
  render();
}

function clearRequirements() {
  state.requirements = [];
  state.search = "";
  state.status = "";
  state.selectedIds = new Set();
  state.selectedFeatureIds = new Set();
  state.priority = "";
  state.filterFeature = "";
  state.sortField = null;
  state.sortDir = "asc";
  elements.searchInput.value = "";
  elements.statusFilter.value = "";
  elements.priorityFilter.value = "";
  elements.featureFilter.value = "";
  saveRequirements([]);
  setStatus("Реестр очищен.");
  render();
}

let editingRequirementId = null;
let editingFeatureId = null;
let editingUSId = null;
let currentUSRequirementId = null;
let pendingGapNumber = null;
let pendingNextNumber = null;
let pendingNumberTarget = null;

function openRequirementModal(req) {
  const isNew = req === null;
  editingRequirementId = isNew ? null : req.id;
  elements.requirementModalTitle.textContent = isNew ? "Новое требование" : `Требование ${req.code}`;
  elements.reqCode.value = isNew ? "" : (req.code || '').replace(/^REQ-/i, '');
  elements.reqText.value = isNew ? "" : req.text;
  elements.reqStatus.value = isNew ? "Draft" : req.status;
  elements.reqPriority.value = isNew ? "Medium" : req.priority;
  populateOwnerSelect(isNew ? "" : (req.owner || ""));
  elements.reqSource.value = isNew ? "" : req.source;

  elements.reqFeature.innerHTML = '<option value="">— без Feature —</option>';
  for (const f of state.features) {
    const opt = document.createElement("option");
    opt.value = f.label;
    opt.textContent = f.label;
    elements.reqFeature.append(opt);
  }
  elements.reqFeature.value = isNew ? "" : (req.feature || "");

  const usSection = document.querySelector(".us-req-section");
  if (usSection) usSection.classList.toggle("hidden", isNew);

  elements.reqText.classList.remove("input-error");
  elements.requirementModal.classList.remove("hidden");
  elements.reqText.focus();
  if (!isNew) updateReqUSCount();
}

function closeRequirementModal() {
  elements.requirementModal.classList.add("hidden");
  editingRequirementId = null;
}

function saveRequirement() {
  const text = elements.reqText.value.trim();
  if (!text) {
    elements.reqText.classList.add("input-error");
    elements.reqText.focus();
    return;
  }

  if (editingRequirementId === null) {
    const rawCode = elements.reqCode.value.trim();
    state.requirements.push({
      id: crypto.randomUUID(),
      code: rawCode ? `REQ-${rawCode}` : "",
      text,
      status: elements.reqStatus.value,
      priority: elements.reqPriority.value,
      owner: elements.reqOwner.value.trim(),
      source: elements.reqSource.value.trim(),
      feature: elements.reqFeature.value,
    });
  } else {
    state.requirements = state.requirements.map((item) => {
      if (item.id !== editingRequirementId) return item;
      return {
        ...item,
        code: elements.reqCode.value.trim() ? `REQ-${elements.reqCode.value.trim()}` : item.code,
        text,
        status: elements.reqStatus.value,
        priority: elements.reqPriority.value,
        owner: elements.reqOwner.value.trim(),
        source: elements.reqSource.value.trim(),
        feature: elements.reqFeature.value,
      };
    });
  }

  saveRequirements(state.requirements);
  closeRequirementModal();
  render();
}

function openFeatureModal() {
  if (state.selectedIds.size === 0) return;

  const selected = state.requirements.filter((r) => state.selectedIds.has(r.id));
  const alreadyBound = selected.filter((r) => r.feature);
  const freeCount = selected.length - alreadyBound.length;

  const warning = elements.featureWarning;
  if (alreadyBound.length > 0) {
    warning.textContent =
      `⚠ ${alreadyBound.length} из ${selected.length} требований уже привязаны к Feature и будут пропущены. ` +
      `Будет назначено: ${freeCount}.`;
    warning.classList.remove("hidden");
  } else {
    warning.classList.add("hidden");
  }

  if (freeCount === 0) {
    setStatus("Все выбранные требования уже привязаны к Feature.");
    return;
  }

  editingFeatureId = null;
  document.querySelector("#featureModalTitle").textContent = "Создать Feature";
  elements.featureNumber.value = "";
  elements.featureName.value = "";
  elements.featureDescription.value = "";
  elements.featureName.classList.remove("input-error");
  elements.featureModal.classList.remove("hidden");
  requestAnimationFrame(() => elements.featureNumber.focus());
}

function openFeatureEditModal(featureObj) {
  editingFeatureId = featureObj.id;
  document.querySelector("#featureModalTitle").textContent = "Редактировать Feature";
  elements.featureWarning.classList.add("hidden");
  const num = featureObj.number || '';
  elements.featureNumber.value = num.startsWith('F-') ? num.slice(2) : num;
  elements.featureName.value = featureObj.name;
  elements.featureDescription.value = featureObj.description;
  elements.featureName.classList.remove("input-error");
  elements.featureModal.classList.remove("hidden");
  requestAnimationFrame(() => elements.featureNumber.focus());
}

function padNum(n) {
  return String(n).padStart(3, '0');
}

function autoAssignNumber(targetEl, rawNums, prefix) {
  const re = new RegExp(`^${prefix}`, 'i');
  const used = rawNums
    .map(s => parseInt((s || '').replace(re, ''), 10))
    .filter(n => Number.isFinite(n) && n > 0);

  const sorted = [...new Set(used)].sort((a, b) => a - b);

  if (sorted.length === 0) {
    targetEl.value = '001';
    return;
  }

  const max = sorted[sorted.length - 1];
  const next = max + 1;

  let gap = null;
  for (let i = 1; i < max; i++) {
    if (!sorted.includes(i)) { gap = i; break; }
  }

  if (gap === null) {
    targetEl.value = padNum(next);
    return;
  }

  pendingGapNumber = gap;
  pendingNextNumber = next;
  pendingNumberTarget = targetEl;
  elements.autoNumberText.textContent =
    `Обнаружен пропущенный номер: ${padNum(gap)}. Как присвоить номер?`;
  elements.autoNumberGap.textContent = `Занять свободный: ${padNum(gap)}`;
  elements.autoNumberNext.textContent = `Следующий по порядку: ${padNum(next)}`;
  elements.autoNumberModal.classList.remove('hidden');
}

function autoAssignFeatureNumber() {
  const nums = state.features.filter(f => f.id !== editingFeatureId).map(f => f.number || '');
  autoAssignNumber(elements.featureNumber, nums, 'F-');
}

function autoAssignEpicNumber() {
  const nums = state.epics.filter(e => e.id !== editingEpicId).map(e => e.number || '');
  autoAssignNumber(document.querySelector("#epicNumber"), nums, 'E-');
}

function autoAssignReqCode() {
  const nums = state.requirements.filter(r => r.id !== editingRequirementId).map(r => r.code || '');
  autoAssignNumber(elements.reqCode, nums, 'REQ-');
}

function closeAutoNumberModal() {
  elements.autoNumberModal.classList.add('hidden');
  pendingGapNumber = null;
  pendingNextNumber = null;
  pendingNumberTarget = null;
}

function closeFeatureModal() {
  elements.featureModal.classList.add("hidden");
  editingFeatureId = null;
}

function saveFeature() {
  const rawNumber = elements.featureNumber.value.trim();
  const number = rawNumber ? `F-${rawNumber}` : '';
  const name = elements.featureName.value.trim();
  const description = elements.featureDescription.value.trim();

  if (!name) {
    elements.featureName.classList.add("input-error");
    elements.featureName.focus();
    return;
  }

  const label = number ? `${number} ${name}` : name;

  if (editingFeatureId) {
    const oldLabel = state.features.find((f) => f.id === editingFeatureId)?.label;
    state.features = state.features.map((f) =>
      f.id === editingFeatureId ? { ...f, number, name, description, label } : f
    );
    state.requirements = state.requirements.map((r) =>
      r.feature === oldLabel ? { ...r, feature: label } : r
    );
    saveFeatures(state.features);
    saveRequirements(state.requirements);
  } else {
    const feature = { id: crypto.randomUUID(), number, name, description, label };
    state.features.push(feature);
    saveFeatures(state.features);
    state.requirements = state.requirements.map((item) =>
      state.selectedIds.has(item.id) && !item.feature ? { ...item, feature: label } : item
    );
    state.selectedIds = new Set();
    saveRequirements(state.requirements);
  }

  closeFeatureModal();
  render();
}

function removeFromFeature() {
  state.requirements = state.requirements.map((item) =>
    state.selectedIds.has(item.id) ? { ...item, feature: "" } : item
  );
  state.selectedIds = new Set();
  saveRequirements(state.requirements);
  render();
}

function render() {
  renderStatusOptions();
  renderMetrics();
  renderTable();
  renderSelectionBar();
  renderFeatureSelectionBar();
  updateSortIcons();
  reRenderCurrentView();
}

function renderSelectionBar() {
  const count = state.selectedIds.size;
  elements.selectionBar.classList.toggle("hidden", count === 0);
  elements.selectionCount.textContent = `Выбрано: ${count}`;
}

function updateSelectAllState() {
  const filtered = getFilteredRequirements();
  if (filtered.length === 0) {
    elements.selectAll.checked = false;
    elements.selectAll.indeterminate = false;
    return;
  }
  const selectedCount = filtered.filter((r) => state.selectedIds.has(r.id)).length;
  elements.selectAll.checked = selectedCount === filtered.length;
  elements.selectAll.indeterminate = selectedCount > 0 && selectedCount < filtered.length;
}

function renderStatusOptions() {
  const statuses = [...new Set(state.requirements.map((r) => r.status).filter(Boolean))].sort();
  elements.statusFilter.innerHTML = '<option value="">Все статусы</option>';
  for (const s of statuses) {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    elements.statusFilter.append(opt);
  }
  elements.statusFilter.value = state.status;

  const currentFeature = state.filterFeature;
  elements.featureFilter.innerHTML = '<option value="">Все Features</option>';
  for (const f of state.features) {
    const opt = document.createElement("option");
    opt.value = f.label;
    opt.textContent = f.label;
    elements.featureFilter.append(opt);
  }
  elements.featureFilter.value = currentFeature;
}

function updateSortIcons() {
  document.querySelectorAll("th[data-sort] .sort-icon").forEach((icon) => {
    const field = icon.closest("th").dataset.sort;
    if (state.sortField === field) {
      icon.textContent = state.sortDir === "asc" ? " ▲" : " ▼";
    } else {
      icon.textContent = "";
    }
  });
}

function renderMetrics() {
  elements.totalCount.textContent = state.requirements.length;
  elements.approvedCount.textContent = countBy("status", "Approved");
  elements.draftCount.textContent = countBy("status", "Draft");
  elements.highCount.textContent = countBy("priority", "High");
}

function renderTable() {
  const filtered = getFilteredRequirements();
  elements.requirementsBody.innerHTML = "";
  updateSelectAllState();

  const reqsByFeature = new Map();
  for (const req of filtered) {
    const key = req.feature || "";
    if (!reqsByFeature.has(key)) reqsByFeature.set(key, []);
    reqsByFeature.get(key).push(req);
  }

  const epicToFeatures = new Map();
  for (const f of state.features) {
    const key = f.epic || "";
    if (!epicToFeatures.has(key)) epicToFeatures.set(key, []);
    epicToFeatures.get(key).push(f);
  }
  if (!epicToFeatures.has("")) epicToFeatures.set("", []);

  const sortedEpics = [...epicToFeatures.entries()].sort(([a], [b]) => {
    if (!a && b) return 1;
    if (a && !b) return -1;
    return a.localeCompare(b, "ru");
  });

  for (const [epicLabel, features] of sortedEpics) {
    const sortedFeatures = [...features].sort((a, b) => a.label.localeCompare(b.label, "ru"));
    const epicReqCount =
      sortedFeatures.reduce((n, f) => n + (reqsByFeature.get(f.label)?.length || 0), 0) +
      (epicLabel === "" ? (reqsByFeature.get("")?.length || 0) : 0);
    if (epicReqCount === 0) continue;

    if (epicLabel) {
      const epicObj = state.epics.find((e) => e.label === epicLabel);
      elements.requirementsBody.append(buildEpicHeaderRow(epicLabel, epicObj, epicReqCount));
    }

    for (const feat of sortedFeatures) {
      const reqs = reqsByFeature.get(feat.label);
      if (!reqs?.length) continue;
      elements.requirementsBody.append(buildFeatureHeaderRow(feat.label, feat, reqs.length));
      for (const req of sortItems(reqs)) elements.requirementsBody.append(buildRequirementRow(req));
    }

    if (epicLabel === "") {
      const noFeatureReqs = reqsByFeature.get("");
      if (noFeatureReqs?.length) {
        elements.requirementsBody.append(buildFeatureHeaderRow("", null, noFeatureReqs.length));
        for (const req of sortItems(noFeatureReqs)) elements.requirementsBody.append(buildRequirementRow(req));
      }
    }
  }

  const isEmpty = filtered.length === 0;
  elements.emptyState.classList.toggle("hidden", !isEmpty);
  document.querySelector(".table-scroll").classList.toggle("hidden", isEmpty);
  if (state.requirements.length && filtered.length !== state.requirements.length) {
    setStatus(`Показано ${filtered.length} из ${state.requirements.length} требований.`);
  }
}

function buildEpicHeaderRow(epicLabel, epicObj, count) {
  const numberHtml = epicObj?.number
    ? `<span class="epic-tag-number">${escapeHtml(epicObj.number)}</span>`
    : "";
  const nameText = epicObj ? escapeHtml(epicObj.name) : escapeHtml(epicLabel);
  const editBtn = epicObj
    ? `<button class="epic-edit-btn" data-epic-id="${escapeHtml(epicObj.id)}" title="Редактировать Epic" type="button"><span class="edit-icon">✏</span></button>`
    : "";
  const row = document.createElement("tr");
  row.className = "epic-group-row";
  row.innerHTML = `
    <td class="checkbox-cell"></td>
    <td colspan="9"><div class="epic-group-cell">
      <span class="epic-tag">${numberHtml}<span class="epic-tag-name">${nameText}</span></span>
      <span class="epic-count">${count} тр.</span>${editBtn}
    </div></td>
  `;
  return row;
}

function buildFeatureHeaderRow(featureLabel, featureObj, count) {
  const isSelected = featureObj && state.selectedFeatureIds.has(featureObj.id);
  const checkboxHtml = featureObj
    ? `<input type="checkbox" class="feature-checkbox" data-feature-id="${escapeHtml(featureObj.id)}" ${isSelected ? "checked" : ""} />`
    : "";
  let tagHtml;
  if (featureLabel) {
    const numberHtml = featureObj?.number
      ? `<span class="feature-tag-number">${escapeHtml(featureObj.number)}</span>`
      : "";
    const nameText = featureObj ? escapeHtml(featureObj.name) : escapeHtml(featureLabel);
    const editBtn = featureObj
      ? `<button class="feature-edit-btn" data-feature-id="${escapeHtml(featureObj.id)}" title="Редактировать Feature" type="button"><span class="edit-icon">✏</span></button>`
      : "";
    tagHtml = `<span class="feature-tag">${numberHtml}<span class="feature-tag-name">${nameText}</span></span>${editBtn}`;
  } else {
    tagHtml = `<span class="feature-tag feature-tag--none">Без Feature</span>`;
  }
  const row = document.createElement("tr");
  row.className = featureLabel
    ? `feature-group-row${isSelected ? " feature-selected" : ""}`
    : "feature-group-row feature-group-row--ungrouped";
  row.innerHTML = `
    <td class="checkbox-cell">${checkboxHtml}</td>
    <td colspan="9"><div class="feature-group-cell">${tagHtml}<span class="feature-count">${count} тр.</span></div></td>
  `;
  return row;
}

function buildRequirementRow(item) {
  const isSelected = state.selectedIds.has(item.id);
  const row = document.createElement("tr");
  row.dataset.id = item.id;
  row.classList.toggle("selected", isSelected);
  row.innerHTML = `
    <td class="checkbox-cell">
      <input type="checkbox" data-id="${escapeHtml(item.id)}" ${isSelected ? "checked" : ""} />
    </td>
    <td><strong>${escapeHtml(item.code)}</strong></td>
    <td class="requirement-text">${escapeHtml(item.text)}</td>
    <td>${item.feature ? `<span class="badge feature-badge-inline">${escapeHtml(getFeatureNumber(item.feature))}</span>` : ""}</td>
    <td><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></td>
    <td><span class="badge ${priorityClass(item.priority)}">${escapeHtml(item.priority)}</span></td>
    <td>${escapeHtml(item.owner)}</td>
    <td>${escapeHtml(item.source)}</td>
    <td class="us-cell">${buildUSCell(item.id)}</td>
    <td class="row-actions-cell">
      <button class="row-edit-btn" data-id="${escapeHtml(item.id)}" title="Редактировать" type="button"><span class="edit-icon">✏</span></button>
      <button class="row-delete-btn" data-id="${escapeHtml(item.id)}" title="Удалить" type="button">🗑</button>
    </td>
  `;
  return row;
}

function renderFeatureSelectionBar() {
  const count = state.selectedFeatureIds.size;
  elements.featureSelectionBar.classList.toggle("hidden", count === 0);
  elements.featureSelectionCount.textContent = `Выбрано Features: ${count}`;
}

function groupByFeature(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.feature || "";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return new Map(
    [...map.entries()].sort(([a], [b]) => {
      if (!a && b) return 1;
      if (a && !b) return -1;
      return a.localeCompare(b, "ru");
    })
  );
}

function getFilteredRequirements() {
  return state.requirements.filter((item) => {
    const haystack = `${item.code} ${item.text} ${item.owner} ${item.source}`.toLowerCase();
    const matchesSearch = !state.search || haystack.includes(state.search);
    const matchesStatus = !state.status || item.status === state.status;
    const matchesPriority = !state.priority || item.priority === state.priority;
    const matchesFeature = !state.filterFeature || item.feature === state.filterFeature;
    return matchesSearch && matchesStatus && matchesPriority && matchesFeature;
  });
}

function sortItems(items) {
  if (!state.sortField) return items;
  return [...items].sort((a, b) => {
    const av = String(a[state.sortField] ?? "").toLowerCase();
    const bv = String(b[state.sortField] ?? "").toLowerCase();
    const cmp = av.localeCompare(bv, "ru");
    return state.sortDir === "asc" ? cmp : -cmp;
  });
}

function countBy(field, value) {
  return state.requirements.filter((item) => item[field] === value).length;
}

function statusClass(status) {
  const lower = String(status).toLowerCase();
  if (lower === "approved") return "approved";
  if (lower.includes("review")) return "review";
  if (lower === "changed") return "changed";
  return "";
}

function priorityClass(priority) {
  const lower = String(priority).toLowerCase();
  if (lower === "high") return "high";
  if (lower === "medium") return "medium";
  return "";
}

function setStatus(message) {
  elements.importStatus.textContent = message;
}

function saveRequirements(requirements) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requirements));
}

function loadRequirements() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFeatures(features) {
  localStorage.setItem(FEATURES_KEY, JSON.stringify(features));
}

function loadFeatures() {
  try {
    return JSON.parse(localStorage.getItem(FEATURES_KEY)) || [];
  } catch {
    return [];
  }
}

function deleteRequirement(id) {
  state.requirements = state.requirements.filter((r) => r.id !== id);
  state.userStories = state.userStories.filter((us) => us.requirementId !== id);
  state.selectedIds.delete(id);
  saveRequirements(state.requirements);
  saveUserStories(state.userStories);
  render();
}

let editingEpicId = null;

function openEpicModal() {
  if (state.selectedFeatureIds.size === 0) return;
  const selected = state.features.filter((f) => state.selectedFeatureIds.has(f.id));
  const alreadyBound = selected.filter((f) => f.epic);
  const freeCount = selected.length - alreadyBound.length;
  const warning = document.querySelector("#epicWarning");
  if (alreadyBound.length > 0) {
    warning.textContent = `⚠ ${alreadyBound.length} из ${selected.length} Feature уже привязаны к Epic и будут пропущены. Будет назначено: ${freeCount}.`;
    warning.classList.remove("hidden");
  } else {
    warning.classList.add("hidden");
  }
  if (freeCount === 0) { setStatus("Все выбранные Feature уже привязаны к Epic."); return; }
  editingEpicId = null;
  document.querySelector("#epicModalTitle").textContent = "Создать Epic";
  document.querySelector("#epicNumber").value = "";
  document.querySelector("#epicName").value = "";
  document.querySelector("#epicDescription").value = "";
  document.querySelector("#epicName").classList.remove("input-error");
  document.querySelector("#epicModal").classList.remove("hidden");
  requestAnimationFrame(() => document.querySelector("#epicNumber").focus());
}

function openEpicEditModal(epicObj) {
  editingEpicId = epicObj.id;
  document.querySelector("#epicModalTitle").textContent = "Редактировать Epic";
  document.querySelector("#epicWarning").classList.add("hidden");
  const epicNum = epicObj.number || '';
  document.querySelector("#epicNumber").value = epicNum.startsWith('E-') ? epicNum.slice(2) : epicNum;
  document.querySelector("#epicName").value = epicObj.name;
  document.querySelector("#epicDescription").value = epicObj.description;
  document.querySelector("#epicName").classList.remove("input-error");
  document.querySelector("#epicModal").classList.remove("hidden");
  requestAnimationFrame(() => document.querySelector("#epicNumber").focus());
}

function closeEpicModal() {
  document.querySelector("#epicModal").classList.add("hidden");
  editingEpicId = null;
}

function saveEpic() {
  const rawEpicNum = document.querySelector("#epicNumber").value.trim();
  const number = rawEpicNum ? `E-${rawEpicNum}` : '';
  const name = document.querySelector("#epicName").value.trim();
  const description = document.querySelector("#epicDescription").value.trim();
  if (!name) {
    document.querySelector("#epicName").classList.add("input-error");
    document.querySelector("#epicName").focus();
    return;
  }
  const label = number ? `${number} ${name}` : name;
  if (editingEpicId) {
    const oldLabel = state.epics.find((e) => e.id === editingEpicId)?.label;
    state.epics = state.epics.map((e) =>
      e.id === editingEpicId ? { ...e, number, name, description, label } : e
    );
    state.features = state.features.map((f) =>
      f.epic === oldLabel ? { ...f, epic: label } : f
    );
    saveEpics(state.epics);
    saveFeatures(state.features);
  } else {
    state.epics.push({ id: crypto.randomUUID(), number, name, description, label });
    saveEpics(state.epics);
    state.features = state.features.map((f) =>
      state.selectedFeatureIds.has(f.id) && !f.epic ? { ...f, epic: label } : f
    );
    state.selectedFeatureIds = new Set();
    saveFeatures(state.features);
  }
  closeEpicModal();
  render();
}

function removeFromEpic() {
  state.features = state.features.map((f) =>
    state.selectedFeatureIds.has(f.id) ? { ...f, epic: "" } : f
  );
  state.selectedFeatureIds = new Set();
  saveFeatures(state.features);
  render();
}

function saveEpics(epics) {
  localStorage.setItem(EPICS_KEY, JSON.stringify(epics));
}

function loadEpics() {
  try { return JSON.parse(localStorage.getItem(EPICS_KEY)) || []; } catch { return []; }
}

function loadOwners() {
  try { return JSON.parse(localStorage.getItem(OWNERS_KEY)) || []; } catch { return []; }
}

function saveOwners(owners) {
  localStorage.setItem(OWNERS_KEY, JSON.stringify(owners));
}

function mergeOwners(names) {
  const newOwners = [...new Set(names)].filter(n => n && !state.owners.includes(n));
  if (newOwners.length === 0) return;
  state.owners.push(...newOwners);
  saveOwners(state.owners);
}

function populateOwnerSelect(currentValue) {
  elements.reqOwner.innerHTML = '<option value="">— без владельца —</option>';
  const list = currentValue && !state.owners.includes(currentValue)
    ? [...state.owners, currentValue]
    : state.owners;
  for (const owner of list) {
    const opt = document.createElement("option");
    opt.value = owner;
    opt.textContent = owner;
    elements.reqOwner.append(opt);
  }
  elements.reqOwner.value = currentValue;
}

function openOwnersModal() {
  renderOwnersList();
  document.querySelector("#ownerAddInput").value = "";
  document.querySelector("#ownersModal").classList.remove("hidden");
  requestAnimationFrame(() => document.querySelector("#ownerAddInput").focus());
}

function closeOwnersModal() {
  document.querySelector("#ownersModal").classList.add("hidden");
  const currentVal = elements.reqOwner.value;
  populateOwnerSelect(currentVal);
}

function renderOwnersList() {
  const list = document.querySelector("#ownersList");
  list.innerHTML = "";
  if (state.owners.length === 0) {
    list.innerHTML = '<li class="owners-empty">Список пуст. Добавьте владельца ниже.</li>';
    return;
  }
  for (const owner of state.owners) {
    const li = document.createElement("li");
    li.className = "owner-item";
    li.innerHTML = `<span class="owner-name">${escapeHtml(owner)}</span>
      <button class="owner-delete-btn button ghost" data-owner="${escapeHtml(owner)}" type="button">✕</button>`;
    list.append(li);
  }
}

function addOwner() {
  const input = document.querySelector("#ownerAddInput");
  const name = input.value.trim();
  if (!name) return;
  if (state.owners.includes(name)) { input.select(); return; }
  state.owners.push(name);
  saveOwners(state.owners);
  renderOwnersList();
  input.value = "";
  input.focus();
}

function deleteOwner(name) {
  state.owners = state.owners.filter(o => o !== name);
  saveOwners(state.owners);
  renderOwnersList();
}

function getFeatureNumber(label) {
  const f = state.features.find((f) => f.label === label);
  return f?.number || label;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadUserStories() {
  try { return JSON.parse(localStorage.getItem(US_KEY)) || []; } catch { return []; }
}

function saveUserStories(us) {
  localStorage.setItem(US_KEY, JSON.stringify(us));
}

function buildUSCell(reqId) {
  const count = state.userStories.filter(us => us.requirementId === reqId).length;
  return count > 0
    ? `<button class="us-count-btn us-count-btn--has" data-req-id="${escapeHtml(reqId)}" title="${count} user ${count === 1 ? 'story' : 'stories'}" type="button">${count}</button>`
    : `<button class="us-count-btn" data-req-id="${escapeHtml(reqId)}" title="Добавить User Story" type="button">+</button>`;
}

function openUSListModal(reqId) {
  if (!reqId) return;
  currentUSRequirementId = reqId;
  const req = state.requirements.find(r => r.id === reqId);
  document.querySelector("#usListModalTitle").textContent = `User Stories: ${req?.code || ''}`;
  renderUSList();
  document.querySelector("#usListModal").classList.remove("hidden");
}

function closeUSListModal() {
  document.querySelector("#usListModal").classList.add("hidden");
  currentUSRequirementId = null;
  updateReqUSCount();
}

function buildScenarioBlock(us, type) {
  const steps = type === 'main' ? us.scenario : us.altScenario;
  if (!steps?.length) return '';
  const label = type === 'main' ? 'Основной сценарий' : 'Альтернативный сценарий';
  const cnt = state.testCases.filter(t => t.usId === us.id && t.scenarioType === type).length;
  const badge = cnt > 0 ? `<span class="tc-count-badge">TC: ${cnt}</span>` : '';
  const stepsHtml = steps.map(s => `<li class="us-item-scenario-step">${escapeHtml(s)}</li>`).join('');
  return `<div class="us-item-scenario-block">
    <div class="us-item-scenario-head">
      <span class="us-item-scenario-label">${label}</span>
      <span class="us-item-scenario-actions">${badge}<button class="tc-create-btn" data-us-id="${escapeHtml(us.id)}" data-scenario-type="${type}" type="button">+ Test Case</button></span>
    </div>
    <ol class="us-item-scenario">${stepsHtml}</ol>
  </div>`;
}

function renderUSList() {
  const list = document.querySelector("#usListItems");
  list.innerHTML = "";
  const items = state.userStories.filter(us => us.requirementId === currentUSRequirementId);
  if (items.length === 0) {
    list.innerHTML = '<li class="us-empty">Нет user stories. Нажмите «+ Добавить User Story».</li>';
    return;
  }
  for (const us of items) {
    const li = document.createElement("li");
    li.className = "us-item";
    li.innerHTML = `
      <div class="us-item-header">
        ${us.number ? `<span class="us-item-number">${escapeHtml(us.number)}</span>` : ''}
        <span class="us-item-title">${escapeHtml(us.title)}</span>
        <div class="us-item-actions">
          <button class="us-edit-btn row-edit-btn" data-us-id="${escapeHtml(us.id)}" type="button" title="Редактировать"><span class="edit-icon">✏</span></button>
          <button class="us-delete-btn row-delete-btn" data-us-id="${escapeHtml(us.id)}" type="button" title="Удалить">🗑</button>
        </div>
      </div>
      <div class="us-item-meta">
        <span class="us-item-meta-field"><span class="us-item-meta-label">Статус:</span> <span class="badge ${statusClass(us.status)}">${escapeHtml(us.status)}</span></span>
        <span class="us-item-meta-field"><span class="us-item-meta-label">Приоритет:</span> <span class="badge ${priorityClass(us.priority)}">${escapeHtml(us.priority)}</span></span>
        ${us.owner ? `<span class="us-item-meta-field"><span class="us-item-meta-label">Владелец:</span> <span class="us-item-meta-value">${escapeHtml(us.owner)}</span></span>` : ''}
      </div>
      ${us.text ? `<div class="us-item-text">${escapeHtml(us.text)}</div>` : ''}
      ${buildScenarioBlock(us, 'main')}
      ${buildScenarioBlock(us, 'alt')}
      ${us.rules?.length ? `<ul class="us-item-rules">${us.rules.map(r => `<li class="us-item-rule">${escapeHtml(r)}</li>`).join('')}</ul>` : ''}
      ${us.criteria?.length ? `<div class="us-item-scenario-block"><span class="us-item-scenario-label">Критерии приёмки</span><ul class="us-item-rules">${us.criteria.map(c => `<li class="us-item-rule">${escapeHtml(c)}</li>`).join('')}</ul></div>` : ''}
    `;
    list.append(li);
  }
}

function openUSEditModal(us) {
  if (us) {
    editingUSId = us.id;
    document.querySelector("#usEditModalTitle").textContent = "Редактировать User Story";
    const num = us.number || '';
    document.querySelector("#usNumber").value = num.startsWith('US-') ? num.slice(3) : num;
    document.querySelector("#usTitle").value = us.title;
    document.querySelector("#usRole").value = us.role || "";
    document.querySelector("#usAction").value = us.action || "";
    document.querySelector("#usGoal").value = us.goal || "";
    document.querySelector("#usStatus").value = us.status;
    document.querySelector("#usPriority").value = us.priority;
    document.querySelector("#usOwner").value = us.owner || "";
    populateRulesList(us.rules || []);
    populateCriteriaList(us.criteria || []);
    populateScenarioList(us.scenario || []);
    showAltScenario(us.altScenario?.length ? us.altScenario : null);
  } else {
    editingUSId = null;
    document.querySelector("#usEditModalTitle").textContent = "Новая User Story";
    document.querySelector("#usNumber").value = "";
    document.querySelector("#usTitle").value = "";
    document.querySelector("#usRole").value = "";
    document.querySelector("#usAction").value = "";
    document.querySelector("#usGoal").value = "";
    document.querySelector("#usStatus").value = "Draft";
    document.querySelector("#usPriority").value = "Medium";
    document.querySelector("#usOwner").value = "";
    populateRulesList([]);
    populateCriteriaList([]);
    populateScenarioList([]);
    showAltScenario(null);
  }
  updateUSCombined();
  document.querySelector("#usTitle").classList.remove("input-error");
  document.querySelector("#usEditModal").classList.remove("hidden");
  requestAnimationFrame(() => document.querySelector("#usTitle").focus());
}

function closeUSEditModal() {
  document.querySelector("#usEditModal").classList.add("hidden");
  editingUSId = null;
}

function saveUserStory() {
  const title = document.querySelector("#usTitle").value.trim();
  if (!title) {
    document.querySelector("#usTitle").classList.add("input-error");
    document.querySelector("#usTitle").focus();
    return;
  }
  const rawNum = document.querySelector("#usNumber").value.trim();
  const number = rawNum ? `US-${rawNum}` : '';
  const role = document.querySelector("#usRole").value.trim();
  const action = document.querySelector("#usAction").value.trim();
  const goal = document.querySelector("#usGoal").value.trim();
  const rules = [...document.querySelectorAll("#usRulesList .us-rule-input")]
    .map(inp => inp.value.trim())
    .filter(Boolean);
  const criteria = [...document.querySelectorAll("#usCriteriaList .us-criterion-input")]
    .map(inp => inp.value.trim())
    .filter(Boolean);
  const scenario = [...document.querySelectorAll("#usScenarioList .us-scenario-input")]
    .map(inp => inp.value.trim())
    .filter(Boolean);
  const altScenario = [...document.querySelectorAll("#usAltScenarioList .us-alt-scenario-input")]
    .map(inp => inp.value.trim())
    .filter(Boolean);
  const us = {
    id: editingUSId || crypto.randomUUID(),
    requirementId: currentUSRequirementId,
    number,
    title,
    role,
    action,
    goal,
    text: buildUSText(role, action, goal),
    rules,
    criteria,
    scenario,
    altScenario,
    status: document.querySelector("#usStatus").value,
    priority: document.querySelector("#usPriority").value,
    owner: document.querySelector("#usOwner").value.trim(),
  };
  if (editingUSId) {
    state.userStories = state.userStories.map(s => s.id === editingUSId ? us : s);
  } else {
    state.userStories.push(us);
  }
  saveUserStories(state.userStories);
  closeUSEditModal();
  renderUSList();
  updateReqUSCount();
  render();
  reRenderCurrentView();
}

function deleteUserStory(id) {
  state.userStories = state.userStories.filter(s => s.id !== id);
  saveUserStories(state.userStories);
  renderUSList();
  updateReqUSCount();
  render();
}

function updateReqUSCount() {
  const el = document.querySelector("#reqUSCount");
  if (!el || !editingRequirementId) return;
  const count = state.userStories.filter(us => us.requirementId === editingRequirementId).length;
  el.textContent = `${count} US`;
}

function autoAssignUSNumber() {
  const nums = state.userStories.filter(us => us.id !== editingUSId).map(us => us.number || '');
  autoAssignNumber(document.querySelector("#usNumber"), nums, 'US-');
}

function buildUSText(role, action, goal) {
  let text = "";
  if (role) text += `Как ${role}`;
  if (action) {
    text += text ? ", я хочу " : "Я хочу ";
    text += action;
  }
  if (goal) {
    text += text ? ", чтобы " : "Чтобы ";
    text += goal;
  }
  return text ? text + "." : "";
}

function updateUSCombined() {
  const role = document.querySelector("#usRole").value.trim();
  const action = document.querySelector("#usAction").value.trim();
  const goal = document.querySelector("#usGoal").value.trim();
  document.querySelector("#usCombined").value = buildUSText(role, action, goal);
}

function addRuleField(value = "", shouldFocus = false) {
  const list = document.querySelector("#usRulesList");
  const index = list.children.length + 1;
  const li = document.createElement("li");
  li.className = "us-rule-item";
  const input = document.createElement("input");
  input.type = "text";
  input.className = "us-rule-input";
  input.placeholder = `Правило ${index}...`;
  input.value = value;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "us-rule-remove";
  btn.title = "Удалить правило";
  btn.textContent = "✕";
  btn.addEventListener("click", () => {
    li.remove();
    if (document.querySelectorAll("#usRulesList .us-rule-item").length === 0) {
      addRuleField();
    }
  });
  li.append(input, btn);
  list.append(li);
  if (shouldFocus) input.focus();
}

function populateRulesList(rules) {
  document.querySelector("#usRulesList").innerHTML = "";
  const items = rules.length ? rules : [""];
  for (const rule of items) addRuleField(rule);
}

function addCriterionField(value = "", shouldFocus = false) {
  const list = document.querySelector("#usCriteriaList");
  const index = list.children.length + 1;
  const li = document.createElement("li");
  li.className = "us-rule-item";
  const input = document.createElement("input");
  input.type = "text";
  input.className = "us-criterion-input";
  input.placeholder = `Критерий ${index}...`;
  input.value = value;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "us-rule-remove";
  btn.title = "Удалить критерий";
  btn.textContent = "✕";
  btn.addEventListener("click", () => {
    li.remove();
    if (document.querySelectorAll("#usCriteriaList .us-rule-item").length === 0) {
      addCriterionField();
    }
  });
  li.append(input, btn);
  list.append(li);
  if (shouldFocus) input.focus();
}

function populateCriteriaList(criteria) {
  document.querySelector("#usCriteriaList").innerHTML = "";
  const items = criteria.length ? criteria : [""];
  for (const c of items) addCriterionField(c);
}

function addScenarioStep(value = "", shouldFocus = false) {
  const list = document.querySelector("#usScenarioList");
  const li = document.createElement("li");
  li.className = "us-scenario-item";
  const input = document.createElement("input");
  input.type = "text";
  input.className = "us-scenario-input";
  input.placeholder = "Описание шага...";
  input.value = value;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "us-rule-remove";
  btn.title = "Удалить шаг";
  btn.textContent = "✕";
  btn.addEventListener("click", () => {
    li.remove();
    if (document.querySelectorAll("#usScenarioList .us-scenario-item").length === 0) {
      addScenarioStep();
    }
  });
  li.append(input, btn);
  list.append(li);
  if (shouldFocus) input.focus();
}

function populateScenarioList(steps) {
  document.querySelector("#usScenarioList").innerHTML = "";
  const items = steps.length ? steps : [""];
  for (const step of items) addScenarioStep(step);
}

function addAltScenarioStep(value = "", shouldFocus = false) {
  const list = document.querySelector("#usAltScenarioList");
  const li = document.createElement("li");
  li.className = "us-scenario-item";
  const input = document.createElement("input");
  input.type = "text";
  input.className = "us-alt-scenario-input";
  input.placeholder = "Описание шага...";
  input.value = value;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "us-rule-remove";
  btn.title = "Удалить шаг";
  btn.textContent = "✕";
  btn.addEventListener("click", () => {
    li.remove();
    if (document.querySelectorAll("#usAltScenarioList .us-scenario-item").length === 0) {
      addAltScenarioStep();
    }
  });
  li.append(input, btn);
  list.append(li);
  if (shouldFocus) input.focus();
}

function populateAltScenarioList(steps) {
  document.querySelector("#usAltScenarioList").innerHTML = "";
  for (const step of steps) addAltScenarioStep(step);
}

function showAltScenario(steps) {
  const hasData = steps?.length > 0;
  document.querySelector("#usAltScenarioSection").classList.toggle("hidden", !hasData);
  document.querySelector("#addAltScenarioBtn").classList.toggle("hidden", hasData);
  if (hasData) populateAltScenarioList(steps);
  else document.querySelector("#usAltScenarioList").innerHTML = "";
}

// ── Test Cases ──────────────────────────────────────────────────────────────

function loadTestCases() {
  try { return JSON.parse(localStorage.getItem(TC_KEY)) || []; } catch { return []; }
}

function saveTestCases(tcs) {
  localStorage.setItem(TC_KEY, JSON.stringify(tcs));
}

let editingTCId = null;
let currentTCUsId = null;
let currentTCScenarioType = null;

function openTCFromEditModal(scenarioType) {
  const selector = scenarioType === 'main' ? '#usScenarioList .us-scenario-input' : '#usAltScenarioList .us-alt-scenario-input';
  const steps = [...document.querySelectorAll(selector)]
    .map(inp => inp.value.trim())
    .filter(Boolean);
  const usTitle = document.querySelector("#usTitle").value.trim() || "User Story";
  openTCModal(editingUSId || null, scenarioType, steps, usTitle);
}

function openTCModal(usId, scenarioType, steps, usTitle) {
  editingTCId = null;
  currentTCUsId = usId;
  currentTCScenarioType = scenarioType;
  const label = scenarioType === 'main' ? 'основной сценарий' : 'альтернативный сценарий';
  document.querySelector("#tcTitle").value = `TC: ${usTitle} (${label})`;
  document.querySelector("#tcStatus").value = "Draft";
  document.querySelector("#tcStepsList").innerHTML = "";
  for (const step of steps) addTCStepRow({ text: typeof step === 'string' ? step : step.text, expected: step.expected || "", actual: step.actual || "", screenshotExpected: step.screenshotExpected || null, screenshotActual: step.screenshotActual || null });
  document.querySelector("#tcModal").classList.remove("hidden");
  document.querySelector("#tcTitle").focus();
}

function closeTCModal() {
  document.querySelector("#tcModal").classList.add("hidden");
}

function saveTCModal() {
  const title = document.querySelector("#tcTitle").value.trim() || "Test Case";
  const status = document.querySelector("#tcStatus").value;
  const stepItems = document.querySelectorAll("#tcStepsList .tc-step-item");
  const steps = [...stepItems].map(item => ({
    text: item.querySelector(".tc-step-text").value.trim(),
    expected: item.querySelector(".tc-expected-input").value.trim(),
    actual: item.querySelector(".tc-actual-input").value.trim(),
    screenshotExpected: item.querySelector(".tc-expected-preview .tc-screenshot-img")?.src || null,
    screenshotActual: item.querySelector(".tc-actual-preview .tc-screenshot-img")?.src || null,
  }));
  const tc = {
    id: editingTCId || crypto.randomUUID(),
    usId: currentTCUsId,
    scenarioType: currentTCScenarioType,
    title,
    status,
    steps,
    createdAt: editingTCId
      ? (state.testCases.find(t => t.id === editingTCId)?.createdAt || new Date().toISOString())
      : new Date().toISOString(),
  };
  if (editingTCId) {
    state.testCases = state.testCases.map(t => t.id === editingTCId ? tc : t);
  } else {
    state.testCases.push(tc);
  }
  saveTestCases(state.testCases);
  closeTCModal();
  renderUSList();
  reRenderCurrentView();
}

function makeTCScreenshotRow(previewClass, initialSrc) {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.hidden = true;

  const attachBtn = document.createElement("button");
  attachBtn.type = "button";
  attachBtn.className = "tc-attach-btn";
  attachBtn.innerHTML = "&#128206; Скриншот";

  const preview = document.createElement("div");
  preview.className = "tc-screenshot-preview " + previewClass;
  if (initialSrc) renderTCScreenshot(preview, initialSrc);

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => renderTCScreenshot(preview, e.target.result);
    reader.readAsDataURL(file);
  });
  attachBtn.addEventListener("click", () => fileInput.click());

  const row = document.createElement("div");
  row.className = "tc-step-screenshot-row";
  row.append(attachBtn, fileInput, preview);
  return row;
}

function renumberTCSteps() {
  document.querySelectorAll("#tcStepsList .tc-step-num").forEach((el, i) => {
    el.textContent = i + 1;
  });
}

function addTCStepRow({ text = "", expected = "", actual = "", screenshotExpected = null, screenshotActual = null }) {
  const list = document.querySelector("#tcStepsList");
  const li = document.createElement("li");
  li.className = "tc-step-item";

  // ── header: номер · текст шага · удалить ──
  const numEl = document.createElement("span");
  numEl.className = "tc-step-num";
  numEl.textContent = list.children.length + 1;

  const stepInput = document.createElement("input");
  stepInput.type = "text";
  stepInput.className = "tc-step-text";
  stepInput.placeholder = "Шаг...";
  stepInput.value = text;

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "tc-step-delete";
  deleteBtn.title = "Удалить шаг";
  deleteBtn.textContent = "×";
  deleteBtn.addEventListener("click", () => {
    li.remove();
    renumberTCSteps();
  });

  const header = document.createElement("div");
  header.className = "tc-step-header";
  header.append(numEl, stepInput, deleteBtn);

  // ── 2-колоночная сетка: ожидаемый | фактический ──
  const expectedTA = document.createElement("textarea");
  expectedTA.className = "tc-expected-input";
  expectedTA.placeholder = "Ожидаемый результат...";
  expectedTA.rows = 3;
  expectedTA.value = expected;

  const actualTA = document.createElement("textarea");
  actualTA.className = "tc-actual-input";
  actualTA.placeholder = "Фактический результат...";
  actualTA.rows = 3;
  actualTA.value = actual;

  const expectedCell = document.createElement("div");
  expectedCell.className = "tc-step-field";
  const expectedLabel = document.createElement("span");
  expectedLabel.className = "tc-step-field-label";
  expectedLabel.textContent = "Ожидаемый результат";
  expectedCell.append(expectedLabel, expectedTA, makeTCScreenshotRow("tc-expected-preview", screenshotExpected));

  const actualCell = document.createElement("div");
  actualCell.className = "tc-step-field";
  const actualLabel = document.createElement("span");
  actualLabel.className = "tc-step-field-label";
  actualLabel.textContent = "Фактический результат";
  actualCell.append(actualLabel, actualTA, makeTCScreenshotRow("tc-actual-preview", screenshotActual));

  const fields = document.createElement("div");
  fields.className = "tc-step-fields";
  fields.append(expectedCell, actualCell);

  li.append(header, fields);
  list.append(li);
}

function renderTCScreenshot(container, src) {
  container.innerHTML = "";
  const img = document.createElement("img");
  img.className = "tc-screenshot-img";
  img.src = src;
  img.title = "Нажмите для просмотра";
  img.addEventListener("click", () => window.open(src, "_blank"));
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "tc-screenshot-remove";
  removeBtn.title = "Удалить скриншот";
  removeBtn.textContent = "✕";
  removeBtn.addEventListener("click", () => { container.innerHTML = ""; });
  container.append(img, removeBtn);
}

// TC modal event listeners
document.querySelector("#tcModalClose").addEventListener("click", closeTCModal);
document.querySelector("#tcModalCancel").addEventListener("click", closeTCModal);
document.querySelector("#tcModalSave").addEventListener("click", saveTCModal);
document.querySelector("#tcAddStepBtn").addEventListener("click", () => addTCStepRow({}));
document.querySelector("#tcModal").addEventListener("click", e => {
  if (e.target === document.querySelector("#tcModal")) closeTCModal();
});
document.querySelector("#tcModal").addEventListener("keydown", e => {
  if (e.key === "Escape") closeTCModal();
});
enableModalKeyboard(document.querySelector("#tcModal"));

// TC create buttons in US cards (event delegation on the list)
document.querySelector("#usListItems").addEventListener("click", e => {
  const btn = e.target.closest(".tc-create-btn");
  if (!btn) return;
  const us = state.userStories.find(u => u.id === btn.dataset.usId);
  if (!us) return;
  const steps = btn.dataset.scenarioType === 'main' ? us.scenario : us.altScenario;
  openTCModal(us.id, btn.dataset.scenarioType, steps || [], us.title);
});

// ═══════════════════════════════════════════════
// VIEWS — реестры: Эпики / Фичи / US / TC
// ═══════════════════════════════════════════════

function switchView(name) {
  currentView = name;
  const isReq = name === 'requirements';
  document.querySelector('.summary-grid').classList.toggle('hidden', !isReq);
  document.querySelector('.toolbar').classList.toggle('hidden', !isReq);
  document.querySelector('.table-panel').classList.toggle('hidden', !isReq);
  document.querySelector('.topbar-actions').classList.toggle('hidden', !isReq);
  ['epics', 'features', 'userStories', 'testCases'].forEach(v => {
    document.querySelector(`#${v}View`).classList.toggle('hidden', v !== name);
  });
  document.querySelectorAll('.ws-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.view === name)
  );
  document.querySelectorAll('.nav-item[data-view]').forEach(b =>
    b.classList.toggle('active', b.dataset.view === name)
  );
  reRenderCurrentView();
}

function reRenderCurrentView() {
  if (currentView === 'epics')       renderEpicsView();
  else if (currentView === 'features')    renderFeaturesView();
  else if (currentView === 'userStories') renderUSView();
  else if (currentView === 'testCases')   renderTCView();
}

// ── filter state ─────────────────────────────────

const epicsFilter   = { search: '' };
const featuresFilter = { search: '', epic: '' };
const usFilter      = { search: '', status: '', priority: '', feature: '' };
const tcFilter      = { search: '', status: '', scenario: '', usId: '' };

function filterEpics() {
  const q = epicsFilter.search.toLowerCase();
  return state.epics.filter(e =>
    !q ||
    (e.number || '').toLowerCase().includes(q) ||
    (e.name   || '').toLowerCase().includes(q) ||
    (e.label  || '').toLowerCase().includes(q) ||
    (e.description || '').toLowerCase().includes(q)
  );
}

function filterFeatures() {
  return state.features.filter(f => {
    if (featuresFilter.epic && f.epic !== featuresFilter.epic) return false;
    const q = featuresFilter.search.toLowerCase();
    return !q ||
      (f.number || '').toLowerCase().includes(q) ||
      (f.name   || '').toLowerCase().includes(q) ||
      (f.label  || '').toLowerCase().includes(q) ||
      (f.description || '').toLowerCase().includes(q);
  });
}

function filterUserStories() {
  return state.userStories.filter(us => {
    if (usFilter.status   && us.status   !== usFilter.status)   return false;
    if (usFilter.priority && us.priority !== usFilter.priority) return false;
    if (usFilter.feature) {
      const req = state.requirements.find(r => r.id === us.requirementId);
      if (!req || req.feature !== usFilter.feature) return false;
    }
    const q = usFilter.search.toLowerCase();
    return !q ||
      (us.number || '').toLowerCase().includes(q) ||
      (us.title  || '').toLowerCase().includes(q) ||
      (us.owner  || '').toLowerCase().includes(q);
  });
}

function filterTestCases() {
  return state.testCases.filter(tc => {
    if (tcFilter.status   && tc.status       !== tcFilter.status)   return false;
    if (tcFilter.scenario && tc.scenarioType !== tcFilter.scenario) return false;
    if (tcFilter.usId     && tc.usId         !== tcFilter.usId)     return false;
    const q = tcFilter.search.toLowerCase();
    if (!q) return true;
    const us = state.userStories.find(u => u.id === tc.usId);
    return (tc.title || '').toLowerCase().includes(q) ||
      (us?.title  || '').toLowerCase().includes(q) ||
      (us?.number || '').toLowerCase().includes(q);
  });
}

// ── shared helpers ───────────────────────────────

function viewEmpty(msg) {
  return `<p class="vt-empty">${msg}</p>`;
}

function regTable(head, rows, emptyMsg) {
  if (!rows.length) return viewEmpty(emptyMsg);
  return `<div class="reg-table-wrap"><table class="reg-table">
    <thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.join('')}</tbody>
  </table></div>`;
}

function regLink(label, action, dataAttrs) {
  if (!label) return `<span class="reg-empty-cell">—</span>`;
  const attrs = Object.entries(dataAttrs).map(([k, v]) => `data-${k}="${escapeHtml(v)}"`).join(' ');
  return `<button class="reg-link" data-action="${action}" ${attrs} type="button">${escapeHtml(label)}</button>`;
}

function resolveChain(us) {
  const req = state.requirements.find(r => r.id === us?.requirementId);
  const feature = req?.feature ? state.features.find(f => f.label === req.feature) : null;
  const epic = feature?.epic ? state.epics.find(e => e.label === feature.epic) : null;
  return { req, feature, epic };
}

// ── EPICS registry ───────────────────────────────

function renderEpicsView() {
  const el = document.querySelector('#epicsViewContent');
  // metrics (always full data)
  const allFeat = state.features.length;
  const allReqs = state.requirements.length;
  const allUS   = state.userStories.length;
  document.querySelector('#epicsTotalCount').textContent = state.epics.length;
  document.querySelector('#epicsFeatCount').textContent  = allFeat;
  document.querySelector('#epicsReqCount').textContent   = allReqs;
  document.querySelector('#epicsUSCount').textContent    = allUS;

  const filtered = filterEpics();
  document.querySelector('#epicsImportStatus').textContent =
    filtered.length === state.epics.length
      ? `Всего: ${state.epics.length}`
      : `Показано: ${filtered.length} из ${state.epics.length}`;

  const rows = filtered.map(epic => {
    const features = state.features.filter(f => f.epic === epic.label);
    const reqs = features.flatMap(f => state.requirements.filter(r => r.feature === f.label));
    const usCount = reqs.reduce((n, r) => n + state.userStories.filter(u => u.requirementId === r.id).length, 0);
    const tcCount = state.testCases.filter(tc => {
      const us = state.userStories.find(u => u.id === tc.usId);
      if (!us) return false;
      const req = state.requirements.find(r => r.id === us.requirementId);
      return req && reqs.some(r2 => r2.id === req.id);
    }).length;
    return `<tr>
      <td class="reg-code">${escapeHtml(epic.number || '')}</td>
      <td class="reg-name">${escapeHtml(epic.name || epic.label || '')}</td>
      <td class="reg-desc">${escapeHtml(epic.description || '')}</td>
      <td class="reg-num">${features.length}</td>
      <td class="reg-num">${reqs.length}</td>
      <td class="reg-num">${usCount}</td>
      <td class="reg-num">${tcCount}</td>
      <td class="reg-actions"><button class="row-edit-btn" data-action="edit-epic" data-epic-id="${epic.id}" title="Редактировать">✎</button></td>
    </tr>`;
  });
  el.innerHTML = regTable(
    ['Код', 'Название', 'Описание', 'Features', 'Требований', 'US', 'TC', ''],
    rows,
    'Нет Epics. Создайте их через реестр требований.'
  );
}

// ── FEATURES registry ────────────────────────────

function renderFeaturesView() {
  const el = document.querySelector('#featuresViewContent');
  // metrics
  const allReqs  = state.requirements.length;
  const allUS    = state.userStories.length;
  const allTC    = state.testCases.length;
  document.querySelector('#featsTotalCount').textContent = state.features.length;
  document.querySelector('#featsReqCount').textContent   = allReqs;
  document.querySelector('#featsUSCount').textContent    = allUS;
  document.querySelector('#featsTCCount').textContent    = allTC;

  // populate epic dropdown
  const epicSel = document.querySelector('#featsEpicFilter');
  const prevEpic = epicSel.value;
  epicSel.innerHTML = '<option value="">Все Epics</option>' +
    state.epics.map(e => `<option value="${escapeHtml(e.label)}">${escapeHtml(e.label || e.name)}</option>`).join('');
  if (prevEpic) epicSel.value = prevEpic;

  const filtered = filterFeatures();
  document.querySelector('#featsImportStatus').textContent =
    filtered.length === state.features.length
      ? `Всего: ${state.features.length}`
      : `Показано: ${filtered.length} из ${state.features.length}`;

  const rows = filtered.map(feature => {
    const epic = feature.epic ? state.epics.find(e => e.label === feature.epic) : null;
    const reqs = state.requirements.filter(r => r.feature === feature.label);
    const usCount = reqs.reduce((n, r) => n + state.userStories.filter(u => u.requirementId === r.id).length, 0);
    const tcCount = state.testCases.filter(tc => {
      const us = state.userStories.find(u => u.id === tc.usId);
      return us && reqs.some(r => r.id === us.requirementId);
    }).length;
    return `<tr>
      <td class="reg-code">${escapeHtml(feature.number || '')}</td>
      <td class="reg-name">${escapeHtml(feature.name || feature.label || '')}</td>
      <td>${epic ? regLink(epic.label, 'edit-epic', { 'epic-id': epic.id }) : '<span class="reg-empty-cell">—</span>'}</td>
      <td class="reg-desc">${escapeHtml(feature.description || '')}</td>
      <td class="reg-num">${reqs.length}</td>
      <td class="reg-num">${usCount}</td>
      <td class="reg-num">${tcCount}</td>
      <td class="reg-actions"><button class="row-edit-btn" data-action="edit-feature" data-feature-id="${feature.id}" title="Редактировать">✎</button></td>
    </tr>`;
  });
  el.innerHTML = regTable(
    ['Код', 'Название', 'Эпик', 'Описание', 'Требований', 'US', 'TC', ''],
    rows,
    'Нет Features. Создайте их через реестр требований.'
  );
}

// ── USER STORIES registry ────────────────────────

function renderUSView() {
  const el = document.querySelector('#userStoriesViewContent');
  // metrics
  document.querySelector('#usTotalCount').textContent    = state.userStories.length;
  document.querySelector('#usApprovedCount').textContent = state.userStories.filter(u => u.status === 'Approved').length;
  document.querySelector('#usDraftCount').textContent    = state.userStories.filter(u => u.status === 'Draft').length;
  document.querySelector('#usHighCount').textContent     = state.userStories.filter(u => u.priority === 'High').length;

  // populate feature dropdown
  const featSel = document.querySelector('#usFeatureFilter');
  const prevFeat = featSel.value;
  featSel.innerHTML = '<option value="">Все Features</option>' +
    state.features.map(f => `<option value="${escapeHtml(f.label)}">${escapeHtml(f.label || f.name)}</option>`).join('');
  if (prevFeat) featSel.value = prevFeat;

  const filtered = filterUserStories();
  document.querySelector('#usImportStatus').textContent =
    filtered.length === state.userStories.length
      ? `Всего: ${state.userStories.length}`
      : `Показано: ${filtered.length} из ${state.userStories.length}`;

  if (!filtered.length) {
    el.innerHTML = state.userStories.length
      ? viewEmpty('Нет совпадений с фильтрами.')
      : viewEmpty('Нет User Stories. Откройте реестр → кнопку US у требования.');
    return;
  }
  const rows = filtered.map(us => {
    const { req, feature, epic } = resolveChain(us);
    const mainTC = state.testCases.filter(t => t.usId === us.id && t.scenarioType === 'main').length;
    const altTC  = state.testCases.filter(t => t.usId === us.id && t.scenarioType === 'alt').length;
    const scenCell = [
      us.scenario?.length ? `Осн.: ${us.scenario.length} шаг.` : '',
      us.altScenario?.length ? `Альт.: ${us.altScenario.length} шаг.` : '',
    ].filter(Boolean).join(' / ') || '—';
    const tcCell = (mainTC + altTC) > 0
      ? `<button class="reg-link" data-action="goto-tc" data-us-id="${us.id}">${mainTC + altTC} TC</button>`
      : '<span class="reg-empty-cell">—</span>';
    return `<tr>
      <td class="reg-code">${escapeHtml(us.number || '')}</td>
      <td class="reg-name">${escapeHtml(us.title || '')}</td>
      <td>${req ? regLink(req.code, 'edit-req', { 'req-id': req.id }) : '<span class="reg-empty-cell">—</span>'}</td>
      <td>${feature ? regLink(feature.label || feature.name, 'edit-feature', { 'feature-id': feature.id }) : '<span class="reg-empty-cell">—</span>'}</td>
      <td>${epic ? regLink(epic.label || epic.name, 'edit-epic', { 'epic-id': epic.id }) : '<span class="reg-empty-cell">—</span>'}</td>
      <td>${us.status ? `<span class="badge ${statusClass(us.status)}">${escapeHtml(us.status)}</span>` : '—'}</td>
      <td>${us.priority ? `<span class="badge ${priorityClass(us.priority)}">${escapeHtml(us.priority)}</span>` : '—'}</td>
      <td class="reg-owner">${escapeHtml(us.owner || '—')}</td>
      <td class="reg-scenario">${scenCell}</td>
      <td>${tcCell}</td>
      <td class="reg-actions"><button class="row-edit-btn" data-action="edit-us" data-us-id="${us.id}" title="Редактировать">✎</button></td>
    </tr>`;
  });
  el.innerHTML = regTable(
    ['Номер', 'Заголовок', 'Требование', 'Фича', 'Эпик', 'Статус', 'Приоритет', 'Владелец', 'Сценарии', 'TC', ''],
    rows,
    ''
  );
}

// ── TEST CASES registry ──────────────────────────

function renderTCView() {
  const el = document.querySelector('#testCasesViewContent');
  // metrics
  document.querySelector('#tcTotalCount').textContent = state.testCases.length;
  document.querySelector('#tcPassCount').textContent  = state.testCases.filter(t => t.status === 'Pass').length;
  document.querySelector('#tcFailCount').textContent  = state.testCases.filter(t => t.status === 'Fail').length;
  document.querySelector('#tcDraftCount').textContent = state.testCases.filter(t => t.status === 'Draft').length;

  // populate US dropdown
  const usSel = document.querySelector('#tcUSFilter');
  const prevUS = usSel.value;
  usSel.innerHTML = '<option value="">Все User Stories</option>' +
    state.userStories.map(u =>
      `<option value="${escapeHtml(u.id)}">${escapeHtml(u.number ? `${u.number} ${u.title}` : u.title)}</option>`
    ).join('');
  if (prevUS) usSel.value = prevUS;

  const filtered = filterTestCases();
  document.querySelector('#tcImportStatus').textContent =
    filtered.length === state.testCases.length
      ? `Всего: ${state.testCases.length}`
      : `Показано: ${filtered.length} из ${state.testCases.length}`;

  if (!filtered.length) {
    el.innerHTML = state.testCases.length
      ? viewEmpty('Нет совпадений с фильтрами.')
      : viewEmpty('Нет тест-кейсов. Откройте User Story и создайте TC из сценариев.');
    return;
  }
  const tcStatusMap = { Draft: 'Draft', Pass: 'Approved', Fail: 'High', Blocked: 'Medium' };
  const rows = filtered.map(tc => {
    const us = state.userStories.find(u => u.id === tc.usId);
    const { req, feature, epic } = resolveChain(us);
    const steps = tc.steps?.length || 0;
    const date = tc.createdAt ? new Date(tc.createdAt).toLocaleDateString('ru-RU') : '—';
    const scenLabel = tc.scenarioType === 'main' ? 'Основной' : 'Альтернативный';
    return `<tr>
      <td class="reg-name">${escapeHtml(tc.title)}</td>
      <td>${us ? regLink(us.number ? `${us.number} ${us.title}` : us.title, 'edit-us', { 'us-id': us.id }) : '<span class="reg-empty-cell">—</span>'}</td>
      <td>${req ? regLink(req.code, 'edit-req', { 'req-id': req.id }) : '<span class="reg-empty-cell">—</span>'}</td>
      <td>${feature ? regLink(feature.label || feature.name, 'edit-feature', { 'feature-id': feature.id }) : '<span class="reg-empty-cell">—</span>'}</td>
      <td>${epic ? regLink(epic.label || epic.name, 'edit-epic', { 'epic-id': epic.id }) : '<span class="reg-empty-cell">—</span>'}</td>
      <td><span class="badge ${tcStatusMap[tc.status] || 'Draft'}">${escapeHtml(tc.status)}</span></td>
      <td class="reg-scenario">${scenLabel}</td>
      <td class="reg-num">${steps}</td>
      <td class="reg-date">${date}</td>
    </tr>`;
  });
  el.innerHTML = regTable(
    ['Название', 'User Story', 'Требование', 'Фича', 'Эпик', 'Статус', 'Сценарий', 'Шагов', 'Создан'],
    rows,
    ''
  );
}

// ── event delegation ─────────────────────────────

function handleViewClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'edit-req') {
    const req = state.requirements.find(r => r.id === btn.dataset.reqId);
    if (req) openRequirementModal(req);
  } else if (action === 'edit-feature') {
    const f = state.features.find(f => f.id === btn.dataset.featureId);
    if (f) openFeatureEditModal(f);
  } else if (action === 'edit-epic') {
    const ep = state.epics.find(e => e.id === btn.dataset.epicId);
    if (ep) openEpicEditModal(ep);
  } else if (action === 'edit-us') {
    const us = state.userStories.find(u => u.id === btn.dataset.usId);
    if (us) { currentUSRequirementId = us.requirementId; openUSEditModal(us); }
  } else if (action === 'goto-tc') {
    switchView('testCases');
  }
}

['epicsViewContent', 'featuresViewContent', 'userStoriesViewContent', 'testCasesViewContent'].forEach(id => {
  document.querySelector(`#${id}`).addEventListener('click', handleViewClick);
});

document.querySelectorAll('.ws-tab').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

// ── toolbar toggles for registry views ───────────

[
  ['epicsFiltersToggle',  'epicsFiltersBody'],
  ['featsFiltersToggle',  'featsFiltersBody'],
  ['usFiltersToggle',     'usFiltersBody'],
  ['tcFiltersToggle',     'tcFiltersBody'],
].forEach(([toggleId, bodyId]) => {
  const toggle = document.querySelector(`#${toggleId}`);
  const body   = document.querySelector(`#${bodyId}`);
  if (!toggle || !body) return;
  toggle.addEventListener('click', () => {
    const isOpen = body.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.querySelector('.toolbar-toggle-icon').textContent = isOpen ? '▼' : '▲';
  });
});

// ── filter inputs ─────────────────────────────────

document.querySelector('#epicsSearch').addEventListener('input', e => {
  epicsFilter.search = e.target.value; renderEpicsView();
});
document.querySelector('#epicsClearFilters').addEventListener('click', () => {
  epicsFilter.search = '';
  document.querySelector('#epicsSearch').value = '';
  renderEpicsView();
});

document.querySelector('#featsSearch').addEventListener('input', e => {
  featuresFilter.search = e.target.value; renderFeaturesView();
});
document.querySelector('#featsEpicFilter').addEventListener('change', e => {
  featuresFilter.epic = e.target.value; renderFeaturesView();
});
document.querySelector('#featsClearFilters').addEventListener('click', () => {
  featuresFilter.search = ''; featuresFilter.epic = '';
  document.querySelector('#featsSearch').value = '';
  document.querySelector('#featsEpicFilter').value = '';
  renderFeaturesView();
});

document.querySelector('#usSearch').addEventListener('input', e => {
  usFilter.search = e.target.value; renderUSView();
});
document.querySelector('#usStatusFilter').addEventListener('change', e => {
  usFilter.status = e.target.value; renderUSView();
});
document.querySelector('#usPriorityFilter').addEventListener('change', e => {
  usFilter.priority = e.target.value; renderUSView();
});
document.querySelector('#usFeatureFilter').addEventListener('change', e => {
  usFilter.feature = e.target.value; renderUSView();
});
document.querySelector('#usClearFilters').addEventListener('click', () => {
  usFilter.search = ''; usFilter.status = ''; usFilter.priority = ''; usFilter.feature = '';
  document.querySelector('#usSearch').value = '';
  document.querySelector('#usStatusFilter').value = '';
  document.querySelector('#usPriorityFilter').value = '';
  document.querySelector('#usFeatureFilter').value = '';
  renderUSView();
});

document.querySelector('#tcSearch').addEventListener('input', e => {
  tcFilter.search = e.target.value; renderTCView();
});
document.querySelector('#tcStatusFilter').addEventListener('change', e => {
  tcFilter.status = e.target.value; renderTCView();
});
document.querySelector('#tcScenarioFilter').addEventListener('change', e => {
  tcFilter.scenario = e.target.value; renderTCView();
});
document.querySelector('#tcUSFilter').addEventListener('change', e => {
  tcFilter.usId = e.target.value; renderTCView();
});
document.querySelector('#tcClearFilters').addEventListener('click', () => {
  tcFilter.search = ''; tcFilter.status = ''; tcFilter.scenario = ''; tcFilter.usId = '';
  document.querySelector('#tcSearch').value = '';
  document.querySelector('#tcStatusFilter').value = '';
  document.querySelector('#tcScenarioFilter').value = '';
  document.querySelector('#tcUSFilter').value = '';
  renderTCView();
});

document.querySelectorAll('.modal--resizable').forEach(modal => {
  const handle = document.createElement('div');
  handle.className = 'modal-resize-handle';
  modal.appendChild(handle);

  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = modal.offsetWidth;
    const startH = modal.offsetHeight;
    modal.style.maxWidth = 'none';
    modal.style.maxHeight = 'none';

    const onMove = e => {
      const w = Math.max(340, Math.min(window.innerWidth - 32, startW + e.clientX - startX));
      const h = Math.max(200, Math.min(window.innerHeight - 32, startH + e.clientY - startY));
      modal.style.width = w + 'px';
      modal.style.height = h + 'px';
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      // Подавляем click-событие, которое браузер стреляет после drag,
      // чтобы оно не закрыло модал через overlay-click-handler.
      document.addEventListener('click', e => e.stopPropagation(), { capture: true, once: true });
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
});
