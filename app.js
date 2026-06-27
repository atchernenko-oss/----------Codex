let currentView = 'requirements';
const sidebarExpanded = new Set();

const STORAGE_KEY = "reqtracker.requirements.v1";
const FEATURES_KEY = "reqtracker.features.v1";
const EPICS_KEY = "reqtracker.epics.v1";
const OWNERS_KEY = "reqtracker.owners.v1";
const US_KEY = "reqtracker.userstories.v1";
const TC_KEY = "reqtracker.testcases.v1";
const LINKS_KEY  = "reqtracker.links.v1";

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
  links: loadLinks(),
};

const elements = {
  excelInput: document.querySelector("#excelInput"),
  generateDemoButton: document.querySelector("#generateDemoButton"),
  exportButton: document.querySelector("#exportButton"),
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
  tcAutoCode:  document.querySelector("#tcAutoCode"),
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
document.querySelector("#clearDataButton").addEventListener("click", () => {
  if (!confirm("Удалить все данные? Это действие необратимо.")) return;
  state.requirements = [];
  state.features     = [];
  state.epics        = [];
  state.owners       = [];
  state.userStories  = [];
  state.testCases    = [];
  state.links        = [];
  saveRequirements([]); saveFeatures([]); saveEpics([]); saveOwners([]); saveUserStories([]); saveTestCases([]); saveLinks([]);
  render();
});
elements.exportButton.addEventListener("click", openExportModal);
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
elements.tcAutoCode.addEventListener("click", autoAssignTCCode);
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
document.querySelector("#tcCode").addEventListener("blur", () => padNumberField(document.querySelector("#tcCode")));
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
  // ─── Epics ───────────────────────────────────────────────────────────────
  const eIds = [crypto.randomUUID(), crypto.randomUUID()];
  const demoEpics = [
    { id: eIds[0], number: 'E-001', name: 'Личный кабинет',  description: 'Авторизация, профиль и настройки пользователя', label: 'E-001 Личный кабинет' },
    { id: eIds[1], number: 'E-002', name: 'Платежи',         description: 'Переводы, история операций и шаблоны',            label: 'E-002 Платежи' },
  ];

  // ─── Features ────────────────────────────────────────────────────────────
  const fIds = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];
  const demoFeatures = [
    { id: fIds[0], number: 'F-001', name: 'Авторизация',          description: 'Вход в систему и управление сессией',              label: 'F-001 Авторизация',          epic: demoEpics[0].label },
    { id: fIds[1], number: 'F-002', name: 'Управление профилем',  description: 'Редактирование личных данных и смена пароля',       label: 'F-002 Управление профилем',  epic: demoEpics[0].label },
    { id: fIds[2], number: 'F-003', name: 'Переводы',             description: 'Внутренние и внешние денежные переводы',           label: 'F-003 Переводы',             epic: demoEpics[1].label },
    { id: fIds[3], number: 'F-004', name: 'История операций',     description: 'Просмотр, поиск и фильтрация транзакций',          label: 'F-004 История операций',     epic: demoEpics[1].label },
  ];

  // ─── Requirements (2 на фичу) ─────────────────────────────────────────────
  const rIds = Array.from({ length: 8 }, () => crypto.randomUUID());
  const demoReqs = [
    { id: rIds[0], code: 'REQ-001', text: 'Пользователь должен иметь возможность войти в систему по логину и паролю.',                       status: 'Approved',  priority: 'High',   owner: 'Бизнес-аналитик',    source: 'ТЗ v1.0',      feature: demoFeatures[0].label },
    { id: rIds[1], code: 'REQ-002', text: 'Система должна поддерживать двухфакторную аутентификацию через SMS.',                            status: 'Approved',  priority: 'High',   owner: 'Системный аналитик', source: 'ТЗ v1.0',      feature: demoFeatures[0].label },
    { id: rIds[2], code: 'REQ-003', text: 'Пользователь может просматривать и редактировать личные данные профиля.',                         status: 'In Review', priority: 'Medium', owner: 'Project Owner',      source: 'Workshop',     feature: demoFeatures[1].label },
    { id: rIds[3], code: 'REQ-004', text: 'Система должна позволять пользователю сменить пароль с подтверждением по e-mail.',               status: 'Draft',     priority: 'Medium', owner: 'Системный аналитик', source: 'Workshop',     feature: demoFeatures[1].label },
    { id: rIds[4], code: 'REQ-005', text: 'Пользователь должен иметь возможность переводить средства между своими счетами.',                status: 'Approved',  priority: 'High',   owner: 'Бизнес-аналитик',    source: 'MVP Scope',    feature: demoFeatures[2].label },
    { id: rIds[5], code: 'REQ-006', text: 'Система должна поддерживать переводы на внешние карты по номеру карты или телефона.',            status: 'In Review', priority: 'High',   owner: 'QA Engineer',        source: 'MVP Scope',    feature: demoFeatures[2].label },
    { id: rIds[6], code: 'REQ-007', text: 'Пользователь должен видеть полную историю своих операций с пагинацией.',                         status: 'Approved',  priority: 'Medium', owner: 'Бизнес-аналитик',    source: 'ТЗ v1.0',      feature: demoFeatures[3].label },
    { id: rIds[7], code: 'REQ-008', text: 'Система должна поддерживать поиск и фильтрацию операций по дате, сумме и типу.',                 status: 'Changed',   priority: 'Medium', owner: 'Системный аналитик', source: 'Architecture', feature: demoFeatures[3].label },
  ];

  // ─── User Stories (1–2 на требование) ────────────────────────────────────
  const uIds = Array.from({ length: 13 }, () => crypto.randomUUID());
  const demoUS = [
    // REQ-001 — 2 US
    {
      id: uIds[0], requirementId: rIds[0], number: 'US-001',
      title: 'Войти с корректными учётными данными',
      role: 'пользователь', action: 'ввожу логин и пароль', goal: 'получить доступ к личному кабинету',
      text: 'Как пользователь, я хочу вводить логин и пароль, чтобы получить доступ к личному кабинету',
      rules: ['Логин — e-mail или номер телефона', 'Пароль: минимум 8 символов', 'Блокировка после 5 неудачных попыток'],
      criteria: ['Успешный вход перенаправляет на главную страницу', 'Сессия сохраняется 30 минут'],
      scenario: ['Открыть страницу входа', 'Ввести корректный логин', 'Ввести корректный пароль', 'Нажать «Войти»'],
      altScenario: ['Ввести неверный пароль 5 раз подряд', 'Аккаунт блокируется на 15 минут'],
      status: 'Approved', priority: 'High', owner: 'Бизнес-аналитик',
    },
    {
      id: uIds[1], requirementId: rIds[0], number: 'US-002',
      title: 'Получить понятное сообщение при неверном пароле',
      role: 'пользователь', action: 'ввожу неверный пароль', goal: 'понять причину отказа',
      text: 'Как пользователь, я хочу видеть понятное сообщение об ошибке, чтобы не путаться в причинах отказа',
      rules: ['Сообщение не должно раскрывать, что именно неверно — логин или пароль'],
      criteria: ['Отображается «Неверный логин или пароль»', 'Поле логина не сбрасывается'],
      scenario: ['Ввести корректный логин', 'Ввести неверный пароль', 'Нажать «Войти»', 'Убедиться в наличии ошибки'],
      altScenario: [],
      status: 'Approved', priority: 'Medium', owner: 'QA Engineer',
    },
    // REQ-002 — 2 US
    {
      id: uIds[2], requirementId: rIds[1], number: 'US-003',
      title: 'Получить SMS-код и войти через 2FA',
      role: 'пользователь', action: 'завершаю первый шаг входа', goal: 'подтвердить личность через SMS',
      text: 'Как пользователь, я хочу получать SMS с кодом, чтобы пройти второй фактор аутентификации',
      rules: ['Код действителен 3 минуты', 'Повторная отправка — не чаще 1 раза в 60 секунд'],
      criteria: ['SMS приходит в течение 30 секунд', 'После ввода кода открывается кабинет'],
      scenario: ['Пройти первый шаг входа', 'Получить SMS', 'Ввести код', 'Нажать «Подтвердить»'],
      altScenario: ['Ввести неверный код', 'Система показывает ошибку и предлагает повторить'],
      status: 'Approved', priority: 'High', owner: 'Системный аналитик',
    },
    {
      id: uIds[3], requirementId: rIds[1], number: 'US-004',
      title: 'Запросить повторную отправку SMS',
      role: 'пользователь', action: 'нажимаю «Отправить повторно»', goal: 'получить новый код если старый не пришёл',
      text: 'Как пользователь, я хочу запрашивать повторный код, чтобы завершить вход если SMS задержалась',
      rules: ['Кнопка активируется через 60 секунд', 'Максимум 3 повторных запроса'],
      criteria: ['Кнопка неактивна с обратным отсчётом', 'После нажатия приходит новый код'],
      scenario: ['Дождаться истечения 60 секунд', 'Нажать «Отправить повторно»', 'Получить новый SMS'],
      altScenario: [],
      status: 'Draft', priority: 'Medium', owner: 'QA Engineer',
    },
    // REQ-003 — 1 US
    {
      id: uIds[4], requirementId: rIds[2], number: 'US-005',
      title: 'Изменить номер телефона в профиле',
      role: 'пользователь', action: 'редактирую профиль', goal: 'обновить контактный номер телефона',
      text: 'Как пользователь, я хочу изменить номер телефона с подтверждением по SMS',
      rules: ['Новый номер подтверждается SMS', 'Старый номер остаётся активным до подтверждения'],
      criteria: ['Номер обновлён в профиле', 'Уведомление отправлено на старый номер'],
      scenario: ['Открыть профиль', 'Нажать «Изменить телефон»', 'Ввести новый номер', 'Подтвердить SMS'],
      altScenario: ['Ввести некорректный номер', 'Система выводит ошибку валидации'],
      status: 'In Review', priority: 'Medium', owner: 'Project Owner',
    },
    // REQ-004 — 2 US
    {
      id: uIds[5], requirementId: rIds[3], number: 'US-006',
      title: 'Сменить пароль из настроек профиля',
      role: 'пользователь', action: 'меняю пароль', goal: 'повысить безопасность аккаунта',
      text: 'Как пользователь, я хочу менять пароль в настройках, чтобы поддерживать безопасность',
      rules: ['Требуется текущий пароль', 'Новый пароль: минимум 8 символов + цифра'],
      criteria: ['Пароль изменён', 'Все активные сессии завершены', 'Уведомление на email'],
      scenario: ['Открыть «Безопасность»', 'Ввести текущий пароль', 'Ввести новый пароль дважды', 'Сохранить'],
      altScenario: ['Новые пароли не совпадают', 'Отображается ошибка валидации'],
      status: 'Draft', priority: 'High', owner: 'Системный аналитик',
    },
    {
      id: uIds[6], requirementId: rIds[3], number: 'US-007',
      title: 'Восстановить пароль через e-mail',
      role: 'пользователь', action: 'нажимаю «Забыл пароль»', goal: 'восстановить доступ к аккаунту',
      text: 'Как пользователь, я хочу восстанавливать пароль через email, чтобы не терять доступ',
      rules: ['Ссылка действительна 15 минут', 'Ссылка одноразовая'],
      criteria: ['Письмо приходит в течение 2 минут', 'После смены пароля старые сессии завершены'],
      scenario: ['Нажать «Забыл пароль»', 'Ввести email', 'Перейти по ссылке из письма', 'Задать новый пароль'],
      altScenario: ['Email не зарегистрирован', 'Система не раскрывает информацию о наличии аккаунта'],
      status: 'Draft', priority: 'Medium', owner: 'QA Engineer',
    },
    // REQ-005 — 1 US
    {
      id: uIds[7], requirementId: rIds[4], number: 'US-008',
      title: 'Перевести средства между своими счетами',
      role: 'клиент', action: 'выбираю счета и сумму', goal: 'перераспределить средства',
      text: 'Как клиент, я хочу переводить деньги между своими счетами, чтобы управлять балансом',
      rules: ['Сумма не может превышать текущий остаток', 'Минимальная сумма: 1 рубль'],
      criteria: ['Оба баланса обновляются мгновенно', 'Операция отражается в истории'],
      scenario: ['Открыть «Переводы»', 'Выбрать счёт-источник и счёт-получатель', 'Ввести сумму', 'Подтвердить'],
      altScenario: ['Сумма превышает остаток', 'Система выводит ошибку недостаточности средств'],
      status: 'Approved', priority: 'High', owner: 'Бизнес-аналитик',
    },
    // REQ-006 — 2 US
    {
      id: uIds[8], requirementId: rIds[5], number: 'US-009',
      title: 'Перевести деньги по номеру карты',
      role: 'клиент', action: 'ввожу номер карты получателя', goal: 'отправить деньги другому человеку',
      text: 'Как клиент, я хочу переводить деньги по номеру карты, чтобы отправлять средства другим людям',
      rules: ['Номер карты: 16 цифр', 'Лимит: 100 000 руб/сутки', 'Подтверждение через SMS'],
      criteria: ['Получатель видит поступление в течение 1 секунды', 'Квитанция отображается после подтверждения'],
      scenario: ['Выбрать «Перевод по карте»', 'Ввести номер карты', 'Ввести сумму', 'Подтвердить SMS-кодом'],
      altScenario: ['Карта получателя заблокирована', 'Система выводит ошибку'],
      status: 'In Review', priority: 'High', owner: 'Бизнес-аналитик',
    },
    {
      id: uIds[9], requirementId: rIds[5], number: 'US-010',
      title: 'Перевести деньги по номеру телефона через СБП',
      role: 'клиент', action: 'ввожу номер телефона получателя', goal: 'быстро отправить деньги без реквизитов',
      text: 'Как клиент, я хочу переводить деньги по телефону через СБП, чтобы не вводить реквизиты карты',
      rules: ['Используется СБП', 'Лимит: 1 000 000 руб/сутки'],
      criteria: ['Перевод зачислен в течение 15 секунд', 'Уведомление отправлено обоим участникам'],
      scenario: ['Выбрать «Перевод по телефону»', 'Ввести номер', 'Выбрать банк получателя', 'Подтвердить'],
      altScenario: ['Номер не привязан к СБП', 'Предложить альтернативные способы'],
      status: 'In Review', priority: 'High', owner: 'Системный аналитик',
    },
    // REQ-007 — 1 US
    {
      id: uIds[10], requirementId: rIds[6], number: 'US-011',
      title: 'Просмотреть историю операций за период',
      role: 'клиент', action: 'открываю историю операций', goal: 'контролировать расходы',
      text: 'Как клиент, я хочу просматривать историю операций по счёту, чтобы контролировать расходы',
      rules: ['История доступна за последние 3 года', 'Пагинация по 20 записей'],
      criteria: ['Список загружается за < 2 сек', 'Каждая операция содержит дату, сумму, описание'],
      scenario: ['Открыть «История»', 'Выбрать счёт', 'Выбрать период', 'Просмотреть список'],
      altScenario: ['Нет операций за период', 'Отображается сообщение «Нет данных»'],
      status: 'Approved', priority: 'Medium', owner: 'Бизнес-аналитик',
    },
    // REQ-008 — 2 US
    {
      id: uIds[11], requirementId: rIds[7], number: 'US-012',
      title: 'Найти операцию по сумме',
      role: 'клиент', action: 'ввожу сумму в поиск', goal: 'быстро найти конкретную транзакцию',
      text: 'Как клиент, я хочу искать операции по сумме, чтобы быстро находить нужную транзакцию',
      rules: ['Поиск поддерживает точное совпадение и диапазон', 'Нечувствителен к разделителю тысяч'],
      criteria: ['Результаты отображаются мгновенно', 'Показан счётчик найденных операций'],
      scenario: ['Открыть историю', 'Ввести сумму в поиск', 'Убедиться что список отфильтрован'],
      altScenario: ['Ничего не найдено', 'Сообщение «Ничего не найдено»'],
      status: 'Changed', priority: 'Medium', owner: 'QA Engineer',
    },
    {
      id: uIds[12], requirementId: rIds[7], number: 'US-013',
      title: 'Фильтровать историю по типу операции',
      role: 'клиент', action: 'выбираю тип в фильтре', goal: 'видеть только нужный вид транзакций',
      text: 'Как клиент, я хочу фильтровать операции по типу, чтобы анализировать расходы по категориям',
      rules: ['Типы: Переводы, Оплата, Начисления, Комиссии', 'Можно выбрать несколько'],
      criteria: ['После выбора список обновляется', 'Активные фильтры визуально выделены'],
      scenario: ['Открыть историю', 'Нажать «Фильтры»', 'Выбрать «Переводы»', 'Применить'],
      altScenario: [],
      status: 'Changed', priority: 'Low', owner: 'Системный аналитик',
    },
  ];

  // ─── Test Cases ───────────────────────────────────────────────────────────
  const now = new Date().toISOString();
  const tcIds = Array.from({ length: 15 }, () => crypto.randomUUID());
  const demoTC = [
    // US-001
    {
      id: tcIds[0], code: 'TC-001', usId: uIds[0], scenarioType: 'main',
      title: 'TC: Успешный вход по логину и паролю',
      status: 'Pass',
      steps: [
        { text: 'Открыть страницу входа /login',           expected: 'Форма входа отображается',                           actual: 'Форма отображена корректно',          screenshotExpected: null, screenshotActual: null },
        { text: 'Ввести корректный логин',                  expected: 'Поле логина заполнено',                              actual: 'Введён user@test.ru',                 screenshotExpected: null, screenshotActual: null },
        { text: 'Ввести корректный пароль и нажать «Войти»', expected: 'Переход на главную страницу /dashboard',           actual: 'Переход выполнен, пользователь авторизован', screenshotExpected: null, screenshotActual: null },
      ],
      createdAt: now,
    },
    {
      id: tcIds[1], code: 'TC-002', usId: uIds[0], scenarioType: 'alt',
      title: 'TC: Блокировка после 5 неудачных попыток',
      status: 'Pass',
      steps: [
        { text: 'Ввести верный логин и неверный пароль 5 раз подряд', expected: 'После 5-й попытки — сообщение о блокировке', actual: '«Аккаунт заблокирован на 15 минут» отображено', screenshotExpected: null, screenshotActual: null },
        { text: 'Попытаться войти с правильными данными',   expected: 'Вход невозможен, таймер обратного отсчёта',          actual: 'Таймер показан, форма недоступна',    screenshotExpected: null, screenshotActual: null },
      ],
      createdAt: now,
    },
    // US-002
    {
      id: tcIds[2], code: 'TC-003', usId: uIds[1], scenarioType: 'main',
      title: 'TC: Сообщение об ошибке при неверном пароле',
      status: 'Pass',
      steps: [
        { text: 'Ввести корректный логин и неверный пароль', expected: 'Форма принимает данные',                             actual: 'Данные введены',                      screenshotExpected: null, screenshotActual: null },
        { text: 'Нажать «Войти»',                            expected: 'Отображается «Неверный логин или пароль»',            actual: 'Сообщение отображено',               screenshotExpected: null, screenshotActual: null },
        { text: 'Убедиться, что поле логина не сброшено',    expected: 'Логин остаётся в поле',                              actual: 'Логин сохранён',                      screenshotExpected: null, screenshotActual: null },
      ],
      createdAt: now,
    },
    // US-003
    {
      id: tcIds[3], code: 'TC-004', usId: uIds[2], scenarioType: 'main',
      title: 'TC: Получение и ввод SMS-кода',
      status: 'Draft',
      steps: [
        { text: 'Завершить первый шаг входа',                expected: 'Форма ввода кода отображается',                      actual: '',                                   screenshotExpected: null, screenshotActual: null },
        { text: 'Дождаться SMS',                             expected: 'SMS с 6-значным кодом приходит до 30 сек',           actual: '',                                   screenshotExpected: null, screenshotActual: null },
        { text: 'Ввести код и нажать «Подтвердить»',         expected: 'Вход выполнен, открывается кабинет',                 actual: '',                                   screenshotExpected: null, screenshotActual: null },
      ],
      createdAt: now,
    },
    // US-004
    {
      id: tcIds[4], code: 'TC-005', usId: uIds[3], scenarioType: 'main',
      title: 'TC: Повторная отправка SMS-кода',
      status: 'Draft',
      steps: [
        { text: 'Дождаться 60 секунд на экране ввода кода',  expected: 'Кнопка «Отправить повторно» активируется',           actual: '',                                   screenshotExpected: null, screenshotActual: null },
        { text: 'Нажать «Отправить повторно»',               expected: 'Новое SMS отправлено, таймер сброшен',               actual: '',                                   screenshotExpected: null, screenshotActual: null },
      ],
      createdAt: now,
    },
    // US-005
    {
      id: tcIds[5], code: 'TC-006', usId: uIds[4], scenarioType: 'main',
      title: 'TC: Смена номера телефона в профиле',
      status: 'Draft',
      steps: [
        { text: 'Открыть Профиль → «Изменить телефон»',      expected: 'Форма смены номера доступна',                        actual: '',                                   screenshotExpected: null, screenshotActual: null },
        { text: 'Ввести новый номер и запросить SMS',         expected: 'SMS с кодом отправлен на новый номер',               actual: '',                                   screenshotExpected: null, screenshotActual: null },
        { text: 'Ввести код и сохранить',                    expected: 'Номер обновлён, уведомление на старый номер',        actual: '',                                   screenshotExpected: null, screenshotActual: null },
      ],
      createdAt: now,
    },
    // US-006
    {
      id: tcIds[6], code: 'TC-007', usId: uIds[5], scenarioType: 'main',
      title: 'TC: Смена пароля из настроек',
      status: 'Fail',
      steps: [
        { text: 'Открыть «Безопасность» → «Сменить пароль»', expected: 'Форма смены пароля доступна',                        actual: 'Форма открылась',                    screenshotExpected: null, screenshotActual: null },
        { text: 'Ввести текущий пароль',                     expected: 'Поле принимает ввод',                                actual: 'Введён корректный пароль',           screenshotExpected: null, screenshotActual: null },
        { text: 'Ввести новый пароль дважды и сохранить',    expected: 'Пароль изменён, сессии завершены, email отправлен',  actual: 'Ошибка 500 — пароль не сохранился', screenshotExpected: null, screenshotActual: null },
      ],
      createdAt: now,
    },
    // US-007
    {
      id: tcIds[7], code: 'TC-008', usId: uIds[6], scenarioType: 'main',
      title: 'TC: Восстановление пароля через e-mail',
      status: 'Draft',
      steps: [
        { text: 'На экране входа нажать «Забыл пароль»',     expected: 'Открывается форма ввода e-mail',                     actual: '',                                   screenshotExpected: null, screenshotActual: null },
        { text: 'Ввести зарегистрированный email',           expected: 'Письмо с ссылкой отправлено',                        actual: '',                                   screenshotExpected: null, screenshotActual: null },
        { text: 'Перейти по ссылке и задать новый пароль',   expected: 'Пароль изменён, все сессии закрыты',                 actual: '',                                   screenshotExpected: null, screenshotActual: null },
      ],
      createdAt: now,
    },
    // US-008
    {
      id: tcIds[8], code: 'TC-009', usId: uIds[7], scenarioType: 'main',
      title: 'TC: Перевод между своими счетами',
      status: 'Pass',
      steps: [
        { text: 'Открыть «Переводы» → «Между своими счетами»', expected: 'Список счетов доступен',                           actual: 'Два счёта отображены',               screenshotExpected: null, screenshotActual: null },
        { text: 'Выбрать счёт-источник (50 000 руб) и получатель, ввести 5 000 руб', expected: 'Сумма принята', actual: 'Введено корректно', screenshotExpected: null, screenshotActual: null },
        { text: 'Подтвердить перевод',                       expected: 'Балансы обновлены мгновенно, операция в истории',    actual: 'Оба баланса изменены корректно',     screenshotExpected: null, screenshotActual: null },
      ],
      createdAt: now,
    },
    {
      id: tcIds[9], code: 'TC-010', usId: uIds[7], scenarioType: 'alt',
      title: 'TC: Попытка перевести сумму больше остатка',
      status: 'Pass',
      steps: [
        { text: 'Ввести сумму, превышающую остаток на счёте', expected: 'Кнопка «Перевести» заблокирована или ошибка',       actual: 'Кнопка недоступна: «Недостаточно средств»', screenshotExpected: null, screenshotActual: null },
      ],
      createdAt: now,
    },
    // US-009
    {
      id: tcIds[10], code: 'TC-011', usId: uIds[8], scenarioType: 'main',
      title: 'TC: Перевод по номеру карты с SMS-подтверждением',
      status: 'Draft',
      steps: [
        { text: 'Открыть «Переводы» → «По номеру карты»',   expected: 'Форма ввода карты доступна',                          actual: '',                                   screenshotExpected: null, screenshotActual: null },
        { text: 'Ввести 16-значный номер карты получателя', expected: 'Банк получателя определён автоматически',             actual: '',                                   screenshotExpected: null, screenshotActual: null },
        { text: 'Ввести сумму и подтвердить SMS-кодом',     expected: 'Перевод выполнен, квитанция отображена',              actual: '',                                   screenshotExpected: null, screenshotActual: null },
      ],
      createdAt: now,
    },
    // US-010
    {
      id: tcIds[11], code: 'TC-012', usId: uIds[9], scenarioType: 'main',
      title: 'TC: Перевод по телефону через СБП',
      status: 'Draft',
      steps: [
        { text: 'Открыть «Переводы» → «По номеру телефона»', expected: 'Форма СБП-перевода доступна',                        actual: '',                                   screenshotExpected: null, screenshotActual: null },
        { text: 'Ввести номер, выбрать банк получателя',    expected: 'Имя получателя показано',                            actual: '',                                   screenshotExpected: null, screenshotActual: null },
        { text: 'Ввести сумму и подтвердить',               expected: 'Зачисление в течение 15 секунд, уведомление обеим сторонам', actual: '', screenshotExpected: null, screenshotActual: null },
      ],
      createdAt: now,
    },
    // US-011
    {
      id: tcIds[12], code: 'TC-013', usId: uIds[10], scenarioType: 'main',
      title: 'TC: Просмотр истории за последний месяц',
      status: 'Pass',
      steps: [
        { text: 'Открыть «История операций»',               expected: 'Список загружается',                                 actual: 'Загрузка < 2 сек',                   screenshotExpected: null, screenshotActual: null },
        { text: 'Выбрать период «Последний месяц»',          expected: 'Показаны операции за 30 дней',                       actual: '47 операций отображено',             screenshotExpected: null, screenshotActual: null },
        { text: 'Прокрутить до 21-й операции',              expected: 'Пагинация срабатывает',                              actual: 'Следующая страница подгружена',       screenshotExpected: null, screenshotActual: null },
      ],
      createdAt: now,
    },
    // US-012
    {
      id: tcIds[13], code: 'TC-014', usId: uIds[11], scenarioType: 'main',
      title: 'TC: Поиск по сумме транзакции',
      status: 'Draft',
      steps: [
        { text: 'В истории ввести «5000» в строку поиска',  expected: 'Отфильтрованы операции на 5 000 руб',                actual: '',                                   screenshotExpected: null, screenshotActual: null },
        { text: 'Попробовать «5 000» (с пробелом)',          expected: 'Результат идентичен — нечувствительность к формату', actual: '',                                   screenshotExpected: null, screenshotActual: null },
      ],
      createdAt: now,
    },
    // US-013
    {
      id: tcIds[14], code: 'TC-015', usId: uIds[12], scenarioType: 'main',
      title: 'TC: Фильтрация истории по типу «Переводы»',
      status: 'Draft',
      steps: [
        { text: 'Открыть историю и нажать «Фильтры»',       expected: 'Панель фильтров открылась',                          actual: '',                                   screenshotExpected: null, screenshotActual: null },
        { text: 'Выбрать тип «Переводы» и применить',        expected: 'Показаны только операции типа «Перевод»',            actual: '',                                   screenshotExpected: null, screenshotActual: null },
        { text: 'Убедиться в визуальном выделении фильтра',  expected: 'Индикатор активного фильтра отображён',              actual: '',                                   screenshotExpected: null, screenshotActual: null },
      ],
      createdAt: now,
    },
  ];

  // ─── Influence Links ──────────────────────────────────────────────────────
  const lid = (n) => `demo-link-${n}`;
  const demoLinks = [
    // Feature → Feature: Авторизация влияет на Переводы
    { id: lid(1), sourceType: 'feature', sourceId: fIds[0], targetType: 'feature', targetId: fIds[2],
      linkType: 'influences', description: 'Авторизация является обязательным предусловием для любых денежных операций — сессионный токен передаётся в каждый запрос переводов' },
    // Feature → Feature: История зависит от Переводов
    { id: lid(2), sourceType: 'feature', sourceId: fIds[3], targetType: 'feature', targetId: fIds[2],
      linkType: 'depends_on', description: 'История операций отображает данные, генерируемые фичей «Переводы» — без реальных транзакций история останется пустой' },
    // REQ → REQ: REQ-001 влияет на REQ-002 (пароль → 2FA)
    { id: lid(3), sourceType: 'req', sourceId: rIds[0], targetType: 'req', targetId: rIds[1],
      linkType: 'influences', description: 'Базовая аутентификация по паролю является первым шагом перед 2FA: изменение политики паролей прямо влияет на требования к SMS-коду' },
    // REQ → REQ: REQ-005 влияет на REQ-007 (переводы → история)
    { id: lid(4), sourceType: 'req', sourceId: rIds[4], targetType: 'req', targetId: rIds[6],
      linkType: 'influences', description: 'Каждый перевод между счетами должен попадать в историю операций — требование к переводам определяет структуру записей истории' },
    // US → Feature (cross-level): US-003 (SMS-вход) влияет на F-001 (Авторизация)
    { id: lid(5), sourceType: 'us', sourceId: uIds[2], targetType: 'feature', targetId: fIds[0],
      linkType: 'influences', description: 'Сценарий 2FA определяет требования к интеграции с SMS-шлюзом на уровне всей фичи авторизации — затрагивает инфраструктуру и таймауты' },
    // US → Epic (cross-level): US-008 (перевод между счетами) зависит от E-001 (Личный кабинет)
    { id: lid(6), sourceType: 'us', sourceId: uIds[7], targetType: 'epic', targetId: eIds[0],
      linkType: 'depends_on', description: 'Для выполнения перевода пользователь должен пройти полный цикл авторизации из эпика «Личный кабинет» — без активной сессии перевод невозможен' },
    // US → US: US-003 зависит от US-001 (SMS-вход от основного входа)
    { id: lid(7), sourceType: 'us', sourceId: uIds[2], targetType: 'us', targetId: uIds[0],
      linkType: 'depends_on', description: 'Получение SMS-кода — второй шаг входа, возможный только после успешного прохождения первого шага (логин/пароль)' },
    // US → REQ (cross-level): US-006 (смена пароля) влияет на REQ-001
    { id: lid(8), sourceType: 'us', sourceId: uIds[5], targetType: 'req', targetId: rIds[0],
      linkType: 'influences', description: 'Сценарий смены пароля уточняет политику сложности паролей и механизм инвалидации сессий — это расширяет требования к основному входу' },
    // TC → REQ (cross-level): TC-007 (смена пароля) зависит от REQ-001
    { id: lid(9), sourceType: 'tc', sourceId: tcIds[6], targetType: 'req', targetId: rIds[0],
      linkType: 'depends_on', description: 'Тест смены пароля требует предварительной авторизации — тест-кейс предполагает выполнение REQ-001 как предусловие' },
    // TC → TC: TC-004 (SMS-код) зависит от TC-001 (успешный вход)
    { id: lid(10), sourceType: 'tc', sourceId: tcIds[3], targetType: 'tc', targetId: tcIds[0],
      linkType: 'depends_on', description: 'Тест 2FA предполагает успешное прохождение первого шага аутентификации из TC-001 как обязательное предусловие' },
    // TC → US (cross-level): TC-001 влияет на US-003
    { id: lid(11), sourceType: 'tc', sourceId: tcIds[0], targetType: 'us', targetId: uIds[2],
      linkType: 'influences', description: 'Результаты TC-001 определяют набор предусловий и тестовых данных для всех сценариев 2FA — найденные дефекты входа блокируют тестирование SMS-флоу' },
    // TC → Feature (cross-level): TC-013 (история) влияет на F-003 (переводы)
    { id: lid(12), sourceType: 'tc', sourceId: tcIds[12], targetType: 'feature', targetId: fIds[2],
      linkType: 'influences', description: 'Тест истории операций верифицирует корректность записи данных переводов — дефекты, найденные здесь, указывают на баги в фиче «Переводы»' },
    // REQ → Feature (cross-level): REQ-002 (2FA) влияет на F-001 (Авторизация)
    { id: lid(13), sourceType: 'req', sourceId: rIds[1], targetType: 'feature', targetId: fIds[0],
      linkType: 'influences', description: 'Требование 2FA через SMS усложняет общую архитектуру авторизации: добавляет второй экран, интеграцию с SMS и механизм повторной отправки' },
    // Feature → Epic (cross-level): F-003 (Переводы) влияет на E-002 (Платежи)
    { id: lid(14), sourceType: 'feature', sourceId: fIds[2], targetType: 'epic', targetId: eIds[1],
      linkType: 'influences', description: 'Функциональность переводов является ключевым компонентом эпика «Платежи» — готовность фичи напрямую определяет MVP-готовность всего эпика' },
    // REQ → US (cross-level): REQ-007 (история с пагинацией) зависит от US-008
    { id: lid(15), sourceType: 'req', sourceId: rIds[6], targetType: 'us', targetId: uIds[7],
      linkType: 'depends_on', description: 'Для наполнения истории реальными данными необходимо наличие переводов из US-008 — без них невозможно проверить пагинацию на реальном объёме данных' },
  ];

  state.requirements = demoReqs;
  state.features     = demoFeatures;
  state.epics        = demoEpics;
  state.userStories  = demoUS;
  state.testCases    = demoTC;
  state.links        = demoLinks;
  state.selectedIds  = new Set();
  saveRequirements(demoReqs);
  saveFeatures(demoFeatures);
  saveEpics(demoEpics);
  saveUserStories(demoUS);
  saveTestCases(demoTC);
  saveLinks(demoLinks);
  mergeOwners(demoReqs.map(r => r.owner));
  setStatus(`Сгенерирован демонстрационный набор: ${demoReqs.length} требований, ${demoFeatures.length} Features, ${demoEpics.length} Epics, ${demoUS.length} US, ${demoTC.length} TC, ${demoLinks.length} связей влияния.`);
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
  if (!isNew) {
    updateReqUSCount();
    renderInfluenceSection('reqInfluenceSection', 'req', req.id);
  } else {
    const sec = document.getElementById('reqInfluenceSection');
    if (sec) sec.innerHTML = '';
  }
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
  renderInfluenceSection('featureInfluenceSection', 'feature', featureObj.id);
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

