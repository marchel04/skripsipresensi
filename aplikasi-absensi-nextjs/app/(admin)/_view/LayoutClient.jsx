"use client";

import "../../globals.css";
import { Avatar, Button, Dropdown, Layout, Menu, Space, theme } from "antd";
import Sider from "antd/es/layout/Sider";
import {
  AntDesignOutlined,
  DashboardOutlined,
  DatabaseFilled,
  DownOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ScheduleOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Content, Header } from "antd/es/layout/layout";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutRequest } from "@/app/api/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const sidebarMenu = [
  {
    key: "/beranda",
    icon: <HomeOutlined />,
    label: <Link href="/beranda">Beranda</Link>,
    roles: ["admin", "pegawai"],
  },
  {
    key: "/dashboard",
    icon: <DashboardOutlined />,
    label: <Link href="/dashboard">Dashboard</Link>,
    roles: ["admin"],
  },
  {
    key: "/izin",
    icon: <FileProtectOutlined />,
    label: <Link href="/izin">Data Izin</Link>,
    roles: ["admin", "pegawai"],
  },
  {
    key: "/absen",
    icon: <FileTextOutlined />,
    label: <Link href="/absen">Data Absen</Link>,
    roles: ["admin", "pegawai"],
  },
  {
    key: "kelola",
    icon: <DatabaseFilled />,
    label: "Kelola",
    roles: ["admin"],
    children: [
      {
        key: "/pegawai",
        icon: <UserOutlined />,
        label: <Link href="/pegawai">Data Pegawai</Link>,
        roles: ["admin"],
      },
      {
        key: "/divisi",
        icon: <TeamOutlined />,
        label: <Link href="/divisi">Data Divisi</Link>,
        roles: ["admin"],
      },
      {
        key: "/jam-kerja",
        icon: <ScheduleOutlined />,
        label: <Link href="/jam-kerja">Data Jam Kerja</Link>,
        roles: ["admin"],
      },
    ],
  },
];

const dropdownItems = [
  {
    key: "user_setting",
    label: "Pengaturan Akun",
    disabled: true,
  },
  {
    type: "divider",
  },
  {
    key: "/pengaturan-profil",
    label: <Link href="/pengaturan-profil">Pengaturan</Link>,
    icon: <SettingOutlined />,
  },
  {
    key: "logout",
    label: "Logout",
    icon: <LogoutOutlined />,
  },
];

const objectStyles = {
  root: {
    backgroundColor: "#ffffff",
    border: "1px solid #d9d9d9",
    borderRadius: "4px",
  },
  item: {
    padding: "8px 12px",
    fontSize: "14px",
    width: "150px",
  },
  itemTitle: {
    fontWeight: "500",
  },
  itemIcon: {
    marginRight: "8px",
  },
  itemContent: {
    backgroundColor: "transparent",
  },
};

const filterMenuByRole = (menus, role) => {
  return menus
    .filter((menu) => menu.roles?.includes(role))
    .map((menu) => {
      if (menu.children) {
        const filteredChildren = filterMenuByRole(menu.children, role);
        if (filteredChildren.length === 0) return null;

        return {
          ...menu,
          children: filteredChildren,
        };
      }
      return menu;
    })
    .filter(Boolean);
};

const MainLayoutClient = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathName = usePathname();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [namaLengkap, setNamaLengkap] = useState("");
  const [urlFoto, setUrlFoto] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setRole(res.data.role);
          setNamaLengkap(res.data.nama_lengkap);
          setUrlFoto(`${API_BASE_URL}/storage/uploads/users/profile/${res.data.foto_profil}`);
        }
      });
  }, []);

  const handleLogout = async ({ key }) => {
    if (key === "logout") {
      try {
        await logoutRequest();
        router.replace("/login");
        router.refresh(); // penting
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  return (
    <Layout>
      <Sider
        style={{
          overflow: "auto",
          height: "100vh",
          position: "sticky",
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          scrollbarWidth: "thin",
          scrollbarGutter: "stable",
          paddingTop: "16px",
        }}
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={275}
      >
        <div className="grid grid-flow-col justify-items-center p-4">
          <div style={{ textAlign: "center" }}>
            <Image src="/logo.png" alt="logo" width={100} height={20} priority />
            <div style={{ fontSize: 12, marginTop: 6, color: "#fff", fontWeight: 600 }}>
              DUKCAPIL MIMIKA
            </div>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathName]}
          items={
            role
              ? filterMenuByRole(sidebarMenu, role).map((item) => ({
                  ...item,
                  label: item.label,
                }))
              : []
          }
          style={{
            paddingLeft: "16px",
            paddingRight: "16px",
            paddingTop: "16px",
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
          </div>

          <div
            style={{
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Avatar size="small" src={urlFoto} />

            <Dropdown
              menu={{ items: dropdownItems, onClick: handleLogout }}
              placement="bottomRight"
              arrow
              styles={objectStyles}
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  {namaLengkap}
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            overflow: "initial",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayoutClient;
