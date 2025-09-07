import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import cocadaLogo from 'figma:asset/d1d7a9708f323056e182b5720818da8b8d3d2c30.png';

export function Header() {
  return (
    <header className="w-full px-6 py-4" style={{ backgroundColor: '#A8D5D0' }}>
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-24 h-24 flex items-center justify-center">
            <img 
              src={cocadaLogo}
              alt="Cocada Logo"
              className="w-24 h-24 object-contain"
            />
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Process Simulator */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">UserId</span>
            <Select defaultValue="default">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="user1">User 1</SelectItem>
                <SelectItem value="user2">User 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        <span className="text-sm text-muted-foreground">Process Simulator</span>
          {/* Input and Button */}
          <div className="flex items-center gap-2">
            <Input 
              placeholder="OrderId" 
              className="w-32"
            />
            <Button variant="outline" size="sm">
              Process to Filled
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}