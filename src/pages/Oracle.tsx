import { TokenQueryForm } from '@/components/TokenQueryForm';
import { PriceDisplay } from '@/components/PriceDisplay';
import { FullHistoryScheduler } from '@/components/FullHistoryScheduler';
import { Coins, TrendingUp, Database } from 'lucide-react';

export default function Oracle() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-success/10" />
        <div className="relative container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-primary/20 rounded-2xl backdrop-blur-sm">
                <Coins className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-success bg-clip-text text-transparent">
                Token Price Oracle
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced historical token price fetching with intelligent interpolation engine
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Historical Prices
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-success" />
                Smart Caching
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-info" />
                Multi-Network
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column */}
          <div className="space-y-8">
            <TokenQueryForm />
            <FullHistoryScheduler />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <PriceDisplay />
            
            {/* Info Card */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 text-lg">How it works</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Cache First:</strong> We check our local cache for existing price data
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-info rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">API Fallback:</strong> If not cached, we fetch from Alchemy API
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">Smart Interpolation:</strong> For missing data points, we use advanced interpolation algorithms
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}