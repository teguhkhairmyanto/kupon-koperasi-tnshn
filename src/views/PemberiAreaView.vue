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
        
        <div class="mb-6 border-b border-slate-800/60 pb-4">
          <h2 class="text-xl font-bold text-slate-100">Alokasi & Distribusi Kupon</h2>
          <p class="text-sm text-slate-400 mt-1">
            Silakan tentukan penerima kupon dan jumlah nominal kupon yang ingin diberikan untuk event ini.
          </p>
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
            <select 
              v-model="form.nrpPenerima" 
              required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm transition-colors cursor-pointer font-sans"
            >
              <option value="" disabled selected>-- Pilih Nama Karyawan (NRP) --</option>
              <option 
                v-for="penerima in filteredPenerimaList" 
                :key="penerima.NRP" 
                :value="penerima.NRP"
              >
                {{ penerima.Nama }} - NRP: {{ penerima.NRP }} - (Saldo: Rp {{ Number(penerima.Balance).toLocaleString('id-ID') }})
              </option>
            </select>
            <p v-if="filteredPenerimaList.length === 0" class="text-xs text-amber-400 mt-2">
              ⚠️ Tidak ada daftar penerima terdaftar atau peran Anda terbentrok di event ini.
            </p>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiService from '../services/api';

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
  nominal: null
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
  return penerimaList.value.filter(item => String(item.NRP).trim() !== String(userSession.value.nrp).trim());
});

onMounted(async () => {
  const session = localStorage.getItem('user_session');
  if (!session) {
    router.push({ name: 'Login' });
    return;
  }
  userSession.value = JSON.parse(session);

  await initializePageData();
});

/**
 * Tarik master data plafon nominal event dan daftar pekerja ber-role PENERIMA
 */
const initializePageData = async () => {
  pageLoading.value = true;
  try {
    // 1. Ambil data event untuk mengekstrak Max_Nominal dengan konversi String (Mencegah Type Mismatch)
    const responseEvents = await apiService.getEvents(userSession.value.nrp);
    if (responseEvents.data.success) {
      const currentEvent = responseEvents.data.events.find(e => 
        String(e.Event_ID).trim() === String(eventId.value).trim()
      );
      if (currentEvent) {
        maxNominal.value = Number(currentEvent.Max_Nominal);
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

  isLoading.value = true;
  statusMessage.value = { text: '', isError: false };

  try {
    const response = await apiService.submitKupon(
      eventId.value,
      userSession.value.nrp,
      form.value.nrpPenerima,
      form.value.nominal
    );

    const data = response.data;

    if (data.success) {
      statusMessage.value = { text: '✓ Sukses! Kupon digital berhasil diterbitkan dan masuk ke dompet penerima.', isError: false };
      
      // Reset isian form setelah alokasi berhasil
      form.value.nrpPenerima = '';
      form.value.nominal = null;

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
</script>