<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
    <header class="bg-slate-900 border-b border-slate-800 px-4 py-4 sticky top-0 z-40">
      <div class="max-w-3xl mx-auto flex items-center justify-between">
        <button 
          @click="router.push({ name: 'Dashboard' })" 
          class="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Kembali
        </button>
        <span class="text-sm font-bold text-slate-200">Dompet Kupon Digital</span>
      </div>
    </header>

    <main class="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col">
      
      <div v-if="isLoading" class="py-20 flex flex-col items-center justify-center gap-3-1 flex-1 justify-center">
        <svg class="animate-spin h-8 w-8 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm text-slate-400 font-medium">Sinkronisasi dompet kupon...</span>
      </div>

      <div v-else class="space-y-5 flex-1 flex flex-col">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex justify-between items-center shadow-lg">
          <div>
            <span class="text-[10px] text-emerald-400 font-mono uppercase font-bold tracking-wider block">Event Terkait</span>
            <h3 class="text-lg font-bold text-slate-100 mt-0.5 tracking-tight">{{ namaEvent || eventId }}</h3>
          </div>
          <button @click="loadKuponList" class="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all active:scale-95 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4 h-4 text-slate-300">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        <div class="flex p-1 bg-slate-900 border border-slate-800 rounded-xl shadow-inner">
          <button 
            @click="activeTab = 'available'"
            :class="[activeTab === 'available' ? 'bg-slate-800 text-emerald-400 font-bold border-slate-700/60 shadow-md' : 'text-slate-400 hover:text-slate-200 border-transparent font-medium']"
            class="flex-1 py-3 text-xs uppercase tracking-wider rounded-lg transition-all border text-center flex items-center justify-center gap-2"
          >
             Tersedia
            <span :class="[activeTab === 'available' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-950 text-slate-500']" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold">
              {{ availableKupons.length }}
            </span>
          </button>
          <button 
            @click="activeTab = 'claimed'"
            :class="[activeTab === 'claimed' ? 'bg-slate-800 text-amber-400 font-bold border-slate-700/60 shadow-md' : 'text-slate-400 hover:text-slate-200 border-transparent font-medium']"
            class="flex-1 py-3 text-xs uppercase tracking-wider rounded-lg transition-all border text-center flex items-center justify-center gap-2"
          >
            Riwayat Klaim
            <span :class="[activeTab === 'claimed' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-950 text-slate-500']" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold">
              {{ claimedKupons.length }}
            </span>
          </button>
        </div>

        <div class="flex-1">
          <div v-if="currentTabKupons.length === 0" class="border border-dashed border-slate-800 rounded-2xl p-12 text-center bg-slate-900/20">
            <div class="w-12 h-12 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-500 mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.008 1.24l.885 1.77a2.25 2.25 0 0 0 2.007 1.24h1.98a2.25 2.25 0 0 0 2.007-1.24l.885-1.77a2.25 2.25 0 0 1 2.007-1.24h3.86m-18 0h18" />
              </svg>
            </div>
            <p class="text-sm text-slate-400 font-medium">
              {{ activeTab === 'available' ? 'Tidak ada kupon yang tersedia' : 'Belum ada riwayat pencairan kupon' }}
            </p>
            <p class="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
              {{ activeTab === 'available' ? 'Kupon digital Anda yang siap dipakai akan otomatis masuk ke tab ini setelah dialokasikan oleh tim Pemberi.' : 'Seluruh kupon yang sukses dipindai dan dicairkan oleh Admin koperasi di lapangan akan diarsipkan di sini.' }}
            </p>
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="kupon in currentTabKupons" 
              :key="kupon.Kupon_ID"
              :class="[kupon.Status === 'CLAIMED' ? 'bg-slate-900/40 border-slate-900 border-opacity-30' : 'bg-slate-900 border-slate-800 hover:border-slate-700/80 transition-all']"
              class="border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono text-slate-500 tracking-tight">{{ kupon.Kupon_ID }}</span>
                  <span 
                    :class="[kupon.Status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700']"
                    class="text-[10px] font-bold px-2 py-0.5 rounded border tracking-wider uppercase font-mono"
                  >
                    {{ kupon.Status === 'AVAILABLE' ? 'Ready' : 'Claimed' }}
                  </span>
                </div>
                <div class="text-2xl font-black font-mono tracking-tight text-slate-100 pt-1">
                  Rp {{ Number(kupon.Nominal).toLocaleString('id-ID') }}
                </div>
                <div class="text-[11px] text-slate-400 flex items-center gap-1">
                  <span class="text-slate-500">Diberikan oleh:</span> 
                  <span class="font-medium text-slate-300">{{ kupon.Nama_Pemberi }}</span>
                </div>
                <div class="text-[10px] text-slate-500 font-mono">
                  Diterbitkan: {{ formatDateString(kupon.Generated_At) }}
                </div>
                <div v-if="kupon.Status === 'CLAIMED' && kupon.Claimed_At" class="text-[11px] text-amber-400/90 font-medium pt-1.5 flex items-center gap-1.5">
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Dicairkan: {{ formatDateString(kupon.Claimed_At) }}
                </div>
              </div>

              <div class="flex items-center sm:justify-end">
                <button 
                  v-if="kupon.Status === 'AVAILABLE'"
                  @click="openQrModal(kupon)"
                  class="w-full sm:w-auto bg-slate-800 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 border border-slate-700 hover:border-emerald-500 font-bold py-2.5 px-4 rounded-xl transition duration-150 text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                  </svg>
                  Tampilkan QR Code
                </button>
                <div v-else class="text-xs font-semibold text-slate-600 flex items-center gap-1.5 px-3 py-2 bg-slate-950 rounded-xl border border-slate-900">
                  🔒 Kupon Terpakai
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="activeModalKupon" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" @click.self="closeQrModal">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div class="flex justify-between items-center mb-4">
          <span class="text-xs font-mono text-slate-500">Isi QR: {{ activeModalKupon.Kupon_ID }}</span>
          <button @click="closeQrModal" class="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nominal Klaim Kupon</h4>
        <div class="text-2xl font-black font-mono text-emerald-400 mb-5">
          Rp {{ Number(activeModalKupon.Nominal).toLocaleString('id-ID') }}
        </div>

        <div class="bg-white p-4 rounded-xl inline-block shadow-inner mb-5">
          <canvas ref="qrCanvasRef"></canvas>
        </div>

        <p class="text-xs text-slate-400 leading-relaxed px-2">
          Tunjukkan gambar QR Code di atas secara langsung ke kamera scanner **Administrator** lapangan untuk memproses pencairan klaim kupon tunggal Anda.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiService from '../services/api';
