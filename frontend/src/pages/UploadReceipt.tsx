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
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="panel-strong">
        <h1 className="page-title text-[#1f272a]">Upload Receipt</h1>
        <p className="mt-1 text-sm text-[#67624f]">
        Upload a receipt image — our AI will extract the amount, vendor, and date
        automatically and create a cost record.
        </p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="panel space-y-4">
          {error && (
            <div className="rounded-xl border border-[#d58d7f] bg-[#fff3ef] p-3 text-sm text-[#8d2e1f]">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#4f4836]">
              Project *
            </label>
            <select
              required
              className="input-field"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">Select project...</option>
              {projects.map((p) => (
                <option key={p.Project_ID} value={p.Project_ID}>
                  {p.Name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#4f4836]">
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
            <label className="mb-2 block text-sm font-semibold text-[#4f4836]">
              Receipt Image *
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                file
                  ? "border-[#3a8088] bg-[#e6f1f2]"
                  : "border-[#c7bca0] bg-white/55 hover:border-[#ab9a71]"
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
                  <div className="mx-auto mb-2 grid h-12 w-12 place-content-center rounded-xl bg-[#1d5c63] text-xs font-bold tracking-[0.08em] text-white">
                    RC
                  </div>
                  <p className="text-[#5a5544]">Click to upload receipt</p>
                  <p className="mt-1 text-xs text-[#7b7562]">
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
              <p className="mt-1 text-sm text-[#6f6753]">
                Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !file || !projectId}
              className="btn-primary"
            >
              {loading ? "Processing..." : "Upload & Process"}
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
          <div className={`panel border-2 ${result.cost_created ? "border-[#8cb99b] bg-[#edf8ef]" : "border-[#ddc287] bg-[#fcf4e1]"}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="grid h-10 w-10 place-content-center rounded-full bg-white/80 text-sm font-bold text-[#4f4836]">
                {result.cost_created ? "OK" : "!"}
              </div>
              <div>
                <h2 className="font-semibold text-[#2a2a23]">
                  {result.cost_created ? "Receipt processed successfully!" : "Receipt uploaded"}
                </h2>
                <p className="text-sm text-[#665f4b]">
                  {result.cost_created
                    ? "A cost record was automatically created."
                    : "Could not extract cost data automatically."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-[#d9cfb6] bg-white p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-[#786f59]">Amount</p>
                <p className="font-bold text-[#2a2a23]">
                  {result.extracted_data.amount != null
                    ? formatCurrency(result.extracted_data.amount)
                    : "-"}
                </p>
              </div>
              <div className="rounded-lg border border-[#d9cfb6] bg-white p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-[#786f59]">Vendor</p>
                <p className="truncate font-bold text-[#2a2a23]">
                  {result.extracted_data.vendor_name ?? "-"}
                </p>
              </div>
              <div className="rounded-lg border border-[#d9cfb6] bg-white p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-[#786f59]">Date</p>
                <p className="font-bold text-[#2a2a23]">
                  {result.extracted_data.cost_date}
                </p>
              </div>
            </div>

            {result.extracted_data.raw_text && (
              <details className="mt-4">
                <summary className="cursor-pointer text-xs text-[#7b7562] hover:text-[#5f5846]">
                  Raw OCR text
                </summary>
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded border border-[#d9cfb6] bg-white p-3 text-xs text-[#665f4b]">
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
