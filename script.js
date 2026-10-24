const $ = (selector) => document.querySelector(selector);

const defaultSkills = [
  { name: "HTML", desc: "Structure of web pages", level: 75 },
  { name: "CSS", desc: "Styling and responsive design", level: 60 },
  { name: "JavaScript", desc: "Logic and interactivity", level: 35 },
  { name: "React", desc: "Modern frontend development", level: 15 },
  { name: "DSA", desc: "Problem solving and algorithms", level: 20 }
];

const defaultRoadmap = [
  { title: "01 · Web Fundamentals", desc: "Learn HTML, CSS, JavaScript and responsive design.", duration: "2–4 weeks" },
  { title: "02 · Programming & DSA", desc: "Practice arrays, strings, sorting and basic algorithms.", duration: "4–8 weeks" },
  { title: "03 · Frontend Development", desc: "Learn React, components, state and API integration.", duration: "4–6 weeks" },
  { title: "04 · Build Projects", desc: "Create a portfolio and two practical web applications.", duration: "3–5 weeks" },
  { title: "05 · Interview Preparation", desc: "Practice aptitude, coding questions and mock interviews.", duration: "Ongoing" },
  { title: "06 · Apply for Jobs", desc: "Prepare your resume and apply for internships and placements.", duration: "Ongoing" }
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function load(key, fallback) {
  try {
    const saved = localStorage.getItem("skilltrack-" + key);
    return saved === null ? clone(fallback) : JSON.parse(saved);
  } catch (error) {
    console.error("Load error:", error);
    return clone(fallback);
  }
}

let skills = load("skills", defaultSkills);
let projects = load("projects", []);
let certificates = load("certificates", []);
let checklist = load("checklist", [false, false, false, false]);
let roadmapDone = load("roadmap", []);

if (!Array.isArray(skills)) skills = clone(defaultSkills);
if (!Array.isArray(projects)) projects = [];
if (!Array.isArray(certificates)) certificates = [];
if (!Array.isArray(checklist)) checklist = [false, false, false, false];
if (!Array.isArray(roadmapDone)) roadmapDone = [];

function save(key, value) {
  try {
    localStorage.setItem("skilltrack-" + key, JSON.stringify(value));
  } catch (error) {
    console.error("Save error:", error);
    alert("Data save nahi ho paya. Browser storage check karein.");
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Safe element access
function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
}

function setHTML(selector, value) {
  const element = $(selector);
  if (element) element.innerHTML = value;
}

// ===== PAGE NAVIGATION =====
function showPage(id) {
  if (!id) return;

  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === id);
  });

  document.querySelectorAll(".nav").forEach(button => {
    button.classList.toggle("active", button.dataset.page === id);
  });

  const activeButton = document.querySelector(
    '.nav[data-page="${id}"]'
  );

  setText(
    "#page-title",
    activeButton
      ? activeButton.textContent.replace(/^[^\w]+/, "").trim()
      : "Dashboard"
  );

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", event => {
  const pageButton = event.target.closest("[data-page]");
  const goButton = event.target.closest("[data-go]");

  if (pageButton) {
    event.preventDefault();
    showPage(pageButton.dataset.page);
    return;
  }

  if (goButton) {
    event.preventDefault();
    showPage(goButton.dataset.go);
  }
});

// ===== SKILLS =====
function skillRow(skill) {
  const level = Math.min(100, Math.max(0, Number(skill.level) || 0));

  return `
    <div class="skill-row">
      <div class="skill-info">
        <span>${escapeHTML(skill.name)}</span>
        <span>${level}%</span>
      </div>
      <div class="track">
        <div class="fill" style="width:${level}%"></div>
      </div>
    </div>`;
}

function renderSkills() {
  setHTML(
    "#dashboard-skills",
    skills.slice(0, 4).map(skillRow).join("")
  );

  setHTML(
    "#all-skills",
    skills.map((skill, index) => {
      const level = Math.min(100, Math.max(0, Number(skill.level) || 0));

      return `
        <div class="skill-edit">
          <div>
            <strong>${escapeHTML(skill.name)}</strong>
            <p>${escapeHTML(skill.desc)}</p>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value="${level}"
            data-skill="${index}"
            aria-label="${escapeHTML(skill.name)} progress"
          >

          <span class="percent">${level}%</span>
        </div>`;
    }).join("")
  );

  setText("#skill-count", skills.length);
}

document.addEventListener("input", event => {
  const input = event.target.closest("[data-skill]");
  if (!input) return;

  const index = Number(input.dataset.skill);
  if (!skills[index]) return;

  skills[index].level = Number(input.value);

  const percent = input.parentElement.querySelector(".percent");
  if (percent) percent.textContent = input.value + "%";

  save("skills", skills);
  renderDashboard();
});

