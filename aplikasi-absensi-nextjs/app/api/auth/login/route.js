import { NextResponse } from "next/server";

export async function POST(req) {
    const body = await req.json();

    const backendRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: "include",
        }
    );

    const data = await backendRes.json();
    const res = NextResponse.json(data);

    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) {
        res.headers.set("set-cookie", setCookie);
    }

    return res;
}
