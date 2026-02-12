"use client";

import {
  Card,
  Table,
  DatePicker,
  Button,
  Space,
  Spin,
  message,
  Row,
  Col,
  Statistic,
  Input,
} from "antd";
import { DownloadOutlined, FileTextOutlined, SearchOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

const RekapAbsenComponent = () => {
  const [rekapData, setRekapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [filterName, setFilterName] = useState("");
  const [summary, setSummary] = useState({
    totalPegawai: 0,
    totalHadir: 0,
    totalTerlambat: 0,
    totalIzin: 0,
    totalTidakHadir: 0,
    totalJamKerja: 0,
    totalMenitTerlambat: 0,
  });

  // Convert jam desimal to HH:MM:SS format
  const convertJamToHMS = (jamDesimal) => {
    if (!jamDesimal || jamDesimal === 0) return "00:00:00";
    const totalSeconds = Math.round(jamDesimal * 3600);
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const fetchRekapData = async (month) => {
    setLoading(true);
    try {
      const bulanParam = month.format("YYYY-MM");
      console.log("[RekapAbsenComponent] Fetching data for:", bulanParam);
      
      const response = await fetch(`/api/rekap/data-bulanan?bulan=${bulanParam}`);
      console.log("[RekapAbsenComponent] Response status:", response.status);
      
      const result = await response.json();
      console.log("[RekapAbsenComponent] Response data:", result);

      if (result.success) {
        const formatted = result.data.map((item, idx) => ({
          key: idx,
          nama_lengkap: item.nama_lengkap,
          id_pegawai: item.id_pegawai,
          hadir: item.hadir || 0,
          terlambat: item.terlambat || 0,
          pulang_cepat: item.pulang_cepat || 0,
          izin: item.izin || 0,
          tanpa_keterangan: item.tanpa_keterangan || 0,
          total_jam_kerja: item.total_jam_kerja || 0,
          total_menit_terlambat: item.total_menit_terlambat || 0,
        }));

        setRekapData(formatted);

        // Calculate summary
        const totalPegawai = formatted.length;
        const totalHadir = formatted.reduce((sum, item) => sum + item.hadir, 0);
        const totalTerlambat = formatted.reduce((sum, item) => sum + item.terlambat, 0);
        const totalIzin = formatted.reduce((sum, item) => sum + item.izin, 0);
        const totalTidakHadir = formatted.reduce((sum, item) => sum + item.tanpa_keterangan, 0);
        const totalJamKerja = formatted.reduce((sum, item) => sum + (item.total_jam_kerja || 0), 0);
        const totalMenitTerlambat = formatted.reduce((sum, item) => sum + (item.total_menit_terlambat || 0), 0);

        setSummary({
          totalPegawai,
          totalHadir,
          totalTerlambat,
          totalIzin,
          totalTidakHadir,
          totalJamKerja,
          totalMenitTerlambat,
        });
      } else {
        console.error("[RekapAbsenComponent] API returned error:", result);
        message.error(result.message || "Gagal mengambil data rekap");
      }
    } catch (error) {
      console.error("[RekapAbsenComponent] Fetch error:", error);
      message.error("Terjadi kesalahan sistem: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRekapData(selectedMonth);
  }, [selectedMonth]);

  const handleExportPDF = async () => {
    try {
      const bulanParam = selectedMonth.format("YYYY-MM");
      // If admin filtered by name and there's exactly one matching pegawai, export only that pegawai
      let url = `/api/rekap/cetak-bulanan?bulan=${bulanParam}`;
      if (filterName && filterName.trim()) {
        const filtered = rekapData.filter((r) => r.nama_lengkap.toLowerCase().includes(filterName.toLowerCase()));
        if (filtered.length === 1 && filtered[0].id_pegawai) {
          url += `&pegawaiId=${filtered[0].id_pegawai}`;
        }
      }
      const response = await fetch(url);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rekap-absensi-${bulanParam}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        message.success("Laporan berhasil diunduh");
      } else {
        message.error("Gagal mengunduh laporan");
      }
    } catch (error) {
      console.error(error);
      message.error("Terjadi kesalahan saat mengunduh");
    }
  };

  const columns = [
    {
      title: "Nama Pegawai",
      dataIndex: "nama_lengkap",
      key: "nama_lengkap",
      width: 200,
    },
    {
      title: "Hadir",
      dataIndex: "hadir",
      key: "hadir",
      align: "center",
      render: (value) => <span style={{ color: "#52c41a" }}>{value} hari</span>,
    },
    {
      title: "Terlambat",
      dataIndex: "terlambat",
      key: "terlambat",
      align: "center",
      render: (value) => <span style={{ color: "#faad14" }}>{value} hari</span>,
    },
    {
      title: "Pulang Cepat",
      dataIndex: "pulang_cepat",
      key: "pulang_cepat",
      align: "center",
      render: (value) => <span style={{ color: "#eb2f96" }}>{value} hari</span>,
    },
    {
      title: "Izin",
      dataIndex: "izin",
      key: "izin",
      align: "center",
      render: (value) => <span style={{ color: "#1890ff" }}>{value} hari</span>,
    },
    {
      title: "Tanpa Keterangan",
      dataIndex: "tanpa_keterangan",
      key: "tanpa_keterangan",
      align: "center",
      render: (value) => <span style={{ color: "#f5222d" }}>{value} hari</span>,
    },
    {
      title: "Total Tidak Hadir",
      dataIndex: "tanpa_keterangan",
      key: "total_tidak_hadir",
      align: "center",
      render: (value) => <span style={{ color: "#f5222d", fontWeight: "bold" }}>{value} hari</span>,
    },
    {
      title: "Total Jam Kerja",
      dataIndex: "total_jam_kerja",
      key: "total_jam_kerja",
      align: "center",
      render: (value) => <span style={{ color: "#1890ff" }}>{convertJamToHMS(value)}</span>,
    },
    {
      title: "Total Jam Terlambat",
      dataIndex: "total_menit_terlambat",
      key: "total_menit_terlambat",
      align: "center",
      render: (value) => <span style={{ color: "#f5222d" }}>{value} menit</span>,
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}><FileTextOutlined /> Rekap Data Absensi</h1>

      {/* Filter dan Export */}
      <Card style={{ marginBottom: "24px" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <label style={{ marginRight: "8px", fontWeight: "bold" }}>
                Pilih Bulan:
              </label>
              <DatePicker
                picker="month"
                value={selectedMonth}
                onChange={(date) => setSelectedMonth(date)}
                format="MMMM YYYY"
              />
            </div>
            <div style={{ minWidth: 240 }}>
              <label style={{ marginRight: "8px", fontWeight: "bold" }}>Cari Nama:</label>
              <Input
                placeholder="Cari nama pegawai..."
                prefix={<SearchOutlined />}
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                allowClear
              />
            </div>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportPDF}
              loading={loading}
            >
              Export PDF
            </Button>
          </div>
        </Space>
      </Card>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Pegawai"
              value={summary.totalPegawai}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Hadir"
              value={summary.totalHadir}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Terlambat"
              value={summary.totalTerlambat}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Izin"
              value={summary.totalIzin}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Tidak Hadir"
              value={summary.totalTidakHadir}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Jam Kerja"
              value={convertJamToHMS(summary.totalJamKerja)}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Jam Terlambat"
              value={summary.totalMenitTerlambat}
              valueStyle={{ color: "#f5222d" }}
              suffix="menit"
            />
          </Card>
        </Col>
      </Row>

      {/* Data Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filterName && filterName.trim() ? rekapData.filter((r) => r.nama_lengkap.toLowerCase().includes(filterName.toLowerCase())) : rekapData}
            pagination={{ pageSize: 10 }}
            size="small"
            scroll={{ x: 1200 }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default RekapAbsenComponent;
