export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const data = req.body;

    // Here you would typically:
    // 1. Validate the data
    // 2. Store it in a database
    // 3. Send notification emails
    // For now, we'll just simulate a successful submission

    return res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
}
