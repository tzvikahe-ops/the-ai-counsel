"""Prompt templates for the LLM Advisors debate system."""

CONSENSUS_TAG_INSTRUCTION = (
    "\n\nIMPORTANT: End your response with a Consensus Signal section and then, on its own final line, "
    "write exactly CONSENSUS_SCORE: N, replacing N with a single number from 1 to 5. Use 1 if you strongly disagree with the emerging group "
    "position, 3 if you are neutral or undecided, and 5 if you fully agree and are ready to converge. "
    "The score line must be the last line."
)

# Hebrew variant: identical machine-readable sentinel "CONSENSUS_SCORE: N"
# (must stay English so the parser still matches), but the surrounding
# instruction is translated and the section heading the model is told to
# produce is "אות הסכמה" - matching the rest of the Hebrew prompt set.
CONSENSUS_TAG_INSTRUCTION_HEBREW = (
    "\n\nחשוב: סיים את תגובתך בסעיף \"אות הסכמה\", ואז בשורה אחרונה נפרדת "
    "כתוב בדיוק CONSENSUS_SCORE: N, כאשר N הוא מספר בודד בין 1 ל-5. "
    "השתמש ב-1 אם אתה לא מסכים לחלוטין עם עמדת הקבוצה המתגבשת, "
    "ב-3 אם אתה ניטרלי או מתלבט, וב-5 אם אתה מסכים לחלוטין ומוכן להתכנס. "
    "שורת הציון חייבת להיות השורה האחרונה. אל תתרגם את המחרוזת "
    "CONSENSUS_SCORE - היא חייבת להישאר באנגלית."
)

ADVISOR_ROUND1_PROMPT = (
    "{search_context_block}"
    "You are participating in a structured debate as an advisor.\n\n"
    "The question being debated:\n{question}\n\n"
    "Round 1 is for your opening position. Do not rebut other advisors yet.\n\n"
    "Target response length: 150 words maximum. Follow this exact structure:\n"
    "- Position (~100 words): State your position clearly and support it with reasoning.\n"
    "- Consensus Signal (~50 words): State your CONSENSUS_SCORE (1-5) and explain it in one sentence.\n\n"
    "Be direct and concise. If you exceed 150 words, the response may be flagged with a warning."
    "{consensus_tag}"
)

# Hebrew variant of ROUND1 - section headings are pre-translated so the
# model emits "## עמדה" and "## אות הסכמה" verbatim rather than guessing.
ADVISOR_ROUND1_PROMPT_HEBREW = (
    "{search_context_block}"
    "You are participating in a structured debate as an advisor.\n"
    "You MUST respond entirely in Hebrew. Every section heading below must "
    "appear in your output exactly as written in Hebrew - do NOT translate "
    "the headings back to English or transliterate them.\n\n"
    "The question being debated:\n{question}\n\n"
    "Round 1 is for your opening position. Do not rebut other advisors yet.\n\n"
    "Target response length: 150 words maximum. Use EXACTLY this Hebrew "
    "structure (markdown headings):\n"
    "## עמדה\n"
    "(~100 מילים) הצג את עמדתך בבירור והסבר אותה בנימוקים.\n\n"
    "## אות הסכמה\n"
    "(~50 מילים) הצג את CONSENSUS_SCORE שלך (1-5) והסבר אותו במשפט אחד.\n\n"
    "כתוב באופן ישיר ותמציתי. אם תחרוג מ-150 מילים, התגובה עלולה להיות מסומנת באזהרה."
    "{consensus_tag}"
)

ADVISOR_FOLLOWUP_PROMPT = (
    "{search_context_block}"
    "You are participating in a structured debate as an advisor.\n\n"
    "The question being debated:\n{question}\n\n"
    "This is Round {round_number}. You are responding to the debate as it has evolved, not re-answering "
    "the original question from scratch.\n\n"
    "Cross-pollination extract from Round {previous_round_number} (your primary argumentation target):\n"
    "{cross_pollination_extract}\n\n"
    "Background transcript so far (secondary context only):\n\n{transcript}\n\n"
    "You must address at least one specific claim from the cross-pollination extract. Name the advisor "
    "you are rebutting or conceding to. Do not rebut your own claims; choose a claim made by another advisor.\n\n"
    "Target response length: 250 words maximum. Follow this exact structure:\n"
    "- Position/Update (~100 words): State your current position or how it shifted since the last round.\n"
    "- Rebuttal (~100 words): Pick the single strongest peer argument and argue against it specifically. "
    "Name the advisor you're rebutting.\n"
    "- Consensus Signal (~50 words): State your CONSENSUS_SCORE (1-5) and explain it in one sentence.\n\n"
    "If you exceed 250 words, the response may be flagged with a warning. Do not skip the rebuttal."
    "{consensus_tag}"
)

