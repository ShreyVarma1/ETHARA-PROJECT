import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string(),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  try {
    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId ? { projectId } : {})
      },
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(tasks);
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
    const parsed = taskSchema.safeParse(body);
    
    if (!parsed.success) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        projectId: parsed.data.projectId,
        assigneeId: parsed.data.assigneeId,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        status: "TODO"
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
