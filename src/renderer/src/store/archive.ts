/**
 * Zustand store — 多文档编辑状态
 * 每个文档始终对应一份磁盘文件（正式路径或 runtime_docs/ 临时文件）
 */

import { create } from 'zustand'
import type { ArchivePerson, FamilyMember } from '../types/archive'
import { EMPTY_FAMILY_MEMBER } from '../types/archive'

/* ---- 空白档案初始值 ---- */
function blankPerson(): ArchivePerson {
  return {
    XingMing: '', XingBie: '', ChuShengNianYue: '', MinZu: '', JiGuan: '',
    ChuShengDi: '', RuDangShiJian: '', CanJiaGongZuoShiJian: '',
    JianKangZhuangKuang: '', ZhuanYeJiShuZhiWu: '', ShuXiZhuanYeYouHeZhuanChang: '',
    QuanRiZhiJiaoYu_XueLi: '', QuanRiZhiJiaoYu_XueWei: '',
    QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '', QuanRiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '',
    ZaiZhiJiaoYu_XueLi: '', ZaiZhiJiaoYu_XueWei: '',
    ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '', ZaiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '',
    XianRenZhiWu: '', NiRenZhiWu: '', NiMianZhiWu: '',
    JianLi: '', JiangChengQingKuang: '', NianDuKaoHeJieGuo: '', RenMianLiYou: '',
    JiaTingChengYuan: { Item: Array.from({ length: 10 }, () => ({ ...EMPTY_FAMILY_MEMBER })) },
    ChengBaoDanWei: '', JiSuanNianLingShiJian: '', TianBiaoShiJian: '',
    TianBiaoRen: '', ShenFenZheng: '', ZhaoPian: '',
    Version: '3.2.1.16'
  }
}

/* ---- 字段标签（供 UI 使用）---- */
export const FIELD_LABELS: Record<string, string> = {
  XingMing: '姓名', XingBie: '性别', ChuShengNianYue: '出生年月',
  MinZu: '民族', JiGuan: '籍贯', ChuShengDi: '出生地',
  RuDangShiJian: '入党时间', CanJiaGongZuoShiJian: '参加工作时间',
  JianKangZhuangKuang: '健康状况', ZhuanYeJiShuZhiWu: '专业技术职务',
  ShuXiZhuanYeYouHeZhuanChang: '熟悉专业有何专长',
  QuanRiZhiJiaoYu_XueLi: '全日制教育—学历',
  QuanRiZhiJiaoYu_XueWei: '全日制教育—学位',
  QuanRiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '全日制教育—毕业院校系',
  QuanRiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '全日制教育—学位毕业院校系',
  ZaiZhiJiaoYu_XueLi: '在职教育—学历', ZaiZhiJiaoYu_XueWei: '在职教育—学位',
  ZaiZhiJiaoYu_XueLi_BiYeYuanXiaoXi: '在职教育—毕业院校系',
  ZaiZhiJiaoYu_XueWei_BiYeYuanXiaoXi: '在职教育—学位毕业院校系',
  XianRenZhiWu: '现任职务', NiRenZhiWu: '拟任职务', NiMianZhiWu: '拟免职务',
  JianLi: '简历', JiangChengQingKuang: '奖惩情况',
  NianDuKaoHeJieGuo: '年度考核结果', RenMianLiYou: '任免理由',
  ChengBaoDanWei: '呈报单位', JiSuanNianLingShiJian: '计算年龄时间',
  TianBiaoShiJian: '填表时间', TianBiaoRen: '填表人',
  ShenFenZheng: '身份证号', ZhaoPian: '证件照', Version: '版本'
}

export const FAMILY_LABELS: Record<string, string> = {
  ChengWei: '称谓', XingMing: '姓名', ChuShengRiQi: '出生日期',
  ZhengZhiMianMao: '政治面貌', GongZuoDanWeiJiZhiWu: '工作单位及职务'
}

/* ---- DocState ---- */
export interface DocState {
  id: string
  data: ArchivePerson
  filePath: string
  label: string
  isDirty: boolean
}

/* ---- Store ---- */
export interface ArchiveStore {
  docs: Record<string, DocState>
  activeId: string | null
  currentPage: number

  openDoc: (filePath: string, person: ArchivePerson) => void
  newDoc: (tempPath: string) => void
  switchTab: (id: string) => void
  closeTab: (id: string) => void

  setField: (key: keyof ArchivePerson, value: string) => void
  markClean: () => void
  setCurrentPage: (page: number) => void

