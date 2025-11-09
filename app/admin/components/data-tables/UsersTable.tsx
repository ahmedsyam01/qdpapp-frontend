'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GlassTable, TableColumn } from '../ui/GlassTable';
import { GlassChip } from '../ui/GlassChip';
import { GlassButton } from '../ui/GlassButton';
import { User } from '../../services/adminUsersService';

interface UsersTableProps {
  users: User[];
  loading?: boolean;
  onDeleteUser?: (userId: string) => void;
  onEditUser?: (user: User) => void;
}

const userTypeLabels: Record<string, string> = {
  buyer: 'مشتري',
  seller: 'بائع',
  agent: 'وكيل',
  admin: 'مسؤول',
  super_admin: 'مسؤول رئيسي',
};

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading = false,
  onDeleteUser,
  onEditUser,
}) => {
  const router = useRouter();

  const columns: TableColumn<User>[] = [
    {
      key: 'fullName',
      label: 'الاسم',
      sortable: true,
      width: '200px',
      render: (user) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D9D1BE 0%, #C9C1AE 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700,
              color: '#000',
            }}
          >
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600 }}>{user.fullName}</span>
            {user.email && (
              <span style={{ fontSize: '12px', color: '#6B7280' }}>{user.email}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'الهاتف',
      sortable: true,
      width: '140px',
      render: (user) => (
        <span style={{ direction: 'ltr', display: 'block', textAlign: 'right' }}>
          {user.phone}
        </span>
      ),
    },
    {
      key: 'userType',
      label: 'النوع',
      sortable: true,
      width: '120px',
      render: (user) => (
        <GlassChip
          label={userTypeLabels[user.userType]}
          variant={user.userType === 'admin' || user.userType === 'super_admin' ? 'info' : 'default'}
          size="sm"
        />
      ),
    },
    {
      key: 'status',
      label: 'الحالة',
      sortable: false,
      width: '100px',
      render: (user) => (
        <GlassChip
          label={user.phoneVerified ? 'نشط' : 'غير نشط'}
          variant={user.phoneVerified ? 'success' : 'warning'}
          size="sm"
        />
      ),
    },
    {
      key: 'verified',
      label: 'التوثيق',
      sortable: false,
      width: '100px',
      render: (user) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {user.phoneVerified && (
            <span style={{ fontSize: '12px', color: '#059669' }}>✓ الهاتف</span>
          )}
          {user.emailVerified && (
            <span style={{ fontSize: '12px', color: '#059669' }}>✓ البريد</span>
          )}
          {!user.phoneVerified && !user.emailVerified && (
            <span style={{ fontSize: '12px', color: '#6B7280' }}>غير موثق</span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'تاريخ الانضمام',
      sortable: true,
      width: '140px',
      render: (user) => (
        <span style={{ fontSize: '13px', color: '#6B7280' }}>
          {new Date(user.createdAt).toLocaleDateString('ar-QA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      sortable: false,
      width: '150px',
      align: 'center',
      render: (user) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/users/${user._id}`);
            }}
            style={{
              padding: '6px 12px',
              background: 'rgba(212, 197, 176, 0.2)',
              border: '1px solid rgba(212, 197, 176, 0.4)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#6B5B3C',
              cursor: 'pointer',
              fontFamily: 'Tajawal, sans-serif',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(212, 197, 176, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(212, 197, 176, 0.2)';
            }}
          >
            عرض
          </button>
          {onEditUser && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditUser(user);
              }}
              style={{
                padding: '6px 12px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#2563EB',
                cursor: 'pointer',
                fontFamily: 'Tajawal, sans-serif',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
              }}
            >
              تعديل
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <GlassTable
      columns={columns}
      data={users}
      keyExtractor={(user) => user._id}
      loading={loading}
      emptyMessage="لا يوجد مستخدمين"
      onRowClick={(user) => router.push(`/admin/users/${user._id}`)}
      hoverable={true}
    />
  );
};
