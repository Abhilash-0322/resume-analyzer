import { NextResponse } from "next/server";
import { ROLE_LIST } from "@/lib/role-templates";

export async function GET() {
  const roles = ROLE_LIST.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    icon: role.icon,
    benchmarks: role.benchmarks,
    expectedKeywords: role.expectedKeywords.slice(0, 6),
  }));

  return NextResponse.json({ roles });
}