  addFamilyMember: () => void
  removeFamilyMember: (index: number) => void
  updateFamilyMember: (index: number, field: keyof FamilyMember, value: string) => void

  activeDoc: () => DocState | undefined
  hasDirtyDocs: () => boolean
}

export const useArchiveStore = create<ArchiveStore>((set, get) => {
  // 初始新建一个文档，id=1（兼容已有 init）
  const initId = '1'
  const initDoc: DocState = {
    id: initId,
    data: blankPerson(),
    filePath: '',
    label: '新建档案.lrmx',
    isDirty: false
  }

  return {
    docs: { [initId]: initDoc },
    activeId: initId,
    currentPage: 1,

    openDoc: (filePath, person) => {
      const id = String(Date.now())
      const label = filePath.split(/[/\\]/).pop() || '档案.lrmx'
      // 家庭成员不足 10 行时补齐
      const items = person.JiaTingChengYuan.Item
      if (items.length < 10) {
        const pad = Array.from({ length: 10 - items.length }, () => ({ ...EMPTY_FAMILY_MEMBER }))
        person.JiaTingChengYuan = { Item: [...items, ...pad] }
      }
      set((state) => ({
        docs: {
          ...state.docs,
          [id]: { id, data: person, filePath, label, isDirty: false }
        },
        activeId: id,
        currentPage: 1
      }))
    },

    newDoc: (tempPath) => {
      const id = String(Date.now())
      const label = tempPath.split(/[/\\]/).pop() || '新建档案.lrmx'
      set((state) => ({
        docs: {
          ...state.docs,
          [id]: { id, data: blankPerson(), filePath: tempPath, label, isDirty: false }
        },
        activeId: id,
        currentPage: 1
      }))
    },

    switchTab: (id) => set({ activeId: id }),

    closeTab: (id) =>
      set((state) => {
        const keys = Object.keys(state.docs)
        if (keys.length <= 1) return state // 至少保留一个
        const next = { ...state.docs }
        delete next[id]
        let nextActiveId = state.activeId
        if (state.activeId === id) {
          const idx = keys.indexOf(id)
          const remaining = Object.keys(next)
          nextActiveId = remaining[Math.min(idx, remaining.length - 1)]
        }
        return { docs: next, activeId: nextActiveId }
      }),

    setField: (key, value) =>
      set((state) => {
        const doc = state.docs[state.activeId || '']
        if (!doc) return state
        return {
          docs: {
            ...state.docs,
            [doc.id]: { ...doc, data: { ...doc.data, [key]: value }, isDirty: true }
          }
        }
      }),

    markClean: () =>
      set((state) => {
        const doc = state.docs[state.activeId || '']
        if (!doc) return state
        return {
          docs: {
            ...state.docs,
            [doc.id]: { ...doc, isDirty: false }
          }
        }
      }),

    setCurrentPage: (page) => set({ currentPage: page }),

    addFamilyMember: () =>
      set((state) => {
        const doc = state.docs[state.activeId || '']
        if (!doc) return state
        return {
          docs: {
            ...state.docs,
            [doc.id]: {
              ...doc,
              data: {
                ...doc.data,
                JiaTingChengYuan: {
                  Item: [...doc.data.JiaTingChengYuan.Item, { ...EMPTY_FAMILY_MEMBER }]
                }
              },
              isDirty: true
            }
          }
        }
      }),

    removeFamilyMember: (index) =>
      set((state) => {
        const doc = state.docs[state.activeId || '']
        if (!doc) return state
        const items = [...doc.data.JiaTingChengYuan.Item]
        items.splice(index, 1)
        return {
          docs: {
            ...state.docs,
            [doc.id]: { ...doc, data: { ...doc.data, JiaTingChengYuan: { Item: items } }, isDirty: true }
          }
        }
      }),

    updateFamilyMember: (index, field, value) =>
      set((state) => {
        const doc = state.docs[state.activeId || '']
        if (!doc) return state
        const items = doc.data.JiaTingChengYuan.Item.map((m, i) =>
          i === index ? { ...m, [field]: value } : m
        )
        return {
          docs: {
            ...state.docs,
            [doc.id]: { ...doc, data: { ...doc.data, JiaTingChengYuan: { Item: items } }, isDirty: true }
          }
        }
      }),

    activeDoc: () => {
      const state = get()
      return state.activeId ? state.docs[state.activeId] : undefined
    },
    hasDirtyDocs: () => Object.values(get().docs).some((d) => d.isDirty)
  }
})
