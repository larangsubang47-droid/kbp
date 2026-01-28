
// ==========================================
const API_URL = 'https://script.google.com/macros/s/AKfycbxR89T533kAOiikBc-lX4mXZ5Pivr6OgvdqjwFp1krBKXrWG76jgBv5iDjthLlDwlko/exec';

// ==========================================
// DATA STRUKTUR
// ==========================================
const dataStructure = {
  levelAir: [
    { name: 'Air Baku Intake', satuan: 'Mdpl' },
    { name: 'Reservoar', satuan: 'cm' }
  ],
  flowDebit: [
    { name: 'Inlet WTP', satuan: 'Lps' },
    { name: 'Outlet WTP', satuan: 'Lps' }
  ],
  pressureDistribusi: [
    { name: 'Pompa 1', satuan: 'Bar' },
    { name: 'Pompa 2', satuan: 'Bar' },
    { name: 'Pompa 3', satuan: 'Bar' }
  ],
  hzDistribusi: [
    { name: 'Pompa 1', satuan: 'Hz' },
    { name: 'Pompa 2', satuan: 'Hz' },
    { name: 'Pompa 3', satuan: 'Hz' }
  ],
  pressureIntake: [
    { name: 'Pompa 1', satuan: 'Bar' },
    { name: 'Pompa 2', satuan: 'Bar' },
    { name: 'Pompa 3', satuan: 'Bar' }
  ],
  hzIntake: [
    { name: 'Pompa 1', satuan: 'Hz' },
    { name: 'Pompa 2', satuan: 'Hz' },
    { name: 'Pompa 3', satuan: 'Hz' }
  ],
  wdc: [
    { name: 'Level WDC (%)', satuan: 'Persen' },
    { name: 'LPS OUT WDC', satuan: 'LPS' }
  ],
  backwashFilter: [
    { name: 'Plan 1', satuan: 'Unit' },
    { name: 'Plan 2', satuan: 'Unit' }
  ]
};

// ==========================================
// STATE MANAGEMENT
// ==========================================
let currentUser = null;
let deferredPrompt = null;
let selectedTimes = [];
let currentDraftKey = null; // Key untuk draft yang sedang aktif

// ==========================================
// INITIALIZATION
// ==========================================
window.onload = function() {
  const savedUser = localStorage.getItem('currentUser');
  if(savedUser) {
    currentUser = JSON.parse(savedUser);
    showMainApp();
  }
  
  // Set default date to today
  const today = new Date();
  document.getElementById('tanggal').valueAsDate = today;
  
  // Set hari
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  document.getElementById('hari').value = days[today.getDay()];
  
  // Initialize selected times
  updateSelectedTimes();
  
  // Load draft jika ada
  loadDraft();
  
  // Update draft key ketika tanggal berubah
  document.getElementById('tanggal').addEventListener('change', function() {
    const newDate = this.value;
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dateObj = new Date(newDate + 'T00:00:00');
    document.getElementById('hari').value = days[dateObj.getDay()];
    
    // Update draft key
    updateDraftKey();
    
    // Load draft untuk tanggal baru
    loadDraft();
  });
};

// ==========================================
// DRAFT MANAGEMENT
// ==========================================
function updateDraftKey() {
  const tanggal = document.getElementById('tanggal').value;
  currentDraftKey = `draft_${tanggal}`;
  updateDraftIndicator();
}

function updateDraftIndicator() {
  const indicator = document.getElementById('draftIndicator');
  if(!indicator) return;
  
  if(currentDraftKey && localStorage.getItem(currentDraftKey)) {
    const draft = JSON.parse(localStorage.getItem(currentDraftKey));
    const lastSaved = new Date(draft.lastSaved).toLocaleString('id-ID');
    indicator.innerHTML = `💾 Draft tersimpan: ${lastSaved}`;
    indicator.style.display = 'block';
  } else {
    indicator.style.display = 'none';
  }
}

