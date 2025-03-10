import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  console.log("🔔 Webhook received from Clerk");

  try {
    // ✅ Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // ✅ If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("❌ Missing svix headers");
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

    // ✅ Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    console.log("📩 Webhook event received:", payload);

    // ✅ Verify webhook secret is set
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("❌ CLERK_WEBHOOK_SECRET is not set in .env");
      return NextResponse.json({ error: "CLERK_WEBHOOK_SECRET not set" }, { status: 500 });
    }

    // ✅ Verify the webhook
    const wh = new Webhook(webhookSecret);

    let evt;
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
      console.log("✅ Webhook verified successfully");
    } catch (err) {
      console.error("❌ Error verifying webhook:", err);
      return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
    }

    // ✅ Process the event
    const eventType = evt.type;
    console.log("🚀 Processing event type:", eventType);

    // ✅ Connect to MongoDB
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // ✅ Handle user creation
    if (eventType === "user.created") {
      console.log("👤 Processing user.created event");
      const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;

      console.log("📝 User data:", {
        id,
        email: email_addresses,
        name: `${first_name || ""} ${last_name || ""}`,
        metadata: public_metadata,
      });

      // ✅ Check if user already exists
      const existingUser = await User.findOne({ clerkId: id });

      if (!existingUser) {
        // ✅ Get the primary email
        const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id);
        const emailAddress = primaryEmail ? primaryEmail.email_address : "";

        // ✅ Get role from public metadata or default to 'user'
        const role = public_metadata?.role || "user";

        // ✅ Create new user in MongoDB
        const newUser = new User({
          clerkId: id,
          name: `${first_name || ""} ${last_name || ""}`.trim(),
          email: emailAddress,
          role: role,
          createdAt: new Date(),
        });

        await newUser.save();
        console.log(`✅ User created in MongoDB: ${newUser._id}`);
      } else {
        console.log(`ℹ️ User already exists in MongoDB: ${existingUser._id}`);
      }
    }

    // ✅ Handle user updates
    if (eventType === "user.updated") {
      console.log("🔄 Processing user.updated event");
      const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;

      // ✅ Get the primary email
      const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id);
      const emailAddress = primaryEmail ? primaryEmail.email_address : "";

      // ✅ Get role from public metadata or default to 'user'
      const role = public_metadata?.role || "user";

      // ✅ Update user in MongoDB
      const updatedUser = await User.findOneAndUpdate(
        { clerkId: id },
        {
          name: `${first_name || ""} ${last_name || ""}`.trim(),
          email: emailAddress,
          role: role,
          updatedAt: new Date(),
        },
        { new: true, upsert: true }
      );

      console.log(`✅ User updated in MongoDB: ${updatedUser._id}`);
    }

    // ✅ Handle user deletion
    if (eventType === "user.deleted") {
      console.log("🗑 Processing user.deleted event");
      const { id } = evt.data;

      // ✅ Delete user from MongoDB
      const result = await User.findOneAndDelete({ clerkId: id });
      if (result) {
        console.log(`✅ User deleted from MongoDB: ${id}`);
      } else {
        console.log(`ℹ️ User not found in MongoDB: ${id}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
