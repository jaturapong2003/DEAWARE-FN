import { Button } from "@/components/ui/button";
import React from "react";

const HomePage: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <h1>Welcome to DEAWARE</h1>
      <p>This is the home page.</p>
      <Button>click </Button>
    </div>
  );
};

export default HomePage;