function saveDraft() {
  const tanggal = document.getElementById('tanggal').value;
  if(!tanggal) {
    showNotification('Tanggal harus diisi!', 'error');
    return;
  }
  
  // Update draft key
  updateDraftKey();
  
  // Collect all data
  const draftData = {
    hari: document.getElementById('hari').value,
    tanggal: tanggal,
    operator: {
      shift1: document.getElementById('operatorShift1').value,
      shift2: document.getElementById('operatorShift2').value
    },
    levelAir: collectTableData('levelAirTable', dataStructure.levelAir),
    flowDebit: collectTableData('flowDebitTable', dataStructure.flowDebit),
    pressureDistribusi: collectTableData('pressureDistribusiTable', dataStructure.pressureDistribusi),
    hzDistribusi: collectTableData('hzDistribusiTable', dataStructure.hzDistribusi),
    pressureIntake: collectTableData('pressureIntakeTable', dataStructure.pressureIntake),
    hzIntake: collectTableData('hzIntakeTable', dataStructure.hzIntake),
    wdc: collectTableData('wdcTable', dataStructure.wdc),
    backwashFilter: collectTableData('backwashFilterTable', dataStructure.backwashFilter),
    kwhMeter: {
      wbp1: document.getElementById('kwhWBP1').value,
      lwbp1: document.getElementById('kwhLWBP1').value,
      lwbp2: document.getElementById('kwhLWBP2').value,
      total: document.getElementById('kwhTotal').value
    },
    totalWM: {
      airBaku: document.getElementById('totalWMAirBaku').value,
      airBersih: document.getElementById('totalWMAirBersih').value
    },
    catatan: document.getElementById('catatan').value,
    selectedTimes: selectedTimes,
    lastSaved: new Date().toISOString()
  };
  
  // Save to localStorage
  localStorage.setItem(currentDraftKey, JSON.stringify(draftData));
  
  showNotification('✓ Draft berhasil disimpan!', 'success');
  updateDraftIndicator();
}

function loadDraft() {
  const tanggal = document.getElementById('tanggal').value;
  if(!tanggal) return;
  
  currentDraftKey = `draft_${tanggal}`;
  const savedDraft = localStorage.getItem(currentDraftKey);
  
  if(!savedDraft) {
    updateDraftIndicator();
    return;
  }
  
  if(!confirm('Draft ditemukan untuk tanggal ini. Load draft?')) {
    updateDraftIndicator();
    return;
  }
  
  const draft = JSON.parse(savedDraft);
  
  // Load basic info
  document.getElementById('hari').value = draft.hari || '';
  document.getElementById('tanggal').value = draft.tanggal || '';
  document.getElementById('operatorShift1').value = draft.operator?.shift1 || '';
  document.getElementById('operatorShift2').value = draft.operator?.shift2 || '';
  
  // Load KWH
  document.getElementById('kwhWBP1').value = draft.kwhMeter?.wbp1 || '';
  document.getElementById('kwhLWBP1').value = draft.kwhMeter?.lwbp1 || '';
  document.getElementById('kwhLWBP2').value = draft.kwhMeter?.lwbp2 || '';
  document.getElementById('kwhTotal').value = draft.kwhMeter?.total || '';
  
  // Load Total WM
  document.getElementById('totalWMAirBaku').value = draft.totalWM?.airBaku || '';
  document.getElementById('totalWMAirBersih').value = draft.totalWM?.airBersih || '';
  
  // Load Catatan
  document.getElementById('catatan').value = draft.catatan || '';
  
  // Load selected times
  if(draft.selectedTimes) {
    selectedTimes = draft.selectedTimes;
    document.querySelectorAll('.time-check').forEach(cb => {
      cb.checked = selectedTimes.includes(cb.value);
    });
    initializeTables();
  }
  
  // Load table data
  setTimeout(() => {
    loadTableData('levelAirTable', dataStructure.levelAir, draft.levelAir);
    loadTableData('flowDebitTable', dataStructure.flowDebit, draft.flowDebit);
    loadTableData('pressureDistribusiTable', dataStructure.pressureDistribusi, draft.pressureDistribusi);
    loadTableData('hzDistribusiTable', dataStructure.hzDistribusi, draft.hzDistribusi);
    loadTableData('pressureIntakeTable', dataStructure.pressureIntake, draft.pressureIntake);
    loadTableData('hzIntakeTable', dataStructure.hzIntake, draft.hzIntake);
    loadTableData('wdcTable', dataStructure.wdc, draft.wdc);
    loadTableData('backwashFilterTable', dataStructure.backwashFilter, draft.backwashFilter);
  }, 100);
  
  showNotification('✓ Draft berhasil dimuat!', 'success');
  updateDraftIndicator();
}

function loadTableData(tableId, items, data) {
  if(!data) return;
  
  items.forEach((item, index) => {
    if(data[item.name]) {
      selectedTimes.forEach(time => {
        const inputId = `${tableId}_${index}_${time.replace(':', '')}`;
        const input = document.getElementById(inputId);
        if(input && data[item.name][time] !== undefined) {
          input.value = data[item.name][time];
        }
      });
    }
  });
}

function deleteDraft() {
  if(!currentDraftKey) return;
  
  if(!confirm('Hapus draft untuk tanggal ini?')) return;
  
  localStorage.removeItem(currentDraftKey);
  showNotification('✓ Draft berhasil dihapus!', 'success');
  updateDraftIndicator();
}

