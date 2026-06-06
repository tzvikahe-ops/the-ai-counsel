# חיבור The AI Counsel ל-Claude (MCP + Skill)

ה-MCP server **מובנה בתוך ה-backend**. ברגע שהפעלת את `Start-AI-Counsel.bat`
וה-backend רץ על פורט 8001, ה-MCP זמין אוטומטית בכתובת:
`http://localhost:8001/mcp/sse`  → חושף 10 כלים.

יש שתי דרכי חיבור עיקריות, ולכל אחת שתי גרסאות (SSE / stdio).

- **SSE** = מתחבר ל-backend שכבר רץ. פשוט יותר. דורש שה-bat יהיה מופעל.
- **stdio** = Claude מפעיל את ה-MCP לבד. לא דורש backend רץ מראש, אך צריך התקנה חד-פעמית.

---

## דרך 1 — Claude Code

### גרסת SSE (מומלצת)
ודא שה-backend רץ, ואז בטרמינל:
```
claude mcp add the-ai-counsel --url http://localhost:8001/mcp/sse
```

### גרסת stdio
התקנה חד-פעמית, ואז רישום:
```
cd "C:\The AI Counsel\the-ai-counsel"
uv pip install -e .
claude mcp add the-ai-counsel uv run python -m the_ai_counsel_mcp
```

לבדיקה: בתוך Claude Code בקש "check the council health" — אמורים להופיע 10 כלים.

---

## דרך 2 — Claude Desktop

ערוך את קובץ ה-config:
```
%APPDATA%\Claude\claude_desktop_config.json
```
(או מתוך Claude Desktop: Settings → Developer → Edit Config)

הוסף אחד מהבלוקים הבאים בתוך `"mcpServers"`. אם המפתח כבר קיים, הוסף רק את
השורה `"the-ai-counsel": { ... }` בתוכו. אחרי שמירה — סגור ופתח מחדש את Claude Desktop.

### גרסת SSE (מומלצת — דורש שה-backend ירוץ)
```json
{
  "mcpServers": {
    "the-ai-counsel": {
      "url": "http://localhost:8001/mcp/sse"
    }
  }
}
```

### גרסת stdio (Claude Desktop מפעיל לבד)
התקנה חד-פעמית קודם (בטרמינל):
```
cd "C:\The AI Counsel\the-ai-counsel"
uv pip install -e .
```
ואז ב-config:
```json
{
  "mcpServers": {
    "the-ai-counsel": {
      "command": "uv",
      "args": [
        "--directory",
        "C:\\The AI Counsel\\the-ai-counsel",
        "run",
        "python",
        "-m",
        "the_ai_counsel_mcp"
      ]
    }
  }
}
```
> אם `uv` לא נמצא, החלף את `"command": "uv"` בנתיב המלא ל-uv.exe
> (מצא אותו עם `where uv` בטרמינל).

---

## ה-Skill (אופציונלי, גיבוי)

ה-skill `the-ai-counsel-api` מסביר ל-Claude איך לדבר עם ה-API דרך REST/curl
כשה-MCP לא זמין. כשגם skill וגם MCP קיימים — Claude משתמש קודם ב-MCP.

הקובץ נמצא ב: `skills\the-ai-counsel-api\SKILL.md`

להתקנה ב-Claude Code, העתק את תיקיית ה-skill אל תיקיית הסקילים:
```
%USERPROFILE%\.claude\skills\
```
(או צור symlink). לרוב לא נחוץ אם ה-MCP מחובר.

---

## בדיקה מהירה שהכל עובד

1. ודא שה-backend רץ: פתח בדפדפן `http://localhost:8001/api/health`
   → אמור להחזיר `"mcp": {"tools": 10, ...}`
2. ב-Claude (Code או Desktop) בקש: **"check the council health"**
3. נסה: **"ask the council: <שאלה כלשהי>"**
