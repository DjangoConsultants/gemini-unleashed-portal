import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcessingLogsList } from '@/components/ProcessingLogsList';
import { LogsReportingSection } from '@/components/LogsReportingSection';
import { LogOut, FileText, Clock, User, Shield } from 'lucide-react';

// Main logs component - this is your protected dashboard
export const Logs: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Replace the Shield icon with the logo */}
              <img 
                src="/logo.png" 
                alt="Holloway Group Logo" 
                className="w-[120px] sm:w-[140px] md:w-[160px] h-auto" 
              />
              {/* Remove the text since we have the logo */}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome Back, {user?.email?.split('@')[0].charAt(0).toUpperCase() + user?.email?.split('@')[0].slice(1)}!
          </h2>
          <p className="text-muted-foreground">
            Here's your secure access to the Holloway Group log monitoring system.
          </p>
        </div>

        {/* Reporting Section */}
        <div className="mb-8">
          <LogsReportingSection />
        </div>

        {/* Processing Logs */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Processing Logs
            </h2>
            <p className="text-muted-foreground">
              View and manage your email processing logs with advanced filtering and search capabilities.
            </p>
          </div>
          <ProcessingLogsList />
        </div>
      </main>
    </div>
  );
};