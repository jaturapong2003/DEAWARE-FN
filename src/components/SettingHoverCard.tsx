import { X } from "lucide-react"
import { useState } from "react"

interface Props {
  open: boolean
  onClose: () => void
}

export default function SettingModal({ open, onClose }: Props) {
  const [active, setActive] = useState<"profile" | "ai">("profile")

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-[900px] max-w-full h-full bg-neutral-900 text-white shadow-2xl flex animate-slideIn">

        {/* Sidebar */}
        <div className="w-64 border-r border-neutral-700 p-4 space-y-2">

          <button
            onClick={onClose}
            className="mb-6 hover:bg-neutral-800 p-2 rounded-lg"
          >
            <span>Settings</span>
          </button>

          <div className="space-y-1">

            <button
              onClick={() => setActive("profile")}
              className={`w-full text-left px-3 py-2 rounded-lg transition
                ${active === "profile"
                  ? "bg-neutral-800"
                  : "hover:bg-neutral-800/60"}
              `}
            >
              อัพรูปโปรไฟล์
            </button>

            <button
              onClick={() => setActive("ai")}
              className={`w-full text-left px-3 py-2 rounded-lg transition
                ${active === "ai"
                  ? "bg-neutral-800"
                  : "hover:bg-neutral-800/60"}
              `}
            >
              อัพรูปสำหรับ AI
            </button>

          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-10">
          {active === "profile" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                อัพรูปโปรไฟล์
              </h2>
              <div className="border border-neutral-700 rounded-xl p-6">
                (เนื้อหาใส่ทีหลัง)
              </div>
            </div>
          )}

          {active === "ai" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                อัพรูปสำหรับ AI
              </h2>
              <div className="border border-neutral-700 rounded-xl p-6">
                (เนื้อหาใส่ทีหลัง)
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
    
  )
  
}