import QRCode from 'qrcode';

const route = useRoute();
const router = useRouter();

const eventId = ref(route.params.eventId);
const userSession = ref(null);

// State Manajemen Data & Tab Kontrol
const isLoading = ref(true);
const namaEvent = ref('');
const kuponList = ref([]);
const activeTab = ref('available'); // Pilihan: 'available' atau 'claimed'

// State Kontrol Modal QR Pop-up
const activeModalKupon = ref(null);
const qrCanvasRef = ref(null);

/**
 * Filter 1: Mengambil kupon AVAILABLE & Mengurutkan dari Terkini ke Terlama (Newest First)
 */
const availableKupons = computed(() => {
  return kuponList.value
    .filter(k => k.Status === 'AVAILABLE')
    .sort((a, b) => new Date(b.Generated_At) - new Date(a.Generated_At));
});

/**
 * Filter 2: Mengambil kupon yang sudah diklaim (CLAIMED)
 */
const claimedKupons = computed(() => {
  return kuponList.value.filter(k => k.Status === 'CLAIMED');
});

/**
 * Selector otomatis untuk merender list kupon berdasarkan tab terpilih
 */
const currentTabKupons = computed(() => {
  return activeTab.value === 'available' ? availableKupons.value : claimedKupons.value;
});

onMounted(async () => {
  const session = localStorage.getItem('user_session');
  if (!session) {
    router.push({ name: 'Login' });
    return;
  }
  userSession.value = JSON.parse(session);

  await loadKuponList();
});

/**
 * Memuat rekap daftar seluruh kupon milik karyawan ter-assign dari database
 */
