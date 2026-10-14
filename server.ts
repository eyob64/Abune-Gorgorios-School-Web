import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Endpoint to generate professional faculty photo or avatar
  app.post('/api/generate-faculty-photo', async (req, res) => {
    try {
      const {
        name = 'Faculty Member',
        title = 'Educator',
        bio = '',
        style = 'academic',
        gender = 'neutral',
        prompt = '',
      } = req.body || {};

      if (ai) {
        try {
          const systemInstruction = `You are an expert graphic designer and SVG illustrator specializing in professional educational portraits, faculty avatars, and academic badges.
Create a visually stunning, polished, professional SVG avatar for a faculty member.
Requirements:
1. Output MUST be ONLY valid, self-contained SVG XML. Do not include markdown formatting or backticks (\`\`\`xml or \`\`\`).
2. viewBox="0 0 400 400" with width="100%" height="100%".
3. Aesthetic style: Clean modern vector portrait, elegant smooth shapes, subtle gradients, dignified posture.
4. Color scheme: School colors (deep navy #1e3a8a, royal blue #2563eb, warm gold #d97706, clean slate #f8fafc).
5. Must include:
   - Soft circular or rounded background badge with gradient.
   - Professional educator representation (blazer, suit, collar, academic attire, or Ethiopian formal Netela accents if requested).
   - Warm, welcoming, respectful facial composition.
   - Clean details appropriate for an official faculty directory.`;

          const userPrompt = `Generate a professional SVG avatar for:
Name: ${name}
Title / Subject: ${title}
Bio details: ${bio || 'Dedicated educator at Abune Gorgorios School'}
Style preference: ${style} (academic portrait, modern vector, executive, cultural, or STEM)
Gender preference: ${gender}
Additional user direction: ${prompt || 'Professional, friendly, dignified faculty member profile picture'}`;

          const generatePromise = ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userPrompt,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API timeout')), 6000)
          );

          const response = await Promise.race([generatePromise, timeoutPromise]);

          let rawSvg = response.text?.trim() || '';
          // Clean up any markdown code block fences if present
          rawSvg = rawSvg.replace(/^```(xml|svg)?/i, '').replace(/```$/i, '').trim();

          if (rawSvg.startsWith('<svg') && rawSvg.endsWith('</svg>')) {
            const base64Svg = Buffer.from(rawSvg).toString('base64');
            const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;
            return res.json({
              success: true,
              photoUrl: dataUrl,
              format: 'svg',
              source: 'gemini',
            });
          }
        } catch (geminiError: any) {
          console.warn('Gemini SVG generation error, using fallback:', geminiError?.message);
        }
      }

      // High-quality fallback SVG generator
      const initials = (name || 'AG')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p: string) => p[0].toUpperCase())
        .join('');

      const gradients = [
        { start: '#1e3a8a', end: '#3b82f6', text: '#ffffff', accent: '#f59e0b' },
        { start: '#065f46', end: '#10b981', text: '#ffffff', accent: '#34d399' },
        { start: '#4c1d95', end: '#8b5cf6', text: '#ffffff', accent: '#fbbf24' },
        { start: '#831843', end: '#ec4899', text: '#ffffff', accent: '#f43f5e' },
      ];
      const charCode = (name || 'Faculty').charCodeAt(0) || 65;
      const theme = gradients[charCode % gradients.length];

      const fallbackSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.start}" />
      <stop offset="100%" stop-color="${theme.end}" />
    </linearGradient>
    <linearGradient id="avatarShine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bgGrad)" />
  <circle cx="200" cy="200" r="175" fill="none" stroke="${theme.accent}" stroke-width="4" stroke-opacity="0.6" stroke-dasharray="10 6" />
  <circle cx="200" cy="200" r="160" fill="url(#avatarShine)" />
  <!-- Silhouette head & shoulders -->
  <circle cx="200" cy="150" r="58" fill="#ffffff" fill-opacity="0.9" />
  <path d="M110 320 C110 245, 150 225, 200 225 C250 225, 290 245, 290 320 Z" fill="#ffffff" fill-opacity="0.9" />
  <!-- Formal tie/collar detail -->
  <path d="M190 225 L200 250 L210 225 Z" fill="${theme.start}" />
  <polygon points="196,252 204,252 202,295 198,295" fill="${theme.accent}" />
  <!-- Monogram Initials Tag -->
  <rect x="150" y="335" width="100" height="34" rx="17" fill="#0f172a" fill-opacity="0.8" />
  <text x="200" y="358" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="2">${initials}</text>
  <!-- Academic Badge Icon -->
  <circle cx="310" cy="90" r="28" fill="${theme.accent}" />
  <path d="M310 75 L325 83 L310 91 L295 83 Z M298 88 L298 96 C298 100 310 104 310 104 C310 104 322 100 322 96 L322 88" fill="#ffffff" />
