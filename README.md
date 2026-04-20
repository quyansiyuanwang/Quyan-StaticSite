# Study Arcade (staticSite)

前端-only 双分区平台：英语学习专区 + 小游戏专区，适合继续扩展学习与娱乐模块。

## 技术栈

- Vue 3 + TypeScript + Vite
- Pinia（本地学习进度状态）
- Vue Router（模块路由）
- Vue I18n（中英双语）
- Vitest（单测）
- ESLint + Prettier（代码质量）

## 已实现模块

- 主页仪表盘：两大分区入口与关键数据概览
- 英语学习专区
  - 英语单词背诵：词卡学习、掌握状态、连续学习天数
  - 考试模式：随机题库、即时评分、答案解析
- 小游戏专区（独立于英语学习流程）
  - 反应速度挑战
  - 数字猜谜
  - 记忆配对（保留的可选游戏）

## 词库与题库架构（可扩展到上万条）

- 按分类拆分：`CET-4`、`CET-6` 等
- 按内容格式拆分：
  - 词汇练习（选择题）
  - 单词记忆（词条/音标/词性）
  - 单词拆解（词根词缀+记忆法）
- 目录示例：

```text
src/data/wordbank/
  categories.ts
  cet4/
    memory.ts
    practice.ts
    decomposition.ts
  cet6/
    memory.ts
    practice.ts
    decomposition.ts
  index.ts
```

- 页面通过统一聚合接口读取数据，不再依赖单一大文件。

### 文本批量导入

可用导入脚本把原始文本快速转换成分类文件：

```bash
pnpm run wordbank:import -- --input <source.txt> --category <cet4|cet6|...> --type <memory|practice|decomposition>
```

示例：

```bash
pnpm run wordbank:import -- --input imports/cet4-memory.txt --category cet4 --type memory
pnpm run wordbank:import -- --input imports/cet4-practice.txt --category cet4 --type practice
pnpm run wordbank:import -- --input imports/cet4-decomposition.txt --category cet4 --type decomposition
```

- `memory` 适配行格式：`abandon/ ə’bændən/ vt.丢弃;放弃，抛弃`
- `practice` 适配题干 + `A) B) C) D)` 选项格式
- `decomposition` 适配：`rupture [含义]` + `【记】...`

### 网页抓词（交互式）

你可以用交互脚本按回车抓取网页词汇，并自动把 URL 中最后一个数字递增：

```bash
pnpm run wordbank:scrape -- --output imports/cet4-memory.txt --start-url https://cet46.wendu.com/2021/1223/56978.shtml
```

运行后：

- 直接回车：抓取当前 URL，然后自动 +1 到下一条
- 输入新 URL 后回车：重置递增序列
- 输入 `q`：退出

默认会自动去重并追加写入目标 txt。

## 项目命令

```bash
pnpm install
pnpm run dev
pnpm run check:all
pnpm run build
```

## CI/CD 工作流程

### 分支策略

- **master**: 生产部署分支（自动部署到生产环境）
- **dev**: 开发/测试分支（自动部署到开发环境）

### 自动化流程

#### 1. 开发流程（dev 分支）

```bash
# 在 dev 分支开发
git checkout dev
git add .
git commit -m "feat: add new feature"
git push origin dev
```

推送到 dev 分支后：
1. ✅ 自动创建/更新 dev → master 的 Draft PR（`auto-pr.yml`）
2. ✅ 自动部署到开发环境（`deploy.yml`）
3. ✅ PR 触发代码质量检查（`quality-check.yml`）

#### 2. 生产部署流程（master 分支）

```bash
# 审查并合并 PR
# 在 GitHub 上将 Draft PR 标记为 Ready for review
# 代码审查通过后合并到 master
```

合并到 master 后：
1. ✅ 自动构建生产版本（`pnpm run build:prod`）
2. ✅ 自动部署到生产环境（`deploy.yml`）

### GitHub Actions Workflows

#### `.github/workflows/deploy.yml`
- **触发条件**: push 到 master 或 dev 分支
- **功能**:
  - master: 构建生产版本并部署到 `$REMOTE_STATICSITE_PATH`
  - dev: 构建开发版本并部署到 `$REMOTE_STATICSITE_DEV_PATH`
- **跳过部署**: commit message 包含 `[skip cd]` 或 `[skip cicd]`

#### `.github/workflows/quality-check.yml`
- **触发条件**: PR 到 master 或 dev 分支
- **检查项**:
  - ESLint 代码检查
  - Prettier 格式检查
  - TypeScript 类型检查
- **跳过检查**: PR title 包含 `[skip ci]` 或 `[skip cicd]`

#### `.github/workflows/auto-pr.yml`
- **触发条件**: push 到 dev 分支
- **功能**:
  - 自动创建 dev → master 的 Draft PR
  - 使用 AI 生成 PR 标题（基于 commit messages）
  - 自动更新 PR body（包含 commit 列表）
- **跳过创建**: commit message 包含 `[skip ci]`、`[skip cd]` 或 `[skip cicd]`

### 所需 GitHub Secrets

在 GitHub 仓库设置中配置以下 secrets：

```
SSH_PRIVATE_KEY          # SSH 私钥
SSH_HOST                 # 服务器地址
SSH_PORT                 # SSH 端口（默认 22）
SSH_USER                 # SSH 用户名
REMOTE_STATICSITE_PATH   # 生产环境部署路径
REMOTE_STATICSITE_DEV_PATH # 开发环境部署路径

# 可选：AI PR 标题生成
OPENAI_API_KEY          # OpenAI API Key
OPENAI_BASE_URL         # OpenAI API Base URL
OPENAI_MODEL            # OpenAI Model（如 gpt-4）
```

### 快速命令

```bash
# 跳过 CI/CD
git commit -m "docs: update readme [skip cicd]"

# 跳过部署但运行质量检查
git commit -m "feat: add feature [skip cd]"

# 跳过质量检查但部署
git commit -m "fix: hotfix [skip ci]"
```

## 目录说明

```text
staticSite/
  src/
    data/              # 词库与题库
    locales/           # 国际化文案
    router/            # 路由
    stores/            # 学习/游戏进度状态（localStorage 持久化）
    views/             # 页面模块
    utils/             # 工具函数
  tests/               # 单元测试
  scripts/             # 构建辅助脚本
```

## 扩展建议

- 增加更多词库（按 CET4/CET6/IELTS 分类）
- 增加错题本与专项训练
- 加入听力、拼写、填空等英语功能
- 扩展更多独立小游戏（2048、扫雷、节奏点击等）
- 接入本地导入题库（JSON/CSV）
