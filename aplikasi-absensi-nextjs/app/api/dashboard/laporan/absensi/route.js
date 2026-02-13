import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const tanggal = searchParams.get("tanggal");
    const bulan = searchParams.get("bulan");
    const tahun = searchParams.get("tahun");
    const pegawaiId = searchParams.get("pegawaiId");

    try {
        const params = new URLSearchParams();
        if (tanggal) params.append("tanggal", tanggal);
        if (bulan) params.append("bulan", bulan);
        if (tahun) params.append("tahun", tahun);
        if (pegawaiId) params.append("pegawaiId", pegawaiId);

        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/dashboard/laporan/absensi?${params.toString()}`;
        console.log("[dashboard/laporan/absensi] Calling backend:", backendUrl);

        const backendRes = await fetch(backendUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: req.headers.get("cookie") || "",
            },
            credentials: "include",
        });

        console.log("[dashboard/laporan/absensi] Backend response status:", backendRes.status);
        
        const data = await backendRes.json();
        console.log("[dashboard/laporan/absensi] Backend response data:", data);
        
        return NextResponse.json(data, { status: backendRes.status });
    } catch (error) {
        console.error("[dashboard/laporan/absensi] Error:", error);
        return NextResponse.json(
            { success: false, message: "Terjadi kesalahan server: " + error.message },
            { status: 500 }
        );
    }
}
