# Audit report template (client-facing)

Two audiences, two documents from one run:
1. This template: the working report (Hebrew or English, for the CTO).
2. The paid deliverable adds: PDF export, exec one-pager first, walkthrough deck.

Free (repo-only) runs use sections 1-6 and stop at the bridge.
Paid (live) runs use all sections.

---

## Section 1: Executive page (one page, plain language, money and dates)

# ביקורת תשתית: <שם החברה>
תאריך: <YYYY-MM-DD> · היקף: <repo / חשבונות ענן> · מבצע: roqy.io

## שלוש הסיכונים המרכזיים

| # | הסיכון | מה קורה אם לא מטפלים | עלות התיקון |
|---|---|---|---|
| 1 | <במילים פשוטות, משפט אחד> | <השרשרת: איך נכנסים, מה קורה, תקדים אמיתי> | <שעות/ימים> |
| 2 | ... | ... | ... |
| 3 | ... | ... | ... |

## מה כבר טוב
<2-3 שורות: מה הם עשו נכון. אמון נבנה גם בחיוב.>

## הציון
<0-100, עם הסבר שורה אחת: מה מוריד ומה מרים. הציון חוזר כל חודש.>

---

## Section 2: Findings (technical, per priority)

### P0: לתקן השבוע
#### <ID> <כותרת> (CONFIRMED, P0)
- קטגוריה: <IAM | Terraform | Secrets | CI/CD | Monitoring | Backups | Cost | Review | Visibility>
- ראיה: <קובץ:שורה או פקודה + פלט מצונזר>
- איך זה ניזוק: <שרשרת תקיפה ספציפית + תקדים אמיתי>
- If it stays: <הסיכון השיורי: מה זה הופך עם הזמן, מה הוא פותח, כמה הוא עולה חודשית, איזה שער הוא נופל בו>
- התיקון הקטן ביותר: <שינוי אחד, פקודה מדויקת>
- מאמץ: <שעות/ימים> · מתאים כמשימה ראשונה ל-DevOps hire: <כן/לא>

### P1: לתקן החודש
(אותו פורמט)

### P2: היגיינה
(אותו פורמט, משפט סיכון אחד בלבד — אין הגזמה על קטנים)

---

## Section 3: Needs validation (הגשר — רק בריצה החינמית זה הסוף)

| ID | מה לא ראינו | מי יכול לבדוק | איך |
|---|---|---|---|

סיום הריצה החינמית:
> רוצים שנאמת את הסעיף הזה מול הסביבה החיה? 15 דקות שיחה.
> האימות נעשה עם הרשאת קריאה בלבד, תוקף 7 ימים, ולוג מלא של כל פקודה שרצה — שאתם מקבלים.

---

## Section 4: Rejected candidates (רק בריצה בתשלום — ערך נסתר)

| ID | הטענה | למה נדחה |
|---|---|---|
<כל ממצא שנבדק ונפסל. זה שעות עבודה שהלקוח לא מבזבז.>

---

## Section 5: Questions for the team (שאלות הראיון)

- מי מקבל פייג' כשהפרודקשן נופל, ואיך?
- מתי אוחזר גיבוי בפעם האחרונה, וכמה זמן קח?
- מי יש owner/admin בחשבון הענן היום, והאם כל אחד עדיין צריך?
- בתקרית האחרונה, כמה זמן לקח למצוא מה השתנה?

---

## Section 6: Roadmap 90 יום (רק בריצה בתשלום)

| שבועות | מה | מי | למה |
|---|---|---|---|
| 1 | כל ה-P0 | אנחנו (חודש ראשון של retainer) | סגירת הסיכונים הגדולים |
| 2-3 | P1 שהצוות יכול לבד | הצוות שלהם, אנחנו מלווים | העברת יכולת |
| 4 | P1 שדורש תשתית | אנחנו | ... |
| חודש 2-3 | היגיינה + ציון חודשי | משותף | מדד מתמשך |

> אפשר לקזז את עלות האודיט מהחודש הראשון של ה-retainer.

---

## Rules for whoever writes the report

1. Executive page: plain language, no jargon, money and dates only. If the CTO
   does not understand sentence one, the report failed.
2. Every P0/P1 carries: attack chain + If it stays + smallest fix + effort.
   No fear inflation on P2 (one sentence max).
3. Every finding cites evidence (file:line or command + redacted output).
   Never a secret value; 4 chars max.
4. Rejected candidates are listed. An audit that only confirms is a scanner.
5. The score: 0-100, weighted P0 heavy. Same formula every month, so the
   trend is real.
6. Hebrew for Israeli clients, English otherwise. Same structure.
