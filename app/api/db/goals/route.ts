import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Goal from "@/models/Goal";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "demo";
    await connectToDatabase();
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, goals });
  } catch (error: any) {
    console.error("Database GET Goals Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { title, category, targetAmount, currentAmount, deadline, userId } = body;
    
    if (!title || !targetAmount || !deadline) {
      return NextResponse.json({ success: false, error: "Title, target amount, and deadline required" }, { status: 400 });
    }

    const newGoal = await Goal.create({
      userId: userId || "demo",
      title,
      category: category || "Savings",
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount || 0),
      deadline,
      isCompleted: Number(currentAmount || 0) >= Number(targetAmount),
    });

    return NextResponse.json({ success: true, goal: newGoal });
  } catch (error: any) {
    console.error("Database POST Goal Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, addAmount } = body;

    if (!id || !addAmount) {
      return NextResponse.json({ success: false, error: "ID and amount required" }, { status: 400 });
    }

    const goal = await Goal.findById(id);
    if (!goal) return NextResponse.json({ success: false, error: "Goal not found" }, { status: 404 });

    goal.currentAmount += Number(addAmount);
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
      goal.completedDate = new Date().toLocaleDateString('en-GB');
    }

    await goal.save();
    return NextResponse.json({ success: true, goal });
  } catch (error: any) {
    console.error("Database PUT Goal Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    await Goal.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Goal deleted" });
  } catch (error: any) {
    console.error("Database DELETE Goal Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
