# Peels Native Plants Website

A modern business website for **Peels Native Plants Ltd.**, a British Columbia-based native plant nursery supplying wholesale native trees, shrubs, perennials, and restoration plant materials.

## 🌱 About the Project

This website is designed to present Peels Native Plants as a trusted wholesale nursery specializing in BC native plants. The site helps customers learn about the company, browse plant availability, understand services, and contact the nursery for quotes, pickup, or delivery inquiries.

## Quote email and attachments

The quote form sends through Resend and accepts one Excel, CSV, PDF, Word, JPG, or PNG attachment up to 2.5 MB. Resend credentials stay on the server.

For local development, copy the Resend settings from `.env.example` into `.env.local`. The Vite development server provides the quote endpoint automatically.

For PHP hosting, copy `quote-config.example.php` to `quote-config.php`, add the real credentials, and place that private file one directory above the deployed `public_html`/site output. The production build includes `api/quote-resend.php`. Never commit `quote-config.php` or a real Resend key.

## ✨ Features

* Clean and professional homepage
* Company introduction and native plant nursery overview
* Wholesale native plant availability section
* Product/service information for trees, shrubs, perennials, and restoration plants
* Contact section for customer inquiries
* Mobile-friendly responsive design
* SEO-friendly structure for native plant and nursery searches
* Fast-loading static website structure

## 🛠️ Tech Stack

* HTML / CSS / JavaScript
  or
* React + Vite
* Tailwind CSS
* Responsive web design
* Deployed on web hosting platform

Live Link: https://peelsnativeplants.com



<img width="1908" height="966" alt="ezgif-3e15132e1d4fc1bf (1)" src="https://github.com/user-attachments/assets/18469751-73e2-4dc9-8f0b-b19baa33246a" />
