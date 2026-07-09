<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
    <header class="bg-slate-900 border-b border-slate-800 px-4 py-4">
      <div class="max-w-3xl mx-auto flex items-center justify-between">
        <button 
          @click="router.push({ name: 'Dashboard' })" 
          class="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Kembali ke Menu
        </button>
        <span class="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 text-slate-400 border border-slate-800">
          ID Event: {{ eventId }}
        </span>
      </div>
    </header>

    <main class="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
        
        <div class="grid grid-cols-3 gap-3 mb-6">
  <!-- Card Total Anggaran -->
  <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
    <p class="text-[10px] text-slate-500 uppercase font-bold">Total Anggaran</p>
    <p class="text-xs font-mono font-bold text-slate-200 mt-1">
      Rp {{ budgetInfo.max.toLocaleString('id-ID') }}
    </p>
  </div>
  
  <!-- Card Terpakai -->
  <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
    <p class="text-[10px] text-slate-500 uppercase font-bold">Terpakai</p>
    <p class="text-xs font-mono font-bold text-rose-400 mt-1">
      Rp {{ budgetInfo.used.toLocaleString('id-ID') }}
    </p>
  </div>
  
  <!-- Card Sisa Saldo -->
  <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
    <p class="text-[10px] text-slate-500 uppercase font-bold">Sisa Saldo</p>
    <p class="text-xs font-mono font-bold text-emerald-400 mt-1">
      Rp {{ budgetInfo.remaining.toLocaleString('id-ID') }}
    </p>
  </div>
