# HubZero‑Next ⚛️✨

**The official Next.js frontend for the Hub Zero website — a tech-driven collective crafting software, electronics, and design solutions.**

---

## 🔗 Table of Contents

1. [About the Project](#️-about-the-project)
2. [Tech Stack](#️-tech-stack)
3. [Features](#️-features)
4. [Getting Started](#️-getting-started)
5. [Deployment](#️-deployment)
6. [Contributing](#️-contributing)
7. [License](#️-license)

---

## 📝 About the Project

**HubZero‑Next** is the blazing-fast frontend powering [hubzero.in](https://hubzero.in) — a sleek portfolio and service site built by the **Hub Zero** team: a crew of CSE and ECE engineers merging code and creativity.

This project focuses on modern UI/UX, scroll-triggered animations, SEO, and responsiveness — all built with **Next.js** for production-ready performance.

---

## 🛠️ Tech Stack

| Layer               | Technologies                                  |
| ------------------- | --------------------------------------------- |
| **Framework**       | Next.js (App Router)                          |
| **Styling**         | Tailwind CSS                                  |
| **Animations**      | GSAP + ScrollTrigger                          |
| **Assets**          | Cloudinary (for images via URLs)              |
| **Hosting**         | Ubuntu Server 24.04 LTS, NGINX, Cloudflare    |
| **Analytics & SEO** | Open Graph Tags, Favicon, Structured Metadata |

---

## 🚀 Features

* 🧑‍💻 Interactive team showcase with portfolio navigation
* 🌈 Custom UI with scroll-triggered animations (GSAP)
* 🖼️ Image delivery via Cloudinary URLs (lightweight & fast)
* 🧭 Sticky navbar with scroll-to-section navigation
* 🌐 SEO‑friendly with Open Graph tags and structured data
* 📱 Fully responsive and optimized for all devices
* 🌙 Built for dark mode (default styling)

---

## ⚙️ Getting Started

```bash
# Clone the repo
git clone https://github.com/Rifaque/HubZero-Next.git
cd HubZero-Next/client

# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build
```

---

## 📦 Deployment

This project is deployed on:

* **Ubuntu Server 24.04 LTS**
* **NGINX** as a reverse proxy for static builds
* **Cloudflare** for domain, DNS, HTTPS & security
* **Manual CI/CD:** Deployment via shell script (`deploy.sh`) from project root

To deploy a fresh build:

```bash
cd client
npm run build
cd ..
./deploy.sh
```

---

## 🤝 Contributing

We’d love to see improvements or ideas from other developers!

### How to Contribute

```bash
1. Fork this repository
2. Create a new branch: git checkout -b feature/your-feature
3. Commit your changes: git commit -m "Add your feature"
4. Push to your fork: git push origin feature/your-feature
5. Open a Pull Request 🚀
```

Let’s build something future-ready together.

---

## 📄 License

This project is licensed under the **MIT License**.
See the [LICENSE](LICENSE) file for full details.

---

<p align="center">
  ⚛️ Powered by <strong>Hub Zero</strong> — Engineering Ideas Into Reality.
</p>
