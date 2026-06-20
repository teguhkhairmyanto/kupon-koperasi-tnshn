import axios from 'axios';

// URL Endpoint dari Google Apps Script Web App
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbxX1gEuz5tzpK98-lDHK5baq5-fp01JmLNEhzsrxKvg9KG05yveIXXciOnZ9eqoBtdRGA/exec';

const apiService = {
  /**
   * Fungsi helper untuk mengubah payload menjadi query-string murni tanpa preflight OPTIONS
   */
  _request(action, payload) {
    const data = new URLSearchParams();
    data.append('action', action);
    data.append('payload', JSON.stringify(payload));
    
    return axios({
      method: 'post',
      url: GAS_API_URL,
      data: data.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });
  },

  /**
   * Fungsi login untuk Karyawan biasa (NRP, Nama, Tanggal Lahir)
   */
  loginUser(nrp, nama, tanggalLahir) {
    return this._request('login_user', { nrp, nama, tanggalLahir });
  },

  /**
   * Fungsi login untuk Admin (Username, Password)
   */
  loginAdmin(username, password) {
    return this._request('login_admin', { username, password });
  },

  /**
   * Fungsi mengambil daftar event berdasarkan NRP Karyawan
   */
  getEvents(nrp) {
    return this._request('get_user_events', { nrp });
  },

  /**
   * Ambil daftar pekerja yang terdaftar sebagai PENERIMA pada suatu event
   */
  getEventPenerima(eventId) {
    return this._request('get_event_penerima', { eventId });
  },

  getPenerimaKupon(eventId, nrp) {
    return this._request('get_penerima_kupon', { eventId, nrp });
  },

  /**
   * Kirim transaksi kupon baru ke Google Sheets
   */
  submitKupon(eventId, nrpPemberi, nrpPenerima, nominal) {
    return this._request('submit_kupon', { eventId, nrpPemberi, nrpPenerima, nominal });
  }
};

export default apiService;