</div>

        <div v-if="pageLoading" class="py-12 flex flex-col items-center justify-center gap-3">
          <svg class="animate-spin h-8 w-8 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm text-slate-400 font-medium">Memuat data otorisasi event...</span>
        </div>

        <form v-else @submit.prevent="handleFormSubmit" class="space-y-5">
          <div v-if="statusMessage.text" :class="[statusMessage.isError ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400']" class="p-4 rounded-xl border text-sm flex items-start gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 shrink-0">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>{{ statusMessage.text }}</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pilih Karyawan Penerima</label>
            
            <div class="relative">
              <button 
                type="button" 
                @click="isDropdownOpen = !isDropdownOpen"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-left text-slate-200 focus:outline-none focus:border-emerald-500 text-sm transition-colors font-sans flex justify-between items-center"
              >
                <span class="truncate" :class="{'text-slate-500': !form.nrpPenerima}">
                  {{ selectedPenerimaText }}
                </span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500 transition-transform duration-200" :class="{'rotate-180': isDropdownOpen}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div 
                v-if="isDropdownOpen" 
                class="absolute z-20 w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-72 animate-fadeIn"
              >
                <div class="p-2 border-b border-slate-800/80 bg-slate-900/50">
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                    </span>
                    <input 
                      type="text" 
                      v-model="searchQuery" 
                      placeholder="Ketik Nama atau NRP..." 
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm transition-colors placeholder-slate-500"
                    />
                  </div>
                </div>

                <ul class="overflow-y-auto flex-1 p-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  <li 
                    v-for="penerima in filteredPenerimaList" 
                    :key="penerima.NRP"
                    @click="selectPenerima(penerima.NRP)"
                    class="px-3 py-3 hover:bg-slate-800 rounded-lg cursor-pointer text-sm text-slate-300 transition-colors flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1"
                  >
                    <span class="font-medium">{{ penerima.Nama }} <span class="text-slate-500 font-mono text-xs ml-1">({{ penerima.NRP }})</span></span>
                    <span class="text-emerald-400/90 font-mono text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Saldo: Rp {{ Number(penerima.Balance).toLocaleString('id-ID') }}
                    </span>
                  </li>
                  
                  <li v-if="filteredPenerimaList.length === 0" class="px-3 py-6 text-center">
                    <p class="text-xs text-amber-400 font-medium">⚠️ Karyawan tidak ditemukan.</p>
                  </li>
                </ul>
              </div>
            </div>

            <input type="text" v-model="form.nrpPenerima" required class="opacity-0 absolute h-0 w-0 pointer-events-none" tabindex="-1" />
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Nominal Kupon (Rp)</label>
              <span class="text-xs font-medium text-slate-500">
                Maksimal Plafon: <span class="text-amber-400 font-mono font-bold">Rp {{ Number(maxNominal).toLocaleString('id-ID') }}</span>
              </span>
            </div>
            <div class="relative">
              <span class="absolute left-4 top-3.5 text-slate-500 text-sm font-medium">Rp</span>
              <input 
                v-model.number="form.nominal" 
                type="number" 
                required 
                :min="1"
                :max="maxNominal"
                placeholder="Masukkan jumlah nominal kupon"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm font-mono transition-colors"
              />
            </div>
            <div>
            <br>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Keterangan / Notes (Opsional)</label>
            <textarea 
              v-model="form.notes"
              placeholder="Contoh: Nomor Kartu E-Tol"
              rows="3"
              class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
            ></textarea>
            </div>
            <div>
            <br>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">PIN Koperasi (6 Angka)</label>
            <input 
              v-model="form.pin"
              type="password" 
              required
              maxlength="6"
              pattern="\d{6}"
              placeholder="Masukkan 6 digit PIN Anda"
              class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
              @input="form.pin = form.pin.replace(/\D/g, '')"
            />
            <p class="text-[11px] text-slate-500 mt-1.5">
              * Wajib diisi sebagai verifikasi keamanan untuk mendistribusikan kupon.
            </p>
          </div>
            <p class="text-[11px] text-slate-500 mt-1.5">
              Nilai yang Anda masukkan wajib mematuhi ketentuan plafon anggaran event dari Administrator.
            </p>
          </div>
          
          <button 
            type="submit" 
            :disabled="isLoading || filteredPenerimaList.length === 0"
            class="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:opacity-50 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition duration-150 text-sm shadow-lg mt-4 flex items-center justify-center gap-2"
          >
            <svg v-if="isLoading" class="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? 'Memproses Alokasi Kupon...' : 'Kirim Kupon Digital' }}
          </button>
        </form>

      </div>
    </main>

    <div v-if="showPinSetupModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
          <div class="text-center space-y-2">
            <div class="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h3 class="text-lg font-bold text-slate-50">Aktivasi PIN Koperasi</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Demi keamanan akun, Anda diwajibkan membuat 6 digit PIN transaksi baru sebelum melakukan distribusi kupon koperasi.
            </p>
          </div>

          <form @submit.prevent="handleCreatePin" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Buat PIN Baru (6 Angka)</label>
              <input 
                type="password" 
                v-model="pinForm.newPin"
                maxlength="6"
                pattern="\d{6}"
                required
                placeholder="------"
                class="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 text-center tracking-widest text-slate-200 focus:outline-none focus:border-emerald-500 text-lg font-mono"
                @input="pinForm.newPin = pinForm.newPin.replace(/\D/g, '')"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Konfirmasi PIN Baru</label>
              <input 
                type="password" 
                v-model="pinForm.confirmPin"
                maxlength="6"
                pattern="\d{6}"
                required
                placeholder="------"
                class="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 text-center tracking-widest text-slate-200 focus:outline-none focus:border-emerald-500 text-lg font-mono"
                @input="pinForm.confirmPin = pinForm.confirmPin.replace(/\D/g, '')"
              />
            </div>

            <div v-if="pinModalError" class="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium text-center">
              {{ pinModalError }}
            </div>

            <button 
              type="submit"
              :disabled="isPinSubmitting"
              class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-sm py-2.5 rounded-lg transition-colors"
            >
              {{ isPinSubmitting ? 'Mengaktifkan PIN...' : 'Aktifkan PIN Sekarang' }}
            </button>
          </form>
        </div>
      </div>

  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiService from '../services/api';

const isDropdownOpen = ref(false);
const searchQuery = ref('');

