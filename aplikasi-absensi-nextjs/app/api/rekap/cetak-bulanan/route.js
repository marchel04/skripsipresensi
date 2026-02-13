import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const bulan = searchParams.get("bulan");

    if (!bulan) {
        return NextResponse.json(
            { success: false, message: "Parameter bulan wajib" },
            { status: 400 }
        );
    }

    try {
        const backendRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/rekap/cetak-bulanan?bulan=${bulan}`,
            {
                method: "GET",
                headers: {
                    Cookie: req.headers.get("cookie") || "",
                },
                credentials: "include",
            }
        );

        if (!backendRes.ok) {
            return NextResponse.json(
                { success: false, message: "Gagal mengunduh laporan" },
                { status: backendRes.status }
            );
        }

        const pdfBuffer = await backendRes.arrayBuffer();

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename=rekap-absensi-${bulan}.pdf`,
            },
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { success: false, message: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
