
// ==========================================
const API_URL = 'https://script.google.com/macros/s/AKfycbzYyySjcPaw1KDycEZ76mz6jMW6boouokEkipLxxGZzEuDB9JeE_Ue7TvBJqraBi1md/exec';
// ==========================================
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
  
  // ========== TAMBAHAN: EVENT LISTENER UNTUK LOGIN ==========
  // Tambah event listener untuk Enter key di login form
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  
  if(loginUsername) {
    loginUsername.addEventListener('keypress', function(e) {
      if(e.key === 'Enter') {
        e.preventDefault();
        login();
      }
    });
  }
  
  if(loginPassword) {
    loginPassword.addEventListener('keypress', function(e) {
      if(e.key === 'Enter') {
        e.preventDefault();
        login();
      }
    });
  }
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
  if(!currentDraftKey) {
    indicator.style.display = 'none';
    return;
  }
  
  const draft = localStorage.getItem(currentDraftKey);
  if(draft) {
    const draftData = JSON.parse(draft);
    indicator.style.display = 'block';
    indicator.innerHTML = `💾 Draft tersimpan: ${draftData.lastSaved || 'Tidak ada info waktu'}`;
  } else {
    indicator.style.display = 'none';
  }
}

function saveDraft() {
  const tanggal = document.getElementById('tanggal').value;
  
  if(!tanggal) {
    showNotification('⚠️ Pilih tanggal terlebih dahulu!', 'warning');
    return;
  }
  
  // Update current draft key
  currentDraftKey = `draft_${tanggal}`;
  
  const draftData = collectFormData();
  draftData.lastSaved = new Date().toLocaleString('id-ID');
  
  try {
    localStorage.setItem(currentDraftKey, JSON.stringify(draftData));
    showNotification('✓ Draft berhasil disimpan!', 'success');
    updateDraftIndicator();
  } catch(e) {
    showNotification('❌ Gagal menyimpan draft: ' + e.message, 'error');
  }
}

function loadDraft() {
  const tanggal = document.getElementById('tanggal').value;
  if(!tanggal) return;
  
  currentDraftKey = `draft_${tanggal}`;
  const draftStr = localStorage.getItem(currentDraftKey);
  
  if(!draftStr) {
    updateDraftIndicator();
    return;
  }
  
  if(!confirm(`Draft ditemukan untuk tanggal ${tanggal}.\nLoad draft?`)) {
    return;
  }
  
  const draft = JSON.parse(draftStr);
  
  // Load basic info
  document.getElementById('hari').value = draft.hari || '';
  document.getElementById('operatorShift1').value = draft.operator?.shift1 || '';
  document.getElementById('operatorShift2').value = draft.operator?.shift2 || '';
  
  // Load KWH Meter
  if(draft.kwhMeter) {
    document.getElementById('kwhWbp1').value = draft.kwhMeter.wbp1 || '';
    document.getElementById('kwhLwbp1').value = draft.kwhMeter.lwbp1 || '';
    document.getElementById('kwhLwbp2').value = draft.kwhMeter.lwbp2 || '';
    document.getElementById('kwhTotal').value = draft.kwhMeter.total || '';
  }
  
  // Load Total WM
  if(draft.totalWM) {
    document.getElementById('wmAirBaku').value = draft.totalWM.airBaku || '';
    document.getElementById('wmAirBersih').value = draft.totalWM.airBersih || '';
  }
  
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
      if(choiceResult.outcome === 'accepted') {
        console.log('PWA installed');
      }
      deferredPrompt = null;
    });
  }
}