function listAllDrafts() {
  const drafts = [];
  for(let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if(key.startsWith('draft_')) {
      const draft = JSON.parse(localStorage.getItem(key));
      drafts.push({
        key: key,
        tanggal: draft.tanggal,
        lastSaved: draft.lastSaved
      });
    }
  }
  return drafts;
}

// ==========================================
// PWA INSTALL
// ==========================================
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installBtn').style.display = 'block';
});

function installPWA() {
  if(deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showNotification('Aplikasi berhasil diinstall!', 'success');
      }
      deferredPrompt = null;
      document.getElementById('installBtn').style.display = 'none';
    });
  }
}

// ==========================================
// AUTHENTICATION
// ==========================================
async function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  if(!username || !password) {
    showNotification('Username dan password harus diisi!', 'error');
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        username: username,
        password: password
      })
    });

    const result = await response.json();

    if(result.success) {
      currentUser = result.data;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      showNotification('Login berhasil!', 'success');
      showMainApp();
    } else {
      showNotification(result.message, 'error');
    }
  } catch(error) {
    showNotification('Gagal connect ke server: ' + error.message, 'error');
  }
}

function logout() {
  if(confirm('Yakin ingin logout?')) {
    localStorage.removeItem('currentUser');
    currentUser = null;
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    showNotification('Logout berhasil!', 'success');
  }
}

function showMainApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  document.getElementById('userDisplay').textContent = `👤 ${currentUser.nama}`;
  
  // Initialize tables
  initializeTables();
  loadHistory();
  updateDraftIndicator();
}

// ==========================================
// TABLE INITIALIZATION
// ==========================================
function updateSelectedTimes() {
  const checkboxes = document.querySelectorAll('.time-check:checked');
  selectedTimes = Array.from(checkboxes).map(cb => cb.value);
  initializeTables();
}

function initializeTables() {
  // Add event listeners to time checkboxes
  document.querySelectorAll('.time-check').forEach(checkbox => {
    checkbox.addEventListener('change', updateSelectedTimes);
  });
  
  // Initialize each table
  createDataTable('levelAirTable', dataStructure.levelAir);
  createDataTable('flowDebitTable', dataStructure.flowDebit);
  createDataTable('pressureDistribusiTable', dataStructure.pressureDistribusi);
  createDataTable('hzDistribusiTable', dataStructure.hzDistribusi);
  createDataTable('pressureIntakeTable', dataStructure.pressureIntake);
  createDataTable('hzIntakeTable', dataStructure.hzIntake);
  createDataTable('wdcTable', dataStructure.wdc);
  createDataTable('backwashFilterTable', dataStructure.backwashFilter);
}

