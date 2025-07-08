import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { RiSpam2Line } from "react-icons/ri";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const normalizedUrl = url.trim().startsWith("http")
        ? url.trim()
        : `https://${url.trim()}`;
      const domain = new URL(normalizedUrl).hostname.replace(/^www\./, "");

      const res = await fetch(
        `/api/process?domain=${encodeURIComponent(domain)}`
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to process");

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      toast.success("Pasted URL");
    } catch (err) {
      toast.error("Failed to read clipboard");
    }
  };

  const handleReset = () => {
    setUrl("");
    setResult(null);
    setError(null);
    toast("Reset");
  };

  return (
    <>
      <Head>
        <title>SiteLike – Website Screenshot & Favicon Tool</title>
        <meta
          name="description"
          content="Generate screenshots and favicons for any domain instantly."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="keywords"
          content="screenshot, favicon, domain, website tool, sitelike"
        />
        <meta name="author" content="RONiB" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <div className="bg-[#18181b] text-[#17c964] max-w-xl mx-auto p-4 font-bold text-4xl text-center rounded-b-xl">
          <Link href="/" target="_blank">
            SiteLike
          </Link>
        </div>

        <main className="max-w-xl mx-auto p-4">
          {error && (
            <div className="bg-[#312107] text-[#f5a524] mb-4 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-3 font-medium">
                <div className="bg-[#62420e] p-1.5 rounded-full">
                  <RiSpam2Line size="26" />
                </div>
                {error}
              </div>
            </div>
          )}
          <div className="px-6 py-8 bg-[#18181b] rounded-xl">
            <div className="flex flex-col gap-4">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL like example.com"
              />
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleGenerate}
                  className="bg-[#006FEE]"
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate"}
                </button>

                <button
                  disabled={loading}
                  onClick={handlePaste}
                  className="bg-[#9353d3]"
                >
                  Paste
                </button>

                <button onClick={handleReset} className="bg-[#f31260]">
                  Reset
                </button>
              </div>
            </div>
          </div>

          {result && (
            <div className="mt-6 bg-[#052814] flex items-center flex-col gap-6 p-6 rounded-xl">
              <img
                src={result.favicon}
                alt="Favicon"
                width={64}
                height={64}
                className="border-2 border-[#3f3f46] bg-[#095028] rounded-xl"
              />
              <img
                src={result.screenshot}
                alt="Screenshot"
                className="border-2 border-[#3f3f46] bg-[#095028] rounded-xl"
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
}
