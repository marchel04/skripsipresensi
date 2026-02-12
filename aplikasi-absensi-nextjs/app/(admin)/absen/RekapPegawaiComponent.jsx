"use client";

import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  message,
  Button,
  Space,
  Table,
  DatePicker,
} from "antd";
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  FileTextOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  PrinterOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const RekapPegawaiComponent = () => {
  const [rekapData, setRekapData] = useState(null);
  const [monthlyRekapData, setMonthlyRekapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riwayatDetail, setRiwayatDetail] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const fetchRekapData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/rekap/pegawai-keseluruhan`);
      const result = await response.json();

      if (result.success) {
        setRekapData(result.data);
        
        // Fetch riwayat absensi untuk tabel detail
        fetchRiwayatDetail();
      } else {
        message.error(result.message || "Gagal mengambil data rekap");
        setRekapData(null);
      }
    } catch (error) {
      console.error(error);
      message.error("Terjadi kesalahan sistem");
      setRekapData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiwayatDetail = async () => {
    try {
      const response = await fetch(`/api/absensi/riwayat`);
      const result = await response.json();

      if (result.success) {
        const formatted = result.data.slice(0, 30).map((item, idx) => {
          if (item.type === "absensi") {
            let totalHms = "-";
            if (item.jam_masuk && item.jam_pulang) {
              const s = dayjs(item.jam_pulang).diff(dayjs(item.jam_masuk), "second");
              const h = String(Math.floor(s / 3600)).padStart(2, "0");
              const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
              const sec = String(s % 60).padStart(2, "0");
              totalHms = `${h}:${m}:${sec}`;
            }

            return {
              key: idx,
              tanggal: dayjs(item.tanggal).format("DD-MM-YYYY"),
              jam_masuk: item.jam_masuk ? dayjs(item.jam_masuk).format("HH:mm") : "-",
              jam_pulang: item.jam_pulang ? dayjs(item.jam_pulang).format("HH:mm") : "-",
              status: item.status || "Belum Pulang",
              jam_terlambat: item.jam_terlambat || 0,
              total_jam_kerja: totalHms,
              type: "absensi",
            };
          } else if (item.type === "izin") {
            return {
              key: idx,
              tanggal: dayjs(item.tanggal).format("DD-MM-YYYY"),
              jam_masuk: "-",
              jam_pulang: "-",
              status: `Izin - ${item.jenis_izin || item.keterangan}`,
              jam_terlambat: 0,
              total_jam_kerja: "-",
              type: "izin",
            };
          }
        });
        setRiwayatDetail(formatted);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMonthlyRecap = async (month) => {
    try {
      const bulanParam = month.format("YYYY-MM");
      const response = await fetch(`/api/rekap/pegawai?bulan=${bulanParam}`);
      const result = await response.json();

      if (result.success) {
        setMonthlyRekapData(result.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrintRekap = () => {
    const filename = `rekap-absensi-${selectedMonth.format("YYYY-MM")}.html`;
    
    // Convert jam desimal to HH:MM:SS format
    const convertJamToHMS = (jamDesimal) => {
      if (!jamDesimal || jamDesimal === 0) return "00:00:00";
      const totalSeconds = Math.round(jamDesimal * 3600);
      const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
      const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
      const s = String(totalSeconds % 60).padStart(2, "0");
      return `${h}:${m}:${s}`;
    };
    // compute totals from riwayatDetail for the selected month to match displayed riwayat
    const rowsForMonth = riwayatDetail.filter((r) => {
      try {
        return dayjs(r.tanggal, "DD-MM-YYYY").isSame(selectedMonth, "month");
      } catch (e) {
        return false;
      }
    });

    const totalHadir = rowsForMonth.filter((r) => r.type === "absensi").length;
    const totalIzin = rowsForMonth.filter((r) => r.type === "izin").length;
    const totalTerlambat = rowsForMonth.filter((r) => Number(r.jam_terlambat) > 0).length;
    const totalMenitTerlambat = rowsForMonth.reduce((acc, r) => acc + (Number(r.jam_terlambat) || 0), 0);

    const totalDetikKerja = rowsForMonth.reduce((acc, r) => {
      if (!r.total_jam_kerja || r.total_jam_kerja === "-") return acc;
      const parts = String(r.total_jam_kerja).split(":").map((n) => Number(n) || 0);
      const sec = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
      return acc + sec;
    }, 0);

    const pad = (n) => String(n).padStart(2, "0");
    const totalJamKerjaHMS = `${pad(Math.floor(totalDetikKerja / 3600))}:${pad(Math.floor((totalDetikKerja % 3600) / 60))}:${pad(totalDetikKerja % 60)}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rekap Absensi Personal - ${selectedMonth.format("YYYY-MM")}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h2 { text-align: center; margin-bottom: 10px; }
            .subtitle { text-align: center; margin-bottom: 20px; color: #666; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 12px; text-align: center; }
            th { background-color: #f0f0f0; font-weight: bold; text-align: left; }
            td:first-child { text-align: left; }
          </style>
        </head>
        <body>
          <h2>Rekap Absensi Bulan ${selectedMonth.format("MMMM YYYY")}</h2>
          <div class="subtitle">Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
          
          <table>
            <thead>
              <tr>
                <th>Nama Pegawai</th>
                <th>Total Hadir</th>
                <th>Total Terlambat</th>
                <th>Total Izin</th>
                <th>Total Tidak Hadir</th>
                <th>Total Jam Kerja</th>
                <th>Total Jam Terlambat</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${rekapData?.nama_lengkap || '-'}</td>
                <td>${totalHadir}</td>
                <td>${totalTerlambat}</td>
                <td>${totalIzin}</td>
                <td>${Math.max(0, rowsForMonth.length - totalHadir - totalIzin)}</td>
                <td>${totalJamKerjaHMS}</td>
                <td>${totalMenitTerlambat} menit</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (!w) return;

    w.document.title = filename;
    setTimeout(() => {
      w.print();
      URL.revokeObjectURL(url);
    }, 300);
  };

  useEffect(() => {
    fetchRekapData();
    fetchRiwayatDetail();
    fetchMonthlyRecap(selectedMonth);
  }, [selectedMonth]);

  const columns = [
    {
      title: "Tanggal",
      dataIndex: "tanggal",
      key: "tanggal",
      width: 100,
    },
    {
      title: "Jam Masuk",
      dataIndex: "jam_masuk",
      key: "jam_masuk",
      align: "center",
      width: 100,
    },
    {
      title: "Jam Pulang",
      dataIndex: "jam_pulang",
      key: "jam_pulang",
      align: "center",
      width: 100,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (value, record) => (
        <span
          style={{
            color: record.type === "izin" ? "#722ed1" : 
                   value.includes("terlambat") ? "#faad14" : 
                   value.includes("hadir") ? "#52c41a" : "#000",
            fontWeight: record.type === "izin" ? "bold" : "normal",
          }}
        >
          {value}
        </span>
      ),
    },
    {
      title: "Jam Terlambat",
      dataIndex: "jam_terlambat",
      key: "jam_terlambat",
      align: "right",
      width: 100,
      render: (value, record) => {
        if (record.type === "izin") return "-";
        return (
          <span style={{ color: value > 0 ? "#f5222d" : "#52c41a" }}>
            {value} menit
          </span>
        );
      },
    },
    {
      title: "Total Jam Kerja",
      dataIndex: "total_jam_kerja",
      key: "total_jam_kerja",
      align: "right",
      width: 120,
      render: (value, record) => {
        if (record.type === "izin") return "-";
        return (
          <span style={{ color: "#1890ff" }}>{value} jam</span>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}><BarChartOutlined /> Rekap Data Absensi</h1>

      {/* Filter dan Export */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <div>
              <label style={{ marginRight: "8px", fontWeight: "bold" }}>Pilih Bulan:</label>
              <DatePicker
                picker="month"
                value={selectedMonth}
                onChange={(date) => setSelectedMonth(date)}
                format="MMMM YYYY"
                style={{ width: "100%" }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} lg={16}>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrintRekap}
            >
              Cetak Rekap
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      {monthlyRekapData && (
        <>
          <Row gutter={16} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Hadir"
                  value={monthlyRekapData.hadir || 0}
                  icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a" }}
                  suffix="hari"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Terlambat"
                  value={monthlyRekapData.terlambat || 0}
                  icon={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                  valueStyle={{ color: "#faad14" }}
                  suffix="hari"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Izin"
                  value={monthlyRekapData.izin || 0}
                  icon={<FileTextOutlined style={{ color: "#722ed1" }} />}
                  valueStyle={{ color: "#722ed1" }}
                  suffix="hari"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tanpa Keterangan"
                  value={monthlyRekapData.tanpa_keterangan || 0}
                  icon={<CloseCircleOutlined style={{ color: "#f5222d" }} />}
                  valueStyle={{ color: "#f5222d" }}
                  suffix="hari"
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Pulang Cepat"
                  value={monthlyRekapData.pulang_cepat || 0}
                  icon={<TeamOutlined style={{ color: "#eb2f96" }} />}
                  valueStyle={{ color: "#eb2f96" }}
                  suffix="hari"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Rata-rata Jam Kerja"
                  value={monthlyRekapData.rata_rata_jam_kerja || 0}
                  precision={2}
                  valueStyle={{ color: "#13c2c2" }}
                  suffix="jam"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Persentase Kehadiran"
                  value={
                    (monthlyRekapData.hadir || 0) + (monthlyRekapData.terlambat || 0) > 0
                      ? (((monthlyRekapData.hadir || 0) * 100) /
                          ((monthlyRekapData.hadir || 0) + (monthlyRekapData.terlambat || 0))).toFixed(1)
                      : 0
                  }
                  valueStyle={{ color: "#faad14" }}
                  suffix="%"
                />
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Overall Recap Section */}
      {rekapData && (
        <>
          <Card style={{ marginBottom: "24px", backgroundColor: "#fafafa" }}>
            <h3 style={{ marginTop: 0 }}><LineChartOutlined /> Data Keseluruhan</h3>
            <Row gutter={16}>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ padding: "12px" }}>
                  <Statistic
                    title="Total Hadir"
                    value={rekapData.hadir || 0}
                    valueStyle={{ fontSize: "16px", color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ padding: "12px" }}>
                  <Statistic
                    title="Total Terlambat"
                    value={rekapData.terlambat || 0}
                    valueStyle={{ fontSize: "16px", color: "#faad14" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ padding: "12px" }}>
                  <Statistic
                    title="Total Izin"
                    value={rekapData.izin || 0}
                    valueStyle={{ fontSize: "16px", color: "#722ed1" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card style={{ padding: "12px" }}>
                  <Statistic
                    title="Rata-rata Jam Kerja"
                    value={rekapData.rata_rata_jam_kerja || 0}
                    precision={2}
                    valueStyle={{ fontSize: "16px", color: "#13c2c2" }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </>
      )}

      {/* Detail Riwayat Table */}
      <Card title={<><FileTextOutlined /> Riwayat Absensi 30 Hari Terakhir</>}>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={riwayatDetail}
            pagination={{ pageSize: 10 }}
            size="small"
            scroll={{ x: 1000 }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default RekapPegawaiComponent;
