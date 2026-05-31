import { useState, useEffect } from 'react';
import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import './index.scss';

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: 'STORE_MANAGER' | 'INSTALLER';
  status: 'ACTIVE' | 'DISABLED';
  avatarUrl?: string;
}

type TabType = 'all' | 'STORE_MANAGER' | 'INSTALLER';

const ROLE_OPTIONS = [
  { label: '店长', value: 'STORE_MANAGER' },
  { label: '安装工', value: 'INSTALLER' },
];

export default function StaffManage() {
  const { user, requireBusinessLogin } = useAuth();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // 表单数据
  const [form, setForm] = useState({
    name: '',
    phone: '',
    role: 'INSTALLER' as 'STORE_MANAGER' | 'INSTALLER',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!requireBusinessLogin()) return;
    if (!(user?.role || '').includes('STORE_OWNER')) {
      Taro.showToast({ title: '仅门店老板可访问', icon: 'none' });
      setTimeout(() => Taro.navigateBack(), 1500);
      return;
    }
    fetchStaffList();
  }, [user]);

  const fetchStaffList = async () => {
    setLoading(true);
    try {
      if (!user?.storeId) return;
      const res: any = await api.get(`/stores/${user.storeId}`);
      const users = res.users || [];
      const staffMembers: StaffMember[] = users
        .filter((u: any) => (u.role || '').includes('STORE_MANAGER') || (u.role || '').includes('INSTALLER'))
        .map((u: any) => ({
          id: u.id,
          name: u.name,
          phone: u.phone || '',
          role: u.role,
          status: u.status || 'ACTIVE',
          avatarUrl: u.avatarUrl,
        }));
      setStaffList(staffMembers);
    } catch (err) {
      console.error('[StaffManage] 加载员工列表失败', err);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 7) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  };

  const getAvatarText = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const filteredList = activeTab === 'all'
    ? staffList
    : staffList.filter(s => (s.role || '').includes(activeTab));

  const openAddModal = () => {
    setForm({ name: '', phone: '', role: 'INSTALLER' });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setForm({ name: '', phone: '', role: 'INSTALLER' });
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setForm({
      name: staff.name,
      phone: staff.phone,
      role: staff.role,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingStaff(null);
    setForm({ name: '', phone: '', role: 'INSTALLER' });
  };

  const handleAddSubmit = async () => {
    if (!form.name.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!form.phone.trim() || form.phone.length < 11) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/users', {
        name: form.name.trim(),
        phone: form.phone.trim(),
        role: form.role,
        storeId: user?.storeId,
        status: 'ACTIVE',
      });
      Taro.showToast({ title: '添加成功', icon: 'success' });
      closeAddModal();
      fetchStaffList();
    } catch (e: any) {
      console.error('[StaffManage] 添加员工失败', e);
      Taro.showToast({ title: e.message || '添加失败', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingStaff) return;
    if (!form.name.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/users/${editingStaff.id}`, {
        name: form.name.trim(),
        role: form.role,
        status: editingStaff.status,
      });
      Taro.showToast({ title: '修改成功', icon: 'success' });
      closeEditModal();
      fetchStaffList();
    } catch (e: any) {
      console.error('[StaffManage] 修改员工失败', e);
      Taro.showToast({ title: e.message || '修改失败', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (staff: StaffMember) => {
    const newStatus = staff.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? '启用' : '停用';
    try {
      await api.put(`/users/${staff.id}`, { status: newStatus });
      Taro.showToast({ title: `${action}成功`, icon: 'success' });
      fetchStaffList();
    } catch (e: any) {
      console.error('[StaffManage] 切换状态失败', e);
      Taro.showToast({ title: e.message || `${action}失败`, icon: 'none' });
    }
  };

  const handleDelete = (staff: StaffMember) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除「${staff.name}」吗？此操作不可恢复`,
      confirmColor: '#f53f3f',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.del(`/users/${staff.id}`);
            Taro.showToast({ title: '删除成功', icon: 'success' });
            fetchStaffList();
          } catch (e: any) {
            console.error('[StaffManage] 删除员工失败', e);
            Taro.showToast({ title: e.message || '删除失败', icon: 'none' });
          }
        }
      },
    });
  };

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  if (!user || !requireBusinessLogin()) return null;

  if (!(user.role || '').includes('STORE_OWNER')) {
    return (
      <View className='smp-loading'>
        <Text className='smp-loading-text'>无权限访问</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className='smp-loading'>
        <Text className='smp-loading-text'>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView className='smp-page' scrollY>
      {/* Tab 栏 */}
      <View className='smp-tabs'>
        {([
          { key: 'all' as TabType, label: '全部成员' },
          { key: 'STORE_MANAGER' as TabType, label: '店长' },
          { key: 'INSTALLER' as TabType, label: '安装工' },
        ]).map(tab => (
          <View
            key={tab.key}
            className={`smp-tab-item ${activeTab === tab.key ? 'smp-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      {/* 成员列表 */}
      {filteredList.length > 0 ? (
        <View className='smp-list'>
          {filteredList.map(staff => (
            <View key={staff.id} className='smp-card'>
              {/* 头像 */}
              <View className='smp-avatar'>
                {staff.avatarUrl ? (
                  <Image
                    className='smp-avatar'
                    src={staff.avatarUrl}
                    mode='aspectFill'
                  />
                ) : (
                  <Text className='smp-avatar-text'>{getAvatarText(staff.name)}</Text>
                )}
              </View>

              {/* 信息 */}
              <View className='smp-info'>
                <View className='smp-name-row'>
                  <Text className='smp-name'>{staff.name}</Text>
                  <Text className={`smp-role-tag ${(staff.role || '').includes('STORE_MANAGER') ? 'smp-role-manager' : 'smp-role-installer'}`}>
                    {(staff.role || '').includes('STORE_MANAGER') ? '店长' : '安装工'}
                  </Text>
                </View>
                <Text className='smp-phone'>{maskPhone(staff.phone)}</Text>
                <View className='smp-status-row'>
                  <View className={`smp-status-dot ${staff.status === 'ACTIVE' ? 'smp-status-normal' : 'smp-status-disabled'}`} />
                  <Text className='smp-status-text'>{staff.status === 'ACTIVE' ? '正常' : '停用'}</Text>
                </View>
              </View>

              {/* 操作按钮 */}
              <View className='smp-actions'>
                <View className='smp-action-btn smp-btn-edit' onClick={() => openEditModal(staff)}>
                  <Text>编辑</Text>
                </View>
                <View className='smp-action-btn smp-btn-delete' onClick={() => handleDelete(staff)}>
                  <Text>删除</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className='smp-empty'>
          <Icon name='users' size={80} color='#d1d5db' />
          <Text className='smp-empty-text'>暂无成员</Text>
          <Text className='smp-empty-hint'>点击下方按钮添加新成员</Text>
        </View>
      )}

      {/* 添加成员按钮 */}
      <View className='smp-add-btn' onClick={openAddModal}>
        <Text className='smp-add-btn-icon'>+</Text>
        <Text className='smp-add-btn-text'>添加成员</Text>
      </View>

      {/* 添加成员弹窗 */}
      {showAddModal && (
        <View className='smp-modal-mask' onClick={closeAddModal}>
          <View className='smp-modal-content' onClick={(e) => e.stopPropagation()}>
            <View className='smp-modal-header'>
              <Text className='smp-modal-title'>添加成员</Text>
              <View className='smp-modal-close' onClick={closeAddModal}>
                <Text>✕</Text>
              </View>
            </View>

            <View className='smp-form-field'>
              <Text className='smp-form-label'>姓名 *</Text>
              <Input
                className='smp-form-input'
                placeholder='请输入姓名'
                value={form.name}
                onInput={(e) => updateForm('name', e.detail.value)}
                maxlength={20}
              />
            </View>

            <View className='smp-form-field'>
              <Text className='smp-form-label'>手机号 *</Text>
              <Input
                className='smp-form-input'
                type='number'
                placeholder='请输入手机号'
                value={form.phone}
                onInput={(e) => updateForm('phone', e.detail.value)}
                maxlength={11}
              />
            </View>

            <View className='smp-form-field'>
              <Text className='smp-form-label'>角色 *</Text>
              <View
                className='smp-form-picker'
                onClick={() => {
                  Taro.showActionSheet({
                    itemList: ROLE_OPTIONS.map(r => r.label),
                    success: (res) => {
                      updateForm('role', ROLE_OPTIONS[res.tapIndex].value);
                    },
                  });
                }}
              >
                <Text className={!form.role ? 'smp-picker-placeholder' : ''}>
                  {ROLE_OPTIONS.find(r => r.value === form.role)?.label || '请选择角色'}
                </Text>
                <Text className='smp-picker-arrow'>▼</Text>
              </View>
            </View>

            <View className={`smp-submit-btn ${submitting ? 'opacity-50' : ''}`} onClick={submitting ? undefined : handleAddSubmit}>
              <Text className='smp-submit-text'>{submitting ? '提交中...' : '确认添加'}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 编辑成员弹窗 */}
      {showEditModal && editingStaff && (
        <View className='smp-modal-mask' onClick={closeEditModal}>
          <View className='smp-modal-content' onClick={(e) => e.stopPropagation()}>
            <View className='smp-modal-header'>
              <Text className='smp-modal-title'>编辑成员</Text>
              <View className='smp-modal-close' onClick={closeEditModal}>
                <Text>✕</Text>
              </View>
            </View>

            <View className='smp-form-field'>
              <Text className='smp-form-label'>姓名 *</Text>
              <Input
                className='smp-form-input'
                placeholder='请输入姓名'
                value={form.name}
                onInput={(e) => updateForm('name', e.detail.value)}
                maxlength={20}
              />
            </View>

            <View className='smp-form-field'>
              <Text className='smp-form-label'>角色</Text>
              <View
                className='smp-form-picker'
                onClick={() => {
                  Taro.showActionSheet({
                    itemList: ROLE_OPTIONS.map(r => r.label),
                    success: (res) => {
                      updateForm('role', ROLE_OPTIONS[res.tapIndex].value);
                    },
                  });
                }}
              >
                <Text>
                  {ROLE_OPTIONS.find(r => r.value === form.role)?.label || '请选择角色'}
                </Text>
                <Text className='smp-picker-arrow'>▼</Text>
              </View>
            </View>

            <View className='smp-form-field'>
              <Text className='smp-form-label'>状态</Text>
              <View
                className='smp-form-picker'
                onClick={() => handleToggleStatus(editingStaff)}
              >
                <Text style={{ color: editingStaff.status === 'ACTIVE' ? '#00b42a' : '#c9cdd4' }}>
                  {editingStaff.status === 'ACTIVE' ? '正常' : '停用'}（点击切换）
                </Text>
              </View>
            </View>

            <View className={`smp-submit-btn ${submitting ? 'opacity-50' : ''}`} onClick={submitting ? undefined : handleEditSubmit}>
              <Text className='smp-submit-text'>{submitting ? '保存中...' : '保存修改'}</Text>
            </View>
          </View>
        </View>
      )}

      <View className='safe-bottom' />
    </ScrollView>
  );
}
