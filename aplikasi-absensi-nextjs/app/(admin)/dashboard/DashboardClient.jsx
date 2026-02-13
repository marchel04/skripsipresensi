"use client";

import {
  FieldTimeOutlined,
  PrinterOutlined,
  ScheduleOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Divider,
  Flex,
  Input,
  message,
  Space,
  Table,
  Typography,
} from "antd";
import { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import dayjs from "dayjs";

const { Title } = Typography;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const DashboardClient = () => {
  const [tableData, setTableData] = useState([]);
  const [hadir, setHadir] = useState([]);
  const [terlambat, setTerlambat] = useState([]);
  const [pegawai, setPegawai] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedMonth, setSelectedMonth] = useState("");

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getValueByDataIndex = (record, dataIndex) => {
    if (Array.isArray(dataIndex)) {
      return dataIndex.reduce(
        (acc, key) => (acc && acc[key] !== undefined ? acc[key] : null),
        record,
      );
    }
    return record[dataIndex];
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      const recordValue = getValueByDataIndex(record, dataIndex);
      return recordValue
        ?.toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  useEffect(() => {
    const fetchDataTable = async () => {
      setLoading(true);
      try {
        // Ambil data terlambat hari ini untuk ditampilkan di tabel
        const res = await fetch(`/api/absensi/today/terlambat`);

        const json = await res.json();
        console.log("data terlambat today :", json.data);
        setTableData(json.data || []);
        setTerlambat(json.data || []);
      } catch (err) {
        message.error("Error : " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDataTable();
  }, []);

  useEffect(() => {
    const fetchDataHadirToday = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/absensi/all/today`);

        const json = await res.json();
        console.log("data terlambat all :", json.data);
        setHadir(json.data || []);
      } catch (err) {
        message.error("Error : " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDataHadirToday();
  }, []);

  useEffect(() => {
    const fetchDataTerlambatToday = async () => {
      setLoading(true);
      try {
        // sudah diambil saat inisialisasi tabel; biarkan sebagai fallback
        const res = await fetch(`/api/absensi/today/terlambat`);

        const json = await res.json();
        setTerlambat(json.data || []);
      } catch (err) {
        message.error("Error : " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDataTerlambatToday();
  }, []);

  useEffect(() => {
    const fetchDataPegawai = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/pegawai`);

        const json = await res.json();
        console.log("data pegawai :", json.data);
        setPegawai(json.data || []);
      } catch (err) {
        message.error("Error : " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDataPegawai();
  }, []);

  const columns = [
    {
      title: "No",
      key: "no",
      width: "10%",
      render: (_, __, index) => index + 1 + (currentPage - 1) * pageSize,
    },
    {
      title: "Nama Pegawai",
      dataIndex: ["pegawai", "nama_lengkap"],
      key: "nama_lengkap",
      width: "40%",
      ...getColumnSearchProps(["pegawai", "nama_lengkap"]),
    },
    {
      title: "Jam Masuk",
      dataIndex: "jam_masuk",
      key: "jam_masuk",
      sorter: (a, b) =>
        dayjs(a.jam_masuk).valueOf() - dayjs(b.jam_masuk).valueOf(),
      width: "30%",
      sortDirections: ["descend", "ascend"],
      render: (val) => (val ? dayjs(val).format("HH:mm:ss") : "-"),
    },
    {
      title: "Tanggal",
      dataIndex: "tgl_absensi",
      key: "tgl_absensi",
      sorter: (a, b) =>
        dayjs(a.tgl_absensi).valueOf() - dayjs(b.tgl_absensi).valueOf(),
      width: "30%",
      sortDirections: ["descend", "ascend"],
      render: (val) => (val ? dayjs(val).format("YYYY-MM-DD") : "-"),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <Card className="w-full" loading={loading}>
          <Card.Meta
            avatar={<UserOutlined />}
            title="Jumlah Pegawai"
            description={
              <>
                <Title level={2}>{pegawai.length}</Title>
              </>
            }
          />
        </Card>
        <Card className="w-full" loading={loading}>
          <Card.Meta
            avatar={<FieldTimeOutlined />}
            title="Terlambat Hari Ini"
            description={
              <>
                <Title level={2}>{terlambat.length}</Title>
              </>
            }
          />
        </Card>
        <Card className="w-full" loading={loading}>
          <Card.Meta
            avatar={<ScheduleOutlined />}
            title="Hadir Hari Ini"
            description={
              <>
                <Title level={2}>{hadir.length}</Title>
              </>
            }
          />
        </Card>
      </div>

      <div className="mb-7">
        <Flex justify="flex-end" align="center" gap={10}>
          <DatePicker
            picker="month"
            format="MM-YYYY"
            placeholder="Pilih Bulan"
            onChange={(value) => {
              if (!value) {
                setSelectedMonth(null);
                return;
              }
              setSelectedMonth(value.format("YYYY-MM"));
            }}
          />

          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => {
              if (!selectedMonth) {
                message.warning("Silakan pilih bulan terlebih dahulu");
                return;
              }

              window.open(
                `${API_BASE_URL}/rekap/absensi-bulanan?bulan=${selectedMonth}`,
                "_blank",
              );
            }}
          >
            Cetak Rekap
          </Button>
        </Flex>
      </div>

      <Table
        loading={loading}
        columns={columns}
        dataSource={tableData}
        rowKey={(row) => row.id_absensi}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        onChange={(pagination) => {
          setCurrentPage(pagination.current);
          setPageSize(pagination.pageSize);
        }}
      />
    </>
  );
};

export default DashboardClient;
