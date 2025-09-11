"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Phone,
  Globe,
  MessageSquare,
  Zap,
} from "lucide-react";

interface DebugInfo {
  success: boolean;
  debug?: {
    account: {
      sid: string;
      friendlyName: string;
      status: string;
    };
    configuredPhoneNumber: string;
    availablePhoneNumbers: Array<{
      phoneNumber: string;
      friendlyName: string;
      capabilities: any;
    }>;
    recommendations: string[];
  };
  config?: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  error?: string;
  details?: string;
}

export default function SetupGuide() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const fetchDebugInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/debug");
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error("Error fetching debug info:", error);
      setDebugInfo({
        success: false,
        error: "Failed to fetch debug information",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showGuide) {
      fetchDebugInfo();
    }
  }, [showGuide]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogTrigger asChild>
          <Button className="rounded-full shadow-lg h-12 px-6" size="lg">
            <Settings className="h-4 w-4 mr-2" />
            Setup Help
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-5 w-5" />
              Twilio WhatsApp Setup Guide
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Debug Information */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Configuration Status
                  </CardTitle>
                  <Button
                    onClick={fetchDebugInfo}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        isLoading ? "animate-spin" : ""
                      }`}
                    />
                    {isLoading ? "Checking..." : "Refresh"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {debugInfo && (
                  <>
                    {debugInfo.success ? (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <div className="font-medium">
                              Twilio connection successful
                            </div>
                            <div className="text-sm space-y-1">
                              <div>
                                <strong>Account:</strong>{" "}
                                {debugInfo.debug?.account.friendlyName} (
                                {debugInfo.debug?.account.status})
                              </div>
                              <div>
                                <strong>Configured Phone:</strong>{" "}
                                {debugInfo.debug?.configuredPhoneNumber}
                              </div>
                              {debugInfo.debug?.availablePhoneNumbers.length >
                                0 && (
                                <div>
                                  <strong>Available Numbers:</strong>
                                  <ul className="list-disc ml-4 mt-1">
                                    {debugInfo.debug.availablePhoneNumbers.map(
                                      (phone, idx) => (
                                        <li key={idx}>
                                          {phone.phoneNumber} -{" "}
                                          {phone.friendlyName}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <div className="font-medium">{debugInfo.error}</div>
                            {debugInfo.details && (
                              <div className="text-sm">{debugInfo.details}</div>
                            )}
                            {debugInfo.config && (
                              <div className="text-sm space-y-1">
                                <div>
                                  Account SID: {debugInfo.config.accountSid}
                                </div>
                                <div>
                                  Auth Token: {debugInfo.config.authToken}
                                </div>
                                <div>
                                  Phone Number: {debugInfo.config.phoneNumber}
                                </div>
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Setup Instructions */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">📋 Setup Checklist</h3>
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                  <h4 className="font-medium text-yellow-800">
                    1. WhatsApp Sandbox Setup
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Go to{" "}
                    <a
                      href="https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Twilio Console → Messaging → Try WhatsApp
                    </a>
                  </p>
                  <p className="text-sm text-yellow-700">
                    Send "join {`<sandbox-code>`}" to +1 (415) 523-8886 from
                    your WhatsApp
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                  <h4 className="font-medium text-blue-800">
                    2. Environment Variables
                  </h4>
                  <div className="text-sm text-blue-700 mt-1 space-y-1">
                    <div>
                      Update your{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        .env.local
                      </code>{" "}
                      file:
                    </div>
                    <pre className="bg-blue-100 p-2 rounded text-xs overflow-x-auto">
                      {`TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=whatsapp:+14155238886`}
                    </pre>
                    <div className="text-xs">
                      <strong>Note:</strong> For sandbox, use{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        whatsapp:+14155238886
                      </code>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 p-3 rounded">
                  <h4 className="font-medium text-green-800">
                    3. Webhook Configuration
                  </h4>
                  <div className="text-sm text-green-700 mt-1 space-y-1">
                    <div>
                      1. Install and run ngrok:{" "}
                      <code className="bg-green-100 px-1 rounded">
                        ngrok http 3000
                      </code>
                    </div>
                    <div>
                      2. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
                    </div>
                    <div>
                      3. Set webhook URL in Twilio Console to:{" "}
                      <code className="bg-green-100 px-1 rounded">
                        https://abc123.ngrok.io/api/webhook
                      </code>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                  <h4 className="font-medium text-purple-800">4. Testing</h4>
                  <div className="text-sm text-purple-700 mt-1">
                    <div>
                      1. Restart your Next.js app:{" "}
                      <code className="bg-purple-100 px-1 rounded">
                        npm run dev
                      </code>
                    </div>
                    <div>2. Send a WhatsApp message to the sandbox number</div>
                    <div>3. Check if message appears in this interface</div>
                    <div>4. Try sending a message from this interface</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Issues */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                🚨 Common Issues & Solutions
              </h3>
              <div className="space-y-2 text-sm">
                <div className="border-l-4 border-red-400 pl-3">
                  <strong>
                    "Channel with specified From address not found"
                  </strong>
                  <div>
                    → Wrong phone number format. Use{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      whatsapp:+14155238886
                    </code>{" "}
                    for sandbox
                  </div>
                </div>
                <div className="border-l-4 border-yellow-400 pl-3">
                  <strong>"Webhook not receiving messages"</strong>
                  <div>
                    → Check ngrok is running and webhook URL is correct in
                    Twilio Console
                  </div>
                </div>
                <div className="border-l-4 border-blue-400 pl-3">
                  <strong>"Authentication error"</strong>
                  <div>→ Verify Account SID and Auth Token in .env.local</div>
                </div>
              </div>
            </div>

            {debugInfo?.debug?.recommendations && (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  💡 Recommendations
                </h3>
                <ul className="list-disc ml-4 text-sm space-y-1">
                  {debugInfo.debug.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
