import { NextResponse } from "next/server";
import { withApiRateLimit, jsonOk } from "@/lib/api-helpers";

export async function GET(request) {
  return withApiRateLimit(request, async () =>
    jsonOk({ status: "ok", mensagem: "API Analytics FUNEV online" })
  );
}
