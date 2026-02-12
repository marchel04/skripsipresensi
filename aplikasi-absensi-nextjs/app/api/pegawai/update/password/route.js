import { NextResponse } from "next/server";

export async function PATCH(req) {
  try {
    const body = await req.json();

    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/pegawai/update/password`,
      {
        method: "PATCH",
        headers: {
          Cookie: req.headers.get("cookie") || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "include",
      },
    );

    const data = await backendRes.json();

    return NextResponse.json(data, {
      status: backendRes.status,
    });
  } catch (error) {
    console.error("PATCH password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal update password",
      },
      { status: 500 },
    );
  }
}
