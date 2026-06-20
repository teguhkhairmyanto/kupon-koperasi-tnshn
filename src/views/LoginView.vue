<template>
  <div class="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8">
      
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3m-3-6H12m-1.5-4.5H21A2.25 2.25 0 0 1 23 6.75v10.5A2.25 2.25 0 0 1 21 19.5H1.5A2.25 2.25 0 0 1 0 17.25V6.75A2.25 2.25 0 0 1 1.5 4.5h8.25Z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-100 tracking-tight">Kupon Koperasi TN SHN</h1>
        <p class="text-sm text-slate-400 mt-1">Sistem Pengelolaan Kupon Digital Internal</p>
      </div>

      <div class="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
        <button 
          @click="isAdminMode = false"
          :class="[!isAdminMode ? 'bg-slate-800 text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200']"
          class="flex-1 text-center py-2 text-sm rounded-lg transition-all duration-150"
        >
          Karyawan
        </button>
        <button 
          @click="isAdminMode = true"
          :class="[isAdminMode ? 'bg-slate-800 text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200']"
          class="flex-1 text-center py-2 text-sm rounded-lg transition-all duration-150"
        >
          Administrator
        </button>
      </div>

      <div v-if="errorMessage" class="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 shrink-0 mt-0.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <form v-if="!isAdminMode" @submit.prevent="handleUserSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">NRP (Nomor Registrasi Pekerja)</label>
          <input 
            v-model="userForm.nrp" 
            type="text" 
            required 
            placeholder="Contoh: 202601"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
          <input 
            v-model="userForm.nama" 
            type="text" 
            required 
            placeholder="Masukkan nama sesuai data perusahaan"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tanggal Lahir</label>
          <input 
            v-model="userForm.tanggalLahir" 
            type="date" 
            required 
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
          />
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl transition duration-150 text-sm shadow-lg shadow-emerald-500/10 mt-2 flex items-center justify-center gap-2"
        >
          <svg v-if="isLoading" class="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard' }}
        </button>
      </form>

      <form v-else @submit.prevent="handleAdminSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Username Admin</label>
          <input 
            v-model="adminForm.username" 
            type="text" 
            required 
            placeholder="Masukkan username admin"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
          <input 
            v-model="adminForm.password" 
            type="password" 
            required 
            placeholder="••••••••"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
          />
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 disabled:opacity-50 text-slate-950 font-bold py-3 px-4 rounded-xl transition duration-150 text-sm shadow-lg shadow-emerald-500/10 mt-2 flex items-center justify-center gap-2"
        >
          <svg v-if="isLoading" class="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? 'Mengotentikasi...' : 'Masuk sebagai Admin' }}
        </button>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import apiService from '../services/api';

const router = useRouter();

// State UI Control
const isAdminMode = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

// Form Data Karyawan
const userForm = reactive({
  nrp: '',
  nama: '',
  tanggalLahir: ''
});

// Form Data Admin
const adminForm = reactive({
  username: '',
  password: ''
});

/**
 * Handle submit login Karyawan
 */
const handleUserSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await apiService.loginUser(userForm.nrp, userForm.nama, userForm.tanggalLahir);
    const data = response.data;

    if (data.success) {
      // Simpan session ke localStorage sesuai Navigation Guard
      localStorage.setItem('user_session', JSON.stringify({
        role: data.role, // 'USER'
        nrp: data.user.nrp,
        nama: data.user.nama
      }));
      
      // Redirect ke Unified Dashboard
      router.push({ name: 'Dashboard' });
    } else {
      errorMessage.value = data.message || 'Gagal login. Periksa kembali data Anda.';
    }
  } catch (error) {
    errorMessage.value = 'Terjadi kesalahan jaringan atau server internal.';
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

/**
 * Handle submit login Admin
 */
const handleAdminSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await apiService.loginAdmin(adminForm.username, adminForm.password);
    const data = response.data;

    if (data.success) {
      // Simpan session ke localStorage sesuai Navigation Guard
      localStorage.setItem('user_session', JSON.stringify({
        role: data.role, // 'ADMIN'
        nama: data.user.nama
      }));

      // Redirect ke Unified Dashboard
      router.push({ name: 'Dashboard' });
    } else {
      errorMessage.value = data.message || 'Username atau Password Admin salah.';
    }
  } catch (error) {
    errorMessage.value = 'Terjadi kesalahan jaringan atau server internal.';
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};
</script>