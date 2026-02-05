import { Button } from "@/components/ui/button";
import React from "react";

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome to DEAWARE</h2>
        <p className="text-muted-foreground mb-4">
          Face Recognition Attendance System
        </p>
        <Button>Get Started</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Total Employees</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Today's Attendance</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Active Sessions</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