function createDataTable(tableId, items) {
  const container = document.getElementById(tableId);
  if (!container) return;
  
  let html = '<table class="input-table"><thead><tr>';
  html += '<th>Jenis Kegiatan</th><th>Satuan</th>';
  
  selectedTimes.forEach(time => {
    html += `<th>${time}</th>`;
  });
  
  html += '</tr></thead><tbody>';
  
  items.forEach((item, index) => {
    html += `<tr>`;
    html += `<td><strong>${item.name}</strong></td>`;
    html += `<td>${item.satuan}</td>`;
    
    selectedTimes.forEach(time => {
      const inputId = `${tableId}_${index}_${time.replace(':', '')}`;
      html += `<td><input type="number" id="${inputId}" step="0.01" placeholder="0"></td>`;
    });
    
    html += `</tr>`;
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;
}

// ==========================================
// COLLECT DATA FROM TABLES
// ==========================================
function collectTableData(tableId, items) {
  const data = {};
  
  items.forEach((item, index) => {
    data[item.name] = {};
    
    selectedTimes.forEach(time => {
      const inputId = `${tableId}_${index}_${time.replace(':', '')}`;
      const input = document.getElementById(inputId);
      if (input && input.value) {
        data[item.name][time] = parseFloat(input.value);
      }
    });
  });
  
  return data;
}

// ==========================================
// SUBMIT FINAL DATA (KE GDRIVE)
// ==========================================
async function submitFinalData() {
  const hari = document.getElementById('hari').value;
  const tanggal = document.getElementById('tanggal').value;

  if(!hari || !tanggal) {
    showNotification('Hari dan tanggal harus diisi!', 'error');
    return;
  }
  
  if(!confirm('Submit laporan final ke Google Drive?\n\nSetelah submit, data tidak bisa diubah lagi.')) {
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Mengirim ke GDrive...';

  try {
    // Collect all data
    const reportData = {
      hari: hari,
      tanggal: tanggal,
      operator: {
        shift1: document.getElementById('operatorShift1').value,
        shift2: document.getElementById('operatorShift2').value
      },
      levelAir: collectTableData('levelAirTable', dataStructure.levelAir),
      flowDebit: collectTableData('flowDebitTable', dataStructure.flowDebit),
      pressureDistribusi: collectTableData('pressureDistribusiTable', dataStructure.pressureDistribusi),
      hzDistribusi: collectTableData('hzDistribusiTable', dataStructure.hzDistribusi),
      pressureIntake: collectTableData('pressureIntakeTable', dataStructure.pressureIntake),
      hzIntake: collectTableData('hzIntakeTable', dataStructure.hzIntake),
      wdc: collectTableData('wdcTable', dataStructure.wdc),
      backwashFilter: collectTableData('backwashFilterTable', dataStructure.backwashFilter),
      kwhMeter: {
        wbp1: document.getElementById('kwhWBP1').value,
        lwbp1: document.getElementById('kwhLWBP1').value,
        lwbp2: document.getElementById('kwhLWBP2').value,
        total: document.getElementById('kwhTotal').value
      },
      totalWM: {
        airBaku: document.getElementById('totalWMAirBaku').value,
        airBersih: document.getElementById('totalWMAirBersih').value
      },
      catatan: document.getElementById('catatan').value,
      selectedTimes: selectedTimes
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'saveProductionReport',
        userId: currentUser.userId,
        reportData: reportData
      })
    });

    const result = await response.json();

    if(result.success) {
      showNotification('✓ Laporan berhasil dikirim ke Google Drive!', 'success');
      
      // Hapus draft setelah submit
      if(currentDraftKey) {
        localStorage.removeItem(currentDraftKey);
      }
      
      clearForm();
      loadHistory();
      updateDraftIndicator();
    } else {
      showNotification('Gagal submit: ' + result.message, 'error');
    }
  } catch(error) {
    showNotification('Error: ' + error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '📤 Submit Final ke GDrive';
  }
}

function clearForm() {
  const today = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  
  document.getElementById('hari').value = days[today.getDay()];
  document.getElementById('tanggal').valueAsDate = today;
  document.getElementById('operatorShift1').value = '';
  document.getElementById('operatorShift2').value = '';
  document.getElementById('kwhWBP1').value = '';
  document.getElementById('kwhLWBP1').value = '';
  document.getElementById('kwhLWBP2').value = '';
  document.getElementById('kwhTotal').value = '';
  document.getElementById('totalWMAirBaku').value = '';
  document.getElementById('totalWMAirBersih').value = '';
  document.getElementById('catatan').value = '';
  
  // Clear all table inputs
  document.querySelectorAll('.input-table input').forEach(input => {
    input.value = '';
  });
  
  updateDraftKey();
  updateDraftIndicator();
}

// ==========================================
// LOAD HISTORY
// ==========================================
async function loadHistory() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '<div class="loading"><div class="spinner"></div>Memuat data...</div>';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'getProductionHistory',
        userId: currentUser.userId,
        role: currentUser.role,
        limit: 50
      })
    });

    const result = await response.json();

    if(result.success) {
      const records = result.data.records;
      
      if(records.length === 0) {
        historyList.innerHTML = '<div style="text-align:center; padding:40px; color:#999;">Belum ada laporan</div>';
        return;
      }

      let html = '';
      records.forEach(record => {
        const date = new Date(record.createdAt).toLocaleString('id-ID');
        
        html += `
          <div class="history-item" onclick="viewDetail('${record.recordId}')">
            <div class="history-header">
              <span class="history-date">${date}</span>
              <span class="status-badge status-aktif">📄 Laporan</span>
            </div>
            <div class="history-name">${record.hari}, ${record.tanggal}</div>
            <div class="history-id">Operator: ${record.operator.shift1}</div>
          </div>
        `;
      });

      historyList.innerHTML = html;
    } else {
      historyList.innerHTML = '<div style="text-align:center; padding:40px; color:#f44336;">Gagal memuat data</div>';
    }
  } catch(error) {
    historyList.innerHTML = '<div style="text-align:center; padding:40px; color:#f44336;">Error: ' + error.message + '</div>';
  }
}

function viewDetail(recordId) {
  showNotification('Detail untuk ' + recordId, 'success');
  // Implement detail view later
}

// ==========================================
// NAVIGATION
// ==========================================
function switchScreen(screen) {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));

  if(screen === 'form') {
    document.getElementById('formScreen').classList.remove('hidden');
    document.getElementById('historyScreen').classList.add('hidden');
    navItems[0].classList.add('active');
  } else if(screen === 'history') {
    document.getElementById('formScreen').classList.add('hidden');
    document.getElementById('historyScreen').classList.remove('hidden');
    navItems[1].classList.add('active');
    loadHistory();
  }
}

// ==========================================
// NOTIFICATION
// ==========================================
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type} show`;
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