function autoAssignTCCode() {
  const nums = state.testCases.filter(t => t.id !== editingTCId).map(t => t.code || '');
  autoAssignNumber(document.querySelector("#tcCode"), nums, 'TC-');
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
  renderSidebarTree();
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
  renderInfluenceSection('epicInfluenceSection', 'epic', epicObj.id);
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

// ── Influence section in entity modals ────────────────────────────────────────

function buildMsHierarchyHtml(entityType, entityId) {
  const skip   = (type, id) => type === entityType && id === entityId;
  const labels = { epic: 'Epic', feature: 'Feature', req: 'Req', us: 'US', tc: 'TC' };
  const rows   = [];
  let rootCount = 0, prevDepth = -1;
  const usedFeatureIds = new Set(), usedReqIds = new Set(),
        usedUsIds = new Set(), usedTcIds = new Set();

  const row = (type, entity, depth) => {
    if (skip(type, entity.id)) return;
    if (depth === 0 && rootCount++ > 0) rows.push('<div class="inf-ms-sep"></div>');
    else if (depth < prevDepth) rows.push('<div class="inf-ms-sep inf-ms-sep--minor"></div>');
    prevDepth = depth;
    const conn = depth > 0 ? `<span class="inf-ms-conn">${'└─'}</span>` : '';
    rows.push(
      `<label class="inf-ms-item inf-ms-item--${type}" style="padding-left:${10 + depth * 16}px">` +
      conn +
      `<input type="checkbox" value="${type}:${escapeHtml(entity.id)}">` +
      `<span class="inf-ms-badge inf-ms-badge--${type}">${labels[type]}</span>` +
      `<span class="inf-ms-name">${escapeHtml(entityLabel(type, entity.id))}</span>` +
      `</label>`
    );
  };

  const walkUs = (us, depth) => {
    usedUsIds.add(us.id);
    row('us', us, depth);
    state.testCases.filter(tc => tc.usId === us.id).forEach(tc => {
      usedTcIds.add(tc.id); row('tc', tc, depth + 1);
    });
  };
  const walkReq = (req, depth) => {
    usedReqIds.add(req.id);
    row('req', req, depth);
    state.userStories.filter(us => us.requirementId === req.id).forEach(us => walkUs(us, depth + 1));
  };
  const walkFeature = (feature, depth) => {
    usedFeatureIds.add(feature.id);
    row('feature', feature, depth);
    state.requirements.filter(r => r.feature === feature.label).forEach(r => walkReq(r, depth + 1));
  };

  state.epics.forEach(epic => {
    row('epic', epic, 0);
    state.features.filter(f => f.epic === (epic.label || epic.number))
      .forEach(f => walkFeature(f, 1));
  });

  state.features.filter(f => !usedFeatureIds.has(f.id)).forEach(f => walkFeature(f, 0));
  state.requirements.filter(r => !usedReqIds.has(r.id)).forEach(r => walkReq(r, 0));
  state.userStories.filter(us => !usedUsIds.has(us.id)).forEach(us => walkUs(us, 0));
  state.testCases.filter(tc => !usedTcIds.has(tc.id)).forEach(tc => row('tc', tc, 0));

  return rows.join('') || '<div class="inf-ms-empty">Нет доступных объектов</div>';
}

function entityLabel(type, id) {
  const map = { epic: state.epics, feature: state.features, req: state.requirements, us: state.userStories, tc: state.testCases };
  const e = (map[type] || []).find(x => x.id === id);
  if (!e) return id;
  if (type === 'epic')    return [e.number, e.name].filter(Boolean).join(' ');
  if (type === 'feature') return [e.number, e.name].filter(Boolean).join(' ');
  if (type === 'req')     return [e.code, e.text].filter(Boolean).join(' ');
  if (type === 'us')      return [e.number ? `US-${String(e.number).replace(/^US-/i, '')}` : '', e.title].filter(Boolean).join(' ');
  if (type === 'tc')      return e.title || id;
  return id;
}

function entityCode(type, id) {
  const map = { epic: state.epics, feature: state.features, req: state.requirements, us: state.userStories, tc: state.testCases };
  const e = (map[type] || []).find(x => x.id === id);
  if (!e) return id;
  if (type === 'epic')    return e.number || e.label || id;
  if (type === 'feature') return e.number || e.label || id;
  if (type === 'req')     return e.code || id;
  if (type === 'us')      return e.number ? `US-${String(e.number).replace(/^US-/i, '')}` : id;
  if (type === 'tc')      return e.code || id;
  return id;
}

function buildInfluenceListHtml(entityType, entityId) {
  const out = state.links.filter(l => l.sourceType === entityType && l.sourceId === entityId);
  const inc = state.links.filter(l => l.targetType === entityType && l.targetId === entityId);
  if (!out.length && !inc.length) return '<li class="inf-empty">Связей нет</li>';

  const row = (l, typeLabel, name) => `
    <li class="inf-item">
      <span class="inf-type">${typeLabel}</span>
      <span class="inf-target">${escapeHtml(name)}</span>
      ${l.description ? `<span class="inf-desc">${escapeHtml(l.description)}</span>` : ''}
      <button type="button" class="inf-delete" data-link-id="${l.id}" title="Удалить">✕</button>
    </li>`;

  return [
    ...out.map(l => row(l,
      l.linkType === 'depends_on' ? 'Зависит от' : 'Влияет на',
      entityLabel(l.targetType, l.targetId))),
    ...inc.map(l => row(l,
      l.linkType === 'depends_on' ? 'Нужен для' : 'Зависит от',
      entityLabel(l.sourceType, l.sourceId))),
  ].join('');
}

function renderInfluenceSection(sectionId, entityType, entityId) {
  const sec = document.getElementById(sectionId);
  if (!sec) return;

  const msItemsHtml = buildMsHierarchyHtml(entityType, entityId);

  sec.innerHTML = `
    <div class="inf-header">
      <span class="field-label">Влияние</span>
      <button type="button" class="button ghost inf-add-btn">+ Добавить связь</button>
    </div>
    <ul class="inf-list">${buildInfluenceListHtml(entityType, entityId)}</ul>
    <div class="inf-form hidden">
      <div class="inf-form-fields">
        <label class="inf-field">
          <span class="field-label">Тип связи</span>
          <select class="inf-link-type">
            <option value="influences">Влияет на</option>
            <option value="depends_on">Зависит от</option>
          </select>
        </label>
        <div class="inf-field">
          <span class="field-label">Объект</span>
          <div class="inf-ms" tabindex="0">
            <div class="inf-ms-display">
              <span class="inf-ms-placeholder">Выберите объекты...</span>
            </div>
            <div class="inf-ms-dropdown hidden">${msItemsHtml}</div>
          </div>
        </div>
      </div>
      <label class="inf-field">
        <span class="field-label">Описание</span>
        <textarea class="inf-link-desc" placeholder="Описание взаимосвязи..."></textarea>
      </label>
      <div class="inf-form-actions">
        <button type="button" class="button ghost inf-form-cancel">Отмена</button>
        <button type="button" class="button primary inf-form-save">Добавить</button>
      </div>
    </div>`;

  const list   = sec.querySelector('.inf-list');
  const form   = sec.querySelector('.inf-form');
  const addBtn = sec.querySelector('.inf-add-btn');
  const ms     = sec.querySelector('.inf-ms');
  const msDrop = sec.querySelector('.inf-ms-dropdown');
  const msDisp = sec.querySelector('.inf-ms-display');

  function updateMsDisplay() {
    const checked = [...msDrop.querySelectorAll('input[type=checkbox]:checked')];
    if (!checked.length) {
      msDisp.innerHTML = '<span class="inf-ms-placeholder">Выберите объекты...</span>';
    } else {
      msDisp.innerHTML = checked.map(cb => {
        const [t, i] = cb.value.split(':');
        return `<span class="inf-ms-tag" title="${escapeHtml(entityLabel(t, i))}">${escapeHtml(entityCode(t, i))}<button type="button" class="inf-ms-tag-del" data-value="${escapeHtml(cb.value)}">✕</button></span>`;
      }).join('');
    }
  }

  function positionDrop() {
    const r = msDisp.getBoundingClientRect();
    const dropH = Math.min(260, msDrop.scrollHeight || 260);
    const spaceBelow = window.innerHeight - r.bottom - 8;
    msDrop.style.left  = r.left + 'px';
    msDrop.style.width = r.width + 'px';
    if (spaceBelow >= dropH || spaceBelow >= r.top - 8) {
      msDrop.style.top    = (r.bottom + 4) + 'px';
      msDrop.style.bottom = 'auto';
    } else {
      msDrop.style.bottom = (window.innerHeight - r.top + 4) + 'px';
      msDrop.style.top    = 'auto';
    }
  }

  ms.addEventListener('click', ev => {
    const delBtn = ev.target.closest('.inf-ms-tag-del');
    if (delBtn) {
      const cb = msDrop.querySelector(`input[value="${delBtn.dataset.value}"]`);
      if (cb) { cb.checked = false; updateMsDisplay(); }
      return;
    }
    if (ev.target.closest('input[type=checkbox]')) return;
    const wasHidden = msDrop.classList.contains('hidden');
    msDrop.classList.toggle('hidden');
    if (wasHidden) { positionDrop(); ms.focus(); }
  });

  msDrop.addEventListener('change', updateMsDisplay);

  ms.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') msDrop.classList.add('hidden');
  });

  document.addEventListener('mousedown', function closeOnOut(ev) {
    if (!sec.isConnected) { document.removeEventListener('mousedown', closeOnOut); return; }
    if (msDrop.classList.contains('hidden')) return;
    // Используем viewport-координаты, т.к. msDrop — position:fixed DOM-внутри ms,
    // и ms.contains(ev.target) всегда TRUE при клике на dropdown
    const msR   = msDisp.getBoundingClientRect();
    const dropR = msDrop.getBoundingClientRect();
    const inMs   = ev.clientX >= msR.left   && ev.clientX <= msR.right   && ev.clientY >= msR.top   && ev.clientY <= msR.bottom;
    const inDrop = ev.clientX >= dropR.left && ev.clientX <= dropR.right && ev.clientY >= dropR.top && ev.clientY <= dropR.bottom;
    if (!inMs && !inDrop) msDrop.classList.add('hidden');
  });

  addBtn.addEventListener('click', () => {
    form.classList.remove('hidden');
    addBtn.classList.add('hidden');
    requestAnimationFrame(() => form.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  });

  sec.querySelector('.inf-form-cancel').addEventListener('click', () => {
    form.classList.add('hidden');
    addBtn.classList.remove('hidden');
  });

  sec.querySelector('.inf-form-save').addEventListener('click', () => {
    const checked = [...msDrop.querySelectorAll('input[type=checkbox]:checked')];
    if (!checked.length) return;
    const linkType   = sec.querySelector('.inf-link-type').value;
    const description = sec.querySelector('.inf-link-desc').value.trim();
    checked.forEach(cb => {
      const [targetType, targetId] = cb.value.split(':');
      state.links.push({
        id:          Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        sourceType:  entityType,
        sourceId:    entityId,
        targetType,
        targetId,
        linkType,
        description,
      });
    });
    saveLinks(state.links);
    list.innerHTML = buildInfluenceListHtml(entityType, entityId);
    form.classList.add('hidden');
    addBtn.classList.remove('hidden');
    sec.querySelector('.inf-link-type').value = 'influences';
    sec.querySelector('.inf-link-desc').value = '';
    msDrop.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = false);
    updateMsDisplay();
    if (currentView === 'graph') renderGraphView();
  });

  list.addEventListener('click', ev => {
    const btn = ev.target.closest('.inf-delete');
    if (!btn) return;
    const lid = btn.dataset.linkId;
    if (confirm('Удалить эту связь?')) {
      state.links = state.links.filter(l => l.id !== lid);
      saveLinks(state.links);
      list.innerHTML = buildInfluenceListHtml(entityType, entityId);
      if (currentView === 'graph') renderGraphView();
    }
  });
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
  if (us) renderInfluenceSection('usInfluenceSection', 'us', us.id);
  else { const s = document.getElementById('usInfluenceSection'); if (s) s.innerHTML = ''; }
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

