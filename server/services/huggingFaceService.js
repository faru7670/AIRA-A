import axios from 'axios';
import { env } from '../config/env.js';

const HF_API = 'https://api-inference.huggingface.co/models';

function headers(contentType = 'application/json') {
  if (!env.huggingFaceApiKey) {
    throw new Error('HUGGINGFACE_API_KEY is not configured on server.');
  }
  return {
    Authorization: `Bearer ${env.huggingFaceApiKey}`,
    'Content-Type': contentType
  };
}

export async function describeImage(imageBuffer) {
  const { data } = await axios.post(`${HF_API}/Salesforce/blip-image-captioning-large`, imageBuffer, {
    headers: headers('application/octet-stream'),
    timeout: 120000
  });
  return data?.[0]?.generated_text || 'Image received but caption unavailable.';
}

export async function transcribeAudio(audioBuffer) {
  const { data } = await axios.post(`${HF_API}/openai/whisper-large-v3`, audioBuffer, {
    headers: headers('application/octet-stream'),
    timeout: 120000
  });
  return data?.text || '';
}

export async function summarizePdfText(text) {
  const { data } = await axios.post(
    `${HF_API}/facebook/bart-large-cnn`,
    { inputs: text.slice(0, 3000) },
    { headers: headers(), timeout: 120000 }
  );
  return data?.[0]?.summary_text || '';
}

export async function textToSpeech(text) {
  const response = await axios.post(
    `${HF_API}/espnet/kan-bayashi_ljspeech_vits`,
    { inputs: text.slice(0, 500) },
    {
      headers: headers(),
      responseType: 'arraybuffer',
      timeout: 120000
    }
  );
  return Buffer.from(response.data);
}