// ==========================================
// LOGIN & AUTH - DIPERBAIKI
// ==========================================
async function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  
  console.log('🔐 Attempting login...', { username, passwordLength: password.length });

  if(!username || !password) {
    showNotification('⚠️ Username dan password harus diisi!', 'warning');
    return;
  }
  
  // Disable button saat loading
  const loginBtn = event?.target || document.querySelector('.login-card .btn-primary');
  const originalText = loginBtn?.textContent;
  if(loginBtn) {
    loginBtn.disabled = true;
    loginBtn.textContent = '⏳ Loading...';
  }

  try {
    console.log('📡 Sending request to:', API_URL);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'login',
        username: username,
        password: password
      }),
      mode: 'cors'
    });

    console.log('📥 Response status:', response.status);
    
    if(!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📦 Response data:', result);

    if(result.success) {
      currentUser = result.data;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      showNotification('✓ Login berhasil!', 'success');
      showMainApp();
    } else {
      showNotification('❌ ' + (result.message || 'Login gagal'), 'error');
    }
  } catch(error) {
    console.error('❌ Login error:', error);
    showNotification('❌ Gagal connect ke server: ' + error.message + '\n\nCek console (F12) untuk detail error', 'error');
  } finally {
    // Re-enable button
    if(loginBtn) {
      loginBtn.disabled = false;
      loginBtn.textContent = originalText;
    }
  }
}

function logout() {
  if(confirm('Yakin ingin logout?')) {
    localStorage.removeItem('currentUser');
    currentUser = null;
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    showNotification('✓ Logout berhasil!', 'success');
  }
}

function showMainApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  document.getElementById('userDisplay').textContent = `👤 ${currentUser.nama} (${currentUser.role})`;
  
  // Initialize draft key
  updateDraftKey();
}

// ==========================================
// TIME SELECTION
// ==========================================
function updateSelectedTimes() {
  selectedTimes = [];
  document.querySelectorAll('.time-check:checked').forEach(cb => {
    selectedTimes.push(cb.value);
  });
  initializeTables();
}

function initializeTables() {
  createTable('levelAirTable', dataStructure.levelAir);
  createTable('flowDebitTable', dataStructure.flowDebit);
  createTable('pressureDistribusiTable', dataStructure.pressureDistribusi);
  createTable('hzDistribusiTable', dataStructure.hzDistribusi);
  createTable('pressureIntakeTable', dataStructure.pressureIntake);
  createTable('hzIntakeTable', dataStructure.hzIntake);
  createTable('wdcTable', dataStructure.wdc);
  createTable('backwashFilterTable', dataStructure.backwashFilter);
}