const loadKuponList = async () => {
  isLoading.value = true;
  
  const cleanEventId = String(eventId.value).trim().toUpperCase();
  const cleanNrp = String(userSession.value?.nrp).trim();

  try {
    // 1. Tarik info nama event dari dashboard list untuk banner
    const responseEvents = await apiService.getEvents(cleanNrp);
    if (responseEvents.data.success) {
      const currentEvent = responseEvents.data.events.find(e => 
        String(e.Event_ID).trim().toUpperCase() === cleanEventId
      );
      if (currentEvent) {
        namaEvent.value = currentEvent.Nama_Event;
      }
    }

    // 2. Ambil list transaksi kupon milik user penerima saat ini
    const responseKupon = await apiService.getPenerimaKupon(cleanEventId, cleanNrp);
    if (responseKupon.data.success) {
      kuponList.value = responseKupon.data.kupons || [];
    } else {
      kuponList.value = [];
    }
  } catch (error) {
    console.error('Gagal menarik dompet kupon:', error);
    kuponList.value = [];
  } finally {
    isLoading.value = false;
  }
};

/**
 * Membuka Modal Pop-up & memicu library generator QR Code ke Canvas secara dinamis
 */
/**
 * Membuka Modal Pop-up & memicu library generator QR Code ke Canvas secara dinamis
 * PERBAIKAN MUTLAK: Menggunakan teknik ekstraksi string agnostik untuk menghancurkan token [object Object]
 */
const openQrModal = async (kuponItem) => {
  if (!kuponItem) {
    console.error("Data kupon kosong");
    return;
  }

  // 1. Amankan objek ke state reaktif modal
  activeModalKupon.value = kuponItem;
  
  // 2. Tunggu DOM selesai memuat elemen <canvas>
  await nextTick();
  
  // 3. Ekstraksi String ID secara agresif (Bypass Skenario Objek Bersarang)
  let finalKuponId = "";

  if (typeof kuponItem === 'string') {
    finalKuponId = kuponItem;
  } else if (kuponItem.Kupon_ID) {
    // Jika Kupon_ID ternyata masih berupa objek (akibat ganjalan data dari GAS)
    if (typeof kuponItem.Kupon_ID === 'object') {
      // Ambil kunci pertama dari objek tersebut atau paksa baca properti stringnya
      finalKuponId = kuponItem.Kupon_ID.Kupon_ID || Object.values(kuponItem.Kupon_ID)[0] || String(kuponItem.Kupon_ID);
    } else {
      finalKuponId = String(kuponItem.Kupon_ID);
    }
  } else {
    // Jalur darurat: Ambil nilai properti pertama yang ada di dalam objek kupon
    finalKuponId = Object.values(kuponItem)[0];
  }

  // Bersihkan total string hasil ekstraksi dari spasi atau karakter aneh
  finalKuponId = String(finalKuponId).trim();

  // JIKA MASIH LOLOS MENGANDUNG '[object', AMBIL DARI PROP YANG TERSEDIA DI DALAM STATE
  if (finalKuponId.includes('[object') && kuponItem.Kupon_ID) {
    // Paksa baca langsung key indeks mentah dari data Sheets jika strukturnya berupa array bersarang
    try {
      finalKuponId = String(kuponItem[0] || kuponItem.Kupon_ID);
    } catch(e) {
      finalKuponId = String(kuponItem.Kupon_ID);
    }
  }

  // Overwrite nilai modal text dengan ID murni hasil ekstraksi agar display teks di atas QR ikut bersih
  activeModalKupon.value.Kupon_ID = finalKuponId;

  console.log("=== HASIL KALIBRASI AKHIR STRIPPER ===");
  console.log("String Terkunci Untuk QR:", finalKuponId);
  console.log("======================================");

  // 4. Gambar ulang QR Code ke dalam canvas
  if (qrCanvasRef.value && finalKuponId && !finalKuponId.includes('[object')) {
    try {
      await QRCode.toCanvas(qrCanvasRef.value, finalKuponId, {
        width: 220,
        margin: 2,
        color: {
          dark: '#020617',
          light: '#FFFFFF'
        }
      });
    } catch (err) {
      console.error('Gagal menggambar ulang QR Code:', err);
    }
  }
};

/**
 * Menutup modal pop-up QR Code
 */
const closeQrModal = () => {
  activeModalKupon.value = null;
};

/**
 * Format string tanggal agar mudah dibaca manusia
 */
const formatDateString = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) + ' WIB';
};
</script>