import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = await params;

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jam-kerja/${id}`);
    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
}

export async function PUT(req, { params }) {
    const { id } = await params;
    const body = await req.json();

    console.log("PUT BODY:", body);

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jam-kerja/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Cookie: req.headers.get("cookie") || "",
        },
        body: JSON.stringify(body),
        credentials: "include",
    });

    console.log("BACKEND STATUS:", backendRes.status);

    const text = await backendRes.text();
    console.log("BACKEND RAW RESPONSE:", text);

    return NextResponse.json(JSON.parse(text), { status: backendRes.status });
}

export async function DELETE(req, { params }) {
    const { id } = await params;

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jam-kerja/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Cookie: req.headers.get("cookie") || "",
        },
        credentials: "include",
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
}
