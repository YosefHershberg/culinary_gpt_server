import OpenAI from 'openai';
import env from '../utils/env';

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY
})

export default openai;