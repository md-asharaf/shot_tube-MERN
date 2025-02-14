import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const VideoDetails = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [madeForKids, setMadeForKids] = useState(false);

  return (
    <Card className="max-w-3xl mx-auto p-6 rounded-lg">
      <CardContent className="space-y-4">
        <h2 className="text-xl font-bold">Video Details</h2>

        <div className="space-y-2">
          <Label htmlFor="title">Title (required)</Label>
          <Input
            id="title"
            placeholder="Enter video title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Tell viewers about your video"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Visibility</Label>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger>
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="unlisted">Unlisted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="made-for-kids"
            checked={madeForKids}
            onCheckedChange={(checked) => setMadeForKids(!!checked)}
          />
          <Label htmlFor="made-for-kids">Yes, it's 'Made for Kids'</Label>
        </div>

        <Button className="w-full" disabled={!title.trim()}>
          Save
        </Button>
      </CardContent>
    </Card>
  );
};

export default VideoDetails;
