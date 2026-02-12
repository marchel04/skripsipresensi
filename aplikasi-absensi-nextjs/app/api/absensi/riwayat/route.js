import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const backendRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/absensi/riwayat/gabungan`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: req.headers.get("cookie") || "",
                },
                credentials: "include",
            }
        );

        const data = await backendRes.json();
        return NextResponse.json(data, { status: backendRes.status });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { success: false, message: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
