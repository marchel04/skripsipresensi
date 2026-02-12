"use client";

import {
  Button,
  Form,
  Input,
  Modal,
  Space,
  Table,
  TimePicker,
  message,
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const FORMAT = "HH:mm";

const JamKerjaClient = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [dataSource, setDataSource] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jam-kerja");
      const json = await res.json();
      console.log("DATA jam kerja: ", json);
      setDataSource(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      message.error("Error : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showModalAdd = () => {
    setIsEdit(false);
    setSelectedData(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showModalEdit = (record) => {
    setIsEdit(true);
    setSelectedData(record);

    form.setFieldsValue({
      nama_jam: record.nama_jam,
      jam_masuk: dayjs(record.jam_masuk, FORMAT),
      batas_masuk: dayjs(record.batas_masuk, FORMAT),
      jam_pulang: dayjs(record.jam_pulang, FORMAT),
      batas_pulang: record.batas_pulang ? dayjs(record.batas_pulang, FORMAT) : null,
    });

    setIsModalOpen(true);
  };

  const onFinish = async (values) => {
    const payload = {
      ...values,
      jam_masuk: values.jam_masuk?.format(FORMAT),
      batas_masuk: values.batas_masuk?.format(FORMAT),
      jam_pulang: values.jam_pulang?.format(FORMAT),
      batas_pulang: values.batas_pulang?.format(FORMAT),
    };

    try {
      const res = await fetch(
        isEdit ? `/api/jam-kerja/${selectedData.id_jam}` : `/api/jam-kerja`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!data.success) {
        message.error(data.error?.message || "Gagal menyimpan data");
        return;
      }

      message.success(
        isEdit ? "Berhasil mengedit data" : "Berhasil menambahkan data"
      );
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (err) {
      console.error("Error submission:", err);
      message.error("Terjadi kesalahan server");
    }
  };

  const deleteJamKerja = (record) => {
    Modal.confirm({
      title: "Hapus Jam Kerja?",
      content: `Yakin ingin menghapus jam kerja ${record.nama_jam}?`,
      okText: "Ya, Hapus",
      cancelText: "Batal",
      onOk: async () => {
        const res = await fetch(`/api/jam-kerja/${record.id_jam}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (!data.success) {
          message.error("Gagal menghapus data");
          return;
        }

        message.success("Data berhasil dihapus");
        fetchData();
      },
    });
  };

  const columns = [
    {
      title: "Jam Kerja",
      dataIndex: "nama_jam",
    },
    {
      title: "Jam Masuk",
      dataIndex: "jam_masuk",
      render: (val) => (val ? dayjs(val, FORMAT).format(FORMAT) : "-"),
    },
    {
      title: "Batas Masuk",
      dataIndex: "batas_masuk",
      render: (val) => (val ? dayjs(val, FORMAT).format(FORMAT) : "-"),
    },
    {
      title: "Jam Pulang",
      dataIndex: "jam_pulang",
      render: (val) => (val ? dayjs(val, FORMAT).format(FORMAT) : "-"),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button onClick={() => showModalEdit(record)}>Edit</Button>
          <Button danger onClick={() => deleteJamKerja(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-row justify-between items-center mb-5">
        <h1>Data Jam Kerja</h1>
        <Button type="primary" onClick={showModalAdd}>
          Jam Kerja Baru
        </Button>
      </div>

      <Modal
        title={isEdit ? "Edit Jam Kerja" : "Tambah Jam Kerja"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        centered
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="nama_jam"
            label="Nama Jam Kerja"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="jam_masuk"
            label="Jam Masuk"
            rules={[{ required: true }]}
          >
            <TimePicker format={FORMAT} minuteStep={1} />
          </Form.Item>

          <Form.Item
            name="batas_masuk"
            label="Batas Masuk"
            rules={[{ required: true }]}
          >
            <TimePicker format={FORMAT} minuteStep={1} />
          </Form.Item>

          <Form.Item
            name="jam_pulang"
            label="Jam Pulang"
            rules={[{ required: true }]}
          >
            <TimePicker format={FORMAT} minuteStep={1} />
          </Form.Item>

          {/* Batas Pulang feature removed per request - pulang allowed anytime */}
        </Form>
      </Modal>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={(row) => row.id_jam}
        loading={loading}
      />
    </>
  );
};

export default JamKerjaClient;
