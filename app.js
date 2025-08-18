(function(){
  const form = document.getElementById('loginForm');
  const btn = document.getElementById('submitBtn');
  const spinner = btn?.querySelector('.spinner-border');
  const btnLabel = btn?.querySelector('.btn-label');
  const pw = document.getElementById('password');
  const user = document.getElementById('username');
  const togglePw = document.getElementById('togglePw');
  const capsHint = document.getElementById('capsHint');

  // Helpers
  function showToast(message){
    const toastEl = document.getElementById('liveToast');
    if(!toastEl) return alert(message);
    const toastBody = document.getElementById('toastBody');
    toastBody.textContent = message;
    const toast = new bootstrap.Toast(toastEl, { delay: 2200 });
    toast.show();
  }
  function loginSuccess(username){
    const remember = document.getElementById('remember')?.checked;
    const payload = { username, ts: Date.now() };
    localStorage.setItem('demo_session', JSON.stringify(payload));
    if (remember) localStorage.setItem('demo_remember', '1');
    window.location.href = 'dashboard.html';
  }
  function isCapsOn(e){ return e.getModifierState && e.getModifierState('CapsLock'); }

  // ===== Login page bindings =====
  if(form){
    togglePw?.addEventListener('click', () => {
      const type = pw.getAttribute('type') === 'password' ? 'text' : 'password';
      pw.setAttribute('type', type);
      togglePw.firstElementChild.classList.toggle('bi-eye');
      togglePw.firstElementChild.classList.toggle('bi-eye-slash');
      pw.focus();
    });
    pw?.addEventListener('keyup', (e) => capsHint?.classList.toggle('active', isCapsOn(e)) );

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      btn.disabled = true; spinner.classList.remove('d-none'); btnLabel.textContent = 'Đang đăng nhập…';
      setTimeout(() => {
        const u = user.value.trim(); const p = pw.value;
        if(u === 'admin' && p === '123456'){
          showToast('Đăng nhập thành công!');
          loginSuccess(u);
        } else {
          showToast('Sai tài khoản hoặc mật khẩu');
        }
        btn.disabled = false; spinner.classList.add('d-none'); btnLabel.textContent = 'Đăng nhập';
      }, 600);
    }, false);
  }

  // ===== Route guard for dashboard =====
  if (location.pathname.endsWith('dashboard.html')){
    const session = localStorage.getItem('demo_session');
    if(!session){ location.replace('index.html'); return; }
    try { const { username } = JSON.parse(session); document.querySelectorAll('[data-username]').forEach(el => el.textContent = username); } catch(e){}

    const logoutBtn = document.getElementById('btnLogout');
    logoutBtn?.addEventListener('click', () => {
      localStorage.removeItem('demo_session'); localStorage.removeItem('demo_remember'); location.replace('index.html');
    });

    // ====== Quản lý điểm: dataset (hash tất cả text) ======
    const rawStudents = [
      { code:'SV001', name:'Nguyen Van A', class:'KTPM01', mid:7.5, final:8.6, conduct:'Tốt' },
      { code:'SV002', name:'Tran Thi B',   class:'KTPM01', mid:5.0, final:6.2, conduct:'Khá' },
      { code:'SV003', name:'Le Van C',     class:'CNTT02', mid:4.2, final:5.1, conduct:'Trung bình' },
      { code:'SV004', name:'Pham Thi D',   class:'CNTT02', mid:9.0, final:9.2, conduct:'Tốt' }
    ];

    // Hash function (consistent, short hex)
    function hashCode(str){
      let h = 0; for(let i=0;i<str.length;i++){ h = (h<<5)-h + str.charCodeAt(i); h|=0; }
      // to hex (8 chars) for compact UI
      return ('00000000'+(h>>>0).toString(16)).slice(-8);
    }
    const H = (v)=> typeof v==='string' ? hashCode(v) : v; // hash text only

    let students = rawStudents.map(s=>({...s, code:H(s.code), name:H(s.name), class:H(s.class)}));

    const tbody = document.getElementById('studentBody');
    const statCount = document.getElementById('statCount');
    const statAvg = document.getElementById('statAvg');
    const statGood = document.getElementById('statGood');
    const statWarn = document.getElementById('statWarn');

    function avg(a,b){ return Math.round(((Number(a)||0) + (Number(b)||0))/2*100)/100; }

    function renderTable(list){
      tbody.innerHTML = '';
      list.forEach((s, i)=>{
        const mean = avg(s.mid, s.final);
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="text-nowrap"><span class="badge badge-soft">${s.code}</span></td>
          <td>${s.name}</td>
          <td>${s.class}</td>
          <td class="text-center">${s.mid}</td>
          <td class="text-center">${s.final}</td>
          <td class="text-center ${mean<5?'text-danger fw-bold':''}">${mean.toFixed(2)}</td>
          <td class="text-center">${s.conduct}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-light me-1" data-act="edit" data-idx="${i}"><i class="bi bi-pencil-square"></i></button>
            <button class="btn btn-sm btn-outline-danger" data-act="del" data-idx="${i}"><i class="bi bi-trash"></i></button>
          </td>`;
        tbody.appendChild(tr);
      });
      updateStats(list);
    }

    function updateStats(list){
      const count = list.length;
      const avgAll = count? (list.map(s=>avg(s.mid,s.final)).reduce((a,b)=>a+b,0)/count) : 0;
      const good = list.filter(s=>s.conduct==='Tốt').length;
      const warn = list.filter(s=>avg(s.mid,s.final)<5).length;
      statCount.textContent = count;
      statAvg.textContent = avgAll.toFixed(2);
      statGood.textContent = good;
      statWarn.textContent = warn;
    }

    // Search
    const searchBox = document.getElementById('searchBox');
    searchBox.addEventListener('input', ()=>{
      const q = searchBox.value.trim().toLowerCase();
      const filtered = students.filter(s=> s.name.toLowerCase().includes(q) || s.class.toLowerCase().includes(q));
      renderTable(filtered);
    });

    // Add/Edit/Delete via modal
    const studentModal = new bootstrap.Modal(document.getElementById('studentModal'));
    const studentForm = document.getElementById('studentForm');
    const idxEl = document.getElementById('idx');
    const svName = document.getElementById('svName');
    const svCode = document.getElementById('svCode');
    const svClass = document.getElementById('svClass');
    const svMid = document.getElementById('svMid');
    const svFinal = document.getElementById('svFinal');
    const svConduct = document.getElementById('svConduct');
    const modalTitle = document.getElementById('modalTitle');

    document.getElementById('btnAdd').addEventListener('click', ()=>{
      modalTitle.textContent = 'Thêm sinh viên';
      idxEl.value=''; studentForm.reset(); studentForm.classList.remove('was-validated');
      studentModal.show();
    });

    tbody.addEventListener('click', (e)=>{
      const btn = e.target.closest('button'); if(!btn) return;
      const act = btn.dataset.act; const i = Number(btn.dataset.idx);
      if(act==='edit'){
        modalTitle.textContent = 'Sửa sinh viên';
        const s = students[i];
        idxEl.value = i;
        svName.value = s.name; svCode.value = s.code; svClass.value = s.class; svMid.value = s.mid; svFinal.value = s.final; svConduct.value = s.conduct;
        studentForm.classList.remove('was-validated');
        studentModal.show();
      } else if(act==='del'){
        if(confirm('Xóa sinh viên này?')){ students.splice(i,1); renderTable(students); }
      }
    });

    studentForm.addEventListener('submit', (e)=>{
      e.preventDefault(); e.stopPropagation();
      if(!studentForm.checkValidity()){ studentForm.classList.add('was-validated'); return; }
      const data = {
        code: svCode.value.trim(), name: svName.value.trim(), class: svClass.value.trim(),
        mid: Number(svMid.value), final: Number(svFinal.value), conduct: svConduct.value
      };
      // hash text fields for display
      data.code = H(data.code); data.name = H(data.name); data.class = H(data.class);
      const i = idxEl.value;
      if(i==='') students.push(data); else students[Number(i)] = data;
      studentModal.hide(); renderTable(students);
    });

    // Initial render
    renderTable(students);

    // ====== Team tab (hash all display values) ======
    const rawTeam = [
      { name:'VŨ VĂN HÙNG', dob:'1999-01-01', mssv:'K23DTCN027', class:'KTPM01', phone:'0901000222', email:'one@example.com', org:'Truong Dai Hoc ABC', orgUrl:'https://example.com', avatar:'./assets/team/hung1.jpeg', task:'Leader, kiến trúc & review.' },
      { name:'NGUYỄN THỊ HỒNG THẮM', dob:'1999-02-02', mssv:'K23DTCN027', class:'KTPM01', phone:'0902000333', email:'two@example.com', org:'Cong ty XYZ', orgUrl:'https://example.com', avatar:'./assets/team/tham.png', task:'FE chính, UI/UX.' },
      { name:'NGUYỄN THÀNH ĐÔ', dob:'1999-03-03', mssv:'K23DTCN027', class:'CNTT02', phone:'0903000444', email:'three@example.com', org:'Cong ty DEF', orgUrl:'https://example.com',   avatar:'./assets/team/do.jpg', task:'BE chính, dữ liệu.' },
      { name:'TRẦN THẾ LINH', dob:'1999-03-03', mssv:'K23DTCN027', class:'CNTT02', phone:'0903000444', email:'three@example.com', org:'Cong ty DEF', orgUrl:'https://example.com',avatar:'./assets/team/linh.png', task:'BE chính, dữ liệu.' }
    ];
    const team = rawTeam; 

    const teamRow = document.getElementById('teamRow');
    function renderTeam(list){
      teamRow.innerHTML = '';
      list.forEach(m=>{
        const col = document.createElement('div'); col.className = 'col-12 col-md-6 col-lg-4';
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
    }
    renderTeam(team);

    // Image zoom
    const imgModal = new bootstrap.Modal(document.getElementById('imgModal'));
    const imgZoom = document.getElementById('imgZoom');
    teamRow.addEventListener('click', (e)=>{
      const img = e.target.closest('.avatar'); if(!img) return;
      imgZoom.src = img.dataset.zoom; imgModal.show();
    });
  }
})();