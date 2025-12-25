import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Key, ExternalLink, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiKeySetupProps {
  onApiKeySet: (apiKey: string) => void;
}

export const ApiKeySetup = ({ onApiKeySet }: ApiKeySetupProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      return;
    }

    setIsValidating(true);
    
    // Simple validation - check if it looks like an Anthropic API key
    if (apiKey.startsWith('sk-ant-')) {
      try {
        await onApiKeySet(apiKey.trim());
        setIsValidating(false);
      } catch (error) {
        console.error('Error setting API key:', error);
        setIsValidating(false);
      }
    } else {
      setTimeout(() => {
        setIsValidating(false);
        // You could add error handling here
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-chat-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Setup Claude API</CardTitle>
          <CardDescription>
            Enter your Anthropic API key to start chatting with Claude 3.5 Haiku
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Your API key is stored locally in your browser and is never sent to our servers.
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Anthropic API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!apiKey.trim() || isValidating}
            >
              {isValidating ? "Validating..." : "Start Chatting"}
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Don't have an API key?
            </p>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://console.anthropic.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                Get API Key
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};