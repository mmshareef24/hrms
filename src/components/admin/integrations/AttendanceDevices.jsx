import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Wifi, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AttendanceDevices() {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const devices = [
    {
      name: "ZKTeco",
      models: ["K40", "K50", "iClock360", "ProFace X"],
      protocol: "MQTT / REST API",
      status: "supported"
    },
    {
      name: "Nitgen",
      models: ["eNBioAccess-T5", "NAC-5000", "Fingkey Hamster"],
      protocol: "REST API / SDK",
      status: "supported"
    },
    {
      name: "Hikvision",
      models: ["DS-K1T671M", "DS-K1T341AMF", "MinMoe Series"],
      protocol: "ISAPI / REST",
      status: "supported"
    }
  ];

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className={isRTL ? 'text-right' : ''}>
          {isRTL 
            ? 'يتم تكوين أجهزة الحضور عبر MQTT أو REST API. يمكنك إعداد معلومات الاتصال في الإعدادات.'
            : 'Attendance devices connect via MQTT or REST API. Configure connection details in settings.'
          }
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {devices.map((device) => (
          <Card key={device.name} className="shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <CardTitle className="text-xl">{device.name}</CardTitle>
                    <div className={`flex items-center gap-2 mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Wifi className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-500">{device.protocol}</p>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {isRTL ? 'مدعوم' : 'Supported'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className={`font-medium text-gray-900 mb-2 ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'الموديلات المدعومة' : 'Supported Models'}
                  </h4>
                  <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
                    {device.models.map((model, idx) => (
                      <Badge key={idx} variant="outline" className="bg-gray-50">
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Settings className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'إضافة جهاز' : 'Add Device'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}