function loadLinks() {
  try { return JSON.parse(localStorage.getItem(LINKS_KEY)) || []; } catch { return []; }
}
function saveLinks(links) {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
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
  document.querySelector("#tcCode").value = '';
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

function openTCEditModal(tc) {
  editingTCId = tc.id;
  currentTCUsId = tc.usId;
  currentTCScenarioType = tc.scenarioType;
  document.querySelector("#tcCode").value = (tc.code || '').replace(/^TC-/i, '');
  document.querySelector("#tcTitle").value = tc.title;
  document.querySelector("#tcStatus").value = tc.status || "Draft";
  document.querySelector("#tcStepsList").innerHTML = "";
  for (const step of (tc.steps || [])) addTCStepRow(step);
  document.querySelector("#tcModalTitle").textContent = "Edit Test Case";
  document.querySelector("#tcModal").classList.remove("hidden");
  renderInfluenceSection('tcInfluenceSection', 'tc', tc.id);
  document.querySelector("#tcTitle").focus();
}

function saveTCModal() {
  const rawCode = document.querySelector("#tcCode").value.trim();
  const code = rawCode ? `TC-${rawCode}` : '';
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
    code,
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
  // Keep "Реестр требований" section header highlighted whenever we're in any registry view
  document.querySelectorAll('.nav-section-header[data-section]').forEach(b =>
    b.classList.toggle('active', b.dataset.section === 'requirements')
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

// ── Sidebar section expand/collapse ──────────────────────────────────────────
document.querySelectorAll('.nav-section-header[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;

    // All collapsible sections — toggle body; requirements also navigates
    if (section === 'requirements') switchView('requirements');

    const bodyId = `navBody${section.charAt(0).toUpperCase() + section.slice(1)}`;
    const body = document.querySelector(`#${bodyId}`);
    if (!body) return;
    const nowOpen = body.classList.toggle('hidden') === false;
    const arrow = btn.querySelector('.nav-section-arrow');
    if (arrow) arrow.textContent = nowOpen ? '▾' : '▸';
  });
});