# Hebrew variant of FOLLOWUP - pre-translated headings prevent the model
# from emitting "רבטל" (transliteration of Rebuttal) or "Rebuttal" verbatim.
ADVISOR_FOLLOWUP_PROMPT_HEBREW = (
    "{search_context_block}"
    "You are participating in a structured debate as an advisor.\n"
    "You MUST respond entirely in Hebrew. Every section heading below must "
    "appear in your output exactly as written in Hebrew - do NOT translate "
    "the headings back to English or transliterate them. In particular: "
    "the rebuttal section is titled \"## הפרכה\". Do NOT write \"רבטל\", "
    "\"Rebuttal\", or any other variant.\n\n"
    "The question being debated:\n{question}\n\n"
    "This is Round {round_number}. You are responding to the debate as it has evolved, "
    "not re-answering the original question from scratch.\n\n"
    "Cross-pollination extract from Round {previous_round_number} (your primary argumentation target):\n"
    "{cross_pollination_extract}\n\n"
    "Background transcript so far (secondary context only):\n\n{transcript}\n\n"
    "You must address at least one specific claim from the cross-pollination extract. "
    "Name the advisor you are rebutting or conceding to (use the Hebrew name as it "
    "appears in the transcript). Do not rebut your own claims.\n\n"
    "Target response length: 250 words maximum. Use EXACTLY this Hebrew structure "
    "(markdown headings):\n"
    "## עמדה / עדכון\n"
    "(~100 מילים) הצג את עמדתך הנוכחית או כיצד היא השתנתה מהסבב הקודם.\n\n"
    "## הפרכה\n"
    "(~100 מילים) בחר את הטיעון החזק ביותר של עמית והפרך אותו במפורש. "
    "ציין את שם היועץ שאתה מפריך (בעברית).\n\n"
    "## אות הסכמה\n"
    "(~50 מילים) הצג את CONSENSUS_SCORE שלך (1-5) והסבר אותו במשפט אחד.\n\n"
    "אם תחרוג מ-250 מילים, התגובה עלולה להיות מסומנת באזהרה. אל תדלג על ההפרכה."
    "{consensus_tag}"
)

ADVISOR_CROSS_POLLINATION_PROMPT = (
    "You are preparing a cross-pollination extract for a structured advisor debate.\n\n"
    "Original question:\n{question}\n\n"
    "Round {round_number} transcript:\n{round_transcript}\n\n"
    "Return a brief structured extract. For each advisor, include:\n"
    "- Overall position: one line\n"
    "- Strongest claims: 2-3 bullets containing reasoned points, not vague assertions\n\n"
    "Keep it lightweight. Do not write essays. Use the advisor names from the transcript."
)

# Hebrew variant of CROSS_POLLINATION - the extract becomes context for
# the next round's followup prompt, so it must be in Hebrew too. Otherwise
# the followup model would see English bullets and tend to copy that style.
ADVISOR_CROSS_POLLINATION_PROMPT_HEBREW = (
    "You are preparing a cross-pollination extract for a structured advisor debate.\n"
    "You MUST respond entirely in Hebrew. All labels and bullets below must "
    "appear in your output in Hebrew exactly as written.\n\n"
    "Original question:\n{question}\n\n"
    "Round {round_number} transcript:\n{round_transcript}\n\n"
    "Return a brief structured extract. For each advisor, include:\n"
    "- עמדה כללית: שורה אחת\n"
    "- טענות חזקות: 2-3 תבליטים עם נקודות מנומקות, לא טענות מעורפלות\n\n"
    "שמור על תמציתיות. אל תכתוב מסות. השתמש בשמות היועצים כפי שהם מופיעים "
    "בטרנסקריפט (בעברית)."
)

