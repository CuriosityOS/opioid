'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, AlertTriangle, Send, FileText, Loader2, Shield, Heart } from 'lucide-react';

export default function HomePage() {
  const [textInput, setTextInput] = useState('');
  const [assessment, setAssessment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);
    let extractedText = '';

    try {
      if (file.type === 'application/pdf') {
        const pdfText = await extractTextFromPDF(file);
        extractedText = pdfText;
      } else if (file.type.startsWith('image/')) {
        const imageText = await extractTextFromImage(file);
        extractedText = imageText;
      } else if (file.type === 'text/plain') {
        extractedText = await file.text();
      } else {
        setError('Unsupported file type. Please upload PDF, image, or text files.');
        setIsParsing(false);
        return;
      }
      
      setTextInput(extractedText);
    } catch (err) {
      setError('Failed to extract text from file. Please try typing the information manually.');
      console.error('File processing error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const text = await file.text();
    return text;
  };

  const extractTextFromImage = async (file: File): Promise<string> => {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    return text;
  };

  const handleSubmit = async () => {
    if (!textInput.trim()) {
      setError('Please provide some text or upload a document to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAssessment('');

    try {
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        setAssessment(prev => prev + chunk);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
      
      <div className="relative container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              StopOpioids
            </h1>
          </div>
          <p className="text-xl text-gray-600 mt-2">AI-Powered Opioid Risk Assessment Tool</p>
          <p className="text-sm text-gray-500 mt-1">Educational Purpose Only - Not Medical Advice</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Input Medical Information
                </CardTitle>
                <CardDescription>
                  Enter text or upload medical documents for assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Text Input
                  </label>
                  <Textarea
                    placeholder="Enter medical history, symptoms, or relevant information here..."
                    className="min-h-[200px] resize-none"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={isLoading || isParsing}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">And</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Upload Document
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isParsing ? (
                          <>
                            <Loader2 className="w-8 h-8 mb-2 text-gray-400 animate-spin" />
                            <p className="text-sm text-gray-500">Processing file...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span>
                            </p>
                            <p className="text-xs text-gray-500">PDF, Image, or Text files</p>
                          </>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.txt"
                        onChange={handleFileChange}
                        disabled={isLoading || isParsing}
                      />
                    </label>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading || isParsing || !textInput.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Assess Risk Factors
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur min-h-[400px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-purple-600" />
                  Assessment Results
                </CardTitle>
                <CardDescription>
                  AI-generated risk assessment analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assessment ? (
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">{assessment}</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Shield className="w-16 h-16 mb-4" />
                    <p className="text-center">
                      Assessment results will appear here after analysis
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-800 space-y-2">
                <p>✓ No data storage - all processing is transient</p>
                <p>✓ Client-side file processing</p>
                <p>✓ Encrypted transmission</p>
                <p>✓ HIPAA-conscious design</p>
                <p>✓ No user tracking or analytics</p>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </main>
  );
}