function setSectionOpen(section, open) {
  const bodyId = `navBody${section.charAt(0).toUpperCase() + section.slice(1)}`;
  const body = document.querySelector(`#${bodyId}`);
  const btn  = document.querySelector(`.nav-section-header[data-section="${section}"]`);
  if (!body || !btn) return;
  body.classList.toggle('hidden', !open);
  const arrow = btn.querySelector('.nav-section-arrow');
  if (arrow) arrow.textContent = open ? '▾' : '▸';
}

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

// ═══════════════════════════════════════════════
// SIDEBAR HIERARCHY TREE
// ═══════════════════════════════════════════════

function buildUSNode(us, autoExpand) {
  const nodeId = `stu${us.id}`;
  const tcs = state.testCases.filter(t => t.usId === us.id);
  const label = (us.number ? us.number + ' ' : '') + (us.title || '');
  const isOpen = sidebarExpanded.has(nodeId);
  const parts = [`<div class="st-row">
    ${tcs.length
      ? `<button class="st-tog" data-toggle="${nodeId}" type="button">${isOpen ? '▾' : '▸'}</button>`
      : '<span class="st-tog-ph"></span>'}
    <button class="st-item" data-action="edit-us" data-us-id="${us.id}" type="button">
      <span class="st-badge st-badge--us">US</span>
      <span class="st-label" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
    </button>
  </div>`];
  if (tcs.length) {
    parts.push(`<div class="st-kids${isOpen ? '' : ' hidden'}" id="${nodeId}">`);
    for (const tc of tcs) {
      parts.push(`<div class="st-row">
        <span class="st-tog-ph"></span>
        <button class="st-item" data-action="edit-tc" data-tc-id="${tc.id}" type="button">
          <span class="st-badge st-badge--tc">TC</span>
          <span class="st-label" title="${escapeHtml(tc.title)}">${escapeHtml(tc.title)}</span>
        </button>
      </div>`);
    }
    parts.push('</div>');
  }
  return parts.join('');
}

function buildReqNode(req, autoExpand) {
  const nodeId = `str${req.id}`;
  if (autoExpand) sidebarExpanded.add(nodeId);
  const isOpen = sidebarExpanded.has(nodeId);
  const stories = state.userStories.filter(u => u.requirementId === req.id);
  const parts = [`<div class="st-row">
    <button class="st-tog" data-toggle="${nodeId}" type="button">${isOpen ? '▾' : '▸'}</button>
    <button class="st-item" data-action="edit-req" data-req-id="${req.id}" type="button">
      <span class="st-badge st-badge--req">REQ</span>
      <span class="st-label" title="${escapeHtml(req.code)}">${escapeHtml(req.code)}</span>
    </button>
  </div>`,
  `<div class="st-kids${isOpen ? '' : ' hidden'}" id="${nodeId}">`];
  for (const us of stories) parts.push(buildUSNode(us, autoExpand));
  if (!stories.length) parts.push('<p class="st-empty">No User Stories</p>');
  parts.push('</div>');
  return parts.join('');
}

function buildFeatNode(feat, autoExpand) {
  const nodeId = `stf${feat.id}`;
  if (autoExpand) sidebarExpanded.add(nodeId);
  const isOpen = sidebarExpanded.has(nodeId);
  const reqs = state.requirements.filter(r => r.feature === feat.label);
  const label = (feat.number ? feat.number + ' ' : '') + (feat.name || feat.label || '');
  const parts = [`<div class="st-row">
    <button class="st-tog" data-toggle="${nodeId}" type="button">${isOpen ? '▾' : '▸'}</button>
    <button class="st-item" data-action="edit-feature" data-feature-id="${feat.id}" type="button">
      <span class="st-badge st-badge--feat">F</span>
      <span class="st-label" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
    </button>
  </div>`,
  `<div class="st-kids${isOpen ? '' : ' hidden'}" id="${nodeId}">`];
  for (const req of reqs) parts.push(buildReqNode(req, autoExpand));
  if (!reqs.length) parts.push('<p class="st-empty">No requirements</p>');
  parts.push('</div>');
  return parts.join('');
}

function renderSidebarTree() {
  const el = document.querySelector('#sidebarTree');
  if (!el) return;

  const hasData = state.epics.length || state.features.length || state.requirements.length
    || state.userStories.length || state.testCases.length;
  if (!hasData) {
    el.innerHTML = '<p class="st-hint">Загрузите данные, чтобы увидеть иерархию</p>';
    return;
  }

  // Auto-expand top-level nodes on very first render (sidebarExpanded is empty)
  const firstRender = sidebarExpanded.size === 0;

  const parts = [];

  // ── Epics (with Features → Reqs → US → TC inside) ──
  for (const epic of state.epics) {
    const nodeId = `ste${epic.id}`;
    if (firstRender) sidebarExpanded.add(nodeId);
    const isOpen = sidebarExpanded.has(nodeId);
    const features = state.features.filter(f => f.epic === epic.label);
    const label = (epic.number ? epic.number + ' ' : '') + (epic.name || epic.label || '');
    parts.push(`<div class="st-row">
      <button class="st-tog" data-toggle="${nodeId}" type="button">${isOpen ? '▾' : '▸'}</button>
      <button class="st-item" data-action="edit-epic" data-epic-id="${epic.id}" type="button">
        <span class="st-badge st-badge--epic">E</span>
        <span class="st-label" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
      </button>
    </div>
    <div class="st-kids${isOpen ? '' : ' hidden'}" id="${nodeId}">`);
    for (const feat of features) parts.push(buildFeatNode(feat, firstRender));
    if (!features.length) parts.push('<p class="st-empty">No Features linked</p>');
    parts.push('</div>');
  }

  // ── Features without Epic ──
  const orphanFeats = state.features.filter(f => !f.epic || !state.epics.find(e => e.label === f.epic));
  for (const feat of orphanFeats) parts.push(buildFeatNode(feat, firstRender));

  // ── Requirements without Feature (shown directly, not as hidden group) ──
  const orphanReqs = state.requirements.filter(
    r => !r.feature || !state.features.find(f => f.label === r.feature)
  );
  for (const req of orphanReqs) parts.push(buildReqNode(req, firstRender));

  // ── US without Requirement (edge case) ──
  const orphanUS = state.userStories.filter(
    u => !state.requirements.find(r => r.id === u.requirementId)
  );
  for (const us of orphanUS) parts.push(buildUSNode(us, firstRender));

  el.innerHTML = parts.join('');
}

function handleSidebarTreeClick(e) {
  const tog = e.target.closest('.st-tog');
  if (tog) {
    const id = tog.dataset.toggle;
    const child = document.querySelector(`#${id}`);
    if (child) {
      const willOpen = child.classList.toggle('hidden') === false;
      tog.textContent = willOpen ? '▾' : '▸';
      if (willOpen) sidebarExpanded.add(id); else sidebarExpanded.delete(id);
    }
    return;
  }
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'edit-epic') {
    const ep = state.epics.find(e => e.id === btn.dataset.epicId);
    if (ep) openEpicEditModal(ep);
  } else if (action === 'edit-feature') {
    const f = state.features.find(f => f.id === btn.dataset.featureId);
    if (f) openFeatureEditModal(f);
  } else if (action === 'edit-req') {
    const req = state.requirements.find(r => r.id === btn.dataset.reqId);
    if (req) openRequirementModal(req);
  } else if (action === 'edit-us') {
    const us = state.userStories.find(u => u.id === btn.dataset.usId);
    if (us) { currentUSRequirementId = us.requirementId; openUSEditModal(us); }
  } else if (action === 'edit-tc') {
    const tc = state.testCases.find(t => t.id === btn.dataset.tcId);
    if (tc) openTCEditModal(tc);
  }
}

document.querySelector('#sidebarTree').addEventListener('click', handleSidebarTreeClick);