ADVISOR_VERDICT_PROMPT = (
    "You are a neutral analyst reviewing a structured debate between advisors.\n\n"
    "The original question:\n{question}\n\n"
    "Debate arc signal:\n{debate_arc}\n\n"
    "Full debate transcript:\n{transcript}\n\n"
    "Produce a structured verdict in the following exact format. Use markdown formatting.\n\n"
    "## Summary\n"
    "2-3 sentences capturing the key insight from this debate.\n\n"
    "## Consensus Points\n"
    "Bulleted list of points where all advisors agreed.\n\n"
    "## Disagreements\n"
    "For each disagreement, create a row with: the point of contention, each side's position, "
    "and which argument had stronger evidence. Use a markdown table with columns: "
    "Point | Position A | Position B | Stronger Argument.\n\n"
    "## Verdict\n"
    "State which overall position was strongest and why, naming the advisor(s) who made "
    "the most compelling case. If the debate reached consensus, say so.\n\n"
    "## Recommended Next Steps\n"
    "3-5 concrete, actionable next steps based on the debate outcome.\n\n"
    "## Open Uncertainties\n"
    "Bulleted list of questions that remain unresolved after the debate."
)

# Hebrew-localized verdict prompt. The structural instructions stay in
# English (per project convention - models follow English instructions
# more reliably), but every heading and table column header is provided
# in Hebrew so the model emits them verbatim. The model is also instructed
# to respond entirely in Hebrew.
ADVISOR_VERDICT_PROMPT_HEBREW = (
    "You are a neutral analyst reviewing a structured debate between advisors.\n"
    "You MUST respond entirely in Hebrew. Every section heading, table column "
    "header, and cell value below must appear in your output exactly as written "
    "in Hebrew - do NOT translate them back to English.\n\n"
    "The original question:\n{question}\n\n"
    "Debate arc signal:\n{debate_arc}\n\n"
    "Full debate transcript:\n{transcript}\n\n"
    "Produce a structured verdict in the following EXACT format and EXACT "
    "Hebrew headings. Use markdown formatting.\n\n"
    "## סיכום\n"
    "2-3 משפטים בעברית הלוכדים את התובנה המרכזית מהדיון.\n\n"
    "## נקודות הסכמה\n"
    "רשימת תבליטים בעברית של נקודות שכל היועצים הסכימו עליהן.\n\n"
    "## חילוקי דעות\n"
    "לכל מחלוקת, צור שורה עם: נקודת המחלוקת, עמדת כל צד, ואיזה טיעון "
    "הציג ראיות חזקות יותר. השתמש בטבלת markdown עם בדיוק העמודות הבאות "
    "(הכותרות חייבות להיות בעברית): "
    "נושא | עמדה א | עמדה ב | הטיעון החזק יותר.\n\n"
    "## פסיקה\n"
    "ציין איזו עמדה הייתה חזקה ביותר ומדוע, תוך ציון היועץ או היועצים שהציגו "
    "את הטיעון המשכנע ביותר. אם הדיון הגיע להסכמה, ציין זאת.\n\n"
    "## צעדים הבאים מומלצים\n"
    "3-5 צעדים מעשיים וקונקרטיים בעברית על בסיס תוצאת הדיון.\n\n"
    "## אי-ודאויות פתוחות\n"
    "רשימת תבליטים בעברית של שאלות שנשארו לא פתורות בתום הדיון."
)

ADVISOR_TIEBREAKER_PROMPT = (
    "You are a neutral tiebreaker called in because the advisors could not reach agreement.\n\n"
    "The original question:\n{question}\n\n"
    "Full debate transcript:\n{transcript}\n\n"
    "The advisors' positions are evenly split. Your job is to:\n"
    "1. Identify the strongest arguments from each side\n"
    "2. Weigh the evidence and reasoning\n"
    "3. Deliver a clear decision - which position should prevail and why\n"
    "4. If appropriate, propose a synthesis that takes the best from both sides\n\n"
    "Be decisive. Do not equivocate."
)

# Hebrew variant of TIEBREAKER - instructions stay structured in English,
# but the model is told to emit Hebrew prose, and any internal headings it
# chooses to add should be in Hebrew.
ADVISOR_TIEBREAKER_PROMPT_HEBREW = (
    "You are a neutral tiebreaker called in because the advisors could not reach agreement.\n"
    "You MUST respond entirely in Hebrew. If you use any section headings or "
    "bullet labels, they must be in Hebrew (e.g. \"## הכרעה\", \"## נימוקים\").\n\n"
    "The original question:\n{question}\n\n"
    "Full debate transcript:\n{transcript}\n\n"
    "The advisors' positions are evenly split. Your job is to:\n"
    "1. Identify the strongest arguments from each side (refer to advisors by "
    "   their Hebrew names as they appear in the transcript)\n"
    "2. Weigh the evidence and reasoning\n"
    "3. Deliver a clear decision - which position should prevail and why\n"
    "4. If appropriate, propose a synthesis that takes the best from both sides\n\n"
    "Be decisive. Do not equivocate. Respond in Hebrew only."
)