const budgetInfo = ref({
  max: 0,
  used: 0,
  remaining: 0
});

const selectedPenerimaText = computed(() => {
  if (!form.value.nrpPenerima) return '-- Pilih Nama Karyawan (NRP) --';
  const found = penerimaList.value.find(p => p.NRP === form.value.nrpPenerima);
  return found ? `${found.Nama} - NRP: ${found.NRP}` : '-- Pilih Nama Karyawan (NRP) --';
});

/**
 * Fungsi saat opsi karyawan diklik dari dalam dropdown
 */
const selectPenerima = (nrp) => {
  form.value.nrpPenerima = nrp;
  isDropdownOpen.value = false; // Tutup dropdown
  searchQuery.value = ''; // Kosongkan pencarian
};

const route = useRoute();
const router = useRouter();

const eventId = ref(route.params.eventId);
const userSession = ref(null);

// State Loading & Data
const pageLoading = ref(true);
const isLoading = ref(false);
const maxNominal = ref(0);
const penerimaList = ref([]);

const form = ref({
  nrpPenerima: '',
  nominal: null,
  notes: '',
  pin: ''
});

const showPinSetupModal = ref(false);
const isPinSubmitting = ref(false);
const pinModalError = ref('');
const pinForm = ref({
  newPin: '',
  confirmPin: ''
});

const statusMessage = ref({
  text: '',
  isError: false
});

/**
 * Filter data untuk mencegah Self-Assignment
 */
const filteredPenerimaList = computed(() => {
  if (!userSession.value) return [];
  
  // 1. Filter awal: cegah user mengirim ke dirinya sendiri
  let list = penerimaList.value.filter(item => 
    String(item.NRP).trim() !== String(userSession.value.nrp).trim()
  );

  // 2. Filter kedua: jika ada teks pencarian
  if (searchQuery.value.trim() !== '') {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(item => 
      String(item.Nama).toLowerCase().includes(q) || 
      String(item.NRP).toLowerCase().includes(q)
    );
  }

  return list;
});

onMounted(async () => {
  const session = localStorage.getItem('user_session');
  if (!session) {
    router.push({ name: 'Login' });
    return;
  }
  // 1. Pastikan objek di-parse dan di-assign ke state reaktif terlebih dahulu secara sinkronus
  userSession.value = JSON.parse(session);

  // 2. Baru panggil fungsi inisialisasi halaman (sehingga userSession.value.nrp tidak akan bernilai null)
  await initializePageData();
});

/**
 * Tarik master data plafon nominal event dan daftar pekerja ber-role PENERIMA
 */
const initializePageData = async () => {
  pageLoading.value = true;
  try {
    // ==========================================
    // [ENHANCEMENT FITUR 3] CEK STATUS PIN USER
    // ==========================================
    await checkUserPinStatus(userSession.value.nrp);

    // 1. Ambil data event untuk mengekstrak Max_Nominal dengan konversi String (Mencegah Type Mismatch)
    const responseEvents = await apiService.getEvents(userSession.value.nrp);
    if (responseEvents.data.success) {
      const currentEvent = responseEvents.data.events.find(e => 
        String(e.Event_ID).trim() === String(eventId.value).trim()
      );
if (currentEvent) {
  // Ambil data langsung dari objek event yang sudah berisi Total_Budget
  const budget = Number(currentEvent.Total_Budget) || 0;
  const used = Number(currentEvent.Total_Distributed) || 0;
  
  budgetInfo.value = {
    max: budget,
    used: used,
    remaining: budget - used
  };
  maxNominal.value = Number(currentEvent.Max_Nominal) || 0;
      }
    }
    // 2. Ambil daftar karyawan ber-role PENERIMA di event ini (kini otomatis membawa info .Balance)
    const responsePenerima = await apiService.getEventPenerima(eventId.value);
    if (responsePenerima.data.success) {
      penerimaList.value = responsePenerima.data.penerima;
    } else {
      statusMessage.value = { text: 'Gagal memuat list pekerja penerima.', isError: true };
    }
  } catch (error) {
    console.error(error);
    statusMessage.value = { text: 'Gangguan koneksi mengambil data penugasan.', isError: true };
  } finally {
    pageLoading.value = false;
  }
};

