// Konfigurasi Admin Statis (Ubah sesuai kebutuhan, amankan sejak awal)
const ADMIN_CREDENTIALS = {
  username: "admin_koperasi",
  password: "SuperPasswordTN2026"
};

/**
 * Health Check Endpoint (Untuk tes akses langsung via Browser)
 * Menerima request GET
 */
function doGet(e) {
  const healthStatus = {
    success: true,
    status: "ONLINE",
    message: "API Kupon Koperasi TN SHN active and ready.",
    timestamp: new Date().toISOString()
  };
  
  return ContentService.createTextOutput(JSON.stringify(healthStatus))
                       .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Gateway API Utama (REST Endpoint)
 * Menerima request POST dari Vue.js via URLSearchParams
 */
function doPost(e) {
  if (typeof e === 'undefined' || !e.parameter) {
    return ContentService.createTextOutput(JSON.stringify({ error: "No data received" }))
                         .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const action = e.parameter.action;
    const payload = JSON.parse(e.parameter.payload);

    let response;

    // Routing Action Utama
    if (action === "login_user") {
      response = handleUserLogin(payload);
    } else if (action === "login_admin") {
      response = handleAdminLogin(payload);
    } else if (action === "get_user_events") {
      response = handleGetUserEvents(payload);
    } else if (action === "get_event_penerima") {
      response = handleGetEventPenerima(payload);
    } else if (action === "submit_kupon") {
      response = handleSubmitKupon(payload);
    } else if (action === "get_penerima_kupon") {
      response = handleGetPenerimaKupon(payload);
    } else if (action === "claim_kupon") { // Slot Route Aksi Scanner Admin
      response = handleClaimKupon(payload);
    } else if (action === "check_and_set_pin") { // <-- TAMBAHKAN BLOK INI
      response = handleCheckAndSetPin(payload);
    } else {
      response = { success: false, message: "Action tidak dikenali" };
    }

    return ContentService.createTextOutput(JSON.stringify(response))
                         .setMimeType(ContentService.MimeType.JSON); 

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Logika Login untuk User Biasa (NRP + Nama + Tanggal Lahir)
 * Menggunakan nama sheet tunggal: master_user
 */
function handleUserLogin(payload) {
  const { nrp, nama, tanggalLahir } = payload;
  
  const cleanNrp = String(nrp).trim();
  const cleanNama = String(nama).trim().toLowerCase();
  const cleanTglLahir = String(tanggalLahir).trim(); 

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("master_user"); // PENYESUAIAN: master_user
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const dbNrp = String(data[i][0]).trim();
    const dbNama = String(data[i][1]).trim().toLowerCase();
    
    let dbTglLahir = "";
    if (data[i][2] instanceof Date) {
      dbTglLahir = Utilities.formatDate(data[i][2], ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
    } else {
      dbTglLahir = String(data[i][2]).trim();
    }
    
    const dbIsActive = data[i][3];

    if (dbNrp === cleanNrp && dbNama === cleanNama && dbTglLahir === cleanTglLahir) {
      if (dbIsActive === true || String(dbIsActive).toUpperCase() === "TRUE") {
        return {
          success: true,
          role: "USER",
          user: {
            nrp: data[i][0],
            nama: data[i][1]
          }
        };
      } else {
        return { success: false, message: "Akun Anda dinonaktifkan oleh Admin." };
      }
    }
  }

  return { success: false, message: "Kredensial salah. NRP, Nama, atau Tanggal Lahir tidak cocok." };
}

/**
 * Logika Login untuk Admin (Username + Password Statis)
 */
function handleAdminLogin(payload) {
  const { username, password } = payload;

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    return {
      success: true,
      role: "ADMIN",
      user: {
        nama: "Administrator Koperasi"
      }
    };
  }

  return { success: false, message: "Username atau Password Admin salah." };
}

/**
 * Ambil daftar event dan role dinamis berdasarkan NRP pekerja (Context-Based RBAC)
 * Menggunakan nama sheet tunggal: master_event
 */
/**
 * Ambil daftar event dan role dinamis berdasarkan NRP pekerja (Context-Based RBAC)
 * Penyesuaian: Menghitung total saldo kupon AVAILABLE khusus untuk role PENERIMA
 */
function handleGetUserEvents(payload) {
  const { nrp } = payload;
  const cleanNrp = String(nrp).trim().replace(/^'/, "");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Baca otorisasi event & perannya
  const authSheet = ss.getSheetByName("event_authorizations");
  const authData = authSheet.getDataRange().getValues();
  
  const userAuthMap = {};
  for (let i = 1; i < authData.length; i++) {
    const dbEventId = String(authData[i][1]).trim().toUpperCase().replace(/^'/, "");
    const dbNrp = String(authData[i][2]).trim().replace(/^'/, "");
    const dbRole = String(authData[i][3]).trim().toUpperCase(); 

    if (dbNrp === cleanNrp) {
      userAuthMap[dbEventId] = dbRole;
    }
  }

  // 2. Hitung Sisa Saldo (Untuk Penerima) DAN Total Distribusi (Untuk Budgeting Pemberi)
  const transaksiSheet = ss.getSheetByName("transaksi_kupon");
  const transaksiData = transaksiSheet.getDataRange().getValues();
  
  const saldoMap = {};          // Key: Event_ID, Value: Total Saldo Available Penerima
  const totalDistributedMap = {}; // Key: Event_ID, Value: Total Nominal yang sudah keluar (Budget)

  for (let k = 1; k < transaksiData.length; k++) {
    const tEventId = String(transaksiData[k][1]).trim().toUpperCase().replace(/^'/, "");
    const tNrpPenerima = String(transaksiData[k][3]).trim().replace(/^'/, "");
    const tNominal = Number(transaksiData[k][4]) || 0;
    const tStatus = String(transaksiData[k][5]).trim().toUpperCase();

    // A. Hitung Total Distribusi untuk Budgeting (Ambil semua kupon yang AVAILABLE atau CLAIMED)
    if (tStatus === "AVAILABLE" || tStatus === "CLAIMED") {
      if (!totalDistributedMap[tEventId]) totalDistributedMap[tEventId] = 0;
      totalDistributedMap[tEventId] += tNominal;
    }

    // B. Hitung Saldo Penerima (Logic asli Anda)
    if (tNrpPenerima === cleanNrp && tStatus === "AVAILABLE") {
      if (!saldoMap[tEventId]) saldoMap[tEventId] = 0;
      saldoMap[tEventId] += tNominal;
    }
  }

  // 3. Gabungkan ke data master_event
  const eventSheet = ss.getSheetByName("master_event");
  const eventData = eventSheet.getDataRange().getValues();
  const matchedEvents = [];

  for (let j = 1; j < eventData.length; j++) {
    const eventId = String(eventData[j][0]).trim().toUpperCase().replace(/^'/, "");
    
    if (userAuthMap[eventId]) {
      const userRole = userAuthMap[eventId];
      matchedEvents.push({
        Event_ID: eventData[j][0],
        Nama_Event: eventData[j][1],
        Max_Nominal: eventData[j][2],
        Role: userRole,
        // Semburkan total saldo available jika perannya adalah PENERIMA
        Total_Saldo_Penerima: userRole === "PENERIMA" ? (saldoMap[eventId] || 0) : 0
      });
    }
  }

  return {
    success: true,
    events: matchedEvents
  };
}

/**
 * Ambil daftar semua user yang ber-role PENERIMA pada suatu Event_ID khusus
 * Menggunakan nama sheet tunggal: master_user
 */
function handleGetEventPenerima(payload) {
  const { eventId } = payload;
  const cleanEventId = String(eventId).trim();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const userSheet = ss.getSheetByName("master_user"); // PENYESUAIAN: master_user
  const userData = userSheet.getDataRange().getValues();
  const userMap = {};
  for (let i = 1; i < userData.length; i++) {
    userMap[String(userData[i][0]).trim()] = userData[i][1]; 
  }

  const transaksiSheet = ss.getSheetByName("transaksi_kupon");
  const transaksiData = transaksiSheet.getDataRange().getValues();
  const balanceMap = {}; 
  
  for (let k = 1; k < transaksiData.length; k++) {
    const tEventId = String(transaksiData[k][1]).trim();
    const tNrpPenerima = String(transaksiData[k][3]).trim();
    const tNominal = Number(transaksiData[k][4]) || 0;
    const tStatus = String(transaksiData[k][5]).trim().toUpperCase();

    if (tEventId === cleanEventId && tStatus === "AVAILABLE") {
      if (!balanceMap[tNrpPenerima]) {
        balanceMap[tNrpPenerima] = 0;
      }
      balanceMap[tNrpPenerima] += tNominal;
    }
  }

  const authSheet = ss.getSheetByName("event_authorizations");
  const authData = authSheet.getDataRange().getValues();
  const penerimaList = [];

  for (let j = 1; j < authData.length; j++) {
    const dbEventId = String(authData[j][1]).trim();
    const dbNrp = String(authData[j][2]).trim();
    const dbRole = String(authData[j][3]).trim();

    if (dbEventId === cleanEventId && dbRole === "PENERIMA") {
      const currentNrp = dbNrp;
      penerimaList.push({
        NRP: currentNrp,
        Nama: userMap[currentNrp] || "Nama Tidak Ditemukan",
        Balance: balanceMap[currentNrp] || 0 
      });
    }
  }

  return {
    success: true,
    penerima: penerimaList
  };
}

/**
 * Memproses penyimpanan transaksi distribusi kupon baru ke Google Sheets
 * Menggunakan nama sheet tunggal: master_event
 */
function handleSubmitKupon(payload) {
  const { eventId, nrpPemberi, nrpPenerima, nominal, notes, pin } = payload;

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const userSheet = ss.getSheetByName("master_user");
  const userData = userSheet.getDataRange().getValues();
  let validPin = "";
  
  // Cari PIN asli milik Pemberi di database
  for (let u = 1; u < userData.length; u++) {
    if (String(userData[u][0]).trim() === String(nrpPemberi).trim()) {
      validPin = userData[u][4] ? String(userData[u][4]).trim() : "";
      break;
    }
  }

  // Jika PIN belum diatur sama sekali di database
  if (validPin === "") {
    return { success: false, message: "Aksi Ditolak! Anda belum mengaktifkan PIN Koperasi." };
  }
  
  // Jika PIN yang diinput TIDAK COCOK dengan database
  if (String(pin).trim() !== validPin) {
    return { success: false, message: "Transaksi Gagal! PIN Koperasi yang Anda masukkan salah." };
  }
  // --- BATAS AKHIR COPY ---
  
  const eventSheet = ss.getSheetByName("master_event"); // PENYESUAIAN: master_event
  const eventData = eventSheet.getDataRange().getValues();
  let maxNominal = 0;
  
  for (let i = 1; i < eventData.length; i++) {
    if (String(eventData[i][0]).trim() === String(eventId).trim()) {
      maxNominal = Number(eventData[i][2]);
      break;
    }
  }

  if (Number(nominal) > maxNominal) {
    return { success: false, message: "Pencegahan Sistem: Nominal kupon melebihi plafon maksimal event ini!" };
  }

  const cryptographicKuponId = "KPN-" + Utilities.getUuid().substring(0, 13).toUpperCase();
  const transaksiSheet = ss.getSheetByName("transaksi_kupon");
  const timestamp = new Date();
  
  const textNrpPemberi = "'" + String(nrpPemberi).trim();
  const textNrpPenerima = "'" + String(nrpPenerima).trim();
  const textEventId = "'" + String(eventId).trim();
  const cleanNotes = notes ? String(notes).trim() : "";

  transaksiSheet.appendRow([
    cryptographicKuponId,
    textEventId,
    textNrpPemberi,
    textNrpPenerima,
    Number(nominal),
    "AVAILABLE",
    timestamp,
    "",
    cleanNotes
  ]);

  return {
    success: true,
    kuponId: cryptographicKuponId
  };
}

/**
 * Ambil daftar kupon yang dimiliki oleh Penerima tertentu berdasarkan Event_ID
 * Modifikasi: Mengembalikan Nama_Pemberi hasil cross-reference dari master_user
 */
function handleGetPenerimaKupon(payload) {
  const { eventId, nrp } = payload;
  
  const cleanEventId = String(eventId).trim().toUpperCase().replace(/^'/, "");
  const cleanNrp = String(nrp).trim().replace(/^'/, "");
  const numericNrp = Number(cleanNrp);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Ambil data master_user untuk pemetaan NRP -> Nama Pemberi
  const userSheet = ss.getSheetByName("master_user");
  const userData = userSheet.getDataRange().getValues();
  const userMap = {};
  for (let i = 1; i < userData.length; i++) {
    userMap[String(userData[i][0]).trim().replace(/^'/, "")] = userData[i][1]; // Map NRP ke Nama
  }

  const sheet = ss.getSheetByName("transaksi_kupon");
  if (sheet.getLastRow() < 2) {
    return { success: true, kupons: [] };
  }
  
  const data = sheet.getDataRange().getValues();
  const kuponList = [];

  for (let i = 1; i < data.length; i++) {
    const dbKuponId = String(data[i][0]).trim();
    const dbEventId = String(data[i][1]).trim().toUpperCase().replace(/^'/, "");
    const dbNrpPemberi = String(data[i][2]).trim().replace(/^'/, "");
    const dbNrpPenerima = String(data[i][3]).trim().replace(/^'/, "");
    const dbNominal = data[i][4];
    const dbStatus = String(data[i][5]).trim();
    const dbGeneratedAt = data[i][6];
    const dbClaimedAt = data[i][7];

    if (dbEventId === cleanEventId) {
      if (dbNrpPenerima === cleanNrp || (Number(dbNrpPenerima) === numericNrp && numericNrp > 0)) {
        
        // Dapatkan nama asli pemberi dari userMap, jika tidak ketemu tampilkan NRP aslinya
        const namaPemberiAsli = userMap[dbNrpPemberi] || ("NRP " + dbNrpPemberi);

        kuponList.push({
          Kupon_ID: dbKuponId,
          NRP_Pemberi: dbNrpPemberi,
          Nama_Pemberi: namaPemberiAsli, // Properti Baru yang dikirim ke Vue
          Nominal: dbNominal,
          Status: dbStatus,
          Generated_At: dbGeneratedAt,
          Claimed_At: dbClaimedAt ? dbClaimedAt : null
        });
      }
    }
  }

  return {
    success: true,
    kupons: kuponList
  };
}

/**
 * Memproses pemindaian klaim kupon tunggal dari HP Admin
 * Perbaikan: Kebal terhadap double quotes ("") hasil parsing JSON stringify
 */

function handleClaimKupon(payload) {
  let kuponId = "";

  // 1. DETEKSI & BONGKAR DATA JIKA PAYLOAD BERBENTUK OBJEK (Solusi [object Object])
  if (payload && typeof payload === 'object') {
    // Jika objek memiliki properti atau key, ambil nilai pertamanya (karena kita hanya mengirim string kuponId)
    const keys = Object.keys(payload);
    if (keys.length > 0) {
      // Skenario A: Jika dikirim sebagai objek key-value murni
      kuponId = String(payload[keys[0]]).trim(); 
    } else {
      // Skenario B: Jika objek kosong atau bentuk argumen aneh, paksa stringify lalu bersihkan
      kuponId = String(payload).trim();
    }
  } else {
    // Skenario C: Jika payload sudah datang sebagai string murni
    kuponId = String(payload).trim();
  }

  // 2. SANITASI EKSTRA (Menghilangkan tanda petik ganda hasil JSON.stringify dan petik satu Sheets)
  if (kuponId.startsWith('"') && kuponId.endsWith('"')) {
    kuponId = kuponId.substring(1, kuponId.length - 1);
  }
  kuponId = kuponId.replace(/^'/, "").trim(); 

  // LOG UNTUK DEBUGGING (Bisa dilihat di Executions Google Apps Script)
  Logger.log("ID Kupon Hasil Ekstraksi Backend: " + kuponId);

  // Jika setelah dibongkar tetap menghasilkan [object Object] atau kosong, kunci pengaman diaktifkan
  if (!kuponId || kuponId.includes("[object")) {
    return { 
      success: false, 
      message: "ERROR BACKEND:\nSistem gagal mengurai payload. Teks terbaca: " + kuponId + ".\nMohon hubungi Tim IT." 
    };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("transaksi_kupon");
  
  if (!sheet || sheet.getLastRow() < 2) {
    return { success: false, message: "Database transaksi kupon tidak ditemukan atau masih kosong." };
  }

  const data = sheet.getDataRange().getValues();
  let rowIdx = -1;
  let currentStatus = "";
  let nominalKupon = 0;
  let nrpPenerima = "";

  // 3. Pencarian Baris Kupon di Database Spreadsheet
  for (let i = 1; i < data.length; i++) {
    const dbKuponId = String(data[i][0]).trim().replace(/^'/, "");
    if (dbKuponId === kuponId) {
      rowIdx = i + 1; // Konversi ke 1-based index Sheets
      currentStatus = String(data[i][5]).trim().toUpperCase();
      nominalKupon = data[i][4];
      nrpPenerima = String(data[i][3]).trim().replace(/^'/, "");
      break;
    }
  }

  // 4. Blok Validasi Keamanan Sistem
  if (rowIdx === -1) {
    return { 
      success: false, 
      message: "ERROR: Kode QR (" + kuponId + ") tidak terdaftar di dalam sistem koperasi!" 
    };
  }

  if (currentStatus === "CLAIMED") {
    return { 
      success: false, 
      message: "FRAUD ALERT!\nKupon " + kuponId + " ini sudah pernah dicairkan sebelumnya dan tidak dapat digunakan kembali." 
    };
  }

  if (currentStatus !== "AVAILABLE") {
    return { success: false, message: "ERROR: Status kupon tidak valid (" + currentStatus + ")." };
  }

  // 5. Eksekusi Mutasi Database Kerja Koperasi
  try {
    const timestampSekarang = new Date();
    
    sheet.getRange(rowIdx, 6).setValue("CLAIMED"); // Kolom F
    sheet.getRange(rowIdx, 8).setValue(timestampSekarang); // Kolom H
    SpreadsheetApp.flush(); 

    return {
      success: true,
      message: "Kupon berhasil dicairkan!",
      kupon: {
        id: kuponId,
        nominal: nominalKupon,
        penerima: nrpPenerima,
        status: "CLAIMED"
      }
    };

  } catch (error) {
    return { success: false, message: "Gagal menulis ke database: " + error.toString() };
  }
}

function handleCheckAndSetPin(payload) {
  const { nrp, mode, pinValue } = payload;
  const cleanNrp = String(nrp).trim();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("master_user");
  const data = sheet.getDataRange().getValues();

  let userRowIdx = -1;
  let currentPin = "";

  // Cari letak baris data karyawan berdasarkan NRP
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === cleanNrp) {
      userRowIdx = i + 1; // Konversi ke index 1-based Sheets
      currentPin = data[i][4] ? String(data[i][4]).trim() : ""; // Kolom E (PIN)
      break;
    }
  }

  if (userRowIdx === -1) {
    return { success: false, message: "User tidak ditemukan di master data." };
  }

  // Skenario 1: Hanya mengecek status keberadaan PIN
  if (mode === "CHECK") {
    return {
      success: true,
      hasPin: currentPin !== ""
    };
  }

  // Skenario 2: Mendaftarkan PIN Baru untuk pertama kali
  if (mode === "SET_NEW_PIN") {
    if (currentPin !== "") {
      return { success: false, message: "Aksi ditolak. Anda sudah memiliki PIN aktif." };
    }
    if (!/^\d{6}$/.test(pinValue)) {
      return { success: false, message: "Format PIN tidak valid. Wajib 6 digit angka murni." };
    }

    // Simpan ke Kolom E dengan tambahan petik satu agar string angka tidak terpotong (misal: 012345)
    sheet.getRange(userRowIdx, 5).setValue("'" + pinValue);
    SpreadsheetApp.flush();
    return { success: true, message: "PIN Koperasi berhasil diaktifkan!" };
  }

  return { success: false, message: "Mode parameter tidak dikenali." };
}