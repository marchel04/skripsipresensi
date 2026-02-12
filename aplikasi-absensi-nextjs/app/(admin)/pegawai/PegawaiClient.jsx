"use client";

import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Divider,
} from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { SearchOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, CloseCircleOutlined, TeamOutlined } from "@ant-design/icons";

const PegawaiClient = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [divisiOptions, setDivisiOptions] = useState([]);
  const [selectedPegawai, setSelectedPegawai] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [resetPasswordForm] = Form.useForm();
  const [loadingResetPassword, setLoadingResetPassword] = useState(false);
  
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Cari ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => {
            confirm();
            setSearchText(selectedKeys[0]);
            setSearchedColumn(dataIndex);
          }}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => {
              confirm();
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
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
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : false,
  });

  const fetchPegawai = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/pegawai");
      const data = await res.json();
      console.log("PEGAWAI RAW:", data);

      if (data.success === false) {
        message.error(data.error?.message || "Gagal memuat data pegawai");
        return;
      }

      setDataSource(
        data.data?.map((item) => ({
          key: item.id_pegawai,
          ...item,
          nama_divisi: item.divisi?.nama_divisi || "",
        })) || [],
      );
    } catch (err) {
      console.error(err);
      message.error("Gagal memuat data pegawai");
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisi = async () => {
    const res = await fetch("/api/divisi");
    const data = await res.json();

    if (data.success === false) {
      message.error("Gagal mengambil data divisi");
      return;
    }

    setDivisiOptions(
      data.data.map((d) => ({
        label: d.nama_divisi,
        value: d.id_divisi,
      })),
    );
  };



  useEffect(() => {
    const loadData = async () => {
      await fetchPegawai();
      await fetchDivisi();
    };

    loadData();
  }, []);


  const showModalAdd = () => {
    setIsEdit(false);
    setSelectedPegawai(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showModalEdit = (record) => {
    setIsEdit(true);
    setSelectedPegawai(record);

    form.setFieldsValue({
      nip: record.nip,
      nama_lengkap: record.nama_lengkap,
      jenis_kelamin: record.jenis_kelamin,
      jabatan: record.jabatan,
      no_telepon: record.no_telepon,
      id_divisi: record.id_divisi,
      tgl_lahir: record.tgl_lahir ? dayjs(record.tgl_lahir) : null,
    });

    setIsModalOpen(true);
  };

  const onFinish = async (values) => {
    const payload = {
      ...values,
      tgl_lahir: values.tgl_lahir
        ? values.tgl_lahir.format("YYYY-MM-DD")
        : null,
    };

    console.log("SUBMIT PAYLOAD: ", payload);

    try {
      let res;

      if (isEdit && selectedPegawai) {
        res = await fetch(`/api/pegawai/${selectedPegawai.id_pegawai}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/pegawai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      console.log("SUBMIT RES:", data);

      if (data.success === false) {
        message.error(data.error?.message || "Gagal menyimpan data");
        return;
      }

      message.success(
        isEdit ? "Berhasil mengedit pegawai" : "Berhasil menambahkan pegawai",
      );

      setIsModalOpen(false);
      fetchPegawai();
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Terjadi kesalahan server");
    }
  };

  const deletePegawai = async (record) => {
    Modal.confirm({
      title: "Hapus Pegawai?",
      content: `Yakin ingin menghapus pegawai ${record.nama_lengkap}?`,
      okText: "Ya, hapus",
      cancelText: "Batal",
      onOk: async () => {
        const res = await fetch(`/api/pegawai/${record.id_pegawai}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (data.success === false) {
          message.error(data.error?.message || "Gagal menghapus pegawai");
          return;
        }

        message.success("Pegawai berhasil dihapus");
        fetchPegawai();
      },
    });
  };

  const showResetPasswordModal = (record) => {
    setSelectedPegawai(record);
    resetPasswordForm.resetFields();
    setIsResetPasswordModalOpen(true);
  };

  const handleResetPassword = async (values) => {
    if (!selectedPegawai) {
      message.error("Data pegawai tidak ditemukan");
      return;
    }

    try {
      setLoadingResetPassword(true);
      const response = await fetch(
        `/api/auth/reset-password/${selectedPegawai.nip}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: values.newPassword }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Gagal mereset password");
      }

      message.success("Password pegawai berhasil direset");
      setIsResetPasswordModalOpen(false);
      resetPasswordForm.resetFields();
    } catch (err) {
      message.error(err.message || "Terjadi kesalahan");
    } finally {
      setLoadingResetPassword(false);
    }
  };

  const columns = [
    { title: "NIP", dataIndex: "nip" },
    {
      title: "Nama Lengkap",
      dataIndex: "nama_lengkap",
      ...getColumnSearchProps("nama_lengkap"),
    },
    { title: "Jenis Kelamin", dataIndex: "jenis_kelamin" },
    {
      title: "Tanggal Lahir",
      dataIndex: "tgl_lahir",
      render: (val) => (val ? dayjs(val).format("YYYY-MM-DD") : "-"),
    },
    { title: "Jabatan", dataIndex: "jabatan" },
    {
      title: "Divisi",
      dataIndex: "nama_divisi",
      ...getColumnSearchProps("nama_divisi"),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => showModalEdit(record)}>
            Edit
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => showResetPasswordModal(record)}
          >
            Reset Password
          </Button>
          <Button size="small" danger onClick={() => deletePegawai(record)}>
            Hapus
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-row justify-between items-center mb-5">
        <h1>Data Pegawai</h1>
        <Button color="primary" variant="solid" onClick={showModalAdd}>
          Tambah Pegawai
        </Button>
      </div>


      <Modal
        title={isEdit ? "Edit Pegawai" : "Tambah Pegawai"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        centered
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="NIP" name="nip" rules={[{ required: true }]}>
            <Input disabled={isEdit} />
          </Form.Item>

          <Form.Item
            label="Nama Lengkap"
            name="nama_lengkap"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Jenis Kelamin" name="jenis_kelamin">
            <Select
              options={[
                { value: "Laki-laki", label: "Laki-laki" },
                { value: "Perempuan", label: "Perempuan" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Tanggal Lahir" name="tgl_lahir">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Jabatan" name="jabatan">
            <Input />
          </Form.Item>

          <Form.Item label="Divisi" name="id_divisi">
            <Select options={divisiOptions} />
          </Form.Item>

          <Form.Item label="No Telepon" name="no_telepon">
            <Input />
          </Form.Item>

          <Form.Item
            label="Set Password"
            name="password"
            hidden={isEdit ? true : false}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      <Table columns={columns} dataSource={dataSource} loading={loading} />

      {/* Modal Reset Password */}
      <Modal
        title={`Reset Password - ${selectedPegawai?.nama_lengkap}`}
        open={isResetPasswordModalOpen}
        onCancel={() => setIsResetPasswordModalOpen(false)}
        onOk={() => resetPasswordForm.submit()}
        okText="Reset"
        cancelText="Batal"
      >
        <Form
          form={resetPasswordForm}
          layout="vertical"
          onFinish={handleResetPassword}
        >
          <Form.Item
            label="Password Baru"
            name="newPassword"
            rules={[
              { required: true, message: "Password baru wajib diisi" },
              {
                min: 6,
                message: "Password minimal 6 karakter",
              },
            ]}
          >
            <Input.Password placeholder="Masukkan password baru" />
          </Form.Item>

          <Form.Item
            label="Konfirmasi Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Konfirmasi password wajib diisi" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Password tidak cocok"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Konfirmasi password baru" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PegawaiClient;
