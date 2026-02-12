"use client";

import { message, Table, Empty, Card } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const IzinPegawaiComponent = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pegawai, setPegawai] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        // ambil user login
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();

        if (!meJson.success || !isMounted) return;

        // ambil data pegawai berdasarkan nip
        const pegawaiRes = await fetch(`/api/pegawai/${meJson.data.nip}`);
        const pegawaiJson = await pegawaiRes.json();

        if (pegawaiJson.success && isMounted) {
          setPegawai(pegawaiJson.data);

          // fetch izin data untuk pegawai ini
          const izinRes = await fetch(`/api/izin/pegawai/${pegawaiJson.data.id_pegawai}`);
          const izinJson = await izinRes.json();

          if (izinJson.success && isMounted) {
            setTableData(izinJson.data || []);
          } else {
            setTableData([]);
          }
        }
      } catch (err) {
        message.error("Error: " + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const columns = [
    {
      title: "Nama Pegawai",
      key: "nama_pegawai",
      render: () => pegawai?.nama_lengkap || "-",
      align: "left",
    },
    {
      title: "Tanggal Mulai",
      dataIndex: "tgl_mulai",
      key: "tgl_mulai",
      render: (val) => (val ? dayjs(val).format("YYYY-MM-DD") : "-"),
      align: "center",
    },
    {
      title: "Tanggal Selesai",
      dataIndex: "tgl_selesai",
      key: "tgl_selesai",
      render: (val) => (val ? dayjs(val).format("YYYY-MM-DD") : "-"),
      align: "center",
    },
    {
      title: "Alasan",
      dataIndex: "alasan",
      key: "alasan",
      ellipsis: true,
    },
    {
      title: "Status Izin",
      dataIndex: "status_izin",
      key: "status_izin",
      align: "center",
      render: (status) => {
        const statusDisplay = {
          pending: "Menunggu",
          disetujui: "Disetujui",
          ditolak: "Ditolak",
        };
        return statusDisplay[status] || status;
      },
    },
  ];

  return (
    <Card title="Data Izin Saya" style={{ marginTop: "24px" }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>
      ) : tableData.length === 0 ? (
        <Empty description="Tidak ada data izin" />
      ) : (
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey={(row) => row.id_izin}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      )}
    </Card>
  );
};

export default IzinPegawaiComponent;
