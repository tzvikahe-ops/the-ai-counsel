# The AI Counsel - מהדורת עברית (RTL)

🇺🇸 **[English version of this document](README.md)** | 🇮🇱 מסמך זה בעברית

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<p align="center">
  <img src="assets/landing_page.png" alt="The AI Counsel - מסך הבית הדו-מצבי" width="75%">
</p>

<div dir="rtl">

> **מועצת בינה מלאכותית קולקטיבית** - כנס מועצה של מודלי AI שמתדיינים, סוקרים זה את זה, ומסכמים את התשובה הטובה ביותר. או הרכב פאנל יועצים בעלי פרסונות שדנים בשאלתך ומגישים פסיקה מובנית.

---

## על המערכת

זוהי **מערכת דיון רב-מודלית בשני מצבים**. במקום להסתמך על מודל בודד לקבלת תשובות, היא מתזמרת מספר מודלי AI שעובדים יחד - דרך סקירת עמיתים אנונימית או דיון מבוסס פרסונות.

**בחר את החוויה שלך:**

- **🏛️ מועצת LLM** - מספר מודלי AI עונים באופן עצמאי על שאלתך, סוקרים זה את זה באופן אנונימי, ומודל יו"ר מסכם את החוכמה הקולקטיבית לתשובה סופית.
- **🎭 יועצי LLM** - פרסונות יועצים מוגדרות (הספקן, האסטרטג, האתיקאי, וכו') דנות בשאלתך לאורך מספר סבבים, מגיעות להסכמה או מצביעות כדי להגיש פסיקה מובנית עם תוכנית פעולה.

**בחירת המצב הנכון:** השתמש ב**מועצה** לתשובות ישירות, הנחיות יצירתיות, שאלות עובדתיות, וסינתזת "תן לי את התשובה הטובה ביותר". השתמש ב**יועצים** כששאלה כוללת עדיפויות אמיתיות, מחלוקות, סיכון, אסטרטגיה, אתיקה, תיעדוף, או החלטה לקבל. הנחיות פשוטות כמו "תן לי עובדה מדהימה על חיה" הן בדרך כלל הנחיות מועצה; פרסונות יועצים יהפכו אותן באופן טבעי לדיון על קריטריונים.

---

## התקנה

</div>

```bash
# Clone and install (Hebrew edition)
git clone https://github.com/tzvikahe-ops/the-ai-counsel.git
cd the-ai-counsel
uv sync                        # Backend dependencies
npm install --prefix frontend  # Frontend dependencies

# Run (from project root)
./start.sh
```

<div dir="rtl">

> רוצה את המהדורה המקורית באנגלית בלבד? שכפל את [jacob-bd/the-ai-counsel](https://github.com/jacob-bd/the-ai-counsel) במקום.

ואז פתח **http://localhost:5173** והגדר את מפתחות ה-API שלך בהגדרות.

> **דרישות מקדימות:** Python 3.10+, Node.js 18+, [uv](https://docs.astral.sh/uv/)

### הפעלה בעברית

הממשק נטען אוטומטית בעברית עם RTL. שני דברים נוספים שאתה צריך לעשות אחרי שהמערכת רצה:

1. **מפתחות API** - היכנס ל-⚙️ הגדרות → "מפתחות API של LLM" והזן את המפתחות שלך (OpenRouter / Anthropic / Google / וכו'). כל מפתח נשמר אוטומטית אחרי בדיקה מוצלחת.
2. **שפת תגובות המודלים** - היכנס להגדרות → "כללי" → "שפת תגובות מודלים" → בחר **Hebrew**. זה גורם למודלי המועצה והיועצים להגיב בעברית. (ברירת המחדל בבק-אנד היא English.)

יש גם החלפה בין מצב **בהיר** ⚪ (Sage) ל**כהה** ⚫ (Midnight Glass) - אייקון השמש/הירח בראש הסיידבר.

> **מעבר חזרה לאנגלית:** הגדרות → "שפת הממשק" → English.

---

## שני מצבי דיון

### 🏛️ מועצת LLM - דיון רב-מודלי

צינור שלושת השלבים המקורי שבו מגוון מודלי הגלם מייצר תשובות מאומתות:

</div>

```
השאלה שלך (+ חיפוש ברשת אופציונלי)
         │
         ▼
  ┌─────────────────────────────────┐
  │   שלב 1: דיון                    │
  │   Claude, GPT-4, Gemini, Llama  │
  │   כל אחד עונה באופן עצמאי         │
  └──────────────┬──────────────────┘
                 ▼
  ┌─────────────────────────────────┐
  │   שלב 2: סקירת עמיתים            │
  │   באנונימיות A, B, C, D          │
  │   כל מודל מדרג את כל האחרים      │
  └──────────────┬──────────────────┘
                 ▼
  ┌─────────────────────────────────┐
  │   שלב 3: סינתזת היו"ר            │
  │   סוקר הכל + דירוגים            │
  │   מגיש את התשובה הסופית          │
  └─────────────────────────────────┘
```

<div dir="rtl">

**מצבי הרצה** שולטים בעומק הדיון:

<table dir="rtl" width="100%">
  <thead>
    <tr>
      <th>מצב</th>
      <th>שלבים</th>
      <th>מתאים ל</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>צ'אט בלבד</strong></td>
      <td>שלב 1 בלבד</td>
      <td>תגובות מהירות, השוואת פלטים של מודלים</td>
    </tr>
    <tr>
      <td><strong>צ'אט + דירוג</strong></td>
      <td>שלבים 1 ו-2</td>
      <td>סקירת עמיתים ללא סינתזה</td>
    </tr>
    <tr>
      <td><strong>דיון מלא</strong></td>
      <td>כל 3 השלבים</td>
      <td>סינתזת מועצה מלאה (ברירת מחדל)</td>
    </tr>
  </tbody>
</table>

#### דיון איטרטיבי רב-סבבי (v0.7.0)

מצב המועצה תומך גם ב**דיון איטרטיבי רב-סבבי** - מודלים מעדנים את תשובותיהם לאורך מספר סבבים על בסיס ביקורות עמיתים, עם זיהוי התכנסות ועצירה מוקדמת:

</div>

```
  ┌─────────────────────────────────┐
  │   סבב 1: תגובות ראשוניות         │
  │   + ביקורת עמיתים                │
  └──────────────┬──────────────────┘
                 ▼
  ┌─────────────────────────────────┐
  │   סבבים 2-5: עידון                │
  │   הצלבת רעיונות של טענות         │
  │   חזקות + ביקורת ממוקדת          │
  │   (עצירה אוטומטית בהתכנסות)      │
  └──────────────┬──────────────────┘
                 ▼
  ┌─────────────────────────────────┐
  │   שלב 4: טיוטה מתוקנת           │
  │   היו"ר מסכם טיוטה סופית         │
  │   עם תיוגי [REVISED]/[NEW]      │
  └─────────────────────────────────┘
```

<div dir="rtl">

**שלושה מצבי ביקורת** שולטים באופן שבו מודלים מעריכים זה את זה:

<table dir="rtl" width="100%">
  <thead>
    <tr>
      <th>מצב</th>
      <th>איך זה עובד</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>חופשי (Free-form)</strong></td>
      <td>משוב פתוח על התגובה המלאה</td>
    </tr>
    <tr>
      <td><strong>ברמת פסקה</strong></td>
      <td>הערכה מובנית פסקה-אחר-פסקה עם תיוגים יציבים <code>[Para N]</code></td>
    </tr>
    <tr>
      <td><strong>ברמת טענה</strong></td>
      <td>היו"ר מחלץ טענות הניתנות לאימות; עמיתים פוסקים על כל טענה (חזקה/חלשה/פגומה)</td>
    </tr>
  </tbody>
</table>

הגדר סבבים (1-5), מצב ביקורת, וסף התכנסות ב**הגדרות > דיון מועצה**, או דרך כלי MCP `run_iterative_debate`. ראה [docs/COUNCIL-DEBATE-CONFIG.md](docs/COUNCIL-DEBATE-CONFIG.md) להדרכה מלאה.

### 🎭 יועצי LLM - דיון מבוסס פרסונות

גישה שונה מהותית: פרסונות מוגדרות בעלות סגנונות חשיבה שונים מתווכחות על שאלתך בסבבים מובנים.

מצב היועצים עובד הכי טוב כאשר יש משהו משמעותי לדון בו: בחירה אסטרטגית, החלטת מוצר, סקירת סיכונים, שאלה אתית, או אפשרויות מתחרות. לייצור תשובה פשוטה, השתמש במצב מועצה במקום.

</div>

```
השאלה שלך (+ חיפוש ברשת אופציונלי)
         │
         ▼
  ┌─────────────────────────────────┐
  │   סבב 1: עמדות פתיחה             │
  │   כל יועץ מציג את עמדתו           │
  └──────────────┬──────────────────┘
                 ▼
  ┌─────────────────────────────────┐
  │   סבב 2-N: דיון                  │
  │   סדר מתחלף, מגיבים זה לזה       │
  │   בשמם (עצירה אוטומטית בהסכמה)   │
  └──────────────┬──────────────────┘
                 ▼
  ┌─────────────────────────────────┐
  │   פסיקה (או שובר שוויון)         │
  │   סיכום, נקודות הסכמה,           │
  │   טבלת חילוקי דעות, פסיקה,       │
  │   צעדים הבאים, שאלות פתוחות      │
  └─────────────────────────────────┘
```

<div dir="rtl">

**12 פרסונות יועצים מובנות:**

<table dir="rtl" width="100%">
  <thead>
    <tr>
      <th>פרסונה</th>
      <th>תפקיד</th>
      <th>סגנון</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>🔍 <strong>הספקן</strong></td>
      <td>חושב ביקורתי</td>
      <td>מאתגר הנחות, דורש ראיות</td>
    </tr>
    <tr>
      <td>🔧 <strong>הפרגמטיסט</strong></td>
      <td>יועץ מעשי</td>
      <td>מתמקד בישימות ובאילוצים מציאותיים</td>
    </tr>
    <tr>
      <td>💡 <strong>החדשן</strong></td>
      <td>חושב יצירתי</td>
      <td>פורץ גבולות, חוקר פתרונות לא קונבנציונליים</td>
    </tr>
    <tr>
      <td>📜 <strong>ההיסטוריון</strong></td>
      <td>מנתח דפוסים</td>
      <td>מפיק לקחים מדפוסים היסטוריים</td>
    </tr>
    <tr>
      <td>⚖️ <strong>האתיקאי</strong></td>
      <td>מצפן מוסרי</td>
      <td>בוחן החלטות דרך אתיקה והוגנות</td>
    </tr>
    <tr>
      <td>📊 <strong>מנתח הנתונים</strong></td>
      <td>מעריך ראיות</td>
      <td>מביא דקדוק כמותי וראיות מדידות</td>
    </tr>
    <tr>
      <td>🎭 <strong>המנוגד</strong></td>
      <td>פרקליט השטן</td>
      <td>מתווכח בכוונה על העמדה הנגדית</td>
    </tr>
    <tr>
      <td>♟️ <strong>האסטרטג</strong></td>
      <td>חושב תמונה גדולה</td>
      <td>חושב לטווח ארוך על מיקום ומנופים</td>
    </tr>
    <tr>
      <td>🤝 <strong>ההומניסט</strong></td>
      <td>סנגור האנשים</td>
      <td>ממקד את החוויה האנושית ואת הרווחה</td>
    </tr>
    <tr>
      <td>🛡️ <strong>מעריך הסיכונים</strong></td>
      <td>מנתח סיכונים</td>
      <td>מזהה תרחישים בעייתיים ומיתון</td>
    </tr>
    <tr>
      <td>🎤 <strong>הליצן</strong></td>
      <td>מבקר הומוריסטי</td>
      <td>משתמש בשנינות כדי לחשוף אבסורד ומסגור חלש</td>
    </tr>
    <tr>
      <td>📈 <strong>הכלכלן</strong></td>
      <td>מנתח תמריצים</td>
      <td>מנתח תמריצים, מחסור, והשלכות לא מכוונות</td>
    </tr>
  </tbody>
</table>

כל הפרסונות **ניתנות להתאמה מלאה** - ערוך שם, תפקיד, תיאור, system prompt, ואימוג'י. שינויים נשמרים בין שיחות עם איפוס לברירת מחדל לכל פרסונה.

---

## פיצ'רים

### תמיכה במספר ספקים

ערבב והתאם מודלים מ-12 סוגי ספקים שונים:

<table dir="rtl" width="100%">
  <thead>
    <tr>
      <th>ספק</th>
      <th>סוג</th>
      <th>תיאור</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>OpenRouter</strong></td>
      <td>ענן</td>
      <td>100+ מודלים דרך API יחיד (GPT-4, Claude, Gemini, Mistral, וכו')</td>
    </tr>
    <tr>
      <td><strong>Ollama</strong></td>
      <td>מקומי</td>
      <td>הרץ מודלי קוד פתוח מקומית (Llama, Mistral, Phi, וכו')</td>
    </tr>
    <tr>
      <td><strong>Groq</strong></td>
      <td>ענן</td>
      <td>מהירות הסקה אולטרה מהירה למודלי Llama ו-Mixtral</td>
    </tr>
    <tr>
      <td><strong>NVIDIA NIM</strong></td>
      <td>ענן</td>
      <td>מודלים של NVIDIA Build דרך <code>integrate.api.nvidia.com</code></td>
    </tr>
    <tr>
      <td><strong>OpenCode Zen</strong></td>
      <td>ענן</td>
      <td>חיבור ישיר ל-<a href="https://opencode.ai">opencode.ai/zen</a> (chat/completions בלבד, v1)</td>
    </tr>
    <tr>
      <td><strong>OpenCode Go</strong></td>
      <td>ענן</td>
      <td>חיבור ישיר ל-OpenCode Go (מנוי, chat/completions בלבד, v1)</td>
    </tr>
    <tr>
      <td><strong>OpenAI Direct</strong></td>
      <td>ענן</td>
      <td>חיבור ישיר ל-API של OpenAI</td>
    </tr>
    <tr>
      <td><strong>Anthropic Direct</strong></td>
      <td>ענן</td>
      <td>חיבור ישיר ל-API של Anthropic</td>
    </tr>
    <tr>
      <td><strong>Google Direct</strong></td>
      <td>ענן</td>
      <td>חיבור ישיר ל-API של Google AI</td>
    </tr>
    <tr>
      <td><strong>Mistral Direct</strong></td>
      <td>ענן</td>
      <td>חיבור ישיר ל-API של Mistral</td>
    </tr>
    <tr>
      <td><strong>DeepSeek Direct</strong></td>
      <td>ענן</td>
      <td>חיבור ישיר ל-API של DeepSeek</td>
    </tr>
    <tr>
      <td><strong>Endpoint מותאם</strong></td>
      <td>כל אחד</td>
      <td>כל API תואם OpenAI (Together AI, Fireworks, vLLM, LM Studio, GitHub Models, וכו')</td>
    </tr>
  </tbody>
</table>

### אינטגרציית חיפוש ברשת

בסס את תגובות המועצה או היועצים שלך במידע בזמן אמת:

<table dir="rtl" width="100%">
  <thead>
    <tr>
      <th>ספק</th>
      <th>סוג</th>
      <th>הערות</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>DuckDuckGo</strong></td>
      <td>חינם</td>
      <td>חיפוש היברידי web+news, ללא צורך במפתח API</td>
    </tr>
    <tr>
      <td><strong>TinyFish</strong></td>
      <td>חינם</td>
      <td>Batch Fetch API לטעינה מהירה של מספר כתובות</td>
    </tr>
    <tr>
      <td><strong>Serper</strong></td>
      <td>מפתח API</td>
      <td>תוצאות Google אמיתיות, 2,500 שאילתות חינם</td>
    </tr>
    <tr>
      <td><strong>Tavily</strong></td>
      <td>מפתח API</td>
      <td>בנוי במיוחד ל-LLMs, תוכן עשיר</td>
    </tr>
    <tr>
      <td><strong>Brave Search</strong></td>
      <td>מפתח API</td>
      <td>ממוקד פרטיות, 2,000 שאילתות חינם לחודש</td>
    </tr>
  </tbody>
</table>

**טעינת כתבה מלאה**: משתמש ב-[Jina Reader](https://jina.ai/reader) כדי לחלץ תוכן כתבה מלא מתוצאות חיפוש עליונות (הגדרה 0-10 תוצאות).

### בקרת טמפרטורה

כוונן יצירתיות מול עקביות לכל שלב:

- **חום מועצה** (שלב 1): יצירתיות תגובה אישית (ברירת מחדל: 0.5)
- **חום דירוג עמיתים** (שלב 2): עקביות דירוג (ברירת מחדל: 0.3)
- **חום היו"ר** (שלב 3): יצירתיות סינתזה סופית (ברירת מחדל: 0.4)

חלק מצירופי ספק/מודל מקבלים רק את הטמפרטורה המוגדרת מראש שלהם. האפליקציה משמיטה אוטומטית טמפרטורה למודלים אלו כדי שבדיקות מקדימות וריצות לא ייכשלו עקב מגבלות טמפרטורה ספציפיות לספק.

### תכונות נוספות

- **מעקב התקדמות בזמן אמת** - ראה כל מודל או יועץ מגיב בזמן אמת עם streaming; התחבר מחדש לריצות פעילות דרך `GET /api/conversations/{id}/progress`
- **שיחות רב-תורניות** - שאלות המשך נושאות הקשר מלא אוטומטית
- **גודל מועצה** - התאם מועצה מ-1 עד 8 מודלים; יועצים מ-2 עד 4 פרסונות (בחר מתוך 12)
- **הגדרות יועצים מוקדמות** - שמור וטען הרכבי יועצים בשם (פרסונות, מצב מודל, סבבים/חיפוש ברשת אופציונליים) מהגדרת יועצים
- **ביטול בכל עת** - בטל בקשות בתהליך
- **היסטוריית שיחות** - כל השיחות נשמרות מקומית עם חיפוש; כרטיסי הסיידבר מציגים תאריך/זמן בערימה, סיכומי הרצה דחוסים (סבבים, מצב ביקורת, פרסונות, חיפוש), ועלות מצטברת לשרשור
- **System Prompts ניתנים להתאמה** - ערוך הנחיות שלב 1, 2, ו-3 למצב מועצה
- **דיווח עלות הרצה** - ראה עלות כוללת, פיצול טוקני קלט/פלט, מספר קריאות, ביטחון תמחור, ופירוט לפי מודל לריצות מועצה ויועצים
- **התרעות מגבלת קצב** - התראות כאשר התצורה שלך עשויה להגיע למגבלות API
- **"אני מרגיש בר מזל"** - אקראיות בהרכב המועצה
- **ייבוא וייצוא** - גיבוי ושיתוף של הגדרות, מפתחות API, והנחיות
- **דריסת מודל לכל בקשה** - השתמש במודלים שונים לבקשות בודדות בלי לשנות תצורה גלובלית
- **API של בקשה בודדת** - `POST /api/ask` לסקריפטים וסוכני MCP (ללא מצב שיחה)
- **פריסת Docker** - פריסה לייצור בקונטיינר יחיד דרך `docker compose`

---

## התחלה מהירה

### דרישות מקדימות

- **Python 3.10+**
- **Node.js 18+**
- **[uv](https://docs.astral.sh/uv/)** (מנהל חבילות Python)

### הרצת האפליקציה

**אפשרות 1: שימוש בסקריפט ההפעלה (מומלץ)**
</div>

```bash
./start.sh
```

<div dir="rtl">

**אפשרות 2: הרצה ידנית**

טרמינל 1 (בק-אנד):
</div>

```bash
uv run python -m backend.main
```

<div dir="rtl">

טרמינל 2 (פרונטאנד):
</div>

```bash
cd frontend
npm run dev
```

<div dir="rtl">

ואז פתח **http://localhost:5173** בדפדפן שלך.

### פריסת Docker / VPS

</div>

```bash
docker compose up -d --build
```

<div dir="rtl">

ואז פתח **http://YOUR_SERVER_IP:8001**. שיחות והגדרות נשמרות ב-`./data` אוטומטית.

לאינטגרציית Ollama, הגדרת reverse proxy, משתני סביבה, והוראות שדרוג, ראה **[docs/DOCKER.md](docs/DOCKER.md)**.

> **בא מ-LLM Council Plus?** ראה את **[מדריך המעבר](docs/MIGRATION.md)** להוראות שדרוג צעד-אחר-צעד. הנתונים והתצורות שלך עוברים ללא שינויים.

### גישה מרשת

סקריפט ההפעלה חושף את הפרונטאנד והבק-אנד ברשת אוטומטית:

- **מקומי:** `http://localhost:5173`
- **רשת:** `http://YOUR_IP:5173`

להגדרה ידנית:
</div>

```bash
# בק-אנד עם גישת רשת
LLM_COUNCIL_BIND_HOST=0.0.0.0 uv run python -m backend.main

# פרונטאנד עם גישת רשת
cd frontend && npm run dev -- --host
```

<div dir="rtl">

נקודות קצה של ניהול מרחוק (`/api/settings/export`, `/api/settings/import`, `/api/settings/reset`) דורשות `LLM_COUNCIL_ADMIN_TOKEN` כשניגשים אליהן מ-proxy או מלקוחות מרוחקים.

---

## תצורה

### הגדרה ראשונה

בהפעלה הראשונה, הגדר לפחות ספק LLM אחד בהגדרות:

1. **מפתחות API של LLM** - הזן מפתחות API לספקים שבחרת (וכתובת Ollama / endpoint מותאם אם בשימוש)
2. **הגדרת מועצה** (בהגדרות) או **הגדרת מועצה במסך הבית** - הוסף חברים ויו"ר; שניהם עורכים את אותו הרכב שמור (שמירה אוטומטית)

שינויים בהגדרות נשמרים אוטומטית (כשנייה אחרי שתפסיק לערוך). מפתחות API **נשמרים אוטומטית** כשאתה לוחץ "Test" והחיבור מצליח.

**מתגי ספקים גלובליים:** מתגי ספקים בהגדרות → הגדרת מועצה שולטים על המקורות שמופיעים ב**כל** בחירות המודלים - הגדרת מועצה והגדרת יועצים כאחת. ספק חייב להיות גם מוגדר (מפתח API) וגם מופעל (מתג דולק) כדי להציג את המודלים שלו.

**הגדרות יועצים מוקדמות:** בהגדרת יועצים, שמור הרכבים בשם (פרסונות, מודלים, סבבים/חיפוש ברשת אופציונליים) מסקציית הקצאת המודלים. הגדרות נשמרות ב-`settings.json` כ-`advisor_presets` (מקסימום 20; אחת ברירת מחדל).

### מפתחות API של LLM

<table dir="rtl" width="100%">
  <thead>
    <tr>
      <th>ספק</th>
      <th>קבל מפתח API</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>OpenRouter</td>
      <td><a href="https://openrouter.ai/keys">openrouter.ai/keys</a></td>
    </tr>
    <tr>
      <td>Groq</td>
      <td><a href="https://console.groq.com/keys">console.groq.com/keys</a></td>
    </tr>
    <tr>
      <td>NVIDIA</td>
      <td><a href="https://build.nvidia.com/">build.nvidia.com</a></td>
    </tr>
    <tr>
      <td>OpenAI</td>
      <td><a href="https://platform.openai.com/api-keys">platform.openai.com/api-keys</a></td>
    </tr>
    <tr>
      <td>Anthropic</td>
      <td><a href="https://console.anthropic.com/">console.anthropic.com</a></td>
    </tr>
    <tr>
      <td>Google AI</td>
      <td><a href="https://aistudio.google.com/apikey">aistudio.google.com/apikey</a></td>
    </tr>
    <tr>
      <td>Mistral</td>
      <td><a href="https://console.mistral.ai/api-keys/">console.mistral.ai/api-keys</a></td>
    </tr>
    <tr>
      <td>DeepSeek</td>
      <td><a href="https://platform.deepseek.com/">platform.deepseek.com</a></td>
    </tr>
  </tbody>
</table>

### Ollama (מודלים מקומיים)

1. התקן [Ollama](https://ollama.com/)
2. משוך מודלים: `ollama pull llama3.1`
3. הפעל את Ollama: `ollama serve`
4. בהגדרות, הזן את כתובת Ollama שלך (ברירת מחדל: `http://localhost:11434`)
5. לחץ "התחבר" לאימות

### Endpoint מותאם תואם OpenAI

התחבר לכל API תואם OpenAI:

1. לך ל-**מפתחות API של LLM** ← **Endpoint מותאם תואם OpenAI**
2. הזן **שם תצוגה**, **כתובת בסיס**, ו**מפתח API** (אופציונלי לשרתים מקומיים)
3. לחץ "התחבר" לבדיקה ושמירה

**שירותים תואמים**: Together AI, Fireworks AI, vLLM, LM Studio, GitHub Models, ועוד.

---

## שרת MCP

המערכת חושפת שרת MCP (Model Context Protocol) חזק, המאפשר לכלי AI כמו Claude Code ו-Gemini CLI לתקשר ישירות עם המופע המקומי או המרוחק שלך.

השרת חושף **10 כלים מבוססי פעולה** מקובצים לפי תחום:
1. **דיון**: `council_deliberate` (stage1/stage2/stage3/full), `model_chat` (quick/multi_turn), `advisor_debate`, `run_iterative_debate`
2. **תצורה**: `council_settings`, `advisor_settings`, `personas`, `providers`, `config_backup`
3. **היסטוריה**: `conversations` (list/get)

שמות הכלים הישנים (25) הוסרו ב-v0.5.2. `run_iterative_debate` נוסף ב-v0.7.0. ראה [docs/mcp/TOOLS.md](docs/mcp/TOOLS.md) לפרמטר הפעולה לכל כלי.

**הרשמה מהירה ל-Claude Code:**

* **אפשרות א': stdio מקומי (סטנדרט לפיתוח מקומי)**
</div>

  ```bash
  pip install -e .
  claude mcp add the-ai-counsel python -m the_ai_counsel_mcp
  ```

<div dir="rtl">

* **אפשרות ב': SSE מרוחק (ללא התקנה לקונטיינרים/שרתים)**
</div>

  ```bash
  claude mcp add the-ai-counsel --url http://yourserver.com:8001/mcp/sse
  ```

<div dir="rtl">

ואז שאל את Claude: "בדוק את בריאות המועצה" כדי לוודא את החיבור (`providers` → פעולה `health`; צפה ל-10 כלים ב-`/api/health`).

ראה **[docs/mcp/](docs/mcp/)** למדריכי הגדרה מלאים, כולל תצורות תעבורת stdio/SSE, הפניית כלים מלאה, ודוגמאות שימוש.

---

## Claude Code Skill (גיבוי REST)

כשאין MCP זמין או כשאתה צריך CRUD של preset / SSE גולמי, התקן את **`the-ai-counsel-api` skill**. כש**שניהם** skill ו-MCP נוכחים, סוכנים צריכים **להשתמש בכלי MCP קודם** - ה-skill מתעד REST כגיבוי.

</div>

```bash
# קישור סמלי מהריפו ששוכפל
mkdir -p ~/.claude/skills
ln -s "$(pwd)/skills/the-ai-counsel-api" ~/.claude/skills/the-ai-counsel-api
```

<div dir="rtl">

ה-skill מכסה את כל נקודות הקצה של ה-API, parsing של SSE stream, נקודות קצה של יועצים, ופתרון בעיות. ראה [`skills/the-ai-counsel-api/SKILL.md`](skills/the-ai-counsel-api/SKILL.md) להפניה מלאה.

תורמים: שמרו על REST API, כלי MCP, skill, ומסמכי משתמש מסונכרנים - ראה [`docs/DOC-SYNC.md`](docs/DOC-SYNC.md).

---

## ערימת טכנולוגיות

<table dir="rtl" width="100%">
  <thead>
    <tr>
      <th>רכיב</th>
      <th>טכנולוגיה</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>בק-אנד</strong></td>
      <td>FastAPI, Python 3.10+, httpx (HTTP אסינכרוני)</td>
    </tr>
    <tr>
      <td><strong>פרונטאנד</strong></td>
      <td>React 19, Vite, react-markdown</td>
    </tr>
    <tr>
      <td><strong>עיצוב</strong></td>
      <td>CSS עם ערכת נושא כהה "Midnight Glass" + ערכת נושא בהירה "Sage"</td>
    </tr>
    <tr>
      <td><strong>אחסון</strong></td>
      <td>קבצי JSON בתיקיית <code>data/</code></td>
    </tr>
    <tr>
      <td><strong>ניהול חבילות</strong></td>
      <td>uv (Python), npm (JavaScript)</td>
    </tr>
  </tbody>
</table>

---

## אחסון נתונים

כל הנתונים נשמרים מקומית בתיקיית `data/`:

</div>

```
data/
├── settings.json              # תצורה (כוללת מפתחות API)
├── persona_overrides.json     # התאמות פרסונות יועצים
└── conversations/             # היסטוריית שיחות
    ├── {uuid}.json
    └── ...
```

<div dir="rtl">

**פרטיות**: הנחיות ותגובות נשלחות רק לספקי ה-LLM/חיפוש המוגדרים שלך. דיווח עלות גם מביא קטלוגי תמחור מודלים ציבוריים; הוא לא שולח טקסט הנחיה, תגובות, או מפתחות API.

> **⚠️ אזהרת אבטחה: מפתחות API נשמרים בטקסט גלוי**
>
> מפתחות API נשמרים בטקסט גלוי ב-`data/settings.json`. תיקיית `data/` כלולה ב-`.gitignore` כברירת מחדל.
>
> - **אל תסיר את `data/` מ-`.gitignore`**
> - לעולם אל תכניס את `data/settings.json` למערכת בקרת גרסאות
> - אם חשפת בטעות את המפתחות שלך, סובב אותם מיד

---

## פתרון תקלות

**שגיאה: "Failed to load conversations"**
- הבק-אנד עדיין מתחיל לעלות - האפליקציה מנסה שוב אוטומטית

**מודלים לא מופיעים בתפריט הנפתח**
- ודא שמתג הספק מופעל ב-**הגדרות ← הגדרת מועצה** (המתגים גלובליים - חלים על בחירות מועצה ויועצים)
- בדוק שמפתח ה-API מוגדר ונבדק בהצלחה
- עבור Ollama, ודא שהחיבור פעיל

**שגיאות 451 מ-Jina Reader**
- שגיאת HTTP 451 = האתר חוסם scrapers של AI (נפוץ באתרי חדשות)
- נסה Tavily/Brave במקום, או הגדר `full_content_results` ל-0

**שגיאות מגבלת קצב (OpenRouter)**
- מודלים חינמיים: 20 בקשות לדקה, 50 ליום
- שקול שימוש ב-Groq (14,400 ליום) או Ollama (ללא הגבלה)

**שגיאות תאימות בינארית (node_modules)**
- בעת סנכרון בין Macs Intel/Apple Silicon:
</div>

  ```bash
  rm -rf frontend/node_modules && npm install --prefix frontend
  ```

<div dir="rtl">

**לוגים:**
- בק-אנד: טרמינל שמריץ `uv run python -m backend.main`
- פרונטאנד: קונסולת DevTools של הדפדפן

---

## קרדיטים והכרת תודה

זוהי גרסת לוקליזציה לעברית (RTL) של הפרויקט **[the-ai-counsel](https://github.com/jacob-bd/the-ai-counsel)** מאת **[Jacob Ben-David](https://github.com/jacob-bd)**.

הפרויקט של Jacob מבוסס בעצמו על **[llm-council](https://github.com/karpathy/llm-council)** המקורי מאת **[Andrej Karpathy](https://github.com/karpathy)**, ומרחיב אותו עם:
- דיון דו-מצבי (מועצה + יועצים)
- 12 אינטגרציות ספקים (כולל NVIDIA NIM ו-OpenCode Zen/Go)
- חיפוש ברשת
- דיונים מבוססי פרסונות
- הנחיות הניתנות להתאמה
- שרת MCP
- פריסת Docker
- ועוד הרבה

ה‑fork הנוכחי (הגרסה העברית) מוסיף את הדברים הבאים:
- לוקליזציית UI עברית (he) מלאה עם פריסת RTL
- ערכת נושא בהירה "Sage" רגועה-מודרנית (ירוק יער + נחושת) בנוסף לערכת ה-Midnight Glass הכהה הקיימת
- פרסונות יועצים מותאמות (שמות, תפקידים, תיאורים) וגרסאות עבריות של כל הנחיות היועצים (סבב 1, המשך, חילוץ הצלבת רעיונות, שובר שוויון, פסיקה)
- שמות פרסונות עבריים בטרנסקריפט הדיון כך שמודלים מתייחסים זה לזה באותה שפה שהם עונים בה

תודה ל‑Andrej Karpathy על ההשראה המקורית והקוד, ול‑Jacob Ben-David על בניית מערכת הדיון הדו-מצבית שאפשרה את הלוקליזציה הזו.

לוקליזציה לעברית וערכת נושא בהירה Sage מאת **Zvika Hershkovitz** ([@tzvikahe-ops](https://github.com/tzvikahe-ops)).

---

## רישיון

רישיון MIT - ראה [LICENSE](LICENSE) לפרטים.

---

## תרומה

תרומות מתקבלות בברכה! פרויקט זה חי ברוח "vibe coding" - הרגישו חופשי לעשות fork ולעצב משלכם.

אם אתה רוצה להוסיף שפה נוספת (ערבית, צרפתית, ספרדית, וכו'), תשתית ה-i18n מוכנה: שמור קובץ `XX.json` חדש ב-[frontend/src/i18n/locales/](frontend/src/i18n/locales/), רשום אותו ב-[frontend/src/i18n/index.js](frontend/src/i18n/index.js), והוסף אותו לבוחר שפת הממשק ב-[הגדרות → כללי](frontend/src/components/settings/GeneralSettings.jsx). ללוקליזציה ברמת הנחיה מלאה (כמו הנחיות היועצים העבריים), עקוב אחר אותו דפוס כמו `ADVISOR_*_PROMPT_HEBREW` ב-[backend/advisor_prompts.py](backend/advisor_prompts.py) וחווט את החלפת השפה ב-[backend/advisors.py](backend/advisors.py) דרך `_pick_advisor_prompt()`.

כל סוג של תרומה מתקבל בברכה - issues, PRs, ודיווחי "ניסיתי, הנה מה שנשבר". אין תהליך פורמלי, אין שמירת סף של style guide.

---

<p align="center">
  <strong>נבנה בחוכמה הקולקטיבית של AI</strong><br>
  <em>שאלו את המועצה. דונו עם היועצים. קבלו תשובות טובות יותר.</em>
</p>
