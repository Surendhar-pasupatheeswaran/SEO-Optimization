const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const cheerio = require("cheerio");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/seo-tools", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use("/api/auth", authRoutes);
// ✅ Web Scraping API (Extract Title, Description, Keywords, etc.)
app.get("/api/scrape", async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        const response = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const html = response.data;
        const $ = cheerio.load(html);

        const metadata = {
            title: $("title").text().trim() || "No title found",
            description: $('meta[name="description"]').attr("content") ||
                         $('meta[property="og:description"]').attr("content") ||
                         $('meta[name="twitter:description"]').attr("content") ||
                         "No description found",
            // keywords: $('meta[name="keywords"]').attr("content") || "No keywords found",
            ogTitle: $('meta[property="og:title"]').attr("content") || "No OpenGraph title",
            ogImage: $('meta[property="og:image"]').attr("content") || "No image found",
            favicon: $('link[rel="icon"]').attr("href") || $('link[rel="shortcut icon"]').attr("href") || "No favicon found"
        };

        res.json(metadata);
    } catch (error) {
        console.error("Scraping error:", error.message);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

const OPEN_PAGERANK_API_KEY = "wg84sc4sks8gso0w80c4oosw8kswockk0sg88ss0 ";  // Replace with your Open PageRank API Key

// ✅ Backlink Checker Endpoint
app.get("/api/backlinks", async (req, res) => {
    try {
        const { domain } = req.query;
        if (!domain) {
            return res.status(400).json({ error: "Domain is required" });
        }

        const url = `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${domain}`;
        const headers = { "API-OPR": OPEN_PAGERANK_API_KEY };
        
        const response = await axios.get(url, { headers });
        res.json(response.data.response[0]);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch backlink data" });
    }
});



app.get("/api/analyze", async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ error: "URL is required" });

        // Fetch HTML content of the page
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Extract SEO data
        const seoData = {
            title: $("title").text() || "No title found",
            description: $('meta[name="description"]').attr("content") || "No description found",
            h1: $("h1").first().text() || "No H1 tag found",
            images: $("img").length,
            links: $("a").length
        };

        res.json(seoData);
    } catch (error) {
        res.status(500).json({ error: "Failed to analyze the webpage" });
    }
});



const GOOGLE_API_KEY = "AIzaSyDKMAgFOmIbT5a8-dZrWcayViWj0OM6Oi4"; // 🔹 Ensure this is correct!


app.get("/api/speed", async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${GOOGLE_API_KEY}`;

        const response = await axios.get(apiUrl);
        const data = response.data;

        const speedData = {
            url: data.id,
            performance: data.lighthouseResult.categories.performance.score * 100,
            fcp: data.lighthouseResult.audits["first-contentful-paint"].displayValue,
            lcp: data.lighthouseResult.audits["largest-contentful-paint"].displayValue,
            tti: data.lighthouseResult.audits["interactive"].displayValue,
            tbt: data.lighthouseResult.audits["total-blocking-time"].displayValue,
            cls: data.lighthouseResult.audits["cumulative-layout-shift"].displayValue
        };

        res.json(speedData);
    } catch (error) {
        console.error("Error fetching speed test:", error.message);
        res.status(500).json({ error: "Failed to fetch speed data" });
    }
});


// ✅ Keyword Research API (Using Google's Auto Suggest API)
app.get("/api/keywords", async (req, res) => {
    try {
        const query = req.query.query;
        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        // Google Suggest API (Returns keyword suggestions)
        const response = await axios.get(`http://suggestqueries.google.com/complete/search`, {
            params: { q: query, client: "firefox" },
        });

        const keywords = response.data[1]; // Extract keyword suggestions
        res.json({ keywords });
    } catch (error) {
        console.error("Keyword Research Error:", error.message);
        res.status(500).json({ error: "Failed to fetch keyword suggestions" });
    }
});

// ✅ Start the Server

app.listen(5000, () => console.log("Server running on port 5000"));
