import { useState } from 'react';
import { Calendar, Clock, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { useOracleStore } from '@/stores/oracleStore';
import { cn } from '@/lib/utils';

export function TokenQueryForm() {
  const { formInput, setFormInput, fetchPrice, priceResult } = useOracleStore();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('12:00');

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();

  if (date) {
    const [hours, minutes] = time.split(':');
    const timestamp = new Date(date);
    timestamp.setHours(parseInt(hours), parseInt(minutes));

    setFormInput({
      timestamp: Math.floor(timestamp.getTime() / 1000).toString(),
    });

    fetchPrice();
  }
  };

  const isValidEthereumAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const isFormValid = () => {
    return (
      formInput.tokenAddress &&
      isValidEthereumAddress(formInput.tokenAddress) &&
      date &&
      time
    );
  };

  return (
    <Card className="glass-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
          Token Price Query
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Fetch historical token prices with our interpolation oracle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token Address */}
          <div className="space-y-2">
            <Label htmlFor="tokenAddress" className="text-sm font-medium">
              Token Address
            </Label>
            <div className="relative">
              <Coins className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="tokenAddress"
                placeholder="0x..."
                value={formInput.tokenAddress}
                onChange={(e) => setFormInput({ tokenAddress: e.target.value })}
                className={cn(
                  "pl-10 bg-muted/50 border-border/50 focus:border-primary transition-colors",
                  formInput.tokenAddress && !isValidEthereumAddress(formInput.tokenAddress) 
                    ? "border-destructive focus:border-destructive" 
                    : ""
                )}
              />
            </div>
            {formInput.tokenAddress && !isValidEthereumAddress(formInput.tokenAddress) && (
              <p className="text-xs text-destructive">Please enter a valid Ethereum address</p>
            )}
          </div>

          {/* Network Selector */}
          <div className="space-y-2">
            <Label htmlFor="network" className="text-sm font-medium">
              Network
            </Label>
            <Select
              value={formInput.network}
              onValueChange={(value: 'ethereum' | 'polygon') => setFormInput({ network: value })}
            >
              <SelectTrigger className="bg-muted/50 border-border/50 focus:border-primary">
                <SelectValue placeholder="Select a network" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/50">
                <SelectItem value="ethereum" className="focus:bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
                    Ethereum
                  </div>
                </SelectItem>
                <SelectItem value="polygon" className="focus:bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                    Polygon
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Picker */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-muted/50 border-border/50 hover:bg-muted",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border/50" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium">
                Time (UTC)
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid() || priceResult.loading}
            className={cn(
              "w-full relative overflow-hidden",
              "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
              "shadow-lg hover:shadow-xl transition-all duration-300",
              priceResult.loading ? "animate-pulse" : ""
            )}
          >
            {priceResult.loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Fetching Price...
              </div>
            ) : (
              "Fetch Price"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}