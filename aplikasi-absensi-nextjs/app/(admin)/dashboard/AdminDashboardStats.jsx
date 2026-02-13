"use client";

import {
  Row,
  Col,
  Card,
  Statistic,
  Skeleton,
  message,
  Button,
  DatePicker,
  Table,
  Space,
  Divider,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  CloseCircleOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { dashboardApi } from "@/app/lib/api";
import dayjs from "dayjs";

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [rekapData, setRekapData] = useState([]);
  const [rekapColumns, setRekapColumns] = useState([]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      if (!selectedDate) {
        message.error("Tanggal belum dipilih");
        setLoading(false);
        return;
      }

      const dateStr = selectedDate.format ? selectedDate.format("YYYY-MM-DD") : selectedDate;
      const result = await dashboardApi.getAdminStats(dateStr);

      if (result.success) {
        setStats(result.data);

        // Format rekap perbulan data
        if (result.data.rekapPerbulan && result.data.rekapPerbulan.length > 0) {
          const formatted = result.data.rekapPerbulan.map((item, idx) => ({
            key: idx,
            ...item,
          }));
          setRekapData(formatted);

          setRekapColumns([
            {
              title: "Pegawai",
              dataIndex: "nama_pegawai",
              key: "nama_pegawai",
            },
            {
              title: "Hadir",
              dataIndex: "total_hadir",
              key: "total_hadir",
              align: "center",
            },
            {
              title: "Terlambat",
              dataIndex: "total_terlambat",
              key: "total_terlambat",
              align: "center",
            },
            {
              title: "Izin",
              dataIndex: "total_izin",
              key: "total_izin",
              align: "center",
            },
            {
              title: "Total Tidak Hadir",
              dataIndex: "total_alfa",
              key: "total_tidak_hadir",
              align: "center",
              render: (text) => <span style={{ color: "#f5222d", fontWeight: "bold" }}>{text || 0}</span>,
            },
            {
              title: "Total Jam Kerja",
              dataIndex: "total_jam_kerja",
              key: "total_jam_kerja",
              align: "right",
              render: (text) => {
                const dec = parseFloat(text || 0);
                const totalSec = Math.round(dec * 3600);
                const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
                const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
                const s = String(totalSec % 60).padStart(2, "0");
                return `${h}:${m}:${s}`;
              },
            },
            {
              title: "Jam Terlambat",
              dataIndex: "total_jam_terlambat",
              key: "total_jam_terlambat",
              align: "right",
              render: (text) => `${text || 0} menit`,
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              align: "center",
              render: (_, record) => {
                // derive status from totals: if ada izin prioritas izin, jika terlambat terlambat, default hadir
                if ((record.totalIzin || 0) > 0) return "Izin";
                if ((record.total_terlambat || record.totalTerlambat) > 0) return "Terlambat";
                return "Hadir";
              },
            },
          ]);
        }
      } else {
        message.error("Gagal mengambil data dashboard");
      }
    } catch (error) {
      console.error(error);
      message.error("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedDate]);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}><BarChartOutlined /> Dashboard Admin</h1>

      <Card style={{ marginBottom: "20px" }}>
        <Space orientation="horizontal">
          <label>Pilih Tanggal:</label>
          <DatePicker
            value={selectedDate || null}
            onChange={(date) => setSelectedDate(date)}
            format="DD-MM-YYYY"
          />
          <Button type="primary" onClick={fetchStats} loading={loading}>
            Refresh
          </Button>
        </Space>
      </Card>

      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : stats ? (
        <>
          {/* KPI Cards */}
          <Row gutter={16} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Pegawai"
                  value={stats.totalPegawai}
                  icon={<TeamOutlined style={{ color: "#1890ff" }} />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Hadir Hari Ini"
                  value={stats.totalHadir}
                  icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Terlambat"
                  value={stats.totalTerlambat}
                  icon={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Izin"
                  value={stats.totalIzin}
                  icon={<FileTextOutlined style={{ color: "#722ed1" }} />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Additional Metrics Row */}
          <Row gutter={16} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Jam Kerja"
                  value={stats.totalJamKerja}
                  precision={2}
                  suffix="jam"
                  valueStyle={{ color: "#13c2c2" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Rekap Perbulan Table */}
          <Divider>Rekap Data Perbulan</Divider>
          <Card>
            {rekapData && rekapData.length > 0 ? (
              <Table
                columns={rekapColumns}
                dataSource={rekapData}
                pagination={{ pageSize: 10 }}
                size="small"
                scroll={{ x: 800 }}
              />
            ) : (
              <p style={{ textAlign: "center", color: "#999" }}>
                Tidak ada data rekap perbulan
              </p>
            )}
          </Card>
        </>
      ) : (
        <Card>
          <p>Tidak ada data tersedia</p>
        </Card>
      )}
    </div>
  );
};

export default DashboardStats;
