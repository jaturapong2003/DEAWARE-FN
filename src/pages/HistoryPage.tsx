import React from "react";

const HistoryPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-2xl font-bold mb-2">Attendance History</h2>
        <p className="text-muted-foreground">
          View and manage employee attendance records
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground text-center py-8">
          No attendance records found
        </p>
      </div>
    </div>
  );
};

export default HistoryPage;
