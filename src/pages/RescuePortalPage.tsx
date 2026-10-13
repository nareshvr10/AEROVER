import { useState } from "react";

const API = `http://${window.location.hostname}:5050`;

export default function RescuePortalPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Medical emergency");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitSOS(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch(`${API}/api/sos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to submit SOS");
      }

      setStatus(
        `SOS submitted successfully. Reference: ${data.id ?? "Received"}`
      );
      setName("");
      setMessage("");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Cannot reach the rescue server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-red-600">
          AEROVER · Rescue Portal
        </p>
        <h1 className="mt-2 text-3xl font-bold">Emergency SOS</h1>
        <p className="mt-2 text-gray-600">
          Submit a rescue request through the local Wi-Fi network.
        </p>
      </header>

      <form
        onSubmit={submitSOS}
        className="space-y-4 rounded-xl border border-gray-200 p-5"
      >
        <label className="block space-y-1">
          <span className="font-medium">Your name</span>
          <input
            className="w-full rounded-lg border p-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            placeholder="Enter your name"
          />
        </label>

        <label className="block space-y-1">
          <span className="font-medium">Emergency type</span>
          <select
            className="w-full rounded-lg border p-3"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Medical emergency</option>
            <option>Trapped person</option>
            <option>Food or water needed</option>
            <option>Missing person</option>
            <option>Other</option>
          </select>
        </label>

        <label className="block space-y-1">
          <span className="font-medium">Emergency details and location</span>
          <textarea
            className="w-full rounded-lg border p-3"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            maxLength={1000}
            rows={4}
            placeholder="Describe your situation and location"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-red-600 p-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Sending SOS..." : "Submit SOS"}
        </button>

        {status && (
          <p role="status" className="break-words rounded-lg bg-gray-100 p-3">
            {status}
          </p>
        )}
      </form>

      <p className="text-sm text-gray-500">
        AEROVER prototype: this request goes to the local server and does not
        automatically contact emergency services.
      </p>
    </div>
  );
}