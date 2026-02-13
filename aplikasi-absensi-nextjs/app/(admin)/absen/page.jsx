"use client";

import { useEffect, useState } from "react";
import { Spin } from "antd";
import AbsenPegawaiComponent from "./AbsenPegawaiComponent";
import AbsenClient from "./AbsenClient";

const AbsenPage = () => {
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

  return role === "admin" ? <AbsenClient /> : <AbsenPegawaiComponent />;
};

export default AbsenPage;
