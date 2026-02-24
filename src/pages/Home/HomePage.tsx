import React, { useEffect, useMemo } from 'react';
import ProfileCard from '@/pages/Home/_components/ProfileCard';
import TransectionButton from '@/pages/Home/_components/TransectionButton';
import toast from 'react-hot-toast';
import ErrorPage from '@/components/common/ErrorPage';
import LoadingPage from '@/components/common/LoadingPage';
import { useProfile } from '@/hooks/useProfile';

// Main Home page
const HomePage: React.FC = () => {
  const { profile, isLoading, error, refetch, checkInTime, checkOutTime } =
    useProfile();

  // Show error toast
  useEffect(() => {
    if (error) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      toast.error(message);
    }
  }, [error]);

  // Memoize profile display values
  const profileData = useMemo(
    () => ({
      displayName: profile?.display_name || profile?.user_name || '-',
      email: profile?.email || '-',
      urlImage: profile?.url_image || '',
      userName: profile?.user_name || '-',
      phoneNumber: profile?.phone_number,
      position: profile?.position,
      faceEmbeddingCount: profile?.face_embedding_count,
      hasFaceEmbedding: profile?.has_face_embedding,
    }),
    [profile]
  );

  // Loading
  if (isLoading || !profile) {
    return <LoadingPage message="กำลังโหลดข้อมูล..." fullScreen={true} />;
  }

  // Error
  if (error) {
    return (
      <ErrorPage
        title="ไม่สามารถโหลดข้อมูลได้"
        message="เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง"
        onRetry={() => refetch()}
        fullScreen={false}
      />
    );
  }

  return (
    <div className="space-y-4 px-2 sm:space-y-6 sm:px-0">
      <ProfileCard {...profileData} />
      <TransectionButton
        checkInTime={checkInTime}
        checkOutTime={checkOutTime}
      />
    </div>
  );
};

export default HomePage;
