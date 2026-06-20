<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans">
    <nav class="bg-slate-900 border-b border-slate-800 px-4 py-4 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3m-3-6H12m-1.5-4.5H21A2.25 2.25 0 0 1 23 6.75v10.5A2.25 2.25 0 0 1 21 19.5H1.5A2.25 2.25 0 0 1 0 17.25V6.75A2.25 2.25 0 0 1 1.5 4.5h8.25Z" />
            </svg>
          </div>
          <div>
            <span class="text-xs text-slate-400 block font-medium">Koperasi TN SHN</span>
            <span class="text-sm font-bold tracking-tight text-slate-200">Kupon Digital Dashboard</span>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="text-right hidden sm:block">
            <span class="text-sm font-semibold text-slate-200 block">{{ userSession?.nama }}</span>
            <span class="text-xs text-emerald-400 font-mono block">{{ userSession?.role === 'ADMIN' ? 'Administrator' : `NRP: ${userSession?.nrp}` }}</span>
          </div>
          <button 
            @click="handleLogout"
            class="px-3 py-2 bg-slate-800 hover:bg-rose-950 border border-slate-700 hover:border-rose-900 rounded-xl text-slate-300 hover:text-rose-400 text-xs font-medium transition-all"
          >
            Keluar
          </button>
        </div>
      </div>
    </nav>

    <main class="max-w-6xl mx-auto px-4 py-8">
      
      <div class="bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8">
        <h2 class="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
          Selamat Datang, <span class="text-emerald-400">{{ userSession?.nama }}</span>!
        </h2>
        <p class="text-slate-400 text-sm mt-2 max-w-2xl">
          {{ userSession?.role === 'ADMIN' 
            ? 'Anda masuk dengan hak akses penuh sistem. Anda dapat mengelola event, mengatur otorisasi user, dan melakukan pemindaian klaim kupon karyawan.' 
            : 'Silakan pilih event aktif di bawah ini untuk mendistribusikan kupon sebagai Pemberi, atau membuka dompet digital Anda sebagai Penerima kupon.' }}
        </p>
      </div>

      <div v-if="userSession?.role === 'ADMIN'" class="space-y-6">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Panel Kontrol Utama</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            @click="router.push({ name: 'AdminArea' })"
            class="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-6 cursor-pointer transition-all hover:translate-y-[-2px] group"
          >
            <div class="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-4 group-hover:bg-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.75 11.75v2.25m-2.25-2.25h4.5m-4.5 4.5v2.25m2.25-2.25h2.25m-4.5 0v2.25m-2.25-4.5h1.5m.75 0h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5v-.008Zm2.25 0h.008v.008H18.75v-.008Zm0-2.25h.008v.008H18.75v-.008Zm-4.5-4.5h.008v.008H14.25V7.125Zm0 2.25h.008v.008H14.25v-.008Zm2.25-2.25h.008v.008H16.5V7.125Zm0 2.25h.008v.008H16.5v-.008Z" />
              </svg>
            </div>
            <h4 class="text-lg font-bold text-slate-100">Scan & Verifikasi Kupon</h4>
            <p class="text-sm text-slate-400 mt-1">Buka kamera scanner di lapangan untuk melakukan validasi klaim kupon pekerja secara real-time.</p>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div class="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/xl" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 .621-.504 1.125-1.125 1.125H4.875c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125h14.25c.621 0 1.125.504 1.125 1.125v1.5ZM6 12a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 12Zm0 4.5a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75Z" />
              </svg>
            </div>
            <h4 class="text-lg font-bold text-slate-100">Manajemen Data Master</h4>
            <p class="text-sm text-slate-400 mt-1">Pengelolaan user, pembuatan event, dan rekapitulasi data mutlak dilakukan langsung pada file Spreadsheet utama perusahaan.</p>
          </div>
        </div>
      </div>

      <div v-else class="space-y-6">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Daftar Event Kupon Anda</h3>

        <div v-if="isLoading" class="py-12 flex flex-col items-center justify-center gap-3">
          <svg class="animate-spin h-8 w-8 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm text-slate-400 font-medium">Memuat data otorisasi event...</span>
        </div>

        <div v-else-if="errorMessage" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {{ errorMessage }}
        </div>

        <div v-else-if="events.length === 0" class="border border-dashed border-slate-800 rounded-xl p-12 text-center">
          <p class="text-slate-500 text-sm">Anda belum terdaftar atau diotorisasi ke dalam event kupon apa pun saat ini.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="item in events" 
            :key="item.Event_ID"
            @click="navigateToRoleArea(item)"
            class="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all hover:translate-y-[-2px] flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  {{ item.Event_ID }}
                </span>
                <span 
                  :class="[item.Role === 'PEMBERI' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20']"
                  class="text-xs font-semibold px-2.5 py-1 rounded-lg border uppercase tracking-wide"
                >
                  {{ item.Role }}
                </span>
              </div>

              <h4 class="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-2">
                {{ item.Nama_Event }}
              </h4>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <span class="text-xs text-slate-500">
                {{ item.Role === 'PEMBERI' ? 'Plafon Maksimal:' : 'Saldo Kupon Anda:' }}
              </span>
              <span 
                :class="[item.Role === 'PEMBERI' ? 'text-slate-300' : 'text-green-400 font-bold']"
                class="text-sm font-mono"
              >
                Rp {{ Number(item.Role === 'PEMBERI' ? item.Max_Nominal : (item.Total_Saldo_Penerima || 0)).toLocaleString('id-ID') }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiService from '../services/api';

const router = useRouter();

// State Data
const userSession = ref(null);
const events = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');

/**
 * Memastikan data sesi tersimpan dan mengambil data event dari backend jika login sebagai USER
 */
onMounted(async () => {
  const session = localStorage.getItem('user_session');
  
  if (!session) {
    router.push({ name: 'Login' });
    return;
  }

  userSession.value = JSON.parse(session);

  if (userSession.value.role === 'USER') {
    await loadUserEvents();
  }
});

/**
 * Panggil API untuk ambil daftar event otorisasi karyawan
 */
const loadUserEvents = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await apiService.getEvents(userSession.value.nrp);
    const data = response.data;

    if (data.success) {
      events.value = data.events;
    } else {
      errorMessage.value = data.message || 'Gagal memuat daftar event.';
    }
  } catch (error) {
    errorMessage.value = 'Gagal terhubung ke server untuk menarik data event.';
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

/**
 * Arahkan halaman berdasarkan Role dinamis per Event
 */
const navigateToRoleArea = (eventItem) => {
  if (eventItem.Role === 'PEMBERI') {
    router.push({ name: 'PemberiArea', params: { eventId: eventItem.Event_ID } });
  } else if (eventItem.Role === 'PENERIMA') {
    router.push({ name: 'PenerimaArea', params: { eventId: eventItem.Event_ID } });
  }
};

/**
 * Proses keluar sistem & membersihkan local storage
 */
const handleLogout = () => {
  localStorage.removeItem('user_session');
  router.push({ name: 'Login' });
};
</script>