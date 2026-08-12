# TEXIM ONE

A professional virtual trucking company (VTC) website built with HTML, CSS, and JavaScript, deployed on **Cloudflare Pages** with **Discord webhook integration** via serverless functions.

## Features

- Modern dark-themed responsive design
- Multi-page layout: Home, About, Convoy, and Contact
- Convoy invite form that sends submissions to a Discord webhook
- Serverless function keeps the webhook URL secure (never exposed client-side)
- Mobile-friendly navigation
- Smooth preloader and animations

## Tech Stack

- **HTML / CSS / Vanilla JS** — static frontend
- **Cloudflare Pages Functions** — serverless backend for Discord webhook forwarding
- **GitHub** — source control / deployment source
- **Cloudflare Pages** — global hosting

## Project Structure

```
texim-one/
├── public/
│   ├── index.html          # Home page
│   ├── about.html          # About us
│   ├── convoy.html         # Convoy schedule
│   ├── contact.html        # Convoy invite form
│   ├── css/
│   │   └── style.css       # All styles
│   └── js/
│       ├── main.js         # Navigation, preloader, utilities
│       └── form.js         # Form validation & submission
├── functions/
│   └── api/
│       └── send.js         # Cloudflare Pages Function (Discord webhook)
├── .gitignore
└── README.md
```

## Getting Started (Local Development)

### Install Wrangler CLI (optional, for local function testing)

```bash
npm install -g wrangler
```

### Test the function locally

```bash
cd texim-one
wrangler dev
```

The frontend is served from `./public/` and the function runs at `./functions/api/send.js`.

## Deployment to Cloudflare Pages

### 1. Create a GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit: TEXIM ONE website"
git branch -M main
git remote add origin https://github.com/your-username/texim-one.git
git push -u origin main
```

### 2. Connect to Cloudflare Pages

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages) and sign in.
2. Click **Create a Project** → **Connect to Git** → select your GitHub repo.
3. In the **Build settings**, configure:
   - **Framework preset:** *None* (static site)
   - **Build command:** *(leave empty)*
   - **Build output directory:** `public`
4. Add an environment variable:
   - **Key:** `DISCORD_WEBHOOK_URL`
   - **Value:** _(Your Discord webhook URL — found in Discord channel → Edit Webhook)_
5. Click **Save and Deploy**.

## Environment Variables

Your Discord webhook URL is stored as a Cloudflare Pages environment variable — it is never exposed to the browser. To get your webhook URL:

1. In Discord, open your channel → **Edit Channel** → **Integrations** → **Webhooks**.
2. Create a new webhook (or copy an existing one).
3. Paste the URL into the `DISCORD_WEBHOOK_URL` Pages environment variable.

## Form Fields

The convoy invite form collects:
- Full Name *(required)*
- Discord Tag *(required)*
- Email
- Convoy Name / Event *(required)*
- Preferred Date *(required)*
- Preferred Time in UTC *(required)*
- Additional Details *(optional)*

## Customization

- **Colors:** Edit the hardcoded hex values (primary palette is black, white, and red — accent `#ff0000`).
- **Content:** Update text in the HTML files under `public/`.
- **Logo/branding:** Replace placeholder image divs and update the `logo` element.
- **Social links:** Update footer `<a>` links in each HTML file.
- **Favicon:** Replace `public/favicon.ico`.

## License

This project is provided as-is for the TEXIM ONE community.
