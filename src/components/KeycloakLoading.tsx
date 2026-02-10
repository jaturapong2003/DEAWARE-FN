/**
 * คอมโพเนนต์แสดงสถานะกำลังโหลดขณะ Keycloak กำลังเริ่มต้น
 */
const KeycloakLoading = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="text-center">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      <p className="text-muted-foreground mt-2">กำลังตรวจสอบสิทธิ์...</p>
    </div>
  </div>
);

export default KeycloakLoading;
