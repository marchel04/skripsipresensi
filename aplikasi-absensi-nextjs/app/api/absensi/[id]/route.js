// app/api/absensi/[id]/route.js
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = await params;

    const backendRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/absensi/${id}`,
        {
            method: "GET",
            headers: {
                Cookie: req.headers.get("cookie") || "",
            },
            credentials: "include",
        }
    );

    const text = await backendRes.text();
    return NextResponse.json(JSON.parse(text), {
        status: backendRes.status,
    });
}

export async function DELETE(req, { params }) {
    const { id } = await params;

    const backendRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/absensi/${id}`,
        {
            method: "DELETE",
            headers: {
                Cookie: req.headers.get("cookie") || "",
            },
            credentials: "include",
        }
    );

    const text = await backendRes.text();
    return NextResponse.json(JSON.parse(text), { status: backendRes.status });
}
