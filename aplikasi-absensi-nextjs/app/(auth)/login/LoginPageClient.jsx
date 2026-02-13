"use client";

import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Alert, Button, Checkbox, Form, Input } from "antd";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginRequest } from "../../api/auth";

const LoginPageClient = () => {
  const [error, setError] = useState(null);
  const [now, setNow] = useState(null);
  const router = useRouter();
  const [form] = Form.useForm();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return null; // hindari SSR mismatch
  }

  const onFinish = async (values) => {
    const { nip, password, remember = false } = values;

    console.log("nip : ", nip, "pw : ", password, "remember : ", remember);
    try {
      setError(null);
      await loginRequest(nip, password, remember);
      router.replace("/beranda");
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  };


  const timeString = now.toLocaleTimeString("id-ID");
  const dateString = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="grid grid-cols-2 bg-white shadow-lg rounded-lg overflow-hidden">
        {/* LEFT */}
        <div className="flex flex-col items-center justify-center p-10 bg-gray-50 text-center gap-2">
          <Image src="/logo.png" alt="logo" width={140} height={140} priority />
          <h1 className="text-xl font-semibold mt-2">Absensi Karyawan</h1>
          <div className="text-lg font-mono">{timeString}</div>
          <div className="text-sm text-gray-600 capitalize">{dateString}</div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-center p-10">
          <div className="w-full max-w-sm">
            {error && <Alert type="error" title={error} className="mb-4" />}

            <Form
              form={form}
              name="login"
              initialValues={{ remember: false }}
              onFinish={onFinish}
              layout="vertical"
            >
              <Form.Item name="nip" label="NIP" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} placeholder="Masukkan NIP" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  iconRender={(v) =>
                    v ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                  placeholder="Masukkan Password"
                />
              </Form.Item>

              <Form.Item name="remember" valuePropName="checked">
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <Button block type="primary" htmlType="submit">
                Log in
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPageClient;
