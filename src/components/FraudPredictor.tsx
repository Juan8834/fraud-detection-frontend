import { useState } from "react";

export default function FraudPredictor() {
  const [amount, setAmount] = useState<number | "">("");
  const [merchant, setMerchant] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [prediction, setPrediction] = useState<string | null>(null);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [fraudExplanation, setFraudExplanation] = useState<string | null>(null);

  const handlePredict = async () => {
    if (!amount || !merchant || !location || !date) {
      alert("All fields are required");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, merchant, location, date }),
      });
      const data = await response.json();
      setPrediction(data.prediction);
      setRiskScore(data.riskScore);
      setFraudExplanation(data.fraudExplanation);
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Failed to fetch prediction");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 w-full max-w-md mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">Fraud Predictor</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || "")}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{
              MozAppearance: "textfield",
              WebkitAppearance: "none",
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Merchant</label>
          <input
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handlePredict}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Predict
        </button>

        {prediction && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <p>
              <strong>Prediction:</strong> {prediction.toUpperCase()}
            </p>
            <p>
              <strong>Risk Score:</strong> {riskScore ?? "—"}
            </p>
            {fraudExplanation && (
              <p className="text-sm text-red-600 mt-2">{fraudExplanation}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
