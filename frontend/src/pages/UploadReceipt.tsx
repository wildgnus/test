import React, { useEffect, useRef, useState } from "react";
import { projectsApi, receiptsApi } from "../services/api";
import type { Project, ReceiptUploadResult } from "../types";
import { formatCurrency } from "../utils/helpers";

export function UploadReceipt() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [category, setCategory] = useState("other");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReceiptUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    projectsApi.getAll().then((res) => setProjects(res.data as Project[]));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await receiptsApi.upload(file, projectId, category);
      setResult(res.data as ReceiptUploadResult);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail ?? "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Upload Receipt</h1>
      <p className="text-gray-500 text-sm">
        Upload a receipt image — our AI will extract the amount, vendor, and date
        automatically and create a cost record.
      </p>

      {!result ? (
        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project *
            </label>
            <select
              required
              className="input-field"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">Select project…</option>
              {projects.map((p) => (
                <option key={p.Project_ID} value={p.Project_ID}>
                  {p.Name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost Category
            </label>
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="materials">Materials</option>
              <option value="labor">Labor</option>
              <option value="equipment">Equipment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt Image *
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                file
                  ? "border-primary-300 bg-primary-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg object-contain"
                />
              ) : (
                <div>
                  <p className="text-4xl mb-2">🧾</p>
                  <p className="text-gray-500">Click to upload receipt</p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, PDF supported
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            {file && (
              <p className="text-sm text-gray-500 mt-1">
                Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !file || !projectId}
              className="btn-primary"
            >
              {loading ? "Processing…" : "Upload & Process"}
            </button>
            {file && (
              <button type="button" onClick={reset} className="btn-secondary">
                Clear
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className={`card border-2 ${result.cost_created ? "border-green-300 bg-green-50" : "border-yellow-300 bg-yellow-50"}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{result.cost_created ? "✅" : "⚠️"}</span>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {result.cost_created ? "Receipt processed successfully!" : "Receipt uploaded"}
                </h2>
                <p className="text-sm text-gray-500">
                  {result.cost_created
                    ? "A cost record was automatically created."
                    : "Could not extract cost data automatically."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-400">Amount</p>
                <p className="font-bold text-gray-900">
                  {result.extracted_data.amount != null
                    ? formatCurrency(result.extracted_data.amount)
                    : "—"}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-400">Vendor</p>
                <p className="font-bold text-gray-900 truncate">
                  {result.extracted_data.vendor_name ?? "—"}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-400">Date</p>
                <p className="font-bold text-gray-900">
                  {result.extracted_data.cost_date}
                </p>
              </div>
            </div>

            {result.extracted_data.raw_text && (
              <details className="mt-4">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                  Raw OCR text
                </summary>
                <pre className="mt-2 text-xs text-gray-500 bg-white rounded p-3 overflow-auto max-h-40 whitespace-pre-wrap">
                  {result.extracted_data.raw_text}
                </pre>
              </details>
            )}
          </div>

          <button onClick={reset} className="btn-primary">
            Upload Another Receipt
          </button>
        </div>
      )}
    </div>
  );
}