</svg>`.trim();

      const base64Svg = Buffer.from(fallbackSvg).toString('base64');
      const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

      return res.json({
        success: true,
        photoUrl: dataUrl,
        format: 'svg',
        source: 'template',
      });
    } catch (err: any) {
      console.error('Photo generation endpoint failure:', err);
      return res.status(500).json({ error: err?.message || 'Failed to generate photo' });
    }
  });

  // Endpoint for Director-only AI Chatbot
  app.post('/api/director-ai-assistant', async (req, res) => {
    try {
      const {
        prompt,
        messages = [],
        context = {},
      } = req.body || {};

      const userMessage = prompt || (messages.length > 0 ? messages[messages.length - 1].content : 'Hello');

      const systemInstruction = `You are the executive School Management AI Assistant dedicated exclusively to the School Director of Abune Gorgorios School in Addis Ababa, Ethiopia.
Your mission is to assist the School Director in running, evaluating, and improving the school.
You provide strategic analysis, academic guidance, data summaries, draft official memos, suggest administrative decisions, and assist with curriculum, student affairs, tuition tracking, and school events.

Here is the current live school data summary:
- Enrolled Students: ${context.studentCount ?? 0}
- Faculty & Teachers: ${context.facultyCount ?? 0}
- Pending Admission Applications: ${context.pendingAdmissionsCount ?? 0}
- Total Tuition Payments Collected: ${context.totalTuitionCollected ?? '0'} ETB
- Published News & Announcements: ${context.newsCount ?? 0}
- Upcoming Calendar Events: ${context.eventCount ?? 0}
- Current Academic Year: 2025/2026
- Additional Context: ${context.notes || 'School is currently managing active registrations and academic reporting.'}

Guidelines:
1. Maintain an executive, respectful, and highly competent tone suitable for addressing a School Director.
2. Directly answer questions regarding the school's live statistics, students, tuition, staff, and events.
3. When asked to draft letters, memos, or report card remarks, provide polished, professional copy ready to publish.
4. Support both English and Amharic depending on the Director's query.
5. Keep responses concise, structured (bullet points where appropriate), and actionable.`;

      if (ai) {
        try {
          // Build chat history if available
          const formattedContents = messages.length > 0
            ? messages.map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content || '' }]
              }))
            : [{ role: 'user', parts: [{ text: userMessage }] }];

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.6,
            },
          });

          const replyText = response.text || '';
          return res.json({
            success: true,
            reply: replyText,
            source: 'gemini',
          });
        } catch (apiError: any) {
          console.warn('Gemini chat error, utilizing smart local fallback:', apiError?.message);
        }
      }

      // Intelligent context-aware fallback response when offline or key rate-limited
      let fallbackReply = `Director, here is an executive summary based on live school records:
• Enrolled Students: ${context.studentCount ?? 0} registered students
• Faculty & Staff: ${context.facultyCount ?? 0} active educators
• Admission Pipeline: ${context.pendingAdmissionsCount ?? 0} applications awaiting review
• Tuition Revenue: ${context.totalTuitionCollected ?? '0'} ETB recorded
• Academic Calendar: ${context.eventCount ?? 0} upcoming school milestones

How can I assist you further with curriculum planning, administrative memos, or student report evaluations?`;

      const lower = (userMessage || '').toLowerCase();
      if (lower.includes('tuition') || lower.includes('payment') || lower.includes('fee')) {
        fallbackReply = `Financial Status Brief for the Director:
Total tuition collected to date is ${context.totalTuitionCollected ?? '0'} ETB across recorded payment transactions. 
Recommendations:
1. Review pending bank transfer receipts in the Payments tab.
2. Ensure verified students receive their updated tuition clearance status.
3. Generate monthly billing reminders for the upcoming academic cycle.`;
      } else if (lower.includes('student') || lower.includes('enroll') || lower.includes('stat')) {
        fallbackReply = `Student Enrollment Summary:
The school currently has ${context.studentCount ?? 0} officially registered students, with ${context.pendingAdmissionsCount ?? 0} applicants in the admissions review queue.
Upon approving applications in the Admissions bureau, each student receives their official Student ID and initial credentials for the Student Portal.`;
      } else if (lower.includes('report card') || lower.includes('grade')) {
        fallbackReply = `Report Card & Academic Assessment Guide:
You can create and issue official student report cards from the Gradebook or Student directory.
The system automatically calculates the out-of-100 average across all entered subjects, computes letter grades, and records your official Director evaluation for immediate viewing in the Student Portal.`;
      }

      return res.json({
        success: true,
        reply: fallbackReply,
        source: 'local-executive-fallback',
      });
    } catch (err: any) {
      console.error('Director AI Assistant endpoint error:', err);
      return res.status(500).json({ error: err?.message || 'Internal AI assistant error' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'abune-gorgorios-api' });
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
