import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    
    if (!parsed.success) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return new NextResponse("Not Found", { status: 404 });

    // Check permissions
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;
    if (userRole !== "ADMIN" && task.assigneeId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: parsed.data
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.task.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
