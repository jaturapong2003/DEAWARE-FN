import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { EmployeesList } from '@/@types/Employees';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Mail, Phone, Search, Users } from 'lucide-react';
import { getInitials } from '@/lib/helper';
import apiClient from '@/lib/apiClient';
import keycloak from '@/config/keycloak';
import LoadingPage from '@/components/common/LoadingPage';
import ErrorPage from '@/components/common/ErrorPage';

// Employee Card
const EmployeeCard: React.FC<{ employee: EmployeesList }> = ({ employee }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() =>
        navigate(`/employees/${employee.user_id}`, { state: { employee } })
      }
      className="bg-card hover:border-primary/50 group cursor-pointer overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-md"
    >
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <Avatar className="border-primary/20 h-24 w-24 border-2 transition-transform duration-200 group-hover:scale-105">
            <AvatarImage
              src={employee.url_image || undefined}
              alt={employee.display_name}
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {getInitials(employee.display_name)}
            </AvatarFallback>
          </Avatar>

          {/* ชื่อ */}
          <h3 className="mt-4 text-lg font-semibold">
            {employee.display_name || 'ไม่มีชื่อ'}
          </h3>

          {/* ตำแหน่ง */}
          <Badge variant="secondary" className="mt-2">
            {employee.position || 'พนักงาน'}
          </Badge>

          {/* ข้อมูลติดต่อ */}
          <div className="mt-4 w-full space-y-2">
            {/* Email */}
            <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate" title={employee.email}>
                {employee.email}
              </span>
            </div>

            {/* Phone */}
            {employee.phone_number && (
              <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{employee.phone_number}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main employees component
function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery<EmployeesList[]>({
    queryKey: ['employee/list'],
    queryFn: async () => {
      const response = await apiClient.get<EmployeesList[]>('/employee/list');
      return response.data;
    },
    enabled: keycloak.authenticated,
  });

  if (error) return <ErrorPage />;
  if (isLoading) return <LoadingPage message="กำลังโหลดข้อมูลพนักงาน..." />;

  // กรองข้อมูลพนักงานตามคำค้นหา
  const filteredEmployees = (data || []).filter(
    (employee) =>
      employee.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.position &&
        employee.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">รายชื่อพนักงาน</h1>
              <p className="text-muted-foreground text-sm">
                ทั้งหมด {(data || []).length} คน
              </p>
            </div>
          </div>

          {/* ช่องค้นหา */}
          <div className="relative w-full md:w-80">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="ค้นหาชื่อ, อีเมล หรือตำแหน่ง..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* รายการพนักงาน */}
      {filteredEmployees.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.user_id} employee={employee} />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border p-12 text-center">
          <Users className="text-muted-foreground mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">ไม่พบพนักงาน</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            {searchTerm
              ? `ไม่พบพนักงานที่ตรงกับ "${searchTerm}"`
              : 'ยังไม่มีข้อมูลพนักงาน'}
          </p>
        </div>
      )}
    </div>
  );
}

export default EmployeesPage;
