import { FDARecallService } from "./fda-recall-service"
import { NotificationService } from "./notification-service"
import dbConnect from "./dbConnect"
import Donation from "@/models/Donation"

export class RecallMonitor {
  static async monitorRecalls(): Promise<void> {
    try {
      console.log("Starting recall monitoring...")

      const recalls = await FDARecallService.checkForRecalls()
      console.log(`Found ${recalls.length} recent recalls`)

      for (const recall of recalls) {
        await this.processRecall(recall)
      }

      console.log("Recall monitoring completed")
    } catch (error) {
      console.error("Error in recall monitoring:", error)
    }
  }

  private static async processRecall(recall: any): Promise<void> {
    const medicineNames = FDARecallService.extractMedicineNames(recall.product_description)

    if (medicineNames.length === 0) {
      return
    }

    await dbConnect()

    // Find donations that contain recalled medicines
    const affectedDonations = await Donation.find({
      "medicines.name": { $in: medicineNames },
      status: { $in: ["verified", "collected", "pending"] },
    })

    if (affectedDonations.length === 0) {
      return
    }

    console.log(`Found ${affectedDonations.length} donations affected by recall: ${recall.recall_number}`)

    // Update donation status to recalled
    await Donation.updateMany(
      { _id: { $in: affectedDonations.map((d) => d._id) } },
      {
        status: "recalled",
        verificationNotes: `Recalled by FDA: ${recall.reason_for_recall}`,
      },
    )

    // Notify affected users
    await NotificationService.notifyMedicineRecall(medicineNames, recall.reason_for_recall)

    // Log the recall for audit purposes
    console.log(`Processed recall ${recall.recall_number} affecting ${affectedDonations.length} donations`)
  }

  static async checkMedicineBeforeVerification(medicineName: string): Promise<boolean> {
    try {
      const recalls = await FDARecallService.checkMedicineAgainstRecalls(medicineName)
      return recalls.length === 0 // Return true if no recalls found
    } catch (error) {
      console.error("Error checking medicine against recalls:", error)
      return true // Default to allowing if check fails
    }
  }
}

// Register the recall monitoring job
import { queue } from "./queue"

queue.registerProcessor("monitor-recalls", async () => {
  await RecallMonitor.monitorRecalls()
})

// Schedule recall monitoring to run daily
setInterval(
  () => {
    queue.addJob("monitor-recalls", {})
  },
  24 * 60 * 60 * 1000,
) // 24 hours
