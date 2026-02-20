import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { useKeycloak } from '@react-keycloak/web';
import { Button } from '@/components/ui/button';

/**
 * หน้าทดสอบ API - ใช้สำหรับทดสอบการเชื่อมต่อ API พร้อม Token
 */
const ApiTestPage = () => {
  const { get, getToken } = useApi();
  const { keycloak, initialized } = useKeycloak();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // ตรวจจับการ logout - ถ้า logout แล้วให้ redirect ไปหน้า login อัตโนมัติ
  useEffect(() => {
    if (initialized && !keycloak.authenticated) {
      keycloak.login();
    }
  }, [initialized, keycloak.authenticated, keycloak]);

  // ทดสอบเรียก API /employee/me
  const testApiCall = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await get('/employee/me');
      setResult(JSON.stringify(response.data, null, 2));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">🧪 ทดสอบ API</h1>

      {/* แสดง Token */}
      <div className="bg-card rounded-lg border p-4">
        <h2 className="mb-2 font-semibold">🔑 Access Token</h2>
        <div className="bg-muted max-h-32 overflow-auto rounded p-2">
          <code className="text-xs break-all">
            {getToken() || 'ไม่มี Token'}
          </code>
        </div>
      </div>

      {/* ข้อมูลผู้ใช้จาก Token */}
      <div className="bg-card rounded-lg border p-4">
        <h2 className="mb-2 font-semibold">👤 ข้อมูลจาก Token</h2>
        <div className="space-y-1 text-sm">
          <p>
            <strong>Username:</strong>{' '}
            {keycloak.tokenParsed?.preferred_username || '-'}
          </p>
          <p>
            <strong>Email:</strong> {keycloak.tokenParsed?.email || '-'}
          </p>
          <p>
            <strong>Name:</strong> {keycloak.tokenParsed?.name || '-'}
          </p>
        </div>
      </div>

      {/* ปุ่มทดสอบ API */}
      <div className="bg-card rounded-lg border p-4">
        <h2 className="mb-4 font-semibold">📡 ทดสอบเรียก API</h2>
        <Button onClick={testApiCall} disabled={loading}>
          {loading ? 'กำลังโหลด...' : 'เรียก GET /employee/me'}
        </Button>

        {/* แสดง Error */}
        {error && (
          <div className="mt-4 rounded bg-red-100 p-3 text-red-700">
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {/* แสดงผลลัพธ์ */}
        {result && (
          <div className="mt-4">
            <h3 className="mb-2 font-medium">✅ ผลลัพธ์:</h3>
            <pre className="bg-muted max-h-64 overflow-auto rounded p-3 text-sm">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTestPage;
