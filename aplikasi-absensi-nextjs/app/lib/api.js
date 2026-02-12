// Frontend API Helper untuk memanggil backend api-absensi

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const apiCall = async (
  endpoint,
  options = {}
) => {
  const {
    method = "GET",
    body = null,
    headers = {},
    ...otherOptions
  } = options;

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  const config = {
    method,
    headers: defaultHeaders,
    credentials: "include", // for cookies
    ...otherOptions,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`API Error Response:`, { status: response.status, data: errorData });
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Dashboard APIs
export const dashboardApi = {
  getAdminStats: (tanggal) =>
    apiCall(`/dashboard?tanggal=${tanggal || ""}`),
  
  getAbsensiReport: (filters) => {
    const params = new URLSearchParams();
    if (filters?.tanggal) params.append("tanggal", filters.tanggal);
    if (filters?.bulan) params.append("bulan", filters.bulan);
    if (filters?.tahun) params.append("tahun", filters.tahun);
    if (filters?.pegawaiId) params.append("pegawaiId", filters.pegawaiId);
    
    return apiCall(`/dashboard/laporan/absensi?${params.toString()}`);
  },

  printAbsensiReport: (filters) => {
    const params = new URLSearchParams();
    if (filters?.tanggal) params.append("tanggal", filters.tanggal);
    if (filters?.bulan) params.append("bulan", filters.bulan);
    if (filters?.tahun) params.append("tahun", filters.tahun);
    if (filters?.pegawaiId) params.append("pegawaiId", filters.pegawaiId);
    
    return apiCall(`/dashboard/laporan/absensi/cetak?${params.toString()}`);
  },
};

// Absensi APIs
export const absensiApi = {
  createAbsensi: (data) =>
    apiCall("/absensi", {
      method: "POST",
      body: data,
    }),

  getTodayAbsensi: () =>
    apiCall("/absensi/today"),

  getAbsensiByPegawai: (pegawaiId) =>
    apiCall(`/absensi/pegawai/${pegawaiId}`),

  getAbsensiByPegawaiWithDateRange: (pegawaiId, tanggal_awal, tanggal_akhir) =>
    apiCall(`/absensi/pegawai/${pegawaiId}/range?tanggal_awal=${tanggal_awal}&tanggal_akhir=${tanggal_akhir}`),

  updateAbsensi: (data) =>
    apiCall("/absensi/pulang", {
      method: "PUT",
      body: data,
    }),
};

// Izin APIs
export const izinApi = {
  searchIzin: (filters) => {
    const params = new URLSearchParams();
    if (filters?.tanggalMulai) params.append("tanggalMulai", filters.tanggalMulai);
    if (filters?.tanggalSelesai) params.append("tanggalSelesai", filters.tanggalSelesai);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.pegawaiId) params.append("pegawaiId", filters.pegawaiId);
    
    return apiCall(`/izin/search?${params.toString()}`);
  },

  getIzinRecap: (bulan, tahun) =>
    apiCall(`/izin/recap?bulan=${bulan}&tahun=${tahun}`),

  getIzinByPegawai: (pegawaiId) =>
    apiCall(`/izin/pegawai/${pegawaiId}`),

  createIzin: (data) =>
    apiCall("/izin", {
      method: "POST",
      body: data,
    }),

  updateIzin: (id, data) =>
    apiCall(`/izin/${id}`, {
      method: "PUT",
      body: data,
    }),
};

// Jam Kerja APIs
export const jamKerjaApi = {
  getAllJamKerja: () =>
    apiCall("/jam-kerja"),
};

// Pegawai APIs
export const pegawaiApi = {
  getPegawaiByNip: (nip) =>
    apiCall(`/pegawai/${nip}`),

  getAllPegawai: () =>
    apiCall("/pegawai"),
};
