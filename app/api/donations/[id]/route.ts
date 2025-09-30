import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"
import { auditLog } from "@/lib/audit-service"
import { createNotification } from "@/lib/notification-service"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const donation = await Donation.findById(params.id)

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    // Check if user can access this donation
    if (donation.userId !== session.user.id && !["admin", "reviewer"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(donation)
  } catch (error) {
    console.error("Error fetching donation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !["admin", "reviewer"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { status, reviewNotes, verificationResults } = body

    await dbConnect()
    const donation = await Donation.findById(params.id)

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    const oldStatus = donation.status
    const updates: any = {
      updatedAt: new Date(),
    }

    if (status) {
      updates.status = status
      updates.reviewedBy = session.user.id
      updates.reviewedAt = new Date()
    }

    if (reviewNotes) {
      updates.reviewNotes = reviewNotes
    }

    if (verificationResults) {
      updates.verificationResults = verificationResults
    }

    const updatedDonation = await Donation.findByIdAndUpdate(params.id, updates, { new: true })

    // Create audit log
    await auditLog({
      userId: session.user.id,
      action: "donation_updated",
      resourceType: "donation",
      resourceId: params.id,
      details: {
        oldStatus,
        newStatus: status,
        reviewNotes,
      },
    })

    // Send notification to donor if status changed
    if (status && status !== oldStatus) {
      await createNotification({
        userId: donation.userId,
        type: "donation_status",
        title: "Donation Status Updated",
        message: `Your donation has been ${status}`,
        data: {
          donationId: params.id,
          status,
          reviewNotes,
        },
      })
    }

    return NextResponse.json(updatedDonation)
  } catch (error) {
    console.error("Error updating donation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const donation = await Donation.findById(params.id)

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    await Donation.findByIdAndDelete(params.id)

    // Create audit log
    await auditLog({
      userId: session.user.id,
      action: "donation_deleted",
      resourceType: "donation",
      resourceId: params.id,
      details: {
        donorId: donation.userId,
        medicines: donation.medicines,
      },
    })

    return NextResponse.json({ message: "Donation deleted successfully" })
  } catch (error) {
    console.error("Error deleting donation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
