function doPost(e) {
  try {
    // Log untuk debugging
    Logger.log('Request received');
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    Logger.log('Action: ' + data.action);
    
    if (data.action === 'save') {
      // Header jika sheet kosong
      if (sheet.getLastRow() === 0) {
        const headers = ['Timestamp', 'Tanggal', 'Operator', 'Shift'];
        const times = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', 
                       '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', 
                       '03:00', '04:00', '05:00', '06:00'];
        
        const fields = [
          'Air Baku Intake Mdpl', 'Air Baku Intake cm', 'Reservoir', 'Inlet WTP', 'Outlet WTP',
          'Pressure Pompa 1', 'Pressure Pompa 2', 'Pressure Pompa 3',
          'Hz Pompa 1', 'Hz Pompa 2', 'Hz Pompa 3',
          'Pressure Intake Pompa 1', 'Pressure Intake Pompa 2', 'Pressure Intake Pompa 3',
          'Hz Intake Pompa 1', 'Hz Intake Pompa 2', 'Hz Intake Pompa 3',
          'Kwh WBP/EA_EXP1', 'Kwh LWBP1/EA_EXP2', 'Kwh LWBP2/EA_EXP3', 'Kwh Total/EA_TOT',
          'Backwash Plan 1', 'Backwash Plan 2',
          'Level WDC', 'LPS OUT WDC'
        ];
        
        fields.forEach(field => {
          times.forEach(time => {
            headers.push(field + ' ' + time);
          });
        });
        
        headers.push('Total WM Air Baku', 'Total WM Air Bersih', 'Catatan');
        sheet.appendRow(headers);
        Logger.log('Headers created');
      }
      
      // Tambah data baru
      const row = [
        new Date(),
        data.tanggal,
        data.operator,
        data.shift
      ];
      
      // Tambahkan semua data per jam
      Object.keys(data.values).forEach(key => {
        row.push(data.values[key]);
      });
      
      row.push(data.totalWmAirBaku, data.totalWmAirBersih, data.catatan);
      
      sheet.appendRow(row);
      Logger.log('Data saved successfully');
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Data berhasil disimpan ke Google Sheets!'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'load') {
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) {
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          data: []
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const dataRange = sheet.getRange(2, 1, lastRow - 1, 7);
      const values = dataRange.getValues();
      
      const records = values.map(row => ({
        timestamp: row[0],
        tanggal: row[1],
        operator: row[2],
        shift: row[3],
        totalWmAirBaku: row[4] || '',
        totalWmAirBersih: row[5] || '',
        catatan: row[6] || ''
      }));
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: records.reverse()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Google Apps Script berjalan dengan baik!'
  })).setMimeType(ContentService.MimeType.JSON);
}