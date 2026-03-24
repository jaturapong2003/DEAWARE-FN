const useKeycloak = () => ({
  keycloak: { authenticated: true },
  initialized: true,
});
const useAuthStore = () => ({ loggingOut: false });

const LayeredSpinner = ({ colorMode = 'primary' }) => {
  const colors =
    colorMode === 'danger'
      ? {
          l1: 'border-t-red-600 border-r-red-600',
          l2: 'border-l-rose-500 border-b-rose-500',
          l3: 'border-t-red-400',
        }
      : {
          l1: 'border-t-[#d1385c] border-r-[#d1385c]',
          l2: 'border-l-[#d1385c]/80 border-b-[#d1385c]/80',
          l3: 'border-t-[#d1385c]/60',
        };

  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      {/* 🌟 Glow Effect (Layer 0) - อิงตามโหมด */}
      <div
        className={`absolute inset-0 animate-pulse rounded-full opacity-20 blur-xl ${colorMode === 'danger' ? 'bg-red-500' : 'bg-[#d1385c]'}`}
      ></div>

      {/* 💫 Layer 1: วงนอกสุด (หมุนช้าๆ ทิศปกติ) */}
      <div
        className={`absolute inset-0 rounded-full border-[3px] border-transparent ${colors.l1} animate-spin`}
        style={{ animationDuration: '3s' }}
      ></div>

      {/* 💫 Layer 2: วงกลาง (หมุนสวนทาง ทิศ Reverse ความเร็วปานกลาง) */}
      <div
        className={`absolute inset-2 rounded-full border-[3px] border-transparent ${colors.l2} animate-spin`}
        style={{ animationDirection: 'reverse', animationDuration: '2s' }}
      ></div>

      {/* 💫 Layer 3: วงในสุด (หมุนเร็ว ทิศปกติ) */}
      <div
        className={`absolute inset-4 rounded-full border-[3px] border-transparent ${colors.l3} animate-spin`}
        style={{ animationDuration: '1s' }}
      ></div>

      {/* 🎯 Core Dot: จุดศูนย์กลาง */}
      <div
        className={`absolute m-auto h-2 w-2 animate-pulse rounded-full ${colorMode === 'danger' ? 'bg-red-500' : 'bg-[#d1385c]'}`}
      ></div>
    </div>
  );
};

// ============================================================================
// 🚀 MAIN COMPONENT
// ============================================================================
const LoadingPage = ({ message = 'กำลังโหลด...', fullScreen = true }) => {
  // 🔌 ใช้งาน Hook จริงของคุณ Beam ได้เลย
  const { keycloak, initialized } = useKeycloak();
  const { loggingOut } = useAuthStore();

  // 1️⃣ กรณี: กำลังออกจากระบบ
  if (loggingOut) {
    return (
      <div className="animate-in fade-in fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm duration-300">
        <div className="flex flex-col items-center justify-center text-center">
          <LayeredSpinner colorMode="danger" />
          <h2 className="mt-8 text-xl font-medium tracking-wide text-slate-800">
            กำลังออกจากระบบ...
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            กรุณารอสักครู่ ระบบกำลังนำท่านกลับไปยังหน้าเข้าใช้งาน
          </p>
        </div>
      </div>
    );
  }

  // 2️⃣ กรณี: รอ Keycloak เช็คสิทธิ์
  if (initialized && !keycloak.authenticated) {
    return null;
  }

  // 3️⃣ กรณี: Loading ปกติ
  if (fullScreen) {
    return (
      <div
        className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm duration-300"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center justify-center px-4 text-center">
          <LayeredSpinner colorMode="primary" />
          {message && (
            <p className="mt-6 animate-pulse text-sm font-medium tracking-wide text-slate-500">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center py-12">
      <div className="flex flex-col items-center justify-center text-center">
        <LayeredSpinner colorMode="primary" />
        {message && (
          <p className="mt-6 animate-pulse text-sm font-medium tracking-wide text-slate-500">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingPage;
