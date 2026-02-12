"use client";

import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Descriptions,
  Flex,
  Form,
  Image,
  Input,
  message,
  Skeleton,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ImgCrop = dynamic(() => import("antd-img-crop"), {
  ssr: false,
});

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return false;
};

const PengaturanProfilClient = () => {
  const [role, setRole] = useState(null);
  const [pegawai, setPegawai] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // 1. ambil user login
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();

        if (!meJson.success || !isMounted) return;

        setRole(meJson.data.role);

        // 2. ambil data pegawai berdasarkan nip
        const pegawaiRes = await fetch(`/api/pegawai/${meJson.data.nip}`);
        const pegawaiJson = await pegawaiRes.json();

        if (pegawaiJson.success && isMounted) {
          setPegawai(pegawaiJson.data);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = async ({ fileList: newFileList }) => {
    setFileList(newFileList);

    if (newFileList.length === 0) return;

    const file = newFileList[0]?.originFileObj;
    if (!file) return;

    await uploadFotoProfil(file);
  };

  const onFinish = async (values) => {
    const payload = {
      newPassword: values.password,
    };

    console.log("SUBMIT PAYLOAD: ", payload);

    try {
      const res = await fetch(`/api/pegawai/update/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("SUBMIT RES:", data);

      if (data.success === false) {
        message.error(data.error?.message || "Gagal menyimpan data");
        return;
      }

      message.success("Berhasil mengedit password");
    } catch (err) {
      console.error(err);
      message.error("Terjadi kesalahan server");
    }
  };

  const items = [
    {
      label: "Nama Pegawai",
      children: pegawai?.nama_lengkap || "-",
    },
    {
      label: "NIP",
      children: pegawai?.nip || "-",
    },
    {
      label: "Jenis Kelamin",
      children: pegawai?.jenis_kelamin || "-",
    },
    {
      label: "Jabatan",
      children: pegawai?.jabatan || "-",
    },
    {
      label: "Divisi",
      children: pegawai?.divisi?.nama_divisi || "-",
    },
    {
      label: "No Telepon",
      children: pegawai?.no_telepon || "-",
    },
  ];

  const uploadFotoProfil = async (file) => {
    try {
      setLoadingAvatar(true);

      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch("/api/pegawai/update/foto", {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Upload gagal");
      }

      message.success("Foto profil berhasil diperbarui");

      // Optional: refresh data pegawai
      setPegawai((prev) => ({
        ...prev,
        foto_profil: data.data?.foto_profil,
      }));
    } catch (err) {
      console.error(err);
      message.error("Gagal upload foto profil");
    } finally {
      setLoadingAvatar(false);
    }
  };

  return (
    <>
      <>
        <Flex gap={30} justify="center" align="flex-start" wrap="wrap">
          {/* KIRI */}
          <div style={{ flex: "1 1 700px", maxWidth: 700, width: "100%" }}>
            <Card title="Pengaturan Profil" loading={loading}>
              <Flex vertical align="center" gap={16}>
                <ImgCrop rotationSlider>
                  <Upload
                    name="photo"
                    listType="picture-circle"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    beforeUpload={beforeUpload}
                    style={{ minWidth: "180px", minHeight: "180px" }}
                    maxCount={1}
                  >
                    {fileList.length >= 1 ? null : (
                      <button
                        type="button"
                        style={{ border: 0, background: "none" }}
                      >
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </button>
                    )}
                  </Upload>
                </ImgCrop>

                {/* IMAGE PREVIEW MODAL */}
                {previewImage && (
                  <Image
                    styles={{
                      root: { display: "none" },
                      minWidth: "180px",
                      minHeight: "180px",
                    }}
                    preview={{
                      open: previewOpen,
                      onOpenChange: (open) => setPreviewOpen(open),
                      afterOpenChange: (open) => !open && setPreviewImage(""),
                    }}
                    src={previewImage}
                    alt="avatar"
                  />
                )}

                <Skeleton loading={loading} active paragraph={false}>
                  <Descriptions
                    title="Informasi Pengguna"
                    bordered
                    column={1}
                    size="small"
                    items={items}
                    style={{ width: "100%" }}
                  />
                </Skeleton>
              </Flex>
            </Card>
          </div>

          {/* KANAN */}
          <div style={{ flex: "1 1 360px", maxWidth: 360, width: "100%" }}>
            <Card title="Ubah Password" loading={loading}>
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                  label="Password Baru"
                  name="password"
                  rules={[{ min: 6, message: "Password minimal 6 karakter" }]}
                >
                  <Input.Password />
                </Form.Item>

                <Button type="primary" htmlType="submit" block>
                  Submit
                </Button>
              </Form>
            </Card>
          </div>
        </Flex>
      </>
    </>
  );
};

export default PengaturanProfilClient;
