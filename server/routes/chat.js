import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { requestChatCompletion, streamChatCompletion } from '../services/openRouterService.js';
import { describeImage, summarizePdfText, textToSpeech, transcribeAudio } from '../services/huggingFaceService.js';
import { saveChat } from '../services/store.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

export const chatRouter = express.Router();

chatRouter.post('/', upload.array('files', 4), async (req, res) => {
  try {
    const { message = '', model, guestMode = 'true', outputAudio = 'false' } = req.body;
    const isGuest = guestMode === 'true' || guestMode === true;
    const wantsAudio = outputAudio === 'true' || outputAudio === true;

    if (!message && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ error: 'Please provide a message or an attachment.' });
    }

    const contextParts = [];

    for (const file of req.files || []) {
      if (file.mimetype.startsWith('image/')) {
        const caption = await describeImage(file.buffer);
        contextParts.push(`Image (${file.originalname}) description: ${caption}`);
      } else if (file.mimetype.startsWith('audio/')) {
        const transcript = await transcribeAudio(file.buffer);
        if (transcript) contextParts.push(`Audio (${file.originalname}) transcript: ${transcript}`);
      } else if (file.mimetype === 'application/pdf') {
        const parsed = await pdfParse(file.buffer);
        const summary = await summarizePdfText(parsed.text || '');
        contextParts.push(`PDF (${file.originalname}) summary: ${summary}`);
      } else {
        contextParts.push(`Attachment ${file.originalname} could not be parsed.`);
      }
    }

    const messages = [
      {
        role: 'system',
        content: 'You are AIRA-AI, a precise and helpful multimodal assistant. Use attachment context when relevant.'
      },
      {
        role: 'user',
        content: `${message}\n\nAdditional multimodal context:\n${contextParts.join('\n')}`.trim()
      }
    ];

    if (req.query.stream === '1') {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      let finalText = '';
      await streamChatCompletion({
        model,
        messages,
        onDelta: (delta) => {
          finalText += delta;
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }
      });
      res.write('data: [DONE]\n\n');
      res.end();

      if (!isGuest && req.session.user?.verified) {
        saveChat(req.session.user.email, { message, response: finalText, createdAt: new Date().toISOString() });
      }
      return;
    }

    const responseText = await requestChatCompletion({ model, messages });
    let audioBase64 = null;

    if (wantsAudio) {
      const audioBuffer = await textToSpeech(responseText);
      audioBase64 = audioBuffer.toString('base64');
    }

    if (!isGuest && req.session.user?.verified) {
      saveChat(req.session.user.email, {
        message,
        response: responseText,
        createdAt: new Date().toISOString()
      });
    }

    res.json({ response: responseText, audioBase64 });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unexpected server error.' });
  }
});
