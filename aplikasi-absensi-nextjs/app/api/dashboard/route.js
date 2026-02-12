import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const tanggal = searchParams.get("tanggal");

    try {
        const url = tanggal 
            ? `${process.env.NEXT_PUBLIC_API_URL}/dashboard?tanggal=${tanggal}`
            : `${process.env.NEXT_PUBLIC_API_URL}/dashboard`;

        const backendRes = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: req.headers.get("cookie") || "",
            },
            credentials: "include",
        });

        const data = await backendRes.json();
        return NextResponse.json(data, { status: backendRes.status });
    } catch (error) {
        console.error("[dashboard] Error:", error);
        return NextResponse.json(
            { success: false, message: "Terjadi kesalahan server: " + error.message },
            { status: 500 }
        );
    }
}
