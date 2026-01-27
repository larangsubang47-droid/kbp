const API_URL = 'https://script.google.com/macros/s/AKfycbwrO7QDfUUyuG4Ea5eC1wvbulDnEDwhbi1QgMfvbkE3l3OX5KaRmjGqk0ALER3cC4M/exec';
// Time slots dari 07:00 sampai 06:00 (24 jam)
const timeSlots = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', 
    '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', 
    '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'
];

// Field IDs
const fields = [
    'air-baku-intake-mdpl', 'air-baku-intake', 'reservoir', 'inlet-wtp', 'outlet-wtp',
    'pressure-pompa1', 'pressure-pompa2', 'pressure-pompa3',
    'hz-pompa1', 'hz-pompa2', 'hz-pompa3',
    'pressure-intake-pompa1', 'pressure-intake-pompa2', 'pressure-intake-pompa3',
    'hz-intake-pompa1', 'hz-intake-pompa2', 'hz-intake-pompa3',
    'kwh-wbp-exp1', 'kwh-lwbp1-exp2', 'kwh-lwbp2-exp3', 'kwh-total-ea-tot',
    'backwash-plan1', 'backwash-plan2',
    'level-wdc', 'lps-out-wdc'
];

// Initialize form
function initializeForm() {
    // Set tanggal hari ini
    document.getElementById('tanggal').valueAsDate = new Date();

    // Generate input untuk setiap field dan time slot
    fields.forEach(fieldId => {
        const container = document.getElementById(fieldId);
        if (!container) return;
        
        container.innerHTML = '';
        
        timeSlots.forEach(time => {
            const div = document.createElement('div');
            div.className = 'time-input';
            
            const label = document.createElement('div');
            label.className = 'time-label';
            label.textContent = time;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `${fieldId}-${time}`;
            input.placeholder = '-';
            
            div.appendChild(label);
            div.appendChild(input);
            container.appendChild(div);
        });
    });

    // Load config
    const savedUrl = localStorage.getItem('sheetUrl');
    if (savedUrl) {
        document.getElementById('sheetUrl').value = savedUrl;
    }
}

// Switch tab
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked tab button
    event.target.classList.add('active');
    
    // Load history if history tab
    if (tabName === 'history') {
        loadHistory();
    }
}

// Show alert
function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.className = `alert alert-${type} show`;
    alert.textContent = message;
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
}

// Clear form
function clearForm() {
    if (confirm('Apakah Anda yakin ingin mereset form?')) {
        document.getElementById('dataForm').reset();
        document.getElementById('tanggal').valueAsDate = new Date();
    }
}

// Save configuration
function saveConfig() {
    const url = document.getElementById('sheetUrl').value.trim();
    if (!url) {
        alert('Mohon masukkan URL Google Apps Script');
        return;
    }
    
    localStorage.setItem('sheetUrl', url);
    showAlert('Konfigurasi berhasil disimpan!', 'success');
}

// Test connection
async function testConnection() {
    const url = document.getElementById('sheetUrl').value.trim();
    if (!url) {
        alert('❌ Mohon masukkan URL Google Apps Script terlebih dahulu');
        return;
    }
    
    if (!url.includes('script.google.com')) {
        alert('❌ URL tidak valid!\n\nURL harus dari Google Apps Script dan mengandung "script.google.com"');
        return;
    }
    
    if (!url.endsWith('/exec')) {
        alert('⚠️ Peringatan: URL harus berakhiran /exec\n\nURL Anda berakhiran: ' + url.substring(url.length - 10) + '\n\nPastikan Anda copy URL yang benar dari deployment.');
    }
    
    const testBtn = event.target;
    const originalText = testBtn.innerHTML;
    testBtn.innerHTML = '⏳ Testing...';
    testBtn.disabled = true;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow'
        });
        
        const text = await response.text();
        console.log('Response:', text);
        
        try {
            const result = JSON.parse(text);
            if (result.success) {
                showAlert('✅ Koneksi berhasil! Google Sheets sudah terhubung dengan baik.\n\nPesan dari server: ' + result.message, 'success');
                alert('✅ KONEKSI BERHASIL!\n\nGoogle Apps Script sudah berjalan dengan baik.\nAnda sudah bisa mulai input data!');
            } else {
                showAlert('⚠️ Koneksi berhasil tapi ada masalah: ' + result.message, 'error');
            }
        } catch (parseError) {
            // Jika response bukan JSON, mungkin ada redirect atau error
            if (text.includes('Google')) {
                showAlert('⚠️ Sepertinya ada masalah dengan permission atau deployment.\n\nCoba buka URL ini di tab baru dan authorize: ' + url, 'error');
            } else {
                showAlert('❌ Response tidak valid. Pastikan deployment sudah benar.', 'error');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('❌ Koneksi gagal!\n\nError: ' + error.message + '\n\nPastikan:\n1. URL sudah benar\n2. Deployment "Who has access" = Anyone\n3. Sudah authorize access', 'error');
        alert('❌ KONEKSI GAGAL!\n\n' + error.message + '\n\nSolusi:\n1. Pastikan URL berakhiran /exec\n2. Pastikan deployment setting "Who has access" = Anyone\n3. Coba buka URL di tab baru untuk authorize');
    } finally {
        testBtn.innerHTML = originalText;
        testBtn.disabled = false;
    }
}