/**
 * Handle proses submisi pembuatan kupon digital baru
 */
const handleFormSubmit = async () => {
  if (form.value.nominal > maxNominal.value) {
    statusMessage.value = { text: `Distribusi gagal! Nominal tidak boleh melebihi plafon Rp ${maxNominal.value.toLocaleString('id-ID')}`, isError: true };
    return;
  }
if (form.value.nominal > budgetInfo.value.remaining) {
    statusMessage.value = { 
      text: `Alokasi gagal! Sisa saldo anggaran tidak mencukupi. Sisa anggaran Anda saat ini hanya: Rp ${budgetInfo.value.remaining.toLocaleString('id-ID')}`, 
      isError: true 
    };
    return; // Hentikan proses jika anggaran tidak cukup
  }

  // 3. Lanjutkan jika validasi lolos
  isLoading.value = true;
  statusMessage.value = { text: '', isError: false };
  try {
    const response = await apiService.submitKupon(
      eventId.value,
      userSession.value.nrp,
      form.value.nrpPenerima,
      form.value.nominal,
      form.value.notes,
      form.value.pin
    );

    const data = response.data;

    if (data.success) {
      statusMessage.value = { text: '✓ Sukses! Kupon digital berhasil diterbitkan dan masuk ke dompet penerima.', isError: false };
      
      // Reset isian form setelah alokasi berhasil
      form.value.nrpPenerima = '';
      form.value.nominal = null;
      form.value.notes = '';
      form.value.pin = '';

      // Ambil data ulang agar info balance kupon ter-update secara real-time di dropdown!
      await initializePageData();
    } else {
      statusMessage.value = { text: data.message || 'Gagal mengirim kupon.', isError: true };
    }
  } catch (error) {
    console.error(error);
    statusMessage.value = { text: 'Terjadi error jaringan saat memproses kupon.', isError: true };
  } finally {
    isLoading.value = false;
  }
};

const checkUserPinStatus = async (nrp) => {
  try {
    const response = await apiService.checkAndSetPin({
      nrp: nrp,
      mode: 'CHECK'
    });
    if (response.data.success && !response.data.hasPin) {
      // Jika backend merespon sukses dan mendeteksi kolom PIN kosong, kunci layar dan tampilkan modal
      showPinSetupModal.value = true;
    }
  } catch (error) {
    console.error('Gagal memvalidasi status enkripsi PIN user.', error);
  }
};

/**
 * [ENHANCEMENT FITUR 3] Fungsi eksekusi pendaftaran PIN baru dari dalam Modal
 */
const handleCreatePin = async () => {
  pinModalError.value = '';
  
  if (pinForm.value.newPin.length !== 6 || pinForm.value.confirmPin.length !== 6) {
    pinModalError.value = 'PIN wajib diisi tepat 6 digit angka murni!';
    return;
  }
  
  if (pinForm.value.newPin !== pinForm.value.confirmPin) {
    pinModalError.value = 'Konfirmasi PIN tidak cocok! Harap periksa kembali.';
    return;
  }

  isPinSubmitting.value = true;
  try {
    const response = await apiService.checkAndSetPin({
      nrp: userSession.value.nrp,
      mode: 'SET_NEW_PIN',
      pinValue: pinForm.value.newPin
    });

    if (response.data.success) {
      alert('✓ Berhasil! PIN Koperasi Anda telah diaktifkan.');
      showPinSetupModal.value = false;
    } else {
      pinModalError.value = response.data.message || 'Gagal mengaktifkan PIN baru.';
    }
  } catch (error) {
    pinModalError.value = 'Terjadi kesalahan jaringan saat mencoba mendaftarkan PIN.';
  } finally {
    isPinSubmitting.value = false;
  }
};
</script>