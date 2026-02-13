// app/api/pegawai/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pegawai`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Cookie: req.headers.get("cookie") || "",
        },
        credentials: "include",
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
}

export async function POST(req) {
    try {
        const body = await req.json();

        const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pegawai`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: req.headers.get("cookie") || "",
            },
            body: JSON.stringify(body),
            credentials: "include",
        });

        const text = await backendRes.text();
        const json = JSON.parse(text);

        return NextResponse.json(json, { status: backendRes.status });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: { message: err.message } },
            { status: 500 }
        );
    }
}