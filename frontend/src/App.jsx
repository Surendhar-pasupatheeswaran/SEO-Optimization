import React, { useState } from "react";
import axios from "axios";

const App = () => {
    const [url, setUrl] = useState("");   // Used for Metadata & Speed Test
    const [query, setQuery] = useState("");  // Used for Keyword Research
    const [metadata, setMetadata] = useState(null);
    const [keywords, setKeywords] = useState([]);
    const [speedData, setSpeedData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ Reusable API Call Function
    const fetchData = async (endpoint, setData, params) => {
        try {
            setError("");
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/${endpoint}`, { params });
            setData(response.data);
        } catch {
            setError(`Failed to fetch ${endpoint}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "auto" }}>
            <h2>SEO Power Suite</h2>

            {/* 🔹 Website Metadata Extraction */}
            <div>
                <h3>Website Metadata Scraper</h3>
                <input
                    type="text"
                    placeholder="Enter website URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                />
                <button onClick={() => fetchData("scrape", setMetadata, { url })} disabled={loading} style={{ padding: "10px 15px" }}>
                    {loading ? "Loading..." : "Fetch Metadata"}
                </button>
                {metadata && (
                    <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}>
                        <p><strong>Title:</strong> {metadata.title}</p>
                        <p><strong>Description:</strong> {metadata.description}</p>
                        <p><strong>OpenGraph Title:</strong> {metadata.ogTitle}</p>
                        <p><strong>Image:</strong> {metadata.ogImage}</p>
                    </div>
                )}
            </div>

            {/* 🔹 Keyword Research Tool */}
            <div style={{ marginTop: "30px" }}>
                <h3>Keyword Research Tool</h3>
                <input
                    type="text"
                    placeholder="Enter search term"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                />
                <button onClick={() => fetchData("keywords", (data) => setKeywords(data.keywords), { query })} disabled={loading} style={{ padding: "10px 15px" }}>
                    {loading ? "Loading..." : "Get Keywords"}
                </button>
                {keywords.length > 0 && (
                    <ul style={{ marginTop: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}>
                        {keywords.map((word, index) => <li key={index}>{word}</li>)}
                    </ul>
                )}
            </div>

            {/* 🔹 Website Speed Test */}
            <div style={{ marginTop: "30px" }}>
                <h3>Website Speed Test</h3>
                <input
                    type="text"
                    placeholder="Enter website URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
                />
                <button onClick={() => fetchData("speed", setSpeedData, { url })} disabled={loading} style={{ padding: "10px 15px" }}>
                    {loading ? "Loading..." : "Check Speed"}
                </button>
                {speedData && (
                    <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}>
                        <p><strong>URL:</strong> {speedData.url}</p>
                        <p><strong>Performance Score:</strong> {speedData.performance}</p>
                        <p><strong>First Contentful Paint (FCP):</strong> {speedData.fcp}</p>
                        <p><strong>Largest Contentful Paint (LCP):</strong> {speedData.lcp}</p>
                        <p><strong>Time to Interactive (TTI):</strong> {speedData.tti}</p>
                        <p><strong>Total Blocking Time (TBT):</strong> {speedData.tbt}</p>
                        <p><strong>Cumulative Layout Shift (CLS):</strong> {speedData.cls}</p>
                    </div>
                )}
            </div>

            {/* 🔹 Error Handling */}
            {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}
        </div>
    );
};

export default App;
