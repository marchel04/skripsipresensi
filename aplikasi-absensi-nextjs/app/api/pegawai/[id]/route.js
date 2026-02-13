// app/api/pegawai/[nip]/route.js
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    // ini ambil nip, nama param tetap id sesuai nama folder
    const { id } = await params;

    const backendRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pegawai/${id}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
}

export async function PUT(req, { params }) {
    const { id } = await params;
    const body = await req.json();

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pegawai/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Cookie: req.headers.get("cookie") || "",
        },
        body: JSON.stringify(body),
        credentials: "include",
    });

    const text = await backendRes.text();
    return NextResponse.json(JSON.parse(text), { status: backendRes.status });
}

export async function DELETE(req, { params }) {
    const { id } = await params;

    const backendRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pegawai/${id}`,
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
