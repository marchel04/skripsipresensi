"use client";

import { message, Space, Table, Button, Modal, Badge, Input } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { FileTextOutlined, SearchOutlined } from "@ant-design/icons";

const IzinClient = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const getColumnSearchProps = (dataIndexPath) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Cari`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => {
            confirm();
            setSearchText(selectedKeys[0]);
            setSearchedColumn(dataIndexPath.join("."));
          }}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => {
              confirm();
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndexPath.join("."));
            }}
            icon={<SearchOutlined />}
            size="small"
          >
            Cari
          </Button>
          <Button
            onClick={() => {
              clearFilters();
              setSearchText("");
            }}
            size="small"
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      const fieldValue = dataIndexPath.reduce((obj, key) => obj?.[key], record);

      return fieldValue
        ? fieldValue.toString().toLowerCase().includes(value.toLowerCase())
        : false;
    },
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. ambil user login
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();

        if (!meJson.success || !isMounted) return;

        setRole(meJson.data.role);

        // 2. ambil data izin
        const res = await fetch("/api/izin");
        const json = await res.json();
        if (isMounted) {
          setTableData(json.data || []);
        }
      } catch (err) {
        message.error("Error : " + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSetStatus = async (id, newStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/izin/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status_izin: newStatus }),
      });

      const json = await res.json();

      if (res.ok) {
        const updated = json?.data;

        if (!updated?.id_izin) {
          message.error("Response update tidak valid");
          return;
        }

        message.success(`Status izin berhasil diubah menjadi ${newStatus}`);
        setTableData((prev) =>
          prev.map((item) =>
            item?.id_izin === updated.id_izin ? updated : item,
          ),
        );
      } else {
        message.error(json?.message || "Gagal mengubah status izin");
      }
    } catch (err) {
      message.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (filepath) => {
    if (!filepath) {
      message.warning("Dokumen tidak tersedia");
      return;
    }
    const fileUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${filepath}`;
    window.open(fileUrl, "_blank");
  };

  const getStatusBadge = (status) => {
    const statusColor = {
      pending: "default",
      disetujui: "success",
      ditolak: "error",
    };
    const statusLabel = {
      pending: "Menunggu",
      disetujui: "Disetujui",
      ditolak: "Ditolak",
    };
    return <Badge status={statusColor[status] || "default"} text={statusLabel[status] || status} />;
  };

  const columns = [
    {
      title: "Nama Pegawai",
      dataIndex: ["pegawai", "nama_lengkap"],
      key: "nama_lengkap",
      width: 200,
      ...getColumnSearchProps(["pegawai", "nama_lengkap"]),
    },
    {
      title: "Tanggal Mulai",
      dataIndex: "tgl_mulai",
      key: "tgl_mulai",
      render: (val) => (val ? dayjs(val).format("YYYY-MM-DD") : "-"),
      align: "center",
      width: 130,
    },
    {
      title: "Tanggal Selesai",
      dataIndex: "tgl_selesai",
      key: "tgl_selesai",
      render: (val) => (val ? dayjs(val).format("YYYY-MM-DD") : "-"),
      align: "center",
      width: 130,
    },
    {
      title: "Alasan",
      dataIndex: "alasan",
      key: "alasan",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Total Jam Kerja",
      dataIndex: "total_jam_kerja",
      key: "total_jam_kerja",
      align: "right",
      width: 130,
      render: (val, record) => {
        // Konversi total_jam_kerja dari berbagai tipe data
        let numValue = 0;
        
        if (val !== null && val !== undefined) {
          if (typeof val === 'number') {
            numValue = val;
          } else if (typeof val === 'string') {
            numValue = parseFloat(val);
          } else if (val && typeof val === 'object' && val.toString) {
            numValue = parseFloat(val.toString());
          }
        }
        
        if (isNaN(numValue) || numValue < 0) {
          return "-";
        }
        
        // Convert decimal hours to HH:MM:SS format
        const totalSeconds = Math.round(numValue * 3600);
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const sec = String(totalSeconds % 60).padStart(2, "0");
        return `${h}:${m}:${sec}`;
      },
    },
    {
      title: "Status",
      dataIndex: "status_izin",
      key: "status_izin",
      align: "center",
      width: 120,
      render: (val, record) => {
        const s = record.status_izin || record.alasan || val;
        return s ? `Izin - ${s}` : "Izin";
      },
    },
    {
      title: "Dokumen",
      key: "filepath",
      align: "center",
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          icon={<FileTextOutlined />}
          onClick={() => handleViewDocument(record.filepath)}
          disabled={!record.filepath}
        >
          Lihat
        </Button>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      align: "center",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          {record.status_izin !== "disetujui" && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleSetStatus(record.id_izin, "disetujui")}
            >
              Setujui
            </Button>
          )}
          {record.status_izin !== "ditolak" && (
            <Button
              danger
              size="small"
              onClick={() => handleSetStatus(record.id_izin, "ditolak")}
            >
              Tolak
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <h1 className="mb-5">Data Izin</h1>

      <Table
        columns={columns}
        rowKey={(row) => row.id_izin}
        loading={loading}
        dataSource={tableData}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1200 }}
      />
    </>
  );
};

export default IzinClient;