// ── Sidebar resize ────────────────────────────────────────────────────────
(function initSidebarResize() {
  const SIDEBAR_W_KEY = 'reqtracker.sidebarWidth';
  const MIN_W = 160;
  const MAX_W = 520;
  const resizer = document.querySelector('#sidebarResizer');
  const shell   = document.querySelector('.app-shell');

  function applyWidth(w) {
    shell.style.gridTemplateColumns = `${w}px 4px minmax(0, 1fr)`;
  }

  const saved = parseInt(localStorage.getItem(SIDEBAR_W_KEY), 10);
  if (saved && saved >= MIN_W && saved <= MAX_W) applyWidth(saved);

  resizer.addEventListener('mousedown', function (e) {
    e.preventDefault();
    resizer.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    function onMove(e) {
      const w = Math.min(MAX_W, Math.max(MIN_W, e.clientX));
      applyWidth(w);
    }

    function onUp(e) {
      const w = Math.min(MAX_W, Math.max(MIN_W, e.clientX));
      applyWidth(w);
      localStorage.setItem(SIDEBAR_W_KEY, w);
      resizer.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}());

function enableModalResize(modal) {
  const handle = document.createElement('div');
  handle.className = 'modal-resize-handle';
  modal.appendChild(handle);

  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    const overlay = modal.closest('.modal-overlay');
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = modal.offsetWidth;
    const startH = modal.offsetHeight;
    modal.style.width  = startW + 'px';
    modal.style.height = startH + 'px';
    modal.style.maxWidth  = 'none';
    modal.style.maxHeight = 'none';
    // backdrop-filter вызывает моргание при каждом resize — отключаем на время drag
    if (overlay) overlay.style.backdropFilter = 'none';

    const onMove = e => {
      const w = Math.max(340, Math.min(window.innerWidth - 32, startW + e.clientX - startX));
      const h = Math.max(200, Math.min(window.innerHeight - 32, startH + e.clientY - startY));
      modal.style.width = w + 'px';
      modal.style.height = h + 'px';
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (overlay) overlay.style.backdropFilter = '';
      // Подавляем click-событие, которое браузер стреляет после drag,
      // чтобы оно не закрыло модал через overlay-click-handler.
      document.addEventListener('click', e => e.stopPropagation(), { capture: true, once: true });
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

document.querySelectorAll('.modal--resizable').forEach(enableModalResize);

// ══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ══════════════════════════════════════════════════════════════════════════════

function openExportModal() {
  const selCount = state.selectedIds.size;
  const allCount = state.requirements.length;

  // Hint for "all"
  const usCount = state.userStories.length;
  const tcCount = state.testCases.length;
  document.querySelector('#exportScopeAllHint').textContent =
    `${allCount} треб. · ${usCount} US · ${tcCount} TC`;

  // "Selected" option — disable if nothing checked
  const selLabel = document.querySelector('#exportScopeSelectedLabel');
  const selInput = document.querySelector('#exportScopeSelectedInput');
  const selHint  = document.querySelector('#exportScopeSelHint');
  if (selCount > 0) {
    selLabel.style.opacity = '';
    selInput.disabled = false;
    selHint.textContent = `${selCount} треб.`;
  } else {
    selLabel.style.opacity = '0.4';
    selInput.disabled = true;
    selHint.textContent = 'нет выбранных';
    document.querySelector('[name=exportScope][value=all]').checked = true;
  }

  document.querySelector('#exportModal').classList.remove('hidden');
}

function closeExportModal() {
  document.querySelector('#exportModal').classList.add('hidden');
}

document.querySelector('#exportModalClose').addEventListener('click', closeExportModal);
document.querySelector('#exportModalCancel').addEventListener('click', closeExportModal);
document.querySelector('#exportModal').addEventListener('click', e => {
  if (e.target === document.querySelector('#exportModal')) closeExportModal();
});

document.querySelector('#exportModalDo').addEventListener('click', () => {
  const scope  = document.querySelector('[name=exportScope]:checked')?.value || 'all';
  const format = document.querySelector('[name=exportFormat]:checked')?.value || 'md';
  closeExportModal();

  // Build the set of requirements to export
  let reqs;
  if (scope === 'selected' && state.selectedIds.size > 0) {
    reqs = state.requirements.filter(r => state.selectedIds.has(r.id));
  } else {
    reqs = state.requirements;
  }

  if (format === 'md')         exportMarkdown(reqs);
  else if (format === 'confluence') exportConfluence(reqs);
  else if (format === 'excel') exportExcel(reqs);
});

// ── helpers ──────────────────────────────────────────────────────────────────

function downloadText(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escMd(s) {
  return String(s || '').replace(/[\\`*_{}[\]()#+\-.!|]/g, c => '\\' + c);
}

function buildHierarchy(reqs) {
  // returns { epics: [{epic, features: [{feat, reqs: [{req, stories: [{us, tcs}]}]}]}], orphanReqs }
  const result = [];
  const usedReqIds = new Set();

  for (const epic of state.epics) {
    const epicFeats = state.features.filter(f => f.epic === epic.label);
    const featNodes = [];
    for (const feat of epicFeats) {
      const featReqs = reqs.filter(r => r.feature === feat.label);
      if (!featReqs.length) continue;
      featNodes.push({ feat, reqs: featReqs.map(r => {
        usedReqIds.add(r.id);
        return { req: r, stories: buildUSNodes(r) };
      })});
    }
    if (featNodes.length) result.push({ epic, features: featNodes });
  }

  // features without epic
  const orphanFeats = state.features.filter(f => !f.epic || !state.epics.find(e => e.label === f.epic));
  for (const feat of orphanFeats) {
    const featReqs = reqs.filter(r => r.feature === feat.label && !usedReqIds.has(r.id));
    if (!featReqs.length) continue;
    result.push({ epic: null, features: [{ feat, reqs: featReqs.map(r => {
      usedReqIds.add(r.id);
      return { req: r, stories: buildUSNodes(r) };
    })}] });
  }

  // requirements without feature
  const orphanReqs = reqs.filter(r => !usedReqIds.has(r.id));
  return { nodes: result, orphanReqs: orphanReqs.map(r => ({ req: r, stories: buildUSNodes(r) })) };
}

function buildUSNodes(req) {
  return state.userStories
    .filter(u => u.requirementId === req.id)
    .map(us => ({
      us,
      tcs: state.testCases.filter(t => t.usId === us.id),
    }));
}

// ── Markdown ─────────────────────────────────────────────────────────────────

function exportMarkdown(reqs) {
  const lines = [];
  const date  = new Date().toLocaleDateString('ru-RU');
  lines.push(`# ReqTracker Export\n`);
  lines.push(`> Дата выгрузки: ${date}  \n> Требований: ${reqs.length} · US: ${state.userStories.filter(u => reqs.some(r => r.id === u.requirementId)).length} · TC: ${state.testCases.filter(t => state.userStories.find(u => u.id === t.usId && reqs.some(r => r.id === u.requirementId))).length}\n`);
  lines.push(`---\n`);

  const { nodes, orphanReqs } = buildHierarchy(reqs);

  for (const { epic, features } of nodes) {
    if (epic) {
      lines.push(`## ${escMd(epic.number)} ${escMd(epic.name)}\n`);
      if (epic.description) lines.push(`*${escMd(epic.description)}*\n`);
    }
    for (const { feat, reqs: fReqs } of features) {
      lines.push(`${ epic ? '###' : '##'} ${escMd(feat.number)} ${escMd(feat.name)}\n`);
      if (feat.description) lines.push(`*${escMd(feat.description)}*\n`);
      for (const { req, stories } of fReqs) mdReq(lines, req, stories, epic ? 4 : 3);
    }
  }
  for (const { req, stories } of orphanReqs) mdReq(lines, req, stories, 2);

  const filename = `reqtracker-export-${new Date().toISOString().slice(0, 10)}.md`;
  downloadText(filename, lines.join('\n'), 'text/markdown;charset=utf-8');
}

function mdReq(lines, req, stories, depth) {
  const h = '#'.repeat(depth);
  lines.push(`${h} ${escMd(req.code)}\n`);
  lines.push(`> ${escMd(req.text)}\n`);
  lines.push(`**Статус:** ${escMd(req.status)} | **Приоритет:** ${escMd(req.priority)} | **Владелец:** ${escMd(req.owner)} | **Источник:** ${escMd(req.source)}\n`);
  if (!stories.length) { lines.push(''); return; }
  for (const { us, tcs } of stories) {
    const uh = '#'.repeat(Math.min(depth + 1, 6));
    lines.push(`${uh} ${escMd(us.number)} ${escMd(us.title)}\n`);
    lines.push(`> Как **${escMd(us.role)}**, я хочу **${escMd(us.action)}**, чтобы **${escMd(us.goal)}**\n`);
    lines.push(`**Статус:** ${escMd(us.status)} | **Приоритет:** ${escMd(us.priority)} | **Владелец:** ${escMd(us.owner)}\n`);
    if (us.rules?.length)        lines.push(`**Бизнес-правила:**\n${us.rules.map((r,i) => `${i+1}. ${escMd(r)}`).join('\n')}\n`);
    if (us.criteria?.length)     lines.push(`**Критерии приёмки:**\n${us.criteria.map((c,i) => `${i+1}. ${escMd(c)}`).join('\n')}\n`);
    if (us.scenario?.length)     lines.push(`**Основной сценарий:**\n${us.scenario.map((s,i) => `${i+1}. ${escMd(s)}`).join('\n')}\n`);
    if (us.altScenario?.length)  lines.push(`**Альтернативный сценарий:**\n${us.altScenario.map((s,i) => `${i+1}. ${escMd(s)}`).join('\n')}\n`);
    for (const tc of tcs) {
      lines.push(`${'#'.repeat(Math.min(depth + 2, 6))} TC: ${escMd(tc.title)}\n`);
      lines.push(`**Тип:** ${tc.scenarioType === 'main' ? 'Основной' : 'Альтернативный'} | **Статус:** ${escMd(tc.status)}\n`);
      if (tc.steps?.length) {
        lines.push(`| Шаг | Ожидаемый результат | Фактический результат |`);
        lines.push(`|-----|--------------------|-----------------------|`);
        for (const s of tc.steps) lines.push(`| ${escMd(s.text)} | ${escMd(s.expected)} | ${escMd(s.actual)} |`);
        lines.push('');
      }
    }
  }
}

// ── Confluence HTML ───────────────────────────────────────────────────────────

function exportConfluence(reqs) {
  const date = new Date().toLocaleDateString('ru-RU');
  const parts = [];
  parts.push(`<h1>ReqTracker Export</h1>`);
  parts.push(`<p><em>Дата выгрузки: ${date}</em></p>`);
  parts.push(`<hr/>`);

  const { nodes, orphanReqs } = buildHierarchy(reqs);

  for (const { epic, features } of nodes) {
    if (epic) {
      parts.push(`<h2>${eh(epic.number)} ${eh(epic.name)}</h2>`);
      if (epic.description) parts.push(`<p><em>${eh(epic.description)}</em></p>`);
    }
    for (const { feat, reqs: fReqs } of features) {
      parts.push(`<h${epic ? 3 : 2}>${eh(feat.number)} ${eh(feat.name)}</h${epic ? 3 : 2}>`);
      if (feat.description) parts.push(`<p><em>${eh(feat.description)}</em></p>`);
      for (const { req, stories } of fReqs) confReq(parts, req, stories, epic ? 4 : 3);
    }
  }
  for (const { req, stories } of orphanReqs) confReq(parts, req, stories, 2);

  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"/>
<style>
body{font-family:Arial,sans-serif;max-width:960px;margin:40px auto;color:#172b4d;line-height:1.6}
h1{font-size:28px;border-bottom:2px solid #0052cc;padding-bottom:8px}
h2{font-size:22px;color:#0052cc;margin-top:36px}
h3{font-size:18px;color:#253858;margin-top:28px}
h4{font-size:15px;background:#f4f5f7;padding:8px 12px;border-left:4px solid #0052cc;margin-top:20px}
h5{font-size:14px;color:#0052cc;margin-top:16px}
h6{font-size:13px;color:#5e6c84;margin-top:12px}
table{border-collapse:collapse;width:100%;margin:8px 0 16px;font-size:13px}
th{background:#f4f5f7;padding:6px 10px;border:1px solid #dfe1e6;text-align:left;font-weight:600}
td{padding:6px 10px;border:1px solid #dfe1e6;vertical-align:top}
.meta{font-size:12px;color:#5e6c84;margin-bottom:8px}
.tag{display:inline-block;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:700;margin-right:4px}
.tag-approved{background:#e3fcef;color:#006644}
.tag-draft{background:#fffae6;color:#974f0c}
.tag-inreview{background:#e8f0fe;color:#0747a6}
.tag-changed{background:#fff0e6;color:#974f0c}
.tag-high{background:#ffebe6;color:#bf2600}
.tag-medium{background:#fffae6;color:#974f0c}
.tag-low{background:#e3fcef;color:#006644}
.tag-pass{background:#e3fcef;color:#006644}
.tag-fail{background:#ffebe6;color:#bf2600}
ul,ol{margin:4px 0;padding-left:20px}
</style>
</head><body>\n${parts.join('\n')}\n</body></html>`;

  const filename = `reqtracker-confluence-${new Date().toISOString().slice(0, 10)}.html`;
  downloadText(filename, html, 'text/html;charset=utf-8');
}

function eh(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function statusTag(s) {
  const k = (s || '').toLowerCase().replace(/\s/g,'');
  return `<span class="tag tag-${k}">${eh(s)}</span>`;
}

function confReq(parts, req, stories, depth) {
  parts.push(`<h${depth}>${eh(req.code)}</h${depth}>`);
  parts.push(`<p>${eh(req.text)}</p>`);
  parts.push(`<p class="meta">${statusTag(req.status)} ${statusTag(req.priority)} Владелец: ${eh(req.owner)} · Источник: ${eh(req.source)}</p>`);
  if (!stories.length) return;
  for (const { us, tcs } of stories) {
    const ud = Math.min(depth + 1, 6);
    parts.push(`<h${ud}>${eh(us.number)} ${eh(us.title)}</h${ud}>`);
    parts.push(`<p><em>Как <strong>${eh(us.role)}</strong>, я хочу <strong>${eh(us.action)}</strong>, чтобы <strong>${eh(us.goal)}</strong></em></p>`);
    parts.push(`<p class="meta">${statusTag(us.status)} ${statusTag(us.priority)} Владелец: ${eh(us.owner)}</p>`);

    const tableRows = [];
    if (us.rules?.length)       tableRows.push(['Бизнес-правила',       `<ol>${us.rules.map(r=>`<li>${eh(r)}</li>`).join('')}</ol>`]);
    if (us.criteria?.length)    tableRows.push(['Критерии приёмки',     `<ol>${us.criteria.map(c=>`<li>${eh(c)}</li>`).join('')}</ol>`]);
    if (us.scenario?.length)    tableRows.push(['Основной сценарий',    `<ol>${us.scenario.map(s=>`<li>${eh(s)}</li>`).join('')}</ol>`]);
    if (us.altScenario?.length) tableRows.push(['Альтернативный сценарий', `<ol>${us.altScenario.map(s=>`<li>${eh(s)}</li>`).join('')}</ol>`]);

    if (tableRows.length) {
      parts.push(`<table><tbody>${tableRows.map(([k,v])=>`<tr><th style="width:30%">${k}</th><td>${v}</td></tr>`).join('')}</tbody></table>`);
    }

    for (const tc of tcs) {
      parts.push(`<h6>TC: ${eh(tc.title)} — ${tc.scenarioType === 'main' ? 'Основной' : 'Альтернативный'} ${statusTag(tc.status)}</h6>`);
      if (tc.steps?.length) {
        parts.push(`<table><thead><tr><th>Шаг</th><th>Ожидаемый результат</th><th>Фактический результат</th></tr></thead><tbody>`);
        for (const s of tc.steps) parts.push(`<tr><td>${eh(s.text)}</td><td>${eh(s.expected)}</td><td>${eh(s.actual)}</td></tr>`);
        parts.push(`</tbody></table>`);
      }
    }
  }
}

// ── Excel ─────────────────────────────────────────────────────────────────────

function exportExcel(reqs) {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: User Stories (estimation) ──────────────────────────────────
  const usHeader = [
    'Epic', 'Feature', 'REQ', 'Текст требования',
    'US', 'Заголовок US', 'User Story (как … чтобы…)',
    'Статус', 'Приоритет', 'Владелец',
    'Бизнес-правила', 'Критерии приёмки', 'Кол-во TC',
    'Аналитик (ч)', 'Фронтенд (ч)', 'Бэкенд (ч)',
    'Тестировщик (ч)', 'Дизайнер (ч)', 'DevOps (ч)',
    'Итого (ч)', 'Комментарий',
  ];
  const usRows = [usHeader];

  const { nodes, orphanReqs } = buildHierarchy(reqs);

  function addUSRows(req, stories, epicLabel, featLabel) {
    if (!stories.length) {
      usRows.push([epicLabel, featLabel, req.code, req.text, '', '', '', req.status, req.priority, req.owner, '', '', 0, '', '', '', '', '', '', '', '']);
      return;
    }
    for (const { us, tcs } of stories) {
      usRows.push([
        epicLabel, featLabel, req.code, req.text,
        us.number, us.title,
        `Как ${us.role}, я хочу ${us.action}, чтобы ${us.goal}`,
        us.status, us.priority, us.owner,
        (us.rules || []).join('\n'),
        (us.criteria || []).join('\n'),
        tcs.length,
        '', '', '', '', '', '',
        { f: `SUM(N${usRows.length+1}:S${usRows.length+1})` },
        '',
      ]);
    }
  }

  for (const { epic, features } of nodes) {
    for (const { feat, reqs: fReqs } of features) {
      for (const { req, stories } of fReqs) {
        addUSRows(req, stories, epic ? `${epic.number} ${epic.name}` : '', `${feat.number} ${feat.name}`);
      }
    }
  }
  for (const { req, stories } of orphanReqs) addUSRows(req, stories, '', '');

  const wsUS = XLSX.utils.aoa_to_sheet(usRows);
  // Column widths
  wsUS['!cols'] = [
    {wch:22},{wch:22},{wch:10},{wch:40},{wch:8},{wch:30},{wch:45},
    {wch:12},{wch:11},{wch:18},{wch:35},{wch:35},{wch:8},
    {wch:13},{wch:13},{wch:13},{wch:14},{wch:13},{wch:13},{wch:11},{wch:25},
  ];
  // Freeze header + bold
  wsUS['!freeze'] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, wsUS, 'US — Оценка');

  // ── Sheet 2: Requirements ─────────────────────────────────────────────────
  const reqHeader = ['Epic', 'Feature', 'Код', 'Текст требования', 'Статус', 'Приоритет', 'Владелец', 'Источник', 'Кол-во US', 'Кол-во TC'];
  const reqRows = [reqHeader];
  for (const { epic, features } of nodes) {
    for (const { feat, reqs: fReqs } of features) {
      for (const { req, stories } of fReqs) {
        const tcCnt = stories.reduce((s, { tcs }) => s + tcs.length, 0);
        reqRows.push([
          epic ? `${epic.number} ${epic.name}` : '',
          `${feat.number} ${feat.name}`,
          req.code, req.text, req.status, req.priority, req.owner, req.source,
          stories.length, tcCnt,
        ]);
      }
    }
  }
  for (const { req, stories } of orphanReqs) {
    const tcCnt = stories.reduce((s, { tcs }) => s + tcs.length, 0);
    reqRows.push(['', '', req.code, req.text, req.status, req.priority, req.owner, req.source, stories.length, tcCnt]);
  }
  const wsReq = XLSX.utils.aoa_to_sheet(reqRows);
  wsReq['!cols'] = [{wch:22},{wch:22},{wch:10},{wch:50},{wch:12},{wch:11},{wch:18},{wch:18},{wch:9},{wch:9}];
  wsReq['!freeze'] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, wsReq, 'Требования');

  // ── Sheet 3: Test Cases ────────────────────────────────────────────────────
  const tcHeader = ['Epic', 'Feature', 'REQ', 'US', 'Заголовок US', 'TC', 'Тип', 'Статус', 'Шагов', 'Шаги (текст)', 'Ожидаемые результаты'];
  const tcRows = [tcHeader];
  for (const { epic, features } of nodes) {
    for (const { feat, reqs: fReqs } of features) {
      for (const { req, stories } of fReqs) {
        for (const { us, tcs } of stories) {
          for (const tc of tcs) {
            tcRows.push([
              epic ? `${epic.number} ${epic.name}` : '',
              `${feat.number} ${feat.name}`,
              req.code, us.number, us.title,
              tc.title,
              tc.scenarioType === 'main' ? 'Основной' : 'Альтернативный',
              tc.status, (tc.steps || []).length,
              (tc.steps || []).map((s,i) => `${i+1}. ${s.text}`).join('\n'),
              (tc.steps || []).map((s,i) => `${i+1}. ${s.expected}`).join('\n'),
            ]);
          }
        }
      }
    }
  }
  for (const { req, stories } of orphanReqs) {
    for (const { us, tcs } of stories) {
      for (const tc of tcs) {
        tcRows.push(['', '', req.code, us.number, us.title, tc.title,
          tc.scenarioType === 'main' ? 'Основной' : 'Альтернативный',
          tc.status, (tc.steps||[]).length,
          (tc.steps||[]).map((s,i)=>`${i+1}. ${s.text}`).join('\n'),
          (tc.steps||[]).map((s,i)=>`${i+1}. ${s.expected}`).join('\n'),
        ]);
      }
    }
  }
  const wsTC = XLSX.utils.aoa_to_sheet(tcRows);
  wsTC['!cols'] = [{wch:22},{wch:22},{wch:10},{wch:8},{wch:30},{wch:35},{wch:13},{wch:10},{wch:7},{wch:50},{wch:50}];
  wsTC['!freeze'] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, wsTC, 'Test Cases');

  const filename = `reqtracker-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// ══════════════════════════════════════════════════════════════════════════════
// GRAPH VIEW
// ══════════════════════════════════════════════════════════════════════════════

let currentMainSection = 'registry'; // 'registry' | 'graph'
let _graphZoom       = null;
let _graphSvg        = null;
let _graphRoot       = null;
let _selectedNodeId  = null;
let _linkMode        = false;
let _linkSource      = null; // nodeData объект источника
let _influenceDepth  = 1;    // кол-во кругов влияния: 1, 2, ... или Infinity

function switchMainSection(name) {
  currentMainSection = name;
  document.querySelector('#registryContent').classList.toggle('hidden', name !== 'registry');
  document.querySelector('#graphPage').classList.toggle('hidden', name !== 'graph');

  // Sidebar highlight
  document.querySelectorAll('.nav-section-header[data-section]').forEach(b => {
    const s = b.dataset.section;
    b.classList.toggle('active',
      s === 'requirements' ? name === 'registry' : s === name
    );
  });

  if (name === 'graph') renderGraphView();
}

// Update sidebar handler so graph section navigates properly
document.querySelectorAll('.nav-section-header[data-section]').forEach(btn => {
  const existing = btn.onclick;
});
// Override — re-attach after initial listener (defined earlier). We use capture.
document.querySelector('[data-section="graph"]').addEventListener('click', () => {
  switchMainSection('graph');
});
// Clicking "Реестр требований" returns to registry mode
const reqSectionBtn = document.querySelector('[data-section="requirements"]');
const _origReqClick = reqSectionBtn.onclick;
reqSectionBtn.addEventListener('click', () => {
  if (currentMainSection !== 'registry') switchMainSection('registry');
});


// ── Build hierarchy data ──────────────────────────────────────────────────────

function buildGraphTree() {
  const children = [];
  const usedReqIds = new Set();

  for (const epic of state.epics) {
    const epicFeats = state.features.filter(f => f.epic === epic.label);
    const featNodes = [];
    for (const feat of epicFeats) {
      const featNode = buildFeatTreeNode(feat, usedReqIds);
      if (featNode) featNodes.push(featNode);
    }
    children.push({
      id: `e_${epic.id}`, type: 'epic',
      label: epic.number || '', sublabel: epic.name || epic.label,
      data: epic, children: featNodes,
    });
  }

  // Orphan features
  const orphanFeats = state.features.filter(f => !f.epic || !state.epics.find(e => e.label === f.epic));
  for (const feat of orphanFeats) {
    const featNode = buildFeatTreeNode(feat, usedReqIds);
    if (featNode) children.push(featNode);
  }

  // Orphan reqs
  const orphanReqs = state.requirements.filter(r => !usedReqIds.has(r.id));
  for (const req of orphanReqs) {
    children.push(buildReqTreeNode(req));
  }

  return { id: '__root', type: 'root', children };
}

function buildFeatTreeNode(feat, usedReqIds) {
  const reqs = state.requirements.filter(r => r.feature === feat.label);
  if (!reqs.length) return null;
  const reqNodes = reqs.map(r => { usedReqIds.add(r.id); return buildReqTreeNode(r); });
  return {
    id: `f_${feat.id}`, type: 'feature',
    label: feat.number || '', sublabel: feat.name || feat.label,
    data: feat, children: reqNodes,
  };
}

function buildReqTreeNode(req) {
  const stories = state.userStories.filter(u => u.requirementId === req.id);
  return {
    id: `r_${req.id}`, type: 'req',
    label: req.code, sublabel: req.text || '',
    data: req,
    children: stories.map(us => ({
      id: `u_${us.id}`, type: 'us',
      label: us.number || '', sublabel: us.title || '',
      data: us,
      children: state.testCases.filter(t => t.usId === us.id).map(tc => ({
        id: `t_${tc.id}`, type: 'tc',
        label: 'TC', sublabel: (tc.title || '').replace(/^TC:\s*/i, ''),
        data: tc, children: [],
      })),
    })),
  };
}

// ── Render ────────────────────────────────────────────────────────────────────

const NODE_W = 148, NODE_H = 54, NODE_SEP_H = 60, NODE_SEP_V = 16;
const NODE_TEXT_PAD = 10; // горизонтальный отступ текста внутри узла

// Ищет координату y, не пересекающую ни один из заблокированных диапазонов.
function _findClearY(prefY, blocked, margin = 6) {
  if (!blocked.length) return prefY;
  const ok = y => blocked.every(([lo, hi]) => y < lo - margin || y > hi + margin);
  if (ok(prefY)) return prefY;
  const sorted = [...blocked].sort((a, b) => a[0] - b[0]);
  if (ok(sorted[0][0] - margin - 1)) return sorted[0][0] - margin - 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const c = sorted[i][1] + margin + 1;
    if (c <= sorted[i + 1][0] - margin) return c;
  }
  return sorted[sorted.length - 1][1] + margin + 1;
}

// Строит SVG-путь через точки-вершины с закруглёнными углами (квадратичные безье).
function _roundedPolyline(pts, r) {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p1 = pts[i];
    const p2 = i < pts.length - 1 ? pts[i + 1] : null;
    if (!p2) { d += ` L ${p1.x} ${p1.y}`; continue; }
    const p0 = pts[i - 1];
    const dx1 = p1.x - p0.x, dy1 = p1.y - p0.y;
    const dx2 = p2.x - p1.x, dy2 = p2.y - p1.y;
    const l1 = Math.hypot(dx1, dy1), l2 = Math.hypot(dx2, dy2);
    if (!l1 || !l2) { d += ` L ${p1.x} ${p1.y}`; continue; }
    const ar = Math.min(r, l1 / 2, l2 / 2);
    const ax = p1.x - (dx1 / l1) * ar, ay = p1.y - (dy1 / l1) * ar;
    const bx = p1.x + (dx2 / l2) * ar, by = p1.y + (dy2 / l2) * ar;
    d += ` L ${ax} ${ay} Q ${p1.x} ${p1.y} ${bx} ${by}`;
  }
  return d;
}

// Строит SVG-путь связи влияния, огибающий узлы, не участвующие в связи.
// getCorrX(idx) → x-позиция коридора с учётом назначенной полосы.
// srcYOff/tgtYOff — вертикальные смещения точки выхода/входа от центра узла.
function _routeInfluencePath(l, s, t, nodePos, getCorrX, srcYOff = 0, tgtYOff = 0) {
  const allCx = [...new Set([...nodePos.values()].map(p => p.cx))].sort((a, b) => a - b);
  const si = allCx.indexOf(s.cx), ti = allCx.indexOf(t.cx);
  const gapMid = i => (allCx[i] + allCx[i + 1]) / 2;
  const gapX   = i => getCorrX ? getCorrX(i) : gapMid(i);
  const HW = NODE_W / 2, HH = NODE_H / 2, R = 8;
  const sY = s.cy + srcYOff, tY = t.cy + tgtYOff;

  if (si === ti) {
    const gi = si < allCx.length - 1 ? si : si - 1;
    const gx = gapX(gi);
    const edgeX = gapMid(gi) > s.cx ? s.cx + HW : s.cx - HW;
    return _roundedPolyline([
      { x: edgeX, y: sY },
      { x: gx,    y: sY },
      { x: gx,    y: tY },
      { x: edgeX, y: tY },
    ], R);
  }

  const goRight = si < ti;
  const minI = goRight ? si : ti, maxI = goRight ? ti : si;
  // corrIs — индексы коридоров в порядке source→target
  const corrIs = [];
  for (let i = minI; i < maxI; i++) corrIs.push(i);
  if (!goRight) corrIs.reverse();

  const firstGapX = gapX(corrIs[0]);
  const lastGapX  = gapX(corrIs[corrIs.length - 1]);

  const srcKey = `${l.sourceType}:${l.sourceId}`;
  const tgtKey = `${l.targetType}:${l.targetId}`;
  const minCx = Math.min(s.cx, t.cx), maxCx = Math.max(s.cx, t.cx);

  const intNodes = [...nodePos.entries()]
    .filter(([k, p]) => k !== srcKey && k !== tgtKey && p.cx > minCx && p.cx < maxCx)
    .map(([, p]) => p);
  const blocked = intNodes.map(p => [p.cy - HH, p.cy + HH]);
  const travelY = _findClearY((s.cy + t.cy) / 2, blocked);

  const sEdge = { x: goRight ? s.cx + HW : s.cx - HW, y: sY };
  const tEdge = { x: goRight ? t.cx - HW : t.cx + HW, y: tY };

  const raw = [sEdge, { x: firstGapX, y: sY }];
  if (corrIs.length > 1) {
    if (Math.abs(travelY - sY) > 2) raw.push({ x: firstGapX, y: travelY });
    // Промежуточные коридоры (только горизонталь на travelY) — используем midpoint,
    // вертикальных отрезков там нет, полосы не нужны
    for (let k = 1; k < corrIs.length - 1; k++) raw.push({ x: gapMid(corrIs[k]), y: travelY });
    raw.push({ x: lastGapX, y: travelY });
  }
  if (Math.abs(tY - (corrIs.length > 1 ? travelY : sY)) > 2) raw.push({ x: lastGapX, y: tY });
  raw.push(tEdge);

  // Удаляем дубли и коллинеарные точки
  const pts = [raw[0]];
  for (let i = 1; i < raw.length; i++) {
    const prev = pts[pts.length - 1];
    if (Math.abs(raw[i].x - prev.x) < 0.5 && Math.abs(raw[i].y - prev.y) < 0.5) continue;
    if (pts.length >= 2) {
      const p0 = pts[pts.length - 2], p1 = pts[pts.length - 1], p2 = raw[i];
      if ((Math.abs(p0.x - p1.x) < 0.5 && Math.abs(p1.x - p2.x) < 0.5) ||
          (Math.abs(p0.y - p1.y) < 0.5 && Math.abs(p1.y - p2.y) < 0.5))
        { pts[pts.length - 1] = p2; continue; }
    }
    pts.push(raw[i]);
  }
  return _roundedPolyline(pts, R);
}

let _measureCtx = null;
function measureText(text, fontSize, fontWeight = 'normal') {
  if (!_measureCtx) {
    const c = document.createElement('canvas');
    _measureCtx = c.getContext('2d');
  }
  _measureCtx.font = `${fontWeight} ${fontSize}px Inter,"Segoe UI",sans-serif`;
  return _measureCtx.measureText(text).width;
}

function buildWordLines(words, maxWidth, fontSize, fontWeight) {
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (measureText(test, fontSize, fontWeight) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function fitTextInNode(textSel, text, centerY, opts = {}) {
  const { maxLines = 2, initFontSize = 11, minFontSize = 8, fontWeight = 'normal', lineH = 13 } = opts;
  const maxW = NODE_W - NODE_TEXT_PAD * 2;
  const x = NODE_W / 2;

  textSel.text('');
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (!words.length) return;

  let fontSize = initFontSize;
  let lines;

  do {
    lines = buildWordLines(words, maxW, fontSize, fontWeight);
    if (lines.length <= maxLines || fontSize <= minFontSize) break;
    fontSize--;
  } while (true);

  // Обрезаем лишние строки с многоточием
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    let last = lines[maxLines - 1];
    while (last.length > 1 && measureText(last + '…', fontSize, fontWeight) > maxW) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = last + '…';
  }

  textSel.style('font-size', fontSize + 'px');

  // Центрируем блок по вертикали относительно centerY
  const startY = centerY - (lines.length - 1) * lineH / 2;
  lines.forEach((ln, i) => {
    textSel.append('tspan').attr('x', x).attr('y', startY + i * lineH).text(ln);
  });
}

function renderGraphView() {
  const container = document.querySelector('#graphContainer');
  container.innerHTML = '';

  const treeData = buildGraphTree();
  if (!treeData.children.length) {
    container.innerHTML = '<p class="graph-empty">Загрузите данные для отображения графа связей</p>';
    return;
  }

  const svg = d3.select(container)
    .append('svg')
    .style('width', '100%')
    .style('height', '100%');

  const g = svg.append('g');

  // Zoom
  const zoom = d3.zoom().scaleExtent([0.15, 3])
    .on('zoom', ev => g.attr('transform', ev.transform));
  svg.call(zoom);
  _graphZoom = zoom;
  _graphSvg  = svg;
  _selectedNodeId = null;

  // Динамическая ширина коридоров: растём пропорционально числу линий влияния
  let dynSepH = NODE_SEP_H, dynSepV = NODE_SEP_V;
  {
    const TYPE_COL = { epic: 0, feature: 1, req: 2, us: 3, tc: 4 };
    const NCOLS = 5;
    const vertCount = new Array(NCOLS - 1).fill(0);
    const horzSide = new Map();
    state.links.forEach(l => {
      const sc = TYPE_COL[l.sourceType], tc = TYPE_COL[l.targetType];
      if (sc == null || tc == null) return;
      const gi = Math.min(sc, tc), gj = Math.max(sc, tc);
      if (gi === gj) {
        vertCount[Math.min(gi, NCOLS - 2)]++;
      } else {
        for (let i = gi; i < gj; i++) vertCount[i]++;
      }
      const srcS = sc < tc ? 'R' : sc > tc ? 'L' : (sc < NCOLS - 1 ? 'R' : 'L');
      const tgtS = sc < tc ? 'L' : sc > tc ? 'R' : srcS;
      const sk = `${l.sourceType}:${l.sourceId}:${srcS}`;
      const tk = `${l.targetType}:${l.targetId}:${tgtS}`;
      horzSide.set(sk, (horzSide.get(sk) || 0) + 1);
      horzSide.set(tk, (horzSide.get(tk) || 0) + 1);
    });
    const maxV = vertCount.length ? Math.max(...vertCount) : 0;
    const maxH = horzSide.size ? Math.max(...horzSide.values()) : 0;
    // Вертикальный коридор: LANE=12px × N линий + 16px поля
    dynSepH = Math.max(NODE_SEP_H, maxV * 12 + 16);
    // Горизонтальный коридор: spread = (maxH-1)/2*7; если выходит за пределы узла — расширяем отступ
    const hSpread = maxH <= 1 ? 0 : (maxH - 1) / 2 * 7;
    dynSepV = Math.ceil(Math.max(NODE_SEP_V, 2 * hSpread - NODE_H + 8, 0));
  }

  // D3 hierarchy + tree layout
  const root = d3.hierarchy(treeData);
  _graphRoot = root;

  const treeLayout = d3.tree()
    .nodeSize([NODE_H + dynSepV, NODE_W + dynSepH]);

  treeLayout(root);

  // Filter out invisible root node
  const nodes = root.descendants().filter(d => d.data.type !== 'root');
  const links = root.links().filter(l => l.source.data.type !== 'root');

  // Background click — сбросить выделение
  g.append('rect')
    .attr('class', 'graph-bg')
    .attr('x', -50000).attr('y', -50000)
    .attr('width', 100000).attr('height', 100000)
    .attr('fill', 'transparent')
    .on('click', resetGraphHighlight);

  // Hierarchy links
  g.selectAll('.graph-link')
    .data(links).join('path')
    .attr('class', 'graph-link')
    .attr('d', d3.linkHorizontal().x(d => d.y).y(d => d.x));

  // Карта позиций узлов: "type:entityId" → {cx, cy} (центр узла в координатах g)
  const nodePos = new Map();
  nodes.forEach(d => nodePos.set(`${d.data.type}:${d.data.data.id}`, { cx: d.y, cy: d.x }));

  const infLinks = state.links.filter(l =>
    nodePos.has(`${l.sourceType}:${l.sourceId}`) &&
    nodePos.has(`${l.targetType}:${l.targetId}`)
  );


  // Node groups
  const nodeG = g.selectAll('.graph-node')
    .data(nodes).join('g')
    .attr('class', d => `graph-node gn-${d.data.type}`)
    .attr('transform', d => `translate(${d.y - NODE_W / 2},${d.x - NODE_H / 2})`)
    .style('cursor', 'pointer')
    .on('click',    (ev, d) => { ev.stopPropagation(); _linkMode ? handleLinkClick(d.data) : highlightGraphNode(d.data.id); })
    .on('dblclick', (ev, d) => { ev.stopPropagation(); if (!_linkMode) openEntityModal(d.data); });

  // Фоновый прямоугольник: перекрывает линии под узлом, чтобы цветной rect
  // мог быть полупрозрачным без «просвечивания» связей
  nodeG.append('rect')
    .attr('class', 'gn-backdrop')
    .attr('width', NODE_W).attr('height', NODE_H)
    .attr('rx', 6).attr('ry', 6);

  // Rect
  nodeG.append('rect')
    .attr('class', d => `gn-rect gn-${d.data.type}`)
    .attr('width', NODE_W).attr('height', NODE_H)
    .attr('rx', 6).attr('ry', 6);

  // Label + sublabel — позиционируем как единый блок, центрируем вертикально
  nodeG.each(function(d) {
    const g = d3.select(this);
    const maxW = NODE_W - NODE_TEXT_PAD * 2;
    const cx   = NODE_W / 2;

    const LABEL_FS = 11, LABEL_FW = '600', LABEL_LH = 13;
    const SUB_LH = 11,   SUB_MAX  = 3,     SUB_GAP  = 3;

    // Label: 1 строка, bold
    const labelWords = String(d.data.label || '').split(/\s+/).filter(Boolean);
    const labelLines = labelWords.length
      ? buildWordLines(labelWords, maxW, LABEL_FS, LABEL_FW).slice(0, 1) : [];

    // Sublabel: подбираем минимальный шрифт, чтобы уместить в SUB_MAX строк
    const subWords = String(d.data.sublabel || '').split(/\s+/).filter(Boolean);
    let subFS = 10, subLines = [];
    if (subWords.length) {
      do {
        subLines = buildWordLines(subWords, maxW, subFS, 'normal');
        if (subLines.length <= SUB_MAX || subFS <= 8) break;
        subFS--;
      } while (true);
      if (subLines.length > SUB_MAX) {
        subLines = subLines.slice(0, SUB_MAX);
        let last = subLines[SUB_MAX - 1];
        while (last.length > 1 && measureText(last + '…', subFS, 'normal') > maxW)
          last = last.slice(0, -1);
        subLines[SUB_MAX - 1] = last + '…';
      }
    }

    // Высота всего блока и стартовая y (верх блока)
    const nL = labelLines.length, nS = subLines.length;
    const blockH = nL * LABEL_LH + (nL && nS ? SUB_GAP : 0) + nS * SUB_LH;
    const blockTop = (NODE_H - blockH) / 2;

    if (nL) {
      const t = g.append('text').attr('class', 'gn-label').style('font-size', LABEL_FS + 'px');
      labelLines.forEach((ln, i) =>
        t.append('tspan').attr('x', cx).attr('y', blockTop + (i + 0.82) * LABEL_LH).text(ln));
    }
    if (nS) {
      const subTop = blockTop + nL * LABEL_LH + (nL && nS ? SUB_GAP : 0);
      const t = g.append('text').attr('class', 'gn-sublabel').style('font-size', subFS + 'px');
      subLines.forEach((ln, i) =>
        t.append('tspan').attr('x', cx).attr('y', subTop + (i + 0.82) * SUB_LH).text(ln));
    }
  });

  // Назначаем x-полосы для вертикальных отрезков в каждом коридоре отдельно.
  // Группировка per-corridor гарантирует, что любые два пути,
  // делящие один коридор вертикально, получают разные x и никогда не накладываются.
  const _infCorrOffsets = new Map(); // linkId → Map<corridorIdx, xOffset>
  const _routeAllCx = [...new Set([...nodePos.values()].map(p => p.cx))].sort((a, b) => a - b);
  {
    const _cx = _routeAllCx;
    const LANE = 12;   // px между соседними путями (идеальный шаг)
    const MAX_OFF = Math.floor(dynSepH / 2 - 4); // половина коридора минус поля

    // Для каждой связи — список индексов коридоров с вертикальными отрезками
    const linkVertCorrs = infLinks.map(l => {
      const s = nodePos.get(`${l.sourceType}:${l.sourceId}`);
      const t = nodePos.get(`${l.targetType}:${l.targetId}`);
      const si = _cx.indexOf(s.cx), ti = _cx.indexOf(t.cx);
      if (si === ti) {
        const gi = si < _cx.length - 1 ? si : si - 1;
        return { l, vertCorrs: [gi], sortKey: Math.min(s.cy, t.cy) };
      }
      const goRight = si < ti;
      const minI = goRight ? si : ti, maxI = goRight ? ti : si;
      const corrIs = [];
      for (let i = minI; i < maxI; i++) corrIs.push(i);
      if (!goRight) corrIs.reverse();
      // Только первый и последний коридор имеют вертикальные отрезки;
      // промежуточные коридоры — лишь горизонтальный пролёт на travelY
      const vertCorrs = corrIs.length === 1
        ? [corrIs[0]]
        : [corrIs[0], corrIs[corrIs.length - 1]];
      return { l, vertCorrs, sortKey: s.cy };
    });

    // Группируем по коридору и назначаем смещения
    const byCorr = new Map();
    linkVertCorrs.forEach(info => {
      info.vertCorrs.forEach(ci => {
        if (!byCorr.has(ci)) byCorr.set(ci, []);
        byCorr.get(ci).push({ l: info.l, sortKey: info.sortKey });
      });
    });
    byCorr.forEach((items, ci) => {
      items.sort((a, b) => a.sortKey - b.sortKey);
      const n = items.length;
      // Если линий много — уменьшаем шаг, чтобы все вошли в ±MAX_OFF без дублей
      const lane = n <= 1 ? 0 : Math.min(LANE, (MAX_OFF * 2) / (n - 1));
      items.forEach(({ l }, rank) => {
        if (!_infCorrOffsets.has(l.id)) _infCorrOffsets.set(l.id, new Map());
        const off = (rank - (n - 1) / 2) * lane;
        _infCorrOffsets.get(l.id).set(ci, off);
      });
    });
  }

  // Y-смещения точек выхода/входа у рёбер узлов — разводим горизонтальные отрезки.
  const _srcYOff = new Map(); // linkId → смещение y у источника
  const _tgtYOff = new Map(); // linkId → смещение y у цели
  {
    const LANE = 7, MAX_OFF = Math.floor((NODE_H + dynSepV) / 2 - 4); // растёт вместе с коридором
    const _cx = _routeAllCx;
    const byNodeSide = new Map(); // `${nodeKey}:${side}` → [{linkId, isSrc, sortKey}]

    infLinks.forEach(l => {
      const s = nodePos.get(`${l.sourceType}:${l.sourceId}`);
      const t = nodePos.get(`${l.targetType}:${l.targetId}`);
      const si = _cx.indexOf(s.cx), ti = _cx.indexOf(t.cx);
      const srcKey = `${l.sourceType}:${l.sourceId}`;
      const tgtKey = `${l.targetType}:${l.targetId}`;

      let srcSide, tgtSide;
      if (si === ti) {
        const gi = si < _cx.length - 1 ? si : si - 1;
        const side = (_cx[gi] + _cx[gi + 1]) / 2 > s.cx ? 'R' : 'L';
        srcSide = tgtSide = side;
      } else if (si < ti) {
        srcSide = 'R'; tgtSide = 'L';
      } else {
        srcSide = 'L'; tgtSide = 'R';
      }

      const sKey = `${srcKey}:${srcSide}`;
      const tKey = `${tgtKey}:${tgtSide}`;
      if (!byNodeSide.has(sKey)) byNodeSide.set(sKey, []);
      byNodeSide.get(sKey).push({ linkId: l.id, isSrc: true,  sortKey: t.cy });
      if (!byNodeSide.has(tKey)) byNodeSide.set(tKey, []);
      byNodeSide.get(tKey).push({ linkId: l.id, isSrc: false, sortKey: s.cy });
    });

    byNodeSide.forEach(items => {
      items.sort((a, b) => a.sortKey - b.sortKey);
      const n = items.length;
      const lane = n <= 1 ? 0 : Math.min(LANE, (MAX_OFF * 2) / (n - 1));
      items.forEach(({ linkId, isSrc }, rank) => {
        const off = n === 1 ? 0 : (rank - (n - 1) / 2) * lane;
        if (isSrc) _srcYOff.set(linkId, off);
        else        _tgtYOff.set(linkId, off);
      });
    });
  }

  // Influence links — рисуем ПОСЛЕ узлов (поверх них).
  g.selectAll('.influence-link')
    .data(infLinks, l => l.id).join('path')
    .attr('class', l => `influence-link inf-link--${l.linkType}`)
    .attr('d', l => {
      const s = nodePos.get(`${l.sourceType}:${l.sourceId}`);
      const t = nodePos.get(`${l.targetType}:${l.targetId}`);
      const corrMap = _infCorrOffsets.get(l.id);
      const getCorrX = corrMap
        ? i => (_routeAllCx[i] + _routeAllCx[i + 1]) / 2 + (corrMap.get(i) || 0)
        : null;
      return _routeInfluencePath(l, s, t, nodePos, getCorrX,
        _srcYOff.get(l.id) || 0, _tgtYOff.get(l.id) || 0);
    })
    .on('click', (ev, l) => {
      ev.stopPropagation();
      if (_linkMode) return;
      openGraphLinkViewModal(l);
    });

  // Initial fit — рассчитываем из D3-данных, не из getBBox (не работает в headless)
  const W = container.clientWidth  || svg.node().clientWidth  || 1100;
  const H = container.clientHeight || svg.node().clientHeight || 650;
  const xs = nodes.map(d => d.x);
  const ys = nodes.map(d => d.y);
  const minX = Math.min(...xs) - NODE_H / 2;
  const maxX = Math.max(...xs) + NODE_H / 2;
  const minY = Math.min(...ys) - NODE_W / 2;
  const maxY = Math.max(...ys) + NODE_W / 2;
  const bW = maxY - minY;
  const bH = maxX - minX;
  const pad = 40;
  const scale = Math.min(0.95, Math.min((W - pad * 2) / (bW || 1), (H - pad * 2) / (bH || 1)));
  const tx = (W - bW * scale) / 2 - minY * scale;
  const ty = (H - bH * scale) / 2 - minX * scale;
  svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
}


// ── Link creation ──────────────────────────────────────────────────────────────
function enterLinkMode() {
  _linkMode = true;
  _linkSource = null;
  document.querySelector('#addLinkBtn').classList.add('active');
  const cnt = document.querySelector('#graphContainer');
  cnt.classList.add('link-mode');
  let hint = cnt.querySelector('.link-mode-hint');
  if (!hint) { hint = document.createElement('div'); hint.className = 'link-mode-hint'; cnt.appendChild(hint); }
  hint.textContent = 'Кликните на источник связи';
  resetGraphHighlight();
}

function exitLinkMode() {
  _linkMode = false;
  _linkSource = null;
  document.querySelector('#addLinkBtn').classList.remove('active');
  const cnt = document.querySelector('#graphContainer');
  cnt.classList.remove('link-mode');
  cnt.querySelector('.link-mode-hint')?.remove();
  d3.selectAll('.graph-node').classed('link-source', false);
}

function handleLinkClick(nodeData) {
  if (!_linkSource) {
    _linkSource = nodeData;
    d3.selectAll('.graph-node').classed('link-source', d => d.data.id === nodeData.id);
    const hint = document.querySelector('#graphContainer .link-mode-hint');
    if (hint) hint.textContent = 'Теперь кликните на цель связи (Esc — отмена)';
  } else {
    if (_linkSource.id === nodeData.id) { // повторный клик — отмена
      _linkSource = null;
      d3.selectAll('.graph-node').classed('link-source', false);
      return;
    }
    const src = _linkSource, tgt = nodeData;
    exitLinkMode();
    openGraphLinkModal(src, tgt);
  }
}

function openGraphLinkModal(srcNode, tgtNode) {
  document.getElementById('graphLinkModal')?.remove();

  const typeLabels = { epic: 'Epic', feature: 'Feature', req: 'Req', us: 'US', tc: 'TC' };

  const entityChip = (type, id) =>
    `<div class="glm-entity-chip">
      <span class="inf-ms-badge inf-ms-badge--${type}">${typeLabels[type]}</span>
      <span class="glm-entity-name">${escapeHtml(entityLabel(type, id))}</span>
    </div>`;

  const overlay = document.createElement('div');
  overlay.id = 'graphLinkModal';
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="modal modal--resizable">
      <div class="modal-header">
        <h3>Добавить связь</h3>
        <button class="modal-close" type="button" aria-label="Закрыть">✕</button>
      </div>
      <div class="modal-body">
        <div class="glm-body">
          <div class="inf-field">
            <span class="field-label">От</span>
            ${entityChip(srcNode.type, srcNode.data.id)}
          </div>
          <div class="inf-field">
            <span class="field-label">Тип связи</span>
            <select class="inf-link-type" id="glmLinkType">
              <option value="influences">Влияет на</option>
              <option value="depends_on">Зависит от</option>
            </select>
          </div>
          <div class="inf-field">
            <span class="field-label">На</span>
            ${entityChip(tgtNode.type, tgtNode.data.id)}
          </div>
          <label class="inf-field">
            <span class="field-label">Описание</span>
            <textarea class="inf-link-desc" id="glmDescription" placeholder="Описание взаимосвязи..." rows="3"></textarea>
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="button ghost" id="glmCancel" type="button">Отмена</button>
        <button class="button primary" id="glmSave" type="button">Добавить</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  enableModalKeyboard(overlay);
  enableModalResize(overlay.querySelector('.modal'));

  const close = () => overlay.remove();

  overlay.querySelector('.modal-close').addEventListener('click', close);
  overlay.querySelector('#glmCancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  overlay.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && document.activeElement !== overlay.querySelector('#glmDescription')) {
      e.preventDefault();
      overlay.querySelector('#glmSave').click();
    }
  });

  overlay.querySelector('#glmSave').addEventListener('click', () => {
    const linkType   = overlay.querySelector('#glmLinkType').value;
    const description = overlay.querySelector('#glmDescription').value.trim();
    const link = {
      id:          Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      sourceType:  srcNode.type,
      sourceId:    srcNode.data.id,
      targetType:  tgtNode.type,
      targetId:    tgtNode.data.id,
      linkType,
      description,
    };
    state.links.push(link);
    saveLinks(state.links);
    close();
    renderGraphView();
  });

  requestAnimationFrame(() => overlay.querySelector('#glmLinkType').focus());
}

function openGraphLinkViewModal(link) {
  document.getElementById('graphLinkViewModal')?.remove();

  const typeLabels = { epic: 'Epic', feature: 'Feature', req: 'Req', us: 'US', tc: 'TC' };

  const entityChip = (type, id) =>
    `<div class="glm-entity-chip">
      <span class="inf-ms-badge inf-ms-badge--${type}">${typeLabels[type]}</span>
      <span class="glm-entity-name">${escapeHtml(entityLabel(type, id))}</span>
    </div>`;

  const overlay = document.createElement('div');
  overlay.id = 'graphLinkViewModal';
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="modal modal--resizable">
      <div class="modal-header">
        <h3>Связь влияния</h3>
        <button class="modal-close" type="button" aria-label="Закрыть">✕</button>
      </div>
      <div class="modal-body">
        <div class="glm-body">
          <div class="inf-field">
            <span class="field-label">От</span>
            ${entityChip(link.sourceType, link.sourceId)}
          </div>
          <div class="inf-field">
            <span class="field-label">Тип связи</span>
            <select class="inf-link-type" id="glvLinkType">
              <option value="influences" ${link.linkType !== 'depends_on' ? 'selected' : ''}>Влияет на</option>
              <option value="depends_on" ${link.linkType === 'depends_on' ? 'selected' : ''}>Зависит от</option>
            </select>
          </div>
          <div class="inf-field">
            <span class="field-label">На</span>
            ${entityChip(link.targetType, link.targetId)}
          </div>
          <label class="inf-field">
            <span class="field-label">Описание</span>
            <textarea class="inf-link-desc" id="glvDescription" placeholder="Описание взаимосвязи..." rows="3">${escapeHtml(link.description || '')}</textarea>
          </label>
        </div>
      </div>
      <div class="modal-footer glm-view-footer">
        <button class="button danger" id="glvDelete" type="button">Удалить связь</button>
        <div style="display:flex;gap:8px">
          <button class="button ghost" id="glvClose" type="button">Отмена</button>
          <button class="button primary" id="glvSave" type="button">Сохранить</button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  enableModalKeyboard(overlay);
  enableModalResize(overlay.querySelector('.modal'));

  const close = () => overlay.remove();

  overlay.querySelector('.modal-close').addEventListener('click', close);
  overlay.querySelector('#glvClose').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  overlay.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && document.activeElement !== overlay.querySelector('#glvDescription')) {
      e.preventDefault();
      overlay.querySelector('#glvSave').click();
    }
  });

  overlay.querySelector('#glvDelete').addEventListener('click', () => {
    state.links = state.links.filter(x => x.id !== link.id);
    saveLinks(state.links);
    close();
    renderGraphView();
  });

  overlay.querySelector('#glvSave').addEventListener('click', () => {
    const linkType    = overlay.querySelector('#glvLinkType').value;
    const description = overlay.querySelector('#glvDescription').value.trim();
    const idx = state.links.findIndex(x => x.id === link.id);
    if (idx !== -1) {
      state.links[idx] = { ...state.links[idx], linkType, description };
      saveLinks(state.links);
    }
    close();
    renderGraphView();
  });

  requestAnimationFrame(() => overlay.querySelector('#glvLinkType').focus());
}

function openEntityModal(nodeData) {
  const { type, data } = nodeData;
  if (type === 'epic')         openEpicEditModal(data);
  else if (type === 'feature') openFeatureEditModal(data);
  else if (type === 'req')     openRequirementModal(data);
  else if (type === 'us')      openUSEditModal(data);
  else if (type === 'tc')      openTCEditModal(data);
}

function getCurrentGraphMode() {
  return document.querySelector('.graph-mode-btn.active')?.dataset.mode || 'all';
}

function highlightGraphNode(clickedId) {
  if (_selectedNodeId === clickedId) { resetGraphHighlight(); return; }
  _selectedNodeId = clickedId;
  document.querySelector('#graphContainer').classList.add('has-selection');

  const mode = getCurrentGraphMode();
  const relatedKeys = new Set(); // "type:entityId"

  // Находим D3-узел кликнутого элемента
  let clickedNode = null;
  _graphRoot.each(d => { if (d.data.id === clickedId) clickedNode = d; });
  if (!clickedNode) return;

  // ── Иерархические связи ──────────────────────────────────────────
  if (mode === 'hierarchy' || mode === 'all') {
    // Предки
    let cur = clickedNode;
    while (cur) {
      if (cur.data.type !== 'root') relatedKeys.add(`${cur.data.type}:${cur.data.data.id}`);
      cur = cur.parent;
    }
    // Потомки
    clickedNode.each(desc => {
      if (desc.data.type !== 'root') relatedKeys.add(`${desc.data.type}:${desc.data.data.id}`);
    });
  }

  // ── Связи влияния (BFS по ненаправленному графу) ─────────────────
  if (mode === 'influence' || mode === 'all') {
    const adj = new Map();
    state.links.forEach(l => {
      const sk = `${l.sourceType}:${l.sourceId}`;
      const tk = `${l.targetType}:${l.targetId}`;
      if (!adj.has(sk)) adj.set(sk, new Set());
      if (!adj.has(tk)) adj.set(tk, new Set());
      adj.get(sk).add(tk);
      adj.get(tk).add(sk);
    });
    const startKey = `${clickedNode.data.type}:${clickedNode.data.data.id}`;
    const queue = [{ key: startKey, depth: 0 }];
    const seen  = new Set([startKey]);
    while (queue.length) {
      const { key, depth } = queue.shift();
      relatedKeys.add(key);
      if (depth < _influenceDepth) {
        (adj.get(key) || []).forEach(nb => {
          if (!seen.has(nb)) { seen.add(nb); queue.push({ key: nb, depth: depth + 1 }); }
        });
      }
    }
  }

  // Конвертируем relatedKeys → related (graph node id)
  const related = new Set();
  _graphRoot.each(d => {
    if (d.data.type !== 'root' && relatedKeys.has(`${d.data.type}:${d.data.data.id}`))
      related.add(d.data.id);
  });

  // ── Контекстные узлы (режимы «влияние» и «все») ─────────────────
  // В режиме «влияние» дополнительно ищем косвенные influence-связи:
  // иерархические родственники related-узлов → их influence-цели → context.
  const contextIds  = new Set();
  const contextKeys = new Set();
  if (mode !== 'hierarchy') {
    // Расширенное множество «источников»: related + иерархические родственники (только влияние)
    const sourceKeys = new Set(relatedKeys);
    if (mode === 'influence') {
      _graphRoot.each(d => {
        if (d.data.type === 'root') return;
        if (!relatedKeys.has(`${d.data.type}:${d.data.data.id}`)) return;
        // предки
        let cur = d.parent;
        while (cur && cur.data.type !== 'root') {
          sourceKeys.add(`${cur.data.type}:${cur.data.data.id}`);
          cur = cur.parent;
        }
        // потомки
        d.each(desc => {
          if (desc.data.type !== 'root') sourceKeys.add(`${desc.data.type}:${desc.data.data.id}`);
        });
      });
    }

    // Для каждой influence-связи: если один конец в sourceKeys, а другой не в relatedKeys —
    // оба конца помечаем как контекст (показываем приглушённо)
    state.links.forEach(l => {
      const sk = `${l.sourceType}:${l.sourceId}`;
      const tk = `${l.targetType}:${l.targetId}`;
      const srcSrc = sourceKeys.has(sk);
      const tgtSrc = sourceKeys.has(tk);
      const srcRel = relatedKeys.has(sk);
      const tgtRel = relatedKeys.has(tk);
      if (srcSrc && !tgtRel) { contextKeys.add(sk); contextKeys.add(tk); }
      if (tgtSrc && !srcRel) { contextKeys.add(sk); contextKeys.add(tk); }
    });
    // Убираем из contextKeys то, что уже в relatedKeys (не надо дублировать)
    relatedKeys.forEach(k => contextKeys.delete(k));

    _graphRoot.each(d => {
      if (d.data.type !== 'root' && contextKeys.has(`${d.data.type}:${d.data.data.id}`))
        contextIds.add(d.data.id);
    });
  }

  // В режиме «влияние»: добавляем иерархические узлы на пути от context-узла
  // до его ближайшего related-предка (чтобы иерархическая цепочка была видна)
  if (mode === 'influence' && contextIds.size > 0) {
    const toAdd = new Set();
    contextIds.forEach(ctxId => {
      let dNode = null;
      _graphRoot.each(d => { if (d.data.id === ctxId) dNode = d; });
      if (!dNode) return;
      const path = [];
      let cur = dNode.parent;
      while (cur && cur.data.type !== 'root') {
        if (related.has(cur.data.id)) { path.forEach(id => toAdd.add(id)); break; }
        path.push(cur.data.id);
        cur = cur.parent;
      }
    });
    toAdd.forEach(id => {
      contextIds.add(id);
      _graphRoot.each(d => {
        if (d.data.id === id) contextKeys.add(`${d.data.type}:${d.data.data.id}`);
      });
    });
  }

  d3.selectAll('.graph-node')
    .classed('dimmed',      d => !related.has(d.data.id))
    .classed('gn-context',  false)
    .classed('gn-selected', d => d.data.id === clickedId);
  d3.selectAll('.graph-link')
    .classed('link-dimmed',  l => !related.has(l.source.data.id) || !related.has(l.target.data.id))
    .classed('link-context', false);
  const selKey = `${clickedNode.data.type}:${clickedNode.data.data.id}`;
  d3.selectAll('.influence-link')
    .classed('link-dimmed', l => {
      const sk = `${l.sourceType}:${l.sourceId}`;
      const tk = `${l.targetType}:${l.targetId}`;
      return !relatedKeys.has(sk) || !relatedKeys.has(tk);
    })
    .classed('link-context', false)
    .classed('inf-link--from-selected', l => `${l.sourceType}:${l.sourceId}` === selKey)
    .classed('inf-link--to-selected',   l => `${l.targetType}:${l.targetId}` === selKey);

  zoomToRelated(related);
}

function zoomToRelated(related) {
  if (!_graphRoot || !_graphSvg || !_graphZoom) return;

  // Собираем позиции связанных узлов (d.y = горизонталь, d.x = вертикаль в LR-дереве)
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  _graphRoot.each(d => {
    if (d.data.type === 'root' || !related.has(d.data.id)) return;
    x0 = Math.min(x0, d.y - NODE_W / 2);
    x1 = Math.max(x1, d.y + NODE_W / 2);
    y0 = Math.min(y0, d.x - NODE_H / 2);
    y1 = Math.max(y1, d.x + NODE_H / 2);
  });
  if (!isFinite(x0)) return;

  const container = document.querySelector('#graphContainer');
  const W = container.clientWidth  || 800;
  const H = container.clientHeight || 600;
  const pad = 64;

  const scale = Math.min(
    (W - pad * 2) / (x1 - x0),
    (H - pad * 2) / (y1 - y0),
    2.5  // не увеличиваем больше 2.5×
  );
  const tx = W / 2 - scale * ((x0 + x1) / 2);
  const ty = H / 2 - scale * ((y0 + y1) / 2);

  _graphSvg.transition().duration(500)
    .call(_graphZoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
}

function applyPassiveDim(mode) {
  d3.selectAll('.graph-node').classed('gn-selected', false).classed('gn-context', false);
  d3.selectAll('.graph-link').classed('link-dimmed', false).classed('link-context', false);
  d3.selectAll('.influence-link').classed('link-dimmed', false).classed('link-context', false);

  if (mode === 'all') {
    d3.selectAll('.graph-node').classed('dimmed', false);
    return;
  }

  if (mode === 'hierarchy') {
    // Гасим узлы без видимых иерархических связей:
    // нет не-root родителя И нет детей в дереве
    d3.selectAll('.graph-node').classed('dimmed', d => {
      const hasRealParent = d.parent && d.parent.data.type !== 'root';
      const hasChildren   = d.children && d.children.length > 0;
      return !hasRealParent && !hasChildren;
    });
    return;
  }

  if (mode === 'influence') {
    // Гасим узлы без единой связи влияния
    const infKeys = new Set();
    state.links.forEach(l => {
      infKeys.add(`${l.sourceType}:${l.sourceId}`);
      infKeys.add(`${l.targetType}:${l.targetId}`);
    });
    d3.selectAll('.graph-node').classed('dimmed',
      d => !infKeys.has(`${d.data.type}:${d.data.data.id}`)
    );
  }
}

function resetGraphHighlight() {
  _selectedNodeId = null;
  document.querySelector('#graphContainer').classList.remove('has-selection');
  d3.selectAll('.influence-link')
    .classed('inf-link--from-selected', false)
    .classed('inf-link--to-selected',   false);
  applyPassiveDim(getCurrentGraphMode());
}

document.querySelector('#addLinkBtn').addEventListener('click', () => {
  _linkMode ? exitLinkMode() : enterLinkMode();
});

document.querySelector('.graph-mode-group').addEventListener('click', ev => {
  const btn = ev.target.closest('.graph-mode-btn');
  if (!btn) return;
  document.querySelectorAll('.graph-mode-btn').forEach(b => b.classList.toggle('active', b === btn));
  const cnt = document.querySelector('#graphContainer');
  cnt.classList.remove('mode-all', 'mode-hierarchy', 'mode-influence');
  cnt.classList.add(`mode-${btn.dataset.mode}`);
  document.querySelector('#influenceDepthGroup').classList.toggle('hidden', btn.dataset.mode !== 'influence');
  if (_selectedNodeId) {
    // Перерисовываем активное выделение по правилам нового режима
    const prevId = _selectedNodeId;
    _selectedNodeId = null;
    highlightGraphNode(prevId);
  } else {
    applyPassiveDim(btn.dataset.mode);
  }
});

document.querySelector('#influenceDepthGroup').addEventListener('click', ev => {
  const btn = ev.target.closest('.graph-depth-btn');
  if (!btn) return;
  const depthInput = document.querySelector('#influenceDepthN');
  const depthBtnN  = document.querySelector('#depthBtnN');
  const val = btn.dataset.depth;
  if (val === 'n') {
    // Кнопка N прячется — на её месте появляется поле ввода
    document.querySelectorAll('.graph-depth-btn').forEach(b => b.classList.remove('active'));
    depthBtnN.classList.add('hidden');
    depthInput.classList.remove('hidden');
    depthInput.select();
    depthInput.focus();
    _influenceDepth = parseInt(depthInput.value, 10) || 3;
  } else {
    // Любая другая кнопка → скрыть поле, показать N, отметить кнопку
    depthBtnN.classList.remove('hidden');
    depthInput.classList.add('hidden');
    document.querySelectorAll('.graph-depth-btn').forEach(b => b.classList.toggle('active', b === btn));
    _influenceDepth = val === 'all' ? Infinity : parseInt(val, 10);
  }
  if (_selectedNodeId) {
    const prevId = _selectedNodeId;
    _selectedNodeId = null;
    highlightGraphNode(prevId);
  }
});

document.querySelector('#influenceDepthN').addEventListener('change', ev => {
  const val = Math.max(1, parseInt(ev.target.value, 10) || 1);
  ev.target.value = val;
  _influenceDepth = val;
  if (_selectedNodeId) {
    const prevId = _selectedNodeId;
    _selectedNodeId = null;
    highlightGraphNode(prevId);
  }
});

document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape' && _linkMode) exitLinkMode();
});

