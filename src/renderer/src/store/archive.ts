/**
 * Zustand store — 编辑中的档案数据状态
 * 不直接操作文件，IPC 由外部触发后通过 setData 写入
 */

import { create } from 'zustand'
import type { ArchivePerson, FamilyMember } from '../types/archive'
import { EMPTY_FAMILY_MEMBER } from '../types/archive'

/* 空白档案初始值 */
function blankPerson(): ArchivePerson {
  return {
    XingMing: '',
    XingBie: '',
    ChuShengNianYue: '',
    MinZu: '',
    JiGuan: '',
    ChuShengDi: '',
    RuDangShiJian: '',
    CanJiaGongZuoShiJian: '',
    JianKangZhuangKuang: '',
    ZhuanYeJiShuZhiWu: '',
    ShuXiZhuanYeYouHeZhuanChang: '',
    QuanRiZhiJiaoYu_XueLi: '',
    QuanRiZhiJiaoYu_XueWei: '',
    QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '',
    QuanRiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '',
    ZaiZhiJiaoYu_XueLi: '',
    ZaiZhiJiaoYu_XueWei: '',
    ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '',
    ZaiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '',
    XianRenZhiWu: '',
    NiRenZhiWu: '',
    NiMianZhiWu: '',
    JianLi: '',
    JiangChengQingKuang: '',
    NianDuKaoHeJieGuo: '',
    RenMianLiYou: '',
    JiaTingChengYuan: {
      Item: Array.from({ length: 10 }, () => ({ ...EMPTY_FAMILY_MEMBER }))
    },
    ChengBaoDanWei: '',
    JiSuanNianLingShiJian: '',
    TianBiaoShiJian: '',
    TianBiaoRen: '',
    ShenFenZheng: '',
    ZhaoPian: '',
    Version: '3.2.1.16'
  }
}

/* ---- 字段标签（供 UI 使用）---- */
export const FIELD_LABELS: Record<string, string> = {
  XingMing: '姓名',
  XingBie: '性别',
  ChuShengNianYue: '出生年月',
  MinZu: '民族',
  JiGuan: '籍贯',
  ChuShengDi: '出生地',
  RuDangShiJian: '入党时间',
  CanJiaGongZuoShiJian: '参加工作时间',
  JianKangZhuangKuang: '健康状况',
  ZhuanYeJiShuZhiWu: '专业技术职务',
  ShuXiZhuanYeYouHeZhuanChang: '熟悉专业有何专长',
  QuanRiZhiJiaoYu_XueLi: '全日制教育—学历',
  QuanRiZhiJiaoYu_XueWei: '全日制教育—学位',
  QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '全日制教育—毕业院校系',
  QuanRiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '全日制教育—学位毕业院校系',
  ZaiZhiJiaoYu_XueLi: '在职教育—学历',
  ZaiZhiJiaoYu_XueWei: '在职教育—学位',
  ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '在职教育—毕业院校系',
  ZaiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '在职教育—学位毕业院校系',
  XianRenZhiWu: '现任职务',
  NiRenZhiWu: '拟任职务',
  NiMianZhiWu: '拟免职务',
  JianLi: '简历',
  JiangChengQingKuang: '奖惩情况',
  NianDuKaoHeJieGuo: '年度考核结果',
  RenMianLiYou: '任免理由',
  ChengBaoDanWei: '呈报单位',
  JiSuanNianLingShiJian: '计算年龄时间',
  TianBiaoShiJian: '填表时间',
  TianBiaoRen: '填表人',
  ShenFenZheng: '身份证号',
  ZhaoPian: '证件照',
  Version: '版本'
}

/* ---- 家庭成员标签 ---- */
export const FAMILY_LABELS: Record<string, string> = {
  ChengWei: '称谓',
  XingMing: '姓名',
  ChuShengRiQi: '出生日期',
  ZhengZhiMianMao: '政治面貌',
  GongZuoDanWeiJiZhiWu: '工作单位及职务'
}

/* ---- Store ---- */
export interface ArchiveStore {
  data: ArchivePerson
  filePath: string | null
  isDirty: boolean
  currentPage: number

  setData: (data: ArchivePerson) => void
  setField: (key: keyof ArchivePerson, value: string) => void
  setFilePath: (path: string | null) => void
  setCurrentPage: (page: number) => void
  markClean: () => void
  markDirty: () => void

  addFamilyMember: () => void
  removeFamilyMember: (index: number) => void
  updateFamilyMember: (index: number, field: keyof FamilyMember, value: string) => void
}

export const useArchiveStore = create<ArchiveStore>((set) => ({
  data: blankPerson(),
  filePath: null,
  isDirty: false,
  currentPage: 1,

  setData: (data) => set({ data, isDirty: false }),

  setField: (key, value) =>
    set((state) => ({
      data: { ...state.data, [key]: value },
      isDirty: true
    })),

  setFilePath: (path) => set({ filePath: path }),
  setCurrentPage: (page) => set({ currentPage: page }),

  markClean: () => set({ isDirty: false }),
  markDirty: () => set({ isDirty: true }),

  addFamilyMember: () =>
    set((state) => ({
      data: {
        ...state.data,
        JiaTingChengYuan: {
          Item: [...state.data.JiaTingChengYuan.Item, { ...EMPTY_FAMILY_MEMBER }]
        }
      },
      isDirty: true
    })),

  removeFamilyMember: (index) =>
    set((state) => {
      const items = [...state.data.JiaTingChengYuan.Item]
      items.splice(index, 1)
      return {
        data: {
          ...state.data,
          JiaTingChengYuan: { Item: items }
        },
        isDirty: true
      }
    }),

  updateFamilyMember: (index, field, value) =>
    set((state) => {
      const items = state.data.JiaTingChengYuan.Item.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      )
      return {
        data: { ...state.data, JiaTingChengYuan: { Item: items } },
        isDirty: true
      }
    })
}))
