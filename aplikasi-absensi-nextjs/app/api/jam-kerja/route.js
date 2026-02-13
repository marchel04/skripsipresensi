import { NextResponse } from "next/server";

export async function GET() {
    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jam-kerja`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },

    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
}

export async function POST(req) {
    const body = await req.json();

    console.log("POST BODY:", body);

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jam-kerja`, {
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

