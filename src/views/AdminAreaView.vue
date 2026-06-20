<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
    <header class="bg-slate-900 border-b border-slate-800 px-4 py-4 sticky top-0 z-40 shadow-md">
      <div class="max-w-3xl mx-auto flex items-center justify-between">
        <button 
          @click="handleBackToMenu" 
          class="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Kembali ke Menu
        </button>
        <span class="text-xs font-bold text-rose-400 uppercase tracking-widest px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 animate-pulse font-mono">
          [Scanner Mode]
        </span>
      </div>
    </header>

    <main class="flex-1 max-w-xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        
        <div class="text-center space-y-1">
          <h2 class="text-xl font-black tracking-tight text-slate-100">Validasi Klaim Lapangan</h2>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">
            Posisikan kode QR kupon digital karyawan tepat di dalam kotak kamera pemindaian di bawah ini.
          </p>
        </div>

        <div class="relative overflow-hidden bg-slate-950 border border-slate-800 rounded-2xl aspect-square flex flex-col items-center justify-center shadow-inner">
          <div id="qr-reader" class="w-full h-full"></div>
          
          <div v-if="isScanning && !isLoading" class="absolute inset-0 pointer-events-none border-2 border-emerald-500/20 m-12 rounded-xl flex items-center justify-center">
            <div class="w-full h-0.5 bg-emerald-500 absolute top-0 shadow-lg shadow-emerald-400 animate-[bounce_2.5s_infinite]"></div>
          </div>
        </div>

        <div v-if="scanResult.text" :class="[scanResult.isError ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-green-500/10 border-green-500/20 text-green-400']" class="p-5 rounded-2xl border text-sm space-y-2.5 shadow-md">
          <div class="flex items-start gap-2.5 font-bold tracking-tight">
            <svg v-if="!scanResult.isError" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 shrink-0 text-green-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 shrink-0 text-rose-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
            </svg>
            <span class="text-base font-black">{{ scanResult.isError ? 'Pencairan Ditolak / Tidak Sah!' : 'Pencairan Kupon Sukses!' }}</span>
          </div>
          
          <p class="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line bg-slate-950/60 p-3 rounded-xl border border-slate-800/40">
            {{ scanResult.text }}
          </p>
          
          <button 
            @click="resumeScanner"
            class="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-xl border border-slate-700 text-xs transition duration-150 active:scale-95 shadow-sm"
          >
            Mulai Pindai Kupon Berikutnya
          </button>
        </div>

        <div v-if="isLoading" class="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2.5">
          <svg class="animate-spin h-6 w-6 text-emerald-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-xs text-slate-400 font-medium">Memverifikasi kode & mengunci klaim transaksi...</p>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { Html5Qrcode } from 'html5-qrcode';
import apiService from '../services/api';

const router = useRouter();

// State Kontrol Scanner & UI
const html5QrcodeScanner = ref(null);
const isScanning = ref(false);
const isLoading = ref(false);

const scanResult = ref({
  text: '',
  isError: false
});

onMounted(() => {
  // Pastikan admin login divalidasi sebelum kamera menyala
  const session = localStorage.getItem('user_session');
  if (session) {
    const user = JSON.parse(session);
    if (user.role !== 'ADMIN') {
      router.push({ name: 'Dashboard' });
      return;
    }
  } else {
    router.push({ name: 'Login' });
    return;
  }

  startScanner();
});

onBeforeUnmount(async () => {
  await stopScanner();
});

/**
 * Menginisialisasi dan menyalakan video stream kamera belakang (environment)
 */
const startScanner = async () => {
  try {
    html5QrcodeScanner.value = new Html5Qrcode("qr-reader");
    isScanning.value = true;

    await html5QrcodeScanner.value.start(
      { facingMode: "environment" }, // Kamera belakang HP
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      onScanSuccess,
      onScanFailure
    );
  } catch (err) {
    console.error("Gagal mendapatkan izin akses kamera:", err);
    scanResult.value = {
      text: "Sistem gagal mengakses hardware kamera perangkat. Mohon pastikan izin kamera pada browser Anda telah diizinkan (Allowed).",
      isError: true
    };
    isScanning.value = false;
  }
};

/**
 * Callback jika QR Code sukses ter-decode oleh lensa kamera
 */
const onScanSuccess = async (decodedText) => {
  if (isLoading.value) return;

  isLoading.value = true;
  scanResult.value = { text: '', isError: false };

  // Matikan lensa kamera sementara agar tidak memicu pemindaian ganda selama proses hit API
  try {
    if (html5QrcodeScanner.value && html5QrcodeScanner.value.isScanning) {
      await html5QrcodeScanner.value.stop();
      isScanning.value = false;
    }
  } catch (err) {
    console.error("Gagal menghentikan scanner sementara:", err);
  }

  // Tembak API klaim kupon ke Google Apps Script backend
  try {
    const response = await apiService.claimKupon(decodedText);
    const data = response.data;

    if (data.success) {
      // Menampilkan detail kupon yang dicairkan beserta NRP pemiliknya
      scanResult.value = {
        text: `ID Kupon: ${data.kupon.id}\nNominal Cair: Rp ${Number(data.kupon.nominal).toLocaleString('id-ID')}\nMilik Karyawan NRP: ${data.kupon.penerima}\n\nStatus di Google Sheets berhasil diubah menjadi CLAIMED.`,
        isError: false
      };
    } else {
      // Menampilkan pesan penolakan / Fraud Alert dari server
      scanResult.value = {
        text: data.message,
        isError: true
      };
    }
  } catch (error) {
    console.error(error);
    scanResult.value = { 
      text: "Terjadi gangguan transmisi jaringan. Gagal terhubung ke API Cloud Koperasi.", 
      isError: true 
    };
  } finally {
    isLoading.value = false;
  }
};

/**
 * Callback kegagalan deteksi lensa per frame (Dilewati secara silent)
 */
const onScanFailure = (error) => {
  // Dipadamkan agar tidak memenuhi console log per milidetik
};

/**
 * Menghidupkan ulang pemindaian kamera untuk melayani kupon antrean berikutnya
 */
const resumeScanner = async () => {
  scanResult.value = { text: '', isError: false };
  await startScanner();
};

/**
 * Fungsi mematikan total hardware kamera stream saat berpindah halaman
 */
const stopScanner = async () => {
  try {
    if (html5QrcodeScanner.value && html5QrcodeScanner.value.isScanning) {
      await html5QrcodeScanner.value.stop();
    }
  } catch (err) {
    console.error("Gagal menonaktifkan kamera:", err);
  }
};

/**
 * Navigasi keluar secara aman
 */
const handleBackToMenu = async () => {
  await stopScanner();
  router.push({ name: 'Dashboard' });
};
</script>

<style>
/* Reset border bawaan html5-qrcode agar rapi */
#qr-reader {
  border: none !important;
}
#qr-reader__dashboard {
  display: none !important;
}
video {
  object-fit: cover !important;
  border-radius: 1rem;
}
</style>