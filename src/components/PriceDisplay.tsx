import { TrendingUp, AlertCircle, Clock, Database, Zap, Cpu } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOracleStore } from '@/stores/oracleStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const sourceConfig = {
  cache: {
    label: 'Cache',
    icon: Database,
    className: 'price-badge-cache',
    description: 'Retrieved from local cache'
  },
  alchemy: {
    label: 'Alchemy API',
    icon: Zap,
    className: 'price-badge-api',
    description: 'Fetched from Alchemy API'
  },
  interpolated: {
    label: 'Interpolated',
    icon: Cpu,
    className: 'price-badge-interpolated',
    description: 'Calculated via interpolation'
  }
};

export function PriceDisplay() {
  const { priceResult } = useOracleStore();

  if (priceResult.error) {
    return (
      <Card className="glass-card border-destructive/50">
        <CardContent className="pt-6">
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">
              {priceResult.error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!priceResult.price && !priceResult.loading) {
    return (
      <Card className="glass-card opacity-50">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-muted-foreground">
            No price data available
          </CardTitle>
          <CardDescription>
            Submit a query to fetch token price data
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const sourceInfo = sourceConfig[priceResult.source];
  const SourceIcon = sourceInfo.icon;

  return (
    <Card className="glass-card glow-border">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Price Result
          </CardTitle>
          {priceResult.price && (
            <Badge className={cn("price-badge", sourceInfo.className)}>
              <SourceIcon className="w-3 h-3 mr-1" />
              {sourceInfo.label}
            </Badge>
          )}
        </div>
        <CardDescription className="text-muted-foreground">
          Historical token price data
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {priceResult.loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Fetching price data...</p>
            </div>
          </div>
        ) : priceResult.price ? (
          <>
            {/* Price Display */}
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-foreground">
                ${priceResult.price.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 8
                })}
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                USD Price
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-center gap-2 p-4 bg-muted/30 rounded-lg">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {format(new Date(parseInt(priceResult.timestamp) * 1000), 'PPpp')}
              </span>
            </div>

            {/* Source Information */}
            <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <SourceIcon className="w-5 h-5 text-primary" />
                <span className="font-medium">Data Source</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {sourceInfo.description}
              </p>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}