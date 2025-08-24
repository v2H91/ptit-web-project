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

  // ===== Data / Curriculum =====
  // === NEW: 3 năm = 6 học kỳ
  const YEARS = ["2023", "2024", "2025"];
  const SEMS = ["1", "2"];

  // === NEW: Map (năm,kỳ) -> HK1..HK6
  const hkLabel = (year, sem) => {
    const base = (Number(year) - 2023) * 2 + (sem === "1" ? 1 : 2);
    return `HK${base}`;
  };

  // === NEW: CTĐT kèm số tín chỉ (credits)
  const CURRICULUM = {
    HK1: [
      { code: "INT11176", name: "Nhập môn Internet và eLearning", credits: 2 },
      { code: "BAS1150", name: "Triết học Mác–Lênin", credits: 3 },
      { code: "BAS1201", name: "Đại số", credits: 3 },
      { code: "BAS1203", name: "Giải tích 1", credits: 3 },
      { code: "INT1154", name: "Tin học cơ sở 1", credits: 2 },
      { code: "KNM1", name: "Kỹ năng mềm 1", credits: 1 },
      { code: "KNM2", name: "Kỹ năng mềm 2", credits: 1 },
      { code: "KNM3", name: "Kỹ năng mềm 3", credits: 1 },
    ],
    HK2: [
      { code: "BAS1226", name: "Xác suất thống kê", credits: 2 },
      { code: "BAS1151", name: "Kinh tế chính trị Mác–Lênin", credits: 2 },
      { code: "BAS1157", name: "Tiếng Anh (Course 1)", credits: 4 },
      { code: "BAS1204", name: "Giải tích 2", credits: 3 },
      { code: "BAS1224", name: "Vật lý 1 và thí nghiệm", credits: 4 },
      { code: "INT1155", name: "Tin học cơ sở 2", credits: 2 },
      { code: "ELE1433", name: "Kỹ thuật số", credits: 2 },
    ],
    HK3: [
      { code: "BAS1227", name: "Vật lý 3 và thí nghiệm", credits: 4 },
      { code: "INT1358", name: "Toán rời rạc 1", credits: 3 },
      { code: "INT1339", name: "Ngôn ngữ lập trình C++", credits: 3 },
      { code: "ELE1330", name: "Xử lý tín hiệu số", credits: 2 },
    ],
    HK4: [
      { code: "BAS1122", name: "Tư tưởng Hồ Chí Minh", credits: 2 },
      { code: "BAS1159", name: "Tiếng Anh (Course 3)", credits: 4 },
      { code: "INT1345", name: "Kiến trúc máy tính", credits: 3 },
      { code: "INT1359", name: "Toán rời rạc 2", credits: 3 },
      { code: "INT1306", name: "Cấu trúc dữ liệu và giải thuật", credits: 3 },
      { code: "ELE1319", name: "Lý thuyết thông tin", credits: 3 },
    ],
    HK5: [
      { code: "BAS1153", name: "Lịch sử Đảng Cộng sản Việt Nam", credits: 2 },
      { code: "BAS1160", name: "Tiếng Anh (Course 3 Plus)", credits: 2 },
      { code: "INT1319", name: "Hệ điều hành", credits: 3 },
      { code: "INT1332", name: "Lập trình hướng đối tượng", credits: 3 },
      { code: "INT1313", name: "Cơ sở dữ liệu", credits: 3 },
      { code: "INT1336", name: "Mạng máy tính", credits: 3 },
      { code: "INT1362", name: "Lập trình với Python", credits: 3 },
    ],
    HK6: [
      { code: "INT1341", name: "Nhập môn trí tuệ nhân tạo", credits: 3 },
      { code: "INT1340", name: "Nhập môn công nghệ phần mềm", credits: 3 },
      { code: "INT1303", name: "An toàn & bảo mật HTTT", credits: 3 },
      { code: "INT1434", name: "Lập trình Web", credits: 3 },
      { code: "INT14148", name: "Cơ sở dữ liệu phân tán", credits: 3 }, // xác nhận lại mã nếu cần
      { code: "INT1347", name: "Thực tập cơ sở", credits: 3 },
    ],
  };

  // === NEW: helper lấy tín chỉ theo HK + mã môn
  function getCreditsFor(hk, code) {
    const item = (CURRICULUM[hk] || []).find((m) => m.code === code);
    return item ? Number(item.credits || 0) : 0;
  }

  // === NEW: tạo subjects từ CTĐT (mặc định score=0)
  const subjectsForHK = (hk) =>
    (CURRICULUM[hk] || []).map((m) => ({ code: m.code, name: m.name, credits: m.credits, score: 0 }));

  // (tuỳ chọn) ĐTB theo tín chỉ – để false theo yêu cầu hiện tại
  const WEIGHTED_BY_CREDITS = false;

  const makeGrades = () => {
    const grades = {};
    YEARS.forEach((y) => {
      grades[y] = {};
      SEMS.forEach((s) => {
        const hk = hkLabel(y, s);
        grades[y][s] = { subjects: subjectsForHK(hk) };
      });
    });
    return grades;
  };

  const rawStudents = [
    { code: "SV001", name: "Nguyễn Thành Đô", class: "KTPM01", conduct: "Tốt", grades: makeGrades() },
    { code: "SV002", name: "Vũ Văn Hùng", class: "KTPM01", conduct: "Khá", grades: makeGrades() },
    { code: "SV003", name: "Nguyễn Thị Hồng Thắm", class: "CNTT02", conduct: "Trung bình", grades: makeGrades() },
    { code: "SV004", name: "Trần Thế Linh", class: "CNTT02", conduct: "Tốt", grades: makeGrades() },
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
        if (!s.grades) s.grades = makeGrades();
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

  // ===== Domain =====
  const semesterAvg = (sem) => {
    const arr = sem?.subjects || [];
    if (!arr.length) return 0;
    if (!WEIGHTED_BY_CREDITS) return avg(arr.map((x) => Number(x.score || 0)));
    const wsum = arr.reduce((a, b) => a + Number(b.score || 0) * Number(b.credits || 0), 0);
    const csum = arr.reduce((a, b) => a + Number(b.credits || 0), 0);
    if (!csum) return 0;
    return Math.round((wsum / csum) * 100) / 100;
  };

  const studentOverallAvg = (stu) => {
    const sems = [];
    Object.keys(stu.grades || {}).forEach((y) => {
      ["1", "2"].forEach((k) => sems.push(stu.grades?.[y]?.[k]));
    });
    const vals = sems.map(semesterAvg).filter((v) => !Number.isNaN(v));
    return avg(vals);
  };

  const ensureClassExists = (cls) => (classes[cls] ??= []);

  const ensureStudentGrades = (stu) => {
    if (!stu.grades) stu.grades = makeGrades();
    YEARS.forEach((y) => {
      if (!stu.grades[y]) stu.grades[y] = {};
      SEMS.forEach((s) => {
        if (!stu.grades[y][s]) stu.grades[y][s] = { subjects: [] };
        if (!Array.isArray(stu.grades[y][s].subjects)) stu.grades[y][s].subjects = [];
      });
    });
  };

  // === NEW: đồng bộ chương trình (điền môn thiếu & khoá credits theo CTĐT)
  function fillCurriculumForStudent(stu) {
    YEARS.forEach((y) => {
      SEMS.forEach((s) => {
        const hk = hkLabel(y, s);
        const sem = stu.grades?.[y]?.[s];
        if (!sem) return;
        if (!Array.isArray(sem.subjects)) sem.subjects = [];
        const byCode = new Map(sem.subjects.map((x) => [x.code, x]));
        (CURRICULUM[hk] || []).forEach((m) => {
          if (!byCode.has(m.code)) {
            sem.subjects.push({ code: m.code, name: m.name, credits: m.credits, score: 0 });
          } else {
            const row = byCode.get(m.code);
            row.name = row.name || m.name;
            row.credits = m.credits; // tín chỉ cố định
          }
        });
      });
    });
  }

  // Đồng bộ dữ liệu hiện có
  Object.values(classes).forEach((list) =>
    list.forEach((stu) => {
      ensureStudentGrades(stu);
      fillCurriculumForStudent(stu);
    })
  );
  saveClasses();

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

  // ===== Render: Bảng tổng =====
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
  const detailTitle = $("#detailTitle");
  const detailYearPills = $("#detailYearPills");
  const detailSemPills = $("#detailSemPills");
  const detailSubjectsBody = $("#detailSubjectsBody");
  const detailAvg = $("#detailAvg");

  // Form nhập môn
  const gradeForm = $("#gradeForm");
  const codeInput = $("#subjectCode");
  const nameInput = $("#subjectName");
  const scoreInput = $("#subjectScore");
  const addBtn = $("#addSubjectBtn");

  // Chèn nút Xuất Excel (CSV) nếu chưa có
  const modalFooter = $("#gradeDetailModal .modal-footer");
  let exportBtn = $("#exportExcelBtn");
  if (!exportBtn && modalFooter) {
    exportBtn = document.createElement("button");
    exportBtn.id = "exportExcelBtn";
    exportBtn.type = "button";
    exportBtn.className = "btn btn-outline-success";
    exportBtn.innerHTML = `<i class="bi bi-file-earmark-spreadsheet"></i> Xuất Excel`;
    modalFooter.insertBefore(exportBtn, modalFooter.lastElementChild);
  }

  // State modal
  let stuRef = null;
  let curYear = YEARS[0];
  let curSem = "1";

  const toFixed2 = (n) => (Math.round(Number(n) * 100) / 100).toFixed(2);

  function getCurrentSemObj() {
    if (!stuRef.grades[curYear]) stuRef.grades[curYear] = {};
    if (!stuRef.grades[curYear][curSem]) stuRef.grades[curYear][curSem] = { subjects: [] };
    if (!Array.isArray(stuRef.grades[curYear][curSem].subjects)) stuRef.grades[curYear][curSem].subjects = [];
    return stuRef.grades[curYear][curSem];
  }

  function recomputeAvg(semObj) {
    if (!semObj) return "0.00";
    return toFixed2(semesterAvg(semObj));
  }

  // === NEW: vẽ bảng có cột "Số TC" (không sửa), cột "Điểm" inline edit
  function repaintTable() {
    const semObj = getCurrentSemObj();
    detailSubjectsBody.innerHTML = "";

    (semObj.subjects || []).forEach((m, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${H(m.code)}</td>
        <td>${H(m.name)}</td>
        <td class="text-center">${Number(m.credits ?? 0)}</td>
        <td class="text-center editable" data-edit="score" data-index="${idx}" contenteditable="true">${toFixed2(m.score)}</td>
        <td class="text-center">
          <button type="button" class="btn btn-sm btn-outline-danger" data-index="${idx}">
            <i class="bi bi-trash"></i>
          </button>
        </td>`;
      detailSubjectsBody.appendChild(tr);
    });

    // Xoá dòng
    $$('button[data-index]', detailSubjectsBody).forEach((btn) => {
      on(btn, 'click', () => {
        const i = Number(btn.dataset.index);
        getCurrentSemObj().subjects.splice(i, 1);
        repaintTable();
        detailAvg.textContent = recomputeAvg(getCurrentSemObj());
        saveClasses();
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
      curSem = "1";
      [...detailYearPills.children].forEach((ch) => ch.classList.remove("active"));
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
      b.textContent = `Kỳ ${k} (${hkLabel(curYear, k)})`;
      b.dataset.sem = k;
      detailSemPills.appendChild(b);
    });

    detailSemPills.onclick = (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      curSem = b.dataset.sem;
      [...detailSemPills.children].forEach((ch) => ch.classList.remove("active"));
      b.classList.add("active");
      updateTitle();
      repaintTable();
    };
  }

  function updateTitle() {
    detailTitle.textContent = `${stuRef.name} • ${stuRef.code} • ${stuRef.class} • ${curYear} • Kỳ ${curSem} • ${hkLabel(curYear, curSem)}`;
  }

  function addSubject() {
    if (!gradeForm.checkValidity()) {
      gradeForm.classList.add("was-validated");
      return;
    }
    const code = codeInput.value.trim();
    const name = nameInput.value.trim();
    const score = parseFloat(scoreInput.value);

    if (Number.isNaN(score) || score < 0 || score > 10) {
      scoreInput.setCustomValidity("Điểm phải từ 0 đến 10.");
      gradeForm.classList.add("was-validated");
      return;
    } else {
      scoreInput.setCustomValidity("");
    }

    const semObj = getCurrentSemObj();
    const hk = hkLabel(curYear, curSem);
    const credits = getCreditsFor(hk, code); // tự lấy theo CTĐT (0 nếu không có)

    semObj.subjects.push({ code, name, credits, score });
    repaintTable();
    saveClasses();

    codeInput.value = "";
    nameInput.value = "";
    scoreInput.value = "";
    codeInput.focus();
  }
  on(addBtn, "click", addSubject);

  // === NEW: Inline edit cho cột Điểm (Enter lưu, Esc huỷ)
  on(detailSubjectsBody, "focusin", (e) => {
    const cell = e.target.closest("[contenteditable][data-edit='score']");
    if (!cell) return;
    cell.dataset.old = cell.textContent.trim();
  });
  on(detailSubjectsBody, "keydown", (e) => {
    const cell = e.target.closest("[contenteditable][data-edit='score']");
    if (!cell) return;
    if (e.key === "Enter") { e.preventDefault(); cell.blur(); }
    if (e.key === "Escape") { e.preventDefault(); cell.textContent = cell.dataset.old || ""; cell.blur(); }
  });
  on(detailSubjectsBody, "focusout", (e) => {
    const cell = e.target.closest("[contenteditable][data-edit='score']");
    if (!cell) return;
    const idx = Number(cell.dataset.index);
    const semObj = getCurrentSemObj();
    const row = semObj.subjects[idx];
    if (!row) return;

    const val = parseFloat(cell.textContent.trim().replace(",", "."));
    if (Number.isNaN(val) || val < 0 || val > 10) {
      showToast("Điểm phải từ 0 đến 10");
      cell.textContent = toFixed2(row.score);
      return;
    }
    row.score = val;
    cell.textContent = toFixed2(val);
    detailAvg.textContent = recomputeAvg(semObj);
    saveClasses();
  });

  // ===== Xuất Excel (CSV)
  function exportAllGradesCSV() {
    if (!stuRef) return;

    const rows = [
      ["Student Name", stuRef.name],
      ["Student Code", stuRef.code],
      ["Class", stuRef.class],
      [""],
      ["Year", "Semester", "HK", "Subject Code", "Subject Name", "Credits", "Score"],
    ];

    YEARS.forEach((y) => {
      SEMS.forEach((s) => {
        const semObj = stuRef.grades?.[y]?.[s] || { subjects: [] };
        (semObj.subjects || []).forEach((sub) => {
          rows.push([y, s, hkLabel(y, s), sub.code ?? "", sub.name ?? "", Number(sub.credits ?? 0), Number(sub.score ?? 0)]);
        });
      });
    });

    const csv = rows
      .map((r) =>
        r
          .map((v) => {
            const t = String(v ?? "");
            return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const ts = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const fname = `grades_${(stuRef.code || "SV").replace(/\W+/g, "_")}_${ts.getFullYear()}${pad(
      ts.getMonth() + 1
    )}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.csv`;

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
      subjects: getCurrentSemObj().subjects.map((s) => ({ code: s.code, name: s.name, credits: Number(s.credits || 0), score: Number(s.score) })),
      average: Number(detailAvg.textContent),
    };

    window.dispatchEvent(new CustomEvent("gradeModal:save", { detail: payload }));
    gradeDetailModal.hide();
  });

  // Mở modal chi tiết điểm
  const openDetail = (stu) => {
    ensureStudentGrades(stu);
    fillCurriculumForStudent(stu);
    stuRef = stu;

    curYear = YEARS[0];
    curSem = "1";

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
    fillCurriculumForStudent(data);

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