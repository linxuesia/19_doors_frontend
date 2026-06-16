import { useState, useEffect } from 'react';
import { View, Text, Input, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import Icon from '../../../components/Icon';
import './index.scss';

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: 'STORE_MANAGER' | 'INSTALLER';
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

  // 店长只能管理安装工，老板可以管理所有角色
  const isOwner = (user?.role || '').includes('STORE_OWNER');

  // 表单数据
  const [form, setForm] = useState({
    name: '',
    phone: '',
    role: 'INSTALLER' as 'STORE_MANAGER' | 'INSTALLER',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!requireBusinessLogin()) return;
    if (!(user?.role || '').includes('STORE_OWNER') && !(user?.role || '').includes('STORE_MANAGER')) {
      Taro.showToast({ title: '无权限访问', icon: 'none' });
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
      const users = res?.users || [];
      const staffMembers: StaffMember[] = users
        .filter((u: any) => (u.role || '').includes('STORE_MANAGER') || (u.role || '').includes('INSTALLER'))
        .map((u: any) => ({
          id: u.id,
          name: u.name,
          phone: u.phone || '',
          role: u.role,
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

  const getAvatarText = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const filteredList = (() => {
    let list = staffList;
    // 店长只能看到安装工，看不到其他店长
    if (!isOwner) {
      list = list.filter(s => (s.role || '').includes('INSTALLER'));
    }
    if (activeTab !== 'all') {
      list = list.filter(s => (s.role || '').includes(activeTab));
    }
    return list;
  })();

  const openAddModal = () => {
    setForm({ phone: '', role: 'INSTALLER' });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setForm({ phone: '', role: 'INSTALLER' });
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
    if (!/^1\d{10}$/.test(form.phone.trim())) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/stores/${user?.storeId}/staff`, {
        phone: form.phone.trim(),
        role: form.role,
      });
      Taro.showToast({ title: `已添加: ${res.name || res.phone}`, icon: 'success' });
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
      await api.put(`/stores/${user?.storeId}/staff/${editingStaff.id}`, {
        name: form.name.trim(),
        role: form.role,
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

  const handleRemove = (staff: StaffMember) => {
    Taro.showModal({
      title: '确认移除',
      content: `确定要将「${staff.name}」从门店移除吗？`,
      confirmColor: '#f53f3f',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.del(`/stores/${user?.storeId}/staff/${staff.id}`);
            Taro.showToast({ title: '已移除', icon: 'success' });
            fetchStaffList();
          } catch (e: any) {
            console.error('[StaffManage] 移除员工失败', e);
            Taro.showToast({ title: e.message || '移除失败', icon: 'none' });
          }
        }
      },
    });
  };

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  if (!user || !requireBusinessLogin()) {
    return <View className='cl-page' style='display:flex;justify-content:center;align-items:center;min-height:100vh'><Text style='color:#9ca3af;font-size:14px'>加载中...</Text></View>;
  }

  if (!(user.role || '').includes('STORE_OWNER') && !(user.role || '').includes('STORE_MANAGER')) {
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
      {/* Tab 栏 - 店长不显示"店长"tab */}
      <View className='smp-tabs'>
        {([
          { key: 'all' as TabType, label: '全部成员' },
          ...(isOwner ? [{ key: 'STORE_MANAGER' as TabType, label: '店长' }] : []),
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
                <Text className='smp-phone'>{staff.phone}</Text>
              </View>

              {/* 操作按钮 */}
              <View className='smp-actions'>
                <View className='smp-action-btn smp-btn-edit' onClick={() => openEditModal(staff)}>
                  <Text>编辑</Text>
                </View>
                <View className='smp-action-btn smp-btn-delete' onClick={() => handleRemove(staff)}>
                  <Text>移除</Text>
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

      {/* 添加成员按钮 - 弹窗打开时隐藏 */}
      {!showAddModal && !showEditModal && (
      <View className='smp-add-btn' onClick={openAddModal}>
        <Text className='smp-add-btn-icon'>+</Text>
        <Text className='smp-add-btn-text'>添加成员</Text>
      </View>
      )}

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
              <Text className='smp-form-label'>手机号 *</Text>
              <Input
                className='smp-form-input'
                type='number'
                placeholder='请输入已登录用户的手机号'
                value={form.phone}
                onInput={(e) => updateForm('phone', e.detail.value)}
                maxlength={11}
              />
              <Text className='smp-form-hint'>该用户需先登录过小程序才能被添加</Text>
            </View>

            <View className='smp-form-field'>
              <Text className='smp-form-label'>角色 *</Text>
              <View
                className='smp-form-picker'
                onClick={() => {
                  // 店长只能选择安装工
                  const options = isOwner ? ROLE_OPTIONS : ROLE_OPTIONS.filter(r => r.value === 'INSTALLER');
                  Taro.showActionSheet({
                    itemList: options.map(r => r.label),
                    success: (res) => {
                      updateForm('role', options[res.tapIndex].value);
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
                  // 店长只能选择安装工
                  const options = isOwner ? ROLE_OPTIONS : ROLE_OPTIONS.filter(r => r.value === 'INSTALLER');
                  Taro.showActionSheet({
                    itemList: options.map(r => r.label),
                    success: (res) => {
                      updateForm('role', options[res.tapIndex].value);
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

            <View className={`smp-submit-btn ${submitting ? 'opacity-50' : ''}`} onClick={submitting ? undefined : handleEditSubmit}>
              <Text className='smp-submit-text'>{submitting ? '保存中...' : '保存修改'}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
