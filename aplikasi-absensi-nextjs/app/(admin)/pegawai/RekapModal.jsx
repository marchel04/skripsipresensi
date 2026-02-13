"use client";

import { Modal, Card, Row, Col, Statistic, Spin, Divider, Table, message } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const RekapModal = ({ open, onClose, pegawai }) => {
  const [loading, setLoading] = useState(false);
  const [rekap, setRekap] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const bulanDefault = dayjs().format("YYYY-MM");

  useEffect(() => {
    if (open && pegawai) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pegawai]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rekap/pegawai/${pegawai.id_pegawai}?bulan=${bulanDefault}`);
      const data = await res.json();
      if (!data.success) {
        message.error(data.message || "Gagal memuat rekap");
        setRekap(null);
      } else {
        setRekap(data.data || null);
      }

      // riwayat
      const rres = await fetch(`/api/absensi/riwayat/${pegawai.id_pegawai}`);
      const rdata = await rres.json();
      if (rdata.success) {
        setRiwayat(rdata.data || []);
      } else {
        setRiwayat([]);
      }
    } catch (err) {
      console.error(err);
      message.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Tanggal", dataIndex: "tgl_absensi", render: (v) => dayjs(v).format("DD-MM-YYYY") },
    { title: "Jam Masuk", dataIndex: "jam_masuk" },
    { title: "Jam Pulang", dataIndex: "jam_pulang" },
    { title: "Status", dataIndex: "status" },
  ];

  return (
    <Modal title={`Rekap Absensi - ${pegawai?.nama_lengkap || "Pegawai"}`} open={open} onCancel={onClose} footer={null} width={900}>
      <Spin spinning={loading}>
        {rekap ? (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card>
                  <Statistic title="Hadir" value={rekap.hadir || 0} suffix="hari" />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Terlambat" value={rekap.terlambat || 0} suffix="hari" />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Izin" value={rekap.izin || 0} suffix="hari" />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Tanpa Keterangan" value={rekap.tanpa_keterangan || 0} suffix="hari" />
                </Card>
              </Col>
            </Row>

            <Card>
              <Divider>Riwayat Absensi</Divider>
              <Table dataSource={riwayat} columns={columns} rowKey={(r) => r.id_absensi} pagination={{ pageSize: 10 }} />
            </Card>
          </>
        ) : (
          <Card>Data rekap tidak tersedia</Card>
        )}
      </Spin>
    </Modal>
  );
};

export default RekapModal;
