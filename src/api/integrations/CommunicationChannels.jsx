import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

export default function CommunicationChannels() {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle className={isRTL ? 'text-right' : ''}>
          <span className="inline-flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {isRTL ? 'قنوات الاتصال' : 'Communication Channels'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={isRTL ? 'text-right' : ''}>
          <p className="text-gray-600">
            {isRTL ? 'هذه مكونات مؤقتة للعرض.' : 'Placeholder component for preview.'}
          </p>
          <div className={`mt-3 ${isRTL ? 'flex-row-reverse' : ''} flex gap-2`}>
            <Badge variant="outline">Email</Badge>
            <Badge variant="outline">SMS</Badge>
            <Badge variant="outline">Teams</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}