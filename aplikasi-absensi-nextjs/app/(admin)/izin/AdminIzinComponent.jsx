"use client";

import { Spin } from "antd";
import { useEffect, useState } from "react";
import IzinClient from "./IzinClient";
import IzinPegawaiComponent from "./IzinPegawaiComponent";

const AdminIzinComponent = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.success) {
          setRole(json.data.role);
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  if (loading) {
    return <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: "50px" }} />;
  }

  // Admin melihat semua data izin dengan fitur approval
  if (role === "admin") {
    return <IzinClient />;
  }

  // Pegawai melihat data izin mereka saja
  return <IzinPegawaiComponent />;
};

export default AdminIzinComponent;
