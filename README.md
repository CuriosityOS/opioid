# StopOpioids

A modern, privacy-first web application for educational opioid addiction risk assessment using AI.

## ⚠️ Important Medical Disclaimer

This tool provides educational assessments only and does NOT constitute medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical concerns. No doctor-patient relationship is established through use of this tool.

## Features

- **Privacy-First Architecture**: Zero data retention, client-side file processing
- **AI-Powered Analysis**: Uses Gemini 2.5 Flash via OpenRouter for risk assessment
- **Multi-Format Support**: Accepts text input, PDFs, and images (with OCR)
- **HIPAA-Conscious Design**: Transient data processing with no storage
- **Modern UI**: Beautiful, accessible interface built with Next.js and Tailwind CSS
- **Real-time Streaming**: Instant AI responses with streaming support

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **AI Integration**: OpenRouter API (Gemini 2.5 Flash)
- **File Processing**: Client-side PDF extraction and OCR
- **Language**: TypeScript
- **Runtime**: Edge Runtime for optimal performance

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Security & Privacy

- **No Data Storage**: All processing is transient
- **Client-Side Processing**: Files are processed in the browser
- **Encrypted Transmission**: HTTPS for all API calls
- **No Tracking**: No analytics or user tracking

## Legal Compliance

This application is designed with the following considerations:
- Medical disclaimers prominently displayed
- Educational purpose clearly stated
- No medical advice or diagnosis claims
- Privacy-first architecture
- HIPAA-conscious design principles

## Support Resources

If you or someone you know is struggling with opioid addiction:
**National Helpline**: 1-800-662-HELP (4357) - Available 24/7

## License

This project is for educational purposes only.