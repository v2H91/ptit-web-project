(function () {
  // ===== Helpers =====
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const on = (el, evt, cb) => el && el.addEventListener(evt, cb);
  const H = (str) =>
    String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, '&quot;')
      .replace(/'/g, "&#39;");
  const avg = (arr) => {
    if (!arr.length) return 0;
    const s = arr.reduce((a, b) => a + Number(b || 0), 0);
    return Math.round((s / arr.length) * 100) / 100;
  };
  const isCapsOn = (e) => e.getModifierState && e.getModifierState("CapsLock");
  const showToast = (message) => {
    const el = $("#liveToast");
    if (!el) return alert(message);
    $("#toastBody").textContent = message;
    new bootstrap.Toast(el, { delay: 2200 }).show();
  };

  // ===== Login =====
  const form = $("#loginForm");
  if (form) {
    const btn = $("#submitBtn");
    const spinner = btn?.querySelector(".spinner-border");
    const btnLabel = btn?.querySelector(".btn-label");
    const user = $("#username");
    const pw = $("#password");
    const togglePw = $("#togglePw");
    const capsHint = $("#capsHint");

    on(togglePw, "click", () => {
      const type = pw.getAttribute("type") === "password" ? "text" : "password";
      pw.setAttribute("type", type);
      togglePw.firstElementChild.classList.toggle("bi-eye");
      togglePw.firstElementChild.classList.toggle("bi-eye-slash");
      pw.focus();
    });

    on(pw, "keyup", (e) => capsHint?.classList.toggle("active", isCapsOn(e)));

    on(form, "submit", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }
      if (btn) btn.disabled = true;
      spinner?.classList.remove("d-none");
      if (btnLabel) btnLabel.textContent = "Đang đăng nhập…";

      setTimeout(() => {
        const u = user.value.trim();
        const p = pw.value;
        if (u === "admin" && p === "123456") {
          const remember = $("#remember")?.checked;
          const payload = { username: u, ts: Date.now() };
          localStorage.setItem("demo_session", JSON.stringify(payload));
          if (remember) localStorage.setItem("demo_remember", "1");
          showToast("Đăng nhập thành công!");
          location.href = "dashboard.html";
        } else {
          showToast("Sai tài khoản hoặc mật khẩu");
        }
        if (btn) btn.disabled = false;
        spinner?.classList.add("d-none");
        if (btnLabel) btnLabel.textContent = "Đăng nhập";
      }, 600);
    });
    return; // chỉ chạy khối login trong trang login
  }

  // ===== Route Guard (Dashboard) =====
  if (!location.pathname.endsWith("dashboard.html")) return;
  const session = localStorage.getItem("demo_session");
  if (!session) {
    location.replace("index.html");
    return;
  }
  try {
    const { username } = JSON.parse(session);
    $$("[data-username]").forEach((el) => (el.textContent = username));
  } catch {}

  on($("#btnLogout"), "click", () => {
    localStorage.removeItem("demo_session");
    localStorage.removeItem("demo_remember");
    location.replace("index.html");
  });

  // ===== Data =====
  const seedSubjects = () => [
    { code: "MON1", name: "Toán rời rạc", score: 7.0 },
    { code: "MON2", name: "Cấu trúc dữ liệu", score: 6.5 },
    { code: "MON3", name: "Cơ sở dữ liệu", score: 7.2 },
    { code: "MON4", name: "Lập trình Web", score: 8.0 },
    { code: "MON5", name: "Mạng máy tính", score: 6.8 },
    { code: "MON6", name: "Hệ điều hành", score: 6.9 },
    { code: "MON7", name: "Tiếng Anh", score: 7.5 },
  ];
  const emptySubjects = () => [
    { code: "MON1", name: "Toán rời rạc", score: 0 },
    { code: "MON2", name: "Cấu trúc dữ liệu", score: 0 },
    { code: "MON3", name: "Cơ sở dữ liệu", score: 0 },
    { code: "MON4", name: "Lập trình Web", score: 0 },
    { code: "MON5", name: "Mạng máy tính", score: 0 },
    { code: "MON6", name: "Hệ điều hành", score: 0 },
    { code: "MON7", name: "Tiếng Anh", score: 0 },
  ];
  const makeGrades = (withSample = true) => ({
    2023: {
      "1": { subjects: withSample ? seedSubjects() : emptySubjects() },
      "2": { subjects: withSample ? seedSubjects() : emptySubjects() },
    },
    2024: { "1": { subjects: emptySubjects() }, "2": { subjects: emptySubjects() } },
    2025: { "1": { subjects: emptySubjects() }, "2": { subjects: emptySubjects() } },
  });

  const rawStudents = [
    { code: "SV001", name: "Nguyễn Thành Đô", class: "KTPM01", conduct: "Tốt", grades: makeGrades(true) },
    { code: "SV002", name: "Vũ Văn Hùng", class: "KTPM01", conduct: "Khá", grades: makeGrades(true) },
    { code: "SV003", name: "Nguyễn Thị Hồng Thắm", class: "CNTT02", conduct: "Trung bình", grades: makeGrades(true) },
    { code: "SV004", name: "Trần Thế Linh", class: "CNTT02", conduct: "Tốt", grades: makeGrades(true) },
  ];

  // ===== Storage =====
  const LS_KEY_CLASSES = "demo_classes";
  const LS_KEY_OLD = "demo_students";

  const loadClasses = () => {
    try {
      const s = localStorage.getItem(LS_KEY_CLASSES);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  };
  const saveClasses = () => localStorage.setItem(LS_KEY_CLASSES, JSON.stringify(classes));

  (function migrateIfNeeded() {
    if (loadClasses()) return;
    const old = localStorage.getItem(LS_KEY_OLD);
    if (!old) return;
    try {
      const arr = JSON.parse(old) || [];
      const map = {};
      arr.forEach((s) => {
        if (!s.grades) s.grades = makeGrades(true);
        const cls = s.class || "CHUA_PHAN_LOP";
        (map[cls] ??= []).push(s);
      });
      localStorage.setItem(LS_KEY_CLASSES, JSON.stringify(map));
      localStorage.removeItem(LS_KEY_OLD);
    } catch {}
  })();

  let classes = loadClasses() || {};
  if (!Object.keys(classes).length) {
    rawStudents.forEach((s) => (classes[s.class] ??= []).push(s));
    saveClasses();
  }

  // ===== State & Refs =====
  let currentClass = null;
  const classList = $("#classList");
  const currentClassName = $("#currentClassName");
  const tbody = $("#studentBody");
  const statCount = $("#statCount");
  const statAvg = $("#statAvg");
  const statGood = $("#statGood");
  const statWarn = $("#statWarn");
  const searchBox = $("#searchBox");
  const btnAdd = $("#btnAdd");

  // ===== Domain =====
  const semesterAvg = (sem) => avg((sem?.subjects || []).map((x) => x.score));
  const studentOverallAvg = (stu) => {
    const scores = [];
    Object.keys(stu.grades || {}).forEach((y) => {
      ["1", "2"].forEach((k) => (stu.grades?.[y]?.[k]?.subjects || []).forEach((m) => scores.push(m.score)));
    });
    return avg(scores);
  };
  const ensureClassExists = (cls) => (classes[cls] ??= []);
  const ensureStudentGrades = (stu) => {
    if (!stu.grades) stu.grades = makeGrades(true);
    ["2023", "2024", "2025"].forEach((y) => {
      if (!stu.grades[y]) stu.grades[y] = { "1": { subjects: emptySubjects() }, "2": { subjects: emptySubjects() } };
      if (!stu.grades[y]["1"]) stu.grades[y]["1"] = { subjects: emptySubjects() };
      if (!stu.grades[y]["2"]) stu.grades[y]["2"] = { subjects: emptySubjects() };
    });
  };

  // ===== Render: Lớp =====
  const updateHeader = () => currentClassName && (currentClassName.textContent = currentClass || "(chưa chọn)");
  const renderClassList = () => {
    if (!classList) return;
    classList.innerHTML = "";
    const clsNames = Object.keys(classes).sort((a, b) => a.localeCompare(b, "vi", { numeric: true }));
    clsNames.forEach((cls) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
      btn.dataset.cls = cls;
      btn.innerHTML = `<span>${H(cls)}</span><span class="badge bg-secondary">${(classes[cls] || []).length}</span>`;
      if (cls === currentClass) btn.classList.add("active");
      classList.appendChild(btn);
    });
    if (!currentClass && clsNames.length) currentClass = clsNames[0];
    updateHeader();
  };

  // ===== Render: Bảng =====
  const updateStats = (list) => {
    const count = list.length;
    const avgAll = count ? avg(list.map(studentOverallAvg)) : 0;
    const good = list.filter((s) => s.conduct === "Tốt").length;
    const warn = list.filter((s) => studentOverallAvg(s) < 5).length;
    statCount.textContent = count;
    statAvg.textContent = avgAll.toFixed(2);
    statGood.textContent = good;
    statWarn.textContent = warn;
  };

  const renderTable = (list) => {
    tbody.innerHTML = "";
    list.forEach((s, i) => {
      const mean = studentOverallAvg(s);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="text-nowrap"><span class="badge badge-soft">${H(s.code)}</span></td>
        <td><button class="btn btn-link p-0 text-decoration-none" data-act="view" data-idx="${i}">${H(s.name)}</button></td>
        <td>${H(s.class)}</td>
        <td class="text-center ${mean < 5 ? "text-danger fw-bold" : ""}">${mean.toFixed(2)}</td>
        <td class="text-center">${H(s.conduct)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-info me-1" data-act="view" data-idx="${i}"><i class="bi bi-eye"></i></button>
          <button class="btn btn-sm btn-outline-light me-1" data-act="edit" data-idx="${i}"><i class="bi bi-pencil-square"></i></button>
          <button class="btn btn-sm btn-outline-danger" data-act="del" data-idx="${i}"><i class="bi bi-trash"></i></button>
        </td>`;
      tbody.appendChild(tr);
    });
    updateStats(list);
  };

  const renderTableByClass = () => renderTable(currentClass ? classes[currentClass] || [] : []);

  // ===== Tìm kiếm =====
  on(searchBox, "input", () => {
    const q = searchBox.value.trim().toLowerCase();
    const list = currentClass ? classes[currentClass] || [] : [];
    const filtered = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.class.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
    );
    renderTable(filtered);
  });

  // ===== Chọn lớp =====
  on(classList, "click", (e) => {
    const btn = e.target.closest("button");
    if (!btn?.dataset.cls) return;
    currentClass = btn.dataset.cls;
    renderClassList();
    renderTableByClass();
    if (searchBox) searchBox.value = "";
  });

  // ===== Modal SV =====
  const studentModal = new bootstrap.Modal($("#studentModal"));
  const studentForm = $("#studentForm");
  const idxEl = $("#idx");
  const svName = $("#svName");
  const svCode = $("#svCode");
  const svClass = $("#svClass");
  const svConduct = $("#svConduct");
  const modalTitle = $("#modalTitle");

  on($("#btnAdd"), "click", () => {
    modalTitle.textContent = "Thêm sinh viên";
    idxEl.value = "";
    studentForm.reset();
    studentForm.classList.remove("was-validated");
    if (currentClass) svClass.value = currentClass;
    svName?.focus();
    studentModal.show();
  });

  const openEdit = (i) => {
    modalTitle.textContent = "Sửa sinh viên";
    const s = (classes[currentClass] || [])[i];
    idxEl.value = i;
    svName.value = s.name;
    svCode.value = s.code;
    svClass.value = s.class;
    svConduct.value = s.conduct;
    studentForm.classList.remove("was-validated");
    svName?.focus();
    studentModal.show();
  };

  // ===== Modal Chi tiết điểm =====
const gradeDetailModal = new bootstrap.Modal($("#gradeDetailModal"));
const detailTitle        = $("#detailTitle");
const detailYearPills    = $("#detailYearPills");
const detailSemPills     = $("#detailSemPills");
const detailSubjectsBody = $("#detailSubjectsBody");
const detailAvg          = $("#detailAvg");

// Form nhập môn
const gradeForm  = $("#gradeForm");
const codeInput  = $("#subjectCode");
const nameInput  = $("#subjectName");
const scoreInput = $("#subjectScore");
const addBtn     = $("#addSubjectBtn");

// Chèn nút Xuất Excel (CSV) vào footer nếu chưa có
const modalFooter = $("#gradeDetailModal .modal-footer");
let exportBtn = $("#exportExcelBtn");
if (!exportBtn && modalFooter) {
  exportBtn = document.createElement("button");
  exportBtn.id = "exportExcelBtn";
  exportBtn.type = "button";
  exportBtn.className = "btn btn-outline-success";
  exportBtn.innerHTML = `<i class="bi bi-file-earmark-spreadsheet"></i> Xuất Excel`;
  modalFooter.insertBefore(exportBtn, modalFooter.lastElementChild); // đặt trước nút Lưu
}

// Cấu hình năm/kỳ
const YEARS = ["2023", "2024", "2025"];
const SEMS  = ["1", "2"];

// State modal
let stuRef = null;
let curYear = YEARS[0];
let curSem  = "1";

const toFixed2 = (n) => (Math.round(Number(n) * 100) / 100).toFixed(2);

function getCurrentSemObj() {
  if (!stuRef.grades[curYear]) stuRef.grades[curYear] = {};
  if (!stuRef.grades[curYear][curSem]) stuRef.grades[curYear][curSem] = { subjects: [] };
  if (!Array.isArray(stuRef.grades[curYear][curSem].subjects)) stuRef.grades[curYear][curSem].subjects = [];
  return stuRef.grades[curYear][curSem];
}

function recomputeAvg(semObj) {
  const arr = semObj.subjects || [];
  if (!arr.length) return "0.00";
  const sum = arr.reduce((acc, s) => acc + Number(s.score || 0), 0);
  return toFixed2(sum / arr.length);
}

function repaintTable() {
  const semObj = getCurrentSemObj();
  detailSubjectsBody.innerHTML = "";

  (semObj.subjects || []).forEach((m, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${H(m.code)}</td>
      <td>${H(m.name)}</td>
      <td class="text-center">${toFixed2(m.score)}</td>
      <td class="text-center">
        <button type="button" class="btn btn-sm btn-outline-danger" data-index="${idx}">
          <i class="bi bi-trash"></i>
        </button>
      </td>`;
    detailSubjectsBody.appendChild(tr);
  });

  // Xoá dòng
  $$('button[data-index]', detailSubjectsBody).forEach(btn => {
    on(btn, 'click', () => {
      const i = Number(btn.dataset.index);
      getCurrentSemObj().subjects.splice(i, 1);
      repaintTable();
      detailAvg.textContent = recomputeAvg(getCurrentSemObj());
    });
  });

  detailAvg.textContent = recomputeAvg(getCurrentSemObj());
}

function renderYearPills() {
  detailYearPills.innerHTML = "";
  YEARS.forEach((y) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn btn-outline-light btn-sm me-2 mb-2";
    if (y === curYear) b.classList.add("active");
    b.textContent = y;
    b.dataset.year = y;
    detailYearPills.appendChild(b);
  });

  detailYearPills.onclick = (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    curYear = b.dataset.year;
    // nếu muốn giữ kỳ hiện tại khi đổi năm, comment dòng dưới
    curSem = "1";
    [...detailYearPills.children].forEach(ch => ch.classList.remove("active"));
    b.classList.add("active");
    renderSemPills();
    updateTitle();
    repaintTable();
  };
}

