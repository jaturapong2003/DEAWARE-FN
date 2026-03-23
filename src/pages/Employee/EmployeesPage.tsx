import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { EmployeesList } from '@/@types/Employees';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Briefcase,
  ChevronRight,
  Mail,
  Phone,
  Search,
  Users,
} from 'lucide-react';
import { getInitials } from '@/lib/helper';
import apiClient from '@/lib/apiClient';
import LoadingPage from '@/components/common/LoadingPage';
import ErrorPage from '@/components/common/ErrorPage';
import { useKeycloak } from '@react-keycloak/web';
import CreateEmployeeDialog from '@/components/common/CreateEmployeeDialog';
import toast from 'react-hot-toast';

// Employee Card
const EmployeeCard: React.FC<{ employee: EmployeesList }> = ({ employee }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() =>
        navigate(`/employees/${employee.user_id}`, { state: { employee } })
      }
      className="group animate-in slide-in-from-bottom-4 fade-in border-border relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white/5 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#d1385c]/50 hover:bg-white/10 hover:shadow-[0_10px_30px_-10px_rgba(209,56,92,0.3)]"
    >
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#d1385c]/10 blur-2xl transition-all duration-500 group-hover:bg-[#d1385c]/20" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <Avatar className="border-border h-20 w-20 border-2 shadow-xl transition-transform duration-300 group-hover:scale-105 group-hover:border-white/30">
            <AvatarImage src={employee.url_image} alt={employee.display_name} />
            <AvatarFallback className="bg-primary text-lg font-bold text-slate-300">
              {getInitials(employee.display_name)}
            </AvatarFallback>
          </Avatar>
        </div>

        <h3 className="text-lg font-bold tracking-tight transition-colors group-hover:text-[#d1385c]">
          {employee.display_name || 'ไม่มีชื่อ'}
        </h3>

        <Badge className="mt-2 border-[#d1385c]/30 bg-[#d1385c]/10 text-[#d1385c] backdrop-blur-md group-hover:bg-[#d1385c]/20">
          <Briefcase className="mr-1.5 h-3 w-3" />
          {employee.position || 'พนักงานทั่วไป'}
        </Badge>

        <div className="mt-6 flex w-full flex-col gap-2.5 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 transition-colors group-hover:bg-[#d1385c]/10 group-hover:text-[#d1385c]">
              <Mail className="h-3.5 w-3.5" />
            </div>
            <span className="truncate font-medium">{employee.email}</span>
          </div>

          {employee.phone_number && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 transition-colors group-hover:bg-[#d1385c]/10 group-hover:text-[#d1385c]">
                <Phone className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">{employee.phone_number}</span>
            </div>
          )}
        </div>

        {/* Action Hint */}
        <div className="absolute top-4 right-4 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
          <ChevronRight className="h-5 w-5 text-[#d1385c]" />
        </div>
      </div>
    </div>
  );
};

// Main employees component
function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { keycloak } = useKeycloak();

  const { data, isLoading, error } = useQuery<EmployeesList[]>({
    queryKey: ['employee/list'],
    queryFn: async () => {
      const response = await apiClient.get<EmployeesList[]>('/employee/list');
      return response.data;
    },
    enabled: keycloak.authenticated,
  });

  if (error) return <ErrorPage />;
  if (isLoading && keycloak.authenticated)
    return <LoadingPage message="กำลังโหลดข้อมูลพนักงาน..." />;

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
      <div className="border-border border-border relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl sm:p-8">
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-[#d1385c]/20 blur-[80px]" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-lienar-to-br flex h-16 w-16 items-center justify-center rounded-2xl from-[#d1385c] to-rose-600 shadow-[0_0_20px_rgba(209,56,92,0.4)]">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                รายชื่อพนักงาน
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-400">
                <span>พบข้อมูลทั้งหมด</span>
                <Badge className="border-0 bg-white/10 hover:bg-white/20">
                  {data?.length} คน
                </Badge>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="group relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-[#d1385c]" />
              </div>
              <Input
                type="text"
                placeholder="ค้นหาชื่อ, อีเมล หรือตำแหน่ง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-13 w-full rounded-2xl border py-3.5 pr-4 pl-12 text-sm shadow-inner backdrop-blur-md transition-all outline-none focus:border-[#d1385c]/50 focus:bg-white/5 focus:ring-1 focus:ring-[#d1385c]/50"
              />
            </div>
            <CreateEmployeeDialog
              onCreate={(data) =>
                toast.success(
                  `สร้าง ${data.display_name || data.user_name} (mock)`
                )
              }
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
