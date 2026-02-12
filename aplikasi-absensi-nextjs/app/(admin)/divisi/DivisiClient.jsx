"use client";

import { Button, Flex, Form, Input, Modal, Space, Table, message } from "antd";
import React, { useEffect, useState } from "react";

const DivisiPageClient = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/divisi");
      const json = await res.json();
      setTableData(json.data || []);
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
    setSelectedId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showModalEdit = async (record) => {
    setIsEdit(true);
    setSelectedId(record.id_divisi);
    setIsModalOpen(true);

    try {
      const res = await fetch(`/api/divisi/${record.id_divisi}`);
      const json = await res.json();

      form.setFieldsValue({
        nama_divisi: json.data.nama_divisi,
      });
    } catch (err) {
      message.error("Error : " + err.message);
    }
  };

  const onFinish = async (values) => {
    try {
      const url = isEdit ? `/api/divisi/${selectedId}` : "/api/divisi";

      const method = isEdit ? "PUT" : "POST";

      console.log("Submitting values: ", values);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        message.error("Gagal menyimpan data!");
        return;
      }

      message.success(
        isEdit ? "Berhasil mengedit divisi!" : "Berhasil menambah divisi!",
      );

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error submission:", err);
      message.error("Terjadi kesalahan server!");
    }
  };

  const deleteDivisi = async (id) => {
    try {
      const res = await fetch(`/api/divisi/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        message.error("Gagal menghapus divisi!");
        return;
      }

      message.success("Berhasil menghapus divisi!");
      fetchData();
    } catch {
      message.error("Terjadi kesalahan server!");
    }
  };

  const columns = [
    {
      title: "Divisi",
      dataIndex: "nama_divisi",
      key: "nama_divisi",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => showModalEdit(record)}>Edit</Button>
          <Button danger onClick={() => deleteDivisi(record.id_divisi)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={isEdit ? "Edit Divisi" : "Tambah Divisi"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        centered
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="nama_divisi"
            label="Divisi"
            rules={[{ required: true, message: "Nama divisi wajib diisi!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Flex justify="space-between" align="center">
        <div className="mb-4">
          <h1>Data Divisi</h1>
        </div>

        <Button
          type="primary"
          onClick={showModalAdd}
          style={{ marginBottom: 16 }}
        >
          Tambah Divisi
        </Button>
      </Flex>

      <Table
        columns={columns}
        dataSource={tableData}
        rowKey={(row) => row.id_divisi}
        loading={loading}
      />
    </>
  );
};

export default DivisiPageClient;