function renderSemPills() {
  detailSemPills.innerHTML = "";
  SEMS.forEach((k) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn btn-outline-info btn-sm me-2 mb-2";
    if (k === curSem) b.classList.add("active");
    b.textContent = `Kỳ ${k}`;
    b.dataset.sem = k;
    detailSemPills.appendChild(b);
  });

  detailSemPills.onclick = (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    curSem = b.dataset.sem;
    [...detailSemPills.children].forEach(ch => ch.classList.remove("active"));
    b.classList.add("active");
    updateTitle();
    repaintTable();
  };
}

function updateTitle() {
  detailTitle.textContent = `${stuRef.name} • ${stuRef.code} • ${stuRef.class} • ${curYear} • Kỳ ${curSem}`;
}

function addSubject() {
  if (!gradeForm.checkValidity()) {
    gradeForm.classList.add("was-validated");
    return;
  }
  const code  = codeInput.value.trim();
  const name  = nameInput.value.trim();
  const score = parseFloat(scoreInput.value);

  if (Number.isNaN(score) || score < 0 || score > 10) {
    scoreInput.setCustomValidity("Điểm phải từ 0 đến 10.");
    gradeForm.classList.add("was-validated");
    return;
  } else {
    scoreInput.setCustomValidity("");
  }

  const semObj = getCurrentSemObj();
  semObj.subjects.push({ code, name, score });
  repaintTable();

  codeInput.value = "";
  nameInput.value = "";
  scoreInput.value = "";
  codeInput.focus();
}

