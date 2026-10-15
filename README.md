# 👑 Royal E-Wedding Invitation Website

An interactive, royal wedding e-invitation web application featuring a realistic physical pull-down scroll, golden wax seal, ambient particles, romantic synthesized music, live countdown, and instant RSVP.

Designed and optimized to be hosted effortlessly on **GitHub Pages**.

---

## ✨ Features

- 📜 **Interactive Pull-Down Scroll**:
  - Touch and mouse gesture drag physics.
  - Golden silk braided thread with jewel ring and royal tassel.
  - Golden instruction prompt underneath: `⇣ Pull down the thread to unroll the invitation ⇣`.
  - Smooth unrolling transition revealing the grand royal parchment.
- 🎶 **Synthesized Royal Ambient Music & Chimes**:
  - Built natively with the Web Audio API (zero external MP3 dependencies, 100% reliable offline and on GitHub Pages).
  - Sparkling chime sound effect upon unrolling.
  - Floating mute/unmute control.
- ⏳ **Live Countdown Timer**:
  - Days, Hours, Minutes, and Seconds counting down to the wedding moment.
- 🏰 **Comprehensive Event & Ceremony Details**:
  - Placeholders for Bride & Groom names, parentage, sacred invocations, and romantic quotes.
  - Highlight card with date, time, venue, and full address.
  - 📍 Direct Google Maps integration.
  - 📋 One-click "Copy Venue Address" with toast feedback.
  - 📅 "Add to Google Calendar" button (pre-filled with event details).
  - 💾 "Download Calendar (.ICS)" for Apple Calendar and Microsoft Outlook.
- 👗 **Detailed Wedding Itinerary**:
  - Day 1: Mehendi & Sangeet Night (with Dress Code).
  - Day 2: Haldi Ceremony & Phoolon Ki Holi (with Dress Code).
  - Day 2: Baraat, Varmala & Sacred Pheras.
  - Day 2: Grand Gala Reception & Dinner.
- 💌 **Interactive RSVP & Blessings Wall**:
  - Attendance selection, guest counter, dietary preferences, and personal blessing note.
  - Live blessings wall showing notes from family and friends.
  - Celebratory golden confetti burst on submission.
- ⚙️ **Built-in Real-Time Personalizer**:
  - Slide-out customization drawer allows changing names, dates, venue, and map URL instantly in the browser without writing any code.
  - Automatically persists to `localStorage`.

---

## 🚀 How to Host on GitHub Pages (Step-by-Step)

### Option 1: Using Git via Terminal (Recommended)

1. **Create a new repository on GitHub**:
   - Go to [github.com/new](https://github.com/new).
   - Enter a repository name (e.g., `wedding-invitation`).
   - Leave it **Public** and do **not** check "Initialize with a README" (since this project is already initialized).
   - Click **Create repository**.

2. **Push your code from this folder**:
   Open PowerShell in this folder (`wedding-invitation`) and run:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - In your GitHub repository, click on **Settings** (top tab).
   - In the left sidebar, click on **Pages**.
   - Under **Build and deployment > Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and folder `/ (root)`, then click **Save**.
   - Wait 1–2 minutes, and your live website link will appear at:
     ```
     https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPO_NAME>/
     ```

---

### Option 2: Uploading via GitHub Web Interface

1. Create a new repository on [GitHub](https://github.com).
2. Click **Add file** > **Upload files**.
3. Drag and drop all the files from this folder (`index.html`, `style.css`, `script.js`, `.nojekyll`, and the `assets` folder).
4. Click **Commit changes**.
5. Enable GitHub Pages in **Settings > Pages** as described above.

---

## 🎨 File Structure

```
wedding-invitation/
├── index.html       # Semantic HTML5 wedding invitation structure
├── style.css        # Luxury royal styling, fonts, and smooth animations
├── script.js        # Pull-down physics, Web Audio synthesizer, countdown & RSVP
├── .nojekyll        # Ensures GitHub Pages serves all assets correctly
├── README.md        # Documentation and deployment instructions
└── assets/
    ├── couple.jpg   # Royal couple portrait artwork
    └── seal.jpg     # Luxury gold wax seal medallion
```