// Submit form
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('dataForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const sheetUrl = localStorage.getItem('sheetUrl');
        if (!sheetUrl) {
            alert('❌ Mohon konfigurasi Google Sheets terlebih dahulu di tab Konfigurasi!\n\nKlik tab "⚙️ Konfigurasi" dan ikuti langkah-langkah setup.');
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab')[2].classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById('config').classList.add('active');
            return;
        }
        
        // Validasi minimal ada beberapa data diisi
        const sampleInput = document.getElementById('air-baku-intake-mdpl-07:00').value;
        if (!sampleInput) {
            if (!confirm('⚠️ Anda belum mengisi data apapun. Lanjutkan menyimpan?')) {
                return;
            }
        }
        
        // Show loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '⏳ Menyimpan...';
        submitBtn.disabled = true;
        
        // Collect all data
        const formData = {
            action: 'save',
            tanggal: document.getElementById('tanggal').value,
            operator: document.getElementById('operator').value,
            shift: document.getElementById('shift').value,
            totalWmAirBaku: document.getElementById('total-wm-air-baku').value,
            totalWmAirBersih: document.getElementById('total-wm-air-bersih').value,
            catatan: document.getElementById('catatan').value,
            values: {}
        };
        
        // Collect all time-based inputs
        fields.forEach(fieldId => {
            timeSlots.forEach(time => {
                const input = document.getElementById(`${fieldId}-${time}`);
                const key = `${fieldId}-${time}`;
                formData.values[key] = input.value || '-';
            });
        });
        
        console.log('Sending data to:', sheetUrl);
        console.log('Data:', formData);
        
        // Send to Google Sheets
        try {
            const response = await fetch(sheetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                redirect: 'follow'
            });
            
            console.log('Response status:', response.status);
            
            // Karena mode: 'no-cors', kita tidak bisa baca response
            // Jadi kita asumsikan sukses jika tidak ada error
            showAlert('✅ Data berhasil dikirim ke Google Sheets! Silakan cek spreadsheet Anda.', 'success');
            
            // Clear form after successful submission
            setTimeout(() => {
                if (confirm('✅ Data berhasil disimpan!\n\nReset form untuk input data baru?')) {
                    clearForm();
                }
            }, 1500);
            
        } catch (error) {
            console.error('Error:', error);
            showAlert('❌ Error: ' + error.message + '\n\nPastikan URL Google Apps Script sudah benar dan deployment sudah sesuai panduan.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
});

// Load history
async function loadHistory() {
    const sheetUrl = localStorage.getItem('sheetUrl');
    if (!sheetUrl) {
        document.getElementById('historyTableBody').innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    Mohon konfigurasi Google Sheets terlebih dahulu di tab Konfigurasi
                </td>
            </tr>
        `;
        return;
    }
    
    try {
        const response = await fetch(sheetUrl, {
            method: 'POST',
            body: JSON.stringify({ action: 'load' })
        });
        
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            const tbody = document.getElementById('historyTableBody');
            tbody.innerHTML = result.data.map(record => `
                <tr>
                    <td>${record.tanggal}</td>
                    <td>${record.operator}</td>
                    <td>${record.shift}</td>
                    <td>${new Date(record.timestamp).toLocaleString('id-ID')}</td>
                    <td>${record.totalWmAirBaku}</td>
                    <td>${record.totalWmAirBersih}</td>
                    <td>
                        <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;">
                            👁️ Detail
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            document.getElementById('historyTableBody').innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px;">
                        Belum ada data tersimpan
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        showAlert('Error memuat history: ' + error.message, 'error');
    }
}

// Export to Excel
function exportToExcel() {
    const sheetUrl = localStorage.getItem('sheetUrl');
    if (!sheetUrl) {
        alert('Mohon konfigurasi Google Sheets terlebih dahulu');
        return;
    }
    
    alert('Untuk export ke Excel, silakan:\n1. Buka Google Sheets Anda\n2. Klik File → Download → Microsoft Excel (.xlsx)');
}

// Initialize on load

window.addEventListener('load', initializeForm);