on(addBtn, "click", addSubject);

// ===== Xuất Excel (CSV) tất cả năm/kỳ =====
function exportAllGradesCSV() {
  if (!stuRef) return;

  // Header
  const rows = [
    [`Student Name`, stuRef.name],
    [`Student Code`, stuRef.code],
    [`Class`, stuRef.class],
    [""],
    ["Year", "Semester", "Subject Code", "Subject Name", "Score"]
  ];

  YEARS.forEach(y => {
    // nếu dữ liệu có nhiều năm ngoài YEARS, có thể lấy Object.keys(stuRef.grades)
    const sems = SEMS;
    sems.forEach(s => {
      const semObj = (stuRef.grades?.[y]?.[s]) || { subjects: [] };
      (semObj.subjects || []).forEach(sub => {
        rows.push([y, `Kỳ ${s}`, sub.code ?? "", sub.name ?? "", Number(sub.score ?? 0)]);
      });
    });
  });

  // CSV với BOM cho Excel hiểu UTF-8
  const csv = rows.map(r =>
    r.map(v => {
      const t = String(v ?? "");
      // nếu có dấu phẩy, xuống dòng hoặc dấu " thì bọc trong " và escape "
      return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
    }).join(",")
  ).join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const ts = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const fname = `grades_${(stuRef.code || "SV").replace(/\W+/g, "_")}_${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.csv`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

on(exportBtn, "click", exportAllGradesCSV);

// Submit (Lưu) — bắn event ra ngoài cho trang tổng xử lý
on(gradeForm, "submit", (e) => {
  e.preventDefault();
  e.stopPropagation();

  const payload = {
    student: { name: stuRef.name, code: stuRef.code, class: stuRef.class },
    year: curYear,
    semester: curSem,
    subjects: getCurrentSemObj().subjects.map(s => ({ code: s.code, name: s.name, score: Number(s.score) })),
    average: Number(detailAvg.textContent)
  };

  window.dispatchEvent(new CustomEvent('gradeModal:save', { detail: payload }));
  gradeDetailModal.hide();
});

// Mở modal chi tiết điểm
const openDetail = (stu) => {
  ensureStudentGrades(stu);
  stuRef = stu;

  curYear = YEARS[0];
  curSem  = "1";

  gradeForm?.reset();
  gradeForm?.classList.remove("was-validated");

  renderYearPills();
  renderSemPills();
  updateTitle();
  repaintTable();

  gradeDetailModal.show();
};

  // ===== Bảng: click & dblclick =====
  on(tbody, "click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const act = btn.dataset.act;
    const i = Number(btn.dataset.idx);
    if (!currentClass) return showToast("Hãy chọn lớp trước");

    if (act === "view") {
      openDetail(classes[currentClass][i]);
    } else if (act === "edit") {
      openEdit(i);
    } else if (act === "del") {
      if (confirm("Xóa sinh viên này?")) {
        classes[currentClass].splice(i, 1);
        saveClasses();
        renderClassList();
        renderTableByClass();
        showToast("Đã xóa sinh viên");
      }
    }
  });

  on(tbody, "dblclick", (e) => {
    if (!currentClass) return;
    const row = e.target.closest("tr");
    if (!row) return;
    const idx = [...tbody.children].indexOf(row);
    if (idx >= 0) openDetail(classes[currentClass][idx]);
  });

  // ===== Submit form SV =====
  on(studentForm, "submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!studentForm.checkValidity()) {
      studentForm.classList.add("was-validated");
      return;
    }

    const data = {
      code: H($("#svCode").value.trim()),
      name: H($("#svName").value.trim()),
      class: H($("#svClass").value.trim()),
      conduct: H($("#svConduct").value.trim()),
    };

    ensureClassExists(data.class);
    ensureStudentGrades(data);

    const i = $("#idx").value;

    if (i === "") {
      if (classes[data.class].some((s) => s.code === data.code)) {
        showToast("Mã SV đã tồn tại trong lớp này");
        return;
      }
      classes[data.class].push(data);
      currentClass = data.class;
      showToast("Đã thêm sinh viên");
    } else {
      const oldList = classes[currentClass] || [];
      const old = oldList[Number(i)];
      const oldClass = old.class;

      if (data.class !== oldClass || data.code !== old.code) {
        if (classes[data.class].some((s) => s.code === data.code)) {
          showToast("Mã SV đã tồn tại trong lớp mới");
          return;
        }
      }

      if (data.class !== oldClass) {
        oldList.splice(Number(i), 1);
        classes[data.class].push(Object.assign(old, data));
        currentClass = data.class;
      } else {
        Object.assign(oldList[Number(i)], data);
      }
      showToast("Đã cập nhật sinh viên");
    }

    saveClasses();
    renderClassList();
    renderTableByClass();
    studentModal.hide();
    if (searchBox) searchBox.value = "";
  });

  // ===== Team (demo) =====
  const team = [
    { name: "VŨ VĂN HÙNG", dob: "1999-01-01", mssv: "K23DTCN027", class: "KTPM01", phone: "0901000222", email: "one@example.com", org: "Truong Dai Hoc ABC", orgUrl: "https://example.com", avatar: "./assets/team/hung1.jpeg", task: "Leader, kiến trúc & review." },
    { name: "NGUYỄN THỊ HỒNG THẮM", dob: "1999-02-02", mssv: "K23DTCN054", class: "KTPM01", phone: "0902000333", email: "two@example.com", org: "Cong ty XYZ", orgUrl: "https://example.com", avatar: "./assets/team/tham2.jpg", task: "FE chính, UI/UX." },
    { name: "NGUYỄN THÀNH ĐÔ", dob: "1995-04-04", mssv: "K23DTCN011", class: "CNTT02", phone: "0394795688", email: "nthanhdo7979@gmail.com", org: "Tong cong ty 86", orgUrl: "https://example.com", avatar: "./assets/team/do1.jpg", task: "BE chính, dữ liệu." },
    { name: "TRẦN THẾ LINH", dob: "1999-03-03", mssv: "K23DTCN027", class: "CNTT02", phone: "0903000444", email: "three@example.com", org: "Cong ty DEF", orgUrl: "https://example.com", avatar: "./assets/team/linh.png", task: "BE chính, dữ liệu." },
  ];

  const teamRow = $("#teamRow");
  if (teamRow) {
    teamRow.innerHTML = "";
    team.forEach((m) => {
      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-4";
      col.innerHTML = `
        <div class="card card-glass rounded-4 member-card h-100">
          <div class="card-body">
            <div class="d-flex gap-3 align-items-center mb-3">
              <img src="${m.avatar}" alt="avatar" class="avatar" data-zoom="${m.avatar}" />
              <div>
                <h6 class="mb-1">${m.name}</h6>
                <span class="badge badge-soft">${m.class}</span>
              </div>
            </div>
            <ul class="list-group list-group-flush mb-3">
              <li class="list-group-item"><i class="bi bi-person-vcard me-2"></i>MSSV: ${m.mssv}</li>
              <li class="list-group-item"><i class="bi bi-calendar-event me-2"></i>Ngày sinh: ${m.dob}</li>
              <li class="list-group-item"><i class="bi bi-telephone me-2"></i>Điện thoại: ${m.phone}</li>
              <li class="list-group-item"><i class="bi bi-envelope me-2"></i>Email: ${m.email}</li>
              <li class="list-group-item"><i class="bi bi-building me-2"></i>Đơn vị: <a class="text-light" href="${m.orgUrl}" target="_blank" rel="noopener">${m.org}</a></li>
            </ul>
            <div class="small text-secondary">Nhiệm vụ: ${m.task}</div>
          </div>
        </div>`;
      teamRow.appendChild(col);
    });

    const imgModal = new bootstrap.Modal($("#imgModal"));
    const imgZoom = $("#imgZoom");
    on(teamRow, "click", (e) => {
      const img = e.target.closest(".avatar");
      if (!img) return;
      imgZoom.src = img.dataset.zoom;
      imgModal.show();
    });
  }

  // ===== Demo forms khác =====
  const bindSimpleForm = (id) => {
    const f = $(`#${id}`);
    if (!f) return;
    on(f, "submit", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!f.checkValidity()) {
        f.classList.add("was-validated");
        return;
      }
      alert("Đã lưu! (demo)");
      f.reset();
      f.classList.remove("was-validated");
    });
  };
  bindSimpleForm("userForm");
  bindSimpleForm("studentMngForm");
  bindSimpleForm("semesterForm");

  // ===== First render =====
  renderClassList();
  renderTableByClass();
})();
