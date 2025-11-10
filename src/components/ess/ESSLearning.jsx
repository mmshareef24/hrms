import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function ESSLearning({ user }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
        <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <GraduationCap className="w-5 h-5 text-green-600" />
          <span>{isRTL ? 'التعلم والتطوير' : 'Learning & Development'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-12">
        <div className="text-center text-gray-500">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>{isRTL ? 'قريباً - تصفح الدورات، التسجيل، وعرض السجلات' : 'Coming Soon - Browse Courses, Enroll & View Transcripts'}</p>
        </div>
      </CardContent>
    </Card>
  );
}