// ===== PLACEMENT CHECKLIST =====
function renderChecklist() {
  const tasks = [
    "Complete a programming language",
    "Practice DSA questions",
    "Build practical projects",
    "Prepare resume and interview"
  ];

  setHTML(
    "#checklist",
    tasks.map((task, index) => `
      <label class="check-row">
        <input
          type="checkbox"
          data-check="${index}"
          ${checklist[index] ? "checked" : ""}
        >
        <span>${task}</span>
      </label>
    `).join("")
  );
}

document.addEventListener("change", event => {
  const input = event.target.closest("[data-check]");
  if (!input) return;

  checklist[Number(input.dataset.check)] = input.checked;
  save("checklist", checklist);
  renderDashboard();
});

// ===== DASHBOARD =====
function renderDashboard() {
  const average = skills.length
    ? Math.round(
        skills.reduce(
          (sum, skill) => sum + (Number(skill.level) || 0), 0
        ) / skills.length
      )
    : 0;

  const completed = checklist.filter(Boolean).length;
  const checklistPercent = Math.round(completed / checklist.length * 100);
  const readiness = Math.round(average * 0.7 + checklistPercent * 0.3);

  setText("#project-count", projects.length);
  setText("#cert-count", certificates.length);
  setText("#readiness", readiness + "%");
}

// ===== ROADMAP =====
function renderRoadmap() {
  setHTML(
    "#roadmap-list",
    defaultRoadmap.map((item, index) => `
      <article class="roadmap-card">
        <small>${escapeHTML(item.duration)}</small>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.desc)}</p>

        <label class="check-row">
          <input
            type="checkbox"
            data-roadmap="${index}"
            ${roadmapDone[index] ? "checked" : ""}
          >
          <span>${roadmapDone[index] ? "Completed" : "Mark as completed"}</span>
        </label>
      </article>
    `).join("")
  );
}

document.addEventListener("change", event => {
  const input = event.target.closest("[data-roadmap]");
  if (!input) return;

  roadmapDone[Number(input.dataset.roadmap)] = input.checked;
  save("roadmap", roadmapDone);
  renderRoadmap();
});

// ===== PROJECTS =====
function renderProjects() {
  setHTML(
    "#project-list",
    projects.length
      ? projects.map((project, index) => `
          <article class="item-card">
            <small>PROJECT ${index + 1}</small>
            <h3>${escapeHTML(project.name)}</h3>
            <p>${escapeHTML(project.tech)}</p>
            <button type="button" class="delete"
              data-delete-project="${index}">Delete</button>
          </article>
        `).join("")
      : '<article class="item-card"><p>No projects added yet. Add your first project above.</p></article>'
  );
}

$("#project-form")?.addEventListener("submit", event => {
  event.preventDefault();

  const name = $("#project-name")?.value.trim() || "";
  const tech = $("#project-tech")?.value.trim() || "";

  if (!name) {
    alert("Project ka naam likhein.");
    return;
  }

  projects.push({ name, tech });
  save("projects", projects);
  event.target.reset();
  renderProjects();
  renderDashboard();
});

document.addEventListener("click", event => {
  const button = event.target.closest("[data-delete-project]");
  if (!button) return;

  projects.splice(Number(button.dataset.deleteProject), 1);
  save("projects", projects);
  renderProjects();
  renderDashboard();
});

// ===== CERTIFICATES =====
function renderCertificates() {
  setHTML(
    "#certificate-list",
    certificates.length
      ? certificates.map((cert, index) => `
          <article class="item-card">
            <small>CERTIFICATE ${index + 1}</small>
            <h3>${escapeHTML(cert.name)}</h3>
            <p>Issued by: ${escapeHTML(cert.provider)}</p>
            <button type="button" class="delete"
              data-delete-cert="${index}">Delete</button>
          </article>
        `).join("")
      : '<article class="item-card"><p>No certificates added yet. Add a completed course above.</p></article>'
  );
}

$("#certificate-form")?.addEventListener("submit", event => {
  event.preventDefault();

  const name = $("#cert-name")?.value.trim() || "";
  const provider = $("#cert-provider")?.value.trim() || "";

  if (!name) {
    alert("Certificate ka naam likhein.");
    return;
  }

  certificates.push({ name, provider });
  save("certificates", certificates);
  event.target.reset();
  renderCertificates();
  renderDashboard();
});

document.addEventListener("click", event => {
  const button = event.target.closest("[data-delete-cert]");
  if (!button) return;

  certificates.splice(Number(button.dataset.deleteCert), 1);
  save("certificates", certificates);
  renderCertificates();
  renderDashboard();
});

// ===== INITIALIZE =====
function initialize() {
  renderSkills();
  renderChecklist();
  renderRoadmap();
  renderProjects();
  renderCertificates();
  renderDashboard();

  console.log("SkillTrack loaded successfully!");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}