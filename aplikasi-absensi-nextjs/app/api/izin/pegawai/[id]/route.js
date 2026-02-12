import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = await params;

    const backendRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/izin/pegawai/${id}`,
        {
            headers: {
                Cookie: req.headers.get("cookie") || "",
            },
            credentials: "include",
        }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
}
