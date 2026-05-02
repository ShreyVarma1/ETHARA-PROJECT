import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      include: {
        createdBy: {
          select: { name: true, email: true }
        },
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(projects);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if ((session.user as any).role !== "ADMIN") {
    return new NextResponse("Forbidden: Admin only", { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = projectSchema.safeParse(body);
    
    if (!parsed.success) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        createdById: (session.user as any).id,
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
