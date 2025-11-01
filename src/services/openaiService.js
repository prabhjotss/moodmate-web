export async function analyzeTextMood(text, { mock = true } = {}) {
const t = text.toLowerCase()
if (t.includes('sad') || t.includes('depressed') || t.includes('down')) {
return { mood: 'sad', suggestion: 'Try a breathing exercise: 4-4-4.' }
}
if (t.includes('happy') || t.includes('great') || t.includes('excited')) {
return { mood: 'happy', suggestion: 'Keep it up — maybe celebrate with a short dance!' }
}
return { mood: 'neutral', suggestion: 'Try a 5-min walk or stretch.' }
}


// Production / non-mock flow: calls OpenAI (WARNING: API key in env on frontend is exposed)
const key = import.meta.env.VITE_OPENAI_KEY
if (!key) throw new Error('OpenAI API key missing. Set VITE_OPENAI_KEY in .env')


const prompt = `You are a concise mood classifier. Read the user's text and reply JSON with keys: mood (one word), suggestion (short). Text:\n'''${text}'''`


const body = {
model: 'gpt-4o-mini',
messages: [{ role: 'user', content: prompt }],
temperature: 0.2
}


const resp = await fetch('https://api.openai.com/v1/chat/completions', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${key}`
},
body: JSON.stringify(body)
})


if (!resp.ok) {
const txt = await resp.text()
throw new Error(`OpenAI error: ${txt}`)
}


const data = await resp.json()
const reply = data.choices?.[0]?.message?.content || ''


// Try to parse JSON from reply; otherwise fallback to plain text.
try {
const parsed = JSON.parse(reply)
return { mood: parsed.mood || 'neutral', suggestion: parsed.suggestion || '' }
} catch (e) {
// fallback: simple extraction
return { mood: 'neutral', suggestion: reply }
}
