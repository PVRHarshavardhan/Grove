# Grove: study goals, focus forest and study groups

An installable app for phone and laptop. It has:

- **Home dashboard**
  - today's focus goal ring and a 7-day strip
  - counts of open, due-today, overdue and completed tasks
  - charts by priority, status, category and delegate
  - today's and tomorrow's tasks, and an overdue list
- **Tasks**
  - task, due date, priority (🔥🔴🟠🟡🟢), status, category, delegate and description
  - tick a task to complete it
  - list view or board view, with filters
- **Calendar**: a month view of tasks and other entries, with a today's summary and a setting to hide statuses
- **Focus**: a Pomodoro timer that **grows a tree** while you focus
  - giving up withers the tree
  - you unlock new species (Oak, Pine, Cherry, Maple, Jacaranda, Bamboo) as you grow more trees
- **My Forest**: every tree you've grown, by day, week, month or year, with focus time by category
- **Groups**
  - make a group, share a 6-letter code, and compare daily study hours with friends
  - leaderboard, 7-day chart and a day-by-day table
  - friends only see your daily hours and number of trees, never your tasks
- **Settings**: daily goal hours for each weekday, week start day, categories, delegates and Pomodoro lengths

Everything is **free**:
- **GitHub Pages** hosts the app.
- **Firebase**, on its free Spark plan, handles Google sign-in and the database.

**Try it first:** if `config.js` is left empty, the app runs in **demo mode**. Data stays on that device and the group friends are sample people.

---

## Part 1: Put the app online (GitHub)
1. On github.com, click **+ → New repository**, name it `grove`, choose **Public**, then **Create**.
2. Click **uploading an existing file**. Select **everything inside this folder** and drag it in, including the `icons` folder (not the PNG files inside it). Click **Commit changes**.
3. Go to **Settings → Pages**. Set Source to **Deploy from a branch**, then **main** and **/ (root)**. Click **Save**.
4. After 1–2 minutes your link is `https://YOUR-USERNAME.github.io/grove/`. It opens in demo mode.

## Part 2: Turn on accounts and groups (Firebase, free)
1. Go to **console.firebase.google.com** and click **Create a project**. Name it `Grove`, turn Google Analytics off, and click **Create**.
2. **Google sign-in**
   1. Go to **Build → Authentication → Get started → Sign-in method → Google**.
   2. **Enable** it, pick your support email, and click **Save**.
   3. Open **Authentication → Settings → Authorized domains → Add domain** and enter `YOUR-USERNAME.github.io` (all lowercase).
3. **Database**
   1. Go to **Build → Firestore Database → Create database**.
   2. For location, pick **asia-south1 (Mumbai)**. Choose **Start in production mode**, then **Create**.
   3. Open the **Rules** tab, delete everything, paste in the contents of `firestore.rules` from this folder, and click **Publish**.
4. **Web keys**
   1. Click the ⚙️ next to Project Overview → **Project settings → Your apps → </> (Web)**.
   2. Enter the nickname `Grove` and click **Register app**. Don't tick Hosting.
   3. Copy the 4 values `apiKey`, `authDomain`, `projectId` and `appId`.
5. In GitHub, open `config.js` → ✏️ Edit, paste the 4 values between the quotes, and click **Commit changes**.

Wait 2 minutes, open your link, and tap **Continue with Google**. The demo banner disappears.

These keys are safe to be public. Your data is protected by the rules from step 3 and by Google sign-in.

## Part 3: Install it and invite friends
- **Android:** open the link in Chrome, then tap **Install app**.
- **iPhone:** open the link in Safari, then **Share → Add to Home Screen**.
- **Laptop:** open the link in Chrome or Edge and click the install icon in the address bar.
- **Groups:** go to **Groups → Create group**, then **Share invite link**. A friend who opens the link, signs in with Google and lands in the group automatically. They set their own goals in Settings.

## Releasing updates
Replace the changed files in GitHub, then change `VERSION` in `sw.js` (for example `grove-v1.0.0` → `grove-v1.0.1`). Data in Firebase is never touched by an update.

## Free-plan limits (Firebase Spark)
50,000 reads, 20,000 writes and 1 GB of storage per day. That is far more than a study group needs. No card is required, and you are never charged on Spark.