function createTable(tableId, items) {
  const table = document.getElementById(tableId);
  table.innerHTML = '';
  
  // Header row
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = '<th>Jenis Kegiatan</th><th>Satuan</th>';
  selectedTimes.forEach(time => {
    headerRow.innerHTML += `<th>${time}</th>`;
  });
  table.appendChild(headerRow);
  
  // Data rows
  items.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${item.name}</td><td>${item.satuan}</td>`;
    
    selectedTimes.forEach(time => {
      const inputId = `${tableId}_${index}_${time.replace(':', '')}`;
      row.innerHTML += `<td><input type="number" step="0.01" id="${inputId}" class="table-input"></td>`;
    });
    
    table.appendChild(row);
  });
}

// ==========================================
// DATA COLLECTION
// ==========================================
function collectFormData() {
  const data = {
    tanggal: document.getElementById('tanggal').value,
    hari: document.getElementById('hari').value,
    operator: {
      shift1: document.getElementById('operatorShift1').value,
      shift2: document.getElementById('operatorShift2').value
    },
    selectedTimes: selectedTimes,
    levelAir: collectTableData('levelAirTable', dataStructure.levelAir),
    flowDebit: collectTableData('flowDebitTable', dataStructure.flowDebit),
    pressureDistribusi: collectTableData('pressureDistribusiTable', dataStructure.pressureDistribusi),
    hzDistribusi: collectTableData('hzDistribusiTable', dataStructure.hzDistribusi),
    pressureIntake: collectTableData('pressureIntakeTable', dataStructure.pressureIntake),
    hzIntake: collectTableData('hzIntakeTable', dataStructure.hzIntake),
    wdc: collectTableData('wdcTable', dataStructure.wdc),
    backwashFilter: collectTableData('backwashFilterTable', dataStructure.backwashFilter),
    kwhMeter: {
      wbp1: document.getElementById('kwhWbp1').value,
      lwbp1: document.getElementById('kwhLwbp1').value,
      lwbp2: document.getElementById('kwhLwbp2').value,
      total: document.getElementById('kwhTotal').value
    },
    totalWM: {
      airBaku: document.getElementById('wmAirBaku').value,
      airBersih: document.getElementById('wmAirBersih').value
    },
    catatan: document.getElementById('catatan').value
  };
  
  return data;
}

function collectTableData(tableId, items) {
  const data = {};
  
  items.forEach((item, index) => {
    data[item.name] = {};
    selectedTimes.forEach(time => {
      const inputId = `${tableId}_${index}_${time.replace(':', '')}`;
      const input = document.getElementById(inputId);
      data[item.name][time] = input ? input.value : '';
    });
  });
  
  return data;
}

// ==========================================
// SUBMIT FINAL DATA
// ==========================================
async function submitFinalData() {
  if(!currentUser) {
    showNotification('❌ Anda harus login terlebih dahulu!', 'error');
    return;
  }
  
  const data = collectFormData();
  
  // Validasi
  if(!data.tanggal || !data.hari) {
    showNotification('⚠️ Tanggal dan hari harus diisi!', 'warning');
    return;
  }
  
  if(!confirm('⚠️ PERHATIAN!\n\nData yang sudah disubmit tidak bisa diubah lagi.\nYakin ingin submit data final ke Google Drive?')) {
    return;
  }
  
  const submitBtn = event?.target;
  const originalText = submitBtn?.textContent;
  if(submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Mengirim...';
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'saveProductionReport',
        userId: currentUser.userId,
        reportData: data
      }),
      mode: 'cors'
    });
    
    const result = await response.json();
    
    if(result.success) {
      showNotification('✓ Laporan berhasil disimpan!\n\nID: ' + result.data.recordId, 'success');
      
      // Hapus draft setelah submit
      if(currentDraftKey) {
        localStorage.removeItem(currentDraftKey);
        updateDraftIndicator();
      }
      
      // Reset form
      if(confirm('Data berhasil disimpan!\n\nReset form untuk input baru?')) {
        resetForm();
      }
    } else {
      showNotification('❌ Gagal menyimpan: ' + result.message, 'error');
    }
  } catch(error) {
    console.error('Submit error:', error);
    showNotification('❌ Error saat menyimpan: ' + error.message, 'error');
  } finally {
    if(submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

// ==========================================
// RESET & UTILITY
// ==========================================
function resetForm() {
  if(!confirm('Reset form? Semua data yang belum disimpan akan hilang!')) return;
  
  // Reset basic info
  document.getElementById('operatorShift1').value = '';
  document.getElementById('operatorShift2').value = '';
  
  // Reset KWH & WM
  document.getElementById('kwhWbp1').value = '';
  document.getElementById('kwhLwbp1').value = '';
  document.getElementById('kwhLwbp2').value = '';
  document.getElementById('kwhTotal').value = '';
  document.getElementById('wmAirBaku').value = '';
  document.getElementById('wmAirBersih').value = '';
  document.getElementById('catatan').value = '';
  
  // Reset all table inputs
  document.querySelectorAll('.table-input').forEach(input => {
    input.value = '';
  });
  
  showNotification('✓ Form berhasil direset!', 'success');
}

function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type} show`;
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 5000);
}

// ==========================================
// AUTO-SAVE DRAFT (OPTIONAL)
// ==========================================
let autoSaveTimer;
function startAutoSave() {
  // Auto save setiap 2 menit
  clearInterval(autoSaveTimer);
  autoSaveTimer = setInterval(() => {
    const tanggal = document.getElementById('tanggal').value;
    if(tanggal && currentUser) {
      saveDraft();
      console.log('✅ Auto-save draft');
    }
  }, 120000); // 2 menit
}

// Uncomment line berikut jika ingin aktifkan auto-save
// startAutoSave();
