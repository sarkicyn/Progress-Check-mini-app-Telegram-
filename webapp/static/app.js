const telegram = window.Telegram?.WebApp;
telegram?.ready();
telegram?.expand();

const state = {
  activeTab: "home",
  payload: null,
  userId: "",
  workoutFlow: {
    open: false,
    step: "list",
    items: [],
    draft: { sets: 1, reps: 8 },
    date: todayValue(),
    saving: false,
  }
};

const navButtons = document.querySelectorAll(".nav-btn");
const panels = document.querySelectorAll(".panel");
const overlay = document.getElementById("workout-overlay");

navButtons.forEach(btn =>
  btn.addEventListener("click", () => switchTab(btn.dataset.tab))
);

document.getElementById("open-workout-flow").addEventListener("click", openWorkoutFlow);
document.getElementById("close-workout-flow").addEventListener("click", closeWorkoutFlow);
document.getElementById("add-draft-item").addEventListener("click", () => setStep("form"));
document.getElementById("confirm-draft-item").addEventListener("click", saveDraftItem);
document.getElementById("save-workout-flow").addEventListener("click", handleSaveFlow);

function switchTab(tab) {
  state.activeTab = tab;
  navButtons.forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  panels.forEach(p => p.classList.toggle("active", p.dataset.panel === tab));
  document.getElementById("screen-title").textContent =
    tab === "home" ? "Главная" :
    tab === "profile" ? "Профиль" :
    tab === "records" ? "Рекорды" : "Вопросы";
}

function openWorkoutFlow() {
  state.workoutFlow.open = true;
  state.workoutFlow.step = "list";
  state.workoutFlow.items = [];
  state.workoutFlow.draft = { sets: 1, reps: 8 };
  state.workoutFlow.date = todayValue();
  overlay.hidden = false;
  renderWorkout();
}

function closeWorkoutFlow() {
  overlay.hidden = true;
  state.workoutFlow.open = false;
}

function setStep(step) {
  state.workoutFlow.step = step;
  renderWorkout();
}

function saveDraftItem() {
  const name = document.getElementById("exercise-name-input").value.trim();
  const weight = document.getElementById("exercise-weight-input").value;

  if (!name) return alert("Введите название");

  state.workoutFlow.items.push({
    exercise: name,
    weight: weight || "0",
    sets: state.workoutFlow.draft.sets,
    reps: state.workoutFlow.draft.reps,
  });

  document.getElementById("exercise-name-input").value = "";
  document.getElementById("exercise-weight-input").value = "";
  state.workoutFlow.draft = { sets: 1, reps: 8 };
  setStep("list");
}

function handleSaveFlow() {
  if (state.workoutFlow.step === "list") return setStep("date");
  if (state.workoutFlow.step === "date") return submitWorkout();
  if (state.workoutFlow.step === "done") closeWorkoutFlow();
}

function renderWorkout() {
  document.querySelectorAll(".modal-step")
    .forEach(s => s.classList.toggle("active", s.dataset.step === state.workoutFlow.step));

  document.getElementById("sets-value").textContent = state.workoutFlow.draft.sets;
  document.getElementById("reps-value").textContent = state.workoutFlow.draft.reps;
  document.getElementById("workout-date-input").value = state.workoutFlow.date;
  document.getElementById("date-preview").textContent = formatDate(state.workoutFlow.date);
}

async function submitWorkout() {
  state.workoutFlow.step = "done";
  document.getElementById("saved-summary").textContent =
    Упражнений: ${state.workoutFlow.items.length};

  // 🔥 СБРОС ПОСЛЕ СОХРАНЕНИЯ
  state.workoutFlow.items = [];
  state.workoutFlow.draft = { sets: 1, reps: 8 };
  state.workoutFlow.date = todayValue();

  renderWorkout();
}

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(v) {
  const [y, m, d] = v.split("-");
  return ${d}.${m}.${y.slice(2)};
}
