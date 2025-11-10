import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import TravelRequests from "../travel/TravelRequests";

export default function ESSTravelRequests({ user }) {
  return <TravelRequests />;
}