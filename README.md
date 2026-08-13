# RMeditor

一个离线的《干部任免审批表》档案编辑器。把纸质表格搬进电脑：填表、改表、存档、一键导出 Word，解决手写难题。

## 它解决什么问题

干部档案是 XML 格式的（`.lrmx`），Word 打印要的是标准任免表样式。这两者平时是脱节的——要么手填 Word 模板，要么数据存了却导不出正规表格。RMeditor 把这条链打通：

```
编辑档案（.lrmx）──→ 另存为 Word（.docx 任免表模板）
```

数据在编辑器里改，导出时按模板现算现填，不需要任何手动搬运。

## 功能

- **多标签编辑**：一次打开多个档案，页签切换，未保存的修改有标记和关闭确认
- **完整表单**：姓名到填表人，34 个字段全覆盖，分两页排版，接近纸质版式
- **证件照**：上传后自动净化（去 EXIF、裁剪 4:5、防透明黑底），上传错了可以删掉重传
- **家庭成员**：固定 10 行，可增删改
- **导出 Word**：家庭成员的**年龄是导出时按出生日期现算的**，档案文件里从来不存年龄————免去手动计算的纰漏。
- **填表时间自动带出**：新建档案自动写入当天日期，旧档案打开时一个字节都不动
- **安全底线**：XML 防 XXE、字段标签白名单、保存原子写（写一半断电也不损坏档案）

## 数据格式

`.lrmx` 本质是 XML，根节点 `<Person>`，34 个汉语拼音字段。一个示例：

```xml
<Person>
  <XingMing>小明</XingMing>
  <XingBie>男</XingBie>
  <ChuShengNianYue>2004.10.24</ChuShengNianYue>
  <JiSuanNianLingShiJian>2026.08</JiSuanNianLingShiJian>
  ...
</Person>
```

三层设计：编辑器里的数据 ← → 磁盘上的 `.lrmx` ← → 导出时的 `.docx`。每一层级各司其职，互不污染。

## 安装

- **Windows**：运行 `RMeditor-1.0.0-setup.exe`
- **Linux**：`dpkg -i RMeditor-1.0.0.deb`，或直接运行 `RMeditor-1.0.0.AppImage`
- **macOS**：暂不提供（信创要求）

## 开发

```bash
npm install        # 安装依赖
npm run dev        # 启动开发环境
npm run typecheck  # 类型检查
npm run lint       # 代码检查
npm run build      # 构建到 out/
```

### 打包

```bash
npx electron-builder --linux   # .deb + .AppImage
npx electron-builder --win     # NSIS .exe（Linux 上交叉编译）
```

首次打包需要联网下载打包工具链；国内网络建议加镜像：

```bash
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ \
ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/ \
npx electron-builder --linux
```

## 技术栈

Electron + React 19 + TypeScript + Tailwind 4，docxtemplater 渲染 Word 模板，fast-xml-parser 读写 XML，Zustand 管理多文档状态。

## 目录

```
src/main/       主进程：窗口、IPC、XML 读写、DOCX 导出
src/preload/    桥接层（contextBridge）
src/renderer/   界面：表单页、布局、store、校验、照片净化
templates/      Word 打印模板（output.docx）和字段映射说明
scripts/        辅助脚本
```

## 说在后面

- 计算年龄时间、填表时间：新建档案时默认当天，不手动改也不会错
- 批量创建、批量修改（Excel 导入建档、跨档案统一改字段）在计划中
- 数据文件想备份就复制 `.lrmx`，一个文件一个人，不涉及远程操作 只有xml的电子档案 无安全问题。
- 本项目仅为编辑器，本质是一个打包的浏览器 不和敏感数据直接接触 传递的也只是字段可控无注入的lrmx文件，可安全审计
