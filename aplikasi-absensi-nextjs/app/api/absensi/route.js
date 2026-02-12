import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.toString();
    
    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/absensi${query ? '?' + query : ''}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Cookie: req.headers.get("cookie") || "",   // <-- WAJIB
        },
        credentials: "include",
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
}

export async function POST(req) {
    const body = await req.json();

    console.log("POST BODY:", body);

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/absensi`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Cookie: req.headers.get("cookie") || "",   // <-- WAJIB
        },
        body: JSON.stringify(body),
        credentials: "include",
    });

    console.log("BACKEND STATUS:", backendRes.status);

    const text = await backendRes.text();
    console.log("BACKEND RAW RESPONSE:", text);

    return NextResponse.json(JSON.parse(text), { status: backendRes.status });
}
